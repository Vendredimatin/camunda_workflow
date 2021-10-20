<template>
  <section v-if="t_preview" :addinName="name" :style="{'width': colWidth}" ref="main">

    <span
      v-if="args.required || args.label"
      :style="{'width': labelWidth, 'display': 'inline-block',
        'text-align': labelXAlign, 'vertical-align': labelYAlign, 'padding-right': '10px'}"
    >
      <span
        :style="{'background-color': args.label_color, 'width': '100%', 'display': 'inline-block'}"
      >
        <span v-if="args.required" style="color: red">*</span>
        <label class="msize" :style="{'color': args.label_fontColor,'font-size':args_lfsize}" >{{ args.label }}</label>
      </span>
    </span>

    <span
      :style="{'height': arg_height, 'line-height': arg_height, 'width': mainWidth, 'display': 'inline-block',
            'text-align': mainXAlign, 'color': args.main_fontColor}"
    >
      <span
        :style="{'height': arg_height, 'width': '100%', 'display': 'inline-block', 'vertical-align': mainYAlign}"
      >
        <Cascader
          class="i-input"
          :disabled="args.readonly"
          v-if="args.enSelect == 'enAttr'"
          :data="allClassAttr"
          :load-data="loadClass"
          filterable
          transfer
          v-model="selectedGroups"
          @on-change="handleChange"
          :style="{'font-size':args_fsize,'color':args.txt_fontColor,'text-align': mainXAlign,'background': args.txt_bgColor}"
        ></Cascader>

        <Select class="i-input" v-model="value" v-else  transfer :disabled="args.readonly" filterable clearable
          :style="{'position': 'relative','top':'-2px', 'width': '100%', 'display': 'inline-block', 'text-align': mainXAlign, 'vertical-align': mainYAlign, 'font-size': args_fsize,'color':args.txt_fontColor}"
        >
            <Option v-for="item in allClassAttr" :value="item.value" :key="item.value" :label="item.label">
              <span class="self-color">{{ item.label }}</span>
              <span class="self-color" style="float:right;color:#ccc">{{ item.value }}</span>
            </Option>
        </Select>
      </span>
    </span>

    <slot name="widget"></slot>
<span v-show="t_edit" ref="edit">
      <EditBox v-if="actEdit" :addinName="name" :widgetAnnotation="widgetAnnotation" :editExtendInfo="editExtendInfo" ref="editbox"
               :itemValue="itemValue"
        v-model="args"
        :attributes="filter_attributes"
        :router="router"
        :route="route"
        :root="root"
        :query_oprs="query_oprs"
       :dataTypes="dataTypes"
        :targetclass="itemValue.data.targetClass"
      >
        <div slot="attribute">
         <p class="margin1">类范围</p>
          <Select class="margin1" v-model="args.classCover" @on-change="changeCover">
              <Option v-for="item in coverList" :value="item.value" :key="item.value">{{ item.label }}</Option>
          </Select>
          <div class="margin1">
            <p>指定为</p>
            <RadioGroup v-model="args.enSelect">
                <Radio label="enAttr">类及属性</Radio>
                <Radio label="entities">类</Radio>
            </RadioGroup>
          </div>
        </div>

        <div slot="layout">

        </div>
        <div slot="operation">

        </div>
      </EditBox>
    </span>
  </section>

  <section v-else :addinName="name">
    <span style="text-align:center">
            <div class="form-addin-icon">
                <i class="iconfont">&#xe6b0;</i>
      </div>

      <Tooltip class="form-addin-name" content="类属性点选器" style="width: 100%;" :transfer="true">类属性</Tooltip>
    </span>
  </section>
</template>

<script>
import { getObjName, getAllEntities, getAllRelations } from "@/api/others.js";
import "@/styles/component/iconfont.css";
import EditBox from "./_EditBox.vue";
import {mapGetters} from "vuex";

