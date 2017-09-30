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
        if(!(task instanceof Task))
        {
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
function Task(f,args)
{
    var task = this;
    this.onComplete = null;
    this.func = f;
    this.id = null;
    this.status = Task.Status.Pending;
    this.start=function ()
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