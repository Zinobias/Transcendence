import {Setting} from '../Objects/Setting';
import {Channel} from '../Objects/Channel';
import {User} from '../Objects/User';
import {blocked} from './entities/Blocked';
import {Message} from '../Objects/Message';
import {SettingType} from '../Enums/SettingType';
import {getDataSource, myDataSource} from './DataSource';
import {friends} from './entities/Friends';
import {chat_channels} from './entities/ChatChannels';
import {chat_channel_settings} from './entities/ChatChannelSettings';
import {chat_members} from './entities/ChatMembers';
import {Friend} from '../Objects/Friend';
import {InsertResult} from 'typeorm';
import {user_table} from './entities/UserTable';
import {chat_message} from './entities/ChatMessages';
import {Logger} from '@nestjs/common';

export class Queries {
<<<<<<< HEAD
    private static _instance: Queries;

    public static getInstance(): Queries {
        if (this._instance == undefined) {
            this._instance = new Queries();
        }
        return this._instance;
    }

    private readonly logger = new Logger('Queries');

    private constructor() {
        const start = new Date().getTime();
        this.loadAllChannels().then(() =>
            this.logger.log(`Loaded all channels from database, took: ${new Date().getTime() - start} millis`)
        );
    }

    private async userExists(userId: number, userName: string): Promise<boolean> {
        const AppDataSource = await getDataSource();
        console.log(AppDataSource.options);
        const userTableRepo = AppDataSource.getRepository(user_table);
        try {
            const find = await userTableRepo.findOneBy({
                userId: userId,
                userName: userName,
            });
            return find != null;
        } catch (e) {
            this.logger.warn(`Unable to run userExists check query for [${userId}] see error: ${e}`);
        }
        return false;
    }

    /**
     * Sets a new avatar for a user
     * @param userId user to get the avatar for
     * @param image image to store as the avatar
     */
    async setUserAvatar(userId: number, image: Buffer) {
        const myDataSource = await getDataSource();
        const userRepository = myDataSource.getRepository(user_table);
        await userRepository.update(userId, {avatar: image});
    }

    /**
     * Changes the username for a user
     * @param userId user to change the name for
     * @param newName string to set the new name to
     */
    async setUserName(userId: number, newName: string) {
        const myDataSource = await getDataSource();
        const userRepository = myDataSource.getRepository(user_table);
        await userRepository.update({userId: userId}, {userName: newName});
    }

    /**
     * Get a user from their login id
     * @param userId user id of the user
     */
    async getUser(userId: number): Promise<User> {
        const myDataSource = await getDataSource();
        const userRepository = myDataSource.getRepository(user_table);
        const findUser = await userRepository.findOneBy({userId: userId});
        if (findUser == undefined)
            return undefined;
        return new User(findUser.userId, findUser.userName, findUser.avatar);
    }

    //Blocked users table
    /**
     * Get all blocked users for specified user
     * @param userId user to get blocked users for
     */
    async getBlockedUsers(userId: number): Promise<User[]> {
        const myDataSource = await getDataSource();
        const blockUserRepository = myDataSource.getRepository(blocked);
        const findUser = await blockUserRepository.findBy({userId: userId});
        const blockedUsers: User[] = [];
        for (const [, result] of findUser.entries()) {
            blockedUsers.push(await User.getUser(result.blockId));
        }
        return blockedUsers;
    }

    async alreadyBlocked(userId: number, blockedUser: number): Promise<boolean> {
        const myDataSource = await getDataSource();
        const blocked_user_repository = myDataSource.getRepository(blocked);
        try {
            const find = await blocked_user_repository.findOneBy({
                userId: userId,
                blockId: blockedUser,
            });
            return find != null;
        } catch (e) {
            this.logger.warn(`Unable to run ExistsBlock check query for [${userId}] see error: ${e}`);
        }
        return false;
    }

    /**
     * Store a new blocked user for a user
     * @param userId user to store the blocked user for
     * @param blockedUser blocked user
     */
    async addBlockedUser(userId: number, blockedUser: number): Promise<void> {
        const myDataSource = await getDataSource();
        const blocked_user_repository = myDataSource.getRepository(blocked);
        if (await this.alreadyBlocked(userId, blockedUser)) {
            this.logger.warn(`Attempted to block already blocked user, user: ${userId} blocked: [${blockedUser}]`);
            return;
        }
        try {
            await blocked_user_repository.save(new blocked(userId, blockedUser));
        } catch (e) {
            this.logger.warn(`Unknown error while blocking user: ${userId} blocked: [${blockedUser}]`);
        }
    }

