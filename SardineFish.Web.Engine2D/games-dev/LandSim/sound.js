import { Entity } from "./entity.js";
import { Animal } from "./animal.js";
import { Global } from "./global.js";
import { State } from "./states.js";
import { RenderableEntity } from "./renderableEntity.js";
import { SoundMessage } from "./message.js";
import { Wave, WaveSpread } from "./wave.js";
const SpeedOfSound = 314;
export class Sound extends Wave
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
		super(id, x, y, spreadDistance, Sound.SpeedOfSound);
		this.sender = sender;
		this.spreadDistance = spreadDistance;
		this.volume = volume;
	}

	static get SpeedOfSound() { return SpeedOfSound; }

	onDisplay()
	{
		this.changeState(new SoundSpread(this));
	}

}
export class SoundSpread extends WaveSpread
{
	/**
	 * 
	 * @param {Sound} sound 
	 */
	constructor(sound)
	{
		super(sound);
		this.sound = sound;
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
				let msg = new SoundMessage(this.sound.sender, animal, this.sound);
				msg.dispatch();
				this.heard[animal.id] = true;
			}
		}
		let state = this;
		setTimeout(function() {
			state.checkHear.call(state);
		}, 100);
	}

	update(dt)
	{
		super.update(dt);
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
