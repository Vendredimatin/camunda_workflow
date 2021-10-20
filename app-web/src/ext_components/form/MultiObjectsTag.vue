<template>
  <section :addinName="name" id="inputDiv" dropTarget="0" ref="main" :style="{'width': colWidth}" v-show="!args.hided">
    <template v-if="args.structural_layout === 'horizontal'">
      <span v-if="args.required || args.label" :style="{'width': labelWidth, 'display': 'inline-block',
        'text-align': labelXAlign, 'vertical-align': labelYAlign, 'padding-right': '10px'}">
            <span v-show="!args.hided"
                  :style="{'background-color': args.label_color, 'width': '100%', 'display': 'inline-block'}">
                <span v-if="args.required" style="color: red">*</span>
                <label class="self-color"
                       :style="{'color': args_label_fontColor, 'font-size': args_lfsize}">{{ args.label }}</label>
            </span>
        </span>
      <span :style="{'min-height': arg_height, 'width': mainWidth, 'display': 'inline-block',
            'text-align': mainXAlign, 'color': args.main_fontColor}">
            <span v-show="!args.hided"
                  :style="{'background-color': args.main_color, 'width': '100%', 'display': 'inline-block', 'vertical-align': mainYAlign}">
                <div class="use-table" style="border-collapse:collapse; width:100%;" v-if="!needPop">
                  <div style="display: flex;align-items: center;">
                    <div style="display: inline-block;width: calc(100% - 70px);">
                      <div
                        @mouseenter="hoverEvent"
                        class="tagPool i-input self-color"
                        :class="{'readonly': args.readonly || t_visit}"
                        :style="{'min-height': arg_height,  'width': '100%', 'display': 'inline-block', 'text-align': mainXAlign, 'vertical-align': mainYAlign,  'background-color': args_txt_bgColor, 'border': poolBorder, 'border-radius':  borderRadius}"
                      >
                        <Tag v-for="(object, index) in currentObjectTag"
                             :key="object.oid"
                             v-if="returnFormatIsOid"
                             :class="{'tag-readonly': args.readonly || t_visit}"
                             :name="index" closable @on-close="handleClose"
                             :style="{'font-size': args_fsize, 'color': args_txt_fontColor}">{{ object.displayFormat }}</Tag>
                        <Tag v-for="(object, index) in selectedObjectTag"
                             :key="object"
                             v-if="!returnFormatIsOid"
                             :class="{'tag-readonly': args.readonly || t_visit}"
                             :name="index" closable @on-close="_handleClose"
                             :style="{'font-size': args_fsize, 'color': args_txt_fontColor}">{{ object }}</Tag>
                      </div>
                    </div>
                    <div style="width: 70px; text-align: right;display: inline-block;">
                      <div>
                          <Button icon="md-search" size="small" type="primary" :disabled="args.readonly || t_visit"
                                  @click="handleClick"
                                  style=" margin: 3px ;"></Button>
                      </div>
                    </div>
                  </div>
                </div>
              <!--            <Input-->
              <!--                    class="i-input self-color"-->
              <!--                    v-if="!needPop"-->
              <!--                    v-model="selectedObject"-->
              <!--                    icon="md-search"-->
              <!--                    :readonly="readonly || t_visit || args.readonly"-->
              <!--                    :disabled="args.readonly || t_visit"-->
              <!--                    :style="{'width': '100%', 'display': 'inline-block', 'text-align': mainXAlign, 'vertical-align': mainYAlign, 'color': args_txt_fontColor, 'font-size': args_fsize, 'background-color': args_txt_bgColor}"-->
              <!--                    @on-change="valueChange"-->
              <!--                    @mouseenter.native="hoverEvent"-->
              <!--                    @on-blur="blurEvent"-->
              <!--                    @on-click="handleClick"-->
              <!--            />-->

            <Poptip v-else trigger="hover" :placement="popHoverDirection" :width="popHoverObj.popWidth">
              <div class="use-table" style="border-collapse:collapse; width:100%;">
                    <div style="display: flex;align-items: center;">
                        <div style="display: inline-block;width: calc(100% - 35px);">
                          <div @mouseenter="hoverEvent"
                               class="tagPool i-input self-color"
                               :class="{'readonly': args.readonly || t_visit}"
                               :style="{'min-height': arg_height,  'width': '100%', 'display': 'inline-block', 'text-align': mainXAlign, 'vertical-align': mainYAlign,'color': args_txt_fontColor, 'background-color': args_txt_bgColor, 'border': poolBorder, 'border-radius':  borderRadius}"
                          >
                          <Tag v-for="(object, index) in currentObjectTag"
                               :key="object.oid"
                               v-if="returnFormatIsOid"
                               :class="{'tag-readonly': args.readonly || t_visit}"
                               :name="index" closable @on-close="handleClose"
                               :style="{'font-size': args_fsize, 'color': args_txt_fontColor}">{{ object.displayFormat }}</Tag>
                          <Tag v-for="(object, index) in selectedObjectTag"
                               :key="object"
                               v-if="!returnFormatIsOid"
                               :class="{'tag-readonly': args.readonly || t_visit}"
                               :name="index" closable @on-close="_handleClose"
                               :style="{'font-size': args_fsize, 'color': args_txt_fontColor}">{{ object }}</Tag>
                          </div>
                        </div>
                        <div style="width: 35px; text-align: right;display: inline-block;">
                        <div>
                            <Button icon="md-search" size="small" type="primary" :disabled="args.readonly || t_visit"
                                    @click="handleClick"
                                    style=" margin-left: 3px ;margin-right: 3px;"></Button>
                        </div>
                        </div>
                    </div>
                </div>
              <!--                <Input-->
              <!--                        class="i-input self-color"-->
              <!--                        v-model="selectedObject"-->
              <!--                        icon="md-search"-->
              <!--                        :readonly="readonly || t_visit || args.readonly"-->
              <!--                        :disabled="args.readonly || t_visit"-->
              <!--                        :style="{'width': relWidth, 'display': 'inline-block', 'text-align': mainXAlign, 'vertical-align': mainYAlign, 'color': args_txt_fontColor, 'font-size': args_fsize,   'background-color': args_txt_bgColor}"-->
              <!--                        @on-change="valueChange"-->
              <!--                        @mouseenter.native="hoverEvent"-->
              <!--                        @on-blur="blurEvent"-->
              <!--                        @on-click="handleClick"-->
              <!--                />-->
                <div v-show="popHoverObj.needPopTitle" slot="title"><span
                  :style="{'color': popHoverObj.popTitleColor, 'font-size': `${popHoverObj.popTitleFs}px`}">{{
                    popHoverObj.popTitleTxt
                  }}</span></div>
                <div slot="content">
                    <FormEngine
                      v-if="!this.isHoverMesPop && popHoverPath"
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
      <span v-if="args.required || args.label" :style="{'width': '100%', 'display': 'inline-block',
        'text-align': labelXAlign, 'vertical-align': labelYAlign, 'padding-right': '10px'}">
            <span v-show="!args.hided"
                  :style="{'background-color': args.label_color, 'width': '100%', 'display': 'inline-block'}">
                <span v-if="args.required" style="color: red">*</span>
                <label class="self-color"
                       :style="{'color': args_label_fontColor, 'font-size': args_lfsize}">{{ args.label }}</label>
            </span>
        </span>
      <span :style="{'min-height': arg_height, 'width': '100%', 'display': 'inline-block',
            'text-align': mainXAlign, 'color': args.main_fontColor}">
            <span v-show="!args.hided"
                  :style="{'background-color': args.main_color, 'width': '100%', 'display': 'inline-block', 'vertical-align': mainYAlign}">
                <div class="use-table" style="border-collapse:collapse; width:100%;" v-if="!needPop">
                    <div style="display: flex;align-items: center;">
                        <div style="display: inline-block;width: calc(100% - 35px);">
                          <div
                            @mouseenter="hoverEvent"
                            class="tagPool i-input self-color"
                            :class="{'readonly': args.readonly || t_visit}"
                            :style="{'min-height': arg_height,  'width': '100%', 'display': 'inline-block', 'text-align': mainXAlign, 'vertical-align': mainYAlign,  'background-color': args_txt_bgColor, 'border': poolBorder, 'border-radius':  borderRadius}"
                          >
                        <Tag v-for="(object, index) in currentObjectTag"
                             :key="object.oid"
                             v-if="returnFormatIsOid"
                             :class="{'tag-readonly': args.readonly || t_visit}"
                             :name="index" closable @on-close="handleClose"
                             :style="{'font-size': args_fsize, 'color': args_txt_fontColor}">{{ object.displayFormat }}</Tag>
                        <Tag v-for="(object, index) in selectedObjectTag"
                             :key="object"
                             v-if="!returnFormatIsOid"
                             :class="{'tag-readonly': args.readonly || t_visit}"
                             :name="index" closable @on-close="_handleClose"
                             :style="{'font-size': args_fsize, 'color': args_txt_fontColor}">{{ object }}</Tag>
                          </div>
                        </div>
                        <div style="width: 35px; text-align: right;display: inline-block;">
                        <div>
                            <Button icon="md-search" size="small" type="primary" :disabled="args.readonly || t_visit"
                                    @click="handleClick"
                                    style=" margin-left: 3px ;margin-right: 3px;"></Button>
                        </div>
                        </div>
                    </div>
                </div>
              <!--            <Input-->
              <!--                    class="i-input self-color"-->
              <!--                    v-if="!needPop"-->
              <!--                    v-model="selectedObject"-->
              <!--                    icon="md-search"-->
              <!--                    :readonly="readonly || t_visit || args.readonly"-->
              <!--                    :disabled="args.readonly || t_visit"-->
              <!--                    :style="{'width': '100%', 'display': 'inline-block', 'text-align': mainXAlign, 'vertical-align': mainYAlign, 'color': args_txt_fontColor, 'font-size': args_fsize, 'background-color': args_txt_bgColor}"-->
              <!--                    @on-change="valueChange"-->
              <!--                    @mouseenter.native="hoverEvent"-->
              <!--                    @on-blur="blurEvent"-->
              <!--                    @on-click="handleClick"-->
              <!--            />-->

            <Poptip v-else trigger="hover" :placement="popHoverDirection" :width="popHoverObj.popWidth">
              <div class="use-table" style="border-collapse:collapse; width:100%;">
                    <div style="display: flex;align-items: center;">
                        <div style="display: inline-block;width: calc(100% - 35px);">
                          <div @mouseenter="hoverEvent"
                               class="tagPool i-input self-color"
                               :class="{'readonly': args.readonly || t_visit}"
                               :style="{'min-height': arg_height,  'width': '100%', 'display': 'inline-block', 'text-align': mainXAlign, 'vertical-align': mainYAlign,'color': args_txt_fontColor, 'background-color': args_txt_bgColor, 'border': poolBorder, 'border-radius':  borderRadius}"
                          >
                            <Tag v-for="(object, index) in currentObjectTag"
                                 :key="object.oid"
                                 v-if="returnFormatIsOid"
                                 :class="{'tag-readonly': args.readonly || t_visit}"
                                 :name="index" closable @on-close="handleClose"
                                 :style="{'font-size': args_fsize, 'color': args_txt_fontColor}">{{ object.displayFormat }}</Tag>
                            <Tag v-for="(object, index) in selectedObjectTag"
                                 :key="object"
                                 v-if="!returnFormatIsOid"
                                 :class="{'tag-readonly': args.readonly || t_visit}"
                                 :name="index" closable @on-close="_handleClose"
                                 :style="{'font-size': args_fsize, 'color': args_txt_fontColor}">{{ object }}</Tag>
                          </div>
                        </div>
                        <div style="width: 35px; text-align: right;display: inline-block;">
                        <div>
                            <Button icon="md-search" size="small" type="primary" :disabled="args.readonly || t_visit"
                                    @click="handleClick"
                                    style=" margin-left: 3px ;margin-right: 3px;"></Button>
                        </div>
                        </div>
                    </div>
                </div>
              <!--                <Input-->
              <!--                        class="i-input self-color"-->
              <!--                        v-model="selectedObject"-->
              <!--                        icon="md-search"-->
              <!--                        :readonly="readonly || t_visit || args.readonly"-->
              <!--                        :disabled="args.readonly || t_visit"-->
              <!--                        :style="{'width': relWidth, 'display': 'inline-block', 'text-align': mainXAlign, 'vertical-align': mainYAlign, 'color': args_txt_fontColor, 'font-size': args_fsize,   'background-color': args_txt_bgColor}"-->
              <!--                        @on-change="valueChange"-->
              <!--                        @mouseenter.native="hoverEvent"-->
              <!--                        @on-blur="blurEvent"-->
              <!--                        @on-click="handleClick"-->
              <!--                />-->
                <div v-show="popHoverObj.needPopTitle" slot="title"><span
                  :style="{'color': popHoverObj.popTitleColor, 'font-size': `${popHoverObj.popTitleFs}px`}">{{
                    popHoverObj.popTitleTxt
                  }}</span></div>
                <div slot="content">
                    <FormEngine
                      v-if="!this.isHoverMesPop && popHoverPath"
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

    <Modal
      v-model="selectObjectModal"
      title="多对象标签"
      :width="curDialogWidth"
      scrollable
      :mask-closable="false"
      @on-ok="handleOk"
    >
      <FormEngine
        ref="form"
        :style="{'height': curDialogHeight, 'overflow-y': 'auto'}"
        v-if="!(args.browseForm == '')"
        :to_path="args.modalPath"
        :to_query="args.modalQuery"
        :store="store">
      </FormEngine>
    </Modal>
    <span v-show="(isRequired || isWrong) && !args.hided"
          :style="{'width': '100%', 'display': 'inline-block', 'padding-left': labelWidth}">
            <span v-show="isRequired" class="wrongTips">该项不能为空</span>
            <span v-show="isWrong" class="wrongTips">{{ errorMessage || args.ruleMessage }}</span>
        </span>
  </section>
