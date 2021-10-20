<template>
  <section v-show="!args.hided" :addinName="name" :style="{'width': colWidth}" ref="main">
    <template v-if="args.structural_layout === 'horizontal'">
      <!--
           标签, 一般的属性插件都有,如文本框
           对于不需要的插件,可以删去,如附件控件,图片控件,也可以将label设为空
   -->
      <span
              v-if="args.required || args.label"
              :style="{'height': arg_height, 'width': labelWidth, 'display': 'inline-flex', 'align-items': labelYAlign, 'padding-right': '10px'}"
      >
      <span
              :style="{'background-color': args.label_color, 'width': '100%', 'display': 'inline-flex', 'align-self': labelYAlign, 'justify-content': labelXAlign}"
      >
        <span v-if="args.required" style="color: red">*</span>
        <label class="ori-color self-color" :style="{'color': args_lfcolor,'font-size':args_lfsize}" >{{ args.label }}</label>
      </span>
    </span>

      <span
              v-if="args.title === '进度条'"
              :style="{'height': arg_height, 'width': mainWidth, 'display': 'inline-flex', 'align-items': mainYAlign, 'justify-content': mainXAlign}"
      >
      <Progress
              :percent="percent"
              :stroke-width="args.strokeWidth"
              :hide-info="!args.showProgress"
              class="msize ori-color self-color"
              :style="{'color':args_fcolor,'font-size':args_fsize}"
      >
          <Icon v-if="percent === 100" type="ios-checkmark-circle" :style="{'color':'#19be6b','font-size':args_fsize}"></Icon>
          <span v-else :style="{'color':args.txt_fontColor,'font-size':args_fsize}">{{ percent }}%</span>
      </Progress>
    </span>
      <span
              v-else
              :style="{'height': arg_height, 'width': mainWidth, 'display': 'inline-flex', 'align-items': mainYAlign, 'justify-content': mainXAlign, 'float': 'right'}"
      >
      <i-circle
              :size="args.circelSize"
              :percent="percent"
              :stroke-width="args.strokeWidth"
              :trail-width="args.strokeWidth"
              :stroke-color="barColor"
              :style="{'color':args_fcolor,'font-size':args_fsize}"
      >
        <div v-show="args.showProgress">
          <Icon v-if="percent === 100" type="md-checkmark" :style="{'color':args_fcolor,'font-size':args_fsize}"></Icon>
          <span v-else class="msize ori-color self-color" :style="{'color':args_fcolor,'font-size':args_fsize}">{{ percent }}%</span>
        </div>
      </i-circle>
    </span>
    </template>
    <template v-else>
      <!--
           标签, 一般的属性插件都有,如文本框
           对于不需要的插件,可以删去,如附件控件,图片控件,也可以将label设为空
   -->
      <span
              v-if="args.required || args.label"
              :style="{'height': arg_height, 'width': '100%', 'display': 'inline-flex', 'align-items': labelYAlign, 'padding-right': '10px'}"
      >
      <span
              :style="{'background-color': args.label_color, 'width': '100%', 'display': 'inline-flex', 'align-self': labelYAlign, 'justify-content': labelXAlign}"
      >
        <span v-if="args.required" style="color: red">*</span>
        <label class="ori-color self-color" :style="{'color': args_lfcolor,'font-size':args_lfsize}" >{{ args.label }}</label>
      </span>
    </span>

      <span
              v-if="args.title === '进度条'"
              :style="{'height': arg_height, 'width': '100%', 'display': 'inline-flex', 'align-items': mainYAlign, 'justify-content': mainXAlign}"
      >
      <Progress
              :percent="percent"
              :stroke-width="args.strokeWidth"
              :hide-info="!args.showProgress"
              class="msize ori-color self-color"
              :style="{'color':args_fcolor,'font-size':args_fsize}"
      >
          <Icon v-if="percent === 100" type="ios-checkmark-circle" :style="{'color':'#19be6b','font-size':args_fsize}"></Icon>
          <span v-else :style="{'color':args.txt_fontColor,'font-size':args_fsize}">{{ percent }}%</span>
      </Progress>
    </span>
      <span
              v-else
              :style="{'height': arg_height, 'width': '100%', 'display': 'inline-flex', 'align-items': mainYAlign, 'justify-content': mainXAlign}"
      >
      <i-circle
              :size="args.circelSize"
              :percent="percent"
              :stroke-width="args.strokeWidth"
              :trail-width="args.strokeWidth"
              :stroke-color="barColor"
              :style="{'color':args_fcolor,'font-size':args_fsize}"
      >
        <div v-show="args.showProgress">
          <Icon v-if="percent === 100" type="md-checkmark" :style="{'color':args_fcolor,'font-size':args_fsize}"></Icon>
          <span v-else class="msize ori-color self-color" :style="{'color':args_fcolor,'font-size':args_fsize}">{{ percent }}%</span>
        </div>
      </i-circle>
    </span>
    </template>

    <p v-show="isWrong" :style="{'width': '100%', 'padding-left': labelWidth}">
      <span class="wrongTips">{{ errorMessage }}</span>
    </p>
  </section>
