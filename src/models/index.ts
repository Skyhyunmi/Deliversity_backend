import { Sequelize } from "sequelize-typescript";
import User from "./user";
import Verify from "./verification";
import dotenv from "dotenv";
import Email_Verify from "./email-verification";
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
  }
);

db.addModels([User]);
db.addModels([Verify]);
db.addModels([Email_Verify]);
//https://stackoverflow.com/questions/60014874/how-to-use-typescript-with-sequelize
export const userRep  = db.getRepository(User);
export const veriRep  = db.getRepository(Verify);
