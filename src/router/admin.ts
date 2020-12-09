import { Request, Response, Router } from "express";
import * as util from "../config/util";
import { qnaRep, reportRep, userRep, refundRep } from "../models/index";
import * as functions from "../config/functions";
import axios from "axios";
import Cache from "node-cache";
export const myCache = new Cache();

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

admin.get('/upload', util.isLoggedin, util.isAdmin, async function (req: Request, res: Response) {
  //상세내용 반환
  const reqQuery = req.query;
  const id = parseInt(reqQuery.id as string);
  try {
    const user = await userRep.findOne({ where: { id: id } });
    if (!user) { return res.status(403).json(util.successFalse(null, "해당하는 유저가 없습니다.", null)); }
    if (user.grade == 2) { return res.status(403).json(util.successFalse(null, "이미 인증된 유저입니다.", null)); }
    else if (user.grade == 0) { return res.status(403).json(util.successFalse(null, "인증을 요청하지 않은 유저입니다.", null)); }
    if (!user.idCard) return res.status(403).json(util.successFalse(null, "해당 유저가 사진을 등록하지 않았습니다.", null));
    return res.json(util.successTrue("", user));
  } catch (err) {
    return res.status(403).json(util.successFalse(err, "", null));
  }
});

admin.put('/upload', util.isLoggedin, util.isAdmin, async function (req: Request, res: Response) {
  //민증인증 처리
  const reqQuery = req.query;
  let registrationToken;
  const reqBody = req.body;
  const id = parseInt(reqQuery.id as string);
  const result = parseInt(reqBody.result);
  try {
    let user = await userRep.findOne({ where: { id: id }, attributes: ['id', 'grade'] });
    if (!user) { return res.status(403).json(util.successFalse(null, "해당하는 유저가 없습니다.", null)); }
    if (user.grade == 2) { return res.status(403).json(util.successFalse(null, "이미 인증된 유저입니다.", null)); }
    else if (user.grade == 0) { return res.status(403).json(util.successFalse(null, "인증을 요청하지 않은 유저입니다.", null)); }
    // 통과
    if (result == 1) {
      user = await user.update({ grade: 2 });
      registrationToken = user.firebaseFCM;
      if (registrationToken) {
        const message = {
          data: {
            test: "인증이 완료되었습니다." + registrationToken
          },
        };
        functions.sendFCMMessage(registrationToken,message);
        // Admin.messaging().sendToDevice(registrationToken,message)
        //   .then((response) => {
        //     console.log('Successfully sent message:', response);
        //   })
        //   .catch((error) => {
        //     console.log('Error sending message:', error);
        //   });
      }
      //토큰 없을 경우 또는 메시지 전송 실패 시 문자 전송?
      return res.json(util.successTrue("", user));
    }
    user = await user.update({ grade: 0 });
    return res.status(403).json(util.successFalse(null, "승인거절", null));
  } catch (err) {
    return res.status(403).json(util.successFalse(err, "", null));
  }
});


admin.get('/reports', util.isLoggedin, util.isAdmin, async function (req: Request, res: Response) {
  //신고 리스트 반환
  try {
    const lists = await reportRep.findAll({ where: { status: 0 }, attributes: ['id', 'orderId', 'reportKind', 'fromId'] });
    if (!lists) return res.status(403).json(util.successFalse(null, "현재 처리를 기다리는 신고가 없습니다.", null));
    return res.json(util.successTrue("", lists));
  } catch (err) {
    return res.status(403).json(util.successFalse(err, "", null));
  }
});

admin.get('/report', util.isLoggedin, util.isAdmin, async function (req: Request, res: Response) {
  //신고 상세내용보기
  const reqQuery = req.query;
  const reportId = parseInt(reqQuery.reportId as string);
  try {
    const report = await reportRep.findOne({ where: { id: reportId }, attributes: ['id', 'reportKind', 'orderId', 'userId', 'riderId', 'fromId', 'content'] });
    if (!report) { return res.status(403).json(util.successFalse(null, "해당하는 신고 내역이 없습니다.", null)); }
    return res.json(util.successTrue("", report));
  } catch (err) {
    return res.status(403).json(util.successFalse(err, "", null));
  }
});

