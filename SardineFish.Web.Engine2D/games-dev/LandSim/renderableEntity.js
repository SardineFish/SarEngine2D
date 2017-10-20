import { Entity } from "./entity.js";
export class RenderableEntity extens Entity
{
	constructor(id, x, y)
	{
		super(id);
		this.gameObject=new GameObject();
	}

	get position(){return this.gameObject.position;}
	set position(value){this.gameObject.moveTo(value.x,value.y);}
	get blockPosition(){ return new Vector2(parseInt(this.gameObject.position.x), parseInt(this.gameObject.position.y)); }
	
	onDisplay()
	{
	}

}
