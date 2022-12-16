import {Column, Entity, JoinColumn, ManyToOne, PrimaryColumn} from 'typeorm';
import {user_table} from './UserTable';

@Entity()
export class sessions {
    @PrimaryColumn()
    userId: number;

    @PrimaryColumn()
    sessionCode: string;

<<<<<<< HEAD
    @Column({default: new Date().getTime(), type: 'bigint'})
    time: number;

    @ManyToOne(() => user_table, (user) => user.session)
=======
    @Column({type: 'bigint'})
    time: number;

    @ManyToOne(() => user_table, (user) => user.sessionUser)
>>>>>>> main
    @JoinColumn({name: 'userId'})
    user: user_table;
}
