import {Controller, Inject, Logger} from '@nestjs/common';
import {AppService} from '../app.service';
import {ClientProxy, EventPattern} from '@nestjs/microservices';
import {
    ChannelBan,
    ChannelCreate,
    ChannelDemote,
    ChannelDisband,
    ChannelJoin,
    ChannelKick,
    ChannelLeave,
    ChannelMessage,
    ChannelPromote,
} from '../Events/ChannelEvents';
import {User} from '../Objects/User';
import {Channel} from '../Objects/Channel';
import {Queries} from '../Database/Queries';
import {Setting} from '../Objects/Setting';
import {SettingType} from '../Enums/SettingType';
import {Message} from '../Objects/Message';
import {Util} from './Util';
import {GetUserData} from '../Events/UserEvents';

@Controller()
export class ChannelEventPatterns {
    private logger = new Logger('chat');

    constructor(
        private readonly appService: AppService,
        @Inject('gateway') private readonly gateway: ClientProxy,
        @Inject(Util) private readonly util: Util,
    ) {
    }

    @EventPattern('channel_create')
    async channelCreate(data: ChannelCreate) {
        const user: User = await this.util.getUser(
            data.creator_id,
            'channel_create',
        );
        if (user == null)
            return;
        const usersArr: User[] = [await User.getUser(data.creator_id)];
        if (data.creator2_id != undefined) {
            const user2: User = await this.util.getUser(
                data.creator2_id,
                'channel_create',
            );
            if (user2 == null)
                return;
            usersArr.push(user2);
        }

        const channel: Channel = new Channel(
            -1,
            data.creator_id,
            data.channel_name,
            usersArr,
            [],
            [],
            false,
        );
        const channelId = await Queries.getInstance().createChannel(channel);
        if (channelId == -1) {
            Logger.warn(
                'Received invalid channel [' + channelId + '] from channel_create',
            );
            return;
        }
        channel.channelId = channelId;

        const userIds = channel.users.map((a) => a.userId);
        console.log('test ' + userIds);
        this.util.notify(userIds, 'channel_create_success', {
            channel_name: channel.channelName,
            channel_id: channel.channelId,
            channel_users: channel.users,
        });
    }

    //TODO check if user is invited?
    @EventPattern('channel_join')
    async handleJoin(data: ChannelJoin) {
        const channel: Channel = this.util.getChannel(
            data.channel_id,
            'channel_join',
        );
        if (channel == null) return;
        const user: User = await this.util.getUser(data.user_id, 'channel_join');
        if (user == null) return;
        if (this.util.userInChannel(channel, user.userId, 'channel_join')) return;

        if (!channel.canJoin(data.user_id)) {
            //TODO some message to front end saying user can't join since they're banned
            return;
        }

        channel.addUser(user);
        Queries.getInstance().addChannelMember(data.channel_id, data.user_id);

        const userIds = channel.users.map((a) => a.userId);
        this.util.notify(userIds, 'channel_join_success', {
            channel_id: channel.channelId,
            user_id: data.user_id,
        });
    }

    @EventPattern('channel_leave')
    handleLeave(data: ChannelLeave) {
        const channel: Channel = this.util.getChannel(
            data.channel_id,
            'channel_leave',
        );
        if (channel == null) return;
        if (this.util.userInChannel(channel, data.user_id, 'channel_leave', true))
            return;

        channel.removeUser(data.user_id);
        Queries.getInstance().removeChannelMember(data.channel_id, data.user_id);

        const userIds = channel.users.map((a) => a.userId);
        userIds.push(data.user_id);
        this.util.notify(userIds, 'channel_leave_success', {
            channel_id: channel.channelId,
            user_id: data.user_id,
        });
    }

    @EventPattern('channel_promote') //TODO verify the actor is allowed to do this action (and maybe save who did it in the db???)
    handlePromote(data: ChannelPromote) {
        const channel: Channel = this.util.getChannel(
            data.channel_id,
            'channel_promote',
        );
        if (channel == null) return;
        if (this.util.userInChannel(channel, data.user_id, 'channel_promote'))
            return;
        if (this.util.notAdmin(channel, data.user_id, 'channel_promote')) return;

        const setting: Setting = new Setting(
            SettingType.ADMIN,
            data.channel_id,
            data.user_id,
            data.actor_id,
            new Date().getTime(),
            -1,
        );
        channel.addSetting(setting);
        Queries.getInstance().addSetting(setting);

        this.util.notify([data.user_id], 'channel_promote_success', {
            channel_id: channel.channelId,
            user_id: data.user_id,
        });
    }

