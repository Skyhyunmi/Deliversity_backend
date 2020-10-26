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
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const LocalStrategy = passport_local_1.default.Strategy;
const JwtStrategy = passport_jwt_1.default.Strategy;
const ExtractJwt = passport_jwt_1.default.ExtractJwt;
function certify(phone) {
    return __awaiter(this, void 0, void 0, function* () {
        let ret = 0;
        try {
            yield index_1.veriRep.findOne({ where: { phone: phone } })
                .then((veri) => {
                if (veri) {
                    if (veri.verified == true) {
                        const now = Number.parseInt(Date.now().toString());
                        const created = Date.parse(veri.createdAt);
                        const remainingTime = (now - created) / 60000;
                        if (remainingTime > 30) { //30분
                            veri.destroy();
                        }
                        else
                            ret = 1;
                    }
                }
            });
        }
        catch (e) {
            console.error(e);
        }
        return ret;
    });
}
;
function passportConfig() {
    passport_1.default.use('signup', new LocalStrategy({
        usernameField: 'id',
        passwordField: 'pw',
        session: false,
        passReqToCallback: true
    }, function (req, id, password, done) {
        try {
            index_1.userRep.findOne({
                where: {
                    userId: id
                }
            }).then(function (user) {
                const data = req.body;
                if (user) {
                    return done(null, false, { message: 'User already exist.' });
                }
                index_1.userRep.findOne({
                    where: {
                        email: data.email
                    }
                }).then(function (user) {
                    return __awaiter(this, void 0, void 0, function* () {
                        if (user) {
                            return done(null, false, { message: 'E-mail duplicated.' });
                        }
                        const buffer = crypto.randomBytes(64);
                        const salt = buffer.toString('base64');
                        const key = crypto.pbkdf2Sync(password, salt, 100000, 64, 'sha512');
                        const hashedPw = key.toString('base64');
                        const certified = yield certify(data.phone);
                        if (certified == 0)
                            return done(null, false, { message: 'SMS Verification is required.' });
                        index_1.userRep.create({
                            userId: id,
                            name: data.name,
                            email: data.email,
                            salt: salt,
                            nickName: data.nickName,
                            gender: data.gender,
                            age: Number.parseInt(data.age),
                            phone: data.phone,
                            admin: data.is_admin,
                            password: hashedPw,
                            createdAt: new Date(),
                            updatedAt: null,
                            certified: certified,
                            googleOAuth: data.googleOAuth || null,
                            kakaoOAuth: data.kakaoOAuth || null,
                        }).then(function (result) {
                            done(null, result);
                        }).catch(function (err) {
                            done(err);
                        });
                        index_1.veriRep.destroy({
                            where: {
                                phone: data.phone
                            }
                        });
                    });
                });
            });
        }
        catch (err) {
            done(err);
        }
    }));
    passport_1.default.use('login', new LocalStrategy({
        usernameField: 'id',
        passwordField: 'pw',
        session: false
    }, function (id, password, done) {
        try {
            index_1.userRep.findOne({
                where: {
                    userId: id
                }
            }).then(function (user) {
                if (user) {
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
                else {
                    return done(null, false, { message: 'ID do not match' });
                }
            });
        }
        catch (err) {
            done(err);
        }
    }));
    passport_1.default.use('googleLogin', new LocalStrategy({
        usernameField: 'id',
        passwordField: 'pw',
        session: false,
        passReqToCallback: true
    }, function (req, id, pw, done) {
        try {
            index_1.userRep.findOne({
                where: {
                    googleOAuth: id
                }
            }).then(function (user) {
                if (user) {
                    return done(null, user);
                }
                else {
                    return done(null, false, { message: 'ID do not match' });
                }
            });
        }
        catch (err) {
            done(err);
        }
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
