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
const functions = __importStar(require("../config/functions"));
const util = __importStar(require("../config/util"));
const classes = __importStar(require("../config/classes"));
const index_1 = require("../models/index");
const admin = __importStar(require("firebase-admin"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const passport_1 = __importDefault(require("passport"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
exports.auth = express_1.Router();
exports.auth.post("/signup", function (req, res, next) {
    passport_1.default.authenticate("signup", function (err, _user, info) {
        return __awaiter(this, void 0, void 0, function* () {
            if (err) {
                return res.status(403).json(util.successFalse(err, "", null));
            }
            if (info) {
                return res.status(403).json(util.successFalse(null, info, null));
            }
            if (_user) {
                const user = {
                    id: _user.id,
                    userId: _user.userId,
                    name: _user.name,
                    nickName: _user.nickName,
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
        });
    })(req, res, next);
});
exports.auth.post("/login", function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        passport_1.default.authenticate("login", { session: false }, function (err, user, info) {
            if (info === {})
                return res.status(403).json(util.successFalse(null, "ID or PW is not valid", null));
            if (err || !user) {
                return res.status(403).json(util.successFalse(null, err, null));
            }
            req.logIn(user, { session: false }, function (err) {
                return __awaiter(this, void 0, void 0, function* () {
                    if (err)
                        return res.status(403).json(util.successFalse(err, "로그인을 실패했습니다.", null));
                    const result = yield functions.getAuthToken(user);
                    return res.json(util.successTrue("", { firebaseToken: result.firebaseToken, token: result.authToken, grade: user.grade }));
                });
            });
        })(req, res, next);
    });
});
exports.auth.post('/login/google', function (req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const reqBody = req.body;
        try {
            const idToken = reqBody.idToken;
            const user = yield functions.getUserFromGoogleInfo(idToken);
            if (!user)
                return res.status(403).json(util.successFalse(null, "회원이 없습니다.", null));
            if (!user.user)
                return res.status(403).json(util.successFalse(null, "회원이 없습니다.", null));
            yield user.user.update({ firebaseFCM: req.body.fcmToken });
            const result = yield functions.getAuthToken(user.user);
            return res.json(util.successTrue("", { firebaseToken: result.firebaseToken, token: result.authToken, grade: user.user.grade }));
        }
        catch (e) {
            console.log(e);
            return res.status(403).json(util.successFalse(null, "Retry.", null));
        }
    });
});
exports.auth.post('/login/kakao', function (req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const reqBody = req.body;
        try {
            const accessToken = reqBody.accessToken;
            const user = yield functions.getUserFromKakaoInfo(accessToken);
            if (!user)
                return res.status(403).json(util.successFalse(null, "회원이 없습니다.", null));
            if (!user.user)
                return res.status(403).json(util.successFalse(null, "회원이 없습니다.", null));
            yield user.user.update({ firebaseFCM: req.body.fcmToken });
            const result = yield functions.getAuthToken(user.user);
            return res.json(util.successTrue("", { firebaseToken: result.firebaseToken, token: result.authToken, grade: user.user.grade }));
        }
        catch (e) {
            console.log("Error at login/kakao");
            return res.status(403).json(util.successFalse(null, "Retry.", null));
        }
    });
});
exports.auth.get('/refresh', util.isLoggedin, function (req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const user = yield index_1.userRep.findOne({ where: { userId: req.decoded.userId } });
        if (!user) {
            return res.status(403).json(util.successFalse(null, "Can't refresh the token", { user: user }));
        }
        const authToken = jsonwebtoken_1.default.sign(Object.assign({}, new classes.payLoad(user)), process.env.JWT_SECRET, {
            expiresIn: '7d',
        });
        return res.json(util.successTrue("", { token: authToken, grade: user.grade }));
    });
});
exports.auth.post("/sms", /*util.isLoggedin,*/ function (req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const reqBody = req.body;
        const phone = reqBody.phone;
        const result = yield functions.sendSMS(phone);
        if (result == null)
            return res.json(util.successTrue("문자 전송 성공", null));
        return res.status(403).json(util.successFalse(null, result, null));
    });
});
exports.auth.post("/sms/verification", function (req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const reqBody = req.body;
        const verify = reqBody.verify;
        const phone = reqBody.phone;
        const result = yield functions.smsVerify(phone, verify);
        if (result == null)
            return res.json(util.successTrue("전화번호 인증 성공", null));
        else
            return res.status(403).json(util.successFalse(null, result, null));
    });
});
exports.auth.post("/email", /*util.isLoggedin,*/ function (req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const reqBody = req.body;
        const email = reqBody.email;
        const result = yield functions.sendEmail(email, req.get('host'));
        if (result == null)
            return res.json(util.successTrue('이메일 전송 성공', null));
        else
            return res.status(403).json(util.successFalse("", result, ""));
    });
});
exports.auth.get('/email/verification', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const reqQuery = req.query;
    const email_number = reqQuery.email_number;
    const result = yield functions.emailVerify(email_number);
    if (result == null)
        return res.json(util.successTrue("이메일 인증 성공", null));
    else
        return res.status(403).json(util.successFalse(null, result, null));
}));
exports.auth.delete("/release", util.isLoggedin, function (req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const tokenData = req.decoded;
        const user = yield index_1.userRep.findOne({ where: { id: tokenData.id } });
        if (!user)
            return res.status(403).json(util.successFalse(null, "회원이 없습니다.", null));
        yield admin.auth().deleteUser(user.firebaseUid);
        yield user.destroy({ force: true });
        return res.json(util.successTrue("사용자 삭제 완료", null));
    });
});
