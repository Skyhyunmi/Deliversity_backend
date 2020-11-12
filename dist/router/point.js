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
const util = __importStar(require("../config/util"));
const index_1 = require("../models/index");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
exports.point = express_1.Router();
// 포인트 반환
// 포인트 차감
// 포인트 추가 - 
exports.point.get('/', util.isLoggedin, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const tokenData = req.decoded;
    const point = yield index_1.pointRep.findAll({ where: { userId: tokenData.id, status: false } });
    const sum = point.reduce((sum, cur) => sum + cur.point, 0);
    console.log(sum);
    if (sum < 0)
        return res.status(403).json(util.successFalse(null, "Error", null));
    return res.json(util.successTrue("", { point: sum.toString() }));
}));
exports.point.post('/', util.isLoggedin, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const reqBody = req.body;
    const tokenData = req.decoded;
    //결제 검증 프로세스 있어야함.
    const user = yield index_1.userRep.findOne({ where: { id: tokenData.id } });
    if (!user)
        return res.status(403).json(util.successFalse(null, "Error", null));
    const today = new Date();
    today.setFullYear(today.getFullYear() + 3, today.getMonth(), today.getDay());
    const newPoint = yield index_1.pointRep.create({
        point: reqBody.point,
        pointKind: 0,
        userId: tokenData.id,
        status: 0,
        expireAt: today
    });
    return res.json(util.successTrue("", null));
}));
exports.point.post('/pay', util.isLoggedin, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const tokenData = req.decoded;
    const reqBody = req.body;
    let price = parseInt(reqBody.price);
    if (!parseInt(reqBody.price) || !parseInt(reqBody.riderId))
        return res.status(403).json(util.successFalse(null, "Error", null));
    const user = yield index_1.userRep.findOne({ where: { id: tokenData.id } });
    if (!user)
        return res.status(403).json(util.successFalse(null, "Error", null));
    const rider = yield index_1.userRep.findOne({ where: { id: reqBody.riderId } });
    if (!rider)
        return res.status(403).json(util.successFalse(null, "Error", null));
    const points = yield index_1.pointRep.findAll({ where: {
            userId: tokenData.id,
        },
        order: [['expireAt', 'ASC']]
    });
    const sum = points.reduce((sum, cur) => {
        console.log(cur.point + " " + cur.expireAt);
        return sum + cur.point;
    }, 0);
    // 결제액 부족. 결제창으로 이동
    if (sum - parseInt(reqBody.price) < 0)
        return res.status(403).json(util.successFalse(null, "Not enough money", null));
    points.some((point) => {
        if (price) {
            const curPoint = point.point;
            if (price <= point.point) {
                point.update({ point: curPoint - price });
                price = 0;
                return true;
            }
            else {
                point.update({ point: 0 });
                point.destroy();
                price -= curPoint;
                return false;
            }
        }
        else
            return true;
    });
    const today = new Date();
    today.setFullYear(today.getFullYear() + 3, today.getMonth(), today.getDay());
    index_1.pointRep.create({
        pointKind: 0,
        status: 0,
        expireAt: today,
        userId: reqBody.riderId,
        point: parseInt(reqBody.price)
    });
    return res.json(util.successTrue("", null));
}));
// point.post('/withdraw', util.isLoggedin,async (req:Request,res:Response)=>{
// });
