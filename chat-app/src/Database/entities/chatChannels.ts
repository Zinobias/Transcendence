import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  PrimaryColumn,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { Channel } from '../../Objects/Channel';
import { UserTable } from './UserTable';

@Entity()
export class ChatChannels {
  constructor(channel?: Channel) {
    if (channel == undefined) return;
    console.log(channel);
    this.channelId = channel.channelId;
    this.ownerId = channel.owner;
    this.owner2Id = channel.otherOwner;
    this.channelName = channel.channelName;
  }
  @PrimaryGeneratedColumn()
  channelId: number;

  @PrimaryColumn()
  ownerId: number;

  @PrimaryColumn()
  owner2Id: number;

  @OneToMany(() => UserTable, (user) => user.userId)
  @JoinColumn({ name: 'ownerId' })
  user: UserTable;

  @ManyToOne(() => UserTable, (user) => user.userId, { nullable: true })
  @JoinColumn({ name: 'owner2Id' })
  user2: UserTable;

  @Column()
  channelName: string;

  @Column()
  closed: boolean;
}
