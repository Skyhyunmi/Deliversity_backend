import { NextFunction, Response, Router } from "express";
import * as util from "../config/util";
import { userRep, addressRep, qnaRep, reportRep, orderRep } from "../models/index";
import * as crypto from "crypto";
import * as proj4 from "proj4";
import dotenv from "dotenv";
dotenv.config();

export const myinfo = Router();
const epsg_5181=proj4.Proj("+proj=tmerc +lat_0=38 +lon_0=127 +k=1 +x_0=200000 \
                            +y_0=500000 +ellps=GRS80 +units=m +no_defs");
const grs80 = proj4.Proj("+proj=tmerc +lat_0=38 +lon_0=127.5 +k=0.9996 \
                          +x_0=1000000 +y_0=2000000 +ellps=GRS80 +units=m +no_defs"); //도로명주소 제공 좌표 5179
const wgs84 = proj4.Proj("EPSG:4326"); //경위도
myinfo.get('/', util.isLoggedin,util.isAdmin, async function (req: any, res: Response, next: NextFunction) {
//본인 정보 반환
  const tokenData = req.decoded;
  try{
    const _user = await userRep.findOne({
      where:{
        id:tokenData.id
      }
    });
    if(!_user) return res.status(403).json(util.successFalse(null,"해당 하는 유저가 없습니다.",null));
    const user = {
      id:_user.id,
      userId:_user.userId,
      name:_user.name,
      nickName:_user.nickName,
      gender:_user.gender,
      age:_user.age,
      email:_user.email,
      phone:_user.phone,
      addressId:_user.addressId,
      grade:_user.grade,
      createdAt:_user.createdAt,
      updatedAt:_user.updatedAt
    };
    return res.json(util.successTrue("",user));
  }catch(err){
    return res.status(403).json(util.successFalse(err,"",null));
  }
});

myinfo.put('/', util.isLoggedin, async function (req: any, res: Response, next: NextFunction) {
//본인 정보 수정
  const tokenData = req.decoded;
  const reqBody = req.body;
  let salt=null,hashedPw=null;
  try{
    const _user = await userRep.findOne({
      where:{
        id:tokenData.id
      }
    });
    if(!_user) return res.status(403).json(util.successFalse(null,"해당 하는 유저가 없습니다.",null));
    if(reqBody.pw){
      const buffer = crypto.randomBytes(64);
      salt = buffer.toString('base64');
      const key = crypto.pbkdf2Sync(reqBody.pw, salt, 100000, 64, 'sha512');
      hashedPw = key.toString('base64');
    }
    if(reqBody.nickName){
      const nickExist = await userRep.findOne({
        where: {
          nickName: reqBody.nickName
        }
      });
      if(nickExist) return res.status(403).json(util.successFalse(null,"nickName duplicated.",null));
    }
    _user.update({
      password:hashedPw?hashedPw:_user.password,
      salt:salt?salt:_user.salt,
      nickName:reqBody.nickName?reqBody.nickName:_user.nickName
    });
    const user = {
      id:_user.id,
      userId:_user.userId,
      name:_user.name,
      nickName:_user.nickName,
      gender:_user.gender,
      age:_user.age,
      email:_user.email,
      phone:_user.phone,
      addressId:_user.addressId,
      grade:_user.grade,
      createdAt:_user.createdAt,
      updatedAt:_user.updatedAt
    };
    return res.json(util.successTrue("",user));
  }catch(err){
    return res.status(403).json(util.successFalse(err,"",null));
  }
});

myinfo.get('/address/list', util.isLoggedin, async function (req: any, res: Response, next: NextFunction) {
  //자기 주소 리스트 반환
  const tokenData = req.decoded;
  try {
    const addressList = await addressRep.findAll({
      where: {
        userId: tokenData.id
      }
    });
    if (!addressList) return res.status(403).json(util.successFalse(null, "해당 하는 주소가 없습니다.", null));
    return res.json(util.successTrue("", addressList));
  } catch (err) {
    return res.status(403).json(util.successFalse(err, "", null));
  }
});

