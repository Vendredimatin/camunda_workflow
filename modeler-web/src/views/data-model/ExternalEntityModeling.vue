<template>
  <div>
    <div style="float: left; margin: 10px 10px 0">
      <Button type="primary" style="margin: 5px 10px" @click="onClickImportButton" id="createExternalEntityButton">
        引入外部实体类
      </Button>
      <Modal
              v-model="importModal"
              :title="importModalState === 'importing' ? '引入外部实体类' : '编辑实体类'"
              id="createExternalEntityModal"
              width="75%"
              :mask-closable="false"
              @on-cancel="cancelImport"
      >
        <Spin fix v-show="importModalLoading"></Spin>
        <Form ref="importExternalEntityForm" :model="externalEntityData" :rules="externalEntityValidate" inline>
          <FormItem label="数据源" prop="dataSourceOid" style="width: 23%;">
            <Select v-model="externalEntityData.dataSourceOid" placeholder="选择数据源" @on-change="onChangeDataSource" filterable clearable :disabled="importModalState==='editing'" id="createExternalEntityModalDataSourceOid">
              <Option v-for="item in allDataSources" :value="item.oid" :key="item.oid" :label="item.dataSourceName">
                {{ item.dataSourceName }}
              </Option>
            </Select>
          </FormItem>
          <FormItem label="Schema" prop="schema" style="width: 23%;">
            <Select v-model="externalEntityData.schema"
                    @on-change="onChangeSchema" filterable :disabled="importModalState==='editing'">
              <Option v-for="item in dbSchema" :value="item" :key="item">{{ item }}</Option>
            </Select>
          </FormItem>
          <FormItem label="数据库表" prop="zoneName" style="width: 23%;">
            <Select v-model="externalEntityData.zoneName" placeholder="选择数据库表"
                    @on-change="onChangeTable"
                    @on-clear="onClearTable"
                    filterable clearable :disabled="importModalState==='editing'" id="createExternalEntityModalZoneName">
              <Option v-for="item in allTables" :value="item" :key="item">{{ item }}</Option>
            </Select>
          </FormItem>
          <FormItem v-if="reFitem" label="英文名" prop="className" style="width: 23%;">
            <Input v-model="externalEntityData.className" placeholder="输入英文名" :disabled="importModalState==='editing'" id="createExternalEntityModalClassName"></Input>
          </FormItem>
          <FormItem v-if="reFitem" label="显示名" prop="displayName" style="width: 23%;">
            <Input v-model="externalEntityData.displayName" placeholder="输入显示名" id="createExternalEntityModalDisplayName"></Input>
          </FormItem>
          <FormItem label="主键" prop="primaryKey" style="width: 23%;">
            <Select v-model="externalEntityData.primaryKey" placeholder="选择主键列" filterable clearable :disabled="(importModalState==='editing' && currentData.primaryKey !== undefined) || externalEntityData.zoneName === '' || externalEntityData.zoneName === undefined" id="createExternalEntityModalPrimaryKey">
              <Option v-for="item in externalEntityKeyCols" :value="item.attributeName" :key="item.attributeName">{{ item.attributeName }}</Option>
            </Select>
          </FormItem>
        </Form>
        <Form>
          <FormItem label="导入属性列">
            <Select v-model="selectedAttributes" filterable multiple :disabled="externalEntityData.zoneName === '' || externalEntityData.zoneName === undefined" @on-change="changeAttr" id="createExternalEntityModalSelectedAttributes">
              <Option v-for="(item,index) in externalEntityColsData" :value="item.attributeName" :key="index" :label="item.attributeName">{{ item.attributeName }}</Option>
            </Select>
          </FormItem>
        </Form>
        <Table
                id="createExternalEntityModalSelectedAttributesTable"
                border
                :columns="attrColumns"
                :data="externalEntityColsDataFiltered"
                size="small"></Table>
        <div slot="footer">
          <Button type="text" size="large" :loading="false" @click="cancelImport">取消</Button>
          <Button type="primary" size="large" @click="confirmImport" id="confirmCreateExternalEntityButton">确认</Button>
        </div>
      </Modal>
      <Modal
              v-model="importEditModal"
              :title="'编辑实体类'"
              id="editExternalEntityModal"
              width="75%"
              :mask-closable="false"
              @on-cancel="cancelImport"
      >
        <Spin fix v-show="importModalLoading"></Spin>
        <Form ref="editExternalEntityForm" :model="externalEntityData" :rules="externalEntityValidateEdit" inline>
          <FormItem label="数据源" prop="dataSourceOid" style="width: 23%;">
            <Select v-model="externalEntityData.dataSourceOid" placeholder="选择数据源"
                    @on-change="onChangeDataSource" filterable :disabled="importModalState==='editing'" id="editExternalEntityModalDataSourceOid">
              <Option v-for="item in allDataSources" :value="item.oid" :key="item.oid" :label="item.dataSourceName">
                {{ item.dataSourceName }}
              </Option>
            </Select>
          </FormItem>
          <FormItem label="Schema" prop="schema" style="width: 23%;">
            <Select v-model="externalEntityData.schema"
                    @on-change="onChangeSchema" filterable :disabled="importModalState==='editing'">
              <Option v-for="item in dbSchema" :value="item" :key="item">{{ item }}</Option>
            </Select>
          </FormItem>
          <FormItem label="数据库表" prop="zoneName" style="width: 23%;">
            <Select v-model="externalEntityData.zoneName" placeholder="选择数据库表"
                    @on-change="onChangeTable" filterable :disabled="importModalState==='editing'" id="editExternalEntityModalZoneName">
              <Option :value="externalEntityData.zoneName">{{ externalEntityData.zoneName }}</Option>
            </Select>
          </FormItem>
          <FormItem label="英文名" prop="className" style="width: 23%;">
            <Input v-model="externalEntityData.className" placeholder="输入英文名" :disabled="importModalState==='editing'" id="editExternalEntityModalClassName"></Input>
          </FormItem>
          <FormItem label="显示名" prop="displayName" style="width: 23%;">
            <Input v-model="externalEntityData.displayName" placeholder="输入显示名" id="editExternalEntityModalDisplayName"></Input>
          </FormItem>
          <FormItem label="主键" prop="primaryKey" style="width: 23%;">
            <Select v-model="externalEntityData.primaryKey" placeholder="选择主键列" filterable :disabled="(importModalState==='editing' && currentData.primaryKey !== undefined) || externalEntityData.zoneName === '' || externalEntityData.zoneName === undefined" id="editExternalEntityModalPrimaryKey">
              <Option v-for="item in externalEntityKeyCols" :value="item.attributeName" :key="item.attributeName">{{ item.attributeName }}</Option>
            </Select>
          </FormItem>
        </Form>
        <Form>
          <FormItem label="导入属性列">
            <Select v-model="selectedAttributes" filterable multiple :disabled="externalEntityData.zoneName === '' || externalEntityData.zoneName === undefined" @on-change="changeAttr" id="editExternalEntityModalSelectedAttributes">
              <Option v-for="(item,index) in externalEntityColsData" :value="item.attributeName" :key="index" :label="item.attributeName">{{ item.attributeName }}</Option>
            </Select>
          </FormItem>
        </Form>
        <Table
                id="editExternalEntityModalSelectedAttributesTable"
                border
                :columns="attrColumns"
                :data="externalEntityColsDataFiltered"
                size="small"></Table>
        <div slot="footer">
          <Button type="text" size="large" :loading="false" @click="cancelImport">取消</Button>
          <Button type="primary" size="large" @click="confirmImport" id="confirmEditExternalEntityButton">确认</Button>
        </div>
      </Modal>
      <Button type="error" style="margin: 5px" :disabled="currentData.id === undefined" @click="onClickDeleteButton" id="deleteExternalEntityButton">
        删除实体类
      </Button>
      <Button type="primary" style="margin: 5px" :disabled="currentData.id === undefined" @click="onClickEditButton" id="editExternalEntityButton">
        编辑实体类
      </Button>
      <Button type="primary" style="margin: 5px" :disabled="currentData.id === undefined" @click="onClickViewObjectsButton" id="viewExternalEntityButton">
        查看对象
      </Button>
      <Modal
        width="80%"
        v-model="viewObjectsModal"
        title="查看对象"
        scrollable
        :mask-closable="false"
        id="viewObjectsModal"
      >
        <div style="clear: both; margin: 10px">
          <Row>
            <Input v-model="filterQuery" type="textarea" style="width: 90%;margin-left: 5px;" placeholder="输入过滤条件" :autosize="true" @on-focus="inputQuery" id="searchObjectInput"></Input>
            <Button type="primary" @click="searchObj" style="margin-left: 7px;float: right;">查询</Button>
          </Row>
          <Table style="margin: 5px;"
                 width="100%"
                 height="450"
                 :loading="objectsDataloading"
                 stripe
                 border
                 show-header
                 highlight-row
                 :data="objectsData"
                 :columns="objectsDataColumns"
          >
          </Table>
        </div>
        <div style="margin: 10px; overflow: hidden">
          <div style="float: right; margin: 5px">
            <Page
              style="margin-bottom: 20px"
              size="small"
              show-sizer
              show-elevator
              show-total
              placement="top"
              :page-size-opts="pageSizeOpts"
              :pageSize="objectsPageSize"
              :total="objectsDataCount"
              :current="objectsCurrentPage"
              @on-change="objectsChangePage"
              @on-page-size-change="objectsChangePageSize"></Page>
          </div>
        </div>
        <div slot="footer">
          <i-button type="primary" size="large" @click="viewObjectsModal = false" id="confirmViewObjectsModalButton">确认</i-button>
        </div>
      </Modal>
    </div>
    <div style="float: right; margin: 10px 10px 0">
      <Input
        v-model="keyword"
        icon="md-search"
        placeholder="输入关键词查询"
        style="width: 200px; margin: 5px"
        @on-change="searchKeyword"
        id="searchExternalEntityInput"
      >
      </Input>
    </div>
    <div style="clear: both; margin: 10px">
      <Table ref="viewTable"
             :height="tableHeight"
             style="margin: 5px;"
             :loading="loading"
             id="externalEntityTable"
             stripe
             border
             highlight-row
             size="small"
             :data="tableDataPage"
             :columns="tableColumns"
             @on-row-click="selectRow"
             @on-row-dblclick="handleDoubleClick"
             @on-sort-change="handleSortChange"
      >
      </Table>
    </div>
    <div style="margin: 10px; overflow: hidden">
      <div style="float: right; margin: 5px">
        <Page
          style="margin-bottom: 20px"
          size="small"
          show-sizer
          show-elevator
          show-total
          placement="top"
          :page-size-opts="pageSizeOpts"
          :pageSize="pageSize"
          :total="filteredTableData.length"
          :current="currentPage"
          @on-change="changePage"
          @on-page-size-change="changePageSize"></Page>
      </div>
    </div>
    <Modal
      v-model="deleteConfirm"
      title="实体类删除"
      >
      <p>确定要删除这个实体类吗?</p>
      <br>
      <Checkbox v-model="cascade">级联删除与此实体类关联的关联类、属性、表单、授权项(<span style="color: orangered">请谨慎选择</span>)</Checkbox>
      <div slot="footer">
        <Button type="text" size="large" :loading="false" @click="deleteConfirm = false">取消</Button>
        <Button type="primary" size="large" :loading="deleteModalLoading" @click="deleteRowOnOk">确认</Button>
      </div>
    </Modal>

    <FilterQueryCommonModal
      :refClass="currentData.className"
      :targetClass="currentData.className"
      ref="filterQuery_modal"
      :store="store"
      @generatorFilterQuery="getFilterQuery">
    </FilterQueryCommonModal>

  </div>

