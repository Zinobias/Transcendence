import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';
import { Message } from '../../Objects/Message';

@Entity()
export class chatMessage {
  constructor(channelId: number, message: Message) {
    this.channelId = channelId;
    this.message = message.message;
    this.userId = message.sender;
    this.timestamp = message.timestamp;
  }
  @PrimaryGeneratedColumn()
  messageId: number;

  @Column() //TODO: needs to be a foreign key
  channelId: number;

  @Column() //TODO: needs to be a foreign key
  userId: number;

  @Column()
  message: string;

  @Column()
  timestamp: number;
}
