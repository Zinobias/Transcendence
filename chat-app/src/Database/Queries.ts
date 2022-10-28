import { Setting } from '../Objects/Setting';
import { Channel } from '../Objects/Channel';
import { User } from '../Objects/User';
import { UserTable } from './entities/UserTable';
import { Blocked } from './entities/blocked';
import { Message } from '../Objects/Message';
import { SettingType } from '../Enums/SettingType';
import { getDataSource, myDataSource } from './DataSource';
import { Friends } from './entities/friends';
import { ChatChannels } from './entities/chatChannels';
import { ChatChannelSettings } from './entities/chatChannelSettings';
import { ChatMembers } from './entities/chatMembers';
import { Friend } from '../Objects/Friend';
import { chatMessage } from './entities/chatMessages';
import {InsertResult} from "typeorm";

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
   * @param userId user id for the user
   * @param userName name for the user
   */
  async addUser(userId: number, userName: string) {
    const userRepository = myDataSource.getRepository(UserTable);
    await userRepository.save(new UserTable(userId, userName));
    console.log('user added');
  }

  /**
   * Sets a new avatar for a user
   * @param userId user to get the avatar for
   * @param image image to store as the avatar
   */
  async setUserAvatar(userId: number, image: Buffer) {
    const myDataSource = await getDataSource();
    const userRepository = myDataSource.getRepository(UserTable);
    // await userRepository.update({ userId: userId });
  }

  /**
   * Changes the username for a user
   * @param userId user to change the name for
   * @param newName string to set the new name to
   */
  async setUserName(userId: number, newName: string) {
    const myDataSource = await getDataSource();
    const userRepository = myDataSource.getRepository(UserTable);
    await userRepository.update({ userId: userId }, { userName: newName });
  }

  /**
   * Get a user from their login id
   * @param userId user id of the user
   */
  async getUser(userId: number): Promise<User> {
    const myDataSource = await getDataSource();
    const userRepository = myDataSource.getRepository(UserTable);
    const findUser = await userRepository.findOneBy({ userId: userId });
    return User.getUser(findUser.userId);
  }

  //Blocked users table
  /**
   * Get all blocked users for specified user
   * @param userId user to get blocked users for
   */
  async getBlockedUsers(userId: number): Promise<User[]> {
    const myDataSource = await getDataSource();
    const blockUserRepository = myDataSource.getRepository(Blocked);
    const findUser = await blockUserRepository.findBy({ userId: userId });
    const blockedUsers: User[] = [];
    for (const [, result] of findUser.entries()) {
      blockedUsers.push(User.getUser(result.blockId));
    }
    return blockedUsers;
  }

  /**
   * Store a new blocked user for a user
   * @param userId user to store the blocked user for
   * @param blockedUser blocked user
   */
  async addBlockedUser(userId: number, blockedUser: number): Promise<void> {
    const myDataSource = await getDataSource();
    const blocked_user_repository = myDataSource.getRepository(Blocked);
    await blocked_user_repository.save(new Blocked(userId, blockedUser));
  }

  /**
   * Remove a stored blocked user
   * @param userId user to remove blocked user from
   * @param blockedUser user to remove
   */
  async removeBlockedUser(userId: number, blockedUser: number): Promise<void> {
    const myDataSource = await getDataSource();
    const blocked_user_repository = myDataSource.getRepository(Blocked);
    const find_user = await blocked_user_repository.findOneBy({
      userId: userId,
      blockId: blockedUser,
    });
    await blocked_user_repository.remove(find_user);
  }

  //Friends table
  /**
   * Get an array of all friends of a user
   *  Can return a list of active friends, or open requests depending on accepted bool
   * @param userId user to get the friends for
   * @param accepted boolean indicating if it should retrieve friends, or friend requests
   *  (if accepted is true, it returns active friends, if false it returns friend requests)
   */
  async getFriends(userId: number, accepted: boolean): Promise<Friend[]> {
    const myDataSource = await getDataSource();
    const friends = myDataSource.getRepository(Friends);
    const find_friend = await friends.findBy({
      userId: userId,
      active: accepted,
    });
    const friendList: Friend[] = [];
    for (const [, result] of find_friend.entries()) {
      friendList.push(<Friend>Friend.getUser(result.userId));
    }
    return friendList;
  }

  /**
   * Stores a friend request
   * @param fromUserId user that created the request
   * @param toUserId user that the request should be sent to
   * @param confirmed boolean indicating if the friend request was accepted
   */
  async addFriend(
    fromUserId: number,
    toUserId: number,
    confirmed: boolean,
  ): Promise<void> {
    const myDataSource = await getDataSource();
    const friends_repository = myDataSource.getRepository(Friends);
    await friends_repository.save(new Friends(fromUserId, toUserId, confirmed));
  }

  /**
   * Remove a friend from a user
   * @param userId UserTable to remove the friend from
   * @param friendId UserTable to remove from userId's friend list
   */
  async removeFriend(userId: number, friendId: number): Promise<void> {
    const myDataSource = await getDataSource();
    const friends_repository = myDataSource.getRepository(Friends);
    await friends_repository.delete({ userId: userId, friendId: friendId });
  }

  //ChatChannels table
  /**
   * Store a new channel in the database
   * @param channel the channel to be created
   * returns the id of the newly created channel
   */
  async createChannel(channel: Channel): Promise<number> {
    const myDataSource = await getDataSource();
    const addChannel = myDataSource.getRepository(ChatChannels);
    await addChannel.save(new ChatChannels(channel));
    return channel.channelId;
  }

  /**
   * Remove a channel
   * @param channel_id channel to remove
   */
  async removeChannel(channel_id: number) {
    const myDataSource = await getDataSource();
    const channel = myDataSource.getRepository(ChatChannels);
    await channel.delete({ channelId: channel_id });
  }

  /**
   * Get active channels for a user
   * @param owner user to get channels for
   */
  async getActiveChannels(owner: number): Promise<Channel[]> {
    const myDataSource = await getDataSource();
    const channel = myDataSource.getRepository(ChatChannels);
    const find_channel = await channel.findBy({
      ownerId: owner,
      closed: false,
    });
    const channelList: Channel[] = [];
    for (const [, result] of find_channel.entries()) {
      channelList.push(Channel.getChannel(result.channelId));
    }
    return channelList;
  }

  /**
   * Disable a channel
   * @param channelId channel to disable
   */
  async disableChannel(channelId: number): Promise<void> {
    const myDataSource = await getDataSource();
    const disable = myDataSource.getRepository(ChatChannels);
    await disable.update({ channelId: channelId }, { closed: true });
  }

  /**
   * Set the name of a channel
   * @param channelId channel to update
   * @param channelName new channel name
   */
  async setChannelName(channelId: number, channelName: string) {
    const myDataSource = await getDataSource();
    const setChannel = myDataSource.getRepository(ChatChannels);
    await setChannel.update(
      { channelId: channelId },
      { channelName: channelName },
    );
  }

  //ChannelSettings table
  /**
   * Store a setting
   * @param setting setting to store
   */
  async addSetting(setting: Setting) {
    const myDataSource = await getDataSource();
    const set_setting = myDataSource.getRepository(ChatChannelSettings);
    await set_setting.save(new ChatChannelSettings(setting));
  }

  /**
   * Remove a setting
   * @param channelId channel to remove setting from
   * @param userId user to remove setting for
   * @param settingType setting type to remove
   */
  async removeSetting(
    channelId: number,
    userId: number,
    settingType: SettingType,
  ) {
    const myDataSource = await getDataSource();
    const setting = myDataSource.getRepository(ChatChannelSettings);
    const find = setting.findBy({
      channelId: channelId,
      affectedUser: userId,
      setting: settingType,
    });
    await setting.remove(await find);
  }

  /**
   * Get settings for a channel
   * @param channelId channel to get the settings for
   * @param userId optional user to get the settings for
   */
  async getSettings(channelId: number, userId?: number): Promise<Channel[]> {
    const myDataSource = await getDataSource();
    const setting = myDataSource.getRepository(ChatChannelSettings);
    let find_setting;
    if (userId == undefined) {
      find_setting = await setting.findBy({
        channelId: channelId,
      });
    } else {
      find_setting = await setting.findBy({
        channelId: channelId,
        affectedUser: userId,
      });
    }
    const channelList: Channel[] = [];
    for (const [, result] of find_setting.entries())
      channelList.push(Channel.getChannel(result.channelId));
    return channelList;
  }

  //ChannelMembers
  /**
   * Add a user to a channel
   * @param channelId channel to add member to
   * @param userId user to add to the channel
   */
  async addChannelMember(channelId: number, userId: number) {
    const myDataSource = await getDataSource();
    const channel = myDataSource.getRepository(ChatMembers);
    await channel.save(new ChatMembers(channelId, userId));
  }

  /**
   * Remove a user from a channel
   * @param channelId channel to remove member from
   * @param userId user to remove from the channel
   */
  async removeChannelMember(channelId: number, userId: number) {
    const myDataSource = await getDataSource();
    const channel = myDataSource.getRepository(ChatMembers);
    const find_channel = channel.findOneBy({
      channelId: channelId,
      userId: userId,
    });
    await channel.delete(await find_channel);
  }

  /**
   * Get all users in a channel
   * @param channelId channel to get users for
   */
  async getChannelMembers(channelId: number): Promise<User[]> {
    const myDataSource = await getDataSource();
    const user = myDataSource.getRepository(ChatMembers);
    const find = await user.findBy({ channelId: channelId });
    const channelList: User[] = [];
    for (const [, result] of find.entries())
      channelList.push(User.getUser(result.userId));
    return channelList;
  }

  /**
   * Get all channels a user is a member of
   * @param userId user to get channels for
   */
  async getChannels(userId: number): Promise<Channel[]> {
    const myDataSource = await getDataSource();
    const user = myDataSource.getRepository(ChatMembers);
    const find = await user.findBy({ userId: userId });
    const channelList: Channel[] = [];
    for (const [, result] of find.entries())
      channelList.push(Channel.getChannel(result.channelId));
    return channelList;
  }

  //ChannelMessages
  /**
   * Add a new message to a channel
   * @param channelId channel to add message to
   * @param message object containing all information about the message
   */
  async addChannelMessage(channelId: number, message: Message) {
    const myDataSource = await getDataSource();
    const chat = myDataSource.getRepository(chatMessage);
    const insertResult: InsertResult = await chat.insert(
      new chatMessage(channelId, message),
    );
    return insertResult.identifiers.length == 1;
  }

  /**
   * Get all messages in a channel
   * @param channelId channel to get messages from
   */
  async getChannelMessages(channelId: number): Promise<Message[]> {
    const myDataSource = await getDataSource();
    const message = myDataSource.getRepository(chatMessage);
    const find = await message.findBy({ channelId: channelId });
    const messageList: Message[] = [];
    for (const [, result] of find.entries())
      messageList.push(
        new Message(result.message, result.userId, result.timestamp),
      );
    return messageList;
  }

  async storeAuth(id: number, auth: string): Promise<boolean> {
    //TODO store id and auth token in db
    return true;
  }
}
