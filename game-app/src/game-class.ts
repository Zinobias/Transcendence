import { PlayerData, Entity, Ball , GameResult, GameEndedEvent, PlayerPaddle, GameFrameUpdateEvent} from "./game-object-interfaces";
import { EventEmitter2, OnEvent } from "@nestjs/event-emitter";
import { Vec2 } from "./vectorLib/vector-lib";
enum Direction {
	up = 1,
	down = -1,
	right = 1,
	left = -1,
}
export class Game {
	public	readonly gameId 	: number;
	private readonly player1	: PlayerData;
	private readonly player2 	: PlayerData;
	private entities 			: Entity[];
	private	playerPaddles		: Map<string, PlayerPaddle>;
	private ball 				: Ball;
	private boardDimensions 	: Vec2;
	private results 			: GameResult;
	private readonly gameMode	: string;
	constructor(private eventEmitter: EventEmitter2, PlayersUIDs : string[], gameMode : string, gameID : number) {
		this.gameMode = gameMode;
		this.gameId = gameID;
		this.player1.uid = PlayersUIDs[0];
		this.player2.uid = PlayersUIDs[1];
		this.player1.score = 0;
		this.player2.score = 0;
		// TODO: Define figure how to decide the height of the paddles. X ratio of the screen height
		let playerPaddle1 = {pos : {x : -this.boardDimensions.x * 0.5, y : 0}, height : 0, type : "playerPaddle"};
		let playerPaddle2 = {pos : {x : this.boardDimensions.x * 0.5, y : 0}, height : 0, type : "playerPaddle"};
		this.playerPaddles.set(this.player1.uid, playerPaddle1);
		this.playerPaddles.set(this.player2.uid, playerPaddle2);
		this.entities.push(playerPaddle1, playerPaddle2);
		this.ball.type = "ball";
		this.ballFactory();
		this.start();
	};

	
	
	private gameFinishedHandler() {
		// TODO: Upload gameresults to the database.
		// TODO: Send gameFinishedEvent to the frontEnd service.
		// TODO: Find a way to properly clean up the class out of memory.
		this.eventEmitter.emit('game.ended', 
			new GameEndedEvent({
			gameID: this.gameId,
			payload: this.results,
		}),
		);
		return ;
	}

	// DTO for this should be
	// TODO: Revaluate this event/function. possibly just set a state for keypress & release. To then check in the loop.
	@OnEvent("game.player.move")
	private movePlayer(UID : string, direction : Direction ) : void {
		let target = this.playerPaddles.get(UID);

		if (target === undefined)
			return ;
		// TODO: Set incremental value to something that feels responsive and makes sense.
		switch (direction) {
			case Direction.up: {
				target.pos.y += 1;
				break ;
			}
			case Direction.down: {
				target.pos.y -= 1;
				break ;
			}
			default :
				console.log("Invalid direction");
				break ;
		}
	}

	// Entrypoint for the game class.
	private async start() {
		this.loop();
		this.gameFinishedHandler();
	}

	// Baseloop for the pong game.
	private  loop() {
		let loopState : Boolean = true;

		while (loopState === true) {
			// TODO: Calculate new ball position, and check for intersections. If intersecting, call onHit of the intersected entity.
			// TODO: Move the paddles. (Should be handled by an event handler), have to make sure to not interfere with the ball calculation.
			// TODO: At end of loop, send current state object to frontEnd. For rendering purposes. JSON format for DTO
			this.eventEmitter.emit('game.frameUpdate', 
			new GameFrameUpdateEvent({
			gameID: this.gameId,
			payload: this.entities,
		}),
		);
		}
		// sets the game result.
		this.results = {
			player1: this.player1,
			player2: this.player2,
			gameID: this.gameId,
			winnerUID : this.player1.score > this.player2.score ? this.player1.uid : this.player2.uid,
		};
	}
	// ------------------------------------------------------------------
	
	// Ball factory, creates a correspondig ball for the gameode.
	private ballFactory() : void {
		const ballFactoryMap = new Map<string, () => void >([
			["DEFAULT", this.createDefaultBall]
		]);
		ballFactoryMap.get(this.gameMode)?.();
		// let ballFunc = ballFactoryMap.get(this.gameMode);
		// if (ballFunc) 
		// 	ballFunc();
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
