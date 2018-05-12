class Player
{
    constructor(input)
    {
        this.input = input;
        this.gameObject = new GameObject();
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
        this.gameObject.graphic = this.standAnim;
        this.gameObject.onUpdate = (obj, dt) => this.update(dt);
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
        this.gameObject.graphic = this.walkAnim;
        this.gameObject.v = new Vector2(Math.sign(dir.x) * this.walkSpeed, 0);
    }

    update(dt)
    {
    }

    keyDown(e)
    {
        if (e.key == Keys.Left)
        {
            this.walk(new Vector2(-1, 0));
        }    
    }
}

export { Player };