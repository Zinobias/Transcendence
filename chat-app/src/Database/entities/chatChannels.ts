import { Entity, Column } from 'typeorm';

@Entity()
export class ChatChannels {
  @Column()
  chanelId: number;

  @Column()
  ownerId: number;

  @Column()
  owner2id: number;

  @Column()
  chanelName: string;

  @Column()
  closed: boolean;
}
