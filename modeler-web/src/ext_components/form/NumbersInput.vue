<template>
        <section v-if="t_preview" :addinName="name" :style="{'font-size': '14px', 'width': colWidth}" ref="main">
            <label v-if="args.label" :style="{'width': labelWidth, 'display': 'inline-block', 'text-align': labelXAlign, 'color': 'initial', 'vertical-align': labelYAlign}">{{ args.label }}</label>
            <span :style="{'height': args.basic_height * args.height + 'px', 'width': mainWidth, 'display': 'inline-block', 'text-align': 'text-align', 'vertical-align': mainYAlign}">
            <InputNumber ref="number"
            v-model="value1"
            :placeholder="args.placeholder"
            :max="parseFloat(args.max)"
            :min="parseFloat(args.min)"
            :step="parseFloat(args.step)"
            :disabled="args.disabled"
            :readonly="args.readonly"
            :editable="args.editable"
            :style="{'height': args.basic_height * args.height + 'px', 'width': '40%', 'display': 'inline-block', 'text-align': mainXAlign, 'vertical-align': mainYAlign}"
            @on-blur="handleNumberInput"
            />
            -
            <InputNumber ref="number"
            v-model="value2"
            :placeholder="args.placeholder"
            :max="parseFloat(args.max)"
            :min="parseFloat(args.min)"
            :step="parseFloat(args.step)"
            :disabled="args.disabled"
            :readonly="args.readonly"
            :editable="args.editable"
            :style="{'height': args.basic_height * args.height + 'px', 'width': '40%', 'display': 'inline-block', 'text-align': mainXAlign, 'vertical-align': mainYAlign}"
            @on-blur="handleNumberInput"
            />
            </span>
        </section>

        <section v-else-if="t_icon" :addinName="name" style="text-align: center">
            <div class="form-addin-icon">
                <i class="iconfont">&#xe628;</i>
            </div>
            <Tooltip content="数字输入框" style="width: 100%;" :transfer="true">数字...</Tooltip>
        </section>
</template>

