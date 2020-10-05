import { NextFunction, Response, Router } from "express";
import * as util from "../config/util";
import jwt from "jsonwebtoken";
import passport from "passport";
// const db = require("../models/index");
import { db } from "../models/index";
import dotenv from "dotenv";
dotenv.config();

export const auth = Router();
auth.post("/signup", function (req: any, res: Response, next: NextFunction) {
  req.query = null;
  passport.authenticate("signup", function (
    err: any,
    user: any,
    info: { message: any }
  ) {
    if (err) {
      return res.status(403).json(util.successFalse(err, "", null));
    }
    if (info) {
      return res.status(403).json(util.successFalse(null, info.message, null));
    }
    if (user) {
      return res.json(user);
    }
  })(req, res, next);
});

auth.post("/login", function (req: any, res: Response, next: NextFunction) {
  req.query = null;
  passport.authenticate("login", { session: false }, function (
    err: any,
    user: any,
    info: { message: string }
  ) {
    if (info)
      return res.status(403).json(util.successFalse(null, info.message, null));
    if (err || !user) {
      return res
        .status(403)
        .json(util.successFalse(null, "ID or PW is not valid", user));
    }
    req.logIn(user, { session: false }, function (err: any) {
      if (err) return res.status(403).json(util.successFalse(err, "", null));
      const payload = {
        id: user.user_id,
        name: user.name,
        admin: user.admin,
        loggedAt: new Date(),
      };
      user.authToken = jwt.sign(payload, process.env.JWT_SECRET as jwt.Secret, {
        expiresIn: 60 * 90,
      });
      res.json({ token: user.authToken, admin: user.admin });
    });
  })(req, res, next);
});

auth.get("/refresh", util.isLoggedin, function (req: any, res: Response) {
  // db.User.findOne({ where: { user_id: req.decoded.id } }).then(function (
  //   user: any
  // ) {
  //   if (!user) {
  //     return res.status(400).json({
  //       message: "Can't refresh the token",
  //       user: user,
  //     });
  //   }
  //   const payload = {
  //     id: user.user_id,
  //     name: user.name,
  //     admin: user.admin,
  //     loggedAt: new Date(),
  //   };
  //   user.authToken = jwt.sign(payload, process.env.JWT_SECRET as jwt.Secret, {
  //     expiresIn: 60 * 90,
  //   });
  //   res.json({ token: user.authToken });
  // });
});
