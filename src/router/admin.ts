import { NextFunction, Response, Router } from "express";
import * as util from "../config/util";

import dotenv from "dotenv";
dotenv.config();

export const admin = Router();

admin.get('/uploads', function (req: any, res: Response, next: NextFunction) {
//민증 확인 리스트 반환
});

admin.get('/upload', function (req: any, res: Response, next: NextFunction) {
//상세내용 반환
});

admin.put('/upload', function (req: any, res: Response, next: NextFunction) {
//민증인증 처리
});


admin.get('/reports', function (req: any, res: Response, next: NextFunction) {
//신고 리스트 반환
});

admin.get('/report', function (req: any, res: Response, next: NextFunction) {
//신고 상세내용보기
});

admin.put('/report', function (req: any, res: Response, next: NextFunction) {
//신고 답변 작성
});


admin.get('/qnas', function (req: any, res: Response, next: NextFunction) {
//문의 리스트 반환
});
    
admin.get('/qna', function (req: any, res: Response, next: NextFunction) {
//문의 상세내용보기
});

admin.put('/qna', function (req: any, res: Response, next: NextFunction) {
//문의 답변 작성
});
