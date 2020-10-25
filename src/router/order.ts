import { NextFunction, Response, Router } from "express";
import * as util from "../config/util";

import dotenv from "dotenv";
dotenv.config();

export const order = Router();

order.post('/', function (req: any, res: Response, next: NextFunction) {
//주문 등록
});

order.get('/', function (req: any, res: Response, next: NextFunction) {
//주문 확인
});
    
order.get('/riders', function (req: any, res: Response, next: NextFunction) {
//신청 배달원 목록 반환
});

order.post('/rider', function (req: any, res: Response, next: NextFunction) {
//배달원 선택
});

order.get('/chat', function (req: any, res: Response, next: NextFunction) {
//주문에 대한 채팅을 위한 주소 반환
//필요없을 수도... 주문 등록 할때 반환해도 될 수도..
});

order.get('/price', function (req: any, res: Response, next: NextFunction) {
//최종 결제 금액 반환
});

order.post('/price', function (req: any, res: Response, next: NextFunction) {
//배달원이 최종 결제 금액 전송
});    

order.post('/review/user', function (req: any, res: Response, next: NextFunction) {
//유저에 대한 리뷰 작성
});

order.get('/review/user', function (req: any, res: Response, next: NextFunction) {
//유저에 대한 리뷰 확인
});

order.post('/review/rider', function (req: any, res: Response, next: NextFunction) {
//라이더에 대한 리뷰 작성
});

order.get('/review/rider', function (req: any, res: Response, next: NextFunction) {
//라이더에 대한 리뷰 확인
});

order.get('/orders', function (req: any, res: Response, next: NextFunction) {
//배달원이 찾을 배달거리 리스트 반환
});