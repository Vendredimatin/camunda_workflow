<template>
<!--  , 'display': 'inline-flex'-->
  <section v-if="t_preview" :addinName="name" :style="{'width': colWidth}" ref="main">
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
        <label class="msize" :style="{'color': args.label_fontColor,'font-size':args_lfsize}">{{ args.label }}</label>
      </span>
    </span>
      <!--
             插件前端实现区域
     -->
      <span
              v-if="args.title === '进度条'"
              :style="{'height': arg_height, 'width': mainWidth, 'display': 'inline-flex', 'align-items': mainYAlign, 'justify-content': mainXAlign}"
      >
      <Progress
              :percent="percent"
              :stroke-width="args.strokeWidth"
              :hide-info="!args.showProgress"
              :color="args.txt_fontColor"
              :style="{'color':args.txt_fontColor,'font-size':args_fsize}"
      >
          <Icon v-if="percent === 100" type="md-checkmark" size="600" style="color:#5cb85c"></Icon>
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
              :style="{'color':args.txt_fontColor,'font-size':args_fsize}"
      >
        <div v-show="args.showProgress">
          <Icon v-if="percent === 100" type="md-checkmark" size="600" style="color:#5cb85c"></Icon>
          <span v-else :style="{'color':args.txt_fontColor,'font-size':args_fsize}">{{ percent }}%</span>
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
        <label class="msize" :style="{'color': args.label_fontColor,'font-size':args_lfsize}">{{ args.label }}</label>
      </span>
    </span>
      <!--
             插件前端实现区域
     -->
      <span
              v-if="args.title === '进度条'"
              :style="{'height': arg_height, 'width': '100%', 'display': 'inline-flex', 'align-items': mainYAlign, 'justify-content': mainXAlign}"
      >
      <Progress
              :percent="percent"
              :stroke-width="args.strokeWidth"
              :hide-info="!args.showProgress"
              :color="args.txt_fontColor"
              :style="{'color':args.txt_fontColor,'font-size':args_fsize}"
      >
          <Icon v-if="percent === 100" type="md-checkmark" size="600" style="color:#5cb85c"></Icon>
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
              :style="{'color':args.txt_fontColor,'font-size':args_fsize}"
      >
        <div v-show="args.showProgress">
          <Icon v-if="percent === 100" type="md-checkmark" size="600" style="color:#5cb85c"></Icon>
          <span v-else :style="{'color':args.txt_fontColor,'font-size':args_fsize}">{{ percent }}%</span>
        </div>
      </i-circle>
    </span>
    </template>

    <slot name="widget"></slot>
<span v-show="t_edit" ref="edit">
      <EditBox v-if="actEdit" :addinName="name" :widgetAnnotation="widgetAnnotation" :editExtendInfo="editExtendInfo" ref="editbox" v-model="args"
               :attributes="filter_attributes"
               :router="router"
               :route="route"
               :root="root"
               :query_oprs="query_oprs"
               :dataTypes="dataTypes"
               :targetclass="itemValue.data.targetClass">
        <div slot="attribute">
          <p class="margin1">显示类型</p>
          <RadioGroup v-model="args.title">
            <Radio label="进度条"></Radio>
            <Radio label="进度环"></Radio>
          </RadioGroup>
          <p class="margin1" v-show="args.title == '进度环'">进度环大小</p>
          <InputNumber class="margin1" v-show="args.title == '进度环'" :min="1" style="width: 100%;" v-model="args.circelSize"></InputNumber>
          <!-- <p class="margin1">刷新间隔</p>
          <Input class="margin1" number v-model="args.refreshPeriod" @on-blur="validateRefreshPeriod">
            <Select v-model="args.refreshPeriodType" slot="append" style="width: 80px;" @on-change="validateRefreshPeriod">
              <Option value="ms">ms</Option>
              <Option value="s">s</Option>
            </Select>
          </Input> -->
          <div class="margin1">
            显示进度文字<i-switch style="float: right" v-model="args.showProgress"/>
          </div>
        </div>
        <div slot="layout">
        </div>
      </EditBox>
    </span>
  </section>
  <section v-else :addinName="name">
    <span style="text-align:center">
            <div class="form-addin-icon" style="font-size: 10px !important;">
                <i class="iconfont">&#xe618;</i>
      </div>
      <div class="form-addin-name">
        进度条
      </div>
    </span>
  </section>
</template>

