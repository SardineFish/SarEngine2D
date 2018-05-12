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
engine.start();

scene.worldBackground = new Color(0, 0, 0, 0.0);

var player = new Player(input);
scene.addGameObject(player.gameObject);

var ground = new Ground(0);