// custom-completion.js
/* eslint-disable no-template-curly-in-string */
//前端.
const getCustomCompletionJS = (monaco) => {
  return [
    {
      label: "closeTab",
      kind: monaco.languages.CompletionItemKind.Function,
      insertText: "closeTab()",
      detail:
        "关闭标签页\n" +
        "eg:this.closeTab();",
    },
    {
      label: "console",
      kind: monaco.languages.CompletionItemKind.Function,
      insertText: "console",
      detail:
        "控制台信息打印\n" +
        "eg:console.log(msg);",
    },
    {
      label: "alert",
      kind: monaco.languages.CompletionItemKind.Function,
      insertText: "alert(msg)",
      detail:
        "弹窗消息，需要手动关闭\n" +
        "eg:alert('确定');",
    },
    {
      label: "closeTab(data)",
      kind: monaco.languages.CompletionItemKind.Function,
      insertText: "closeTab(data)",
      detail: "关闭标签页时，传值给后处理\n" +
        'eg:this.closeTab(data)',
    },
    {
      label: "closeTabById(moduleName-authority,data)",
      kind: monaco.languages.CompletionItemKind.Function,
      insertText: "closeTabById(moduleName-authority,data)",
      detail:
        "关闭指定tab，并传值给后端\n" +
        "@param moduleName-authority: 操作英文名\n" +
        "@param data:传给后处理的值",
    },
    {
      label: "setOption",
      kind: monaco.languages.CompletionItemKind.Function,
      insertText: "setOption(list,callback)",
      detail:
        "动态设置复选框、选择框单选框的值\n" +
        'var list = \n' +
        '[\n' +
        '    {\n' +
        '        value: \'d\',\n' +
        '        label: \'d\'\n' +
        '    }, {\n' +
        '        value: \'e\',\n' +
        '        label: \'e\'\n' +
        '    }, {\n' +
        '        value: \'f\',\n' +
        '        label: \'f\'\n' +
        '    }\n' +
        ']\n' +
        'var checkbox = this.getAddinById("复选框id")\n' +
        'checkbox .setOption(list,() => {\n' +
        'checkbox.setValue(\'xxx\')\n' +
        '})',
    },
    {
      label: "getOption",
      kind: monaco.languages.CompletionItemKind.Function,
      insertText: "getOption()",
      detail:
        "获取单选框、复选框或选择框的选项列表\n" +
        "var checkbox = this.getAddinById(\"复选框id\")\n" +
        'checkbox.getOption()',
    },
    {
      label: "className",
      kind: monaco.languages.CompletionItemKind.Function,
      insertText: "className",
      detail:
        "获取当前类名\n" +
        "this.className",
    },


    {
      label: "env",
      kind: monaco.languages.CompletionItemKind.Module,
      insertText: "env",
      detail:
        "包含了DWF前端的上下文信息\n" +
        "eg:this.env.serverIp;\n",
    },
    {
      label: "getToolsSeries",
      kind: monaco.languages.CompletionItemKind.Function,
      insertText: "getToolsSeries()",
      detail:
        "返回当前工具栏所选全部序列\n" +
        'eg:var chart = this.getAddinById("可视化控件ID");\n' +
        "chart.getToolsSeries();",
    },
    {
      label: "getToolsGridType",
      kind: monaco.languages.CompletionItemKind.Function,
      insertText: "getToolsGridType()",
      detail:
        "返回当前工具栏所选图标排列方式\n" +
        'eg:var chart = this.getAddinById("可视化控件ID");\n' +
        "chart.getToolsGridType();",
    },
    {
      label: "getToolsStartTime",
      kind: monaco.languages.CompletionItemKind.Function,
      insertText: "getToolsStartTime()",
      detail:
        "返回当前工具栏日期起始时间\n" +
        'eg:var chart = this.getAddinById("可视化控件ID");\n' +
        "chart.getToolsStartTime();",
    },
    {
      label: "getToolsEndTime",
      kind: monaco.languages.CompletionItemKind.Function,
      insertText: "getToolsEndTime()",
      detail:
        "返回当前工具栏日期结束时间\n" +
        'eg:var chart = this.getAddinById("可视化控件ID");\n' +
        "chart.getToolsEndTime();",
    },

    {
      label: "forEach",
      kind: monaco.languages.CompletionItemKind.Function,
      insertText: "forEach(obj => { \n" +
	  	" //TODO obj为当前的对象 \n" +
		"})",
      detail:
        "数据遍历\n" +
        "var selectedObjs = this.selectedObjs;\n" +
        "if(selectedObjs  && selectedObjs.length > 0){\n" +
        "selectedObjs.forEach(x => {\n" +
        "   //对选中的数据进行修改\n" +
        '       x.assetState = "已安装";\n' +
        "      // 对修改后的数据进行保存\n" +
        "      this.edit({ className: this.className, obj: x });\n" +
        "    })\n" +
        "}",
    },
    {
      label: "data",
      kind: monaco.languages.CompletionItemKind.Module,
      insertText: "data",
      detail:
        "前处理脚本传参return { data:{\"参数\",\"取值\"}}，为JSON对象\n" +
        "//data对象在表单打开前初始事件中赋值。\n" +
        "var formType= this.data.formType; \n" +
        "this.t_create=false;\n" +
        "this.t_edit=false;\n" +
        "this.t_visit=false;\n" +
        "if(formType == 'create'){\n" +
        "    this.t_create = true ;\n" +
        "}else if(formType == 'edit'){\n" +
        "    this.t_edit = true;\n" +
        "}else if(formType == 'visit'){\n" +
        "    this.t_visit = true;\n" +
        "    this.args.readonly = true;\n" +
        "}",
    },
    {
      label: "selectedObjs",
      kind: monaco.languages.CompletionItemKind.Function,
      insertText: "selectedObjs",
      detail:
        "数组，表单中含有唯一的多对象控件时，通过此数组获得用户选中的对象。\n" +
        "//获取表格,表格的ID目前可通过APP前端获取(在modeler中也可获取)\n" +
        "var allRowDatas = this.selectedObjs;\n" +
        '//查询条件\n' +
        "let query = `and obj.woState = '创建中' `; \n" +
        "//开始后台数据的查询\n" +
        'this.handleQueryData({query:query,targetClass:"WorkOrder",fresh:true}).then(res=>{\n' +
        ' //数据查询\n' +
        "  grid.freshData(query); \n" +
        '  this.msgbox.success("表格已刷新!");\n' +
        "});",
    },
    {
      label: "queryResultAll",
      kind: monaco.languages.CompletionItemKind.Function,
      insertText: "queryResultAll(queryConditon)",
      detail:
        "store中查询\n" +
        "let  queryConditon = {\n" +
        '   targetClass:"Part",\n' +
        "   query:{query:`and obj.id='${this.obj.name}'`},\n" +
        "   //是否从后台强制刷新查询（建议默认值为true）\n" +
        "   fresh: true    \n" +
        "};\n" +
        "//该接口主要在store中进行查询（不查询后台DB）\n" +
        "let queryResult = this.QueryResultAll(queryConditon);\n",
    },
    {
      label: "dwf_modeler_axios",
      kind: monaco.languages.CompletionItemKind.Function,
      insertText: "dwf_modeler_axios()(`/dwf/v1/org/users/${userId}/groups`,param).then(res => { \n" +
		"//TODO res为返回结果，param为JSON对象参数，可为空 \n" +
		"console.log(res);  \n" +
		"});",
      detail:
        "DWF模型restful 服务脚本调用总入口\n" +
        "var curServerIP = this.env.serverIp;\n" +
        "var curUserId = this.user.oid;\n" +
        'this.dwf_modeler_axios("/org/users/${curUserId}/groups");\n',
    },
    {
      label: "dwf_axios.post",
      kind: monaco.languages.CompletionItemKind.Function,
      insertText:
        "dwf_axios.post(url, params).then(function (res) {\n" +
		" //TODO 请求成功，res为返回结果  \n" +
		" console.log(res);  \n" +
        "}).catch(function (error) { \n" +
		" //TODO 请求失败，失败信息 error \n" +
		" console.log(error); \n" +
		"});",
      detail:
        "DWF对象restful 服务脚本调用总入口\n" +
        "let param = [{\n" +
        '    comment: "string",\n' +
        '    displayName: "测试创建用户",\n' +
        '    email: "string@fds.com",\n' +
        '    expiredTime: "2018-11-28T08:57:03.034Z",\n' +
        '    name: "testClientScriptHTTPRequest",\n' +
        '    password: "string"\n' +
        "  }]\n" +
        "let res = this.dwf_axios.post(`org/users-create`,param).then(res => {\n" +
        "    if(res && res.返回值?){\n" +
        '       alert("用户创建成功!");\n' +
        "    }else{\n" +
        '       alert("用户创建失败!");\n' +
        "    }\n" +
        "});",
    },
    {
      label: "dwf_axios.get",
      kind: monaco.languages.CompletionItemKind.Function,
      insertText:
        "dwf_axios.get(url, params).then(function (res) {\n" +
		" //TODO 请求成功，res为返回结果  \n" +
		" console.log(res);  \n" +
        "}).catch(function (error) { \n" +
		" //TODO 请求失败，失败信息 error \n" +
		" console.log(error); \n" +
		"});",
      detail:
        "DWF对象restful 服务脚本调用总入口\n" +
        "let param = [{\n" +
        '    comment: "string",\n' +
        '    displayName: "测试创建用户",\n' +
        '    email: "string@fds.com",\n' +
        '    expiredTime: "2018-11-28T08:57:03.034Z",\n' +
        '    name: "testClientScriptHTTPRequest",\n' +
        '    password: "string"\n' +
        "  }]\n" +
        "let res = this.dwf_axios.get(`org/users-create`,param).then(res => {\n" +
        "    if(res && res.返回值?){\n" +
        '       alert("用户创建成功!");\n' +
        "    }else{\n" +
        '       alert("用户创建失败!");\n' +
        "    }\n" +
        "});",
    },
    {
      label: "queryRelation",
      kind: monaco.languages.CompletionItemKind.Function,
      insertText: "queryRelation(targetClassName).then(res =>{})",
      detail:
        "在回调中处理resMetaObj值\n" +
        "this.queryRelation(targetClassName).then(resMetaObj => {\n" +
        "   //在回调中处理resMetaObj值…\n" +
        "});\n",
    },

    {
      label: "queryEntity",
      kind: monaco.languages.CompletionItemKind.Function,
      insertText: "queryEntity(targetClassName).then(res =>{})",
      detail:
        "获取实体类的元模型信息\n" +
        "this.queryEntity(targetClassName).then(resMetaObj => {\n" +
        "   //在回调中处理resMetaObj值…\n" +
        "});\n",
    },

    {
      label: "handleQueryData",
      kind: monaco.languages.CompletionItemKind.Function,
      insertText: "this.handleQueryData( \n" +
		"{\"targetClass\":\"Part\", \n" +
		" \"query\":\"{query:`and obj.id='${this.obj.name}'`}\", \n" +
		" \"fresh\":true} \n" +
		").then(res=>{ \n" +
		"//TODO res为接口返回结果 \n" +
		"console.log(res); \n" +
		"});",
      detail:
        "后台数据强制刷新/查询\n" +
        "let  queryConditon = {\n" +
        '   targetClass:"Part",\n' +
        "   query:{query:`and obj.id='${this.obj.name}'`},\n" +
        " //是否从后台强制刷新查询（建议默认值为true）\n" +
        "   fresh: true \n" +
        "};\n" +
        "//基于DB进行查询\n" +
        "this.handleQueryData(queryConditon).then(res => {\n" +
        "   //针对res值（查询返回值）直接处理…\n" +
        "});",
    },
    {
      label: "axios",
      kind: monaco.languages.CompletionItemKind.Module,
      insertText:
        "axios.get(url, params)\n" +
        ".then(function (response) {\n" +
        "  console.log(response);\n" +
        "})\n" +
        ".catch(function (error) {\n" +
        "  console.log(error);\n" +
        "});",
      detail:
        "DWF对象restful 服务脚本调用总入口\n" +
        "调用其它通用的restful 服务器时要注意，即不要将ip地址和端口号写死，否则服务器迁移功能就会失效，可以使用“this.env.serverIp”和地址无关来实现动态调用\n" +
        "var curServerIP = this.env.serverIp;\n" +
        "var param = {…};\n" +
        "this.axios.post(`${curServerIP}/[其他接入点路径]`,param).then(rtnOBJ => {\n" +
        "    //回调处理…\n" +
        '    this.msgbox.success("调用成功");\n' +
        "});",
    },

    {
      label: "create",
      kind: monaco.languages.CompletionItemKind.Function,
      insertText: "create(obj, className).then(newRtnObj =>{ \n" +
		"//返回的newRtnObj为后台新增后返回的对象,即包含了oid等属性 \n" +
		"//TODO:针对newRtnObj继续处理… \n" +
		"});",
      detail:
        "创建className类对象obj" +
        "var newObj = {id:’idXXX’,name:’nameXXX’};\n" +
        "var className = ‘Part’;\n" +
        "//新增保存\n" +
        "this.create(newObj, className).then(newRtnObj =>{\n" +
        "//返回的newRtnObj为后台新增后返回的对象,即包含了oid等属性\n" +
        "//todo:针对newRtnObj继续处理…\n" +
        "});",
    },
    {
      label: "create(obj, className, params);",
      kind: monaco.languages.CompletionItemKind.Function,
      insertText: "create(obj, targetClass, params);",
      detail:
        "新增非当前表单类的信息\n" +
        "//绑定刷新按钮\n" +
        'var button = this.getAddinById("Operation10");\n' +
        "//新增关联关系的左右对象标识，左右对象标识即左右类的全局唯一标识\n" +
        "var newObj= {relation_leftOid: 'F8F3D429D7CBB7439C47FF4F162C8087',\n" +
        'relation_rightOid: "B2E382AB7C4DB8479083023ADA4406F0"\n' +
        "};\n" +
        "//指定要进行新增操作的关联类\n" +
        "var targetclass='Recordsheet';\n" +
        "var params = {\n" +
        "//关联关系，这个地方可以改，当关联类和实体类没有关联的时候改成false。左类和右类改成自己需要的\n" +
        "isRelation:true,\n" +
        "relationClass:'Recordsheet',\n" +
        "leftClass:'reader',\n" +
        "rightClass:'books',\n" +
        "}\n" +
        "//新增非当前表单类的信息\n" +
        "this.create(newObj,targetclass,params).then(res => {\n" +
        "debugger\n" +
        "});",
    },
    {
      label: "edit",
      kind: monaco.languages.CompletionItemKind.Function,
      insertText: "edit(obj, className).then(rtnObj =>{ \n" +
		"//返回的rtnObj为后台修改保存后返回的对象 \n" +
		"//TODO:针对rtnObj继续处理… \n" +
		"});",
      detail:
        "编辑className类对象obj\n" +
        "var editObj = {id:’idXXX’,name:’nameXXX’};\n" +
        "var className = ‘Part’;\n" +
        "editObj.id = ‘idYYY’;\n" +
        "this.edit(editObj, className).then(rtnObj =>{\n" +
        "   //返回的rtnObj为后台修改保存后返回的对象\n" +
        "   //todo:针对rtnObj继续处理…\n" +
        "});",
    },
    {
      label: "edit(obj, targetClass, params)",
      kind: monaco.languages.CompletionItemKind.Function,
      insertText: "edit(obj, targetClass, params)",
      detail:
        "更新非当前表单类的信息\n" +
        "//绑定表格，这个里面是控件id，需要修改成表单内需要绑定的表格控件id\n" +
        "var grid = this.getAddinById('Grid3');\n" +
        "//绑定刷新按钮，这个里面是按钮的控件id，需要修改成表单内需要绑定的按钮控件id\n" +
        'var button = this.getAddinById("Operation10");\n' +
        "//获取选中的对象的信息，信息包括oid，属性值等\n" +
        "var selectedObjs = grid.getSelected();\n" +
        "var newObj= {relation_leftOid: '2253891755C1744DA7F01027B19AC8AD',\n" +
        "relation_oid: selectedObjs[0].relation_oid,\n" +
        'relation_rightOid: "176DF470D263ED4286BAC1EAC66BB0D4"\n' +
        "};//获取选中对象的oid\n" +
        "//指定要进行更新操作的关联类\n" +
        "var targetclass='Recordsheet';\n" +
        "var params = {\n" +
        "isRelation:true,\n" +
        "relationClass:'Recordsheet',\n" +
        "leftClass:'reader',\n" +
        "rightClass:'books',\n" +
        " }\n" +
        "//更新关联类的关联关系\n" +
        "this.edit(newObj,targetclass,params).then(res => {\n" +
        "debugger\n" +
        'button.invokeEvent("单击");\n' +
        "});",
    },
    {
      label: "delete",
      kind: monaco.languages.CompletionItemKind.Function,
      insertText: "delete(obj, className).then(rtnObj =>{ \n" +
		"// rtnObj返回值 = true/false,是否删除成功 \n" +
		"//TODO 根据删除结果实现其他逻辑 \n" +
		"});",
      detail:
        "删除className类对象obj\n" +
        "var curObj = {oid:uuid,id:’idXXX’,name:’nameXXX’};\n" +
        "var className = ‘Part’;\n" +
        "this.delete(curObj, className).then(rtnObj =>{\n" +
        "   // rtnObj返回值 = true/false,是否删除成功\n" +
        "   //建议如果返回false，那么返回message错误原因提示信息\n" +
        "});",
    },
    {
      label: "delete(obj,className,{isRelation: true})",
      kind: monaco.languages.CompletionItemKind.Function,
      insertText: "delete(obj,className,{isRelation: true})",
      detail:
        "删除选中的非当前表单类的关联关系\n" +
        "//绑定表格，这个里面是控件id，需要修改成表单内需要绑定的表格控件id\n" +
        "var grid = this.getAddinById('Grid3');\n" +
        "//绑定刷新按钮，这个里面是按钮的控件id，需要修改成表单内需要绑定的按钮控件id\n" +
        'var button = this.getAddinById("Operation10");\n'+
        "//获取选中的对象的信息，信息包括oid，属性值等\n" +
        "var selectedObjs = grid.getSelected();\n" +
        "//指定要删除关联关系的关联类，这个根据自己需要改\n" +
        "var targetClass = 'Recordsheet';\n" +
        "var infoid={\n" +
        "relation_oid: selectedObjs[0].relation_oid\n" +
        "//获取选中对象的oid\n" +
        "}\n" +
        "var params = {\n" +
        '//关联关系，这个地方可以改，当关联类和实体类没有关联的时候改成false\n' +
        "isRelation:true,\n" +
        "}\n" +
        "this.delete(infoid,targetClass,null,params).then(res => {\n" +
        "debugger\n" +
        'button.invokeEvent("单击");',
    },
    {
      label: "validateForm",
      kind: monaco.languages.CompletionItemKind.Function,
      insertText: "validateForm()",
      detail:
        "控件效验\n" +
        "if(this.validateForm()){\n" +
        "console.log('表单验证成功')\n" +
        "}else{\n" +
        "console.log('表单验证失败')\n" +
        "}",
    },
    {
      label: "refresh",
      kind: monaco.languages.CompletionItemKind.Function,
      insertText: "refresh()",
      detail: "页面刷新\n" +
        "eg:this.refresh();",
    },
    {
      label: "updateClass",
      kind: monaco.languages.CompletionItemKind.Function,
      insertText: "updateClass(className)",
      detail:
        "更新指定类的表单模板下拉列表\n" +
        "//要获取表单模板的类名称（实体类或关联类）\n" +
        'var targetClass = "Part";\n' +
        "//多对象控件组中的'表单点选器'控件【内置的控件】\n" +
        'var addinElement = this.GetAddinById("表单点选器控件ID");\n' +
        "//控件updateClass方法：刷新类的表单下拉列表\n" +
        "addinElement.updateClass(targetClass);",
    },
    {
      label: "createObj",
      kind: monaco.languages.CompletionItemKind.Function,
      insertText: "createObj()",
      detail: "创建前端内存对象\n" +
        "var obj = this.cfreatObj();",
    },
    {
      label: "spinShow",
      kind: monaco.languages.CompletionItemKind.Function,
      insertText: "spinShow()",
      detail:
        "显示窗口遮罩（等待）" +
        "this.spinShow(); \n" +
        "setTimeout(() => {\n" +
        "        this.spinHide();\n" +
        "        this.msgbox.error('取消遮罩');\n" +
        "      }, 2000)\n" +
        "\n",
    },
    {
      label: "spinHide",
      kind: monaco.languages.CompletionItemKind.Function,
      insertText: "spinHide()",
      detail:
        "取消遮罩窗口遮罩（等待）" +
        "this.spinShow(); \n" +
        "setTimeout(() => {\n" +
        "        this.spinHide();\n" +
        "        this.msgbox.error('取消遮罩');\n" +
        "      }, 2000)\n" +
        "\n",
    },
    {
      label: "returnSync",
      kind: monaco.languages.CompletionItemKind.Function,
      insertText: "returnSync({ \n" +
			"obj: res.data \n" +
		"})",
      detail:
        "用于保证异步前处理脚本处理之后再打开弹窗\n" +
        "//创建前端内存对象\n" +
        "let obj = this.createObj(this.className).then((res) => {\n" +
        '     console.log("新增内存对象oid=");\n' +
        "\n" +
        "     console.log(obj)\n" +
        "     debugger\n" +
        "     this.returnSync({\n" +
        "            obj: res.data\n" +
        "      })\n" +
        "})\n" +
        'console.log("新增内存对象oid=" + obj.oid);\n' +
        "return {sync:true}\n" +
        "\n" +
        'let param =[{"woTitle":""}]',
    },
    {
      label: "return",
      kind: monaco.languages.CompletionItemKind.Function,
      insertText: "return {" +
        " obj:{},\n" +
        " query: '',\n" +
        " data:{}\n" +
        "}",
      detail:
        "前处理脚本返回相应信息" +
        '@param obj: 选填，表单对象\n' +
        '@param query: 选填，表单查询条件\n' +
        '@param data: 选填，自定义字段',
    },
    {
      label: "closeDialog",
      kind: monaco.languages.CompletionItemKind.Function,
      insertText: "closeDialog()",
      detail: "关闭弹窗\n" +
        "this.closeDialog()",
    },

    {
      label: "user",
      kind: monaco.languages.CompletionItemKind.Module,
      insertText: "user",
      detail:
        "包含了当前登录用户的基本信息\n" +
        'oid: this.user.oid, // 字符串，当前登录用户在内部的唯一代号\n' +
        'userId: this.user.userId, // 字符串，用户登录DWF的账号，同oid\n' +
        'userName: this.user.userName, // 字符串，用户登录DWF的账号\n' +
        'displayName: this.user.displayName, // 字符串，用户的中文显示名\n' +
        "userGroups: this.user.userGroups[index],// 数组，当前用户所属用户组的数组\n" +
        'token: this.user.token // 字符串，用于访问其他网站的令牌',
    },
    {
      label: "msgbox",
      kind: monaco.languages.CompletionItemKind.Module,
      insertText: 'msgbox',
      detail:
        "包含标准弹框显示\n" +
        'this.msgbox.info("提示信息");\n' +
        'this.msgbox.error("错误信息");\n' +
        'this.msgbox.success("成功信息");\n' +
        'this.msgbox.warning("警告信息");\n' +
        'this.msgbox.loading("加载信息");',
    },
    {
      label: "msgboxDialog",
      kind: monaco.languages.CompletionItemKind.Module,
      insertText: "msgboxDialog.confirm (\"title标题\",\"请确认是否删除?\", \n" +
		"function(){ \n" +
			"console.log(\"确定按钮点击事件！\"); \n" +
		"}, \n" +
		"function(){ \n" +
			"console.log(\"确定按钮点击事件！\"); \n" +
		"});",
      detail:
        "模态弹窗，提示后需手动关闭的msg提示框\n" +
        'this.msgboxDialog.success("title标题","成功的提示");\n' +
        'this.msgboxDialog.info("title标题","一般的提示");\n' +
        'this.msgboxDialog.error(“title标题”,"错误的提示");\n' +
        "//建议补充comfirm确认弹窗(包括确认与取消按钮)\n" +
        'eg:this.msgboxDialog.confirm ("title标题","请确认是否删除?",function(点击确定之后的回调函数), function(点击取消之后的回调函数));',
    },
    {
      label: "getAddinById",
      kind: monaco.languages.CompletionItemKind.Function,
      insertText: "getAddinById(id)",
      detail:
        "表单控件获取定义\n" +
        '其中参数为控件的唯一id\n' +
        "eg:var addinA = this.getAddinById(‘控件A的id’)",
    },
    {
      label: "getTargetAddin",
      kind: monaco.languages.CompletionItemKind.Function,
      insertText: "getTargetAddin()",
      detail: "获取操作绑定的控件\n" +
        "eg:var grid = this.getTargetAddin();",
    },
    {
      label: "obj",
      kind: monaco.languages.CompletionItemKind.Function,
      insertText: "obj",
      detail:
        "对象，表单中含有单个对象的时候，通过此变量访问当前对象。\n" +
        "//其中attrName是属性的英文名称，返回值则为具体对象的取值。\n" +
        "例如：访问设备类（Asset）的设备名称：this.obj.assetName。\n" +
        "关联类属性访问：this.obj.left_[左类属性名]：访问左对象的具体属性。\n" +
        "this.obj.right_[右类属性名]：访问右对象的具体属性。\n" +
        "this.obj.relation_[关联属性名]：访问关联对象的具体属性。",
    },
    {
      label: "formObj",
      kind: monaco.languages.CompletionItemKind.Function,
      insertText: "formObj",
      detail:
        "对象，当卡片内的控件访问根表单对象时，通过此变量访问当前对象。",
    },
    {
      label: "getAllAddin",
      kind: monaco.languages.CompletionItemKind.Function,
      insertText: "getAllAddin()",
      detail: "获取所有控件\n" +
        "var addins = this.getAllAddin();",
    },
    {
      label: "setDisplayType",
      kind: monaco.languages.CompletionItemKind.Function,
      insertText: "setDisplayType(type)",
      detail:
        "设置显示类型\n" +
        'var select = this.GetAddinById("FormSelect1");\n' +
        'var form = this.GetAddinById("FormEngine1");\n' +
        "@param type:create,visit,edit\n"+
        'form.setDisplayType("visit");\n' +
        "var targetClass = select.getClass();\n" +
        "var formName = select.getValue();\n" +
        "form.updateShow(targetClass, formName, { fresh: true });",
    },
    {
      label: "store",
      kind: monaco.languages.CompletionItemKind.Module,
      insertText: "store",
      detail:
        "获取stroe信息\n" +
        "var userId = this.store.state.user.userId;\n" +
        "var param = {…};\n" +
        "this.dwf_modeler_axios(`/org/users/${userId}/groups`),param).then(groupOBJ => {\n" +
        "   // 在回调中处理groupOBJ值…\n" +
        "});" +
        "//增加自定义参数\n" +
        'this.store.state.DWF_customer["testCustomerData"] = {"hello":"world"}\n' +
        '{hello: "world"}\n' +
        "//查询自定义参数\n" +
        'this.store.state.DWF_customer["testCustomerData"]\n' +
        '{hello: "world"}\n' +
        "//修改自定义参数\n" +
        'this.store.state.DWF_customer["testCustomerData"] = {"hello":"hello world"}\n' +
        '{hello: "hello world"}\n' +
        "//删除自定义参数\n" +
        'delete this.store.state.DWF_customer["testCustomerData"]\n' +
        "//localStorage前端存储\n" +
        "localStorage.setItem(\"key\",'value');\n" +
        'var data=localStorage.getItem("key");\n' +
        'localStorage.removeItem("key");\n' +
        "/清空localStorage中所有信息,慎用\n" +
        "//sessionStorage与localStorage类似，只是作用域小一些，推荐\n" +
        "localStorage.clear();\n",
    },

    {
      label: "getOperation",
      kind: monaco.languages.CompletionItemKind.Function,
      insertText: "getOperation(targetClass,oprName).then(res => {\n" +
		"	//获取返回的操作定义\n" +
		"	var opr = res.data.data;\n" +
		"	//TODO 执行操作\n" +
		"	//this.executeOperation(opr);\n" +
		"});",
      detail:
        "通过getOperation获取到已有的操作（需要存储到数据库中），再通过executeOperation进行调用，并且允许修改已有操作的操作样式和动作。\n" +
        "//调用已有的操作\n" +
        'this.getOperation("WorkOrder", "createWO").then(res =>{\n' +
        "    //先取出原始操作\n" +
        "    var opr = res.data.data;\n" +
        "    // 替代前处理脚本，不用的话可以不写\n" +
        "    opr.beforeExecute = () => {\n" +
        "        //新的前处理脚本\n" +
        "        return {\n" +
        "        obj:{...},//选填，对象\n" +
        '        query:"",//选填，查询条件\n' +
        "        data:{...}}//选填，自定义属性\n" +
        "    }\n" +
        "    // 替代原来操作的后处理脚本，不用的话可以不写\n" +
        "    opr.afterExecute = () => {\n" +
        "        //新的后处理脚本，可根据\n" +
        "    }\n" +
        "    this.executeOperation(opr)\n" +
        "});",
    },
    {
      label: "getEventOperation",
      kind: monaco.languages.CompletionItemKind.Function,
      insertText: "getEventOperation(\"单击\").then(res =>{ \n" +
			"//先取出原始操作 \n" +
			"var opr = res.data.data; \n" +
			"// 替代原来操作的后处理脚本，不用的话可以不写 \n" +
			"opr.afterExecute = () => { \n" +
			"//新的后处理脚本 \n" +
			"this.msgbox.info(\"成功\"); \n" +
			"} \n" +
			"this.executeOperation(opr) \n" +
		"});",
      detail:
        '通过this.getAddinById("id")获取按钮的控件对象，然后再使用getEvenOperation执行按钮绑定的事件。' +
        "//用已有的操作\n" +
        'this.getAddinById("控件1").getEventOperation("单击").then(res =>{\n' +
        "    //先取出原始操作\n" +
        "    var opr = res.data.data;\n" +
        "    // 替代原来操作的后处理脚本，不用的话可以不写\n" +
        "    opr.afterExecute = () => {\n" +
        "        //新的后处理脚本\n" +
        '        this.msgbox.info("成功")\n' +
        "    }\n" +
        "    this.executeOperation(opr)\n" +
        "});",
    },
    {
      label: "invokeEvent",
      kind: monaco.languages.CompletionItemKind.Function,
      insertText: "invokeEvent(eventType)",
      detail:
        "直接触发控件上的事件，可以通过invokeEvent实现，不必调用this.executeOperation\n" +
        "@param type:事件类型\n" +
        'var button = this.getAddinById("控件1");\n' +
        'button.invokeEvent("单击");',
    },
    {
      label: "executeOperation",
      kind: monaco.languages.CompletionItemKind.Function,
      insertText: "executeOperation(operation).then((res) => { \n" +
			"//TODO res为执行后结果 \n" +
			"console.log(opr);  \n" +
		"});",
      detail:
        "自定义操作对象（在现在的脚本中定义操作对象，无需事先定义操作）通过executeOperation进行调用\n" +
        "//定义新的create动作的dialog样式的操作\n" +
        "var opr = {\n" +
        '//目标类的类名\n'+
        'targetClass: "WorkOrder",\n' +
        '//目标类中的表单名称\n' +
        '    viewName:"SinlgeWO"  ,\n' +
        '//操作英文名，生造操作时可以自定义\n' +
        '    oprName: "openCreatedial"  ,  \n' +
        '//操作中文名\n' +
        '    displayName:"创建工单" , \n' +
        '//动作支持create、edit、visit、next_create、url\n' +
        '     displayType:"create"  ,\n' +
        ' //操作样式dialog、tab、drawer\n' +
        '    oprStyle:"dialog",  \n' +
        '//默认操作 true、false\n' +
        "    displayOperation:true, \n" +
        '//前处理函数，代表前处理脚\n' +
        "    beforeExecute:() => { \n" +
        "        //新的前处理脚本\n" +
        "        return {\n" +
        '/选填，当前表单多对象控件选中的对象\n' +
        "         obj:this.selectedObjs[0],\n" +
        '//选填，非必填\n' +
        ' query:"and obj.woTitle = \'工单1\'", \n' +
        '//选填，woDesc1是自定义的属性，非实体了上绑定的已有属性；需要在打开表单页面增加初始化操作，接收前处理脚本传入的自定义属性值\n' +
        '    data:{ "woDesc1":"自定义属性"}\n' +
        "       }\n" +
        "    }\n" +
        '//表示后处理函数，代表后处理脚本\n' +
        "    afterExecute：() => {\n" +
        "        //新的后处理脚本，可根据实际情况维护\n" +
        "         var data = this.confirmData;\n" +
        "         console.log(`自定义后处理`)\n" +
        "         console.log(data)\n" +
        "    }\n" +
        "this.executeOperation(opr);",
    },
    {
      label: "openForm",
      kind: monaco.languages.CompletionItemKind.Function,
      insertText: "openForm(targetClass,viewName,args,displayTpe,initParams)",
      detail:
        "新的标签打开界面\n" +
        "let initParams={\n" +
        "      obj:this.selectedObjs[0],\n" +
        "      query:`and obj.woTitle != '工单标题11'`\n" +
        "      data:{\n" +
        "        woDesc1:'cheney'\n" +
        "    }\n" +
        "}\n" +
        "this.openForm(this.className,'SingleWO',null,'edit',initParams)",
    },
    {
      label: "openTab",
      kind: monaco.languages.CompletionItemKind.Function,
      insertText: "openTab(queryOpr,args)",
      detail:
        "新的标签打开界面\n" +
        "@param targetClass：表示对应的类\n" +
        "@param viewName：表示需要打开的表单名称\n" +
        "@param action：动作\n" +
        "@param authority：英文名\n" +
        "@param extSettings：是否打开默认操作\n" +
        "@param args中的参数\n" +
        "@param initParams：object，与操作中的前处理脚本中return { obj:{...}, query: {...}, data: {...}} 返回的格式一致，可以设置对象，查询条件和夹带的数据\n" +
        "@param displayType：create/edit/visit\n" +
        'var grid=this.getAddinById("D0050C68B42743D79C646E1F8FB7D397");\n' +
        "obj=grid.getSelected();\n" +
        "var queryOpr = {\n" +
        "      targetClass: this.className, \n" +
        "       viewName:'SingleWO',\n" +
        "       action: 'edit',\n" +
        "       authority: 'hihilalal',\n" +
        "       displayName: '设置的显示名',\n" +
        "        extSettings: JSON.stringify({needDefaultOpr:true})\n" +
        "}\n" +
        "var args = {  \n" +
        "      initScript:` return{\n" +
        "      obj:this.selectedObjs[0]\n" +
        "     }`,\n" +
        "     displayType:'edit'\n" +
        "}\n" +
        "this.openTab(queryOpr, args);",
    },
    {
      label: "opendrawer",
      kind: monaco.languages.CompletionItemKind.Function,
      insertText:
        "opendrawer(targetClass,viewName ,'left'/'right', null,displayType,initParams)",
      detail:
        "脚本打开滑窗\n" +
        "@param targetClass：表示对应的类\n" +
        "@param viewName：表示需要打开的表单名称\n" +
        "@param left/right：表示右滑窗还是左滑窗\n" +
        "@param args：打开表单时的其他参数，在之前的实现保持不变的前提下，保证兼容性，推荐使用null\n" +
        "@param displaType：tab页签打开时的状态\n" +
        "@param initParams：nitParams：object，与操作中的前处理脚本中return { obj:{...}, query: {...}, data: {...}} 返回的格式一致，可以设置对象，查询条件和夹带的数据\n" +
        "//传入初始化脚本，可以传一个对象obj，也支持query，也支持自定义内容data\n" +
        "let initParams={\n" +
        "       obj:this.selectedObjs[0],\n" +
        "       data:{\n" +
        "           woDesc1:'cheney'\n" +
        "       }\n" +
        "}\n" +
        "this.openDrawer(this.className,'SingleWOTest' ,'left', null,'edit',initParams);",
    },
    {
      label: "setTimeIndex",
      kind: monaco.languages.CompletionItemKind.Function,
      insertText: "setTimeIndex(ind)",
      detail:
        "表单控件的赋值\n" +
        "eg：addin.setTimeIndex(ind)，其中addin表示定位到的控件对象，传入参数为具体的赋值。",
    },
    {
      label: "swipePrev",
      kind: monaco.languages.CompletionItemKind.Function,
      insertText: "swipePrev()",
      detail:
        "表单控件的赋值\n" +
        "eg：addin.swipePrev()，其中addin表示定位到的控件对象，传入参数为具体的赋值。",
    },
    {
      label: "swipeNext",
      kind: monaco.languages.CompletionItemKind.Function,
      insertText: "swipeNext()",
      detail:
        "表单控件的赋值\n" +
        "eg：addin.swipeNext()，其中addin表示定位到的控件对象，传入参数为具体的赋值。",
    },
    {
      label: "swipeToIndex",
      kind: monaco.languages.CompletionItemKind.Function,
      insertText: "swipeToIndex(ind)",
      detail:
        "表单控件的赋值\n" +
        "eg：addin.swipeToIndex(ind)，其中addin表示定位到的控件对象，传入参数为具体的赋值。",
    },

    {
      label: "setValue",
      kind: monaco.languages.CompletionItemKind.Function,
      insertText: "setValue(val)",
      detail:
        "表单控件的赋值\n" +
        "eg：addin.setValue(val)，其中addin表示定位到的控件对象，传入参数为具体的赋值。",
    },
    {
      label: "getValue",
      kind: monaco.languages.CompletionItemKind.Function,
      insertText: "getValue()",
      detail:
        "表单控件的取值函数\n" +
        "eg：var addinValue= addinA.getValue()，其中addinA表示定位到的控件对象，addinValue为返回控的件取值。",
    },
    {
      label: "getKVValue",
      kind: monaco.languages.CompletionItemKind.Function,
      insertText: "getKVValue()",
      detail:
        "获取控件的页面字段对应的Key/Value键值对json集合对象，即不包括元素据\n" +
        "//动态参数控件对象\n" +
        "var addin = this.getAddinById('DynamicParameterFrame1');\n" +
        "//获取控件全部数据（包括原schema与新输入值）\n" +
        "var formValue = addin.getValue();\n" +
        "//获取控件KV键值对数据，即不包括原schema元数据，返回数据如下：\n" +
        '{"number": 1,"date":"2020-03-01 10:30:00" ,"name": "桌子", "price":100,"type":"家具","description": "测试数据..."} \n' +
        "var formOBJ = addin.getKVValue();\n",
    },

    {
      label: "getSourceAddin",
      kind: monaco.languages.CompletionItemKind.Function,
      insertText: "getSourceAddin()",
      detail:
        "获取操作触发对象\n" +
        "console.log(this.getSourceAddin.args.text)\n" +
        'label =this.getAddinById("Label4");\n' +
        "label.setValue(this.getSourceAddin.args.text)",
    },
    {
      label: "setError(true,msg)",
      kind: monaco.languages.CompletionItemKind.Function,
      insertText: "setError(true,msg)",
      detail:
        "表单控件的异常提示\n" +
        "addins = this.getAllAddin();\n" +
        "addins.forEach(addin=>{\n" +
        "addin.setError && addin.setError(true, 'error!!');\n" +
        "});\n" +
        '\\取消错误提示\n' +
        "addin.setError(false);",
    },
    {
      label: "setError(false)",
      kind: monaco.languages.CompletionItemKind.Function,
      insertText: "setError(false)",
      detail:
        "取消错误提示\n" +
        "addins = this.getAllAddin();\n" +
        "addins.forEach(addin=>{\n" +
        "addin.setError && addin.setError(true, 'error!!');\n" +
        "});\n" +
        "addin.setError(false);",
    },
    {
      label: "freshObj",
      kind: monaco.languages.CompletionItemKind.Function,
      insertText: "freshObj(obj)",
      detail:
        "使用obj来替换现有卡片对象\n" +
        "this.freshData(obj)//刷新卡片对象\n",
    },
    {
      label: "freshData",
      kind: monaco.languages.CompletionItemKind.Function,
      insertText: "freshData()",
      detail:
        "使用原有查询条件控制表单刷新，更新数据会触发原有页面初始化事件\n" +
        "this.fresData()//刷新表单信息\n",
    },
    {
      label: "freshData(query)",
      kind: monaco.languages.CompletionItemKind.Function,
      insertText: "freshData(query)",
      detail:
        "使用原有查询条件控制表单刷新，更新数据会触发原有页面初始化事件\n" +
        "let query={\n" +
        "    query:`and obj.woTitle like '%工单标题11%'`,\n" +
        "    displayType:'edit'\n" +
        "}" +
        '//刷新表单时传入查询条件\n' +
        "this.freshData(query);\n" +
        '//控件的query条件传入query=`and obj.wotitle = " "`\n' +
        "addin.freshData(query);",
    },
    {
      label: "args",
      kind: monaco.languages.CompletionItemKind.Function,
      insertText: "args",
      detail:
        "控制表单控件的样式渲染，如：控件的隐藏、显示、只读、尺寸大小与其它特定的样式选项\n" +
        'var addin = this.getAddinById("控件id");' +
        '\\设置控件隐藏\n' +
        "addin.args.hided;\n" +
        '\\设置控件只读\n' +
        "addin.args.readonly; " +
        'selectedList仅对“选择下拉控件”有效，定义其下拉内容，具体调用示例为：addinA.args.selectList = [{label:"label1", value:"value1"}, {label:"label2", value:"value2"}] ，其中addinA表示定位到的控件对象；\n' +
        'args.selectedList;\n' +
        'filterQuery该选项目前仅对“单对象下拉框”与部分\\"多对象控件\\"有效，设置过滤条件，具体调用示例为：addinA.args.filterQuery = `and obj.state = \'已发布\'` ,其中addinA表示定义到的控件对象，设置值为字符串，可插入变量。\n' +
        "args.filterQuery;",
    },

    {
      label: "getSelected",
      kind: monaco.languages.CompletionItemKind.Function,
      insertText: "getSelected()",
      detail:
        "返回数组，包含多对象控件被用户点选的对象。\n" +
        "var grid = this.getAddinById('多对象控件id');",
    },
    {
      label: "setTooltip",
      kind: monaco.languages.CompletionItemKind.Function,
      insertText: "setTooltip(mes, type, direction, width)",
      detail:
        "设置控件悬浮提示，其中mes悬停的自定义提示内容 type可以为空默认是hover 已填了的为准\n" +
        "this.getAddinById('控件id').setToolTip(msg,'hover','top-start',66);\n",
    },

    {
      label: "triggerEvent",
      kind: monaco.languages.CompletionItemKind.Function,
      insertText: "triggerEvent('valueChanged')",
      detail:
        "触发控件的值变化事件\n" +
        'var place = this.getAddinById("CheckBox1");\n' +
        "place.setValue('nanjing');//设置地点的值\n" +
        '//触发控件上绑定的值变化事件\n' +
        "place.triggerEvent('valueChanged')",
    },

    {
      label: "setExternalOprConfig",
      kind: monaco.languages.CompletionItemKind.Function,
      insertText: "setExternalOprConfig(config)",
      detail: "表格操作列样式设置\n" +
        'var grid = this.getAddinById(\'Grid2\');\n' +
        ' var operationParams = [{\n' +
        '    uniLabel: \'修改过的编辑\',//按钮文字\n' +
        '    type: \'warning\',//按钮样式\n' +
        '    shape: true,//是否圆角\n' +
        '    disabled: true, //是否禁用\n' +
        '    color: \'red\',//文字颜色\n' +
        '    show: false//按钮是否显示\n' +
        '},{\n' +
        '    uniLabel: \'修改过的新增\',\n' +
        '    type: (rowData) => {\n' +
        '        if(rowData.product === \'草莓\'){\n' +
        '            return \'warning\'\n' +
        '        }else{\n' +
        '            return \'success\'\n' +
        '        }\n' +
        '    },]\n' +
        'grid.setExternalOprConfig(operationParams);',
    },

    {
      label: "setRowClass",
      kind: monaco.languages.CompletionItemKind.Function,
      insertText: "setRowClass(params)",
      detail:
        "设置行样式\n" +
        "var grid = this.getAddinById('Grid3');\n" +
        "grid.setRowClass((params) => {\n" +
        "if (params.node.rowIndex % 2 === 0) {\n" +
        "return 'grid-font-color-red';\n" +
        "}\n" +
        "if (params.node.rowIndex % 2 !== 0) {\n" +
        "return 'grid-font-color-green';\n" +
        "}\n" +
        "if (params.data.companyd === '哈哈哈1') {\n" +
        "return 'grid-font-color-green';\n" +
        "}",
    },
    {
      label: "setColumnDefs",
      kind: monaco.languages.CompletionItemKind.Function,
      insertText: "setColumnDefs(def)",
      detail:
        "设置列定义\n" +
        "var def = [{\n" +
        " hide: true,\n" +
        "cellClass: (params) => {\n" +
        "return params.value==='哈哈哈1'?'grid-text-decoration-underline grid-font-color-blue grid-font-size-14':'';\n" +
        "}\n" +
        "}]\n" +
        "grid.setColumnDefs(def);",
    },
    {
      label: "setColumnVisible",
      kind: monaco.languages.CompletionItemKind.Function,
      insertText: "setColumnVisible(colNum,true/false)",
      detail:
        "设置列是否可见\n" +
        'var grdiAddin = this.GetAddinById("id");\n' +
        "grdiAddin.setColumnVisible(0, false);",
    },
    {
      label: "getRowData",
      kind: monaco.languages.CompletionItemKind.Function,
      insertText: "getRowData()",
      detail:
        "设置表格数据\n" +
        'var grdiAddin = this.GetAddinById("表格控件的id");\n' +
        "grdiAddin.getRowData();",
    },
    {
      label: "setRowData",
      kind: monaco.languages.CompletionItemKind.Function,
      insertText: "setRowData(rowData)",
      detail:
        "设置表格数据\n" +
        'var grdiAddin = this.GetAddinById("表格控件的id");\n' +
        "var rowData = [\n" +
        "        {field: 'field1', oid: 'oid1'},\n" +
        "        {field: 'field2', oid: 'oid2'},\n" +
        "]\n" +
        "//设置表格数据\n" +
        "grdiAddin.setRowData(rowData);\n" +
        "//添加表格数据\n" +
        "grdiAddin.setRowData(rowData, 'add');",
    },
    {
      label: "deleteRowData",
      kind: monaco.languages.CompletionItemKind.Function,
      insertText: "deleteRowData(rowindex)",
      detail:
        "删除表格数据（参数对应行）\n" +
        'var grdiAddin = this.GetAddinById("id");\n' +
        "grdiAddin.deleteRowData('1');\n" +
        "grdiAddin.deleteRowData(['2','3']);",
    },
    {
      label: "updateRowData",
      kind: monaco.languages.CompletionItemKind.Function,
      insertText: 'updateRowData(rowindex,{field:"val"})',
      detail:
        "删除表格数据（参数对应行）\n" +
        'var grdiAddin = this.GetAddinById("表格控件的id");' +
        "grdiAddin.updateRowData('4', {field: 'updatefield'});",
    },
    {
      label: "getAll",
      kind: monaco.languages.CompletionItemKind.Function,
      insertText: "getAll()",
      detail:
        "返回数组，包含多对象控件中所有前端可见的对象\n" +
        'let workItemTable = this.GetAddinById("Grid1");\n' +
        "var Table = workItemTable.getAll();\n" +
        "console.log(Table);\n",
    },
    {
      label: "getRootAddin",
      kind: monaco.languages.CompletionItemKind.Function,
      insertText: "getRootAddin()",
      detail:
        "获取表单层级实例\n" +
        "var subFormAddin = this.getRootAddin();\n",
    },
    {
      label: "getDefaultColumnDef",
      kind: monaco.languages.CompletionItemKind.Function,
      insertText: "getDefaultColumnDef()",
      detail:
        "获取一列的默认列定义\n" +
        "var grid = this.getAddinById('Grid3');\n" +
        "var defaultColumnDefs1 = grid.getDefaultColumnDef({\n" +
        "alignCode: 1, \n" +
        'attrName: "companyd",\n' +
        "editable: false,\n" +
        'colId: "companyd_id",\n' +
        "enableFilter: true,\n" +
        "enableSorting: true,\n" +
        'field: "companyd",\n' +
        'headerName: "单位"\n' +
        "});",
    },
    {
      label: "setPageInfo",
      kind: monaco.languages.CompletionItemKind.Function,
      insertText: "setPageInfo()",
      detail:
        "获取所有对象集合\n" +
        "ar grid = this.getAddinById('Grid3');\n" +
        '//获取当前表格页码信息\n' +
        "var pageInfo = grid.getPageInfo();" +
        "" +
        "if(!pageInfo.totalPage){\n" +
        'this.dwf_axios.post("http://ip:9090/dwf/v1/omf/entities/recruit/objects/count", modReq).then(res => {\n' +
        "if(res.data.code != 200){\n" +
        "}else{\n" +
        '//数据总数\n' +
        "pageInfo.totalPage = res.data.data;\n" +
        '//每页条数\n' +
        "pageInfo.pageSize = 2;\n" +
        '//当前页码\n' +
        "pageInfo.pageIndex = 1;\n" +
        '//每页条数切换的配置\n' +
        "pageInfo.pageSizeOpts = [2]\n" +
        "modReq = {\n" +
        "condition: '',\n" +
        "startIndex: pageInfo.pageIndex,\n" +
        "pageSize: pageInfo.pageSize\n" +
        "};\n" +
        '//设置当前表格页码信息\n' +
        "grid.setPageInfo(pageInfo)",
    },
    {
      label: "getPageInfo",
      kind: monaco.languages.CompletionItemKind.Function,
      insertText: "getPageInfo()",
      detail:
        "获取表格页码信息\n" +
        "var grid = this.getAddinById('Grid3');\n" +
        'var query = "";\n' +
        "var modReq = {\n" +
        '"condition": query\n' +
        "};\n" +
        'this.dwf_axios.post("http://$env.serverIp:9090/dwf/v1/omf/entities/recruit/objects", modReq).then(rsp => {\n' +
        "if(rsp.data.code != 200){\n" +
        "}else{\n" +
        "var rowData = rsp.data.data;\n" +
        "var pageInfo = grid.getPageInfo();\n" +
        "grid.setRowData(rowData.slice((pageInfo.pageIndex - 1) * pageInfo.pageSize, pageInfo.pageIndex * pageInfo.pageSize))\n" +
        "}\n" +
        "});\n",
    },
    {
      label: "getParentAddin",
      kind: monaco.languages.CompletionItemKind.Function,
      insertText: "getParentAddin()",
      detail:
        "获取父控件\n" +
        "var FormEngine1 = this.getAddinById('FormEngine1');//获取卡片1控件id\n" +
        "var FormEngine2 = this.getAddinById('FormEngine3');//获取卡片2控件id\n" +
        '//获取卡片1控件中的文本框1\n' +
        "var Text1InFormEngine = FormEngine1.getAddinById('TextInput1');\n" +
        '//为文本框1赋值为1\n' +
        "Text1InFormEngine.setValue(1);\n" +
        '//获取文本框1的父控件，也就是卡片1\n' +
        "var FE1 = Text1InFormEngine.getParentAddin();\n" +
        "if(FE1){\n" +
        '//卡片1的父控件，也就是当前表单\n' +
        "var Form = FE1.getParentAddin();\n" +
        "debugger\n" +
        "if(Form){\n" +
        '//获取当前表单的卡片2\n' +
        "var FE2 = Form.getAddinById('FormEngine3');\n" +
        "if(FE2){\n" +
        '//卡片2的文本框\n' +
        "var TextInput1FormEngine2 = FE2.getAddinById('TextInput1');\n" +
        '//给卡片2的文本框赋值\n' +
        "if(TextInput1FormEngine2) TextInput1FormEngine2.setValue(3)\n" +
        "}}}",
    },
    {
      label: "updateShow",
      kind: monaco.languages.CompletionItemKind.Function,
      insertText: "updateShow()",
      detail:
        "刷新表单的数据显示\n" +
        "var FormEngine1 = this.getAddinById('FormEngine1');\n" +
        '//查询条件\n' +
        "let query = ` and obj.dataname = '数据111' `; \n" +
        "//开始后台数据的查询\n" +
        'this.handleQueryData({query:query,targetClass:"data",fresh:true}).then(res=>{\n' +
        "//updateShow('子表单类名','子表单名',{obj:res[0]});\n" +
        "FormEngine1.updateShow('data','biaoqian',{obj:res[0]});\n" +
        "});",
    },
    {
      label: "editNodeObj",
      kind: monaco.languages.CompletionItemKind.Function,
      insertText: "editNodeObj(obj,true)",
      detail:
        "编辑树节点\n" +
        "var tree = this.getAddInByID('TreeID');\n" +
        "let fixObj = { \n" +
        'right_uintname: "value",\n' +
        "}\n" +
        "tree.editNodeObj(fixObj, true)",
    },
    {
      label: "start",
      kind: monaco.languages.CompletionItemKind.Function,
      insertText: "start(args)",
      detail:
        "启动消息订阅\n" +
        'var addin = this.getAddinById("TextInput1");\n' +
        "var wm = this.getAddinById('WatchMessage2');\n" +
        "var params = {\n" +
        "data: addin.getValue()\n" +
        "}\n" +
        "wm.start(params);",
    },
    {
      label: "pause",
      kind: monaco.languages.CompletionItemKind.Function,
      insertText: "pause()",
      detail:
        "暂停消息订阅\n" +
        "var wm = this.getAddinById('WatchMessage2');\n" +
        "wm.pause();",
    },
    {
      label: "resume",
      kind: monaco.languages.CompletionItemKind.Function,
      insertText: "resume()",
      detail:
        "恢复消息订阅\n" +
        "var wm = this.getAddinById('WatchMessage2');\n" +
        "wm.resume();",
    },
    {
      label: "stop",
      kind: monaco.languages.CompletionItemKind.Function,
      insertText: "stop()",
      detail:
        "停止消息订阅\n" +
        "var wm = this.getAddinById('WatchMessage2');\n" +
        "wm.stop();",
    },
    {
      label: "param",
      kind: monaco.languages.CompletionItemKind.Function,
      insertText: "param",
      detail:
        "获取后端返回值\n" +
        'var label = this.getAddinById("Label1");\n' +
        "label.setValue(this.param.data.operationResult);",
    },
    {
      label: "option",
      kind: monaco.languages.CompletionItemKind.Function,
      insertText: "option",
      detail:
        "设置图例位置\n" +
        "let myChart = this.getAddinById('EchartBar1');\n" +
        '//可以写left ,right，top，bottom\n' +
        "myChart.args.option.legend.right = 60;\n" +
        "myChart.args.option.legend.bottom = 'auto';",
    },
    {
      label: "clickData",
      kind: monaco.languages.CompletionItemKind.Function,
      insertText: "clickData()",
      detail:
        "可视化脚本，回填选中的值\n" +
        "let chart = this.getAddinById('EChart1');\n" +
        "console.log(chart.clickData)\n" +
        "return {\n" +
        "obj: {\n" +
        "price2: chart.clickData\n" +
        "}\n" +
        "}",
    },

    {
      label: "log",
      kind: monaco.languages.CompletionItemKind.Function,
      insertText: "log(msg)",
      detail: "前端控制台日志输出" +
        "通过console.log()进行调试\n",
    },
    //tab页签
    {
      label: "setDisable",
      kind: monaco.languages.CompletionItemKind.Function,
      insertText: "setDisable(tabName,true/false)",
      detail:
        "Tab控件，设置Tab控件子页签的可见与不可见\n" +
        '@param tabName:子页面名称\n' +
        '@param forbidden:true/false,true表示禁用显示子页签，false表示取消禁用\n' +
        "eg：tabAddin.setDisable('子页签名称',true)，其中 tabAddin表示定位到的tab控件对象",
    },
    {
      label: "getSelectedTab",
      kind: monaco.languages.CompletionItemKind.Function,
      insertText: "getSelectedTab()",
      detail:
        "获取Tab控件当前选中的子页签\n" +
        '函数无参数，反回当前选中的子页签；获取到子页签对象后，可继续获取到其名称，然后可通过脚本继续设置其子页签是否禁用等。\n' +
        "eg：tabAddin.getSelectedTab()，其中 tabAddin表示定位到的tab控件对象",
    },
    {
      label: "turnTo",
      kind: monaco.languages.CompletionItemKind.Function,
      insertText: "turnTo(tabName)",
      detail:
        "跳转激活子页签\n" +
        '函数有一个参数，即要跳转激活子页签的名称。\n' +
        'eg：tabAddin.turnTo("作业卡下步骤")，其中 tabAddin表示定位到的tab控件对象，,',
    },
    {
      label: "$el",
      kind: monaco.languages.CompletionItemKind.Function,
      insertText: "$el",
      detail:
        "指定控件的 dom 元素。\n" +
        '//控件隐藏\n' +
        'eg：addinElement.$el.style.display = "none";' +
        '//控件显示\n' +
        'eg：addinElement.$el.style.display = "block";',
    },
    {
      label: "callServer",
      kind: monaco.languages.CompletionItemKind.Function,
      insertText: "callServer(scriptName).then(res => {" +
        "" +
        "})",
      detail:
        "调用指定的后端脚本。"
    },
    {
      label: "setBadge",
      kind: monaco.languages.CompletionItemKind.Function,
      insertText: "setBadge()",
      detail: "设置徽标\n" +
      "eg：addinA.setBadge('xxx')，其中addinA表示定位到的控件对象",
    },
    {
      label: "getFormName",
      kind: monaco.languages.CompletionItemKind.Function,
      insertText: "getFormName()",
      detail: "获取目标属性\n" +
      "eg：var name = addinA.getFormName()，其中addinA表示定位到的控件对象",
    },
    {
      label: "getDisplayValue",
      kind: monaco.languages.CompletionItemKind.Function,
      insertText: "getDisplayValue()",
      detail: "获取选择后显示的值\n" +
        "eg：var value = addinA.getDisplayValue()，其中addinA表示定位到的控件对象",
    },
    {
      label: "setTimeIndex",
      kind: monaco.languages.CompletionItemKind.Function,
      insertText: "setTimeIndex(index)",
      detail: "制定激活位置\n" +
        "eg：addinA.setTimeIndex(index)，其中addinA表示定位到的控件对象, index表示要激活的位置",
    },
  ];
};

