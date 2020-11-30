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
let adminToken: any;
let userParsedData: any;
let riderParsedData: any;
let addressId: any;

// before
// 사용자는 회원가입을 한다. - ★
// 사용자는 로그인을 한다. - ★
// 배달원은 회원가입을 한다. - ★
// 배달원은 로그인을 한다. - ★
// 배달원은 회원인증을 진행한다. - ★
// 배달원은 정회원 등급이 된다. - ★
// 사용자는 기본 주소를 설정한다. - ★
beforeAll(async (done) => {
  const userData = await request(app)
    .post('/api/v1/auth/login')
    .send({
      id: "usertest",
      pw: "jesttest"
    })
  expect(userData.status).toBe(200);
  userToken = userData.body.data.token;
  userParsedData = jwt.decode(userToken);
  const addressData = await request(app)
    .post('/api/v1/myinfo/address')
    .set('x-access-token', userToken)
    .send({
      address: "서울 강남구 도산대로55길 26",
      detailAddress: "3층",
      setDefault: "1"
    })
  expect(addressData.body.data.address).toBe("서울 강남구 도산대로55길 26");
  addressId = addressData.body.data.id;

  const riderData = await request(app)
    .post('/api/v1/auth/login')
    .send({
      id: "ridertest",
      pw: "jesttest"
    });
  expect(userData.status).toBe(200);
  riderToken = riderData.body.data.token;
  riderParsedData = jwt.decode(riderToken);
  const adminData = await request(app)
    .post('/api/v1/auth/login')
    .send({
      id: "admin",
      pw: process.env.MAIL_PW
    });
  expect(adminData.status).toBe(200);
  adminToken = adminData.body.data.token;

  const user = await request(app)
    .post('/api/v1/myinfo/upload')
    .set('x-access-token', userToken)
    .send({ idCard: "test" })

  const rider = await request(app)
    .post('/api/v1/myinfo/upload')
    .set('x-access-token', riderToken)
    .send({ idCard: "test" })

  const userres = await request(app)
    .put(`/api/v1/admin/upload?id=${userParsedData.id}`)
    .set('x-access-token', adminToken)
    .send({ result: "1" });

  const riderres = await request(app)
    .put(`/api/v1/admin/upload?id=${riderParsedData.id}`)
    .set('x-access-token', adminToken)
    .send({ result: "1" });
  done();
});

// ㄱ) 주문을 하지 않은 경우
// 예외)사용자는 신청 배달원 목록을 반환한다.
// 예외)사용자는 배달원을 선택한다.
// 주문을 등록한다.
// 예외) 동성 배달 이용 불가 확인
// 사용자는 주문을 확인한다.
// 예외) 주문을 하지 않은 경우
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

describe('주문 관련 테스트', () => {
  // 사용자는 주문을 등록한다.
  describe('주문 접수 테스트', () => {
    // 1. 동성 배달 X, 예약 X
    it('동성 배달X 예약X 주문 등록', async done => {
      const Order1 = await request(app)
        .post('/api/v1/order')
        .set('x-access-token', userToken)
        .send({
          storeName: "A네 디저트가게",
          storeAddress: "경기 가평군 가평읍 가화로 142-21",
          storeDetailAddress: "A동 A호",
          gender: "0",
          hotDeal: "0",
          reservation: "0",
          categoryName: "카페",
          content: "마카롱 11개 주세요."
        });
      expect(Order1.body.data.storeName).toBe("A네 디저트가게");
      expect(Order1.body.data.gender).toBe(0);
      expect(Order1.body.data.reservation).toBe("0");
      done();
    });
    // 2. 동성 배달 O, 예약 X
    it('동성 배달O 예약X 주문 등록.', async done => {
      const Order2 = await request(app)
        .post('/api/v1/order')
        .set('x-access-token', userToken)
        .send({
          storeName: "B네 디저트가게",
          storeAddress: "경기 수원시 영통구 월드컵로 164",
          storeDetailAddress: "B동 B호",
          gender: "1",
          hotDeal: "0",
          reservation: "0",
          categoryName: "카페",
          content: "마카롱 22개 주세요."
        });
      expect(Order2.body.data.storeName).toBe("B네 디저트가게");
      expect(Order2.body.data.reservation).toBe("0");
      done();
    });
    // 3. 동성 배달 O, 예약 O
    it('동성 배달O 예약O 주문 등록.', async done => {
      const Order3 = await request(app)
        .post('/api/v1/order')
        .set('x-access-token', userToken)
        .send({
          storeName: "C네 편의점",
          storeAddress: "경기 용인시 처인구 금학로341번길 8",
          storeDetailAddress: "C동 C호",
          gender: "1",
          hotDeal: "0",
          reservation: "1",
          expHour: "1",
          expMinute: "30",
          categoryName: "편의점",
          content: "콜라 3개 사주세요."
        });
      expect(Order3.body.data.storeName).toBe("C네 편의점");
      expect(Order3.body.data.reservation).toBe("1");
      done();
    });
  });
  // 4. 동성 배달 X, 예약 O
  it('동성 배달X 예약O 주문 등록.', async done => {
    const Order4 = await request(app)
      .post('/api/v1/order')
      .set('x-access-token', userToken)
      .send({
        storeName: "D네 편의점",
        storeAddress: "경기 용인시 처인구 포곡읍 두계로 10-6",
        storeDetailAddress: "D동 D호",
        gender: "0",
        hotDeal: "0",
        reservation: "1",
        expHour: "1",
        expMinute: "10",
        categoryName: "편의점",
        content: "콜라 4개 사주세요."
      });
    expect(Order4.body.data.storeName).toBe("D네 편의점");
    expect(Order4.body.data.gender).toBe(0);
    expect(Order4.body.data.reservation).toBe("1");
    done();
  });
});