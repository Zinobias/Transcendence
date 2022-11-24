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
import {Logger} from "@nestjs/common";

@Entity()
export class chat_channels {
  private logger = new Logger('Chat Channel Entity');
  constructor(channel?: Channel) {
    if (channel == undefined)
      return;
    this.logger.debug(`Initializing channel: ${channel}`);
    // this.channelId = channel.channelId;
    this.ownerId = channel.owner;
    this.owner2Id = channel.otherOwner;
    this.channelName = channel.channelName;
    this.closed = channel.closed;
    this.password = channel.password;
    this.visible = channel.visible;
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

  @Column({ nullable: true })
  password: string

  @Column()
  visible: boolean
}
