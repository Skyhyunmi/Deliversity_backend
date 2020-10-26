"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.emailVeriRep = exports.veriRep = exports.userRep = exports.db = void 0;
const sequelize_typescript_1 = require("sequelize-typescript");
const user_1 = __importDefault(require("./user"));
const verification_1 = __importDefault(require("./verification"));
const email_verification_1 = __importDefault(require("./email-verification"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
exports.db = new sequelize_typescript_1.Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASS, {
    host: process.env.DB_HOST,
    port: Number.parseInt(process.env.DB_PORT),
    dialect: "mysql",
    dialectOptions: {
        charset: "utf8mb4",
        dateStrings: true,
        typeCast: true,
    },
    timezone: "+09:00",
});
exports.db.addModels([user_1.default]);
exports.db.addModels([verification_1.default]);
exports.db.addModels([email_verification_1.default]);
//https://stackoverflow.com/questions/60014874/how-to-use-typescript-with-sequelize
exports.userRep = exports.db.getRepository(user_1.default);
exports.veriRep = exports.db.getRepository(verification_1.default);
exports.emailVeriRep = exports.db.getRepository(email_verification_1.default);
