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
exports.admin = void 0;
const express_1 = require("express");
const util = __importStar(require("../config/util"));
const index_1 = require("../models/index");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
exports.admin = express_1.Router();
exports.admin.get('/uploads', util.isLoggedin, util.isAdmin, function (req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        //민증 확인 리스트 반환
        try {
            yield index_1.userRep.findAll({
                where: { grade: 1 },
                attributes: ['id', 'userId']
            }).then((list) => {
                if (!list)
                    return res.status(403).json(util.successFalse(null, "현재 인증을 기다리는 회원이 없습니다.", null));
                return res.json(util.successTrue("", list));
            });
        }
        catch (err) {
            return res.status(403).json(util.successFalse(err, "", null));
        }
    });
});
exports.admin.get('/upload/:id', util.isLoggedin, util.isAdmin, function (req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        //상세내용 반환
        const id = req.params.id;
        try {
            yield index_1.userRep.findOne({
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
                if (!user.idCard)
                    return res.status(403).json(util.successFalse(null, "해당 유저가 사진을 등록하지 않았습니다.", null));
                return res.json(util.successTrue("", {
                //  Id: user.id, userId: user.userId, idCard: user.idCard
                }));
            });
        }
        catch (err) {
            return res.status(403).json(util.successFalse(err, "", null));
        }
    });
});
exports.admin.put('/upload', util.isLoggedin, util.isAdmin, function (req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        //민증인증 처리
        const reqBody = req.body;
        const id = reqBody.id;
        const result = reqBody.result;
        try {
            yield index_1.userRep.findOne({
                where: {
                    id: id,
                },
                attributes: ['id', 'grade']
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
            yield index_1.reportRep.findAll({
                where: { status: 0 },
                attributes: ['id', 'orderId', 'reportKind', 'fromId']
            }).then((lists) => {
                if (!lists)
                    return res.status(403).json(util.successFalse(null, "현재 처리를 기다리는 신고가 없습니다.", null));
                return res.json(util.successTrue("", lists));
            });
        }
        catch (err) {
            return res.status(403).json(util.successFalse(err, "", null));
        }
    });
});
exports.admin.get('/report/:id', util.isLoggedin, util.isAdmin, function (req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        //신고 상세내용보기
        const reportId = req.params.id;
        try {
            yield index_1.reportRep.findOne({
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
        }
        catch (err) {
            return res.status(403).json(util.successFalse(err, "", null));
        }
    });
});
exports.admin.put('/report', util.isLoggedin, util.isAdmin, function (req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        //신고 답변 작성
        const reqBody = req.body;
        const reportId = reqBody.reportId;
        const answer = reqBody.answer;
        try {
            yield index_1.reportRep.findOne({
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
            yield index_1.qnaRep.findAll({
                where: { status: 0 },
                attributes: ['id', 'qnaKind']
            }).then((lists) => {
                if (!lists)
                    return res.status(403).json(util.successFalse(null, "현재 처리를 기다리는 문의가 없습니다.", null));
                return res.json(util.successTrue("", lists));
            });
        }
        catch (err) {
            return res.status(403).json(util.successFalse(err, "", null));
        }
    });
});
exports.admin.get('/qna/:id', util.isLoggedin, util.isAdmin, function (req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        //문의 상세내용보기
        const qnaId = req.params.id;
        try {
            yield index_1.qnaRep.findOne({
                where: {
                    id: qnaId
                }
            }).then((qna) => {
                if (!qna) {
                    return res.status(403).json(util.successFalse(null, "해당하는 문의 내역이 없습니다.", null));
                }
                return res.json(util.successTrue("", {
                    qnaId: qna.id, qnaKind: qna.qnaKind, userId: qna.userId,
                    content: qna.content
                }));
            });
        }
        catch (err) {
            return res.status(403).json(util.successFalse(err, "", null));
        }
    });
});
exports.admin.put('/qna', util.isLoggedin, util.isAdmin, function (req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        //문의 답변 작성
        const reqBody = req.body;
        const qnaId = reqBody.qnaId;
        const answer = reqBody.answer;
        try {
            yield index_1.qnaRep.findOne({
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
        }
        catch (err) {
            return res.status(403).json(util.successFalse(err, "", null));
        }
    });
});
