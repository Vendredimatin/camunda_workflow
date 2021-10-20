<template>
  <section v-show="!args.hided" :addinName="name" ref="main" :style="{'width': colWidth, 'display': 'inline-block'}">
    <template v-if="args.structural_layout === 'horizontal'">
      <span :id="args.labelWrap" v-if="args.required || args.label" :style="{'width': labelWidth, 'display': 'inline-block',
      'text-align': labelXAlign, 'vertical-align': labelYAlign, 'padding-right': '10px', 'float':(args.useDictionary?args.labelFloat:'none')}">
          <span v-show="!args.hided"
                :style="{'background-color': args.label_color, 'width': '100%', 'display': 'inline-block'}">
              <span v-if="args.required" style="color: red">*</span>
              <label class="ori-color self-color"
                     :style="{'color': args_label_fontColor, 'font-size': args_lfsize}">{{ args.label }}</label>
          </span>
      </span>
      <span :style="{'min-height': arg_height, 'width': mainWidth, 'display': 'inline-block',
        'text-align': mainXAlign, 'color': args.main_fontColor}">
        <span v-show="!args.hided"
              :style="{'background-color': args.main_color, 'width': '100%', 'display': 'inline-block', 'vertical-align': mainYAlign}">
          <CheckboxGroup
            :id="args.checkWrap"
            v-model="value"
            @on-change="handleValueChanged"
            :style="{'margin-right': '0px', 'min-height': arg_height, 'width': '100%', 'align-items': 'center', 'display': 'flex', 'justify-content': checkboxMainXAlign, 'flex-wrap': 'wrap'}">
            <Checkbox
              v-for="(item,index) in args.list"
              :key="index"
              :label="item.value"
              :disabled="args.readonly || t_visit">
                <span class="ori-color self-color checkItem"
                      :style="{'max-width': mainWidth, 'color': args_txt_fontColor, 'font-size': args_fsize}">{{
                    item.label
                  }}</span>
              </Checkbox>
          </CheckboxGroup>
        </span>
    </span>
    </template>
    <template v-else>
      <span :id="args.labelWrap" v-if="args.required || args.label" :style="{'width': '100%', 'display': 'inline-block',
      'text-align': labelXAlign, 'vertical-align': labelYAlign, 'padding-right': '10px', 'float':(args.useDictionary?args.labelFloat:'none')}">
          <span v-show="!args.hided"
                :style="{'background-color': args.label_color, 'width': '100%', 'display': 'inline-block'}">
              <span v-if="args.required" style="color: red">*</span>
              <label class="ori-color self-color"
                     :style="{'color': args_label_fontColor, 'font-size': args_lfsize}">{{ args.label }}</label>
          </span>
      </span>
      <span :style="{'min-height': arg_height, 'width': '100%', 'display': 'inline-block',
        'text-align': mainXAlign, 'color': args.main_fontColor}">
        <span v-show="!args.hided"
              :style="{'background-color': args.main_color, 'width': '100%', 'display': 'inline-block', 'vertical-align': mainYAlign}">
          <CheckboxGroup
            :id="args.checkWrap"
            v-model="value"
            @on-change="handleValueChanged"
            :style="{'margin-right': '0px', 'min-height': arg_height, 'width': '100%', 'align-items': 'center', 'display': 'flex', 'justify-content': checkboxMainXAlign, 'flex-wrap': 'wrap'}">
            <Checkbox
              v-for="(item,index) in args.list"
              :key="index"
              :label="item.value"
              :disabled="args.readonly || t_visit">
                <span class="ori-color self-color checkItem"
                      :style="{'max-width': mainWidth, 'color': args_txt_fontColor, 'font-size': args_fsize}">{{
                    item.label
                  }}</span>
              </Checkbox>
          </CheckboxGroup>
        </span>
    </span>
    </template>
    <span v-show="(isRequired || isWrong) && !args.hided"
          :style="{'width': '100%', 'display': 'inline-block', 'padding-left': labelWidth}">
      <span v-show="isRequired" class="wrongTips">该项不能为空</span>
      <span v-show="isWrong" class="wrongTips">{{ errorMessage }}</span>
    </span>
  </section>
</template>

<script>
import {mapGetters, mapActions} from "vuex";
import {getQueryOperation} from "@/api/others";
import "@/styles/component/iconfont.css";

