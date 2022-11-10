import { Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';
import { UserTable } from './UserTable';

@Entity()
export class achievements {
  @PrimaryColumn()
  userId: number;

  @PrimaryColumn()
  achievement: string;

  @ManyToOne(() => UserTable, (user) => user.userId) //TODO: needs to be a foreign key as well
  @JoinColumn({ name: 'userId' })
  user: UserTable;

  @ManyToOne(() => achievements, (achievement) => achievement.achievement)
  @JoinColumn({ name: 'achievement' })
  achievementUser: achievements;
}
