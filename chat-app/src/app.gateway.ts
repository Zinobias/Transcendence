import {
  SubscribeMessage,
  WebSocketGateway,
  OnGatewayInit,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { Socket, Server } from 'socket.io';
import { Channel } from './Objects/Channel';
import { Queries } from './Database/Queries';
import { SettingType } from './Enums/SettingType';
import {
  ChannelCreate,
  ChannelJoin,
  ChannelLeave,
  ChannelPromote,
  ChannelDemote,
  ChannelKick,
  ChannelBan,
  ChannelDisband,
  ChannelMessage,
} from './Events/ChannelEvents';
import { Setting } from './Objects/Setting';
import { User } from './Objects/User';
import { AuthData } from './Events/OtherEvents';
import { randomUUID } from 'crypto';
import { Message } from './Objects/Message';

export interface AuthToken {
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token: string;
  scope: string;
  created_at: number;
}

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class AppGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer() server: Server;
  private logger: Logger = new Logger('AppGateway');

  afterInit(server: Server) {
    this.logger.log('Init');
  }

  private static clientMap = new Map();
  private static socketMap = new Map();

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  handleConnection(client: Socket, ...args: any[]) {
    this.logger.log(`Client connected: ${client.id}`);
    const newVar: number = AppGateway.clientMap.get(client.id);
    if (newVar != undefined) {
      AppGateway.socketMap.delete(newVar);
    }
    AppGateway.clientMap.delete(client.id);
  }

  @SubscribeMessage('auth')
  auth(client: Socket, data: AuthData) {
    fetch('https://api.intra.42.fr/v2/oauth/token', {
      method: 'Post',
      body: JSON.stringify({
        grant_type: 'authorization_code',
        client_id: process.env.CLIENT,
        client_secret: process.env.SECRET,
        code: data.code,
        redirect_uri: 'http://localhost:3000',
      }),
      headers: { 'Content-Type': 'application/json' },
    }).then((response) => {
      response.json().then((result: AuthToken) => {
        console.log(result.access_token);
        fetch('https://api.intra.42.fr/v2/me', {
          method: 'Get',
          headers: {
            'Content-Type': 'application/json',
            Authorization: 'Bearer ' + result.access_token,
          },
        }).then((secondResponse) => {
          secondResponse.json().then((secondResult) => {
            console.log(secondResult.id);
            AppGateway.clientMap.set(client.id, secondResult.id);
            AppGateway.socketMap.set(secondResult.id, client);
            const uuid = randomUUID();
            Queries.getInstance()
              .storeAuth(secondResult.id, uuid)
              .then((result) => {
                if (result == true) {
                  client.emit('user_id', {
                    user_id: secondResult.id,
                    auth_cookie: uuid,
                  });
                } else {
                  client.emit('auth_failed', {
                    msg: 'Unable to store auth token',
                  });
                }
              });
          });
        });
      });
    });
  }

  @SubscribeMessage('channel_create')
  async channelCreate(client: Socket, data: ChannelCreate) {
    console.log('testing debug etc');
    const user: User = AppGateway.getUser(data.creator_id, 'channel_create');
    if (user == null) return;
    const usersArr: User[] = [User.getUser(data.creator_id)];

    if (data.creator2_id != -1) {
      const user2: User = AppGateway.getUser(
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
    AppGateway.notify(userIds, 'channel_create_success', {
      channel_name: channel.channelName,
      channel_id: channel.channelId,
      channel_users: channel.users,
    });
  }

  @SubscribeMessage('channel_join')
  handleJoin(client: Socket, data: ChannelJoin) {
    const channel: Channel = AppGateway.getChannel(
      data.channel_id,
      'channel_join',
    );
    if (channel == null) return;
    const user: User = AppGateway.getUser(data.user_id, 'channel_join');
    if (user == null) return;
    if (AppGateway.userInChannel(channel, user.userId, 'channel_join')) return;

    if (!channel.canJoin(data.user_id)) {
      //TODO some message to front end saying user can't join since they're banned
      return;
    }

    channel.addUser(user);
    Queries.getInstance().addChannelMember(data.channel_id, data.user_id);

    const userIds = channel.users.map((a) => a.userId);
    AppGateway.notify(userIds, 'channel_join_success', {
      channel_id: channel.channelId,
      user_id: data.user_id,
    });
  }

  @SubscribeMessage('channel_leave')
  handleLeave(client: Socket, data: ChannelLeave) {
    const channel: Channel = AppGateway.getChannel(
      data.channel_id,
      'channel_leave',
    );
    if (channel == null) return;
    if (AppGateway.userInChannel(channel, data.user_id, 'channel_leave', true))
      return;

    channel.removeUser(data.user_id);
    Queries.getInstance().removeChannelMember(data.channel_id, data.user_id);

    const userIds = channel.users.map((a) => a.userId);
    userIds.push(data.user_id);
    AppGateway.notify(userIds, 'channel_leave_success', {
      channel_id: channel.channelId,
      user_id: data.user_id,
    });
  }

  @SubscribeMessage('channel_promote') //TODO verify the actor is allowed to do this action (and maybe save who did it in the db???)
  handlePromote(client: Socket, data: ChannelPromote) {
    const channel: Channel = AppGateway.getChannel(
      data.channel_id,
      'channel_promote',
    );
    if (channel == null) return;
    if (AppGateway.userInChannel(channel, data.user_id, 'channel_promote'))
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

    AppGateway.notify([data.user_id], 'channel_promote_success', {
      channel_id: channel.channelId,
      user_id: data.user_id,
    });
  }

  @SubscribeMessage('channel_demote')
  handleDemote(client: Socket, data: ChannelDemote) {
    const channel: Channel = AppGateway.getChannel(
      data.channel_id,
      'channel_demote',
    );
    if (channel == null) return;
    if (AppGateway.userInChannel(channel, data.user_id, 'channel_demote', true))
      return;
    if (AppGateway.notAdmin(channel, data.user_id, 'channel_kick')) return;

    channel.removeSetting(data.user_id, SettingType.ADMIN);
    Queries.getInstance().removeSetting(
      data.channel_id,
      data.user_id,
      SettingType.ADMIN,
    );
  }

  @SubscribeMessage('channel_kick')
  handleKick(client: Socket, data: ChannelKick) {
    //TODO send a message to the frontend to notify kicked user somewhere (if we want to do that?)
    const channel: Channel = AppGateway.getChannel(
      data.channel_id,
      'channel_kick',
    );
    if (channel == null) return;
    if (AppGateway.userInChannel(channel, data.user_id, 'channel_kick', true))
      return;
    if (AppGateway.notOwner(channel, data.user_id, 'channel_kick')) return;

    channel.removeUser(data.user_id);
    Queries.getInstance().removeChannelMember(data.channel_id, data.user_id);
  }

  @SubscribeMessage('channel_ban')
  handleBan(client: Socket, data: ChannelBan) {
    //TODO send a message to the frontend to notify banned user somewhere (if we want to do that?)
    const channel: Channel = AppGateway.getChannel(
      data.channel_id,
      'channel_ban',
    );
    if (channel == null) return;
    if (AppGateway.userInChannel(channel, data.user_id, 'channel_ban', true))
      return;
    if (AppGateway.notAdmin(channel, data.user_id, 'channel_ban')) return;

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

  @SubscribeMessage('channel_disband')
  handleDisband(client: Socket, data: ChannelDisband) {
    //TODO send a message to the frontend to notify all other users (if we want to do that?)
    const channel: Channel = AppGateway.getChannel(
      data.channel_id,
      'channel_disband',
    );
    if (channel == null) return;

    Channel.removeChannel(data.channel_id);
    Queries.getInstance().removeChannel(data.channel_id);

    const userIds = channel.users.map((a) => a.userId);
    AppGateway.notify(userIds, 'remove_channel', {
      channel_id: channel.channelId,
    });
  }

  @SubscribeMessage('channel_message')
  handleMessage(client: Socket, data: ChannelMessage) {
    const channel: Channel = AppGateway.getChannel(
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
        AppGateway.notify(userIds, 'channel_message', message);
      });
  }

  //EZ MESSAGE:

  private static notify(userIds: number[], channel: string, args: object) {
    for (const userId of userIds) {
      const socketId: number = AppGateway.clientMap.get(userId);
      if (socketId == undefined) continue;
      const socket: Socket = AppGateway.socketMap.get(socketId);
      if (socket == undefined) continue;
      socket.emit(channel, args);
    }
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
