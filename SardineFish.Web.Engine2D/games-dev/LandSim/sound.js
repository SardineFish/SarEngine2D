import { Entity } from "./entity.js";
import { Animal } from "./animal.js";
import { Global } from "./global.js";
export class Sound extends Entity
{
    constructor(id, sender, x, y)
    {
        super(id, x, y);
    }
}