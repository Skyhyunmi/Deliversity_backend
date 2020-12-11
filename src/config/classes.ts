/* eslint max-classes-per-file: 0 */
import User from '../models/user';

class ChatUserData {
  text?:string;

  user!:{
    _id: number;
    roomId: string;
    photo:string;
  };
}

export class userData {
  userId!: number;

  userNickName!: string;

  roomId!: string;

  chat?: string;

  photo?: string;

  createdAt!: number;

  constructor(data:ChatUserData, userNickName:string) {
    this.userId = data.user._id;  
    this.userNickName = userNickName;
    this.chat = data.text;
    this.roomId = data.user.roomId;
    this.photo = data.user.photo;
    this.createdAt = Date.now();
  }
}

export class payLoad {
  id!: number;

  userId!: string;

  name!: string;

  nickName!: string;

  grade!: number;

  loggedAt!: string;

  constructor(user:User) {
    this.id = user.id;
    this.userId = user.userId;
    this.name = user.nickName;
    this.nickName = user.nickName;
    this.grade = user.grade;
    this.loggedAt = new Date().toString();
  }
}

export class Rider {
  riderId!: number;

  extraFee!: number;
};

export class Veri {
  email?:string;

  number?:string;

  createdAt!:number;

  updatedAt?:number;

  verify?:number;
}

export class MyInfo {
  id!: number;

  userId!: string;

  name!: string;

  nickName!: string;

  gender!: number;

  age!: string;

  email!: string;

  phone!: string;

  addressId!: string;

  grade!: number;

  constructor(user:User) {
    this.id = user.id;
    this.userId = user.userId;
    this.name = user.name;
    this.nickName = user.nickName;
    this.gender = user.gender;
    this.age = user.age;
    this.email = user.email;
    this.phone = user.phone;
    this.addressId = user.addressId;
    this.grade = user.grade;
  }
}