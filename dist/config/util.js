"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.isAdmin = exports.isRider = exports.isUser = exports.isLoggedin = exports.successFalse = exports.successTrue = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const dotenv_1 = __importDefault(require("dotenv"));
const models_1 = require("../models");
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
    if (!req.decoded.grade)
        return res.status(404);
    else {
        models_1.userRep.findOne({ where: { userId: req.decoded.userId, grade: 2 } }) //2 = 정회원
            .then(function (user) {
            if (!user)
                res.status(403).json(successFalse(null, "정회원이 아닙니다.", null));
            else if (!req.decoded || user.userId !== req.decoded.userId) {
                res
                    .status(403)
                    .json(successFalse(null, "정회원이 아닙니다.", null));
            }
            else
                next();
        })
            .catch(function (err) {
            res.status(403).json(successFalse(err, "", null));
        });
    }
}
exports.isUser = isUser;
function isRider(req, res, next) {
    if (!req.decoded.grade)
        return res.status(404);
    else {
        models_1.userRep.findOne({ where: { userId: req.decoded.userId, grade: 3 } }) //3 = 정회원
            .then(function (user) {
            if (!user)
                res.status(403).json(successFalse(null, "배달원이 아닙니다.", null));
            else if (!req.decoded || user.userId !== req.decoded.userId) {
                res
                    .status(403)
                    .json(successFalse(null, "배달원이 아닙니다.", null));
            }
            else
                next();
        })
            .catch(function (err) {
            res.status(403).json(successFalse(err, "", null));
        });
    }
}
exports.isRider = isRider;
function isAdmin(req, res, next) {
    if (!req.decoded.grade)
        res.status(404);
    else {
        models_1.userRep.findOne({ where: { userId: req.decoded.userId, grade: 777 } }) //777 = admin
            .then(function (user) {
            if (!user)
                res.status(403).json(successFalse(null, "권한이 없습니다.", null));
            else if (!req.decoded || user.userId !== req.decoded.userId) {
                res
                    .status(403)
                    .json(successFalse(null, "권한이 없습니다.", null));
            }
            else
                next();
        })
            .catch(function (err) {
            res.status(403).json(successFalse(err, "", null));
        });
    }
}
exports.isAdmin = isAdmin;
