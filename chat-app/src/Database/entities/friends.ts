import { Entity, Column, PrimaryColumn } from 'typeorm';

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

  @Column()
  active: boolean;
}
