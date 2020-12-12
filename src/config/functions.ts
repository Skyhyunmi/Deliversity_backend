import axios from 'axios';
import * as crypto from 'crypto';
import * as admin from 'firebase-admin';
import Cache from 'node-cache';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { userRep } from '../models/index';
import User from '../models/user';
import Refund from '../models/refund';
import { transporter } from './mail';
import * as classes from './classes';


dotenv.config();

export const myCache = new Cache();

function makeSignature(urlsub: string, timestamp: string) {
  const space = ' ';
  const newLine = '\n';
  const method = 'POST';
  const hmac = crypto.createHmac('sha256', process.env.NAVER_SECRET as string);
  const mes = [];
  mes.push(method);
  mes.push(space);
  mes.push(urlsub);
  mes.push(newLine);
  mes.push(timestamp);
  mes.push(newLine);
  mes.push(process.env.NAVER_KEY);
  const signature = hmac.update(mes.join('')).digest('base64');
  return signature;
}

export async function sendEmail(email: string, suburl: string, type: number) {
  const email_number = crypto.randomBytes(256).toString('hex').substr(100, 20);
  try {
    if (type !== 1) {
      const user = await userRep.findOne({ where: { email } });
      if (user) return 'Already Existed Email';
    }
    myCache.del(email);
    const regex = /^[0-9a-zA-Z]([-_\\.]?[0-9a-zA-Z])*@[0-9a-zA-Z]([-_.]?[0-9a-zA-Z])*.[a]{1}[c]{1}.[k]{1}[r]{1}$/i;
    const actest = regex.test(email);
    const regExp = /^[0-9a-zA-Z]([-_\\.]?[0-9a-zA-Z])*@[0-9a-zA-Z]([-_.]?[0-9a-zA-Z])*.[e]{1}[d]{1}[u]{1}$/i;
    const edutest = regExp.test(email);
    if (!(edutest || actest)) return 'Try with Student Email';
    const url = `http://${suburl}/api/v1/auth/email/verification?email_number=${email_number}`;
    await transporter.sendMail({
      from: '"발신전용" <noreply@deliversity.co.kr>',
      to: email,
      subject: 'Deliversity 인증 메일입니다.',
      html: `<h3>이메일 인증을 위해 URL을 클릭해주세요.</h3><br>${url}`,
    });
    myCache.set(email_number, { email, createdAt: Date.now() });
    return null;
  } catch (e) {
    myCache.del(email);
    myCache.del(email_number);
    return 'Sent Auth Email Failed';
  }
}

export async function pwEmail(email: string, hashPW: string) {
  try {
    await transporter.sendMail({
      from: '"발신전용" <noreply@deliversity.co.kr>',
      to: email,
      subject: 'Deliversity 변경된 임시 비밀번호입니다.',
      html: `<h3>로그인 후 변경해주세요.</h3><br>${hashPW}`,
    });
    return null;
  } catch (e) {
    return 'Sent PW Email Failed';
  }
}

export async function emailVerify(verify: string) {
  try {
    const veri = myCache.take(verify) as classes.Veri;
    if (!veri) {
      myCache.del(verify);
      return 'Not Matched.';
    }
    const now = Number.parseInt(Date.now().toString(), 10);
    const created = veri.createdAt;
    const remainingTime = (now - created) / 60000;
    if (remainingTime > 15) {
      myCache.del(verify);
      return 'Time Expired';
    }
    myCache.set(veri.email as string, { verify: 1, updatedAt: Date.now() });
    return null;
  } catch (e) {
    return 'Retry.';
  }
}

export async function getAuthToken(user: User) {
  const uid = user.firebaseUid;
  const firebaseToken = await admin.auth().createCustomToken(uid);
  const authToken = jwt.sign({
    ...new classes.payLoad(user),
  }, process.env.JWT_SECRET as jwt.Secret, {
    expiresIn: '7d',
  });
  const payload = {
    firebaseToken,
    authToken,
  };
  return payload;
}

export async function sendSMStoAdmin() {
  const sendFrom = process.env.SEND_FROM;
  const serviceID = encodeURIComponent(process.env.NAVER_SMS_SERVICE_ID as string);
  const timestamp = Date.now().toString();
  const urlsub = `/sms/v2/services/${serviceID}/messages`;
  const signature = makeSignature(urlsub, timestamp);
  const data = {
    type: 'SMS',
    contentType: 'COMM',
    countryCode: '82',
    from: sendFrom,
    content: 'Deliverssity Server Started.',
    messages: [{ to: sendFrom }],
  };
  try {
    const Token = await axios({
      url: `https://sens.apigw.ntruss.com/sms/v2/services/${serviceID}/messages`,
      method: 'post', // POST method
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'x-ncp-apigw-timestamp': timestamp,
        'x-ncp-iam-access-key': process.env.NAVER_KEY,
        'x-ncp-apigw-signature-v2': signature,
      }, // "Content-Type": "application/json"
      data,
    });
    const tokenData = Token.data;
    if (tokenData.statusCode === '202') return null;
    return '문자 전송 실패';
  } catch (e) {
    return '문자 전송 실패';
  }
}

