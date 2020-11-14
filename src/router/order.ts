/* eslint-disable no-inner-declarations */
import { Request, Response, Router } from "express";
import * as util from "../config/util";
import * as functions from "../config/functions";
import * as classes from "../config/classes";
import NodeCache from "node-cache";
import * as db from "sequelize";
import * as crypto from "crypto";
import axios from "axios";
import { addressRep, orderRep, reviewRep, roomRep, userRep, pointRep } from "../models";
import * as admin from "firebase-admin";

import dotenv from "dotenv";
import { token } from "morgan";
dotenv.config();

export const order = Router();
const myCache = new NodeCache({ stdTTL: 0, checkperiod: 0 });

order.post('/', util.isLoggedin, async function (req: Request, res: Response) {
  //주문 등록
  const tokenData = req.decoded;
  const reqBody = req.body;
  let expHour = reqBody.expHour;
  let expMinute = reqBody.expMinute;
  let gender = parseInt(reqBody.gender);
  const today = new Date();
  let registrationToken;

  if (reqBody.reservation === "1") {
    if (!expHour || !expMinute) { return res.status(403).json(util.successFalse(null, "예약 시간 또는 분을 입력하시지 않으셨습니다.", null)); };
    expHour = parseInt(reqBody.expHour); expMinute = parseInt(reqBody.expMinute);
    today.setHours(today.getHours() + expHour);
    today.setMinutes(today.getMinutes() + expMinute);
  }
  else { today.setHours(today.getHours() + 1); }
  try {
    if (gender >= 1) {
      const user = await userRep.findOne({ where: { id: tokenData.id, grade: [2, 3] } });
      if (!user) return res.status(403).json(util.successFalse(null, "준회원은 동성 배달을 이용할 수 없습니다.", null));
      gender = user.gender;
    }
    const address = await addressRep.findOne({
      where: {
        userid: tokenData.id,
      }
    });
    if (!address) return res.status(403).json(util.successFalse(null, "해당하는 주소가 없습니다.", null));
    let cost = 3000;
    if (reqBody.hotDeal === "1") cost = 4000;

    const coord = await axios({
      url: `https://dapi.kakao.com/v2/local/search/address.json?query=${encodeURIComponent(reqBody.storeAddress)}`,
      method: 'get',
      headers: { Authorization: `KakaoAK ${process.env.KAKAO_KEY}` }
    }) as any;

    if (coord.data.documents[0] === undefined) {
      // coord.data.documents[0].y = 37.5674160, coord.data.documents[0].x = 126.9663050;
      return res.status(403).json(util.successFalse(null, "주소를 다시 확인해주세요.", null));
    }

    // const from = await axios({
    //   url: 'https://dapi.kakao.com/v2/local/geo/transcoord.json',
    //   method: "GET",
    //   params: {
    //     y: address.locX,
    //     x: address.locY,
    //     input_coord: "WGS84",
    //     output_coord: "WCONGNAMUL"
    //   },
    //   headers: {
    //     Authorization: `KakaoAK ${process.env.KAKAO_KEY}`
    //   }
    // }) as any;

    // const to = await axios({
    //   url: 'https://dapi.kakao.com/v2/local/geo/transcoord.json',
    //   method: "GET",
    //   params: {
    //     y: coord.data.documents[0].y,
    //     x: coord.data.documents[0].x,
    //     input_coord: "WGS84",
    //     output_coord: "WCONGNAMUL"
    //   },
    //   headers: {
    //     Authorization: `KakaoAK ${process.env.KAKAO_KEY}`
    //   }
    // }) as any;
    // return res.json(util.successTrue("",data.data.documents[0]))
    // let distanceData:any;
    // let fee: any;
    //  axios({
    //   url: 'https://map.kakao.com/route/walkset.json',
    //   method: "GET",
    //   params: {
    //     sX: from.data.documents[0].x,
    //     sY: from.data.documents[0].y,
    //     eX: to.data.documents[0].x,
    //     eY: to.data.documents[0].y,
    //     ids: ','
    //   }
    // }).then((data)=>{
    //   console.log(data.data.directions.length)
    //   fee = parseInt(data.data.directions.length);
    // }).catch(()=>{

    const fee = functions.getDistanceFromLatLonInKm(address.locX, address.locY, coord.data.documents[0].y, coord.data.documents[0].x);
    // console.log(fee)
    // const fee = distanceData;
    // })

    cost += 550 * Math.floor(fee / 0.5);

    const data = {
      userId: tokenData.id,
      gender: gender, // 0이면 random, 1이면 남자 2면 여자
      address: address.address,
      detailAddress: address.detailAddress,
      locX: address.locX,
      locY: address.locY,
      // store 쪽 구현 아직 안되어서
      storeName: reqBody.storeName,
      storeX: coord.data.documents[0].y,
      storeY: coord.data.documents[0].x,
      storeAddress: reqBody.storeAddress,
      storeDetailAddress: reqBody.storeDetailAddress,
      chatId: reqBody.chatId ? reqBody.chatId : null,
      // 이거 계산하는거 추가하기 @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
      expArrivalTime: today,
      orderStatus: 0,
      hotDeal: reqBody.hotDeal === "1" ? true : false,
      // hotDeal 계산된 금액(소비자한테 알려줘야함)
      totalCost: 0,
      cost: 0,
      content: reqBody.content,
      categoryName: reqBody.categoryName,
      deliveryFee: cost,
      reservation: reqBody.reservation
    };
    const order = await orderRep.create(data);
    if (gender >= 1) {
      const riders = await userRep.findAll({ where: { id: { [db.Op.ne]: tokenData.id }, grade: [2, 3], gender: gender } });
      for (let i = 0; i < riders.length; i++) {
        registrationToken = riders[i].firebaseFCM;
        console.log(i, '+', riders[i].name);
        const message = {
          notification:{
            "title":"배달 건이 추가되었습니다.",
            "tag": "delivery",
            "body":order.storeName,
          },
          data:{
            type:'ManageDelivery',
            //여기에 관련 데이터 넣으면 될듯
          },
          token: registrationToken
        };
        admin.messaging().send(message)
          .then((response) => {
            console.log('Successfully sent message:', response);
          })
          .catch((error) => {
            console.log('Error sending message:', error);
          });
      }
    }
    else {
      const riders = await userRep.findAll({ where: { id: { [db.Op.ne]: tokenData.id }, grade: [2, 3] } });
      for (let i = 0; i < riders.length; i++) {
        registrationToken = riders[i].firebaseFCM;
        console.log(i, '+', registrationToken);
        const message = {
          notification:{
            "title":"배달 건이 추가되었습니다.",
            "tag": "delivery",
            "body":order.storeName,
          },
          data:{
            type:'ManageDelivery'
          },
          token: registrationToken
        };
        admin.messaging().send(message)
          .then((response) => {
            console.log('Successfully sent message:', response);
          })
          .catch((error) => {
            console.log('Error sending message:', error);
          });
      }
    }
    return res.json(util.successTrue("", order));
  } catch (err) {
    return res.status(403).json(util.successFalse(err, "", null));
  }
});

