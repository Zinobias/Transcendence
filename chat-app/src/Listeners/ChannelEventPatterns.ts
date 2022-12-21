import {Controller, Inject, Logger} from '@nestjs/common';
import {AppService} from '../app.service';
import {ClientProxy, EventPattern} from '@nestjs/microservices';
import {
    ChannelBan,
    ChannelCreate,
    ChannelDemote,
    ChannelDisband, ChannelInvite, ChannelInviteAccept, ChannelInviteDeny,
    ChannelJoin,
    ChannelKick,
    ChannelLeave,
    ChannelMessage,
    ChannelMuteUser,
    ChannelPromote,
    ChannelRetrieve,
    ChannelsRetrieve,
    ChannelUpdatePassword, DmChannel, GetActiveInvites,
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

    private getDmChannel(user1Id: number, user2Id: number): Channel | undefined {
        let channel: Channel = Channel.getUserChannels(user1Id).find(abc => abc.otherOwner == user2Id);
        if (channel != undefined)
            return channel;
        return Channel.getUserChannels(user2Id).find(abc => abc.otherOwner == user1Id);
    }

    @EventPattern('get_dm_channel')
    getDmChannelEvent(data: DmChannel) {
        const dmChannel = this.getDmChannel(data.user_id, data.other_user_id);
        this.util.notify([data.user_id], 'get_dm_channel', {
            success: true,
            channel: dmChannel == undefined ? undefined : dmChannel.getIChannel(true),
        });
    }

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
            if (user.hasBlocked(user2) || user2.hasBlocked(user)) {
                this.util.emitFailedObject(data.user_id, 'channel_create', `You can't create a channel with this user`);
                return;
            }
            if (this.getDmChannel(data.user_id, data.creator2_id) != undefined) {
                this.util.emitFailedObject(data.user_id, 'channel_create', `You already have a dm with this user`);
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
            user2 == undefined ? data.visible : false,
            undefined
        );
        const channelId = await Queries.getInstance().createChannel(channel);
        if (channelId == -1) {
            this.util.emitFailedObject(data.user_id, 'channel_create', 'Unable to create a new channel');
            // this.logger.warn(`Received invalid channel [${channelId}] from channel_create`);
            return;
        }
        channel.channelId = channelId;
        usersArr.forEach(a => {
            if (a != undefined) {
                Queries.getInstance().addChannelMember(channelId, a.userId);
            }
        });

        const userIds = channel.users.map((a) => a.userId);
        this.util.notify(userIds, 'channel_create', {
            success: true,
            hasPassword: data.should_get_password,
            channel_name: channel.channelName,
            channel_id: channel.channelId,
            channel_users: channel.users.map(user => user.getIUser()),
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
        if (channel == null || channel.closed) {
            this.util.emitFailedObject(data.user_id, 'channel_join', `Unable to find the channel you're trying to join`);
            return;
        }

        if (channel.otherOwner != undefined) {
            this.util.emitFailedObject(data.user_id, 'channel_join', `You can't join dm channels`);
            return;
        }

        if (channel.visible == false && this.channel_invites.find(abc => abc.channel_id == channel.channelId && abc.invited_id == data.user_id) == null) {
            this.util.emitFailedObject(data.user_id, 'channel_join', `You don't have an invite for this channel`);
            return
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

        this.channel_invites = this.channel_invites.filter(abc => abc.channel_id != data.channel_id && abc.invited_id != data.user_id);

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
            channel.closed = true;
            await Queries.getInstance().setClosed(data.channel_id, true);
			this.util.notify([data.user_id], 'channel_leave', {
				success: true,
				msg: undefined,
				channel_id: channel.channelId,
				user_id: data.user_id,
			});
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

    @EventPattern('channel_promote')
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

        this.util.notify(channel.users.map(mapUser => mapUser.userId), 'channel_promote', {
            success: true,
            msg: undefined,
            channel_id: channel.channelId,
            actor_id: data.user_id,
            affected_id: data.affected_id
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
        this.util.notify(channel.users.map(mapUser => mapUser.userId), 'channel_demote', {
            success: true,
            msg: undefined,
            channel_id: channel.channelId,
            actor_id: data.user_id,
            affected_id: data.affected_id
        });
    }

    @EventPattern('channel_mute_user')
    async handleMute(data: ChannelMuteUser) {
        if (data.channel_id == undefined || data.until == undefined || data.until < new Date().getTime()) {
            this.util.emitFailedObject(data.user_id, 'channel_mute_user', 'Incorrect data object');
            return;
        }
        const channel: Channel = this.util.getChannel(
            data.channel_id,
            'channel_mute_user',
        );
        if (channel == null)
            return;
        if (!this.util.userInChannel(channel, data.affected_id, 'channel_mute_user', false))
            return;
        if (this.util.isAdminButShouldNotBe(channel, data.affected_id, 'channel_mute_user'))
            return;
        if (this.util.notAdmin(channel, data.user_id, 'channel_mute_user'))
            return;

        const setting: Setting = new Setting(
            SettingType.MUTED,
            data.channel_id,
            data.affected_id,
            data.user_id,
            new Date().getTime(),
            data.until,
        );
        channel.addSetting(setting);
        await Queries.getInstance().addSetting(setting);

        this.util.notify(channel.users.map(mapUser => mapUser.userId), 'channel_mute_user', {
            success: true,
            msg: undefined,
            channel_id: channel.channelId,
            actor_id: data.user_id,
            affected_id: data.affected_id
        });
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
        if (this.util.isAdminButShouldNotBe(channel, data.affected_id, 'channel_kick'))
            return;
        if (this.util.notOwner(channel, data.user_id, 'channel_kick'))
            return;

        const channelUsers = channel.users.map(mapUser => mapUser.userId);
        channel.removeUser(data.affected_id);
        await Queries.getInstance().removeChannelMember(data.channel_id, data.affected_id);
        this.util.notify(channelUsers, 'channel_kick', {
            success: true,
            msg: undefined,
            channel_id: channel.channelId,
            actor_id: data.user_id,
            affected_id: data.affected_id
        });
    }

    @EventPattern('channel_ban')
    async handleBan(data: ChannelBan) {
        if (data.channel_id == undefined || data.until == undefined || (data.until != -1 && data.until <= new Date().getTime()) || data.affected_id == undefined) {
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
        if (this.util.isAdminButShouldNotBe(channel, data.affected_id, 'channel_ban'))
            return;
        if (this.util.notAdmin(channel, data.user_id, 'channel_ban'))
            return;

        const channelUsers = channel.users.map(mapUser => mapUser.userId);
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
        this.util.notify(channelUsers, 'channel_ban', {
            success: true,
            msg: undefined,
            channel_id: channel.channelId,
            actor_id: data.user_id,
            affected_id: data.affected_id
        });
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

    private async parseInviteData(channel_id: number, inviter_id: number, invited_id: number, source_id: number, pattern: string): Promise<Boolean> {
        const channel: Channel = this.util.getChannel(
            channel_id,
            pattern,
        );
        if (channel == null)
            return;

        if (!channel.hasUser(inviter_id)) {
            this.util.notify([source_id], pattern, {
                success: false,
                msg: 'Inviter is not a member of this channel',
                message: undefined
            });
            return;
        }

        const inviter: User = await this.util.getUser(inviter_id, pattern);
        if (inviter == undefined) {
            this.util.emitFailedObject(source_id, pattern, 'Unable to retrieve other user');
            return;
        }

        const invited: User = await this.util.getUser(invited_id, pattern);
        if (invited == undefined) {
            this.util.emitFailedObject(source_id, pattern, 'Unable to retrieve other user');
            return;
        }

        return true
    }

    channel_invites: invites[] = []

    @EventPattern('get_active_invites')
    async getActiveInvites(data: GetActiveInvites) {
        this.util.notify([data.user_id], 'get_active_invites', {
            success: true,
            msg: undefined,
            invites: this.channel_invites.filter(abc => abc.invited_id == data.user_id)
        });
    }

    @EventPattern('channel_invite')
    async handleChannelInvite(data: ChannelInvite) {
        if (data.channel_id == undefined || data.invited_id == undefined) {
            this.util.emitFailedObject(data.user_id, 'channel_invite', 'Incorrect data object');
            return;
        }
        if (!(await this.parseInviteData(data.channel_id, data.user_id, data.invited_id, data.user_id, 'channel_invite'))) {
            return;
        }

        const channel: Channel = this.util.getChannel(
            data.channel_id,
            'channel_invite',
        );

        if (channel.otherOwner != undefined) {
            this.util.emitFailedObject(data.user_id, 'channel_invite', `You can't invite users to a dm channel`);
            return;
        }

        this.channel_invites.push({inviter_id: data.user_id, invited_id: data.invited_id, channel_id: data.channel_id})
        this.util.notify([data.invited_id], 'channel_invite', {
            success: true,
            msg: undefined,
            inviter_id: data.user_id,
            channel_id: data.channel_id,
        });
    }

    @EventPattern('channel_invite_accept')
    async handleChannelInviteAccept(data: ChannelInviteAccept) {
        if (data.channel_id == undefined || data.inviter_id == undefined) {
            this.util.emitFailedObject(data.user_id, 'channel_invite_accept', 'Incorrect data object');
            return;
        }
        if (!(await this.parseInviteData(data.channel_id, data.inviter_id, data.user_id, data.user_id, 'channel_invite_accept'))) {
            return;
        }
        const tmp: invites = {inviter_id: data.inviter_id, invited_id: data.user_id, channel_id: data.channel_id};
        if (this.channel_invites.find(abc => abc == tmp) == null) {
            this.util.emitFailedObject(data.user_id, 'channel_invite_accept', `You don't have this invite`);
            return;
        }
        this.util.notify([data.user_id], 'channel_invite_accept', {
            success: true,
            msg: undefined,
            channel_id: data.channel_id
        });
    }

    @EventPattern('channel_invite_deny')
    async handleChannelInviteDeny(data: ChannelInviteDeny) {
        if (data.channel_id == undefined || data.inviter_id == undefined) {
            this.util.emitFailedObject(data.user_id, 'channel_invite_deny', 'Incorrect data object');
            return;
        }
        if (!(await this.parseInviteData(data.channel_id, data.inviter_id, data.user_id, data.user_id, 'channel_invite_deny'))) {
            return;
        }
        const tmp: invites = {inviter_id: data.inviter_id, invited_id: data.user_id, channel_id: data.channel_id};
        if (this.channel_invites.find(abc => abc == tmp) == null) {
            this.util.emitFailedObject(data.user_id, 'channel_invite_deny', `You don't have this invite`);
            return;
        }
        this.channel_invites = this.channel_invites.filter(abc => abc != tmp);
        this.util.notify([data.user_id], 'channel_invite_deny', {
            success: true,
            msg: undefined,
            channel_id: data.channel_id
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
        if (channel.hasSetting(data.user_id, SettingType.MUTED)) {
            this.util.notify([data.user_id], 'channel_message', {
                success: false,
                msg: 'You are muted in this channel',
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
                    channel_id: data.channel_id,
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

    @EventPattern('channel_info_retrieve_by_id')
    async handleRetrieveChannelInfo(data: ChannelRetrieve) {
        const channel = this.util.getChannel(data.channel_id, 'channel_info_retrieve_by_id');
        this.util.notify([data.user_id], 'channel_info_retrieve_by_id', {
            success: true,
            msg: undefined,
            channel: channel.getIChannel(false)
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
            channel: channel.getIChannel(true)
        });
    }
}

interface invites {
    inviter_id: number
    invited_id: number
    channel_id: number
}
