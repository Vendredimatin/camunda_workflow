<template>
    <section v-if="t_preview" :addinName="name" ref="main" :style="{'width': colWidth}">
      <template v-if="args.structural_layout === 'horizontal'">
        <section :style="{'display': 'flex', 'align-items': labelXAlignFlex, 'justify-content': labelXAlign}">

        <span v-if="args.required || args.label" :style="{'width': labelWidth, 'display': 'inline-block',
        'text-align': labelXAlign, 'padding-right': '10px'}">
            <span :style="{'background-color': args.label_color, 'width': '100%', 'display': 'flex', 'justify-content': labelXAlign}">
                <span v-if="args.required" style="color: red">*</span>
                <label :style="{'color': args.label_fontColor, 'font-size': args_lfsize}">{{ args.label }}</label>
            </span>
        </span>
          <!-- <label v-if="args.label" :style="{'width': labelWidth, 'display': 'inline-block', 'text-align': labelXAlign, 'vertical-align': labelYAlign}">{{ args.label }}</label> -->
          <span :style="{'height': arg_height, 'width': mainWidth, 'display': 'inline-block',
            'text-align': mainXAlign, 'color': args.main_fontColor}">
            <span :style="{'height': arg_height,'background-color': args.main_color, 'width': '100%', 'display': 'flex', 'align-items': 'center', 'justify-content': mainXAlign}">
            <i-switch
                    v-model="value"
                    :style="{'background-color':background_color}"
                    :disabled="args.readonly"
            ></i-switch>
            </span>
        </span>

        </section>
      </template>
      <template v-else>
        <section :style="{'align-items': labelXAlignFlex, 'justify-content': labelXAlign}">

        <span v-if="args.required || args.label" :style="{'width': '100%', 'display': 'inline-block',
        'text-align': labelXAlign, 'padding-right': '10px'}">
            <span :style="{'background-color': args.label_color, 'width': '100%', 'display': 'flex', 'justify-content': labelXAlign}">
                <span v-if="args.required" style="color: red">*</span>
                <label :style="{'color': args.label_fontColor, 'font-size': args_lfsize}">{{ args.label }}</label>
            </span>
        </span>
          <!-- <label v-if="args.label" :style="{'width': labelWidth, 'display': 'inline-block', 'text-align': labelXAlign, 'vertical-align': labelYAlign}">{{ args.label }}</label> -->
          <span :style="{'height': arg_height, 'width': '100%', 'display': 'inline-block',
            'text-align': mainXAlign, 'color': args.main_fontColor}">
            <span :style="{'height': arg_height,'background-color': args.main_color, 'width': '100%', 'display': 'flex', 'align-items': 'center', 'justify-content': mainXAlign}">
            <i-switch
                    v-model="value"
                    :style="{'background-color':background_color}"
                    :disabled="args.readonly"
            ></i-switch>
            </span>
        </span>

        </section>
      </template>
      <slot name="widget"></slot>
<span v-show="t_edit" ref="edit">

            <EditBox v-if="actEdit" :addinName="name" :widgetAnnotation="widgetAnnotation" :editExtendInfo="editExtendInfo" ref="editbox" v-model="args"
            :attributes="filter_attributes"
            :router="router"
            :route="route"
            :itemValue="itemValue"
            :root="root"
            :query_oprs="query_oprs"
                     :dataTypes="dataTypes"
            :targetclass="itemValue.data.targetClass">
                <div slot="attribute">
                    <!-- <div class="margin1" style="padding: 0 20px 0 20px;margin: 10px 0 10px 0">
                        默认值
                        <i-switch style="float: right" v-model="args.defaultValue" />
                    </div> -->
                </div>
                <div slot="layout">

                </div>
                <div slot="operation">
                </div>
            </EditBox>
        </span>
    </section>
    <section v-else style="text-align: center" :addinName="name">
        <div class="form-addin-icon">
                <i class="iconfont">&#xe623;</i>
        </div>
        <div class="form-addin-name">开关</div>
    </section>
</template>

