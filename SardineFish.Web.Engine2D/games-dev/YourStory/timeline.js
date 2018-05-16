import { GameSystem } from "./game-system.js";
import { NPC, Player, Character } from "./lib.js";
import { Entity } from "./entity.js";
import { InEvent } from "./story-state.js";
class TimeLine
{
    /**
     * 
     * @param {Array<SotryEvent>} events 
     */
    constructor(events)
    {
        /** @type {Array<SotryEvent>} */
        this.events = events || [];
        this.currentIdx = -1;
    }

    /**
     * @type {SotryEvent}
     */
    get current()
    {
        return this.events[this.currentIdx];
    }

    /** @type {SotryEvent} */
    get next()
    {
        if (this.currentIdx >= this.events.length)
            return null;
        return this.events[this.currentIdx + 1];
    }

    start()
    {
        //GameSystem.scene.onUpdate.add((e) => this.update(e.dt));
        /*if (this.events.length > 0)
        {
            this.currentIdx = 0;
            this.current.start();
        }*/
    }

    /** @returns {SotryEvent} */
    goNext()
    {
        if (this.next)
        {
            this.currentIdx++;
            this.current.start();
            return this.current;
        }
        return null;
    }

    writeEvent(event)
    {
        this.events.splice(this.currentIdx++, 0, event);
    }

    update(dt)
    {
        if (this.current)
        {
            this.current.update(dt);
        }     
        
    }

    /**
     * 
     * @param {SotryEvent} event 
     */
    add(event)
    {
        this.events.push(event);
    }
}

class SotryEvent
{
    /**
     * 
     * @param {Number} position 
     */
    constructor(position)
    {
        this.position = position;
        /** @type {TimeLine} */
        this.timeline = null;
        this.enableAsideText = true;
        this.earlyEvent = false;
    }

    start()
    {
        
    }

    update(dt)
    {

    }

}

class InitialEvent extends SotryEvent
{
    start()
    {
        GameSystem.showAsideText("我是谁？……", 15)
            .then(() => GameSystem.showAsideText("我在哪……", 15))
            .then(() => GameSystem.showAsideText("……"));
        GameSystem.gameState.changeState(new InEvent());
    }
}

class SpawnNPC extends SotryEvent
{
    /**
     * 
     * @param {Number} pos 
     * @param {NPC} npc 
     */
    constructor(pos, npc, discription)
    {
        super(pos);
        this.npcID = GameSystem.getEntityID(npc);
        if (this.npcID < 0)
        {
            this.npc = new NPC(pos);
        }    
        this.discription = discription || `${GameSystem.player.name}遇到了${this.npc.name}`;
        this.earlyEvent = true;
    }
    /** @type {NPC} */
    get npc()
    {
        return GameSystem.getEntity(this.npcID);
    }
    /** @param {NPC} npc*/
    set npc(npc)
    {
        if (npc.id < 0)
            GameSystem.addEntity(npc);
        this.npcID = GameSystem.getEntityID(npc);
    }
    start()
    {
        //GameSystem.showAsideText(`${GameSystem.player.name}遇到了一个NPC`);
        GameSystem.spawn(this.npc, this.position);
        GameSystem.gameState.changeState(new InEvent());
    }
}
class Conversation extends SotryEvent
{
    constructor(position, speaker, text)
    {
        super(position);
        this.text = text;
        this.speakerID = null;
        if (speaker instanceof Number)
            this.speakerID = speaker;
        else if (speaker instanceof Entity)
            this.speakerID = GameSystem.getEntityID(speaker);
        this.earlyEvent = false;
    }
    set speaker(value)
    {
        this.speakerID = value;
    }
    get speaker()
    {
        return GameSystem.getEntity(this.speakerID);
    }
    start()
    {
        GameSystem.showAsideText(`${this.speaker.name}: ${this.text}`)
            .then(() => this.timeline.goNext());
    }
}

export { TimeLine , InitialEvent, SpawnNPC };