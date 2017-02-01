﻿window.SarEngine=(function(engine){
try
{
        engine = engine || function ()
        {

        }
        engine.Version = 0.40;
    window.requestAnimationFrame = 
        window.requestAnimationFrame || 
        window.mozRequestAnimationFrame || 
        window.webkitRequestAnimationFrame || 
        window.msRequestAnimationFrame;
    engine.debug=function(){}
    engine.onError=null;
    engine.debug.write=null;
    engine.debug.writeLine=function(text,canvas)
    {
        if(!engine.debug.write)
            return;
        engine.debug.write(text+"\r\n");
        
    }
    engine.debug.clear=null;
    
    //-------LinkList
    function LinkList()
    {
        this.head=null;
        this.tail=null;
        this.count=0;
    }
    LinkList.version=1.2;
    LinkList.Node=function(obj, last, next)
    {
        this.object=obj;
        if(last)
            this.last=last;
        else
            this.last=null;
        if(next)
            this.next=next;
        else
            this.next=null;
    }
    LinkList.prototype.add=function(obj)
    {
        if(this.count<=0)
        {
            this.head=new LinkList.Node(obj,null,null);
            this.head.parent=this;
            this.tail=this.head;
            this.count=1;
            return this.head;
        }
        var node=new LinkList.Node(obj,this.tail,null);
        node.parent=this;
        this.tail.next=node
        this.tail=node;
        this.count++;
        return node;
    }
    LinkList.prototype.remove=function(node)
    {
        if (!(node instanceof LinkList.Node))
        {
            for (var p = this.head ; p != null; p = p.next)
            {
                if (p.object == node)
                    node = p;
            }
        }
        if(node.parent!=this)
        {
            throw new Error("The node doesn't belong to this link list");
        }
        if(node.last==null)
        {
            this.head=node.next;
        }
        else
            node.last.next=node.next;
        if(node.next==null)
        {
            this.tail=node.last;
        }
        else
            node.next.last = node.last;
        this.count--;
    }
    LinkList.prototype.foreach=function(callback)
    {
        if(!callback)
            throw new Error("A callback function is require.");
        var p=this.head;
        for(var p=this.head;p;p=p.next)
        {
            var br = callback(p.object, p);
            if (br)
                return;
        }
    }
    LinkList.prototype.toArray=function()
    {
        var ar=[];
        var i=0;
        this.foreach(function(obj,node)
        {
            ar[i]=obj;
            i++;
        });
        return ar;
    }
    if(!sar.Web.LinkList||!sar.Web.LinkList.version||sar.Web.LinkList.version < LinkList.version)
    {
        sar.Web.LinkList=LinkList;
        window.LinkList=LinkList;
    }
    

    

    //-------Align
    function Align(){}
    Align.topLeft=function (w,h)
    {
        return new Point(0,0);
    }
    Align.topCenter=function (w,h)
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
        return new Point(w/2, h);
    }
    Align.bottomRight = function (w, h)
    {
        return new Point(w, h);
    }
    window.Align = Align;

    //-------Force
    function Force(x,y,f)
    {
        this.x=0;
        this.y=0;
        if(x==undefined)
            return;
        if(x instanceof Vector2)
        {
            this.x=x.x;
            this.y=x.y;
        }
        else if(f)
        {
            var l=Math.sqrt(x*x+y*y);
            this.x=x*f/l;
            this.y=y*f/l;
        }
        else
        {
            this.x=x;
            this.y=y;
        }
    }
    Force.prototype.copy=function()
    {
        return new Force(this.x,this.y,this.f);
    }
    Force.prototype.toString=function()
    {
        return "("+this.x+","+this.y+")";
    }
    Force.prototype.getValue=function()
    {
        return Math.sqrt(this.x*this.x+this.y*this.y);
    }
    Force.prototype.toAcceleration=function(m)
    {
        return new Vector(this.x/m,this.y/m);
    }
    engine.Force=Force;
    window.Force = Force;

    //-------Mouse
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
    engine.Mouse = Mouse;
    window.Mouse = Mouse;

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
    engine.Touch = Touch;
    window.Touch = Touch;

    //-------Keyboard
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
    Keyboard.KeyState = {};
    Keyboard.KeyState.None = 0;
    Keyboard.KeyState.Down = 1;
    Keyboard.KeyState.Up = 2;
    Keyboard.KeyState.Pressed = 3;
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
    engine.Keyboard = Keyboard;
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

    function keyCodeToKey(keyCode)
    {

    }

    function CoordinateSys(pointToDefault, pointFromDefault, vectorToDefault, vectorFromDefault)
    {
        
    }

    function Layer()
    {

    }

    //-------Game
    function Game()
    {
        this.fps=0;
        this.scene=null;
        this.animationFrameId=null;
        this.status=GameStatus.NotRun;
        this.onStart=null;
        this.onUpdate=null;
        this.onPause=null;
        this.onResume=null;
        this.onEnd=null;
        this.onError=null;
    }
    function GameStatus() { }
    GameStatus.NotRun=1;
    GameStatus.Running=2;
    GameStatus.Paused=4;
    GameStatus.Starting=3;
    GameStatus.Pausing=6;
    GameStatus.Resuming=7;
    GameStatus.Ending=5;
    window.GameStatus=GameStatus;
    engine.GameStatus=GameStatus;
    Game.createByCanvas=function(canvas)
    {
        var game=new Game();
        var graphics = new Graphics(canvas);
        var scene=new Scene();
        scene.eventSource=canvas;
        game.setScene(scene);
        var camera=new Camera(0,0,0,0,1);
        camera.graphics=graphics;
        scene.camera=camera;   
        return game;
    }
    Game.prototype.setScene=function(scene)
    {
        this.scene = scene;
        scene.initEvents();
        scene.game=this;
    }
    Game.prototype.start=function()
    {
        this.status=GameStatus.Starting;
        var game=this;
        var lastDelay=0;
        function animationFrame(delay)
        {
            try{
            if(game.status==GameStatus.Starting)
            {
                game.status=GameStatus.Running;
                if(game.onStart)
                {
                    var args={cancel:false,handled:false};
                    game.onStart(args);
                    if(args.cancel)
                    {
                        game.status=GameStatus.NotRun;
                        return;
                    }
                }
                game.animationFrameId=requestAnimationFrame(animationFrame);
                return;
            }
            else if(game.status==GameStatus.Pausing)
            {
                if(game.onPause)
                {
                    var args={cancel:false,handled:false};
                    game.onPause(args);
                    if(args.cancel)
                    {
                        game.status=GameStatus.Running;
                    }
                    else
                    {
                        game.status=GameStatus.Paused;
                        return;
                    }
                }
                else
                {
                    game.status=GameStatus.Paused;
                    return;
                }
            }
            else if(game.status==GameStatus.Resuming)
            {
                //game.status=GameStatus.Running;
                if(game.onResume)
                {
                    var args={cancel:false,handled:false};
                    game.onResume(args);
                    if(args.cancel)
                    {
                        game.status=GameStatus.Paused;
                        return;
                    }
                }
                game.status=GameStatus.Running;
                game.animationFrameId=requestAnimationFrame(animationFrame);
                return;
            
            }
            else if(game.status==GameStatus.Ending)
            {
                if(game.onEnd)
                {
                    var args={cancel:false,handled:false};
                    game.onEnd(args);
                    if(args.cancel)
                    {
                        game.status=GameStatus.Running;
                    }
                    else if(game.status == GameStatus.Ending)
                    {
                        game.status=GameStatus.NotRun;
                        return;
                    }
                }
                else
                {
                    game.status=GameStatus.NotRun;
                    return;
                }
            }
            
            var x=delay;
            //delay=delay-lastDelay;
            delay = 13;
            lastDelay=x;
            /*if(engine.debug.clear)
                engine.debug.clear();
            game.fps = int(1000 / delay);
         engine.debug.writeLine("fps="+game.fps);
            */
            if(game.onUpdate)
                game.onUpdate(delay,this);
            game.scene.updateFrame(delay);
            game.animationFrameId=requestAnimationFrame(animationFrame);
            
            }
            catch(ex)
            {
alert("animationFrame:"+ex.message);
                if(game.onError)
                    game.onError(ex);
            }
        }
        this.end=function()
        {
            if(game.status==GameStatus.NotRun)
                throw new Error("Game not run.");
            game.status=GameStatus.Ending;
        }
        this.pause=function()
        {
            if(game.status==GameStatus.Running || game.status==GameStatus.Resuming || game.status==GameStatus.Starting)
            {
                game.status=GameStatus.Pausing;
            }
            else if(game.status==GameStatus.NotRun)
                throw new Error("Game not run.");
            else
                throw new Error("Pause invailable.");
        }
        this.resume=function()
        {
            if(game.status!=GameStatus.Paused)
                throw new Error("Game not paused");
            game.status=GameStatus.Resuming;
            game.animationFrameId=requestAnimationFrame(animationFrame);
        }
        if(!this.scene)
            return false;
        this.animationFrameId=requestAnimationFrame(animationFrame);
        this.status=GameStatus.Starting;
    }
    Game.prototype.end=function()
    {
        throw new Error("Game not run.");
    }
    Game.prototype.pause=function()
    {
        throw new Error("Game not run.");
    }
    Game.prototype.resume=function()
    {
        throw new Error("Game not run.");
    }
    engine.Game=Game;
    window.Game = Game;

    //-------Scene
    function Scene()
    {
        this.game = null;
        this.objectList = new LinkList();
        this._objList = [];
        this.physics = new Scene.Physics();
        this.camera = null;
        this.GUI = null;
        this.device = new Device();
        this.doubleClickDelay = 200;
        this.onUpdate=null;
        this.onRender = null;
        this.onEndRender = null;
        this.eventSource = null;
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
        this._objList.add = function (node)
        {
            this[this.length] = node;
            return this.length-1;
        }
    }
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
        this.g=new Vector2(0,0);
        this.f=0;
        return;
    }
    Scene.prototype.reset = function ()
    {
        this.camera = null;
        this.objectList = new LinkList();
        this._objList = [];
        if (this.physics)
            this.physics.reset();
        this._objList.add = function (node)
        {
            this[this.length] = node;
            return this.length-1;
        }
    }
    Scene.prototype.physicalSimulate = function (dt)
    {
        var scene = this;
        this.objectList.foreach(function (obj, node)
        {

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
            if(obj.collider&&obj.collider.angV)
            {
                var w=obj.collider.angV;
                var ang=w*dt;
                obj.rotate(obj.collider.center,ang);
            }
            obj.resetForce();
            if (obj.collider)
                obj.collider.landed = false;
        });
        this.objectList.foreach(function (obj, node)
        {
            //try{
            if (obj.collider && obj.collider.rigidBody)
            {
                for (p = node.next; p; p = p.next)
                {
                    var target = p.object;
                    if (target.collider && target.collider.rigidBody)
                    {

                        if (obj.collider.isCollideWith(target.collider))
                        {
                            
                            obj.collider.collide(obj, target, dt);
                        }
                    }
                }
            }
            //}catch(ex){ alert("collide:"+ex.message);throw ex;}
        });
    }
    Scene.prototype.render = function (dt)
    {
        var scene = this;
        if (!this.camera)
            return;
        scene.camera.clear();
        if(scene.onRender)
            scene.onRender(scene.camera.graphics,dt);
        //scene.camera.graphics.clearRect(scene.camera.center.x - scene.camera.width / 2, scene.camera.center.y + scene.camera.height / 2, scene.camera.width, scene.camera.height);
        this.objectList.foreach(function (obj, node)
        {
            //alert(obj.graphic.r);
            if (obj.onRender)
                obj.onRender(obj, dt);
            obj.render(scene.camera.graphics, obj.position.x, obj.position.y, 0, dt);
            //obj.drawToCanvas(scene.game.graphics.canvas, obj.position.x, obj.position.y, 0, dt);
        });
        if (!scene.GUI)
            return;
        scene.camera.resetTransform();
        scene.GUI.render(scene.camera.graphics);
        if (this.onEndRender)
            this.onEndRender();
    }
    Scene.prototype.updateFrame = function (delay)
    {
try{
        var scene = this;
        var dt = delay / 1000;
        //dt=0.016;
        this.objectList.foreach(function (obj, node)
        {
            if (obj.deleted)
                return;
            if (obj.onUpdate)
                obj.onUpdate(obj, dt);
        });
var whileRender=true;
        this.render(dt);
whileRender=false;
        this.physicalSimulate(dt);
        //this.render(dt);
} catch(ex){ alert(whileRender+ex.message); }
    }
    Scene.prototype.initEvents = function ()
    {
        var scene = this;
        var pressedKeyList = [];
        var touchArray = [];
        var touchArrayGUI = [];
        var touchList = new LinkList();
        var touchListGUI = new LinkList();
        var clickTime = 0;
        this.eventSource.addEventListener("mousemove", function (e)
        {
            var mapTo = scene.camera.map(e.pageX, e.pageY);
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
            if (scene.GUI)
                scene.GUI.mouseMoveCallback(e);
            if (args.handled)
                return;

            /*args.x = (e.pageX / scene.camera.zoom) + (scene.camera.center.x - scene.camera.width / 2);
            args.y = (scene.camera.height - e.pageY / scene.camera.zoom) + (scene.camera.center.y - scene.camera.height / 2);*/
            args.x = mapTo.x;
            args.y = mapTo.y;

            if (scene.onMouseMove)
                scene.onMouseMove(args);
        });
        this.eventSource.addEventListener("mouseover", function (e)
        {
            var args = new MouseEventArgs();
            args.x = scene.camera.map(e.pageX, e.pageY).x;
            args.y = scene.camera.map(e.pageX, e.pageY).y;
            args.button = e.button;
            args.buttonState = Mouse.ButtonState.None;
            args.handled = false;
            if (scene.onMouseOver)
                scene.onMouseOver(args);
        });
        this.eventSource.addEventListener("mouseout", function (e)
        {
            var args = new MouseEventArgs();
            args.x = scene.camera.map(e.pageX, e.pageY).x;
            args.y = scene.camera.map(e.pageX, e.pageY).y;
            args.button = e.button;
            args.buttonState = Mouse.ButtonState.None;
            args.handled = false;
            if (scene.onMouseOut)
                scene.onMouseOut(args);
        });
        this.eventSource.addEventListener("mousedown", function (e)
        {
            var mapTo = scene.camera.map(e.pageX, e.pageY);
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
            scene.objectList.foreach(function (obj, node)
            {
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
            });
            if (args.handled)
                return;
            if (scene.onMouseDown)
                scene.onMouseDown(args);
        });
        this.eventSource.addEventListener("mouseup", function (e)
        {
            var mapTo = scene.camera.map(e.pageX, e.pageY);
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
            
            scene.objectList.foreach(function (obj, node)
            {
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
            });
            if (args.handled)
                return;
            if (scene.onMouseUp)
                scene.onMouseUp(args);
        });
        this.eventSource.addEventListener("mousewheel", function (e)
        {
            var mapTo = scene.camera.map(e.pageX, e.pageY);
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

            scene.objectList.foreach(function (obj, node)
            {
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
            });
            if (args.handled)
                return;
            if (scene.onMouseWheel)
                scene.onMouseWheel(args);
        });
        this.eventSource.addEventListener("click", function (e)
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

                args.x = scene.camera.map(e.pageX, e.pageY).x;
                args.y = scene.camera.map(e.pageX, e.pageY).y;

                clickTime = 0;
                scene.objectList.foreach(function (obj, node)
                {
                    if (obj.hitTest && obj.onDoubleClick && obj.collider)
                    {
                        var p = new Point(args.x, args.y);
                        if (obj.collider.isCollideWith(p))
                        {
                            obj.onDoubleClick(args)
                            if (args.handled)
                                return true;
                        }
                    }
                });
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

                args.x = scene.camera.map(e.pageX, e.pageY).x;
                args.y = scene.camera.map(e.pageX, e.pageY).y;

                clickTime = t;
                scene.objectList.foreach(function (obj, node)
                {
                    if (obj.hitTest && obj.onClick && obj.collider)
                    {
                        var p = new Point(args.x, args.y);
                        if (obj.collider.isCollideWith(p))
                        {
                            obj.onClick(args);
                            if (args.handled)
                                return true;
                        }
                    }
                });
                if (args.handled)
                    return;

                if (scene.onClick)
                    scene.onClick(args);
            }
        });
        window.addEventListener("keydown", function (e)
        {
            scene.device.keyboard.keys[e.keyCode] = Keyboard.KeyState.Down;

            if (!pressedKeyList[e.keyCode])
            {
                pressedKeyList[e.keyCode] = true;
                var args = new KeyEventArgs();
                args.key = e.keyCode;
                args.keyName = Keyboard.Keys.toString(args.key);
                args.keyState = Keyboard.KeyState.Down;
                args.ctrl = e.ctrlKey;
                args.alt = e.altKey;
                args.shift = e.shiftKey;
                args.handled = false;
                e.key = keyCodeToKey(e.keyCode);
                if (scene.onKeyDown)
                    scene.onKeyDown(args);
            }
        });
        window.addEventListener("keyup", function (e)
        {
            scene.device.keyboard.keys[e.keyCode] = Keyboard.KeyState.Up;

            if (pressedKeyList[e.key.toUpperCase()])
            {
                pressedKeyList[e.key.toUpperCase()] = false;
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
        });
        window.addEventListener("keypress", function (e)
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
        });
        this.eventSource.addEventListener("touchstart", function (e)
        {
            for (var i = 0; i < e.changedTouches.length ; i++)
            {
                var t = new Touch(e.changedTouches[i].identifier);
                t.x = scene.camera.map(e.changedTouches[i].pageX, e.changedTouches[i].pageY).x;
                t.y = scene.camera.map(e.changedTouches[i].pageX, e.changedTouches[i].pageY).y;
                t.type = Touch.Types.Start;
                scene.device.touches.add(t);

                var argsGUI = new Touch.TouchEventArgs();
                argsGUI.type = Touch.Types.Start;
                argsGUI.id = e.changedTouches[i].identifier;
                argsGUI.x = e.changedTouches[i].pageX;
                argsGUI.y = e.changedTouches[i].pageY;
                touchListGUI.add(argsGUI);
                touchArrayGUI[argsGUI.id] = argsGUI;
                argsGUI.touches = touchListGUI.toArray();

                var args = argsGUI.copy();
                args.x = scene.camera.map(e.changedTouches[i].pageX, e.changedTouches[i].pageY).x;
                args.y = scene.camera.map(e.changedTouches[i].pageX, e.changedTouches[i].pageY).y;
                touchList.add(args);
                touchArray[args.id] = args;
                args.touches = touchList.toArray();

                if (scene.GUI)
                    scene.GUI.touchStartCallback(argsGUI);
                if (argsGUI.handled)
                    continue;
                if (scene.onTouchStart)
                    scene.onTouchStart(args);
            }
        });
        this.eventSource.addEventListener("touchmove", function (e)
        {
            for (var i = 0; i < e.changedTouches.length ; i++)
            {
                var mapTo = scene.camera.map(e.pageX, e.pageY);
                var id = e.changedTouches[i].identifier;
                var t = scene.device.touches.id(id);
                t.dx = mapTo.x - scene.device.mouse.x;
                t.dy = mapTo.y - scene.device.mouse.y;
                t.x = mapTo.x;
                t.y = mapTo.y;
                t.type = Touch.Types.Move;

                if (!touchArray[id] || !touchArrayGUI[id])
                    continue;

                var argsGUI = touchArrayGUI[id];
                argsGUI.type = Touch.Types.Move;
                argsGUI.touches = touchListGUI.toArray();
                argsGUI.x = e.changedTouches[i].pageX;
                argsGUI.y = e.changedTouches[i].pageY;

                var args = touchArray[id];
                args.type = Touch.Types.Move;
                args.x = scene.camera.map(e.changedTouches[i].pageX, e.changedTouches[i].pageY).x;
                args.y = scene.camera.map(e.changedTouches[i].pageX, e.changedTouches[i].pageY).y;
                args.touches = touchList.toArray();

                if (scene.GUI)
                    scene.GUI.touchMoveCallback(argsGUI);
                if (argsGUI.handled)
                    continue;

                if (scene.onTouchMove)
                    scene.onTouchMove(args);
            }
        });
        this.eventSource.addEventListener("touchend", function (e)
        {
            try
            {

                for (var i = 0; i < e.changedTouches.length ; i++)
                {
                    var id = e.changedTouches[i].identifier;
                    scene.device.touches.removeId(id);

                    if (!touchArray[id] || !touchArrayGUI[id])
                        continue;

                    var argsGUI = touchArrayGUI[id];
                    touchArrayGUI[id] = null;
                    touchListGUI.remove(argsGUI);
                    argsGUI.type = Touch.Types.End;
                    argsGUI.id = e.changedTouches[i].identifier;
                    argsGUI.touches = touchListGUI.toArray();
                    argsGUI.x = e.changedTouches[i].pageX;
                    argsGUI.y = e.changedTouches[i].pageY;

                    var args = touchArray[id];
                    args.type = Touch.Types.End;
                    args.touches = touchList.toArray();
                    args.x = scene.camera.map(e.changedTouches[i].pageX, e.changedTouches[i].pageY).x;
                    args.y = scene.camera.map(e.changedTouches[i].pageX, e.changedTouches[i].pageY).y;

                    if (scene.GUI)
                        scene.GUI.touchEndCallback(argsGUI);
                    if (args.handled)
                        continue;
                    if (scene.onTouchEnd)
                        scene.onTouchEnd(args);
                }
            }
            catch (ex)
            {
                alert(ex.message);
            }
        });
    }
    Scene.prototype.addGameObject = function (obj)
    {
        if(obj.id>=0)
        {
            //alert(obj.id);
            throw new Error("Object existed.");
        }
        var node = this.objectList.add(obj);
        obj.id = this._objList.add(node);
        //alert(obj.id);
        return obj.id;
    }
    Scene.prototype.removeGameObject = function (id)
    {
        if(id==null || id<0 || isNaN(id))
            throw new Error("Invalid id.");
        var node = this._objList[id];
        node.object.deleted = true;
        if (!node)
            throw new Error("Object not existed.");
        this.objectList.remove(node);
        this._objList[id] = null;
        node.object.id=-1;
    }
    engine.Scene = Scene;
    window.Scene = Scene;

    function Camera(x, y, w, h, z)
    {
        this.center = new Point(x, y);
        this.position = new Point(x, y);
        this.width = w;
        this.height = h;
        this.zoom = z;
        this.rotate = 0;
        this.graphics = null;
    }
    Camera.prototype.copy = function ()
    {
        var c = new Camera(this.x, this.y, this.width, this.height, this.zoom);
        c.graphics = this.graphics;
        return c;
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
        this.center.x += (x - this.position.x);
        this.center.y += (y - this.position.y);
        this.position.x = x;
        this.position.y = y;
        if (!this.graphics || !this.graphics.ctx)
            return;
        //this.resetTransform();
    }
    Camera.prototype.zoomTo = function (z,x,y)
    {
        var k=this.zoom/z;
        this.zoom = z;
        if(!isNaN(x) && !isNaN(y))
        {
            
            var ox=this.center.x;
            var oy=this.center.y;
            ox=x-((x-ox)*k);
            oy=y-((y-oy)*k);
            this.moveTo(ox,oy);
        }
        if (!this.graphics || !this.graphics.ctx)
            return;
        //this.resetTransform();
    }
    Camera.prototype.rotateTo = function (angle)
    {
        this.rotate = angle;
        if (!this.graphics || !this.graphics.ctx)
            return;
    }
    Camera.prototype.resetTransform=function()
    {
        //alert(this.graphics);
        this.graphics.ky=1;
        this.graphics.setTransform(1, 0, 0, 1, 0, 0);
    }
    Camera.prototype.clear=function(bgColor)
    {
        if (!this.graphics || !this.graphics.ctx)
            return;
        this.resetTransform();
        this.graphics.ctx.clearRect(0,0,this.graphics.canvas.width,this.graphics.canvas.height);
        //this.graphics.ctx.fillStyle="rgba(255,255,255,0.1)";
        if(bgColor)
            this.graphics.ctx.fillStyle=bgColor;
        this.graphics.ctx.fillRect(0,0,this.graphics.canvas.width,this.graphics.canvas.height);
        this.applyTransform();
    }
    Camera.prototype.applyTransform=function ()
    {
        if (!this.graphics || !this.graphics.ctx)
            return;
        var sinA = Math.sin(this.rotate);
        var cosA = Math.cos(this.rotate);
        var rw = this.graphics.width;//real width
        var rh = this.graphics.height;//real height
        this.width = this.graphics.canvas.width / this.zoom;
        this.height = this.graphics.canvas.height / this.zoom;
        //move to center
        this.graphics.setTransform(1, 0, 0, 1, rw / 2, rh / 2);
        //apply rotation
        this.graphics.transform(cosA, sinA, -sinA, cosA, 0, 0);
        //apply zoom
        this.graphics.transform(this.zoom, 0, 0, this.zoom, 0, 0);
        //move camera center
        this.graphics.transform(1, 0, 0, 1, -this.position.x, this.position.y);

        this.graphics.ky = -1;
    }
    Camera.prototype.map=function(x,y)
    {
        return new Point((x / this.zoom) + (this.center.x - this.width / 2),(this.height - y / this.zoom) + (this.center.y - this.height / 2));
    }
    engine.Camera = Camera;
    window.Camera = Camera;

    function GUI()
    {
        
    }
    function Button(context)
    {
    }
    function TextBlock(text)
    {
    }
    function Joystick()
    {
    }

    function Output()
    {

    }

    function Background()
    {

    }
    

    //-------Graphics
    function Graphics(canvas)
    {
        if(!canvas)
            throw new Error("paramter error.");
        if(!canvas.getContext)
            throw new Error("paramter 1 must be a canvas");
        this.canvas=canvas;
        this.ctx=canvas.getContext("2d");
        this.o = new Point(0, 0);
        this.zoom = 0;
        this.rotation = 0;
        this.kx=1,ky=1,kw=1,kh=1;
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
        var lineWidth=1;
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
    Graphics.CompositeOperation = (function (){ var co = {}; co.SourceOver = "source-over"; co.SourceAtop = "source-atop"; co.SourceIn = "source-in"; co.SourceOut = "source-out"; co.DestinationOver = "destination-over"; co.DestinationAtop = "destination-atop"; co.DestinationIn = "destination-in"; co.DestinationOut = "destination-out"; co.Lighter = "lighter"; co.Copy = "copy"; co.Xor = "xor"; return co; })();
    Graphics.drawLine=function(canvas, x1, y1, x2, y2, color)
    {
        if(!canvas)
            throw new Error("paramter error.");
        if(!canvas.getContext)
            throw new Error("paramter 1 must be a canvas");
        
        ctx=canvas.getContext("2d");
        ctx.beginPath();    
        ctx.moveTo(this.kx*x1,this.ky*y1);
        ctx.lineTo(this.kx*x2,this.ky*y2);
        if(color)
            ctx.strokeStyle=color;
        ctx.stroke();
    }
    Graphics.drawArc=function (canvas,x,y,r,ang1,ang2,antiCW,color)
    {
        var ctx=canvas.getContext("2d");
        ctx.beginPath();
        ctx.arc(this.kx*x,this.ky*y,r,ang1,ang2,antiCW);
        ctx.strokeStyle=color;
        ctx.stroke();
    }
    Graphics.drawCircle=function(canvas,x,y,r,strokeStyle,fillStyle,strokeWidth)
    {
        var ctx=canvas.getContext("2d");
        ctx.beginPath();
        ctx.arc(this.kx*x,this.ky*y,r,0,Math.PI*2);
        ctx.strokeStyle=strokeStyle;
        ctx.fillStyle=fillStyle;
        ctx.lineWidth=strokeWidth;
        ctx.fill();
        ctx.stroke();
    }
    Graphics.drawImage = function (canvas, img, sx, sy, swidth, sheight, x, y, width, height)
    {
        var ctx = canvas.getContext("2d");
        ctx.drawImage(img, sx, sy, swidth, sheight, this.kx*x, this.ky*y, this.kw*width, this.kh*height);
    }
    Graphics.fillRect=function(canvas,x,y,w,h,color)
    {
        if(!canvas)
            throw new Error("paramter error.");
        if(!canvas.getContext)
            throw new Error("paramter 1 must be a canvas");
        ctx=canvas.getContext("2d");
        ctx.fillStyle=color? color:"black";
        ctx.fillRect(this.kx*x,this.ky*y,this.kw*w,this.kh*h);
            
    }
    Graphics.clear=function(canvas, color)
    {
        if(!canvas)
            throw new Error("paramter error.");
        if(!canvas.getContext)
            throw new Error("paramter 1 must be a canvas");
        var ctx=canvas.getContext("2d");
        ctx.clearRect(0,0,canvas.width,canvas.height);
        /*/ctx.fillStyle = 'rgba(255,255,255,0.05)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);*/
        if(color)
        {
            ctx.fillStyle=color;
            ctx.fillRect(0,0,width,height);
        }
    }
    Graphics.clearRect=function(canvas,x,y,width,height)
    {
        var ctx=canvas.getContext("2d");
        ctx.clearRect(this.kx*x,this.ky*y,this.kw*width,this.kh*height); 
    }
    Graphics.prototype.rect = function (x, y, width, height)
    {
        return this.ctx.rect(this.kx*x, this.ky*y, this.kw*width, this.kh*height);
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
        this.ctx.moveTo(this.kx*x + r, this.ky*y);
        this.ctx.lineTo(this.kx*x + this.kw*width - r, this.ky*y);
        this.ctx.arcTo(this.kx*x + this.kw*width, this.ky*y, this.kx*x + this.kw*width, this.ky*y + r, r);
        this.ctx.lineTo(this.kx*x + this.kw*width, this.ky*y + this.kh*height - r);
        this.ctx.arcTo(this.kx*x + this.kw*width, this.ky*y + this.kh*height, this.kx*x + this.kw*width - r, this.ky*y + this.kh*height, r);
        this.ctx.lineTo(this.kx*x + r, this.ky*y + this.kh*height);
        this.ctx.arcTo(this.kx*x, this.ky*y + this.kh*height, this.kx*x, this.ky*y + this.kh*height - r, r);
        this.ctx.lineTo(this.kx*x, this.ky*y + r);
        this.ctx.arcTo(this.kx*x, this.ky*y, this.kx*x + r, this.ky*y, r);
        this.ctx.closePath();
        return;
    }
    Graphics.prototype.fillRect = function (x, y, width, height)
    {
        this.ctx.fillStyle = this.fillStyle;
        return this.ctx.fillRect(this.kx*x, this.ky*y, this.kw*width, this.kh*height);
    }
    Graphics.prototype.strokeRect = function (x, y, width, height)
    {
        this.ctx.lineCap = this.lineCap;
        this.ctx.lineJoin = this.lineJoin;
        this.ctx.lineWidth = this.strokeWidth;
        this.ctx.miterLimit = this.miterLimit;
        this.ctx.strokeStyle = this.strokeStyle;
        return this.ctx.strokeRect(this.kx*x, this.ky*y, this.kw*width, this.kh*height);
    }
    Graphics.prototype.fillRoundRect = function (x, y, width, height, r)
    {
        this.roundRect(this.kx*x, this.ky*y, this.kw*width, this.kh*height, r);
        this.fill();
    }
    Graphics.prototype.strokeRoundRect = function (x, y, width, height, r)
    {
        this.roundRect(this.kx*x, this.ky*y, this.kw*width, this.kh*height, r);
        this.stroke();
    }
    Graphics.prototype.clearRect = function (x, y, width, height)
    {
        this.ctx.clearRect(this.kx*x, this.ky*y, this.kw*width, this.kh*height);
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
        return this.ctx.moveTo(this.kx*x, this.ky*y);
    }
    Graphics.prototype.closePath = function ()
    {
        return this.ctx.closePath();
    }
    Graphics.prototype.lineTo = function (x, y)
    {
        return this.ctx.lineTo(this.kx*x, this.ky*y);
    }
    Graphics.prototype.clip = function ()
    {
        return this.ctx.clip();
    }
    Graphics.prototype.quadraticCurveTo = function (cpx, cpy, x, y)
    {
        return this.ctx.quadraticCurveTo(this.kx*cpx, this.ky*cpy, this.kx*x, this.ky*y);
    }
    Graphics.prototype.bezierCurveTo = function (cp1x, cp1y, cp2x, cp2y, x, y)
    {
        return this.ctx.bezierCurveTo(this.kx*cp1x, this.ky*cp1y, this.kx*cp2x, this.ky*cp2y, this.kx*x, this.ky*y);
    }
    Graphics.prototype.arc = function (x, y, r, sAngle, eAngle, antiCW)
    {
        return this.ctx.arc(this.kx*x, this.ky*y, r, sAngle, eAngle, antiCW);
    }
    Graphics.prototype.arcTo = function (x1, y1, x2, y2, r)
    {
        return this.ctx.arcTo(this.kx*x1, this.ky*y1, this.kx*x2, this.ky*y2, r);
    }
    Graphics.prototype.isPointInPath = function (x, y)
    {
        return this.ctx.isPointInPath(this.kx*x, this.ky*y);
    }
    Graphics.prototype.scale = function (scalewidth, scaleheight)
    {
        return this.ctx.scale(scalewidth, scaleheight);
    }
    Graphics.prototype.rotate = function (angle)
    {
        return this.ctx.rotate(angle);
    }
    Graphics.prototype.translate = function (x, y)
    {
        return this.ctx.translate(this.kx*x, this.ky*y);
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
        this.ctx.font=this.font.toString();
        this.ctx.textAlign=this.textAlign;
        this.ctx.textBaseline=this.textBaseline;
        this.ctx.fillStyle = this.fillStyle;
//this.ctx.fillText("2333333", 100, 100, -1);
        if(maxWidth)
            return this.ctx.fillText(text, this.kx*x, this.ky*y, this.kw*maxWidth);
        else
            return this.ctx.fillText(text, this.kx*x, this.ky*y);
    }
    Graphics.prototype.strokeText = function (text, x, y, maxWidth)
    {
        this.ctx.font=this.font.toString();
        this.ctx.fontAlign=this.fontAlign;
        this.ctx.textBaseline=this.textBaseline;
        this.ctx.lineCap = this.lineCap;
        this.ctx.lineJoin = this.lineJoin;
        this.ctx.lineWidth = this.strokeWidth;
        this.ctx.miterLimit = this.miterLimit;
        this.ctx.strokeStyle = this.strokeStyle;
        return this.ctx.strokeText(text, this.kx*x, this.ky*y, this.kw*maxWidth);
    }
    Graphics.prototype.measureText = function (text)
    {
        this.ctx.font=this.font.toString();
        this.ctx.fontAlign=this.fontAlign;
        this.ctx.textBaseline=this.textBaseline;
        return this.ctx.measureText(text);
    }
    Graphics.prototype.drawImage = function (img, sx, sy, swidth, sheight, x, y, width, height)
    {
        if (isNaN(x) && !isNaN(sx))
        {
            return this.ctx.drawImage(img, sx, sy, swidth, sheight);
        }
        else
            return this.ctx.drawImage(img, sx, sy, swidth, sheight, this.kx*x, this.ky*y, this.kw*width, this.kh*height);
    }
    Graphics.prototype.drawLine = function (x1, y1, x2, y2)
    {
        this.ctx.lineCap = this.lineCap;
        this.ctx.lineJoin = this.lineJoin;
        this.ctx.lineWidth = this.strokeWidth;
        this.ctx.miterLimit = this.miterLimit;
        this.ctx.strokeStyle = this.strokeStyle;

        this.beginPath();
        this.moveTo(this.kx*x1, this.ky*y1);
        this.lineTo(this.kx*x2, this.ky*y2);
        this.stroke();
    }
    
    sar.Color = (function (color)
    {
        Object.defineProperty(window, "Color", {
            get: function ()
            {
                return color;
            },
            set: function (value)
            {
                if (!color)
                    color = value;
                if (!value || !value.version || value.version < color.version)
                    return;
                color = value;
            }
        });
        if (color && color.version && color.version > 1.0)
            return;
        //-------Color
        function Color(r, g, b, a)
        {
            r = int(r);
            g = int(g);
            b = int(b);
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
        Color.version = 1.0;
        Color.random = function ()
        {
            return new Color(Math.random() * 255, Math.random() * 255, Math.random() * 255, 1.0);
        }
        Color.prototype.copy = function ()
        {
            return new Color(this.red, this.green, this.blue, this.alpha);
        }
        Color.prototype.toString = function ()
        {
            return "rgba(" + this.red.toString() + "," + this.green.toString() + "," + this.blue.toString() + "," + this.alpha.toString() + ")";
        }
        window.Color = Color;
        return Color;
    })(sar.Color);

    engine.Graphics=Graphics;
    window.Graphics=Graphics;

    //-------Image
    /*function Image()
    {
        this.width=0;
        this.height=0;
        this.center=new Point(0,0);
    }
    Image.create=function (width,height,color)
    {
    }
    Image.fromUrl=function (url)
    {
    }
    Image.prototype.copy=function()
    {
    }
    Image.prototype.drawToCanvas=function(canvas,x,y,r,dt)
    {
    }
    engine.Image=Image;
    window.Image=Image;*/

    //-------FontStyle
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
    function FontStyle(){}
    FontStyle.Normal="normal";
    FontStyle.Italic="italic";
    FontStyle.Oblique = "oblique";
    window.FontStyle = FontStyle;
    function FontVariant(){}
    FontVariant.Normal="normal";
    FontVariant.SmallCaps = "small-caps";
    window.FontVariant = FontVariant;
    function FontWeight(){}
    FontWeight.Normal="normal";
    FontWeight.Bold="bold";
    FontWeight.Bolder="bolder";
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

    //-------Text
    function Text(text)
    {
        this.text = text;
        this.font = new Font("sans-serif", 16);
        this.position = new Point(0, 0);
        this.center = new Point(0, 0);
        this.fillStyle=new Color(0,0,0,1);
        this.strokeStyle = new Color(255, 255, 255, 0);
        this.onRender = null;
    }
    Text.prototype.copy=function()
    {
        var text=new Text(this.text);
        text.font = this.font.copy();
        text.position = this.position.copy();
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
    Text.prototype.drawToCanvas=function(canvas,x,y,r,dt)
    {
        var ctx=canvas.getContext("2d");
        ctx.font = this.fontStyle + " " 
                 + this.fontVariant + " "
                 + this.fontWeight + " "
                 + this.fontSize + "px "
                 + this.fontFamily;
        ctx.fillStyle=this.fillStyle;
        ctx.strokeStyle=this.strokeStyle;
        ctx.fillText(this.text,x,y);
        ctx.strokeText(this.text,x,y);
    }
    Text.prototype.render = function (graphics, x, y, r, dt)
    {
        if (!graphics || !graphics.ctx)
            return;
        if (this.onRender)
            this.onRender();

        graphics.textAlign = TextAlign.Left;
        graphics.textBaseline = TextBaseline.Top;
        graphics.font = this.font;
        graphics.fillStyle=this.fillStyle;
        graphics.strokeStyle=this.strokeStyle;
        graphics.fillText(this.text, this.center.x, this.center.y);
        graphics.strokeText(this.text, this.center.x, this.center.y);
    }
    engine.Text=Text;
    window.Text = Text;

    engine.Image = function (img)
    {
        if (!img)
            img = new window.Image();
        this.img = img;
        this.position = new Point(0, 0);
        this.o = new Point(0, 0);
        this.onRender = null;

        var obj = this;
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
    engine.Image.prototype.copy = function ()
    {
        var img = new engine.Image(img);
        img.position = this.position.copy();
        img.o = this.o.copy();
        img.onRender = this.onRender;
    }
    engine.Image.prototype.setCenter = function (x, y, align)
    {
        this.position = new Point(x, y);
        if (!align)
            throw new Error("未指定对齐方式");
        this.o = align(this.width, this.height);
        this.o.x = x - this.o.x;
        this.o.y = y + this.o.y;
    }
    engine.Image.prototype.moveTo = function (x, y)
    {
        var rx = this.position.x;
        var ry = this.position.y;
        this.position.x = x;
        this.position.y = y;
        this.o.x = this.o.x - rx + x;
        this.o.y = this.o.y - ry + y;
    }
    engine.Image.prototype.loadFromUrl = function (url, width, height, callback)
    {
        this.img = new window.Image();
        var me = this;
        this.img.onload = function (e)
        {
            me.width = me.img.naturalWidth;
            me.height = me.img.naturalHeight;
            if (!width)
                return;
            if (!height)
            {
                width();
                return;
            }
            if (!callback)
            {
                me.img.width = width;
                me.img.height = height;
                return;
            }
            if (callback)
                callback();
        }
        this.img.src = url;
        if (this.img.complete)
        {
            return;
        }
    }
    engine.Image.prototype.render = function (graphics, x, y, r, dt)
    {
        if (!graphics)
            return;
        if (this.onRender)
            this.onRender();
        graphics.drawImage(this.img, this.o.x, this.o.y, this.width, this.height);
    }

    //-------Path
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
        this.center = this.position;
        this.strokeStyle = new Color(0, 0, 0, 1);
        this.fillStyle = new Color(255, 255, 255, 1);
        this.strokeWidth = 1;
    }
    Path.Point = function (x, y)
    {
        this.x = x;
        this.y = y;
        this.cp1 = new Point(x, y);
        this.cp2 = new Point(x, y);
    }
    Path.Point.prototype.copy = function ()
    {
        var p = new Point(this.x, this.y);
        p.cp1 = this.cp1.copy();
        p.cp2 = this.cp2.copy();
        return p;
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
        for (var i = 0; i < this.pList.length; i++)
        {
            path.pList[i] = this.pList[i].copy();
        }
        return path;
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
    engine.Path = Path;
    window.Path = Path;
    //-----------

    //-------ImageAnimation
    function ImageAnimation ()
    {
        this.center = new Point(0, 0);
        this.position = this.center.copy();
        this.fCount=0;
        this.fps = 0;
        this.clipX = 0;
        this.clipY = 0;
        this.fWidth = 0;
        this.fHeight = 0;
        this.time = 0;
        this.img = null;
        this.frame=0;
        this.playing=true;
        this.reverse=false;
        this.width = 0;
        this.heigh = 0;
        this.onBegine=null;
        this.onEnd=null;
        this.onFrameUpdate=null;
        this.loop = new ImageAnimation.Loop();
    }
    //---ImagImageAnimation.Loop
    ImageAnimation.Loop = function ()
    {
        this.from = 0;
        this.to = 0;
        this.length=0;
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
    ImageAnimation.Loop.prototype.begin=function ()
    {
        this.enable = true;
        if (this.onStart)
            this.onStart();
    }
    ImageAnimation.Loop.prototype.end = function ()
    {
        var t=this.enable;
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
    ImageAnimation.create=function (width,height,fCount,fps)
    {
    }
    ImageAnimation.prototype.copy=function()
    {
        var ia = new ImageAnimation;
        ia.img = this.img;
        ia.center = this.center.copy();
        ia.position = this.position.copy();
        ia.fCount = this.fCount;
        ia.fps = this.fps;
        ia.clipX = this.clipX;
        ia.clipY = this.clipY;
        ia.fWidth = this.fWidth;
        ia.fHeight = this.fHeight;
        ia.time = this.time;
        ia.width = this.width;
        ia.heigh = this.heigh;
        ia.frame=this.frame;
        ia.playing=this.playing;
        ia.reverse=this.reverse;
        ia.onBegine=this.onBegine;
        ia.onEnd=this.onEnd;
        ia.onFrameUpdate=this.onFrameUpdate;
        ia.loop = this.loop.copy();
        return ia;
    }
    ImageAnimation.prototype.setCenter = function (x, y, align)
    {
        this.position = new Point(x, y);
        if(!align)
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
    ImageAnimation.prototype.begine=function()
    {
        this.playing=true;
        this.time=0;
        this.frame=0;
        this.loop.lt=0;
    }
    ImageAnimation.prototype.end=function()
    {
        var t = this.playing;
        this.playing=false;
        if(this.onEnd && t)
        {
            this.onEnd();
        }
    }
    ImageAnimation.prototype.play=function()
    {
        this.playing=true;
        this.time=0;
    }
    ImageAnimation.prototype.drawToCanvas = function (canvas, x, y, r, dt)
    {

    }
    ImageAnimation.prototype.preload = function (graphics)
    {
        graphics.drawImage(this.img, 0, 0, this.fWidth, this.fHeight, 0, 0, this.width, this.heigh);
        graphics.clearRect(0,0,this.width,this.height);
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
        graphics.drawImage(this.img, this.clipX + (this.fWidth * this.frame), this.clipY, this.fWidth, this.fHeight, this.center.x, this.center.y, this.width, this.heigh);
    }
    engine.ImageAnimation=ImageAnimation;
    window.ImageAnimation=ImageAnimation;

    sar.Web.Engine2D=engine;
    return sar;
}catch(ex){alert(ex.message);}
})(window.SardineFish);
