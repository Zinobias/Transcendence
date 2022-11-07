import { Inject, Injectable, Logger } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { ClientProxy, ClientProxyFactory, EventPattern, Payload, Transport } from '@nestjs/microservices';
import { createGameDTO } from './dto/dto';
import { gameMatchmakingEntity } from './event-objects/events.objects';
import { Game } from './game-class';
import { GameEndedData, gameModes } from './game-object-interfaces';
import { GameResult } from './game-objects/game-object-interfaces';
const logger = new Logger("AppService");
@Injectable()
export class AppService {
	// private matchmakingQueue	: gameMatchmakingEntity[];
	private matchMakingQueue : Map<string , string[]>;
	/**
	 * 
	 * @param eventEmitter Constructor injection. Gets injected by the module.
	 */
	constructor(private eventEmitter : EventEmitter2, @Inject('gateway') private readonly client : ClientProxy) {};
	async emitEvent(pattern : string, payload : {}) {
		this.eventEmitter.emit(pattern, payload);
	}

	
	addToQueue(@Payload() payload : gameMatchmakingEntity) {
		this.matchMakingQueue.get(payload.gameMode)?.push(payload.userID);
	}
	
	findMatch() {
		for (let gameMode of gameModes) {
			if (this.matchMakingQueue.get(gameMode)?.length as number % 2) {
				let gameDTO : createGameDTO = {
					player1UID 	: this.matchMakingQueue.get(gameMode)?.pop() as string,
					player2UID	: this.matchMakingQueue.get(gameMode)?.pop() as string,
					gameMode 	: gameMode,
				}
				this.client.emit("game.found", gameDTO);
				logger.log("Game found event emitted to client");
			}
		}
		// TODO: Do we have to add this to the database?
	}
	
	/**
	 * Will create a game instance.
	 * @param DTO Data transfer object {	
	 * player1UID	: string;
	 * player2UID	: string;
	 * gameMode		: string;}
	 * @param gameID ID of the game : number
	 * @returns void
	 */
	@EventPattern("game.create")
	async createGame(DTO : createGameDTO, gameID : number) {
		let newGame : Game = new Game(this.eventEmitter , this.client ,[DTO.player1UID, DTO.player2UID], DTO.gameMode, gameID);
		logger.log("New game instance has been created");
		this.addNewGameToDatabase(DTO).then(() => {
			logger.log("new game instance added to DB");
		});
	}
	
	@EventPattern("game.ended")
	async gameFinishedHandler(@Payload() gameResult : GameEndedData) {
		this.client.emit("frontend.game.ended", gameResult);
		logger.log("Game-ended event caught & emitted to frontend");
		this.addGameResultToDatabase(gameResult.payload).then(() => {
			logger.log("GameID: [" + gameResult.gameID + "] Game result has been added to the database");
		})
	}

	async addNewGameToDatabase(newGame : createGameDTO) {
		// TODO : add new game to db
	}
	async addGameResultToDatabase(gameresult : GameResult) {
		// logger.log("GameID: [" + gameresult.gameID + "] Game result has been added to the database");
		// TODO: Go wild abby 
		/**
		 * Update database gameID
		 * Add game to database.
		 * maybe set a state or so?
		 * it will have a winner field, so maybe set it to a default value when not defined.
		 */
		// {
			//	gameId : number;
			//	player1 : string;
			//	player2 : string;
			//	player1Score : number;
			//	player2Score : number;
			//	winner : string;
			//	}
		}
}
