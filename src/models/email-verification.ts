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
  export default class Email_Verify extends Model<Email_Verify> {
      @PrimaryKey
      @AutoIncrement
      @Column(DataType.BIGINT)
      id!: number;
    
      @Comment("User Email")
      @Unique
      @AllowNull(false)
      @Column(DataType.STRING)
      email!:string;
    
      @Comment("Email Verified Code")
      @AllowNull(false)
      @Column(DataType.STRING)
      email_number!: string;

      @Comment("Email Verified Check")
      @AllowNull(false)
      @Default(false)
      @Column(DataType.BOOLEAN)
      email_verified!: boolean;
    
  }
    