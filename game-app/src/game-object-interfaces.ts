import { Vec2 } from "./vectorLib/vector-lib";

// Colors in R G B
export class Color {
	constructor(private _r : number, private _g : number, private _b : number) {}
	
	// ------------------------------------------------------------------------------------------------
	// Methods

	setColors(r : number, g : number, b : number) {
		this._r = r;
		this._g = g;
		this._b = b;
	}
	// ------------------------------------------------------------------------------------------------
	// Getters
	get r() {return (this._r);}
	get g() {return (this._g);}
	get b() {return (this._b);}

	// ------------------------------------------------------------------------------------------------
	// Setters
	set r(r : number) {this._r = r;}
	set g(g : number) {this._g = g;}
	set b(b : number) {this._b = b;}
}

/**
 * Simple abstract class to form the base of any type of entity.
 */
export abstract class Entity {
	public		onHit?(ball : Ball) : void; 
	protected 	_pos 				: Vec2;
	protected	_velocityVector? 	: Vec2;
	private		_type 				: string;

	/**
	 * Type of the object.
	 * @param type Type of the object, important. no case, and underscores to seperate words.
	 */
	constructor(type : string) {
		this._type = type;
	}

	// ------------------------------------------------------------------------------------------------
	// Getters
	get pos() { return (this._pos); }
	get type() { return (this._type); }
	/** 
	 * @return Take care for the return value, can be undefined.
	 */
	get velocityVector() : Vec2 | undefined { return (this._velocityVector); }

	// ------------------------------------------------------------------------------------------------
	// Setters
	set velocityVector(newVelocityVector : Vec2 | undefined) { this._velocityVector = newVelocityVector instanceof Vec2 ? new Vec2(newVelocityVector.x, newVelocityVector.y) : undefined; }
	set pos(newPos : Vec2) { this._pos = newPos; }
}

/**
 * The ball object for the pong game.
 */
export class Ball extends Entity {
	color : Color;
	constructor () {
		super("ball");
		this.color = new Color(211, 211, 211);
	}
}

/**
 * The pong player objects.
 */
export class playerPaddle extends Entity {
	constructor(private _height : number) {
		super('player_paddle');
	}

	// ------------------------------------------------------------------------------------------------
	// Getters
	get height() { return (this._height); }

	// TODO: Maybe add a set heigt if we want to create some fun powerup that reduces the paddle height.
}

/**
 * UserID & the player's current score.
 */
export interface playerData {
	uid 	:	 string;
	score 	:	 number;
}

/**
 * Results of the game.
 */
export interface gameResult {
	readonly player1	: 	playerData;
	readonly player2	: 	playerData;
	gameID				:	number;
	winnerUID			:	string;
}


/**
 * Event for when a game has 
 */
export class gameEndedEvent {
	constructor(event : gameEndedEvent){
		this._gameID = event.gameID;
		this._payload = event.payload;
	};
	private _gameID: number;
	private _payload: gameResult;

	// ------------------------------------------------------------------------------------------------
	// Getters
	get	gameID() { return (this._gameID); }
	get	payload() { return (this._payload); }

}

// TODO: might change the constructor(s) for the events..
export class gameFrameUpdate {
	constructor(event : gameFrameUpdate){
		this._gameID = event.gameID;
		this._payload = event.payload;
	};
	private _gameID: number;
	private _payload: Entity[];

	// ------------------------------------------------------------------------------------------------
	// Getters
	get	gameID() { return (this._gameID); }
	get	payload() { return (this._payload); }

}
