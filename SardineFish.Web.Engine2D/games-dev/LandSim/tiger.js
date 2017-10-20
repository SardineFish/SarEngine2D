import { Animal, AnimalState } from "./animal.js";
import { State } from "./states.js";
import { map, scene, BlockSize } from "./global.js";
import { Block } from "./map.js";
import { Message, MessageTypes, SoundMessage } from "./message.js";
import { Global } from "./global.js";

export class Tiger extends Animal
{
    constructor(id, x, y)
    {
        super(id, "tiger");
        this.energy = 200000;
        this.state = new TigerWander(this);
        this.detectDistance = Tiger.DetectDistance;
        this.visualRange.distance = Tiger.VisualDistance;
        this.visualRange.ang = Tiger.VisualAngle;

        var pol = new Polygon([new Point(0, 25), new Point(12.5, 0), new Point(-12.5, 0)]);
        pol.fillStyle = "#ffdfa6";
        pol.strokeStyle = "rgba(0,0,0,0)";
        this.gameObject.graphic = pol;
        //scene.addGameObject(this.gameObject, 1);
        this.gameObject.moveTo(x, y);
    }

    onMessage(message)
    {
        
    }

    isHungry()
    {
        
    }

    static get DetectDistance() { return 200; }
    static get VisualDistance() { return 200; }
    static get VisualAngle() { return Math.PI / 6; }
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
        
        this.maxPower = 20000;
        this.power = 0;
        this.maxTurn = 0.02;
        this.maxForce = 2000;
        this.nextTarget();
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
        if (false)
        {
            this.animal.changeState(new DeerEat(this.animal));
        }
        else if (Math.random() < 0.75)
        {
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
export class TigerForge extends State
{
    constructor(tiger)
    {
        super(tiger)
        
    }
}
export class TigerAttack extends State
{
    constructor(tiger)
    {
        super(tiger);
    }
}
export class TigerEat extends State
{
    constructor(tiger)
    {
        super(tiger);
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