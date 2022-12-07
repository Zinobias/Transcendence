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
    ChannelRetrieve,
    ChannelsRetrieve,
    ChannelUpdatePassword,
} from '../DTOs/ChannelDTOs';
import {User} from '../Objects/User';
import {Channel} from '../Objects/Channel';
import {Queries} from '../Database/Queries';
import {Setting} from '../Objects/Setting';
import {SettingType} from '../Enums/SettingType';
import {Message} from '../Objects/Message';
import {Util} from './Util';

@Controller()
export class ChannelEventPatterns {
    private logger = new Logger('ChannelEventPatterns');

    constructor(private readonly appService: AppService,
                @Inject('gateway') private readonly gateway: ClientProxy,
                @Inject(Util) private readonly util: Util,
                /*@Inject(Queries) private readonly queries: Queries*/) {}

    @EventPattern('channel_create')
    async channelCreate(data: ChannelCreate) {
        if (data.channel_name == undefined || data.channel_name.length < 3 || data.channel_name.length > 12
            || data.visible == undefined || data.should_get_password == undefined) {
            this.util.emitFailedObject(data.user_id, 'channel_create', 'Incorrect data object');
            return;
        }
        const user: User = await this.util.getUser(
            data.user_id,
            'channel_create',
        );
        if (user == null) {
            this.util.emitFailedObject(data.user_id, 'channel_create', 'Unable to find dm user');
            return;
        }
        const usersArr: User[] = [user];
        let user2: User = undefined;
        if (data.creator2_id != undefined) {
            user2 = await this.util.getUser(
                data.creator2_id,
                'channel_create',
            );
            if (user2 == null) {
                this.util.emitFailedObject(data.user_id, 'channel_create', 'Unable to find second dm user');
                return;
            }
            usersArr.push(user2);
        }

        const channel: Channel = new Channel(
            -1,
            data.user_id,
            data.channel_name,
            usersArr,
            [],
            [],
            data.should_get_password != undefined && data.should_get_password == true,
            user2 == undefined ? undefined : user2.userId,
            data.visible,
            undefined
        );
        const channelId = await Queries.getInstance().createChannel(channel);
        if (channelId == -1) {
            this.util.emitFailedObject(data.user_id, 'channel_create', 'Unable to create a new channel');
            this.logger.warn(`Received invalid channel [${channelId}] from channel_create`);
            return;
        }
        channel.channelId = channelId;
        usersArr.forEach(a => {
            if (a != undefined) {
                this.logger.debug(`Adding user: [${a.userId}] to new channel: [${channelId}]`);
                Queries.getInstance().addChannelMember(channelId, a.userId);
            }
        });

        const userIds = channel.users.map((a) => a.userId);
        this.util.notify(userIds, 'channel_create', {
            success: true,
            hasPassword: data.should_get_password,
            channel_name: channel.channelName,
            channel_id: channel.channelId,
            channel_users: channel.users,
        });
    }

    @EventPattern('channel_update_password')
    async handlePasswordChange(data: ChannelUpdatePassword) {
        if (data.channel_id == undefined) {
            this.util.emitFailedObject(data.user_id, 'channel_update_password', 'Incorrect data object');
            return;
        }
        const channel: Channel = this.util.getChannel(
            data.channel_id,
            'channel_update_password',
        );
        if (channel == null) {
            this.util.emitFailedObject(data.user_id, 'channel_update_password', `Unable to find the channel you're trying to join`);
            return;
        }

        const user: User = await this.util.getUser(data.user_id, 'channel_update_password');
        if (user == null) {
            this.util.emitFailedObject(data.user_id, 'channel_update_password', `Unable to find your user`);
            return;
        }

        if (this.util.notOwner(channel, data.user_id, 'channel_update_password')) {
            this.util.emitFailedObject(data.user_id, 'channel_update_password', `You're not the owner of this channel`);
            return;
        }

        if (data.password === undefined) {
            channel.password = data.password
            await Queries.getInstance().setPassword(channel.channelId, null);
            this.util.notify([data.user_id], 'channel_update_password', {
                success: true,
                msg: undefined,
                channel_id: channel.channelId,
            });
            return;
        }

        if (data.password.length != 32) { //This only works for a MD5 hash
            this.util.emitFailedObject(data.user_id, 'channel_update_password', `This password is not valid`);
            return;
        }
        channel.password = data.password
        await Queries.getInstance().setPassword(channel.channelId, channel.password);
        if (channel.closed) {
            channel.closed = false;
            await Queries.getInstance().setClosed(channel.channelId, channel.closed);
        }
        this.util.notify([data.user_id], 'channel_update_password', {
            success: true,
            msg: undefined,
            channel_id: channel.channelId,
        });
    }

