import { Socket } from "socket.io-client";

export interface Todo {
    id: number;
    todo: string;
}

export interface DTO {
    userID : number,
    accessToken : string,
    eventPattern : string,
    payload : {},
}

export interface IUser {
    userId: number;
    name: string;
    avatar: any;
    blocked: SmallUser[];
    friends: SmallUser[];
}

export interface SmallUser {
    userId: number;
    name: string;
    state: boolean;
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
    password: boolean;
}

export interface IChannelInfo {
    channelId: number;
    channelName: string;
    visible: boolean;
    hasPassword: boolean;
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