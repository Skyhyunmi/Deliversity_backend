import { NextFunction, Response, Router } from "express";
import * as util from "../config/util";

import dotenv from "dotenv";
dotenv.config();

export const order = Router();

order.post('/', function (req: any, res: Response, next: NextFunction) {
//주문 
});