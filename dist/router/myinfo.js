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
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
exports.myinfo = express_1.Router();
exports.myinfo.get('/address/list', util.isLoggedin, function (req, res, next) {
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
exports.myinfo.put('/address/set', util.isLoggedin, function (req, res, next) {
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
            user.update({
                addressId: reqBody.addressId
            });
            return res.json(util.successTrue("", address));
        }
        catch (err) {
            return res.status(403).json(util.successFalse(err, "", null));
        }
    });
});
exports.myinfo.get('/address', util.isLoggedin, function (req, res, next) {
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
exports.myinfo.post('/address', util.isLoggedin, function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        //주소 추가
        const tokenData = req.decoded;
        const reqBody = req.body;
        console.log(tokenData);
        try {
            //작성
            const address = yield index_1.addressRep.create({
                userId: tokenData.id,
                address: reqBody.address,
                detailAddress: reqBody.detailAddress,
                locX: reqBody.locX,
                locY: reqBody.locY
            });
            if (reqBody.setDefault == "1") {
                index_1.userRep.update({
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
exports.myinfo.put('/address', util.isLoggedin, function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        //주소 변경
        const tokenData = req.decoded;
        const reqBody = req.body;
        try {
            const old = yield index_1.addressRep.findOne({
                where: {
                    id: reqBody.addressId
                }
            });
            if (!old)
                return res.status(403).json(util.successFalse(null, "해당 하는 주소가 없습니다.", null));
            const address = yield index_1.addressRep.update({
                address: reqBody.address ? reqBody.address : old.address,
                detailAddress: reqBody.detailAddress ? reqBody.detailAddress : old.detailAddress,
                locX: reqBody.locX ? reqBody.locX : old.locX,
                locY: reqBody.locY ? reqBody.locY : old.locY
            }, {
                where: {
                    id: reqBody.addressId
                }
            });
            return res.json(util.successTrue("", address));
        }
        catch (err) {
            console.log(err);
            return res.status(403).json(util.successFalse(err, "?", null));
        }
    });
});
exports.myinfo.delete('/address', util.isLoggedin, function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        //주소 삭제
        const tokenData = req.decoded;
        const reqBody = req.body;
        try {
            index_1.addressRep.destroy({
                where: {
                    id: reqBody.addressId
                }
            }).then(() => res.json(util.successTrue("Deletion Success.", null)));
        }
        catch (err) {
            return res.status(403).json(util.successFalse(err, "", null));
        }
    });
});
exports.myinfo.post('/report', util.isLoggedin, function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        //신고 접수
        const tokenData = req.decoded;
        const reqBody = req.body;
        try {
            //작성
        }
        catch (err) {
            return res.status(403).json(util.successFalse(err, "", null));
        }
    });
});
exports.myinfo.post('/qna', util.isLoggedin, function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        //질문 접수
        const tokenData = req.decoded;
        const reqBody = req.body;
        try {
            //작성
        }
        catch (err) {
            return res.status(403).json(util.successFalse(err, "", null));
        }
    });
});
