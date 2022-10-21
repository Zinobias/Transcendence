import {Entity, Column, PrimaryColumn, ManyToOne, ManyToMany, JoinColumn} from 'typeorm';
import { UserTable } from './UserTable';
import { Friend } from '../../Objects/Friend';

@Entity()
export class Friends {
  constructor(userId: number, friendId: number, active: boolean) {
    this.userId = userId;
    this.friendId = friendId;
    this.active = active;
  }

  @PrimaryColumn()
  userId: number;

  @PrimaryColumn()
  friendId: number;

  @ManyToOne(() => UserTable, (user) => user.userId) //TODO: needs to be a foreign key as well
  @JoinColumn({ name: 'userId' })
  user: UserTable;

  @ManyToMany(() => Friends, (friend) => friend.friendId) //TODO: needs to be a foreign key as well
  @JoinColumn({ name: 'friendId' })
  friend: Friends;

  @Column()
  active: boolean;
}
