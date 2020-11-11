import { NextFunction, Request, Response, Router } from "express";
import * as functions from "../config/functions";
import * as util from "../config/util";
import { pointRep, userRep } from "../models/index";
import db from 'sequelize';
import * as admin from "firebase-admin";
import User from "../models/user";

import jwt from "jsonwebtoken";
import passport from "passport";

import dotenv from "dotenv";
dotenv.config();

export const point = Router();
// 포인트 반환
// 포인트 차감
// 포인트 추가 - 
point.get('/', util.isLoggedin, async (req:Request,res:Response)=>{
  const tokenData = req.decoded;
  const point = await pointRep.findAll({where:{userId:tokenData.id,status:false}});
  const sum = point.reduce((sum, cur) => sum + cur.point, 0);
  console.log(sum);
  if(sum<0) return res.status(403).json(util.successFalse(null,"Error", null));
  return res.json(util.successTrue("",{point:sum.toString()}));
});

point.post('/', util.isLoggedin,async (req:Request,res:Response)=>{
  const reqBody = req.body;
  const tokenData = req.decoded;
  //결제 검증 프로세스 있어야함.
  const user = await userRep.findOne({where:{id:tokenData.id}});
  if(!user) return res.status(403).json(util.successFalse(null,"Error", null));
  const today = new Date();
  today.setFullYear(today.getFullYear()+3,today.getMonth(),today.getDay());
  const newPoint = await pointRep.create({
    point:reqBody.point,
    pointKind: 0,
    userId: tokenData.id,
    status:0,
    expireAt:today
  });
  return res.json(util.successTrue("",null));
});

point.post('/pay', util.isLoggedin,async (req:Request,res:Response)=>{
  const tokenData = req.decoded;
  const reqBody = req.body;
  let price = parseInt(reqBody.price);
  if(!parseInt(reqBody.price) || !parseInt(reqBody.riderId))
    return res.status(403).json(util.successFalse(null,"Error", null));
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
  return res.json(util.successTrue("",null));
});

// point.post('/withdraw', util.isLoggedin,async (req:Request,res:Response)=>{

// });