//前端args.
const getCustomCompletionArgs = (monaco) => {
  return [
    {
      label: "hided",
      kind: monaco.languages.CompletionItemKind.Function,
      insertText: "hided",
      detail:
        "隐藏控件\n" +
        'var addin = this.getAddinById("控件id");' +
        "addin.args.hided;\n",
    },
    {
      label: "selectedList",
      kind: monaco.languages.CompletionItemKind.Function,
      insertText: "selectedList",
      detail:
        "仅对“选择下拉控件”有效，定义其下拉内容\n" +
        'var addin = this.getAddinById("控件id");' +
        'addin.args.selectList = [{label:"label1", value:"value1"}, {label:"label2", value:"value2"}] ',
    },

    {
      label: "filterQuery",
      kind: monaco.languages.CompletionItemKind.Function,
      insertText: "filterQuery",
      detail:
        '该选项目前仅对“单对象下拉框”与部分"多对象控件"有效，设置过滤条件\n' +
        'var addin = this.getAddinById("控件id");' +
        "addin.args.filterQuery = `and obj.state = '已发布'` ",
    },

    {
      label: "readonly",
      kind: monaco.languages.CompletionItemKind.Function,
      insertText: "readonly",
      detail:"该选项控制控件是否可读\n"+
        "addins = this.getAllAddin();\n" +
        "console.log(addins)\n" +
        "addins.forEach(addin=>{\n" +
        "if('readonly' in addin.args)\n" +
        "addin.args.readonly = !addin.args.readonly;\n" +
        "});"
      ,
    },
    {
      label: "border",
      kind: monaco.languages.CompletionItemKind.Function,
      insertText: "border",
      detail:"标签页控件的边框",
    },
    {
      label: "title_fontColor",
      kind: monaco.languages.CompletionItemKind.Function,
      insertText: "title_fontColor",
      detail:"标签页控件的标题字体颜色",
    },
    {
      label: "titleContent",
      kind: monaco.languages.CompletionItemKind.Function,
      insertText: "titleContent",
      detail:"单元格标签默认名称",
    },
    {
      label: "stepList",
      kind: monaco.languages.CompletionItemKind.Function,
      insertText: "stepList",
      detail:"步骤条全部数据",
    },
    {
      label: "stepTitle",
      kind: monaco.languages.CompletionItemKind.Function,
      insertText: "stepTitle",
      detail:"时间轴标题",
    },
    {
      label: "stepNote",
      kind: monaco.languages.CompletionItemKind.Function,
      insertText: "stepNote",
      detail:"时间轴描述",
    },
    {
      label: "inactStepIcon",
      kind: monaco.languages.CompletionItemKind.Function,
      insertText: "inactStepIcon",
      detail:"时间轴默认图标",
    },
    {
      label: "actStepIcon",
      kind: monaco.languages.CompletionItemKind.Function,
      insertText: "actStepIcon",
      detail:"时间轴激活图标",
    },
    {
      label: "actStepColor",
      kind: monaco.languages.CompletionItemKind.Function,
      insertText: "actStepColor",
      detail:"时间轴激活颜色",
    },
    {
      label: "actStepIndex",
      kind: monaco.languages.CompletionItemKind.Function,
      insertText: "actStepIndex",
      detail:"时间轴激活位置",
    },
  ];
};

