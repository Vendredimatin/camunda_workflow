<template>
    <section :addinName="name" ref="main" class="self-searchBox" v-show="!args.hided" :style="{'width': colWidth}">
        <span>
             <Row class="seach-wrap" :gutter="16">
                <Col span="19" ref="attrWrap" :dropTarget="name" style="min-height: 50px; height: auto;display: flex; align-items: center;flex-wrap: wrap;">
                    <!-- <label v-if="args.label">{{ args.label }}:  </label>
                    <Input suffix="ios-search" placeholder="Show Mode" style="width: auto" /> -->
                </Col>
                <Col span="5">
                    <Button class="searchBtn" type="info" style="margin-right: 5px;" @click="getTargetClassAttr" :disabled="args.readonly">{{ args.buttonTxt }}</Button>
                    <Button class="searchBtn" @click="resetQueryBox" :disabled="args.readonly">{{ args.buttonReset }}</Button>
                </Col>
            </Row>
        </span>
    </section>
</template>

<script>
    /*
        插件的js部分
        如果有引用依赖等，在export default 之前进行引用
    */
    import '@/styles/component/iconfont.css';
    import { getAddinFunc } from "@/util/addin.js";
    import { getClass } from "@/api/others.js";
    const name = "SearchBox";
    export default {
        // 插件名
        name: name,
        // 属性值传入
      props: [
        'argsProps',
        'query',
        'itemValue',
        'formEngine',
        'dwf_ctx',
      ],
        // 插件的数据逻辑，插件的属性在data中定义，用在js中用this.xxx进行访问
        data() {
            let _self = this;
            return {
                // 插件名
                name: name,

                // 展示模式
                t_create: false,
                t_edit: false,
                t_visit: true,

                // 支持的数据类型
                dataTypes: ['String', 'Integer', 'Boolean', 'Long', 'UUID', 'Date', 'Double', 'Clob', 'TimeStamp'],
              structuralLayoutAddin: ['TextInput', 'HyperLink', 'NumberInput', 'DateInput', 'CheckBox', 'RadioButton', 'Label', 'Switch', 'SelectInput', 'SelectSInput', 'SingleObjectSelector', 'SingleObjectModal', 'MultiObjectsTag', 'ProgressBar', 'D_Rate', 'Liked', 'icon', 'DynamicParameterFrame', 'MultiFilesList', 'Attachments'], //允许垂直布局的控件，为之前做兼容

                // 编辑框
                args: {
                    width: 100,
                    widthType: '%',
                    title: '查询框',
                    id: null,
                    labelDisabled: false,
                    noNumber: true,
                    label: "",
                    style: "",
                    targetDataType: null,
                    unitInputWidth: 33,
                    buttonTxt: '查询',
                    buttonReset: '重置',
                    readonly: false, // 是否只读
                    hided: false,

                    selectAttr: [],
                    chooseTable: [],      // 所选的控制表格
                    oldChooseTable: [],

                    dataAttr: []
                },

                //值变化
                vChange: null,

                basicArgs: {
                    label_width: 2,
                    main_width: 3,
                    label_align: 4,
                    main_align: 4,
                    basic_height: 30,
                    cols: 3
                },

                tableList: [],
                tableMap: {},

                showQuery: false,
                spinShow: false,
                // 该flag代表, 用户定制搜索框后去掉所有勾选 给他个警告即将清空所有配置的属性控件
                showPop: false,

                checkClassGroup: [],
                classGroup: [],
                classIndex: {},
                classAttr: {},
                oldChooseTable: [],
                dataAttr: [],
                attrMap: {},
                queryAttr: [],
                domMap: {},

                attrItems: [
                    {
                        value: 'TextInput',
                        label: '普通文本框'
                    },
                    {
                        value: 'NumberInput',
                        label: '数字文本框'
                    },
                    {
                        value: 'NumbersInput',
                        label: '数字范围选择框',
                    },
                    {
                        value: 'DateInput',
                        label: '日期选择框'
                    },
                    {
                        value: 'DateSInput',
                        label: '日期范围选择框'
                    },
                    {
                        value: 'SelectInput',
                        label: '单选选择文本框'
                    },
                    {
                        value: 'SelectMutiInput',
                        label: '多选选择文本框'
                    },
                    {
                        value: 'DSelectInput',
                        label: '动态选择框',
                    },
                    {
                        value: 'SingleObjectSelectors',
                        label: '对象选择框'
                    },
                    {
                        value: 'Switch',
                        label: '布尔选择框'
                    }
                ],

                columnsAttr: [
                    {
                        type: 'selection',
                        width: 60,
                        align: 'center'
                    },
                    {
                        title: '所属类',
                        key: 'belongClass',
                        width: 200,
                        tooltip: true,
                        align: 'center'
                    },
                    {
                        title: '属性名',
                        key: 'attrName',
                        width: 200,
                        tooltip: true,
                        align: 'center'
                    },
                    {
                        title: '顺序',
                        width: 100,
                        key: 'attrNum',
                        align: 'center',
                        render: (h, params) => {

                            return h('Input', {

                                props: {
                                    type: 'Number',
                                    value: this.dataAttr[params.index].attrNum
                                },
                                on: {
                                    'on-change': (event) => {
                                        params.row.attrNum = event.target.value;
                                        // this.classAttr[params.row.className][params.row.index].attrNum = event.target.value;
                                    },
                                    'on-blur': () => {
                                        this.classAttr[params.row.className][params.row.index].attrNum = params.row.attrNum;
                                    }
                                }
                            })

                        }
                    },
                    {
                        title: '标签',
                        key: 'label',
                        width: 200,
                        align: 'center',
                        render: (h, params) => {
                            return h('Input', {
                                props: {
                                    value: this.dataAttr[params.index].label,
                                },
                                on: {
                                    'on-change': (event) => {
                                        params.row.label = event.target.value;
                                        // this.classAttr[params.row.className][params.row.index].label = event.target.value;
                                    },
                                    'on-blur': () => {
                                        this.classAttr[params.row.className][params.row.index].label = params.row.label;
                                    },
                                }
                            })
                        }
                    },
                    {
                        title: '显示类型',
                        width: 200,
                        key: 'attrType',
                        align: 'center',
                        render: (h, params) => {

                            return h('Select', {

                                props: {
                                    value: this.dataAttr[params.index].attrType
                                },
                                on: {
                                    'on-change': (value) => {
                                        params.row.attrType = value;
                                        this.classAttr[params.row.className][params.row.index].attrType = value;
                                    },
                                    // 'on-blur': () => {
                                    //     console.log('type blur', params.row);
                                    //     this.classAttr[params.row.className][params.row.index].attrType = params.row.attrType;
                                    // },
                                }
                            },
                                this.attrItems.map((item) => {
                                    return h('Option', {
                                        props: {
                                            value: item.value,
                                            label: item.label
                                        }
                                    })
                                })
                            )

                        }
                    },
                    {
                        title: '配置参数',
                        width: 200,
                        key: 'defaultValue',
                        align: 'center',
                        render: (h, params) => {

                            return h('Input', {

                                props: {
                                    value: this.dataAttr[params.index].defaultValue
                                },
                                on: {
                                    'on-change': (event) => {
                                        params.row.defaultValue = event.target.value;
                                        // this.classAttr[params.row.className][params.row.index].defaultValue = event.target.value;
                                    },
                                    'on-blur': () => {
                                        this.classAttr[params.row.className][params.row.index].defaultValue = params.row.defaultValue;
                                    },
                                }
                            })

                        }
                    }
                ],

            }
        },

      inject:[
        'getEn',
        'getJsonData',
        'getParentJson',
        'getObj',
        'GetAddinById',
        'GetAddinByUUID',
        'GetAllAddin',
        'getParentAddin',
        '_getViewData',
        '_getViewDataByAttrs',
        'handleQueryData',
        'getClassObject',
        'getRClassObject',
        'invokeOperation',
        'parseEscapeString',
        'handleScript',
        'addExtraObj',
        'getEventOperation',
        'invokeEvent',
      ],
      // 生命周期函数，在获取数据和事件函数后调用，
      created() {
        //通过prop给控件初始化
        this.setDisplayType(this.query.displayType);
        this.setArgs(this.argsProps);

        },

        computed: {
            colWidth() {
                return this.args.width + this.args.widthType;
            }
        },

        mounted() {
            let that = this;
            that.confirmDom();
            setTimeout(() => {
                that.freshTable();
            }, 300);

            if(this.args.events && this.args.events.length > 0) {

                this.vChange = this.args.events.find((val) => {
                    return val.name == '值变化'
                })

            }

        },

        // 定义组件的函数接口
        methods: {
            updateAttrConflict(row) {
                let that = this;
                this.attrMap[row.attrName.substring(0, row.attrName.indexOf("&"))].forEach(x => {
                    that.dataAttr[that.classIndex[x.className] + x.index]._disabled = row._checked;
                });
            },

            freshClassAttr() {
                let that = this;
                if (that.classAttr._all) delete that.classAttr._all;
                that.attrMap = {};
                that.classGroup = [];
                var classMap = {};
                that.oldChooseTable = [];
                that.args.chooseTable.forEach(x => {
                    that.oldChooseTable.push(x);
                    var attrMap = that.tableMap[x].getAttrMap();
                    attrMap.forEach(y => {
                        if (y.className in classMap) return;
                        that.classGroup.push({ className: y.className, displayName: y.displayName, label: `${y.className}(${y.displayName})` });
                        classMap[y.className] = 1;
                        var flag = true;
                        if (y.className in that.classAttr) flag = false;
                        if (flag) that.classAttr[y.className] = [];
                        if(y.attributes != undefined) {
                            y.attributes.forEach((z, index) => {
                                if (flag)
                                    that.classAttr[y.className].push({
                                        belongClass: `${y.className}(${y.displayName})`,
                                        attrName: `${z.attributeName}&${z.displayName}`,
                                        attrType: 'TextInput',
                                        valueType: z.valueType,
                                        defaultValue: '',
                                        index: index,
                                        className: y.className,
                                        label: `${y.displayName}.${z.displayName}`,
                                    })
                                if (!(z.attributeName in that.attrMap)) {
                                    that.attrMap[z.attributeName] = []
                                } else if (that.attrMap[z.attributeName].length == 1) {
                                    if (!("_all" in that.classAttr)) {
                                        that.classAttr._all = [];
                                    }
                                    that.classAttr._all.push({
                                        belongClass: "",
                                        attrName: `${z.attributeName}&${z.displayName}`,
                                        attrType: 'TextInput',
                                        valueType: z.valueType,
                                        defaultValue: '',
                                        index: index,
                                        className: "_all",
                                        label: z.displayName,
                                    })
                                }
                                that.attrMap[z.attributeName].push({ className: y.className, index: index });
                            });
                        }
                    });
                });
                if (that.classAttr._all) {
                    that.classAttr._all.forEach(x => {
                        var belongClass = "重复属性(";
                        that.attrMap[x.attrName.substring(0, x.attrName.indexOf("&"))].forEach(y => {
                            belongClass += y.className + ",";
                        })
                        belongClass = belongClass.substring(0, belongClass.length-1) + ")";
                        x.belongClass = belongClass;
                    });
                    that.classGroup.splice(0, 0, {
                        className: "_all", displayName: "重复属性", label: "重复属性"
                    });
                }
                that.checkClassGroup = [];
                that.dataAttr = [];
                that.classGroup.forEach(x => {
                    that.classIndex[x.className] = that.dataAttr.length;
                    that.checkClassGroup.push(x.label);
                    that.dataAttr = that.dataAttr.concat(that.classAttr[x.className]);
                });
            },

            freshTable() {
                this.tableList = this.getTables(this.itemValue.data);
                this.tableMap = {};
                let that = this;
                this.tableList.forEach(x => {
                    that.tableMap[x.obj.args.id] = x.obj;
                })
            },

            getTables(node) {
                var res = [];
                if (node.obj && node.obj.getSelected) {
                    res.push({
                        obj: node.obj,
                        label: node.self.properties.name,
                        value: node.self.uuid
                    });
                }
                if (node.elements) {
                    for (var i = 0;i < node.elements.length;i++) {
                        res = res.concat(this.getTables(node.elements[i]));
                    }
                }
                return res;
            },

            // 获取控件属性值
            getValue() {
                return this.args.queryObj;
            },

            // 设置控件属性值,item是查询到的对象数组
            setValue(item) {
                return item;
            },

            // 是否允许往里添加元素,null为不允许，[]为允许全部，非空为允许部分
            getAllow() {
                return null;
            },

            // 获取编辑框内容
            getArgs() {
                return this.args;
            },

            // 设置基本属性
            setArgs(args) {
                for (var i in args) {
                    this.args[i] = args[i];
                }
                for (var i in this.basicArgs) {
                    if (i in this.args)
                        this.basicArgs[i] = this.args[i];
                }
                return this;
            },

            // 获取表单项名
            getFormName() {
                return this.args.name;
            },

            // 获取插件的属性编辑框的dom元素
            getEditBox(args) {
                this.t_edit = true;
                return this.$refs.edit;
            },

            // 获取插件名
            getName() {
                return name;
            },

            setDisplayType(type) {
                this.t_create = false;
                this.t_edit = false;
                this.t_visit = false;
                if (type == "create") {
                    this.t_create = true;
                }
                else if (type == "edit") {
                    this.t_edit = true;
                }
                else if (type == "visit") {
                    this.t_visit = true;
                }
                return this;
            },

            setError(error) {
                var dom = this.$refs.main.querySelector(".i-input .ivu-input");
                if (dom) dom.style.borderColor = error ? "red" : null;
            },
            validate() {
                return true;
            },

            // 设置插件支持的数据类型，返回类型为数据类型的列表
            getDataType(args) {
                return this.dataTypes;
            },

            // 条件配置弹窗
            queryModal() {
                let that = this;

                // 定制弹窗前 需先选择需要控制的表格
                if (this.args.chooseTable.length == 0) {
                    this.$Notice.warning({
                        title: '提示',
                        desc: '请先选择需要控制的表格名称'
                    });
                } else {

                    this.showQuery = true;
                    this.spinShow = true;

                    var flag = false;
                    for (var i = 0;i < that.args.chooseTable.length;i++) {
                        if (that.oldChooseTable[i] != that.args.chooseTable[i]) {
                            flag = true;
                            break;
                        }
                    }
                    if (flag) that.freshClassAttr();

                    this.spinShow = false;
                }

            },

            // 生成弹窗全部类的属性内容
            createModal() {
                const temAttr = [];
                this.allAttrMap.forEach((val, index) => {
                    val.attributes.forEach((item, index) => {
                        let eachAttr = {
                            belongClass: `${val.className}(${val.displayName})`,
                            attrName: `${item.attributeName}&${item.displayName}`,
                            attrType: 'TextInput',
                            valueType: item.valueType,
                            defaultValue: ''
                        }
                        temAttr.push(eachAttr);
                    })
                })

                temAttr.forEach((item, index) => {
                    item.rowIndex = index;
                    item.attrNum = index;
                })

                this.args.dataAttr = temAttr;
                this.temDataAttr = temAttr;
            },

            // 单击行勾选当前行
            checkSelect(data, index) {
                this.$refs.attrTable.toggleSelect(index);
            },

            // 取消全选
            changeAttr(data) {
                if (data.length == 0) {
                    let that = this;
                    that.checkClassGroup.forEach(x => {
                        var className = "_all";
                        if (x.substring(0, 4) != "重复属性") className = x.substring(0, x.indexOf("("));
                        that.classAttr[className].forEach(y => {
                            y._checked = false;
                        })
                        if (className == "_all") {
                            that.classAttr[className].forEach(y => {
                                that.updateAttrConflict(y);
                            });
                        }
                    })
                }
            },

            // 全选属性
            chooseAttrAll(data) {
                let that = this;
                data.forEach(x => {
                    that.classAttr[x.className][x.index]._checked = true;
                    if (that.className == "_all") that.updateAttrConflict(that.classAttr[x.className][x.index]);
                });
            },

            // 选择属性
            chooseAttr(data, row) {
                this.classAttr[row.className][row.index]._checked = true;
                if (row.className == "_all") this.updateAttrConflict(this.classAttr[row.className][row.index]);
                // this.selectAttr = data;
                this.showPop = false;
            },

            // 取消选择属性
            cancelAttr(data, row) {
                if(data.length == 0) this.showPop = true;
                // this.selectAttr = data;
                this.classAttr[row.className][row.index]._checked = false;
                if (row.className == "_all") this.updateAttrConflict(this.classAttr[row.className][row.index]);
            },

            // 确认生成
            confirmQuery() {
                let that = this;
                that.args.selectAttr = [];
                this.checkClassGroup.forEach(x => {
                    var className = "_all";
                    if (x.substring(0,4) != "重复属性") className = x.substring(0, x.indexOf("("));
                    that.classAttr[className].filter(y => y._checked).forEach(y => that.args.selectAttr.push(y));
                });

                    this.confirmDom();
            },

            // 置空包裹器
            confirmDom() {
                let wrapBox = this.$refs.attrWrap.$el;
                for (var i = wrapBox.children.length;i > 0;i--) {
                    wrapBox.removeChild(wrapBox.children[i-1]);
                }

                function sortAttrNum(a,b) {
                    return parseInt(a.attrNum) - parseInt(b.attrNum);
                }
                let that = this;
                var _type = 1;
                this.args.selectAttr.sort(sortAttrNum);
                this.queryAttr = [];
                this.args.selectAttr.forEach(x => {
                    if (x.className == "_all") {
                        var _class = x.belongClass.substr(5, x.belongClass.length-6).split(",");
                        _class.forEach(y => {
                            that.queryAttr.push({
                                ...x,
                                className: y
                            });
                        });
                    } else {
                        that.queryAttr.push(x);
                    }
                    let attrType = x.attrType;
                    if (attrType == 'DSelectInput') attrType = 'SelectSInput';
                    if (attrType == 'SelectMutiInput') attrType = 'SelectInput';
                    var _dom = getAddinFunc(attrType, "form");
                    let value = x.defaultValue;
                    if (value == "") value = null;
                    _dom = new _dom({
                      propsData: {
                        itemValue: this.itemValue,
                        formEngine: this.formEngine,
                        argsProps: {},
                        query: {
                          displayType: 'create'
                        }
                      },
                      provide: {
                        getEn: this.getEn,
                        getJsonData: this.getJsonData,
                        getParentJson: this.getParentJson,
                        getObj: this.getObj,
                        GetAddinById: this.GetAddinById,
                        GetAddinByUUID: this.GetAddinByUUID,
                        GetAllAddin: this.GetAllAddin,
                        getParentAddin: this.getParentAddin,
                        _getViewData: this._getViewData,
                        _getViewDataByAttrs: this._getViewDataByAttrs,
                        handleQueryData: this.handleQueryData,
                        getClassObject: this.getClassObject,
                        getRClassObject: this.getRClassObject,
                        invokeOperation: this.invokeOperation,
                        parseEscapeString: this.parseEscapeString,
                        handleScript: this.handleScript,
                        addExtraObj: this.addExtraObj,
                        getEventOperation: this.getEventOperation,
                        invokeEvent: this.invokeEvent,
                      }
                    }).setDisplayType(_type).setArgs({ label: x.label, width: this.args.unitInputWidth || '33' }).setArgs(this.basicArgs);
                    //控件水平布局兼容
                    if(attrType && this.structuralLayoutAddin.includes(attrType)){
                      _dom.setArgs({ structural_layout: 'horizontal' });
                    }
                    if (x.attrType == "SelectInput") {
                        if (value) {
                            _dom.setArgs({ selfOptions: value });
                            _dom.createOptions();
                        }
                    } else if (x.attrType == "DateInput") {
                        _dom.setArgs({ defaultDateType: 'datetime', format: "yyyy-MM-dd HH:mm:ss" });
                    } else if (x.attrType == "SelectMutiInput") {
                        if (value) {
                            _dom.setArgs({ selectMuti: true, selfOptions: value });
                            _dom.createOptions();
                        }
                    } else if (x.attrType == 'DSelectInput') {
                        _dom.initDOptions(x.className, x.attrName.split('&')[0]);
                    } else if (x.attrType == "SingleObjectSelectors") {
                        if (value) {

                            if(value != '' && value != undefined) {
                                let resultArr = JSON.parse(value);
                                let tClass = resultArr.extendClass;
                                let bAttributes = resultArr.extendAttr;
                                let rFormat = resultArr.extendReturnAttr;
                                console.log(value,resultArr,tClass,bAttributes,rFormat)
                                _dom.setArgs({ bindTargetClass: tClass, browseAttributes: bAttributes, returnSelectFormat: bAttributes, noNumber: x.noNumber, returnFormat: rFormat});
                            } else {
                                console.log(value)
                            }

                        }
                    } else if (value) _dom.setValue(value);
                    var dom = _dom.$mount().$el;
                    dom.classList.add("margin1");
                    that.domMap[x.className + "&" + x.index] = _dom;
                    wrapBox.appendChild(dom);
                });
                that.showQuery = false;
            },

            // 确认清空
            confirmEmpty() {
                // 置空包裹器
                this.confirmDom();
                this.showQuery = false;
                this.showPop = false;

                // 置空数据
                this.selectAttr = [];
                this.args.recoverAttr = [];

                this.args.dataAttr = [];
                this.createModal();
            },

            // 取消清空
            cancelEmpty() {
                this.args.recoverAttr.forEach((item, index) => {
                    this.$refs.attrTable.toggleSelect(item.rowIndex);
                })
            },

            // 获取全部查询属性
            async getTargetClassAttr() {

                let oprAttr = null;
                if(this.vChange) {
                    oprAttr = await this.invokeOperation(this.vChange.opr_type, this.vChange.opr_path, this.itemValue, this.store);
                }

                let that = this;
                this.queryAttr.forEach(x => {
                    var _id = x.className;
                    if (x.belongClass.substring(0,4) == "重复属性") _id = "_all";
                    _id += "&" + x.index;
                    x.value = that.domMap[_id].getValue();
                });

                let finalQuery = null;
                if(oprAttr && oprAttr instanceof Array && oprAttr.length > 0) {

                    finalQuery = that.queryAttr.concat(oprAttr);

                } else {
                    finalQuery = that.queryAttr;
                }
                console.log(finalQuery)
                this.args.chooseTable.forEach(async x => {
                    if(x.indexOf('FormEngine') > -1){
                        finalQuery = await this.handleQueryObj(finalQuery, that.tableMap[x])
                        that.tableMap[x].freshData(finalQuery);
                    }else{
                        that.tableMap[x].freshData(finalQuery);
                    }

                });

                var queryStr = await this._handleQueryObj(finalQuery, this);

                this.getCharts(this.itemValue.data.elements).forEach(x => x.refreshChart(queryStr));

            },
          async handleQueryObj(query, that){
              debugger
            let _ret = "";
            let _comret = '';
            let _class;
            let _str = ["String", "UUID", "Clob", "Date", "TimeStamp"];
            let _int = ["Integer", "Long", "Double"];
            if (that.isRelation){
                _class = [
                `left_${that.relation.leftClass}`,
                `right_${that.relation.rightClass}`,
                that.relation.className
                ];
            } else {
                _class = [that.targetClass];
            }
            for (var i=0; i<query.length; i++){
                let m_class = query[i].className;
                let isCommonClass = query[i].belongClass.substring(0,4) == "重复属性" ? true : false;
                let attr = query[i].attrName.substring(0, query[i].attrName.indexOf("&"));
                let type = query[i].valueType;
                let value = query[i].value;
                let iType = query[i].attrType;
                console.log(type, value, typeof value)
                if(type == 'Boolean') {
                value = value + '';
                }
                let __ret = "";
                let __comRet = "";
                if (_class.indexOf(m_class)==-1 || value==null || value == "" || value == undefined || (typeof value == 'number' && isNaN(value))) continue;
                let self_pre = '';
                let self_timePre = "'";

                let finalMClass = '';
                if(m_class.indexOf('left_') != -1 || m_class.indexOf('right_') != -1) {
                finalMClass = m_class.split('_')[1];
                } else {
                finalMClass = m_class;
                }
                let mct = await getClass(finalMClass);
                let isExternal = mct.data.data.classCategory === 'ExternalItemClass';
                console.log("isExternal", isExternal);

                // 实体类 obj.Attr
                // 外部实体类 obj."Attr"
                // 关联类 obj.left_Attr / obj.right_Attr / obj.relation_Attr

                if (!isExternal) {
                self_pre = 'obj.';
                self_timePre = '';
                }

                if (_class.length == 3) {
                // if (m_class == _class[0]) m_class = "leftClass";
                // else if (m_class == _class[1]) m_class = "rightClass";
                // else m_class = "relationClass";
                if (m_class == _class[0]) self_pre = "obj.left_";
                else if (m_class == _class[1]) self_pre = "obj.right_";
                else self_pre = "obj.relation_";
                }

                if (type == "String") {
                // 查询条件为字符串时 拼接查询语句的方式较为固定

                if (iType == 'SelectMutiInput') {
                    let strValue = value.split(',');
                    let temStr = '';
                    if (strValue) {
                    strValue.forEach(s => {
                        // temStr = `${temStr} ${m_class}.${self_pre}${attr} like '%${s}%' or`
                        temStr = isExternal ? `${temStr} obj."${attr}" like '%${s}%' or` : `${temStr} ${self_pre}${attr} like '%${s}%' or`
                    })
                    if (temStr != '') {
                        temStr = temStr.substring(0, temStr.length - 3);
                    }

                    if (isCommonClass) { // 只有关联类存在重复属性
                        __comRet = ` or (${temStr})`;
                    } else {
                        __ret = ` and (${temStr})`;
                    }
                    } else {
                    __ret = '';
                    __comRet = '';
                    }
                } else {

                    if (isCommonClass) {
                    __comRet = ` or ${self_pre}${attr} like '%${value}%'`;
                    } else {
                    __ret = isExternal ? ` and obj."${attr}" like '%${value}%'` : ` and ${self_pre}${attr} like '%${value}%'`;
                    }

                }

                }
                // else if (type == 'Integer' || type == 'Long'){
                //   // 查询条件为布尔型变量时 拼接查询语句方式固定
                //   let _value = parseInt(value);
                //   __ret = ` and ${m_class}.${self_pre}${attr} = ${_value}`;
                //   console.log(__ret)
                // }
                else if (type == "Boolean") {
                // 查询条件为布尔型变量时 拼接查询语句方式固定
                let _value = typeof value == "string" ? value == "true" : value;
                if (isCommonClass) {
                    __comRet = ` or ${self_pre}${attr} = ${_value}`;
                } else {
                    // __ret = ` and ${m_class}.${self_pre}${attr} = ${_value}`;
                    __ret = isExternal ? ` and obj."${attr}" = ${_value}` : ` and ${self_pre}${attr} = ${_value}`;
                }
                }
                else if (typeof value == "object") {
                // 查询值可能有2个或1个
                // 分别考虑属性为字符串或直接值的方式
                if(isCommonClass) {
                    if (_str.indexOf(type) != -1) __comRet = ` or ${self_pre}${attr} between '${value[0]}' and '${value[1]}'`;
                    if (_int.indexOf(type) != -1) __comRet = ` or ${self_pre}${attr} between ${self_timePre}${value[0]}${self_timePre} and ${self_timePre}${value[1]}${self_timePre}`;
                } else {
                    if (_str.indexOf(type) != -1)
                    // __ret = ` and ${m_class}.${self_pre}${attr} between '${value[0]}' and '${value[1]}'`;
                    __ret = isExternal ? ` and obj."${attr}" between '${value[0]}' and '${value[1]}'` : ` and ${self_pre}${attr} between '${value[0]}' and '${value[1]}'`;
                    if (_int.indexOf(type) != -1)
                    // __ret = ` and ${m_class}.${self_pre}${attr} between ${self_timePre}${value[0]}${self_timePre} and ${self_timePre}${value[1]}${self_timePre}`;
                    __ret = isExternal ? ` and obj."${attr}" between ${self_timePre}${value[0]}${self_timePre} and ${self_timePre}${value[1]}${self_timePre}` : ` and ${self_pre}${attr} between ${self_timePre}${value[0]}${self_timePre} and ${self_timePre}${value[1]}${self_timePre}`;
                }

                } else {

                if (iType == 'SelectMutiInput') {
                    let strValue = value.split(',');
                    let temStr = '';
                    if(strValue) {
                    strValue.forEach(s => {
                        if (_str.indexOf(type) != -1) {
                        if (type == 'TimeStamp' || type == 'Date') {
                            s = s.replace(/\&/ig, ':');
                        }
                        // temStr = `${temStr} ${m_class}.${self_pre}${attr} = '${s}' or`
                        temStr = isExternal ? `${temStr} obj."${attr}" = '${s}' or` : `${temStr} ${self_pre}${attr} = '${s}' or`
                        }
                        if (_int.indexOf(type) != -1) {
                        // temStr = `${temStr} ${m_class}.${self_pre}${attr} = ${s} or`
                        temStr = isExternal ? `${temStr} obj."${attr}" = ${s} or` : `${temStr} ${self_pre}${attr} = ${s} or`
                        }
                    })
                    if (temStr != '') {
                        temStr = temStr.substring(0, temStr.length - 3);
                    }
                    if (isCommonClass) {
                        __comRet = ` or (${temStr})`;
                    } else {
                        __ret = ` and (${temStr})`;
                    }
                    } else {
                    __ret = '';
                    __comRet = '';
                    }
                } else {

                    if (isCommonClass) {
                    if (_str.indexOf(type) != -1) __comRet = ` or ${self_pre}${attr} = '${value}'`;
                    if (_int.indexOf(type) != -1) __comRet = ` or ${self_pre}${attr} = ${value}`;
                    // if (_str.indexOf(type) != -1) __comRet = ` or ${m_class}.${self_pre}${attr} = '${value}'`;
                    // if (_int.indexOf(type) != -1) __comRet = ` or ${m_class}.${self_pre}${attr} = ${value}`;
                    } else {
                    if (_str.indexOf(type) != -1)
                        // __ret = ` and ${m_class}.${self_pre}${attr} = '${value}'`;
                        __ret = isExternal ? ` and obj."${attr}" = '${value}'` : ` and ${self_pre}${attr} = '${value}'`;
                    if (_int.indexOf(type) != -1)
                        // __ret = ` and ${m_class}.${self_pre}${attr} = ${value}`;
                        __ret = isExternal ? ` and obj."${attr}" = ${value}` : ` and ${self_pre}${attr} = ${value}`;
                    }

                }

                }

                if (__ret) _ret += __ret;
                if (__comRet) _comret += __comRet;
            }

            let fixCom = '';
            if(_comret) {
                fixCom = ` and (${_comret.slice(3)})`;
            }
            _ret += fixCom;
            //排除表格原生+查询框查询方式
            // let gridQuery = this.parseEscapeString(this.args.filterQuery, null, null, this.itemValue.data.origin, this.attributes, this.$store)
            // if(/^\s{0,}nativequery:/g.test(gridQuery)){
            //     _ret = `${gridQuery}`;
            // }else{
            //     _ret = `${_ret} ${gridQuery}`;
            // }
            return _ret;
          },
          async triggerEvent(type){
            switch (type) {
              case 'valueChanged':
                if(this.vChange) {
                  this.invokeOperation(this.vChange.opr_type, this.vChange.opr_path, this.itemValue, this.store);
                }
                break;
              default:
                if(this.vChange) {
                  this.invokeOperation(this.vChange.opr_type, this.vChange.opr_path, this.itemValue, this.store);
                }
                break;
            }
          },


          getCharts(node) {
                let result = [];
                let that = this;
                for (var element of node) {
                    if(element.obj.refreshChart != null) result.push(element.obj);
                    else result = result.concat(that.getCharts(element.elements));
                }
                return result;
            },

            async _handleQueryObj(query, that){
                let _ret = "";
                let _comret = '';
                let _class;
                let _str = ["String", "UUID", "Clob", "Date", "TimeStamp"];
                let _int = ["Integer", "Long", "Double"];
                if (that.args.select_type=="relation"){
                    _class = [
                    `left_${that._relation.leftClass}`,
                    `right_${that._relation.leftClass}`,
                    that._relation.className
                    ];
                } else {
                    _class = [this.itemValue.data.targetClass];
                }

                for (var i=0; i<query.length; i++){
                    let m_class = query[i].className;
                    let isCommonClass = query[i].belongClass.substring(0,4) == "重复属性" ? true : false;
                    // let m_class = 'obj';
                    let attr = query[i].attrName.substring(0, query[i].attrName.indexOf("&"));
                    let type = query[i].valueType;
                    let value = query[i].value;
                    let iType = query[i].attrType;
                    if(type == 'Boolean') {
                        value = value + '';
                    }
                    let __ret = "";
                    let __comRet = "";
                    if (_class.indexOf(m_class)==-1 || value==null || value == "" || value == undefined) continue;

                    let self_pre = '';
                    let self_timePre = "'";

                    let finalMClass = '';
                    if(m_class.indexOf('left_') != -1 || m_class.indexOf('right_') != -1) {
                        finalMClass = m_class.split('_')[1];
                    } else {
                        finalMClass = m_class;
                    }

                    let mct = await getClass(finalMClass);
                    let isExternal = mct.data.data.classCategory === 'ExternalItemClass';
                    // if (mct.data.data.classCategory != 'ExternalItemClass') self_pre = 'plt_';

                    if (!isExternal) {
                        // self_pre = 'plt_';
                        self_timePre = '';
                    }

                    if (_class.length == 3) {
                        // if (m_class == _class[0]) m_class = "leftClass";
                        // else if (m_class == _class[1]) m_class = "rightClass";
                        // else m_class = "relationClass";
                        if (m_class == _class[0]) self_pre = "left_";
                        else if (m_class == _class[1]) self_pre = "right_";
                        else self_pre = "relation_";
                    }

                    if (type == "String") {
                    // 查询条件为字符串时 拼接查询语句的方式较为固定
                    // __ret = ` and ${m_class}.${self_pre}${attr} like '%${value}%'`;

                        if (iType == 'SelectMutiInput') {
                            let strValue = value.split(',');
                            let temStr = '';
                            if (strValue) {
                                strValue.forEach(s => {
                                    // temStr = `${temStr} ${m_class}.${self_pre}${attr} like '%${s}%' or`
                                    temStr = isExternal ? `${temStr} obj."${attr}" like '%${s}%' or` : `${temStr} obj.${self_pre}${attr} like '%${s}%' or`
                                })
                                if (temStr != '') {
                                    temStr = temStr.substring(0, temStr.length - 3);
                                }

                                if (isCommonClass) { // 只有关联类存在重复属性
                                    __comRet = ` or (${temStr})`;
                                } else {
                                    __ret = ` and (${temStr})`;
                                }
                            } else {
                                __ret = '';
                                __comRet = '';
                            }
                        } else {

                            if (isCommonClass) {
                                __comRet = ` or obj.${self_pre}${attr} like '%${value}%'`;
                            } else {
                                __ret = isExternal ? ` and obj."${attr}" like '%${value}%'` : ` and obj.${self_pre}${attr} like '%${value}%'`;
                            }

                        }

                    }
                    else if (type == "Boolean"){
                    // 查询条件为布尔型变量时 拼接查询语句方式固定
                    // let _value = typeof value == "string" ? value == "true" : value;
                    // __ret = ` and ${m_class}.${self_pre}${attr} = ${_value}`;

                        let _value = typeof value == "string" ? value == "true" : value;
                        if (isCommonClass) {
                            __comRet = ` or obj.${self_pre}${attr} = ${_value}`;
                        } else {
                            __ret = isExternal ? ` and obj."${attr}" = ${_value}` : ` and obj.${self_pre}${attr} = ${_value}`;
                        }
                    }
                    else if (typeof value == "object") {
                    // 查询值可能有2个或1个
                    // 分别考虑属性为字符串或直接值的方式
                    // if (_str.indexOf(type) != -1) __ret = ` and ${m_class}.${self_pre}${attr} between '${value[0]}' and '${value[1]}'`;
                    // if (_int.indexOf(type) != -1) __ret = ` and ${m_class}.${self_pre}${attr} between ${value[0]} and ${value[1]}`;
                        if(isCommonClass) {
                            if (_str.indexOf(type) != -1) __comRet = ` or obj.${self_pre}${attr} between '${value[0]}' and '${value[1]}'`;
                            if (_int.indexOf(type) != -1) __comRet = ` or obj.${self_pre}${attr} between ${self_timePre}${value[0]}${self_timePre} and ${self_timePre}${value[1]}${self_timePre}`;
                        } else {
                            if (_str.indexOf(type) != -1)
                            // __ret = ` and ${m_class}.${self_pre}${attr} between '${value[0]}' and '${value[1]}'`;
                            __ret = isExternal ? ` and obj."${attr}" between '${value[0]}' and '${value[1]}'` : ` and obj.${self_pre}${attr} between '${value[0]}' and '${value[1]}'`;
                            if (_int.indexOf(type) != -1)
                            // __ret = ` and ${m_class}.${self_pre}${attr} between ${self_timePre}${value[0]}${self_timePre} and ${self_timePre}${value[1]}${self_timePre}`;
                            __ret = isExternal ? ` and obj."${attr}" between ${self_timePre}${value[0]}${self_timePre} and ${self_timePre}${value[1]}${self_timePre}` : ` and obj.${self_pre}${attr} between ${self_timePre}${value[0]}${self_timePre} and ${self_timePre}${value[1]}${self_timePre}`;
                        }

                    }
                    else {
                    // if (_str.indexOf(type) != -1) __ret = ` and ${m_class}.${self_pre}${attr} = '${value}'`;
                    // if (_int.indexOf(type) != -1) __ret = ` and ${m_class}.${self_pre}${attr} = ${value}`;

                        if (iType == 'SelectMutiInput') {
                            let strValue = value.split(',');
                            let temStr = '';
                            if(strValue) {
                            strValue.forEach(s => {
                                if (_str.indexOf(type) != -1) {
                                if (type == 'TimeStamp' || type == 'Date') {
                                    s = s.replace(/\&/ig, ':');
                                }
                                // temStr = `${temStr} ${m_class}.${self_pre}${attr} = '${s}' or`
                                temStr = isExternal ? `${temStr} obj."${attr}" = '${s}' or` : `${temStr} obj.${self_pre}${attr} = '${s}' or`
                                }
                                if (_int.indexOf(type) != -1) {
                                // temStr = `${temStr} ${m_class}.${self_pre}${attr} = ${s} or`
                                temStr = isExternal ? `${temStr} obj."${attr}" = ${s} or` : `${temStr} obj.${self_pre}${attr} = ${s} or`
                                }
                            })
                            if (temStr != '') {
                                temStr = temStr.substring(0, temStr.length - 3);
                            }
                            if (isCommonClass) {
                                __comRet = ` or (${temStr})`;
                            } else {
                                __ret = ` and (${temStr})`;
                            }
                            } else {
                            __ret = '';
                            __comRet = '';
                            }
                        } else {

                            if (isCommonClass) {
                                if (_str.indexOf(type) != -1) __comRet = ` or ${m_class}.${self_pre}${attr} = '${value}'`;
                                if (_int.indexOf(type) != -1) __comRet = ` or ${m_class}.${self_pre}${attr} = ${value}`;
                            } else {
                            if (_str.indexOf(type) != -1)
                                // __ret = ` and ${m_class}.${self_pre}${attr} = '${value}'`;
                                __ret = isExternal ? ` and obj."${attr}" = '${value}'` : ` and obj.${self_pre}${attr} = '${value}'`;
                            if (_int.indexOf(type) != -1)
                                // __ret = ` and ${m_class}.${self_pre}${attr} = ${value}`;
                                __ret = isExternal ? ` and obj."${attr}" = ${value}` : ` and obj.${self_pre}${attr} = ${value}`;
                            }

                        }

                    }

                    if (__ret) _ret += __ret;
                    if (__comRet) _comret += __comRet;
                }
                let fixCom = '';
                if(_comret) {
                    fixCom = ` and (${_comret.slice(3)})`;
                }
                _ret += fixCom;
                console.log(_ret)
                return _ret;
            },

            // handleQueryObj(query, targetClass){
            //     let _ret = "";
            //     let _class = [targetClass];
            //     let _str = ["String", "UUID", "Clob", "Date"];
            //     let _int = ["Integer", "Long", "Double", "TimeStamp"];

            //     for (var i=0; i<query.length; i++){
            //         let m_class = query[i].className;
            //         let attr = query[i].attrName.substring(0, query[i].attrName.indexOf("&"));
            //         let type = query[i].valueType;
            //         let value = query[i].value;
            //         let __ret = "";

            //         if (_class.indexOf(m_class)==-1 || value==null || value == "" || !value) continue;
            //         // 判断当前是否为外部实体类 外部实体类 无需添加plt前缀
            //         getClass(m_class).then(response => {
            //             let res = response.data;
            //             if(res.success) {

            //                 let self_pre = '';
            //                 if(res.data.classCategory != 'ExternalItemClass') {
            //                     self_pre = 'plt_';
            //                 }

            //                 if (type == "String") {
            //                 // 查询条件为字符串时 拼接查询语句的方式较为固定
            //                 __ret = ` and ${m_class}.${self_pre}${attr} like '%${value}%'`;
            //                 }
            //                 else if (type == "Boolean"){
            //                 // 查询条件为布尔型变量时 拼接查询语句方式固定
            //                 let _value = typeof value == "string" ? value == "true" : value;
            //                 __ret = ` and ${m_class}.${self_pre}${attr} = ${_value}`;
            //                 }
            //                 else if (typeof value == "object") {
            //                 // 查询值可能有2个或1个
            //                 // 分别考虑属性为字符串或直接值的方式
            //                 if (_str.indexOf(type) != -1)
            //                     __ret = ` and ${m_class}.${self_pre}${attr} between '${value[0]}' and '${value[1]}'`;
            //                 if (_int.indexOf(type) != -1)
            //                     __ret = ` and ${m_class}.${self_pre}${attr} between ${value[0]} and ${value[1]}`;
            //                 }
            //                 else {
            //                 if (_str.indexOf(type) != -1)
            //                     __ret = ` and ${m_class}.${self_pre}${attr} = '${value}'`;
            //                 if (_int.indexOf(type)!= -1)
            //                     __ret = ` and ${m_class}.${self_pre}${attr} = ${value}`;
            //                 }

            //                 if (__ret) _ret += __ret;

            //             }
            //         }).catch(e => {
            //             console.log(e);
            //         });

            //     }
            //     return _ret;
            // },

            // 取消生产
            cancelQuery() {
                this.showQuery = false;
            },

            // 自定义脚本
            selfSet() {

            },

            // 选择类过滤属性
            checkAllGroupChange (data) {
                let that = this;
                this.dataAttr = [];
                data.forEach(x => {
                    var className = "_all";
                    if (x.substring(0,4) != "重复属性") className = x.substring(0, x.indexOf("("));
                    that.dataAttr = that.dataAttr.concat(that.classAttr[className]);
                })
            },

            resetQueryBox () {
                let that = this;
                this.queryAttr.forEach(x => {
                    var _id = x.className;
                    if (x.belongClass.substring(0,4) == "重复属性") _id = "_all";
                    _id += "&" + x.index;
                    let value = x.defaultValue;
                    if (x.attrType == 'SelectInput') {
                        x.value = '';
                    } else if (x.attrType == 'SelectMutiInput') {
                        x.value = [];
                    } else if (x.attrType == 'SingleObjectSelectors') {
                        x.value = '';
                    } else x.value = value;
                  that.domMap[_id].setValue(x.value);
                  that.domMap[_id].resetQueryBox ? that.domMap[_id].resetQueryBox() : '';
                });
            }

        }
    }
</script>

<style lang="less" scoped>
/*
    插件的css部分
    设置display为inline，默认不换行
    scoped表示样式仅在该vue文件内有效
*/
.margin1 {
    margin-top: 5px;
    margin-bottom: 5px;
}

section {
    width: 100%;
    height: auto;
    display: inline-block;
}

.seach-wrap {
    width: 100%;
    min-height: 64px;
    height: auto;
    padding: 10px 0;
  display: flex;//fix bug http://ise.thss.tsinghua.edu.cn/confluence/pages/viewpage.action?pageId=43883468 -6
  align-items: center;
}

.seach-wrap input {
    color: #005aa0;
}

@media screen and (min-width: 1900px){
    .self-btn {
        margin-left: 5px;
    }
}
</style>
