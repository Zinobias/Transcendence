import { Entity, Column } from 'typeorm';

@Entity()
export class ChatMembers {
  @Column()/p
  chanelId: number;

  @Column()/p
  userId: number;
}
