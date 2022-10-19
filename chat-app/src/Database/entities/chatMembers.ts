import { Entity, PrimaryColumn } from 'typeorm';

@Entity()
export class ChatMembers {
  constructor(channelId: number, userId: number) {
    this.channelId = channelId;
    this.userId = userId;
  }
  @PrimaryColumn()
  channelId: number; //TODO: needs to be a foreign key as well

  @PrimaryColumn() //TODO: needs to be a foreign key
  userId: number;
}
