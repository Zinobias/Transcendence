import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';
import { UserTable } from './user-table';

@Entity()
export class Tfa {

    constructor(user_id: number, tfa_code: string) {
        this.user_id = user_id;
        this.tfa_code = tfa_code;
    }

    @PrimaryColumn()
    user_id: number;

    @Column()
    tfa_code: string;

    @ManyToOne(() => UserTable, (user) => user.tfa)
    @JoinColumn({ name: 'user_id' })
    user: UserTable;
}
