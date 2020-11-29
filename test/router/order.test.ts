import a from "mysql2/node_modules/iconv-lite";
a.encodingExists('foo');
import request from "supertest";
import { app } from "../../src/app";
import jwt from "jsonwebtoken";
import { myCache } from "../../src/config/functions";
import dotenv from "dotenv";
dotenv.config({ path: "../../.env" });

let riderToken: any;
let userToken: any;
let userParsedData: any;
let riderParsedData: any;

beforeAll(async (done) => {
  const userData = await request(app)
    .post('/api/v1/auth/login')
    .send({
      id: "user",
      pw: "user"
    });
  expect(userData.status).toBe(200);
  userToken = userData.body.data.token;
  userParsedData = jwt.decode(userToken);
  done();
  const riderData = await request(app)
    .post('/api/v1/auth/login')
    .send({
      id: "user",
      pw: "user"
    });
  expect(userData.status).toBe(200);
  riderToken = riderData.body.data.token;
  riderParsedData = jwt.decode(riderToken);
  done();
});
// /*
// before
// 사용자는 회원가입을 한다. - ★
// 사용자는 로그인을 한다.
// 배달원은 회원가입을 한다. - ★
// 배달원은 로그인을 한다.
// 배달원은 회원인증을 진행한다.
// 배달원은 정회원 등급이 된다.

// [ 스토리 A ]
// 사용자는 기본 주소를 설정한다.

// ㄱ) 주문을 하지 않은 경우
// 예외)사용자는 신청 배달원 목록을 반환한다.
// 예외)사용자는 배달원을 선택한다.

// 주문을 등록한다.
// 예외) 동성 배달 이용 불가 확인

// [ 스토리 B ]
// 사용자는 회원인증을 진행한다.
// 사용자는 정회원 등급이 된다.
// 사용자는 기본 주소를 설정한다.
// 사용자는 주문을 확인한다.
// 예외) 주문을 하지 않은 경우
// 사용자는 주문을 등록한다.
// a) 예약인 경우 : 시간 분 등록 했는지
// 예외) 시간 분 등록이 안된 경우
// b) 예약이 아닌 경우
// 사용자는 주문을 확인한다.
// ㄴ) 주문을 한 경우
// 사용자는 신청 배달원 목록을 반환한다.
// ㄴ) 주문을 한 경우
// 예외) 희망하는 배달원이 없는 경우
// 배달원은 배달원이 찾을 배달거리를 확인한다.
// 배달원은 소비자에 대한 리뷰를 확인한다.
// 배달원은 해당 주문에 배달을 신청한다.
// 예외) 주문 건이 없는 경우
// 예외) 배달원 모집이 끝난 경우
// 예외) 본인의 주문인 경우
// 예외)
// b) 희망하는 배달원이 있는 경우
// 사용자는 배달원에 대한 리뷰를 확인한다.
// 사용자는 배달원을 선택한다.
// 예외) 해당하는 배달원이 존재하지 않는 경우
// 사용자는 배달원과 채팅 주소를 받는다.
// 사용자는 최종 결제 금액을 반환한다.
// 예외) 배달 과정이 아닌경우
// 예외) 물건 값 입력을 안한 경우
// 배달원은 최종 결제 금액을 전송한다.
// 예외) 이미 결제 금액을 등록한 경우
// 사용자는 결제한다.
// 예외) 잔액이 부족한 경우
// 배달원은 배달 완료로 변경한다.
// 사용자는 배달원에 대한 리뷰를 작성한다.
// 배달원은 소비자에 대한 리뷰를 작성한다.
// 예외) 이미 리뷰를 단 경우 (한 번 더 시도)

// 소비자 주문 내역 받아오기
// 배달원 배달 내역 받아오기

// // describe('주문관련 테스트', () => {
// //     describe('소비자 시나리오 테스트', () => {
// //         it('주문을 접수한다.', async done => {
// //             const Order = await request(app)
// //                 .post('/api/v1/order/')
// //                 .set('x-access-token', userToken)
// //                 .send({
// //                     storeName: "수빈이네 디저트가게",
// //                     storeAddress: "서울 강남구 도산대로55길 26",
// //                     storeDetailAddress: "A동 302호",
// //                     gender: "0",
// //                     hotDeal: "0",
// //                     reservation: "0",
// //                     categoryName: "카페",
// //                     content: "마카롱 56개 주세요."
// //                 });
// //             console.log(Order.body);
// //             expect(Order.body.data.storeName).toBe("수빈이네 디저트가게");
// //             expect(Order.body.data.storeAddress).toBe("서울 강남구 도산대로55길 26");
// //             expect(Order.body.data.storeDetailAddress).toBe("A동 302호");
// //             expect(Order.body.data.gender).toBe("0");
// //             expect(Order.body.data.hotDeal).toBe("0");
// //             expect(Order.body.data.reservation).toBe("0");
// //             expect(Order.body.data.categoryName).toBe("카페");
// //             expect(Order.body.data.content).toBe("마카롱 56개 주세요.");
// //         });
// //     });
// // });