import { Sequelize } from 'sequelize-typescript';
import dotenv from 'dotenv';
import User from './user';
import Address from './address';
import Order from './order';
import Payment from './payment';
import Point from './point';
import Refund from './refund';
import PointCategory from './pointCategory';
import QnA from './qna';
import Report from './report';
import Review from './review';
import Chat from './chat';
import Room from './room';


import { config } from '../config/sequelize.config';

dotenv.config();
// console.log(process.env.TRAVIS)
export const db:Sequelize = process.env.NODE_ENV === 'test'
  ? new Sequelize(config.test) : new Sequelize(config.development);
// if(process.env.NODE_ENV == 'test') db = new Sequelize(config.test);
// else db = new Sequelize(config.development);

db.addModels([User]);
db.addModels([Address]);
db.addModels([Order]);
db.addModels([Payment]);
db.addModels([Refund]);
db.addModels([Point]);
db.addModels([PointCategory]);
db.addModels([QnA]);
db.addModels([Report]);
db.addModels([Review]);
db.addModels([Chat]);
db.addModels([Room]);
// https://stackoverflow.com/questions/60014874/how-to-use-typescript-with-sequelize

export const userRep = db.getRepository(User);
export const addressRep = db.getRepository(Address);
export const orderRep = db.getRepository(Order);
export const paymentRep = db.getRepository(Payment);
export const refundRep = db.getRepository(Refund);
export const pointRep = db.getRepository(Point);
export const pointcategoryRep = db.getRepository(PointCategory);
export const qnaRep = db.getRepository(QnA);
export const reportRep = db.getRepository(Report);
export const reviewRep = db.getRepository(Review);
export const chatRep = db.getRepository(Chat);
export const roomRep = db.getRepository(Room);