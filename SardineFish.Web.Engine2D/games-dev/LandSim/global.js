import { Block, initMap } from "./map.js";
import { Entity } from "./entity.js";
import { RenderableEntity } from "./renderableEntity.js";
import { Animal } from "./animal.js";
import { Tiger } from "./tiger.js";
import { Deer } from "./deer.js";
noise.seed(Math.random());
let map = initMap(500, 500);
let Height = $("#game").height();
let Width = $("#game").width();
let MapWidth = 500;
let MapHeight = 500;
let BlockSize = 20;
export {map, Width, Height, MapWidth, MapHeight, BlockSize};
let gamingElement = $("#game").get(0);
let game = SarEngine.createInNode(gamingElement, Width, Height);
let scene = game.scene;
let camera = scene.cameraList[0];
let display = camera.displayList[0];
let input = display.getInput();
let layerLand = scene.layers[0];
let layerAnimals = new Layer(Coordinate.Default);
export { game, scene, camera, display, input, layerLand, layerAnimals } 
/**
 * @type {Array<Tiger>}
 */
let tigers = [];
/**
 * @type {Array<Deer>}
 */
let deers = [];
/**
 * @type {Array<Animal>}
 */
let animals = [];
/**
 * @type {Array<Entity>}
 */
let entities = [];
let grassGrow = 0;
entities["?"] = entities[-1] = new Entity(-1, 0, 0);
export class Global
{
    static get Map()
    {
        return map;
    }
    static get Height() { return Height; }
    static get Width() { return Width; }
    static get MapWidth() { return MapWidth; }
    static get MapHeight() { return MapHeight; }
    static get BlockSize() { return BlockSize; }
    static get Tigers() { return tigers; }
    static get Deers() { return deers; }
    static get Animals() { return animals; }
    static get Entities() { return entities; }
    static get Grass() { return grassGrow; }
    static get UnknownEntity() { return entities[-1]; }

    /**
     * Grow all the grass in the world.
     * @param {number} grow 
     */
    static GrassGrow(grow)
    {
        grassGrow += grow;
    }

    /**
     * Register an unique ID.
     * @returns {Number}
     */
    static RegisterID()
    {
        return entities.length++;
    }

    /**
     * Add an entity to this world.
     * @param {Entity} entity - The entity to be add to this world. 
     */
    static AddEntity(entity)
    {
        entities[entity.id] = entity;
        if (entity instanceof Animal)
        {
            animals[animals.length++] = entity;
        }
        if (entity instanceof Tiger)
            tigers[tigers.length++] = entity;
        else if (entity instanceof Deer)
            deers[deers.length++] = entity;
        if (entity instanceof RenderableEntity)
		{
            scene.addGameObject(entity.gameObject, 1, scene.collideGroups.ignoreGroup);
			entity.onDisplay();
        }
        else
        {
            let updateCallback = function (args)
            {
                if (entity.disposed)
                {
                    scene.onUpdate.remove(updateCallback);
                    return;
                }    
                entity.update(args.dt); 
            }
            scene.onUpdate.add(updateCallback);
        }
    }

	static RemoveEntity(entity)
	{
		if(entity instanceof Entity)
        {
            entity.disposed = true;
			entities[entity.id] = null;
			if(entity instanceof RenderableEntity)
				scene.removeGameObject(entity.gameObject);
		}
	}
}