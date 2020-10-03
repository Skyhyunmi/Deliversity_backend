
import {NextFunction, Request,Response,Router} from "express";
const router = Router();
import jwt from "jsonwebtoken";
import passport from "passport";
// const db = require('../models/index');
// const util = require('../config/util');

require('dotenv').config();

router.post('/signup', util.isLoggedin, util.isAdmin, function (req:Request, res:Response, next:NextFunction) {
  req.query=null;
  passport.authenticate('signup', function (err, user, info) {
    if (err) {
      return res.status(403).json(util.successFalse(err));
    }
    if (info) {
      return res.status(403).json(util.successFalse(null, info.message));
    }
    if (user) {
      return res.json(user);
    }
  })(req, res, next);
});

router.post('/login', function (req, res, next) {
  req.query = null;
  passport.authenticate('login', { session: false }, function (err, user, info) {
    if (info) return res.status(403).json(util.successFalse(null, info.message));
    if (err || !user) {
      return res.status(403).json(util.successFalse(null, 'ID or PW is not valid', user));
    }
    req.logIn(user, { session: false }, function (err) {
      if (err) return res.status(403).json(util.successFalse(err));
      const payload = {
        id: user.user_id,
        name: user.name,
        admin: user.admin,
        loggedAt: new Date()
      };
      user.authToken = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: 60 * 90 });
      res.json({ token: user.authToken, admin: user.admin });
    });
  })(req, res, next);
});

router.get('/refresh', util.isLoggedin, function (req, res) {
  db.User.findOne({ where: { user_id: req.decoded.id } }).then(function (user) {
    if (!user) {
      return res.status(400).json({
        message: 'Can\'t refresh the token',
        user: user
      });
    }
    const payload = {
      id: user.user_id,
      name: user.name,
      admin: user.admin,
      loggedAt: new Date()
    };
    user.authToken = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: 60 * 90 });
    res.json({ token: user.authToken });
  });
});

module.exports = router;