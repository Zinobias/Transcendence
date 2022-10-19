import { Entity, Column, PrimaryColumn } from 'typeorm';

@Entity({ name: 'games' })
export class games {
  @PrimaryColumn() //TODO: needs to be a foreign key as well
  gameId: number;

  @Column() //TODO: needs to be a foreign key
  user1: number;

  @Column() //TODO: needs to be a foreign key
  user2: number;

  @Column()
  user1score: number;

  @Column()
  user2score: number;
}
