import a from "mysql2/node_modules/iconv-lite"
a.encodingExists('foo');
import request from "supertest";
import { app } from "../../src/app";
import jwt from "jsonwebtoken";
import { myCache } from "../../src/config/functions"
import dotenv from "dotenv";
dotenv.config({path:"../../.env"});

let adminToken:any;
let userToken:any;
let userParsedData:any;

beforeAll(async (done)=>{
    const adminData = await request(app)
    .post('/api/v1/auth/login')
    .send({
        id:"admin",
        pw:process.env.MAIL_PW
    })
    expect(adminData.status).toBe(200);
    adminToken = adminData.body.data.token;

    myCache.set("01000000000",{verify:1, updatedAt:Date.now()});
    myCache.set("test@test.ac.kr",{verify:1, updatedAt:Date.now()});

    const userData = await request(app)
    .post('/api/v1/auth/login')
    .send({
        id:"jesttest",
        pw:"jesttest"
    })
    userToken = userData.body.data.token;
    userParsedData = jwt.decode(userToken);
    done();
})

describe('관리자 테스트',()=>{
    it('신분증 목록을 반환한다.',async ()=>{
        const res = await request(app)
        .get('/api/v1/admin/uploads')
        .set('x-access-token', adminToken)
        expect(res.status).toBe(200)
    })

    it('신분증 인증을 승인한다.', async (done)=>{
        const user = await request(app)
        .post('/api/v1/myinfo/upload')
        .set('x-access-token', userToken)
        .send({idCard:"test"})

        const res = await request(app)
        .put(`/api/v1/admin/upload?id=${userParsedData.id}`)
        .set('x-access-token', adminToken)
        .send({result:"1"})
        console.log(res.body)
        expect(res.status).toBe(200)
        done();
    })

    it('신고 리스트를 반환한다.',async () =>{
        const res = await request(app)
        .get('/api/v1/admin/reports')
        .set('x-access-token', adminToken)
        expect(res.status).toBe(200)
    })

    it('문의 리스트를 반환한다.',async () =>{
        const res = await request(app)
        .get('/api/v1/admin/qnas')
        .set('x-access-token', adminToken)
        expect(res.status).toBe(200)
    })
})