import { PlayerData, Entity, Ball , GameResult, PlayerPaddle, MoveStatePaddle, PaddleGameData, powerUpMushroom, powerUpPepper, IRectangle} from "./game-objects/game-object-interfaces";
import { EventEmitter2, OnEvent } from "@nestjs/event-emitter";
import {GameConfig, Direction} from "./enums" ;
import { GameFrameUpdateEvent, GameEndedData, MoveStateEvent } from "./event-objects/events.objects";
import { ClientProxy } from "@nestjs/microservices";
import { Logger } from "@nestjs/common";
import { Vec2 } from "./vectorLib/vector-lib";
import { IEntity, IVec2 } from "./dto/frontend.DTOs";
import { getRandomInt } from "./utils";

const logger = new Logger('random game instance');

export class Game {
	public readonly player1	: PlayerData;
	public readonly player2 	: PlayerData;
	private entities 			: Entity[];
	private	playerPaddles		: PaddleGameData[];
	private ball 				: Ball;
	private results 			: GameResult;
	private _player1Serves		: Boolean;
	private	_toServe			: Boolean;
	private _set				: IRectangle[];

	constructor(
			private eventEmitter		: EventEmitter2,
			private client				: ClientProxy,
			playersUIDs					: number[], 
			private readonly gameMode	: string, 
			private readonly gameId		: number
		) {
		this.player1 = {
			uid : playersUIDs[0],
			score : 0,
		};
		this.player2 = {
			uid	 : playersUIDs[1],
			score : 0,
		};
		this._set = [];
		this.playerPaddles = [];
		this.entities = [];
		this.playerPaddles.push( {uid : this.player1.uid, playerPaddle : new PlayerPaddle(1)});
		this.playerPaddles.push( {uid : this.player2.uid, playerPaddle : new PlayerPaddle(2)});
		this.entities.push(this.playerPaddles[0].playerPaddle, this.playerPaddles[1].playerPaddle);
		this.ballFactory();
		this.eventEmitter.on("game.player.move." + this.gameId, this.setPlayerMovementState.bind(this));
		this.start(); // prob put this in the calling function.
	};

	private gameFinishedHandler() {
		logger.log(`GAME INSTANCE GAME ID : ${this.gameId}`);
		this.eventEmitter.emit('game.ended', {gameId : this.gameId, payload: this.results });
		this.eventEmitter.removeAllListeners("game.player.move." + this.gameId); 
		return ;
	}

