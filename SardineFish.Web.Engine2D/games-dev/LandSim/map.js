class Map
{
    constructor(type,resource)
    {
        this.type = type;
        this.resource = resource;
    }
    static get Types() { return { Sand: 0, Grass: 1, Wood: 2 };}
}
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
                map[x][y] = new Map(Map.Types.Sand, 0);
            }
            else if (n < 0.7) {
                map[x][y] = new Map(Map.Types.Grass, 100);
            }
            else {
                map[x][y] = new Map(Map.Types.Wood, 100);
            }
        }
    }
    return map;
}