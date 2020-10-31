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
const dotenv_1 = __importDefault(require("dotenv"));
const models_1 = require("../models");
dotenv_1.default.config();
exports.order = express_1.Router();
exports.order.post('/', util.isLoggedin, function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        //주문 등록
        const tokenData = req.decoded;
        const reqBody = req.body;
        let gender = reqBody.gender;
        try {
            const address = yield models_1.addressRep.findOne({
                where: {
                    userid: tokenData.id,
                    id: reqBody.addressId
                }
            });
            if (!address)
                return res.status(403).json(util.successFalse(null, "해당하는 주소가 없습니다.", null));
            if (reqBody.gender > 0) {
                const user = yield models_1.userRep.findOne({ where: { id: tokenData.id, grade: [2, 3] } });
                if (!user)
                    return res.status(403).json(util.successFalse(null, "준회원은 동성 배달을 이용할 수 없습니다.", null));
                gender = user.gender;
            }
            // const distance = Math.sqrt((parseFloat(reqBody.storex) - parseFloat(address.locX)) *
            //   (parseFloat(reqBody.storex) - parseFloat(address.locX)) +
            //   (parseFloat(reqBody.storey) - parseFloat(address.locY)) *
            //   (parseFloat(reqBody.storey) - parseFloat(address.locY)));
            let cost = 3000;
            if (reqBody.hotDeal) {
                cost = 4000;
            }
            const data = {
                userId: tokenData.id,
                gender: gender,
                addressId: reqBody.addressId,
                // store 쪽 구현 아직 안되어서
                storeName: reqBody.storeName,
                storeX: reqBody.storeX,
                storeY: reqBody.storeY,
                chatId: reqBody.chatId ? reqBody.chatId : null,
                startTime: Date.now(),
                orderStatus: 0,
                hotDeal: reqBody.hotDeal ? true : false,
                // hotDeal 계산된 금액(소비자한테 알려줘야함)
                cost: cost
            };
            const order = yield models_1.orderRep.create(data);
            return res.json(util.successTrue("", order));
        }
        catch (err) {
            return res.status(403).json(util.successFalse(err, "", null));
        }
    });
});
exports.order.get('/:id', util.isLoggedin, function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        //주문 확인
        const tokenData = req.decoded;
        try {
            const _order = yield models_1.orderRep.findOne({
                where: {
                    id: req.params.id
                }
            });
            if (!_order)
                res.status(403).json(util.successFalse(null, "주문건이 없습니다.", null));
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
            //작성
        }
        catch (err) {
            return res.status(403).json(util.successFalse(err, "", null));
        }
    });
});
exports.order.get('/review/user', util.isLoggedin, function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        //유저에 대한 리뷰 확인
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
exports.order.post('/review/rider', util.isLoggedin, function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        //라이더에 대한 리뷰 작성
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
exports.order.get('/review/rider', util.isLoggedin, function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        //라이더에 대한 리뷰 확인
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
exports.order.get('/orders', util.isLoggedin, util.isRider, function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        //배달원이 찾을 배달거리 리스트 반환
        const tokenData = req.decoded;
        const reqBody = req.body;
        try {
            //작성
            const orders = yield models_1.orderRep.findAll({
                where: {
                    orderStatus: 0
                }
            });
            return res.json(util.successTrue("", orders));
        }
        catch (err) {
            return res.status(403).json(util.successFalse(err, "", null));
        }
    });
});
