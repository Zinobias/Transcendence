import { Inject, Injectable, Logger } from '@nestjs/common';
import { EventEmitter2, OnEvent } from '@nestjs/event-emitter';
import { ClientProxy, ClientProxyFactory, EventPattern, Payload, Transport } from '@nestjs/microservices';
import { Queries } from './database/queries';
import { CreateGameDTO, GameInfo, outDTO } from './dto/dto';
import { IGameInfo } from './dto/frontend.DTOs';
import { GameEndedData, gameMatchmakingEntity } from './event-objects/events.objects';
import { Game } from './game-class';
// import { gameModes } from './game-object-interfaces';
import { GameResult } from './game-objects/game-object-interfaces';
import { mapGetter } from './map.tools';
const logger = new Logger("AppService");


@Injectable()
export class MatchMakingService {
	private readonly matchMakingQueue	: Map<string , number[]> = new Map<string, number[]>;
	private gameId 						: number;
	private readonly gameList			: GameInfo[] = [];
	private readonly logger				: Logger =  new Logger('matchmakingService');;
	private readonly gameModes			: string[] = ['DEFAULT', 'DISCOPONG'];
	/**
	 * 
	 * @param eventEmitter Constructor injection. Gets injected by the module.
	 */
	constructor(private eventEmitter : EventEmitter2, @Inject('gateway') private readonly client : ClientProxy,
	@Inject(Queries) private readonly queries : Queries) {
		this.gameModes.forEach((e) => {
			this.matchMakingQueue.set(e, []);
		});
	};

	async onApplicationBootstrap() {
		this.gameId = await this.queries.getGameId();
		//this.logger.debug(`GAMEID IN MM IS : [${this.gameId}]`);
    }

	/**
	 * Wrapper for sending internal events.
	 * @param pattern eventPattern
	 * @param payload Payload to send.
	 */
	async emitEvent(pattern : string, payload : {}) {
		this.eventEmitter.emit(pattern, payload);
	}


	/**
	 * 
	 * @returns Returns the lsit of gamemodes.
	 */
	public async getGameModes() : Promise<string[]> {
		return (this.gameModes);
	}

	/**
	 * 
	 * @param gameMode name of gameMode
	 * @returns true if valid else false. 
	 */
	public isValidGamemode(gameMode : string) : boolean {
		return (this.gameModes.find((e) => {
			 return (e === gameMode);
			}) !== undefined
		);
	}

	/**
	 * Returns true if the user is in a game, false otherwise.
	 * @param uid user to check if ingame.
	 * @returns true or false
	 */
	public isInGame(uid : number) : boolean{
		if (this.getGameList().find((e) => {
			return ((e.player1 == uid || e.player2 == uid));
		})!== undefined)
			return true;
		return false;
	}

