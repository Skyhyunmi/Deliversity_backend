import passport from "passport";
import passportLocal from "passport-local";
import passportJwt from "passport-jwt";
import * as google from "passport-google-oauth20";
import * as kakao from "passport-kakao";
import {userRep,veriRep} from "../models/index";
import * as crypto from "crypto";
import dotenv from "dotenv";
import axios from "axios";
dotenv.config();
const GoogleStrategy = google.Strategy;
const KakaoStrategy = kakao.Strategy;
const LocalStrategy = passportLocal.Strategy;
const JwtStrategy = passportJwt.Strategy;
const ExtractJwt = passportJwt.ExtractJwt;


async function certify(phone:string){
  let ret=0;
  try{
    await veriRep.findOne({where:{phone:phone}})
    .then((veri)=>{
      if(veri){
        if(veri.verified==true){
          const now = Number.parseInt(Date.now().toString());
          const created = Date.parse(veri.createdAt);
          const remainingTime = (now-created)/60000;
          if(remainingTime>30){ //30분
            veri.destroy();
          }
          else ret=1;
        }
      }
    });
  }
  catch(e){
    console.error(e);
  }
  return ret;
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
    function (req, id, password, done) {
      try {
        userRep.findOne({
          where: {
            userId: id
          }
        }).then(function (user) {
          const data = req.body;
          if (user) {
            return done(null, false, { message: 'User already exist.' });
          }
          userRep.findOne({
            where: {
              email: data.email
            }
          }).then(async function (user) {
            if (user) {
              return done(null, false, { message: 'E-mail duplicated.' });
            }
            const buffer = crypto.randomBytes(64);
            const salt = buffer.toString('base64');
            const key = crypto.pbkdf2Sync(password, salt, 100000, 64, 'sha512');
            const hashedPw = key.toString('base64');
            const certified=await certify(data.phone);
            if(certified==0) return done(null, false, { message: 'SMS Verification is required.' });
            userRep.create({
              userId: id,
              name: data.name,
              email: data.email,
              salt: salt,
              nickName: data.nickName,
              gender: data.gender,
              age: Number.parseInt(data.age),
              phone: data.phone,
              admin: data.is_admin,
              password: hashedPw,
              createdAt: new Date(),
              updatedAt: null,
              certified: certified,
              googleOAuth:data.googleOAuth?data.googleOAuth:null,
              kakaoOAuth:data.kakaoOAuth?data.kakaoOAuth:null,
            }).then(function (result) {
              done(null, result);
            }).catch(function (err) {
              done(err);
            });
          });
        });
      } catch (err) {
        done(err);
      }
    }
    )
  );

  passport.use(
    'login',
    new LocalStrategy({
      usernameField: 'id',
      passwordField: 'pw',
      session: false
    },
    function (id, password, done) {
      try {
        userRep.findOne({
          where: {
            userId: id
          }
        }).then(function (user) {
          if (user) {
            crypto.pbkdf2(password, user.salt, 100000, 64, 'sha512', function (err:any, key:any) {
              if (err) {
                done(null, false, { message: 'error' });
              }
              if (user.password === key.toString('base64')) {
                return done(null, user);
              } else {
                return done(null, false, { message: 'Password do not match.' });
              }
            });
          } else {
            return done(null, false, { message: 'ID do not match' });
          }
        });
      } catch (err) {
        done(err);
      }
    }
    )
  );

  passport.serializeUser(function(user, done) {
    done(null, user);
  });
  
  passport.deserializeUser(function(obj, done) {
    done(null, obj);
  });

  passport.use(
    new GoogleStrategy({
      clientID:process.env.GOOGLE_KEY as string,
      clientSecret:process.env.GOOGLE_SECRET as string,
      callbackURL:"/api/v1/auth/google/callback"
    },
    async function(accessToken,refreshToken,profile,done){
      const token = await axios({
        url: "https://www.googleapis.com/oauth2/v1/tokeninfo?access_token="+accessToken,
        method: "get"
      });
      // if(token) console.log(token);
      // console.log(profile);
      userRep.findOne({
        where:{
          googleOAuth:profile.id
        }
      }).then((user)=>{
        if(user){
          done("",user);
        }
        else done("", false, {message: '일치하는 회원 없음.', auth:profile.id});
      });
    })
  );

  passport.use(
    new KakaoStrategy({
      clientID:process.env.KAKAO_KEY as string,
      clientSecret:process.env.KAKAO_SECRET as string,
      callbackURL:"/api/v1/auth/kakao/callback"
    },
    async function(accessToken,refreshToken,profile,done){
      console.log(profile);
      // const token = await axios({
      //   url: "https://www.googleapis.com/oauth2/v1/tokeninfo?access_token="+accessToken,
      //   method: "get"
      // });
      // if(token) console.log(token);
      // console.log(profile);
      userRep.findOne({
        where:{
          kakaoOAuth:profile.id
        }
      }).then((user)=>{
        if(user){
          done("",user);
        }
        else done("", false, {message: '일치하는 회원 없음.', auth:profile.id});
      });
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