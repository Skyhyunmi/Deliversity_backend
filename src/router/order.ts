import { NextFunction, Response, Router } from "express";
import * as util from "../config/util";

import dotenv from "dotenv";
import { addressRep, orderRep, userRep } from "../models";
import * as proj4 from "proj4";

dotenv.config();
export const order = Router();

order.post('/', util.isLoggedin, async function (req: any, res: Response, next: NextFunction) {
  //주문 등록
  const tokenData = req.decoded;
  const reqBody = req.body;
  let gender = reqBody.gender;
  try {
    const address = await addressRep.findOne({
      where: {
        userid: tokenData.id,
        id: reqBody.addressId
      }
    });
    if (!address) return res.status(403).json(util.successFalse(null, "해당하는 주소가 없습니다.", null));
    if (reqBody.gender > 0) {
      const user = await userRep.findOne({ where: { id: tokenData.id, grade: [2, 3] } });
      if (!user) return res.status(403).json(util.successFalse(null, "준회원은 동성 배달을 이용할 수 없습니다.", null));
      gender = user.gender;
    }
    // const distance = Math.sqrt((parseFloat(reqBody.storex) - parseFloat(address.locX)) *
    //   (parseFloat(reqBody.storex) - parseFloat(address.locX)) +
    //   (parseFloat(reqBody.storey) - parseFloat(address.locY)) *
    //   (parseFloat(reqBody.storey) - parseFloat(address.locY)));
    let cost = 3000;
    if (reqBody.hotDeal) { cost = 4000; }
    const data = {
      userId: tokenData.id,
      gender: gender, // 0이면 random, 1이면 남자 2면 여자
      addressId: reqBody.addressId,
      // store 쪽 구현 아직 안되어서
      storeName: reqBody.storeName,
      storeX: reqBody.storeX,
      storeY: reqBody.storeY,
      chatId: reqBody.chatId ? reqBody.chatId : null,
      startTime: Date.now(),
      orderStatus: 0,
      hotDeal: reqBody.hotDeal ? true : false,
      // hotDeal 계산된 금액(소비자한테 알려줘야함)
      cost: cost
    };
    const order = await orderRep.create(data);
    return res.json(util.successTrue("", order));
  } catch (err) {
    return res.status(403).json(util.successFalse(err, "", null));
  }
});

order.get('/:id', util.isLoggedin, async function (req: any, res: Response, next: NextFunction) {
  //주문 확인
  const tokenData = req.decoded;
  try {
    const _order = await orderRep.findOne({
      where: {
        id: req.params.id
      }
    });
    if (!_order) res.status(403).json(util.successFalse(null, "주문건이 없습니다.", null));
    return res.json(util.successTrue("", _order));
  } catch (err) {
    return res.status(403).json(util.successFalse(err, "", null));
  }
});

order.get('/riders', util.isLoggedin, async function (req: any, res: Response, next: NextFunction) {
  //신청 배달원 목록 반환
  const tokenData = req.decoded;
  const reqBody = req.body;
  try {
    //작성
  } catch (err) {
    return res.status(403).json(util.successFalse(err, "", null));
  }
});

order.post('/rider', util.isLoggedin, async function (req: any, res: Response, next: NextFunction) {
  //배달원 선택
  const tokenData = req.decoded;
  const reqBody = req.body;
  try {
    //작성
  } catch (err) {
    return res.status(403).json(util.successFalse(err, "", null));
  }
});

order.get('/chat', util.isLoggedin, async function (req: any, res: Response, next: NextFunction) {
  //주문에 대한 채팅을 위한 주소 반환
  //필요없을 수도... 주문 등록 할때 반환해도 될 수도..
  const tokenData = req.decoded;
  const reqBody = req.body;
  try {
    //작성
  } catch (err) {
    return res.status(403).json(util.successFalse(err, "", null));
  }
});

order.get('/price', util.isLoggedin, async function (req: any, res: Response, next: NextFunction) {
  //최종 결제 금액 반환
  const tokenData = req.decoded;
  const reqBody = req.body;
  try {
    //작성
  } catch (err) {
    return res.status(403).json(util.successFalse(err, "", null));
  }
});

order.post('/price', util.isLoggedin, util.isRider, async function (req: any, res: Response, next: NextFunction) {
  //배달원이 최종 결제 금액 전송
  const tokenData = req.decoded;
  const reqBody = req.body;
  try {
    //작성
  } catch (err) {
    return res.status(403).json(util.successFalse(err, "", null));
  }
});

order.post('/review/user', util.isLoggedin, util.isRider, async function (req: any, res: Response, next: NextFunction) {
  //유저에 대한 리뷰 작성
  const tokenData = req.decoded;
  const reqBody = req.body;
  try {
    //작성
  } catch (err) {
    return res.status(403).json(util.successFalse(err, "", null));
  }
});

order.get('/review/user', util.isLoggedin, async function (req: any, res: Response, next: NextFunction) {
  //유저에 대한 리뷰 확인
  const tokenData = req.decoded;
  const reqBody = req.body;
  try {
    //작성
  } catch (err) {
    return res.status(403).json(util.successFalse(err, "", null));
  }
});

order.post('/review/rider', util.isLoggedin, async function (req: any, res: Response, next: NextFunction) {
  //라이더에 대한 리뷰 작성
  const tokenData = req.decoded;
  const reqBody = req.body;
  try {
    //작성
  } catch (err) {
    return res.status(403).json(util.successFalse(err, "", null));
  }
});

order.get('/review/rider', util.isLoggedin, async function (req: any, res: Response, next: NextFunction) {
  //라이더에 대한 리뷰 확인
  const tokenData = req.decoded;
  const reqBody = req.body;
  try {
    //작성
  } catch (err) {
    return res.status(403).json(util.successFalse(err, "", null));
  }
});

order.get('/orders', util.isLoggedin, util.isRider, async function (req: any, res: Response, next: NextFunction) {
  //배달원이 찾을 배달거리 리스트 반환
  const tokenData = req.decoded;
  const reqBody = req.body;
  try {
    //작성
    const orders = await orderRep.findAll({
      where: {
        orderStatus: 0
      }
    });
    return res.json(util.successTrue("", orders));
  } catch (err) {
    return res.status(403).json(util.successFalse(err, "", null));
  }
});