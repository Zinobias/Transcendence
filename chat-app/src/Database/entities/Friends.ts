import {
  Entity,
  Column,
  PrimaryColumn,
  ManyToOne,
  ManyToMany,
  JoinColumn,
} from 'typeorm';
import { user_table } from './UserTable';

@Entity()
export class friends {
  constructor(userId: number, friendId: number, active: boolean) {
    this.userId = userId;
    this.friendId = friendId;
    this.active = active;
  }

  @PrimaryColumn()
  userId: number;

  @PrimaryColumn()
  friendId: number;

  @ManyToOne(() => user_table, (user) => user.userId)
  @JoinColumn({ name: 'userId' })
  user: user_table;

  @ManyToMany(() => friends, (friend) => friend.friendId)
  @JoinColumn({ name: 'friendId' })
  friend: friends;

  @Column()
  active: boolean;
}