//前端user.
const getCustomCompletionUser = (monaco) => {
  return [
    {
      label: "userId",
      kind: monaco.languages.CompletionItemKind.Function,
      insertText: "userId",
      detail: "获取当前用户userId（同oid）\n"
        + "eg:this.user.userId;",
    },
    {
      label: "token",
      kind: monaco.languages.CompletionItemKind.Function,
      insertText: "token",
      detail: "获取当前用户token\n" +
        "eg:this.user.token;",
    },
    {
      label: "oid",
      kind: monaco.languages.CompletionItemKind.Function,
      insertText: "oid",
      detail: "获取当前用户oid\n" +
        "eg:this.user.oid;",
    },
    {
      label: "userName",
      kind: monaco.languages.CompletionItemKind.Function,
      insertText: "userName",
      detail: "获取当前用户英文名userName\n" +
        "eg:this.user.userName;",
    },
    {
      label: "displayName",
      kind: monaco.languages.CompletionItemKind.Function,
      insertText: "displayName",
      detail: "获取当前用户显示名displayName\n" +
        "eg:this.user.displayName;",
    },
    {
      label: "userGroups",
      kind: monaco.languages.CompletionItemKind.Module,
      insertText: "userGroups[index]",
      detail:
        "用户所属用户组集第一个用户组的信息\n" +
        "eg:this.user.userGroups[0].name;//用户组名\n" +
        "this.user.userGroups[0].oid;//用户组oid\n" +
        "this.user.userGroups[0].comment//用户组备注;",
    },
  ];
};

