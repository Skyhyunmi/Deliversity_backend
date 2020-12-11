"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const socket_io_1 = __importDefault(require("socket.io"));
const node_cache_1 = __importDefault(require("node-cache"));
const classes = __importStar(require("./config/classes"));
const models_1 = require("./models");
const functions = __importStar(require("./config/functions"));
const myCache = new node_cache_1.default();
setInterval(() => __awaiter(void 0, void 0, void 0, function* () {
    const Data = yield myCache.take('chat');
    if (Data) {
        yield models_1.chatRep.bulkCreate(Data);
    }
}), 5000);
function chatServer(server) {
    const io = socket_io_1.default.listen(server, {
        transports: ['websocket', 'polling'],
        pingTimeout: 10000 * 60 * 10,
        pingInterval: 10000 * 60 * 7,
    });
    io.on('connect', (socket) => __awaiter(this, void 0, void 0, function* () {
        socket.on('dscnt', (roomId) => __awaiter(this, void 0, void 0, function* () {
            console.log('> user disconnect from: ');
            console.log(roomId);
            socket.leave(roomId);
            myCache.del(roomId);
        }));
        socket.on('cnt', (roomId) => __awaiter(this, void 0, void 0, function* () {
            console.log('> user connect to: ');
            console.log(roomId);
            myCache.del(roomId);
            socket.join(roomId);
        }));
        socket.on('chat', (data) => __awaiter(this, void 0, void 0, function* () {
            let room = myCache.get(data[0].user.roomId);
            if (room === undefined) {
                const userRoom = yield models_1.roomRep.findOne({
                    where: { roomId: data[0].user.roomId },
                });
                if (!userRoom)
                    return;
                const user = yield models_1.userRep.findOne({
                    where: { id: userRoom.ownerId },
                });
                if (!user)
                    return;
                const rider = yield models_1.userRep.findOne({
                    where: { id: userRoom.riderId },
                });
                if (!rider)
                    return;
                const _room = {
                    ownerId: user.id,
                    ownerNickName: user.nickName,
                    ownerFCM: user.firebaseFCM,
                    riderNickName: rider.nickName,
                    riderFCM: rider.firebaseFCM,
                };
                myCache.set(data[0].user.roomId, _room);
                room = _room;
            }
            // 나중에 완성되면 지울 것
            const { roomId } = data[0].user;
            socket.join(roomId);
            //
            let fcm;
            if (parseInt(data[0].user._id, 10) === parseInt(room.ownerId, 10)) {
                data[0].user.nickName = room.ownerNickName;
                fcm = room.riderFCM;
                console.log('rider fcm: ', fcm);
            }
            else {
                data[0].user.nickName = room.riderNickName;
                fcm = room.ownerFCM;
                console.log('owner fcm: ', fcm);
            }
            console.log('---------------------');
            console.log('from: ', data[0].user._id === room.ownerId ? room.ownerNickName : room.riderNickName);
            console.log('to: ', data[0].user._id === room.ownerId ? room.riderNickName : room.ownerNickName);
            console.log('text: ', data[0].text);
            console.log('---------------------');
            socket.to(roomId).broadcast.emit('rChat', data); // 백에서 클라이언트로 rChat으로 emit
            const message = {
                notification: {
                    title: data[0].user.nickName,
                    tag: data[0].user.nickName,
                    body: data[0].text ? data[0].text : '',
                },
                data: {
                    type: 'Chat',
                    roomId,
                    senderId: data[0].user._id.toString(),
                    image: data[0].image ? data[0].image : '',
                    messageType: data[0].messageType ? data[0].messageType : '',
                },
            };
            if (fcm)
                functions.sendFCMMessage(fcm, message);
            // Admin.messaging().sendToDevice(fcm, message,{priority:"high"})
            //   .then((response) => {
            //     console.log(response.results[0]);
            //   })
            //   .catch((error) => {
            //     console.log('Error sending message:', error);
            //   });
            let list = myCache.get('chat');
            if (list === undefined)
                myCache.set('chat', [new classes.userData(data[0], data[0].user.nickName)]);
            else {
                list = myCache.take('chat');
                list.push(new classes.userData(data[0], data[0].user.nickName));
                myCache.set('chat', list);
            }
        }));
    }));
}
exports.default = chatServer;
