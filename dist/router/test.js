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
exports.test = void 0;
const express_1 = require("express");
const axios_1 = __importDefault(require("axios"));
const dotenv_1 = __importDefault(require("dotenv"));
const util = __importStar(require("../config/util"));
const functions = __importStar(require("../config/functions"));
const models_1 = require("../models");
dotenv_1.default.config();
exports.test = express_1.Router();
exports.test.get('/hello', (req, res) => {
    res.json({ string: 'hello pm2! nice to meet you!' });
});
exports.test.post('/juso', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // 주문 등록
    const reqBody = req.body;
    try {
        const coord = yield axios_1.default({
            url: `https://dapi.kakao.com/v2/local/search/address.json?query=${encodeURIComponent(reqBody.address)}`,
            method: 'get',
            headers: { Authorization: `KakaoAK ${process.env.KAKAO_KEY}` },
        });
        return res.json(util.successTrue('', coord.data.documents[0]));
    }
    catch (err) {
        // console.error(err);
        return res.json(util.successFalse(null, 'error', null));
    }
}));
exports.test.post('/noti', util.isLoggedin, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const reqBody = req.body;
    const tokenData = req.decoded;
    const user = yield models_1.userRep.findOne({ where: { id: tokenData.id } });
    if (!user)
        return res.status(403).json(util.successFalse(null, 'Retry.', null));
    const registrationToken = user.firebaseFCM;
    // console.log(registrationToken);
    try {
        const { payload } = reqBody;
        functions.sendFCMMessage(registrationToken, payload);
        return res.json(util.successTrue('', payload.notification));
    }
    catch (err) {
        return res.status(403).json(util.successFalse(err, 'Retry.', null));
    }
}));
