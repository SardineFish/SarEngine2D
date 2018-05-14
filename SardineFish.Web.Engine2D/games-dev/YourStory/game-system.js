import { Player, NPC } from "./lib.js";
/**
 * 
 * @param {string} selector 
 * @returns {HTMLElement}
 */
const $ = selector => document.querySelector(selector);
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
        this.choicePopSpeed = 7;
        this.textPopSpeed = 20;
        this.textPopTimmer = null;
        this.backgroundList = [];
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

    clearUI()
    {
        $("#aside-text").innerText = "";
        $("#choices").innerHTML = null;
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
        this.showChoice("Please make a choice :)", ["Ok.", "Fine.", "No."]).then(i =>
        {
            console.log(i); 
        });
    }

    /**
     *  
     * @param {Array<string>} bgList 
     * @returns {Promise}
     */
    loadBackground(bgList)
    {
        return new Promise(resolve =>
        {
            var taskMgr = new TaskManagment();
            taskMgr.onAllComplete = resolve;
            this.backgroundList.forEach(bg =>
            {
                scene.background.remove(bg)
            });
            this.backgroundList = bgList.map((url, idx) =>
            {
                let background = new Background();
                background.followSpeed = 1 - ((idx+1) / bgList.length);
                this.scene.background.add(background);
                let bg = new InfiniteTexture({
                    src: url,
                    sliceWidth: 3840,
                    sliceHeight: 2160,
                    direction: InfiniteTexture.Direction.Horizontal,
                    yMax: 3000,
                    yMin: -100,
                });
                bg.moveTo(0, -750);
                let bgObj = new GameObject();
                bgObj.graphic = bg;
                taskMgr.addTask(new Task((complete) =>
                {
                    bg.load(() =>
                    {
                        this.scene.addGameObject(bgObj, background);
                        complete();
                    });
                }));
                return background;
                //bg.load();
            });
            taskMgr.start();
        });
    }

    /**
     * 
     * @param {string} text 
     */
    showAsideText(text)
    {
        return new Promise((resolve) =>
        {
            this.clearUI();
            if (this.textPopTimmer)
                clearInterval(this.textPopTimmer);
            let textRender = "";
            let i = 0;
            let element = $("#aside-text");
            this.textPopTimmer = setInterval(() => {
                textRender += text.charAt(i++);
                element.innerText = textRender;
                if (i >= text.length) {
                    clearInterval(this.textPopTimmer);
                    resolve();
                    return;
                }
            }, 1000 / this.textPopSpeed);
        });
    }

    hideAsideText()
    {
        $("#aside-text").classList.add("erase");
        setTimeout(() =>
        {
            this.clearUI();
        }, 500);
    }

    /**
     * 
     * @param {string} aside 
     * @param {Array<string>} choices 
     */
    showChoice(aside, choices)
    {
        return new Promise(resolve =>
        {
            this.showAsideText(aside).then(() =>
            {
                let container = $("#choices");
                let i = 0;
                setTimeout(() =>
                {
                    this.textPopTimmer = setInterval(() =>
                    {
                        let idx = i;
                        let choice = choices[i];
                        let element = document.createElement("li");
                        element.className = "choice";
                        element.innerText = choices[i];
                        element.addEventListener("click", () =>
                        {
                            resolve(idx);
                            container.classList.add("out");
                            element.classList.add("chosen");
                            setTimeout(() =>
                            {
                                container.innerHTML = "";
                                this.hideAsideText();
                            }, 1000);
                        });
                        container.appendChild(element);
                        i++;
                        if (i >= choices.length)
                            clearInterval(this.textPopTimmer);
                    }, 1000 / this.choicePopSpeed);
                }, 200);
                
            });
        });
    }

}
const GameSystem = new GameSystemClass();
export { GameSystem };
window.GameSystem = GameSystem;