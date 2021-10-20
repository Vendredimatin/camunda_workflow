

var maincontent;
var main;
var userId;
var service;
service = new PMService();
var managerbody = document.getElementById("managerbody");
var id = "00000000000004PK";
// if(proid) id = proid;
maincontent = $(managerbody).mdmainContent({
    pid: id,
    id: "001",
    uid: "000001",
    uname: "工作流用户",
});
console.log("maincontent",maincontent);
main = maincontent.data("mdmainContent");

userId = "000001";
if (typeof (Storage) !== "undefined") {
    localStorage.setItem("userId", userId);
    localStorage.setItem("currtab" + userId, "pm");
    document.addEventListener("visibilitychange", function () {
        if (document.visibilityState == "visible") {
            localStorage.setItem("currtab" + userId, "pm");
        }
    })
}
// function mdmain() {
   

// }

// export default mdmain;