import { Entity, Column, PrimaryColumn } from 'typeorm';

@Entity('users')
export class user_table {
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

	// @JoinColumn({ name: 'avatarId' })
	// @OneToOne(() => blob, { nullable: true })
	// avatar: blob;
	//
	// @Column({ nullable: true })
	// avatarId: number;
}
