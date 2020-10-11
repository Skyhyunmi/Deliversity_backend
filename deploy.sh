#!/bin/bash

REPOSITORY=/home/ubuntu/app/step2
PROJECT_NAME=pm2

npm prune

npm i

echo "> Build 파일 복사"

cp $REPOSITORY/zip/* $REPOSITORY/

echo "> 현재 구동중인 애플리케이션 pid 확인"

CURRENT_PID=$(pgrep -fl $PROJECT_NAME | awk '{print $1}')

echo "현재 구동 중인 애플리케이션 pid: $CURRENT_PID"

if [ -z "$CURRENT_PID" ]; then
   echo "> 현재 구동 중인 애플리케이션이 없으므로 종료하지 않습니다."
else
   echo "> kill -15 $CURRENT_PID"
   kill -15 $CURRENT_PID
   sleep 5
   npm run start
fi

echo "> 새 어플리케이션 배포"