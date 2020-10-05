// import passport from "passport";
// import passportLocal from "passport-local";
// import passportJwt from "passport-jwt";
// import {db} from "../models/index";
// import User from "../models/user";

// // import {crypto} from "crypto";

// const LocalStrategy = passportLocal.Strategy;
// const JwtStrategy = passportJwt.Strategy;
// const ExtractJwt = passportJwt.ExtractJwt;
// const user  = db.getRepository(User);

// passport.use(new LocalStrategy({ usernameField: "username" }, (username, password, done) => {
//   db.User.findOne({ username: username.toLowerCase() }, (err: any, user: any) => {
//     if (err) { return done(err); }
//     if (!user) {
//       return done(undefined, false, { message: `username ${username} not found.` });
//     }
//     user.comparePassword(password, (err: Error, isMatch: boolean) => {
//       if (err) { return done(err); }
//       if (isMatch) {
//         return done(undefined, user);
//       }
//       return done(undefined, false, { message: "Invalid username or password." });
//     });
//   });
// }));

// passport.use(new JwtStrategy(
//   {
//     jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
//     secretOrKey: process.env.JWT_SECRET
//   }, function (jwtToken, done) {
//     db.User.findOne({ username: jwtToken.username }, function (err: any, user: any) {
//       if (err) { return done(err, false); }
//       if (user) {
//         return done(undefined, user , jwtToken);
//       } else {
//         return done(undefined, false);
//       }
//     });
//   }));