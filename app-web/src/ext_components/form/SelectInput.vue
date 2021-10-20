<template>
  <section :addinName="name" id="inputDiv" :style="{'width': colWidth}" ref="main">
    <template v-if="args.structural_layout === 'horizontal'">
      <!-- 对于非布局空间,基本都有label标签,有labelWidth, mainWidth属性,表示标签-主区域比例;有labelXAlign,labelYAlign,mainXAlign,mainYAlign属性,表示对齐方式 -->
      <span v-if="args.required || args.label" :style="{'width': labelWidth, 'display': 'inline-block',
        'text-align': labelXAlign, 'vertical-align': labelYAlign, 'padding-right': '10px'}">
            <span v-show="!args.hided"
                  :style="{'background-color': args.label_color, 'width': '100%', 'display': 'inline-block'}">
                <span v-if="args.required" style="color: red">*</span>
                <label class="self-color"
                       :style="{'color': args_label_fontColor, 'font-size': args_lfsize}">{{ args.label }}</label>
            </span>
        </span>
      <span :style="{'height': arg_height, 'width': mainWidth, 'display': 'inline-block',
            'text-align': mainXAlign, 'color': args.main_fontColor}">
            <span v-show="!args.hided"
                  :style="{'background-color': args.txt_bgColor, 'width': '100%', 'display': 'inline-block', 'vertical-align': mainYAlign}">
                <Select v-if="!needPop && !args.useDictionary"
                        class="i-input self-color"
                        v-model="value"
                        :transfer="true"
                        :title="selectedTitle"
                        :transfer-class-name="darkMode ? 'dark' : ''"
                        :multiple="args.selectMuti"
                        :filterable="args.selectFilt"
                        :disabled="args.readonly || t_visit"
                        @mouseenter.native="hoverEvent"
                        @on-clear="handleClear"
                        :style="{ 'width': '100%', 'display': 'inline-block', 'text-align': mainXAlign, 'vertical-align': mainYAlign, 'border': border, 'color': args_txt_fontColor, 'font-size': args_fsize}"
                        @on-change="handleValueChanged" clearable>
                    <Option v-for="(item,index) in args.selectList" :value="item.value" :key="index" class="self-color">{{
                        item.label
                      }}</Option>
                </Select>
                <Select v-if="!needPop && args.useDictionary"
                        class="i-input self-color"
                        v-model="value"
                        :transfer="true"
                        :title="selectedTitle"
                        :transfer-class-name="darkMode ? 'dark' : ''"
                        :multiple="args.selectMuti"
                        :filterable="args.selectFilt"
                        :remote-method="remoteMethod"
                        @keyup.native="remoteMethodKeydown"
                        :disabled="args.readonly || t_visit"
                        @mouseenter.native="hoverEvent"
                        @on-clear="handleClear"
                        :style="{ 'width': '100%', 'display': 'inline-block', 'text-align': mainXAlign, 'vertical-align': mainYAlign, 'border': border, 'color': args_txt_fontColor, 'font-size': args_fsize}"
                        @on-change="handleValueChanged" clearable>
                    <Option v-for="(item,index) in args.selectList" :value="item.value" :key="index" class="self-color">{{
                        item.label
                      }}</Option>
                </Select>

                <Poptip v-if="needPop && !args.useDictionary" trigger="hover" transfer :placement="popHoverDirection"
                        :width="popHoverObj.popWidth">
                    <Select
                      class="i-input self-color"
                      v-model="value"
                      :transfer="true"
                      :transfer-class-name="darkMode ? 'dark' : ''"
                      :title="selectedTitle"
                      :multiple="args.selectMuti"
                      :filterable="args.selectFilt"
                      :disabled="args.readonly || t_visit"
                      @mouseenter.native="hoverEvent"
                      @on-clear="handleClear"
                      :style="{ 'width': relWidth, 'display': 'inline-block', 'text-align': mainXAlign, 'vertical-align': mainYAlign, 'border': border, 'color': args_txt_fontColor, 'font-size': args_fsize}"
                      @on-change="handleValueChanged" clearable>
                        <Option v-for="(item,index) in args.selectList" :value="item.value" :key="index"
                                class="self-color">{{ item.label }}</Option>
                    </Select>
                    <div v-show="popHoverObj.needPopTitle" slot="title"><span
                      :style="{'color': popHoverObj.popTitleColor, 'font-size': `${popHoverObj.popTitleFs}px`}">{{
                        popHoverObj.popTitleTxt
                      }}</span></div>
                    <div slot="content">
                        <FormEngine
                          v-if="!this.isHoverMesPop && popHoverPath"
                          ref="form"
                          :to_path="popHoverPath"
                          :to_query="popHoverQuery"
                          :store="store">
                        </FormEngine>
                        <p v-else>{{ this.popHoverMes }}</p>
                    </div>
                </Poptip>
                <Poptip v-if="needPop && args.useDictionary" trigger="hover" transfer :placement="popHoverDirection"
                        :width="popHoverObj.popWidth">
                    <Select
                      class="i-input self-color"
                      v-model="value"
                      :transfer="true"
                      :transfer-class-name="darkMode ? 'dark' : ''"
                      :title="selectedTitle"
                      :multiple="args.selectMuti"
                      :filterable="args.selectFilt"
                      :remote-method="remoteMethod"
                      @keyup.native="remoteMethodKeydown"
                      :disabled="args.readonly || t_visit"
                      @mouseenter.native="hoverEvent"
                      @on-clear="handleClear"
                      :style="{ 'width': relWidth, 'display': 'inline-block', 'text-align': mainXAlign, 'vertical-align': mainYAlign, 'border': border, 'color': args_txt_fontColor, 'font-size': args_fsize}"
                      @on-change="handleValueChanged" clearable>
                        <Option v-for="(item,index) in args.selectList" :value="item.value" :key="index"
                                class="self-color">{{ item.label }}</Option>
                    </Select>
                    <div v-show="popHoverObj.needPopTitle" slot="title"><span
                      :style="{'color': popHoverObj.popTitleColor, 'font-size': `${popHoverObj.popTitleFs}px`}">{{
                        popHoverObj.popTitleTxt
                      }}</span></div>
                    <div slot="content">
                        <FormEngine
                          v-if="!this.isHoverMesPop && popHoverPath"
                          ref="form"
                          :to_path="popHoverPath"
                          :to_query="popHoverQuery"
                          :store="store">
                        </FormEngine>
                        <p v-else>{{ this.popHoverMes }}</p>
                    </div>
                </Poptip>
            </span>
        </span>
    </template>
    <template v-else>
      <!-- 对于非布局空间,基本都有label标签,有labelWidth, mainWidth属性,表示标签-主区域比例;有labelXAlign,labelYAlign,mainXAlign,mainYAlign属性,表示对齐方式 -->
      <span v-if="args.required || args.label" :style="{'width': '100%', 'display': 'inline-block',
        'text-align': labelXAlign, 'vertical-align': labelYAlign, 'padding-right': '10px'}">
            <span v-show="!args.hided"
                  :style="{'background-color': args.label_color, 'width': '100%', 'display': 'inline-block'}">
                <span v-if="args.required" style="color: red">*</span>
                <label class="self-color"
                       :style="{'color': args_label_fontColor, 'font-size': args_lfsize}">{{ args.label }}</label>
            </span>
        </span>
      <span :style="{'height': arg_height, 'width': '100%', 'display': 'inline-block',
            'text-align': mainXAlign, 'color': args.main_fontColor}">
            <span v-show="!args.hided"
                  :style="{'background-color': args.txt_bgColor, 'width': '100%', 'display': 'inline-block', 'vertical-align': mainYAlign}">
                <Select v-if="!needPop && !args.useDictionary"
                        class="i-input self-color"
                        v-model="value"
                        :transfer="true"
                        :transfer-class-name="darkMode ? 'dark' : ''"
                        :title="selectedTitle"
                        :multiple="args.selectMuti"
                        :filterable="args.selectFilt"
                        :disabled="args.readonly || t_visit"
                        @mouseenter.native="hoverEvent"
                        @on-clear="handleClear"
                        :style="{ 'width': '100%', 'display': 'inline-block', 'text-align': mainXAlign, 'vertical-align': mainYAlign, 'border': border, 'color': args_txt_fontColor, 'font-size': args_fsize}"
                        @on-change="handleValueChanged" clearable>
                    <Option v-for="item in args.selectList" :value="item.value" :key="item.value"
                            class="self-color">{{ item.label }}</Option>
                </Select>
                <Select v-if="!needPop && args.useDictionary"
                        class="i-input self-color"
                        v-model="value"
                        :transfer="true"
                        :transfer-class-name="darkMode ? 'dark' : ''"
                        :title="selectedTitle"
                        :multiple="args.selectMuti"
                        :filterable="args.selectFilt"
                        :remote-method="remoteMethod"
                        @keyup.native="remoteMethodKeydown"
                        :disabled="args.readonly || t_visit"
                        @mouseenter.native="hoverEvent"
                        @on-clear="handleClear"
                        :style="{ 'width': '100%', 'display': 'inline-block', 'text-align': mainXAlign, 'vertical-align': mainYAlign, 'border': border, 'color': args_txt_fontColor, 'font-size': args_fsize}"
                        @on-change="handleValueChanged" clearable>
                    <Option v-for="item in args.selectList" :value="item.value" :key="item.value"
                            class="self-color">{{ item.label }}</Option>
                </Select>

                <Poptip v-if="needPop && !args.useDictionary" trigger="hover" transfer :placement="popHoverDirection"
                        :width="popHoverObj.popWidth">
                    <Select
                      class="i-input self-color"
                      v-model="value"
                      :transfer="true"
                      :transfer-class-name="darkMode ? 'dark' : ''"
                      :title="selectedTitle"
                      :multiple="args.selectMuti"
                      :filterable="args.selectFilt"
                      :disabled="args.readonly || t_visit"
                      @mouseenter.native="hoverEvent"
                      @on-clear="handleClear"
                      :style="{ 'width': relWidth, 'display': 'inline-block', 'text-align': mainXAlign, 'vertical-align': mainYAlign, 'border': border, 'color': args_txt_fontColor, 'font-size': args_fsize}"
                      @on-change="handleValueChanged" clearable>
                        <Option v-for="item in args.selectList" :value="item.value" :key="item.value"
                                class="self-color">{{ item.label }}</Option>
                    </Select>
                    <div v-show="popHoverObj.needPopTitle" slot="title"><span
                      :style="{'color': popHoverObj.popTitleColor, 'font-size': `${popHoverObj.popTitleFs}px`}">{{
                        popHoverObj.popTitleTxt
                      }}</span></div>
                    <div slot="content">
                        <FormEngine
                          v-if="!this.isHoverMesPop && popHoverPath"
                          ref="form"
                          :to_path="popHoverPath"
                          :to_query="popHoverQuery"
                          :store="store">
                        </FormEngine>
                        <p v-else>{{ this.popHoverMes }}</p>
                    </div>
                </Poptip>
                <Poptip v-if="needPop && args.useDictionary" trigger="hover" transfer :placement="popHoverDirection"
                        :width="popHoverObj.popWidth">
                    <Select
                      class="i-input self-color"
                      v-model="value"
                      :transfer="true"
                      :transfer-class-name="darkMode ? 'dark' : ''"
                      :title="selectedTitle"
                      :multiple="args.selectMuti"
                      :remote-method="remoteMethod"
                      @keyup.native="remoteMethodKeydown"
                      :filterable="args.selectFilt"
                      :disabled="args.readonly || t_visit"
                      @mouseenter.native="hoverEvent"
                      @on-clear="handleClear"
                      :style="{ 'width': relWidth, 'display': 'inline-block', 'text-align': mainXAlign, 'vertical-align': mainYAlign, 'border': border, 'color': args_txt_fontColor, 'font-size': args_fsize}"
                      @on-change="handleValueChanged" clearable>
                        <Option v-for="item in args.selectList" :value="item.value" :key="item.value"
                                class="self-color">{{ item.label }}</Option>
                    </Select>
                    <div v-show="popHoverObj.needPopTitle" slot="title"><span
                      :style="{'color': popHoverObj.popTitleColor, 'font-size': `${popHoverObj.popTitleFs}px`}">{{
                        popHoverObj.popTitleTxt
                      }}</span></div>
                    <div slot="content">
                        <FormEngine
                          v-if="!this.isHoverMesPop && popHoverPath"
                          ref="form"
                          :to_path="popHoverPath"
                          :to_query="popHoverQuery"
                          :store="store">
                        </FormEngine>
                        <p v-else>{{ this.popHoverMes }}</p>
                    </div>
                </Poptip>
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
/*
        插件的js部分
        如果有引用依赖等，在export default 之前进行引用
    */
