"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_typescript_1 = require("sequelize-typescript");
let User = class User extends sequelize_typescript_1.Model {
};
__decorate([
    sequelize_typescript_1.PrimaryKey,
    sequelize_typescript_1.AutoIncrement,
    sequelize_typescript_1.Column(sequelize_typescript_1.DataType.BIGINT)
], User.prototype, "id", void 0);
__decorate([
    sequelize_typescript_1.Comment('User ID'),
    sequelize_typescript_1.Unique,
    sequelize_typescript_1.AllowNull(false),
    sequelize_typescript_1.Column(sequelize_typescript_1.DataType.STRING)
], User.prototype, "userId", void 0);
__decorate([
    sequelize_typescript_1.Comment('User password'),
    sequelize_typescript_1.AllowNull(false),
    sequelize_typescript_1.Column(sequelize_typescript_1.DataType.STRING)
], User.prototype, "password", void 0);
__decorate([
    sequelize_typescript_1.AllowNull(false),
    sequelize_typescript_1.Column(sequelize_typescript_1.DataType.STRING)
], User.prototype, "salt", void 0);
__decorate([
    sequelize_typescript_1.AllowNull(false),
    sequelize_typescript_1.Column(sequelize_typescript_1.DataType.STRING)
], User.prototype, "name", void 0);
__decorate([
    sequelize_typescript_1.Unique,
    sequelize_typescript_1.AllowNull(false),
    sequelize_typescript_1.Column(sequelize_typescript_1.DataType.STRING)
], User.prototype, "nickName", void 0);
__decorate([
    sequelize_typescript_1.Default(0),
    sequelize_typescript_1.AllowNull(false),
    sequelize_typescript_1.Column(sequelize_typescript_1.DataType.TINYINT)
], User.prototype, "gender", void 0);
__decorate([
    sequelize_typescript_1.AllowNull(false),
    sequelize_typescript_1.Column(sequelize_typescript_1.DataType.STRING)
], User.prototype, "age", void 0);
__decorate([
    sequelize_typescript_1.Unique,
    sequelize_typescript_1.AllowNull(false),
    sequelize_typescript_1.Column(sequelize_typescript_1.DataType.STRING)
], User.prototype, "email", void 0);
__decorate([
    sequelize_typescript_1.Unique,
    sequelize_typescript_1.AllowNull(false),
    sequelize_typescript_1.Column(sequelize_typescript_1.DataType.STRING)
], User.prototype, "phone", void 0);
__decorate([
    sequelize_typescript_1.AllowNull(true)
    // @ForeignKey(()=>{Address})
    ,
    sequelize_typescript_1.Column(sequelize_typescript_1.DataType.STRING)
], User.prototype, "addressId", void 0);
__decorate([
    sequelize_typescript_1.Default(0),
    sequelize_typescript_1.AllowNull(false),
    sequelize_typescript_1.Column(sequelize_typescript_1.DataType.BIGINT)
], User.prototype, "grade", void 0);
__decorate([
    sequelize_typescript_1.AllowNull(true),
    sequelize_typescript_1.Column(sequelize_typescript_1.DataType.STRING)
], User.prototype, "googleOAuth", void 0);
__decorate([
    sequelize_typescript_1.AllowNull(true),
    sequelize_typescript_1.Column(sequelize_typescript_1.DataType.STRING)
], User.prototype, "firebaseUid", void 0);
__decorate([
    sequelize_typescript_1.AllowNull(true),
    sequelize_typescript_1.Column(sequelize_typescript_1.DataType.STRING)
], User.prototype, "firebaseFCM", void 0);
__decorate([
    sequelize_typescript_1.AllowNull(true),
    sequelize_typescript_1.Column(sequelize_typescript_1.DataType.STRING)
], User.prototype, "kakaoOAuth", void 0);
__decorate([
    sequelize_typescript_1.AllowNull(true),
    sequelize_typescript_1.Column(sequelize_typescript_1.DataType.STRING)
], User.prototype, "idCard", void 0);
__decorate([
    sequelize_typescript_1.Column(sequelize_typescript_1.DataType.STRING)
], User.prototype, "lat", void 0);
__decorate([
    sequelize_typescript_1.Column(sequelize_typescript_1.DataType.STRING)
], User.prototype, "lng", void 0);
__decorate([
    sequelize_typescript_1.CreatedAt
], User.prototype, "createdAt", void 0);
__decorate([
    sequelize_typescript_1.UpdatedAt
], User.prototype, "updatedAt", void 0);
__decorate([
    sequelize_typescript_1.DeletedAt
], User.prototype, "deletedAt", void 0);
User = __decorate([
    sequelize_typescript_1.Table({ timestamps: true })
], User);
exports.default = User;
