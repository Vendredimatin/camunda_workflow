<template>
  <div>
    <div style="float: left; margin: 10px">
      <Button type="primary" style="margin: 5px" @click="onClickAddRow">
        新增数据源
      </Button>
      <Modal
        v-model="editRowModal"
        width="600"
        :title="editRowModalTitle"
        @on-cancel="cancelModal"
        :mask-closable="false"
      >
        <Form ref="editRowForm" :model="editRowData" :rules="rowValidate" :label-width="120">
          <FormItem label="数据源名称" prop="dataSourceName">
            <Input v-model="editRowData.dataSourceName" placeholder="输入数据源名"></Input>
          </FormItem>
          <FormItem label="数据源类型" prop="dataSourceType">
            <Select class="datasetSelect" v-model="editRowData.dataSourceType" placeholder="选择数据源类型" filterable>
              <Option v-for="item in allDataSourceTypes" :value="item" :key="item" :label="item">
                <span>{{ item }}</span>
              </Option>
            </Select>
          </FormItem>
          <FormItem label="服务器地址" prop="serverIp">
            <Input v-model="editRowData.serverIp" placeholder="输入服务器地址"></Input>
          </FormItem>
          <FormItem label="服务器端口" prop="serverPort">
            <InputNumber :min="0" :max="65535" v-model="editRowData.serverPort" placeholder="输入服务器端口"></InputNumber>
          </FormItem>
          <FormItem label="登录用户名" prop="userName">
            <Input v-model="editRowData.userName" placeholder="输入登录用户名"></Input>
          </FormItem>
          <FormItem label="密码" prop="password">
            <Input v-model="editRowData.password" placeholder="输入密码" type="password"></Input>
          </FormItem>
          <FormItem label="数据库名称" prop="dataBaseName">
            <Input v-model="editRowData.dataBaseName" placeholder="输入数据库名称"></Input>
          </FormItem>
          <FormItem label="描述" prop="description">
            <Input v-model="editRowData.description" placeholder="输入描述"></Input>
          </FormItem>
<!--          <FormItem label="扫描层数" prop="folderDepth">-->
<!--            <Input v-model="editRowData.plt_folderdepth" placeholder="输入扫描层数"></Input>-->
<!--          </FormItem>-->
        </Form>
        <div slot="footer">
          <Button type="text" size="large" :loading="false" @click="cancelModal">取消</Button>
          <Button type="primary" size="large" :loading="editRowModalLoading" @click="onConfirmEditRow">确认</Button>
        </div>
      </Modal>
      <Button type="primary" style="margin: 5px" @click="onClickTestConnection">
        测试连接
      </Button>
    </div>
    <div style="float: right; margin: 10px">
      <Input
        v-model="keyword"
        icon="md-search"
        placeholder="输入关键词查询"
        style="width: 200px; margin: 5px"
        @on-change="searchKeyword"
      >
      </Input>
    </div>
    <div style="clear: both; margin: 15px">
      <Spin v-if="loading" fix></Spin>
      <div v-for="(row, index) in gridDataPage" :key="'datasourceRow_' + index">
        <Row :gutter="16">
          <Col :span="8" v-for="(item, innerIndex) in row" :key="'datasource_' + innerIndex">
            <Card class="self-card" @click.native="selectRow(item, index * 3 + innerIndex)">
              <Dropdown style="margin-left: 20px" slot="extra" placement="bottom-end" trigger="hover">
                <Button type="text" icon="ios-more"></Button>
                <DropdownMenu class="self-userDrop" slot="list">
                  <DropdownItem @click.native="onClickTestConnectionButton(item)">测试连接</DropdownItem>
                  <DropdownItem @click.native="onClickEditButton(item)">编辑</DropdownItem>
                  <DropdownItem @click.native="onClickDeleteButton(item)">删除</DropdownItem>
                </DropdownMenu>
              </Dropdown>
              <div style="height: 120px; display: flex; justify-content: space-around; align-items: center;">
                <i :class="mapIcon(item.dataSourceType)" style="color: rgb(81, 90, 110); font-size: 5em !important;"></i>
                <div style="width: 60%; height: 80%; display: flex; flex-direction: column; justify-content: space-between;">
                  <p style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" :title="item.dataSourceName">数据源名称：{{item.dataSourceName}}</p>
                  <p style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" :title="item.dataSourceType">数据源类型：{{item.dataSourceType}}</p>
                  <p style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" :title="item.serverIp">服务器地址：{{item.serverIp}}</p>
                  <p style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" :title="item.status">
                    连接状态：
                    <Badge class="self-badge" :status="item.status === 0 ? 'default' : item.status === 1 ? 'processing' : item.status === 2 ? 'success' : 'error'"
                           :text="item.status === 0 ? '未测试' : item.status === 1 ? '连接中' : item.status === 2 ? '成功' : '失败'"
                    />
                  </p>
                </div>
              </div>
            </Card>
          </Col>
        </Row>
        <br>
      </div>
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
import DataSourceMgr from "../../api/data-model/DataSourceMgr";
import {encode64, randomStr} from "../../../../modeler-web/src/libs/utils";

