import {Entity, Column, PrimaryColumn, OneToMany} from 'typeorm';
import {Sessions} from "./sessions";
import {Tfa} from "./tfa";

@Entity('users')
export class UserTable {
	constructor(userId: number, userName: string, avatar: any) {
		this.userId = userId;
		this.userName = userName;
		this.avatar = avatar;
		this.createAt = new Date().getTime()
	}

	@PrimaryColumn()
	userId: number;

	@Column()
	userName: string;

	@Column({type: 'bigint'})
	createAt: number;

	@Column({nullable: true, type: 'text'})
	avatar: string;

	@OneToMany(() => Sessions, (session) => session.user, {onDelete: 'CASCADE'})
	session: Sessions[];

	@OneToMany(() => Tfa, (tfa) => tfa.user, {onDelete: 'CASCADE'})
	tfa: Tfa[];
}