myinfo.put('/address/set', util.isLoggedin, async function (req: any, res: Response, next: NextFunction) {
  //기본 주소 설정
  const tokenData = req.decoded;
  const reqBody = req.body;
  try {
    const user = await userRep.findOne({
      where: {
        id: tokenData.id
      }
    });
    if (!user) return res.status(403).json(util.successFalse(null, "해당 하는 유저가 없습니다.", null));
    const address = await addressRep.findOne({
      where: {
        id: reqBody.addressId,
        userId: tokenData.id
      }
    });
    if (!address) return res.status(403).json(util.successFalse(null, "해당 하는 주소가 없습니다.", null));

    user.update({
      addressId: reqBody.addressId
    });
    return res.json(util.successTrue("", address));
  } catch (err) {
    return res.status(403).json(util.successFalse(err, "", null));
  }
});

myinfo.get('/address', util.isLoggedin, async function (req: any, res: Response, next: NextFunction) {
  //기본 주소 반환
  const tokenData = req.decoded;
  try {
    const user = await userRep.findOne({
      where: {
        id: tokenData.id
      }
    });
    if (!user) return res.status(403).json(util.successFalse(null, "해당 하는 유저가 없습니다.", null));
    const address = await addressRep.findOne({
      where: {
        id: user.addressId,
        userId: tokenData.id
      }
    });
    if (!address) return res.status(403).json(util.successFalse(null, "해당 하는 주소가 없습니다.", null));
    return res.json(util.successTrue("", address));
  } catch (err) {
    return res.status(403).json(util.successFalse(err, "", null));
  }
});

myinfo.post('/address', util.isLoggedin, async function (req: any, res: Response, next: NextFunction) {
  //주소 추가
  const tokenData = req.decoded;
  const reqBody = req.body;
  try {
    //작성
    const p = proj4.toPoint([reqBody.locX,reqBody.locY]);
    const result = proj4.transform(grs80,wgs84,p); //도로명주소 API 좌표를 위도, 경도로 변환
    const address = await addressRep.create({
      userId: tokenData.id,
      address: reqBody.address,
      detailAddress: reqBody.detailAddress,
      // locX: result.x,
      // locY: result.y
      locX: reqBody.locX,
      locY: reqBody.locY
    });
    if (reqBody.setDefault == "1") {
      userRep.update({
        addressId: address.id
      }, {
        where: {
          id: tokenData.id
        }
      });
    }
    return res.json(util.successTrue("", address));
  } catch (err) {
    return res.status(403).json(util.successFalse(err, "", null));
  }
});

myinfo.put('/address', util.isLoggedin, async function (req: any, res: Response, next: NextFunction) {
  //주소 변경
  const tokenData = req.decoded;
  const reqBody = req.body;
  try {
    const p = proj4.toPoint([reqBody.locX,reqBody.locY]); //월드컵로 206
    const result = proj4.transform(grs80,wgs84,p); //도로명주소 API 좌표를 위도, 경도로 변환
    const old = await addressRep.findOne({
      where: {
        id: reqBody.addressId
      }
    });
    if (!old) return res.status(403).json(util.successFalse(null, "해당 하는 주소가 없습니다.", null));
    const address = await addressRep.update({
      detailAddress: reqBody.detailAddress ? reqBody.detailAddress : old.detailAddress,
    }, {
      where: {
        id: reqBody.addressId
      }
    });
    return res.json(util.successTrue("", address));
  } catch (err) {
    console.log(err);
    return res.status(403).json(util.successFalse(err, "?", null));
  }
});

myinfo.delete('/address', util.isLoggedin, async function (req: any, res: Response, next: NextFunction) {
  //주소 삭제
  const tokenData = req.decoded;
  const reqBody = req.body;
  try{
    const address = await addressRep.findOne({
      where:{
        id: reqBody.addressId
      }
    });
    if(!address) return res.json(util.successFalse(null,"Deletion Failure.",null));
    address.destroy().then(()=>res.json(util.successTrue("Deletion Success.",null)));

  }catch(err){
    return res.status(403).json(util.successFalse(err,"",null));
  }
});