//前端env.
const getCustomCompletionEnv = (monaco) => {
  return [
    {
      label: "serverIp",
      kind: monaco.languages.CompletionItemKind.Function,
      insertText: "serverIp",
      detail:
        "字符串，在浏览器地址栏输入的DWF服务器位置\n" +
        "eg:this.env.serverIp",
    },
    {
      label: "serverPort",
      kind: monaco.languages.CompletionItemKind.Function,
      insertText: "serverPort",
      detail:
        "字符串，在浏览器地址栏输入访问DWF服务器的端口号\n" +
        "eg:this.env.serverPort",
    },
    {
      label: "serverURL",
      kind: monaco.languages.CompletionItemKind.Function,
      insertText: "serverURL",
      detail:
        "字符串，在浏览器地址栏输入访问DWF服务器位置加端口号\n" +
        "eg:this.env.serverURL",
    },
    {
      label: "metaServicePort",
      kind: monaco.languages.CompletionItemKind.Function,
      insertText: "metaServicePort",
      detail:
        "字符串，服务器元数据服务端口\n" +
        "eg:this.env.metaServicePort",
    },
    {
      label: "objServicePort",
      kind: monaco.languages.CompletionItemKind.Function,
      insertText: "objServicePort",
      detail:
        "字符串，服务器对象数据服务端口\n" +
        "eg:this.env.objServicePort",
    },
  ];
};

