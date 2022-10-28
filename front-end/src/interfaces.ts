import { Socket } from "socket.io-client";

export interface Todo {
    id: number;
    todo: string;
}

export interface Chatroom {
    name: string;
    pasword?: string;
}

export interface User {
    init: boolean;
    name?: string;
    token?: string;
}

export interface AppData {
    socket: Socket;
    init: boolean;
    name?: string;
    token?: string;
}