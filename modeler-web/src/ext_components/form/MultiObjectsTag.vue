<template>
  <section v-if="t_preview" :addinName="name" dropTarget="0" ref="main" :style="{'width': colWidth}">
    <template v-if="args.structural_layout === 'horizontal'">
      <span v-if="args.required || args.label" :style="{'width': labelWidth, 'display': 'inline-block',
        'text-align': labelXAlign, 'vertical-align': labelYAlign, 'padding-right': '10px'}">
            <span :style="{'background-color': args.label_color, 'width': '100%', 'display': 'inline-block'}">
                <span v-if="args.required" style="color: red">*</span>
                <label :style="{'color': args.label_fontColor, 'font-size': args_lfsize}">{{ args.label }}</label>
            </span>
        </span>
      <span :style="{'width': mainWidth, 'display': 'inline-block',
            'text-align': mainXAlign, 'color': args.main_fontColor}">
            <span :style="{'background-color': args.main_color, 'width': '100%', 'display': 'inline-block', 'vertical-align': mainYAlign}">
                <table class="use-table" style="border-collapse:collapse; width:100%;">
                    <tr>
                        <td style="">
                          <div
                                  class="tagPool i-input self-color"
                                  :style="{ 'height': arg_height, 'width': '100%', 'display': 'inline-block', 'text-align': mainXAlign,'background-color': args.txt_bgColor, 'vertical-align': mainYAlign}"
                          >
<!--                            <Tag v-for="object in currentObjectTag" :name="object.oid" closable @on-close="handleClose">{{object.displayFormat}}</Tag>-->
                          </div>
                        </td>
                        <td style="width: 70px; text-align: right;">
                        <div>
                            <Button icon="md-search" size="small" type="primary"
                                    style=" margin-left: 3px ;margin-right: 3px;"></Button>
                        </div>
                        </td>
                    </tr>
                </table>
              <!--            <Input-->
              <!--                    class="i-input"-->
              <!--                    v-model="selectedObject"-->
              <!--                    icon="md-search"-->
              <!--                    :readonly="args.readonly"-->
              <!--                    :style="{'width': '100%', 'display': 'inline-block', 'height': arg_height,   'text-align': mainXAlign, 'vertical-align': mainYAlign, 'color': args.txt_fontColor, 'font-size': args_fsize, 'background-color': args.txt_bgColor}"/>-->
            </span>
        </span>
    </template>
    <template v-else>
      <span v-if="args.required || args.label" :style="{'width': '100%', 'display': 'inline-block',
        'text-align': labelXAlign, 'vertical-align': labelYAlign, 'padding-right': '10px'}">
            <span :style="{'background-color': args.label_color, 'width': '100%', 'display': 'inline-block'}">
                <span v-if="args.required" style="color: red">*</span>
                <label :style="{'color': args.label_fontColor, 'font-size': args_lfsize}">{{ args.label }}</label>
            </span>
        </span>
      <span :style="{'width': '100%', 'display': 'inline-block',
            'text-align': mainXAlign, 'color': args.main_fontColor}">
            <span :style="{'background-color': args.main_color, 'width': '100%', 'display': 'inline-block', 'vertical-align': mainYAlign}">
                <table class="use-table" style="border-collapse:collapse; width:100%;">
                    <tr>
                        <td style="">
                          <div
                                  class="tagPool i-input self-color"
                                  :style="{ 'height': arg_height, 'width': '100%', 'display': 'inline-block', 'text-align': mainXAlign,'background-color': args.txt_bgColor, 'vertical-align': mainYAlign}"
                          >
<!--                            <Tag v-for="object in currentObjectTag" :name="object.oid" closable @on-close="handleClose">{{object.displayFormat}}</Tag>-->
                          </div>
                        </td>
                        <td style="width: 70px">
                        <div>
                            <Button icon="md-search" size="small" type="primary"
                                    style=" margin-left: 3px ;margin-right: 3px;"></Button>
                        </div>
                        </td>
                    </tr>
                </table>
              <!--            <Input-->
              <!--                    class="i-input"-->
              <!--                    v-model="selectedObject"-->
              <!--                    icon="md-search"-->
              <!--                    :readonly="args.readonly"-->
              <!--                    :style="{'width': '100%', 'display': 'inline-block', 'height': arg_height,   'text-align': mainXAlign, 'vertical-align': mainYAlign, 'color': args.txt_fontColor, 'font-size': args_fsize, 'background-color': args.txt_bgColor}"/>-->
            </span>
        </span>
    </template>

    <slot name="widget"></slot>
