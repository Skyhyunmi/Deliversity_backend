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
} from 'sequelize-typescript';

@Table({ timestamps: true })
export default class Review extends Model<Review> {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.BIGINT)
  id!: number;

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
  nickName!: string;

  // @ForeignKey(()=>{Address})
  @Column(DataType.INTEGER)
  rating!: number;

  // @AllowNull(true)
  @Column(DataType.TEXT)
  content!: string;

  @CreatedAt
  createdAt!: Date;

  @UpdatedAt
  updatedAt!: Date;

  @DeletedAt
  deletedAt!: Date;
}
