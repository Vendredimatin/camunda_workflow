<template>
  <section v-if="t_preview" :addinName="name" ref="main" :formEngineUUID="args.uuid"
           :style="{'width': arg_width, 'position': 'relative', 'clear': 'both'}">
    <div class="form-mask"
         v-if="(!args.multi && rootJson.data.elements.length === 0) || (args.multi && items.length === 0) || !args.viewName"
         :style="{'height': '100%', 'width': '100%', 'padding':'5px !important','z-index': '10'}">

      <div
        style="display: flex;justify-content: center;align-items: center;flex-direction: column;margin-top: 70px;"
        :style="{'height': arg_ASkeleton_height}"
      >
        <h2 style="width: 100%;display: block; text-align: center;">{{ args.componentDisplayName }}</h2>
        <ASkeleton avatar :paragraph="{ rows: 7 }"
                   :style="{'height': arg_ASkeleton_height, 'display': 'flex', 'align-items': 'center', 'overflow': 'hidden'}"></ASkeleton>
      </div>
    </div>
    <div class="form-mask"
         v-if="(!args.multi && rootJson.data.elements.length !== 0) || (args.multi && items.length !== 0)"
         :style="{'height': '100%', 'width': '100%', 'top': '0px','z-index': '7', 'position': 'absolute'}"
         @click="formMaskClick"
    >

    </div>
    <form
      v-if="!args.multi && onload && reloadFormEngine && rootJson.data.elements.length !== 0 && args.viewName"
      ref='root'
      dropTarget="0"
      uuid="000"
      :style="{'background-color': args.main_color, 'height': arg_height, 'overflow-y': 'hidden'}"
    >
      <FormAddinList
        v-for="addin in rootJson.data.elements"
        :key="addin.self.uuid"
        :addin="addin"
        :itemValue="rootJson"
        v-bind="addinProps"
        @activeAddin="activeAddin"
      >

      </FormAddinList>
    </form>
    <div
      v-if="args.multi && onload && reloadFormEngine && items.length !== 0 && args.viewName"
      :style="{'background-color': args.main_color, 'height': arg_height, 'overflow-y': 'hidden', 'width': '100%'}"
    >
      <div ref="root2" style="display: flex; justify-content: flex-start;flex-wrap: wrap;overflow: hidden;" :style="{'height': arg_withoutPageHeight}">
        <div
          v-for="(item, index) in items"
          dropTarget="0"
          :uuid="item.uuid"
          :style="{
            'background-color': args.main_color,
            'height': arg_unit_height,
            'overflow': 'auto',
            'width': args.unit_width + args.unit_widthType,
            'display': 'inline-block',
            'margin': computedMargin
          }"
        >
