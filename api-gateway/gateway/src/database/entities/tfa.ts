import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';
import { UserTable } from './user-table';

@Entity()
export class Tfa {
    @PrimaryColumn()
    user_id: number;

    @Column()
    tfa_code: string;

    @ManyToOne(() => UserTable, (user) => user.userId)
    @JoinColumn({ name: 'userId' })
    user: UserTable;
}
