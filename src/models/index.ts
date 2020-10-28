import { Sequelize } from "sequelize-typescript";
import User from "./user";
import Email_Verify from "./email-verification";
import Address from "./address";
import Order from "./order";
import Payment from "./payment";
import Point from "./point";
import PointCategory from "./pointCategory";
import QnA from "./qna";
import Report from "./report";
import Review from "./review";

import dotenv from "dotenv";
dotenv.config();

export const db = new Sequelize(
  process.env.DB_NAME as string,
  process.env.DB_USER as string,
  process.env.DB_PASS,
  {
    host: process.env.DB_HOST,
    port: Number.parseInt(process.env.DB_PORT as string),
    dialect: "mysql",
    dialectOptions: {
      charset: "utf8mb4",
      dateStrings: true,
      typeCast: true,
    },
    timezone: "+09:00",
    models: [__dirname+'/models'],
  }
);

db.addModels([User]);
db.addModels([Email_Verify]);
db.addModels([Address]);
db.addModels([Order]);
db.addModels([Payment]);
db.addModels([Point]);
db.addModels([PointCategory]);
db.addModels([QnA]);
db.addModels([Report]);
db.addModels([Review]);
//https://stackoverflow.com/questions/60014874/how-to-use-typescript-with-sequelize

export const userRep  = db.getRepository(User);
export const emailVeriRep  = db.getRepository(Email_Verify);
export const addressRep  = db.getRepository(Address);
export const orderRep  = db.getRepository(Order);
export const paymentRep  = db.getRepository(Payment);
export const pointRep  = db.getRepository(Point);
export const pointcategoryRep  = db.getRepository(PointCategory);
export const qnaRep  = db.getRepository(QnA);
export const reportRep  = db.getRepository(Report);
export const reviewRep  = db.getRepository(Review);