"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_typescript_1 = require("sequelize-typescript");
const user_1 = __importDefault(require("../models/user"));
let Payment = class Payment extends sequelize_typescript_1.Model {
};
__decorate([
    sequelize_typescript_1.PrimaryKey,
    sequelize_typescript_1.AutoIncrement,
    sequelize_typescript_1.Column(sequelize_typescript_1.DataType.BIGINT)
], Payment.prototype, "id", void 0);
__decorate([
    sequelize_typescript_1.ForeignKey(() => user_1.default),
    sequelize_typescript_1.AllowNull(false),
    sequelize_typescript_1.Column(sequelize_typescript_1.DataType.BIGINT)
], Payment.prototype, "userId", void 0);
__decorate([
    sequelize_typescript_1.Column(sequelize_typescript_1.DataType.STRING)
], Payment.prototype, "state", void 0);
__decorate([
    sequelize_typescript_1.Column(sequelize_typescript_1.DataType.STRING)
], Payment.prototype, "impUid", void 0);
__decorate([
    sequelize_typescript_1.Column(sequelize_typescript_1.DataType.STRING)
], Payment.prototype, "merchantUid", void 0);
__decorate([
    sequelize_typescript_1.Column(sequelize_typescript_1.DataType.BIGINT)
], Payment.prototype, "applyNum", void 0);
__decorate([
    sequelize_typescript_1.Column(sequelize_typescript_1.DataType.DATE)
], Payment.prototype, "paidAt", void 0);
__decorate([
    sequelize_typescript_1.Column(sequelize_typescript_1.DataType.DATE)
], Payment.prototype, "canceledAt", void 0);
__decorate([
    sequelize_typescript_1.Column(sequelize_typescript_1.DataType.BIGINT)
], Payment.prototype, "amount", void 0);
__decorate([
    sequelize_typescript_1.CreatedAt
], Payment.prototype, "createdAt", void 0);
__decorate([
    sequelize_typescript_1.UpdatedAt
], Payment.prototype, "updatedAt", void 0);
Payment = __decorate([
    sequelize_typescript_1.Table({ timestamps: true })
], Payment);
exports.default = Payment;
