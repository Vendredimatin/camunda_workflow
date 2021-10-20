  <template>
  <div>
    <div style="float: left; margin: 10px">
      <Button type="primary" style="margin: 5px" @click="onClickAddRow">
        新增数据集
      </Button>
<!--      <Button type="error" style="margin: 5px" :disabled="currentData.plt_oid === undefined" @click="deleteRow">-->
<!--        删除数据集-->
<!--      </Button>-->
<!--      <Button type="primary" style="margin: 5px" :disabled="currentData.plt_oid === undefined" @click="onClickEditRow">-->
<!--        编辑数据集-->
<!--      </Button>-->
      <Modal
        v-model="editRowModal"
        :title="editRowModalTitle"
        :mask-closable="false"
      >
        <Form ref="editRowForm" :model="editRowData" :rules="rowValidate" :label-width="140">
          <FormItem label="数据集名称" prop="plt_datasetname">
            <Input v-model="editRowData.plt_datasetname" placeholder="输入数据集名称" @on-blur="checkName" @on-focus="nameExist = false"></Input>
            <!-- <span v-show="nameExist" style="font-size: 12px;color: red;">* 该名称已存在!</span> -->
          </FormItem>
          <FormItem label="所属数据源" prop="plt_datasourceid">
            <Select class="datasetSelect" v-model="editRowData.plt_datasourceid" placeholder="选择所属数据源" filterable>
              <Option v-for="item in allDataSources" :value="item.oid" :key="item.oid" :label="item.dataSourceName" @on-open-change="refreshDataSources">
                <span>{{ item.dataSourceName }}</span>
              </Option>
            </Select>
          </FormItem>
          <FormItem label="目标实体类" prop="plt_targetentityclass">
            <Select class="datasetSelect" v-model="editRowData.plt_targetentityclass" placeholder="选择目标实体类" filterable>
              <Option v-for="item in allEntityClasses" :value="item.className" :key="item.className" :label="item.className">
                <span>{{ `${item.className} : ${item.displayName}` }}</span>
              </Option>
            </Select>
          </FormItem>
          <FormItem label="查询语句" prop="plt_filterstring">
            <Input v-model="editRowData.plt_filterstring" placeholder="输入查询语句"></Input>
          </FormItem>
          <FormItem label="描述" prop="plt_description">
            <Input v-model="editRowData.plt_description" placeholder="输入描述"></Input>
          </FormItem>
        </Form>
        <div slot="footer">
          <Button type="text" size="large" :loading="false" @click="editRowModal = false">取消</Button>
          <Button type="primary" size="large" :loading="editRowModalLoading" @click="onConfirmEditRow">确认</Button>
        </div>
      </Modal>
