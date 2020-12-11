"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.point = void 0;
const express_1 = require("express");
const dotenv_1 = __importDefault(require("dotenv"));
const axios_1 = __importDefault(require("axios"));
const util = __importStar(require("../config/util"));
const index_1 = require("../models/index");
dotenv_1.default.config();
exports.point = express_1.Router();
// 포인트 조회
exports.point.get('/', util.isLoggedin, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const tokenData = req.decoded;
    const _point = yield index_1.pointRep.findAll({ where: { userId: tokenData.id, status: false } });
    const sum = _point.reduce((_sum, cur) => _sum + cur.point, 0);
    if (sum < 0)
        return res.status(403).json(util.successFalse(null, '포인트 반환 실패', null));
    return res.json(util.successTrue('', { point: sum.toString() }));
}));
// 충전하기(결제)
exports.point.post('/', util.isLoggedin, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const reqBody = req.body;
    const tokenData = req.decoded;
    const user = yield index_1.userRep.findOne({ where: { id: tokenData.id } });
    if (!user)
        return res.status(403).json(util.successFalse(null, '포인트 충전 실패', null));
    const today = new Date();
    today.setFullYear(today.getFullYear() + 3, today.getMonth(), today.getDay());
    const { imp_uid, merchant_uid } = reqBody; // req의 body에서 imp_uid, merchant_uid 추출
    const getToken = yield axios_1.default({
        url: 'https://api.iamport.kr/users/getToken',
        method: 'post',
        headers: { 'Content-Type': 'application/json' },
        data: {
            imp_key: process.env.IMP_KEY,
            imp_secret: process.env.IMP_SECRET,
        },
    });
    const { access_token } = getToken.data.response;
    const getPaymentData = yield axios_1.default({
        url: `https://api.iamport.kr/payments/${imp_uid}`,
        method: 'get',
        headers: { Authorization: access_token },
    });
    const paymentData = getPaymentData.data.response; // 조회한 결제 정보
    // const amountToBePaid = parseInt(reqBody.point, 10);
    const { amount, status } = paymentData;
    if (reqBody.point === amount) {
        const receipt = yield index_1.paymentRep.findOne({ where: { userId: tokenData.id, impUid: imp_uid } });
        if (receipt) {
            return res.status(403).json(util.successFalse(null, '이미 충전되었습니다.', null));
        }
        yield index_1.paymentRep.create({
            userId: tokenData.id,
            state: 0,
            impUid: imp_uid,
            merchantUid: merchant_uid,
            amount,
        });
        yield index_1.pointRep.create({
            point: reqBody.point,
            pointKind: 0,
            userId: tokenData.id,
            status: 0,
            expireAt: today,
        });
        return res.json(util.successTrue('', status));
    } // 결제 금액 불일치. 위/변조 된 결제
    return res.status(403).json(util.successFalse(null, '결제 금액과 충전 금액이 다릅니다.', null));
}));
// 포인트 환급 신청
exports.point.post('/refund', util.isLoggedin, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const tokenData = req.decoded;
    const reqBody = req.body;
    let amountToBeRefund = parseInt(reqBody.point, 10);
    const amount = amountToBeRefund;
    if (!amountToBeRefund)
        return res.status(403).json(util.successFalse(null, '환급 금액을 입력해주세요.', null));
    const { accountName } = reqBody;
    if (!accountName)
        return res.status(403).json(util.successFalse(null, '계좌에 등록된 이름을 입력해주세요.', null));
    const { bankKind } = reqBody;
    if (!bankKind)
        return res.status(403).json(util.successFalse(null, '은행 종류를 입력해주세요.', null));
    const { accountNum } = reqBody;
    if (!accountNum)
        return res.status(403).json(util.successFalse(null, '계좌 번호를 입력해주세요.', null));
    const points = yield index_1.pointRep.findAll({ where: { userId: tokenData.id }, order: [['expireAt', 'ASC']] });
    const sum = points.reduce((_sum, cur) => _sum + cur.point, 0);
    if (sum < amountToBeRefund)
        return res.status(403).json(util.successFalse(null, '포인트가 모자랍니다.', null));
    points.some((_point) => __awaiter(void 0, void 0, void 0, function* () {
        if (amountToBeRefund) {
            const curPoint = _point.point;
            if (amountToBeRefund <= _point.point) {
                yield _point.update({ point: curPoint - amountToBeRefund });
                amountToBeRefund = 0;
                return true;
            }
            yield _point.update({ point: 0 });
            yield _point.destroy();
            amountToBeRefund -= curPoint;
            return false;
        }
        return true;
    }));
    /* 환급 내역 */
    yield index_1.refundRep.create({
        userId: tokenData.id,
        accountName,
        bankKind,
        accountNum,
        amount,
        status: 0,
    });
    return res.json(util.successTrue('', null));
}));
