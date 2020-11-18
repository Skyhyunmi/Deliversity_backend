import {
  Table,
  Column,
  Model,
  PrimaryKey,
  AutoIncrement,
  DataType,
  CreatedAt,
  UpdatedAt,
  DeletedAt,
} from "sequelize-typescript";
  
  @Table({ timestamps: true })
export default class PointCategory extends Model<PointCategory> {
    @PrimaryKey
    @AutoIncrement
    @Column(DataType.BIGINT)
    id!: number;

    // @AllowNull(true)
    @Column(DataType.STRING)
    name!:string;
  
    // @AllowNull(true)
    @Column(DataType.STRING)
    type!:string;
  
    @CreatedAt
    createdAt!: Date;
  
    @UpdatedAt
    updatedAt!: Date;
  
    @DeletedAt
    deletedAt!: Date;
}
  