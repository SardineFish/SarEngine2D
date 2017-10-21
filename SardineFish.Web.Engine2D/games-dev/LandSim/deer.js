import { Animal, AnimalState, Danger } from "./animal.js";
import {State} from "./states.js";
import {map,scene,BlockSize} from "./global.js";
import { Block } from "./map.js";
import { Message, MessageTypes, SoundMessage, AttackMessage } from "./message.js";
import { Global } from "./global.js";
import { Tiger } from "./tiger.js";

/**
 * A Deer
 * @class
 */
export class Deer extends Animal
{
    constructor(id, x, y)
    {
        super(id, "deer");
        this.energy = Deer.EnergyDefault;
        this.detectDistance = Deer.DetectDistance;
        this.visualRange.distance = Deer.VisualDistance;
        this.visualRange.ang = Deer.VisualAngle;
        var pol = new Polygon([new Point(10, 0), new Point(-10, -10), new Point(-10, 10)]);
        pol.setCenter(0, 0);
        pol.moveTo(0, 0);
        pol.fillStyle = "white";
        pol.strokeStyle = "rgba(0,0,0,0.05)";
        this.gameObject.graphic = pol;
        this.gameObject.collider = pol;
        this.gameObject.collider.rigidBody = true;
        //scene.addGameObject(this.gameObject, 1);
        this.gameObject.moveTo(x, y);
    }

    static get EnergyDefault() { return 200000000; }
    static get DetectDistance() { return 200; }
    static get VisualDistance() { return 200; }
    static get VisualAngle() { return Math.PI / 3;}

    /**
     * 
     * @param {Message} message 
     */
    onMessage(message)
    {
        if (message instanceof SoundMessage)
        {
            if(!(this.state instanceof DeerInDanger))
            this.changeState(new DeerCautious(this, Math.atan2(message.sound.position.y, message.sound.position.x)));
        }
        if (message instanceof AttackMessage)
        {
            this.HP -= message.damage;
            if (this.HP < 0)
            {
                this.HP = 0;
                this.changeState(new DeerDead(this));
                return;
            }
        }
    }

    onDisplay()
    {
        this.changeState(new DeerWander(this));
    }

    isHungry()
    {
        return (this.energy < Deer.EnergyDefault - 200000);
    }

    isFull()
    {
        return (this.energy > Deer.EnergyDefault);
    }

    checkFood()
    {
        var blockX = this.blockPosition.x;
        var blockY = this.blockPosition.y;
        if (map.get(blockX, blockY).type == Block.Types.Grass && map.get(blockX, blockY).resource > 0)
        {
            return true;
        }
        return false;
    }

    seekFood(visualDistance, visualAngle)
    {
        var blockX = this.blockPosition.x;
        var blockY = this.blockPosition.y;
        for (var dist = 0; dist < visualDistance; dist++)
        {
            var viewBlockX = parseInt((this.position.x + this.forward.x * dist) / BlockSize);
            var viewBlockY = parseInt((this.position.y + this.forward.y * dist) / BlockSize);

            if (map.get(viewBlockX, viewBlockY).type == Block.Types.Grass && map.get(viewBlockX, viewBlockY).resource > 0)
            {
                return new Vector2((viewBlockX + 0.5) * BlockSize, (viewBlockY + 0.5) * BlockSize);
            }
        }
        return false;
    }
}

export class DeerGlobalState extends AnimalState
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
    constructor(deer)
    {
        super(deer);
    }
}

export class DeerWander extends AnimalState
{
    /**
     * 
     * @param {Deer} deer 
     */
    constructor(deer)
    {
        super(deer);

        this.maxPower = 20000;
        this.power = 0;
        this.maxTurn = 0.02;
        this.maxForce = 2000;
        this.visualDistance = Deer.VisualDistance;
        this.visualAngle = Deer.VisualAngle;
    }
    update(dt)
    {
        if (this.direction)
            this.animal.moveTo(this.direction, this.power, this.maxForce, this.maxTurn, dt);
    }
    onEnter(previousState)
    {
        this.AIUpdate();
        this.nextTarget();
    }
    onExit(nextState)
    {
        this.animal = null;
    }
    AIUpdate()
    {
        if (this.disposed)
            return;
        
        // Hungry check
        if (this.animal.isHungry())
        {
            this.animal.changeState(new DeerForage(this.animal));
            return;
        }
        
        // Visual
        this.animal.visual(this.visualDistance, this.visualAngle);

        // Guard
        for (let i = 0; i < this.animal.positionMemory.length; i++)
        {
            if (this.animal.positionMemory[i].entity instanceof Tiger)
            {
                if (this.animal.guard(600, this.animal.positionMemory[i].entity))
                {
                    this.animal.changeState(new DeerInDanger(this.animal));
                    return;
                }
            }
        }


        let state = this;
        setTimeout(function ()
        {
            state.AIUpdate.call(state);
        }, 100);
    }
    nextTarget()
    {
        if (!this.animal)
            return;
        
        // Eat randomly
        if (Math.random() < 0.1 && this.animal.checkFood() ) {
            this.animal.changeState(new DeerEat(this.animal));
            return;
        }
        // Move to next position
        else if (Math.random() < 0.75) {
            this.direction = this.animal.randomDirection();
            this.power = this.maxPower * Math.random();
        }
        // Stop moving    
        else
            this.direction = null;
        /*
        this.target = new Vector2(Math.random() * 300 - 150, Math.random() * 300 - 150);
        console.log(this.target);
        this.target.plus(new Vector2(this.animal.gameObject.position.x, this.animal.gameObject.position.y));
        */
        var state = this;
        setTimeout(function ()
        {
            state.nextTarget.call(state);
        }, 1000 + 2000 * Math.random());
    }
}

