var maincontent;
var main;
var userId;
var id = "00000000000004QY";
var global_= {};
var token = "";
var userName = "";

function handle(proinfo) {
//   console.log("handle(proinfo):::",proinfo);
    var managerbody = document.getElementById("managerbody"+id);
    console.log("managerbody",managerbody);
    if ($(managerbody).admainContent != undefined) {
        maincontent = $(managerbody).admainContent({
            pid: proinfo.pid,
            id: "001",
            global_: proinfo.global_, 
            token: proinfo.token,
            proinfo:proinfo,

        });
        console.log("maincontent", maincontent);
        main = maincontent.data("mainContent")
    }

    setTimeout(() => {
        var myEvent = new Event("resize");
        window.dispatchEvent(myEvent);
       }, 500);
}

function admain(proInst,user, globalUrl,setPropertySheet) {
    id = proInst.pid;
    global_ = globalUrl;
    userId = user.uid;
    token = user.tk;
    userName = user.uname;
    var proinfo = {
      pid: proInst.pid,
      pname: proInst.pname,
      uid: user.uid,
      global_: globalUrl,
      token: user.tk,
      uname: user.uanme,
      enClassName:user.enClassName,
      setPropertySheet: setPropertySheet,
    };
    console.log("admain proinfo",proinfo);
    handle(proinfo);
    //setTimeout(handle, 100);
}

export default admain;
