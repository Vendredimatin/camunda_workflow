/**
 * 
 */

;
(function($, window, document, undefined) {
	var pluginName = "propertySheets";
	var defaults = {
		prop : "",
		topparent : "",
		height : 0,
    pid : "",
	};

	var PropertySheet = function(element, options) {
		this.element = element;
		this.options = $.extend({
			prop : "",
			topparent : "",
			height : 0,
      pid:""
		}, defaults, options);
		this._defaults = defaults;
		this._name = pluginName;
		this.topparent;
		this.panelBody;
		this.processSheet;
		this.addButton;
		this.modifyButton;
		this.removeButton;
		this.owner = null;
		this.processVariablesPlugin = null;
		this.navigationRulePlugin = null;
		this.assignmentRditPlugin = null;
		this.waittaskRditPlugin = null;
		this.manualTaskRditPlugin = null;
		this.systemTaskRditPlugin = null;
		this.subprocessTaskRditPlugin = null;
		this.accessibleVariablesPanePlugin = null;
		this.blankTaskRditPlugin = null;
		this.init(options);
		this.initSheet();
	};

	PropertySheet.prototype.init = function(options) {
		this.topparent = options.topparent;
		var panelDiv = document.createElement("DIV");
		panelDiv.className = "panel panel-default";
		var header = document.createElement("DIV");
		header.className = "panel-heading self-panel";
		header.innerHTML = "高级属性";
		panelDiv.appendChild(header);

		var panelToolbar = document.createElement("UL");
		panelToolbar.className = "nav navbar-nav navbar-right";
		panelToolbar.style.paddingRight = "10px";
		header.appendChild(panelToolbar);

		this.addButton = this.createToolbarItem(panelToolbar, "addnew", "添加",
				"glyphicon glyphicon-plus", "btn btn-primary btn-xs");
		this.modifyButton = this.createToolbarItem(panelToolbar, "modify",
				"修改", "glyphicon glyphicon-pencil", "btn btn-primary btn-xs");
		this.removeButton = this.createToolbarItem(panelToolbar, "removeone",
				"删除", "glyphicon glyphicon-minus", "btn btn-danger btn-xs");

		this.panelBody = document.createElement("DIV");
		this.panelBody.className = "table-responsive";
		this.panelBody.id = "adpropertysheetPane_" + options.pid;
		this.panelBody.style.overflowX = "auto";
		this.panelBody.style.overflowY = "auto";
		this.panelBody.style.height = options.height;
		panelDiv.appendChild(this.panelBody);

		this.element.appendChild(panelDiv);
	};

	PropertySheet.prototype.createToolbarItem = function(parent, id, title,
			icon, classname) {
		var toolItem = document.createElement("li");
		toolItem.style.padding = "2px";
		parent.appendChild(toolItem);
		var toolButton = document.createElement("button");
		toolItem.appendChild(toolButton);
		toolButton.type = "button";
		toolButton.id = id;
		toolButton.className = classname;
		toolButton.setAttribute("title", title);
		toolButton.setAttribute("disabled", "");
		toolButton.addEventListener("click", this, false);
		var toolSpan = document.createElement("span");
		toolSpan.className = icon;
		toolSpan.id = id;
		toolButton.appendChild(toolSpan);
		return toolButton;
	};

	PropertySheet.prototype.clearSheet = function(options) {
		this.disabledAddButton();
		this.disabledModifyButton();
		this.disabledRemoveButton();
		while (this.panelBody.hasChildNodes()) {
			this.panelBody.removeChild(this.panelBody.lastChild);
		}
	};

	PropertySheet.prototype.initSheet = function(options) {
		var blankSheet = document.createElement("table");
		blankSheet.id = "advancedpropertysheet";
		blankSheet.className = "table table-striped table-hover";
		this.panelBody.appendChild(blankSheet);
		$(blankSheet).children().remove();
		for (i = 0; i < 4; i++) {
			var row = blankSheet.insertRow(-1);
			var cell1 = row.insertCell(0);
			cell1.innerHTML = "&nbsp;";
		}
	};

	PropertySheet.prototype.handleEvent = function(e) {
		switch (e.type) {
		case "click":
			this.doClick(e);
			break;
		}
	};

	PropertySheet.prototype.doClick = function(evt) {
		if (evt.target == this.addButton || evt.target.id == "addnew") {
			this.addRow(evt);
		} else if (evt.target == this.modifyButton || evt.target.id == "modify") {
			this.modifyRow(evt);
		} else if (evt.target == this.removeButton
				|| evt.target.id == "removeone") {
			this.removeRow(evt);
		}
	};

	PropertySheet.prototype.addRow = function(evt) {
		if (this.entity instanceof WfProcessInstance) {
			this.procVariablesPlugin.addRow(evt);
		} else if (this.entity instanceof AssignTask) {
			this.assignmentRditPlugin.addRow(evt);
		} else if (this.entity instanceof SubprocessPoint) {
			this.subprocessTaskRditPlugin.addRow(evt);
		} else if (this.entity instanceof ManualTask) {
			this.manualTaskRditPlugin.addRow(evt);
		} else if (this.entity instanceof StartPoint) {
			this.stPointUIPanePlugin.addRow(evt);
		} else if (this.entity instanceof EndPoint) {
			this.edPointUIPanePlugin.addRow(evt);
		} else if (this.entity instanceof SMSSendingTask) {
			this.smsSendingTaskEditPanePlugin.addRow(evt);
		} else if (this.entity instanceof EmailSendingTask) {
			this.emailSendingTaskEditPanePlugin.addRow(evt);
		}
	};

	PropertySheet.prototype.modifyRow = function(evt) {
		if (this.entity instanceof WfProcessInstance) {
			this.procVariablesPlugin.modifyRow(evt);
		} else if (this.entity instanceof AssignTask) {
			this.assignmentRditPlugin.modifyRow(evt);
		} else if (this.entity instanceof SubprocessPoint) {
			this.subprocessTaskRditPlugin.modifyRow(evt);
		} else if (this.entity instanceof SystemTask) {
			this.systemTaskRditPlugin.modifyRow(evt);
		} else if (this.entity instanceof ManualTask) {
			this.manualTaskRditPlugin.modifyRow(evt);
		} else if (this.entity instanceof StartPoint) {
			this.stPointUIPanePlugin.modifyRow(evt);
		} else if (this.entity instanceof EndPoint) {
			this.edPointUIPanePlugin.modifyRow(evt);
		} else if (this.entity instanceof SMSSendingTask) {
			this.smsSendingTaskEditPanePlugin.modifyRow(evt);
		} else if (this.entity instanceof EmailSendingTask) {
			this.emailSendingTaskEditPanePlugin.modifyRow(evt);
		}
	};

	PropertySheet.prototype.removeRow = function(evt) {
		// if (this.entity instanceof WfProcessInstance) {
		// this.procVariablesPlugin.removeRow(evt);
		// } else if (this.entity instanceof AssignTask) {
		// this.assignmentRditPlugin.removeRow(evt);
		// } else if (this.entity instanceof SubprocessPoint) {
		// this.subprocessTaskRditPlugin.removeRow(evt);
		// } else if (this.entity instanceof StartPoint) {
		// this.stPointUIPanePlugin.removeRow(evt);
		// } else if (this.entity instanceof EndPoint) {
		// this.edPointUIPanePlugin.removeRow(evt);
		// }
	};

	// obj is process or task or transition or released process
	// owner is current owner of task or transition
	// tabindex is tab index of property has tabs
	PropertySheet.prototype.setSheet = function(obj, owner, tabindex) {
		this.entity = obj;
		this.owner = owner;// process or released process
		this.clearSheet();
		if (this.entity instanceof WfProcessInstance) {
			this.enableAddButton();
			this.disabledModifyButton();
			this.disabledRemoveButton();
			if (this.procVariablesPlugin == null) {
				this.initProcessEditPane(this.panelBody);
			} else {
				this.procVariablesPlugin.loadPane(this.entity);
			}
		}
		else if (this.entity instanceof Transition) {
			this.disabledAddButton();
			this.disabledModifyButton();
			this.disabledRemoveButton();
			if (this.navigationRulePlugin == null) {
				this.initNavigationRuleEditPane(this.panelBody);
			} else {
				this.navigationRulePlugin.loadPane(this.entity, owner);
			}
		}
		else if (this.entity instanceof AssignTask) {
			if (owner instanceof WfProcess) {
				this.enableAddButton();
			} else {
				this.disabledAddButton();
			}
			this.disabledModifyButton();
			this.disabledRemoveButton();
			if (this.assignmentRditPlugin == null) {
				this.initAssignmentEditPane(this.panelBody);
			} else {
				this.assignmentRditPlugin.loadPane(this.entity, owner);
			}
		}
		else if (this.entity instanceof WaitingTask) {
			this.disabledAddButton();
			this.disabledModifyButton();
			this.disabledRemoveButton();
			if (this.waittaskRditPlugin == null) {
				this.initWaitingTaskEditPane(this.panelBody);
			} else {
				this.waittaskRditPlugin.loadPane(this.entity, owner);
			}
		}
		else if (this.entity instanceof ManualTask) {
			this.disabledAddButton();
			this.disabledModifyButton();
			this.disabledRemoveButton();
			if (this.manualTaskRditPlugin == null) {
				this.initManualTaskEditPane(this.panelBody);
			} else {
				this.manualTaskRditPlugin
						.loadPane(this.entity, tabindex, owner);
			}
		}
		else if (this.entity instanceof SystemTask) {
			if (this.systemTaskRditPlugin == null) {
				this.initSystemTaskEditPane(this.panelBody);
			} else {
				this.systemTaskRditPlugin.loadPane(this.entity, owner);
			}
		}
		else if (this.entity instanceof SubprocessPoint) {
			this.disabledAddButton();
			this.disabledModifyButton();
			this.disabledRemoveButton();
			if (this.subprocessTaskRditPlugin == null) {
				this.initSubprocessEditPane(this.panelBody);
			} else {
				this.subprocessTaskRditPlugin.loadPane(this.entity, owner);
			}
		}
		else if (this.entity instanceof StartPoint) {
			this.disabledAddButton();
			this.disabledModifyButton();
			this.disabledRemoveButton();
			if (this.stPointUIPanePlugin == null) {
				this.initStartPointEditPane(this.panelBody);
			} else {
				this.stPointUIPanePlugin.loadPane(this.entity, tabindex, owner);
			}
		}
		else if (this.entity instanceof EndPoint) {
			this.disabledAddButton();
			this.disabledModifyButton();
			this.disabledRemoveButton();
			if (this.edPointUIPanePlugin == null) {
				this.initEndPointEditPane(this.panelBody);
			} else {
				this.edPointUIPanePlugin.loadPane(this.entity, tabindex, owner);
			}
		}
		else if (this.entity instanceof SMSSendingTask) {
			this.disabledAddButton();
			this.disabledModifyButton();
			this.disabledRemoveButton();
			if (this.smsSendingTaskEditPanePlugin == null) {
				this.initSMSSendingTaskEditPane(this.panelBody);
			} else {
				this.smsSendingTaskEditPanePlugin.loadPane(this.entity,
						tabindex, owner);
			}
		}
		else if (this.entity instanceof EmailSendingTask) {
			this.disabledAddButton();
			this.disabledModifyButton();
			this.disabledRemoveButton();
			if (this.emailSendingTaskEditPanePlugin == null) {
				this.initEmailSendingTaskEditPane(this.panelBody);
			} else {
				this.emailSendingTaskEditPanePlugin.loadPane(this.entity,
						tabindex, owner);
			}
		}
		else if (this.entity instanceof ReleasedWfProcess) {
			this.disabledModifyButton();
			this.disabledModifyButton();
			this.disabledRemoveButton();
			if (this.rlprocVariablesPlugin == null) {
				this.initRlProcessEditPane(this.panelBody);
			} else {
				this.rlprocVariablesPlugin.loadPane(this.entity);
			}
		// } else if (this.entity instanceof SystemNotice) { // 系统通知显示
		// 	this.disabledAddButton();
		// 	this.disabledModifyButton();
		// 	this.disabledRemoveButton();
		// 	if (this.noticeViewPlugin == null) {
		// 		this.intiNoticeViewPane(this.panelBody);
		// 	} else {
		// 		this.noticeViewPlugin.init(this.entity);
		// 	}
		// } else if (this.entity instanceof News) { // 新闻审核列表显示
		// 	this.disabledAddButton();
		// 	this.disabledModifyButton();
		// 	this.disabledRemoveButton();
		// 	if (this.newsViewPanePlugin == null) {
		// 		this.initNewsEditorPane(this.panelBody);
		// 	} else {
		// 		this.newsViewPanePlugin.loadPane(this.entity);
		// 	}
		// } else if (this.entity instanceof ReleasedForm) {
		// 	this.disabledAddButton();
		// 	this.disabledModifyButton();
		// 	this.disabledRemoveButton();
		// 	if (this.rlFormPropsPlugin == null) {
		// 		this.initRlFormEditPane(this.panelBody);
		// 	} else {
		// 		this.rlFormPropsPlugin.loadPane(this.entity);
		// 	}
		// } else if (this.entity instanceof WebAppService) {
		// 	this.disabledAddButton();
		// 	this.disabledModifyButton();
		// 	this.enableRemoveButton()
		// 	if (this.webAppPropPlugin == null) {
		// 		this.initWebAppPropEditPane(this.panelBody);
		// 	} else {
		// 		this.webAppPropPlugin.loadPane(this.entity);
		// 	}
		// } else if (this.entity instanceof AndroidAppPlugin) {
		// 	this.disabledAddButton();
		// 	this.disabledModifyButton();
		// 	this.enableRemoveButton();
		// 	if (this.amAndroidAppPlugin == null) {
		// 		this.initAndroidAppPropEditPane(this.panelBody);
		// 	} else {
		// 		this.amAndroidAppPlugin.loadPane(this.entity);
		// 	}
		} else {
			this.initSheet();
		}
	};

	PropertySheet.prototype.initWebAppPropEditPane = function(parent) {
		var plugin = $(parent).webAppSevicePropEditPanel({
			id : "wap005",
			parent : this,
			entity : this.entity,
			topparent : this.topparent,
		});
		this.webAppPropPlugin = plugin.data("webAppSevicePropEditPanel");
	};

	// PropertySheet.prototype.initProcessEditPane = function(parent) {
	// 	var plugin = $(parent).processVariablesEditPanel({
	// 		id : "p001",
	// 		parent : this,
	// 		entity : this.entity,
	// 		topparent : this.topparent,
	// 		currowner : this.owner,// wfprocess object
	// 	});
	// 	this.procVariablesPlugin = plugin.data("processVariablesEditPanel");
	// };
    PropertySheet.prototype.initProcessEditPane = function (parent) {
        var plugin = $(parent).processEditPanel({
            id: "p001",
            parent: this,
            entity: this.entity,
            topparent: this.topparent,
            pid:this.options.pid,
        });
        this.procVariablesPlugin = plugin.data("processEditPanel");
    };

	PropertySheet.prototype.initRlFormEditPane = function(parent) {
		var plugin = $(parent).releasedFormPropsPanel({
			id : "rlf002",
			parent : this,
			entity : this.entity,
			topparent : this.topparent,
			currowner : this.owner,
		});
		this.rlFormPropsPlugin = plugin.data("releasedFormPropsPanel");
	};

	PropertySheet.prototype.initRlProcessEditPane = function(parent) {
		var plugin = $(parent).releasedWfProcessPropsPanel({
			id : "p001",
			parent : this,
			entity : this.entity,
			topparent : this.topparent,
			currowner : this.owner,
		});
		this.rlprocVariablesPlugin = plugin.data("releasedWfProcessPropsPanel");
	};

	PropertySheet.prototype.initStartPointEditPane = function(parent) {
		var plugin = $(parent).startPointEditPanel({
			id : "st009",
			parent : this,
			entity : this.entity,
			topparent : this.topparent,
			currowner : this.owner,
		});
		this.stPointUIPanePlugin = plugin.data("startPointEditPanel");
	};

	PropertySheet.prototype.initEndPointEditPane = function(parent) {
		var plugin = $(parent).endPointEditPanel({
			id : "ed010",
			parent : this,
			entity : this.entity,
			topparent : this.topparent,
			currowner : this.owner,
		});
		this.edPointUIPanePlugin = plugin.data("endPointEditPanel");
	};

	PropertySheet.prototype.initNavigationRuleEditPane = function(parent) {
		var plugin = $(parent).navigationRuleEditPanel({
			id : "t002",
			parent : this,
			entity : this.entity,
			topparent : this.topparent,
			currowner : this.owner,
		});
		this.navigationRulePlugin = plugin.data("navigationRuleEditPanel");
	};

	PropertySheet.prototype.initAssignmentEditPane = function(parent) {
		var plugin = $(parent).assignmentEditPanel({
			id : "a003",
			parent : this,
			entity : this.entity,
			topparent : this.topparent,
			currowner : this.owner,
		});
		this.assignmentRditPlugin = plugin.data("assignmentEditPanel");
	};

	PropertySheet.prototype.initWaitingTaskEditPane = function(parent) {
		var plugin = $(parent).waitingTaskEditPanel({
			id : "w004",
			parent : this,
			entity : this.entity,
			topparent : this.topparent,
			currowner : this.owner,
		});
		this.waittaskRditPlugin = plugin.data("waitingTaskEditPanel");
	};

	PropertySheet.prototype.initManualTaskEditPane = function(parent) {
		var plugin = $(parent).manualTaskEditPanel({
			id : "m005",
			parent : this,
			entity : this.entity,
			topparent : this.topparent,
			currowner : this.owner,
		});
		this.manualTaskRditPlugin = plugin.data("manualTaskEditPanel");
	};

	PropertySheet.prototype.initSystemTaskEditPane = function(parent) {
		var plugin = $(parent).systemTaskEditPanel({
			id : "s006",
			parent : this,
			entity : this.entity,
			topparent : this.topparent,
			currowner : this.owner,
		});
		this.systemTaskRditPlugin = plugin.data("systemTaskEditPanel");
	};

	PropertySheet.prototype.initSubprocessEditPane = function(parent) {
		var plugin = $(parent).subprocessSettingEditPanel({
			id : "su007",
			parent : this,
			entity : this.entity,
			topparent : this.topparent,
			currowner : this.owner,
		});
		this.subprocessTaskRditPlugin = plugin
				.data("subprocessSettingEditPanel");
	};

	PropertySheet.prototype.initBlankTaskEditPane = function(parent) {
		var plugin = $(parent).blankEditPanel({
			id : "st008",
			parent : this,
			entity : this.entity,
			topparent : this.topparent,
			currowner : this.owner,
		});
		this.blankTaskRditPlugin = plugin.data("blankEditPanel");
	};

	PropertySheet.prototype.initSMSSendingTaskEditPane = function(parent) {
		var plugin = $(parent).smsSendingTaskEditPanel({
			id : "sms011",
			parent : this,
			entity : this.entity,
			topparent : this.topparent,
			currowner : this.owner,
		});
		this.smsSendingTaskEditPanePlugin = plugin
				.data("smsSendingTaskEditPanel");
	};

	PropertySheet.prototype.initEmailSendingTaskEditPane = function(parent) {
		var plugin = $(parent).emailSendingTaskEditPanel({
			id : "eml012",
			parent : this,
			entity : this.entity,
			topparent : this.topparent,
			currowner : this.owner,
		});
		this.emailSendingTaskEditPanePlugin = plugin
				.data("emailSendingTaskEditPanel");
	};

	// 新闻列表显示
	PropertySheet.prototype.initNewsEditorPane = function(parent) {
		var plugin = $(parent).newsPropsPanel({
			id : "news013",
			parent : this,
			entity : this.entity,
			topparent : this.topparent,
			ownerId : this.owner,
		});
		this.newsViewPanePlugin = plugin.data("newsPropsPanel");
	};

	PropertySheet.prototype.intiNoticeViewPane = function(parent) {
		var plugin = $(parent).noticeViewPane({
			id : "notice014",
			parent : this,
			entity : this.entity,
			topparent : this.topparent,
			currowner : this.owner,
		});
		this.noticeViewPlugin = plugin.data("noticeViewPane");
	};

	PropertySheet.prototype.initAndroidAppPropEditPane = function(parent) {
		var plugin = $(parent).androidAppPropEditPanel({
			id : "wap005",
			parent : this,
			entity : this.entity,
			topparent : this.topparent,
		});
		this.amAndroidAppPlugin = plugin.data("androidAppPropEditPanel");
	};

	PropertySheet.prototype.getCurrTabIndex = function(obj) {
		if (obj instanceof StartPoint) {
			if (this.stPointUIPanePlugin != null) {
				return this.stPointUIPanePlugin.currtabindex;
			}
		} else if (obj instanceof EndPoint) {
			if (this.edPointUIPanePlugin != null) {
				return this.edPointUIPanePlugin.currtabindex;
			}
		} else if (obj instanceof ManualTask) {
			if (this.manualTaskRditPlugin != null) {
				return this.manualTaskRditPlugin.currtabindex;
			}
		} else if (obj instanceof SMSSendingTask) {
			if (this.smsSendingTaskEditPanePlugin != null) {
				return this.smsSendingTaskEditPanePlugin.currtabindex;
			}
		} else if (obj instanceof EmailSendingTask) {
			if (this.emailSendingTaskEditPanePlugin != null) {
				return this.emailSendingTaskEditPanePlugin.currtabindex;
			}
		}
		return 0;
	};

  PropertySheet.prototype.enableRefreshButton = function () {
    // this.refreshButton.removeAttribute("disabled");
  };

  PropertySheet.prototype.disabledRefreshButton = function () {
    // this.refreshButton.setAttribute("disabled", "");
  };


  PropertySheet.prototype.enableAddButton = function() {
		this.addButton.removeAttribute("disabled");
	};

	PropertySheet.prototype.disabledAddButton = function() {
		this.addButton.setAttribute("disabled", "");
	};

	PropertySheet.prototype.enableModifyButton = function() {
		this.modifyButton.removeAttribute("disabled");
	};

	PropertySheet.prototype.disabledModifyButton = function() {
		this.modifyButton.setAttribute("disabled", "");
	};

	PropertySheet.prototype.enableRemoveButton = function() {
		this.removeButton.removeAttribute("disabled");
	};

	PropertySheet.prototype.disabledRemoveButton = function() {
		this.removeButton.setAttribute("disabled", "");
	};

	$.fn[pluginName] = function(options) {
		return this.each(function() {
			if (!$.data(this, pluginName)) {
				$.data(this, pluginName, new PropertySheet(this, options));
			} else if ($.isFunction(Plugin.prototype[options])) {
				$.data(this, pluginName)[options]();
			}
		});
	};

})(jQuery, window, document);
