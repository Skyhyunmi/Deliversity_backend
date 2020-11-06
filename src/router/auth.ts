import { NextFunction, Request, Response, Router } from "express";
import * as util from "../config/util";
import jwt from "jsonwebtoken";
import passport from "passport";
import { userRep } from "../models/index";
import * as crypto from "crypto";
import axios from "axios";
import urlencode from "urlencode";
import { transporter } from "../config/mail";
import Cache from "node-cache";
import * as admin from "firebase-admin";

import dotenv from "dotenv";
import User from "../models/user";
import { read } from "fs";
dotenv.config();
export const myCache = new Cache();

function makeSignature(urlsub: string, timestamp: string) {
  const space = " ";
  const newLine = "\n";
  const method = "POST";
  const hmac = crypto.createHmac('sha256', process.env.NAVER_SECRET as string);
  const mes = [];
  mes.push(method);
  mes.push(space);
  mes.push(urlsub);
  mes.push(newLine);
  mes.push(timestamp);
  mes.push(newLine);
  mes.push(process.env.NAVER_KEY);
  const signature = hmac.update(mes.join('')).digest('base64');
  return signature;
}

export const auth = Router();
auth.post("/signup", function (req: Request, res: Response, next: NextFunction) {
  passport.authenticate("signup", async function (
    err: any,
    _user: User,
    info: any
  ) {
    if (err) {
      return res.status(403).json(util.successFalse(err, "", null));
    }
    if (info) {
      return res.status(403).json(util.successFalse(null, info.message, null));
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
      const fbUser = await admin.auth().createUser({
        email:user.email,
        emailVerified:true,
        phoneNumber:"+82"+user.phone.slice(1),
        password: _user.password
      });
      if(!fbUser) return res.status(403).json(util.successFalse(null, "이메일이 중복되었습니다.", null));
      _user.update({
        firebaseUid:fbUser.uid
      });
      return res.json(util.successTrue("", user));
    }
  })(req, res, next);
});

auth.post("/login", async function (req: Request, res: Response, next: NextFunction) {
  passport.authenticate("login", { session: false }, function (
    err: any,
    user: any,
    info: any
  ) {
    if (info === {})
      return res.status(403).json(util.successFalse(null, info.message, null));
    if (err || !user) {
      return res
        .status(403)
        .json(util.successFalse(null, "ID or PW is not valid", user));
    }
    req.logIn(user, { session: false }, async function (err: any) {
      if (err) return res.status(403).json(util.successFalse(err, "Can't login", null));
      const payload = {
        id: user.id,
        userId: user.userId,
        name: user.name,
        nickName: user.nickName,
        grade: user.grade,
        loggedAt: new Date(),
      };
      const uid = user.firebaseUid.toString();
      let firebaseToken = null;
      if(uid) firebaseToken = await admin.auth().createCustomToken(uid);
      const authToken = jwt.sign(payload, process.env.JWT_SECRET as jwt.Secret, {
        expiresIn: '7d',
      });
      return res.json(util.successTrue("", {firebaseToken:firebaseToken, token: authToken, grade: user.grade }));
    });
  })(req, res, next);
});

auth.post('/login/google', async function (req: Request, res: Response, next: NextFunction) {
  const reqBody=req.body;
  try{
    const idToken = reqBody.idToken;
    //토큰 검증
    const ret = await axios({
      url:'https://www.googleapis.com/oauth2/v3/tokeninfo',
      method: "GET",
      params:{
        id_token:idToken
      }
    });
    //sub로 user db 검색
    const user = await userRep.findOne({
      where:{
        googleOAuth:ret.data.sub
      }
    });
    if (!user) return res.status(403).json(util.successFalse(null, "회원이 없습니다.", null));
    const payload = {
      id: user.id,
      userId: user.userId,
      name: user.name,
      nickName: user.nickName,
      grade: user.grade,
      loggedAt: new Date(),
    };
    const uid = user.firebaseUid.toString();
    const firebaseToken = await admin.auth().createCustomToken(uid);
    const authToken = jwt.sign(payload, process.env.JWT_SECRET as jwt.Secret, {
      expiresIn: '7d',
    });
    return res.json(util.successTrue("", {firebaseToken:firebaseToken, token: authToken, grade: user.grade }));
  }catch (e) {
    console.log("?");
    return res.status(403).json(util.successFalse(null, "Retry.", null));
  }
});

