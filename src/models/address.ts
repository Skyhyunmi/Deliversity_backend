import {
  AllowNull,
  Table,
  Column,
  Model,
  PrimaryKey,
  AutoIncrement,
  DataType,
  CreatedAt,
  UpdatedAt,
  DeletedAt,
  ForeignKey
} from "sequelize-typescript";
import User from "./user";
  
  @Table({ timestamps: true })
export default class Address extends Model<Address> {
    @PrimaryKey
    @AutoIncrement
    @Column(DataType.BIGINT)
    id!: number;
  
    @ForeignKey(()=> User)
    @AllowNull(false)
    @Column(DataType.BIGINT)
    userId!: number;

    // @AllowNull(true)
    @Column(DataType.STRING)
    address!:string;
  
    // @AllowNull(true)
    @Column(DataType.STRING)
    detailAddress!:string;

    // @AllowNull(true)
    // @ForeignKey(()=>{Address})
    @Column(DataType.STRING)
    locX!:string;
  
    // @AllowNull(true)
    @Column(DataType.STRING)
    locY!:string;
  
    @CreatedAt
    createdAt!: Date;
  
    @UpdatedAt
    updatedAt!: Date;
  
    @DeletedAt
    deletedAt!: Date;
}
  