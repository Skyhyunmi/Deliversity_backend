"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Veri = exports.Rider = exports.payLoad = exports.userData = void 0;
class userData {
    constructor(data, userNickName) {
        this.userId = data.user._id;
        this.userNickName = userNickName;
        this.chat = data.text;
        this.roomId = data.user.roomId;
        this.photo = data.user.photo;
        this.createdAt = Date.now();
    }
}
exports.userData = userData;
class payLoad {
    constructor(user) {
        this.id = user.id;
        this.userId = user.userId;
        this.name = user.nickName;
        this.nickName = user.nickName;
        this.grade = user.grade;
        this.loggedAt = new Date().toString();
    }
}
exports.payLoad = payLoad;
class Rider {
}
exports.Rider = Rider;
;
class Veri {
}
exports.Veri = Veri;
