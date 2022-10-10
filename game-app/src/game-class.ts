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

	constructor(
			private eventEmitter		: EventEmitter2, 
			PlayersUIDs					: string[], 
			private readonly gameMode	: string, 
			private readonly gameID		: number
		) {
		[this.player1.uid, this.player2.uid] = [ PlayersUIDs[0], PlayersUIDs[1]];
		[this.player1.score, this.player2.score] = [0, 0];
		this.playerPaddles[0] = [this.player1.uid, new PlayerPaddle(GameConfig.PADDLE_HEIGHT, 1)];
		this.playerPaddles[1] = [this.player2.uid, new PlayerPaddle(GameConfig.PADDLE_HEIGHT, 2)];
		this.entities.push(this.playerPaddles[0][1], this.playerPaddles[1][1]);
		this.ballFactory();
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
		return ;
	}
	// DTO for this should be
	// TODO: Hook to frontend for user input.
	// TODO: Revaluate this event/function. possibly just set a state for keypress & release. To then check in the loop.
	
	@OnEvent("game.player.move", {async: true})
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
			this.playerPaddles[0][1].pos.y += GameConfig.PADDLE_STEP_SIZE + this.playerPaddles[0][1].pos.y + (GameConfig.PADDLE_SIZE * 0.5) > GameConfig.BOARD_HEIGHT * 0.5 ? 0 : GameConfig.PADDLE_STEP_SIZE;
		if (this.playerPaddles[0][1].keyPressDown === true)
			this.playerPaddles[0][1].pos.y -= this.playerPaddles[0][1].pos.y - GameConfig.PADDLE_STEP_SIZE - (GameConfig.PADDLE_SIZE * 0.5) < -(GameConfig.BOARD_HEIGHT * 0.5) ? 0 : GameConfig.PADDLE_STEP_SIZE;
		if (this.playerPaddles[1][1].keyPressUp === true)
			this.playerPaddles[1][1].pos.y += GameConfig.PADDLE_STEP_SIZE + this.playerPaddles[0][1].pos.y + (GameConfig.PADDLE_SIZE * 0.5) > GameConfig.BOARD_HEIGHT * 0.5 ? 0 : GameConfig.PADDLE_STEP_SIZE;
		if (this.playerPaddles[1][1].keyPressDown === true)
			this.playerPaddles[1][1].pos.y -= this.playerPaddles[0][1].pos.y - GameConfig.PADDLE_STEP_SIZE - (GameConfig.PADDLE_SIZE * 0.5) < -(GameConfig.BOARD_HEIGHT * 0.5) ? 0 : GameConfig.PADDLE_STEP_SIZE;
	}
	private moveBall() : void {
		// NOTE TO ME:
		// Dont need to overcomplicate, it's 2d
		// Just compare x & y
		if (this.ball.velocityVector) {
			let	newPos : Vec2 = new Vec2(this.ball.pos.x + this.ball.velocityVector?.x, this.ball.pos.y + this.ball.velocityVector?.y);
			let dotProduct = Vec2.getDotProduct(newPos, this.playerPaddles[0][1].pos);
			if (dotProduct) {

			}
			dotProduct = Vec2.getDotProduct(newPos, this.playerPaddles[1][1].pos);
			
			
		}
	}
	// Entrypoint for the game class.
	private async start() {
		this.loop();
		this.gameFinishedHandler();
	}


	/**
	 * Every tic for the game should be one gameLoop.
	 * every 1/30th of a second.
	 */
	private  loop() {
		let loopState : Boolean = true;
		let	player1Serves : Boolean = true;
	
		while (loopState === true) {
			/*
				steps :
				1. Serve the ball if neccessary. Or move ball.
				2. Move ball & Move paddle. TODO: See which to do first.
				3. Check for intersections.
				4. Transmit frameData to frontend to render.
				5. loop.
				
			*/
			// TODO: Calculate new ball position, and check for intersections. If intersecting, call onHit of the intersected entity.
			// TODO: Move the paddles. (Should be handled by an event handler), have to make sure to not interfere with the ball calculation.
			// TODO: At end of loop, send current state object to frontEnd. For rendering purposes. JSON format for DTO
			//this.moveBall(); should also serve
			this.movePlayer();
			this.eventEmitter.emit('game.frameUpdate', 
			new GameFrameUpdateEvent({
			gameID:	 this.gameID,
			payload: this.entities,
		}),
		);
		}
		// sets the game result.
		this.results = {
			player1: this.player1,
			player2: this.player2,
			gameID: this.gameID,
			winnerUID : this.player1.score > this.player2.score ? this.player1.uid : this.player2.uid,
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
	private createDefaultBall() : void{
		this.ball.color.setColors(211, 211, 211);
	}
}

/*
 Events to keep track of and to document :

 game.frameUpdate
 game.ended
 game.player.move
 TODO: write those events:
-	game.entity.move
 */
