import {Entity, JoinColumn, ManyToOne, PrimaryColumn} from 'typeorm';
import {user_table} from './UserTable';

@Entity()
export class blocked {
    constructor(userId: number, blockId) {
        this.userId = userId;
        this.blockId = blockId;
    }

    @PrimaryColumn()
    userId: number;

    @PrimaryColumn()
    blockId: number;

    @ManyToOne(() => user_table, (user) => user.blockingUsers)
    @JoinColumn({name: 'user_id'})
    users: user_table;

    @ManyToOne(() => user_table, (user) => user.block)
    @JoinColumn({name: 'blockId'})
    blocked: user_table;
}