<span v-show="t_edit" ref="edit">
            <EditBox v-if="actEdit" :addinName="name" :widgetAnnotation="widgetAnnotation" :editExtendInfo="editExtendInfo" ref="editbox" v-model="args"
                     :itemValue="itemValue"
                     :attributes="filter_attributes"
                     :router="router"
                     :route="route"
                     :root="root"
                     :store="store"
                     :query_oprs="query_oprs"
                     :dataTypes="dataTypes"
                     :targetclass="itemValue.data.targetClass"
                     @handleBindTargetClassChange="handleRefClassChange"
                     @editBoxfreshAttr="editBoxfreshAttr"
            >
                <div slot="attribute">

                    <!-- <p class="margin1">引用类</p>
                    <Select class="margin1" v-model="args.refClass" filterable @on-change="handleRefClassChange">
                        <OptionGroup label="实体类">
                            <Option
                                    v-for="item in allEntityClasses"
                                    :key="item.id || ''"
                                    :value="item.className"
                                    :label="item.displayName"
                            >
                            <span>{{ item.displayName }}</span>
                            <span style="float:right;color:#ccc">{{ item.className.split('\&')[0] }}</span>
                            </Option>
                        </OptionGroup>
                        <OptionGroup label="关联类">
                            <Option
                                    v-for="item in allRelationClasses"
                                    :key="item.id"
                                    :value="item.className"
                                    :label="item.displayName"
                            >
                            <span>{{ item.displayName }}</span>
                            <span style="float:right;color:#ccc">{{ item.className.split('\&')[0] }}</span>
                            </Option>
                        </OptionGroup>
                    </Select> -->

                    <p class="margin1">浏览表单</p>
                    <BindFormBar class="margin1" :targetClass="arg_bindTargetClass" :root="root"
                                 :targetFormType="'PC'"
                                 :defaultFormName="args.browseForm" :classType="arg_classType" v-on:on-change="handleBrowseFormChange"
                                 style="width: 100%"></BindFormBar>

                    <p class="margin1">回填字段</p>
                    <Select class="margin1 ivu-select-dropdown100" v-model="args.returnFormat" filterable multiple
                            @on-change="handleReturnFormatChange" @on-open-change="handleReturnFormatOpen">
                      <OptionGroup label="系统属性" v-if="filter_refClassAttributes_sys">
                        <Option v-for="(attr, index) in filter_refClassAttributes_sys" :value="attr.attributeName"
                                :key="index || ''" >{{ attr.displayName
                  }}&nbsp&nbsp{{ attr.attributeName }}</Option>
                      </OptionGroup>
                      <OptionGroup label="类属性" v-if="filter_refClassAttributes_def">
                        <Option v-for="(attr, index) in filter_refClassAttributes_def" :value="attr.attributeName"
                                :key="index || ''" >{{ attr.displayName
                  }}&nbsp&nbsp{{ attr.attributeName }}</Option>
                      </OptionGroup>
                      <OptionGroup label="关联类系统属性" v-if="filter_refClassAttributes_relationSys">
                        <Option v-for="(attr, index) in filter_refClassAttributes_relationSys"
                                :value="attr.attributeName"
                                :key="index || ''" >{{ attr.displayName
                  }}&nbsp&nbsp{{ attr.attributeName }}</Option>
                      </OptionGroup>
                      <OptionGroup label="关联类属性" v-if="filter_refClassAttributes_relationDef">
                        <Option v-for="(attr, index) in filter_refClassAttributes_relationDef"
                                :value="attr.attributeName"
                                :key="index || ''" >{{ attr.displayName
                  }}&nbsp&nbsp{{ attr.attributeName }}</Option>
                      </OptionGroup>
                      <OptionGroup label="左类属性" v-if="filter_refClassAttributes_leftDef">
                        <Option v-for="(attr, index) in filter_refClassAttributes_leftDef" :value="attr.attributeName"
                                :key="index || ''" >{{ attr.displayName
                  }}&nbsp&nbsp{{ attr.attributeName }}</Option>
                      </OptionGroup>
                      <OptionGroup label="右类属性" v-if="filter_refClassAttributes_rightDef">
                        <Option v-for="(attr, index) in filter_refClassAttributes_rightDef" :value="attr.attributeName"
                                :key="index || ''" >{{ attr.displayName
                  }}&nbsp&nbsp{{ attr.attributeName }}</Option>
                      </OptionGroup>
                    </Select>

                    <p class="margin1">显示字段</p>
                  <!--                   :disabled="displayFormatFlag"-->
                    <Select class="margin1 ivu-select-dropdown100" v-model="args.displayFormat" filterable multiple>
                      <OptionGroup label="系统属性" v-if="refClassAttributes_sys">
                        <Option v-for="(attr, index) in refClassAttributes_sys" :value="attr.attributeName"
                                :key="index || ''" >{{ attr.displayName
                  }}&nbsp&nbsp{{ attr.attributeName }}</Option>
                      </OptionGroup>
                      <OptionGroup label="类属性" v-if="refClassAttributes_def">
                        <Option v-for="(attr, index) in refClassAttributes_def" :value="attr.attributeName"
                                :key="index || ''" >{{ attr.displayName
                  }}&nbsp&nbsp{{ attr.attributeName }}</Option>
                      </OptionGroup>
                      <OptionGroup label="关联类系统属性" v-if="refClassAttributes_relationSys">
                        <Option v-for="(attr, index) in refClassAttributes_relationSys" :value="attr.attributeName"
                                :key="index || ''" >{{ attr.displayName
                  }}&nbsp&nbsp{{ attr.attributeName }}</Option>
                      </OptionGroup>
                      <OptionGroup label="关联类属性" v-if="refClassAttributes_relationDef">
                        <Option v-for="(attr, index) in refClassAttributes_relationDef" :value="attr.attributeName"
                                :key="index || ''" >{{ attr.displayName
                  }}&nbsp&nbsp{{ attr.attributeName }}</Option>
                      </OptionGroup>
                      <OptionGroup label="左类属性" v-if="refClassAttributes_leftDef">
                        <Option v-for="(attr, index) in refClassAttributes_leftDef" :value="attr.attributeName"
                                :key="index || ''" >{{ attr.displayName
                  }}&nbsp&nbsp{{ attr.attributeName }}</Option>
                      </OptionGroup>
                      <OptionGroup label="右类属性" v-if="refClassAttributes_rightDef">
                        <Option v-for="(attr, index) in refClassAttributes_rightDef" :value="attr.attributeName"
                                :key="index || ''" >{{ attr.displayName
                  }}&nbsp&nbsp{{ attr.attributeName }}</Option>
                      </OptionGroup>
                      <!--                        <OptionGroup v-for="group in refClassAttributes" :label="group.groupName" :key="group.groupName">-->
                      <!--                          <Option v-for="(item, index) in group.attrList" :key="index" :value="item.value" :label="item.displayName">-->
                      <!--                            <span>{{ item.displayName }}</span>-->
                      <!--                            <span style="float:right;color:#ccc">{{ item.attributeName }}</span>-->
                      <!--                          </Option>-->
                      <!--                        </OptionGroup>-->
                    </Select>
                    <p class="margin1">联动组号</p>
                    <Input class="margin1" v-model="args.groupName" placeholder="输入联动组代号"
                           :disabled="args.selectMulti == true"
                           @on-blur="handleGroupNameChange"/>
                    <Input class="margin1" v-model="groupInfo" type="textarea" disabled placeholder="联动组信息"/>
                    <div class="margin1" style="margin: 10px 0 10px 0">
                      多选
                      <i-switch style="float: right" v-model="args.selectMulti"/>
                    </div>
                    <Button v-show="attrChainMode" class="margin1" type="primary" @click="openChainModal"
                            long>属性联动赋值</Button>
                      <AttributeChainModal
                              ref="ChainModal"
                              :args="args"
                              :itemValue="itemValue"
                              :refClass="args.bindTargetClass"
                              :root="root"
                              :store="store"
                              :refClassAttributes_sys="refClassAttributes_sys"
                              :refClassAttributes_def="refClassAttributes_def"
                              :refClassAttributes_relationSys="refClassAttributes_relationSys"
                              :refClassAttributes_relationDef="refClassAttributes_relationDef"
                              :refClassAttributes_leftDef="refClassAttributes_leftDef"
                              :refClassAttributes_rightDef="refClassAttributes_rightDef"
                              :attrChain="args.attrChain"
                              @confirmAttributeChain="confirmAttributeChain"
                      >
                      </AttributeChainModal>
                  <p class="margin1">弹窗宽度</p>
                  <Input v-model="args.dialogWidth" class="margin1" type="number">
                    <Select v-model="args.dialogWidthType" slot="append" style="width: 70px;">
                      <Option value="%">%</Option>
                      <Option value="px">px</Option>
                    </Select>
                  </Input>

                  <div class="margin1" style="margin: 10px 0 10px 0">
                    弹窗高度自适应
                    <i-switch style="float: right" v-model="args.dialogAutoHeight"></i-switch>
                  </div>
                  <div v-show="!args.dialogAutoHeight">
                      <p class="margin1">弹窗高度</p>
                      <Input v-model="args.dialogHeight" class="margin1" type="number">
                        <Select v-model="args.dialogHeightType" slot="append" style="width: 70px;">
                          <Option value="px">px</Option>
                          <Option value="vh">%</Option>
                        </Select>
                      </Input>
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
                <i class="iconfont">&#xe6b8;</i>
            </div>
            <Tooltip class="form-addin-name" content="多对象标签" style="width: 100%;" :transfer="true">对象标签</Tooltip>
        </span>
  </section>

