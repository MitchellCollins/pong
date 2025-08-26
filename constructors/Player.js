/**
 * Represents a player in the Pong game.
 * Handles its position, speed, drawing, and updates.
 */
export class Player {
    /** @type {{ x: number, y: number }} */
    position;
    /** @type {number} */
    speed;
    /** @type {number} */
    maxSpeed;
    /** @type {number} */
    height;
    /** @type {number} */
    width;
    /** @type {CanvasRenderingContext2D} */
    context;
    /** @type {number} */
    score = 0;

    /**
     * @param {{
     *  position: { x: number, y: number },
     *  speed?: number,
     *  maxSpeed: number,
     *  height: number,
     *  width: number
     * }}
     */
    constructor({ position, speed = 0, maxSpeed, height, width }) {
        this.position = position;
        this.speed = speed;
        this.maxSpeed = maxSpeed;
        this.height = height;
        this.width = width;
    }

    /**
     * Draws the player on the canvas.
     * Should be called every frame.
     * @warns Ensure that `context` is set before calling this method.
     */
    draw() {
        // Moves player up half its size
        // So that position is relative to its center
        this.context.fillRect(this.position.x, this.position.y - this.height / 2, this.width, this.height);
    }

    /**
     * Updates the position of the player based on its speed.
     * Should be called every frame.
     */
    update() {
        this.position.y += this.speed;
    }
}