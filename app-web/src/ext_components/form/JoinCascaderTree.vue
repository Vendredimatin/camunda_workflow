<template>
    <section v-show="!args.hided" :addinName="name" :style="{'width': colWidth}" ref="main">
        <span v-if="args.required || args.label" :style="{ 'width': labelWidth, 'display': 'inline-block',
        'text-align': labelXAlign, 'vertical-align': labelYAlign, 'padding-right': '10px'}">
            <span :style="{'background-color': args.label_color, 'width': '100%', 'display': 'inline-block'}">
                <span v-if="args.required" style="color: red">*</span>
                <label class="ori-color self-color" :style="{'color': args_lfcolor, 'font-size': args_lfsize}">{{ args.label }}</label>
            </span>
        </span>
        <span :style="{'height': arg_height, 'line-height': arg_height, 'width': mainWidth, 'display': 'inline-block',
            'text-align': mainXAlign, 'color': args.main_fontColor}">
            <span :style="{'background-color': args.main_color, 'width': '100%', 'display': 'inline-block'}">
                <Cascader class="i-input self-color" :data="args.treeList" :load-data="loadData" change-on-select :transfer="true" :disabled="args.readonly || t_visit" v-model="casData" :filterable="!args.searchSwitch" :render-format="cascaderFormat" @on-change="changeTips" :style="{ 'width': '100%', 'height': arg_height, 'color': args_fcolor, 'font-size': args_fsize, 'display': 'inline-block',
                 'text-align': mainXAlign, 'vertical-align': mainYAlign}"></Cascader>
            </span>
        </span>
        </div>
        <span v-show="isRequired || isWrong" :style="{'width': '100%', 'display': 'inline-block', 'padding-left': labelWidth}">
            <span v-show="isRequired" class="wrongTips">该项不能为空</span>
            <span v-show="isWrong" class="wrongTips">{{ errorMessage }}</span>
        </span>
    </section>
</template>

