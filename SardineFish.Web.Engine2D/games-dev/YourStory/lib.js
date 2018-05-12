import { FSM, State } from "./fsm.js";
import { GameSystem } from "./game-system.js";
import { Entity } from "./entity.js";
class Character extends Entity
{
    constructor()
    {
        super();
        this.dir = 1;
        this.control = 0;
        this.state = new PlayerStateMachine(this, null);
        this.standLeftAnim = new ImageAnimation();
        this.standRightAnim = new ImageAnimation();
        this.walkLeftAnim = new ImageAnimation();
        this.walkRightAnim = new ImageAnimation();
        this.attackLeftAnim = new ImageAnimation();;
        this.attackRightAnim = new ImageAnimation();;
        this.jumpLeftAnim = new ImageAnimation();
        this.jumpRightAnim = new ImageAnimation();
        this.walkSpeed = 500;
        this.jumpSpeed = 1600;
        this.gameObject.setCenter(0, 100);
        this.gameObject.collider = new Rectangle(200, 200);
        this.gameObject.collider.moveTo(0, 100);
        //this.gameObject.graphic = new Combination([this.gameObject.collider.copy(), this.standAnim  , new Circle(10)]);
        this.gameObject.onUpdate = (obj, dt) => this.update(dt);
        this.gameObject.gravity = true;
        this.gameObject.collider.rigidBody = true;
        //this.gameObject.moveTo(0, 300);
        this.gameObject.onStart = () => this.start();
    }
    walk(dir)
    {
        this.control += dir;
        console.log(this.control);
        if (this.control == 0)
        {
            this.state.changeState(new Stand(this, Math.sign(this.control)));
        }
        else
            this.state.changeState(new Walk(this, Math.sign(this.control)));
        
        /*
        this.gameObject.graphic = this.walkAnim;//new Combination([this.gameObject.collider.copy(), this.walkAnim, new Circle(10)]);
        var newpos = Vector2.plus(this.gameObject.position, new Vector2(0, 100));
        this.gameObject.graphic.moveTo(newpos.x, newpos.y);
        this.gameObject.v = new Vector2(Math.sign(dir) * this.walkSpeed, 0);*/
    }

    updateControl()
    {
        console.log(this.control);
        if (this.control == 0)
        {
            this.state.changeState(new Stand(this, this.dir));
        }
        else
            this.state.changeState(new Walk(this, this.control));
    }

    jump()
    {
        this.state.changeState(new Jump(this, this.dir));
    }
    start()
    {
        this.state.start();
        this.state.changeState(new Stand(this, this.dir));
    }
    update(dt)
    {
        this.state.update(dt);
    }
}
class Player extends Character
{
    constructor(input)
    {
        super();
        this.input = input;
        /** @type {Entity} */
        this.touchedEntity = null;
        this.standLeftAnim = ImageAnimation.loadFromUrl({
            src: "res/img/stand-left.png",
            frameWidth: 200,
            frameHeight: 200,
            renderWidth: 200,
            renderHeight: 200,
            fps: 15,
            count: 1
        });
        this.standRightAnim = ImageAnimation.loadFromUrl({
            src: "res/img/stand.png",
            frameWidth: 200,
            frameHeight: 200,
            renderWidth: 200,
            renderHeight: 200,
            fps: 15,
            count: 1
        });
        this.walkLeftAnim = ImageAnimation.loadFromUrl({
            src: "res/img/walk-left.png",
            frameWidth: 200,
            frameHeight: 200,
            renderWidth: 200,
            renderHeight: 200,
            fps: 15,
            count: 2
        });
        this.walkRightAnim = ImageAnimation.loadFromUrl({
            src: "res/img/walk.png",
            frameWidth: 200,
            frameHeight: 200,
            renderWidth: 200,
            renderHeight: 200,
            fps: 15,
            count: 2
        });
        this.attackLeftAnim = null;
        this.attackRightAnim = null;
        this.jumpLeftAnim = ImageAnimation.loadFromUrl({
            src: "res/img/stand-left.png",
            frameWidth: 200,
            frameHeight: 200,
            renderWidth: 200,
            renderHeight: 200,
            fps: 15,
            count: 1
        });
        this.jumpRightAnim = ImageAnimation.loadFromUrl({
            src: "res/img/stand.png",
            frameWidth: 200,
            frameHeight: 200,
            renderWidth: 200,
            renderHeight: 200,
            fps: 15,
            count: 1
        });
        input.onKeyDown.add(e => this.keyDown(e));
        input.onKeyUp.add(e => this.keyUp(e));
    }

