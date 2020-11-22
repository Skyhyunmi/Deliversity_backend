import request from "supertest";
import { app } from "../src/app";
import { db } from "../src/models";

module.exports = async (globalConfig: any) => {
    const token = await request(app)
        .post('/api/v1/auth/login')
        .send({
            id: "jesttest",
            pw: "jesttest"
        })
    const userToken = token.body.data.token;
    await request(app)
        .delete('/api/v1/auth/release')
        .set('x-access-token', userToken)
    await db.close();
};