<template>
  <!--
        应用前端,即插件的实际显示样式
        :addinName="name"和ref="main"一般情况不可去除
  -->
  <section :addinName="name" :style="{'width': colWidth}" ref="main">
    <template v-if="args.structural_layout === 'horizontal'">
      <span v-if="args.required || args.label" :style="{'width': labelWidth, 'display': 'inline-block',
      'text-align': labelXAlign, 'vertical-align': labelYAlign, 'padding-right': '10px'}">
          <span v-show="!args.hided" :style="{'background-color': args.label_color, 'width': '100%', 'display': 'inline-block'}">
              <span v-if="args.required" style="color: red">*</span>
              <label class="ori-color self-color" :style="{'color': args_lfcolor, 'font-size': args_lfsize}">{{ args.label }}</label>
          </span>
      </span>
      <span
              :style="{'height': arg_height, 'width': mainWidth, 'display': 'inline-block',
            'text-align': mainXAlign, 'color': args.main_fontColor}"
      >
        <span
                v-show="!args.hided"
                :style="{'background-color': args.main_color, 'width': '100%', 'display': 'inline-block', 'vertical-align': mainYAlign}"
        >
        <div v-if="displayType!='create' && displayType!='edit'">
          <Icon
                  :class="objClick?'icon-addin':''"
                  v-if="displayValue.indexOf('icon')==-1"
                  :type="displayValue"
                  :color="args.iconColor"
                  :style="{'font-size':args_iconSize,'height': arg_height,'line-height': arg_height, 'width': '100%', 'display': 'inline-block'}"
                  @click="handleObjClick()"
          ></Icon>
          <i
                  v-else
                  class="iconfont"
                  :class="[objClick?'icon-addin':'',displayValue]"
                  :style="{'color':args.iconColor,'font-size':args_iconSize,'height': arg_height,'line-height': arg_height, 'width': '100%', 'display': 'inline-block'}"
                  @click="handleObjClick()"
          ></i>
          </div>
          <div v-else>
            <Input class="i-input self-color"
                   v-model="value"
                   @on-blur="blurEvent"
                   :disabled="args.readonly || t_visit"
                   :style="{'min-height': arg_height, 'line-height': arg_height, 'width': '100%', 'color': args_fcolor, 'font-size': args_fsize, 'display': 'inline-block', 'text-align': mainXAlign, 'vertical-align': mainYAlign}">
            </Input>
          </div>
        </span>
      </span>
    </template>
    <template v-else>
      <span v-if="args.required || args.label" :style="{'width': '100%', 'display': 'inline-block',
      'text-align': labelXAlign, 'vertical-align': labelYAlign, 'padding-right': '10px'}">
          <span v-show="!args.hided" :style="{'background-color': args.label_color, 'width': '100%', 'display': 'inline-block'}">
              <span v-if="args.required" style="color: red">*</span>
              <label class="ori-color self-color" :style="{'color': args_lfcolor, 'font-size': args_lfsize}">{{ args.label }}</label>
          </span>
      </span>
      <span
              :style="{'height': arg_height, 'width': '100%', 'display': 'inline-block',
            'text-align': mainXAlign, 'color': args.main_fontColor}"
      >
        <span
                v-show="!args.hided"
                :style="{'background-color': args.main_color, 'width': '100%', 'display': 'inline-block', 'vertical-align': mainYAlign}"
        >
        <div v-if="displayType!='create' && displayType!='edit'">
          <Icon
                  :class="objClick?'icon-addin':''"
                  v-if="displayValue.indexOf('icon')==-1"
                  :type="displayValue"
                  :color="args.iconColor"
                  :style="{'font-size':args_iconSize,'height': arg_height,'line-height': arg_height, 'width': '100%', 'display': 'inline-block'}"
                  @click="handleObjClick()"
          ></Icon>
          <i
                  v-else
                  class="iconfont"
                  :class="[objClick?'icon-addin':'',displayValue]"
                  :style="{'color':args.iconColor,'font-size':args_iconSize,'height': arg_height,'line-height': arg_height, 'width': '100%', 'display': 'inline-block'}"
                  @click="handleObjClick()"
          ></i>
          </div>
          <div v-else>
            <Input class="i-input self-color"
                   v-model="value"
                   @on-blur="blurEvent"
                   :disabled="args.readonly || t_visit"
                   :style="{'min-height': arg_height, 'line-height': arg_height, 'width': '100%', 'color': args_fcolor, 'font-size': args_fsize, 'display': 'inline-block', 'text-align': mainXAlign, 'vertical-align': mainYAlign}">
            </Input>
          </div>
        </span>
      </span>
    </template>

    <span v-show="(isRequired || isWrong) && !args.hided" :style="{'width': '100%', 'display': 'inline-block', 'padding-left': labelWidth}">
        <span v-show="isRequired" class="wrongTips">该项不能为空</span>
        <span v-show="isWrong" class="wrongTips">{{ errorMessage }}</span>
    </span>
  </section>
