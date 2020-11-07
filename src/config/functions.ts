import axios from "axios";
import {userRep} from "../models/index";
import * as crypto from "crypto";
import * as admin from "firebase-admin";
import Cache from "node-cache";
import User from "../models/user";
import jwt from "jsonwebtoken";
import { transporter } from "./mail";
import * as classes from "./classes";

import dotenv from "dotenv";
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

export async function sendEmail(email: string, suburl: string){
  const key_one = crypto.randomBytes(256).toString('hex').substr(100, 5);
  const key_two = crypto.randomBytes(256).toString('base64').substr(50, 5);
  const email_number = key_one + key_two;
  try {
    const user = await userRep.findOne({ where: { email: email } });
    if (user) return 'Already Existed Email';
    myCache.del(email);
    const url = 'http://' + suburl + '/api/v1/auth/email/verification' + '?email_number=' + email_number;
    await transporter.sendMail({
      from: '"발신전용" <noreply@deliversity.co.kr>',
      to: email,
      subject: "Deliversity 인증 메일입니다.",
      html: "<h3>이메일 인증을 위해 URL을 클릭해주세요.</h3><br>" + url
    });
    myCache.set(email_number,{email:email, createdAt:Date.now()});
    return null;
  }
  catch (e) {
    myCache.del(email);
    myCache.del(email_number);
    return 'Sent Auth Email Failed';
  }
}

export async function emailVerify(verify:string){
  try{
    const veri = myCache.take(verify) as any;
    if (!veri) {
      myCache.del(verify);
      return "Not Matched.";
    }
    const now = Number.parseInt(Date.now().toString());
    const created = Number.parseInt(veri.createdAt);
    const remainingTime = (now - created) / 60000;
    if (remainingTime > 15) {
      myCache.del(verify);
      return "Time Expired";
    }
    myCache.set(veri.email,{verify:1, updatedAt:Date.now()});
    return null;
  }catch(e){
    return "Retry.";
  }
}

export async function getAuthToken(user:User){
  const uid = user.firebaseUid;
  const firebaseToken = await admin.auth().createCustomToken(uid);
  const authToken=jwt.sign(Object.assign({},new classes.payLoad(user)), process.env.JWT_SECRET as jwt.Secret, {
    expiresIn: '7d',
  });
  const payload={
    firebaseToken:firebaseToken,
    authToken:authToken
  };
  return payload;
}

export async function sendSMS(phone:string){
  const sendFrom = process.env.SEND_FROM;
  const serviceID = encodeURIComponent(process.env.NAVER_SMS_SERVICE_ID as string);
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
    "messages": [{ "to": phone}]
  };
  try {
    const user = await userRep.findOne({ where: { phone: phone } });
    if (user) return "phone number duplicated.";
    myCache.del(phone);
    const Token = await axios({
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
    const tokenData = Token.data;
    myCache.set(phone,{number:randomNumber, createdAt:Date.now()});
    if (tokenData.statusCode == "202")
      return null;
    return "문자 전송 실패";
  }
  catch (e) {
    myCache.del(phone);
    return "문자 전송 실패";
  }
}

export async function smsVerify(phone: string,verify: string){
  try {
    const veri = myCache.take(phone) as any;
    if(!veri) {
      myCache.del(phone);
      return "Retry.";
    }
    if(veri.number != verify) {
      myCache.del(phone);
      return "Not Matched.";
    }
    const now = Number.parseInt(Date.now().toString());
    const created = Number.parseInt(veri.createdAt);
    const remainingTime = (now - created) / 60000;
    if (remainingTime > 15) { //15분
      myCache.del(phone);
      return "Time Expired.";
    }
    myCache.set(phone,{verify:1, updatedAt:Date.now()});
    return null;
  } catch (e) {
    return "Retry.";
  }
}

export async function getUserFromGoogleInfo(idToken:string) {
  const ret = await axios({
    url:'https://www.googleapis.com/oauth2/v3/tokeninfo',
    method: "GET",
    params:{
      id_token:idToken
    }
  });
  if(!ret) return null;
  return {id:ret.data.sub, 
    user: await userRep.findOne({
      where:{
        googleOAuth:ret.data.sub
      }
    })
  };
}

export async function getUserFromKakaoInfo(accessToken:string) {
  const ret = await axios({
    url:'https://kapi.kakao.com/v1/user/access_token_info',
    method: "GET",
    headers:{
      Authorization: `Bearer ${accessToken}`
    }
  });
  if(!ret) return null;
  return {id:ret.data.id,
    user: await userRep.findOne({
      where:{
        kakaoOAuth:ret.data.id
      }
    })
  };
}

