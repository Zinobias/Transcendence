import {Controller} from '@nestjs/common';
import {AppService} from './app.service';
import {EventPattern} from "@nestjs/microservices";
import {
  ChannelBan,
  ChannelCreate,
  ChannelDemote, ChannelDisband,
  ChannelJoin,
  ChannelKick,
  ChannelLeave,
  ChannelPromote
} from "./Events/ChannelEvents";
import {Channel} from "./Objects/Channel";
import {User} from "./Objects/User";
import {Queries} from "./Database/Queries";
import {Setting} from "./Objects/Setting";
import {SettingType} from "./Enums/SettingType";

@Controller()
export class ChannelEventHandler {
  constructor(private readonly appService: AppService) {}

  @EventPattern('channel_create')
  channelCreate(data: ChannelCreate) {
    let channel: Channel;
    let user: User = User.getUser(data.creator_id);
    if (user == null)
      return; //TODO: ERROR
    const usersArr: User[] = [User.getUser(data.creator_id)]
    if (data.creator2_id != -1) {
      let user2: User = User.getUser(data.creator2_id)
      if (user2 == null)
        return; //TODO: ERROR
      usersArr.push(user2)
    }
    channel = new Channel(-1, data.creator_id, data.channel_name, usersArr, [], []);
    const channelId = Queries.getInstance().createChannel(channel);
    if (channelId == -1) {
      return; //TODO: ERROR
    }
    channel.channelId = channelId;
  }

  @EventPattern('channel_join') //TODO check if user is banned from channel
  handleJoin(data: ChannelJoin) {
    let channel: Channel = Channel.getChannel(data.channel_id);
    if (channel == null)
      return; //TODO: ERROR
    let user: User = User.getUser(data.user_id);
    if (user == null)
      return; //TODO: ERROR
    if (channel.hasUser(user.userId))
      return; //TODO: ERROR
    channel.addUser(user)
    Queries.getInstance().addChannelMember(data.channel_id, data.user_id)
  }

  @EventPattern('channel_leave')
  handleLeave(data: ChannelLeave) {
    let channel: Channel = Channel.getChannel(data.channel_id);
    if (channel == null)
      return; //TODO: ERROR
    if (!channel.hasUser(data.user_id))
      return; //TODO: ERROR
    channel.removeUser(data.user_id)
    Queries.getInstance().removeChannelMember(data.channel_id, data.user_id)
  }

  @EventPattern('channel_promote')//TODO verify the actor is allowed to do this action (and maybe save who did it in the db???)
  handlePromote(data: ChannelPromote) {
    let channel: Channel = Channel.getChannel(data.channel_id);
    if (channel == null)
      return; //TODO: ERROR
    if (!channel.hasUser(data.user_id))
      return; //TODO: ERROR
    let setting: Setting = new Setting(SettingType.ADMIN, data.channel_id, data.user_id, new Date().getTime(), -1);
    channel.addSetting(setting)
    Queries.getInstance().addSetting(setting)
  }

  @EventPattern('channel_demote')//TODO verify the actor is allowed to do this action (and maybe save who did it in the db???)
  handleDemote(data: ChannelDemote) {
    let channel: Channel = Channel.getChannel(data.channel_id);
    if (channel == null)
      return; //TODO: ERROR
    if (!channel.hasUser(data.user_id))
      return; //TODO: ERROR
    channel.removeSetting(data.user_id, SettingType.ADMIN)
    Queries.getInstance().removeSetting(data.channel_id, data.user_id, SettingType.ADMIN)
  }

  @EventPattern('channel_kick')//TODO verify the actor is allowed to do this action (and maybe save who did it in the db???)
  handleKick(data: ChannelKick) { //TODO send a message to the frontend to notify kicked user somewhere (if we want to do that?)
    let channel: Channel = Channel.getChannel(data.channel_id);
    if (channel == null)
      return; //TODO: ERROR
    if (!channel.hasUser(data.user_id))
      return; //TODO: ERROR
    channel.removeUser(data.user_id)
    Queries.getInstance().removeChannelMember(data.channel_id, data.user_id)
  }

  @EventPattern('channel_ban')//TODO verify the actor is allowed to do this action (and maybe save who did it in the db???)
  handleBan(data: ChannelBan) { //TODO send a message to the frontend to notify banned user somewhere (if we want to do that?)
    let channel: Channel = Channel.getChannel(data.channel_id);
    if (channel == null)
      return; //TODO: ERROR
    if (!channel.hasUser(data.user_id))
      return; //TODO: ERROR
    channel.removeUser(data.user_id)
    Queries.getInstance().removeChannelMember(data.channel_id, data.user_id)
    let setting: Setting = new Setting(SettingType.BANNED, data.channel_id, data.user_id, new Date().getTime(), data.until);
    channel.addSetting(setting)
    Queries.getInstance().addSetting(setting)
  }

  @EventPattern('channel_disband')
  handleDisband(data: ChannelDisband) { //TODO send a message to the frontend to notify all other users (if we want to do that?)
    let channel: Channel = Channel.getChannel(data.channel_id);
    if (channel == null)
      return; //TODO: ERROR
    Channel.removeChannel(data.channel_id);
    Queries.getInstance().removeChannel(data.channel_id);
  }
}
