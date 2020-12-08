import { NextFunction, Request, Response, Router } from "express";
import * as functions from "../config/functions";
import * as util from "../config/util";
import * as classes from "../config/classes";
import { userRep } from "../models/index";
import * as admin from "firebase-admin";
import User from "../models/user";
import jwt from "jsonwebtoken";
import passport from "passport";
import * as crypto from "crypto";
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
        gender: _user.gender,
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
    if (info)
      return res.status(403).json(util.successFalse(null, "ID or PW is not valid", null));
    if (err || !user) {
      return res.status(403).json(util.successFalse(null, err, null));
    }
    req.logIn(user, { session: false }, async function (err: any) {
      if (err) return res.status(403).json(util.successFalse(err, "로그인을 실패했습니다.", null));
      const result = await functions.getAuthToken(user);
      return res.json(util.successTrue("", { firebaseToken: result.firebaseToken, token: result.authToken, grade: user.grade }));
    });
  })(req, res, next);
});

auth.get("/login", util.isLoggedin, async function (req: Request, res: Response, next: NextFunction) {
  try {
    req.body.id = req.decoded.userId;
    passport.authenticate("silent_login", { session: false }, function (err: any, user: any, info: any) {
      if (info)
        return res.status(403).json(util.successFalse(null, "로그인을 실패했습니다.", null));
      if (err || !user) {
        return res.status(403).json(util.successFalse(null, err, null));
      }
      req.logIn(user, { session: false }, async function (err: any) {
        if (err) return res.status(403).json(util.successFalse(err, "로그인을 실패했습니다.", null));
        const result = await functions.getAuthToken(user);
        return res.json(util.successTrue("", { firebaseToken: result.firebaseToken, token: result.authToken, grade: user.grade }));
      });
    })(req, res, next);
  } catch (e) {
    console.log(e);
    return res.status(403).json(util.successFalse(null, "에러.", null));
  }
});

auth.post("/login/fcm", util.isLoggedin, async function (req: Request, res: Response) {
  const tokenData = req.decoded;
  const reqBody = req.body;
  try {
    const user = await userRep.findOne({ where: { id: tokenData.id } });
    if (!user) return res.status(403).json(util.successFalse(null, "회원이 없습니다.", null));
    await user.update({ firebaseFCM: reqBody.fcmToken });
    return res.json(util.successTrue("", null));
  } catch (e) {
    console.log(e);
    return res.status(403).json(util.successFalse(null, "에러.", null));
  }
});

auth.post('/login/google', async function (req: Request, res: Response) {
  const reqBody = req.body;
  try {
    const idToken = reqBody.idToken;
    const user = await functions.getUserFromGoogleInfo(idToken);
    if (!user) return res.status(403).json(util.successFalse(null, "회원이 없습니다.", null));
    if (!user.user) return res.status(403).json(util.successFalse(null, "회원이 없습니다.", null));
    await user.user.update({ firebaseFCM: req.body.fcmToken });
    const result = await functions.getAuthToken(user.user);
    return res.json(util.successTrue("", { firebaseToken: result.firebaseToken, token: result.authToken, grade: user.user.grade }));
  } catch (e) {
    console.log(e);
    return res.status(403).json(util.successFalse(null, "Retry.", null));
  }
});

auth.post('/login/kakao', async function (req: Request, res: Response) {
  const reqBody = req.body;
  try {
    const accessToken = reqBody.accessToken;
    const user = await functions.getUserFromKakaoInfo(accessToken);
    if (!user) return res.status(403).json(util.successFalse(null, "회원이 없습니다.", null));
    if (!user.user) return res.status(403).json(util.successFalse(null, "회원이 없습니다.", null));
    await user.user.update({ firebaseFCM: req.body.fcmToken });
    const result = await functions.getAuthToken(user.user);
    return res.json(util.successTrue("", { firebaseToken: result.firebaseToken, token: result.authToken, grade: user.user.grade }));
  } catch (e) {
    console.log("Error at login/kakao");
    return res.status(403).json(util.successFalse(null, "Retry.", null));
  }
});

auth.get('/refresh', util.isLoggedin, async function (req: Request, res: Response) {
  const user = await userRep.findOne({ where: { userId: req.decoded.userId } });
  if (!user) {
    return res.status(403).json(util.successFalse(null, "Can't refresh the token", { user: user }));
  }
  const authToken = jwt.sign(Object.assign({}, new classes.payLoad(user)), process.env.JWT_SECRET as jwt.Secret, {
    expiresIn: '7d',
  });
  return res.json(util.successTrue("", { token: authToken, grade: user.grade }));

});

auth.post("/sms",/*util.isLoggedin,*/async function (req: Request, res: Response) {
  const reqBody = req.body;
  const phone = reqBody.phone;
  const result = await functions.sendSMS(phone, 0);
  if (result == null) return res.json(util.successTrue("문자 전송 성공", null));
  return res.status(403).json(util.successFalse(null, result, null));
});

