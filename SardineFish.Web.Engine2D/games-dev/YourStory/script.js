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
scene.physics.g = new Vector2(0, -6400);

scene.worldBackground = new Color(0, 0, 0, 0.0);
camera.zoomTo(0.5);
camera.moveTo(0, 400);

var player = new Player (input);
//scene.addGameObject(player.gameObject);
GameSystem.player = player;

var npc = new NPC(400);
//scene.addGameObject(npc.gameObject);

var ground = new Ground(0);
ground.bounce = 0;
var groundObj = new GameObject();
groundObj.collider = ground;
scene.addGameObject(groundObj);

GameSystem.start();