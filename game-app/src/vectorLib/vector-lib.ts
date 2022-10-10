// Basic Vec2 library

/**
 * Simple 2 dimensional vector with x & y coordinates. With a small Vec2Math library included.
 */
export class Vec2 {
	private _x : number;
	private _y : number;

    // ------------------------------------------------------------------------------------------------
	// Constructors
	constructor();
	constructor(x : number, y : number); 
    /**
     * Copy constructor
     * @param src Vec2 to copy.
     */
	constructor(src : Vec2);

	public constructor(src ?: Vec2 | number , y ?: number) {
		if (src instanceof Vec2) {
			this.x = src.x;
			this.y = src.y;
		}
		else  {
			this.x = src ?? 0;
			this.y = y ?? 0;
		}
	};

    // ------------------------------------------------------------------------------------------------
	// Setters
    set x (x : number) { this._x = x; }
    set y (y : number) { this._y = y; }
    
    // ------------------------------------------------------------------------------------------------
	// Getters
    get x () { return ( this._x );}
    get y () { return ( this._y );}

    // ------------------------------------------------------------------------------------------------
	// Simple Vec2 library
     /**
     * Adds two vectors together
     * @param v1 Vec2 base
     * @param v2 Vec2 to add
     * @returns sum of v1 & v2
     */
    static add(v1 : Vec2, v2 : Vec2) : Vec2 {
        return (new Vec2(v1.x + v2.x, v1.y + v2.y));
    }

    /**
     * Calculates the dotproduct of v1 and v2
     * @param v1 Vec2 base
     * @param v2 Vec2 to add
     * @returns dotProduct of V1 & v2 a number
     */
    static getDotProduct(v1 : Vec2, v2 : Vec2) : number {
        return ((v1.x * v2.x) + (v1.y * v2.y));
    }

    /**
     * Substracts v2 from v1
     * @param v1 Vec2 base
     * @param v2 Vec2 to substract from base
     * @returns result of substraction
     */
    static sub(v1 : Vec2, v2 : Vec2) : Vec2 {
        return (new Vec2(v1.x - v2.x, v1.y - v2.y));
    }

    /**
     * multiplies v1 with v2
     * @param v1 Base Vec2
     * @param v2 Vec2 to multiply with
     * @returns Product of v1 * v2
     */
    static multiply(v1 : Vec2, v2 : Vec2) : Vec2 {
        return (new Vec2(v1.x * v2.x, v1.y * v2.y));
    }

    /**
     * Multiplies v1 with num
     * @param v1 Base Vec2
     * @param num 
     * @returns product of V1 * num
     */
    static vec2MultNumber(v1 : Vec2, num : number) {
        return (new Vec2(v1.x * num, v1.y * num));
    }

    /**
     * Normalizes v1
     * @param v1 Vec2 to normalize
     * @returns new normalized vector of v1
     */
    static normalize(v1 : Vec2) {
        let length : number = Math.sqrt(v1.x * v1.x + v1.y * v1.y);
        return (new Vec2(v1.x / length, v1.y / length));
    }
    /**
     * 
     * @param v1 Base Vec2 to pow
     * @param power number to take power of
     * @returns result of v1 power of num
     */
    static pow(v1 : Vec2, power : number) {
        return (new Vec2(Math.pow(v1.x, power), Math.pow(v1.y, power)));
    }
}