</template>

<script>

import EntityModeling from "@/api/data-model/EntityModeling";
import "@/styles/component/iconfont.css"
import store from "@/store";
import {getQueryOperation, getEobjMulti, getRobjMulti} from "@/api/others";
import FormEngine from '@/views/form-engine/forms-engine.vue'
import {entries as form_entries} from "@/ext_components/form/config.js";
import _ from 'lodash';

const name = "MultiObjectsTag";
var echarts = require("echarts");

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

  components: {
    FormEngine
  },

  data() {
    return {
      timer: null,
      times: 0,
      name: name,

      // 展示模式
      t_create: false,
      t_edit: false,
      t_visit: true,
      readonly: false,
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

      // 图标地址
      icon_url: "",

      // 支持的数据类型
      dataTypes: ['String', 'Integer', 'Boolean', 'Long', 'UUID', 'Double'],

      // 编辑框
      args: {
        dynamic: false,
        label_fontColor: "initial", // 标签字体颜色
        txt_fontColor: "initial",   // 内容字体颜色
        txt_bgColor: '#fff',        // 输入框背景颜色
        lfsize: 14,                 // 标签文字大小
        lfsizeType: 'px',           // 标签文字大小单位
        fsize: 14,                  // 内容文字大小
        fsizeType: 'px',            // 内容文字大小单位
        width: 100,
        widthType: '%',
        id: "",
        title: "多对象标签",
        label: "",
        name: "",
        bindTargetClass: '',
        // refClass: null,
        returnFormat: [],
        displayFormat: [],
        browseAttributes: [],
        browseForm: "",
        filterQuery: "",
        filterAttributes: [],
        groupName: null,
        required: false,
        readonly: false,
        disabled: false,
        hided: false,
        // label所需属性
        label_width: 2,
        main_width: 3,
        label_align: 4,
        main_align: 4,
        _id: "0",
        _type: "attribute",
        height: 30,
        heightType: "px",
        col: true,
        cols: 3,
        // 属性插件所需属性
        targetDataType: null,
        relation: "",
        relation_attr: "",
        relation_class: "",
        relation_class_attr: "",
        dialogWidth: 80,
        dialogWidthType: '%',
        dialogAutoHeight: 'false',
        dialogHeight: '400',
        dialogHeightType: 'px',
      },

      // 失去焦点 and 值变化
      isBlur: null,
      vChange: null,

      // 插件的字符串返回值，由回填格式定义
      selectedObject: null,
      // 所有的引用类数组，用于选择refClass
      allEntityClasses: [],
      // 所选的引用类的属性数组，用于选择browseAttribute，returnFormat，displayFormat
      refClassAttributes: [],
      // 所选引用类的表单数组，用于浏览
      refClassForms: [],
      // 所选的引用类的对象数组
      objectList: [],
      // editFilterAttributes对话框flag
      showEditModal: false,
      // 用于辅助删除FilterAttributes
      filterAttributesIndex: 0,
      // 当前表单编辑对象
      formObject: {},
      // 单对象弹窗
      selectObjectModal: false,
      // 弹窗中选中当前对象
      currentObject: null,
      // 弹窗中选中当前tag对象
      currentObjectTag: null,
      // 输入过滤关键词
      searchKeyword: "",

      // 用于从VUEX中查询数据
      queryData: {
        query: {query: "",}, // 查询条件
        targetClass: "",    // 目标类名
        formName: "",   //
        uuid: ""
      },

      // 对齐方式,布局插件使用
      alignList: [
        {value: 0, name: "左上对齐"},
        {value: 1, name: "靠左对齐"},
        {value: 2, name: "左下对齐"},
        {value: 3, name: "顶部对齐"},
        {value: 4, name: "居中对齐"},
        {value: 5, name: "底部对齐"},
        {value: 6, name: "右上对齐"},
        {value: 7, name: "靠右对齐"},
        {value: 8, name: "右下对齐"}
      ],

      // 继承属性
      inherit: [],

      // 表单项名
      args_name: "",

      // 属性map
      attrMap: {},

      allow: {},
      errorMessage: '',

    }
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

    let that = this;
    this.$store = this.store;
  },
  computed: {
    args_fsize() {
      return this.args.fsize + this.args.fsizeType + '!important';
    },
    args_lfsize() {
      return this.args.lfsize + this.args.lfsizeType + '!important';
    },
    arg_height() {
      return this.args.height < 2 && this.args.heightType == 'px' ? this.args.height * 30 + "px" : this.args.height + this.args.heightType;
    },
    args_label_fontColor() {
      return sessionStorage.getItem('skinStyle') == 'dark' && sessionStorage.getItem('appMenu') && this.args.label_fontColor == 'initial' ? this.args.label_fontColor : this.args.label_fontColor + '!important';
    },
    args_txt_fontColor() {
      return sessionStorage.getItem('skinStyle') == 'dark' && sessionStorage.getItem('appMenu') && this.args.txt_fontColor == 'initial' ? 'inherit' : this.args.txt_fontColor + '!important';
    },
    args_txt_bgColor() {
      return sessionStorage.getItem('skinStyle') == 'dark' && sessionStorage.getItem('appMenu') && this.args.txt_bgColor == '#fff' ? 'initial' : this.args.txt_bgColor;
    },
    colWidth() {
      return this.args.width + this.args.widthType;
      // return this.args.col ? parseInt(100 / this.args.cols) + "%" : "100%";
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
    relWidth() {
      return 'inherit';
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

    groupInfo: function () {
      let groupSize = this.getGroupElements().length;
      return groupSize > 0 ?
        `该联动组有${groupSize}个组件` : `该组件未设置联动组`;
    },
    poolBorder() {
      //bug5967
      console.log()
      return sessionStorage.getItem('skinStyle') == 'dark' && sessionStorage.getItem('appMenu') && document.getElementById('app').querySelector('.appMenu') ? '1px solid #3f648b' : '1px solid #dcdee2'
      // return '1px solid #dcdee2';
    },
    borderRadius(){
      return sessionStorage.getItem('skinStyle') == 'dark' && sessionStorage.getItem('appMenu') && document.getElementById('app').querySelector('.appMenu') ? '0px' : '4px';
    },
    curDialogWidth() {
      return `${this.args.dialogWidth}${this.args.dialogWidthType}` || '80%';
    },
    curDialogHeight() {
      return this.args.dialogAutoHeight ? 'auto' : `${this.args.dialogHeight}${this.args.dialogHeightType}` || 'auto';
    },
    returnFormatIsOid() {
      return this.args.returnFormat.length == 1 && (this.args.returnFormat[0] == 'oid' || this.args.returnFormat[0] == 'relation_oid')
    },
    selectedObjectTag() {
      if (this.selectedObject) {
        return this.selectedObject.split(',');
      } else {
        return [];
      }
    },
  },
  watch: {

    arg_height(val) {
      this.setHeight();
    },
  },
  mounted() {
    this.$nextTick(() => {
      this.setInheritStyle();
    })
    this.setHeight();

    if (this.args.events && this.args.events.length > 0) {

      // 鼠标悬停事件
      this.isHover = this.args.events.find((val) => {
        return val.name == '鼠标悬停'
      })

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

      this.isBlur = this.args.events.find((val) => {
        return val.name == '失去焦点'
      })

    }

  },
  methods: {
    onDynamic(value) {
      let that = this;
      if (this.dynamicTimer != null) {
        clearTimeout(this.dynamicTimer);
        this.dynamicTimer = null;
        this.dynamicTimer = setTimeout(() => {
          that.setValue(value);
          clearTimeout(that.dynamicTimer);
          that.dynamicTimer = null;
        }, 1500)
      } else {
        this.dynamicTimer = setTimeout(() => {
          that.setValue(value);
          clearTimeout(that.dynamicTimer);
          that.dynamicTimer = null;
        }, 1500)
      }
    },
    setInheritStyle() {
      if (sessionStorage.getItem('skinStyle') == 'dark' && sessionStorage.getItem('appMenu') && this.args.txt_bgColor == '#fff') {
        this.args.txt_bgColor = 'initial';
      }
      this.$refs.main.querySelectorAll('.ivu-poptip') && this.$refs.main.querySelectorAll('.ivu-poptip').length != 0
        ? this.$refs.main.querySelectorAll('.ivu-poptip').forEach(item => {
          item.style.width = '100%';
          item.parentNode.style.width = '100%';
        })
        : '';
      this.$refs.main.querySelectorAll('.ivu-poptip-rel') && this.$refs.main.querySelectorAll('.ivu-poptip-rel').length != 0
        ? this.$refs.main.querySelectorAll('.ivu-poptip-rel').forEach(item => {
          item.style.width = 'inherit';
        })
        : '';
      this.$refs.main.querySelectorAll('.i-input .ivu-tag-text') && this.$refs.main.querySelectorAll('.i-input .ivu-tag-text').length != 0
        ? this.$refs.main.querySelectorAll('.i-input .ivu-tag-text').forEach(item => {
          item.style.fontSize = 'inherit';
          item.style.color = 'inherit';
        })
        : '';
      this.$refs.main.querySelectorAll('.i-input .ivu-tag') && this.$refs.main.querySelectorAll('.i-input .ivu-tag').length != 0
        ? this.$refs.main.querySelectorAll('.i-input .ivu-tag').forEach(item => {
          item.style.height = 'inherit';
          item.style.lineHeight = 'inherit';
        })
        : '';
      // this.$refs.main.querySelector('.i-input .ivu-input').style.fontSize = 'inherit';
      // this.$refs.main.querySelector('.i-input .ivu-input').style.color = 'inherit';
      // this.$refs.main.querySelector(".i-input .ivu-input").style.textAlign = 'inherit';
      // this.$refs.main.querySelector('.i-input .ivu-input').style.backgroundColor = 'inherit';
      // this.$refs.main.querySelector('.i-input .ivu-input').style.height = this.arg_height;
      // this.$refs.main.querySelector('.i-input .ivu-icon').style.lineHeight = this.arg_height;
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
          var dom = that.$refs.main.querySelector(".ivu-input-wrapper input");
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

    async getObject(oid) {
      this.queryData.targetClass = this.args.bindTargetClass.split('&')[0];
      console.log('getObject', this.queryData)
      let classType = this.args.bindTargetClass.split('&')[1];
      if (classType === 'r') {
        this.queryData.relationClass = this.args.bindTargetClass.split('&')[0];
        this.queryData.query.type = "relation";
      } else {
        delete this.queryData.query.type;
      }
      this.queryData.fresh = true;
      await this.handleQueryData(this.queryData); // vuex做好缓存准备
      let obj;
      if (classType === 'r') {
        obj = await this.getRClassObject(this.queryData.targetClass, oid);
      } else {
        obj = await this.getClassObject(this.queryData.targetClass, oid);
      }
      return obj;
    },

    getValue() {
      let returnObject;
      if (this.args.selectMulti) {
        //多选模式
        if (this.currentObject) {
          if(this.currentObject.length === 0){
            returnObject = null
          }else{
            this.currentObject.forEach((item, index) => {
              if (index === 0) {
                returnObject = this.args.returnFormat.length !== 0 ?
                  (this.args.returnFormat.map(attr => {
                    return item[attr];
                  }).join("-"))
                  : item.oid;
              } else {
                returnObject += this.args.returnFormat.length !== 0 ?
                  ',' + (this.args.returnFormat.map(attr => {
                    return item[attr];
                  }).join("-"))
                  : ',' + item.oid;
              }
            })
          }
        } else {
          returnObject = this.selectedObject;
        }
      } else {
        returnObject = this.currentObject ? (this.args.returnFormat.length !== 0 ?
          (this.args.returnFormat.map(attr => {
            return this.currentObject[attr];
          }).join("-"))
          : this.currentObject.oid) : this.selectedObject;
      }
      if (this.args.targetDataType === "String") {
        return returnObject;
      } else if (this.args.targetDataType === "Integer") {
        return parseInt(returnObject);
      } else if (this.args.targetDataType === "Boolean") {
        return returnObject === "true";
      } else if (this.args.targetDataType === "Long") {
        // TODO:
        return parseInt(returnObject);
      } else if (this.args.targetDataType === "UUID") {
        return returnObject;
      } else if (this.args.targetDataType === "Date") {
        return returnObject;
      } else if (this.args.targetDataType === "Double") {
        return parseFloat(returnObject);
      } else if (this.args.targetDataType === "Clob") {
        return returnObject;
      } else if (this.args.targetDataType === "TimeStamp") {
        return returnObject;
      } else {
        return returnObject;
      }
    },

    getSelected() {
      return this.currentObject;
    },

    async _setValue(value) {
      if (this.args.returnFormat.length == 1 && (this.args.returnFormat[0] == 'oid' || this.args.returnFormat[0] == 'relation_oid')) {
        if (this.args.selectMulti) {
          //多选模式
          this.currentObject = [];
          this.selectedObject = '';
          let oidList = value.split(',');
          if (oidList.length > 1) {
            try {
              this.queryData.targetClass = this.args.bindTargetClass.split('&')[0];
              let classType = this.args.bindTargetClass.split('&')[1];
              let obj;
              if (classType === 'r') {

                // obj = await getRobjMulti(this.queryData.targetClass, oidList);
                for (let oid of oidList) {
                  let obj = await this.getObject(oid);
                  this.currentObject.push(obj);
                }
                this.setSelectedObject();
                // this.currentObject = this.currentObject.concat(obj.data.data);
              } else {
                obj = await getEobjMulti(this.queryData.targetClass, oidList);
                this.currentObject = this.currentObject.concat(obj.data.data);
                this.setSelectedObject();
              }
            } catch (e) {
              console.log(`请求多对象失败${e}`)
            }
          } else {
            let obj = await this.getObject(oidList[0]);
            this.currentObject.push(obj);
            this.setSelectedObject();
          }
        } else {
          this.currentObject = await this.getObject(value);
          this.setSelectedObject();
        }
      } else {
        this.selectedObject = value + '';
      }
      this.$nextTick(() => {
        this.setInheritStyle();
      })
    },

    async setValue(value, callback) {
      console.log('setValue', value)
      if (value == null) {
        this.currentObject = null;
        this.currentObjectTag = null;
        this.selectedObject = null;
        return this;
      }
      await this._setValue(value);
      this.callback = callback ? callback : '';
      this.callback ? (this.callback(), this.callback = '') : '';
      return this;
    },

    /**
     * 循环选中对象currentObject给返回值selectedObject赋值
     *
     */
    setSelectedObject() {
      this.currentObjectTag = [];
      if (this.args.selectMulti) {
        this.currentObject.forEach((item, index) => {
          this.currentObjectTag[index] = {};
          this.currentObjectTag[index].oid = item.relation_oid ? item.relation_oid : item.oid;
          this.currentObjectTag[index].displayFormat = this.args.displayFormat.length !== 0 ? (this.args.displayFormat.map(attr => {
              // if (type === 'multi'){
              //   return item[attr.replace(/^left_|^right_|^relation_/, '')];
              // }else{
              // }

              return item[attr];
            }).join("-"))
            : item.relation_oid ? item.relation_oid : item.oid;;
          if (index === 0) {
            this.selectedObject = this.currentObjectTag[index].displayFormat;
          } else {
            this.selectedObject += this.currentObjectTag[index].displayFormat;
          }
        })
      } else {
        if(this.currentObject){
          this.currentObjectTag[0] = {};
          this.currentObjectTag[0].oid = this.currentObject.relation_oid ? this.currentObject.relation_oid : this.currentObject.oid;
          this.currentObjectTag[0].displayFormat = this.args.displayFormat.length !== 0 ?
            (this.args.displayFormat.map(attr => {
              // if (type === 'multi'){
              //   return this.currentObject[attr.replace(/^left_|^right_|^relation_/, '')];
              // }else{
              // }
              return this.currentObject[attr];
            }).join("-"))
            : this.currentObject.relation_oid ? this.currentObject.relation_oid : this.currentObject.oid;
          this.selectedObject = this.currentObjectTag[0].displayFormat;
        }else{
          this.currentObjectTag = [];
          this.selectedObject = '';
        }
      }
      console.log(this.currentObjectTag)
    },

    getAllow() {
      return null;
    },

    // 获取可继承属性
    getInherit() {
      var res = {};
      let that = this;
      this.inherit.forEach(x => res[x] = that.args[x]);
      return res;
    },

    // 获取编辑框内容
    getArgs() {
      return this.args;
    },

    setArgs(args) {
      for (var i in args) {
        this.args[i] = args[i];
      }
      this.args.modalQuery = {query: this.parseEscapeString(this.args.filterQuery, null, null, this.itemValue.data.origin, this.attributes, this.$store)};
      // this.args.modalQuery = {query: ''};
      return this;
    },

    // 获取表单项名
    getFormName() {
      return this.args.name;
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

    // 设置异常状态显示
    setError(error, message = '') {
      this.isWrong = error;
      this.$refs.main.querySelector(".tagPool").style.border = error ? "1px solid red" : '';
      this.errorMessage = error ? message : '';
      return this;
    },

    // 设置校验逻辑,返回true/false
    validate() {
      let expResult = true;
      let _value = this.selectedObject;
      console.log('validate', _value);

      if (this.args.required && (_value == null || _value == 'null' || _value == '')) {

        this.isWrong = false;
        this.isRequired = true;
        expResult = false;

      } else if ((_value != '' || _value != null) && this.args.rule) {

        this.isRequired = false;
        expResult = new RegExp(this.args.rule).test(_value);

      } else {
        console.log(_value);
      }

      if (!this.errorMessage) {
        this.setError(expResult ? null : true);
      }
      this.isRequired = this.isWrong = !expResult;
      return expResult;
    },

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

    setIcon(id) {
      this.icon_url = id;
      return this;
    },

    getDataType(args) {
      return this.dataTypes;
    },

    handleClick() {
      if (this.args.readonly || this.args.disabled || this.t_visit) return false;
      this.selectObjectModal = true;
      this.$nextTick(() => {
        let modalForm = this.getTables(this.$refs.form.rootJson.data);
        let filterQuery = this.parseEscapeString(this.args.filterQuery, null, null, this.itemValue.data.origin, this.attributes, this.$store);
        this.args.modalQuery = {query: filterQuery};
        modalForm.forEach(element => {
          element.obj.setSelectModalGrid ? element.obj.setSelectModalGrid(this.currentObject) : '';
          element.obj.freshData(filterQuery);
        });

        let allCharts = this.$refs.form.$el.querySelectorAll('div.echart-bar');
        if (allCharts) {
          for (var i = 0; i < allCharts.length; i++) {
            var myChart = echarts.getInstanceByDom(allCharts[i]);
            myChart.resize();
          }
        }

      })
    },

    getTables(node) {
      var res = [];
      if (node.obj && node.obj.getSelected && form_entries.find(item => item.name === node.obj.name) && form_entries.find(item => item.name === node.obj.name).module === 'form/multi') {
        res.push({
          obj: node.obj,
          label: node.self.properties.name,
          value: node.self.uuid
        });
      }
      if (node.elements) {
        for (var i = 0; i < node.elements.length; i++) {
          res = res.concat(this.getTables(node.elements[i]));
        }
      }
      return res;
    },

    selectObjectRow(object) {
      // this.$Message.info("selectObjectRow")
      this.currentObject = object
    },

    handleOk() {
      console.log('handleOk')
      // 找出引用表单中的多对象组件
      let multiAddins = this.$refs.form.GetAllAddin(this.$refs.form.rootJson.data).filter(addin => addin.getSelected != undefined && form_entries.find(item => item.name === addin.name) && form_entries.find(item => item.name === addin.name).module === 'form/multi');
      if (this.args.selectMulti) {
        this.currentObject = multiAddins.length > 0 ? multiAddins[0].getSelected(true) : undefined;
      } else {
        this.currentObject = multiAddins.length > 0 ? multiAddins[0].getSelected()[0] : undefined;
      }

      // 处理复合对象
      // let temDisplayFormat = [];
      // if('relation_oid' in this.currentObject) {

      //     let className = this.args.bindTargetClass.split('&')[0];
      //     let classType = this.args.bindTargetClass.split('&')[1];

      //     if(classType == 'r') {

      //         temDisplayFormat = this.args.displayFormat.map(item => {
      //             item = 'relation_' + item;
      //             return item
      //         })

      //     } else {

      //         // 判断引用类是左类还是右类 还是其他
      //         if(this.currentObject.relation_rightClass == className) {
      //             temDisplayFormat = this.args.displayFormat.map(item => {
      //                 item = 'right_' + item;
      //                 return item
      //             })
      //         } else if(this.currentObject.relation_rightClass == className){
      //             temDisplayFormat = this.args.displayFormat.map(item => {
      //                 item = 'left_' + item;
      //                 return item
      //             })
      //         } else {
      //             console.log(className)
      //         }

      //     }

      // } else {                   //单对象
      //     temDisplayFormat = this.args.displayFormat;
      // }

      if (this.currentObject && this.currentObject.length !== 0) {
        this.currentObjectTag = [];
        if (this.args.selectMulti) {
          //多选模式
          this.currentObject.forEach((item, index) => {
            this.currentObjectTag[index] = {};
            this.currentObjectTag[index].oid = item.relation_oid ? item.relation_oid : item.oid;
            this.currentObjectTag[index].displayFormat = this.args.displayFormat.length !== 0 ? (this.args.displayFormat.map(attr => {
                return item[attr];
              }).join("-"))
              : item.relation_oid ? item.relation_oid : item.oid;
            if (index === 0) {
              this.selectedObject = this.currentObjectTag[index].displayFormat;
            } else {
              this.selectedObject += ',' + this.currentObjectTag[index].displayFormat;
            }
          })
        } else {
          this.currentObjectTag[0] = {};
          this.currentObjectTag[0].oid = this.currentObject.relation_oid ? this.currentObject.relation_oid : this.currentObject.oid;
          this.currentObjectTag[0].displayFormat = this.args.displayFormat.length !== 0 ?
            (this.args.displayFormat.map(attr => {
              return this.currentObject[attr];
            }).join("-"))
            : this.currentObject.relation_oid ? this.currentObject.relation_oid : this.currentObject.oid;
          this.selectedObject = this.currentObjectTag[0].displayFormat;
        }
        if (this.selectedObject == '') this.selectedObject = this.currentObject.relation_oid ? this.currentObject.relation_oid : this.currentObject.oid;
        // 联动
        this.getGroupElements().forEach(item => {
          item.setGroupObject(this.currentObject, this.args.id);
        });
        this.setAttrChainObject(this.currentObject);
        //触发验证
        this.validate();
      }else{
        //fix bug 6087
        this.currentObjectTag = [];
        this.selectedObject = '';
        if(this.args.required){
          this.isRequired = true;
          this.setError(true);
        }
      }

      this.clearLastModifyTime();
      if (this.vChange && this.vChange != undefined) {
        this.invokeOperation(this.vChange.opr_type, this.vChange.opr_path, this.itemValue, this.store);
      }
      this.$nextTick(() => {
        this.setInheritStyle();
      })
    },

    handleSearch() {
      this.currentObject = {};
    },

    handleRefClassChange() {
      if (this.t_preview) {
        this.args.returnFormat = [];
        this.args.displayFormat = [];
        this.args.browseAttributes = [];
        this.args.filterAttributes = [];
        this.args.groupName = null;
      }
      ;
    },

    addFilterAttribute() {
      let len = this.args.filterAttributes.length;
      let index = len === 0 ? 1 : this.args.filterAttributes[len - 1].index + 1;
      this.args.filterAttributes.push({
        // 为了执行删除操作，filterAttributes需要一个递增的index
        index: index,
        refClassAttribute: 'oid',
        targetClassAttribute: 'oid'
      });
    },

    removeFilterAttribute(index) {
      this.args.filterAttributes = this.args.filterAttributes.filter(item => {
        return item.index !== index
      });
    },

    // 找出当前itemValue中所有组件对象
    getAllElements(json) {
      let result = [];
      for (var element of json) {
        result.push(element.obj);
        result = result.concat(this.getAllElements(element.elements));
      }
      return result;
    },

    // 选择表单项名时，同步修改表单项标签
    handleNameChange(value) {
      this.args.label = value.label;

    },

    async updateObjects() {
      console.log('updateObjects')
      await this.handleQueryData(this.queryData); // vuex做好缓存准备
      let uidList = this.getEn(this.queryData.targetClass);
      uidList.forEach(uid => {
        this.objectList.push(this.getClassObject(this.queryData.targetClass, uid));
      })
    },

    // 找出当前itemValue中所有groupName相同的组件对象
    // 前提要求：引用类名也相同
    traversalJson(json) {
      let result = [];
      for (var element of json) {
        element.self.properties.groupName === this.args.groupName ? result.push(element.obj) : null;
        result = result.concat(this.traversalJson(element.elements));
      }
      return result;
    },

    getGroupElements() {
      // 如果groupName为空字符或者null，则不计入任何联动组
      return this.args.groupName ? this.traversalJson(this.itemValue.data.elements) : [];
    },

    // 接受同联动组组件传来联动对象，根据自身情况修改组件返回值
    setGroupObject(object, id) {
      if (this.args.multi) return;
      if (Object.prototype.toString.call(object) === '[object Array]') {
        object = object[0];
        this.currentObject = object
      } else {
        this.currentObject = object
      }

      if (id !== this.args.id) {
        this.currentObjectTag = [];
        this.currentObjectTag[0] = {};
        this.currentObjectTag[0].oid = this.currentObject.oid;
        this.currentObjectTag[0].displayFormat = this.args.displayFormat.length !== 0 ?
          (this.args.displayFormat.map(attr => {
            return this.currentObject[attr];
          }).join("-"))
          : this.currentObject.oid;
        this.selectedObject = this.currentObjectTag[0].displayFormat;
      }
      this.$nextTick(() => {
        this.setInheritStyle();
      })
    },

    async hoverEvent() {
      if (this.isHover && this.isHover != undefined) {
        this.invokeOperation(this.isHover.opr_type, this.isHover.opr_path, this.itemValue, this.store);
      }
    },

    async triggerEvent(type) {
      switch (type) {
        case 'valueChanged':
          if (this.vChange) {
            this.clearLastModifyTime();
            this.invokeOperation(this.vChange.opr_type, this.vChange.opr_path, this.itemValue, this.store);
          }
          break;
        case 'setGroupValue':
          this.getGroupElements().forEach(item => {
            item.setGroupObject(this.currentObject, this.args.id);
          });
          break;
        default:
          if (this.vChange) {
            this.invokeOperation(this.vChange.opr_type, this.vChange.opr_path, this.itemValue, this.store);
          }
          break;
      }
    },

    setAttrChainObject(currentObject) {
      if (!this.args.attrChainMode) return;
      if (!this.args.attrChain) return;
      for (let key in this.args.attrChain) {
        if (key) {
          let addin = this.GetAddinById(this.itemValue.data, key);
          if (addin) {
            currentObject ? addin.setValue(currentObject[this.args.attrChain[key]]) : addin.setValue(null)
          }
        }
      }
    },

    handleClose(event, index) {
      if (this.args.readonly || this.t_visit) return;
      if (this.args.selectMulti) {
        // _.remove(this.currentObject, obj => obj.oid == oid);
        // _.remove(this.currentObjectTag, obj => obj.oid == oid);
        this.currentObject.splice(index, 1);
        this.currentObjectTag.splice(index, 1);
        this.currentObject.forEach((item, index) => {
          let selectedObject = this.args.displayFormat.length !== 0 ? (this.args.displayFormat.map(attr => {
              return item[attr];
            }).join("-"))
            : item.oid;
          if (index === 0) {
            this.selectedObject = selectedObject;
          } else {
            this.selectedObject += selectedObject;
          }
        })
      } else {
        this.currentObject = undefined;
        this.currentObjectTag = [];
        this.selectedObject = '';
      }
      if((!this.currentObject || this.currentObject.length === 0) && this.args.required){
        this.isRequired = true;
        this.setError(true);
      }
      // 联动
      this.getGroupElements().forEach(item => {
        item.setGroupObject(this.currentObject, this.args.id);
      });
      this.setAttrChainObject(this.currentObject);
    },

    //删除回填非oid的不合规格数据，只删除selectedObject中的字符串
    _handleClose(event, index) {
      if (this.args.readonly || this.t_visit) return;
      let tags = this.selectedObject.split(',');
      tags.splice(index, 1);
      if (tags.length === 0) {
        this.selectedObject = '';
      } else {
        this.selectedObject = tags.join();
      }
    },

    clearLastModifyTime() {
      try {
        if (this.args.name === 'relation_leftOid') {
          this.itemValue.data.origin.left_lastModifyTime = null;
        }
        if (this.args.name === 'relation_rightOid') {
          this.itemValue.data.origin.right_lastModifyTime = null;
        }
      } catch (e) {
        console.log(`清除lastModifyTime${e}`)
      }
    }

  }
}
</script>

<style>
.tag-readonly {
  cursor: not-allowed;
}

.tag-readonly:hover {
  opacity: 1 !important;
}

.tag-readonly .ivu-icon.ivu-icon-ios-close {
  cursor: not-allowed;
}
</style>

<style scoped>
.tagPool {
  display: inline-block;
  width: 100%;
  min-height: 32px;
  line-height: 1.5;
  padding: 4px 7px;
  font-size: 12px;
  border: 1px solid #dcdee2;
  color: #515a6e;
  background-color: #fff;
  background-image: none;
  position: relative;
  cursor: text;
  transition: border .2s ease-in-out, background .2s ease-in-out, box-shadow .2s ease-in-out;
  max-height: 90px;
  overflow: auto;
  /*fix bug 6434-6534*/
}

.tagPool:hover {
  border-color: #57a3f3;
}

.readonly {
  cursor: not-allowed;
}

section {
  display: inline-block;
  width: 100%
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
</style>
