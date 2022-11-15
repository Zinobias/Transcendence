import { Body, Controller, Get, Inject, Logger, Post, Req } from '@nestjs/common';
import { EventEmitter2, OnEvent } from '@nestjs/event-emitter';
import { ClientProxy, EventPattern, Payload } from '@nestjs/microservices';
import { SubscribeMessage } from '@nestjs/websockets';
import { Socket } from 'socket.io';
import { MatchMakingService } from './matchmaking.service';
import { GameEndedData, GameFrameUpdateEvent, gameMatchmakingEntity } from './event-objects/events.objects';
import { addSpectatorDTO, GameFrameUpdateDTO, outDTO } from './dto/dto';


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
		let gameInfo = this.matchMakingService.getGameInfo(payload.gameID);

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
			eventPattern : 'game.frame.update.' + gameInfo.gameId,
			targets : uids,
			data 	: payload.payload});
	}

	@EventPattern("game.player.move")
	async userMoveEvent(@Payload() payload : any) {
		// TODO: Should get userId passed from gateway.
		this.matchMakingService.emitEvent("game.player.move." + payload.gameID, payload);
		// figure out how to receive this.
		// game.player.move." + payload.gameID
		// send keyinput as payload.
		//this.eventEmitter.emit();
	}

	
	@EventPattern("testMsg")
	async testFunc(@Payload() payload : any) {
		this.logger.log(payload);
		this.logger.log("connected to the game");
		
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
		if (this.matchMakingService.isInGame(payload.userID) === true) {
			this.gatewayClient.emit<string, outDTO>('game', {
				userIDs 		: [payload.userID],
				eventPattern 	: 'game.user.join.queue',
				data			: undefined,
			});
			return ;
		}
		this.gatewayClient.emit<string, outDTO>('game', {
			eventPattern : 'game.user.join.queue',
			userIDs		: [payload.userID],
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
			let success = this.matchMakingService.removeFromQueue(payload.userID);

			this.gatewayClient.emit<string, outDTO>('game', {
				userIDs : [payload.userID],
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
		let success = await this.matchMakingService.addSpectator(payload.userId, payload.targetGameId);
	
		this.gatewayClient.emit<string, outDTO>('game', {
			userIDs : [payload.userId],
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
		let success = await this.matchMakingService.removeSpectator(payload.userId, payload.targetGameId);

		this.gatewayClient.emit<string, outDTO>('game', {
			userIDs : [payload.userId],
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
		let success : boolean = this.matchMakingService.isInGame(payload.userId);
		this.gatewayClient.emit<string, outDTO>('game', {
			userIDs : [payload.userId],
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
		let ret = this.matchMakingService.getUserActiveGameId(payload.userId);

		if (ret === undefined) {
			this.gatewayClient.emit<string, outDTO>('game', {
				userIDs : [payload.userId],
				eventPattern : 'game.get.activeGameId',
				data : undefined
			});
			return ;
		}
		this.gatewayClient.emit<string, outDTO>('game', {
			userIDs : [payload.userId],
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
		let success : boolean = this.matchMakingService.isInQueue(payload.userId);

		this.gatewayClient.emit<string, outDTO>('game', {
			userIDs : [payload.userId],
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
		let gameListRet = this.matchMakingService.getGameList();
		
		if (gameListRet.length === 0) {
			this.gatewayClient.emit<string, outDTO>('game', {
				userIDs : [payload.userId],
				eventPattern : 'game.get.gameList',
				data : {
					gameList : undefined
				}
			});
			return ;
		}
		this.gatewayClient.emit<string, outDTO>('game', {
			userIDs : [payload.userId],
			eventPattern : 'game.get.gameList',
			data : {
				gameList : gameListRet,
			}
		});

	}
}
