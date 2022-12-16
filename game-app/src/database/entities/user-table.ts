import {Entity, Column, PrimaryColumn} from 'typeorm';

@Entity('users')
export class UserTable {
	constructor(userId: number, userName: string) {
		this.userId = userId;
		this.userName = userName;
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

	// @OneToMany(() => Sessions, (sessions: Sessions) => sessions.userId)
	// public sessions: Sessions[];

	// @Column({ type: 'longblob' })
	// avatar: Buffer;
}
