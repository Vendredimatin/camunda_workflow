<template>
  <section v-show="!args.hided" :addinName="name" ref="main" class="clearfix" :style="{'width': arg_width, 'display': 'flex', 'flex-direction': 'column', 'min-height': arg_height, 'margin-bottom': '5px','float': 'left'}">
    <div v-show="args.readonly && !args.hided" class="readonly-mask"></div>
    <div v-show="!args.hided" ref="gridWrapper" :style="{'display': 'flex', 'flex-direction': 'column', 'height': arg_height}">
      <ag-grid-vue
              ref="grid"
              v-show="!args.hided"
              :class="args.agGridTheme"
              :columnDefs="args.columnDefs"
              :defaultColDef="defaultColDef"
              :rowData="rowData"
              :enableFilter="args.enableFilter"
              :rowSelection="arg_rowSelection"
              :rowDragManaged="args.rowDragManaged"
              :statusBar="args.statusBarConfig"
              :enableRangeSelection="args.rangeSelection"
              :suppressClickEdit="args.notEditable"
              :enableCellChangeFlash="args.enableCellChangeFlash"
              :frameworkComponents="args.frameworkComponents"
              suppressPropertyNamesCheck="true"
              paginationAutoPageSize="false"
              suppressPaginationPanel="true"
              @rowSelected="onRowSelected"
              @grid-ready="onGridReady"
              @column-moved="onColMoved"
              @column-resized="onColResized"
              @cellClicked="onCellSingleClicked"
              @cellDoubleClicked="onCellDoubleClicked"
              @cellMouseOver="oncellMouseOver"
              @cellMouseOut="oncellMouseOut"
              :tooltipShowDelay="tooltipShowDelay"
              :processCellForClipboard="processCellForClipboard"
              :getContextMenuItems="getContextMenuItems"
              :localeText="localeText"
              @paste-end="onPasteEnd"
              @cell-value-changed="onCellValueChanged"
              :style="{'width': '100%', 'flex': '1'}"
      ></ag-grid-vue>
      <div v-show="args.pageable || args.enableExport" style=" margin-top: 5px;">
        <Row type="flex" justify="end" style="flex-wrap: nowrap;">
        <Button type="primary" style="margin-right: 15px;" @click="freshDataButton">刷新</Button>
        <span v-show="args.enableExport">
          <Button type="primary" style="margin-right: 15px;" @click="exportCSV('csv')">导出csv</Button>
          <Button type="primary" style="margin-right: 15px;" @click="exportCSV('xlsx')">导出xlsx</Button>
        </span>
          <span style="overflow: hidden; min-height:35px; flex-wrap:nowrap; align-self:flex-end">
          <Page
                  v-show="args.pageable"
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
        </span>
        </Row>

      </div>
    </div>
    <span v-show="isWrong && !args.hided" :style="{'width': '100%', 'display': 'inline-block'}">
      <span v-show="isWrong" class="wrongTips">{{ errorMessage }}</span>
    </span>
    <!-- debug part -->
    <Modal v-if="modalIf" v-model="modal" width="80%" :title="modalTitle">
      <FormEngine :to_path="modalPath" :to_query="modalQuery" :store="store"></FormEngine>
    </Modal>
  </section>
</template>

<script>
import { mapGetters, mapActions, mapMutations } from "vuex";
import { getAddinFunc } from "@/util/addin.js";
import {
  getEobj,
  getEJobj,
  getEobjCount,
  getRobjCount,
  getClass,
  getAllUsers,
  getGroups,
  postSub,
  deleteSub,
  getQueryOperation,
  getEobjSingle,
  getRobjSingle
} from "@/api/others.js";
import AuthRules from "@/api/auth-model/AuthRules";
import { addListener, removeListener, getSockId} from "@/util/webSocket";
import "./ag-grid/Grid.css";
import "@/styles/component/iconfont.css";
import { AgGridVue } from "ag-grid-vue";
import { uuid } from '@/util/assist'
import _ from 'lodash';
import {
  progressBarRender,
  checkboxRender,
  userGroupRender,
  dynamicDigitalRender,
  timeTransferRender,
  operationRender,
  escapeRender,
  customTransferRender
} from "./gridCellRenders.js";
import GridColumnFilter from "./ag-grid/GridColumnFilter";
import GridTooltip from "./ag-grid/GridTooltip";
import JSBI from 'jsbi'
import localeText from './ag-grid/localeText';

