import { Game } from "src/game-class";

export interface CreateGameDTO {
	player1UID	: number;
	player2UID	: number;
	gameMode	: string;
  }

  export interface GameInfo {
	readonly player1 		:  	number ,
	readonly player2		: 	number ,
	spectatorList? 			:	number[];
	readonly gameId			: 	number,
	readonly gameInstance 	:	Game;
	gameMode 				: 	string,
};



export interface GameFrameUpdateDTO {
	uids : number[],
	data : any,
}

export interface addSpectatorDTO {
	userId : number,
	targetGameId : number,
}

export interface outDTO {
	userIds : number[],
	eventPattern : string,
	data : any
}

export enum MoveStatePaddle {
	keyPressUp = 0,
	keyReleaseUp = 1,
	keyPressDown = 2,
	keyReleaseDown = 3,
}
export interface userKeyInputDTO {
	userId	 : number,
	keyEvent : MoveStatePaddle,
}