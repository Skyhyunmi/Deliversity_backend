import express, { Request, Response, NextFunction } from "express";
import createError from "http-errors";
import logger from "morgan";
import cookieParser from "cookie-parser";
import cors from "cors";
import path from "path";
import passport from 'passport';
import auth from "./router/auth";
// import passportConfig from './config/passport';

const app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(passport.initialize()); // passport 구동
// passportConfig();

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'content-type, x-access-token');
  res.header('Access-Control-Allow-Methods', 'GET, PUT, POST, DELETE, OPTIONS');
  next();
});

app.use("/auth", auth);

app.use(cors());

app.use(function(req:Request, res:Response, next:NextFunction) {
  next(createError(404));
});

app.listen(3000, () => {
  console.log("start");
});