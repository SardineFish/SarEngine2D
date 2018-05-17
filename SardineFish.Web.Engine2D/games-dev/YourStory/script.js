import { Player, NPC } from "./lib.js";
import { GameSystem } from "./game-system.js";

const $ = selector => document.querySelector(selector);
var engine = SarEngine.createInNode($("#display"), window.innerWidth, window.innerHeight);
var scene = engine.scene;
var camera = scene.cameraList[0];
var display = camera.displayList[0];
var input = new Input(window, {
    keyInput: true,
    mouseInput: false,
    touchInput: false
});
GameSystem.engine = engine;
GameSystem.scene = scene;
GameSystem.camera = camera;
GameSystem.display = display;
GameSystem.input = input;

scene.addInput(input);
$("#button-start").onclick = (e) =>
{
    GameSystem.switchToGame();
};
/*var player = new Player(input);
scene.addGameObject(player.gameObject);
GameSystem.player = player;*/


//var npc = new NPC(400);
//scene.addGameObject(npc.gameObject);

/*var ground = new Ground(0);
ground.bounce = 0;
var groundObj = new GameObject();
groundObj.collider = ground;
var it = new InfiniteTexture({
    src: "res/img/ground.png",
    sliceWidth: 1920,
    sliceHeight: 786,
    direction: InfiniteTexture.Direction.Horizontal,
});
it.load();
it.moveTo(0, 10);
groundObj.graphic = it;
scene.addGameObject(groundObj);*/

/*
var backgroundLayer = new Background();
backgroundLayer.followSpeed = 0.2;
scene.background.add(backgroundLayer);
var bg = new InfiniteTexture({
    src: "res/img/bg-forest.jpg",
    sliceWidth: 3840,
    sliceHeight: 2160,
    direction: InfiniteTexture.Direction.Horizontal,
    yMax: 3000,
    yMin: 0
});
bg.moveTo(0, -500);
bg.load();
var bgObj = new GameObject();
bgObj.graphic = bg;
scene.addGameObject(bgObj,backgroundLayer);*/
/*GameSystem.loadBackground([
    "res/img/bg-forest/0.png",
    "res/img/bg-forest/1.png",
    "res/img/bg-forest/2.png",
    "res/img/bg-forest/3.png",
]);*/

GameSystem.load();