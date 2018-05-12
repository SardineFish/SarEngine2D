import { Player, NPC } from "./lib.js";
class Range
{
    constructor(l, r)
    {
        this.left = l;
        this.right = r;
    }
    toString()
    {
        return `[${this.left}, ${this.right}]`;
    }
}
class GameSystemClass {
    constructor()
    {
        /** @type {Player} */
        this.player = null;
        this.engine = null;
        this.scene = null;
        this.camera = null;
        this.input = null;
        this.mouseInput = null;
        this.display = null;
        this.playerPos = 0;
        this.viewRange = new Range(0, 0);
    }
    /**
     * @returns {GameSystemClass}
     */
    static instance()
    {
        return gameSystem;
    }

    start()
    {
        this.engine.start();
        this.scene.onUpdate.add(() => this.update());
        this.mouseInput = this.display.input;
        this.scene.addInput(this.mouseInput);
        this.scene.onMouseDown.add(e => this.mouseDown(e));
        this.renderMainUI();
        //this.camera.linkTo(this.player.gameObject);
    }

    update()
    {
        this.camera.moveTo(this.player.position.x, this.camera.position.y);
        this.viewRange.left = this.display.viewArea.coordinate.pFrom(this.display.viewArea.center.x, 0).x - this.display.viewArea.coordinate.vFrom(this.display.viewArea.width / 2, 0).x;
        this.viewRange.right = this.display.viewArea.coordinate.pFrom(this.display.viewArea.center.x, 0).x + this.display.viewArea.coordinate.vFrom(this.display.viewArea.width / 2, 0).x;
        //console.log(this.viewRange);
    }

    mouseDown(e)
    {
        this.spawnObj(NPC, e.x);
    }

    spawnObj(Type, pos)
    {
        var entity = new Type();
        entity.gameObject.moveTo(pos, 0);
    }

    renderMainUI()
    {
        let text = new Text("Your Story");
        text.moveTo(0, this.display.viewRange.top - 200);
        text.font.fontSize = 120;
        text.textAlign = TextAlign.Center;
        var obj = new GameObject();
        obj.graphic = text;
        this.scene.addGameObject(obj);
    }
}
const GameSystem = new GameSystemClass();
export { GameSystem };
window.GameSystem = GameSystem;