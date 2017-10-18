class Animal
{
    constructor(id, species)
    {
        this.species = species;
        this.id = id;
        this.name = species + "-" + id;
        this.state = null;
        this.previousState = null;
        this.globalState = null;
        this.energy = 0;
        this.age = 0;
        this.gameObject = new GameObject();
        this.forward = new Vector2(0, 1);
        this.visualRange = { distance: 200, ang: Math.PI };
        this.blockPosition = new Vector2(0, 0);
        var animal = this;
        this.gameObject.onUpdate = function (obj, dt)
        {
            animal.update.call(animal, dt);
        }
    }

    update(dt)
    {
        this.forward.x = Math.cos(this.gameObject.rotation + Math.PI/2);
        this.forward.y = Math.sin(this.gameObject.rotation + Math.PI / 2);
        this.blockPosition.x = parseInt(this.gameObject.position.x / blockSize);
        this.blockPosition.y = parseInt(this.gameObject.position.y / blockSize);
        this.state.update(dt);
    }

    changeState(state)
    {
        this.state.onExit(state);
        var previous = this.state;
        this.state = state;
        this.state.onEnter(previous);
    }

    moveTo(target, powerCost, maxTurn, dt)
    {
        this.energy -= powerCost * dt;

        this.gameObject.v = Vector2.multi(this.forward, 40 * Math.random());
        var ang = 0;
        if (target instanceof Vector2) 
            ang = Math.atan2(target.y, target.x) - Math.atan2(this.forward.y, this.forward.x);
        else if (!isNaN(target))
            ang = target - Math.atan2(this.forward.y, this.forward.x);

        if (ang > maxTurn) {
            this.gameObject.rotate(maxTurn);
        }
        else if (ang < -maxTurn) {
            this.gameObject.rotate(-maxTurn);
        }
        else {
            this.gameObject.rotate(ang);
        }
    }

    randomDirection()
    {
        var direction = (Math.tan((Math.random() - 0.5) * Math.PI * 0.93) / 20 + 0.5) * Math.PI * 2 - Math.PI;
        direction += Math.atan2(this.forward.y, this.forward.x);
        return direction;
    }
}

class State
{
    update(dt)
    {

    }

    onEnter()
    {

    }

    onExit()
    {

    }
    constructor(animal)
    {
        this.animal = animal;
        this.gameObject = animal.gameObject;
    }
}

class Deer extends Animal
{
    constructor(id, x, y)
    {
        super(id, "deer");
        this.energy = 200;
        this.state = new DeerWander(this);
        var pol = new Polygon([new Point(0, 10), new Point(10, -10), new Point(-10, -10)]);
        pol.setCenter(0, 0);
        pol.moveTo(0, 0);
        pol.fillStyle = "white";
        pol.strokeStyle = "rgba(0,0,0,0.05)";
        this.gameObject.graphic = pol;
        scene.addGameObject(this.gameObject, 1);
        this.gameObject.moveTo(x, y);
    }
}

class DeerGlobalState extends State
{
    update(dt)
    {
    }
    onEnter(previousState)
    {

    }
    onExit(nextState)
    {

    }
    constructor(deer)
    {
        super(deer);
    }
}

class DeerWander extends State
{
    update(dt)
    {
        if (this.animal.energy < 190) {
            this.animal.changeState(new DeerForage(this.animal));
            return;
        }
        this.animal.moveTo(this.direction, this.power, this.maxTurn, dt);
        var state = this;
    }
    onEnter(previousState)
    {

    }
    onExit(nextState)
    {
        this.animal = null;
    }
    nextTarget()
    {
        if (!this.animal)
            return;
        this.direction = this.animal.randomDirection();
        /*
        this.target = new Vector2(Math.random() * 300 - 150, Math.random() * 300 - 150);
        console.log(this.target);
        this.target.plus(new Vector2(this.animal.gameObject.position.x, this.animal.gameObject.position.y));
        */
        var state = this;
        setTimeout(function ()
        {
            state.nextTarget.call(state);
        }, 1000 + 2000 * Math.random());
    }
    constructor(deer)
    {
        super(deer);

        this.power = 1;
        this.maxTurn = 0.02;
        this.nextTarget();
    }
}

