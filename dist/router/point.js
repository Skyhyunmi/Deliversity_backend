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
        return res.status(403).json(util.successFalse(null, "포인트 반환 실패", null));
    return res.json(util.successTrue("", { point: sum.toString() }));
}));
exports.point.post('/', util.isLoggedin, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const reqBody = req.body;
    const tokenData = req.decoded;
    //결제 검증 프로세스 있어야함.
    const user = yield index_1.userRep.findOne({ where: { id: tokenData.id } });
    if (!user)
        return res.status(403).json(util.successFalse(null, "포인트 충전 실패", null));
    const today = new Date();
    today.setFullYear(today.getFullYear() + 3, today.getMonth(), today.getDay());
    yield index_1.pointRep.create({
        point: reqBody.point,
        pointKind: 0,
        userId: tokenData.id,
        status: 0,
        expireAt: today
    });
    return res.json(util.successTrue("", null));
}));
// point.post('/withdraw', util.isLoggedin,async (req:Request,res:Response)=>{
// });
