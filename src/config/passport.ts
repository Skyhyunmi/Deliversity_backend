import passport from 'passport';
import passportLocal from 'passport-local';
import passportJwt from 'passport-jwt';
import * as crypto from 'crypto';
import axios from 'axios';
import dotenv from 'dotenv';
import * as admin from 'firebase-admin';
import { myCache } from '../config/functions';
import { userRep } from '../models/index';
import * as functions from './functions';
import * as classes from './classes';

dotenv.config();

const LocalStrategy = passportLocal.Strategy;
const JwtStrategy = passportJwt.Strategy;
const { ExtractJwt } = passportJwt;


async function phoneVerify(phone: string) {
  try {
    const veri = myCache.take(phone) as classes.Veri;
    if (!veri || veri.verify !== 1) return 0;
    const now = Number.parseInt(Date.now().toString(), 10);
    const updatedAt = veri.updatedAt as number;
    const remainingTime = (now - updatedAt) / 60000;
    if (remainingTime > 15) { // 15분
      myCache.del(phone);
      return 0;
    }
    
    myCache.del(phone);
    return 1;
  } catch (e) {
    return 0;
  }
};

async function emailVerify(email: string) {
  try {
    const veri = myCache.take(email) as classes.Veri;
    if (!veri || veri.verify !== 1) return 0;
    const now = Number.parseInt(Date.now().toString(), 10);
    const updatedAt = veri.updatedAt as number;
    const remainingTime = (now - updatedAt) / 60000;
    if (remainingTime > 15) { // 15분
      myCache.del(email);
      return 0;
    }
    
    myCache.del(email);
    return 1;
  } catch (e) {
    return 0;
  }
};

export function passportConfig() {
  passport.use(
    'signup',
    new LocalStrategy({
      usernameField: 'id',
      passwordField: 'pw',
      session: false,
      passReqToCallback: true,
    },
    (async (req, userId, password, done) => {
      try {
        const reqBody = req.body;
        const userExist = await userRep.findOne({
          where: {
            userId,
          },
        });
        if (userExist) return done(null, false, { message: 'User already exist.' });
        const emailExist = await userRep.findOne({
          where: {
            email: reqBody.email,
          },
        });
        if (emailExist) return done(null, false, { message: 'E-mail duplicated.' });
        const phoneExist = await userRep.findOne({
          where: {
            phone: reqBody.phone,
          },
        });
        if (phoneExist) return done(null, false, { message: 'phone number duplicated.' });
        const nickExist = await userRep.findOne({
          where: {
            nickName: reqBody.nickName,
          },
        });
        if (nickExist) return done(null, false, { message: 'nickName duplicated.' });
        const buffer = crypto.randomBytes(64);
        const salt = buffer.toString('base64');
        const key = crypto.pbkdf2Sync(password, salt, 100000, 64, 'sha512');
        const hashedPw = key.toString('base64');
        const phoneVeri = await phoneVerify(reqBody.phone);
        if (phoneVeri === 0) return done(null, false, { message: 'SMS Verification is required.' });
        const emailVeri = await emailVerify(reqBody.email);
        if (emailVeri === 0) return done(null, false, { message: 'E-mail Verification is required.' });
        const { idToken } = req.body;
        let googleToken: string | null = null;
        if (idToken) {
          const ret = await functions.getUserFromGoogleInfo(idToken);
          if (ret) googleToken = ret.id;
        }
        const { accessToken } = req.body;
        let kakaoToken: string | null = null;
        if (accessToken) {
          const ret = await functions.getUserFromKakaoInfo(accessToken);
          if (ret) kakaoToken = ret.id;
        }
        let fbUser;
        try {
          fbUser = await admin.auth().getUserByEmail(reqBody.email);
        } catch (err) {
          fbUser = await admin.auth().createUser({
            email: reqBody.email,
            emailVerified: true,
            phoneNumber: `+82${reqBody.phone.slice(1)}`,
            password: hashedPw,
          });
        }
        if (fbUser) {
          const user = await userRep.create({
            userId,
            password: hashedPw,
            salt,
            name: reqBody.name,
            gender: reqBody.gender,
            nickName: reqBody.nickName,
            age: Number.parseInt(reqBody.age, 10),
            email: reqBody.email,
            phone: reqBody.phone,
            createdAt: new Date(),
            updatedAt: null,
            googleOAuth: googleToken || null,
            kakaoOAuth: kakaoToken || null,
            firebaseUid: fbUser.uid,
          });
          return done(null, user);
        }
        return done(null, 'firebase 에러');
      } catch (err) {
        return done(err);
      };
    })),
  );

  passport.use(
    'login',
    new LocalStrategy({
      usernameField: 'id',
      passwordField: 'pw',
      session: false,
      passReqToCallback: true,
    },
    (async (req, id, password, done) => {
      try {
        const user = await userRep.findOne({
          where: {
            userId: id,
          },
        });
        if (!user) return done(null, false, { message: 'ID do not match' });
        await user.update({ firebaseFCM: req.body.fcmToken });
        if (user.googleOAuth == null && req.body.idToken) {
          const { idToken } = req.body;
          // 토큰 검증
          const ret = await axios({
            url: 'https://www.googleapis.com/oauth2/v3/tokeninfo',
            method: 'GET',
            params: {
              id_token: idToken,
            },
          });
          await user.update({
            googleOAuth: ret.data.sub,
          });
        }
        const key = crypto.pbkdf2Sync(password, user.salt, 100000, 64, 'sha512');
        if (user.password === key.toString('base64')) return done(null, user);
        return done(null, false, { message: 'Password do not match.' });
      } catch (err) {
        return done(err);
      }
    })),
  );

  passport.use(
    'silent_login',
    new LocalStrategy({
      session: false,
      usernameField: 'id',
      passwordField: 'id',
      passReqToCallback: true,
    },
    (async (req, id, pw, done) => {
      try {
        const user = await userRep.findOne({ where: { id: req.decoded.id } });
        if (!user) return done(null, false, { message: "Can't login" });
        return done(null, user);
      } catch (err) {
        return done(err);
      }
    })),
  );

  passport.use(new JwtStrategy(
    {
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: process.env.JWT_SECRET,
    },
    (async (jwtToken, done) => {
      const user = await userRep.findOne({ where: { userId: jwtToken.userId } });
      if (!user) return done(undefined, false);
      return done(undefined, user, jwtToken);
    }),
  ));
};