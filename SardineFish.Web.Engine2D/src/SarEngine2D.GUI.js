(function (Engine)
{
    if (!Engine)
    {
        throw new Error("Engine not found.");
    }

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

//-----BEGIN SarEngine2D.GUI-----

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

//-----END SarEngine2D.GUI-----

})(window.SarEngine);