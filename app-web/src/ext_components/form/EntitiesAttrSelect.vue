<template>

  <section :addinName="name" :style="{'width': colWidth}" ref="main" v-show="!args.hided">

    <span
      v-if="args.required || args.label"
      :style="{'width': labelWidth, 'display': 'inline-block',
        'text-align': labelXAlign, 'vertical-align': labelYAlign, 'padding-right': '10px'}"
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
      <span :style="{'background-color': args.main_color, 'width': '100%', 'height': arg_height, 'display': 'inline-block', 'vertical-align': mainYAlign}">
          <Cascader
            class="i-input self-color"
            :disabled="args.readonly || t_visit"
            v-if="args.enSelect == 'enAttr'"
            :data="allClassAttr"
            :load-data="loadClass"
            filterable
            transfer
            v-model="selectedGroups"
            @on-change="handleChange"
            @on-clear="handleClear"
            :style="{'font-size':args_fsize,'color':args_fcolor,'border': border,'text-align': mainXAlign}"
          ></Cascader>

          <Select v-else class="i-input self-color" :disabled="args.readonly || t_visit" transfer v-model="value" filterable clearable
          :style="{'width': '100%', 'display': 'inline-block', 'text-align': mainXAlign, 'vertical-align': mainYAlign, 'font-size': args_fsize,'color':args_fcolor,'border': border}" @on-change="handleEntityChange">
            <Option style="text-align:left;" v-for="user in allClassAttr" :value="user.value" :key="user.value" :label="user.label">
              <span class="self-color">{{ user.displayName }}</span>
              <span class="self-color" style="float:right;color:#ccc">{{ user.className }}</span>
            </Option>
          </Select>
      </span>
    </span>
    <!-- 必填验证 -->
    <span v-show="isRequired || isWrong" :style="{'width': '100%', 'display': 'inline-block', 'padding-left': labelWidth}">
      <span v-show="isRequired" class="wrongTips">该项不能为空</span>
      <span v-show="isWrong" class="wrongTips">{{ errorMessage }}</span>
    </span>
  </section>
</template>

<script>
import { getObjName, getAllEntities, getAllRelations } from "@/api/others.js";
import "@/styles/component/iconfont.css";
const name = "EntitiesAttrSelect";

