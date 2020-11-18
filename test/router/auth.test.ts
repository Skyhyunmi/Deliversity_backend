import a from "mysql2/node_modules/iconv-lite"
a.encodingExists('foo');
import request from "supertest";
import * as crypto from "crypto";
import { app } from "../../src/app";
import jwt from "jsonwebtoken";
import { myCache } from "../../src/config/functions"
import dotenv from "dotenv";
dotenv.config({path:"../../.env"});

async function signupFunc(email:string, id:string, nickName:string, phone:string){
    return await request(app)
    .post('/api/v1/auth/signup')
    .send({"age": "0", "email": email,
        "gender": "male", "id": id, "name": "jesttest",
        "nickName": nickName, "phone": phone, "pw": "jesttest"})
}    

let userToken:any;
let userParsedData:any;

describe('회원가입 테스트', ()=>{
    it('파이어베이스 계정 중복으로 회원가입을 실패한다.',async (done)=>{
        myCache.set("01000000000",{verify:1, updatedAt:Date.now()});
        myCache.set("test@test.ac.kr",{verify:1, updatedAt:Date.now()});
        const signup = await signupFunc("test@test.ac.kr","jesttest", "jesttest", "01000000000");
        expect(signup.status).toBe(403);
        done();
    })

    it('중복 이메일로 회원가입을 실패한다..',async (done)=>{
        myCache.set("01000000001",{verify:1, updatedAt:Date.now()});
        myCache.set("test@test.ac.kr",{verify:1, updatedAt:Date.now()});
        const signup = await signupFunc("test@test.ac.kr","jesttest1", "jesttest1", "01000000001");
        expect(signup.status).toBe(403);
        done();
    })

    it('중복 아이디로 회원가입을 실패한다..',async (done)=>{
        myCache.set("01000000001",{verify:1, updatedAt:Date.now()});
        myCache.set("test1@test.ac.kr",{verify:1, updatedAt:Date.now()});
        const signup = await signupFunc("test1@test.ac.kr","jesttest", "jesttest1", "01000000001");
        expect(signup.status).toBe(403);
        done();
    })

    it('중복 닉네임으로 회원가입을 실패한다..',async (done)=>{
        myCache.set("01000000001",{verify:1, updatedAt:Date.now()});
        myCache.set("test1@test.ac.kr",{verify:1, updatedAt:Date.now()});
        const signup = await signupFunc("test1@test.ac.kr","jesttest1", "jesttest", "01000000001");
        expect(signup.status).toBe(403);
        done();
    })

    it('중복 전화번호로 회원가입을 실패한다..',async (done)=>{
        myCache.set("01000000000",{verify:1, updatedAt:Date.now()});
        myCache.set("test1@test.ac.kr",{verify:1, updatedAt:Date.now()});
        const signup = await signupFunc("test1@test.ac.kr","jesttest1", "jesttest1", "01000000000");
        expect(signup.status).toBe(403);
        done();
    })
});

describe('로그인 테스트', ()=>{
    it('로그인을 성공한다.',async (done)=>{
        const userData = await request(app)
        .post('/api/v1/auth/login')
        .send({
            id:"jesttest",
            pw:"jesttest"
        })
        expect(userData.status).toBe(200);
        userToken = userData.body.data.token;
        userParsedData = jwt.decode(userToken);
        done();
    });
    
    it('토큰 갱신을 성공한다.',async (done)=>{
        const userData = await request(app)
        .get('/api/v1/auth/refresh')
        .set('x-access-token', userToken)
        expect(userData.status).toBe(200);
        userToken = userData.body.data.token;
        userParsedData = jwt.decode(userToken);
        done();
    });
});

describe('인증 테스트', ()=>{
    it('문자 인증번호 검증을 한다.',async (done)=>{
        const randomNumber = Math.floor(Math.random() * (999999 - 100000)) + 100000;
        const phone="01000000000";
        myCache.del(phone);
        myCache.set(phone,{number:randomNumber, createdAt:Date.now()});
        const result = await request(app)
        .post('/api/v1/auth/sms/verification')
        .send({
            verify:randomNumber,
            phone:phone
        })
        expect(result.status).toBe(200);
        myCache.del(phone);
        done();
    })

    it.only('이메일 인증번호 검증을 한다.',async (done)=>{
        const email_number = crypto.randomBytes(256).toString('hex').substr(100, 50);
        const email="test@test.ac.kr";
        myCache.del(email);
        myCache.set(email_number,{email:email, createdAt:Date.now()});
        const result = await request(app)
        .get('/api/v1/auth/email/verification?email_number='+email_number)
        expect(result.status).toBe(200);
        myCache.del(email);
        done();
    })
})