import { NextFunction, Request, Response, Router } from "express";
import * as functions from "../config/functions";
import * as util from "../config/util";
import { orderRep, pointRep, userRep } from "../models/index";
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
  if(sum<0) return res.status(403).json(util.successFalse(null,"포인트 반환 실패", null));
  return res.json(util.successTrue("",{point:sum.toString()}));
});

point.post('/', util.isLoggedin,async (req:Request,res:Response)=>{
  const reqBody = req.body;
  const tokenData = req.decoded;
  //결제 검증 프로세스 있어야함.
  const user = await userRep.findOne({where:{id:tokenData.id}});
  if(!user) return res.status(403).json(util.successFalse(null,"포인트 충전 실패", null));
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

// point.post('/withdraw', util.isLoggedin,async (req:Request,res:Response)=>{

// });