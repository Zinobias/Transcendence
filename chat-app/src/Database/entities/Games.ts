import {Entity, Column, ManyToOne, PrimaryColumn, JoinColumn, OneToOne} from 'typeorm';
import { user_table } from './UserTable';

@Entity()
export class games {
  @PrimaryColumn()
  gameId: number;

  @Column()
  user1score: number;

  @Column()
  user2score: number;

  @OneToOne(() => user_table, (user) => user.game)
  userT: user_table;

  @OneToOne(() => user_table, (user) => user.game1)
  user2T: user_table;
}
