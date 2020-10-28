import { NextFunction, Response, Router } from "express";
import * as util from "../config/util";

import dotenv from "dotenv";
dotenv.config();

export const admin = Router();

admin.get('/uploads', util.isLoggedin, util.isAdmin, async function (req: any, res: Response, next: NextFunction) {
//민증 확인 리스트 반환
  const tokenData = req.decoded;
  const reqBody = req.body;
  try{
      
    //작성
  }catch(err){
    return res.status(403).json(util.successFalse(err,"",null));
  }
});

admin.get('/upload', util.isLoggedin, util.isAdmin, async function (req: any, res: Response, next: NextFunction) {
//상세내용 반환
  const tokenData = req.decoded;
  const reqBody = req.body;
  try{
    //작성
  }catch(err){
    return res.status(403).json(util.successFalse(err,"",null));
  }
});

admin.put('/upload', util.isLoggedin, util.isAdmin, async function (req: any, res: Response, next: NextFunction) {
//민증인증 처리
  const tokenData = req.decoded;
  const reqBody = req.body;
  try{
    //작성
  }catch(err){
    return res.status(403).json(util.successFalse(err,"",null));
  }
});


admin.get('/reports', util.isLoggedin, util.isAdmin, async function (req: any, res: Response, next: NextFunction) {
//신고 리스트 반환
  const tokenData = req.decoded;
  const reqBody = req.body;
  try{
    //작성
  }catch(err){
    return res.status(403).json(util.successFalse(err,"",null));
  }
});

admin.get('/report', util.isLoggedin, util.isAdmin, async function (req: any, res: Response, next: NextFunction) {
//신고 상세내용보기
  const tokenData = req.decoded;
  const reqBody = req.body;
  try{
    //작성
  }catch(err){
    return res.status(403).json(util.successFalse(err,"",null));
  }
});

admin.put('/report', util.isLoggedin, util.isAdmin, async function (req: any, res: Response, next: NextFunction) {
//신고 답변 작성
  const tokenData = req.decoded;
  const reqBody = req.body;
  try{
    //작성
  }catch(err){
    return res.status(403).json(util.successFalse(err,"",null));
  }
});


admin.get('/qnas', util.isLoggedin, util.isAdmin, async function (req: any, res: Response, next: NextFunction) {
//문의 리스트 반환
  const tokenData = req.decoded;
  const reqBody = req.body;
  try{
    //작성
  }catch(err){
    return res.status(403).json(util.successFalse(err,"",null));
  }
});
    
admin.get('/qna', util.isLoggedin, util.isAdmin, async function (req: any, res: Response, next: NextFunction) {
//문의 상세내용보기
  const tokenData = req.decoded;
  const reqBody = req.body;
  try{
    //작성
  }catch(err){
    return res.status(403).json(util.successFalse(err,"",null));
  }
});

admin.put('/qna', util.isLoggedin, util.isAdmin, async function (req: any, res: Response, next: NextFunction) {
//문의 답변 작성
  const tokenData = req.decoded;
  const reqBody = req.body;
  try{
    //작성
  }catch(err){
    return res.status(403).json(util.successFalse(err,"",null));
  }
});
