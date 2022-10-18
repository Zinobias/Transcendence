import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';
import { Message } from '../../Objects/Message';

@Entity()
export class chatMessage {
  constructor(message: Message) {
    this.message = message.message;
    this.userId = message.sender;
    this.timestamp = message.timestamp;
  }
  @PrimaryGeneratedColumn()
  messageId: number;

  @Column()
  chanelId: number;

  @Column()
  userId: number;

  @Column()
  message: string;

  @Column()
  timestamp: number;
}
