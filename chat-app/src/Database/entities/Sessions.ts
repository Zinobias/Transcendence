import {Column, Entity, JoinColumn, ManyToOne, PrimaryColumn} from 'typeorm';
import {user_table} from './UserTable';

@Entity()
export class sessions {
    @PrimaryColumn()
    userId: number;

    @PrimaryColumn()
    sessionCode: string;

    @Column({type: 'bigint'})
    time: number;

    @ManyToOne(() => user_table, (user) => user.sessionUser)
    @JoinColumn({name: 'userId'})
    user: user_table;
}
