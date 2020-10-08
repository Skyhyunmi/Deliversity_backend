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
    Default
  } from "sequelize-typescript";
  
  @Table({ timestamps: true })
  export default class Verify extends Model<Verify> {
    @PrimaryKey
    @AutoIncrement
    @Column(DataType.BIGINT)
    id!: number;
  
    @Comment("User Phone")
    @Unique
    @AllowNull(false)
    @Column(DataType.STRING)
    phone!: string;
  
    @Comment("User SMS Send ID")
    @AllowNull(true)
    @Column(DataType.STRING)
    sendId!: string;

    @Comment("User SMS Verify Number")
    @AllowNull(false)
    @Column(DataType.STRING)
    number!: string;

    @Comment("User SMS Verify Number")
    @AllowNull(false)
    @Default(false)
    @Column(DataType.BOOLEAN)
    verified!: boolean;
  }
  