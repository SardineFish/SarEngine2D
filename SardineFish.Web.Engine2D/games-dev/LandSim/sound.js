import { Entity } from "./entity.js";
import { Animal } from "./animal.js";
import { Global } from "./global.js";
import { State } from "./states.js";
import { RenderableEntity } from "./renderableEntity.js";
import { SoundMessage } from "./message.js";
const SpeedOfSound = 314;
export class Sound extends RenderableEntity
{
	/**
	 * 
	 * @param {Number} id 
	 * @param {Entity} sender 
	 * @param {Number} volume 
	 * @param {Number} x 
	 * @param {Number} y 
	 * @param {Number} spreadDistance 
	 */
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
		this.changeState(new SoundSpread(this));
	}

}
export class SoundSpread extends State
{
	/**
	 * 
	 * @param {Sound} sound 
	 */
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
		if (!this.sound || this.sound.disposed)
			return;
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
		let state = this;
		setTimeout(function() {
			state.checkHear.call(state);
		}, 100);
	}

	update(dt)
	{
		let dx = dt / this.totalTime;
		let x = this.spread / this.spreadTo;
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
		this.checkHear();
	}

	onExit(nextState)
	{
		this.sound = null;
	}

}
