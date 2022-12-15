import {InsertResult, Repository} from 'typeorm';
import {Inject, Injectable, Logger} from '@nestjs/common';
import {Database} from './data-source';
import {UserTable} from './entities/user-table';
import { DBGameResult } from './entities/game-result';

@Injectable()
export class Queries {

    private readonly logger = new Logger('queries');

    constructor(@Inject(Database) private database: Database) {
    }

	public async storeGameResult(uids : number[], gameId : number, playerScores : number[]) {
		const dataSource = await this.database.getDataSource();
		const gameRepository = dataSource.getRepository(DBGameResult);

		gameRepository.insert(new DBGameResult(uids[0], uids[1], gameId, playerScores[0], playerScores[1]))
		.catch((e) => this.logger.warn('Inserting gameResult into DB went wrong.'));
	}

	public async getLeaderboard() {
		const dataSource = await this.database.getDataSource();
		const gameRepository = dataSource.getRepository(DBGameResult);
		const res = await gameRepository.query(`SELECT game_result."winnerId", COUNT(game_result."winnerId") FROM game_result GROUP BY game_result."winnerId"`);
		this.logger.warn(`RESULT is ${res}`);
		return (res);
	}

	// {winnerId: userId, count : 72}
	// {winnerId: userId, count : 9}

	public async getUserGameHistory(uid : number) {
		const dataSource = await this.database.getDataSource();
		const gameRepository = dataSource.getRepository(DBGameResult);

		gameRepository.findBy([{ userId1 : uid }, { userId2 : uid }])
		.catch((e) => this.logger.warn('Retrieving user matchhistory went wrong.'));
	}

	public async getGameId() {
		const dataSource = await this.database.getDataSource();
		const gameRepository = dataSource.getRepository(DBGameResult);
		let res;

		try {
			res = await gameRepository.createQueryBuilder()
			.select(`game_result.gameId`)
			.from(DBGameResult, 'game_result')
			.addOrderBy(`game_result.gameId`, 'DESC')
			.limit(1)
			.execute()
		}
		catch(e) {
			this.logger.warn(`Grabbing gameId went wrong : ${e}`);
			return (-1);
		}
		this.logger.debug(`Grabbing gameId   : ${res}`);
		if (res[0] === undefined)
			return (0);
		else
			return (res[0].game_result_gameId + 1);
	}

}
