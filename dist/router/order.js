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
exports.order = void 0;
const express_1 = require("express");
const util = __importStar(require("../config/util"));
const db = __importStar(require("sequelize"));
const dotenv_1 = __importDefault(require("dotenv"));
const models_1 = require("../models");
dotenv_1.default.config();
exports.order = express_1.Router();
exports.order.post('/', util.isLoggedin, function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        //주문 등록
        const tokenData = req.decoded;
        const reqBody = req.body;
        try {
            //작성
            const address = yield models_1.addressRep.findOne({
                where: {
                    id: reqBody.addressId
                }
            });
            console.log(address);
            if (!address)
                return res.status(403).json(util.successFalse(null, "유효하지 않은 주소입니다.", null));
            const distance = Math.sqrt((parseFloat(reqBody.storex) - parseFloat(address.locX)) *
                (parseFloat(reqBody.storex) - parseFloat(address.locX)) +
                (parseFloat(reqBody.storey) - parseFloat(address.locY)) *
                    (parseFloat(reqBody.storey) - parseFloat(address.locY)));
            const distanceFee = 3000;
            const data = {
                userId: tokenData.id,
                gender: reqBody.gender,
                addressId: reqBody.addressId,
                storeName: reqBody.storeName,
                storex: reqBody.storex,
                storey: reqBody.storey,
                startTime: Date.now(),
                orderStatus: "주문 완료",
                hotDeal: reqBody.hotDeal ? true : false
            };
            const order = yield models_1.orderRep.create(data);
            return res.json(util.successTrue("", order));
        }
        catch (err) {
            return res.status(403).json(util.successFalse(err, "", null));
        }
    });
});
exports.order.get('/', util.isLoggedin, function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        //주문 확인
        const tokenData = req.decoded;
        const reqBody = req.body;
        try {
            const _order = yield models_1.orderRep.findOne({
                where: {
                    id: req.query.id
                }
            });
            if (!_order)
                return res.status(403).json(util.successFalse(null, "주문건이 없습니다.", null));
            return res.json(util.successTrue("", _order));
        }
        catch (err) {
            return res.status(403).json(util.successFalse(err, "", null));
        }
    });
});
exports.order.get('/riders', util.isLoggedin, function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        //신청 배달원 목록 반환
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
exports.order.post('/rider', util.isLoggedin, function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        //배달원 선택
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
exports.order.get('/chat', util.isLoggedin, function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        //주문에 대한 채팅을 위한 주소 반환
        //필요없을 수도... 주문 등록 할때 반환해도 될 수도..
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
exports.order.get('/price', util.isLoggedin, function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        //최종 결제 금액 반환
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
exports.order.post('/price', util.isLoggedin, util.isRider, function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        //배달원이 최종 결제 금액 전송
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
exports.order.post('/review/user', util.isLoggedin, util.isRider, function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        //유저에 대한 리뷰 작성
        const tokenData = req.decoded;
        const reqBody = req.body;
        try {
            const _order = yield models_1.orderRep.findOne({ where: {
                    id: reqBody.orderId,
                    riderId: tokenData.id,
                    orderStatus: 3
                } });
            if (_order === null)
                return res.status(403).json(util.successFalse(null, "주문건이 없습니다.", null));
            const oldReview = yield models_1.reviewRep.findOne({ where: {
                    orderId: reqBody.orderId,
                    fromId: tokenData.id
                } });
            if (oldReview)
                return res.status(403).json(util.successFalse(null, "리뷰를 작성할 수 없습니다.", null));
            const review = yield models_1.reviewRep.create({
                orderId: _order === null || _order === void 0 ? void 0 : _order.id,
                userId: _order === null || _order === void 0 ? void 0 : _order.userId,
                riderId: _order === null || _order === void 0 ? void 0 : _order.riderId,
                fromId: tokenData.id,
                rating: reqBody.rating,
                content: reqBody.content
            });
            return res.json(util.successTrue("", review));
        }
        catch (err) {
            return res.status(403).json(util.successFalse(err, "", null));
        }
    });
});
exports.order.get('/review/user', util.isLoggedin, util.isRider, function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        //유저에 대한 리뷰 확인
        const tokenData = req.decoded;
        const reqBody = req.query;
        try {
            //작성
            const _user = yield models_1.userRep.findOne({
                where: {
                    id: reqBody.userId
                }
            });
            if (_user === null)
                return res.status(403).json(util.successFalse(null, "사용자가 없거나 권한이 없습니다.", null));
            const _order = yield models_1.orderRep.findOne({
                where: {
                    orderId: reqBody.orderId,
                    orderStatus: 0
                }
            });
            if (_order === null)
                return res.status(403).json(util.successFalse(null, "사용자가 없거나 권한이 없습니다.", null));
            const reviews = yield models_1.reviewRep.findAll({
                where: {
                    userId: _user === null || _user === void 0 ? void 0 : _user.id,
                    fromId: { [db.Op.ne]: _user === null || _user === void 0 ? void 0 : _user.id }
                }
            });
            const rating = reviews.reduce((sum, cur) => sum + cur.rating, 0);
            return res.json(util.successTrue("", {
                rating: rating / reviews.length,
                reviews: reviews
            }));
        }
        catch (err) {
            return res.status(403).json(util.successFalse(err, "", null));
        }
    });
});
exports.order.post('/review/rider', util.isLoggedin, function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        //라이더에 대한 리뷰 작성
        const tokenData = req.decoded;
        const reqBody = req.body;
        try {
            const _order = yield models_1.orderRep.findOne({ where: {
                    id: reqBody.orderId,
                    userId: tokenData.id,
                    orderStatus: 3
                } });
            if (_order === null)
                return res.status(403).json(util.successFalse(null, "주문건이 없습니다.", null));
            const oldReview = yield models_1.reviewRep.findOne({ where: {
                    orderId: reqBody.orderId,
                    fromId: tokenData.id
                } });
            if (oldReview)
                return res.status(403).json(util.successFalse(null, "리뷰를 작성할 수 없습니다.", null));
            const review = yield models_1.reviewRep.create({
                orderId: _order === null || _order === void 0 ? void 0 : _order.id,
                userId: _order === null || _order === void 0 ? void 0 : _order.userId,
                riderId: _order === null || _order === void 0 ? void 0 : _order.riderId,
                fromId: tokenData.id,
                rating: reqBody.rating,
                content: reqBody.content
            });
            return res.json(util.successTrue("", review));
        }
        catch (err) {
            return res.status(403).json(util.successFalse(err, "", null));
        }
    });
});
exports.order.get('/review/rider', util.isLoggedin, function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        //라이더에 대한 리뷰 확인
        const tokenData = req.decoded;
        const reqBody = req.query;
        try {
            //작성
            const _user = yield models_1.userRep.findOne({
                where: {
                    id: reqBody.riderId
                }
            });
            if (_user === null)
                return res.status(403).json(util.successFalse(null, "사용자가 없거나 권한이 없습니다.", null));
            const _order = yield models_1.orderRep.findOne({
                where: {
                    orderId: reqBody.orderId,
                    orderStatus: 0
                }
            });
            if (_order === null)
                return res.status(403).json(util.successFalse(null, "사용자가 없거나 권한이 없습니다.", null));
            const reviews = yield models_1.reviewRep.findAll({
                where: {
                    riderId: _user === null || _user === void 0 ? void 0 : _user.id,
                    fromId: { [db.Op.ne]: _user === null || _user === void 0 ? void 0 : _user.id }
                }
            });
            const rating = reviews.reduce((sum, cur) => sum + cur.rating, 0);
            return res.json(util.successTrue("", {
                rating: rating / reviews.length,
                reviews: reviews
            }));
        }
        catch (err) {
            return res.status(403).json(util.successFalse(err, "", null));
        }
    });
});
exports.order.get('/orders', util.isLoggedin, util.isRider, function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        //배달원이 찾을 배달거리 리스트 반환
        const tokenData = req.decoded;
        const reqBody = req.body;
        try {
            //작성
            const rider = yield models_1.userRep.findOne({ where: {
                    id: tokenData.id
                } });
            if (rider === null)
                return res.status(403).json(util.successFalse(null, "사용자가 없거나 권한이 없습니다.", null));
            const orders = yield models_1.orderRep.findAll({
                where: {
                    orderStatus: 0,
                    gender: [0, rider === null || rider === void 0 ? void 0 : rider.gender]
                }
            });
            return res.json(util.successTrue("", orders));
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
exports.order.get('/setDelivered', util.isLoggedin, util.isRider, function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        //배달원이 찾을 배달거리 리스트 반환
        const tokenData = req.decoded;
        const reqBody = req.query;
        try {
            //작성
            const orders = yield models_1.orderRep.findOne({
                where: {
                    id: reqBody.orderId,
                    orderStatus: 0
                }
            });
            if (!orders)
                return res.json(util.successFalse(null, "주문이 없습니다.", null));
            orders === null || orders === void 0 ? void 0 : orders.update({
                orderStatus: 3
            });
            return res.json(util.successTrue("", orders));
        }
        catch (err) {
            return res.status(403).json(util.successFalse(err, "", null));
        }
    });
});
////////////////////////////////////////////////////////////////////////////////////////////////////
