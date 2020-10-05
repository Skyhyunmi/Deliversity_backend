import { Sequelize } from "sequelize-typescript";
import User from "./user";
// import {deliFactory} from "./deli";

import dotenv from "dotenv";
import sequelize from "sequelize";
dotenv.config();

export const db = new Sequelize(
  process.env.DB_NAME as any,
  process.env.DB_USER as any,
  process.env.DB_PASS,
  {
    host: process.env.DB_HOST,
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

//https://stackoverflow.com/questions/60014874/how-to-use-typescript-with-sequelize
