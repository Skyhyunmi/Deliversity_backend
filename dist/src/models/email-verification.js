"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_typescript_1 = require("sequelize-typescript");
let Email_Verify = class Email_Verify extends sequelize_typescript_1.Model {
};
__decorate([
    sequelize_typescript_1.PrimaryKey,
    sequelize_typescript_1.AutoIncrement,
    sequelize_typescript_1.Column(sequelize_typescript_1.DataType.BIGINT)
], Email_Verify.prototype, "id", void 0);
__decorate([
    sequelize_typescript_1.Comment("User Email"),
    sequelize_typescript_1.Unique,
    sequelize_typescript_1.AllowNull(false),
    sequelize_typescript_1.Column(sequelize_typescript_1.DataType.STRING)
], Email_Verify.prototype, "email", void 0);
__decorate([
    sequelize_typescript_1.Comment("Email Verified Code"),
    sequelize_typescript_1.AllowNull(false),
    sequelize_typescript_1.Column(sequelize_typescript_1.DataType.STRING)
], Email_Verify.prototype, "email_number", void 0);
__decorate([
    sequelize_typescript_1.Comment("Email Verified Check"),
    sequelize_typescript_1.AllowNull(false),
    sequelize_typescript_1.Default(false),
    sequelize_typescript_1.Column(sequelize_typescript_1.DataType.BOOLEAN)
], Email_Verify.prototype, "email_verified", void 0);
Email_Verify = __decorate([
    sequelize_typescript_1.Table({ timestamps: true })
], Email_Verify);
exports.default = Email_Verify;
