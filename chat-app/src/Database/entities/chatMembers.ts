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
  channel: ChatChannels; //TODO: needs to be a foreign key as well

  @ManyToOne(() => UserTable, (user) => user.userId) //TODO: needs to be a foreign key
  @JoinColumn({ name: 'userId' })
  user: UserTable;
}
