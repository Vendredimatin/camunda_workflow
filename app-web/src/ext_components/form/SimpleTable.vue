<template>
  <section v-show="!args.hided" :addinName="name" ref="main" class="clearfix"
           :style="{'width': arg_width, 'display': 'flex', 'flex-direction': 'column', 'min-height': arg_height, 'margin-bottom': '5px','float': 'left'}">
    <div v-show="args.readonly && !args.hided" class="readonly-mask"></div>
    <div v-show="!args.hided" ref="gridWrapper"
         :style="{'display': 'flex', 'flex-direction': 'column', 'height': arg_height}">
      <Table
        class="simple-table"
        :border="args.showBorder"
        :no-data-text="noDataText"
        :stripe="args.showStripe"
        :show-header="args.showHeader"
        :size="args.tableSize"
        :height="arg_height"
        :highlight-row="true"
        ref="table"
        :columns="columnDefs"
        :data="rowData"
        @on-row-click="onCellSingleClicked"
        @on-row-dblclick="onCellDoubleClicked"
        @on-selection="handleSelection"
        @on-selection-change="handleSelectionChange"
      >
      </Table>
      <div
        style="margin-top: 5px;"
        v-show="args.pageable"
      >
        <Row type="flex" justify="end" style="flex-wrap: nowrap;">
            <span>
              <Button type="primary" style="margin-right: 15px;" @click="freshDataButton">刷新</Button>
              <!--              <Button v-show="args.enableExport" type="primary" style="margin-right: 15px;" @click="exportCSV('csv')">导出csv</Button>-->
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
  </section>
</template>

<script>
import {mapGetters, mapActions, mapMutations} from "vuex";
import {
  getEobj,
  getEJobj,
  getEobjCount,
  getRobjCount,
  getClass,
  postSub,
  deleteSub,
} from "@/api/others.js";
import AuthRules from "@/api/auth-model/AuthRules";
import {addListener, removeListener, getSockId} from "@/util/webSocket";
import "./ag-grid/Grid.css";
import "@/styles/component/iconfont.css";
import {uuid} from '@/util/assist'
import _ from 'lodash';
import {
  progressBarRender,
  checkboxRender,
  dynamicDigitalRender,
  timeTransferRender,
  operationRender,
  escapeRender,
  customTransferRender
} from "@/ext_components/form/simpleTable/CellRenders.js";

