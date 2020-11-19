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
  Default//, ForeignKey
} from "sequelize-typescript";

@Table({ timestamps: true })
export default class Order extends Model<Order> {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.BIGINT)
  id!: number;

  // @AllowNull(true)
  @PrimaryKey
  @Column(DataType.BIGINT)
  userId!: number;

  @Default(0)
  @AllowNull(false)
  @Column(DataType.TINYINT)
  gender!: number;

  @Column(DataType.STRING)
  address!: string;

  // @AllowNull(true)
  @Column(DataType.STRING)
  detailAddress!: string;

  @Column(DataType.STRING)
  lat!: string;

  @Column(DataType.STRING)
  lng!: string;

  @AllowNull(true)
  @Column(DataType.BIGINT)
  riderId!: number;

  @Column(DataType.TEXT)
  content!: string;

  @Column(DataType.STRING)
  storeAddress!: string;

  @Column(DataType.STRING)
  storeDetailAddress!: string;

  @Column(DataType.STRING)
  storeName!: string;

  @Column(DataType.STRING)
  storeLat!: string;

  @Column(DataType.STRING)
  storeLng!: string;

  @AllowNull(true)
  @Column(DataType.STRING)
  chatId!: string;

  @Column(DataType.STRING)
  categoryName!: string;

  @Column(DataType.STRING)
  orderStatus!: string;

  @Column(DataType.BOOLEAN)
  hotDeal!: boolean;

  @AllowNull(true)
  @Column(DataType.DATE)
  expArrivalTime!: Date;

  @AllowNull(true)
  @Column(DataType.BIGINT)
  totalCost!: number;

  @AllowNull(true)
  @Column(DataType.BIGINT)
  cost!: number;

  @AllowNull(true)
  @Column(DataType.BIGINT)
  deliveryFee!: number;

  @AllowNull(true)
  @Column(DataType.BIGINT)
  extraFee!: number;

  @Column(DataType.BOOLEAN)
  reservation!: boolean;

  @Default(false)
  @Column(DataType.BOOLEAN)
  reviewedByUser!: boolean

  @Default(false)
  @Column(DataType.BOOLEAN)
  reviewedByRider!: boolean

  @CreatedAt
  createdAt!: Date;

  @UpdatedAt
  updatedAt!: Date;

  @DeletedAt
  deletedAt!: Date;
}
