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
/* eslint-disable no-inner-declarations */
const express_1 = require("express");
const node_cache_1 = __importDefault(require("node-cache"));
const db = __importStar(require("sequelize"));
const crypto = __importStar(require("crypto"));
const dotenv_1 = __importDefault(require("dotenv"));
const util = __importStar(require("../config/util"));
const functions = __importStar(require("../config/functions"));
const models_1 = require("../models");
dotenv_1.default.config();
exports.order = express_1.Router();
const myCache = new node_cache_1.default({ stdTTL: 0, checkperiod: 0 });
exports.order.post('/', util.isLoggedin, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // 주문 등록
    const tokenData = req.decoded;
    const reqBody = req.body;
    let { expHour } = reqBody;
    if (expHour === '')
        expHour = '0';
    let { expMinute } = reqBody;
    if (expMinute === '')
        expMinute = '0';
    let { gender } = reqBody;
    const today = new Date();
    const registrationToken = [];
    if (reqBody.reservation === 1) {
        if (!expHour || !expMinute) {
            return res.status(403).json(util.successFalse(null, '예약 시간 또는 분을 입력하시지 않으셨습니다.', null));
        }
        ;
        expHour = parseInt(expHour, 10);
        expMinute = parseInt(expMinute, 10);
        today.setHours(today.getHours() + expHour);
        today.setMinutes(today.getMinutes() + expMinute);
    }
    else {
        today.setHours(today.getHours() + 1);
    }
    try {
        const user = yield models_1.userRep.findOne({ where: { id: tokenData.id } });
        if (!user)
            return res.status(403).json(util.successFalse(null, '해당하는 유저가 없습니다', null));
        if (!user.addressId)
            return res.status(403).json(util.successFalse(null, '주소 먼저 등록해주세요', null));
        if (gender >= 1) {
            if (user.grade < 2)
                return res.status(403).json(util.successFalse(null, '준회원은 동성 배달을 이용할 수 없습니다.', null));
            gender = user.gender;
        }
        const address = yield models_1.addressRep.findOne({
            where: {
                id: parseInt(user.addressId, 10),
            },
        });
        if (!address)
            return res.status(403).json(util.successFalse(null, '해당하는 주소가 없습니다.', null));
        let deliveryFee = 3000;
        if (reqBody.hotDeal === 1)
            deliveryFee = 4000;
        const fee = functions.getDistanceFromLatLonInKm(reqBody.userLat, reqBody.userLng, reqBody.storeLat, reqBody.storeLng) - 1;
        // console.log('위치', reqBody.userLat, reqBody.userLng,
        //   reqBody.storeLat, reqBody.storeLng);
        if (fee > 0)
            deliveryFee += Math.round(((550 * fee) / 0.5) / 100) * 100;
        // console.log('가격: ', fee);
        const data = {
            userId: tokenData.id,
            gender,
            address: address.address,
            detailAddress: address.detailAddress,
            lat: reqBody.userLat,
            lng: reqBody.userLng,
            storeName: reqBody.storeName,
            storeLat: reqBody.storeLat,
            storeLng: reqBody.storeLng,
            storeAddress: reqBody.storeAddress,
            storeDetailAddress: reqBody.storeDetailAddress,
            chatId: reqBody.chatId ? reqBody.chatId : null,
            expArrivalTime: today,
            orderStatus: 0,
            hotDeal: reqBody.hotDeal,
            totalCost: 0,
            cost: 0,
            content: reqBody.content,
            categoryName: reqBody.categoryName,
            deliveryFee,
            reservation: reqBody.reservation,
        };
        const _order = yield models_1.orderRep.create(data);
        let riders;
        if (gender >= 1) {
            riders = yield models_1.userRep.findAll({
                where: { id: { [db.Op.ne]: tokenData.id }, grade: 2, gender },
            });
        }
        else {
            riders = yield models_1.userRep.findAll({
                where: { id: { [db.Op.ne]: tokenData.id }, grade: 2 },
            });
        }
        riders.forEach((rider) => {
            if (rider.firebaseFCM) {
                if (rider.lat) {
                    const distance = functions.getDistanceFromLatLonInKm(rider.lat, rider.lng, reqBody.userLat, reqBody.userLng);
                    // 1.5km 미만의 위치에 존재하는 배달원에게 푸시 메시지 전송. 현재는 테스트용으로 100km
                    if (distance < 100)
                        registrationToken.push(rider.firebaseFCM);
                } // 개발용으로 위도 경도 데이터 없는 배달원에게도 푸시 메시지 전송
                else
                    registrationToken.push(rider.firebaseFCM);
            }
        });
        const payload = {
            notification: {
                title: '배달 건이 추가되었습니다.',
                body: _order.storeName,
            },
            data: {
                type: 'newOrder',
            },
        };
        if (registrationToken.length > 0)
            functions.sendFCMMessage(registrationToken, payload);
        return res.json(util.successTrue('', _order));
    }
    catch (err) {
        return res.status(403).json(util.successFalse(err, '', null));
    }
}));
exports.order.get('/', util.isLoggedin, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // 주문 확인
    const reqQuery = req.query;
    try {
        const _order = yield models_1.orderRep.findOne({
            where: {
                id: reqQuery.orderId,
            },
        });
        if (!_order)
            return res.status(403).json(util.successFalse(null, '주문건이 없습니다.', null));
        return res.json(util.successTrue('', _order));
    }
    catch (err) {
        return res.status(403).json(util.successFalse(err, '', null));
    }
}));
exports.order.get('/riders', util.isLoggedin, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // 신청 배달원 목록 반환
    const reqQuery = req.query;
    try {
        const _order = yield models_1.orderRep.findOne({ where: { id: reqQuery.orderId } });
        if (!_order)
            return res.status(403).json(util.successFalse(null, '해당하는 주문이 없습니다.', null));
        if (parseInt(_order.orderStatus, 10) !== 0)
            return res.status(403).json(util.successFalse(null, '배달원 모집이 완료된 주문입니다.', null));
        const riderlist = myCache.get(reqQuery.orderId);
        if (!riderlist) {
            return res.json(util.successTrue('배달을 희망하는 배달원이 없습니다.', null));
        }
        return res.json(util.successTrue('', riderlist));
    }
    catch (err) {
        return res.status(403).json(util.successFalse(err, '', null));
    }
}));
exports.order.post('/rider', util.isLoggedin, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // 배달원 선택
    const tokenData = req.decoded;
    const reqBody = req.body;
    const reqQuery = req.query;
    const riderId = parseInt(reqBody.riderId, 10);
    try {
        const _order = yield models_1.orderRep.findOne({ where: { id: reqQuery.orderId } });
        if (!_order)
            return res.status(403).json(util.successFalse(null, '해당하는 주문이 없습니다.', null));
        const riderlist = myCache.get(reqQuery.orderId);
        if (!riderlist)
            return res.status(403).json(util.successFalse(null, '배달을 희망하는 배달원이 없습니다.', null));
        const _rider = riderlist.filter((rider) => rider.riderId === riderId)[0];
        if (!_rider)
            return res.status(403).json(util.successFalse(null, '해당하는 배달원이 존재하지 않습니다.', null));
        const rider_fire = yield models_1.userRep.findOne({ where: { id: riderId } });
        if (!rider_fire)
            return res.status(403).json(util.successFalse(null, '해당하는 배달원이 존재하지 않습니다.', null));
        const registrationToken = rider_fire.firebaseFCM;
        if (!registrationToken)
            return res.status(403).json(util.successFalse(null, '해당하는 배달원이 존재하지 않습니다.', null));
        const room = yield models_1.roomRep.create({
            orderId: _order.id,
            owner: tokenData.nickName,
            ownerId: tokenData.id,
            riderId: _rider.riderId,
            roomId: crypto.randomBytes(256).toString('hex').substr(100, 50),
        });
        yield _order.update({
            riderId: _rider.riderId,
            extraFee: _rider.extraFee,
            orderStatus: 1,
            chatId: room.id,
        });
        myCache.del(reqQuery.orderId);
        const payload = {
            notification: {
                title: '배달원으로 선발 알림',
                body: '배달원으로 선발되었습니다.',
            },
            data: {
                orderId: room.orderId.toString(),
                roomId: room.roomId,
                userId: room.ownerId.toString(),
                riderId: room.riderId.toString(),
                type: 'selected',
            },
        };
        functions.sendFCMMessage(registrationToken, payload);
        // admin.messaging().sendToDevice(registrationToken, message, { priority: "high" })
        //   .then((response) => {
        //     console.log('Successfully sent message:', response);
        //   })
        //   .catch((error) => {
        //     console.log('Error sending message:', error);
        //   });
        return res.json(util.successTrue('', { _order, room }));
    }
    catch (err) {
        return res.status(403).json(util.successFalse(err, '', null));
    }
}));
exports.order.get('/price', util.isLoggedin, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // 최종 결제 금액 반환
    const reqQuery = req.query;
    try {
        const orderId = parseInt(reqQuery.orderId, 10);
        const _order = yield models_1.orderRep.findOne({ where: { id: orderId } });
        if (!_order)
            return res.status(403).json(util.successFalse(null, '해당하는 주문이 없습니다.', null));
        if (parseInt(_order.orderStatus, 10) !== 1)
            return res.status(403).json(util.successFalse(null, '현재 배달 과정의 주문이 아닙니다.', null));
        if (!_order.totalCost)
            return res.status(403).json(util.successFalse(null, '물건 값을 먼저 입력해주세요.', null));
        return res.json(util.successTrue('', _order));
    }
    catch (err) {
        return res.status(403).json(util.successFalse(err, '', null));
    }
}));
exports.order.post('/price', util.isLoggedin, util.isUser, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // 배달원이 최종 결제 금액 전송
    const tokenData = req.decoded;
    const reqQuery = req.query;
    const reqBody = req.body;
    try {
        const orderId = parseInt(reqQuery.orderId, 10);
        const _order = yield models_1.orderRep.findOne({ where: { id: orderId, orderStatus: 1 } });
        if (!_order)
            return res.status(403).json(util.successFalse(null, '해당하는 주문이 없거나 이미 처리되었습니다.', null));
        if (_order.riderId !== parseInt(tokenData.id, 10))
            return res.status(403).json(util.successFalse(null, '해당하는 주문의 배달원이 아닙니다.', null));
        if (_order.totalCost)
            return res.status(403).json(util.successFalse(null, '이미 결제 금액이 등록 되었습니다.', null));
        const cost = parseInt(reqBody.cost, 10);
        const totalCost = _order.deliveryFee + _order.extraFee + cost;
        yield _order.update({ cost, totalCost });
        return res.json(util.successTrue('', _order));
    }
    catch (err) {
        return res.status(403).json(util.successFalse(err, '', null));
    }
}));
exports.order.post('/review/user', util.isLoggedin, util.isUser, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // 유저에 대한 리뷰 작성
    const tokenData = req.decoded;
    const reqBody = req.body;
    try {
        const _order = yield models_1.orderRep.findOne({
            where: {
                id: reqBody.orderId,
                riderId: tokenData.id,
                orderStatus: 3,
                reviewedByRider: false,
            },
        });
        if (!_order)
            return res.status(403).json(util.successFalse(null, '주문건이 없거나, 이미 리뷰를 작성했습니다.', null));
        const review = yield models_1.reviewRep.create({
            orderId: _order === null || _order === void 0 ? void 0 : _order.id,
            userId: _order === null || _order === void 0 ? void 0 : _order.userId,
            riderId: _order === null || _order === void 0 ? void 0 : _order.riderId,
            fromId: tokenData.id,
            nickName: tokenData.nickName,
            rating: reqBody.rating,
            content: reqBody.content,
        });
        yield _order.update({ reviewedByRider: true });
        return res.json(util.successTrue('', review));
    }
    catch (err) {
        return res.status(403).json(util.successFalse(err, '주문건이 없거나, 이미 리뷰를 작성했습니다.', null));
    }
}));
exports.order.get('/review/user', util.isLoggedin, util.isUser, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // 유저에 대한 리뷰 확인
    // const tokenData = req.decoded;
    const reqQuery = req.query;
    try {
        // 작성
        const _user = yield models_1.userRep.findOne({
            where: {
                id: reqQuery.userId,
            },
        });
        if (!_user)
            return res.status(403).json(util.successFalse(null, '사용자가 없거나 권한이 없습니다.', null));
        const _order = yield models_1.orderRep.findOne({
            where: {
                id: reqQuery.orderId,
                orderStatus: 0,
            },
        });
        if (!_order)
            return res.status(403).json(util.successFalse(null, '사용자가 없거나 권한이 없습니다.', null));
        const reviews = yield models_1.reviewRep.findAll({
            where: {
                userId: _user.id,
                fromId: { [db.Op.ne]: _user === null || _user === void 0 ? void 0 : _user.id },
            },
        });
        const rating = reviews.reduce((sum, cur) => sum + cur.rating, 0);
        return res.json(util.successTrue('', {
            rating: rating / reviews.length,
            reviews,
        }));
    }
    catch (err) {
        return res.status(403).json(util.successFalse(err, '사용자가 없거나 권한이 없습니다.', null));
    }
}));
exports.order.post('/review/rider', util.isLoggedin, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // 라이더에 대한 리뷰 작성
    const tokenData = req.decoded;
    const reqBody = req.body;
    try {
        const _order = yield models_1.orderRep.findOne({
            where: {
                id: reqBody.orderId,
                userId: tokenData.id,
                orderStatus: 3,
                reviewedByUser: false,
            },
        });
        if (!_order)
            return res.status(403).json(util.successFalse(null, '주문건이 없거나, 이미 리뷰를 작성했습니다.', null));
        const review = yield models_1.reviewRep.create({
            orderId: _order === null || _order === void 0 ? void 0 : _order.id,
            userId: _order === null || _order === void 0 ? void 0 : _order.userId,
            riderId: _order === null || _order === void 0 ? void 0 : _order.riderId,
            fromId: tokenData.id,
            nickName: tokenData.nickName,
            rating: reqBody.rating,
            content: reqBody.content,
        });
        yield _order.update({ reviewedByUser: true });
        return res.json(util.successTrue('', review));
    }
    catch (err) {
        return res.status(403).json(util.successFalse(err, '주문건이 없거나, 이미 리뷰를 작성했습니다.', null));
    }
}));
exports.order.get('/review/rider', util.isLoggedin, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // 라이더에 대한 리뷰 확인
    // const tokenData = req.decoded;
    const reqQuery = req.query;
    try {
        // 작성
        const _user = yield models_1.userRep.findOne({
            where: {
                id: reqQuery.riderId,
            },
        });
        if (!_user)
            return res.status(403).json(util.successFalse(null, '사용자가 없거나 권한이 없습니다.', null));
        const _order = yield models_1.orderRep.findOne({
            where: {
                id: reqQuery.orderId,
                orderStatus: 0,
            },
        });
        if (!_order)
            return res.status(403).json(util.successFalse(null, '사용자가 없거나 권한이 없습니다.', null));
        const reviews = yield models_1.reviewRep.findAll({
            where: {
                riderId: _user.id,
                fromId: { [db.Op.ne]: _user === null || _user === void 0 ? void 0 : _user.id },
            },
        });
        const rating = reviews.reduce((sum, cur) => sum + cur.rating, 0);
        return res.json(util.successTrue('', {
            rating: rating / reviews.length,
            reviews,
        }));
    }
    catch (err) {
        return res.status(403).json(util.successFalse(err, '사용자가 없거나 권한이 없습니다.', null));
    }
}));
exports.order.get('/review/wrote', util.isLoggedin, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // 내가 쓴 리뷰
    const tokenData = req.decoded;
    const reqQuery = req.query;
    try {
        const review = yield models_1.reviewRep.findOne({
            where: {
                fromId: tokenData.id,
                orderId: parseInt(reqQuery.orderId, 10),
            },
        });
        if (!review) {
            return res.status(403).json(util.successFalse(null, '해당 주문이 없거나 리뷰를 작성하지 않았습니다.', null));
        }
        return res.json(util.successTrue('', review));
    }
    catch (err) {
        return res.status(403).json(util.successFalse(err, '해당 주문이 없거나 리뷰를 작성하지 않았습니다.', null));
    }
}));
exports.order.get('/orders', util.isLoggedin, util.isUser, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // 배달원이 찾을 배달거리 리스트 반환
    const tokenData = req.decoded;
    // const reqBody = req.body;
    try {
        // 작성
        const rider = yield models_1.userRep.findOne({
            where: {
                id: tokenData.id,
            },
        });
        if (!rider)
            return res.status(403).json(util.successFalse(null, '사용자가 없거나 권한이 없습니다.', null));
        const orders = yield models_1.orderRep.findAll({
            where: {
                userId: { [db.Op.ne]: tokenData.id },
                orderStatus: 0,
                gender: [0, rider.gender],
            },
        });
        return res.json(util.successTrue('', { length: orders.length, orders }));
    }
    catch (err) {
        return res.status(403).json(util.successFalse(err, '사용자가 없거나 권한이 없습니다.', null));
    }
}));
exports.order.post('/apply', util.isLoggedin, util.isUser, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // 배달원이 해당 주문에 배달원 신청
    const tokenData = req.decoded;
    const reqQuery = req.query;
    const reqBody = req.body;
    // 해당 주문 번호
    const _order = yield models_1.orderRep.findOne({ where: { id: reqQuery.orderId } });
    if (!_order)
        return res.status(403).json(util.successFalse(null, '주문 건이 없습니다.', null));
    const orderStatus = parseInt(_order.orderStatus, 10);
    if (orderStatus !== 0)
        return res.status(403).json(util.successFalse(null, '배달원 모집이 끝난 주문입니다.', null));
    if (_order.userId === parseInt(tokenData.id, 10))
        return res.status(403).json(util.successFalse(null, '본인의 주문에 배달원 지원은 불가능합니다.', null));
    const riderId = tokenData.id;
    const user = yield models_1.userRep.findOne({ where: { id: _order.userId } });
    if (!user)
        return res.status(403).json(util.successFalse(null, '해당 주문의 주문자가 존재하지 않습니다.', null));
    // eslint-disable-next-line prefer-const
    const registrationToken = user.firebaseFCM;
    let extraFee;
    extraFee = parseInt(reqBody.extraFee, 10);
    if (!reqBody.extraFee)
        extraFee = 0;
    let riderlist = myCache.get(reqQuery.orderId);
    if (!riderlist) {
        myCache.set(reqQuery.orderId, [{ riderId, extraFee }]);
    }
    else {
        const _rider = riderlist.filter((__rider) => __rider.riderId === parseInt(riderId, 10))[0];
        if (_rider)
            return res.status(403).json(util.successFalse(null, '이미 배달 신청한 주문입니다.', null));
        riderlist = myCache.take(reqQuery.orderId);
        riderlist.push({ riderId, extraFee });
        myCache.set(reqQuery.orderId, riderlist);
    }
    const payload = {
        notification: {
            title: '배달원 추가 알림',
            tag: 'newRiderApply',
            body: '추가 배달원이 배정되었습니다.',
        },
        data: {
            type: 'newRiderApply',
        },
    };
    if (registrationToken)
        functions.sendFCMMessage(registrationToken, payload);
    // admin.messaging().sendToDevice(registrationToken, message)
    //   .then((response) => {
    //     console.log('Successfully sent message:', response);
    //   })
    //   .catch((error) => {
    //     console.log('Error sending message:', error);
    //   });
    return res.json(util.successTrue('', riderlist));
}));
exports.order.delete('/', util.isLoggedin, util.isUser, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // 배달원이 해당 주문에 배달원 신청
    const tokenData = req.decoded;
    const reqBody = req.body;
    // 해당 주문 번호
    const _order = yield models_1.orderRep.findOne({ where: { id: reqBody.orderId } });
    if (!_order)
        return res.status(403).json(util.successFalse(null, '주문 건이 없습니다.', null));
    const orderStatus = parseInt(_order.orderStatus, 10);
    if (orderStatus !== 0)
        return res.status(403).json(util.successFalse(null, '배달원 모집이 끝나 주문을 취소할 수 없습니다.', null));
    if (_order.userId !== parseInt(tokenData.id, 10))
        return res.status(403).json(util.successFalse(null, '본인의 주문이 아니면 취소할 수 없습니다.', null));
    myCache.del(reqBody.orderId);
    _order.destroy();
    return res.json(util.successTrue('', null));
}));
exports.order.get('/orderList', util.isLoggedin, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // 현재 주문 중인 주문 내용 받아오기 (소비자)
    const tokenData = req.decoded;
    try {
        // 작성
        const orderList = yield models_1.orderRep.findAll({
            where: {
                userId: tokenData.id,
            },
            order: [['orderStatus', 'ASC'], ['id', 'ASC']],
        });
        return res.json(util.successTrue('', orderList));
    }
    catch (err) {
        return res.status(403).json(util.successFalse(err, '주문 내역이 없습니다', null));
    }
}));
exports.order.get('/deliverList', util.isLoggedin, util.isUser, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // 현재 배달 중인 배달 내용 받아오기 (배달원)
    const tokenData = req.decoded;
    try {
        // 작성
        const deliverList = yield models_1.orderRep.findAll({
            where: {
                riderId: tokenData.id,
            },
            order: [['orderStatus', 'ASC'], ['id', 'ASC']],
        });
        return res.json(util.successTrue('', deliverList));
    }
    catch (err) {
        return res.status(403).json(util.successFalse(err, '배달 내역이 없습니다', null));
    }
}));
exports.order.post('/pay', util.isLoggedin, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const tokenData = req.decoded;
    const reqQuery = req.query;
    const reqBody = req.body;
    if (!parseInt(reqBody.riderId, 10))
        return res.status(403).json(util.successFalse(null, '정상적인 접근이 아닙니다.', null));
    const _order = yield models_1.orderRep.findOne({
        where: { id: reqQuery.orderId, orderStatus: 1, userId: tokenData.id },
    });
    if (!_order)
        return res.status(403).json(util.successFalse(null, '주문이 없습니다.', null));
    let price = _order.totalCost;
    const user = yield models_1.userRep.findOne({ where: { id: tokenData.id } });
    if (!user)
        return res.status(403).json(util.successFalse(null, '사용자를 찾을 수 없습니다.', null));
    const rider = yield models_1.userRep.findOne({ where: { id: reqBody.riderId } });
    if (!rider)
        return res.status(403).json(util.successFalse(null, '배달원을 찾을 수 없습니다.', null));
    const points = yield models_1.pointRep.findAll({
        where: {
            userId: tokenData.id,
        },
        order: [['expireAt', 'ASC']],
    });
    const sum = points.reduce((_sum, cur) => _sum + cur.point, 0);
    // 결제액 부족. 결제창으로 이동
    if (sum - price < 0)
        return res.status(403).json(util.successFalse(null, '잔액이 부족합니다.', null));
    points.some((point) => __awaiter(void 0, void 0, void 0, function* () {
        if (price) {
            const curPoint = point.point;
            if (price <= point.point) {
                yield point.update({ point: curPoint - price });
                price = 0;
                return true;
            }
            yield point.update({ point: 0 });
            yield point.destroy();
            price -= curPoint;
            return false;
        }
        return true;
    }));
    const today = new Date();
    today.setFullYear(today.getFullYear() + 3, today.getMonth(), today.getDay());
    yield models_1.pointRep.create({
        pointKind: 0,
        status: 0,
        expireAt: today,
        userId: reqBody.riderId,
        point: parseInt(reqBody.price, 10),
        orderId: _order.id,
    });
    yield _order.update({ orderStatus: 2 });
    return res.json(util.successTrue('', null));
}));
exports.order.get('/complete', util.isLoggedin, util.isUser, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // ordetStatus:2 인 상태에서 배달원이 배달 완료 버튼 누르면 3으로 변경
    // 허위로 누르게 되면 신고
    const tokenData = req.decoded;
    const reqQuery = req.query;
    try {
        const _order = yield models_1.orderRep.findOne({
            where: {
                id: reqQuery.orderId,
                riderId: tokenData.id,
                orderStatus: 2,
            },
        });
        if (!_order)
            return res.status(403).json(util.successFalse(null, '주문 내역이 없거나 배달 완료 처리할 수 없습니다.', null));
        yield _order.update({ orderStatus: 3 });
        return res.json(util.successTrue('', _order));
    }
    catch (err) {
        return res.status(403).json(util.successFalse(err, '주문 내역이 없거나 배달 완료 처리할 수 없습니다.', null));
    }
}));
exports.order.get('/riderloc', util.isLoggedin, util.isUser, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // 현재 주문중인 배달에서 배달원 위치 받아오기
    const tokenData = req.decoded;
    const reqQuery = req.query;
    try {
        const _order = yield models_1.orderRep.findOne({
            where: {
                id: reqQuery.orderId,
                userId: tokenData.id,
                orderStatus: 2,
            },
        });
        if (!_order)
            return res.status(403).json(util.successFalse(null, '해당 주문 내역이 없거나 주문자가 아니거나 배달 중이 아닙니다', null));
        const user = yield models_1.userRep.findOne({ where: { id: _order.riderId } });
        if (!user)
            return res.status(403).json(util.successFalse(null, '해당 하는 유저가 없습니다.', null));
        if (!user.lat)
            return res.status(403).json(util.successFalse(null, '배달원의 위치를 알 수 없습니다', null));
        return res.json(util.successTrue('', user));
    }
    catch (err) {
        return res.status(403).json(util.successFalse(err, '', null));
    }
}));