const name = "Grid";
export default {
  name: name,
  props: [
    "itemValue",
    "attributes",
    "store",
    "query",
    "argsProps",
    'formEngine',
    'dwf_ctx',
  ],
  data() {
    return {
      wsCommand:  '',
      wsId: '',
      wsData: {},
      subId: '',
      oids: [],
      timer: null,
      name: name,
      args_name: "",
      // 展示模式
      t_preview: false,
      t_show: true,
      t_icon: true,
      t_create: false,
      t_edit: false,
      t_visit: true,
      rowData: null,
      originRowData: null,
      gridLoading: false,
      pageChange: false,
      cellChangeCallback: true,
      isWrong: false,
      errorMessage: '',
      // 编辑框
      args: {
        title: "表格",
        id: "",
        hided: false,
        columnDefs: [],
        enableSorting: true,
        enableFilter: true,
        rowSelection: false,
        colResiable: true,
        rowDragManaged: true,
        notEditable: false,
        readonly: false,
        statusBar: false,
        statusBarConfig: {
        },
        compactMode: false,
        pageable: true,
        enableCellChangeFlash: true,
        width: 100,
        widthType: "%",
        filterQuery: '',
        heightType: "px",
        height: 500,
        select_type: "obj",
        selected_attributes: [],
        bindTargetClass: '',
        targetClass: "",
        oprTargetClass: "",
        query: "",
        dbclk_type: "", // 双击操作类型 sys 等
        dbclk_path: "",
        dbclk_del_alert: true,
        sgclk_type: "",
        sgclk_path: "",
        sgclk_del_alert: true,
        event_oprs: {
          double_click: {
            opr_path: null,
            opr_type: ""
          },
          single_click: {
            opr_path: null,
            opr_type: ""
          }
        },
        frameworkComponents: null,
        pagination: true,
        pageSize: 25,
        cacheGrid: false,
      },
      defaultColDef: {
      },
      uuidTypeColumnList: [],
      lastQuery: null, // 查询一次后 每次翻页时应该保留查询条件
      notClickEditable: false,
      dbclk_queryopr_context: { show: false, id: null }, // 是否可以放在args之外?
      sgclk_queryopr_context: { show: false, id: null }, // 是否可以放在args之外?
      currentPage: 1,
      countPage: 0,
      pageSizeOpts: [25, 50, 100, 200],
      entryCount: 0, //记录当前查询条件条目总数
      edit: false,
      colDefIndex: {},
      chooseCols: false,
      targetClassAttributes: [],
      all_class: [],
      relations: [],
      params: null,
      gridApi: null,
      columnApi: null,
      gridOptions: null,
      inherit: [],
      attrMap: {},
      classAttrMap: {},
      classMap: {},
      relationMap: {},
      init: false,
      open: ["1", "2"],
      _relation: null,
      leftRole: null,
      relationRole: null,
      rightRole: null,
      test: null,
      self: false, // 操作设定中用到的变量
      sg_self: false,
      query_oprs: [], // 快速查询操作类型列表 一般在modeler端读入
      oprs: [
        // 基本操作类型
        {
          id: 0,
          path: "save",
          displayName: "新增"
        },
        {
          id: 1,
          path: "edit",
          displayName: "编辑"
        },
        {
          id: 2,
          path: "delete",
          displayName: "删除"
        },
        {
          id: 3,
          path: "refresh",
          displayName: "刷新"
        }
      ],
      query_opr: null, // app端读取当下的快查操作类型
      sg_query_opr: null, //临时单击使用
      // 快查操作弹框的相关配置
      modalIf: false,
      modal: true,
      modalTitle: "",
      modalPath: "",
      modalQuery: "",
      lastSelectedRowIndex: null, // 辅助判断是否双击/切换新行
      targetClass: null,
      isRelation: null,

      prefix_relation: {
        "left": "left_",
        "relation": "relation_",
        "right": "right_"
      },
      restrictedAccessAttributes: null,
      offline: false,
      rowDataOrigin: null,
      rootQuery: null,
      queryData: {},
      processCellForClipboard: null,
      vPageChange: null,
      vInit: null,
      vDataProcess: null,
      vCellTooltipHover: null,
      vSingleClick: null,
      vDoubleClick: null,
      nextCreate: [],
      tooltipShowDelay: 2000,
      hoverTime: false,
      hoverTimer: null,
      hoverCellData: null,
      selectModalGrid: false,
      selectModalObjects: [],
      externalOpr: false,
      localeText: {},
      sysEventPath: ['save', 'edit', 'delete'], //可绑定后处理操作的系统事件
    };
  },
  components: {
    AgGridVue
  },
  beforeDestroy() {
    if (this.timer) { clearInterval(this.timer); this.timer = null; };
    if (typeof this.wsId != 'string' && this._relation) {
      removeListener(this.wsCommand[this._relation.leftClass], this.wsId[this._relation.leftClass]);
      removeListener(this.wsCommand[this._relation.className], this.wsId[this._relation.className]);
      removeListener(this.wsCommand[this._relation.rightClass], this.wsId[this._relation.rightClass]);
    }else{
      removeListener(this.wsCommand, this.wsId);
    }
  },
  beforeMount() {
    this.localeText = localeText;
    this.initEventOpr();
    this.initColumnProperties();
    this.initClipboardEvent();
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
    'getClassObject',
    'getRClassObject',
    'invokeOperation',
    'parseEscapeString',
    'handleScript',
    'addExtraObj',
    'getEventOperation',
    'invokeEvent',
  ],
  created() {
    //通过prop给控件初始化
    this.setDisplayType(this.query.displayType);
    this.setArgs(this.argsProps);

    this.$store = this.store;
    this.rootQuery = _.cloneDeep(this.query);
    this.targetClass = this.itemValue.data.targetClass;
    this.isRelation = this.itemValue.data.isRelation;
  },
  async mounted() {
  },
  updated() {
    // console.log("updated@grid-app");
    // console.log("params@updated", this.params);
    // console.log("columnDefs@Grid-app", this.args.columnDefs);
  },
  computed: {
    ...mapGetters("DWF_form", [
      "QueryResult",
      "EntitySingle",
      "EntityAttrList",
      "Entities",
      "RelationSingle",
      "Relations",
      "RelationAttrList",
      "LeftRelations",
      "RightRelations",
      "QueryResultAll",
      "QueryResultList",
      "AttributesByClass"
    ]),
    arg_width() {
      return this.args.width + this.args.widthType;
    },
    dbclk_path() {
      // 协助watch侦听
      return this.args.dbclk_path;
    },
    sgclk_path() {
      return this.args.sgclk_path;
    },
    arg_columnDefs() {
      // assist watch columnDefs
      return this.args.columnDefs;
    },
    arg_height() {
      // if(this.args.compactMode){
      //
      // }else{
      //
      // }
      return this.args.height + this.args.heightType;
    },
    arg_relation_class() {
      return this.args.relation_class;
    },
    arg_all_class() {
      return this.args.all_class;
    },
    arg_select_type() {
      return this.args.select_type;
    },
    arg_query() {
      return this.args.filterQuery;
    },
    arg_targetClass() {
      return this.args.targetClass;
    },
    arg_rowSelection() {
      return this.args.rowSelection ? "multiple" : "single";
    },
    arg_pageSize() {
      return this.args.pageSize;
    },
    arg_cellRendererParams(){
      if (this.args.columnDefs
      && this.args.columnDefs.cellRendererParams)
        return this.args.columnDefs[this.args.columnDefs.length-1].cellRendererParams;
      else return 0;
    },
  },
  watch: {
    arg_cellRendererParams(val){
        // console.log("TargetChanged!!!!!!!");
    },
    'args.readonly'(val){
      this.args.notEditable = val;
    },
    async arg_pageSize(val) {

    },
    arg_query(newVal){
      // FIXME: 注意此处针对order的写法做了修正
      if (newVal.substring(0, 5)=="order"){
        this.args.filterQuery = "and 1=1 " + newVal;
      }
    },
    sgclk_path(val) {
    },
    dbclk_path(val) {
    },
    edit(val) {
      if (this.t_preview) {
        this.$refs.main.setAttribute("draggable", !val);
      }
    },
    async arg_targetClass(val) {
      if (!this.t_preview) return;
      console.log("!!", val, this.classAttrMap);
      if (val in this.relationMap) {
        this.args.select_type = "relation";
        await this.queryRelation(val);
        this._relation = this.Relations(val);
        if (!(this._relation.leftClass in this.classMap))
          this.classMap[this._relation.leftClass] = await this.getEntity(
            this._relation.leftClass
          );
        if (!(this._relation.rightClass in this.classMap))
          this.classMap[this._relation.rightClass] = await this.getEntity(
            this._relation.rightClass
          );
        this.classMap[this._relation.r];
        this.leftRole = this._relation.leftRole;
        this.relationRole = this._relation.displayName;
        this.rightRole = this._relation.rightRole;
        if (!(val in this.classAttrMap)) {
          var attr = this.RelationAttrList(val);
          attr.forEach(x => (that.attrMap[x.attributeName] = x));
          this.classAttrMap[val] = attr;
        }
        if (!(this._relation.leftClass in this.classAttrMap))
          await this.addAttributes(this._relation.leftClass);
        if (!(this._relation.rightClass in this.classAttrMap))
          await this.addAttributes(this._relation.rightClass);
        this.targetClassAttributes = {
          left: this.classAttrMap[this._relation.leftClass],
          relation: this.classAttrMap[this._relation.className],
          right: this.classAttrMap[this._relation.rightClass]
        };
        this.args.selected_attributes = {
          left: [],
          relation: [],
          right: []
        };
      } else {
        this.args.select_type = "obj";
        if (
          !this.args.selected_attributes ||
          this.args.selected_attributes.length == 0
        )
          this.args.selected_attributes = [];
        if (!(val in this.classMap))
          this.classMap[val] = await this.getEntity(val);
        if (!(val in this.classAttrMap)) await this.addAttributes(val);
        this.targetClassAttributes = this.classAttrMap[val];
      }
      console.log(
        "!!!",
        val,
        this.args.select_type,
        this.targetClassAttributes,
        this.classAttrMap,
        this.attrMap
      );
    }
  },
  methods: {
    ...mapActions("DWF_form", [
      "handleQueryData",
      "queryRelation",
      "queryEntity",
      "editEObj",
      "editEJObj",
      "deleteEObj",
      "saveEObj",
      "getAttributeClassMap"
    ]),
    ...mapMutations("DWF_form", ["addEntity"]),

    async onGridReady(params) {
      this.params = params;
      this.gridApi = params.api;
      this.columnApi = params.columnApi;
      this.gridOptions = params.api.gridOptionsWrapper.gridOptions;

      if(this.vInit){
        await this.invokeOperation(this.vInit.opr_type, this.vInit.opr_path, this.itemValue, this.store, null, null, null, {
          event: this.vInit
        });
      }
      await this.initUserAndGroupMap();
      this.initWidth();
      this.wrappedSetColumnDefs();
      setTimeout(async () => {
        await this.freshData();
        this.sizeColumnsToFit();
      }, 0)
    },
    //设置行样式
    getRowStyle(fn){
      this.gridOptions.getRowStyle = fn;
    },

    //设置行样式
    setRowClass(fn){
      this.gridOptions.getRowClass = fn;
    },
    /**
     * 刷新数据
     * step1执行更新数据
     * initial情况query = undefined fresh = undefined
     * step2执行刷新行高
     */
    async freshData(query, fresh, freshCol = true) {
      // if(this.args.columnDefs.length === 0){
      //   this.rowData = [];
      //   return
      // }
      if (fresh == null) fresh = true;
      await this.updateQuery(query, fresh, freshCol);
      this.adjustRowHeight();
    },
    async freshDataButton(){
      if(this.gridLoading) return;
      this.gridLoading = true;
      this.currentPage = 1;
      if(this.args.select_type == "relation"){
        let queryData = {
          query: {query: "",}, // 查询条件
          targetClass: "",    // 目标类名
          formName: "",   //
          uuid: "",
          fresh: true
        };
        queryData.relationClass = this.args.targetClass;
        queryData.query.type = "relation";
        await this.handleQueryData(queryData);
      }else{
        let queryData = {
          query: {query: "",}, // 查询条件
          targetClass: this.args.targetClass,    // 目标类名
          formName: "",   //
          uuid: "",
          fresh: true
        };
        await this.handleQueryData(queryData);
      }
      await this.freshData()
      this.$Message.success("刷新成功");
    },
    /**
     * @description刷新nextcreate对象
     */
    async freshDataNextCreate(nextcreate){
      nextcreate = nextcreate.filter(obj => obj.tobeClassName === this.args.targetClass);
      this.nextCreate = _.cloneDeep(nextcreate) ;
      await this.freshData()
    },
    /**
     * @description刷新nextcreate对象
     */
    async clearNextCreate(){
      this.nextCreate = [];
      await this.freshData()
    },
    /**
     * @description
     * 动态刷新数据,由于双向通讯接口不完善，针对一个关联类多对象控件
     * 单纯的监听关联类情况下，左类与右类改变只会返回left_oid与right_oid
     * 无法做到刷新相应数据
     * 只有建立左类、右类、关联类三个监听分别组装数据进行刷新
     * setDataValue接口会刷新cellrender需要独立判断
     */
    dynamicFreshData(data, index) {
      this.cellChangeCallback = false;
      if(!data) return;
      let refreshDone = false;
      if(this.args.select_type != "relation"){
        this.gridApi.forEachNode(node => {
          if(node.data.oid === data.oid){
            for(let key of Object.keys(data)){
              if(node.data[key] !== data[key]){
                let result = this.args.columnDefs.filter(item => item.field === key);
                result.length !== 0 && result[0]._cellRendererFramework === 'dynamicDigitalRender' ? (node.setDataValue(`${key}_id`, data[key]), refreshDone = true)  : '';
              }
            }
            !refreshDone && node.setData(Object.assign(node.data, data));
          }
        })
      }else{
        //左类
        if(this.oids[this._relation.leftClass].indexOf(data.oid) != -1){
          data = this.utilAddPrefix(data, 'left');
          this.gridApi.forEachNode(node => {
            //扁平化关联类数据情况
            if(node.data.left_oid === data.left_oid){
              for(let key of Object.keys(data)){
                if(node.data[key] !== data[key]){
                  let result = this.args.columnDefs.filter(item => item.field === key);
                  result.length !== 0 && result[0]._cellRendererFramework === 'dynamicDigitalRender' ? (node.setDataValue(`${key}_id`, data[key]), refreshDone = true)  : '';
                }
              }
              !refreshDone ? this.wsData = Object.assign(node.data, data) : '';
            }
          })
        //右类
        }
        if(this.oids[this._relation.rightClass].indexOf(data.oid) != -1){
          data = this.utilAddPrefix(data, 'right');
          this.gridApi.forEachNode(node => {
            if(node.data.right_oid === data.right_oid){
              for(let key of Object.keys(data)){
                if(node.data[key] !== data[key]){
                  let result = this.args.columnDefs.filter(item => item.field === key);
                  result.length !== 0 && result[0]._cellRendererFramework === 'dynamicDigitalRender' ? (node.setDataValue(`${key}_id`, data[key]), refreshDone = true)  : '';
                }
              }
              !refreshDone ? this.wsData = Object.assign(this.wsData, data) : '';
            }
          })
        }
        if(this.oids[this._relation.className].indexOf(data.oid) != -1){
          data = this.utilAddPrefix(data, 'relation');
          this.gridApi.forEachNode(node => {
            if(node.data.relation_oid === data.relation_oid){
              for(let key of Object.keys(data)){
                if(node.data[key] !== data[key]){
                  let result = this.args.columnDefs.filter(item => item.field === key);
                  result.length !== 0 && result[0]._cellRendererFramework === 'dynamicDigitalRender' ? (node.setDataValue(`${key}_id`, data[key]), refreshDone = true)  : '';
                }
              }
              !refreshDone ? node.setData(Object.assign(this.wsData, data)) : '';
            }
          })
        }
        this.$nextTick(() => {
          this.gridApi.redrawRows();
        })
      }
    },
    /**
     * 离线刷新数据
     */
    freshOfflineData(data){
      this.rowDataOrigin = _.cloneDeep(this.rowData);
      this.rowData = data;
    },
    /**
     * 增加前缀
     * @data
     * @type
     */
    utilAddPrefix(data, type){
      let newData = {};
      Object.keys(data).forEach(item => {
        newData[`${type}_${item}`] = data[item];
      });
      return newData;
    },
    /**
     * 更新数据
     * initial情况query = undefined fresh = undefined
     * step1确认为关联/实体类
     * 关联：
     * 实体：1确认目标类是否在类映射表@classMap中，2确认目标类是否在类属性映射表@classAttrMap中
     * @classMap：以classname为key值，类属性value
     * @classAttrMap：以classname为key值，类所有对象为value
     * step2确定查询条件 优先级参数query > lastQuery > args.filterQuery > blank query(initial)
     * @queryData{
     *   query: {
     *     query: '',
     *     startIndex: '',
     *     pageSize: '',
     *     type: relation/obj
     *   },
     *   relationClass: '',
     *   targetClass: '',
     *   fresh: true/false
     * }
     * step3继续组装queryData,
     * step4如果表格中uuid类型oid显示进行替换，执行查询操作获得行数据rowData,对象数counts保存queryData
     * 建立双向通讯
     * 关联类rowData处理较复杂
     */
    async updateQuery(query, fresh, freshCol = false) {
      // console.log(query)
      if(!this.args.cacheGrid){
        fresh = fresh || true;
        this.targetClass = this.getSelectedClass();
        this.isRelation = this.args.select_type == "relation" ? true : false;
        /**
         * TODO: step1
         */
        if (this.args.select_type == "relation" && !this._relation) {
          if (!this._relation) {
            await this.queryRelation(this.args.targetClass);
            this._relation = this.Relations(this.args.targetClass);
          }
          if (!(this._relation.leftClass in this.classMap))
            this.classMap[this._relation.leftClass] = await this.getEntity(
              this._relation.leftClass
            );
          if (!(this._relation.rightClass in this.classMap))
            this.classMap[this._relation.rightClass] = await this.getEntity(
              this._relation.rightClass
            );

          if (!(this.args.targetClass in this.classAttrMap)) {
            let attr = this.RelationAttrList(this.args.targetClass);
            attr.forEach(x => (this.attrMap[x.attributeName] = x));
            this.classAttrMap[this.args.targetClass] = attr;
          }
          if (!(this._relation.leftClass in this.classAttrMap))
            await this.addAttributes(this._relation.leftClass);
          if (!(this._relation.rightClass in this.classAttrMap))
            await this.addAttributes(this._relation.rightClass);
        } else {
          if (!(this.args.targetClass in this.classMap))
            this.classMap[this.args.targetClass] = await this.getEntity(
              this.args.targetClass
            );
          if (!(this.args.targetClass in this.classAttrMap))
            await this.addAttributes(this.args.targetClass);
        }
        /**
         * TODO: step2
         */
        let that = this;
        let _query = {
          ...this.args._query
        };
        let searchBoxQuery = false;
        if(query){
          if(query == 'reset') query = '';
          if (typeof query!="string"){
            searchBoxQuery = true;
            query = await this.handleQueryObj(query, this);
          }else{
            // if(this.itemValue.data.isRelation){
            //   query = this.parseEscapeString(query, null, null, this.itemValue.data.origin, {
            //     left: this.AttributesByClass(this.itemValue.data.origin.relation_leftClass),
            //     relation: this.AttributesByClass((this.itemValue.data.targetClass)),
            //     right: this.AttributesByClass(this.itemValue.data.origin.relation_rightClass),
            //   }, this.$store);
            // }else{
            //   query = this.parseEscapeString(query, null, null, this.itemValue.data.origin, this.AttributesByClass((this.itemValue.data.targetClass)), this.$store);
            // }
            query = this.parseEscapeString(query, null, null, this.itemValue.data.origin, this.attributes, this.$store);
          }
          _query.query = query;
        } else {
          if (this.lastQuery)  _query.query = this.lastQuery;
          else {
            if (this.args.filterQuery && typeof this.args.filterQuery=="string" && this.args.filterQuery != "") {
              // if(this.itemValue.data.isRelation){
              //   _query.query = this.parseEscapeString(this.args.filterQuery, null, null, this.itemValue.data.origin, {
              //     left: this.AttributesByClass(this.itemValue.data.origin.relation_leftClass),
              //     relation: this.AttributesByClass((this.itemValue.data.targetClass)),
              //     right: this.AttributesByClass(this.itemValue.data.origin.relation_rightClass),
              //   }, this.$store);
              // }else{
              //   _query.query = this.parseEscapeString(this.args.filterQuery, null, null, this.itemValue.data.origin, this.AttributesByClass((this.itemValue.data.targetClass)), this.$store);
              // }
              _query.query = this.parseEscapeString(this.args.filterQuery, null, null, this.itemValue.data.origin, this.attributes, this.$store);
            } else{
              _query.query = "";
            }
          }
        }
        this.lastQuery = _query.query;
        this.queryData = {
          query: _query,
          targetClass: "",
          fresh: fresh
        };
        // queryData.query.query = queryData.query.query ? queryData.query.query.substring(0, 5) == "order" ? queryData.query.query.replace(/"/g, "'") : '' : '';
        this.queryData.query.query = this.queryData.query.query ? this.queryData.query.query.trim() : '';
        if(!this.queryData.query.query && this.rootQuery.query) this.queryData.query.query = this.rootQuery.query;
        await this.entryCounts(this.queryData.query.query);
        //fix bug 7275
        if (searchBoxQuery){
          this.currentPage = 1;
          searchBoxQuery = false;
        }
        this.queryData.query.startIndex = this.args.pageSize * (this.currentPage - 1);
        this.queryData.query.pageSize = this.args.pageSize;
        this.queryData.fresh = true;
        /**
         * TODO: step3
         */
        let data;
        let params = {
          condition: this.queryData.query.query
        }
        if(this.args.pageable){
          params.pageSize = this.queryData.query.pageSize;
          params.startIndex = this.queryData.query.startIndex;
        }
        if (this.args.select_type == "relation") {
          this.queryData.query.type = "relation";
          this.queryData.targetClass = this.targetClass;
          this.queryData.leftClass = this._relation.leftClass;
          this.queryData.rightClass = this._relation.rightClass;
          this.queryData.relationClass = this._relation.className;
          data = await getEJobj(this.args.targetClass, params);
        } else {
          this.queryData.targetClass = this.args.targetClass;
          this.queryData.query.type = "obj";
          data = await getEobj(this.args.targetClass, params);
        }
        // this.handleQueryData(this.queryData);
        if(!data.data.success){
          this.$Message.error(data.data.message);
          return;
        }
        let columnAttrList = this.args.columnDefs.map(item => item.attrName);
        this.originRowData = data.data.data;
        /**
         * TODO: step4
         */
        this.uuidTypeColumnList = Object.keys(this.attrMap).filter(item => {
          return this.attrMap[item].valueType == 'UUID';
        });

        // let userAndGroupMap = await this.initUserAndGroupMap();
        if (this.args.select_type == "relation") {
          let left_data = data.data.data[0] || [];
          let relation_data = data.data.data[1] || [];
          let right_data = data.data.data[2] || [];
          this.oids = {};
          this.oids[this._relation.leftClass] = [];
          this.oids[this._relation.className] = [];
          this.oids[this._relation.rightClass] = [];
          //处理源Data return行数据
          if(!relation_data) return false;
          this.originRowData = relation_data.map((item, index) => {
            let newData = {};
            let leftData = {};
            let rightData = {};
            //增加左类标识，替换类型为uuid的用户名或组
            leftData = left_data.filter(left => {
              return left.oid === item['leftOid'];
            })[0];
            // leftData ? Object.keys(leftData).forEach(key => {
            //   newData[`left_${key}`] = this.uuidTypeColumnList.indexOf(key) !== -1
            //     ? (leftData[key] && userAndGroupMap[leftData[key]])
            //       ? userAndGroupMap[leftData[key]]
            //       : leftData[key]
            //     : leftData[key];
            // }) : '';
            leftData ? Object.keys(leftData).forEach(key => {
              newData[`left_${key}`] = leftData[key];
            }) : '';
            //增加关联类标识，替换类型为uuid的用户名或组
            item ? Object.keys(item).forEach(key => {
              newData[`relation_${key}`] = item[key];
            }) : '';
            //增加右类标识，替换类型为uuid的用户名或组
            rightData = right_data.filter(right => {
              return right.oid === item['rightOid'];
            })[0];
            rightData ? Object.keys(rightData).forEach(key => {
              newData[`right_${key}`] = rightData[key];
            }) : '';
            this.oids[this._relation.leftClass].push(newData['left_oid']);
            this.oids[this._relation.className].push(newData['relation_oid']);
            this.oids[this._relation.rightClass].push(newData['right_oid']);
            return newData;
          });
        }else{
          if(columnAttrList.length != 0 && data.data.data){
            this.originRowData = data.data.data.map(item => {
              let newData = item;
              // this.uuidTypeColumnList.forEach(uuidItem => {
              //   (item[uuidItem] && userAndGroupMap[item[uuidItem]]) ? newData[uuidItem] = userAndGroupMap[item[uuidItem]] : '';
              // });
              this.oids.push(item.oid);
              return newData;
            })
          }else{
            return false;
          }
        }
      }
      this.originRowData = this.generateNextCreate(this.originRowData);
      if(!this.args.cacheGrid){
        await this.initAuth();
      }
      if(this.vDataProcess){
        await this.invokeOperation(this.vDataProcess.opr_type, this.vDataProcess.opr_path, this.itemValue, this.store);
      }
      this.setRowData(this.originRowData);
      if(!this.args.cacheGrid){
        this.createSocketLink();
        await this.columnDefsRefFix(freshCol);
      }
      //弹窗表格记录选中状态
      if(this.selectModalGrid){
        this.selectModalRow();
      }
      //自适应自定义操作列
      if(this.externalOpr){
        this.setExternalOprConfig()
      }
    },
    /**
     * 将类加入classAttrMap中
     *
     */
    async addAttributes(className) {
      await this.queryEntity(className);
      var attr = this.EntityAttrList(className);
      let that = this;
      attr.forEach(x => (that.attrMap[x.attributeName] = x));
      this.classAttrMap[className] = attr;
    },
    /**
     * 查询counts
     *
     */
    async entryCounts(query) {
      if (!this.args.targetClass) return;
      if (this.pageChange){
        this.pageChange = false;
        return ;
      }
      let allObjCnt;
      if (this.args.select_type == "relation"){
        allObjCnt = await getRobjCount(this.args.targetClass, {
          condition: query
        })
      } else {
        allObjCnt = await getEobjCount(this.args.targetClass, {
          condition: query
        })
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
          this.entryCount < this.args.pageSize ? this.currentPage = 1 : '';
          break;
      }
      console.log()
    },
    /**
     * 执行query对象搜索处理query
     */
    async handleQueryObj(query, that){
      let _ret = "";
      let _comret = '';
      let _class;
      let _str = ["String", "UUID", "Clob", "Date", "TimeStamp"];
      let _int = ["Integer", "Long", "Double"];
      if (that.args.select_type=="relation"){
        _class = [
          `left_${that._relation.leftClass}`,
          `right_${that._relation.rightClass}`,
          that._relation.className
        ];
      } else {
        _class = [that.args.targetClass];
      }
      for (var i=0; i<query.length; i++){
        let m_class = query[i].className;
        let isCommonClass = query[i].belongClass.substring(0,4) == "重复属性" ? true : false;
        let attr = query[i].attrName.substring(0, query[i].attrName.indexOf("&"));
        let type = query[i].valueType;
        let value = query[i].value;
        let iType = query[i].attrType;
        console.log(type, value, typeof value)
        if(type == 'Boolean') {
          value = value + '';
        }
        let __ret = "";
        let __comRet = "";
        if (_class.indexOf(m_class)==-1 || value==null || value == "" || value == undefined || (typeof value == 'number' && isNaN(value))) continue;
        let self_pre = '';
        let self_timePre = "'";

        let finalMClass = '';
        if(m_class.indexOf('left_') != -1 || m_class.indexOf('right_') != -1) {
          finalMClass = m_class.split('_')[1];
        } else {
          finalMClass = m_class;
        }
        let mct = await getClass(finalMClass);
        let isExternal = mct.data.data.classCategory === 'ExternalItemClass';
        console.log("isExternal", isExternal);

        // 实体类 obj.Attr
        // 外部实体类 obj."Attr"
        // 关联类 obj.left_Attr / obj.right_Attr / obj.relation_Attr

        if (!isExternal) {
          self_pre = 'obj.';
          self_timePre = '';
        }

        if (_class.length == 3) {
          // if (m_class == _class[0]) m_class = "leftClass";
          // else if (m_class == _class[1]) m_class = "rightClass";
          // else m_class = "relationClass";
          if (m_class == _class[0]) self_pre = "obj.left_";
          else if (m_class == _class[1]) self_pre = "obj.right_";
          else self_pre = "obj.relation_";
        }

        if (type == "String") {
          // 查询条件为字符串时 拼接查询语句的方式较为固定

          if (iType == 'SelectMutiInput') {
            let strValue = value.split(',');
            let temStr = '';
            if (strValue) {
              strValue.forEach(s => {
                // temStr = `${temStr} ${m_class}.${self_pre}${attr} like '%${s}%' or`
                temStr = isExternal ? `${temStr} obj."${attr}" like '%${s}%' or` : `${temStr} ${self_pre}${attr} like '%${s}%' or`
              })
              if (temStr != '') {
                temStr = temStr.substring(0, temStr.length - 3);
              }

              if (isCommonClass) { // 只有关联类存在重复属性
                __comRet = ` or (${temStr})`;
              } else {
                __ret = ` and (${temStr})`;
              }
            } else {
              __ret = '';
              __comRet = '';
            }
          } else {

            if (isCommonClass) {
              __comRet = ` or ${self_pre}${attr} like '%${value}%'`;
            } else {
              __ret = isExternal ? ` and obj."${attr}" like '%${value}%'` : ` and ${self_pre}${attr} like '%${value}%'`;
            }

          }

        }
        // else if (type == 'Integer' || type == 'Long'){
        //   // 查询条件为布尔型变量时 拼接查询语句方式固定
        //   let _value = parseInt(value);
        //   __ret = ` and ${m_class}.${self_pre}${attr} = ${_value}`;
        //   console.log(__ret)
        // }
        else if (type == "Boolean") {
          // 查询条件为布尔型变量时 拼接查询语句方式固定
          let _value = typeof value == "string" ? value == "true" : value;
          if (isCommonClass) {
            __comRet = ` or ${self_pre}${attr} = ${_value}`;
          } else {
            // __ret = ` and ${m_class}.${self_pre}${attr} = ${_value}`;
            __ret = isExternal ? ` and obj."${attr}" = ${_value}` : ` and ${self_pre}${attr} = ${_value}`;
          }
        }
        else if (typeof value == "object") {
          // 查询值可能有2个或1个
          // 分别考虑属性为字符串或直接值的方式
          if(isCommonClass) {
            if (_str.indexOf(type) != -1) __comRet = ` or ${self_pre}${attr} between '${value[0]}' and '${value[1]}'`;
            if (_int.indexOf(type) != -1) __comRet = ` or ${self_pre}${attr} between ${self_timePre}${value[0]}${self_timePre} and ${self_timePre}${value[1]}${self_timePre}`;
          } else {
            if (_str.indexOf(type) != -1)
              // __ret = ` and ${m_class}.${self_pre}${attr} between '${value[0]}' and '${value[1]}'`;
              __ret = isExternal ? ` and obj."${attr}" between '${value[0]}' and '${value[1]}'` : ` and ${self_pre}${attr} between '${value[0]}' and '${value[1]}'`;
            if (_int.indexOf(type) != -1)
              // __ret = ` and ${m_class}.${self_pre}${attr} between ${self_timePre}${value[0]}${self_timePre} and ${self_timePre}${value[1]}${self_timePre}`;
              __ret = isExternal ? ` and obj."${attr}" between ${self_timePre}${value[0]}${self_timePre} and ${self_timePre}${value[1]}${self_timePre}` : ` and ${self_pre}${attr} between ${self_timePre}${value[0]}${self_timePre} and ${self_timePre}${value[1]}${self_timePre}`;
          }

        } else {

          if (iType == 'SelectMutiInput') {
            let strValue = value.split(',');
            let temStr = '';
            if(strValue) {
              strValue.forEach(s => {
                if (_str.indexOf(type) != -1) {
                  if (type == 'TimeStamp' || type == 'Date') {
                    s = s.replace(/\&/ig, ':');
                  }
                  // temStr = `${temStr} ${m_class}.${self_pre}${attr} = '${s}' or`
                  temStr = isExternal ? `${temStr} obj."${attr}" = '${s}' or` : `${temStr} ${self_pre}${attr} = '${s}' or`
                }
                if (_int.indexOf(type) != -1) {
                  // temStr = `${temStr} ${m_class}.${self_pre}${attr} = ${s} or`
                  temStr = isExternal ? `${temStr} obj."${attr}" = ${s} or` : `${temStr} ${self_pre}${attr} = ${s} or`
                }
              })
              if (temStr != '') {
                temStr = temStr.substring(0, temStr.length - 3);
              }
              if (isCommonClass) {
                __comRet = ` or (${temStr})`;
              } else {
                __ret = ` and (${temStr})`;
              }
            } else {
              __ret = '';
              __comRet = '';
            }
          } else {

            if (isCommonClass) {
              if (_str.indexOf(type) != -1) __comRet = ` or ${self_pre}${attr} = '${value}'`;
              if (_int.indexOf(type) != -1) __comRet = ` or ${self_pre}${attr} = ${value}`;
              // if (_str.indexOf(type) != -1) __comRet = ` or ${m_class}.${self_pre}${attr} = '${value}'`;
              // if (_int.indexOf(type) != -1) __comRet = ` or ${m_class}.${self_pre}${attr} = ${value}`;
            } else {
              if (_str.indexOf(type) != -1)
                // __ret = ` and ${m_class}.${self_pre}${attr} = '${value}'`;
                __ret = isExternal ? ` and obj."${attr}" = '${value}'` : ` and ${self_pre}${attr} = '${value}'`;
              if (_int.indexOf(type) != -1)
                // __ret = ` and ${m_class}.${self_pre}${attr} = ${value}`;
                __ret = isExternal ? ` and obj."${attr}" = ${value}` : ` and ${self_pre}${attr} = ${value}`;
            }

          }

        }

        if (__ret) _ret += __ret;
        if (__comRet) _comret += __comRet;
      }

      let fixCom = '';
      if(_comret) {
        fixCom = ` and (${_comret.slice(3)})`;
      }
      _ret += fixCom;
      //排除表格原生+查询框查询方式
      let gridQuery = this.parseEscapeString(this.args.filterQuery, null, null, this.itemValue.data.origin, this.attributes, this.$store)
      if(/^\s{0,}nativequery:/g.test(gridQuery)){
        _ret = `${gridQuery}`;
      }else{
        _ret = `${_ret} ${gridQuery}`;
      }
      return _ret;
    },
    /**
     * 对列做了引用后 调用该方法替换colDef完成引用数据的显示
     * 本质将colDef中的field做替换 并在rowData中增加新的数据列
     * 需要在取消引用时做还原
     * 当前读取数据直接调用others中的api 事后应整合到store中
     * console.log("args.columnDefs@columnDefsRefFix", this.args.columnDefs);
     *
     */
    async columnDefsRefFix(freshCol) {
      let sigSuffix = "%ref%"; // 用于标记该field已经被替换 属性名中不可用%
      // console.log("defs@columnDefsRefFix", this.args.columnDefs);
      let refQueryParams = {
        condition: this.queryData.query.query,
        refs: [],
      };
      if(this.args.pageable){
        refQueryParams.startIndex = this.args.pageSize * (this.currentPage - 1);
        refQueryParams.pageSize = this.args.pageSize;
      }
      //  扫描columnDefs 所有需要引用的一起引用
      this.args.columnDefs.forEach(_colDef => {
        if (_colDef.refClass && _colDef.browseAttr && _colDef.returnAttr) {
          let oriField;
          // 如果有oriField就读取 否则读取field 如果读取的值有_ref后缀 说明根本没有保存原本的field
          if (_colDef.oriField) oriField = _colDef.oriField;
          else oriField = _colDef.field;
          if (oriField.indexOf("%ref%") != -1){
            return;
          }
          let queryParam = {
            sourceAttr: oriField,
            targetAttr: _colDef.browseAttr,
            targetClass: _colDef.refClass,
            sourceAttrSplit: ',',
            targetCondition: this.parseEscapeString(_colDef.filterQuery, null, null, this.itemValue.data.origin, this.attributes, this.$store),
          };
          refQueryParams["refs"].push(queryParam);
          if (!_colDef.oriField) _colDef["oriField"] = oriField; // 只在第一次替换时保存 这样就可以永久保存最初的field字段

          if(Array.isArray(_colDef.returnAttr) && _colDef.returnAttr.length !== 0){
            _colDef.returnAttr.forEach((returnAttr, i) => {
              if(i === 0){
                _colDef.field = returnAttr
              }else{
                _colDef.field += `-${returnAttr}`; // 新的field为"回填属性名_ref_原属性名" 避免多个属性引用通个属性时的错误
              }
              if(i === _colDef.returnAttr.length - 1){
                _colDef.field += `${sigSuffix}${oriField}`
              }
            })
          }else{
            _colDef.field = _colDef.returnAttr + sigSuffix + oriField; // 新的field为"回填属性名_ref_原属性名" 避免多个属性引用通个属性时的错误
          }
        } else {
          // 缺少任何一个引用字段 都应该还原field取值
          if (_colDef.oriField) _colDef.field = _colDef.oriField;
          else {
            // console.error('Have no reference before.')
            return;
          };
        }
      });

      let res;
      if(refQueryParams.refs.length !== 0){
        if (this.args.select_type == "relation") {
          res = await getEJobj(this.getTargetClass(), refQueryParams);
          res = res.data.data[3];
        }else{
          res = await getEobj(this.getTargetClass(), refQueryParams);
          res = res.data.data;
        }
      }
      if(res){
        // 扫描columnDefs 每一个替换后的列 对每一行扫描
        for(let _colDef of this.args.columnDefs){
          //判断此列是属性引用列
          if (_colDef.refClass && _colDef.browseAttr && _colDef.returnAttr) {
            let refClassObjs = res[_colDef.refClass];
            for(let row of this.rowData){
              //取出引用值，判断是否为单引用-单展示/单引用-多展示/多引用-单展示/多引用-多展示/
              let currentCellData;
              if(row[_colDef.oriField] != '' && row[_colDef.oriField] != undefined){
                currentCellData = typeof(row[_colDef.oriField]) == 'number' || typeof(row[_colDef.oriField]) == 'boolean' ? [row[_colDef.oriField]] : row[_colDef.oriField].split(',');
              }else{
                currentCellData = [];
              }
              //第三次循环cell格内多个引用查询
              if(currentCellData.length > 1){
                let refKey = '';
                let refValue = '';
                for(let [cellIndex, cell] of currentCellData.entries()){
                  let refClassObj;
                  // if(_colDef.refClassType === 'obj'){
                  //   refClassObj = this.EntitySingle(_colDef.refClass, cell) ? this.EntitySingle(_colDef.refClass, cell) : (await getEobjSingle(_colDef.refClass, cell)).data.data;
                  // }else{
                  //   refClassObj = this.RelationSingle(_colDef.refClass, cell) ? this.RelationSingle(_colDef.refClass, cell) : (await getRobjSingle(_colDef.refClass, cell)).data.data;
                  // }
                  refClassObj = refClassObjs.find(obj => {
                    if(obj[_colDef.browseAttr] !== '' && obj[_colDef.browseAttr] !== undefined){
                      // cell = isNaN(parseInt(cell)) ? cell : parseInt(cell);
                      return obj[_colDef.browseAttr].toString().split(',').indexOf(cell) !== -1
                    }else{
                      return false;
                    }
                  });
                  if (Array.isArray(_colDef.returnAttr) && _colDef.returnAttr.length !== 0 && refClassObj) {
                    // 把查到的返回属性值放到rowData的return+_ref属性中 让columnDefs能够读取到
                    _colDef.returnAttr.forEach((returnAttr, i) => {
                      if(i === 0){
                        refKey = returnAttr;
                      }else{
                        refKey += `-${returnAttr}`;
                      }
                      if(i === 0 && cellIndex === 0){
                        refValue = refClassObj[returnAttr] === undefined ? '' : refClassObj[returnAttr];
                      } else if (i === 0 && cellIndex !== 0){
                        refValue += refClassObj[returnAttr] === undefined ? '' : `,${refClassObj[returnAttr]}`;
                      } else{
                        refValue += refClassObj[returnAttr] === undefined ? '' : ` - ${refClassObj[returnAttr]}`;
                      }
                    });
                  }else if(!Array.isArray(_colDef.returnAttr)){
                    refKey = _colDef.returnAttr;
                    refValue = refClassObj[_colDef.returnAttr] === undefined ? '' : refClassObj[_colDef.returnAttr];
                  }
                }
                row[refKey + sigSuffix + _colDef.oriField] = refValue;
              }else{
                // let refClassObjs = res[_colDef.refClass];
                if(row[_colDef.oriField] !== '' && row[_colDef.oriField] != undefined){
                  // 是否数字类型
                  let isNumber = typeof(row[_colDef.oriField]) == 'number'
                  let isBoolean = typeof(row[_colDef.oriField]) == 'boolean'
                  // row[_colDef.oriField] = isNaN(parseInt(row[_colDef.oriField])) ? row[_colDef.oriField] : parseInt(row[_colDef.oriField]);
                  let filterList = refClassObjs.map(x => {
                    if(isNumber) {
                      return parseInt(x[_colDef.browseAttr])
                    }else if(isBoolean && x['type'] === _colDef.attrDict){
                      if(x[_colDef.browseAttr] === 'false'){
                        return false
                      }else{
                        return true
                      }
                    }else{
                      return x[_colDef.browseAttr]
                    }
                  })
                  
                  let index = filterList.indexOf(row[_colDef.oriField]);
                  if (index !== -1 && Array.isArray(_colDef.returnAttr) && _colDef.returnAttr.length !== 0) {
                    // 把查到的返回属性值放到rowData的return+_ref属性中 让columnDefs能够读取到
                    let refKey = '';
                    let refValue = '';
                    _colDef.returnAttr.forEach((returnAttr, i) => {
                      if(i === 0){
                        refKey = returnAttr;
                        refValue = refClassObjs[index][returnAttr] === undefined ? '' : refClassObjs[index][returnAttr];
                      }else{
                        refKey += `-${returnAttr}`;
                        refValue += refClassObjs[index][returnAttr] === undefined ? '' : ` - ${refClassObjs[index][returnAttr]}`;
                      }
                      if(i === _colDef.returnAttr.length - 1){
                        row[refKey + sigSuffix + _colDef.oriField] = refValue;
                      }
                    });
                  }else if(index !== -1 && !Array.isArray(_colDef.returnAttr)){
                    row[_colDef.returnAttr + sigSuffix + _colDef.oriField] = refClassObjs[index][_colDef.returnAttr];
                  }
                }else{
                  row[_colDef.returnAttr + sigSuffix + _colDef.oriField] = '';
                }
              }
            };
          }
        };
      }
      this.updateColDefIndex();
      this.setRowData(this.rowData);
    },
    /**
     * 渲染列内控件
     *
     */
    async wrappedSetColumnDefs(){
      if (this.gridApi) {
        for(let col of this.args.columnDefs){
          await this.applyCellRenderer(col);
        }
        // this.gridApi.setColumnDefs(this.args.columnDefs);
      }
    },
    /**
     * 初始化操作 初始化/分页/鼠标悬浮
     */
    initEventOpr(){
      if(!this.args.events) return
      this.vInit = this.args.events.find((val) => {
        return val.name == '初始化'
      })
      this.vDataProcess = this.args.events.find((val) => {
        return val.name == '前处理'
      })
      this.vPageChange = this.args.events.find((val) => {
        return val.name == '翻页'
      })
      this.vCellTooltipHover = this.args.events.find((val) => {
        return val.name == '鼠标悬浮Tooltip'
      })
      this.vSingleClick = this.args.events.find((val) => {
        return val.name == '单击'
      })
      this.vDoubleClick = this.args.events.find((val) => {
        return val.name == '双击'
      })
    },

    /**
     * 初始化操作 双击/单击
     *
     */
    async initQueryOpr() {
      // copy from app Operation.init()
      if (this.t_show && this.args.sgclk_type == "query") {
        this.sg_query_opr = await getQueryOperation(this.args.sgclk_path);
        this.sg_query_opr = this.sg_query_opr.data.data;
        // console.log("single query_opr in app-grid", this.sg_query_opr);
        if (this.sg_query_opr.action == "implement") {
          let scriptContent = this.sg_query_opr.conditionExpre;
          if (
            !scriptContent.startsWith("procedure:") &&
            !scriptContent.startsWith("serverScript:") &&
            !scriptContent.startsWith("clientScript:")
          ) {
            try {
              let _path = this.sg_query_opr.conditionExpre;
              if (_path.startsWith("addin:"))
                _path = _path.substring(6, _path.length);
              let _addin = getAddinFunc(_path, "operation");
              let self = this;
              let addin = new _addin({
                propsData: {
                  itemValue: this.itemValue,
                  store: this.store
                },
                methods: {
                  getObj(data) {
                    return self.getObj(data);
                  },
                  GetAllAddin() {
                    return self.GetAllAddin(self.itemValue.data);
                  }
                }
              }).setArgs(this.args);
              if (addin.canShow && addin.canShow()) {
                this.self = false;
                for (var j = this.$refs.body.children.length; j > 0; j--) {
                  this.$refs.body.removeChild(this.$refs.body.children[j - 1]);
                }
                this.$refs.body.appendChild(addin.$mount().$el);
                console.log(this.$refs.body);
              } else {
                this.addin = addin;
              }
            } catch (e) {
              console.log(e);
            }
          }
        }
      }
      if (this.t_show && this.args.dbclk_type == "query") {
        // 为app端读取快速查询操作的相关数据
        this.query_opr = await getQueryOperation(this.args.dbclk_path);
        this.query_opr = this.query_opr.data.data;
        console.log("double query_opr in app-grid", this.query_oprs);
        // 插件调用类的操作暂时不引入
        if (this.query_opr.action == "implement") {
          let scriptContent = this.query_opr.conditionExpre;
          if (
            !scriptContent.startsWith("procedure:") &&
            !scriptContent.startsWith("serverScript:") &&
            !scriptContent.startsWith("clientScript:")
          ) {
            try {
              let _path = this.query_opr.conditionExpre;
              if (_path.startsWith("addin:"))
                _path = _path.substring(6, _path.length);
              let _addin = getAddinFunc(_path, "operation");
              let self = this;
              let addin = new _addin({
                propsData: {
                  itemValue: this.itemValue,
                  store: this.store
                },
                methods: {
                  getObj(data) {
                    return self.getObj(data);
                  },
                  GetAllAddin() {
                    return self.GetAllAddin(self.itemValue.data);
                  }
                }
              }).setArgs(this.args);
              if (addin.canShow && addin.canShow()) {
                this.self = false;
                for (var j = this.$refs.body.children.length; j > 0; j--) {
                  this.$refs.body.removeChild(this.$refs.body.children[j - 1]);
                }
                this.$refs.body.appendChild(addin.$mount().$el);
                console.log(this.$refs.body);
              } else {
                this.addin = addin;
              }
            } catch (e) {
              console.log(e);
            }
          }
        }
      }
    },
    /**
     * 初始化用户授权
     * @restrictedAccessAttributes
     */
    async initAuth(){
      if (this.args.select_type == "relation"){
        this.restrictedAccessAttributes = {};
        this.restrictedAccessAttributes[this._relation.leftClass] = this.AttributesByClass(this._relation.leftClass).length === 0 ?  await this.getAttributeClassMap(this._relation.leftClass): this.AttributesByClass(this._relation.leftClass);
        this.restrictedAccessAttributes[this._relation.leftClass] = this.restrictedAccessAttributes[this._relation.leftClass].map(item => {
          this.changeColumnPropertiesByField(`${this.prefix_relation['left']}${item.attributeName}`, 'restrictedAccess', item.restrictedAccess);
          return {
            attributeName: `${this.prefix_relation['left']}${item.attributeName}`,
            restrictedAccess: item.restrictedAccess,
          }
        });
        this.restrictedAccessAttributes[this._relation.className] = this.AttributesByClass(this._relation.className).length === 0 ?  await this.getAttributeClassMap(this._relation.className): this.AttributesByClass(this._relation.className);
        this.restrictedAccessAttributes[this._relation.className] = this.restrictedAccessAttributes[this._relation.className].map(item => {
          this.changeColumnPropertiesByField(`${this.prefix_relation['relation']}${item.attributeName}`, 'restrictedAccess', item.restrictedAccess);
          return {
            attributeName: `${this.prefix_relation['relation']}${item.attributeName}`,
            restrictedAccess: item.restrictedAccess,
          }
        });
        this.restrictedAccessAttributes[this._relation.rightClass] = this.AttributesByClass(this._relation.rightClass).length === 0 ?  await this.getAttributeClassMap(this._relation.rightClass): this.AttributesByClass(this._relation.rightClass);
        this.restrictedAccessAttributes[this._relation.rightClass] = this.restrictedAccessAttributes[this._relation.rightClass].map(item => {
          this.changeColumnPropertiesByField(`${this.prefix_relation['right']}${item.attributeName}`, 'restrictedAccess', item.restrictedAccess);
          return {
            attributeName: `${this.prefix_relation['right']}${item.attributeName}`,
            restrictedAccess: item.restrictedAccess,
          }
        });

      } else {
        this.restrictedAccessAttributes = this.AttributesByClass(this.args.targetClass).length === 0 ? await this.getAttributeClassMap(this.args.targetClass) : this.AttributesByClass(this.args.targetClass);
        this.restrictedAccessAttributes = this.restrictedAccessAttributes.map(item => {
          this.changeColumnPropertiesByField(item.attributeName, 'restrictedAccess', item.restrictedAccess);
          return {
            attributeName: item.attributeName,
            restrictedAccess: item.restrictedAccess,
          }
        });
      }
      this.gridApi.setColumnDefs(this.args.columnDefs);
    },
    /**
     * 初始化列Properties
     *
     */
    initColumnProperties(){
      this.defaultColDef = {
        filter: this.args.enableSorting,
      };
      this.args.columnDefs.forEach(item => {
        item.filter = false;
        //兼容上一版列移动
        item.resizable = item.resizable ? item.resizable : this.args.colResiable;
        //处理排序功能
        if(this.args.enableSorting){
          if(item.colId !== '_oprColumn' && item.colId !== '_SNColumn' && item.enableSorting !== false){
            item.filter = true;
            item.sortable = true;
            item.headerComponentParams = this.gridColumnFilterParams(item);
            item.enableFilter ? (item.filter = true, item.menuTabs = ['filterMenuTab']) : (item.filter = false, item.suppressMenu = true, delete item.menuTabs);
          }else if(item.colId !== '_oprColumn' && item.colId !== '_SNColumn'){
            item.filter = true;
            item.sortable = true;
            item.headerComponentParams = this.gridColumnFilterParams(item);
          }
        }else{
          item.sortable = item.colId !== '_oprColumn' && item.colId !== '_SNColumn' && item.enableSorting;
          item.menuTabs = [];
          item.enableFilter ? (item.filter = true, item.menuTabs = ['filterMenuTab']) : item.suppressMenu = true;
        }
        //处理tooltip功能
        if(this.vCellTooltipHover && this.vCellTooltipHover.opr_type && this.vCellTooltipHover.opr_path){
          item.tooltipField = item.field;
          item.tooltipComponentParams = { html: null };
        }
      });
      if(this.args.enableSorting){
        this.args.frameworkComponents = {
          agColumnHeader: GridColumnFilter,
        };
      }
      if(this.vCellTooltipHover && this.vCellTooltipHover.opr_type && this.vCellTooltipHover.opr_path){
        Object.assign(this.args.frameworkComponents, {GridTooltip: GridTooltip});
        Object.assign(this.defaultColDef, {tooltipComponent: 'GridTooltip'});
      }
    },
    /**
     * 更改列Properties
     *
     */
    changeColumnProperties(name, attr, value){
      this.args.columnDefs.forEach(item => {
        if(item.attrName == name){
          item[attr] = value;
        }
      });
    },
    /**
     * 初始化复制事件
     *
     */
    initClipboardEvent(){
      this.processCellForClipboard = params => {
        // debugger
        if(params.column.colDef._cellRendererFramework == "timeTransferRender"){
          return this.transferedTime(params.value, params.column.colDef.cellRendererParams.timeTransferFormat);
        }else if (params.column.colDef._cellRendererFramework == "userGroupRender"){
          return this.userGroupRender(params.value, params.column.colDef.cellRendererParams.userGroupType, params.column.colDef.cellRendererParams.userGroupAttr, this.oidNameMap)
        }else {
          return params.value
        }
      };
    },
    /**
     * 更改列PropertiesByField
     *
     */
    changeColumnPropertiesByField(field, attr, value){
      this.args.columnDefs.forEach(item => {
        if(item.field == field){
          item[attr] = value;
          attr === 'restrictedAccess' && value.length !== 0 && value.indexOf('CommonOpAuth') !== -1 ? item.cellClass = 'attr-restricted' : '';
          attr === 'restrictedAccess' && value.length !== 0 && value.indexOf('EditObjects') !== -1 ? item.editable = false : '';
        }
      });
    },
    /**
     * 列filter配置参数项
     *
     */
    gridColumnFilterParams(col){
      return {
        classCategory: this.args.classCategory,
        isRelation: this.args.select_type == "relation",
        colAttrName: col.oriField || col.field,
        targetClass: this.args.targetClass,
        suppressFilterButton:true,
        enableSorting: this.args.enableSorting,
        enableFilter: col.enableFilter,
        getGridLoading: () => {
          return this.gridLoading;
        },
        getQueryData: () => {
          return this.queryData
        },
        changeColumnProperties: (name, attr, value) => {
          this.changeColumnProperties(name, attr, value)
        },
        freshRowData: (data) => {
          this.rowData = data
        },
        freshData: (query, fresh, freshCol) => {
          this.freshData(query, fresh, freshCol)
        }
      }
    },
    /**
     * 有用户列时初始化所有用户/用户组oid-name映射
     */
    async initUserAndGroupMap(){
      // let users = await getAllUsers();
      // let groups = await getGroups();
      this.oidNameMap = {
        user: {},
        group: {}
      };
      // users.data.data.forEach(item => {
      //   this.oidNameMap.user[item.oid] = {
      //     displayName: item.displayName,
      //     name: item.name,
      //     oid: item.oid
      //   }
      // });
      // groups.data.data.forEach(item => {
      //   this.oidNameMap.group[item.oid] = {
      //     displayName: item.name,
      //     name: item.name,
      //     oid: item.oid
      //   }
      // });
      this.oidNameMap['9C92E891E9AE534DB685737DE467A9D0'] = {
        displayName: '管理员',
        name: 'Admin',
        oid: '9C92E891E9AE534DB685737DE467A9D0'
      };
      return this.oidNameMap;
    },

    /**
    *@description如果宽度为百分比重新计算
    *@params
    *@date 2020/10/20
    *@return
    */
    initWidth(){
      let columnWidths = [];
      this.args.columnDefs.forEach(item => {
        let gridWidth = this.$refs.main.offsetWidth;
        if(item.widthType === '%'){
          item.width = Math.floor(gridWidth * item.widthPercent / 100);
          columnWidths.push({
            key: item.colId,
            newWidth: item.width
          })
        }
      })
      this.columnApi.setColumnWidths(columnWidths, true);
    },
    /*
    * @将nextCreate对象加入表格数据中
    * */
    generateNextCreate(rowData){
      if(rowData) return rowData.concat(this.nextCreate);
    },

    setError(error, message= '') {
      this.isWrong = error;
      var dom = this.$refs.gridWrapper ? this.$refs.gridWrapper : null;
      if (dom) {
        dom.style.border = error && !this.args.hided ? "1px solid red" : null;
      }
      this.errorMessage = error ? message : '';
      return this;
    },

    validate() {
      return true;
    },
    exportCSV(type){
      var that = this;
      let params = {
        fileName: this.targetClass,
        sheetName: this.targetClass,
        processHeaderCallback: params => {
          return ['_SNColumn', '_oprColumn'].indexOf(params.column.colDef.field) !== -1 ?
            '' : params.column.colDef.field.indexOf("%ref%") !== -1 ?
              `${params.column.colDef.oriField}-${params.column.colDef.headerName}` : `${params.column.colDef.field}-${params.column.colDef.headerName}`;
        },
        processCellCallback: params => {
          if(params.column.colDef['restrictedAccess'] && params.column.colDef['restrictedAccess'].length !== 0 && params.column.colDef['restrictedAccess'].indexOf('CommonOpAuth') !== -1){
            return '';
          }
          if(params.column.colDef._cellRendererFramework == "timeTransferRender"){
            return that.transferedTime(params.value, params.column.colDef.cellRendererParams.timeTransferFormat);
          }else if (params.column.colDef._cellRendererFramework == "userGroupRender"){
            return that.userGroupRender(params.value, params.column.colDef.cellRendererParams.userGroupType, params.column.colDef.cellRendererParams.userGroupAttr, this.oidNameMap)
          }else if(params.column.colId === '_SNColumn'){
            return parseInt(params.node.id) + 1
          }else {
            return params.value
          }
        }
      };
      type === 'csv' ? this.gridOptions.api.exportDataAsCsv(params) : this.gridOptions.api.exportDataAsExcel(params)
    },

    transferedTime(date, timeTransferFormat){
      if(!date){
        return ''
      }
      let renderTime = '';
      let timestamps = date.toString().split(',');
      timestamps.forEach((timestamp, index) => {
        if(/^\d{13}$/g.test(timestamp)){
          var realTime = new Date(parseInt(timestamp));
          let _month = realTime.getMonth() + 1; // fix bug 815
          let _hour = realTime.getHours();
          if (_hour < 10) _hour = "0" + _hour;
          let _minute = realTime.getMinutes();
          let _second = realTime.getSeconds();
          if (_minute < 10) _minute = "0" + _minute;
          if (_second < 10) _second = "0" + _second;
          if (timeTransferFormat == "YYYYMMDDhhmmss")
            index === 0 ? renderTime = `${realTime.getFullYear()}-${_month}-${realTime.getDate()} ${_hour}:${_minute}:${_second}` : renderTime += `,${realTime.getFullYear()}-${_month}-${realTime.getDate()} ${_hour}:${_minute}:${_second}`;
          else if (timeTransferFormat == "YYYYMMDD")
            index === 0 ? renderTime = `${realTime.getFullYear()}-${_month}-${realTime.getDate()}` : renderTime += `,${realTime.getFullYear()}-${_month}-${realTime.getDate()}`;
          else if (timeTransferFormat == "hhmmss")
            index === 0 ? renderTime = `${_hour}:${_minute}:${_second}` : renderTime += `,${_hour}:${_minute}:${_second}`;
          else
            index === 0 ? renderTime = `${realTime.getFullYear()}-${_month}-${realTime.getDate()} ${_hour}:${_minute}:${_second}` : renderTime += `,${realTime.getFullYear()}-${_month}-${realTime.getDate()} ${_hour}:${_minute}:${_second}`;
        }else{
          index === 0 ? renderTime = timestamp : renderTime += `,${timestamp}`;
        }
      })
      return renderTime;
    },
    userGroupRender(oid, type, attr, map){
      if(map){
        if(map[type][oid]){
          return map[type][oid][attr]
        }else if(oid === '9C92E891E9AE534DB685737DE467A9D0'){
          return map['9C92E891E9AE534DB685737DE467A9D0'][attr];
        }else{
          return oid;
        }
      }else{
        return oid;
      }
    },

    // async onDynamic(value) {
    //   // 数据刷新
    //   console.log("mounted grid", this);
    //   this.initQueryOpr();
    //   let that = this;
    //   if (this.t_show) {
    //       setTimeout(() => {
    //           that.freshData();
    //       }, 300);
    //   }
    //   await this.entryCounts();
    // },

    /**
     * 建立双向通讯监听
     *
     */
    createSocketLink(){
      if(this.args.dynamic){
        if(this.args.select_type == 'obj'){
          this.createSub(this.oids, this.targetClass);
          this.wsCommand = "objects command " + this.targetClass;
          this.wsId = addListener(this.wsCommand, async (data) => {
            this.dynamicFreshData(data.data);
          })
        }else{
          this.wsId = {};
          this.wsCommand = {};
          this.wsData = {};
          this.createSubRelation(this.oids);
          Object.keys(this.oids).forEach((item, index) => {
            this.wsCommand[item] = "objects command " + item;
            this.wsId[item] = addListener(this.wsCommand[item], async (data) => {
              this.dynamicFreshData(data.data, index);
            })
          });
        }
      }

      //阻止分页enter提交表单
      setTimeout(() => {
        document.querySelector('.ivu-page .ivu-page-options-elevator input').addEventListener('keydown', (e) => {
          let key =  e.which || e.keyCode
          if(key == 13){
            e.stopPropagation();
            e.preventDefault();
          }
        })
      }, 1000)
    },
    createSub(oids, targetClass) {
      if (this.subId) {
        deleteSub([this.subId]);
        this.subId = null;
      }
      let sockId = getSockId();
      if (sockId) {
        this.subId = uuid();
        postSub([
          {
            className: targetClass,
            eventType: "OBJ_UPDATE",
            oids,
            subscribers: [{
              subScriberType: "SPECIFIC_CONNECTION",
              connectId: getSockId(),
            }],
            subscriptionId: this.subId
          }
        ]);
      }
    },
    /**
     * 关联类表格建立双向通讯
     * 分别建立左类右类关联类本身的socket链接
     */
    createSubRelation(data) {
      if (this.subIds) {
        deleteSub([...this.subIds]);
        this.subId = null;
        this.subIds = [];
      }
      this.subIds = [];
      Object.keys(data).forEach((item, index) => {
        let sockId = getSockId();
        if (sockId) {
          this.subId = uuid();
          this.subIds.push(this.subId);
          postSub([
            {
              className: item,
              eventType: "OBJ_UPDATE",
              oids: data[item],
              subscribers: [{
                subScriberType: "SPECIFIC_CONNECTION",
                connectId: getSockId(),
              }],
              subscriptionId: this.subId
            }
          ]);
        }
      });
    },

    destroySub() {
      if (this.subId) {
        deleteSub([this.subId]);
        this.subId = null;
      }
    },

    fresh() {
      // this.rowData = this.QueryResultAll(this.queryData);
      // this.columnDefsRefFix();
    },

    async getEntity(className) {
      await this.queryEntity(className);
      return this.Entities(className);
    },
    getAttrMap() {
      var res = [];
      if (this.args.select_type == "relation") {
        var left = this.classMap[this._relation.leftClass];
        var right = this.classMap[this._relation.rightClass];
        res.push({
          ...left,
          attributes: this.classAttrMap[this._relation.leftClass]
        });
        res.push({
          ...right,
          attributes: this.classAttrMap[this._relation.rightClass]
        });
        res.push({
          ...this._relation,
          attributs: this.classAttrMap[this._relation.className]
        });
      } else {
        var obj = this.classMap[this.args.targetClass];
        res.push({
          ...obj,
          attributes: this.classAttrMap[this.args.targetClass]
        });
      }
      return res;
    },
    openOfflineMode(){
      this.offline = true;
    },
    closeOfflineMode(){
      this.offline = false;
    },
    /**
     * set表格基础设置数据
     */
    setGridDefs(defs){
      if(!!defs.SNCol){
        this.args.columnDefs.unshift({
          field: "_SNColumn",
          headerName: "#",
          editable: false,
          suppressMovable: false,
          alignCode: 1,
          cellStyle: {
            'line-height': 1 * this.gridOptions.rowHeight + "px;",
            'text-align': 'left'
          },
          //editable: attr.editable,
          colId: "_SNColumn",
          width: 80,
          pinned: 'left',
          lockPosition: true,
          cellRenderer: function(params) {
            return parseInt(params.node.id) + 1;
          },
          operationParams: [],
          menuTabs: ['filterMenuTab']
        });
      }
      this.args.columnDefs[0].checkboxSelection = !!defs.rowSelection;
    },
    /**
     * set表格列设置数据
     */
    setColumnDefs(defs, type = 'cover'){
      if(defs){
        switch (type) {
          case 'cover':
            this.args.columnDefs = [];
            for(let def of defs){
              this.args.columnDefs.push(def);
              def.alignCode !== undefined ? this.fitColAlign(def.alignCode) : '';
            }
            this.args.columnDefs.forEach(x => {
              this.applyCellRenderer(x);
            });
            break;
          case 'merge':
            for(let [index, def] of defs.entries()){
              if(!this.args.columnDefs[index]){
                this.args.columnDefs[index] = {};
              }
              Object.assign(this.args.columnDefs[index], def);
              def.alignCode !== undefined ? this.fitColAlign(def.alignCode) : '';
            }
            break;
          default:
            break;
        }
      }else{
        this.gridApi.setColumnDefs(this.args.columnDefs);
      }
      this.setColumnWidths();
    },

    getColumnDefs(){
      return this.args.columnDefs;
    },

    setColumnVisible(index, visible){
      let colKey = this.args.columnDefs[index].colId;
      this.columnApi.setColumnVisible(colKey, visible);
    },

    /**
    *@description设置列宽
    *@params
    *@date 2020/8/11
    *@return
    */
    setColumnWidths() {
      let columnWidths = this.args.columnDefs.map(def => {
        return {
          key: def.colId,
          newWidth: def.width || 200
        }
      })

      this.columnApi.setColumnWidths(columnWidths, true);
    },
    /**
     * set表格行数据
     * @rowData Array {key: value}数组key值为表格列定义中的field值 oid 必须
     */
    setRowData(rowData, type = 'cover'){
      this.originRowData = rowData;
      switch (type) {
        case 'cover':
          this.rowData = rowData;
          break;
        case 'add':
          if(Object.prototype.toString.call(rowData) === '[object Array]'){
            this.rowData = this.rowData.concat(rowData);
          }else if(Object.prototype.toString.call(rowData) === '[object Object]'){
            this.rowData.push(rowData);
          }
          break;
        case 'merge':
          break;
        default:
          break;
      }
      //ag-grid升级BUG cellrender 加载之前加载rowData会导致cellrender无效
      setTimeout(() => {
        this.gridApi.setRowData(this.rowData);
        this.gridLoading = false;
      },0)
      this.adjustRowHeight();
    },

    getRowData(){
      return this.originRowData
    },

    /**
     * delete表格行数据
     * @rowData Array {key: value}数组key值为表格列定义中的field值 oid 必须
     */
    deleteRowData(oid){
      if(Object.prototype.toString.call(oid) === '[object Array]'){
        _.remove(this.rowData, function(row) {
          return oid.indexOf(row.oid) !== -1;
        });
        this.rowData.push({});
        this.rowData.pop();
      }else if(Object.prototype.toString.call(oid) === '[object String]'){
        let index = this.rowData.findIndex(item => item.oid === oid);
        this.rowData.splice(index, 1);
      }else{
        // this.rowData = [];
      }
      this.adjustRowHeight();
    },
    /**
     * update表格行数据
     * @rowData Array {key: value}数组key值为表格列定义中的field值 oid 必须
     */
    updateRowData(oid, rowData){
      this.cellChangeCallback = false;
      this.gridApi.forEachNode(node => {
        if(node.data.oid === oid){
          for(let col of this.args.columnDefs){
            rowData[col.field] && node.setDataValue(col.colId, rowData[col.field]);
          }
        }
      });
      // let index = this.rowData.findIndex(item => item.oid === oid);
      // Object.assign(this.rowData[index], rowData);
      // this.adjustRowHeight();
    },
    /**
     * get表格列定义数据
     * @defaultDefs属性值定义
     * @headerName 对应属性元数据displayName 用来显示列名
     * @field 列对应行字段唯一属性，用来匹配行数据
     * @uuid 对应属性元数据uuid
     * @colId `${属性元数据displayName}_id`的字符串
     * @attrName 对应属性元数据attributeName
     * @editable 该列是否可编辑
     * @suppressMovable 该列是否可被移动
     * @alignCode 对应行数据文字位置九宫格 0 3 6
                                        1 4 7
                                        2 5 8
     * @enableFilter 该列是否可过滤
     * @enableSorting 该列是否可排序
     * @resizable 该列是否可拖拽宽度
     */
    generateColumnDefs(defs, type = 'entity'){
      if(Object.prototype.toString.call(defs) === '[object Array]'){
        for(let def of defs){
          def = this.getDefaultColumnDef(def);
        }
      }else if(Object.prototype.toString.call(defs) === '[object String]'){

      }
    },
    getTemplateKeys(){
      return _.cloneDeep(this.args.columnDefs);
    },
    getDefaultColumnDef(def, type = 'entity'){
      let defaultDefs = {
        headerName: '',
        field: '',
        uuid: '',
        colId: '',
        attrName: '',
        editable: false,
        suppressMovable: false,
        alignCode: 1,
        resizable: true,
        enableFilter: true,
        enableSorting: true,
      };
      try {

      }catch (e) {
        console.log('获取默认列配置失败，检查数据类型')
      }
      switch (type) {
        case 'entity':
          if(Object.prototype.toString.call(def) === '[object String]'){
            def = {
              headerName: def,
              field: def,
              uuid: uuid(),
              colId: `${def}_id`,
            };
          }else if(Object.prototype.toString.call(def) === '[object Object]'){

          }
          Object.assign(defaultDefs, def);
          break;
        case 'relation':
          // this.prefix_relation;
          // let headerName_prefix = {
          //   "left": `${this.leftRole}的`,
          //   "relation": `${this.relationRole}的`,
          //   "right": `${this.rightRole}的`
          // };
          break;
        default:
          break;
      }
      return _.cloneDeep(defaultDefs);
    },
    getSelected(selectModal = false) {
      let result = [];
      let sig = "%ref%";
      // console.log('original selectedRows', this.gridApi.getSelectedRows());
      this.gridApi && this.gridApi.getSelectedRows().forEach(row=>{
        let cleanRow = {};
        for (let attr in row) {
          if (attr.indexOf(sig) == -1) cleanRow[attr] = row[attr];
        }
        result.push(cleanRow);
      });
      // return this.gridApi.getSelectedRows();
      console.log(result)
      if(selectModal) return  _.uniqWith(this.selectModalObjects, _.isEqual);
      return result;
    },
    //获取实际表格对应类
    getSelectedClass(){
      return this.args.targetClass;
    },
    //获取实际表格对应类是否关联类
    getIsRelation(){
      return this.args.select_type !== 'obj';
    },
    getAll() {
      return this.rowData;
    },

    getPageInfo(){
      return {
        totalPage: this.entryCount,
        pageSize: this.args.pageSize,
        pageIndex: this.currentPage,
        pageSizeOpts: this.pageSizeOpts,
      }
    },

    setPageInfo(pageInfo){
      this.entryCount = pageInfo.totalPage;
      this.args.pageSize = pageInfo.pageSize;
      this.currentPage = pageInfo.pageIndex;
      this.pageSizeOpts = pageInfo.pageSizeOpts
    },

    getCellData(){
      return this.hoverCellData
    },

    setTooltip(cellData){
      console.log(this.hoverCellData)
      this.args.columnDefs.forEach(item => {
        if(this.hoverCellData && this.hoverCellData.colDef && item.field == this.hoverCellData.colDef.field){
          item.tooltipComponentParams.html = cellData
        }
      })
      // this.setColumnDefs();
    },

    async changePage(val) {
      this.pageChange = true;
      this.currentPage = val;
      await this.freshData();
      if(this.vPageChange){
        this.invokeOperation(this.vPageChange.opr_type, this.vPageChange.opr_path, this.itemValue, this.store);
      }
    },
    changePageSize(pageSize) {
      if(pageSize){
        this.args.pageSize = parseInt(pageSize);
        this.freshData();
      }
    },
    updateColDefIndex() {
      this.colDefIndex = {};
      for (var idx in this.args.columnDefs) {
        this.colDefIndex[this.args.columnDefs[idx].colId] = idx;
      }
    },
    fitColAlign(code) {
      let val = code;
      if (val < 3) this.alignAllCols("left");
      else if (val < 6) this.alignAllCols("center");
      else this.alignAllCols("right");

      if (val == 0 || val == 3 || val == 6) this.alignAllCols("up");
      else if (val == 1 || val == 4 || val == 7) this.alignAllCols("middle");
      else this.alignAllCols("down");
    },

    alignAllCols(direc) {
      this.gridOptions.rowHeight ? '' : this.gridOptions.rowHeight = this.args.rowHeight;
      let upHeight = 0.4 * this.gridOptions.rowHeight + "px;";
      let middleHeight = 1 * this.gridOptions.rowHeight + "px;";
      let downHeight = 1.6 * this.gridOptions.rowHeight + "px;";
      this.args.columnDefs.forEach(coldef => {
        console.log("cellStyle@alignAllCols", coldef.cellStyle);
        if (!coldef.cellStyle) coldef.cellStyle = {};
        if (direc == "left" || direc == "right" || direc == "center")
          coldef.cellStyle["text-align"] = direc;
        if (direc == "up") coldef.cellStyle["line-height"] = upHeight;
        else if (direc == "middle")
          coldef.cellStyle["line-height"] = middleHeight;
        else if (direc == "down") coldef.cellStyle["line-height"] = downHeight;
      });
      this.setColumnDefs();
    },
    onCellClicked(params) {
      // console.log("cell clicked", params);
    },

    //hover event
    oncellMouseOver(params){
      this.hoverTime = false;
      if(this.hoverTimer){
        clearTimeout(this.hoverTimer);
        this.hoverTimer = null;
        this.hoverCellData = null;
      }
      this.hoverTimer = setTimeout(async () => {
        this.hoverTime = true;
        if(this.hoverTime && this.vCellTooltipHover && this.vCellTooltipHover.opr_type && this.vCellTooltipHover.opr_path){
          this.hoverCellData = params;
          await this.invokeOperation(
            this.vCellTooltipHover.opr_type,
            this.vCellTooltipHover.opr_path,
            this.itemValue,
            this.store,
            null,
            params,
            null,
            {
              className: this.args.targetClass,
              isRelation: this.args.select_type !== 'obj',
              oidList: [this.args.id],
              opr_source: 'grid',
            }
          );
        }
      }, 100)
    },

    oncellMouseOut(){
      this.hoverTime = false;
      if(this.hoverTimer){
        clearTimeout(this.hoverTimer);
        this.hoverTimer = null;
        this.hoverCellData = null;
      }
    },

    //click event
    async onCellDoubleClicked(params) {
      this.cellChangeCallback = true;
      if(this.args.notEditable){ return false; }
      if(this.vDoubleClick && this.vDoubleClick.opr_type && this.vDoubleClick.opr_path) {
        // console.log("getSelected[0]@onCellDoubleClicked", this.getSelected()[0]);
        await this.invokeOperation(
          this.vDoubleClick.opr_type,
          this.vDoubleClick.opr_path,
          this.itemValue,
          this.store,
          null,
          this.getSelected()[0],
          null,
          {
            className: this.args.targetClass,
            isRelation: this.args.select_type !== 'obj',
            oidList: [this.args.id],
            opr_source: 'grid',
          }
        );
        // for(let col of this.args.columnDefs){
        //   this.applyCellRenderer(col);
        // }
      }
    },
     onCellSingleClicked(params) {
       if(this.args.notEditable){ return false; }
       if(this.vSingleClick && this.vSingleClick.opr_type && this.vSingleClick.opr_path){
         console.log("getSelected[0]@onCellSingleClicked", this.getSelected()[0]);
         if (this.timer != null) {
           clearInterval(this.timer);
           this.timer = null;
           // this.onCellDoubleClicked();
         } else {
           this.timer = setInterval(async () => {
             clearInterval(this.timer);
             this.timer = null;
             this.cellChangeCallback = true;
             await this.invokeOperation(
               this.vSingleClick.opr_type,
               this.vSingleClick.opr_path,
               this.itemValue,
               this.store,
               null,
               this.getSelected()[0],
               null,
               {
                 className: this.args.targetClass,
                 isRelation: this.args.select_type !== 'obj',
                 oidList: [this.args.id],
                 opr_source: 'grid',
               }
             );
           }, 300)
         }
       }
    },
    async openForm(params, targetClass, viewName, args) {
      // console.log("3", params, targetClass, viewName, args);
      // this.modalPath = `/forms/${targetClass}/${viewName}`;
      // this.modalQuery = { query: "" };
      // try {
      //   let addins = this.GetAllAddin(this.itemValue.data);
      //   var _selected = null;
      //   for (var i = 0; i < addins.length; i++) {
      //     if (addins[i].getSelected) {
      //       let objs = addins[i].getSelected();
      //       if (objs.length > 0) {
      //         let _class = addins[i].getAttrMap();
      //         if (_class.length == 1 && _class[0].className == targetClass) {
      //           _selected = objs;
      //           break;
      //         }
      //       }
      //     }
      //   }
      //   if (_selected) {
      //     params.selectedObjs = _selected;
      //     this.modalQuery.query = `and plt_oid="${_selected[0].oid}"`;
      //   }
      // } catch (e) {
      //   console.log(e);
      // }
      // if (args.conditionExpre && args.conditionExpre.length > 0) {
      //   this.modalQuery.query = args.conditionExpre;
      // }
      // if (args.params && args.params.length > 0) {
      //   let _obj = await new Function(args.params).call(params);
      //   if (_obj) {
      //     if (_obj.query) this.modalQuery.query = _obj.query;
      //     if (_obj.obj) this.modalQuery.obj = _obj.obj;
      //     if (_obj.data) this.modalQuery.data = _obj.data;
      //   }
      // }
      // this.modalTitle = this.query_opr.displayName;
      // console.log("openForm:");
      // this.modalIf = true;
      // this.modal = true;
    },
    onColResized(params) {
      console.log("col resized", params);
    },

    sizeColumnsToFit(){
      if(this.args.autoSize){
        this.gridApi.sizeColumnsToFit();
      }
    },

    onColMoved(params) {
      console.log("col moved", params);
      let idx1 = this.colDefIndex[params.column.colId];
      let idx2 = params.toIndex;
      var tmp = this.args.columnDefs[idx1];
      this.args.columnDefs[idx1] = this.args.columnDefs[idx2];
      this.args.columnDefs[idx2] = tmp;
      this.colDefIndex[this.args.columnDefs[idx1].colId] = idx1;
      this.colDefIndex[this.args.columnDefs[idx2].colId] = idx2;
    },
    // 获取控件属性值
    getValue() {
      return null;
    },
    setValue(items) {
      return this;
    },
    // 是否允许往里添加元素,null为不允许，[]为允许全部，非空为允许部分
    getAllow(dropTarget) {
      return null;
    },
    // 获取可继承属性
    getInherit(dropTarget) {
      var res = {};
      let that = this;
      this.inherit.forEach(x => (res[x] = that.args[x]));
      return res;
    },
    // 获取编辑框内容
    getArgs() {
      // let _args = {};
      // this.args.columnDefs.forEach(x => {
      //   x.filterParams = null;
      //   x.cellRendererParams = null;
      // });
      return this.args;
    },
    // 设置基本属性
    setArgs(args) {
      if (Object.getOwnPropertyNames(args).length==1 && Object.getOwnPropertyNames(args)[0]=="_query"){
        args = args["_query"];
      }
      for (var i in args) {
        //FIXME: 连续调用setArgs时避免覆盖空数据 仍可能引发其他错误
        if (this.args[i] && typeof args[i] == "string" && args[i] == "") continue;
        this.args[i] = args[i];
      }
      /**
       * 修复初始化时请求freshData与mounted和pageSize变换三重请求
       */
      if (this.lastQuery && args.columnDefs) {
        this.updateColDefIndex();
        this.args.columnDefs.forEach(x => {
          this.applyCellRenderer(x);
        });
        this.wrappedSetColumnDefs();
        this.freshData();
      }
      if ("name" in args) this.args_name = this.args.name;
      if(this.args.events && !this.args.events.find(event => event.name === '单击')){
        this.args.events.push({
          name: "单击",
          opr_path: this.args.sgclk_path || '',
          opr_type: this.args.sgclk_type || ''
        })
      }
      if(this.args.events && !this.args.events.find(event => event.name === '双击')){
        this.args.events.push({
          name: "双击",
          opr_path: this.args.dbclk_path || '',
          opr_type: this.args.dbclk_type || ''
        })
      }
      return this;
    },
    // 获取表单项名
    // 删掉getFormName让表单引擎刷新多对象控件
    // getFormName() {
    //   return this.args.name;
    // },
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
      this.t_create = false;
      this.t_edit = false;
      this.t_visit = false;
      if (type == "create") {
        this.t_create = true;
      } else if (type == "edit") {
        this.t_edit = true;
        this.notClickEditable = false;
      } else if (type == "visit") {
        this.t_visit = true;
        this.notClickEditable = true;
      }
      return this;
    },
    getDataType(args) {
      return this.args.dataTypes;
    },
    getTargetClass() {
      return this.args.targetClass;
    },
    async onCellValueChanged(params) {
      if (params.oldValue == params.value) {
        console.log("cellValue Not Changed");
        return;
      }
      if(!this.cellChangeCallback){
        console.log("cellChangeCallback is blocking");
        return;
      }
      if(params.colDef.restrictedAccess && params.colDef.restrictedAccess.indexOf('EditObjects') !== -1 ){
        console.log("无权限");
        return;
      }
      let originData = _.cloneDeep(this.rowData[params.rowIndex]);
      let replaceData = {};

      for (let attr in originData){
        let removePrefixAttr = this.args.select_type === 'obj' ? attr : this.removeRelationPrefix(attr);
        if(/\%ref\%/g.test(removePrefixAttr)){
          attr = attr.split('\%ref\%')[1];
          //去掉引用列不用转换
          replaceData[attr] = originData[attr];
        } else if (this.attrMap[removePrefixAttr] && ["Integer", "Long"].indexOf(this.attrMap[removePrefixAttr].valueType) != -1 && originData[attr]){
          replaceData[attr] = originData[attr].length > 16 ? String(JSBI.BigInt(originData[attr])) : parseInt(originData[attr]);
        } else if(this.attrMap[removePrefixAttr] && this.attrMap[removePrefixAttr].valueType == "Double"){
          replaceData[attr] = originData[attr] === '' ? null : originData[attr];
        } else if (this.attrMap[removePrefixAttr] && this.attrMap[removePrefixAttr].valueType == "Boolean"){
          if (originData[attr] === "True" || originData[attr] === "true" || originData[attr] === true) replaceData[attr] = true;
          else replaceData[attr] = false;
        } else {
          replaceData[attr] = originData[attr];
        }
      }

      let _res = {};
      if (this.args.select_type !== 'obj') {
        let leftObj = {};
        let rightObj = {};
        let _obj = {};
        for (var i in replaceData) {
          if (i.startsWith("left_")) leftObj[i.substr(5)] = replaceData[i];
          if (i.startsWith("right_")) rightObj[i.substr(6)] = replaceData[i];
          if (i.startsWith("relation_")) _obj[i.substr(9)] = replaceData[i];
        }
        let newLeftObj = { className: this._relation.leftClass, obj: leftObj };
        try {
          newLeftObj.obj.oid = 'left_oid' in replaceData ? replaceData.left_oid : replaceData.relation_leftOid;
          let res = await this.editEObj(newLeftObj);
          if (!res) throw "error";
        } catch (e) {
          this.$Message.error(e);
        }

        let newRightObj = { className: this._relation.rightClass, obj: rightObj };
        try {
          newRightObj.obj.oid = 'right_oid' in replaceData ? replaceData.right_oid : replaceData.relation_rightOid;
          let res = await this.editEObj(newRightObj);
          if (!res) throw "error";
        } catch (e) {
          this.$Message.error(e);
        }

        let newObj = { className: this._relation.className, obj: _obj };
        try {
          let res = await this.editEJObj(newObj);
          if (!res) throw "error";
          this.freshData();
        } catch (e) {
          this.$Message.error(e);
        }
      } else {
        try {
          _res = await this.editEObj({className: this.args.targetClass, obj: replaceData});
          if (!_res) throw "error";
          this.freshData();
        } catch (e) {
          this.$Message.error(e);
        }
      }
    },

    setExternalOprConfig(config){
      this.externalOpr = true;
      if(config){
        this.args.columnDefs.forEach(col => {
          if(col.colId === '_oprColumn' && col.operationParams && col.operationParams.length !== 0){
            col.operationParams.forEach((item, index) => {
              Object.assign(item, config[index]);
            })
          }
        })
      }
      this.$nextTick(() => {
        setTimeout(() => {
          this.columnApi.autoSizeColumns(['_oprColumn'], true);
        }, 2000)
      })
      // this.setColumnDefs()
    },

    async applyCellRenderer(col) {
      let that = this;
      if(col.colId === '_SNColumn'){
        col.cellRenderer = function(params){
          return parseInt(params.node.id) + 1;
        }
      }
      let _renderType = col._cellRendererFramework;
      //对显示类型为int，原表类型为TimeStamp和Date类型的数据做处理，避免数字类型被当做时间戳展示
      if(col.refClass && col.returnAttrType && col.returnAttrType !== 'Date' && col.returnAttrType !== 'TimeStamp'){
        _renderType = 'NONE';
      }
      if (_renderType) {
        if (!col.cellRendererParams) col.cellRendererParams = {};
        col.cellRendererParams.freshData = function() {
          return that.freshData();
        };
        col.cellRendererParams.updateQuery = function(query) {
          return that.updateQuery(query);
        };
        col.cellRendererParams.getSelected = function(){
          return that.getSelected();
        };
        col.cellRendererParams.getAll = function(){
          return that.getAll();
        };
        col.cellRendererParams.invokeOperation = async function(type, path, selectedObj, eventObj) {
          let mod_obj = {};
          for (let attr in selectedObj){
            // 避免引用类造成的rowData更换
            if (attr.indexOf("%ref%") !== -1) delete selectedObj[attr];

            if(this.args.select_type === 'obj'){
              attributeTransfer(attr, selectedObj, '');
            }else{
              // attr = attr.replace(/relation_/, "").replace(/left_/, "").replace(/right_/, "");
              if(attr.indexOf('left_') !== -1){
                attributeTransfer(attr.replace(/left_/, ""), selectedObj, 'left_');
              }else if(attr.indexOf('relation_') !== -1){
                attributeTransfer(attr.replace(/relation_/, ""), selectedObj, 'relation_');
              }else if(attr.indexOf('right_') !== -1){
                attributeTransfer(attr.replace(/right_/, ""), selectedObj, 'right_');
              }else{
                attributeTransfer(attr, selectedObj, '');
              }
            }
          }
          //把selectedObj中值转换为正确类型值再拼回去，因为attrMap不带前缀
          function attributeTransfer(attr, selectedObj, type){
            if (that.attrMap[attr] && ["Integer", "Long"].indexOf(that.attrMap[attr].valueType) !== -1){
              mod_obj[`${type}${attr}`] = parseInt(selectedObj[`${type}${attr}`]);
            }else if(that.attrMap[attr] && that.attrMap[attr].valueType === "Double"){
              mod_obj[`${type}${attr}`] = parseFloat(selectedObj[`${type}${attr}`]);
            }else if (that.attrMap[attr] && that.attrMap[attr].valueType === "Boolean"){
              if (selectedObj[`${type}${attr}`] === "True" || selectedObj[`${type}${attr}`] === "true") mod_obj[`${type}${attr}`] = true;
              else mod_obj[`${type}${attr}`] = false;
            }
            else {
              mod_obj[`${type}${attr}`] = selectedObj[`${type}${attr}`];
            }
          }
          let sysEventObj = that.sysEventPath.includes(path) ? {
            opr_sys_path: eventObj.opr_sys_path,
            opr_showMessage: eventObj.opr_showMessage,
          }: null
          let multiObjParams;
          if(that.args.select_type !== 'obj'){
            multiObjParams = {
              className: that.args.targetClass,
              isRelation: that.args.select_type !== 'obj',
              oidList: [this.args.id],
              opr_source: 'grid',
              sysEventObj: sysEventObj,
              leftClass: that._relation.leftClass,
              rightClass: that._relation.rightClass,
              relationClass: that._relation.className
            }
          }else{
            multiObjParams = {
              className: that.args.targetClass,
              isRelation: that.args.select_type !== 'obj',
              oidList: [this.args.id],
              opr_source: 'grid',
              sysEventObj: sysEventObj,
            }
          }
          return await that.invokeOperation(type, path, that.itemValue, that.store, null, mod_obj, null, multiObjParams);
        };
        col.cellRendererParams.args = that.args;
      }
      switch (_renderType) {
        case "progressBarRender":
          col.cellRendererFramework = progressBarRender;
          break;
        case "checkboxRender":
          col.cellRendererFramework = checkboxRender;
          break;
        case "userGroupRender":
          col.cellRendererParams.getUserGroupMap = function(){
            return that.oidNameMap;
          };
          col.cellRendererFramework = userGroupRender;
          break;
        case "dynamicDigitalRender":
          col.cellRenderer = "agAnimateShowChangeCellRenderer";
          break;
        case "timeTransferRender":
          col.cellRendererFramework = timeTransferRender;
          break;
        case "operationRender":
          for (let item of col.operationParams) {
            if(item.auth){
              item.hasAuth = false;
              let res = await AuthRules.getAllRulesById(this.store.state.user.userId);
              if(res.data.data.length === 0){
                //Admin
                item.hasAuth = true;
              }
              if(res.data.data.filter(auth => auth.authority === item.auth_item).length !== 0){
                item.hasAuth = true;
              }
            }else item.hasAuth = true;
          }
          col.cellRendererFramework = operationRender;
          //添加授权
          break;
        case "escapeSubstitute":
          col.cellRendererFramework = escapeRender;
          break;
        case "customTransferRender":
          col.cellRendererFramework = customTransferRender;
          break;
        case "NONE":
          col.cellRendererFramework = null;
          break;
        default:
          break;
      }
    },

    adjustRowHeight(val) {
      let height = val || this.args.rowHeight;
      height = parseInt(height);
      this.args.rowHeight = height;
      this.gridOptions ? this.gridOptions.rowHeight = height : '';
      this.gridApi ? this.gridApi.resetRowHeights() : '';
    },

    removeRelationPrefix(attribute){
      if (attribute.startsWith("right_")){
        return attribute.substr(6);
      } else if(attribute.startsWith("left_")){
        return attribute.substr(5);
      } else if(attribute.startsWith("relation_")){
        return attribute.substr(9);
      } else {
        return attribute
      }
    },

    onPasteStart(params){
      console.log(params)
    },

    onPasteEnd(params){
      console.log(params)
    },

    /**
     * @description选择弹窗打开模式
     */
    setSelectModalGrid(objects){
      this.selectModalGrid = true;
      if(!objects) {
        this.selectModalObjects = [];
        this.selectModalOid = [];
      }else{
        if(Object.prototype.toString.call(objects) === '[object Array]'){
          if(objects.length === 0 || !objects[0]){
            this.selectModalObjects = [];
            this.selectModalOid = [];
          }else{
            this.selectModalObjects = objects;
          }
        }else{
          this.selectModalObjects = [objects];
        }
        this.selectModalOid = this.selectModalObjects.map(obj => {
          return obj.relation_oid ? obj.relation_oid : obj.oid
        })
      }
    },
    /**
     * @description高亮选择弹窗选择项
     */
    selectModalRow(){
      this.$nextTick(() => {
        setTimeout(() => {
          if(this.selectModalOid && this.selectModalOid.length !== 0){
            this.gridApi.forEachNode(node => {
              if(node.data.relation_oid){
                node.setSelected(this.selectModalOid.indexOf(node.data.relation_oid) !== -1);
              }else{
                node.setSelected(this.selectModalOid.indexOf(node.data.oid) !== -1);
              }
            });
          }
        }, 500)
      })
    },

    /**
     * @description行被选中
     */
    onRowSelected(val){
      if(!val.node.selected){
        _.remove(this.selectModalObjects, obj => obj.oid === val.data.oid);
        this.selectModalOid = this.selectModalObjects.map(obj => obj.oid)
      }else{
        if(this.selectModalGrid) this.selectModalObjects = this.selectModalObjects.concat(this.getSelected());
        this.selectModalOid = this.selectModalObjects.map(obj => obj.oid)
      }
    },

    /**
     *@description右键菜单
     */
    getContextMenuItems(params){
      return this.args.enableExport ? [
        'copy',
        'copyWithHeaders',
        'paste',
        'separator',
        'export'
      ] : [
        'copy',
        'copyWithHeaders',
        'paste',
      ];
    },

    /**
    *@description返回操作列定义
    *@params
    *@date 2020/8/5
    *@return
    */
    getOprColumnDefs() {
      return this.args.columnDefs.find(def => def.colId === '_oprColumn') || [];
    },
  }
};
</script>

