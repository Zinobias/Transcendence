import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class ChatChannels {
  @PrimaryGeneratedColumn()
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
