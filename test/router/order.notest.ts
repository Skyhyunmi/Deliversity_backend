import a from "mysql2/node_modules/iconv-lite"
a.encodingExists('foo');
import request from "supertest";
import * as crypto from "crypto";
import { app } from "../../src/app";
import jwt from "jsonwebtoken";
import { myCache } from "../../src/config/functions"
import dotenv from "dotenv";
dotenv.config({ path: "../../.env" });

