"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_typescript_1 = require("sequelize-typescript");
let Room = class Room extends sequelize_typescript_1.Model {
};
__decorate([
    sequelize_typescript_1.PrimaryKey,
    sequelize_typescript_1.AutoIncrement,
    sequelize_typescript_1.Column(sequelize_typescript_1.DataType.BIGINT)
], Room.prototype, "id", void 0);
__decorate([
    sequelize_typescript_1.Column(sequelize_typescript_1.DataType.BIGINT)
], Room.prototype, "orderId", void 0);
__decorate([
    sequelize_typescript_1.Column(sequelize_typescript_1.DataType.BIGINT)
], Room.prototype, "ownerId", void 0);
__decorate([
    sequelize_typescript_1.Column(sequelize_typescript_1.DataType.STRING)
], Room.prototype, "owner", void 0);
__decorate([
    sequelize_typescript_1.Column(sequelize_typescript_1.DataType.BIGINT)
], Room.prototype, "riderId", void 0);
__decorate([
    sequelize_typescript_1.Column(sequelize_typescript_1.DataType.STRING)
], Room.prototype, "password", void 0);
__decorate([
    sequelize_typescript_1.CreatedAt
], Room.prototype, "createdAt", void 0);
__decorate([
    sequelize_typescript_1.UpdatedAt
], Room.prototype, "updatedAt", void 0);
__decorate([
    sequelize_typescript_1.DeletedAt
], Room.prototype, "deletedAt", void 0);
Room = __decorate([
    sequelize_typescript_1.Table({ timestamps: true })
], Room);
exports.default = Room;
