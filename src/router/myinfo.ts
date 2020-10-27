import { NextFunction, Response, Router } from "express";
import * as util from "../config/util";
import { userRep, addressRep } from "../models/index";
import * as crypto from "crypto";
import dotenv from "dotenv";
dotenv.config();

export const myinfo = Router();

myinfo.get('/', util.isLoggedin, async function (req: any, res: Response, next: NextFunction) {
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
  try{
    const addressList = await addressRep.findAll({
      where:{
        userId:tokenData.id
      }
    });
    if(!addressList) return res.status(403).json(util.successFalse(null,"해당 하는 주소가 없습니다.",null));
    return res.json(util.successTrue("",addressList));
  }catch(err){
    return res.status(403).json(util.successFalse(err,"",null));
  }
});

myinfo.put('/address/set', util.isLoggedin, async function (req: any, res: Response, next: NextFunction) {
//기본 주소 설정
  const tokenData = req.decoded;
  const reqBody = req.body;
  try{
    const user = await userRep.findOne({
      where:{
        id:tokenData.id
      }
    });
    if(!user) return res.status(403).json(util.successFalse(null,"해당 하는 유저가 없습니다.",null));
    const address = await addressRep.findOne({
      where: {
        id: reqBody.addressId,
        userId: tokenData.id
      }
    });
    if(!address) return res.status(403).json(util.successFalse(null,"해당 하는 주소가 없습니다.",null));

    user.update({
      addressId:reqBody.addressId
    });
    return res.json(util.successTrue("",address));
  }catch(err){
    return res.status(403).json(util.successFalse(err,"",null));
  }
});

myinfo.get('/address', util.isLoggedin, async function (req: any, res: Response, next: NextFunction) {
//기본 주소 반환
  const tokenData = req.decoded;
  try{
    const user = await userRep.findOne({
      where:{
        id:tokenData.id
      }
    });
    if(!user) return res.status(403).json(util.successFalse(null,"해당 하는 유저가 없습니다.",null));
    const address = await addressRep.findOne({
      where: {
        id: user.addressId,
        userId: tokenData.id
      }
    });
    if(!address) return res.status(403).json(util.successFalse(null,"해당 하는 주소가 없습니다.",null));
    return res.json(util.successTrue("",address));
  }catch(err){
    return res.status(403).json(util.successFalse(err,"",null));
  }
});

myinfo.post('/address', util.isLoggedin, async function (req: any, res: Response, next: NextFunction) {
//주소 추가
  const tokenData = req.decoded;
  const reqBody = req.body;
  console.log(tokenData);
  try{
    //작성
    const address = await addressRep.create({
      userId:tokenData.id,
      address:reqBody.address,
      detailAddress:reqBody.detailAddress,
      locX:reqBody.locX,
      locY:reqBody.locY
    });
    if(reqBody.setDefault=="1"){
      userRep.update({
        addressId:address.id
      },{
        where:{
          id: tokenData.id
        }
      });
    }
    return res.json(util.successTrue("",address));
  }catch(err){
    return res.status(403).json(util.successFalse(err,"",null));
  }
});

myinfo.put('/address', util.isLoggedin, async function (req: any, res: Response, next: NextFunction) {
//주소 변경
  const tokenData = req.decoded;
  const reqBody = req.body;
  try{
    const old = await addressRep.findOne({
      where:{
        id: reqBody.addressId
      }
    });
    if(!old) return res.status(403).json(util.successFalse(null,"해당 하는 주소가 없습니다.",null));
    const address = await addressRep.update({
      address:reqBody.address ? reqBody.address: old.address,
      detailAddress:reqBody.detailAddress ? reqBody.detailAddress: old.detailAddress,
      locX:reqBody.locX ? reqBody.locX: old.locX,
      locY:reqBody.locY ? reqBody.locY: old.locY
    },{
      where:{
        id: reqBody.addressId
      }
    });
    return res.json(util.successTrue("",address));
  }catch(err){
    console.log(err);
    return res.status(403).json(util.successFalse(err,"?",null));
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
//신고 접수
  const tokenData = req.decoded;
  const reqBody = req.body;
  try{
    //작성
  }catch(err){
    return res.status(403).json(util.successFalse(err,"",null));
  }
});

myinfo.post('/qna', util.isLoggedin, async function (req: any, res: Response, next: NextFunction) {
//질문 접수
  const tokenData = req.decoded;
  const reqBody = req.body;
  try{
    //작성
  }catch(err){
    return res.status(403).json(util.successFalse(err,"",null));
  }
});