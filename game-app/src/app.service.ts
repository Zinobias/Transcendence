import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { createGameDTO } from './dto/dto';
import { Game } from './game-class';

@Injectable()
export class AppService {
	private readonly eventEmitter : EventEmitter2;

	/**
	 * Will create a game instance.
	 * @param DTO Data transfer object {	
	 * player1UID	: string;
	 * player2UID	: string;
	 * gameMode		: string;}
	 * @param gameID ID of the game : number
	 * @returns void
	 */
  createGame(DTO : createGameDTO, gameID : number) { // does this have to be async?
	let newGame : Game = new Game(this.eventEmitter ,[DTO.player1UID, DTO.player2UID], DTO.gameMode, gameID);
	return ;
  }

  addGameToDatabase(DTO : createGameDTO) {
	// TODO: Go wild abby 
	/**
	 * Update database gameID
	 * Add game to database.
	 * maybe set a state or so?
	 * it will have a winner field, so maybe set it to a default value when not defined.
	 */
  }
}
