window.SardineFish = (function (sar)
{
    try
    {
        if (!sar)
        {
            if (!web)
        })(sar.Web);
        {
            if (!engine)
        })(sar.Web.Engine2D);
        {
            if (!engine.debug.write)

        {
            this.head = null;
        }
        {
            this.object = obj;
        }
        {
            if (this.count <= 0)
            {
                this.head = new LinkList.Node(obj, null, null);
            }
        }
        {
            if (!(node instanceof LinkList.Node))
            {
                for (var p = this.head ; p != null; p = p.next)
                {
                    if (p.object == node)
                }
            }
            {
                throw new Error("The node doesn't belong to this link list");
            }
            {
                this.head = node.next;
            }
            {
                this.tail = node.last;
            }
        }
        {
            if (!callback)
            {
                var br = callback(p.object, p);
            }
        }
        {
            var ar = [];
            {
                ar[i] = obj;
            });
        }
        {
            sar.Web.LinkList = LinkList;
        }
        {
            return new Point(0, 0);
        }
        {
            return new Point(w / 2, 0);
        }
        {
            return new Point(w, 0);
        }
        {
            return new Point(0, h / 2);
        }
        {
            return new Point(w / 2, h / 2);
        }
        {
            return new Point(w, h / 2);
        }
        {
            return new Point(0, h);
        }
        {
            return new Point(w / 2, h);
        }
        {
            return new Point(w, h);
        }
        {
            this.x = 0;
            {
                this.x = x.x;
            }
            {
                var l = Math.sqrt(x * x + y * y);
            }
            {
                this.x = x;
            }
        }
        {
            return new Force(this.x, this.y, this.f);
        }
        {
            return "(" + this.x + "," + this.y + ")";
        }
        {
            return Math.sqrt(this.x * this.x + this.y * this.y);
        }
        {
            return new Vector(this.x / m, this.y / m);
        }
        {
            this.x = 0;
            this.y = 0;
            this.dx = 0;
            this.dy = 0;
            this.left = Mouse.ButtonState.None;
            this.right = Mouse.ButtonState.None;
            this.wheel = Mouse.ButtonState.None;
        }
        {
            this.x = 0;
        }
        {
            this.x = 0;
            this.y = 0;
            this.dx = 0;
            this.dy = 0;
            this.type = Touch.Types.None;
            this.id = 0;
        }
        {
            this.x = 0;
        }
        {
            var args = new TouchEventArgs();
        }
        {
            this.keys = [];
            this.keys[8] = Keyboard.KeyState.None;
        }
        {
            keys = {};
            {
                switch (keyCode)
                {
                    case 8: return "BackSpace";
                }
            }
        })(Keyboard.Keys);
        {
            this.key = 0;
        }
        {
            this.mouse = new Mouse;
            this.keyboard = new Keyboard;
            this.touches = [];
            {
                this[this.length] = touch;
            }
            {
                for (var i = 0; i < this.length; i++)
                {
                    if (this[i].id == id)
                        return this[i];
                }
                throw new Error("Id not available.");
            }
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
            {
                for (var j = index + 1; j < this.length; j++)
                {
                    this[j - 1] = this[j];
                }
            }
        }
        {
            return parseInt(x);
        }
        {

        {
            this.fps = 0;
        }
        {
            var game = new Game();
        }
        {
            this.scene = scene;
        }
        {
            var error = null;
            var game = this;
            {
                {
                    if (game.onEnd)
                }
                {
                    firstFrame = false;
                }
                else if (error)
                    throw error;

            }
        }
        {
            this.started = false;
        }
        {
            this.game = null;
            {
                this[this.n] = node;
            }
        }
        {
            this.g = new Vector2(0, 0);
        }
        {
            var phy = new Scene.Physics();
        }
        {
            return;
        }
        {
            this.camera = null;
            {
                this[this.n] = node;
            }
        }
        {
            var scene = this;
            {

                {
                    obj.a.x += scene.physics.g.x;
                }
            });
            {
                {
                    for (p = node.next; p; p = p.next)
                    {
                        var target = p.object;
                        {
                            if (obj.collider.isCollideWith(target.collider))
                            {
                                obj.collider.collide(obj, target, dt);
                            }
                        }
                    }
                }
        }
        {
            var scene = this;
            {
        }
        {
            var scene = this;
            {
                if (obj.deleted)
            });
        }
        {
            var scene = this;
            {
                scene.device.mouse.x = mapTo.x;
                scene.device.mouse.y = mapTo.y;


                var args = new MouseEventArgs();
            });
            {
                var args = new MouseEventArgs();
            });
            {
                var args = new MouseEventArgs();
            });
            {
                var mapTo = scene.camera.map(e.pageX, e.pageY);
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
                {
                    if (obj.hitTest && obj.onMouseDown && obj.collider)
                    {
                        var p = new Point(args.x, args.y);
                        {
                            obj.onMouseDown(args);
                        }
                    }
                });
            });
            {
                var mapTo = scene.camera.map(e.pageX, e.pageY);
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
                {
                    if (obj.hitTest && obj.onMouseUp && obj.collider)
                    {
                        var p = new Point(args.x, args.y);
                        {
                            obj.onMouseUp(args);
                        }
                    }
                });
            });
            {
                var args = new MouseEventArgs();
                {
                    args.buttonState = Mouse.ButtonState.DoubleClick; args.x = e.pageX;
                    {
                        if (obj.hitTest && obj.onDoubleClick && obj.collider)
                        {
                            var p = new Point(args.x, args.y);
                            {
                                obj.onDoubleClick(args)
                            }
                        }
                    });
                }
                {
                    args.x = e.pageX;
                    {
                        if (obj.hitTest && obj.onClick && obj.collider)
                        {
                            var p = new Point(args.x, args.y);
                            {
                                obj.onClick(args);
                            }
                        }
                    });
                }
            });
            {
                scene.device.keyboard.keys[e.keyCode] = Keyboard.KeyState.Down;

                if (!pressedKeyList[e.keyCode])
                {
                    pressedKeyList[e.keyCode] = true;
                }
            });
            {
                scene.device.keyboard.keys[e.keyCode] = Keyboard.KeyState.Up;

                if (pressedKeyList[e.key.toUpperCase()])
                {
                    pressedKeyList[e.key.toUpperCase()] = false;
                }
            });
            {
                var args = new KeyEventArgs();
            });
            {
                for (var i = 0; i < e.changedTouches.length ; i++)
                {
                    var t = new Touch(e.changedTouches[i].identifier);
                    t.x = scene.camera.map(e.changedTouches[i].pageX, e.changedTouches[i].pageY).x;
                    t.y = scene.camera.map(e.changedTouches[i].pageX, e.changedTouches[i].pageY).y;
                    t.type = Touch.Types.Start;
                    scene.device.touches.add(t);

                    var argsGUI = new Touch.TouchEventArgs();
                }
            });
            {
                for (var i = 0; i < e.changedTouches.length ; i++)
                {
                    var mapTo = scene.camera.map(e.pageX, e.pageY);
                    var id = e.changedTouches[i].identifier;
                    var t = scene.device.touches.id(id);
                    t.x = mapTo.x;
                    t.y = mapTo.y;
                    t.type = Touch.Types.Move;
                }
            });
            {
                try
                {

                    {
                        var id = e.changedTouches[i].identifier;
                        scene.device.touches.removeId(id);
                    }
                }
                {
                    alert(ex.message);
                }
            });
        }
        {
            var node = this.objectList.add(obj);
        }
        {
            var node = this._objList[id];
        }
        {
            this.center = new Point(x, y);
        }
        {
            var c = new Camera(this.x, this.y, this.width, this.height, this.zoom);
        }
        {
            if (!align)
        }
        {
            this.center.x += (x - this.position.x);
        {
            this.zoom = z;
        {
            throw new Error("Coming soon...");
        {
        }
        {
            if (!this.graphics || !this.graphics.ctx)
        }
        {
            if (!this.graphics || !this.graphics.ctx)
        {
            return new Point((x / this.zoom) + (this.center.x - this.width / 2), (this.height - y / this.zoom) + (this.center.y - this.height / 2));
        }
        {

        {
        }
        {
        }
        {
        }
        {
            if (!canvas)
                get: function ()
                {
                    return globalCompositeOperation;
                },
                {
                    globalCompositeOperation = value;
                }
            });
        }
        {
            if (!canvas)
        }
        {
            var ctx = canvas.getContext("2d");
        }
        {
            var ctx = canvas.getContext("2d");
        }
        {
            var ctx = canvas.getContext("2d");
        }
        {
            if (!canvas)

        {
            if (!canvas)
            {
                ctx.fillStyle = color;
            }
        }
        {
            var ctx = canvas.getContext("2d");
        }
        {
            return this.ctx.rect(x, -y, width, height);
        }
        {
            if (!this.ctx)
        }
        {
            this.ctx.fillStyle = this.fillStyle;
        }
        {
            this.ctx.lineCap = this.lineCap;
        }
        {
            this.roundRect(x, y, width, height, r);
        }
        {
            this.roundRect(x, y, width, height, r);
        }
        {
            this.ctx.clearRect(x, -y, width, height);
        }
        {
            this.ctx.fillStyle = this.fillStyle;
        }
        {
            this.ctx.lineCap = this.lineCap;
        }
        {
            return this.ctx.beginPath();
        }
        {
            return this.ctx.moveTo(x, -y);
        }
        {
            return this.ctx.closePath();
        }
        {
            return this.ctx.lineTo(x, -y);
        }
        {
            return this.ctx.clip();
        }
        {
            return this.ctx.quadraticCurveTo(cpx, -cpy, x, -y);
        }
        {
            return this.ctx.bezierCurveTo(cp1x, -cp1y, cp2x, -cp2y, x, -y);
        }
        {
            return this.ctx.arc(x, -y, r, sAngle, eAngle, counterclockwise);
        }
        {
            return this.ctx.arcTo(x1, -y1, x2, -y2, r);
        }
        {
            return this.ctx.isPointInPath(x, -y);
        }
        {
            return this.ctx.scale(scalewidth, scaleheight);
        }
        {
            return this.ctx.rotate(angle);
        }
        {
            return this.ctx.translate(x, -y);
        }
        {
            return this.ctx.transform(a, b, c, d, e, f);
        }
        {
            return this.ctx.setTransform(a, b, c, d, e, f);
        }
        {
            this.ctx.font = this.font.toString();
        }
        {
            this.ctx.font = this.font.toString();
        }
        {
            this.ctx.font = this.font.toString();
        }
        {
            if (isNaN(x) && !isNaN(sx))
            {
                return this.ctx.drawImage(img, sx, -sy, swidth, sheight);
            }
        }
        {
            this.ctx.lineCap = this.lineCap;
        }
        {
            Object.defineProperty(window, "Color", {
                get: function ()
                {
                    return color;
                },
                {
                    if (!color)
                }
            });
            {
                r = int(r);
            }
            {
                return new Color(Math.random() * 255, Math.random() * 255, Math.random() * 255, 1.0);
            }
            {
                return new Color(this.red, this.green, this.blue, this.alpha);
            }
            {
                return "rgba(" + this.red.toString() + "," + this.green.toString() + "," + this.blue.toString() + "," + this.alpha.toString() + ")";
            }
        })(sar.Color);
        {
            if (isNaN(top))
            {
                top = bottom = left = right = 0;
            }
            {
                bottom = left = right = top;
            }
        }
        {
            return new Thickness(this.top, this.bottom, this.left, this.right);
        }
        {
            this.scene = null;
        }
        {
            var gui = new GUI;
        }
        {
            this.children.add(obj);
        }
        {
            this.width = graphics.canvas.width;
            {
                this.onRender();
            }
            {
                if (obj.render)
            });
        }
        {
            this.children.foreach(function (child, node)
            {
                if (child.mouseMoveCallback && child.isPointIn && child.isPointIn(e.x, e.y))
                {
                    child.mouseMoveCallback(e);
                }
            });
        }
        {
            this.children.foreach(function (child, node)
            {
                if (child.mouseDownCallback && child.isPointIn && child.isPointIn(e.x, e.y))
                {
                    child.mouseDownCallback(e);
                }
            });
        }
        {
            this.children.foreach(function (child, node)
            {
                if (child.mouseUpCallback)
                {
                    child.mouseUpCallback(e);
                }
            });
        }
        {
            this.children.foreach(function (child, node)
            {
                if (child.clickCallback && child.isPointIn && child.isPointIn(e.x, e.y))
                {
                    child.clickCallback(e);
                }
            });
        }
        {
            this.children.foreach(function (child, node)
            {
                if (child.doubleClickCallback && child.isPointIn && child.isPointIn(e.x, e.y))
                {
                    child.doubleClickCallback(e);
                }
            });
        }
        {
            this.children.foreach(function (child, node)
            {
                if (child.touchStartCallback && child.isPointIn && child.isPointIn(e.x, e.y))
                {
                    child.touchStartCallback(e);
                }
            });
        }
        {
            this.children.foreach(function (child, node)
            {
                for (var i = 0; i < e.touches.length; i++)
                {
                }
                {
                    child.touchEndCallback(e);
                }
            });
        }
        {
            this.children.foreach(function (child, node)
            {
                if (child.touchMoveCallback)
                {
                    child.touchMoveCallback(e);
                }
            });
        }
        {
            this.children = new LinkList();
            {
                width = 0;
            }
            {
                height = 0;
            }
        }
        {
            if ((this.bgColor && this.bgColor.alpha > 0) || (this.color && this.color.alpha > 0 && this.border > 0))
            {

            {
                if (child.render)
            });
        }
        {
            if (!content)
        }
        {
            var button = new Button(this.content);
        }
        {
            if (this.onRender)
            {
                this.onRender();
            }
            {
                if (this.horAlign == HorAlign.Stretch)
                {
                    this.width = mW - this.margin.left - this.margin.right;
                }
                {
                    this.width = this.padding.left + w + this.padding.right;
                    {
                        this.width = mW - this.margin.left - this.margin.right;
                    }
                }
            }
            {
                case HorAlign.Left:
            }
            {

                {
                    this.height = mH - this.margin.top - this.margin.bottom;
                }
                {
                    this.height = this.padding.top + h + this.padding.bottom;
                    {
                        this.height = mH - this.margin.top - this.margin.bottom;
                    }
                }
            }
            {
                case VerAlign.Top:
            }
            {
                graphics.fillStyle = this.color.toString();
            }
            {
                graphics.fillStyle = this.bgColor.toString();
            }
        }
        {
            {
                return true;
            }
        }
        {
            if (this.onMouseMove)
        }
        {
            this.isPressed = true;
        }
        {
            var t = this.isPressed;
            {
                this.onMouseUp(e);
            }
        }
        {
            if (this.onClick)
        }
        {
            if (this.onClick)
        }
        {
            this.isPressed = true;
        }
        {
            var t = this.isPressed;
        }
        {
            if (this.onTouchMove)
        }
        {
            if (!text)
        }
        {

        }
        {
            if (this.onRender)
            {
                this.onRender();
            }
            {
                if (this.horAlign == HorAlign.Stretch)
                {
                    this.width = mW - this.margin.left - this.margin.right;
                }
                {
                    this.width = this.padding.left + w + this.padding.right;
                    {
                        this.width = mW - this.margin.left - this.margin.right;
                    }
                }
            }
            {
                case HorAlign.Left:
            }
            {

                {
                    this.height = mH - this.margin.top - this.margin.bottom;
                }
                {
                    this.height = this.padding.top + h + this.padding.bottom;
                    {
                        this.height = mH - this.margin.top - this.margin.bottom;
                    }
                }
            }
            {
                case VerAlign.Top:
            }
            {
                graphics.lineWidth = this.border.top;
            }
            {
                graphics.lineWidth = this.border.right;
            }
            {
                graphics.lineWidth = this.border.bottom;
            }
            {
                graphics.lineWidth = this.border.left;
            }
        }
        {
            if (this.x <= x && x <= this.x + this.width && this.y <= y && y <= this.y + this.height)
            {
                return true;
            }
        }
        {

        {

        {

        {

        {

        {

        {
            this.margin = new Thickness(0);
        }
        {
            fontFamily = fontFamily ? fontFamily : "sans-serif";
        }
        {
            var f = new Font(this.fontFamily, this.fontSize);
        }
        {
            return this.fontStyle + " " + this.fontVariant + " " + this.fontWeight + " " + this.fontSize + " " + this.fontFamily;
        }
        {
            this.text = text;
        }
        {
            var text = new Text(this.text);
        }
        {
            this.position = new Point(x, y);
        }
        {
            var rx = this.position.x;
        }
        {
            var ctx = canvas.getContext("2d");
        }
        {
            if (!graphics || !graphics.ctx)
        }
        {
            if (!img)
                get: function ()
                {
                    return obj.img.width;
                },
                {
                    obj.img.width = value;
                }
            });
                get: function ()
                {
                    return obj.img.height;
                },
                {
                    obj.img.height = value;
                }
            });
        }
        {
            var img = new engine.Image(img);
        }
        {
            this.position = new Point(x, y);
        }
        {
            var rx = this.position.x;
        }
        {
            this.img = new window.Image();
            {
                me.width = me.img.naturalWidth;
                {
                    width();
                }
                {
                    me.img.width = width;
                }
            }
            {
                return;
            }
        }
        {
            if (!graphics)
        }
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
            this.center = this.position;
            this.strokeStyle = new Color(0, 0, 0, 1);
            this.fillStyle = new Color(255, 255, 255, 1);
            this.strokeWidth = 1;
        }
        {
            this.x = x;
            this.y = y;
            this.cp1 = new Point(x, y);
            this.cp2 = new Point(x, y);
        }
        {
            var p = new Point(this.x, this.y);
            p.cp1 = this.cp1.copy();
            p.cp2 = this.cp2.copy();
            return p;
        }
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
        {
            var path = new Path();
            for (var i = 0; i < this.pList.length; i++)
            {
                path.pList[i] = this.pList[i].copy();
            }
            return path;
        }
        {
            if (!isNaN(x) && !isNaN(y))
            {
                this.position.x = x;
                this.position.y = y;
                this.center = this.position;
            }
        }
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
        {
            if (this.pList.length)
                this.pList.add(this.pList[0]);
        }
        {
            graphics.beginPath();
            for (var i = 0; i < this.pList.length - 1; i++)
            {
                var p1 = this.pList[i];
                var p2 = this.pList[i + 1];
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
        {
            this.center = new Point(0, 0);
        }
        {
            this.from = 0;
        }
        {
            var loop = new ImageAnimation.Loop();
        }
        {
            this.enable = true;
        }
        {
            var t = this.enable;
        }
        {
            var ia = new ImageAnimation;
            {
                ia.fps = fps;
            }
        }
        {
        }
        {
            var ia = new ImageAnimation;
        }
        {
            this.position = new Point(x, y);
        }
        {
            var rx = this.position.x;
        }
        {
            this.clipX = clipX;
        }
        {
            this.playing = true;
        }
        {
            var t = this.playing;
            {
                this.onEnd();
            }
        }
        {
            this.playing = true;
        }
        {

        {
            graphics.drawImage(this.img, 0, 0, this.fWidth, this.fHeight, 0, 0, this.width, this.heigh);
        }
        {
            if (this.time == 0 && this.onBegine)
            {
                if (f > this.loop.to)
                {
                    this.loop.lt++;
                    {
                        this.loop.enable = false;
                    }
                    {
                        f -= this.loop.from;
                    }
                }
            }
            {
                if (f >= this.fCount && !this.reverse)
                {
                    this.frame = f = this.fCount - 1;
                }
                {
                    this.frame = f = 0;
                }
            {
                var F = f;
            }
        }
        {
            this.x = x;

        {
            return new Vector2(p2.x - p1.x, p2.y - p1.y);
        }
        {
            return new Vector2(this.x, this.y);
        }
        {
            return "(" + this.x + "," + this.y + ")";
        }
        {
            return Math.sqrt(this.x * this.x + this.y * this.y);
        }
        {
            return Math.sqrt(this.x * this.x + this.y * this.y);
        }
        {
            if (!(v instanceof Vector2))
        }
        {
            if (!(v instanceof Vector2))
        }
        {
            if (!isNaN(n))
            {
                this.x *= n;
            }
        }
        {
            if (!(u instanceof Vector2) || !(u instanceof Vector2))
            {
                throw new Error("u and v must be an Vector2.");
            }
        }
        {
            if (!(u instanceof Vector2) || !(u instanceof Vector2))
            {
                throw new Error("u and v must be an Vector2.");
            }
        }
        {
            if (!(u instanceof Vector2))
            {
                throw new Error("u must be an Vector2.");
            }
            {
                return (u.x * v.x + u.y * v.y);
            }
            {
                return (new Vector2(u.x * v, u.y * v));
            }
        }
        {
            if (isNaN(x) || isNaN(y))
        }
        {
            return new Point(this.x, this.y);
        }
        {
            return "(" + this.x + "," + this.y + ")";
        }
        {
            var x = this.x - o.x;
        }
        {
            if (!(this.lines instanceof Array))
            {
                if (this.lines[i] == l)
            }
        }
        {
            if (!(this.lines instanceof Array))
        }
        {

        {
            var p1 = _p1, p2 = _p2;
            {
                p1 = new Point(_p1.x, _p1.y, this);
            }
                p2.x && !isNaN(p2.x) && p2.y && !isNaN(p2.y)))
            {
                throw new Error("P1 or P2 is not a Point.");
            }
            {
                
                throw new Error("P1 or P2 is not a Point.");
            }*/
        }
        {
            var p1 = this.p1.copy();
        }
        {
            this.center.x = x;
        }
        {
            if (x == this.center.x && y == this.center.y)
        }
        {
            if (obj instanceof Line)
            {
                var p1 = this.p1;
            }
            {
                var v1 = new Vector2(obj.o.x - this.p1.x, obj.o.y - this.p1.y);
                {
                    return false;
                }
                {

            }
        }
        {
            graphics.beginPath();
        }
        {
            var obj = new GameObject();
            obj.graphic = this;
            return obj;
        }
        {
            this.id = null;
        }
        {
            this.target = target;
        }
        {
            var obj = new GameObject();
            {
                obj.graphic = this.graphic.copy ? this.graphic.copy() : this.graphic;
            }
            {
                obj.collider = this.collider.copy ? this.collider.copy() : this.collider;
            }
        }
        {
            this.F.x = 0;
        }
        {
            this.constantForce.x = 0;
        }
        {
            if (a instanceof Force)
            {
                if (b)
                {
                    this.constantForce.x += a.x;
                }
            }
            {
                throw new Error("Paramate must be a Number.");
            }
            {
                if (c)
                {
                    this.constantForce.x += a;
                }
            }
        }
        {

        {
            if (this.graphic)
        }
        {
            if (this._animCallback)
        }
        {
            this.position.x = x;
        }
        {
            if (this.graphic)
            {
                this.graphic.moveTo(this.graphic.position.x - this.position.x + x, this.graphic.position.y - this.position.y + y);
            }
            {
                this.collider.moveTo(this.collider.position.x - this.position.x + x, this.collider.position.y - this.position.y + y);
            }
        }
        {
            var startPosition = this.position.copy();
            {
                time += dt;
                {
                    gameObject._animCallback = null;
                }
            }
        }
        {
            if (!r)
        }
        {
            var circle = new Circle(this.r);
        }
        {
            this.o.x += x - this.position.x;
        }
        {
            this.position.x = x;
        }
        {
            if (x == this.position.x && y == this.position.y)
        }
        {
            var ctx = canvas.getContext("2d");
        }
        {
            graphics.beginPath();
        }
        {
            if (obj instanceof Line)
            {
                return obj.isCross(this);
            }
            {
                return this.isCollideWith(obj);
            }
        }
        {
            if (col instanceof Polygon)
            {
                for (var i = 0; i < col.E.length; i++)
                {
                    if (col.E[i].isCross(this))
                }
            }
            {
                var dx = this.o.x - col.o.x;
            }
            {
                if (col.o.x <= this.o.x && this.o.x <= col.o.x + col.width)
                {
                    if (col.o.y - this.r <= this.o.y && this.o.y <= col.o.y + col.height + this.r)
                        return true;
                }
                if (col.o.y <= this.o.y && this.o.y <= col.o.y + col.height)
                {
                    if (col.o.x - this.r <= this.o.x && this.o.x <= col.o.x + col.width + this.r)
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
        }
        {
            if (self.collider.static && target.collider.static)
            {
                var args = new GameObject.CollideEventArgs();
                {
                    args.target = target;
                }
                {
                    args.target = self;
                }
                {
                    return;

            }
            {
                var args = new GameObject.CollideEventArgs();
                {
                    args.target = target;
                }
                {
                    args.target = self;
                }
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
                {
                    vn = Vector2.multi(minL.norV, (v2.x * minL.norV.x + v2.y * minL.norV.y));
                    vt = new Vector2(v2.x - vn.x, v2.y - vn.y);
                }
                    var n = new Vector2(minP.x - circle.o.x, minP.y - circle.o.y);
                    var Ln = n.x * n.x + n.y * n.y;
                    vn = Vector2.multi(n, (n.x * v2.x + n.y * v2.y) / Ln);
                    vt = new Vector2(v2.x - vn.x, v2.y - vn.y);
                }
                else
                    return;
                if (!vn || !vt)
                    return;
                if (self.collider.static)
                {
                    v1.x = 2 * vn.x;
                    v1.y = 2 * vn.y;
                }
                else if (target.collider.static)
                {
                    v2.x = -vn.x;
                    v2.y = -vn.y;
                }
                else
                {
                    v1 = Vector2.multi(vn, (m2 + e * m2) / (m1 + m2));
                    v2 = Vector2.multi(vn, (m2 - e * m1) / (m1 + m2));
                }
            }
            {
                return;
            }
        }
        {
            if (!(v instanceof Array))
            {
                sumX += v[i].x;
            }
        }
        {
            var v = [];
        }
        {
            var v = [];
            {
                v[i] = new Point(this.V[i].x, this.V[i].y);
            }
        }
        {
            for (var i = 0; i < this.V.length; i++)
            {
                this.V[i].x = (this.V[i].x - this.center.x) + x;
            }
        }
        {
            this.center.x = x;
        }
        {
            if (!(col instanceof Polygon) && !(col instanceof Circle))
            {
                throw new Error("Something wrong with this polygon");
            }
            {
                if (!(col.E instanceof Array))
                {
                    throw new Error("Something wrong with the polygon");
                }
                    {

                        {
                        }
                    }
            }
            {
                for (var i = 0; i < this.E.length; i++)
                {
                    if (this.E[i].isCross(col))
                }
            }
        }
        {
            graphics.beginPath();
        }
        {
            w = isNaN(w) ? 0 : w;
            {
                var p = this.V[i];
                p.norV = new Vector2(p.x - this.center.x, p.y - this.center.y);
                p.tanV = new Vector2(-p.norV.y, p.norV.x);
            }
        }
        {
            var rect = new Rectangle(this.width, this.height);
        }
        {
            if (!isNaN(x) && !isNaN(y))
            {
                this.position.x = x;
            }
            {
                this.position.x = this.o.x + (x(this.width, this.height)).x;
            }
        }
        {
            var dx = x - this.position.x;
            {
                this.V[i].x += dx;
                this.V[i].y += dy;
            }

        {
            var ctx = canvas.getContext("2d");
        }
        {
            graphic.fillStyle = this.fillStyle;
        }
        {
            if (obj instanceof Ground)
            {
                return (!(this.o.x > obj.xR || this.o.x + this.width < obj.xL) && (this.o.y >= obj.y && obj.y >= this.o.y - this.height));
            }
            {
                return (!(this.o.y - this.height > obj.yH || this.o.y < obj.yL) && (this.o.x <= obj.x && obj.x <= this.o.x + this.width));
            }
            {
                if (this.o.x - obj.width <= obj.o.x && obj.o.x <= this.o.x + this.width
                 && this.o.y - obj.height <= obj.o.y && obj.o.y <= this.o.y + this.height)
                    return true;
                return false;
                var x1 = (obj.o.x - this.o.x) * (obj.o.x + obj.width - this.o.x);
                {
                    return false;
                }
            }
            {
                if (this.o.x <= obj.x && obj.x <= this.o.x + this.width && obj.y <= this.o.y && this.o.y - this.height <= obj.y)
            }
        }
        {
            if (self.collider.static && target.collider.static)
            {
                var args = new GameObject.CollideEventArgs();
                {
                    args.target = target;
                }
                {
                    args.target = self;
                }
                {
                    var dBottom = rect1.o.y - (rect2.o.y + rect2.height);
                    var dTop = (rect1.o.y + rect1.height) - rect2.o.y;
                    if (Math.abs(dBottom) < Math.abs(dTop))
                    {
    
                    }
                }*/
                {
                    dx = Math.abs((rect1.o.x + rect1.width) - rect2.o.x); //Distance from rect1.right to rect2.left
                {
                    dx = Math.abs((rect2.o.x + rect2.width) - rect1.o.x); //Distance from rect1.left to rect2.right
                {
                    dx = Math.min(Math.abs(rect1.o.x + rect1.width - rect2.o.x), Math.abs(rect2.o.x + rect2.width - rect1.o.x)); //Get min distance
                {
                    dy = Math.abs((rect1.o.y + rect1.height) - rect2.o.y); //Distance from rect1.top to rect2.bottom
                {
                    dy = Math.abs((rect2.o.y + rect2.height) - rect1.o.y); //Distance from rect1.bottom to rect2.top
                {
                    dy = Math.min(Math.abs(rect1.o.y + rect1.height - rect2.o.y), Math.abs(rect2.o.y + rect2.height - rect1.o.y)); //Get min distance
                    if (!rect1.static && !rect2.static)
                    {
                        v1.x = v2.x * ((m2 + e * m2) / (m1 + m2));
                    }
                    {
                        v2.x = -v2.x * e;
                    }
                        v1 = -v1.x * e;
                    }
                    {
                        self.moveTo(self.position.x + v1.x * t, self.position.y);
                        target.moveTo(target.position.x + v2.x * t, target.position.y);
                        /*
                        self.moveTo(self.position.x - (self.v.x * t) + (v1.x * (dt - t)), self.position.y);
                        */
                    }
                }
                    if (!rect1.static && !rect2.static)
                    {
                        v1.y = v2.y * ((m2 + e * m2) / (m1 + m2));
                    }
                    {
                        v2.y = -v2.y * e;
                    }
                    {
                        v1 = -v1.y * e;
                    }
                    {
                        self.moveTo(self.position.x, self.position.y + v1.y * t);
                        target.moveTo(target.position.x, target.position.y + v2.y * t);
                    }
                }
            }
            {
                if (self.collider.o.y - self.collider.height <= target.collider.y)
                {
                    var t = (self.collider.o.y - self.collider.height - target.collider.y) / self.v.y;
                }
            }
            {

            {
                return target.collider.collide(target, self, dt);
            }
        }
        {
            xL = isNaN(xL) ? 0 : xL;
        }
        {
            var g = new Ground(this.y, this.xL, this.xR);
        }
        {
            this.y = y;
        }
        {
            this.y = y;
        }
        {
            return;
        }
        {
            return;
        }
        {
            var obj = new GameObject();
        }
        {
            if (col instanceof Rectangle)
        }
        {
            if (obj.collider instanceof Rectangle)
        }
        {
            yL = isNaN(yL) ? 0 : yL;
        }
        {
            var w = new Wall(this.x, this.yL, this.yH);
        }
        {
            var obj = new GameObject();
        }
        {
            this.x = x;
        }
        {
            this.x += (x - this.position.x);
        }
        {
            if (col instanceof Rectangle)
        }
        {

    } catch (ex) { alert(ex.message); }
})(window.SardineFish);