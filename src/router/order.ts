import { NextFunction, Response, Router } from "express";
import * as util from "../config/util";
import * as db from "sequelize";
import dotenv from "dotenv";
import { addressRep, orderRep, reviewRep, userRep } from "../models";

dotenv.config();
export const order = Router();

order.post('/', util.isLoggedin, async function (req: any, res: Response, next: NextFunction) {
  //주문 등록
  const tokenData = req.decoded;
  const reqBody = req.body;
  try {
    //작성
    const address = await addressRep.findOne({
      where:{
        id:reqBody.addressId
      }
    });
    console.log(address);
    if(!address) return res.status(403).json(util.successFalse(null, "유효하지 않은 주소입니다.", null));
    const distance = Math.sqrt(( parseFloat(reqBody.storex) - parseFloat(address.locX) )*
                               ( parseFloat(reqBody.storex) - parseFloat(address.locX) )+
                               ( parseFloat(reqBody.storey) - parseFloat(address.locY) )*
                               ( parseFloat(reqBody.storey) - parseFloat(address.locY) ));
    const distanceFee = 3000;
    const data = {
      userId:tokenData.id,
      gender:reqBody.gender, //null => 랜덤, 0->남자, 1->여자
      addressId:reqBody.addressId,
      storeName:reqBody.storeName,
      storex:reqBody.storex, 
      storey:reqBody.storey,
      startTime:Date.now(),
      orderStatus:"주문 완료",
      hotDeal:reqBody.hotDeal?true:false
    };
    const order = await orderRep.create(data);
    return res.json(util.successTrue("",order));
  } catch (err) {
    return res.status(403).json(util.successFalse(err, "", null));
  }
});

order.get('/', util.isLoggedin, async function (req: any, res: Response, next: NextFunction) {
  //주문 확인
  const tokenData = req.decoded;
  const reqBody = req.body;
  try {
    const _order = await orderRep.findOne({
      where:{
        id:req.query.id
      }
    });
    if(!_order) return res.status(403).json(util.successFalse(null, "주문건이 없습니다.", null));
    return res.json(util.successTrue("",_order));
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
    const _order = await orderRep.findOne({where:{
      id:reqBody.orderId,
      riderId:tokenData.id,
      orderStatus:3
    }});
    if(_order === null) return res.status(403).json(util.successFalse(null, "주문건이 없습니다.", null));
    const oldReview = await reviewRep.findOne({where:{
      orderId:reqBody.orderId,
      fromId: tokenData.id
    }});
    if(oldReview) return res.status(403).json(util.successFalse(null, "리뷰를 작성할 수 없습니다.", null));
    const review = await reviewRep.create({
      orderId: _order?.id,
      userId: _order?.userId,
      riderId: _order?.riderId,
      fromId: tokenData.id,
      rating: reqBody.rating,
      content: reqBody.content
    });
    return res.json(util.successTrue("",review));
  } catch (err) {
    return res.status(403).json(util.successFalse(err, "", null));
  }
});

order.get('/review/user', util.isLoggedin, util.isRider, async function (req: any, res: Response, next: NextFunction) {
  //유저에 대한 리뷰 확인
  const tokenData = req.decoded;
  const reqBody = req.query;
  try {
    //작성
    const _user = await userRep.findOne({
      where:{
        id:reqBody.userId
      }
    });
    if(_user === null) return res.status(403).json(util.successFalse(null, "사용자가 없거나 권한이 없습니다.", null));
    const _order = await orderRep.findOne({
      where:{
        orderId:reqBody.orderId,
        orderStatus:0
      }
    });
    if(_order === null) return res.status(403).json(util.successFalse(null, "사용자가 없거나 권한이 없습니다.", null));
    const reviews = await reviewRep.findAll({
      where:{
        userId:_user?.id as any,
        fromId:{[db.Op.ne]: _user?.id}
      }
    });
    const rating = reviews.reduce((sum, cur)=>sum+cur.rating,0);
    return res.json(util.successTrue("",{
      rating: rating/reviews.length,
      reviews:reviews
    }));
  } catch (err) {
    return res.status(403).json(util.successFalse(err, "", null));
  }
});

order.post('/review/rider', util.isLoggedin, async function (req: any, res: Response, next: NextFunction) {
  //라이더에 대한 리뷰 작성
  const tokenData = req.decoded;
  const reqBody = req.body;
  try {
    const _order = await orderRep.findOne({where:{
      id:reqBody.orderId,
      userId:tokenData.id,
      orderStatus:3
    }});
    if(_order === null) return res.status(403).json(util.successFalse(null, "주문건이 없습니다.", null));
    const oldReview = await reviewRep.findOne({where:{
      orderId:reqBody.orderId,
      fromId: tokenData.id
    }});
    if(oldReview) return res.status(403).json(util.successFalse(null, "리뷰를 작성할 수 없습니다.", null));
    const review = await reviewRep.create({
      orderId: _order?.id,
      userId: _order?.userId,
      riderId: _order?.riderId,
      fromId: tokenData.id,
      rating: reqBody.rating,
      content: reqBody.content
    });
    return res.json(util.successTrue("",review));
  } catch (err) {
    return res.status(403).json(util.successFalse(err, "", null));
  }
});

order.get('/review/rider', util.isLoggedin, async function (req: any, res: Response, next: NextFunction) {
  //라이더에 대한 리뷰 확인
  const tokenData = req.decoded;
  const reqBody = req.query;
  try {
    //작성
    const _user = await userRep.findOne({
      where:{
        id:reqBody.riderId
      }
    });
    if(_user === null) return res.status(403).json(util.successFalse(null, "사용자가 없거나 권한이 없습니다.", null));
    const _order = await orderRep.findOne({
      where:{
        orderId:reqBody.orderId,
        orderStatus:0
      }
    });
    if(_order === null) return res.status(403).json(util.successFalse(null, "사용자가 없거나 권한이 없습니다.", null));
    const reviews = await reviewRep.findAll({
      where:{
        riderId:_user?.id as any,
        fromId:{[db.Op.ne]: _user?.id}
      }
    });
    const rating = reviews.reduce((sum, cur)=>sum+cur.rating,0);
    return res.json(util.successTrue("",{
      rating: rating/reviews.length,
      reviews:reviews
    }));
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
    const rider = await userRep.findOne({where:{
      id: tokenData.id
    }});
    if(rider === null) return res.status(403).json(util.successFalse(null, "사용자가 없거나 권한이 없습니다.", null));
    const orders = await orderRep.findAll({
      where:{
        orderStatus:0,
        gender: [0,rider?.gender as any]
      }
    });
    return res.json(util.successTrue("",orders));
  } catch (err) {
    return res.status(403).json(util.successFalse(err, "", null));
  }
});

////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////
////                              개발용 API입니다. 나중에는 지워야 합니다.                              ////
////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////
order.get('/setDelivered', util.isLoggedin, util.isRider, async function (req: any, res: Response, next: NextFunction) {
  //배달원이 찾을 배달거리 리스트 반환
  const tokenData = req.decoded;
  const reqBody = req.query;
  try {
    //작성
    const orders = await orderRep.findOne({
      where:{
        id:reqBody.orderId,
        orderStatus:0
      }
    });
    if(!orders) return res.json(util.successFalse(null,"주문이 없습니다.",null));
    orders?.update({
      orderStatus:3
    });
    return res.json(util.successTrue("",orders));
  } catch (err) {
    return res.status(403).json(util.successFalse(err, "", null));
  }
});
////////////////////////////////////////////////////////////////////////////////////////////////////