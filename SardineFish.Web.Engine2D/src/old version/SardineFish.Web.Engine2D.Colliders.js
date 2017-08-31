﻿window.SardineFish=(function(sar){
try{
    if(!sar)
        sar={};

    sar.Web=(function(web)
    {
        if(!web)
            web={};
        return web;
    })(sar.Web);
    sar.Web.Engine2D=(function(engine)
    {
        if(!engine)
            engine={};
        return engine;
    })(sar.Web.Engine2D);
    engine = sar.Web.Engine2D;
    
    //-------Vector2
    function Vector2(x,y)
    {
        this.x=x;
        this.y=y;
        
    }
    Vector2.fromPoint=function(p1,p2)
    {
        return new Vector2(p2.x-p1.x,p2.y-p1.y);
    }
    Vector2.prototype.copy=function()
    {
        return new Vector2(this.x,this.y);
    }
    Vector2.prototype.toString=function()
    {
        return "("+this.x+","+this.y+")";
    }
    Vector2.prototype.getLength=function()
    {
        return Math.sqrt(this.x*this.x+this.y*this.y);
    }
    Vector2.prototype.rotate=function(rad)
    {
        var x=this.x;
        var y=this.y;
        this.x=x*Math.cos(rad)-y*Math.sin(rad);
        this.y=y*Math.cos(rad)+x*Math.sin(rad);
    }
    Vector2.prototype.mod=function()
    {
        return Math.sqrt(this.x*this.x+this.y*this.y);
    }
    Vector2.prototype.plus=function(v)
    {
        if(!(v instanceof Vector2))
            throw new Error("v must be a Vector");
        this.x=this.x+v.x;
        this.y=this.y+v.y;
        return this;
    }
    Vector2.prototype.minus=function(v)
    {
        if(!(v instanceof Vector2))
            throw new Error("v must be a Vector");
        this.x=this.x-v.x;
        this.y=this.y-v.y;
        return this;
    }
    Vector2.prototype.multi=function(n)
    {
        if (!isNaN(n))
        {
            this.x*=n;
            this.y*=n;
            return this;
        }
    }
    Vector2.prototype.toLine=function(x,y)
    {
            return new Line(new Point(x,y),new Point(x+this.x,y+this.y));
    }
    Vector2.plus=function(u,v)
    {
        if (!(u instanceof Vector2) || !(u instanceof Vector2))
        {
            throw new Error("u and v must be an Vector2.");
        }
        return new Vector2(u.x+v.x,u.y+v.y);
    }
    Vector2.minus=function(u,v)
    {
        if (!(u instanceof Vector2) || !(u instanceof Vector2))
        {
            throw new Error("u and v must be an Vector2.");
        }
        return new Vector2(u.x-v.x,u.y-v.y);
    }
    Vector2.multi=function(u,v)
    {
        if (!(u instanceof Vector2))
        {
            throw new Error("u must be an Vector2.");
        }
        if(v instanceof Vector2)
        {
            return (u.x*v.x+u.y*v.y);
        }
        else if (!isNaN(v))
        {
            return (new Vector2(u.x*v,u.y*v));
        }
    }
    engine.Vector2=Vector2;
    window.Vector2 = Vector2;

    //-------Point
    function Point(x,y)
    {
        if(isNaN(x) || isNaN(y))
            throw "x and y must be numbers.";
        this.x=x;
        this.y=y; 
    }
    Point.Distance = function (p1, p2)
    {
        return Math.sqrt((p1.x - p2.x) * (p1.x - p2.x) + (p1.y - p2.y) * (p1.y - p2.y));
    }
    Point.prototype.copy=function()
    {
        return new Point(this.x,this.y);
    }
    Point.prototype.toString=function()
    {
        return "("+this.x+","+this.y+")";
    }
    Point.prototype.rotate=function (o, rad)
    {
//alert(this+"->"+rad);
        var x=this.x-o.x;
        var y=this.y-o.y;
        var dx=x*Math.cos(rad)-y*Math.sin(rad);
        var dy=y*Math.cos(rad)+x*Math.sin(rad);
        this.x=o.x+dx;
        this.y=o.y+dy;
//alert(this);
    }
    Point.prototype.isBelongTo=function(l)
    {
        if(!(this.lines instanceof Array))
            throw "this object has something wrong.";
        for(var i=0;i<this.lines.length;i++)
        {
            if(this.lines[i]==l)
                return true;
        }
        return false;
    }
    Point.prototype.addLine=function(l)
    {
        if(!(this.lines instanceof Array))
            throw "this object has something wrong.";
        this.lines[this.lines.length]=l;
    }
    Point.prototype.render = function (graphics, x, y, r, dt)
    {

    }
    engine.Point=Point;
    window.Point=Point;

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
        this.position = this.center;
        this.strokeStyle = new Color(0, 0, 0, 1.00);
    }
    Line.prototype.copy = function ()
    {
        var p1 = this.p1.copy();
        var p2 = this.p2.copy();
        var line = new Line(p1, p2);
        line.setCenter(this.center.x, this.center.y);
        line.position=this.position.copy();
        if(this.strokeStyle.copy)
            line.strokeStyle=this.strokeStyle.copy();
        else
            line.strokeStyle=this.strokeStyle;
        return line;
    }
    Line.prototype.setCenter = function (x, y)
    {
        this.center.x = x;
        this.center.y = y;
    }
    Line.prototype.moveTo = function (x, y)
    {
        if (x == this.center.x && y == this.center.y)
            return;
        this.p1.x = this.p1.x - this.center.x + x;
        this.p1.y = this.p1.y - this.center.y + y;
        this.p2.x = this.p2.x - this.center.x + x;
        this.p2.y = this.p2.y - this.center.y + y;
        this.center.x = x;
        this.center.y = y;
    }
    Line.prototype.rotate=function(o,rad)
    {
        this.p1.rotate(o,rad);
        this.p2.rotate(o,rad);
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
    }
    Line.prototype.render = function (graphics, x, y, r, dt)
    {
        graphics.beginPath();
        graphics.moveTo(this.p1.x, this.p1.y);
        graphics.lineTo(this.p2.x, this.p2.y);
        graphics.strokeStyle = this.strokeStyle;
        graphics.stroke();
    }
    Line.prototype.toGameObject = function ()
    {
        var obj = new GameObject();
        obj.graphic = this;
        return obj;
    }
    engine.Line = Line;
    window.Line = Line;
    
    function Arc(o,r,startAng,endAng,antiCW)
    {
        this.o=o;
        this.r=r;
        this.start=startAng;
        this.end=endAng;
        this.antiCW=antiCW;
        this.strokeStyle=new Color(0,0,0,1);
        this.fillStyle=new Color(255,255,255,0);
        this.strokeWidth=1;
        this.lineCap=Graphics.LineCap.Square;
    }
    Arc.prototype.copy=function()
    {
        var arc=new Arc(this.o.copy(),this.r,this.start,this.end,this.antiCW);
        arc.strokeStyle=this.strokeStyle.copy?this.strokeStyle.copy():this.strokeStyle;
        arc.fillStyle=this.fillStyle.copy?this.fillStyle.copy():this.fillStyle;
        arc.strokeWidth=this.strokeWidth;
        return arc;
    }
    Arc.prototype.rotate=function(o,ang)
    {
        this.o.rotate(o,ang);
        this.start+=ang;
        this.end+=ang;
    }
    Arc.prototype.render=function(graphics,x,y,r,dt)
    {
        graphics.beginPath();
        graphics.arc(this.o.x,this.o.y,this.r,this.start,this.end,this.antiCW);
        graphics.lineCap=this.lineCap;
        graphics.strokeWidth=this.strokeWidth;
        graphics.strokeStyle=this.strokeStyle;
        graphics.fillStyle=this.fillStyle;
        graphics.fill();
        graphics.stroke();
    }
    engine.Arc=Arc;
    window.Arc=Arc;

    //-------GameObject
    function GameObject ()
    {
        this.id=-1;
        this.name="GameObject";
        this.graphic=null;
        this.collider=null;
        this.layer=0;
        this.zIndex=0;
        this.mass=1;
        this.gravity=false;
        this.onGround=false;
        this.hitTest=false;
        this.F=new Force(0,0);
        this.constantForce=new Force(0,0);
        this.v=new Vector2(0,0);
        this.a=new Vector2(0,0);
        this.position=new Point(0,0);
        this.center=this.position;
        this.rotation=0.0;
        this.onRender=null;
        this.onUpdate=null;
        this.onStart=null;
        this.onCollide=null;
        this.onMouseDown=null;
        this.onMouseUp=null;
        this.onClick = null;
        this.onDoubleClick = null;
    }
    GameObject.CollideEventArgs=function(target)
    {
        this.target=target;
        this.e=1;
        this.dff=0;
        this.ignore=false;
    }
    GameObject.prototype.copy=function()
    {
        var obj=new GameObject();
        obj.name=this.name;
        obj.layer=this.layer;
        obj.zIndex=this.zIndex;
        if(this.graphic)
        {
            obj.graphic = this.graphic.copy ? this.graphic.copy() : this.graphic;
        }
        if(this.collider)
        {
            obj.collider = this.collider.copy ? this.collider.copy() : this.collider;
        }
        obj.mass=this.mass;
        obj.gravity=this.gravity;
        obj.onGround=this.onGround;
        obj.hitTest=this.hitTest;
        obj.constantForce=this.constantForce;
        obj.F=this.F.copy();
        obj.v=this.v.copy();
        obj.a=this.a.copy();
        obj.position=this.position.copy();
        obj.center=obj.position;
        obj.rotation=this.rotation;
        obj.onRender=this.onRender;
        obj.onUpdate=this.onUpdate;
        obj.onStart=this.onStart;
        obj.onCollide=this.onCollider;
        obj.onMouseDown=this.onMouseDown;
        obj.onMouseUp=this.onMouseUp;
        obj.onClick = this.onClick;
        obj.onDoubleClick = this.onDoubleClick;
        return obj;
    }
    GameObject.prototype.resetForce=function()
    {
        this.F.x=0;
        this.F.y=0
    }
    GameObject.prototype.resetConstantForce=function()
    {
        this.constantForce.x=0;
        this.constantForce.y=0;
    }
    GameObject.prototype.force=function(a,b,c)
    {
        if(a instanceof Force)
        {
            if(b)
            {
                this.constantForce.x+=a.x;
                this.constantForce.y+=a.y;
                return this.constantForce;
            }
            this.F.x+=a.x;
            this.F.y+=a.y;
            return this.F;
        }
        else if(isNaN(a)||isNaN(b))
        {
            throw new Error("Paramate must be a Number.");
        }
        else
        {
            if(c)
            {
                this.constantForce.x+=a;
                this.constantForce.y+=b;
                return this.constantForce;
            }
            this.F.x+=a;
            this.F.y+=b;
            return this.F;
        }
    }
    GameObject.prototype.addMomenta=function(p)
    {
         
    }
    GameObject.prototype.drawToCanvas=function(canvas,x,y,r,dt)
    {
        if(this.graphic)
            this.graphic.drawToCanvas(canvas,x,y,r,dt);
    }
    GameObject.prototype.render = function (graphics, x, y, r, dt)
    {
        if (this._animCallback)
            this._animCallback(dt);
        if (this.graphic)
            this.graphic.render(graphics, x, y, r, dt);
    }
    GameObject.prototype.setCenter=function(x,y)
    {
        this.position.x = x;
        this.position.y = y;
    }
    GameObject.prototype.moveTo=function(x,y)
    {
        if(this.graphic)
        {
            this.graphic.moveTo(this.graphic.position.x-this.position.x+x,this.graphic.position.y-this.position.y+y);
        }
        if(this.collider && this.collider!=this.graphic)
        {
            this.collider.moveTo(this.collider.position.x-this.position.x+x,this.collider.position.y-this.position.y+y);
        }
        this.position.x=x;
        this.position.y=y;
    }
    GameObject.prototype.rotate=function(center,rad)
    {
        if(this.graphic && this.graphic.rotate)
        {
            this.graphic.rotate(center,rad);
        }
        if(this.collider && this.collider!=this.graphic && this.collider.rotate)
        {
            this.collider.rotate(center,rad);
        }
        this.position.rotate(center,rad);
        this.rotation+=rad;
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
            if(time == t )
            {
                gameObject._animCallback = null;
                if (callback)
                    callback();
            }
        }
    }
    engine.GameObject=GameObject;
    window.GameObject = GameObject;

    

    //-------Colliders
    function Colliders() { }

    

    //-------Circle
    function Circle (r)
    {
        if(!r)
            r=0;
        this.r=r;
        this.o=new Point(0,0);
        this.position=new Point(0,0);
        this.center=this.position;     
        this.angV=0;
        this.rotation=0;
        this.rigidBody=false;
        this.e=1;
        this.I=1;//moment of inercial
        this.dff=0;//dynamic friction factor
        this.static=false;
        this.soft=true;
        this.landed=false;
        this.strokeWidth=1;
        this.strokeStyle=new Color(0,0,0,1);
        this.fillStyle=new Color(255,255,255,1);
    }
    Circle.prototype.copy=function()
    {
        var circle=new Circle(this.r);
        circle.setCenter(this.position.x,this.position.y);
        circle.angV=this.angV.copy();
        circle.rotation=this.rotation;
        circle.rigidBody=this.rigidBody;
        circle.e=this.e;
        circle.I=this.I;
        circle.dff=this.dff;
        circle.static=this.static;
        circle.soft=this.soft;
        circle.strokeWidththis.strokeWidth;
        if(this.strokeStyle instanceof Color)
            circle.strokeStyle=this.strokeStyle.copy();
        else
            circle.strokeStyle=this.strokeStyle;
        if(this.fillStyle instanceof Color)
            circle.fillStyle=this.fillStyle.copy();
        else
            circle.fillStyle=this.fillStyle;
        return circle;
    }
    Circle.prototype.setPosition=function(x,y)
    {
        this.o.x+=x-this.position.x;
        this.o.y+=y-this.position.y;
        this.position.x=x;
        this.position.y=y;
    }
    Circle.prototype.setCenter=function(x,y)
    {
        this.position.x=x;
        this.position.y=y;
    }
    Circle.prototype.moveTo=function(x,y)
    {
        if(x==this.position.x&&y==this.position.y)
            return;
        this.o.x=this.o.x-this.position.x+x;
        this.o.y=this.o.y-this.position.y+y;
        this.position.x=x;
        this.position.y=y;
    }
    Circle.prototype.drawToCanvas=function(canvas,x,y,r,dt)
    {
         var ctx=canvas.getContext("2d");
         ctx.beginPath();
         ctx.arc(this.o.x,this.o.y,this.r,0,2*Math.PI);
         ctx.lineWidth=this.strokeWidth;
         ctx.strokeStyle=this.strokeStyle;
         ctx.fillStyle=this.fillStyle;
         ctx.fill();
         ctx.stroke();
    }
    Circle.prototype.render = function (graphics, x, y, r, dt)
    {
        graphics.beginPath();
        graphics.arc(this.o.x, this.o.y, this.r, 0, 2 * Math.PI);
        graphics.lineWidth = this.strokeWidth;
        graphics.strokeStyle = this.strokeStyle;
        graphics.fillStyle = this.fillStyle;
        graphics.fill();
        graphics.stroke();
    }
    Circle.prototype.isCross=function(obj)
    {
        if(obj instanceof Line)
        {
            return obj.isCross(this);
        }
        else if(obj instanceof Circle)
        {
            return this.isCollideWith(obj);
        }
    }
    Circle.prototype.isCollideWith=function (col)
    {
        if(col instanceof Polygon)
        {
            return col.isCollideWith(this);
        }
        else if(col instanceof Point)
        {
            return ((col.x-this.o.x)*(col.x-this.o.x)+(col.y-this.o.y)*(col.y-this.o.y)<=this.r*this.r)
        }
        else if(col instanceof Circle)
        {
            var dx=this.o.x-col.o.x;
            var dy=this.o.y-col.o.y;
            var d=dx*dx+dy*dy;
            if((this.r-col.r)*(this.r-col.r)<=d && d<=(this.r+col.r)*(this.r+col.r))
                return true;
            return false;
        }
        else if (col instanceof Rectangle)
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
    Circle.prototype.collide=function(self,target,dt)
    {
        if(self.collider.static&&target.collider.static)
            return;
        if(target.collider instanceof Circle)
        {
            var args=new GameObject.CollideEventArgs();
            args.dff=Math.min(self.collider.dff,target.collider.dff);
            args.e=Math.min(self.collider.e,target.collider.e);
            if(self.onCollide)
            {
                args.target=target;
                self.onCollide(args);
                if(args.ignore)
                    return;
            }
            if(target.onCollide)
            {
                args.target=self;
                target.onCollide(args);
                if(args.ignore)
                    return;
            }
            var circle = self.collider;
            var rect = target.collider;
            var o1=self.collider.o;
            var o2=target.collider.o;
            var m1=self.mass;
            var m2=target.mass;
            var v0=self.v;
            var e=args.e;
            var dff=args.dff;
            var v1=new Vector2(0,0);
            var v2=new Vector2(target.v.x-v0.x,target.v.y-v0.y);
            var o21=new Vector2(o1.x-o2.x,o1.y-o2.y);
            var n=new Vector2(o21.y,-o21.x);
            var Lo21=o21.x*o21.x+o21.y*o21.y;
            var Ln=n.x*n.x+n.y*n.y;
            var vt=Vector2.multi(n,(v2.x*n.x+v2.y*n.y)/Ln);
            var Lvn=v2.x*o21.x+v2.y*o21.y;
            if(Lvn<=0)
            {
                return;
                
            }
            var vn=Vector2.multi(o21,Lvn/Lo21);
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
        else if(target.collider instanceof Rectangle)
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
            var rect=target.collider;
            var circle=self.collider;
            var dx=-1,dy=-1;
            var v0=target.v;
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
            var d=0;
            if (minPD < 0 || (minLD > 0 && minLD <= minPD)) //Collide with edge
            {
                d=minLD;
                vn = Vector2.multi(minL.norV, (v2.x * minL.norV.x + v2.y * minL.norV.y));
                vt = new Vector2(v2.x - vn.x, v2.y - vn.y);
            }
            else if (minLD < 0 || (minPD >= 0 && minPD < minLD)) //Collide with Point
            {
                d=minPD;
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
        else if(target.collider instanceof Polygon)
        {
            return target.collider.collide(target, self, dt);
        }
        else
        {
return;
            return target.collider.collide(target,self,dt);
        }
    }
    Colliders.Circle = Circle;
    window.Circle=Circle;

    //-------Polygon
    function Polygon (v)
    {
        this.E=[];
        this.V=[];
        this.position=new Point(0,0);
        this.center=this.position;
        this.e=1;
        this.dff=0;
        this.angV=0;
        this.rotation=0;
        this.I=1;
        this.rigidBody=false;
        this.static=false;
        this.soft=true;
        this.landed=false;
        this.convex=true;
        this.cw=null;
        this.constructing=false;
        this.strokeWidth=1;
        this.strokeStyle=new Color(0,0,0,1);
        this.fillStyle=new Color(255,255,255,1);
        if(v instanceof Array)
        {
            this.beginInit();
            this.V=v;
            this.endInit();
        }
    }
    Polygon.createRect=function (x,y,width,height)
    {
        var v=[];
        v[0]=new Point(x,y);
        v[1]=new Point(x+width,y);
        v[2]=new Point(x+width,y+height);
        v[3]=new Point(x,y+height);
        return new Polyon(v);
    }
    Polygon.prototype.copy=function()
    {
        var v=[];
        for(var i=0;i<this.V.length;i++)
        {
            v[i]=new Point(this.V[i].x,this.V[i].y);
        }
        var pol=new Polygon(v);
        pol.angV=this.angV.copy();
        pol.rotation=this.rotation;
        pol.rigidBody=this.rigidBody;
        pol.e=this.e;
        pol.I=this.I;
        pol.dff=this.dff;
        pol.static=this.static;
        pol.soft=this.soft;
        pol.setCenter(this.center.x,this.center.y);
        pol.strokeWidth=this.strokeWidth;
        if(this.strokeStyle instanceof Color)
            pol.strokeStyle=this.strokeStyle.copy();
        else
            pol.strokeStyle=this.strokeStyle;

        if(this.fillStyle instanceof Color)
            pol.fillStyle=this.fillStyle.copy();
        else
            pol.fillStyle=this.fillStyle;

        
        return pol;
    }
    Polygon.prototype.moveTo=function (x,y)
    {
        var dx=x-this.position.x;
        var dy=y-this.position.y;
        for(var i=0;i<this.V.length;i++)
        {
            this.V[i].x+=dx;
            this.V[i].y+=dy;
        }
        this.position.x=x;
        this.position.y=y;
    }
    Polygon.prototype.rotate=function(center,rad)
    {
        for(var i=0;i<this.V.length;i++)
        {
            this.V[i].rotate(center,rad);
        }
        this.position.rotate(center,rad);
        this.rotation+=rad;
    }
    Polygon.prototype.setCenter=function(x,y)
    {
        this.position.x=x;
        this.position.y=y;
    }
    Polygon.prototype.getCenter=function()
    {
        if(this.V.length<3)
            throw new Error("3 or more points are required.");
        var sumX=0,sumY=0;
        for(var i=0;i<this.V.length;i++)
        {
            sumX+=this.V[i].x;
            sumY+=this.V[i].y;
        }
        return new Point(sumX/this.V.length,sumY/this.V.length);
    }
    Polygon.prototype.beginInit=function()
    {
        this.E=[];
        this.constructing=true;
    }
    Polygon.prototype.addPoint=function(p)
    {
        if(!this.constructing)
            throw new Error("Polygon isn't constructing.");
        var i=this.V.length;
        if(i>=2)
        {
            var n1=new Vector2(this.V[i-1].x-this.V[i-2].x,this.V[i-1].y-this.V[i-2].y);
            var n2=new Vector2(p.x-this.V[i-1].x,p.y-this.V[i-1].y);
            var d=n1.x*n2.y-n1.y*n2.x;
            if(!this.dir)
                this.dir = d>0 ? 1:-1;
            else if(d && this.dir*d<0)
            {
                this.convex=false;
            }
        }
        if(!p.lines)
            p.lines=[];
        this.V[i]=p;
    }
    Polygon.prototype.endInit=function()
    {
        if(this.V.length<3)
            throw new Error("3 or more points are required.");
        if(!this.dir)
            throw new Error("Points must not in a line.");
        var n1=new Vector2(this.V[this.V.length-1].x-this.V[this.V.length-2].x,this.V[this.V.length-1].y-this.V[this.V.length-2].y);
        var n2=new Vector2(this.V[0].x-this.V[this.V.length-1].x,this.V[0].y-this.V[this.V.length-1].y);
        var d=n1.x*n2.y-n1.y*n2.x;
        if(d && d*this.dir<0)
            this.convex=false;
        for (var i=0; i<this.V.length; i++)
        {
            var p1=this.V[i];
            var p2=this.V[(i+1)%this.V.length];
            var l=new Line(p1,p2);
            p1.lines[p1.lines.length]=l;
            p2.lines[p2.lines.length]=l;
            l.polygon=this;
            var length=Math.sqrt((p1.x-p2.x)*(p1.x-p2.x) + (p1.y-p2.y)*(p1.y-p2.y));
            l.length=length;
            l.lengthR=1/length;
            this.E[this.E.length]=l;
        }
        if(this.convex&&this.dir>0)
            this.cw=false;
        else if(this.convex)
            this.cw=true;
        this.position=this.getCenter();
        this.center=this.position;
        this.constructing=false;
    }
    Polygon.prototype.render = function (graphics, x, y, r, dt)
    {
        graphics.beginPath();
        if (this.V.length < 3)
            throw new Error("The polygen must contains at least 3 points.");
        graphics.moveTo(this.V[0].x, this.V[0].y);
        for (var i = 1; i < this.V.length; i++)
            graphics.lineTo(this.V[i].x, this.V[i].y);
        graphics.lineTo(this.V[0].x, this.V[0].y);
        graphics.lineWidth = this.strokeWidth;
        graphics.strokeStyle = this.strokeStyle.toString();
        graphics.fillStyle = this.fillStyle.toString();
        graphics.fill();
        graphics.stroke();
    }
    Polygon.prototype.isCollideWith=function(col)
    {
        if(!(this.E instanceof Array))
        {
            throw new Error("Something wrong with this polygon");
        }
        if(col instanceof Polygon)
        {

            if(!(col.E instanceof Array))
            {
                throw new Error("Something wrong with the polygon");
            }
            for(var i=0;i<this.E.length;i++)
                for(var j=0;j<col.E.length;j++)
                {
                    
                    if(this.E[i].isCross(col.E[j]))
                    {
                        //alert("!");
                        return true;
                    }
                }
            return false;
        }
        else if(col instanceof Circle)
        {
            //Collide with point
            for(var i=0;i<this.V.length;i++)
            {
                var p=this.V[i];
                var d=(col.o.x-p.x)*(col.o.x-p.x)+(col.o.y-p.y)*(col.o.y-p.y);
                if(d<=col.r*col.r)
                {
                    
                    return true;
                }
            }
            //Collide with edge
            for(var i=0;i<this.E.length;i++)
            {
                var l=this.E[i];
                var n;
                if(this.cw)
                    n=new Vector2(l.p1.y-l.p2.y,l.p2.x-l.p1.x);
                else
                    n=new Vector2(l.p2.y-l.p1.y,l.p1.x-l.p2.x);
                var t1=new Vector2(col.o.x-l.p1.x,col.o.y-l.p1.y);
                var t2=new Vector2(col.o.x-l.p2.x,col.o.y-l.p2.y);
                var m1=t1.x*n.y-t1.y*n.x;
                var m2=t2.x*n.y-t2.y*n.x;
                if(m1*m2>0)
                    continue;
                var d=Vector2.multi(t1,n)*l.lengthR;
                if(d>0&&d<=col.r)
                    return true;
            }
            
            return false;
        }
        else if (col instanceof Rectangle)
        {
            if(!(col.E instanceof Array))
            {
                throw new Error("Something wrong with the polygon");
            }
            for(var i=0;i<this.E.length;i++)
                for(var j=0;j<col.E.length;j++)
                {
                    
                    if(this.E[i].isCross(col.E[j]))
                    {
                        //alert("!");
                        return true;
                    }
                }
            return false;
        }
        return false;
    }
    Polygon.prototype.collide = function (self, target, dt)
    {
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
            var v1=self.v;
            var v2=target.v;
            var minLD = -1, minPD = -1;
            var P, L;
            for(var i=0;i<poly.E.length;i++)
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
    function Rectangle(w,h)
    {
        w=isNaN(w)?0:w;
        h=isNaN(h)?0:h;
        this.width=w;
        this.height=h;
        this.o=new Point(0,0);
        this.position=new Point(w/2,h/2);
        this.center=this.position;
        this.rigidBody=false;
        this.dff = 0;//dynamic friction factor
        this.e = 1;
        this.I = 1;//moment of inercial
        this.static=false;
        this.soft=true;
        this.landed=false;
        this.fillStyle=new Color(255,255,255,1);
        this.strokeStyle = new Color(0, 0, 0, 1);
        this.V = [
            new Point(0, 0),
            new Point(w, 0),
            new Point(w, h),
            new Point(0, h)];
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
        this.E[0].norV = new Vector2(0, -1);
        this.E[1].norV = new Vector2(1, 0);
        this.E[2].norV = new Vector2(0, 1);
        this.E[3].norV = new Vector2(-1, 0);
        //Tangent Vector
        this.E[0].tanV = new Vector2(1, 0);
        this.E[1].tanV = new Vector2(0, 1);
        this.E[2].tanV = new Vector2(-1, 0);
        this.E[3].tanV = new Vector2(0, -1);
    }
    Rectangle.prototype.copy=function()
    {
        var rect=new Rectangle(this.width,this.height);
        rect.o=this.o.copy();
        rect.position=this.position.copy();
        rect.rigidBody=this.rigidBody;
        rect.e=this.e;
        rect.dff=this.dff;
        rect.I=this.I;
        rect.static=this.static;
        rect.soft=this.soft;
        rect.landed=this.landed;
        if(this.strokeStyle instanceof Color)
            rect.strokeStyle=this.strokeStyle.copy();
        else
            rect.strokeStyle=this.strokeStyle;
        if(this.fillStyle instanceof Color)
            rect.fillStyle=this.fillStyle.copy();
        else
            rect.fillStyle=this.fillStyle;
        return rect;
    }
    Rectangle.prototype.setCenter=function(x,y)
    {
        if(!isNaN(x)&&!isNaN(y))
        {
            this.position.x=x;
            this.position.y=y;
        }
        else
        {
            this.position.x=this.o.x+(x(this.width,this.height)).x;
            this.position.y=this.o.y+this.height-(x(this.width,this.height)).y;
        }
    }
    Rectangle.prototype.moveTo=function(x,y)
    {
        var dx = x - this.position.x;
        var dy = y - this.position.y;
        this.o.x += dx;
        this.o.y += dy;
        for (var i = 0; i < 4; i++)
        {
            this.V[i].x += dx;
            this.V[i].y += dy;
        }
        this.position.x = x;
        this.position.y = y;
        
    }
    Rectangle.prototype.setPosition=Rectangle.prototype.moveTo;
    Rectangle.prototype.drawToCanvas=function(canvas,x,y,r,dt)
    {
        var ctx=canvas.getContext("2d");
        ctx.fillStyle=this.fillStyle;
        ctx.strokeStyle=this.strokeStyle;
        ctx.fillRect(this.o.x,this.o.y,this.width,this.height);
        ctx.strokeRect(this.o.x,this.o.y,this.width,this.height);
    }
    Rectangle.prototype.render = function (graphic, x, y, r, dt)
    {
        graphic.fillStyle = this.fillStyle;
        graphic.strokeStyle = this.strokeStyle;
        graphic.fillRect(this.o.x, this.o.y+this.height, this.width, this.height);
        graphic.strokeRect(this.o.x, this.o.y+this.height, this.width, this.height);
    }
    Rectangle.prototype.isCollideWith = function (obj)
    {
        if (obj instanceof Ground)
        {
            return (!(this.o.x > obj.xR || this.o.x + this.width < obj.xL) && (this.o.y >= obj.y && obj.y >= this.o.y - this.height));
        }
        else if (obj instanceof Wall)
        {
            return (!(this.o.y - this.height > obj.yH || this.o.y < obj.yL) && (this.o.x <= obj.x && obj.x <= this.o.x + this.width));
        }
        else if (obj instanceof Rectangle)
        {
            if (this.o.x - obj.width  <= obj.o.x && obj.o.x <= this.o.x + this.width
             && this.o.y - obj.height <= obj.o.y && obj.o.y <= this.o.y + this.height)
                return true;
            return false;
            var x1 = (obj.o.x - this.o.x) * (obj.o.x + obj.width - this.o.x);
            var x2 = (obj.o.x - (this.o.x + this.width)) * (obj.o.x + obj.width - (this.o.x + this.width));
            var y1 = (obj.o.y - this.o.y) * (obj.o.y + obj.height - this.o.y);
            var y2 = (obj.o.y - (this.o.y + this.height)) * (obj.o.y + obj.height - (this.o.y + this.height));
            if (obj.o.x + obj.width < this.o.x || this.o.x + this.width < obj.o.x ||
               obj.o.y - obj.height > this.o.y || this.o.y - this.height > obj.o.y)
            {
                return false;
            }
            else
                return true;
        }
        else if (obj instanceof Point)
        {
            if (this.o.x <= obj.x && obj.x <= this.o.x + this.width && obj.y <= this.o.y && this.o.y - this.height <= obj.y)
                return true;
            else
                return false;
        }
        else if (obj instanceof Circle)
            return obj.isCollideWith(this);
        else if (obj instanceof Polygon)
            return obj.isCollideWith(this);
    }
    Rectangle.prototype.collide=function(self,target,dt)
    {
        if(self.collider.static&&target.collider.static)
            return;
        if(target.collider instanceof Rectangle)
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
            /*if (rect1.o.x - rect2.width <= rect2.o.x && rect2.o.x <= rect1.o.x + rect1.width) 
            {
                var dBottom = rect1.o.y - (rect2.o.y + rect2.height);
                var dTop = (rect1.o.y + rect1.height) - rect2.o.y;
                if (Math.abs(dBottom) < Math.abs(dTop))
                {

                }
            }*/
            if(target.v.x-self.v.x<0)
            {
                dx = Math.abs((rect1.o.x + rect1.width) - rect2.o.x); //Distance from rect1.right to rect2.left
            }
            else if(target.v.x-self.v.x>0)
            {
                dx = Math.abs((rect2.o.x + rect2.width) - rect1.o.x); //Distance from rect1.left to rect2.right
            }
            else if(target.v.x-self.v.x==0)
            {
                dx = Math.min(Math.abs(rect1.o.x + rect1.width - rect2.o.x), Math.abs(rect2.o.x + rect2.width - rect1.o.x)); //Get min distance
            }
            if (target.v.y - self.v.y < 0)
            {
                dy = Math.abs((rect1.o.y + rect1.height) - rect2.o.y); //Distance from rect1.top to rect2.bottom
            }
            else if (target.v.y - self.v.y > 0)
            {
                dy = Math.abs((rect2.o.y + rect2.height) - rect1.o.y); //Distance from rect1.bottom to rect2.top
            }
            else if (target.v.y - self.v.y == 0)
            {
                dy = Math.min(Math.abs(rect1.o.y + rect1.height - rect2.o.y), Math.abs(rect2.o.y + rect2.height - rect1.o.y)); //Get min distance
            }
            if((dx>=0&&dx<=dy) || dy<0) //Collide x
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
                    v2x -= dv;
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
                    v2y -= dv;
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
        else if(target.collider instanceof Ground)
        {
            if(self.collider.o.y-self.collider.height<=target.collider.y)
            {
                var t=(self.collider.o.y-self.collider.height-target.collider.y)/self.v.y;
                t=isNaN(t)?0:t;
                self.moveTo(self.position.x,self.position.y-self.v.y*t);
                self.v.y=-self.v.y*self.collider.bounce;
                if(self.gravity)
                    self.collider.landed=true;
            }
        }
        else if (target.collider instanceof Wall)
        {
            
        }
        else if(target.collider instanceof Circle)
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
    Ground.prototype.copy=function()
    {
        var g=new Ground(this.y,this.xL,this.xR);
        g.rigidBody=this.rigidBody;
        g.static = this.static;
        g.position=this.position.copy();
        return g;
    }
    Ground.prototype.moveTo=function(x,y)
    {
        this.y=y;
        this.position.x=x;
        this.position.y=y;
    }
    Ground.prototype.setCenter = function (x, y, align)
    {
        this.y = y;
        this.xL = x - align(this.xR - this.xL).x;
        this.xR = this.xL + this.width;
    }
    Ground.prototype.drawToCanvas=function(canvas,x,y,r,dt)
    {
        return;
        var ctx=canvas.getContext("2d");
        ctx.fillStyle=this.fillStyle;
        ctx.strokeStyle=this.strokeStyle;
        ctx.fillRect(this.center.x,this.center.y,canvas.width,this.height);
        ctx.strokeRect(this.center.x,this.center.y,canvas.width,this.height);
    }
    Ground.prototype.render = function (graphics, x, y, r, dt)
    {
        return;
    }
    Ground.prototype.toGameObject=function()
    {
        var obj=new GameObject();
        obj.collider=this;
        obj.graphic=this;
        obj.mass=1;
        obj.gravity=false;
        return obj;
    }
    Ground.prototype.isCollideWith=function(col)
    {
        if (col instanceof Rectangle)
            return col.isCollideWith(this);
        else if (col instanceof Circle)
            return col.isCollideWith(this);
    }
    Ground.prototype.collide=function(ground,obj,dt)
    {
        if(obj.collider instanceof Rectangle)
            return obj.collider.collide(obj,ground,dt);
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
        if(col instanceof Rectangle )
            return col.isCollideWith (this);
    }
    Colliders.Wall = Wall;
    window.Wall = Wall;

    function OneWayGround()
    {

    }


    engine.Colliders=Colliders;
    window.Colliders=Colliders;

    return sar;
}catch(ex){alert("Collider init:"+ex.message);}
})(window.SardineFish);