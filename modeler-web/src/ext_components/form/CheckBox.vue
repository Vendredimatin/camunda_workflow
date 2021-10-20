<template>

  <section v-if="t_preview" :addinName="name" ref="main" :style="{'width': colWidth}">
    <template v-if="args.structural_layout === 'horizontal'">
      <!--
        标签, 一般的属性插件都有,如文本框
        对于不需要的插件,可以删去,如附件控件,图片控件,也可以将label设为空
      -->
      <span :id="args.labelWrap" v-if="args.required || args.label" :style="{'width': labelWidth, 'display': 'inline-block',
      'text-align': labelXAlign, 'vertical-align': labelYAlign, 'padding-right': '10px', 'float':(args.useDictionary?args.labelFloat:'none')}">
          <span :style="{'background-color': args.label_color, 'width': '100%', 'display': 'inline-block'}">
              <span v-if="args.required" style="color: red">*</span>
              <label :style="{'color': args.label_fontColor, 'font-size': args_lfsize}">{{ args.label }}</label>
          </span>
      </span>
      <!--
          插件前端实现区域
        -->
      <span :style="{'min-height': arg_height, 'width': mainWidth, 'display': 'inline-block',
          'text-align': mainXAlign, 'color': args.main_fontColor}">
          <span :style="{'background-color': args.main_color, 'width': '100%',
          'min-height': '100%', 'display': 'flex', 'vertical-align': mainYAlign}">

          <CheckboxGroup :id="args.checkWrap" v-model="defaultValue"
                         @on-change="defaultValueChange"
                         :style="{'margin-right': '0px', 'min-height': arg_height, 'width': '100%', 'align-items': 'center', 'display': 'flex', 'justify-content': checkboxMainXAlign, 'flex-wrap': 'wrap'}">
            <Checkbox
                    v-for="(item,index) in args.list"
                    :key="index"
                    :label="item.value">
                    <span class="checkItem" :style="{'max-width': mainWidth, 'font-size': args_fsize, 'color': args.txt_fontColor}">{{ item.label }}</span>
            </Checkbox
            >
          </CheckboxGroup>
          </span>
      </span>
    </template>
    <template v-else>
      <!--
        标签, 一般的属性插件都有,如文本框
        对于不需要的插件,可以删去,如附件控件,图片控件,也可以将label设为空
      -->
      <span :id="args.labelWrap" v-if="args.required || args.label" :style="{'width': '100%', 'display': 'inline-block',
      'text-align': labelXAlign, 'vertical-align': labelYAlign, 'padding-right': '10px', 'float':(args.useDictionary?args.labelFloat:'none')}">
          <span :style="{'background-color': args.label_color, 'width': '100%', 'display': 'inline-block'}">
              <span v-if="args.required" style="color: red">*</span>
              <label :style="{'color': args.label_fontColor, 'font-size': args_lfsize}">{{ args.label }}</label>
          </span>
      </span>
      <!--
          插件前端实现区域
        -->
      <span :style="{'min-height': arg_height, 'width': '100%', 'display': 'inline-block',
          'text-align': mainXAlign, 'color': args.main_fontColor}">
          <span :style="{'background-color': args.main_color, 'width': '100%',
          'min-height': '100%', 'display': 'flex', 'vertical-align': mainYAlign}">

          <CheckboxGroup :id="args.checkWrap" v-model="defaultValue"
                         @on-change="defaultValueChange"
                         :style="{'margin-right': '0px', 'min-height': arg_height, 'width': '100%', 'align-items': 'center', 'display': 'flex', 'justify-content': checkboxMainXAlign, 'flex-wrap': 'wrap'}">
            <Checkbox
                    v-for="(item,index) in args.list"
                    :key="index"
                    :label="item.value"
                    :style="{'font-size': args_fsize, 'color': args.txt_fontColor}"
            ><span class="checkItem" :style="{'max-width': mainWidth}">{{ item.label }}</span></Checkbox
            >
          </CheckboxGroup>
          </span>
      </span>
    </template>
    <!--
      预览模式时，有编辑框的显示；ref属性用于获取指定的dom元素，如ref="x",则在script中用this.$refs.x来选中该dom元素
    -->
    <slot name="widget"></slot>
    <span v-show="t_edit" ref="edit">

      <EditBox v-if="actEdit" :addinName="name" :widgetAnnotation="widgetAnnotation" :editExtendInfo="editExtendInfo" ref="editbox" v-model="args"
        :attributes="filter_attributes"
        :router="router"
        :route="route"
        :root="root"
        :itemValue="itemValue"
        :store="store"
        :query_oprs="query_oprs"
               :dataTypes="dataTypes"
        :targetclass="itemValue.data.targetClass">
          <div slot="attribute">
              <div class="margin1">
                <span class="margin1">自定义选项组</span>
                <i-switch size="small" style="float: right; margin-left: 6px;" v-model="args.useDictionary" @on-change="switchDictionary"/>
                <span style="float: right">数据字典</span>
              </div>
              <Input class="margin1" type="textarea" v-model="args.selfOptions" :disabled="args.useDictionary" placeholder="输入选项组内容, 如'a:1,b:2'" />
              <Button class="margin1" type="primary" :disabled="args.useDictionary" @click="createOptions" style="margin-right: 6px;">确认</Button>
              <Button class="margin1" :disabled="args.useDictionary" @click="resetOption">重置</Button>

          </div>
          <div slot="layout">

          </div>
          <div slot="operation">
          </div>
      </EditBox>

    </span>
  </section>
  <section v-else :addinName="name" style="text-align: center">
    <span style="text-align:center">
            <div class="form-addin-icon">
                <i class="iconfont">&#xe61f;</i>
      </div>
    </span>
    <div class="form-addin-name">复选框</div>
  </section>
