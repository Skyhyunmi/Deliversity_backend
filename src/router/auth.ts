import { NextFunction, Response, Router } from "express";
import * as util from "../config/util";
import jwt from "jsonwebtoken";
import passport from "passport";
// const db = require("../models/index");
import { db } from "../models/index";
import User from "../models/user";
import dotenv from "dotenv";
import axios from "axios";
dotenv.config();

const userRep  = db.getRepository(User);

export const auth = Router();
auth.post("/signup", function (req: any, res: Response, next: NextFunction) {
  req.query = null;
  passport.authenticate("signup", function (
    err: any,
    user: any,
    info: { message: string }
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
        id: user.userId,
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

auth.post("/certifications", async (request, response) => {
  const { imp_uid } = request.body; // request의 body에서 imp_uid 추출
  try {
    // 인증 토큰 발급 받기
    const getToken = await axios({
      url: "https://api.iamport.kr/users/getToken",
      method: "post", // POST method
      headers: { "Content-Type": "application/json" }, // "Content-Type": "application/json"
      data: {
        imp_key: process.env.IMP_KEY, // REST API키
        imp_secret: process.env.IMP_SECRET // REST API Secret
      }
    });
    const { access_token } = getToken.data.response; // 인증 토큰
    
    // imp_uid로 인증 정보 조회
    const getCertifications = await axios({
      url: 'https://api.iamport.kr/certifications/'+imp_uid, // imp_uid 전달
      method: "get", // GET method
      headers: { "Authorization": access_token } // 인증 토큰 Authorization header에 추가
    });
    const certificationsInfo = getCertifications.data.response; // 조회한 인증 정보
    console.log(certificationsInfo);
  } catch(e) {
    console.error(e);
  }
});