    /**
     * Remove a stored blocked user
     * @param userId user to remove blocked user from
     * @param blockedUser user to remove
     */
    async removeBlockedUser(userId: number, blockedUser: number): Promise<void> {
        const myDataSource = await getDataSource();
        const blockedTable = myDataSource.getRepository(blocked);
        await blockedTable.delete({
            userId: userId,
            blockId: blockedUser,
        });
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
        const repository = myDataSource.getRepository(friends);
        const find_friend = await repository.findBy({
            userId: userId,
            active: accepted,
        });
        const friendList: Friend[] = [];
        for (const [, result] of find_friend.entries()) {
            const user = await User.getUser(result.userId);
            if (user === undefined)
                continue;
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

    async friendExist(fromUserId: number, toUserId: number, confirmed: boolean): Promise<boolean> {
        const myDataSource = await getDataSource();
        const friends_repository = myDataSource.getRepository(friends);
        try {
            const find = await friends_repository.findOneBy({
                userId: fromUserId,
                friendId: toUserId,
                active: confirmed,
            });
            return find != null;
        } catch (e) {
            this.logger.warn(`Unable to run userExists check query for [${fromUserId}] see error: ${e}`);
        }
        return false;
    }

    async addFriend(fromUserId: number, toUserId: number, confirmed: boolean): Promise<void> {
        const myDataSource = await getDataSource();
        const friends_repository = myDataSource.getRepository(friends);
        try {
            await friends_repository.upsert([new friends(fromUserId, toUserId, confirmed)], ['active']);
        } catch (e) {
            this.logger.warn(`Unable to add friend for [${fromUserId}] see error: ${e}`);
        }
    }

    /**
     * Remove a friend from a user
     * @param userId UserTable to remove the friend from
     * @param friendId UserTable to remove from userId's friend list
     */
    async removeFriend(userId: number, friendId: number): Promise<void> {
        const myDataSource = await getDataSource();
        const friends_repository = myDataSource.getRepository(friends);
        try {
            await friends_repository.delete({userId: userId, friendId: friendId});
        } catch (e) {
            this.logger.warn(`Unable to run delete friend query for [${userId}] see error: ${e}`);
        }
    }

    async channelExists(channelId: number): Promise<boolean> {
        const myDataSource = await getDataSource();
        const addChannel = myDataSource.getRepository(chat_channels);
        try {
            const find = await addChannel.findOneBy({
                ownerId: channelId,
            });
            return find != null;
        } catch (e) {
            this.logger.warn(`Unable to run userExists check query for [${channelId}] see error: ${e}`);
        }
        return false;
    }

    //ChatChannels table
    /**
     * Store a new channel in the database
     * @param channel the channel to be created
     * returns the id of the newly created channel
     */
    async createChannel(channel: Channel): Promise<number> {
        const myDataSource = await getDataSource();
        const addChannel = myDataSource.getRepository(chat_channels);
        if (await this.channelExists(channel.channelId)) {
            return -1;
        }
        try {
            const test = await addChannel.save(new chat_channels(channel));
            return test.channelId;
        } catch (e) {
            this.logger.warn(`Unable to run chat_channel query for [${channel.owner}] see error: ${e}`);
        }
        return -1;
    }

    /**
     * Remove a channel
     * @param channel_id channel to remove
     */
    async removeChannel(channel_id: number) {
        const myDataSource = await getDataSource();
        const channel = myDataSource.getRepository(chat_channels);
        try {
            await channel.delete({channelId: channel_id});
        } catch (e) {
            this.logger.warn(`Unable to run chat_channel remove query for [${channel_id}] see error: ${e}`);
        }
    }

    async setPassword(channelId: number, password: string) {
        const myDataSource = await getDataSource();
        const channel = myDataSource.getRepository(chat_channels);
        await channel.update({channelId: channelId}, {password: password});
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
            visible: true,
        });
        const channelList: Channel[] = [];
        for (const [, result] of find_channel.entries()) {
            const resultChannel = Channel.getChannel(result.channelId);
            if (resultChannel === undefined) {
                this.logger.warn(`Unable to retrieve public channel ${result.channelId} while retrieving all public channels.`);
                continue;
            }
            channelList.push(resultChannel);
        }
        return channelList;
    }

    async loadAllChannels() {
        const myDataSource = await getDataSource();
        const channel = myDataSource.getRepository(chat_channels);
        const find_channel = await channel.findBy({
            closed: false,
        });
        for (const [, result] of find_channel.entries()) {
            new Channel(
                result.channelId,
                result.ownerId,
                result.channelName,
                await this.getChannelMembers(result.channelId),
                await this.getChannelMessages(result.channelId),
                await this.getSettings(result.channelId),
                result.closed,
                result.owner2Id == null ? undefined : result.owner2Id,
                result.visible,
                result.password,
            );
        }
    }

