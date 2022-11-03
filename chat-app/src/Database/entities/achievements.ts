import { Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';
import { UserTable } from './UserTable';

@Entity()
export class achievements {
  @PrimaryColumn()
  userId: number;

  @PrimaryColumn()
  achievement: string;

  @ManyToOne(() => UserTable, (user) => user.userId)
  @JoinColumn({ name: 'userId' })
  user: UserTable;

  @ManyToOne(() => achievements, (achievement) => achievement.achievement)
  @JoinColumn({ name: 'achievement' })
  achievementUser: achievements;
}
