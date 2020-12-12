/* eslint consistent-return: 0 */
import { Request, Response, Router } from 'express';
import * as crypto from 'crypto';
import dotenv from 'dotenv';
import axios from 'axios';
import * as db from 'sequelize';
import {
  userRep, addressRep, qnaRep, reportRep, orderRep, reviewRep, refundRep, paymentRep, 
} from '../models/index';
import * as util from '../config/util';
import { MyInfo } from '../config/classes';

dotenv.config();

export const myinfo = Router();
myinfo.get('/', util.isLoggedin, async (req: Request, res: Response) => {
  // 본인 정보 반환
  const tokenData = req.decoded;
  try {
    const _user = await userRep.findOne({ where: { id: tokenData.id } });
    if (!_user) return res.status(403).json(util.successFalse(null, '해당 하는 유저가 없습니다.', null));
    const user = new MyInfo(_user);
    return res.json(util.successTrue('', user));
  } catch (err) {
    return res.status(403).json(util.successFalse(err, '', null));
  }
});

myinfo.put('/', util.isLoggedin, async (req: Request, res: Response) => {
  // 본인 정보 수정
  const tokenData = req.decoded;
  const reqBody = req.body;
  let salt = null; let 
    hashedPw = null;
  try {
    let _user = await userRep.findOne({ where: { id: tokenData.id } });
    if (!_user) return res.status(403).json(util.successFalse(null, '해당 하는 유저가 없습니다.', null));
    if (reqBody.pw) {
      const buffer = crypto.randomBytes(64);
      salt = buffer.toString('base64');
      const key = crypto.pbkdf2Sync(reqBody.pw, salt, 100000, 64, 'sha512');
      hashedPw = key.toString('base64');
    }
    if (reqBody.nickName) {
      const nickExist = await userRep.findOne({ where: { nickName: reqBody.nickName } });
      if (nickExist) return res.status(403).json(util.successFalse(null, '닉네임이 중복되었습니다.', null));
    }
    _user = await _user.update({
      password: hashedPw || _user.password,
      salt: salt || _user.salt,
      nickName: reqBody.nickName ? reqBody.nickName : _user.nickName,
    });
    const user = new MyInfo(_user);
    return res.json(util.successTrue('', user));
  } catch (err) {
    return res.status(403).json(util.successFalse(err, '', null));
  }
});

myinfo.get('/address/list', util.isLoggedin, async (req: Request, res: Response) => {
  // 자기 주소 리스트 반환
  const tokenData = req.decoded;
  try {
    const addressList = await addressRep.findAll({ where: { userId: tokenData.id } });
    return res.json(util.successTrue('', addressList));
  } catch (err) {
    return res.status(403).json(util.successFalse(err, '', null));
  }
});

myinfo.put('/address/set', util.isLoggedin, async (req: Request, res: Response) => {
  // 기본 주소 설정
  const tokenData = req.decoded;
  const reqBody = req.body;
  try {
    const user = await userRep.findOne({ where: { id: tokenData.id } });
    if (!user) return res.status(403).json(util.successFalse(null, '해당 하는 유저가 없습니다.', null));
    const address = await addressRep.findOne({
      where: {
        id: reqBody.addressId,
        userId: tokenData.id,
      },
    });
    if (!address) return res.status(403).json(util.successFalse(null, '해당 하는 주소가 없습니다.', null));

    await user.update({
      addressId: reqBody.addressId,
    });
    return res.json(util.successTrue('', address));
  } catch (err) {
    return res.status(403).json(util.successFalse(err, '', null));
  }
});

myinfo.get('/address', util.isLoggedin, async (req: Request, res: Response) => {
  // 기본 주소 반환
  const tokenData = req.decoded;
  try {
    const user = await userRep.findOne({ where: { id: tokenData.id } });
    if (!user) return res.status(403).json(util.successFalse(null, '해당 하는 유저가 없습니다.', null));
    const address = await addressRep.findOne({
      where: {
        id: user.addressId,
        userId: tokenData.id,
      },
    });
    if (!address) return res.status(403).json(util.successFalse(null, '해당 하는 주소가 없습니다.', null));
    return res.json(util.successTrue('', address));
  } catch (err) {
    return res.status(403).json(util.successFalse(err, '', null));
  }
});

myinfo.post('/address', util.isLoggedin, async (req: Request, res: Response) => {
  // 주소 추가
  const tokenData = req.decoded;
  const reqBody = req.body;
  try {
    const coord = await axios({
      url: `https://dapi.kakao.com/v2/local/search/address.json?query=${encodeURIComponent(reqBody.address)}`,
      method: 'get',
      headers: { Authorization: `KakaoAK ${process.env.KAKAO_KEY}` },
    });
    const address = await addressRep.create({
      userId: tokenData.id,
      address: reqBody.address,
      detailAddress: reqBody.detailAddress,
      locX: coord.data.documents[0].y,
      locY: coord.data.documents[0].x,
    });
    if (reqBody.setDefault === '1') { /// ///////////////////////////////
      await userRep.update({
        addressId: address.id,
      }, {
        where: {
          id: tokenData.id,
        },
      });
    }
    return res.json(util.successTrue('', address));
  } catch (err) {
    return res.status(403).json(util.successFalse(err, '', null));
  }
});

myinfo.put('/address', util.isLoggedin, async (req: Request, res: Response) => {
  // 주소 변경
  const tokenData = req.decoded;
  const reqBody = req.body;
  try {
    const old = await addressRep.findOne({
      where: {
        userId: tokenData.id,
        id: reqBody.addressId,
      },
    });
    if (!old) return res.status(403).json(util.successFalse(null, '해당 하는 주소가 없습니다.', null));
    await old.update({
      detailAddress: reqBody.detailAddress ? reqBody.detailAddress : old.detailAddress,
    });
    return res.json(util.successTrue('', old));
  } catch (err) {
    // console.log(err);
    return res.status(403).json(util.successFalse(err, '?', null));
  }
});

