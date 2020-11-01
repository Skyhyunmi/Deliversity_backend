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
const node_cache_1 = __importDefault(require("node-cache"));
const db = __importStar(require("sequelize"));
const axios_1 = __importDefault(require("axios"));
const models_1 = require("../models");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
function getDistance(lat1, lng1, lat2, lng2) {
    function deg2rad(deg) {
        return deg * (Math.PI / 180);
    }
    const R = 6371; // Radius of the earth in km
    const dLat = deg2rad(lat2 - lat1); // deg2rad below
    const dLon = deg2rad(lng2 - lng1);
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const d = R * c; // Distance in km
    return d;
}
exports.order = express_1.Router();
const myCache = new node_cache_1.default({ stdTTL: 0, checkperiod: 0 });
exports.order.post('/', util.isLoggedin, function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        //주문 등록
        const tokenData = req.decoded;
        const reqBody = req.body;
        let expHour = reqBody.expHour;
        let expMinute = reqBody.expMinute;
        let gender = parseInt(reqBody.gender);
        const today = new Date();
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
            if (!coord)
                coord.data.documents[0].y = 1, coord.data.documents[0].x = 1;
            const fee = getDistance(parseFloat(address.locX), parseFloat(address.locY), parseFloat(coord.data.documents[0].y), parseFloat(coord.data.documents[0].x)) - 1;
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
                cost: 0,
                content: reqBody.content,
                categoryName: reqBody.categoryName,
                deliveryFee: cost,
                reservation: reqBody.reservation
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
exports.order.get('/riders', util.isLoggedin, function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        //신청 배달원 목록 반환
        try {
            const riderlist = myCache.get(req.query.riderId);
            if (!riderlist) {
                return res.status(403).json(util.successFalse(null, "배달을 희망하는 배달원이 없습니다.", null));
            }
            return res.json(util.successTrue("", riderlist));
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
exports.order.post('/review/rider', util.isLoggedin, function (req, res, next) {
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
exports.order.get('/orders', util.isLoggedin, util.isRider, function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        //배달원이 찾을 배달거리 리스트 반환
        const tokenData = req.decoded;
        const reqBody = req.body;
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
/*
order.post('/apply', util.isLoggedin, util.isRider, async function (req: any, res: Response, next: NextFunction) {
  // 배달원이 해당 주문에 배달원 신청
  const tokenData = req.decoded;
  const reqBody = req.body;
  // 해당 주문 번호
  const order = await orderRep.findOne({ where: { id: req.query.orderId } });
  if (!order) res.status(403).json(util.successFalse(null, "주문 건이 없습니다.", null));
  const riderId = tokenData.id;
  const extrafee = reqBody.extrafee;
  const riderlist = myCache.get(req.query.orderId) as any;
  console.log(riderlist);
  if (!riderlist) { myCache.set(req.query.orderId, [{ riderId: riderId, extrafee: extrafee }]); }
  await riderlist.push([{ riderId: riderId, extrafee: extrafee }]);
  console.log(riderlist);
  return res.json(util.successTrue("", riderlist));
});*/
