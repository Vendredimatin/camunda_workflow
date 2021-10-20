<template>
  <section v-if="t_preview" :addinName="name" dropTarget="0" ref="main" :style="{'width': colWidth}">
        <span v-if="args.required || args.label" :style="{'width': labelWidth, 'display': 'inline-block',
        'text-align': labelXAlign, 'vertical-align': labelYAlign, 'padding-right': '10px'}">
            <span :style="{'background-color': args.label_color, 'width': '100%', 'display': 'inline-block'}">
                <span v-if="args.required" style="color: red">*</span>
                <label :style="{'color': args.label_fontColor, 'font-size': args_lfsize}">{{ args.label }}</label>
            </span>
        </span>
    <span :style="{'height': arg_height, 'width': mainWidth, 'display': 'inline-block',
            'text-align': mainXAlign, 'color': args.main_fontColor}">
            <span :style="{'background-color': args.main_color, 'width': '100%', 'display': 'inline-block', 'vertical-align': mainYAlign}">
            <Select ref="sos"
                    class="i-input"
                    v-model="selectedObject"
                    :style="{'height': '100%', 'width': '100%', 'display': 'inline-block', 'text-align': mainXAlign, 'vertical-align': mainYAlign, 'color': args.txt_fontColor, 'font-size': args_fsize, 'background-color': args.txt_bgColor}"
                    clearable
                    :transfer="true"
                    filterable
                    @disabled="args.readonly"
                    @on-open-change="handleDropDown"
                    @on-change="handleSelectedObjectChange">
                <Option v-for="(item, index) in browseList" :value="item.value" :key="index || ''"
                        :label="item.label">
                    {{ item.slotLabel }}
                </Option>
            </Select>
            <!-- <Select ref="sos"
                    class="i-input"
                    v-model="selectedObject"
                    :style="{'height': '100%', 'width': '100%', 'display': 'inline-block', 'text-align': mainXAlign, 'vertical-align': mainYAlign, 'color': args.txt_fontColor, 'font-size': args_fsize, 'background-color': args.txt_bgColor}"
                    clearable
                    :transfer="true"
                    filterable
                    :remote-method="remoteMethod"
                    :loading="loading"
                    @disabled="args.readonly"
                    @on-open-change="handleDropDown"
                    @on-change="handleSelectedObjectChange">
                <Option v-for="(item, index) in browseList" :value="item.value" :key="index || ''"
                        :label="item.label">
                    {{ item.slotLabel }}
                </Option>
            </Select> -->
            </span>
        </span>
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
                     @editBoxfreshAttr="editBoxfreshAttr"
            >
                <div slot="attribute">
                    <p class="margin1">浏览字段</p>
                    <Select class="margin1" v-model="args.browseAttributes" filterable multiple>
                      <OptionGroup label="系统属性" v-if="refClassAttributes_sys">
                        <Option v-for="(attr, index) in refClassAttributes_sys" :value="attr.attributeName"
                                :key="index || ''" :label="attr.displayName"></Option>
                      </OptionGroup>
                      <OptionGroup label="类属性" v-if="refClassAttributes_def">
                        <Option v-for="(attr, index) in refClassAttributes_def" :value="attr.attributeName"
                                :key="index || ''" :label="attr.displayName"></Option>
                      </OptionGroup>
                      <OptionGroup label="关联类系统属性" v-if="refClassAttributes_relationSys">
                        <Option v-for="(attr, index) in refClassAttributes_relationSys" :value="attr.attributeName"
                                :key="index || ''" :label="attr.displayName"></Option>
                      </OptionGroup>
                      <OptionGroup label="关联类属性" v-if="refClassAttributes_relationDef">
                        <Option v-for="(attr, index) in refClassAttributes_relationDef" :value="attr.attributeName"
                                :key="index || ''" :label="attr.displayName"></Option>
                      </OptionGroup>
                      <OptionGroup label="左类属性" v-if="refClassAttributes_leftDef">
                        <Option v-for="(attr, index) in refClassAttributes_leftDef" :value="attr.attributeName"
                                :key="index || ''" :label="attr.displayName"></Option>
                      </OptionGroup>
                      <OptionGroup label="右类属性" v-if="refClassAttributes_rightDef">
                        <Option v-for="(attr, index) in refClassAttributes_rightDef" :value="attr.attributeName"
                                :key="index || ''" :label="attr.displayName"></Option>
                      </OptionGroup>
                    </Select>
                    <p class="margin1">回填字段</p>
                    <Select class="margin1" v-model="args.returnFormat" filterable :multiple="args.noNumber">
                      <OptionGroup label="系统属性" v-if="filter_refClassAttributes_sys">
                        <Option v-for="(attr, index) in filter_refClassAttributes_sys" :value="attr.attributeName"
                                :key="index || ''" :label="attr.displayName"></Option>
                      </OptionGroup>
                      <OptionGroup label="类属性" v-if="filter_refClassAttributes_def">
                        <Option v-for="(attr, index) in filter_refClassAttributes_def" :value="attr.attributeName"
                                :key="index || ''" :label="attr.displayName"></Option>
                      </OptionGroup>
                      <OptionGroup label="关联类系统属性" v-if="filter_refClassAttributes_relationSys">
                        <Option v-for="(attr, index) in filter_refClassAttributes_relationSys" :value="attr.attributeName"
                                :key="index || ''" :label="attr.displayName"></Option>
                      </OptionGroup>
                      <OptionGroup label="关联类属性" v-if="filter_refClassAttributes_relationDef">
                        <Option v-for="(attr, index) in filter_refClassAttributes_relationDef" :value="attr.attributeName"
                                :key="index || ''" :label="attr.displayName"></Option>
                      </OptionGroup>
                      <OptionGroup label="左类属性" v-if="filter_refClassAttributes_leftDef">
                        <Option v-for="(attr, index) in filter_refClassAttributes_leftDef" :value="attr.attributeName"
                                :key="index || ''" :label="attr.displayName"></Option>
                      </OptionGroup>
                      <OptionGroup label="右类属性" v-if="filter_refClassAttributes_rightDef">
                        <Option v-for="(attr, index) in filter_refClassAttributes_rightDef" :value="attr.attributeName"
                                :key="index || ''" :label="attr.displayName"></Option>
                      </OptionGroup>
                    </Select>
                    <p class="margin1">点选后显示字段</p>
                    <Select class="margin1" v-model="args.returnSelectFormat" filterable multiple>

                      <OptionGroup label="系统属性" v-if="refClassAttributes_sys">
                        <Option v-for="(attr, index) in refClassAttributes_sys" :value="attr.attributeName"
                                :key="index || ''" :label="attr.displayName"></Option>
                      </OptionGroup>
                      <OptionGroup label="类属性" v-if="refClassAttributes_def">
                        <Option v-for="(attr, index) in refClassAttributes_def" :value="attr.attributeName"
                                :key="index || ''" :label="attr.displayName"></Option>
                      </OptionGroup>
                      <OptionGroup label="关联类系统属性" v-if="refClassAttributes_relationSys">
                        <Option v-for="(attr, index) in refClassAttributes_relationSys" :value="attr.attributeName"
                                :key="index || ''" :label="attr.displayName"></Option>
                      </OptionGroup>
                      <OptionGroup label="关联类属性" v-if="refClassAttributes_relationDef">
                        <Option v-for="(attr, index) in refClassAttributes_relationDef" :value="attr.attributeName"
                                :key="index || ''" :label="attr.displayName"></Option>
                      </OptionGroup>
                      <OptionGroup label="左类属性" v-if="refClassAttributes_leftDef">
                        <Option v-for="(attr, index) in refClassAttributes_leftDef" :value="attr.attributeName"
                                :key="index || ''" :label="attr.displayName"></Option>
                      </OptionGroup>
                      <OptionGroup label="右类属性" v-if="refClassAttributes_rightDef">
                        <Option v-for="(attr, index) in refClassAttributes_rightDef" :value="attr.attributeName"
                                :key="index || ''" :label="attr.displayName"></Option>
                      </OptionGroup>
                    </Select>
                    <p class="margin1">是否开启远程搜索</p>
                    <i-switch v-model="args.remoted"/>
                    <p class="margin1">多选</p>
                    <i-switch v-model="args.selectMulti"/>
                    <p class="margin1">联动组号</p>
                    <Input class="margin1" v-model="args.groupName" placeholder="输入联动组代号"
                           @on-blur="handleGroupNameChange"/>
