<template>
    <!-- 输入框 -->
        <section v-if="t_preview" :addinName="name" :style="{'font-size': args.fontSize + 'px', 'width': colWidth}" ref="main">
          <template v-if="args.structural_layout === 'horizontal'">
            <span v-if="args.required || args.label" :style="{'width': labelWidth, 'display': 'inline-block',
            'padding-left':'16px','text-align': labelXAlign, 'vertical-align': labelYAlign,
            'background-color': args.label_color, 'padding-right': '10px'}">
                <span v-if="args.required" style="color: red">*</span>
                <label class="msize" :style="{'color': args.label_fontColor, 'font-size': args_lfsize}">{{ args.label }}</label>
            </span>
            <span :style="{'min-height': arg_height, 'width': mainWidth, 'display': 'inline-block',
                'text-align': mainXAlign, 'vertical-align': mainYAlign,
                'background-color': args.main_color,'color': args.main_fontColor}">
                <van-field
                        v-if="addIcon"
                        class="i-input"
                        v-model="args.defaultValue"
                        :input-align="mainXAlign"
                        :placeholder="args.placeholder"
                        :left-icon="args.prefixIcon"
                        :right-icon="args.suffixIcon"
                        :size="args.size"
                        :type="args.type"
                        :maxlength="args.maxLength==''?null:args.maxLength"
                        :show-word-limit="args.showWordLimit"
                        :readonly="args.readonly && !t_preview"
                        :rows="parseInt(args.maxAreaRow)"
                        :style="{'padding-top':'0','padding-bottom':'0','height': arg_height, 'min-height': arg_height, 'line-height': arg_height, 'width': '100%', 'text-align': mainXAlign, 'color': args.txt_fontColor, 'font-size': args_fsize, 'background-color': args.txt_bgColor}"
                ></van-field>
            </span>
          </template>
          <template v-else>
            <span v-if="args.required || args.label" :style="{'width': '100%', 'display': 'flex',
            'padding-left':'16px','text-align': labelXAlign, 'align-items': labelYAlignFlex,
            'background-color': args.label_color, 'padding-right': '10px'}">
              <div :style="{'width': '100%', 'padding-right': '10px'}">
                <span v-if="args.required" style="color: red">*</span>
                <label class="msize" :style="{'color': args.label_fontColor, 'font-size': args_lfsize}">{{ args.label }}</label>
              </div>
            </span>
            <span :style="{'min-height': arg_height, 'width': '100%', 'display': 'inline-block',
                'text-align': mainXAlign, 'vertical-align': mainYAlign,
                'color': args.main_fontColor}">
                <van-field
                        v-if="addIcon"
                        class="i-input"
                        v-model="args.defaultValue"
                        :input-align="mainXAlign"
                        :placeholder="args.placeholder"
                        :left-icon="args.prefixIcon"
                        :right-icon="args.suffixIcon"
                        :size="args.size"
                        :type="args.type"
                        :readonly="args.readonly && !t_preview"
                        :rows="parseInt(args.maxAreaRow)"
                        :maxlength="args.maxLength==''?null:args.maxLength"
                        :show-word-limit="args.showWordLimit"
                        :style="{'padding-top':'0','padding-bottom':'0','height': arg_height, 'min-height': arg_height, 'line-height': arg_height, 'width': '100%', 'text-align': mainXAlign, 'color': args.txt_fontColor, 'font-size': args_fsize, 'background-color': args.txt_bgColor}"
                ></van-field>
            </span>
          </template>
          <slot name="widget"></slot>
            <span v-show="t_edit" ref="edit">
                <EditBox v-if="actEdit" :widgetAnnotation="widgetAnnotation" :editExtendInfo="editExtendInfo" ref="editbox" v-model="args"
                :attributes="filter_attributes"
                :router="router"
                :route="route"
                :root="root"
                :itemValue="itemValue"
                :query_oprs="query_oprs"
                :dataTypes="dataTypes"
                :targetclass="itemValue.data.targetClass">
                    <div slot="attribute">
                        <p class="margin1">文本框类型</p>
                        <Select class="margin1" v-model="args.type"  @on-change="changeType">
                            <Option v-for="item in inputTypeList" :value="item.value" :key="item.value" :label="item.value">{{item.value}}

                            <span style="float:right;color:#ccc">{{ item.label }}</span>
                            </Option>
                        </Select>
                        <p class="margin1" v-show="args.type == 'textarea'">行数</p>
                        <Input v-show="args.type == 'textarea'" class="margin1" type="number" v-model="args.maxAreaRow" />
                        <p class="margin1">占位文本</p>
                        <Input class="margin1" type="text" v-model="args.placeholder" />
                        <p class="margin1">文本框头部图标</p>
                        <Select v-model="args.prefixIcon" filterable clearable @on-change="chooseIcon">
                          <Option v-for="item in iconList" :value="item.value" :key="item.value" :label="item.label">
                            <van-icon :name="`${item.value}`" size=20></van-icon>
                            <span style="float:right;color:#ccc">{{ item.label }}</span>
                          </Option>
                        </Select>
                        <p class="margin1">文本框尾部图标</p>
                        <Select v-model="args.suffixIcon" filterable clearable @on-change="chooseIcon">
                          <Option v-for="item in iconList" :value="item.value" :key="item.value" :label="item.label">
                            <van-icon :name="`${item.value}`" size=20></van-icon>
                            <span style="float:right;color:#ccc">{{ item.label }}</span>
                          </Option>
                        </Select>

                        <p class="margin1">最大文本长度</p>
                        <Input class="margin1" v-model="args.maxLength" type="number"/>

                        <div class="margin1" >
                            显示字数统计
                            <i-switch style="float: right" v-model="args.showWordLimit"  />
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
import EditBox from "@/ext_components/form/_EditBox.vue"
import "@/styles/component/iconfont.css";
import vantIconData from "@/views/functional-model/components/vantIcon.js";

