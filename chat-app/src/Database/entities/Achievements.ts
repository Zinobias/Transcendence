import {Entity, JoinColumn, ManyToOne, PrimaryColumn} from 'typeorm';
import {user_table} from './UserTable';

@Entity()
export class achievements {
    @PrimaryColumn()
    userId: number;

    @PrimaryColumn()
    achievement: string;

    @ManyToOne(() => user_table, (user) => user.userId)
    @JoinColumn({name: 'userId'})
    user: user_table;
}
