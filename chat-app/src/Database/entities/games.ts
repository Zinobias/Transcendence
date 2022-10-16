import { Entity, Column } from 'typeorm';

@Entity({ name: 'games' })
export class games {
  @Column()
  userId: number;

  @Column()
  user1: number;

  @Column()
  user2: number;

  @Column()
  user1score: number;

  @Column()
  user2score: number;
}