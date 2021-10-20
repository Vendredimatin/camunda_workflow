<template>
  <section :addinName="name" ref="main" :style="{'width': colWidth}">
    <!-- 使用v-if,v-else-if语句来设置插件的显示样式 -->
    <span v-if="t_preview">

            <!-- label标签 -->
            <Row class="seach-wrap" :gutter="16">
                <Col span="19" ref="attrWrap"
                     style="min-height: 50px; height: auto;display: flex; align-items: center; flex-wrap: wrap;">
                    <!-- <label v-if="args.label">{{ args.label }}:    </label>
                    <Input prefix="ios-contact" placeholder="Preview Mode" style="width: auto;" /> -->
                </Col>
                <Col span="5">
                    <Button class="searchBtn" type="info" style="margin-right: 5px;">{{ args.buttonTxt }}</Button>
                    <Button class="searchBtn">{{ args.buttonReset }}</Button>
                </Col>
            </Row>


      <!-- 预览模式时，有编辑框的显示；ref属性用于获取指定的dom元素，如ref="x",则在script中用this.$refs.x来选中该dom元素 -->
            <slot name="widget"></slot>
            <span v-show="t_edit" ref="edit">
                <EditBox v-if="actEdit" :addinName="name" :widgetAnnotation="widgetAnnotation"
                         :editExtendInfo="editExtendInfo" ref="editbox" v-model="args"
                         :itemValue="itemValue"
                         :router="router"
                         :store="store"
                         :route="route"
                         :root="root"
                         :query_oprs="query_oprs"
                         :targetclass="itemValue.data.targetClass">
                    <div slot="attribute">
                        <Form :label-width="80">
                            <Row class="margin1">
                                <Col span="20">
                                    <p>控制控件:</p>
                                </Col>
                                <Col span="4">
                                    <Button type="default" size="small" shape="circle" icon="md-sync"
                                            @click="freshTable"></Button>
                                </Col>
                            </Row>
                            <Select class="margin1" v-model="args.chooseTable" multiple>
                                <Option v-for="item in tableList" :value="item.value" :key="item.value">{{
                                    item.label
                                  }}</Option>
                            </Select>

                            <Button class="margin1" type="primary" @click="queryModal" long
                                    :loading="spinShow">查询条件配置</Button>
                            <Button class="margin1" type="primary" @click="resetWrap" long>清空查询框</Button>
                            <Button class="margin1" type="primary" @click="testQueryButton" long>测试图表联动</Button>
                          <!-- <Button class="self-btn margin1" type="primary" @click="selfSet" long>自定义条件配置</Button> -->
                        </Form>
                    </div>
                    <div slot="layout">
                        <Row class="margin1">
                            <Col span="20">
                                <p>单元宽度</p>
                            </Col>
                            <Col span="4">
                                <Button shape="circle" icon="ios-refresh" size="small" @click="confirmDom"></Button>
                            </Col>
                        </Row>
                        <Input v-model="args.unitInputWidth" type="number">
                            <span slot="append">%</span>
                        </Input>
                    </div>
                    <div slot="operation">
                    </div>
                </EditBox>
            </span>


        </span>

    <section v-else :addinName="name" style="text-align: center">
            <span style="text-align:center">
            <div class="form-addin-icon">
                <i class="iconfont">&#xe646;</i>
                </div>
                <div class="form-addin-name">
                    查询框
                </div>
            </span>
    </section>

    <!-- 属性弹窗 -->
    <Modal
      v-model="showQuery"
      title="查询条件配置"
      width="66%"
      class="query-modal">
      <div style="border-bottom: 1px solid #e9e9e9;padding-bottom:6px;margin-bottom:6px;">
        选择属性:
        <CheckboxGroup v-model="checkClassGroup" @on-change="checkAllGroupChange">
          <Checkbox v-for="item in classGroup" :label="item.label"></Checkbox>
        </CheckboxGroup>
      </div>
      <Table border ref="attrTable" height="450" :columns="columnsAttr" :data="args.dataAttr"
             @on-selection-change="changeAttr" @on-select="chooseAttr" @on-select-cancel="cancelAttr"
             @on-select-all-cancel="cancelChooseAttrAll"
             @on-row-dblclick="checkSelect" @on-select-all="chooseAttrAll"></Table>
      <!--            <Spin size="large" fix v-if="spinShow"></Spin>-->
      <div slot="footer">
        <Button type="text" @click="cancelQuery">取消</Button>
        <Button type="primary" @click="confirmQuery">确认</Button>
        <!-- <Poptip
        v-show="showPop"
        confirm
        title="您已取消选择任何属性, 该操作即将清空条件框原有配置, 是否确定?"
        style="text-align: left;"
        @on-ok="confirmEmpty"
        @on-cancel="cancelEmpty">
            <Button type="primary" @click="confirmQuery">确认</Button>
        </Poptip> -->
      </div>
    </Modal>

    <!-- 多对象选择框定制弹窗 -->
    <Modal
      v-model="showObjModal"
      title="对象选择配置">
      <p class="margin1">引用类</p>
      <Select ref="selectGoal" v-model="bindTargetClass" filterable clearable @on-change="bindTargetClassChanged"
              @on-clear="bindTargetClassClear">
        <OptionGroup label="实体类">
          <Option v-for="item in entitiesList" :value="item.value" :key="item.id" :label="item.label">
            <span>{{ item.label }}</span>
            <span style="float:right;color:#ccc">{{ item.value.split('\&')[0] }}</span>
          </Option>
        </OptionGroup>
        <OptionGroup label="关联类">
          <Option v-for="item in relationsList" :value="item.value" :key="item.id" :label="item.label">
            <span>{{ item.label }}</span>
            <span style="float:right;color:#ccc">{{ item.value.split('\&')[0] }}</span>
          </Option>
        </OptionGroup>
      </Select>
      <p class="margin1">浏览字段</p>
      <Select class="margin1" v-model="browseAttributes" filterable multiple>
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
      <Select class="margin1" v-model="returnFormat" filterable :multiple="currentObj.noNumber">
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
      <div slot="footer">
        <Button type="text" @click="cancelObj">取消</Button>
        <Button type="primary" @click="confirmObj">确认</Button>
      </div>
    </Modal>

  </section>
</template>

