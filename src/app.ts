import express, { Request, Response, NextFunction } from "express";
import createError from "http-errors";
import logger from "morgan";
import * as bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import cors from "cors";
import passport from "passport";
import { auth } from "./router/auth";
import { test } from "./router/test";
import { admin } from "./router/admin";
import { myinfo } from "./router/myinfo";
import { order } from "./router/order";
import { point } from "./router/point";
import {passportConfig} from './config/passport';
import * as util from "./config/util";
import * as functions from "./config/functions";
import * as classes from "./config/classes";
import { chatRep, db, roomRep, userRep } from "./models";
import * as fs from "fs";
import path from "path";
import { Server, Socket } from "socket.io";
import nCache from "node-cache";

import * as Admin from "firebase-admin";
const pk = process.env.FB_private_key as string;
Admin.initializeApp({
  credential: Admin.credential.cert({
    projectId: process.env.FB_project_id,
    clientEmail: process.env.FB_client_email,
    privateKey: pk.replace(/\\n/g, '\n'),
  })
});

import dotenv from "dotenv";
dotenv.config();

const myCache = new nCache();

process.env.NODE_ENV = ( process.env.NODE_ENV && ( process.env.NODE_ENV )
  .trim().toLowerCase() == 'production' ) ? 'production' : 'development';

// authenticate -> Open connection
// sync -> make table if not exist
db
  /* <- 여기를 통해 토글
  .sync() //make table if not exist
  /*/
  .authenticate() //Open connection
  //*/
  .then(() => console.log("DB connected."))
  .catch(() => {
    throw "error";
  });

export const app = express();

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(bodyParser.json());
// app.use(express.static(path.join(__dirname, 'public')));
app.use(passport.initialize()); // passport 구동
passportConfig();

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "content-type, x-access-token");
  res.header("Access-Control-Allow-Methods", "GET, PUT, POST, DELETE, OPTIONS");
  next();
});
const favicon = fs.readFileSync('favicon.ico');

app.get('/favicon.ico',(req:any,res:Response)=>{
  res.status(200).end(favicon);
});

app.get('/', function(req, res) {
  console.log(__dirname);
  res.status(200).sendFile(path.join(__dirname, '../index.html'));
});

app.get('/socket.io/socket.io.js', (req, res) => {
  res.sendFile(
    path.resolve(
      __dirname + '/../node_modules/socket.io-client/dist/socket.io.js'
    )
  );
});
app.get('/socket.io/socket.io.js.map', (req, res) => {
  res.sendFile(
    path.resolve(
      __dirname + '/../node_modules/socket.io-client/dist/socket.io.js.map'
    )
  );
});
//   이걸 켜게되면 모든 api 요청은 x-initial-token에 INITIAL_TOKEN이 들어있어야 작동함.
//   없을 경우 404에러 반환
// app.use('/*',(req,res,next)=>{
//   const token = req.headers["x-initial-token"] as string;
//   if (token!=process.env.INITIAL_TOKEN) next(createError(404));
//   else next();
// })

app.use("/api/v1/auth", auth);
app.use("/api/v1/test", test);
app.use("/api/v1/admin", admin);
app.use("/api/v1/myinfo", myinfo);
app.use("/api/v1/order", order);
app.use("/api/v1/point", point);
app.use(cors());

app.use(function ( req: Request, res: Response, next:NextFunction ) {
  next(createError(404));
});

app.use(function(err:any, req:any, res:Response, next:NextFunction) {
  // error 템플릿에 전달할 데이터 설정
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500).json(util.successFalse(null,"Error",null));
});

const server = app.listen(process.env.WEB_PORT, () => {
  if(process.env.NODE_ENV == 'production')
  functions.sendSMStoAdmin();
  console.log(process.env.NODE_ENV);
  console.log("Server Started");
});

setInterval(async ()=>{
  const Data = await myCache.take('chat') as classes.userData[];
  if(Data){
    await chatRep.bulkCreate(Data);
  }
},5000);

export const io = new Server(server,{transports:['websocket','polling']});