    //TODO check if user is invited?
    @EventPattern('channel_join')
    async handleJoin(data: ChannelJoin) {
        if (data.channel_id == undefined) {
            this.util.emitFailedObject(data.user_id, 'channel_join', 'Incorrect data object');
            return;
        }
        const channel: Channel = this.util.getChannel(
            data.channel_id,
            'channel_join',
        );
        if (channel == null) {
            this.util.emitFailedObject(data.user_id, 'channel_join', `Unable to find the channel you're trying to join`);
            return;
        }

        const user: User = await this.util.getUser(data.user_id, 'channel_join');
        if (user == null) {
            this.util.emitFailedObject(data.user_id, 'channel_join', `Unable to find your user`);
            return;
        }

        if (!this.util.userInChannel(channel, data.user_id, 'channel_join', true)) {
            this.util.emitFailedObject(data.user_id, 'channel_join', `You're already a member of this channel`);
            return;
        }

        if (!channel.canJoin(data.user_id)) {

            this.util.emitFailedObject(data.user_id, 'channel_join', `You've been banned from this channel`);
            return;
        }

        if (channel.password != undefined) {
            if (data.password == undefined) {
                this.util.emitFailedObject(data.user_id, 'channel_join', `No password provided`);
                return;
            }
            if (data.password != channel.password) {
                this.util.emitFailedObject(data.user_id, 'channel_join', `Invalid password`);
                return
            }
        }

        channel.addUser(user);
        await Queries.getInstance().addChannelMember(data.channel_id, data.user_id);

        const userIds = channel.users.map((a) => a.userId);
        this.util.notify(userIds, 'channel_join', {
            success: true,
            msg: undefined,
            channel_id: channel.channelId,
            user_id: data.user_id,
        });
    }

    @EventPattern('channel_leave')
    async handleLeave(data: ChannelLeave) {
        if (data.channel_id == undefined) {
            this.util.emitFailedObject(data.user_id, 'channel_leave', 'Incorrect data object');
            return;
        }
        const channel: Channel = this.util.getChannel(
            data.channel_id,
            'channel_leave',
        );
        if (channel == null) {
            this.util.emitFailedObject(data.user_id, 'channel_leave', `Unable to find the channel you're trying to leave`);
            return;
        }
        // if (this.util.userInChannel(channel, data.user_id, 'channel_leave')) {
        //     this.util.emitFailedObject(data.user_id, 'channel_join', `You're already a member of this channel`);
        //     return;
        // }

        channel.removeUser(data.user_id);
        await Queries.getInstance().removeChannelMember(data.channel_id, data.user_id);

        if (channel.users.length == 0) {
            channel.visible = false;
            await Queries.getInstance().setChannelVisibility(data.channel_id, false);
            return;
        }

        const userIds = channel.users.map((a) => a.userId);
        if (channel.owner == data.user_id) {
            let newOwner: number = -1;
            const settings = channel.settings.filter(setting => setting.setting == SettingType.ADMIN);
            if (settings.length == 0) {
                newOwner = channel.users[0].userId
            } else {
                let i = 0;
                do {
                    if (channel.hasUser(settings[i].affectedId))
                        newOwner = settings[i].affectedId
                } while (newOwner == -1 && i < settings.length)
                if (newOwner == -1)
                    newOwner = channel.users[0].userId;
            }
            channel.owner = newOwner;
            Queries.getInstance().setChannelOwner(channel.channelId, newOwner);
            this.util.notify(userIds, 'channel_new_owner', {
                success: true,
                msg: undefined,
                channel_id: channel.channelId,
                new_owner: newOwner,
            });
        }

        userIds.push(data.user_id);
        this.util.notify(userIds, 'channel_leave', {
            success: true,
            msg: undefined,
            channel_id: channel.channelId,
            user_id: data.user_id,
        });
    }

