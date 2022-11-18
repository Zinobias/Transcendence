import { Body, Controller, Get, Inject, Logger, Post, Req } from '@nestjs/common';
import { EventEmitter2, OnEvent } from '@nestjs/event-emitter';
import { ClientProxy, EventPattern, Payload } from '@nestjs/microservices';
import { SubscribeMessage } from '@nestjs/websockets';
import { Socket } from 'socket.io';
import { MatchMakingService } from './matchmaking.service';
import { GameEndedData, GameFrameUpdateEvent, gameMatchmakingEntity } from './event-objects/events.objects';
import { addSpectatorDTO, CreateGameDTO, GameFrameUpdateDTO, outDTO, userKeyInputDTO } from './dto/dto';


@Controller()
export class AppController {

	async onApplicationBootstrap() {
		console.log("Bootstrapped game controller");
		console.log("Success");
	}

	constructor(private matchMakingService: MatchMakingService,
		@Inject('gateway') private readonly  gatewayClient : ClientProxy,
		private evenEmitter : EventEmitter2) {}
	private readonly logger = new Logger("game controller");

	@OnEvent('game.frame.update')
	async updateFrame(@Payload() payload : GameFrameUpdateEvent) {
		let gameInfo = this.matchMakingService.getGameInfo(payload.gameId);

		if (gameInfo === undefined) {
			this.logger.debug('game.frame.update cant find the gameInfo');
			return ;
		}
		let uids : string[];
		if (gameInfo?.spectatorList !== undefined) {
			uids = gameInfo?.spectatorList;
			uids.push(gameInfo.player1, gameInfo.player2);
		}
		else
			uids = [gameInfo.player1, gameInfo.player2];
		this.logger.debug("GAME FRAME UPDATE RECEIVED");
		this.gatewayClient.emit('game', {
			eventPattern : 'game.frame.update.' + gameInfo.gameId,
			targets : uids,
			data 	: payload.payload}); // Forwarding entities of the game. to render in frontend.
	}

