// Basic Vec2
export interface Vec2 {
	x : number;
	y : number;
}

// Colors in R G B
export interface Color {
	r : number;
	g : number;
	b : number;
}

// Base class for an Entity object.
export interface Entity {
	pos 				: Vec2;
	velocityVector? 	: Vec2;
	onHit?(ball : Ball) : any; 
	type 				: string;
}

// The ball object in the game.
export interface Ball extends Entity {
	color : Color;
}

export interface playerPaddle extends Entity {
	height : number;
}

// UserID of the player & current score.
export interface playerData {
	uid 	:	 string;
	score 	:	 number;
}

export interface gameResult {
	readonly player1	: 	playerData;
	readonly player2	: 	playerData;
	gameID				:	number;
	winnerUID			:	string;
}

export class gameEndedEvent {
	constructor(event : gameEndedEvent){
		this.gameID = event.gameID;
		this.payload = event.payload;
	};
	gameID: number;
	payload: gameResult;
}

export class gameFrameUpdate {
	constructor(event : gameFrameUpdate){
		this.gameID = event.gameID;
		this.payload = event.payload;
	};
	gameID: number;
	payload: Entity[];
}

// Game metaData & core methods.
// export abstract class Game {
// 	player2 : playerData;
// 	entities : Entity[];
// 	ball : Ball;
// 	boardDimensions : Vec2;
// 	winner? : playerData;
// 	gameMode : string;

// 	constructor() {};
// 	// True on success, false on error.
// 	abstract initGame() : boolean ;
// 	abstract gameLoop() : void ;
// }