order.get('/', util.isLoggedin, async function (req: Request, res: Response) {
  //주문 확인
  try {
    const _order = await orderRep.findOne({
      where: {
        id: req.query.orderId as string
      }
    });
    if (!_order) return res.status(403).json(util.successFalse(null, "주문건이 없습니다.", null));
    return res.json(util.successTrue("", _order));
  } catch (err) {
    return res.status(403).json(util.successFalse(err, "", null));
  }
});

order.get('/riders', util.isLoggedin, async function (req: Request, res: Response) {
  //신청 배달원 목록 반환
  try {
    const order = await orderRep.findOne({ where: { id: req.query.orderId as string } });
    if (!order) return res.status(403).json(util.successFalse(null, "해당하는 주문이 없습니다.", null));
    if (parseInt(order.orderStatus) != 0) return res.status(403).json(util.successFalse(null, "배달원 모집이 완료된 주문입니다.", null));
    const riderlist = myCache.get(req.query.orderId as string) as any;
    if (riderlist == undefined) { return res.json(util.successTrue("배달을 희망하는 배달원이 없습니다.", null)); }
    return res.json(util.successTrue("", riderlist));
  } catch (err) {
    return res.status(403).json(util.successFalse(err, "", null));
  }
});

order.post('/rider', util.isLoggedin, async function (req: Request, res: Response) {
  //배달원 선택
  const tokenData = req.decoded;
  const reqBody = req.body;
  const riderId = parseInt(reqBody.riderId);
  try {
    const order = await orderRep.findOne({
      where: {
        id: req.query.orderId as string
      }
    });
    let registrationToken;
    if (!order) return res.status(403).json(util.successFalse(null, "해당하는 주문이 없습니다.", null));
    const riderlist = myCache.get(req.query.orderId as string) as classes.Rider[];
    if (riderlist == undefined) return res.status(403).json(util.successFalse(null, "배달을 희망하는 배달원이 없습니다.", null));
    const rider = riderlist.filter(rider => rider.riderId == riderId)[0];
    if (!rider) return res.status(403).json(util.successFalse(null, "해당하는 배달원이 존재하지 않습니다.", null));
    const rider_fire = await userRep.findOne({ where: { id: riderId } });
    if (!rider_fire) res.status(403).json(util.successFalse(null, "해당하는 배달원이 존재하지 않습니다.", null));
    else { registrationToken = rider_fire.firebaseFCM; }
    if (registrationToken == undefined) res.status(403).json(util.successFalse(null, "해당하는 배달원이 존재하지 않습니다.", null));
    else {
      const room = await roomRep.create({
        orderId: order.id,
        owner: tokenData.nickName,
        ownerId: tokenData.id,
        riderId: rider.riderId,
        roomId: crypto.randomBytes(256).toString('hex').substr(100, 50)
      });
      order.update({
        riderId: rider.riderId,
        extraFee: rider.extraFee,
        orderStatus: 1,
        chatId: room.id
      });
      myCache.del(req.query.orderId as string);
      const message = {
        notification:{
          "title":"배달원으로 선발되었습니다.",
          "body":"확인해보세요.",
        },
        data: {
          orderId: order.id.toString(),
          roomId: room.roomId,
          userId: room.ownerId.toString(),
          riderId: room.riderId.toString(),
          type:'selected'
        },
        token: registrationToken
      };
      admin.messaging().send(message)
        .then((response) => {
          console.log('Successfully sent message:', response);
        })
        .catch((error) => {
          console.log('Error sending message:', error);
        });
      return res.json(util.successTrue("", {order:order,room:room}));
    }
  } catch (err) {
    return res.status(403).json(util.successFalse(err, "", null));
  }
});

