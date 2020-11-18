import a from "mysql2/node_modules/iconv-lite"
a.encodingExists('foo');
import request from "supertest";
import { app } from "../src/app";

describe('app.test',()=>{
    it('상태 코드 200을 반환한다.',(done)=>{
        request(app).get('/chat').then(res=>{
            expect(res.status).toEqual(200)
            done();
        })
    })
    it('상태 코드 404을 반환한다.',(done)=>{
      request(app).get('/not_found').then(res=>{
          expect(res.status).toEqual(404)
          done();
      })
  })
})