myinfo.delete('/address', util.isLoggedin, async (req: Request, res: Response) => {
  // 주소 삭제
  const tokenData = req.decoded;
  const reqBody = req.body;
  try {
    const address = await addressRep.findOne({
      where: {
        userId: tokenData.id,
        id: reqBody.addressId,
      },
    });
    if (!address) return res.status(403).json(util.successFalse(null, '주소 삭제 실패', null));
    address.destroy()
      .then(() => res.json(util.successTrue('주소 삭제 성공', null)))
      .catch(() => res.status(403).json(util.successFalse(null, '주소 삭제 실패', null)));
  } catch (err) {
    return res.status(403).json(util.successFalse(err, '', null));
  }
});

myinfo.post('/report', util.isLoggedin, async (req: Request, res: Response) => {
  // 신고 접수(req: reportKind, orderId, content, chat포함여부)
  const tokenData = req.decoded;
  const reqBody = req.body;
  try {
    const order = await orderRep.findOne({ where: { id: reqBody.orderId } });
    if (!order) return res.status(403).json(util.successFalse(null, '해당하는 주문이 없습니다.', null));
    const { userId } = order;
    const { riderId } = order;
    if (riderId !== parseInt(tokenData.id, 10) && userId !== parseInt(tokenData.id, 10)) return res.status(403).json(util.successFalse(null, '해당 주문과 관련없는 사람은 신고할 수 없습니다.', null));
    const { chatId } = order;
    const report = await reportRep.create({
      userId,
      riderId,
      reportKind: reqBody.reportKind,
      orderId: reqBody.orderId,
      fromId: tokenData.id,
      chatId: parseInt(reqBody.upload_chat, 10) === 1 ? chatId : null,
      content: reqBody.content,
    });
    return res.json(util.successTrue('', report));
  } catch (err) {
    return res.status(403).json(util.successFalse(err, '', null));
  }
});

myinfo.post('/qna', util.isLoggedin, async (req: Request, res: Response) => {
  // 질문 접수 (id, qnakind, userId, content, answer)
  const tokenData = req.decoded;
  const reqBody = req.body;
  try {
    const qna = await qnaRep.create({
      userId: tokenData.id,
      qnaKind: reqBody.qnaKind,
      content: reqBody.content,
    });
    return res.json(util.successTrue('', qna));
  } catch (err) {
    return res.status(403).json(util.successFalse(err, '', null));
  }
});

myinfo.post('/upload', util.isLoggedin, async (req: Request, res: Response) => {
  const tokenData = req.decoded;
  const reqBody = req.body;
  try {
    const user = await userRep.findOne({ where: { userId: tokenData.userId } });
    if (!user) return res.status(403).json(util.successFalse(null, '해당 하는 유저가 없습니다.', null));
    if (user.grade === 2) return res.status(403).json(util.successFalse(null, '이미 신분확인이 완료되었습니다.', null));
    if (user.grade === 1) return res.status(403).json(util.successFalse(null, '신분 확인 대기중입니다.', null));
    await user.update({
      grade: 1,
      idCard: reqBody.idCard,
    });
    return res.json(util.successTrue('', { grade: user.grade, idCard: user.idCard }));
  } catch (err) {
    return res.status(403).json(util.successFalse(err, '', null));
  }
});

myinfo.post('/currentLocation', util.isLoggedin, util.isUser, async (req: Request, res: Response) => {
  const tokenData = req.decoded;
  const reqBody = req.body;
  try {
    const user = await userRep.findOne({ where: { userId: tokenData.userId } });
    if (!user) return res.status(403).json(util.successFalse(null, '해당 하는 유저가 없습니다.', null));
    await user.update({ lat: reqBody.coords.latitude, lng: reqBody.coords.longitude });
    return res.json(util.successTrue('', null));
  } catch (err) {
    return res.status(403).json(util.successFalse(err, '', null));
  }
});

myinfo.get('/review/written', util.isLoggedin, async (req: Request, res: Response) => {
  // 나에 대해 작성된 리뷰
  const tokenData = req.decoded;
  try {
    const reviews = await reviewRep.findAll({
      where: {
        fromId: { [db.Op.ne]: tokenData.id },
        [db.Op.or]: [{ riderId: tokenData.id }, { userId: tokenData.id }],
      },
    });
    // console.log(reviews);
    return res.json(util.successTrue('', reviews));
  } catch (err) {
    return res.status(403).json(util.successFalse(err, '나에게 작성된 리뷰가 없습니다.', null));
  }
});

myinfo.get('/refunds', util.isLoggedin, async (req: Request, res: Response) => {
  // 환급 신청 리스트
  const tokenData = req.decoded;
  try {
    const refunds = await refundRep.findAll({ where: { userId: tokenData.id } });
    if (!refunds) { return res.status(403).json(util.successFalse(null, '환급 신청 내역이 없습니다.', null)); }
    return res.json(util.successTrue('', refunds));
  } catch (err) {
    return res.status(403).json(util.successFalse(err, '환급 신청 내역이 없습니다.', null));
  }
});

myinfo.get('/paids', util.isLoggedin, async (req: Request, res: Response) => {
  // 환급 신청 리스트
  const tokenData = req.decoded;
  try {
    const paids = await paymentRep.findAll({ where: { userId: tokenData.id } });
    if (!paids) { return res.status(403).json(util.successFalse(null, '결제 내역이 없습니다.', null)); }
    return res.json(util.successTrue('', paids));
  } catch (err) {
    return res.status(403).json(util.successFalse(err, '결제 내역이 없습니다.', null));
  }
});