order.get('/chat', util.isLoggedin, async function (req: Request, res: Response) {
  //주문에 대한 채팅을 위한 주소 반환
  //필요없을 수도... 주문 등록 할때 반환해도 될 수도..
  const tokenData = req.decoded;
  // const reqBody = req.query;
  try {
    //작성
    const order = await orderRep.findOne({
      where: {
        id: req.query.orderId as string,
      }
    });
    if (!order) return res.status(403).json(util.successFalse(null, "해당하는 주문이 없습니다.", null));
    let room;
    if (parseInt(tokenData.grade) <= 2)
      room = await roomRep.findOne({
        where: {
          orderId: order.id,
          userId: tokenData.id
        }
      });
    else if (tokenData.grade == "3")
      room = await roomRep.findOne({
        where: {
          orderId: order.id,
          riderId: order.riderId
        }
      });
    if (!room) return res.status(403).json(util.successFalse(null, "해당하는 주문이 없습니다.", null));
    return res.json(util.successTrue("", { roomId: room.roomId }));
  } catch (err) {
    return res.status(403).json(util.successFalse(err, "", null));
  }
});

order.get('/price', util.isLoggedin, async function (req: Request, res: Response) {
  //최종 결제 금액 반환
  // const tokenData = req.decoded;
  // const reqBody = req.body;
  try {
    //작성
  } catch (err) {
    return res.status(403).json(util.successFalse(err, "", null));
  }
});