const name = "EntitiesAttrSelect";

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
        // dynamic: false,     // 动态响应
        name: "", // 目标属性
        label: "", // 标签名称
        id: "", // 控件代号,一般为必须
        height: 30, // 整体高度
        width: 100, // 整体宽度,单位为%或者px
        widthType: "%", // 整体宽度的单位
        heightType: "px", // 整体高度的单位
        label_align: 4, // 标签区域对齐方式,0-8,默认为4居中对齐
        label_fontType: "", // 标签字体
        label_fontSize: 14, // 标签字号
        label_fontColor: "initial", // 标签字体颜色
        label_color: "initial", // 标签背景颜色
        txt_fontColor: 'initial',// 内容文字颜色
        txt_bgColor: '#fff',        // 输入框背景颜色
        lfsize: 14,// 标签文字大小
        lfsizeType: 'px',// 标签文字大小单位
        fsize: 14,// 内容文字大小
        fsizeType: 'px',// 内容文字大小单位


        main_align: 4, // 主区域对齐方式,默认为4居中对齐
        // main_fontType: "", // 主区域字体
        // main_fontSize: 14, // 主区域字号
        main_fontColor: "initial", // 主区域字体颜色
        main_color: "initial", // 主区域背景颜色
        align: "Vertical", // 标签与主区域的排列方式
        label_width: 2,
        main_width: 3, // 标签与主区域的占比为 label_width : main_width
        required: false, // 是否必填
        readonly: false, // 是否只读
        hided: false, // 是否隐藏

        // 以下为不在属性编辑框中设置,但默认要有的配置项
        title: "类与属性", // 插件中文名,需要填入默认值
        col: true, // 是否不占满全部
        cols: 3, // col=true时,宽度为 (100 / cols) %, 当设置了width之后失效
        targetDataType: null, // 目标数据类型
        events: [],
        eventRange: ["值变化"],

        enSelect: 'enAttr',
        classCover: 'entities',
      },

      coverList: [
        {
          value: 'entities',
          label: '实体类'
        }, {
          value: 'relations',
          label: '关联类'
        }, {
          value: 'allClasses',
          label: '全部类'
        }
      ],

      all_class: [],
      all_rclass: [],

      // 支持的数据类型, 基础数据类型为 String, TimeStamp, Boolean, Interger, Double, Long, UUID, Date, Clob
      dataTypes: ["String", "Clob"],

      // 需要设置目标属性时使用
      attrMap: {},

      open: ["1", "2"],

      // 需要动态设置高度时使用
      timer: null,

      value: "",

      allEntitiesAttr: [],
      allRelationsAttr: [],
      allClassAttr: [],

      selectedGroups:[],
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
      this.$store = this.store;
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
      this.setInheritStyle();
      this.getEntities();

      if(this.$refs.main.querySelector(".ivu-input")){
        this.$refs.main.querySelector(".ivu-input").style.textAlign = this.mainXAlign;
      }
    }


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
    },
    mainXAlign(val){
      if(this.$refs.main.querySelector(".ivu-input")){
        this.$refs.main.querySelector(".ivu-input").style.textAlign = val;
      }
    },
    'args.txt_bgColor'(val){
      if(this.args.enSelect == 'enAttr'){
           this.$refs.main.querySelectorAll('.i-input .ivu-cascader-rel .ivu-input') && this.$refs.main.querySelectorAll('.i-input .ivu-cascader-rel').length != 0
          ? this.$refs.main.querySelectorAll('.i-input .ivu-cascader-rel .ivu-input').forEach(item => {
            item.style.backgroundColor = val;
          }): '';
      }else{
           this.$refs.main.querySelectorAll('.i-input .ivu-select-selection') && this.$refs.main.querySelectorAll('.i-input .ivu-select-selection').length != 0
          ? this.$refs.main.querySelectorAll('.i-input .ivu-select-selection').forEach(item => {
            item.style.backgroundColor = val;
          }): '';
      }
    },
    'args.height'(val) {
      this.setHeight();
      this.setInheritStyle();
    },
    'args.heightType'(val) {
      this.setHeight();
      this.setInheritStyle();
    },
    'args.enSelect'(val) {
      if(val) {
        let self = this;
        setTimeout(function() {
          self.setInheritStyle();
        }, 500);
      }
    }
  },
  computed: {
    ...mapGetters("DWF_form", ["Entities", "Relations"]),
    // 文本内容字体大小
    args_fsize(){
      return this.args.fsize + this.args.fsizeType + '!important';
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
      return this.args.height < 2 && this.args.heightType == 'px' ? this.args.height * 30 + "px" : this.args.height + this.args.heightType;
    },
    colWidth() {
        return this.args.width + this.args.widthType;
      //    return this.args.col ? parseInt(100.0 / this.args.cols) + "%" : "100%";
    },
    labelWidth() {
      if(this.args.labelWidthUnit && this.args.labelWidthUnit === 'px'){
        return (!this.args.label || this.args.label == "") && this.args.required ? "10%" : this.args.label_widthByPx + 'px';
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
    setInheritStyle() {
      try {
        this.$refs.main.querySelectorAll('.i-input div') && this.$refs.main.querySelectorAll('.i-input div').length != 0
          ? this.$refs.main.querySelectorAll('.i-input div').forEach(item => {
              item.style.fontSize = 'inherit';
              item.style.height = 'inherit';
              item.style.color = 'inherit';
              item.style.backgroundColor = 'inherit';
            })
          : '';
        this.$refs.main.querySelectorAll('.i-input .ivu-tag-text') && this.$refs.main.querySelectorAll('.i-input .ivu-tag-text').length != 0
          ? this.$refs.main.querySelectorAll('.i-input .ivu-tag-text').forEach(item => {
              item.style.fontSize = 'inherit';
              item.style.color = 'inherit';
              item.style.backgroundColor = 'inherit';
            })
          : '';
        this.$refs.main.querySelectorAll('.i-input .ivu-tag') && this.$refs.main.querySelectorAll('.i-input .ivu-tag').length != 0
          ? this.$refs.main.querySelectorAll('.i-input .ivu-tag').forEach(item => {
              item.style.fontSize = 'inherit';
              item.style.color = 'inherit';
              item.style.backgroundColor = 'inherit';
            })
          : '';
        this.$refs.main.querySelectorAll('.i-input .ivu-cascader-rel .ivu-cascader-label') && this.$refs.main.querySelectorAll('.i-input .ivu-cascader-label').length != 0
        ? this.$refs.main.querySelectorAll('.i-input .ivu-cascader-rel .ivu-cascader-label').forEach(item => {
          item.style.fontSize = 'inherit';
          item.style.height = this.arg_height;
          item.style.lineHeight = this.arg_height;
          item.style.border = '1px solid #dcdee2';
          item.style.borderRadius = '4px';
        })
        : '';
        this.$refs.main.querySelectorAll('.i-input .ivu-cascader-rel input') && this.$refs.main.querySelectorAll('.i-input .ivu-cascader-label').length != 0
        ? this.$refs.main.querySelectorAll('.i-input .ivu-cascader-rel input').forEach(item => {
          item.style.fontSize = 'inherit';
          item.style.height = this.arg_height;
          item.style.lineHeight = this.arg_height;
        })
        : '';
        this.$refs.main.querySelectorAll('.i-input .ivu-select-selected-value') && this.$refs.main.querySelectorAll('.i-input .ivu-select-selected-value').length != 0
          ? this.$refs.main.querySelectorAll('.i-input .ivu-select-selected-value').forEach(item => {
              item.style.fontSize = 'inherit';
              item.style.color = 'inherit';
              item.style.lineHeight = this.arg_height;
              item.style.height = this.arg_height;
              item.style.backgroundColor = 'inherit';
            })
          : '';
        if(this.args.enSelect == "enAttr"){
          this.$refs.main.querySelectorAll('.i-input .ivu-cascader-rel .ivu-input') && this.$refs.main.querySelectorAll('.i-input .ivu-cascader-rel').length != 0
          ? this.$refs.main.querySelectorAll('.i-input .ivu-cascader-rel .ivu-input').forEach(item => {
            item.style.backgroundColor = this.args.txt_bgColor;
          }): '';
        }else{
          this.$refs.main.querySelectorAll('.i-input .ivu-select-selection') && this.$refs.main.querySelectorAll('.i-input .ivu-select-selection').length != 0
          ? this.$refs.main.querySelectorAll('.i-input .ivu-select-selection').forEach(item => {
            item.style.backgroundColor = this.args.txt_bgColor;
            item.style.overflow = 'hidden';
            item.style.fontSize = 'inherit';
            item.style.height = this.arg_height;
          }): '';
          this.$refs.main.querySelectorAll('.i-input .ivu-select-input') && this.$refs.main.querySelectorAll('.i-input .ivu-select-input').length != 0
            ? this.$refs.main.querySelectorAll('.i-input .ivu-select-input').forEach(item => {
              item.style.fontSize = 'inherit';
              item.style.color = 'inherit';
              item.style.lineHeight = this.arg_height;
              item.style.height = this.arg_height;
              item.style.textAlign = 'inherit';
            })
            : '';
          this.$refs.main.querySelectorAll('.i-input .ivu-select-placeholder') && this.$refs.main.querySelectorAll('.i-input .ivu-select-placeholder').length != 0
          ? this.$refs.main.querySelectorAll('.i-input .ivu-select-placeholder').forEach(item => {
            item.style.fontSize = 'inherit';
            item.style.lineHeight = this.arg_height;
            item.style.height = this.arg_height;
          })
          : '';
        }
      } catch (e) {

      }
    },
    getErrorIDBEn() {
      this.allEntitiesAttr = [];
      getAllEntities({needOperationCount: false}).then(response => {

        let res = response.data;
        if (!res.success) {
          this.$Message.warning(res.message);
        } else {
          if (res.data.length == 0) {
            this.allEntitiesAttr = [];
          } else {

            this.allEntitiesAttr = res.data.map(val => {

              val.value = val.className;
              val.label = val.displayName;
              val.children = [];
              val.loading = false;
              return val;

            })

          }
        }

      }).then(() => {
        this.initData(this.args.classCover);
      }).catch(e => {
        console.log(e)
      });

    },
    getErrorIDBRe() {

      this.allRelationsAttr = [];
      getAllRelations().then(response => {

        let res = response.data;
        if (!res.success) {
          this.$Message.warning(res.message);
        } else {
          if (res.data.length == 0) {
            this.allRelationsAttr = [];
          } else {

            this.allRelationsAttr = res.data.map(val => {

              val.value = val.className;
              val.label = val.displayName;
              val.children = [];
              val.loading = false;
              return val;

            })

          }
        }

      }).then(() => {
        this.initData(this.args.classCover);
      }).catch(e => {
        console.log(e)
      });

    },
    // 当插件无法直接通过style设置高度时,使用setHeight方法设置高度
    setHeight() {
      if (!this.$refs.main) return;
      let that = this;
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

    // 切换类的选择范围
    changeCover(value) {

      this.allClassAttr = [];
      this.selectedGroups = [];
      this.value = '';

      if(value == 'entities') {

        if(this.allEntitiesAttr.length > 0) {
          this.allClassAttr = this.allEntitiesAttr;
        } else {
          this.getEntities();
        }

      } else if(value == 'relations') {

        if(this.allRelationsAttr.length > 0) {
          this.allClassAttr = this.allRelationsAttr;
        } else {
          this.getRelations();
        }

      } else if(value == 'allClasses') {

        if(this.allEntitiesAttr.length > 0 && this.allRelationsAttr.length > 0) {
          this.allClassAttr = this.allEntitiesAttr.concat(this.allRelationsAttr);
        } else {
          if(this.allEntitiesAttr.length > 0) {
            this.getRelations();
          }
          if(this.allRelationsAttr.length > 0) {
            this.getEntities();
          }
        }

      } else {
        console.log(value)
      }

    },

    // 获取实体类
    getEntities() {

      this.allEntitiesAttr = [];
      let allEn = this.Entities();
      if(allEn && allEn.length > 0) {

        allEn.forEach((val) => {
          let eachItem = {
            value: val.className,
            label: `${val.className} ${val.displayName}`,
            children: [],
            loading: false
          };
          this.allEntitiesAttr.push(eachItem);
        });

        this.initData(this.args.classCover);

      } else {
        this.getErrorIDBEn();
      }

    },

    // 获取关联类
    getRelations() {

      // 关联类
      this.allRelationsAttr = [];
      let allRe = this.Relations();
      if(allRe && allRe.length > 0) {

        allRe.forEach((val) => {
          let eachItem = {
            value: val.className,
            label: val.displayName,
            children: [],
            loading: false
          };
          this.allRelationsAttr.push(eachItem);
        });

        this.initData(this.args.classCover);

      } else {
        this.getErrorIDBRe();
      }

    },

    loadClass(item, callback) {

      getObjName(item.value).then(response => {

        let res = response.data;
        if (!res.success) {
          this.$Message.warning(res.message);
        } else {

          let itemChildren = res.data.map(val => {
            val.value = val.attributeName;
            val.label = `${val.attributeName} ${val.displayName}`;
            return val;
          })

          item.loading = true;
          setTimeout(() => {
            item.children = itemChildren;
            item.loading = false;
            callback();
          }, 1000);

        }

      }).catch(e => {
        console.log(e);
      });

    },


    initData(status) {

      this.allClassAttr = [];

      if(status == 'entities') {

        this.allClassAttr = this.allEntitiesAttr;

      } else if(status == 'relations') {

        this.allClassAttr = this.allRelationsAttr;

      } else {

        this.allClassAttr = this.allEntitiesAttr.concat(this.allRelationsAttr);

      }

    },

    cascaderFormat(labels, selectedData) {
      const index = labels.length - 1;
      return labels[index];
    },

    handleChange(value,selectedData){
      var index = value.length-1;
      this.value = value[index];
      console.log("this.value",this.value);
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
