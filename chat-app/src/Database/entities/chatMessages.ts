import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  PrimaryColumn,
} from 'typeorm';
import { Message } from '../../Objects/Message';
import { ChatChannels } from './chatChannels';
import { UserTable } from './UserTable';

@Entity()
export class chatMessage {
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

  @ManyToOne(() => ChatChannels, (chat) => chat.channelId)
  @JoinColumn({ name: 'channelId' })
  @PrimaryColumn()
  userId: number;

  @ManyToOne(() => UserTable, (user) => user.userId)
  @JoinColumn({ name: 'userId' })
  @Column()
  message: string;

  @Column()
  timestamp: number;
}