//前端msgbox.
const getCustomCompletionMsgBox = (monaco) => {
  return [
    {
      label: "info",
      kind: monaco.languages.CompletionItemKind.Function,
      insertText: 'info("提示信息")',
      detail: "包含标准弹框显示\n" +
        'eg:this.msgbox.loading("加载信息");',
    },
    {
      label: "error",
      kind: monaco.languages.CompletionItemKind.Function,
      insertText: 'error("错误信息")',
      detail: "包含标准弹框显示\n" +
        'eg:this.msgbox.error("错误信息");',
    },
    {
      label: "success",
      kind: monaco.languages.CompletionItemKind.Function,
      insertText: 'success("成功信息")',
      detail: "包含标准弹框显示\n" +
        'eg:this.msgbox.success("成功信息");',
    },
    {
      label: "warning",
      kind: monaco.languages.CompletionItemKind.Function,
      insertText: 'warning("警告信息")',
      detail: "包含标准弹框显示\n" +
        'this.msgbox.warning("警告信息");',
    },
    {
      label: "loading",
      kind: monaco.languages.CompletionItemKind.Function,
      insertText: 'loading("加载信息")',
      detail: "包含标准弹框显示\n" +
        'this.msgbox.loading("加载信息");',
    },
  ];
};

//超级控件dwf_ctx.
const getCustomHTMLDwfCtxCompletion = (monaco) => {
  return [
    {
      label: "getOperation",
      kind: monaco.languages.CompletionItemKind.Function,
      insertText: "getOperation(className,oprName)",
      detail:
        "getOperation获取到已有的操作（需要存储到数据库中），再通过executeOperation进行调用，并且允许修改已有操作的操作样式和动作。" +
        "@param targetClass：已有操作绑定的目标类；\n" +
        "@param oprName：已有操作的英文名\n" +
        'this.dwf_ctx.getOperation("WorkOrder", "createWO").then(res =>{\n' +
        "    //先取出原始操作\n" +
        "    var opr = res.data.data;\n" +
        "    // 替代前处理脚本，不用的话可以不写\n" +
        "    opr.beforeExecute = function() {\n" +
        "        //新的前处理脚本\n" +
        "        return {\n" +
        "        obj:{...},//选填，对象\n" +
        '        query:"",//选填，查询条件\n' +
        "        data:{...}}//选填，自定义属性\n" +
        "    }\n" +
        "    // 替代原来操作的后处理脚本，不用的话可以不写\n" +
        "    opr.afterExecute = function() {\n" +
        "        //新的后处理脚本，可根据\n" +
        "    }\n" +
        "    this.dwf_ctx.executeOperation(opr)\n" +
        "});",
    },
    {
      label: "executeOperation",
      kind: monaco.languages.CompletionItemKind.Function,
      insertText: "executeOperation(opr)",
      detail:
        "关闭页签" +
        "//自定义操作对象（在现在的脚本中定义操作对象，无需事先定义操作）通过executeOperation进行调用\n" +
        "@param opr：定义的操作对象\n" +
        "@param targetClass：目标类的类名\n" +
        "@param viewName：目标类中的表单名称\n" +
        "@param oprName：操作英文名\n" +
        "@param displayName: 操作中文名\n" +
        "@param displayType：动作支持create、edit、visit、next_create、url\n" +
        "@param url: 如果displayType是url需要增加这个参数来传url地址\n" +
        "@param oprStyle：操作样式dialog、tab、drawerL、 drawerR\n" +
        "@param displayOperation：默认操作 true、false\n" +
        "@param beforeExecute：表示前处理函数，代表前处理脚本\n" +
        "@param afterExecute：表示后处理函数，代表后处理脚本\n" +
        "//定义新的create动作的dialog样式的操作\n" +
        "var opr = {\n" +
        '    targetClass: "WorkOrder",  \n' +
        '    viewName:"SinlgeWO"  ,\n' +
        '    oprName: "openCreatedial" , \n' +
        '    displayName:"创建工单" , \n' +
        '     displayType:"create"  ,\n' +
        '    oprStyle:"dialog", \n' +
        "    displayOperation:true,  \n" +
        "    beforeExecute:function(){ \n" +
        "        //新的前处理脚本\n" +
        "        return {\n" +
        '//选填，当前表单多对象控件选中的对象\n' +
        "         obj:this.selectedObjs[0],\n" +
        ' //选填，非必填\n' +
        "         //query:\"and obj.woTitle = '工单1'\",\n" +
        '//选填，woDesc1是自定义的属性，非实体了上绑定的已有属性；，需要在打开表单页面增加初始化操作，接收前处理脚本传入的自定义属性值\n' +
        '         data:{ "woDesc1":"自定义属性"\n' +
        "         }\n" +
        "       }\n" +
        "    }\n" +
        '//表示后处理函数，代表后处理脚本\n' +
        "    afterExecute:function(){         \n" +
        "        //新的后处理脚本，可根据实际情况维护\n" +
        "         var data = this.confirmData;\n" +
        "         console.log(`自定义后处理`)\n" +
        "         console.log(data)\n" +
        "    }\n" +
        "}\n" +
        "this.dwf_ctx.executeOperation(opr);",
    },
    {
      label: "handleQueryData",
      kind: monaco.languages.CompletionItemKind.Function,
      insertText: "handleQueryData(queryConditon).then(res=>{})",
      detail:
        "后台数据强制刷新/查询\n" +
        "let  queryConditon = {\n" +
        '   targetClass:"Part",\n' +
        "   query:{query:`and obj.id='${this.dwf_ctx.obj.name}'`},\n" +
        ' //是否从后台强制刷新查询（建议默认值为true）\n' +
        "   fresh: true \n" +
        "};\n" +
        "//基于DB进行查询\n" +
        "this.dwf_ctx.handleQueryData(queryConditon).then(res => {\n" +
        "   //针对res值（查询返回值）直接处理…\n" +
        "});",
    },
    {
      label: "selectedObjs",
      kind: monaco.languages.CompletionItemKind.Function,
      insertText: "selectedObjs",
      detail:
        "获取选中多对象控件中对象\n" +
        "var allRowDatas = this.dwf_ctx.selectedObjs();",
    },
    {
      label: "defaultObjsAddin",
      kind: monaco.languages.CompletionItemKind.Function,
      insertText: "defaultObjsAddin()",
      detail: "获取表单默认多对象控件\n" +
        "this.dwf_ctx.defaultObjsAddin();",
    },
    {
      label: "openForm",
      kind: monaco.languages.CompletionItemKind.Function,
      insertText: "openForm(className,viewName,null,displayTpe,initParams)",
      detail:
        "脚本打开弹窗" +
        "@param targetClass：表示对应的类\n" +
        "@param viewName：表示需要打开的表单名称\n" +
        "@param args：高级设置，推荐使用null，用executeOperation方法处理业务。打开表单时的其他参数，在之前的实现保持不变的前提下，保证兼容性，做如下简化：\n" +
        "@param initialScript：string，前处理脚本，默认为空，慎用，如果设置的前处理脚本通过 return { obj:{...}, query: {...}, data: {...}} 返回了对象，同时在args里也设置了initParams，则args里的initParams会被覆盖掉。\n" +
        "@param afterScript：string，后处理脚本，默认为空，慎用。\n" +
        "@param displayType：create/edit/visit\n" +
        "@param initParams：object，与操作中的前处理脚本中return { obj:{...}, query: {...}, data: {...}} 返回的格式一致，可以设置对象，查询条件和夹带的数据\n" +
        "let initParams={\n" +
        "      obj:this.selectedObjs[0],\n" +
        "     query:`and obj.woTitle != '工单标题11'`\n" +
        "     data:{\n" +
        "        woDesc1:'cheney'\n" +
        "    }\n" +
        "}\n" +
        "this.dwf_ctx.openForm(this.className,'SingleWO',null,'edit',initParams)",
    },
    {
      label: "openTab",
      kind: monaco.languages.CompletionItemKind.Function,
      insertText: "openTab(queryOpr, args)",
      detail:
        "脚本打开tab" +
        "queryOpr中的参数\n" +
        "@param targetClass：表示对应的类\n" +
        "@param viewName：表示需要打开的表单名\n" +
        "@param action：动作\n" +
        "@param authority：英文名\n" +
        "@param extSettings：是否打开默认操作\n" +
        "@param args中的参数\n" +
        "@param initParams：object，与操作中的前处理脚本中return { obj:{...}, query: {...}, data: {...}} 返回的格式一致，可以设置对象，查询条件和夹带的数据\n" +
        "@param displayType：create/edit/visit\n" +
        'var grid=this.dwf_ctx.getAddinById("D0050C68B42743D79C646E1F8FB7D397");\n' +
        "obj=grid.getSelected();\n" +
        "var queryOpr = {\n" +
        "      targetClass: this.dwf_ctx.className,\n" +
        "       viewName:'SingleWO',\n" +
        "       action: 'edit',\n" +
        "       authority: 'hihilalal',\n" +
        "       displayName: '设置的显示名',\n" +
        "       extSettings: JSON.stringify({needDefaultOpr:true})\n" +
        "}\n" +
        "var args = { \n" +
        "      initScript:` return{\n" +
        "      obj:this.selectedObjs[0]\n" +
        "     // obj:obj[0]\n" +
        "     }`,\n" +
        "     displayType:'edit'\n" +
        "}\n" +
        "this.dwf_ctx.openTab(queryOpr, args);",
    },

    {
      label: "openDrawer",
      kind: monaco.languages.CompletionItemKind.Function,
      insertText: "opendrawer(className,viewName ,'left'/'right', null,displayType,initParams)",
      detail:
        "脚本打开滑窗" +
        "@param targetClass：表示对应的类\n" +
        "@param viewName：表示需要打开的表单名称\n" +
        "@param left/right：表示右滑窗还是左滑窗\n" +
        "@param args：打开表单时的其他参数，在之前的实现保持不变的前提下，保证兼容性，推荐使用null\n" +
        "@param displaType：tab页签打开时的状态\n" +
        "@param initParams：nitParams：object，与操作中的前处理脚本中return { obj:{...}, query: {...}, data: {...}} 返回的格式一致，可以设置对象，查询条件和夹带的数据\n" +
        "//传入初始化脚本，可以传一个对象obj，也支持query，也支持自定义内容data\n" +
        "let initParams={\n" +
        "       obj:this.selectedObjs[0],\n" +
        "       data:{\n" +
        "           woDesc1:'cheney'\n" +
        "       }\n" +
        "}\n" +
        "this.dwf_ctx.openDrawer(this.className,'SingleWOTest' ,'left', null,'edit',initParams);",
    },
    {
      label: "getAttributesByClass",
      kind: monaco.languages.CompletionItemKind.Function,
      insertText: "getAttributesByClass(className)",
      detail:
        "获取指定类绑定的所有属性\n" +
        "@param className类的英文名\n" +
        'let assetAttrs = this.dwf_ctx.getAttributesByClass("Asset");\n' +
        "assetAttrs.forEach(a => {\n" +
        "    console.log(a);\n" +
        "});",
    },
    {
      label: "getEntityClass",
      kind: monaco.languages.CompletionItemKind.Function,
      insertText: "getEntityClass()",
      detail:
        "获取当前DWF内的所有实体类\n" +
        "let entities = this.dwf_ctx.getEntityClass();\n" +
        "entities.forEach(e => {\n" +
        "    console.log(e);\n" +
        "});",
    },
    {
      label: "getRelationClass",
      kind: monaco.languages.CompletionItemKind.Function,
      insertText: "getRelationClass()",
      detail:
        "获取当前DWF内的所有关联类" +
        "@param targetClass关联类的英文名，如果不传则返回所有实体类\n" +
        "let relations = this.dwf_ctx.getRelationClass();\n" +
        "relations.forEach(r => {\n" +
        "    console.log(r);\n" +
        "});",
    },
    {
      label: "isEntitySysAttribute",
      kind: monaco.languages.CompletionItemKind.Function,
      insertText: "isEntitySysAttribute(attrName)",
      detail:
        "判断attributes是否为实体类系统属性, 返回值为-1时为非系统属性，其余为系统属性\n" +
        'let assetAttrs = this.dwf_ctx.getAttributesByClass("Asset");\n' +
        "assetAttrs.forEach(a => {\n" +
        "    if (this.dwf_ctx.isEntitySysAttribute(a)){\n" +
        "        console.log(a);\n" +
        "    }\n" +
        "});",
    },
    {
      label: "isRelationSysAttribute",
      kind: monaco.languages.CompletionItemKind.Function,
      insertText: "isRelationSysAttribute(attrName)",
      detail:
        "判断attribute是否为实体类系统属性, 返回值为-1时为非系统属性，其余为系统属性\n" +
        'let relAttrs = this.dwf_ctx.getAttributesByClass("PartToPart");\n' +
        "relAttrs.forEach(a => {\n" +
        "    if (this.dwf_ctx.isRelationSysAttribute(a)){\n" +
        "        console.log(a);\n" +
        "    }\n" +
        "});",
    },


    {
      label: "getAttribute",
      kind: monaco.languages.CompletionItemKind.Function,
      insertText: "getAttribute(attrName)",
      detail:
        "获取属性对应的JSON对象\n" +
        "@param attributeName属性的英文名\n" +
        'let attr = this.dwf_ctx.getAttribute("name");\n' +
        "console.log(attr);",
    },
    {
      label: "closeTabById",
      kind: monaco.languages.CompletionItemKind.Function,
      insertText: 'closeTabById(moduleName-authority)',
      detail:
        "关闭指定页签\n" +
        "@param moduleName-authority: 操作英文名\n" +
        "@param data:传给后处理的值\n" +
        "this.dwf_ctx.closeTabById('moduleName-authority');\n" +
        "//关闭指定页签传值\n" +
        "this.dwf_ctx.closeTabById('moduleName-authority',data);",
    },
    {
      label: "closeDialog",
      kind: monaco.languages.CompletionItemKind.Function,
      insertText: "closeDialog()",
      detail: "关闭弹窗\n" +
        "this.dwf_ctx.closeDialog();",
    },
    {
      label: "spinHide",
      kind: monaco.languages.CompletionItemKind.Function,
      insertText: "spinHide()",
      detail: "关闭遮罩\n" +
        "this.dwf_ctx.spinHide();",
    },
    {
      label: "spinShow",
      kind: monaco.languages.CompletionItemKind.Function,
      insertText: "spinShow()",
      detail: "打开遮罩\n" +
        "this.dwf_ctx.spinShow();",
    },

    {
      label: "create",
      kind: monaco.languages.CompletionItemKind.Function,
      insertText: "create(obj, className)",
      detail:
        "创建className类对象obj\n" +
        "var newObj = {id:'idXXX',name:'nameXXX'};\n" +
        "var className = 'Part';\n" +
        "//新增保存\n" +
        "this.dwf_ctx.create(newObj, className).then(newRtnObj =>{\n" +
        "   //返回的newRtnObj为后台新增后返回的对象,即包含了oid等属性\n" +
        "   //todo:针对newRtnObj继续处理…\n" +
        "});",
    },

    {
      label: "edit",
      kind: monaco.languages.CompletionItemKind.Function,
      insertText: "edit(obj, className)",
      detail:
        "编辑className类对象obj\n" +
        "var editObj = {id:’idXXX’,name:’nameXXX’};\n" +
        "var className = ‘Part’;\n" +
        "editObj.id = ‘idYYY’;\n" +
        "this.dwf_ctx.edit(editObj, className).then(rtnObj =>{\n" +
        "   //返回的rtnObj为后台修改保存后返回的对象\n" +
        "   //todo:针对rtnObj继续处理…\n" +
        "});",
    },

    {
      label: "delete",
      kind: monaco.languages.CompletionItemKind.Function,
      insertText: "delete(obj, className)",
      detail:
        "删除className类对象obj\n" +
        "var curObj = {oid:uuid,id:'idXXX',name:'nameXXX'};\n" +
        "var className = 'Part';\n" +
        "this.dwf_ctx.delete(curObj, className).then(rtnObj =>{\n" +
        "   // rtnObj返回值 = true/false,是否删除成功\n" +
        "   //建议如果返回false，那么返回message错误原因提示信息\n" +
        "});",
    },
    {
      label: "validateForm",
      kind: monaco.languages.CompletionItemKind.Function,
      insertText: "validateForm()",
      detail:
        "控件效验\n" +
        "if(this.dwf_ctx.validateForm()){\n" +
        "console.log('表单验证成功')\n" +
        "}else{\n" +
        "console.log('表单验证失败')\n" +
        "}",
    },
    {
      label: "obj",
      kind: monaco.languages.CompletionItemKind.Function,
      insertText: "obj",
      detail:
        "对象，表单中含有单个对象的时候，通过此变量访问当前对象\n" +
        "this.dwf_ctx.obj",
    },
    {
      label: "getRootAddin",
      kind: monaco.languages.CompletionItemKind.Function,
      insertText: "getRootAddin()",
      detail:
        "获取表单层级实例\n" +
        "var subFormAddin = this.dwf_ctx.getRootAddin();",
    },
    {
      label: "getAddinById",
      kind: monaco.languages.CompletionItemKind.Function,
      insertText: "getAddinById(id)",
      detail:
        "表单控件获取定义\n" +
        "eg: var addinA = this.dwf_ctx.getAddinById(‘控件A的id’)，其中参数为控件的唯一id",
    },
    {
      label: "getAllAddin",
      kind: monaco.languages.CompletionItemKind.Function,
      insertText: "getAllAddin()",
      detail:
        "获取所有控件\n" +
        "var addins = this.dwf_ctx.getAllAddin();",
    },

    {
      label: "dwf_axios",
      kind: monaco.languages.CompletionItemKind.Function,
      insertText: "dwf_axios.post(url,param)",
      detail:
        "调用app的restful API\n" +
        "eg: this.dwf_ctx.dwf_axios.post(`http://$env.serverIp:$env.serverPort/workorder/init`,param);",
    },
    {
      label: "dwf_modeler_axios",
      kind: monaco.languages.CompletionItemKind.Function,
      insertText: "dwf_modeler_axios(url)",
      detail:
        "DWF模型restful 服务脚本调用总入口\n" +
        "var curUserId = this.dwf_ctx.user.oid;\n" +
        "//调用modeler端的restful API\n" +
        'this.dwf_ctx.dwf_modeler_axios("/dwf/v1/org/users/${curUserId}/groups");',
    },

    {
      label: "msgbox",
      kind: monaco.languages.CompletionItemKind.Module,
      insertText: 'msgbox',
      detail:
        "包含标准弹框显示\n" +
        'this.dwf_ctx.msgbox.info("提示信息");\n' +
        'this.dwf_ctx.msgbox.error("错误信息");\n' +
        'this.dwf_ctx.msgbox.success("成功信息");\n' +
        'this.dwf_ctx.msgbox.warning("警告信息");\n' +
        'this.dwf_ctx.msgbox.loading("加载信息");',
    },
    {
      label: "msgboxDialog",
      kind: monaco.languages.CompletionItemKind.Module,
      insertText: "msgboxDialog.confirm();",
      detail:
        "模态弹窗，提示后需手动关闭的msg提示框\n" +
        'this.dwf_ctx.msgboxDialog.success("title标题","成功的提示");\n' +
        'this.dwf_ctx.msgboxDialog.info("title标题","一般的提示");\n' +
        'this.dwf_ctx.msgboxDialog.error(“title标题”,"错误的提示");\n' +
        "// 建议补充comfirm确认弹窗(包括确认与取消按钮)\n" +
        'eg: this.dwf_ctx.msgboxDialog.confirm ("title标题", "请确认是否删除?", function(点击确定之后的回调函数), function(点击取消之后的回调函数));',
    },
    {
      label: "env",
      kind: monaco.languages.CompletionItemKind.Module,
      insertText: "env",
      detail:
        "包含了DWF前端的上下文信息\n" +
        "this.dwf_ctx.env.serverIp; // 在浏览器地址栏输入的DWF服务器位置\n" +
        "this.dwf_ctx.env.serverPort; // 获取当前服务器端口\n" +
        "this.dwf_ctx.env.serverURL; // 获取当前服务器URL\n" +
        "this.dwf_ctx.metaServicePort; // 服务器元数据服务端口\n" +
        "this.dwf_ctx.objServicePort; // 服务器对象数据服务端口",
    },
    {
      label: "user",
      kind: monaco.languages.CompletionItemKind.Module,
      insertText: "user",
      detail:
        "对象，表示当前登录用户，用户具备的属性和前端脚本中this.user具备的属性一致\n" +
        "this.dwf_ctx.user.token; // 获取当前用户token\n" +
        "this.dwf_ctx.user.oid; // 获取当前用户oid\n" +
        "this.dwf_ctx.user.userId; // 获取当前用户userId（同oid）\n" +
        "this.dwf_ctx.user.userName; // 获取当前用户英文名userName\n" +
        "this.dwf_ctx.user.displayName; // 获取当前用户显示名displayName\n" +
        "this.dwf_ctx.user.userGroups[0].name; // 用户所属用户组集第一个用户组的英文名",
    },
    {
      label: "displayType",
      kind: monaco.languages.CompletionItemKind.Function,
      insertText: "displayType()",
      detail:
        "获取表单显示类型\n" +
        "this.dwf_ctx.displayType();",
    },
    {
      label: "className",
      kind: monaco.languages.CompletionItemKind.Function,
      insertText: "className",
      detail:
        "获取当前类名\n" +
        "this.dwf_ctx.className",
    },
  ];
};

