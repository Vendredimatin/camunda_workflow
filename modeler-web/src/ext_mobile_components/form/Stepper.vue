<template>
        <section v-if="t_preview" :addinName="name" :style="{'font-size': '14px', 'width': colWidth}" ref="main">
          <template v-if="args.structural_layout === 'horizontal'">
            <span v-if="args.required || args.label" :style="{'width': labelWidth, 'display': 'inline-block',
                'text-align': labelXAlign, 'vertical-align': labelYAlign,
                'background-color': args.label_color, 'padding-right': '10px'}">
                    <span v-if="args.required" style="color: red">*</span>
                    <label :style="{'color': args.label_fontColor, 'font-size': args_lfsize}">{{ args.label }}</label>
            </span>
            <span :style="{'height': arg_height,'line-height': arg_height, 'width': mainWidth, 'display': 'inline-block',
                'text-align': mainXAlign, 'vertical-align': mainYAlign,
                'font-size': args_fsize,
                'color': args.txt_fontColor}">
                <van-stepper ref="number"
                             class="i-input"
                             v-model="arg_defaultvalue"
                             :theme="args.theme"
                             :max="parseFloat(args.max)"
                             :min="parseFloat(args.min)"
                             :step="parseFloat(args.step)"
                             :disable-input="args.readonly"
                             :disable-minus="args.readonly"
                             :disable-plus="args.readonly"
                             :button-size="arg_btnSize"
                             :input-width="args_inputWidth"
                             :integer="arg_integer"
                             @change="numberDefaultValueChange"
                />
            </span>
          </template>
          <template v-else>
            <span v-if="args.required || args.label" :style="{'width': '100%', 'display': 'inline-block',
                'text-align': labelXAlign, 'vertical-align': labelYAlign,
                'background-color': args.label_color, 'padding-right': '10px'}">
                    <span v-if="args.required" style="color: red">*</span>
                    <label :style="{'color': args.label_fontColor, 'font-size': args_lfsize}">{{ args.label }}</label>
            </span>
            <span :style="{'height': arg_height, 'width': '100%', 'display': 'inline-block',
                'text-align': mainXAlign, 'vertical-align': mainYAlign,
                'font-size': args_fsize,
                'color': args.txt_fontColor}">
                <van-stepper ref="number"
                             class="i-input"
                             v-model="arg_defaultvalue"
                             :theme="args.theme"
                             :max="parseFloat(args.max)"
                             :min="parseFloat(args.min)"
                             :step="parseFloat(args.step)"
                             :disable-input="args.readonly"
                             :disable-minus="args.readonly"
                             :disable-plus="args.readonly"
                             :button-size="arg_btnSize"
                             :input-width="args_inputWidth"
                             :integer="arg_integer"
                             @change="numberDefaultValueChange"
                />
      </span>
    </template>
    <slot name="widget"></slot>
    <span v-show="t_edit" ref="edit">
      <EditBox v-if="actEdit" :widgetAnnotation="widgetAnnotation" :editExtendInfo="editExtendInfo" ref="editbox"
               v-model="args"
               :attributes="filter_attributes"
               :router="router"
               :itemValue="itemValue"
               :route="route"
               :root="root"
               :addinName="name"
               :query_oprs="query_oprs"
               :dataTypes="dataTypes"
               :targetclass="itemValue.data.targetClass">
                    <div slot="attribute">

                        <p class="margin1">最大值</p>
                        <InputNumber class="margin1" :min="args.min + 1" style="width: 100%" v-model="args.max" placeholder="最大值"/>
                        <p class="margin1">最小值</p>
                        <InputNumber class="margin1" style="width: 100%" v-model="args.min" placeholder="最小值"/>

                        <p class="margin1">步长</p>
                        <InputNumber class="margin1" style="width: 100%" :max="1e20" :min="-1e20"  v-model="args.step" @on-change="checkInt" />


                    </div>
                    <div slot="layout">
                        <p class="margin1">按钮风格</p>
                        <Select v-model="args.theme">
                            <Option value="default">默认</Option>
                            <Option value="round">圆角风格</Option>
                        </Select>
                        <p class="margin1">按钮大小</p>
                        <Input class="margin1" v-model="args.btnSize" @on-change="nonegbtnSize" type="number">
                            <Select v-model="args.btnSizeType" slot="append" style="width: 70px;">
                            <Option value="px">px</Option>
                            <Option value="rem">rem</Option>
                            </Select>
                        </Input>
                        <p class="margin1">输入框宽度</p>
                        <Input class="margin1" v-model="args.inputWidth" @on-change="noneginputWidth" type="number">
                            <Select v-model="args.inputWidthType" slot="append" style="width: 70px;">
                            <Option value="px">px</Option>
                            <Option value="rem">rem</Option>
                            </Select>
                        </Input>
                        <div class="margin1">
                            <p class="margin1" style="float: left; margin-right: 15px;">按钮背景颜色:</p>
                            <ColorPicker v-model="args.btn_backcolor"/>
                        </div>
                        <div class="margin1">
                            <p class="margin1" style="float: left; margin-right: 15px;">按钮内容颜色:</p>
                            <ColorPicker v-model="args.btn_color"/>
                        </div>
                    </div>
                    <div slot="operation">
                    </div>
                </EditBox>
            </span>
        </section>
        <section v-else :addinName="name" style="text-align: center">
            <div class="form-addin-icon">
                <i class="iconfont">&#xe6f2;</i>
            </div>

          <div class="form-addin-name">
            步进器
          </div>
