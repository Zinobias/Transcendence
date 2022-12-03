import {Entity, Column, PrimaryColumn, OneToMany} from 'typeorm';
import {Sessions} from "./sessions";
import {Tfa} from "./tfa";

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

	@OneToMany(() => Sessions, (session) => session.user, {onDelete: 'CASCADE'})
	session: Sessions[];

	@OneToMany(() => Tfa, (tfa) => tfa.user, {onDelete: 'CASCADE'})
	tfa: Tfa[];

	@Column({nullable: true, type: 'text'})
	avatar: string;
}