export async function sendSMS(phone: string, type: number) {
  const sendFrom = process.env.SEND_FROM;
  const serviceID = encodeURIComponent(process.env.NAVER_SMS_SERVICE_ID as string);
  const timestamp = Date.now().toString();
  const urlsub = `/sms/v2/services/${serviceID}/messages`;
  const signature = makeSignature(urlsub, timestamp);
  const randomNumber = Math.floor(Math.random() * (999999 - 100000)) + 100000;
  const data = {
    type: 'SMS',
    contentType: 'COMM',
    countryCode: '82',
    from: sendFrom,
    content: `Deliversity 인증번호 ${randomNumber} 입니다.`,
    messages: [{ to: phone }],
  };
  try {
    if (type !== 1) {
      const user = await userRep.findOne({ where: { phone } });
      if (user) return 'phone number duplicated.';
    }
    myCache.del(phone);
    const Token = await axios({
      url: `https://sens.apigw.ntruss.com/sms/v2/services/${serviceID}/messages`,
      method: 'post', // POST method
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'x-ncp-apigw-timestamp': timestamp,
        'x-ncp-iam-access-key': process.env.NAVER_KEY,
        'x-ncp-apigw-signature-v2': signature,
      }, // "Content-Type": "application/json"
      data,
    });
    const tokenData = Token.data;
    myCache.set(phone, { number: randomNumber, createdAt: Date.now() });
    if (tokenData.statusCode === '202') return null;
    return '문자 전송 실패';
  } catch (e) {
    myCache.del(phone);
    return '문자 전송 실패';
  }
}

export async function smsVerify(phone: string, verify: string) {
  try {
    const veri = myCache.take(phone) as classes.Veri;
    if (!veri) {
      myCache.del(phone);
      return 'Retry.';
    }
    // console.log(typeof (veri.number), typeof (verify));
    if (veri.number && veri.number !== parseInt(verify, 10)) {
      myCache.del(phone);
      return 'Not Matched.';
    }
    const now = Number.parseInt(Date.now().toString(), 10);
    const created = veri.createdAt;
    const remainingTime = (now - created) / 60000;
    if (remainingTime > 15) { // 15분
      myCache.del(phone);
      return 'Time Expired.';
    }
    myCache.set(phone, { verify: 1, updatedAt: Date.now() });
    return null;
  } catch (e) {
    return 'Retry.';
  }
}

export async function getUserFromGoogleInfo(idToken: string) {
  const ret = await axios({
    url: 'https://www.googleapis.com/oauth2/v3/tokeninfo',
    method: 'GET',
    params: {
      id_token: idToken,
    },
  });
  if (!ret) return null;
  const user = await userRep.findOne({
    where: {
      googleOAuth: ret.data.sub,
    },
  });
  if (!user) {
    return {
      id: ret.data.sub,
    };
  }
  return {
    id: ret.data.sub,
    user,
  };
}

