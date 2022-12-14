export enum Direction {
	up      = 1,
	down    = -1,
	right   = 1,
	left    = -1,
}

/**
 * Defined values for the game in pixels.
 */


const GAME_SCALAR : number = 1;

export enum GameConfig {
	PADDLE_HEIGHT           = 28                       * GAME_SCALAR,
    PADDLE_STEP_SIZE        = 0.8                      * GAME_SCALAR,
    PADDLE_WIDTH            = 8                        * GAME_SCALAR,

	BOARD_WIDTH             = 512                      * GAME_SCALAR,
    BOARD_HEIGHT            = 256                      * GAME_SCALAR,

    DEFAULT_BALL_RADIUS     = 8                        * GAME_SCALAR,
    DEFAULT_BALL_SPEED      = 1                        * GAME_SCALAR, // max 7
    DEFAULT_BALL_MAX_SPEED  = DEFAULT_BALL_SPEED * 7   * GAME_SCALAR, // in either direction.
    DEFAULT_BALL_INCREMENT  = 1                        * GAME_SCALAR,

	DEFAULT_MUSHROOM_HEIGHT = 14					   * GAME_SCALAR,
	DEFAULT_MUSHROOM_WIDTH  = 14					   * GAME_SCALAR,
	DEFAULT_PEPPER_HEIGHT   = 28					   * GAME_SCALAR,
	DEFAULT_PEPPER_WIDTH    = 8					 	   * GAME_SCALAR,
}

// height 28 pixels
// move 4 pixels per movement
// Tics at 1/300 second

/* on hit of paddle, 
    moves in opposite x direction.
    same y direction
    if it hits top or bottom of the screen.
    reverses y direction. same x.

    edge = out of bounds. Score to whomever is on
    the opposite side of the edge.
*/

// max speeds -7 pixel to +7 pixels

// TODO: maybe add a scalar to config.