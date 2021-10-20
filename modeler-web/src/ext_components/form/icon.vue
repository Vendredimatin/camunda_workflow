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
              :style="{'height': arg_height, 'width': mainWidth, 'display': 'inline-block',
            'text-align': mainXAlign, 'color': args.main_fontColor}"
      >
        <span
                :style="{'background-color': args.main_color, 'width': '100%', 'display': 'inline-block', 'vertical-align': mainYAlign}"
        >
          <Icon
                  class="icon-addin"
                  v-if="displayValue.indexOf('icon')==-1"
                  :type="displayValue"
                  :style="{'color':args.iconColor,'font-size':args_iconSize,'height': arg_height,'line-height': arg_height, 'width': '100%', 'display': 'inline-block'}"
          ></Icon>
          <i
                  v-else
                  class="iconfont icon-addin"
                  :class="displayValue"
                  :style="{'color':args.iconColor,'font-size':args_iconSize,'height': arg_height,'line-height': arg_height, 'width': '100%', 'display': 'inline-block'}"
          ></i>
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
      <span
              :style="{'height': arg_height, 'width': '100%', 'display': 'inline-block',
            'text-align': mainXAlign, 'color': args.main_fontColor}"
      >
        <span
                :style="{'background-color': args.main_color, 'width': '100%', 'display': 'inline-block', 'vertical-align': mainYAlign}"
        >
          <Icon
                  class="icon-addin"
                  v-if="displayValue.indexOf('icon')==-1"
                  :type="displayValue"
                  :style="{'color':args.iconColor,'font-size':args_iconSize,'height': arg_height,'line-height': arg_height, 'width': '100%', 'display': 'inline-block'}"
          ></Icon>
          <i
                  v-else
                  class="iconfont icon-addin"
                  :class="displayValue"
                  :style="{'color':args.iconColor,'font-size':args_iconSize,'height': arg_height,'line-height': arg_height, 'width': '100%', 'display': 'inline-block'}"
          ></i>
        </span>
      </span>
    </template>

    <slot name="widget"></slot>
<span v-show="t_edit" ref="edit">
      <EditBox v-if="actEdit" :addinName="name" :widgetAnnotation="widgetAnnotation" :editExtendInfo="editExtendInfo" ref="editbox"
        v-model="args"
        :attributes="filter_attributes"
        :router="router"
        :route="route"
        :root="root"
        :itemValue="itemValue"
        :query_oprs="query_oprs"
        :dataTypes="dataTypes"
        :targetclass="itemValue.data.targetClass"
      >
        <div slot="attribute">
          <!--
                        属性选项放置区域
                        一般一个控件的prop都属于属性选项
          -->
          <!-- <p class="margin1">自定义图标映射规则</p>
          <Input
            class="margin1"
            v-model="args.selfOptions"
            type="textarea"
            style="margin-bottom: 6px;"
            placeholder="acttributeValue1:iconValue1,acttributeValue2:iconValue2"
          />
          <Button
            class="margin1"
            type="primary"
            @click="createOptions"
            style="margin-right: 6px;"
          >确认</Button>
          <Button class="margin1" @click="args.selfOptions = ''">重置</Button>-->
          <p class="margin1">图标属性映射表</p>
          <Input
            class="margin1"
            type="textarea"
            :autosize="true"
            v-model="args.selfOptions"
            @on-focus="chooseIcon"
          />
