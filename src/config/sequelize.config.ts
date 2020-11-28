import {  prepareOptions } from "sequelize-typescript";
import dotenv from "dotenv";
dotenv.config();

export const config = {
  development:prepareOptions({
    database:process.env.DB_NAME as string,
    username:process.env.DB_USER as string,
    password:process.env.DB_PASS,
    host:process.env.DB_HOST,
    port: Number.parseInt(process.env.DB_PORT as string),
    dialect: "mysql",
    dialectOptions: {
      charset: "utf8mb4",
      dateStrings: true,
      typeCast: true,
    },
    timezone: "+09:00",
    models: [__dirname+'/models'],
  }),
  test:prepareOptions({
    database:process.env.TEST_DB_NAME as string,
    username:process.env.TRAVIS != undefined?"root":process.env.TEST_DB_USER as string,
    password:process.env.TRAVIS != undefined?undefined:process.env.DB_PASS,
    host: process.env.TRAVIS != undefined?"127.0.0.1":process.env.DB_HOST,
    port: process.env.TRAVIS != undefined?3306:Number.parseInt(process.env.DB_PORT as string),
    dialect: "mysql",
    dialectOptions: {
      charset: "utf8mb4",
      dateStrings: true,
      typeCast: true,
    },
    timezone: "+09:00",
    models: [__dirname+'/models'],
  }),
  // production:prepareOptions({
  //     database:process.env.RDS_DB_NAME as string,
  //     username:process.env.RDS_USERNAME as string,
  //     password:process.env.RDS_PASSWORD,
  //     host: process.env.RDS_HOSTNAME,
  //     port: Number.parseInt(process.env.RDS_PORT as string),
  //     dialect: "mysql",
  //     dialectOptions: {
  //     charset: "utf8mb4",
  //     dateStrings: true,
  //     typeCast: true,
  //     },
  //     timezone: "+09:00",
  //     models: [__dirname+'/models']
  // })
};