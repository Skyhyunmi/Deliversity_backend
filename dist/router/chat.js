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
exports.chat = void 0;
const express_1 = require("express");
const util = __importStar(require("../config/util"));
const index_1 = require("../models/index");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
exports.chat = express_1.Router();
exports.chat.post('/', util.isLoggedin, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const reqBody = req.body;
    //order자체를 보내주자
    try {
        const chatRoom = yield index_1.roomRep.create({
            title: "주문",
            owner: reqBody.userId,
            password: reqBody.password
        });
        return res.json(util.successTrue("", chatRoom.id));
    }
    catch (err) {
        return res.status(403).json(util.successFalse(err, "", null));
    }
}));
exports.chat.delete('/', util.isLoggedin, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const reqBody = req.body;
    //order자체를 보내주자
    try {
        const chatRoom = yield index_1.roomRep.findOne({
            where: {
                id: reqBody.roomId
            }
        });
        chatRoom === null || chatRoom === void 0 ? void 0 : chatRoom.destroy();
        return res.json(util.successTrue("", null));
    }
    catch (err) {
        return res.status(403).json(util.successFalse(err, "", null));
    }
}));
exports.chat.post('/:roomId', util.isLoggedin, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const tokenData = req.decoded;
    const reqBody = req.body;
    //order자체를 보내주자
    try {
        const room = req.params.roomId;
        const _chat = yield index_1.chatRep.create({
            roomId: room,
            userId: tokenData.userId,
            chat: reqBody.chat
        });
        req.app.get('io').of('/chat').to(room).emit('chat', {
            char: _chat.chat,
            user: {
                _id: tokenData.userId,
                nickName: tokenData.nickName
            }
        });
        return res.json(util.successTrue("", null));
    }
    catch (err) {
        return res.status(403).json(util.successFalse(err, "", null));
    }
}));
