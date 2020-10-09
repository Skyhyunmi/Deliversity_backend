import { NextFunction, Response, Router } from "express";
import * as util from "../config/util";
import jwt from "jsonwebtoken";
import passport from "passport";
// const db = require("../models/index");
import { db } from "../models/index";
import Verify from "../models/verification";
import Email_Verify from "../models/email-verification";
import * as crypto from "crypto";
import axios from "axios";
import dotenv from "dotenv";
import urlencode from "urlencode";
import * as nodemailer from "nodemailer";
import { mainModule } from "process";
dotenv.config();

const veriRep  = db.getRepository(Verify);
const email_veriRep = db.getRepository(Email_Verify);

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
            veriRep.destroy({
              where: {
                phone: phone
              }
            });
            return res.status(403).json(util.successFalse(null, "time expired.", null));
          }
          // console.log(Date.now().toString() - veri.createdAt);
          veriRep.findOne({
            where: {
              phone: phone
            }
          }).then((veri)=>{
            if(veri) veri.update({age:25},{where:{id:2}});
            else return res.status(403).json(util.successFalse(null, "error.", null));
          });
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

auth.post("/email",/*util.isLoggedin,*/async function (req: any, res: Response, next: NextFunction) {
    const body = req.body;
    const email = body.email;

    var key_one = crypto.randomBytes(256).toString('hex').substr(100,5);
    var key_two = crypto.randomBytes(256).toString('base64').substr(50,5);
    var email_number = key_one + key_two;

    // Use SMTP transport
    var transporter = nodemailer.createTransport(
      {
      service: 'Gmail',
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      auth: {
        user: process.env.MAIL_ID,
        pass: process.env.MAIL_PW
      }
    }
    );

     try {
       email_veriRep.destroy({
         where: {
           email : email
         }
       });
      
    var url = 'http://'+req.get('host')+'/api/v1/auth/email/verification'+'?email_number='+email_number;
    var info = await transporter.sendMail({
      from : '"Deliversity" <${process.env.MAIL_ID}>',
      to: email,
      subject:"Deliversity 인증 메일입니다.",
      html: "<h3>이메일 인증을 위해 URL을 클릭해주세요.</h3><br>"+url
    });

    email_veriRep.create({
      email:email,
      email_number:email_number
    });

    res.status(200).json({
      status:'Success',
      code:200,
      message:'Sent Auth Email',
    });
  }
  catch(e){
    console.error(e);
    email_veriRep.destroy({
      where: {
        email : email
      }
    });
  }
}
);

auth.get('/email/verification',async (req, res, next: NextFunction) => {  
  const email_number = req.query.email_number as string;
  console.log("1");
    email_veriRep.findOne({
      where:{email_number:email_number}
    }).then((email_veri) => {
        if (email_veri) {
          console.log("2");
          email_veriRep.update({
            email_verified: true
          }, {
            where: { email:email_veri.email }
          });
          res.status(204).json({
            status: 'Success',
            code: 204,
            message: 'Matched',
          });
        }
        else { console.log("3");
          res.status(403).json({
            status: 'Fail',
            code: 403,
            message: 'Not Matched',
          });
        }
      }
    )
    }
)