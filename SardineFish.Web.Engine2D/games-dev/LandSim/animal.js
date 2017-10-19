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
        if (this.state)
            this.state.onExit(state);
        var previous = this.state;
        this.state = state;
        this.state.onEnter(previous);
    }

    isHungry()
    {
        return false;
    }

    moveTo(target, power, maxForce, maxTurn, dt)
    {
        this.energy -= power * dt;
        //this.gameObject.v = Vector2.multi(this.forward, 40 * Math.random());
        var distance = Number.MAX_VALUE;
        var ang = 0;
        if (target instanceof Vector2) {
            ang = Math.atan2(target.y - this.gameObject.position.y, target.x - this.gameObject.position.x) - Math.atan2(this.forward.y, this.forward.x);
            distance = Vector2.minus(target, this.gameObject.position).mod();
        }
        else if (!isNaN(target))
            ang = target - Math.atan2(this.forward.y, this.forward.x);


        var F = null;
        if (this.gameObject.v.mod() <= 0) {
            F = Vector2.multi(this.forward, maxForce);
        }
        else {
            F = power / this.gameObject.v.mod();
            if (F > maxForce)
                F = maxForce;
            F = Vector2.multi(this.forward, F);
        }
        /*if (distance < 1)
            return true;*/
        if (distance > (this.gameObject.v.mod() * this.gameObject.v.mod()) / (this.gameObject.scene.physics.f / this.gameObject.mass * 2))
            this.gameObject.F = F;
        else
            return true;

        if (ang > maxTurn) {
            this.gameObject.rotate(maxTurn);
        }
        else if (ang < -maxTurn) {
            this.gameObject.rotate(-maxTurn);
        }
        else {
            this.gameObject.rotate(ang);
        }
        return false;
    }

    
    randomDirection()
    {
        var direction = (Math.tan((Math.random() - 0.5) * Math.PI * 0.93) / 20 + 0.5) * Math.PI * 2 - Math.PI;
        //var direction = Math.random() * Math.PI * 2 - Math.PI;
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
        this.energy = 200000;
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

    isHungry()
    {
        return (this.energy < 100000);
    }

    isFull()
    {
        return (this.energy > 2000000);
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
    constructor(deer)
    {
        super(deer);

        this.maxPower = 20000;
        this.power = 0;
        this.maxTurn = 0.02;
        this.maxForce = 2000;
        this.nextTarget();
    }
    update(dt)
    {
        if (this.animal.isHungry()) {
            this.animal.changeState(new DeerForage(this.animal));
            return;
        }
        if (this.direction)
            this.animal.moveTo(this.direction, this.power, this.maxForce, this.maxTurn, dt);
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
        if (map.get(this.animal.blockPosition.x, this.animal.blockPosition.y).type == Block.Types.Grass && Math.random() < 0.1) {
            this.animal.changeState(new DeerEat(this.animal));
        }
        else if (Math.random() < 0.75) {
            this.direction = this.animal.randomDirection();
            this.power = this.maxPower * Math.random();
        }
        else
            this.direction = null;
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
}

class DeerForage extends State
{
    constructor(deer)
    {
        super(deer);

        this.power = 30000;
        this.maxForce = 5000;
        this.maxTurn = 0.1;
        this.target = null;
    }
    update(dt)
    {
        var blockX = this.animal.blockPosition.x;
        var blockY = this.animal.blockPosition.y;
        if (map.get(blockX, blockY).type == Block.Types.Grass && map.get(blockX, blockY).resource > 0) {
            this.animal.changeState(new DeerEat(this.animal));
            return;
        }
        else if (this.target === null) {
            this.findGrass();
        }
        else {
            this.animal.moveTo(this.target, this.power, this.maxForce, this.maxTurn, dt);
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
                map.get(viewBlockX, viewBlockY).type == Block.Types.Grass) {
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

}

class DeerEat extends State
{
    constructor(deer)
    {
        super(deer);

        this.eatSpeed = 50000;
        this.eatUntilFull = false;
    }
    update(dt)
    {
        this.animal.gameObject.v = new Vector2(0, 0);
        var blockX = this.animal.blockPosition.x;
        var blockY = this.animal.blockPosition.y;
        var resource = this.eatSpeed * dt;
        if (map.get(blockX, blockY) && map.get(blockX, blockY).type==Block.Types.Grass) {
            if(map.get(blockX,blockY).resource>resource){
                map[blockX][blockY].resource -= resource;
                this.animal.energy += resource / 10;
            }
            else{
                resource = map[blockX][blockY].resource;
                map[blockX][blockY].resource = 0;
                map[blockX][blockY].type = Block.Types.Sand;
                this.animal.energy += resource / 10;
                if (this.animal.isFull() || !this.eatUntilFull)
                    this.animal.changeState(new DeerWander(this.animal));
                else
                    this.animal.changeState(new DeerForage(this.animal));
            }
        }
    }
    onEnter(previousState)
    {
        if (this.animal.isHungry())
            this.eatUntilFull = true;
    }
}

class DeerControl extends State
{
    constructor(deer)
    {
        super(deer);
        this.target = null;
        this.power = 20000;
        this.maxTurn = 0.1;
        this.maxForce = 5000;
    }
    update(dt)
    {
        if (this.target) {
            if (this.animal.moveTo(this.target, this.power, this.maxForce, this.maxTurn, dt))
                this.target = null;
        }
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