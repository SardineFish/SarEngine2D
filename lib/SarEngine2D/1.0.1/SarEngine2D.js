window.SarEngine = (function (engine)
{
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
    }
    Engine.Version = 0.50;
    Engine.createByCanvas = function (canvas, width, height)
    {
        var engine = new Engine();
        var output = new Output(canvas, width, height);
        var scene = new Scene();
        engine.scene = scene;
        var camera = new Camera(0, 0, 0, 0, 1);
        camera.addOutput(output);
        scene.addCamera(camera);
        scene.addInput(output);
        return engine;
    }
    Engine.createInNode = function (node, width, height)
    {
        var engine = new Engine();
        var output = new Output(node, width, height);
        var scene = new Scene();
        engine.scene = scene;
        var camera = new Camera(0, 0, 0, 0, 1);
        camera.addOutput(output);
        scene.addCamera(camera);
        scene.addInput(output);
        return engine;
    }
    Engine.prototype.start = function ()
    {
        var engine = this;
        function animationFrame(delay)
        {
            try 
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
            }
            catch (ex)
            {
                if (engine.onError)
                    engine.onError(ex);
            }
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
        this.background = new BackgroundCollection(this);
        this.device = new Device();
        this.eventSources = ArrayList();
        this.doubleClickDelay = 200;
        this.onUpdate = null;
        this.onRender = null;
        this.onEndRender = null;
        this.onMouseMove = null;
        this.onMouseOver = null;
        this.onMouseOut = null;
        this.onMouseDown = null;
        this.onMouseUp = null;
        this.onClick = null;
        this.onDoubleClick = null;
        this.onMouseWheel = null;
        this.onKeyDown = null;
        this.onKeyUp = null;
        this.onKeyPress = null;
        this.onTouchStart = null;
        this.onTouchMove = null;
        this.onTouchEnd = null;

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
            for (var j = 0; j < camera.outputList.length ; j++)
            {
                camera.outputList[j].setLayer(this.count + this.scene.background.count);
            }
        }
    }
    LayerCollection.prototype.removeAt = function (depth)
    {
        if (!this[depth])
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
        for (var j = 0; j < camera.outputList.length ; j++)
        {
            camera.outputList[j].setLayer(this.count + this.scene.background.count);
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
            for (var j = 0; j < this.scene.cameraList[i].outputList.length; j++)
            {
                var output = this.scene.cameraList[i].outputList[j];
                output.setLayer(this.count + this.scene.layers.count);
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
        })(this.count - 1);
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
            for (var j = 0; j < this.scene.cameraList[i].outputList.length; j++)
            {
                var output = this.scene.cameraList[i].outputList[j];
                output.setLayer(this.count + this.scene.layers.count);
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
                obj.a.x = (obj.F.x + obj.constantForce.x) / obj.mass;
                obj.a.y = (obj.F.y + obj.constantForce.y) / obj.mass;
                if (obj.gravity && (!obj.collider || !obj.collider.landed))
                {
                    obj.a.x += scene.physics.g.x;
                    obj.a.y += scene.physics.g.y;
                }
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
        if (scene.onRender)
        {
            var args = { dt: dt, cancel: false };
            scene.onRender(args);
            if (args.cancel)
                return;
        }

        for (var i = 0; i < this.cameraList.length; i++)
        {
            this.cameraList[i].clear();
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
        if (this.onEndRender)
            this.onEndRender();
    }
    Scene.prototype.updateFrame = function (delay)
    {
        /*try
        {*/
        var scene = this;
        this.runtime += delay;
        var dt = delay / 1000;
        if (scene.onUpdate)
        {
            args = { dt: dt, cancle: false };
            scene.onUpdate(args);
            if (args.cancle)
                return;
        }
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
        /*} catch (ex) { alert(whileRender + ex.message); }*/
    }
    Scene.prototype.addInput = function (input)
    {
        if (!this.eventSources.contain(input))
        {
            this.eventSources.add(input);
            this.initEvents(input);
        }
    }
    Scene.prototype.removeInput = function (input)
    {
        var index = this.eventSources.indexOf(input);
        if (index < 0)
            return;
        this.eventSources.removeAt(index);
        input.removeSceneEvent();
    }
    Scene.prototype.initEvents = function (input, output)
    {
        var clickTime = 0;
        var scene = this;

        var dom = input;
        if (input instanceof Output)
        {
            dom = input.outputDOM;
            output = input;
        }
        else if (input instanceof window.Element)
        {
            dom = input;
            if (!output)
                throw new Error("Output required.");
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
            var mapTo = output.camera.map(e.pageX, e.pageY, output, Coordinate.Default);
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
            var mapTo = output.camera.map(e.pageX, e.pageY, output, Coordinate.Default);
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

            /*args.x = (e.pageX / output.camera.zoom) + (output.camera.center.x - output.camera.width / 2);
            args.y = (output.camera.height - e.pageY / output.camera.zoom) + (output.camera.center.y - output.camera.height / 2);*/
            args.x = mapTo.x;
            args.y = mapTo.y;

            if (scene.onMouseMove)
                scene.onMouseMove(args);
        }
        function mouseOverCallback(e)
        {
            var args = new MouseEventArgs();
            args.x = output.camera.map(e.pageX, e.pageY, output, Coordinate.Default).x;
            args.y = output.camera.map(e.pageX, e.pageY, output, Coordinate.Default).y;
            args.button = e.button;
            args.buttonState = Mouse.ButtonState.None;
            args.handled = false;
            if (scene.onMouseOver)
                scene.onMouseOver(args);
        }
        function mouseOutCallback(e)
        {
            var args = new MouseEventArgs();
            args.x = output.camera.map(e.pageX, e.pageY, output, Coordinate.Default).x;
            args.y = output.camera.map(e.pageX, e.pageY, output, Coordinate.Default).y;
            args.button = e.button;
            args.buttonState = Mouse.ButtonState.None;
            args.handled = false;
            if (scene.onMouseOut)
                scene.onMouseOut(args);
        }
        function mouseDownCallback(e)
        {
            var mapTo = output.camera.map(e.pageX, e.pageY, output, Coordinate.Default);
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
            var mapTo = output.camera.map(e.pageX, e.pageY, output, Coordinate.Default);
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
            var mapTo = output.camera.map(e.pageX, e.pageY, output, Coordinate.Default);
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

                args.x = output.camera.map(e.pageX, e.pageY, output, Coordinate.Default).x;
                args.y = output.camera.map(e.pageX, e.pageY, output, Coordinate.Default).y;

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

                args.x = output.camera.map(e.pageX, e.pageY, output, Coordinate.Default).x;
                args.y = output.camera.map(e.pageX, e.pageY, output, Coordinate.Default).y;

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
                t.x = output.camera.map(e.changedTouches[i].pageX, e.changedTouches[i].pageY).x;
                t.y = output.camera.map(e.changedTouches[i].pageX, e.changedTouches[i].pageY).y;
                t.type = Touch.Types.Start;
                scene.device.touches.add(t);

                var argsGUI = new Touch.TouchEventArgs();
                argsGUI.type = Touch.Types.Start;
                argsGUI.id = e.changedTouches[i].identifier;
                argsGUI.x = e.changedTouches[i].pageX;
                argsGUI.y = e.changedTouches[i].pageY;

                var args = argsGUI.copy();
                args.x = output.camera.map(e.changedTouches[i].pageX, e.changedTouches[i].pageY).x;
                args.y = output.camera.map(e.changedTouches[i].pageX, e.changedTouches[i].pageY).y;

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
                var mapTo = output.camera.map(e.pageX, e.pageY, output, Coordinate.Default);
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
                args.x = output.camera.map(e.changedTouches[i].pageX, e.changedTouches[i].pageY).x;
                args.y = output.camera.map(e.changedTouches[i].pageX, e.changedTouches[i].pageY).y;

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
                args.x = output.camera.map(e.changedTouches[i].pageX, e.changedTouches[i].pageY).x;
                args.y = output.camera.map(e.changedTouches[i].pageX, e.changedTouches[i].pageY).y;

                if (scene.GUI)
                    scene.GUI.touchEndCallback(argsGUI);
                if (args.handled)
                    continue;
                if (scene.onTouchEnd)
                    scene.onTouchEnd(args);
            }
        }

        dom.addEventListener("mouseenter", mouseEnterCallback);
        dom.addEventListener("mouseout", mouseOutCallback);
        dom.addEventListener("mousemove", mouseMoveCallback);
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
    }
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
        return obj.id;
    }
    Scene.prototype.removeGameObject = function (id)
    {
        if (id instanceof GameObject)
        {
            for (var i = 0; i < this._objList.length; i++)
            {
                if (this._objList[i] == id)
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
            for (var j = 0; j < camera.outputList.length ; j++)
            {
                camera.outputList[j].setLayer(this.layers.count);
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
        if (camera.scene)
        {
            throw new Error("This camera is in another scene.");
        }
        camera.scene = this;
        this.cameraList.add(camera);
        for (var i = 0; i < camera.outputList.length ; i++)
        {
            camera.outputList[i].setLayer(this.layers.count);
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
    }
    Coordinate.Axis = function ()
    {
        this.visible = false;
        this.graphic = null;
    }
    Coordinate.Axis.createCartesian = function (coordinate, xLen, yLen, xColor, yColor)
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
                    x: x / xZoom,
                    y: y / yZoom
                };
            }
            else
            {
                var cos = Math.cos(-rotation);
                var sin = Math.sin(-rotation);
                return {
                    x: (x * cos - y * sin) / xZoom,
                    y: (y * cos + x * sin) / yZoom
                };
            }
        }
        function vectorFrom(x, y)
        {
            if (rotation == 0)
            {
                return {
                    x: x * xZoom,
                    y: y * yZoom
                };
            }
            else
            {
                var cos = Math.cos(rotation);
                var sin = Math.sin(rotation);
                var dx = x * xZoom;
                var dy = y * yZoom;
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
            };
        }
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
        if (!coordinate)
        {
            coordinate = Coordinate.Default;
        }
        this.coordinate = coordinate;
        this.objectList = ArrayList();
        this.followCamera = false;
        this.scene = null;
        this.onRender = null;
        this.onEndRender = null;

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
            if (isNaN(index) || index < 0)
            {
                throw new Error("Invalid index.");
            }
            for (var i = this.length - 1; i >= index; i--)
            {
                this[i + 1] = this[i];
            }
            this[index] = obj;
        }
        list.removeAt = function (index)
        {
            if (isNaN(index) || index < 0 || index >= list.length)
            {
                throw new Error("Invalid index.");
            }
            for (var i = index; i < list.length - 1; i++)
            {
                list[i] = list[i + 1];
            }
            list.length -= 1;
        }
        list.remove = function (obj)
        {
            for (var i = 0; i < list.length; i++)
            {
                if (list[i] == obj)
                {
                    for (; i < list.length - 1; i++)
                    {
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
            for (var i = startIndex; i < count; i++)
            {
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

    //Matrix
    function Matrix(m, n)
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

    //Output
    function Output(node, w, h)
    {
        if (!(node instanceof Node))
        {
            throw new Error("Cannot create a output by this object.");
        }

        this.type = Output.OutputTypes.None;
        this.getLayer = function (z) { };
        this.setLayer = function (count) { };
        this.camera = null;
        this.layers = ArrayList();
        this.audioTracks = ArrayList();
        this.outputDOM = null;
        this.viewArea = null;
        var outputDom = null;
        var graphics = null;
        var width = 0;
        var height = 0;
        var renderWidth = 0;
        var renderHeight = 0;
        var seperateSize = false;
        if (node.nodeName == "CANVAS")
        {
            outputDom = node;
            this.outputDOM = node;
            this.type = Output.OutputTypes.Single;
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
            outputDom = node;
            this.outputDOM = node;
            if (getComputedStyle(outputDom).position == "static")
            {
                outputDom.style.position = "relative";
            }
            this.type = Output.OutputTypes.MultiLayer;
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
                        outputDom.appendChild(canvas);
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
    Output.OutputTypes = { None: 0, Single: 1, MultiLayer: 2 };
    Output.prototype.outScreen = function (obj)
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
    Output.prototype.connectTo = function (camera)
    {
        if (this.camera)
            this.camera.removeOutput(this);
        camera.addOutput(this);

    }
    Output.prototype.addAudioTrack = function (audioTrack)
    {
        if (!this.audioTracks.contain(audioTrack))
        {
            var index = this.audioTracks.add(audioTrack);
            audioTrack.output = this;
            return index;
        }
    }
    Output.prototype.removeAudioTrack = function (audioTrack)
    {
        var index = this.audioTracks.indexOf(audioTrack);
        if (index < 0)
            return -1;
        this.audioTracks.removeAt(index);
        audioTrack.output = null;
    }
    Output.prototype.playAudio = function (audio)
    {
        if (!(audio instanceof Engine.Audio) || !(audio instanceof window.Audio))
        {
            throw new Error("Audio required.");
        }
        audio.play();
    }
    Output.prototype.playNewAudio = function (audio)
    {
        if (audio instanceof window.Audio)
        {
            audio = new Engine.Audio(audio);
        }
        if (audio instanceof Engine.Audio)
        {
            var track = new AudioTrack(audio);
            this.addAudioTrack(track);
            var output = this;
            track.onEnd = function ()
            {
                output.removeAudioTrack(track);
            }
            track.play();

        }
        else
        {
            throw new Error("Audio required.");
        }
    }
    Engine.Output = Output;
    window.Output = Output;

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
        this.viewCoordinate = Coordinate.createCartesian(x, y, 1, -1, 0);
        this.width = 0;
        this.height = 0;
        this.graphics = null;
        this.outputList = ArrayList();
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
        for (var i = 0; i < this.outputList.length; i++)
        {
            var output = this.outputList[i];
            if (output.type == Output.OutputTypes.Single)
            {
                var graphics = output.layers[0];
                this.resetTransform(graphics);
                graphics.ctx.clearRect(0, 0, graphics.canvas.width, graphics.canvas.height);
                if (bgColor)
                {
                    graphics.ctx.fillStyle = bgColor;
                    graphics.ctx.fillRect(0, 0, graphics.canvas.width, graphics.canvas.height);
                }
                this.applyTransform();
            }
            else if (output.type == Output.OutputTypes.MultiLayer)
            {
                for (var j = 0; j < output.layers.length ; j++)
                {
                    var graphics = output.layers[j];
                    this.resetTransform(graphics);
                    graphics.ctx.clearRect(0, 0, graphics.canvas.width, graphics.canvas.height);
                    if (bgColor)
                    {
                        graphics.ctx.fillStyle = bgColor;
                        graphics.ctx.fillRect(0, 0, graphics.canvas.width, graphics.canvas.height);
                    }
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
    Camera.prototype.map = function (x, y, output, coordinate)
    {
        var x0 = x - (output.renderWidth / 2);
        var y0 = y - (output.renderHeight / 2);
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
            for (var i = 0; obj.links && i < obj.links.length; i++)
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
    Camera.prototype.addOutput = function (output)
    {
        if (!(output instanceof Output))
        {
            throw new Error("Invalid Output.");
        }
        if (output.camera)
        {
            throw new Error("This output has linked to another camera.");
        }
        output.camera = this;
        this.outputList.add(output);
        output.viewArea = new Rectangle(output.renderWidth, output.renderHeight);
        output.viewArea.setCoordinate(this.viewCoordinate);
    }
    Camera.prototype.removeOutput = function (output)
    {
        var index = this.outputList.indexOf(output);
        if (index < 1)
        {
            throw new Error("Not found.");
        }
        this.outputList.removeAt(index);
        output.camera = null;
    }
    Camera.prototype.render = function (dt)
    {
        if (!this.scene)
        {
            throw new Error("Camera not in scene.");
        }
        for (var i = 0; i < this.scene.background.count; i++)
        {
            var layer = this.scene.background[i];
            for (var j = 0; j < this.outputList.length; j++)
            {
                var graphics = this.outputList[j].getLayer(i);
                this.resetTransform(graphics);
                this.applyTransform(graphics);
                layer.render(graphics, dt, this);
            }
        }
        var bgCount = this.scene.background.count;
        for (var i = 0; i < this.scene.layers.depthList.length; i++)
        {
            var layer = this.scene.layers[this.scene.layers.depthList[i]];
            for (var j = 0; j < this.outputList.length; j++)
            {
                var graphics = this.outputList[j].getLayer(bgCount + i);
                this.resetTransform(graphics);
                this.applyTransform(graphics);
                layer.render(graphics, dt);
            }
        }
    }
    Camera.prototype.renderTo = function (output, dt)
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
            if (this.complete)
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
        this.output = null;
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
        if (!this.output)
            throw new Error("The AudioTrack must be add to an Output before playing.");
        this.audioElement.play();
        this.playing = true;
    }
    AudioTrack.prototype.pause = function ()
    {
        if (!this.output)
            throw new Error("The AudioTrack must be add to an Output before playing.");
        if (this.audioElement)
            throw new Error("Are you kidding me?");
        this.audioElement.pause();
        this.playing = false;
    }
    AudioTrack.prototype.end = function ()
    {
        if (!this.output)
            throw new Error("The AudioTrack must be add to an Output before playing.");
        if (this.audioElement)
            throw new Error("Are you kidding me?");
        this.currentTime = this.duration;
        this.pause();
    }
    AudioTrack.prototype.addToOutput = function (output)
    {
        if (!(output instanceof Output))
            throw new Error("Output required.");
        output.addAudioTrack(this);
    }
    AudioTrack.prototype.removeFromOutput = function (output)
    {
        if (!(output instanceof Output))
            throw new Error("Output required.");
        output.removeAudioTrack(this);
    }
    Engine.AudioTrack = AudioTrack;

    //--------------GUI

    //-------LinkList
    function LinkList()
    {
        this.head = null;
        this.tail = null;
        this.count = 0;
    }
    LinkList.version = 1.0;
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
        if (this.count <= 0)
        {
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
        if (node.parent != this)
        {
            throw new Error("The node doesn't belong to this link list");
        }
        if (node.last == null)
        {
            this.head = node.next;
        }
        else
            node.last.next = node.next;
        if (node.next == null)
        {
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
        for (var p = this.head; p; p = p.next)
        {
            var br = callback(p.object, p);
            if (br)
                return;
        }
    }
    if (!window.LinkList || !window.LinkList.version || window.LinkList.version < LinkList.version)
    {
        window.LinkList = LinkList;
    }

    int = parseInt;
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
        if (reg.test(str))
        {
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
        if (reg.test(str))
        {
            var colorArray = str.replace("rgb(", "").replace(")", "").split(",");
            var r = parseInt(colorArray[0]);
            var g = parseInt(colorArray[1]);
            var b = parseInt(colorArray[2]);
            var a = 1.00;
            return new Color(r, g, b, a);
        }
        reg = new RegExp("rgba\\(([0-9]+(\\.[0-9]+){0,1}),([0-9]+(\\.[0-9]+){0,1}),([0-9]+(\\.[0-9]+){0,1}),([0-9]+(\\.[0-9]+){0,1})\\)");
        if (reg.test(str))
        {
            var colorArray = str.replace("rgba(", "").replace(")", "").split(",");
            var r = parseInt(colorArray[0]);
            var g = parseInt(colorArray[1]);
            var b = parseInt(colorArray[2]);
            var a = parseFloat(colorArray[3]);
            return new Color(r, g, b, a);
        }
        switch (str)
        {
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
    if (!(window.Color && window.Color.version && window.Color.version > 2.0))
    {
        window.Color = Color;
    }

    function Thickness(top, bottom, left, right)
    {
        if (isNaN(top))
        {
            top = bottom = left = right = 0;
        }
        else if (isNaN(bottom))
        {
            bottom = left = right = top;
        }
        this.top = top;
        this.bottom = bottom;
        this.left = left;
        this.right = right;
    }
    Thickness.prototype.copy = function ()
    {
        return new Thickness(this.top, this.bottom, this.left, this.right);
    }
    window.Thickness = Thickness;

    var VerAlign = {};
    VerAlign.Top = 1;
    VerAlign.Bottom = 2;
    VerAlign.Center = 0;
    VerAlign.Stretch = 3;
    window.VerAlign = VerAlign;

    var HorAlign = {};
    HorAlign.Left = 1;
    HorAlign.Right = 2;
    HorAlign.Center = 0;
    HorAlign.Stretch = 3;
    window.HorAlign = HorAlign;

    function GUI()
    {
        this.scene = null;
        this.children = new LinkList();
        this.width = 0;
        this.height = 0;
        this.x = 0;
        this.y = 0;
        this.color = new Color(0, 0, 0, 1.00);
        this.bgColor = new Color(0, 0, 0, 0);

        this.onRender = null;
        this.onMouseDown = null;
        this.onMouseUp = null;
        this.onMouseMove = null;
        this.onClick = null;
        this.onDoubleClick = null;
        this.onTouchStart = null;
        this.onTouchEnd = null;
        this.onTouchMove = null;
    }
    GUI.prototype.copy = function ()
    {
        var gui = new GUI;
        gui.controls = this.controls;
        gui.ctrlList = this.ctrlList;
        gui.width = this.width;
        gui.height = this.height;
        gui.textCalcu = this.textCalcu;

        this.onRender = this.onRender;
        this.onMouseDown = this.onMouseDown;
        this.onMouseUp = this.onMouseUp;
        this.onMouseMove = this.onMouseMove;
        this.onClick = this.onClick;
        this.onDoubleClick = this.onDoubleClick;
        this.onTouchStart = this.onTouchStart;
        this.onTouchEnd = this.onTouchEnd;
        this.onTouchMove = this.onTouchMove;
    }
    GUI.prototype.addControl = function (obj)
    {
        this.children.add(obj);
        obj.parent = this;
    }
    GUI.prototype.render = function (graphics)
    {
        this.width = graphics.canvas.width;
        this.height = graphics.canvas.height;
        var gui = this;
        if (this.onRender)
        {
            this.onRender();
        }
        this.children.foreach(function (obj, node)
        {
            if (obj.render)
                obj.render(graphics);
        });
    }
    GUI.prototype.mouseMoveCallback = function (e)
    {
        this.children.foreach(function (child, node)
        {
            if (child.mouseMoveCallback && child.isPointIn && child.isPointIn(e.x, e.y))
            {
                child.mouseMoveCallback(e);
                if (e.handled)
                    return true;
            }
        });
        if (e.handled)
            return;
        if (this.onMouseMove)
            this.onMouseMove(e);
    }
    GUI.prototype.mouseDownCallback = function (e)
    {
        this.children.foreach(function (child, node)
        {
            if (child.mouseDownCallback && child.isPointIn && child.isPointIn(e.x, e.y))
            {
                child.mouseDownCallback(e);
                if (e.handled)
                    return true;
            }
        });
        if (e.handled)
            return;
        if (this.onMouseDown)
            this.onMouseDown(e);
    }
    GUI.prototype.mouseUpCallback = function (e)
    {
        this.children.foreach(function (child, node)
        {
            if (child.mouseUpCallback)
            {
                child.mouseUpCallback(e);
                if (e.handled)
                    return true;
            }
        });
        if (e.handled)
            return;
        if (this.onMouseUp)
            this.onMouseUp(e);
    }
    GUI.prototype.clickCallback = function (e)
    {
        this.children.foreach(function (child, node)
        {
            if (child.clickCallback && child.isPointIn && child.isPointIn(e.x, e.y))
            {
                child.clickCallback(e);
                if (e.handled)
                    return true;
            }
        });
        if (e.handled)
            return;
        if (this.onClick)
            this.onClick(e);
    }
    GUI.prototype.doubleClickCallback = function (e)
    {
        this.children.foreach(function (child, node)
        {
            if (child.doubleClickCallback && child.isPointIn && child.isPointIn(e.x, e.y))
            {
                child.doubleClickCallback(e);
                if (e.handled)
                    return true;
            }
        });
        if (e.handled)
            return;
        if (this.onDoubleClick)
            this.onDoubleClick(e);
    }
    GUI.prototype.touchStartCallback = function (e)
    {
        this.children.foreach(function (child, node)
        {
            if (child.touchStartCallback && child.isPointIn && child.isPointIn(e.x, e.y))
            {
                child.touchStartCallback(e);
                if (e.handled)
                    return true;
            }
        });
        if (e.handled)
            return;
        if (this.onTouchStart)
            this.onTouchStart(e);
    }
    GUI.prototype.touchEndCallback = function (e)
    {
        this.children.foreach(function (child, node)
        {
            for (var i = 0; i < e.touches.length; i++)
            {
                //alert(e.touches[i].x + "," + e.touches[i].y);
                //alert(child.isPointIn(e.touches[i].x, e.touches[i].y));
                if (child.isPointIn && child.isPointIn(e.touches[i].x, e.touches[i].y))
                    return;
            }
            if (child.touchEndCallback)
            {
                child.touchEndCallback(e);
                if (e.handled)
                    return true;
            }
        });
        if (e.handled)
            return;
        if (this.onTouchEnd)
            this.onTouchEnd(e);
    }
    GUI.prototype.touchMoveCallback = function (e)
    {
        this.children.foreach(function (child, node)
        {
            if (child.touchMoveCallback)
            {
                child.touchMoveCallback(e);
                if (e.handled)
                    return true;
            }
        });
        if (e.handled)
            return;
        if (this.onTouchMove)
            this.onTouchMove(e);
    }
    Engine.GUI = GUI;
    window.GUI = GUI;

    function Block(width, height)
    {
        this.children = new LinkList();
        this.parent = null;


        this.widthAuto = false;
        this.heightAuto = true;
        if (isNaN(width))
        {
            width = 0;
            this.widthAuto = true;
        }
        if (isNaN(height))
        {
            height = 0;
            this.heightAuto = true;
        }
        this.width = width;
        this.height = height;
        this.x = 0;
        this.y = 0;
        this.margin = new Thickness(0);
        this.padding = new Thickness(0);
        this.horAlign = HorAlign.Left;
        this.verAlign = VerAlign.Top;

        this.color = null;
        this.bgColor = null;
        this.border = 1;
        this.font = new Font();

        this.collider = null;

        this.onClick = null;
        this.onMouseDown = null;
        this.onMouseUp = null;
        this.onMouseMove = null;
        this.onTouchStart = null;
        this.onTouchEnd = null;
        this.onTouchMove = null;
    }
    Block.prototype.render = function (graphics)
    {
        if ((this.bgColor && this.bgColor.alpha > 0) || (this.color && this.color.alpha > 0 && this.border > 0))
        {

        }
        this.children.foreach(function (child, node)
        {
            if (child.render)
                child.render(graphics);
        });
    }

    function Button(content)
    {
        if (!content)
            content = "button";

        this.parent = null;
        this.content = content;

        this.width = 0;
        this.widthAuto = true;
        this.height = 0;
        this.heightAuto = true;
        this.x = 0;
        this.y = 0;
        this.margin = new Thickness(0);
        this.padding = new Thickness(0);
        this.horAlign = HorAlign.Left;
        this.verAlign = VerAlign.Top;

        this.color = new Color(0, 0, 0, 1.00);
        this.bgColor = new Color(0, 0, 0, 0);
        this.border = 1;
        this.radius = 5;
        this.font = new Font();

        this.collider = null;

        this.onRender = null;
        this.onClick = null;
        this.onDoubleClick = null;
        this.onMouseMove = null;
        this.onMouseDown = null;
        this.onMouseUp = null;
        this.onMouseMove = null;
        this.onTouchStart = null;
        this.onTouchEnd = null;
        this.onTouchMove = null;

        this.isPressed = false;
    }
    Button.prototype.copy = function ()
    {
        var button = new Button(this.content);
        button.parent = this.parent;
        button.width = this.width;
        button.width = this.width;
        button.widthAuto = this.widthAuto;
        button.height = this.height;
        button.heightAuto = this.heightAuto;
        button.x = this.x;
        button.y = this.y;

        button.margin = this.margin.copy();
        button.padding = this.padding.copy();
        button.horAlign = this.horAlign;
        button.verAlign = this.verAlign;

        button.color = this.color.copy();
        button.bgColor = this.bgColor.copy();
        if (this.border instanceof Thickness)
            button.border = this.border.copy();
        else
            button.border = this.border;
        button.radius = this.radius;
        button.font = this.font;

        if (this.collider && this.collider.copy)
            button.collider = this.collider.copy();
        else
            button.collider = this.collider;

        button.onClick = this.onClick;
        button.onMouseDown = this.onMouseDown;
        button.onMouseUp = this.onMouseUp;
        button.onMouseMove = this.onMouseMove;
        button.onTouchStart = this.onTouchStart;
        button.onTouchEnd = this.onTouchEnd;
        button.onTouchMove = this.onTouchMove;

        return button;
    }
    Button.prototype.render = function (graphics)
    {
        if (this.onRender)
        {
            this.onRender();
        }
        graphics.font = this.font;
        var h = parseInt(this.font.fontSize) * 1.15;//textHeight
        var w = graphics.measureText(this.content).width;//textWidth
        var x = 0, y = 0;//buttonX,buttonY
        var wx = 0, wy = 0;//textX,textY
        var mW = this.parent.width;//maxWidth
        var mH = this.parent.height;//MaxHeight

        if (this.widthAuto)
        {
            if (this.horAlign == HorAlign.Stretch)
            {
                this.width = mW - this.margin.left - this.margin.right;
                this.width = this.width < 0 ? 0 : this.width;
            }
            else
            {
                this.width = this.padding.left + w + this.padding.right;
                if (this.margin.left + this.width + this.margin.right > mW)
                {
                    this.width = mW - this.margin.left - this.margin.right;
                }
                this.width = this.width < 0 ? 0 : this.width;
            }
        }
        w = this.width - this.padding.left - this.padding.right;
        w = w < 0 ? 0 : w;
        switch (this.horAlign)
        {
            case HorAlign.Left:
                x = this.margin.left;
                break;
            case HorAlign.Right:
                x = mW - this.margin.right - this.width;
                break;
            case HorAlign.Stretch:
                x = (mW - this.margin.left - this.margin.right) / 2 - this.width / 2 + this.margin.left;
                break;
            case HorAlign.Center:
                x = (mW - this.width) / 2 + this.margin.left - this.margin.right;
                break;
        }
        if (this.heightAuto)
        {

            if (this.verAlign == VerAlign.Stretch)
            {
                this.height = mH - this.margin.top - this.margin.bottom;
                this.height = this.height < 0 ? 0 : this.height;
            }
            else
            {
                this.height = this.padding.top + h + this.padding.bottom;
                if (this.margin.top + this.height + this.margin.bottom > mH)
                {
                    this.height = mH - this.margin.top - this.margin.bottom;
                }
                this.height = this.height < 0 ? 0 : this.height;
            }
        }
        h = this.height - this.padding.top - this.padding.bottom;
        h = h < 0 ? 0 : h;
        switch (this.verAlign)
        {
            case VerAlign.Top:
                y = this.margin.top;
                break;
            case VerAlign.Bottom:
                y = mH - this.margin.bottom - this.height;
                break;
            case VerAlign.Stretch:
                y = this.margin.top;
                break;
            case VerAlign.Center:
                y = (mH - this.height) / 2 + this.margin.top + this.margin.bottom;
                break;
        }
        x += this.parent.x;
        y += this.parent.y;
        this.x = x;
        this.y = y;
        wx = x + w / 2 + this.padding.left;
        wy = y + h / 2 + this.padding.right;
        graphics.textAlign = TextAlign.Center;
        graphics.textAlign = "center";
        graphics.textBaseline = "middle";
        if (this.isPressed)
        {
            graphics.fillStyle = this.color.toString();
            graphics.fillRoundRect(x, -y, this.width, this.height, this.radius);
            graphics.strokeStyle = this.color.toString();
            graphics.strokeRoundRect(x, -y, this.width, this.height, this.radius);

            graphics.globalCompositeOperation = Graphics.CompositeOperation.Xor;
            graphics.fillStyle = this.color.toString();
            graphics.fillText(this.content, wx, -wy);
            graphics.globalCompositeOperation = Graphics.CompositeOperation.SourceOver;
            graphics.fillStyle = this.bgColor.toString();
            graphics.fillText(this.content, wx, -wy);
        }
        else
        {
            graphics.fillStyle = this.bgColor.toString();
            graphics.fillRoundRect(x, -y, this.width, this.height, this.radius);
            graphics.strokeStyle = this.color.toString();
            graphics.strokeRoundRect(x, -y, this.width, this.height, this.radius);
            graphics.fillStyle = this.color.toString();
            graphics.fillText(this.content, wx, -wy);
        }
    }
    Button.prototype.isPointIn = function (x, y)
    {
        //alert("["+this.x+","+(this.x+this.width)+"]["+this.y+","+(this.y+this.height)+"]"+x+","+y);
        if (this.x <= x && x <= this.x + this.width && this.y <= y && y <= this.y + this.height)
        {
            return true;
        }
        return false;
    }
    Button.prototype.mouseMoveCallback = function (e)
    {
        if (this.onMouseMove)
            this.onMouseMove(e);
    }
    Button.prototype.mouseDownCallback = function (e)
    {
        this.isPressed = true;
        if (this.onMouseDown)
            this.onMouseDown(e);
    }
    Button.prototype.mouseUpCallback = function (e)
    {
        var t = this.isPressed;
        this.isPressed = false;
        if (t && this.onMouseUp)
        {
            this.onMouseUp(e);
        }
    }
    Button.prototype.clickCallback = function (e)
    {
        if (this.onClick)
            this.onClick(e);
    }
    Button.prototype.doubleClickCallback = function (e)
    {
        if (this.onClick)
            this.onClick(e);
    }
    Button.prototype.touchStartCallback = function (e)
    {
        this.isPressed = true;
        if (this.onTouchStart)
            this.onTouchStart(e);
    }
    Button.prototype.touchEndCallback = function (e)
    {
        var t = this.isPressed;
        this.isPressed = false;
        if (t && this.onTouchEnd)
            this.onTouchEnd(e);
    }
    Button.prototype.touchMoveCallback = function (e)
    {
        if (this.onTouchMove)
            this.onTouchMove();
    }
    GUI.Button = Button;

    function TextBlock(text)
    {
        if (!text)
            text = "textBlock";

        this.parent = null;
        this.text = text;

        this.width = 0;
        this.widthAuto = true;
        this.height = 0;
        this.heightAuto = true;
        this.x = 0;
        this.y = 0;
        this.margin = new Thickness(0);
        this.padding = new Thickness(0);
        this.horAlign = HorAlign.Left;
        this.verAlign = VerAlign.Top;

        this.color = new Color(0, 0, 0, 1.00);
        this.borderColor = new Color(0, 0, 0, 1.00);
        this.bgColor = new Color(0, 0, 0, 0);
        this.border = new Thickness(0, 0, 0, 0);
        this.font = new Font();

        this.collider = null;

        this.onRender = null;
        this.onClick = null;
        this.onMouseDown = null;
        this.onMouseUp = null;
        this.onMouseMove = null;
        this.onTouchStart = null;
        this.onTouchEnd = null;
        this.onTouchMove = null;
    }
    TextBlock.prototype.copy = function ()
    {

        var textBlock = new Button(this.text);
        textBlock.parent = this.parent;
        textBlock.width = this.width;
        textBlock.width = this.width;
        textBlock.widthAuto = this.widthAuto;
        textBlock.height = this.height;
        textBlock.heightAuto = this.heightAuto;
        textBlock.x = this.x;
        textBlock.y = this.y;

        textBlock.margin = this.margin.copy();
        textBlock.padding = this.padding.copy();
        textBlock.horAlign = this.horAlign;
        textBlock.verAlign = this.verAlign;

        textBlock.color = this.color.copy();
        textBlock.borderColor = this.borderColor.copy();
        textBlock.bgColor = this.bgColor.copy();
        textBlock.font = this.font;

        if (this.border instanceof Thickness)
            textBlock.border = this.border.copy();
        else
            textBlock.border = this.border;

        if (this.collider && this.collider.copy)
            textBlock.collider = this.collider.copy();
        else
            textBlock.collider = this.collider;

        textBlock.onClick = this.onClick;
        textBlock.onMouseDown = this.onMouseDown;
        textBlock.onMouseUp = this.onMouseUp;
        textBlock.onMouseMove = this.onMouseMove;
        textBlock.onTouchStartthis.onTouchStart;
        textBlock.onTouchEnd = this.onTouchEnd;
        textBlock.onTouchMove = this.onTouchMove;

        return textBlock;
    }
    TextBlock.prototype.render = function (graphics)
    {
        graphics.font = this.font;
        var h = parseInt(this.font.fontSize) * 1.15;
        var w = graphics.measureText(this.text).width;
        var x = 0, y = 0;
        var wx = 0, wy = 0;
        var mW = this.parent.width;
        var mH = this.parent.height;

        if (this.widthAuto)
        {
            if (this.horAlign == HorAlign.Stretch)
            {
                this.width = mW - this.margin.left - this.margin.right;
                this.width = this.width < 0 ? 0 : this.width;
            }
            else
            {
                this.width = this.padding.left + w + this.padding.right;
                if (this.margin.left + this.width + this.margin.right > mW)
                {
                    this.width = mW - this.margin.left - this.margin.right;
                }
                this.width = this.width < 0 ? 0 : this.width;
            }
        }
        w = this.width - this.padding.left - this.padding.right;
        w = w < 0 ? 0 : w;
        switch (this.horAlign)
        {
            case HorAlign.Left:
                x = this.margin.left;
                break;
            case HorAlign.Right:
                x = mW - this.margin.right - this.width;
                break;
            case HorAlign.Stretch:
                x = (mW - this.margin.left - this.margin.right) / 2 - this.width / 2 + this.margin.left;
                break;
            case HorAlign.Center:
                x = (mW - this.width) / 2 + this.margin.left - this.margin.right;
                break;
        }
        if (this.heightAuto)
        {

            if (this.verAlign == VerAlign.Stretch)
            {
                this.height = mH - this.margin.top - this.margin.bottom;
                this.height = this.height < 0 ? 0 : this.height;
            }
            else
            {
                this.height = this.padding.top + h + this.padding.bottom;
                if (this.margin.top + this.height + this.margin.bottom > mH)
                {
                    this.height = mH - this.margin.top - this.margin.bottom;
                }
                this.height = this.height < 0 ? 0 : this.height;
            }
        }
        h = this.height - this.padding.top - this.padding.bottom;
        h = h < 0 ? 0 : h;
        switch (this.verAlign)
        {
            case VerAlign.Top:
                y = this.margin.top;
                break;
            case VerAlign.Bottom:
                y = mH - this.margin.bottom - this.height;
                break;
            case VerAlign.Stretch:
                y = this.margin.top;
                break;
            case VerAlign.Center:
                y = (mH - this.height) / 2 + this.margin.top + this.margin.bottom;
                break;
        }
        x += this.parent.x;
        y += this.parent.y;
        this.x = x;
        this.y = y;
        wx = x + w / 2 + this.padding.left;
        wy = y + h / 2 + this.padding.right;

        if (this.onRender)
        {
            var args = { target: this, x: x, y: y, width: w, height: h, cancle: false };
            this.onRender(args);
            if (args.cancle)
                return;
            w = args.width;
            h = args.height;
            wx = args.x;
            wy = args.y;
        }

        graphics.textAlign = TextAlign.Center;
        graphics.font = this.font;
        graphics.fillStyle = this.bgColor.toString();
        //graphics.fillRoundRect(x, -y, this.width, this.height, this.radius);
        graphics.strokeStyle = this.borderColor.toString();

        graphics.lineCap = Graphics.LineCap.Butt;

        //top
        if (this.border.top > 0)
        {
            graphics.lineWidth = this.border.top;
            graphics.drawLine(x, -y, x + this.width, -y);
        }
        //right
        if (this.border.right > 0)
        {
            graphics.lineWidth = this.border.right;
            graphics.drawLine(x + this.width, -y, x + this.width, -(y + this.height));
        }
        //bottom
        if (this.border.bottom > 0)
        {
            graphics.lineWidth = this.border.bottom;
            graphics.drawLine(x + this.width, -(y + this.height), x, -(y + this.height));
        }
        //left
        if (this.border.left > 0)
        {
            graphics.lineWidth = this.border.left;
            graphics.drawLine(x, -(y + this.height), x, -y);
        }

        graphics.fillStyle = this.color.toString();
        graphics.textAlign = "center";
        graphics.textBaseline = "middle";
        graphics.fillText(this.text, wx, wy);
    }
    TextBlock.prototype.isPointIn = function (x, y)
    {
        if (this.x <= x && x <= this.x + this.width && this.y <= y && y <= this.y + this.height)
        {
            return true;
        }
        return false;
    }
    TextBlock.prototype.mouseDownCallback = function (e)
    {

    }
    TextBlock.prototype.mouseUpCallback = function (e)
    {

    }
    TextBlock.prototype.clickCallback = function (e)
    {

    }
    TextBlock.prototype.touchStartCallback = function (e)
    {

    }
    TextBlock.prototype.touchEndCallback = function (e)
    {

    }
    TextBlock.prototype.touchMoveCallback = function (e)
    {

    }


    GUI.TextBlock = TextBlock;

    function Joystick()
    {
        this.margin = new Thickness(0);
        this.padding = new Thickness(0);
        this.horAlign = HorAlign.Left;
        this.verAlign = VerAlign.Top;
        this.width = 0;
        this.height = 0;
        this.content = "";
        this.color = new Color(0, 0, 0, 1.00);
        this.bgColor = new Color(0, 0, 0, 0);
        this.border = 1;
        this.font = new Font();
        this.onClick = null;
    }
    GUI.Joystick = Joystick;

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
        this.shadowBlur = "#000000";
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
        if (reg.test(str))
        {
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
        if (reg.test(str))
        {
            var colorArray = str.replace("rgb(", "").replace(")", "").split(",");
            var r = parseInt(colorArray[0]);
            var g = parseInt(colorArray[1]);
            var b = parseInt(colorArray[2]);
            var a = 1.00;
            return new Color(r, g, b, a);
        }
        reg = new RegExp("rgba\\(([0-9]+(\\.[0-9]+){0,1}),([0-9]+(\\.[0-9]+){0,1}),([0-9]+(\\.[0-9]+){0,1}),([0-9]+(\\.[0-9]+){0,1})\\)");
        if (reg.test(str))
        {
            var colorArray = str.replace("rgba(", "").replace(")", "").split(",");
            var r = parseInt(colorArray[0]);
            var g = parseInt(colorArray[1]);
            var b = parseInt(colorArray[2]);
            var a = parseFloat(colorArray[3]);
            return new Color(r, g, b, a);
        }
        switch (str)
        {
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
    if (!(window.Color && window.Color.version && window.Color.version > 2.0))
    {
        window.Color = Color;
    }

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
        if (this.count <= 0)
        {
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
        if (!(node instanceof LinkList.Node))
        {
            for (var p = this.head ; p != null; p = p.next)
            {
                if (p.object == node)
                    node = p;
            }
        }
        if (node.parent != this)
        {
            throw new Error("The node doesn't belong to this link list");
        }
        if (node.last == null)
        {
            this.head = node.next;
        }
        else
            node.last.next = node.next;
        if (node.next == null)
        {
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
        for (var p = this.head; p; p = p.next)
        {
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
    if (!window.LinkList || !window.LinkList.version || window.LinkList.version < LinkList.version)
    {
        window.LinkList = LinkList;
    }

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

    //Force
    function Force(x, y, f)
    {
        this.x = 0;
        this.y = 0;
        if (x == undefined)
            return;
        if (x instanceof Vector2)
        {
            this.x = x.x;
            this.y = x.y;
        }
        else if (f)
        {
            var l = Math.sqrt(x * x + y * y);
            this.x = x * f / l;
            this.y = y * f / l;
        }
        else
        {
            this.x = x;
            this.y = y;
        }
    }
    Force.prototype.copy = function ()
    {
        return new Force(this.x, this.y, this.f);
    }
    Force.prototype.toString = function ()
    {
        return "(" + this.x + "," + this.y + ")";
    }
    Force.prototype.getValue = function ()
    {
        return Math.sqrt(this.x * this.x + this.y * this.y);
    }
    Force.prototype.toAcceleration = function (m)
    {
        return new Vector(this.x / m, this.y / m);
    }
    Engine.Force = Force;
    window.Force = Force;

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
    Mouse.Buttons = {};
    Mouse.Buttons.Left = 0;
    Mouse.Buttons.Wheel = 1;
    Mouse.Buttons.Right = 2;
    Mouse.ButtonState = {};
    Mouse.ButtonState.None = 0;
    Mouse.ButtonState.Pressed = 1;
    Mouse.ButtonState.Released = 2;
    Mouse.ButtonState.Click = 3;
    Mouse.ButtonState.DoubleClick = 4;
    Mouse.ButtonState.Rolled = 8;
    function MouseEventArgs()
    {
        this.x = 0;
        this.y = 0;
        this.dx = 0;
        this.dy = 0;
        this.wheelDelta = 0;
        this.button = null;
        this.buttonState = Mouse.ButtonState.None;
        this.handled = false;
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
        this.ctrl = false;
        this.alt = false;
        this.shift = false;
        this.handled = false;
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

    //-------------------------Objects
    //-------Vector2
    function Vector2(x, y)
    {
        this.x = x;
        this.y = y;
        this.coordinate = Coordinate.Default;
    }
    Vector2.fromPoint = function (p1, p2)
    {
        return new Vector2(p2.x - p1.x, p2.y - p1.y);
    }
    Vector2.prototype.copy = function ()
    {
        var v = new Vector2(this.x, this.y);
        v.coordinate = this.coordinate;
        return v;
    }
    Vector2.prototype.toString = function ()
    {
        return "(" + this.x + "," + this.y + ")";
    }
    Vector2.prototype.setCoordinate = function (coordinate)
    {
        this.coordinate = coordinate;
    }
    Vector2.prototype.changeCoordinate = function (coordinate)
    {
        var v = this.coordinate.vectorMapTo(coordinate, this.x, this.y);
        this.x = v.x;
        this.y = v.y;
        this.coordinate = coordinate;
    }
    Vector2.prototype.getLength = function ()
    {
        return Math.sqrt(this.x * this.x + this.y * this.y);
    }
    Vector2.prototype.rotate = function (rad)
    {
        var x = this.x;
        var y = this.y;
        this.x = x * Math.cos(rad) - y * Math.sin(rad);
        this.y = y * Math.cos(rad) + x * Math.sin(rad);
    }
    Vector2.prototype.mod = function ()
    {
        return Math.sqrt(this.x * this.x + this.y * this.y);
    }
    Vector2.prototype.plus = function (v)
    {
        if (!(v instanceof Vector2))
            throw new Error("v must be a Vector");
        this.x = this.x + v.x;
        this.y = this.y + v.y;
        return this;
    }
    Vector2.prototype.minus = function (v)
    {
        if (!(v instanceof Vector2))
            throw new Error("v must be a Vector");
        this.x = this.x - v.x;
        this.y = this.y - v.y;
        return this;
    }
    Vector2.prototype.multi = function (n)
    {
        if (!isNaN(n))
        {
            this.x *= n;
            this.y *= n;
            return this;
        }
    }
    Vector2.prototype.toLine = function (x, y)
    {
        return new Line(new Point(x, y), new Point(x + this.x, y + this.y));
    }
    Vector2.plus = function (u, v)
    {
        if (!(u instanceof Vector2) || !(u instanceof Vector2))
        {
            throw new Error("u and v must be an Vector2.");
        }
        return new Vector2(u.x + v.x, u.y + v.y);
    }
    Vector2.minus = function (u, v)
    {
        if (!(u instanceof Vector2) || !(u instanceof Vector2))
        {
            throw new Error("u and v must be an Vector2.");
        }
        return new Vector2(u.x - v.x, u.y - v.y);
    }
    Vector2.multi = function (u, v)
    {
        if (!(u instanceof Vector2))
        {
            throw new Error("u must be an Vector2.");
        }
        if (v instanceof Vector2)
        {
            return (u.x * v.x + u.y * v.y);
        }
        else if (!isNaN(v))
        {
            return (new Vector2(u.x * v, u.y * v));
        }
    }
    Engine.Vector2 = Vector2;
    window.Vector2 = Vector2;

    //-------Point
    function Point(x, y)
    {
        if (isNaN(x) || isNaN(y))
            throw "x and y must be numbers.";
        this.x = x;
        this.y = y;
        this.coordinate = Coordinate.Default;
    }
    Point.Distance = function (p1, p2)
    {
        return Math.sqrt((p1.x - p2.x) * (p1.x - p2.x) + (p1.y - p2.y) * (p1.y - p2.y));
    }
    Point.prototype.copy = function ()
    {
        var p = new Point(this.x, this.y);
        p.coordinate = this.coordinate;
        return p;
    }
    Point.prototype.toString = function ()
    {
        return "(" + this.x + "," + this.y + ")";
    }
    Point.prototype.setCoordinate = function (coordinate)
    {
        this.coordinate = coordinate;
    }
    Point.prototype.changeCoordinate = function (coordinate)
    {
        var p = this.coordinate.pointMapTo(coordinate, this.x, this.y);
        this.x = p.x;
        this.y = p.y;
        this.coordinate = coordinate;
    }
    Point.prototype.rotate = function (rad, x0, y0)
    {
        //alert(this+"->"+rad);
        var x = this.x - x0;
        var y = this.y - y0;
        var dx = x * Math.cos(rad) - y * Math.sin(rad);
        var dy = y * Math.cos(rad) + x * Math.sin(rad);
        this.x = x0 + dx;
        this.y = y0 + dy;
        //alert(this);
    }
    Point.prototype.isBelongTo = function (l)
    {
        if (!(this.lines instanceof Array))
            throw "this object has something wrong.";
        for (var i = 0; i < this.lines.length; i++)
        {
            if (this.lines[i] == l)
                return true;
        }
        return false;
    }
    Point.prototype.addLine = function (l)
    {
        if (!(this.lines instanceof Array))
            throw "this object has something wrong.";
        this.lines[this.lines.length] = l;
    }
    Point.prototype.render = function (graphics, x, y, r, dt)
    {

    }
    Engine.Point = Point;
    window.Point = Point;

    //Position
    function Position(x, y)
    {
        this.onChange = null;
        this.changeCallback = null;
        this.coordinate = Coordinate.Default;
        this.innerX = x;
        this.innerY = y;
        var position = this;
        Object.defineProperty(this, "x", {
            get: function ()
            {
                return position.innerX;
            },
            set: function (value)
            {
                if (position.onChange)
                {
                    args = { changed: "y", x: value, y: position.innerY, cancle: false };
                    position.onChange(args);
                    if (args.cancle)
                        return;
                }
                if (position.changeCallback)
                {
                    args = { changed: "y", x: value, y: position.innerY, cancle: false };
                    position.changeCallback(args);
                    if (args.cancle)
                        return;
                }
                position.innerX = value;
            }
        });
        Object.defineProperty(this, "y", {
            get: function ()
            {
                return position.innerY;
            },
            set: function (value)
            {
                if (position.onChange)
                {
                    args = { changed: "y", x: position.innerX, y: value, cancle: false };
                    position.onChange(args);
                    if (args.cancle)
                        return;
                }
                if (position.changeCallback)
                {
                    args = { changed: "y", x: position.innerX, y: value, cancle: false };
                    position.changeCallback(args);
                    if (args.cancle)
                        return;
                }
                position.innerY = value;
            }
        })
    }
    Position.prototype.copy = function ()
    {
        var pos = new Position(this.innerX, this.innerY);
        pos.setCoordinate(this.coordinate);
        return pos;
    }
    Position.prototype.setCoordinate = function (coordinate)
    {
        this.coordinate = coordinate;
    }
    Position.prototype.changeCoordinate = function (coordinate)
    {
        var p = this.coordinate.pointMapTo(coordinate, this.x, this.y);
        this.innerX = p.x;
        this.innerY = p.y;
        this.coordinate = coordinate;
    }
    Position.prototype.rotate = function (rad, x0, y0)
    {
        var x = this.innerX - x0;
        var y = this.innerY - y0;
        var dx = x * Math.cos(rad) - y * Math.sin(rad);
        var dy = y * Math.cos(rad) + x * Math.sin(rad);
        this.innerX = x0 + dx;
        this.innerY = y0 + dy;
    }
    Engine.Position = Position;

    //-------Line
    function Line(_p1, _p2)
    {
        var p1 = _p1, p2 = _p2;
        if ((_p1 instanceof Vector2) && (_p2 instanceof Vector2))
        {
            p1 = new Point(_p1.x, _p1.y, this);
            p2 = new Point(_p2.x, _p2.y, this);
        }
        /*else if (!(p1.x && !isNaN(p1.x) && p1.y && !isNaN(p1.y) &&
            p2.x && !isNaN(p2.x) && p2.y && !isNaN(p2.y)))
        {
            throw new Error("P1 or P2 is not a Point.");
        }
        else if (!(p1 instanceof Point) || !(p2 instanceof Point))
        {
            
            throw new Error("P1 or P2 is not a Point.");
        }*/
        this.p1 = p1;
        this.p2 = p2;
        this.center = new Point((p1.x + p2.x) / 2, (p1.y + p2.y) / 2);
        this.position = new Point((p1.x + p2.x) / 2, (p1.y + p2.y) / 2);
        this.coordinate = Coordinate.Default;
        this.strokeStyle = new Color(0, 0, 0, 1.00);
        this.strokeWidth = 1;
    }
    Line.prototype.copy = function ()
    {
        var p1 = this.p1.copy();
        var p2 = this.p2.copy();
        var line = new Line(p1, p2);
        line.setCenter(this.center.x, this.center.y);
        line.position = this.position.copy();
        line.coordinate = this.coordinate;
        if (this.strokeStyle.copy)
            line.strokeStyle = this.strokeStyle.copy();
        else
            line.strokeStyle = this.strokeStyle;
        line.strokeWidth = this.strokeWidth;
        return line;
    }
    Line.prototype.setCoordinate = function (coordinate)
    {
        this.coordinate = coordinate;
        this.position.setCoordinate(coordinate);
        this.center.setCoordinate(coordinate);
        this.p1.setCoordinate(coordinate);
        this.p2.setCoordinate(coordinate);
    }
    Line.prototype.changeCoordinate = function (coordinate)
    {
        this.p1.changeCoordinate(coordinate);
        this.p2.changeCoordinate(coordinate);
        this.center.changeCoordinate(coordinate);
        this.position.changeCoordinate(coordinate);
        this.coordinate = coordinate;
    }
    Line.prototype.setCenter = function (x, y)
    {
        this.center.x = x;
        this.center.y = y;
    }
    Line.prototype.moveTo = function (x, y)
    {
        if (x == this.position.x && y == this.position.y)
            return;
        var dx = x - this.position.x;
        var dy = y - this.position.y;
        this.p1.x += dx;
        this.p1.y += dy;
        this.p2.x += dx;
        this.p2.y += dy;
        this.center.x += dx;
        this.center.y += dy;
        this.position.x = x;
        this.position.y = y;
    }
    Line.prototype.rotate = function (rad, x, y)
    {
        if (isNaN(x) || isNaN(y))
        {
            x = this.center.x;
            y = this.center.y;
        }
        this.p1.rotate(rad, x, y);
        this.p2.rotate(rad, x, y);
    }
    Line.prototype.isCross = function (obj)
    {
        if (obj instanceof Line)
        {
            var p1 = this.p1;
            var p2 = this.p2;
            var p3 = obj.p1;
            var p4 = obj.p2;
            var v13 = new Vector2(p3.x - p1.x, p3.y - p1.y);
            var v14 = new Vector2(p4.x - p1.x, p4.y - p1.y);
            var v31 = new Vector2(p1.x - p3.x, p1.y - p3.y);
            var v32 = new Vector2(p2.x - p3.x, p2.y - p3.y);
            var v12 = new Vector2(p2.x - p1.x, p2.y - p1.y);
            var v34 = new Vector2(p4.x - p3.x, p4.y - p3.y);
            if ((v13.x * v12.y - v12.x * v13.y) * (v14.x * v12.y - v12.x * v14.y) < 0 && (v31.x * v34.y - v34.x * v31.y) * (v32.x * v34.y - v34.x * v32.y) < 0)
                return true;
            return false;
        }
        else if (obj instanceof Circle)
        {
            var v1 = new Vector2(obj.o.x - this.p1.x, obj.o.y - this.p1.y);
            var v2 = new Vector2(this.p2.x - this.p1.x, this.p2.y - this.p1.y);
            var v3 = new Vector2(obj.o.x - this.p2.x, obj.o.y - this.p2.y);
            var v4 = new Vector2(-v2.x, -v2.y);
            var d1 = (obj.o.x - this.p1.x) * (obj.o.x - this.p1.x) + (obj.o.y - this.p1.y) * (obj.o.y - this.p1.y);
            d1 = (d1 <= obj.r * obj.r) ? 1 : 0;
            var d2 = (obj.o.x - this.p2.x) * (obj.o.x - this.p2.x) + (obj.o.y - this.p2.y) * (obj.o.y - this.p2.y);
            d2 = (d2 <= obj.r * obj.r) ? 1 : 0;
            if (d1 ^ d2)
                return true;
            if (d1 && d2)
                return false;
            if ((v1.x * v2.x + v1.y * v2.y < 0) || (v3.x * v4.x + v3.y * v4.y < 0))
            {
                return false;
            }
            if (v3.x * v4.x + v3.y * v4.y < 0)
            {

            }
            var x = v1.x * v2.y - v2.x * v1.y;
            var l = v2.x * v2.x + v2.y * v2.y;
            l = l * obj.r * obj.r;
            x *= x;

            if (x <= l)
                return true;
            return false;
        }
        else if (obj instanceof Rectangle)
        {
            for (var i = 0; i < obj.E.length; i++)
            {
                if (this.isCross(obj.E[i]))
                    return true;
            }
            return false;
        }
        else if (obj instanceof Polygon)
        {
            for (var i = 0; i < obj.E.length; i++)
            {
                if (this.isCross(obj.E[i]))
                    return true;
            }
            return false;
        }
        else if (obj instanceof Particle)
        {
            return obj.isCollideWith(this, 0, 0);
        }
    }
    Line.prototype.render = function (graphics, x, y, r, dt)
    {
        var p1 = this.p1.coordinate.pFrom(this.p1.x, this.p1.y);
        var p2 = this.p2.coordinate.pFrom(this.p2.x, this.p2.y);
        graphics.beginPath();
        graphics.moveTo(p1.x, p1.y);
        graphics.lineTo(p2.x, p2.y);
        graphics.strokeStyle = this.strokeStyle;
        graphics.strokeWidth = this.strokeWidth;
        graphics.stroke();
    }
    Line.prototype.toGameObject = function ()
    {
        var obj = new GameObject();
        obj.graphic = this;
        return obj;
    }
    Engine.Line = Line;
    window.Line = Line;

    function Arc(r, startAng, endAng, antiCW)
    {
        this.o = new Point(0, 0);
        this.position = new Point(0, 0);
        this.coordinate = Coordinate.Default;
        this.r = r;
        this.start = startAng;
        this.end = endAng;
        this.antiCW = antiCW;
        this.strokeStyle = new Color(0, 0, 0, 1);
        this.fillStyle = new Color(255, 255, 255, 0);
        this.strokeWidth = 1;
        this.lineCap = Graphics.LineCap.Square;
    }
    Arc.prototype.copy = function ()
    {
        var arc = new Arc(this.r, this.start, this.end, this.antiCW);
        arc.o = this.o.copy();
        arc.position = this.position.copy();
        arc.coordinate = this.coordinate;
        arc.strokeStyle = this.strokeStyle.copy ? this.strokeStyle.copy() : this.strokeStyle;
        arc.fillStyle = this.fillStyle.copy ? this.fillStyle.copy() : this.fillStyle;
        arc.strokeWidth = this.strokeWidth;
        return arc;
    }
    Arc.prototype.setCoordinate = function (coordinate)
    {
        this.o.setCoordinate(coordinate);
        this.position.setCoordinate(coordinate);
        this.coordinate = coordinate;
    }
    Arc.prototype.changeCoordinate = function (coordinate)
    {
        this.o.changeCoordinate(coordinate);
        this.position.changeCoordinate(coordinate);
        this.coordinate = coordinate;
    }
    Arc.prototype.rotate = function (ang, o)
    {
        this.o.rotate(o, ang);
        this.start += ang;
        this.end += ang;
    }
    Arc.prototype.render = function (graphics, x, y, r, dt)
    {
        var o = this.o.coordinate.pFrom(this.o.x, this.o.y);
        graphics.beginPath();
        graphics.arc(o.x, o.y, this.r, this.start, this.end, this.antiCW);
        graphics.lineCap = this.lineCap;
        graphics.strokeWidth = this.strokeWidth;
        graphics.strokeStyle = this.strokeStyle;
        graphics.fillStyle = this.fillStyle;
        graphics.fill();
        graphics.stroke();
    }
    Engine.Arc = Arc;
    window.Arc = Arc;

    //Font
    function Font(fontFamily, fontSize)
    {
        fontFamily = fontFamily ? fontFamily : "sans-serif";
        fontSize = fontSize || fontSize == 0 ? fontSize : "10px";
        this.fontFamily = fontFamily;
        this.fontSize = fontSize;
        this.fontStyle = FontStyle.Normal;
        this.fontVariant = FontVariant.Normal;
        this.fontWeight = FontWeight.Normal;
        this.caption = "";
        this.icon = "";
        this.menu = "";
        this.messageBox = "";
        this.smallCaption = "";
        this.statusBar = "";
    }
    Font.prototype.copy = function ()
    {
        var f = new Font(this.fontFamily, this.fontSize);
        f.fontStyle = this.fontStyle;
        f.fontVariant = this.fontVariant;
        f.fontWeight = this.fontWeight;
        f.caption = this.caption;
        f.icon = this.icon;
        f.menu = this.menu;
        f.messageBox = this.messageBox;
        f.smallCaption = this.smallCaption;
        f.statusBar = this.statusBar;
        return f;
    }
    Font.prototype.toString = function ()
    {
        return this.fontStyle + " " + this.fontVariant + " " + this.fontWeight + " " + this.fontSize + "px " + this.fontFamily;
    }
    window.Font = Font;
    function FontStyle() { }
    FontStyle.Normal = "normal";
    FontStyle.Italic = "italic";
    FontStyle.Oblique = "oblique";
    window.FontStyle = FontStyle;
    function FontVariant() { }
    FontVariant.Normal = "normal";
    FontVariant.SmallCaps = "small-caps";
    window.FontVariant = FontVariant;
    function FontWeight() { }
    FontWeight.Normal = "normal";
    FontWeight.Bold = "bold";
    FontWeight.Bolder = "bolder";
    FontWeight.Lighter = "lighter";
    window.FontWeight = FontWeight;
    function TextAlign() { }
    TextAlign.Start = "start";
    TextAlign.End = "end";
    TextAlign.Center = "center";
    TextAlign.Left = "left";
    TextAlign.Right = "right";
    window.TextAlign = TextAlign;
    function TextBaseline() { }
    TextBaseline.Alphabetic = "alphabetic";
    TextBaseline.Top = "top";
    TextBaseline.Hanging = "hanging";
    TextBaseline.Middle = "middle";
    TextBaseline.Ideographic = "ideographic";
    TextBaseline.Bottom = "bottom";
    window.TextBaseline = TextBaseline;

    //Text
    function Text(text)
    {
        this.text = text;
        this.font = new Font("sans-serif", 16);
        this.position = new Point(0, 0);
        this.coordinate = Coordinate.Default;
        this.center = new Point(0, 0);
        this.fillStyle = new Color(0, 0, 0, 1);
        this.strokeStyle = new Color(255, 255, 255, 0);
        this.onRender = null;
    }
    Text.prototype.copy = function ()
    {
        var text = new Text(this.text);
        text.font = this.font.copy();
        text.position = this.position.copy();
        text.coordinate = this.coordinate;
        text.center = this.center.copy();
        text.onRender = this.onRender;
        if (this.fillStyle && this.fillStyle.copy)
            text.fillStyle = this.fillStyle.copy();
        else
            text.fillStyle = this.fillStyle;
        if (this.strokeStyle && this.strokeStyle.copy)
            text.strokeStyle = this.strokeStyle.copy();
        else
            text.strokeStyle = this.strokeStyle;
        return text;
    }
    Text.prototype.setCoordinate = function (coordinate)
    {
        this.position.setCoordinate(coordinate);
        this.center.setCoordinate(coordinate);
        this.coordinate = coordinate;
    }
    Text.prototype.changeCoordinate = function (coordinate)
    {
        this.position.changeCoordinate(coordinate);
        this.center.changeCoordinate(coordinate);
        this.coordinate = coordinate;
    }
    Text.prototype.setCenter = function (x, y, align)
    {
        this.position = new Point(x, y);
        if (!align)
            throw new Error("未指定对齐方式");
        this.center = align(this.width, this.height);
        this.center.x = x - this.center.x;
        this.center.y = y + this.center.y;
    }
    Text.prototype.moveTo = function (x, y)
    {
        var rx = this.position.x;
        var ry = this.position.y;
        this.position.x = x;
        this.position.y = y;
        this.center.x = this.center.x - rx + x;
        this.center.y = this.center.y - ry + y;
    }
    Text.prototype.drawToCanvas = function (canvas, x, y, r, dt)
    {
        var ctx = canvas.getContext("2d");
        ctx.font = this.fontStyle + " "
                 + this.fontVariant + " "
                 + this.fontWeight + " "
                 + this.fontSize + "px "
                 + this.fontFamily;
        ctx.fillStyle = this.fillStyle;
        ctx.strokeStyle = this.strokeStyle;
        ctx.fillText(this.text, x, y);
        ctx.strokeText(this.text, x, y);
    }
    Text.prototype.render = function (graphics, x, y, r, dt)
    {
        if (!graphics || !graphics.ctx)
            return;
        if (this.onRender)
            this.onRender();
        var center = this.center.coordinate.pFrom(this.center.x, this.center.y);
        graphics.textAlign = TextAlign.Left;
        graphics.textBaseline = TextBaseline.Top;
        graphics.font = this.font;
        graphics.fillStyle = this.fillStyle;
        graphics.strokeStyle = this.strokeStyle;
        graphics.fillText(this.text, center.x, center.y);
        graphics.strokeText(this.text, center.x, center.y);
    }
    Engine.Text = Text;
    window.Text = Text;

    //Image
    function Image(img)
    {
        if (!img)
            img = new window.Image();
        this.img = img;
        this.position = new Position(0, 0);
        this.center = new Position(0, 0);
        this.coordinate = Coordinate.Default;
        this.o = new Point(0, 0);
        this.rotation = 0;
        this.onRender = null;

        var obj = this;
        this.setPosition(0, 0);
        Object.defineProperty(this, "width", {
            get: function ()
            {
                return obj.img.width;
            },
            set: function (value)
            {
                obj.img.width = value;
            }
        });
        Object.defineProperty(this, "height", {
            get: function ()
            {
                return obj.img.height;
            },
            set: function (value)
            {
                obj.img.height = value;
            }
        });
    }
    Image.fromUrl = function (url, width, height)
    {
        var img = new window.Image();
        var image = new Image(img);
        image.o.x = -width / 2;
        image.o.y = height / 2;
        img.onload = function ()
        {
            if (isNaN(width) || isNaN(height))
            {
                width = img.width;
                height = img.height;
            }
            image.width = width;
            image.height = height;
            image.o.x = -img.width / 2;
            image.o.y = img.height / 2;

            img.onload = null;
        }
        img.src = url;
        return image;
    }
    Image.prototype.copy = function ()
    {
        var img = new Engine.Image(this.img);
        var image = this;
        img.setPosition(this.position.x, this.position.y);
        img.setCenter(this.center.x, this.center.y);
        img.o = this.o.copy();
        img.coordinate = this.coordinate;
        img.onRender = this.onRender;
        return img;
    }
    Image.prototype.setCoordinate = function (coordinate)
    {
        this.o.setCoordinate(coordinate);
        this.center.setCoordinate(coordinate);
        this.position.setCoordinate(coordinate);
        this.coordinate = coordinate;
    }
    Image.prototype.changeCoordinate = function (coordinate)
    {
        //this.o.changeCoordinate(coordinate);
        this.position.changeCoordinate(coordinate);
        this.center.changeCoordinate(coordinate);
        this.coordinate = coordinate;
    }
    Image.prototype.setCenter = function (x, y)
    {
        var dx = x - this.center.x;
        var dy = y - this.center.y;
        this.o.x -= dx;
        this.o.y -= dy;
        this.center = new Position(x, y);
    }
    Image.prototype.setPosition = function (x, y)
    {
        this.position = new Position(x, y);
        var image = this;
        this.position.changeCallback = function (e)
        {
            var dx = e.x - image.position.x;
            var dy = e.y - image.position.y;
            image.center.x += dx;
            image.center.y += dy;
        }
    }
    Image.prototype.move = function (x, y)
    {

    }
    Image.prototype.moveTo = function (x, y)
    {
        this.position.x = x;
        this.position.y = y;
    }
    Image.prototype.rotate = function (angle, x, y)
    {
        if (isNaN(x) || isNaN(y))
        {
            x = this.center.x;
            y = this.center.y;
        }
        this.position.rotate(angle, x, y);
        this.center.rotate(angle, x, y);
        this.rotation += angle;
    }
    Image.prototype.rotateTo = function (angle, x, y)
    {
        if (!isNaN(x) && !isNaN(y))
        {
            this.position.rotate(angle - this.rotation, x, y);
            this.center.rotate(angle - this.rotation, x, y);
        }
        this.rotation = angle;
    }
    Image.prototype.render = function (graphics, x, y, r, dt)
    {
        if (!graphics)
            return;
        if (this.onRender)
            this.onRender();
        var o = this.center.coordinate.pFrom(this.center.x, this.center.y);
        o.x += this.o.x;
        o.y += this.o.y;
        if (this.rotation)
        {
            //I cannot understand now.
            graphics.rotate(this.rotation, this.center.x, this.center.y);
            //graphics.drawImage(this.img, this.center.x, this.center.y, this.width, this.height);
            graphics.drawImage(this.img, o.x, o.y, this.width, this.height);
            graphics.rotate(-this.rotation, this.center.x, this.center.y);
        }
        else
        {
            graphics.drawImage(this.img, o.x, o.y, this.width, this.height);
        }
    }
    Engine.Image = Image;

    //Path
    function Path()
    {
        this.pList = (function ()
        {
            var list = [];
            list.add = function (p)
            {
                list[list.length] = p;
            }
            list.remove = function (index)
            {
                for (var i = index + 1; i < list.length; i++)
                {
                    list[i - 1] = list[i];
                }
                list.pop();
            }
            list.clear = function ()
            {
                while (list.length)
                {
                    list.pop();
                }
            }
            list.last = function ()
            {
                return list[list.length - 1];
            }
            return list;
        })();
        this.position = new Point(0, 0);
        this.coordinate = Coordinate.Default;
        this.center = this.position;
        this.strokeStyle = new Color(0, 0, 0, 1);
        this.fillStyle = new Color(255, 255, 255, 1);
        this.strokeWidth = 1;
    }
    Path.Point = function (x, y)
    {
        this.x = x;
        this.y = y;
        this.coordinate = Coordinate.Default;
        this.cp1 = new Point(x, y);
        this.cp2 = new Point(x, y);
    }
    Path.Point.prototype.copy = function ()
    {
        var p = new Path.Point(this.x, this.y);
        p.coordinate = this.coordinate;
        p.cp1 = this.cp1.copy();
        p.cp2 = this.cp2.copy();
        return p;
    }
    Path.Point.prototype.setCoordinate = function (coordinate)
    {
        this.cp1.setCoordinate(coordinate);
        this.cp2.setCoordinate(coordinate);
        this.coordinate = coordinate;
    }
    Path.Point.prototype.changeCoordinate = function (coordinate)
    {
        this.cp1.changeCoordinate(coordinate);
        this.cp2.changeCoordinate(coordinate);
        var p = this.coordinate.pointMapTo(coordinate);
        this.x = p.x;
        this.y = p.y;
        this.coordinate = coordinate;
    }
    Path.Point.prototype.moveTo = function (x, y)
    {
        var dx = x - this.x;
        var dy = y - this.y;
        this.cp1.x += dx;
        this.cp1.y += dy;
        this.cp2.x += dx;
        this.cp2.y += dy;
        this.x = x;
        this.y = y;
    }
    Path.prototype.copy = function ()
    {
        var path = new Path();
        path.coordinate = this.coordinate;
        for (var i = 0; i < this.pList.length; i++)
        {
            path.pList[i] = this.pList[i].copy();
        }
        return path;
    }
    Path.prototype.setCoordinate = function (coordinate)
    {
        for (var i = 0; i < this.pList; i++)
        {
            this.pList[i].setCoordinate(coordinate);
        }
        this.position.setCoordinate(coordinate);
        this.center.setCoordinate(coordinate);
        this.coordinate = coordinate;
    }
    Path.prototype.changeCoordinate = function (coordinate)
    {
        for (var i = 0; i < this.pList; i++)
        {
            this.pList[i].changeCoordinate(coordinate);
        }
        this.position.changeCoordinate(coordinate);
        this.center.changeCoordinate(coordinate);
        this.coordinate = coordinate;
    }
    Path.prototype.setCenter = function (x, y)
    {
        if (!isNaN(x) && !isNaN(y))
        {
            this.position.x = x;
            this.position.y = y;
            this.center = this.position;
        }
    }
    Path.prototype.moveTo = function (x, y)
    {
        var dx = x - this.position.x;
        var dy = y - this.position.y;
        for (var i = 0; i < this.pList.length; i++)
        {
            this.pList[i].moveTo(this.pList[i].x + dx, this.pList[i].y + dy);
        }
        this.position.x = x;
        this.position.y = y;
    }
    Path.prototype.close = function ()
    {
        if (this.pList.length)
            this.pList.add(this.pList[0]);
    }
    Path.prototype.render = function (graphics, x, y, r, dt)
    {
        graphics.beginPath();
        for (var i = 0; i < this.pList.length - 1; i++)
        {
            var p1 = this.pList[i].coordinate.pFrom(this.pList[i].x, this.pList[i].y);
            p1.cp2 = this.pList[i].cp2.coordinate.pFrom(this.pList[i].cp2.x, this.pList[i].cp2.y);
            var p2 = this.pList[i + 1].coordinate.pFrom(this.pList[i + 1].x, this.pList[i + 1].y);
            p2.cp1 = this.pList[i + 1].cp1.coordinate.pFrom(this.pList[i + 1].cp1.x, this.pList[i + 1].cp1.y);

            graphics.lineTo(p1.x, p1.y);
            graphics.bezierCurveTo(p1.cp2.x, p1.cp2.y, p2.cp1.x, p2.cp1.y, p2.x, p2.y);
        }
        if (this.pList.last() == this.pList[0])
            graphics.closePath();
        graphics.fillStyle = this.fillStyle.toString();
        graphics.strokeStyle = this.strokeStyle.toString();
        graphics.lineWidth = this.strokeWidth;
        graphics.fill();
        graphics.stroke();
    }
    Engine.Path = Path;
    window.Path = Path;

    //Combination
    function Combination()
    {
        this.objectList = ArrayList();
        this.position = new Point(0, 0);
        this.center = new Point(0, 0);
        this.rotation = 0;
        this.coordinate = Coordinate.Default;
    }
    Combination.prototype.copy = function ()
    {
        var comb = new Combination();
        for (var i = 0; i < this.objectList.length; i++)
        {
            comb.objectList[i] = this.objectList[i].copy();
        }
        comb.position = this.position.copy();
        comb.center = this.center.copy();
        comb.coordinate = this.coordinate;
        return comb;
    }
    Combination.prototype.addObject = function (obj)
    {
        this.objectList.add(obj);
    }
    Combination.prototype.removeObject = function (obj)
    {
        this.objectList.remove(obj);
    }
    Combination.prototype.removeObjectAt = function (index)
    {
        this.objectList.removeAt(index);
    }
    Combination.prototype.setCoordinate = function (coordinate)
    {
        for (var i = 0; i < this.objectList.length ; i++)
        {
            if (this.objectList[i].setCoordinate)
                this.objectList[i].setCoordinate(coordinate);
        }
        this.position.setCoordinate(coordinate);
        this.center.setCoordinate(coordinate);
        this.coordinate = coordinate;
    }
    Combination.prototype.changeCoordinate = function (coordinate)
    {
        for (var i = 0; i < this.objectList.length ; i++)
        {
            if (this.objectList[i].changeCoordinate)
                this.objectList[i].changeCoordinate(coordinate);
        }
        this.position.changeCoordinate(coordinate);
        this.center.changeCoordinate(coordinate);
        this.coordinate = coordinate;
    }
    Combination.prototype.setPositionPoint = function (x, y)
    {
        this.position = new Point(x, y);
    }
    Combination.prototype.setCenterPoint = function (x, y)
    {
        this.center = new Center(x, y);
    }
    Combination.prototype.moveTo = function (x, y)
    {
        var dx = x - this.position.x;
        var dy = y - this.position.y;
        for (var i = 0; i < this.objectList.length ; i++)
        {
            this.objectList[i].moveTo(this.objectList[i].position.x + dx, this.objectList[i].position.y + dy);
        }
        this.position.x += dx;
        this.position.y += dy;
        this.center.x += dx;
        this.center.y += dy;
    }
    Combination.prototype.move = function (dx, dy)
    {
        for (var i = 0; i < this.objectList.length ; i++)
        {
            this.objectList[i].moveTo(this.objectList[i].position.x + dx, this.objectList[i].position.y + dy);
        }
        this.position.x += dx;
        this.position.y += dy;
        this.center.x += dx;
        this.center.y += dy;
    }
    Combination.prototype.rotate = function (ang, x, y)
    {
        if (isNaN(x) || isNaN(y))
        {
            x = this.center.x;
            y = this.center.y;
        }
        for (var i = 0; i < this.objectList.length ; i++)
        {
            if (this.objectList[i].rotate)
                this.objectList[i].rotate(ang, x, y);
        }
        this.position.rotate(ang, x, y);
        this.center.rotate(ang, x, y);
        this.rotation += ang;
    }
    Combination.prototype.render = function (graphics, x, y, r, dt)
    {
        for (var i = 0; i < this.objectList.length; i++)
        {
            this.objectList[i].render(graphics, this.objectList[i].position.x, this.objectList[i].position.y, this.objectList[i].rotation, dt);
        }
    }
    Engine.Combination = Combination;
    window.Combination = Combination;

    //ImageAnimation
    function ImageAnimation()
    {
        this.center = new Point(0, 0);
        this.position = this.center.copy();
        this.coordinate = Coordinate.Default;
        this.fCount = 0;
        this.fps = 0;
        this.clipX = 0;
        this.clipY = 0;
        this.fWidth = 0;
        this.fHeight = 0;
        this.time = 0;
        this.img = null;
        this.frame = 0;
        this.playing = true;
        this.reverse = false;
        this.width = 0;
        this.heigh = 0;
        this.onBegine = null;
        this.onEnd = null;
        this.onFrameUpdate = null;
        this.loop = new ImageAnimation.Loop();
    }
    //---ImagImageAnimation.Loop
    ImageAnimation.Loop = function ()
    {
        this.from = 0;
        this.to = 0;
        this.length = 0;
        this.loopTimes = -1;
        this.lt = 0;
        this.enable = true;
        this.onEnd = null;
        this.onStart = null;
    }
    ImageAnimation.Loop.prototype.copy = function ()
    {
        var loop = new ImageAnimation.Loop();
        loop.from = this.from;
        loop.to = this.to;
        loop.length = this.length;
        loop.loopTimes = this.loopTimes;
        loop.lt = this.lt;
        loop.enable = this.enable;
        loop.onEnd = this.onEnd;
        loop.onStart = this.onStart;
        return loop;
    }
    ImageAnimation.Loop.prototype.begin = function ()
    {
        this.enable = true;
        if (this.onStart)
            this.onStart();
    }
    ImageAnimation.Loop.prototype.end = function ()
    {
        var t = this.enable;
        this.enable = false;
        if (t && this.onEnd)
            this.onEnd();
    }
    ImageAnimation.loadFromUrl = function (url, clipX, clipY, fWidth, fHeight, width, height, fCount, fps, callback)
    {
        var ia = new ImageAnimation;
        ia.img = new Image();
        ia.img.onload = function (e)
        {
            ia.fps = fps;
            ia.width = width;
            ia.heigh = height;
            ia.clipFrame(clipX, clipY, fWidth, fHeight, fCount);
            if (callback)
                callback();
        }
        ia.img.src = url;
        return ia;
    }
    ImageAnimation.create = function (width, height, fCount, fps)
    {
    }
    ImageAnimation.prototype.copy = function ()
    {
        var ia = new ImageAnimation;
        ia.img = this.img;
        ia.center = this.center.copy();
        ia.position = this.position.copy();
        ia.coordinate = this.coordinate;
        ia.fCount = this.fCount;
        ia.fps = this.fps;
        ia.clipX = this.clipX;
        ia.clipY = this.clipY;
        ia.fWidth = this.fWidth;
        ia.fHeight = this.fHeight;
        ia.time = this.time;
        ia.width = this.width;
        ia.heigh = this.heigh;
        ia.frame = this.frame;
        ia.playing = this.playing;
        ia.reverse = this.reverse;
        ia.onBegine = this.onBegine;
        ia.onEnd = this.onEnd;
        ia.onFrameUpdate = this.onFrameUpdate;
        ia.loop = this.loop.copy();
        return ia;
    }
    ImageAnimation.prototype.setCoordinate = function (coordinate)
    {
        this.position.setCoordinate(coordinate);
        this.position.setCoordinate(coordinate);
        this.coordinate = coordinate;
    }
    ImageAnimation.prototype.changeCoordinate = function (coordinate)
    {
        this.position.changeCoordinate(coordinate);
        this.position.changeCoordinate(coordinate);
        this.coordinate = coordinate;
    }
    ImageAnimation.prototype.setCenter = function (x, y, align)
    {
        this.position = new Point(x, y);
        if (!align)
            throw new Error("未指定对齐方式");
        this.center = align(this.width, this.heigh);
        this.center.x = x - this.center.x;
        this.center.y = y + this.center.y;
    }
    ImageAnimation.prototype.moveTo = function (x, y)
    {
        var rx = this.position.x;
        var ry = this.position.y;
        this.position.x = x;
        this.position.y = y;
        this.center.x = this.center.x - rx + x;
        this.center.y = this.center.y - ry + y;
    }
    ImageAnimation.prototype.clipFrame = function (clipX, clipY, fWidth, fHeight, fCount)
    {
        this.clipX = clipX;
        this.clipY = clipY;
        this.fWidth = fWidth;
        this.fHeight = fHeight;
        this.fCount = fCount;
        this.loop.from = 0;
        this.loop.to = fCount - 1;
    }
    ImageAnimation.prototype.begine = function ()
    {
        this.playing = true;
        this.time = 0;
        this.frame = 0;
        this.loop.lt = 0;
    }
    ImageAnimation.prototype.end = function ()
    {
        var t = this.playing;
        this.playing = false;
        if (this.onEnd && t)
        {
            this.onEnd();
        }
    }
    ImageAnimation.prototype.play = function ()
    {
        this.playing = true;
        this.time = 0;
    }
    ImageAnimation.prototype.drawToCanvas = function (canvas, x, y, r, dt)
    {

    }
    ImageAnimation.prototype.preload = function (graphics)
    {
        graphics.drawImage(this.img, 0, 0, this.fWidth, this.fHeight, 0, 0, this.width, this.heigh);
        graphics.clearRect(0, 0, this.width, this.height);
    }
    ImageAnimation.prototype.render = function (graphics, x, y, r, dt)
    {
        if (this.time == 0 && this.onBegine)
            this.onBegine();
        this.time += dt;
        var f = Math.floor(this.time / (1 / this.fps));
        if (this.reverse)
            f = this.fCount - f;
        if (this.loop.enable)
        {
            if (f > this.loop.to)
            {
                this.loop.lt++;
                if (this.loop.loopTimes > 0 && this.loop.lt >= this.loop.loopTimes)
                {
                    this.loop.enable = false;
                    f = f % this.fCount;
                }
                else
                {
                    f -= this.loop.from;
                    f %= (this.loop.to - this.loop.from);
                    if (!f)
                        f = 0;
                    f = this.loop.from + f;
                }
            }
        }
        else if (this.playing)
        {
            if (f >= this.fCount && !this.reverse)
            {
                this.frame = f = this.fCount - 1;
                this.end();
            }
            if (f <= 0 && this.reverse)
            {
                this.frame = f = 0;
                this.end();
            }
            //f = f % this.fCount;
        }
        if (this.playing)
        {
            var F = f;
            if (this.frame != f && this.onFrameUpdate)
                F = this.onFrameUpdate(f);
            if (!isNaN(F))
                f = F;
            this.frame = f;
        }

        var center = this.center.coordinate.pFrom(this.center.x, this.center.y);
        graphics.drawImage(this.img, this.clipX + (this.fWidth * this.frame), this.clipY, this.fWidth, this.fHeight, center.x, center.y, this.width, this.heigh);
    }
    Engine.ImageAnimation = ImageAnimation;
    window.ImageAnimation = ImageAnimation;

    //-------GameObject
    function GameObject()
    {
        this.id = -1;
        this.name = "GameObject";
        this.graphic = null;
        this.collider = null;
        this.collideGroups = ArrayList();
        this.animationCallbackList = ArrayList();
        this.links = ArrayList();
        this.lifeTime = 0;
        this.layer = null;
        this.zIndex = 0;
        this.mass = 1;
        this.gravity = false;
        this.onGround = false;
        this.hitTest = false;
        this.F = new Force(0, 0);
        this.constantForce = new Force(0, 0);
        this.v = new Vector2(0, 0);
        this.angV = 0;
        this.a = new Vector2(0, 0);
        this.position = new Position(0, 0);
        this.center = new Position(0, 0);
        this.rotation = 0.0;
        this.coordinate = Engine.Coordinate.Default;
        this.onRender = null;
        this.onUpdate = null;
        this.onStart = null;
        this.onCollide = null;
        this.onCollideSimulate = null;
        this.onMouseDown = null;
        this.onMouseUp = null;
        this.onClick = null;
        this.onDoubleClick = null;
        var gameObject = this;
        this.setPosition(0, 0);
    }
    GameObject.CollideEventArgs = function (target)
    {
        this.target = target;
        this.e = 1;
        this.dff = 0;
        this.ignore = false;
    }
    GameObject.prototype.copy = function ()
    {
        var obj = new GameObject();
        obj.name = this.name;
        if (this.graphic)
        {
            obj.graphic = this.graphic.copy ? this.graphic.copy() : this.graphic;
        }
        if (this.collider)
        {
            obj.collider = this.collider.copy ? this.collider.copy() : this.collider;
        }
        obj.mass = this.mass;
        obj.gravity = this.gravity;
        obj.onGround = this.onGround;
        obj.hitTest = this.hitTest;
        obj.constantForce = this.constantForce;
        obj.F = this.F.copy();
        obj.v = this.v.copy();
        obj.a = this.a.copy();
        obj.position = this.position.copy();
        obj.center = obj.position;
        obj.rotation = this.rotation;
        obj.coordinate = this.coordinate;
        obj.onRender = this.onRender;
        obj.onUpdate = this.onUpdate;
        obj.onStart = this.onStart;
        obj.onCollide = this.onCollider;
        obj.onMouseDown = this.onMouseDown;
        obj.onMouseUp = this.onMouseUp;
        obj.onClick = this.onClick;
        obj.onDoubleClick = this.onDoubleClick;
        return obj;
    }
    GameObject.prototype.setCoordinate = function (coordinate)
    {
        this.center.setCoordinate(coordinate);
        this.position.setCoordinate(coordinate);
        if (this.graphic && this.graphic.setCoordinate)
            this.graphic.setCoordinate(coordinate);
        if (this.collider && this.collider.setCoordinate)
            this.collider.setCoordinate(coordinate);
        this.coordinate = coordinate;
    }
    GameObject.prototype.changeCoordinate = function (coordinate)
    {
        this.center.changeCoordinate(coordinate);
        this.position.changeCoordinate(coordinate);
        if (this.graphic && this.graphic.changeCoordinate)
            this.graphic.changeCoordinate(coordinate);
        if (this.collider && this.collider.changeCoordinate)
            this.collider.changeCoordinate(coordinate);
        this.coordinate = coordinate;
    }
    GameObject.prototype.animate = function (properties, time, callback)
    {
        var gameObject = this;
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
                        gameObject.animationCallbackList.remove(animeCallback);
                        if (callback)
                        {
                            callback();
                        }
                    }
                    else if (delta > 0 && obj[key] >= to)
                    {
                        obj[key] = to;
                        gameObject.animationCallbackList.remove(animeCallback);
                        if (callback)
                        {
                            callback();
                        }
                    }
                    else if (t >= time)
                    {
                        obj[key] = to;
                        gameObject.animationCallbackList.remove(animeCallback);
                        if (callback)
                        {
                            callback();
                        }
                    }
                };
                gameObject.animationCallbackList.add(animeCallback);
            })(obj, lastKey, obj[lastKey], properties[key], time, callback);
        }
    }
    GameObject.prototype.stop = function ()
    {
        this.animationCallbackList.length = 0;
    }
    GameObject.prototype.linkTo = function (gameObject)
    {
        function DFS(obj, target)
        {
            for (var i = 0; i < obj.links.length; i++)
            {
                if (obj.links[i] == target)
                {
                    return true;
                }
                return DFS(obj.links[i], target);
            }
            return false;
        }
        if (DFS(gameObject, this))
            throw new Error("Link Loop.");
        gameObject.links.add(this);
    }
    GameObject.prototype.unLink = function (gameObject)
    {
        var index = gameObject.links.indexOf(this);
        if (index < 0)
            return false;
        gameObject.links.removeAt(index);
    }
    GameObject.prototype.resetForce = function ()
    {
        this.F.x = 0;
        this.F.y = 0
    }
    GameObject.prototype.resetConstantForce = function ()
    {
        this.constantForce.x = 0;
        this.constantForce.y = 0;
    }
    GameObject.prototype.force = function (a, b, c)
    {
        if (a instanceof Force)
        {
            if (b)
            {
                this.constantForce.x += a.x;
                this.constantForce.y += a.y;
                return this.constantForce;
            }
            this.F.x += a.x;
            this.F.y += a.y;
            return this.F;
        }
        else if (isNaN(a) || isNaN(b))
        {
            throw new Error("Paramate must be a Number.");
        }
        else
        {
            if (c)
            {
                this.constantForce.x += a;
                this.constantForce.y += b;
                return this.constantForce;
            }
            this.F.x += a;
            this.F.y += b;
            return this.F;
        }
    }
    GameObject.prototype.addMomenta = function (p)
    {

    }
    GameObject.prototype.drawToCanvas = function (canvas, x, y, r, dt)
    {
        if (this.graphic)
            this.graphic.drawToCanvas(canvas, x, y, r, dt);
    }
    GameObject.prototype.render = function (graphics, x, y, r, dt)
    {
        if (this._animCallback)
            this._animCallback(dt);
        if (this.graphic)
            this.graphic.render(graphics, x, y, r, dt);
    }
    GameObject.prototype.setCenter = function (x, y)
    {
        this.center = new Position(x, y);
    }
    GameObject.prototype.setPosition = function (x, y)
    {
        this.position = new Position(x, y);
        var gameObject = this;
        this.position.changeCallback = function (e)
        {
            var dx = e.x - gameObject.position.x;
            var dy = e.y - gameObject.position.y;
            if (gameObject.graphic)
            {
                gameObject.graphic.moveTo(gameObject.graphic.position.x + dx, gameObject.graphic.position.y + dy);
            }
            if (gameObject.collider && gameObject.collider != gameObject.graphic)
            {
                gameObject.collider.moveTo(gameObject.collider.position.x + dx, gameObject.collider.position.y + dy);
            }

            for (var i = 0; i < gameObject.links.length; i++)
            {
                gameObject.links[i].position.x += dx;
                gameObject.links[i].position.y += dy;
            }
            gameObject.center.x += dx;
            gameObject.center.y += dy;
        }
    }
    GameObject.prototype.moveTo = function (x, y)
    {
        this.position.x = x;
        this.position.y = y;
    }
    GameObject.prototype.rotate = function (rad, x, y)
    {
        if (isNaN(x) || isNaN(y))
        {
            x = this.center.x;
            y = this.center.y;
        }
        if (this.graphic && this.graphic.rotate)
        {
            this.graphic.rotate(rad, x, y);
        }
        if (this.collider && this.collider != this.graphic && this.collider.rotate)
        {
            this.collider.rotate(rad, x, y);
        }
        for (var i = 0; i < this.links.length; i++)
        {
            if (this.links[i].rotate)
                this.links[i].rotate(rad, x, y);
        }
        this.position.rotate(rad, x, y);
        this.center.rotate(rad, x, y);
        this.rotation += rad;
    }
    GameObject.prototype.moveAnimateTo = function (x, y, t, callback)
    {
        var startPosition = this.position.copy();
        var time = 0;
        var gameObject = this;
        this._animCallback = function (dt)
        {
            time += dt;
            if (time >= t)
                time = t;
            gameObject.moveTo((x - startPosition.x) / t * time + startPosition.x, (y - startPosition.y) / t * time + startPosition.y);
            if (time == t)
            {
                gameObject._animCallback = null;
                if (callback)
                    callback();
            }
        }
    }
    Engine.GameObject = GameObject;
    window.GameObject = GameObject;



    //-------Colliders
    function Colliders() { }

    //Particle
    function Particle()
    {
        this.size = 1;
        this.color = new Color(0, 0, 0, 1);
        this.v = new Vector2(0, 0);
        this.position = new Point(0, 0);
        this.center = new Point(0, 0);
        this.o = new Point(0, 0);
        this.rotation = 0;
        this.coordinate = Coordinate.Default;
    }
    Particle.prototype.copy = function ()
    {
        var p = new Particle();
        p.size = this.size;
        if (this.color && this.color.copy)
            p.color = this.color.copy();
        else
            p.color = this.color;
        p.v = this.v.copy();
        return p;
    }
    Particle.prototype.setCoordinate = function (coordinate)
    {
        this.coordinate = coordinate;
        this.position.setCoordinate(coordinate);
        this.center.setCoordinate(coordinate);
        this.o.setCoordinate(coordinate);
        this.v.setCoordinate(coordinate);
    }
    Particle.prototype.changeCoordinate = function (coordinate)
    {
        this.coordinate = coordinate;
        this.position.changeCoordinate(coordinate);
        this.center.changeCoordinate(coordinate);
        this.o.changeCoordinate(coordinate);
        this.v.changeCoordinate(coordinate);
    }
    Particle.prototype.move = function (dx, dy)
    {
        this.position.x += dx;
        this.position.y += dy;
        this.center.x += dx;
        this.center.y += dy;
    }
    Particle.prototype.moveTo = function (x, y)
    {
        var dx = x - this.position.x;
        var dy = y - this.position.y;
        this.position.x += dx;
        this.position.y += dy;
        this.center.x += dx;
        this.center.y += dy;
    }
    Particle.prototype.setCenter = function (x, y)
    {
        var dx = x - this.center.x;
        var dy = y - this.center.y;
        this.center = new Point(x, y);
        this.o.x -= dx;
        this.o.y -= dy;
    }
    Particle.prototype.setPosition = function (x, y)
    {
        this.position = new Point(x, y);
    }
    Particle.prototype.rotate = function (rad, x, y)
    {
        if (isNaN(x) || isNaN(y))
        {
            this.position.rotate(rad, this.center.x, this.center.y);
        }
        else
        {
            this.position.rotate(rad, x, y);
            this.center.rotate(rad, x, y);
        }
        this.rotation += rad;
    }
    Particle.prototype.rotateTo = function (rad, x, y)
    {
        if (isNaN(x) || isNaN(y))
        {
            this.position.rotate(rad - this.rotation, this.center.x, this.center.y);
        }
        else
        {
            this.position.rotate(rad - this.rotation, x, y);
            this.center.rotate(rad - this.rotation, x, y);
        }
        this.rotation += rad;
    }
    Particle.prototype.render = function (graphics, x, y, r, dt)
    {
        var o = this.o.coordinate.pFrom(this.o.x, this.o.y);
        o.x += this.center.x;
        o.y += this.center.y;
        graphics.beginPath();
        graphics.arc(o.x, o.y, this.size, 0, 2 * Math.PI);
        graphics.fillStyle = this.color;
        graphics.fill();
    }
    Particle.prototype.isCollideWith = function (target, v1, v2, dt)
    {
        var o = this.o.coordinate.pFrom(this.o.x, this.o.y);
        o.x += this.center.x;
        o.y += this.center.y;

        var l = new Line(o, new Point(v1.x * dt + o.x, v1.y * dt + o.y));

        if (target instanceof Particle)
        {
            var o2 = this.o.coordinate.pFrom(target.o.x, target.o.y);
            o2.x += target.center.x;
            o2.y += target.center.y;
            var l2 = new Line(o, new Point(v2.x * dt + o2.x, v2.y * dt + o2.y));
            return l2.isCross(l);
        }

        return l.isCross(target);
    }
    Particle.prototype.collide = function (self, target, dt)
    {

    }
    Engine.Particle = Particle;
    window.Particle = Particle;

    //-------Circle
    function Circle(r)
    {
        if (!r)
            r = 0;
        this.r = r;
        this.o = new Point(0, 0);
        this.position = new Point(0, 0);
        this.center = this.position;
        this.angV = 0;
        this.rotation = 0;
        this.coordinate = Coordinate.Default;
        this.rigidBody = false;
        this.e = 1;
        this.I = 1;//moment of inercial
        this.dff = 0;//dynamic friction factor
        this.static = false;
        this.soft = true;
        this.landed = false;
        this.strokeWidth = 1;
        this.strokeStyle = new Color(0, 0, 0, 1);
        this.fillStyle = new Color(255, 255, 255, 1);
    }
    Circle.prototype.copy = function ()
    {
        var circle = new Circle(this.r);
        circle.setCenter(this.position.x, this.position.y);
        circle.angV = this.angV;
        circle.rotation = this.rotation;
        circle.coordinate = this.coordinate;
        circle.rigidBody = this.rigidBody;
        circle.e = this.e;
        circle.I = this.I;
        circle.dff = this.dff;
        circle.static = this.static;
        circle.soft = this.soft;
        circle.strokeWidth = this.strokeWidth;
        if (this.strokeStyle instanceof Color)
            circle.strokeStyle = this.strokeStyle.copy();
        else
            circle.strokeStyle = this.strokeStyle;
        if (this.fillStyle instanceof Color)
            circle.fillStyle = this.fillStyle.copy();
        else
            circle.fillStyle = this.fillStyle;
        return circle;
    }
    Circle.prototype.setCoordinate = function (coordinate)
    {
        this.center.setCoordinate(coordinate);
        this.position.setCoordinate(coordinate);
        this.o.setCoordinate(coordinate);
        this.coordinate = coordinate;
    }
    Circle.prototype.changeCoordinate = function (coordinate)
    {
        this.center.changeCoordinate(coordinate);
        this.position.changeCoordinate(coordinate);
        this.o.changeCoordinate(coordinate);
        this.coordinate = coordinate;
    }
    Circle.prototype.setPosition = function (x, y)
    {
        this.o.x += x - this.position.x;
        this.o.y += y - this.position.y;
        this.position.x = x;
        this.position.y = y;
    }
    Circle.prototype.setCenter = function (x, y)
    {
        this.position.x = x;
        this.position.y = y;
    }
    Circle.prototype.rotate = function (rad, x, y)
    {
        if (isNaN(x) || isNaN(y))
        {
            x = this.center.x;
            y = this.center.y;
        }
        this.position.rotate(rad, x, y);
        this.center.rotate(rad, x, y);
    }
    Circle.prototype.moveTo = function (x, y)
    {
        if (x == this.position.x && y == this.position.y)
            return;
        this.o.x = this.o.x - this.position.x + x;
        this.o.y = this.o.y - this.position.y + y;
        this.position.x = x;
        this.position.y = y;
    }
    Circle.prototype.drawToCanvas = function (canvas, x, y, r, dt)
    {
        var ctx = canvas.getContext("2d");
        ctx.beginPath();
        ctx.arc(this.o.x, this.o.y, this.r, 0, 2 * Math.PI);
        ctx.lineWidth = this.strokeWidth;
        ctx.strokeStyle = this.strokeStyle;
        ctx.fillStyle = this.fillStyle;
        ctx.fill();
        ctx.stroke();
    }
    Circle.prototype.render = function (graphics, x, y, r, dt)
    {
        var o = this.o.coordinate.pFrom(this.o.x, this.o.y);
        graphics.beginPath();
        graphics.arc(o.x, o.y, this.r, 0, 2 * Math.PI);
        graphics.lineWidth = this.strokeWidth;
        graphics.strokeStyle = this.strokeStyle;
        graphics.fillStyle = this.fillStyle;
        graphics.fill();
        graphics.stroke();
    }
    Circle.prototype.isCross = function (obj)
    {
        if (obj instanceof Line)
        {
            return obj.isCross(this);
        }
        else if (obj instanceof Circle)
        {
            return this.isCollideWith(obj);
        }
    }
    Circle.prototype.isCollideWith = function (col, v1, v2, dt)
    {
        if (col instanceof Polygon)
        {
            return col.isCollideWith(this);
        }
        else if (col instanceof Point)
        {
            return ((col.x - this.o.x) * (col.x - this.o.x) + (col.y - this.o.y) * (col.y - this.o.y) <= this.r * this.r)
        }
        else if (col instanceof Circle)
        {
            var dx = this.o.x - col.o.x;
            var dy = this.o.y - col.o.y;
            var d = dx * dx + dy * dy;
            if ((this.r - col.r) * (this.r - col.r) <= d && d <= (this.r + col.r) * (this.r + col.r))
                return true;
            return false;
        }
        else if (col instanceof Rectangle)
        {
            var o = new Point(col.o.x + col.center.x, col.o.y + col.center.y);

            if (o.x <= this.o.x && this.o.x <= o.x + col.width)
            {
                if (o.y - this.r <= this.o.y && this.o.y <= o.y + col.height + this.r)
                    return true;
            }
            if (o.y <= this.o.y && this.o.y <= o.y + col.height)
            {
                if (o.x - this.r <= this.o.x && this.o.x <= o.x + col.width + this.r)
                    return true;
            }
            for (var i = 0; i < 4; i++)
            {
                var p = col.V[i];
                if (((p.x - this.o.x) * (p.x - this.o.x) + (p.y - this.o.y) * (p.y - this.o.y)) <= this.r * this.r)
                    return true;
            }
            return false;
        }
        else if (col instanceof Particle)
        {
            return col.isCollideWith(this, v2, v1, dt);
        }
    }
    Circle.prototype.collide = function (self, target, dt)
    {
        if (!self.collider.rigidBody || !target.collider.rigidBody)
            return;
        if (self.collider.static && target.collider.static)
            return;
        if (target.collider instanceof Circle)
        {
            var args = new GameObject.CollideEventArgs();
            args.dff = Math.min(self.collider.dff, target.collider.dff);
            args.e = Math.min(self.collider.e, target.collider.e);
            if (self.onCollide)
            {
                args.target = target;
                self.onCollide(args);
                if (args.ignore)
                    return;
            }
            if (target.onCollide)
            {
                args.target = self;
                target.onCollide(args);
                if (args.ignore)
                    return;
            }
            var circle = self.collider;
            var rect = target.collider;
            var o1 = self.collider.o;
            var o2 = target.collider.o;
            var m1 = self.mass;
            var m2 = target.mass;
            var v0 = self.v;
            var e = args.e;
            var dff = args.dff;
            var v1 = new Vector2(0, 0);
            var v2 = new Vector2(target.v.x - v0.x, target.v.y - v0.y);
            var o21 = new Vector2(o1.x - o2.x, o1.y - o2.y);
            var n = new Vector2(o21.y, -o21.x);
            var Lo21 = o21.x * o21.x + o21.y * o21.y;
            var Ln = n.x * n.x + n.y * n.y;
            var vt = Vector2.multi(n, (v2.x * n.x + v2.y * n.y) / Ln);
            var Lvn = v2.x * o21.x + v2.y * o21.y;
            if (Lvn <= 0)
            {
                return;

            }
            var vn = Vector2.multi(o21, Lvn / Lo21);
            //alert((v2.x*o21.x+v2.y*o21.y)/Lo21);
            v1_ = Vector2.multi(vn, (m2 + e * m2) / (m1 + m2));
            v2_ = Vector2.multi(vn, (m2 - e * m1) / (m1 + m2));

            if (self.collider.static)
            {
                var dv = Vector2.minus(v1_, v1);
                v1_.minus(dv);
                v2_.minus(dv);
            }
            else if (target.collider.static)
            {
                var dv = Vector2.minus(v2_, vn);
                v1_.minus(dv);
                v2_.minus(dv);
            }

            v1_.plus(v0);
            v2_.plus(vt);
            v2_.plus(v0);
            self.v = v1_;
            target.v = v2_;

            if (!circle.soft || !rect.soft)
            {
                d = Math.abs(o21.mod() - (self.collider.r + target.collider.r));
                var dv = Math.abs(vn.mod());
                var t = d / dv;
                t = t > dt ? dt : t;
                self.moveTo(self.position.x + self.v.x * t, self.position.y + self.v.y * t);
                target.moveTo(target.position.x + target.v.x * t, target.position.y + target.v.y * t);

                self.v.plus(Vector2.multi(self.a, t));
                target.v.plus(Vector2.multi(target.a, t));
            }
        }
        else if (target.collider instanceof Rectangle)
        {
            var args = new GameObject.CollideEventArgs();
            args.dff = Math.min(self.collider.dff, target.collider.dff);
            args.e = Math.min(self.collider.e, target.collider.e);
            if (self.onCollide)
            {
                args.target = target;
                self.onCollide(args);
                if (args.ignore)
                    return;
            }
            if (target.onCollide)
            {
                args.target = self;
                target.onCollide(args);
                if (args.ignore)
                    return;
            }
            var e = args.e;
            var dff = args.dff;
            var m1 = target.mass;
            var m2 = self.mass;
            var rect = target.collider;
            var circle = self.collider;
            var dx = -1, dy = -1;
            var v0 = target.v;
            var v1 = new Vector2(0, 0);
            var v2 = new Vector2(self.v.x - v0.x, self.v.y - v0.y);

            var minL = null;
            var minLD = -1;
            for (var i = 0; i < 4; i++)
            {
                var l = rect.E[i];
                if (v2.x * l.norV.x + v2.y * l.norV.y > 0) //Away from edge
                    continue;
                var n = new Vector2(circle.o.x - l.p1.x, circle.o.y - l.p1.y);
                var t = l.tanV.x * n.x + l.tanV.y * n.y;
                if (0 <= t && t <= l.length) //In edge
                {
                    var d = (n.x * l.norV.x + n.y * l.norV.y);
                    if (0 <= d && d <= circle.r) //Touch
                    {
                        if (d < minLD || minLD < 0)
                        {
                            minL = l;
                            minLD = d;
                        }
                    }
                }
            }
            minP = null;
            minPD = -1;
            for (var i = 0; i < 4; i++)
            {
                var p = rect.V[i];
                if (v2.x * p.norV.x + v2.y * p.norV.y > 0) //Away from Point
                    continue;
                var n = new Vector2(circle.o.x - p.x, circle.o.y - p.y);
                var d = n.mod();
                if (0 <= d && d <= circle.r)
                {
                    if (d < minPD || minPD < 0)
                    {
                        minP = p;
                        minPD = d;
                    }
                }
            }

            if (minLD < 0 && minPD < 0)
                return;

            var vn = null, vt = null;
            var d = 0;
            if (minPD < 0 || (minLD > 0 && minLD <= minPD)) //Collide with edge
            {
                d = minLD;
                vn = Vector2.multi(minL.norV, (v2.x * minL.norV.x + v2.y * minL.norV.y));
                vt = new Vector2(v2.x - vn.x, v2.y - vn.y);
            }
            else if (minLD < 0 || (minPD >= 0 && minPD < minLD)) //Collide with Point
            {
                d = minPD;
                var n = new Vector2(minP.x - circle.o.x, minP.y - circle.o.y);
                var Ln = n.x * n.x + n.y * n.y;
                vn = Vector2.multi(n, (n.x * v2.x + n.y * v2.y) / Ln);
                vt = new Vector2(v2.x - vn.x, v2.y - vn.y);
            }
            else
                return;
            if (!vn || !vt)
                return;

            v1_ = Vector2.multi(vn, (m2 + e * m2) / (m1 + m2));
            v2_ = Vector2.multi(vn, (m2 - e * m1) / (m1 + m2));
            if (target.collider.static)
            {
                var dv = Vector2.minus(v1_, v1);
                v1_.minus(dv);
                v2_.minus(dv);
            }
            else if (self.collider.static)
            {
                var dv = Vector2.minus(v2_, vn);
                v1_.minus(dv);
                v2_.minus(dv);
            }
            var dv = v2;

            v2_.plus(vt);
            v2_.plus(v0);
            v1_.plus(v0);
            target.v = v1_;
            self.v = v2_;

            if (!circle.soft || !rect.soft)
            {
                d = Math.abs(d);
                var dv = Math.abs(vn.mod());
                var t = d / dv;
                t = t > dt ? dt : t;
                self.moveTo(self.position.x + self.v.x * t, self.position.y + self.v.y * t);
                target.moveTo(target.position.x + target.v.x * t, target.position.y + target.v.y * t);
                self.v.plus(Vector2.multi(self.a, t));
                target.v.plus(Vector2.multi(target.a, t));

            }
        }
        else if (target.collider instanceof Polygon)
        {
            return target.collider.collide(target, self, dt);
        }
        else
        {
            return;
            return target.collider.collide(target, self, dt);
        }
    }
    Colliders.Circle = Circle;
    window.Circle = Circle;

    //-------Polygon
    function Polygon(v)
    {
        this.E = [];
        this.V = [];
        this.position = new Point(0, 0);
        this.center = this.position;
        this.e = 1;
        this.dff = 0;
        this.angV = 0;
        this.rotation = 0;
        this.coordinate = Coordinate.Default;
        this.I = 1;
        this.rigidBody = false;
        this.static = false;
        this.soft = true;
        this.landed = false;
        this.convex = true;
        this.cw = null;
        this.constructing = false;
        this.strokeWidth = 1;
        this.strokeStyle = new Color(0, 0, 0, 1);
        this.fillStyle = new Color(255, 255, 255, 1);
        if (v instanceof Array)
        {
            this.beginInit();
            for (var i = 0; i < v.length; i++)
            {
                this.addPoint(v[i]);
            }
            this.endInit();
        }
    }
    Polygon.createRect = function (x, y, width, height)
    {
        var v = [];
        v[0] = new Point(x, y);
        v[1] = new Point(x + width, y);
        v[2] = new Point(x + width, y + height);
        v[3] = new Point(x, y + height);
        return new Polyon(v);
    }
    Polygon.prototype.copy = function ()
    {
        var v = [];
        for (var i = 0; i < this.V.length; i++)
        {
            v[i] = new Point(this.V[i].x, this.V[i].y);
        }
        var pol = new Polygon(v);
        pol.angV = this.angV;
        pol.rotation = this.rotation;
        pol.coordinate = this.coordinate;
        pol.rigidBody = this.rigidBody;
        pol.e = this.e;
        pol.I = this.I;
        pol.dff = this.dff;
        pol.static = this.static;
        pol.soft = this.soft;
        pol.setCenter(this.center.x, this.center.y);
        pol.strokeWidth = this.strokeWidth;
        if (this.strokeStyle instanceof Color)
            pol.strokeStyle = this.strokeStyle.copy();
        else
            pol.strokeStyle = this.strokeStyle;

        if (this.fillStyle instanceof Color)
            pol.fillStyle = this.fillStyle.copy();
        else
            pol.fillStyle = this.fillStyle;


        return pol;
    }
    Polygon.prototype.setCoordinate = function (coordinate)
    {
        for (var i = 0; i < this.V.length; i++)
        {
            this.V[i].setCoordinate(coordinate);
        }
        for (var i = 0; i < this.E.length; i++)
        {
            this.E[i].setCoordinate(coordinate);
        }
        this.position.setCoordinate(coordinate);
        this.center.setCoordinate(coordinate);
        this.coordinate = coordinate;
    }
    Polygon.prototype.changeCoordinate = function (coordinate)
    {
        for (var i = 0; i < this.V.length; i++)
        {
            this.V[i].changeCoordinate(coordinate);
        }
        for (var i = 0; i < this.E.length; i++)
        {
            this.E[i].changeCoordinate(coordinate);
        }
        this.position.changeCoordinate(coordinate);
        this.center.changeCoordinate(coordinate);
        this.coordinate = coordinate;
    }
    Polygon.prototype.moveTo = function (x, y)
    {
        var dx = x - this.position.x;
        var dy = y - this.position.y;
        for (var i = 0; i < this.V.length; i++)
        {
            this.V[i].x += dx;
            this.V[i].y += dy;
        }
        this.position.x = x;
        this.position.y = y;
    }
    Polygon.prototype.rotate = function (rad, x, y)
    {
        if (isNaN(x) || isNaN(y))
        {
            x = this.center.x;
            y = this.center.y;
        }
        for (var i = 0; i < this.V.length; i++)
        {
            this.V[i].rotate(rad, x, y);
        }
        this.position.rotate(rad, x, y);
        this.center.rotate(rad, x, y);
        this.rotation += rad;
    }
    Polygon.prototype.setCenter = function (x, y)
    {
        this.position.x = x;
        this.position.y = y;
    }
    Polygon.prototype.getCenter = function ()
    {
        if (this.V.length < 3)
            throw new Error("3 or more points are required.");
        var sumX = 0, sumY = 0;
        for (var i = 0; i < this.V.length; i++)
        {
            sumX += this.V[i].x;
            sumY += this.V[i].y;
        }
        return new Point(sumX / this.V.length, sumY / this.V.length);
    }
    Polygon.prototype.beginInit = function ()
    {
        this.E = [];
        this.constructing = true;
    }
    Polygon.prototype.addPoint = function (p)
    {
        if (!this.constructing)
            throw new Error("Polygon isn't constructing.");
        var i = this.V.length;
        if (i >= 2)
        {
            var n1 = new Vector2(this.V[i - 1].x - this.V[i - 2].x, this.V[i - 1].y - this.V[i - 2].y);
            var n2 = new Vector2(p.x - this.V[i - 1].x, p.y - this.V[i - 1].y);
            var d = n1.x * n2.y - n1.y * n2.x;
            if (!this.dir)
                this.dir = d > 0 ? 1 : -1;
            else if (d && this.dir * d < 0)
            {
                this.convex = false;
            }
        }
        if (!p.lines)
            p.lines = [];
        this.V[i] = p;
    }
    Polygon.prototype.endInit = function ()
    {
        if (this.V.length < 3)
            throw new Error("3 or more points are required.");
        if (!this.dir)
            throw new Error("Points must not in a line.");
        var n1 = new Vector2(this.V[this.V.length - 1].x - this.V[this.V.length - 2].x, this.V[this.V.length - 1].y - this.V[this.V.length - 2].y);
        var n2 = new Vector2(this.V[0].x - this.V[this.V.length - 1].x, this.V[0].y - this.V[this.V.length - 1].y);
        var d = n1.x * n2.y - n1.y * n2.x;
        if (d && d * this.dir < 0)
            this.convex = false;
        for (var i = 0; i < this.V.length; i++)
        {
            var p1 = this.V[i];
            var p2 = this.V[(i + 1) % this.V.length];
            var l = new Line(p1, p2);
            p1.lines[p1.lines.length] = l;
            p2.lines[p2.lines.length] = l;
            l.polygon = this;
            var length = Math.sqrt((p1.x - p2.x) * (p1.x - p2.x) + (p1.y - p2.y) * (p1.y - p2.y));
            l.length = length;
            l.lengthR = 1 / length;
            this.E[this.E.length] = l;
        }
        if (this.convex && this.dir > 0)
            this.cw = false;
        else if (this.convex)
            this.cw = true;
        this.position = this.getCenter();
        this.center = this.position;
        this.constructing = false;
    }
    Polygon.prototype.render = function (graphics, x, y, r, dt)
    {
        graphics.beginPath();
        if (this.V.length < 3)
            throw new Error("The polygen must contains at least 3 points.");
        var v0 = this.V[0].coordinate.pFrom(this.V[0].x, this.V[0].y);
        graphics.moveTo(v0.x, v0.y);
        for (var i = 1; i < this.V.length; i++)
        {
            var v = this.V[i].coordinate.pFrom(this.V[i].x, this.V[i].y);
            graphics.lineTo(v.x, v.y);
        }
        graphics.lineTo(v0.x, v0.y);
        graphics.lineWidth = this.strokeWidth;
        graphics.strokeStyle = this.strokeStyle.toString();
        graphics.fillStyle = this.fillStyle.toString();
        graphics.fill();
        graphics.stroke();
    }
    Polygon.prototype.isCollideWith = function (col, v1, v2, dt)
    {
        if (!(this.E instanceof Array))
        {
            throw new Error("Something wrong with this polygon");
        }
        if (col instanceof Polygon)
        {

            if (!(col.E instanceof Array))
            {
                throw new Error("Something wrong with the polygon");
            }
            for (var i = 0; i < this.E.length; i++)
                for (var j = 0; j < col.E.length; j++)
                {

                    if (this.E[i].isCross(col.E[j]))
                    {
                        //alert("!");
                        return true;
                    }
                }
            return false;
        }
        else if (col instanceof Circle)
        {
            //Collide with point
            for (var i = 0; i < this.V.length; i++)
            {
                var p = this.V[i];
                var d = (col.o.x - p.x) * (col.o.x - p.x) + (col.o.y - p.y) * (col.o.y - p.y);
                if (d <= col.r * col.r)
                {

                    return true;
                }
            }
            //Collide with edge
            for (var i = 0; i < this.E.length; i++)
            {
                var l = this.E[i];
                var n;
                if (this.cw)
                    n = new Vector2(l.p1.y - l.p2.y, l.p2.x - l.p1.x);
                else
                    n = new Vector2(l.p2.y - l.p1.y, l.p1.x - l.p2.x);
                var t1 = new Vector2(col.o.x - l.p1.x, col.o.y - l.p1.y);
                var t2 = new Vector2(col.o.x - l.p2.x, col.o.y - l.p2.y);
                var m1 = t1.x * n.y - t1.y * n.x;
                var m2 = t2.x * n.y - t2.y * n.x;
                if (m1 * m2 > 0)
                    continue;
                var d = Vector2.multi(t1, n) * l.lengthR;
                if (d > 0 && d <= col.r)
                    return true;
            }

            return false;
        }
        else if (col instanceof Rectangle)
        {
            if (!(col.E instanceof Array))
            {
                throw new Error("Something wrong with the polygon");
            }
            for (var i = 0; i < this.V.length; i++)
            {
                if (col.isCollideWith(this.V[i]))
                    return true;
            }
            for (var i = 0; i < this.E.length; i++)
                for (var j = 0; j < col.E.length; j++)
                {

                    if (this.E[i].isCross(col.E[j]))
                    {
                        //alert("!");
                        return true;
                    }
                }
            return false;
        }
        else if (col instanceof Particle)
        {
            return col.isCollideWith(this, v2, v1, dt);
        }
        return false;
    }
    Polygon.prototype.collide = function (self, target, dt)
    {
        if (!self.collider.rigidBody || !target.collider.rigidBody)
            return;
        if (self.collider.static && target.collider.static)
            return;
        if (target.collider instanceof Circle)
        {
            var args = new GameObject.CollideEventArgs();
            args.dff = Math.min(self.collider.dff, target.collider.dff);
            args.e = Math.min(self.collider.e, target.collider.e);
            if (self.onCollide)
            {
                args.target = target;
                self.onCollide(args);
                if (args.ignore)
                    return;
            }
            if (target.onCollide)
            {
                args.target = self;
                target.onCollide(args);
                if (args.ignore)
                    return;
            }

            var e = args.e;
            var dff = args.dff;
            var poly = self.collider;
            var circle = target.collider;
            var v1 = self.v;
            var v2 = target.v;
            var minLD = -1, minPD = -1;
            var P, L;
            for (var i = 0; i < poly.E.length; i++)
            {
                var l = poly.E[i];
                var n;
                if (!poly.cw)
                    n = new Vector2((l.p2.y - l.p1.y), (l.p1.x - l.p2.x));
                else
                    n = new Vector2((l.p1.y - l.p2.y), (l.p2.x - l.p1.x));
                n.multi(1 / n.mod());
                var t = new Vector2(l.p2.x - l.p1.x, l.p2.y - l.p1.y);
                l.norV = n;
                l.tanV = t;
                t.multi(1 / t.mod());
                var dv = Vector2.minus(v2, v1);
                if (Vector2.multi(n, dv) > 0)
                    continue;
                var po = Vector2.fromPoint(l.p1, circle.o);
                var dt = Vector2.multi(t, Vector2.multi(t, po)).mod();
                var dn = Vector2.multi(po, n);
                if (0 <= dn && dn <= circle.r && 0 <= dt && dt <= l.length)
                {
                    if (minLD < 0 || dn < minLD)
                    {
                        minLD = dn;
                        L = l;
                    }
                }
            }
            for (var i = 0; i < poly.V.length; i++)
            {
                var p = poly.V[i];
                var n = Vector2.fromPoint(p, circle.o);
                n.multi(1 / n.mod());
                if (Vector2.multi(n, dv) > 0)
                    continue;
                var d = Point.Distance(p, circle.o);
                if (0 <= d && d <= circle.r)
                {
                    if (minPD < 0 || d < minPD)
                    {
                        minPD = d;
                        P = p;
                    }
                }
            }
            if (minPD < 0 && minLD < 0)
                return;

            var N, T;
            var d;
            if (minLD < 0 || (minPD >= 0 && minPD < minLD))//Collide Point
            {
                d = circle.r - minPD;
                N = Vector2.fromPoint(P, circle.o);
                N.multi(1 / N.mod());
                T = new Vector2(-N.y, N.x);
            }
            else if (minPD < 0 || (minLD >= 0 && minLD < minPD))
            {
                d = circle.r - minLD;
                N = L.norV;
                T = l.tanV;
            }

            var v1 = self.v, v2 = target.v;
            var v0 = v1.copy(0);
            var m1 = self.mass, m2 = target.mass;
            v1.minus(v0);
            v2.minus(v0);
            var dv = v2.copy();
            var vn = Vector2.multi(N, Vector2.multi(N, v2));
            var vt = Vector2.minus(v2, vn);
            v1_ = Vector2.multi(vn, (m2 + e * m2) / (m1 + m2));
            v2_ = Vector2.multi(vn, (m2 - e * m1) / (m1 + m2));

            if (poly.static)
            {
                var dv = Vector2.minus(v1_, v1);
                v1_.minus(dv);
                v2_.minus(dv);
            }
            else if (circle.static)
            {
                var dv = Vector2.minus(v2_, vn);
                v2_.minus(dv);
                v1_.minus(dv);
            }
            v2_.plus(vt);
            v1_.plus(v0);
            v2_.plus(v0);

            self.v = v1_;
            target.v = v2_;

            if (!poly.soft || !circle.soft)
            {
                dv = Math.abs(Vector2.multi(dv, N));
                var t = d / dv;
                t = t > dt ? dt : t;
                self.moveTo(self.position.x + self.v.x * t, self.position.y + self.v.y * t);
                target.moveTo(target.position.x + target.v.x * t, target.position.y + target.v.y * t);
            }

        }
        else if (target.collider instanceof Rectangle)
        {
            var args = new GameObject.CollideEventArgs();
            args.dff = Math.min(self.collider.dff, target.collider.dff);
            args.e = Math.min(self.collider.e, target.collider.e);
            if (self.onCollide)
            {
                args.target = target;
                self.onCollide(args);
                if (args.ignore)
                    return;
            }
            if (target.onCollide)
            {
                args.target = self;
                target.onCollide(args);
                if (args.ignore)
                    return;
            }
            var e = args.e;
            var dff = args.dff;
            var poly = self.collider;
            var rect = target.collider;
            poly.obj = self;
            rect.obj = target;
            var maxD = 1, maxP = null, maxL = null;
            for (var i = 0; i < poly.V.length; i++)
            {
                var p = poly.V[i];

                var t = new Vector2(-(p.y - poly.center.y), (p.x - poly.center.x));
                var R = t.mod();
                t.multi(1 / R);
                var v = self.v.copy();
                var vt = Vector2.multi(t, R * poly.angV);
                v.plus(vt);
                v.plus(Vector2.multi(target.v, -1));
                var p0 = new Point(p.x - v.x * dt, p.y - v.y * dt);
                var lp = new Line(p0, p);
                for (var j = 0; j < rect.E.length; j++)
                {
                    var l = rect.E[j];
                    if (!p.lines[0].isCross(l) && !p.lines[1].isCross(l))
                        continue;
                    var n = l.norV;
                    var t = new Vector2(l.p2.x - l.p1.x, l.p2.y - l.p1.y);
                    var p1p = new Vector2(p.x - l.p1.x, p.y - l.p1.y);
                    if (Vector2.multi(n, v) < 0 && Vector2.multi(t, p1p) >= 0 && Vector2.multi(t, p1p) / t.mod() <= t.mod())
                    {


                        var d = Vector2.multi(p1p, n);
                        if (d < 0 && (d > maxD || maxD > 0))
                        {
                            maxD = d;
                            maxP = p;
                            maxL = l;
                        }
                    }
                }
            }
            for (var i = 0; i < rect.V.length; i++)
            {
                var p = rect.V[i];
                var v = target.v.copy();
                v.plus(Vector2.multi(self.v, -1));
                var r1 = Vector2.fromPoint(p, poly.center);
                var t1 = new Vector2((p.y - poly.center.y), -(p.x - poly.center.x));
                t1.multi(1 / t1.mod());
                var vt1 = Vector2.multi(t1, r1.mod() * poly.angV)
                v.plus(vt1);
                var p0 = new Point(p.x - v.x * dt, p.y - v.y * dt);
                var lp = new Line(p0, p);
                for (var j = 0; j < poly.E.length; j++)
                {
                    var l = poly.E[j];
                    if (!p.lines[0].isCross(l) && !p.lines[1].isCross(l))
                        continue;
                    var n;
                    if (!poly.cw)
                        n = new Vector2((l.p2.y - l.p1.y), (l.p1.x - l.p2.x));
                    else
                        n = new Vector2((l.p1.y - l.p2.y), (l.p2.x - l.p1.x));
                    var t = new Vector2(l.p2.x - l.p1.x, l.p2.y - l.p1.y);
                    var p1p = new Vector2(p.x - l.p1.x, p.y - l.p1.y);
                    if (Vector2.multi(v, n) < 0 && Vector2.multi(t, p1p) >= 0 && Vector2.multi(t, p1p) / t.mod() <= t.mod())
                    {

                        var d = Vector2.multi(p1p, n) / n.mod();
                        if (d < 0 && (d > maxD || maxD > 0))
                        {
                            maxD = d;
                            maxP = p;
                            maxL = l;
                        }
                    }
                }

            }
            if (maxD > 0)
            {
                return;
            }
            p = maxP;
            l = maxL;
            pol1 = maxL.polygon;
            pol2 = maxP.lines[0].polygon;
            var obj1 = pol1.obj, obj2 = pol2.obj;
            var w1 = pol1.angV, w2 = pol2.angV;
            if (pol1 == rect)
                w1 = 0;
            else if (pol2 == rect)
                w2 = 0;
            var v1 = obj1.v, v2 = obj2.v;
            var o1 = pol1.center, o2 = pol2.center;
            /*var n1 = new Vector2(p.x - o1.x, p.y - o1.y);
            var n2 = new Vector2(p.x - o2.x, p.y - o2.y);
            var R1 = n1.mod();
            var R2 = n2.mod();*/
            var m1 = obj1.mass, m2 = obj2.mass;
            /*var I1 = pol1.I, I2 = pol2.I;
            if (pol1 == rect)
                I1 = 1;
            else if (pol2 == rect)
                I2 = 1;
            n1.multi(1 / R1);
            n2.multi(1 / R2);

            var t1 = new Vector2(-n1.y, n1.x);
            var t2 = new Vector2(-n2.y, n2.x);*/
            var N, T;
            if (pol1 == rect)
            {
                N = maxL.norV;
                T = maxL.tanV;
            }
            else if (pol1 == poly)
            {
                if (!pol1.cw)
                    N = new Vector2((l.p2.y - l.p1.y), (l.p1.x - l.p2.x));
                else
                    N = new Vector2((l.p1.y - l.p2.y), (l.p2.x - l.p1.x));
                N.multi(1 / N.mod());
                T = new Vector2(-N.y, N.x);
            }

            /*var k1 = Math.abs((n1.x * N.y - n1.y * N.x) / (n1.x * N.x + n1.y * N.y));
            var k2 = Math.abs((n2.x * N.y - n2.y * N.x) / (n2.x * N.x + n2.y * N.y));*/
            /*k1 = k1 * k1;
            k2 = k2 * k2;*/
            /*if (pol1 == poly)
                m1 = ((I1 / (R1 * R1)) + k1 * m1) / (1 + k1);
            else if (pol2 == poly)
                m2 = ((I2 / (R2 * R1)) + k2 * m2) / (1 + k2);
            var vt1 = w1 * R1;
            var vt2 = w2 * R2;*/
            /*vt1 = vt1 * (I1 / (R1 * R1)) / m1;
            vt2 = vt2 * (I2 / (R2 * R2)) / m2;*/
            /*v1 = Vector2.plus(Vector2.multi(t1, vt1), v1);
            v2 = Vector2.plus(Vector2.multi(t2, vt2), v2);*/
            var v0 = v1.copy(0);
            v1.minus(v0);
            v2.minus(v0);
            var dv = v2.copy();
            var vn = Vector2.multi(N, Vector2.multi(N, v2));
            var vt = Vector2.minus(v2, vn);
            v1_ = Vector2.multi(vn, (m2 + e * m2) / (m1 + m2));
            v2_ = Vector2.multi(vn, (m2 - e * m1) / (m1 + m2));

            if (pol1.static)
            {
                var dv = Vector2.minus(v1_, v1);
                v1_.minus(dv);
                v2_.minus(dv);
            }
            else if (pol2.static)
            {
                var dv = Vector2.minus(v2_, vn);
                v2_.minus(dv);
                v1_.minus(dv);
            }
            v2_.plus(vt);
            v1_.plus(v0);
            v2_.plus(v0);
            /*var vn1 = Vector2.multi(n1, Vector2.multi(v1_, n1));
            var vn2 = Vector2.multi(n2, Vector2.multi(v2_, n2));
            var vt1 = Vector2.multi(v1_, t1);
            var vt2 = Vector2.multi(v2_, t2);
            if (pol1 == poly)
            {
                vt1 = Vector2.multi(t1, Vector2.multi(obj1.v, t1));
                obj1.collider.angV = (Vector2.multi(v1_, t1) - Vector2.multi(obj1.v, t1)) * (I1 / (R1 * R1)) * R1 / I1;
                obj1.v = vn1; //Vector2.plus(vn1, vt1);
                obj2.v = v2_;
            }
            else
            {
                obj1 = v1_;
                vt2 = Vector2.multi(t2, Vector2.multi(obj2.v, t2));
                obj2.collider.angV = (Vector2.multi(v2_, t2) - Vector2.multi(obj2.v, t2)) * (I2 / (R2 * R2)) * R2 / I2;
                obj2.v = vn2;//Vector2.plus(vn2, vt2);
            }*/
            obj1.v = v1_;
            obj2.v = v2_;

            if (!pol1.soft || !pol2.soft)
            {
                var pl = Vector2.fromPoint(l.p1, p);
                var d = Math.abs(Vector2.multi(pl, N));
                dv = Math.abs(Vector2.multi(dv, N));
                var t = d / dv;
                t = t > dt ? dt : t;
                obj1.moveTo(obj1.position.x + obj1.v.x * t, obj1.position.y + obj1.v.y * t);
                obj2.moveTo(obj2.position.x + obj2.v.x * t, obj2.position.y + obj2.v.y * t);
            }
        }
        else if (target.collider instanceof Polygon)
        {
            var args = new GameObject.CollideEventArgs();
            args.dff = Math.min(self.collider.dff, target.collider.dff);
            args.e = Math.min(self.collider.e, target.collider.e);
            if (self.onCollide)
            {
                args.target = target;
                self.onCollide(args);
                if (args.ignore)
                    return;
            }
            if (target.onCollide)
            {
                args.target = self;
                target.onCollide(args);
                if (args.ignore)
                    return;
            }
            var e = args.e;
            var dff = args.dff;
            var pol1 = self.collider;
            var pol2 = target.collider;
            pol1.obj = self;
            pol2.obj = target;
            var maxD = 1, maxP = null, maxL = null;
            for (var i = 0; i < pol1.V.length; i++)
            {
                var p = pol1.V[i];

                var t = new Vector2(-(p.y - pol1.center.y), (p.x - pol1.center.x));
                var R = t.mod();
                t.x /= R;
                t.y /= R;
                var v = self.v.copy();
                var vt = Vector2.multi(t, R * pol1.angV);
                v.plus(vt);

                v.plus(Vector2.multi(target.v, -1));
                var r2 = Vector2.fromPoint(p, pol2.center);
                var t2 = new Vector2((p.y - pol2.center.y), -(p.x - pol2.center.x));
                t2.multi(1 / t2.mod());
                var vt2 = Vector2.multi(t2, r2.mod() * pol2.angV)
                v.plus(vt2);
                var p0 = new Point(p.x - v.x * dt, p.y - v.y * dt);
                var lp = new Line(p0, p);
                //graphics.drawLine(p0.x,p0.y,p.x,p.y);
                for (var j = 0; j < pol2.E.length; j++)
                {
                    var l = pol2.E[j];
                    if (!p.lines[0].isCross(l) && !p.lines[1].isCross(l))
                        continue;
                    var n;
                    if (!pol2.cw)
                        n = new Vector2((l.p2.y - l.p1.y), (l.p1.x - l.p2.x));
                    else
                        n = new Vector2((l.p1.y - l.p2.y), (l.p2.x - l.p1.x));
                    var t = new Vector2(l.p2.x - l.p1.x, l.p2.y - l.p1.y);
                    var p1p = new Vector2(p.x - l.p1.x, p.y - l.p1.y);
                    if (Vector2.multi(n, v) < 0 && Vector2.multi(t, p1p) >= 0 && Vector2.multi(t, p1p) / t.mod() <= t.mod())
                    {


                        var d = Vector2.multi(p1p, n) / n.mod();
                        if (d < 0 && (d > maxD || maxD > 0))
                        {
                            maxD = d;
                            maxP = p;
                            maxL = l;
                        }
                    }
                }
            }
            for (var i = 0; i < pol2.V.length; i++)
            {
                var p = pol2.V[i];
                var t = new Vector2(-(p.y - pol2.center.y), (p.x - pol2.center.x));
                var R = t.mod();
                t.x /= R;
                t.y /= R;
                var v = target.v.copy();
                var vt = Vector2.multi(t, R * pol2.angV);
                v.plus(vt);
                v.plus(Vector2.multi(self.v, -1));
                var r1 = Vector2.fromPoint(p, pol1.center);
                var t1 = new Vector2((p.y - pol1.center.y), -(p.x - pol1.center.x));
                t1.multi(1 / t1.mod());
                var vt1 = Vector2.multi(t1, r1.mod() * pol1.angV)
                v.plus(vt1);
                var p0 = new Point(p.x - v.x * dt, p.y - v.y * dt);
                var lp = new Line(p0, p);
                //graphics.drawLine(p0.x,p0.y,p.x,p.y);
                for (var j = 0; j < pol1.E.length; j++)
                {
                    var l = pol1.E[j];
                    if (!p.lines[0].isCross(l) && !p.lines[1].isCross(l))
                        continue;
                    var n;
                    if (!pol1.cw)
                        n = new Vector2((l.p2.y - l.p1.y), (l.p1.x - l.p2.x));
                    else
                        n = new Vector2((l.p1.y - l.p2.y), (l.p2.x - l.p1.x));
                    var t = new Vector2(l.p2.x - l.p1.x, l.p2.y - l.p1.y);
                    var p1p = new Vector2(p.x - l.p1.x, p.y - l.p1.y);
                    if (Vector2.multi(v, n) < 0 && Vector2.multi(t, p1p) >= 0 && Vector2.multi(t, p1p) / t.mod() <= t.mod())
                    {

                        var d = Vector2.multi(p1p, n) / n.mod();
                        if (d < 0 && (d > maxD || maxD > 0))
                        {
                            maxD = d;
                            maxP = p;
                            maxL = l;
                        }
                    }
                }

            }
            if (maxD > 0)
            {
                //alert("WTF");
                return;
            }
            /*graphics.strokeStyle=new Color(255,0,0,1);
            graphics.drawLine(maxL.p1.x,maxL.p1.y,maxL.p2.x,maxL.p2.y);
            graphics.strokeStyle=new Color(0,255,0,1);
            graphics.drawLine(maxL.p1.x,maxL.p1.y,maxP.x,maxP.y);
            graphics.strokeStyle=new Color(255,0,255,1);
            graphics.drawLine(pol1.center.x,pol1.center.y,pol1.center.x+self.v.x,pol1.center.y+self.v.y);
            graphics.strokeStyle=new Color(255,0,255,1);
            graphics.drawLine(pol2.center.x,pol2.center.y,pol2.center.x+target.v.x,pol2.center.y+target.v.y);*/
            p = maxP;
            l = maxL;
            pol1 = maxL.polygon;
            pol2 = maxP.lines[0].polygon;
            var obj1 = pol1.obj, obj2 = pol2.obj;
            /*var E1 = ((obj1.v.mod() * obj1.v.mod()) / 2 * obj1.mass) + ((pol1.angV) * (pol1.angV) / 2 * pol1.I);
            var E2 = ((obj2.v.mod() * obj2.v.mod()) / 2 * obj2.mass) + ((pol2.angV) * (pol2.angV) / 2 * pol2.I);
            var w1 = pol1.angV, w2 = pol2.angV;*/
            var v1 = obj1.v, v2 = obj2.v;
            var o1 = pol1.center, o2 = pol2.center;
            /*var n1 = new Vector2(p.x - o1.x, p.y - o1.y);
            var n2 = new Vector2(p.x - o2.x, p.y - o2.y);
            var R1 = n1.mod();
            var R2 = n2.mod();*/
            var m1 = obj1.mass, m2 = obj2.mass;
            /*var I1 = pol1.I, I2 = pol2.I;
            n1.multi(1 / R1);
            n2.multi(1 / R2);

            var t1 = new Vector2(-n1.y, n1.x);
            var t2 = new Vector2(-n2.y, n2.x);*/
            var N;
            if (!pol1.cw)
                N = new Vector2((l.p2.y - l.p1.y), (l.p1.x - l.p2.x));
            else
                N = new Vector2((l.p1.y - l.p2.y), (l.p2.x - l.p1.x));
            N.multi(1 / N.mod());
            var T = new Vector2(-N.y, N.x);
            /*var k1 = Math.abs((n1.x * N.y - n1.y * N.x) / (n1.x * N.x + n1.y * N.y));
            var k2 = Math.abs((n2.x * N.y - n2.y * N.x) / (n2.x * N.x + n2.y * N.y));
            k1 = k1 * k1;
            k2 = k2 * k2;
            m1 = ((I1 / (R1 * R1)) + k1 * m1) / (1 + k1);
            m2 = ((I2 / (R2 * R2)) + k2 * m2) / (1 + k2);
            var vt1 = Math.sqrt(((w1 * w1) * I1) / m1);
            var vt2 = Math.sqrt(((w2 * w2) * I2) / m2);
            vt1 = w1 * I1 / R1 / m1;
            vt2 = w2 * I2 / R2 / m2;
            v1 = Vector2.plus(Vector2.multi(t1, vt1), v1);
            v2 = Vector2.plus(Vector2.multi(t2, vt2), v2);*/
            /*var e1_ = (v1.mod() * v1.mod()) * m1 / 2;
            var e2_ = (v2.mod() * v2.mod()) * m2 / 2;*/
            var v0 = v1.copy(0);
            v1.minus(v0);
            v2.minus(v0);
            var dv = v2.copy();
            /*graphics.strokeStyle=new Color(255,255,0,1);
            graphics.drawLine(maxP.x,maxP.y,maxP.x+v2.x*1000,maxP.y+v2.y*1000);*/
            var vn = Vector2.multi(N, Vector2.multi(N, v2));
            var vt = Vector2.minus(v2, vn);
            v1_ = Vector2.multi(vn, (m2 + e * m2) / (m1 + m2));
            v2_ = Vector2.multi(vn, (m2 - e * m1) / (m1 + m2));

            if (pol1.static)
            {
                var dv = Vector2.minus(v1_, v1);
                v1_.minus(dv);
                v2_.minus(dv);
            }
            else if (pol2.static)
            {
                var dv = Vector2.minus(v2_, vn);
                v2_.minus(dv);
                v1_.minus(dv);
            }
            v2_.plus(vt);
            v1_.plus(v0);
            v2_.plus(v0);
            /*var e1 = (v1_.mod() * v1_.mod()) * m1 / 2;
            var e2 = (v2_.mod() * v2_.mod()) * m2 / 2;
            var vn1 = Vector2.multi(n1, Vector2.multi(v1_, n1));
            var vn2 = Vector2.multi(n2, Vector2.multi(v2_, n2));
            var vt1 = Vector2.multi(v1_, t1) / 2;
            var vt2 = Vector2.multi(v2_, t2) / 2;
            vt1 = Vector2.multi(t1, Vector2.multi(obj1.v, t1));
            vt2 = Vector2.multi(t2, Vector2.multi(obj2.v, t2));
            obj1.v = Vector2.plus(vn1, vt1);
            obj2.v = Vector2.plus(vn2, vt2);
            vt1 = Vector2.multi(v1_, t1) - Vector2.multi(obj1.v, t1);
            vt2 = Vector2.multi(v2_, t2) - Vector2.multi(obj2.v, t2);
            obj1.collider.angV = Math.sqrt(vt1 * vt1 * m1 / I1);
            obj2.collider.angV = Math.sqrt((vt2 * vt2) * m2 / I2);
            var Ek1 = ((obj1.v.mod() * obj1.v.mod()) / 2 * obj1.mass) + ((pol1.angV) * (pol1.angV) / 2 * pol1.I);
            var Ek2 = ((obj2.v.mod() * obj2.v.mod()) / 2 * obj2.mass) + ((pol1.angV) * (pol1.angV) / 2 * pol1.I);
            var dE = (Ek1 + Ek2) / (E1 + E2);
            var x = 0;*/
            obj1.v = v1_;
            obj2.v = v2_;

            if (!pol1.soft || !pol2.soft)
            {
                var pl = Vector2.fromPoint(l.p1, p);
                var d = Math.abs(Vector2.multi(pl, N));
                dv = Math.abs(Vector2.multi(dv, N));
                var t = d / dv;
                t = t > dt ? dt : t;
                obj1.moveTo(obj1.position.x + obj1.v.x * t, obj1.position.y + obj1.v.y * t);
                obj2.moveTo(obj2.position.x + obj2.v.x * t, obj2.position.y + obj2.v.y * t);
            }
            //alert(v1+","+v2);
            /*graphics.strokeStyle=new Color(0,0,255,1);
            graphics.drawLine(maxP.x,maxP.y,maxP.x+N.x*100,maxP.y+N.y*100);
            graphics.strokeStyle=new Color(0,255,255,1);
            graphics.drawLine(maxP.x,maxP.y,maxP.x+T.x*100,maxP.y+T.y*100);*/
            /*if(false || vn1.mod()<1 && vn2.mod()<1)
            {
                alert(m1+","+m2);
                game.stop();
            }*/
        }
    }
    Colliders.Polygon = Polygon;
    window.Polygon = Polygon;

    //-------Rectangle
    function Rectangle(w, h)
    {
        w = isNaN(w) ? 0 : w;
        h = isNaN(h) ? 0 : h;
        this.width = w;
        this.height = h;
        this.o = new Point(-w / 2, -h / 2);
        this.position = new Point(0, 0);
        this.coordinate = Coordinate.Default;
        this.center = new Point(0, 0);
        this.rigidBody = false;
        this.dff = 0;//dynamic friction factor
        this.e = 1;
        this.I = 1;//moment of inercial
        this.static = false;
        this.soft = true;
        this.landed = false;
        this.fillStyle = new Color(255, 255, 255, 1);
        this.strokeStyle = new Color(0, 0, 0, 1);
        this.V = [
            new Point(-w / 2, h / 2),
            new Point(w / 2, h / 2),
            new Point(w / 2, -h / 2),
            new Point(-w / 2, -h / 2)];
        this.E = [
                new Line(this.V[0], this.V[1]),
                new Line(this.V[1], this.V[2]),
                new Line(this.V[2], this.V[3]),
                new Line(this.V[3], this.V[0])];

        for (var i = 0; i < 4; i++)
        {
            var p = this.V[i];
            p.norV = new Vector2(p.x - this.center.x, p.y - this.center.y);
            p.tanV = new Vector2(-p.norV.y, p.norV.x);
            p.polygon = this;
            var l = this.E[i];
            if (!l.p1.lines)
                l.p1.lines = [];
            if (!l.p2.lines)
                l.p2.lines = [];
            l.p1.lines[l.p1.lines.length] = l;
            l.p2.lines[l.p2.lines.length] = l;
            l.polygon = this;

        }
        //Length
        this.E[0].length = w;
        this.E[1].length = h;
        this.E[2].length = w;
        this.E[3].length = h;
        //Normal Vector
        this.E[0].norV = new Vector2(0, 1);
        this.E[1].norV = new Vector2(1, 0);
        this.E[2].norV = new Vector2(0, -1);
        this.E[3].norV = new Vector2(-1, 0);
        //Tangent Vector
        this.E[0].tanV = new Vector2(1, 0);
        this.E[1].tanV = new Vector2(0, -1);
        this.E[2].tanV = new Vector2(-1, 0);
        this.E[3].tanV = new Vector2(0, 1);
    }
    Rectangle.prototype.copy = function ()
    {
        var rect = new Rectangle(this.width, this.height);
        rect.o = this.o.copy();
        rect.center = this.center.copy();
        rect.position = this.position.copy();
        rect.coordinate = this.coordinate;
        rect.rigidBody = this.rigidBody;
        rect.e = this.e;
        rect.dff = this.dff;
        rect.I = this.I;
        rect.static = this.static;
        rect.soft = this.soft;
        rect.landed = this.landed;
        if (this.strokeStyle instanceof Color)
            rect.strokeStyle = this.strokeStyle.copy();
        else
            rect.strokeStyle = this.strokeStyle;
        if (this.fillStyle instanceof Color)
            rect.fillStyle = this.fillStyle.copy();
        else
            rect.fillStyle = this.fillStyle;
        return rect;
    }
    Rectangle.prototype.setCoordinate = function (coordinate)
    {
        //this.o.setCoordinate(coordinate);
        this.position.setCoordinate(coordinate);
        this.center.setCoordinate(coordinate);
        this.coordinate = coordinate;
    }
    Rectangle.prototype.changeCoordinate = function (coordinate)
    {
        //this.o.changeCoordinate(coordinate);
        this.position.changeCoordinate(coordinate);
        this.center.changeCoordinate(coordinate);
        this.coordinate = coordinate;
    }
    Rectangle.prototype.setCenterPoint = function (x, y)
    {
        var dx = x - this.center.x;
        var dy = y - this.center.x;
        this.center.x = x;
        this.center.y = y;
        this.o.x -= dx;
        this.o.y -= dy;
        /*
        if (!isNaN(x) && !isNaN(y))
        {
            this.position.x = x;
            this.position.y = y;
        }
        else
        {
            this.position.x = this.o.x + (x(this.width, this.height)).x;
            this.position.y = this.o.y + this.height - (x(this.width, this.height)).y;
        }
        */
    }
    Rectangle.prototype.setPositionPoint = function (x, y)
    {
        this.position.x = x;
        this.position.y = y;
    }
    Rectangle.prototype.moveTo = function (x, y)
    {
        var dx = x - this.position.x;
        var dy = y - this.position.y;
        for (var i = 0; i < 4; i++)
        {
            this.V[i].x += dx;
            this.V[i].y += dy;
        }
        this.center.x += dx;
        this.center.y += dy;
        this.position.x = x;
        this.position.y = y;

    }
    Rectangle.prototype.rotate = function (rad, x, y)
    {
        if (isNaN(x) || isNaN(y))
        {
            x = this.center.x;
            y = this.center.y;
        }
        this.position.rotate(x, y);
        this.center.rotate(x, y);
    }
    Rectangle.prototype.drawToCanvas = function (canvas, x, y, r, dt)
    {
        var ctx = canvas.getContext("2d");
        ctx.fillStyle = this.fillStyle;
        ctx.strokeStyle = this.strokeStyle;
        ctx.fillRect(this.o.x, this.o.y, this.width, this.height);
        ctx.strokeRect(this.o.x, this.o.y, this.width, this.height);
    }
    Rectangle.prototype.render = function (graphic, x, y, r, dt)
    {
        graphic.fillStyle = this.fillStyle;
        graphic.strokeStyle = this.strokeStyle;
        var o = this.center.coordinate.pFrom(this.center.x, this.center.y);
        o.x += this.o.x;
        o.y += this.o.y;
        graphic.fillRect(o.x, o.y + this.height, this.width, this.height);
        graphic.strokeRect(o.x, o.y + this.height, this.width, this.height);
    }
    Rectangle.prototype.isCollideWith = function (obj, v1, v2, dt)
    {
        if (obj instanceof Ground)
        {
            var o = new Point(this.o.x + this.center.x, this.o.y + this.center.y);
            return (!(o.x > obj.xR || o.x + this.width < obj.xL) && (o.y >= obj.y && obj.y >= o.y - this.height));
        }
        else if (obj instanceof Wall)
        {
            var o = new Point(this.o.x + this.center.x, this.o.y + this.center.y);
            return (!(o.y - this.height > obj.yH || o.y < obj.yL) && (o.x <= obj.x && obj.x <= o.x + this.width));
        }
        else if (obj instanceof Rectangle)
        {
            var o = new Point(this.o.x + this.center.x, this.o.y + this.center.y);
            var oTarget = new Point(obj.o.x + obj.center.x, obj.o.y + obj.center.y);
            if (o.x - obj.width <= oTarget.x && oTarget.x <= o.x + this.width
             && o.y - obj.height <= oTarget.y && oTarget.y <= o.y + this.height)
                return true;
            return false;
            var x1 = (oTarget.x - o.x) * (oTarget.x + obj.width - o.x);
            var x2 = (oTarget.x - (o.x + this.width)) * (oTarget.x + obj.width - (o.x + this.width));
            var y1 = (oTarget.y - o.y) * (oTarget.y + obj.height - o.y);
            var y2 = (oTarget.y - (o.y + this.height)) * (oTarget.y + obj.height - (o.y + this.height));
            if (oTarget.x + obj.width < o.x || o.x + this.width < oTarget.x ||
               oTarget.y - obj.height > o.y || o.y - this.height > oTarget.y)
            {
                return false;
            }
            else
                return true;
        }
        else if (obj instanceof Point)
        {
            var o = new Point(this.o.x + this.center.x, this.o.y + this.center.y);
            if (o.x <= obj.x && obj.x <= o.x + this.width && o.y <= obj.y && obj.y <= o.y + this.height)
                return true;
            else
                return false;
        }
        else if (obj instanceof Circle)
            return obj.isCollideWith(this);
        else if (obj instanceof Polygon)
            return obj.isCollideWith(this);
        else if (obj instanceof Particle)
        {
            return obj.isCollideWith(this, v2, v1, dt);
        }
    }
    Rectangle.prototype.collide = function (self, target, dt)
    {
        if (!self.collider.rigidBody || !target.collider.rigidBody)
            return;
        if (self.collider.static && target.collider.static)
            return;
        if (target.collider instanceof Rectangle)
        {
            var args = new GameObject.CollideEventArgs();
            args.dff = Math.min(self.collider.dff, target.collider.dff);
            args.e = Math.min(self.collider.e, target.collider.e);
            if (self.onCollide)
            {
                args.target = target;
                self.onCollide(args);
                if (args.ignore)
                    return;
            }
            if (target.onCollide)
            {
                args.target = self;
                target.onCollide(args);
                if (args.ignore)
                    return;
            }
            var dff = args.dff;
            var e = args.e;
            var dx = -1, dy = -1;
            var v0 = self.v;
            var v1 = new Vector2(0, 0);
            var v2 = new Vector2(target.v.x - v0.x, target.v.y - v0.y);
            var rect1 = self.collider;
            var rect2 = target.collider;
            var m1 = self.mass;
            var m2 = target.mass;
            var o1 = new Point(rect1.center.x + rect1.o.x, rect1.center.y + rect1.o.y);
            var o2 = new Point(rect2.center.x + rect2.o.x, rect2.center.y + rect2.o.y);
            /*if ((rect1.center.x+rect1.o.x) - rect2.width <= (rect2.center.x+rect2.o.x) && (rect2.center.x+rect2.o.x) <= (rect1.center.x+rect1.o.x) + rect1.width) 
            {
                var dBottom = (rect1.center.y+rect1.o.y) - ((rect2.center.y+rect2.o.y) + rect2.height);
                var dTop = ((rect1.center.y+rect1.o.y) + rect1.height) - (rect2.center.y+rect2.o.y);
                if (Math.abs(dBottom) < Math.abs(dTop))
                {

                }
            }*/
            if (target.v.x - self.v.x < 0)
            {
                dx = Math.abs((o1.x + rect1.width) - o2.x); //Distance from rect1.right to rect2.left
            }
            else if (target.v.x - self.v.x > 0)
            {
                dx = Math.abs((o2.x + rect2.width) - o1.x); //Distance from rect1.left to rect2.right
            }
            else if (target.v.x - self.v.x == 0)
            {
                dx = Math.min(Math.abs(o1.x + rect1.width - o2.x), Math.abs(o2.x + rect2.width - o1.x)); //Get min distance
            }
            if (target.v.y - self.v.y < 0)
            {
                dy = Math.abs((o1.y + rect1.height) - o2.y); //Distance from rect1.top to rect2.bottom
            }
            else if (target.v.y - self.v.y > 0)
            {
                dy = Math.abs((o2.y + rect2.height) - o1.y); //Distance from rect1.bottom to rect2.top
            }
            else if (target.v.y - self.v.y == 0)
            {
                dy = Math.min(Math.abs(o1.y + rect1.height - o2.y), Math.abs(o2.y + rect2.height - o1.y)); //Get min distance
            }
            if ((dx >= 0 && dx <= dy) || dy < 0) //Collide x
            {
                var v1x = v2.x * ((m2 + e * m2) / (m1 + m2));
                var v2x = v2.x * ((m2 - e * m1) / (m1 + m2));

                if (rect1.static)
                {
                    var dv = v1x - v1.x;
                    v1x -= dv;
                    v2x -= dv;
                }
                else if (rect2.static)
                {
                    var dv = v2x - v2.x;
                    v1x -= dv;
                    v2x -= dv;
                }
                var dv = v2.x;
                v1.x = v1x;
                v2.x = v2x;

                v2.plus(v0);
                v1.plus(v0);
                self.v = v1;
                target.v = v2;

                if (!rect1.soft || !rect2.soft)
                {
                    var d = Math.abs(dx);
                    var t = Math.abs(d / dv);
                    t = t > dt ? dt : t;
                    self.moveTo(self.position.x + self.v.x * t, self.position.y + self.v.y * t);
                    target.moveTo(target.position.x + target.v.x * t, target.position.y + target.v.y * t);
                }
            }
            else if ((dy >= 0 && dy <= dx) || dx < 0) //Collide y
            {
                var v1y = v2.y * ((m2 + e * m2) / (m1 + m2));
                var v2y = v2.y * ((m2 - e * m1) / (m1 + m2));

                if (rect1.static)
                {
                    var dv = v1y - v1.y;
                    v1y -= dv;
                    v2y -= dv;
                }
                else if (rect2.static)
                {
                    var dv = v2y - v2.y;
                    v1y -= dv;
                    v2y -= dv;
                }
                var dv = v2.y;
                v1.y = v1y;
                v2.y = v2y;

                v2.plus(v0);
                v1.plus(v0);
                var t = dy / Math.abs(self.v.y - target.v.y);
                t = isNaN(t) ? 0 : t;
                t > dt ? dt : t;
                self.v = v1;
                target.v = v2;

                if (!rect1.soft || !rect2.soft)
                {
                    var d = dy;
                    var t = Math.abs(d / dv);
                    t = t > dt ? dt : t;
                    self.moveTo(self.position.x + self.v.x * t, self.position.y + self.v.y * t);
                    target.moveTo(target.position.x + target.v.x * t, target.position.y + target.v.y * t);
                }
            }
        }
        else if (target.collider instanceof Ground)
        {
            if (self.collider.o.y - self.collider.height <= target.collider.y)
            {
                var t = (self.collider.o.y - self.collider.height - target.collider.y) / self.v.y;
                t = isNaN(t) ? 0 : t;
                self.moveTo(self.position.x, self.position.y - self.v.y * t);
                self.v.y = -self.v.y * self.collider.bounce;
                if (self.gravity)
                    self.collider.landed = true;
            }
        }
        else if (target.collider instanceof Wall)
        {

        }
        else if (target.collider instanceof Circle)
        {
            return target.collider.collide(target, self, dt);
        }
        else if (target.collider instanceof Polygon)
        {
            return target.collider.collide(target, self, dt);
        }
    }
    Colliders.Rectangle = Rectangle;
    window.Rectangle = Rectangle;

    //-------Ground
    function Ground(y, xL, xR)
    {
        xL = isNaN(xL) ? 0 : xL;
        xR = isNaN(xR) ? Number.MAX_SAFE_INTEGER : xR;
        this.position = new Point(xL, y);
        this.y = y;
        this.width = xR - xL;
        this.xL = xL;
        this.xR = xR;
        this.static = true;
        this.rigidBody = true;
    }
    Ground.prototype.copy = function ()
    {
        var g = new Ground(this.y, this.xL, this.xR);
        g.rigidBody = this.rigidBody;
        g.static = this.static;
        g.position = this.position.copy();
        return g;
    }
    Ground.prototype.moveTo = function (x, y)
    {
        this.y = y;
        this.position.x = x;
        this.position.y = y;
    }
    Ground.prototype.setCenter = function (x, y, align)
    {
        this.y = y;
        this.xL = x - align(this.xR - this.xL).x;
        this.xR = this.xL + this.width;
    }
    Ground.prototype.drawToCanvas = function (canvas, x, y, r, dt)
    {
        return;
        var ctx = canvas.getContext("2d");
        ctx.fillStyle = this.fillStyle;
        ctx.strokeStyle = this.strokeStyle;
        ctx.fillRect(this.center.x, this.center.y, canvas.width, this.height);
        ctx.strokeRect(this.center.x, this.center.y, canvas.width, this.height);
    }
    Ground.prototype.render = function (graphics, x, y, r, dt)
    {
        return;
    }
    Ground.prototype.toGameObject = function ()
    {
        var obj = new GameObject();
        obj.collider = this;
        obj.graphic = this;
        obj.mass = 1;
        obj.gravity = false;
        return obj;
    }
    Ground.prototype.isCollideWith = function (col)
    {
        if (col instanceof Rectangle)
            return col.isCollideWith(this);
        else if (col instanceof Circle)
            return col.isCollideWith(this);
    }
    Ground.prototype.collide = function (ground, obj, dt)
    {
        if (obj.collider instanceof Rectangle)
            return obj.collider.collide(obj, ground, dt);
    }
    Colliders.Ground = Ground;
    window.Ground = Ground;

    //-------Wall
    function Wall(x, yL, yH)
    {
        yL = isNaN(yL) ? 0 : yL;
        yH = isNaN(yH) ? Number.MAX_SAFE_INTEGER : yH;
        this.x = x;
        this.height = yH - yL;
        this.yL = yL;
        this.yH = yH;
        this.static = true;
        this.rigidBody = true;
        this.position = new Point(x, yL);
    }
    Wall.prototype.copy = function ()
    {
        var w = new Wall(this.x, this.yL, this.yH);
        w.rigidBody = this.rigidBody;
        w.static = this.static;
        w.position = this.position.copy();
    }
    Wall.prototype.toGameObject = function ()
    {
        var obj = new GameObject();
        obj.collider = this;
        obj.graphic = this;
        obj.mass = 1;
        obj.gravity = false;
        return obj;
    }
    Wall.prototype.setCenter = function (x, y, align)
    {
        this.x = x;
        this.yH = y + align(this.height);
        this.yL = this.yH - this.height;
        this.position.x = x;
        this.position.y = y;
    }
    Wall.prototype.moveTo = function (x, y)
    {
        this.x += (x - this.position.x);
        this.yH += (y - this.position.y);
        this.yL += (y - this.position.y);
        this.position.x = x;
        this.position.y = y;
    }
    Wall.prototype.isCollideWith = function (col)
    {
        if (col instanceof Rectangle)
            return col.isCollideWith(this);
    }
    Colliders.Wall = Wall;
    window.Wall = Wall;

    function OneWayGround()
    {

    }

    Engine.Colliders = Colliders;
    window.Colliders = Colliders;
    //--------------------------------

    return Engine;
})(window.SarEngine);