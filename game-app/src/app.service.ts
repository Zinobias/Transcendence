import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { EventPattern, Payload } from '@nestjs/microservices';
import { Socket } from 'dgram';
import { createGameDTO } from './dto/dto';
import { gameMatchmakingEntity } from './event-objects/events.objects';
import { Game } from './game-class';
import { GameEndedData } from './game-object-interfaces';

@Injectable()
export class AppService {
	/**
	 * 
	 * @param eventEmitter Constructor injection. Gets injected by the module.
	 */
	constructor(private eventEmitter : EventEmitter2) {};

	private matchmakingQueue : gameMatchmakingEntity[];

	@EventPattern("game.ended")
	gameFinishedHandler(@Payload() gameResult : GameEndedData) {
		this.eventEmitter.emit("frontend.game.ended", gameResult);
		/**
		 * TODO:
		 * Add result to DB
		 */
	}
	
	@EventPattern("game.player.move")
	async userMoveEvent(@Payload() payload : any) {
		// figure out how to receive this.
		// game.player.move." + payload.gameID
		// send keyinput as payload.
		//this.eventEmitter.emit();
	}

	@EventPattern("game.user.join.queue")
	matchmakingHandler(@Payload() payload : gameMatchmakingEntity) {
		if (this.matchmakingQueue.length % 2 === 0) {
			let gameDTO : createGameDTO = {
				player1UID 	: this.matchmakingQueue.pop()?.userID as string,
				player2UID	: this.matchmakingQueue.pop()?.userID as string,
				gameMode 	: "placeholder",
			}
			this.eventEmitter.emit("game.found", gameDTO);
		}
		else 
			this.matchmakingQueue.push(payload);
	}

	/**
	 * Will create a game instance.
	 * @param DTO Data transfer object {	
	 * player1UID	: string;
	 * player2UID	: string;
	 * gameMode		: string;}
	 * @param gameID ID of the game : number
	 * @returns void
	 */
	@EventPattern("game.create")
  	async createGame(DTO : createGameDTO, gameID : number) {
	let newGame : Game = new Game(this.eventEmitter ,[DTO.player1UID, DTO.player2UID], DTO.gameMode, gameID);
	return ;
  }

  	async addGameToDatabase(DTO : createGameDTO) {
	// TODO: Go wild abby 
	/**
	 * Update database gameID
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
