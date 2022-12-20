import {Controller, Inject, Logger} from '@nestjs/common';
import {ClientProxy, EventPattern} from '@nestjs/microservices';
import {Channel} from '../Objects/Channel';
import {AppService} from '../app.service';
import {Util} from './Util';
import {
    AcceptGameRequest,
    GetOtherUserData,
    GetSelfUserData,
    InviteGameUser,
    UserBlockUser,
    UserEditAvatar,
    UserFriendUser,
    UserUnblockUser
} from '../DTOs/UserDTOs';
import {User} from '../Objects/User';
import {Queries} from '../Database/Queries';
import {Friend} from "../Objects/Friend";

@Controller()
export class RetrieveUserDataEventPatterns {
    private logger = new Logger('RetrieveUserDataEventPatterns');

    constructor(private readonly appService: AppService,
                @Inject('gateway') private readonly gateway: ClientProxy,
                @Inject(Util) private readonly util: Util) {
    }

    @EventPattern('get_channels_user')
    getChannelsUser(data: GetSelfUserData) {
        const channels = Channel.getUserChannels(data.user_id);
        this.util.notify([data.user_id], 'get_channels_user', {
            success: true,
            msg: undefined,
            channels: channels?.map(channel => {
                return {
                    channelId: channel.channelId,
                    channelName: channel.channelName,
                    otherOwnderId: channel.otherOwner === undefined ? -1 : (data.user_id == channel.owner ? channel.otherOwner : channel.owner),
                    visible: channel.visible,
                    hasPassword: (channel.password != undefined && channel.password.length == 64)
                }
            })
        });
    }

    @EventPattern('get_chatrooms_user')
    getChatroomsUser(data: GetSelfUserData) {
        const channels = Channel.getUserChannels(data.user_id);
        this.util.notify([data.user_id], 'get_chatrooms_user', {
            success: true,
            msg: undefined,
            channels: channels
            ?.filter((channel) => channel.otherOwner == undefined)
            .map(channel => {
                return {
                    channelId: channel.channelId,
                    channelName: channel.channelName,
                    visible: channel.visible,
                    hasPassword: (channel.password != undefined && channel.password.length == 64)
                }
            })
        });
    }

    @EventPattern('get_user')
    async getUser(data: GetOtherUserData) {
        const user = await User.getUser(data.requested_user_id);
        if (user == undefined) {
            this.util.notify([data.user_id], 'get_user', {
                success: false,
                msg: 'This user does not exist',
                message: undefined
            });
            return
        }
        const usertest = user.getIUser();
        // this.logger.warn("user " + user.friends[0].user.userId);
        // this.logger.warn("iuser " + usertest.friends[0].userId);
        // this.logger.debug(`chat_app user ${user.userId} ${user.name}`);
        this.util.notify([data.user_id], 'get_user', {
            success: true,
            msg: undefined,
            user: user.getIUser(),
        });
    }

    @EventPattern('get_name')
    async getName(data: GetOtherUserData) {
        const user = await User.getUser(data.requested_user_id);
        if (user == undefined) {
            this.util.notify([data.user_id], 'get_name', {
                success: false,
                msg: 'This user does not exist',
                message: undefined
            });
            return
        }
        // this.logger.debug(`chat_app user ${user.userId} ${user.name}`);
        this.util.notify([data.user_id], 'get_name', {
            success: true,
            msg: undefined,
            requested_name: user.name,
            requested_id: user.userId,
        });
    }

    //TODO move this data to user class?
    @EventPattern('get_friend_requests')
    async getFriendsRequestUser(data: GetSelfUserData) {
        const friendRequests = await Queries.getInstance().getFriends(
            data.user_id,
            false,
        );
        this.util.notify([data.user_id], 'get_friend_requests', {
            success: true,
            msg: undefined,
            friendRequests: friendRequests.map(friend => {
                return friend.getIFriend()
            }),
        });
    }

    @EventPattern('get_friends')
    async getFriendsUser(data: GetSelfUserData) {
        const friendRequests = await Queries.getInstance().getFriends(
            data.user_id,
            true,
        );
        this.util.notify([data.user_id], 'get_friends', {
            success: true,
            msg: undefined,
            friendRequests: friendRequests.map(friend => {
                return friend.getIFriend()
            }),
        });
    }