auth.post('/login/kakao', async function (req: Request, res: Response, next: NextFunction) {
  const reqBody=req.body;
  try{
    const accessToken = reqBody.accessToken;
    //토큰 검증
    const ret = await axios({
      url:'https://kapi.kakao.com/v1/user/access_token_info',
      method: "GET",
      headers:{
        Authorization: `Bearer ${accessToken}`
      }
    });
    if(!ret) return res.status(403).json(util.successFalse(null, "회원이 없습니다.", null));
    //id로 user db 검색
    const user = await userRep.findOne({
      where:{
        kakaoOAuth:ret.data.id
      }
    });
    if (!user) return res.status(403).json(util.successFalse(null, "회원이 없습니다.", null));
    const payload = {
      id: user.id,
      userId: user.userId,
      name: user.name,
      nickName: user.nickName,
      grade: user.grade,
      loggedAt: new Date(),
    };
    const uid = user.firebaseUid.toString();
    const firebaseToken = await admin.auth().createCustomToken(uid);
    const authToken = jwt.sign(payload, process.env.JWT_SECRET as jwt.Secret, {
      expiresIn: '7d',
    });
    return res.json(util.successTrue("", {firebaseToken:firebaseToken, token: authToken, grade: user.grade }));
  }catch (e) {
    console.log("?");
    return res.status(403).json(util.successFalse(null, "Retry.", null));
  }
});

auth.post('/login/fcm', async function (req: Request, res: Response, next: NextFunction) {
  const reqBody=req.body;
  try{
    admin.auth().verifyIdToken(reqBody.idToken)
      .then(async (data)=>{
        const user = await userRep.findOne({
          where:{
            firebaseUid:data.uid
          }
        });
        if(!user) return res.status(403).json(util.successFalse(null, "회원이 없습니다.", null));
        user.update({
          firebaseFCM:reqBody.fcmToken
        });
        res.json(util.successTrue("", null));
      });
  }catch (e) {
    console.log("?");
    return res.status(403).json(util.successFalse(null, "Retry.", null));
  }
});

auth.get('/refresh', util.isLoggedin, function (req: Request, res:Response) {
  userRep.findOne({ where: { userId: req.decoded.userId } }).then(function (user) {
    if (!user) {
      return res.status(403).json(util.successFalse(null, "Can't refresh the token", { user: user }));
    }
    const payload = {
      id: user.id,
      userId: user.userId,
      name: user.name,
      nickName: user.nickName,
      grade: user.grade,
      loggedAt: new Date(),
    };
    const authToken = jwt.sign(payload, process.env.JWT_SECRET as jwt.Secret, {
      expiresIn: '7d',
    });
    return res.json(util.successTrue("", { token: authToken, grade: user.grade }));
  });
});

