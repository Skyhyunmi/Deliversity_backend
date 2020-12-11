import { Request, Response, Router } from 'express';
import axios from 'axios';
import dotenv from 'dotenv';
import * as util from '../config/util';

import * as functions from '../config/functions';
import { userRep } from '../models';

dotenv.config();

export const test = Router();

test.get('/hello', (req: Request, res: Response) => {
  res.json({ string: 'hello pm2! nice to meet you!' });
});

test.post('/juso', async (req: Request, res: Response) => {
  // 주문 등록
  const reqBody = req.body;
  try {
    const coord = await axios({
      url: `https://dapi.kakao.com/v2/local/search/address.json?query=${encodeURIComponent(reqBody.address)}`,
      method: 'get',
      headers: { Authorization: `KakaoAK ${process.env.KAKAO_KEY}` },
    });
    return res.json(util.successTrue('', coord.data.documents[0]));
  } catch (err) {
    console.error(err);
    return res.json(util.successFalse(null, 'error', null));
  }
});

test.post('/noti', util.isLoggedin, async (req: Request, res: Response) => {
  const reqBody = req.body;
  const tokenData = req.decoded;
  const user = await userRep.findOne({ where: { id: tokenData.id } });
  if (!user) return res.status(403).json(util.successFalse(null, 'Retry.', null));
  const registrationToken = user.firebaseFCM;
  console.log(registrationToken);
  try {
    const { payload } = reqBody;
    functions.sendFCMMessage(registrationToken, payload);
    return res.json(util.successTrue('', payload.notification));
  } catch (err) {
    return res.status(403).json(util.successFalse(err, 'Retry.', null));
  }
});
