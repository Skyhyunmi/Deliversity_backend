import { Request, Response, Router } from "express";
import * as util from "../config/util";
import { roomRep, chatRep } from "../models/index";

import dotenv from "dotenv";
dotenv.config();

export const chat = Router();

chat.post('/', util.isLoggedin,async (req:Request,res:Response)=>{
  const reqBody = req.body;
  //order자체를 보내주자
  try {
    const chatRoom = await roomRep.create({
      title:"주문",
      owner:reqBody.userId,
      roomId:reqBody.roomId
    });
    return res.json(util.successTrue("", chatRoom.id));
  } catch (err) {
    return res.status(403).json(util.successFalse(err, "", null));
  }
});

chat.delete('/', util.isLoggedin, async (req:Request,res:Response)=>{
  const reqBody = req.body;
  //order자체를 보내주자
  try {
      
    const chatRoom = await roomRep.findOne({
      where:{
        id:reqBody.roomId
      }
    });
    chatRoom?.destroy();
    return res.json(util.successTrue("",null));
  } catch (err) {
    return res.status(403).json(util.successFalse(err, "", null));
  }
});

chat.post('/:roomId',util.isLoggedin,async (req:Request,res:Response)=>{
  const tokenData = req.decoded;
  const reqBody = req.body;
  //order자체를 보내주자
  try {
    const room = req.params.roomId;
    const _chat = await chatRep.create({
      roomId:room,
      userId:tokenData.userId,
      chat: reqBody.chat
    });
    req.app.get('io').of('/chat').to(room).emit('chat',{
      char:_chat.chat,
      user: {
        _id: tokenData.userId,
        nickName: tokenData.nickName
      }
    });
    return res.json(util.successTrue("",null));
  } catch (err) {
    return res.status(403).json(util.successFalse(err, "", null));
  }
});
