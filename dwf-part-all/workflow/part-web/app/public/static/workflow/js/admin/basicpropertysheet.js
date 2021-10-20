/**
 *
 */

;
(function ($, window, document, undefined) {
    var pluginName = "basicPropertySheet";
    var defaults = {
        prop: "",
        topparent: "",
    };

    var BasicPropertySheet = function (element, options) {
        this.element = element;
        this.options = $.extend({
            prop: "",
            topparent: "",
            pid: ""
        }, defaults, options);
        this._defaults = defaults;
        this._name = pluginName;
        this.topparent;
        this.propertysheet;
        this.entity = null;
        this.owner = null;
        this.init(options);
        this.clearSheet();
        this.initSheet();
    };

    BasicPropertySheet.prototype.init = function (options) {
        this.topparent = options.topparent;
        var panelDiv = document.createElement("DIV");
        this.element.appendChild(panelDiv);
        panelDiv.className = "panel panel-default";

        var header = document.createElement("DIV");
        panelDiv.appendChild(header);
        header.className = "panel-heading self-panel";
        header.innerHTML = "基本属性";

        var tableDiv = document.createElement("DIV");
        panelDiv.appendChild(tableDiv);
        tableDiv.className = "table-responsive";
        tableDiv.style.overflowY = "auto";
        tableDiv.style.overflowX = "auto";
        tableDiv.id = "basicpropertysheet_"+options.pid;

        this.propertysheet = document.createElement("table");
        tableDiv.appendChild(this.propertysheet);
        this.propertysheet.id = "propertysheet";
        this.propertysheet.className = "table table-striped table-hover";

        // // general message dialog plugin
        // var p3 = $(options.topparent).messageDialog({
        // id : "016",
        // title : "云BPM - 提示",
        // parent : this,
        // });
        // this.messageDialog = p3.data("messageDialog");
        //
        // var plugin1 = $(this.propertysheet).textCellEditor({
        // parent : this,
        // msg : this.messageDialog,
        // });
        // this.editor1 = plugin1.data("textCellEditor");
        //
        // var plugin2 = $(this.propertysheet).textareaCellEditor({
        // parent : this,
        // msg : this.messageDialog,
        // });
        // this.editor2 = plugin2.data("textareaCellEditor");
        //
        // var plugin3 = $(this.propertysheet).processTypeSelectCellEditor({
        // parent : this,
        // msg : this.messageDialog,
        // });
        // this.editor3 = plugin3.data("processTypeSelectCellEditor");
        //
        // var plugin4 = $(this.propertysheet).accessTypeSelectCellEditor({
        // parent : this,
        // msg : this.messageDialog,
        // });
        // this.editor4 = plugin4.data("accessTypeSelectCellEditor");
        //
        // var plugin5 = $(this.propertysheet).yesnoCellEditor({
        // parent : this,
        // msg : this.messageDialog,
        // });
        // this.editor5 = plugin5.data("yesnoCellEditor");
        //
        // var plugin6 = $(this.propertysheet).workflowTypeSelectCellEditor({
        // parent : this,
        // msg : this.messageDialog,
        // });
        // this.editor6 = plugin6.data("priceCellEditor");
        //
        // var plugin7 = $(this.propertysheet).priceCellEditor({
        // parent : this,
        // msg : this.messageDialog,
        // });
        // this.editor7 = plugin7.data("priceCellEditor");
        //
        // var plugin8 = $(this.propertysheet).processNameCellEditor({
        // parent : this,
        // msg : this.messageDialog,
        // });
        // this.editor8 = plugin8.data("processNameCellEditor");
        //
        // var plugin9 = $(this.propertysheet).trialPeriodSelectCellEditor({
        // parent : this,
        // msg : this.messageDialog,
        // });
        // this.editor9 = plugin9.data("trialPeriodSelectCellEditor");
    };

    BasicPropertySheet.prototype.initSheet = function (options) {
        for (i = 0; i < 20; i++) {
            var row = this.propertysheet.insertRow(-1);
            var cell1 = row.insertCell(0);
            cell1.innerHTML = "&nbsp;";
        }
    };

    BasicPropertySheet.prototype.clearSheet = function (options) {
        $(this.propertysheet).children().remove();
    };

    // obj is process or task or transition or released process
    // owner is current owner of task or transition
    BasicPropertySheet.prototype.setSheet = function (obj, owner) {
        console.log("obj",obj);
        console.log(obj instanceof WfProcessInstance);
        console.log("owner",owner);
        this.entity = obj;
        this.owner = owner;
        this.clearSheet();
        var sheet = this.propertysheet;

        if (obj instanceof WfProcessInstance) {
            for (x in obj) {
                if (x == "id" || x == "name" || x == "code"
                    || x == "workflowType" || x == "processType"
                    || x == "lastupdate"|| x == "author"
                    || x == "keywords"
                    //  || x == "parent" || x == "owner"
                    || x == "description" || x == "version"
                    || x == "releaser"

                    // || x == "releaseStatement"
                    || x == "releaseDate"|| x == "releaseDate"
                    //|| x == "deprecated"
                    // || x == "likeCounting" || x == "totalUseCounting"
                    // || x == "successCounting" || x == "terminationCounting"
                    // || x == "totalDownloading"
                    || x == "wfProcessId" || x == "status"
                    || x == "launchUserId" || x == "launchUser"
                    || x == "bindEnClassName" || x == "enClassInstanceId"

                    || x == "launchTime" || x == "startTime"
                    || x == "endTime" || x == "suspensionTime"
                    || x == "updateTime" || x == "terminationTime"
                    || x == "ipv4" || x == "ipv6" || x == "serverIp"

                    ) {
                    var editable = "-1";
                    var keyname = "";
                    var isnull = "y";
                    if (x == "id") {
                        keyname = "流程实例标识";
                        isnull = "n";
                    } else if (x == "code") {
                        keyname = "流程编码";
                        isnull = "n";
                    } else if (x == "name") {
                        keyname = "流程实例名称";
                        isnull = "n";
                    } else if(x=="bindEnClassName"){
                        keyname = "绑定实体类";
                        editable = "-1";
                        isnull = "n";
                    } else if(x=="enClassInstanceId"){
                        keyname = "绑定对象ID";
                        editable = "-1";
                        isnull = "n";
                    } else if (x == "processType") {
                        keyname = "业务类型";
                        isnull = "n";
                    } else if (x == "workflowType") {
                        keyname = "工作流类型";
                        isnull = "n";

                    } else if (x == "description") {
                        keyname = "流程简介";
                        isnull = "y";
                    } else if (x == "keywords") {
                        keyname = "关键字";
                        isnull = "n";
                    } else if (x == "author") {
                        keyname = "过程设计者";
                        isnull = "n";

                    } else if (x == "lastupdate") {
                        keyname = "最后更新";
                        isnull = "n";
                    // } else if (x == "parent") {
                    //     keyname = "文件夹";
                    //     isnull = "n";
                    // } else if (x == "owner") {
                    //     keyname = "单位";
                    //     isnull = "n";
                    } else if (x == "version") {
                        keyname = "版本";
                        editable = "nme";
                        isnull = "n";
                    } else if (x == "releaser") {
                        keyname = "发布人";
                        editable = "nme";
                        isnull = "n";
                    // } else if (x == "releaseStatement") {
                    //     keyname = "发布声明";
                    //     editable = "state";
                    //     isnull = "n";
                    } else if (x == "releaseDate") {
                        keyname = "发布日期";
                        editable = "-1";
                        isnull = "n";

                    } else if (x == "wfProcessId") {
                        keyname = "过程定义ID";
                        editable = "-1";
                        isnull = "n";

                    } else if (x == "launchUserId") {
                        keyname = "发起人ID";
                        editable = "-1";
                        isnull = "n";
                    } else if (x == "launchUser") {
                        keyname = "发起人";
                        editable = "-1";
                        isnull = "n";
                    // } else if (x == "staffLaunched") {
                    //     keyname = "是否内部发起";
                    //     editable = "-1";
                    //     isnull = "n";
                    } else if (x == "status") {
                        keyname = "当前状态";
                        editable = "-1";
                        isnull = "n";
                    } else if (x == "launchTime") {
                        keyname = "发起时间";
                        editable = "-1";
                        isnull = "n";
                    } else if (x == "startTime") {
                        keyname = "开始时间";
                        editable = "-1";
                        isnull = "n";
                    } else if (x == "suspensionTime") {
                        keyname = "挂起时间";
                        editable = "-1";
                        isnull = "n";
                    } else if (x == "updateTime") {
                        keyname = "更新时间";
                        editable = "-1";
                        isnull = "n";
                    } else if (x == "terminationTime") {
                        keyname = "中止时间";
                        editable = "-1";
                        isnull = "n";
                    } else if (x == "endTime") {
                        keyname = "结束时间";
                        editable = "-1";
                        isnull = "n";
                    } else if (x == "ipv4") {
                        keyname = "发起IPv4";
                        editable = "-1";
                        isnull = "n";
                    } else if (x == "ipv6") {
                        keyname = "发起IPv6";
                        editable = "-1";
                        isnull = "n";
                    } else if (x == "serverIp") {
                        keyname = "服务器IP";
                        editable = "-1";
                        isnull = "n";
                    }
                    if (x == "name" || x == "author" || x == "keywords"
                        || x == "description" ||x == "enClassInstanceId") {
                        this.setPropertyCell(sheet, x, keyname,
                            obj[x] != null ? Utils.parse(obj[x]) : "", editable, isnull);


                    } else if (x == "processType") {
                        this.setPropertyCell(sheet, x, keyname, processtype[obj[x]], editable, isnull);
                    } else if (x == "workflowType") {
                        this.setPropertyCell(sheet, x, keyname, workflowtype[obj[x]], editable, isnull);
                    } else if (x == "bindEnClassName") {
                        var cuEnClassName = obj["bindEnClassName"];
                        if(enClass){
                            this.setPropertyCell(sheet, x, keyname, enClass[cuEnClassName] != null ? Utils.parse(cuEnClassName) : "", editable, isnull);
                        }else{
                            this.setPropertyCell(sheet, x, keyname, cuEnClassName != null ? Utils.parse(cuEnClassName) : "", editable, isnull);
                        }


                    } else if (x == "status") {
                        this.setPropertyCell(sheet, x, keyname, processstatus[obj[x]], editable, isnull);
                    // } else if (x == "deprecated") {
                        // 	this.setPropertyCell(sheet, x, keyname, onlinestatus[obj[x]], editable, isnull);
                    } else if (x == "launchTime" || x == "startTime"
                        || x == "suspensionTime" || x == "updateTime"
                        || x == "terminationTime" || x == "endTime") {
                        this.setPropertyCell(sheet, x, keyname,
                            ((obj[x] == -1 || obj[x] == 0)? "" : Utils.parseDateTime(obj[x])), editable, isnull);
                    // } else if (x == "parent") {
                    //     var p = $('#treeview').jstree('get_node', obj[x]);
                    //     this.setPropertyCell(sheet, x, keyname, p.text, editable, isnull);
                    // } else if (x == "owner") {
                    //     var p = $('#treeview').jstree('get_node', obj[x]);
                    //     this.setPropertyCell(sheet, x, keyname, p.text, editable, isnull);
                    } else {
                        this.setPropertyCell(sheet, x, keyname, obj[x], editable, isnull);
                    }
                }
            }
        }
        else if (obj instanceof StartPointInstance) {
            for (x in obj) {
                if (x == "id" || x == "name"
                    || x == "isParallelOutput" || x == "description"
                    || x == "lastupdate" || x == "status"
                    || x == "startTime" || x == "endTime"
                    || x == "definitionId") {
                    var editable = "-1";
                    var keyname = "";
                    var isnull = "y";
                    if (x == "id") {
                        keyname = "任务实例标识";
                        editable = "-1";
                        isnull = "n";
                    } else if (x == "name") {
                        keyname = "任务实例名称";
                        editable = "-1";
                        isnull = "n";
                    } else if (x == "isParallelOutput") {
                        keyname = "并行输出";
                        editable = "-1";
                        isnull = "n";
                    } else if (x == "description") {
                        keyname = "任务简介";
                        editable = "-1";
                        isnull = "y";
                    } else if (x == "lastupdate") {
                        keyname = "最后更新";
                        editable = "-1";
                        isnull = "n";
                    } else if (x == "status") {
                        keyname = "当前状态";
                        editable = "-1";
                        isnull = "n";
                    } else if (x == "startTime") {
                        keyname = "开始时间";
                        editable = "-1";
                        isnull = "n";
                    } else if (x == "endTime") {
                        keyname = "结束时间";
                        editable = "-1";
                        isnull = "n";
                    } else if (x == "definitionId") {
                        keyname = "开始点ID";
                        editable = "-1";
                        isnull = "n";
                    }
                    if (x == "name" || x == "description") {
                        this.setPropertyCell(sheet, x, keyname,
                            obj[x] != null ? Utils.parse(obj[x]) : "",
                            editable, isnull);
                    } else if (x == "isParallelOutput") {
                        this.setPropertyCell(sheet, x, keyname, yesno[obj[x]],
                            editable, isnull);
                    } else if (x == "id" || x == "lastupdate") {
                        this.setPropertyCell(sheet, x, keyname, obj[x],
                            editable, isnull);
                    } else if (x == "status") {
                        this.setPropertyCell(sheet, x, keyname, taskstatus[obj[x]],
                            editable, isnull);
                    } else if (x == "startTime" || x == "endTime") {
                        this.setPropertyCell(sheet, x, keyname,
                            (obj[x] == -1 ? "" : Utils.parseDateTime(obj[x])), editable, isnull);
                    } else if (x == "definitionId") {
                        this.setPropertyCell(sheet, x, keyname, obj[x],
                            editable, isnull);
                    } else {
                        this.setPropertyCell(sheet, x, keyname, obj[x],
                            editable, isnull);
                    }
                }
            }
            this.setPropertyCell(sheet, "order", "连接执行顺序", " ");
            var row = sheet.insertRow(-1);
            var cell1 = row.insertCell(0);
            cell1.colSpan = "2";
            cell1.style.padding = 0;
            cell1.whiteSpace = "nowrap";
            var cellx = $(cell1).routeOrderEditPanel({
                id: "RO0091",
                task: obj,
                currOwner: this.owner,
            });
        }
        else if (obj instanceof EndPointInstance) {
            for (x in obj) {
                if (x == "id" || x == "name" || x == "isParallelInput"
                    || x == "description"
                    || x == "lastupdate" || x == "status"
                    || x == "startTime" || x == "endTime"
                    || x == "definitionId") {
                    var editable = "-1";
                    var keyname = "";
                    var isnull = "y";
                    if (x == "id") {
                        keyname = "任务实例标识";
                        editable = "-1";
                        isnull = "n";
                    } else if (x == "name") {
                        keyname = "任务实例名称";
                        editable = "-1";
                        isnull = "n";
                    } else if (x == "isParallelInput") {
                        keyname = "并行输入";
                        editable = "-1";//"pin";
                        isnull = "n";
                    } else if (x == "isParallelOutput") {
                        keyname = "并行输出";
                        editable = "-1";//"pout";
                        isnull = "n";
                    } else if (x == "description") {
                        keyname = "任务简介";
                        editable = "-1";//"desc";
                        isnull = "y";
                    } else if (x == "lastupdate") {
                        keyname = "最后更新";
                        editable = "-1";
                        isnull = "n";
                    } else if (x == "status") {
                        keyname = "当前状态";
                        editable = "-1";
                        isnull = "n";
                    } else if (x == "startTime") {
                        keyname = "开始时间";
                        editable = "-1";
                        isnull = "n";
                    } else if (x == "endTime") {
                        keyname = "结束时间";
                        editable = "-1";
                        isnull = "n";
                    } else if (x == "definitionId") {
                        keyname = "结束点ID";
                        editable = "-1";
                        isnull = "n";
                    }
                    if (x == "name" || x == "description") {
                        this.setPropertyCell(sheet, x, keyname,
                            obj[x] != null ? Utils.parse(obj[x]) : "",
                            editable, isnull);
                    } else if (x == "isParallelInput") {
                        this.setPropertyCell(sheet, x, keyname, yesno[obj[x]],
                            editable, isnull);
                    } else if (x == "id" || x == "lastupdate") {
                        this.setPropertyCell(sheet, x, keyname, obj[x],
                            editable, isnull);
                    } else if (x == "status") {
                        this.setPropertyCell(sheet, x, keyname, taskstatus[obj[x]],
                            editable, isnull);
                    } else if (x == "startTime" || x == "endTime") {
                        this.setPropertyCell(sheet, x, keyname,
                            (obj[x] == -1 ? "" : Utils.parseDateTime(obj[x])), editable, isnull);
                    } else if (x == "definitionId") {
                        this.setPropertyCell(sheet, x, keyname, obj[x],
                            editable, isnull);
                    } else {
                        this.setPropertyCell(sheet, x, keyname, obj[x],
                            editable, isnull);
                    }
                }
            }
            this.setPropertyCell(sheet, "order", "连接执行顺序", " ");
            var row = sheet.insertRow(-1);
            var cell1 = row.insertCell(0);
            cell1.colSpan = "2";
            cell1.style.padding = 0;
            cell1.whiteSpace = "nowrap";
            var cellx = $(cell1).routeOrderEditPanel({
                id: "RO0092",
                task: obj,
                currOwner: this.owner,
            });
        }
        else if (obj instanceof AssignTaskInstance) {
            for (x in obj) {
                if (x == "id" || x == "name" || x == "isParallelInput"
                    || x == "isParallelOutput" || x == "description"
                    || x == "lastupdate" || x == "status"
                    || x == "startTime" || x == "endTime"
                    || x == "definitionId") {
                    var editable = "-1";
                    var keyname = "";
                    var isnull = "y";
                    if (x == "id") {
                        keyname = "任务实例标识";
                        editable = "-1";
                        isnull = "n";
                    } else if (x == "name") {
                        keyname = "任务实例名称";
                            editable = "-1";//"nme";
                        isnull = "n";
                    } else if (x == "isParallelInput") {
                        keyname = "并行输入";
                        editable = "-1";//"pin";
                        isnull = "n";
                    } else if (x == "isParallelOutput") {
                        keyname = "并行输出";
                        editable = "-1";//"pout";
                        isnull = "n";
                    } else if (x == "description") {
                        keyname = "任务简介";
                        editable = "-1";//"desc";
                        isnull = "y";
                    } else if (x == "lastupdate") {
                        keyname = "最后更新";
                        editable = "-1";
                        isnull = "n";
                    } else if (x == "status") {
                        keyname = "当前状态";
                        editable = "-1";
                        isnull = "n";
                    } else if (x == "startTime") {
                        keyname = "开始时间";
                        editable = "-1";
                        isnull = "n";
                    } else if (x == "endTime") {
                        keyname = "结束时间";
                        editable = "-1";
                        isnull = "n";
                    } else if (x == "definitionId") {
                        keyname = "赋值任务ID";
                        editable = "-1"
                    }
                    if (x == "name" || x == "description") {
                        this.setPropertyCell(sheet, x, keyname,
                            obj[x] != null ? Utils.parse(obj[x]) : "",
                            editable, isnull);
                    } else if (x == "isParallelInput"
                        || x == "isParallelOutput") {
                        this.setPropertyCell(sheet, x, keyname, yesno[obj[x]],
                            editable, isnull);
                    } else if (x == "id" || x == "lastupdate") {
                        this.setPropertyCell(sheet, x, keyname, obj[x],
                            editable, isnull);
                    } else if (x == "status") {
                        this.setPropertyCell(sheet, x, keyname, taskstatus[obj[x]],
                            editable, isnull);
                    } else if (x == "startTime" || x == "endTime") {
                        this.setPropertyCell(sheet, x, keyname,
                            (obj[x] == -1 ? "" : Utils.parseDateTime(obj[x])), editable, isnull);
                    } else if (x == "definitionId") {
                        this.setPropertyCell(sheet, x, keyname, obj[x],
                            editable, isnull);
                    } else {
                        this.setPropertyCell(sheet, x, keyname, obj[x],
                            editable, isnull);
                    }
                }
            }
            this.setPropertyCell(sheet, "order", "连接执行顺序", " ");
            var row = sheet.insertRow(-1);
            var cell1 = row.insertCell(0);
            cell1.colSpan = "2";
            cell1.style.padding = 0;
            cell1.whiteSpace = "nowrap";
            var cellx = $(cell1).routeOrderEditPanel({
                id: "RO0093",
                task: obj,
                currOwner: this.owner,
            });
        }
        else if (obj instanceof EmailReceivingTaskInstance) {
            for (x in obj) {
                if (x == "id" || x == "name" || x == "isParallelInput"
                    || x == "isParallelOutput" || x == "description"
                    || x == "lastupdate" || x == "status"
                    || x == "startTime" || x == "endTime"
                    || x == "definitionId") {
                    var editable = "-1";
                    var keyname = "";
                    var isnull = "y";
                    if (x == "id") {
                        keyname = "任务实例标识";
                        editable = "-1";
                        isnull = "n";
                    } else if (x == "name") {
                        keyname = "任务实例名称";
                        editable = "-1";//"nme";
                        isnull = "n";
                    } else if (x == "isParallelInput") {
                        keyname = "并行输入";
                        editable = "-1";//"pin";
                        isnull = "n";
                    } else if (x == "isParallelOutput") {
                        keyname = "并行输出";
                        editable = "-1";//"pout";
                        isnull = "n";
                    } else if (x == "description") {
                        keyname = "任务简介";
                        editable = "-1";//"desc";
                        isnull = "y";
                    } else if (x == "lastupdate") {
                        keyname = "最后更新";
                        editable = "-1";
                        isnull = "n";
                    } else if (x == "status") {
                        keyname = "当前状态";
                        editable = "-1";
                        isnull = "n";
                    } else if (x == "startTime") {
                        keyname = "开始时间";
                        editable = "-1";
                        isnull = "n";
                    } else if (x == "endTime") {
                        keyname = "结束时间";
                        editable = "-1";
                        isnull = "n";
                    } else if (x == "definitionId") {
                        keyname = "接收邮件任务ID";
                        editable = "-1"
                    }
                    if (x == "name" || x == "description") {
                        this.setPropertyCell(sheet, x, keyname,
                            obj[x] != null ? Utils.parse(obj[x]) : "",
                            editable, isnull);
                    } else if (x == "isParallelInput"
                        || x == "isParallelOutput") {
                        this.setPropertyCell(sheet, x, keyname, yesno[obj[x]],
                            editable, isnull);
                    } else if (x == "id" || x == "lastupdate") {
                        this.setPropertyCell(sheet, x, keyname, obj[x],
                            editable, isnull);
                    } else if (x == "status") {
                        this.setPropertyCell(sheet, x, keyname, taskstatus[obj[x]],
                            editable, isnull);
                    } else if (x == "startTime" || x == "endTime") {
                        this.setPropertyCell(sheet, x, keyname,
                            (obj[x] == -1 ? "" : Utils.parseDateTime(obj[x])), editable, isnull);
                    } else if (x == "definitionId") {
                        this.setPropertyCell(sheet, x, keyname, obj[x],
                            editable, isnull);
                    } else {
                        this.setPropertyCell(sheet, x, keyname, obj[x],
                            editable, isnull);
                    }
                }
            }
            this.setPropertyCell(sheet, "order", "连接执行顺序", " ");
            var row = sheet.insertRow(-1);
            var cell1 = row.insertCell(0);
            cell1.colSpan = "2";
            cell1.style.padding = 0;
            cell1.whiteSpace = "nowrap";
            var cellx = $(cell1).routeOrderEditPanel({
                id: "RO0094",
                task: obj,
                currOwner: this.owner,
            });

        }
        else if (obj instanceof EmailSendingTaskInstance) {
            for (x in obj) {
                if (x == "id" || x == "name" || x == "isParallelInput"
                    || x == "isParallelOutput" || x == "description"
                    || x == "lastupdate" || x == "status"
                    || x == "startTime" || x == "endTime"
                    || x == "definitionId") {
                    var editable = "-1";
                    var keyname = "";
                    var isnull = "y";
                    if (x == "id") {
                        keyname = "任务实例标识";
                        editable = "-1";
                        isnull = "n";
                    } else if (x == "name") {
                        keyname = "任务实例名称";
                        editable = "-1";//"nme";
                        isnull = "n";
                    } else if (x == "isParallelInput") {
                        keyname = "并行输入";
                        editable = "-1";//"pin";
                        isnull = "n";
                    } else if (x == "isParallelOutput") {
                        keyname = "并行输出";
                        editable = "-1";//"pout";
                        isnull = "n";
                    } else if (x == "description") {
                        keyname = "任务简介";
                        editable = "-1";//"desc";
                        isnull = "y";
                    } else if (x == "lastupdate") {
                        keyname = "最后更新";
                        editable = "-1";
                        isnull = "n";
                    } else if (x == "status") {
                        keyname = "当前状态";
                        editable = "-1";
                        isnull = "n";
                    } else if (x == "startTime") {
                        keyname = "开始时间";
                        editable = "-1";
                        isnull = "n";
                    } else if (x == "endTime") {
                        keyname = "结束时间";
                        editable = "-1";
                        isnull = "n";
                    } else if (x == "definitionId") {
                        keyname = "发送邮件任务ID";
                        editable = "-1"
                    }
                    if (x == "name" || x == "description") {
                        this.setPropertyCell(sheet, x, keyname,
                            obj[x] != null ? Utils.parse(obj[x]) : "",
                            editable, isnull);
                    } else if (x == "isParallelInput"
                        || x == "isParallelOutput") {
                        this.setPropertyCell(sheet, x, keyname, yesno[obj[x]],
                            editable, isnull);
                    } else if (x == "id" || x == "lastupdate") {
                        this.setPropertyCell(sheet, x, keyname, obj[x],
                            editable, isnull);
                    } else if (x == "status") {
                        this.setPropertyCell(sheet, x, keyname, taskstatus[obj[x]],
                            editable, isnull);
                    } else if (x == "startTime" || x == "endTime") {
                        this.setPropertyCell(sheet, x, keyname,
                            (obj[x] == -1 ? "" : Utils.parseDateTime(obj[x])), editable, isnull);
                    } else if (x == "definitionId") {
                        this.setPropertyCell(sheet, x, keyname, obj[x],
                            editable, isnull);
                    } else {
                        this.setPropertyCell(sheet, x, keyname, obj[x],
                            editable, isnull);
                    }
                }
            }
            this.setPropertyCell(sheet, "order", "连接执行顺序", " ");
            var row = sheet.insertRow(-1);
            var cell1 = row.insertCell(0);
            cell1.colSpan = "2";
            cell1.style.padding = 0;
            cell1.whiteSpace = "nowrap";
            var cellx = $(cell1).routeOrderEditPanel({
                id: "RO0095",
                task: obj,
                currOwner: this.owner,
            });

        }
        else if (obj instanceof SMSReceivingTaskInstance) {
            for (x in obj) {
                if (x == "id" || x == "name" || x == "isParallelInput"
                    || x == "isParallelOutput" || x == "description"
                    || x == "lastupdate" || x == "status"
                    || x == "startTime" || x == "endTime"
                    || x == "definitionId") {
                    var editable = "-1";
                    var keyname = "";
                    var isnull = "y";
                    if (x == "id") {
                        keyname = "任务实例标识";
                        editable = "-1";
                        isnull = "n";
                    } else if (x == "name") {
                        keyname = "任务实例名称";
                        editable = "-1";//"nme";
                        isnull = "n";
                    } else if (x == "isParallelInput") {
                        keyname = "并行输入";
                        editable = "-1";//"pin";
                        isnull = "n";
                    } else if (x == "isParallelOutput") {
                        keyname = "并行输出";
                        editable = "-1";//"pout";
                        isnull = "n";
                    } else if (x == "description") {
                        keyname = "任务简介";
                        editable = "-1";//"desc";
                        isnull = "y";
                    } else if (x == "lastupdate") {
                        keyname = "最后更新";
                        editable = "-1";
                        isnull = "n";
                    } else if (x == "status") {
                        keyname = "当前状态";
                        editable = "-1";
                        isnull = "n";
                    } else if (x == "startTime") {
                        keyname = "开始时间";
                        editable = "-1";
                        isnull = "n";
                    } else if (x == "endTime") {
                        keyname = "结束时间";
                        editable = "-1";
                        isnull = "n";
                    } else if (x == "definitionId") {
                        keyname = "接收短信任务ID";
                        editable = "-1"
                    }
                    if (x == "name" || x == "description") {
                        this.setPropertyCell(sheet, x, keyname,
                            obj[x] != null ? Utils.parse(obj[x]) : "",
                            editable, isnull);
                    } else if (x == "isParallelInput"
                        || x == "isParallelOutput") {
                        this.setPropertyCell(sheet, x, keyname, yesno[obj[x]],
                            editable, isnull);
                    } else if (x == "id" || x == "lastupdate") {
                        this.setPropertyCell(sheet, x, keyname, obj[x],
                            editable, isnull);
                    } else if (x == "status") {
                        this.setPropertyCell(sheet, x, keyname, taskstatus[obj[x]],
                            editable, isnull);
                    } else if (x == "startTime" || x == "endTime") {
                        this.setPropertyCell(sheet, x, keyname,
                            (obj[x] == -1 ? "" : Utils.parseDateTime(obj[x])), editable, isnull);
                    } else if (x == "definitionId") {
                        this.setPropertyCell(sheet, x, keyname, obj[x],
                            editable, isnull);
                    } else {
                        this.setPropertyCell(sheet, x, keyname, obj[x],
                            editable, isnull);
                    }
                }
            }
            this.setPropertyCell(sheet, "order", "连接执行顺序", " ");
            var row = sheet.insertRow(-1);
            var cell1 = row.insertCell(0);
            cell1.colSpan = "2";
            cell1.style.padding = 0;
            cell1.whiteSpace = "nowrap";
            var cellx = $(cell1).routeOrderEditPanel({
                id: "RO0096",
                task: obj,
                currOwner: this.owner,
            });

        }
        else if (obj instanceof SMSSendingTaskInstance) {
            for (x in obj) {
                if (x == "id" || x == "name" || x == "isParallelInput"
                    || x == "isParallelOutput" || x == "description"
                    || x == "lastupdate" || x == "status"
                    || x == "startTime" || x == "endTime"
                    || x == "definitionId") {
                    var editable = "-1";
                    var keyname = "";
                    var isnull = "y";
                    if (x == "id") {
                        keyname = "任务实例标识";
                        editable = "-1";
                        isnull = "n";
                    } else if (x == "name") {
                        keyname = "任务实例名称";
                        editable = "-1";//"nme";
                        isnull = "n";
                    } else if (x == "isParallelInput") {
                        keyname = "并行输入";
                        editable = "-1";//"pin";
                        isnull = "n";
                    } else if (x == "isParallelOutput") {
                        keyname = "并行输出";
                        editable = "-1";//"pout";
                        isnull = "n";
                    } else if (x == "description") {
                        keyname = "任务简介";
                        editable = "-1";//"desc";
                        isnull = "y";
                    } else if (x == "lastupdate") {
                        keyname = "最后更新";
                        editable = "-1";
                        isnull = "n";
                    } else if (x == "status") {
                        keyname = "当前状态";
                        editable = "-1";
                        isnull = "n";
                    } else if (x == "startTime") {
                        keyname = "开始时间";
                        editable = "-1";
                        isnull = "n";
                    } else if (x == "endTime") {
                        keyname = "结束时间";
                        editable = "-1";
                        isnull = "n";
                    } else if (x == "definitionId") {
                        keyname = "发送短信任务ID";
                        editable = "-1"
                    }
                    if (x == "name" || x == "description") {
                        this.setPropertyCell(sheet, x, keyname,
                            obj[x] != null ? Utils.parse(obj[x]) : "",
                            editable, isnull);
                    } else if (x == "isParallelInput"
                        || x == "isParallelOutput") {
                        this.setPropertyCell(sheet, x, keyname, yesno[obj[x]],
                            editable, isnull);
                    } else if (x == "id" || x == "lastupdate") {
                        this.setPropertyCell(sheet, x, keyname, obj[x],
                            editable, isnull);
                    } else if (x == "status") {
                        this.setPropertyCell(sheet, x, keyname, taskstatus[obj[x]],
                            editable, isnull);
                    } else if (x == "startTime" || x == "endTime") {
                        this.setPropertyCell(sheet, x, keyname,
                            (obj[x] == -1 ? "" : Utils.parseDateTime(obj[x])), editable, isnull);
                    } else if (x == "definitionId") {
                        this.setPropertyCell(sheet, x, keyname, obj[x],
                            editable, isnull);
                    } else {
                        this.setPropertyCell(sheet, x, keyname, obj[x],
                            editable, isnull);
                    }
                }
            }
            this.setPropertyCell(sheet, "order", "连接执行顺序", " ");
            var row = sheet.insertRow(-1);
            var cell1 = row.insertCell(0);
            cell1.colSpan = "2";
            cell1.style.padding = 0;
            cell1.whiteSpace = "nowrap";
            var cellx = $(cell1).routeOrderEditPanel({
                id: "RO0097",
                task: obj,
                currOwner: this.owner,
            });


        }
        else if (obj instanceof WaitingTaskInstance) {
            for (x in obj) {
                if (x == "id" || x == "name" || x == "isParallelInput"
                    || x == "isParallelOutput" || x == "description"
                    || x == "lastupdate" || x == "status"
                    || x == "startTime" || x == "endTime"
                    || x == "definitionId") {
                    var editable = "-1";
                    var keyname = "";
                    var isnull = "y";
                    if (x == "id") {
                        keyname = "任务实例标识";
                        editable = "-1";
                        isnull = "n";
                    } else if (x == "name") {
                        keyname = "任务实例名称";
                        editable = "-1";//"nme";
                        isnull = "n";
                    } else if (x == "isParallelInput") {
                        keyname = "并行输入";
                        editable = "-1";//"pin";
                        isnull = "n";
                    } else if (x == "isParallelOutput") {
                        keyname = "并行输出";
                        editable = "-1";//"pout";
                        isnull = "n";
                    } else if (x == "description") {
                        keyname = "任务简介";
                        editable = "-1";//"desc";
                        isnull = "y";
                    } else if (x == "lastupdate") {
                        keyname = "最后更新";
                        editable = "-1";
                        isnull = "n";
                    } else if (x == "status") {
                        keyname = "当前状态";
                        editable = "-1";
                        isnull = "n";
                    } else if (x == "startTime") {
                        keyname = "开始时间";
                        editable = "-1";
                        isnull = "n";
                    } else if (x == "endTime") {
                        keyname = "结束时间";
                        editable = "-1";
                        isnull = "n";
                    } else if (x == "definitionId") {
                        keyname = "等待任务ID";
                        editable = "-1"
                    }
                    if (x == "name" || x == "description") {
                        this.setPropertyCell(sheet, x, keyname,
                            obj[x] != null ? Utils.parse(obj[x]) : "",
                            editable, isnull);
                    } else if (x == "isParallelInput"
                        || x == "isParallelOutput") {
                        this.setPropertyCell(sheet, x, keyname, yesno[obj[x]],
                            editable, isnull);
                    } else if (x == "id" || x == "lastupdate") {
                        this.setPropertyCell(sheet, x, keyname, obj[x],
                            editable, isnull);
                    } else if (x == "status") {
                        this.setPropertyCell(sheet, x, keyname, taskstatus[obj[x]],
                            editable, isnull);
                    } else if (x == "startTime" || x == "endTime") {
                        this.setPropertyCell(sheet, x, keyname,
                            (obj[x] == -1 ? "" : Utils.parseDateTime(obj[x])), editable, isnull);
                    } else if (x == "definitionId") {
                        this.setPropertyCell(sheet, x, keyname, obj[x],
                            editable, isnull);
                    } else {
                        this.setPropertyCell(sheet, x, keyname, obj[x],
                            editable, isnull);
                    }
                }
            }
            this.setPropertyCell(sheet, "order", "连接执行顺序", " ");
            var row = sheet.insertRow(-1);
            var cell1 = row.insertCell(0);
            cell1.colSpan = "2";
            cell1.style.padding = 0;
            cell1.whiteSpace = "nowrap";
            var cellx = $(cell1).routeOrderEditPanel({
                id: "RO0098",
                task: obj,
                currOwner: this.owner,
            });
        }
        else if (obj instanceof SystemTaskInstance) {
            for (x in obj) {
                if (x == "id" || x == "name" || x == "isParallelInput"
                    || x == "isParallelOutput" || x == "description"
                    || x == "lastupdate" || x == "status"
                    || x == "startTime" || x == "endTime"
                    || x == "definitionId") {
                    var editable = "-1";
                    var keyname = "";
                    var isnull = "y";
                    if (x == "id") {
                        keyname = "任务实例标识";
                        editable = "-1";
                        isnull = "n";
                    } else if (x == "name") {
                        keyname = "任务实例名称";
                        editable = "-1";//"nme";
                        isnull = "n";
                    } else if (x == "isParallelInput") {
                        keyname = "并行输入";
                        editable = "-1";//"pin";
                        isnull = "n";
                    } else if (x == "isParallelOutput") {
                        keyname = "并行输出";
                        editable = "-1";//"pout";
                        isnull = "n";
                    } else if (x == "description") {
                        keyname = "任务简介";
                        editable = "-1";//"desc";
                        isnull = "y";
                    } else if (x == "lastupdate") {
                        keyname = "最后更新";
                        editable = "-1";
                        isnull = "n";
                    } else if (x == "status") {
                        keyname = "当前状态";
                        editable = "-1";
                        isnull = "n";
                    } else if (x == "startTime") {
                        keyname = "开始时间";
                        editable = "-1";
                        isnull = "n";
                    } else if (x == "endTime") {
                        keyname = "结束时间";
                        editable = "-1";
                        isnull = "n";
                    } else if (x == "definitionId") {
                        keyname = "系统任务ID";
                        editable = "-1"
                    }
                    if (x == "name" || x == "description") {
                        this.setPropertyCell(sheet, x, keyname,
                            obj[x] != null ? Utils.parse(obj[x]) : "",
                            editable, isnull);
                    } else if (x == "isParallelInput"
                        || x == "isParallelOutput") {
                        this.setPropertyCell(sheet, x, keyname, yesno[obj[x]],
                            editable, isnull);
                    } else if (x == "id" || x == "lastupdate") {
                        this.setPropertyCell(sheet, x, keyname, obj[x],
                            editable, isnull);
                    } else if (x == "status") {
                        this.setPropertyCell(sheet, x, keyname, taskstatus[obj[x]],
                            editable, isnull);
                    } else if (x == "startTime" || x == "endTime") {
                        this.setPropertyCell(sheet, x, keyname,
                            (obj[x] == -1 ? "" : Utils.parseDateTime(obj[x])), editable, isnull);
                    } else if (x == "definitionId") {
                        this.setPropertyCell(sheet, x, keyname, obj[x],
                            editable, isnull);
                    } else {
                        this.setPropertyCell(sheet, x, keyname, obj[x],
                            editable, isnull);
                    }
                }
            }
            this.setPropertyCell(sheet, "order", "连接执行顺序", " ");
            var row = sheet.insertRow(-1);
            var cell1 = row.insertCell(0);
            cell1.colSpan = "2";
            cell1.style.padding = 0;
            cell1.whiteSpace = "nowrap";
            var cellx = $(cell1).routeOrderEditPanel({
                id: "RO0099",
                task: obj,
                currOwner: this.owner,
            });
        }
        else if (obj instanceof SubprocessPointInstance) {
            for (x in obj) {
                if (x == "id" || x == "name" || x == "isParallelInput"
                    || x == "isParallelOutput" || x == "description"
                    || x == "lastupdate" || x == "status"
                    || x == "startTime" || x == "endTime"
                    || x == "definitionId" || x == "subprocessInstanceId") {
                    var editable = "-1";
                    var keyname = "";
                    var isnull = "y";
                    if (x == "id") {
                        keyname = "任务实例标识";
                        editable = "-1";
                        isnull = "n";
                    } else if (x == "name") {
                        keyname = "任务实例名称";
                        editable = "-1";//"nme";
                        isnull = "n";
                    } else if (x == "isParallelInput") {
                        keyname = "并行输入";
                        editable = "-1";//"pin";
                        isnull = "n";
                    } else if (x == "isParallelOutput") {
                        keyname = "并行输出";
                        editable = "-1";//"pout";
                        isnull = "n";
                    } else if (x == "description") {
                        keyname = "任务简介";
                        editable = "-1";//"desc";
                        isnull = "y";
                    } else if (x == "lastupdate") {
                        keyname = "最后更新";
                        editable = "-1";
                        isnull = "n";
                    } else if (x == "status") {
                        keyname = "当前状态";
                        editable = "-1";
                        isnull = "n";
                    } else if (x == "startTime") {
                        keyname = "开始时间";
                        editable = "-1";
                        isnull = "n";
                    } else if (x == "endTime") {
                        keyname = "结束时间";
                        editable = "-1";
                        isnull = "n";
                    } else if (x == "definitionId") {
                        keyname = "子过程点ID";
                        editable = "-1"
                    } else if (x == "subprocessInstanceId") {
                        keyname = "子过程实例ID";
                        editable = "-1"
                    }
                    if (x == "name" || x == "description") {
                        this.setPropertyCell(sheet, x, keyname,
                            obj[x] != null ? Utils.parse(obj[x]) : "",
                            editable, isnull);
                    } else if (x == "isParallelInput"
                        || x == "isParallelOutput") {
                        this.setPropertyCell(sheet, x, keyname, yesno[obj[x]],
                            editable, isnull);
                    } else if (x == "id" || x == "lastupdate") {
                        this.setPropertyCell(sheet, x, keyname, obj[x],
                            editable, isnull);
                    } else if (x == "status") {
                        this.setPropertyCell(sheet, x, keyname, taskstatus[obj[x]],
                            editable, isnull);
                    } else if (x == "startTime" || x == "endTime") {
                        this.setPropertyCell(sheet, x, keyname,
                            (obj[x] == -1 ? "" : Utils.parseDateTime(obj[x])), editable, isnull);
                    } else {
                        this.setPropertyCell(sheet, x, keyname, obj[x],
                            editable, isnull);
                    }
                }
            }
            this.setPropertyCell(sheet, "order", "连接执行顺序", " ");
            var row = sheet.insertRow(-1);
            var cell1 = row.insertCell(0);
            cell1.colSpan = "2";
            cell1.style.padding = 0;
            cell1.whiteSpace = "nowrap";
            var cellx = $(cell1).routeOrderEditPanel({
                id: "RO0100",
                task: obj,
                currOwner: this.owner,
            });
        }
        else if (obj instanceof ManualTaskInstance) {
            for (x in obj) {
                if (x == "id" || x == "name" || x == "isParallelInput"
                    || x == "isParallelOutput" || x == "description"
                    || x == "lastupdate" || x == "status"
                    || x == "startTime" || x == "endTime"
                    || x == "definitionId" || x == "subprocessInstanceId"
                    || x == "expiryDateTime" || x == "alarmDateTime"
                    || x == "submitterId" || x == "submitter"
                    || x == "submitterIp" || x == "phase") {
                    var editable = "-1";
                    var keyname = "";
                    var isnull = "y";
                    if (x == "id") {
                        keyname = "任务实例标识";
                        editable = "-1";
                        isnull = "n";
                    } else if (x == "name") {
                        keyname = "任务实例名称";
                        editable = "-1";//"nme";
                        isnull = "n";
                    } else if (x == "isParallelInput") {
                        keyname = "并行输入";
                        editable = "-1";//"pin";
                        isnull = "n";
                    } else if (x == "isParallelOutput") {
                        keyname = "并行输出";
                        editable = "-1";//"pout";
                        isnull = "n";
                    } else if (x == "description") {
                        keyname = "任务简介";
                        editable = "-1";//"desc";
                        isnull = "y";
                    } else if (x == "lastupdate") {
                        keyname = "最后更新";
                        editable = "-1";
                        isnull = "n";
                    } else if (x == "status") {
                        keyname = "当前状态";
                        editable = "-1";
                        isnull = "n";
                    } else if (x == "startTime") {
                        keyname = "开始时间";
                        editable = "-1";
                        isnull = "n";
                    } else if (x == "endTime") {
                        keyname = "结束时间";
                        editable = "-1";
                        isnull = "n";
                    } else if (x == "definitionId") {
                        keyname = "手工任务ID";
                        editable = "-1"
                    } else if (x == "expiryDateTime") {
                        keyname = "过期时间";
                        editable = "-1"
                    } else if (x == "alarmDateTime") {
                        keyname = "提醒时间";
                        editable = "-1"
                    } else if (x == "submitterId") {
                        keyname = "执行人ID";
                        editable = "-1"
                    } else if (x == "submitter") {
                        keyname = "执行人";
                        editable = "-1"
                    } else if (x == "submitterIp") {
                        keyname = "执行人IP";
                        editable = "-1"
                    } else if (x == "phase") {
                        keyname = "执行阶段";
                        editable = "-1"
                    }
                    if (x == "name" || x == "description") {
                        this.setPropertyCell(sheet, x, keyname,
                            obj[x] != null ? Utils.parse(obj[x]) : "",
                            editable, isnull);
                    } else if (x == "isParallelInput" || x == "isParallelOutput") {
                        this.setPropertyCell(sheet, x, keyname, yesno[obj[x]],
                            editable, isnull);
                    } else if (x == "id" || x == "lastupdate") {
                        this.setPropertyCell(sheet, x, keyname, obj[x],
                            editable, isnull);
                    } else if (x == "status") {
                        this.setPropertyCell(sheet, x, keyname, taskstatus[obj[x]],
                            editable, isnull);
                    } else if (x == "phase") {
                        this.setPropertyCell(sheet, x, keyname, mtaskphase[obj[x]],
                            editable, isnull);
                    } else if (x == "startTime" || x == "endTime"
                        || x == "expiryDateTime" || x == "alarmDateTime") {
                        this.setPropertyCell(sheet, x, keyname,
                            (obj[x] == -1 ? "" : Utils.parseDateTime(obj[x])), editable, isnull);
                    } else {
                        this.setPropertyCell(sheet, x, keyname, obj[x],
                            editable, isnull);
                    }
                }
            }
            this.setPropertyCell(sheet, "order", "连接执行顺序", " ");
            var row = sheet.insertRow(-1);
            var cell1 = row.insertCell(0);
            cell1.colSpan = "2";
            cell1.style.padding = 0;
            cell1.whiteSpace = "nowrap";
            var cellx = $(cell1).routeOrderEditPanel({
                id: "RO0100",
                task: obj,
                currOwner: this.owner,
            });

        }
        else if (obj instanceof TransitionInstance) {
            for (x in obj) {
                if (x == "id" || x == "name" || x == "orderNumber"
                    || x == "description" || x == "status") {
                    var editable = "-1";
                    var keyname = "";
                    var isnull = "y";
                    if (x == "id") {
                        keyname = "连接标识";
                        editable = "-1";
                        isnull = "n";
                    } else if (x == "name") {
                        keyname = "连接名称";
                        editable = "-1";//"nme";
                        isnull = "n";
                    } else if (x == "orderNumber") {
                        keyname = "连接执行顺序号";
                        editable = "-1";
                        isnull = "n";
                    } else if (x == "description") {
                        keyname = "备注";
                        editable = "-1";//"desc";
                        isnull = "y";
                    } else if (x == "status") {
                        keyname = "当前状态";
                        editable = "-1";
                        isnull = "y";
                    }
                    if (x == "id" || x == "orderNumber") {
                        this.setPropertyCell(sheet, x, keyname, obj[x],
                            editable, isnull);
                    } else if (x == "name" || x == "description") {
                        this.setPropertyCell(sheet, x, keyname,
                            obj[x] != null ? Utils.parse(obj[x]) : "",
                            editable, isnull);
                    } else if (x == "status") {
                        this.setPropertyCell(sheet, x, keyname,
                            transitionstatus[obj[x]], editable, isnull);
                    } else {
                        this.setPropertyCell(sheet, x, keyname, obj[x],
                            editable, isnull);
                    }
                }
            }

        } else {
            this.initSheet();
        }
    };

    BasicPropertySheet.prototype.handleEvent = function (e) {
        switch (e.type) {
            case "click":
                this.doClick(e);
                break;
            case "dblclick":
                this.doDblClick(e);
                break;
        }
    };

    BasicPropertySheet.prototype.setPropertyCell = function (table, key,
                                                             keydesc, keyvalue, editable, isnull) {
        var row = table.insertRow(-1);
        row.addEventListener("click", this, false);
        row.addEventListener("dblclick", this, false);
        var cell1 = row.insertCell(0);
        var cell2 = row.insertCell(1);
        $(cell1).text(keydesc);
        cell1.setAttribute("nowrap", "true");
        cell1.setAttribute("key", key);
        cell1.setAttribute("type", "h");
        $(cell2).text(keyvalue);
        cell2.setAttribute("key", key);
        cell2.setAttribute("type", editable);
        cell2.setAttribute("null", isnull);
    };

    BasicPropertySheet.prototype.doDblClick = function (evt) {
        if (evt.target.tagName == "TD") {
            this.propertysheet.focus();
            this.startToEdit(evt.target);
        }
    };

    BasicPropertySheet.prototype.startToEdit = function (tag) {
        // var t = tag.getAttribute("type");
        // if (t == "nme") {
        // this.editor1.loadEditor(tag, this.entity, tag.getAttribute("key"),
        // tag.getAttribute("null"), this.owner);
        // } else if (t == "pnme") {
        // this.editor8.loadEditor(tag, this.entity, tag.getAttribute("key"),
        // tag.getAttribute("null"), this.owner);
        // } else if (t == "desc") {
        // this.editor2.loadEditor(tag, this.entity, tag.getAttribute("key"),
        // tag.getAttribute("null"), "流程简介字数不宜超过1000字", this.owner);
        // } else if (t == "kw") {
        // this.editor2.loadEditor(tag, this.entity, tag.getAttribute("key"),
        // tag.getAttribute("null"), "关键字以分号隔开隔开", this.owner);
        // } else if (t == "prctype") {
        // this.editor3.loadEditor(tag, this.entity, tag.getAttribute("key"),
        // tag.getAttribute("null"), this.owner);
        // } else if (t == "wftype") {
        // this.editor6.loadEditor(tag, this.entity, tag.getAttribute("key"),
        // tag.getAttribute("null"), this.owner);
        // } else if (t == "acctype") {
        // this.editor4.loadEditor(tag, this.entity, tag.getAttribute("key"),
        // tag.getAttribute("null"), this.owner);
        // } else if (t == "pin") {
        // this.editor5.loadEditor(tag, this.entity, tag.getAttribute("key"),
        // tag.getAttribute("null"), this.entity.isParallelInput,
        // this.owner);
        // } else if (t == "pout") {
        // this.editor5.loadEditor(tag, this.entity, tag.getAttribute("key"),
        // tag.getAttribute("null"), this.entity.isParallelOutput,
        // this.owner);
        // } else if (t == "dep") {
        // this.editor5.loadEditor(tag, this.entity, tag.getAttribute("key"),
        // tag.getAttribute("null"), this.entity.deprecated,
        // this.owner);
        // } else if (t == "pp") {
        // this.editor7.loadEditor(tag, this.entity, tag.getAttribute("key"),
        // tag.getAttribute("null"), this.owner);
        // } else if (t == "up") {
        // this.editor7.loadEditor(tag, this.entity, tag.getAttribute("key"),
        // tag.getAttribute("null"), this.owner);
        // } else if (t == "state") {
        // this.editor2.loadEditor(tag, this.entity, tag.getAttribute("key"),
        // tag.getAttribute("null"), "发布声明字数不宜超过5000字", this.owner);
        // } else if (t == "tri") {
        // this.editor9.loadEditor(tag, this.entity, tag.getAttribute("key"),
        // tag.getAttribute("null"), this.owner);
        // }
    };

    BasicPropertySheet.prototype.doClick = function (evt) {
        if (evt.target.tagName == "TD") {
            var table = evt.target.parentElement.parentElement;
            this.clearSelection(table);
            evt.target.parentElement.style.background = "#d1d1e0";
        }
    };

    BasicPropertySheet.prototype.clearSelection = function (table) {
        if (table.rows.length > 0) {
            for (i = 0; i < table.rows.length; i++) {
                table.rows[i].style.background = "";
            }
        }
    };

    BasicPropertySheet.prototype.removeHTMLTag = function (str) {
        str = str.replace(/<\/?[^>]*>/g, ''); // 去除HTML tag
        str = str.replace(/[ | ]*\n/g, '\n'); // 去除行尾空白
        str = str.replace(/\n[\s| | ]*\r/g, '\n'); // 去除多余空行
        str = str.replace(/&nbsp;/ig, '');// 去掉&nbsp;
        str = str.replace(/\s/g, ''); // 将空格去掉
        return str;
    };

    $.fn[pluginName] = function (options) {
        return this
            .each(function () {
                if (!$.data(this, pluginName)) {
                    $.data(this, pluginName, new BasicPropertySheet(this,
                        options));
                } else if ($.isFunction(Plugin.prototype[options])) {
                    $.data(this, pluginName)[options]();
                }
            });
    };

})(jQuery, window, document);
