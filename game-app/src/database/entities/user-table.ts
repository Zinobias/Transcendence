import {Entity, Column, PrimaryColumn, Long} from 'typeorm';

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

	@Column({ default: new Date().getTime(), type: 'bigint'})
	createAt: number;

	@Column({nullable: true, type: 'text'})
	avatar: string;

	// @OneToMany(() => Sessions, (sessions: Sessions) => sessions.userId)
	// public sessions: Sessions[];

	// @Column({ type: 'longblob' })
	// avatar: Buffer;
}
