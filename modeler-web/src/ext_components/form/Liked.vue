<template>
  <!--
        建模时的预览前端,即插件的实际显示样式
        :addinName="name"和ref="main"一般情况不可去除
  -->
  <section v-if="t_preview" :addinName="name" :style="{'width': colWidth}" ref="main">
    <template v-if="args.structural_layout === 'horizontal'">
      <span v-if="args.required || args.label" :style="{'width': labelWidth, 'display': 'inline-block',
            'text-align': labelXAlign, 'vertical-align': labelYAlign,
            'background-color': args.label_color, 'padding-right': '10px'}">
                <span v-if="args.required" style="color: red">*</span>
                <label class="msize" :style="{'color': args.label_fontColor, 'font-size': args_lfsize}">{{ args.label }}</label>
            </span>
      <span :style="{'height': arg_height, 'width': mainWidth, 'display': 'inline-block',
                'text-align': mainXAlign, 'vertical-align': mainYAlign,
                'color': args.main_fontColor}">
      <span
              v-show="!args.hided"
              :style="{'background-color': args.main_color, 'width': '100%', 'display': 'inline-block', 'vertical-align': mainYAlign}"
      >
        <div
                v-on:click="likeClick"
                :style="{'height': arg_height,'display': 'inline-block','background-color':bgColor, 'border-radius': '22px','padding':'1px 12px'}"
        >
          <Icon
                  :type="args.iconType"
                  :color="(args.defaultValue && args.defaultValue == 'true') ? args.likedColor : args.unlikeColor"
                  :style="{'font-size':args_fsize,'padding-bottom':'5px'}"
          />
          <span class='icon-txt' :style="{'font-size':args_fsize,'color':args.txt_fontColor,'line-height':arg_height,'padding':args.labelValue?'0px 8px':'0px'}">{{args.labelValue}}</span>
        </div>
      </span>

    </span>
    </template>
    <template v-else>
      <span v-if="args.required || args.label" :style="{'width': '100%', 'display': 'inline-block',
            'text-align': labelXAlign, 'vertical-align': labelYAlign,
            'background-color': args.label_color, 'padding-right': '10px'}">
                <span v-if="args.required" style="color: red">*</span>
                <label class="msize" :style="{'color': args.label_fontColor, 'font-size': args_lfsize}">{{ args.label }}</label>
            </span>
      <span :style="{'height': arg_height, 'width': '100%', 'display': 'inline-block',
                'text-align': mainXAlign, 'vertical-align': mainYAlign,
                'color': args.main_fontColor}">
      <span
              v-show="!args.hided"
              :style="{'background-color': args.main_color, 'width': '100%', 'display': 'inline-block', 'vertical-align': mainYAlign}"
      >
        <div
                v-on:click="likeClick"
                :style="{'height': arg_height,'display': 'inline-block','background-color':bgColor, 'border-radius': '22px','padding':'1px 12px'}"
        >
          <Icon
                  :type="args.iconType"
                  :color="(args.defaultValue && args.defaultValue == 'true') ? args.likedColor : args.unlikeColor"
                  :style="{'font-size':args_fsize,'padding-bottom':'5px'}"
          />
          <span class='icon-txt' :style="{'font-size':args_fsize,'color':args.txt_fontColor,'line-height':arg_height,'padding':args.labelValue?'0px 8px':'0px'}">{{args.labelValue}}</span>
        </div>
      </span>

    </span>
    </template>

    <slot name="widget"></slot>
<span v-show="t_edit" ref="edit">
      <EditBox v-if="actEdit" :addinName="name" :widgetAnnotation="widgetAnnotation" :editExtendInfo="editExtendInfo" ref="editbox" v-model="args"
                :attributes="filter_attributes"
                :router="router"
                :route="route"
                :root="root"
                :itemValue="itemValue"
                :query_oprs="query_oprs"
                :dataTypes="dataTypes"
                :targetclass="itemValue.data.targetClass">
        <div slot="attribute">
          <p class="margin1">形式</p>
          <Select v-model="args.iconType">
            <Option
              v-for="iType in iconTypeList"
              :value="iType.value"
              :key="iType.value"
            >{{ iType.label }}</Option>
          </Select>
           <p class="margin1">文字内容</p>
          <Input v-model="args.labelValue"></Input>
          <div class="margin1">
            <Checkbox v-model="args.hasBackground"/>是否设置背景
          </div>

          <Collapse v-model="openedCollapse">
            <Panel name="1">
              <span style="font-size: 12px;">颜色定制</span>
              <div slot="content" style="padding-left:10px">
                <p class="margin1">图标颜色</p>
                <div class="margin1">
                  未点击颜色
                  <ColorPicker v-model="args.unlikeColor"/>
                </div>
                <div class="margin1">
                  点击颜色
                  <ColorPicker v-model="args.likedColor"/>
                </div>
                <div v-if="args.hasBackground">
                  <p class="margin1">背景颜色</p>
                  <div class="margin1">
                    未点击背景色
                    <ColorPicker v-model="args.unlikeBgColor"/>
                  </div>
                  <div class="margin1">
                    点击背景色
                    <ColorPicker v-model="args.likedBgColor"/>
                  </div>
                </div>
                <!-- <p class="margin1">标签颜色</p>
                <div class="margin1">
                  未点击颜色
                  <ColorPicker v-model="args.unlikeLabelColor"/>
                </div>
                <div class="margin1">
                  点击颜色
                  <ColorPicker v-model="args.likedLabelColor"/>
                </div> -->
              </div>
            </Panel>
          </Collapse>
        </div>
        <div slot="layout"></div>
        <div slot="operation"></div>
      </EditBox>
    </span>
  </section>
  <section v-else :addinName="name">
    <span style="text-align:center">
            <div class="form-addin-icon">
                <i class="iconfont">&#xe651;</i>
      </div>
      <div class="form-addin-name">点赞</div>
    </span>
  </section>
