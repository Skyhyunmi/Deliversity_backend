import passport from "passport";
import passportLocal from "passport-local";
import passportJwt from "passport-jwt";
import {db} from "../models/index";
import User from "../models/user";
import Veri from "../models/verification";
import * as crypto from "crypto";

import dotenv from "dotenv";
dotenv.config();

const LocalStrategy = passportLocal.Strategy;
const JwtStrategy = passportJwt.Strategy;
const ExtractJwt = passportJwt.ExtractJwt;
const userRep  = db.getRepository(User);
const veriRep  = db.getRepository(Veri);


async function certify(phone:string){
  var ret=0;
  try{
    await veriRep.findOne({where:{phone:phone}})
    .then((veri)=>{
      // console.log(veri);
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
    })
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
            var certified=await certify(data.phone);
            // await veriRep.findOne({where:{
            //   phone:data.phone
            // }}).then((veri)=>{
            //   if(veri){
            //     if(veri.verified) {
            //       try{
            //         veri.destroy();
            //         certified=1;
            //       }
            //       catch (e){
            //         console.error(e);
            //       }
            //     }
            //   }
            // })
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
              certified: certified
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