</template>

<script>
/*
        插件的js部分
        如果有引用依赖等，在export default 之前进行引用
    */
import "@/styles/component/iconfont.css";
import EditBox from "./_EditBox.vue"
const name = "CheckBox";
export default {
	beforeDestroy() {
		if (this.timer) { clearInterval(this.timer); this.timer = null; };
	},
  // 插件名
  name: name,
  // 插件的数据逻辑，插件的属性在data中定义，用在js中用this.xxx进行访问
  props: ["argsProps", "widgetAnnotation", "editExtendInfo", "itemValue", "attributes", "query_oprs", "route", "router", "root", "store", "Message", "relation"],

  components: {
      EditBox
  },

  data() {
    return {
      times: 0,
      timer: null,
      // 插件名
      name: name,

      // 展示模式
      t_preview: true,
      t_show: false,
      t_icon: true,
      t_edit: false,

      dataTypes: ["String"],

      value: [],

      // 属性配置项,按需设置

      actEdit: false,
      args: {
          dynamic: false,
          labelWrap: '',
          checkWrap: '',
          bindTargetClass: '',
          filterQuery: '',
          useDictionary: false,
          noNumber: true,
          labelAttr: [],
          valueAttr: [],
          defaultValue: [],
          name: "",                   // 目标属性
          label: "",                  // 标签名称
          id: "",                     // 控件代号,一般为必须
          height: 30,                  // 整体高度=
          heightType: "px",                  // 整体高度=
          width: 100,
          widthType: '%',
          label_align: 4,             // 标签区域对齐方式,0-8,默认为4居中对齐
          label_fontColor: "initial",        // 标签字体颜色
          txt_fontColor: 'initial',//内容文字颜色
          lfsize:14,//标签文字大小
          lfsizeType:'px',//标签文字大小单位
          fsize: 14,//内容文字大小
          fsizeType: 'px',//内容文字大小单位
          label_color: "initial",     // 标签背景颜色
          main_align: 4,              // 主区域对齐方式,默认为4居中对齐
          main_fontColor: "initial",  // 主区域字体颜色
          main_color: "initial",      // 主区域背景颜色
          label_width: 2,
          main_width: 3,              // 标签与主区域的占比为 label_width : main_width
          required: false,            // 是否必填
          readonly: false,            // 是否只读
          hided: false,               // 是否隐藏
          labelFloat: 'none',
          // defaultValue: "",           // 默认值

          // 以下为不在属性编辑框中设置,但默认要有的配置项
          title: "复选框",               // 插件中文名,需要填入默认值
          col: true,                  // 是否不占满全部
          cols: 3,                    // col=true时,宽度为 (100 / cols) %, 当设置了width之后失效
          targetDataType: null,       // 目标数据类型
          events: [],                 // 已有的事件列表,元素格式为 { opr_type: '', opr_path: '', name: '事件中文名' }
          eventRange: ['值变化', "值校验"],      // 支持的事件列表,元素为事件中文名
          // oprs: {
          //     "ValueChanged":{
          //         "opr_path": "",
          //         "opr_type": "",
          //     },
          // },

          list: [{label: "默认选项", value: "默认选项"}],
          selfOptions: '',
          structural_layout: 'horizontal'   //整体布局
      },
      defaultValue: [],
      // 继承属性
      inherit: [],

      // 表单项名
      args_name: "",

      // 属性map
      attrMap: {},
    };
  },
  inject: [
    'setBasicArgs'
  ],
  created() {
    //通用方法给args赋值
    this.args = this.setBasicArgs(this.args);
    this.setArgs(this.args);
    if (this.t_preview) {

      this.$store = this.store;
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

    if(this.t_preview) {

      let ranNum = parseInt((Math.random() + 1) * Math.pow(10,7));
      this.args.checkWrap = `checkWrap${ranNum}`;
      this.args.labelWrap = `labelWrap${ranNum}`;

      if(this.args.useDictionary) {

        setTimeout(() => {

          this.setHeight();

        }, 50)
      }

    }

  },
  computed: {
    args_lfsize(){
      return this.args.lfsize + this.args.lfsizeType + ' !important';
    },
    args_fsize() {
      return this.args.fsize + this.args.fsizeType + ' !important';
    },
      // 需要用到属性插件时使用
    arg_height() {
      return this.args.height < 2 && this.args.heightType == 'px' ? this.args.height * 30 + "px" : this.args.height + this.args.heightType;
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
    //多选框位置控制，之前有问题
    checkboxMainXAlign(){
      let x = parseInt(this.args.main_align / 3);
      if (x == 0) return "flex-start";
      else if (x == 1) return "center";
      else return "flex-end";
    },
    arg_name() {
      return this.args.name;
    },
    filter_attributes() {
        return this.attributes ? ( this.relation ?
            [ "relation", this.attributes[1].filter(x => this.dataTypes.indexOf(x.valueType) > -1),
            this.attributes[2].filter(x => this.dataTypes.indexOf(x.valueType) > -1),
            this.attributes[3].filter(x => this.dataTypes.indexOf(x.valueType) > -1) ] : this.attributes.filter(x => this.dataTypes.indexOf(x.valueType) > -1) ) : [];
    },
  },
  watch: {

    arg_height(val) {
      if(this.args.useDictionary) {
        setTimeout(() => {
          this.setHeight();
        }, 50)
      }
    },

    arg_name(val) {
        if (val in this.attrMap) {
            this.args.targetDataType = this.attrMap[val].valueType;
            const dType = this.args.targetDataType;
            if (this.t_edit) {
              if (dType == 'Double' || dType == 'Integer' || dType == 'Long') {

                this.args.noNumber = false;
                this.args.valueAttr = '';

              } else {

                this.args.noNumber = true;
                this.args.valueAttr = [];
              }
            }
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
        } else this.args.targetDataType = null;

        if(val && val != '') {
          if(this.args.useDictionary) {
            setTimeout(() => {
              this.setHeight();
            }, 50)
          }
        }
    },
      // %s
    attributes(val) {
      this.attrMap = {};
      if (val) val.forEach(x => (this.attrMap[x.attributeName] = x));
    },
    'args.defaultValue'(val){
      if(!val) {
        this.defaultValue = [];
      } else {
        this.defaultValue = val && typeof val === 'string' ? val.split(',') : val;
      }
    },
    'args.bindTargetClass'(val) {
      setTimeout(() => {
        this.setHeight();
      }, 50)
    },
    'args.labelAttr'(val) {
      setTimeout(() => {
        this.setHeight();
      }, 50)
    }
    // end
  },
  // 定义组件的函数接口
  methods: {
    switchDictionary(value) {

      this.args.labelFloat = 'none';
      // this.args.selfOptions = '';
      // this.args.bindTargetClass = '';
      // this.args.labelAttr = [];
      // this.args.valueAttr = [];
      if(!value) {
        if(this.args.selfOptions != '') {
          this.createOptions();
        } else {
          this.args.list = [{label: "默认选项", value: "默认选项"}];
        }
      }
      let lwrap = document.getElementById(this.args.labelWrap);
      if(lwrap) {
        lwrap.style.height = 'auto';
        lwrap.style.lineHeight = 'normal';
      }

    },
    resizeChart() {
      if(this.args.useDictionary) {

        setTimeout(() => {
          this.setHeight();
        }, 50)

      }
    },
    setHeight() {

        let wrap = document.getElementById(this.args.checkWrap);
        let lwrap = document.getElementById(this.args.labelWrap);

        let actHeight;
        try {

          if(document.defaultView.getComputedStyle) { // 考虑IE还是得考虑鸭
            actHeight = document.defaultView.getComputedStyle(wrap, null);
          } else {
            actHeight = wrap.currentStyle;
          }

        } catch (error) {
          actHeight = wrap.currentStyle;
        }

        if(lwrap) {

          if(this.args.bindTargetClass && this.args.bindTargetClass != '' && this.args.bindTargetClass != undefined) {
            this.args.labelFloat = 'left';
            lwrap.style.height = actHeight.height;
            lwrap.style.lineHeight = actHeight.height;
          }

        }

			},

    // 确认创建Options
    createOptions() {
        if (this.args.selfOptions == '') {
            this.$Message.info('请先输入所需自定义复选框内容');
        } else {
            this.args.list = [];
            this.args.defaultValue = [];

            // 中英文逗号替换
            this.args.selfOptions = this.args.selfOptions.replace(/，/ig,',');
            let optionAttr = this.args.selfOptions.split(',');
            optionAttr.forEach((item, index) => {
                if(item != '') {

                    if(item.indexOf(':') == -1) {     // label 与 value相同时
                        let eachOption = {
                            label: item,
                            value: item
                        }
                        this.args.list.splice(index, 0, eachOption);
                    } else {                           // label 与 value不同
                        let eachOption = {
                            label: item.split(":")[0],
                            value: item.split(":")[1]
                        }
                        this.args.list.splice(index, 0, eachOption);
                    }

                }
            })
        }
    },

    resetOption() {
      this.args.selfOptions = [];
      this.args.list = [{label: "默认选项", value: "默认选项"}];
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

    // 设置插件支持的数据类型，返回类型为数据类型的列表
    getDataType(args) {
      return this.dataTypes;
    },
    defaultValueChange(value){
      console.log(value)
      this.args.defaultValue = value;
    }
  }
};
</script>

<style scoped>
/*
    插件的css部分
    设置display为inline，默认不换行
    scoped表示样式仅在该vue文件内有效
*/
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
.checkItem {
  word-break: break-all;
}
</style>