<!--          'margin': parseInt(args.unit_padding) / 2 + 'px',-->
          <FormAddinList
            v-for="addin in rootJson[index].data.elements"
            :key="addin.self.uuid"
            :addin="addin"
            :itemValue="rootJson[index]"
            v-bind="addinProps"
            @activeAddin="activeAddin"
          >

          </FormAddinList>
        </div>
      </div>
      <div v-show="args.pagination && args.multi && onload && reloadFormEngine && items.length !== 0 && args.viewName" style="margin-top: 5px; float: right;">
        <Page
          show-sizer
          show-elevator
          show-total
          placement="top"
          :page-size-opts="pageSizeOpts"
          :pageSize="parseInt(args.pageSize)"
          :total="entryCount"
          :current="currentPage"
        ></Page>
      </div>
    </div>
    <slot name="widget"></slot>
    <span v-show="t_edit" ref="edit">
      <EditBox
        v-if="actEdit" :addinName="name"
        :widgetAnnotation="widgetAnnotation"
        :editExtendInfo="editExtendInfo"
        ref="editbox"
        v-model="args"
        :itemValue="itemValue"
        :store="store"
        :attributes="filter_attributes"
        :router="router"
        :route="route"
        :root="root"
        :query_oprs="query_oprs"
        :targetclass="itemValue.data.targetClass"
        :editBoxConfig="editBoxConfig"
      >
          <div slot="attribute">
            <div v-show="!args.groupOid">
              <div v-if="args.name != ''">
                <p class="margin1">回填格式</p>
                <Select class="margin1" v-model="args.returnFormat">
                  <Option v-for="item in formatList" :key="item.id" :value="item.value">{{ item.label }}</Option>
                </Select>
              </div>
              <p class="margin1">选择表单</p>
              <BindFormBar v-if="actEdit" :addinName="name" class="margin1" :targetClass="arg_targetClass"
                           :defaultFormName="args.viewName"
                           :targetFormType="'PC'"
                           :root="root" v-on:on-change="onChangeOfFormBar" style="width: 100%"
                           :classType="arg_classType"></BindFormBar>
              <p class="margin1">卡片状态</p>
              <Radio-group v-model="args.displayType" type="button">
                <Radio label="create">创建</Radio>
                <Radio label="edit">编辑</Radio>
                <Radio label="visit">预览</Radio>
              </Radio-group>
              <div class="margin1" style="padding: 0 20px 0 20px;margin: 10px 0 10px 0">
                  多对象展示
                  <i-switch style="float: right" v-model="args.multi"/>
              </div>
              <div v-show="args.multi" class="margin1" style="padding: 0 20px 0 20px;margin: 10px 0 10px 0">
                  多选
                  <i-switch style="float: right" v-model="args.multiChoose"/>
              </div>
              <div v-show="args.multi" class="margin1" style="padding: 0 20px 0 20px;margin: 10px 0 10px 0">
                  分页
                  <i-switch style="float: right" v-model="args.pagination"/>
              </div>
              <Row v-show="args.multi && args.pagination" class="margin1">
                <Col span="24" class="margin1">
                  <Input type="number" v-model="args.pageSize">
                    <span slot="prepend">每页数量</span>
                  </Input>
                </Col>
              </Row>
            </div>
            <div v-show="args.groupOid">
              <p class="margin1">所属分组</p>
              <Select
                v-model="args.groupOid"
                placeholder="请选择组件分组"
                :disabled="true"
              >
                <Option v-for="group in editExtendInfo.componentGroup" :value="group.oid" :key="group.oid"
                        :label="group.displayName">
                  <span>{{ group.displayName }}</span>
                </Option>
              </Select>
            </div>
            <!--              <p class="margin1">初始化脚本</p>-->
            <!--              <editor class="margin1" v-model="args.initScript" @init="editorInit" lang="javascript"-->
            <!--                      theme="chrome" width="100%" height="200"></editor>-->
            <!-- <Button class="margin1" type="primary" style="text-align: center; width: 90%" @click="updateShow">更新预览</Button> -->
          </div>
          <div slot="layout">
              <!--
                  样式选项放置区域
                  仅有涉及到高度,宽度,对齐等样式的选项放在这里
               -->
              <div class="margin1" style="margin: 10px 0 10px 0">
                  背景颜色
                  <ColorPicker v-model="args.main_color"/>
              </div>
              <div v-show="args.multi">
                <p class="margin1">单元大小</p>
                <Row class="margin1" align="middle" type="flex">
                  <Col span="5"><span style="float: right;margin-right:5px">宽度</span></Col>
                  <Col span="19">
                    <Input class="margin1" number v-model="args.unit_width">
                        <Select v-model="args.unit_widthType" slot="append" style="width: 50px;">
                            <Option value="%">%</Option>
                            <Option value="px">px</Option>
                        </Select>
                    </Input>
                  </Col>
                </Row>
                <Row class="margin1" align="middle" type="flex">
                  <Col span="5"><span style="float: right;margin-right:5px">高度</span></Col>
                  <Col span="19">
                    <Input class="margin1" number v-model="args.unit_height"
                           :disabled="args.unit_heightType == '%'">
                        <Select v-model="args.unit_heightType" slot="append" style="width: 50px;">
                            <Option value="%">%</Option>
                            <Option value="px">px</Option>
                        </Select>
                    </Input>
                  </Col>
                </Row>
