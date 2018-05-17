import { GameSystem } from "./game-system.js";
import { Player, NPC } from "./lib.js";
import { SpawnNPC } from "./timeline.js";

class Choice
{
    constructor()
    {
        this.description = "";
    }

    activate()
    {

    }
}

class MeetKnownNPC extends Choice
{
    constructor()
    {
        super();
        /** @type {NPC} */
        this.npc = null;
        if (GameSystem.player.familiarNPCs.length > 0)
        {
            this.npc = randomFromList(GameSystem.player.familiarNPCs);    
        }
        this.description = randomFromList([
            `遇到了刚认识的${this.npc.name}`,
            `再次遇到了${this.npc.name}`,
            `又是${this.npc.name}`,
        ]);
    }

    activate()
    {
        let event = new SpawnNPC(GameSystem.playerPos + GameSystem.spawnDistance, this.npc, this.description);
        GameSystem.timeline.add(event);
    }
}

class MeetStranger extends Choice
{
    constructor()
    {
        super();
        this.description = randomFromList([
            "一个人",
            "一个人类",
            "一个陌生人",
            "一个陌生的身影"
        ]);
    }

    activate()
    {
        GameSystem.timeline.add(new SpawnNPC(GameSystem.playerPos + GameSystem.spawnDistance, new NPC(GameSystem.playerPos + GameSystem.spawnDistance), this.description));
    }
}

/**
 * 
 * @param {Array<any>} list 
 * @returns {any}
 */
function randomFromList(list)
{
    return list[Math.floor(Math.random() * list.length)];
}


export { randomFromList, MeetKnownNPC, MeetStranger };