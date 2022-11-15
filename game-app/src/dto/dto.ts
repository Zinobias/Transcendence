import { Game } from "src/game-class";

export interface CreateGameDTO {
	player1UID	: string;
	player2UID	: string;
	gameMode	: string;
  }

  export interface GameInfo {
	readonly player1 		:  	string ,
	readonly player2		: 	string ,
	spectatorList? 			:	string[];
	readonly gameId			: 	number,
	readonly gameInstance 	:	Game;
	gameMode 				: 	string,
};

export interface GameFrameUpdateDTO {
	uids : string[],
	data : any,
}

export interface addSpectatorDTO {
	userId : string,
	targetGameId : number,
}

export interface outDTO {
	userIds : string[],
	eventPattern : string,
	data : any
}