import { Vec2 } from "./vectorLib/vector-lib";

// Colors in R G B
export class Color {
	constructor(public r : number, public g : number, public b : number) {}
}

// Base class for an Entity object.
export abstract class Entity {
	pos 				: Vec2;
	velocityVector? 	: Vec2;
	onHit?(ball : Ball) : any; 
	type 				: string;
}

// The ball object in the game.
export class Ball extends Entity {
	color : Color;
}

export class playerPaddle extends Entity {
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

// TODO: might change the constructor(s) for the events..
export class gameFrameUpdate {
	gameID: number;
	payload: Entity[];
	constructor(event : gameFrameUpdate){
		this.gameID = event.gameID;
		this.payload = event.payload;
	};
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