"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.isAdmin = exports.isLoggedin = exports.successFalse = exports.successTrue = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
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
function isAdmin(req, res, next) {
    if (!req.decoded.admin)
        res.status(404);
    else {
        // db.User.findOne({ where: { userId: req.decoded.id, admin: 1 } })
        //   .then(function (user: any) {
        //     if (!user)
        //       res.status(403).json(successFalse(null, "Can't find admin", null));
        //     else if (!req.decoded || user.userId !== req.decoded.id) {
        //       res
        //         .status(403)
        //         .json(successFalse(null, "You don't have permission", null));
        //     } else next();
        //   })
        //   .catch(function (err: any) {
        //     res.status(403).json(successFalse(err, "", null));
        //   });
    }
}
exports.isAdmin = isAdmin;
