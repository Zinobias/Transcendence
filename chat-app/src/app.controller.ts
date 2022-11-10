import { Controller, Get, Inject, Logger } from '@nestjs/common';
import { AppService } from './app.service';
import { ClientProxy, EventPattern, Payload } from '@nestjs/microservices';
// import { EventPattern } from '@nestjs/websockets';
import { Socket } from 'socket.io';
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
} from './Events/ChannelEvents';
import { User } from './Objects/User';
import { Channel } from './Objects/Channel';
import { Queries } from './Database/Queries';
import { Setting } from './Objects/Setting';
import { SettingType } from './Enums/SettingType';
import { Message } from './Objects/Message';

@Controller()
export class AppController {
  private logger = new Logger('chat');
  constructor(
    private readonly appService: AppService,
    @Inject('gateway') private readonly gateway: ClientProxy,
  ) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @EventPattern('testMsg')
  receiveInit(@Payload() payload: any) {
    this.gateway.emit('testMsg', 'msg from chat-app');
    this.logger.log('chat msg from gateway received');
  }

  @EventPattern('channel_create')
  async channelCreate(client: Socket, data: ChannelCreate) {
    console.log('testing debug etc');
    const user: User = AppController.getUser(data.creator_id, 'channel_create');
    if (user == null) return;
    const usersArr: User[] = [User.getUser(data.creator_id)];

    if (data.creator2_id != -1) {
      const user2: User = AppController.getUser(
        data.creator2_id,
        'channel_create',
      );
      if (user2 == null) return;
      usersArr.push(user2);
    }

    const channel: Channel = new Channel(
      -1,
      data.creator_id,
      data.channel_name,
      usersArr,
      [],
      [],
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
    this.notify(userIds, 'channel_create_success', {
      channel_name: channel.channelName,
      channel_id: channel.channelId,
      channel_users: channel.users,
    });
  }

  @EventPattern('channel_join')
  handleJoin(client: Socket, data: ChannelJoin) {
    const channel: Channel = AppController.getChannel(
      data.channel_id,
      'channel_join',
    );
    if (channel == null) return;
    const user: User = AppController.getUser(data.user_id, 'channel_join');
    if (user == null) return;
    if (AppController.userInChannel(channel, user.userId, 'channel_join'))
      return;

    if (!channel.canJoin(data.user_id)) {
      //TODO some message to front end saying user can't join since they're banned
      return;
    }

    channel.addUser(user);
    Queries.getInstance().addChannelMember(data.channel_id, data.user_id);

    const userIds = channel.users.map((a) => a.userId);
    this.notify(userIds, 'channel_join_success', {
      channel_id: channel.channelId,
      user_id: data.user_id,
    });
  }

  @EventPattern('channel_leave')
  handleLeave(client: Socket, data: ChannelLeave) {
    const channel: Channel = AppController.getChannel(
      data.channel_id,
      'channel_leave',
    );
    if (channel == null) return;
    if (
      AppController.userInChannel(channel, data.user_id, 'channel_leave', true)
    )
      return;

    channel.removeUser(data.user_id);
    Queries.getInstance().removeChannelMember(data.channel_id, data.user_id);

    const userIds = channel.users.map((a) => a.userId);
    userIds.push(data.user_id);
    this.notify(userIds, 'channel_leave_success', {
      channel_id: channel.channelId,
      user_id: data.user_id,
    });
  }

  @EventPattern('channel_promote') //TODO verify the actor is allowed to do this action (and maybe save who did it in the db???)
  handlePromote(client: Socket, data: ChannelPromote) {
    const channel: Channel = AppController.getChannel(
      data.channel_id,
      'channel_promote',
    );
    if (channel == null) return;
    if (AppController.userInChannel(channel, data.user_id, 'channel_promote'))
      return;

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

    this.notify([data.user_id], 'channel_promote_success', {
      channel_id: channel.channelId,
      user_id: data.user_id,
    });
  }

  @EventPattern('channel_demote')
  handleDemote(client: Socket, data: ChannelDemote) {
    const channel: Channel = AppController.getChannel(
      data.channel_id,
      'channel_demote',
    );
    if (channel == null) return;
    if (
      AppController.userInChannel(channel, data.user_id, 'channel_demote', true)
    )
      return;
    if (AppController.notAdmin(channel, data.user_id, 'channel_kick')) return;

    channel.removeSetting(data.user_id, SettingType.ADMIN);
    Queries.getInstance().removeSetting(
      data.channel_id,
      data.user_id,
      SettingType.ADMIN,
    );
  }

  @EventPattern('channel_kick')
  handleKick(client: Socket, data: ChannelKick) {
    //TODO send a message to the frontend to notify kicked user somewhere (if we want to do that?)
    const channel: Channel = AppController.getChannel(
      data.channel_id,
      'channel_kick',
    );
    if (channel == null) return;
    if (
      AppController.userInChannel(channel, data.user_id, 'channel_kick', true)
    )
      return;
    if (AppController.notOwner(channel, data.user_id, 'channel_kick')) return;

    channel.removeUser(data.user_id);
    Queries.getInstance().removeChannelMember(data.channel_id, data.user_id);
  }

  @EventPattern('channel_ban')
  handleBan(client: Socket, data: ChannelBan) {
    //TODO send a message to the frontend to notify banned user somewhere (if we want to do that?)
    const channel: Channel = AppController.getChannel(
      data.channel_id,
      'channel_ban',
    );
    if (channel == null) return;
    if (AppController.userInChannel(channel, data.user_id, 'channel_ban', true))
      return;
    if (AppController.notAdmin(channel, data.user_id, 'channel_ban')) return;

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
  handleDisband(client: Socket, data: ChannelDisband) {
    //TODO send a message to the frontend to notify all other users (if we want to do that?)
    const channel: Channel = AppController.getChannel(
      data.channel_id,
      'channel_disband',
    );
    if (channel == null) return;

    Channel.removeChannel(data.channel_id);
    Queries.getInstance().removeChannel(data.channel_id);

    const userIds = channel.users.map((a) => a.userId);
    this.notify(userIds, 'remove_channel', {
      channel_id: channel.channelId,
    });
  }

  @EventPattern('channel_message')
  handleMessage(client: Socket, data: ChannelMessage) {
    const channel: Channel = AppController.getChannel(
      data.channel_id,
      'channel_message',
    );
    if (channel == null) return;

    if (!channel.hasUser(data.user_id)) {
      client.emit('channel_message_failed', {
        reason: 'You are not a member of this channel',
      });
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
          client.emit('channel_message_failed', {
            reason: 'Internal server error',
          });
          return;
        }
        const userIds = channel.users.map((a) => a.userId);
        this.notify(userIds, 'channel_message', message);
      });
  }

