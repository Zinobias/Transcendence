import { playerData, Entity, Ball, Vec2 } from "./game-object-interfaces";






export class Game {
	readonly player1 : playerData;
	readonly player2 : playerData;
	readonly gameId : number;
	entities : Entity[];
	ball : Ball;
	boardDimensions : Vec2;
	winner : playerData;
	gameMode : string;
	

	constructor(PlayersUIDs : string[], gameMode : string) {
		this.gameMode = gameMode;
		this.player1.uid = PlayersUIDs[0];
		this.player2.uid = PlayersUIDs[1];
		this.player1.score = 0;
		this.player2.score = 0;
		this.ballFactory();
	};

	
	private async init() {
		await this.loop();
		const promise = new Promise((resolve, reject) => {
			
		});
		return [this.player1, this.player2, this.gameId, this.player1.score > this.player2.score ? this.player1.score : this.player2.score];
	}

	private async loop() {
		let loopState : Boolean = true;


		while (loopState === true) {


		}
	}
	// ------------------------------------------------------------------
	
	// Ball factory
	private ballFactory() : void {
		const ballFactoryMap = new Map<string, () => void >([
			["DEFAULT", this.createDefaultBall]
		]);
		ballFactoryMap.get(this.gameMode)?.();
		// if (ballFnc) 
			// ballFnc();
	}

	private createDefaultBall() : void{
		this.ball.color.b = 211;
		this.ball.color.g = 211;
		this.ball.color.r = 211;
		this.ball.pos.x = this.boardDimensions.x * 0.5;
		this.ball.pos.y = this.boardDimensions.y * 0.5;
		this.ball.velocityVector.x = -1;
		this.ball.velocityVector.y = 0;
	}

	// ------------------------------------------------------------------
	// Getters
	public getPlayerData() : playerData[] {
		return [this.player1, this.player2];
	}
}