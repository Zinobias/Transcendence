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
import { user_table } from './UserTable';

@Entity()
export class chat_channels {
  constructor(channel?: Channel) {
    if (channel == undefined) return;
    console.log(channel);
    // this.channelId = channel.channelId;
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

  @OneToMany(() => user_table, (user) => user.userId)
  @JoinColumn({ name: 'ownerId' })
  user: user_table;

  @ManyToOne(() => user_table, (user) => user.userId, { nullable: true })
  @JoinColumn({ name: 'owner2Id' })
  user2: user_table;

  @Column()
  channelName: string;

  @Column()
  closed: boolean;
}