	/**
	 * Forwards player key input to game instance, through an internal dynamic event handler in the game instance.
	 */
	@EventPattern("game.player.move")
	async userMoveEvent(@Payload() payload : userKeyInputDTO) {
		this.logger.log("player : {" + payload.userId + "} has moved.");
		let res = this.matchMakingService.getUserActiveGameId(payload.userId);
		if (res === undefined)
			return ;
		this.matchMakingService.emitEvent("game.player.move." + res, payload.keyEvent);
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
		this.logger.debug("GameID: [" + payload.gameId + "] Game result has been added to the database");

		if (gameInfo === undefined) {
			this.logger.debug('game.frame.update cant find the gameInfo');
			return ;
		}
		let uids : string[];
		if (gameInfo?.spectatorList !== undefined) {
			uids = gameInfo?.spectatorList;
			uids.push(gameInfo.player1, gameInfo.player2);
		}
		else
			uids = [gameInfo.player1, gameInfo.player2];
		this.gatewayClient.emit('game', {
			eventPattern : 'game.ended.' + gameInfo.gameId,
			targets : uids,
			data 	: {
				winner : payload.payload.winnerUID,
				player1ScoreFinal : 2,
				player2ScoreFinal : 5,
			}
		}); // Forwarding entities of the game. to render in frontend.
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

		if (this.matchMakingService.isInGame(payload.userId) === true) {
			this.gatewayClient.emit<string, outDTO>('game', {
				userIds 		: [payload.userId],
				eventPattern 	: 'game.user.join.queue',
				data			: undefined,
			});
			return ;
		}
		this.gatewayClient.emit<string, outDTO>('game', {
			eventPattern : 'game.user.join.queue',
			userIds		: [payload.userId],
			data		: undefined,
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
	this.logger.log("User : {" + payload.userId + "} has left the queue.");
	let success = this.matchMakingService.removeFromQueue(payload.userId);

	this.gatewayClient.emit<string, outDTO>('game', {
		userIds : [payload.userId],
		eventPattern : 'game.leave.queue',
		data : { 
			status : success,
			status_msg : success === true ? "Left queue, or was never in the queue." : "Left queue, or was never in the queue.",
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
		this.logger.log("User : {" + payload.userId + "} has started spectating game: " + payload.targetGameId);
		let success = await this.matchMakingService.addSpectator(payload.userId, payload.targetGameId);
	
		this.gatewayClient.emit<string, outDTO>('game', {
			userIds : [payload.userId],
			eventPattern : 'game.spectate.start',
			data : { 
				status : success,
				status_msg : success === true ? "Success" : "gameId invalid",
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
		this.logger.log("User : {" + payload.userId + "} has stopped spectating.");

		let success = await this.matchMakingService.removeSpectator(payload.userId, payload.targetGameId);

		this.gatewayClient.emit<string, outDTO>('game', {
			userIds : [payload.userId],
			eventPattern : 'game.spectate.stop',
			data : { 
				status : success,
				status_msg : success === true ? "Success" : "gameId invalid",
			}
		});
	}

	/**
	 * Returns a boolean & msg, true if  user is currently in a game.
	 * @param Payload { userId : string}
	 */
	@EventPattern('game.isInGame')
	isInGame(@Payload() payload : any) {
		this.logger.log("isInGame called");

		let success : boolean = this.matchMakingService.isInGame(payload.userId);
		this.gatewayClient.emit<string, outDTO>('game', {
			userIds : [payload.userId],
			eventPattern : 'game.isInGame',
			data : {
				status : success,
				status_msg : success === true ? "userId in game" : "userId not in game",
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
		this.logger.log("getActivegameId called");

		let ret = this.matchMakingService.getUserActiveGameId(payload.userId);

		if (ret === undefined) {
			this.gatewayClient.emit<string, outDTO>('game', {
				userIds : [payload.userId],
				eventPattern : 'game.get.activeGameId',
				data : undefined
			});
			return ;
		}
		this.gatewayClient.emit<string, outDTO>('game', {
			userIds : [payload.userId],
			eventPattern : 'game.get.activeGameId',
			data : {
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
				status : success,
				status_msg : success === true ? "userId in queue" : "userId not in queue",
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

		let gameListRet = this.matchMakingService.getGameList();

		if (gameListRet.length === 0) {
			this.gatewayClient.emit<string, outDTO>('game', {
				userIds : [payload.userId],
				eventPattern : 'game.get.gameList',
				data : {
					gameList : undefined
				}
			});
			return ;
		}
		this.gatewayClient.emit<string, outDTO>('game', {
			userIds : [payload.userId],
			eventPattern : 'game.get.gameList',
			data : {
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

		let gameInfoRet = this.matchMakingService.getGameInfo(payload.gameId);

		if (gameInfoRet === undefined) {
			this.gatewayClient.emit<string, outDTO>('game', {
				userIds : [payload.userId],
				eventPattern : 'game.get.gameInfo',
				data : {
					gameList : undefined
				}
			});
			return ;
		}
		this.gatewayClient.emit<string, outDTO>('game', {
			userIds : [payload.userId],
			eventPattern : 'game.get.gameInfo',
			data : {
				gameList : gameInfoRet,
			}
		});
	}

	/**
	 * How do we confirm that the request is valid and not forged?
	 * @param payload create Game DTO
	 * @returns 
	 */
	@EventPattern('game.create')
	async createGame(@Payload() payload : CreateGameDTO) {
		this.logger.log("a game has been created for users : {" + payload.player1UID + "} and + {" + payload.player2UID +"}");

		this.logger.debug("Game create payload:" + payload.gameMode);
		this.logger.debug("Game create payload:" + payload.player1UID);
		this.logger.debug("Game create payload:" + payload.player2UID);

		await this.matchMakingService.createGame(payload);
		return ({event : 'game.create', data : {
			success : true
		}});
	}
}
