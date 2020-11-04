declare namespace Express {
    export interface Request {
        decoded: any;
    }
}

declare namespace SocketIO {
    export interface Socket {
        user:any;
    }
}