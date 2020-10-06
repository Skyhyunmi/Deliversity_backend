/*
  id:number;
  userId:string;
  name:string;
  password:string;
  salt:string;
  nickName:string;
  gender:string;
  age:string;
  email:string;
  phone:string;
  point:number;
  grade:string;
  certified:string;
  createdAt?: Date;
  updatedAt?: Date;
*/
import {
  AllowNull,
  Unique,
  Table,
  Column,
  Model,
  HasMany,
  PrimaryKey,
  AutoIncrement,
  DataType,
  Comment,
  CreatedAt,
  UpdatedAt,
  DeletedAt,
  Default
} from "sequelize-typescript";

@Table({ timestamps: true })
export default class User extends Model<User> {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.BIGINT)
  id!: number;

  @Comment("User ID")
  @Unique
  @AllowNull(false)
  @Column(DataType.STRING)
  userId!: string;

  @Comment("User password")
  @AllowNull(false)
  @Column(DataType.STRING)
  password!: string;

  @AllowNull(false)
  @Column(DataType.STRING)
  salt!: string;

  @Unique
  @AllowNull(false)
  @Column(DataType.STRING)
  nickName!:string;

  @AllowNull(false)
  @Column(DataType.STRING)
  gender!:string;

  @AllowNull(false)
  @Column(DataType.STRING)
  age!:string;

  @Unique
  @AllowNull(false)
  @Column(DataType.STRING)
  email!:string;

  @Unique
  @AllowNull(false)
  @Column(DataType.STRING)
  phone!:string;

  @Default(0)
  @Column(DataType.BIGINT)
  point!:number;

  @AllowNull(false)
  @Column(DataType.STRING)
  grade!:string;

  @AllowNull(false)
  @Column(DataType.STRING)
  certified!:string;

  @CreatedAt
  createdAt!: Date;

  @UpdatedAt
  updatedAt!: Date;

  @DeletedAt
  deletedAt!: Date;
}
