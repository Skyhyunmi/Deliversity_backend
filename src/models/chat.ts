import {
  Table,
  Column,
  Model,
  PrimaryKey,
  AutoIncrement,
  DataType,
  CreatedAt,
  UpdatedAt,
  DeletedAt,
} from "sequelize-typescript";
  
@Table({ timestamps: true })
export default class Chat extends Model<Chat> {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.BIGINT)
  id!: number;

  @Column(DataType.STRING)
  roomId!:string;

  @Column(DataType.STRING)
  userId!:string;

  @Column(DataType.STRING)
  userNickName!:string;
  
  @Column(DataType.TEXT)
  chat!:string;
  
  @Column(DataType.BLOB)
  photo!:string;
  
  @CreatedAt
  createdAt!: Date;

  @UpdatedAt
  updatedAt!: Date;

  @DeletedAt
  deletedAt!: Date;
}
