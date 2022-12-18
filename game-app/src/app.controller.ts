import { Body, Controller, Get, Inject, Logger, Post, Req } from '@nestjs/common';
import { EventEmitter2, OnEvent } from '@nestjs/event-emitter';
import { ClientProxy, EventPattern, Payload } from '@nestjs/microservices';
import { SubscribeMessage } from '@nestjs/websockets';
import { Socket } from 'socket.io';
import { MatchMakingService } from './matchmaking.service';
import { GameEndedData, GameFrameUpdateEvent, gameMatchmakingEntity } from './event-objects/events.objects';
import { addSpectatorDTO, CreateGameDTO, GameFrameUpdateDTO, outDTO, userKeyInputDTO } from './dto/dto';
import { Queries } from './database/queries';
import { Game } from './game-class';


@Controller()
export class AppController {

	async onApplicationBootstrap() {
		console.log("Bootstrapped game controller");
		console.log("Success");
	}

	constructor(private matchMakingService: MatchMakingService,
		@Inject('gateway') private readonly  gatewayClient : ClientProxy,
		@Inject(Queries) private readonly queries : Queries,
		private evenEmitter : EventEmitter2) {}
	private readonly logger = new Logger("game controller");

	@OnEvent('game.frame.update')
	async updateFrame(@Payload() payload : GameFrameUpdateEvent) {
		let gameInfo = this.matchMakingService.getGameInfo(payload.gameId);

		if (gameInfo === undefined) {
			this.logger.debug(`game.frame.update cant find the gameInfo, game: [${payload.gameId}] might be over`);
			return ;
		}
		let uids : number[];
		// if (gameInfo?.spectatorList !== undefined) {
		// 	uids = gameInfo?.spectatorList;
		// 	uids.push(gameInfo.player1, gameInfo.player2);
		// }
		// else
		uids = [gameInfo.player1, gameInfo.player2];
		const IEntityList = Game.EntityArrayToIEntityArray(payload.payload);
		// this.logger.debug("GAME FRAME UPDATE RECEIVED");
		this.gatewayClient.emit('game', {
			eventPattern : 'game.frame.update.' + gameInfo.gameId,
			userIds : uids,
			data 	: IEntityList}); // Forwarding entities of the game. to render in frontend.
	}

	/**
	 * Forwards player key input to game instance, through an internal dynamic event handler in the game instance.
	 */
	@EventPattern("game.player.move")
	async userMoveEvent(@Payload() payload : userKeyInputDTO) {
		// this.logger.log("player : {" + payload.userId + "} has moved.");
		this.logger.log("player : {" + payload.userId + "} has moved with key event {" + payload.keyEvent + "}");
		let res = this.matchMakingService.getUserActiveGameId(payload.userId);
		if (res === undefined)
			return ;
		this.matchMakingService.emitEvent("game.player.move." + res, {
			keyEvent	: payload.keyEvent,
			userId 		: payload.userId,
		});
	}

	@OnEvent('game.emit.score')
	async emitPlayerScore(@Payload() payload : {gameId : number}) {
		const gameInfo = this.matchMakingService.getGameInfo(payload.gameId);

		if (gameInfo === undefined) {
			this.logger.debug(`game.frame.update cant find the gameInfo, game: [${payload.gameId}] might be over`);
			return ;
		}
		let uids : number[];
		// if (gameInfo?.spectatorList !== undefined) {
		// 	uids = gameInfo?.spectatorList;
		// 	uids.push(gameInfo.player1, gameInfo.player2);
		// }
		// else
		uids = [gameInfo.player1, gameInfo.player2];

		this.gatewayClient.emit<string, outDTO>('game', {
			eventPattern : 'game.score.' + payload.gameId,
			userIds : uids,
			data : {
				player1Score : gameInfo.gameInstance.player1.score,
				player2Score : gameInfo.gameInstance.player2.score,
			},
		})
	}