<style>
.margin1 {
  margin-top: 5px;
  margin-bottom: 5px;
}
.margin2 {
  margin-left: 5px;
  margin-bottom: 5px;
}
.ag-cell.attr-restricted{
  display: none;
}
.ivu-page-item.ivu-page-item-active{
  border-color: #2d8cf0 !important;
}
.ag-cell a.disabled{
  cursor: not-allowed;
  color: #c5c8ce;
}
.grid-header-left .ag-header-cell-label{
  justify-content: flex-start;
}
.grid-header-center .ag-header-cell-label{
  justify-content: center;
}
.grid-header-right .ag-header-cell-label{
  justify-content: flex-end;
}
/*.ag-root-wrapper ::-webkit-scrollbar {*/
/*  width:initial ;*/
/*  color: initial;*/
/*}*/
/*.ag-root-wrapper ::-webkit-scrollbar {*/
/*  height: initial;*/
/*}*/
/*.ag-root-wrapper ::-webkit-scrollbar-track {*/
/*  background-color: initial;*/
/*  -webkit-border-radius: initial;*/
/*  -moz-border-radius: initial;*/
/*  border-radius: initial;*/
/*}*/
/*.ag-root-wrapper ::-webkit-scrollbar-thumb {*/
/*  background-color: initial;*/
/*  -webkit-border-radius: initial;*/
/*  -moz-border-radius: initial;*/
/*  border-radius: initial;*/
/*}*/