order.post('/price', util.isLoggedin, util.isRider, async function (req: Request, res: Response) {
  //배달원이 최종 결제 금액 전송
  // const tokenData = req.decoded;
  // const reqBody = req.body;
  try {
    //작성
  } catch (err) {
    return res.status(403).json(util.successFalse(err, "", null));
  }
});

order.post('/review/user', util.isLoggedin, util.isRider, async function (req: Request, res: Response) {
  //유저에 대한 리뷰 작성
  const tokenData = req.decoded;
  const reqBody = req.body;
  try {
    const _order = await orderRep.findOne({
      where: {
        id: reqBody.orderId,
        riderId: tokenData.id,
        orderStatus: 3,
        reviewedByRider: false
      }
    });
    if (_order === null) return res.status(403).json(util.successFalse(null, "주문건이 없거나, 이미 리뷰를 작성했습니다.", null));
    const review = await reviewRep.create({
      orderId: _order?.id,
      userId: _order?.userId,
      riderId: _order?.riderId,
      fromId: tokenData.id,
      rating: reqBody.rating,
      content: reqBody.content
    });
    _order.update({reviewedByRider:true});
    return res.json(util.successTrue("", review));
  } catch (err) {
    return res.status(403).json(util.successFalse(err, "", null));
  }
});

order.get('/review/user', util.isLoggedin, util.isRider, async function (req: Request, res: Response) {
  //유저에 대한 리뷰 확인
  // const tokenData = req.decoded;
  const reqBody = req.query;
  try {
    //작성
    const _user = await userRep.findOne({
      where: {
        id: reqBody.userId as string
      }
    });
    if (_user === null) return res.status(403).json(util.successFalse(null, "사용자가 없거나 권한이 없습니다.", null));
    const _order = await orderRep.findOne({
      where: {
        id: reqBody.orderId as string,
        orderStatus: 0
      }
    });
    if (_order === null) return res.status(403).json(util.successFalse(null, "사용자가 없거나 권한이 없습니다.", null));
    const reviews = await reviewRep.findAll({
      where: {
        userId: _user?.id as any,
        fromId: { [db.Op.ne]: _user?.id }
      }
    });
    const rating = reviews.reduce((sum, cur) => sum + cur.rating, 0);
    return res.json(util.successTrue("", {
      rating: rating / reviews.length,
      reviews: reviews
    }));
  } catch (err) {
    return res.status(403).json(util.successFalse(err, "", null));
  }
});

order.post('/review/rider', util.isLoggedin, async function (req: Request, res: Response) {
  //라이더에 대한 리뷰 작성
  const tokenData = req.decoded;
  const reqBody = req.body;
  try {
    const _order = await orderRep.findOne({
      where: {
        id: reqBody.orderId,
        userId: tokenData.id,
        orderStatus: 3,
        reviewedByUser: false
      }
    });
    if (_order === null) return res.status(403).json(util.successFalse(null, "주문건이 없거나, 이미 리뷰를 작성했습니다.", null));
    const review = await reviewRep.create({
      orderId: _order?.id,
      userId: _order?.userId,
      riderId: _order?.riderId,
      fromId: tokenData.id,
      rating: reqBody.rating,
      content: reqBody.content
    });
    _order.update({reviewedByUser:true});
    return res.json(util.successTrue("", review));
  } catch (err) {
    return res.status(403).json(util.successFalse(err, "", null));
  }
});

order.get('/review/rider', util.isLoggedin, async function (req: Request, res: Response) {
  //라이더에 대한 리뷰 확인
  // const tokenData = req.decoded;
  const reqBody = req.query;
  try {
    //작성
    const _user = await userRep.findOne({
      where: {
        id: reqBody.riderId as string
      }
    });
    if (_user === null) return res.status(403).json(util.successFalse(null, "사용자가 없거나 권한이 없습니다.", null));
    const _order = await orderRep.findOne({
      where: {
        id: reqBody.orderId as string,
        orderStatus: 0
      }
    });
    if (_order === null) return res.status(403).json(util.successFalse(null, "사용자가 없거나 권한이 없습니다.", null));
    const reviews = await reviewRep.findAll({
      where: {
        riderId: _user?.id as any,
        fromId: { [db.Op.ne]: _user?.id }
      }
    });
    const rating = reviews.reduce((sum, cur) => sum + cur.rating, 0);
    return res.json(util.successTrue("", {
      rating: rating / reviews.length,
      reviews: reviews
    }));
  } catch (err) {
    return res.status(403).json(util.successFalse(err, "", null));
  }
});

