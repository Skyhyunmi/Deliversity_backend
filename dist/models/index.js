"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.roomRep = exports.chatRep = exports.reviewRep = exports.reportRep = exports.qnaRep = exports.pointcategoryRep = exports.pointRep = exports.paymentRep = exports.orderRep = exports.addressRep = exports.userRep = exports.db = void 0;
const sequelize_typescript_1 = require("sequelize-typescript");
const user_1 = __importDefault(require("./user"));
const address_1 = __importDefault(require("./address"));
const order_1 = __importDefault(require("./order"));
const payment_1 = __importDefault(require("./payment"));
const point_1 = __importDefault(require("./point"));
const pointCategory_1 = __importDefault(require("./pointCategory"));
const qna_1 = __importDefault(require("./qna"));
const report_1 = __importDefault(require("./report"));
const review_1 = __importDefault(require("./review"));
const chat_1 = __importDefault(require("./chat"));
const room_1 = __importDefault(require("./room"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const sequelize_config_1 = require("../config/sequelize.config");
if (process.env.NODE_ENV == 'test')
    exports.db = new sequelize_typescript_1.Sequelize(sequelize_config_1.config.test);
else
    exports.db = new sequelize_typescript_1.Sequelize(sequelize_config_1.config.development);
exports.db.addModels([user_1.default]);
exports.db.addModels([address_1.default]);
exports.db.addModels([order_1.default]);
exports.db.addModels([payment_1.default]);
exports.db.addModels([point_1.default]);
exports.db.addModels([pointCategory_1.default]);
exports.db.addModels([qna_1.default]);
exports.db.addModels([report_1.default]);
exports.db.addModels([review_1.default]);
exports.db.addModels([chat_1.default]);
exports.db.addModels([room_1.default]);
//https://stackoverflow.com/questions/60014874/how-to-use-typescript-with-sequelize
exports.userRep = exports.db.getRepository(user_1.default);
exports.addressRep = exports.db.getRepository(address_1.default);
exports.orderRep = exports.db.getRepository(order_1.default);
exports.paymentRep = exports.db.getRepository(payment_1.default);
exports.pointRep = exports.db.getRepository(point_1.default);
exports.pointcategoryRep = exports.db.getRepository(pointCategory_1.default);
exports.qnaRep = exports.db.getRepository(qna_1.default);
exports.reportRep = exports.db.getRepository(report_1.default);
exports.reviewRep = exports.db.getRepository(review_1.default);
exports.chatRep = exports.db.getRepository(chat_1.default);
exports.roomRep = exports.db.getRepository(room_1.default);