io.on('connect',async (socket:Socket)=>{
  socket.on('dscnt',async (roomId: any)=>{ // 클라이언트에서 백으로 chat으로 emit
    console.log("> user disconnect from: ")
    console.log(roomId)
    socket.disconnect();
    myCache.del(roomId)
  });

  socket.on('cnt',async (roomId: any)=>{ // 클라이언트에서 백으로 chat으로 emit
    console.log("> user connect to: ")
    console.log(roomId)
    myCache.del(roomId)
    socket.join(roomId);
  });

  socket.on('chat',async (data: any[])=>{ // 클라이언트에서 백으로 chat으로 emit
    let room = myCache.get(data[0].user.roomId) as any;

    // 이 부분은 테스트용.
    if(data[0].user.roomId == "664e4b4a0f8f37dfc636f8296992e08b5639a2f539115e9a51"){
      room = {
        ownerId:data[0].user._id,
        ownerNickName:"owner",
        riderNickName:"rider",
      };
    }
    else 
    //
    if(room == undefined) {
      const userRoom = await roomRep.findOne({
        where:{password: data[0].user.roomId}
      });
      if(!userRoom) return;
      const user = await userRep.findOne({
        where:{id:userRoom.ownerId}
      });
      if(!user) return;
      const rider = await userRep.findOne({
        where:{id:userRoom.riderId}
      });
      if(!rider) return;
      const _room = {
        ownerId:user.id,
        ownerNickName:user.nickName,
        ownerFCM: user.firebaseFCM,
        riderNickName:rider.nickName,
        riderFCM: rider.firebaseFCM,
      };
      myCache.set(data[0].user.roomId,_room);
      room=_room;
    }
    // 나중에 완성되면 지울 것
    const roomId = data[0].user.roomId;
    socket.join(roomId);
    //
    let fcm;
    if(parseInt(data[0].user._id) == parseInt(room.ownerId)){
      data[0].user.nickName = room.ownerNickName;
      fcm = room.riderFCM;
      console.log("rider fcm: ",fcm);
    }
    else {
      data[0].user.nickName = room.riderNickName;
      fcm = room.ownerFCM;
      console.log("owner fcm: ",fcm);
    }
    console.log("> userText:")
    console.log(data[0].text)
    socket.to(roomId).emit('rChat',data); // 백에서 클라이언트로 rChat으로 emit

    const message = {
      notification:{
        "title":data[0].user.nickName,
        "tag":data[0].user.nickName,
        "body":data[0].text,
        // "clickAction":
      },
      data:{
        type:'ChatScreen'
      }
    };
    console.log(data[0].user.nickName)
    Admin.messaging().sendToDevice(fcm, message)
      .then(async (response) => {
        console.log(response.results[0])
        if(response.results[0].error){
          if(parseInt(data[0].user._id) == parseInt(room.ownerId)){
            const rider = await userRep.findOne({
              where:{nickName:room.riderNickName}
            });
            if(!rider) return;
            room.riderFCM = rider.firebaseFCM;
            await Admin.messaging().sendToDevice(room.riderFCM, message)
            myCache.set(data[0].user.roomId,room);
          }
          else{
            const owner = await userRep.findOne({
              where:{nickName:room.ownerNickName}
            });
            if(!owner) return;
            room.ownerFCM = owner.firebaseFCM;
            await Admin.messaging().sendToDevice(room.ownerFCM, message)
            myCache.set(data[0].user.roomId,room);
          }
          
        }
      })
      .catch(async (error) => {
        console.log('Error sending message:', error);
        if(parseInt(data[0].user._id) == parseInt(room.ownerId)){
          const rider = await userRep.findOne({
            where:{nickName:room.riderNickName}
          });
          if(!rider) return;
          room.riderFCM = rider.firebaseFCM;
          await Admin.messaging().sendToDevice(room.riderFCM, message)
          myCache.set(data[0].user.roomId,room);
        }
        else{
          const owner = await userRep.findOne({
            where:{nickName:room.ownerNickName}
          });
          if(!owner) return;
          room.ownerFCM = owner.firebaseFCM;
          await Admin.messaging().sendToDevice(room.ownerFCM, message)
          myCache.set(data[0].user.roomId,room);
        }
      });
    let list = myCache.get('chat') as classes.userData[];
    if(list == undefined)
      myCache.set('chat',[new classes.userData(data[0],data[0].user.nickName)])
    else{
      list=myCache.take('chat') as classes.userData[];
      list.push(new classes.userData(data[0],data[0].user.nickName))
      myCache.set('chat',list)
    }
  });
});