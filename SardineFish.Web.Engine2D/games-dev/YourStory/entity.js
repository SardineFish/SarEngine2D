import { Player } from "./lib.js";
import { GameSystem } from "./game-system.js";
class Entity
{
    constructor()
    {
        this.gameObject = new GameObject();
        GameSystem.scene.addGameObject(this.gameObject);
    }
    get position()
    {
        return this.gameObject.position;
    }
    set position(value)
    {
        this.gameObject.moveTo(value.x, value.y);
    }

    /**
     * 
     * @param {Player} player 
     */
    interact(player)
    {

    }
}
export { Entity };