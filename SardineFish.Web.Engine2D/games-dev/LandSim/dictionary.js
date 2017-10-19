export function Dictionary()
{
    this.keys = ArrayList();
    this.values = ArrayList();
    this.add = function (key, value)
    {
        
    }
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