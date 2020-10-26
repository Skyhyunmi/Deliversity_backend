import { Response, Request, NextFunction } from "express";
import jwt from "jsonwebtoken";

import dotenv from "dotenv";
import { userRep } from "../models";
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
export function isLoggedin(req: any, res: Response, next: NextFunction) { //최소 준회원임을 알 수 있음
  const token = req.headers["x-access-token"] as string;
  if (!token)
    return res.status(401).json(successFalse(null, "token is required!", null));
  else {
    jwt.verify(token, process.env.JWT_SECRET as string, function (
      err,
      decoded
    ) {
      if (err) return res.status(401).json(successFalse(err, "", null));
      else {
        req["decoded"] = decoded;
        next();
      }
    });
  }
}

export function isUser(req: any, res: Response, next: NextFunction) {
  if (!req.decoded.grade)
    return res.status(404);
  else {
    userRep.findOne({ where: { userId: req.decoded.userId, grade: 2 } }) //2 = 정회원
      .then(function (user: any) {
        if (!user)
          res.status(403).json(successFalse(null, "정회원이 아닙니다.", null));
        else if (!req.decoded || user.userId !== req.decoded.userId) {
          res
            .status(403)
            .json(successFalse(null, "정회원이 아닙니다.", null));
        } else next();
      })
      .catch(function (err: any) {
        res.status(403).json(successFalse(err, "", null));
      });
  }
}

export function isRider(req: any, res: Response, next: NextFunction) {
  if (!req.decoded.grade)
    return res.status(404);
  else {
    userRep.findOne({ where: { userId: req.decoded.userId, grade: 3 } }) //3 = 정회원
      .then(function (user: any) {
        if (!user)
          res.status(403).json(successFalse(null, "배달원이 아닙니다.", null));
        else if (!req.decoded || user.userId !== req.decoded.userId) {
          res
            .status(403)
            .json(successFalse(null, "배달원이 아닙니다.", null));
        } else next();
      })
      .catch(function (err: any) {
        res.status(403).json(successFalse(err, "", null));
      });
  }
}

export function isAdmin(req: any, res: Response, next: NextFunction) {
  if (!req.decoded.grade)
    res.status(404);
  else {
    userRep.findOne({ where: { userId: req.decoded.userId, grade: 777 } }) //777 = admin
      .then(function (user: any) {
        if (!user)
          res.status(403).json(successFalse(null, "권한이 없습니다.", null));
        else if (!req.decoded || user.userId !== req.decoded.userId) {
          res
            .status(403)
            .json(successFalse(null, "권한이 없습니다.", null));
        } else next();
      })
      .catch(function (err: any) {
        res.status(403).json(successFalse(err, "", null));
      });
  }
}