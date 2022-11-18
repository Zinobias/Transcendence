import { Channel } from '../Objects/Channel';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { User } from '../Objects/User';
import { microServiceDTO } from '../app.controller';
import { AppService } from '../app.service';
import { ClientProxy } from '@nestjs/microservices';

@Injectable()
export class Util {
  constructor(@Inject('gateway') private readonly gateway: ClientProxy) {}
  //EZ MESSAGE:

  public notify(userIds: number[], channel: string, args: object) {
    const obj: microServiceDTO = {
      eventPattern: channel,
      userIDs: userIds,
      data: args,
    };
    this.gateway.emit('chat', obj);
  }

  //EZ ERRORS:

  public getChannel(channelId: number, source: string): Channel {
    const channel: Channel = Channel.getChannel(channelId);
    if (channel == null) {
      Logger.warn(
        'Received invalid channel id [' + channelId + '] from ' + source,
      );
      return undefined;
    }
    return channel;
  }

  public async getUser(
    userId: number,
    source: string,
  ): Promise<User | undefined> {
    console.log('testing debug etc');
    const user: User = await User.getUser(userId);
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
  public userInChannel(
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

  /**
   * Checks if a user is not an admin in a channel
   * @param channel
   * @param actorId
   * @param source
   * returns true if user is *not* an admin
   */
  public notAdmin(channel: Channel, actorId: number, source: string): boolean {
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

  /**
   * Checks if a user does not own the specified channel
   * @param channel
   * @param actorId
   * @param source
   * returns true if user is *not* an owner
   */
  public notOwner(channel: Channel, actorId: number, source: string): boolean {
    if (!channel.isOwner(actorId)) {
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