export default {
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
      name: name,
      // 展示模式
      t_create: false,
      t_edit: false,
      t_visit: true,
      isWrong: false,
      isRequired: false,
      errorMessage: '',

      // 属性配置项,按需设置
      args: {
        height: 30, // 整体高度
        width: 100, // 整体宽度,单位为%或者px
        widthType: "%", // 整体宽度的单位
        heightType: "px", // 整体高度的单位
        hided: false,
        enSelect: 'enAttr',
        classCover: 'entities',
        readonly: false, // 是否只读
      },

      // 支持的数据类型, 基础数据类型为 String, TimeStamp, Boolean, Interger, Double, Long, UUID, Date, Clob
      dataTypes: ["String"],

      // 需要设置目标属性时使用
      attrMap: {},

      open: ["1", "2"],

      // 需要动态设置高度时使用
      timer: null,
      times: 0,

      // 一般插件的实际值用this.value存储
      value: null,
      displayname :'',
      displayType:'',

      allEntitiesAttr: [],
      allRelationsAttr: [],
      allClassAttr: [],
      vChange:'',
      selectedGroups:[],
      displayValue:'',
      border: null,

      firstVisi: true,

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

    if(this.args.classCover == 'entities') {

      this.getEntities();

    } else if(this.args.classCover == 'relations') {

      this.getRelations();

    } else {

      this.getEntities();
      this.getRelations();

    }
    // 需要动态设置高度时使用,不用可删去
    this.setHeight();
    this.setInheritStyle();

      // 字体/颜色/ 默认继承
    if(this.$refs.main.querySelector(".ivu-select-item")){
      this.$refs.main.querySelector(".ivu-select-item").style.fontSize = 'inherit';
      this.$refs.main.querySelector(".ivu-select-item").style.color = 'inherit';
    }
    if(this.$refs.main.querySelector(".ivu-cascader-menu-item")){
      this.$refs.main.querySelector(".ivu-cascader-menu-item").style.fontSize = 'inherit';
      this.$refs.main.querySelector(".ivu-cascader-menu-item").style.color = 'inherit';
    }

    if(this.$refs.main.querySelector(".ivu-input")){
        this.$refs.main.querySelector(".ivu-input").style.textAlign = this.mainXAlign;
    }

    // 默认非空时 自动校验
    if (this.value != null) { this.validate();}

    if(this.args.events && this.args.events.length > 0) {
      this.vChange = this.args.events.find((val) => {
        return val.name == '值变化'
      })
    }

  },
  watch: {
    'args.height'(val) {
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
     // 文本内容字体大小
    args_fsize(){
      return this.args.fsize + this.args.fsizeType + '!important';
    },
    args_fcolor() {
      return this.args.txt_fontColor == 'initial' ? 'initial' : this.args.txt_fontColor + ' !important';
    },
    args_lfcolor() {
      return this.args.label_fontColor == 'initial' ? 'initial' : this.args.label_fontColor + ' !important';
    },
    // 标签文本字体大小
    args_lfsize(){
      return this.args.lfsize + this.args.lfsizeType + '!important';
    },
    // 需要设置目标属性时使用,不用可删去
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

  },
  // 销毁函数,清除生成的内存占用
  beforeDestroy() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  },
  methods: {
    // onDynamic(value){
    //   this.setValue(value);
    // },
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
        this.$refs.main.querySelectorAll('.i-input .ivu-select-placeholder') && this.$refs.main.querySelectorAll('.i-input .ivu-select-placeholder').length != 0
        ? this.$refs.main.querySelectorAll('.i-input .ivu-select-placeholder').forEach(item => {
          item.style.fontSize = 'inherit';
          item.style.lineHeight = this.arg_height;
          item.style.height = this.arg_height;
        })
        : '';
        this.$refs.main.querySelectorAll('.i-input .ivu-cascader-rel .ivu-cascader-label') && this.$refs.main.querySelectorAll('.i-input .ivu-cascader-label').length != 0
        ? this.$refs.main.querySelectorAll('.i-input .ivu-cascader-rel .ivu-cascader-label').forEach(item => {
          item.style.fontSize = 'inherit';
          item.style.height = this.arg_height;
          item.style.lineHeight = this.arg_height;
        })
        : '';
        this.$refs.main.querySelectorAll('.i-input .ivu-cascader-rel input') && this.$refs.main.querySelectorAll('.i-input .ivu-cascader-label').length != 0
        ? this.$refs.main.querySelectorAll('.i-input .ivu-cascader-rel input').forEach(item => {
          item.style.fontSize = 'inherit';
          item.style.height = this.arg_height;
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
        if(this.args.enSelect == 'enAttr' && this.args.txt_bgColor!="#fff"){
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
    // 设置异常状态显示
    setError(error, mes) {

      this.isWrong = error;
      this.border = error ? '1px solid red' : null;
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
      if (this.args.required) {
        if(this.args.enSelect == 'enAttr' && this.selectedGroups.length == 0) {
          this.isRequired = true;
          expResult = false;
        } else if(this.args.enSelect == 'entities' && (this.value == null || this.value == '')){
          this.isRequired = true;
          expResult = false;
        } else {
          console.log(this.value)
        }
      }

      this.setError(expResult ? null : true);

      return expResult;
    },

    // 获取插件对应的值,一般为this.value,特殊情况下需要进行格式转化,如日期字符串
    getValue() {

      let temValue = '';
      if(this.args.enSelect == 'enAttr') {
        temValue = this.selectedGroups.length > 0 ? this.selectedGroups.join('/') : '';
      } else {
        temValue = this.value;
      }
      return temValue;

    },

    /*
            设置插件对应的值,
            items目前为对应值
            items将为目标对象列表
            特殊情况下需要进行格式转化再赋值
        */
    setValue(items) {
      console.log("setvalue",items, this.selectedGroups);
      var value = null;
      if (items == null) {

        // 初始化操作
        if("defaultValue" in this.args) {
          value = this.args.defaultValue;
        } else {
          if(this.displayType != 'create') {
            if(this.args.enSelect == 'enAttr') {
              value = this.selectedGroups.length > 0 ? this.selectedGroups : [];
            } else {
              value = this.selectedGroups.length > 0 ? this.selectedGroups[0] : '';
            }
          }
        }

      } else if (typeof items == "object") {
        if (items && items.length > 0) {
          if(this.args.enSelect == 'enAttr') {
            value = [];
            value.push(items[0][this.args.name]);
          } else {
            value = items[0][this.args.name];
          }
        }
      } else value = items;

      if(value){
        if(typeof value == "object") {
          this.selectedGroups = value;
          this.value = value[0];
        } else {
           if(this.args.enSelect == 'enAttr') {
              this.selectedGroups = items.split("/");
          } else {
            this.value = items.split("/")[0];
          }
        }

      }else{
        if (!this.$refs.main) {return;}
          // var dom = this.$refs.main.querySelector(".ivu-cascader-label");
          // if (dom) {
          //   this.$refs.main.querySelector(".ivu-input").placeholder="请选择";
          //   dom.innerHTML = "";
            this.selectedGroups = [];
            this.value = ''
          // }
      }
      console.log('1',this.selectedGroups, '2', this.value);
      return this;
    },

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
          var domS = that.$refs.main.querySelector(".ivu-select-selection");
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
          if (domS) {
            domS.style.height = that.arg_height;
            clearInterval(that.timer);
            that.timer = null;
          }
        }, 30);
      }
    },

    /*
            type取值范围为 create, visit, edit
            需要根据三个状态修改具体前端和逻辑
            一般情况下:
                create创建态: 无数据,可编辑
                visit浏览态: 有数据,不可编辑
                edit编辑态: 有数据,可编辑
         */
    setDisplayType(type) {
      this.displayType = type;
      this.t_create = false;
      this.t_edit = false;
      this.t_visit = false;
      if (type == "create") {
        this.t_create = true;
      }
      else if (type == "edit") {
        this.t_edit = true;
      }
      else if (type == "visit" ||type == "list") {
        this.t_visit = true;
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
      if(this.args.txt_bgColor == '#fff' && sessionStorage.getItem('skinStyle') == 'dark' && sessionStorage.getItem('appMenu')) this.args.txt_bgColor = 'transparent';
      return this;
    },

    getArgs() {
      return this.args;
    },

    getAllow() {
      return null;
    },

    getEditBox() {
      this.t_edit = true;
      return this.$refs.edit;
    },

    // 获取实体类
    getEntities() {

      getAllEntities().then(response => {

        let res = response.data;
        if (!res.success) {
          this.$Message.warning(res.message);
        } else {
          if (res.data.length == 0) {
            this.allEntitiesAttr = [];
          } else {

            this.allEntitiesAttr = res.data.map(val => {

              val.value = val.className;
              val.label = `${val.className} ${val.displayName}`;
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

    // 获取关联类
    getRelations() {

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

    loadClass(item, callback) {

      getObjName(item.className).then(response => {

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

    handleChange(value,selectedData){
      this.isRequired = false;
      if(this.errorMessage == '') {
        this.setError(false);
      }

      this.value = value.join('/');
      if(this.vChange) {
          let obj = this.getObj(this.itemValue.data);
          this.invokeOperation(this.vChange.opr_type, this.vChange.opr_path, this.itemValue, this.store,null,obj);
      }

      if (this.args.required && value.length === 0) {
        this.isRequired = true;
        this.setError(true);
      }
    },

    handleEntityChange(value) {

      this.isRequired = false;
      if(this.errorMessage == '') {
        this.setError(false);
      }

      if(this.vChange) {
        let obj = this.getObj(this.itemValue.data);
        this.invokeOperation(this.vChange.opr_type, this.vChange.opr_path, this.itemValue, this.store,null,obj);
      }
      if (this.args.required && value == undefined) {
        this.isRequired = true;
        this.setError(true);
      }
    },

    handleClear(){
      if (this.args.required) {
        this.isRequired = true;
      }
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