export default {
  name: "OprDataSourceMgr",
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
      loading: true,
      currentPage: 1,
      pageSize: 12,
      pageSizeOpts: [12, 60, 120, 480],
      keyword: "",
      currentData: {},
      editRowData: { serverPort: 5432 },
      editRowModal: false,
      editRowModalLoading: false,
      rowValidate: {
        dataSourceName: [
          { required: true, message: "数据源名不能为空", trigger: "blur" },
          {
            pattern: /^\S{1,32}$/,
            message: "数据源名称长度不超过32个字符",
            trigger: "blur"
          }
        ],
        dataSourceType: [
          { required: true, message: "数据源类型不能为空", trigger: "blur" }
        ],
        serverIp: [
          { required: true, message: "服务器地址不能为空", trigger: "blur" }
        ],
        serverPort: [
          { required: true, validator: validateServerPort, trigger: "blur" },
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
            pattern: /^\w+$/,
            message: "登录用户名只能包含字母、数字或下划线",
            trigger: "blur"
          }
        ],
        dataBaseName: [
          { required: true, message: "数据库名称不能为空", trigger: "blur" },
          {
            pattern: /^[a-zA-Z0-9_\-/.\u0391-\uFFE5]+$/,
            message: "数据库名称只能包含汉字、字母、数字、_、-、/或.",
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
        // "MYSQL",
        "POSTGRESQL",
        // "SQLSERVER",
        // "DB2",
        // "ORACLE",
        // "HIVE",
        // "HBASE",
        // "KAFKA",
        // "REDIS",
        // "PARATSDB",
        "IOTDB"
      ],
      editRowStatus: "add",

      iconDict: {
        POSTGRESQL: "icon iconfont icon-postgresql",
        MYSQL: "icon iconfont icon-mysql",
        SQLSERVER: "icon iconfont icon-sql-server",
        HDFS: "icon iconfont icon-hadoop",
        LOCAL_FILE: "ivu-icon ivu-icon-ios-folder-outline",
        HDFS_CSV_DIR: "icon iconfont icon-hadoop",
        DB2: "ivu-icon ivu-icon-ios-folder-outline",
        ORACLE: "ivu-icon ivu-icon-ios-folder-outline",
        HIVE: "ivu-icon ivu-icon-ios-folder-outline",
        HBASE: "ivu-icon ivu-icon-ios-folder-outline",
        KAFKA: "ivu-icon ivu-icon-ios-folder-outline",
        REDIS: "ivu-icon ivu-icon-ios-folder-outline",
        PARATSDB: "ivu-icon ivu-icon-ios-folder-outline",
        IOTDB: "icon iconfont icon-lotdb"
      }
    };
  },
  computed: {
    filteredTableData() {
      let keywordLower = this.keyword.toLowerCase();
      let res = [];
      for (let id in this.tableDataAll) {
        let data = this.tableDataAll[id];
        for (let key in data) {
          if(key == 'dataSourceName' || key == 'dataSourceType' || key == 'serverIp' || key == 'transStatus') {

            if (data[key].toString().toLowerCase().match(keywordLower) !== null) {
              res.push(data);
              break;
            }

          }
        }
      }
      return res;
    },
    gridDataPage() {
      let pageData = this.filteredTableData.slice(
        this.currentPage * this.pageSize - this.pageSize,
        this.currentPage * this.pageSize
      );
      let length = pageData.length;
      let res = [];
      for (let i = 0; i < length; i += 3) {
        if (i + 2 < length) res.push([pageData[i], pageData[i + 1], pageData[i + 2]]);
        else if (i + 1 < length) res.push([pageData[i], pageData[i + 1]]);
        else res.push([pageData[i]]);
      }
      return res;
    },
    editRowModalTitle() {
      return this.editRowStatus === "add" ? "新增数据源" : "编辑数据源";
    }
  },
  created() {
    this.getAllRows();
  },
  methods: {
    canShow() {
      return true;
    },
    setArgs(args) {
      for (var i in args) {
        this.args[i] = args[i];
      }
      return this;
    },
    async onHandle(params) {
      var newObj = { ...params };
      try {
        await this.saveEObj(newObj);
      } catch (e) {
        console.log(e);
      }
    },
    mapIcon(type) {
      let targetSkin = sessionStorage.getItem('skinStyle');
      let darkFont = '';
      if(targetSkin == 'dark') {
        darkFont = ' self-color';
      }
      if (type in this.iconDict) return `${this.iconDict[type]}${darkFont}`;
      else return `ivu-icon ivu-icon-ios-power${darkFont}`;
    },
    onClickTestConnection() {
      let l = this.tableDataAll.length;
      for (let i = 0; i < l; ++i) {
        this.tableDataAll[i].status = 1;
        this.tableDataAll[i].transStatus = '连接中';
        this.allStatuses[this.tableDataAll[i].oid] = 1;
      }
      for (let i = 0; i < l; ++i) {
        // 0: default, 1: processing, 2: success, 3: error
        DataSourceMgr.getDataSourceConnectionState(this.tableDataAll[i].oid)
          .then(res => {
            this.tableDataAll[i].status = 2;
            this.tableDataAll[i].transStatus = '成功';
            this.allStatuses[this.tableDataAll[i].oid] = 2;
          })
          .catch(error => {
            this.tableDataAll[i].status = 3;
            this.tableDataAll[i].transStatus = '失败';
            this.allStatuses[this.tableDataAll[i].oid] = 3;
          });
      }
    },
    onClickAddRow() {
      this.editRowStatus = "add";
      this.currentData = {};
      this.editRowData = { serverPort: 5432 };
      this.editRowModal = true;
    },
    onClickTestConnectionButton(item) {
      this.selectRow(item);
      let oid = this.currentData.oid;
      let index = this.tableDataAll.findIndex(x => x.oid === oid);
      if (index < 0) return;
      this.tableDataAll[index].status = 1;
      this.tableDataAll[index].transStatus = '连接中';
      this.allStatuses[oid] = 1;
      // 0: default, 1: processing, 2: success, 3: error
      DataSourceMgr.getDataSourceConnectionState(oid)
        .then(res => {
          this.tableDataAll[index].status = 2;
          this.tableDataAll[index].transStatus = '成功';
          this.allStatuses[oid] = 2;
        })
        .catch(error => {
          this.tableDataAll[index].status = 3;
          this.tableDataAll[index].transStatus = '失败';
          this.allStatuses[oid] = 3;
        });
    },
    onClickEditButton(item) {
      console.log(item)
      this.selectRow(item);
      this.editRowStatus = "edit";
      this.editRowModal = true;
    },
    getAllRows() {
      this.currentData = {};
      this.loading = true;
      DataSourceMgr.getAllDataSources().then(res => {
        this.loading = false;
        this.tableDataAll = res.data.map(row => {
          return {
            ...row,
            status: 0,
            transStatus: '未测试'
          };
        });
        this.allStatuses = {};  // clear connection status list
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

      this.$refs.editRowForm.resetFields();
      this.editRowModal = false;

    },
    addRow() {
      this.$refs["editRowForm"].validate(valid => {
        if (valid) {
          this.editRowModalLoading = true;
          let newObj = {
            dataBaseName: this.editRowData.dataBaseName,
            dataSourceName: this.editRowData.dataSourceName,
            dataSourceType: this.editRowData.dataSourceType,
            description: this.editRowData.description,
            password: this.editRowData.password,
            serverIp: this.editRowData.serverIp,
            serverPort: this.editRowData.serverPort,
            userName: this.editRowData.userName
          }
          if(newObj.password){
            newObj.password = `${randomStr(3)}${encode64(newObj.password)}${randomStr(5)}`
          }else{
            delete newObj.password
          }
          DataSourceMgr.createDataSources(newObj)
            .then(res => {
              this.getAllRows();
              this.editRowModalLoading = false;
              this.editRowModal = false;
              this.$Message.success("新增数据源成功");
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
    onClickDeleteButton(item) {
      this.selectRow(item);
      this.deleteRow();
    },
    deleteRow() {
      this.$Modal.confirm({
        title: "删除数据源",
        content: "<p>是否确认删除当前选中数据源？</p>",
        loading: true,
        onOk: () => {
          this.$Modal.loading = true;
          DataSourceMgr.deleteDataSources(this.currentData.oid)
            .then(res => {
              this.getAllRows();
              if (
                this.tableDataAll.length - 1 ===
                  this.pageSize * (this.currentPage - 1) &&
                this.tableDataAll.length !== 1
              )
                this.changePage(this.currentPage - 1);
              this.$Modal.loading = false;
              this.$Modal.remove();
              this.$Message.success("删除数据源成功");
            })
            .catch(error => {
              this.$Modal.loading = false;
              this.$Modal.remove();
            });
        }
      });
    },
    editRow() {
      this.$refs["editRowForm"].validate(valid => {
        if (valid) {
          this.editRowModalLoading = true;
          DataSourceMgr.getDataSource(this.editRowData.oid)
            .then(res => {
              let editObj = {
                oid: this.editRowData.oid,
                dataBaseName: this.editRowData.dataBaseName,
                dataSourceName: this.editRowData.dataSourceName,
                dataSourceType: this.editRowData.dataSourceType,
                description: this.editRowData.description,
                password: this.editRowData.password,
                serverIp: this.editRowData.serverIp,
                serverPort: this.editRowData.serverPort,
                userName: this.editRowData.userName
              }
              if(editObj.password){
                editObj.password = `${randomStr(3)}${encode64(editObj.password)}${randomStr(5)}`
              }else{
                delete editObj.password
              }
              DataSourceMgr.updateDataSources(editObj)
                .then(res => {
                  this.getAllRows();
                  this.editRowModalLoading = false;
                  this.editRowModal = false;
                  this.$Message.success("更新数据源成功");
                })
                .catch(error => {
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
    }
  }
};
</script>
<style>
  .ivu-badge-status-text {
    font-size: 14px;
  }
  .datasetSelect .ivu-select-item-focus {
    background: initial;
  }
</style>
