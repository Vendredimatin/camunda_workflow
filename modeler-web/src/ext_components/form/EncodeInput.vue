<template>
    <!-- 编码生成框 -->
        <section v-if="t_preview" :addinName="name" :style="{'font-size': args.fontSize + 'px', 'width': colWidth}" ref="main">
          <template v-if="args.structural_layout === 'horizontal'">
            <span v-if="args.required || args.label" :style="{'width': labelWidth, 'display': 'inline-block',
            'text-align': labelXAlign, 'vertical-align': labelYAlign,
            'background-color': args.label_color, 'padding-right': '10px'}">
                <span v-if="args.required" style="color: red">*</span>
                <label class="msize" :style="{'color': args.label_fontColor, 'font-size': args_lfsize}">{{ args.label }}</label>
            </span>
            <span :style="{'height': arg_height, 'min-height': arg_height, 'width': mainWidth, 'display': 'inline-block',
                'text-align': mainXAlign, 'vertical-align': mainYAlign,
                'color': args.main_fontColor}">
                <Input
                        v-if="addIcon"
                        class="i-input"
                        v-model="args.encodeStreamDisplay"
                        :placeholder="args.placeholder"
                        :prefix="args.prefixIcon"
                        :size="args.size"
                        :type="args.type"
                        readonly
                        :rows="parseInt(args.maxAreaRow)"
                        :style="{'height': arg_height, 'min-height': arg_height, 'line-height': arg_height, 'width': '100%', 'text-align': mainXAlign, 'color': args.txt_fontColor, 'font-size': args_fsize, 'display': 'inline-block', 'background-color': args.txt_bgColor}"
                >
                <Icon :style="{'color': args.txt_fontColor}" :type="args.suffixIcon" slot="suffix" @click="exportCode"/>
                </Input>
            </span>
          </template>
          <template v-else>
            <span v-if="args.required || args.label" :style="{'width': '100%', 'display': 'inline-block',
            'text-align': labelXAlign, 'vertical-align': labelYAlign,
            'background-color': args.label_color, 'padding-right': '10px'}">
                <span v-if="args.required" style="color: red">*</span>
                <label class="msize" :style="{'color': args.label_fontColor, 'font-size': args_lfsize}">{{ args.label }}</label>
            </span>
            <span :style="{'height': arg_height, 'min-height': arg_height, 'width': '100%', 'display': 'inline-block',
                'text-align': mainXAlign, 'vertical-align': mainYAlign,
                'color': args.main_fontColor}">
                <Input
                        v-if="addIcon"
                        class="i-input"
                        v-model="args.encodeStreamDisplay"
                        :placeholder="args.placeholder"
                        :prefix="args.prefixIcon"
                        :size="args.size"
                        :type="args.type"
                        readonly
                        :rows="parseInt(args.maxAreaRow)"
                        :style="{'height': arg_height, 'min-height': arg_height, 'line-height': arg_height, 'width': '100%', 'text-align': mainXAlign, 'color': args.txt_fontColor, 'font-size': args_fsize, 'display': 'inline-block', 'background-color': args.txt_bgColor}"
                >
                  <Icon :style="{'color': args.txt_fontColor}" :type="args.suffixIcon" slot="suffix" @click="exportCode"/>
                </Input>
            </span>
          </template>
          <slot name="widget"></slot>
            <span v-show="t_edit" ref="edit">
                <EditBox v-if="actEdit" :addinName="name" :widgetAnnotation="widgetAnnotation" :editExtendInfo="editExtendInfo" ref="editbox" v-model="args"
                @exportCode="exportCode"
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
                        <div>
                          <p class="margin1">编码框尾部图标</p>
                          <Select v-model="args.suffixIcon" filterable clearable @on-change="chooseIcon">
                            <Option v-for="item in iconList" :value="item.value" :key="item.value" :label="item.label">
                              <Icon :type="`${item.value}`" style="font-size: 20px !important;"></Icon>
                              <span style="float:right;color:#ccc">{{ item.label }}</span>
                            </Option>
                          </Select>
                        </div>
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
                <i class="iconfont">&#xe624;</i>
                </div>
                <div class="form-addin-name">
                    文本框
                </div>
            </span>
        </section>
</template>

<script>
import {parseEscapeString} from '@/libs/utils.js';
import EditBox from "./_EditBox.vue"
import "@/styles/component/iconfont.css";
import moduleIconData from "@/views/functional-model/components/moduleIcon.js";