	/**
	 * Catches internal game.ended event, handles it & forwards it to all uids that are part of the game.
	 * removes game from the active game list.
	 */
	@OnEvent('game.ended')
	async gameEndedEvent(@Payload() payload : GameEndedData) {
		this.logger.log("Game : {" + payload.gameId + "} has ended.");

		let gameInfo = this.matchMakingService.getGameInfo(payload.gameId);
		this.logger.debug("Game-ended event caught & emitted to frontend");
		if (gameInfo === undefined) {
			this.logger.debug('game.frame.update cant find the gameInfo');
			return ;
		}
		await this.matchMakingService.addGameResultToDatabase(payload.payload);
		let uids : number[];
		if (gameInfo?.spectatorList !== undefined) {
			uids = gameInfo?.spectatorList;
			uids.push(gameInfo.player1, gameInfo.player2);
		}
		else
			uids = [gameInfo.player1, gameInfo.player2];
		this.logger.debug(`Player1UID : ${gameInfo.player1} player2UID ${gameInfo.player2}`);
		this.gatewayClient.emit('game', {
			eventPattern : 'game.ended.' + gameInfo.gameId,
			userIds : uids,
			data 	: {
				winner : payload.payload.winnerUID,
				player1ScoreFinal : payload.payload.playerScores.player1FinalScore,
				player2ScoreFinal : payload.payload.playerScores.player2FinalScore,
			}
		}); // Forwarding entities of the game. to render in frontend.
		// TODO : not hardcode.
		this.matchMakingService.removeGameFromList(payload.gameId);
	}

	@EventPattern("testMsg")
	async testFunc(@Payload() payload : any) {
		this.logger.log(payload);
		this.logger.log("connected to the game");
		this.evenEmitter.emit('testEvent', 'test string');
		this.gatewayClient.emit<string, string>('testMsg', "testmsg from game");
	}

	/**
	 * Tries to add the user to the matchmaking queue for chosen Gamemode.
	 * If the player is already in a game or in the queue, it will return an error.
	 * data is undefined in case of an error.
	 * @param payload 
	 * @returns 
	 */
	@EventPattern("game.join.queue")
	joinMatchmakingQueue(@Payload() payload : gameMatchmakingEntity) {
		this.logger.log("User : {" + payload.userId + "} has joined the matchmaking queue for : " + payload.gameMode);
		if (this.matchMakingService.isValidGamemode(payload.gameMode) === false) {
			this.gatewayClient.emit<string, outDTO>('game', {
			eventPattern : 'game.join.queue',
			userIds		: [payload.userId],
			data		: {
				success : false,
				msg		: `gameMode in payload is invalid : [${payload?.gameMode}]`
			},
		});

		}
		if (this.matchMakingService.isInGame(payload.userId) === true) {
			this.gatewayClient.emit<string, outDTO>('game', {
				userIds 		: [payload.userId],
				eventPattern 	: 'game.join.queue',
				data			: {
					success : false,
					msg 	: `User [${payload.userId}] is already in a game`,
				},
			});
			return ;
		}
		this.logger.log(`before success emit`);
		this.gatewayClient.emit<string, outDTO>('game', {
			eventPattern : 'game.join.queue',
			userIds		: [payload.userId],
			data		: {
				success : true,
				msg		: `User [${payload.userId}] has joined the queue`,
			},
		});
		this.matchMakingService.addToQueue(payload);
		this.matchMakingService.findMatch();
	}


	/**
	 * Tries to add the user to the matchmaking queue for chosen Gamemode.
	 * If the player is already in a game or in the queue, it will return an error.
	 * data is undefined in case of an error.
	 * @param payload 
	 * @returns 
	 */
	@EventPattern("game.leave.queue")
	leaveMatchmakingQueue(@Payload() payload : gameMatchmakingEntity) {
	let success = this.matchMakingService.removeFromQueue(payload.userId);
	if (success === true)
			this.logger.debug("User : {" + payload.userId + "} has left the queue.");
	else
		this.logger.debug(`User : [${payload.userId}] has failed to leave the queue.`);

	this.gatewayClient.emit<string, outDTO>('game', {
		userIds : [payload.userId],
		eventPattern : 'game.leave.queue',
		data : { 
			success : success,
			msg : success === true ? `User [${payload.userId}] Left the queue, or was never in the queue.` : `User [${payload.userId}] has failed leaving the queue.`,
		}
	});
	return ;
	}

	/**
	 * User join the spectators for a game.
	 * returns a boolean that tells about the status of the operation.
	 * @param payload 
	 */
	@EventPattern('game.spectate.start')
	async startSpectateGame(@Payload() payload : addSpectatorDTO) {
		let success = await this.matchMakingService.addSpectator(payload.userId, payload.targetGameId);
		if (success === true)
			this.logger.debug("User : {" + payload.userId + "} has started spectating game: " + payload.targetGameId);
		else
			this.logger.debug(`User : [${payload.userId}] has failed spectating game: ${payload.targetGameId}`);

	
		this.gatewayClient.emit<string, outDTO>('game', {
			userIds : [payload.userId],
			eventPattern : 'game.spectate.start',
			data : { 
				success : success,
				msg : success === true ? "Success" : "gameId invalid",
				spectateId: payload.targetGameId,
			}
		});
	}

