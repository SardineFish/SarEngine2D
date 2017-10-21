import { BlockSize, Global } from "./global.js";
import { State } from "./states.js";
import { Message, MessageTypes, AttackMessage } from "./message.js";
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
        this.HP = Animal.HPDefault;
        /**
         * @type {Array<PositionMemory>}
         */
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
    onMessage(message)
    {
    }

    static get HPDefault() { return 100; }
    static get EnergyDefault() { return 200000000; }
    static get MemoryTime() { return 7; }
    static get visualDistance() { return 200; }
    static get visualAngle() { return Math.PI / 3; }
    
    /**
     * Limit the output power due to the enerty consumption;
     * @param {Number} power - The max power.
     * @param {Number} reference - The reference of the energy.
     */
    powerLimit(power, reference)
    {
        if (this.energy > reference)
            return power * (Math.log((this.energy / reference)) + 1) * (this.HP / Animal.HPDefault);
        else
            return power * Math.exp((((this.energy / reference) - 1) * 20)) * (this.HP / Animal.HPDefault);
    }

    /**
     * Check if this animal is hungry.
     * @returns {Boolean}
     */
    isHungry()
    {
        return false;
    }

    /**
     * Check whether this animal is full.
     * @returns {Boolean}
     */
    isFull()
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
            direction = Vector2.minus(target,this.gameObject.position).normalize(target);
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
     * 
     * @param {Number} visualDistance 
     * @param {Number} visualAngle 
     */
    visual(visualDistance, visualAngle)
    {
        for (let i =0; i < Global.Entities.length; i++)
        {
            let entity = Global.Entities[i];
            if (entity && entity !== this)
            {
                if (this.isVisible(visualDistance, visualAngle, entity))
                {
                    var inMemory = false;
                    for (let j = 0; j < this.positionMemory.length; j++)
                    {
                        if (this.positionMemory[j].entity === entity)
                        {
                            this.positionMemory[j].position = new Vector2(entity.position.x, entity.position.y);
                            inMemory = true;
                            break;
                        }
                    }
                    if (!inMemory)
                    {
                        this.positionMemory[this.positionMemory.length] = new PositionMemory(entity, new Vector2(entity.position.x, entity.position.y));
                    }
                }
            }
        }
    }

    /**
     * Check whether an entity can be seen by this animal.
     * @param {Number} visualDistance 
     * @param {Number} visualRange 
     * @param {Entity} target 
     */
    isVisible(visualDistance, visualAngle, target)
    {
        var dx = new Vector2(target.position.x - this.position.x, target.position.y - this.position.y);
        let distance = dx.mod();
        if (distance < visualDistance + target.detectDistance && Math.acos(Vector2.multi(this.forward, dx) / distance) < visualAngle)
            return true;
        else
            return false;
    }

    /* @param {number } visualDistance - The max visual distance this animal.*/
    /* @param {number } visualRange - The max visual range.*/
    /**
     * Check if there is any danger.
     * @param {number} menaceDistance - The distance that can menace this animal.
     * @param {Animal} target - The target to guard against.
     * @returns {number} - The level of danger.
     */
    guard(/*visualDistance, visualRange, */menaceDistance, target)
    {
        var dx = new Vector2(target.position.x - this.position.x, target.position.y - this.position.y);
        let distance = dx.mod();
        var x = distance / menaceDistance;
        x = -Math.log(x);
        if (x <= 0)
            x = 0;
        return x;

        /*
        if (distance > visualDistance + target.detectDistance)
            return 0;
        if (Math.acos(Vector2.multi(this.forward, dx) / distance) < visualRange)
        {
            this.positionMemory[target.id] = target.position;
        }
        else
            return 0;
        */
    }

    /**
     * Calculate a direction presented as angle that determind how this animal can escape from the given danger;
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
                v = new Vector2(this.gameObject.position.x - danger.position.x, this.gameObject.position.y - danger.position.y);
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

    /**
     * Calculate a direction presented as angle to chase a target.
     * @param {Animal} target - The target to chase.
     */
    chase(target)
    {
        let dv = Vector2.minus(target.position, this.position);
        let dx = dv.mod();
        let t = dx / (this.gameObject.v.mod() - target.gameObject.v.mod());
        return Math.atan2(dv.y, dv.x);
        if (t < 0)
        {
            return Math.atan2(dv.y, dv.x);
        }
        let posPredicted = Vector2.plus(target.position, Vector2.multi(target.gameObject.v, t));
        dv = Vector2.minus(posPredicted, target.position);
        return Math.atan2(dv.y, dv.x);
    }

    /**
     * Attack a specific target.
     * @param {Animal} target - The target to attack.
     */
    attack(target, damage)
    {
        if (this.gameObject.graphic.isCollideWith(target.gameObject.graphic))
        {
            var msg = new AttackMessage(this, target, damage);
            msg.dispatch();
            return true;
        }
        return false;
    }

    /**
     * Clear the memory.
     */
    clearMemory()
    {
        this.positionMemory = [];
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
        /**
         * @type {Animal}
         */
        this.animal = animal;
    }
}
export class Danger
{
    /**
     * 
     * @param {Entity} source - The source of danger.
     * @param {number} level - The level of danger.
     * @param {Vector2} position - The position of danger.
     */
    constructor(source, level, position)
    {
        this.source = source;
        this.level = level;
        this.position = position;
    }
}
const positionSymbol = Symbol("position");
export class PositionMemory
{
    /**
     * 
     * @param {Entity} entity 
     * @param {Vector2} position 
     */
    constructor(entity, position)
    {
        this.entity = entity;
        this[positionSymbol] = position;
        this.timestamp = new Date().getTime();
        if (entity === "?")
            this.entity = Global.UnknownEntity;
        else if (entity instanceof Number)
            this.entity = Global.Entities[entity];  
    }

    get position()
    {
        return this[positionSymbol];
    }

    set position(value)
    {
        this[positionSymbol] = value;
        this.timestamp = new Date().getTime();
    }

    /**
     * Check wheter this memory is expired.
     * @param {Number} memoryTime - The time in seconds.
     */
    isExpired(memoryTime)
    {
        if (new Date().getTime() - this.timestamp > memoryTime * 1000)
            return true;
        return false;
    }
}
