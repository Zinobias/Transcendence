import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';
import { UserTable } from './UserTable';
@Entity()
export class Sessions {
  @PrimaryColumn()
  userId: number;

  @PrimaryColumn()
  sessionCode: string;

  @Column({ default: new Date() })
  time: Date;

  @ManyToOne(() => UserTable, (user) => user.userId)
  @JoinColumn({ name: 'userId' })
  user: UserTable;
}
