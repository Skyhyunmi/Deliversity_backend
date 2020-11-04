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
import {passportConfig} from './config/passport';
import * as util from "./config/util";
import { chatRep, db } from "./models";
import * as fs from "fs";
import path from "path";
import socketio from "socket.io";

import dotenv from "dotenv";
dotenv.config();

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

const app = express();

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
  console.log(__dirname)
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
  console.log(process.env.NODE_ENV);
  console.log("Server Started");
})
const io = socketio.listen(server);

io.of('/api/v1/chat/io').on('connection',async (socket)=>{
  
  socket.on('chat',async (data)=>{ // 클라이언트에서 백으로 chat으로 emit
    let room = data.roomId;
    console.log(`Room: ${room} Message from ${data.userName}: ${data.msg}`);
    socket.join(room);
    socket.to(room).emit('rChat',data.msg); // 백에서 클라이언트로 rChat으로 emit
    await chatRep.create({
      userName: data.userName,
      roomId: data.roomId,
      chat:data.msg,
      gif:data.photo
    })

  })
})