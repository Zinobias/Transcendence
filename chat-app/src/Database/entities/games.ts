import { Entity, Column, ManyToOne, PrimaryColumn, JoinColumn } from 'typeorm';
import { UserTable } from './UserTable';

@Entity()
export class games {
  @PrimaryColumn()
  gameId: number;

  @PrimaryColumn()
  user1: number;

  @PrimaryColumn()
  user2: number;

  @ManyToOne(() => games)
  @JoinColumn({ name: 'gameId' })
  game: games;

  @ManyToOne(() => UserTable, (user) => user.userId)
  @JoinColumn({ name: 'user1' })
  userT: UserTable;

  @ManyToOne(() => UserTable, (user) => user.userId)
  @JoinColumn({ name: 'user2' })
  user2T: UserTable;

  @Column()
  user1score: number;

  @Column()
  user2score: number;
}
