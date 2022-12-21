import {Channel} from '../Objects/Channel';
import {Inject, Injectable, Logger} from '@nestjs/common';
import {User} from '../Objects/User';
import {microServiceDTO} from '../app.controller';
import {ClientProxy} from '@nestjs/microservices';

@Injectable()
export class Util {
    constructor(@Inject('gateway') private readonly gateway: ClientProxy) {
    }

    private logger: Logger = new Logger('Util');

    //EZ MESSAGE:

    public emitFailedObject(userId: number, channel: string, msg: string) {
        this.notify([userId], channel, {success: false, msg: msg})
    }

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
            // this.logger.warn(`Received invalid channel id [${channelId}] from [${source}]`);
            return undefined;
        }
        return channel;
    }

    public async getUser(userId: number, source: string): Promise<User | undefined> {
        const user: User = await User.getUser(userId);
        if (user == null) {
            // this.logger.warn(`Received invalid user id [${userId}] from [${source}]`);
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
    public userInChannel(channel: Channel, userId: number, source: string, invert: boolean): boolean {
        if (invert) {
            if (channel.hasUser(userId)) {
                return false;
            }
            return true;
        }

        if (channel.hasUser(userId)) {
            return true;
        }
        this.logger.debug(`User [${userId}] should not be in channel for ${source}`);
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
            return true;
        }
        return false;
    }

    /**
     * Checks if a user is an admin in a channel
     * @param channel
     * @param actorId
     * @param source
     * returns false if user *is* an admin
     */
    public isAdminButShouldNotBe(channel: Channel, actorId: number, source: string): boolean {
        if (channel.isAdmin(actorId)) {
            this.logger.debug(`Actor [${actorId}] is an admin and can't be affected by the request ${source}`);
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
            return true;
        }
        return false;
    }
}
