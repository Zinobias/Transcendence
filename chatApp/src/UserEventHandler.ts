import {Controller, Logger} from '@nestjs/common';
import {AppService} from './app.service';
import {EventPattern} from "@nestjs/microservices";
import {
    UserAcceptFriendUser,
    UserBlockUser,
    UserCreate,
    UserEditAvatar,
    UserEditName,
    UserFriendUser, UserRemoveFriend,
    UserUnblockUser
} from "./Events/UserEvents";
import {User} from "./Objects/User";
import {Queries} from "./Database/Queries";
import {Friend} from "./Objects/Friend";

@Controller()
export class ChannelEventHandler {
    constructor(private readonly appService: AppService) {
    }

    @EventPattern('user_create')
    userCreate(data: UserCreate) {

    }

    @EventPattern('user_edit_name')
    userEditName(data: UserEditName) {
        let user: User = ChannelEventHandler.getUser(data.user_id, "user_edit_name")
        if (user == null)
            return;
        if (!data.new_name.match("[a-zA-Z0-9]{3,16}")) {
            Logger.warn("Invalid username [" + data.new_name + "] for [" + user.userId + "] at user_edit_name")
            return;
        }

        user.name = data.new_name;
        Queries.getInstance().setUserName(user.userId, data.new_name);
    }

    @EventPattern('user_edit_avatar')
    userEditAvatar(data: UserEditAvatar) {
        let user: User = ChannelEventHandler.getUser(data.user_id, "user_edit_avatar")
        if (user == null)
            return;
        Logger.warn("NOT IMPLEMENTED YET user_edit_avatar")
        // user.avatar = data.new_avatar //TODO Decide avatar format
    }

    @EventPattern('user_block_user')
    userBlockUser(data: UserBlockUser) {
        let user: User = ChannelEventHandler.getUser(data.user_id, "user_block_user")
        if (user == null)
            return;
        let blockedUser: User = ChannelEventHandler.getUser(data.blocked_id, "user_block_user")
        if (blockedUser == null)
            return;

        if (user.hasBlocked(blockedUser)) {
            Logger.warn("User [" + user.userId + "] has already blocked user [" + blockedUser.userId + "]")
            return;
        }

        user.block(blockedUser)
        Queries.getInstance().addBlockedUser(user.userId, blockedUser.userId)
    }

    @EventPattern('user_unblock_user')
    userUnblockUser(data: UserUnblockUser) {
        let user: User = ChannelEventHandler.getUser(data.user_id, "user_unblock_user")
        if (user == null)
            return;
        let blockedUser: User = ChannelEventHandler.getUser(data.blocked_id, "user_unblock_user")
        if (blockedUser == null)
            return;

        if (!user.hasBlocked(blockedUser)) {
            Logger.warn("User [" + user.userId + "] hasn't blocked user [" + blockedUser.userId + "]")
            return;
        }

        user.unblock(blockedUser)
        Queries.getInstance().removeBlockedUser(user.userId, blockedUser.userId)
    }

    @EventPattern('user_friend_user') //TODO finish implementing friends so they can be requests
    userFriendUser(data: UserFriendUser) {
        let user: User = ChannelEventHandler.getUser(data.user_id, "user_friend_user")
        if (user == null)
            return;
        let friendUser: User = ChannelEventHandler.getUser(data.friend_id, "user_friend_user")
        if (friendUser == null)
            return;

        let friend = new Friend(friendUser, false);
        if (user.isFriends(friend)) { //TODO check req
            Logger.warn("User [" + user.userId + "] is already friends with [" + friend.userId + "]")
            return;
        }

        user.friend(friend)
        Queries.getInstance().addFriendRequest(user.userId, friendUser.userId, false)
    }

    @EventPattern('user_accept_friend_user') //TODO finish implementing friends so they can be requests
    userAcceptFriendUser(data: UserAcceptFriendUser) {
        let user: User = ChannelEventHandler.getUser(data.user_id, "user_accept_friend_user")
        if (user == null)
            return;
    }

    @EventPattern('user_remove_friend') //TODO finish implementing friends so they can be requests
    userRemoveFriend(data: UserRemoveFriend) {
        let user: User = ChannelEventHandler.getUser(data.user_id, "user_remove_friend")
        if (user == null)
            return;
    }

    //EZ ERRORS:

    private static getUser(userId: number, source: string): User {
        let user: User = User.getUser(userId);
        if (user == null) {
            Logger.warn("Received invalid user id [" + userId + "] from " + source)
            return undefined;
        }
        return user;
    }
}