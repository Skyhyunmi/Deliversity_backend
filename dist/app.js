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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.io = exports.app = void 0;
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
const path_1 = __importDefault(require("path"));
const socket_io_1 = __importDefault(require("socket.io"));
const node_cache_1 = __importDefault(require("node-cache"));
const Admin = __importStar(require("firebase-admin"));
const pk = process.env.FB_private_key;
Admin.initializeApp({
    credential: Admin.credential.cert({
        projectId: process.env.FB_project_id,
        clientEmail: process.env.FB_client_email,
        privateKey: pk.replace(/\\n/g, '\n'),
    })
});
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
class userData {
    constructor(data) {
        this.userName = data.user._id;
        this.chat = data.text;
        // this.gif=data.gif;
        this.createdAt = Date.now();
    }
}
const myCache = new node_cache_1.default();
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
exports.app = express_1.default();
exports.app.use(morgan_1.default("dev"));
exports.app.use(express_1.default.json());
exports.app.use(express_1.default.urlencoded({ extended: false }));
exports.app.use(cookie_parser_1.default());
exports.app.use(bodyParser.json());
// app.use(express.static(path.join(__dirname, 'public')));
exports.app.use(passport_1.default.initialize()); // passport 구동
passport_2.passportConfig();
exports.app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "content-type, x-access-token");
    res.header("Access-Control-Allow-Methods", "GET, PUT, POST, DELETE, OPTIONS");
    next();
});
const favicon = fs.readFileSync('favicon.ico');
exports.app.get('/favicon.ico', (req, res) => {
    res.status(200).end(favicon);
});
exports.app.get('/', function (req, res) {
    console.log(__dirname);
    res.status(200).sendFile(path_1.default.join(__dirname, '../index.html'));
});
exports.app.get('/socket.io/socket.io.js', (req, res) => {
    res.sendFile(path_1.default.resolve(__dirname + '/../node_modules/socket.io-client/dist/socket.io.js'));
});
exports.app.get('/socket.io/socket.io.js.map', (req, res) => {
    res.sendFile(path_1.default.resolve(__dirname + '/../node_modules/socket.io-client/dist/socket.io.js.map'));
});
//   이걸 켜게되면 모든 api 요청은 x-initial-token에 INITIAL_TOKEN이 들어있어야 작동함.
//   없을 경우 404에러 반환
// app.use('/*',(req,res,next)=>{
//   const token = req.headers["x-initial-token"] as string;
//   if (token!=process.env.INITIAL_TOKEN) next(createError(404));
//   else next();
// })
exports.app.use("/api/v1/auth", auth_1.auth);
exports.app.use("/api/v1/test", test_1.test);
exports.app.use("/api/v1/admin", admin_1.admin);
exports.app.use("/api/v1/myinfo", myinfo_1.myinfo);
exports.app.use("/api/v1/order", order_1.order);
exports.app.use(cors_1.default());
exports.app.use(function (req, res, next) {
    next(http_errors_1.default(404));
});
exports.app.use(function (err, req, res, next) {
    // error 템플릿에 전달할 데이터 설정
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};
    // render the error page
    res.status(err.status || 500).json(util.successFalse(null, "Error", null));
});
const server = exports.app.listen(process.env.WEB_PORT, () => {
    console.log(process.env.NODE_ENV);
    console.log("Server Started");
});
setInterval(() => __awaiter(void 0, void 0, void 0, function* () {
    const Data = yield myCache.take('chat');
    if (Data) {
        yield models_1.chatRep.bulkCreate(Data);
    }
}), 10000);
exports.io = socket_io_1.default.listen(server, { transports: ['websocket'] });
exports.io.of('/api/v1/chat/io').on('connection', (socket) => __awaiter(void 0, void 0, void 0, function* () {
    socket.on('disconnect', (data) => __awaiter(void 0, void 0, void 0, function* () {
    }));
    socket.on('chat', (data) => __awaiter(void 0, void 0, void 0, function* () {
        const pre = Date.now();
        let user = myCache.get(data[0].user._id);
        if (user == undefined) {
            user = yield models_1.userRep.findOne({
                where: { id: data[0].user._id }
            });
            if (!user)
                return;
            const _user = {
                id: user.id,
                nickName: user.nickName
            };
            myCache.set(data[0].user._id, _user);
            user = _user;
        }
        const post = Date.now();
        const room = data[0].user.password;
        socket.join(room);
        const msg = `${user.nickName}: ${data[0].text}`;
        socket.to(room).emit('rChat', data); // 백에서 클라이언트로 rChat으로 emit
        let list = myCache.get('chat');
        if (list == undefined)
            myCache.set('chat', [new userData(data[0])]);
        else {
            list = myCache.take('chat');
            list.push(new userData(data[0]));
            myCache.set('chat', list);
        }
    }));
}));
