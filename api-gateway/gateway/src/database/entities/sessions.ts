import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';
import { UserTable } from './user-table';

@Entity()
export class Sessions {
	@PrimaryColumn()
	userId: number;

	@PrimaryColumn()
	sessionCode: string;

	@Column({ default: new Date().getTime() })
	time: Long;

	@ManyToOne(() => UserTable, (user) => user.userId)
	@JoinColumn({ name: 'userId' })
	user: UserTable;
}
