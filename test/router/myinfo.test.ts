import a from "mysql2/node_modules/iconv-lite"
a.encodingExists('foo');
import request from "supertest";
import * as crypto from "crypto";
import { app } from "../../src/app";
import jwt from "jsonwebtoken";
import { myCache } from "../../src/config/functions"
import dotenv from "dotenv";
dotenv.config({path:"../../.env"});

let userToken:any;
let userParsedData:any;
let addressId:any;
beforeAll(async done=>{
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
})

describe('회원정보 테스트', ()=>{
    describe('개인정보 테스트', ()=>{
        it('본인 정보를 반환받는다.',async done=>{
            const userData = await request(app)
            .get('/api/v1/myinfo')
            .set('x-access-token', userToken)
            expect(userData.body.data.id).toBe(userParsedData.id)
            done();
        })

        it('본인 정보를 수정한다.',async done=>{
            const userData = await request(app)
            .put('/api/v1/myinfo')
            .set('x-access-token', userToken)
            .send({
                pw:"jesttest1",
                nickName:"jesttest1"
            })
            expect(userData.body.data.nickName).toBe("jesttest1")
            const userData2 = await request(app)
            .put('/api/v1/myinfo')
            .set('x-access-token', userToken)
            .send({
                pw:"jesttest",
                nickName:"jesttest"
            })
            expect(userData2.body.data.nickName).toBe("jesttest")
            done();
        })
    });
    describe('주소 테스트', ()=>{
        it('주소를 설정한다.',async done=>{
            const newAddress = await request(app)
            .post('/api/v1/myinfo/address')
            .set('x-access-token', userToken)
            .send({
                address:"서울 강남구 도산대로55길 26",
                detailAddress:"3층",
                setDefault:"1"
            })
            expect(newAddress.body.data.address).toBe("서울 강남구 도산대로55길 26")

            const addressData = await request(app)
            .post('/api/v1/myinfo/address')
            .set('x-access-token', userToken)
            .send({
                address:"경기 용인시 기흥구 구갈동 352-1",
                detailAddress:"7층",
                setDefault:"1"
            })
            expect(addressData.body.data.address).toBe("경기 용인시 기흥구 구갈동 352-1")
            addressId = addressData.body.data.id;
            done();
        })

        it('주소록를 반환한다.',async done=>{
            const addressData = await request(app)
            .get('/api/v1/myinfo/address/list')
            .set('x-access-token', userToken)
            expect(addressData.body.data.length).toEqual(2)
            done();
        })

        it('현재 기본 주소를 반환한다.',async done=>{
            const addressData = await request(app)
            .get('/api/v1/myinfo/address')
            .set('x-access-token', userToken)
            expect(addressData.body.data.address).toBe("경기 용인시 기흥구 구갈동 352-1")
            done();
        })

        it('지정된 주소의 값을 변경한다.',async done=>{
            const addressData = await request(app)
            .put('/api/v1/myinfo/address')
            .set('x-access-token', userToken)
            .send({
                addressId:addressId,
                detailAddress:"8층"
            })
            expect(addressData.body.data.detailAddress).toBe("8층")
            done();
        })

        it('기본주소를 다른 주소록에 있는 주소로 변경한다.',async done=>{
            const addressData = await request(app)
            .put('/api/v1/myinfo/address/set')
            .set('x-access-token', userToken)
            .send({
                addressId:addressId-1
            })
            expect(addressData.body.data.address).toBe("서울 강남구 도산대로55길 26")
            done();
        })

        it('주소를 삭제한다.',async done=>{
            const addressData = await request(app)
            .delete('/api/v1/myinfo/address')
            .set('x-access-token', userToken)
            .send({
                addressId:addressId-1
            })
            expect(addressData.body.message).toBe("주소 삭제 성공")
            done();
        })
    });
})