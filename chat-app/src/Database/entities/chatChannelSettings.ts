import {Entity, Column, PrimaryColumn, ManyToOne, JoinColumn} from 'typeorm';
import { Setting } from '../../Objects/Setting';
import { SettingType } from '../../Enums/SettingType';
import { ChatChannels } from './chatChannels';
import { UserTable } from './UserTable';

@Entity()
export class ChatChannelSettings {
  constructor(setting: Setting) {
    this.channelId = setting.channelId;
    this.affectedUser = setting.userId;
    this.from = setting.from;
    this.until = setting.until;
    this.setting = setting.setting;
  }

  @PrimaryColumn()
  channelId: number;

  @ManyToOne(() => ChatChannels, (chat) => chat.channelId) //TODO: needs to be a foreign key as well
  @JoinColumn({ name: 'channelId' })
  channel: ChatChannels;

  @PrimaryColumn()
  affectedUser: number;

  @ManyToOne(() => UserTable, (user) => user.userId) //TODO: needs to be a foreign key as well
  @JoinColumn({ name: 'affectedUser' })

  @Column('longtext')
  from: number;

  @Column('longtext')
  until: number;

  @PrimaryColumn()
  setting: SettingType;
}