		/**
	 * User join the spectators for a game.
	 * returns a boolean that tells about the status of the operation.
	 * @param payload 
	 */
	@EventPattern('game.spectate.stop')
	async stopSpectateGame(@Payload() payload : addSpectatorDTO) {
		let success = await this.matchMakingService.removeSpectator(payload.userId, payload.targetGameId);
		if (success === true)
			this.logger.debug("User : {" + payload.userId + "} has stopped spectating game: " + payload.targetGameId);
		else
			this.logger.debug(`User : [${payload.userId}] has failed to stop spectating game: ${payload.targetGameId}`);

		this.gatewayClient.emit<string, outDTO>('game', {
			userIds : [payload.userId],
			eventPattern : 'game.spectate.stop',
			data : { 
				success : success,
				msg : success === true ? "Success" : "gameId invalid",
				spectateId: payload.targetGameId,
			}
		});
	}

	/**
	 * Returns a boolean & msg, true if  user is currently in a game.
	 * @param Payload { userId : string}
	 */
	@EventPattern('game.isInGame')
	isInGame(@Payload() payload : any) {
		let success : boolean = this.matchMakingService.isInGame(payload.requestedId);
		this.logger.log(`isInGame called for user [${payload.requestedId}] result : [${success}] typeOf userId : ${typeof(payload.requestedId)}`);

		this.gatewayClient.emit<string, outDTO>('game', {
			userIds : [payload.userId],
			eventPattern : 'game.isInGame',
			data : {
				success : success,
				msg : success === true ? "userId in game" : "userId not in game",
			}
		});
	}

	/**
	 * Returns undefined if not actually in an active game,
	 * returns the gameId if in a game.
	 * @param Payload { userId : string}
	 */
	@EventPattern('game.get.activeGameId')
	getActiveGameId(@Payload() payload : any) {
		let ret = this.matchMakingService.getUserActiveGameId(payload.userId);
		this.logger.log(`getActivegameId called, user ${payload.userId} is in game ${ret}`);

		if (ret === undefined) {
			this.gatewayClient.emit<string, outDTO>('game', {
				userIds : [payload.userId],
				eventPattern : 'game.get.activeGameId',
				data : {
					success : false,
					msg		: `user ${payload.userId} is not currently in agame.`,
				}
			});
			return ;
		}
		this.gatewayClient.emit<string, outDTO>('game', {
			userIds : [payload.userId],
			eventPattern : 'game.get.activeGameId',
			data : {
				success : true,
				msg		: `user ${payload.userId} is in game [${ret}].`,
				gameId : ret,
			}
		});
	}

	/**
	 * Returns a boolean & msg, true if  user is currently in the queue.
	 * @param Payload { userId : string}
	 */
	@EventPattern('game.isInQueue')
	isInQueue(@Payload() payload : any) {
		this.logger.log("isInQueue called");

		let success : boolean = this.matchMakingService.isInQueue(payload.userId);

		this.gatewayClient.emit<string, outDTO>('game', {
			userIds : [payload.userId],
			eventPattern : 'game.isInQueue',
			data : {
				success : success,
				msg : success === true ? `userId : [${payload.userId}] in queue` : `userId [${payload.userId}] not in queue`,
			}
		});
	}

	/**
	 * Returns a list of all the active game instances.
	 * If empty, returns undefined
	 * @param payload 
	 */
	@EventPattern('game.get.gameList')
	getGameList(@Payload() payload : any) {
		this.logger.log("getGameList called");

		let gameListRet = this.matchMakingService.getIGameInfoList();

		if (gameListRet.length === 0) {
			this.gatewayClient.emit<string, outDTO>('game', {
				userIds : [payload.userId],
				eventPattern : 'game.get.gameList',
				data : {
					success : false,
					msg		: `retrieving gamelist failed, due to there being no active games.`,
					gameList : undefined
				}
			});
			return ;
		}
		this.gatewayClient.emit<string, outDTO>('game', {
			userIds : [payload.userId],
			eventPattern : 'game.get.gameList',
			data : {
				success : true,
				msg		: `Retrieving gamelist successfull.`,
				gameList : gameListRet,
			}
		});
	}