<!--                    <Input class="margin1" v-model="groupInfo" type="textarea" disabled placeholder="联动组信息"/>-->

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
                <i class="iconfont">&#xe647;</i>
            </div>
            <Tooltip class="form-addin-name" content="对象选择框" style="width: 100%;" :transfer="true">对象选择</Tooltip>
        </span>
  </section>

</template>

<script>

  import { getEntity } from "@/api/data-model/EntityModeling";
  import { getRelation } from '@/api/data-model/RelationModeling';
  import {mapGetters, mapActions} from "vuex";
  import { getEobj, getEJobj} from "@/api/others.js";
  import { SYS_ENTITY_ATTRIBUTES, SYS_RELATION_ATTRIBUTES } from '@/libs/utils.js';
  import "@/styles/component/iconfont.css"
  import EditBox from "./_EditBox.vue"
  import BindOperationBar from "./subcomponent/BindOperationBar.vue"

  const name = "SingleObjectSelectors";

  export default {
    name: name,

    // itemValue: 从表单建模/表单引擎传入的当前表单对象
    props: ["argsProps", "widgetAnnotation", "editExtendInfo" , "itemValue", "attributes", "query_oprs", "route", "router", "root", "store", "Message", "relation"],

    components: {
      BindOperationBar, EditBox
    },

    data() {
      return {
        times: 0,
        name: name,

        // 展示模式
        t_preview: false,
        t_show: true,
        t_icon: true,
        t_edit: false,

        // 图标地址
        icon_url: "",

        // 支持的数据类型
        dataTypes: ['String', 'Integer', 'Boolean', 'Long', 'UUID', 'Double'],

        // 编辑框

      actEdit: false,
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
          label_color: 'initial',
          main_fontColor: 'initial',
          main_color: 'initial',
          selectMulti: false,
          id: "",
          title: "对象选择",
          label: "",
          name: "",
          bindTargetClass: '',
          returnFormat: [],
          returnSelectFormat: [],
          displayFormat: [],
          browseAttributes: [],
          filterAttributes: [],
          remoted: false,
          groupName: null,
          required: false,
          readonly: false,
          hided: false,
          noNumber: true,
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
          events: [],
          eventRange: ["值变化", "鼠标悬停"],
          // 属性插件所需属性
          targetDataType: null,
        },
        browseList: [],
        trans_attributes: [],

        // 插件的字符串返回值，由回填格式定义
        selectedObject: null,
        // 所有的实体类数组，用于选择refClass
        allEntityClasses: [],
        allRelationClasses: [],
        // 所选的实体类的属性数组，用于选择browseAttribute，returnFormat，displayFormat
        refClassAttributes: [],
        refClassAttributes_sys: null,
        refClassAttributes_def: null,
        refClassAttributes_relationSys: null,
        refClassAttributes_relationDef: null,
        refClassAttributes_leftSys: null,
        refClassAttributes_leftDef: null,
        refClassAttributes_rightSys: null,
        refClassAttributes_rightDef: null,
        // 所选的实体类的对象数组
        objectList: [],
        // editFilterAttributes对话框flag
        showEditModal: false,
        // 用于辅助删除FilterAttributes
        filterAttributesIndex: 0,
        // 当前表单编辑对象
        formObject: {},

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
        loading: false,
      }
    },
    created() {
      this.$store = this.store;
      console.log(this.args.bindTargetClass)
      this.sys_relation_attributes = SYS_RELATION_ATTRIBUTES;
      this.sys_entity_attributes = SYS_ENTITY_ATTRIBUTES;
      let that = this;
      // // 缺省绑定类为当前表单目标类
      // if(this.args.bindTargetClass == '') {
      //   if(this.itemValue.data.isRelation) {
      //     this.args.bindTargetClass = this.itemValue.data.targetClass + '&r';
      //   } else {
      //     this.args.bindTargetClass = this.itemValue.data.targetClass + '&e';
      //   }
      // }
      this.initAttributes();
    },
    mounted() {
      // 初始化：获取所有实体类allEntityClasses以备选择
      if (this.t_preview) {
        // this.allEntityClasses = this.Entities().filter(x=> typeof x.className == "string");
        // this.allRelationClasses = this.Relations();
        console.log(this.args.bindTargetClass)
        // if(this.args.bindTargetClass && !/\&/.test(this.args.bindTargetClass)){
        //   this.args.bindTargetClass = this.allRelationClasses.filter(item => item.className === this.args.bindTargetClass).length === 0 ? this.args.bindTargetClass + '&e' : this.args.bindTargetClass + '&r'
        // }
        this.setHeight();
        this.freshData('');
      }
    },
    computed: {
      ...mapGetters("DWF_form", [
        "QueryResultAll"]
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
      colWidth() {
        return this.args.width + this.args.widthType;
        // return this.args.col ? parseInt(100 / this.args.cols) + "%" : "100%";
      },
      labelWidth() {
        return (!this.args.label || this.args.label == "") && this.args.required ? "10%" : parseInt(100 * this.args.label_width / (this.args.label_width + this.args.main_width)) + "%";
      },
      mainWidth() {
        return !this.args.label || this.args.label == "" ? (this.args.required ? "90%" : "100%") : parseInt(100 * this.args.main_width / (this.args.label_width + this.args.main_width)) + "%";
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
      // 需要用到实体类属性列表时使用
      arg_name() {
        return this.args.name;
      },

      filter_attributes() {
        return this.attributes ? (this.args.bindTargetClass.split('&')[1] == 'r' ?
          ["relation", this.attributes[1].filter(x => this.dataTypes.indexOf(x.valueType) > -1),
            this.attributes[2].filter(x => this.dataTypes.indexOf(x.valueType) > -1),
            this.attributes[3].filter(x => this.dataTypes.indexOf(x.valueType) > -1)] : this.attributes.filter(x => this.dataTypes.indexOf(x.valueType) > -1)) : [];
      },

      filter_refClassAttributes: function () {
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
        return this.args.targetDataType == null || this.refClassAttributes_leftSys == null? this.refClassAttributes_leftSys : (this.refClassAttributes_leftSys.filter(attr => attr.valueType === this.args.targetDataType)).concat(this.args.targetDataType == "String" ? (this.refClassAttributes_leftSys.filter(attr => attr.valueType === "UUID")) : []).concat(this.args.targetDataType == "UUID" ? (this.refClassAttributes_leftSys.filter(attr => attr.valueType === "String")) : []);
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

      // filter_selectClassAttributes: function () {
      //   return this.args.targetDataType == null ? this.refClassAttributes : (this.refClassAttributes.filter(attr => attr.valueType === this.args.targetDataType)).concat(this.args.targetDataType == "String" ? (this.refClassAttributes.filter(attr => attr.valueType === "UUID")) : []).concat(this.args.targetDataType == "UUID" ? (this.refClassAttributes.filter(attr => attr.valueType === "String")) : []);
      // }
      filter_selectClassAttributes: function () {
        return this.refClassAttributes;
      }
    },
    beforeDestroy() {
      if (this.timer) {
        clearInterval(this.timer);
        this.timer = null;
      }
      ;
      this.objectList = null;
      this.uidList = null;
    },
    watch: {
      'args.txt_bgColor'(val) {
        this.$refs.main.querySelectorAll('.i-input .ivu-select-selection') && this.$refs.main.querySelectorAll('.i-input .ivu-select-selection').length != 0
          ? this.$refs.main.querySelectorAll('.i-input .ivu-select-selection').forEach(item => {
            item.style.backgroundColor = val;
          })
          : '';
      },
      arg_height(val) {
        this.setHeight();
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
          if (this.args.bindTargetClass.split('&')[1] == 'r') {
            if (val.startsWith("left_")) this.args.label = (this.relation.leftRole != "" ? this.relation.leftRole : this.relation.leftClass) + "的" + this.attrMap[val].displayName;
            if (val.startsWith("right_")) this.args.label = (this.relation.rightRole != "" ? this.relation.rightRole : this.relation.rightClass) + "的" + this.attrMap[val].displayName;
            if (val.startsWith("relation_")) this.args.label = this.attrMap[val].displayName;
          } else this.args.label = this.attrMap[val].displayName;
        }else {
          this.args.targetDataType = null;
        }
      },

      'args.browseAttributes'(val) {
        this.args.returnSelectFormat = val;
      },

      'args.returnSelectFormat'(val) {
        this.initBrowseListData();
      },

      'args.returnFormat'(val) {
        this.initBrowseListData();
      },
      // 监听refClass的变化，调用API
      "args.bindTargetClass"(newRefClass, oldRefClass) {
        console.log(newRefClass, oldRefClass)
        if (!newRefClass || newRefClass == '' || newRefClass == undefined) {
          return;
        }
        let type = newRefClass.split('\&')[1];
        newRefClass = newRefClass.split('\&')[0];
        if(type == 'r'){
          let temReAttr = [];
          let temLAttr = [];
          let temRAttr = [];
          // this.resetAttribute();
          getRelation(newRefClass).then(response => {
            if(response.success) {
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
              if('rightClass' in res) {
                getEntity(res.rightClass).then(mes => {
                  if(mes.success) {
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
                  if(!this.firstload){
                    this.args.browseAttributes = [];
                    this.args.returnSelectFormat = [];
                    this.args.returnFormat = [];
                    this.firstload = false;
                  }
                  //未知原因导致关联类表单中浏览字段和点选后显示字段中选择两个字段，保存表单后刷新，结果输入框中只有一个字段
                  if(this.firstload){
                    this.args.browseAttributes = this.browseAttributesCache;
                    this.args.returnFormat = this.returnFormatCache;
                    this.firstload = false;
                  }
                }, 500)
              } else {
                this.$Message.warning(response.message);
              }
            }
          })
          this.queryData.relationClass = newRefClass;
          this.queryData.query.type = "relation";
        }else{
          // 获取RefClass的属性数组refClassAttributes
          getEntity(newRefClass)
          .then(res => {
            this.resetAttribute();
            this.refClassAttributes = res.data.attributes;
            this.refClassAttributes_sys = this.refClassAttributes.filter(item => SYS_ENTITY_ATTRIBUTES(item) !== -1);
            this.refClassAttributes_def = this.refClassAttributes.filter(item => SYS_ENTITY_ATTRIBUTES(item) === -1);
            if(!this.firstload){
              this.args.browseAttributes = [];
              this.args.returnSelectFormat = [];
              this.args.returnFormat = [];
            }
            //未知原因导致关联类表单中浏览字段和点选后显示字段中选择两个字段，保存表单后刷新，结果输入框中只有一个字段
            if(this.firstload){
              this.args.browseAttributes = this.browseAttributesCache;
              this.args.returnFormat = this.returnFormatCache;
              this.firstload = false;
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
        this.updateObjects();
      },
      "args.selectMulti"(val){
        if(val){
          this.args.remoted = false;
        }
      },
      "args.remoted"(val){
        if(val){
          this.args.selectMulti = false;
        }
      }
    },
    methods: {
      // ...mapActions("DWF_form", ["handleQueryData"]),

      resetAttribute(){
        this.refClassAttributes_sys = null;
        this.refClassAttributes_def = null;
        this.refClassAttributes_relationSys = null;
        this.refClassAttributes_relationDef = null;
        this.refClassAttributes_leftSys = null;
        this.refClassAttributes_leftDef = null;
        this.refClassAttributes_rightSys = null;
        this.refClassAttributes_rightDef = null;
      },

      async freshData(query){
        this.queryData.targetClass = this.args.bindTargetClass.split('\&')[0];
        if(!this.args.bindTargetClass) return;
        if(this.args.bindTargetClass.split('\&')[1] === 'r'){
          getRelation(this.queryData.targetClass).then(response => {
            if(response.success) {
              let relation = response.data;
              this.queryData.leftClass = relation.leftClass;
              this.queryData.rightClass = relation.rightClass;
              this.queryData.relationClass = relation.className;
              this.queryData.query.type = "relation";
            }
          })
        }
        this.queryData.query.query = '';
        this.queryData.query.startIndex = 0;
        this.queryData.query.pageSize = 3;
        this.updateObjects();
      },

      async initBrowseListData() {
        // 用于下拉框插件实际展示的对象数组，经过浏览字段与回填字段的格式转换
        // await this.handleQueryData(this.queryData);
        let className = this.args.bindTargetClass.split('&')[0];
        let classType = this.args.bindTargetClass.split('&')[1];
        let temList = [];
        if(classType == 'e') {
          temList = await getEobj(this.queryData.targetClass, {
            condition: this.queryData.query.query,
            startIndex: this.queryData.query.startIndex,
            pageSize: this.queryData.query.pageSize
          });
          this.objectList = temList.data.data;
        } else {
          temList = await getEJobj(this.queryData.targetClass, {
            condition: this.queryData.query.query,
            startIndex: this.queryData.query.startIndex,
            pageSize: this.queryData.query.pageSize
          });

          let transObj = [];
          if(temList.data.data.length > 0) {
            let obj = {};
            let rel = temList.data.data[1];
            let left = temList.data.data[0];
            let right = temList.data.data[2];

            rel.forEach((r, ind) => {

              let obj = {}
              for (var i in r) {
                obj["relation_" + i] = r[i];
              }
              for (var m in right[ind]) obj["right_" + m] = right[ind][m];
              for (var n in left[ind]) obj["left_" + n] = left[ind][n];

              transObj.push(obj);

            })

          }
          this.objectList = transObj;

        }

        this.browseList = this.objectList ? this.objectList.map(object => {
          return {
            // label:下拉框显示项
            slotLabel: this.args.browseAttributes.length !== 0 ?
              (this.args.browseAttributes.map(attr => {
                return object[attr];
              }).join("-"))
              : object.oid,
            // label:下拉框回填显示项
            label: this.args.returnSelectFormat.length !== 0 ?
              (this.args.returnSelectFormat.map(attr => {
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
        }) || [] : [];
      },

      async updateObjects() {
        await this.initBrowseListData();
        setTimeout(() => {
          this.setInheritStyle()
        }, 200);
      },

      setInheritStyle() {
        try {
          this.$refs.main.querySelector(".i-input .ivu-select-input").style.textAlign = 'center';
          
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
              item.style.backgroundColor = this.args.txt_bgColor;
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
          this.$refs.main.querySelectorAll('.i-input .ivu-select-placeholder') && this.$refs.main.querySelectorAll('.i-input .ivu-select-placeholder').length != 0
            ? this.$refs.main.querySelectorAll('.i-input .ivu-select-placeholder').forEach(item => {
              item.style.fontSize = 'inherit';
              item.style.color = '#c5c8ce';
              item.style.lineHeight = this.arg_height;
              item.style.height = this.arg_height;
            })
            : '';
          this.$refs.main.querySelectorAll('.i-input .ivu-select-selection') && this.$refs.main.querySelectorAll('.i-input .ivu-select-selection').length != 0
            ? this.$refs.main.querySelectorAll('.i-input .ivu-select-selection').forEach(item => {
              item.style.backgroundColor = this.args.txt_bgColor;
            })
            : '';
        } catch (e) {

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

      editBoxfreshAttr(args){
        this.attributes = args;
        this.initAttributes();
      },
      initAttributes(){
        console.log(this.attributes)
        if (this.attributes) {
          if (this.args.bindTargetClass.split('&')[1] == 'r') {
            this.attributes[1].forEach(x => this.attrMap['relation_' + x.attributeName] = x);
            this.attributes[2].forEach(x => this.attrMap['left_' + x.attributeName] = x);
            this.attributes[3].forEach(x => this.attrMap['right_' + x.attributeName] = x);

            this.trans_attributes = this.attributes[1];
            console.log(this.attributes)
          } else {
            this.attributes.forEach(x => this.attrMap[x.attributeName] = x);

            this.trans_attributes = this.attributes;
          }
        }
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
        //对以前refClass做兼容
        if(args.refClass && !this.args.bindTargetClass){this.args.bindTargetClass = args.refClass};
        this.firstload = true;
        this.browseAttributesCache = this.args.browseAttributes;
        this.returnFormatCache = this.args.returnFormat;
        return this;
      },

      // 获取表单项名
      getFormName() {
        return this.args.name;
      },

      getEditBoxComponent(){
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

      getDataType(args) {
        return this.dataTypes;
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


      // 当点击下拉框时，更新formObject，更新过滤属性
      handleDropDown(value) {
        console.log(value)
        // 弹出下拉框时，设置formObject，应用过滤效果
        // if (value) {
        //   let result = {};
        //   this.getAllElements(this.itemValue.data.elements).forEach(element => {
        //     result[element.getFormName()] = element.getValue ? element.getValue() :  null;
        //   });
        //   this.formObject = result;
        // }
        // // 收起下拉框时，清空formObject，取消过滤效果
        // else {
        //   // 为了显示效果需要延迟清空
        //   setTimeout(() => {
        //     this.formObject = {};
        //   }, 250);
        // }
      },

      // 找出当前itemValue中所有groupName相同的组件对象
      // 前提要求：引用类名也相同
      traversalJson(json) {
        let result = [];
        for (var element of json) {
          (element.self.properties.groupName === this.args.groupName) &&
          (element.self.properties.refClass === this.args.bindTargetClass) ?
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
        // 清空操作
        setTimeout(() => {
          this.setInheritStyle()
        }, 100);
        if (!value) {
          console.log("value == undefined");
          return;
        }
        // 筛选出当前联动对象groupObject
        // TODO: 筛选的有点粗糙，感觉不太对劲儿
        // let groupObject = this.browseList.filter(item => {
        //   return item.value === value
        // })[0].object;
        // 联动同组元素
        // this.getGroupElements().forEach(item => {
        //   item.setGroupObject(groupObject);
        // });
      },

      async remoteMethod(query) {
        if (query && query.trim() !== '') {
          let queryPart = ``;//最终query前半部
          let queryContent = ``;//最终query后半部
          let queryContentArray = query.split('-');
          if(queryContentArray.length === 1){
            for(let [index, returnSelectFormat] of this.args.returnSelectFormat.entries()){
              if(index === 0){
                queryContent = `cast(obj.${returnSelectFormat} as text) like '%${queryContentArray[0] || ''}%'`;
              }else{
                queryContent += ` or cast(obj.${returnSelectFormat} as text) like '%${queryContentArray[0] || ''}%'`;
              }
            }
            this.queryData.query.query = `and (${queryContent})`;
          }else{
            for(let [index, returnSelectFormat] of this.args.returnSelectFormat.entries()){
              if(index === 0){
                queryPart = `(cast(obj.${returnSelectFormat} as text)`;
                queryContent = `'%${queryContentArray[0] || ''}%`;
              }else{
                queryPart += ` || '-' || cast(obj.${returnSelectFormat} as text)`;
                queryContent += `-%${queryContentArray[index] || ''}%`;
              }
              if (index == this.args.returnSelectFormat.length -1){
                queryPart += `)`;
                queryContent += `'`;
              }
            }
            this.queryData.query.query = `and ${queryPart} like ${queryContent}`;
          }
          await this.initBrowseListData();
        } else if(typeof query !== 'undefined' && query === ''){
          this.queryData.query.query = '';
          await this.initBrowseListData();
        }
      },
      // 接受同联动组组件传来联动对象，根据自身情况修改组件返回值
      setGroupObject(object) {
        this.selectedObject = this.args.returnFormat.length !== 0 ?
          (this.args.returnFormat.map(attr => {
            return object[attr];
          }).join("-"))
          : object.oid;
      },
    }
  }
</script>


<style scoped>
  /*
      插件的css部分
      设置display为inline，默认不换行
      scoped表示样式仅在该vue文件内有效
  */
  section {
    display: inline-block;
    width: 100%
  }

  .margin1 {
    margin-top: 5px;
    margin-bottom: 5px;
  }
</style>
<style>
  .singleObjectSelectConfig button.ivu-btn.ivu-btn-text.ivu-btn-large{
    display: none;
  }
</style>
