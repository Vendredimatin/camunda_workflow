

var maincontent;
var main;
var userId;
var userName;
// var service;
var managerbody;
var id = "00000000000004MZ";
var token = "";
// var baseUrl = "";
var global_= {};
// if(proid) id = proid;
var fields = ["participantSettingPane","processVariablesPane","statusBar","inProgressBar","alertBox","confirmInfoDialog","messageDialog","renameEditDialog","approvalLogPane","treeViewer","accessTypeSelectCellEditor","processTypeSelectCellEditor","textareaCellEditor","textCellEditor","yesnoCellEditor","workflowTypeSelectCellEditor","processNameCellEditor","basicDataValueCellEditor","boolValueCellEditor","longTextCellEditor","datetimeCellEditor","dateCellEditor","timeCellEditor","timeDurationCellEditor","fileObjectCellEditor","proprietorEditDialog","ruleEditModalDialog","constantEditDialog","dataVariableEditDialog","assignmentEditDialog","createModelDialog","assignmentEditDialog","receiverEditDialog","releaseWfProcessDialog","processServiceStoreDialog","formServiceStoreDialog","constantEditDialog","proprietorSettingPane","ruleEditPanel","navigationRuleEditPanel","routeOrderEditPanel","processEditPanel","waitingTaskEditPanel","assignmentEditPanel","candidateSettingPane","manualTaskEditPanel","systemTaskEditPanel","subprocessSettingEditPanel","blankEditPanel","accessibleVariablesPane","clientUISettingPane","deadlineSettingPane","startPointEditPanel","endPointEditPanel","pointUIEditPane","exprEditPanel","aryInitValueEditPanel","specialPropEditPanel","constantEditPanel","releasedWfProcessPropsPanel","appProcessIconSettingPane","pmProcessPublishEditor","wfProcessEditor","releasedWfProcessEditor","basicPropertySheet","propertySheets","mdmainContent","mainContentPlugin"];
fields = [];

console.log("app mdmain");

function check() {
  // if (!managerbody) return false;
  // var item = $(managerbody);
  // for (var i = 0;i < fields.length;i++) {
  //   if (!item[fields[i]]) {
  //     console.log("test:" + fields[i] + " not loaded");
  //     return false;
  //   }
  // }
  return true;
}

function handle(proinfo) {
  var domName = 'managerbody'+id;
    managerbody = document.getElementById(domName);
    if (check()) {
      console.log("test: succ", managerbody);
      try {
      //  service = new PMService();
      //  console.log("test:", service);
       maincontent = $('#managerbody'+id).mdmainContent({
           pid: id,
           id: "001",
           uid: userId,
           uname: userName,
          //  baseUrl: baseUrl,
           global_: global_,
           token: token,
           proinfo:proinfo,
       });
       // console.log("maincontent",maincontent);
       main = maincontent.data("mdmainContent");

       if (typeof (Storage) !== "undefined") {
           localStorage.setItem("userId", userId);
           localStorage.setItem("currtab" + userId, "pm");
           document.addEventListener("visibilitychange", function () {
               if (document.visibilityState == "visible") {
                   localStorage.setItem("currtab" + userId, "pm");
               }
           })
       }

       setTimeout(() => {
        var myEvent = new Event("resize");
        window.dispatchEvent(myEvent);
       }, 500);
      } catch (e) {
        console.log(e);
      }
    } else {
      // handle(proinfo);
      // setTimeout(handle(proinfo), 100);
    }
    console.log("handle that.main",main);
    return main;
}

function mdmain(process, user, globalUrl, setPropertySheet){
  // pid, url, uid, uname, tk, setPropertySheet) {
    // id = pid;
    // baseUrl = url;
    // userId = uid;
    // userName = uname;
    // token = tk;
    id = process.pid;
    global_ = globalUrl;
    // baseUrl = global_.baseObjOther.replace("/dwf/v1", "");
    userId = user.uid;
    userName = user.uname;
    token = user.tk;
    
    let proinfo = {
      userId : user.uid,
      userName : user.uname,
      pid: process.pid,
      setPropertySheet : setPropertySheet,
    };
    // console.log("mdmain proinfo",proinfo);
    let main = handle(proinfo);
    return main;
    // setTimeout(handl(proinfo), 100);
}

export default mdmain;