admin.put('/report', util.isLoggedin, util.isAdmin, async function (req: Request, res: Response) {
  //신고 답변 작성
  const reqQuery = req.query;
  const reqBody = req.body;
  const reportId = parseInt(reqQuery.reportId as string);
  const answer = reqBody.answer;
  try {
    const answered_report = await reportRep.findOne({ where: { id: reportId } });
    if (!answered_report) { return res.status(403).json(util.successFalse(null, "해당하는 문의가 없습니다.", null)); }
    if (answered_report.status) { return res.status(403).json(util.successFalse(null, "이미 처리된 문의입니다.", null)); }
    await answered_report.update({ answer: answer, status: true });
    return res.json(util.successTrue("", answered_report));
  } catch (err) {
    return res.status(403).json(util.successFalse(err, "", null));
  }
});


admin.get('/qnas', util.isLoggedin, util.isAdmin, async function (req: Request, res: Response) {
  //문의 리스트 반환
  try {
    const lists = await qnaRep.findAll({ where: { status: 0 }, attributes: ['id', 'qnaKind'] });
    if (!lists) return res.status(403).json(util.successFalse(null, "현재 처리를 기다리는 문의가 없습니다.", null));
    return res.json(util.successTrue("", lists));
  } catch (err) {
    return res.status(403).json(util.successFalse(err, "", null));
  }
});

admin.get('/qna', util.isLoggedin, util.isAdmin, async function (req: Request, res: Response) {
  //문의 상세내용보기
  const reqQuery = req.query;
  const qnaId = parseInt(reqQuery.qnaId as string);
  try {
    const question = await qnaRep.findOne({ where: { id: qnaId } });
    if (!question) { return res.status(403).json(util.successFalse(null, "해당하는 문의 내역이 없습니다.", null)); }
    return res.json(util.successTrue("", question));
  } catch (err) {
    return res.status(403).json(util.successFalse(err, "", null));
  }
});

admin.put('/qna', util.isLoggedin, util.isAdmin, async function (req: Request, res: Response) {
  //문의 답변 작성
  const reqQuery = req.query;
  const reqBody = req.body;
  const qnaId = parseInt(reqQuery.qnaId as string);
  const answer = reqBody.answer;
  try {
    const answered_qna = await qnaRep.findOne({ where: { id: qnaId } });
    if (!answered_qna) { return res.status(403).json(util.successFalse(null, "해당하는 문의가 없습니다.", null)); }
    if (answered_qna.status) { return res.status(403).json(util.successFalse(null, "이미 처리된 문의입니다.", null)); }
    await answered_qna.update({ answer: answer, status: true });
    return res.json(util.successTrue("", answered_qna));
  } catch (err) {
    return res.status(403).json(util.successFalse(err, "", null));
  }
});

admin.get('/refunds', util.isLoggedin, util.isAdmin, async function (req: Request, res: Response) {
  //환급 리스트 반환
  try {
    const refunds = await refundRep.findAll({ where: { status: 0 }, attributes: ['id', 'status'] });
    if (!refunds) return res.status(403).json(util.successFalse(null, "현재 입금을 기다리는 환급이 없습니다.", null));
    return res.json(util.successTrue("", refunds));
  } catch (err) {
    return res.status(403).json(util.successFalse(err, "", null));
  }
});

admin.get('/refund', util.isLoggedin, util.isAdmin, async function (req: Request, res: Response) {
  //환급 상세내용보기
  const reqQuery = req.query;
  const refundId = parseInt(reqQuery.refundId as string);
  try {
    if (!refundId) return res.status(403).json(util.successFalse(null, "환급 아이디를 넣어주세요.", null));
    const refund = await refundRep.findOne({ where: { id: refundId } });
    if (!refund) return res.status(403).json(util.successFalse(null, "해당하는 입금 신청 내역이 없습니다.", null));
    return res.json(util.successTrue("", refund));
  } catch (err) {
    return res.status(403).json(util.successFalse(err, "", null));
  }
});