    @EventPattern('friend_request')
    async friendRequestUser(data: UserFriendUser) {
        if (data.user_id == data.friend_id) {
            this.util.emitFailedObject(data.user_id, 'friend_request', `You can't friend yourself`);
            return;
        }
        const user: User = await this.util.getUser(data.user_id, 'friend_request');
        if (user == undefined) {
            this.util.emitFailedObject(data.user_id, 'friend_request', 'Unable to retrieve user');
            return;
        }
        const friend: User = await this.util.getUser(data.friend_id, 'friend_request');
        if (friend == undefined) {
            this.util.emitFailedObject(data.user_id, 'friend_request', 'Unable to retrieve friend');
            return;
        }
        if (user.hasBlocked(friend)) {
            this.util.emitFailedObject(data.user_id, 'friend_request', 'You have this user blocked');
            return;
        }
        if (friend.hasBlocked(user)) {
            this.util.emitFailedObject(data.user_id, 'friend_request', 'This user has you blocked');
            return;
        }
        if (user.isFriends(friend)) {
            this.util.emitFailedObject(data.user_id, 'friend_request', `You're already friends with this user`);
            return;
        }
        if (user.hasRequest(friend) || friend.hasRequest(user)) {
            this.util.emitFailedObject(data.user_id, 'friend_request', `There is already an active friend request for this user`);
            return;
        }
        await Queries.getInstance().addFriend(data.friend_id, data.user_id, false);
        friend.friend(new Friend(user, false));
        this.util.notify([data.user_id, data.friend_id], 'friend_request', {
            success: true,
            msg: undefined,
            user: user.userId,
            friend: friend.userId
        });
    }

    @EventPattern('decline_friend_request')
    async declineFriendRequestUser(data: UserFriendUser) {
        if (data.user_id == data.friend_id) {
            this.util.emitFailedObject(data.user_id, 'decline_friend_request', `You can't not friend yourself`);
            return;
        }
        const user: User = await this.util.getUser(data.user_id, 'decline_friend_request');
        if (user == undefined) {
            this.util.emitFailedObject(data.user_id, 'decline_friend_request', 'Unable to retrieve user');
            return;
        }
        const friend: User = await this.util.getUser(data.friend_id, 'decline_friend_request');
        if (friend == undefined) {
            this.util.emitFailedObject(data.user_id, 'decline_friend_request', `Unable to retrieve user who's request you're denying`);
            return;
        }
        if (user.isFriends(friend)) {
            this.util.emitFailedObject(data.user_id, 'decline_friend_request', `You're already friends with this user`);
            return;
        }
        if (!user.hasRequest(friend)) {
            this.util.emitFailedObject(data.user_id, 'decline_friend_request', `There is no active friend request for this user`);
            return;
        }
        await Queries.getInstance().removeFriend(data.user_id, data.friend_id);
        user.unfriend(friend);
        this.util.notify([data.user_id, data.friend_id], 'decline_friend_request', {
            success: true,
            msg: undefined,
            user: user.userId,
            friend: friend.userId
        });
    }

    @EventPattern('accept_friend_request')
    async acceptFriendRequestUser(data: UserFriendUser) {
        if (data.user_id == data.friend_id) {
            this.util.emitFailedObject(data.user_id, 'accept_friend_request', `You can't accept yourself`);
            return;
        }
        const user: User = await this.util.getUser(data.user_id, 'accept_friend_request');
        if (user == undefined) {
            this.util.emitFailedObject(data.user_id, 'accept_friend_request', 'Unable to retrieve user');
            return;
        }
        const friend: User = await this.util.getUser(data.friend_id, 'accept_friend_request');
        if (friend == undefined) {
            this.util.emitFailedObject(data.user_id, 'accept_friend_request', 'Unable to retrieve friend');
            return;
        }
        if (user.hasBlocked(friend)) {
            this.util.emitFailedObject(data.user_id, 'accept_friend_request', 'You have this user blocked');
            return;
        }
        if (friend.hasBlocked(user)) {
            this.util.emitFailedObject(data.user_id, 'accept_friend_request', 'This user has you blocked');
            return;
        }
        if (user.isFriends(friend)) {
            this.util.emitFailedObject(data.user_id, 'accept_friend_request', `You're already friends with this user`);
            return;
        }
        if (!user.hasRequest(friend)) {
            this.util.emitFailedObject(data.user_id, 'accept_friend_request', `There is no active friend request from this user`);
            return;
        }
        await Queries.getInstance().addFriend(data.user_id, data.friend_id, true);
        await Queries.getInstance().addFriend(data.friend_id, data.user_id, true);
        user.unfriend(friend); //TODO check if this is needed?
        user.friend(new Friend(friend, true))
        friend.unfriend(user); //TODO check if this is needed?
        friend.friend(new Friend(user, true))
        this.util.notify([data.user_id, data.friend_id], 'accept_friend_request', {
            success: true,
            msg: undefined,
            user: user.userId,
            friend: friend.userId
        });
    }

