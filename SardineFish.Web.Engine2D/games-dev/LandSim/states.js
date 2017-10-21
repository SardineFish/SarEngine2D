import { Entity } from "./entity.js";
/**
 * @class
 */
export class State
{
    update(dt)
    {
        
    }

    AIUpdate()
    {
        
    }

    /**
     * Excute when change to this state.
     * @param {State} previousState - The previous state before changing.
     */
    onEnter(previousState)
    {

    }

    /**
     * Excute when current state is being changed. 
     * @param {State} nextState - The next state after state changing.
     */
    onExit(nextState)
    {
        this.disposed = true;
    }

    /**
     * 
     * @param {Entity} entity - The animal that owning this state.
     */
    constructor(entity)
    {
        /**
         * @type {Entity}
         */
        this.entity = entity;
        this.disposed = false;
    }
}