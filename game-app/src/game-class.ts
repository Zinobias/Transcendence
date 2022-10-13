import { PlayerData, Entity, Ball , GameResult, GameEndedEvent, PlayerPaddle, GameFrameUpdateEvent, GamePlayerMoveEvent, MoveStatePaddle} from "./game-object-interfaces";
import { EventEmitter2, OnEvent } from "@nestjs/event-emitter";
import { Vec2 } from "./vectorLib/vector-lib";
import {GameConfig, Direction} from "./enums" ;
import { HttpException, InternalServerErrorException } from "@nestjs/common";


export class Game {
	private readonly player1	: PlayerData;
	private readonly player2 	: PlayerData;
	private entities 			: Entity[];
	private	playerPaddles		: [string, PlayerPaddle][];
	private ball 				: Ball;
	private results 			: GameResult;
	private _player1Serves		: Boolean;
	private	_toServe			: Boolean;

	constructor(
			private eventEmitter		: EventEmitter2, 
			PlayersUIDs					: string[], 
			private readonly gameMode	: string, 
			private readonly gameID		: number
		) {
		[this.player1.uid, this.player2.uid] = [ PlayersUIDs[0], PlayersUIDs[1]];
		[this.player1.score, this.player2.score] = [0, 0];
		this.playerPaddles[0] = [this.player1.uid, new PlayerPaddle(1)];
		this.playerPaddles[1] = [this.player2.uid, new PlayerPaddle(2)];
		this.entities.push(this.playerPaddles[0][1], this.playerPaddles[1][1]);
		this.ballFactory();
		this.eventEmitter.addListener("game.player.move" + this.gameID, this.setPlayerMovementState); // documentation for this is absolutely disastrous.
		this.start();
	};

	private gameFinishedHandler() {
		// TODO: Upload gameresults to the database.
		// TODO: Send gameFinishedEvent to the frontEnd service.
		// TODO: This has to happen in the app GameFinishedEventHandler.
		// TODO: Maybe construct results here.
		this.eventEmitter.emit('game.ended', 
			new GameEndedEvent({
			gameID: this.gameID,
			payload: this.results,
		}),
		);
		this.eventEmitter.removeListener("game.player.move" + this.gameID, this.setPlayerMovementState); 
		return ;
	}
	// DTO for this should be
	// TODO: Hook to frontend for user input.
	// TODO: Revaluate this event/function. possibly just set a state for keypress & release. To then check in the loop.
	
	// somehow want to listen to this event.
	//@OnEvent("game.player.move", {async: true})
	private setPlayerMovementState(payload: GamePlayerMoveEvent) {
		let		playerPaddle : PlayerPaddle = payload.playerNumber === 1 ? this.playerPaddles[0][1] : this.playerPaddles[1][1];

			switch (payload.newState) {
				case MoveStatePaddle.keyPressDown: {
					playerPaddle.keyPressDown = true;
					break ;
				}
				case MoveStatePaddle.keyReleaseDown: {
					playerPaddle.keyPressDown = false;
					break ;
				}
				case MoveStatePaddle.keyPressUp: {
					playerPaddle.keyPressUp = true;
					break ;
				}
				case MoveStatePaddle.keyReleaseUp: {
					playerPaddle.keyPressUp = false;
					break ;
				}
			}
			return;
		}
	/**
	 * Moves the player based on keyPressStates and checks whether it is a possible move.
	 */	
	private movePlayer() : void {
		if (this.playerPaddles[0][1].keyPressUp === true)
			this.playerPaddles[0][1].pos.y += GameConfig.PADDLE_STEP_SIZE + this.playerPaddles[0][1].pos.y + (GameConfig.PADDLE_HEIGHT * 0.5) > GameConfig.BOARD_HEIGHT * 0.5 ? 0 : GameConfig.PADDLE_STEP_SIZE;
		if (this.playerPaddles[0][1].keyPressDown === true)
			this.playerPaddles[0][1].pos.y -= this.playerPaddles[0][1].pos.y - GameConfig.PADDLE_STEP_SIZE - (GameConfig.PADDLE_HEIGHT * 0.5) < -(GameConfig.BOARD_HEIGHT * 0.5) ? 0 : GameConfig.PADDLE_STEP_SIZE;
		if (this.playerPaddles[1][1].keyPressUp === true)
			this.playerPaddles[1][1].pos.y += GameConfig.PADDLE_STEP_SIZE + this.playerPaddles[0][1].pos.y + (GameConfig.PADDLE_HEIGHT * 0.5) > GameConfig.BOARD_HEIGHT * 0.5 ? 0 : GameConfig.PADDLE_STEP_SIZE;
		if (this.playerPaddles[1][1].keyPressDown === true)
			this.playerPaddles[1][1].pos.y -= this.playerPaddles[0][1].pos.y - GameConfig.PADDLE_STEP_SIZE - (GameConfig.PADDLE_HEIGHT * 0.5) < -(GameConfig.BOARD_HEIGHT * 0.5) ? 0 : GameConfig.PADDLE_STEP_SIZE;
	}

