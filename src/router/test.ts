import {  NextFunction, Request, Response, Router } from "express";
import * as util from "../config/util";
import * as proj4 from "proj4";
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

test.get('/juso',async function (req: any, res: Response, next: NextFunction) {
  //주문 등록
  const reqBody = req.body;
  try {
    const p_x_y = proj4.toPoint([959542.9434374387,1920240.148967761]); //월드컵로 206 grs80 -> wgs84
    const p_lat_lng = proj4.toPoint([127.0436252026175,37.28020872988387]); //월드컵로 206 wgs84 -> grs80
    const result = proj4.transform(wgs84,grs80,p_lat_lng);
    console.log(result);
    return res.json(util.successTrue("",result));
  }catch(err){
    console.error(err);
  }
});