import SocketIO from 'socket.io';
import nCache from 'node-cache';
import * as classes from './config/classes';
import { chatRep, roomRep, userRep } from './models';
import * as functions from './config/functions';

const myCache = new nCache();

setInterval(async () => {
  const Data = await myCache.take('chat') as classes.userData[];
  if (Data) {
    await chatRep.bulkCreate(Data);
  }
}, 5000);

export default function chatServer(server: any) {
  const io = SocketIO.listen(server,
    {
      transports: ['websocket', 'polling'],
      pingTimeout: 10000 * 60 * 10,
      pingInterval: 10000 * 60 * 7,
    });

  io.on('connect', async (socket: SocketIO.Socket) => {
    socket.on('dscnt', async (roomId: any) => { // 클라이언트에서 백으로 chat으로 emit
      console.log('> user disconnect from: ');
      console.log(roomId);
      socket.leave(roomId);
      myCache.del(roomId);
    });

    socket.on('cnt', async (roomId: any) => { // 클라이언트에서 백으로 chat으로 emit
      console.log('> user connect to: ');
      console.log(roomId);
      myCache.del(roomId);
      socket.join(roomId);
    });

    socket.on('chat', async (data: any[]) => { // 클라이언트에서 백으로 chat으로 emit
      let room = myCache.get(data[0].user.roomId) as any;
      if (!room) {
        const userRoom = await roomRep.findOne({
          where: { roomId: data[0].user.roomId },
        });
        if (!userRoom) return;
        const user = await userRep.findOne({
          where: { id: userRoom.ownerId },
        });
        if (!user) return;
        const rider = await userRep.findOne({
          where: { id: userRoom.riderId },
        });
        if (!rider) return;
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
      if (data[0].user._id === room.ownerId) {
        data[0].user.nickName = room.ownerNickName;
        fcm = room.riderFCM;
        console.log('rider fcm: ', fcm);
      } else {
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
          // "clickAction":
        },
        data: {
          type: 'Chat',
          roomId,
          senderId: data[0].user._id.toString(),
          image: data[0].image ? data[0].image : '',
          messageType: data[0].messageType ? data[0].messageType : '', // image or null
        },
      };
      if (fcm) functions.sendFCMMessage(fcm, message);
      // Admin.messaging().sendToDevice(fcm, message,{priority:"high"})
      //   .then((response) => {
      //     console.log(response.results[0]);
      //   })
      //   .catch((error) => {
      //     console.log('Error sending message:', error);
      //   });
      let list = myCache.get('chat') as classes.userData[];
      if (!list) myCache.set('chat', [new classes.userData(data[0], data[0].user.nickName)]);
      else {
        list = myCache.take('chat') as classes.userData[];
        list.push(new classes.userData(data[0], data[0].user.nickName));
        myCache.set('chat', list);
      }
    });
  });
}