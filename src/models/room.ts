import {
  Table,
  Model,
} from "sequelize-typescript";
  
  @Table({ timestamps: true })
export default class Room extends Model<Room> {
}
      
  