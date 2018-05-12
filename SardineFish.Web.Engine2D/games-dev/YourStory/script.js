import { Player } from "./lib.js";

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

scene.addInput(input);
scene.physics.g = new Vector2(0, -800);
engine.start();

scene.worldBackground = new Color(0, 0, 0, 0.0);

var player = new Player(input);
scene.addGameObject(player.gameObject);

var ground = new Ground(0);
ground.bounce = 0;
var groundObj = new GameObject();
groundObj.collider = ground;
scene.addGameObject(groundObj);