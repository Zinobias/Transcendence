import { GameInfo } from "./dto";

export interface basicResponse {
	success : boolean,
	msg		: string,
}

export interface IGameEnded {
	winner : string,
	player1ScoreFinal : number,
	player2ScoreFinal : number,
};

export interface IGameJoinQueue extends basicResponse {};

export interface IGameLeaveQueue extends basicResponse {};

export interface IGameSpectateStart extends basicResponse {};

export interface IGameSpecateStop extends basicResponse {};

export interface IGameGetActiveGameId extends basicResponse {
	gameId? : number,
};

export interface IGameIsInQueue extends basicResponse {};

export interface IGameInfo {
	players : {
		readonly player1 	:  	string ,
		readonly player2	: 	string ,
	},
	spectatorList? 			:	string[];
	readonly gameId			: 	number,
	readonly playerScores 	: {
		readonly player1Score	: 	number,
		readonly player2Score	: 	number,
	},
	gameMode 				: 	string,
};

export interface IGameGetGameList extends basicResponse {
	gameList : IGameInfo[],
};

export interface IGameGetGameInfo extends basicResponse {
	gameInfo : IGameInfo,
};

export interface IGameCreate extends basicResponse {
	gameInfo : IGameInfo,
};