	/**
	 * checks if the user is in an active game & returns gameId
	 * @param uid user to check
	 * @returns gameId 
	 */
	public getUserActiveGameId(uid : number) : number | undefined{
		let e = this.getGameList().find((e) => {
			return ((e.player1 == uid || e.player2 == uid));
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
	public isInQueue(uid : number) : boolean {
		for (let gameMode of this.matchMakingQueue.entries()) {
			for (let user of gameMode[1]) {
				if (uid == user)
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
			//this.logger.log(`Adding userId : [${payload.userId}] to queue for gamemode : [${payload.gameMode}] went wrong`);
		}
	}

	/**
	 * Removes a user from the matchmaking queue, regardless of mode.
	 * @param uuid user to remove from queue
	 * @returns 
	 */
	public removeFromQueue(uuid : number) {
		for (let gameMode of this.matchMakingQueue.entries()) {
			let index = gameMode[1].findIndex((g) => {
				return (g == uuid);
			});
			if (index !== -1) {
				//this.logger.debug("Leaving queue : {" + gameMode[0]+ "}");				
				gameMode[1].splice(index, 1);
				return true;
			}
		}
		return false;
	}

	
	/**
	 * Check to see if after the user has been added to the queue, as match can be constructed.
	 * if the case is yes, it attemps to create a game instance. By emitting game.create & therefore 
	 * calling createGame().
	 */
	public findMatch() {
		for (let gameMode of this.gameModes) {
			if (this.matchMakingQueue.get(gameMode)?.length as number >= 2) {
				let gameDTO : CreateGameDTO = {
					player1UID 	: this.matchMakingQueue.get(gameMode)?.pop() as number,
					player2UID	: this.matchMakingQueue.get(gameMode)?.pop() as number,
					gameMode 	: gameMode,
				}
				this.emitEvent('game.create', gameDTO);
				this.client.emit<string, outDTO>("game", {
					userIds 		: [gameDTO.player1UID, gameDTO.player2UID],
					eventPattern 	: 'game.found',
					data 			: {
						playerIds : [gameDTO.player1UID, gameDTO.player2UID],
					}
				});
				//logger.log("Game found event emitted to client");
			}
		}
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
	public async createGame(createGameDTO : CreateGameDTO) : Promise<number> {
		let newGameInstance : Game = new Game(this.eventEmitter , this.client , [createGameDTO.player1UID, createGameDTO.player2UID], createGameDTO.gameMode, this.gameId);
		//logger.log("New game instance has been created");
		await this.addGameToList(createGameDTO, newGameInstance);
		newGameInstance.start();
		return (this.gameId++);
		
	}

	/**
	 * adds game instance to the active games list.
	 * increments gameId internally & in db.
	 * @param gameDto 
	 * @param gameInstance 
	 */
	private async addGameToList(gameDto : CreateGameDTO, gameInstance : Game) : Promise<void> {
		this.gameList.push({
			player1			: gameDto.player1UID, 
			player2 		: gameDto.player2UID,
			gameId 			: this.gameId,
			gameInstance 	: gameInstance,
			frameSubscribers:[gameDto.player1UID,  gameDto.player2UID],
			gameMode		: gameDto.gameMode,
		});
	}


	/**
	 * removes game instance from the game list.
	 * @param gameId
	 */
	public removeGameFromList(gameId : number) {
			let index = this.gameList.findIndex((ref) => {
				return (ref.gameId == gameId);
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
	 * 
	 * @returns game list object.
	 */
	public getIGameInfoList() : IGameInfo[] {
		let iGameInfoList : IGameInfo[] = [];

		for (let gameInfo of this.gameList) 
			iGameInfoList.push(this.createIGameInfo(gameInfo));
		return (iGameInfoList);
	}

	/**
	 *  returns game instance metadata
	 * @param gameId 
	 * @returns game metadata object
	 */
	public getGameInfo(gameId : number) : GameInfo | undefined {
		return (this.gameList.find((e) => {
			return (e.gameId == gameId);
		}));
	}

	/**
	 *  returns game instance metadata
	 * @param gameId 
	 * @returns game metadata object.
	 */
	public getIGameInfo(gameId : number) : IGameInfo | undefined {
		let gameInfo : GameInfo | undefined = this.gameList.find((e) => {
			return (e.gameId == gameId);
		});
		if (gameInfo !== undefined) 
			return <IGameInfo>(this.createIGameInfo(gameInfo))
		return undefined;
	}

	public createIGameInfo(gameInfo : GameInfo) : IGameInfo {
		return  <IGameInfo> ({
			players : {
				player1 : gameInfo.player1,
				player2 : gameInfo.player2,
			},
			frameSubscribers : gameInfo.frameSubscribers,
			gameId : gameInfo.gameId,
			playerScores : {
				player1Score : gameInfo.gameInstance.player1.score,
				player2Score : gameInfo.gameInstance.player2.score,
			},
			gameMode : gameInfo.gameMode,
		});
	}
	/**
	 * Starts spectating a game, adds the spectator to the list of users that should receive frame updates & game ended events.
	 * @param userId userId that wants to spectate
	 * @param targetGameId game to spectate
	 * @returns 
	 */
	public async addSpectator(userId : number, targetGameId : number) {
		for (let game of this.gameList) {
			if (game.gameId == targetGameId) {
				if (game.frameSubscribers.includes(userId) === false && !(userId == game.player1 || userId == game.player2)) {
					game.frameSubscribers?.push(userId);
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
	public async removeSpectator(userId : number, targetGameId : number) {
		for (let game of this.gameList) {
			if (game.gameId == targetGameId) {
				if (game.frameSubscribers?.includes(userId) === true) {
					if (userId == game.player1 || userId == game.player2)
						return true;
					game.frameSubscribers.splice(game.frameSubscribers.indexOf(userId), 1);
					return true;
				}
			}
		}
		return false;
	}

	async addGameResultToDatabase(res : GameResult) {
		// this.logger.debug(`ADDING GAME TO DB, METADATA : uid1 : ${res.player1.uid} uid2 : ${res.player1.uid} gameId : ${res.gameId}, player1score ${res.playerScores.player1FinalScore} player2score ${res.playerScores.player2FinalScore}`);
		this.queries.storeGameResult([res.player1.uid, res.player2.uid], res.gameId, [res.playerScores.player1FinalScore, res.playerScores.player2FinalScore]);
		}
}
