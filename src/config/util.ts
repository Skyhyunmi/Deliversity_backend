import { Response, Request, NextFunction } from "express";
import jwt from "jsonwebtoken";

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
export function isLoggedin(req: any, res: Response, next: NextFunction) {
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

export function isAdmin(req: any, res: Response, next: NextFunction) {
  if (!req.decoded.admin)
    res.status(404);
  else {
    // db.User.findOne({ where: { userId: req.decoded.id, admin: 1 } })
    //   .then(function (user: any) {
    //     if (!user)
    //       res.status(403).json(successFalse(null, "Can't find admin", null));
    //     else if (!req.decoded || user.userId !== req.decoded.id) {
    //       res
    //         .status(403)
    //         .json(successFalse(null, "You don't have permission", null));
    //     } else next();
    //   })
    //   .catch(function (err: any) {
    //     res.status(403).json(successFalse(err, "", null));
    //   });
  }
}
