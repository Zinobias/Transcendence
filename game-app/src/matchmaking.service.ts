import { Inject, Injectable, Logger } from '@nestjs/common';
import { EventEmitter2, OnEvent } from '@nestjs/event-emitter';
import { ClientProxy, ClientProxyFactory, EventPattern, Payload, Transport } from '@nestjs/microservices';
import { CreateGameDTO, GameInfo, outDTO } from './dto/dto';
import { gameMatchmakingEntity } from './event-objects/events.objects';
import { Game } from './game-class';
import { GameEndedData, gameModes } from './game-object-interfaces';
import { GameResult } from './game-objects/game-object-interfaces';
const logger = new Logger("AppService");


@Injectable()
export class MatchMakingService {
	private matchMakingQueue	: Map<string , string[]>;
	private gameId 				: number;
	private gameList			: GameInfo[];


	/**
	 * 
	 * @param eventEmitter Constructor injection. Gets injected by the module.
	 */
	constructor(private eventEmitter : EventEmitter2, @Inject('gateway') private readonly client : ClientProxy) {};
	async emitEvent(pattern : string, payload : {}) {
		this.eventEmitter.emit(pattern, payload);
		this.gameId = 0;
	}

	public isInGame(uid : string) : boolean{
		if (this.getGameList().find((e) => {
			return ((e.player1 === uid || e.player2 === uid));
		})!== undefined)
			return true;
		return false;
	}

	public getUserActiveGameId(uid : string) : number | undefined{
		let e = this.getGameList().find((e) => {
			return ((e.player1 === uid || e.player2 === uid));
		});
		if (e !== undefined)
			return (e?.gameId)
		else
			return undefined;
	}

	public isInQueue(uid : string) : boolean {
		for (let gameMode of this.matchMakingQueue.entries()) {
			for (let user of gameMode) {
				if (uid === user)
					return (true);
			}
		}
		return false;
	}

	public addToQueue(payload : gameMatchmakingEntity) {
		if (this.isInQueue(payload.userID) === false)
			this.matchMakingQueue.get(payload.gameMode)?.push(payload.userID);
	}

	// TODO : Confirm this is working.
	public removeFromQueue(uuid : string) {
		for (let gameMode of this.matchMakingQueue.entries()) {
			let index = gameMode.findIndex((g) => {
				return (g === uuid);
			})
			if (index !== -1)
				this.gameList.splice(index, 1);
				return true;
		}
		return false;
	}

	
	public findMatch() {
		for (let gameMode of gameModes) {
			if (this.matchMakingQueue.get(gameMode)?.length as number >= 2) {
				let gameDTO : CreateGameDTO = {
					player1UID 	: this.matchMakingQueue.get(gameMode)?.pop() as string,
					player2UID	: this.matchMakingQueue.get(gameMode)?.pop() as string,
					gameMode 	: gameMode,
				}
				this.emitEvent('game.create', gameDTO);
				this.client.emit<string, outDTO>("game", {
					userIDs 		: [gameDTO.player1UID, gameDTO.player2UID],
					eventPattern 	: 'game.found',
					data 			: undefined
				});
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
	@OnEvent("game.create")
	public async createGame(createGameDTO : CreateGameDTO, gameID : number) {
		let newGameInstance : Game = new Game(this.eventEmitter , this.client , [createGameDTO.player1UID, createGameDTO.player2UID], createGameDTO.gameMode, gameID);
		logger.log("New game instance has been created");
		this.addNewGameToDatabase(createGameDTO).then(() => {
			logger.log("new game instance added to DB");
		});
		this.addGameToList(createGameDTO, newGameInstance);
	}
	
	private addGameToList(gameDto : CreateGameDTO, gameInstance : Game) {
		this.gameList.push({
			player1			: gameDto.player1UID, 
			player2 		: gameDto.player2UID,
			gameId 			: this.gameId,
			gameInstance 	: gameInstance,
			gameMode		: gameDto.gameMode,
		});
		this.gameId++;
	}

	public removeGameFromList(gameId : number) {
			let index = this.gameList.findIndex((ref) => {
				return (ref.gameId === gameId);
			})
			if (index !== -1)
				this.gameList.splice(index, 1);
	}

	// TODO : make the gamelist smaller.
	public getGameList() : GameInfo[] {
		return (this.gameList);
	}

	public getGameInfo(gameId : number) : GameInfo | undefined {
		return (this.gameList.find((e) => {
			return (e.gameId === gameId);
		}));
	}

	public async addSpectator(userId : string, targetGameId : number) {
		for (let game of this.gameList) {
			if (game.gameId === targetGameId) {
				if (game.spectatorList?.includes(userId) === false) {
					game.spectatorList?.push(userId);
					return true;
				}
			}
		}
		return false;
	}

	public async removeSpectator(userId : string, targetGameId : number) {
		for (let game of this.gameList) {
			if (game.gameId === targetGameId) {
				if (game.spectatorList?.includes(userId) === true) {
					game.spectatorList.splice(game.spectatorList.indexOf(userId), 1);
					return true;
				}
			}
		}
		return false;
	}

	@OnEvent("game.ended")
	async gameFinishedHandler(@Payload() gameResult : GameEndedData) {
		this.client.emit("frontend.game.ended", gameResult);
		logger.log("Game-ended event caught & emitted to frontend");
		this.addGameResultToDatabase(gameResult.payload).then(() => {
			logger.log("GameID: [" + gameResult.gameID + "] Game result has been added to the database");
		})
	}

	async addNewGameToDatabase(newGame : CreateGameDTO) {
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
