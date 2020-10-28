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
const Cache = __importStar(require("memory-cache"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const LocalStrategy = passport_local_1.default.Strategy;
const JwtStrategy = passport_jwt_1.default.Strategy;
const ExtractJwt = passport_jwt_1.default.ExtractJwt;
function phoneVerify(phone) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const veri = Cache.get(phone);
            if (!veri || veri != 1)
                return 0;
            const now = Number.parseInt(Date.now().toString());
            const created = Date.parse(veri.updatedAt);
            const remainingTime = (now - created) / 60000;
            if (remainingTime > 15) { //15분
                Cache.del(phone);
                return 0;
            }
            else {
                Cache.del(phone);
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
            const veri = yield index_1.emailVeriRep.findOne({ where: { email: email } });
            if (!veri || !veri.email_verified)
                return 0;
            const now = Number.parseInt(Date.now().toString());
            const created = Date.parse(veri.updatedAt);
            const remainingTime = (now - created) / 60000;
            if (remainingTime > 15) { //15분
                veri.destroy();
                return 0;
            }
            else {
                veri.destroy();
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
                const user = yield index_1.userRep.create({
                    userId: userId,
                    password: hashedPw,
                    salt: salt,
                    name: reqBody.name,
                    nickName: reqBody.nickName,
                    gender: reqBody.gender,
                    age: Number.parseInt(reqBody.age),
                    email: reqBody.email,
                    phone: reqBody.phone,
                    createdAt: new Date(),
                    updatedAt: null,
                    googleOAuth: reqBody.googleOAuth || null,
                    kakaoOAuth: reqBody.kakaoOAuth || null
                });
                done(null, user);
            }
            catch (err) {
                done(err);
            }
            ;
        });
    }));
    passport_1.default.use('login', new LocalStrategy({
        usernameField: 'id',
        passwordField: 'pw',
        session: false
    }, function (id, password, done) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const user = yield index_1.userRep.findOne({
                    where: {
                        userId: id
                    }
                });
                if (!user)
                    return done(null, false, { message: 'ID do not match' });
                crypto.pbkdf2(password, user.salt, 100000, 64, 'sha512', function (err, key) {
                    if (err) {
                        done(null, false, { message: 'error' });
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
                done(err);
            }
        });
    }));
    passport_1.default.use(new JwtStrategy({
        jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
        secretOrKey: process.env.JWT_SECRET
    }, function (jwtToken, done) {
        index_1.userRep.findOne({ where: { userId: jwtToken.userId } }).then((user) => {
            if (user) {
                return done(undefined, user, jwtToken);
            }
            else {
                return done(undefined, false);
            }
        });
    }));
}
exports.passportConfig = passportConfig;
;