</template>

<script>

  import {getEntity} from "@/api/data-model/EntityModeling";
  import {getRelation} from '@/api/data-model/RelationModeling';
  import {mapGetters, mapActions} from "vuex";
  import EditBox from "./_EditBox.vue"
  import {SYS_ENTITY_ATTRIBUTES, SYS_RELATION_ATTRIBUTES} from '@/libs/utils.js';
  import "@/styles/component/iconfont.css"
  import BindFormBar from "@/ext_components/form/subcomponent/BindFormBar.vue";
  import AttributeChainModal from "./subcomponent/AttributeChainModal";

  const name = "MultiObjectsTag";

  export default {
    name: name,

    // itemValue: 从表单建模/表单引擎传入的当前表单对象
    props: ["argsProps", "widgetAnnotation", "editExtendInfo", "itemValue", "attributes", "query_oprs", "route", "router", "root", "store", "Message", "relation"],

    components: {
      AttributeChainModal,
      EditBox,
      BindFormBar
    },

    data() {
      return {
        times: 0,
        name: name,

        // 展示模式
        t_preview: true,
        t_edit: false,
        actEdit: false,

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
          bindTargetClass: '',
          name: "",
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
          // 弹窗所需属性
          modalPath: "",
          modalQuery: {query: ''},
          events: [],
          eventRange: ["值变化", "鼠标悬停"],
          attrChain: {},
          selectMulti: false,
          attrChainMode: false,
          structural_layout: 'horizontal',   //整体布局
          // 事件操作所需配置
          // oprs: {
          //     "ValueChanged":{
          //         "opr_path": "",
          //         "opr_type": "",
          //     },
          // },
          dialogWidth: 80,
          dialogWidthType: '%',
          dialogAutoHeight: false,
          dialogHeight: '400',
          dialogHeightType: 'px',
        },

        // 插件的字符串返回值，由回填格式定义
        selectedObject: null,
        // 所有的引用类数组，用于选择refClass
        allEntityClasses: [],
        allRelationClasses: [],
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
        currentObject: {},
        // 输入过滤关键词
        searchKeyword: "",
        displayFormatFlag: false,

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

        timer: null,
        enTypeAttr: [],
        reTypeAttr: [],
        reTypeLAttr: [],
        reTypeRAttr: [],
        refClassAttributes_sys: null,
        refClassAttributes_def: null,
        refClassAttributes_relationSys: null,
        refClassAttributes_relationDef: null,
        refClassAttributes_leftSys: null,
        refClassAttributes_leftDef: null,
        refClassAttributes_rightSys: null,
        refClassAttributes_rightDef: null,
      }
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

        if (!this.$Message) this.$Message = this.Message;
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
      }
    },
    computed: {
      ...mapGetters("DWF_form", [
        "Entities",
        "EntityAttrList",
        "Relations",
        "RelationAttrList"]
      ),
      args_fsize() {
        return this.args.fsize + this.args.fsizeType + '!important';
      },
      args_lfsize() {
        return this.args.lfsize + this.args.lfsizeType + '!important';
      },
      arg_height() {
        return this.args.height < 2 && this.args.heightType == 'px' ? this.args.height * 30 + "px" : this.args.height + this.args.heightType;
      },
      arg_bindTargetClass(){
        return this.args.bindTargetClass ? this.args.bindTargetClass.split('\&')[0] : '';
      },
      arg_classType() {
        return this.args.bindTargetClass ? this.args.bindTargetClass.split('\&')[1] : '';
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
      // 需要用到引用类属性列表时使用
      arg_name() {
        return this.args.name;
      },

      filter_refClassAttributes() {
        return this.args.targetDataType == null ? this.refClassAttributes : (this.refClassAttributes.filter(attr => attr.valueType === this.args.targetDataType)).concat(this.args.targetDataType == "String" ? (this.refClassAttributes.filter(attr => attr.valueType === "UUID")) : []).concat(this.args.targetDataType == "UUID" ? (this.refClassAttributes.filter(attr => attr.valueType === "String")) : []);
      },

      filter_refClassAttributes_sys: function () {
        return this.args.targetDataType == null || this.refClassAttributes_sys == null ? this.refClassAttributes_sys : (this.refClassAttributes_sys.filter(attr => attr.valueType === this.args.targetDataType)).concat(this.args.targetDataType == "String" ? (this.refClassAttributes_sys.filter(attr => attr.valueType === "UUID")) : []).concat(this.args.targetDataType == "UUID" ? (this.refClassAttributes_sys.filter(attr => attr.valueType === "String")) : []);
      },

      filter_refClassAttributes_def: function () {
        return this.args.targetDataType == null || this.refClassAttributes_def == null ? this.refClassAttributes_def : (this.refClassAttributes_def.filter(attr => attr.valueType === this.args.targetDataType)).concat(this.args.targetDataType == "String" ? (this.refClassAttributes_def.filter(attr => attr.valueType === "UUID")) : []).concat(this.args.targetDataType == "UUID" ? (this.refClassAttributes_def.filter(attr => attr.valueType === "String")) : []);
      },

      filter_refClassAttributes_relationSys: function () {
        return this.args.targetDataType == null || this.refClassAttributes_relationSys == null ? this.refClassAttributes_relationSys : (this.refClassAttributes_relationSys.filter(attr => attr.valueType === this.args.targetDataType)).concat(this.args.targetDataType == "String" ? (this.refClassAttributes_relationSys.filter(attr => attr.valueType === "UUID")) : []).concat(this.args.targetDataType == "UUID" ? (this.refClassAttributes_relationSys.filter(attr => attr.valueType === "String")) : []);
      },

      filter_refClassAttributes_relationDef: function () {
        return this.args.targetDataType == null || this.refClassAttributes_relationDef == null ? this.refClassAttributes_relationDef : (this.refClassAttributes_relationDef.filter(attr => attr.valueType === this.args.targetDataType)).concat(this.args.targetDataType == "String" ? (this.refClassAttributes_relationDef.filter(attr => attr.valueType === "UUID")) : []).concat(this.args.targetDataType == "UUID" ? (this.refClassAttributes_relationDef.filter(attr => attr.valueType === "String")) : []);
      },

      filter_refClassAttributes_leftSys: function () {
        return this.args.targetDataType == null || this.refClassAttributes_leftSys == null ? this.refClassAttributes_leftSys : (this.refClassAttributes_leftSys.filter(attr => attr.valueType === this.args.targetDataType)).concat(this.args.targetDataType == "String" ? (this.refClassAttributes_leftSys.filter(attr => attr.valueType === "UUID")) : []).concat(this.args.targetDataType == "UUID" ? (this.refClassAttributes_leftSys.filter(attr => attr.valueType === "String")) : []);
      },

      filter_refClassAttributes_leftDef: function () {
        return this.args.targetDataType == null || this.refClassAttributes_leftDef == null ? this.refClassAttributes_leftDef : (this.refClassAttributes_leftDef.filter(attr => attr.valueType === this.args.targetDataType)).concat(this.args.targetDataType == "String" ? (this.refClassAttributes_leftDef.filter(attr => attr.valueType === "UUID")) : []).concat(this.args.targetDataType == "UUID" ? (this.refClassAttributes_leftDef.filter(attr => attr.valueType === "String")) : []);
      },

      filter_refClassAttributes_rightSys: function () {
        return this.args.targetDataType == null || this.refClassAttributes_rightSys == null ? this.refClassAttributes_rightSys : (this.refClassAttributes_rightSys.filter(attr => attr.valueType === this.args.targetDataType)).concat(this.args.targetDataType == "String" ? (this.refClassAttributes_rightSys.filter(attr => attr.valueType === "UUID")) : []).concat(this.args.targetDataType == "UUID" ? (this.refClassAttributes_rightSys.filter(attr => attr.valueType === "String")) : []);
      },

      filter_refClassAttributes_rightDef: function () {
        return this.args.targetDataType == null || this.refClassAttributes_rightDef == null ? this.refClassAttributes_rightDef : (this.refClassAttributes_rightDef.filter(attr => attr.valueType === this.args.targetDataType)).concat(this.args.targetDataType == "String" ? (this.refClassAttributes_rightDef.filter(attr => attr.valueType === "UUID")) : []).concat(this.args.targetDataType == "UUID" ? (this.refClassAttributes_rightDef.filter(attr => attr.valueType === "String")) : []);
      },
      filter_attributes() {
        return this.attributes ? (this.relation ?
          ["relation", this.attributes[1].filter(x => this.dataTypes.indexOf(x.valueType) > -1),
            this.attributes[2].filter(x => this.dataTypes.indexOf(x.valueType) > -1),
            this.attributes[3].filter(x => this.dataTypes.indexOf(x.valueType) > -1)] : this.attributes.filter(x => this.dataTypes.indexOf(x.valueType) > -1)) : [];
      },

      // 用于展示当前过滤字段
      filterJSON: function () {
        return this.args.filterAttributes.map(item => {
          return item.refClassAttribute + ": " + item.targetClassAttribute;
        }).join("\n");
      },

      // 根据filterAttributes生成，过滤objectList中属性值与filterObject相同的Object
      filterObject: function () {
        let result = {};
        this.args.filterAttributes.forEach(f => {
          if (this.formObject.hasOwnProperty(f.targetClassAttribute)) {
            result[f.refClassAttribute] = this.formObject[f.targetClassAttribute];
          }
        });
        return result;
      },

      // 使用filterObject过滤objectList
      filteredList: function () {
        return this.objectList.filter(object => {
          for (const attr in this.filterObject) {
            if (this.filterObject[attr] != object[attr]) {
              return false;
            }
          }
          return true;
        });
      },

      // 用于下拉框插件实际展示的对象数组，经过浏览字段与回填字段的格式转换
      browseList: function () {
        return this.filteredList.map(object => {
          return {
            // label:下拉框显示项
            label: this.args.browseAttributes.length !== 0 ?
              (this.args.browseAttributes.map(attr => {
                return object[attr];
              }).join("-"))
              : object.oid,
            // value:点选器返回值
            value: this.args.returnFormat.length !== 0 ?
              (this.args.returnFormat.map(attr => {
                return object[attr];
              }).join("-"))
              : object.oid,
            // object:被点选的对象，用于联动
            object: object,
          }
        });
      },

      groupInfo: function () {
        let groupSize = this.getGroupElements().length;
        return groupSize > 0 ?
          `该联动组有${groupSize}个组件` : `该组件未设置联动组`;
      },
      attrChainMode() {
        // && (this.args.returnFormat[0] == 'oid' || this.args.returnFormat[0] == 'relation_oid')
        return !this.args.selectMulti && this.args.returnFormat && this.args.returnFormat.length === 1;
      }
    },
    watch: {

      arg_height(val) {
        this.setInheritStyle();
      },
      arg_name(val) {
        if (val in this.attrMap) {
          this.args.targetDataType = this.attrMap[val].valueType;
          const dType = this.args.targetDataType;
          if (this.t_edit) {
            if (dType == 'Double' || dType == 'Integer' || dType == 'Long') {

              this.args.noNumber = false;
              this.args.returnFormat = '';

            } else {

              this.args.noNumber = true;
              this.args.returnFormat = [];
            }
          }
          if (this.relation) {
            if (val.startsWith("left_")) this.args.label = (this.relation.leftRole != "" ? this.relation.leftRole : this.relation.leftClass) + "的" + this.attrMap[val].displayName;
            if (val.startsWith("right_")) this.args.label = (this.relation.rightRole != "" ? this.relation.rightRole : this.relation.rightClass) + "的" + this.attrMap[val].displayName;
            if (val.startsWith("relation_")) this.args.label = this.attrMap[val].displayName;
          } else this.args.label = this.attrMap[val].displayName;
        } else {
          this.args.targetDataType = null;
        }
      },
      // end

      async "args.bindTargetClass"(newRefClass, oldRefClass) {
        if (!newRefClass) {
          return;
        }
        let type = newRefClass.split('\&')[1];
        newRefClass = newRefClass.split('\&')[0];
        if (type == 'r') {
          let temReAttr = [];
          let temLAttr = [];
          let temRAttr = [];
          this.resetAttribute();
          getRelation(newRefClass).then(response => {
            if (response.success) {
              let res = response.data;
              this.refClassAttributes_relationSys = res.attributes.filter(item => SYS_RELATION_ATTRIBUTES(item) !== -1);
              this.refClassAttributes_relationDef = res.attributes.filter(item => SYS_RELATION_ATTRIBUTES(item) === -1);
              temReAttr = res.attributes.map(val => {
                val.attributeName = `relation_${val.attributeName}`;
                val.displayName = `relation_${val.displayName}`;
                return val
              });
              if ('leftClass' in res) {
                getEntity(res.leftClass).then(mes => {
                  if (mes.success) {
                    let resL = mes.data;
                    this.refClassAttributes_leftSys = resL.attributes.filter(item => SYS_ENTITY_ATTRIBUTES(item) !== -1);
                    this.refClassAttributes_leftDef = resL.attributes.filter(item => SYS_ENTITY_ATTRIBUTES(item) === -1);
                    temLAttr = resL.attributes.map(val => {
                      val.attributeName = `left_${val.attributeName}`;
                      val.displayName = `left_${val.displayName}`;
                      return val
                    });
                  }
                }).catch(error => {
                  this.$Message.error(error.response.data.message);
                });
              }
              // 判断左右关联实体类不是同一个类
              if ('rightClass' in res) {
                getEntity(res.rightClass).then(mes => {
                  if (mes.success) {
                    let resR = mes.data;
                    this.refClassAttributes_rightSys = resR.attributes.filter(item => SYS_ENTITY_ATTRIBUTES(item) !== -1);
                    this.refClassAttributes_rightDef = resR.attributes.filter(item => SYS_ENTITY_ATTRIBUTES(item) === -1);
                    temRAttr = resR.attributes.map(val => {
                      val.attributeName = `right_${val.attributeName}`;
                      val.displayName = `right_${val.displayName}`;
                      return val
                    });
                  }
                });
                setTimeout(() => {
                  this.refClassAttributes = temReAttr.concat(temLAttr, temRAttr);
                  if (!this.firstload) {
                    this.args.returnFormat = [];
                    this.args.displayFormat = [];
                  }
                  //未知原因导致关联类表单中浏览字段和点选后显示字段中选择两个字段，保存表单后刷新，结果输入框中只有一个字段
                  if (this.firstload) {
                    this.args.displayFormat = this.displayFormatCache;
                    this.args.returnFormat = this.returnFormatCache;
                  }
                }, 500)
              } else {
                this.$Message.warning(response.message);
              }
            }
          })
          this.queryData.relationClass = newRefClass;
          this.queryData.query.type = "relation";
        } else {
          // 获取RefClass的属性数组refClassAttributes
          getEntity(newRefClass)
          .then(res => {
            this.resetAttribute();
            this.refClassAttributes = res.data.attributes;
            this.refClassAttributes_sys = this.refClassAttributes.filter(item => SYS_ENTITY_ATTRIBUTES(item) !== -1);
            this.refClassAttributes_def = this.refClassAttributes.filter(item => SYS_ENTITY_ATTRIBUTES(item) === -1);
            if (!this.firstload) {
              this.args.returnFormat = [];
              this.args.displayFormat = [];
            }
            //未知原因导致关联类表单中浏览字段和点选后显示字段中选择两个字段，保存表单后刷新，结果输入框中只有一个字段
            if (this.firstload) {
              this.args.displayFormat = this.displayFormatCache;
              this.args.returnFormat = this.returnFormatCache;
            }
          })
          .catch(error => {
            this.$Message.error(error.response.data.message);
          });
          this.queryData.targetClass = newRefClass;
          delete this.queryData.relationClass;
          delete this.queryData.leftClass;
          delete this.queryData.rightClass;
          delete this.queryData.query.type;
        }
      },


      attrChainMode(val) {
        this.args.attrChainMode = val;
      },

      'args.selectMulti'(val) {
        if (val) this.args.groupName = '';
      },

      'args.dialogWidth'(val){
        if(val < 0) {
          this.$nextTick(() => {
            this.args.dialogWidth = 0;
          })
        }
      }
    },
    mounted() {

      // 初始化：获取所有引用类allEntityClasses以备选择
      if (this.t_preview) {

        // 缺省绑定类为当前表单目标类
        if (this.args.bindTargetClass == '') {
          if (this.itemValue.data.isRelation) {
            this.args.bindTargetClass = this.itemValue.data.targetClass + '&r';
          } else {
            this.args.bindTargetClass = this.itemValue.data.targetClass + '&e';
          }
        }

        this.$nextTick(() => {
          this.setInheritStyle();
        })
        // EntityModeling.getAllEntities()
        // .then(res => {
        //     this.allEntityClasses = res.data;
        // })
        // .catch(error => {
        //     this.$Message.error('获取引用类失败：' + error.response.data.message);
        // });

        // this.allEntityClasses = this.Entities().map(val => {

        //    val.className = val.className + "&e";
        //    return val;

        // });
        // this.allRelationClasses = this.Relations().map(val => {

        //    val.className = val.className + "&r";
        //    return val;

        // });;
        // console.log(this.allEntityClasses, this.allRelationClasses)

        if (this.args.returnFormat.length == 1 && this.args.returnFormat[0].slice(-3) == 'oid') {
          this.displayFormatFlag = false;
        } else {
          this.displayFormatFlag = true;
        }
      }

    },

    beforeDestroy() {
      if (this.timer) {
        clearInterval(this.timer);
        this.timer = null;
      }
      ;
    },

    methods: {
      ...mapActions("DWF_form", [
        "queryEntity",
        "queryRelation"
      ]),

      resetAttribute() {
        this.refClassAttributes_sys = null;
        this.refClassAttributes_def = null;
        this.refClassAttributes_relationSys = null;
        this.refClassAttributes_relationDef = null;
        this.refClassAttributes_leftSys = null;
        this.refClassAttributes_leftDef = null;
        this.refClassAttributes_rightSys = null;
        this.refClassAttributes_rightDef = null;
      },

      editBoxfreshAttr(attr) {
        this.attributes = attr;
        if (this.relation) {
          this.attributes[1].forEach(x => this.attrMap['relation_' + x.attributeName] = x);
          this.attributes[2].forEach(x => this.attrMap['left_' + x.attributeName] = x);
          this.attributes[3].forEach(x => this.attrMap['right_' + x.attributeName] = x);
        } else {
          this.attributes.forEach(x => this.attrMap[x.attributeName] = x)
        }
      },
      setInheritStyle() {
        try {
          this.$refs.main.querySelector('.i-input .ivu-input').style.fontSize = 'inherit';
          this.$refs.main.querySelector('.i-input .ivu-input').style.color = 'inherit';
          this.$refs.main.querySelector('.i-input .ivu-input').style.height = 'inherit';
          this.$refs.main.querySelector(".i-input .ivu-input").style.textAlign = 'inherit';
          this.$refs.main.querySelector('.i-input .ivu-input').style.backgroundColor = 'inherit';
          this.$refs.main.querySelector('.i-input .ivu-icon').style.lineHeight = this.arg_height;
          this.$refs.main.querySelector('.i-input .ivu-input-inner-container').style.fontSize = 'inherit';
          this.$refs.main.querySelector('.i-input .ivu-input-inner-container').style.height = 'inherit';
        } catch (error) {
          console.log(error)
        }
      },
      // 当插件无法直接通过style设置高度时,使用setHeight方法设置高度
      setHeight() {
        return;
        // if (!this.$refs.main) return;
        // let that = this;
        // if (this.timer == null) {
        //     this.timer = setInterval(() => {
        //         if (!that.$refs.main) { clearInterval(that.timer); that.timer=null; return; }
        //         // 改成你需要的样式
        //         var dom = that.$refs.main.querySelector(".ivu-input-wrapper input");
        //         if (dom) {
        //             that ? dom.style.height = that.arg_height : '';
        //             clearInterval(that.timer);
        //             that.timer = null;
        //         } else {
        //             that.times += 30;
        //             if (that.times > 60 * 1000) {
        //                 clearInterval(that.timer);
        //                 that.timer = null;
        //             }
        //         }
        //     }, 30);
        // }
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
        if ("name" in args) this.args_name = this.args.name;
        if ("label" in args){
          let label = args.label;
          setTimeout(() => {
            this.args.label = label;
          }, 0);
        }
        this.firstload = true;
        this.displayFormatCache = this.args.displayFormat;
        this.returnFormatCache = this.args.returnFormat;
        return this;
      },

      // 获取表单项名
      getFormName() {
        return this.args.name;
      },

      getEditBoxComponent() {
        return this.$refs.editbox;
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

      setDisplayType(type) {
        this.t_preview = type == 0;
        return this;
      },

      setIcon(id) {
        this.icon_url = id;
        return this;
      },

      getDataType(args) {
        return this.dataTypes;
      },

      handleReturnFormatOpen() {
        this.firstload = false;
      },

      handleReturnFormatChange(value) {
        if (value.length == 1 && value[0].slice(-3) == 'oid') {
          this.displayFormatFlag = false;
        } else {
          if (!this.firstload) {
            this.args.displayFormat = value.slice(0);
            this.displayFormatFlag = true;
            this.firstload = false;
          }
        }
      },


      handleBrowseFormChange(value) {
        this.args.browseForm = value;
        this.args.modalPath = `/forms/${this.args.bindTargetClass.split('&')[0]}/${value}`;
      },

      selectObjectRow(object) {
        // this.$Message.info("selectObjectRow")
        this.currentObject = object
      },

      handleOk() {
        this.selectedObject = this.currentObject.value ? this.currentObject.value : ""

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
        console.log(this.queryData.targetClass);

        await this.handleQueryData(this.queryData); // vuex做好缓存准备
        let uidList = this.getEn(this.queryData.targetClass);
        console.log("!!", uidList);
        uidList.forEach(uid => {
          this.objectList.push(this.getClassObject(this.queryData.targetClass, uid));
        })
      },

      // 当点击下拉框时，更新formObject，更新过滤属性
      handleDropDown(value) {
        // 弹出下拉框时，设置formObject，应用过滤效果
        if (value) {
          let result = {};
          this.getAllElements(this.itemValue.data.elements).forEach(element => {
            result[element.getFormName()] = element.getValue();
          });
          this.formObject = result;
        }
        // 收起下拉框时，清空formObject，取消过滤效果
        else {
          // 为了显示效果需要延迟清空
          setTimeout(() => {
            this.formObject = {};
          }, 250);
        }
      },

      // 找出当前itemValue中所有groupName相同的组件对象
      // 前提要求：引用类名也相同
      traversalJson(json) {
        let result = [];
        for (var element of json) {
          (element.self.properties.groupName === this.args.groupName) &&
          (element.self.properties.bindTargetClass === this.args.bindTargetClass) ?
            result.push(element.obj) : null;
          result = result.concat(this.traversalJson(element.elements));
        }
        return result;
      },

      getGroupElements() {
        // 如果groupName为空字符或者null，则不计入任何联动组
        return this.args.groupName ? this.traversalJson(this.itemValue.data.elements) : [];
      },

      handleGroupNameChange() {

      },

      // TODO: 在过滤属性编辑框，根据引用类属性过滤目标类属性
      // TODO: 或者将两个类属性转化为字符串后比较

      // 当组件返回值变化时，进行联动
      handleSelectedObjectChange(value) {
        console.log(value);
        // 清空操作
        if (!value) {
          console.log("value == undefined");
          return;
        }
        // 筛选出当前联动对象groupObject
        // TODO: 筛选的有点粗糙，感觉不太对劲儿
        let groupObject = this.browseList.filter(item => {
          return item.value === value
        })[0].object;
        // 联动同组元素
        console.log(JSON.stringify(groupObject));
        this.getGroupElements().forEach(item => {
          item.setGroupObject(groupObject);
        });


      },

      // 接受同联动组组件传来联动对象，根据自身情况修改组件返回值
      setGroupObject(object) {
        this.selectedObject = this.args.returnFormat.length !== 0 ?
          (this.args.returnFormat.map(attr => {
            return object[attr];
          }).join("-"))
          : object.oid;
        console.log(this.selectedObject);
      },

      openChainModal() {
        this.$refs.ChainModal.initModal();
      },

      confirmAttributeChain(attrChain) {
        this.args.attrChain = attrChain;
      }
    }
  }
</script>
<style scoped>
  .tagPool {
    display: inline-block;
    width: 100%;
    min-height: 32px;
    line-height: 1.5;
    padding: 4px 7px;
    font-size: 12px;
    border: 1px solid #dcdee2;
    border-radius: 4px;
    color: #515a6e;
    background-color: #fff;
    background-image: none;
    position: relative;
    cursor: text;
    transition: border .2s ease-in-out, background .2s ease-in-out, box-shadow .2s ease-in-out;
  }

  .tagPool:hover {
    border-color: #57a3f3;
  }

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
