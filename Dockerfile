FROM node:12.19.0
WORKDIR /u/app/
COPY . .
RUN npm install -g typescript ts-node
RUN npm install
RUN npm run build
EXPOSE 3000
CMD [ "npm","run","start" ]