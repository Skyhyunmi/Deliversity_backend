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
const order_1 = __importDefault(require("../models/order"));
const pointCategory_1 = __importDefault(require("./pointCategory"));
const user_1 = __importDefault(require("./user"));
let Point = class Point extends sequelize_typescript_1.Model {
};
__decorate([
    sequelize_typescript_1.PrimaryKey,
    sequelize_typescript_1.AutoIncrement,
    sequelize_typescript_1.Column(sequelize_typescript_1.DataType.BIGINT)
], Point.prototype, "id", void 0);
__decorate([
    sequelize_typescript_1.ForeignKey(() => user_1.default),
    sequelize_typescript_1.PrimaryKey,
    sequelize_typescript_1.Column(sequelize_typescript_1.DataType.BIGINT)
], Point.prototype, "userId", void 0);
__decorate([
    sequelize_typescript_1.ForeignKey(() => pointCategory_1.default),
    sequelize_typescript_1.Column(sequelize_typescript_1.DataType.BIGINT)
], Point.prototype, "pointKind", void 0);
__decorate([
    sequelize_typescript_1.ForeignKey(() => order_1.default),
    sequelize_typescript_1.AllowNull(true),
    sequelize_typescript_1.Column(sequelize_typescript_1.DataType.BIGINT)
], Point.prototype, "orderId", void 0);
__decorate([
    sequelize_typescript_1.Column(sequelize_typescript_1.DataType.BIGINT)
], Point.prototype, "point", void 0);
__decorate([
    sequelize_typescript_1.Column(sequelize_typescript_1.DataType.BOOLEAN)
], Point.prototype, "status", void 0);
__decorate([
    sequelize_typescript_1.CreatedAt
], Point.prototype, "createdAt", void 0);
__decorate([
    sequelize_typescript_1.UpdatedAt
], Point.prototype, "updatedAt", void 0);
__decorate([
    sequelize_typescript_1.DeletedAt
], Point.prototype, "deletedAt", void 0);
__decorate([
    sequelize_typescript_1.Column(sequelize_typescript_1.DataType.DATE)
], Point.prototype, "expireAt", void 0);
Point = __decorate([
    sequelize_typescript_1.Table({ timestamps: true })
], Point);
exports.default = Point;
