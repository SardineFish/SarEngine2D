import { Entity } from "./entity.js";
import { Animal } from "./animal.js";
import { Global } from "./global.js";
import { RenderableEntity } from "./renderableEntity.js";
const SpeedOfSound = 314;
export class Sound extends Entity
{
	constructor(id, sender, x, y, spreadDistance)
	{
		super(id, x, y);
		this.sender = sender;
		this.spreadDistance = spreadDistance;
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
