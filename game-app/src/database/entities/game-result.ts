import { Entity, Column, PrimaryColumn } from 'typeorm';

@Entity('game_result')
export class GameResult {
	constructor(uids : number[], gameId : number, playerScores : number[]) {
		this.userId1 = uids[0];
		this.userId2 = uids[1];
		this.gameId = gameId;
		this.player1Score = playerScores[0];
		this.player2Score = playerScores[1];
		this.winnerId = playerScores[0] > playerScores[1] ? uids[0] : uids[1];
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
}
