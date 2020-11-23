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
exports.myinfo = void 0;
const express_1 = require("express");
const util = __importStar(require("../config/util"));
const index_1 = require("../models/index");
const crypto = __importStar(require("crypto"));
const dotenv_1 = __importDefault(require("dotenv"));
const axios_1 = __importDefault(require("axios"));
dotenv_1.default.config();
// const KAKAO = "+proj=tmerc +lat_0=38 +lon_0=127 +k=1 +x_0=200000 +y_0=500000 +ellps=GRS80 +units=m +no_defs"; //5181
// const GRS80 = "+proj=tmerc +lat_0=38 +lon_0=127.5 +k=0.9996 +x_0=1000000 +y_0=2000000 +ellps=GRS80 +units=m +no_defs"; //도로명주소 제공 좌표 5179
// const WGS84 = "+proj=longlat +ellps=WGS84 +datum=WGS84 +units=degrees"; //경위도
exports.myinfo = express_1.Router();
exports.myinfo.get('/', util.isLoggedin, function (req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        //본인 정보 반환
        const tokenData = req.decoded;
        try {
            const _user = yield index_1.userRep.findOne({
                where: {
                    id: tokenData.id
                }
            });
            if (!_user)
                return res.status(403).json(util.successFalse(null, "해당 하는 유저가 없습니다.", null));
            const user = {
                id: _user.id,
                userId: _user.userId,
                name: _user.name,
                nickName: _user.nickName,
                gender: _user.gender,
                age: _user.age,
                email: _user.email,
                phone: _user.phone,
                addressId: _user.addressId,
                grade: _user.grade,
                createdAt: _user.createdAt,
                updatedAt: _user.updatedAt
            };
            return res.json(util.successTrue("", user));
        }
        catch (err) {
            return res.status(403).json(util.successFalse(err, "", null));
        }
    });
});
exports.myinfo.put('/', util.isLoggedin, function (req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        //본인 정보 수정
        const tokenData = req.decoded;
        const reqBody = req.body;
        let salt = null, hashedPw = null;
        try {
            const _user = yield index_1.userRep.findOne({
                where: {
                    id: tokenData.id
                }
            });
            if (!_user)
                return res.status(403).json(util.successFalse(null, "해당 하는 유저가 없습니다.", null));
            if (reqBody.pw) {
                const buffer = crypto.randomBytes(64);
                salt = buffer.toString('base64');
                const key = crypto.pbkdf2Sync(reqBody.pw, salt, 100000, 64, 'sha512');
                hashedPw = key.toString('base64');
            }
            if (reqBody.nickName) {
                const nickExist = yield index_1.userRep.findOne({
                    where: {
                        nickName: reqBody.nickName
                    }
                });
                if (nickExist)
                    return res.status(403).json(util.successFalse(null, "닉네임이 중복되었습니다.", null));
            }
            yield _user.update({
                password: hashedPw ? hashedPw : _user.password,
                salt: salt ? salt : _user.salt,
                nickName: reqBody.nickName ? reqBody.nickName : _user.nickName
            });
            const user = {
                id: _user.id,
                userId: _user.userId,
                name: _user.name,
                nickName: _user.nickName,
                gender: _user.gender,
                age: _user.age,
                email: _user.email,
                phone: _user.phone,
                addressId: _user.addressId,
                grade: _user.grade,
                createdAt: _user.createdAt,
                updatedAt: _user.updatedAt
            };
            return res.json(util.successTrue("", user));
        }
        catch (err) {
            return res.status(403).json(util.successFalse(err, "", null));
        }
    });
});
exports.myinfo.get('/address/list', util.isLoggedin, function (req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        //자기 주소 리스트 반환
        const tokenData = req.decoded;
        try {
            const addressList = yield index_1.addressRep.findAll({
                where: {
                    userId: tokenData.id
                }
            });
            if (!addressList)
                return res.status(403).json(util.successFalse(null, "해당 하는 주소가 없습니다.", null));
            return res.json(util.successTrue("", addressList));
        }
        catch (err) {
            return res.status(403).json(util.successFalse(err, "", null));
        }
    });
});
exports.myinfo.put('/address/set', util.isLoggedin, function (req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        //기본 주소 설정
        const tokenData = req.decoded;
        const reqBody = req.body;
        try {
            const user = yield index_1.userRep.findOne({
                where: {
                    id: tokenData.id
                }
            });
            if (!user)
                return res.status(403).json(util.successFalse(null, "해당 하는 유저가 없습니다.", null));
            const address = yield index_1.addressRep.findOne({
                where: {
                    id: reqBody.addressId,
                    userId: tokenData.id
                }
            });
            if (!address)
                return res.status(403).json(util.successFalse(null, "해당 하는 주소가 없습니다.", null));
            yield user.update({
                addressId: reqBody.addressId
            });
            return res.json(util.successTrue("", address));
        }
        catch (err) {
            return res.status(403).json(util.successFalse(err, "", null));
        }
    });
});
exports.myinfo.get('/address', util.isLoggedin, function (req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        //기본 주소 반환
        const tokenData = req.decoded;
        try {
            const user = yield index_1.userRep.findOne({
                where: {
                    id: tokenData.id
                }
            });
            if (!user)
                return res.status(403).json(util.successFalse(null, "해당 하는 유저가 없습니다.", null));
            const address = yield index_1.addressRep.findOne({
                where: {
                    id: user.addressId,
                    userId: tokenData.id
                }
            });
            if (!address)
                return res.status(403).json(util.successFalse(null, "해당 하는 주소가 없습니다.", null));
            return res.json(util.successTrue("", address));
        }
        catch (err) {
            return res.status(403).json(util.successFalse(err, "", null));
        }
    });
});
exports.myinfo.post('/address', util.isLoggedin, function (req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        //주소 추가
        const tokenData = req.decoded;
        const reqBody = req.body;
        try {
            const coord = yield axios_1.default({
                url: `https://dapi.kakao.com/v2/local/search/address.json?query=${encodeURIComponent(reqBody.address)}`,
                method: 'get',
                headers: { Authorization: `KakaoAK ${process.env.KAKAO_KEY}` }
            });
            const address = yield index_1.addressRep.create({
                userId: tokenData.id,
                address: reqBody.address,
                detailAddress: reqBody.detailAddress,
                locX: coord.data.documents[0].y,
                locY: coord.data.documents[0].x
            });
            if (reqBody.setDefault == "1") {
                yield index_1.userRep.update({
                    addressId: address.id
                }, {
                    where: {
                        id: tokenData.id
                    }
                });
            }
            return res.json(util.successTrue("", address));
        }
        catch (err) {
            return res.status(403).json(util.successFalse(err, "", null));
        }
    });
});
exports.myinfo.put('/address', util.isLoggedin, function (req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        //주소 변경
        const tokenData = req.decoded;
        const reqBody = req.body;
        try {
            const old = yield index_1.addressRep.findOne({
                where: {
                    userId: tokenData.id,
                    id: reqBody.addressId
                }
            });
            if (!old)
                return res.status(403).json(util.successFalse(null, "해당 하는 주소가 없습니다.", null));
            yield old.update({
                detailAddress: reqBody.detailAddress ? reqBody.detailAddress : old.detailAddress,
            });
            return res.json(util.successTrue("", old));
        }
        catch (err) {
            console.log(err);
            return res.status(403).json(util.successFalse(err, "?", null));
        }
    });
});
exports.myinfo.delete('/address', util.isLoggedin, function (req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        //주소 삭제
        const tokenData = req.decoded;
        const reqBody = req.body;
        try {
            const address = yield index_1.addressRep.findOne({
                where: {
                    userId: tokenData.id,
                    id: reqBody.addressId
                }
            });
            if (!address)
                return res.status(403).json(util.successFalse(null, "주소 삭제 실패", null));
            address.destroy().then(() => res.json(util.successTrue("주소 삭제 성공", null)));
        }
        catch (err) {
            return res.status(403).json(util.successFalse(err, "", null));
        }
    });
});
exports.myinfo.post('/report', util.isLoggedin, function (req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        //신고 접수(req: reportKind, orderId, content, chat포함여부)
        const tokenData = req.decoded;
        const reqBody = req.body;
        try {
            const order = yield index_1.orderRep.findOne({
                where: { id: reqBody.orderId }
            });
            if (!order)
                return res.status(403).json(util.successFalse(null, "해당하는 주문이 없습니다.", null));
            const userId = order.userId;
            const riderId = order.riderId;
            if (riderId != tokenData.id && userId != tokenData.id)
                return res.status(403).json(util.successFalse(null, "해당 주문과 관련없는 사람은 신고할 수 없습니다.", null));
            const chatId = order.chatId;
            const report = yield index_1.reportRep.create({
                userId: userId,
                riderId: riderId,
                reportKind: reqBody.reportKind,
                orderId: reqBody.orderId,
                fromId: tokenData.id,
                chatId: reqBody.upload_chat == 1 ? chatId : null,
                content: reqBody.content
            });
            return res.json(util.successTrue("", report));
        }
        catch (err) {
            return res.status(403).json(util.successFalse(err, "", null));
        }
    });
});
exports.myinfo.post('/qna', util.isLoggedin, function (req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        //질문 접수 (id, qnakind, userId, content, answer)
        const tokenData = req.decoded;
        const reqBody = req.body;
        try {
            const qna = yield index_1.qnaRep.create({
                userId: tokenData.id,
                qnaKind: reqBody.qnaKind,
                content: reqBody.content
            });
            return res.json(util.successTrue("", qna));
        }
        catch (err) {
            return res.status(403).json(util.successFalse(err, "", null));
        }
    });
});
exports.myinfo.post('/upload', util.isLoggedin, function (req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const tokenData = req.decoded;
        const reqBody = req.body;
        try {
            const user = yield index_1.userRep.findOne({ where: { userId: tokenData.userId } });
            if (!user)
                return res.status(403).json(util.successFalse(null, "해당 하는 유저가 없습니다.", null));
            if (user.grade == 2)
                return res.status(403).json(util.successFalse(null, "이미 신분확인이 완료되었습니다.", null));
            if (user.grade == 1)
                return res.status(403).json(util.successFalse(null, "신분 확인 대기중입니다.", null));
            yield user.update({
                grade: 1,
                idCard: reqBody.idCard
            });
            return res.json(util.successTrue("", { grade: user.grade, idCard: user.idCard }));
        }
        catch (err) {
            return res.status(403).json(util.successFalse(err, "", null));
        }
    });
});
exports.myinfo.post('/currentLocation', util.isLoggedin, util.isUser, function (req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const tokenData = req.decoded;
        const reqBody = req.body;
        try {
            const user = yield index_1.userRep.findOne({ where: { userId: tokenData.userId } });
            if (!user)
                return res.status(403).json(util.successFalse(null, "해당 하는 유저가 없습니다.", null));
            yield user.update({ lat: reqBody.coords.latitude, lng: reqBody.coords.longitude });
            return res.json(util.successTrue("", null));
        }
        catch (err) {
            return res.status(403).json(util.successFalse(err, "", null));
        }
    });
});
////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////
////                              개발용 API입니다. 나중에는 지워야 합니다.                              ////
////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////
exports.myinfo.get('/grade', util.isLoggedin, function (req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const tokenData = req.decoded;
        const reqQuery = req.query;
        try {
            const user = yield index_1.userRep.findOne({ where: { userId: tokenData.userId } });
            if (!user)
                return res.status(403).json(util.successFalse(null, "해당 하는 유저가 없습니다.", null));
            if (reqQuery.grade == null || reqQuery.grade == "")
                return res.status(403).json(util.successFalse(null, "파라미터가 부족합니다.", null));
            if (parseInt(reqQuery.grade) >= 3)
                return res.json(util.successTrue(`4이상으로 올라 갈 수 없습니다.`, null));
            yield user.update({ grade: reqQuery.grade });
            return res.json(util.successTrue("", { grade: user.grade }));
        }
        catch (err) {
            return res.status(403).json(util.successFalse(err, "", null));
        }
    });
});
////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////
