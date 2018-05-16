class State
{
    /**
     * 
     * @param {Number} dt 
     */
    update(dt)
    {

    }
    /**
     * 
     * @param {State} prevState 
     */
    enter(prevState)
    {

    }
    /**
     * 
     * @param {State} nextState 
     */
    exit(nextState)
    {

    }
}    
class FSM
{
    constructor()
    {
        /** @type {State} */
        this.currentState = null;
        /** @type {State} */
        this.prevState = null;
    }

    /**
     * 
     * @param {Number} dt 
     */
    update(dt)
    {
        if (this.currentState)
            this.currentState.update(dt);    
    }

    /**
     * 
     * @param {State} state 
     */
    changeState(state)
    {
        if (this.currentState)
            this.currentState.exit(state);
        this.prevState = this.currentState;
        this.currentState = state;
        state.enter(this.prevState);
    }
}

export { State, FSM };