order.get('/orders', util.isLoggedin, util.isRider, async function (req: Request, res: Response) {
  //배달원이 찾을 배달거리 리스트 반환
  const tokenData = req.decoded;
  // const reqBody = req.body;
  try {
    //작성
    const rider = await userRep.findOne({
      where: {
        id: tokenData.id
      }
    });
    if (rider === null) return res.status(403).json(util.successFalse(null, "사용자가 없거나 권한이 없습니다.", null));
    const orders = await orderRep.findAll({
      where: {
        userId: { [db.Op.ne]: tokenData.id },
        orderStatus: 0,
        gender: [0, rider?.gender as any]
      }
    });
    return res.json(util.successTrue("", { length: orders.length, orders: orders }));
  } catch (err) {
    return res.status(403).json(util.successFalse(err, "", null));
  }
});

////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////
////                              개발용 API입니다. 나중에는 지워야 합니다.                              ////
////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////
order.get('/setDelivered', util.isLoggedin, util.isRider, async function (req: Request, res: Response) {
  //배달원이 찾을 배달거리 리스트 반환
  // const tokenData = req.decoded;
  const reqBody = req.query;
  try {
    //작성
    const order = await orderRep.findOne({
      where: {
        id: reqBody.orderId as string,
        orderStatus: 0
      }
    });
    if (!order) return res.json(util.successFalse(null, "주문이 없습니다.", null));
    order?.update({
      orderStatus: 3
    });
    return res.json(util.successTrue("", order));
  } catch (err) {
    return res.status(403).json(util.successFalse(err, "", null));
  }
});


order.post('/apply', util.isLoggedin, util.isRider, async function (req: Request, res: Response) {
  // 배달원이 해당 주문에 배달원 신청
  const tokenData = req.decoded;
  const reqBody = req.body;
  let orderStatus;
  let registrationToken;
  // 해당 주문 번호
  const order = await orderRep.findOne({ where: { id: req.query.orderId as string } });
  if (!order) return res.status(403).json(util.successFalse(null, "주문 건이 없습니다.", null));
  else { orderStatus = parseInt(order?.orderStatus); }
  if (orderStatus != 0) return res.status(403).json(util.successFalse(null, "배달원 모집이 끝난 주문입니다.", null));
  if (order.userId == tokenData.id) return res.status(403).json(util.successFalse(null, "본인의 주문에 배달원 지원은 불가능합니다.", null));
  const riderId = tokenData.id;
  const user = await userRep.findOne({ where: { id: order.userId } });
  if (!user) return res.status(403).json(util.successFalse(null, "해당 주문의 주문자가 존재하지 않습니다.", null));
  // eslint-disable-next-line prefer-const
  registrationToken = user.firebaseFCM;
  let extraFee;
  extraFee = parseInt(reqBody.extraFee);
  if (!reqBody.extraFee) extraFee = 0;
  let riderlist = myCache.get(req.query.orderId as string) as classes.Rider[];
  if (riderlist == undefined) { myCache.set(req.query.orderId as string, [{ riderId: riderId, extraFee: extraFee }]); }
  else {
    const rider = riderlist.filter(rider => rider.riderId == riderId)[0];
    if (rider) return res.status(403).json(util.successFalse(null, "이미 배달 신청한 주문입니다.", null));

    riderlist = myCache.take(req.query.orderId as string) as classes.Rider[];
    riderlist.push({ riderId: riderId, extraFee: extraFee });
    myCache.set(req.query.orderId as string, riderlist);
  }
  const message = {
    data: {
      test: "추가 배달원이 배정되었습니다."
    },
    token: registrationToken
  };
  admin.messaging().send(message)
    .then((response) => {
      console.log('Successfully sent message:', response);
    })
    .catch((error) => {
      console.log('Error sending message:', error);
    });
  return res.json(util.successTrue("", riderlist));
});

