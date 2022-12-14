import { Vec2 } from "../vectorLib/vector-lib";
import {GameConfig, Direction} from "../enums" ;
import { getRandomInt } from "../utils";
import { IVec2 } from "src/dto/frontend.DTOs";

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
	public		toDelete			: boolean;
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
		this._pos = new Vec2();
		this.toDelete = false;
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
	set height(height : number) { this._height = height; }
	set width(width : number) { this._width = width; }
}

/**
 * The ball object for the pong game.
 * Creates a DEFAULT ball. As specified in the GameConfig
 * With the Color set to silver.
 */
export class Ball extends Entity {
	private _color : Color;

	constructor () {
		super("ball", GameConfig.DEFAULT_BALL_RADIUS, GameConfig.DEFAULT_BALL_RADIUS);
		this._color = new Color(211, 211, 211);
		this.velocityVector = new Vec2(1, 0);
		[this.pos.x, this.pos.y] = [0, 0];
	}

	get color() {return this._color;};
	set color(color : Color) {this._color = color;};
}

/**
 * The pong player objects.
 */
export class PlayerPaddle extends Entity {
	private	_keyPressUp 	: boolean;
	private	_keyPressDown 	: boolean;

	constructor(_playerNumber : number) {
		super('player_paddle', GameConfig.PADDLE_HEIGHT, GameConfig.PADDLE_WIDTH);
		[this.pos.x, this.pos.y] = [_playerNumber == 1 ?  (-GameConfig.BOARD_WIDTH / 2) + (GameConfig.PADDLE_WIDTH / 2) + 14 : (GameConfig.BOARD_WIDTH / 2) - 14 - (GameConfig.PADDLE_WIDTH / 2), 0];
		[this._keyPressDown, this._keyPressUp ]= [false, false];
		this.onHit = (ball : Ball ) => {
			if (ball.velocityVector) {
				if (ball.velocityVector.x < ball.width / 2)
					ball.velocityVector.x *= -1.003; // 1.003
				else
					ball.velocityVector.x *= -1;
				if (ball.velocityVector.y == 0) // in case both players are not inputtin any actions and hit the paddle exactly on the middle.
					ball.velocityVector.y =  getRandomInt(0, 12) % 2 === 0 ? -1 : 1;
				// --------------------------------------------
				// Paddle segments.
				if (ball.pos.y <= this._pos.y - (this.height / 8) || ball.pos.y >= this._pos.y + (this.height / 1) )
					ball.velocityVector.y =  ball.velocityVector.y < 0 ? -1.5 : 1.5;
				else if (ball.pos.y <= this._pos.y - (this.height / 8) || ball.pos.y >= this._pos.y + (this.height / 2) )
					ball.velocityVector.y =  ball.velocityVector.y < 0 ? -1.25 : 1.25;
				else if (ball.pos.y <= this._pos.y - (this.height / 8) || ball.pos.y >= this._pos.y + (this.height / 3) )
					ball.velocityVector.y =  ball.velocityVector.y < 0 ? -1 : 1;
				else if (ball.pos.y <= this._pos.y - (this.height / 4) || ball.pos.y >= this._pos.y + (this.height / 4) )
					ball.velocityVector.y =  ball.velocityVector.y < 0 ? -.75 : .75;
				else if (ball.pos.y <= this.pos.y || ball.pos.y >= this.pos.y )
					ball.velocityVector.y =  ball.velocityVector.y < 0 ? -0.5 : 0.5;
			}
			ball.pos.x = this.pos.x < 0 ? this.pos.x + (this.width / 2) + (ball.width / 2) : this.pos.x - (this.width / 2) - (ball.width / 2);
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
	uid 	:	 number;
	score 	:	 number;
}


export interface PaddleGameData {
	uid 			:	 number;
	playerPaddle 	:	 PlayerPaddle;
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
	winnerUID			:	number;
}

export enum MoveStatePaddle {
	keyPressUp	 	= 0,
	keyReleaseUp 	= 1,
	keyPressDown 	= 2,
	keyReleaseDown 	= 3,
}

/**
 * MushroomPowerUp
 * Increases the ball size.
 */
 export class powerUpMushroom extends Entity {

	constructor(v2 : IVec2) {
		super('mushroom', GameConfig.DEFAULT_MUSHROOM_HEIGHT, GameConfig.DEFAULT_MUSHROOM_WIDTH);
		this.onHit = (ball : Ball ) => {
			if (ball.height < 32) {
				ball.height += 32;
				ball.width +=  32;
			}
			else {
				ball.height +=  6;
				ball.width += 6;
			}
			console.log(`MUSHROOM ONHIT FNC WIDTH ${ball.width} height ${ball.height}`);
		}
		this._pos.x = v2.x;
		this._pos.y = v2.y;
		this.toDelete = true;
	}
}

/**
 * Pepper powerUp 
 * Increases the ball velocity.
 */
 export class powerUpPepper extends Entity {

	constructor(v2 : IVec2) {
		super('pepper', GameConfig.DEFAULT_PEPPER_HEIGHT, GameConfig.DEFAULT_PEPPER_WIDTH);
		this.onHit = (ball : Ball ) => {
			if (ball.velocityVector!.x + 0.4 <= GameConfig.DEFAULT_BALL_RADIUS)
				ball.velocityVector!.x += ball.velocityVector!.x < 0 ? -0.4 : 0.4;

		}
		this.toDelete = true;
	}
}

export interface IRectangle {
	pos : IVec2,
	width : number,
	height : number,
}