<!--                <Row class="margin1" align="middle" type="flex">-->
<!--                  <Col span="5"><span style="float: right;margin-right:5px">间隔</span></Col>-->
<!--                  <Col span="19">-->
<!--                    <Input class="margin1" number v-model="args.unit_padding">-->
<!--                        <span slot="append" style="width: 50px">px</span>-->
<!--                    </Input>-->
<!--                  </Col>-->
<!--                </Row>-->
              </div>
          </div>
          <div slot="operation">
          </div>
      </EditBox>
    </span>
  </section>
  <section v-else :addinName="name">
    <span style="text-align:center">
      <div class="form-addin-icon">
        <i class="iconfont">&#xe612;</i>
      </div>
      <div class="form-addin-name">
        卡片
      </div>
    </span>
  </section>
</template>

<script>

import '@/styles/component/iconfont.css';
import EditBox from "./_EditBox.vue"
import BindFormBar from "@/ext_components/form/subcomponent/BindFormBar.vue";
import {mapGetters, mapActions} from "vuex";
import {getAllRelations, getClass, getEobjCount, getRobjCount, getViews} from "@/api/others";
import { getAttributes } from "@/api/data-model/EntityModeling";
import { getRelation, getRelationAttributes } from "@/api/data-model/RelationModeling";
import {getAddinFunc} from "@/util/addin.js";
import Axios from 'axios';
import global_ from '@/views/global.vue';
import {uuid} from '@/util/assist'
import ASkeleton from 'ant-design-vue/lib/skeleton';
import 'ant-design-vue/lib/skeleton/style/css';

const name = "FormEngine";

const dwf_app_axios = Axios.create({
  baseURL: global_.baseObjOther,
  withCredentials: true
});

dwf_app_axios.interceptors.request.use(
  config => {
    config.headers.Authorization = this.store.state.user.token;
    return config;
  },
  error => {
    return Promise.reject(error);
  }
)

const visualCharts = [
  "addin_EchartBar",
  "addin_EChart",
  "addin_BarChart",
  "addin_LineChart",
  "addin_ScatterChart",
  "addin_PieChart",
  "addin_MapChart",
  "addin_MapCityChart",
  "addin_ParallelChart",
  "addin_CalendarChart",
  "addin_GaugeChart",
  "addin_CheckBox",
  "addin_RadioButton",
];
const timeseries = [
  "addin_TimeSeriesCharts",
  "addin_TimeSeriesBoard"
];

