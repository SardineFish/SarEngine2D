var engine = SarEngine.createByCanvas(document.querySelector("#canvas"),800,480);
var scene = engine.scene;
var camera = scene.cameraList[0];
var display = camera.displayList[0];
scene.worldBackground = new Color(255, 255, 255, 1.0);
engine.start();

var ia = ImageAnimation.loadFromUrl({
    src: "Katana_Out_2.png",
    frameWidth: 430,
    frameHeight: 350,
    renderWidth: 430,
    renderHeight: 350,
    count: 16,
    fps: 24
});
camera.moveTo(0, 0);
var obj = new GameObject();
obj.graphic = ia;
scene.addGameObject(obj);