    @EventPattern('un_friend')
    async unFriendUser(data: UserFriendUser) {
        if (data.user_id == data.friend_id) {
            this.util.emitFailedObject(data.user_id, 'un_friend', `You can't unfriend yourself`);
            return;
        }
        const user: User = await this.util.getUser(data.user_id, 'un_friend');
        if (user == undefined) {
            this.util.emitFailedObject(data.user_id, 'un_friend', 'Unable to retrieve user');
            return;
        }
        const friend: User = await this.util.getUser(data.friend_id, 'un_friend');
        if (friend == undefined) {
            this.util.emitFailedObject(data.user_id, 'un_friend', 'Unable to retrieve friend');
            return;
        }
        if (!user.isFriends(friend) && !user.hasRequest(friend)) {
            this.util.emitFailedObject(data.user_id, 'un_friend', `You aren't friends with this user and you don't have any open requests with them`);
            return;
        }
        await Queries.getInstance().removeFriend(data.user_id, data.friend_id);
        await Queries.getInstance().removeFriend(data.friend_id, data.user_id);
        user.unfriend(friend);
        friend.unfriend(user);
        this.util.notify([data.user_id, data.friend_id], 'un_friend', {
            success: true,
            msg: undefined,
            user: user.userId,
            friend: friend.userId
        });
    }

    @EventPattern('block_user')
    async blockUser(data: UserBlockUser) {
        if (data.user_id == data.blocked_id) {
            this.util.emitFailedObject(data.user_id, 'block_user', `You can't block yourself`);
            return;
        }
        const user: User = await this.util.getUser(data.user_id, 'block_user');
        if (user == undefined) {
            this.util.emitFailedObject(data.user_id, 'block_user', 'Unable to retrieve user');
            return;
        }
        const toBlock: User = await this.util.getUser(data.blocked_id, 'block_user');
        if (toBlock == undefined) {
            this.util.emitFailedObject(data.user_id, 'block_user', 'Unable to retrieve user to block');
            return;
        }
        if (user.hasBlocked(toBlock)) {
            this.util.emitFailedObject(data.user_id, 'block_user', `You already blocked this user`);
            return;
        }
        if (user.hasRequest(toBlock)) {
            await Queries.getInstance().removeFriend(toBlock.userId, user.userId)
            toBlock.unfriend(user);
        }
        if (toBlock.hasRequest(user)) {
            await Queries.getInstance().removeFriend(user.userId, toBlock.userId)
            user.unfriend(toBlock);
        }
        if (user.isFriends(toBlock)) {
            await Queries.getInstance().removeFriend(user.userId, toBlock.userId);
            await Queries.getInstance().removeFriend(toBlock.userId, user.userId);
            user.unfriend(toBlock);
            toBlock.unfriend(user);
        }
        await Queries.getInstance().addBlockedUser(
            data.user_id,
            data.blocked_id
        );
        user.block(toBlock)
        this.util.notify([data.user_id], 'block_user', {
            success: true,
            msg: undefined
        });
    }

    @EventPattern('unblock_user')
    async unblockUser(data: UserUnblockUser) {
        if (data.user_id == data.blocked_id) {
            this.util.emitFailedObject(data.user_id, 'unblock_user', `You can't unblock yourself`);
            return;
        }
        const user: User = await this.util.getUser(data.user_id, 'unblock_user');
        if (user == undefined) {
            this.util.emitFailedObject(data.user_id, 'unblock_user', 'Unable to retrieve user');
            return;
        }
        const unBlock: User = await this.util.getUser(data.blocked_id, 'unblock_user');
        if (unBlock == undefined) {
            this.util.emitFailedObject(data.user_id, 'unblock_user', 'Unable to retrieve user to block');
            return;
        }
        if (!user.hasBlocked(unBlock)) {
            this.util.emitFailedObject(data.user_id, 'unblock_user', `You don't have this user blocked`);
            return;
        }
        await Queries.getInstance().removeBlockedUser(
            data.user_id,
            data.blocked_id
        );
        user.unblock(unBlock)
        this.util.notify([data.user_id], 'unblock_user', {
            success: true,
            msg: undefined
        });
    }

    @EventPattern('update_avatar')
    async updateAvatar(data: UserEditAvatar) {
        if (data.new_avatar == undefined) {
            this.util.emitFailedObject(data.user_id, 'update_avatar', 'Incorrect data object');
            return;
        }

        const user: User = await this.util.getUser(data.user_id, 'update_avatar');
        if (user == undefined) {
            this.util.emitFailedObject(data.user_id, 'update_avatar', `This user doesn't exist`);
            return;
        }

        // this.logger.debug(`File string: ${data.new_avatar}`);
        // const json: string = JSON.stringify(data.new_avatar);
        // this.logger.debug(`File info, stringify: ${json}`)
        user.avatar = data.new_avatar;
        await Queries.getInstance().setUserAvatar(user.userId, JSON.stringify(data.new_avatar));
        this.util.notify([data.user_id], 'update_avatar', {
            success: true,
            msg: undefined
        });
        //TODO add checks for if the file is valid??
    }

