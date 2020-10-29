import { NextFunction, Response, Router } from "express";
import * as util from "../config/util";
import { qnaRep, reportRep, userRep } from "../models/index";

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
    let detail_upload;
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
      detail_upload = "유저 아이디: " + user.id + "유저 닉네임: " + user.userId + "사진 주소: " + user.idCard;
    });
    if (!detail_upload) return res.status(403).json(util.successFalse(null, "해당 유저가 사진을 등록하지 않았습니다.", null));
    return res.json(util.successTrue("", detail_upload));
  } catch (err) {
    return res.status(403).json(util.successFalse(err, "", null));
  }
});

admin.put('/upload', /*util.isLoggedin, util.isAdmin,*/ async function (req: any, res: Response, next: NextFunction) {
  //민증인증 처리
  const reqBody = req.body;
  const id = reqBody.id;
  const result = reqBody.result;
  try {
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
      // 통과
      if (Number(result)) {
        user.update({
          grade: 2
        });
      }
      return res.json(util.successTrue("", user));
    });
  } catch (err) {
    return res.status(403).json(util.successFalse(err, "", null));
  }
});


admin.get('/reports', /*util.isLoggedin, util.isAdmin,*/ async function (req: any, res: Response, next: NextFunction) {
  //신고 리스트 반환
  try {
    let reportList = "";
    await reportRep.findAll({
      where: {
        status: "0"
      }
    }).then((lists) => {
      console.log("?");
      for (let i = 0; i < lists.length; i++) {
        reportList += i + 1 + ". " + "reportId: " + lists[i].id + "orderId: " + lists[i].orderId + ", reportKind: " + lists[i].reportKind + ", fromId: " + lists[i].fromId + "  ";
      }
    });
    if (!reportList) return res.status(403).json(util.successFalse(null, "현재 처리를 기다리는 신고가 없습니다.", null));
    return res.json(util.successTrue("", reportList));
  } catch (err) {
    return res.status(403).json(util.successFalse(err, "", null));
  }
});

admin.post('/report',/*util.isLoggedin, util.isAdmin,*/ async function (req: any, res: Response, next: NextFunction) {
  //신고 상세내용보기
  const reqBody = req.body;
  const reportId = reqBody.reportId;
  try {
    let detail_report;
    await reportRep.findOne({
      where: {
        id: reportId
      }
    }).then((rp) => {
      if (!rp) {
        return res.status(403).json(util.successFalse(null, "해당하는 주문 내역이 없습니다.", null));
      }
      detail_report = "id: " + rp.id + ", reportKind: " + rp.reportKind + ", orderId: " + rp.orderId +
        ", userId: " + rp.userId + ", riderId: " + rp.riderId + ", fromId: " + rp.fromId +
        ", chat: " + "채팅 어쩌지" + ", content: " + rp.content;
    });
    return res.json(util.successTrue("", detail_report));
  } catch (err) {
    return res.status(403).json(util.successFalse(err, "", null));
  }
});

admin.put('/report', /*util.isLoggedin, util.isAdmin,*/ async function (req: any, res: Response, next: NextFunction) {
  //신고 답변 작성
  const reqBody = req.body;
  const reportId = reqBody.reportId;
  const answer = reqBody.answer;
  try {
    await reportRep.findOne({
      where: {
        id: reportId
      }
    }).then((report) => {
      if (!report) {
        return res.status(403).json(util.successFalse(null, "해당하는 신고가 없습니다.", null));
      }
      if (report.status) {
        return res.status(403).json(util.successFalse(null, "이미 처리된 문의입니다.", null));
      }
      report.update({
        answer: answer,
        status: true
      });
      return res.json(util.successTrue("", report));
    });
  } catch (err) {
    return res.status(403).json(util.successFalse(err, "", null));
  }
});


admin.get('/qnas', /*util.isLoggedin, util.isAdmin,*/ async function (req: any, res: Response, next: NextFunction) {
  //문의 리스트 반환
  try {
    let qnaList = "";
    await qnaRep.findAll({
      where: {
        status: "0"
      }
    }).then((lists) => {
      for (let i = 0; i < lists.length; i++) {
        qnaList += i + 1 + ". " + "qnaId: " + lists[i].id + ", qnaKind: " + lists[i].qnaKind + "  ";
      }
    });
    if (!qnaList) return res.status(403).json(util.successFalse(null, "현재 처리를 기다리는 문의가 없습니다.", null));
    return res.json(util.successTrue("", qnaList));
  } catch (err) {
    return res.status(403).json(util.successFalse(err, "", null));
  }
});

admin.post('/qna', /*util.isLoggedin, util.isAdmin,*/ async function (req: any, res: Response, next: NextFunction) {
  //문의 상세내용보기
  const reqBody = req.body;
  const qnaId = reqBody.qnaId;
  try {
    let detail_qna;
    await qnaRep.findOne({
      where: {
        id: qnaId
      }
    }).then((qna) => {
      if (!qna) {
        return res.status(403).json(util.successFalse(null, "해당하는 문의 내역이 없습니다.", null));
      }
      detail_qna = "id: " + qna.id + ", qnaKind: " + qna.qnaKind + ", userId: " + qna.userId +
        ", content: " + qna.content;
    });
    return res.json(util.successTrue("", detail_qna));
  } catch (err) {
    return res.status(403).json(util.successFalse(err, "", null));
  }
});

admin.put('/qna', /*util.isLoggedin, util.isAdmin,*/ async function (req: any, res: Response, next: NextFunction) {
  //문의 답변 작성
  const reqBody = req.body;
  const qnaId = reqBody.qnaId;
  const answer = reqBody.answer;
  try {
    await qnaRep.findOne({
      where: {
        id: qnaId
      }
    }).then((qna) => {
      if (!qna) {
        return res.status(403).json(util.successFalse(null, "해당하는 문의가 없습니다.", null));
      }
      if (qna.status) {
        return res.status(403).json(util.successFalse(null, "이미 처리된 문의입니다.", null));
      }
      qna.update({
        answer: answer,
        status: true
      });
      return res.json(util.successTrue("", qna));
    });
  } catch (err) {
    return res.status(403).json(util.successFalse(err, "", null));
  }
});
