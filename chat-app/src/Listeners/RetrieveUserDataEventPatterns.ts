import { Controller, Inject, Logger } from '@nestjs/common';
import { ClientProxy, EventPattern } from '@nestjs/microservices';
import { Channel } from '../Objects/Channel';
import { AppService } from '../app.service';
import { Util } from './Util';
import { GetUserData } from '../Events/UserEvents';
import { User } from '../Objects/User';
import { Queries } from '../Database/Queries';

@Controller()
export class RetrieveUserDataEventPatterns {
  private logger = new Logger('chat');
  constructor(
    private readonly appService: AppService,
    @Inject('gateway') private readonly gateway: ClientProxy,
    @Inject(Util) private readonly util: Util,
  ) {}

  @EventPattern('get_channels_user')
  getChannelsUser(data: GetUserData) {
    const channels = Channel.getUserChannels(data.user_id);
    this.util.notify([data.user_id], 'channels_for_user', {
      channels: channels,
    });
  }

  @EventPattern('get_user')
  async getUser(data: GetUserData) {
    const user = await User.getUser(data.user_id);
    this.util.notify([data.user_id], 'get_user', {
      user: user,
    });
  }

  //TODO move this data to user class?
  @EventPattern('get_friend_requests')
  async getFriendsUser(data: GetUserData) {
    const friendRequests = await Queries.getInstance().getFriends(
      data.user_id,
      false,
    );
    this.util.notify([data.user_id], 'get_friend_requests', {
      friendRequests: friendRequests,
    });
  }
}