</template>

<script>
import "@/styles/component/iconfont.css";
import EditBox from "./_EditBox.vue";
const name = "Liked";
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
        name: "", // 目标属性
        label: "", // 标签名称
        id: "", // 控件代号,一般为必须
        // rule: "", // 验证规则
        height: 30, // 整体高度
        width: 100, // 整体宽度,单位为%或者px
        widthType: "%", // 整体宽度的单位
        heightType: "px", // 整体高度的单位
        label_align: 4, // 标签区域对齐方式,0-8,默认为4居中对齐
        main_align: 4,
        label_fontType: "", // 标签字体
        label_fontSize: 14, // 标签字号
        label_fontColor: "initial", // 标签字体颜色
        lfsize: 14,// 标签文字大小
        lfsizeType: 'px',// 标签文字大小单位
        txt_fontColor: 'initial',
        fsize: 14,                        // 内容文字大小
        fsizeType: 'px',                  // 内容文字大小单位

        main_fontColor: "initial", // 主区域字体颜色
        main_color: "initial", // 主区域背景颜色
        align: "Vertical", // 标签与主区域的排列方式
        label_width: 2,
        main_width: 3, // 标签与主区域的占比为 label_width : main_width
        required: false, // 是否必填
        readonly: false, // 是否只读
        hided: false, // 是否隐藏
        defaultValue: null, // 默认值

        // 以下为不在属性编辑框中设置,但默认要有的配置项
        title: "点赞", // 插件中文名,需要填入默认值
        col: true, // 是否不占满全部
        cols: 3, // col=true时,宽度为 (100 / cols) %, 当设置了width之后失效
        targetDataType: null, // 目标数据类型
        events: [], // 已有的事件列表,元素格式为 { opr_type: '', opr_path: '', name: '事件中文名' }
        eventRange: ["值变化"], // 支持的事件列表,元素为事件中文名

        labelValue:"",
        iconType: "md-thumbs-up",
        unlikeColor: "#B3B3B3",
        likedColor: "#f5a623",
        hasBackground: true,
        unlikeBgColor: "#cccccc",
        likedBgColor: "#ec5557",
        likedLabelColor:"",
        unlikeLabelColor:"",
        structural_layout: 'horizontal'   //整体布局
      },
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
      // 支持的数据类型
      dataTypes: ["Boolean"],

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

      value: false,

      openedCollapse: "0",
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
      let that = this;
      if (this.attributes) {
        if (this.relation) {
          this.attributes[1].forEach(
            x => (that.attrMap["relation_" + x.attributeName] = x)
          );
          this.attributes[2].forEach(
            x => (that.attrMap["left_" + x.attributeName] = x)
          );
          this.attributes[3].forEach(
            x => (that.attrMap["right_" + x.attributeName] = x)
          );
        } else {
          this.attributes.forEach(x => (that.attrMap[x.attributeName] = x));
        }
      }
    }
  },
  mounted() {
    if (this.t_preview) {
      this.setHeight();
    }
    // if(this.$refs.main.querySelector(".icon-txt")){
    //   this.$refs.main.querySelector(".icon-txt").style.fontSize = 'inherit';
    //   if(!this.args.unlikeLabelColor){
    //     this.$refs.main.querySelector(".icon-txt").style.color = 'inherit';
    //   }
    // }

  },
  watch: {
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
        // if (this.value == "true") this.value = true;
        // else if (this.value == "false") this.value = false;
      } else this.args.targetDataType = null;
    }
  },
  computed: {
    arg_height() {
      return this.args.height < 3 && this.args.heightType == 'px' ? this.args.height * 30 + "px" : this.args.height + this.args.heightType;
      // return this.args.height < 2 && this.args.heightType == 'px' ? this.args.height * 30 + "px" : this.args.height + this.args.heightType;
    },
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
      return this.attributes
        ? this.relation
          ? [
              "relation",
              this.attributes[1].filter(
                x => this.dataTypes.indexOf(x.valueType) > -1
              ),
              this.attributes[2].filter(
                x => this.dataTypes.indexOf(x.valueType) > -1
              ),
              this.attributes[3].filter(
                x => this.dataTypes.indexOf(x.valueType) > -1
              )
            ]
          : this.attributes.filter(
              x => this.dataTypes.indexOf(x.valueType) > -1
            )
        : [];
    },
    //背景颜色
    bgColor() {
      if (this.args.hasBackground) {
        return (this.args.defaultValue && this.args.defaultValue == 'true') ? this.args.likedBgColor : this.args.unlikeBgColor;
      } else {
        return "";
      }
    }
  },
  beforeDestroy() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  },
  methods: {
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
    },

    likeClick() {
      this.args.defaultValue = !this.args.defaultValue;
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
