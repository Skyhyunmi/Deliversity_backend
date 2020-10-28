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
const util = __importStar(require("../config/util"));
const proj4 = __importStar(require("proj4"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
exports.test = express_1.Router();
exports.test.get("/hello", (req, res) => {
    res.json({ string: "hello pm2! nice to meet you!" });
});
const epsg_5181 = proj4.Proj("+proj=tmerc +lat_0=38 +lon_0=127 +k=1 +x_0=200000 \
                            +y_0=500000 +ellps=GRS80 +units=m +no_defs");
const grs80 = proj4.Proj("+proj=tmerc +lat_0=38 +lon_0=127.5 +k=0.9996 \
                          +x_0=1000000 +y_0=2000000 +ellps=GRS80 +units=m +no_defs"); //도로명주소 제공 좌표 5179
const wgs84 = proj4.Proj("EPSG:4326"); //경위도
exports.test.get('/juso', function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        //주문 등록
        const reqBody = req.body;
        try {
            const p_x_y = proj4.toPoint([959542.9434374387, 1920240.148967761]); //월드컵로 206 grs80 -> wgs84
            const p_lat_lng = proj4.toPoint([127.0436252026175, 37.28020872988387]); //월드컵로 206 wgs84 -> grs80
            const result = proj4.transform(wgs84, grs80, p_lat_lng);
            console.log(result);
            return res.json(util.successTrue("", result));
        }
        catch (err) {
            console.error(err);
        }
    });
});
