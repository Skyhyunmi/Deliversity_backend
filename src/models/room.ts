import { db } from "./";
import {
  Table,
  Model,
} from "sequelize-typescript";

  @Table({ timestamps: true })
export default class Room extends Model<Room> {
  findOrCreateRoom(userId:string,riderId:string){
    return Room.findOne({
      where:{
        userId:userId,
        riderId:riderId
      },
      include: [db.models.chat],
      order: [[ db.models.chat, 'createdAt', 'DESC']]
    }).then(room=>{
      if(room) return room;
      else return Room.create({
        userId:userId,
        riderId:riderId
      },{
        include: [{
          model:db.models.chat,
          order:[[ db.models.chat, 'createdAt', 'DESC']]
        }],
        // order: [[ db.models.chat, 'createdAt', 'DESC']]
      });
    });
  }
}