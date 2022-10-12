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
export class UserEventHandler {
    constructor(private readonly appService: AppService) {
    }

    @EventPattern('user_create')
    userCreate(data: UserCreate) {

    }

    @EventPattern('user_edit_name')
    userEditName(data: UserEditName) {
        let user: User = UserEventHandler.getUser(data.user_id, "user_edit_name")
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
        let user: User = UserEventHandler.getUser(data.user_id, "user_edit_avatar")
        if (user == null)
            return;
        Logger.warn("NOT IMPLEMENTED YET user_edit_avatar")
        // return of("success").pipe();
        // user.avatar = data.new_avatar //TODO Decide avatar format
    }

    @EventPattern('user_block_user')
    userBlockUser(data: UserBlockUser) {
        let user: User = UserEventHandler.getUser(data.user_id, "user_block_user")
        if (user == null)
            return;
        let blockedUser: User = UserEventHandler.getUser(data.blocked_id, "user_block_user")
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
        let user: User = UserEventHandler.getUser(data.user_id, "user_unblock_user")
        if (user == null)
            return;
        let blockedUser: User = UserEventHandler.getUser(data.blocked_id, "user_unblock_user")
        if (blockedUser == null)
            return;

        if (!user.hasBlocked(blockedUser)) {
            Logger.warn("User [" + user.userId + "] hasn't blocked user [" + blockedUser.userId + "]")
            return;
        }

        user.unblock(blockedUser)
        Queries.getInstance().removeBlockedUser(user.userId, blockedUser.userId)
    }

    @EventPattern('user_friend_user')
    userFriendUser(data: UserFriendUser) {
        let user: User = UserEventHandler.getUser(data.user_id, "user_friend_user")
        if (user == null)
            return;
        let friendUser: User = UserEventHandler.getUser(data.friend_id, "user_friend_user")
        if (friendUser == null)
            return;

        let friend = new Friend(friendUser, false);
        if (user.hasRequest(friend)) {
            Logger.warn("User [" + user.userId + "] is already friends with [" + friend.userId + "]")
            return;
        }
        if (user.isFriends(friend)) {
            Logger.warn("User [" + user.userId + "] is already friends with [" + friend.userId + "]")
            return;
        }

        user.friend(friend)
        Queries.getInstance().addFriend(user.userId, friendUser.userId, false)
    }

    @EventPattern('user_cancel_friend')
    userCancelFriendUser(data: UserFriendUser) {
        let user: User = UserEventHandler.getUser(data.user_id, "user_cancel_friend")
        if (user == null)
            return;
        let friendUser: User = UserEventHandler.getUser(data.friend_id, "user_cancel_friend")
        if (friendUser == null)
            return;

        let friend = new Friend(friendUser, false);
        if (!user.hasRequest(friend)) {
            Logger.warn("User [" + user.userId + "] is already friends with [" + friend.userId + "]")
            return;
        }

        user.unfriend(friend)
        Queries.getInstance().removeFriend(user.userId, friendUser.userId);
    }

    @EventPattern('user_accept_friend_user')
    userAcceptFriendUser(data: UserAcceptFriendUser) {
        let user: User = UserEventHandler.getUser(data.user_id, "user_accept_friend_user")
        if (user == null)
            return;
        let friendUser: User = UserEventHandler.getUser(data.friend_id, "user_accept_friend_user")
        if (friendUser == null)
            return;

        let friend = new Friend(friendUser, false);
        if (!user.hasRequest(friend)) {
            Logger.warn("User [" + user.userId + "] has no active request for [" + friend.userId + "]")
            return;
        }
        friend.confirmed = true;
        friendUser.friend(new Friend(user, true))
        Queries.getInstance().addFriend(user.userId, friendUser.userId, true)
        Queries.getInstance().addFriend(friendUser.userId, user.userId, true)
    }

    @EventPattern('user_remove_friend')
    userRemoveFriend(data: UserRemoveFriend) {
        let user: User = UserEventHandler.getUser(data.user_id, "user_remove_friend")
        if (user == null)
            return;
        let friendUser: User = UserEventHandler.getUser(data.friend_id, "user_remove_friend")
        if (friendUser == null)
            return;

        let friend = new Friend(friendUser, false);
        if (!user.isFriends(friend)) {
            Logger.warn("User [" + user.userId + "] is already friends with [" + friend.userId + "]")
            return;
        }

        user.unfriend(friend)
        friendUser.unfriend(user);
        Queries.getInstance().removeFriend(user.userId, friendUser.userId);
        Queries.getInstance().removeFriend(friendUser.userId, user.userId);
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