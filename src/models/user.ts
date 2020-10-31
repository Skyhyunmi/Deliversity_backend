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

  @AllowNull(false)
  @Column(DataType.STRING)
  name!: string;

  @Unique
  @AllowNull(false)
  @Column(DataType.STRING)
  nickName!:string;

  @Default(0)
  @AllowNull(false)
  @Column(DataType.TINYINT)
  gender!:number;

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

  @AllowNull(true)
  // @ForeignKey(()=>{Address})
  @Column(DataType.STRING)
  addressId!:string;

  @Default(0)
  @AllowNull(false)
  @Column(DataType.BIGINT)
  grade!:number;

  @AllowNull(true)
  @Column(DataType.STRING)
  googleOAuth!:string;

  @AllowNull(true)
  @Column(DataType.STRING)
  kakaoOAuth!:string;

  @AllowNull(true)
  @Column(DataType.STRING)
  idCard!:string;

  @CreatedAt
  createdAt!: Date;

  @UpdatedAt
  updatedAt!: Date;

  @DeletedAt
  deletedAt!: Date;
}
