import { State } from "./states.js";
import { Message } from "./message.js";
import { Global } from "./global.js";
let positionSymbol = Symbol("position");
/**
 * @class
 * @property {number} id - A unique ID that represent this entity.
 * @property {string} name - The name of this entity.
 * @property {State} state - The current state of this entity.
 * @property {State} previousState - The previous state of this entity.
 * @property {State} globalState - The global state of this entity.
 */
export class Entity
{
    /**
     * 
     * @param {number} id - A unique ID that represent this entity.
     * @param {number} [x] - X position.
     * @param {number} [y] - Y position.
     */
    constructor(id, x, y)
    {
        this.id = id;
        this.name = "Entity-" + id;
        /**
         * @type {State}
         */
        this.state = null;
        /**
         * @type {State}
         */
        this.previousState = null;
        /**
         * @type {State}
         */
        this.globalState = null;
        x = x || 0;
        y = y || 0;
        this[positionSymbol] = new Vector2(x, y);
        this.detectDistance = 0;
        this.disposed = false;
    }

    get position()
    {
        return this[positionSymbol];
    }
    set position(value)
    {
        this[positionSymbol] = value;
    }

    get blockPosition()
    {
        return new Vector2(parseInt(this.position.x), parseInt(this.position.y));
    }

    update(dt)
    {
        if (this.state)
            this.state.update(dt);
    }


    /**
     * Change the state of current animal.
     * @param {State} state - The next state.
     */
    changeState(state)
    {
        if (this.state)
        {
            this.state.onExit(state);
            this.state.disposed = true;
        }
        var previous = this.state;
        this.state = state;
        this.state.onEnter(previous);
    }

    /**
     * 
     * @param {Message} message 
     */
    onMessage(message)
    {
        
    }
}