class DeerForage extends State
{
    update(dt)
    {
        var blockX = this.animal.blockPosition.x;
        var blockY = this.animal.blockPosition.y;
        if (map[blockX] && map[blockX][blockY] && map[blockX][blockY].resource > 0) {
            this.animal.changeState(new DeerEat(this.animal));
            return;
        }
        else if (this.target === null) {
            this.findGrass();
        }
        else {
            this.animal.moveTo(this.target, this.power, this.maxTurn, dt);
        }
    }
    onEnter(previousState)
    {
        this.findGrass();
    }
    onExit(nextState)
    {
        this.animal = null;
    }
    findGrass()
    {
        if (!this.animal)
            return;
        this.target = null;
        var blockX = this.animal.blockPosition.x;
        var blockY = this.animal.blockPosition.y;
        for (var dist = 0; dist < this.animal.visualRange.distance; dist++) {
            var viewBlockX = parseInt(this.animal.gameObject.position.x + this.animal.forward.x * dist / blockSize);
            var viewBlockY = parseInt(this.animal.gameObject.position.y + this.animal.forward.y * dist / blockSize);

            if (viewBlockX != blockX &&
               viewBlockY != blockY &&
               map[viewBlockX] &&
               map[viewBlockX][viewBlockY] &&
               map[viewBlockX][viewBlockY].type == Map.Types.Grass) {
                this.target = Math.atan2(this.animal.forward.y, this.animal.forward.x);
            }
        }
        var state = this;
        if (this.target === null) {
            this.target = this.animal.randomDirection();
            setTimeout(function ()
            {
                state.findGrass.call(state);
            }, Math.random() * 1000);
        }
        else {
            setTimeout(function ()
            {
                state.findGrass.call(state);
            }, Math.random() * 3000 + 1000);
        }
    }
    constructor(deer)
    {
        super(deer);

        this.power = 2;
        this.maxTurn = 0.1;
        this.target = null;
    }

}

class DeerEat extends State
{
    update(dt)
    {
        this.animal.gameObject.v = new Vector2(0, 0);
        var blockX = this.animal.blockPosition.x;
        var blockY = this.animal.blockPosition.y;
        var resource = this.eatSpeed * dt;
        if (map.get(blockX, blockY) && map.get(blockX, blockY).type==Map.Types.Grass) {
            if(map.get(blockX,blockY).resource>resource){
                map[blockX][blockY].resource -= resource;
                this.animal.energy += resource / 10;
            }
            else{
                resource = map[blockX][blockY].resource;
                map[blockX][blockY].resource = 0;
                map[blockX][blockY].type = Map.Types.Sand;
                this.animal.energy += resource / 10;
                this.animal.changeState(new DeerForage(this.animal));
            }
        }
    }
    constructor(deer)
    {
        super(deer);

        this.eatSpeed = 20;

    }
}

class Tiger extends Animal
{
    constructor(id, x, y)
    {
        super(id, "tiger");

        this.state = new TigerWander(Tiger);

        var pol = new Polygon([new Point(0, 20), new Point(10, 0), new Point(-10, 0)]);
        pol.fillStyle = "#ff8888";
        pol.strokeStyle = "rgba(0,0,0,0)";
        this.gameObject.graphic = pol;
        scene.addGameObject(this.gameObject, 1);
        this.gameObject.moveTo(x, y);
    }
}

class TigerGlobal extends State
{
    update(dt)
    {
    }
    onEnter(previousState)
    {

    }
    onExit(nextState)
    {

    }
    constructor(tiger)
    {
        super(tiger);
    }
}

class TigerWander extends State
{
    update(dt)
    {
        var tiger = this.animal;
    }
    onEnter(previousState)
    {
    }
    onExit(nextState)
    {

    }
    constructor(tiger)
    {
        super(tiger);
        this.power = 1;

    }
}