order.get('/orderList', util.isLoggedin, async function (req: any, res: Response) {
  //현재 주문 중인 주문 내용 받아오기 (소비자)
  const tokenData = req.decoded;
  const reqBody = req.query;
  try {
    //작성
    const orderList = await orderRep.findAll({
      where: {
        userId: tokenData.id
      },
      order: [['orderStatus', 'ASC'], ['id', 'ASC']]
    });
    if (!orderList) return res.json(util.successFalse(null, "주문 내역이 없습니다", null));
    return res.json(util.successTrue("", orderList));
  } catch (err) {
    return res.status(403).json(util.successFalse(err, "", null));
  }
});

order.get('/deliverList', util.isLoggedin, util.isRider, async function (req: any, res: Response) {
  //현재 배달 중인 배달 내용 받아오기 (배달원)
  const tokenData = req.decoded;
  const reqBody = req.query;
  try {
    //작성
    const deliverList = await orderRep.findAll({
      where: {
        riderId: tokenData.id
      },
      order: [['orderStatus', 'ASC'], ['id', 'ASC']]
    });
    if (!deliverList) return res.json(util.successFalse(null, "배달 내역이 없습니다", null));
    return res.json(util.successTrue("", deliverList));
  } catch (err) {
    return res.status(403).json(util.successFalse(err, "", null));
  }
});

order.post('/pay', util.isLoggedin,async (req:Request,res:Response)=>{
  const tokenData = req.decoded;
  const reqQuery = req.query;
  const reqBody = req.body;
  let price = parseInt(reqBody.price);
  if(!parseInt(reqBody.price) || !parseInt(reqBody.riderId))
    return res.status(403).json(util.successFalse(null,"Error", null));
  const order = await orderRep.findOne({where:{id:reqQuery.orderId as string}});
  if(!order) return res.status(403).json(util.successFalse(null,"Error", null));
  const user = await userRep.findOne({where:{id:tokenData.id}});
  if(!user) return res.status(403).json(util.successFalse(null,"Error", null));
  const rider = await userRep.findOne({where:{id:reqBody.riderId}});
  if(!rider) return res.status(403).json(util.successFalse(null,"Error", null));
  const points = await pointRep.findAll(
    {where:{
      userId:tokenData.id,
    },
    order: [['expireAt', 'ASC']]
    });
  const sum = points.reduce((sum, cur) => {
    console.log(cur.point+" "+cur.expireAt);
    return sum + cur.point;
  }, 0);
    // 결제액 부족. 결제창으로 이동
  if(sum-parseInt(reqBody.price) < 0) 
    return res.status(403).json(util.successFalse(null,"Not enough money", null));
        
  points.some((point)=>{
    if(price){
      const curPoint = point.point;
      if(price<=point.point){
        point.update({point:curPoint-price});
        price=0;
        return true;
      }
      else {
        point.update({point:0});
        point.destroy();
        price-=curPoint;
        return false;
      }
    }
    else return true;
  });
  const today = new Date();
  today.setFullYear(today.getFullYear()+3,today.getMonth(),today.getDay());
  pointRep.create({
    pointKind: 0,
    status:0,
    expireAt:today,
    userId:reqBody.riderId,
    point: parseInt(reqBody.price)
  });
  order.update({orderStatus:2});
  return res.json(util.successTrue("",null));
});

order.get('/complete', util.isLoggedin, util.isRider, async function (req: any, res: Response) {
  // ordetStatus:2 인 상태에서 배달원이 배달 완료 버튼 누르면 3으로 변경
  // 허위로 누르게 되면 신고
  const tokenData = req.decoded;
  const reqBody = req.query;
  try {
    const order = await orderRep.findOne({where:{
      id: req.query.orderId,
      riderId: tokenData.riderId,
      orderStatus: 2
    }});
    if (!order) return res.json(util.successFalse(null, "주문 내역이 없거나 배달 완료 처리할 수 없습니다.", null));
    order.update({orderStatus:3});
    return res.json(util.successTrue("", order));
  } catch (err) {
    return res.status(403).json(util.successFalse(err, "", null));
  }
});