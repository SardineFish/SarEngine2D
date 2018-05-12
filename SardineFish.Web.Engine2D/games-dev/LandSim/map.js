import { Global } from "./global.js";
const resourceSymbol = Symbol("resourceSymbol");
export const BlockType =
    {
        Void: Symbol("void"),
        Sand: Symbol("sand"),
        Grass: Symbol("grass"),
        Wood: Symbol("wood")
    };
/**
 * Block
 */
export class Block
{
    /**
     * 
     * @param {symbol} type 
     * @param {number} resource 
     */
    constructor(type, resource)
    {
        this.type = type;
        this[resourceSymbol] = resource;
    }
    static get Types() { return BlockType; }
    static get MaxResource() { return 100000; }
    get resource()
    {
        return Global.Grass + this[resourceSymbol];
    }
    set resource(value)
    {
        this[resourceSymbol] = value - Global.Grass;
    }
}
Block.Void = new Block(Block.Types.Void, 0);
export function initMap(width,height)
{
    var map = [[]];
    for (var x = 0; x < width; x++) {
        map[x] = [];
        for (var y = 0; y < height; y++) {
            var n = noise.perlin2(x / 50, y/50);
            n = (n + 1) / 2;
            var type;
            if (n < 0.5) {
                map[x][y] = new Block(Block.Types.Sand, 0);
            }
            else if (n < 0.7) {
                map[x][y] = new Block(Block.Types.Grass, Block.MaxResource);
            }
            else {
                map[x][y] = new Block(Block.Types.Wood, 100);
            }
        }
    }
    map.get = function (x, y)
    {
        if (map[x] && map[x][y])
            return map[x][y];
        else
            return Block.Void;
    }
    return map;
}