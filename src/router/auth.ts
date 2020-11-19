import { NextFunction, Request, Response, Router } from "express";
import * as functions from "../config/functions";
import * as util from "../config/util";
import * as classes from "../config/classes";
import { userRep } from "../models/index";
import * as admin from "firebase-admin";
import User from "../models/user";
import jwt from "jsonwebtoken";
import passport from "passport";

import dotenv from "dotenv";
dotenv.config();

export const auth = Router();
auth.post("/signup", function (req: Request, res: Response, next: NextFunction) {
  passport.authenticate("signup", async function (err: any, _user: User, info: any) {
    if (err) {
      return res.status(403).json(util.successFalse(err, "", null));
    }
    if (info) {
      return res.status(403).json(util.successFalse(null, info, null));
    }
    if (_user) {
      const user = {
        id: _user.id,
        userId: _user.userId,
        name: _user.name,
        nickName: _user.nickName,
        age: _user.age,
        email: _user.email,
        phone: _user.phone,
        addressId: _user.addressId,
        grade: _user.grade,
        createdAt: _user.createdAt,
        updatedAt: _user.updatedAt
      };
      return res.json(util.successTrue("", user));
    }
  })(req, res, next);
});

auth.post("/login", async function (req: Request, res: Response, next: NextFunction) {
  passport.authenticate("login", { session: false }, function (err: any,
    user: any,
    info: any
  ) {
    if (info === {})
      return res.status(403).json(util.successFalse(null, "ID or PW is not valid", null));
    if (err || !user) {
      return res.status(403).json(util.successFalse(null, err, null));
    }
    req.logIn(user, { session: false }, async function (err: any) {
      if (err) return res.status(403).json(util.successFalse(err, "로그인을 실패했습니다.", null));
      const result = await functions.getAuthToken(user);
      return res.json(util.successTrue("", {firebaseToken:result.firebaseToken, token: result.authToken, grade: user.grade }));
    });
  })(req, res, next);
});

auth.post('/login/google', async function (req: Request, res: Response) {
  const reqBody=req.body;
  try{
    const idToken = reqBody.idToken;
    const user = await functions.getUserFromGoogleInfo(idToken);
    if (!user) return res.status(403).json(util.successFalse(null, "회원이 없습니다.", null));
    if (!user.user) return res.status(403).json(util.successFalse(null, "회원이 없습니다.", null));
    await user.user.update({firebaseFCM:req.body.fcmToken});
    const result = await functions.getAuthToken(user.user);
    return res.json(util.successTrue("", {firebaseToken: result.firebaseToken, token: result.authToken, grade: user.user.grade }));
  }catch (e) {
    console.log(e);
    return res.status(403).json(util.successFalse(null, "Retry.", null));
  }
});

auth.post('/login/kakao', async function (req: Request, res: Response) {
  const reqBody=req.body;
  try{
    const accessToken = reqBody.accessToken;
    const user = await functions.getUserFromKakaoInfo(accessToken);
    if (!user) return res.status(403).json(util.successFalse(null, "회원이 없습니다.", null));
    if (!user.user) return res.status(403).json(util.successFalse(null, "회원이 없습니다.", null));
    await user.user.update({firebaseFCM:req.body.fcmToken});
    const result = await functions.getAuthToken(user.user);
    return res.json(util.successTrue("", {firebaseToken:result.firebaseToken, token: result.authToken, grade: user.user.grade }));
  }catch (e) {
    console.log("Error at login/kakao");
    return res.status(403).json(util.successFalse(null, "Retry.", null));
  }
});

auth.get('/refresh', util.isLoggedin, async function (req: Request, res:Response) {
  const user = await userRep.findOne({ where: { userId: req.decoded.userId } });
  if (!user) {
    return res.status(403).json(util.successFalse(null, "Can't refresh the token", { user: user }));
  }
  const authToken=jwt.sign(Object.assign({},new classes.payLoad(user)), process.env.JWT_SECRET as jwt.Secret, {
    expiresIn: '7d',
  });
  return res.json(util.successTrue("", { token: authToken, grade: user.grade }));

});

auth.post("/sms",/*util.isLoggedin,*/async function (req: Request, res: Response) {
  const reqBody = req.body;
  const phone = reqBody.phone;
  const result = await functions.sendSMS(phone);
  if (result == null) return res.json(util.successTrue("문자 전송 성공", null));
  return res.status(403).json(util.successFalse(null, result, null));
});

auth.post("/sms/verification", async function (req: Request, res: Response) {
  const reqBody = req.body;
  const verify = reqBody.verify;
  const phone = reqBody.phone;
  const result = await functions.smsVerify(phone,verify);
  if(result==null) return res.json(util.successTrue("전화번호 인증 성공", null));
  else return res.status(403).json(util.successFalse(null,result,null));
});

auth.post("/email",/*util.isLoggedin,*/async function (req: Request, res: Response) {
  const reqBody = req.body;
  const email = reqBody.email;
  const result = await functions.sendEmail(email,req.get('host') as string);
  if(result == null) return res.json(util.successTrue('이메일 전송 성공', null));
  else return res.status(403).json(util.successFalse("",result,""));
});

auth.get('/email/verification', async (req:Request, res) => {
  const reqQuery = req.query;
  const email_number = reqQuery.email_number as string;
  const result = await functions.emailVerify(email_number);
  if(result == null)  return res.json(util.successTrue("이메일 인증 성공", null));
  else return res.status(403).json(util.successFalse(null,result,null));
});

auth.delete("/release", util.isLoggedin, async function (req: Request, res: Response) {
  const tokenData = req.decoded;
  const user = await userRep.findOne({where:{id: tokenData.id}});
  if (!user) return res.status(403).json(util.successFalse(null, "회원이 없습니다.", null));
  await admin.auth().deleteUser(user.firebaseUid);
  await user.destroy({force: true});
  return res.json(util.successTrue("사용자 삭제 완료", null));
});