import {  Request, Response, Router } from "express";
import dotenv from "dotenv";
dotenv.config();

export const test = Router();

test.get("/hello", (req: Request, res: Response) => {
  res.json({ string: "hello" });
});
