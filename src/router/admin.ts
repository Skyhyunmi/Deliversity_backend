import { NextFunction, Response, Router } from "express";
import * as util from "../config/util";
import { userRep } from "../models/index";

import dotenv from "dotenv";
dotenv.config();

export const admin = Router();

admin.get('/uploads', /*util.isLoggedin, util.isAdmin,*/ async function (req: any, res: Response, next: NextFunction) {
  //민증 확인 리스트 반환
  try {
    let IdList = "";
    await userRep.findAll({
      where: {
        grade: 1
      }
    }).then((lists) => {
      for (let i = 0; i < lists.length; i++) {
        IdList += i + 1 + ". " + "id: " + lists[i].id + ", userId: " + lists[i].userId + "  ";
      }
    });
    if (!IdList) return res.status(403).json(util.successFalse(null, "현재 인증을 기다리는 회원이 없습니다.", null));
    return res.json(util.successTrue("", IdList));
  } catch (err) {
    return res.status(403).json(util.successFalse(err, "", null));
  }
});

admin.post('/upload', /*util.isLoggedin, util.isAdmin,*/ async function (req: any, res: Response, next: NextFunction) {
  //상세내용 반환
  const reqBody = req.body;
  const id = reqBody.id;
  try {
    let photo;
    await userRep.findOne({
      where: {
        id: id
      }
    }).then((user) => {
      if (!user) {
        return res.status(403).json(util.successFalse(null, "해당하는 유저가 없습니다.", null));
      }
      if (user.grade > 1) {
        return res.status(403).json(util.successFalse(null, "이미 인증된 유저입니다.", null));
      }
      else if (user.grade == 0) {
        return res.status(403).json(util.successFalse(null, "인증을 요청하지 않은 유저입니다.", null));
      }
      photo = "유저 아이디: " + user.id + "유저 닉네임: " + user.userId + "사진 주소: " + user.idCard;
    });
    if (!photo) return res.status(403).json(util.successFalse(null, "해당 유저가 사진을 등록하지 않았습니다.", null));
    return res.json(util.successTrue("", photo));
  } catch (err) {
    return res.status(403).json(util.successFalse(err, "", null));
  }
});

admin.put('/upload', util.isLoggedin, util.isAdmin, async function (req: any, res: Response, next: NextFunction) {
  //민증인증 처리
  const tokenData = req.decoded;
  const reqBody = req.body;
  try {
    //작성
  } catch (err) {
    return res.status(403).json(util.successFalse(err, "", null));
  }
});


admin.get('/reports', util.isLoggedin, util.isAdmin, async function (req: any, res: Response, next: NextFunction) {
  //신고 리스트 반환
  const tokenData = req.decoded;
  const reqBody = req.body;
  try {
    //작성
  } catch (err) {
    return res.status(403).json(util.successFalse(err, "", null));
  }
});

admin.get('/report', util.isLoggedin, util.isAdmin, async function (req: any, res: Response, next: NextFunction) {
  //신고 상세내용보기
  const tokenData = req.decoded;
  const reqBody = req.body;
  try {
    //작성
  } catch (err) {
    return res.status(403).json(util.successFalse(err, "", null));
  }
});

admin.put('/report', util.isLoggedin, util.isAdmin, async function (req: any, res: Response, next: NextFunction) {
  //신고 답변 작성
  const tokenData = req.decoded;
  const reqBody = req.body;
  try {
    //작성
  } catch (err) {
    return res.status(403).json(util.successFalse(err, "", null));
  }
});


admin.get('/qnas', util.isLoggedin, util.isAdmin, async function (req: any, res: Response, next: NextFunction) {
  //문의 리스트 반환
  const tokenData = req.decoded;
  const reqBody = req.body;
  try {
    //작성
  } catch (err) {
    return res.status(403).json(util.successFalse(err, "", null));
  }
});

admin.get('/qna', util.isLoggedin, util.isAdmin, async function (req: any, res: Response, next: NextFunction) {
  //문의 상세내용보기
  const tokenData = req.decoded;
  const reqBody = req.body;
  try {
    //작성
  } catch (err) {
    return res.status(403).json(util.successFalse(err, "", null));
  }
});

admin.put('/qna', util.isLoggedin, util.isAdmin, async function (req: any, res: Response, next: NextFunction) {
  //문의 답변 작성
  const tokenData = req.decoded;
  const reqBody = req.body;
  try {
    //작성
  } catch (err) {
    return res.status(403).json(util.successFalse(err, "", null));
  }
});
