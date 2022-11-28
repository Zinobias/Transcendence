import { Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';
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

  @ManyToOne(() => chat_channels, (channel) => channel.member)
  // @JoinColumn({ name: 'channelId' })
  channel: chat_channels;

  @ManyToOne(() => user_table, (user) => user.member)
  // @JoinColumn({ name: 'userId' })
  user: user_table;
}
