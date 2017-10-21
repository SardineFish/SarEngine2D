import {map, Width, Height, MapWidth, MapHeight, BlockSize} from "./global.js";
import {game, scene, camera, display, input, layerLand, layerAnimals, Global} from "./global.js";
import { Block, initMap } from "./map.js";
import { Animal } from "./animal.js";
import { Deer, DeerControl } from "./deer.js";
import { Sound, SoundSpread } from "./sound.js";
import { Tiger } from "./tiger.js";
scene.addInput(input);
scene.addLayer(layerAnimals, 1);
scene.physics.f = 500;
scene.worldBackground = "#fffeb5";
game.start();
// Block Rendering
layerLand.onEndRender = function (args)
{
    var o = input.coordinate.pointMapTo(Coordinate.Default, 0, Height);
    var xto = input.coordinate.pointMapTo(Coordinate.Default, Width, 0);
    var yto = input.coordinate.pointMapTo(Coordinate.Default, 0, 0);
    o = new Vector2(parseInt(o.x / BlockSize)-3, parseInt(o.y / BlockSize)-3);
    xto = parseInt(xto.x / BlockSize)+3;
    yto = parseInt(yto.y / BlockSize)+3;
    for (var x = o.x; x < xto; x++) {
        for (var y = o.y; y < yto; y++) {
            if (!map[x] || !map[x][y] || map[x][y].type == Block.Types.Sand)
                continue;
            switch(map[x][y].type)
            {
                case Block.Types.Sand:
                    //args.graphics.fillStyle = "#fffeb5";
                    break;
                case Block.Types.Grass:
                    args.graphics.fillStyle = "#92d480";
                    args.graphics.fillStyle = new Color(146, 212, 128, map[x][y].resource / Block.MaxResource).toString();
                    break;
                case Block.Types.Wood:
                    args.graphics.fillStyle = "#278165";
            }
            args.graphics.fillRect(x * BlockSize, (y+1) * BlockSize, BlockSize, BlockSize);
        }
    }
}

// Mouse Control
scene.onWheel = function (e)
{
    if (e.wheelDelta < 0) {
        camera.zoomTo(camera.zoom * 1.2, e.x, e.y);
    }
    else {
        camera.zoomTo(camera.zoom * (1 / 1.2), e.x, e.y);
    }
}
var mouseHold = false;
input.onMouseDown = function (e)
{
    mouseHold = true;
}
input.onMouseUp = function (e)
{
    mouseHold = false;
}
input.onMouseMove = function (e)
{
    if (mouseHold)
        camera.moveTo(camera.position.x - e.dx * input.coordinate.unitX, camera.position.y - e.dy * input.coordinate.unitY);
}
scene.onMouseMove = function (e)
{
    debug.innerText = e.x + "," + e.y;
}
scene.onClick = function (e)
{
    if (e.button == Mouse.Buttons.Right && deer)
    {
        deer.changeState(new DeerControl(deer));
        deer.state.target = new Vector2(e.x, e.y);
    }
    else if (e.button == Mouse.Buttons.Left)
    {
        Global.AddEntity(new Tiger(Global.RegisterID(), e.x, e.y));
        var sound = new Sound(Global.RegisterID(), deer, 10, e.x, e.y, 400);
        Global.AddEntity(sound);
    }
}
//var tiger = new Tiger(0);
var deer = new Deer(Global.RegisterID(), 0, 0);
Global.AddEntity(deer);
//deer.state = new DeerGlobalState(deer);

for (let i = 0; i < 500; i++) {
    Global.AddEntity(new Deer(Global.RegisterID(), Math.random() * MapWidth * BlockSize, Math.random() * MapHeight * BlockSize));
}