import {Column, Entity, JoinColumn, ManyToOne, PrimaryColumn,} from 'typeorm';
import {user_table} from './UserTable';

@Entity()
export class friends {
    constructor(userId: number, friendId: number, active: boolean) {
        this.userId = userId;
        this.friendId = friendId;
        this.active = active;
    }

    @PrimaryColumn()
    userId: number;

    @PrimaryColumn()
    friendId: number;

    @ManyToOne(() => user_table, (user) => user.userWithFriends)
    @JoinColumn({name: 'userId'})
    user: user_table;

    @ManyToOne(() => user_table, (user) => user.friend)
    @JoinColumn({name: 'friendId'})
    friend: user_table;

    @Column()
    active: boolean;
}
