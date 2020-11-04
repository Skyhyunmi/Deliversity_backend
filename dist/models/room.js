"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var Room_1;
Object.defineProperty(exports, "__esModule", { value: true });
const _1 = require("./");
const sequelize_typescript_1 = require("sequelize-typescript");
let Room = Room_1 = class Room extends sequelize_typescript_1.Model {
    findOrCreateRoom(userId, riderId) {
        return Room_1.findOne({
            where: {
                userId: userId,
                riderId: riderId
            },
            include: [_1.db.models.chat],
            order: [[_1.db.models.chat, 'createdAt', 'DESC']]
        }).then(room => {
            if (room)
                return room;
            else
                return Room_1.create({
                    userId: userId,
                    riderId: riderId
                }, {
                    include: [{
                            model: _1.db.models.chat,
                            order: [[_1.db.models.chat, 'createdAt', 'DESC']]
                        }],
                });
        });
    }
};
Room = Room_1 = __decorate([
    sequelize_typescript_1.Table({ timestamps: true })
], Room);
exports.default = Room;
