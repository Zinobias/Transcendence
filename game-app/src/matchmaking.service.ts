import { Inject, Injectable, Logger } from '@nestjs/common';
import { EventEmitter2, OnEvent } from '@nestjs/event-emitter';
import { ClientProxy, ClientProxyFactory, EventPattern, Payload, Transport } from '@nestjs/microservices';
import { CreateGameDTO, GameInfo, outDTO } from './dto/dto';
import { GameEndedData, gameMatchmakingEntity } from './event-objects/events.objects';
import { Game } from './game-class';
import { gameModes } from './game-object-interfaces';
import { GameResult } from './game-objects/game-object-interfaces';
import { mapGetter } from './map.tools';
const logger = new Logger("AppService");


@Injectable()
export class MatchMakingService {
	private readonly matchMakingQueue	: Map<string , string[]> = new Map<string, string[]>;
	private gameId 			: number;
	private readonly gameList			: GameInfo[] = [];
	private readonly logger				: Logger =  new Logger('matchmakingService');;

	/**
	 * 
	 * @param eventEmitter Constructor injection. Gets injected by the module.
	 */
	constructor(private eventEmitter : EventEmitter2, @Inject('gateway') private readonly client : ClientProxy) {
		// this.matchMakingQueue = new Map<string, string[]>;
		this.gameId = 0; // TODO : Maybe fetch gameId from the DB.
	};

	async emitEvent(pattern : string, payload : {}) {
		this.eventEmitter.emit(pattern, payload);
	}


	/**
	 * Returns true if the user is in a game, false otherwise.
	 * @param uid user to check if ingame.
	 * @returns true or false
	 */
	public isInGame(uid : string) : boolean{
		if (this.getGameList().find((e) => {
			return ((e.player1 === uid || e.player2 === uid));
		})!== undefined)
			return true;
		return false;
	}

	/**
	 * checks if the user is in an active game & returns gameId
	 * @param uid user to check
	 * @returns gameId 
	 */
	public getUserActiveGameId(uid : string) : number | undefined{
		let e = this.getGameList().find((e) => {
			return ((e.player1 === uid || e.player2 === uid));
		});
		if (e !== undefined)
			return (e?.gameId)
		else
			return undefined;
	}


	/**
	 * Returns true if the user is in the queue currently.
	 * false otherwise.
	 * @param uid User to check.
	 * @returns 
	 */
	public isInQueue(uid : string) : boolean {
		for (let gameMode of this.matchMakingQueue.entries()) {
			for (let user of gameMode) {
				if (uid === user)
					return (true);
			}
		}
		return false;
	}

	/**
	 * Adds a user to the matchmaking queue.
	 * @param payload
	 */
	public addToQueue(payload : gameMatchmakingEntity) {
		
		if (this.isInQueue(payload.userId) === false) {
			let gameModeList = mapGetter(payload.gameMode, this.matchMakingQueue);
			if (gameModeList !== undefined) {
				gameModeList.push(payload.userId);
				this.logger.log(`Added userId : [${payload.userId}] to queue for gamemode : [${payload.gameMode}]`);
				return ;
			}
			this.logger.log(`Adding userId : [${payload.userId}] to queue for gamemode : [${payload.gameMode}] went wrong`);

			// this.matchMakingQueue.get(payload.gameMode)?.push(payload.userId);
		}
	}

	/**
	 * Removes a user from the matchmaking queue, regardless of mode.
	 * @param uuid user to remove from queue
	 * @returns 
	 */
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

	
	/**
	 * Check to see if after the user has been added to the queue, as match can be constructed.
	 * if the case is yes, it attemps to create a game instance. By emitting game.create & therefore 
	 * calling createGame().
	 */
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
					userIds 		: [gameDTO.player1UID, gameDTO.player2UID],
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
	 * @param gameId ID of the game : number
	 * @returns void
	 */
	@OnEvent("game.create")
	public async createGame(createGameDTO : CreateGameDTO) {
		let newGameInstance : Game = new Game(this.eventEmitter , this.client , [createGameDTO.player1UID, createGameDTO.player2UID], createGameDTO.gameMode, this.gameId);

		logger.log("New game instance has been created");
		this.addNewGameToDatabase(createGameDTO).then(() => {
			logger.log("new game instance added to DB");
		});
		this.addGameToList(createGameDTO, newGameInstance);
	}

	/**
	 * adds game instance to the active games list.
	 * increments gameId internally & in db.
	 * @param gameDto 
	 * @param gameInstance 
	 */
	private addGameToList(gameDto : CreateGameDTO, gameInstance : Game) {
		this.gameList.push({
			player1			: gameDto.player1UID, 
			player2 		: gameDto.player2UID,
			gameId 			: this.gameId,
			gameInstance 	: gameInstance,
			gameMode		: gameDto.gameMode,
		});
		// TODO : Increment gameIds in DB.
		this.gameId++;
	}


	/**
	 * removes game instance from the game list.
	 * @param gameId
	 */
	public removeGameFromList(gameId : number) {
			let index = this.gameList.findIndex((ref) => {
				return (ref.gameId === gameId);
			})
			if (index !== -1)
				this.gameList.splice(index, 1);
	}

	/**
	 * 
	 * @returns game list object.
	 */
	public getGameList() : GameInfo[] {
		return (this.gameList);
	}


	/**
	 *  returns game instance metadata
	 * @param gameId 
	 * @returns game metadata object
	 */
	public getGameInfo(gameId : number) : GameInfo | undefined {
		return (this.gameList.find((e) => {
			return (e.gameId === gameId);
		}));
	}

	/**
	 * Starts spectating a game, adds the spectator to the list of users that should receive frame updates & game ended events.
	 * @param userId userId that wants to spectate
	 * @param targetGameId game to spectate
	 * @returns 
	 */
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

	/**
	 * Removes the spectator
	 * @param userId spectator name.
	 * @param targetGameId game to stop spectating.
	 * @returns 
	 */
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

	async addNewGameToDatabase(newGame : CreateGameDTO) {
		// TODO : add new game to db
	}
	async addGameResultToDatabase(gameresult : GameResult) {
		// logger.log("GameID: [" + gameresult.gameId + "] Game result has been added to the database");
		// TODO: Go wild abby 
		/**
		 * Update database gameId
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