<script>
    import "@/styles/component/iconfont.css"
    const name = "NumbersInput";
    export default {
        name: name,
        props: ["argsProps", "widgetAnnotation", "editExtendInfo" , 'itemValue', 'attributes', 'relations', 'relation_classes'],
        data() {
            return {
	times: 0,
                name: name,
                // 展示模式
                t_preview: true,
                t_show: true,
                t_icon: true,
                t_edit: false,

                // 图标地址
                icon_url: "",

                // 编辑框

      actEdit: false,
      args: {
                    max: Number.MAX_VALUE,
                    min: -Number.MAX_VALUE,
                    step: 1,
                    disabled: false, // same as readOnly?
                    placeholder: "数字输入框",
                    readOnly: false,  // same as editable?
                    editable: true,
                    label: null,
                    name: null,
                    label_width: 2,
                    main_width: 3,
                    label_align: 4,
                    main_align: 4,
                    basic_height: 20,
                    // 属性插件所需属性
                    targetDataType: null,
                    relation: "",
                    relation_attr: "",
                    relation_class: "",
                    relation_class_attr: "",
                    height: 1,
                    width: 100,
                    widthType: '%',
                    col: true,
                    // 布局插件所需属性
                    rows: 0,
                    cols: 0,
                },

                dataTypes: ['Integer', 'Long', 'Double'],

                value1: 0,
                value2: 0,

                // 对齐方式,布局插件使用
                alignList: [
                    {value: 0, name: "左上对齐"},
                    {value: 1, name: "靠左对齐"},
                    {value: 2, name: "左下对齐"},
                    {value: 3, name: "顶部对齐"},
                    {value: 4, name: "居中对齐"},
                    {value: 5, name: "底部对齐"},
                    {value: 6, name: "右上对齐"},
                    {value: 7, name: "靠右对齐"},
                    {value: 8, name: "右下对齐"}
                ],

                // 继承属性
                inherit: [],

                // 表单项名
                args_name: "",

                // 属性map
                attrMap: {},
                relationAttrMap: {},
                relationClassAttrMap: {},

                timer: null

            }
        },
  inject: [
    'setBasicArgs'
  ],
  created() {
    //通用方法给args赋值
    this.args = this.setBasicArgs(this.args);
    this.setArgs(this.args);
            if (this.t_preview) {
                let that = this;
                if(this.attributes) this.attributes.forEach(x => that.attrMap[x.attributeName] = x)
                if(this.relations) this.relations.forEach(x => {
                    that.relationAttrMap[x.basic.className] = x.attributes;
                    x.attributes.forEach(y => that.attrMap[y.attributeName] = y);
                })
                if(this.relation_classes) this.relation_classes.forEach(x => {
                    that.relationClassAttrMap[x.basic.className] = x.attributes
                    x.attributes.forEach(y => that.attrMap[y.attributeName] = y);
                })
            }
        },
        // 生命周期函数，在dom元素生成之后调用
        mounted() {
            if (this.t_preview) {
                this.setHeight();
            }
        },
        beforeDestroy() {
            if (this.timer) { clearInterval(this.timer); this.timer = null; };
        },
        watch: {
            // value(val) {
            //     var res = val;
            //     if (this.args.targetDataType === "Integer" || this.args.targetDataType === "Long" || this.args.targetDataType === "TimeStamp") {
            //         res = parseInt(val);
            //     } else if (this.args.targetDataType === "Double") {
            //         res = parseFloat(val);
            //     }
            //     if (res !== val) {
            //         this.value = res;
            //     }
            // },

            arg_height(val) {
              this.setHeight();
            },

            // 需要用到实体类属性列表时使用
            args_name(val) {
                if (val != "-1") {
                    this.args.name = val;
                    this.args.relation = "";
                    this.args.relation_class = "";
                } else {
                    // // // // this.args.name = "";
                }
            },
            arg_name(val) {
                if (!this.attributes) return;
                if (val in this.attrMap) {
                    this.args.label = this.attrMap[val].displayName;
                    this.args.targetDataType = this.attrMap[val].valueType;
                } else if (this.arg_relation_attr == "" && this.arg_relation_class_attr == ""){
                    this.args.targetDataType = null;
                }
                // %s
            },
            attributes(val) {
                this.attrMap = {};
                if(val) val.forEach(x => this.attrMap[x.attributeName] = x);
            },
            // end
            // 需要用到关联类属性列表时使用
            arg_relation(val) {
                if (val == "") return;
                this.args.relation_attr = "";
                this.args_name = "-1";
                this.args.name = "";
                this.args.relation_class = "";
            },
            arg_relation_attr(val) {
                if (val != "") {
                    this.args.label = this.attrMap[val].displayName;
                    this.args.targetDataType = this.attrMap[val].valueType;
                }
            },
            // end
            // 需要用到关联实体类属性列表时使用
            arg_relation_class(val) {
                if (val == "") return;
                this.args.relation_class_attr = "";
                this.args.relation = "";
                this.args_name = "-1";
                this.args.name = "";
            },
            arg_relation_class_attr(val) {
                if (val != "") {
                    this.args.label = this.attrMap[val].displayName;
                    this.args.targetDataType = this.attrMap[val].valueType;
                }
            }
            // end
        },
        computed: {
            arg_height() {
                return this.args.height * this.args.basic_height;
            },
            colWidth() {
                return this.args.width + this.args.widthType;
            },
            labelWidth() {
                return parseInt(100 * this.args.label_width / (this.args.label_width + this.args.main_width)) + "%";
            },
            mainWidth() {
                return !this.args.label || this.args.label == "" ? "100%" : parseInt(100 * this.args.main_width / (this.args.label_width + this.args.main_width)) + "%";
            },
            labelXAlign() {
                let x = parseInt(this.args.label_align / 3);
                if (x == 0) return "left";
                else if (x == 1) return "center";
                else return "right";
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
            // 需要用到实体类属性列表时使用
            arg_name() {
                return this.args.name;
            },
            filter_attributes() {
                return this.attributes ? this.attributes.filter(x => this.dataTypes.indexOf(x.valueType) > -1) : [];
            },
            // end
            // 需要用到关联类属性列表时使用
            filter_relations() {
                return this.relations ? this.relations.map(x => x.basic) : [];
            },
            filter_relation_attr() {
                return this.args.relation in this.relationAttrMap ? this.relationAttrMap[this.args.relation] : [];
            },
            arg_relation() {
                return this.args.relation;
            },
            arg_relation_attr() {
                return this.args.relation_attr;
            },
            // end
            // 需要用到关联的实体类属性列表时使用
            filter_relation_class() {
                return this.relation_classes ? this.relation_classes.map(x => x.basic) : [];
            },
            filter_relation_class_attr() {
                return this.args.relation_class in this.relationClassAttrMap ? this.relationClassAttrMap[this.args.relation_class] : [];
            },
            arg_relation_class() {
                return this.args.relation_class;
            },
            arg_relation_class_attr() {
                return this.args.relation_class_attr;
            },
            // end
        },
        methods: {
            // 当插件无法直接通过style设置高度时,使用setHeight方法设置高度
            setHeight() {
                return;
				// if (!this.$refs.main) return;
				// let that = this;
				// this.timer = setInterval(() => {
				// 	if (!that.$refs.main) { clearInterval(that.timer); that.timer=null; return; }
				// 	// 改成你需要的样式
				// 	var dom = that.$refs.main.querySelector(".i-input .ivu-input");
				// 	if (dom) {
				// 		dom.style.height = that.arg_height + "px";
				// 		clearInterval(that.timer);
				// 		that.timer = null;
				// 	}
				// 	that.times += 30;
				// 	if (that.times > 60 * 1000) {
				// 		clearInterval(that.timer);
				// 		that.timer = null;
				// 	}
				// }, 30);
			},

            getValue() {
                if (!this.value1 && !this.value2) return null;
                return [this.value1, this.value2];
            },

            setValue(items) {
                if (items == null || items == '') { this.value1 = null; this.value2 = null; return this; }
                try {
                    var value = null;
                    if (typeof items == "object") {
                        if (items && items.length > 0) value = items[0][this.args.name];
                    } else value = items;
                    let values = value.replace(/，/ig,',').split(',');
                    if (values.length == 1) {
                    this.value1 = parseInt(values[0]);
                    this.value2 = value1;
                    } else {
                    this.value1 = parseInt(values[0]);
                    this.value2 = parseInt(values[1]);
                    }
                } catch (e) {
                    console.log('setValue error', e);
                }
                return this;
            },

            getAllow() {
                return null;
            },

            // 获取编辑框内容
            getArgs() {
                return this.args;
            },

            setArgs(args) {
                for (var i in args) {
                    this.args[i] = args[i];
                }
                if ("name" in args) this.args_name = this.filter_attributes.filter(x => x.attributeName == this.args.name).length > 0 ? this.args.name : "-1";
                return this;
            },

            // 获取表单项名
            getFormName() {
                return this.args.name;
            },


            getEditBoxComponent(){
      return this.$refs.editbox;
    },

    getEditBox() {
                this.t_edit = true;
                return this.$refs.edit;
            },

            getName() {
                return name;
            },

            setDisplayType(type) {
                this.t_preview = false;
                this.t_show = false;
                this.t_icon = false;
                if (type == 0) this.t_preview = true;
                else if (type == 1) this.t_show = true;
                else if (type == 2) this.t_icon = true;
                return this;
            },

            setIcon(id) {
                this.icon_url = id;
                return this;
            },

            // 获取可继承属性
            getInherit() {
                var res = {};
                let that = this;
                this.inherit.forEach(x => res[x] = that.args[x]);
                return res;
            },

            getDataType(args) {
                return this.dataTypes;
            },

            handleNumberInput() {
                // 只读状态不做处理
                if(this.args.readonly) {
                    return;
                }
                let res = this.value;
                if (this.args.targetDataType === "Integer" || this.args.targetDataType === "Long" || this.args.targetDataType === "TimeStamp") {
                    res = parseInt(this.value);
                } else if (this.args.targetDataType === "Double") {
                    res = parseFloat(this.value);
                }
                if (res !== this.value) {
                    this.value = res;
                }
            }
        }
    }
</script>

<style scoped>
/*
    插件的css部分
    设置display为inline，默认不换行
    scoped表示样式仅在该vue文件内有效
*/
section {
    display: inline-block;
    width: 100%
}
</style>
