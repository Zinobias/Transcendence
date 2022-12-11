export interface basicResponse {
	success : boolean,
	msg		: string,
}

export interface IGameEnded {
	winner : number,
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
		readonly player1 	:  	number ,
		readonly player2	: 	number ,
	},
	spectatorList? 			:	number[];
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

export interface IGameGetLeaderboard extends basicResponse {
	leaderboard	: any,
};

export interface IGameUserGetHistory extends basicResponse {
	history : any,
};

export interface IVec2 {
	x : number,
	y : number,
}

export interface IEntity {
	pos				: IVec2,
	velocityVector? : IVec2,
	height 			: number,
	width 			: number,
	type			: string,
};
