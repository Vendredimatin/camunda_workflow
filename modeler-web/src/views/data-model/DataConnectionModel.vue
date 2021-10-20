<template>
  <div>
    <div style="float: left; margin: 10px 10px 0">
      <Button type="primary" style="margin: 5px" @click="onClickAddRow" id="createDataLinkButton">
        新增数据连接
      </Button>
      <Button type="error" style="margin: 5px" :disabled="currentData.dataSourceName === undefined" @click="showDelModal" id="deleteDataLinkButton">
        删除数据连接
      </Button>
      <Modal
        v-model="deleteConfirm"
        title="删除数据连接"
        id="deleteDataLinkModal"
      >
        <p>确定要删除这个数据连接吗?</p>
        <br>
        <Checkbox v-model="cascade">级联删除由此数据连接引入的所有外部实体类，及其关联的关联类、属性、表单、授权项(<span style="color: orangered">请谨慎选择</span>)</Checkbox>
        <div slot="footer">
          <Button type="text" size="large" :loading="false" @click="deleteConfirm = false">取消</Button>
          <Button type="primary" size="large" :loading="deleteModalLoading" @click="deleteRowOnOk">确认</Button>
        </div>
      </Modal>
      <Button type="primary" style="margin: 5px" :disabled="currentData.dataSourceName === undefined" @click="onClickEditRow" id="editDataLinkButton">
        编辑数据连接
      </Button>
      <Button type="primary" style="margin: 5px" :disabled="currentData.dataSourceName === undefined" @click="onClickTestOneConnection" id="testSingleDataLinkButton">
        测试单个连接
      </Button>
      <Button type="primary" style="margin: 5px" :disabled="tableDataAll.length === 0" @click="onClickTestAllConnection" id="testAllDataLinkButton">
        测试所有连接
      </Button>
      <Modal
        v-model="editRowModal"
        :title="editRowModalTitle"
        id="dataLinkModal"
        :mask-closable="false"
        style="width: 700px;"
      >
        <Form ref="editRowForm" :model="editRowData" :rules="rowValidate" :label-width="140">
          <FormItem label="数据连接英文名" prop="dataSourceName">
            <Input v-model="editRowData.dataSourceName" placeholder="输入数据连接名" :disabled="editRowStatus==='edit'" id="dataLinkModalDataSourceName" ></Input>
          </FormItem>
          <FormItem label="数据连接显示名" prop="displayName">
            <Input v-model="editRowData.displayName" placeholder="输入数据连接显示名" id="dataLinkModalDisplayName"></Input>
          </FormItem>
          <FormItem label="数据连接类型" prop="dataSourceType">
            <Select v-model="editRowData.dataSourceType" placeholder="选择数据连接类型" filterable :disabled="editRowStatus==='edit'" id="dataLinkModalDataSourceType">
              <Option v-for="item in allDataSourceTypes" :value="item" :key="item" :label="item">
                <span>{{ item }}</span>
              </Option>
            </Select>
          </FormItem>
          <FormItem label="服务器地址" prop="serverIp">
            <Input v-model="editRowData.serverIp" placeholder="输入服务器地址" id="dataLinkModalServerIp"></Input>
          </FormItem>
          <FormItem label="服务器端口" prop="serverPort">
            <InputNumber :min="0" :max="65535" v-model="editRowData.serverPort" placeholder="输入服务器端口" id="dataLinkModalServerPort"></InputNumber>
          </FormItem>
          <FormItem label="登录用户名" prop="userName">
            <Input v-model="editRowData.userName" placeholder="输入登录用户名" id="dataLinkModalUserName"></Input>
          </FormItem>
          <FormItem label="密码" prop="password">
            <Input v-model="editRowData.password" placeholder="输入密码" type="password" id="dataLinkModalPassword"></Input>
          </FormItem>
          <FormItem label="数据库名称" prop="dataBaseName" v-if="!databaseNotRequire">
            <Input v-model="editRowData.dataBaseName" placeholder="输入数据库名称" id="dataLinkModalDataBaseName"></Input>
          </FormItem>
          <FormItem label="服务名称" prop="dataBaseName" v-if="serviceNameRequire">
            <Input v-model="editRowData.dataBaseName" placeholder="输入ORACLE服务名称" id="dataLinkModalDataBaseName"></Input>
          </FormItem>
          <FormItem label="数据库版本" prop="dataBaseVersion" v-if="versionRequire">
            <Select v-model="editRowData.dataBaseVersion" placeholder="输入数据库版本" id="dataLinkModalDataBaseVersion">
              <Option v-for="item in dataVersions[editRowData.dataSourceType]" :value="item" :key="item" :label="item">
                <span>{{ item }}</span>
              </Option>
            </Select>
          </FormItem>
          <FormItem label="描述" prop="description">
            <Input v-model="editRowData.description" placeholder="输入描述" id="dataLinkModalDescription"></Input>
          </FormItem>
        </Form>
        <div slot="footer">
          <Button type="text" size="large" :loading="false" @click="cancelModal">取消</Button>
          <Button type="primary" size="large" :loading="editRowModalLoading" @click="onConfirmEditRow" id="confirmDataLinkButton">确认</Button>
        </div>
      </Modal>
    </div>
    <div style="float: right;margin: 10px 10px 0">
      <Input
        v-model="keyword"
        icon="md-search"
        placeholder="输入关键词查询"
        style="width: 200px; margin: 5px"
        @on-change="searchKeyword"
        id="searchDataLinkInput"
      >
      </Input>
    </div>
    <div style="clear: both; margin: 10px">
      <Table :height="tableHeight"
             style="margin: 5px;"
             ref="viewTable"
             :loading="loading"
             id="dataLinkTable"
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
  </div>
