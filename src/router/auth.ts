import { NextFunction, Response, Router } from "express";
import * as util from "../config/util";
import jwt from "jsonwebtoken";
import passport from "passport";
// const db = require("../models/index");
import { db } from "../models/index";
import Verify from "../models/verification";
import * as crypto from "crypto";
import axios from "axios";
import dotenv from "dotenv";
import urlencode from "urlencode";
dotenv.config();

const veriRep  = db.getRepository(Verify);

function makeSignature(urlsub:string,timestamp:string){
  const space = " ";          	 // one space
  const newLine = "\n";           // new line
  const method = "POST";          // method
  // const timestamp = Date.now().toString();
  const hmac=crypto.createHmac('sha256',process.env.NAVER_SECRET as string);
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

auth.post("/sms",/*util.isLoggedin,*/async function (req: any, res: Response, next: NextFunction) {
  const body = req.body;
  const phone = body.phone;
  const sendFrom = process.env.SEND_FROM;
  const serviceID=urlencode.encode(process.env.NAVER_SMS_SERVICE_ID as string);
  const timestamp = Date.now().toString();
  const urlsub = `/sms/v2/services/${serviceID}/messages`;
  const signature=makeSignature(urlsub,timestamp);
  const randomNumber = Math.floor(Math.random() * (999999 - 100000)) + 100000;
  const data={
    "type":"SMS",
    "contentType":"COMM",
    "countryCode":"82",
    "from":sendFrom,
    "content":`Deliversity 인증번호 ${randomNumber} 입니다.`,
    "messages":[
      {
        "to":phone
      }
    ]
  };
  try {
    veriRep.destroy({
      where: {
        phone: phone
      }
    });
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
    // console.log(getToken);
    const tokenData = getToken.data;
    veriRep.create({
      phone:phone,
      sendId:tokenData.requestId,
      number:randomNumber
    });
    if(tokenData.statusCode == "202")
      return res.json(util.successTrue(tokenData.statusName));
    else return res.status(403).json(util.successFalse(null, tokenData.statusName, null));
  }
  catch(e){
    console.error(e);
    veriRep.destroy({
      where: {
        phone: phone
      }
    });
  }
});

auth.post("/sms/verification",async function (req: any, res: Response, next: NextFunction) {
  const body =req.body;
  const verify=body.verify;
  const phone=body.phone;
  try {
    veriRep.findOne({
      where: {
        phone: phone
      }
    }).then(function (veri) {
      if(veri){
        if(veri.number == verify){
          const now = Number.parseInt(Date.now().toString());
          const created = Date.parse(veri.createdAt);
          const remainingTime = (now-created)/60000;
          if(remainingTime>3){ //3분
            veri.destroy();
            // veriRep.destroy({
            //   where: {
            //     phone: phone
            //   }
            // });
            return res.status(403).json(util.successFalse(null, "time expired.", null));
          }
          // console.log(Date.now().toString() - veri.createdAt);
          veriRep.update({verified:true},{where:{phone:phone}});
          return res.json(util.successTrue("matched."));
        }
        else return res.status(403).json(util.successFalse(null, "not matched.", null));
      }
      else {
        return res.status(403).json(util.successFalse(null, "not matched.", null));
      }
    });
  } catch(e){
    console.error(e);
  }
});