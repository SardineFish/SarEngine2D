import { FSM, State } from "./fsm.js";
class Player
{
    constructor(input)
    {
        this.input = input;
        this.gameObject = new GameObject();
        this.state = new FSM();
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
        this.gameObject.graphic = new Combination([this.gameObject.collider.copy(), this.standAnim  , new Circle(10)]);
        this.gameObject.onUpdate = (obj, dt) => this.update(dt);
        this.gameObject.gravity = true;
        this.gameObject.collider.rigidBody = true;
        this.gameObject.moveTo(0, 300);
        input.onKeyDown.add(e => this.keyDown(e));
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
        this.gameObject.graphic = this.walkAnim;//new Combination([this.gameObject.collider.copy(), this.walkAnim, new Circle(10)]);
        var newpos = Vector2.plus(this.gameObject.position, new Vector2(0, 100));
        this.gameObject.graphic.moveTo(newpos.x, newpos.y);
        this.gameObject.v = new Vector2(Math.sign(dir.x) * this.walkSpeed, 0);
    }

    jump()
    {
        console.log(this.gameObject.collider.landed);
        if (this.gameObject.collider.landed)
            this.gameObject.v.y = this.jumpSpeed;    
    }

    update(dt)
    {
    }

    keyDown(e)
    {
        switch (e.key)
        {
            case Keys.Left:
            case Keys.A:
                this.walk(new Vector2(-1, 0));
                break;
            case Keys.Right:
            case Keys.D:
                this.walk(new Vector2(1, 0));
                break;
            case Keys.Up:
            case Keys.W:
                this.jump();
                break;
            

        }
    }
}

class StandLeft extends State
{
    /**
     * 
     * @param {Player} player 
     */
    constructor(player)
    {
        this.player = player;
    }
    enter()
    {
        
    }
}

export { Player };