<!--          <Row class="margin1">-->
<!--            <Col span="10">-->
<!--              <Button type="primary" @click="mappingIcon">更新预览</Button>-->
<!--            </Col>-->
<!--          </Row>-->
          <div class="margin1">
            图标颜色
            <ColorPicker v-model="args.iconColor"/>
          </div>
          <div class="margin1">
            <p class="margin1">图标尺寸</p>
            <Input class="margin1" number v-model="args.iconSize">
              <Select v-model="args.iconSizeType" slot="append" style="width:70px">
                <Option value='px'>px</Option>
                <Option value='em'>em</Option>
              </Select>
            </Input>
          </div>
        </div>

        <div slot="layout">
          <!--
                        样式选项放置区域
                        仅有涉及到高度,宽度,对齐等样式的选项放在这里
          -->
        </div>
        <div slot="operation">
          <!--
                        事件选项放置区域
          -->
        </div>
      </EditBox>
    </span>
    <!-- 自定义图标映射关系弹窗组件 -->
    <IconEditModal v-if="needIcon" ref="icon_modal" @transferIcon="getIconLabel"></IconEditModal>
  </section>
  <!--
        插件的拖拽图标样式
        :addinName="name"不可去除
  -->
  <section v-else :addinName="name">
    <span style="text-align:center">
      <div class="form-addin-icon">
        <!--
                    此处为图标编码,到
                    https://www.iconfont.cn/manage/index?spm=a313x.7781069.1998910419.11&manage_type=myprojects&projectId=857540&keyword=
                    处选取
        -->
        <i class="iconfont">&#xe69a;</i>
      </div>
      <!-- 设置插件的中文名,名字长度小于等于3时使用 -->
      <div class="form-addin-name">图标</div>
      <!-- 设置插件的中文名,名字长度大于3时使用 -->
      <!--
                <Tooltip content="插件中文名" style="width: 100%;" :transfer="true">中文名前两个字...</Tooltip>
      -->
    </span>
  </section>
</template>

<script>
import "@/styles/component/iconfont.css";
import EditBox from "./_EditBox.vue";
import iconlist from "@/views/functional-model/components/moduleIcon.js";
import ilist from "@/views/functional-model/components/iFontIcon.js";
import IconEditModal from "./subcomponent/IconCommonPanel";

// 设置插件英文名, 该name需要与插件文件名一致
const name = "icon";

