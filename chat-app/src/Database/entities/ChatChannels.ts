import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  PrimaryColumn,
  OneToMany,
  JoinColumn, OneToOne,
} from 'typeorm';
import { Channel } from '../../Objects/Channel';
import { user_table } from './UserTable';
import { chat_channel_settings } from './ChatChannelSettings';
import { chat_members } from './ChatMembers';
import { chat_message } from './ChatMessages';

@Entity()
export class chat_channels {
  constructor(channel?: Channel) {
    if (channel == undefined) return;
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

  @OneToOne(() => user_table, (user) => user.chat)
  user: user_table;

  @OneToOne(() => user_table, (user) => user.chat2, { nullable: true })
  user2: user_table;

  @OneToMany(() => chat_channel_settings, (chat) => chat.channel, {
    onDelete: 'CASCADE',
  })
  chat: chat_channel_settings[];

  @OneToMany(() => chat_members, (chat) => chat.channel, {
    onDelete: 'CASCADE',
  })
  member: chat_members[];

  @OneToMany(() => chat_message, (chat) => chat.chat, {
    onDelete: 'SET NULL',
  })
  message: chat_message[];

  @Column({ nullable: true })
  channelName: string;

  @Column()
  closed: boolean;
}
