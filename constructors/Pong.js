/**
 * Class representing a Pong in the game.
 * Handles its position, speed, drawing, and updates.
 */
export class Pong {
    /** @type {{ x: number, y: number }} */
    position;
    /** @type {{ x: number, y: number }} */
    speed;
    /** @type {number} */
    maxSpeed;
    /** @type {number} */
    size;
    /** @type {CanvasRenderingContext2D} */
    context;
    
    /**
     * @param {{ 
     *  position: { x: number, y: number }, 
     *  speed?: { x: number, y: number }, 
     *  maxSpeed: number, 
     *  size: number 
     * }} 
     */
    constructor({ position, speed = { x: 0, y: 0 }, maxSpeed, size }) {
        this.position = position;
        this.speed = speed;
        this.maxSpeed = maxSpeed;
        this.size = size;
    }

    /**
     * Draws the pong on the canvas.
     * Should be called every frame.
     * @warns Ensure that `context` is set before calling this method.
     */
    draw() {
        this.context.fillRect(this.position.x, this.position.y, this.size, this.size);
    }

    /**
     * Updates the position of the pong based on its speed.
     * Should be called every frame.
     */
    update() {
        this.position.x += this.speed.x;
        this.position.y += this.speed.y;
    }

    /**
     * Used to increase or decrease the y speed of the pong
     * while ensuring it does not exceed the max speed.
     * @param {number} increment 
     */
    limitYSpeed(increment) {
        this.speed.y += increment;

        if (this.speed.y > 0) 
            this.speed.y = Math.min(this.speed.y, this.maxSpeed);
        else 
            this.speed.y = Math.max(this.speed.y, -this.maxSpeed);
    } 
}