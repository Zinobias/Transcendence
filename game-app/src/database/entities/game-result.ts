import { Entity, Column, PrimaryColumn, OneToMany, JoinColumn } from 'typeorm';
import { UserTable } from './user-table';

@Entity('game_result')
export class DBGameResult {
	constructor(uid1 : number, uid2 : number, gameId : number, playerScore1 : number, playerScore2 : number) {
		this.userId1 = uid1;
		this.userId2 = uid2;
		this.gameId = gameId;
		this.player1Score = playerScore1;
		this.player2Score = playerScore2;
		this.winnerId = playerScore1 > playerScore2 ? uid1 : uid2;
	}

	@PrimaryColumn()
	gameId : number;

	@Column()
	userId1: number;

	@Column()
	userId2: number;

	@Column()
	winnerId : number;
	
	@Column()
	player1Score : number;

	@Column()
	player2Score : number;

	@Column({ default: new Date().getUTCMilliseconds()})
	createAt: number;

	@OneToMany(() => UserTable, (user) => user.userId)
	@JoinColumn({ name: 'userId1' })
	user1: UserTable;

	@OneToMany(() => UserTable, (user) => user.userId)
	@JoinColumn({ name: 'userId2' })
	user2: UserTable;

	@OneToMany(() => UserTable, (user) => user.userId)
	@JoinColumn({ name: 'winnerId' })
	user3: UserTable;
}
