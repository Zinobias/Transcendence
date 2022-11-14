import { Entity, Column, OneToOne, PrimaryColumn, JoinColumn } from 'typeorm';
import { user_table } from './UserTable';

@Entity()
export class games {
  @PrimaryColumn()
  gameId: number;

  @Column()
  user1: number;

  @Column()
  user2: number;

//   @ManyToOne(() => games)
//   // @JoinColumn({ name: 'gameId' })
//   game: games;

  @OneToOne(() => user_table, (user) => user.userId)
  @JoinColumn({ name: 'user1' })
  userT: user_table;

  @OneToOne(() => user_table, (user) => user.userId)
  @JoinColumn({ name: 'user2' })
  user2T: user_table;

  @Column()
  user1score: number;

  @Column()
  user2score: number;
}
