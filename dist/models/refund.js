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
let Refund = class Refund extends sequelize_typescript_1.Model {
};
__decorate([
    sequelize_typescript_1.PrimaryKey,
    sequelize_typescript_1.AutoIncrement,
    sequelize_typescript_1.Column(sequelize_typescript_1.DataType.BIGINT)
], Refund.prototype, "id", void 0);
__decorate([
    sequelize_typescript_1.ForeignKey(() => user_1.default),
    sequelize_typescript_1.AllowNull(false),
    sequelize_typescript_1.Column(sequelize_typescript_1.DataType.BIGINT)
], Refund.prototype, "userId", void 0);
__decorate([
    sequelize_typescript_1.Column(sequelize_typescript_1.DataType.STRING)
], Refund.prototype, "accountName", void 0);
__decorate([
    sequelize_typescript_1.Column(sequelize_typescript_1.DataType.STRING)
], Refund.prototype, "bankKind", void 0);
__decorate([
    sequelize_typescript_1.Column(sequelize_typescript_1.DataType.STRING)
], Refund.prototype, "accountNum", void 0);
__decorate([
    sequelize_typescript_1.Default(0),
    sequelize_typescript_1.Column(sequelize_typescript_1.DataType.BOOLEAN)
], Refund.prototype, "status", void 0);
__decorate([
    sequelize_typescript_1.Column(sequelize_typescript_1.DataType.DATE)
], Refund.prototype, "refundAt", void 0);
__decorate([
    sequelize_typescript_1.Column(sequelize_typescript_1.DataType.DATE)
], Refund.prototype, "canceledAt", void 0);
__decorate([
    sequelize_typescript_1.Column(sequelize_typescript_1.DataType.BIGINT)
], Refund.prototype, "amount", void 0);
__decorate([
    sequelize_typescript_1.CreatedAt
], Refund.prototype, "createdAt", void 0);
__decorate([
    sequelize_typescript_1.UpdatedAt
], Refund.prototype, "updatedAt", void 0);
Refund = __decorate([
    sequelize_typescript_1.Table({ timestamps: true })
], Refund);
exports.default = Refund;
