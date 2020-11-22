import { Request, Response, Router } from "express";
import * as util from "../config/util";
import { pointRep, userRep, paymentRep } from "../models/index";

import dotenv from "dotenv";
import Axios from "axios";
dotenv.config();

export const point = Router();
// 포인트 반환
// 포인트 차감
// 포인트 추가 - 
point.get('/', util.isLoggedin, async (req: Request, res: Response) => {
  const tokenData = req.decoded;
  const point = await pointRep.findAll({ where: { userId: tokenData.id, status: false } });
  const sum = point.reduce((sum, cur) => sum + cur.point, 0);
  if (sum < 0) return res.status(403).json(util.successFalse(null, "포인트 반환 실패", null));
  return res.json(util.successTrue("", { point: sum.toString() }));
});

point.post('/', util.isLoggedin, async (req: Request, res: Response) => {
  const reqBody = req.body;
  const tokenData = req.decoded;
  //결제 검증 프로세스 있어야함.
  const user = await userRep.findOne({ where: { id: tokenData.id } });
  if (!user) return res.status(403).json(util.successFalse(null, "포인트 충전 실패", null));
  const today = new Date();
  today.setFullYear(today.getFullYear() + 3, today.getMonth(), today.getDay());
  const { imp_uid, merchant_uid } = reqBody; // req의 body에서 imp_uid, merchant_uid 추출
  const getToken = await Axios({
    url: "https://api.iamport.kr/users/getToken",
    method: "post",
    headers: { "Content-Type": "application/json" }, // "Content-Type": "application/json"
    data: {
      imp_key: process.env.IMP_KEY, // REST API키
      imp_secret: process.env.IMP_SECRET // REST API Secret
    }
  });
  const { access_token } = getToken.data.response;
  const url = "https://api.iamport.kr/payments/" + imp_uid;
  const getPaymentData = await Axios({
    url: "https://api.iamport.kr/payments/" + imp_uid + "?_token=" + "69e9ffc1a45e040f60f56d4ebbe729a79b3a28da",
    method: "get",
    headers: { "Authorization": access_token }
  });
  const paymentData = getPaymentData.data.response; // 조회한 결제 정보
  const amountToBePaid = parseInt(reqBody.point);
  const { amount, status } = paymentData;
  if (amountToBePaid == amount) {
    const receipt = await paymentRep.findOne({ where: { userId: tokenData.id, impUid: imp_uid } });
    if (receipt) { res.status(403).json(util.successFalse(null, "이미 충전되었습니다.", null)); }
    else {
      await paymentRep.create({
        userId: tokenData.id,
        state: 0,
        impUid: imp_uid,
        merchantUid: merchant_uid,
        amount: amount
      });
      await pointRep.create({
        point: reqBody.point,
        pointKind: 0,
        userId: tokenData.id,
        status: 0,
        expireAt: today
      });
    }
    return res.json(util.successTrue("", status));
  } else { // 결제 금액 불일치. 위/변조 된 결제
    res.status(403).json(util.successFalse(null, "결제 금액과 충전 금액이 다릅니다.", null));
  }
});

// point.post('/withdraw', util.isLoggedin,async (req:Request,res:Response)=>{

// });