<script>
/*
    插件的js部分
    如果有引用依赖等，在export default 之前进行引用
*/
import EditBox from "./_EditBox.vue"
import {getAllEntities, getAllRelations} from '@/api/others.js';
import {mapGetters} from "vuex";
import {getEntity} from "@/api/data-model/EntityModeling";
import {getRelation} from '@/api/data-model/RelationModeling';
import '@/styles/component/iconfont.css';
import {getAddinFunc} from "@/util/addin.js";
import {SYS_ENTITY_ATTRIBUTES, SYS_RELATION_ATTRIBUTES} from '@/libs/utils.js';
import _ from "lodash";
const name = "SearchBox";
export default {
  // 插件名
  name: name,
  // 属性值传入
  props: ["argsProps", "widgetAnnotation", "editExtendInfo", 'itemValue', "query_oprs", "route", "router", "root", "store", 'Message', "relation"],
  components: {
    EditBox
  },
  // 插件的数据逻辑，插件的属性在data中定义，用在js中用this.xxx进行访问
  data() {
    let _self = this;
    return {
      // 插件名
      name: name,
      // 展示模式
      t_preview: true,
      t_edit: false,
      actEdit: false,
      // 支持的数据类型
      dataTypes: ['String', 'Integer', 'Boolean', 'Long', 'UUID', 'Date', 'Double', 'Clob', 'TimeStamp'],
      bindTargetClass: '',
      refClassAttributes: [],
      refClassAttributes_sys: null,
      refClassAttributes_def: null,
      refClassAttributes_relationSys: null,
      refClassAttributes_relationDef: null,
      refClassAttributes_leftSys: null,
      refClassAttributes_leftDef: null,
      refClassAttributes_rightSys: null,
      refClassAttributes_rightDef: null,
      browseAttributes: [],
      returnFormat: [],
      currentObj: {},
      currentIndex: 0,
      entitiesList: [],
      relationsList: [],
      structuralLayoutAddin: ['TextInput', 'HyperLink', 'NumberInput', 'DateInput', 'CheckBox', 'RadioButton', 'Label', 'Switch', 'SelectInput', 'SelectSInput  ', 'SingleObjectSelector', 'SingleObjectModal', 'MultiObjectsTag', 'ProgressBar', 'D_Rate', 'Liked', 'icon', 'DynamicParameterFrame', 'MultiFilesList', 'Attachments'], //允许垂直布局的控件，为之前做兼容
      // 编辑框
      args: {
        width: 100,
        widthType: '%',
        title: '查询框',
        id: null,
        labelDisabled: false,
        style: "",
        targetDataType: null,
        buttonTxt: '查询',
        buttonReset: '重置',
        unitInputWidth: 33,
        readonly: false, // 是否只读
        hided: false,
        events: [],
        eventRange: ["值变化"],
        selectAttr: [],
        chooseTable: [],      // 所选的控制表格
        oldChooseTable: [],
        dataAttr: []
      },
      basicArgs: {
        label_width: 2,
        main_width: 3,
        label_align: 4,
        main_align: 4,
        basic_height: 30,
        cols: 3
      },
      tableList: [],
      tableMap: {},
      showQuery: false,
      spinShow: false,
      // 该flag代表, 用户定制搜索框后去掉所有勾选 给他个警告即将清空所有配置的属性控件
      showPop: false,
      showObjModal: false,
      checkClassGroup: [],
      classGroup: [],
      classIndex: {},
      classAttr: {},
      attrMap: {},
      queryAttr: [],
      domMap: {},
      attrItems: [
        {
          value: 'TextInput',
          label: '普通文本框'
        },
        {
          value: 'NumberInput',
          label: '数字文本框'
        },
        {
          value: 'NumbersInput',
          label: '数字范围选择框',
        },
        {
          value: 'DateInput',
          label: '日期选择框'
        },
        {
          value: 'DateSInput',
          label: '日期范围选择框'
        },
        {
          value: 'SelectInput',
          label: '选择框(单选)'
        },
        {
          value: 'SelectMutiInput',
          label: '选择框(多选)'
        },
        {
          value: 'DSelectInput',
          label: '动态选择框',
        },
        {
          value: 'SingleObjectSelectors',
          label: '对象选择框'
        },
        {
          value: 'Switch',
          label: '布尔选择框'
        }
      ],
      columnsAttr: [
        {
          type: 'selection',
          width: 60,
          align: 'center'
        },
        {
          title: '所属类',
          key: 'belongClass',
          width: 200,
          tooltip: true,
          align: 'center'
        },
        {
          title: '属性名',
          key: 'attrName',
          width: 200,
          tooltip: true,
          align: 'center'
        },
        {
          title: '顺序',
          width: 100,
          key: 'attrNum',
          align: 'center',
          render: (h, params) => {
            return h('Input', {
              props: {
                type: 'Number',
                value: this.args.dataAttr[params.index].attrNum == undefined ? 99 : this.args.dataAttr[params.index].attrNum
              },
              on: {
                'on-change': (event) => {
                  params.row.attrNum = event.target.value;
                  // this.classAttr[params.row.className][params.row.index].attrNum = event.target.value;
                },
                'on-blur': () => {
                  // this.classAttr[params.row.className][params.row.index].attrNum = params.row.attrNum;
                  if (params.row.className === '_all') {
                    this.classAttr[params.row.className][params.row._index].attrNum = params.row.attrNum;
                  } else {
                    this.classAttr[params.row.className][params.row.index].attrNum = params.row.attrNum;
                  }
                }
              }
            })
          }
        },
        {
          title: '标签',
          key: 'label',
          width: 200,
          align: 'center',
          render: (h, params) => {
            return h('Input', {
              props: {
                value: this.args.dataAttr[params.index].label,
              },
              on: {
                'on-change': (event) => {
                  params.row.label = event.target.value;
                  // this.classAttr[params.row.className][params.row.index].label = event.target.value;
                },
                'on-blur': () => {
                  console.log('label blur', params.row);
                  this.classAttr[params.row.className][params.row.index].label = params.row.label;
                },
              }
            })
          }
        },
        {
          title: '显示类型',
          width: 200,
          key: 'attrType',
          align: 'center',
          render: (h, params) => {
            return h('Select', {
                props: {
                  transfer: true,
                  value: this.args.dataAttr[params.index].attrType
                },
                on: {
                  'on-change': (value) => {
                    console.log(value, params.row, this.classAttr[params.row.className]);
                    params.row['attrType'] = value;
                    if (params.row.className == '_all') {
                      let temAttr = this.classAttr[params.row.className];
                      for (let i = 0; i < temAttr.length; i++) {
                        if ((temAttr[i].index == params.row.index) && (temAttr[i].label == params.row.label)) {
                          temAttr[i].attrType = value;
                          temAttr[i].defaultValue = '';
                          break;
                        }
                      }
                      console.log(this.classAttr[params.row.className])
                      // this.classAttr[params.row.className][params.index]['attrType'] = value;
                      this.classAttr[params.row.className][params.index].defaultValue = '';
                    } else {
                      this.classAttr[params.row.className][params.row.index]['attrType'] = value;
                      this.classAttr[params.row.className][params.row.index].defaultValue = '';
                    }
                  },
                  // 'on-blur': () => {
                  //     console.log('type blur', params.row);
                  //     this.classAttr[params.row.className][params.row.index].attrType = params.row.attrType;
                  // },
                }
              },
              this.attrItems.map((item) => {
                return h('Option', {
                  props: {
                    value: item.value,
                    label: item.label
                  }
                })
              })
            )
          }
        },
        {
          title: '配置参数',
          width: 200,
          key: 'defaultValue',
          align: 'center',
          render: (h, params) => {
            return h('Input', {
              props: {
                value: this.args.dataAttr[params.index].defaultValue,
                disabled: this.args.dataAttr[params.index].attrType != 'SelectInput' && this.args.dataAttr[params.index].attrType != 'SelectMutiInput' && this.args.dataAttr[params.index].attrType != 'SingleObjectSelectors'
              },
              on: {
                'on-focus': (event) => {
                  params.row.defaultValue = event.target.value;
                  console.log(event.target.value, params.row.attrType);
                  if (params.row.attrType == 'SingleObjectSelectors') {
                    this.currentIndex = params.index;
                    let dType = this.args.dataAttr[this.currentIndex].valueType;
                    let dVal = this.args.dataAttr[this.currentIndex].defaultValue;
                    if (dType == 'Double' || dType == 'Integer' || dType == 'Long') {
                      this.args.dataAttr[params.index]['noNumber'] = false;
                      // this.returnFormat = '';
                    } else {
                      this.args.dataAttr[params.index]['noNumber'] = true;
                      // this.returnFormat = [];
                    }
                    if (dVal != '' && dVal != undefined) {
                      let resultArr = JSON.parse(dVal);
                      console.log(resultArr, resultArr.extendAttr, resultArr.extendReturnAttr)
                      this.bindTargetClass = resultArr.extendClass;
                      this.$nextTick(() => {
                        this.browseAttributes = resultArr.extendAttr;
                        this.returnFormat = resultArr.extendReturnAttr;
                        console.log(this.browseAttributes, this.returnFormat)
                      })
                    } else {
                      this.bindTargetClass = '';
                      this.browseAttributes = [];
                      if (this.args.dataAttr[params.index]['noNumber'] == true) {
                        this.returnFormat = []
                      } else {
                        this.returnFormat = '';
                      }
                    }
                    this.currentObj = this.args.dataAttr[params.index];
                    console.log(this.currentObj, this.currentObj.index, params.index);
                    this.showObjModal = true;
                  } else {
                    this.showObjModal = false;
                  }
                  // this.classAttr[params.row.className][params.row.index].defaultValue = event.target.value;
                },
                'on-change': (event) => {
                  console.log(event.target.value)
                  params.row.defaultValue = event.target.value;
                  // this.classAttr[params.row.className][params.row.index].defaultValue = event.target.value;
                },
                'on-blur': () => {
                  console.log("value blur", params.row, params.index);
                  if (params.row.className == '_all') {
                    let temAttr = this.classAttr[params.row.className];
                    for (let i = 0; i < temAttr.length; i++) {
                      if ((temAttr[i].index == params.row.index) && (temAttr[i].label == params.row.label)) {
                        temAttr[i].defaultValue = params.row.defaultValue;
                        break;
                      }
                    }
                    // this.classAttr[params.row.className][params.index].defaultValue = params.row.defaultValue;
                  } else {
                    this.classAttr[params.row.className][params.row.index].defaultValue = params.row.defaultValue;
                  }
                },
              }
            })
          }
        }
      ],
    }
  },
  computed: {
    ...mapGetters("DWF_form", ["Entities", "Relations"]),
    filter_attributes() {
      return this.attributes ? this.attributes.filter(x => this.dataTypes.indexOf(x.valueType) > -1) : [];
    },
    colWidth() {
      return this.args.width + this.args.widthType;
    },
    filter_refClassAttributes_sys: function () {
      return this.currentObj.valueType == null || this.refClassAttributes_sys == null ? this.refClassAttributes_sys : (this.refClassAttributes_sys.filter(attr => attr.valueType === this.currentObj.valueType)).concat(this.currentObj.valueType == "String" ? (this.refClassAttributes_sys.filter(attr => attr.valueType === "UUID")) : []).concat(this.currentObj.valueType == "UUID" ? (this.refClassAttributes_sys.filter(attr => attr.valueType === "String")) : []);
    },
    filter_refClassAttributes_def: function () {
      return this.currentObj.valueType == null || this.refClassAttributes_def == null ? this.refClassAttributes_def : (this.refClassAttributes_def.filter(attr => attr.valueType === this.currentObj.valueType)).concat(this.currentObj.valueType == "String" ? (this.refClassAttributes_def.filter(attr => attr.valueType === "UUID")) : []).concat(this.currentObj.valueType == "UUID" ? (this.refClassAttributes_def.filter(attr => attr.valueType === "String")) : []);
    },
    filter_refClassAttributes_relationSys: function () {
      return this.currentObj.valueType == null || this.refClassAttributes_relationSys == null ? this.refClassAttributes_relationSys : (this.refClassAttributes_relationSys.filter(attr => attr.valueType === this.currentObj.valueType)).concat(this.currentObj.valueType == "String" ? (this.refClassAttributes_relationSys.filter(attr => attr.valueType === "UUID")) : []).concat(this.currentObj.valueType == "UUID" ? (this.refClassAttributes_relationSys.filter(attr => attr.valueType === "String")) : []);
    },
    filter_refClassAttributes_relationDef: function () {
      return this.currentObj.valueType == null || this.refClassAttributes_relationDef == null ? this.refClassAttributes_relationDef : (this.refClassAttributes_relationDef.filter(attr => attr.valueType === this.currentObj.valueType)).concat(this.currentObj.valueType == "String" ? (this.refClassAttributes_relationDef.filter(attr => attr.valueType === "UUID")) : []).concat(this.currentObj.valueType == "UUID" ? (this.refClassAttributes_relationDef.filter(attr => attr.valueType === "String")) : []);
    },
    filter_refClassAttributes_leftSys: function () {
      return this.currentObj.valueType == null || this.refClassAttributes_leftSys == null ? this.refClassAttributes_leftSys : (this.refClassAttributes_leftSys.filter(attr => attr.valueType === this.currentObj.valueType)).concat(this.currentObj.valueType == "String" ? (this.refClassAttributes_leftSys.filter(attr => attr.valueType === "UUID")) : []).concat(this.currentObj.valueType == "UUID" ? (this.refClassAttributes_leftSys.filter(attr => attr.valueType === "String")) : []);
    },
    filter_refClassAttributes_leftDef: function () {
      return this.currentObj.valueType == null || this.refClassAttributes_leftDef == null ? this.refClassAttributes_leftDef : (this.refClassAttributes_leftDef.filter(attr => attr.valueType === this.currentObj.valueType)).concat(this.currentObj.valueType == "String" ? (this.refClassAttributes_leftDef.filter(attr => attr.valueType === "UUID")) : []).concat(this.currentObj.valueType == "UUID" ? (this.refClassAttributes_leftDef.filter(attr => attr.valueType === "String")) : []);
    },
    filter_refClassAttributes_rightSys: function () {
      return this.currentObj.valueType == null || this.refClassAttributes_rightSys == null ? this.refClassAttributes_rightSys : (this.refClassAttributes_rightSys.filter(attr => attr.valueType === this.currentObj.valueType)).concat(this.currentObj.valueType == "String" ? (this.refClassAttributes_rightSys.filter(attr => attr.valueType === "UUID")) : []).concat(this.currentObj.valueType == "UUID" ? (this.refClassAttributes_rightSys.filter(attr => attr.valueType === "String")) : []);
    },
    filter_refClassAttributes_rightDef: function () {
      return this.currentObj.valueType == null || this.refClassAttributes_rightDef == null ? this.refClassAttributes_rightDef : (this.refClassAttributes_rightDef.filter(attr => attr.valueType === this.currentObj.valueType)).concat(this.currentObj.valueType == "String" ? (this.refClassAttributes_rightDef.filter(attr => attr.valueType === "UUID")) : []).concat(this.currentObj.valueType == "UUID" ? (this.refClassAttributes_rightDef.filter(attr => attr.valueType === "String")) : []);
    },
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
    }
  },
  mounted() {
    let that = this;
    if (this.t_preview) {
      this.entitiesList = [];
      this.relationsList = [];
      let allEn = this.Entities();
      let allRe = this.Relations();
      if (allEn && allEn.length > 0) {
        allEn.forEach((val) => {
          let eachItem = {
            value: val.className + "&e",
            label: val.displayName,
            id: val.id
          };
          this.entitiesList.push(eachItem);
        });
      } else {
        this.getErrorIDBEn();
      }
      // 关联类
      if (allRe && allRe.length > 0) {
        allRe.forEach((val) => {
          let eachItem = {
            value: val.className + "&r",
            label: val.displayName,
            id: val.id
          };
          this.relationsList.push(eachItem);
        });
      } else {
        this.getErrorIDBRe();
      }
      console.log(this.args.selectAttr, this.classIndex, this.args.dataAttr);
      if (this.args.chooseTable.length > 0) {
        setTimeout(() => {
          that.freshTable();
          that.confirmDom();
          that.freshInterval();
        }, 300);
      } else {
        that.freshTable();
      }
    }
    // else if (this.t_show) {
    //     that.confirmDom();
    //     setTimeout(() => {
    //         that.freshTable();
    //     }, 300);
    // }
  },
  watch: {
    bindTargetClass(newRefClass, oldRefClass) {
      console.log(newRefClass)
      if (!newRefClass) {
        this.browseAttributes = [];
        if (this.currentObj.noNumber) {
          this.returnFormat = [];
        } else {
          this.returnFormat = '';
        }
        return;
      }
      let type = newRefClass.split('&')[1];
      newRefClass = newRefClass.split('&')[0];
      console.log(newRefClass)
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
              }, 500)
            } else {
              this.$Message.warning(response.message);
            }
          }
        })
      } else {
        // 获取RefClass的属性数组refClassAttributes
        getEntity(newRefClass)
          .then(res => {
            console.log(res)
            this.resetAttribute();
            this.refClassAttributes = res.data.attributes;
            this.refClassAttributes_sys = this.refClassAttributes.filter(item => SYS_ENTITY_ATTRIBUTES(item) !== -1);
            this.refClassAttributes_def = this.refClassAttributes.filter(item => SYS_ENTITY_ATTRIBUTES(item) === -1);
            if (newRefClass == 'User') {
              this.refClassAttributes_def = this.refClassAttributes_def.filter(item => ['isFrozen', 'password', 'expiredTime'].indexOf(item.attributeName) === -1)
            }
          })
          .catch(error => {
            console.log(error)
          });
      }
    },
  },
  // 定义组件的函数接口
  methods: {
    // getAttrItem(params, h){
    //   if(params.row.belongClass.substring(0,4) === "重复属性"){
    //     return this.attrItems.filter(x => x.value !== 'DSelectInput').map((item) => {
    //       return h('Option', {
    //         props: {
    //           value: item.value,
    //           label: item.label
    //         }
    //       })
    //     })
    //   }else{
    //     return this.attrItems.map((item) => {
    //       return h('Option', {
    //         props: {
    //           value: item.value,
    //           label: item.label
    //         }
    //       })
    //     })
    //   }
    // },
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
    // 清空查询框
    resetWrap() {
      let wrapBox = this.$refs.attrWrap.$el;
      if (wrapBox) {
        for (var i = wrapBox.children.length; i > 0; i--) {
          wrapBox.removeChild(wrapBox.children[i - 1]);
        }
      }
    },
    // IDB连接打开失败 api拉取数据
    getErrorIDBEn() {
      this.entitiesList = [];
      let promiseE = new Promise((resolve, reject) => {
        getAllEntities({needOperationCount: false})
          .then(response => {
            let res = response.data;
            resolve(res);
            if (!res.success) {
              const title = "提示";
              const content = "<p>服务器繁忙, 实体类列表获取失败请稍后再试～</p>";
              this.$Modal.warning({
                title: title,
                content: content
              });
            } else {
              res.data.forEach((val, index, val_arr) => {
                let eachItem = {
                  value: val.className + "&e",
                  label: val.displayName,
                  id: val.id
                };
                this.entitiesList.push(eachItem);
              });
            }
          })
          .catch(e => {
            console.log(e);
            reject(e);
          });
      })
    },
    getErrorIDBRe() {
      this.relationsList = [];
      // 关联类
      let promiseRe = new Promise((resolve, reject) => {
        getAllRelations()
          .then(response => {
            let res = response.data;
            resolve(res);
            if (!res.success) {
              const title = "提示";
              const content = "<p>服务器繁忙, 关联类列表获取失败请稍后再试～</p>";
              this.$Modal.warning({
                title: title,
                content: content
              });
            } else {
              res.data.forEach((val, index, val_arr) => {
                let eachItem = {
                  value: val.className + "&r",
                  label: val.displayName,
                  id: val.id
                };
                this.relationsList.push(eachItem);
              });
            }
          })
          .catch(e => {
            console.log(e);
            reject(e);
          });
      })
    },
    freshInterval() {
      let that = this;
      setTimeout(() => {
        let flag = false;
        that.args.chooseTable.forEach(x => {
          var attrMap = that.tableMap[x].getAttrMap();
          attrMap.forEach(y => {
            if (y.attributes == undefined) flag = true;
          })
        });
        console.log(flag)
        if (flag) that.freshInterval();
        else {
          that.freshClassAttr();
          that.args.selectAttr.forEach(x => {
            let temData = that.args.dataAttr;
            for (let i = 0; i < temData.length; i++) {
              if ((temData[i].className == x.className) && (temData[i].attrName == x.attrName)) {
                temData[i].label = x.label;
                temData[i].attrType = x.attrType;
                temData[i].attrNum = x.attrNum == undefined ? 99 : x.attrNum;
                temData[i].defaultValue = x.defaultValue;
                if (x._checked) {
                  temData[i]._checked = true;
                  if (x.className == "_all") {
                    that.updateAttrConflict(x);
                  }
                }
                break;
              }
            }
            // that.args.dataAttr[that.classIndex[x.className] + x.index].label = x.label;
            // that.args.dataAttr[that.classIndex[x.className] + x.index].attrType = x.attrType;
            // that.args.dataAttr[that.classIndex[x.className] + x.index].attrNum = x.attrNum == undefined ? 99 : x.attrNum;
            // that.args.dataAttr[that.classIndex[x.className] + x.index].defaultValue = x.defaultValue;
            // if (x._checked) {
            //     that.args.dataAttr[that.classIndex[x.className] + x.index]._checked = true;
            //     if (x.className == "_all") {
            //         that.updateAttrConflict(x);
            //     }
            // }
          });
        }
      }, 300);
    },
    updateAttrConflict(row) {
      // console.log("conflict:", row.attrName, row._checked, this.classIndex, this.attrMap[row.attrName.substring(0, row.attrName.indexOf("&"))], this.args.dataAttr);
      // let that = this;
      // this.attrMap[row.attrName.substring(0, row.attrName.indexOf("&"))].forEach(x => {
      //   that.args.dataAttr[that.classIndex[x.className] + x.index]._disabled = row._checked;
      // });
    },
    freshClassAttr() {
      let that = this;
      if (that.classAttr._all) delete that.classAttr._all;
      that.attrMap = {};
      that.classGroup = [];
      var classMap = {};
      that.args.oldChooseTable = [];
      let targetTable = that.args.chooseTable.length !== 0 ? that.args.chooseTable[0] : '';
      if(targetTable){
        that.args.oldChooseTable = _.cloneDeep(that.args.chooseTable);
        var attrMap = that.tableMap[targetTable].getAttrMap();
        console.log("test:", attrMap);
        attrMap.forEach((y, ind) => {
          // if (y.className in classMap) return;
          if (attrMap.length > 1) {
            if (ind == 0) {
              y.className = `left_${y.className}`;
              y.displayName = `左${y.displayName}`;
            } else if (ind == 1) {
              y.className = `right_${y.className}`;
              y.displayName = `右${y.displayName}`;
            }
          }
          that.classGroup.push({
            className: y.className,
            displayName: y.displayName,
            label: `${y.className}(${y.displayName})`
          });
          classMap[y.className] = 1;
          var flag = true;
          // if (y.className in that.classAttr) flag = false;
          if (flag) that.classAttr[y.className] = [];
          console.log(y.className);
          if (y.attributes != undefined) {
            y.attributes.forEach((z, index) => {
              if (flag)
                that.classAttr[y.className].push({
                  belongClass: `${y.className}(${y.displayName})`,
                  attrName: `${z.attributeName}&${z.displayName}`,
                  attrType: 'TextInput',
                  valueType: z.valueType,
                  defaultValue: '',
                  index: index,
                  attrNum: z.order,
                  className: y.className,
                  label: `${y.displayName}.${z.displayName}`,
                })
              if (!(z.attributeName in that.attrMap)) {
                that.attrMap[z.attributeName] = []
              } else if (that.attrMap[z.attributeName].length == 1) {
                if (!("_all" in that.classAttr)) {
                  that.classAttr._all = [];
                }
                that.classAttr._all.push({
                  belongClass: "",
                  attrName: `${z.attributeName}&${z.displayName}`,
                  attrType: 'TextInput',
                  valueType: z.valueType,
                  defaultValue: '',
                  index: index,
                  attrNum: z.order,
                  className: "_all",
                  label: z.displayName,
                })
              }
              that.attrMap[z.attributeName].push({className: y.className, index: index});
            });
          }
        });
      }
      if (that.classAttr._all) {
        that.classAttr._all.forEach(x => {
          var belongClass = "重复属性(";
          that.attrMap[x.attrName.substring(0, x.attrName.indexOf("&"))].forEach(y => {
            belongClass += y.className + ",";
          })
          belongClass = belongClass.substring(0, belongClass.length - 1) + ")";
          x.belongClass = belongClass;
        });
        that.classGroup.splice(0, 0, {
          className: "_all", displayName: "重复属性", label: "重复属性"
        });
      }
      that.checkClassGroup = [];
      that.args.dataAttr = [];
      that.classGroup.forEach(x => {
        that.classIndex[x.className] = that.args.dataAttr.length;
        that.checkClassGroup.push(x.label);
        that.args.dataAttr = that.args.dataAttr.concat(that.classAttr[x.className]);
      });
    },
    freshTable() {
      this.tableList = this.getTables(this.itemValue.data);
      this.tableMap = {};
      let that = this;
      this.tableList.forEach(x => {
        that.tableMap[x.value] = x.obj;
      })
      this.args.chooseTable = _.intersection(this.args.chooseTable, this.tableList.map(x => x.value))
      // this.freshClassAttr();
    },
    getTables(node) {
      var res = [];
      let controlAddin = ['addin_Grid', 'addin_FormEngine', 'addin_SimpleTable'];
      if (node.obj && (node.obj.getSelected && controlAddin.includes(node.self.elementType)|| node.self.elementType == 'addin_FormEngine')) {

        res.push({
          obj: node.obj,
          label: node.self.properties.id,
          value: node.self.properties.id
        });
      }
      if (node.elements) {
        for (var i = 0; i < node.elements.length; i++) {
          res = res.concat(this.getTables(node.elements[i]));
        }
      }
      return res;
    },
    getCharts(node) {
      let result = [];
      let that = this;
      for (var element of node) {
        if (element.obj.refreshChart != null) result.push(element.obj);
        else result = result.concat(that.getCharts(element.elements));
      }
      return result;
    },
    async testQueryButton() {
      let oprAttr = null;
      if (this.vChange) {
        oprAttr = await this.invokeOperation(this.vChange.opr_type, this.vChange.opr_path, this.itemValue, this.store);
        console.log(oprAttr);
      }
      let that = this;
      this.queryAttr.forEach(x => {
        var _id = x.className;
        if (x.belongClass.substring(0, 4) == "重复属性") _id = "_all";
        _id += "&" + x.index;
        x.value = that.domMap[_id].getValue();
        console.log("getValue:", x);
      });
      console.log("!!", this.args.chooseTable, this.tableMap, that.queryAttr);
      let finalQuery = null;
      if (oprAttr && oprAttr instanceof Array && oprAttr.length > 0) {
        finalQuery = that.queryAttr.concat(oprAttr);
      } else {
        finalQuery = that.queryAttr;
      }
      console.log(finalQuery);
      var queryStr = this.handleQueryObj(finalQuery, this.itemValue.data.targetClass);
      console.log("queryStr", queryStr);
      var charts = this.getCharts(this.itemValue.data.elements);
      console.log("charts:", charts);
      charts.forEach(x => x.refreshChart(queryStr));
    },
    handleQueryObj(query, targetClass) {
      let _ret = "";
      let _class = [targetClass];
      let _str = ["String", "UUID", "Clob", "Date"];
      let _int = ["Integer", "Long", "Double", "TimeStamp"];
      console.log("_class", _class);
      for (var i = 0; i < query.length; i++) {
        let m_class = query[i].className;
        let attr = query[i].attrName.substring(0, query[i].attrName.indexOf("&"));
        let type = query[i].valueType;
        let value = query[i].value;
        let __ret = "";
        console.log(type)
        if (_class.indexOf(m_class) == -1 || value == null || value == "" || !value) continue;
        if (type == "String") {
          // 查询条件为字符串时 拼接查询语句的方式较为固定
          __ret = ` and ${m_class}.plt_${attr} like '%${value}%'`;
        } else if (type == "Boolean") {
          // 查询条件为布尔型变量时 拼接查询语句方式固定
          let _value = typeof value == "string" ? value == "true" : value;
          __ret = ` and ${m_class}.plt_${attr} = ${_value}`;
        } else if (typeof value == "object") {
          // 查询值可能有2个或1个
          // 分别考虑属性为字符串或直接值的方式
          if (_str.indexOf(type) != -1)
            __ret = ` and ${m_class}.plt_${attr} between '${value[0]}' and '${value[1]}'`;
          if (_int.indexOf(type) != -1)
            __ret = ` and ${m_class}.plt_${attr} between ${value[0]} and ${value[1]}`;
        } else {
          if (_str.indexOf(type) != -1)
            __ret = ` and ${m_class}.plt_${attr} = '${value}'`;
          if (_int.indexOf(type) != -1)
            __ret = ` and ${m_class}.plt_${attr} = ${value}`;
        }
        console.log("__ret", __ret);
        if (__ret) _ret += __ret;
      }
      return _ret;
    },
    // 获取控件属性值
    getValue() {
      return this.args.queryObj;
    },
    // 设置控件属性值,item是查询到的对象数组
    setValue(item) {
      return item;
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
      for (var i in this.basicArgs) {
        if (i in this.args)
          this.basicArgs[i] = this.args[i];
      }
      return this;
    },
    // 获取表单项名
    getFormName() {
      return this.args.name;
    },
    // 获取插件的属性编辑框的dom元素
    getEditBoxComponent() {
      return this.$refs.editbox;
    },
    getEditBox(args) {
      this.t_edit = true;
      return this.$refs.edit;
    },
    // 获取插件名
    getName() {
      return name;
    },
    // 设置插件的显示类型，type=0为预览模式，type=1为运行模式，type=2为图标模式
    setDisplayType(type) {
      this.t_preview = false;
      this.t_show = false;
      this.t_icon = false;
      if (type == 0) this.t_preview = true;
      else if (type == 1) this.t_show = true;
      else if (type == 2) this.t_icon = true;
      return this;
    },
    // 设置插件支持的数据类型，返回类型为数据类型的列表
    getDataType(args) {
      return this.dataTypes;
    },
    // 条件配置弹窗
    queryModal() {
      let that = this;
      // 定制弹窗前 需先选择需要控制的表格
      if (this.args.chooseTable.length == 0) {
        this.$Notice.warning({
          title: '提示',
          desc: '请先选择需要控制的表格名称'
        });
      } else {
        let targetClassList = this.args.chooseTable.map(x => this.tableMap[x].args.bindTargetClass);
        if(targetClassList.length > 1 && _.uniq(targetClassList).length === targetClassList.length){
          this.$Notice.warning({
            title: '提示',
            desc: '不能控制不同目标类的表格'
          });
          return
        }

        this.spinShow = true;
        this.showQuery = true;
        var flag = false;
        console.log(that.args.chooseTable.length != that.args.oldChooseTable.length, that.args.chooseTable.length, that.args.oldChooseTable.length)
        if (that.args.chooseTable.length != that.args.oldChooseTable.length) {
          flag = true;
        } else {
          for (var i = 0; i < that.args.chooseTable.length; i++) {
            if (that.args.oldChooseTable[i] != that.args.chooseTable[i]) {
              flag = true;
              break;
            }
          }
        }
        console.log(flag)
        if (flag) that.freshClassAttr();
        this.$nextTick(() => {
          this.spinShow = false;
        })
      }
    },
    // 生成弹窗全部类的属性内容
    createModal() {
      const temAttr = [];
      this.allAttrMap.forEach((val, index) => {
        val.attributes.forEach((item, index) => {
          let eachAttr = {
            belongClass: `${val.className}(${val.displayName})`,
            attrName: `${item.attributeName}&${item.displayName}`,
            attrType: 'TextInput',
            valueType: item.valueType,
            defaultValue: ''
          }
          temAttr.push(eachAttr);
        })
      })
      temAttr.forEach((item, index) => {
        item.rowIndex = index;
        item.attrNum = index;
      })
      this.args.dataAttr = temAttr;
      this.temDataAttr = temAttr;
    },
    // 单击行勾选当前行
    checkSelect(data, index) {
      this.$refs.attrTable.toggleSelect(index);
    },
    // 取消全选
    changeAttr(data) {
      if (data.length == 0) {
        let that = this;
        that.checkClassGroup.forEach(x => {
          var className = "_all";
          if (x.substring(0, 4) != "重复属性") className = x.substring(0, x.indexOf("("));
          that.classAttr[className].forEach(y => {
            y._checked = false;
          })
          if (className == "_all") {
            that.classAttr[className].forEach(y => {
              that.updateAttrConflict(y);
            });
          }
        })
      }
    },
    // 全选属性
    chooseAttrAll(data) {
      let that = this;
      data.forEach((x, index) => {
        // try {
        that.classAttr[x.className].filter(attr => attr.attrName === x.attrName)[0]._checked = true;
        if (that.className == "_all") that.updateAttrConflict(that.classAttr[x.className].filter(attr => attr.attrName === x.attrName)[0]);
        // }catch (e) {
        //   console.error(e);
        //   console.error(index);
        // }
      });
    },
    // 取消全选属性
    cancelChooseAttrAll() {
      this.checkClassGroup.forEach(x => {
        var className = "_all";
        if (x.substring(0, 4) != "重复属性") className = x.substring(0, x.indexOf("("));
        this.classAttr[className].forEach(y => y._checked = false)
      });
    },
    // 选择属性
    chooseAttr(data, row) {
      if (row.className == "_all") {
        let temAttr = this.classAttr[row.className];
        for (let i = 0; i < temAttr.length; i++) {
          // if(temAttr[i].index == row.index) {
          if ((temAttr[i].index == row.index) && (temAttr[i].label == row.label)) {
            temAttr[i]._checked = true;
            console.log(temAttr[i])
            this.updateAttrConflict(temAttr[i]);
            break;
          }
        }
      } else {
        this.classAttr[row.className][row.index]['_checked'] = true;
      }
      // if (row.className == "_all") this.updateAttrConflict(this.classAttr[row.className][row.index]);
      // this.selectAttr = data;
      this.showPop = false;
    },
    // 取消选择属性
      cancelAttr(data, row) {
      console.log("cancel", row);
      if (data.length == 0) this.showPop = true;
      // this.selectAttr = data;
      if (row.className == "_all") {
        let temAttr = this.classAttr[row.className];
        for (let i = 0; i < temAttr.length; i++) {
          if ((temAttr[i].index == row.index) && (temAttr[i].label == row.label)) {
            temAttr[i]._checked = false;
            this.updateAttrConflict(temAttr[i]);
            break;
          }
        }
      } else {
        this.classAttr[row.className][row.index]._checked = false;
      }
    },
    confirmObj() {
      if (!this.bindTargetClass || this.bindTargetClass == undefined || this.bindTargetClass == '') {
        this.$Message.warning('引用类不能为空')
      } else if (!this.browseAttributes || this.browseAttributes == undefined || this.browseAttributes == '') {
        this.$Message.warning('浏览字段不能为空')
      } else if (!this.returnFormat || this.returnFormat == undefined || this.returnFormat == '') {
        this.$Message.warning('回填字段不能为空')
      } else {
        let configValue = {
          extendClass: this.bindTargetClass,
          extendAttr: this.browseAttributes,
          extendReturnAttr: this.returnFormat
        }
        this.args.dataAttr[this.currentIndex].defaultValue = JSON.stringify(configValue);
        this.showObjModal = false;
      }
    },
    cancelObj() {
      this.showObjModal = false;
    },
    // 确认生成
    confirmQuery() {
      let that = this;
      that.args.selectAttr = [];
      this.checkClassGroup.forEach(x => {
        var className = "_all";
        if (x.substring(0, 4) != "重复属性") className = x.substring(0, x.indexOf("("));
        that.classAttr[className].filter(y => y._checked).forEach(y => that.args.selectAttr.push(y));
      });
      this.confirmDom();
    },
    // 置空包裹器
    confirmDom() {
      let wrapBox = this.$refs.attrWrap.$el;
      for (var i = wrapBox.children.length; i > 0; i--) {
        wrapBox.removeChild(wrapBox.children[i - 1]);
      }
      function sortAttrNum(a, b) {
        a.attrNum === undefined ? a.attrNum = 99 : '';
        b.attrNum === undefined ? b.attrNum = 99 : '';
        return parseInt(a.attrNum) - parseInt(b.attrNum);
      }
      let that = this;
      var _type = 2;
      if (this.t_preview) _type = 0;
      else if (this.t_show) _type = 1;
      // this.args.selectAttr.forEach(x => {
      //   x.attrNum = x.attrNum !== undefined ? x.attrNum : 0
      // })
      this.args.selectAttr.sort(sortAttrNum);
      this.queryAttr = [];
      this.args.selectAttr.forEach(x => {
        if (x.className == "_all") {
          console.log(x.belongClass)
          var _class = x.belongClass.substr(5, x.belongClass.length - 6).split(",");
          console.log(_class)
          _class.forEach(y => {
            that.queryAttr.push({
              ...x,
              className: y
            });
          });
        } else {
          that.queryAttr.push(x);
        }
        let attrType = x.attrType;
        if (attrType == 'DSelectInput') attrType = 'SelectSInput';
        if (attrType == 'SelectMutiInput') attrType = 'SelectInput';
        var _dom = getAddinFunc(attrType, "form");
        let value = x.defaultValue;
        if (value == "") value = null;
        _dom = new _dom({
          propsData: {itemValue: this.itemValue},
        }).setDisplayType(_type).setArgs({
          label: x.label,
          width: this.args.unitInputWidth || '33'
        }).setArgs(this.basicArgs);
        //控件水平布局兼容
        if (attrType && this.structuralLayoutAddin.includes(attrType)) {
          _dom.setArgs({structural_layout: 'horizontal'});
        }
        if (x.attrType == "SelectInput") {
          if (value) {
            _dom.setArgs({selfOptions: value});
            _dom.createOptions();
          }
        } else if (x.attrType == "DateInput") {
          _dom.setArgs({defaultDateType: 'datetime', format: "yyyy-MM-dd HH:mm:ss"});
        } else if (x.attrType == "SelectMutiInput") {
          if (value) {
            _dom.setArgs({selectMuti: true, selfOptions: value});
            _dom.createOptions();
          }
        } else if (x.attrType == 'DSelectInput') {
          _dom.initDOptions(x.className, x.attrName.split('&')[0]);
        } else if (x.attrType == "SingleObjectSelectors") {
          if (value) {
            if (value != '' && value != undefined) {
              let resultArr = JSON.parse(value);
              let tClass = resultArr.extendClass;
              let bAttributes = resultArr.extendAttr;
              let rFormat = resultArr.extendReturnAttr;
              console.log(value, resultArr, tClass, bAttributes, rFormat, x.attrName)
              _dom.setArgs({
                bindTargetClass: tClass,
                browseAttributes: bAttributes,
                returnSelectFormat: bAttributes,
                noNumber: x.noNumber,
                returnFormat: rFormat
              });
            } else {
              console.log(value)
            }
          }
        } else if (value) _dom.setValue(value);
        var dom = _dom.$mount().$el;
        dom.classList.add("margin1");
        that.domMap[x.className + "&" + x.index] = _dom;
        wrapBox.appendChild(dom);
      });
      that.showQuery = false;
    },
    // 确认清空
    confirmEmpty() {
      // 置空包裹器
      this.confirmDom();
      this.showQuery = false;
      this.showPop = false;
      // 置空数据
      this.selectAttr = [];
      this.args.recoverAttr = [];
      this.args.dataAttr = [];
      this.createModal();
    },
    // 取消清空
    cancelEmpty() {
      this.args.recoverAttr.forEach((item, index) => {
        this.$refs.attrTable.toggleSelect(item.rowIndex);
      })
    },
    // 获取全部查询属性
    getTargetClassAttr() {
      let that = this;
      this.queryAttr.forEach(x => {
        var _id = x.className;
        if (x.belongClass.substring(0, 4) == "重复属性") _id = "_all";
        _id += "&" + x.index;
        x.value = that.domMap[_id].getValue();
      });
      console.log("!!", this.args.chooseTable, this.tableMap);
      this.args.chooseTable.forEach(x => {
        that.tableMap[x].freshData(that.queryAttr);
      });
    },
    // 取消生产
    cancelQuery() {
      this.showQuery = false;
    },
    // 自定义脚本
    selfSet() {
    },
    // 选择类过滤属性
    checkAllGroupChange(data) {
      let that = this;
      this.args.dataAttr = [];
      data.forEach(x => {
        var className = "_all";
        if (x.substring(0, 4) != "重复属性") className = x.substring(0, x.indexOf("("));
        that.args.dataAttr = that.args.dataAttr.concat(that.classAttr[className]);
      })
    },
    resetQueryBox() {
      let that = this;
      this.queryAttr.forEach(x => {
        var _id = x.className;
        if (x.belongClass.substring(0, 4) == "重复属性") _id = "_all";
        _id += "&" + x.index;
        x.value = x.defaultValue;
        that.domMap[_id].setValue(x.defaultValue);
      });
    },
    // 刷新单元宽度
    freshWidth() {
    },
    bindTargetClassChanged() {
      this.browseAttributes = [];
      this.returnFormat = []
    },
    bindTargetClassClear() {
      this.browseAttributes = [];
      this.returnFormat = []
    },
    // bindTargetClassOpen(val){
    //   if(!val){}
    // }
  }
}
</script>

<style lang="less" scoped>
/*
    插件的css部分
    设置display为inline，默认不换行
    scoped表示样式仅在该vue文件内有效
*/
.margin1 {
  margin-top: 5px;
  margin-bottom: 5px;
}
section {
  width: 100%;
  height: auto;
  display: inline-block;
}
.seach-wrap {
  width: 100%;
  min-height: 64px;
  height: auto;
  padding: 10px 0;
  overflow: hidden; //fix bug 5558
  display: flex; //fix bug http://ise.thss.tsinghua.edu.cn/confluence/pages/viewpage.action?pageId=43883468 -6
  align-items: center;
}
.seach-wrap input {
  color: #005aa0;
}
@media screen and (min-width: 1900px) {
  .self-btn {
    margin-left: 5px;
  }
}
</style>
