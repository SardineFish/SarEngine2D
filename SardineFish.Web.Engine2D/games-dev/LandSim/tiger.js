import { Animal, AnimalState } from "./animal.js";
import { State } from "./states.js";
import { map, scene, BlockSize } from "./global.js";
import { Block } from "./map.js";
import { Message, MessageTypes, SoundMessage } from "./message.js";
import { Global } from "./global.js";
import { Deer, DeerDead } from "./deer.js";
import { Wave } from "./wave.js";

export class Tiger extends Animal
{
    constructor(id, x, y)
    {
        super(id, "tiger");
        this.energy = Tiger.EnergyDefault;
        this.detectDistance = Tiger.DetectDistance;
        this.visualRange.distance = Tiger.VisualDistance;
        this.visualRange.ang = Tiger.VisualAngle;

        var pol = new Polygon([new Point(15, 0), new Point(-12.5, -12.5), new Point(-12.5, 12.5)]);
        pol.fillStyle = "#ffdfa6";
        pol.strokeStyle = "rgba(0,0,0,0)";
        this.gameObject.graphic = pol;
        this.gameObject.collider = pol;
        this.gameObject.mass = 2;
        this.gameObject.collider.rigidBody = true;
        //scene.addGameObject(this.gameObject, 1);
        this.gameObject.moveTo(x, y);
    }

    onMessage(message)
    {
        
    }

    onDisplay()
    {
        this.changeState(new TigerWander(this));
    }

    isHungry()
    {
        return (this.energy < Tiger.EnergyDefault - 5000000);
            
    }

    isFull()
    {
        return (this.energy > Tiger.EnergyDefault);
    }

    seekFood()
    {
        
    }

    /**
     * 
     * @param {Animal} target 
     */
    checkFood(target)
    {
        return (target.state instanceof DeerDead && target.energy > 0);
    }

    static get DetectDistance() { return 200; }
    static get VisualDistance() { return 200; }
    static get VisualAngle() { return Math.PI / 3; }
    static get MemoryTime() { return 10; }
    static get MaxChaseTime() { return 10000; }
    static get EnergyDefault() { return 500000000; }
}

export class TigerGlobal extends State
{
    update(dt)
    {
    }
    onEnter(previousState)
    {

    }
    onExit(nextState)
    {

    }
    constructor(tiger)
    {
        super(tiger);
    }
}

export class TigerWander extends State
{
    /**
     * 
     * @param {Tiger} tiger 
     */
    constructor(tiger)
    {
        super(tiger);
        this.animal = tiger;
        
        this.maxPower = 40000;
        this.power = 0;
        this.maxTurn = 0.1;
        this.maxForce = 5000;
        this.visualDistance = Tiger.VisualDistance;
        this.visualAngle = Tiger.VisualAngle;
    }
    update(dt)
    {
        if (this.animal.isHungry())
        {
            this.animal.changeState(new TigerForge(this.animal));
            return;
        }
        if (this.direction)
            this.animal.moveTo(this.direction, this.power, this.maxForce, this.maxTurn, dt);
    }

    AIUpdate()
    {
        if (this.disposed)
            return;
        
        // Visual
        this.animal.clearMemory();
        this.animal.visual(this.visualDistance, this.visualAngle);

        // Guard
        for (let i = 0; i < this.animal.positionMemory.length; i++)
        {
            var memory = this.animal.positionMemory[i];
            if (memory.entity instanceof Deer && memory.entity.HP>0)
            {
                this.animal.changeState(new TigerForge(this.animal));
                return;
            }
            else if (this.animal.checkFood(memory.entity))
            {
                this.animal.changeState(new TigerEat(this.animal, memory.entity));
                return;
            }    
        }
        
        let state = this;
        setTimeout(function() {
            state.AIUpdate.call(state);
        }, 100);
    }

    onEnter(previousState)
    {
        this.nextTarget();
        this.AIUpdate();
    }
    onExit(nextState)
    {
        this.animal = null;
    }
    nextTarget()
    {
        if (!this.animal)
            return;
        if (Math.random() < 0.75)
        {
            this.direction = this.animal.randomDirection();
            this.power = this.maxPower * Math.random();
        }
        else
            this.direction = null;
        
        var state = this;
        setTimeout(function ()
        {
            state.nextTarget.call(state);
        }, 1000 + 2000 * Math.random());
    }
}
export class TigerForge extends AnimalState
{
    /**
     * 
     * @param {Tiger} tiger 
     */
    constructor(tiger)
    {
        super(tiger)

        this.direction = null;
        this.visualDistance = Tiger.VisualDistance * 1.5;
        this.visualAngle = Math.PI * 2 / 3;
        this.power = 50000;
        this.maxTurn = 0.1;
        this.maxForce = 5000;
    }

    update(dt)
    {
        if (this.direction  && this.animal.moveTo(this.direction,this.power,this.maxForce,this.maxTurn,dt))
        {
            this.direction = null;
        }    
    }

    

