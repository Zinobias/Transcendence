import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  PrimaryColumn,
} from 'typeorm';
import { Message } from '../../Objects/Message';
import { chat_channels } from './ChatChannels';
import { user_table } from './UserTable';

@Entity()
export class chat_message {
  constructor(channelId: number, message: Message) {
    if (message === undefined) return;
    this.channelId = channelId;
    this.message = message.message;
    this.userId = message.sender;
    this.timestamp = message.timestamp;
  }
  @PrimaryGeneratedColumn()
  messageId: number;

  @PrimaryColumn()
  channelId: number;

  @ManyToOne(() => chat_channels, (chat) => chat.channelId)
  // @JoinColumn({ name: 'channelId' })
  chat: chat_channels;

  @PrimaryColumn()
  userId: number;

  @ManyToOne(() => user_table, (user) => user.userId)
  // @JoinColumn({ name: 'userId' })
  user: user_table;

  @Column()
  message: string;

  @Column()
  timestamp: number;
}
