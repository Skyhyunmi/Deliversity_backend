// var jwt = require('jsonwebtoken');
import {Response,Request,NextFunction} from "express";
import jwt from "jsonwebtoken";
import db from "../models/index";
// const db = require('../models/index');

// var util = {successTrue,
//     successFalse,
//     isLoggedin,
//     isAdmin};

function successTrue (data: any) {
  return {
    success: true,
    message: null,
    errors: null,
    data: data
  };
};

function successFalse (err: any, message: string, data: any) {
  if (!err && !message) message = 'data not found';
  return {
    success: false,
    message: message,
    errors: err || null,
    data: data
  };
};

// middlewares
function isLoggedin (req:Request, res:Response, next:NextFunction) {
  var token = req.headers['x-access-token'];
  if (!token) return res.status(403).json(successFalse(null, 'token is required!',null));
  else {
    jwt.verify(token, process.env.JWT_SECRET, function (err, decoded) {
      if (err) return res.status(403).json(successFalse(err,"",null));
      else {
        req.decoded = decoded;
        next();
      }
    });
  }
};

function isAdmin (req, res, next) {
  if (!req.decoded.admin) res.status(403).json(util.successFalse(null, 'Not a Admin'));
  else {
    db.User.findOne({ where: { user_id: req.decoded.id, admin: 1 } })
      .then(function (user) {
        if (!user) res.status(403).json(util.successFalse(null, 'Can\'t find admin'));
        else if (!req.decoded || user.user_id !== req.decoded.id) {
          res.status(403).json(util.successFalse(null, 'You don\'t have permission'));
        } else next();
      }).catch(function (err) {
        res.status(403).json(util.successFalse(err));
      }); 
  }
};

module.exports = {successTrue,successFalse,isLoggedin,isAdmin};