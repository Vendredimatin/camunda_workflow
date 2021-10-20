<template>
  <section
    v-if="t_preview"
    :addinName="name"
    :style="{ 'font-size': '14px', width: colWidth }"
    ref="main"
  >
    <template v-if="args.structural_layout === 'horizontal'">
      <span
        v-if="args.required || args.label"
        :style="{
          width: labelWidth,
          display: 'inline-block',
          'padding-left':'16px','text-align': labelXAlign,
          'vertical-align': labelYAlign,
          'background-color': args.label_color,
          'padding-right': '10px',
        }"
      >
        <span v-if="args.required" style="color: red">*</span>
        <label
          :style="{ color: args.label_fontColor, 'font-size': args_lfsize }"
          >{{ args.label }}</label
        >
      </span>
      <!-- <label v-if="args.label" :style="{'width': labelWidth, 'display': 'inline-block', 'text-align': labelXAlign, 'vertical-align': labelYAlign}">{{ args.label }}</label> -->
      <span
        :style="{
          height: arg_height,
          width: mainWidth,
          display: 'inline-block',
          'text-align': mainXAlign,
          'vertical-align': mainYAlign,
          color: args.main_fontColor,
        }"
      >
        <van-field
          ref="number"
          class="i-input"
          v-model="arg_value"
          :placeholder="args.placeholder"
          :input-align="mainXAlign"
          :readonly="args.readonly"
          type="number"
          @input="numberDefaultValueChange"
          @blur="handleNumberInput"
          :style="{
            'padding-top': '0',
            'padding-bottom': '0',
            height: arg_height,
            'min-height': arg_height,
            'line-height': arg_height,
            width: '100%',
            'text-align': mainXAlign,
            color: args.txt_fontColor,
            'font-size': args_fsize,
            'background-color': args.txt_bgColor,
          }"
        />
      </span>
    </template>
    <template v-else>
      <span
        v-if="args.required || args.label"
        :style="{
          'align-items': labelYAlignFlex,
          width: '100%',
          display: 'flex',
          'padding-left':'16px','text-align': labelXAlign,
          'vertical-align': labelYAlign,
          'background-color': args.label_color,
          'padding-right': '10px',
        }"
      >
        <span v-if="args.required" style="color: red">*</span>
        <label
          :style="{ color: args.label_fontColor, 'font-size': args_lfsize }"
          >{{ args.label }}</label
        >
      </span>
      <!-- <label v-if="args.label" :style="{'width': labelWidth, 'display': 'inline-block', 'text-align': labelXAlign, 'vertical-align': labelYAlign}">{{ args.label }}</label> -->
      <span
        :style="{
          height: arg_height,
          width: '100%',
          display: 'inline-block',
          'text-align': mainXAlign,
          'vertical-align': mainYAlign,
          color: args.main_fontColor,
        }"
      >
        <van-field
          ref="number"
          class="i-input"
          v-model="arg_value"
          :placeholder="args.placeholder"
          :input-align="mainXAlign"
          :readonly="args.readonly"
          type="number"
          @input="numberDefaultValueChange"
          @blur="handleNumberInput"
          :style="{
            'padding-top': '0',
            'padding-bottom': '0',
            height: arg_height,
            'min-height': arg_height,
            'line-height': arg_height,
            width: '100%',
            'text-align': mainXAlign,
            color: args.txt_fontColor,
            'font-size': args_fsize,
            'background-color': args.txt_bgColor,
          }"
        />
      </span>
    </template>
    <slot name="widget"></slot>
    <span v-show="t_edit" ref="edit">
      <EditBox
        v-if="actEdit"
        :widgetAnnotation="widgetAnnotation"
        :editExtendInfo="editExtendInfo"
        ref="editbox"
        v-model="args"
        :attributes="filter_attributes"
        :router="router"
        :itemValue="itemValue"
        :route="route"
        :addinName="name"
        :root="root"
        :query_oprs="query_oprs"
        :dataTypes="dataTypes"
        :targetclass="itemValue.data.targetClass"
      >
        <div slot="attribute">
          <p class="margin1">最大值</p>
          <Input class="margin1" v-model="args.max" placeholder="最大值" />
          <p class="margin1">最小值</p>
          <Input class="margin1" v-model="args.min" placeholder="最小值" />

          <p class="margin1">占位文本</p>
          <Input class="margin1" v-model="args.placeholder" />
        </div>
        <div slot="layout"></div>
        <div slot="operation"></div>
      </EditBox>
    </span>
  </section>
  <section v-else :addinName="name" style="text-align: center">
    <div class="form-addin-icon">
      <i class="iconfont">&#xe628;</i>
    </div>

    <div class="form-addin-name">数字框</div>
    <!--            <Tooltip content="数字框" class="form-addin-name" style="line-height: 30px; float: left;" :transfer="true">数字框</Tooltip>-->
  </section>
