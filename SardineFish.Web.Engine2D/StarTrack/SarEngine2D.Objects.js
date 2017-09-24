(function (Engine)
{
    if (!Engine)
    {
        throw new Error("Engine not found.");
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
        var position=this;
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
        this.center = new Point(0, 0);
        this.coordinate = Coordinate.Default;
        this.r = r;
        this.start = startAng;
        this.end = endAng;
        this.antiCW = antiCW;
        this.strokeStyle = new Color(0, 0, 0, 1);
        this.fillStyle = new Color(255, 255, 255, 0);
        this.strokeWidth = 1;
        this.lineCap = Graphics.LineCap.Square;
        this.shadowColor = null;
        this.shadowBlur = null;
        this.shadowOffset = new Vector2(0, 0);
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
    Arc.prototype.moveTo = function (x, y)
    {
        if (x == this.position.x && y == this.position.y)
            return;
        this.o.x = this.o.x - this.position.x + x;
        this.o.y = this.o.y - this.position.y + y;
        this.position.x = x;
        this.position.y = y;
    }
    Arc.prototype.setCenter = function (x, y)
    {
        this.center.x = x;
        this.center.y = y;
    }
    Arc.prototype.setPosition = function (x, y)
    {
        this.o.x += x - this.position.x;
        this.o.y += y - this.position.y;
        this.position.x = x;
        this.position.y = y;
    }
    Arc.prototype.rotate = function (rad, x0, y0)
    {
        this.o.rotate(rad, x0, y0);
        this.start += rad;
        this.end += rad;
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
        if (this.shadowColor) {
            graphics.shadowColor = this.shadowColor;
            graphics.shadowBlur = this.shadowBlur;
            graphics.shadowOffsetX = this.shadowOffset.x;
            graphics.shadowOffsetY = this.shadowOffset.y;
        }
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
    Combination.prototype.rotate = function (ang, x,y)
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
        var index=gameObject.links.indexOf(this);
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
        circle.strokeWidth=this.strokeWidth;
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
        this.o.rotate(rad, x, y);
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
    Circle.prototype.toGameObject = function (initCollider)
    {
        var gameObj = new GameObject();
        gameObj.graphic = this;
        if (initCollider)
            gameObj.collider = this;
        return gameObj;
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
    Polygon.prototype.isCollideWith = function (col,v1,v2,dt)
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
    Rectangle.prototype.isCollideWith = function (obj, v1,v2,dt)
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
            if (o.x <= obj.x && obj.x <= o.x + this.width &&  o.y <= obj.y && obj.y <= o.y + this.height)
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

})(window.SarEngine);