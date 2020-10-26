import { NextFunction, Response, Router } from "express";
import * as util from "../config/util";
import { userRep, addressRep } from "../models/index";
import dotenv from "dotenv";
dotenv.config();

export const myinfo = Router();

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
    addressRep.destroy({
      where:{
        id: reqBody.addressId
      }
    }).then(()=> res.json(util.successTrue("Deletion Success.",null)));
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