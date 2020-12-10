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
exports.admin = exports.myCache = void 0;
const express_1 = require("express");
const util = __importStar(require("../config/util"));
const index_1 = require("../models/index");
const functions = __importStar(require("../config/functions"));
const axios_1 = __importDefault(require("axios"));
const node_cache_1 = __importDefault(require("node-cache"));
exports.myCache = new node_cache_1.default();
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
exports.admin = express_1.Router();
exports.admin.get('/uploads', util.isLoggedin, util.isAdmin, function (req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        //민증 확인 리스트 반환
        try {
            const list = yield index_1.userRep.findAll({ where: { grade: 1 }, attributes: ['id', 'userId'] });
            if (!list)
                return res.status(403).json(util.successFalse(null, "현재 인증을 기다리는 회원이 없습니다.", null));
            return res.json(util.successTrue("", list));
        }
        catch (err) {
            return res.status(403).json(util.successFalse(err, "", null));
        }
    });
});
exports.admin.get('/upload', util.isLoggedin, util.isAdmin, function (req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        //상세내용 반환
        const reqQuery = req.query;
        const id = parseInt(reqQuery.id);
        try {
            const user = yield index_1.userRep.findOne({ where: { id: id } });
            if (!user) {
                return res.status(403).json(util.successFalse(null, "해당하는 유저가 없습니다.", null));
            }
            if (user.grade == 2) {
                return res.status(403).json(util.successFalse(null, "이미 인증된 유저입니다.", null));
            }
            else if (user.grade == 0) {
                return res.status(403).json(util.successFalse(null, "인증을 요청하지 않은 유저입니다.", null));
            }
            if (!user.idCard)
                return res.status(403).json(util.successFalse(null, "해당 유저가 사진을 등록하지 않았습니다.", null));
            return res.json(util.successTrue("", user));
        }
        catch (err) {
            return res.status(403).json(util.successFalse(err, "", null));
        }
    });
});
exports.admin.put('/upload', util.isLoggedin, util.isAdmin, function (req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        //민증인증 처리
        const reqQuery = req.query;
        let registrationToken;
        const reqBody = req.body;
        const id = parseInt(reqQuery.id);
        const result = parseInt(reqBody.result);
        try {
            let user = yield index_1.userRep.findOne({ where: { id: id }, attributes: ['id', 'grade'] });
            if (!user) {
                return res.status(403).json(util.successFalse(null, "해당하는 유저가 없습니다.", null));
            }
            if (user.grade == 2) {
                return res.status(403).json(util.successFalse(null, "이미 인증된 유저입니다.", null));
            }
            else if (user.grade == 0) {
                return res.status(403).json(util.successFalse(null, "인증을 요청하지 않은 유저입니다.", null));
            }
            // 통과
            if (result == 1) {
                user = yield user.update({ grade: 2 });
                registrationToken = user.firebaseFCM;
                if (registrationToken) {
                    const message = {
                        data: {
                            test: "인증이 완료되었습니다." + registrationToken
                        },
                    };
                    functions.sendFCMMessage(registrationToken, message);
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
            user = yield user.update({ grade: 0 });
            return res.status(403).json(util.successFalse(null, "승인거절", null));
        }
        catch (err) {
            return res.status(403).json(util.successFalse(err, "", null));
        }
    });
});
exports.admin.get('/reports', util.isLoggedin, util.isAdmin, function (req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        //신고 리스트 반환
        try {
            const lists = yield index_1.reportRep.findAll({ where: { status: 0 }, attributes: ['id', 'orderId', 'reportKind', 'fromId'] });
            if (!lists)
                return res.status(403).json(util.successFalse(null, "현재 처리를 기다리는 신고가 없습니다.", null));
            return res.json(util.successTrue("", lists));
        }
        catch (err) {
            return res.status(403).json(util.successFalse(err, "", null));
        }
    });
});
exports.admin.get('/report', util.isLoggedin, util.isAdmin, function (req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        //신고 상세내용보기
        const reqQuery = req.query;
        const reportId = parseInt(reqQuery.reportId);
        try {
            const report = yield index_1.reportRep.findOne({ where: { id: reportId }, attributes: ['id', 'reportKind', 'orderId', 'userId', 'riderId', 'fromId', 'content'] });
            if (!report) {
                return res.status(403).json(util.successFalse(null, "해당하는 신고 내역이 없습니다.", null));
            }
            return res.json(util.successTrue("", report));
        }
        catch (err) {
            return res.status(403).json(util.successFalse(err, "", null));
        }
    });
});
exports.admin.put('/report', util.isLoggedin, util.isAdmin, function (req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        //신고 답변 작성
        const reqQuery = req.query;
        const reqBody = req.body;
        const reportId = parseInt(reqQuery.reportId);
        const answer = reqBody.answer;
        try {
            const answered_report = yield index_1.reportRep.findOne({ where: { id: reportId } });
            if (!answered_report) {
                return res.status(403).json(util.successFalse(null, "해당하는 문의가 없습니다.", null));
            }
            if (answered_report.status) {
                return res.status(403).json(util.successFalse(null, "이미 처리된 문의입니다.", null));
            }
            yield answered_report.update({ answer: answer, status: true });
            return res.json(util.successTrue("", answered_report));
        }
        catch (err) {
            return res.status(403).json(util.successFalse(err, "", null));
        }
    });
});
exports.admin.get('/qnas', util.isLoggedin, util.isAdmin, function (req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        //문의 리스트 반환
        try {
            const lists = yield index_1.qnaRep.findAll({ where: { status: 0 }, attributes: ['id', 'qnaKind'] });
            if (!lists)
                return res.status(403).json(util.successFalse(null, "현재 처리를 기다리는 문의가 없습니다.", null));
            return res.json(util.successTrue("", lists));
        }
        catch (err) {
            return res.status(403).json(util.successFalse(err, "", null));
        }
    });
});
exports.admin.get('/qna', util.isLoggedin, util.isAdmin, function (req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        //문의 상세내용보기
        const reqQuery = req.query;
        const qnaId = parseInt(reqQuery.qnaId);
        try {
            const question = yield index_1.qnaRep.findOne({ where: { id: qnaId } });
            if (!question) {
                return res.status(403).json(util.successFalse(null, "해당하는 문의 내역이 없습니다.", null));
            }
            return res.json(util.successTrue("", question));
        }
        catch (err) {
            return res.status(403).json(util.successFalse(err, "", null));
        }
    });
});
exports.admin.put('/qna', util.isLoggedin, util.isAdmin, function (req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        //문의 답변 작성
        const reqQuery = req.query;
        const reqBody = req.body;
        const qnaId = parseInt(reqQuery.qnaId);
        const answer = reqBody.answer;
        try {
            const answered_qna = yield index_1.qnaRep.findOne({ where: { id: qnaId } });
            if (!answered_qna) {
                return res.status(403).json(util.successFalse(null, "해당하는 문의가 없습니다.", null));
            }
            if (answered_qna.status) {
                return res.status(403).json(util.successFalse(null, "이미 처리된 문의입니다.", null));
            }
            yield answered_qna.update({ answer: answer, status: true });
            return res.json(util.successTrue("", answered_qna));
        }
        catch (err) {
            return res.status(403).json(util.successFalse(err, "", null));
        }
    });
});
exports.admin.get('/refunds', util.isLoggedin, util.isAdmin, function (req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        //환급 리스트 반환
        try {
            const refunds = yield index_1.refundRep.findAll({ where: { status: 0 }, attributes: ['id', 'status'] });
            if (!refunds)
                return res.status(403).json(util.successFalse(null, "현재 입금을 기다리는 환급이 없습니다.", null));
            return res.json(util.successTrue("", refunds));
        }
        catch (err) {
            return res.status(403).json(util.successFalse(err, "", null));
        }
    });
});
exports.admin.get('/refund', util.isLoggedin, util.isAdmin, function (req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        //환급 상세내용보기
        const reqQuery = req.query;
        const refundId = parseInt(reqQuery.refundId);
        try {
            if (!refundId)
                return res.status(403).json(util.successFalse(null, "환급 아이디를 넣어주세요.", null));
            const refund = yield index_1.refundRep.findOne({ where: { id: refundId } });
            if (!refund)
                return res.status(403).json(util.successFalse(null, "해당하는 입금 신청 내역이 없습니다.", null));
            return res.json(util.successTrue("", refund));
        }
        catch (err) {
            return res.status(403).json(util.successFalse(err, "", null));
        }
    });
});
exports.admin.get('/openToken', util.isLoggedin, util.isAdmin, function (req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const data = yield axios_1.default({
                url: 'https://testapi.openbanking.or.kr/oauth/2.0/token',
                params: {
                    "client_id": process.env.OPEN_API,
                    "client_secret": process.env.OPEN_SECRET,
                    "scope": "oob",
                    "grant_type": "client_credentials"
                },
                method: 'post'
            });
            exports.myCache.set('OpenBankingToken', data.data.access_token);
            console.log(data.data.access_token);
            return res.json(util.successTrue("", null));
        }
        catch (e) {
            return res.status(403).json(util.successFalse(null, "토큰 발급 실패", null));
        }
    });
});
exports.admin.put('/refund', util.isLoggedin, util.isAdmin, function (req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        //환급 답변 작성
        const reqQuery = req.query;
        const reqBody = req.body;
        const refundId = parseInt(reqQuery.refundId);
        const complete = parseInt(reqBody.complete);
        const today = new Date();
        today.setFullYear(today.getFullYear(), today.getMonth(), today.getDay());
        try {
            const refund = yield index_1.refundRep.findOne({ where: { id: refundId } });
            if (!refund)
                return res.status(403).json(util.successFalse(null, "해당하는 입금 신청 내역이 없습니다.", null));
            if (refund.status)
                return res.status(403).json(util.successFalse(null, "이미 입금이 완료된 신청입니다.", null));
            if (complete !== 1)
                return res.status(403).json(util.successFalse(null, "환급 실패", null));
            const user = yield index_1.userRep.findOne({ where: { id: refund.userId } });
            if (!user)
                return res.status(403).json(util.successFalse(null, "해당하는 유저가 없습니다.", null));
            // if(user.name != refund.accountName) return res.status(403).json(util.successFalse(null, "사용자명과 환급 계좌 명의가 다릅니다.", null));
            const padNum = "T991672410U" + String(Math.floor(Math.random() * 1000000000) + 1).padStart(9, '0');
            const token = exports.myCache.get('OpenBankingToken');
            if (!token)
                return res.status(403).json(util.successFalse(null, "토큰을 발급해주세요.", null));
            const trans = yield functions.sendMoney(token, refund, user, padNum);
            if (trans == false)
                return res.status(403).json(util.successFalse(null, "은행명을 다시 입력해주세요.", null));
            if (trans.data.rsp_code != "A0000")
                return res.status(403).json(util.successFalse(null, "환급 실패", null));
            yield refund.update({ status: true, refundAt: today, bankTranId: padNum });
            return res.json(util.successTrue("", refund));
        }
        catch (err) {
            return res.status(403).json(util.successFalse(err, "", null));
        }
    });
});
