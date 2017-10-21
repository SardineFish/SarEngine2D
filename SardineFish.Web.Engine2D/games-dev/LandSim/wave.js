import { Global } from "./global.js";
import { Entity } from "./entity.js";
import { RenderableEntity } from "./renderableEntity.js";
import { State } from "./states.js";

export class Wave extends RenderableEntity
{
    constructor(id, x, y, spreadDistance, spreadSpeed)
    {
        super(id, x, y);

        this.spreadSpeed = spreadSpeed;
        this.spreadDistance = spreadDistance;

        var circle = new Circle(1);
        circle.strokeStyle = new Color(128, 128, 128, 0.3);
        circle.fillStyle = new Color(255, 255, 255, 0.3);
        this.gameObject.graphic = circle;
        this.gameObject.moveTo(x, y);

    }

    onDisplay()
    {
        this.changeState(new WaveSpread(this));
    }

    get color()
    {
        return this.gameObject.graphic.fillStyle;
    }
    set color(value)
    {
        this.gameObject.graphic.fillStyle = value;
    }
}

export class WaveSpread extends State
{
    /**
     * 
     * @param {Wave} wave 
     */
    constructor(wave)
    {
        super(wave);

        this.wave = wave;
        this.spread = 0;
        this.spreadTo = wave.spreadDistance;
        this.totalTime = wave.spreadDistance / wave.spreadSpeed;
    }

    update(dt)
    {

        let dx = dt / this.totalTime;
        let x = this.spread / this.spreadTo;
        x += dx;
        dx = dx > 1 ? 1 : x;
        this.spread = x * this.spreadTo;
        this.wave.gameObject.graphic.r = this.spread;
        if (x >= 1)
        {
            Global.RemoveEntity(this.wave);
            return;
        }
    }
}