const name = "CheckBox";
export default {
  beforeDestroy() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
    ;
  },
  // 插件名
  name: name,
  // 插件的数据逻辑，插件的属性在data中定义，用在js中用this.xxx进行访问
  props: [
    'argsProps',
    'query',
    'store',
    'itemValue',
    'formEngine',
    'dwf_ctx',
    'attributes',
  ],
  data() {
    return {
      timer: null,
      times: 0,
      // 插件名
      name: name,

      // 展示模式
      t_create: false,
      t_edit: false,
      t_visit: false,
      readonly: false,
      isRequired: false,
      isWrong: false,

      dataTypes: ["String"],

      value: [],
      temValue: [],

      queryData: {
        query: {query: "",}, // 查询条件
        targetClass: "",    // 目标类名
        formName: "",   //
        fresh: true,
        uuid: ""
      },

      // 编辑框
      args: {
        dynamic: false,
        labelWrap: '',
        checkWrap: '',
        bindTargetClass: '',
        useDictionary: false,
        noNumber: true,
        labelFloat: 'none',
        labelAttr: [],
        valueAttr: [],
        id: "",
        title: "复选框",
        label: "",
        name: "",
        targetDataType: 'Boolean',
        list: [],
        required: false,
        readonly: false,
        disabled: false,
        hided: false,
        label_width: 2,
        main_width: 3,
        label_align: 4,
        main_align: 4,
        height: 30,                  // 整体高度=
        heightType: "px",
        width: 100,
        widthType: '%',
        col: true,
        cols: 3,
        label_fontColor: 'initial',
        txt_fontColor: 'initial',
        lfsize: 14,
        lfsizeType: 'px',
        fsize: 14,
        fsizeType: 'px',
      },

      // VALUECHANGE
      vChange: null,
      isValidate: null,

      selfValiContent: '',

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

      border: null,
      errorMessage: '',
    };
  },
  inject: [
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
  // 生命周期函数，在dom元素生成之后调用
  mounted() {

    if (this.args.useDictionary) {
      setTimeout(() => {

        this.setHeight();

        this.combineObjData();

      }, 10)
    }

    if (this.args.events && this.args.events.length > 0) {

      this.vChange = this.args.events.find((val) => {
        return val.name == '值变化'
      })

      // 值校验事件
      this.isValidate = this.args.events.find((val) => {
        return val.name == '值校验'
      })
      if (this.isValidate != null && this.isValidate.opr_path != undefined && this.isValidate.opr_path != '') {
        getQueryOperation(this.isValidate.opr_path).then(response => {
          let res = response.data;
          if(res.data.oprScript){
            this.selfValiContent = JSON.parse(res.data.oprScript).implement.client.default.script
          }else{
            this.selfValiContent = res.data.conditionExpre ? res.data.conditionExpre.slice(13) : '';
          }
        }).catch(e => {
          console.log(e);
        });
      }

    }

  },
  computed: {
    ...mapGetters("DWF_form", ["QueryResultAll"]),
    args_lfsize() {
      return this.args.lfsize + this.args.lfsizeType + ' !important';
    },
    args_fsize() {
      return this.args.fsize + this.args.fsizeType + ' !important';
    },
    // single() {
    //     return this.args.targetDataType && this.args.targetDataType == 'String' ? false : true;
    // },
    // 需要用到属性插件时使用
    arg_height() {
      return this.args.height < 2 && this.args.heightType == 'px' ? this.args.height * 30 + "px" : this.args.height + this.args.heightType;
    },
    args_label_fontColor() {
      return sessionStorage.getItem('skinStyle') == 'dark' && sessionStorage.getItem('appMenu') && this.args.label_fontColor == 'initial' ? this.args.label_fontColor : this.args.label_fontColor + '!important'
    },
    args_txt_fontColor() {
      return sessionStorage.getItem('skinStyle') == 'dark' && sessionStorage.getItem('appMenu') && this.args.txt_fontColor == 'initial' ? this.args.txt_fontColor : this.args.txt_fontColor + '!important';
    },
    colWidth() {
      return this.args.width + this.args.widthType;
      // return this.args.col ? parseInt(100 / this.args.cols) + "%" : "100%";
    },
    labelWidth() {
      if (this.args.labelWidthUnit && this.args.labelWidthUnit === 'px') {
        return (!this.args.label || this.args.label == "") && this.args.required ? "10%" : this.args.label_widthByPx + 'px';
      } else {
        return (!this.args.label || this.args.label == "") && this.args.required ? "10%" : parseInt(100 * this.args.label_width / (this.args.label_width + this.args.main_width)) + "%";
      }
    },
    mainWidth() {
      if (this.args.labelWidthUnit && this.args.labelWidthUnit === 'px') {
        return !this.args.label || this.args.label == "" ? (this.args.required ? "90%" : "100%") : `calc(100% - ${this.args.label_widthByPx}px)`;
      } else {
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
    //多选框位置控制，之前有问题
    checkboxMainXAlign() {
      let x = parseInt(this.args.main_align / 3);
      if (x == 0) return "flex-start";
      else if (x == 1) return "center";
      else return "flex-end";
    },
    isEmpty() {
      return this.value == null || this.value == [] || this.value == '';
    },
  },

  // 定义组件的函数接口
  methods: {
    ...mapActions("DWF_form", ["handleQueryData"]),
    async combineObjData(query = null) {

      this.args.list = [];

      let classType = this.args.bindTargetClass.split('&')[1];
      let classPre = this.args.bindTargetClass.split('&')[0];

      if (classType == 'r') {
        this.queryData.relationClass = classPre;
        this.queryData.query.type = "relation";
      } else {
        this.queryData.targetClass = classPre;
        delete this.queryData.relationClass;
        delete this.queryData.leftClass;
        delete this.queryData.rightClass;
        delete this.queryData.query.type;
      }

      let finalParseStr = '';
      if (this.args.filterQuery != '') {
        finalParseStr = this.parseEscapeString(this.args.filterQuery, null, null, this.itemValue.data.origin, this.attributes, this.store);
      }
      if (query) {
        finalParseStr = this.parseEscapeString(query, null, null, this.itemValue.data.origin, this.attributes, this.store);
      }
      this.queryData.query.query = finalParseStr;

      await this.handleQueryData(this.queryData);

      let objectList = this.QueryResultAll(this.queryData) || [];
      let returnFormat = Object.prototype.toString.call(this.args.valueAttr) === "[object Array]" ? this.args.valueAttr : [this.args.valueAttr];

      let list = objectList.map(object => {
        return {
          // label:下拉框回填显示项
          label: this.args.labelAttr.length !== 0 ?
            (this.args.labelAttr.map(attr => {
              return object[attr];
            }).join("-"))
            : object.oid,
          // value:点选器返回值
          value: returnFormat.length !== 0 ?
            (returnFormat.map(attr => {
              return object[attr];
            }).join("-"))
            : object.oid
        }
      }) || [];

      if (list) {
        this.args.list = list.length > 100 ? list.splice(0, 100) : list;
        let effectValue = this.temValue.filter(d => {
          return this.args.list.findIndex(l => {
            return l.value == d
          }) > -1
        })
        this.value = effectValue;
        console.log(this.args.list, this.value, this.temValue)
      }

    },

    /**
     *@description刷新数据字典下拉框
     *@params
     *@date 2021/1/25
     *@return
     */
    freshOptions(query) {
      this.combineObjData(query);
    },

    onDynamic(value) {
      this.dynamic = true;
      this.setValue(value);
    },
    setHeight() {

      let wrap = document.getElementById(this.args.checkWrap);
      let lwrap = document.getElementById(this.args.labelWrap);

      let actHeight;
      if (document.defaultView.getComputedStyle) { // 考虑IE还是得考虑鸭
        actHeight = document.defaultView.getComputedStyle(wrap, null);
      } else {
        actHeight = wrap.currentStyle;
      }
      if (lwrap) {

        if (this.args.bindTargetClass && this.args.bindTargetClass != '' && this.args.bindTargetClass != undefined) {
          lwrap.style.height = actHeight.height;
          lwrap.style.lineHeight = actHeight.height;
          this.args.labelFloat = 'left';
        }

      }

    },

    hook() {
    },

    getValue() {
      let temValue = null;
      if (this.value.length > 0) {

        if (this.value.length == 1) {

          temValue = this.value[0];

        } else {

          let _str = '';
          this.value.forEach(val => {
            _str = _str + val + ','
          })

          if (_str.length > 0) {
            _str = _str.substring(0, _str.length - 1);
          }

          temValue = _str;

        }

      }
      return temValue;

    },
    setValue(value) {
      let targetValue = [];
      if (value == null) {
        targetValue = [];
      } else if (value.length > 0) {

        let checkDefault = value.toString().split(',');
        // let effectValue = checkDefault.filter(d => {
        //   return this.args.list.findIndex(l => { return l.value == d}) > -1
        // })
        targetValue = checkDefault;
      } else {
        targetValue = [];
      }

      if (this.args.useDictionary) {
        this.temValue = targetValue;
        if (this.dynamic) {
          this.dynamic = false;
          let effectValue = this.temValue.filter(d => {
            return this.args.list.findIndex(l => {
              return l.value == d
            }) > -1
          })
          this.value = effectValue;
        }
        //fix bug 7273
        // if (this.t_create) {
          this.value = targetValue;
        // }
      } else {
        this.value = targetValue;
      }

      return this;
    },

    /**
     *@description脚本设置选项
     *@params list：option的值，function设置之后的回调
     *@date 2020/12/23
     *@return
     */
    setOption(list, callback) {
      try {
        this.args.list = list.map(x => {
          return {
            value: x.value + '',
            label: x.label,
          }
        });
        this.callback = callback ? callback : '';
        this.$nextTick(() => {
          this.callback ? (this.callback(), this.callback = '') : '';
        })
      } catch (e) {
        console.error(e)
      }
    },

    getOption() {
      return this.args.list;
    },

    // 是否允许往里添加元素,null为不允许，[]为允许全部，非空为允许部分
    getAllow() {
      return null;
    },

    // 获取编辑框内容
    getArgs() {
      return this.args;
    },

    // 设置基本属性
    setArgs(args) {
      for (var i in args) {
        this.args[i] = args[i];
      }

      if ("name" in args) {
        if (this.args.name == '' || this.args.name == null) {
          let defaultArr = [];
          if (this.args.defaultValue.length > 0) {
            defaultArr = typeof this.args.defaultValue === 'string' ? this.args.defaultValue.split(',') : this.args.defaultValue;
          }
          this.value = this.temValue = "defaultValue" in args ? defaultArr : [];
        }
      }

      return this;
    },

    // 获取表单项名
    getFormName() {
      return this.args.name;
    },

    // 获取插件的属性编辑框的dom元素
    getEditBox(args) {
      this.t_edit = true;
      return this.$refs.edit;
    },

    // 获取插件名
    getName() {
      return name;
    },

    // 设置异常状态显示
    setError(error, message = '') {
      this.isWrong = error;
      this.border = error ? '1px solid red' : null;
      this.errorMessage = error ? message : '';
      return this;
    },

    /**
     * @isRequired : modeler端配置的必填项
     * @isWrong : 自定义正则错误
     */
    // 设置校验逻辑,返回true/false
    validate() {
      let expResult = true;
      let selfValidateMes = '';

      if (this.args.required && this.isEmpty) {

        this.isWrong = false;
        this.isRequired = true;
        expResult = false;

      } else if (this.isValidate) {

        if (this.selfValiContent != '') {
          try {
            let isPass = new Function(this.selfValiContent).call(this);
            console.log(isPass)

            if (isPass === true) {
              expResult = true;
            } else {
              expResult = false;
              selfValidateMes = isPass || '该项填写有误';
            }

          } catch (e) {

            console.log(e);

          }
        } else {
          expResult = true;
        }

      } else {
        console.log(this.value)
      }

      if (this.args.required && !this.isEmpty) {
        this.isRequired = false;
      }
      if (this.isValidate) {
        this.setError(expResult ? null : true, selfValidateMes);
      } else {
        this.setError(expResult ? null : true);
      }
      this.isWrong = !expResult;

      return expResult;
    },

    // 设置插件的显示类型，type=0为预览模式，type=1为运行模式，type=2为图标模式
    setDisplayType(type) {
      this.t_create = false;
      this.t_edit = false;
      this.t_visit = false;
      if (type == "create") {
        this.t_create = true;
        this.readonly = false;
      } else if (type == "edit") {
        this.t_edit = true;
        this.readonly = false;
      } else if (type == "visit") {
        this.t_visit = true;
        this.readonly = true;
      }
      return this;
    },

    // 设置插件支持的数据类型，返回类型为数据类型的列表
    getDataType(args) {
      return this.dataTypes;
    },

    handleValueChanged(arr) {
      // this.isRequired = false;

      // if(!this.errorMessage){
      //   this.setError(false);
      // }
      this.$nextTick(() => {
        if (this.args.required) {
          this.validate();
        }
      })
      if (this.vChange) {
        this.invokeOperation(this.vChange.opr_type, this.vChange.opr_path, this.itemValue, this.store);
      }
    },

    async triggerEvent(type) {
      switch (type) {
        case 'valueChanged':
          if (this.vChange) {
            this.invokeOperation(this.vChange.opr_type, this.vChange.opr_path, this.itemValue, this.store);
          }
          break;
        default:
          if (this.vChange) {
            this.invokeOperation(this.vChange.opr_type, this.vChange.opr_path, this.itemValue, this.store);
          }
          break;
      }
    },

    getDisplayValue() {
      let value = this.value;
      let finalKey = [];

      if (value && value != [] && value != undefined) {

        value.forEach(v => {

          let targetRes = this.args.list.filter(i => {
            return i.value == v
          })
          if (targetRes) {
            finalKey.push(targetRes[0].label)
          }

        })

      }

      return finalKey;
    },

  }
};
</script>

<style scoped>
/*
    插件的css部分
    设置display为inline，默认不换行
    scoped表示样式仅在该vue文件内有效
*/
section {
  width: auto;
  height: auto;
  display: inline-block;
  /* display: inline; 去掉后可以自动换行 */
}

.wrongTips {
  display: inline-block;
  width: 100%;
  color: red;
  text-align: left;
  margin-top: 5px;
}

.ori-color {
  color: initial;
}

.checkItem {
  word-break: break-all;
}
</style>
