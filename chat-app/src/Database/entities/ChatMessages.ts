import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  JoinColumn,
  PrimaryColumn, OneToMany, ManyToOne,
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

  @ManyToOne(() => chat_channels, (chat) => chat.message)
  chat: chat_channels;

  @PrimaryColumn()
  userId: number;

  @ManyToOne(() => user_table, (user) => user.message)
  user: user_table;

  @Column()
  message: string;

  @Column({ default: new Date().getTime(), type: 'bigint' })
  timestamp: number;
}