    AIUpdate()
    {
        if (this.disposed)
            return;
        
        // Visual
        this.animal.clearMemory();
        this.animal.visual(this.visualDistance, this.visualAngle);

        // Guard
        let chaseList = [];
        for (let i = 0; i < this.animal.positionMemory.length; i++)
        {
            var memory = this.animal.positionMemory[i];
            if (memory.entity instanceof Deer)
            {
                chaseList[chaseList.length] = memory.entity;
            }
        }

        // Lock target
        let minDist = Number.MAX_SAFE_INTEGER;
        let nearestTarget = null;
        for (let i = 0; i < chaseList.length; i++)
        {
            let target = chaseList[i];
            let distance = Vector2.minus(target.position, this.animal.position).mod();
            if (distance < minDist)
            {
                minDist = distance;
                nearestTarget = target;
            }    
        }
        if (nearestTarget)
        {
            this.animal.changeState(new TigerAttack(this.animal, nearestTarget));
            return;
        }
    }

    nextTarget()
    {
        if (!this.disposed)
            return;
        this.direction = this.animal.randomDirection();
        var state = this;
        setTimeout(function ()
        {
            state.nextTarget.call(state);
        }, 1000 * Math.random());
    }

    onEnter(previousState)
    {
        this.AIUpdate();
        this.nextTarget();
    }
}
export class TigerAttack extends AnimalState
{
    /**
     * 
     * @param {Tiger} tiger 
     * @param {Deer} target 
     */
    constructor(tiger, target)
    {
        super(tiger);
        this.target = target;

        this.lostTarget = false;
        this.direction = null;
        this.damage = 30;
        this.power = 100000;
        this.maxForce = 10000;
        this.maxTurn = 0.05;
        this.visualDistance = Tiger.visualDistance * 1.5;
        this.visualRange = Math.PI;
        this.startTime = 0;
    }

    update(dt)
    {
        if (this.direction)
        {
            this.animal.moveTo(this.direction, this.animal.powerLimit(this.power, Tiger.EnergyDefault), this.maxForce, this.maxTurn, dt);
        }

        // Attack
        if (this.animal.attack(this.target, this.damage))
        {
            this.animal.gameObject.collider.collide(this.animal.gameObject, this.target.gameObject, dt);
            var wave = new Wave(Global.RegisterID(), this.animal.position.x, this.animal.position.y, 50, 100);
            wave.color = new Color(255, 0, 0, 0.1);
            Global.AddEntity(wave);
        }
    }

    AIUpdate()
    {
        if (this.disposed)
            return true;
        
        // Visual
        this.animal.visual(this.visualDistance, this.visualRange);

        // Guard
        this.lostTarget = true;
        for (let i = 0; i < this.animal.positionMemory.length; i++)
        {
            var memory = this.animal.positionMemory[i];
            if (memory.entity === this.target && !memory.isExpired(Tiger.MemoryTime))
            {
                this.lostTarget = false;
            }    

        }
        if (this.lostTarget)
        {
            this.animal.changeState(new TigerWander(this.animal));
            return;
        }

        // Check alive
        if (this.target.state instanceof DeerDead)
        {
            this.animal.changeState(new TigerEat(this.animal, this.target));
            return;
        }

        // Chase
        this.direction = this.animal.chase(this.target);

        // Give up
        if (new Date().getTime() - this.startTime > Tiger.MaxChaseTime)
        {
            this.animal.changeState(new TigerWander(this.animal));
            return;
        }

        
        
        let state = this;
        setTimeout(function() {
            state.AIUpdate.call(state);
        }, 100);
    }

    onEnter(previousState)
    {
        this.startTime = new Date().getTime();
        this.AIUpdate();
    }
}
export class TigerEat extends AnimalState
{
    /**
     * 
     * @param {Tiger} tiger 
     * @param {Animal} food 
     */
    constructor(tiger, food)
    {
        super(tiger);
        
        this.food = food;
        this.visualDistance = Tiger.visualDistance * 0.5;
        this.visualAngle = Math.PI / 6;
        this.power = 100000;
        this.maxForce = 10000;
        this.maxTurn = 0.15;
        this.eatSpeed = 10000000;
    }

    update(dt)
    {
        if (this.animal.gameObject.graphic.isCollideWith(this.food.gameObject.graphic))
        {
            var eat = this.eatSpeed * dt;
            if (this.food.energy < eat)
                eat = this.food.energy;
            this.food.energy -= eat;
            this.animal.energy += eat / 10;
            if (this.food.energy <= 0)
            {
                this.animal.changeState(new TigerWander(this.animal));
                return;
            }    
        }
        else
            this.animal.moveTo(this.food.position, this.power, this.maxForce, this.maxTurn, dt);
    }

    AIUpdate()
    {
        if (this.disposed)
            return;    
        // Visual
        this.animal.visual(this.visualDistance, this.visualAngle);

        // Guard
        for (let i = 0; i < this.animal.positionMemory.length; i++)
        {
            var memory = this.animal.positionMemory[i];
            /*
                Check danger
            */
        }

        let state = this;
        setTimeout(function() {
            state.AIUpdate.call(state);
        }, 100);

    }

    onEnter()
    {
        this.AIUpdate();
    }
}
export class TigerCautious extends State
{
    constructor(tiger)
    {
        super(tiger);
    }
}
export class TigerInDanger extends State
{
    constructor(tiger)
    {
        super(tiger);
    }
}