const name = "SimpleTable";
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
      wsCommand: '',
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
      rowData: [],
      columnDefs: [],
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
        statusBarConfig: {},
        compactMode: false,
        pageable: true,
        enableCellChangeFlash: true,
        width: 100,
        widthType: "%",
        filterQuery: '',
        heightType: "px",
        height: 500,
        targetClassType: "obj",
        selected_attributes: [],
        bindTargetClass: '',
        targetClass: "",
        oprTargetClass: "",
        query: "",
        pagination: true,
        pageSize: 25,
      },
      defaultColDef: {},
      uuidTypeColumnList: [],
      lastQuery: '', // 查询一次后 每次翻页时应该保留查询条件
      notClickEditable: false,
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
      inherit: [],
      attrMap: {},
      classAttrMap: {},
      classMap: {},
      relationMap: {},
      _relation: null,
      leftRole: null,
      relationRole: null,
      rightRole: null,

      query_opr: null, // app端读取当下的快查操作类型

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
      oprAuth: [],
      selectedData: [],
      oidNameMap: {
        '9C92E891E9AE534DB685737DE467A9D0': {
          displayName: '管理员',
          name: 'Admin',
          oid: '9C92E891E9AE534DB685737DE467A9D0'
        }
      },
      noDataText: '加载中',
    };
  },
  components: {},
  beforeDestroy() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
    if (typeof this.wsId != 'string' && this._relation) {
      removeListener(this.wsCommand[this._relation.leftClass], this.wsId[this._relation.leftClass]);
      removeListener(this.wsCommand[this._relation.className], this.wsId[this._relation.className]);
      removeListener(this.wsCommand[this._relation.rightClass], this.wsId[this._relation.rightClass]);
    } else {
      removeListener(this.wsCommand, this.wsId);
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
    this.targetClass = this.args.targetClass;
    this.isRelation = this.args.targetClassType == "relation" ? true : false;
  },

  beforeMount() {
    this.initEventOpr();
    // this.initColumnProperties();
  },

  mounted() {
    if (!this.args.targetClass) return;
    this.initTableData();
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

    arg_height() {
      if(this.args.pageable){
        return this.args.height - 50
      }else{
        return this.args.height - 10
      }
    },

    arg_width() {
      return this.args.width + this.args.widthType;
    },

    arg_query() {
      return this.args.filterQuery;
    },
  },
  watch: {
    'args.readonly'(val) {
      this.args.notEditable = val;
    },

    arg_query(val) {
      if (val.substring(0, 5) == "order") {
        this.args.filterQuery = "and 1=1 " + val;
      }
    },
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

    async initClassData() {
      if (this.isRelation) {

        await this.queryRelation(this.args.targetClass);
        this._relation = this.Relations(this.args.targetClass);
        if (!(this._relation.leftClass in this.classMap)) {
          this.classMap[this._relation.leftClass] = await this.getEntity(this._relation.leftClass);
        }
        if (!(this._relation.rightClass in this.classMap)) {
          this.classMap[this._relation.rightClass] = await this.getEntity(this._relation.rightClass);
        }
        this.leftRole = this._relation.leftRole;
        this.relationRole = this._relation.displayName;
        this.rightRole = this._relation.rightRole;
        if (!(this.args.targetClass in this.classAttrMap)) {
          var attr = this.RelationAttrList(this.args.targetClass);
          attr.forEach(x => (this.attrMap[x.attributeName] = x));
          this.classAttrMap[this.args.targetClass] = attr;
        }
        if (!(this._relation.leftClass in this.classAttrMap))
          await this.addAttributes(this._relation.leftClass);
        if (!(this._relation.rightClass in this.classAttrMap))
          await this.addAttributes(this._relation.rightClass);
      } else {
        if (!(this.args.targetClass in this.classMap)) {
          this.classMap[this.args.targetClass] = await this.getEntity(this.args.targetClass);
        }
        if (!(this.args.targetClass in this.classAttrMap)) {
          await this.addAttributes(this.args.targetClass);
        }
      }
    },

    /**
     * @author LiuBo
     * @method
     * @name
     * @private
     * @description 初始化表格
     */
    async initTableData() {
      if (this.vInit) {
        await this.invokeOperation(this.vInit.opr_type, this.vInit.opr_path, this.itemValue, this.store, null, null, null, {
          event: this.vInit
        });
      }
      this.computeWidth(this.args.columnDefs);
      await this.initClassData();
      await this.initAuth();
      await this.freshData();
      // this.sizeColumnsToFit();
    },

    /**
     * @author LiuBo
     * @method
     * @name
     * @private
     * @description 重新计算百分比宽度
     */
    initWidth() {
      this.args.columnDefs.forEach(item => {
        let gridWidth = this.$refs.main.offsetWidth;
        if (item.widthType === '%') {
          item.width !== undefined ? item.width = Math.floor(gridWidth * item.widthPercent / 100) : '';
        }
      })
    },

    /**
     * @author LiuBo
     * @method
     * @name
     * @private
     * @description 计算宽度，当每列列宽累计小于表格宽，最后一列自适应
     * @param {Object}
     * @return {Object}
     */
    computeWidth(definitions){
      let gridWidth = this.$refs.main.offsetWidth;
      definitions.forEach(def => {
        if (def.widthType === '%') {
          def.width !== undefined ? def.width = Math.floor(gridWidth * def.widthPercent / 100) : '';
        }else{
          def.width = def.width === undefined ? 200 : def.width;
        }
      })
      //获取所有百分比
      let totalWidthPercent = definitions.filter(def => def.widthType === '%').length !== 0 ? definitions.filter(def => def.widthType === '%').map(def => def.widthPercent).reduce((t, n) => t + n) : 0;

      //获取所有像素宽
      let totalWidth = definitions.filter(def => def.widthType === 'px').length !== 0 ? definitions.filter(def => def.widthType === 'px').map(def => def.width).reduce((t, n) => t + n) : 0;
      if(totalWidthPercent + (totalWidth * 100 / gridWidth) < 100){
        delete definitions[definitions.length - 1].width
      }
      return definitions;
    },

    //设置行样式
    getRowStyle(fn) {
      this.gridOptions.getRowStyle = fn;
    },

    //设置行样式
    setRowClass(fn) {
      this.gridOptions.getRowClass = fn;
    },

    async freshDataButton() {
      if (this.gridLoading) return;
      this.gridLoading = true;
      this.currentPage = 1;
      await this.freshData()
      this.$Message.success("刷新成功");
    },

    // /**
    //  * @description刷新nextcreate对象
    //  */
    // async freshDataNextCreate(nextcreate) {
    //   this.nextCreate = _.cloneDeep(nextcreate);
    //   await this.freshData()
    // },
    // /**
    //  * @description刷新nextcreate对象
    //  */
    // async clearNextCreate() {
    //   this.nextCreate = [];
    //   await this.freshData()
    // },

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
      if (!data) return;
      let refreshDone = false;
      if (!this.isRelation) {
        this.gridApi.forEachNode(node => {
          if (node.data.oid === data.oid) {
            for (let key of Object.keys(data)) {
              if (node.data[key] !== data[key]) {
                let result = this.args.columnDefs.filter(item => item.key === key);
                result.length !== 0 && result[0]._cellRendererFramework === 'dynamicDigitalRender' ? (node.setDataValue(`${key}_id`, data[key]), refreshDone = true) : '';
              }
            }
            !refreshDone && node.setData(Object.assign(node.data, data));
          }
        })
      } else {
        //左类
        if (this.oids[this._relation.leftClass].indexOf(data.oid) != -1) {
          data = this.utilAddPrefix(data, 'left');
          this.gridApi.forEachNode(node => {
            //扁平化关联类数据情况
            if (node.data.left_oid === data.left_oid) {
              for (let key of Object.keys(data)) {
                if (node.data[key] !== data[key]) {
                  let result = this.args.columnDefs.filter(item => item.key === key);
                  result.length !== 0 && result[0]._cellRendererFramework === 'dynamicDigitalRender' ? (node.setDataValue(`${key}_id`, data[key]), refreshDone = true) : '';
                }
              }
              !refreshDone ? this.wsData = Object.assign(node.data, data) : '';
            }
          })
          //右类
        }
        if (this.oids[this._relation.rightClass].indexOf(data.oid) != -1) {
          data = this.utilAddPrefix(data, 'right');
          this.gridApi.forEachNode(node => {
            if (node.data.right_oid === data.right_oid) {
              for (let key of Object.keys(data)) {
                if (node.data[key] !== data[key]) {
                  let result = this.args.columnDefs.filter(item => item.key === key);
                  result.length !== 0 && result[0]._cellRendererFramework === 'dynamicDigitalRender' ? (node.setDataValue(`${key}_id`, data[key]), refreshDone = true) : '';
                }
              }
              !refreshDone ? this.wsData = Object.assign(this.wsData, data) : '';
            }
          })
        }
        if (this.oids[this._relation.className].indexOf(data.oid) != -1) {
          data = this.utilAddPrefix(data, 'relation');
          this.gridApi.forEachNode(node => {
            if (node.data.relation_oid === data.relation_oid) {
              for (let key of Object.keys(data)) {
                if (node.data[key] !== data[key]) {
                  let result = this.args.columnDefs.filter(item => item.key === key);
                  result.length !== 0 && result[0]._cellRendererFramework === 'dynamicDigitalRender' ? (node.setDataValue(`${key}_id`, data[key]), refreshDone = true) : '';
                }
              }
              !refreshDone ? node.setData(Object.assign(this.wsData, data)) : '';
            }
          })
        }
      }
    },

    /**
     * 离线刷新数据
     */
    freshOfflineData(data) {
      this.rowDataOrigin = _.cloneDeep(this.rowData);
      this.rowData = data;
    },
    /**
     * 增加前缀
     * @data
     * @type
     */
    utilAddPrefix(data, type) {
      let newData = {};
      Object.keys(data).forEach(item => {
        newData[`${type}_${item}`] = data[item];
      });
      return newData;
    },

    /**
     * @author LiuBo
     * @method
     * @name
     * @private
     * @description 更新数据
     * initial情况query = undefined fresh = undefined
     * step1确认为关联/实体类
     * step2
     * queryData = {
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
     * step3如果表格中有创建人，拥有着，最后更新人的oid显示进行替换，执行查询操作获得行数据rowData,对象数counts保存queryData
     * @param {String} query查询条件
     * @param {Boolean} fresh刷新缓存
     * @param {Boolean} 订阅
     */
    async freshData(query, fresh = true, addListener) {
      if (this.isRelation) {
        if (!this._relation) {
          await this.queryRelation(this.args.targetClass);
          this._relation = this.Relations(this.args.targetClass);
        }

        if (!(this._relation.leftClass in this.classMap)) {
          this.classMap[this._relation.leftClass] = await this.getEntity(this._relation.leftClass);
        }
        if (!(this._relation.rightClass in this.classMap)) {
          this.classMap[this._relation.rightClass] = await this.getEntity(this._relation.rightClass);
        }
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
        if (!(this.args.targetClass in this.classMap)) {
          this.classMap[this.args.targetClass] = await this.getEntity(this.args.targetClass);
        }
        if (!(this.args.targetClass in this.classAttrMap)) {
          await this.addAttributes(this.args.targetClass);
        }
      }
      this.queryData = {
        query: {
          query: '',
          startIndex: 0,
          pageSize: this.args.pageSize
        },
        targetClass: this.args.targetClass,
        fresh: fresh,
      };
      let searchBoxQuery = false;
      if (query) {
        switch (query) {
          case 'reset':
            this.queryData.query.query = '';
            break;
          default:
            if (typeof query != "string") {
              searchBoxQuery = true;
              this.queryData.query.query = await this.handleQueryObj(query, this);
            } else {
              this.queryData.query.query = this.parseEscapeString(query, null, null, this.itemValue.data.origin, this.attributes, this.$store);
            }
            break;
        }
      } else {
        if (this.lastQuery) {
          this.queryData.query.query = this.lastQuery;
        } else if (this.args.filterQuery && typeof this.args.filterQuery == "string") {
          this.queryData.query.query = this.parseEscapeString(this.args.filterQuery, null, null, this.itemValue.data.origin, this.attributes, this.$store);
        }
      }
      this.lastQuery = this.queryData.query.query;
      this.queryData.query.query = this.queryData.query.query ? this.queryData.query.query.trim() : '';
      this.queryData.query.query = !this.queryData.query.query && this.rootQuery.query ? this.rootQuery.query : this.queryData.query.query;
      await this.entryCounts(this.queryData.query.query);
      //fix bug 7275
      if (searchBoxQuery) {
        this.currentPage = 1;
        searchBoxQuery = false;
      }
      this.queryData.query.startIndex = this.args.pageSize * (this.currentPage - 1);
      this.queryData.query.pageSize = this.args.pageSize;
      if (this.isRelation) {
        this.queryData.query.type = "relation";
        this.queryData.targetClass = this.targetClass;
        this.queryData.leftClass = this._relation.leftClass;
        this.queryData.rightClass = this._relation.rightClass;
        this.queryData.relationClass = this._relation.className;
        this.oids = {};
        this.oids[this._relation.leftClass] = [];
        this.oids[this._relation.className] = [];
        this.oids[this._relation.rightClass] = [];
      } else {
        this.queryData.targetClass = this.args.targetClass;
        this.queryData.query.type = "obj";
      }
      let res = await this.handleQueryData(this.queryData);
      if(res.code === 400){
        this.$Message.error(res.message);
      }
      this.originRowData = this.QueryResultAll(this.queryData) || [];
      // this.originRowData = this.generateNextCreate(this.originRowData);
      this.originRowData.forEach(row => {
        if (this.isRelation) {
          this.oids[this._relation.leftClass].push(row['left_oid']);
          this.oids[this._relation.className].push(row['relation_oid']);
          this.oids[this._relation.rightClass].push(row['right_oid']);
        } else {
          this.oids.push(row.oid);
        }
      })
      await this.initAuth();
      if (this.vDataProcess) {
        await this.invokeOperation(this.vDataProcess.opr_type, this.vDataProcess.opr_path, this.itemValue, this.store);
      }
      this.setRowData(this.originRowData);
      this.createSocketLink(addListener);
      await this.columnDefsRefFix();
      this.columnDefs = this.generateColumnRender(this.args.columnDefs);
      this.gridLoading = false;
      this.noDataText = this.rowData.length === 0 ? '暂无数据' : '加载中';
      //自适应自定义操作列
      // if (this.externalOpr) {
      //   this.setExternalOprConfig()
      // }
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
     * @author LiuBo
     * @method
     * @name
     * @private
     * @description
     * @param {String} query 查询对象数
     */
    async entryCounts(query) {
      if (this.pageChange) {
        this.pageChange = false;
        return;
      }
      let allObjCnt;
      if (this.isRelation) {
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
    },

    /**
     * 执行query对象搜索处理query
     */
    async handleQueryObj(query, that) {
      let _ret = "";
      let _comret = '';
      let _class;
      let _str = ["String", "UUID", "Clob", "Date", "TimeStamp"];
      let _int = ["Integer", "Long", "Double"];
      if (that.args.targetClassType == "relation") {
        _class = [
          `left_${that._relation.leftClass}`,
          `right_${that._relation.rightClass}`,
          that._relation.className
        ];
      } else {
        _class = [that.args.targetClass];
      }
      for (var i = 0; i < query.length; i++) {
        let m_class = query[i].className;
        let isCommonClass = query[i].belongClass.substring(0, 4) == "重复属性" ? true : false;
        let attr = query[i].attrName.substring(0, query[i].attrName.indexOf("&"));
        let type = query[i].valueType;
        let value = query[i].value;
        let iType = query[i].attrType;
        if (type == 'Boolean') {
          value = value + '';
        }
        let __ret = "";
        let __comRet = "";
        if (_class.indexOf(m_class) == -1 || value == null || value == "" || value == undefined || (typeof value == 'number' && isNaN(value))) continue;
        let self_pre = '';
        let self_timePre = "'";

        let finalMClass = '';
        if (m_class.indexOf('left_') != -1 || m_class.indexOf('right_') != -1) {
          finalMClass = m_class.split('_')[1];
        } else {
          finalMClass = m_class;
        }
        let mct = await getClass(finalMClass);
        let isExternal = mct.data.data.classCategory === 'ExternalItemClass';

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
        } else if (typeof value == "object") {
          // 查询值可能有2个或1个
          // 分别考虑属性为字符串或直接值的方式
          if (isCommonClass) {
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
            if (strValue) {
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
      if (_comret) {
        fixCom = ` and (${_comret.slice(3)})`;
      }
      _ret += fixCom;
      //排除表格原生+查询框查询方式
      let gridQuery = this.parseEscapeString(this.args.filterQuery, null, null, this.itemValue.data.origin, this.attributes, this.$store)
      if (/^\s{0,}nativequery:/g.test(gridQuery)) {
        _ret = `${gridQuery}`;
      } else {
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
    async columnDefsRefFix() {
      let sigSuffix = "%ref%"; // 用于标记该field已经被替换 属性名中不可用%
      // console.log("defs@columnDefsRefFix", this.args.columnDefs);
      let refQueryParams = {
        condition: this.queryData.query.query,
        refs: [],
      };
      if (this.args.pageable) {
        refQueryParams.startIndex = this.args.pageSize * (this.currentPage - 1);
        refQueryParams.pageSize = this.args.pageSize;
      }
      //  扫描columnDefs 所有需要引用的一起引用
      this.args.columnDefs.forEach(_colDef => {
        if (_colDef.refClass && _colDef.browseAttr && _colDef.returnAttr) {
          let oriKey;
          // 如果有oriField就读取 否则读取field 如果读取的值有_ref后缀 说明根本没有保存原本的field
          if (_colDef.oriKey) oriKey = _colDef.oriKey;
          else oriKey = _colDef.key;
          if (oriKey.indexOf("%ref%") != -1) {
            return;
          }
          let queryParam = {
            sourceAttr: oriKey,
            targetAttr: _colDef.browseAttr,
            targetClass: _colDef.refClass,
            targetCondition: this.parseEscapeString(_colDef.filterQuery, null, null, this.itemValue.data.origin, this.attributes, this.$store),
            sourceAttrSplit: ','
          };
          refQueryParams["refs"].push(queryParam);
          if (!_colDef.oriKey) _colDef["oriKey"] = oriKey; // 只在第一次替换时保存 这样就可以永久保存最初的field字段

          if (Array.isArray(_colDef.returnAttr) && _colDef.returnAttr.length !== 0) {
            _colDef.returnAttr.forEach((returnAttr, i) => {
              if (i === 0) {
                _colDef.key = returnAttr
              } else {
                _colDef.key += `-${returnAttr}`; // 新的field为"回填属性名_ref_原属性名" 避免多个属性引用通个属性时的错误
              }
              if (i === _colDef.returnAttr.length - 1) {
                _colDef.key += `${sigSuffix}${oriKey}`
              }
            })
          } else {
            _colDef.key = _colDef.returnAttr + sigSuffix + oriKey; // 新的field为"回填属性名_ref_原属性名" 避免多个属性引用通个属性时的错误
          }
        } else {
          // 缺少任何一个引用字段 都应该还原field取值
          if (_colDef.oriKey) _colDef.key = _colDef.oriKey;
          else {
            return;
          }
        }
      });

      let res;
      try {
        if (refQueryParams.refs.length !== 0) {
          if (this.args.targetClassType == "relation") {
            res = await getEJobj(this.getTargetClass(), refQueryParams);
            res = res.data.data[3];
          } else {
            res = await getEobj(this.getTargetClass(), refQueryParams);
            res = res.data.data;
          }
        }
      }catch (e) {
        console.log(e);
        res = null;
      }
      if (res) {
        // 扫描columnDefs 每一个替换后的列 对每一行扫描
        for (let _colDef of this.args.columnDefs) {
          //判断此列是属性引用列
          if (_colDef.refClass && _colDef.browseAttr && _colDef.returnAttr) {
            let refClassObjs = res[_colDef.refClass];
            for (let row of this.rowData) {
              //取出引用值，判断是否为单引用-单展示/单引用-多展示/多引用-单展示/多引用-多展示/
              let currentCellData;
              if (row[_colDef.oriKey] != '' && row[_colDef.oriKey] != undefined) {
                currentCellData = typeof (row[_colDef.oriKey]) == 'number' || typeof (row[_colDef.oriKey]) == 'boolean' ? [row[_colDef.oriKey]] : row[_colDef.oriKey].split(',');
              } else {
                currentCellData = [];
              }
              //第三次循环cell格内多个引用查询
              if (currentCellData.length > 1) {
                let refKey = '';
                let refValue = '';
                for (let [cellIndex, cell] of currentCellData.entries()) {
                  let refClassObj;
                  // if(_colDef.refClassType === 'obj'){
                  //   refClassObj = this.EntitySingle(_colDef.refClass, cell) ? this.EntitySingle(_colDef.refClass, cell) : (await getEobjSingle(_colDef.refClass, cell)).data.data;
                  // }else{
                  //   refClassObj = this.RelationSingle(_colDef.refClass, cell) ? this.RelationSingle(_colDef.refClass, cell) : (await getRobjSingle(_colDef.refClass, cell)).data.data;
                  // }
                  refClassObj = refClassObjs.find(obj => {
                    if (obj[_colDef.browseAttr] !== '' && obj[_colDef.browseAttr] !== undefined) {
                      return obj[_colDef.browseAttr].toString().split(',').indexOf(cell) !== -1
                    } else {
                      return false;
                    }
                  });
                  if (Array.isArray(_colDef.returnAttr) && _colDef.returnAttr.length !== 0 && refClassObj) {
                    // 把查到的返回属性值放到rowData的return+_ref属性中 让columnDefs能够读取到
                    _colDef.returnAttr.forEach((returnAttr, i) => {
                      if (i === 0) {
                        refKey = returnAttr;
                      } else {
                        refKey += `-${returnAttr}`;
                      }
                      if (i === 0 && cellIndex === 0) {
                        refValue = refClassObj[returnAttr] === undefined ? '' : refClassObj[returnAttr];
                      } else if (i === 0 && cellIndex !== 0) {
                        refValue += refClassObj[returnAttr] === undefined ? '' : `,${refClassObj[returnAttr]}`;
                      } else {
                        refValue += refClassObj[returnAttr] === undefined ? '' : ` - ${refClassObj[returnAttr]}`;
                      }
                    });
                  } else if (!Array.isArray(_colDef.returnAttr)) {
                    refKey = _colDef.returnAttr;
                    refValue = refClassObj[_colDef.returnAttr] === undefined ? '' : refClassObj[_colDef.returnAttr];
                  }
                }
                row[refKey + sigSuffix + _colDef.oriKey] = refValue;
              } else {
                // let refClassObjs = res[_colDef.refClass];
                if (row[_colDef.oriKey] != '' && row[_colDef.oriKey] != undefined) {
                  // 是否数字类型
                  let isNumber = typeof(row[_colDef.oriKey]) == 'number'
                  let isBoolean = typeof(row[_colDef.oriKey]) == 'boolean'
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

                  let index = filterList.indexOf(row[_colDef.oriKey]);
                  if (index !== -1 && Array.isArray(_colDef.returnAttr) && _colDef.returnAttr.length !== 0) {
                    // 把查到的返回属性值放到rowData的return+_ref属性中 让columnDefs能够读取到
                    let refKey = '';
                    let refValue = '';
                    _colDef.returnAttr.forEach((returnAttr, i) => {
                      if (i === 0) {
                        refKey = returnAttr;
                        refValue = refClassObjs[index][returnAttr] === undefined ? '' : refClassObjs[index][returnAttr];
                      } else {
                        refKey += `-${returnAttr}`;
                        refValue += refClassObjs[index][returnAttr] === undefined ? '' : ` - ${refClassObjs[index][returnAttr]}`;
                      }
                      if (i === _colDef.returnAttr.length - 1) {
                        row[refKey + sigSuffix + _colDef.oriKey] = refValue;
                      }
                    });
                  } else if (index !== -1 && !Array.isArray(_colDef.returnAttr)) {
                    row[_colDef.returnAttr + sigSuffix + _colDef.oriKey] = refClassObjs[index][_colDef.returnAttr];
                  }
                } else {
                  row[_colDef.returnAttr + sigSuffix + _colDef.oriKey] = '';
                }
              }
            }
            ;
          }
        }
        ;
      }
      this.updateColDefIndex();
      this.setRowData(this.rowData);
    },

    /**
     * 初始化操作 初始化/分页/鼠标悬浮
     */
    initEventOpr() {
      if (!this.args.events) return
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
     * 初始化用户授权
     * @restrictedAccessAttributes
     */
    async initAuth() {

      if (this.isRelation) {
        this.restrictedAccessAttributes = {};
        this.restrictedAccessAttributes[this._relation.leftClass] = this.AttributesByClass(this._relation.leftClass).length === 0 ? await this.getAttributeClassMap(this._relation.leftClass) : this.AttributesByClass(this._relation.leftClass);
        this.restrictedAccessAttributes[this._relation.leftClass] = this.restrictedAccessAttributes[this._relation.leftClass].map(item => {
          this.changeColumnPropertiesByField(`${this.prefix_relation['left']}${item.attributeName}`, 'restrictedAccess', item.restrictedAccess);
          return {
            attributeName: `${this.prefix_relation['left']}${item.attributeName}`,
            restrictedAccess: item.restrictedAccess,
          }
        });
        this.restrictedAccessAttributes[this._relation.className] = this.AttributesByClass(this._relation.className).length === 0 ? await this.getAttributeClassMap(this._relation.className) : this.AttributesByClass(this._relation.className);
        this.restrictedAccessAttributes[this._relation.className] = this.restrictedAccessAttributes[this._relation.className].map(item => {
          this.changeColumnPropertiesByField(`${this.prefix_relation['relation']}${item.attributeName}`, 'restrictedAccess', item.restrictedAccess);
          return {
            attributeName: `${this.prefix_relation['relation']}${item.attributeName}`,
            restrictedAccess: item.restrictedAccess,
          }
        });
        this.restrictedAccessAttributes[this._relation.rightClass] = this.AttributesByClass(this._relation.rightClass).length === 0 ? await this.getAttributeClassMap(this._relation.rightClass) : this.AttributesByClass(this._relation.rightClass);
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
      let authData = await AuthRules.getAllRulesById(this.store.state.user.userId);
      this.oprAuth = authData.data.data;
    },

    /**
     * 初始化列Properties
     *
     */
    // initColumnProperties() {
    //   this.defaultColDef = {
    //     filter: this.args.enableSorting,
    //   };
    //   this.args.columnDefs.forEach(item => {
    //     item.filter = false;
    //     //兼容上一版列移动
    //     item.resizable = item.resizable ? item.resizable : this.args.colResiable;
    //     //处理排序功能
    //     if (this.args.enableSorting) {
    //       if (item.colId !== '_oprColumn' && item.colId !== '_SNColumn' && item.enableSorting !== false) {
    //         item.filter = true;
    //         item.sortable = true;
    //         item.headerComponentParams = this.gridColumnFilterParams(item);
    //         item.enableFilter ? (item.filter = true, item.menuTabs = ['filterMenuTab']) : (item.filter = false, item.suppressMenu = true, delete item.menuTabs);
    //       } else if (item.colId !== '_oprColumn' && item.colId !== '_SNColumn') {
    //         item.filter = true;
    //         item.sortable = true;
    //         item.headerComponentParams = this.gridColumnFilterParams(item);
    //       }
    //     } else {
    //       item.sortable = item.colId !== '_oprColumn' && item.colId !== '_SNColumn' && item.enableSorting;
    //       item.menuTabs = [];
    //       item.enableFilter ? (item.filter = true, item.menuTabs = ['filterMenuTab']) : item.suppressMenu = true;
    //     }
    //     //处理tooltip功能
    //     if (this.vCellTooltipHover && this.vCellTooltipHover.opr_type && this.vCellTooltipHover.opr_path) {
    //       item.tooltipField = item.key;
    //       item.tooltipComponentParams = {html: null};
    //     }
    //   });
    //   if (this.args.enableSorting) {
    //     this.args.frameworkComponents = {
    //       agColumnHeader: GridColumnFilter,
    //     };
    //   }
    //   if (this.vCellTooltipHover && this.vCellTooltipHover.opr_type && this.vCellTooltipHover.opr_path) {
    //     Object.assign(this.args.frameworkComponents, {GridTooltip: GridTooltip});
    //     Object.assign(this.defaultColDef, {tooltipComponent: 'GridTooltip'});
    //   }
    // },
    /**
     * 更改列Properties
     *
     */
    changeColumnProperties(name, attr, value) {
      this.args.columnDefs.forEach(item => {
        if (item.attrName == name) {
          item[attr] = value;
        }
      });
    },

    /**
     * 更改列PropertiesByField
     *
     */
    changeColumnPropertiesByField(key, attr, value) {
      this.args.columnDefs.forEach(item => {
        if (item.key == key) {
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
    gridColumnFilterParams(col) {
      return {
        classCategory: this.args.classCategory,
        isRelation: this.args.targetClassType == "relation",
        colAttrName: col.oriKey || col.key,
        targetClass: this.args.targetClass,
        suppressFilterButton: true,
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

    /*
    * @将nextCreate对象加入表格数据中
    * */
    generateNextCreate(rowData) {
      if (rowData) return rowData.concat(this.nextCreate);
    },

    setError(error, message = '') {
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

    exportCSV(type) {
      // var that = this;
      // let params = {
      //   fileName: this.args.targetClass,
      //   sheetName: this.args.targetClass,
      //   processHeaderCallback: params => {
      //     return ['_SNColumn', '_oprColumn'].indexOf(params.column.colDef.key) !== -1 ?
      //       '' : params.column.colDef.key.indexOf("%ref%") !== -1 ?
      //         `${params.column.colDef.oriKey}-${params.column.colDef.headerName}` : `${params.column.colDef.key}-${params.column.colDef.headerName}`;
      //   },
      //   processCellCallback: params => {
      //     if (params.column.colDef['restrictedAccess'] && params.column.colDef['restrictedAccess'].length !== 0 && params.column.colDef['restrictedAccess'].indexOf('CommonOpAuth') !== -1) {
      //       return '';
      //     }
      //     if (params.column.colDef._cellRendererFramework == "timeTransferRender") {
      //       return that.transferedTime(params.value, params.column.colDef.cellRendererParams.timeTransferFormat);
      //     } else if (params.column.colDef._cellRendererFramework == "userGroupRender") {
      //       return that.userGroupRender(params.value, params.column.colDef.cellRendererParams.userGroupType, params.column.colDef.cellRendererParams.userGroupAttr, this.oidNameMap)
      //     } else if (params.column.colId === '_SNColumn') {
      //       return parseInt(params.node.id) + 1
      //     } else {
      //       return params.value
      //     }
      //   }
      // };
      let exportData = [];
      this.rowData.forEach((row, index) => {
        let rowData = row;
        for (let value in rowData) {
          if (value.indexOf("%ref%") === -1) {
            let params = this.args.columnDefs.find(col => {
              if (col.oriKey) {
                return col.oriKey === value
              } else {
                return col.key === value
              }
            });
            if(!params){
              rowData[value] = rowData[value];
            }else{
              if (params['restrictedAccess'] && params['restrictedAccess'].length !== 0 && params['restrictedAccess'].indexOf('CommonOpAuth') !== -1) {
                rowData[value] = '';
              }
              if (params.renderType == "timeTransferRender") {
                rowData[value] = this.transferedTime(rowData[value], params.cellParams.timeTransferFormat);
              } else if (params.colId === '_SNColumn') {
                // rowData[value] = parseInt(index) + 1
              } else {
                rowData[value] = rowData[value];
              }
            }
          }
        }
        exportData.push(rowData)
      })

      this.$refs.table.exportCsv({
        filename: this.args.targetClass,
        columns: this.args.columnDefs.filter(col => col.colId !== '_selColumn' && col.colId !== '_oprColumn'),
        data: exportData,
      });
    },

    transferedTime(date, timeTransferFormat) {
      if (!date) {
        return ''
      }
      let renderTime = '';
      let timestamps = date.toString().split(',');
      timestamps.forEach((timestamp, index) => {
        if (/^\d{13}$/g.test(timestamp)) {
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
        } else {
          index === 0 ? renderTime = timestamp : renderTime += `,${timestamp}`;
        }
      })
      return renderTime;
    },

    userGroupRender(oid, type, attr, map) {
      if (map) {
        if (map[type][oid]) {
          return map[type][oid][attr]
        } else if (oid === '9C92E891E9AE534DB685737DE467A9D0') {
          return map['9C92E891E9AE534DB685737DE467A9D0'][attr];
        } else {
          return oid;
        }
      } else {
        return oid;
      }
    },
    /**
     * 建立双向通讯监听
     *
     */
    createSocketLink(listen = true) {
      if (this.args.dynamic && listen) {
        if (this.args.targetClassType == 'obj') {
          this.createSub(this.oids, this.args.targetClass);
          this.wsCommand = "objects command " + this.args.targetClass;
          this.wsId = addListener(this.wsCommand, async (data) => {
            // this.dynamicFreshData(data.data);
            this.freshData(undefined, undefined, false);
          })
        } else {
          this.wsId = {};
          this.wsCommand = {};
          this.wsData = {};
          this.createSubRelation(this.oids);
          Object.keys(this.oids).forEach((item, index) => {
            this.wsCommand[item] = "objects command " + item;
            this.wsId[item] = addListener(this.wsCommand[item], async (data) => {
              // this.dynamicFreshData(data.data, index);
              this.freshData(undefined, undefined, false);
            })
          });
        }
      }

      //阻止分页enter提交表单
      // setTimeout(() => {
      //   document.querySelector('.ivu-page .ivu-page-options-elevator input').addEventListener('keydown', (e) => {
      //     let key = e.which || e.keyCode
      //     if (key == 13) {
      //       e.stopPropagation();
      //       e.preventDefault();
      //     }
      //   })
      // }, 1000)
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

    async getEntity(className) {
      await this.queryEntity(className);
      return this.Entities(className);
    },

    getAttrMap() {
      var res = [];

      if (this.args.targetClassType == "relation") {
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

    /**
     * set表格基础设置数据
     */
    setGridDefs(defs) {
      if (!!defs.SNCol) {
        this.args.columnDefs.unshift({
          key: "_SNColumn",
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
          cellRenderer: function (params) {
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
    setColumnDefs(defs, type = 'cover') {
      if (defs) {
        switch (type) {
          case 'cover':
            this.args.columnDefs = [];
            for (let def of defs) {
              this.args.columnDefs.push(def);
              def.alignCode !== undefined ? this.fitColAlign(def.alignCode) : '';
            }
            this.args.columnDefs.forEach(x => {
              this.applyCellRenderer(x);
            });
            break;
          case 'merge':
            for (let [index, def] of defs.entries()) {
              if (!this.args.columnDefs[index]) {
                this.args.columnDefs[index] = {};
              }
              Object.assign(this.args.columnDefs[index], def);
              def.alignCode !== undefined ? this.fitColAlign(def.alignCode) : '';
            }
            break;
          default:
            break;
        }
      } else {
        this.gridApi.setColumnDefs(this.args.columnDefs);
      }
    },

    getColumnDefs() {
      return this.args.columnDefs;
    },

    setColumnVisible(index, visible) {
      let colKey = this.args.columnDefs[index].colId;
      this.columnApi.setColumnVisible(colKey, visible);
    },

    /**
     * set表格行数据
     * @rowData Array {key: value}数组key值为表格列定义中的field值 oid 必须
     */
    setRowData(rowData, type = 'cover') {
      this.originRowData = rowData;
      switch (type) {
        case 'cover':
          this.rowData = rowData;
          break;
        case 'add':
          if (Object.prototype.toString.call(rowData) === '[object Array]') {
            this.rowData = this.rowData.concat(rowData);
          } else if (Object.prototype.toString.call(rowData) === '[object Object]') {
            this.rowData.push(rowData);
          }
          break;
        case 'merge':
          break;
        default:
          break;
      }
    },

    getRowData() {
      return this.originRowData
    },

    // /**
    //  * get表格列定义数据
    //  * @defaultDefs属性值定义
    //  * @headerName 对应属性元数据displayName 用来显示列名
    //  * @key 列对应行字段唯一属性，用来匹配行数据
    //  * @uuid 对应属性元数据uuid
    //  * @colId `${属性元数据displayName}_id`的字符串
    //  * @attrName 对应属性元数据attributeName
    //  * @editable 该列是否可编辑
    //  * @suppressMovable 该列是否可被移动
    //  * @alignCode 对应行数据文字位置九宫格 0 3 6
    //  1 4 7
    //  2 5 8
    //  * @enableFilter 该列是否可过滤
    //  * @enableSorting 该列是否可排序
    //  * @resizable 该列是否可拖拽宽度
    //  */
    // generateColumnDefs(defs, type = 'entity') {
    //   if (Object.prototype.toString.call(defs) === '[object Array]') {
    //     for (let def of defs) {
    //       def = this.getDefaultColumnDef(def);
    //     }
    //   } else if (Object.prototype.toString.call(defs) === '[object String]') {
    //
    //   }
    // },

    // getDefaultColumnDef(def, type = 'entity') {
    //   let defaultDefs = {
    //     headerName: '',
    //     key: '',
    //     uuid: '',
    //     colId: '',
    //     attrName: '',
    //     editable: false,
    //     suppressMovable: false,
    //     alignCode: 1,
    //     resizable: true,
    //     enableFilter: true,
    //     enableSorting: true,
    //   };
    //   try {
    //
    //   } catch (e) {
    //     console.log('获取默认列配置失败，检查数据类型')
    //   }
    //   switch (type) {
    //     case 'entity':
    //       if (Object.prototype.toString.call(def) === '[object String]') {
    //         def = {
    //           headerName: def,
    //           key: def,
    //           uuid: uuid(),
    //           colId: `${def}_id`,
    //         };
    //       } else if (Object.prototype.toString.call(def) === '[object Object]') {
    //
    //       }
    //       Object.assign(defaultDefs, def);
    //       break;
    //     case 'relation':
    //       // this.prefix_relation;
    //       // let headerName_prefix = {
    //       //   "left": `${this.leftRole}的`,
    //       //   "relation": `${this.relationRole}的`,
    //       //   "right": `${this.rightRole}的`
    //       // };
    //       break;
    //     default:
    //       break;
    //   }
    //   return _.cloneDeep(defaultDefs);
    // },

    getSelected() {
      if (this.selectedData.length === 0) return [];
      if (Array.isArray(this.selectedData)) {
        return this.selectedData;
      } else {
        return [this.selectedData];
      }
    },

    //获取实际表格对应类
    getSelectedClass() {
      return this.args.targetClass;
    },

    //获取实际表格对应类是否关联类
    getIsRelation() {
      return this.args.targetClassType !== 'obj';
    },

    getAll() {
      return this.rowData;
    },

    getPageInfo() {
      return {
        totalPage: this.entryCount,
        pageSize: this.args.pageSize,
        pageIndex: this.currentPage,
        pageSizeOpts: this.pageSizeOpts,
      }
    },

    setPageInfo(pageInfo) {
      this.entryCount = pageInfo.totalPage;
      this.args.pageSize = pageInfo.pageSize;
      this.currentPage = pageInfo.pageIndex;
      this.pageSizeOpts = pageInfo.pageSizeOpts
    },

    async changePage(val) {
      this.pageChange = true;
      this.currentPage = val;
      await this.freshData();
      if (this.vPageChange) {
        this.invokeOperation(this.vPageChange.opr_type, this.vPageChange.opr_path, this.itemValue, this.store);
      }
    },

    changePageSize(pageSize) {
      if (pageSize) {
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

    //click event
    async onCellDoubleClicked(data, index) {
      this.handleDoubleClick = true;
      this.cellChangeCallback = true;
      this.selectedData = data;
      if (this.args.notEditable) {
        return false;
      }
      if (this.vDoubleClick && this.vDoubleClick.opr_type && this.vDoubleClick.opr_path) {
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
            isRelation: this.args.targetClassType !== 'obj',
            oidList: [this.args.id],
            opr_source: 'grid',
          }
        );
      }
    },

    onCellSingleClicked(data, index) {
      this.selectedData = data;
      if (this.vSingleClick && this.vSingleClick.opr_type && this.vSingleClick.opr_path) {
        if (this.timer != null) {
          clearInterval(this.timer);
          this.timer = null;
        } else {
          this.timer = setInterval(async () => {
            clearInterval(this.timer);
            this.timer = null;
            if (this.handleDoubleClick) {
              this.handleDoubleClick = false;
              return;
            }
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
                isRelation: this.args.targetClassType !== 'obj',
                oidList: [this.args.id],
                opr_source: 'grid',
              }
            );
          }, 300)
        }
      }
    },

    handleSelection(selection) {
      // if (this.args.rowSelection) {
      //   this.selectedData = selection
      // }
    },

    handleSelectionChange(selection){
      if (this.args.rowSelection) {
        this.selectedData = selection
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

    sizeColumnsToFit() {
      if (this.args.autoSize) {
        this.gridApi.sizeColumnsToFit();
      }
    },

    onColMoved(params) {
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
    getArgs() {
      return this.args;
    },
    // 设置基本属性
    setArgs(args) {
      for (var i in args) {
        this.args[i] = args[i];
      }
      if ("name" in args) this.args_name = this.args.name;
      return this;
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

    setExternalOprConfig(config) {
      // this.externalOpr = true;
      if (config) {
        this.args.columnDefs.forEach((col, index) => {
          if (col.colId === '_oprColumn' && col.operationParams && col.operationParams.length !== 0) {
            col.operationParams.forEach((item, index) => {
              Object.assign(item, config[index]);
            })
            if(this.columnDefs[index]){
              this.columnDefs[index].operationParams = col.operationParams;
            }
          }
        })
      }
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

    /**
     * @author LiuBo
     * @method
     * @name
     * @private
     * @description 装配列render
     * @param {Array} definitions多列定义
     * @param {Object} definitions列定义
     * @return {Object} 装配render与renderHeader的definition列定义
     */
    generateColumnRender(def) {
      let definitions = _.cloneDeep(def);
      if (Array.isArray(definitions)) {
        definitions.forEach((definition, index) => {
          switch (definition.key) {
            case '_selColumn':
              break;
            case '_SNColumn':
              break;
            case '_oprColumn':
              definition.render = this.generateCellRender(def[index]);
              break;
            default:
              definition.render = this.generateCellRender(def[index]);
              break;
          }
        })
      } else {
        switch (definitions.key) {
          case '_selColumn':
            break;
          case '_SNColumn':
            break;
          case '_oprColumn':
            definitions.render = this.generateCellRender(def);
            break;
          default:
            definitions.render = this.generateCellRender(def);
            break;
        }
      }
      return definitions;
    },

    /**
     * @author LiuBo
     * @method
     * @name generateCellRender
     * @private
     * @description 装配列自定义渲染
     * @param {Object} config列配置
     */
    generateCellRender(config) {
      switch (config.renderType) {
        case "progressBarRender":
          return (h, params) => {
            return h(progressBarRender, {
              props: {
                config: config,
                params: params,
              }
            });
          }
          break;
        case "checkboxRender":
          return (h, params) => {
            return h(checkboxRender, {
              props: {
                config: config,
                params: params,
              }
            });
          };
          break;
        case "operationRender":
          for (let item of config.operationParams) {
            if (item.auth) {
              item.hasAuth = false;
              if (this.oprAuth.length === 0) {
                item.hasAuth = true;
              }
              if (this.oprAuth.filter(auth => auth.authority === item.auth_item).length !== 0) {
                item.hasAuth = true;
              }
            } else {
              item.hasAuth = true;
            }
          }
          return (h, params) => {
            return h(operationRender, {
              props: {
                config: config,
                params: params,
              },
              on: {
                handleInvokeOperation: this.handleInvokeOperation
              }
            });
          };
          break;
        case "timeTransferRender":
          return (h, params) => {
            return h(timeTransferRender, {
              props: {
                config: config,
                params: params,
              }
            });
          };
          break;
        case "escapeSubstitute":
          return (h, params) => {
            return h(escapeRender, {
              props: {
                config: config,
                params: params,
              }
            });
          };
          break;
        case "customTransferRender":
          return (h, params) => {
            return h(customTransferRender, {
              props: {
                config: config,
                params: params,
              }
            });
          };
          break;
        case "NONE":
          return null;
          break;
        default:
          return null;
          break;
      }
    },

    /**
     * @author LiuBo
     * @method
     * @name
     * @private
     * @description 操作列点击
     * @param {String} type opr_type
     * @param {String} path opr_path
     * @param {Object} selectedObj 操作对象
     * @param {Object} eventObj 操作配置
     */
    async handleInvokeOperation(type, path, selectedObj, eventObj) {
      this.handleInvokeOperationObj = {};
      for (let attr in selectedObj) {
        // 避免引用类造成的rowData更换
        if (attr.indexOf("%ref%") !== -1) delete selectedObj[attr];
        delete selectedObj._index;
        delete selectedObj._rowKey;
        if (!this.isRelation) {
          this.attributeTransfer(attr, selectedObj, '');
        } else {
          if (attr.indexOf('left_') !== -1) {
            this.attributeTransfer(attr.replace(/left_/, ""), selectedObj, 'left_');
          } else if (attr.indexOf('relation_') !== -1) {
            this.attributeTransfer(attr.replace(/relation_/, ""), selectedObj, 'relation_');
          } else if (attr.indexOf('right_') !== -1) {
            this.attributeTransfer(attr.replace(/right_/, ""), selectedObj, 'right_');
          } else {
            this.attributeTransfer(attr, selectedObj, '');
          }
        }
      }

      this.selectedData = selectedObj;
      let sysEventObj = this.sysEventPath.includes(path) ? {
        opr_sys_path: eventObj.opr_sys_path,
        opr_showMessage: eventObj.opr_showMessage,
      } : null
      let multiObjParams;
      if (this.isRelation) {
        multiObjParams = {
          className: this.args.targetClass,
          isRelation: this.isRelation,
          oidList: [this.args.id],
          opr_source: 'grid',
          sysEventObj: sysEventObj,
          leftClass: this._relation.leftClass,
          rightClass: this._relation.rightClass,
          relationClass: this._relation.className
        }
      } else {
        multiObjParams = {
          className: this.args.targetClass,
          isRelation: this.isRelation,
          oidList: [this.args.id],
          opr_source: 'grid',
          sysEventObj: sysEventObj,
        }
      }
      await this.invokeOperation(type, path, this.itemValue, this.store, null, this.handleInvokeOperationObj, null, multiObjParams);
    },

    /**
     * @author LiuBo
     * @method
     * @name
     * @private
     * @description 功能方法：把selectedObj中值转换为正确类型值再拼回去，因为attrMap不带前缀
     */
    attributeTransfer(attr, selectedObj, type) {
      if (this.attrMap[attr] && ["Integer", "Long"].indexOf(this.attrMap[attr].valueType) !== -1) {
        this.handleInvokeOperationObj[`${type}${attr}`] = parseInt(selectedObj[`${type}${attr}`]);
      } else if (this.attrMap[attr] && this.attrMap[attr].valueType === "Double") {
        this.handleInvokeOperationObj[`${type}${attr}`] = parseFloat(selectedObj[`${type}${attr}`]);
      } else if (this.attrMap[attr] && this.attrMap[attr].valueType === "Boolean") {
        if (selectedObj[`${type}${attr}`] === "True" || selectedObj[`${type}${attr}`] === "true") this.handleInvokeOperationObj[`${type}${attr}`] = true;
        else this.handleInvokeOperationObj[`${type}${attr}`] = false;
      } else {
        this.handleInvokeOperationObj[`${type}${attr}`] = selectedObj[`${type}${attr}`];
      }
    }
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

.ag-cell.attr-restricted {
  display: none;
}

.ivu-page-item.ivu-page-item-active {
  border-color: #2d8cf0 !important;
}

.ag-cell a.disabled {
  cursor: not-allowed;
  color: #c5c8ce;
}

.grid-header-left .ag-header-cell-label {
  justify-content: flex-start;
}

.grid-header-center .ag-header-cell-label {
  justify-content: center;
}

.grid-header-right .ag-header-cell-label {
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


.grid-font-color-red {
  color: red !important;
}

.grid-font-color-yellow {
  color: yellow !important;
}

.grid-font-color-green {
  color: green !important;
}

.grid-font-color-black {
  color: black !important;
}

.grid-font-color-white {
  color: white !important;
}

.grid-font-color-grey {
  color: grey !important;
}

.grid-font-color-blue {
  color: blue !important;
}

.grid-background-color-red {
  background-color: red !important;
}

.grid-background-color-yellow {
  background-color: yellow !important;
}

.grid-background-color-green {
  background-color: green !important;
}

.grid-background-color-black {
  background-color: black !important;
}

.grid-background-color-white {
  background-color: white !important;
}

.grid-background-color-grey {
  background-color: grey !important;
}

.grid-background-color-blue {
  background-color: blue !important;
}

.grid-font-size-12 {
  font-size: 12px;
}

.grid-font-size-14 {
  font-size: 14px;
}

.grid-text-decoration-underline {
  text-decoration: underline;
}

.grid-text-decoration-line-through {
  text-decoration: line-through;
}

.grid-font-weight-bold {
  font-weight: bold;
}

.grid-font-weight-normal {
  font-weight: normal;
}

.grid-font-size-12 .ag-cell {
  font-size: 12px;
}

.grid-font-size-14 .ag-cell {
  font-size: 14px;
}

.grid-text-decoration-underline .ag-cell {
  text-decoration: underline;
}

.grid-text-decoration-line-through .ag-cell {
  text-decoration: line-through;
}

.simple-table-column-align0{
  text-align: left!important;
  vertical-align: top!important;
}

.simple-table-column-align1{
  text-align: left!important;
  vertical-align: middle!important;
}

.simple-table-column-align2{
  text-align: left!important;
  vertical-align: bottom!important;
}

.simple-table-column-align3{
  text-align: center!important;
  vertical-align: top!important;
}

.simple-table-column-align4{
  text-align: center!important;
  vertical-align: middle!important;
}

.simple-table-column-align5{
  text-align: center!important;
  vertical-align: bottom!important;
}

.simple-table-column-align6{
  text-align: right!important;
  vertical-align: top!important;
}

.simple-table-column-align7{
  text-align: right!important;
  vertical-align: middle!important;
}

.simple-table-column-align8{
  text-align: right!important;
  vertical-align: bottom!important;
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

.readonly-mask {
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
