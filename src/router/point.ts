import { Request, Response, Router } from "express";
import * as util from "../config/util";
import { pointRep, userRep, paymentRep, refundRep } from "../models/index";

import dotenv from "dotenv";
import Axios from "axios";
dotenv.config();

export const point = Router();

// 포인트 조회
point.get('/', util.isLoggedin, async (req: Request, res: Response) => {
  const tokenData = req.decoded;
  const point = await pointRep.findAll({ where: { userId: tokenData.id, status: false } });
  const sum = point.reduce((sum, cur) => sum + cur.point, 0);
  if (sum < 0) return res.status(403).json(util.successFalse(null, "포인트 반환 실패", null));
  return res.json(util.successTrue("", { point: sum.toString() }));
});

// 충전하기(결제)
point.post('/', util.isLoggedin, async (req: Request, res: Response) => {
  const reqBody = req.body;
  const tokenData = req.decoded;
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
  const getPaymentData = await Axios({
    url: "https://api.iamport.kr/payments/" + imp_uid,
    method: "get",
    headers: { "Authorization": access_token }
  });
  const paymentData = getPaymentData.data.response; // 조회한 결제 정보
  const amountToBePaid = parseInt(reqBody.point);
  const { amount, status } = paymentData;
  if (amountToBePaid == amount) {
    const receipt = await paymentRep.findOne({ where: { userId: tokenData.id, impUid: imp_uid } });
    if (receipt) { return res.status(403).json(util.successFalse(null, "이미 충전되었습니다.", null)); }
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
    return res.status(403).json(util.successFalse(null, "결제 금액과 충전 금액이 다릅니다.", null));
  }
});

// 포인트 환급 신청
point.post('/refund', util.isLoggedin, async (req: Request, res: Response) => {
  const tokenData = req.decoded;
  const reqBody = req.body;
  let amountToBeRefund = parseInt(reqBody.point);
  const amount = amountToBeRefund;
  if (!amountToBeRefund) return res.status(403).json(util.successFalse(null, "환급 금액을 입력해주세요.", null));
  const accountName = reqBody.accountName;
  if (!accountName) return res.status(403).json(util.successFalse(null, "계좌에 등록된 이름을 입력해주세요.", null));
  const bankKind = reqBody.bankKind;
  if (!bankKind) return res.status(403).json(util.successFalse(null, "은행 종류를 입력해주세요.", null));
  const accountNum = reqBody.accountNum;
  if (!accountNum) return res.status(403).json(util.successFalse(null, "계좌 번호를 입력해주세요.", null));
  const points = await pointRep.findAll({ where: { userId: tokenData.id, }, order: [['expireAt', 'ASC']] });
  const sum = points.reduce((sum, cur) => { return sum + cur.point; }, 0);
  if (sum < amountToBeRefund) return res.status(403).json(util.successFalse(null, "포인트가 모자랍니다.", null));
  points.some(async (point) => {
    if (amountToBeRefund) {
      const curPoint = point.point;
      if (amountToBeRefund <= point.point) {
        await point.update({ point: curPoint - amountToBeRefund });
        amountToBeRefund = 0;
        return true;
      }
      else {
        await point.update({ point: 0 });
        await point.destroy();
        amountToBeRefund -= curPoint;
        return false;
      }
    }
    else return true;
  });
  /* 환급 내역 */
  await refundRep.create({
    userId: tokenData.id,
    accountName: accountName,
    bankKind: bankKind,
    accountNum: accountNum,
    amount: amount,
    status: 0
  });
  return res.json(util.successTrue("", null));
});