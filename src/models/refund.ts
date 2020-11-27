import {
    AllowNull,
    Table,
    Column,
    Model,
    PrimaryKey,
    AutoIncrement,
    DataType,
    Default,
    CreatedAt,
    UpdatedAt,
    ForeignKey
} from "sequelize-typescript";
import User from "../models/user";

@Table({ timestamps: true })
export default class Refund extends Model<Refund> {
    @PrimaryKey
    @AutoIncrement
    @Column(DataType.BIGINT)
    id!: number;

    @ForeignKey(() => User)
    @AllowNull(false)
    @Column(DataType.BIGINT)
    userId!: number;

    @Column(DataType.STRING)
    accountName!: string;

    @Column(DataType.STRING)
    bankKind!: string;

    @Column(DataType.STRING)
    accountNum!: string;

    @Default(0)
    @Column(DataType.BOOLEAN)
    status!: boolean;

    @Column(DataType.DATE)
    refundAt!: Date;

    @Column(DataType.DATE)
    canceledAt!: Date;

    @Column(DataType.BIGINT)
    amount!: number;

    @CreatedAt
    createdAt!: Date;

    @UpdatedAt
    updatedAt!: Date;
}