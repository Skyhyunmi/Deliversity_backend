<h1 align="center">Deliversity_Backend 레포에 오신 것을 환영합니당 👋</h1>
<p>
  <img alt="Version" src="https://img.shields.io/badge/version-1.0.0-blue.svg?cacheSeconds=2592000" />
  <!-- <a href="#" target="_blank">
    <img alt="License: MIT" src="https://img.shields.io/badge/License-MIT-yellow.svg" />
  </a> -->
  <a href="#" target="_blank">
    <img alt="Build Status" src="https://travis-ci.com/Skyhyunmi/Deliversity_backend.svg?token=cJp4ZrbSHxsQMoD64kwe&branch=master" />
  </a>
</p>

### 🏠 [Homepage](https://www.deliversity.co.kr)

## 개요
본 서비스는 대학생들끼리 심부름을 서로 부탁 및 해결을 가능하게 해준다.  
따라서 기존에 수도권에 한정지었던 심부름 서비스를 지역에 상관없이 대학교마다 서비스를 가능하게 해준다.  
또한 배달원과 소비자 모두 양방향 리뷰 작성 및 확인을 통한 선택의 기회를 제공하여 양쪽 모두에게 신뢰성과 안정성 측면을 보장한다.  
마지막으로 혼자 거주하는 1인 가구들의 불안 심리를 해소하고자 소비자에게 배달원의 동성 여부를 선택하는 기회를 제공한다.  

## 환경
- npm >= **7.0.14**
- Node.JS = **12.19.0**
- TypeScript >= **4.0.3** 
- Database:  
**Maria DB: 10.3**

## Before All
.env 파일 생성 후 설정값을 채워 넣어야합니다.
```bash
$ touch .env
```
```txt
# ./.env

DB_NAME=
DB_USER=
DB_PASS=
DB_HOST=
DB_PORT=
WEB_PORT=
JWT_SECRET=
NAVER_KEY=
NAVER_SECRET=
NAVER_SMS_SERVICE_ID=
SEND_FROM=
MAIL_ID=
MAIL_PW=
KAKAO_KEY=
AWS_SECRET=
FB_project_id=
FB_private_key=
FB_client_email=
IMP_KEY=
IMP_SECRET=
query=
TEST_DB_NAME=
TEST_DB_USER=
```


## Install

```sh
$ npm install
```

## Usage
- 배포
```sh
$ npm run start
```

- 개발
```sh
$ npm run dev
```

## Run tests

```sh
$ npm run test
```

## Docker
```sh
$ docker build -t app .
$ docker run --env-file .env -p:[외부 포트]:[내부 포트] app:latest
```

## Author

👤 **[Skyhyunmi](https://github.com/Skyhyunmi)**, **[P513](https://github.com/P513)**


## 🤝 기여
기여나, 이슈, 기능 추가에 대한 요청은..<br />[issues page](https://github.com/Skyhyunmi/Deliversity_backend/issues)에 남겨주세요..

## Show your support

⭐️ 눌러주세요!

***
_This README was generated with ❤️ by [readme-md-generator](https://github.com/kefranabg/readme-md-generator)_