</template>
<script>
import {tableMixin} from "@/component/tableMixin"
import DataSourceMgr from "../../api/data-model/DataSourceMgr";
import {clone} from "@/util/assist";
import {encode64, randomStr} from "../../libs/utils";
import {
  getAllDataSources, 
  createDataSource,
  updateDataSource,
  updateOldDataSource,
  getDataSource,
  deleteDataSource,
  deleteOldDataSource,
  getDataSourceConnectionState
} from "@/api/data-model/DataService";
export default {
  name: "data-connect-mgr",
  mixins: [tableMixin],
  data() {
    const validateServerPort = (rule, value, callback) => {
      if (value === undefined || value === null || value === '') {
        callback(new Error('服务器端口不能为空'));
      } else {
        callback();
      }
    };
    return {
      allStatuses: {},
      tableDataAll: [],
      tableDataAllUnsorted: [],
      loading: true,
      columnsWidth: 136,
      currentPage: 1,
      pageSize: 10,
      pageSizeOpts: [10, 25, 50, 100, 200, 500],
      keyword: "",
      currentData: {},
      editRowData: { serverPort: 1234 },
      editRowModal: false,
      editRowModalLoading: false,
      rowValidate: {
        dataSourceName: [
          { required: true, message: "数据连接英文名不能为空", trigger: "blur" },
          {
            pattern: /^[A-Za-z][A-Za-z0-9]{0,31}$/,
            message: "只能包含字母和数字，并以字母开头，长度不超过32个字符",
            trigger: "blur"
          }
        ],
        displayName: [
          { required: true, message: "数据连接显示名不能为空", trigger: "blur" },
          {
            // pattern: /^[a-zA-Z0-9_\-/.\u0391-\uFFE5]+$/,
            // message: "数据连接名称只能包含汉字、字母、数字、_、-、/或.",
            pattern: /^\S{1,32}$/,
            message: "显示名长度不超过32个字符",
            trigger: "blur"
          }
        ],
        dataSourceType: [
          { required: true, message: "数据连接类型不能为空"}
        ],
        serverIp: [
          { required: true, message: "服务器地址不能为空", trigger: "blur" }
          // {
          //   pattern: /^((?:(?:25[0-5]|2[0-4]\d|((1\d{2})|([1-9]?\d)))\.){3}(?:25[0-5]|2[0-4]\d|((1\d{2})|([1-9]?\d))))$/,
          //   message: "服务器IP应形为xxx.xxx.xxx.xxx，且每段为0~255间的整数",
          //   trigger: "blur"
          // }
        ],
        serverPort: [
          { required: true, validator: validateServerPort, trigger: "blur" }
          // { required: true, message: "服务器端口不能为空", trigger: "blur" },
          // {
          //   pattern: /^([0-9]|[1-9]\d|[1-9]\d{2}|[1-9]\d{3}|[1-5]\d{4}|6[0-4]\d{3}|65[0-4]\d{2}|655[0-2]\d|6553[0-5])$/,
          //   message: "服务器端口应为0-65535之间的整数",
          //   trigger: "blur"
          // }
        ],
        userName: [
          { required: true, message: "登录用户名不能为空", trigger: "blur" },
          {
            pattern: /^[A-Za-z][a-zA-Z0-9_\-\#]+$/,
            message: "登录用户名只能包含字母、数字_、-或#，并以字母开头",
            trigger: "blur"
          }
        ],
        // password: [
        //   { required: true, message: "密码不能为空"}
        // ],
        dataBaseName: [
          { required: true, message: "数据库名称不能为空", trigger: "blur" },
          {
            pattern: /^[a-zA-Z0-9_\-/.\#\u0391-\uFFE5]+$/,
            message: "数据库名称只能包含汉字、字母、数字、_、-、/、.或#",
            trigger: "blur"
          }
        ],
        dataBaseVersion: [
          {required: true, message: "数据库版本不能为空", trigger: "blur" },
        ],
        paramOne: [
          {
            pattern: /^\d+$/,
            message: "参数One应为非负整数",
            trigger: "blur"
          }
        ]
      },
      allDataSourceTypes: [
        // "HDFS_FS",
        // "LOCAL_FS",
        // "HDFS",
        // "LOCAL_FILE",
        // "HDFS_FOLDER_FILE",
        // "LOCAL_FOLDER_FILE",
        // "HDFS_CSV_DIR",
        "MYSQL",
        "POSTGRESQL",
        "SQLSERVER",
        // "DB2",
        "ORACLE",
        // "HIVE",
        // "HBASE",
        // "KAFKA",
        // "REDIS",
        // "PARATSDB",
        "IOTDB"
      ],
      allDataFileFormats: ["", "CSV文件"],
      editRowStatus: "add",
      dataVersions: {
        SQLSERVER: ['2012'],
        IOTDB: ['0.9', '0.11']
      },
      tableColumns: [
        {
          type: "index",
          title: "序号",
          width: 80,
          align: "center"
        },
        {
          title: "数据连接名称",
          key: "dataSourceName",
          sortable: "custom",
          render: (h, params) => {
            return h('Tooltip', {
            props: { placement: 'bottom', maxWidth: 362, transfer: true }
            }, [
                params.row.dataSourceName.length > 16 ? params.row.dataSourceName.slice(0, 16) + "..." : params.row.dataSourceName,
                h('span', { slot: 'content', style: { whiteSpace: 'normal', wordBreak: 'break-all' } },
                params.row.dataSourceName)
            ])
          }
        },
        {
          title: "中文名称",
          key: "displayName",
          sortable: "custom",
          render: (h, params) => {
            return h('Tooltip', {
            props: { placement: 'bottom', maxWidth: 362, transfer: true }
            }, [
                params.row.displayName.length > 16 ? params.row.displayName.slice(0, 16) + "..." : params.row.displayName,
                h('span', { slot: 'content', style: { whiteSpace: 'normal', wordBreak: 'break-all' } },
                params.row.displayName)
            ])
          }
        },
        {
          title: "数据连接类型",
          key: "dataSourceType",
          sortable: "custom",
          tooltip: true
        },
        {
          title: "服务器地址",
          key: "serverIp",
          sortable: "custom",
          render: (h, params) => {
            return h('Tooltip', {
            props: { placement: 'bottom', maxWidth: 362, transfer: true }
            }, [
                params.row.serverIp.length > 16 ? params.row.serverIp.slice(0, 16) + "..." : params.row.serverIp,
                h('span', { slot: 'content', style: { whiteSpace: 'normal', wordBreak: 'break-all' } },
                params.row.serverIp)
            ])
          }
        },
        {
          title: "服务器端口",
          key: "serverPort",
          sortable: "custom",
          tooltip: true
        },
        {
          title: "数据库名称",
          key: "dataBaseName",
          sortable: "custom",
          render: (h, params) => {
            return h('Tooltip', {
            props: { placement: 'bottom', maxWidth: 362, transfer: true }
            }, [
                params.row.dataBaseName.length > 16 ? params.row.dataBaseName.slice(0, 16) + "..." : params.row.dataBaseName,
                h('span', { slot: 'content', style: { whiteSpace: 'normal', wordBreak: 'break-all' } },
                params.row.dataBaseName)
            ])
          }
        },
        {
          title: "描述",
          key: "description",
          sortable: "custom",
          render: (h, params) => {
            return h('Tooltip', {
            props: { placement: 'bottom', maxWidth: 362, transfer: true }
            }, [
                params.row.description ? params.row.description.length > 16 ? params.row.description.slice(0, 16) + "..." : params.row.description : "",
                h('span', { slot: 'content', style: { whiteSpace: 'normal', wordBreak: 'break-all' } },
                params.row.description)
            ])
          }
        },
        {
          title: '连接状态',
          key: 'status',
          render: (h, params) => {
            const row = params.row;
            const status = row.status === 0 ? 'default' : row.status === 1 ? 'processing' : row.status === 2 ? 'success' : 'error';
            const text = row.status === 0 ? '未测试' : row.status === 1 ? '连接中' : row.status === 2 ? '成功' : '失败';

            return h('Badge', {
              props: {
                text: text,
                status: status
              }
            });
          }
        }
      ],
      sortParams: undefined,
      deleteModalLoading: false,
      deleteConfirm: false,
      cascade: false
    };
  },
  computed: {
    editRowModalTitle() {
      return this.editRowStatus === "add" ? "新增数据连接" : "编辑数据连接";
    },
    versionRequire() {
      return this.editRowData && (this.editRowData.dataSourceType=='SQLSERVER' || this.editRowData.dataSourceType== 'IOTDB')
    },
    serviceNameRequire(){
      return this.editRowData && (this.editRowData.dataSourceType=='ORACLE')
    },
    databaseNotRequire(){
      return this.editRowData && (this.editRowData.dataSourceType=='ORACLE' || this.editRowData.dataSourceType=='IOTDB')
    },
    filteredTableData() {
      let keywordLower = this.keyword.toLowerCase().trimStart().trimEnd();
      let res = [];
      this.tableDataAll.forEach((data) => {
        for (let key in data) {
          if(key != 'oid' && key != 'creator' && key != 'password')
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
      })
      return res;
    },
    tableDataPage() {
      return this.filteredTableData.slice(
        this.currentPage * this.pageSize - this.pageSize,
        this.currentPage * this.pageSize
      );
    }
  },
  created() {
    this.resetColumnsWidth();
    this.getAllRows();
  },
  methods: {
    activate() {
      this.resetColumnsWidth();
    },
    globalRefresh() {
      this.currentPage = 1;
      this.getAllRows();
    },
    resetColumnsWidth() {

      let sideWidth = document.getElementById('mainMenuSide') ? document.getElementById('mainMenuSide').style.width : 0;
      let finalWidth = parseInt(sideWidth) + 500;
      this.columnsWidth = (document.body.clientWidth - finalWidth) / 7;
      console.log(this.columnsWidth)

      this.tableColumns = [
        {
          type: "index",
          title: "序号",
          width: 80,
          align: "center"
        },
        {
          title: "数据连接名称",
          key: "dataSourceName",
          minWidth: this.columnsWidth,
          sortable: "custom",
          render: (h, params) => {
            return h('Tooltip', {
            props: { placement: 'bottom', maxWidth: 362, transfer: true }
            }, [
                params.row.dataSourceName.length > 16 ? params.row.dataSourceName.slice(0, 16) + "..." : params.row.dataSourceName,
                h('span', { slot: 'content', style: { whiteSpace: 'normal', wordBreak: 'break-all' } },
                params.row.dataSourceName)
            ])
          }
        },
        {
          title: "中文名称",
          key: "displayName",
          minWidth: this.columnsWidth,
          sortable: "custom",
          render: (h, params) => {
            return h('Tooltip', {
            props: { placement: 'bottom', maxWidth: 362, transfer: true }
            }, [
                params.row.displayName.length > 16 ? params.row.displayName.slice(0, 16) + "..." : params.row.displayName,
                h('span', { slot: 'content', style: { whiteSpace: 'normal', wordBreak: 'break-all' } },
                params.row.displayName)
            ])
          }
        },
        {
          title: "数据连接类型",
          key: "dataSourceType",
          minWidth: this.columnsWidth,
          sortable: "custom",
          tooltip: true
        },
        {
          title: "服务器地址",
          key: "serverIp",
          minWidth: this.columnsWidth,
          sortable: "custom",
          render: (h, params) => {
            return h('Tooltip', {
            props: { placement: 'bottom', maxWidth: 362, transfer: true }
            }, [
                params.row.serverIp.length > 16 ? params.row.serverIp.slice(0, 16) + "..." : params.row.serverIp,
                h('span', { slot: 'content', style: { whiteSpace: 'normal', wordBreak: 'break-all' } },
                params.row.serverIp)
            ])
          }
        },
        {
          title: "服务器端口",
          key: "serverPort",
          minWidth: this.columnsWidth,
          sortable: "custom",
          tooltip: true
        },
        {
          title: "数据库名称",
          key: "dataBaseName",
          minWidth: this.columnsWidth,
          sortable: "custom",
          render: (h, params) => {
            return h('Tooltip', {
            props: { placement: 'bottom', maxWidth: 362, transfer: true }
            }, [
                params.row.dataBaseName.length > 16 ? params.row.dataBaseName.slice(0, 16) + "..." : params.row.dataBaseName,
                h('span', { slot: 'content', style: { whiteSpace: 'normal', wordBreak: 'break-all' } },
                params.row.dataBaseName)
            ])
          }
        },
        {
          title: "描述",
          key: "description",
          minWidth: this.columnsWidth,
          sortable: "custom",
          render: (h, params) => {
            return h('Tooltip', {
            props: { placement: 'bottom', maxWidth: 362, transfer: true }
            }, [
                 params.row.description ? params.row.description.length > 16 ? params.row.description.slice(0, 16) + "..." : params.row.description : "",
                h('span', { slot: 'content', style: { whiteSpace: 'normal', wordBreak: 'break-all' } },
                params.row.description)
            ])
          }
        },
        {
          title: '连接状态',
          key: 'status',
          minWidth: this.columnsWidth,
          render: (h, params) => {
            const row = params.row;
            const status = row.status === 0 ? 'default' : row.status === 1 ? 'processing' : row.status === 2 ? 'success' : 'error';
            const text = row.status === 0 ? '未测试' : row.status === 1 ? '连接中' : row.status === 2 ? '成功' : '失败';

            return h('Badge', {
              props: {
                text: text,
                status: status
              }
            });
          }
        }
      ]

    },
    showDelModal() {

      this.cascade = false;
      this.deleteConfirm = true;
    },
    onClickTestOneConnection() {
      let oid = this.currentData.oid;
      let index = this.tableDataAll.findIndex(x => x.oid === oid);
      if (index < 0) return;
      this.tableDataAll[index].status = 1;
      this.tableDataAll[index].statusTxt = '连接中';
      this.allStatuses[oid] = 1;
      // 0: default, 1: processing, 2: success, 3: error
      getDataSourceConnectionState(oid)
        .then(res => {
          this.tableDataAll[index].status = 2;
          this.tableDataAll[index].statusTxt = '成功';
          this.allStatuses[oid] = 2;
        })
        .catch(error => {
          this.tableDataAll[index].status = 3;
          this.tableDataAll[index].statusTxt = '失败';
          this.allStatuses[oid] = 3;
        });
    },
    onClickTestAllConnection() {
      let l = this.tableDataAll.length;
      for (let i = 0; i < l; ++i) {
        this.tableDataAll[i].status = 1;
        this.tableDataAll[i].statusTxt = '连接中';
        this.allStatuses[this.tableDataAll[i].oid] = 1;
      }
      for (let i = 0; i < l; ++i) {
        // 0: default, 1: processing, 2: success, 3: error
        getDataSourceConnectionState(this.tableDataAll[i].oid)
          .then(res => {
            this.tableDataAll[i].status = 2;
            this.tableDataAll[i].statusTxt = '成功';
            this.allStatuses[this.tableDataAll[i].oid] = 2;
          })
          .catch(error => {
            this.tableDataAll[i].status = 3;
            this.tableDataAll[i].statusTxt = '失败';
            this.allStatuses[this.tableDataAll[i].oid] = 3;
          });
      }
    },
    onClickAddRow() {
      this.editRowStatus = "add";
      this.currentData = {};
      this.editRowData = { serverPort: 1234 };
      this.$refs["viewTable"].clearCurrentRow();
      this.$refs.editRowForm.resetFields();
      this.editRowModal = true;
    },
    onClickEditRow() {
      this.editRowStatus = "edit";
      this.$refs.editRowForm.resetFields();
      // var row = this.currentData;
      console.log("edit row list",this.currentData);
      if((this.currentData.displayName === undefined || this.currentData.displayName === '') 
          && this.currentData.dataSourceName != undefined && this.currentData.dataSourceName != ''){
        this.currentData.displayName = this.currentData.dataSourceName;
        this.currentData.dataSourceName = "undefined";
      }
      this.editRowData = {...this.currentData};
      this.editRowModal = true;
    },
    getAllRows() {
      this.currentData = {};
      this.loading = true;
      getAllDataSources().then(res => {
        this.loading = false;
        this.tableDataAll = res.data.filter(row => {
            return row.dataSourceName != "异构数据源";
              }).map(row => {
          return {
            ...row,
            status: 0,
            statusTxt: '未测试'
          };
        });
        this.allStatuses = {};  // clear connection status list
        this.tableDataAllUnsorted = clone(this.tableDataAll);
        this.handleSortChange(this.sortParams);
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
    searchKeyword() {
      this.currentData = {};
      this.changePage(1);
      this.handleSortChange(this.sortParams);
    },
    selectRow(rowData) {
      this.$refs['editRowForm'].resetFields();
      this.currentData = rowData;
      this.editRowData = {...this.currentData};
    },
    onConfirmEditRow() {
      if (this.editRowStatus === "add") {
        this.addRow();
      } else {
        this.editRow();
      }
    },
    cancelModal() {

      this.currentData = {};
      this.$refs.editRowForm.resetFields();
      this.editRowModal = false;

    },
    addRow() {
      this.$refs["editRowForm"].validate(valid => {
        if (valid) {
          this.editRowModalLoading = true;
          if(this.editRowData.password){
            this.editRowData.password = `${randomStr(3)}${encode64(this.editRowData.password)}${randomStr(5)}`
          }else{
            delete this.editRowData.password
          }
          console.log("======" + JSON.stringify(this.editRowData));
          createDataSource(this.editRowData)
            .then(res => {
              this.getAllRows();
              this.editRowModalLoading = false;
              this.editRowModal = false;
              this.$Message.success("新增数据连接成功");
            })
            .catch(error => {
              this.getAllRows();
              this.editRowModalLoading = false;
              this.editRowModal = false;
            });
        } else {
          this.editRowModalLoading = false;
          this.$Message.error("请检查输入是否正确");
        }
      });
    },
    deleteRowOnOk() {
      this.deleteModalLoading = true;
      deleteDataSource(this.currentData.oid, this.cascade)
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
          this.$Message.success("删除数据连接成功");
        })
        .catch(error => {
          deleteOldDataSource(this.currentData.oid, this.cascade)
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
            this.$Message.success("删除数据连接成功");
          })
          this.deleteModalLoading = false;
          this.deleteConfirm = false;
        });
    },
    editRow() {
      this.$refs["editRowForm"].validate(valid => {
        if (valid) {
          this.editRowModalLoading = true;
          if(this.editRowData.password){
            this.editRowData.password = `${randomStr(3)}${encode64(this.editRowData.password)}${randomStr(5)}`
          }else{
            delete this.editRowData.password
          }
          getDataSource(this.editRowData.oid)
            .then(res => {
              updateDataSource(this.editRowData)
                .then(res => {
                  this.getAllRows();
                  this.editRowModalLoading = false;
                  this.editRowModal = false;
                  this.$refs["editRowForm"].resetFields();
                  this.$Message.success("更新数据连接成功");
                })
                .catch(error => {
                  updateOldDataSource(this.editRowData)
                    .then(res => {
                    this.getAllRows();
                    this.editRowModalLoading = false;
                    this.editRowModal = false;
                    this.$refs["editRowForm"].resetFields();
                    this.$Message.success("更新数据连接成功");
                  })
                  console.log("3333333333333333333333333333333333")
                  this.editRowModalLoading = false;
                });
            })
            .catch(error => {
              this.editRowModalLoading = false;
            });
        } else {
          this.editRowModalLoading = false;
          this.$Message.error("请检查输入是否正确");
        }
      });
    },
    handleDoubleClick(rowData, index) {
      this.selectRow(rowData);
      this.onClickEditRow();
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
  }
};
</script>
<style>
  #dataLinkModal{

  }
</style>