.grid-font-color-red{
  color: red!important;
}
.grid-font-color-yellow{
  color: yellow!important;
}
.grid-font-color-green{
  color: green!important;
}
.grid-font-color-black{
  color: black!important;
}
.grid-font-color-white{
  color: white!important;
}
.grid-font-color-grey{
  color: grey!important;
}
.grid-font-color-blue{
  color: blue!important;
}
.grid-background-color-red{
  background-color: red!important;
}
.grid-background-color-yellow{
  background-color: yellow!important;
}
.grid-background-color-green{
  background-color: green!important;
}
.grid-background-color-black{
  background-color: black!important;
}
.grid-background-color-white{
  background-color: white!important;
}
.grid-background-color-grey{
  background-color: grey!important;
}
.grid-background-color-blue{
  background-color: blue!important;
}
.grid-font-size-12{
  font-size: 12px;
}
.grid-font-size-14{
  font-size: 14px;
}
.grid-text-decoration-underline{
  text-decoration: underline;
}
.grid-text-decoration-line-through{
  text-decoration: line-through;
}
.grid-font-weight-bold{
  font-weight: bold;
}
.grid-font-weight-normal{
  font-weight: normal;
}
.grid-font-size-12 .ag-cell{
  font-size: 12px;
}
.grid-font-size-14 .ag-cell{
  font-size: 14px;
}
.grid-text-decoration-underline .ag-cell{
  text-decoration: underline;
}
.grid-text-decoration-line-through .ag-cell{
  text-decoration: line-through;
}

</style>

<style scoped>
  section {
    width: auto;
    height: auto;
    display: inline-block;
  }

  .wrongTips {
    display: inline-block;
    width: 100%;
    color: red;
    text-align: left;
    margin-top: 5px;
  }
  .readonly-mask{
    width: 100%;
    height: 100%;
    position: absolute;
    background: rgba(255, 255, 255, 0);
    left: 0;
    right: 0;
    z-index: 9;
    cursor: not-allowed;
  }
</style>
