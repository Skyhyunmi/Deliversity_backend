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
const util = __importStar(require("../config/util"));
const functions = __importStar(require("../config/functions"));
const node_cache_1 = __importDefault(require("node-cache"));
const db = __importStar(require("sequelize"));
const crypto = __importStar(require("crypto"));
const axios_1 = __importDefault(require("axios"));
const models_1 = require("../models");
const admin = __importStar(require("firebase-admin"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
exports.order = express_1.Router();
const myCache = new node_cache_1.default({ stdTTL: 0, checkperiod: 0 });
exports.order.post('/', util.isLoggedin, function (req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        //주문 등록
        const tokenData = req.decoded;
        const reqBody = req.body;
        let expHour = reqBody.expHour;
        let expMinute = reqBody.expMinute;
        let gender = parseInt(reqBody.gender);
        const today = new Date();
        let registrationToken;
        if (reqBody.reservation === "1") {
            if (!expHour || !expMinute) {
                return res.status(403).json(util.successFalse(null, "예약 시간 또는 분을 입력하시지 않으셨습니다.", null));
            }
            ;
            expHour = parseInt(reqBody.expHour);
            expMinute = parseInt(reqBody.expMinute);
            today.setHours(today.getHours() + expHour);
            today.setMinutes(today.getMinutes() + expMinute);
        }
        else {
            today.setHours(today.getHours() + 1);
        }
        try {
            if (gender >= 1) {
                const user = yield models_1.userRep.findOne({ where: { id: tokenData.id, grade: [2, 3] } });
                if (!user)
                    return res.status(403).json(util.successFalse(null, "준회원은 동성 배달을 이용할 수 없습니다.", null));
                gender = user.gender;
            }
            const address = yield models_1.addressRep.findOne({
                where: {
                    userid: tokenData.id,
                }
            });
            if (!address)
                return res.status(403).json(util.successFalse(null, "해당하는 주소가 없습니다.", null));
            let cost = 3000;
            if (reqBody.hotDeal === "1")
                cost = 4000;
            const coord = yield axios_1.default({
                url: `https://dapi.kakao.com/v2/local/search/address.json?query=${encodeURIComponent(reqBody.storeAddress)}`,
                method: 'get',
                headers: { Authorization: `KakaoAK ${process.env.KAKAO_KEY}` }
            });
            if (coord.data.documents[0] === undefined) {
                // coord.data.documents[0].y = 37.5674160, coord.data.documents[0].x = 126.9663050;
                return res.status(403).json(util.successFalse(null, "주소를 다시 확인해주세요.", null));
            }
            // const from = await axios({
            //   url: 'https://dapi.kakao.com/v2/local/geo/transcoord.json',
            //   method: "GET",
            //   params: {
            //     y: address.locX,
            //     x: address.locY,
            //     input_coord: "WGS84",
            //     output_coord: "WCONGNAMUL"
            //   },
            //   headers: {
            //     Authorization: `KakaoAK ${process.env.KAKAO_KEY}`
            //   }
            // }) as any;
            // const to = await axios({
            //   url: 'https://dapi.kakao.com/v2/local/geo/transcoord.json',
            //   method: "GET",
            //   params: {
            //     y: coord.data.documents[0].y,
            //     x: coord.data.documents[0].x,
            //     input_coord: "WGS84",
            //     output_coord: "WCONGNAMUL"
            //   },
            //   headers: {
            //     Authorization: `KakaoAK ${process.env.KAKAO_KEY}`
            //   }
            // }) as any;
            // return res.json(util.successTrue("",data.data.documents[0]))
            // let distanceData:any;
            // let fee: any;
            //  axios({
            //   url: 'https://map.kakao.com/route/walkset.json',
            //   method: "GET",
            //   params: {
            //     sX: from.data.documents[0].x,
            //     sY: from.data.documents[0].y,
            //     eX: to.data.documents[0].x,
            //     eY: to.data.documents[0].y,
            //     ids: ','
            //   }
            // }).then((data)=>{
            //   console.log(data.data.directions.length)
            //   fee = parseInt(data.data.directions.length);
            // }).catch(()=>{
            const fee = functions.getDistanceFromLatLonInKm(address.locX, address.locY, coord.data.documents[0].y, coord.data.documents[0].x);
            // console.log(fee)
            // const fee = distanceData;
            // })
            cost += 550 * Math.floor(fee / 0.5);
            const data = {
                userId: tokenData.id,
                gender: gender,
                address: address.address,
                detailAddress: address.detailAddress,
                locX: address.locX,
                locY: address.locY,
                // store 쪽 구현 아직 안되어서
                storeName: reqBody.storeName,
                storeX: coord.data.documents[0].y,
                storeY: coord.data.documents[0].x,
                storeAddress: reqBody.storeAddress,
                storeDetailAddress: reqBody.storeDetailAddress,
                chatId: reqBody.chatId ? reqBody.chatId : null,
                // 이거 계산하는거 추가하기 @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
                expArrivalTime: today,
                orderStatus: 0,
                hotDeal: reqBody.hotDeal === "1" ? true : false,
                // hotDeal 계산된 금액(소비자한테 알려줘야함)
                totalCost: 0,
                cost: 0,
                content: reqBody.content,
                categoryName: reqBody.categoryName,
                deliveryFee: cost,
                reservation: reqBody.reservation
            };
            const order = yield models_1.orderRep.create(data);
            if (gender >= 1) {
                const riders = yield models_1.userRep.findAll({ where: { id: { [db.Op.ne]: tokenData.id }, grade: [2, 3], gender: gender } });
                for (let i = 0; i < riders.length; i++) {
                    registrationToken = riders[i].firebaseFCM;
                    console.log(i, '+', riders[i].name);
                    const message = {
                        data: {
                            test: "배달 건이 추가되었습니다, 확인해보세요" + registrationToken
                        },
                        token: registrationToken
                    };
                    admin.messaging().send(message)
                        .then((response) => {
                        console.log('Successfully sent message:', response);
                    })
                        .catch((error) => {
                        console.log('Error sending message:', error);
                    });
                }
            }
            else {
                const riders = yield models_1.userRep.findAll({ where: { id: { [db.Op.ne]: tokenData.id }, grade: [2, 3] } });
                for (let i = 0; i < riders.length; i++) {
                    registrationToken = riders[i].firebaseFCM;
                    console.log(i, '+', registrationToken);
                    const message = {
                        data: {
                            test: "배달 건이 추가되었습니다, 확인해보세요"
                        },
                        token: registrationToken
                    };
                    admin.messaging().send(message)
                        .then((response) => {
                        console.log('Successfully sent message:', response);
                    })
                        .catch((error) => {
                        console.log('Error sending message:', error);
                    });
                }
            }
            return res.json(util.successTrue("", order));
        }
        catch (err) {
            return res.status(403).json(util.successFalse(err, "", null));
        }
    });
});
exports.order.get('/', util.isLoggedin, function (req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        //주문 확인
        try {
            const _order = yield models_1.orderRep.findOne({
                where: {
                    id: req.query.orderId
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
exports.order.get('/riders', util.isLoggedin, function (req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        //신청 배달원 목록 반환
        try {
            const order = yield models_1.orderRep.findOne({ where: { id: req.query.orderId } });
            if (!order)
                return res.status(403).json(util.successFalse(null, "해당하는 주문이 없습니다.", null));
            if (parseInt(order.orderStatus) != 0)
                return res.status(403).json(util.successFalse(null, "배달원 모집이 완료된 주문입니다.", null));
            const riderlist = myCache.get(req.query.orderId);
            if (riderlist == undefined) {
                return res.json(util.successTrue("배달을 희망하는 배달원이 없습니다.", null));
            }
            return res.json(util.successTrue("", riderlist));
        }
        catch (err) {
            return res.status(403).json(util.successFalse(err, "", null));
        }
    });
});
exports.order.post('/rider', util.isLoggedin, function (req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        //배달원 선택
        const tokenData = req.decoded;
        const reqBody = req.body;
        const riderId = parseInt(reqBody.riderId);
        try {
            const order = yield models_1.orderRep.findOne({
                where: {
                    id: req.query.orderId
                }
            });
            let registrationToken;
            if (!order)
                return res.status(403).json(util.successFalse(null, "해당하는 주문이 없습니다.", null));
            const riderlist = myCache.get(req.query.orderId);
            if (riderlist == undefined)
                return res.status(403).json(util.successFalse(null, "배달을 희망하는 배달원이 없습니다.", null));
            const rider = riderlist.filter(rider => rider.riderId == riderId)[0];
            if (!rider)
                return res.status(403).json(util.successFalse(null, "해당하는 배달원이 존재하지 않습니다.", null));
            const rider_fire = yield models_1.userRep.findOne({ where: { id: riderId } });
            if (!rider_fire)
                res.status(403).json(util.successFalse(null, "해당하는 배달원이 존재하지 않습니다.", null));
            else {
                registrationToken = rider_fire.firebaseFCM;
            }
            if (registrationToken == undefined)
                res.status(403).json(util.successFalse(null, "해당하는 배달원이 존재하지 않습니다.", null));
            else {
                const room = yield models_1.roomRep.create({
                    orderId: order.id,
                    owner: tokenData.nickName,
                    ownerId: tokenData.id,
                    riderId: rider.riderId,
                    password: crypto.randomBytes(256).toString('hex').substr(100, 50)
                });
                order.update({
                    riderId: rider.riderId,
                    extraFee: rider.extraFee,
                    orderStatus: 1,
                    chatId: room.id
                });
                myCache.del(req.query.orderId);
                const message = {
                    data: {
                        test: "배달원으로 선발되었습니다."
                    },
                    token: registrationToken
                };
                admin.messaging().send(message)
                    .then((response) => {
                    console.log('Successfully sent message:', response);
                })
                    .catch((error) => {
                    console.log('Error sending message:', error);
                });
                return res.json(util.successTrue("", order));
            }
        }
        catch (err) {
            return res.status(403).json(util.successFalse(err, "", null));
        }
    });
});
exports.order.get('/chat', util.isLoggedin, function (req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        //주문에 대한 채팅을 위한 주소 반환
        //필요없을 수도... 주문 등록 할때 반환해도 될 수도..
        const tokenData = req.decoded;
        // const reqBody = req.query;
        try {
            //작성
            const order = yield models_1.orderRep.findOne({
                where: {
                    id: req.query.orderId,
                }
            });
            if (!order)
                return res.status(403).json(util.successFalse(null, "해당하는 주문이 없습니다.", null));
            let room;
            if (parseInt(tokenData.grade) <= 2)
                room = yield models_1.roomRep.findOne({
                    where: {
                        orderId: order.id,
                        userId: tokenData.id
                    }
                });
            else if (tokenData.grade == "3")
                room = yield models_1.roomRep.findOne({
                    where: {
                        orderId: order.id,
                        riderId: order.riderId
                    }
                });
            if (!room)
                return res.status(403).json(util.successFalse(null, "해당하는 주문이 없습니다.", null));
            return res.json(util.successTrue("", { password: room }));
        }
        catch (err) {
            return res.status(403).json(util.successFalse(err, "", null));
        }
    });
});
exports.order.get('/price', util.isLoggedin, function (req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        //최종 결제 금액 반환
        // const tokenData = req.decoded;
        // const reqBody = req.body;
        try {
            //작성
        }
        catch (err) {
            return res.status(403).json(util.successFalse(err, "", null));
        }
    });
});
exports.order.post('/price', util.isLoggedin, util.isRider, function (req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        //배달원이 최종 결제 금액 전송
        // const tokenData = req.decoded;
        // const reqBody = req.body;
        try {
            //작성
        }
        catch (err) {
            return res.status(403).json(util.successFalse(err, "", null));
        }
    });
});
exports.order.post('/review/user', util.isLoggedin, util.isRider, function (req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        //유저에 대한 리뷰 작성
        const tokenData = req.decoded;
        const reqBody = req.body;
        try {
            const _order = yield models_1.orderRep.findOne({
                where: {
                    id: reqBody.orderId,
                    riderId: tokenData.id,
                    orderStatus: 3
                }
            });
            if (_order === null)
                return res.status(403).json(util.successFalse(null, "주문건이 없습니다.", null));
            const oldReview = yield models_1.reviewRep.findOne({
                where: {
                    orderId: reqBody.orderId,
                    fromId: tokenData.id
                }
            });
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
exports.order.get('/review/user', util.isLoggedin, util.isRider, function (req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        //유저에 대한 리뷰 확인
        // const tokenData = req.decoded;
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
                    id: reqBody.orderId,
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
exports.order.post('/review/rider', util.isLoggedin, function (req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        //라이더에 대한 리뷰 작성
        const tokenData = req.decoded;
        const reqBody = req.body;
        try {
            const _order = yield models_1.orderRep.findOne({
                where: {
                    id: reqBody.orderId,
                    userId: tokenData.id,
                    orderStatus: 3
                }
            });
            if (_order === null)
                return res.status(403).json(util.successFalse(null, "주문건이 없습니다.", null));
            const oldReview = yield models_1.reviewRep.findOne({
                where: {
                    orderId: reqBody.orderId,
                    fromId: tokenData.id
                }
            });
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
exports.order.get('/review/rider', util.isLoggedin, function (req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        //라이더에 대한 리뷰 확인
        // const tokenData = req.decoded;
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
                    id: reqBody.orderId,
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
exports.order.get('/orders', util.isLoggedin, util.isRider, function (req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        //배달원이 찾을 배달거리 리스트 반환
        const tokenData = req.decoded;
        // const reqBody = req.body;
        try {
            //작성
            const rider = yield models_1.userRep.findOne({
                where: {
                    id: tokenData.id
                }
            });
            if (rider === null)
                return res.status(403).json(util.successFalse(null, "사용자가 없거나 권한이 없습니다.", null));
            const orders = yield models_1.orderRep.findAll({
                where: {
                    userId: { [db.Op.ne]: tokenData.id },
                    orderStatus: 0,
                    gender: [0, rider === null || rider === void 0 ? void 0 : rider.gender]
                }
            });
            return res.json(util.successTrue("", { length: orders.length, orders: orders }));
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
exports.order.get('/setDelivered', util.isLoggedin, util.isRider, function (req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        //배달원이 찾을 배달거리 리스트 반환
        // const tokenData = req.decoded;
        const reqBody = req.query;
        try {
            //작성
            const order = yield models_1.orderRep.findOne({
                where: {
                    id: reqBody.orderId,
                    orderStatus: 0
                }
            });
            if (!order)
                return res.json(util.successFalse(null, "주문이 없습니다.", null));
            order === null || order === void 0 ? void 0 : order.update({
                orderStatus: 3
            });
            return res.json(util.successTrue("", order));
        }
        catch (err) {
            return res.status(403).json(util.successFalse(err, "", null));
        }
    });
});
exports.order.post('/apply', util.isLoggedin, util.isRider, function (req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        // 배달원이 해당 주문에 배달원 신청
        const tokenData = req.decoded;
        const reqBody = req.body;
        let orderStatus;
        // 해당 주문 번호
        const order = yield models_1.orderRep.findOne({ where: { id: req.query.orderId } });
        if (!order)
            return res.status(403).json(util.successFalse(null, "주문 건이 없습니다.", null));
        else {
            orderStatus = parseInt(order === null || order === void 0 ? void 0 : order.orderStatus);
        }
        if (orderStatus != 0)
            return res.status(403).json(util.successFalse(null, "배달원 모집이 끝난 주문입니다.", null));
        if (order.userId == tokenData.id)
            return res.status(403).json(util.successFalse(null, "본인의 주문에 배달원 지원은 불가능합니다.", null));
        const riderId = tokenData.id;
        let extraFee;
        extraFee = parseInt(reqBody.extraFee);
        if (!reqBody.extraFee)
            extraFee = 0;
        let riderlist = myCache.get(req.query.orderId);
        if (riderlist == undefined) {
            myCache.set(req.query.orderId, [{ riderId: riderId, extraFee: extraFee }]);
        }
        else {
            const rider = riderlist.filter(rider => rider.riderId == riderId)[0];
            if (rider)
                return res.status(403).json(util.successFalse(null, "이미 배달 신청한 주문입니다.", null));
            riderlist = myCache.take(req.query.orderId);
            riderlist.push({ riderId: riderId, extraFee: extraFee });
            myCache.set(req.query.orderId, riderlist);
        }
        return res.json(util.successTrue("", riderlist));
    });
});
exports.order.get('/orderList', util.isLoggedin, function (req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        //현재 주문 중인 주문 내용 받아오기 (소비자)
        const tokenData = req.decoded;
        const reqBody = req.query;
        try {
            //작성
            const orderList = yield models_1.orderRep.findAll({
                where: {
                    userId: tokenData.id
                },
                order: [['orderStatus', 'ASC'], ['id', 'ASC']]
            });
            if (!orderList)
                return res.json(util.successFalse(null, "주문 내역이 없습니다", null));
            return res.json(util.successTrue("", orderList));
        }
        catch (err) {
            return res.status(403).json(util.successFalse(err, "", null));
        }
    });
});
exports.order.get('/deliverList', util.isLoggedin, util.isRider, function (req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        //현재 배달 중인 배달 내용 받아오기 (배달원)
        const tokenData = req.decoded;
        const reqBody = req.query;
        try {
            //작성
            const deliverList = yield models_1.orderRep.findAll({
                where: {
                    riderId: tokenData.id
                },
                order: [['orderStatus', 'ASC'], ['id', 'ASC']]
            });
            if (!deliverList)
                return res.json(util.successFalse(null, "배달 내역이 없습니다", null));
            return res.json(util.successTrue("", deliverList));
        }
        catch (err) {
            return res.status(403).json(util.successFalse(err, "", null));
        }
    });
});