    /**
     * Disable a channel
     * @param channelId channel to disable
     */
    async setClosed(channelId: number, closed: boolean): Promise<void> {
        const myDataSource = await getDataSource();
        const disable = myDataSource.getRepository(chat_channels);
        await disable.update(
            {channelId: channelId},
            {closed: closed}
        );
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
            {channelId: channelId},
            {channelName: channelName},
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
    async removeSetting(channelId: number, userId: number, settingType: SettingType) {
        const myDataSource = await getDataSource();
        const setting = myDataSource.getRepository(chat_channel_settings);
        await setting.delete({
            channelId: channelId,
            affectedUser: userId,
            setting: settingType,
        });
    }

    /**
     * Get settings for a channel
     * @param channelId channel to get the settings for
     * @param userId optional user to get the settings for
     */
    async getSettings(channelId: number, userId?: number): Promise<Setting[]> {
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
        const settingList: Setting[] = [];
        for (const [, result] of find_setting.entries()) {
            settingList.push(
                new Setting(
                    result.setting,
                    result.channelId,
                    result.affectedUser,
                    result.actorUser,
                    result.from,
                    result.until,
                ),
            );
        }
        return settingList;
    }

    //ChannelMembers
    async memberExists(channelId: number, userId: number): Promise<boolean> {
        const myDataSource = await getDataSource();
        const channel = myDataSource.getRepository(chat_members);
        try {
            const find = await channel.findOneBy({
                channelId: channelId,
                userId: userId,
            });
            return find != null;
        } catch (e) {
            this.logger.warn(`Unable to run userExists check query for [${channelId}] see error: ${e}`);
        }
        return false;
    }

    /**
     * Add a user to a channel
     * @param channelId channel to add member to
     * @param userId user to add to the channel
     */
    async addChannelMember(channelId: number, userId: number) {
        const myDataSource = await getDataSource();
        const channel = myDataSource.getRepository(chat_members);
        if (await this.memberExists(channelId, userId)) {
            this.logger.warn(`member [${userId}] is already in channel [${channelId}]`);
            return;
        }
        try {
            await channel.save(new chat_members(channelId, userId));
        } catch (e) {
            this.logger.warn(`Unable to run insert chat_members query for [${channelId}] see error: ${e}`);
        }
    }

    /**
     * Remove a user from a channel
     * @param channelId channel to remove member from
     * @param userId user to remove from the channel
     */
    async removeChannelMember(channelId: number, userId: number) {
        const myDataSource = await getDataSource();
        const channel = myDataSource.getRepository(chat_members);
        try {
            await channel.delete({
                channelId: channelId,
                userId: userId,
            });
        } catch (e) {
            this.logger.warn(`Unable to run delete chat_members query for [${channelId}] see error: ${e}`);
        }
    }

    async purgeChannel(channelId: number) {
        const myDataSource = await getDataSource();
        const chatMembers = myDataSource.getRepository(chat_members);
        await chatMembers.delete({channelId: channelId});
    }

    /**
     * Get all users in a channel
     * @param channelId channel to get users for
     */
    async getChannelMembers(channelId: number): Promise<User[]> {
        const myDataSource = await getDataSource();
        const user = myDataSource.getRepository(chat_members);
        const find = await user.findBy({channelId: channelId});
        const userList: User[] = [];
        for (const [, result] of find.entries())
            userList.push(await User.getUser(result.userId));
        return userList;
    }

    /**
     * Get all channels a user is a member of
     * @param userId user to get channels for
     */
    async getChannels(userId: number): Promise<Channel[]> {
        const myDataSource = await getDataSource();
        const user = myDataSource.getRepository(chat_members);
        const find = await user.findBy({userId: userId});
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
        const find = await message.findBy({channelId: channelId});
        const messageList: Message[] = [];
        for (const [, result] of find.entries())
            messageList.push(
                new Message(result.message, result.userId, result.timestamp),
            );
        return messageList;
    }
=======
	private static _instance: Queries;

	public static getInstance(): Queries {
		if (this._instance == undefined) {
			this._instance = new Queries();
		}
		return this._instance;
	}

	private readonly logger = new Logger('Queries');

	private constructor() {
		const start = new Date().getTime();
		this.loadAllChannels().then(() =>
			this.logger.log(`Loaded all channels from database, took: ${new Date().getTime() - start} millis`));
	}

	//Users table
	private async userExists(userId: number, userName: string): Promise<boolean> {
		const AppDataSource = await getDataSource();
		console.log(AppDataSource.options);
		const userTableRepo = AppDataSource.getRepository(user_table);
		try {
			const find = await userTableRepo.findOneBy({
				userId: userId,
				userName: userName,
			});
			return find != null;
		} catch (e) {
			this.logger.warn(`Unable to run userExists check query for [${userId}] see error: ${e}`);
		}
		return false;
	}

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
		if (await this.userExists(loginId, userName)) {
			console.log("user already exist");
			return;
		}
		await userRepository.save(new user_table(loginId, userName, undefined));
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
	async setUserAvatar(userId: number, image: any) {
		const myDataSource = await getDataSource();
		const userRepository = myDataSource.getRepository(user_table);
		this.logger.debug(`setting avatar for user ${userId} to ${image}`);
		await userRepository.update(userId, {avatar: image});
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
		if (findUser == undefined)
			return undefined;
		let newVar;
		if (findUser.avatar == null)
			newVar = undefined;
		else
			newVar = await JSON.parse(findUser.avatar);
		return new User(findUser.userId, findUser.userName, newVar); //TODO add avatar
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

	async alreadyBlocked(userId: number, blockedUser: number): Promise<boolean> {
		const myDataSource = await getDataSource();
		const blocked_user_repository = myDataSource.getRepository(blocked);
		try {
			const find = await blocked_user_repository.findOneBy({
				userId: userId,
				blockId: blockedUser,
			});
			return find != null;
		} catch (e) {
			this.logger.warn(`Unable to run ExistsBlock check query for [${userId}] see error: ${e}`);
		}
		return false;
	}

	/**
	 * Store a new blocked user for a user
	 * @param userId user to store the blocked user for
	 * @param blockedUser blocked user
	 */
	async addBlockedUser(userId: number, blockedUser: number): Promise<void> {
		const myDataSource = await getDataSource();
		const blocked_user_repository = myDataSource.getRepository(blocked);
		if (await this.alreadyBlocked(userId, blockedUser)) {
			this.logger.warn(`Attempted to block already blocked user, user: ${userId} blocked: [${blockedUser}]`);
			return;
		}
		try {
			await blocked_user_repository.save(new blocked(userId, blockedUser));
		} catch (e) {
			this.logger.warn(`Unknown error while blocking user: ${userId} blocked: [${blockedUser}]`);
		}
	}

	/**
	 * Remove a stored blocked user
	 * @param userId user to remove blocked user from
	 * @param blockedUser user to remove
	 */
	async removeBlockedUser(userId: number, blockedUser: number): Promise<void> {
		const myDataSource = await getDataSource();
		const blockedTable = myDataSource.getRepository(blocked);
		await blockedTable.delete({
			userId: userId,
			blockId: blockedUser,
		});
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
		const repository = myDataSource.getRepository(friends);
		const find_friend = await repository.findBy({
			userId: userId,
			active: accepted,
		});
		const friendList: Friend[] = [];
		for (const [, result] of find_friend.entries()) {
			const user = await User.getUser(result.friendId);
			if (user === undefined)
				continue;
			friendList.push(new Friend(user, accepted));
		}
		return friendList;
	}

	async friendExist(fromUserId: number, toUserId: number, confirmed: boolean): Promise<boolean> {
		const myDataSource = await getDataSource();
		const friends_repository = myDataSource.getRepository(friends);
		try {
			const find = await friends_repository.findOneBy({
				userId: fromUserId,
				friendId: toUserId,
				active: confirmed,
			});
			return find != null;
		} catch (e) {
			this.logger.warn(`Unable to run userExists check query for [${fromUserId}] see error: ${e}`);
		}
		return false;
	}
	/**
	 * Stores a friend request
	 * @param fromUserId user that created the request
	 * @param toUserId user that the request should be sent to
	 * @param confirmed boolean indicating if the friend request was accepted
	 */
	async addFriend(fromUserId: number, toUserId: number, confirmed: boolean): Promise<void> {
		const myDataSource = await getDataSource();
		const friends_repository = myDataSource.getRepository(friends);
		try {
			const find = await friends_repository.findOneBy({userId: fromUserId, friendId: toUserId});
			if (find != null) {
				if (find.active == confirmed) {
					return;
				} else {
					await friends_repository.update({userId: fromUserId, friendId: toUserId}, {active: confirmed});
					return;
				}
			}
			await friends_repository.insert(new friends(fromUserId, toUserId, confirmed));
		} catch (e) {
			this.logger.warn(`Unable to add friend for [${fromUserId}] see error: ${e}`);
		}
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
	async channelExists(channelId: number): Promise<boolean> {
		const myDataSource = await getDataSource();
		const addChannel = myDataSource.getRepository(chat_channels);
		try {
			const find = await addChannel.findOneBy({
				ownerId: channelId,
			});
			return find != null;
		} catch (e) {
			this.logger.warn(`Unable to run userExists check query for [${channelId}] see error: ${e}`);
		}
		return false;
	}

	/**
	 * Store a new channel in the database
	 * @param channel the channel to be created
	 * returns the id of the newly created channel
	 */
	async createChannel(channel: Channel): Promise<number> {
		const myDataSource = await getDataSource();
		const addChannel = myDataSource.getRepository(chat_channels);
		if (await this.channelExists(channel.channelId)) {
			return -1;
		}
		try {
			const test = await addChannel.save(new chat_channels(channel));
			return test.channelId;
		} catch (e) {
			this.logger.warn(`Unable to run chat_channel query for [${channel.owner}] see error: ${e}`);
		}
		return -1;
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

	async setPassword(channelId: number, password: string) {
		const myDataSource = await getDataSource();
		const channel = myDataSource.getRepository(chat_channels);
		await channel.update({ channelId: channelId }, {password: password});
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
			visible: true,
		});
		const channelList: Channel[] = [];
		for (const [, result] of find_channel.entries()) {
			let resultChannel = Channel.getChannel(result.channelId);
			if (resultChannel === undefined) {
				Logger.warn(`Unable to retrieve public channel ${result.channelId} while retrieving all public channels.`)
				continue;
			}
			channelList.push(resultChannel);
		}
		return channelList;
	}

	async loadAllChannels() {
		const myDataSource = await getDataSource();
		const channel = myDataSource.getRepository(chat_channels);
		const find_channel = await channel.findBy({
			closed: false
		});
		for (const [, result] of find_channel.entries()) {
			new Channel(result.channelId, result.ownerId, result.channelName,
				await this.getChannelMembers(result.channelId),
				await this.getChannelMessages(result.channelId),
				await this.getSettings(result.channelId),
				result.closed, result.owner2Id == null ? undefined : result.owner2Id,
				result.visible, result.password);
		}
	}

	/**
	 * Disable a channel
	 * @param channelId channel to disable
	 */
	async setClosed(channelId: number, closed: boolean): Promise<void> {
		const myDataSource = await getDataSource();
		const disable = myDataSource.getRepository(chat_channels);
		await disable.update({ channelId: channelId }, { closed: closed });
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

	async setChannelVisibility(channelId: number, visible: boolean) {
		const myDataSource = await getDataSource();
		const setChannel = myDataSource.getRepository(chat_channels);
		await setChannel.update(
			{ channelId: channelId },
			{ visible: visible },
		);
	}

	async setChannelOwner(channelId: number, newOwner: number) {
		const myDataSource = await getDataSource();
		const setChannel = myDataSource.getRepository(chat_channels);
		await setChannel.update(
			{ channelId: channelId },
			{ ownerId: newOwner },
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
	async removeSetting(channelId: number, userId: number, settingType: SettingType) {
		const myDataSource = await getDataSource();
		const setting = myDataSource.getRepository(chat_channel_settings);
		await setting.delete({
			channelId: channelId,
			affectedUser: userId,
			setting: settingType,
		});
	}

	/**
	 * Get settings for a channel
	 * @param channelId channel to get the settings for
	 * @param userId optional user to get the settings for
	 */
	async getSettings(channelId: number, userId?: number): Promise<Setting[]> {
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
		const settingList: Setting[] = [];
		for (const [, result] of find_setting.entries()) {
			settingList.push(new Setting(result.setting, result.channelId, result.affectedUser, result.actorUser,
				result.from, result.until));
		}
		return settingList;
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
		await channel.delete({
			channelId: channelId,
			userId: userId,
		});
	}

	async purgeChannel(channelId: number) {
		const myDataSource = await getDataSource();
		const chatMembers = myDataSource.getRepository(chat_members);
		await chatMembers.delete({channelId: channelId})
	}

	/**
	 * Get all users in a channel
	 * @param channelId channel to get users for
	 */
	async getChannelMembers(channelId: number): Promise<User[]> {
		const myDataSource = await getDataSource();
		const user = myDataSource.getRepository(chat_members);
		const find = await user.findBy({ channelId: channelId });
		const userList: User[] = [];
		for (const [, result] of find.entries())
			userList.push(await User.getUser(result.userId));
		return userList;
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
		// const chats = myDataSource.getRepository(chat_message);
		// await chats.insert(new chat_message(channelId, message));
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
>>>>>>> main
}
