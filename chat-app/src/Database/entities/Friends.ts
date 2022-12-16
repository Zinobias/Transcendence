<<<<<<< HEAD
import {Column, Entity, JoinColumn, ManyToMany, ManyToOne, PrimaryColumn,} from 'typeorm';
=======
import {Column, Entity, JoinColumn, ManyToOne, PrimaryColumn,} from 'typeorm';
>>>>>>> main
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

<<<<<<< HEAD
    @ManyToOne(() => user_table, (user) => user.friend)
    @JoinColumn({name: 'userId'})
    user: user_table;

    @ManyToMany(() => friends, (friend) => friend.friendId)
    @JoinColumn({name: 'friendId'})
    friend: friends;
=======
    @ManyToOne(() => user_table, (user) => user.userWithFriends)
    @JoinColumn({name: 'userId'})
    user: user_table;

    @ManyToOne(() => user_table, (user) => user.friend)
    @JoinColumn({name: 'friendId'})
    friend: user_table;
>>>>>>> main

    @Column()
    active: boolean;
}
