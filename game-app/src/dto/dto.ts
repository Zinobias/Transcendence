export interface CreateGameDTO {
	player1UID	: string;
	player2UID	: string;
	gameMode	: string;
  }

  export interface GameInfo {
	readonly player1 	:  	any ,
	readonly player2	: 	any ,
	spectatorList? 		:	string[];
	readonly gameId		: 	number,
	gameMode 			: 	string,
};