export async function getUserFromKakaoInfo(accessToken: string) {
  const ret = await axios({
    url: 'https://kapi.kakao.com/v1/user/access_token_info',
    method: 'GET',
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
  if (!ret) return null;
  const user = await userRep.findOne({
    where: {
      kakaoOAuth: ret.data.id,
    },
  });
  if (!user) {
    return {
      id: ret.data.id,
    };
  }
  return {
    id: ret.data.id,
    user,
  };
}

export function getDistanceFromLatLonInKm(lat1: string, lng1: string, lat2: string, lng2: string) {
  function deg2rad(deg: number) {
    return deg * (Math.PI / 180);
  }

  const R = 6371; // Radius of the earth in km
  const dLat = deg2rad(parseFloat(lat2) - parseFloat(lat1)); // deg2rad below
  const dLon = deg2rad(parseFloat(lng2) - parseFloat(lng1));
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2)
    + Math.cos(deg2rad(parseFloat(lat1))) * Math.cos(deg2rad(parseFloat(lat2)))
    * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c; // Distance in km
  return d;
}

export function sendFCMMessage(tokens: string | string[],
  payload: admin.messaging.MessagingPayload) {
  admin.messaging().sendToDevice(tokens, payload, { priority: 'high' })
    .then((response) => {
      console.log(response.results[0]);
      return true;
    })
    .catch((error) => {
      console.log('Error sending message:', error);
      return false;
    });
}


export function getBankCode(bankKind: string) {
  const bankCode = [
    { bank: 'KDB 산업은행', code: '002' },
    { bank: 'SC 제일은행', code: '023' },
    { bank: '전북은행', code: '037' },
    { bank: 'IBK 기업은행', code: '003' },
    { bank: '한국씨티은행', code: '027' },
    { bank: '경남은행', code: '039' },
    { bank: 'KB 국민은행', code: '004' },
    { bank: '대구은행', code: '031' },
    { bank: '하나은행', code: '081' },
    { bank: '수협은행', code: '007' },
    { bank: '부산은행', code: '032' },
    { bank: '신한은행', code: '088' },
    { bank: 'NH 농협은행', code: '011' },
    { bank: '광주은행', code: '034' },
    { bank: '케이뱅크', code: '089' },
    { bank: '우리은행', code: '020' },
    { bank: '제주은행', code: '035' },
    { bank: '카카오뱅크', code: '090' },
    { bank: '오픈은행', code: '097' },
  ];
  const bank = bankCode.filter((it) => it.bank === bankKind);
  if (!bank[0] || bank.length > 1) return false;
  return bank[0].code;
}

export async function sendMoney(token: string, refund: Refund, user: User, padNum: string) {
  const bankCode = getBankCode(refund.bankKind);
  if (!bankCode) return false;
  const data = await axios({
    url: 'https://testapi.openbanking.or.kr/v2.0/transfer/deposit/acnt_num',
    headers: {
      Authorization: `Bearer ${token}`, // Access_Token 추가 (oob, sa 뭐냐)
    },
    data: {
      cntr_account_type: 'N', // N=> 계좌, C=>계정, 약정 계좌 구분
      cntr_account_num: process.env.OPEN_ACCOUNT, // 약정 계좌 또는 계정
      wd_pass_phrase: 'NONE', // 테스트용도로는 NONE을 사용
      wd_print_content: '환급', // 출금되는 통장에 찍히는 내역
      name_check_option: 'on',
      tran_dtime: '20201001150133', // 거래 일시
      req_cnt: '1', // 1 고정이라고 합니다. 2 이상 못씀.
      req_list: [
        {
          tran_no: '1', // 거래 순번
          bank_tran_id: padNum, // 거래고유번호
          bank_code_std: bankCode, // 입금 계좌 은행 코드
          account_num: refund.accountNum, // 입금 계좌 번호
          account_holder_name: refund.accountName, // 입금계좌예금주명
          print_content: '환급', // 인자내역, 입금되는 통장에 찍히는거
          tran_amt: refund.amount, // 거래금액
          req_client_name: refund.accountName, // 환급을 요청한 사람 이름 (고객이겠징)
          req_client_bank_code: bankCode, // 환급을 요청한 사람의 계좌 은행 코드
          req_client_account_num: refund.accountNum, // 환급을 요청한 사람의 계좌
          req_client_num: user.id, // 유저의 고유번호를 우리가 넣으면 될듯
          transfer_purpose: 'TR', // 이체
        },
      ],
    },
    method: 'post',
  });
  return data;
}

export async function findEmail(email: string) {
  try {
    myCache.del(email);
    const regex = /^[0-9a-zA-Z]([-_\\.]?[0-9a-zA-Z])*@[0-9a-zA-Z]([-_.]?[0-9a-zA-Z])*.[a]{1}[c]{1}.[k]{1}[r]{1}$/i;
    const actest = regex.test(email);
    const regExp = /^[0-9a-zA-Z]([-_\\.]?[0-9a-zA-Z])*@[0-9a-zA-Z]([-_.]?[0-9a-zA-Z])*.[e]{1}[d]{1}[u]{1}$/i;
    const edutest = regExp.test(email);
    if (!(edutest || actest)) return 'Try with Student Email';
    const url = Math.floor(Math.random() * (999999 - 100000)) + 100000;
    await transporter.sendMail({
      from: '"발신전용" <noreply@deliversity.co.kr>',
      to: email,
      subject: 'Deliversity 인증 메일입니다.',
      html: `<h3>인증번호는</h3>${url}<h3>입니다.</h3>`,
    });
    myCache.set(email, { number: url, createdAt: Date.now() });
    return null;
  }
  catch (e) {
    myCache.del(email);
    return 'Sent Auth Email Failed';
  }
}

export async function findemailVerify(email: string, verify: string) {
  try {
    const veri = myCache.take(email) as classes.Veri;
    if (!veri) {
      myCache.del(verify);
      return 'Retry.';
    }
    if (veri.number && veri.number !== parseInt(verify, 10)) {
      myCache.del(email);
      return 'Not Matched.';
    }
    const now = Number.parseInt(Date.now().toString(), 10);
    const created = veri.createdAt;
    const remainingTime = (now - created) / 60000;
    if (remainingTime > 15) { // 15분
      myCache.del(email);
      return 'Time Expired.';
    }
    myCache.set(email, { verify: 1, updatedAt: Date.now() });
    return null;
  } catch (e) {
    return 'Retry.';
  }
}