</template>
<script>
  import {tableMixin} from "@/component/tableMixin"
  import DataSourceMgr from "../../api/data-model/DataSourceMgr";
  import EntityModeling from "../../api/data-model/EntityModeling";
  import ResourceModeling from "../../api/data-model/ResourceModeling";
  import { getEobj, getEntityObjCount } from "../../api/others";
  import FilterQueryCommonModal from '@/ext_components/form/subcomponent/FilterQueryCommonModal'
  import { clone } from "@/util/assist";
import {
  getAllDataSources,
  getAllDataSourcesByIp,
  createDataSource,
  updateDataSource,
  getDataSource,
  deleteDataSource,
  getDataSourceConnectionState,
  getTables,
  getColumns,
  getExtClass,
  checkExtClass,
} from "@/api/data-model/DataService";
  export default {
    name: "external-entity-modeling",
    mixins: [tableMixin],
    props: ["store"],
    data() {
      const defaultDataSource = "默认PG数据源";
      return {
        preDbClick: false,
        tableDataAll: [],
        tableDataAllUnsorted: [],
        queryAttrList: [],
        loading: true,
        currentPage: 1,
        pageSize: 10,
        pageSizeOpts: [10, 25, 50, 100, 200],
        keyword: "",
        currentData: {},
        columnsWidth: 319,
        filterQuery: '',
        reFitem: false,

        externalEntityValidate: {
          dataSourceOid: [
            { required: true, message: "数据源名不能为空" }
          ],
          zoneName: [
            { required: true, message: "数据库表名不能为空"}
          ],
          className: [
            { required: true, message: "英文名不能为空", trigger: "blur" },
            {
              pattern: /^[A-Za-z][A-Za-z0-9]{0,31}$/,
              message: "英文名只能包含字母和数字，并以字母开头，长度不超过32个字符",
              trigger: "blur"
            }
          ],
          displayName: [
            { required: true, message: "显示名不能为空", trigger: "blur" },
            {
              // pattern: /^[a-zA-Z0-9_\u0391-\uFFE5]+$/,
              // message: "显示名只能包含汉字、字母、数字或下划线",
              pattern: /^\S{1,32}$/,
              message: "显示名长度不超过32个字符",
              trigger: "blur"
            }
          ],
          primaryKey: [
            { required: true, message: "主键不能为空"}
          ]
        },
        externalEntityValidateEdit: {
          displayName: [
            { required: true, message: "显示名不能为空", trigger: "blur" },
            {
              // pattern: /^[a-zA-Z0-9_\u0391-\uFFE5]+$/,
              // message: "显示名只能包含汉字、字母、数字或下划线",
              pattern: /^\S{1,32}$/,
              message: "显示名长度不超过32个字符",
              trigger: "blur"
            }
          ],
          primaryKey: [
            { required: true, message: "主键不能为空", trigger: "blur" }
          ]
        },
        dbSchema: [],
        allTables: [],
        defaultDataSource: defaultDataSource,
        allDataSources: [{
          oid: defaultDataSource,
          dataSourceName: defaultDataSource
        }],
        tableColumns: [
          {
            type: "index",
            title: "序号",
            width: 80,
            align: "center"
          }, {
            title: "英文名",
            key: "className",
            sortable: "custom",
            render: (h, params) => {
              return h('Tooltip', {
              props: { placement: 'bottom', maxWidth: 362, transfer: true }
              }, [
                  params.row.className.length > 32 ? params.row.className.slice(0, 32) + "..." : params.row.className,
                  h('span', { slot: 'content', style: { whiteSpace: 'normal', wordBreak: 'break-all' } },
                  params.row.className)
              ])
            }
          }, {
            title: "显示名",
            key: "displayName",
            sortable: "custom",
            render: (h, params) => {
              return h('Tooltip', {
              props: { placement: 'bottom', maxWidth: 362, transfer: true }
              }, [
                  params.row.displayName.length > 32 ? params.row.displayName.slice(0, 32) + "..." : params.row.displayName,
                  h('span', { slot: 'content', style: { whiteSpace: 'normal', wordBreak: 'break-all' } },
                  params.row.displayName)
              ])
            }
          }, {
            title: "数据库表",
            key: "zoneName",
            sortable: "custom",
            render: (h, params) => {
              return h('Tooltip', {
              props: { placement: 'bottom', maxWidth: 362, transfer: true }
              }, [
                  params.row.zoneName.length > 32 ? params.row.zoneName.slice(0, 32) + "..." : params.row.zoneName,
                  h('span', { slot: 'content', style: { whiteSpace: 'normal', wordBreak: 'break-all' } },
                  params.row.zoneName)
              ])
            }
          }
        ],

        importModal: false,
        importEditModal: false,
        externalEntityData:{
          className : '',
          zoneName : '',
          displayName : '',
          primaryKey: '',
          packagePath : {}   // 存储的是列英文名到中文名的字典，及需要引入的属性列表
        },
        attrColumns:[
          {
            title: "序号",
            type: "index",
            width: 100,
            align: "center"
          },
          {
            title: "列名",
            key: "attributeName",
            render: (h, params) => {
              return h('Tooltip', {
              props: { placement: 'bottom', maxWidth: 362, transfer: true }
              }, [
                  params.row.attributeName.length > 16 ? params.row.attributeName.slice(0, 16) + "..." : params.row.attributeName,
                  h('span', { slot: 'content', style: { whiteSpace: 'normal', wordBreak: 'break-all' } },
                  params.row.attributeName)
              ])
            }
          },
          {
            title: "显示名",
            key: "displayName",
            // render: (h, params) => {
            //   let attributeName = params.row.attributeName;
            //   let rules = {};
            //   rules[attributeName] = [
            //     { required: true, message: '英文名不能为空哦～', trigger: 'blur' },
            //     {
            //       pattern: /^\S{0,32}$/,
            //       message: "显示名只能包含汉字、字母、数字，长度不超过32个字符",
            //       trigger: "blur"
            //     }
            //   ];
            //   let model = {};
            //   model[attributeName] = '';
            //   return h("Form", {
            //     props: {
            //       rules: rules,
            //       model: model
            //     }
            //   },
            //     [
            //       h("FormItem", {
            //         props: {
            //           prop: attributeName,
            //         },
            //       }, [
            //         h("Input", {
            //           props: {
            //             type: "text",
            //             model: model[attributeName],
            //             value: this.externalEntityData.packagePath[params.row.attributeName]
            //           },
            //           on: {
            //             "on-change": event => {
            //               if(event.target.value.length > 32) {
            //                 // this.$Message.error('显示名不能超过32个字符');
            //                 this.$nextTick(() => {
            //                   event.target.value = event.target.value.substr(0, 32);
            //                 })
            //               }else{
            //                 this.externalEntityData.packagePath[
            //                   params.row.attributeName
            //                   ] =
            //                   event.target.value.substr(0, 32);
            //               }
            //             }
            //           }
            //         })
            //       ])
            //     ]
            //   )
            // }
            render: (h, params) => {
              return h("div", [
                h("Input", {
                  props: {
                    type: "text",
                    value: this.externalEntityData.packagePath[
                      params.row.attributeName
                      ]
                  },
                  on: {
                    "on-change": event => {
                      if(event.target.value.length > 32) {
                        this.$Message.error('显示名不能超过32个字符');
                        this.$nextTick(() => {
                          event.target.value = event.target.value.substr(0, 32);
                          this.externalEntityData.packagePath[params.row.attributeName] = event.target.value.substr(0, 32);
                        })
                      }else{
                        this.$nextTick(() => {
                          this.externalEntityData.packagePath[params.row.attributeName] = event.target.value.substr(0, 32);
                        })
                      }
                    }
                  }
                })
              ]);
            }
          },
          {
            title: "数据类型",
            key: "valueType",
            tooltip: true
          },
          {
            title: "长度",
            key: "valueLength",
            tooltip: true
          }
        ],
        externalEntityColsData: [],
        externalEntityKeyCols: [],
        selectedAttributes: [],
        externalEntityColsDataFiltered: [],
        importModalState: "",
        importModalLoading: false,

        viewObjectsModal: false,
        objectsDataloading: false,
        objectsData: [],
        objectsDataCount: 0,
        objectsDataColumns: [],
        objectsCurrentPage: 1,
        objectsPageSize: 10,

        deleteConfirm: false,
        cascade : false,
        sortParams: undefined,
        deleteModalLoading: false
      };
    },
    watch: {
      importModal(val){
        !val ? this.cancelImport() : ''
      }
    },
    computed: {
      filteredTableData() {
        let keywordLower = this.keyword.toLowerCase().trimStart().trimEnd();
        let res = [];
        for (let id in this.tableDataAll) {
          let data = this.tableDataAll[id];
          for (let key in data) {
            if(key == 'className' || key == 'displayName' || key == 'zoneName') {

              if (
                data[key]
                  .toString()
                  .toLowerCase()
                  .match(keywordLower) !== null
              ) {
                res.push(data);
                break;
              }

            }
          }
        }
        return res;
      },
      tableDataPage() {
        return this.filteredTableData.slice(
          this.currentPage * this.pageSize - this.pageSize,
          this.currentPage * this.pageSize
        );
      },
      // externalEntityColsDataFiltered() {
      //   console.log(this.externalEntityColsData, this.selectedAttributes);
      //   let finalArr = this.externalEntityColsData.filter(item => {
      //     return this.selectedAttributes.indexOf(item.attributeName) != -1;
      //   })
      //   console.log(finalArr)
      //   return finalArr
      // }
    },
    created() {
      console.log("start of resetColumnsWidth")
      this.resetColumnsWidth();
      console.log("end of resetColumnsWidth")
      this.initData();
      console.log("end of initData")
    },
    components: {
      FilterQueryCommonModal
    },
    methods: {
      initData() {
        this.getAllRows();
        this.resetModalData();
        console.log("end of resetModalData")
      },
      activate() {
        this.resetColumnsWidth();
      },
      globalRefresh() {
        this.currentPage = 1;
        this.allDataSources = [
          {
            oid: this.defaultDataSource,
            dataSourceName: this.defaultDataSource
          }
        ]
        this.initData();
      },
      resetColumnsWidth() {

        let sideWidth = document.getElementById('mainMenuSide') ? document.getElementById('mainMenuSide').style.width : 0;
        let finalWidth = parseInt(sideWidth) + 250;
        this.columnsWidth = (document.body.clientWidth - finalWidth) / 3;
        console.log(this.columnsWidth)

        this.tableColumns = [
          {
            type: "index",
            title: "序号",
            width: 80,
            align: "center"
          }, {
            title: "英文名",
            key: "className",
            minWidth: this.columnsWidth,
            sortable: "custom",
            render: (h, params) => {
              return h('Tooltip', {
              props: { placement: 'bottom', maxWidth: 362, transfer: true }
              }, [
                  params.row.className.length > 32 ? params.row.className.slice(0, 32) + "..." : params.row.className,
                  h('span', { slot: 'content', style: { whiteSpace: 'normal', wordBreak: 'break-all' } },
                  params.row.className)
              ])
            }
          }, {
            title: "显示名",
            key: "displayName",
            minWidth: this.columnsWidth,
            sortable: "custom",
            render: (h, params) => {
              return h('Tooltip', {
              props: { placement: 'bottom', maxWidth: 362, transfer: true }
              }, [
                  params.row.displayName.length > 32 ? params.row.displayName.slice(0, 32) + "..." : params.row.displayName,
                  h('span', { slot: 'content', style: { whiteSpace: 'normal', wordBreak: 'break-all' } },
                  params.row.displayName)
              ])
            }
          }, {
            title: "数据库表",
            key: "zoneName",
            minWidth: this.columnsWidth,
            sortable: "custom",
            render: (h, params) => {
              return h('Tooltip', {
              props: { placement: 'bottom', maxWidth: 362, transfer: true }
              }, [
                  params.row.zoneName.length > 32 ? params.row.zoneName.slice(0, 32) + "..." : params.row.zoneName,
                  h('span', { slot: 'content', style: { whiteSpace: 'normal', wordBreak: 'break-all' } },
                  params.row.zoneName)
              ])
            }
          }
        ]

      },

      getFilterQuery(finallyFilterQuery) {
        this.filterQuery = finallyFilterQuery;
      },

      // 设置原生查询默认值
      // setNativeQuery(type, query) {

      //   let str = 'nativequery: SELECT ';
      //   this.queryAttrList.forEach(s => {
      //     str = str + `${s.attributeName},`;
      //   })
      //   str = str.substr(0, str.length - 1) + ` FROM ${this.currentData.zoneName} WHERE 1=1`;
      //   if(type == 'native' && query == '') {
      //     // this.$refs.filterQuery_modal.setFilterQuery('nativeQuery:select plt_oid as oid,plt_createtime as createtime [,...] frome plt_part where 1=1');
      //     this.$refs.filterQuery_modal.setFilterQuery(str);
      //   }

      // },

      // 对象过滤
      inputQuery() {
        let option = {
          allowNative: true
        }
        if (this.currentData.className) {
          this.$refs.filterQuery_modal.initModal(this.filterQuery, this.currentData.className, option, true, 'ex_en');
        } else {
          this.$refs.filterQuery_modal.initModal(this.filterQuery, '', option, true, 'ex_en');
        }
      },

      searchObj() {
        this.refreshObjects(this.filterQuery, true);
      },
      resetModalData() {
        this.importModalLoading = true;
        let promises = [];
        promises.push(ResourceModeling.getAllTables()
          .then(res => {
            this.allTables = res.data;
          }));
        promises.push(getAllDataSources().then(res => {
          if (res.data !== undefined)
            // 加上默认数据源，移去IoTDB\Mysql\Hdfs数据源（IoTDB数据源的引入，应通过在内部实体类上绑定数据的方式）
            this.allDataSources = this.allDataSources.concat(res.data).filter(item => {
              return !(['IOTDB', 'MYSQL', 'HDFS', 'ORACLE', 'SQLSERVER'].includes(item.dataSourceType));
            });
        }));
        Promise.all(promises).then(res => {
          this.importModalLoading = false;
        });
      },
      getAllRows() {
        this.currentData = {};
        this.loading = true;
        EntityModeling.getExternalEntities()
          .then(res => {
            this.loading = false;
            this.tableDataAll = res.data;
            this.tableDataAllUnsorted = clone(this.tableDataAll);
            this.handleSortChange(this.sortParams);
          })
          .catch(error => {
            this.loading = false;
            this.$Message.error(error.response.data.message);
          });
      },
      changePage(pageId) {
        this.currentData = {};
        this.currentPage = pageId;
      },
      changePageSize(pageSize) {
        this.currentData = {};
        this.pageSize = pageSize;
      },
      objectsChangePage(pageId) {
        this.objectsCurrentPage = pageId;
        this.refreshObjects(this.filterQuery);
      },
      objectsChangePageSize(pageSize) {
        this.objectsPageSize = pageSize;
        this.refreshObjects(this.filterQuery);
      },
      maxSlice(v) {
        if (v !== null && v !== '' && v != undefined) {
          if(v === false || v === true) v = v + '';
          return v.length > 32 ? v.slice(0, 32) + "..." : v
        }
      },
      onClickViewObjectsButton() {
        this.viewObjectsModal = true;
        this.filterQuery = '';
        this.objectsData = [];
        this.objectsCurrentPage = 1;
        this.objectsDataColumns = [
          {
            type: "index",
            title: "序号",
            width: 80,
            align: "center"
          }
        ];
        EntityModeling.getAttributes(this.currentData.className).then(res => {
          this.queryAttrList = res.data;
          res.data.forEach(item => {
            this.objectsDataColumns.push({
              title: item.attributeName,
              key: item.attributeName,
              minWidth: Math.max((item.attributeName.length + 2) * 15, 150),
              render: (h, params) => {
                return h('Tooltip', {
                  props: { placement: 'bottom', maxWidth: 1100, transfer: true }
                }, [
                    this.maxSlice(params.row[item.attributeName]),
                    h('span', { slot: 'content', style: { whiteSpace: 'normal', wordBreak: 'break-all' } },
                      params.row[item.attributeName])
                  ])
              }
            });
          });
          this.refreshObjects();
        });
      },
      refreshObjects(str, resetFlag) {
        this.objectsDataloading = true;
        this.objectsData = [];
        getEntityObjCount(this.currentData.className, {condition: str ? str : ''})
          .then(res => {
            if (!res.data.success) {
              this.$Message.error(res.data.message);
              this.objectsDataCount = 0;
              this.objectsCurrentPage = 1;
              this.objectsDataloading = false;
              return;
            }
            this.objectsDataCount = res.data.data;
            if(resetFlag) {
              this.objectsCurrentPage = 1;
            }
            getEobj(this.currentData.className, {
              condition: str ? str : '',
              startIndex:
                this.objectsCurrentPage * this.objectsPageSize -
                this.objectsPageSize,
              pageSize: this.objectsPageSize
            })
              .then(res => {
                if(!res.data.success){
                  this.$Message.error(res.data.message);
                  this.objectsDataloading = false;
                  return;
                }
                this.objectsData = res.data.data;
                let len = this.objectsData.length;
                for (let i = 0; i < len; ++i) {
                  let obj = this.objectsData[i];
                  Object.keys(obj).forEach(function(key){
                    let date;
                    if (obj[key].toString().length === 13 && (date = new Date(obj[key])) !== undefined && date.getFullYear() > 1900 && date.getFullYear() < 2100) {
                      var y = date.getFullYear(),
                        m = date.getMonth() + 1,
                        d = date.getDate();
                      obj[key] = y + "-" + (m < 10 ? "0" + m : m) + "-" + (d < 10 ? "0" + d : d) + " " + date.toTimeString().substr(0, 8);
                    }
                  });
                }
                this.objectsDataloading = false;
              })
              .catch(e => {
                this.objectsDataloading = false;
              });
          })
          .catch(e => {
            this.objectsDataloading = false;
          });
      },
      searchKeyword() {
        this.currentData = {};
        this.changePage(1);
        this.handleSortChange(this.sortParams);
      },
      selectRow(rowData) {
        this.$refs['editExternalEntityForm'].resetFields();
        this.currentData = rowData;
        console.log(this.currentData)
        if (this.currentData.dataSourceOid === undefined || this.currentData.dataSourceOid === "") {
          this.currentData.dataSourceOid = this.defaultDataSource;
        }
      },
      onClickDeleteButton() {
        this.cascade = false;
        this.deleteConfirm = true;
      },
      deleteRowOnOk(){
        this.deleteModalLoading = true;
        let className = this.currentData.className;
        let backwardCount = 0;
        let forwardCount = 0;
        let promises = [];
        if (!this.cascade) {
          promises.push(EntityModeling.getBackwardRelations(className).then(res => {
            backwardCount = res.data.length;
          }));
          promises.push(EntityModeling.getForwardRelations(className).then(res => {
            forwardCount = res.data.length;
          }));
        }
        Promise.all(promises).then(res => {
          if (backwardCount > 0 || forwardCount > 0) {
            this.$Message.error(`实体类${className}的（被）关联类数量不为零，无法删除：关联数 ${backwardCount} 被关联数 ${forwardCount}`);
            this.deleteModalLoading = false;
            this.deleteConfirm = false;
          } else {
            let ps = [];
            if (this.cascade) {
              ps.push(EntityModeling.deleteProcess(className));
            }
            ps.push(EntityModeling.deleteEntity(className, this.cascade));
            Promise.all(ps)
              .then(res => {
                this.getAllRows();
                if (
                  this.tableDataAll.length - 1 ===
                  this.pageSize * (this.currentPage - 1) &&
                  this.tableDataAll.length !== 1
                )
                  this.changePage(this.currentPage - 1);
                this.deleteModalLoading = false;
                this.deleteConfirm = false;
                this.$Message.success("删除实体类成功");
              })
              .catch(error => {
                this.deleteModalLoading = false;
                this.deleteConfirm = false;
              });
          }
        });
      },
      handleDoubleClick(rowData, index) {
        this.selectRow(rowData);
        this.onClickEditButton();
      },
      handleSortChange(params) {
        this.sortParams = params;
        if (params === undefined) return;
        if (params.order === "asc") {
          this.tableDataAll.sort(function(a, b) {
            if (a[params.key] === undefined) return -1;
            if (b[params.key] === undefined) return 1;
            return a[params.key].toString().toLowerCase() > b[params.key].toString().toLowerCase() ? 1 : -1;
          });
        } else if (params.order === "desc") {
          this.tableDataAll.sort(function(a, b) {
            if (a[params.key] === undefined) return 1;
            if (b[params.key] === undefined) return -1;
            return a[params.key].toString().toLowerCase() > b[params.key].toString().toLowerCase() ? -1 : 1;
          });
        } else {
          this.tableDataAll = clone(this.tableDataAllUnsorted);
        }
      },
      onClickEditButton() {
        this.importEditModal = true;
        this.externalEntityData = {...this.currentData};
        if (this.currentData.dataSourceOid === undefined || this.currentData.dataSourceOid === "") {
          this.externalEntityData.dataSourceOid = this.defaultDataSource;
        }
        this.externalEntityData.packagePath = JSON.parse(this.currentData.packagePath);
        let importAttrKey = `${this.externalEntityData.dataSourceOid}__attributes`;

        this.importModalState = "editing";
        this.importModalLoading = true;
        this.allTables = [];
        this.externalEntityColsData = [];
        let promises = [];
        let zoneName = '';
        let zoneNameDisplay = '';
        if (this.externalEntityData.dataSourceOid === this.defaultDataSource) {

          this.dbSchema = [];
          this.dbSchema.push('public');
          this.externalEntityData.schema = 'public';
          zoneName = this.externalEntityData.zoneName;
          zoneNameDisplay = this.externalEntityData.zoneName;

        } else {

          let dbPreSchema = this.externalEntityData.zoneName.indexOf('.') != -1 ? this.externalEntityData.zoneName.split('.')[0] : 'public';
          zoneNameDisplay = this.externalEntityData.zoneName.indexOf('.') != -1 ? this.externalEntityData.zoneName.split('.')[1] : this.externalEntityData.zoneName;
          zoneName = this.externalEntityData.zoneName.indexOf('.') != -1 ? this.externalEntityData.zoneName : `public.${this.externalEntityData.zoneName}`;
          this.dbSchema = [];
          this.dbSchema.push(dbPreSchema);
          this.externalEntityData.schema = dbPreSchema;
        }
        Promise.all(promises).then(res => {
          this.externalEntityData.zoneName = zoneNameDisplay;
          // if (this.allTables.indexOf(zoneName) < 0) {
          //   this.$Message.error('非法数据库表名');
          //   this.importModalLoading = false;
          //   return;
          // }
          if (zoneName === undefined || zoneName === '') return;
          let ps = [];
          this.selectedAttributes = [];
          if (this.externalEntityData.dataSourceOid === this.defaultDataSource) {
            ps.push(EntityModeling.getColumnsDetailsOfDbTable(zoneName).then(res => {
              this.externalEntityColsData = res.data;
              if (importAttrKey in this.externalEntityData.packagePath) {
                this.selectedAttributes = this.externalEntityData.packagePath[importAttrKey];
              } else {
                this.selectedAttributes = [];
              }
              this.externalEntityColsDataFiltered = this.externalEntityColsData.filter(item => {
                return this.selectedAttributes.indexOf(item.attributeName) != -1;
              })
              if('primaryKey' in this.externalEntityData) {
                this.externalEntityKeyCols = [...this.externalEntityColsData];
              } else {
                this.externalEntityKeyCols = [...res.data].filter(i => {
                  return i.isPrimaryKey == true;
                })
                if(!this.externalEntityKeyCols || this.externalEntityKeyCols.length == 0) {
                  this.externalEntityKeyCols = [...res.data].filter(i => {
                    return (i.valueType == 'String' || i.valueType == 'Integer'|| i.valueType == 'UUID' || i.valueType == 'GUID');
                  })
                }
              }
              this.externalEntityKeyCols.forEach(val => {
                if(val.isPrimaryKey === true && (this.externalEntityData.primaryKey == '' || this.externalEntityData.primaryKey == undefined)) {
                  this.externalEntityData.primaryKey = val.attributeName;
                }
              })
            }));
          } else {
            ps.push(EntityModeling.getColumnsDetailsOfExtTable(this.externalEntityData.dataSourceOid, zoneName).then(res => {
              this.externalEntityColsData = res.data;
              console.log(res)
              if (importAttrKey in this.externalEntityData.packagePath) {
                this.selectedAttributes = this.externalEntityData.packagePath[importAttrKey];
              } else {
                this.selectedAttributes = [];
              }
              this.externalEntityColsDataFiltered = this.externalEntityColsData.filter(item => {
                return this.selectedAttributes.indexOf(item.attributeName) != -1;
              })
              if('primaryKey' in this.externalEntityData) {
                this.externalEntityKeyCols = [...this.externalEntityColsData];
              } else {
                this.externalEntityKeyCols = [...res.data].filter(i => {
                  return i.isPrimaryKey == true;
                })
                if(!this.externalEntityKeyCols || this.externalEntityKeyCols.length == 0) {
                  this.externalEntityKeyCols = [...res.data].filter(i => {
                    return (i.valueType == 'String' || i.valueType == 'Integer'|| i.valueType == 'UUID' || i.valueType == 'GUID');
                  })
                }
              }
              this.externalEntityKeyCols.forEach(val => {
                if(val.isPrimaryKey === true && (this.externalEntityData.primaryKey == '' || this.externalEntityData.primaryKey == undefined)) {
                  this.externalEntityData.primaryKey = val.attributeName;
                }
              })
            }));
          }
          Promise.all(ps).then(res => {
            this.importModalLoading = false;
          }).catch(error => {
            this.importModalLoading = false;
          });
        }).catch(error => {
          this.importModalLoading = false;
        });
      },
      onChangeDataSource(event) {

        if (event === undefined || event === "") return;
        if (event === this.defaultDataSource) {

          this.dbSchema = [];
          this.dbSchema.push('public');
          this.externalEntityData.schema = 'public';

          ResourceModeling.getAllTables()
            .then(res => {
              this.allTables = res.data;
              this.importModalLoading = false;
            })
            .catch(error => {
              this.allTables = [];
              this.importModalLoading = false;
            });

        } else {

          this.importModalLoading = true;
          ResourceModeling.getDBSchema(event)
          .then(res => {
            this.externalEntityData.schema = '';
            this.dbSchema = res.data;
            this.importModalLoading = false;
          })
          .catch(error => {
            this.dbSchema = [];
            this.externalEntityData.schema = '';
            this.importModalLoading = false;
          })

          // ResourceModeling.getAllExtTables(event)
          // .then(res => {
          //   this.allTables = res.data;
          //   this.importModalLoading = false;
          // })
          // .catch(error => {
          //   this.allTables = [];
          //   this.importModalLoading = false;
          // });

        }

      },
      onChangeSchema(event) {
        console.log(event);
        if (event === undefined || event === "") return;

        if(this.externalEntityData.dataSourceOid != this.defaultDataSource) {

          this.importModalLoading = true;
          ResourceModeling.getDBSchemaTables(this.externalEntityData.dataSourceOid, event)
          .then(res => {
            this.externalEntityData.zoneName = '';
            this.allTables = res.data;
            this.importModalLoading = false;
          })
          .catch(error => {
            this.allTables = [];
            this.importModalLoading = false;
          })

        }

      },
      // onChangeDataSource(event) {
      //   if (event === undefined || event === "") return;
      //   this.importModalLoading = true;
      //   if (event === this.defaultDataSource) {
      //     ResourceModeling.getAllTables()
      //       .then(res => {
      //         this.allTables = res.data;
      //         this.importModalLoading = false;
      //       })
      //       .catch(error => {
      //         this.allTables = [];
      //         this.importModalLoading = false;
      //       });
      //   } else {
      //     ResourceModeling.getAllExtTables(event)
      //       .then(res => {
      //         this.allTables = res.data;
      //         this.importModalLoading = false;
      //       })
      //       .catch(error => {
      //         this.allTables = [];
      //         this.importModalLoading = false;
      //       });
      //   }
      // },
      onChangeTable(event) {
        if (event === undefined || event === "") return;
        this.importModalLoading = true;
        console.log(this.externalEntityData.schema, event);
        if (this.externalEntityData.dataSourceOid !== "" && event !== "") {
          if (this.externalEntityData.dataSourceOid === this.defaultDataSource) {

            let preSchema = `${this.externalEntityData.schema}.${event}`
            EntityModeling.getColumnsDetailsOfDbTable(preSchema).then(res => {
              this.externalEntityColsData = res.data;
              this.externalEntityKeyCols = [...res.data].filter(i => {
                return i.isPrimaryKey == true;
              })
              if(!this.externalEntityKeyCols || this.externalEntityKeyCols.length == 0) {
                this.externalEntityKeyCols = [...res.data].filter(i => {
                  return (i.valueType == 'String' || i.valueType == 'Integer'|| i.valueType == 'UUID' || i.valueType == 'GUID');
                })
              }
              this.externalEntityKeyCols.forEach(val => {
                if(val.isPrimaryKey === true) {
                  this.$set(this.externalEntityData, 'primaryKey', val.attributeName);
                  // this.externalEntityData.primaryKey = val.attributeName;
                }
              })
              this.selectedAttributes = [];
              this.importModalLoading = false;
            }).catch(error => {
              this.importModalLoading = false;
            });
          } else {
            let preSchema = `${this.externalEntityData.schema}.${event}`
            EntityModeling.getColumnsDetailsOfExtTable(this.externalEntityData.dataSourceOid, preSchema).then(res => {
              this.externalEntityColsData = res.data;
              this.externalEntityKeyCols = [...res.data].filter(i => {
                return i.isPrimaryKey == true;
              })
              if(!this.externalEntityKeyCols || this.externalEntityKeyCols.length == 0) {
                this.externalEntityKeyCols = [...res.data].filter(i => {
                  return (i.valueType == 'String' || i.valueType == 'Integer'|| i.valueType == 'UUID' || i.valueType == 'GUID');
                })
              }
              this.externalEntityKeyCols.forEach(val => {
                if(val.isPrimaryKey === true) {
                  this.$set(this.externalEntityData, 'primaryKey', val.attributeName);
                  // this.externalEntityData.primaryKey = val.attributeName;
                }
              })
              this.selectedAttributes = [];
              this.importModalLoading = false;
            }).catch(error => {
              this.importModalLoading = false;
            });
          }
        }
      },
      onClearTable(){
        this.$set(this.externalEntityData, 'primaryKey', '');
      },
      changeAttr(v) {
        this.externalEntityColsDataFiltered = this.externalEntityColsData.filter(item => {
          return this.selectedAttributes.indexOf(item.attributeName) != -1;
        })
      },
      confirmImport() {

        if(this.preDbClick) {
          return false;
        } else {

          let form;
          this.preDbClick = true;
          if(this.importModalState === "importing"){
            form = this.$refs["importExternalEntityForm"];
          }else{
            form = this.$refs["editExternalEntityForm"];
          }
          form.validate(valid => {
            if (valid) {
              let importAttrKey = `${this.externalEntityData.dataSourceOid}__attributes`;
              let isHasKey = this.externalEntityData.primaryKey;
              if(this.selectedAttributes.indexOf(isHasKey) == -1) {
                this.selectedAttributes.push(this.externalEntityData.primaryKey)
              }
              this.externalEntityData.packagePath[importAttrKey] = this.selectedAttributes;
              let entityData = {
                ...this.externalEntityData
              };
              entityData.packagePath = JSON.stringify(
                this.externalEntityData.packagePath
              );
              entityData.classCategory = "ExternalItemClass";
              entityData.classType = "PersistentClass";
              entityData.parentClass = "IdItem";
              if (this.externalEntityData.dataSourceOid === this.defaultDataSource) {
                entityData.dataSourceOid = "";
              } else {
                if(entityData.zoneName.indexOf('.') == -1) {
                  entityData.zoneName = `${entityData.schema}.${entityData.zoneName}`;
                }
              }
              if (this.importModalState === "importing") {
                EntityModeling.createEntities([entityData])
                  .then(res => {
                    this.$Message.success("引入成功");
                    this.currentPage = 1;
                    this.getAllRows();
                    this.importModal = false;
                    this.importEditModal = false;
                    this.$refs["importExternalEntityForm"].resetFields();
                  })
                  .catch(error => {
                    this.$Message.error(error.response.data.message);
                  });
              } else if (this.importModalState === "editing") {
                EntityModeling.updateEntity(entityData)
                  .then(res => {
                    this.$Message.success("更新成功");
                    this.getAllRows();
                    this.importModal = false;
                    this.importEditModal = false;
                    this.$refs["editExternalEntityForm"].resetFields();
                  })
                  .catch(error => {
                    this.$Message.error(error.response.data.message);
                  });
              }
            } else {
              this.$Message.error("请检查输入是否正确");
            }

            setTimeout(() => {
              this.preDbClick = false;
            }, 2000)
          });

        }

      },
      cancelImport() {
        this.importModal = false;
        this.importEditModal = false;
        this.reFitem = false;
        if(this.importModalState === "importing"){
          this.$refs["importExternalEntityForm"].resetFields();
        }else{
          this.$refs["editExternalEntityForm"].resetFields();
        }
        this.externalEntityColsDataFiltered = [];
      },

      onClickImportButton() {
        this.$refs["importExternalEntityForm"].resetFields();
        this.reFitem = true;
        this.externalEntityColsDataFiltered = [];
        this.importModalState = "importing";
        this.importModal = true;
        this.externalEntityData = {
          dataSourceOid: this.defaultDataSource,
          dbSchema: '',
          zoneName : "",
          className : "",
          displayName : "",
          packagePath : {},
        };
        this.externalEntityColsData = [];
        this.externalEntityKeyCols = [];
        this.selectedAttributes = [];
        this.onChangeDataSource(this.defaultDataSource);
      }
    }
  };
</script>
<style>
#editExternalEntityModalSelectedAttributes .ivu-select-input{
  width: 25%!important;
}
</style>
