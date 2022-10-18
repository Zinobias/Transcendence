import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';
import { Channel } from '../../Objects/Channel';

@Entity()
export class ChatChannels {
  constructor(channel: Channel) {
    this.chanelId = channel.channelId;
    this.ownerId = channel.owner;
    this.owner2id = channel.otherOwner;
    this.chanelName = channel.channelName;
  }
  @PrimaryGeneratedColumn()
  chanelId: number;

  @Column()
  ownerId: number;

  @Column()
  owner2id: number;

  @Column()
  chanelName: string;

  @Column()
  closed: boolean;
}
