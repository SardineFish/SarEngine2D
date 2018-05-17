import { Player, NPC } from "./lib.js";
import { TimeLine, InitialEvent } from "./timeline.js";
import { Entity } from "./entity.js";
import { StoryStateMachine, Wander } from "./story-state.js";
import { Assets } from "./assets.js";
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
        this.viewRange = new Range(0, 0);
        this.choicePopSpeed = 7;
        this.textPopSpeed = 20;
        this.spawnDistance = 2160;
        this.cancleDistance = 3200;
        this.textPopTimmer = null;
        this.backgroundList = [];
        this.groundLayer = null;
        this.ground = null;
        this.blockInput = false;
        this.gameState = new StoryStateMachine();
        this.npcLayer = new Layer();
        /** @type {Array<Entity>} */
        this.entityList = [];
        this.timeline = new TimeLine([new InitialEvent(0)]);
    }
    /**
     * @returns {GameSystemClass}
     */
    static instance()
    {
        return gameSystem;
    }
    get playerPos()
    {
        return this.player.position.x;
    }

    load()
    {
        Assets.load(() =>
        {
            //this.start();
            this.hideUI("#loading").then(() =>
            {
                this.showUI("#main-menu");
                this.start();
                this.switchToUI();
            });
            this.showUI("#mask")
                .then(() => this.hideUI("#mask")).
                then(() =>
                {
                    
                });
        },
            (progress) =>
            {
                console.log(progress);
                $("#progress").style.width = progress * 100 + "%";
            });
    }
    switchToUI(animate = false)
    {
        this.camera.zoomTo(1.2);
        this.camera.moveTo(400, 200);
        this.blockInput = true;
    }
    showPauseUI()
    {
        this.hideUI("#ui");
        this.showUI("#pause-menu");
    }
    hidePauseUI()
    {
        this.showUI("#ui").then(() =>
        {
            $("#ui").style.display = "block";
        });
        this.hideUI("#pause-menu");
    }
    switchToGame(title = true)
    {
        $("#main-menu .button-wrapper").classList.add("hide");
        this.camera.animate({
            "position.x": 0,
            "position.y": 400,
            "zoom": 0.5
        }, 1);
        setTimeout(() => {
            this.renderMainUI();
            $("#main-menu").style["display"] = "none";
            this.showUI("#ui").then(() =>
            {
                $("#ui").style.display = "block";
                this.blockInput = false;
            })
        }, 1000);
    }
    start()
    {
        this.scene.physics.g = new Vector2(0, -12800);
        this.npcLayer = new Layer();
        this.scene.layers.add(this.npcLayer, -1);
        this.scene.worldBackground = new Color(126, 152, 150, 1.0);
        this.camera.zoomTo(0.5);
        this.camera.moveTo(0, 400);
        this.engine.start();
        this.scene.onUpdate.add((e) => this.update(e.dt));
        this.mouseInput = this.display.input;
        this.scene.addInput(this.mouseInput);
        this.scene.onMouseDown.add(e => this.mouseDown(e));
        //this.renderMainUI();
        this.blockInput = false;
        this.loadBackground(Assets.bgForest);
        this.loadGround();
        this.initPlayer();
        //this.scene.addGameObject(this.player.gameObject);
        this.timeline.start();
        this.gameState.changeState(new Wander());
        this.spawn(new NPC(400), 400);
        
        //this.camera.linkTo(this.player.gameObject);
    }

    update(dt)
    {
        this.timeline.update(dt);
        this.gameState.update(dt);
        var playerScreenPos = this.display.viewCoordinate.pTo(this.player.position.x, this.player.position.y);
        if (playerScreenPos.x > this.display.renderWidth / 2)
            this.camera.moveTo(this.player.position.x, this.camera.position.y);
        this.viewRange.left = this.display.viewArea.coordinate.pFrom(this.display.viewArea.center.x, 0).x - this.display.viewArea.coordinate.vFrom(this.display.viewArea.width / 2, 0).x;
        this.viewRange.right = this.display.viewArea.coordinate.pFrom(this.display.viewArea.center.x, 0).x + this.display.viewArea.coordinate.vFrom(this.display.viewArea.width / 2, 0).x;
        //console.log(this.viewRange);
    }

    mouseDown(e)
    {
        //this.spawnObj(NPC, e.x);
    }

    initPlayer()
    {
        this.player = new Player(this.input);
        this.scene.addGameObject(this.player.gameObject);
        this.addEntity(this.player);
    }

    loadGround(url)
    {
        if (!this.ground)
        {
            this.groundLayer = new Layer();
            this.scene.layers.add(this.groundLayer);
            this.ground = new GameObject();
            this.ground.collider = new Ground(0);
            this.ground.collider.bounce = 0;
            this.ground.graphic = Assets.groundForest.copy();
            this.ground.graphic.moveTo(0, 10);
            this.scene.addGameObject(this.ground, this.groundLayer);
        }
        else
        {
            
        }
    }

    /**
     * 
     * @param {Entity} entity 
     * @param {Number} pos 
     */
    spawn(entity, pos)
    {
        entity.gameObject.moveTo(pos, 0);
        if (entity.id < 0)
        {
            this.addEntity(entity);
        }
        if (entity.gameObject.id < 0)
        {
            if (entity instanceof NPC)
                this.scene.addGameObject(entity.gameObject, this.npcLayer);
            else
                this.scene.addGameObject(entity.gameObject);
        }    
    }

    addEntity(entity)
    {
        entity.id = this.entityList.push(entity);
    }

    getEntity(id)
    {
        return this.entityList[id - 1];
    }
    getEntityID(entity)
    {
        for (let i = 0; i < this.entityList.length; i++)
        {
            if (this.entityList[i] === entity)
                return this.entityList[i].id;    
        }
        return -1;
    }

    hideUI(selector)
    {
        return new Promise((resolve) =>
        {
            $(selector).classList.remove("show");
            $(selector).classList.add("hide");
            setTimeout(() =>
            {
                $(selector).style["display"] = "none";
                resolve();
            }, 500);
        });
    }
    showUI(selector)
    {
        return new Promise((resolve) =>
        {
            $(selector).style["display"] = "flex";
            setTimeout(() =>
            {
                $(selector).classList.remove("hide");
                $(selector).classList.add("show");
                setTimeout(() =>
                {
                    resolve();
                }, 500);
            },200);
        });
    }

    clearUI()
    {
        $("#aside-text").innerText = "";
        $("#choices").innerHTML = null;
        $("#button-skip").classList.remove("show");
        $("#aside-wrapper").classList.remove("erase");
        $("#choices").classList.remove("out");
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
        /*this.showAsideText("一个 $ 就是一个代表了异步操作最终完成或者失败的对象。大多数人都在使用由其他函数创建并返回的$，因此，本教程将首先探讨返回$的使用情况。")
            .then((fills) =>
            {
               this.showAsideText(fills.join(","),10);     
            });*/
        /*this.showChoice("Please make a choice :)", ["Ok.", "Fine.", "No."]).then(i =>
        {
            console.log(i); 
        });*/
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
            this.backgroundList.forEach(bg =>
            {
                scene.background.remove(bg)
            });
            this.backgroundList = bgList.map((bg, idx) =>
            {
                let background = new Background();
                background.followSpeed = 1 - ((idx+1) / bgList.length);
                this.scene.background.add(background);
                bg.moveTo(200, -750);
                let bgObj = new GameObject();
                bgObj.graphic = bg.copy();
                /*taskMgr.addTask(new Task((complete) =>
                {
                    bg.load(() =>
                    {
                        this.scene.addGameObject(bgObj, background);
                        complete();
                    });
                }));*/
                this.scene.addGameObject(bgObj, background);
                return background;
                //bg.load();
            });
            resolve();
        });
    }

    /**
     * 
     * @param {string} text 
     * @param {Number} [speed]
     * @param {Boolean} [allowSkip]
     */
    showAsideText(text, speed = this.textPopSpeed, allowSkip = true)
    {
        return new Promise((resolve) =>
        {
            this.clearUI();
            if (this.textPopTimmer)
                clearInterval(this.textPopTimmer);
            let textRender = "";
            let i = 0;
            let element = $("#aside-text");
            let textNode = document.createTextNode("");
            element.appendChild(textNode);
            this.textPopTimmer = setInterval(() =>
            {
                
                if (text.charAt(i) === "$")
                {
                    let textFill = this.renderTextFill();
                    element.appendChild(textFill);
                    textNode = document.createTextNode("");
                    element.appendChild(textNode);
                    textRender = "";
                    i++;
                    return;
                }    
                textRender += text.charAt(i++);
                textNode.textContent = textRender;
                if (i >= text.length) {
                    clearInterval(this.textPopTimmer);
                    if (allowSkip)
                    {
                        $("#button-skip").classList.add("show");
                        $("#button-skip").onclick = () => {
                            let fills = [];
                            element.querySelectorAll(".text-fill").forEach(el => fills.push(el.innerText));
                            //resolve();
                            this.hideAsideText().then(() => {
                                resolve(fills);
                            });
                        }
                    }    
                    else
                    {
                        resolve();
                    }
                    return;
                }
            }, 1000 / speed);
        });
    }

    /**
     * @returns {Promise}
     */
    hideAsideText()
    {
        return new Promise((resolve) =>
        {
            $("#aside-wrapper").classList.add("erase");
            setTimeout(() =>
            {
                this.clearUI();
                resolve();
            }, 500);
        });
    }

    hideChoice()
    {
        return new Promise((resolve) =>
        {
            $("#choices").classList.add("out");
            setTimeout(() => {
                $("#choices").innerHTML = "";
                this.hideAsideText().then(resolve);
            }, 1000);
        });
    }

    /**
     * 
     * @param {string} aside 
     * @param {Array<string>} choices 
     * @param {Number} [speed]
     */
    showChoice(aside, choices, speed=this.textPopSpeed)
    {
        return new Promise(resolve =>
        {
            if (choices.length <= 0)
                return resolve();
            this.showAsideText(aside, speed, false).then(() =>
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
                            element.classList.add("chosen");
                            this.hideChoice();
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

    renderTextFill()
    {
        let textFill = document.createElement("span");
        textFill.className = "text-fill";
        textFill.contentEditable = true;
        textFill.onfocus = () =>
        {
            this.blockInput = true;
        }
        textFill.onblur = () =>
        {
            this.blockInput = false;
        }
        return textFill;
    }

}
const GameSystem = new GameSystemClass();
export { GameSystem };
window.GameSystem = GameSystem;