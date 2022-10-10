export enum Direction {
	up      = 1,
	down    = -1,
	right   = 1,
	left    = -1,
}

/**
 * Defined values for the game in pixels.
 */
export enum GameConfig {
	PADDLE_HEIGHT   = 28,
    PADDLE_STEP_SIZE = 4,
    PADDLE_SIZE     = 28,
	BOARD_WIDTH     = 512,
    BOARD_HEIGHT    = 256,
}

// height 28 pixels
// move 4 pixels per movement
// Tics at 1/30 second

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