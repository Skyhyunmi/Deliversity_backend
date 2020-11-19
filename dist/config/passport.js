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
exports.passportConfig = void 0;
const passport_1 = __importDefault(require("passport"));
const passport_local_1 = __importDefault(require("passport-local"));
const passport_jwt_1 = __importDefault(require("passport-jwt"));
const index_1 = require("../models/index");
const crypto = __importStar(require("crypto"));
const functions_1 = require("../config/functions");
const axios_1 = __importDefault(require("axios"));
const dotenv_1 = __importDefault(require("dotenv"));
const admin = __importStar(require("firebase-admin"));
const functions = __importStar(require("./functions"));
dotenv_1.default.config();
const LocalStrategy = passport_local_1.default.Strategy;
const JwtStrategy = passport_jwt_1.default.Strategy;
const ExtractJwt = passport_jwt_1.default.ExtractJwt;
function phoneVerify(phone) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const veri = functions_1.myCache.take(phone);
            if (!veri || veri.verify !== 1)
                return 0;
            const now = Number.parseInt(Date.now().toString());
            const updatedAt = veri.updatedAt;
            const remainingTime = (now - updatedAt) / 60000;
            if (remainingTime > 15) { //15분
                functions_1.myCache.del(phone);
                return 0;
            }
            else {
                functions_1.myCache.del(phone);
                return 1;
            }
        }
        catch (e) {
            return 0;
        }
    });
}
;
function emailVerify(email) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const veri = functions_1.myCache.take(email);
            if (!veri || veri.verify !== 1)
                return 0;
            const now = Number.parseInt(Date.now().toString());
            const updatedAt = veri.updatedAt;
            const remainingTime = (now - updatedAt) / 60000;
            if (remainingTime > 15) { //15분
                functions_1.myCache.del(email);
                return 0;
            }
            else {
                functions_1.myCache.del(email);
                return 1;
            }
        }
        catch (e) {
            return 0;
        }
    });
}
;
function passportConfig() {
    passport_1.default.use('signup', new LocalStrategy({
        usernameField: 'id',
        passwordField: 'pw',
        session: false,
        passReqToCallback: true
    }, function (req, userId, password, done) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const reqBody = req.body;
                const userExist = yield index_1.userRep.findOne({
                    where: {
                        userId: userId
                    }
                });
                if (userExist)
                    return done(null, false, { message: 'User already exist.' });
                const emailExist = yield index_1.userRep.findOne({
                    where: {
                        email: reqBody.email
                    }
                });
                if (emailExist)
                    return done(null, false, { message: 'E-mail duplicated.' });
                const phoneExist = yield index_1.userRep.findOne({
                    where: {
                        phone: reqBody.phone
                    }
                });
                if (phoneExist)
                    return done(null, false, { message: 'phone number duplicated.' });
                const nickExist = yield index_1.userRep.findOne({
                    where: {
                        nickName: reqBody.nickName
                    }
                });
                if (nickExist)
                    return done(null, false, { message: 'nickName duplicated.' });
                const buffer = crypto.randomBytes(64);
                const salt = buffer.toString('base64');
                const key = crypto.pbkdf2Sync(password, salt, 100000, 64, 'sha512');
                const hashedPw = key.toString('base64');
                const phoneVeri = yield phoneVerify(reqBody.phone);
                if (phoneVeri == 0)
                    return done(null, false, { message: 'SMS Verification is required.' });
                const emailVeri = yield emailVerify(reqBody.email);
                if (emailVeri == 0)
                    return done(null, false, { message: 'E-mail Verification is required.' });
                const idToken = req.body.idToken;
                let googleToken = null;
                if (idToken) {
                    const ret = yield functions.getUserFromGoogleInfo(idToken);
                    if (ret && !ret.user)
                        googleToken = ret.id;
                }
                const accessToken = req.body.accessToken;
                let kakaoToken = null;
                if (accessToken) {
                    const ret = yield functions.getUserFromKakaoInfo(accessToken);
                    if (ret && !ret.user)
                        kakaoToken = ret.id;
                }
                const fbUser = yield admin.auth().createUser({
                    email: reqBody.email,
                    emailVerified: true,
                    phoneNumber: "+82" + reqBody.phone.slice(1),
                    password: hashedPw
                });
                if (!fbUser)
                    return done(null, false, { message: 'firebase Account is already exists.' });
                const user = yield index_1.userRep.create({
                    userId: userId,
                    password: hashedPw,
                    salt: salt,
                    name: reqBody.name,
                    nickName: reqBody.nickName,
                    age: Number.parseInt(reqBody.age),
                    email: reqBody.email,
                    phone: reqBody.phone,
                    createdAt: new Date(),
                    updatedAt: null,
                    googleOAuth: googleToken || null,
                    kakaoOAuth: kakaoToken || null,
                    firebaseUid: fbUser.uid
                });
                return done(null, user);
            }
            catch (err) {
                return done(err);
            }
            ;
        });
    }));
    passport_1.default.use('login', new LocalStrategy({
        usernameField: 'id',
        passwordField: 'pw',
        session: false,
        passReqToCallback: true
    }, function (req, id, password, done) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const user = yield index_1.userRep.findOne({
                    where: {
                        userId: id
                    }
                });
                if (!user)
                    return done(null, false, { message: 'ID do not match' });
                yield user.update({ firebaseFCM: req.body.fcmToken });
                if (user.googleOAuth == null && req.body.idToken) {
                    const idToken = req.body.idToken;
                    //토큰 검증
                    const ret = yield axios_1.default({
                        url: 'https://www.googleapis.com/oauth2/v3/tokeninfo',
                        method: "GET",
                        params: {
                            id_token: idToken
                        }
                    });
                    yield user.update({
                        googleOAuth: ret.data.sub
                    });
                }
                crypto.pbkdf2(password, user.salt, 100000, 64, 'sha512', function (err, key) {
                    if (err) {
                        return done(null, false, { message: 'error' });
                    }
                    if (user.password === key.toString('base64')) {
                        return done(null, user);
                    }
                    else {
                        return done(null, false, { message: 'Password do not match.' });
                    }
                });
            }
            catch (err) {
                return done(err);
            }
        });
    }));
    passport_1.default.use(new JwtStrategy({
        jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
        secretOrKey: process.env.JWT_SECRET
    }, function (jwtToken, done) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = yield index_1.userRep.findOne({ where: { userId: jwtToken.userId } });
            if (!user)
                return done(undefined, false);
            else
                return done(undefined, user, jwtToken);
        });
    }));
}
exports.passportConfig = passportConfig;
;