<!--      <Button type="primary" style="margin: 5px" :disabled="currentData.plt_oid === undefined" @click="onClickViewDataset">-->
<!--        查看数据集对象-->
<!--      </Button>-->
      <Modal
        width="1200"
        v-model="viewDatasetModal"
        title="查看数据集对象"
        :mask-closable="false"
      >
        <!-- <div style="margin: 10px">
          <Form ref="queryForm" :model="queryForm" :label-width="80" inline>
            <FormItem label="起始位置" prop="startIndex" style="width: 20%;">
              <InputNumber v-model="queryForm.startIndex" placeholder="输入起始位置" :min="0"></InputNumber>
            </FormItem>
            <FormItem label="总数" prop="pageSize" style="width: 20%;">
              <InputNumber v-model="queryForm.pageSize" placeholder="输入总数" :min="0"></InputNumber>
            </FormItem>
            <FormItem label="采样方式" prop="sampleMethod" style="width: 20%;">
              <Select v-model="queryForm.sampleMethod" placeholder="选择采样方式" filterable>
                <Option v-for="item in allSampleMethods" :value="item.name" :key="item.name" :label="item.displayName">
                </Option>
              </Select>
            </FormItem>
            <FormItem style="width: 15%;">
              <Button type="primary" @click="handleQuery">查询</Button>
            </FormItem>
          </Form>
        </div> -->
        <div style="clear: both; margin: 10px">
          <Table style="margin: 5px"
                 width="1100"
                 height="450"
                 ref="datasetTable"
                 :loading="datasetDataloading"
                 show-header
                 border
                 highlight-row
                 size="small"
                 :data="datasetDataAll"
                 :columns="datasetDataColumns"
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
              :page-size-opts="modalPageSizeOpts"
              :pageSize="datasetPageSize"
              :total="datasetDataCount"
              :current="datasetCurrentPage"
              @on-change="datasetChangePage"
              @on-page-size-change="datasetChangePageSize"></Page>
          </div>
        </div>
        <div slot="footer">
          <Button type="primary" size="large" @click="viewDatasetModal = false">确认</Button>
        </div>
      </Modal>
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
<!--    <div style="clear: both; margin: 10px">-->
<!--      <Table style="margin: 5px"-->
<!--             ref="dataTable"-->
<!--             :loading="loading"-->
<!--             stripe-->
<!--             show-header-->
<!--             highlight-row-->
<!--             size="small"-->
<!--             :data="tableDataPage"-->
<!--             :columns="tableColumns"-->
<!--             @on-row-click="selectRow"-->
<!--             @on-row-dblclick="handleDoubleClick"-->
<!--      >-->
<!--      </Table>-->
<!--    </div>-->
    <div style="clear: both; margin: 15px">
      <Spin v-if="loading" fix></Spin>
      <div v-for="(row, index) in gridDataPage" :key="'datasetRow_' + index">
        <Row :gutter="16">
          <Col :span="8" v-for="(item, innerIndex) in row" :key="'dataset_' + innerIndex">
            <Card class="self-card" @click.native="selectRow(item, index * 3 + innerIndex)">
              <Dropdown style="margin-left: 20px" slot="extra" placement="bottom-end" trigger="hover">

                <Button type="text" icon="ios-more"></Button>
                <DropdownMenu class="self-userDrop" slot="list">
                  <DropdownItem @click.native="editDataset(item)">编辑</DropdownItem>
                  <DropdownItem @click.native="viewDatasetObjs(item)">查看对象</DropdownItem>
                  <DropdownItem @click.native="deleteDataset(item)">删除</DropdownItem>
                </DropdownMenu>
              </Dropdown>
              <div style="height: 120px; display: flex; justify-content: space-around; align-items: center;">
                <i :class="mapIcon(mapDatasourceType(item.plt_datasourceid))" style="color: rgb(81, 90, 110); font-size: 5em !important;"></i>
                <div style="width: 60%; height: 80%; display: flex; flex-direction: column; justify-content: space-between;">
                  <p style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" :title="item.plt_datasetname">数据集名称：{{item.plt_datasetname}}</p>
                  <p style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" :title="mapDatasource(item.plt_datasourceid)">所属数据源：{{mapDatasource(item.plt_datasourceid)}}</p>
                  <p style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" :title="mapDatasourceType(item.plt_datasourceid)">数据源类型：{{mapDatasourceType(item.plt_datasourceid)}}</p>
                  <p style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" :title="item.plt_filterstring">查询语句：{{item.plt_filterstring}}</p>
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
import DataSetMgr from "../../api/data-model/DataSetMgr";
import DataSourceMgr from "../../api/data-model/DataSourceMgr";
import EntityModeling from "../../api/data-model/EntityModeling";
import '@/styles/component/iconfont.css';

