import {Entity, Column, PrimaryColumn, OneToMany} from 'typeorm';
import {Sessions} from "./sessions";

@Entity('users')
export class UserTable {
	constructor(userId: number, userName: string) {
		this.userId = userId;
		this.userName = userName;
	}

	@PrimaryColumn()
	userId: number;

	@Column()
	userName: string;

	@Column({ default: new Date().getTime(), type: 'bigint' })
	createAt: number;

	@OneToMany(() => Sessions, (session) => session.user, {
		onDelete: 'CASCADE',
	})
	session: Sessions[];

	@Column({ nullable: true, type: 'bytea' })
	avatar: Uint8Array;
}
