import { Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';
import { ChatChannels } from './chatChannels';
import { UserTable } from './UserTable';

@Entity()
export class ChatMembers {
  constructor(channelId: number, userId: number) {
    this.channelId = channelId;
    this.userId = userId;
  }
  @PrimaryColumn()
  channelId: number;

  @PrimaryColumn()
  userId: number;

  @ManyToOne(() => ChatChannels, (channel) => channel.channelId)
  @JoinColumn({ name: 'channelId' })
  channel: ChatChannels;

  @ManyToOne(() => UserTable, (user) => user.userId)
  @JoinColumn({ name: 'userId' })
  user: UserTable;
}
