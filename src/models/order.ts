import { ALL } from "dns";
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
    Default//, ForeignKey
  } from "sequelize-typescript";
  
  @Table({ timestamps: true })
  export default class Order extends Model<Order> {
    @PrimaryKey
    @AutoIncrement
    @Column(DataType.BIGINT)
    id!: number;

    // @AllowNull(true)
    @PrimaryKey
    @Column(DataType.BIGINT)
    userId!:number;
  
    @AllowNull(true)
    @Column(DataType.BOOLEAN)
    gender!:boolean;

    // @AllowNull(true)
    @Column(DataType.BIGINT)
    addressId!:number;
  
    @AllowNull(true)
    @Column(DataType.BIGINT)
    riderId!:number;

    @Column(DataType.STRING)
    storeName!:string;

    @Column(DataType.STRING)
    storeX!:string;

    @Column(DataType.STRING)
    storeY!:string;

    @AllowNull(true)
    @Column(DataType.STRING)
    chatId!:string;
    
    @Column(DataType.DATE)
    startTime!:Date;

    @Column(DataType.STRING)
    orderStatus!:string;

    @AllowNull(true)
    @Column(DataType.DATE)
    expArrivalTime!:Date;

    @AllowNull(true)
    @Column(DataType.BIGINT)
    totalCost!:number;

    @AllowNull(true)
    @Column(DataType.BIGINT)
    cost!:number;

    @AllowNull(true)
    @Column(DataType.BIGINT)
    distanceFee!:number;

    @AllowNull(true)
    @Column(DataType.BIGINT)
    extraFee!:number;

    @CreatedAt
    createdAt!: Date;
  
    @UpdatedAt
    updatedAt!: Date;
  
    @DeletedAt
    deletedAt!: Date;
  }
  