export class DeerForage extends AnimalState
{
    /**
     * 
     * @param {Deer} deer 
     */
    constructor(deer)
    {
        super(deer);

        this.power = 30000;
        this.maxForce = 5000;
        this.maxTurn = 0.1;
        this.target = null;
        this.foundFood = false;
        this.visualDistance = Deer.VisualDistance * 1.2;
        this.visualAngle = Math.PI / 2;
    }
    update(dt)
    {
        if (this.target !== null)
        {
            if (this.animal.moveTo(this.target, this.power, this.maxForce, this.maxTurn, dt))
            {
                if (!this.animal.checkFood())
                {
                    this.foundFood = false;
                    this.nextDirection();
                } 
            }
        }
            
    }

    nextDirection()
    {
        if (this.foundFood)
            return;
        this.target = this.animal.randomDirection();
        
        let state = this;
        setTimeout(function() {
            state.nextDirection.call(state);
        }, 1000*Math.random());
    }

    AIUpdate()
    {
        if (this.disposed)
            return;
        
        // Chceck food
        if (this.animal.checkFood())
        {
            this.animal.changeState(new DeerEat(this.animal));
            return;
        }    
        
        // Seek food
        if (!this.foundFood)
            this.target = this.animal.seekFood(this.visualDistance, this.visualAngle);
        if (this.target)
        {
            this.foundFood = true;
        }  
        
        // Visual
        this.animal.visual(this.visualDistance, this.visualAngle);

        // Guard
        for (let i = 0; i < this.animal.positionMemory.length; i++)
        {
            if (this.animal.positionMemory[i].entity instanceof Tiger)
            {
                if (this.animal.guard(600, this.animal.positionMemory[i].entity))
                {
                    this.animal.changeState(new DeerInDanger(this.animal));
                    return;
                }
            }
        }


        let state = this;
        setTimeout(function ()
        {
            state.AIUpdate.call(state);
        }, 100);
    }
    onEnter(previousState)
    {
        this.AIUpdate();
        this.nextDirection();
    }

}

export class DeerEat extends AnimalState
{
    constructor(deer)
    {
        super(deer);

        this.eatSpeed = 50000;
        this.eatUntilFull = false;
        this.visualDistance = Deer.VisualDistance / 2;
        this.visualAngle = Math.PI / 6;
    }
    update(dt)
    {
        this.animal.gameObject.v = new Vector2(0, 0);
        var blockX = this.animal.blockPosition.x;
        var blockY = this.animal.blockPosition.y;
        var resource = this.eatSpeed * dt;
        if (map.get(blockX, blockY) && map.get(blockX, blockY).type==Block.Types.Grass) {
            if(map.get(blockX,blockY).resource>resource){
                map[blockX][blockY].resource -= resource;
                this.animal.energy += resource / 10;
            }
            else{
                resource = map[blockX][blockY].resource;
                map[blockX][blockY].resource = 0;
                map[blockX][blockY].type = Block.Types.Sand;
                this.animal.energy += resource / 10;
                if (this.animal.isFull() || !this.eatUntilFull)
                    this.animal.changeState(new DeerWander(this.animal));
                else
                    this.animal.changeState(new DeerForage(this.animal));
            }
        }
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
            if (this.animal.positionMemory[i].entity instanceof Tiger)
            {
                if (this.animal.guard(600, this.animal.positionMemory[i].entity))
                {
                    this.animal.changeState(new DeerInDanger(this.animal));
                    return;
                }
            }
        }


        let state = this;
        setTimeout(function ()
        {
            state.AIUpdate.call(state);
        }, 100);
    }
    onEnter(previousState)
    {
        if (this.animal.isHungry())
            this.eatUntilFull = true;
        this.AIUpdate();
    }
}

