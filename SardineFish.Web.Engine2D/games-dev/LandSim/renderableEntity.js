import { Entity } from "./entity.js";
import { BlockSize } from "./global.js";
export class RenderableEntity extends Entity
{
	constructor(id, x, y)
	{
		super(id);
		this.gameObject = new GameObject();
		var entity = this;
		this.gameObject.onUpdate = function (obj, dt)
		{
			entity.update.call(entity, dt);
		}
	}

	get position(){return this.gameObject.position;}
	set position(value){this.gameObject.moveTo(value.x,value.y);}
	get blockPosition() { return new Vector2(parseInt(this.gameObject.position.x / BlockSize), parseInt(this.gameObject.position.y / BlockSize)); }
	
	onDisplay()
	{
	}

}