export default {
  name: "OprDataSetMgr",
  data() {
    return {
      args: {},
      tableDataAll: [],
      loading: true,
      nameExist: false,   //判断数据集名是否已存在
      currentPage: 1,
      pageSize: 12,
      modalPageSizeOpts: [10, 50, 100, 500],
      pageSizeOpts: [12, 60, 120, 480],
      keyword: "",
      currentData: {},
      editRowData: {},
      editRowModal: false,
      editRowModalLoading: false,
      rowValidate: {
        plt_datasetname: [
          { required: true, message: "数据集名称不能为空", trigger: "blur" },
          {
            pattern: /^\S{1,32}$/,
            message: "数据集名称长度不超过32个字符",
            trigger: "blur"
          }
        ],
        plt_datasourceid: [
          { required: true, message: "所属数据源不能为空", trigger: "blur" }
        ],
        plt_filterstring: [
          { required: true, message: "查询语句不能为空", trigger: "blur" }
        ]
      },
      editRowStatus: "add",
      allDataSources: [],
      allEntityClasses: [],

      viewDatasetModal: false,
      datasetDataloading: false,
      datasetDataAll: [],
      datasetDataCount: 0,
      datasetDataColumns: [],

      queryForm: {
        startIndex: 0,
        pageSize: 0,
        sampleMethod: undefined
      },
      allSampleMethods: [
        {
          name: "sequential",
          displayName: "顺序"
        },
        {
          name: "isometric",
          displayName: "等距"
        }
      ],
      datasetCurrentPage: 1,
      datasetPageSize: 10,
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
    editRowModalTitle() {
      return this.editRowStatus === "add" ? "新增数据集" : "编辑数据集";
    },
    filteredTableData() {
      let keywordLower = this.keyword.toLowerCase().trimStart().trimEnd();
      let res = [];
      for (let id in this.tableDataAll) {
        let data = this.tableDataAll[id];
        for (let key in data) {

          if(key == 'zoneName' || key == 'className' || key == 'displayName' || key == 'transOid' || key == 'transType' || key == 'plt_datasetname') {

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
    }
  },
  created() {
    DataSourceMgr.getAllDataSources().then(res => {
      this.allDataSources = res.data.filter(item => {
        return !(['IOTDB', 'MYSQL', 'HDFS', 'ORACLE', 'SQLSERVER'].includes(item.dataSourceType));
      });
      this.getAllRows();
      EntityModeling.getAllEntities().then(res => {
        this.allEntityClasses = res.data;
      });
    });
    Array.prototype.unique = function() {
      var a = this.concat();
      for (var i = 0; i < a.length; ++i) {
        for (var j = i + 1; j < a.length; ++j) {
          if (a[i] === a[j]) a.splice(j--, 1);
        }
      }
      return a;
    };
  },
  methods: {
    mapIcon(type) {
      let targetSkin = sessionStorage.getItem('skinStyle');
      let darkFont = '';
      if(targetSkin == 'dark') {
        darkFont = ' self-color';
      }
      if (type in this.iconDict) return `${this.iconDict[type]}${darkFont}`;
      else return `ivu-icon ivu-icon-ios-power${darkFont}`;
    },
    mapDatasource(oid) {
      let list = this.allDataSources.filter(item => {
        return item.oid === oid;
      });
      return list.length > 0 ? list[0].dataSourceName : "（已失效）";
    },
    mapDatasourceType(oid) {
      let list = this.allDataSources.filter(item => {
        return item.oid === oid;
      });
      return list.length > 0 ? list[0].dataSourceType : "（已失效）";
    },

    // 数据集新增前名判重
    checkName() {

      // if(this.editRowStatus == "add") {
        if(this.editRowData.plt_datasetname != '') {
        
          DataSetMgr.getAllDataSets({condition: `and plt_datasetname='${this.editRowData.plt_datasetname}'`}).then(res => {
            
            if(res.success) {

              if(this.editRowStatus == "add") {

                let hadName = res.data;
                this.nameExist = hadName.length > 0 ? true : false;
                if(hadName.length > 0) {
                  this.$Message.error('当前数据集名称已存在,请重新输入')
                }

              } else {
                console.log(this.targetEditItem, this.editRowData.plt_datasetname == this.targetEditItem.plt_datasetname);
                if(this.editRowData.plt_datasetname == this.targetEditItem.plt_datasetname) {
                  this.nameExist = false;
                } else {
                  let hadName = res.data;
                  this.nameExist = hadName.length > 0 ? true : false;
                  if(hadName.length > 0) {
                    this.$Message.error('当前数据集名称已存在,请重新输入')
                  }
                }
              }

            }

          })

        }

      // }

    },
    
    refreshDataSources(isOpen) {
      if (!isOpen) return;
      this.$Spin.show();
      DataSourceMgr.getAllDataSources().then(res => {
        this.allDataSources = res.data.filter(item => {
          return item.dataSourceType !== 'IOTDB';
        });
        this.$Spin.hide();
      }).catch(e => {
        this.$Spin.hide();
      });
    },
    editDataset(item) {
      console.log(item);
      this.targetEditItem = {...item};
      this.selectRow(item);
      this.onClickEditRow();
    },
    viewDatasetObjs(item) {
      this.selectRow(item);
      this.onClickViewDataset();
    },
    deleteDataset(item) {
      this.selectRow(item);
      this.deleteRow();
    },
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
    onClickAddRow() {
      this.editRowStatus = "add";
      this.nameExist = false;
      this.currentData = {};
      this.editRowData = {};
      // this.$refs["dataTable"].clearCurrentRow();
      this.$refs["editRowForm"].resetFields();
      this.editRowModal = true;
    },
    onClickEditRow() {
      this.editRowStatus = "edit";
      this.editRowModal = true;
      // this.$refs["editRowForm"].validate(valid => {
      //   this.editRowStatus = "edit";
      //   this.editRowModal = true;
      // });
    },
    getAllRows() {
      this.currentData = {};
      this.loading = true;
      let orderParam = {"condition": "order by plt_lastmodifytime desc"} 
      DataSetMgr.getAllDataSets(orderParam).then(res => {
        this.loading = false;
        this.tableDataAll = res.data;

        this.tableDataAll = this.tableDataAll.map(t => {

          let list = this.allDataSources.filter(item => {
            return item.oid === t.plt_datasourceid;
          });
          t['transOid'] = list.length > 0 ? list[0].dataSourceName : "（已失效）";

          // let listType = this.allDataSources.filter(item => {
          //   return item.oid === t.plt_datasourceid;
          // });
          // t['transType'] = listType.length > 0 ? listType[0].dataSourceType : "（已失效）";
          t['transType'] = list.length > 0 ? list[0].dataSourceType : "（已失效）";
          return t;

        })

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
    datasetChangePage(pageId) {
      this.datasetCurrentPage = pageId;
      this.refreshQuery();
    },
    datasetChangePageSize(pageSize) {
      this.datasetPageSize = pageSize;
      this.refreshQuery();
    },
    searchKeyword() {
      this.currentData = {};
      this.changePage(1);
    },
    selectRow(rowData, index) {
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
    uuidv4() {
      return "xxxxxxxxxxxx4xxxyxxxxxxxxxxxxxxx".replace(/[xy]/g, c => {
        let r = (Math.random() * 16) | 0, v = c === "x" ? r : (r & 0x3) | 0x8;
        return v.toString(16);
      });
    },
    addRow() {
      this.$refs["editRowForm"].validate(valid => {
        if (valid) {

          if(this.nameExist) {
            this.$Message.error("当前数据集名称已存在,请重新输入");
          } else {

            DataSetMgr.getAllDataSets({condition: `and plt_datasetname='${this.editRowData.plt_datasetname}'`}).then(res => {
            
              if(res.success) {

                let hadName = res.data;
                this.nameExist = hadName.length > 0 ? true : false;

                if(this.nameExist) {
                  this.$Message.error("当前数据集名称已存在,请重新输入");
                } else {

                  this.editRowModalLoading = true;
                  let mergedData = [
                    {
                      ...this.editRowData,
                      plt_oid: this.uuidv4()
                    }
                  ];
                  delete mergedData[0].dataSource;
                  DataSetMgr.createDataSets(mergedData)
                    .then(res => {
                      this.getAllRows();
                      this.editRowModalLoading = false;
                      this.editRowModal = false;
                      this.$Message.success("新增数据集成功");
                    })
                    .catch(error => {
                      this.editRowModalLoading = false;
                    });

                }

              } else {
                this.$Message.error("数据集名称重名检查失败, 请稍后再试");
              }

            })

          }
          
        } else {
          this.editRowModalLoading = false;
          this.$Message.error("请检查输入是否正确");
        }
      });
    },
    deleteRow() {
      this.$Modal.confirm({
        title: "删除数据集",
        content: "<p>是否确认删除当前数据集？</p>",
        loading: true,
        onOk: () => {
          this.$Modal.loading = true;
          DataSetMgr.deleteDataSets([this.currentData.plt_oid])
            .then(res => {
              this.getAllRows();
              // this.clearSelectColor();
              if (
                this.tableDataAll.length - 1 ===
                  this.pageSize * (this.currentPage - 1) &&
                this.tableDataAll.length !== 1
              )
                this.changePage(this.currentPage - 1);
              this.$Modal.loading = false;
              this.$Modal.remove();
              this.$Message.success("删除数据集成功");
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
          if(this.nameExist) {
            this.$Message.error("当前数据集名称已存在,请重新输入");
          } else {

            DataSetMgr.getAllDataSets({condition: `and plt_datasetname='${this.editRowData.plt_datasetname}'`}).then(res => {
              console.log(res)
              if(res.success) {
                
                if(this.editRowData.plt_datasetname == this.targetEditItem.plt_datasetname) {
                  this.nameExist = false;
                } else {
                  let hadName = res.data;
                  this.nameExist = hadName.length > 0 ? true : false;
                }

                if(this.nameExist) {
                  this.$Message.error("当前数据集名称已存在,请重新输入");
                } else {

                  this.editRowModalLoading = true;
                  let tempData = {...this.editRowData};
                  delete tempData.dataSource;
                  DataSetMgr.updateDataSets([tempData])
                    .then(res => {
                      this.getAllRows();
                      this.editRowModalLoading = false;
                      this.editRowModal = false;
                      this.$Message.success("更新数据集成功");
                    })
                    .catch(error => {
                      this.editRowModalLoading = false;
                    });

                }

              } else {
                this.$Message.error("数据集名称重名检查失败, 请稍后再试");
              }

            })

          }
          
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
    onClickViewDataset() {
      this.viewDatasetModal = true;
      this.datasetDataAll = [];
      this.datasetDataColumns = [];
      this.queryForm = {
        startIndex: 0,
        pageSize: 50,
        sampleMethod: 'sequential'
      };
      this.datasetCurrentPage = 1;
      this.handleQuery();
    },
    refreshQuery() {
      this.datasetDataloading = true;
      DataSetMgr.getDataSetResult(
        this.currentData.plt_oid,
        this.queryForm.startIndex,
        this.queryForm.pageSize,
        this.queryForm.sampleMethod,
        this.datasetCurrentPage - 1,
        this.datasetPageSize
      )
        .then(res => {
          this.datasetDataAll = res.data;
          let len = this.datasetDataAll.length;
          for (let i = 0; i < len; ++i) {
            let obj = this.datasetDataAll[i];
            Object.keys(obj).forEach(function(key){
              let date;
              if (obj[key].toString().length === 13 && (date = new Date(obj[key])) !== undefined && date.getFullYear() > 2000 && date.getFullYear() < 2100) {
                obj[key] = date.toISOString();
              }
            });
          }
          if (res.data !== undefined && res.data.length > 0) {
            this.datasetDataColumns = [
              {
                type: "index",
                title: "序号",
                width: 80,
                align: "center"
              }
            ];
            let columnNames = [];
            res.data.forEach(item => {
              columnNames = columnNames.concat(Object.keys(item)).unique();
            });
            columnNames.forEach(item => {
              this.datasetDataColumns.push({
                title: item,
                key: item,
                tooltip: true,
                minWidth: Math.max((item.length + 2) * 15, 100)
              });
            });
          }
          this.datasetDataloading = false;
        })
        .catch(e => {
          this.datasetDataloading = false;
        });
    },
    handleQuery() {
      this.datasetDataloading = true;
      if (this.queryForm.startIndex === undefined || this.queryForm.startIndex === null) this.queryForm.startIndex = 0;
      if (this.queryForm.pageSize === undefined || this.queryForm.pageSize === null) this.queryForm.pageSize = 0;
      this.datasetCurrentPage = 1;
      this.datasetPageSize = 10;
      DataSourceMgr.getDataSource(this.currentData.plt_datasourceid)
        .then(res => {
          this.currentData.dataSource = {
            dataSourceName: res.data.plt_datasourcename,
            dataSourceType: res.data.plt_datasourcetype,
            databaseName: res.data.plt_databasename,
            description: res.data.plt_description,
            folderDepth: res.data.plt_folderdepth,
            oid: res.data.plt_oid,
            password: res.data.plt_password,
            serverIp: res.data.plt_serverip,
            serverPort: res.data.plt_serverport,
            userName: res.data.plt_username
          };
          DataSetMgr.getDataSetTotalCount(
            this.currentData.plt_oid
            ).then(res => {
              this.datasetDataCount = res.data;
              this.refreshQuery();
            })
            .catch(e => {
              this.datasetDataloading = false;
            });
          // DataSetMgr.getDataSetDataCount(
          //   this.currentData.plt_oid,
          //   this.queryForm.startIndex,
          //   this.queryForm.pageSize,
          //   this.queryForm.sampleMethod,
          //   this.datasetCurrentPage - 1,
          //   this.datasetPageSize
          //   ).then(res => {
          //     this.datasetDataCount = res.data;
          //     this.refreshQuery();
          //   })
          //   .catch(e => {
          //     this.datasetDataloading = false;
          //   });
        })
        .catch(e => {
          this.datasetDataloading = false;
          console.log(e);
        });
    }
  }
};
</script>
<style>
  .datasetSelect .ivu-select-dropdown {
    width: 100%;
  }
  .datasetSelect .ivu-select-item-focus {
    background: initial;
  }
</style>
