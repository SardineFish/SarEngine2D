window.SardineFish=(function(sar){    if(!jQuery)    {        throw new Error("jQuery is required!");    }try{    if(!sar)        sar={};    sar.Web=(function(web)    {        if(!web)            web={};        return web;    })(sar.Web);    var UI={};    UI.themeColor="black";    UI.themeBgColor="white";    function setButton(obj)    {        for(var i=0;i<obj.length;i++)        {            obj.get(i).addEventListener("touchstart",buttonMouseDown);            obj.get(i).addEventListener("touchend", buttonMouseUp);            obj.get(i).addEventListener("mousedown", buttonMouseDown);            obj.get(i).addEventListener("mouseup", buttonMouseUp);        }                obj.attr("onselectstart", "return false");    }    UI.setButton=setButton;    function buttonMouseDown(e)    {        $(e.target).css("background-color", UI.themeColor);        $(e.target).css("color", UI.themeBgColor);    }    function buttonMouseUp(e)    {        $(e.target).css("background-color", UI.themeBgColor);        $(e.target).css("color", UI.themeColor);    }        sar.Web.UI=UI;    return sar;}catch(ex){alert("SardineFish.Web.UI:"+ex.message);}})(window.SardineFish);