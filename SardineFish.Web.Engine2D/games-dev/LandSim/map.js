class Block
{
    constructor(type,resource)
    {
        this.type = type;
        this.resource = resource;
    }
    static get Types() { return {Void:-1, Sand: 0, Grass: 1, Wood: 2 };}
}
Block.Void = new Block(Block.Types.Void, 0);
function initMap(width,height)
{
    var map = [];
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
                map[x][y] = new Block(Block.Types.Grass, 100000);
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