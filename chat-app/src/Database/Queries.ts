import { Setting } from '../Objects/Setting';
import { Channel } from '../Objects/Channel';
import { User } from '../Objects/User';
import { blocked } from './entities/Blocked';
import { Message } from '../Objects/Message';
import { SettingType } from '../Enums/SettingType';
import { getDataSource, myDataSource } from './DataSource';
import { friends } from './entities/Friends';
import { chat_channels } from './entities/ChatChannels';
import { chat_channel_settings } from './entities/ChatChannelSettings';
import { chat_members } from './entities/ChatMembers';
import { Friend } from '../Objects/Friend';
import { InsertResult } from 'typeorm';
import { user_table } from './entities/UserTable';
import { chat_message } from './entities/ChatMessages';

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
  async addUser(loginId: number, userName: string) {
    console.log('im creating database');
    console.log('user added');
    const AppDataSource = await getDataSource();
    console.log(AppDataSource.options);
    const userRepository = AppDataSource.getRepository(user_table);
    await userRepository.save(new user_table(loginId, userName));
  }

  // async uploadDatabaseFile(dataBuffer: Buffer, filename: string) {
  //   const avatar = myDataSource.getRepository(blob);
  //   const newFile = await avatar.create({
  //     filename,
  //     data: dataBuffer,
  //   });
  //   await avatar.save(newFile);
  //   return newFile;
  // }
  //
  // async getFileById(fileId: number) {
  //   const avatar = myDataSource.getRepository(blob);
  //   const file = await avatar.findOneBy({ avatarId: fileId });
  //   if (!file) {
  //     throw new NotFoundException();
  //   }
  //   return file;
  // }

  /**
   * Sets a new avatar for a user
   * @param userId user to get the avatar for
   * @param image image to store as the avatar
   */
  async setUserAvatar(userId: number, image: Buffer, filename: string) {
    const myDataSource = await getDataSource();
    const userRepository = myDataSource.getRepository(user_table);
    // const avatar = await this.uploadDatabaseFile(image, filename);
    // await userRepository.update(userId, { avatarId: avatar.avatarId });
  }

  /**
   * Changes the username for a user
   * @param userId user to change the name for
   * @param newName string to set the new name to
   */
  async setUserName(userId: number, newName: string) {
    const myDataSource = await getDataSource();
    const userRepository = myDataSource.getRepository(user_table);
    await userRepository.update({ userId: userId }, { userName: newName });
  }

	/**
	 * Get a user from their login id
	 * @param userId user id of the user
	 */
	async getUser(userId: number): Promise<User> {
		const myDataSource = await getDataSource();
		const userRepository = myDataSource.getRepository(user_table);
		const findUser = await userRepository.findOneBy({ userId: userId });
		if (findUser == undefined) return undefined;
		return new User(findUser.userId, findUser.userName, undefined);
	}

  //Blocked users table
  /**
   * Get all blocked users for specified user
   * @param userId user to get blocked users for
   */
  async getBlockedUsers(userId: number): Promise<User[]> {
    const myDataSource = await getDataSource();
    const blockUserRepository = myDataSource.getRepository(blocked);
    const findUser = await blockUserRepository.findBy({ userId: userId });
    const blockedUsers: User[] = [];
    for (const [, result] of findUser.entries()) {
      blockedUsers.push(await User.getUser(result.blockId));
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
    const blocked_user_repository = myDataSource.getRepository(blocked);
    await blocked_user_repository.save(new blocked(userId, blockedUser));
  }

  /**
   * Remove a stored blocked user
   * @param userId user to remove blocked user from
   * @param blockedUser user to remove
   */
  async removeBlockedUser(userId: number, blockedUser: number): Promise<void> {
    const myDataSource = await getDataSource();
    const blocked_user_repository = myDataSource.getRepository(blocked);
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
    const friend = myDataSource.getRepository(friends);
    const find_friend = await friend.findBy({
      userId: userId,
      active: accepted,
    });
    const friendList: Friend[] = [];
    for (const [, result] of find_friend.entries()) {
      const user = await User.getUser(result.userId);
      if (user === undefined) continue;
      friendList.push(<Friend>user);
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
    const friends_repository = myDataSource.getRepository(friends);
    await friends_repository.save(new friends(fromUserId, toUserId, confirmed));
  }

  /**
   * Remove a friend from a user
   * @param userId UserTable to remove the friend from
   * @param friendId UserTable to remove from userId's friend list
   */
  async removeFriend(userId: number, friendId: number): Promise<void> {
    const myDataSource = await getDataSource();
    const friends_repository = myDataSource.getRepository(friends);
    await friends_repository.delete({ userId: userId, friendId: friendId });
  }

  //ChatChannels table
  /**
   * Store a new channel in the database
   * @param channel the channel to be created
   * returns the id of the newly created channel
   */
  async createChannel(channel: Channel): Promise<number> {
    console.log('testing the create channel');
    const myDataSource = await getDataSource();
    const addChannel = myDataSource.getRepository(chat_channels);
    await addChannel.save(new chat_channels(channel));
    const find_channel = await addChannel.findOneBy({ ownerId: channel.owner });
    return find_channel.channelId;
  }

  /**
   * Remove a channel
   * @param channel_id channel to remove
   */
  async removeChannel(channel_id: number) {
    const myDataSource = await getDataSource();
    const channel = myDataSource.getRepository(chat_channels);
    await channel.delete({ channelId: channel_id });
  }

  /**
   * Get active channels for a user
   * @param owner user to get channels for
   */
  async getActiveChannels(owner: number): Promise<Channel[]> {
    const myDataSource = await getDataSource();
    const channel = myDataSource.getRepository(chat_channels);
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

  async getAllPublicChannels(): Promise<Channel[]> {
    const myDataSource = await getDataSource();
    const channel = myDataSource.getRepository(chat_channels);
    const find_channel = await channel.findBy({
      owner2Id: null,
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
    const disable = myDataSource.getRepository(chat_channels);
    await disable.update({ channelId: channelId }, { closed: true });
  }

  /**
   * Set the name of a channel
   * @param channelId channel to update
   * @param channelName new channel name
   */
  async setChannelName(channelId: number, channelName: string) {
    const myDataSource = await getDataSource();
    const setChannel = myDataSource.getRepository(chat_channels);
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
    const set_setting = myDataSource.getRepository(chat_channel_settings);
    await set_setting.save(new chat_channel_settings(setting));
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
    const setting = myDataSource.getRepository(chat_channel_settings);
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
    const setting = myDataSource.getRepository(chat_channel_settings);
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
    const channel = myDataSource.getRepository(chat_members);
    await channel.save(new chat_members(channelId, userId));
  }

  /**
   * Remove a user from a channel
   * @param channelId channel to remove member from
   * @param userId user to remove from the channel
   */
  async removeChannelMember(channelId: number, userId: number) {
    const myDataSource = await getDataSource();
    const channel = myDataSource.getRepository(chat_members);
    const find_channel = await channel.findOneBy({
      channelId: channelId,
      userId: userId,
    });
    await channel.remove(find_channel);
  }

  /**
   * Get all users in a channel
   * @param channelId channel to get users for
   */
  async getChannelMembers(channelId: number): Promise<User[]> {
    const myDataSource = await getDataSource();
    const user = myDataSource.getRepository(chat_members);
    const find = await user.findBy({ channelId: channelId });
    const channelList: User[] = [];
    for (const [, result] of find.entries())
      channelList.push(await User.getUser(result.userId));
    return channelList;
  }

  /**
   * Get all channels a user is a member of
   * @param userId user to get channels for
   */
  async getChannels(userId: number): Promise<Channel[]> {
    const myDataSource = await getDataSource();
    const user = myDataSource.getRepository(chat_members);
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
    const chats = myDataSource.getRepository(chat_message);
    await chats.insert(new chat_message(channelId, message));
    const chat = myDataSource.getRepository(chat_message);
    const insertResult: InsertResult = await chat.insert(
      new chat_message(channelId, message),
    );
    return insertResult.identifiers.length == 1;
  }

  /**
   * Get all messages in a channel
   * @param channelId channel to get messages from
   */
  async getChannelMessages(channelId: number): Promise<Message[]> {
    const myDataSource = await getDataSource();
    const message = myDataSource.getRepository(chat_message);
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