<script>
    /*
        插件的js部分
        如果有引用依赖等，在export default 之前进行引用
    */
    import "@/styles/component/iconfont.css"
    import BindOperationBar from "./subcomponent/BindOperationBar.vue"
    import EditBox from "./_EditBox.vue"
    const name = "Switch";
    export default {
        // 插件名
        name: name,
        props: ["argsProps", "widgetAnnotation", "editExtendInfo" , "itemValue", "attributes", "query_oprs", "route", "router", "root", "store", "Message", "relation"],
        components: {
            BindOperationBar, EditBox
        },
        // 插件的数据逻辑，插件的属性在data中定义，用在js中用this.xxx进行访问
        data() {
            return {
                // 插件名
                name: name,
                // 展示模式
                t_preview: true,
                t_show: false,
                t_icon: true,
                t_edit: false,
                dataTypes: ["Boolean"],
                value:false,
                // 图标地址
                icon_url: "https://ss3.bdstatic.com/70cFv8Sh_Q1YnxGkpoWK1HF6hhy/it/u=170167733,3877240552&fm=27&gp=0.jpg",
                // 编辑框

      actEdit: false,
      args: {
                  dynamic: false,
                    defaultValue: '',
                    label_fontColor: 'initial',
                    lfsize:14,//标签文字大小
                    lfsizeType:'px',//标签文字大小单位
                    label_color: 'initial',
                    id:"",
                    title:"开关",
                    label: "",
                    name: "",
                    required: false,
                    readonly: false,
                    hided: false,
                    label_width: 2,
                    main_width: 3,
                    label_align: 4,
                    main_align: 4,
                    // 属性插件所需属性
                    targetDataType: null,
                    // 布局插件所需属性
                    height: 30,
                    heightType: "px",
                    width: 100,
                    widthType: '%',
                    col: true,
                    cols: 3,
                    events: [],
                    eventRange: ["值变化"],
                    // 事件操作所需配置
                    // oprs: {
                    //     "ValueChanged":{
                    //         "opr_path": "",
                    //         "opr_type": "",
                    //     },
                    // }
                    structural_layout: 'horizontal'   //整体布局
                },
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
                value: null,
                // 事件操作所需属性
                // event_name: "ValueChanged",
                // event_list: ["ValueChanged"],
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
                if (this.attributes) {
                    if (this.relation) {
                        this.attributes[1].forEach(x => that.attrMap['relation_' + x.attributeName] = x);
                        this.attributes[2].forEach(x => that.attrMap['left_' + x.attributeName] = x);
                        this.attributes[3].forEach(x => that.attrMap['right_' + x.attributeName] = x);
                    } else {
                        this.attributes.forEach(x => that.attrMap[x.attributeName] = x)
                    }
                }
            }
        },
        // 生命周期函数，在dom元素生成之后调用
        mounted() {
            //this.$refs.main.querySelector(".i-input .ivu-input").style.fontsize = 'inherit';
            //this.$refs.main.querySelector(".i-input .ivu-input").style.color = 'inherit';
        },
        watch: {
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
                if (this.value == "true") this.value = true;
                else if (this.value == "false") this.value = false;
            } else this.args.targetDataType = null;
        },
            attributes(val) {
                this.attrMap = {};
                if(val) val.forEach(x => this.attrMap[x.attributeName] = x);
            },
            // end
            arg_default_value(val) {
              if (val.toString() == "true") this.value = true;
              else if (val.toString() == "false") this.value = false;
              else if (val.toString() == "") this.value = '';
            },
          value(val){
            this.args.defaultValue = val
          }
        },
        computed: {
            background_color(){
                if(this.value === true){
                    return this.args.txt_fontColor
                }else{
                    return '#ccc'
                }
            },
            arg_default_value() { return this.args.defaultValue },
            arg_height() {
                return this.args.height < 2 && this.args.heightType == 'px' ? this.args.height * 30 + "px" : this.args.height + this.args.heightType;
            },
            args_lfsize(){
                return this.args.lfsize + this.args.lfsizeType + ' !important';
            },
            colWidth() {
              return this.args.width + this.args.widthType;
              // return this.args.col ? parseInt(100 / this.args.cols) + "%" : "100%";
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
            //使用flex
            labelXAlign() {
              let x = parseInt(this.args.label_align / 3);
              if (x == 0) return "flex-start";
              else if (x == 1) return "center";
              else return "flex-end";
            },
            labelXAlignFlex(){
              let x = this.args.label_align % 3;
              if (x == 0) return "flex-start";
              else if (x == 1) return "center";
              else return "flex-end";
            },
            labelYAlign() {
              let x = this.args.label_align % 3;
              if (x == 0) return "top";
              else if (x == 1) return "middle";
              else return "bottom";
            },
            mainXAlign() {
              let x = parseInt(this.args.main_align / 3);
              if (x == 0) return "flex-start";
              else if (x == 1) return "center";
              else return "flex-end";
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
        // 定义组件的函数接口
        methods: {
            onDynamic(value){
              this.setValue(value);
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
                if ("label" in args){
          let label = args.label;
          setTimeout(() => {
            this.args.label = label;
          }, 0);
        }
                if ("name" in args) this.args_name = this.filter_attributes.filter(x => x.attributeName == this.args.name).length > 0 ? this.args.name : "-1";
                delete this.args['txt_bgColor'];
                return this;
            },
            // 获取表单项名
            getFormName() {
                return this.args.name;
            },
            // 获取插件的属性编辑框的dom元素
            getEditBoxComponent(){
      return this.$refs.editbox;
    },

    getEditBox(args) {
                this.t_edit = true;
                return this.$refs.edit;
            },
            // 获取插件名
            getName() {
                return name;
            },
            // 设置插件的显示类型，type=0为预览模式，type=1为运行模式，type=2为图标模式
            setDisplayType(type) {
                this.t_preview = type == 0;
                return this;
            },
            // 设置插件的图标
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
            // 设置插件支持的数据类型，返回类型为数据类型的列表
            getDataType(args) {
                return this.dataTypes;
            },
        }
    }
</script>

<style scoped>
section {
  display: inline-block;
  width: 100%;
  vertical-align: top;
}
p {
  margin: 10px 0;
}
.margin1 {
    margin-top: 5px;
    margin-bottom: 5px;
}
</style>
