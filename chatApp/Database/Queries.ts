import {QueryInterface} from "./QueryInterface";
import {Setting} from "../Objects/Setting";
import {Channel} from "../Objects/Channel";
import {User} from "../Objects/User";
import {Message} from "../Objects/Message";


export class Queries implements QueryInterface{
    addBlockedUser(userId: number, blockedUser: number): void {
    }

    addChannelMember(channelId: number, userId: number): void {
    }

    addChannelMessage(channelId: number, message: string, userId: number, timestamp: number) {
    }

    addFriendRequest(fromUserId: number, toUserId: number): void {
    }

    addSetting(setting: Setting): void {
    }

    addUser(loginId: string, userName: string): void {
    }

    createChannel(owner: number, owner2: number, channelName: string): void {
    }

    disableChannel(channelId: number): void {
    }

    getActiveChannels(owner: number): Channel {
        return undefined;
    }

    getBlockedUsers(userId: number): User[] {
        return [];
    }

    getChannelMembers(channelId: number): User[] {
        return [];
    }

    getChannelMessages(channelId: number): Message[] {
        return [];
    }

    getChannels(userId: number): Channel[] {
        return [];
    }

    getFriends(userId: number, accepted: boolean): User[] {
        return [];
    }

    getSettings(channelId: number, userId?: number): Setting[] {
        return [];
    }

    getUser(loginId: string): User {
        return undefined;
    }

    removeBlockedUser(userId: number, blockedUser: number): void {
    }

    removeChannelMember(channelId: number, userId: number): void {
    }

    removeFriend(userId: number, friendId: number): void {
    }

    removeSetting(setting: Setting): void {
    }

    setChannelName(channelId: number, channelName: string): void {
    }

    setFriend(userId: number, friendId: number): void {
    }

    setUserAvatar(userId: number, image: object): void {
    }

}