    private inviteMap: Map<number, GameUser> = new Map();

    @EventPattern('invite_game_user')
    async gameRequest(data: InviteGameUser) {
        const user: User = await this.util.getUser(data.user_id, 'invite_game_user');
        if (user == undefined) {
            this.util.emitFailedObject(data.user_id, 'invite_game_user', 'Unable to retrieve user');
            return;
        }
        const invitedUser: User = await this.util.getUser(data.request_user_id, 'invite_game_user');
        if (invitedUser == undefined) {
            this.util.emitFailedObject(data.user_id, 'invite_game_user', 'Unable to retrieve invited user');
            return;
        }
        if (user.hasBlocked(invitedUser)) {
            this.util.emitFailedObject(data.user_id, 'invite_game_user', 'You have this user blocked');
            return;
        }
        if (invitedUser.hasBlocked(user)) {
            this.util.emitFailedObject(data.user_id, 'invite_game_user', 'This user has you blocked');
            return;
        }
        const obj: GameUser = {
            user_id: invitedUser.userId,
            game_mode: data.game_mode
        }

        const invitee = this.inviteMap.get(data.user_id);
		if (invitee != undefined) {
			this.util.notify([invitee.user_id], 'remove_game_invite', {
				success: true,
				msg: `Invitation expired`,
				inviter_id: data.user_id,
			});
		}

        this.inviteMap.set(user.userId, obj)
        this.util.notify([data.user_id, data.request_user_id], 'invite_game_user', {
            success: true,
            msg: undefined,
            user: user.userId,
            request_user_id: invitedUser.userId,
            from_user_name: user.name,
            game_mode: data.game_mode
        });
    }

    @EventPattern('accept_invite_game_user')
    async acceptGameRequest(data: AcceptGameRequest) {
        const user: User = await this.util.getUser(data.user_id, 'accept_invite_game_user');
        if (user == undefined) {
            this.util.emitFailedObject(data.user_id, 'accept_invite_game_user', 'Unable to retrieve user');
            return;
        }
        const invitingUser: User = await this.util.getUser(data.request_user_id, 'accept_invite_game_user');
        if (invitingUser == undefined) {
            this.util.emitFailedObject(data.user_id, 'accept_invite_game_user', 'Unable to retrieve invited user');
            return;
        }
        const gameUser = this.inviteMap.get(invitingUser.userId);
        if (gameUser == undefined || gameUser.user_id != user.userId) {
            this.util.emitFailedObject(data.user_id, 'accept_invite_game_user', `There is no active request for you from this user`);
            return;
        }
        this.util.notify([data.user_id, data.request_user_id], 'accept_invite_game_user', {
            success: true,
            msg: undefined,
            user: user.userId,
            request_user_id: invitingUser.userId,
            game_mode: gameUser.game_mode
        });
        const obj: GameRequest = {
            player1UID: data.request_user_id,
            player2UID: data.user_id,
            gameMode: gameUser.game_mode
        };
        this.inviteMap.delete(data.request_user_id);
        this.gateway.emit('chat_to_game', obj);
    }

	@EventPattern('decline_invite_game_user')
    async declineGameRequest(data: AcceptGameRequest) {
        const user: User = await this.util.getUser(data.user_id, 'decline_invite_game_user');

        if (user == undefined) {
            this.util.emitFailedObject(data.user_id, 'decline_invite_game_user', 'Unable to retrieve user');
            return;
        }
        const invitingUser: User = await this.util.getUser(data.request_user_id, 'decline_invite_game_user');
        if (invitingUser == undefined) {
            this.util.emitFailedObject(data.user_id, 'decline_invite_game_user', 'Unable to retrieve invited user');
            return;
        }
        const invitee = this.inviteMap.get(invitingUser.userId);
        if (invitee != undefined && invitee.user_id == user.userId)
			this.inviteMap.delete(data.request_user_id);

        this.util.notify([data.user_id, data.request_user_id], 'decline_invite_game_user', {
            success: true,
            msg: `invitation has been declined successfully`,
            user: user.userId,
            request_user_id: invitingUser.userId,
        });
    }
}



interface GameRequest {
	player1UID	: number;
	player2UID	: number;
	gameMode	: string;
}

interface GameUser {
    user_id: number;
    game_mode: string;
}
