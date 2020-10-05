import { NextFunction, Request, Response, Router } from "express";
import * as util from "../config/util";
import jwt from "jsonwebtoken";
import passport from "passport";
// const db = require("../models/index");
import { db } from "../models/index";
import dotenv from "dotenv";
dotenv.config();

export const test = Router();

test.get("/hello", (req: Request, res: Response) => {
  res.json({ string: "hello" });
});