	/**
	 * Moves the ball and checks for intersections with entities.
	 */
	private moveBall() : void {
		// NOTE TO ME:
		// Dont need to overcomplicate, it's 2d
		// Just compare x & y
		//if (this.ball.velocityVector) {
		//	let	newPos : Vec2 = new Vec2(this.ball.pos.x + this.ball.velocityVector?.x, this.ball.pos.y + this.ball.velocityVector?.y);
		//	let dotProduct = Vec2.getDotProduct(newPos, this.playerPaddles[0][1].pos);
		//	if (dotProduct) {

		//	}
		//	dotProduct = Vec2.getDotProduct(newPos, this.playerPaddles[1][1].pos);
			
			
		//}
		if (this.ball.velocityVector) {
			this.ball.pos.x += this.ball.velocityVector?.x;
			this.ball.pos.y += this.ball.velocityVector?.y;
		}
	}
	// Entrypoint for the game class.
	private async start() {
		this.loop();
		this.gameFinishedHandler();
	}


	/**
	 * Checks whether a player has scored a point.
	 */

	private checkBallPosition() {
		if (this.ball.pos.x + this.ball.width / 2 >= GameConfig.BOARD_WIDTH / 2) {
			this.player1.score += 1;
			this._player1Serves = false;
			this._toServe = true;
		}
		else if (this.ball.pos.x - this.ball.width / 2 <= -GameConfig.BOARD_WIDTH / 2) {
			this.player2.score += 1;
			this._player1Serves = true;
			this._toServe = true;
		}

		if (this.ball.pos.y + this.ball.height / 2 >= GameConfig.BOARD_HEIGHT / 2 || this.ball.pos.y - this.ball.height / 2 <= -GameConfig.BOARD_HEIGHT / 2)
			if (this.ball.velocityVector) {
				this.ball.pos.x = this.ball.pos.x >= GameConfig.BOARD_HEIGHT / 2 ? -(this.ball.height / 2) + GameConfig.BOARD_HEIGHT / 2 : (this.ball.height / 2) - (GameConfig.BOARD_HEIGHT / 2)
				this.ball.velocityVector.y *= -1;
			}
	}


	private		serveBall() {
		this._toServe = false;
		[this.ball.pos.x, this.ball.pos.y] = [0, 0];
		if (this.ball.velocityVector) 
			[this.ball.velocityVector.x, this.ball.velocityVector.y] = [this._player1Serves === true ? 1 : -1, 0];
	}
	
	/**
	 * 
	 * @param rect2 rectangle to compare the ball with.
	 * @returns True if a collision occurs.
	 */
	private	checkBallHit(rect2 : Entity ) : Boolean {
		if (
			!(this.ball.pos.x - this.ball.width 	/ 2	>= rect2.pos.x + rect2.width  / 2) 	&& 	
			!(this.ball.pos.x + this.ball.width 	/ 2 <= rect2.pos.x - rect2.width  / 2) 	&& 	
			!(this.ball.pos.y - this.ball.height 	/ 2 >= rect2.pos.y + rect2.height / 2) 	&& 
			!(this.ball.pos.y + this.ball.height 	/ 2 <= rect2.pos.y - rect2.height / 2))	
			return true;
		else
			return (false);
	}

	/**
	 * Goes through all entities to see if they collide with the ball.
	 * on collission calls the corresponding onhit method of the Entity class.
	 */
	private checkIntersections() {
		for (var entity of this.entities) {
			if (this.checkBallHit(entity) === true)
				if (entity.onHit)
					entity.onHit(this.ball);
		}
	}

	/**
	 * Basic gameloop.
	 */
	private  loop() {
		let loopState : Boolean = true;
	
		while (loopState === true) {
			if (this._toServe === true)
				this.serveBall();
			this.movePlayer(); // first thing to do, handle player input.
			this.moveBall(); // move ball
			this.checkIntersections(); // checks for intersections.
			this.checkBallPosition(); // check ball position relative to the board. Checks for points / top bottom
			/*
				steps :
				1. Serve the ball if neccessary. Or move ball.
				2. Move ball & Move paddle. TODO: See which to do first.
				3. Check for intersections.
				4. Transmit frameData to frontend to render.
				5. loop.
				
			*/
			// TODO: At end of loop, send current state object to frontEnd. For rendering purposes. JSON format for DTO
			this.eventEmitter.emit('game.frameUpdate', 
			new GameFrameUpdateEvent({
			gameID:	 this.gameID,
			payload: this.entities,
		}),
		);
		if (this.player1.score === 11 || this.player2.score === 11)
			loopState = false;
		}
		// sets the game result.
		this.results = {
			player1		: this.player1,
			player2		: this.player2,
			gameID		: this.gameID,
			winnerUID 	: this.player1.score > this.player2.score ? this.player1.uid : this.player2.uid,
		};
	}
	// ------------------------------------------------------------------
	
	/**
	 * Creates a ball based on gameMode passed to the constructor.
	 */
	private ballFactory() : void {
		const ballFactoryMap = new Map<string, () => void >([
			["DEFAULT", this.createDefaultBall]
		]);
		ballFactoryMap.get(this.gameMode)?.();
	}
	private createDefaultBall() : void {
		this.ball = new Ball(); // probably do not need to create a new one here?
		this.entities.push(this.ball);
	}
}
