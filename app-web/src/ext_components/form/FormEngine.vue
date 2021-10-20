<template>
  <section :addinName="name" ref="main" :style="{'width': arg_width}">
    <form v-show="!args.hided" v-if="!args.multi && onload && reloadFormEngine" class="org-form self-form" ref='root'
          dropTarget="0" uuid="000"
          :style="{'background-color': args.main_color, 'height': arg_height, 'overflow-y': 'auto'}">
      <FormAddinList
        v-for="addin in rootJson.data.elements"
        :key="addin.self.uuid"
        :addin="addin"
        :itemValue="rootJson"
        v-bind="addinProps"
      >

      </FormAddinList>
    </form>
    <div v-show="!args.hided" v-else-if="args.multi && onload && reloadFormEngine"
         :style="{'background-color': args.main_color, 'height': arg_height, 'overflow-y': 'auto', 'width': '100%'}">
      <div ref="root2" style="display: flex; justify-content: flex-start; flex-wrap: wrap;">
        <div v-for="(item, index) in items" dropTarget="0" :uuid="item.uuid"
             :class="['formUnit', 'self-card', { selected: item.selected } ]" @click="unitClick(item)"
             :style="{'background-color': args.main_color, 'height': arg_unit_height, 'overflow': 'auto', 'width': args.unit_width + args.unit_widthType,
                'display': 'inline-block', 'margin': computedMargin}">
          <!--              'margin': parseInt(args.unit_padding) / 2 + 'px',-->
          <FormAddinList
            v-for="addin in rootJson[index].data.elements"
            :key="addin.self.uuid"
            :addin="addin"
            :itemValue="rootJson[index]"
            v-bind="addinProps"
          >

          </FormAddinList>
        </div>
        <div v-if="addOpr" :style="{'background-color': args.main_color, 'height': unit_height, 'overflow': 'auto', 'width': args.unit_width + args.unit_widthType,
                'display': 'inline-block', 'text-align': 'center'}">
          <!--              'margin': parseInt(args.unit_padding) / 2 + 'px',-->
          <Icon @click="addItem0" type="md-add" :style="{'font-size': last_font_size, 'margin-top': last_margin_top }"/>
        </div>
      </div>
      <div v-if="args.multi && args.pagination" style="margin-top: 10px; float: right;">
        <Page
          show-sizer
          show-elevator
          show-total
          placement="top"
          :page-size-opts="pageSizeOpts"
          :pageSize="parseInt(args.pageSize)"
          :total="entryCount"
          :current="currentPage"
          @on-change="changePage"
          @on-page-size-change="changePageSize"
        ></Page>
      </div>
    </div>
  </section>
</template>

<script>
import {mapGetters, mapActions} from "vuex";
import {
  getClass,
  getAllEntities,
  getAllRelations,
  getEobjCount,
  getRobjCount,
  getEntitiesOperationsByName
} from "@/api/others";
import {getAddin, getAddinDom, getAddinFunc} from "@/util/addin.js";
import {parseEscapeString} from '@/libs/utils.js';
import {Message} from 'view-design';
import store from "@/store";
import _ from "lodash";
import {uuid} from '@/util/assist'
import {entries as form_entries} from "@/ext_components/form/config.js";

const name = "FormEngine";