const name = "EncodeInput";
export default {
  name: name,
  props: [
    'addin',
    'basicArgs',
    'argsProps',
    'activeUUID',
    'store',
    'itemValue',
    'attributes',
    'relation',
    'editExtendInfo',
    'widgetAnnotation',
    'checkResult',
    'query_oprs',
    'route',
    'router',
    'root',
    'Message',
    'echarts',
  ],
  components: {
    EditBox
  },
  data() {
    return {
      // 插件名
      name: name,
      // 展示模式
      t_preview: true,
      t_edit: false,
      addIcon: true,
      actEdit: false,

      inputTypeList: [
        {
          value: "text"
        },
        {
          value: "password"
        },
        {
          value: "textarea"
        },
        {
          value: "email"
        }
      ],
      iconList: [],
      args: {
        encodePrefix: '',//编码前缀
        encodeStream: '',//编码流水
        encodeStreamDisplay: '',//编码流水
        dynamic: false,     // 动态响应
        // needCheckDuplic: false,
        // defaultValue: '',
        label_color: 'initial',
        main_fontColor: 'initial',
        main_color: 'initial',
        title: '编码框',
        id: null,
        size: "default",
        type: "text",
        placeholder: "编码",
        clearable: false,
        readonly: true,
        readonlyDisabled: true,
        required: false,
        hided: false,
        icon: "",
        value: "",
        label_width: 2,
        main_width: 3,
        label_align: 4,
        main_align: 4,
        maxAreaRow: 2,
        // rule: '',
        // ruleMessage: '',
        prefixIcon: '',   // 头部图标
        suffixIcon: 'md-swap',   // 尾部图标
        // 属性插件所需属性
        label: "",
        name: "",
        targetDataType: null,
        height: 30,
        heightType: "px",
        width: 100,
        widthType: '%',
        label_fontColor: 'initial',       // 标签文字颜色
        txt_fontColor: 'initial',         // 内容文字颜色
        txt_bgColor: '#fff',              // 输入框背景颜色
        lfsize: 14,                       // 标签文字大小
        lfsizeType: 'px',                 // 标签文字大小单位
        fsize: 14,                        // 内容文字大小
        fsizeType: 'px',                  // 内容文字大小单位
        col: true,
        // 布局插件所需属性
        rows: 3,
        cols: 3,
        events: [],
        eventRange: ["值变化"],
        structural_layout: 'horizontal',   //整体布局
      },

      times: 0,

      // 支持的数据类型
      dataTypes: ['String', 'UUID', 'Clob', 'LocalFile'],

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

      // 继承属性
      inherit: [],

      // 表单项名
      args_name: "",

      // 属性map
      attrMap: {},

      timer: null,

      value: null,
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
      if (this.Message && !this.$Message) this.$Message = this.Message;
    }
  },
  // 生命周期函数，在dom元素生成之后调用
  mounted() {
    this.args.encodePrefix ? '' : this.args.encodePrefix = this.itemValue.data.targetClass.slice(0,2).toUpperCase()
    if (this.t_preview) {
      this.iconList = moduleIconData;
      this.$nextTick(() => {
        this.setInheritStyle();
        this.setHeight();
      })
    }
    this.exportCode()
  },
  beforeDestroy() {
      if (this.timer) { clearInterval(this.timer); this.timer = null; };
  },
  watch: {
      arg_height(val) {
        this.setHeight();
      },
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
          } else this.args.targetDataType = null;
      },
      // end
  },
  computed: {
      arg_height() {
        return this.args.height < 3 && this.args.heightType == 'px' ? this.args.height * 30 + "px" : this.args.height + this.args.heightType;
      },
      colWidth() {
        return this.args.width + this.args.widthType;
      //    return this.args.col ? parseInt(100.0 / this.args.cols) + "%" : "100%";
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
        return this.args.txt_fontColor;
      },
      // 标签文本内容字体大小
      args_lfsize() {
        return this.args.lfsize + this.args.lfsizeType + ' !important';
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
    freshData(query) {
      // 更新编码控件
      this.exportCode()
    },
    exportCode() {
      let dateStream = new Date().format('YYYYMMddhhmmssS')
      //this.args.encodeStream = parseEscapeString(this.args.encodePrefix, {}, {}, this.rootJsonOrigin, this.attributes, this.store) + dateStream
      this.args.encodeStreamDisplay = this.itemValue.data.targetClass.slice(0,2).toUpperCase() + dateStream
      this.args.encodeStream = this.args.encodePrefix + dateStream
    },
    // 当插件无法直接通过style设置高度时,使用setHeight方法设置高度
    setHeight() {
      return;
    },
    getValue() {
      // return this.args.value;
      if (this.args.targetDataType === "String") {
        return this.args.value;
      }
      else if(this.args.targetDataType === "Integer") {
        return parseInt(this.args.value);
      }
      else if(this.args.targetDataType === "Boolean") {
        return this.args.value === "true";
      }
      else if(this.args.targetDataType === "Long") {
        // TODO:
        return parseInt(this.args.value);
      }
      else if(this.args.targetDataType === "UUID") {
        return this.args.value;
      }
      else if(this.args.targetDataType === "Date") {
        return this.args.value;
      }
      else if(this.args.targetDataType === "Double") {
        return parseFloat(this.args.value);
      }
      else if(this.args.targetDataType === "Clob") {
        // TODO:
        return this.args.value;
      }
      else if(this.args.targetDataType === "TimeStamp") {
        // TODO:
        return this.args.value;
      }
      else {
        // TODO:
        return this.args.value;
      }
    },
    setInheritStyle() {
        // 字体 ／ 颜色 默认继承
      this.$refs.main.querySelector(".i-input .ivu-input").style.height = 'inherit';
      this.$refs.main.querySelector(".i-input .ivu-input").style.fontSize = 'inherit';
      this.$refs.main.querySelector(".i-input .ivu-input").style.color = 'inherit';
      this.$refs.main.querySelector(".i-input .ivu-input").style.textAlign = 'inherit';
      this.$refs.main.querySelector(".i-input .ivu-input").style.backgroundColor = 'inherit';
      this.$refs.main.querySelector(".i-input .ivu-input-inner-container") ? this.$refs.main.querySelector(".i-input .ivu-input-inner-container").style.height = 'inherit' : '';
      this.$refs.main.querySelector(".i-input .ivu-input-inner-container") ? this.$refs.main.querySelector(".i-input .ivu-input-inner-container").style.fontSize = 'inherit' : '';
    },
    setValue(value) {
      this.args.value = value;
      return this;
    },

    getEditBoxComponent(){
      return this.$refs.editbox;
    },

    getEditBox() {
      this.t_edit = true;
      return this.$refs.edit;
    },
    getAllow() {
      return null;
    },
    getName() {
      return name;
    },
    getArgs() {
      return this.args;
    },
    setArgs(args) {
      for (var i in args) {
        this.args[i] = args[i];
      }
      // // if ("name" in args) this.args_name = this.filter_attributes.filter(x => x.attributeName == this.args.name).length > 0 ? this.args.name : "-1";
      // if ("name" in args) {

      //   console.log("test", this.args.name);

      //   let temAttribute = [];

      //   if(this.args.name.startsWith('realtion_')) {
      //     temAttribute = this.filter_attributes[1];
      //     this.args_name = temAttribute.filter(x => x.attributeName == this.args.name.substring(9)).length > 0 ? this.args.name : "-1";
      //   } else if(this.args.name.startsWith('left_')) {
      //     temAttribute = this.filter_attributes[2];
      //     this.args_name = temAttribute.filter(x => x.attributeName == this.args.name.substring(5)).length > 0 ? this.args.name : "-1";
      //   } else if(this.args.name.startsWith('right_')) {
      //     temAttribute = this.filter_attributes[3];
      //     this.args_name = temAttribute.filter(x => x.attributeName == this.args.name.substring(6)).length > 0 ? this.args.name : "-1";
      //   } else {
      //     temAttribute = this.filter_attributes;
      //     this.args_name = temAttribute.filter(x => x.attributeName == this.args.name).length > 0 ? this.args.name : "-1";
      //   }

      //   console.log("test", this.args_name);

      //   console.log(temAttribute);

      // }
      if ("label" in args){
        let label = args.label;
        setTimeout(() => {
          this.args.label = label;
        }, 0);
      }
      return this;
    },
    getFormName() {
      return this.args.name;
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
    chooseIcon(value) {

      this.addIcon = false;

      let that = this;
      setTimeout(function(){
        that.addIcon = true;

        setTimeout(function(){
          that.setInheritStyle();
          that.$refs.main.querySelector("i").style.color = that.args.txt_fontColor;
        },0)

      },0)

    },
    changeType(value) {
      if(value == 'textarea') {
        this.args.maxAreaRow = 2;
      } else {
        this.args.height = 30;
      }

      let that = this;
      setTimeout(function(){
        that.setInheritStyle();
      },0)

    },
    getDataType(args) {
      return this.dataTypes;
    },
    // txtSizeChange(e) {
    //   console.log(e.target.value, this.$refs.main.querySelector(".i-input .ivu-input").style);
    //   this.$refs.main.querySelector(".i-input .ivu-input").style.fontSize = 'inherit !important';
    //   console.log(this.$refs.main.querySelector(".i-input .ivu-input").style.fontSize);
    // }
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