    @EventPattern('channel_promote') //TODO verify the actor is allowed to do this action (and maybe save who did it in the db???)
    handlePromote(data: ChannelPromote) {
        if (data.channel_id == undefined) {
            this.util.emitFailedObject(data.user_id, 'channel_promote', 'Incorrect data object');
            return;
        }
        const channel: Channel = this.util.getChannel(
            data.channel_id,
            'channel_promote',
        );
        if (channel == null)
            return;
        if (!this.util.userInChannel(channel, data.affected_id, 'channel_promote', false))
            return;
        if (this.util.notAdmin(channel, data.user_id, 'channel_promote'))
            return;

        const setting: Setting = new Setting(
            SettingType.ADMIN,
            data.channel_id,
            data.affected_id,
            data.user_id,
            new Date().getTime(),
            -1,
        );
        channel.addSetting(setting);
        Queries.getInstance().addSetting(setting);

        this.util.notify([data.affected_id], 'channel_promote', {
            success: true,
            msg: undefined,
            channel_id: channel.channelId,
            user_id: data.affected_id,
        });
    }

    @EventPattern('channel_demote')
    async handleDemote(data: ChannelDemote) {
        if (data.channel_id == undefined || data.affected_id == undefined) {
            this.util.emitFailedObject(data.user_id, 'channel_demote', 'Incorrect data object');
            return;
        }
        const channel: Channel = this.util.getChannel(
            data.channel_id,
            'channel_demote',
        );
        if (channel == null)
            return;
        if (!this.util.userInChannel(channel, data.affected_id, 'channel_demote', false))
            return;
        if (this.util.notAdmin(channel, data.user_id, 'channel_demote'))
            return;

        channel.removeSetting(data.affected_id, SettingType.ADMIN);
        await Queries.getInstance().removeSetting(
            data.channel_id,
            data.affected_id,
            SettingType.ADMIN,
        );
    }

    @EventPattern('channel_kick')
    async handleKick(data: ChannelKick) {
        if (data.channel_id == undefined || data.affected_id == undefined) {
            this.util.emitFailedObject(data.user_id, 'channel_kick', 'Incorrect data object');
            return;
        }
        //TODO send a message to the frontend to notify kicked user somewhere (if we want to do that?)
        const channel: Channel = this.util.getChannel(
            data.channel_id,
            'channel_kick',
        );
        if (channel == null)
            return;
        if (!this.util.userInChannel(channel, data.affected_id, 'channel_kick', false))
            return;
        if (this.util.notOwner(channel, data.user_id, 'channel_kick'))
            return;

        channel.removeUser(data.affected_id);
        await Queries.getInstance().removeChannelMember(data.channel_id, data.affected_id);
    }

    @EventPattern('channel_ban')
    async handleBan(data: ChannelBan) {
        if (data.channel_id == undefined || data.until != undefined
            || (data.until != -1 || data.until <= new Date().getUTCMilliseconds()) || data.affected_id == undefined) {
            this.util.emitFailedObject(data.user_id, 'channel_ban', 'Incorrect data object');
            return;
        }
        //TODO send a message to the frontend to notify banned user somewhere (if we want to do that?)
        const channel: Channel = this.util.getChannel(
            data.channel_id,
            'channel_ban',
        );
        if (channel == null)
            return;
        if (!this.util.userInChannel(channel, data.affected_id, 'channel_ban', false))
            return;
        if (this.util.notAdmin(channel, data.user_id, 'channel_ban'))
            return;

        channel.removeUser(data.affected_id);
        await Queries.getInstance().removeChannelMember(data.channel_id, data.affected_id);

        const setting: Setting = new Setting(
            SettingType.BANNED,
            data.channel_id,
            data.affected_id,
            data.user_id,
            new Date().getTime(),
            data.until,
        );
        channel.addSetting(setting);
        await Queries.getInstance().addSetting(setting);
    }

