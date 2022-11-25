import {Entity, JoinColumn, OneToMany, PrimaryColumn} from 'typeorm';
import { chat_channels } from './ChatChannels';
import { user_table } from './UserTable';

@Entity()
export class chat_members {
  constructor(channelId: number, userId: number) {
    this.channelId = channelId;
    this.userId = userId;
  }
  @PrimaryColumn()
  channelId: number;

  @PrimaryColumn()
  userId: number;

  @OneToMany(() => chat_channels, (channel) => channel.channelId)
  @JoinColumn({ name: 'channelId' })
  channel: chat_channels;

  @OneToMany(() => user_table, (user) => user.userId)
  @JoinColumn({ name: 'userId' })
  user: user_table;
}
