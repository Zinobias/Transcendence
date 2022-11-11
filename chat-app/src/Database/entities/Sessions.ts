import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';
import { user_table } from './UserTable';

@Entity()
export class sessions {
  @PrimaryColumn()
  userId: number;

  @PrimaryColumn()
  sessionCode: string;

  @Column({ default: new Date() })
  time: Date;

  @ManyToOne(() => user_table, (user) => user.userId)
  @JoinColumn({ name: 'userId' })
  user: user_table;
}
