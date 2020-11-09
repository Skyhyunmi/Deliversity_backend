FROM node:12.19.0
WORKDIR /u/app/
COPY . .
RUN npm install --production
EXPOSE 3000
CMD [ "npm","run","start" ]