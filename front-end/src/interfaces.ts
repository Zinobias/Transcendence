import { Socket } from "socket.io-client";

export interface Todo {
    id: number;
    todo: string;
}

export interface Chatroom {
    name: string;
    pasword?: string;
}

export interface AppData {
    socket: Socket;
    init: boolean;
    name?: string;
    token?: string;
}

export interface DTO {
    userID : number,
    accessToken : string,
    eventPattern : string,
    payload : {},
}
export interface Chatroom {
    name: string;
    id: number;
    password?: boolean;
}