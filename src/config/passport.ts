import passport from "passport";
import passportLocal from "passport-local";
import passportJwt from "passport-jwt";
import {db} from "../models/index";
import User from "../models/user";
import * as crypto from "crypto";

import dotenv from "dotenv";
dotenv.config();

const LocalStrategy = passportLocal.Strategy;
const JwtStrategy = passportJwt.Strategy;
const ExtractJwt = passportJwt.ExtractJwt;
const userRep  = db.getRepository(User);

interface UserHash extends User {
    hashed_password:string;
    salt:string;
}

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
          }).then(function (user) {
            if (user) {
              return done(null, false, { message: 'E-mail duplicated.' });
            }
            const buffer = crypto.randomBytes(64);
            const salt = buffer.toString('base64');
            const key = crypto.pbkdf2Sync(password, salt, 100000, 64, 'sha512');
            const hashedPw = key.toString('base64');
            userRep.create({
              userId: id,
              name: data.name,
              email: data.email,
              salt: salt,
              admin: data.is_admin,
              hashed_password: hashedPw,
              createdAt: new Date(),
              updatedAt: null
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
        }).then(function (userhhash) {
          const user:UserHash = userhhash as UserHash;
          if (user) {
            crypto.pbkdf2(password, user.salt, 100000, 64, 'sha512', function (err:any, key:any) {
              if (err) {
                done(null, false, { message: 'error' });
              }
              if (user.hashed_password === key.toString('base64')) {
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