export default {
  name: name,
  /*
     根据需要使用props
     一般情况下都需要itemValue,
     需要设置目标属性时需要attributes, relation
     需要设置事件时需要query_oprs, route, router, root, Message
     需要用到store时需要store
     */
  props: ["argsProps", "widgetAnnotation", "editExtendInfo" ,
    "itemValue",
    "attributes",
    "query_oprs",
    "route",
    "router",
    "root",
    "store",
    "Message",
    "relation"
  ],
  data() {
    return {
      times: 0,
      name: name,

      t_preview: true,
      t_edit: false,

      // 属性配置项,按需设置

      actEdit: false,
      args: {
        dynamic: false,     // 动态响应
        name: "", // 目标属性
        label: "", // 标签名称
        id: "", // 控件代号,一般为必须
        // rule: "", // 验证规则
        height: 30, // 整体高度
        heightType: "px", // 整体高度的单位
        width: 100, // 整体宽度,单位为%或者px
        widthType: "%", // 整体宽度的单位

        label_align: 4, // 标签区域对齐方式,0-8,默认为4居中对齐
        label_fontType: "", // 标签字体
        label_fontSize: 14, // 标签字号
        label_fontColor: "initial", // 标签字体颜色
        label_color: "initial", // 标签背景颜色
        lfsize: 14,// 标签文字大小
        lfsizeType: 'px',// 标签文字大小单位
        fsizeType: 'px',// 内容文字大小单位

        // main_align: 4, // 主区域对齐方式,默认为4居中对齐
        main_fontType: "", // 主区域字体
        main_fontSize: 14, // 主区域字号
        main_fontColor: "initial", // 主区域字体颜色
        main_color: "initial", // 主区域背景颜色
        align: "Vertical", // 标签与主区域的排列方式
        label_width: 2,
        main_width: 3, // 标签与主区域的占比为 label_width : main_width
        required: false, // 是否必填
        readonly: false, // 是否只读
        hided: false, // 是否隐藏
        // defaultValue: "", // 默认值

        // 以下为不在属性编辑框中设置,但默认要有的配置项
        title: "图标", // 插件中文名,需要填入默认值
        col: true, // 是否不占满全部
        cols: 3, // col=true时,宽度为 (100 / cols) %, 当设置了width之后失效
        targetDataType: null, // 目标数据类型
        events: [], // 已有的事件列表,元素格式为 { opr_type: '', opr_path: '', name: '事件中文名' }
        eventRange: ["点击"], // 支持的事件列表,元素为事件中文名

        iconColor: "#5c6b77", //图标颜色
        iconSize: 20, //图标大小
        iconSizeType: 'px',
        iconLabel: "", //
        selfOptions:[],
        structural_layout: 'horizontal'   //整体布局
      },

      // 支持的数据类型, 基础数据类型为 String, TimeStamp, Boolean, Interger, Double, Long, UUID, Date, Clob
      dataTypes: ["String", "UUID", "Clob"],

      // 需要设置目标属性时使用
      attrMap: {},

      open: ["1", "2"],

      // 需要动态设置高度时使用
      timer: null,

      value: null,
      displayValue: "ios-add",
      iconlist: iconlist,
      iList: ilist,
      mappingNum: 1,
      needIcon: false,
      iconArr: [],
    };
  },
  components: {
    EditBox,
    IconEditModal
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
      // 需要设置目标属性时使用,不用可删去
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
      // 需要动态设置高度时使用,不用可删去
      this.setHeight();
    }

    // 字体/颜色/ 默认继承
    // this.$ref.main.querySelector(".").style.fontSize = 'inherit';
    // this.$ref.main.querySelector(".").style.color = 'inherit';
  },
  watch: {
    // 需要设置目标属性时使用,不用可删去
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
      } else this.args.targetDataType = null;
      if(this.value!=null) this.displayValue = this.value;
      else this.displayValue ="ios-add";
    },

    displayValue(val){
      !val ? this.displayValue = 'ios-add' : '';
    }
  },
  computed: {
    args_iconSize(){
      return this.args.iconSize + this.args.iconSizeType +  '!important';
    },

    // 标签文本字体大小
    args_lfsize(){
      return this.args.lfsize + this.args.lfsizeType + '!important';
    },
    // 需要设置目标属性时使用,不用可删去
    arg_name() {
      return this.args.name;
    },
    // 需要设置目标属性时使用,不用可删去
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
    mainNXAlign() {
      let x = parseInt(this.args.main_align / 3);
      if (x == 0) return "flex-start";
      else if (x == 1) return "center";
      else return "flex-end";
    },
    mainNYAlign() {
      let x = parseInt(this.args.main_align % 3);
      if (x == 0) return "flex-start";
      else if (x == 1) return "center";
      else return "flex-end";
    }
  },
  // 销毁函数,清除生成的内存占用
  beforeDestroy() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  },
  methods: {
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

    setDisplayType(type) {
      this.t_preview = type == 0;
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
    // 确认创建Options
    // createOptions() {
    //   if (this.args.selfOptions == "") {
    //     this.$Message.info("请先输入所需自定义内容");
    //   } else {
    //     // 中英文逗号替换
    //     this.args.selfOptions = this.args.selfOptions.replace(/，/gi, ",");
    //     let optionAttr = this.args.selfOptions.split(",");

    //     optionAttr.forEach((item, index) => {
    //       if (item != "") {
    //         // 中英文冒号替换
    //         this.args.selfOptions = this.args.selfOptions.replace(/：/gi, ",");
    //         let optionAttrValue = item.split(":");
    //         if (optionAttrValue[0] == this.value) {
    //           this.displayValue = optionAttrValue[1];
    //         }
    //       } else {
    //         this.$Message.info("未匹配到冒号");
    //       }
    //     });
    //     console.log("value replace:", this.value);
    //   }
    // },

    chooseIcon() {
      console.log(this.needIcon);
      let that = this;
      if (!this.needIcon) {
        this.needIcon = true;

        this.$Spin.show();

        setTimeout(function() {
          that.$Spin.hide();
          that.$refs.icon_modal.editModal(that.iconAr,that.args.selfOptions);
        }, 500);
      } else {
        that.$refs.icon_modal.editModal(that.iconArr,that.args.selfOptions);
      }
    },

    /**
     * @description 设置图标映射表
     */
    getIconLabel(data) {
      console.log("getIconLabel",data);
      this.args.selfOptions = data;
      this.args.selfOptions = this.args.selfOptions.replace(/，/gi, ",");
      this.args.selfOptions = this.args.selfOptions.replace(/：/gi, ":");
      if (data.length != 0) {
        let temArr = data.split(",");
        // 映射表
        temArr.forEach(val => {
          let _key = val.split(":")[0];
          let _value = val.split(":")[1];
        });
        // 整理传回图标组件的图标合集
        temArr = temArr.map(x => {
          return x.split(":")[1];
        });
        this.iconArr = temArr;
      } else {
        this.iconArr = [];
      }
      console.log()
    },

    mappingIcon() {
      if (this.args.selfOptions != "") {
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
      console.log("value replace:", this.value);
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
.margin1 {
  margin-top: 5px;
  margin-bottom: 5px;
}
.icon-addin:hover {
  opacity: 0.5 !important;
}
</style>
```
