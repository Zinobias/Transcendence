import { Entity, PrimaryColumn } from 'typeorm';

@Entity()
export class ChatMembers {
  constructor(channelId: number, userId: number) {
    this.chanelId = channelId;
    this.userId = userId;
  }
  @PrimaryColumn()
  chanelId: number;

  @PrimaryColumn()
  userId: number;
}
