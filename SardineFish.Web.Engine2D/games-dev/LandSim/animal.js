import { BlockSize } from "./global.js";
import { State } from "./states.js";
import { Message, MessageTypes } from "./message.js";
import { Entity } from "./entity.js";
import { RenderableEntity } from "./renderableEntity.js";
export class Animal extends RenderableEntity
{
    /**
     * 
     * @param {number} id - The ID of this animal.
     * @param {string} species - The info of the species of this animal. 
     */
    constructor(id, species)
    {
        super(id);
        this.species = species;
        this.name = species + "-" + id;
        this.energy = 0;
        this.age = 0;
        this.positionMemory = [];
        this.forward = new Vector2(0, 1);
        this.visualRange = { distance: 200, ang: Math.PI };
    }

    /**
     * 
     * @param {number} dt - The time in seconds from last update.
     */
    update(dt)
    {
        this.forward.x = Math.cos(this.gameObject.rotation);
        this.forward.y = Math.sin(this.gameObject.rotation);
        super.update(dt);
    }

    /**
     * 
     * @param {Message} message 
     */
    onMSessage(message)
    {
    }

    /**
     * Check if this animal is hungry.
     */
    isHungry()
    {
        return false;
    }

    /**
     * Move this animal to a target.
     * @param {Vector2 | number} target - The target of the moving behavior.
     * @param {number} power - The power use in this behavior.
     * @param {number} maxForce - The max of the force that this behavior can use.
     * @param {number} maxTurn - The max angle when this animal turn around.
     * @param {number} dt - The delta time.
     */
    moveTo(target, power, maxForce, maxTurn, dt)
    {
        this.energy -= power * dt;
        //this.gameObject.v = Vector2.multi(this.forward, 40 * Math.random());
        var distance = Number.MAX_VALUE;
        var ang = 0;
        var direction = new Vector2(0, 0);
        if (target instanceof Vector2)
        {
            ang = Math.atan2(target.y - this.gameObject.position.y, target.x - this.gameObject.position.x) - Math.atan2(this.forward.y, this.forward.x);
            distance = Vector2.minus(target, this.gameObject.position).mod();
            direction = Vector2.normalize(target);
        }
        else if (!isNaN(target))
        {
            ang = target - Math.atan2(this.forward.y, this.forward.x);
            direction.x = Math.cos(target);
            direction.y = Math.sin(target);
        }
        if (ang > Math.PI)
        {
            ang = ang - Math.PI * 2;
        }
        else if (ang < -Math.PI)
        {
            ang = Math.PI * 2 + ang;
        }
        var F = null;
        if (this.gameObject.v.mod() <= 0)
        {
            F = Vector2.multi(direction, maxForce);
        }
        else
        {
            F = power / this.gameObject.v.mod();
            if (F > maxForce)
                F = maxForce;
            F = Vector2.multi(direction, F);
        }
        /*if (distance < 1)
            return true;*/
        if (distance > (this.gameObject.v.mod() * this.gameObject.v.mod()) / (this.gameObject.scene.physics.f / this.gameObject.mass * 2))
            this.gameObject.F = F;
        else
            return true;

        if (ang > maxTurn)
        {
            this.gameObject.rotate(maxTurn);
        }
        else if (ang < -maxTurn)
        {
            this.gameObject.rotate(-maxTurn);
        }
        else
        {
            this.gameObject.rotate(ang);
        }
        return false;
    }

    /**
     * Turn to a specific angle.
     * @param {number} angle - The angle to turn to.
     * @param {number} maxTurn - The max angle to turn each time.
     * @param {number} dt - The delta time.
     */
    turnTo(angle, maxTurn, dt)
    {
        let ang = angle - Math.atan2(this.forward.y, this.forward.x);
        if (ang > Math.PI)
        {
            ang = ang - Math.PI * 2;
        }
        else if (ang < -Math.PI)
        {
            ang = Math.PI * 2 + ang;
        }
        if (0.001 < ang && ang <= 0.001)
            return true;
        
        if (ang > maxTurn)
            this.gameObject.rotate(maxTurn);
        else if (ang < -maxTurn)
            this.gameObject.rotate(-maxTurn);
        else
            this.gameObject.rotate(ang);
        return false;
    }

    /**
     * Get an direction randomly.
     */
    randomDirection()
    {
        var direction = (Math.tan((Math.random() - 0.5) * Math.PI * 0.93) / 20 + 0.5) * Math.PI * 2 - Math.PI;
        //var direction = Math.random() * Math.PI * 2 - Math.PI;
        direction += Math.atan2(this.forward.y, this.forward.x);
        return direction;
    }

    /**
     * Check if there is any danger.
     * @param {number} visualDistance - The max visual distance this animal.
     * @param {number} visualRange - The max visual range.
     * @param {number} menaceDistance - The distance that can menace this animal.
     * @param {Animal} target - The target to guard against.
     * @returns {number} - The level of danger.
     */
    guard(visualDistance, visualRange, menaceDistance, target)
    {
        var dx = new Vector2(target.position.x - this.position.x, target.position.y - this.position.y);
        let distance = dx.mod();
        if (distance > visualDistance + target.detectDistance)
            return 0;
        if (Math.acos(Vector2.multi(this.forward, dx) / distance) < visualRange)
        {
            this.positionMemory[target.id] = target.position;
            return parseInt(menaceDistance / distance);
        }
        else
            return 0;
    }

    /**
     * 
     * @param {Array<Danger>} dangerList - A list of menaces.
     * @returns {number} - The angle of direction to flee.
     */
    flee(dangerList)
    {
        let fleeVector = new Vector2(0,0);
        for (let i = 0; i < dangerList.length; i++)
        {
            let danger = dangerList[i];
            let v = new Vector2();
            if (danger.source instanceof Animal)
            {
                v = new Vector2(this.gameObject.position.x - danger.source.position.x, this.gameObject.position.y - danger.source.position.y);
            }
            else
                continue;    
            v.normalize();
            v.multi(danger.level);
            fleeVector.plus(v);
        }
        fleeVector.normalize();
        return Math.atan2(fleeVector.y, fleeVector.x);
    }
}
export class AnimalState extends State
{
    /**
     * 
     * @param {Animal} animal 
     */
    constructor(animal)
    {
        super(animal);
        this.animal = animal;
    }
}
export class Danger
{
    /**
     * 
     * @param {Entity} source - The source of danger.
     * @param {number} level - The level of danger.
     */
    constructor(source, level)
    {
        this.source = source;
        this.level = level;
    }
}
