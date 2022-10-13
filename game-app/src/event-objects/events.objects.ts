import { Entity, GameResult, MoveStatePaddle } from "src/game-objects/game-object-interfaces";

interface MoveStateData {
	readonly playerNumber : number;
	readonly newState : MoveStatePaddle;
}

/**
 * keyinput from the frontend processed.
 */
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

export interface GameFrameData {
	gameID : number;
	payload : Entity[];
}

/**
 * Frameupdate event to forward to the frontend
 */
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