//后端omf.
const getCustomJavaOmfCompletion = (monaco) => {
  return [
    //后端
    {
      label: "getByOid",
      kind: monaco.languages.CompletionItemKind.Function,
      insertText: "getByOid(oid)",
      detail:
        "操作对象\n" +
        "getByOid(oid,className): 根据oid获取对象\n" +
        'eg: var objs = this.omf.handleQueryData("and obj.version > 100 order by obj.version limit 5", "yzqrelation");\n' +
        "this.logger.info(JSON.stringify(objs));",
    },

    {
      label: "relCreate",
      kind: monaco.languages.CompletionItemKind.Function,
      insertText: "relCreate(obj,className)",
      detail:
        "关联类拉平数据新增对象\n" +
        "@param obj: 关联类对象拉平数据，left_attr,relation_attr,right_attr\n" +
        "@param className:关联类类名\n" +
        "let obj = {\n" +
        "   \"left_alert\": \"leftalert_create\" ,\n" +
        "   \"right_addT\": \"right_addT\",\n" +
        "   \"relation_ttext\": \"testEditScript1111\"\n" +
        "};\n" +
        "result = this.omf.relCreate(obj,this.className);",
    },
    {
      label: "relCreate(obj,className,runScript)",
      kind: monaco.languages.CompletionItemKind.Function,
      insertText: "relCreate(obj,className,runScript)",
      detail:
        "关联类拉平数据新增对象并控制创建时是否执行创建前后事件\n" +
        "@param obj: 关联类对象拉平数据，left_attr,relation_attr,right_attr\n" +
        "@param className:关联类类名\n" +
        "@param runScript:是否执行创建前后事件\n" +
        "let obj = {\n" +
        "   \"left_alert\": \"leftalert_create\" ,\n" +
        "   \"right_addT\": \"right_addT\",\n" +
        "   \"relation_ttext\": \"testEditScript1111\"\n" +
        "};\n" +
        "result = this.omf.relCreate(obj,this.className,false);",
    },
    {
      label: "relCreate(obj,className,attrNames)",
      kind: monaco.languages.CompletionItemKind.Function,
      insertText: "relCreate(obj,className,attrNames)",
      detail:
        "关联类拉平数据新增对且值唯一\n" +
        "@param obj: 关联类对象拉平数据，left_attr,relation_attr,right_attr\n" +
        "@param className:关联类类名\n" +
        "@param attrNames:数组，保证属性值唯一的属性名\n" +
        "let obj = {\n" +
        "   \"left_alert\": \"leftalert_create\" ,\n" +
        "   \"right_addT\": \"right_addT\",\n" +
        "   \"relation_ttext\": \"testEditScript1111\"\n" +
        "};\n" +
        "result = this.omf.relCreate(obj,this.className,['left_alert']);",
    },
    {
      label: "relCreate(obj,className,runScript,attrNames)",
      kind: monaco.languages.CompletionItemKind.Function,
      insertText: "relCreate(obj,className,runScript,attrNames)",
      detail:
        "关联类拉平数据新增对象并控制创建时是否执行创建前后事件,保证值唯一\n" +
        "@param obj: 关联类对象拉平数据，left_attr,relation_attr,right_attr\n" +
        "@param className:关联类类名\n" +
        "@param runScript:是否执行创建前后事件\n" +
        "@param attrNames:数组，保证属性值唯一的属性名\n" +
        "let obj = {\n" +
        "   \"left_alert\": \"leftalert_create\" ,\n" +
        "   \"right_addT\": \"right_addT\",\n" +
        "   \"relation_ttext\": \"testEditScript1111\"\n" +
        "};\n" +
        "result = this.omf.relCreate(obj,this.className,false,['left_alert']);",
    },
    {
      label: "relEdit",
      kind: monaco.languages.CompletionItemKind.Function,
      insertText: "relEdit(obj,className)",
      detail:
        "拉平数据后编辑关联类对象\n" +
        "@param obj: 关联类对象拉平数据，left_attr,relation_attr,right_attr\n" +
        "@param className:关联类类名\n" +
        'var obj = this.selectedObj;\n' +
        'obj.relation_ttext = "testEditScript1111";\n' +
        'obj.left_alert="leftalert";\n' +
        'obj.right_addT="right_addT";\n' +
        'result = this.omf.relEdit(this.selectedObj, this.className);\n',
    },
    {
      label: "relEdit(obj,className,attrNames)",
      kind: monaco.languages.CompletionItemKind.Function,
      insertText: "relEdit(obj,className,attrNames)",
      detail:
        "拉平数据后编辑关联类对象并保证值唯一\n" +
        "@param obj: 关联类对象拉平数据，left_attr,relation_attr,right_attr\n" +
        "@param className:关联类类名\n" +
        "@param attrNames:数组，保证属性值唯一的属性名\n" +
        'obj.left_alert = "leftalert_create"\n' +
        'let attrNames = ["left_alert"]\n' +
        'try{\n' +
        '     result2 = this.omf.relEdit(obj,this.className,attrNames);\n' +
        ' }catch{\n' +
        '     this.logger.info("error");\n' +
        ' }\n',
    },
    {
      label: "relEdit(obj,className,runScript)",
      kind: monaco.languages.CompletionItemKind.Function,
      insertText: "relEdit(obj,className,runScript)",
      detail:
        "拉平数据后编辑关联类对象并控制是否执行编辑前后事件\n" +
        "@param obj: 关联类对象拉平数据，left_attr,relation_attr,right_attr\n" +
        "@param className:关联类类名\n" +
        "@param runScript:是否执行编辑前后事件\n" +
        'var obj = this.selectedObj;\n' +
        'obj.relation_ttext = "testEditScript1111";\n' +
        'obj.left_alert="leftalert";\n' +
        'obj.right_addT="right_addT";\n' +
        'result = this.omf.relEdit(this.selectedObj, this.className, false);\n',
    },
    {
      label: "relEdit(obj,className,runScript,attrNames)",
      kind: monaco.languages.CompletionItemKind.Function,
      insertText: "relEdit(obj,className,runScript,attrNames)",
      detail:
        "拉平数据后编辑关联类对象并控制是否执行编辑前后事件,保证值唯一\n" +
        "@param obj: 关联类对象拉平数据，left_attr,relation_attr,right_attr\n" +
        "@param className:关联类类名\n" +
        "@param runScript:是否执行编辑前后事件\n" +
        "@param attrNames:数组，保证属性值唯一的属性名\n" +
        'var obj = this.selectedObj;\n' +
        'obj.relation_ttext = "testEditScript1111";\n' +
        'obj.left_alert="leftalert";\n' +
        'obj.right_addT="right_addT";\n' +
        'result = this.omf.relEdit(this.selectedObj, this.className, false,["left_alert"]);\n',
    },
    {
      label: "relDelete",
      kind: monaco.languages.CompletionItemKind.Function,
      insertText: "relDelete(obj,className)",
      detail:
        "拉平数据后删除关联类对象\n" +
        "@param obj: 关联类对象拉平数据\n" +
        "@param className:关联类类名\n" +
        'var relObj = this.omf.getByOid(this.selectedObj.relation_oid, this.className);\n' +
        'this.omf.relDelete(relObj, this.className);',
    },
    {
      label: "relDelete(obj,className,runScript)",
      kind: monaco.languages.CompletionItemKind.Function,
      insertText: "relDelete(obj,className,runScript)",
      detail:
        "拉平数据后删除关联类对象并控制是否执行删除前后事件\n" +
        "@param obj: 关联类对象拉平数据\n" +
        "@param className:关联类类名\n" +
        "@param runScript:是否执行删除前后事件\n" +
        'var relObj = this.omf.getByOid(this.selectedObj.relation_oid, this.className, true);\n' +
        'this.omf.relDelete(relObj, this.className, false);',
    },


    {
      label: "deleteObjs",
      kind: monaco.languages.CompletionItemKind.Function,
      insertText: "deleteObjs(['oid1','oid2'],className)",
      detail:
        "批量删除对象\n" +
        'this.omf.deleteObjs([\n' +
        '  {oid:"XXX"},\n' +
        '  {oid:"XXX"}],this.className);\n',
    },

    {
      label: "handleQueryData",
      kind: monaco.languages.CompletionItemKind.Function,
      insertText: "handleQueryData(condition, className)",
      detail:
        "使用查询条件进行查询\n" +
        'eg: var objs = this.omf.handleQueryData("and obj.version > 100 order by obj.version limit 5", "yzqrelation");\n' +
        "this.logger.info(JSON.stringify(objs));\n",
    },
    {
      label: "create",
      kind: monaco.languages.CompletionItemKind.Function,
      insertText: "create(obj, className)",
      detail:
        "创建对象\n" +
        "this.omf.create(obj, className);\n",
    },

    {
      label: "create(obj, className, runScript)",
      kind: monaco.languages.CompletionItemKind.Function,
      insertText: "create(obj, className, runScript)",
      detail:
        "创建对象时是否运行创建前/后事件\n" +
        "@param obj: 对象\n" +
        "@param className: 类名\n" +
        "@param runScript: boolean，是否运行创建前/后事件，true/false\n",
    },
    {
      label: "create(obj, className, attrNames)",
      kind: monaco.languages.CompletionItemKind.Function,
      insertText: "create(obj, className, attrNames)",
      detail:
        "对象创建时，attrName值唯一\n" +
        "@param obj: 对象\n" +
        "@param className: 类名\n" +
        '@param attrNames: 数组，填入不允许值重复的属性，例如["woTitle"]',
    },

    {
      label: "create(obj, className, runScrip, attrNames)",
      kind: monaco.languages.CompletionItemKind.Function,
      insertText: "create(obj, className, runScript, attrNames)",
      detail:
        "对象创建时，attrName值唯一，是否调用创建前后事件\n" +
        "@param obj: 对象\n" +
        "@param className: 类名\n" +
        "@param runScript: boolean，是否运行创建前/后事件，true/false\n" +
        '@param attrNames: 数组，填入不允许值重复的属性，例如["woTitle"]\n' +
        'eg: this.omf.create(obj, className, false, ["attrName1", "attrName2"])',
    },

    {
      label: "delete",
      kind: monaco.languages.CompletionItemKind.Function,
      insertText: "delete(obj, className)",
      detail:
        "删除对象\n" +
        "@param obj: 对象\n" +
        "@param className: 类名\n" +
        "eg: this.omf.delete(obj, className);\n",
    },
    {
      label: "delete(obj, className, runScript)",
      kind: monaco.languages.CompletionItemKind.Function,
      insertText: "delete(obj, className, runScript)",
      detail:
        "删除对象，控制是否运行删除前后事件\n" +
        "@param obj: 对象,\n" +
        "@param className: 类名\n" +
        "@param runScript: boolean，是否运行删除前后事件，true/false\n" +
        "eg: this.omf.delete(obj, className, false);\n",
    },
    {
      label: "deleteByCondition",
      kind: monaco.languages.CompletionItemKind.Function,
      insertText: "deleteByCondition(condition, className)",
      detail:
        "按条件删除对象\n" +
        "@param condition: 快速查询条件\n" +
        "@param className: 类名\n" +
        "eg: this.omf.delete(condition, className);\n",
    },
    {
      label: "deleteByCondition(condition, className,runScript)",
      kind: monaco.languages.CompletionItemKind.Function,
      insertText: "deleteByCondition(condition, className,runScript)",
      detail:
        "按条件删除对象并控制执行删除前后事件\n" +
        "@param condition: 快速查询条件\n" +
        "@param className: 类名\n" +
        "@param runScript: boolean，是否运行删除前后事件，true/false\n" +
        "eg: this.omf.delete(condition, className,false);\n",
    },

    {
      label: "edit",
      kind: monaco.languages.CompletionItemKind.Function,
      insertText: "edit(obj, className)",
      detail:
        "编辑对象\n" +
        "@param obj: 对象\n" +
        "@param className: 类名\n" +
        "eg: this.omf.edit(obj, className);\n",
    },

    {
      label: "edit(obj, className, runScript)",
      kind: monaco.languages.CompletionItemKind.Function,
      insertText: "edit(obj, className, runScript)",
      detail:
        "编辑对象，控制是否执行更新前/后事件\n" +
        "@param obj:对象\n" +
        "@param className:类名\n" +
        "@param runScript:boolean，是否执行更新前/后事件true/false\n" +
        "eg: this.omf.edit(obj, className, runScript);\n",
    },
    {
      label: "edit(obj, className, attrNames)",
      kind: monaco.languages.CompletionItemKind.Function,
      insertText: "edit(obj,className,attrNames)",
      detail:
        "编辑对象并保证属性值唯一\n" +
        "@param obj: 对象\n" +
        "@param className: 类名\n" +
        '@param attrNames: 数组，填入不允许值重复的属性，例如["woTitle"]\n' +
        "eg: this.omf.edit(obj, className, runScript, attrNames);\n",
    },
    {
      label: "edit(obj, className, runScript, attrNames)",
      kind: monaco.languages.CompletionItemKind.Function,
      insertText: "edit(obj,className, runScript, attrNames)",
      detail:
        "编辑对象时是否运行删除前/后事件并保证属性值唯一\n" +
        "@param obj: 对象\n" +
        "@param className: 类名\n" +
        "@param runScript:boolean，是否执行更新前/后事件true/false\n" +
        '@param attrNames: 数组，填入不允许值重复的属性，例如["woTitle"]\n' +
        "eg: this.omf.edit(obj, className, runScript, attrNames); \n",
    },
    {
      label: "duplicateValueCheck",
      kind: monaco.languages.CompletionItemKind.Function,
      insertText: "duplicateValueCheck(obj, className, attrNames)",
      detail:
        "单纯判重，获得属性值出现重复值的数组\n" +
        "@param obj: 对象\n" +
        "@param className: 类名\n" +
        '@param attrNames: 数组，填入不允许值重复的属性，例如["woTitle"]\n' +
        "try {\n" +
        '\tvar titles = this.omf.duplicateValueCheck(this.obj, this.className, ["woTitle"]);\n' +
        '\tthis.logger.info("--------" + titles);\n' +
        '}catch(err) { this.ex.setFieldError("error", err.getMessage()); }',
    },

    {
      label: "getString",
      kind: monaco.languages.CompletionItemKind.Function,
      insertText: "getString(oid, className, attrName)",
      detail:
        "返回base64字符串，主要为了配合上传文件使用\n" +
        "@param oid: 主键，支持string/integer\n" +
        "@param className: 类名\n" +
        '@param attrName: 字符串，填入文件的属性名，例如"file"\n' +
        'eg: var attrs = this.omf.getString(this.obj.oid, this.className, "file00");\n',
    },

    {
      label: "getByteArray",
      kind: monaco.languages.CompletionItemKind.Function,
      insertText: "getByteArray(oid, className, attrName)",
      detail:
        "返回base64字符串，主要为了配合上传文件使用\n" +
        "@param oid: 主键，支持string/integer\n" +
        "@param className: 类名\n" +
        '@param attrName: 字符串，填入文件的属性名，例如"file"\n' +
        'var attrs = this.omf.getByteArray(this.obj.oid, this.className, "file00");\n',
    },

    {
      label: "getFilePath",
      kind: monaco.languages.CompletionItemKind.Function,
      insertText: "getFilePath(oid, className, attrName)",
      detail:
        "获取对象的文件路径\n" +
        "@param oid: 主键，支持string/integer\n" +
        "@param className: 类名\n" +
        '@param attrName: 字符串，填入文件的属性名，例如"file00"\n' +
        "// 返回本地文件夹，attrName是localfile\n" +
        'var filePath = this.omf.getFilePath(this.obj.oid, this.className, "file00");\n' +
        'this.logger.info("filePath = " + filePath);',
    },

    {
      label: "setLocalFile",
      kind: monaco.languages.CompletionItemKind.Function,
      insertText: "setLocalFile(oid, className, attrName)",
      detail:
        "为对象上传附件\n" +
        "//返回本地文件夹，attrName是localfile\n" +
        'eg: this.res = this.omf.setLocalFile(this.obj.oid, this.className, "file2", "/home/dwf/fileTest/2.png");\n',
    },
  ];
};