import '@/styles/component/iconfont.css';
import {mapGetters, mapActions} from "vuex";
import {getQueryOperation, getDistinctValues, getDistinctValuesWithParams} from "@/api/others";
import FormEngine from '@/views/form-engine/forms-engine.vue'

const name = "SelectInput";
export default {
  beforeDestroy() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
    ;
  },
  name: name,
  props: [
    'argsProps',
    'query',
    'store',
    'itemValue',
    'formEngine',
    'dwf_ctx',
    'attributes',
  ],
  // 插件的数据逻辑，插件的属性在data中定义，用在js中用this.xxx进行访问
  data() {
    return {
      timer: null,
      times: 0,
      // 插件名
      name: name,

      args_name: "",

      t_create: false,
      t_edit: false,
      t_visit: true,
      isWrong: false,
      isRequired: false,
      needPop: false,
      isHoverMesPop: false,      // 脚本定义的浮窗文字
      popHoverMes: '',
      actions: {
        '上边': 'top',
        '上左': 'top-start',
        '上右': 'top-end',
        '右边': 'right',
        '右上': 'right-start',
        '右下': 'right-end',
        '下边': 'bottom',
        '下左': 'bottom-start',
        '下右': 'bottom-end',
        '左边': 'left',
        '左上': 'left-start',
        '左下': 'left-end',
      },
      popHoverObj: {
        needPopTitle: false,
        popTitleTxt: '提示',
        popTitleFs: 14,
        popTitleColor: '#333',
        tipPlacement: 'right',
        popWidth: 400
      },
      popHoverDirection: 'right',
      popHoverPath: '',
      popHoverQuery: {
        query: ''
      },
      isHover: null,
      pWidth: 0,

      error: null,

      dataTypes: ['String', 'UUID'],

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
        bindTargetClass: '',
        useDictionary: false,
        noNumber: true,
        labelAttr: [],
        valueAttr: [],
        defaultValue: '',
        label_fontColor: "initial", // 标签字体颜色
        txt_fontColor: "initial",   // 内容字体颜色
        txt_bgColor: '#fff',        // 输入框背景颜色
        lfsize: 14,                 // 标签文字大小
        lfsizeType: 'px',           // 标签文字大小单位
        fsize: 14,                  // 内容文字大小
        fsizeType: 'px',            // 内容文字大小单位
        width: 100,
        widthType: '%',
        title: '选择框',
        id: null,
        _id: "0",
        style: "",
        label_width: 2,
        main_width: 3,
        label_align: 4,
        main_align: 4,
        _type: "attribute",
        readonly: false,
        hided: false,
        // 属性插件所需属性
        label: "",
        name: "",
        targetDataType: null,
        height: 30,
        heightType: "px",
        col: true,
        cols: 3,
        selfOptions: '',
        value: '',
        selectList: [],
        selectDis: false,
        selectMuti: false,
        selectFilt: false,
        // 事件操作所需配置
        // oprs: {
        //     "ValueChanged":{
        //         "opr_path": "",
        //         "opr_type": "",
        //     },
        // },
      },

      // VALUECHANGE
      vChange: null,
      isValidate: null,

      selfValiContent: '',

      // 继承属性
      inherit: [],

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

      // 属性map
      attrMap: {},

      allow: {},

      switchDisabled: false,

      switchMuti: false,

      switchFilt: false,

      value: null,
      temValue: null,

      border: null,
      errorMessage: '',
      darkMode: false,
      init: true,
      editFlag: false,
      loadingData: true,
    }
  },
  components: {
    FormEngine
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
    this.darkMode = !!(sessionStorage.getItem('skinStyle') == 'dark' && sessionStorage.getItem('appMenu') && document.getElementById('app').querySelector('.appMenu'));

    this.$store = this.store;
  },
  // 生命周期函数，在dom元素生成之后调用
  mounted() {
    this.setHeight();
    if (this.args.useDictionary) {
      this.combineObjData();
    }
    this.$nextTick(() => {
      this.setInheritStyle();
    })
    if (this.args.events && this.args.events.length > 0) {

      // 鼠标悬停事件
      this.isHover = this.args.events.find((val) => {
        return val.name == '鼠标悬停'
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

      if (this.isHover != null && this.isHover.opr_path != undefined && this.isHover.opr_path != '') {
        getQueryOperation(this.isHover.opr_path).then(response => {

          let res = response.data;
          if (res.success && res.data) {

            let oName = res.data.conType;

            if (oName == 'tip') {

              if (res.data.action == 'implement') {

                if (res.data.conditionExpre) {

                  this.popHoverMes = res.data.conditionExpre.slice(20);
                  this.popHoverMes = this.popHoverMes.replace(/\'/g, '');
                  this.popHoverMes = this.popHoverMes.replace(/\"/g, '');
                  this.isHoverMesPop = true;
                }

              } else {
                this.isHoverMesPop = false;
              }

              this.popHoverObj = JSON.parse(res.data.viewType);
              this.popHoverDirection = this.actions[this.popHoverObj.tipPlacement];
              this.popHoverPath = `/forms/${res.data.targetClass}/${res.data.viewName}`;
              this.needPop = true;
              this.pWidth = document.getElementById("inputDiv").offsetWidth;

            } else {

              this.needPop = false;

            }
          } else {
            console.log(res.message);
          }
          this.$nextTick(() => {
            this.setInheritStyle();
          })
        }).catch(e => {
          console.log(e);
        });
      }

      this.vChange = this.args.events.find((val) => {
        return val.name == '值变化'
      })

      this.init = false;
    }
  },
  watch: {},
  computed: {
    ...mapGetters("DWF_form", ["QueryResultAll"]),
    args_fsize() {
      return this.args.fsize + this.args.fsizeType + '!important';
    },
    args_lfsize() {
      return this.args.lfsize + this.args.lfsizeType + '!important';
    },
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
        return this.args.label_widthByPx + 'px';
      } else {
        return (!this.args.label || this.args.label == "") && this.args.required ? "10%" : parseInt(100 * this.args.label_width / (this.args.label_width + this.args.main_width)) + "%";
      }
    },
    mainWidth() {
      if (this.args.labelWidthUnit && this.args.labelWidthUnit === 'px') {
        return !this.args.label || this.args.label == "" ? "100%" : `calc(100% - ${this.args.label_widthByPx}px)`;
      } else {
        return !this.args.label || this.args.label == "" ? (this.args.required ? "90%" : "100%") : parseInt(100 * this.args.main_width / (this.args.label_width + this.args.main_width)) + "%";
      }
    },
    relWidth() {
      return 'inherit';
      // let allWidth = this.args.label_width + this.args.main_width;
      // return !this.args.label || this.args.label == "" ? (this.args.required ? (this.pWidth * 0.9 - 6) + 'px' : (this.pWidth - 6) + 'px') : (this.pWidth * (this.args.main_width / allWidth) - 6) + 'px';
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
    isEmpty() {
      return this.value == null || this.value == '';
    },
    selectedTitle() {
      let temValue = '';
      if (Object.prototype.toString.call(this.value) === "[object Array]" && this.value && this.args.selectMuti && this.value.length > 0) {
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
      } else if (this.value && this.value != '') {
        temValue = this.value
      } else {
        temValue = '';
      }
      return temValue;
    }
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
        this.args.selectList = list.length > 100 ? list.splice(0, 100) : list;
        this.value = this.temValue;
      }

      this.loadingData = false;
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
      this.setValue(value)
    },
    setInheritStyle() {
      if (sessionStorage.getItem('skinStyle') == 'dark' && sessionStorage.getItem('appMenu') && this.args.txt_bgColor == '#fff') {
        this.args.txt_bgColor = 'initial';
      }
      try {
        this.$refs.main.querySelectorAll('.ivu-poptip') && this.$refs.main.querySelectorAll('.ivu-poptip').length != 0
          ? this.$refs.main.querySelectorAll('.ivu-poptip').forEach(item => {
            item.style.width = '100%';
          })
          : '';
        this.$refs.main.querySelectorAll('.ivu-poptip-rel') && this.$refs.main.querySelectorAll('.ivu-poptip-rel').length != 0
          ? this.$refs.main.querySelectorAll('.ivu-poptip-rel').forEach(item => {
            item.style.width = 'inherit';
          })
          : '';
        this.$refs.main.querySelectorAll('.i-input div') && this.$refs.main.querySelectorAll('.i-input div').length != 0
          ? this.$refs.main.querySelectorAll('.i-input div').forEach(item => {
            item.style.fontSize = 'inherit';
            item.style.color = 'inherit';
          })
          : '';
        this.$refs.main.querySelectorAll('.i-input .ivu-tag') && this.$refs.main.querySelectorAll('.i-input .ivu-tag').length != 0
          ? this.$refs.main.querySelectorAll('.i-input .ivu-tag').forEach(item => {
            item.style.fontSize = 'inherit';
            item.style.color = 'inherit';
            item.style.backgroundColor = 'inherit';
            item.style.height = this.args.height < 2 && this.args.heightType == 'px' ? "24px" : this.args.height - 6 + this.args.heightType;
          })
          : '';
        this.$refs.main.querySelectorAll('.i-input .ivu-tag-text') && this.$refs.main.querySelectorAll('.i-input .ivu-tag-text').length != 0
          ? this.$refs.main.querySelectorAll('.i-input .ivu-tag-text').forEach(item => {
            item.style.fontSize = 'inherit';
            item.style.color = 'inherit';
            item.style.height = this.args.height < 2 && this.args.heightType == 'px' ? "24px" : this.args.height - 6 + this.args.heightType;
            item.style.lineHeight = this.args.height < 2 && this.args.heightType == 'px' ? "24px" : this.args.height - 6 + this.args.heightType;
          })
          : '';
        this.$refs.main.querySelectorAll('.i-input .ivu-tag .ivu-icon-ios-close') && this.$refs.main.querySelectorAll('.i-input .ivu-tag .ivu-icon-ios-close').length != 0
          ? this.$refs.main.querySelectorAll('.i-input .ivu-tag .ivu-icon-ios-close').forEach(item => {
            item.style.fontSize = 'inherit';
            item.style.color = 'inherit';
            item.style.top = this.args.height < 2 && this.args.heightType == 'px' ? "4px" : (this.args.height - 30) / 2 + (30 - this.args.fsize) / 4 + this.args.heightType;
          })
          : '';
        this.$refs.main.querySelectorAll('.i-input .ivu-select-selected-value') && this.$refs.main.querySelectorAll('.i-input .ivu-select-selected-value').length != 0
          ? this.$refs.main.querySelectorAll('.i-input .ivu-select-selected-value').forEach(item => {
            item.style.fontSize = 'inherit';
            item.style.color = 'inherit';
            item.style.lineHeight = this.arg_height;
            item.style.height = this.arg_height;
          })
          : '';
        this.$refs.main.querySelectorAll('.i-input .ivu-select-input') && this.$refs.main.querySelectorAll('.i-input .ivu-select-input').length != 0
          ? this.$refs.main.querySelectorAll('.i-input .ivu-select-input').forEach(item => {
            item.style.fontSize = 'inherit';
            item.style.color = 'inherit';
            item.style.lineHeight = this.arg_height;
            item.style.height = this.arg_height;
            item.style.textAlign = this.mainXAlign;
          })
          : '';
        this.$refs.main.querySelectorAll('.i-input .ivu-select-placeholder') && this.$refs.main.querySelectorAll('.i-input .ivu-select-placeholder').length != 0
          ? this.$refs.main.querySelectorAll('.i-input .ivu-select-placeholder').forEach(item => {
            item.style.fontSize = 'inherit';
            item.style.lineHeight = this.arg_height;
            item.style.height = this.arg_height;
          })
          : '';
        this.$refs.main.querySelectorAll('.i-input .ivu-select-selection') && this.$refs.main.querySelectorAll('.i-input .ivu-select-selection').length != 0
          ? this.$refs.main.querySelectorAll('.i-input .ivu-select-selection').forEach(item => {
            item.style.backgroundColor = 'inherit';
            item.style.height = this.arg_height;
            this.args.selectMuti ? item.style.overflow = 'hidden' : '';
          })
          : '';
      } catch (e) {

      }
    },
    // 设置异常状态显示
    setError(error, message = '') {
      this.isWrong = error;
      this.border = error ? '1px solid red' : null;
      this.errorMessage = error ? message : '';
      return this;
    },

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

      if (this.isValidate) {
        this.setError(expResult ? null : true, selfValidateMes);
      } else {
        this.setError(expResult ? null : true);
      }

      this.isWrong = !expResult;

      return expResult;
    },
    // 动态获取Options
    async initDOptions(className, attrName) {
      if (className.indexOf('left_') != -1 || className.indexOf('right_') != -1) {
        className = className.split('_')[1];
      }
      let res = await getDistinctValues(className, attrName);
      if (res && res.data && res.data.data) {
        this.args.selectList = [];
        res.data.data.forEach(x => {
          if (typeof x == 'object') {

            for (var k in x) {
              this.args.selectList.push({
                label: x[k],
                value: k
              })
            }
          } else {
            this.args.selectList.push({
              label: x,
              value: x
            })
          }
        })
      }
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
          var dom = that.$refs.main.querySelector(".ivu-select-selection");
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

    // 获取控件属性值
    getValue() {
      let temValue = null;
      if (this.value !== null && this.args.selectMuti && this.value.length > 0) {

        if (this.value.length > 0) {

          if (this.value.length == 1) {

            temValue = this.value[0];

            const dType = this.args.targetDataType;
            if (dType == 'Integer' || dType == 'Long') {
              temValue = parseInt(temValue);
            } else if (dType == 'Double') {
              temValue = parseFloat(temValue);
            }

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

        } else {
          temValue = null;
        }

      } else if(Object.prototype.toString.call(this.value) === "[object Array]" && this.value.length == 0){
        temValue = null;
      } else if (this.value !== null && this.value !== '' && this.value !== undefined) {
        temValue = this.value;
        const dType = this.args.targetDataType;
        if (dType == 'Integer' || dType == 'Long') {
          temValue = parseInt(temValue);
        } else if (dType == 'Double') {
          temValue = parseFloat(temValue);
        } else {
          console.log(temValue)
        }
      } else {
        temValue = null;
        // const dType = this.args.targetDataType;
        // if (dType == 'Integer' || dType == 'Long' || dType == 'Double') {
        //   temValue = null
        // }
      }
      this.editFlag = true;
      return temValue;
    },

    setValue(value) {
      let targetValue = null;
      if (value == null) {
        targetValue = this.args.selectMuti ? [] : null;
      } else if (this.args.selectMuti && !Array.isArray(value) && value.length > 0) {
        targetValue = value.split(',');
      } else {
        targetValue = value;
      }
      if (this.args.useDictionary) {
        //远程搜索时等待数据加载完毕赋值
        let _this = this;
        this.loadingDataTimer = setInterval( () => {
          if(!_this.loadingData){
            _this.temValue = targetValue;
            if (_this.dynamic) {
              _this.dynamic = false;
              _this.value = _this.temValue;
            }
            //fix bug 6763 & 6748
            //create状态空值
            if (_this.t_create && (Array.isArray(targetValue) && targetValue.length == 0) || (!Array.isArray(targetValue) && !targetValue)) {
              _this.value = targetValue;
              //create之后清空值同时刷新列表
              if (!_this.init) {
                _this.remoteMethod('')
              }
              //create状态有值+ fix bug 7129
            }else if(_this.t_create && Array.isArray(targetValue) && targetValue.length !== 0 ){
              _this.value = targetValue;
            }else if(_this.t_create && !Array.isArray(targetValue) && targetValue){
              _this.value = targetValue + '';
            }

            //脚本控制setValue+ fix bug 7129
            if((_this.t_edit || _this.t_visit) && Array.isArray(targetValue) && targetValue.length !== 0 && !_this.init){
              _this.value = targetValue;
            }else if((_this.t_edit || _this.t_visit) && !Array.isArray(targetValue) && targetValue && !_this.init){
              _this.value = targetValue + '';
            }

            clearInterval(_this.loadingDataTimer);
            _this.loadingDataTimer = null;
          }
        }, 500)
      } else {
        this.value = targetValue;
      }
      this.$nextTick(() => {
        this.setInheritStyle();
      })
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
        this.args.selectList = list.map(x => {
          return {
            //fix bug 5142
            // value: x.value + '',
            value: x.value,
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
      return this.args.selectList;
    },

    // 是否允许往里添加元素,null为不允许，[]为允许全部，非空为允许部分
    getAllow(dropTarget) {
      return null;
    },

    // 获取可继承属性
    getInherit(dropTarget) {
      var res = {};
      let that = this;
      this.inherit.forEach(x => res[x] = that.args.children[dropTarget][x]);
      return res;
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
          this.value = this.temValue = "defaultValue" in args ? this.args.defaultValue : '';
        }
      }
      return this;
    },

    // 获取表单项名
    getFormName() {
      return this.args.name;
    },

    /**
     * @description 手动设置浮窗
     * @param mes 浮窗显示的文字
     * @param type 浮窗触发的方式 默认鼠标经过触发
     * @param direction 浮窗的指定方向 不传默认top
     * @param width 浮窗的指定宽度 默认150px
     */
    setToolTip(mes, type, direction, width) {

      if (!type) type = 'hover';
      if (!direction) direction = 'top';
      if (!width) width = 150;
      this.popHoverDirection = direction;
      this.popHoverObj.popWidth = width;
      this.isHoverMesPop = true;
      this.popHoverMes = mes;


      this.pWidth = document.getElementById("inputDiv").offsetWidth;
      this.needPop = true;

      this.$nextTick(() => {
        this.setInheritStyle();
      })

    },

    getEditBox(args) {
      if (!args) {
        this.t_edit = true;
        return this.$refs.edit;
      } else if (args == "col") {
        this.t_edit_col = true;
        return this.$refs.edit_col;
      } else if (args == "row") {
        this.t_edit_row = true;
        return this.$refs.edit_row;
      }
    },

    getName() {
      return name;
    },

    getDisplayValue() {
      let value = this.value;
      let finalKey = null;
      if (this.args.selectMuti == true) {

        finalKey = [];
        if (value && value != [] && value != undefined) {

          value.forEach(v => {

            let targetRes = this.args.selectList.filter(i => {
              return i.value == v
            })
            if (targetRes) {
              finalKey.push(targetRes[0].label)
            }

          })

        }

      } else {

        finalKey = '';
        if (value && value != '' && value != undefined) {

          this.args.selectList.forEach(s => {
            if (s.value == value) {
              finalKey = s.label;
            }
          })

        }

      }

      return finalKey;
    },

    setDisplayType(type) {
      this.t_create = false;
      this.t_edit = false;
      this.t_visit = false;
      if (type == "create") {
        this.t_create = true;
      } else if (type == "edit") {
        this.t_edit = true;
      } else if (type == "visit") {
        this.t_visit = true;
      }
      return this;
    },

    getDataType(args) {
      return this.args.dataTypes;
    },

    // 确认创建Options
    createOptions() {
      if (this.args.selfOptions == '') {
        this.$Message.info('请先输入所需自定义下拉框内容');
      } else {
        this.args.selectList = [];

        // 中英文逗号替换
        this.args.selfOptions = this.args.selfOptions.replace(/，/ig, ',');
        let optionAttr = this.args.selfOptions.split(',');
        optionAttr.forEach((item, index) => {
          if (item != '') {

            if (item.indexOf(':') == -1) {     // label 与 value相同时

              const dType = this.args.targetDataType;
              if (dType == 'Double' || dType == 'Integer' || dType == 'Long') {
                item = parseFloat(item)
              }
              let eachOption = {
                label: item,
                value: item
              }
              this.args.selectList.splice(index, 0, eachOption);

            } else {                           // label 与 value不同

              const dType = this.args.targetDataType;
              let intValue = item.split(":")[1];
              if (dType == 'Double' || dType == 'Integer' || dType == 'Long') {
                intValue = parseFloat(item.split(":")[1])
              }

              let eachOption = {
                label: item.split(":")[0],
                value: intValue
              }
              this.args.selectList.splice(index, 0, eachOption);
            }

          }
        })
      }
    },

    async handleValueChanged() {
      setTimeout(() => {
        this.setInheritStyle()
      }, 100);
      // this.isWrong = false;
      this.isRequired = false;

      if (!this.errorMessage) {
        this.setError(false);
      }

      if (this.vChange && this.vChange != undefined) {
        this.invokeOperation(this.vChange.opr_type, this.vChange.opr_path, this.itemValue, this.store);
      }
    },

    async hoverEvent() {
      if (this.isHover && this.isHover != undefined) {
        this.invokeOperation(this.isHover.opr_type, this.isHover.opr_path, this.itemValue, this.store);
      }
    },

    handleClear() {
      let self = this;
      setTimeout(() => {
        this.$nextTick(() => {
          if (self.args.required) {
            self.isRequired = true;
            self.setError(true);
          }
          if (self.args.useDictionary) {
            self.remoteMethod('')
          }
        })
      }, 0)
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


    /**
     *@description远程搜索http://166.111.7.145:10080/zentao/bug-view-4758.html
     *@params
     *@date 2020/12/23
     *@return
     */
    async remoteMethod(query) {
      this.queryData = {
        query: {
          query: '',
          startIndex: 0,
          pageSize: 100,
        },
      };
      this.queryData.fresh = true;
      if (query && query.trim() !== '') {
        let labelAttr = Object.prototype.toString.call(this.args.labelAttr) === "[object Array]" ? this.args.labelAttr : [this.args.labelAttr];
        let returnFormat = Object.prototype.toString.call(this.args.valueAttr) === "[object Array]" ? this.args.valueAttr : [this.args.valueAttr];
        labelAttr.concat(returnFormat);
        let queryPart = ``;//最终query前半部
        let queryContent = ``;//最终query后半部
        let queryContentArray = query.split('-');
        if (queryContentArray.length === 1) {
          for (let [index, returnSelectFormat] of labelAttr.entries()) {
            if (index === 0) {
              queryContent = `cast(obj.${returnSelectFormat} as text) like '%${queryContentArray[0] || ''}%'`;
            } else {
              queryContent += ` or cast(obj.${returnSelectFormat} as text) like '%${queryContentArray[0] || ''}%'`;
            }
          }
          this.queryData.query.query = `and (${queryContent})`;
        } else {
          for (let [index, returnSelectFormat] of labelAttr.entries()) {
            if (index === 0) {
              queryPart = `(cast(obj.${returnSelectFormat} as text)`;
              queryContent = `'%${queryContentArray[0] || ''}%`;
            } else {
              queryPart += ` || '-' || cast(obj.${returnSelectFormat} as text)`;
              queryContent += `-%${queryContentArray[index] || ''}%`;
            }
            if (index == labelAttr.length - 1) {
              queryPart += `)`;
              queryContent += `'`;
            }
          }
          this.queryData.query.query = `and ${queryPart} like ${queryContent}`;
        }
        // this.queryData.query.query = `and (${queryContent})`;
        await this.initBrowseListData();
      } else if (typeof query !== 'undefined' && query === '') {
        let finalParseStr = '';
        if (this.args.filterQuery != '') {
          finalParseStr = this.parseEscapeString(this.args.filterQuery, null, null, this.itemValue.data.origin, this.attributes, this.store);
        }
        this.queryData.query.query = finalParseStr;
        await this.initBrowseListData();
      }
    },

    remoteMethodKeydown(e) {
      if (e.keyCode === 8 && !e.target.value) {
        this.remoteMethod('')
      }
    },

    async initBrowseListData() {
      let classPre = this.args.bindTargetClass.split('&')[0];
      let classType = this.args.bindTargetClass.split('&')[1];
      let labelAttr = Object.prototype.toString.call(this.args.labelAttr) === "[object Array]" ? this.args.labelAttr : [this.args.labelAttr];
      let returnFormat = Object.prototype.toString.call(this.args.valueAttr) === "[object Array]" ? this.args.valueAttr : [this.args.valueAttr];
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
      await this.handleQueryData(this.queryData);

      let objectList = this.QueryResultAll(this.queryData) || [];
      this.args.selectList = objectList.map(object => {
        return {
          // label:下拉框回填显示项
          label: labelAttr.length !== 0 ?
            (labelAttr.map(attr => {
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
    },
  },
};
</script>
<style>
.i-input .ivu-select-placeholder {
  color: #c5c8ce;
}

.dark .ivu-select-item-focus {
  background: transparent !important;
}

.self-searchBox .i-input .ivu-select-placeholder {
  color: #c5c8ce !important;
}

section[addinname='SelectInput'] .ivu-select-single .ivu-select-selection .ivu-select-placeholder {
  color: #c5c8ce !important;
}

section[addinname='SelectInput'] .ivu-select-single .ivu-select-input[disabled] {
  /* color: inherit; */
  -webkit-text-fill-color: inherit;
}
</style>
<style scoped>
/*
    插件的css部分
    设置display为inline，默认不换行
    scoped表示样式仅在该vue文件内有效
*/
section {
  display: inline-block;
  width: 100%;
  /*min-height: 48px;*/
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
