import { Entity } from "./entity.js";
import { Animal } from "./animal.js";
import { Global } from "./global.js";
import { State } from "./states.js";
import { RenderableEntity } from "./renderableEntity.js";
const SpeedOfSound = 314;
export class Sound extends Entity
{
	constructor(id, sender, volume, x, y, spreadDistance)
	{
		super(id, x, y);
		this.sender = sender;
		this.spreadDistance = spreadDistance;
		this.volume = volume;
		var circle = new Circle(1);
		circle.strokeStyle = new Color(128, 128, 128, 0.3);
		circle.fillStyle = new Color(255, 255, 255, 0.3);
		this.gameObject.graphic = circle;
		this.gameObject.moveTo(x, y);
	}

	static get SpeedOfSound() { return SpeedOfSound; }

	onDisplay()
	{
		this.gameObject.animate({ "graphic.r": this.spreadDistance }, this.spreadDistance / SpeedOfSound);
	}

}
export class SoundSpread extends State
{
	constructor(sound)
	{
		super(sound);
		this.sound = sound;
		this.spread = 0;
		this.spreadTo = sound.spreadDistance;
		this.totalTime = sound.spreadDistance / Sound.SpeedOfSound;
		this.heard = [];
	}

	checkHear()
	{
		for(let i=0; i < Global.Animals.length; i++)
		{
			let animal = Global.Animals[i];
			let distance = (new Vector2(animal.position.x-this.sound.position.x, animal.position.y-this.sound.position.y)).mod();
			if (distance < this.spread && !this.heard[animal.id])
			{
				let msg = new SoundMessage(this.sound, animal);
				msg.dispatch();
			}
		}
	}

	update(dt)
	{
		var dx = dt / this.totalTime;
		var x = spread / this.spreadTo;
		x += dx;
		dx = dx > 1 ? 1 : x;
		this.spread = x * this.spreadTo;
		this.sound.gameObject.graphic.r = this.spread;
		if(x >= 1)
		{
			Global.RemoveEntity(this.sound);
			return;
		}
	}

	onEnter(previousState)
	{
		this.spread = 0;
		checkHear();
	}

}