//后端.
const getCustomJavaThisCompletion = (monaco) => {
  return [
    {
      label: "omf",
      kind: monaco.languages.CompletionItemKind.Function,
      insertText: "omf",
      detail:
        "omf是对象管理框架（Object Management Framework）的缩写，是DWF后端用于对对象进行增删改查的函数调用入口\n" +
        "eg:this.omf.getByOid(oid,className);//根据oid获取对象\n" +
        'this.omf.create(obj,classnName);//创建对象',
    },
    {
      label: "obj",
      kind: monaco.languages.CompletionItemKind.Function,
      insertText: "obj.attrName",
      detail: "对象，表单中含有单个对象的时候，通过此变量访问当前对象\n" +
        'eg: this.obj.oid,this.obj.woTitle...',
    },
    {
      label: "oldObj",
      kind: monaco.languages.CompletionItemKind.Function,
      insertText: "oldObj.attrName",
      detail:
        "发生删除或修改的时候原有的对象引用。\n" +
        "实体类.attrNames\n" +
        "关联类.类前缀_attrNames\n" +
        "this.oldObj.relation_关联类属性名\n" +
        "this.oldObj.left_左类属性名\n" +
        "this.oldObj.right_右类属性名",
    },
    {
      label: "objs",
      kind: monaco.languages.CompletionItemKind.Function,
      insertText: "objs[index].attrName",
      detail:
        "获取当前对象集合中实体类对象的属性值\n" +
        "实体类.attrNames\n" +
        "关联类.类前缀_attrNames\n" +
        "this.objs[index].attrNames\n" +
        "this.objs[index].relation_关联类属性名\n" +
        "this.objs[index].left_左类属性名\n" +
        "this.objs[index].right_右类属性名",
    },
    {
      label: "oldObjs",
      kind: monaco.languages.CompletionItemKind.Function,
      insertText: "oldObjs[index].attrName",
      detail:
        "获取当前对象集合中实体类对象的属性值\n" +
        "实体类.attrNames\n" +
        "关联类.类前缀_attrNames\n" +
        "this.oldObjs[index].attrNames\n" +
        "this.oldObjs[index].relation_关联类属性名\n" +
        "this.oldObjs[index].left_左类属性名\n" +
        "this.oldObjs[index].right_右类属性名",
    },
    {
      label: "env",
      kind: monaco.languages.CompletionItemKind.Module,
      insertText: "env",
      detail:
        "包含了DWF前端的上下文信息\n" +
        '// 字符串，获取DWF服务器ip\n' +
        "serverIp: this.env.serverIp; \n" +
        '// 字符串，获取DWF服务器端口号\n' +
        "serverPort: this.env.serverPort; \n" +
        "// 字符串，获取访问DWF服务器的url地址\n" +
        "serverURL: this.env.serverURL;\n" +
        "// 字符串，服务器元数据服务端口\n" +
        "metaServicePort: this.env.metaServicePort; \n" +
        "// 字符串，服务器对象数据服务端口\n" +
        "objServicePort: this.env.objServicePort; \n" +
        "// 字符串，获取用户自定义配置信息\n" +
        "appConfig[index]: this.env.appConfig[index].name; ",
    },
    {
      label: "className",
      kind: monaco.languages.CompletionItemKind.Function,
      insertText: "className",
      detail:
        "获取当前类名\n" +
        "this.className",
    },
    {
      label: "ex",
      kind: monaco.languages.CompletionItemKind.Module,
      insertText: "ex",
      detail:
        "当执行后端脚本需要在前端用message信息弹出报错信息时，使用this.ex抛出异常，可自定义设置报错信息\n" +
        "eg: this.ex.setFieldError(field, message);",
    },
    {
      label: "websocket",
      kind: monaco.languages.CompletionItemKind.Module,
      insertText: "websocket",
      detail:
        "双向通讯通道websocket\n" +
        '// 获取socketId\n' +
        "this.websocket.socketId; \n" +
        "// 检查socketId是否存在\n" +
        "this.websocket.checkSockIdExists(); \n" +
        "// 获取最近一次收到的消息\n" +
        "this.websocket.getMsg(); \n" +
        "// 向当前socketId发送消息\n" +
        "this.websocket.sendMsg(obj); ",
    },
    {
      label: "customData",
      kind: monaco.languages.CompletionItemKind.Function,
      insertText: "customData",
      detail:
        "自定义内容\n" +
        'this.logger.info("拿到表单自定义属性字段" + this.customData);',
    },
    {
      label: "selectedObjs",
      kind: monaco.languages.CompletionItemKind.Function,
      insertText: "selectedObjs",
      detail:
        "当DWF前端表单中存在多对象控件，例如：会自动将表单设定的缺省表格中被选中的对象作为数组回传\n" +
        'this.logger.info("当前对象的oid属性值为" + this.selectedObjs[index].oid);',
    },
    {
      label: "em",
      kind: monaco.languages.CompletionItemKind.Module,
      insertText: "em.createNativeQuery(sqlString)",
      detail:
        "数据库中的实体管理器（Entity Manager）的缩写，专门用于封装底层数据库的调用\n" +
        "function id() {\n" +
        "\treturn (((1+Math.random())*0x10000)|0).toString(16).substring(1);\n" +
        "}\n" +
        "// 利用hibernate的em对象执行SQL\n" +
        "this.em.createNativeQuery(\"insert into public.plt_org_user(plt_oid, plt_creator, plt_lastmodifier, plt_name, plt_displayname) values ('\" + id() + \"', '9C92E891E9AE534DB685737DE467A9D0', '9C92E891E9AE534DB685737DE467A9D0', 'testServerScript', '测试服务端脚本')\").executeUpdate();",
    },
    {
      label: "selectedObj",
      kind: monaco.languages.CompletionItemKind.Function,
      insertText: "selectedObj",
      detail:
        "获取选中对象\n" +
        'this.logger.info("当前对象的oid属性值为" + this.selectedObj.oid);',
    },
    {
      label: "sh",
      kind: monaco.languages.CompletionItemKind.Function,
      insertText: "sh.execute()",
      detail:
        "对象，用于启动操作系统内部的命令行脚本\n" +
        "// 执行linux服务命令\n" +
        'this.sh.execute("cd /home/dwf && touch " + _obj.oid + "-" + _env.userName);\n' +
        "// 执行Windows命令\n" +
        'this.exeCmd("cd d:\\mp3 ")',
    },
    {
      label: "user",
      kind: monaco.languages.CompletionItemKind.Module,
      insertText: "user",
      detail:
        "对象，表示当前登录用户，用户具备的属性和前端脚本中this.user具备的属性一致\n" +
        "// 获取当前用户token\n" +
        "token: this.user.token; \n" +
        "// 获取当前用户oid\n" +
        "oid: this.user.oid; \n" +
        " // 获取当前用户userId（同oid）\n" +
        "userId: this.user.userId;\n" +
        "// 获取当前用户英文名userName\n" +
        "userName: this.user.userName; \n" +
        "// 获取当前用户显示名displayName\n" +
        "displayName: this.user.displayName; \n" +
        "// 用户所属用户组集第一个用户组的英文名\n" +
        "userGroups: this.user.userGroups[0].name; ",
    },

    {
      label: "generateUUID",
      kind: monaco.languages.CompletionItemKind.Function,
      insertText: "generateUUID()",
      detail:
        "生成uuid的函数\n" +
        "this.generateUUID()",
    },
    {
      label: "logger",
      kind: monaco.languages.CompletionItemKind.Function,
      insertText: "logger.info(msg)",
      detail:
        "对象，用于进行调试的脚本\n" +
        'this.logger.info("这是一条重要信息");\n' +
        'this.logger.error("这是一条错误信息");\n' +
        'this.logger.warn("这是一条警告信息");',
    },
    {
      label: "restTemplate",
      kind: monaco.languages.CompletionItemKind.Module,
      insertText: "restTemplate.getForEntity()",
      detail:
        "http接口请求\n" +
        'this.logger.info("Get请求，获取Json响应");\n' +
        "// 如果返回结果是json，response建议反序列化为Map，从而可以用.直接访问属性\n" +
        'var get_response = this.restTemplate.getForEntity("http://ip:port/test/get-admin-token", java.util.Map.class); \n' +
        "var get_response_body = get_response.getBody();\n" +
        'this.logger.info("body: " + get_response_body);\n' +
        "// 访问Json中的属性\n" +
        'this.logger.info("body.message: " + get_response_body.get("message"));\n' +
        "\n" +
        "var Map = Java.type('java.util.Map');\n" +
        'this.logger.info("Post请求，传递request body，获取json响应");\n' +
        'var request_body = {"name" : "hahahaname"};\n' +
        'var post_response = this.restTemplate.postForEntity("http://127.0.0.1:6060/dwf/v1/testPost", request_body, Map.class);\n' +
        "var post_response_body = post_response.getBody();\n" +
        'this.logger.info("body: "+ post_response_body)',
    },
  ];
};

