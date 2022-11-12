import { Body, Controller, Get, Inject, Logger, Post, Req } from '@nestjs/common';
import { EventEmitter2, OnEvent } from '@nestjs/event-emitter';
import { ClientProxy, EventPattern, Payload } from '@nestjs/microservices';
import { SubscribeMessage } from '@nestjs/websockets';
import { Socket } from 'socket.io';
import { MatchMakingService } from './matchmaking.service';
import { GameEndedData, GameFrameUpdateEvent, gameMatchmakingEntity } from './event-objects/events.objects';


@Controller()
export class AppController {

	async onApplicationBootstrap() {
		console.log("Boostrapped game controller");
		console.log("trying to connect");
		console.log("Success");
	}
	constructor(private matchMakingService: MatchMakingService,
		@Inject('gateway') private readonly  gatewayClient : ClientProxy) {}
	private readonly logger = new Logger("game controller");

	@OnEvent('game.frameupdate')
	async updateFrame(@Payload() payload : GameFrameUpdateEvent) {
		// TODO: Forward payload to frontend.
		
	}
	@EventPattern("game.player.move")
	async userMoveEvent(@Payload() payload : any) {
		this.matchMakingService.emitEvent("game.player.move." + payload.gameID, payload);
		// figure out how to receive this.
		// game.player.move." + payload.gameID
		// send keyinput as payload.
		//this.eventEmitter.emit();
	}

	@EventPattern("game.user.join.queue")
	matchmakingHandler(@Payload() payload : gameMatchmakingEntity) {
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

