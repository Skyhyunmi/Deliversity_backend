import passport from "passport";
import passportLocal from "passport-local";
import passportJwt from "passport-jwt";
import {userRep,veriRep,emailVeriRep} from "../models/index";
import * as crypto from "crypto";
import axios from "axios";

import dotenv from "dotenv";
dotenv.config();

const LocalStrategy = passportLocal.Strategy;
const JwtStrategy = passportJwt.Strategy;
const ExtractJwt = passportJwt.ExtractJwt;


async function phoneVerify(phone:string){
  try{
    const veri = await veriRep.findOne({where:{phone:phone}});
    if(!veri || !veri.verified) return 0;
    const now = Number.parseInt(Date.now().toString());
    const created = Date.parse(veri.createdAt);
    const remainingTime = (now-created)/60000;
    if(remainingTime>5){ //30분
      veri.destroy();
      return 0;
    }
    else {
      veri.destroy();
      return 1;
    }
  }
  catch(e){
    return 0;
  }
};

async function emailVerify(email:string){
  try{
    const veri = await emailVeriRep.findOne({where:{email:email}});
    if(!veri || !veri.email_verified) return 0;
    const now = Number.parseInt(Date.now().toString());
    const created = Date.parse(veri.createdAt);
    const remainingTime = (now-created)/60000;
    if(remainingTime>5){ //30분
      veri.destroy();
      return 0;
    }
    else {
      veri.destroy();
      return 1;
    }
  }
  catch(e){
    return 0;
  }
};

export function passportConfig(){
  passport.use(
    'signup',
    new LocalStrategy({
      usernameField: 'id',
      passwordField: 'pw',
      session: false,
      passReqToCallback: true
    },
    async function (req, userId, password, done) {
      try {
        const reqBody = req.body;
        const userExist = await userRep.findOne({
          where: {
            userId: userId
          }
        });
        if(userExist) return done(null, false, { message: 'User already exist.' });
        const emailExist = await userRep.findOne({
          where: {
            email: reqBody.email
          }
        });
        if (emailExist) return done(null, false, { message: 'E-mail duplicated.' });
        const phoneExist = await userRep.findOne({
          where: {
            phone: reqBody.phone
          }
        });
        if(phoneExist) return done(null, false, { message: 'phone number duplicated.' });
        const nickExist = await userRep.findOne({
          where: {
            nickName: reqBody.nickName
          }
        });
        if(nickExist) return done(null, false, { message: 'nickName duplicated.' });
        const buffer = crypto.randomBytes(64);
        const salt = buffer.toString('base64');
        const key = crypto.pbkdf2Sync(password, salt, 100000, 64, 'sha512');
        const hashedPw = key.toString('base64');
        const phoneVeri=await phoneVerify(reqBody.phone);
        if(phoneVeri==0) return done(null, false, { message: 'SMS Verification is required.' });
        const emailVeri=await emailVerify(reqBody.email);
        if(emailVeri==0) return done(null, false, { message: 'E-mail Verification is required.' });
        const user = await userRep.create({
          userId: userId,
          password: hashedPw,
          salt: salt,
          name: reqBody.name,
          nickName: reqBody.nickName,
          gender: reqBody.gender,
          age: Number.parseInt(reqBody.age),
          email: reqBody.email,
          phone: reqBody.phone,
          createdAt: new Date(),
          updatedAt: null,
          googleOAuth:reqBody.googleOAuth || null,
          kakaoOAuth:reqBody.kakaoOAuth || null
        });
        done(null,user);
      }catch(err){
        done(err);
      };
    }
    ));

  passport.use(
    'login',
    new LocalStrategy({
      usernameField: 'id',
      passwordField: 'pw',
      session: false
    },
    async function (id, password, done) {
      try {
        const user = await userRep.findOne({
          where: {
            userId: id
          }
        });
        if (!user) return done(null, false, { message: 'ID do not match' });
        crypto.pbkdf2(password, user.salt, 100000, 64, 'sha512', function (err:Error | null, key:Buffer) {
          if (err) {
            done(null, false, { message: 'error' });
          }
          if (user.password === key.toString('base64')) {
            return done(null, user);
          } else {
            return done(null, false, { message: 'Password do not match.' });
          }
        });
      } catch (err) {
        done(err);
      }
    })
  );

  passport.use(new JwtStrategy(
    {
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: process.env.JWT_SECRET
    }, function (jwtToken, done) {
      userRep.findOne({where:{ userId: jwtToken.userId }}).then((user: any) =>{
        if (user) {
          return done(undefined, user , jwtToken);
        } else {
          return done(undefined, false);
        }
      });
    }));
};