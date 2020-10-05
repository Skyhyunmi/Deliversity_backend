/*
  id:number;
  userId:string;
  name:string;
  password:string;
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
import {Unique,Table, Column, Model, HasMany, PrimaryKey, AutoIncrement, DataType, Comment, CreatedAt, UpdatedAt, DeletedAt} from 'sequelize-typescript';

@Table({timestamps:true,})
export default class User extends Model<User> {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.BIGINT)
  id!: number;

  @Comment("User ID")
  @Unique
  @Column(DataType.STRING)
  userId!: string;
  
  @Comment("User password")
  @Column(DataType.STRING)
  password!: string;

  @CreatedAt
  createdAt!: Date;

  @UpdatedAt
  updatedAt!: Date;

  @DeletedAt
  deletedAt!: Date;
}