    keyDown(e) {
        switch (e.key) {
            case Keys.Left:
            case Keys.A:
                this.walk(-1);
                break;
            case Keys.Right:
            case Keys.D:
                this.walk(1);
                break;
            case Keys.Up:
            case Keys.W:
                this.jump();
                break;
            case Keys.E:
                this.touchedEntity.interact(this);
                break;
        }
    }

    keyUp(e) {
        switch (e.key) {
            case Keys.Left:
            case Keys.A:
                this.control += 1;
                break;
            case Keys.Right:
            case Keys.D:
                this.control -= 1;
                break;
            case Keys.Up:
            case Keys.W:
                break;
        }
        this.updateControl();
    }
}
class NPC extends Character
{
    /**
     * 
     * @param {Number} pos 
     */
    constructor(pos)
    {
        super();
        pos = pos || 0;
        this.standLeftAnim = ImageAnimation.loadFromUrl({
            src: "res/img/stand-left.png",
            frameWidth: 200,
            frameHeight: 200,
            renderWidth: 200,
            renderHeight: 200,
            fps: 15,
            count: 1
        });
        this.standRightAnim = ImageAnimation.loadFromUrl({
            src: "res/img/stand.png",
            frameWidth: 200,
            frameHeight: 200,
            renderWidth: 200,
            renderHeight: 200,
            fps: 15,
            count: 1
        });
        this.walkLeftAnim = ImageAnimation.loadFromUrl({
            src: "res/img/walk-left.png",
            frameWidth: 200,
            frameHeight: 200,
            renderWidth: 200,
            renderHeight: 200,
            fps: 15,
            count: 2
        });
        this.walkRightAnim = ImageAnimation.loadFromUrl({
            src: "res/img/walk.png",
            frameWidth: 200,
            frameHeight: 200,
            renderWidth: 200,
            renderHeight: 200,
            fps: 15,
            count: 2
        });
        this.attackLeftAnim = null;
        this.attackRightAnim = null;
        this.jumpLeftAnim = ImageAnimation.loadFromUrl({
            src: "res/img/stand-left.png",
            frameWidth: 200,
            frameHeight: 200,
            renderWidth: 200,
            renderHeight: 200,
            fps: 15,
            count: 1
        });
        this.jumpRightAnim = ImageAnimation.loadFromUrl({
            src: "res/img/stand.png",
            frameWidth: 200,
            frameHeight: 200,
            renderWidth: 200,
            renderHeight: 200,
            fps: 15,
            count: 1
        });
        this.gameObject.collider = new Rectangle(400, 400);
        this.gameObject.collider.moveTo(0, 200);
        this.gameObject.collider.rigidBody = false;
        this.gameObject.graphic = this.gameObject.collider;
        this.gameObject.gravity = false;
        this.hoverUI = new GameObject();
        this.hoverUI.graphic = new Text("Press [E] to interact.");
        this.hoverUI.graphic.font.fontSize = 40;
        this.hoverUI.linkTo(this.gameObject);
        GameSystem.scene.addGameObject(this.hoverUI);

        this.gameObject.moveTo(pos, 0);
        this.hoverUI.moveTo(pos, 250);
    }
    update()
    {
        super.update();
        if (this.gameObject.collider.isCollideWith(GameSystem.player.gameObject.collider))
        {
            if (GameSystem.player.touchedEntity !== this)
            {
                GameSystem.player.touchedEntity = this;
                this.hoverUI.animate({
                    "graphic.fillStyle.alpha": 1
                }, 0.2);
            }
        }
        else
        {
            if (GameSystem.player.touchedEntity === this)
            {
                GameSystem.player.touchedEntity = null;
                this.hoverUI.animate({
                    "graphic.fillStyle.alpha": 0
                }, 0.2);
            }
        }
    }
}    
class PlayerStateMachine extends FSM
{
    /**
     * 
     * @param {Character} player 
     * @param {PlayerState} defaultState 
     */
    constructor(player, defaultState)
    {
        super();
        this.player = player;
        this.currentState = defaultState;
    }
    /**
     * 
     * @param {PlayerState} nextState 
     */
    changeState(nextState)
    {
        if (this.currentState && this.currentState.constructor.name === nextState.constructor.name)
            return;
        if (this.currentState)
            if (this.currentState.exit(nextState) === false)
                return;
        this.prevState = this.currentState;
        this.currentState = nextState;
        this.currentState.enter(this.prevState);
    }
    start()
    {
        if (this.currentState)
            this.currentState.enter(null);    
    }
}
class PlayerState extends State
{
    /**
     * 
     * @param {Character} player 
     * @param {Number} dir 
     */
    constructor(player, dir)
    {
        super();
        this.player = player;
        this.dir = dir;
    }

}
class Stand extends PlayerState
{
    /**
     * 
     * @param {Character} player 
     * @param {Number} dir 
     */
    constructor(player,dir)
    {
        super(player, dir);
        if (dir > 0)
            this.anim = player.standRightAnim;
        else
            this.anim = player.standLeftAnim;    
    }
    enter(prevState)
    {
        var newpos = Vector2.plus(this.player.position, new Vector2(0, this.anim.height / 2));
        this.anim.moveTo(newpos.x, newpos.y);
        this.player.gameObject.graphic = this.anim;
        this.player.dir = this.dir;
        this.player.gameObject.v = new Vector2(0,0);
    }
    exit(nextState)
    {
        return true;
    }
}
class Walk extends PlayerState
{
    /**
     * 
     * @param {Character} player 
     * @param {Number} dir 
     */
    constructor(player, dir)
    {
        super(player, dir);
        if (dir > 0)
            this.anim = player.walkRightAnim;
        else
            this.anim = player.walkLeftAnim;
    }
    enter(prevState)
    {
        var newpos = Vector2.plus(this.player.position, new Vector2(0, this.anim.height / 2));
        this.anim.moveTo(newpos.x, newpos.y);
        this.player.gameObject.graphic = this.anim;
        this.player.dir = this.dir;
        this.player.gameObject.v.x = Math.sign(this.dir) * this.player.walkSpeed;
    }
    exit(nextState)
    {
        return true;
    }
}
class Attack extends PlayerState
{
    /**
     * 
     * @param {Character} player 
     * @param {Number} dir 
     */
    constructor(player, dir)
    {
        super(player, dir);
        if (dir > 0)
            this.anim = player.attackRightAnim;
        else
            this.anim = player.attackLeftAnim;
        this.complete = false;
    }
    enter(prevState)
    {
        this.anim.frame = 0;
        this.anim.loop.enable = false;
        var newpos = Vector2.plus(this.player.position, new Vector2(0, this.anim.height / 2));
        this.anim.moveTo(newpos.x, newpos.y);
        this.player.gameObject.graphic = this.anim;
        this.anim.onEnd = () =>
        {
            this.player.state.changeState(new Stand(this.player, this.dir));
        };
    }
    exit(nextState)
    {
        return false;
    }
}
class Jump extends PlayerState
{
    /**
     * 
     * @param {Character} player 
     * @param {Number} dir 
     */
    constructor(player, dir)
    {
        super(player, dir);
        this.anim = null;
        this.jumped = false;
        this.jumpFrame = false;
    }
    resetDir(dir)
    {
        this.dir = dir;
        if (dir > 0)
            this.anim = this.player.jumpRightAnim;
        else
            this.anim = this.player.jumpLeftAnim;
        var newpos = Vector2.plus(this.player.position, new Vector2(0, this.anim.height / 2));
        this.anim.moveTo(newpos.x, newpos.y);
        this.player.gameObject.graphic = this.anim;
    }
    enter(prevState)
    {
        this.resetDir(this.dir);
        if (this.player.gameObject.collider.landed)
            this.player.gameObject.v.y = this.player.jumpSpeed;
        this.jumped = true;
        this.jumpFrame = true;
    }
    exit(nextState)
    {
        if (nextState.constructor.name === this.constructor.name)
            return true;    
        if (this.jumped && this.player.gameObject.collider.landed)
            return true;
        return false;
    }
    update(dt)
    {
        if (this.jumpFrame)
        {
            this.jumpFrame = false;
            return;
        } 
        if (this.jumped && this.player.gameObject.collider.landed)
        {
            this.player.dir = this.dir;
            this.player.updateControl();
        }    
        if (this.dir != this.player.control && this.player.control !=0)
        {
            this.resetDir(Math.sign(this.player.control));
        }
        this.player.gameObject.v.x = Math.sign(this.player.control) * this.player.walkSpeed;
    }
}
export { Player, NPC };