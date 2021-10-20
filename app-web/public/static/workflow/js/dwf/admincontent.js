/**
 *
 */
if( map == null )var map = {};
var service;
var enClass={};
// var global_ = "http://localhost:6060";
var global_ = {
  baseUrl: "http://localhost:6060/dwf/v1",
  baseObjOther: "http://localhost:9090/dwf/v1"
}
var token = "";
;
(function($, window, document, undefined) {
	var pluginName = "admainContent";
	var defaults = {
		id : "",
		uid : "",
		pid : "",
    proinfo:{},
	};

	var MainContent = function(element, options) {
        global_ = options.global_;
        token = options.token;
        service = new ADMINService(global_);
        ajax({
            type: "GET",
            url: global_.baseUrl + "/meta/entities",
            headers: {
                Authorization: token
            },
            success: function (res) {
                var ecData  = res.data;
                $.each(ecData, function(i,val){
                    enClass[val["className"]] = val["displayName"];
                });
                console.log("enClass",enClass);
            }
        });
		this.element = element;
		this.options = $.extend({
			id : "",
      uid : "",
      proinfo:{},
			pid:"",
		}, defaults, options);
		this._defaults = defaults;
		this._name = pluginName;
		this.basicpropertySheets = null; // basic property setter;
		this.propertySheets = null; // advanced property setter;
		this.init(options);
		this.currentProcID = -1;
		this.menubar = null;

	};

	MainContent.prototype.init = function(options) {
		if ($(this.element).mainContentPlugin != undefined) {
			var p4 = $(this.element).mainContentPlugin({
				id : options.id,
				name : "admin",
				uid : options.proinfo.uid,
				parent : this,
        pid:options.pid
			});
			this.mainContentPlugin = p4.data("mainContentPlugin");
		}
        if(this.options.pid){
        	console.log("this.options.pid",this.options.pid);
            this.mainContentPlugin.addNewTab("流程名",this.options.pid, "", "3");
            this.savePrefer(this.options.pid);
        }else{
            // 点击打开流程编辑器
            this.mainContentPlugin.addNewTab("流程名", "00000000000004PT",
                "", "P");
            this.savePrefer("00000000000004PT");
        }

	};


	MainContent.prototype.savePrefer = function(id) {
		prefer.admin.addId(id);
		var s = JSON.stringify(prefer);
		if (typeof (Storage) !== undefined) {
			var userId = localStorage.getItem("userId");
			localStorage.setItem(userId, s);
		}
	};

	MainContent.prototype.openEditor = function(eid, i) {
		if (eid != null && eid != "") {
			// $('#treeview').jstree('deselect_all', true);
			//var d = $('#treeview').jstree('get_node', eid);
			var instance = $('#treeview').jstree(true);
			var s = instance.select_node(eid);
			var sel = instance.get_selected(true)[i];
			if (sel != null) {
				// var leaf = instance.is_leaf(sel);
				var arry = sel.data.split("|");
				if (arry[0] == "1" || (arry[0] == "2" && arry[2] != "109")
						|| arry[0] == "3") {
					window.main.mainContentPlugin.addNewTab(sel.text, sel.id,
							arry[1], arry[0]);
					window.main.savePrefer(sel.id);
				}
			}
		}
	};

	MainContent.prototype.openOneEditor = function(node) {
		var arry = node.data.split("|");
		window.main.mainContentPlugin.addNewTab(node.text, node.id, arry[1],
				arry[0]);
		window.main.savePrefer(node.id);
	}

	MainContent.prototype.doYesAction = function(e, type, pid, orgid) {
		this.mainContentPlugin.confirmInfoDialog.hide();
	};

	MainContent.prototype.doNoAction = function(e, type, pid) {
		this.mainContentPlugin.confirmInfoDialog.hide();

	};

	MainContent.prototype.removeTab = function(pid) {
		var that = this;
		$(".main-nav-tabs"+this.options.pid).children('li').each(function(entry) {
			var anchor = $(this).children("a")[0];
			var id = $(anchor).attr('href').substring(5);// #tab_000002A8AS
			if (pid == id) {
				that.cloaseTab(id, anchor);
			}
		});
	};

	MainContent.prototype.doSaveAction = function() {
		this.mainContentPlugin.saveChange(0, this);
	};

	MainContent.prototype.doCreateNewAction = function() {
		this.createModelDialog.show();
	};


  MainContent.prototype.addNewTabForRPI = function(tabcontent,myTabTitle,
                                                   myTabID, myOwnerID) {
    // var tabcontent = document.createElement("DIV");
    // tabcontent.setAttribute('role', 'tabpanel');
    // tabcontent.className = "tab-pane";
    // tabcontent.id = "tab_" + myTabID;
    // if ($(tabcontent).adminAppEditor != undefined) {
    console.log("addNewTabForRPI proinfo",this.options.proinfo);
      var p = $(tabcontent).runtimeWfProcessEditor(
        {
          id: myTabID,
          owner: myOwnerID,
          width: this.mainContentPlugin.tabsWidth,
          height: this.mainContentPlugin.tabsHeight,
          proinfo: this.options.proinfo,
        });
      tabcontent.setAttribute("data", myTabID);
      map[myTabID] = p.data("runtimeWfProcessEditor");

    // $("#tabcontents"+this.options.pid).append(tabcontent);
  }


	// myTabTitle: tab title, myTabID: released process ID, myOwnerID:
	// organization ID.
	MainContent.prototype.addNewTabForRPI0 = function(myTabTitle,
			myTabID, myOwnerID) {
	  console.log("map[myTabID] ",map[myTabID] );
		if (map[myTabID] == undefined || map[myTabID] == null
      || document.getElementById('presentation_'+myTabID) == null) {
			var tabheader = document.createElement("li");
			tabheader.setAttribute('role', 'presentation');
      tabheader.setAttribute('id', 'presentation_'+myTabID);
			var tablink = document.createElement("a");
			tablink.setAttribute('href', '#tab_' + myTabID + '');
			tablink.setAttribute('aria-controls', '#tab_' + myTabID + '');
			tablink.setAttribute('role', 'tab');
			tablink.setAttribute('data-toggle', 'tab');

			var tabTitle = document.createElement("text");
			tabTitle.innerHTML = "<font color='green'><b>" + myTabTitle
					+ "</b></font>" + "&nbsp;&nbsp;";
			tablink.appendChild(tabTitle);

			var tabCloseSpan = document.createElement("span");
			tabCloseSpan.className = "glyphicon glyphicon-remove";
			tabCloseSpan.style.color = "red";
			tabCloseSpan.setAttribute("data", myTabID);
			tablink.appendChild(tabCloseSpan);

			tabheader.appendChild(tablink);
			$('#myTab'+this.options.pid).append(tabheader);

			var tabcontent = document.createElement("DIV");
			tabcontent.setAttribute('role', 'tabpanel');
			tabcontent.className = "tab-pane";
			tabcontent.id = "tab_" + myTabID;
			if ($(tabcontent).adminAppEditor != undefined) {
				var p = $(tabcontent).runtimeWfProcessEditor(
					{
						id : myTabID,
						owner : myOwnerID,
						width : this.mainContentPlugin.tabsWidth,
						height : this.mainContentPlugin.tabsHeight,
            proinfo: this.options.proinfo,
					});
				tabcontent.setAttribute("data", myTabID);
				map[myTabID] = p.data("runtimeWfProcessEditor");
			}
			// $("#tabcontents"+this.options.pid).append(tabcontent);
		}
		// $('.main-nav-tabs'+this.options.pid+' a[href="#tab_' + myTabID + '"]').tab('show');

	};

  MainContent.prototype.addNewTab = function(tabcontent, myTabTitle, myTabID,
                                             myOwnerID, type) {

      // if ($(tabcontent).adminAppEditor != undefined) {
      //   var p = $(tabcontent).adminAppEditor(
      //     {
      //       id: myTabID,
      //       owner: myOwnerID,
      //       width: this.mainContentPlugin.tabsWidth,
      //       height: this.mainContentPlugin.tabsHeight,
      //       topparent: this,
      //       proinfo:this.options.proinfo,
      //     });
      //   tabcontent.setAttribute("data", myTabID);
      //   map[myTabID] = p.data("adminAppEditor");
      // }
    var id = this.options.proinfo.pid;
    var title =  this.options.proinfo.pname;
    this.addNewTabForRPI(tabcontent,title, id, this.options.proinfo.pid);

    // $("#tabcontents"+this.options.pid).append(tabcontent);

  };

	// myTabTitle: tab title, myTabID: process ID, myOwnerID: organization ID.
	MainContent.prototype.addNewTab0 = function(tabcontent, myTabTitle, myTabID,
			myOwnerID, type) {MainContent.prototype.addNewTab = function(tabcontent, myTabTitle, myTabID,
                                                                   myOwnerID, type) {
    if (type == "1") {
      if ($(tabcontent).adminAllEditor != undefined) {
        var p = $(tabcontent).adminAllEditor({
          id : myTabID,
          proinfo:this.options.proinfo,
          basicpropsheet : this.mainContentPlugin.basicpropertySheets,
          propsheet : this.mainContentPlugin.propertySheets,
          owner : myOwnerID,
          width : this.mainContentPlugin.tabsWidth,
          height : this.mainContentPlugin.tabsHeight,
          topparent: this,

        });
        tabcontent.setAttribute("data", myTabID);
        map[myTabID] = p.data("adminAllEditor");
      }
    } else if (type == "3") {
      if ($(tabcontent).adminAppEditor != undefined) {
        var p = $(tabcontent).adminAppEditor(
          {
            id: myTabID,
            basicpropsheet: this.mainContentPlugin.basicpropertySheets,
            propsheet: this.mainContentPlugin.propertySheets,
            owner: myOwnerID,
            width: this.mainContentPlugin.tabsWidth,
            height: this.mainContentPlugin.tabsHeight,
            topparent: this,
            proinfo:this.options.proinfo,
          });
        tabcontent.setAttribute("data", myTabID);
        map[myTabID] = p.data("adminAppEditor");
      }
    }
    $("#tabcontents"+this.options.pid).append(tabcontent);

  };
		if (type == "1") {
			if ($(tabcontent).adminAllEditor != undefined) {
				var p = $(tabcontent).adminAllEditor({
									id : myTabID,
                  proinfo:this.options.proinfo,
									basicpropsheet : this.mainContentPlugin.basicpropertySheets,
									propsheet : this.mainContentPlugin.propertySheets,
									owner : myOwnerID,
									width : this.mainContentPlugin.tabsWidth,
									height : this.mainContentPlugin.tabsHeight,
									topparent: this,

								});
				tabcontent.setAttribute("data", myTabID);
				map[myTabID] = p.data("adminAllEditor");
			}
		} else if (
		  type == "3") {
      if ($(tabcontent).adminAppEditor != undefined) {
        var p = $(tabcontent).adminAppEditor(
          {
            id: myTabID,
            basicpropsheet: this.mainContentPlugin.basicpropertySheets,
            propsheet: this.mainContentPlugin.propertySheets,
            owner: myOwnerID,
            width: this.mainContentPlugin.tabsWidth,
            height: this.mainContentPlugin.tabsHeight,
            topparent: this,
            proinfo:this.options.proinfo,
          });
        tabcontent.setAttribute("data", myTabID);
        map[myTabID] = p.data("adminAppEditor");
      }
    }
		$("#tabcontents"+this.options.pid).append(tabcontent);

	};

	MainContent.prototype.doAutoResizeForAdPTabs = function(h, id) {
		// var t = document.getElementById("tablediv" + id);
		// if (t != null) {
		// t.style.height = "200px";
		// }
	};

	MainContent.prototype.doAutoResizeForEditorTabs = function(w, h, id) {
		var p = document.getElementById("accordion" + id);
		var t = document.getElementById("convasPane_" + id);
		var t1 = document.getElementById("canvasPanel" + id);
		var t5 = document.getElementById("adminPanel" + id);
		var t4 = document.getElementById("canvasPanelRL" + id);
		if (p != null) {
			// pallette
			p.style.height = (h - 84) + "px";
		}
		if (t != null) {
			t.style.height = (h - 84) + "px";
		}
		if (t1 != null) {
			t1.style.width = (w - 76) + "px";
		}
		if (t4 != null) {
			t4.style.height = w + "px";
		}
		if (t5 != null) {
			t5.style.width = w + "px";
		}
		var t7 = document.getElementById("listPanel" + id);
		if (t7 != null) {
			t7.style.width = w + "px";
		}
		var t6 = document.getElementById("listPane" + id);
		if (t6 != null) {
			t6.style.height = (h - 84) + "px";
		}
		var t8 = document.getElementById("searchAllPane" + id);
		if (t8 != null) {
			t8.style.width = w + "px";
		}
		var t9 = document.getElementById("searchAppPane" + id);
		if (t9 != null) {
			t9.style.width = w + "px";
		}
	};

	MainContent.prototype.doEastResize = function(evt, id, dx) {
		var t = document.getElementById("canvasPanel" + id);
		var t2 = document.getElementById("adminPanel" + id);
		var t1 = document.getElementById("canvasPanelRL" + id);
		if (t != null) {
			t.style.width = (parseInt(t.style.width) + dx) + "px";
		}
		if (t2 != null) {
			t2.style.width = (parseInt(t2.style.width) + dx) + "px";
		}
		if (t1 != null) {
			t1.style.width = (parseInt(t1.style.width) + dx) + "px";
		}
		var t3 = document.getElementById("listPanel" + id);
		if (t3 != null) {
			t3.style.width = (parseInt(t3.style.width) + dx) + "px";
		}
		var t4 = document.getElementById("newsDetails" + id);
		if (t4 != null) {
			t4.style.width = (parseInt(t4.style.width) + dx) + "px";
		}
		var t5 = document.getElementById("addNews" + id);
		if (t5 != null) {
			t5.style.width = (parseInt(t5.style.width) + dx) + "px";
		}
		var t6 = document.getElementById("searchAllPane" + id);
		if (t6 != null) {
			t6.style.width = (parseInt(t6.style.width) + dx) + "px";
		}
		var t7 = document.getElementById("searchAppPane" + id);
		if (t7 != null) {
			t7.style.width = (parseInt(t7.style.width) + dx) + "px";
		}
	};

	MainContent.prototype.doWestResize = function(evt, id, dx) {
		var t = document.getElementById("canvasPanel" + id);
		if (t != null) {
			t.style.width = (parseInt(t.style.width) - dx) + "px";
		}
		var t2 = document.getElementById("adminPanel" + id);
		if (t2 != null) {
			t2.style.width = (parseInt(t2.style.width) - dx) + "px";
		}
		var t1 = document.getElementById("canvasPanelRL" + id);
		if (t1 != null) {
			t1.style.width = (parseInt(t1.style.width) - dx) + "px";
		}
		var t3 = document.getElementById("listPanel" + id);
		if (t3 != null) {
			t3.style.width = (parseInt(t3.style.width) - dx) + "px";
		}
		var t4 = document.getElementById("searchAllPane" + id);
		if (t4 != null) {
			t4.style.width = (parseInt(t4.style.width) - dx) + "px";
		}
		var t5 = document.getElementById("searchAppPane" + id);
		if (t5 != null) {
			t5.style.width = (parseInt(t5.style.width) - dx) + "px";
		}
	};

	MainContent.prototype.doSouthResizeForAdPTabs = function(evt, id, dy) {
		var t = document.getElementById("tablediv" + id);
		if (t != null) {
			t.style.height = (parseInt(t.style.height) - dy) + "px";
		}
		var t2 = document.getElementById("listPane" + id);
		if (t2 != null) {
			t2.style.height = (parseInt(t2.style.height) - dy) + "px";
		}
	};

	MainContent.prototype.doSouthResizeForEditorTabs = function(evt, id, dy) {
		var t = document.getElementById("convasPane_" + id);
		var p = document.getElementById("accordion" + id);
		var t2 = document.getElementById("resultdiv" + id);
		if (t != null) {
			t.style.height = (parseInt(t.style.height) + dy) + "px";
		}
		if (p != null) {
			p.style.height = (parseInt(p.style.height) + dy) + "px";
		}
		if (t2 != null) {
			if (parseInt(t2.style.height) + dy > 0) {
				t2.style.height = (parseInt(t2.style.height) + dy) + "px";
			} else {
				t2.style.height = "0px";
			}
		}
		var t3 = document.getElementById("listPane" + id);
		if (t3 != null) {
			t3.style.height = (parseInt(t3.style.height) + dy) + "px";
		}

		// 设置编辑器部分上下高度
		var t4 = document.getElementById("newsContent" + id);
		var h = document.documentElement.clientHeight;
		if (t4 != null) {
			t4.style.height = (parseInt(t4.style.height) + dy) + "px";
			if (map[id].enditorInstance != undefined
					&& map[id].enditorInstance != null) {
				map[id].enditorInstance.resize(parseInt(t4.style.width),
						(parseInt(t4.style.height) + dy), true, false);
			}
		}

		// 设置编辑器部分上下高度
		// var t5 = document.getElementById("addNewsContent" + id);
		// if (t5 != null) {
		// t5.style.height = (parseInt(t5.style.height) + dy) + "px";
		// if (map[id].enditorInstance != undefined
		// && map[id].enditorInstance != null) {
		// map[id].enditorInstance.resize(parseInt(t5.style.width),
		// (parseInt(t5.style.height) + dy), true, false);
		// }
		// }
	};

	$.fn[pluginName] = function(options) {
		return this.each(function() {
			if (!$.data(this, pluginName)) {
				$.data(this, pluginName, new MainContent(this, options));
			} else if ($.isFunction(Plugin.prototype[options])) {
				$.data(this, pluginName)[options]();
			}
		});
	};

})(jQuery, window, document);
