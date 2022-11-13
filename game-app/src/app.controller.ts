import { Body, Controller, Get, Inject, Logger, Post, Req } from '@nestjs/common';
import { EventEmitter2, OnEvent } from '@nestjs/event-emitter';
import { ClientProxy, EventPattern, Payload } from '@nestjs/microservices';
import { SubscribeMessage } from '@nestjs/websockets';
import { Socket } from 'socket.io';
import { MatchMakingService } from './matchmaking.service';
import { GameEndedData, GameFrameUpdateEvent, gameMatchmakingEntity } from './event-objects/events.objects';
import { GameFrameUpdateDTO } from './dto/dto';


@Controller()
export class AppController {

	async onApplicationBootstrap() {
		console.log("Boostrapped game controller");
		console.log("trying to connect");
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

	/**
	 * Tries to add the user to the matchmaking queue for chosen Gamemode.
	 * If the player is already in a game or in the queue, it will return an error.
	 * @param payload 
	 * @returns 
	 */
	@EventPattern("game.user.join.queue")
	matchmakingHandler(@Payload() payload : gameMatchmakingEntity) {
		if (this.matchMakingService.isInGame(payload.userID) === true) {
			this.gatewayClient.emit('game', {
				eventPattern 	: 'game.user.join.queue',
				data			: undefined,
			});
			return ;
		}
		this.matchMakingService.addToQueue(payload);
		this.matchMakingService.findMatch();
	}

	@EventPattern("testMsg")
	async testFunc(@Payload() payload : any) {
		this.logger.log(payload);
		this.logger.log("connected to the game");
		
		this.gatewayClient.emit<string, string>('testMsg', "testmsg from game");
	}
}

