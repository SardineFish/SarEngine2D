window.SarEngine = (function (engine)
{

//-----BEGIN SarEngine2D-----

    window.requestAnimationFrame =
        window.requestAnimationFrame ||
        window.mozRequestAnimationFrame ||
        window.webkitRequestAnimationFrame ||
        window.msRequestAnimationFrame;

    function Engine()
    {
        this.fps = 0;
        this.animationFrameId = null;
        this.status = EngineStatus.NotRun;
        this.onStart = null;
        this.onUpdate = null;
        this.onPause = null;
        this.onResume = null;
        this.onEnd = null;
        this.onError = null;

        var engine = this;
        var scene = null;
        Object.defineProperty(this, "scene", {
            get: function ()
            {
                return scene;
            },
            set: function (value)
            {
                if (scene)
                    scene.engine = null;
                scene = value;
                scene.engine = engine;
            }
        }
        );

        if (!Engine.onGlobalError) {
            EventJs.defineEvent(Engine, "onGlobalError");
        }
    }
    Engine.Version = 0.50;
    Engine.createByCanvas = function (canvas, width, height)
    {
        var engine = new Engine();
        var display = new Display(canvas, width, height);
        var scene = new Scene();
        engine.scene = scene;
        var camera = new Camera(0, 0, 0, 0, 1);
        camera.addDisplay(display);
        scene.addCamera(camera);
        scene.addInput(display);
        return engine;
    }
    Engine.createInNode = function (node, width, height)
    {
        var engine = new Engine();
        var display = new Display(node, width, height);
        var scene = new Scene();
        engine.scene = scene;
        var camera = new Camera(0, 0, 0, 0, 1);
        camera.addDisplay(display);
        scene.addCamera(camera);
        scene.addInput(display);
        return engine;
    }
    Engine.prototype.start = function ()
    {
        var engine = this;
        function animationFrame(delay)
        {
                if (engine.status == EngineStatus.Starting)
                {
                    engine.status = EngineStatus.Running;
                    if (engine.onStart)
                    {
                        var args = { cancel: false, handled: false };
                        engine.onStart(args);
                        if (args.cancel)
                        {
                            engine.status = EngineStatus.NotRun;
                            return;
                        }
                    }
                    engine.animationFrameId = requestAnimationFrame(animationFrame);
                    return;
                }
                else if (engine.status == EngineStatus.Pausing)
                {
                    if (engine.onPause)
                    {
                        var args = { cancel: false, handled: false };
                        engine.onPause(args);
                        if (args.cancel)
                        {
                            engine.status = EngineStatus.Running;
                        }
                        else
                        {
                            engine.status = EngineStatus.Paused;
                            return;
                        }
                    }
                    else
                    {
                        engine.status = EngineStatus.Paused;
                        return;
                    }
                }
                else if (engine.status == EngineStatus.Resuming)
                {
                    //engine.status=EngineStatus.Running;
                    if (engine.onResume)
                    {
                        var args = { cancel: false, handled: false };
                        engine.onResume(args);
                        if (args.cancel)
                        {
                            engine.status = EngineStatus.Paused;
                            return;
                        }
                    }
                    engine.status = EngineStatus.Running;
                    engine.animationFrameId = requestAnimationFrame(animationFrame);
                    return;

                }
                else if (engine.status == EngineStatus.Ending)
                {
                    if (engine.onEnd)
                    {
                        var args = { cancel: false, handled: false };
                        engine.onEnd(args);
                        if (args.cancel)
                        {
                            engine.status = EngineStatus.Running;
                        }
                        else if (engine.status == EngineStatus.Ending)
                        {
                            engine.status = EngineStatus.NotRun;
                            return;
                        }
                    }
                    else
                    {
                        engine.status = EngineStatus.NotRun;
                        return;
                    }
                }

                var x = delay;
                //delay = delay - lastDelay;
                delay = 13;
                lastDelay = x;
                /*if(engine.debug.clear)
                    engine.debug.clear();
                engine.fps = int(1000 / delay);
             engine.debug.writeLine("fps="+engine.fps);
                */
                if (engine.onUpdate)
                    engine.onUpdate(delay, engine);
                engine.scene.updateFrame(delay);

            /*}
            catch (ex)
            {
                if (engine.onError)
                {
                    var exArgs = { error: ex, stop: false };
                    engine.onError(exArgs);
                    if (exArgs.stop)
                        return;
                }
            }*/

            engine.animationFrameId = requestAnimationFrame(animationFrame);

        }
        this.status = EngineStatus.Starting;
        var lastDelay = 0;
        this.end = function ()
        {
            if (engine.status == EngineStatus.NotRun)
                throw new Error("Game not run.");
            engine.status = EngineStatus.Ending;
        }
        this.pause = function ()
        {
            if (engine.status == EngineStatus.Running || engine.status == EngineStatus.Resuming || engine.status == EngineStatus.Starting)
            {
                engine.status = EngineStatus.Pausing;
            }
            else if (engine.status == EngineStatus.NotRun)
                throw new Error("Game not run.");
            else
                throw new Error("Pause invailable.");
        }
        this.resume = function ()
        {
            if (engine.status != EngineStatus.Paused)
                throw new Error("Game not paused");
            engine.status = EngineStatus.Resuming;
            engine.animationFrameId = requestAnimationFrame(animationFrame);
        }
        if (!this.scene)
            return false;
        this.animationFrameId = requestAnimationFrame(animationFrame);
        this.status = EngineStatus.Starting;
    }
    Engine.prototype.end = function ()
    {
        throw new Error("Game not run.");
    }
    Engine.prototype.pause = function ()
    {
        throw new Error("Game not run.");
    }
    Engine.prototype.resume = function ()
    {
        throw new Error("Game not run.");
    }

    var EngineStatus = {
        NotRun: 1,
        Running: 2,
        Paused: 4,
        Starting: 3,
        Pausing: 6,
        Resuming: 7,
        Ending: 5
    };
    Engine.EngineStatus = EngineStatus;
    window.EngineStatus = EngineStatus;

    //Scene
    function Scene()
    {
        this.engine = null;
        this.objectList = ArrayList();
        this._objList = ArrayList();
        this.physics = new Scene.Physics();
        this.cameraList = ArrayList();
        this.layers = new LayerCollection();
        this.collideGroups = new ArrayList();
        this.collideGroups.ignoreGroup = new CollideGroup();
        this.collideGroups.defaultGroup = new CollideGroup();
        this.collideTable = new Matrix(0, 0);
        this.runtime = 0;
        this.GUI = null;
        this.worldBackground = new Color(0, 0, 0, 1.0);
        this.background = new BackgroundCollection(this);
        this.device = new Device();
        this.eventSources = ArrayList();
        this.doubleClickDelay = 200;
        EventJs.defineEvent(this, "onUpdate");
        EventJs.defineEvent(this, "onRender");
        EventJs.defineEvent(this, "onEndRender");
        EventJs.defineEvent(this, "onMouseMove");
        EventJs.defineEvent(this, "onMouseDown");
        EventJs.defineEvent(this, "onMouseUp");
        EventJs.defineEvent(this, "onClick");
        EventJs.defineEvent(this, "onDoubleClick");
        EventJs.defineEvent(this, "onWheel");
        EventJs.defineEvent(this, "onKeyDown");
        EventJs.defineEvent(this, "onKeyUp");
        EventJs.defineEvent(this, "onKeyPress");
        EventJs.defineEvent(this, "onTouchStart");
        EventJs.defineEvent(this, "onTouchMove");
        EventJs.defineEvent(this, "onTouchEnd");
        


        this.layers.scene = this;
        this.layers.add(new Layer(), 0);
    }
    function LayerCollection()
    {
        this.count = 0;
        this.topDepth = NaN;
        this.bottomDepth = NaN;
        this.top = null;
        this.bottom = null;
        this.scene = null;
        this.depthList = ArrayList();
        var layerCollection = this;
        Object.defineProperty(this, "count", {
            get: function ()
            {
                return layerCollection.depthList.length;
            }
        });
    }
    LayerCollection.prototype.add = function (layer, depth)
    {
        if (layer.scene)
        {
            throw new Error("This Layer has belong to another Scene.");
        }
        if (isNaN(depth) || this[depth])
        {
            throw new Error("Invalid depth.");
        }
        layer.scene = this.scene;
        this[depth] = layer;
        if (this.count == 0)
        {
            this.topDepth = depth;
            this.top = layer;
            this.bottomDepth = depth;
            this.bottom = layer;
            this.depthList[0] = depth;
        }
        else if (depth < this.depthList[0])
        {
            this.bottomDepth = depth;
            this.bottom = layer;
            this.depthList.insert(depth, 0);
        }
        else if (this.depthList[this.depthList.length - 1] < depth)
        {
            this.topDepth = depth;
            this.top = layer;
            this.depthList[this.depthList.length] = depth;
        }
        else
        {
            for (var i = 0; i < this.depthList.length; i++)
            {
                if (depth < this.depthList[i])
                {
                    this.depthList.insert(depth, i);
                    break;
                }
            }
        }
        
        for (var i = 0; i < this.scene.cameraList.length; i++)
        {
            var camera = this.scene.cameraList[i];
            for (var j = 0; j < camera.displayList.length ; j++)
            {
                camera.displayList[j].setLayer(this.count + this.scene.background.count);
            }
        }
    }
    LayerCollection.prototype.removeAt = function (depth)
    {
        if(!this[depth])
        {
            throw new Error("There is not a Layer at " + depth);
        }
        var layer = this[depth];
        this[depth] = null;
        this.depthList.remove(depth);
        if (this.depthList.length > 0)
        {
            this.topDepth = this.depthList[this.depthList.length - 1];
            this.top = this[this.topDepth];
            this.bottomDepth = this.depthList[0];
            this.bottom = this[this.bottomDepth];
        }
        else
        {
            this.topDepth = NaN;
            this.top = null;
            this.bottomDepth = NaN;
            this.bottomDepth = null;
        }

        var camera = this.scene.cameraList[i];
        for (var j = 0; j < camera.displayList.length ; j++)
        {
            camera.displayList[j].setLayer(this.count + this.scene.background.count);
        }
        return layer;
    }
    Scene.LayerCollection = LayerCollection;
    function BackgroundCollection(scene)
    {
        this.bgList = ArrayList();
        this.scene = scene;
        var bgCollection = this;
        Object.defineProperty(this, "count", {
            get: function ()
            {
                return bgCollection.bgList.length;
            }
        });
    }
    BackgroundCollection.prototype.add = function (bg, zIndex)
    {
        if (!bg)
        {
            throw new Error("Give me a Background please!");
        }
        if (!this.scene)
        {
            throw new Error("Are you kidding me?");
        }
        if (bg.scene)
        {
            throw new Error("Existed.");
        }
        bg.scene = this.scene;
        if (isNaN(zIndex))
            zIndex = this.bgList.length;
        if (zIndex < 0)
            zIndex = 0;
        this.bgList.insert(bg, zIndex);
        for (var i = 0; i < this.scene.cameraList; i++)
        {
            for (var j = 0; j < this.scene.cameraList[i].displayList.length; j++)
            {
                var display = this.scene.cameraList[i].displayList[j];
                display.setLayer(this.count + this.scene.layers.count);
            }
        }
        var bgCollection = this;
        (function (index)
        {
            Object.defineProperty(bgCollection, index, {
                configurable: true,
                get: function ()
                {
                    return bgCollection.bgList[index];
                }
            });
        })(this.count-1);
    }
    BackgroundCollection.prototype.remove = function (bg)
    {
        if (!bg)
        {
            throw new Error("Give me a Background please!");
        }
        if (!this.scene)
        {
            throw new Error("Are you kidding me?");
        }
        var index = this.bgList.indexOf(ob);
        if (index < 0)
            return false;
        this.bgList.removeAt(index);
        for (var i = 0; i < this.scene.cameraList; i++)
        {
            for (var j = 0; j < this.scene.cameraList[i].displayList.length; j++)
            {
                var display = this.scene.cameraList[i].displayList[j];
                display.setLayer(this.count + this.scene.layers.count);
            }
        }
        delete this[this.count];
    }
    Scene.BackgroundCollection = BackgroundCollection;
    Scene.Physics = function ()
    {
        this.g = new Vector2(0, 0);
        this.f = 0;
    }
    Scene.Physics.prototype.copy = function ()
    {
        var phy = new Scene.Physics();
        phy.g = this.g.copy();
        phy.f = this.f;
        return phy;
    }
    Scene.Physics.prototype.reset = function ()
    {
        this.g = new Vector2(0, 0);
        this.f = 0;
        return;
    }
    Scene.prototype.reset = function ()
    {
        this.camera = null;
        this.objectList = ArrayList();
        this._objList = ArrayList();
        if (this.physics)
            this.physics.reset();
    }
    Scene.prototype.physicalSimulate = function (dt)
    {
        var scene = this;
        var useGroup = true;

        for (var d = 0; d < this.layers.depthList.length; d++)
        {
            var objectList = this.layers[this.layers.depthList[d]].objectList;
            for (var i = 0; i < objectList.length; i++)
            {
                var obj = this.layers[this.layers.depthList[d]].objectList[i];
                var Fvector = Vector2.plus(obj.F, obj.constantForce);
                if (obj.gravity && (!obj.collider || !obj.collider.landed))
                {
                    Fvector.plus(Vector2.multi(this.physics.g, obj.mass));
                }
                if (this.physics.f > 0)
                {
                    var normV = Vector2.normalize(obj.v);
                    var F = Vector2.multi(normV, Fvector);

                    // Fuck the accuracy.
                    if (obj.v.mod() < 1)
                        obj.v.zero();

                    if (obj.v.x == 0 && obj.v.y == 0)
                    {
                        if (Fvector.mod() < this.physics.f)
                            Fvector = new Vector2(0, 0);
                        else
                            Fvector = Vector2.multi(Fvector.normalize(), Fvector.mod() - this.physics.f);
                    }
                    else {
                        var f = Vector2.multi(Vector2.multi(normV, -1), this.physics.f);
                        
                        Fvector.plus(f);
                    }
                }

                obj.a.x = Fvector.x / obj.mass;
                obj.a.y = Fvector.y / obj.mass;

                obj.moveTo(obj.position.x + obj.v.x * dt + 0.5 * obj.a.x * dt * dt, obj.position.y + obj.v.y * dt + 0.5 * obj.a.y * dt * dt);
                obj.v.x += obj.a.x * dt;
                obj.v.y += obj.a.y * dt;
                if (obj.collider && obj.collider.angV)
                {
                    var w = obj.collider.angV;
                    var ang = w * dt;
                    obj.rotate(ang, obj.collide.center.x, obj.collide.center.y);
                }
                if (obj.angV)
                {
                    var w = obj.angV;
                    var ang = w * dt;
                    obj.rotate(ang);
                }
                obj.resetForce();
                if (obj.collider)
                    obj.collider.landed = false;
            }

            if (!useGroup)
            {
                for (var i = 0; i < objectList.length; i++)
                {
                    var obj = this.layers[this.layers.depthList[d]].objectList[i];
                    if (obj.collider && obj.collider.rigidBody)
                    {
                        for (var j = i + 1; j < objectList.length; j++)
                        {
                            var target = objectList[j];
                            if (target.collider && target.collider.rigidBody)
                            {

                                if (obj.collider.isCollideWith(target.collider))
                                {

                                    obj.collider.collide(obj, target, dt);
                                }
                            }
                        }
                    }
                }
            }
        }

        //check defaultGroup
        for (var i = 0; i < this.collideGroups.defaultGroup.objectList.length; i++)
        {
            var obj1 = this.collideGroups.defaultGroup.objectList[i];
            if (!obj1.collider)
                continue;
            for (var j = i + 1; j < this.collideGroups.defaultGroup.objectList.length; j++)
            {
                var obj2 = this.collideGroups.defaultGroup.objectList[j];
                if (obj1 == obj2)
                    continue;
                if (obj1.layer.coordinate != obj2.layer.coordinate)
                    continue;
                if (obj1.id < 0 || obj2.id < 0)
                    continue;
                if (this.collideTable[obj1.id][obj2.id] == this.runtime)
                    continue;
                if (!obj2.collider)
                    continue;
                this.collideTable[obj1.id][obj2.id] = this.collideTable[obj2.id][obj1.id] = this.runtime;
                if (obj1.collider.isCollideWith(obj2.collider, obj1.v, obj2.v, dt))
                {
                    if (obj1.onCollide)
                    {
                        var args = { target: obj2 };
                        obj1.onCollide(args);
                    }
                    if (obj2.onCollide)
                    {
                        var args = { target: obj1 };
                        obj2.onCollide(args);
                    }
                    obj1.collider.collide(obj1, obj2, dt);
                }
            }
            for (var group2 = 0; group2 < this.collideGroups.length; group2++)
            {
                for (var j = 0; j < this.collideGroups[group2].objectList.length; j++)
                {
                    var obj2 = this.collideGroups[group2].objectList[j];
                    if (obj1 == obj2)
                        continue;
                    if (obj1.layer.coordinate != obj2.layer.coordinate)
                        continue;
                    if (obj1.id < 0 || obj2.id < 0)
                        continue;
                    if (this.collideTable[obj1.id][obj2.id] == this.runtime)
                        continue;
                    if (!obj2.collider)
                        continue;
                    this.collideTable[obj1.id][obj2.id] = this.collideTable[obj2.id][obj1.id] = this.runtime;
                    if (obj1.collider.isCollideWith(obj2.collider, obj1.v, obj2.v, dt))
                    {
                        if (obj1.onCollide)
                        {
                            var args = { target: obj2 };
                            obj1.onCollide(args);
                        }
                        if (obj2.onCollide)
                        {
                            var args = { target: obj1 };
                            obj2.onCollide(args);
                        }
                        obj1.collider.collide(obj1, obj2, dt);
                    }
                }
            }
        }
        for (var group1 = 0; group1 < this.collideGroups.length; group1++)
        {
            for (var i = 0; i < this.collideGroups[group1].objectList.length; i++)
            {
                var obj1 = this.collideGroups[group1].objectList[i];
                   if (!obj1.collider)
                    continue;
                for (var group2 = 0; group2 < this.collideGroups.length; group2++)
                {
                    if (group1 == group2)
                        continue;
                    if (this.collideGroups[group1].ignoreList.contain(this.collideGroups[group2]))
                        continue;
                    for (var j = 0; j < this.collideGroups[group2].objectList.length; j++)
                    {
                        var obj2 = this.collideGroups[group2].objectList[j];
                        if (obj1 == obj2)
                            continue;
                        if (obj1.layer.coordinate != obj2.layer.coordinate)
                            continue;
                        if (obj1.id < 0 || obj2.id < 0)
                            continue;
                        if (this.collideTable[obj1.id][obj2.id] == this.runtime)
                            continue;
                        if (!obj2.collider)
                            continue;
                        this.collideTable[obj1.id][obj2.id] = this.collideTable[obj2.id][obj1.id] = this.runtime;
                        if (obj1.collider.isCollideWith(obj2.collider, obj1.v, obj2.v, dt))
                        {
                            if (obj1.onCollide)
                            {
                                var args = { target: obj2 };
                                obj1.onCollide(args);
                            }
                            if (obj2.onCollide)
                            {
                                var args = { target: obj1 };
                                obj2.onCollide(args);
                            }
                            obj1.collider.collide(obj1, obj2, dt);
                        }
                    }
                }
            }
        }

    }
    Scene.prototype.render = function (dt)
    {
        var scene = this;
        if (!this.cameraList.length)
            return;
        var args = { dt: dt, cancel: false };
        scene.onRender.invoke(args);
        if (args.cancel)
            return;
        

        for (var i = 0; i < this.cameraList.length; i++)
        {
            this.cameraList[i].clear(this.worldBackground);
            this.cameraList[i].render(dt);
        }

        //scene.camera.graphics.clearRect(scene.camera.center.x - scene.camera.width / 2, scene.camera.center.y + scene.camera.height / 2, scene.camera.width, scene.camera.height);

        /*for (var i = 0; i < this.layers.depthList.length; i++)
        {
            var layer = this.layers[this.layers.depthList[i]];
            if (layer.onRender)
            {
                args = { graphics: graphics, dt: dt, cancel: false };
                layer.onRender(args);
                if (args.cancel)
                    continue;
            }
            
            layer.render(scene.camera.graphics, dt);

            if (layer.onEndRender)
            {
                layer.onEndRender();
            }
        }*/
        /*
        for (var i = 0; i < this.objectList.length; i++)
        {
            var obj = this.objectList[i];
            if (obj.onRender)
            {
                obj.onRender(obj, dt);
            }
            obj.render(scene.camera.graphics, obj.position.x, obj.position.y, 0, dt);
        }*/
        // return;
        




        /*if (scene.GUI)
        {
            scene.camera.resetTransform();
            scene.GUI.render(scene.camera.graphics);
        }*/
        // if (scene.background)
        // {
        //     scene.camera.resetTransform();
        //     scene.background.render(scene.camera.graphics);
        // }
        this.onEndRender.invoke();
        
    }
    Scene.prototype.updateFrame = function (delay)
    {
        /*try
        {*/
            var scene = this;
            this.runtime += delay;
            var dt = delay / 1000;
            var args = { dt: dt, cancel: false };
            scene.onUpdate.invoke(args);
            if (args.cancel)
                return;
            
            //dt=0.016;
            // Handle camera animation
            for (var i = 0; i < this.cameraList.length; i++)
            {
                for (var j = 0; j < this.cameraList[i].animationCallbackList.length; j++)
                {
                    this.cameraList[i].animationCallbackList[j](dt);
                }
            }
            for (var i = 0; i < this.objectList.length; i++)
            {
                var obj = this.objectList[i];
                obj.lifeTime += delay;
                if (obj.deleted)
                    return;
                if (obj.onUpdate)
                    obj.onUpdate(obj, dt);
                for (var j = 0; this.objectList[i] && j < this.objectList[i].animationCallbackList.length; j++)
                {
                    this.objectList[i].animationCallbackList[j](dt);
                }
            }
            var whileRender = true;
            this.render(dt);
            whileRender = false;
            this.physicalSimulate(dt);
            //this.render(dt);
            /*
        } catch (ex) {
            console.warn(ex.message);
        }*/
    }
    Scene.prototype.addInput = function (input)
    {
        if (!this.eventSources.contain(input))
        {
            this.eventSources.add(input);
            this.initEvents(input);
        }
        input.scene = this;
    }
    Scene.prototype.removeInput = function (input)
    {
        var index = this.eventSources.indexOf(input);
        if (index < 0)
            return;
        this.eventSources.removeAt(index);
        input.removeSceneEvent();
    }
    Scene.prototype.initEvents = function (input)
    {
        var clickTime = 0;
        var scene = this;

        // Mouse Events
        this.mouseMoveCallback = function (e)
        {
            var mapTo = e.input.coordinate.pointMapTo(Coordinate.Default, e.x, e.y);
            scene.device.mouse.dx = mapTo.x - scene.device.mouse.x;
            scene.device.mouse.dy = mapTo.y - scene.device.mouse.y;
            scene.device.mouse.x = mapTo.x;
            scene.device.mouse.y = mapTo.y;


            var args = new MouseEventArgs();
            args.button = e.button;
            args.buttonState = Mouse.ButtonState.None;
            args.handled = false;
            args.x = e.pageX;
            args.y = e.pageY;
            args.dx = scene.device.mouse.dx;
            args.dy = scene.device.mouse.dy;
            if (scene.GUI)
                scene.GUI.mouseMoveCallback(e);
            if (args.handled)
                return;

            /*args.x = (e.pageX / display.camera.zoom) + (display.camera.center.x - display.camera.width / 2);
            args.y = (display.camera.height - e.pageY / display.camera.zoom) + (display.camera.center.y - display.camera.height / 2);*/
            args.x = mapTo.x;
            args.y = mapTo.y;

            scene.onMouseMove.invoke(args);
        };
        this.mouseDownCallback = function (e)
        {
            
            var mapTo = e.input.coordinate.pointMapTo(Coordinate.Default, e.x, e.y);
            scene.device.mouse.dx = mapTo.x - scene.device.mouse.x;
            scene.device.mouse.dy = mapTo.y - scene.device.mouse.y;
            scene.device.mouse.x = mapTo.x;
            scene.device.mouse.y = mapTo.y;
            if (e.button == Mouse.Buttons.Left) {
                scene.device.mouse.left = Mouse.ButtonState.Pressed;
            }
            else if (e.button == Mouse.Buttons.Wheel) {
                scene.device.mouse.wheel = Mouse.ButtonState.Pressed;
            }
            else if (e.button == Mouse.Buttons.Right) {
                scene.device.mouse.right = Mouse.ButtonState.Pressed;
            }

            var args = new MouseEventArgs();
            args.button = e.button;
            args.buttonState = Mouse.ButtonState.Pressed;
            args.handled = false;
            args.x = mapTo.x;
            args.y = mapTo.y;
            args.dx = scene.device.mouse.dx;
            args.dy = scene.device.mouse.dy;
            args.input = e.input;
            args.raw = e.raw;
            args.dt = e.dt;

            /*args.x = (e.pageX / display.camera.zoom) + (display.camera.center.x - display.camera.width / 2);
            args.y = (display.camera.height - e.pageY / display.camera.zoom) + (display.camera.center.y - display.camera.height / 2);*/
            args.x = mapTo.x;
            args.y = mapTo.y;

            scene.onMouseMove.invoke(args);
        };
        this.mouseUpCallback = function (e)
        {
            var mapTo = e.input.coordinate.pointMapTo(Coordinate.Default, e.x, e.y);
            scene.device.mouse.dx = mapTo.x - scene.device.mouse.x;
            scene.device.mouse.dy = mapTo.y - scene.device.mouse.y;
            scene.device.mouse.x = mapTo.x;
            scene.device.mouse.y = mapTo.y;
            if (e.button == Mouse.Buttons.Left) {
                scene.device.mouse.left = Mouse.ButtonState.Released;
            }
            else if (e.button == Mouse.Buttons.Wheel) {
                scene.device.mouse.wheel = Mouse.ButtonState.Released;
            }
            else if (e.button == Mouse.Buttons.Right) {
                scene.device.mouse.right = Mouse.ButtonState.Released;
            }

            var args = new MouseEventArgs();
            args.button = e.button;
            args.buttonState = Mouse.ButtonState.Released;
            args.handled = false;
            args.x = mapTo.x;
            args.y = mapTo.y;
            args.dx = scene.device.mouse.dx;
            args.dy = scene.device.mouse.dy;
            args.input = e.input;
            args.raw = e.raw;
            args.dt = e.dt;

            /*args.x = (e.pageX / display.camera.zoom) + (display.camera.center.x - display.camera.width / 2);
            args.y = (display.camera.height - e.pageY / display.camera.zoom) + (display.camera.center.y - display.camera.height / 2);*/
            args.x = mapTo.x;
            args.y = mapTo.y;

            scene.onMouseUp.invoke(args);
        };
        this.clickCallback = function (e)
        {
            var mapTo = e.input.coordinate.pointMapTo(Coordinate.Default, e.x, e.y);
            scene.device.mouse.dx = mapTo.x - scene.device.mouse.x;
            scene.device.mouse.dy = mapTo.y - scene.device.mouse.y;
            scene.device.mouse.x = mapTo.x;
            scene.device.mouse.y = mapTo.y;

            var args = new MouseEventArgs();
            args.button = e.button;
            args.buttonState = Mouse.ButtonState.Click;
            args.handled = false;
            args.x = mapTo.x;
            args.y = mapTo.y;
            args.dx = scene.device.mouse.dx;
            args.dy = scene.device.mouse.dy;
            args.input = e.input;
            args.raw = e.raw;
            args.dt = e.dt;

            /*args.x = (e.pageX / display.camera.zoom) + (display.camera.center.x - display.camera.width / 2);
            args.y = (display.camera.height - e.pageY / display.camera.zoom) + (display.camera.center.y - display.camera.height / 2);*/
            args.x = mapTo.x;
            args.y = mapTo.y;

            scene.onClick.invoke(args);

            if (e.button == Mouse.Buttons.Left) {
                scene.device.mouse.left = Mouse.ButtonState.None;
            }
            else if (e.button == Mouse.Buttons.Wheel) {
                scene.device.mouse.wheel = Mouse.ButtonState.None;
            }
            else if (e.button == Mouse.Buttons.Right) {
                scene.device.mouse.right = Mouse.ButtonState.None;
            }
        };
        this.doubleClickCallback = function (e)
        {
            var mapTo = e.input.coordinate.pointMapTo(Coordinate.Default, e.x, e.y);
            scene.device.mouse.dx = mapTo.x - scene.device.mouse.x;
            scene.device.mouse.dy = mapTo.y - scene.device.mouse.y;
            scene.device.mouse.x = mapTo.x;
            scene.device.mouse.y = mapTo.y;


            var args = new MouseEventArgs();
            args.button = e.button;
            args.buttonState = Mouse.ButtonState.DoubleClick;
            args.handled = false;
            args.x = mapTo.x;
            args.y = mapTo.y;
            args.dx = scene.device.mouse.dx;
            args.dy = scene.device.mouse.dy;
            args.input = e.input;
            args.raw = e.raw;
            args.dt = e.dt;

            /*args.x = (e.pageX / display.camera.zoom) + (display.camera.center.x - display.camera.width / 2);
            args.y = (display.camera.height - e.pageY / display.camera.zoom) + (display.camera.center.y - display.camera.height / 2);*/
            args.x = mapTo.x;
            args.y = mapTo.y;

            scene.onDoubleClick.invoke(args);


            if (e.button == Mouse.Buttons.Left) {
                scene.device.mouse.left = Mouse.ButtonState.Released;
            }
            else if (e.button == Mouse.Buttons.Wheel) {
                scene.device.mouse.wheel = Mouse.ButtonState.Released;
            }
            else if (e.button == Mouse.Buttons.Right) {
                scene.device.mouse.right = Mouse.ButtonState.Released;
            }
        };
        this.wheelCallback = function (e)
        {
            var mapTo = e.input.coordinate.pointMapTo(Coordinate.Default, e.x, e.y);
            scene.device.mouse.dx = mapTo.x - scene.device.mouse.x;
            scene.device.mouse.dy = mapTo.y - scene.device.mouse.y;
            scene.device.mouse.x = mapTo.x;
            scene.device.mouse.y = mapTo.y;


            var args = new MouseEventArgs();
            args.button = e.button;
            args.buttonState = Mouse.ButtonState.Rolled;
            args.wheelDelta = e.deltaY;
            args.handled = false;
            args.x = mapTo.x;
            args.y = mapTo.y;
            args.dx = scene.device.mouse.dx;
            args.dy = scene.device.mouse.dy;
            args.input = e.input;
            args.raw = e.raw;
            args.dt = e.dt;

            /*args.x = (e.pageX / display.camera.zoom) + (display.camera.center.x - display.camera.width / 2);
            args.y = (display.camera.height - e.pageY / display.camera.zoom) + (display.camera.center.y - display.camera.height / 2);*/
            args.x = mapTo.x;
            args.y = mapTo.y;

            scene.onWheel.invoke(args);
        };

        // Key Events
        this.keyDownCallback = function (e)
        {
            if (scene.device.keyboard.keys[e.key] != Keyboard.KeyState.Down) {
                scene.device.keyboard.keys[e.key] = Keyboard.KeyState.Down;
                scene.onKeyDown.invoke(e);
            }
        };
        this.keyUpCallback = function (e)
        {
            if (scene.device.keyboard.keys[e.key] != Keyboard.KeyState.Up) {
                scene.device.keyboard.keys[e.key] = Keyboard.KeyState.Up;
                scene.onKeyUp.invoke(e);
                scene.device.keyboard.keys[e.key] = Keyboard.KeyState.None;
            }
        };
        this.keyPressCallback = function (e)
        {
            if (scene.device.keyboard.keys[e.key] != Keyboard.KeyState.Pressed) {
                scene.device.keyboard.keys[e.key] = Keyboard.KeyState.Pressed;
                scene.onKeyPress.invoke(e);
                scene.device.keyboard.keys[e.key] = Keyboard.KeyState.None;
            }
        };

        // Touch Events
        this.touchStartCallback = function (e)
        {

        };
        this.touchEndCallback = function (e)
        {

        };
        this.touchMoveCallback = function (e)
        {

        };


        return;
//---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------        

        var dom = input;
        if (input instanceof Display)
        {
            dom = input.displayDOM;
            display = input;
        }
        else if (input instanceof window.Element)
        {
            dom = input;
            if (!display)
                throw new Error("Display required.");
        }

        input.removeSceneEvent = function ()
        {
            dom.removeEventListener("mouseenter", mouseEnterCallback);
            dom.removeEventListener("mouseout", mouseOutCallback);
            dom.removeEventListener("mousemove", mouseMoveCallback);
            dom.removeEventListener("mouseover", mouseOverCallback);
            dom.removeEventListener("mouseout", mouseOutCallback);
            dom.removeEventListener("mousedown", mouseDownCallback);
            dom.removeEventListener("mouseup", mouseUpCallback);
            dom.removeEventListener("mousewheel", mouseWheelCallback);
            dom.removeEventListener("click", clickCallback);
            window.removeEventListener("keydown", keyDownCallback);
            window.removeEventListener("keyup", KeyUpCallback);
            window.removeEventListener("keypress", keyPressCallback);
            dom.removeEventListener("touchstart", touchStartCallback);
            dom.removeEventListener("touchmove", touchMoveCallback);
            dom.removeEventListener("touchend", touchEndCallback);
        }

        //var asdf = 0;
        function mouseEnterCallback(e)
        {
            //console.log("enter" + asdf++);
            var mapTo = display.camera.map(e.pageX, e.pageY, display, Coordinate.Default);
            scene.device.mouse.dx = 0;
            scene.device.mouse.dy = 0;
            scene.device.mouse.x = mapTo.x;
            scene.device.mouse.y = mapTo.y;
            var x = 0;
        }
        function mouseOutCallback(e)
        {
            //console.log("out" + asdf++);
        }
        function mouseMoveCallback(e)
        {
            //console.log("move" + asdf++);
            var mapTo = display.camera.map(e.pageX, e.pageY, display, Coordinate.Default);
            scene.device.mouse.dx = mapTo.x - scene.device.mouse.x;
            scene.device.mouse.dy = mapTo.y - scene.device.mouse.y;
            scene.device.mouse.x = mapTo.x;
            scene.device.mouse.y = mapTo.y;


            var args = new MouseEventArgs();
            args.button = e.button;
            args.buttonState = Mouse.ButtonState.None;
            args.handled = false;
            args.x = e.pageX;
            args.y = e.pageY;
            args.dx = scene.device.mouse.dx;
            args.dy = scene.device.mouse.dy;
            if (scene.GUI)
                scene.GUI.mouseMoveCallback(e);
            if (args.handled)
                return;

            /*args.x = (e.pageX / display.camera.zoom) + (display.camera.center.x - display.camera.width / 2);
            args.y = (display.camera.height - e.pageY / display.camera.zoom) + (display.camera.center.y - display.camera.height / 2);*/
            args.x = mapTo.x;
            args.y = mapTo.y;

            if (scene.onMouseMove)
                scene.onMouseMove(args);
        }
        function mouseOverCallback(e)
        {
            var args = new MouseEventArgs();
            args.x = display.camera.map(e.pageX, e.pageY, display, Coordinate.Default).x;
            args.y = display.camera.map(e.pageX, e.pageY, display, Coordinate.Default).y;
            args.button = e.button;
            args.buttonState = Mouse.ButtonState.None;
            args.handled = false;
            if (scene.onMouseOver)
                scene.onMouseOver(args);
        }
        function mouseOutCallback(e)
        {
            var args = new MouseEventArgs();
            args.x = display.camera.map(e.pageX, e.pageY, display, Coordinate.Default).x;
            args.y = display.camera.map(e.pageX, e.pageY, display, Coordinate.Default).y;
            args.button = e.button;
            args.buttonState = Mouse.ButtonState.None;
            args.handled = false;
            if (scene.onMouseOut)
                scene.onMouseOut(args);
        }
        function mouseDownCallback(e)
        {
            var mapTo = display.camera.map(e.pageX, e.pageY, display, Coordinate.Default);
            scene.device.mouse.dx = mapTo.x - scene.device.mouse.x;
            scene.device.mouse.dy = mapTo.y - scene.device.mouse.y;
            scene.device.mouse.x = mapTo.x;
            scene.device.mouse.y = mapTo.y;
            if (e.button == Mouse.Buttons.Left)
            {
                scene.device.mouse.left = Mouse.ButtonState.Pressed;
            }
            else if (e.button == Mouse.Buttons.Wheel)
            {
                scene.device.mouse.wheel = Mouse.ButtonState.Pressed;
            }
            else if (e.button == Mouse.Buttons.Right)
            {
                scene.device.mouse.right = Mouse.ButtonState.Pressed;
            }

            var args = new MouseEventArgs();
            args.button = e.button;
            args.buttonState = Mouse.ButtonState.Pressed;
            args.handled = false;
            args.x = e.pageX;
            args.y = e.pageY;
            if (scene.GUI)
                scene.GUI.mouseDownCallback(args);
            if (args.handled)
                return;

            args.x = mapTo.x;
            args.y = mapTo.y;
            for (var i = 0; i < scene.objectList.length; i++)
            {
                var obj = scene.objectList[i];
                if (obj.hitTest && obj.onMouseDown && obj.collider)
                {
                    var p = new Point(args.x, args.y);
                    if (obj.collider.isCollideWith(p))
                    {
                        obj.onMouseDown(args);
                        if (args.handled)
                            return true;
                    }
                }
            }
            if (args.handled)
                return;
            if (scene.onMouseDown)
                scene.onMouseDown(args);
        }
        function mouseUpCallback(e)
        {
            var mapTo = display.camera.map(e.pageX, e.pageY, display, Coordinate.Default);
            scene.device.mouse.dx = mapTo.x - scene.device.mouse.x;
            scene.device.mouse.dy = mapTo.y - scene.device.mouse.y;
            scene.device.mouse.x = mapTo.x;
            scene.device.mouse.y = mapTo.y;
            if (e.button == Mouse.Buttons.Left)
            {
                scene.device.mouse.left = Mouse.ButtonState.Released;
            }
            else if (e.button == Mouse.Buttons.Wheel)
            {
                scene.device.mouse.wheel = Mouse.ButtonState.Released;
            }
            else if (e.button == Mouse.Buttons.Right)
            {
                scene.device.mouse.right = Mouse.ButtonState.Released;
            }

            var args = new MouseEventArgs();
            args.button = e.button;
            args.buttonState = Mouse.ButtonState.Released;
            args.handled = false;
            args.x = e.pageX;
            args.y = e.pageY;
            if (scene.GUI)
                scene.GUI.mouseUpCallback(args);
            if (args.handled)
                return;

            args.x = mapTo.x;
            args.y = mapTo.y;

            for (var i = 0; i < scene.objectList.length ; i++)
            {
                var obj = scene.objectList[i];
                if (obj.hitTest && obj.onMouseUp && obj.collider)
                {
                    var p = new Point(args.x, args.y);
                    if (obj.collider.isCollideWith(p))
                    {
                        obj.onMouseUp(args);
                        if (args.handled)
                            return true;
                    }
                }
            }
            if (args.handled)
                return;
            if (scene.onMouseUp)
                scene.onMouseUp(args);
        }
        function mouseWheelCallback(e)
        {
            var mapTo = display.camera.map(e.pageX, e.pageY, display, Coordinate.Default);
            scene.device.mouse.dx = mapTo.x - scene.device.mouse.x;
            scene.device.mouse.dy = mapTo.y - scene.device.mouse.y;
            scene.device.mouse.x = mapTo.x;
            scene.device.mouse.y = mapTo.y;

            var args = new MouseEventArgs();
            args.wheelDelta = e.wheelDelta;
            args.handled = false;
            args.x = e.pageX;
            args.y = e.pageY;
            if (scene.GUI && scene.GUI.mouseWheelCallback)
                scene.GUI.mouseWheelCallback(args);
            if (args.handled)
                return;

            args.x = mapTo.x;
            args.y = mapTo.y;
            for (var i = 0; i < scene.objectList.length; i++)
            {
                var obj = scene.objectList[i];
                if (obj.hitTest && obj.onMouseWheel && obj.collider)
                {
                    var p = new Point(args.x, args.y);
                    if (obj.collider.isCollideWith(p))
                    {
                        obj.onMouseWheel(args);
                        if (args.handled)
                            return true;
                    }
                }
            }
            if (args.handled)
                return;
            if (scene.onMouseWheel)
                scene.onMouseWheel(args);
        }
        function clickCallback(e)
        {
            var args = new MouseEventArgs();
            args.button = e.button;
            args.buttonState = Mouse.ButtonState.Click;
            args.handled = false;

            var t = (new Date()).getTime();
            if (t - clickTime <= scene.doubleClickDelay)
            {
                args.buttonState = Mouse.ButtonState.DoubleClick; args.x = e.pageX;
                args.y = e.pageY;
                if (scene.GUI)
                    scene.GUI.doubleClickCallback(args);
                if (args.handled)
                    return;

                args.x = display.camera.map(e.pageX, e.pageY, display, Coordinate.Default).x;
                args.y = display.camera.map(e.pageX, e.pageY, display, Coordinate.Default).y;

                clickTime = 0;
                for (var i = 0; i < scene.objectList.length; i++)
                {
                    var obj = scene.objectList[i];
                    if (obj.hitTest && obj.onDoubleClick && obj.collider)
                    {
                        var p = new Point(args.x, args.y);
                        if (obj.collider.isCollideWith(p))
                        {
                            obj.onDoubleClick(args)
                            if (args.handled)
                                break;
                        }
                    }
                }
                if (args.handled)
                    return;
                if (scene.onDoubleClick)
                    scene.onDoubleClick(args);
            }
            else
            {
                args.x = e.pageX;
                args.y = e.pageY;
                if (scene.GUI)
                    scene.GUI.clickCallback(args);
                if (args.handled)
                    return;

                args.x = display.camera.map(e.pageX, e.pageY, display, Coordinate.Default).x;
                args.y = display.camera.map(e.pageX, e.pageY, display, Coordinate.Default).y;

                clickTime = t;
                for (var i = 0; i < scene.objectList.length; i++)
                {
                    var obj = scene.objectList[i];
                    if (obj.hitTest && obj.onClick && obj.collider)
                    {
                        var p = new Point(args.x, args.y);
                        if (obj.collider.isCollideWith(p))
                        {
                            obj.onClick(args);
                            if (args.handled)
                                break;
                        }
                    }
                }
                if (args.handled)
                    return;

                if (scene.onClick)
                    scene.onClick(args);
            }
        }
        function keyDownCallback(e)
        {
            if (scene.device.keyboard.keys[e.keyCode] != Keyboard.KeyState.Down)
            {
                scene.device.keyboard.keys[e.keyCode] = Keyboard.KeyState.Down;
                var args = new KeyEventArgs();
                args.key = e.keyCode;
                args.keyName = Keyboard.Keys.toString(args.key);
                args.keyState = Keyboard.KeyState.Down;
                args.ctrl = e.ctrlKey;
                args.alt = e.altKey;
                args.shift = e.shiftKey;
                args.handled = false;
                if (scene.onKeyDown)
                    scene.onKeyDown(args);
            }
        }
        function KeyUpCallback(e)
        {
            if (scene.device.keyboard.keys[e.keyCode] == Keyboard.KeyState.Down)
            {
                scene.device.keyboard.keys[e.keyCode] = Keyboard.KeyState.Up;
                var args = new KeyEventArgs();
                args.key = e.keyCode;
                args.keyName = Keyboard.Keys.toString(args.key);
                args.keyState = Keyboard.KeyState.Up;
                args.ctrl = e.ctrlKey;
                args.alt = e.altKey;
                args.shift = e.shiftKey;
                args.handled = false;
                if (scene.onKeyUp)
                    scene.onKeyUp(args);
            }
        }
        function keyPressCallback(e)
        {
            var args = new KeyEventArgs();
            args.key = e.keyCode;
            args.keyName = Keyboard.Keys.toString(args.key);
            args.keyState = Keyboard.KeyState.Pressed;
            args.ctrl = e.ctrlKey;
            args.alt = e.altKey;
            args.shift = e.shiftKey;
            args.handled = false;
            if (scene.onKeyPress)
                scene.onKeyPress(args);
        }
        function touchStartCallback(e)
        {
            for (var i = 0; i < e.changedTouches.length ; i++)
            {
                var t = new Touch(e.changedTouches[i].identifier);
                t.x = display.camera.map(e.changedTouches[i].pageX, e.changedTouches[i].pageY).x;
                t.y = display.camera.map(e.changedTouches[i].pageX, e.changedTouches[i].pageY).y;
                t.type = Touch.Types.Start;
                scene.device.touches.add(t);

                var argsGUI = new Touch.TouchEventArgs();
                argsGUI.type = Touch.Types.Start;
                argsGUI.id = e.changedTouches[i].identifier;
                argsGUI.x = e.changedTouches[i].pageX;
                argsGUI.y = e.changedTouches[i].pageY;

                var args = argsGUI.copy();
                args.x = display.camera.map(e.changedTouches[i].pageX, e.changedTouches[i].pageY).x;
                args.y = display.camera.map(e.changedTouches[i].pageX, e.changedTouches[i].pageY).y;

                if (scene.GUI)
                    scene.GUI.touchStartCallback(argsGUI);
                if (argsGUI.handled)
                    continue;
                if (scene.onTouchStart)
                    scene.onTouchStart(args);
            }
        }
        function touchMoveCallback(e)
        {
            for (var i = 0; i < e.changedTouches.length ; i++)
            {
                var mapTo = display.camera.map(e.pageX, e.pageY, display, Coordinate.Default);
                var id = e.changedTouches[i].identifier;
                var t = scene.device.touches.id(id);
                t.dx = mapTo.x - scene.device.mouse.x;
                t.dy = mapTo.y - scene.device.mouse.y;
                t.x = mapTo.x;
                t.y = mapTo.y;
                t.type = Touch.Types.Move;

                var argsGUI = new Touch.TouchEventArgs();
                argsGUI.type = Touch.Types.Move;
                argsGUI.touches = scene.device.touches;
                argsGUI.id = e.changedTouches[i].identifier;
                argsGUI.x = e.changedTouches[i].pageX;
                argsGUI.y = e.changedTouches[i].pageY;

                var args = argsGUI.copy();
                args.type = Touch.Types.Move;
                args.x = display.camera.map(e.changedTouches[i].pageX, e.changedTouches[i].pageY).x;
                args.y = display.camera.map(e.changedTouches[i].pageX, e.changedTouches[i].pageY).y;

                if (scene.GUI)
                    scene.GUI.touchMoveCallback(argsGUI);
                if (argsGUI.handled)
                    continue;

                if (scene.onTouchMove)
                    scene.onTouchMove(args);
            }
        }
        function touchEndCallback(e)
        {
            for (var i = 0; i < e.changedTouches.length ; i++)
            {
                var id = e.changedTouches[i].identifier;
                scene.device.touches.removeId(id);

                var argsGUI = new Touch.TouchEventArgs();
                argsGUI.type = Touch.Types.End;
                argsGUI.id = e.changedTouches[i].identifier;
                argsGUI.touches = touchListGUI.toArray();
                argsGUI.x = e.changedTouches[i].pageX;
                argsGUI.y = e.changedTouches[i].pageY;

                var args = argsGUI.copy();
                args.type = Touch.Types.End;
                args.touches = touchList.toArray();
                args.x = display.camera.map(e.changedTouches[i].pageX, e.changedTouches[i].pageY).x;
                args.y = display.camera.map(e.changedTouches[i].pageX, e.changedTouches[i].pageY).y;

                if (scene.GUI)
                    scene.GUI.touchEndCallback(argsGUI);
                if (args.handled)
                    continue;
                if (scene.onTouchEnd)
                    scene.onTouchEnd(args);
            }
        }

        /*
        dom.addEventListener("mouseenter", mouseEnterCallback);
        dom.addEventListener("mouseout", mouseOutCallback);
        dom.addEventListener("mousemove",mouseMoveCallback);
        dom.addEventListener("mouseover", mouseOverCallback);
        dom.addEventListener("mouseout", mouseOutCallback);
        dom.addEventListener("mousedown", mouseDownCallback);
        dom.addEventListener("mouseup", mouseUpCallback);
        dom.addEventListener("mousewheel", mouseWheelCallback);
        dom.addEventListener("click", clickCallback);
        window.addEventListener("keydown", keyDownCallback);
        window.addEventListener("keyup", KeyUpCallback);
        window.addEventListener("keypress", keyPressCallback);
        dom.addEventListener("touchstart", touchStartCallback);
        dom.addEventListener("touchmove", touchMoveCallback);
        dom.addEventListener("touchend", touchEndCallback);
        */
    }
    /**
     * Add a GameObject to this scene. 
     * @param {GameObject} obj - The GameObject to add.
     * @param {Layer | Background | Number} [layer] - The instance of a Layer, Background or a number of the layer.
     * @param {CollideGroup} [collideGroup] - Add this game object to the specific collide group.
     */
    Scene.prototype.addGameObject = function (obj, layer, collideGroup)
    {
        if (obj.id >= 0)
        {
            throw new Error("Object existed.");
        }

        this.objectList.add(obj);
        obj.id = this._objList.add(obj);

        if (layer instanceof Layer)
        {
            if (!layer.scene)
                this.layers.add(layer, this.layers.topDepth + 1);
            layer.addGameObject(obj);
        }
        else if (layer instanceof Background)
        {
            if (!layer.scene)
                this.background.add(layer);
            layer.addGameObject(obj);
        }
        else
        {
            if (isNaN(layer))
                layer = 0;
            if (!this.layers[layer])
                throw new Error("Invalid layer.");
            this.layers[layer].addGameObject(obj);
        }

        if (collideGroup)
        {
            if (!this.collideGroups.contain(collideGroup))
                this.addCollideGroup(collideGroup);
            collideGroup.addGameObject(obj);
        }
        else
        {
            this.collideGroups.defaultGroup.addGameObject(obj);
        }
        this.collideTable.rows = this._objList.length;
        this.collideTable.columns = this._objList.length;
        obj.scene = this;
        return obj.id;
    }
    Scene.prototype.removeGameObject = function (id)
    {
        if (id instanceof GameObject)
        {
            for (var i = 0; i < this._objList.length; i++)
            {
                if(this._objList[i]==id)
                {
                    id = i;
                    break;
                }
            }
            //not Found.
            if (id instanceof GameObject)
            {
                throw new Error("Object not in scene.");
            }
        }
        if (id == null || id < 0 || isNaN(id))
            throw new Error("Invalid id.");
        var obj = this._objList[id];
        if (!obj)
            throw new Error("Object not existed.");
        obj.layer.removeGameObject(obj);
        this.objectList.remove(obj);
        for (var i = 0; i < obj.collideGroups.length; i++)
        {
            obj.collideGroups[i].removeGameObject(obj);
        }
        this._objList[id] = null;
        obj.id = -1;
        obj.scene = null;
        /*this.collideTable.rows = this.objectList.length;
        this.collideTable.columns = this.objectList.length;*/
    }
    Scene.prototype.addLayer = function (layer, depth)
    {
        this.layers.add(layer, depth);
    }
    Scene.prototype.removeLayer = function (depth)
    {
        return this.layers.removeAt(depth);

        for (var i = 0; i < this.cameraList.length; i++)
        {
            var camera = this.cameraList[i];
            for (var j = 0; j < camera.displayList.length ; j++)
            {
                camera.displayList[j].setLayer(this.layers.count);
            }
        }
    }
    Scene.prototype.addBackground = function (bg, zIndex)
    {
        return this.background.add(bg, zIndex);
    }
    Scene.prototype.removeBackground = function (bg)
    {
        return this.background.remove(bg);
    }
    Scene.prototype.addCamera = function (camera)
    {
        if(camera.scene)
        {
            throw new Error("This camera is in another scene.");
        }
        camera.scene = this;
        this.cameraList.add(camera);
        for (var i = 0; i < camera.displayList.length ; i++)
        {
            camera.displayList[i].setLayer(this.layers.count);
        }
    }
    Scene.prototype.removeCamera = function (camera)
    {
        var index = this.cameraList.indexOf(camera);
        if (index < 0)
        {
            throw new Error("Not found.");
        }
        this.cameraList.removeAt(index);
        camera.scene = null;
    }
    Scene.prototype.addCollideGroup = function (group)
    {
        this.collideGroups.add(group);
    }
    Engine.Scene = Scene;
    window.Scene = Scene;

    /// <summary>Cordinate System</summary>
    /// <param name="pTo" type="Function">A function(x,y) that map a point from default cordinate system to this cordinate system.</param>
    /// <param name="pFrom" type="Function">A function(x,y) that map a point from this cordinate system to default cordinate system.</param>
    /// <param name="vTo" type="Function">A function(x,y) that map a vector from default cordinate system to this cordinate system.</param>
    /// <param name="vFrom" type="Function">A function(x,y) that map a vector from this cordinate system to default cordinate system.</param>
    function Coordinate(pTo, pFrom, vTo, vFrom)
    {
        this.pTo = pTo;
        this.pFrom = pFrom;
        this.vTo = vTo;
        this.vFrom = vFrom;
        this.axis = null;
        this.const = false;
    }
    Coordinate.Axis = function ()
    {
        this.visible = false;
        this.graphic = null;
    }
    Coordinate.Axis.createCartesian = function (coordinate ,xLen, yLen, xColor, yColor)
    {
        var axis = new Coordinate.Axis();
        var lineX = new Line(new Point(-xLen, 0), new Point(xLen, 0));
        lineX.strokeStyle = xColor;
        lineX.strokeWidth = 1; var lineY = new Line(new Point(0, -yLen), new Point(0, yLen));
        lineY.strokeStyle = yColor;
        lineY.strokeWidth = 1;
        axis.x = lineX;
        axis.y = lineY;
        axis.graphic = new Combination();
        axis.graphic.addObject(lineX);
        axis.graphic.addObject(lineY);
        axis.graphic.setCoordinate(coordinate);
        return axis;
    }
    Coordinate.Axis.prototype.render = function (graphics, dt)
    {
        if (this.graphic)
            this.graphic.render(graphics, dt);
    }
    Coordinate.Default = (function ()
    {
        var coordinate = new Coordinate(
            function (x, y)
            {
                return { x: x, y: y };
            },
            function (x, y)
            {
                return { x: x, y: y };
            },
            function (x, y)
            {
                return { x: x, y: y };
            },
            function (x, y)
            {
                return { x: x, y: y };
            });
        coordinate.copy = function ()
        {
            var cdn = Coordinate.createCartesian(0, 0, 1, 1, 0);
            if (coordinate.axis.graphic)
                cdn.axis.graphic = coordinate.axis.graphic.copy();
            return cdn;
        }
        var axis = new Coordinate.Axis();
        var axisVisible = false;
        Object.defineProperty(axis, "visible", {
            get: function ()
            {
                return axisVisible;
            },
            set: function (value)
            {
                if (!axisVisible)
                {
                    var lineX = new Line(new Point(-1024, 0), new Point(1024, 0));
                    lineX.strokeStyle = new Color(255, 0, 0, 1);
                    lineX.strokeWidth = 1;
                    var lineY = new Line(new Point(0, -1024), new Point(0, 1024));
                    lineY.strokeStyle = new Color(0, 255, 0, 1);
                    lineY.strokeWidth = 1;
                    axis.graphic = new Combination();
                    axis.graphic.addObject(lineX);
                    axis.graphic.addObject(lineY);
                }
                axisVisible = value;
            }
        })
        coordinate.axis = axis;
        return coordinate;
    })();
    Coordinate.createCartesian = function (x, y, unitX, unitY, rotation)
    {
        var originX = x;
        var originY = y;
        var rotation = rotation;
        function pointTo(x, y)
        {
            if (rotation == 0)
            {
                return {
                    x: (x - originX) / unitX,
                    y: (y - originY) / unitY
                };
            }
            else
            {
                var cos = Math.cos(-rotation);
                var sin = Math.sin(-rotation);
                var dx = x - originX;
                var dy = y - originY;
                return {
                    x: (dx * cos - dy * sin) / unitX,
                    y: (dy * cos + dx * sin) / unitY
                };
            }
        }
        function pointFrom(x, y)
        {
            if (rotation == 0)
            {
                return {
                    x: x * unitX + originX,
                    y: y * unitY + originY
                };
            }
            else
            {
                var cos = Math.cos(rotation);
                var sin = Math.sin(rotation);
                var dx = x * unitX;
                var dy = y * unitY;
                return {
                    x: dx * cos - dy * sin + originX,
                    y: dy * cos + dx * sin + originY
                };
            }
        }
        function vectorTo(x, y)
        {
            if (rotation == 0)
            {
                return {
                    x: x / unitX,
                    y: y / unitY
                };
            }
            else
            {
                var cos = Math.cos(-rotation);
                var sin = Math.sin(-rotation);
                return {
                    x: (x * cos - y * sin) / unitX,
                    y: (y * cos + x * sin) / unitY
                };
            }
        }
        function vectorFrom(x, y)
        {
            if (rotation == 0)
            {
                return {
                    x: x * unitX,
                    y: y * unitY
                };
            }
            else
            {
                var cos = Math.cos(rotation);
                var sin = Math.sin(rotation);
                var dx = x * unitX;
                var dy = y * unitY;
                return {
                    x: dx * cos - dy * sin,
                    y: dy * cos + dx * sin
                };
            }
        }

        var coordinate = new Coordinate(pointTo, pointFrom, vectorTo, vectorFrom);
        Object.defineProperty(coordinate, "originX", {
            get: function ()
            {
                return originX;
            },
            set: function (value)
            {
                originX = value;
            }
        });
        Object.defineProperty(coordinate, "originY", {
            get: function ()
            {
                return originY;
            },
            set: function (value)
            {
                originY = value;
            }
        });
        Object.defineProperty(coordinate, "unitX", {
            get: function ()
            {
                return unitX;
            },
            set: function (value)
            {
                unitX = value;
            }
        });
        Object.defineProperty(coordinate, "unitY", {
            get: function ()
            {
                return unitY;
            },
            set: function (value)
            {
                unitY = value;
            }
        });
        Object.defineProperty(coordinate, "rotation", {
            get: function ()
            {
                return rotation;
            },
            set: function (value)
            {
                rotation = value;
            }
        });
        coordinate.copy = function ()
        {
            var cdn = Coordinate.createCartesian(originX, originY, unitX, unitY, rotation);
            if (coordinate.axis.graphic)
                cdn.axis.graphic = coordinate.axis.graphic.copy();
            return cdn;
        }
        var axis = new Coordinate.Axis();
        coordinate.axis = axis;
        var lineX = new Line(new Point(-1024, 0), new Point(1024, 0));
        lineX.strokeStyle = new Color(255, 0, 0, 1);
        lineX.strokeWidth = 1; var lineY = new Line(new Point(0, -1024), new Point(0, 1024));
        lineY.strokeStyle = new Color(0, 255, 0, 1);
        lineY.strokeWidth = 1;
        axis.graphic = new Combination();
        axis.graphic.addObject(lineX);
        axis.graphic.addObject(lineY);
        axis.graphic.setCoordinate(coordinate);
        return coordinate;
    }
    Coordinate.createPolar = function (x, y, unit, rotation)
    {
        var originX = x;
        var originY = y;
        var unit = unit;
        var rotation = rotation;
        function pointTo(x, y)
        {
            var l = Math.sqrt((x - originX) * (x - originX) + (y - originY) * (y - originY));
            var ang = Math.acos((x - originX) / l) - rotation;
            return {
                x: l / unit,
                y: ang
            };
        }
        function pointFrom(l, ang)
        {
            return {
                x: l * unit * Math.cos(ang + rotation) + originX,
                y: l * unit * Math.sin(ang + rotation) + originY
            };        }
        function vectorTo(x, y)
        {
            var l = Math.sqrt(x * x + y * y);;
            var ang = Math.acos(x / l) - rotation;
            return {
                x: l / unit,
                y: ang
            };
        }
        function vectorFrom(l, ang)
        {
            return {
                x: l * unit * Math.cos(ang + rotation),
                y: l * unit * Math.sin(ang + rotation)
            };
        }

        var coordinate = new Coordinate(pointTo, pointFrom, vectorTo, vectorFrom);
        coordinate.originX = originX;
        coordinate.originY = originY;
        coordinate.unit = unit;
        coordinate.rotation = rotation;
        var axis = new Coordinate.Axis();
        coordinate.axis = axis;
        return coordinate;
    }
    Coordinate.prototype.pointMapTo = function (coordinate, x, y)
    {
        if (coordinate == this)
            return { x: x, y: y };
        if (coordinate == Coordinate.Default)
            return this.pFrom(x, y);
        if (this == coordinate.Default)
            return coordinate.pFrom(x, y);
        var p = this.pFrom(x, y);
        return coordinate.pTo(p.x, p.y);
    }
    Coordinate.prototype.vectorMapTo = function (coordinate, x, y)
    {
        if (coordinate == this)
            return { x: x, y: y };
        if (coordinate == Coordinate.Default)
            return this.vFrom(x, y);
        if (this == coordinate.Default)
            return coordinate.vFrom(x, y);
        var p = coordinate.vFrom(x, y);
        return this.vTo(x, y);
    }
    Engine.Coordinate = Coordinate;
    window.Coordinate = Coordinate;

    //Layer
    function Layer(coordinate)
    {
        if(!coordinate)
        {
            coordinate = Coordinate.Default;
        }
        this.coordinate = coordinate;
        this.objectList = ArrayList();
        this.followCamera = false;
        this.scene = null;
        EventJs.defineEvent(this, "onRender");
        EventJs.defineEvent(this, "onEndRender");

    }
    Layer.prototype.addGameObject = function (obj, keepCoordinate, index)
    {
        if (!this.scene)
            throw new Error("This layer must belong to a scene before add GameOject.");
        if (!isNaN(index))
        {
            this.objectList.insert(obj, index);
        }
        else
        {
            this.objectList.add(obj);
        }
        obj.layer = this;
        if (!keepCoordinate)
            obj.setCoordinate(this.coordinate);
    }
    Layer.prototype.removeGameObject = function (obj)
    {
        this.objectList.remove(obj);
    }
    Layer.prototype.render = function (graphics, dt)
    {
        var args = {
            graphics: graphics,
            dt: dt,
            cancel: false
        };
        this.onRender.invoke(args);
        if (args.cancel)
            return;
        for (var i = 0; i < this.objectList.length; i++)
        {
            if (this.objectList[i].onRender)
            {
                args = {
                    graphics: graphics,
                    x: this.objectList[i].position.x,
                    y: this.objectList[i].position.y,
                    r: this.objectList[i].rotation,
                    dt: dt,
                    cancel: false
                };
                this.objectList[i].onRender(args);
                if (args.cancel)
                    continue;
            }
            this.objectList[i].render(graphics, this.objectList[i].position.x, this.objectList[i].position.y, this.objectList[i].rotation, dt);
        }
        var args = {
            graphics: graphics,
            dt: dt,
        };
        this.onEndRender.invoke(args);
        if (this.coordinate.axis && this.coordinate.axis.visible)
            this.coordinate.axis.render(graphics, dt);
    }
    Engine.Layer = Layer;
    window.Layer = Layer;

    //Background
    function Background()
    {
        this.followSpeed = 1;
        this.objectList = ArrayList();
        this.scene = null;
        this.coordinate = Coordinate.Default.copy();
    }
    Background.prototype.addGameObject = function (obj, zIndex)
    {
        if (!this.scene)
            throw new Error("The Background is not belong to any Scene.");
        if (!this.objectList.contain(obj))
            this.objectList.add(obj);
        obj.setCoordinate(this.coordinate);
        obj.layer = this;
    }
    Background.prototype.removeGameObject = function (obj)
    {
        var index = this.objectList.indexOf(obj);
        if (index < 0)
            return false;
        this.objectList.removeAt(index);
    }
    Background.prototype.render = function (graphics, dt, camera)
    {
        var dx = 0, dy = 0;
        if (camera)
        {
            dx = camera.viewCoordinate.originX * this.followSpeed;
            dy = camera.viewCoordinate.originY * this.followSpeed;
        }
        this.coordinate.originX = dx;
        this.coordinate.originY = dy;
        for (var i = 0; i < this.objectList.length ; i++)
        {
            this.objectList[i].render(graphics, 0, 0, 0, dt);
        }
    }
    Engine.Background = Background;
    window.Background = Background;

    //Matrix
    function Matrix(m,n)
    {
        var rows = 0;
        var columns = 0;
        this._innerMatrix = [];
        var matrix = this;
        Object.defineProperty(this, "rows", {
            get: function ()
            {
                return rows;
            },
            set: function (value)
            {
                if (value < rows)
                {
                    for (var i = value; i < rows; i++)
                    {
                        delete matrix[i];
                    }
                    matrix._innerMatrix.length = value;
                    rows = value;
                    return;
                }
                while (rows < value)
                {
                    matrix._innerMatrix[rows] = [];
                    for (var i = 0; i < columns; i++)
                    {
                        matrix._innerMatrix[rows][i] = 0;
                    }
                    (function (index)
                    {
                        Object.defineProperty(matrix, index, {
                            configurable: true,
                            get: function ()
                            {
                                return matrix._innerMatrix[index];
                            }
                        });
                    })(rows);
                    rows++;
                }
            }
        });
        Object.defineProperty(this, "columns", {
            get: function ()
            {
                return columns;
            },
            set: function (value)
            {
                if (value < columns)
                {
                    for (var i = 0; i < rows; i++)
                    {
                        matrix._innerMatrix[i].length = value;
                    }
                    columns = value;
                }
                else if (columns < value)
                {
                    for (var i = 0; i < rows; i++)
                    {
                        for (var j = columns; j < value; j++)
                        {
                            matrix._innerMatrix[i][j] = 0;
                        }
                    }
                    columns = value;
                }
            }
        });
        if (m instanceof Array)
        {
            rows = m.length;
            for (var i = 0; i < rows; i++)
            {
                if (!(m[i] instanceof Array))
                {
                    throw new Error("Invalid Matrix.");
                }
                matrix._innerMatrix[i] = [];
                //Get columns number
                if (i == 0)
                    columns = m[i].length;
                else if (columns != m[i].length)
                {
                    throw new Error("Columns not same.");
                }

                for (var j = 0; j < columns ; j++)
                {
                    matrix._innerMatrix[i][j] = m[i][j];
                }

                (function (index)
                {
                    Object.defineProperty(matrix, index.toString(), {
                        configurable: true,
                        get: function ()
                        {
                            return matrix._innerMatrix[index];
                        }
                    });
                })(i);
            }
        }
        else if ((!isNaN(m)) && (!isNaN(n)))
        {
            rows = m;
            columns = n;
            for (var i = 0; i < m; i++)
            {
                matrix._innerMatrix[i] = [];
                for (var j = 0; j < n; j++)
                {
                    matrix._innerMatrix[i][j] = 0;
                }
                (function (index)
                {
                    Object.defineProperty(matrix, index.toString(), {
                        configurable: true,
                        get: function ()
                        {
                            return matrix._innerMatrix[index];
                        }
                    });
                })(i);
            }
        }
    }
    Matrix.plus = function (a, b)
    {
        if (!(a instanceof Matrix) || !(b instanceof Matrix))
        {
            throw new Error("Not Matrix.");
        }
        if (a.columns != b.columns || a.rows != b.rows)
        {
            throw new Error("Two Matrix must have same columns and rows.");
        }
        var matrix = new Matrix(a.rows, a.columns);
        for (var i = 0; i < a.rows; i++)
        {
            for (var j = 0; j < a.columns ; j++)
            {
                matrix._innerMatrix[i][j] = a._innerMatrix[i][j] + b._innerMatrix[i][j];
            }
        }
        return matrix;
    }
    Matrix.minus = function (a, b)
    {
        if (!(a instanceof Matrix) || !(b instanceof Matrix))
        {
            throw new Error("Not Matrix.");
        }
        if (a.columns != b.columns || a.rows != b.rows)
        {
            throw new Error("Two Matrix must have same columns and rows.");
        }
        var matrix = new Matrix(a.rows, a.columns);
        for (var i = 0; i < a.rows; i++)
        {
            for (var j = 0; j < a.columns ; j++)
            {
                matrix._innerMatrix[i][j] = a._innerMatrix[i][j] - b._innerMatrix[i][j];
            }
        }
        return matrix;
    }
    Matrix.multi = function (a, b)
    {
        if ((a instanceof Matrix) && (b))
        {
            var matrix = new Matrix(a.rows, a.columns);
            for (var i = 0; i < a.rows; i++)
            {
                for (var j = 0; j < a.columns ; j++)
                {
                    matrix._innerMatrix[i][j] = a._innerMatrix[i][j] * b;
                }
            }
            return matrix;
        }
        else if ((a instanceof Matrix) && (b instanceof Matrix))
        {
            if (a.columns != b.rows)
            {
                throw new Error("The number of columns of the left matrix must be the same as the number of rows of the right matrix.")
            }
            var matrix = new Matrix(a.rows, b.columns);
            for (var i = 0; i < a.rows; i++)
            {
                for (var j = 0; j < b.columns; j++)
                {
                    for (var k = 0; k < a.columns; k++)
                    {
                        matrix._innerMatrix[i][j] += a._innerMatrix[i][k] * b._innerMatrix[k][j];
                    }
                }
            }
            return matrix;
        }
        throw new Error("Can only multiply Matrix with Matrix or Matrix with Number.");
    }
    Matrix.scale = function (a, b)
    {
        if (!((a instanceof Matrix) && !isNaN(b)))
        {
            throw new Error("The left must be Matrix and right mustv be Number.");
        }
        var matrix = new Matrix(a.rows, a.columns);
        for (var i = 0; i < a.rows; i++)
        {
            for (var j = 0; j < a.columns ; j++)
            {
                matrix._innerMatrix[i][j] = a._innerMatrix[i][j] * b;
            }
        }
        return matrix;
    }
    Matrix.transpose = function (matrix)
    {
        if (!(matrix instanceof Matrix))
        {
            
        }
        var newMatrix = new Matrix(matrix.columns, matrix.rows);
        for (var i = 0; i < newMatrix.rows ; i++)
        {
            for (var j = 0; j < newMatrix.columns; j++)
            {
                newMatrix._innerMatrix[i][j] = matrix._innerMatrix[j][i];
            }
        }
        return newMatrix;
    }
    Matrix.prototype.plus = function (matrix)
    {
        if (!(matrix instanceof Matrix))
        {
            throw new Error("Not Matrix.");
        }
        if (matrix.columns != this.columns || matrix.rows != this.rows)
        {
            throw new Error("The Matrix must has same columns and rows.");
        }
        for (var i = 0; i < this.rows; i++)
        {
            for (var j = 0; j < this.columns ; j++)
            {
                this._innerMatrix[i][j] += matrix._innerMatrix[i][j];
            }
        }
    }
    Matrix.prototype.minus = function (matrix)
    {
        if (!(matrix instanceof Matrix))
        {
            throw new Error("Not Matrix.");
        }
        if (matrix.columns != this.columns || matrix.rows != this.rows)
        {
            throw new Error("The Matrix must has same columns and rows.");
        }
        for (var i = 0; i < this.rows; i++)
        {
            for (var j = 0; j < this.columns ; j++)
            {
                this._innerMatrix[i][j] -= matrix._innerMatrix[i][j];
            }
        }
    }
    Matrix.prototype.multi = function (x)
    {
        if (isNaN(x))
        {
            throw new Error("x must be number. Or use Matrix.multi(a,b) to multiply two Matrix.");
        }
        for (var i = 0; i < this.rows; i++)
        {
            for (var j = 0; j < this.columns ; j++)
            {
                this._innerMatrix[i][j] *= x;
            }
        }
    }
    Matrix.prototype.scale = Matrix.prototype.multi;
    Matrix.prototype.transpose = function ()
    {
        var innerMatrix = this._innerMatrix;
        var rows = this.rows;
        var columns = this.columns;
        this._innerMatrix = [];
        for (var i = 0; i < columns; i++)
        {
            this._innerMatrix[i] = [];
            for (var j = 0; j < rows; j++)
            {
                this._innerMatrix[i][j] = innerMatrix[j][i];
            }
        }
        this.columns = rows;
        this.rows = columns;
    }
    Engine.Matrix = Matrix;
    window.Matrix = Matrix;

    //Display
    function Display(node, w, h)
    {
        if (!(node instanceof Node))
        {
            throw new Error("Cannot create a display by this object.");
        }

        this.type = Display.DisplayTypes.None;
        this.getLayer = function (z) { };
        this.setLayer = function (count) { };
        this.camera = null;
        this.layers = ArrayList();
        this.audioTracks = ArrayList();
        this.displayDOM = null;
        this.viewArea = null;
        this.GUI = null;
        this.viewCoordinate = Coordinate.Default;

        var input = new Input(node);
        input.display = this;
        Object.defineProperty(this, "input", {
            get: function () { return input; }
        });

        var displayDom = null;
        var graphics = null;
        var width = 0;
        var height = 0;
        var renderWidth = 0;
        var renderHeight = 0;
        var seperateSize = false;

        if (node.nodeName == "CANVAS")
        {
            displayDom = node;
            this.displayDOM = node;
            this.type = Display.DisplayTypes.Single;
            graphics = new Graphics(node);
            this.layers[0] = graphics;
            this.getLayer = function (z)
            {
                return graphics;
            }

            if (!isNaN(w) && !isNaN(h))
            {
                width = w;
                height = h;
                renderWidth = w;
                renderHeight = h;
                applySize();
                applyRenderSize();
            }

            Object.defineProperty(this, "width", {
                get: function ()
                {
                    return width;
                },
                set: function (value)
                {
                    width = value;
                    if (!seperateSize)
                    {
                        renderWidth = value;
                        applyRenderSize();
                    }
                    applySize();
                }
            });
            Object.defineProperty(this, "height", {
                get: function ()
                {
                    return height;
                },
                set: function (value)
                {
                    height = value;
                    if (!seperateSize)
                    {
                        renderHeight = value;
                        applyRenderSize();
                    }
                    applySize();
                }
            });
            Object.defineProperty(this, "renderWidth", {
                get: function ()
                {
                    renderWidth = node.width;
                    return node.width;
                },
                set: function (value)
                {
                    renderWidth = value;
                    seperateSize = true;
                    applyRenderSize();
                }
            });
            Object.defineProperty(this, "renderHeight", {
                get: function ()
                {
                    renderHeight = node.height;
                    return node.height;
                },
                set: function (value)
                {
                    renderHeight = value;
                    seperateSize = true;
                    applyRenderSize();
                }
            });

            function applySize()
            {
                node.style.width = width + "px";
                node.style.height = height + "px";
            }
            function applyRenderSize()
            {
                node.width = renderWidth;
                node.height = renderHeight;
                
            }
        }
        else
        {
            node.innerHTML = "";
            displayDom = node;
            this.displayDOM = node;
            if (getComputedStyle(displayDom).position == "static")
            {
                displayDom.style.position = "relative";
            }
            this.type = Display.DisplayTypes.MultiLayer;
            graphics = ArrayList();
            this.layers = graphics;
            this.getLayer = function (z)
            {
                if (graphics.length <= 0)
                    return null;
                if (z >= graphics.length)
                    z = graphics.length - 1;
                if (z < 0)
                    z = 0;
                return graphics[z];
            }
            this.setLayer = function (count)
            {
                var d = count - graphics.length;
                if (d < 0)
                {
                    for (; d < 0; d++)
                    {
                        var node = graphics[i].canvas;
                        node.remove();
                        graphics.removeAt(graphics.length - 1);
                    }
                }
                else if (d > 0)
                {
                    for (; d > 0; d--)
                    {
                        var canvas = document.createElement("canvas");
                        canvas.width = renderWidth;
                        canvas.height = renderHeight;
                        canvas.style.width = width + "px";
                        canvas.style.height = height + "px";
                        canvas.style.position = "absolute";
                        canvas.style.left = "0px";
                        canvas.style.top = "0px";
                        canvas.style.backgroundColor = "transparent";
                        displayDom.appendChild(canvas);
                        var i = graphics.add(new Graphics(canvas));
                        canvas.style.zIndex = i;
                    }
                }
            }

            if (!isNaN(w) && !isNaN(h))
            {
                width = w;
                height = h;
                renderWidth = w;
                renderHeight = h;
                applySize();
                applyRenderSize();
            }

            Object.defineProperty(this, "width", {
                get: function ()
                {
                    return width;
                },
                set: function (value)
                {
                    width = value;
                    if (!seperateSize)
                    {
                        renderWidth = value;
                        applyRenderSize();
                    }
                    applySize();
                }
            });
            Object.defineProperty(this, "height", {
                get: function ()
                {
                    return height;
                },
                set: function (value)
                {
                    height = value;
                    if (!seperateSize)
                    {
                        renderHeight = value;
                        applyRenderSize();
                    }
                    applySize();
                }
            });
            Object.defineProperty(this, "renderWidth", {
                get: function ()
                {
                    return renderWidth;
                },
                set: function (value)
                {
                    renderWidth = value;
                    seperateSize = true;
                    applyRenderSize();
                }
            });
            Object.defineProperty(this, "renderHeight", {
                get: function ()
                {
                    return renderHeight;
                },
                set: function (value)
                {
                    renderHeight = value;
                    seperateSize = true;
                    applyRenderSize();
                }
            });
            function applySize()
            {
                node.style.width = width + "px";
                node.style.height = height + "px";
                for (var i = 0; i < graphics.length; i++)
                {
                    graphics[i].canvas.style.width = width + "px";
                    graphics[i].canvas.style.height = height + "px";
                }
            }
            function applyRenderSize()
            {
                for (var i = 0; i < graphics.length; i++)
                {
                    graphics[i].canvas.width = renderWidth;
                    graphics[i].canvas.height = renderHeight;
                }
            }
        }
        this._sizeChangeCallback = null;
        this._renderSizeChangeCallback = null;
    }
    Display.DisplayTypes = { None: 0, Single: 1, MultiLayer: 2 };
    Display.prototype.outScreen = function (obj)
    {
        if (!this.viewArea)
            throw new Error("Are you kidding me?");
        if (obj instanceof GameObject)
        {
            if (obj.graphic)
                obj = obj.graphic;
            else
            {
                var p = new Point(obj.position.x, obj.position.y);
                p.setCoordinate(obj.position.coordinate);
                obj = p;
            }
        }
        if (obj instanceof Particle)
        {
            obj = new Point(obj.center.x, obj.center.y);
        }
        if (obj instanceof Engine.Image)
        {
            var rect = new Rectangle(obj.width, obj.height);
            rect.center = obj.center.copy();
            rect.position = obj.position.copy();
            rect.o = obj.o.copy();
            obj = rect;

        }
        if (obj instanceof Point)
        {
            var p = obj.coordinate.pointMapTo(this.viewArea.coordinate, obj.x, obj.y);
            return !this.viewArea.isCollideWith(new Point(p.x, p.y));
        }
        else if (obj instanceof Polygon)
        {
            for (var i = 0; i < obj.V.length; i++)
            {
                var p = obj.coordinate.pointMapTo(this.viewArea.coordinate, obj.V[i].x, obj.V[i].y);
                if (this.viewArea.isCollideWith(new Point(p.x, p.y)))
                    return false;
            }
            return true;
        }
        else if (obj instanceof Rectangle)
        {
            var o = obj.coordinate.pointMapTo(Coordinate.Default, obj.center.x, obj.center.y);
            var p = obj.coordinate.pointMapTo(this.viewArea.coordinate, o.x - (obj.width / 2), o.y + (obj.height / 2));
            if (this.viewArea.isCollideWith(new Point(p.x, p.y)))
                return false;
            p = obj.coordinate.pointMapTo(this.viewArea.coordinate, o.x + (obj.width / 2), o.y + (obj.height / 2));
            if (this.viewArea.isCollideWith(new Point(p.x, p.y)))
                return false;
            p = obj.coordinate.pointMapTo(this.viewArea.coordinate, o.x + (obj.width / 2), o.y - (obj.height / 2));
            if (this.viewArea.isCollideWith(new Point(p.x, p.y)))
                return false;
            p = obj.coordinate.pointMapTo(this.viewArea.coordinate, o.x - (obj.width / 2), o.y - (obj.height / 2));
            if (this.viewArea.isCollideWith(new Point(p.x, p.y)))
                return false;
            return true;
        }
        else if (obj instanceof Circle)
        {
            var o = obj.coordinate.pointMapTo(this.viewArea.coordinate, obj.o.x, obj.o.y);
            if (o.x + obj.r < this.viewArea.center.x - (this.viewArea.width / 2) || this.viewArea.center.x + (this.viewArea.width / 2) < o.x - obj.r)
            {
                return true;
            }
            if (o.y + obj.r < this.viewArea.center.y - (this.viewArea.height / 2) || this.viewArea.center.y + (this.viewArea.height / 2) < o.y - obj.r)
            {
                return true;
            }
        }
    }
    Display.prototype.connectTo = function (camera)
    {
        if (this.camera)
            this.camera.removeDisplay(this);
        camera.addDisplay(this);

    }
    Display.prototype.getInput = function ()
    {
        return this.input;
    }
    Display.prototype.setCoordinate = function (coordinate)
    {
        if (this.viewCoordinate.const)
        {
            Engine.onGlobalError.invoke({ sender: this, message: "Cannot set the constant coordinate." });
            return;
        }
        this.viewCoordinate = coordinate;
    }
    Display.prototype.addAudioTrack = function (audioTrack)
    {
        if (!this.audioTracks.contain(audioTrack))
        {
            var index = this.audioTracks.add(audioTrack);
            audioTrack.display = this;
            return index;
        }
    }
    Display.prototype.removeAudioTrack = function (audioTrack)
    {
        var index = this.audioTracks.indexOf(audioTrack);
        if (index < 0)
            return -1;
        this.audioTracks.removeAt(index);
        audioTrack.display = null;
    }
    Display.prototype.playAudio = function (audio)
    {
        if (!(audio instanceof Engine.Audio) || !(audio instanceof window.Audio))
        {
            throw new Error("Audio required.");
        }
        audio.play();
    }
    Display.prototype.playNewAudio = function (audio)
    {
        if (audio instanceof window.Audio)
        {
            audio = new Engine.Audio(audio);
        }
        if(audio instanceof Engine.Audio )
        {
            var track = new AudioTrack(audio);
            this.addAudioTrack(track);
            var display = this;
            track.onEnd = function ()
            {
                display.removeAudioTrack(track);
            }
            track.play();
            
        }
        else
        {
            throw new Error("Audio required.");
        }
    }
    Engine.Display = Display;
    window.Display = Display;
        
    function Input(element)
    {
        if (!element || !(element instanceof window.Element))
        {
            throw new Error("A HTML Element is required.");
        }
        this.element = element;
        //this.element = document.createElement("div");

        this.clickRange = 30;
        this.doubleClickDuration = 400;
        this._lastClickTime = null;
        this._lastHoldPosition = null;

        var input = this;

        this.ignorePadding = true;
        this.scene=null;
        this.display = null;

        var coordinate = null;
        Object.defineProperty(this, "coordinate", {
            get: function ()
            {
                if (input.display)
                    return input.display.viewCoordinate;
                return null;
            }

        });

        var mouseCapture = true;
        Object.defineProperty(this, "mouseCapture", {
            get: function ()
            {
                return mouseCapture;
            },
            set: function (value)
            {
                mouseCapture = value;
            }
        });

        var keyCapture = true;
        Object.defineProperty(this, "keyCapture", {
            get: function () { return keyCapture; },
            set: function (value)
            {
                keyCapture = value;
            }
        });

        var touchCapture = true;
        Object.defineProperty(this, "touchCapture", {
            get: function () { return touchCapture; },
            set: function (value)
            {
                touchCapture = value;
            }
        });

        EventJs.defineEvent(this, "onMouseEnter");
        EventJs.defineEvent(this, "onMouseLeave");
        EventJs.defineEvent(this, "onMouseMove");
        EventJs.defineEvent(this, "onMouseDown");
        EventJs.defineEvent(this, "onMouseUp");
        EventJs.defineEvent(this, "onClick");
        EventJs.defineEvent(this, "onDoubleClick");
        EventJs.defineEvent(this, "onWheel");

        EventJs.defineEvent(this, "onKeyDown");
        EventJs.defineEvent(this, "onKeyUp");
        EventJs.defineEvent(this, "onKeyPress");

        this.onTouchStart = null;
        this.onTouchEnd = null;
        this.onTouchMove = null;

        this.initMouseEvent();
        this.initKeyEvent();


    }
    Input.prototype.initMouseEvent = function ()
    {
        var input = this;
        var lastPos = new Point(0, 0);
        var lastTime = new Date().getTime();
        function mouseEnterCallback(e)
        {
            var args = new Args(e);
            if (input.onMouseEnter)
            {
                var argsInput = args.copy();
                input.onMouseEnter.invoke(argsInput);
                if (argsInput.handled)
                    return;
            }
            if (input.display && input.display.GUI) {
                var argsGUI = args.copy();
                input.display.GUI.mouseEnterCallback(argsGUI);
                if (argsGUI.handled)
                    return;
            }
        }
        function mouseLeaveCallback(e)
        {
            var args = new Args(e);
            if (input.onMouseLeave) {
                var argsInput = args.copy();
                input.onMouseLeave.invoke(argsInput);
                if (argsInput.handled)
                    return;
            }
            if (input.display && input.display.GUI && input.display.GUI.mouseLeaveCallback) {
                var argsGUI = args.copy();
                input.display.GUI.mouseLeaveCallback(argsGUI);
                if (argsGUI.handled)
                    return;
            }
        }
        function mouseMoveCallback(e)
        {
            var args = new Args(e);
            if (input.onMouseMove) {
                var argsInput = args.copy();
                input.onMouseMove.invoke(argsInput);
                if (argsInput.handled)
                    return;
            }
            if (input.display && input.display.GUI) {
                var argsGUI = args.copy();
                input.display.GUI.mouseMoveCallback(argsGUI);
                if (argsGUI.handled)
                    return;
            }
            if (input.scene && input.coordinate) {
                var argsScene = args.copy();
                input.scene.mouseMoveCallback(argsScene);
                
            }
        }
        function mouseDownCallback(e)
        {
            var args = new Args(e);
            input._lastHoldPosition = new Vector2(args.x, args.y);
            if (input.onMouseDown) {
                var argsInput = args.copy();
                input.onMouseDown.invoke(argsInput);
                if (argsInput.handled)
                    return;
            }
            if (input.display && input.display.GUI) {
                var argsGUI = args.copy();
                input.display.GUI.mouseDownCallback(argsGUI);
                if (argsGUI.handled)
                    return;
            }
            if (input.scene && input.coordinate) {
                var argsScene = args.copy();
                input.scene.mouseDownCallback(argsScene);

            }
        }
        function mouseUpCallback(e)
        {
            var args = new Args(e);
            var argsCPY;
            if (input.onMouseUp) {
                var argsCPY = args.copy();
                input.onMouseUp.invoke(argsCPY);
            }
            if (input.display && input.display.GUI && !argsCPY.handled) {
                var argsCPY = args.copy();
                input.display.GUI.mouseUpCallback(argsCPY);
            }
            if (input.scene && input.coordinate && !argsCPY.handled) {
                var argsCPY = args.copy();
                input.scene.mouseUpCallback(argsCPY);

            }
            var pos = new Vector2(args.x, args.y);
            if (input._lastHoldPosition && pos.minus(input._lastHoldPosition).mod() <= input.clickRange)
            {
                input._lastHoldPosition = null;
                clickCallback(e);
            }
        }
        function clickCallback(e)
        {
            var args = new Args(e);
            var argsCPY;
            if (input.onClick) {
                var argsCPY = args.copy();
                input.onClick.invoke(argsCPY);
            }
            if (input.display && input.display.GUI && !argsCPY.handled) {
                var argsCPY = args.copy();
                input.display.GUI.clickCallback(argsCPY);
            }
            if (input.scene && input.coordinate && !argsCPY.handled) {
                var argsCPY = args.copy();
                input.scene.clickCallback(argsCPY);

            }
            if (input._lastClickTime)
            {
                var time = new Date().getTime();
                if (time - input._lastClickTime < input.doubleClickDuration)
                {
                    doubleClickCallback(e);
                    input._lastClickTime = null;
                }
                else
                {
                    input._lastClickTime = new Date().getTime();
                }
            }
            else
            {
                input._lastClickTime = new Date().getTime();
            }
        }
        function doubleClickCallback(e)
        {
            var args = new Args(e);
            if (input.onDoubleClick) {
                var argsInput = args.copy();
                input.onDoubleClick.invoke(argsInput);
                if (argsInput.handled)
                    return;
            }
            if (input.display && input.display.GUI) {
                var argsGUI = args.copy();
                input.display.GUI.doubleClickCallback(argsGUI);
                if (argsGUI.handled)
                    return;
            }
            if (input.scene && input.coordinate) {
                var argsScene = args.copy();
                input.scene.doubleClickCallback(argsScene);

            }
        }
        function wheelCallback(e)
        {
            var args = new Args(e);
            if (input.onWheel) {
                var argsInput = args.copy();
                input.onWheel.invoke(argsInput);
                if (argsInput.handled)
                    return;
            }
            if (input.display && input.display.GUI) {
                var argsGUI = args.copy();
                input.display.GUI.wheelCallback(argsGUI);
                if (argsGUI.handled)
                    return;
            }
            if (input.scene && input.coordinate) {
                var argsScene = args.copy();
                input.scene.wheelCallback(argsScene);

            }
        }
        this.element.addEventListener("mouseenter", mouseEnterCallback);
        this.element.addEventListener("mouseleave", mouseLeaveCallback);
        this.element.addEventListener("mousemove", mouseMoveCallback);
        this.element.addEventListener("mousedown", mouseDownCallback);
        this.element.addEventListener("mouseup", mouseUpCallback);
        this.element.addEventListener("wheel", wheelCallback);

        function Args(e)
        {
            this.x = 0;
            this.y = 0;
            this.dx = 0;
            this.dy = 0;
            this.dt = 0;
            this.button = 0;
            this.raw = null;
            this.input = null;
            this.handled = false;
            this.wheelDelta = 0;
            this.deltaX = 0;
            this.deltaY = 0;
            this.deltaZ = 0;
            if (!e)
                return;
            
            var bound = input.element.getBoundingClientRect();
            this.x = e.clientX - bound.left;
            this.y = e.clientY - bound.top;
            if (input.ignorePadding) {
                this.x -= input.element.style.paddingLeft;
                this.y -= input.element.style.paddingTop;
            }
            this.button = e.button;
            this.dx = this.x - lastPos.x;
            this.dy = this.y - lastPos.y;
            this.dt = (new Date().getTime() - lastTime) / 1000;
            this.handled = false;
            this.input = input;
            this.raw = e;
            this.deltaX = e.deltaX;
            this.deltaY = e.deltaY;
            this.deltaZ = e.deltaZ;
            this.wheelDelta = e.deltaY;
            lastPos = new Point(this.x, this.y);
            lastTime = new Date().getTime();
        }
        Args.prototype.copy = function ()
        {
            var args = new Args();
            args.x = this.x;
            args.y = this.y;
            args.dx = this.dx;
            args.dy = this.dy;
            args.dt = this.dt;
            args.input = this.input;
            args.button = this.button;
            args.deltaX = this.deltaX;
            args.deltaY = this.deltaY;
            args.deltaZ = this.deltaZ;
            args.raw = this.raw;
            args.handled = false;
            return args;
        }
    }
    Input.prototype.initKeyEvent = function ()
    {
        var input = this;
        var lastDown = new Date().getTime();
        var lastUp = new Date().getTime();
        var lastPress = new Date().getTime();
        function keyDownCallback(e)
        {
            var t = new Date().getTime();
            var args = new KeyEventArgs();
            args.key = e.keyCode;
            args.keyName = Keyboard.Keys.toString(args.key);
            args.keyState = Keyboard.KeyState.Down;
            args.ctrl = e.ctrlKey;
            args.alt = e.altKey;
            args.shift = e.shiftKey;
            args.handled = false;
            args.raw = e;
            args.input = Input;
            args.dt = t - lastDown;
            lastDown = t;

            if (input.onKeyDown) {
                input.onKeyDown.invoke(args);
                if (args.handled)
                    return; 
            }
            if (input.display && input.display.GUI) {
                input.display.GUI.keyDownCallback(args);
                if (args.handled)
                    return;
            }
            if(input.scene)
            {
                input.scene.keyDownCallback(args);
            }
        }
        function keyUpCallback(e)
        {
            var t = new Date().getTime();
            var args = new KeyEventArgs();
            args.key = e.keyCode;
            args.keyName = Keyboard.Keys.toString(args.key);
            args.keyState = Keyboard.KeyState.Up;
            args.ctrl = e.ctrlKey;
            args.alt = e.altKey;
            args.shift = e.shiftKey;
            args.handled = false;
            args.raw = e;
            args.input = Input;
            args.dt = t - lastUp;
            lastUp = t;

            if (input.onKeyUp) {
                input.onKeyUp.invoke(args);
                if (args.handled)
                    return;
            }
            if (input.display && input.display.GUI) {
                input.display.GUI.keyUpCallback(args);
                if (args.handled)
                    return;
            }
            if (input.scene) {
                input.scene.keyUpCallback(args);
            }
            keyPressCallback(e);
        }
        function keyPressCallback(e)
        {
            var t = new Date().getTime();
            var args = new KeyEventArgs();
            args.key = e.keyCode;
            args.keyName = Keyboard.Keys.toString(args.key);
            args.keyState = Keyboard.KeyState.Pressed;
            args.ctrl = e.ctrlKey;
            args.alt = e.altKey;
            args.shift = e.shiftKey;
            args.handled = false;
            args.raw = e;
            args.input = Input;
            args.dt = t - lastPress;
            lastPress = t;

            if (input.onKeyPress) {
                input.onKeyPress.invoke(args);
                if (args.handled)
                    return;
            }
            if (input.display && input.display.GUI) {
                input.display.GUI.keyPressCallback(args);
                if (args.handled)
                    return;
            }
            if (input.scene) {
                input.scene.keyPressCallback(args);
            }
        }
        
        this.element.addEventListener("keydown", keyDownCallback);
        this.element.addEventListener("keyup", keyUpCallback);
    }
    Input.prototype.setCoordinate = function (coordinate,keepVectors)
    {
        this.coordinate = coordinate;
    }
    Engine.Input = Input;
    window.Input = Input;

    //CollideGroup
    function CollideGroup()
    {
        this.objectList = ArrayList();
        this.ignoreList = ArrayList();
    }
    CollideGroup.prototype.addGameObject = function (obj)
    {
        if (!(obj instanceof GameObject))
        {
            throw new Error("Must be GameObject");
        }
        if (obj.collideGroups.contain(this))
            return;
        this.objectList.add(obj);
        obj.collideGroups.add(this);
    }
    CollideGroup.prototype.removeGameObject = function (obj)
    {
        this.objectList.remove(obj);
        obj.collideGroups.remove(this);
    }
    Engine.CollideGroup = CollideGroup;
    window.CollideGroup = CollideGroup;

    //Camera
    function Camera(x, y)
    {
        this.center = new Engine.Position(x, y);
        this.position = new Engine.Position(x, y);
        this.coordinate = Coordinate.Default;
        this.viewCoordinate = Coordinate.createCartesian(x, y, 1, 1, 0);
        this.width = 0;
        this.height = 0;
        this.graphics = null;
        this.displayList = ArrayList();
        this.scene = null;
        this.animationCallbackList = ArrayList();
        var camera = this;
        var zoom = 1;
        var rotation = 0;
        Object.defineProperty(this, "zoom", {
            get: function ()
            {
                return zoom;
            },
            set: function (value)
            {
                zoom = value;
                camera.viewCoordinate.unitX = 1 / zoom;
                camera.viewCoordinate.unitY = -1 / zoom;
            }
        });
        Object.defineProperty(this, "rotation", {
            get: function ()
            {
                return rotation;
            },
            set: function (value)
            {
                rotation = value;
                camera.viewCoordinate.rotation = rotation;
            }
        });
        this.position.changeCallback = function (e)
        {
            var dx = e.x - camera.position.x;
            var dy = e.y - camera.position.y;
            camera.center.x += dx;
            camera.center.y += dy;
            camera.viewCoordinate.originX += dx;
            camera.viewCoordinate.originY += dy;
        }
    }
    Camera.prototype.copy = function ()
    {
        var c = new Camera(this.x, this.y, this.width, this.height, this.zoom);
        c.graphics = this.graphics;
        return c;
    }
    Camera.prototype.animate = function (properties, time, callback)
    {
        var camera = this;
        for (var key in properties)
        {
            var keys = key.split(".");
            var lastKey = keys[keys.length - 1];
            var obj = this;
            for (var i = 0; i < keys.length - 1; i++)
            {
                obj = obj[keys[i]];
            }
            (function (obj, key, from, to, time, callback)
            {
                var delta = (to - from) / time;
                var t = 0;
                var animeCallback = function (dt)
                {
                    t += dt;
                    obj[key] += delta * dt;
                    if (delta < 0 && obj[key] <= to)
                    {
                        obj[key] = to;
                        camera.animationCallbackList.remove(animeCallback);
                        if (callback)
                        {
                            callback();
                        }
                    }
                    else if (delta > 0 && obj[key] >= to)
                    {
                        obj[key] = to;
                        camera.animationCallbackList.remove(animeCallback);
                        if (callback)
                        {
                            callback();
                        }
                    }
                    else if (t >= time)
                    {
                        obj[key] = to;
                        camera.animationCallbackList.remove(animeCallback);
                        if (callback)
                        {
                            callback();
                        }
                    }
                };
                camera.animationCallbackList.add(animeCallback);
            })(obj, lastKey, obj[lastKey], properties[key], time, callback);
        }
    }
    Camera.prototype.stop = function ()
    {
        this.animationCallbackList.length = 0;
    }
    Camera.prototype.setCenter = function (x, y, align)
    {
        if (!align)
            throw new Error("Align function is required!");
        this.position.x = x;
        this.position.y = y;
        this.center.x = x + this.width / 2 - align(this.width, this.height).x;
        this.center.y = y + this.height / 2 - align(this.width, this.height).y;
    }
    Camera.prototype.moveTo = function (x, y)
    {
        this.position.x = x;
        this.position.y = y;
        this.viewCoordinate.originX = x;
        this.viewCoordinate.originY = y;
        for (var i = 0; i < this.displayList.length; i++) {
            this.displayList[i].viewCoordinate.originX = this.position.x - (this.displayList[i].renderWidth / 2 / this.zoom);
            this.displayList[i].viewCoordinate.originY = this.position.y + (this.displayList[i].renderHeight / 2 / this.zoom);
        }
    }
    Camera.prototype.zoomTo = function (z, x, y)
    {
        var k = this.zoom / z;
        if (!isNaN(x) && !isNaN(y))
        {
            var ox = this.center.x;
            var oy = this.center.y;
            ox = x - ((x - ox) * k);
            oy = y - ((y - oy) * k);
            this.moveTo(ox, oy);
        }
        this.zoom = z;
        this.viewCoordinate.unitX = 1 / z;
         this.viewCoordinate.unitY = 1 / z;
        for (var i = 0; i < this.displayList.length; i++) {
            this.displayList[i].viewCoordinate.originX = this.position.x - (this.displayList[i].renderWidth / 2 / z);
            this.displayList[i].viewCoordinate.originY = this.position.y + (this.displayList[i].renderHeight / 2 / z);
            this.displayList[i].viewCoordinate.unitX = 1/z;
            this.displayList[i].viewCoordinate.unitY = -1/z;
        }
    }
    Camera.prototype.rotate = function (angle, x, y)
    {
        if (!isNaN(x) && !isNaN(y))
        {
            this.position.rotate(angle, x, y);
            this.center.rotate(angle, x, y);
            this.viewCoordinate.originX = this.center.x;
            this.viewCoordinate.originY = this.center.y;
        }
        this.rotation += angle;
    }
    Camera.prototype.rotateTo = function (angle, x, y)
    {
        if (!isNaN(x) && !isNaN(y))
        {
            this.position.rotate(angle - this.rotation, x, y);
            this.center.rotate(angle - this.rotation, x, y);
            this.viewCoordinate.originX = this.center.x;
            this.viewCoordinate.originY = this.center.y;
        }
        this.rotation = angle;
    }
    Camera.prototype.resetTransform = function (graphics)
    {
        //alert(this.graphics);
        graphics.ky = 1;
        graphics.setTransform(1, 0, 0, 1, 0, 0);
    }
    Camera.prototype.clear = function (bgColor)
    {
        for (var i = 0; i < this.displayList.length; i++)
        {
            var display = this.displayList[i];
            if (display.type == Display.DisplayTypes.Single)
            {
                var graphics = display.layers[0];
                this.resetTransform(graphics);
                graphics.ctx.clearRect(0, 0, graphics.canvas.width, graphics.canvas.height);
                if (bgColor)
                {
                    graphics.ctx.fillStyle = bgColor;
                    graphics.ctx.fillRect(0, 0, graphics.canvas.width, graphics.canvas.height);
                }
                this.applyTransform();
            }
            else if (display.type == Display.DisplayTypes.MultiLayer)
            {
                for (var j = 0; j < display.layers.length ; j++)
                {
                    var graphics = display.layers[j];
                    this.resetTransform(graphics);
                    graphics.ctx.clearRect(0, 0, graphics.canvas.width, graphics.canvas.height);
                    this.applyTransform();
                }
                if (display.layers.length > 0 && bgColor) {
                    var graphics = display.layers[0];
                    this.resetTransform(graphics);
                    graphics.ctx.fillStyle = bgColor;
                    graphics.ctx.fillRect(0, 0, graphics.canvas.width, graphics.canvas.height);
                    this.applyTransform();
                }
            }
        }
    }
    Camera.prototype.applyTransform = function (graphics)
    {
        if (!graphics || !graphics.ctx)
            return;
        var sinA = Math.sin(this.rotation);
        var cosA = Math.cos(this.rotation);
        var rw = graphics.width;//real width
        var rh = graphics.height;//real height
        this.width = graphics.canvas.width / this.zoom;
        this.height = graphics.canvas.height / this.zoom;
        //move to center
        graphics.setTransform(1, 0, 0, 1, rw / 2, rh / 2);
        //apply rotation
        graphics.transform(cosA, sinA, -sinA, cosA, 0, 0);
        //apply zoom
        graphics.transform(this.zoom, 0, 0, this.zoom, 0, 0);
        //move camera center
        graphics.transform(1, 0, 0, 1, -this.position.x, this.position.y);

        graphics.ky = -1;
    }
    Camera.prototype.map = function (x, y, display, coordinate)
    {
        var x0 = x - (display.renderWidth / 2);
        var y0 = y - (display.renderHeight / 2);
        var p = this.viewCoordinate.pointMapTo(coordinate, x0, y0);
        return p;
        return new Point((x / this.zoom) + (this.center.x - this.width / 2), (this.height - y / this.zoom) + (this.center.y - this.height / 2));
    }
    Camera.prototype.linkTo = function (target)
    {
        if (!target.links)
            throw new Error("Cannot link to this target.");

        function DFS(obj, target)
        {
            for (var i = 0;obj.links && i < obj.links.length; i++)
            {
                if (obj.links[i] == target)
                {
                    return true;
                }
                return DFS(obj.links[i], target);
            }
            return false;
        }
        if (DFS(target, this))
            throw new Error("Link Loop.");
        target.links.add(this);
    }
    Camera.prototype.unlink = function (target)
    {
        if (!target.links)
            throw new Error("Are you kidding me?");
        var index = target.links.indexOf(this);
        if (index < 0)
            return false;
        target.links.removeAt(index);
    }
    Camera.prototype.addDisplay = function (display)
    {
        if (!(display instanceof Display))
        {
            throw new Error("Invalid Display.");
        }
        if (display.camera)
        {
            throw new Error("This display has linked to another camera.");
        }
        display.camera = this;
        this.displayList.add(display);
        display.viewArea = new Rectangle(display.renderWidth, display.renderHeight);
        display.viewArea.setCoordinate(this.viewCoordinate);
        display.viewArea.coordinate.const = true;
        var w = display.renderWidth / this.zoom;
        var h = display.renderHeight / this.zoom;
        var displayCoordinate = Coordinate.createCartesian(this.position.x - w / 2, this.position.y + h / 2, this.zoom, -this.zoom, 0);
        display.setCoordinate(displayCoordinate);
        display.viewCoordinate.const = true;
        if (this.scene) {
            display.setLayer(this.scene.background.count + this.scene.layers.count);
        }
    }
    Camera.prototype.removeDisplay = function (display)
    {
        var index = this.displayList.indexOf(display);
        if (index < 1)
        {
            throw new Error("Not found.");
        }
        this.displayList.removeAt(index);
        display.camera = null;
    }
    Camera.prototype.render = function (dt)
    {
        if(!this.scene)
        {
            throw new Error("Camera not in scene.");
        }
        for (var i = 0; i < this.scene.background.count; i++)
        {
            var layer = this.scene.background[i];
            for (var j = 0; j < this.displayList.length; j++)
            {
                var graphics = this.displayList[j].getLayer(i);
                this.resetTransform(graphics);
                this.applyTransform(graphics);
                layer.render(graphics, dt, this);
            }
        }
        var bgCount = this.scene.background.count;
        for (var i = 0; i < this.scene.layers.depthList.length; i++)
        {
            var layer = this.scene.layers[this.scene.layers.depthList[i]];
            for (var j = 0; j < this.displayList.length; j++)
            {
                var graphics = this.displayList[j].getLayer(bgCount + i);
                this.resetTransform(graphics);
                this.applyTransform(graphics);
                layer.render(graphics, dt);
            }
        }
    }
    Camera.prototype.renderTo = function (display, dt)
    {

    }
    Engine.Camera = Camera;
    window.Camera = Camera;

    function Audio(audio)
    {
        this.src = null;
        this.audio = null;
        var self = this;
        this.playing = false;
        Object.defineProperty(this, "src", {
            get: function ()
            {
                return self.audio.src;
            },
            set: function (value)
            {
                self.audio.src = value;
            }
        });
        Object.defineProperty(this, "duration", {
            get: function ()
            {
                return self.audio.duration;
            }
        });
        Object.defineProperty(this, "complete", {
            get: function ()
            {
                return self.audio.readyState == 4;
            }
        });
        Object.defineProperty(this, "currentTime", {
            get: function ()
            {
                if (!self.audio)
                    return 0;
                return self.audio.currentTime;
            },
            set: function (value)
            {
                if (!self.audio)
                    return;
                self.audio.currentTim = value;
            }
        })
        if (!audio)
        {
            return;
        }
        else if (audio instanceof Element)
        {
            if (audio.nodeName != "AUDIO")
            {
                throw new Error("A audio Element/Url/Blob required.");
            }
            this.audio = audio;
        }
        else if (typeof audio == "string")
        {
            this.audio = new window.Audio(audio);
        }
        else if (audio instanceof Blob)
        {
            var src = URL.createObjectURL(audio);
            this.audio = new window.Audio(src);
        }
        else
        {
            this.audio = new window.Audio();
        }
        this.audio.addEventListener("ended", onEnd);
        function onEnd(e)
        {
            self.playing = false;
        }
    }
    Audio.prototype.load = function (src, callback)
    {
        var self = this;
        if (typeof src == "string")
        {
            this.src = src;
        }
        else if (src instanceof Blob)
        {
            this.src = URL.createObjectURL(audio);
        }
        if (this.audio.complete)
        {
            if(this.complete)
            {
                if (src instanceof Function)
                    src();
                else if (callback instanceof Function)
                    callback();
            }
            this.audio.addEventListener("loadedmetadata", onLoad);
        }
        function onLoad(e)
        {
            self.audio.removeEventListener("loadedmetadata", onLoad);
            if (src instanceof Function)
                src();
            else if (callback instanceof Function)
                callback();
        }
    }
    Audio.prototype.play = function ()
    {
        this.audio.play();
        this.playing = true;
    }
    Audio.prototype.pause = function ()
    {
        this.audio.pause();
        this.playing = false;
    }
    Audio.prototype.end = function ()
    {
        this.currentTime = this.duration;
        this.pause();
    }
    
    Engine.Audio = Audio;

    function AudioTrack(audio)
    {
        var _audio = null;
        this.time = 0;
        this.playing = false;
        this.display = null;
        this.audioElement = null;
        var audioTrack = this;
        this.onEnd = null;
        
        Object.defineProperty(this, "audio", {
            get: function ()
            {
                return _audio;
            },
            set: function (value)
            {
                if (!(value instanceof Engine.Audio))
                    throw new Error("A object of SarEngine.Audio required.");
                _audio = value;
                audioTrack.audioElement = new window.Audio(value.src);
                audioTrack.audioElement.addEventListener("ended", onEnded);
            }
        })
        Object.defineProperty(this, "currentTime", {
            get: function ()
            {
                if (!audioTrack.audioElement)
                    return 0;
                return audioTrack.audioElement.currentTime;
            },
            set: function (value)
            {
                if (!audioTrack.audioElement)
                    return;
                audioTrack.audioElement.currentTime = value;
            }
        });
        Object.defineProperty(this, "duration", {
            get: function ()
            {
                return audioTrack.audio.duration;
            }
        });
        if (audio instanceof Engine.Audio)
            this.audio = audio;
        function onEnded(e)
        {
            audioTrack.playing = false;
            if (audioTrack.onEnd)
            {
                audioTrack.onEnd();
            }
        }
    }
    AudioTrack.prototype.play = function ()
    {
        if (!this.display)
            throw new Error("The AudioTrack must be add to an Display before playing.");
        this.audioElement.play();
        this.playing = true;
    }
    AudioTrack.prototype.pause = function ()
    {
        if (!this.display)
            throw new Error("The AudioTrack must be add to an Display before playing.");
        if (this.audioElement)
            throw new Error("Are you kidding me?");
        this.audioElement.pause();
        this.playing = false;
    }
    AudioTrack.prototype.end = function ()
    {
        if (!this.display)
            throw new Error("The AudioTrack must be add to an Display before playing.");
        if (this.audioElement)
            throw new Error("Are you kidding me?");
        this.currentTime = this.duration;
        this.pause();
    }
    AudioTrack.prototype.addToDisplay = function (display)
    {
        if (!(display instanceof Display))
            throw new Error("Display required.");
        display.addAudioTrack(this);
    }
    AudioTrack.prototype.removeFromDisplay = function (display)
    {
        if (!(display instanceof Display))
            throw new Error("Display required.");
        display.removeAudioTrack(this);
    }
    Engine.AudioTrack = AudioTrack;

    //--------------GUI
    //-----------------

    //Graphics
    function Graphics(canvas)
    {
        if (!canvas)
            throw new Error("paramter error.");
        if (!canvas.getContext)
            throw new Error("paramter 1 must be a canvas");
        this.canvas = canvas;
        this.ctx = canvas.getContext("2d");
        this.o = new Point(0, 0);
        this.zoom = 0;
        this.rotation = 0;
        this.kx = 1;
        this.ky = 1;
        this.kw = 1;
        this.kh = 1;
        this.fillStyle = "#000000";
        this.strokeStyle = "#000000";
        this.shadowColor = "#000000";
        this.shadowBlur = 0;
        this.shadowOffsetX = 0;
        this.shadowOffsetY = 0;
        this.lineCap = "butt";
        this.lineJoin = "miter";
        this.miterLimit = 10;
        this.font = new Font("sans-serif", "10px");
        this.textAlign = TextAlign.Start;
        this.textBaseline = TextBaseline.Alphabetic;
        this.globalAlpha = 1.0;
        var globalCompositeOperation = "source-over";
        var _graphics = this;
        var lineWidth = 1;
        Object.defineProperty(this, "width", {
            get: function ()
            {
                return _graphics.canvas.width;
            },
            set: function (value)
            {
                _graphics.canvas.width = value;
            }
        });
        Object.defineProperty(this, "height", {
            get: function ()
            {
                return _graphics.canvas.height;
            },
            set: function (value)
            {
                _graphics.canvas.height = value;
            }
        });
        Object.defineProperty(this, "strokeWidth", {
            get: function ()
            {
                return lineWidth;
            },
            set: function (value)
            {
                lineWidth = value;
                _graphics.ctx.lineWidth = value;
            }
        });
        Object.defineProperty(this, "lineWidth", {
            get: function ()
            {
                return lineWidth;
            },
            set: function (value)
            {
                lineWidth = value;
                _graphics.ctx.lineWidth = value;
            }
        });
        Object.defineProperty(this, "globalCompositeOperation", {
            get: function ()
            {
                return globalCompositeOperation;
            },
            set: function (value)
            {
                globalCompositeOperation = value;
                _graphics.ctx.globalCompositeOperation = value;
            }
        });
    }
    Graphics.LineCap = (function () { var lineCap = {}; lineCap.Butt = "butt"; lineCap.Round = "round"; lineCap.Square = "square"; return lineCap; })();
    Graphics.LineJoin = (function () { var lineJoin = {}; lineJoin.Bevel = "bevel"; lineJoin.Round = "round"; lineJoin.Miter = "miter"; return lineJoin })();
    Graphics.CompositeOperation = (function () { var co = {}; co.SourceOver = "source-over"; co.SourceAtop = "source-atop"; co.SourceIn = "source-in"; co.SourceOut = "source-out"; co.DestinationOver = "destination-over"; co.DestinationAtop = "destination-atop"; co.DestinationIn = "destination-in"; co.DestinationOut = "destination-out"; co.Lighter = "lighter"; co.Copy = "copy"; co.Xor = "xor"; return co; })();
    Graphics.drawLine = function (canvas, x1, y1, x2, y2, color)
    {
        if (!canvas)
            throw new Error("paramter error.");
        if (!canvas.getContext)
            throw new Error("paramter 1 must be a canvas");

        ctx = canvas.getContext("2d");
        ctx.beginPath();
        ctx.moveTo(this.kx * x1, this.ky * y1);
        ctx.lineTo(this.kx * x2, this.ky * y2);
        if (color)
            ctx.strokeStyle = color;
        ctx.stroke();
    }
    Graphics.drawArc = function (canvas, x, y, r, ang1, ang2, antiCW, color)
    {
        var ctx = canvas.getContext("2d");
        ctx.beginPath();
        ctx.arc(this.kx * x, this.ky * y, r, ang1, ang2, antiCW);
        ctx.strokeStyle = color;
        ctx.stroke();
    }
    Graphics.drawCircle = function (canvas, x, y, r, strokeStyle, fillStyle, strokeWidth)
    {
        var ctx = canvas.getContext("2d");
        ctx.beginPath();
        ctx.arc(this.kx * x, this.ky * y, r, 0, Math.PI * 2);
        ctx.strokeStyle = strokeStyle;
        ctx.fillStyle = fillStyle;
        ctx.lineWidth = strokeWidth;
        ctx.fill();
        ctx.stroke();
    }
    Graphics.drawImage = function (canvas, img, sx, sy, swidth, sheight, x, y, width, height)
    {
        var ctx = canvas.getContext("2d");
        ctx.drawImage(img, sx, sy, swidth, sheight, this.kx * x, this.ky * y, this.kw * width, this.kh * height);
    }
    Graphics.fillRect = function (canvas, x, y, w, h, color)
    {
        if (!canvas)
            throw new Error("paramter error.");
        if (!canvas.getContext)
            throw new Error("paramter 1 must be a canvas");
        ctx = canvas.getContext("2d");
        ctx.fillStyle = color ? color : "black";
        ctx.fillRect(this.kx * x, this.ky * y, this.kw * w, this.kh * h);

    }
    Graphics.clear = function (canvas, color)
    {
        if (!canvas)
            throw new Error("paramter error.");
        if (!canvas.getContext)
            throw new Error("paramter 1 must be a canvas");
        var ctx = canvas.getContext("2d");
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        /*/ctx.fillStyle = 'rgba(255,255,255,0.05)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);*/
        if (color)
        {
            ctx.fillStyle = color;
            ctx.fillRect(0, 0, width, height);
        }
    }
    Graphics.clearRect = function (canvas, x, y, width, height)
    {
        var ctx = canvas.getContext("2d");
        ctx.clearRect(this.kx * x, this.ky * y, this.kw * width, this.kh * height);
    }
    Graphics.prototype.rect = function (x, y, width, height)
    {
        return this.ctx.rect(this.kx * x, this.ky * y, this.kw * width, this.kh * height);
    }
    Graphics.prototype.roundRect = function (x, y, width, height, r)
    {
        if (!this.ctx)
            return;
        if (width < 2 * r)
            width = 2 * r;
        if (height < 2 * r)
            height = 2 * r;
        this.ctx.beginPath();
        this.ctx.moveTo(this.kx * x + r, this.ky * y);
        this.ctx.lineTo(this.kx * x + this.kw * width - r, this.ky * y);
        this.ctx.arcTo(this.kx * x + this.kw * width, this.ky * y, this.kx * x + this.kw * width, this.ky * y + r, r);
        this.ctx.lineTo(this.kx * x + this.kw * width, this.ky * y + this.kh * height - r);
        this.ctx.arcTo(this.kx * x + this.kw * width, this.ky * y + this.kh * height, this.kx * x + this.kw * width - r, this.ky * y + this.kh * height, r);
        this.ctx.lineTo(this.kx * x + r, this.ky * y + this.kh * height);
        this.ctx.arcTo(this.kx * x, this.ky * y + this.kh * height, this.kx * x, this.ky * y + this.kh * height - r, r);
        this.ctx.lineTo(this.kx * x, this.ky * y + r);
        this.ctx.arcTo(this.kx * x, this.ky * y, this.kx * x + r, this.ky * y, r);
        this.ctx.closePath();
        return;
    }
    Graphics.prototype.fillRect = function (x, y, width, height)
    {
        this.ctx.fillStyle = this.fillStyle;
        return this.ctx.fillRect(this.kx * x, this.ky * y, this.kw * width, this.kh * height);
    }
    Graphics.prototype.strokeRect = function (x, y, width, height)
    {
        this.ctx.lineCap = this.lineCap;
        this.ctx.lineJoin = this.lineJoin;
        this.ctx.lineWidth = this.strokeWidth;
        this.ctx.miterLimit = this.miterLimit;
        this.ctx.strokeStyle = this.strokeStyle;
        return this.ctx.strokeRect(this.kx * x, this.ky * y, this.kw * width, this.kh * height);
    }
    Graphics.prototype.fillRoundRect = function (x, y, width, height, r)
    {
        this.roundRect(this.kx * x, this.ky * y, this.kw * width, this.kh * height, r);
        this.fill();
    }
    Graphics.prototype.strokeRoundRect = function (x, y, width, height, r)
    {
        this.roundRect(this.kx * x, this.ky * y, this.kw * width, this.kh * height, r);
        this.stroke();
    }
    Graphics.prototype.clearRect = function (x, y, width, height)
    {
        this.ctx.clearRect(this.kx * x, this.ky * y, this.kw * width, this.kh * height);
    }
    Graphics.prototype.fill = function ()
    {
        this.ctx.fillStyle = this.fillStyle;
        return this.ctx.fill();
    }
    Graphics.prototype.stroke = function ()
    {
        this.ctx.lineCap = this.lineCap;
        this.ctx.lineJoin = this.lineJoin;
        this.ctx.lineWidth = this.strokeWidth;
        this.ctx.miterLimit = this.miterLimit;
        this.ctx.strokeStyle = this.strokeStyle;
        return this.ctx.stroke();
    }
    Graphics.prototype.beginPath = function ()
    {
        return this.ctx.beginPath();
    }
    Graphics.prototype.moveTo = function (x, y)
    {
        return this.ctx.moveTo(this.kx * x, this.ky * y);
    }
    Graphics.prototype.closePath = function ()
    {
        return this.ctx.closePath();
    }
    Graphics.prototype.lineTo = function (x, y)
    {
        return this.ctx.lineTo(this.kx * x, this.ky * y);
    }
    Graphics.prototype.clip = function ()
    {
        return this.ctx.clip();
    }
    Graphics.prototype.quadraticCurveTo = function (cpx, cpy, x, y)
    {
        return this.ctx.quadraticCurveTo(this.kx * cpx, this.ky * cpy, this.kx * x, this.ky * y);
    }
    Graphics.prototype.bezierCurveTo = function (cp1x, cp1y, cp2x, cp2y, x, y)
    {
        return this.ctx.bezierCurveTo(this.kx * cp1x, this.ky * cp1y, this.kx * cp2x, this.ky * cp2y, this.kx * x, this.ky * y);
    }
    Graphics.prototype.arc = function (x, y, r, sAngle, eAngle, antiCW)
    {
        return this.ctx.arc(this.kx * x, this.ky * y, r, sAngle, eAngle, antiCW);
    }
    Graphics.prototype.arcTo = function (x1, y1, x2, y2, r)
    {
        return this.ctx.arcTo(this.kx * x1, this.ky * y1, this.kx * x2, this.ky * y2, r);
    }
    Graphics.prototype.isPointInPath = function (x, y)
    {
        return this.ctx.isPointInPath(this.kx * x, this.ky * y);
    }
    Graphics.prototype.scale = function (scalewidth, scaleheight)
    {
        return this.ctx.scale(scalewidth, scaleheight);
    }
    Graphics.prototype.rotate = function (angle, x, y)
    {
        if (!isNaN(x) && !isNaN(y))
        {
            
            this.ctx.translate(this.kx * x, this.ky * y);
            var r = this.ctx.rotate(sign(this.kx) * sign(this.ky) * angle);
            this.ctx.translate(-this.kx * x, -this.ky * y);
            return r;
        }
        else
            return this.ctx.rotate(angle);
    }
    Graphics.prototype.translate = function (x, y)
    {
        return this.ctx.translate(this.kx * x, this.ky * y);
    }
    Graphics.prototype.transform = function (a, b, c, d, e, f)
    {
        return this.ctx.transform(a, b, c, d, e, f);
    }
    Graphics.prototype.setTransform = function (a, b, c, d, e, f)
    {
        return this.ctx.setTransform(a, b, c, d, e, f);
    }
    Graphics.prototype.fillText = function (text, x, y, maxWidth)
    {
        this.ctx.font = this.font.toString();
        this.ctx.textAlign = this.textAlign;
        this.ctx.textBaseline = this.textBaseline;
        this.ctx.fillStyle = this.fillStyle;
        //this.ctx.fillText("2333333", 100, 100, -1);
        if (maxWidth)
            return this.ctx.fillText(text, this.kx * x, this.ky * y, this.kw * maxWidth);
        else
            return this.ctx.fillText(text, this.kx * x, this.ky * y);
    }
    Graphics.prototype.strokeText = function (text, x, y, maxWidth)
    {
        this.ctx.font = this.font.toString();
        this.ctx.fontAlign = this.fontAlign;
        this.ctx.textBaseline = this.textBaseline;
        this.ctx.lineCap = this.lineCap;
        this.ctx.lineJoin = this.lineJoin;
        this.ctx.lineWidth = this.strokeWidth;
        this.ctx.miterLimit = this.miterLimit;
        this.ctx.strokeStyle = this.strokeStyle;
        return this.ctx.strokeText(text, this.kx * x, this.ky * y, this.kw * maxWidth);
    }
    Graphics.prototype.measureText = function (text)
    {
        this.ctx.font = this.font.toString();
        this.ctx.fontAlign = this.fontAlign;
        this.ctx.textBaseline = this.textBaseline;
        return this.ctx.measureText(text);
    }
    Graphics.prototype.drawImage = function (img, sx, sy, swidth, sheight, x, y, width, height)
    {
        if (isNaN(x) && !isNaN(sx))
        {
            return this.ctx.drawImage(img, this.kx * sx, this.ky * sy, this.kw * swidth, this.kh * sheight);
        }
        else
            return this.ctx.drawImage(img, sx, sy, swidth, sheight, this.kx * x, this.ky * y, this.kw * width, this.kh * height);
    }
    Graphics.prototype.drawLine = function (x1, y1, x2, y2)
    {
        this.ctx.lineCap = this.lineCap;
        this.ctx.lineJoin = this.lineJoin;
        this.ctx.lineWidth = this.strokeWidth;
        this.ctx.miterLimit = this.miterLimit;
        this.ctx.strokeStyle = this.strokeStyle;

        this.beginPath();
        this.moveTo(this.kx * x1, this.ky * y1);
        this.lineTo(this.kx * x2, this.ky * y2);
        this.stroke();
    }
    Engine.Graphics = Graphics;
    window.Graphics = Graphics;

    //Align
    function Align() { }
    Align.topLeft = function (w, h)
    {
        return new Point(0, 0);
    }
    Align.topCenter = function (w, h)
    {
        return new Point(w / 2, 0);
    }
    Align.topRight = function (w, h)
    {
        return new Point(w, 0);
    }
    Align.middleLeft = function (w, h)
    {
        return new Point(0, h / 2);
    }
    Align.center = function (w, h)
    {
        return new Point(w / 2, h / 2);
    }
    Align.middleRight = function (w, h)
    {
        return new Point(w, h / 2);
    }
    Align.bottomLeft = function (w, h)
    {
        return new Point(0, h);
    }
    Align.bottomCenter = function (w, h)
    {
        return new Point(w / 2, h);
    }
    Align.bottomRight = function (w, h)
    {
        return new Point(w, h);
    }
    window.Align = Align;


    //Mouse
    function Mouse()
    {
        this.x = 0;
        this.y = 0;
        this.dx = 0;
        this.dy = 0;
        this.left = Mouse.ButtonState.None;
        this.right = Mouse.ButtonState.None;
        this.wheel = Mouse.ButtonState.None;
    }
    Mouse.Buttons = { Left: 0, Wheel: 1, Right: 2 };
    Mouse.ButtonState = { None: 0, Pressed: 1, Released: 2, Click: 3, DoubleClick: 4, Rolled: 8 };
    function MouseEventArgs(e)
    {
        this.x = 0;
        this.y = 0;
        this.dx = 0;
        this.dy = 0;
        this.dt = 0;
        this.raw = null;
        this.input = null;
        this.wheelDelta = 0;
        this.button = null;
        this.buttonState = Mouse.ButtonState.None;
        this.handled = false;
        if (e instanceof window.Event)
        {
            var bound = e.getBoundingClientRect();
            this.x = e.clientX - bound.left;
            this.y = e.clientY - bound.top;
            this.button = e.button;
            switch (e.type) 
            {
                case "mouseenter":
                case "mouseleave":
                case "mousemove":
                    this.buttonState = Mouse.ButtonState.None;
                    break;
                case "mousedown":
                    this.buttonState = Mouse.ButtonState.Pressed;
                    break;
                case "mouseup":
                    this.buttonState = Mouse.ButtonState.Released;
                    break;
            }
        }
    }
    MouseEventArgs.prototype.copy = function ()
    {
        var args = new MouseEventArgs();
        args.x = this.x;
        args.y = this.y;
        args.dx = this.dx;
        args.dy = this.dy;
        args.dt = this.dt;
        args.raw = this.raw;
        args.inpu = this.input;
        args.wheelDelta = this.wheelDelta;
        args.button = this.button;
        args.buttonState = this.buttonState;
        args.handled = this.handled;
        return args;
    }
    Mouse.MouseEventArgs = MouseEventArgs;
    Engine.Mouse = Mouse;
    window.Mouse = Mouse;

    //Touch
    function Touch(id)
    {
        this.x = 0;
        this.y = 0;
        this.dx = 0;
        this.dy = 0;
        this.type = Touch.Types.None;
        this.id = 0;
    }
    Touch.Types = {};
    Touch.Types.None = 0;
    Touch.Types.Start = 1;
    Touch.Types.Move = 2;
    Touch.Types.End = 3;
    function TouchEventArgs()
    {
        this.x = 0;
        this.y = 0;
        this.dx = 0;
        this.dy = 0;
        this.type = Touch.Types.None;
        this.touches = null;
        this.id = 0;
        this.handled = false;
    }
    TouchEventArgs.prototype.copy = function ()
    {
        var args = new TouchEventArgs();
        args.x = this.x;
        args.y = this.y;
        args.type = this.type;
        args.touches = this.touches;
        args.id = this.id;
        args.handled = this.handled;
        return args;
    }
    Touch.TouchEventArgs = TouchEventArgs;
    Engine.Touch = Touch;
    window.Touch = Touch;

    //Keyboard
    function Keyboard()
    {
        this.keys = [];
        this.keys[8] = Keyboard.KeyState.None;
        this.keys[9] = Keyboard.KeyState.None;
        this.keys[12] = Keyboard.KeyState.None;
        this.keys[13] = Keyboard.KeyState.None;
        this.keys[16] = Keyboard.KeyState.None;
        this.keys[17] = Keyboard.KeyState.None;
        this.keys[18] = Keyboard.KeyState.None;
        this.keys[19] = Keyboard.KeyState.None;
        this.keys[20] = Keyboard.KeyState.None;
        this.keys[27] = Keyboard.KeyState.None;
        this.keys[32] = Keyboard.KeyState.None;
        this.keys[33] = Keyboard.KeyState.None;
        this.keys[34] = Keyboard.KeyState.None;
        this.keys[35] = Keyboard.KeyState.None;
        this.keys[36] = Keyboard.KeyState.None;
        this.keys[37] = Keyboard.KeyState.None;
        this.keys[38] = Keyboard.KeyState.None;
        this.keys[39] = Keyboard.KeyState.None;
        this.keys[40] = Keyboard.KeyState.None;
        this.keys[41] = Keyboard.KeyState.None;
        this.keys[42] = Keyboard.KeyState.None;
        this.keys[43] = Keyboard.KeyState.None;
        this.keys[45] = Keyboard.KeyState.None;
        this.keys[46] = Keyboard.KeyState.None;
        this.keys[47] = Keyboard.KeyState.None;
        this.keys[48] = Keyboard.KeyState.None;
        this.keys[49] = Keyboard.KeyState.None;
        this.keys[50] = Keyboard.KeyState.None;
        this.keys[51] = Keyboard.KeyState.None;
        this.keys[52] = Keyboard.KeyState.None;
        this.keys[53] = Keyboard.KeyState.None;
        this.keys[54] = Keyboard.KeyState.None;
        this.keys[55] = Keyboard.KeyState.None;
        this.keys[56] = Keyboard.KeyState.None;
        this.keys[57] = Keyboard.KeyState.None;
        this.keys[65] = Keyboard.KeyState.None;
        this.keys[66] = Keyboard.KeyState.None;
        this.keys[67] = Keyboard.KeyState.None;
        this.keys[68] = Keyboard.KeyState.None;
        this.keys[69] = Keyboard.KeyState.None;
        this.keys[70] = Keyboard.KeyState.None;
        this.keys[71] = Keyboard.KeyState.None;
        this.keys[72] = Keyboard.KeyState.None;
        this.keys[73] = Keyboard.KeyState.None;
        this.keys[74] = Keyboard.KeyState.None;
        this.keys[75] = Keyboard.KeyState.None;
        this.keys[76] = Keyboard.KeyState.None;
        this.keys[77] = Keyboard.KeyState.None;
        this.keys[78] = Keyboard.KeyState.None;
        this.keys[79] = Keyboard.KeyState.None;
        this.keys[80] = Keyboard.KeyState.None;
        this.keys[81] = Keyboard.KeyState.None;
        this.keys[82] = Keyboard.KeyState.None;
        this.keys[83] = Keyboard.KeyState.None;
        this.keys[84] = Keyboard.KeyState.None;
        this.keys[85] = Keyboard.KeyState.None;
        this.keys[86] = Keyboard.KeyState.None;
        this.keys[87] = Keyboard.KeyState.None;
        this.keys[88] = Keyboard.KeyState.None;
        this.keys[89] = Keyboard.KeyState.None;
        this.keys[90] = Keyboard.KeyState.None;
        this.keys[96] = Keyboard.KeyState.None;
        this.keys[97] = Keyboard.KeyState.None;
        this.keys[98] = Keyboard.KeyState.None;
        this.keys[99] = Keyboard.KeyState.None;
        this.keys[100] = Keyboard.KeyState.None;
        this.keys[101] = Keyboard.KeyState.None;
        this.keys[102] = Keyboard.KeyState.None;
        this.keys[103] = Keyboard.KeyState.None;
        this.keys[104] = Keyboard.KeyState.None;
        this.keys[105] = Keyboard.KeyState.None;
        this.keys[106] = Keyboard.KeyState.None;
        this.keys[107] = Keyboard.KeyState.None;
        this.keys[108] = Keyboard.KeyState.None;
        this.keys[109] = Keyboard.KeyState.None;
        this.keys[110] = Keyboard.KeyState.None;
        this.keys[111] = Keyboard.KeyState.None;
        this.keys[112] = Keyboard.KeyState.None;
        this.keys[113] = Keyboard.KeyState.None;
        this.keys[114] = Keyboard.KeyState.None;
        this.keys[115] = Keyboard.KeyState.None;
        this.keys[116] = Keyboard.KeyState.None;
        this.keys[117] = Keyboard.KeyState.None;
        this.keys[118] = Keyboard.KeyState.None;
        this.keys[119] = Keyboard.KeyState.None;
        this.keys[120] = Keyboard.KeyState.None;
        this.keys[121] = Keyboard.KeyState.None;
        this.keys[122] = Keyboard.KeyState.None;
        this.keys[123] = Keyboard.KeyState.None;
        this.keys[124] = Keyboard.KeyState.None;
        this.keys[125] = Keyboard.KeyState.None;
        this.keys[126] = Keyboard.KeyState.None;
        this.keys[127] = Keyboard.KeyState.None;
        this.keys[128] = Keyboard.KeyState.None;
        this.keys[129] = Keyboard.KeyState.None;
        this.keys[130] = Keyboard.KeyState.None;
        this.keys[131] = Keyboard.KeyState.None;
        this.keys[132] = Keyboard.KeyState.None;
        this.keys[133] = Keyboard.KeyState.None;
        this.keys[134] = Keyboard.KeyState.None;
        this.keys[135] = Keyboard.KeyState.None;
        this.keys[136] = Keyboard.KeyState.None;
        this.keys[137] = Keyboard.KeyState.None;
    }
    Keyboard.Keys = (function (keys)
    {
        keys = {};
        keys.BackSpace = 8;
        keys.Tab = 9;
        keys.Clear = 12;
        keys.Enter = 13;
        keys.Shift = 16;
        keys.Control = 17;
        keys.Alt = 18;
        keys.Pause = 19;
        keys.CapsLock = 20;
        keys.Escape = 27;
        keys.Space = 32;
        keys.Prior = 33;
        keys.Next = 34;
        keys.End = 35;
        keys.Home = 36;
        keys.Left = 37;
        keys.Up = 38;
        keys.Right = 39;
        keys.Down = 40;
        keys.Select = 41;
        keys.Print = 42;
        keys.Execute = 43;
        keys.Insert = 45;
        keys.Delete = 46;
        keys.Help = 47;
        keys.Num0 = 48;
        keys.Num1 = 49;
        keys.Num2 = 50;
        keys.Num3 = 51;
        keys.Num4 = 52;
        keys.Num5 = 53;
        keys.Num6 = 54;
        keys.Num7 = 55;
        keys.Num8 = 56;
        keys.Num9 = 57;
        keys.A = 65;
        keys.B = 66;
        keys.C = 67;
        keys.D = 68;
        keys.E = 69;
        keys.F = 70;
        keys.G = 71;
        keys.H = 72;
        keys.I = 73;
        keys.J = 74;
        keys.K = 75;
        keys.L = 76;
        keys.M = 77;
        keys.N = 78;
        keys.O = 79;
        keys.P = 80;
        keys.Q = 81;
        keys.R = 82;
        keys.S = 83;
        keys.T = 84;
        keys.U = 85;
        keys.V = 86;
        keys.W = 87;
        keys.X = 88;
        keys.Y = 89;
        keys.Z = 90;
        keys.KP0 = 96;
        keys.KP1 = 97;
        keys.KP2 = 98;
        keys.KP3 = 99;
        keys.KP4 = 100;
        keys.KP5 = 101;
        keys.KP6 = 102;
        keys.KP7 = 103;
        keys.KP8 = 104;
        keys.KP9 = 105;
        keys.KPMultiply = 106;
        keys.KPAdd = 107;
        keys.KPSeparator = 108;
        keys.KPSubtract = 109;
        keys.KPDecimal = 110;
        keys.KPDivide = 111;
        keys.F1 = 112;
        keys.F2 = 113;
        keys.F3 = 114;
        keys.F4 = 115;
        keys.F5 = 116;
        keys.F6 = 117;
        keys.F7 = 118;
        keys.F8 = 119;
        keys.F9 = 120;
        keys.F10 = 121;
        keys.F11 = 122;
        keys.F12 = 123;
        keys.F13 = 124;
        keys.F14 = 125;
        keys.F15 = 126;
        keys.F16 = 127;
        keys.F17 = 128;
        keys.F18 = 129;
        keys.F19 = 130;
        keys.F20 = 131;
        keys.F21 = 132;
        keys.F22 = 133;
        keys.F23 = 134;
        keys.F24 = 135;
        keys.NumLock = 136;
        keys.ScrollLock = 137;
        keys.toString = function (keyCode)
        {
            switch (keyCode)
            {
                case 8: return "BackSpace";
                case 9: return "Tab";
                case 12: return "Clear";
                case 13: return "Enter";
                case 16: return "Shift";
                case 17: return "Control";
                case 18: return "Alt";
                case 19: return "Pause";
                case 20: return "CapsLock";
                case 27: return "Escape";
                case 32: return "Space";
                case 33: return "Prior";
                case 34: return "Next";
                case 35: return "End";
                case 36: return "Home";
                case 37: return "Left";
                case 38: return "Up";
                case 39: return "Right";
                case 40: return "Down";
                case 41: return "Select";
                case 42: return "Print";
                case 43: return "Execute";
                case 45: return "Insert";
                case 46: return "Delete";
                case 47: return "Help";
                case 48: return "0";
                case 49: return "1";
                case 50: return "2";
                case 51: return "3";
                case 52: return "4";
                case 53: return "5";
                case 54: return "6";
                case 55: return "7";
                case 56: return "8";
                case 57: return "9";
                case 65: return "A";
                case 66: return "B";
                case 67: return "C";
                case 68: return "D";
                case 69: return "E";
                case 70: return "F";
                case 71: return "G";
                case 72: return "H";
                case 73: return "I";
                case 74: return "J";
                case 75: return "K";
                case 76: return "L";
                case 77: return "M";
                case 78: return "N";
                case 79: return "O";
                case 80: return "P";
                case 81: return "Q";
                case 82: return "R";
                case 83: return "S";
                case 84: return "T";
                case 85: return "U";
                case 86: return "V";
                case 87: return "W";
                case 88: return "X";
                case 89: return "Y";
                case 90: return "Z";
                case 96: return "KP0";
                case 97: return "KP1";
                case 98: return "KP2";
                case 99: return "KP3";
                case 100: return "KP4";
                case 101: return "KP5";
                case 102: return "KP6";
                case 103: return "KP7";
                case 104: return "KP8";
                case 105: return "KP9";
                case 106: return "KPMultiply";
                case 107: return "KPAdd";
                case 108: return "KPSeparator";
                case 109: return "KPSubtract";
                case 110: return "KPDecimal";
                case 111: return "KPDivide";
                case 112: return "F1";
                case 113: return "F2";
                case 114: return "F3";
                case 115: return "F4";
                case 116: return "F5";
                case 117: return "F6";
                case 118: return "F7";
                case 119: return "F8";
                case 120: return "F9";
                case 121: return "F10";
                case 122: return "F11";
                case 123: return "F12";
                case 124: return "F13";
                case 125: return "F14";
                case 126: return "F15";
                case 127: return "F16";
                case 128: return "F17";
                case 129: return "F18";
                case 130: return "F19";
                case 131: return "F20";
                case 132: return "F21";
                case 133: return "F22";
                case 134: return "F23";
                case 135: return "F24";
                case 136: return "NumLock";
                case 137: return "ScrollLock";
                default: return "Unknown";
            }
        }
        return keys;
    })(Keyboard.Keys);
    Keyboard.Keys.check = function (key, keys)
    {
        for (var i = 0; i < keys.length; i++)
        {
            if (key == keys[i])
                return true;
        }
        return false;
    }
    window.Keys = Keyboard.Keys;
    Keyboard.KeyState = {};
    Keyboard.KeyState.None = 0;
    Keyboard.KeyState.Down = 1;
    Keyboard.KeyState.Up = 2;
    Keyboard.KeyState.Pressed = 3;
    Keyboard.checkKeys = function (key, keys)
    {
        for (var i = 0; i < keys.length; i++)
        {
            if (key == keys[i])
                return true;
        }
        return false;
    }
    function KeyEventArgs()
    {
        this.key = 0;
        this.keyName = "Unknown";
        this.keyState = Keyboard.KeyState.None;
        this.dt = 0;
        this.ctrl = false;
        this.alt = false;
        this.shift = false;
        this.raw = null;
        this.input = null;
        this.handled = false;
    }
    KeyEventArgs.prototype.copy = function ()
    {
        var args = new KeyEventArgs();
        args.key = this.key;
        args.keyName = this.keyName;
        args.keyState = this.keyState;
        args.dt = this.dt;
        args.ctrl = this.ctrl;
        args.alt = this.alt;
        args.shift = this.shift;
        args.raw = this.raw;
        args.input = this.input;
        args.handled = this.handled;
        return args;
    }
    Keyboard.KeyEventArgs = KeyEventArgs;
    Engine.Keyboard = Keyboard;
    window.Keyboard = Keyboard;

    function Device()
    {
        this.mouse = new Mouse;
        this.keyboard = new Keyboard;
        this.touches = [];
        this.touches.add = function (touch)
        {
            this[this.length] = touch;
        }
        this.touches.id = function (id)
        {
            for (var i = 0; i < this.length; i++)
            {
                if (this[i].id == id)
                    return this[i];
            }
            throw new Error("Id not available.");
        }
        this.touches.removeId = function (id)
        {
            for (var i = 0; i < this.length; i++)
            {
                if (this[i].id == id)
                {
                    for (var j = i + 1; j < this.length; j++)
                    {
                        this[j - 1] = this[j];
                    }
                }
            }
        }
        this.touches.remove = function (index)
        {
            for (var j = index + 1; j < this.length; j++)
            {
                this[j - 1] = this[j];
            }
        }
    }

//-----END SarEngine2D-----

    function int(x)
    {
        return parseInt(x);
    }

    function sign(x)
    {
        if (x > 0)
            return 1;
        else if (x < 0)
            return -1;
        return 0;
    }

    //Color
    function Color(r, g, b, a)
    {
        r = parseInt(r);
        g = parseInt(g);
        b = parseInt(b);
        if (isNaN(r) || r >= 256)
            r = 255;
        else if (r < 0)
            r = 0;
        if (isNaN(g) || g >= 256)
            g = 255;
        else if (g < 0)
            g = 0;
        if (isNaN(b) || b >= 256)
            b = 255;
        else if (b < 0)
            b = 0;
        if (isNaN(a) || a > 1.0)
            a = 1.0;
        else if (a < 0)
            a = 0;
        this.red = r;
        this.green = g;
        this.blue = b;
        this.alpha = a;
    }
    Color.version = 2.0;
    Color.random = function ()
    {
        return new Color(Math.random() * 255, Math.random() * 255, Math.random() * 255, 1.0);
    }
    Color.fromString = function (str)
    {
        str = str.replace(new RegExp(/\s/g), "");

        var reg = new RegExp("#[0-9a-fA-F]{6}");
        if (reg.test(str)) {
            str = str.replace("#", "");
            var strR = str.charAt(0) + str.charAt(1);
            var strG = str.charAt(2) + str.charAt(3);
            var strB = str.charAt(4) + str.charAt(5);
            var r = parseInt(strR, 16);
            var g = parseInt(strG, 16);
            var b = parseInt(strB, 16);
            return new Color(r, g, b, 1.0);
        }
        reg = new RegExp("rgb\\(([0-9]+(\\.[0-9]+){0,1}),([0-9]+(\\.[0-9]+){0,1}),([0-9]+(\\.[0-9]+){0,1})\\)");
        if (reg.test(str)) {
            var colorArray = str.replace("rgb(", "").replace(")", "").split(",");
            var r = parseInt(colorArray[0]);
            var g = parseInt(colorArray[1]);
            var b = parseInt(colorArray[2]);
            var a = 1.00;
            return new Color(r, g, b, a);
        }
        reg = new RegExp("rgba\\(([0-9]+(\\.[0-9]+){0,1}),([0-9]+(\\.[0-9]+){0,1}),([0-9]+(\\.[0-9]+){0,1}),([0-9]+(\\.[0-9]+){0,1})\\)");
        if (reg.test(str)) {
            var colorArray = str.replace("rgba(", "").replace(")", "").split(",");
            var r = parseInt(colorArray[0]);
            var g = parseInt(colorArray[1]);
            var b = parseInt(colorArray[2]);
            var a = parseFloat(colorArray[3]);
            return new Color(r, g, b, a);
        }
        switch (str) {
            case "transparent":
                return new Color(255, 255, 255, 0);
            case "aliceblue":
                return new Color(240, 248, 255, 1.0);
            case "antiquewhite":
                return new Color(250, 235, 215, 1.0);
            case "aqua":
                return new Color(0, 255, 255, 1.0);
            case "aquamarine":
                return new Color(127, 255, 212, 1.0);
            case "azure":
                return new Color(240, 255, 255, 1.0);
            case "beige":
                return new Color(245, 245, 220, 1.0);
            case "bisque":
                return new Color(255, 228, 196, 1.0);
            case "black":
                return new Color(0, 0, 0, 1.0);
            case "blanchedalmond":
                return new Color(255, 235, 205, 1.0);
            case "blue":
                return new Color(0, 0, 255, 1.0);
            case "blueviolet":
                return new Color(138, 43, 226, 1.0);
            case "brown":
                return new Color(165, 42, 42, 1.0);
            case "burlywood":
                return new Color(222, 184, 135, 1.0);
            case "cadetblue":
                return new Color(95, 158, 160, 1.0);
            case "chartreuse":
                return new Color(127, 255, 0, 1.0);
            case "chocolate":
                return new Color(210, 105, 30, 1.0);
            case "coral":
                return new Color(255, 127, 80, 1.0);
            case "cornflowerblue":
                return new Color(100, 149, 237, 1.0);
            case "cornsilk":
                return new Color(255, 248, 220, 1.0);
            case "crimson":
                return new Color(220, 20, 60, 1.0);
            case "cyan":
                return new Color(0, 255, 255, 1.0);
            case "darkblue":
                return new Color(0, 0, 139, 1.0);
            case "darkcyan":
                return new Color(0, 139, 139, 1.0);
            case "darkgoldenrod":
                return new Color(184, 134, 11, 1.0);
            case "darkgray":
                return new Color(169, 169, 169, 1.0);
            case "darkgreen":
                return new Color(0, 100, 0, 1.0);
            case "darkgrey":
                return new Color(169, 169, 169, 1.0);
            case "darkkhaki":
                return new Color(189, 183, 107, 1.0);
            case "darkmagenta":
                return new Color(139, 0, 139, 1.0);
            case "darkolivegreen":
                return new Color(85, 107, 47, 1.0);
            case "darkorange":
                return new Color(255, 140, 0, 1.0);
            case "darkorchid":
                return new Color(153, 50, 204, 1.0);
            case "darkred":
                return new Color(139, 0, 0, 1.0);
            case "darksalmon":
                return new Color(233, 150, 122, 1.0);
            case "darkseagreen":
                return new Color(143, 188, 143, 1.0);
            case "darkslateblue":
                return new Color(72, 61, 139, 1.0);
            case "darkslategray":
                return new Color(47, 79, 79, 1.0);
            case "darkslategrey":
                return new Color(47, 79, 79, 1.0);
            case "darkturquoise":
                return new Color(0, 206, 209, 1.0);
            case "darkviolet":
                return new Color(148, 0, 211, 1.0);
            case "deeppink":
                return new Color(255, 20, 147, 1.0);
            case "deepskyblue":
                return new Color(0, 191, 255, 1.0);
            case "dimgray":
                return new Color(105, 105, 105, 1.0);
            case "dimgrey":
                return new Color(105, 105, 105, 1.0);
            case "dodgerblue":
                return new Color(30, 144, 255, 1.0);
            case "firebrick":
                return new Color(178, 34, 34, 1.0);
            case "floralwhite":
                return new Color(255, 250, 240, 1.0);
            case "forestgreen":
                return new Color(34, 139, 34, 1.0);
            case "fuchsia":
                return new Color(255, 0, 255, 1.0);
            case "gainsboro":
                return new Color(220, 220, 220, 1.0);
            case "ghostwhite":
                return new Color(248, 248, 255, 1.0);
            case "gold":
                return new Color(255, 215, 0, 1.0);
            case "goldenrod":
                return new Color(218, 165, 32, 1.0);
            case "gray":
                return new Color(128, 128, 128, 1.0);
            case "green":
                return new Color(0, 128, 0, 1.0);
            case "greenyellow":
                return new Color(173, 255, 47, 1.0);
            case "grey":
                return new Color(128, 128, 128, 1.0);
            case "honeydew":
                return new Color(240, 255, 240, 1.0);
            case "hotpink":
                return new Color(255, 105, 180, 1.0);
            case "indianred":
                return new Color(205, 92, 92, 1.0);
            case "indigo":
                return new Color(75, 0, 130, 1.0);
            case "ivory":
                return new Color(255, 255, 240, 1.0);
            case "khaki":
                return new Color(240, 230, 140, 1.0);
            case "lavender":
                return new Color(230, 230, 250, 1.0);
            case "lavenderblush":
                return new Color(255, 240, 245, 1.0);
            case "lawngreen":
                return new Color(124, 252, 0, 1.0);
            case "lemonchiffon":
                return new Color(255, 250, 205, 1.0);
            case "lightblue":
                return new Color(173, 216, 230, 1.0);
            case "lightcoral":
                return new Color(240, 128, 128, 1.0);
            case "lightcyan":
                return new Color(224, 255, 255, 1.0);
            case "lightgoldenrodyellow":
                return new Color(250, 250, 210, 1.0);
            case "lightgray":
                return new Color(211, 211, 211, 1.0);
            case "lightgreen":
                return new Color(144, 238, 144, 1.0);
            case "lightgrey":
                return new Color(211, 211, 211, 1.0);
            case "lightpink":
                return new Color(255, 182, 193, 1.0);
            case "lightsalmon":
                return new Color(255, 160, 122, 1.0);
            case "lightseagreen":
                return new Color(32, 178, 170, 1.0);
            case "lightskyblue":
                return new Color(135, 206, 250, 1.0);
            case "lightslategray":
                return new Color(119, 136, 153, 1.0);
            case "lightslategrey":
                return new Color(119, 136, 153, 1.0);
            case "lightsteelblue":
                return new Color(176, 196, 222, 1.0);
            case "lightyellow":
                return new Color(255, 255, 224, 1.0);
            case "lime":
                return new Color(0, 255, 0, 1.0);
            case "limegreen":
                return new Color(50, 205, 50, 1.0);
            case "linen":
                return new Color(250, 240, 230, 1.0);
            case "magenta":
                return new Color(255, 0, 255, 1.0);
            case "maroon":
                return new Color(128, 0, 0, 1.0);
            case "mediumaquamarine":
                return new Color(102, 205, 170, 1.0);
            case "mediumblue":
                return new Color(0, 0, 205, 1.0);
            case "mediumorchid":
                return new Color(186, 85, 211, 1.0);
            case "mediumpurple":
                return new Color(147, 112, 219, 1.0);
            case "mediumseagreen":
                return new Color(60, 179, 113, 1.0);
            case "mediumslateblue":
                return new Color(123, 104, 238, 1.0);
            case "mediumspringgreen":
                return new Color(0, 250, 154, 1.0);
            case "mediumturquoise":
                return new Color(72, 209, 204, 1.0);
            case "mediumvioletred":
                return new Color(199, 21, 133, 1.0);
            case "midnightblue":
                return new Color(25, 25, 112, 1.0);
            case "mintcream":
                return new Color(245, 255, 250, 1.0);
            case "mistyrose":
                return new Color(255, 228, 225, 1.0);
            case "moccasin":
                return new Color(255, 228, 181, 1.0);
            case "navajowhite":
                return new Color(255, 222, 173, 1.0);
            case "navy":
                return new Color(0, 0, 128, 1.0);
            case "oldlace":
                return new Color(253, 245, 230, 1.0);
            case "olive":
                return new Color(128, 128, 0, 1.0);
            case "olivedrab":
                return new Color(107, 142, 35, 1.0);
            case "orange":
                return new Color(255, 165, 0, 1.0);
            case "orangered":
                return new Color(255, 69, 0, 1.0);
            case "orchid":
                return new Color(218, 112, 214, 1.0);
            case "palegoldenrod":
                return new Color(238, 232, 170, 1.0);
            case "palegreen":
                return new Color(152, 251, 152, 1.0);
            case "paleturquoise":
                return new Color(175, 238, 238, 1.0);
            case "palevioletred":
                return new Color(219, 112, 147, 1.0);
            case "papayawhip":
                return new Color(255, 239, 213, 1.0);
            case "peachpuff":
                return new Color(255, 218, 185, 1.0);
            case "peru":
                return new Color(205, 133, 63, 1.0);
            case "pink":
                return new Color(255, 192, 203, 1.0);
            case "plum":
                return new Color(221, 160, 221, 1.0);
            case "powderblue":
                return new Color(176, 224, 230, 1.0);
            case "purple":
                return new Color(128, 0, 128, 1.0);
            case "red":
                return new Color(255, 0, 0, 1.0);
            case "rosybrown":
                return new Color(188, 143, 143, 1.0);
            case "royalblue":
                return new Color(65, 105, 225, 1.0);
            case "saddlebrown":
                return new Color(139, 69, 19, 1.0);
            case "salmon":
                return new Color(250, 128, 114, 1.0);
            case "sandybrown":
                return new Color(244, 164, 96, 1.0);
            case "seagreen":
                return new Color(46, 139, 87, 1.0);
            case "seashell":
                return new Color(255, 245, 238, 1.0);
            case "sienna":
                return new Color(160, 82, 45, 1.0);
            case "silver":
                return new Color(192, 192, 192, 1.0);
            case "skyblue":
                return new Color(135, 206, 235, 1.0);
            case "slateblue":
                return new Color(106, 90, 205, 1.0);
            case "slategray":
                return new Color(112, 128, 144, 1.0);
            case "slategrey":
                return new Color(112, 128, 144, 1.0);
            case "snow":
                return new Color(255, 250, 250, 1.0);
            case "springgreen":
                return new Color(0, 255, 127, 1.0);
            case "steelblue":
                return new Color(70, 130, 180, 1.0);
            case "tan":
                return new Color(210, 180, 140, 1.0);
            case "teal":
                return new Color(0, 128, 128, 1.0);
            case "thistle":
                return new Color(216, 191, 216, 1.0);
            case "tomato":
                return new Color(255, 99, 71, 1.0);
            case "turquoise":
                return new Color(64, 224, 208, 1.0);
            case "violet":
                return new Color(238, 130, 238, 1.0);
            case "wheat":
                return new Color(245, 222, 179, 1.0);
            case "white":
                return new Color(255, 255, 255, 1.0);
            case "whitesmoke":
                return new Color(245, 245, 245, 1.0);
            case "yellow":
                return new Color(255, 255, 0, 1.0);
            case "yellowgreen":
                return new Color(154, 205, 50, 1.0);
            default:
                return new Color(0, 0, 0, 1.0);
        }
    }
    Color.prototype.copy = function ()
    {
        return new Color(this.red, this.green, this.blue, this.alpha);
    }
    Color.prototype.toString = function ()
    {
        this.red = this.red > 255 ? 255 : this.red;
        this.green = this.green > 255 ? 255 : this.green;
        this.blue = this.blue > 255 ? 255 : this.blue;
        this.alpha = this.realphad > 1.0 ? 1.0 : this.alpha;

        this.red = this.red < 0 ? 0 : this.red;
        this.green = this.green < 0 ? 0 : this.green;
        this.blue = this.blue < 0 ? 0 : this.blue;
        this.alpha = this.alpha < 0.0 ? 0.0 : this.alpha;
        return "rgba(" + parseInt(this.red).toString() + "," + parseInt(this.green).toString() + "," + parseInt(this.blue).toString() + "," + this.alpha.toString() + ")";
    }
    Color.prototype.equal = function (color)
    {
        if (!color instanceof Color)
            return false;
        if (color.red == this.red && color.green == this.green && color.blue == this.blue && color.alpha == this.alpha)
            return true;
        return false;
    }
    Engine.Color = Color;
    if (!(window.Color && window.Color.version && window.Color.version > 2.0)) {
        window.Color = Color;
    }

    //ArrayList
    function ArrayList()
    {
        var list = [];
        list.add = function (obj)
        {
            list[list.length] = obj;
            return list.length - 1;
        }
        list.insert = function (obj, index)
        {
            if (isNaN(index) || index < 0) {
                throw new Error("Invalid index.");
            }
            for (var i = this.length - 1; i >= index; i--) {
                this[i + 1] = this[i];
            }
            this[index] = obj;
        }
        list.removeAt = function (index)
        {
            if (isNaN(index) || index < 0 || index >= list.length) {
                throw new Error("Invalid index.");
            }
            for (var i = index; i < list.length - 1; i++) {
                list[i] = list[i + 1];
            }
            list.length -= 1;
        }
        list.remove = function (obj)
        {
            for (var i = 0; i < list.length; i++) {
                if (list[i] == obj) {
                    for (; i < list.length - 1; i++) {
                        list[i] = list[i + 1];
                    }
                    list.length -= 1;
                    return;
                }
            }
            throw new Error("Object not found.");
        }
        list.clear = function ()
        {
            list.length = 0;
        }
        list.addRange = function (arr, startIndex, count)
        {
            if (!startIndex || isNaN(startIndex))
                startIndex = 0;
            if (!count || isNaN(count))
                count = arr.length;
            for (var i = startIndex; i < count; i++) {
                list[list.length] = arr[i];
            }
        }
        list.contain = function (obj)
        {
            return (list.indexOf(obj) >= 0);
        }
        return list;
    }
    Engine.ArrayList = ArrayList;

    //LinkList
    function LinkList()
    {
        this.head = null;
        this.tail = null;
        this.count = 0;
    }
    LinkList.version = 1.2;
    LinkList.Node = function (obj, last, next)
    {
        this.object = obj;
        if (last)
            this.last = last;
        else
            this.last = null;
        if (next)
            this.next = next;
        else
            this.next = null;
    }
    LinkList.prototype.add = function (obj)
    {
        if (this.count <= 0) {
            this.head = new LinkList.Node(obj, null, null);
            this.head.parent = this;
            this.tail = this.head;
            this.count = 1;
            return this.head;
        }
        var node = new LinkList.Node(obj, this.tail, null);
        node.parent = this;
        this.tail.next = node
        this.tail = node;
        this.count++;
        return node;
    }
    LinkList.prototype.remove = function (node)
    {
        if (!(node instanceof LinkList.Node)) {
            for (var p = this.head ; p != null; p = p.next) {
                if (p.object == node)
                    node = p;
            }
        }
        if (node.parent != this) {
            throw new Error("The node doesn't belong to this link list");
        }
        if (node.last == null) {
            this.head = node.next;
        }
        else
            node.last.next = node.next;
        if (node.next == null) {
            this.tail = node.last;
        }
        else
            node.next.last = node.last;
        this.count--;
    }
    LinkList.prototype.foreach = function (callback)
    {
        if (!callback)
            throw new Error("A callback function is require.");
        var p = this.head;
        for (var p = this.head; p; p = p.next) {
            var br = callback(p.object, p);
            if (br)
                return;
        }
    }
    LinkList.prototype.toArray = function ()
    {
        var ar = [];
        var i = 0;
        this.foreach(function (obj, node)
        {
            ar[i] = obj;
            i++;
        });
        return ar;
    }
    if (!window.LinkList || !window.LinkList.version || window.LinkList.version < LinkList.version) {
        window.LinkList = LinkList;
    }


    var EventJs = (function ()
    {
        function Event()
        {
            this.def = null;
            this.handlers = ArrayList();
        }
        Event.prototype.invoke = function (args)
        {
            args = args || {};
            if (!args["handled"])
                args.handled = false;
            if (this.def)
                this.def(args);
            for (var i = 0; i < this.handlers.length; i++) {
                if (args.handled)
                    return;
                if (this.handlers[i])
                    this.handlers[i](args);
            }
        }
        Event.prototype.add = function (handler)
        {

            this.handlers.add(handler);
        }
        Event.prototype.remove = function (handler)
        {
            if (this.def == handler)
                this.def = null;
            this.handlers.remove(handler);
        }

        function EventManager()
        {
            this.events = {};
            this.eventNames = ArrayList();
        }
        EventManager.prototype.register = function (name, event)
        {
            if (name == undefined || name == null)
                throw new Error("A name of the event required.");
            if (this.eventNames.indexOf(name) > 0)
                throw new Error("Event existed.");
            this.events[name] = event;
            this.eventNames.add(name);
        }
        Event.EventManager = EventManager;

        function defineEvent(obj, name, handler)
        {
            if (!obj)
                throw new Error("An object required.");
            if (name == undefined || name == null)
                throw new Error("A name of the event required.");
            if (!obj.eventManager) {
                obj.eventManager = new EventManager();

            }

            if (obj.eventManager.eventNames.contain(name))
                throw new Error("Event existed.");
            var event = new Event();
            obj.eventManager.register(name);
            Object.defineProperty(obj, name, {
                get: function ()
                {
                    return event;
                },
                set: function (handler)
                {
                    event.def = handler;
                }
            })
        }
        Event.defineEvent = defineEvent;
        return Event;
    })();

    function TaskManagment()
    {
        var taskMgn = this;
        this.tasks = ArrayList();
        this.pending = ArrayList();
        this.completed = ArrayList();
        this.onAllComplete = null;
        this.onComplete = null;
        this.onError = null;
        this.addTask = function (task)
        {
            if (!(task instanceof Task)) {
                throw new Error("An instance of Task is required.");
            }
            task.onComplete = onComplete;
            taskMgn.tasks.add(task);
        }
        this.start = function ()
        {
            taskMgn.pending = ArrayList();
            taskMgn.completed = ArrayList();
            for (var i = 0; i < taskMgn.tasks.length ; i++) {
                taskMgn.pending.add(taskMgn.tasks[i]);
                taskMgn.tasks[i].status = Task.Status.Pending;
            }
            for (var i = 0; i < taskMgn.tasks.length; i++) {
                var task = taskMgn.tasks[i];
                try {
                    task.start();
                }
                catch (ex) {
                    if (taskMgn.onError)
                        taskMgn.onError(ex);
                }
            }
        }
        function onComplete(task)
        {
            taskMgn.pending.remove(task);
            taskMgn.completed.add(task);
            if (taskMgn.onComplete)
                taskMgn.onComplete(this);
            if (taskMgn.pending.length <= 0 && taskMgn.onAllComplete)
                taskMgn.onAllComplete();
        }
    }
    function Task(f, args)
    {
        var task = this;
        this.onComplete = null;
        this.func = f;
        this.id = null;
        this.status = Task.Status.Pending;
        this.start = function ()
        {
            if (!task.func || !(task.func instanceof Function))
                return;
            task.status = Task.Status.Running;
            task.func(completeCallback, args);
        }
        function completeCallback()
        {
            task.status = Task.Status.Completed;
            if (task.onComplete instanceof Function) {
                task.onComplete(task);
            }
        }
    }
    Task.Status = { Pending: 0, Running: 1, Completed: 2 };

    return Engine;
})(window.SarEngine);