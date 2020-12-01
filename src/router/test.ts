import { Request, Response, Router } from "express";
import * as util from "../config/util";
import axios from "axios";

import * as functions from "../config/functions";
import { userRep } from "../models";
import dotenv from "dotenv";
dotenv.config();

export const test = Router();

test.get("/hello", (req: Request, res: Response) => {
  res.json({ string: "hello pm2! nice to meet you!" });
});
// const epsg_5181=proj4.Proj("+proj=tmerc +lat_0=38 +lon_0=127 +k=1 +x_0=200000 \
//                             +y_0=500000 +ellps=GRS80 +units=m +no_defs");
// const grs80 = proj4.Proj("+proj=tmerc +lat_0=38 +lon_0=127.5 +k=0.9996 \
//                           +x_0=1000000 +y_0=2000000 +ellps=GRS80 +units=m +no_defs"); //도로명주소 제공 좌표 5179
// const wgs84 = proj4.Proj("EPSG:4326"); //경위도

test.post('/juso', async function (req: Request, res: Response) {
  //주문 등록
  const reqBody = req.body;
  try {
    const coord = await axios({
      url: `https://dapi.kakao.com/v2/local/search/address.json?query=${encodeURIComponent(reqBody.address)}`,
      method: 'get',
      headers: { Authorization: `KakaoAK ${process.env.KAKAO_KEY}` }
    });
    return res.json(util.successTrue("", coord.data.documents[0]));
  } catch (err) {
    console.error(err);
  }
});

test.post('/noti', util.isLoggedin, async function (req: Request, res: Response) {
  const reqBody = req.body;
  const tokenData = req.decoded;
  const user = await userRep.findOne({ where: { id: tokenData.id } });
  if (!user) return res.status(403).json(util.successFalse(null, "Retry.", null));
  const registrationToken = user.firebaseFCM;
  console.log(registrationToken);
  try {
    const payload = reqBody.payload;

    // token: registrationToken

    // await admin.messaging().sendToDevice(registrationToken,{
    //   data:{test:"hi"}
    // })
    functions.sendFCMMessage(registrationToken,payload);
    // await admin.messaging().sendToDevice(registrationToken, payload);
    // admin.messaging().send(payload)
    // .then(result=>{
    //   return res.json(util.successTrue( "", payload.notification));
    // })
    return res.json(util.successTrue("", payload.notification));
  } catch (err) {
    return res.status(403).json(util.successFalse(err, "Retry.", null));
  }
});

// test.post('/email', util.isLoggedin, async function (req: Request, res: Response) {
//   const reqBody = req.body;
//   const email = reqBody.email;
//   const regex = /^[0-9a-zA-Z]([-_\\.]?[0-9a-zA-Z])*@[0-9a-zA-Z]([-_.]?[0-9a-zA-Z])*.[a]{1}[c]{1}.[k]{1}[r]{1}$/i;
//   const actest = regex.test(email);
//   const regExp = /^[0-9a-zA-Z]([-_\\.]?[0-9a-zA-Z])*@[0-9a-zA-Z]([-_.]?[0-9a-zA-Z])*.[e]{1}[d]{1}[u]{1}$/i;
//   const edutest = regExp.test(email);
//   if (!(edutest || actest)) return res.status(403).json(util.successFalse(null, "Retry.", null));
//   return res.json(util.successTrue("", "good"));
// });