const name = "TextInput";
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
          value: "text",
          label:'文本'
        },
        {
          value: "password",
          label:'密码'
        },
        {
          value: "textarea",
          label:'文本框'
        },
        {
          value: "tel",
          label:'电话'
        },
        {
          value: "digit",
          label:'整数'
        },
        {
          value: "number",
          label:'数字'
        }
      ],
      iconList: [],
      args: {
        showWordLimit: false,
        maxLength: '',
        dynamic: false,     // 动态响应
        needCheckDuplic: false,
        defaultValue: '',
        label_color: 'initial',
        main_fontColor: 'initial',
        main_color: 'initial',
        title: '文本框',
        id: null,
        size: "default",
        type: "text",
        placeholder: "",
        clearable: false,
        readonly: false,
        required: false,
        hided: false,
        icon: "",
        value: "",
        label_width: 2,
        main_width: 3,
        label_align: 4,
        main_align: 4,
        maxAreaRow: 2,
        rule: '',
        ruleMessage: '',
        prefixIcon: '',   // 头部图标
        suffixIcon: '',   // 尾部图标
        // 属性插件所需属性
        label: "",
        name: "",
        targetDataType: null,
        height: 44,
        heightType: "px",
        width: 100,
        widthType: '%',
        label_fontColor: 'initial',       // 标签文字颜色
        txt_fontColor: "initial", // 内容文字颜色
        txt_bgColor: '#fff',              // 输入框背景颜色
        lfsize: 14,                       // 标签文字大小
        lfsizeType: 'px',                 // 标签文字大小单位
        fsize: 14, // 内容文字大小
        fsizeType: "px", // 内容文字大小单位
        col: true,
        // 布局插件所需属性
        rows: 3,
        cols: 3,
        events: [],
        eventRange: ["值变化", "失去焦点", "获得焦点", "值校验", "最大长度"],
        structural_layout: 'horizontal'   //整体布局
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
    if (this.t_preview) {
      this.iconList = vantIconData;
      this.$nextTick(() => {
        this.setInheritStyle();
        this.setHeight();
      })
    }
  },
  beforeDestroy() {
      if (this.timer) { clearInterval(this.timer); this.timer = null; };
  },
  watch: {
      arg_height(val) {
        this.setHeight();
      },
      // args_fcolor(val) {
      //   this.$refs.main.querySelector("i").style.color = val;
      // },
      // 需要用到实体类属性列表时使用
      // args_name(val) {
      //     if (val != "-1") {
      //         this.args.name = val;
      //     } else {
      //         // // // // this.args.name = "";
      //     }
      // },
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
      labelYAlignFlex(){
        let x = this.args.label_align % 3;
        if (x == 0) return "flex-start";
        else if (x == 1) return "center";
        else return "flex-end";
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

    // 当插件无法直接通过style设置高度时,使用setHeight方法设置高度
    setHeight() {
      return;
        // if (!this.$refs.main) return;
        // let that = this;
        // if (this.timer == null) {
        //   this.timer = setInterval(() => {
        //       if (!that.$refs.main) { clearInterval(that.timer); that.timer=null; return; }
        //       // 改成你需要的样式
        //       var dom = that.$refs.main.querySelector(".i-input .ivu-input");
        //       if (dom) {
        //           that ? dom.style.height = that.arg_height : '';
        //           clearInterval(that.timer);
        //           that.timer = null;
        //       } else {
        //         that.times += 30;
        //         if (that.times > 60 * 1000) {
        //             clearInterval(that.timer);
        //             that.timer = null;
        //         }
        //       }
        //   }, 30);
        // }
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
      this.$refs.main.querySelector(".i-input").style.height = 'inherit';
      this.$refs.main.querySelector(".i-input").style.textAlign = 'inherit';
      // this.$refs.main.querySelector(".i-input").style.backgroundColor = 'inherit';
      this.$refs.main.querySelector(".i-input .van-cell__value").style.color = 'inherit';
      this.$refs.main.querySelector(".i-input .van-field__control").style.color = 'inherit';
      this.$refs.main.querySelector(".i-input .van-field__right-icon")? this.$refs.main.querySelector(".i-input .van-field__right-icon").style.color = 'inherit': '';
      this.$refs.main.querySelector(".i-input .van-field__value") ? this.$refs.main.querySelector(".i-input .van-field__value").style.height = 'inherit' : '';
      this.$refs.main.querySelector(".i-input .van-field__value") ? this.$refs.main.querySelector(".i-input .van-field__value").style.fontSize = 'inherit' : '';
      this.$refs.main.querySelector(".i-input .van-field__body") ? this.$refs.main.querySelector(".i-input .van-field__body").style.fontSize = 'inherit' : '';
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
      console.log(value, 'change')
      if(value == 'textarea') {
        this.args.maxAreaRow = 2;
      } else {
        this.args.height = 44;
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
<style>
.van-field--min-height .van-field__control {
    min-height: 0px;
}
</style>
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
