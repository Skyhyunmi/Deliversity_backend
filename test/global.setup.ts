import request from "supertest";
import { app } from "../src/app";
import { myCache } from "../src/config/functions"

import dotenv from "dotenv";
import { db } from "../src/models";
dotenv.config({ path: "../.env" });

async function signupFunc(email: string, id: string, nickName: string, phone: string) {
    return await request(app)
        .post('/api/v1/auth/signup')
        .send({
            "age": "0", "email": email,
            "id": id, "name": "jesttest",
            "nickName": nickName, "phone": phone, "pw": "jesttest",
            "googleOAuth": process.env.TEST_GOOGLE_TOKEN,
            "kakaoOAuth": process.env.TEST_KAKAO_TOKEN
        })
}

module.exports = async (globalConfig: any) => {
    await db.sync({ force: true });
    await db.query("INSERT INTO Users(userId, password, salt, name, nickName, gender, age, email, phone, addressId, grade, googleOAuth, firebaseUid, firebaseFCM,kakaoOAuth, idCard,lat,lng,createdAt,updatedAt) VALUES(" + process.env.query + ")");
    myCache.set("01000000000", { verify: 1, updatedAt: Date.now() });
    myCache.set("test@test.ac.kr", { verify: 1, updatedAt: Date.now() });
    await signupFunc("test@test.ac.kr", "jesttest", "jesttest", "01000000000");
};