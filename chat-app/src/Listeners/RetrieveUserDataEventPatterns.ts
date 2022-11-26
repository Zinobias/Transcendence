import {Controller, Inject, Logger} from '@nestjs/common';
import {ClientProxy, EventPattern} from '@nestjs/microservices';
import {Channel} from '../Objects/Channel';
import {AppService} from '../app.service';
import {Util} from './Util';
import {GetOtherUserData, GetSelfUserData} from '../DTOs/UserDTOs';
import {User} from '../Objects/User';
import {Queries} from '../Database/Queries';

@Controller()
export class RetrieveUserDataEventPatterns {
    private logger = new Logger('RetrieveUserDataEventPatterns');

    constructor(private readonly appService: AppService,
                @Inject('gateway') private readonly gateway: ClientProxy,
                @Inject(Util) private readonly util: Util) {}

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
                    visible: channel.visible,
                    hasPassword: (channel.password != undefined && channel.password.length == 64)
                }
            })
        });
    }

    @EventPattern('get_user')
    async getUser(data: GetOtherUserData) {
        const user = await User.getUser(data.requested_user_id);
        this.logger.debug(`chat_app user ${user.userId} ${user.name}`);
        this.util.notify([data.user_id], 'get_user', {
            success: true,
            msg: undefined,
            user: user?.getIUser(),
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
            friendRequests: friendRequests.map(friend => {return friend.getIFriend()}),
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
            friendRequests: friendRequests.map(friend => {return friend.getIFriend()}),
        });
    }
}
