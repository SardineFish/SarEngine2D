import {Animal} from "./animal.js";
import {State} from "./states.js";

export class Tiger extends Animal
{
    constructor(id, x, y)
    {
        super(id, "tiger");

        this.state = new TigerWander(Tiger);

        var pol = new Polygon([new Point(0, 20), new Point(10, 0), new Point(-10, 0)]);
        pol.fillStyle = "#ff8888";
        pol.strokeStyle = "rgba(0,0,0,0)";
        this.gameObject.graphic = pol;
        scene.addGameObject(this.gameObject, 1);
        this.gameObject.moveTo(x, y);
    }
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
    update(dt)
    {
        var tiger = this.animal;
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
        this.power = 1;

    }
}