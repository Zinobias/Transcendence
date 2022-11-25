import {InsertResult} from 'typeorm';
import {Inject, Injectable, Logger} from '@nestjs/common';
import {Database} from './data-source';
import {UserTable} from './entities/user-table';
import { GameResult } from './entities/game-result';

@Injectable()
export class Queries {

    private readonly logger = new Logger('queries');

    constructor(@Inject(Database) private database: Database) {
    }

	public async storeGameResult(uids : number[], gameId : number, playerScores : number[]) {
		const dataSource = await this.database.getDataSource();
		const gameRepository = dataSource.getRepository(GameResult);

		gameRepository.insert(new GameResult(uids[0],uids[1], gameId, playerScores[0], playerScores[1]))
		.catch((e) => this.logger.warn('Inserting gameResult into DB went wrong.'));
	}

	public async getLeaderboard() {
		const dataSource = await this.database.getDataSource();
		const gameRepository = dataSource.getRepository(GameResult);

		let res = await gameRepository.createQueryBuilder()
		.select('game_result.winnerId, COUNT(game_result.winnerId)')
		.from(GameResult, 'game_result')
		.addGroupBy('game_result.winnerId')
		.execute()
		.catch((e) => this.logger.warn(`Inserting gameResult into DB went wrong. error msg : ${e}`));

		this.logger.warn(`RESULT is ${res}`);
		// 'SELECT winnerId, COUNT(winnerId) FROM game_result GROUP BY winnerId'
		// .catch((e) => this.logger.warn('Inserting gameResult into DB went wrong.'));
		// gameRepository.findAndCountBy({winnerId})
	}

	public async getUserGameHistory(uid : number) {
		const dataSource = await this.database.getDataSource();
		const gameRepository = dataSource.getRepository(GameResult);

		gameRepository.findBy([{ userId1 : uid }, { userId2 : uid }])
		.catch((e) => this.logger.warn('Retrieving user matchhistory went wrong.'));
	}
}