//后端env.
const getCustomJavaEnvCompletion = (monaco) => {
  return [
    {
      label: "serverIp",
      kind: monaco.languages.CompletionItemKind.Function,
      insertText: "serverIp",
      detail:
        "字符串，获取DWF服务器ip\n" +
        "eg: this.env.serverIp",
    },
    {
      label: "serverPort",
      kind: monaco.languages.CompletionItemKind.Function,
      insertText: "serverPort",
      detail:
        "字符串，获取DWF服务器端口号\n" +
        "eg: this.env.serverPort",
    },
    {
      label: "serverURL",
      kind: monaco.languages.CompletionItemKind.Function,
      insertText: "serverURL",
      detail:
        "字符串，获取访问DWF服务器的url地址\n" +
        "eg: this.env.serverURL",
    },
    {
      label: "metaServicePort",
      kind: monaco.languages.CompletionItemKind.Function,
      insertText: "metaServicePort",
      detail:
        "字符串，服务器元数据服务端口\n" +
        "eg: this.env.metaServicePort",
    },
    {
      label: "objServicePort",
      kind: monaco.languages.CompletionItemKind.Function,
      insertText: "objServicePort",
      detail:
        "字符串，服务器对象数据服务端口\n" +
        "eg: this.env.objServicePort",
    },
    {
      label: "appConfig[index]",
      kind: monaco.languages.CompletionItemKind.Module,
      insertText: "appConfig[index]",
      detail:
        "字符串，获取用户自定义配置信息\n" +
        "eg: this.env.appConfig[index].name",
    },
  ];
};

//后端ex.
const getCustomJavaExCompletion = (monaco) => {
  return [
    {
      label: "setFieldError",
      kind: monaco.languages.CompletionItemKind.Function,
      insertText: "setFieldError(field, message)",
      detail:
        "当执行后端脚本需要在前端用message信息弹出报错信息时，使用this.ex抛出异常，可自定义设置报错信息\n" +
        "@param field：自定义，例如\"报错信息是\"\n" +
        "@param message：自定义，可以try catch异常后，将异常抛出，err.getMessage()\n" +
        "try { this.omf.getByOid(\"1\", this.className); }\n" +
        "catch (err) { this.ex.setFieldError(\"报错消息是\", err.getMessage()) }",
    },
    {
      label: "setNotNullableError",
      kind: monaco.languages.CompletionItemKind.Function,
      insertText: "setNotNullableError(field)",
      detail:
        "当执行后端脚本需要在前端用message信息弹出报错信息时，使用this.ex抛出不能为空的异常报错提示\n" +
        "@param field：自定义，例如可以设置某个字段不能为空this.obj.oid，也可以设置文字\n" +
        "var obj = this.omf.getByOid(\"s7w7b039300\", this.className)\n" +
        "// 如果对象存在就设置woTitle属性为“工单1”，否则抛出不能为空的异常\n" +
        "if (!obj) obj.woTitle = \"工单1\";\n" +
        "else this.setNotNullableError(msg);",
    },
  ];
};

//后端user.
const getCustomJavaUserCompletion = (monaco) => {
  return [
    {
      label: "userId",
      kind: monaco.languages.CompletionItemKind.Function,
      insertText: "userId",
      detail: "获取当前用户userId（同oid）" +
        "eg: this.user.userId; ",
    },
    {
      label: "token",
      kind: monaco.languages.CompletionItemKind.Function,
      insertText: "token",
      detail:
        "获取当前用户token\n" +
        "eg: this.user.token; ",
    },
    {
      label: "userName",
      kind: monaco.languages.CompletionItemKind.Function,
      insertText: "userName",
      detail:
        "获取当前用户英文名userName\n" +
        "eg: this.user.userName;",
    },
    {
      label: "oid",
      kind: monaco.languages.CompletionItemKind.Function,
      insertText: "oid",
      detail:
        "获取当前用户oid(同userId)\n" +
        "eg: this.user.oid;",
    },
    {
      label: "displayName",
      kind: monaco.languages.CompletionItemKind.Function,
      insertText: "displayName",
      detail:
        "获取当前用户显示名displayName\n" +
        "eg: this.user.displayName;",
    },
    {
      label: "userGroups",
      kind: monaco.languages.CompletionItemKind.Module,
      insertText: "userGroups[0]",
      detail:
        "数组，用户所属用户组集第一个用户组信息\n" +
        " // 获取所属用户组集第一个用户组的英文名\n" +
        "eg: this.user.userGroups[0].name;" +
        " // 获取所属用户组集第一个用户组的oid\n" +
        "eg: this.user.userGroups[0].oid;" +
        " // 获取所属用户组集第一个用户组的备注\n" +
        "eg: this.user.userGroups[0].comment;",
    },
  ];
};

//后端websocket.
const getCustomJavaWebsocketCompletion = (monaco) => {
  return [
    {
      label: "sendMsg",
      kind: monaco.languages.CompletionItemKind.Function,
      insertText: "sendMsg(msg)",
      detail:
        "向当前socketId发送消息\n" +
        "eg: this.websocket.sendMsg(msg)",
    },
    {
      label: "getLastMsg",
      kind: monaco.languages.CompletionItemKind.Function,
      insertText: "getLastMsg()",
      detail: "返回socket最后一个消息\n" +
        "eg: this.websocket.getLastMsg()",
    },
    {
      label: "sockId",
      kind: monaco.languages.CompletionItemKind.Function,
      insertText: "sockId",
      detail: "返回当前socketId\n" +
        "eg: this.websocket.sockId",
    },
    {
      label: "getMsg",
      kind: monaco.languages.CompletionItemKind.Function,
      insertText: "getMsg()",
      detail: "获取消息\n" +
        "eg: this.websocket.getMsg()",
    },

  ];
};

//超级控件.
const getCustomHTMLThisCompletion = (monaco) => {
  return [
    {
      label: "dwf_ctx",
      kind: monaco.languages.CompletionItemKind.Function,
      insertText: "dwf_ctx",
      detail: "在超级控件里访问是DWF提供的数据访问DWF的服务\n" +
        "let dwf_ctx = window.parent.dwf_ctx;",
    },
  ];
};


window.DWFMONACOEDITOR = {
  getCustomCompletionJS: getCustomCompletionJS,
  getCustomJavaOmfCompletion: getCustomJavaOmfCompletion,
  getCustomCompletionMsgBox: getCustomCompletionMsgBox,
  getCustomJavaThisCompletion: getCustomJavaThisCompletion,
  getCustomJavaEnvCompletion: getCustomJavaEnvCompletion,
  getCustomJavaExCompletion: getCustomJavaExCompletion,
  getCustomJavaUserCompletion: getCustomJavaUserCompletion,
  getCustomCompletionUser: getCustomCompletionUser,
  getCustomCompletionArgs: getCustomCompletionArgs,
  getCustomCompletionEnv: getCustomCompletionEnv,
  getCustomJavaWebsocketCompletion: getCustomJavaWebsocketCompletion,
  getCustomHTMLDwfCtxCompletion: getCustomHTMLDwfCtxCompletion,
  getCustomHTMLThisCompletion: getCustomHTMLThisCompletion,
};
