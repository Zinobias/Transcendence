import { GameConfig } from "src/enums";
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
	gameId : number;
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
	 * 	gameId : number;
	 * 	payload : Entity[]; }
	 */
	constructor(frameData : GameFrameData){
		this._gameId = frameData.gameId;
		this._payload = frameData.payload;
		this._boardDimensions = [GameConfig.BOARD_WIDTH, GameConfig.BOARD_HEIGHT];
	};
	private _gameId: number;
	private _payload: Entity[];
	private _boardDimensions: number[];

	// ------------------------------------------------------------------------------------------------
	// Getters
	
	get boardDimensions() : number[] {return this._boardDimensions}
	get	gameId() { return (this._gameId); }
	get	payload() { return (this._payload); }

}



// export interface GameResult {
// 	readonly player1	: 	PlayerData;
// 	readonly player2	: 	PlayerData;
// 	gameId				:	number;
// 	winnerUID			:	string;
// }

/**
 * object for the gameEndedEvent
 */
 export interface GameEndedData {
	gameId 	: number;
	payload : GameResult;
}

///**
// * Event for when a game has 
// */
//export class GameEndedEvent {
//	constructor(gameEndedData : GameEndedData){
//		this._gameId = gameEndedData.gameId;
//		this._payload = gameEndedData.payload;
//	};
//	private _gameId: number;
//	private _payload: GameResult;

//	// ------------------------------------------------------------------------------------------------
//	// Getters
//	get	gameId() { return (this._gameId); }
//	get	payload() { return (this._payload); }

//}

/**
 * userId to join the queue for x gamemode
 * Possibly replace gamemode with options object.
 */
export interface gameMatchmakingEntity{
	userId 		: string;
	gameMode 	: string;
}