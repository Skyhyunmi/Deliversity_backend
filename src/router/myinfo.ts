import { NextFunction, Response, Router } from "express";
import * as util from "../config/util";

import dotenv from "dotenv";
dotenv.config();

export const myinfo = Router();


myinfo.get('/address/list', function (req: any, res: Response, next: NextFunction) {
//자기 주소 리스트 반환
});

myinfo.put('/address/set', function (req: any, res: Response, next: NextFunction) {
//기본 주소 설정
});

myinfo.get('/address', function (req: any, res: Response, next: NextFunction) {
//기본 주소 반환
});

myinfo.post('/address', function (req: any, res: Response, next: NextFunction) {
//주소 추가
});

myinfo.put('/address', function (req: any, res: Response, next: NextFunction) {
//주소 변경
});

myinfo.delete('/address', function (req: any, res: Response, next: NextFunction) {
//주소 삭제
});

myinfo.post('/report', function (req: any, res: Response, next: NextFunction) {
//신고 접수
});

myinfo.post('/qna', function (req: any, res: Response, next: NextFunction) {
//질문 접수
});

myinfo.post('/idUpload', function (req: any, res: Response, next: NextFunction) {
//민증 업로드
});


myinfo.get('/orders', function (req: any, res: Response, next: NextFunction) {
//민증 업로드
});