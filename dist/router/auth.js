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
exports.auth = void 0;
const express_1 = require("express");
const util = __importStar(require("../config/util"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const passport_1 = __importDefault(require("passport"));
const index_1 = require("../models/index");
const crypto = __importStar(require("crypto"));
const axios_1 = __importDefault(require("axios"));
const urlencode_1 = __importDefault(require("urlencode"));
const mail_1 = require("../config/mail");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
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
exports.auth = express_1.Router();
exports.auth.post("/signup", function (req, res, next) {
    req.query = null;
    passport_1.default.authenticate("signup", function (err, _user, info) {
        if (err) {
            return res.status(403).json(util.successFalse(err, "", null));
        }
        if (info) {
            return res.status(403).json(util.successFalse(null, info.message, null));
        }
        if (_user) {
            const user = {
                id: _user.id,
                userId: _user.userId,
                name: _user.name,
                nickName: _user.nickName,
                gender: _user.gender,
                age: _user.age,
                email: _user.email,
                phone: _user.phone,
                addressId: _user.addressId,
                grade: _user.grade,
                createdAt: _user.createdAt,
                updatedAt: _user.updatedAt
            };
            return res.json(util.successTrue("", user));
        }
    })(req, res, next);
});
exports.auth.post("/login", function (req, res, next) {
    req.query = null;
    passport_1.default.authenticate("login", { session: false }, function (err, user, info) {
        if (info === {})
            return res.status(403).json(util.successFalse(null, info.message, null));
        if (err || !user) {
            return res
                .status(403)
                .json(util.successFalse(null, "ID or PW is not valid", user));
        }
        req.logIn(user, { session: false }, function (err) {
            if (err)
                return res.status(403).json(util.successFalse(err, "Can't login", null));
            const payload = {
                id: user.id,
                userId: user.userId,
                name: user.name,
                grade: user.grade,
                loggedAt: new Date(),
            };
            const authToken = jsonwebtoken_1.default.sign(payload, process.env.JWT_SECRET, {
                expiresIn: '7d',
            });
            return res.json(util.successTrue("", { token: authToken, grade: user.grade }));
        });
    })(req, res, next);
});
exports.auth.get('/refresh', util.isLoggedin, function (req, res) {
    index_1.userRep.findOne({ where: { userId: req.decoded.userId } }).then(function (user) {
        if (!user) {
            return res.status(403).json(util.successFalse(null, "Can't refresh the token", { user: user }));
        }
        const payload = {
            id: user.id,
            userId: user.userId,
            name: user.name,
            grade: user.grade,
            loggedAt: new Date(),
        };
        const authToken = jsonwebtoken_1.default.sign(payload, process.env.JWT_SECRET, {
            expiresIn: '7d',
        });
        return res.json(util.successTrue("", { token: authToken, grade: user.grade }));
    });
});
// 이미 있는 휴대폰번호인지에 대한 확인과정이 필요할듯.
exports.auth.post("/sms", /*util.isLoggedin,*/ function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        const body = req.body;
        const phone = body.phone;
        const user = yield index_1.userRep.findOne({ where: { phone: phone } });
        if (user)
            res.status(403).json(util.successFalse(null, "phone number duplicated.", null));
        const sendFrom = process.env.SEND_FROM;
        const serviceID = urlencode_1.default.encode(process.env.NAVER_SMS_SERVICE_ID);
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
            "messages": [
                {
                    "to": phone
                }
            ]
        };
        try {
            index_1.veriRep.destroy({
                where: {
                    phone: phone
                }
            });
            const getToken = yield axios_1.default({
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
            // console.log(getToken);
            const tokenData = getToken.data;
            index_1.veriRep.create({
                phone: phone,
                sendId: tokenData.requestId,
                number: randomNumber
            });
            if (tokenData.statusCode == "202")
                return res.json(util.successTrue(tokenData.statusName, null));
            return res.status(403).json(util.successFalse(null, tokenData.statusName, null));
        }
        catch (e) {
            //console.error(e);
            index_1.veriRep.destroy({
                where: {
                    phone: phone
                }
            });
        }
    });
});
exports.auth.post("/sms/verification", function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        const body = req.body;
        const verify = body.verify;
        const phone = body.phone;
        try {
            index_1.veriRep.findOne({
                where: {
                    phone: phone
                }
            }).then(function (veri) {
                if (veri) {
                    if (veri.number == verify) {
                        const now = Number.parseInt(Date.now().toString());
                        const created = Date.parse(veri.createdAt);
                        const remainingTime = (now - created) / 60000;
                        if (remainingTime > 15) { //3분
                            veri.destroy();
                            return res.status(403).json(util.successFalse(null, "Time Expired.", null));
                        }
                        index_1.veriRep.update({ verified: true }, { where: { phone: phone } });
                        return res.json(util.successTrue("Matched.", null));
                    }
                }
                return res.status(403).json(util.successFalse(null, "Not Matched.", null));
            });
        }
        catch (e) {
            //console.error(e);
        }
    });
});
exports.auth.get('/google', passport_1.default.authenticate('google', {
    scope: ["profile", "email"]
}));
exports.auth.get('/google/callback', function (req, res, next) {
    passport_1.default.authenticate('google', function (err, user, info) {
        if (!user && info) {
            return res
                .status(403)
                .json(util.successFalse(null, "ID or PW is not valid", info.auth));
        }
        req.logIn(user, { session: false }, function (err) {
            if (err)
                return res.status(403).json(util.successFalse(err, "", null));
            const payload = {
                id: user.userId,
                name: user.name,
                admin: user.admin,
                loggedAt: new Date(),
            };
            user.authToken = jsonwebtoken_1.default.sign(payload, process.env.JWT_SECRET, {
                expiresIn: '7d',
            });
            return res.json(util.successTrue("", { token: user.authToken, admin: user.admin }));
        });
    })(req, res, next);
});
exports.auth.get('/kakao', passport_1.default.authenticate('kakao'));
exports.auth.get('/kakao/callback', function (req, res, next) {
    passport_1.default.authenticate('kakao', function (err, user, info) {
        if (!user && info) {
            return res
                .status(403)
                .json(util.successFalse(null, "ID or PW is not valid", info.auth));
        }
        req.logIn(user, function (err) {
            if (err)
                return res.status(403).json(util.successFalse(err, "", null));
            const payload = {
                id: user.userId,
                name: user.name,
                admin: user.admin,
                loggedAt: new Date(),
            };
            user.authToken = jsonwebtoken_1.default.sign(payload, process.env.JWT_SECRET, {
                expiresIn: '7d',
            });
            return res.json(util.successTrue("", { token: user.authToken, admin: user.admin }));
        });
    })(req, res);
});
exports.auth.post("/email", /*util.isLoggedin,*/ function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        const body = req.body;
        const email = body.email;
        const key_one = crypto.randomBytes(256).toString('hex').substr(100, 5);
        const key_two = crypto.randomBytes(256).toString('base64').substr(50, 5);
        const email_number = key_one + key_two;
        try {
            index_1.emailVeriRep.destroy({
                where: {
                    email: email
                }
            });
            index_1.userRep.findOne({ where: { email: email } }).then(function (user) {
                if (user) {
                    return res.status(200).json(util.successTrue('Already Existed Email', null));
                }
            });
            const url = 'http://' + req.get('host') + '/api/v1/auth/email/verification' + '?email_number=' + email_number;
            yield mail_1.transporter.sendMail({
                from: '"발신전용" <noreply@deliversity.co.kr>',
                to: email,
                subject: "Deliversity 인증 메일입니다.",
                html: "<h3>이메일 인증을 위해 URL을 클릭해주세요.</h3><br>" + url
            });
            yield index_1.emailVeriRep.create({
                email: email,
                email_number: email_number
            });
            return res.status(200).json(util.successTrue('Sent Auth Email', null));
        }
        catch (e) {
            //console.error(e);
            index_1.emailVeriRep.destroy({
                where: {
                    email: email
                }
            });
            return res.status(403).json(util.successFalse(null, 'Sent Auth Email Failed', null));
        }
    });
});
exports.auth.get('/email/verification', (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const email_number = req.query.email_number;
    index_1.emailVeriRep.findOne({
        where: { email_number: email_number }
    }).then((email_veri) => {
        if (email_veri) {
            const now = Number.parseInt(Date.now().toString());
            const created = Date.parse(email_veri.createdAt);
            const remainingTime = (now - created) / 60000;
            if (remainingTime > 15) {
                email_veri.destroy();
                return res.status(403).json(util.successFalse(null, "Time Expired", null));
            }
            email_veri.update({
                email_verified: true
            });
            return res.status(204).json(util.successTrue("Matched", null));
        }
        return res.status(403).json(util.successFalse(null, "Not Matched", null));
    });
}));
