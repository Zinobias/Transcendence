import {Setting} from "../Objects/Setting";
import {Channel} from "../Objects/Channel";
import {User} from "../Objects/User";
import {Message} from "../Objects/Message";
import {SettingType} from "../Enums/SettingType";


export class Queries {

    private static _instance: Queries;

    public static getInstance(): Queries {
        if (this._instance == undefined) {
            this._instance = new Queries();
        }
        return this._instance;
    }

    //Users table
    /**
     * Creates a new user entry
     * @param loginId login id for the user
     * @param userName name for the user
     */
    addUser(loginId: string, userName: string): void {

    }

    /**
     * Sets a new avatar for a user
     * @param userId user to get the avatar for
     * @param image image to store as the avatar
     */
    setUserAvatar(userId: number, image: object): void {

    }

    /**
     * Get a user from their login id
     * @param loginId login id of the user
     */
    getUser(loginId: string): User {
        return undefined
    }

    //Blocked users table
    /**
     * Get all blocked users for specified user
     * @param userId user to get blocked users for
     */
    getBlockedUsers(userId: number): User[] {
        return [];
    }

    /**
     * Store a new blocked user for a user
     * @param userId user to store the blocked user for
     * @param blockedUser blocked user
     */
    addBlockedUser(userId: number, blockedUser: number): void {

    }

    /**
     * Remove a stored blocked user
     * @param userId user to remove blocked user from
     * @param blockedUser user to remove
     */
    removeBlockedUser(userId: number, blockedUser: number): void {

    }

    //Friends table
    /**
     * Get an array of all friends of a user
     *  Can return a list of active friends, or open requests depending on accepted bool
     * @param userId user to get the friends for
     * @param accepted boolean indicating if it should retrieve friends, or friend requests
     *  (if accepted is true, it returns active friends, if false it returns friend requests)
     */
    getFriends(userId: number, accepted: boolean): User[] {
        return [];
    }

    /**
     * Makes friendId a friend of userId
     * @param userId user to set as a friend
     * @param friendId user who gets the friend added
     */
    setFriend(userId: number, friendId: number): void {

    }

    /**
     * Stores a friend request
     * @param fromUserId user that created the request
     * @param toUserId user that the request should be sent to
     */
    addFriendRequest(fromUserId: number, toUserId: number): void {

    }

    /**
     * Remove a friend from a user
     * @param userId User to remove the friend from
     * @param friendId User to remove from userId's friend list
     */
    removeFriend(userId: number, friendId: number): void {

    }

    //ChatChannels table
    /**
     * Store a new channel in the database
     * @param channel the channel to be created
     * returns the id of the newly created channel
     */
    createChannel(channel: Channel): number {
        return -1;
    }

    /**
     * Remove a channel
     * @param channel_id channel to remove
     */
    removeChannel(channel_id: number) {

    }

    /**
     * Get active channels for a user
     * @param owner user to get channels for
     */
    getActiveChannels(owner: number): Channel {
        return undefined
    }

    /**
     * Disable a channel
     * @param channelId channel to disable
     */
    disableChannel(channelId: number): void {

    }

    /**
     * Set the name of a channel
     * @param channelId channel to update
     * @param channelName new channel name
     */
    setChannelName(channelId: number, channelName: string): void {

    }

    //ChannelSettings table
    /**
     * Store a setting
     * @param setting setting to store
     */
    addSetting(setting: Setting): void {

    }

    /**
     * Remove a setting
     * @param channelId channel to remove setting from
     * @param userId user to remove setting for
     * @param settingType setting type to remove
     */
    removeSetting(channelId: number, userId: number, settingType: SettingType): void {

    }

    /**
     * Get settings for a channel
     * @param channelId channel to get the settings for
     * @param userId optional user to get the settings for
     */
    getSettings(channelId: number, userId?: number): Setting[] {
        return []
    }

    //ChannelMembers
    /**
     * Add a user to a channel
     * @param channelId channel to add member to
     * @param userId user to add to the channel
     */
    addChannelMember(channelId: number, userId: number): void {

    }

    /**
     * Remove a user from a channel
     * @param channelId channel to remove member from
     * @param userId user to remove from the channel
     */
    removeChannelMember(channelId: number, userId: number): void {

    }

    /**
     * Get all users in a channel
     * @param channelId channel to get users for
     */
    getChannelMembers(channelId: number): User[] {
        return []
    }

    /**
     * Get all channels a user is a member of
     * @param userId user to get channels for
     */
    getChannels(userId: number): Channel[] {
        return []
    }

    //ChannelMessages
    /**
     * Add a new message to a channel
     * @param channelId channel to add message to
     * @param message object containing all information about the message
     */
    addChannelMessage(channelId: number, message: Message) {

    }

    /**
     * Get all messages in a channel
     * @param channelId channel to get messages from
     */
    getChannelMessages(channelId: number): Message[] {
        return [];
    }
}