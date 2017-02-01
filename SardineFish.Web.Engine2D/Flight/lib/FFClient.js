(function ()
{
    function FFClient()
    {
        if (!window.SardineFish || !window.SardineFish.API)
            throw new Error("API required.");
        this.uid = null;
        this.token = null;
        this.connected = false;
        this.actived = false;

        this.onError = null;
        this.syncCallback = null;
        this.actionCallback = null;
        this.addPlayerCallback = null;
        this.removePlayerCallback = null;

        var webSocket;
        var client = this;
        this.connect = function (serverUrl, callback)
        {
            webSocket = new WebSocket(serverUrl);
            webSocket.onclose = WSClose;
            webSocket.onerror = WSError;
            webSocket.onopen = function (e)
            {
                var handshakeData = new HandshakeData();
                handshakeData.version = FFClient.version;
                handshakeData.platform = Platform.Web;
                var message = new FFMessage();
                message.messageType = MessageType.Handshake;
                message.time = new Date().getTime();
                message.data = handshakeData;
                webSocket.onmessage = function (e)
                {
                    var message = new FFMessage(e.data);
                    if (message.messageType == MessageType.Handshake)
                    {
                        client.connected = true;
                        if (callback)
                            callback(true, 0, "Connected.");
                    }
                    else if (message.messageType == MessageType.Response)
                    {
                        var data = message.data;
                        if (callback)
                            callback(false, data.errorCode, data.msg);
                        webSocket.close(data.errorCode, data.msg);
                    }
                }
                webSocket.send(message.toString());
            }
        }

        this.login = function (uid, callback)
        {
            if (!this.connected)
                throw new Error("No connection avaliable.");
            var token = SHA1(uid);
            var data = new LoginData();
            data.uid = uid;
            data.token = token;
            var message = new FFMessage();
            message.messageType = MessageType.Login;
            message.data = data;
            webSocket.onmessage = function (e)
            {
                var message = new FFMessage(e.data);
                var json = message.data;
                if (message.messageType == MessageType.Response)
                {
                    data = new ResponseData(json);
                    if (data.errorCode == 0)
                    {
                        if (callback)
                            callback(true, 0, data.data);
                        client.actived = true;
                        webSocket.onmessage = WSMessage;
                    }
                    else if (callback)
                        callback(false, data.errorCode, data.msg);
                }
            };
            webSocket.send(message.toString());
            /*
            window.SardineFish.API.Account.CheckLogin(token, uid, function (succeed, data)
            {
                if (!succeed)
                {
                    if (callback)
                        callback(false, 1010201008, "User does not login.");
                    return;
                }
            });*/
        }

        this.sync = function (flight)
        {
            var message = new FFMessage();
            message.messageType = MessageType.Sync;
            message.time = new Date().getTime();
            var data = new SyncData();
            data.flightList = [{
                position: { x: flight.position.x, y: flight.position.y },
                center: { x: flight.center.x, y: flight.center.y },
                angV: flight.angV,
                v: { x: flight.v.x, y: flight.v.y },
                life: flight.life,
                speed: flight.speed,
                id: flight.identity,
                rotation: flight.rotation
            }];
            message.data = data;
            webSocket.send(message.toString());
        }

        this.act = function (id, action, actionData)
        {
            var data = new ActionData();
            data.action = action;
            data.id = id;
            data.data = actionData;
            var message = new FFMessage();
            message.messageType = MessageType.Action;
            message.time = new Date().getTime();
            message.data = data;
            webSocket.send(message.toString());
        }

        function WSOpen(e)
        {
            
        }
        function WSClose(e)
        {
            client.connected = false;
        }
        function WSError(e)
        {
            if (client.onError)
            {
                client.onError(e);
            }
        }
        function WSMessage(e)
        {
            var message = new FFMessage(e.data);
            switch (message.messageType)
            {
                case MessageType.Login:
                    if (client.addPlayerCallback)
                        client.addPlayerCallback(message.data);
                    break;
                case MessageType.Logout:
                    if (client.removePlayerCallback)
                        client.removePlayerCallback(message.data);
                    break;
                case MessageType.Sync:
                    if (client.syncCallback)
                        client.syncCallback(message.data);
                    break;
                case MessageType.Action:
                    if (client.actionCallback)
                        client.actionCallback(message.data);
                    break;
                case MessageType.Response:
                    if (client.onError)
                        client.onError(message.data);
                    break;
            }
        }
    }
    FFClient.version = "1.0.0";
    window.FFClient = FFClient;

    var MessageType =
    {
        Handshake: 0,
        Login: 1,
        Logout: 2,
        Sync: 3,
        Action: 4,
        Response: 5,
    };
    function FFMessage(message)
    {
        var messageType = null;
        var time = 0;
        var _data = null;

        Object.defineProperty(this, "messageType", {
            get: function ()
            {
                return messageType;
            },
            set: function (value)
            {
                if (isNaN(value))
                    throw new Error("Must be MessageType.");
                messageType = value;
            }
        });
        Object.defineProperty(this, "time", {
            get: function ()
            {
                return time;
            },
            set: function (value)
            {
                if (isNaN(value))
                    throw new Error("Must be int.");
                time = parseInt(value);;
            }
        });
        Object.defineProperty(this, "data", {
            get: function ()
            {
                return _data;
            },
            set: function (value)
            {
                _data = value;
            }
        });
        if (message)
        {
            this.messageType = parseInt(message.charAt(0));
            message = message.substr(2, message.length - 2);
            for (var i = 0; i < message.length; i++)
            {
                if (message.charAt(i) == '-')
                {
                    this.time = parseInt(message.substr(0, i));
                    message = message.substr(i + 1, message.length - (i + 1));
                    switch (this.messageType)
                    {
                        case MessageType.Handshake:
                            this.data = new HandshakeData(message)
                            break;
                        case MessageType.Login:
                            this.data = new LoginData(message);
                            break;
                        case MessageType.Logout:
                            this.data = new LogoutData(message);
                            break;
                        case MessageType.Sync:
                            this.data = new SyncData(message);
                            break;
                        case MessageType.Action:
                            this.data = new ActionData(message);
                            break;
                        case MessageType.Response:
                            this.data = new ResponseData(message);
                            break;
                    }
                    return;
                }
            }
        }
    }
    FFMessage.prototype.toString = function ()
    {
        var msg = "" + this.messageType.toString() + "-" + this.time + "-" + this.data;
        return msg;
    }
    var Platform =
    {
        Web: 1,
        App: 2,
        PC: 4,
        Phone: 8,
        Windows: 16,
        Android: 32,
        IOS: 64,
        Linux: 128,
        Trident: 256,
        Gecko: 512,
        WebKit: 1024,
        Presto: 2048
    }
    function HandshakeData(json)
    {
        this.platform = 0;
        this.version = "";
        if (json)
        {
            var data = JSON.parse(json);
            if (!data)
                return;
            this.version = data.version;
            this.platform = data.platform;
        }
    }
    HandshakeData.prototype.toString = function ()
    {
        return JSON.stringify(this);
    }

    function ResponseData(json)
    {
        this.errorCode = 0;
        this.msg = "";
        this.data = null;
        if (json)
        {
            var data = JSON.parse(json);
            if (!data)
                return;
            this.errorCode = data.errorCode;
            this.msg = data.msg;
            this.data = data.data;
        }
    }
    ResponseData.prototype.toString = function ()
    {
        return JSON.stringify(this);
    }

    function LoginData(json)
    {
        this.uid = "";
        this.token = "";
        this.id = "";
        if (json)
        {
            var data = JSON.parse(json);
            if (!data)
                return;
            this.uid = data.uid;
            this.token = data.token;
            this.id = data.id;
        }
    }
    LoginData.prototype.toString = function ()
    {
        return JSON.stringify(this);
    }

    function LogoutData(json)
    {
        this.uid = "";
        this.token = "";
        this.id = "";
        if (json)
        {
            var data = JSON.parse(json);
            if (!data)
                return;
            this.uid = data.uid;
            this.token = data.token;
            this.id = data.id;
        }
    }
    LogoutData.prototype.toString = function ()
    {
        return JSON.stringify(this);
    }

    function SyncData(json)
    {
        this.flightList = ArrayList();
        if (json)
        {
            var data = JSON.parse(json);
            if (!data)
                return;
            for (var i = 0; i < data.flightList.length; i++)
            {
                this.flightList.add(data.flightList[i]);
            }
        }
    }
    SyncData.prototype.toString = function ()
    {
        return JSON.stringify(this);
    }

    var Action = {
        Stop: 0,
        SlowDown: 1,
        FlyForward: 2,
        SpeedUp: 4,
        HightSpeedUp: 6,
        TurnLeft: 8,
        TurnRight: 16,
        Damage: 32,
        Destroy: 64,
        Summon: 128,
        Shoot: 256,
    };
    FFClient.Action = Action;
    function ActionData(json)
    {
        this.id = 0;
        this.action = Action.FlyForward;
        this.data = "";
        if (json)
        {
            var data = JSON.parse(json);
            if (!data)
                return;
            this.id = data.id;
            this.action = data.action;
            this.data = data.data;
        }
    }
    ActionData.prototype.toString = function ()
    {
        return JSON.stringify(this);
    }

    function Flight(json)
    {
        this.position = new Point(0, 0);
        this.center = new Point(0, 0);
        this.v = new Vector(0, 0);
        this.angV = 0;
        this.life = 0;
        this.speed = 0;
        this.id = "";
        if (json)
        {
            var data = JSON.parse(json);
            if (!data)
                return;
            this.position = data.position;
            this.center = data.center;
            this.v = data.v;
            this.angV = data.angV;
            this.life = data.life;
            this.speed = data.speed;
            this.id = data.id;
        }
    }
    Flight.prototype.toString = function ()
    {
        return JSON.stringify(this);
    }

    function Point(x, y)
    {
        if (isNaN(x) || isNaN(y))
        {
            x = 0;
            y = 0;
        }
        this.x = x;
        this.y = y;
    }

    function Vector(x, y)
    {
        if (isNaN(x) || isNaN(y))
        {
            x = 0;
            y = 0;
        }
        this.x = x;
        this.y = y;
    }

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
})();