"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_typescript_1 = require("sequelize-typescript");
let Chat = class Chat extends sequelize_typescript_1.Model {
};
__decorate([
    sequelize_typescript_1.PrimaryKey,
    sequelize_typescript_1.AutoIncrement,
    sequelize_typescript_1.Column(sequelize_typescript_1.DataType.BIGINT)
], Chat.prototype, "id", void 0);
__decorate([
    sequelize_typescript_1.Column(sequelize_typescript_1.DataType.STRING)
], Chat.prototype, "roomId", void 0);
__decorate([
    sequelize_typescript_1.Column(sequelize_typescript_1.DataType.STRING)
], Chat.prototype, "userId", void 0);
__decorate([
    sequelize_typescript_1.Column(sequelize_typescript_1.DataType.STRING)
], Chat.prototype, "userNickName", void 0);
__decorate([
    sequelize_typescript_1.Column(sequelize_typescript_1.DataType.TEXT)
], Chat.prototype, "chat", void 0);
__decorate([
    sequelize_typescript_1.Column(sequelize_typescript_1.DataType.BLOB)
], Chat.prototype, "photo", void 0);
__decorate([
    sequelize_typescript_1.CreatedAt
], Chat.prototype, "createdAt", void 0);
__decorate([
    sequelize_typescript_1.UpdatedAt
], Chat.prototype, "updatedAt", void 0);
__decorate([
    sequelize_typescript_1.DeletedAt
], Chat.prototype, "deletedAt", void 0);
Chat = __decorate([
    sequelize_typescript_1.Table({ timestamps: true })
], Chat);
exports.default = Chat;
