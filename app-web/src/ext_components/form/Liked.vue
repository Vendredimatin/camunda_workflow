<template>
  <!--
        应用前端,即插件的实际显示样式
        :addinName="name"和ref="main"一般情况不可去除
  -->
  <section v-show="!args.hided" :addinName="name" :style="{'width': colWidth}" ref="main">
    <template v-if="args.structural_layout === 'horizontal'">
      <span
              v-if="args.required || args.label"
              :style="{'width': labelWidth, 'height': arg_height, 'display': 'inline-block',
        'text-align': labelXAlign, 'vertical-align': labelYAlign,  'padding-right': '10px'}"
      >
      <span
              :style="{'background-color': args.label_color, 'width': '100%', 'display': 'inline-block'}"
      >
        <span v-if="args.required" style="color: red">*</span>
        <label class="ori-color self-color" :style="{'color': args_lfcolor,'font-size':args_lfsize}" >{{ args.label }}</label>
      </span>
    </span>
      <span
              :style="{'height': arg_height, 'width': mainWidth, 'display': 'inline-block',
            'text-align': mainXAlign, 'color': args.main_fontColor}"
      >
      <span
              :style="{'background-color': args.main_color, 'width': '100%', 'display': 'inline-block', 'vertical-align': mainYAlign}"
      >
         <div
                 v-on:click="likeClick"
                 :style="{'height':arg_height,'display': 'inline-block','background-color':bgColor, 'border-radius': '22px','padding':'1px 12px'}"
         >
          <Icon
                  :type="args.iconType"
                  :color="iconColor"
                  :style="{'font-size':args_fsize,'padding-bottom':'5px'}"
          />
          <span class='icon-txt' :style="{'font-size':args_fsize,'color':args.txt_fontColor,'line-height':arg_height,'padding':args.labelValue?'0px 8px':'0px'}">{{args.labelValue}}</span>
        </div>

      </span>
    </span>
    </template>
    <template v-else>
      <span
              v-if="args.required || args.label"
              :style="{'width': '100%', 'height': arg_height, 'display': 'inline-block',
        'text-align': labelXAlign, 'vertical-align': labelYAlign,  'padding-right': '10px'}"
      >
      <span
              :style="{'background-color': args.label_color, 'width': '100%', 'display': 'inline-block'}"
      >
        <span v-if="args.required" style="color: red">*</span>
        <label class="ori-color self-color" :style="{'color': args_lfcolor,'font-size':args_lfsize}" >{{ args.label }}</label>
      </span>
    </span>
      <span
              :style="{'height': arg_height, 'width': '100%', 'display': 'inline-block',
            'text-align': mainXAlign, 'color': args.main_fontColor}"
      >
      <span
              :style="{'background-color': args.main_color, 'width': '100%', 'display': 'inline-block', 'vertical-align': mainYAlign}"
      >
         <div
                 v-on:click="likeClick"
                 :style="{'height':arg_height,'display': 'inline-block','background-color':bgColor, 'border-radius': '22px','padding':'1px 12px'}"
         >
          <Icon
                  :type="args.iconType"
                  :color="iconColor"
                  :style="{'font-size':args_fsize,'padding-bottom':'5px'}"
          />
          <span class='icon-txt' :style="{'font-size':args_fsize,'color':args.txt_fontColor,'line-height':arg_height,'padding':args.labelValue?'0px 8px':'0px'}">{{args.labelValue}}</span>
        </div>

      </span>
    </span>
    </template>

    <span v-show="isRequired || isWrong" :style="{'width': '100%', 'display': 'inline-block', 'padding-left': labelWidth}">
        <span v-show="isRequired" class="wrongTips">该项不能为空</span>
        <span v-show="isWrong" class="wrongTips">{{ errorMessage }}</span>
    </span>
  </section>
</template>

