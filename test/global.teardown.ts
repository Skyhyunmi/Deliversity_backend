import { db } from "../src/models";

module.exports = async (globalConfig: any) => {
    await db.close();
};