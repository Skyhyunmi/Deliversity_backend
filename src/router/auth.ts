import { NextFunction, Response, Router } from "express";
import * as util from "../config/util";
import jwt from "jsonwebtoken";
import passport from "passport";
import { veriRep } from "../models/index";
import * as crypto from "crypto";
import axios from "axios";
import urlencode from "urlencode";
import dotenv from "dotenv";
dotenv.config();

function makeSignature(urlsub:string,timestamp:string){
  const space = " ";
  const newLine = "\n";
  const method = "POST";
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
    info: any
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
    info: any
  ) {
    if (info==={})
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
        expiresIn: '7d',
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
            return res.status(403).json(util.successFalse(null, "time expired.", null));
          }
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

auth.get('/google', passport.authenticate('google', {
  scope: ["profile", "email"]
}));

auth.get('/google/callback', function(req: any, res: Response, next: NextFunction) {
  passport.authenticate('google',function (
    err: any,
    user: any,
    info: any
  ){
    if (info){
      if(info.message)
        return res.status(403).json(util.successFalse(null, info.message, info.auth));
        //회원가입 redirect -> auth 값은 googleOAuth에 넣는다.(프론트에서)
    }
    if (err || !user) {
      return res
        .status(403)
        .json(util.successFalse(null, "ID or PW is not valid", info.message));
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
        expiresIn: '7d',
      });
      res.json({ token: user.authToken, admin: user.admin });
    });
  })(req,res,next);
}
);

auth.get('/kakao', passport.authenticate('kakao'));

auth.get('/kakao/callback', function (req, res, next) {
  passport.authenticate('kakao', function (err, user) {
    console.log('passport.authenticate(kakao)실행');
    // if (!user) { return res.redirect('http://localhost:3000/login'); }
    req.logIn(user, function (err) { 
       
      if (err) return res.status(403).json(util.successFalse(err, "", null));
      const payload = {
        id: user.userId,
        name: user.name,
        admin: user.admin,
        loggedAt: new Date(),
      };
      user.authToken = jwt.sign(payload, process.env.JWT_SECRET as jwt.Secret, {
        expiresIn: '7d',
      });
      res.json({ token: user.authToken, admin: user.admin });      
    });
  })(req, res);
});