myinfo.post('/report', util.isLoggedin, async function (req: any, res: Response, next: NextFunction) {
  //신고 접수(req: reportKind, orderId, content, chat포함여부)
  const tokenData = req.decoded;
  const reqBody = req.body;
  try {
    const order = await orderRep.findOne({
      where: { id: reqBody.orderId }
    });
    if(!order) return res.status(403).json(util.successFalse(null, "해당하는 주문이 없습니다.", null));
    const userId = order.userId;
    const riderId = order.riderId;
    const chatId = order.chatId;
    const report = await reportRep.create({
      userId: userId,
      riderId: riderId,
      reportKind: reqBody.reportKind,
      orderId: reqBody.orderId,
      fromId: tokenData.id,
      chatId: reqBody.upload_chat==1?chatId:null,
      content: reqBody.content
    });
    return res.json(util.successTrue("", report));
  } catch (err) {
    return res.status(403).json(util.successFalse(err, "", null));
  }
});

myinfo.post('/qna', util.isLoggedin, async function (req: any, res: Response, next: NextFunction) {
  //질문 접수 (id, qnakind, userId, content, answer)
  const tokenData = req.decoded;
  const reqBody = req.body;
  try {
    const qna = await qnaRep.create({
      userId: tokenData.id,
      qnakind: reqBody.qnakind,
      content: reqBody.content
    });
    return res.json(util.successTrue("", qna));
  } catch (err) {
    return res.status(403).json(util.successFalse(err, "", null));
  }
});

myinfo.post('/upload',util.isLoggedin, async function (req: any, res: Response, next: NextFunction) {
  const tokenData = req.decoded;
  const reqBody = req.body;
  try {
    const user = await userRep.findOne({where:{userId:tokenData.userId}});
    if (!user) return res.status(403).json(util.successFalse(null, "해당 하는 유저가 없습니다.", null));
    if (user.grade>1) return res.status(403).json(util.successFalse(null, "이미 신분확인이 완료되었습니다.", null));
    if (user.grade==1) return res.status(403).json(util.successFalse(null, "신분 확인 대기중입니다.", null));
    user.update({
      grade:1,
      idCard:reqBody.idCard
    });
    return res.json(util.successTrue("", {grade:user.grade, idCard:user.idCard}));
  } catch (err) {
    return res.status(403).json(util.successFalse(err, "", null));
  }
});

myinfo.post('/toRider',util.isLoggedin, util.isUser, async function (req: any, res: Response, next: NextFunction) {
  const tokenData = req.decoded;
  try {
    const user = await userRep.findOne({where:{userId:tokenData.userId}});
    if (!user) return res.status(403).json(util.successFalse(null, "해당 하는 유저가 없습니다.", null));
    user.update({grade:3});
    return res.json(util.successTrue("", {grade:user.grade}));
  } catch (err) {
    return res.status(403).json(util.successFalse(err, "", null));
  }
});

myinfo.post('/toUser',util.isLoggedin, util.isRider, async function (req: any, res: Response, next: NextFunction) {
  const tokenData = req.decoded;
  try {
    const user = await userRep.findOne({where:{userId:tokenData.userId}});
    if (!user) return res.status(403).json(util.successFalse(null, "해당 하는 유저가 없습니다.", null));
    user.update({grade:2});
    return res.json(util.successTrue("", {grade:user.grade}));
  } catch (err) {
    return res.status(403).json(util.successFalse(err, "", null));
  }
});

////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////
////                              개발용 API입니다. 나중에는 지워야 합니다.                              ////
////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////
myinfo.get('/grade',util.isLoggedin, async function (req: any, res: Response, next: NextFunction) {
  const tokenData = req.decoded;
  const reqQuery = req.query;
  try {
    const user = await userRep.findOne({where:{userId:tokenData.userId}});
    if (!user) return res.status(403).json(util.successFalse(null, "해당 하는 유저가 없습니다.", null));
    if (reqQuery.grade==null||reqQuery.grade=="") return res.status(403).json(util.successFalse(null, "파라미터가 부족합니다.", null));
    if(reqQuery.grade >= 4) return res.json(util.successTrue(`4이상으로 올라 갈 수 없습니다.`, null));
    user.update({grade:reqQuery.grade});
    return res.json(util.successTrue("", {grade:user.grade}));
  } catch (err) {
    return res.status(403).json(util.successFalse(err, "", null));
  }
});
////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////