export class DeerControl extends AnimalState
{
    constructor(deer)
    {
        super(deer);
        this.target = null;
        this.power = 20000;
        this.maxTurn = 0.1;
        this.maxForce = 5000;
    }
    update(dt)
    {
        if (this.target) {
            if (this.animal.moveTo(this.target, this.power, this.maxForce, this.maxTurn, dt))
                this.target = null;
        }
    }
}

export class DeerCautious extends AnimalState
{
    /**
     * 
     * @param {Deer} deer
     * @param {Number} source
     */
    constructor(deer, source)
    {
        super(deer);
        this.checkedSource = false;
        this.visualDistance = this.animal.visualRange.distance * 1.5;
        this.visualAngle = Math.PI * 5 / 6;
        this.turnTo = source;
        this.turnSpeed = 0.1;
    }
    onEnter(previousState)
    {
        this.animal.detectDistance = Deer.DetectDistance / 2;
        this.AIUpdate();
    }
    onExit(nextState)
    {
        this.animal.detectDistance = Deer.DetectDistance;
        this.animal = null;
    }

    update(dt)
    {
        // Turn around
        if (this.turnTo)
        {
            if (this.animal.turnTo(this.turnTo, this.turnSpeed, dt))
            {
                this.turnTo = null;
                if (!this.checkedSource)
                {
                    this.checkedSource = true;
                    this.turnAround();
                }
            }
        }
        
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
            if (this.animal.positionMemory[i].entity instanceof Tiger)
            {
                if (this.animal.guard(600, this.animal.positionMemory[i].entity))
                {
                    this.animal.changeState(new DeerInDanger(this.animal));
                    return;
                }
            }
        }


        let state = this;
        setTimeout(function ()
        {
            state.AIUpdate.call(state);
        }, 100);
    }

    turnAround()
    {
        if (!this.animal)
            return;
        if (Math.random() < 0.6)
        {
            let sign = 1;
            if (Math.random() < 0.5)
                sign = -1;
            
            this.turnTo = Math.atan2(this.animal.forward.y, this.animal.forward.x) + sign * (Math.PI / 2 + Math.random() * Math.PI / 2);
        }
        let state = this;
        setTimeout(function ()
        {
            state.turnAround.call(state);
        }, Math.random() * 2000 + 500);
    }
}

export class DeerInDanger extends AnimalState
{
    constructor(deer)
    {
        super(deer);

        this.power = 100000;
        this.maxForce = 5000;
        this.maxTurn = 0.1;
        this.visualDistance = Deer.VisualDistance * 1.2;
        this.animal.detectDistance = Deer.DetectDistance * 1.5;
        this.visualAngle = Math.PI;
        this.direction = Math.atan2(this.animal.forward.y, this.animal.forward.x);
    }

    update(dt)
    {
        this.animal.moveTo(this.direction, this.animal.powerLimit(this.power,Deer.EnergyDefault), this.maxForce, this.maxTurn, dt);
    }

    AIUpdate()
    {
        if (this.disposed)
            return;    
        // Visual
        this.animal.visual(this.visualDistance, this.visualAngle);
        // Gurad
        var dangerList = [];
        for (var i = 0; i < this.animal.positionMemory.length; i++)
        {
            var danger = this.animal.positionMemory[i];
            if (danger.entity instanceof Tiger || danger.entity.id < 0)
            {
                var dangerLevel = this.animal.guard(800, danger.entity);
                if (dangerLevel > 0)
                    dangerList[dangerList.length] = new Danger(danger.entity, dangerLevel, danger.position);
            }
        }

        if (dangerList.length == 0)
        {
            this.animal.changeState(new DeerWander(this.animal));
            return;
        }    
        // Flee
        var direction = this.animal.flee(dangerList);

        if (direction== 0)
            direction = this.direction;
        this.direction = direction;

        var state = this;
        setTimeout(function() {
            state.AIUpdate.call(state);
        }, 100);
    }

    onEnter(previousState)
    {
        this.AIUpdate();
    }
}
export class DeerDead extends AnimalState
{
    constructor(deer)
    {
        super(deer);
        this.deathTime = 0;
    }

    update(dt)
    {
        this.animal.gameObject.graphic.fillStyle = new Color(128, 128, 128, this.animal.energy / Deer.EnergyDefault);
    }

    onEnter(previousState)
    {
        this.deathTime = new Date().getTime();
        this.animal.gameObject.graphic.fillStyle = "gray";
        this.animal.gameObject.graphic.strokeStyle = "black";
        this.animal.onDisplay = function () { };
        this.animal.onMessage = function () { };
        let state = this;
        setTimeout(function() {
            state.animal.gameObject.v = new Vector2(0, 0);
        }, 1000);
    }
}