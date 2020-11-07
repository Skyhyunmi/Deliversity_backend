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
exports.getUserFromKakaoInfo = exports.getUserFromGoogleInfo = exports.smsVerify = exports.sendSMS = exports.getAuthToken = exports.emailVerify = exports.sendEmail = exports.myCache = void 0;
const axios_1 = __importDefault(require("axios"));
const index_1 = require("../models/index");
const crypto = __importStar(require("crypto"));
const admin = __importStar(require("firebase-admin"));
const node_cache_1 = __importDefault(require("node-cache"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const mail_1 = require("./mail");
const classes = __importStar(require("./classes"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
exports.myCache = new node_cache_1.default();
function makeSignature(urlsub, timestamp) {
    const space = " ";
    const newLine = "\n";
    const method = "POST";
    const hmac = crypto.createHmac('sha256', process.env.NAVER_SECRET);
    const mes = [];
    mes.push(method);
    mes.push(space);
    mes.push(urlsub);
    mes.push(newLine);
    mes.push(timestamp);
    mes.push(newLine);
    mes.push(process.env.NAVER_KEY);
    const signature = hmac.update(mes.join('')).digest('base64');
    return signature;
}
function sendEmail(email, suburl) {
    return __awaiter(this, void 0, void 0, function* () {
        const key_one = crypto.randomBytes(256).toString('hex').substr(100, 5);
        const key_two = crypto.randomBytes(256).toString('base64').substr(50, 5);
        const email_number = key_one + key_two;
        try {
            const user = yield index_1.userRep.findOne({ where: { email: email } });
            if (user)
                return 'Already Existed Email';
            exports.myCache.del(email);
            const url = 'http://' + suburl + '/api/v1/auth/email/verification' + '?email_number=' + email_number;
            yield mail_1.transporter.sendMail({
                from: '"발신전용" <noreply@deliversity.co.kr>',
                to: email,
                subject: "Deliversity 인증 메일입니다.",
                html: "<h3>이메일 인증을 위해 URL을 클릭해주세요.</h3><br>" + url
            });
            exports.myCache.set(email_number, { email: email, createdAt: Date.now() });
            return null;
        }
        catch (e) {
            exports.myCache.del(email);
            exports.myCache.del(email_number);
            return 'Sent Auth Email Failed';
        }
    });
}
exports.sendEmail = sendEmail;
function emailVerify(verify) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const veri = exports.myCache.take(verify);
            if (!veri) {
                exports.myCache.del(verify);
                return "Not Matched.";
            }
            const now = Number.parseInt(Date.now().toString());
            const created = Number.parseInt(veri.createdAt);
            const remainingTime = (now - created) / 60000;
            if (remainingTime > 15) {
                exports.myCache.del(verify);
                return "Time Expired";
            }
            exports.myCache.set(veri.email, { verify: 1, updatedAt: Date.now() });
            return null;
        }
        catch (e) {
            return "Retry.";
        }
    });
}
exports.emailVerify = emailVerify;
function getAuthToken(user) {
    return __awaiter(this, void 0, void 0, function* () {
        const uid = user.firebaseUid;
        const firebaseToken = yield admin.auth().createCustomToken(uid);
        const authToken = jsonwebtoken_1.default.sign(Object.assign({}, new classes.payLoad(user)), process.env.JWT_SECRET, {
            expiresIn: '7d',
        });
        const payload = {
            firebaseToken: firebaseToken,
            authToken: authToken
        };
        return payload;
    });
}
exports.getAuthToken = getAuthToken;
function sendSMS(phone) {
    return __awaiter(this, void 0, void 0, function* () {
        const sendFrom = process.env.SEND_FROM;
        const serviceID = encodeURIComponent(process.env.NAVER_SMS_SERVICE_ID);
        const timestamp = Date.now().toString();
        const urlsub = `/sms/v2/services/${serviceID}/messages`;
        const signature = makeSignature(urlsub, timestamp);
        const randomNumber = Math.floor(Math.random() * (999999 - 100000)) + 100000;
        const data = {
            "type": "SMS",
            "contentType": "COMM",
            "countryCode": "82",
            "from": sendFrom,
            "content": `Deliversity 인증번호 ${randomNumber} 입니다.`,
            "messages": [{ "to": phone }]
        };
        try {
            const user = yield index_1.userRep.findOne({ where: { phone: phone } });
            if (user)
                return "phone number duplicated.";
            exports.myCache.del(phone);
            const Token = yield axios_1.default({
                url: `https://sens.apigw.ntruss.com/sms/v2/services/${serviceID}/messages`,
                method: "post",
                headers: {
                    "Content-Type": "application/json; charset=utf-8",
                    "x-ncp-apigw-timestamp": timestamp,
                    "x-ncp-iam-access-key": process.env.NAVER_KEY,
                    "x-ncp-apigw-signature-v2": signature
                },
                data: data
            });
            const tokenData = Token.data;
            exports.myCache.set(phone, { number: randomNumber, createdAt: Date.now() });
            if (tokenData.statusCode == "202")
                return null;
            return "문자 전송 실패";
        }
        catch (e) {
            exports.myCache.del(phone);
            return "문자 전송 실패";
        }
    });
}
exports.sendSMS = sendSMS;
function smsVerify(phone, verify) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const veri = exports.myCache.take(phone);
            if (!veri) {
                exports.myCache.del(phone);
                return "Retry.";
            }
            if (veri.number != verify) {
                exports.myCache.del(phone);
                return "Not Matched.";
            }
            const now = Number.parseInt(Date.now().toString());
            const created = Number.parseInt(veri.createdAt);
            const remainingTime = (now - created) / 60000;
            if (remainingTime > 15) { //15분
                exports.myCache.del(phone);
                return "Time Expired.";
            }
            exports.myCache.set(phone, { verify: 1, updatedAt: Date.now() });
            return null;
        }
        catch (e) {
            return "Retry.";
        }
    });
}
exports.smsVerify = smsVerify;
function getUserFromGoogleInfo(idToken) {
    return __awaiter(this, void 0, void 0, function* () {
        const ret = yield axios_1.default({
            url: 'https://www.googleapis.com/oauth2/v3/tokeninfo',
            method: "GET",
            params: {
                id_token: idToken
            }
        });
        if (!ret)
            return null;
        return { id: ret.data.sub, user: yield index_1.userRep.findOne({
                where: {
                    googleOAuth: ret.data.sub
                }
            })
        };
    });
}
exports.getUserFromGoogleInfo = getUserFromGoogleInfo;
function getUserFromKakaoInfo(accessToken) {
    return __awaiter(this, void 0, void 0, function* () {
        const ret = yield axios_1.default({
            url: 'https://kapi.kakao.com/v1/user/access_token_info',
            method: "GET",
            headers: {
                Authorization: `Bearer ${accessToken}`
            }
        });
        if (!ret)
            return null;
        return { id: ret.data.id, user: yield index_1.userRep.findOne({
                where: {
                    kakaoOAuth: ret.data.id
                }
            })
        };
    });
}
exports.getUserFromKakaoInfo = getUserFromKakaoInfo;
