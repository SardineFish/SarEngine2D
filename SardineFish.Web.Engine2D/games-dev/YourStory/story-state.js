import { State, FSM } from "./fsm.js";
import { GameSystem } from "./game-system.js";
import { TimeLine, Conversation } from "./timeline.js";
import { MeetStranger, MeetKnownNPC, randomFromList } from "./choices.js";
import { NPC } from "./lib.js";

class StoryStateMachine extends FSM
{
    constructor()
    {
        super();
        this.currentState = new Wander();
    }
}
class Wander extends State
{
    constructor()
    {
        super();
        this.startPos = 0;
        this.minWanderDistance = 800;
        this.maxWanderDistance = 3200;
        this.idleDistance = 0;
    }
    enter()
    {
        this.idleDistance = Math.random() * this.maxWanderDistance + this.minWanderDistance;
        this.startPos = GameSystem.playerPos;
    }
    update(dt)
    {
        if (GameSystem.timeline.next)
        {
            var nextEvent = GameSystem.timeline.next;
            if (GameSystem.playerPos - nextEvent.position > GameSystem.cancleDistance)
            {
                GameSystem.timeline.currentIdx++;
            }    
            if (nextEvent instanceof Conversation)
            {
                return;
            }    
            if (nextEvent.earlyEvent)
            {
                if (nextEvent.position - GameSystem.playerPos < GameSystem.spawnDistance)
                {
                    GameSystem.timeline.goNext();
                }
            }   
            else if (GameSystem.playerPos - nextEvent.position>=0)
            {
                GameSystem.timeline.goNext();
            }      
        }
        else
        {

            let distance = GameSystem.playerPos - this.startPos;
            if (distance > this.idleDistance)
            {
                GameSystem.gameState.changeState(new ChooseEvent());
            }    
        }
    }
}
class InEvent extends State
{
    constructor()
    {
        super();
        this.eventPos = 0;
        this.event = null;
    }
    enter()
    {
        this.event = GameSystem.timeline.current;
        this.eventPos = this.event.position;
    }
    update()
    {
        if (GameSystem.playerPos - this.eventPos > GameSystem.cancleDistance)
        {
            GameSystem.gameState.changeState(new Wander());
            GameSystem.hideChoice();
        }
    }
}

class ChooseEvent extends State
{
    constructor()
    {
        super();
        this.pos = 0;
    }
    enter()
    {
        this.pos = GameSystem.playerPos;
        /** @type {Choice} */
        let choices = [];
        if (Math.random() < 0.8)
            choices.push(new MeetStranger());
        if (Math.random() < 0.8)
        {
            /** @type {Array<MeetKnownNPC>} */
            let unknown = [];
            for (let i = 0; i < GameSystem.player.familiarNPCs.length * 2 / 3; i++)
            {
                if (Math.random() < 1 - i / GameSystem.player.familiarNPCs.length)
                {
                    let choice = new MeetKnownNPC();
                    if (unknown.some(un => un.npc === choice.npc))
                        break;
                    unknown.push(choice);
                }    
            }    
            choices = choices.concat(unknown);
        }    
        GameSystem.showChoice(`不远处，${GameSystem.player.name}……`, choices.map(c => c.description))
            .then((idx) =>
            {
                choices[idx].activate();
                GameSystem.gameState.changeState(new Wander());
            });
    }
    update(dt)
    {
        if (GameSystem.playerPos - this.pos > GameSystem.cancleDistance)
        {
            GameSystem.hideAsideText();
            GameSystem.gameState.changeState(new Wander());
        }    
    }
}
class Talking extends State
{
    /**
     * 
     * @param {NPC} target 
     */
    constructor(target)
    {
        super();
        this.target = target;
        this.npcTalking = false;
        this.talking = false;
        
    }

    enter()
    {
        if (GameSystem.getEntityID(this.target) === 2)
            GameSystem.player.familiarNPCs.push(this.target);    
        if (GameSystem.player.familiarNPCs.indexOf(this.target) < 0)
        {
            if (this.target.name == "NPC")
            {
                let greeting = randomFromList(["Hey~ ", "Hi! ", "你好哇, ", "〇_〇", "欸~"]);
                GameSystem.showAsideText(`不知名的NPC: ${greeting}我是$. `)
                    .then(fills =>
                    {
                        this.target.name = fills[0];
                        GameSystem.player.familiarNPCs.push(this.target);
                    });
            }    
        }    
    }

    update()
    {  
        if (GameSystem.playerPos - this.target.position.x > GameSystem.cancleDistance)
        {
            GameSystem.gameState.changeState(new Wander());
            GameSystem.hideChoice();
        }
        if (GameSystem.player.familiarNPCs.indexOf(this.target) < 0)
            return;
        if (this.talking)
            return;
        if (GameSystem.timeline.next && GameSystem.playerPos - GameSystem.timeline.next.position < GameSystem.cancleDistance)
        {
            GameSystem.timeline.goNext();
            this.talking = true;
        }   
        else
        {
            if (this.talking)
                return;    
            this.talking = true;
            if (this.npcTalking)
            {
                GameSystem.showAsideText(`${this.target.name}: $`).then(fills =>
                {
                    GameSystem.timeline.writeEvent(new Conversation(this.target.position.x, this.target, fills[0]));
                    this.talking = false;
                    this.npcTalking = false;
                });
            }  
            else
            {
                GameSystem.showAsideText(`${GameSystem.player.name}: $`).then(fills => {
                    GameSystem.timeline.writeEvent(new Conversation(this.target.position.x, GameSystem.player, fills[0]));
                    this.talking = false;
                    this.npcTalking = true;
                });
            }
        }
    }

}
export {
    StoryStateMachine,
    Wander,
    ChooseEvent,
    Talking,
    InEvent
};