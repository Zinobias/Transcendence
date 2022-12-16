<<<<<<< HEAD
import { Column, Entity, OneToMany, PrimaryColumn } from 'typeorm';
import { Sessions } from './sessions';

@Entity('users')
export class UserTable {
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
=======
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
>>>>>>> main

  constructor(userId: number, userName: string) {
    this.userId = userId;
    this.userName = userName;
  }
  @Column({ nullable: true, type: 'bytea' })
  avatar: Uint8Array;
  // @OneToMany(() => Sessions, (sessions: Sessions) => sessions.userId)
  // public sessions: Sessions[];

<<<<<<< HEAD
  // @Column({ type: 'longblob' })
  // avatar: Buffer;
=======
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
>>>>>>> main
}