auth.post("/sms/verification", async function (req: Request, res: Response) {
  const reqBody = req.body;
  const verify = reqBody.verify;
  const phone = reqBody.phone;
  const result = await functions.smsVerify(phone, verify);
  if (result == null) return res.json(util.successTrue("전화번호 인증 성공", null));
  else return res.status(403).json(util.successFalse(null, result, null));
});

auth.post("/email",/*util.isLoggedin,*/async function (req: Request, res: Response) {
  const reqBody = req.body;
  const email = reqBody.email;
  const result = await functions.sendEmail(email, req.get('host') as string, 0);
  if (result == null) return res.json(util.successTrue('이메일 전송 성공', null));
  else return res.status(403).json(util.successFalse("", result, ""));
});

auth.get('/email/verification', async (req: Request, res) => {
  const reqQuery = req.query;
  const email_number = reqQuery.email_number as string;
  const result = await functions.emailVerify(email_number);
  if (result == null) return res.json(util.successTrue("이메일 인증 성공", null));
  else return res.status(403).json(util.successFalse(null, result, null));
});

auth.delete("/release", util.isLoggedin, async function (req: Request, res: Response) {
  const tokenData = req.decoded;
  const user = await userRep.findOne({ where: { id: tokenData.id } });
  if (!user) return res.status(403).json(util.successFalse(null, "회원이 없습니다.", null));
  await admin.auth().deleteUser(user.firebaseUid);
  await user.destroy({ force: true });
  return res.json(util.successTrue("사용자 삭제 완료", null));
});

auth.post("/find/email",/*util.isLoggedin,*/async function (req: Request, res: Response) {
  const reqBody = req.body;
  const email = reqBody.email;
  const result = await functions.sendEmail(email, req.get('host') as string, 1);
  if (result == null) return res.json(util.successTrue('이메일 전송 성공', null));
  else return res.status(403).json(util.successFalse("", result, ""));
});

auth.post("/find/sms",/*util.isLoggedin,*/async function (req: Request, res: Response) {
  const reqBody = req.body;
  const phone = reqBody.phone;
  const result = await functions.sendSMS(phone, 1);
  if (result == null) return res.json(util.successTrue("문자 전송 성공", null));
  return res.status(403).json(util.successFalse(null, result, null));
});

auth.post("/findid", async function (req: Request, res: Response) {
  const reqBody = req.body;
  const reqQuery = req.query;
  // 인증 절차 거치고 success로 return
  const success = parseInt(reqBody.success);
  if (!success) return res.status(403).json(util.successFalse(null, "인증에 실패하였습니다.", null));
  // 이메일로 찾기
  if (reqQuery.status === "1") {
    if (!reqBody.email) return res.status(403).json(util.successFalse(null, "이메일을 입력해주세요.", null));
    const user = await userRep.findOne({ where: { email: reqBody.email }, attributes: ['userId'] });
    if (!user) return res.status(403).json(util.successFalse(null, "해당 이메일로 가입한 유저가 없습니다", null));
    return res.json(util.successTrue("사용자 아이디입니다.", user));
  }
  // 폰 인증으로 찾기
  else if (reqQuery.status === "2") {
    if (!reqBody.phone) return res.status(403).json(util.successFalse(null, "번호를 입력해주세요.", null));
    const user = await userRep.findOne({ where: { phone: reqBody.phone }, attributes: ['userId'] });
    if (!user) return res.status(403).json(util.successFalse(null, "해당 번호로 가입한 유저가 없습니다.", null));
    return res.json(util.successTrue("사용자 아이디입니다.", user));
  }
  return res.status(403).json(util.successFalse(null, "입력을 확인해주세요.", null));
});

auth.post("/findpw", async function (req: Request, res: Response) {
  const reqBody = req.body;
  // 인증 절차 거치고 success로 return
  const userId = reqBody.userId;
  let randomString = "";
  const chars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXTZabcdefghiklmnopqrstuvwxyz";
  const string_length = 8;
  for (let i = 0; i < string_length; i++) {
    const rnum = Math.floor(Math.random() * chars.length);
    randomString += chars.substring(rnum, rnum + 1);
  }
  let salt = null, hashedPw = null;
  const buffer = crypto.randomBytes(64);
  salt = buffer.toString('base64');
  const key = crypto.pbkdf2Sync(randomString, salt, 100000, 64, 'sha512');
  hashedPw = key.toString('base64');
  const user = await userRep.findOne({ where: { userId: userId } });
  if (!user) return res.status(403).json(util.successFalse(null, "해당 아이디의 유저가 존재하지 않습니다.", null));
  const result = await functions.pwEmail(user.email, randomString);
  await user.update({ password: hashedPw, salt: salt });
  if (result == null) return res.json(util.successTrue('임시 비밀번호가 전송되었습니다. 이메일을 확인해주세요.', null));
  return res.status(403).json(util.successFalse(null, "비밀번호 변경에 실패하였습니다.", null));
});