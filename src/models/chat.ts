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
export default class Chat extends Model<Chat> {
      @PrimaryKey
      @AutoIncrement
      @Column(DataType.BIGINT)
      id!: number;
      
      @Column(DataType.BIGINT)
      roomId!:number;
  
      @Column(DataType.STRING)
      userId!:string;
      
      @Column(DataType.TEXT)
      chat!:string;
      
      @Column(DataType.BLOB)
      gif!:string;
      
      @CreatedAt
      createdAt!: Date;
  
      @UpdatedAt
      updatedAt!: Date;
  
      @DeletedAt
      deletedAt!: Date;
}
      
  