	/**
	 * Retrieves object with game metadata.
	 * returns undefined if non existant.
	 * @param payload 
	 * @returns 
	 */
	@EventPattern('game.get.gameInfo')
	getGameInfo(@Payload() payload : any) {
		this.logger.log("getGameInfo called");

		let gameInfoRet = this.matchMakingService.getIGameInfo(payload.gameId);

		if (gameInfoRet === undefined) {
			this.gatewayClient.emit<string, outDTO>('game', {
				userIds : [payload.userId],
				eventPattern : 'game.get.gameInfo',
				data : {
					success : true,
					msg		: `Retrieving gameInfo for game ${payload.gameId} failed.`,
					gameInfo : undefined
				}
			});
			return ;
		}
		this.gatewayClient.emit<string, outDTO>('game', {
			userIds : [payload.userId],
			eventPattern : 'game.get.gameInfo',
			data : {
				success : true,
				msg		: `Retrieving gameInfo for game ${payload.gameId} successfull.`,
				gameInfo : gameInfoRet,
			}
		});
	}

	/**
	 * How do we confirm that the request is valid and not forged?
	 * @param payload create Game DTO
	 * @returns 
	 */
	@EventPattern('internal.game.create')
	async createGame(@Payload() payload : CreateGameDTO) {
		this.logger.log("a game is beeing created for users : {" + payload.player1UID + "} and + {" + payload.player2UID +"}");

		this.logger.debug("Game create payload:" + payload.gameMode);
		this.logger.debug("Game create payload:" + payload.player1UID);
		this.logger.debug("Game create payload:" + payload.player2UID);
		if (this.matchMakingService.isValidGamemode(payload.gameMode) === false) {
			this.logger.debug(`gameMode in payload is invalid : [${payload.gameMode}]`);
			return ;
		}

		let gameId : number = await this.matchMakingService.createGame(payload);
		this.logger.debug(`Game created with id : [${gameId}]`);

		this.gatewayClient.emit<string, outDTO>('game', {
			eventPattern : 'game.create',
			userIds : [payload.player1UID, payload.player2UID],
			data : {
				success : 	true,
				msg		: `Creating game for ${payload.player1UID} and ${payload.player2UID} succesfull`,
				gameId	: gameId
			}
		})

		// return ({event : 'game.create', data : {
		// 	success : true,
		// 	msg		: `Successfully ccreated a game with gameId : [${gameId}]`
		// }});
	}

	/**
	 * retrieves users + scores from leaderboard.
	 * @returns see dto file for interface
	 */
	@EventPattern('game.get.leaderboard')
	async getLeaderBoard(@Payload() payload : any) {
		const res = await this.queries.getLeaderboard();

		this.logger.debug(`Retrieved the leaderboard ${res}.`)
		if (res === undefined) {
			this.gatewayClient.emit<string, outDTO>('game', {
				eventPattern : 'game.get.leaderboard',
				userIds : [payload.userId],
				data : {
					success : 	false,
					msg		: `Retrieving leaderboard failed [${res}]`
				}
			})
		}
		else {
			this.gatewayClient.emit<string, outDTO>('game', {
				eventPattern : 'game.get.leaderboard',
				userIds : [payload.userId],
				data : {
					success : 	true,
					msg			: `Retrieving leaderboard succeeded : [${res}]`,
					leaderboard : res,
				}
			})
		}
	}

	/**
	 * retrieves user match history.
	 * @returns see dto file for interface
	 */
	@EventPattern('game.user.get.history')
	async getMatchHistory(@Payload() payload : any) {
		const res = await this.queries.getUserGameHistory(payload.requestedId);

		this.logger.debug(`Retrieved the matchistory for user ${payload.requestedId}`)
		if (res === undefined) {
			this.gatewayClient.emit<string, outDTO>('game', {
				eventPattern : 'game.user.get.history',
				userIds : [payload.userId],
				data : {
					success : 	false,
					msg		: `Retrieving user match history failed [${res}]`
				}
			})
		}
		else {
			this.gatewayClient.emit<string, outDTO>('game', {
				eventPattern : 'game.user.get.history',
				userIds : [payload.userId],
				data : {
					success : true,
					msg		: `Retrieving user match history succeeded : [${res}]`,
					history : res,
				}
			})
		}
	}
}
