import { Response, Request, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { userRep } from "../models";
import * as admin from "firebase-admin";

import dotenv from "dotenv";
dotenv.config();

export function successTrue(message: string, data: any) {
  return {
    success: true,
    message: message || null,
    errors: null,
    data: data || null,
  };
}

export function successFalse(err: any, message: string, data: any) {
  if (!err && !message) message = "data not found";
  return {
    success: false,
    message: message,
    errors: err || null,
    data: data,
  };
}

// middlewares
export async function isFirebase(req: Request, res: Response, next: NextFunction) { //파베 권한 있나
  try {
    admin.auth().verifyIdToken(req.headers['x-firebase-token'] as string)
      .then(async token => {
        const uid = token.uid;
        const user = await userRep.findOne({
          where: {
            firebaseUid: uid,
            id: req.decoded.id
          }
        });
        if (!user) return res.status(403).json(successFalse(null, "", null));
        next();
      })
      .catch((err) => {
        return res.status(403).json(successFalse(err, "", null));
      });
  } catch (err) {
    return res.status(403).json(successFalse(err, "", null));
  }
}

// middlewares
export function isLoggedin(req: Request, res: Response, next: NextFunction) { //최소 준회원임을 알 수 있음
  const token = req.headers["x-access-token"] as string;
  if (!token)
    return res.status(401).json(successFalse(null, "token is required!", null));
  else {
    jwt.verify(token, process.env.JWT_SECRET as string, function (err, decoded) {
      if (err) return res.status(401).json(successFalse(err, "", null));
      else {
        req["decoded"] = decoded;
        next();
      }
    });
  }
}

export async function isUser(req: Request, res: Response, next: NextFunction) {
  try {
    const user = await userRep.findOne({ where: { userId: req.decoded.userId, grade: 2 } }); //2이상 = 정회원
    if (!user) return res.status(403).json(successFalse(null, "정회원이 아닙니다.", null));
    else if (!req.decoded || user.userId !== req.decoded.userId)
      return res.status(403).json(successFalse(null, "정회원이 아닙니다.", null));
    else return next();
  } catch (err) {
    return res.status(403).json(successFalse(err, "", null));
  }
}

export async function isAdmin(req: Request, res: Response, next: NextFunction) {
  try {
    const user = await userRep.findOne({ where: { userId: req.decoded.userId, grade: 777 } }); //3 = 배달원
    if (!user) return res.status(403).json(successFalse(null, "권한이 없습니다.", null));
    else if (!req.decoded || user.userId !== req.decoded.userId)
      return res.status(403).json(successFalse(null, "권한이 없습니다.", null));
    else return next();
  } catch (err) {
    return res.status(403).json(successFalse(err, "", null));
  }
}