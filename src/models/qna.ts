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

// 이거 테스트용으로 임시로 작성해서 false로 꺼놈
@Table({ timestamps: false })
export default class QnA extends Model<QnA> {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.BIGINT)
  id!: number;

  @AllowNull(false)
  @Column(DataType.STRING)
  qnaKind!: string;

  @AllowNull(false)
  @Column(DataType.BIGINT)
  userId!: number;

  // @AllowNull(true)
  @Column(DataType.TEXT)
  content!: string;

  @AllowNull(true)
  @Column(DataType.TEXT)
  answer!: string;

  @Default(0)
  @Column(DataType.BOOLEAN)
  status!: boolean;

  @CreatedAt
  createdAt!: Date;

  @UpdatedAt
  updatedAt!: Date;

  @DeletedAt
  deletedAt!: Date;
}
