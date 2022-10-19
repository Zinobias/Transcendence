import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';
import { Channel } from '../../Objects/Channel';

@Entity()
export class ChatChannels {
  constructor(channel: Channel) {
    this.channelId = channel.channelId;
    this.ownerId = channel.owner;
    this.owner2id = channel.otherOwner;
    this.channelName = channel.channelName;
  }
  @PrimaryGeneratedColumn()
  channelId: number;

  @Column() //TODO: needs to be a foreign key
  ownerId: number;

  @Column() //TODO: needs to be a foreign key and nullable
  owner2id: number;

  @Column()
  channelName: string;

  @Column()
  closed: boolean;
}
