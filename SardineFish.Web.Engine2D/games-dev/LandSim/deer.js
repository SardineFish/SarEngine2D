import { Animal, AnimalState } from "./animal.js";
import {State} from "./states.js";
import {map,scene,BlockSize} from "./global.js";
import { Block } from "./map.js";
import { Message, MessageTypes } from "./message.js";
import { Global } from "./global.js";

/**
 * A Deer
 * @class
 */
export class Deer extends Animal
{
    constructor(id, x, y)
    {
        super(id, "deer");
        this.energy = 200000;
        this.state = new DeerWander(this);
        this.detectDistance = Deer.DetectDistance;
        this.visualRange.distance = Deer.VisualDistance;
        this.visualRange.ang = Deer.VisualAngle;
        var pol = new Polygon([new Point(10, 0), new Point(-10, -10), new Point(-10, 10)]);
        pol.setCenter(0, 0);
        pol.moveTo(0, 0);
        pol.fillStyle = "white";
        pol.strokeStyle = "rgba(0,0,0,0.05)";
        this.gameObject.graphic = pol;
        //scene.addGameObject(this.gameObject, 1);
        this.gameObject.moveTo(x, y);
    }

    static get DetectDistance() { return 200; }
    static get VisualDistance() { return 200; }
    static get VisualAngle() { return Math.PI / 6;}

    /**
     * 
     * @param {Message} message 
     */
    onMessage(message)
    {
        switch (message.type)
        {
            case MessageTypes.Sound:
                this.changeState(new DeerCautious(this));
                break;
        }
    }

    isHungry()
    {
        return (this.energy < 100000);
    }

    isFull()
    {
        return (this.energy > 2000000);
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
    constructor(deer)
    {
        super(deer);

        this.maxPower = 20000;
        this.power = 0;
        this.maxTurn = 0.02;
        this.maxForce = 2000;
        this.nextTarget();
    }
    update(dt)
    {
        if (this.animal.isHungry()) {
            this.animal.changeState(new DeerForage(this.animal));
            return;
        }
        if (this.direction)
            this.animal.moveTo(this.direction, this.power, this.maxForce, this.maxTurn, dt);
        var state = this;
    }
    onEnter(previousState)
    {

    }
    onExit(nextState)
    {
        this.animal = null;
    }
    nextTarget()
    {
        if (!this.animal)
            return;
        if (map.get(this.animal.blockPosition.x, this.animal.blockPosition.y).type == Block.Types.Grass && Math.random() < 0.1) {
            this.animal.changeState(new DeerEat(this.animal));
        }
        else if (Math.random() < 0.75) {
            this.direction = this.animal.randomDirection();
            this.power = this.maxPower * Math.random();
        }
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
    constructor(deer)
    {
        super(deer);

        this.power = 30000;
        this.maxForce = 5000;
        this.maxTurn = 0.1;
        this.target = null;
    }
    update(dt)
    {
        var blockX = this.animal.blockPosition.x;
        var blockY = this.animal.blockPosition.y;
        if (map.get(blockX, blockY).type == Block.Types.Grass && map.get(blockX, blockY).resource > 0) {
            this.animal.changeState(new DeerEat(this.animal));
            return;
        }
        else if (this.target === null) {
            this.findGrass();
        }
        else {
            this.animal.moveTo(this.target, this.power, this.maxForce, this.maxTurn, dt);
        }
    }
    onEnter(previousState)
    {
        this.findGrass();
    }
    onExit(nextState)
    {
        this.animal = null;
    }
    findGrass()
    {
        if (!this.animal)
            return;
        this.target = null;
        var blockX = this.animal.blockPosition.x;
        var blockY = this.animal.blockPosition.y;
        for (var dist = 0; dist < this.animal.visualRange.distance; dist++) {
            var viewBlockX = parseInt(this.animal.gameObject.position.x + this.animal.forward.x * dist / BlockSize);
            var viewBlockY = parseInt(this.animal.gameObject.position.y + this.animal.forward.y * dist / BlockSize);

            if (viewBlockX != blockX &&
                viewBlockY != blockY &&
                map.get(viewBlockX, viewBlockY).type == Block.Types.Grass) {
                this.target = Math.atan2(this.animal.forward.y, this.animal.forward.x);
            }
        }
        var state = this;
        if (this.target === null) {
            this.target = this.animal.randomDirection();
            setTimeout(function ()
            {
                state.findGrass.call(state);
            }, Math.random() * 1000);
        }
        else {
            setTimeout(function ()
            {
                state.findGrass.call(state);
            }, Math.random() * 3000 + 1000);
        }
    }

}

export class DeerEat extends AnimalState
{
    constructor(deer)
    {
        super(deer);

        this.eatSpeed = 50000;
        this.eatUntilFull = false;
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
    onEnter(previousState)
    {
        if (this.animal.isHungry())
            this.eatUntilFull = true;
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

/**
 * The State when a deer is guard against an enmy.
 * @class
 */
export class DeerGuard extends AnimalState
{
    /**
     * 
     * @param {Deer} deer 
     */
    constructor(deer)
    {
        super(deer);
        this.visualDistance=deer.visualRange.distance;
    }
}

export class DeerCautious extends AnimalState
{
    /**
     * 
     * @param {Deer} deer 
     */
    constructor(deer)
    {
        super(deer);
        this.visualDistance = this.animal.visualRange.distance * 1.5;
        this.visualAngle = Math.PI * 2 / 3;
        this.turnTo = 0;
        this.turnSpeed = 0.1;
    }
    onEnter(previousState)
    {
        this.animal.detectDistance = Deer.DetectDistance / 2;
        this.turnAround();
    }
    onExit(nextState)
    {
        this.animal.detectDistance = Deer.DetectDistance;
        this.animal = null;
    }

    update(dt)
    {
        // Gurad
        for (var i = 0; i < Global.Tigers.length; i++)
        {
            var tiger = Global.Tigers[i];
            if (this.animal.guard(this.visualDistance, this.visualAngle, 600, tiger))
            {
                this.animal.changeState(new DeerInDanger(this));
                return;
            }
        }

        // Turn around
        this.animal.turnTo(this.turnTo, this.turnSpeed, dt);
        
    }

    turnAround()
    {
        if (!this.animal)
            return;    
        this.turnTo = Math.random() * Math.PI * 2;
        let state = this;
        setTimeout(function ()
        {
            state.turnAround.call(state);
        }, Math.random() * 2000);
    }
}

export class DeerInDanger extends AnimalState
{
    constructor(deer)
    {
        super(deer);
    }
}