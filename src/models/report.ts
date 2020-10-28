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
export default class Report extends Model<Report> {
    @PrimaryKey
    @AutoIncrement
    @Column(DataType.BIGINT)
    id!: number;
  
    @AllowNull(false)
    @Column(DataType.STRING)
    reportKind!: string;

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
  
    // @AllowNull(true)
    @Column(DataType.TEXT)
    chat!:string;
  
    // @AllowNull(true)
    @Column(DataType.TEXT)
    content!:string;
    
    @AllowNull(true)
    @Column(DataType.TEXT)
    answer!:string;

    @Default(0)
    @Column(DataType.STRING)
    stauts!:string;

    @CreatedAt
    createdAt!: Date;
  
    @UpdatedAt
    updatedAt!: Date;
  
    @DeletedAt
    deletedAt!: Date;
}
  