    @EventPattern('channel_disband')
    async handleDisband(data: ChannelDisband) {
        if (data.channel_id == undefined) {
            this.util.emitFailedObject(data.user_id, 'channel_disband', 'Incorrect data object');
            return;
        }
        //TODO send a message to the frontend to notify all other users (if we want to do that?)
        const channel: Channel = this.util.getChannel(
            data.channel_id,
            'channel_disband',
        );
        if (channel == null)
            return;
        if (this.util.notOwner(channel, data.user_id, 'channel_disband'))
            return;

        const userIds = channel.users.map((a) => a.userId);

        Channel.removeChannel(data.channel_id);
        await Queries.getInstance().setClosed(data.channel_id, true);
        await Queries.getInstance().purgeChannel(data.channel_id);

        this.util.notify(userIds, 'remove_channel', {
            success: true,
            msg: undefined,
            channel_id: channel.channelId,
        });
    }

    @EventPattern('channel_message')
    handleMessage(data: ChannelMessage) {
        if (data.channel_id == undefined || data.message == undefined) {
            this.util.emitFailedObject(data.user_id, 'channel_message', 'Incorrect data object');
            return;
        }
        const channel: Channel = this.util.getChannel(
            data.channel_id,
            'channel_message',
        );
        if (channel == null)
            return;

        if (!channel.hasUser(data.user_id)) {
            this.util.notify([data.user_id], 'channel_message', {
                success: false,
                msg: 'You are not a member of this channel',
                message: undefined
            });
            return;
        }
        const message = new Message(
            data.message,
            data.user_id,
            new Date().getTime(),
        );
        channel.addMessage(message)
        Queries.getInstance()
            .addChannelMessage(data.channel_id, message)
            .then((res) => {
                if (res == false) {
                    this.util.notify([data.user_id], 'channel_message', {
                        success: false,
                        msg: 'Internal server error',
                        message: undefined
                    });
                    return;
                }
                const userIds = channel.users.map((a) => a.userId);
                this.util.notify(userIds, 'channel_message', {
                    success: true,
                    msg: undefined,
                    message: message.getIMessage()
                });
            });
    }

    @EventPattern('channels_retrieve')
    async handleRetrieve(data: ChannelsRetrieve) {
        const channels = await Queries.getInstance().getAllPublicChannels();
        if (channels == undefined) {
            this.util.notify([data.user_id], 'channels_retrieve', {
                success: false,
                msg: 'Unable to find any public channels'
            });
        }
        const IChannels = channels
            .filter(channel => channel != undefined)
            .map(channel => {return {
                    channelId: channel.channelId,
                    channelName: channel.channelName,
                    visible: channel.visible,
                    hasPassword: (channel.password != undefined && channel.password.length == 32)
                }
            });
        this.util.notify([data.user_id], 'channels_retrieve', {
            success: true,
            msg: undefined,
            channels: IChannels
        });
    }

    @EventPattern('channel_retrieve_by_id')
    async handleRetrieveOne(data: ChannelRetrieve) {
        const channel = this.util.getChannel(data.channel_id, 'channel_retrieve_by_id');
        if (!this.util.userInChannel(channel, data.user_id, 'channel_retrieve_by_id', false))
            return;
        this.util.notify([data.user_id], 'channel_retrieve_by_id', {
            success: true,
            msg: undefined,
            channel: channel.getIChannel()
        });
    }
}