	/**
	 * Listener function that wil lchange the player movestate based on events.
	 * @param payload event with data for moving.
	 * @returns void
	 */
	private setPlayerMovementState(payload: MoveStateEvent) {

		const		playerPaddle : PlayerPaddle = payload.userId === this.player1.uid ? this.playerPaddles[0].playerPaddle : this.playerPaddles[1].playerPaddle;

		switch (payload.keyEvent) {
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
		if (this.playerPaddles[0].playerPaddle.keyPressUp === true)
			this.playerPaddles[0].playerPaddle.pos.y += GameConfig.PADDLE_STEP_SIZE + this.playerPaddles[0].playerPaddle.pos.y + (this.playerPaddles[0].playerPaddle.height * 0.5) > GameConfig.BOARD_HEIGHT * 0.5 ? 0 : GameConfig.PADDLE_STEP_SIZE;
		if (this.playerPaddles[0].playerPaddle.keyPressDown === true)
			this.playerPaddles[0].playerPaddle.pos.y -= this.playerPaddles[0].playerPaddle.pos.y - GameConfig.PADDLE_STEP_SIZE - (this.playerPaddles[0].playerPaddle.height * 0.5) < -(GameConfig.BOARD_HEIGHT * 0.5) ? 0 : GameConfig.PADDLE_STEP_SIZE;
		if (this.playerPaddles[1].playerPaddle.keyPressUp === true)
			this.playerPaddles[1].playerPaddle.pos.y += GameConfig.PADDLE_STEP_SIZE + this.playerPaddles[1].playerPaddle.pos.y + (this.playerPaddles[1].playerPaddle.height * 0.5) > GameConfig.BOARD_HEIGHT * 0.5 ? 0 : GameConfig.PADDLE_STEP_SIZE;
		if (this.playerPaddles[1].playerPaddle.keyPressDown === true)
			this.playerPaddles[1].playerPaddle.pos.y -= this.playerPaddles[1].playerPaddle.pos.y - GameConfig.PADDLE_STEP_SIZE - (this.playerPaddles[1].playerPaddle.height * 0.5) < -(GameConfig.BOARD_HEIGHT * 0.5) ? 0 : GameConfig.PADDLE_STEP_SIZE;
	}

	/**
	 * Moves the ball and checks for intersections with entities.
	 */
	private moveBall() : void {
		if (this.ball.velocityVector) {
			this.ball.pos.x += this.ball.velocityVector?.x;
			this.ball.pos.y += this.ball.velocityVector?.y;
		}
	}
	// Entrypoint for the game class.
	private async start() {
		await this.loop();
		this.gameFinishedHandler();
	}


	/**
	 * Emits the score to all players and spectators in the game, in case of goal.
	 */
	private emitPlayerScore() : void {
		this.eventEmitter.emit('game.emit.score', {
			gameId : this.gameId
		});
	}

	/**
	 * Checks whether a player has scored a point.
	 */
	private checkBallPosition() {
		if (this.ball.pos.x + this.ball.width / 2 >= GameConfig.BOARD_WIDTH / 2) {
			this.player1.score += 1;
			this._player1Serves = false;
			this._toServe = true;
			this.emitPlayerScore();
		}
		else if (this.ball.pos.x - this.ball.width / 2 <= -GameConfig.BOARD_WIDTH / 2) {
			this.player2.score += 1;
			this._player1Serves = true;
			this._toServe = true;
			this.emitPlayerScore();
		}

		if (this.ball.pos.y + this.ball.height / 2 >= GameConfig.BOARD_HEIGHT / 2 || this.ball.pos.y - this.ball.height / 2 <= -GameConfig.BOARD_HEIGHT / 2)
			if (this.ball.velocityVector) {
				this.ball.pos.y = this.ball.pos.y + (this.ball.height / 2) >= GameConfig.BOARD_HEIGHT / 2 ? 
					-(this.ball.height / 2) + (GameConfig.BOARD_HEIGHT / 2) : (this.ball.height / 2) - (GameConfig.BOARD_HEIGHT / 2)
				this.ball.velocityVector.y *= -1;
			}
	}


	private		serveBall() {
		logger.log("serving ball");
		this._toServe = false;
		[this.ball.pos.x, this.ball.pos.y] = [0, 0];
		[this.ball.height, this.ball.width] = [GameConfig.DEFAULT_BALL_RADIUS, GameConfig.DEFAULT_BALL_RADIUS];
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

	private removeEntity (ent : Entity) : void {
		const setIndex = this._set.findIndex((e) => {
			return (e.pos.x == ent.pos.x && e.pos.y == ent.pos.y);
		});
		if (setIndex !== -1)
			this.entities.splice(setIndex, 1);
		logger.debug('RemovingEntity from the set');

		const entityArrayIndex = this.entities.findIndex((e) => {
			return ((e.pos.x == ent.pos.x && e.pos.y == ent.pos.y) && e.type != 'ball');
		});

		if (entityArrayIndex !== -1)
			this.entities.splice(entityArrayIndex, 1);
		logger.debug(`RemovingEntity from the entities array, successfull : [${(setIndex !== -1 && entityArrayIndex !== -1) ? true : false}]`);
		return ;
	}
	/**
	 * Goes through all entities to see if they collide with the ball.
	 * on collission calls the corresponding onhit method of the Entity class.
	 */
	private checkIntersections() {
		for (let entity of this.entities) {
			// console.debug("Game debug checkintersections : Entity pos x: {" + entity.pos.x + "}");
			// console.debug("Game debug checkintersections : Entity pos y : {" + entity.pos.y + "}");

			if (this.checkBallHit(entity) === true)
				if (entity.onHit) {
					logger.log(`intersection with ${entity.type}`);
					entity.onHit(this.ball);
					if (entity.toDelete === true) {
						logger.debug(`ToDelete is true for object ${entity.type}`);
						this.removeEntity(entity);
						logger.debug(`Deleted object`);
					}
				}
		}
	}

	/**
	 * Converts entity to IRectangle.
	 */
	private static EntityToIRectangle(e : Entity) : IRectangle{
		return ({
			width : e.width,
			height : e.height,
			pos : Game.IVec2Constructor(e.pos)!,
		});
	}

		/**
	 * Converts entity to IRectangle.
	 */
		private static IRectangleConstructor(width : number, height : number, pos : IVec2) : IRectangle{
		return ({
			width : width,
			height : height,
			pos : pos,
		});
	}

	private	calculateRectangleIntersection(rect1 : IRectangle, rect2 : IRectangle) : Boolean {
		if (
			!(rect1.pos.x - rect1.width 	/ 2	>= rect2.pos.x + rect2.width  / 2) 	&& 	
			!(rect1.pos.x + rect1.width 	/ 2 <= rect2.pos.x - rect2.width  / 2) 	&& 	
			!(rect1.pos.y - rect1.height 	/ 2 >= rect2.pos.y + rect2.height / 2) 	&& 
			!(rect1.pos.y + rect1.height 	/ 2 <= rect2.pos.y - rect2.height / 2))
			return true;
		else 
			return (false);
	}

	private getAvailableEntityPosition(type : string) : IVec2 {
		let isAvailable : boolean = false;
		let entityPosition : IVec2;
		let entitySize : {
			width : number,
			height : number,
		};
		if (type === 'mushroom') 
			entitySize = {width : GameConfig.DEFAULT_MUSHROOM_WIDTH, height : GameConfig.DEFAULT_MUSHROOM_HEIGHT};
		else if (type === 'pepper')
			entitySize = {width : GameConfig.DEFAULT_PEPPER_WIDTH, height : GameConfig.DEFAULT_PEPPER_HEIGHT};

		while (isAvailable === false) {
			entityPosition = {
				x : getRandomInt((-(GameConfig.BOARD_WIDTH / 2) + GameConfig.PADDLE_WIDTH + 14) + entitySize!.width / 2, ((GameConfig.BOARD_WIDTH / 2) - GameConfig.PADDLE_WIDTH - 14) - entitySize!.width / 2),
				y : getRandomInt(-(GameConfig.BOARD_HEIGHT / 2) + entitySize!.height / 2, (GameConfig.BOARD_HEIGHT / 2) - entitySize!.height / 2),
			};
			isAvailable = this._set.find((e) => {
				return (this.calculateRectangleIntersection(e, {
					width : entitySize.width, 
					height : entitySize.height,
					pos : entityPosition,
				}));
			}) !== undefined;
		}
		return (entityPosition!);
	}

	private generatePowerUps() {
		const powerUpPicker  : number = getRandomInt(1, 2);
		let newEntityPos : IVec2;
		let newEntity : Entity;
		if (powerUpPicker == 1) {
			newEntityPos = this.getAvailableEntityPosition('mushroom');
			newEntity = new powerUpMushroom(newEntityPos);
		}
		else {
			newEntityPos = this.getAvailableEntityPosition('pepper')
			newEntity = new powerUpPepper(newEntityPos);
		}
		this._set.push(Game.EntityToIRectangle(newEntity));
		this.entities.push(newEntity);
		logger.debug(`Generated powerUp of type ${newEntity.type}`);
	}
	/**
	 * Basic gameloop.
	 */
	private async loop() {
		let loopState : Boolean = true;
		const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
		let powerUptimer : number = 0; // time since last powerup
		let powerUpInterval : number = 5000; // every 5 seconds
		logger.debug(`GameMode for new gameInstance is : ${this.gameMode}`);

		while (loopState === true) {
			if (this._toServe === true)
				this.serveBall();
			this.movePlayer(); // first thing to do, handle player input.
			this.moveBall(); // move ball
			this.checkIntersections(); // checks for intersections.
			this.checkBallPosition(); // check ball position relative to the board. Checks for points / top bottom
			if (this.gameMode === 'DISCOPONG' && powerUptimer === 5000) {
			logger.debug(`Generating a powerUp`);
				this.generatePowerUps();
				powerUptimer = 0;
			}
			/*
			steps :
			1. Serve the ball if neccessary. Or move ball.
			2. Move ball & Move paddle. TODO: See which to do first.
			3. Check for intersections.
			4. Transmit frameData to frontend to render.
			5. loop.
			*/
			// TODO: At end of loop, send current state object to frontEnd. For rendering purposes. JSON format for DTO
			this.eventEmitter.emit('game.frame.update',
			new GameFrameUpdateEvent({
				gameId:	 this.gameId,
				payload: this.entities,
			}),
			);
			await sleep(3.33);
			powerUptimer += 3.33;
			if (this.player1.score === 11 || this.player2.score === 11)
				loopState = false;
		}
		// sets the game result.
		this.results = {
			player1		: this.player1,
			player2		: this.player2,
			playerScores : {
				player1FinalScore : this.player1.score,
				player2FinalScore : this.player2.score,
			},
			gameId		: this.gameId,
			winnerUID 	: this.player1.score > this.player2.score ? this.player1.uid : this.player2.uid,
		};
	}
	// ------------------------------------------------------------------
	
	/**
	 * Creates a ball based on gameMode passed to the constructor.
	 */
	private ballFactory() : void {
		// const ballFactoryMap = new Map<string, () => void >([
		// 	["DEFAULT", this.createDefaultBall]
		// ]);
		// ballFactoryMap.get(this.gameMode)?.();

		// TODO : Fix ballfactoryMap. for extra gameMode balls.
		this.createDefaultBall();
	}
	private createDefaultBall() : void {
		this.ball = new Ball(); // probably do not need to create a new one here?
		this.entities.push(this.ball);
	}

	/**
	 * Constructs IVec2 interface out of Vec2
	 * @param vec2 Vec2 base class
	 * @returns Vec2 interface of said Vec2
	 */
	public static IVec2Constructor(vec2 : Vec2 | undefined) : IVec2 | undefined {
		if (vec2 === undefined)
			return undefined;
		return ({
			x : vec2.x,
			y : vec2.y,
		});
	}

	/**
	 * Construct IEntity out of Entity
	 * @param e takes base Entity abstract class
	 * @returns interface of said class.
	 */
	public static IEntityConstructor(e : Entity) : IEntity {
		return ({
			pos : Game.IVec2Constructor(e.pos)!,
			velocityVector : Game.IVec2Constructor(e.velocityVector),
			height : e.height,
			width : e.width,
			type : e.type,
		});
	}

	/**
	 * Converts Entity array into IEntity array.
	 * @param e array of abstract class Entity
	 * @returns Array of IEntity interfaces.
	 */
	public static EntityArrayToIEntityArray(entityArray : Entity[]) {
		const IEntityArray : IEntity[] = [];

		entityArray.forEach((e) => {
			IEntityArray.push(Game.IEntityConstructor(e));
		});
		return (IEntityArray);
	}
}
