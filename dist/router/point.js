"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.point = void 0;
const express_1 = require("express");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
exports.point = express_1.Router();
// 포인트 반환
// 포인트 차감
// 포인트 추가 - 
exports.point.post('/');
