import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { games } from './Games';
import { achievements } from './Achievements';
import { blocked } from './Blocked';
import { chat_channels } from './ChatChannels';
import { chat_channel_settings } from './ChatChannelSettings';
import { chat_members } from './ChatMembers';
import { chat_message } from './ChatMessages';
import { friends } from './Friends';
import { sessions } from './Sessions';

@Entity()
export class user_table {
  constructor(userId: number, userName: string) {
    this.userId = userId;
    this.userName = userName;
  }

  @PrimaryGeneratedColumn()
  userId: number;

  @Column()
  userName: string;

  @Column({ default: new Date() })
  createAt: Date;

  @OneToMany(() => games, (game) => game.userT, { onDelete: 'CASCADE' })
  game: games[];

  @OneToMany(() => games, (game) => game.user2T, { onDelete: 'CASCADE' })
  game1: games[];

  @OneToMany(() => achievements, (achievement) => achievement.achievementUser, {
    onDelete: 'CASCADE',
  })
  achievement: achievements[];

  @OneToMany(() => blocked, (block) => block.users, { onDelete: 'CASCADE' })
  block: blocked[];

  @OneToMany(() => chat_channels, (chat) => chat.user, { onDelete: 'CASCADE' })
  chat: games[];

  @OneToMany(() => chat_channels, (chat) => chat.user2, { onDelete: 'CASCADE' })
  chat2: games[];

  @OneToMany(() => chat_channel_settings, (chat) => chat.user, {
    onDelete: 'CASCADE',
  })
  setting: chat_channel_settings[];

  @OneToMany(() => chat_members, (chat) => chat.channel, {
    onDelete: 'CASCADE',
  })
  member: chat_members[];

  @OneToMany(() => chat_message, (chat) => chat.user, {
    onDelete: 'CASCADE',
  })
  message: chat_message[];

  @OneToMany(() => friends, (friend) => friend.user, {
    onDelete: 'CASCADE',
  })
  friend: friends[];

  @OneToMany(() => sessions, (session) => session.user, {
    onDelete: 'CASCADE',
  })
  session: sessions[];
  // @JoinColumn({ name: 'avatarId' })
  // @OneToOne(() => blob, { nullable: true })
  // avatar: blob;
  //
  // @Column({ nullable: true })
  // avatarId: number;
}