    @EventPattern('channel_demote')
    handleDemote(data: ChannelDemote) {
        const channel: Channel = this.util.getChannel(
            data.channel_id,
            'channel_demote',
        );
        if (channel == null) return;
        if (this.util.userInChannel(channel, data.user_id, 'channel_demote', true))
            return;
        if (this.util.notAdmin(channel, data.user_id, 'channel_kick')) return;

        channel.removeSetting(data.user_id, SettingType.ADMIN);
        Queries.getInstance().removeSetting(
            data.channel_id,
            data.user_id,
            SettingType.ADMIN,
        );
    }

    @EventPattern('channel_kick')
    handleKick(data: ChannelKick) {
        //TODO send a message to the frontend to notify kicked user somewhere (if we want to do that?)
        const channel: Channel = this.util.getChannel(
            data.channel_id,
            'channel_kick',
        );
        if (channel == null) return;
        if (this.util.userInChannel(channel, data.user_id, 'channel_kick', true))
            return;
        if (this.util.notOwner(channel, data.user_id, 'channel_kick')) return;

        channel.removeUser(data.user_id);
        Queries.getInstance().removeChannelMember(data.channel_id, data.user_id);
    }

    @EventPattern('channel_ban')
    handleBan(data: ChannelBan) {
        //TODO send a message to the frontend to notify banned user somewhere (if we want to do that?)
        const channel: Channel = this.util.getChannel(
            data.channel_id,
            'channel_ban',
        );
        if (channel == null) return;
        if (this.util.userInChannel(channel, data.user_id, 'channel_ban', true))
            return;
        if (this.util.notAdmin(channel, data.user_id, 'channel_ban')) return;

        channel.removeUser(data.user_id);
        Queries.getInstance().removeChannelMember(data.channel_id, data.user_id);

        const setting: Setting = new Setting(
            SettingType.BANNED,
            data.channel_id,
            data.user_id,
            data.actor_id,
            new Date().getTime(),
            data.until,
        );
        channel.addSetting(setting);
        Queries.getInstance().addSetting(setting);
        Queries.getInstance().addSetting(setting);
    }

    @EventPattern('channel_disband')
    handleDisband(data: ChannelDisband) {
        //TODO send a message to the frontend to notify all other users (if we want to do that?)
        const channel: Channel = this.util.getChannel(
            data.channel_id,
            'channel_disband',
        );
        if (channel == null) return;
        if (this.util.notOwner(channel, data.user_id, 'channel_disband')) return;

        Channel.removeChannel(data.channel_id);
        Queries.getInstance().removeChannel(data.channel_id);

        const userIds = channel.users.map((a) => a.userId);
        this.util.notify(userIds, 'remove_channel', {
            channel_id: channel.channelId,
        });
    }

    @EventPattern('channel_message')
    handleMessage(data: ChannelMessage) {
        const channel: Channel = this.util.getChannel(
            data.channel_id,
            'channel_message',
        );
        if (channel == null) return;

        if (!channel.hasUser(data.user_id)) {
            // client.emit('channel_message_failed', { TODO fix this
            //   reason: 'You are not a member of this channel',
            // });
            return;
        }
        const message = new Message(
            data.message,
            data.user_id,
            new Date().getUTCMilliseconds(),
        );
        Queries.getInstance()
            .addChannelMessage(data.channel_id, message)
            .then((res) => {
                if (res == false) {
                    // client.emit('channel_message_failed', { TODO fix this
                    //   reason: 'Internal server error',
                    // });
                    return;
                }
                const userIds = channel.users.map((a) => a.userId);
                this.util.notify(userIds, 'channel_message', message);
            });
    }

    @EventPattern('get_channels_user')
    getChannelsUser(data: GetUserData) {
        const channels = Channel.getUserChannels(data.user_id);
        this.util.notify([data.user_id], 'channels_for_user', {
            channels: channels,
        });
    }
}