</template>

<script>
import "@/styles/component/iconfont.css";
// 设置插件英文名, 该name需要与插件文件名一致
const name = "icon";

export default {
  name: name,
  /*
     根据需要使用props
     一般情况下都需要itemValue,
     需要用到store时需要store
     */
  props: [
    'addin',
    'query',
    'argsProps',
    'store',
    'itemValue',
    'route',
    'root',
    'Message',
    'echarts',
    'formEngine',
    'dwf_ctx',
  ],
  data() {
    return {
      name: name,
      t_create: false,
      t_edit: false,
      t_visit: false,

      // 属性配置项,按需设置
      args: {
        name: "", // 目标属性
        label: "", // 标签名称
        id: "", // 控件代号,一般为必须
        rule: "", // 验证规则
        height: 30, // 整体高度
        // width: 33, // 整体宽度,单位为%或者px
        // widthType: "%", // 整体宽度的单位
        heightType: "px", // 整体高度的单位
        label_align: 4, // 标签区域对齐方式,0-8,默认为4居中对齐
        label_fontType: "", // 标签字体
        label_fontSize: 14, // 标签字号
        label_fontColor: "#000", // 标签字体颜色
        label_color: "#ffffff", // 标签背景颜色
        txt_fontColor: 'initial',         // 内容文字颜色
        txt_bgColor: '#fff',              // 输入框背景颜色
        lfsize: 14,// 标签文字大小
        lfsizeType: 'px',// 标签文字大小单位

        main_align: 4, // 主区域对齐方式,默认为4居中对齐
        main_fontType: "", // 主区域字体
        main_fontSize: 14, // 主区域字号
        main_fontColor: "#000000", // 主区域字体颜色
        main_color: "#ffffff", // 主区域背景颜色
        align: "Vertical", // 标签与主区域的排列方式
        label_width: 2,
        main_width: 3, // 标签与主区域的占比为 label_width : main_width
        required: false, // 是否必填
        readonly: false, // 是否只读
        hided: false, // 是否隐藏
        defaultValue: "", // 默认值

        // 以下为不在属性编辑框中设置,但默认要有的配置项
        title: "图标", // 插件中文名,需要填入默认值
        col: true, // 是否不占满全部
        cols: 3, // col=true时,宽度为 (100 / cols) %, 当设置了width之后失效
        targetDataType: null, // 目标数据类型
        events: [], // 已有的事件列表,元素格式为 { opr_type: '', opr_path: '', name: '事件中文名' }
        eventRange: [] // 支持的事件列表,元素为事件中文名
      },

      // 支持的数据类型, 基础数据类型为 String, TimeStamp, Boolean, Interger, Double, Long, UUID, Date, Clob
      dataTypes: ["String", "UUID", "Clob"],

      // 需要设置目标属性时使用
      attrMap: {},

      open: ["1", "2"],

      // 需要动态设置高度时使用
      timer: null,
      times: 0,

      // 一般插件的实际值用this.value存储
      value: null,
      displayType:"",
      displayValue:"",

      objClick: null, //点击事件
      isWrong: false,
      isRequired: false,
      errorMessage: '',
    };
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
  // 插件挂载顺序为: created -> setDisplayType -> setArgs -> setValue -> mounted
  created() {
    //通过prop给控件初始化
    this.setDisplayType(this.query.displayType);
    this.setArgs(this.argsProps);
  },
  mounted() {
    // 需要动态设置高度时使用,不用可删去
    this.setHeight();
     // 字体/颜色/ 默认继承
          this.$nextTick(() => {
            this.$refs.main.querySelectorAll('.ivu-poptip') && this.$refs.main.querySelectorAll('.ivu-poptip').length != 0
              ? this.$refs.main.querySelectorAll('.ivu-poptip').forEach(item => {
                item.style.width = '100%';
                item.parentNode.style.width = 'inherit';
              })
              : '';
            this.$refs.main.querySelectorAll('.ivu-poptip-rel') && this.$refs.main.querySelectorAll('.ivu-poptip-rel').length != 0
              ? this.$refs.main.querySelectorAll('.ivu-poptip-rel').forEach(item => {
                item.style.width = 'inherit';
              })
              : '';
            this.$refs.main.querySelector(".i-input .ivu-input").style.minHeight = 'inherit';
            this.$refs.main.querySelector(".i-input .ivu-input").style.color = 'inherit';
            this.$refs.main.querySelector(".i-input .ivu-input").style.fontSize = 'inherit';
            this.$refs.main.querySelector(".i-input .ivu-input").style.textAlign = 'inherit';
            // this.$refs.main.querySelector(".i-input .ivu-input").style.backgroundColor = 'inherit';
          })
    // 默认非空时 自动校验
    if (this.value != null &&this.value != "") {
      this.validate();
    }
    if (this.args.events && this.args.events.length > 0) {
      this.objClick = this.args.events.find(val => {
        return val.name == "点击";
      });
    }
  },
  watch: {},
  computed: {
    args_iconSize(){
      return this.args.iconSize + this.args.iconSizeType +  '!important';
    },
    // 标签文本字体大小
    args_lfsize(){
      return this.args.lfsize + this.args.lfsizeType + '!important';
    },
    args_lfcolor() {
      return this.args.label_fontColor == 'initial' ? 'initial' : this.args.label_fontColor + ' !important';
    },
    // 需要设置目标属性时使用,不用可删去
    arg_name() {
      return this.args.name;
    },
    // arg_width() {
    //   return this.args.width + this.args.widthType;
    // },
    arg_height() {
      // return this.args.height < 2 && this.args.heightType == 'px' ? this.args.height * 30 + "px" : this.args.height + this.args.heightType;
      return this.args.height < 3 && this.args.heightType == 'px' ? this.args.height * 30 + "px" : this.args.height + this.args.heightType;
    },
    colWidth() {
        return this.args.width + this.args.widthType;
      //    return this.args.col ? parseInt(100.0 / this.args.cols) + "%" : "100%";
    },
    labelWidth() {
      if(this.args.labelWidthUnit && this.args.labelWidthUnit === 'px'){
        return (!this.args.label || this.args.label == "") && this.args.required ? "10%" :  this.args.label_widthByPx + 'px';
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
    // 文本内容字体大小
    args_fsize() {
      return this.args.fsize + this.args.fsizeType + ' !important';
    },
    args_fcolor() {
      return this.args.txt_fontColor == 'initial' ? 'initial' : this.args.txt_fontColor + ' !important';
    },

  },
  // 销毁函数,清除生成的内存占用
  beforeDestroy() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  },
  methods: {
    // 动态监听数据变化
    onDynamic(value) {
      this.setValue(value);
    },

    // BLUR_EVENT
    async blurEvent() {

      // 失焦校验
      if(this.errorMessage == '') {
          this.validate();
      }

    },


    // 设置异常状态显示
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
      this.isRequired = false;
      if (this.args.required && (this.value == null||this.value == "")) {
        this.isRequired = true;
        expResult = false;
      }
      else if (this.value != null && this.args.rule) {
        expResult = new RegExp(this.args.rule).test(this.value);
      }
      this.setError(expResult ? null : true);

      return expResult;
    },

    // 获取插件对应的值,一般为this.value,特殊情况下需要进行格式转化,如日期字符串
    getValue() {
      return this.value;
    },

    /*
            设置插件对应的值,
            items目前为对应值
            items将为目标对象列表
            特殊情况下需要进行格式转化再赋值
        */
    setValue(items) {
      console.log(items)
      var value = null;
      if (items == null) {
        // 初始化操作
        value = "defaultValue" in this.args ? this.args.defaultValue : null;
      } else if (typeof items == "object") {
        if (items && items.length > 0) value = items[0][this.args.name];
      } else value = items;
      this.value = value;
      if (this.args.selfOptions!="") {
        // 中英文逗号替换
        this.args.selfOptions = this.args.selfOptions.replace(/，/gi, ",");
        let optionAttr = this.args.selfOptions.split(",");
        optionAttr.forEach((item, index) => {
          if (item != "") {
            // 中英文冒号替换
            this.args.selfOptions = this.args.selfOptions.replace(/：/gi, ",");
            let optionAttrValue = item.split(":");
            if (optionAttrValue[0] == this.value) {
              this.displayValue = optionAttrValue[1];
            }
          }
        });
      } else {
        this.displayValue = this.value || 'ios-add';
      }
      console.log("setValue", this.displayValue);
      return this;
    },

    // 当插件无法直接通过style设置高度时,使用setHeight方法设置高度
    setHeight() {
      if (!this.$refs.main) return;
      let that = this;
      if (this.timer == null) {
        this.timer = setInterval(() => {
          if (!that.$refs.main) {
            clearInterval(that.timer);
            that.timer = null;
            return;
          }
          // 改成你需要的样式
          var dom = that.$refs.main.querySelector(".i-input .ivu-input");
          if (dom) {
            dom.style.textAlign = 'inherit';
            dom.style.height = that.arg_height;
            clearInterval(that.timer);
            that.timer = null;
          } else {
            that.times += 30;
            if (that.times > 60 * 1000) {
              clearInterval(that.timer);
              that.timer = null;
            }
          }
        }, 30);
      }
    },

    /*
            type取值范围为 create, visit, edit
            需要根据三个状态修改具体前端和逻辑
            一般情况下:
                create创建态: 无数据,可编辑
                visit浏览态: 有数据,不可编辑
                edit编辑态: 有数据,可编辑
         */
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
      this.displayType = type;
      return this;
    },

    getFormName() {
      return this.args.name;
    },

    setArgs(args) {
      for (var i in args) {
        this.args[i] = args[i];
      }
      if(this.args.txt_bgColor == '#fff' && sessionStorage.getItem('skinStyle') == 'dark' && sessionStorage.getItem('appMenu')) this.args.txt_bgColor = 'transparent';

      return this;
    },

    getArgs() {
      return this.args;
    },

    getAllow() {
      return null;
    },

    getEditBox() {
      this.t_edit = true;
      return this.$refs.edit;
    },
    handleObjClick() {
      // 脚本触发的错误状态 不取消
      if(this.errorMessage == '') {
          this.validate();
      }
      if (this.objClick && !this.args.readonly ) {
        let obj = this.getObj(this.itemValue.data);
        this.invokeOperation(this.objClick.opr_type,this.objClick.opr_path,this.itemValue,this.store,null,obj
        );
      }
    }
  }
};
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
.icon-addin:hover{
  /* color: brown !important; */
  opacity:0.5 !important;
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
