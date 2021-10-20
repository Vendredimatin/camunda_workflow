/**
 *
 */
if(map == null) var map = {};
if(service ==null) var service;
var enClass={};
var global_ = {
  baseUrl: "http://localhost:6060/dwf/v1",
  baseObjOther: "http://localhost:9090/dwf/v1"
}
var token = "";

;
(function ($, window, documenttreeviewerFrmBar, undefined) {
  // var service = new PMService();
  console.log("mdmainContent");
  var pluginName = "mdmainContent";
  var defaults = {
    id: "",
    uid: "",
    uname: "",
    pid:"",
    proinfo:{},
  };

  var MainContent = function (element, options) {
    global_ = options.global_;
    token = options.token;
    if(service==null) service = new PMService(global_);
    ajax({
      type: "GET",
      url: global_.baseUrl + "/meta/entities",
      headers: {
        Authorization: token
      },
      success: function (res) {
        var ecData  = res.data;
        if(ecData){
          $.each(ecData, function(i,val){
            enClass[val["className"]] = val["displayName"];
          });
        }

        console.log("MainContent enClass after",enClass);
      }
    });
    this.element = element;
    this.options = $.extend({
      id: "",
      uid: "",
      uname: "",
      pid:"",
      proinfo : {},
    }, defaults, options);
    console.log("mdmainContent this.options",this.options);
    this.setPropertySheet = this.options.proinfo.setPropertySheet;
    this.basicpropsheet = options.basicpropsheet;
    this.propsheet = options.propsheet;
    this._defaults = defaults;
    this._name = pluginName;
    this.uid = options.uid;
    this.menubar = null;
    this.init(options);
  };

  MainContent.prototype.init = function (options) {
    if ($(this.element).mainContentPlugin != undefined) {
      var p4 = $(this.element).mainContentPlugin({
        id: options.id,
        name: "pm",
        uid: options.uid,
        parent: this,
        pid:options.pid,
        proinfo:options.proinfo,
      });
      this.mainContentPlugin = p4.data("mainContentPlugin");
    }


    var p = document.createElement("DIV");
    this.element.appendChild(p);
    // confirm message dialog plugin
    // var p2 = $(p).confirmInfoDialog({
    //     id: "005",
    //     title: "提示",
    //     parent: this,
    // });
    // this.confirmInfoDialog = p2.data("confirmInfoDialog");


    if(this.options.pid){
      this.mainContentPlugin.addNewTab("流程名",this.options.pid,
        "", "P");
      this.savePrefer(this.options.pid);
    }
  };
  MainContent.prototype.refresh = function () {
    if( map[this.options.pid]){
      map[this.options.pid].loading();
    }

  }

  MainContent.prototype.savePrefer = function (id) {
    prefer.pm.addId(id);
    var s = JSON.stringify(prefer);
    if (typeof (Storage) !== undefined) {
      var userId = localStorage.getItem("userId");
      localStorage.setItem(userId, s);
    }
  };


  MainContent.prototype.setPropertySheet = function () {
    console.log("MainContent this.option,this.option");
    this.wfprocess = map[this.options.pid];
    var obj = this.wfprocess;
    console.log("this.wfprocess",this.wfprocess)
    if (this.selected != null && this.selected.length > 0) {
      obj = this.selected[0];
    }
    if (this.basicpropsheet != null) {
      console.log("md this.wfprocess",this.wfprocess);
      this.basicpropsheet.setSheet(obj,this.wfprocess);
    }
    if (this.propsheet != null) {
      this.propsheet.setSheet(obj, this.wfprocess, this.propsheet
        .getCurrTabIndex(obj));
    }
  };


  // f: 0: it is process; 1: it is folder
  MainContent.prototype.doNoAction = function (e, type, id, f) {
    // this.confirmInfoDialog.hide();
  };

  // remove process tab from tab contents, pid is process id
  MainContent.prototype.removeTab = function (pid) {
    var that = this;
    $(".nav-tabs").children('li').each(function (entry) {
      var anchor = $(this).children("a")[0];
      var id = $(anchor).attr('href').substring(5);// #tab_000002A8AS
      if (pid == id) {
        that.mainContentPlugin.cloaseTab(id, anchor);
      }
    });
  };

  MainContent.prototype.doSaveAction = function () {
    console.log("maincontent savebutton");
    this.mainContentPlugin.saveChange(0, this);
  };


  MainContent.prototype.saveChange = function (id, closetab, parent) {
    parent.saveObject(id, anchor, closetab);
  };



  MainContent.prototype.saveObjects = function (id, closetab, parent, anchor) {
    $("#progressbar").show();
    var cmd = 0;
    if (map[id].wfprocess instanceof WfProcess) {
      cmd = 5;
    } else if (map[id].wfprocess instanceof ReleasedWfProcess) {
      cmd = 15;
    }
    var process1 = map[id].wfprocess.stringifyforJSON();
    // --api5 --saveobjet --update

    console.log("--api5 --saveobjet --update");
    console.log(process1);
    let that = this;
    console.log("that.options",that.options);
    if(cmd==5){
      ajaxPost(service.buildAPI("/save-process-template"),process1, function (data) {
        map[id].stack.save();
        if(data.success){
          map[id].stack.save();
          // if (closetab == 1) {parent.cloaseTab(id, anchor);}
          that.options.proinfo.setPropertySheet.$Message.success("保存成功");
        }else{
          that.options.proinfo.setPropertySheet.$Message.error("保存失败");
        }
        $("#progressbar").hide();
      });
    }

  };

  MainContent.prototype.addNewTab = function (tabcontent, myTabTitle, myTabID,
                                              myOwnerID, type) {
    console.log("MainContent.prototype.addNewTab");
    if (type == "P") {
      var p = $(tabcontent).wfProcessEditor({
        id: myTabID,
        owner: myOwnerID,
        width: this.mainContentPlugin.tabsWidth,
        height: this.mainContentPlugin.tabsHeight,
        parent: this,
        uid: this.options.uid,
        uname: this.options.uname,
        pid: this.options.pid,
        proinfo: this.options.proinfo,
      });

      map[myTabID] = p.data("wfProcessEditor");
    } else if (type == "R") {
      var p = $(tabcontent).pmProcessPublishEditor({
        id: myTabID,
        userId: this.options.uid,
        userfullname: this.options.uname,
        ownername: "",
        owner: myOwnerID,
        width: this.mainContentPlugin.tabsWidth,
        height: this.mainContentPlugin.tabsHeight,
        pid: this.options.pid,
        proinfo: this.options.proinfo,
      });
      map[myTabID] = p.data("pmProcessPublishEditor");
    }
    tabcontent.setAttribute("data", myTabID);
    // $("#tabcontents"+this.options.pid).append(tabcontent);
  };

  // myTabTitle: tab title, myTabID: process ID, myOwnerID: organization ID.
  MainContent.prototype.addNewTab0 = function (tabcontent, myTabTitle, myTabID,
                                               myOwnerID, type) {
    console.log("MainContent.prototype.addNewTab");
    if (type == "P") {
      var p = $(tabcontent).wfProcessEditor({
        id: myTabID,
        basicpropsheet: this.mainContentPlugin.basicpropertySheets,
        propsheet: this.mainContentPlugin.propertySheets,
        owner: myOwnerID,
        width: this.mainContentPlugin.tabsWidth,
        height: this.mainContentPlugin.tabsHeight,
        parent: this,
        uid: this.options.uid,
        uname: this.options.uname,
        pid: this.options.pid,
        proinfo:this.options.proinfo,
      });

      map[myTabID] = p.data("wfProcessEditor");
    } else if (type == "R") {
      var p = $(tabcontent).pmProcessPublishEditor({
        id: myTabID,
        userId: this.options.uid,
        userfullname: this.options.uname,
        ownername: "",
        basicpropsheet: this.mainContentPlugin.basicpropertySheets,
        propsheet: this.mainContentPlugin.propertySheets,
        owner: myOwnerID,
        width: this.mainContentPlugin.tabsWidth,
        height: this.mainContentPlugin.tabsHeight,
        pid: this.options.pid,
        proinfo:this.options.proinfo,
      });
      map[myTabID] = p.data("pmProcessPublishEditor");
    }
    // tabcontent.setAttribute("data", myTabID);
    // $("#tabcontents"+this.options.pid).append(tabcontent);
  };

  MainContent.prototype.doAutoResizeForAdPTabs = function (h, id) {
    var t = document.getElementById("tablediv" + id);
    if (t != null) {
      t.style.height = "242px";
    }
    var t1 = document.getElementById("listPane" + id);
    if (t1 != null) {
      t1.style.height = "242px";
    }
  };

  MainContent.prototype.doAutoResizeForEditorTabs = function (w, h, id) {
    var p = document.getElementById("accordion" + id);
    var t = document.getElementById("convasPane_" + id);
    var t1 = document.getElementById("canvasPanel" + id);

    var t5 = document.getElementById("rlpcanvasPanel" + id);
    var t4 = document.getElementById("rlprocPane" + id);

    var t2 = document.getElementById("rlprocCanvasPanel" + id);
    var t3 = document.getElementById("rlprocConvasPane" + id);
    if (p != null) {
      p.style.height = (h - 84) + "px";
    }
    if (t != null) {
      // 84 is toolbar height + tab height;
      t.style.height = (h - 84) + "px";
    }
    if (t1 != null) {
      // 76 is 70(pallet width) + 2(border) + 4(gap)
      // t1.style.width = (w - 76) + "px";
      t1.style.width = (w - 76) + "px";
    }
    if (t4 != null) {
      t4.style.height = (h - 84) + "px";
    }
    if (t5 != null) {
      t5.style.width = (w) + "px";
    }
    // 130 is 126 (2 tab height + tool bar height)
    // + 4 (2 gap height + 2 tab border height)
    if (t2 != null) {
      t2.style.width = (w) + "px";
    }
    if (t3 != null) {
      t3.style.height = (h - 130) + "px";
    }
  };

  MainContent.prototype.doEastResize = function (evt, id, dx) {
    var t = document.getElementById("canvasPanel" + id);
    var t2 = document.getElementById("rlprocCanvasPanel" + id);
    var t4 = document.getElementById("rlprocPane" + id);
    if (t != null) {
      t.style.width = (parseInt(t.style.width) + dx) + "px";
    }
    if (t2 != null) {
      t2.style.width = (parseInt(t2.style.width) + dx) + "px";
    }
    if (t4 != null) {
      t4.style.width = (parseInt(t4.style.width) + dx) + "px";
    }
    var t5 = document.getElementById("rlpcanvasPanel" + id);
    if (t5 != null) {
      t5.style.width = (parseInt(t5.style.width) + dx) + "px";
    }
  };

  MainContent.prototype.doWestResize = function (evt, id, dx) {
    var t = document.getElementById("canvasPanel" + id);
    var t2 = document.getElementById("rlprocCanvasPanel" + id);
    var t4 = document.getElementById("rlprocPane" + id);
    if (t != null) {
      t.style.width = (parseInt(t.style.width) - dx) + "px";
    }
    if (t2 != null) {
      t2.style.width = (parseInt(t2.style.width) - dx) + "px";
    }
    if (t4 != null) {
      t4.style.width = (parseInt(t4.style.width) - dx) + "px";
    }
    var t5 = document.getElementById("rlpcanvasPanel" + id);
    if (t5 != null) {
      t5.style.width = (parseInt(t5.style.width) - dx) + "px";
    }
  };

  MainContent.prototype.doSouthResizeForAdPTabs = function (evt, id, dy) {
    var t = document.getElementById("tablediv" + id);
    if (t != null) {
      t.style.height = (parseInt(t.style.height) - dy) + "px";
    }
    var t2 = document.getElementById("listPane" + id);
    if (t2 != null) {
      t2.style.height = (parseInt(t2.style.height) - dy) + "px";
    }
  };

  MainContent.prototype.doSouthResizeForEditorTabs = function (evt, id, dy) {
    var t = document.getElementById("convasPane_" + id);
    var p = document.getElementById("accordion" + id);
    var t1 = document.getElementById("rlprocPane" + id);
    var t4 = document.getElementById("rlprocConvasPane" + id);
    if (t != null) {
      t.style.height = (parseInt(t.style.height) + dy) + "px";
    }
    if (p != null) {
      p.style.height = (parseInt(p.style.height) + dy) + "px";
    }
    if (t1 != null) {
      t1.style.height = (parseInt(t1.style.height) + dy) + "px";
    }
    if (t4 != null) {
      t4.style.height = (parseInt(t4.style.height) + dy) + "px";
    }
  };

  $.fn[pluginName] = function (options) {
    return this.each(function () {
      if (!$.data(this, pluginName)) {
        $.data(this, pluginName, new MainContent(this, options));
      } else if ($.isFunction(Plugin.prototype[options])) {
        $.data(this, pluginName)[options]();
      }
    });
  };

})(jQuery, window, document);
