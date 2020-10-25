import {
  AllowNull,
  Unique,
  Table,
  Column,
  Model,
  PrimaryKey,
  AutoIncrement,
  DataType,
  Comment,
  CreatedAt,
  UpdatedAt,
  DeletedAt,
  Default,//, ForeignKey
  ForeignKey
} from "sequelize-typescript";
import Order from "../models/order";
import User from "../models/user";


  @Table({ timestamps: true })
export default class Payment extends Model<Payment> {
    @PrimaryKey
    @AutoIncrement
    @Column(DataType.BIGINT)
    id!: number;
  
    @ForeignKey(()=> Order)
    @AllowNull(false)
    @Column(DataType.BIGINT)
    orderId!: number;

    @ForeignKey(()=> User)
    @AllowNull(false)
    @Column(DataType.BIGINT)
    userId!: number;

    @Column(DataType.STRING)
    state!:string;

    @Column(DataType.STRING)
    impUid!:string;

    @Column(DataType.STRING)
    merchantUid!:string;

    @Column(DataType.DATE)
    paidAt!:Date;

    @Column(DataType.DATE)
    canceledAt!:Date;

    @Column(DataType.BIGINT)
    amount!:number;

    @CreatedAt
    createdAt!: Date;
  
    @UpdatedAt
    updatedAt!: Date;
}
  