<script>
const name = "Liked";
export default {
  beforeDestroy() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  },
  name: name,
    props: [
      'argsProps',
      'query',
      'store',
      'itemValue',
      'formEngine',
      'dwf_ctx',
    ],
  data() {
    return {
      timer: null,
      times: 0,
      name: name,

      t_create: false,
      t_edit: false,
      t_visit: true,

      error: null,

      readonly: true,
      isWrong: false,
      isRequired: false,
      errorMessage: '',

      args: {
        label_width: 2,
        main_width: 3,
        label_align: 4, // 标签区域对齐方式,0-8,默认为4居中对齐
        label_fontType: "", // 标签字体
        label_fontSize: 14, // 标签字号
        label_fontColor: "initial", // 标签字体颜色
        txt_fontColor: 'initial',// 内容文字颜色
        lfsize: 14,// 标签文字大小
        lfsizeType: 'px',// 标签文字大小单位
        fsize: 14,// 内容文字大小
        fsizeType: 'px',// 内容文字大小单位
        hided: false,

        main_align: 4,
        label: "",
        name: "",
        height: 30,
        heightType: "px",
        col: true,
        rows: 3,
        cols: 3,
        targetDataType: null,
        iconType: "md-thumbs-up",
        defaultValue: false,
        iconTypeList: [
          {
            value: "md-thumbs-up",
            label: "赞"
          },
          {
            value: "md-thumbs-down",
            label: "踩"
          },
          {
            value: "md-heart",
            label: "收藏"
          }
        ],
      },

      // 支持的数据类型
      dataTypes: ["Boolean"],

      vChange: null,   // 值变化事件

      // 对齐方式,布局插件使用
      alignList: [
        { value: 1, name: "靠左对齐" },
        { value: 4, name: "居中对齐" },
        { value: 7, name: "靠右对齐" },
        { value: 0, name: "左上对齐" },
        { value: 2, name: "左下对齐" },
        { value: 3, name: "顶部对齐" },
        { value: 5, name: "底部对齐" },
        { value: 6, name: "右上对齐" },
        { value: 8, name: "右下对齐" }
      ],

      attrMap: {},

      open: ["1", "2"],

      value: false,
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
  // 生命周期函数，在获取数据和事件函数后调用，
  created() {
    //通过prop给控件初始化
    this.setDisplayType(this.query.displayType);
    this.setArgs(this.argsProps);

    this.$store = this.store;
  },
  mounted() {
    this.setHeight();

    // if(this.$refs.main.querySelector(".icon-txt")){
    //   this.$refs.main.querySelector(".icon-txt").style.fontSize = 'inherit';
    //   this.$refs.main.querySelector(".icon-txt").style.color = 'inherit';
    // }

    if(this.args.events && this.args.events.length > 0) {

      this.vChange = this.args.events.find((val) => {
        return val.name == '值变化'
      })
    }
    if (this.args.hasBackgroung) {
        bgColor = this.value ? this.args.likedBgColor : this.args.unlikeBgColor;
    }
  },
  computed: {
    iconColor() {
      return (this.value === true || this.value === 'true') ? this.args.likedColor : this.args.unlikeColor
    },
     // 文本内容字体大小
    args_fsize(){
      return this.args.fsize + this.args.fsizeType + '!important';
    },
    // 标签文本字体大小
    args_lfsize(){
      return this.args.lfsize + this.args.lfsizeType + '!important';
    },
    args_lfcolor() {
      return this.args.label_fontColor == 'initial' ? 'initial' : this.args.label_fontColor + ' !important';
    },
    arg_name() {
      return this.args.name;
    },
    arg_height() {
      return this.args.height < 2 && this.args.heightType == 'px' ? this.args.height * 30 + "px" : this.args.height + this.args.heightType;
    },
    colWidth() {
      return this.args.width + this.args.widthType;
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
        return !this.args.label || this.args.label == "" ? "100%": `calc(100% - ${this.args.label_widthByPx}px)`;
      }else{
        return !this.args.label || this.args.label == "" ? "100%" : parseInt(100 * this.args.main_width / (this.args.label_width + this.args.main_width)) + "%";
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

    //背景颜色
    bgColor(){
      if (this.args.hasBackground) {
        return this.value ? this.args.likedBgColor : this.args.unlikeBgColor;
      }
      else{
        return "";
      }
    }
  },
  methods: {
    // 动态监听数据变化
    onDynamic(value) {
      this.setValue(value);
    },

    // 设置异常状态显示
    setError(error, mes) {

      this.isWrong = error;
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
        if (this.args.required && (this.value == null||this.value === "")) expResult = false;

        this.setError(expResult ? false : true);

        return expResult;
    },
    getValue() {
      if(this.value) return true;
      else return false;
    },
    setValue(items) {
      var value = null;
      if (items == null) value = "defaultValue" in this.args ? (this.args.defaultValue == '' ? false : this.args.defaultValue) : false;
      else if (typeof items == "object") {
        if (items && items.length > 0) value = items[0][this.args.name];
      } else value = items;

      if(value == 'false' || value == false) {
        this.value = false;
      } else if(value == 'true' || value == true) {
        this.value = true;
      } else if(value == null){
        this.value = false;
      }

      return this;
    },
    setHeight() {
      // if (!this.$refs.main) return;
      // let that = this;
      // this.timer = setInterval(() => {
      //   if (!that.$refs.main) {
      //     clearInterval(that.timer);
      //     that.timer = null;
      //     return;
      //   }
      //   // 改成你需要的样式
      //   var dom = that.$refs.main.querySelector(".i-input .ivu-input");
      //   if (dom) {
      //     dom.style.height = that.arg_height + "px";
      //     clearInterval(that.timer);
      //     that.timer = null;
      //   }
      //   that.times += 30;
      //   if (that.times > 60 * 1000) {
      //     clearInterval(that.timer);
      //     that.timer = null;
      //   }
      // }, 30);
    },
    likeClick() {
      // 脚本触发的错误状态 点击不取消
      if(this.errorMessage == '') {
          this.validate();
      }
      // 编辑权限控制
      let attrMap = this.store.state.DWF_form.AttributesClassMap[this.itemValue.data.targetClass]
      let attrAccess = attrMap.find(val => {
        return val.attributeName == this.args.name
      })

      if(attrAccess != undefined) {
        if(attrAccess.restrictedAccess.length > 0 && attrAccess.restrictedAccess.indexOf('EditObjects') != -1) {
          return;
        }
      }

      if(this.readonly || this.args.readonly){
        return;
      }
      this.value = !this.value;
      if(this.vChange) {
        this.invokeOperation(this.vChange.opr_type, this.vChange.opr_path, this.itemValue, this.store);
      }

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

    setDisplayType(type) {
      this.t_create = false;
      this.t_edit = false;
      this.t_visit = false;
      if (type == "create") {
        this.t_create = true;
        this.value = "";
        this.readonly = false;
      } else if (type == "edit") {
        this.t_edit = true;
        this.readonly = false;
      } else if (type == "visit" ||type == "list" ) {
        this.t_visit = true;
        this.readonly = true;
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

      if ("name" in args) {
        this.args_name = this.args.name;
        if(this.args.name == '' || this.args.name == null) {
          this.value = "defaultValue" in args ? this.args.defaultValue : '';
        }
      }
      if ("defaultValue" in args) this.value = this.args.defaultValue;
      return this;
    },
    getArgs() {
      return this.args;
    }
  }
};
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