</template>

<script>
import "@/styles/component/iconfont.css";
import EditBox from "@/ext_components/form/_EditBox.vue";
import BindOperationBar from "@/ext_components/form/subcomponent/BindOperationBar.vue";

const name = "NumberInput";
export default {
  name: name,
  props: [
    "argsProps",
    "widgetAnnotation",
    "editExtendInfo",
    "itemValue",
    "attributes",
    "query_oprs",
    "route",
    "router",
    "root",
    "store",
    "Message",
    "relation",
  ],

  components: {
    BindOperationBar,
    EditBox,
  },
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
        dynamic: false, // 动态响应
        needCheckDuplic: false,
        defaultValue: null,
        rule: "",
        label_fontColor: "initial", // 标签文字颜色
        txt_fontColor: "initial", // 内容文字颜色
        lfsize: 14, // 标签文字大小
        lfsizeType: "px", // 标签文字大小单位
        fsize: 14, // 内容文字大小
        fsizeType: "px", // 内容文字大小单位
        txt_bgColor: "#fff", // 输入框背景颜色
        label_color: "initial",
        main_fontColor: "initial",
        main_color: "initial",
        id: "",
        title: "数字输入框",
        max: Number.MAX_VALUE,
        min: -Number.MAX_VALUE,
        step: 1,
        placeholder: "数字输入框",
        required: false,
        readonly: false,
        rule: "",
        ruleMessage: "",
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
        widthType: "%",
        height: 44,
        heightType: "px",
        col: true,
        // 布局插件所需属性
        rows: 0,
        cols: 0,
        events: [],
        eventRange: ["值变化", "失去焦点", "获得焦点", "值校验"],
        structural_layout: "horizontal", //整体布局
      },

      dataTypes: ["Integer", "Long", "Double"],

      value: null,

      // 对齐方式,布局插件使用
      alignList: [
        { value: 0, name: "左上对齐" },
        { value: 1, name: "靠左对齐" },
        { value: 2, name: "左下对齐" },
        { value: 3, name: "顶部对齐" },
        { value: 4, name: "居中对齐" },
        { value: 5, name: "底部对齐" },
        { value: 6, name: "右上对齐" },
        { value: 7, name: "靠右对齐" },
        { value: 8, name: "右下对齐" },
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
    };
  },
  inject: ["setBasicArgs"],
  created() {
    //通用方法给args赋值
    this.args = this.setBasicArgs(this.args);
    this.setArgs(this.args);
    let that = this;
    if (this.attributes) {
      if (this.relation) {
        this.attributes[1].forEach(
          (x) => (that.attrMap["relation_" + x.attributeName] = x)
        );
        this.attributes[2].forEach(
          (x) => (that.attrMap["left_" + x.attributeName] = x)
        );
        this.attributes[3].forEach(
          (x) => (that.attrMap["right_" + x.attributeName] = x)
        );
      } else {
        this.attributes.forEach((x) => (that.attrMap[x.attributeName] = x));
      }
    }
  },
  // 生命周期函数，在dom元素生成之后调用
  mounted() {
    this.$nextTick(() => {
      if (this.t_preview) {
        // 字体 ／ 颜色 默认继承
        this.$refs.main.querySelector(".i-input").style.height = 'inherit';
        this.$refs.main.querySelector(".i-input").style.textAlign = 'inherit';
        // this.$refs.main.querySelector(".i-input").style.backgroundColor = 'inherit';
        this.$refs.main.querySelector(".i-input .van-cell__value").style.color = 'inherit';
        this.$refs.main.querySelector(".i-input .van-field__control").style.color = 'inherit';
        this.$refs.main.querySelector(".i-input .van-field__right-icon")? this.$refs.main.querySelector(".i-input .van-field__right-icon").style.color = 'inherit': '';
        this.$refs.main.querySelector(".i-input .van-field__value") ? this.$refs.main.querySelector(".i-input .van-field__value").style.height = 'inherit' : '';
        this.$refs.main.querySelector(".i-input .van-field__value") ? this.$refs.main.querySelector(".i-input .van-field__value").style.fontSize = 'inherit' : '';
        this.$refs.main.querySelector(".i-input .van-field__body") ? this.$refs.main.querySelector(".i-input .van-field__body").style.fontSize = 'inherit' : '';

      }
    });
  },
  beforeDestroy() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
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
    // 'defaultValue'(val) {
    // },

    "args.txt_bgColor"(val) {
      if (!val) {
        this.args.txt_bgColor = "inherit";
      }
    },
    // 需要用到实体类属性列表时使用
    arg_name(val) {
      if (val in this.attrMap) {
        this.args.targetDataType = this.attrMap[val].valueType;
        if (this.relation) {
          if (val.startsWith("left_"))
            this.args.label =
              (this.relation.leftRole != ""
                ? this.relation.leftRole
                : this.relation.leftClass) +
              "的" +
              this.attrMap[val].displayName;
          if (val.startsWith("right_"))
            this.args.label =
              (this.relation.rightRole != ""
                ? this.relation.rightRole
                : this.relation.rightClass) +
              "的" +
              this.attrMap[val].displayName;
          if (val.startsWith("relation_"))
            this.args.label = this.attrMap[val].displayName;
        } else this.args.label = this.attrMap[val].displayName;
        let name = val;
        if (this.relation) {
          if (name.startsWith("left_")) name = name.substring(5);
          else if (name.startsWith("right_")) name = name.substring(6);
          else if (name.startsWith("relation_")) name = name.substring(9);
        }
        let attr = this.store.state.DWF_form.Attributes[name];
        if (attr && attr.defaultValue) this.value = attr.defaultValue;
        if (
          this.args.targetDataType == "Integer" ||
          this.args.targetDataType == "Long"
        ) {
          try {
            this.value = parseInt(this.value);
          } catch (e) {
            this.value = null;
          }
        } else if (this.args.targetDataType == "Double") {
          try {
            if (this.value) this.value = parseFloat(this.value);
          } catch (e) {
            this.value = null;
          }
        }
        if (isNaN(this.value)) this.value = null;
      } else this.args.targetDataType = null;
    },
    // end
  },
  computed: {
    arg_value: {
      get() {
        if (!this.args.defaultValue || this.args.defaultValue == '') return '';
        return parseFloat(this.args.defaultValue)
      },
      set(value) {
        this.args.defaultValue = parseFloat(value);
        return this.args.defaultValue
      }
      
    },
    arg_height() {
      return this.args.height < 2 && this.args.heightType == "px"
        ? this.args.height * 30 + "px"
        : this.args.height + this.args.heightType;
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
    // 文本内容字体大小
    args_fsize() {
      return this.args.fsize + this.args.fsizeType + " !important";
    },
    // 标签文本内容字体大小
    args_lfsize() {
      return this.args.lfsize + this.args.lfsizeType + " !important";
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
    labelYAlignFlex(){
      let x = this.args.label_align % 3;
      if (x == 0) return "flex-start";
      else if (x == 1) return "center";
      else return "flex-end";
    },
    // 需要用到实体类属性列表时使用
    arg_name() {
      return this.args.name;
    },
    filter_attributes() {
      return this.attributes
        ? this.relation
          ? [
              "relation",
              this.attributes[1].filter(
                (x) => this.dataTypes.indexOf(x.valueType) > -1
              ),
              this.attributes[2].filter(
                (x) => this.dataTypes.indexOf(x.valueType) > -1
              ),
              this.attributes[3].filter(
                (x) => this.dataTypes.indexOf(x.valueType) > -1
              ),
            ]
          : this.attributes.filter(
              (x) => this.dataTypes.indexOf(x.valueType) > -1
            )
        : [];
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
      if ("name" in args)
        this.args_name =
          this.filter_attributes.filter(
            (x) => x.attributeName == this.args.name
          ).length > 0
            ? this.args.name
            : "-1";
      return this;
    },

    // 获取表单项名
    getFormName() {
      return this.args.name;
    },

    getEditBoxComponent() {
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
      this.inherit.forEach((x) => (res[x] = that.args[x]));
      return res;
    },

    getDataType(args) {
      return this.dataTypes;
    },

    regInt() {
      if (
        this.args.targetDataType === "Integer" ||
        this.args.targetDataType === "Long" ||
        this.args.targetDataType === "TimeStamp"
      ) {
        if (/\./.test(this.value)) {
          this.$Message.warning("当前绑定属性，只能输入整数哦~");
          this.value = parseInt(this.value);
        }
      }
    },
    numberDefaultValueChange(value) {
      if (parseFloat(value) < parseFloat(this.args.min)) this.args.defaultValue = parseFloat(this.args.min);
      else if (parseFloat(value) > parseFloat(this.args.max)) this.args.defaultValue = parseFloat(this.args.max);
      if (value && this.args.name) {
        if (this.attrMap[this.args.name].valueType !== "Double") {
          let parseValue = parseInt(value);
          setTimeout(() => {
            this.args.defaultValue = this.defaultValue = parseValue;
          }, 10);
        }
      }
    },
    handleNumberInput() {
      // 只读状态不做处理
      if (this.args.readonly) {
        return;
      }
      let res = this.value;
      if (
        this.args.targetDataType === "Integer" ||
        this.args.targetDataType === "Long" ||
        this.args.targetDataType === "TimeStamp"
      ) {
        res = parseInt(this.value);
      } else if (this.args.targetDataType === "Double") {
        res = parseFloat(this.value);
      }
      if (res !== this.value) {
        this.value = res;
      }
    },
  },
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
}
.margin1 {
  margin-top: 5px;
  margin-bottom: 5px;
}
</style>
