import { Request, Response, Router } from "express";
import * as util from "../config/util";
import { qnaRep, reportRep, userRep, orderRep, roomRep, chatRep } from "../models/index";
import * as alert from "firebase-admin";

import dotenv from "dotenv";
dotenv.config();

export const admin = Router();

admin.get('/uploads', util.isLoggedin, util.isAdmin, async function (req: Request, res: Response) {
  //민증 확인 리스트 반환
  try {
    const list = await userRep.findAll({ where: { grade: 1 }, attributes: ['id', 'userId'] });
    if (!list) return res.status(403).json(util.successFalse(null, "현재 인증을 기다리는 회원이 없습니다.", null));
    return res.json(util.successTrue("", list));
  } catch (err) {
    return res.status(403).json(util.successFalse(err, "", null));
  }
});

admin.get('/upload/:id', util.isLoggedin, util.isAdmin, async function (req: Request, res: Response) {
  //상세내용 반환
  const id = req.params.id;
  try {
    const user = await userRep.findOne({ where: { id: id } });
    if (!user) { return res.status(403).json(util.successFalse(null, "해당하는 유저가 없습니다.", null)); }
    if (user.grade > 1) { return res.status(403).json(util.successFalse(null, "이미 인증된 유저입니다.", null)); }
    else if (user.grade == 0) { return res.status(403).json(util.successFalse(null, "인증을 요청하지 않은 유저입니다.", null)); }
    if (!user.idCard) return res.status(403).json(util.successFalse(null, "해당 유저가 사진을 등록하지 않았습니다.", null));
    return res.json(util.successTrue("", user));
  } catch (err) {
    return res.status(403).json(util.successFalse(err, "", null));
  }
});

admin.put('/upload', util.isLoggedin, util.isAdmin, async function (req: Request, res: Response) {
  //민증인증 처리
  let registrationToken;
  const reqBody = req.body;
  const id = reqBody.id;
  const result = parseInt(reqBody.result);
  try {
    const user = await userRep.findOne({ where: { id: id }, attributes: ['id', 'grade'] });
    if (!user) { return res.status(403).json(util.successFalse(null, "해당하는 유저가 없습니다.", null)); }
    if (user.grade > 1) { return res.status(403).json(util.successFalse(null, "이미 인증된 유저입니다.", null)); }
    else if (user.grade == 0) { return res.status(403).json(util.successFalse(null, "인증을 요청하지 않은 유저입니다.", null)); }
    // 통과
    if (result == 1) {
      user.update({ grade: 2 });
      registrationToken = user.firebaseFCM;
      const message = {
        data: {
          test: "인증이 완료되었습니다." + registrationToken
        },
        token: registrationToken
      };
      alert.messaging().send(message)
        .then((response) => {
          console.log('Successfully sent message:', response);
        })
        .catch((error) => {
          console.log('Error sending message:', error);
        });
    }
    return res.json(util.successTrue("", user));
  } catch (err) {
    return res.status(403).json(util.successFalse(err, "", null));
  }
});


admin.get('/reports', util.isLoggedin, util.isAdmin, async function (req: Request, res: Response) {
  //신고 리스트 반환
  try {
    const lists = await reportRep.findAll({ where: { id: { [db.Op.ne]: tokenData.id }, grade: [2, 3], gender: gender } });
    await reportRep.findAll({
      where: { status: 0 }, attributes: ['id', 'orderId', 'reportKind', 'fromId']
    }).then((lists) => {
      if (!lists) return res.status(403).json(util.successFalse(null, "현재 처리를 기다리는 신고가 없습니다.", null));
      return res.json(util.successTrue("", lists));
    });
  } catch (err) {
    return res.status(403).json(util.successFalse(err, "", null));
  }
});

admin.get('/report/:id', util.isLoggedin, util.isAdmin, async function (req: Request, res: Response) {
  //신고 상세내용보기
  const reportId = req.params.id;
  try {
    await reportRep.findOne({
      where: {
        id: reportId
      }
    }).then((rp) => {
      if (!rp) {
        return res.status(403).json(util.successFalse(null, "해당하는 신고 내역이 없습니다.", null));
      }
      return res.json(util.successTrue("", {
        reportId: rp.id, reportKind: rp.reportKind, orderId: rp.orderId,
        userId: rp.userId, riderId: rp.riderId, fromId: rp.fromId, content: rp.content
      }));
    });
  } catch (err) {
    return res.status(403).json(util.successFalse(err, "", null));
  }
});

admin.put('/report', util.isLoggedin, util.isAdmin, async function (req: Request, res: Response) {
  //신고 답변 작성
  let registrationToken;
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
        return res.status(403).json(util.successFalse(null, "해당하는 문의가 없습니다.", null));
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


admin.get('/qnas', util.isLoggedin, util.isAdmin, async function (req: Request, res: Response) {
  //문의 리스트 반환
  try {
    await qnaRep.findAll({
      where: { status: 0 },
      attributes: ['id', 'qnaKind']
    }).then((lists) => {
      if (!lists) return res.status(403).json(util.successFalse(null, "현재 처리를 기다리는 문의가 없습니다.", null));
      return res.json(util.successTrue("", lists));
    });
  } catch (err) {
    return res.status(403).json(util.successFalse(err, "", null));
  }
});

admin.get('/qna/:id', util.isLoggedin, util.isAdmin, async function (req: Request, res: Response) {
  //문의 상세내용보기
  const qnaId = req.params.id;
  try {
    await qnaRep.findOne({
      where: {
        id: qnaId
      }
    }).then((qna) => {
      if (!qna) {
        return res.status(403).json(util.successFalse(null, "해당하는 문의 내역이 없습니다.", null));
      }
      return res.json(util.successTrue("", qna));
    });
  } catch (err) {
    return res.status(403).json(util.successFalse(err, "", null));
  }
});

admin.put('/qna', util.isLoggedin, util.isAdmin, async function (req: Request, res: Response) {
  //문의 답변 작성
  let registrationToken;
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
