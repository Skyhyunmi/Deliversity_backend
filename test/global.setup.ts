import request from "supertest";
import { app } from "../src/app";
import { myCache } from "../src/config/functions"

import dotenv from "dotenv";
import { db } from "../src/models";
import { auth } from "firebase-admin";
dotenv.config({ path: "../.env" });

async function deleteUser(email: string) {
    try {
        await auth().getUserByEmail(email)
            .then(async user => await auth().deleteUser(user.uid))
    }
    catch (e) { return; }
}

async function signupFunc(email: string, id: string, nickName: string, phone: string) {
    return await request(app)
        .post('/api/v1/auth/signup')
        .send({
            "age": "0", "email": email,
            "id": id, "name": "jesttest",
            "nickName": nickName, "phone": phone, "pw": "jesttest"
        })
}

module.exports = async (globalConfig: any) => {
    await deleteUser("test@test.ac.kr");
    await deleteUser("test1@test.ac.kr");
    await deleteUser("user@user.ac.kr");
    await deleteUser("rider@rider.ac.kr");
    await db.drop();
    await db.sync();
    await db.query(process.env.query as string)
    myCache.set("01000000000", { verify: 1, updatedAt: Date.now() });
    myCache.set("test@test.ac.kr", { verify: 1, updatedAt: Date.now() });
    await signupFunc("test@test.ac.kr", "jesttest", "jesttest", "01000000000");
    myCache.set("01011111111", { verify: 1, updatedAt: Date.now() });
    myCache.set("user@user.ac.kr", { verify: 1, updatedAt: Date.now() });
    await signupFunc("user@user.ac.kr", "user", "user", "01011111111");
    myCache.set("01022222222", { verify: 1, updatedAt: Date.now() });
    myCache.set("rider@rider.ac.kr", { verify: 1, updatedAt: Date.now() });
    await signupFunc("rider@rider.ac.kr", "rider", "rider", "01022222222");
};