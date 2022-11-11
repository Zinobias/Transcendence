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
    this.closed = channel.closed;
  }
  @PrimaryGeneratedColumn()
  channelId: number;

  @PrimaryColumn()
  ownerId: number;

  @Column({ nullable: true })
  owner2Id: number;

  @OneToMany(() => user_table, (user) => user.userId)
  @JoinColumn({ name: 'ownerId' })
  user: user_table;

  @ManyToOne(() => user_table, (user) => user.userId, { nullable: true })
  @JoinColumn({ name: 'owner2Id' })
  user2: user_table;

  @Column({ nullable: true })
  channelName: string;

  @Column()
  closed: boolean;
}