<!--            <Tooltip content="数字框" class="form-addin-name" style="line-height: 30px; float: left;" :transfer="true">数字框</Tooltip>-->
        </section>
</template>

<script>
    import "@/styles/component/iconfont.css"
    import EditBox from "@/ext_components/form/_EditBox.vue"
    import BindOperationBar from "@/ext_components/form/subcomponent/BindOperationBar.vue"
const name = "Stepper";
export default {
  name: name,
  props: ["argsProps", "widgetAnnotation", "editExtendInfo", "itemValue", "attributes", "query_oprs", "route", "router", "root", "store", "Message", "relation"],
  components: {
    BindOperationBar, EditBox
  },
  data() {
    return {
        aaaa:0,
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
        btn_backcolor: "#f2f3f5",
        btn_color: '#000',
        txt_bgColor: "#f2f3f5", // 输入框背景颜色
        txt_fontColor: "initial", // 内容文字颜色
        dynamic: false,     // 动态响应
        needCheckDuplic: false,
        defaultValue: 0,
        label_fontColor: 'initial',       // 标签文字颜色
        lfsize: 14,                       // 标签文字大小
        lfsizeType: 'px',                 // 标签文字大小单位
        fsize: 14,//内容文字大小
        fsizeType: 'px',//内容文字大小单位
        label_color: "initial",
        main_fontColor: "initial",
        main_color: "initial",
        inputWidth: 32,
        inputWidthType: 'px',
        btnSize: 28,
        btnSizeType: 'px', 
        id: "",
        theme: 'default',
        title: "步进器",
        max: Number.MAX_VALUE,
        min: -Number.MAX_VALUE,
        step: 1,
        required: false,
        readonly: false,
        hided: false,
        label: null,
        name: null,
        label_width: 2,
        main_width: 3,
        label_align: 4,
        main_align: 4,
        // 属性插件所需属性
        targetDataType: null,
        width: 100,
        widthType: '%',
        height: 44,
        heightType: "px",
        col: true,
        // 布局插件所需属性
        rows: 0,
        cols: 0,
        events: [],
        eventRange: ["值变化", "失去焦点", "获得焦点"],
        structural_layout: 'horizontal'   //整体布局
      },
        dataTypes: ['Integer', 'Long', 'Double'],
        value: null,
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
      timer: null,
    }
  },
  inject: [
    'setBasicArgs'
  ],
  created() {
    //通用方法给args赋值
    this.args = this.setBasicArgs(this.args);
    this.setArgs(this.args);
    let that = this;
    if (this.attributes) {
      if (this.relation) {
        this.attributes[1].forEach(x => that.attrMap['relation_' + x.attributeName] = x);
        this.attributes[2].forEach(x => that.attrMap['left_' + x.attributeName] = x);
        this.attributes[3].forEach(x => that.attrMap['right_' + x.attributeName] = x);
      } else {
        this.attributes.forEach(x => that.attrMap[x.attributeName] = x)
      }
    }
  },
  // 生命周期函数，在dom元素生成之后调用
  mounted() {
    this.$nextTick(() => {
      if (this.t_preview) {
        // 字体 ／ 颜色 默认继承
        this.setCss()
      }
    })
  },
  beforeDestroy() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
    ;
  },
  watch: {
        'args.min'(val) {
            if(val && this.args.max <= this.args.min) {
                this.args.max = val + 1;
            }
        },
        'args.width'(val) {
            if (val && this.args.widthType == 'px' && this.args.inputWidthType == 'px' && this.args.btnSizeType == 'px') {
                this.args.inputWidth = val - 14 - 2 * this.args.btnSize;
            }
        },
          'args.txt_bgColor'(val){
            if(!val){
              this.args.txt_bgColor = 'inherit'
            }
          },
            // 需要用到实体类属性列表时使用
          arg_name(val) {
            if (val in this.attrMap) {
                this.args.targetDataType = this.attrMap[val].valueType;
                if (this.relation) {
                    if (val.startsWith("left_")) this.args.label = (this.relation.leftRole != "" ? this.relation.leftRole : this.relation.leftClass) + "的" + this.attrMap[val].displayName;
                    if (val.startsWith("right_")) this.args.label = (this.relation.rightRole != "" ? this.relation.rightRole : this.relation.rightClass) + "的" + this.attrMap[val].displayName;
                    if (val.startsWith("relation_")) this.args.label = this.attrMap[val].displayName;
                } else this.args.label = this.attrMap[val].displayName;
                let name = val;
                if (this.relation) {
                    if (name.startsWith("left_")) name = name.substring(5);
                    else if (name.startsWith("right_")) name = name.substring(6);
                    else if (name.startsWith("relation_")) name = name.substring(9);
                }
                let attr = this.store.state.DWF_form.Attributes[name];
                if (attr && attr.defaultValue) this.value = attr.defaultValue;
                if (this.args.targetDataType == "Integer" || this.args.targetDataType == "Long") {
                    try {
                        this.value = parseInt(this.value);
                    } catch (e) {
                        this.value = null;
                    }
                }
                else if (this.args.targetDataType == "Double") {
                    try {
                        if (this.value) this.value = parseFloat(this.value);
                    } catch (e) {
                        this.value = null;
                    }
                }
                if (isNaN(this.value)) this.value = null;
            } else this.args.targetDataType = null;
        },
            'args.btn_color'(val) {
                this.setCss();
            },
            'args.btn_backcolor'(val) {
                this.setCss();
            },
            'args.txt_bgColor'(val) {
                this.setCss();
            },
            // end
        },
        computed: {
            arg_defaultvalue() {
                if (this.args.defaultValue && this.args.defaultValue != '') return this.args.defaultValue;
                return 0;
            },
            arg_integer() {
                if (this.args.targetDataType === "Integer" || this.args.targetDataType === "Long" || this.args.targetDataType === "TimeStamp") {
                    return true
                } 
                return false
            },
            arg_btnSize() {
                return this.args.btnSize + this.args.btnSizeType;
            },
            arg_height() {
                return this.args.height < 2 && this.args.heightType == 'px' ? this.args.height * 30 + "px" : this.args.height + this.args.heightType;
            },
            colWidth() {
                return this.args.width + this.args.widthType;
            },
            labelWidth() {
                if(this.args.labelWidthUnit && this.args.labelWidthUnit === 'px'){
                return (!this.args.label || this.args.label == "") && this.args.required ? "10%" : this.args.label_widthByPx + 'px';
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
            // 文本内容字体大小
            args_fsize() {
                return this.args.fsize + this.args.fsizeType + ' !important';
            },
            args_inputWidth() {
                return this.args.inputWidth + this.args.inputWidthType
            },
            // 标签文本内容字体大小
            args_lfsize() {
                return this.args.lfsize + this.args.lfsizeType + ' !important';
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
                return this.attributes ? ( this.relation ?
                    [ "relation", this.attributes[1].filter(x => this.dataTypes.indexOf(x.valueType) > -1),
                    this.attributes[2].filter(x => this.dataTypes.indexOf(x.valueType) > -1),
                    this.attributes[3].filter(x => this.dataTypes.indexOf(x.valueType) > -1) ] : this.attributes.filter(x => this.dataTypes.indexOf(x.valueType) > -1) ) : [];
            },
                // end
        },
        methods: {
            setCss() {
                // // this.$refs.main.querySelector(".i-input.ivu-input-number").style.backgroundColor = 'inherit';
                this.$refs.main.querySelector(".i-input").style.fontSize = 'inherit';
                this.$refs.main.querySelector(".i-input").style.height = 'inherit';
                this.$refs.main.querySelector(".i-input").style.backgroundColor = 'inherit';
                this.$refs.main.querySelector(".van-stepper__input")?this.$refs.main.querySelector(".van-stepper__input").style.backgroundColor = this.args.txt_bgColor? this.args.txt_bgColor: 'transparent':'';
                this.$refs.main.querySelector(".van-stepper__plus")?this.$refs.main.querySelector(".van-stepper__plus").style.backgroundColor = this.args.btn_backcolor ? this.args.btn_backcolor :'transparent':'';
                this.$refs.main.querySelector(".van-stepper__minus")?this.$refs.main.querySelector(".van-stepper__minus").style.backgroundColor = this.args.btn_backcolor? this.args.btn_backcolor: 'transparent':'';
                this.$refs.main.querySelector(".van-stepper__plus")?this.$refs.main.querySelector(".van-stepper__plus").style.color = this.args.btn_color?this.args.btn_color:'transparent':'';
                this.$refs.main.querySelector(".van-stepper__minus")?this.$refs.main.querySelector(".van-stepper__minus").style.color = this.args.btn_color?this.args.btn_color:'transparent':'';


            },
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
                if ("label" in args) {
                    let label = args.label;
                    setTimeout(() => {
                    this.args.label = label;
                    }, 0);
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
                this.t_preview = type == 0;
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
            regInt() {
                if (this.args.targetDataType === "Integer" || this.args.targetDataType === "Long" || this.args.targetDataType === "TimeStamp") {
                    if(/\./.test(this.value)) {
                        this.$Message.warning('当前绑定属性，只能输入整数哦~');
                        this.value = parseInt(this.value);
                    }
                }
            },
            checkInt() {
                if (this.args.targetDataType === "Integer" || this.args.targetDataType === "Long" || this.args.targetDataType === "TimeStamp") {
                    if(/\./.test(this.args.step)) {
                        this.$Message.warning('当前绑定属性，只能输入整数哦~');
                        this.$nextTick(() => {

                            this.args.step = parseInt(this.args.step);
                        })
                    }
                }

            },
          numberDefaultValueChange(value){
            // if(value && this.args.name){
            //   if(this.attrMap[this.args.name].valueType !== 'Double'){
            //     let parseValue = parseInt(value);
            //     setTimeout(() => {
            //       this.args.defaultValue = this.defaultValue = parseValue;
            //     }, 10)
            //   }
            // }
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
            },
            nonegbtnSize() {
                let val = parseFloat(this.args.btnSize)
                console.log('no neg',val)
                this.$nextTick(() => {
                    if (val<0) this.args.btnSize = -val;
                })
            },
            noneginputWidth() {
                let val = parseFloat(this.args.inputWidth)
                this.$nextTick(() => {
                    if (val<0) this.args.inputWidth = -val;
                })
            },
        }
    }
</script>
<style>
.van-stepper .van-stepper__input {
    font-size: inherit;
    color: inherit;
}
.van-stepper--round .van-stepper__minus {
    border: none;
}
</style>

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
.margin1 {
    margin-top: 5px;
    margin-bottom: 5px;
}
</style>