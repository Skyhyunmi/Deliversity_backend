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

  @Default(1)
  @AllowNull(false)
  @Column(DataType.BIGINT)
  grade!:number;

  @Default("user")
  @Column(DataType.STRING)
  admin!:string;

  @AllowNull(false)
  @Column(DataType.STRING)
  certified!:string;

  @AllowNull(true)
  // @ForeignKey(()=>{Address})
  @Column(DataType.STRING)
  addressCode!:string;

  @AllowNull(true)
  @Column(DataType.STRING)
  detailAddress!:string;

  @AllowNull(true)
  @Column(DataType.STRING)
  googleOAuth!:string;

  @AllowNull(true)
  @Column(DataType.STRING)
  kakaoOAuth!:string;

  @CreatedAt
  createdAt!: Date;

  @UpdatedAt
  updatedAt!: Date;

  @DeletedAt
  deletedAt!: Date;
}
