import User from "../models/user";

export class userData {
    userId!: number;
    userNickName!: string;
    roomId!: string;
    chat?: string;
    photo?: string;
    createdAt!: number;
  
    constructor(data:any, userNickName:string){
      this.userId=data.user._id;  
      this.userNickName=userNickName;
      this.chat=data.text;
      this.roomId=data.user.roomId;
      this.photo = data.user.photo;
      this.createdAt=Date.now();
    }
}

export class payLoad {
id!: number;
    userId!: string;
    name!: string;
    nickName!: string;
    grade!: number;
    loggedAt!: string;

    constructor(user:User){
      this.id = user.id;
      this.userId = user.userId;
      this.name = user.nickName;
      this.nickName = user.nickName;
      this.grade = user.grade;
      this.loggedAt= new Date().toString();
    }
}

export class Rider {
    riderId!: number;
    extraFee!: number;
};