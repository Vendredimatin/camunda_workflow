<template>
  <section v-if="t_preview" :addinName="name" :style="{'width': colWidth}" ref="main">
    <template v-if="args.structural_layout === 'horizontal'">
      <span v-if="args.required || args.label" :style="{'width': labelWidth, 'display': 'inline-block',
              'text-align': labelXAlign, 'vertical-align': labelYAlign,
              'background-color': args.label_color, 'padding-right': '10px'}">
                  <span v-if="args.required" style="color: red">*</span>
                  <label class="msize" :style="{'color': args.label_fontColor, 'font-size': args_lfsize}">{{ args.label }}</label>
              </span>
        <span
                :style="{'height': arg_height, 'line-height': arg_height, 'width': mainWidth, 'display': 'inline-block', 'text-align': mainXAlign, 'vertical-align': mainYAlign}"
        >
        <Rate
                :show-text="args.showText"
                :allow-half="args.allowHalf"
                :disabled="args.readonly"
                v-model="args.defaultValue"
                :style="{'color':args.txt_fontColor,'font-size':args_fsize }"
        >
            <span :style="{'color':args.txt_fontColor,'font-size':args_fsize }">{{ args.defaultValue }}</span>
          </Rate>
      </span>
    </template>
    <template v-else>
      <span v-if="args.required || args.label" :style="{'width': '100%', 'display': 'inline-block',
              'text-align': labelXAlign, 'vertical-align': labelYAlign,
              'background-color': args.label_color, 'padding-right': '10px'}">
                  <span v-if="args.required" style="color: red">*</span>
                  <label class="msize" :style="{'color': args.label_fontColor, 'font-size': args_lfsize}">{{ args.label }}</label>
              </span>
        <span
                :style="{'height': arg_height, 'line-height': arg_height, 'width': '100%', 'display': 'inline-block', 'text-align': mainXAlign, 'vertical-align': mainYAlign}"
        >
        <Rate
                :show-text="args.showText"
                :allow-half="args.allowHalf"
                :disabled="args.readonly"
                v-model="args.defaultValue"
                :style="{'color':args.txt_fontColor,'font-size':args_fsize }"
        >
            <span :style="{'color':args.txt_fontColor,'font-size':args_fsize }">{{ args.defaultValue }}</span>
          </Rate>
      </span>
    </template>

    <slot name="widget"></slot>
<span v-show="t_edit" ref="edit">
      <EditBox v-if="actEdit" :addinName="name" :widgetAnnotation="widgetAnnotation" :editExtendInfo="editExtendInfo" ref="editbox" v-model="args"
               @setAttrMap="setAttrMap"
               :itemValue="itemValue"
                :attributes="filter_attributes"
                :router="router"
                :route="route"
                :root="root"
                :query_oprs="query_oprs"
               :dataTypes="dataTypes"
                :targetclass="itemValue.data.targetClass">
        <div slot="attribute">
          <div class="margin1" style="margin: 10px 0 10px 0">
            半星<i-switch style="float: right" :disabled="args.isInt" v-model="args.allowHalf" />
          </div>
          <div class="margin1" style="margin: 10px 0 10px 0">
            显示文字<i-switch style="float: right"  v-model="args.showText" />
          </div>
        </div>
        <div slot="layout">
        </div>
        <div slot="operation"></div>
      </EditBox>
    </span>
  </section>
  <section v-else :addinName="name">
    <span style="text-align:center">
            <div class="form-addin-icon">
                <i class="iconfont">&#xe645;</i>
      </div>
      <div class="form-addin-name">评分</div>
    </span>
  </section>
</template>

<script>
import EditBox from "./_EditBox.vue";
const name = "D_Rate";
export default {
  name: name,
  /*
     根据需要使用props
     一般情况下都需要itemValue,
     需要设置目标属性时需要attributes, relation
     需要设置事件时需要query_oprs, route, router, root, Message
     需要用到store时需要store
     */
  props: ["argsProps", "widgetAnnotation", "editExtendInfo" , "itemValue", "attributes", "query_oprs", "route", "router", "root", "store", 'Message', "relation"],
  data() {
    return {
      times: 0,
      name: name,

      t_preview: true,
      t_edit: false,


      actEdit: false,
      args: {
        dynamic: false,     // 动态响应
        defaultValue: 0,
        title: "评分",
        hided: false,
        id: "",
        label_width: 2,
        label_align: 4, // 标签区域对齐方式,0-8,默认为4居中对齐
        label_fontType: "", // 标签字体
        label_fontSize: 14, // 标签字号
        label_fontColor: "initial", // 标签字体颜色
        txt_fontColor: 'initial',// 内容文字颜色
        lfsize: 14,// 标签文字大小
        lfsizeType: 'px',// 标签文字大小单位
        fsize: 14,// 内容文字大小
        fsizeType: 'px',// 内容文字大小单位
        required: false, // 是否必填
        readonly: false, // 是否只读

        main_width: 3,
        label_align: 4,
        main_align: 4,
        label: "",
        name: "",
        height: 30,
        heightType: "px",
        width: 100,
        widthType: '%',
        col: true,
        rows: 3,
        cols: 3,
        targetDataType: null,
        placeholder: "",
        allowHalf: false,
        showText: true,
        value: 0,
        isInt: true,

        events: [],
        eventRange: ["值变化"],
        structural_layout: 'horizontal'   //整体布局
      },

      // 支持的数据类型
      dataTypes: ["Integer", "Double"],

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

      timer: null,

      value: null,
    };
  },
  components: {
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
      this.setAttrMap()
    }
  },
  mounted() {
    if (this.t_preview) {
      this.setHeight();
    }

  },
  watch: {
        arg_name(val) {
            if (val in this.attrMap) {
                this.args.targetDataType = this.attrMap[val].valueType;

                if(this.args.targetDataType == 'Integer') {
                  this.args.isInt = true;
                  this.args.allowHalf = false
                } else {
                  this.args.isInt = false;
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
                let attr = this.store.state.DWF_form.Attributes[name];
                if (attr && attr.defaultValue) this.value = attr.defaultValue;
                if (this.args.isInt) this.value = parseInt(this.args.defaultValue);
                else this.value = parseFloat(this.args.defaultValue);
            } else this.args.targetDataType = null;
        },
  },
  computed: {
     // 文本内容字体大小
    args_fsize(){
      return this.args.fsize + this.args.fsizeType + '!important';
    },
    // 标签文本字体大小
    args_lfsize(){
      return this.args.lfsize + this.args.lfsizeType + '!important';
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
    filter_attributes() {
        return this.attributes ? ( this.relation ?
            [ "relation", this.attributes[1].filter(x => this.dataTypes.indexOf(x.valueType) > -1),
            this.attributes[2].filter(x => this.dataTypes.indexOf(x.valueType) > -1),
            this.attributes[3].filter(x => this.dataTypes.indexOf(x.valueType) > -1) ] : this.attributes.filter(x => this.dataTypes.indexOf(x.valueType) > -1) ) : [];
    },
  },
  beforeDestroy() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  },
  methods: {
    setAttrMap() {
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
      if (type == 0) this.t_preview = true;
      else this.t_preview = false;
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
    getEditBoxComponent(){
      return this.$refs.editbox;
    },

    getEditBox() {
      this.t_edit = true;
      return this.$refs.edit;
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
</style>
