import { Vec2 } from "../vectorLib/vector-lib";
import {GameConfig, Direction} from "../enums" ;
import { getRandomInt } from "../utils";

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
	private		_height				: number;
	private		_width				: number;

	/**
	 * Type of the object.
	 * @param type Type of the object, important. no case, and underscores to seperate words.
	 */

	constructor(type: string);
	constructor(type: string, height : number, width : number);

	constructor(type : string, height? : number, width? : number) {
		this._type = type;
		if (width && height)
			[this._width, this._height] = [width, height];
	}

	// ------------------------------------------------------------------------------------------------
	// Getters
	get pos() { return (this._pos); }
	get type() { return (this._type); }
	get height() { return (this._height); }
	get width() { return (this._width); }


	/** 
	 * @return Take care for the return value, can be undefined.
	 */
	get velocityVector() : Vec2 | undefined { return (this._velocityVector); }

	// ------------------------------------------------------------------------------------------------
	// Setters
	set velocityVector(newVelocityVector : Vec2 | undefined) { this._velocityVector = newVelocityVector instanceof Vec2 ? new Vec2(newVelocityVector.x, newVelocityVector.y) : undefined; }
	set pos(newPos : Vec2) { this._pos = newPos; }
	set height(height : number) { this._height = this.height; }
	set width(width : number) { this._width = this.width; }


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
		this.height = GameConfig.DEFAULT_BALL_RADIUS;
		this.width = GameConfig.DEFAULT_BALL_RADIUS;
		//this.speed = GameConfig.DEFAULT_BALL_SPEED;
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

	constructor(_playerNumber : number) {
		super('player_paddle');
		//[this.pos.x, this.pos.y] = [-GameConfig.PADDLE_HEIGHT / 2, _playerNumber == 1 ?  -GameConfig.BOARD_WIDTH / 2 : GameConfig.BOARD_WIDTH / 2];
		[this.pos.x, this.pos.y] = [_playerNumber == 1 ?  -GameConfig.BOARD_WIDTH / 2 : GameConfig.BOARD_WIDTH / 2, -GameConfig.PADDLE_WIDTH / 2];
		[this.width, this.height] = [ GameConfig.PADDLE_WIDTH, GameConfig.PADDLE_HEIGHT];
		[this._keyPressDown, this._keyPressUp ]= [false, false];
		this.onHit = (ball : Ball ) => {
			if (ball.velocityVector) {
				ball.velocityVector.x *= -1.3;
				ball.velocityVector.y = getRandomInt(-GameConfig.BOARD_HEIGHT / 2, GameConfig.BOARD_HEIGHT / 2);
			}
		}
	}

	// ------------------------------------------------------------------------------------------------
	// Getters
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
	playerScores		:	{
		player1FinalScore : number,
		player2FinalScore : number,
	}
	gameId				:	number;
	winnerUID			:	string;
}

export enum MoveStatePaddle {
	keyPressUp = 0,
	keyReleaseUp = 1,
	keyPressDown = 2,
	keyReleaseDown = 3,
}
