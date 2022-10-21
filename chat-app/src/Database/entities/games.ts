import { Entity, Column, ManyToOne, PrimaryColumn, JoinColumn } from 'typeorm';
import { UserTable } from './UserTable';

@Entity({ name: 'games' })
export class games {
  @PrimaryColumn()
  gameId: number;

  @PrimaryColumn()
  user1: number;

  @PrimaryColumn()
  user2: number;

  @ManyToOne(() => games) //TODO: needs to be a foreign key as well
  @JoinColumn({ name: 'gameId' })
  game: games;

  @ManyToOne(() => UserTable, (user) => user.userId) //TODO: needs to be a foreign key
  @JoinColumn({ name: 'user1' })
  userT: UserTable;

  @ManyToOne(() => UserTable, (user) => user.userId) //TODO: needs to be a foreign key
  @JoinColumn({ name: 'user2' })
  user2T: UserTable;

  @Column()
  user1score: number;

  @Column()
  user2score: number;
}
