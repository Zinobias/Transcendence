import { Body, Controller, Get, Logger, Post, Req } from '@nestjs/common';
import { EventEmitter2, OnEvent } from '@nestjs/event-emitter';
import { EventPattern, Payload } from '@nestjs/microservices';
import { SubscribeMessage } from '@nestjs/websockets';
import { Socket } from 'socket.io';
import { AppService } from './app.service';
import { GameEndedData, GameFrameUpdateEvent, gameMatchmakingEntity } from './event-objects/events.objects';


@Controller()
export class AppController {
	constructor(private appService: AppService) {}
	private readonly logger = new Logger("game controller");

	@OnEvent('game.frameupdate')
	async updateFrame(@Payload() payload : GameFrameUpdateEvent) {
		// TODO: Forward payload to frontend.
		
	}
	@EventPattern("game.player.move")
	async userMoveEvent(@Payload() payload : any) {
		this.appService.emitEvent("game.player.move." + payload.gameID, payload);
		// figure out how to receive this.
		// game.player.move." + payload.gameID
		// send keyinput as payload.
		//this.eventEmitter.emit();
	}

	@EventPattern("game.user.join.queue")
	matchmakingHandler(@Payload() payload : gameMatchmakingEntity) {
		this.appService.addToQueue(payload);
		this.appService.findMatch();
	}

	@EventPattern("testMsg")
	async testFunc(@Payload() payload : any) {
		this.logger.log(payload);
		this.logger.log("connected to the game");

	}

	@SubscribeMessage("testMsg")
	async testFuncc(client : Socket, data : any) {
		this.logger.log("connected to the game");
	}
}

