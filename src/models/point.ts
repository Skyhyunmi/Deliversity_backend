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
  
import PointCategory from "./pointCategory";
import User from "./user";

  @Table({ timestamps: true })
export default class Point extends Model<Point> {
    @PrimaryKey
    @AutoIncrement
    @Column(DataType.BIGINT)
    id!: number;

    // @AllowNull(true)
    @ForeignKey(()=>User)
    @PrimaryKey
    @Column(DataType.BIGINT)
    userId!:number;
  
    // @AllowNull(true)
    @ForeignKey(()=>PointCategory)
    @Column(DataType.BIGINT)
    pointKind!:number;
  
    @Column(DataType.BIGINT)
    point!:number;

    @Column(DataType.BOOLEAN)
    status!:boolean;
    
    @CreatedAt
    createdAt!: Date;
  
    @UpdatedAt
    updatedAt!: Date;
  
    @DeletedAt
    deletedAt!: Date;

    @Column(DataType.DATE)
    expireAt!: Date;
}
  