export default {
  name: name,
  props: {
    addin: Object,
    argsProps: Object,
    formEngine: Object,
    dwf_ctx: Object,
    store: Object,
    itemValue: Object,
    attributes: [Object, Array],
    echarts: Object,
    query: Object,
  },
  data() {
    return {
      name: name,

      query: {query: ""},

      args: {
        name: "",
        width: 100,
        widthType: "%",
        height: 500,
        heightType: "px",

        hided: false,
        targetClass: "",
        condition: "",
        bindTargetClass: '',
        filterQuery: '',
        initScript: "",

        multi: false,
        multiChoose: false,
        pageSize: 25,
        pagination: true,
      },

      currentPage: 1,
      countPage: 0,
      pageSizeOpts: [25, 50, 100, 200],
      entryCount: 0, //记录当前查询条件条目总数

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
      displayType: 'visit',
      forceDisplayType: '',
      isRelation: false,
      // obj: null,
      items: [],
      selectedItem: null,
      itemData: {},
      itemDataJson: {},

      entitiesList: [],
      relationsList: [],
      attributesList: null,
      unit_height: "auto",
      last_font_size: "14px !important",
      last_margin_top: "auto",

      addOpr: null,
      rootQuery: '',
      lastQuery: '',
      structuralLayoutAddin: ['TextInput', 'HyperLink', 'NumberInput', 'DateInput', 'CheckBox', 'RadioButton', 'Label', 'Switch', 'SelectInput', 'SingleObjectSelector', 'SingleObjectModal', 'MultiObjectsTag', 'ProgressBar', 'D_Rate', 'Liked', 'icon', 'DynamicParameterFrame', 'MultiFilesList', 'Attachments'], //允许垂直布局的控件，为之前做兼容
      vInit: null,
      vSingleClick: null,
      vDoubleClick: null,
      vCustom: null,
      customData: null,
      eventData: null,
      objs: null,
      onload: false,
      reloadFormEngine: true,
      addinIdMap: {},
      noNeedGetValue: ['DynamicDigitalLabel', 'ProgressBar', 'Label'],//不需要getValue向接口传值的控件
      computedMargin: '0%',
    };
  },
  inject: [
    'getEn',
    'getParentJson',
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
    this.setArgs(this.argsProps);
    if (this.store && !this.$store) this.$store = this.store;
    // this.rootQuery = _.cloneDeep(this.query);
    this.rootQuery = {
      query: ''
    };
    getAllEntities({needOperationCount: false}).then(res => {
      let entities = res.data.data;
      this.entitiesList = [];
      entities.forEach(x => {
        this.entitiesList.push({
          className: x.className,
          displayName: x.displayName
        })
      });
    });

    getAllRelations({needOperationCount: false}).then(res => {
      let relations = res.data.data;
      this.relationsList = [];
      relations.forEach(x => {
        this.relationsList.push({
          className: x.className,
          displayName: x.displayName
        })
      });
    });
  },

  async mounted() {
    if (this.args.bindTargetClass && !/\&/.test(this.args.bindTargetClass)) {
      this.args.bindTargetClass = this.relationsList.filter(item => item.className === this.args.bindTargetClass).length === 0 ? this.args.bindTargetClass + '&e' : this.args.bindTargetClass + '&r'
    }
    if ((!this.args.main_color || this.args.main_color == 'initial') && sessionStorage.getItem('skinStyle') != 'dark') this.args.main_color = "#f3f3f3";
    if (this.args.bindTargetClass != "") this.targetClass = this.args.bindTargetClass.split('\&')[0];
    if (this.args.viewName != "") this.viewName = this.args.viewName;
    if (!this.rootQuery.displayType) this.rootQuery.displayType = this.args.displayType;
    if (this.args.events) {
      this.vSingleClick = this.args.events.find((val) => {
        return val.name == '单击' && val.opr_type && val.opr_path
      })
      this.vDoubleClick = this.args.events.find((val) => {
        return val.name == '双击' && val.opr_type && val.opr_path
      })
      this.addOpr = this.args.events.find((val) => {
        return val.name == '新增' && val.opr_type && val.opr_path
      })
      this.vInit = this.args.events.find((val) => {
        return val.name == '初始化' && val.opr_type && val.opr_path
      })
      this.vCustom = this.args.events.find((val) => {
        return val.name == '自定义' && val.opr_type && val.opr_path
      })
    }
    if (this.targetClass && this.viewName) this.updateShow();
  },
  methods: {
    async addItem0() {
      let res = await this.invokeOperation(this.addOpr.opr_type, this.addOpr.opr_path, this.itemValue, this.store, null, null, {
        func: this.addItem,
        params: null
      });
    },

    addItem(res, params) {
      this.$nextTick(() => {
        this.updateShow();
      })
    },

    deleteItem(id) {
      let idx = this.rootJson.findIndex(x => x.data.elements.length == 1 && x.data.elements[0].self.properties.id == id);
      console.log(id, idx);
      if (idx > -1) {
        this.$refs.root2.removeChild(this.$refs.root2.children[idx]);
        //this.items.splice(idx, 1);
        this.rootJson.splice(idx, 1);
        this.queryData.uuid.splice(idx, 1);
      }
    },

    getAttrMap() {
      return [{
        className: this.args.bindTargetClass.split('\&')[0]
      }]
    },

    getSelected() {
      // let res = [];
      // if (this.args.multiChoose) {
      //   res = this.selectedItem ? this.selectedItem : [];
      //   res = res.map(x => this.itemData[x.uuid]);
      // } else {
      //   res = this.obj();
      // }
      let obj = this.obj();
      console.log(obj);
      return obj;
    },
    getAll() {
      let res = [];
      if (this.args.multi) {
        res = this.items.map(x => this.itemData[x.uuid]);
      } else {
        res = [this.getObj(this.rootJson.data)];
      }
      return res;
    },
    async unitClick(item) {
      item.selected = !item.selected;
      if (!this.args.multiChoose) {
        if (!item.selected) this.selectedItem = null;
        else {
          if (this.selectedItem) this.selectedItem[0].selected = false;
          this.selectedItem = [item];
        }
      } else {
        if (!this.selectedItem) this.selectedItem = [];
        let idx = this.selectedItem.findIndex(x => x.uuid == item.uuid);
        if (idx > -1) this.selectedItem.splice(idx, 1);
        else this.selectedItem.push(item);
      }
      if (this.vSingleClick) {
        await this.invokeOperation(this.vSingleClick.opr_type, this.vSingleClick.opr_path, this.itemValue, this.store);
      }
    },
    // 更新表单前端数据
    updateData(element, obj) {
      if (!element) return;
      console.log(element, obj);
      if (element.obj) {
        if (element.obj.getFormName) {
          var name = element.obj.getFormName();
          if (name in obj) {
            element.obj.setValue(obj[name]);
            element.obj.validate();
          }
        } else if (element.obj.fresh) {
          // element.obj.fresh(obj);
        }
      }
      if (element.elements && element.elements.length) {
        element.elements.forEach(e => {
          this.updateData(e, obj);
        })
      }
    },
    getValue() {
      let obj = this.obj();
      // if (this.args.multiChoose){
      //   obj = this.getObj(this.rootJson[0].data);
      // }else{
      //   obj = this.getObj(this.rootJson.data);
      // }
      if (this.args.returnFormat == "#json") {
        obj = JSON.stringify(obj);
      }
      return obj;
    },

    obj() {
      if (this.args.multiChoose || this.args.multi) {
        let res = [];
        let selected = this.selectedItem ? this.selectedItem : [];
        selected = selected.map(x => this.itemDataJson[x.uuid]);
        selected.forEach(x => {
          res.push(this.getObj(x.data));
        })
        return res;
      } else {
        return [this.getObj(this.rootJson.data)];
      }
    },

    getObj(item) {
      var obj = {};
      if (item && "extraObj" in item) {
        for (var i in item.extraObj) {
          obj[i] = item.extraObj[i];
        }
      }
      if (item && "origin" in item) {
        for (var i in item.origin) {
          obj[i] = item.origin[i];
        }
      }
      if (item) {

        for (var i = 0; i < item.elements.length; i++) {
          if (item.elements[i].obj) {
            let args = item.elements[i].obj.getArgs ? item.elements[i].obj.getArgs() : {};
            var name = item.elements[i].obj.getFormName ? item.elements[i].obj.getFormName() : null;
            if (name && !this.noNeedGetValue.includes(item.elements[i].obj.name)) {
              try {
                var value = item.elements[i].obj.getValue();
                value = value === null ? null : value;
                if (value !== undefined) {
                  // 是否为自定义属性
                  obj[name] = value;
                }
              } catch (e) {
                console.log('getValue error:', e);
              }
            }
          }
          var other = this.getObj(item.elements[i]);
          for (var j in other) {
            obj[j] = other[j];
          }
        }
      }
      return obj;
    },

    setValue(value) {
      if (this.args.returnFormat == "#json") {
        let obj = JSON.parse(value);
        this.updateData(this.rootJson.data, obj);
      } else if (typeof value == "object") {
        this.updateData(this.rootJson.data, value);
      }
      return this;
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
      if ((this.args.main_color == 'initial' || this.args.main_color == '#f3f3f3') && sessionStorage.getItem('skinStyle') == 'dark' && sessionStorage.getItem('appMenu')) this.args.main_color = 'transparent';
      if ('targetClass' in args && this.args.targetClass) this.args.bindTargetClass = this.args.targetClass;
      if ('condition' in args && this.args.condition) this.args.filterQuery = this.args.condition;
      return this;
    },

    getFormName() {
      return this.args.name;
    },

    getName() {
      return name;
    },

    setDisplayType(type) {
      this.args.displayType = type;
      return this;
    },

    async updateShow(targetClass, viewName, params = {}) {
      this.items = [];
      this.itemData = {};
      this.selectedItem = null;
      if (this.args.bindTargetClass != "") this.targetClass = this.args.bindTargetClass.split('\&')[0];
      if (this.args.viewName != "") this.viewName = this.args.viewName;
      if (targetClass) this.targetClass = targetClass;
      if (viewName) this.viewName = viewName;
      this.params = params;
      await this.initFormDate();
      this.createFormBase(this.previewJson);
    },

    async freshData(query) {
      if (query && typeof query != "string") {
        if (query.query && query.query != null) {
          this.rootQuery = {query: query.query};
        } else if (!query.query) {
          this.rootQuery = {query: ''};
        }
        // else {
        //   this.rootQuery = this.lastQuery ? {query: this.lastQuery} : {query: ''};
        // }
        if (query.customData) {
          this.customData = query.customData;
        }
        this.updateShow(this.targetClass, this.viewName);
      } else {
        if (query != this.queryData.query.query) this.currentPage = 1;
        if (query != null) {
          this.rootQuery = {query: query};
        } else if (query === null) {
          this.rootQuery = {query: ''};
        }
        // else {
        //   this.rootQuery = this.lastQuery ? {query: this.lastQuery} : {query: ''};
        // }
        this.updateShow(this.targetClass, this.viewName);
      }
    },

    /**
     *@description刷新单个卡片
     *@params obj
     *@date 2021/1/19
     *@return
     */
    freshObj(obj) {
      if (this.args.multi && this.rootJson.length > 0 && obj) {
        this.reloadFormEngine = false;
        let index = this.rootJson.findIndex(card => {
          if (this.isRelation) {
            return card.data.origin.relation_oid === obj.relation_oid
          } else {
            return card.data.origin.oid === obj.oid
          }
        })
        this.$set(this.rootJson[index].data, 'origin', obj);
        this.$nextTick(() => {
          this.reloadFormEngine = true;
        })
      }else if(!this.args.multi && obj){
        this.reloadFormEngine = false;
        this.$set(this.rootJson.data, 'origin', obj);
        this.$nextTick(() => {
          this.reloadFormEngine = true;
        })
      }
    },

    changePage(val) {
      this.currentPage = val;
      this.changePageTrigger = true;
      this.freshData(this.queryData.query.query);
    },
    changePageSize(pageSize) {
      this.args.pageSize = pageSize;
      this.freshData(this.queryData.query.query);
    },

    async entryCounts(query) {
      if (!this.args.bindTargetClass) return;
      if (this.pageChange) {
        this.pageChange = false;
        return;
      }
      let allObjCnt;
      if (this.isRelation) {
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
       * 非点击分页时总数发生变化时定位当前页
       * case1 总数%分页数 == 0
       *
       * case2 总数%分页数 != 0
       *
       */
      if (this.changePageTrigger) {
        this.changePageTrigger = false;
        return;
      }
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

    //加载 表单依赖数据
    async initFormDate() {
      this.reloadFormEngine = false;
      //卡片搜索相关不再与表单关联
      if (this.params.query || this.params.obj || this.params.data) {
          if (this.params.query) this.rootQuery.query = this.params.query;
          if (this.params.obj) this.rootQuery.obj = this.params.obj;
          if (this.params.data) this.rootQuery.data = this.params.data;
      } else if (this.params.initScript && this.params.initScript.length > 0) {
          let code = this.params.initScript;
          let params = {};
          let _obj = await this.handleScript(code, params, this.store, this.itemValue);
          if (_obj) {
            if (_obj.query) this.rootQuery.query = _obj.query;
            if (_obj.obj) this.rootQuery.obj = _obj.obj;
            if (_obj.data) this.rootQuery.data = _obj.data;
            if (_obj.displayType) this.rootQuery.displayType = _obj.displayType;
            if ("show" in _obj) this.rootQuery.hide = !_obj.show;
          }
      } else if (this.params.condition && this.params.condition.length > 0) {
          this.rootQuery.query = this.params.condition;
          this.rootQuery.query = this.parseEscapeString(this.args.filterQuery, null, null, this.itemValue.data.origin ,this.attributes, this.store);
      }
      //兼容上古初始化脚本
      if (this.args.initScript && this.args.initScript.length > 0) {
        let code = this.params.initScript;
        let params = {};
        let _obj = await this.handleScript(code, params, this.store, this.itemValue);
        if (_obj) {
          if (_obj.query) this.rootQuery.query = _obj.query;
          if (_obj.obj) this.rootQuery.obj = _obj.obj;
          if (_obj.data) this.rootQuery.data = _obj.data;
          if (_obj.displayType) this.rootQuery.displayType = _obj.displayType;
          if ("show" in _obj) this.rootQuery.hide = !_obj.show;
        }
      }
      this.rootQuery.query = this.rootQuery.query ? this.rootQuery.query : this.parseEscapeString(this.args.filterQuery, null, null, this.itemValue.data.origin, this.attributes, this.store);
      // if(this.objs){
      //   this.rootQuery.obj = this.objs;
      // }
      this.reloadFormEngine = true;
      if (this.vInit) {
        await this.invokeOperation(this.vInit.opr_type, this.vInit.opr_path, this.itemValue, this.store);
      }
      if (this.rootQuery.hide) return;
      // 对查询语句进行转义处理
      // if (this.rootQuery.displayType) this.displayType = this.rootQuery.displayType;
      this.queryData.query = this.rootQuery;
      // this.lastQuery = this.rootQuery.query;
      this.queryData.targetClass = this.targetClass; // 实体类名称
      this.queryData.formName = this.viewName; // 表单名称
      let _class = await getClass(this.queryData.targetClass);
      _class = _class.data.data;
      if (_class.classCategory == "RelationClass") {
        this.isRelation = true;
        let res = await this.queryRelation(this.queryData.targetClass);
        this.relation = res;
        this.queryData.leftClass = this.relation.leftClass;
        this.queryData.rightClass = this.relation.rightClass;
        this.queryData.relationClass = this.relation.className;
        this.queryEntity(this.queryData.leftClass);
        this.queryEntity(this.queryData.rightClass);
      } else {
        this.isRelation = false;
        this.queryEntity(this.queryData.targetClass);
      }
      // if (this.params.fresh) this.queryData.fresh = true;
      // this.queryData.fresh = true;
      // 进行表单查询,根据实体类名和表单名获取表单json,保存到store中
      this.previewJson = await this.handleQueryForm(this.queryData);
      if (this.isRelation) {
        this.attributesList = {};
        this.attributesList.left = this.AttributesByClass(this.queryData.leftClass).length === 0
          ? await this.getAttributeClassMap(this.queryData.leftClass)
          : this.AttributesByClass(this.queryData.leftClass);
        this.attributesList.relation = this.AttributesByClass(this.queryData.relationClass).length === 0
          ? await this.getAttributeClassMap(this.queryData.relationClass)
          : this.AttributesByClass(this.queryData.relationClass);
        this.attributesList.right = this.AttributesByClass(this.queryData.rightClass).length === 0
          ? await this.getAttributeClassMap(this.queryData.rightClass)
          : this.AttributesByClass(this.queryData.rightClass);
      } else {
        this.attributesList = this.AttributesByClass(this.queryData.targetClass).length === 0 ? await this.getAttributeClassMap(this.queryData.targetClass) : this.AttributesByClass(this.queryData.targetClass);
      }
      if (this.rootQuery.obj) {
        if (this.args.multi) {
          this.queryData.uuid = [];
          for (var i = 0; i < this.rootQuery.obj.length; i++) {
            this.queryData.uuid.push(this.rootQuery.obj[i].oid ? this.rootQuery.obj[i].oid : null);
          }
          this.entryCount = this.rootQuery.obj.length;
        } else {
          if (Array.isArray(this.rootQuery.obj)) {
            this.queryData.uuid = this.rootQuery.obj[0].oid ? this.rootQuery.obj[0].oid : null;
          } else {
            this.queryData.uuid = this.rootQuery.obj.oid ? this.rootQuery.obj.oid : null;
          }
        }
      } else {
        // 分页查询
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
        await this.handleQueryData(this.queryData);
        // 从store中获取查询到的数据结果f
        this.queryData.uuid = this.QueryResult(this.queryData);
        if (this.queryData.uuid && !this.args.multi) this.queryData.uuid = this.queryData.uuid[0];
      }
      if (this.queryData.uuid && this.args.multi) {
        this.items = [];

        for (var i = 0; i < this.queryData.uuid.length; i++) {
          this.items.push({"uuid": uuid(), "selected": false});
        }
      }
    },
    // 创建表单总体
    async createFormBase(json) {
      if (this.rootQuery.hide) return;
      // 判断表单json是否有
      try {
        if (this.args.multi) {
          this.rootJson = [];
          for (var i = 0; i < this.queryData.uuid.length; i++) {
            let jsonData = JSON.parse(json);
            if (this.rootQuery.data) jsonData.paramData = this.rootQuery.data;
            jsonData.data.isRelation = this.isRelation;
            jsonData.data.displayType = this.args.displayType;
            jsonData.data.deviceType = this.itemValue.data.deviceType;
            this.rootJson.push(jsonData);
          }
        } else {
          let jsonData = JSON.parse(json);
          if (this.rootQuery.data) jsonData.paramData = this.rootQuery.data;
          jsonData.data.isRelation = this.isRelation;
          jsonData.data.displayType = this.args.displayType;
          jsonData.data.deviceType = this.itemValue.data.deviceType;
          this.rootJson = jsonData;
        }
      } catch (e) {
        console.log("加载表单内容错误，表单内容为空！", e, json);
        return;
      }
      try {
        if (this.args.multi) {
          for (var i = 0; i < this.queryData.uuid.length; i++) {
            this.rootJson[i].data.origin = {};
            // if (this.rootQuery.obj) this.$set(this.rootJson[i].data, 'origin', this.rootQuery.obj[i]);
            if (this.args.displayType != "create") {
              switch (this.rootJson[i].data.isRelation) {
                case true:
                  this.rootJson[i].data.origin = this.RelationSingleA(this.queryData.targetClass, this.queryData.uuid[i]) || {};
                  break;
                case false:
                  this.rootJson[i].data.origin = this.EntitySingle(this.queryData.targetClass, this.queryData.uuid[i]) || {};
                  break;
              }
            }
            this.itemData[this.items[i].uuid] = this.rootJson[i].data.origin;
            this.itemDataJson[this.items[i].uuid] = this.rootJson[i];
          }
        } else {
          // if (this.rootQuery.obj) this.$set(this.rootJson.data, 'origin', this.rootQuery.obj);
          this.rootJson.data.origin = {};
          if (this.args.displayType != "create") {
            switch (this.rootJson.data.isRelation) {
              case true:
                this.rootJson.data.origin = this.RelationSingleA(this.queryData.targetClass, this.queryData.uuid) || {};
                break;
              case false:
                this.rootJson.data.origin = this.EntitySingle(this.queryData.targetClass, this.queryData.uuid) || {};
                break;
            }
          }
        }
      } catch (e) {
        console.log("数据查询失败", e);
      }
      this.onload = true;
      this.$nextTick(async () => {
        if (this.args.multi) {
          for (var i = 0; i < this.queryData.uuid.length; i++) {
            // 调用初始化操作
            if (this.rootJson[i].init_opr_type) {
              let queryData = {
                ...this.queryData,
                query: `and plt_oid=${this.queryData.uuid[i]}`
              }
              await this.invokeOperation(this.rootJson[i].init_opr_type, this.rootJson[i].init_opr_path, this.rootJson[i], this.store, queryData);
            }
          }
        } else {
          if (this.rootJson.init_opr_type) {
            await this.invokeOperation(this.rootJson.init_opr_type, this.rootJson.init_opr_path, this.rootJson, this.store, this.queryData);
          }
        }
        if (this.addOpr && this.args.multi) {
          this.unit_height = this.$refs.root2.children[0].clientHeight + "px";
          this.last_margin_top = parseInt(this.$refs.root2.children[0].clientHeight / 4) + "px";
          this.last_font_size = parseInt(this.$refs.root2.children[0].clientHeight / 2) + "px !important";
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
      })
    },


    getJsonData(item, id) {
      if (!item) return null;
      if ("self" in item) {
        if (item.self.properties.id == id) return item;
      }
      for (var i = 0; i < item.elements.length; i++) {
        var res = this.getJsonData(item.elements[i], id);
        if (res) return res;
      }
      return null;
    },

    // GetJsonData(item, id) {
    //   if (!item) return null;
    //   if ("self" in item) {
    //     if (item.self.properties.id == id) return item;
    //   }
    //   for (var i = 0;i < item.elements.length;i++) {
    //     var res = this.GetJsonData(item.elements[i], id);
    //     if (res) return res;
    //   }
    //   return null;
    // },

    // 根据id获取控件实例
    getAddinById(id, index) {
      // if (this.args.multi && index) {
      //   return this.GetAddinById(this.rootJson[index - 1].data, id)
      // }else{
      //   return this.GetAddinById(this.rootJson.data, id)
      // }
      return this.addinIdMap[id];
    },

    getCardByOid(oid) {
      if (this.args.multi) {
        for (let i = 0; i < this.queryData.uuid.length; i++) {
          if (this.queryData.uuid[i] === oid) {
            return this.$refs.root2.children[i];
          }
        }
      } else {
        return this.$refs.root;
      }
    },

    getRootAddin() {
      return this.getRootAddin();
    },

    loadScriptUrl(url) {
      var script = document.createElement("script");
      script.type = "text/javascript";
      script.src = url; //添加地址
      document.body.appendChild(script);
    },
    loadScriptString(code) {
      var script = document.createElement("script");
      script.type = "text/javascript";
      try {
        script.appendChild(document.createTextNode(code));
      } catch (ex) {
        script.text = code;
      }
      document.body.appendChild(script);
    },
    ...mapActions("DWF_form", ["updateFView", "deleteFView", "queryEntity", "queryRelation", "handleQueryData", "handleQueryForm", "getAttributeClassMap",
      "deleteEObj", "saveEObj", "editEObj", "updateFormJsonAct", "updataEntityobjAct",
      "handleQueryForm"])

  },
  computed: {
    // 使用对象展开运算符将此对象混入到外部对象中
    ...mapGetters("DWF_form", [
      "EntityList",
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
      "Entities", "EntitySingle", "RelationSingleA", "Relations", "RelationSingle", "QueryResult", "QueryResultAll",
      "Attributes",
      "AttributesByClass"
    ]),

    arg_width() {
      return this.args.width + this.args.widthType;
    },

    arg_height() {
      return 'heightType' in this.args ? this.args.height + this.args.heightType : this.args._height + "px";
    },

    arg_unit_height() {
      if (this.args.unit_heightType && this.args.unit_heightType == "%") return "auto";
      return this.args.unit_height + "px";
    },

    arg_targetClass() {
      return this.args.bindTargetClass.split('\&')[0];
    },

    //初始化控件props
    addinProps() {
      return {
        store: this.$store,
        route: this.route,
        root: this.root,
        query: this.rootQuery,
        attributes: this.attributesList,
        formEngine: this,
        Message: this.Message,
        echarts: this.$echarts,
        dwf_ctx: this.dwf_ctx,
        parent: this
      }
    },
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

.formUnit:hover {
  box-shadow: rgba(0, 0, 0, 0.118) 0px 1px 6px 8px, rgba(0, 0, 0, 0.118) 0px 1px 4px
}

.formUnit.selected {
  border: 1px solid blue
}
</style>
<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.org-form {
  background-color: #f3f3f3;
}

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

section {
  width: auto;
  height: auto;
  display: inline-block;
}
</style>
