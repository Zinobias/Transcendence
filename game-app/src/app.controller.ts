import { Body, Controller, Get, Post, Req } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { EventPattern, MessagePattern, Payload } from '@nestjs/microservices';
import { AppService } from './app.service';
import { createGameDTO } from './dto/dto';
import { GameEndedData, GameFrameUpdateEvent } from './event-objects/events.objects';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}


	@OnEvent('game.frameupdate')
	async updateFrame(@Payload() payload : GameFrameUpdateEvent) {
		// TODO: Forward payload to frontend.
	}

	// @EventPattern("game.ended")
	// gameFinishedHandler(@Payload() gameResult : GameEndedData) {
	// 	this.appService.eventEmitter.emit("frontend.game.ended", gameResult);
	// 	/**
	// 	 * TODO:
	// 	 * Add result to DB
	// 	 */
	// }
}

