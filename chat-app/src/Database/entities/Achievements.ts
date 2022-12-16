import {Entity, JoinColumn, ManyToOne, PrimaryColumn} from 'typeorm';
import {user_table} from './UserTable';

@Entity()
export class achievements {
    @PrimaryColumn()
    userId: number;

    @PrimaryColumn()
    achievement: string;

<<<<<<< HEAD
    @ManyToOne(() => user_table, (user) => user.achievement)
    @JoinColumn({name: 'userId'})
    user: user_table;

    @ManyToOne(() => achievements, (achievement) => achievement.achievement)
    @JoinColumn({name: 'achievement'})
    achievementUser: achievements;
=======
    @ManyToOne(() => user_table, (user) => user.userId)
    @JoinColumn({name: 'userId'})
    user: user_table;
>>>>>>> main
}
