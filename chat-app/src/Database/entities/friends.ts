import { Entity, Column, PrimaryColumn } from 'typeorm';

@Entity()
export class Friends {
  constructor(userId: number, friendId: number, active: boolean) {
    this.userId = userId;
    this.friendId = friendId;
    this.active = active;
  }

  @PrimaryColumn() //TODO: needs to be a foreign key as well
  userId: number;

  @PrimaryColumn() //TODO: needs to be a foreign key as well
  friendId: number;

  @Column()
  active: boolean;
}