  //EZ MESSAGE:

  private notify(userIds: number[], channel: string, args: object) {
    const obj: microServiceDTO = {
      eventPattern: channel,
      userIDs: userIds,
      payload: args,
    };
    this.gateway.emit('chat', obj);
  }

  //EZ ERRORS:

  private static getChannel(channelId: number, source: string): Channel {
    const channel: Channel = Channel.getChannel(channelId);
    if (channel == null) {
      Logger.warn(
        'Received invalid channel id [' + channelId + '] from ' + source,
      );
      return undefined;
    }
    return channel;
  }

  private static getUser(userId: number, source: string): User {
    const user: User = User.getUser(userId);
    if (user == null) {
      Logger.warn('Received invalid user id [' + userId + '] from ' + source);
      return undefined;
    }
    return user;
  }

  /**
   * Checks if a user is in a channel, if this returns true it will display an error in the warning log
   * @param channel channel to check in
   * @param userId user to check for
   * @param source calling event
   * @param invert if this check should be inverted
   * @private
   */
  private static userInChannel(
    channel: Channel,
    userId: number,
    source: string,
    invert?: boolean,
  ): boolean {
    if (invert) {
      if (!channel.hasUser(userId)) {
        Logger.warn('User [' + userId + '] should be in channel for ' + source);
        return false;
      }
      return true;
    }

    if (channel.hasUser(userId)) {
      Logger.warn(
        'User [' + userId + '] should not be in channel for ' + source,
      );
      return true;
    }
    return false;
  }

  private static notAdmin(
    channel: Channel,
    actorId: number,
    source: string,
  ): boolean {
    if (!channel.isAdmin(actorId)) {
      Logger.warn(
        'Actor [' +
          actorId +
          "] is not an admin and can't issue the request " +
          source,
      );
      return true;
    }
    return false;
  }

  private static notOwner(
    channel: Channel,
    actorId: number,
    source: string,
  ): boolean {
    if (!channel.isAdmin(actorId)) {
      Logger.warn(
        'Actor [' +
          actorId +
          "] is not an owner and can't issue the request " +
          source,
      );
      return true;
    }
    return false;
  }
}

export interface microServiceDTO {
  eventPattern: string;
  userIDs: number[];
  payload: object;
}