admin.get('/openToken', util.isLoggedin, util.isAdmin, async function (req: Request, res: Response) {
  try{
    const data = await axios({
      url:'https://testapi.openbanking.or.kr/oauth/2.0/token',
      params:{
        "client_id": process.env.OPEN_API,
        "client_secret": process.env.OPEN_SECRET,
        "scope": "oob",
        "grant_type": "client_credentials"
      },
      method:'post'
    });
    myCache.set('OpenBankingToken',data.data.access_token);
    console.log(data.data.access_token);
    return res.json(util.successTrue("", null));
  }
  catch(e){
    return res.status(403).json(util.successFalse(null, "토큰 발급 실패", null));
  }
});

admin.put('/refund', util.isLoggedin, util.isAdmin, async function (req: Request, res: Response) {
  //환급 답변 작성
  const reqQuery = req.query;
  const reqBody = req.body;
  const refundId = parseInt(reqQuery.refundId as string);
  const complete = parseInt(reqBody.complete);
  const today = new Date();
  today.setFullYear(today.getFullYear(), today.getMonth(), today.getDay());
  try {
    const refund = await refundRep.findOne({ where: { id: refundId } });
    if (!refund) return res.status(403).json(util.successFalse(null, "해당하는 입금 신청 내역이 없습니다.", null));
    if (refund.status) return res.status(403).json(util.successFalse(null, "이미 입금이 완료된 신청입니다.", null));
    if (complete !== 1) return res.status(403).json(util.successFalse(null, "환급 실패 입니다.", null));

    const user = await userRep.findOne({ where: { id: refund.userId } });
    if (!user) return res.status(403).json(util.successFalse(null, "해당하는 유저가 없습니다.", null));
    // if(user.name != refund.accountName) return res.status(403).json(util.successFalse(null, "사용자명과 환급 계좌 명의가 다릅니다.", null));
    const padNum = String(Math.floor(Math.random() * 1000000000) + 1).padStart(9,'0');
    console.log(padNum);
    const trans = await axios({
      url:'https://testapi.openbanking.or.kr/v2.0/transfer/deposit/acnt_num',
      headers:{
        Authorization: "Bearer " + myCache.get('OpenBankingToken') as string //Access_Token 추가 (oob, sa 뭐냐)
      },
      data:{
        "cntr_account_type": "N", //N=> 계좌, C=>계정, 약정 계좌 구분
        "cntr_account_num": process.env.OPEN_ACCOUNT, //약정 계좌 또는 계정
        "wd_pass_phrase": "NONE", //테스트용도로는 NONE을 사용
        "wd_print_content": "환급", //출금되는 통장에 찍히는 내역
        "name_check_option":"on",
        "tran_dtime": "20201001150133", //거래 일시
        "req_cnt": "1", //1 고정이라고 합니다. 2 이상 못씀.
        "req_list": [
          {
            "tran_no": "1", //거래 순번
            "bank_tran_id": "T991672410U"+padNum, //거래고유번호
            "bank_code_std": functions.getBankCode(refund.bankKind), //입금 계좌 은행 코드
            "account_num": refund.accountNum, //입금 계좌 번호
            "account_holder_name": refund.accountName, //입금계좌예금주명
            "print_content": "환급",//인자내역, 입금되는 통장에 찍히는거
            "tran_amt": refund.amount,//거래금액
            "req_client_name": refund.accountName, //환급을 요청한 사람 이름 (고객이겠징)
            "req_client_bank_code":functions.getBankCode(refund.bankKind), // 환급을 요청한 사람의 계좌 은행 코드
            "req_client_account_num":refund.accountNum, // 환급을 요청한 사람의 계좌
            "req_client_num": user.id, // 유저의 고유번호를 우리가 넣으면 될듯
            "transfer_purpose": "TR" //이체
          }
        ]
      },
      method:'post'
    });
    console.log(trans.data);
    if(trans.data.rsp_code != "A0000") return res.status(403).json(util.successFalse(null, "환급 실패", null));
    if (complete === 1) await refund.update({ status: true, refundAt: today,bankTranId:"T991672410U"+padNum });
    return res.json(util.successTrue("", refund));
  } catch (err) {
    return res.status(403).json(util.successFalse(err, "", null));
  }
});