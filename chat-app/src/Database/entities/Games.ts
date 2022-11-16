import { Entity, Column, ManyToOne, PrimaryColumn, JoinColumn } from 'typeorm';
import { user_table } from './UserTable';

@Entity()
export class games {
  @PrimaryColumn()
  gameId: number;

  @PrimaryColumn()
  user1: number;

  @PrimaryColumn()
  user2: number;

  @Column()
  user1score: number;

  @Column()
  user2score: number;

  // @ManyToOne(() => games)
  // @JoinColumn({ name: 'gameId' })
  // game: games;

  @ManyToOne(() => user_table, (user) => user.game)
  @JoinColumn({ name: 'user1' })
  userT: user_table;

  @ManyToOne(() => user_table, (user) => user.game1)
  @JoinColumn({ name: 'user2' })
  user2T: user_table;
}
