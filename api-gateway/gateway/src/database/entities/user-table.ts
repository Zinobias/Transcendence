import {Column, Entity, OneToMany, PrimaryColumn} from 'typeorm';
import {Sessions} from './sessions';

@Entity('users')
export class UserTable {
    @PrimaryColumn()
    userId: number;
    @Column()
    userName: string;
    @Column({default: new Date().getTime(), type: 'bigint'})
    createAt: number;
    @OneToMany(() => Sessions, (session) => session.user, {
        onDelete: 'CASCADE',
    })
    session: Sessions[];

    constructor(userId: number, userName: string) {
        this.userId = userId;
        this.userName = userName;
    }

    // @OneToMany(() => Sessions, (sessions: Sessions) => sessions.userId)
    // public sessions: Sessions[];

    // @Column({ type: 'longblob' })
    // avatar: Buffer;
}