</template>

<script>
import { getEobjSingle } from "@/api/others";

const name = "ProgressBar";
export default {
  name: name,
  props: [
        'argsProps',
        'query',
        'itemValue',
        'formEngine',
        'dwf_ctx',
      ],
  data() {
    return {
      timer: null,
      timerRefresh: null,
      times: 0,
      name: name,

      t_create: false,
      t_edit: false,
      t_visit: true,
      isWrong: false,
      errorMessage: '',

      error: null,

      readonly: true,

      args: {
        label_width: 2,
        main_width: 3,
        label_align: 4,
        main_align: 4,
        label: "",
        name: "", // e.g. this.args.name = "completePct";
        id: null,
        height: 30,
        heightType: "px",
        width: 100,
        widthType: '%',
        txt_fontColor: 'initial',
        label_fontColor: 'initial',
        col: true,
        rows: 3,
        cols: 3,
        targetDataType: null,
        hided: false,
        title: "进度条",
        circelSize: 30,
        // refreshPeriod: 1000,
        // refreshPeriodType: "ms",
        strokeWidth: 5,
        showProgress: true,
        // 事件操作所需配置
        oprs: {
          ValueChanged: {
            opr_path: "",
            opr_type: ""
          }
        }
      },

      // 支持的数据类型
      dataTypes: ["Integer", "Long", "Double"],

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

      value: 0,

      // 事件操作所需属性
      event_name: "ValueChanged",
      event_list: ["ValueChanged"],
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
  },
  mounted() {
    this.setHeight();
    if(this.$refs.main.querySelector(".ivu-progress-text-inner")){
      this.$refs.main.querySelector(".ivu-progress-text-inner").style.fontSize = 'inherit';
      this.$refs.main.querySelector(".ivu-progress-text-inner").style.color = 'inherit';
    }

    // this.refresh();
    this.handleValueChanged();
  },
  watch: {
    arg_percent(val) {
      this.handleValueChanged();
    }
  },
  computed: {
     // 文本内容字体大小
    args_fsize(){
      return this.args.fsize + this.args.fsizeType + '!important';
    },
    args_fcolor() {
      return sessionStorage.getItem('skinStyle') == 'dark' && sessionStorage.getItem('appMenu') && this.args.txt_fontColor == 'initial' ? 'inherit' : this.args.txt_fontColor + ' !important';
      // return this.args.txt_fontColor == 'initial' ? 'initial' : this.args.txt_fontColor + ' !important';
    },
    // 标签文本字体大小
    args_lfsize(){
      return this.args.lfsize + this.args.lfsizeType + '!important';
    },
    args_lfcolor() {
      return sessionStorage.getItem('skinStyle') == 'dark' && sessionStorage.getItem('appMenu') && this.args.label_fontColor == 'initial' ? 'inherit' : this.args.label_fontColor + ' !important';
      // return this.args.label_fontColor == 'initial' ? 'initial' : this.args.label_fontColor + ' !important';
    },
    percent() {
      if(!this.value)this.value = 0
      this.value = parseFloat(this.value)
      if (this.value < 0) return 0;
      else if (this.value > 100) return 100;
      else {
        this.value = parseFloat(this.value.toFixed(1));
        return this.value;
      }
    },
    arg_percent() {
      return this.value;
    },
    arg_id() {
      return this.args.id;
    },
    arg_name() {
      return this.args.name;
    },
    arg_height() {
      return this.args.height < 2 ? this.args.height * 30 + "px" : this.args.height + this.args.heightType;
    },
    colWidth() {
      return this.args.width + this.args.widthType;
    },
    labelWidth() {
      if(this.args.labelWidthUnit && this.args.labelWidthUnit === 'px'){
        return this.args.label_widthByPx + 'px';
      }else{
        return parseInt(100 * this.args.label_width / (this.args.label_width + this.args.main_width)) + "%";
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
      if (x === 0) return "flex-start";
      else if (x === 1) return "center";
      else return "flex-end";
    },
    labelYAlign() {
      let x = this.args.label_align % 3;
      if (x === 0) return "flex-start";
      else if (x === 1) return "center";
      else return "flex-end";
    },
    mainXAlign() {
      let x = parseInt(this.args.main_align / 3);
      if (x === 0) return "flex-start";
      else if (x === 1) return "center";
      else return "flex-end";
    },
    mainYAlign() {
      let x = this.args.main_align % 3;
      if (x === 0) return "flex-start";
      else if (x === 1) return "center";
      else return "flex-end";
    },
    barColor() {
      let color = "#2db7f5";
      if (this.value >= 100) {
        color = "#5cb85c";
      }
      return color;
    }
  },
  beforeDestroy() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
    if (this.timerRefresh) {
      clearInterval(this.timerRefresh);
      this.timerRefresh = null;
    }
  },
  methods: {
    // 动态监听数据变化
    onDynamic(value) {
      this.setValue(value);
    },
    // refresh() {
    //   if (!this.$refs.main) return;
    //   let that = this;
    //   this.timerRefresh = setInterval(() => {
    //     if (!that.$refs.main) {
    //       clearInterval(that.timerRefresh);
    //       that.timerRefresh = null;
    //       return;
    //     }
    //     that.getProgress();
    //   }, that.args.refreshPeriod * (that.args.refreshPeriodType === "ms" ? 1 : 1000));
    // },
    setError(error, mes) {

      this.isWrong = error;
      var dom = this.$refs.main.querySelector(".ivu-progress");
      console.log(dom)
      if (dom) dom.style.border = error ? "1px solid red" : null;
      if(mes) {
        this.errorMessage = mes;
      } else {
        this.errorMessage = '';
      }
    },
    validate() {
        let expResult = true;

        if (this.args.required && (this.value == null || this.value == "")) {

          expResult = false;

        } else if (this.value != null && this.args.rule) {
          expResult = new RegExp(this.args.rule).test(this.value);
        } else {
          console.log(expResult, this.args.rule, this.value);
        }

        this.setError(expResult ? null : true);

        return expResult;
    },
    getValue() {
      return this.value;
    },
    setValue(items) {
      console.log("set value:", value);
      var value = null;
      if (items == null) value = "defaultValue" in this.args ? this.args.defaultValue : false;
      else if (typeof items == "object") {
        if (items && items.length > 0) value = items[0][this.args.name];
      } else value = items;
      this.value = value;

      // this.value = value;
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
    setDisplayType(type) {
      this.t_create = false;
      this.t_edit = false;
      this.t_visit = false;
      if (type === "create") {
        this.t_create = true;
        this.value = "";
        this.readonly = false;
      } else if (type === "edit") {
        this.t_edit = true;
        this.readonly = false;
      } else if (type === "visit") {
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
      if ("name" in args) this.args_name = this.args.name;
      if(this.args.txt_fontColor == 'initial' && sessionStorage.getItem('skinStyle') == 'dark' && sessionStorage.getItem('appMenu')) this.args.txt_fontColor = '#fff';
      return this;
    },
    getArgs() {
      return this.args;
    },
    // getProgress() {
    //   // console.log("getProgress...", this.args, this.itemValue);
    //   if (this.itemValue.data.targetClass && this.itemValue.data.origin && this.itemValue.data.origin.oid) {
    //     getEobjSingle(this.itemValue.data.targetClass, this.itemValue.data.origin.oid)
    //       .then(response => {
    //         const res = response.data;
    //         if (res.data && res.data[this.args.name]) {
    //           this.value = res.data[this.args.name];
    //         }
    //       })
    //       .catch(e => {
    //         console.log(e);
    //       });
    //   }
    // },
    handleChangeEventOfOperationBar(event) {
      this.args.oprs[event.index].opr_path = event.conf.opr_path;
      this.args.oprs[event.index].opr_type = event.conf.opr_type;
    },
    handleValueChanged() {
      this.invokeOperation(
        this.args.oprs["ValueChanged"].opr_type,
        this.args.oprs["ValueChanged"].opr_path,
        this.itemValue
      );
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

.wrongTips {
  display: inline-block;
  color: red;
  text-align: left;
  margin-top: 5px;
  font-family: 'Microsoft-YaHei';
}

p {
  margin: 10px 0;
}
.ori-color {
  color: initial;
}
</style>
