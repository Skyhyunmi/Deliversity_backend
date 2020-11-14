import {
  Table,
  Model,
  PrimaryKey,
  AutoIncrement,
  Column,
  DataType,
  CreatedAt,
  UpdatedAt,
  DeletedAt,
} from "sequelize-typescript";

  @Table({ timestamps: true })
export default class Room extends Model<Room> {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.BIGINT)
  id!: number;

  @Column(DataType.BIGINT)
  orderId!:number;

  @Column(DataType.BIGINT)
  ownerId!:number;

  @Column(DataType.STRING)
  owner!:string;

  @Column(DataType.BIGINT)
  riderId!:number;

  @Column(DataType.STRING)
  roomId!:string;

  @CreatedAt
  createdAt!: Date;

  @UpdatedAt
  updatedAt!: Date;

  @DeletedAt
  deletedAt!: Date;
}