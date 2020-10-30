"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const http_errors_1 = __importDefault(require("http-errors"));
const morgan_1 = __importDefault(require("morgan"));
const bodyParser = __importStar(require("body-parser"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const cors_1 = __importDefault(require("cors"));
const passport_1 = __importDefault(require("passport"));
const auth_1 = require("./router/auth");
const test_1 = require("./router/test");
const admin_1 = require("./router/admin");
const myinfo_1 = require("./router/myinfo");
const order_1 = require("./router/order");
const passport_2 = require("./config/passport");
const util = __importStar(require("./config/util"));
const models_1 = require("./models");
const fs = __importStar(require("fs"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
process.env.NODE_ENV = (process.env.NODE_ENV && (process.env.NODE_ENV)
    .trim().toLowerCase() == 'production') ? 'production' : 'development';
// authenticate -> Open connection
// sync -> make table if not exist
models_1.db
    /* <- 여기를 통해 토글
    .sync() //make table if not exist
    /*/
    .authenticate() //Open connection
    //*/
    .then(() => console.log("DB connected."))
    .catch(() => {
    throw "error";
});
const app = express_1.default();
app.use(morgan_1.default("dev"));
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: false }));
app.use(cookie_parser_1.default());
app.use(bodyParser.json());
// app.use(express.static(path.join(__dirname, 'public')));
app.use(passport_1.default.initialize()); // passport 구동
passport_2.passportConfig();
app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "content-type, x-access-token");
    res.header("Access-Control-Allow-Methods", "GET, PUT, POST, DELETE, OPTIONS");
    next();
});
const favicon = fs.readFileSync('favicon.ico');
app.get('/favicon.ico', (req, res) => {
    res.status(200).end(favicon);
});
app.use("/api/v1/auth", auth_1.auth);
app.use("/api/v1/test", test_1.test);
app.use("/api/v1/admin", admin_1.admin);
app.use("/api/v1/myinfo", myinfo_1.myinfo);
app.use("/api/v1/order", order_1.order);
app.use(cors_1.default());
app.use(function (req, res, next) {
    next(http_errors_1.default(404));
});
app.use(function (err, req, res, next) {
    // error 템플릿에 전달할 데이터 설정
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};
    // render the error page
    res.status(err.status || 500).json(util.successFalse(null, "Error", null));
});
app.listen(process.env.WEB_PORT, () => {
    console.log(process.env.NODE_ENV);
    console.log("Server Started");
});
