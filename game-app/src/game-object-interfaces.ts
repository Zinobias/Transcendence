import { Vec2 } from "./vectorLib/vector-lib";
import {GameConfig, Direction} from "./enums" ;

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
	private		_radius				: number;

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
	get radius() { return (this._radius); }

	/** 
	 * @return Take care for the return value, can be undefined.
	 */
	get velocityVector() : Vec2 | undefined { return (this._velocityVector); }

	// ------------------------------------------------------------------------------------------------
	// Setters
	set velocityVector(newVelocityVector : Vec2 | undefined) { this._velocityVector = newVelocityVector instanceof Vec2 ? new Vec2(newVelocityVector.x, newVelocityVector.y) : undefined; }
	set pos(newPos : Vec2) { this._pos = newPos; }
	set radius(radius : number) { this._radius = radius; }

}

/**
 * The ball object for the pong game.
 * Creates a DEFAULT ball. As specified in the GameConfig
 * With the Color set to silver.
 */
export class Ball extends Entity {
	private _color : Color;
	//private _radius	: number;
	private _speed : number;

	constructor () {
		super("ball");
		this._color = new Color(211, 211, 211);
		this.velocityVector = new Vec2(1, 0);
		[this.pos.x, this.pos.y] = [0, 0];
		this.radius = GameConfig.DEFAULT_BALL_RADIUS;
		this.speed = GameConfig.DEFAULT_BALL_SPEED;
	}

	get color() {return this._color;};
	//get radius() {return this._radius;};
	get speed() {return this._speed;};


	set color(color : Color) {this._color = color;};
	//set radius(radius : number) {this._radius = radius;};
	set speed(speed : number) {this.speed = speed;};

}

/**
 * The pong player objects.
 */
export class PlayerPaddle extends Entity {
	private	_keyPressUp 	: boolean;
	private	_keyPressDown 	: boolean;

	constructor(private _height : number, _playerNumber : number) {
		super('player_paddle');
		[this.pos.x, this.pos.y] = [-GameConfig.PADDLE_HEIGHT / 2, _playerNumber == 1 ?  -GameConfig.BOARD_WIDTH / 2 : GameConfig.BOARD_WIDTH / 2];
		[this._keyPressDown, this._keyPressUp ]= [false, false];
	}

	// ------------------------------------------------------------------------------------------------
	// Getters
	get height() { return (this._height); }
	get keyPressUp() { return this._keyPressUp;}
	get keyPressDown() { return this._keyPressDown;}

	// ------------------------------------------------------------------------------------------------
	// Setters
	set keyPressUp(state : boolean) { this._keyPressUp = state;}
	set keyPressDown(state : boolean) { this._keyPressDown = state;}

	// TODO: Maybe add a set height if we want to create some fun powerup that reduces the paddle height.
}

/**
 * UserID & the player's current score.
 */
export interface PlayerData {
	uid 	:	 string;
	score 	:	 number;
}

/**
 * Results of the game.
 */
export interface GameResult {
	readonly player1	: 	PlayerData;
	readonly player2	: 	PlayerData;
	gameID				:	number;
	winnerUID			:	string;
}


/**
 * object for the gameEndedEvent
 */
export interface GameEndedData {
	gameID : number;
	payload : GameResult;
}

/**
 * Event for when a game has 
 */
export class GameEndedEvent {
	constructor(gameEndedData : GameEndedData){
		this._gameID = gameEndedData.gameID;
		this._payload = gameEndedData.payload;
	};
	private _gameID: number;
	private _payload: GameResult;

	// ------------------------------------------------------------------------------------------------
	// Getters
	get	gameID() { return (this._gameID); }
	get	payload() { return (this._payload); }

}

// TODO: might change the constructor(s) for the events..

/**
 * object for the gameFrameUpdate event
 */
export interface GameFrameData {
	gameID : number;
	payload : Entity[];
}

export class GameFrameUpdateEvent {

	/**
	 * 
	 * @param frameData Objects interface 
	 * @gameFrameData gameFrameData {
	 * 	gameID : number;
	 * 	payload : Entity[]; }
	 */
	constructor(frameData : GameFrameData){
		this._gameID = frameData.gameID;
		this._payload = frameData.payload;
	};
	private _gameID: number;
	private _payload: Entity[];

	// ------------------------------------------------------------------------------------------------
	// Getters
	get	gameID() { return (this._gameID); }
	get	payload() { return (this._payload); }

}

interface MoveStateData {
	readonly playerNumber : number;
	readonly newState : MoveStatePaddle;
}

export enum MoveStatePaddle {
	keyPressUp = 0,
	keyReleaseUp = 1,
	keyPressDown = 2,
	keyReleaseDown = 3,
}
export class GamePlayerMoveEvent {

	/**
	 * 
	 * @param moveStateData Objects interface 
	 * @gameFrameData gameFrameData {
	 * 	playerNumber : number;
	 * 	newState : number; }
	 */
	constructor(moveStateData : MoveStateData){
		this._playerNumber = moveStateData.playerNumber;
		this._newState = moveStateData.newState;
	};
	private _playerNumber	: number;
	private _newState		: number;

	// ------------------------------------------------------------------------------------------------
	// Getters
	get	playerNumber() { return (this._playerNumber); }
	get	newState() { return (this._newState); }

}