<script>
  import "@/styles/component/iconfont.css";
  import EditBox from "./_EditBox.vue";
  import {getEobjSingle} from "@/api/others";
  import BindOperationBar from "./subcomponent/BindOperationBar.vue";

  const name = "ProgressBar";
  export default {
    name: name,
    props: ["argsProps", "widgetAnnotation", "editExtendInfo", "itemValue", "attributes", "query_oprs", "route", "router", "root", "store", 'Message', "relation"],
    data() {
      return {
        times: 0,
        name: name,

        t_preview: true,
        t_edit: false,


      actEdit: false,
      args: {
          dynamic: false,     // 动态响应
          label_width: 2,
          label_align: 4, // 标签区域对齐方式,0-8,默认为4居中对齐
          label_fontType: "", // 标签字体
          label_fontSize: 14, // 标签字号
          label_fontColor: "initial", // 标签字体颜色
          label_color: "initial", // 标签背景颜色
          txt_fontColor: 'initial',// 内容文字颜色
          lfsize: 14,// 标签文字大小
          lfsizeType: 'px',// 标签文字大小单位
          fsize: 14,// 内容文字大小
          fsizeType: 'px',// 内容文字大小单位
          hided: false,

          main_width: 3,
          main_align: 4,
          label: "",
          name: "", // e.g. this.args.name = "completePct";
          id: null,
          width: 100,
          widthType: '%',
          height: 30,
          heightType: "px",
          col: true,
          rows: 3,
          cols: 3,
          targetDataType: null,
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
          },
          structural_layout: 'horizontal'   //整体布局
        },

        // 支持的数据类型
        dataTypes: ["Integer", "Long", "Double"],

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

        open: ["1", "2"],

        timer: null,

        timerRefresh: null,

        // 事件操作所需属性
        event_name: "ValueChanged",
        event_list: ["ValueChanged"],
        value: 0,

        // 表单项名
        args_name: "",
      };
    },
    components: {
      BindOperationBar,
      EditBox
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
    mounted() {
      if (this.t_preview) {
        this.setHeight();
        if (this.$refs.main.querySelector(".ivu-progress-text-inner")) {
          this.$refs.main.querySelector(".ivu-progress-text-inner").style.fontSize = 'inherit';
          this.$refs.main.querySelector(".ivu-progress-text-inner").style.color = 'inherit';
        }
      }
    },
    watch: {
      args_title(val) {
        console.log("***", this.$refs.main.querySelector(".ivu-progress-text-inner"));
        let self = this;
        setTimeout(function () {

          self.$refs.main.querySelector(".ivu-progress-text-inner").style.fontSize = 'inherit';
          self.$refs.main.querySelector(".ivu-progress-text-inner").style.color = 'inherit';

        }, 50);
      },
      // 需要用到实体类属性列表时使用
      args_name(val) {
        if (val != "-1") {
          this.args.name = val;
        } else {
          // // // // this.args.name = "";
        }
      },
      arg_name(val) {
        if (val in this.attrMap) {
          this.args.targetDataType = this.attrMap[val].valueType;
          if (this.relation) {
            if (val.startsWith("left_")) this.args.label = (this.relation.leftRole != "" ? this.relation.leftRole : this.relation.leftClass) + "的" + this.attrMap[val].displayName;
            if (val.startsWith("right_")) this.args.label = (this.relation.rightRole != "" ? this.relation.rightRole : this.relation.rightClass) + "的" + this.attrMap[val].displayName;
            if (val.startsWith("relation_")) this.args.label = this.attrMap[val].displayName;
          } else this.args.label = this.attrMap[val].displayName;
        } else this.args.targetDataType = null;
      },
      // arg_id(_) {
      //   this.getProgress();
      // }
    },
    computed: {
      args_title() {
        return this.args.title;
      },
      // 文本内容字体大小
      args_fsize() {
        console.log(this.args.fsize + this.args.fsizeType);
        return this.args.fsize + this.args.fsizeType + '!important';
      },
      // 标签文本字体大小
      args_lfsize() {
        return this.args.lfsize + this.args.lfsizeType + '!important';
      },
      percent() {
        if(!this.value)this.value = 0
        this.value = parseFloat(this.value)
        if (this.value < 0) return 0;
        else if (this.value > 100) return 100;
        else return this.value;
      },
      arg_id() {
        return this.args.id;
      },
      arg_name() {
        return this.args.name;
      },
      arg_height() {
        return this.args.height < 2 && this.args.heightType == 'px' ? this.args.height * 30 + "px" : this.args.height + this.args.heightType;
      },
      colWidth() {
        return this.args.width + this.args.widthType;
        //    return this.args.col ? parseInt(100.0 / this.args.cols) + "%" : "100%";
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
      filter_attributes() {
        return this.attributes ? (this.relation ?
          ["relation", this.attributes[1].filter(x => this.dataTypes.indexOf(x.valueType) > -1),
            this.attributes[2].filter(x => this.dataTypes.indexOf(x.valueType) > -1),
            this.attributes[3].filter(x => this.dataTypes.indexOf(x.valueType) > -1)] : this.attributes.filter(x => this.dataTypes.indexOf(x.valueType) > -1)) : [];
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

      // 当插件无法直接通过style设置高度时,使用setHeight方法设置高度
      setHeight() {
        return;
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
        this.t_preview = type === 0;
        return this;
      },
      getFormName() {
        return this.args.name;
      },
      setArgs(args) {
        for (var i in args) {
          this.args[i] = args[i];
        }
        if ("name" in args) this.args_name = this.filter_attributes.filter(x => x.attributeName == this.args.name).length > 0 ? this.args.name : "-1";
        if ("label" in args){
          let label = args.label;
          setTimeout(() => {
            this.args.label = label;
          }, 0);
        }
        return this;
      },
      getArgs() {
        return this.args;
      },
      getAllow() {
        return null;
      },
      getEditBoxComponent() {
        return this.$refs.editbox;
      },

      getEditBox() {
        this.t_edit = true;
        return this.$refs.edit;
      },
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

  .margin1 {
    margin-top: 5px;
    margin-bottom: 5px;
  }
</style>
