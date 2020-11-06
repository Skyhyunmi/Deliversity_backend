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
exports.isAdmin = exports.isRider = exports.isUser = exports.isLoggedin = exports.isFirebase = exports.successFalse = exports.successTrue = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const db = __importStar(require("sequelize"));
const models_1 = require("../models");
const admin = __importStar(require("firebase-admin"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
function successTrue(message, data) {
    return {
        success: true,
        message: message || null,
        errors: null,
        data: data || null,
    };
}
exports.successTrue = successTrue;
function successFalse(err, message, data) {
    if (!err && !message)
        message = "data not found";
    return {
        success: false,
        message: message,
        errors: err || null,
        data: data,
    };
}
exports.successFalse = successFalse;
// middlewares
function isFirebase(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            admin.auth().verifyIdToken(req.headers['x-firebase-token'])
                .then((token) => __awaiter(this, void 0, void 0, function* () {
                const uid = token.uid;
                const user = yield models_1.userRep.findOne({ where: {
                        firebaseUid: uid,
                        id: req.decoded.id
                    } });
                if (!user)
                    return res.status(403).json(successFalse(null, "", null));
                next();
            }))
                .catch((err) => {
                return res.status(403).json(successFalse(err, "", null));
            });
        }
        catch (err) {
            return res.status(403).json(successFalse(err, "", null));
        }
    });
}
exports.isFirebase = isFirebase;
// middlewares
function isLoggedin(req, res, next) {
    const token = req.headers["x-access-token"];
    if (!token)
        return res.status(401).json(successFalse(null, "token is required!", null));
    else {
        jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET, function (err, decoded) {
            if (err)
                return res.status(401).json(successFalse(err, "", null));
            else {
                req["decoded"] = decoded;
                next();
            }
        });
    }
}
exports.isLoggedin = isLoggedin;
function isUser(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const user = yield models_1.userRep.findOne({ where: { userId: req.decoded.userId, grade: { [db.Op.gte]: 2 } } }); //2이상 = 정회원
            if (!user)
                return res.status(403).json(successFalse(null, "정회원이 아닙니다.", null));
            else if (!req.decoded || user.userId !== req.decoded.userId)
                return res.status(403).json(successFalse(null, "정회원이 아닙니다.", null));
            else
                return next();
        }
        catch (err) {
            return res.status(403).json(successFalse(err, "", null));
        }
    });
}
exports.isUser = isUser;
function isRider(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const user = yield models_1.userRep.findOne({ where: { userId: req.decoded.userId, grade: { [db.Op.gte]: 3 } } }); //3 = 배달원
            if (!user)
                return res.status(403).json(successFalse(null, "배달원이 아닙니다.", null));
            else if (!req.decoded || user.userId !== req.decoded.userId)
                return res.status(403).json(successFalse(null, "배달원이 아닙니다.", null));
            else
                return next();
        }
        catch (err) {
            return res.status(403).json(successFalse(err, "", null));
        }
    });
}
exports.isRider = isRider;
function isAdmin(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const user = yield models_1.userRep.findOne({ where: { userId: req.decoded.userId, grade: 777 } }); //3 = 배달원
            if (!user)
                return res.status(403).json(successFalse(null, "권한이 없습니다.", null));
            else if (!req.decoded || user.userId !== req.decoded.userId)
                return res.status(403).json(successFalse(null, "권한이 없습니다.", null));
            else
                return next();
        }
        catch (err) {
            return res.status(403).json(successFalse(err, "", null));
        }
    });
}
exports.isAdmin = isAdmin;
