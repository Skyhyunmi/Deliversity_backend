import { NextFunction, Request, Response, Router } from "express";
import * as functions from "../config/functions";
import * as util from "../config/util";
import { userRep } from "../models/index";
import * as admin from "firebase-admin";
import User from "../models/user";

import jwt from "jsonwebtoken";
import passport from "passport";

import dotenv from "dotenv";
dotenv.config();

export const point = Router();
// 포인트 반환
// 포인트 차감
// 포인트 추가 - 
point.post('/');

