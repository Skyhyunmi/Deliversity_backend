import {  NextFunction, Request, Response, Router } from "express";
import * as util from "../config/util";
import * as proj4 from "proj4";
import axios from "axios";

import dotenv from "dotenv";
dotenv.config();

export const test = Router();

test.get("/hello", (req: Request, res: Response) => {
  res.json({ string: "hello pm2! nice to meet you!" });
});
const epsg_5181=proj4.Proj("+proj=tmerc +lat_0=38 +lon_0=127 +k=1 +x_0=200000 \
                            +y_0=500000 +ellps=GRS80 +units=m +no_defs");
const grs80 = proj4.Proj("+proj=tmerc +lat_0=38 +lon_0=127.5 +k=0.9996 \
                          +x_0=1000000 +y_0=2000000 +ellps=GRS80 +units=m +no_defs"); //도로명주소 제공 좌표 5179
const wgs84 = proj4.Proj("EPSG:4326"); //경위도

test.post('/juso',async function (req: any, res: Response, next: NextFunction) {
  //주문 등록
  const reqBody = req.body;
  try {
    const coord = await axios({
      url:`https://dapi.kakao.com/v2/local/search/address.json?query=${encodeURIComponent(reqBody.address)}`,
      method:'get',
      headers:{Authorization: `KakaoAK ${process.env.KAKAO_KEY}`}
    }) as any;
    return res.json(util.successTrue("",coord.data.documents[0]));
  }catch(err){
    console.error(err);
  }
});