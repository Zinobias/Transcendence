import { Body, Controller, Get, Post, Req } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { AppService } from './app.service';
import { createGameDTO } from './dto/dto';
import { GameFrameUpdateEvent } from './event-objects/events.objects';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Post('/createGame')
  async createGameInstance(@Body() DTO : createGameDTO ) {
	// TODO: Get gameID from database.
	// TODO: Give gameID to game.
	let gameID = 5; // Should get it from the Database & increment db.
	/*
		DTO should be :
		player1UID : uid : number
		player2UID : uid : number
		gameMode		 : string
	*/
	// TODO: Find a way to pass eventsemitter??
	this.appService.createGame(DTO, gameID);
}

	@OnEvent('game.frameupdate')
	async updateFrame(@Payload() payload : GameFrameUpdateEvent) {
		// TODO: Forward payload to frontend.
	}
}

