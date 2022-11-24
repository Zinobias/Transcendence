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

export interface IUser {
    userId: number;
    name: string;
    avatar: object;
    blocked: IUser[];
    friends: IFriend[];
}

export interface IFriend {
    IUser: IUser;
    confirmed: boolean;
}

export interface IMessage {
    message: string;
    sender: number;
    timestamp: number;
}

export interface IChannel {
    channelId: number;
    owner: number;
    otherOwner: number;
    channelName: string;
    users: IUser[];
    messages: IMessage[];
    settings: ISetting[];
    closed: boolean;
    visible: boolean;
    password: string;
}

export enum SettingType {
    MUTED,
    BANNED,
    ADMIN,
} 
export interface ISetting {
    setting: SettingType;
    channelId: number;
    userId: number;
    from: number;
    until: number;
    actorId: number;
}