import { FSM, State } from "./fsm.js";
class Player
{
    constructor(input)
    {
        this.input = input;
        this.gameObject = new GameObject();
        this.dir = 1;
        this.control = 0;
        this.state = new PlayerStateMachine(this, null);
        this.standLeftAnim = ImageAnimation.loadFromUrl({
            src: "res/img/stand.png",
            frameWidth: 200,
            frameHeight: 200,
            renderWidth: -200,
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
            src: "res/img/walk.png",
            frameWidth: 200,
            frameHeight: 200,
            renderWidth: -200,
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
        this.jumpLeftAnim = null;
        this.jumpRightAnim = null;
        this.standAnim = ImageAnimation.loadFromUrl({
            src: "res/img/stand.png",
            frameWidth: 200,
            frameHeight: 200,
            renderWidth: 200,
            renderHeight: 200,
            fps: 15,
            count: 1
        });
        this.walkAnim = ImageAnimation.loadFromUrl({
            src: "res/img/walk.png",
            frameWidth: 200,
            frameHeight: 200,
            renderWidth: 200,
            renderHeight: 200,
            fps: 15,
            count: 2
        });
        this.walkSpeed = 100;
        this.jumpSpeed = 400;
        this.gameObject.setCenter(0, 100);
        this.gameObject.collider = new Rectangle(200, 200);
        this.gameObject.collider.moveTo(0, 100);
        this.walkAnim.moveTo(0, 100);
        this.standAnim.moveTo(0, 100);
        //this.gameObject.graphic = new Combination([this.gameObject.collider.copy(), this.standAnim  , new Circle(10)]);
        this.gameObject.onUpdate = (obj, dt) => this.update(dt);
        this.gameObject.gravity = true;
        this.gameObject.collider.rigidBody = true;
        this.gameObject.moveTo(0, 300);
        input.onKeyDown.add(e => this.keyDown(e));
        input.onKeyUp.add(e => this.keyUp(e));
        this.state.start();
        this.state.changeState(new Stand(this, this.dir));
    }

    get position()
    {
        return this.gameObject.position;
    }
    set position(value)
    {
        this.gameObject.moveTo(value.x, value.y);
    }

    walk(dir)
    {
        this.control += dir;
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
        if (this.control == 0)
        {
            this.state.changeState(new Stand(this, this.dir));
        }
        else
            this.state.changeState(new Walk(this, this.dir));
    }

    jump()
    {
        this.state.changeState(new Jump(this, this.dir));
    }

    update(dt)
    {
        this.state.update(dt);
    }

    keyDown(e)
    {
        switch (e.key)
        {
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
        }
    }

    keyUp(e)
    {
        switch (e.key)
        {
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

class PlayerStateMachine extends FSM
{
    /**
     * 
     * @param {Player} player 
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
     * @param {Player} player 
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
     * @param {Player} player 
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
     * @param {Player} player 
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
     * @param {Player} player 
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
     * @param {Player} player 
     * @param {Number} dir 
     */
    constructor(player, dir)
    {
        super(player, dir);
        if (dir > 0)
            this.anim = player.jumpRightAnim;
        else
            this.anim = player.jumpLeftAnim;
    }
    enter(prevState)
    {
        var newpos = Vector2.plus(this.player.position, new Vector2(0, this.anim.height / 2));
        this.anim.moveTo(newpos.x, newpos.y);
        this.player.gameObject.graphic = this.anim;
    }
    exit(nextState)
    {
        return true;
    }
}
export { Player };