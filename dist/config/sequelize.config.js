"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.config = void 0;
const sequelize_typescript_1 = require("sequelize-typescript");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
exports.config = {
    development: sequelize_typescript_1.prepareOptions({
        database: process.env.DB_NAME,
        username: process.env.DB_USER,
        password: process.env.DB_PASS,
        host: process.env.DB_HOST,
        port: Number.parseInt(process.env.DB_PORT),
        dialect: "mysql",
        dialectOptions: {
            charset: "utf8mb4",
            dateStrings: true,
            typeCast: true,
        },
        timezone: "+09:00",
        models: [__dirname + '/models'],
    }),
    test: sequelize_typescript_1.prepareOptions({
        database: process.env.TEST_DB_NAME,
        username: process.env.TEST_DB_USER,
        password: process.env.TRAVIS != undefined ? undefined : process.env.DB_PASS,
        host: process.env.TRAVIS != undefined ? "127.0.0.1" : process.env.DB_HOST,
        port: Number.parseInt(process.env.DB_PORT),
        dialect: "mysql",
        dialectOptions: {
            charset: "utf8mb4",
            dateStrings: true,
            typeCast: true,
        },
        timezone: "+09:00",
        models: [__dirname + '/models'],
    }),
};