auth.post("/sms",/*util.isLoggedin,*/async function (req: Request, res: Response) {
  const body = req.body;
  const phone = body.phone;
  const user = await userRep.findOne({ where: { phone: phone } });
  if (user) return res.status(403).json(util.successFalse(null, "phone number duplicated.", null));
  const sendFrom = process.env.SEND_FROM;
  const serviceID = urlencode.encode(process.env.NAVER_SMS_SERVICE_ID as string);
  const timestamp = Date.now().toString();
  const urlsub = `/sms/v2/services/${serviceID}/messages`;
  const signature = makeSignature(urlsub, timestamp);
  const randomNumber = Math.floor(Math.random() * (999999 - 100000)) + 100000;
  const data = {
    "type": "SMS",
    "contentType": "COMM",
    "countryCode": "82",
    "from": sendFrom,
    "content": `Deliversity 인증번호 ${randomNumber} 입니다.`,
    "messages": [
      {
        "to": phone
      }
    ]
  };
  try {
    myCache.del(phone);
    const getToken = await axios({
      url: `https://sens.apigw.ntruss.com/sms/v2/services/${serviceID}/messages`,
      method: "post", // POST method
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "x-ncp-apigw-timestamp": timestamp,
        "x-ncp-iam-access-key": process.env.NAVER_KEY,
        "x-ncp-apigw-signature-v2": signature
      }, // "Content-Type": "application/json"
      data: data
    });
    const tokenData = getToken.data;
    myCache.set(phone,{number:randomNumber, createdAt:Date.now()});

    if (tokenData.statusCode == "202")
      return res.json(util.successTrue(tokenData.statusName, null));
    return res.status(403).json(util.successFalse(null, tokenData.statusName, null));
  }
  catch (e) {
    myCache.del(phone);
    return res.status(403).json(util.successFalse(null, "Retry.", null));
  }
});

auth.post("/sms/verification", async function (req: Request, res: Response) {
  const body = req.body;
  const verify = body.verify;
  const phone = body.phone;
  try {
    const veri = myCache.take(phone) as any;
    if(!veri) {
      myCache.del(phone);
      return res.status(403).json(util.successFalse(null, "Retry.", null));
    }
    if(veri.number != verify) {
      myCache.del(phone);
      return res.status(403).json(util.successFalse(null, "Not Matched.", null));
    }
    const now = Number.parseInt(Date.now().toString());
    const created = Number.parseInt(veri.createdAt);
    const remainingTime = (now - created) / 60000;
    if (remainingTime > 15) { //15분
      myCache.del(phone);
      return res.status(403).json(util.successFalse(null, "Time Expired.", null));
    }
    myCache.set(phone,{verify:1, updatedAt:Date.now()});
    return res.json(util.successTrue("Matched.", null));
  } catch (e) {
    return res.status(403).json(util.successFalse(null, "Retry.", null));
  }
});

auth.post("/email",/*util.isLoggedin,*/async function (req: Request, res: Response) {
  const body = req.body;
  const email = body.email;
  const key_one = crypto.randomBytes(256).toString('hex').substr(100, 5);
  const key_two = crypto.randomBytes(256).toString('base64').substr(50, 5);
  const email_number = key_one + key_two;

  try {
    const user = await userRep.findOne({ where: { email: email } });
    if (user) return res.json(util.successFalse(null, 'Already Existed Email', null));
    myCache.del(email);
    const url = 'http://' + req.get('host') + '/api/v1/auth/email/verification' + '?email_number=' + email_number;
    await transporter.sendMail({
      from: '"발신전용" <noreply@deliversity.co.kr>',
      to: email,
      subject: "Deliversity 인증 메일입니다.",
      html: "<h3>이메일 인증을 위해 URL을 클릭해주세요.</h3><br>" + url
    });
    myCache.set(email_number,{email:email, createdAt:Date.now()});
    return res.json(util.successTrue('Sent Auth Email', null));
  }
  catch (e) {
    myCache.del(email);
    myCache.del(email_number);
    return res.status(403).json(util.successFalse(null, 'Sent Auth Email Failed', null));
  }
}
);

auth.get('/email/verification', async (req:Request, res) => {
  const email_number = req.query.email_number as string;
  try{
    const veri = myCache.take(email_number) as any;
    if (!veri) {
      myCache.del(email_number);
      return res.status(403).json(util.successFalse(null, "Not Matched.", null));
    }
    const now = Number.parseInt(Date.now().toString());
    const created = Number.parseInt(veri.createdAt);
    const remainingTime = (now - created) / 60000;
    if (remainingTime > 15) {
      myCache.del(email_number);
      return res.status(403).json(util.successFalse(null, "Time Expired", null));
    }
    myCache.set(veri.email,{verify:1, updatedAt:Date.now()});
    return res.json(util.successTrue("Matched", null));
  }catch(e){
    return res.status(403).json(util.successFalse(null, "Retry.", null));
  }
});