export default {
  name: name,
  props: [
    'addin',
    'activeUUID',
    'basicArgs',
    'relation',
    'argsProps',
    'widgetAnnotation',
    'editExtendInfo',
    'itemValue',
    'attributes',
    'query_oprs',
    'route',
    'router',
    'root',
    'store',
    'formCanvas',
  ],
  components: {
    editor: require("vue2-ace-editor"),
    EditBox,
    BindFormBar,
    ASkeleton
  },
  data() {
    return {
      classMap: {},
      leftClass: [],
      rightClass: [],
      name: name,

      t_preview: true,
      t_show: false,
      t_icon: false,
      t_edit: false,

      dataTypes: [''],


      actEdit: false,
      editBoxConfig: {},
      args: {
        pageSize: 25,
        pagination: true,
        hided: false,
        // dynamic: false,
        main_color: "initial",
        unit_width: 30,
        unit_widthType: "%",
        unit_height: 100,
        unit_heightType: "%",
        unit_padding: 10,
        multi: false,
        multiChoose: false,
        hasAdd: true,
        viewName: "",
        groupDisplayName: '',
        addviewName: "",

        title: '卡片',
        id: "",
        // name: "",
        width: 100,
        widthType: "%",
        height: 500,
        heightType: "px",
        // _height: 500,

        targetClass: "",
        condition: "",
        bindTargetClass: '',
        filterQuery: '',
        initScript: "",
        returnFormat: "#json",

        events: [],
        eventRange: ["新增", "初始化", "自定义"],
        displayType: 'visit',
      },

      currentPage: 1,
      countPage: 0,
      pageSizeOpts: [10, 25, 50, 100, 200, 500],
      entryCount: 3, //记录当前查询条件条目总数


      entitiesList: [],
      relationsList: [],
      views: [],

      open: ["1", "2"],

      queryData: {
        query: {query: ""}, //查询条件
        targetClass: "",
        formName: "",
        uuid: ""
      },
      rootJson: {
        data: {
          elements: []
        }
      },
      previewJson: {},
      paramData: null,
      height: 500,
      formatList: [
        {
          label: 'json字符串',
          value: "#json",
        },
      ],
      attrMap: {},
      items: [],
      itemLen: 3,
      onload: false,
      reloadFormEngine: true,
      computedMargin: '0%',
    };
  },
  inject: [
    'setBasicArgs'
  ],
  created() {
    //通用方法给args赋值
    this.args = this.setBasicArgs(this.args);
    this.setArgs(this.args);
    if (this.args.groupOid) {
      this.editBoxConfig = {
        title: `${this.args.groupDisplayName} / ${this.args.componentDisplayName}`,
        hideTargetClass: true,
        hideFilterQuery: true,
      }
    }
    if (this.store && !this.$store) this.$store = this.store;
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
    for (var i = 0; i < this.itemLen; i++) this.items.push({"uuid": uuid()});
    // if(this.args.bindTargetClass == '') {
    //   this.args.bindTargetClass = this.itemValue.data.targetClass + '&e';
    // }
  },

  async mounted() {
    if (this.t_preview) {

      let allRe = this.Relations();
      if (allRe && allRe.length > 0) {

        allRe.forEach((val) => {
          let eachItem = {
            className: val.className,
            displayName: val.displayName
          };
          this.relationsList.push(eachItem);
        });


      } else {

        let promiseEn = new Promise((resolve, reject) => {

          getAllRelations().then(res => {

            resolve(res);
            let relations = res.data.data;
            relations.forEach(x => {
              this.relationsList.push({
                className: x.className,
                displayName: x.displayName
              })
            });

          }).catch(e => {
            console.log(e);
            reject(e);
          });

        })

      }

      // 缺省绑定类为当前表单目标类
      if (this.args.bindTargetClass == '') {
        if (this.itemValue.data.isRelation) {
          this.args.bindTargetClass = this.itemValue.data.targetClass + '&r';
        } else {
          this.args.bindTargetClass = this.itemValue.data.targetClass + '&e';
        }
      }

      if (this.args.bindTargetClass && !/\&/.test(this.args.bindTargetClass)) {
        this.args.bindTargetClass = this.relationsList.filter(item => item.className === this.args.bindTargetClass).length === 0 ? this.args.bindTargetClass + '&e' : this.args.bindTargetClass + '&r'
      }
      if (this.args.bindTargetClass != "") this.targetClass = this.args.bindTargetClass.split('\&')[0];
      if (this.args.viewName != "") this.viewName = this.args.viewName;
      if (!this.params) this.params = {};
      if (this.args.filterQuery != "") this.params.condition = this.args.filterQuery;
      if (this.t_preview && this.targetClass && this.viewName) this.freshData();
    }
  },
  watch: {
    // arg_targetClass(val) {
    //   if (val) {
    //     if (!this.t_preview) return;
    //     let that = this;
    //     this.$Spin.show();
    //     getViews(val).then(res => {
    //       this.$Spin.hide();
    //       that.views = res.data.data;
    //     }).catch(e => {
    //       this.$Spin.hide();
    //       console.log(e);
    //     });
    //   }

    // },
    arg_name(val) {
      if (val in this.attrMap) {
        this.args.targetDataType = this.attrMap[val].valueType;
      } else this.args.targetDataType = null;
    },
    arg_unit_height(val) {
      if (val == "auto") this.args.unit_height = 100;
    },
    'args.multi'(val){
      if(this.onload){
        this.freshData();
      }
    }
  },
  methods: {

    onChangeOfFormBar(val) {
      this.args.viewName = val;
      if (this.args.bindTargetClass != "") this.targetClass = this.args.bindTargetClass.split('\&')[0];
      if (this.args.viewName != "") this.viewName = this.args.viewName;
      this.freshData();
    },

    getAllow() {
      return null;
    },

    getArgs() {
      return this.args;
    },

    setArgs(args) {
      for (var i in args) this.args[i] = args[i];
      if ("name" in args) this.args_name = this.args.name;
      if ('height' in args) this.height = this.args.height;
      //兼容之前的参数
      if ('targetClass' in args && this.args.targetClass) this.args.bindTargetClass = this.args.targetClass;
      if ('condition' in args && this.args.condition) this.args.filterQuery = this.args.condition;
      if ('eventRange' in args) {
        this.args.eventRange = ["新增", "初始化", "自定义"];
      }
      if (this.args.groupOid) {
        this.editBoxConfig.title = `${this.args.groupDisplayName} / ${this.args.componentDisplayName}`;
      }
      return this;
    },

    getFormName() {
      return this.args.name;
    },

    getEditBoxComponent() {
      return this.$refs.editbox;
    },

    getEditBox(args) {
      this.t_edit = true;
      return this.$refs.edit;
    },

    getName() {
      return name;
    },

    setDisplayType(type) {
      this.t_preview = type == 0;
      return this;
    },

    async freshData(query) {
      if (query && typeof query!="string"){
        if (query.query && query.query != null){
          this.rootQuery = { query: query.query };
        }else if (!query.query){
          this.rootQuery = { query: '' };
        }
      }else {
        this.rootQuery = { query: '' };
      }
      this.updateShow();
    },

    async updateShow() {
      if (this.args.bindTargetClass != "") this.targetClass = this.args.bindTargetClass.split('\&')[0];
      if (this.args.viewName != "") this.viewName = this.args.viewName;
      await this.initFormDate();
      this.createFormBase(this.previewJson);
    },

    //加载 表单依赖数据
    async initFormDate() {
      this.reloadFormEngine = false;
      // if (this.params && this.params.condition && this.params.condition.length > 0) {
      //   this.rootQuery.query = this.params.condition;
      //   this.rootQuery.query = this.parseEscapeString(this.rootQuery.query, null, null, this.itemValue.data.origin, this.attributes, this.store);
      // }
      this.reloadFormEngine = true;
      if (!this.queryData.query.query && this.rootQuery.query) this.queryData.query.query = this.rootQuery.query;
      this.queryData.targetClass = this.targetClass; // 实体类名称
      this.queryData.formName = this.viewName; // 表单名称
      this.queryData.formType = 'PC'; // 表单名称
      await this.updateQuery();
      // if (this.params.fresh) this.queryData.fresh = true;
      // this.queryData.fresh = true;
      // 进行表单查询,根据实体类名和表单名获取表单json,保存到store中
      this.previewJson = await this.handleQueryForm(this.queryData);

      if (this.args.pagination) {
        this.queryData.query.pageSize = this.args.pageSize;
        this.queryData.query.startIndex = this.args.pageSize * (this.currentPage - 1);
        await this.entryCounts(this.queryData);
      } else {
        this.queryData.query.startIndex = 0;
        this.queryData.query.pageSize = 100;
      }
      // 进行数据查询,根据查询条件获取查询数据,保存到store中
      if (typeof this.queryData.query.startIndex === 'undefined' && typeof this.queryData.query.pageSize === 'undefined') {
        this.queryData.query.startIndex = 0;
        this.queryData.query.pageSize = 1;
      }
      if (this.isRelation) {
        this.queryData.query.type = "relation";
      } else {
        delete this.queryData.query.type
      }
      this.queryData.fresh = true;
      this.queryData.query.pageSize = 3;//只显示3条
      this.entryCount = 3;
      await this.handleQueryData(this.queryData);
      // 从store中获取查询到的数据结果f
      this.queryData.uuid = this.QueryResult(this.queryData);
      if (this.queryData.uuid && !this.args.multi) this.queryData.uuid = this.queryData.uuid[0];
      if (this.queryData.uuid && this.args.multi) {
        this.items = [];

        for (var i = 0; i < this.queryData.uuid.length && i < 3; i++) {
          this.items.push({"uuid": uuid(), "selected": false});
        }
      }
    },

    async getEntity(className) {
      if (className) {
        await this.queryEntity(className);
        return this.Entities(className);
      }
    },

    async updateQuery() {
      let _class = await getClass(this.queryData.targetClass);
      _class = _class.data.data;
      if (_class.classCategory == "RelationClass") {
        this.isRelation = true;
        let res = await this.queryRelation(this.queryData.targetClass);
        this.queryData.leftClass = res.leftClass;
        this.queryData.rightClass = res.rightClass;
        this.queryData.relationClass = res.className;
        this.classMap[this.queryData.leftClass] = await this.getEntity(this.queryData.leftClass);
        this.classMap[this.queryData.rightClass] = await this.getEntity(this.queryData.rightClass);
      }else{
        this.isRelation = false;
        this.classMap[this.queryData.targetClass] = await this.getEntity(this.queryData.targetClass);
      }
    },

    getAttrMap() {
      var res = [];
      if (this.itemValue.data.isRelation) {
        var left = this.classMap[this.queryData.leftClass];
        var right = this.classMap[this.queryData.rightClass];
        res.push({
          ...left,
          attributes: this.attributes[2]
        });
        res.push({
          ...right,
          attributes: this.attributes[3]
        });
        res.push({
          ...this.relation,
          attributes: this.attributes[1]
        });
      } else {
        var obj = this.classMap[this.queryData.targetClass];
        res.push({
          ...obj,
          attributes: this.attributes
        });
      }
      return res;
    },
    // 创建表单总体
    async createFormBase(json) {
      try {
        if (this.args.multi) {
          this.rootJson = [];
          for (var i = 0; this.queryData.uuid && i < this.queryData.uuid.length; i++) {
            let jsonData = JSON.parse(json);
            if (this.rootQuery.data) jsonData.paramData = this.rootQuery.data;
            jsonData.data.isRelation = this.isRelation;
            jsonData.data.displayType = this.displayType;
            jsonData.data.deviceType = this.itemValue.data.deviceType;
            this.rootJson.push(jsonData);
          }
        } else {
          let jsonData = JSON.parse(json);
          if (this.rootQuery.data) jsonData.paramData = this.rootQuery.data;
          jsonData.data.isRelation = this.isRelation;
          jsonData.data.displayType = this.displayType;
          jsonData.data.deviceType = this.itemValue.data.deviceType;
          this.rootJson = jsonData;
        }
      this.onload = true;
      } catch (e) {
        console.log("加载表单内容错误，表单内容为空！", e, json);
        return;
      }

      //设置单元大小
      if (this.args.unit_width) {
        let marginWidth; //剩下的边框宽
        let column; //列数
        if (this.args.unit_widthType == "%") {
          column = Math.floor(100 / this.args.unit_width);
          marginWidth = 100 - column * this.args.unit_width;
          this.computedMargin = `10px ${marginWidth / (column * 2)}%`;
        } else {
          column = Math.floor(this.$refs.root2.offsetWidth / this.args.unit_width);
          marginWidth = this.$refs.root2.offsetWidth - column * this.args.unit_width;
          this.computedMargin = `10px ${marginWidth / (column * 2)}px`;
        }
      }
      // try {
      //   let queryData = {
      //     query: {query: "",},
      //     targetClass: "",
      //     formName: "",
      //     uuid: ""
      //   };
      //   if (this.args.multi) {
      //     if (this.queryData.leftClass) {
      //       queryData.leftClass = this.queryData.leftClass;
      //       queryData.rightClass = this.queryData.rightClass;
      //       queryData.relationClass = this.queryData.targetClass;
      //       queryData.query.type = "relation";
      //       await this.handleQueryData(queryData);
      //     }
      //     for (var i = 0; i < this.queryData.uuid.length; i++) {
      //       if (this.rootQuery.obj) this.$set(this.rootJson[i].data, 'origin', this.rootQuery.obj[i]);
      //       else if (this.displayType != "create") {
      //         if (this.rootJson[i].data.isRelation) {
      //           this.rootJson[i].data.origin = this.RelationSingleA(this.queryData.targetClass, this.queryData.uuid[i]) || {};
      //         } else {
      //           this.rootJson[i].data.origin = this.EntitySingle(this.queryData.targetClass, this.queryData.uuid[i]);
      //         }
      //       } else this.rootJson[i].data.origin = {};
      //       this.itemData[this.items[i].uuid] = this.rootJson[i].data.origin;
      //     }
      //   } else {
      //     if (this.rootQuery.obj) this.$set(this.rootJson.data, 'origin', this.rootQuery.obj);
      //     else if (this.displayType != "create") {
      //       if (this.rootJson.data.isRelation) {
      //         this.rootJson.data.origin = this.RelationSingleA(this.queryData.targetClass, this.queryData.uuid);
      //       } else {
      //         this.rootJson.data.origin = this.EntitySingle(this.queryData.targetClass, this.queryData.uuid);
      //       }
      //     } else this.rootJson.data.origin = {};
      //   }
      // } catch (e) {
      //   console.log("数据查询失败", e);
      // }
    },

    changePage(val) {
      this.currentPage = val;
      this.freshData(this.queryData.query.query);
    },
    changePageSize(pageSize) {
      this.args.pageSize = pageSize;
      this.freshData(this.queryData.query.query);
    },

    async entryCounts(query) {
      if (!this.args.bindTargetClass) return;
      if (this.pageChange){
        this.pageChange = false;
        return ;
      }
      let allObjCnt;
      if (this.isRelation){
        allObjCnt = await getRobjCount(this.queryData.targetClass, {
          condition: this.queryData.query.query
        });
      } else {
        allObjCnt = await getEobjCount(this.queryData.targetClass, {
          condition: this.queryData.query.query
        });
      }
      let lastCount = this.entryCount;
      let lastPage = Math.ceil(this.entryCount / this.args.pageSize);
      this.entryCount = allObjCnt.data.data;
      /**
       * 总数发生变化时定位当前页
       * case1 总数%分页数 == 0
       *
       * case2 总数%分页数 != 0
       *
       */
      switch (this.entryCount % this.args.pageSize) {
        case 0:
          switch (this.currentPage) {
            case 1:
              this.currentPage = 1;
              break;
            default:
              this.entryCount == this.args.pageSize
                ? this.currentPage = 1
                : lastCount > this.entryCount && this.currentPage !== lastPage
                ? ''
                : this.currentPage = parseInt(this.entryCount / this.args.pageSize);
              break;
          }
          break;
        default:

          break;
      }
    },

    initData(args) {
      for (var i in args) {
        this[i] = args[i];
      }
    },

    GetObj(item) {
      var obj = {}
      if ("origin" in item) {
        for (var i in item.origin) {
          obj[i] = item.origin[i];
        }
      }
      for (var i = 0; i < item.elements.length; i++) {
        if (!item.elements[i].obj) continue;
        var name = item.elements[i].obj.getFormName ? item.elements[i].obj.getFormName() : null;
        if (name) {
          var value = item.elements[i].obj.getValue();
          ;
          if (value != undefined) obj[name] = value;
        }
        var other = this.GetObj(item.elements[i]);
        for (var j in other) {
          obj[j] = other[j];
        }
      }
      return obj;
    },

    GetAddinById(item, id) {
      if (!item.obj) return null;
      if ("self" in item) {
        if (item.self.properties.id == id) return item.obj;
      }
      for (var i = 0; i < item.elements.length; i++) {
        var obj = this.GetAddinById(item.elements[i], id);
        if (obj) return obj;
      }
      return null;
    },

    GetAddinByUUIDOverride(item, uuid) {
      if (!item) return null;
      if ("self" in item) {
        if (item.self.uuid == uuid) return item.obj;
      }
      for (var i = 0; i < item.elements.length; i++) {
        var obj = this.GetAddinByUUIDOverride(item.elements[i], uuid);
        if (obj) return obj;
      }
      return null;
    },

    activeAddin(type, addin, uuid) {
      this.$emit('activeAddin');
    },

    formMaskClick(){
      if(this.args.groupOid){
        this.resizeAddin(this.rootJson.data)
      }
    },

    /**
     *@descriptionresize视图控件
     *@params
     *@date 2020/9/15
     *@return
     */
    resizeAddin(addin) {
      if (addin.self) {
        if ((visualCharts.indexOf(addin.self.elementType) >= 0) && addin.obj && addin.obj.resizeChart) {
          addin.obj.resizeChart();
        }
        if ((timeseries.indexOf(addin.self.elementType) >= 0) && addin.obj && addin.obj.resizeChart) {
          addin.obj.resizeChart();
        }
      }
      if (addin.elements && addin.elements.length) {
        addin.elements.forEach(element => {
          this.resizeAddin(element)
        });
      }
    },

    ...mapActions("DWF_form", ["updateFView", "deleteFView", "queryEntity", "queryRelation", "handleQueryData", "handleQueryForm",
      "deleteEObj", "saveEObj", "editEObj", "updateFormJsonAct", "updataEntityobjAct",
      "handleQueryForm"])

  },
  computed: {
    // 使用对象展开运算符将此对象混入到外部对象中
    ...mapGetters("DWF_form", [
      "EntityList",
      "ENtityUuid",
      "EntityAttrList",
      "EntityAttrSingle",
      "EntityFormList",
      "EntityForm",
      "RelationList",
      "RelationAttrList",
      "RelationAttrSingle",
      "RelationFormList",
      "RelationForm",
      "AnotherClass",
      "ResourceSingle",
      "ResourceList",
      "ResourceAttrList",
      "ResourceAttrSingle",
      "getViewData",
      "getViewDataByAttrs",
      "Entities", "EntitySingle", "Relations", "RelationSingle", "QueryResult", "QueryResultAll"
    ]),

    //初始化控件props
    addinProps() {
      return {
        store: this.store,
        activeUUID: this.activeUUID,
        basicArgs: this.basicArgs,
        itemValue: this.itemValue,
        attributes: this.attributes,
        relation: this.relation,
        editExtendInfo: this.editExtendInfo,
        widgetAnnotation: this.widgetAnnotation,
        checkResult: this.checkResult,
        query_oprs: this.query_oprs,
        route: this.route,
        router: this.router,
        root: this.root,
        Message: this.$Message,
        echarts: this.$echarts,
        formCanvas: this.formCanvas,
        formEngine: this
      }
    },

    arg_width() {
      return this.args.width + this.args.widthType;
    },

    arg_height() {
      return 'heightType' in this.args ? this.args.height + this.args.heightType : this.args.height + "px";
    },

    arg_withoutPageHeight(){
      return 'heightType' in this.args ? this.args.height - 40 + this.args.heightType : this.args.height - 40 + "px";
    },

    arg_ASkeleton_height() {
      this.args.height - 70 <= 0 ? this.args.height = 70 : '';
      return 'heightType' in this.args ? (this.args.height - 70) + this.args.heightType : (this.args.height - 70) + "px";
    },

    arg_unit_height() {
      if (this.args.unit_heightType && this.args.unit_heightType == "%") return "auto";
      return this.args.unit_height + "px";
    },

    arg_targetClass() {
      return this.args.bindTargetClass ? this.args.bindTargetClass.split('\&')[0] : '';
    },

    arg_classType() {
      return this.args.bindTargetClass ? this.args.bindTargetClass.split('\&')[1] : '';
    },

    filter_attributes() {
      return this.attributes ? (this.relation ?
        ["relation", this.attributes[1].filter(x => this.dataTypes.indexOf(x.valueType) > -1),
          this.attributes[2].filter(x => this.dataTypes.indexOf(x.valueType) > -1),
          this.attributes[3].filter(x => this.dataTypes.indexOf(x.valueType) > -1)] : this.attributes.filter(x => this.dataTypes.indexOf(x.valueType) > -1)) : [];
    },

    arg_multi() {
      return this.args.multi;
    }
  }
};
</script>
<style>
.addin {
  padding: 5px
}

.margin1 {
  margin-top: 5px;
  margin-bottom: 5px;
}

.margin2 {
  margin-left: 5px;
  margin-bottom: 5px;
}
</style>
<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.layout {
  padding: 20px;
  font-size: 18px;
  text-align: left;
  background-color: #fff;
}

b {
  margin: 10px;
  background-color: rgba(247, 16, 16, 0.616);
  color: #fff;
  border-radius: 50%;
  display: inline-block;
  width: 40px;
  height: 40px;
  line-height: 40px;
  text-align: center;
  box-shadow: 3px 5px 5px 2px #ccc;
}

.win {
  margin: 10px 30px;
  text-align: center;
}

.win :last-child {
  background-color: #00f;
}

/*section {*/
/*  display: inline-block;*/
/*}*/
</style>
