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
import Order from "./order";
  
  @Table({ timestamps: true })
  export default class Review extends Model<Review> {
    @PrimaryKey
    @AutoIncrement
    @Column(DataType.BIGINT)
    id!: number;
  
    @AllowNull(false)
    @Column(DataType.BIGINT)
    orderId!: number;

    @AllowNull(false)
    @Column(DataType.BIGINT)
    userId!: number;

    @AllowNull(false)
    @Column(DataType.BIGINT)
    riderId!: number;

    @AllowNull(false)
    @Column(DataType.BIGINT)
    fromId!: number;

    // @ForeignKey(()=>{Address})
    @Column(DataType.INTEGER)
    rating!:number;
  
    // @AllowNull(true)
    @Column(DataType.TEXT)
    content!:string;
  
    @CreatedAt
    createdAt!: Date;
  
    @UpdatedAt
    updatedAt!: Date;
  
    @DeletedAt
    deletedAt!: Date;
  }
  