<script>
import { getSelfJoinEobj, getEobj, postSub, deleteSub } from '@/api/others';
import { addListener, removeListener, getSockId} from "@/util/webSocket";
import { uuid } from '@/util/assist'
const name = "JoinCascaderTree";
export default {
    name: name,
  props: [
    'argsProps',
    'store',
    'itemValue',
    'formEngine',
    'dwf_ctx',
    'query',
  ],
    data() {
        return {
            wsCommand:  '',
            wsDelCommand:  '',
            wsId: '',
            wsDelId: '',
            subId: '',
            subDelId: '',
            oids: [],
            timer: null,
            times: 0,
            name: name,

            t_create: false,
            t_edit: false,
            t_visit: false,

            error: null,

            readonly: true,
            isWrong: false,
            isRequired: false,
            errorMessage: '',
            displayType:'',
            transRootQuerys: '',

            args: {
                label_fontColor: 'initial',       // 标签文字颜色
                txt_fontColor: 'initial',         // 内容文字颜色
                lfsize: 14,                       // 标签文字大小
                lfsizeType: 'px',                 // 标签文字大小单位
                fsize: 14,                        // 内容文字大小
                fsizeType: 'px',                  // 内容文字大小单位
                hided: false,
                label_width: 2,
                main_width: 3,
                label_align: 4,
                main_align: 4,

                targetClass: '',
                labelData: [],
                valueData: [],
                noNumber: true,
                lazySwitch: true,
                searchSwitch: false,
                labelSwitch: true,
                pathSwitch: false,
                rootQuery: '',
                childrenQuery: '',
                recursiveLevel: 1,
                transChildrenQuery: '',

                width: 100,
                widthType: '%',
                heightType: "px",           // 整体高度单位
                label: "",
                name: "",
                height: 1,
                col: true,
                rows: 3,
                cols: 3,
                targetDataType: null,

                treeList: []
            },

            casData: [],
            temCasData: [],

            // 支持的数据类型
            dataTypes: ['String', 'UUID', 'Clob'],

            // 对齐方式,布局插件使用
            alignList: [
                {value: 1, name: "靠左对齐"},
                {value: 4, name: "居中对齐"},
                {value: 7, name: "靠右对齐"},
                {value: 0, name: "左上对齐"},
                {value: 2, name: "左下对齐"},
                {value: 3, name: "顶部对齐"},
                {value: 5, name: "底部对齐"},
                {value: 6, name: "右上对齐"},
                {value: 8, name: "右下对齐"}
            ],

            attrMap: {},

            open: ["1","2"],

            value: "",

            vChange: null
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
    mounted() {
        console.log('mounted')
        // 字体 ／ 颜色 默认继承
      this.$nextTick(() => {

        this.setInheritStyle();
        this.$refs.main.querySelector(".ivu-cascader-rel").style.color = 'inherit';
        this.$refs.main.querySelector(".ivu-input-wrapper").style.color = 'inherit';
        this.$refs.main.querySelector(".i-input .ivu-input").style.color = 'inherit';

        this.$refs.main.querySelector(".ivu-cascader-rel").style.fontSize = 'inherit';
        this.$refs.main.querySelector(".ivu-input-wrapper").style.fontSize = 'inherit';
        this.$refs.main.querySelector(".i-input .ivu-input").style.fontSize = 'inherit';
        this.$refs.main.querySelector(".i-input .ivu-input").style.textAlign = 'inherit';

      })
      this.updateTree();
      if(this.args.dynamic) {
        this.createDynamic();
      }

      this.vChange = this.args.events.find((val) => {
            return val.name == '值变化'
        })
    },
    beforeDestroy() {
        if(this.args.dynamic) {
            removeListener(this.wsCommand, this.wsId);
            removeListener(this.wsDelCommand, this.wsDelId);
        }
    },
    computed: {
        arg_name() {
            return this.args.name;
        },
        arg_height() {
            return this.args.height + this.args.heightType;
        },
        colWidth() {
            return this.args.width + this.args.widthType;
        },
      labelWidth() {
        if(this.args.labelWidthUnit && this.args.labelWidthUnit === 'px'){
          return (!this.args.label || this.args.label == "") ? "10%" : this.args.label_widthByPx + 'px';
        }else{
          return (!this.args.label || this.args.label == "") && this.args.required ? "10%" : parseInt(100 * this.args.label_width / (this.args.label_width + this.args.main_width)) + "%";
        }
      },
      mainWidth() {
        if(this.args.labelWidthUnit && this.args.labelWidthUnit === 'px'){
          return !this.args.label || this.args.label == "" ? (this.args.required ? "90%" : "100%") : `calc(100% - ${this.args.label_widthByPx}px)`;
        }else{
          return !this.args.label || this.args.label == "" ? (this.args.required ? "90%" : "100%") : parseInt(100 * this.args.main_width / (this.args.label_width + this.args.main_width)) + "%";
        }
      },
        labelXAlign() {
            let x = parseInt(this.args.label_align / 3);
            if (x == 0) return "left";
            else if (x == 1) return "center";
            else return "right";
        },
        // 文本内容字体大小
        args_fsize() {
            return this.args.fsize + this.args.fsizeType + ' !important';
        },
        args_fcolor() {
            return this.args.txt_fontColor == 'initial' ? 'initial' : this.args.txt_fontColor + ' !important';
        },
        // 标签文本内容字体大小
        args_lfsize() {
            return this.args.lfsize + this.args.lfsizeType + ' !important';
        },
        args_lfcolor() {
            return this.args.label_fontColor == 'initial' ? 'initial' : this.args.label_fontColor + ' !important';
        },
        labelYAlign() {
            let x = this.args.label_align % 3;
            if (x == 0) return "top";
            else if (x == 1) return "middle";
            else return "bottom";
        },
        mainXAlign() {
            let x = parseInt(this.args.main_align / 3);
            if (x == 0) return "left";
            else if (x == 1) return "center";
            else return "right";
        },
        mainYAlign() {
            let x = this.args.main_align % 3;
            if (x == 0) return "top";
            else if (x == 1) return "middle";
            else return "bottom";
        },
    },
    methods: {
        // 动态监听数据变化
        onDynamic(value) {
            this.updateTree();
        },
        setInheritStyle() {
            try {
                this.$refs.main.querySelectorAll('.i-input div') && this.$refs.main.querySelectorAll('.i-input div').length != 0
                ? this.$refs.main.querySelectorAll('.i-input div').forEach(item => {
                    item.style.fontSize = 'inherit';
                    item.style.height = 'inherit';
                    item.style.color = 'inherit';
                    item.style.backgroundColor = 'inherit';
                    })
                : '';
                this.$refs.main.querySelectorAll('.i-input .ivu-tag-text') && this.$refs.main.querySelectorAll('.i-input .ivu-tag-text').length != 0
                ? this.$refs.main.querySelectorAll('.i-input .ivu-tag-text').forEach(item => {
                    item.style.fontSize = 'inherit';
                    item.style.color = 'inherit';
                    item.style.backgroundColor = 'inherit';
                    })
                : '';
                this.$refs.main.querySelectorAll('.i-input .ivu-tag') && this.$refs.main.querySelectorAll('.i-input .ivu-tag').length != 0
                ? this.$refs.main.querySelectorAll('.i-input .ivu-tag').forEach(item => {
                    item.style.fontSize = 'inherit';
                    item.style.color = 'inherit';
                    item.style.backgroundColor = 'inherit';
                    })
                : '';
                this.$refs.main.querySelectorAll('.i-input .ivu-select-placeholder') && this.$refs.main.querySelectorAll('.i-input .ivu-select-placeholder').length != 0
                ? this.$refs.main.querySelectorAll('.i-input .ivu-select-placeholder').forEach(item => {
                item.style.fontSize = 'inherit';
                item.style.lineHeight = this.arg_height;
                item.style.height = this.arg_height;
                })
                : '';
                this.$refs.main.querySelectorAll('.i-input .ivu-cascader-rel .ivu-cascader-label') && this.$refs.main.querySelectorAll('.i-input .ivu-cascader-label').length != 0
                ? this.$refs.main.querySelectorAll('.i-input .ivu-cascader-rel .ivu-cascader-label').forEach(item => {
                item.style.fontSize = 'inherit';
                item.style.height = this.arg_height;
                item.style.lineHeight = this.arg_height;
                })
                : '';
                this.$refs.main.querySelectorAll('.i-input .ivu-cascader-rel input') && this.$refs.main.querySelectorAll('.i-input .ivu-cascader-label').length != 0
                ? this.$refs.main.querySelectorAll('.i-input .ivu-cascader-rel input').forEach(item => {
                item.style.fontSize = 'inherit';
                item.style.height = this.arg_height;
                })
                : '';
                this.$refs.main.querySelectorAll('.i-input .ivu-select-selected-value') && this.$refs.main.querySelectorAll('.i-input .ivu-select-selected-value').length != 0
                ? this.$refs.main.querySelectorAll('.i-input .ivu-select-selected-value').forEach(item => {
                    item.style.fontSize = 'inherit';
                    item.style.color = 'inherit';
                    item.style.lineHeight = this.arg_height;
                    item.style.height = this.arg_height;
                    item.style.backgroundColor = 'inherit';
                    })
                : '';
                this.$refs.main.querySelectorAll('.i-input .ivu-cascader-rel .ivu-input') && this.$refs.main.querySelectorAll('.i-input .ivu-cascader-rel').length != 0
                ? this.$refs.main.querySelectorAll('.i-input .ivu-cascader-rel .ivu-input').forEach(item => {
                    item.style.backgroundColor = this.args.txt_bgColor == '' ? 'transparent' : this.args.txt_bgColor;
                }): '';

            } catch (e) {

            }
            },
        createSub(targetClass, type) {
            if (type == 'OBJ_CREATE' && this.subId) {
                deleteSub([this.subId]);
                this.subId = null;
            }
            if (type == 'OBJ_DELETE' && this.subDelId) {
                deleteSub([this.subDelId]);
                this.subDelId = null;
            }
            let sockId = getSockId();
            if (sockId) {
                if(type == 'OBJ_CREATE') {
                    this.subId = `${targetClass}${type}${sockId}`;
                } else {
                    this.subDelId = `${targetClass}${type}${sockId}`;
                }

                postSub([
                {
                    className: targetClass,
                    eventType: type,
                    subscribers: [{
                    subScriberType: "ALL_CONNECTION",
                    connectId: getSockId(),
                    }],
                    subscriptionId: type == 'OBJ_CREATE' ? this.subId : this.subDelId
                }
                ]);
            }
            },
        // 手动创建表单create态ws连接
        createDynamic() {

            this.createSub(this.args.targetClass, 'OBJ_CREATE');
            this.wsCommand = "objects command " + this.args.targetClass + ' OBJ_CREATE';
            this.wsId = addListener(this.wsCommand, async (data) => {
                this.freshData();
            })

            this.createSub(this.args.targetClass, 'OBJ_DELETE');
            this.wsDelCommand = "objects command " + this.args.targetClass + ' OBJ_DELETE';
            this.wsDelId = addListener(this.wsDelCommand, async (data) => {
                this.freshData();
            })

        },
        // 懒加载
        async loadData(item, callback) {

            if(!this.args.lazySwitch) {
                return false;
            }

            let treeParam = {
                childrenCondition: this.args.transChildrenQuery,
                leafCondition: '',
                recursiveLevel: 1,
                rootCondition: ''
            }

          let prefix = this.args.relationAttr ? this.args.relationAttr : 'parentOid';
            if(this.args.classCategory == 'ExternalItemClass'){
              prefix = `"${prefix}"`
            }
          treeParam.rootCondition = this.args.childrenQuery == '' ? `and obj.${prefix} = '${item.oid}'` : `and obj.${prefix} = '${item.oid}' ${this.args.childrenQuery}`;

            let nodeResult = await getSelfJoinEobj(this.args.targetClass, treeParam, false, true, this.args.relationAttr);
            let temChild = [];

            if(nodeResult.data.success) {

                temChild = nodeResult.data.data;

            } else {
                this.$Message.error(nodeResult.data.message);
            }

            if(temChild.length && temChild.length > 0) {

                temChild.forEach((val, index) => {

                    // 子节点过滤结果
                    let temCAttr = '';
                    let temCValueAttr = '';

                    this.args.labelData.forEach(i => {

                        if(val[i]) {
                            temCAttr = temCAttr + val[i] + '-'
                        }

                    })
                    if(this.args.noNumber) {

                        this.args.valueData.forEach(n => {

                            if(val[n]) {
                                temCValueAttr = temCValueAttr + val[n] + ','
                            }

                        })

                    } else {

                        temCValueAttr = val[this.args.valueData] || '';

                    }

                    if(temCAttr.length > 0) {
                        temCAttr = temCAttr.substr(0, temCAttr.length - 1);
                    }
                    if(temCValueAttr.length > 0) {
                        temCValueAttr = temCValueAttr.substr(0, temCValueAttr.length - 1);
                    }
                    val.label = temCAttr;
                    val.value = temCValueAttr;
                    val.index = `${item.index}-${index}`;
                    val.orgPath = `${item.orgPath},${val.value}`;

                    if(val.childrenCount > 0) {

                        val.loading = false;
                        val.children = [];

                    } else {

                        val.children = [];

                    }

                })

            } else {
                temChild = [];
            }

            item.loading = true;
            setTimeout(() => {

                item.children = temChild;
                item.loading = false;
                callback();

            }, 1000);

        },

        // 遍历子节点
        getEachTree(tree = [], targetItem) {
            let arr = [];
            let _self = this;
            if (!!tree && tree.length !== 0) {
                tree.forEach((item, index) => {

                    // 子节点label/value拼接结果
                    let temCAttr = '';
                    let temCValueAttr = '';

                    this.args.labelData.forEach(i => {

                        if(item[i]) {
                            temCAttr = temCAttr + item[i] + '-'
                        }

                    })
                    if(this.args.noNumber) {

                        this.args.valueData.forEach(n => {

                            if(item[n]) {
                                temCValueAttr = temCValueAttr + item[n] + ','
                            }

                        })

                    } else {

                        temCValueAttr = item[this.args.valueData] || '';

                    }

                    if(temCAttr.length > 0) {
                        temCAttr = temCAttr.substr(0, temCAttr.length - 1);
                    }
                    if(temCValueAttr.length > 0) {
                        temCValueAttr = temCValueAttr.substr(0, temCValueAttr.length - 1);
                    }
                    item.label = temCAttr;
                    item.value = temCValueAttr;

                    let obj = item;
                    obj.index = `${targetItem.index}-${index}`;
                    obj.orgPath = `${targetItem.orgPath},${item.value}`;
                    let isHasChild = _self.getEachTree(item.children, item);
                    if(item.childrenCount > 0) {
                        obj.loading = false;
                        obj.children = isHasChild;
                    }
                    arr.push(obj);

                });
            }
            return arr;
        },

        /**
         * @description 更新树数据
        */
        async updateTree() {
            this.args.treeList = [];

            this.transRootQuerys = '';
            if(this.args.rootQuery != '') {

                this.transRootQuerys = this.parseEscapeString(this.args.rootQuery, null, null, this.itemValue.data.origin, this.attributes, this.$store);

            } else {
                this.transRootQuerys = '';
            }

            let treeParam = {
                childrenCondition: '',
                leafCondition: '',
                recursiveLevel: this.args.lazySwitch ? this.args.recursiveLevel : 10000,
                rootCondition: this.transRootQuerys
            }

            if(this.args.childrenQuery != '') {

                this.args.transChildrenQuery = this.parseEscapeString(this.args.childrenQuery, null, null, this.itemValue.data.origin, this.attributes, this.$store);
                treeParam.childrenCondition = this.args.transChildrenQuery;

            } else {
                this.args.transChildrenQuery = '';
            }

            let treeRes = await getSelfJoinEobj(this.args.targetClass, treeParam, false, true, this.args.relationAttr);
            let temTree = [];
            if(treeRes.data.success) {

                let treeData = treeRes.data.data;
                if(treeData.length > 0) {

                    treeData.forEach((x, index) => {

                        // 根节点过滤结果
                        let temAttr = '';
                        let temValueAttr = '';

                        // 显示字段label拼接
                        this.args.labelData.forEach(i => {

                            if(x[i]) {
                                temAttr = temAttr + x[i] + '-'
                            }

                        })
                        // 回填字段value拼接
                        if(this.args.noNumber) {

                            this.args.valueData.forEach(n => {

                                if(x[n]) {
                                    temValueAttr = temValueAttr + x[n] + ','
                                }

                            })

                        } else {

                            temValueAttr = x[this.args.valueData] || '';

                        }

                        if(temAttr.length > 0) {
                            temAttr = temAttr.substr(0, temAttr.length - 1);
                        }
                        if(temValueAttr.length > 0) {
                            temValueAttr = temValueAttr.substr(0, temValueAttr.length - 1);
                        }

                        x.label = temAttr;
                        x.value = temValueAttr;
                        x.index = index;
                        x.orgPath = x.value;

                        if(this.args.lazySwitch && this.args.recursiveLevel == 0) {

                            if(x.childrenCount > 0) {

                                x.children = [];
                                x.loading = false;

                            }

                        } else {

                            let transChild = this.getEachTree(x.children, x);
                            if(transChild.length > 0) {
                                x.children = transChild;
                                x.loading = false;
                            }

                        }

                    })
                    temTree = treeData;

                } else {
                    temTree = [];
                }

            } else {

                this.$Message.warning(treeRes.data.message);
                temTree = [];

            }

            this.spinShow = true;

            let that = this;
            setTimeout(function() {
                that.args.treeList = temTree;

                if(this.displayType != 'create') {

                    // 拉平treeList
                    function flatten(arr){
                        return [].concat(...arr.map(item => [].concat(item, item.children ? flatten(item.children) : [])));
                    }
                    let flatList = flatten(that.args.treeList);

                    // 判断当前value是否为有效值
                    let totalEffect = true;
                    if(that.temCasData.length > 0) {

                        let effectIndex = -1;
                        if(!that.args.pathSwitch) {

                            effectIndex = flatList.findIndex(val => {
                                return val.value == that.temCasData[0]
                            })

                            if(effectIndex == -1) {
                                totalEffect = false;
                            } else {

                                let pathData = typeof flatList[effectIndex].orgPath == 'number' ? [flatList[effectIndex].orgPath] : flatList[effectIndex].orgPath.split(',');
                                const dType = that.args.targetDataType;
                                if (dType == 'Double' || dType == 'Integer' || dType == 'Long') {
                                    that.casData = [];
                                    let finalData = [];
                                    pathData.forEach(p => {
                                       finalData.push(parseFloat(p)); 
                                    })
                                    that.$nextTick(() => {
                                        that.casData = finalData;
                                    })
                                    // that.casData = finalData;
                                } else {
                                    that.$nextTick(() => {
                                        that.casData = pathData;
                                    })
                                    // that.casData = pathData;
                                }
                            }

                            // 只要有一个数据是无效的value就清空
                            if(!totalEffect) {
                                that.casData = []
                            }

                        }

                        // let effectIndex = flatList.findIndex(val => {
                        //     return val. && val.childrenCount == 0
                        // })

                    }

                    that.spinShow = false;

                } else {
                    that.spinShow = false;
                }

            }, 1000);

        },

        cascaderFormat(labels, selectedData) {

            if(!this.args.labelSwitch) {
                const index = labels.length - 1;
                return labels[index];
            } else {
                return labels.join(' / ');
            }

        },

        setError(error, mes) {

            this.isWrong = error;
            var dom = this.$refs.main.querySelector(".i-input .ivu-input");
            if (dom) dom.style.borderColor = error ? "red" : null;
            if(mes) {
                this.errorMessage = mes;
            } else {
                this.errorMessage = '';
            }
            return this;

        },
        // 设置校验逻辑,返回true/false
        validate() {
            let expResult = true;

            if (this.args.required && (this.casData == [] || this.casData == "")) {
                this.isRequired = true;
                expResult = false;
            } else {
               this.isRequired = false;
            }

            this.setError(expResult ? false : true);

            return expResult;
        },
        changeTips(value) {

            // IViewd 的坑 v-model绑定的值不是最新的 需要手动再复制一次
            this.casData = value;
            // 脚本触发的错误状态 改变不取消
            if(this.errorMessage == '') {
                this.validate();
            }
            if(this.vChange) {
                this.invokeOperation(this.vChange.opr_type, this.vChange.opr_path, this.itemValue, this.store);
            }
        },
        getValue() {
            let temValue = null;
            if(this.casData.length > 0) {
                if(this.casData.length == 1) {

                    temValue = this.casData[0] + '';

                    const dType = this.args.targetDataType;
                    if (dType == 'Integer' || dType == 'Long') {

                        temValue = parseInt(temValue);

                    } else if (dType == 'Double') {

                        temValue = parseFloat(temValue);

                    }

                } else {

                    if(!this.args.pathSwitch) {

                        temValue = this.casData[this.casData.length - 1];

                        if(this.args.noNumber) {
                            temValue = temValue + '';
                        } else {

                            const dType = this.args.targetDataType;
                            if (dType == 'Integer' || dType == 'Long') {

                                temValue = parseInt(temValue);

                            } else if (dType == 'Double') {

                                temValue = parseFloat(temValue);

                            }

                        }

                    } else {

                        let _str = '';
                        this.casData.forEach(val => {
                            _str = _str + val + ','
                        })

                        if(_str.length > 0) {
                            _str = _str.substring(0, _str.length - 1);
                        }

                        temValue = _str;

                    }

                }
            }
            console.log(temValue);
            return temValue;
        },

        // 数据刷新
        freshData() {
            this.updateTree();
        },

        setValue(value) {

            console.log('setValue', value)
            if (value == null) this.casData = "defaultValue" in this.args ? this.args.defaultValue : [];
            else if(value.length && value.length > 0) {

                if(!this.args.pathSwitch) {

                    this.temCasData = value.split(',');
                    if(this.args.lazySwitch) {
                        this.args.recursiveLevel = this.temCasData.length;
                    }
                    this.updateTree();

                } else {

                    this.casData = value.split(',');
                    if(this.args.lazySwitch) {
                        this.args.recursiveLevel = this.casData.length;
                    }

                }


            } else {

                this.casData = [];
            }

            console.log(this.args.treeList, this.temCasData);

            return this;
        },
        setDisplayType(type) {
            this.displayType = type;
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
        getFormName() {
            return this.args.name;
        },
        setArgs(args) {
            for (var i in args) {
                this.args[i] = args[i];
            }
            if ("name" in args) this.args_name = this.args.name;
            return this;
        },
        getArgs() {
            return this.args;
        },
    }
}
</script>

<style scoped>
section {
  display: inline-block;
  vertical-align: top;
}
p {
  margin: 10px 0;
}
.ori-color {
  color: initial;
}
.wrongTips {
  display: inline-block;
  width: 100%;
  color: red;
  text-align: left;
  margin-top: 5px;
}
</style>
