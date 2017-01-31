(function ()
{
    function FFClient()
    {
        if (!window.SardineFish || !window.SardineFish.API)
            throw new Error("API required.");
        this.webSocket = null;
        this.uid = null;
        this.token = null;
        this.connected = false;

        this.onError = null;
        this.syncCallback = null;
        this.actionCallback = null;
    }
    FFClient.prototype.connect = function (serverUrl)
    {
        this.webSocket = new WebSocket(serverUrl);
        this.webSocket.onclose = WSClose;
        this.webSocket.onerror = WSError;
        this.webSocket.onmessage = WSMessage;
        this.webSocket.onopen = WSOpen;
        var client = this;

        function WSOpen(e)
        {
            client.connected = true;
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
                    break;
                case MessageType.Logout:
                    break;
                case MessageType.Sync:
                    break;
                case MessageType.Action:
                    break;
                case MessageType.Response:
                    break;
            }
        }
    }
    FFClient.prototype.login = function (uid, token, callback)
    {

    }

    var MessageType =
    {
        None: 0,
        Login: 1,
        Logout: 2,
        Sync: 4,
        Action: 8,
        Response: 16,
    };
    function FFMessage(data)
    {
        this.messageType = MessageType.None;
        this.time = 0;
        this.data = null;
        data = "";
        if (data)
        {
            this.messageType = data.charAt(0);
            data = data.substr(2, data.length - 2);
            for (var i = 0; i < data.length; i++)
            {
                if (data.charAt(i) == '-')
                {
                    this.time = parseInt(data.substr(0, i));
                    data = data.substr(i + 1, data.length - (i + 1));
                    switch (this.messageType)
                    {
                        case MessageType.Login:
                            this.data = new LoginData(data);
                            break;
                        case MessageType.Logout:
                            this.data = new LogoutData(data);
                            break;
                        case MessageType.Sync:
                            this.data = new SyncData(data);
                            break;
                        case MessageType.Action:
                            this.data = new ActionData(data);
                            break;
                        case MessageType.Response:
                            this.data = new ResponseData(data);
                            break;
                    }
                }
            }
        }
    }

    function ResponseData(json)
    {
        this.errorCode = 0;
        this.msg = "";
        if (json)
        {
            var data = JSON.parse(json);
            if (!data)
                return;
            this.errorCode = data.errorCode;
            this.msg = data.msg;
        }
    }
    ResponseData.prototype.toString = function ()
    {
        return JSON.stringify(this);
    }

    function LoginData()
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
        SlowDown: 0,
        FlyForward: 1,
        SpeedUp: 2,
        HightSpeedUp: 3,
        TurnLeft: 4,
        TurnRight: 8,
        Damage: 16,
        Destroy: 32,
        Summon: 64
    };
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