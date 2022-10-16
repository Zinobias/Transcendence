import { Entity, Column } from 'typeorm';

@Entity()
export class ChatMembers {
  @Column()
  chanelId: number;

  @Column()
  userId: number;
}
