<template>
  <div>
    <div style="float: left; margin: 10px">
      <i-button type="primary" style="margin: 5px" @click="onClickImportButton">
        新增数据模式
      </i-button>
<!--      <i-button type="primary" style="margin: 5px" :disabled="currentData.id === undefined" @click="showEditRowModal">-->
<!--        修改数据模式-->
<!--      </i-button>-->
<!--      <i-button type="primary" style="margin: 5px" :disabled="currentData.id === undefined" @click="deleteRow">-->
<!--        删除数据模式-->
<!--      </i-button>-->
      <Modal
        v-model="importModal"
        :title="importModalState === 'importing' ? '新增数据模式' : '编辑数据模式'"
        width="75%"
        :mask-closable="false"
      >
        <Spin fix v-show="importModalLoading"></Spin>
        <i-form ref="importExternalEntityForm" :model="externalEntityData" :rules="externalEntityValidate" inline>
          <FormItem label="数据源" prop="dataSourceOid" style="width: 24%;" class="self-color">
            <i-select v-model="externalEntityData.dataSourceOid" placeholder="选择数据源"
                    @on-change="onChangeDataSource" filterable :disabled="importModalState==='editing'">
              <i-option v-for="item in allDataSources" :value="item.oid" :key="item.oid" :label="item.dataSourceName">
                {{ item.dataSourceName }}
              </i-option>
            </i-select>
          </FormItem>
          <FormItem label="Schema" prop="schema" style="width: 23%;">
            <Select v-model="externalEntityData.schema"
                    @on-change="onChangeSchema" filterable :disabled="importModalState==='editing'">
              <Option v-for="item in dbSchema" :value="item" :key="item">{{ item }}</Option>
            </Select>
          </FormItem>
          <FormItem label="数据库表" prop="zoneName" style="width: 24%;">
            <i-select v-model="externalEntityData.zoneName" placeholder="选择数据库表"
                    @on-change="onChangeTable" filterable :disabled="importModalState==='editing'">
              <i-option :value="externalEntityData.zoneName" v-if="importModalState==='editing'">{{ externalEntityData.zoneName }}</i-option>
              <i-option v-for="item in allTables" :value="item" :key="item" v-else>{{ item }}</i-option>
            </i-select>
          </FormItem>
          <FormItem label="英文名" prop="className" style="width: 24%;">
            <i-input v-model="externalEntityData.className" placeholder="输入英文名" :disabled="importModalState==='editing'"></i-input>
          </FormItem>
          <FormItem label="显示名" prop="displayName" style="width: 24%;">
            <i-input v-model="externalEntityData.displayName" placeholder="输入显示名"></i-input>
          </FormItem>
          <FormItem label="主键" prop="primaryKey" style="width: 23%;">
            <Select v-model="externalEntityData.primaryKey" placeholder="选择主键列" filterable :disabled="(importModalState==='editing' && currentData.primaryKey !== undefined) || externalEntityData.zoneName === '' || externalEntityData.zoneName === undefined">
              <Option v-for="item in externalEntityKeyCols" :value="item.attributeName" :key="item.attributeName">{{ item.attributeName }}</Option>
            </Select>
          </FormItem>
        </i-form>
        <i-form>
          <FormItem label="导入属性列">
            <i-select v-model="selectedAttributes" filterable multiple :disabled="externalEntityData.zoneName === '' || externalEntityData.zoneName === undefined">
              <i-option v-for="item in externalEntityColsData" :value="item.attributeName" :key="item.attributeName">{{ item.attributeName }}</i-option>
            </i-select>
          </FormItem>
        </i-form>
        <i-table
          border
          :columns="attrColumns"
          :data="externalEntityColsDataFiltered"
          size="small"></i-table>
        <div slot="footer">
          <i-button type="text" size="large" :loading="false" @click="cancelImport">取消</i-button>
          <i-button type="primary" size="large" @click="confirmImport">确认</i-button>
        </div>
      </Modal>
<!--      <i-button type="primary" style="margin: 5px" :disabled="currentData.id === undefined" @click="onClickViewDataset">-->
<!--        查看对象-->
<!--      </i-button>-->
      <Modal
        width="1200"
        v-model="viewObjectsModal"
        title="查看数据模式对象"
        :mask-closable="false"
      >
        <div style="clear: both; margin: 10px">
          <i-table style="margin: 5px"
                 width="1100"
                 height="450"
                 :loading="objectsDataloading"
                 show-header
                 border
                 highlight-row
                 size="small"
                 :data="objectsData"
                 :columns="objectsDataColumns"
          >
          </i-table>
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
          <i-button type="primary" size="large" @click="viewObjectsModal = false">确认</i-button>
        </div>
      </Modal>
    </div>
    <div style="float: right; margin: 10px">
      <i-input
        v-model="keyword"
        icon="md-search"
        placeholder="输入关键词查询"
        style="width: 200px; margin: 5px"
        @on-change="searchKeyword"
      >
      </i-input>
    </div>
    <div style="clear: both; margin: 15px">
      <Spin v-if="loading" fix></Spin>
      <div v-for="(row, index) in gridDataPage" :key="'dataschemaRow_' + index">
        <Row :gutter="16">
          <Col :span="8" v-for="(item, innerIndex) in row" :key="'dataschema_' + innerIndex">
            <Card class="self-card" @click.native="selectRow(item, index * 3 + innerIndex)">
              <Dropdown style="margin-left: 20px" slot="extra" placement="bottom-end" trigger="hover">

                <Button type="text" icon="ios-more"></Button>
                <DropdownMenu class="self-userDrop" slot="list">
                  <DropdownItem @click.native="onClickEditButton(item)">编辑</DropdownItem>
                  <DropdownItem @click.native="onClickViewObjectsButton(item)">查看对象</DropdownItem>
                  <DropdownItem @click.native="onClickDeleteButton(item)">删除</DropdownItem>
                </DropdownMenu>
              </Dropdown>
              <div style="height: 120px; display: flex; justify-content: space-around; align-items: center;">
                <i :class="mapIcon(mapDatasourceType(item.dataSourceOid))" style="color: rgb(81, 90, 110); font-size: 5em !important;"></i>
                <div style="width: 60%; height: 80%; display: flex; flex-direction: column; justify-content: space-between;">
                  <p style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" :title="mapDatasource(item.dataSourceOid)">数据源：{{mapDatasource(item.dataSourceOid)}}</p>
                  <p style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" :title="item.zoneName">数据库表：{{item.zoneName}}</p>
                  <p style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" :title="item.className">英文名：{{item.className}}</p>
                  <p style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" :title="item.displayName">显示名：{{item.displayName}}</p>
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
    <Modal
      v-model="deleteConfirm"
      title="删除数据模式"
    >
      <p>确定要删除这个数据模式吗?</p>
      <br>
      <Checkbox v-model="cascade">级联删除该数据模式相应实体类上，关联的关联类、属性、表单、授权项(<span style="color: orangered">请谨慎选择</span>)</Checkbox>
      <div slot="footer">
        <Button type="text" size="large" :loading="false" @click="deleteConfirm = false">取消</Button>
        <Button type="primary" size="large" :loading="deleteModalLoading" @click="deleteRowOnOk">确认</Button>
      </div>
    </Modal>
  </div>
</template>
<script>
import { getEobj, getEobjCount } from "@/api/others";
import DataSourceMgr from "../../api/data-model/DataSourceMgr";
import EntityModeling from "../../api/data-model/EntityModeling";
import ResourceModeling from "../../api/data-model/ResourceModeling";
import '@/styles/component/iconfont.css';

export default {
  name: "OprImpExtEntity",
  data() {
    return {
      args: {
        type: "primary",
        shape: false,
        text: "新增"
      },
      tableDataAll: [],
      dbSchema: [],
      externalEntityKeyCols: [],
      loading: true,
      currentPage: 1,
      pageSize: 12,
      pageSizeOpts: [12, 60, 120, 480],
      keyword: "",
      currentData: {},
      externalEntityValidate: {
        dataSourceOid: [
          { required: true, message: "数据源名不能为空"}
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
            pattern: /^\S{1,32}$/,
            message: "显示名只能包含汉字、字母、数字，长度不超过32个字符",
            trigger: "blur"
          }
        ]
      },
      allTables: [],
      allDataSources: [],

      importModal: false,
      externalEntityData: {
        className: null,
        zoneName: null,
        displayName: null,
        primaryKey: '',
        packagePath: {}, // 存储的是列英文名到中文名的字典，及需要引入的属性列表
      },
      attrColumns: [
        {
          title: "序号",
          type: "index",
          width: 100,
          align: "center"
        },
        {
          title: "列名",
          key: "attributeName",
          tooltip: true
        },
        {
          title: "显示名",
          key: "displayName",
          tooltip: true,
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
                      })
                    }else{
                      this.externalEntityData.packagePath[
                        params.row.attributeName
                        ] =
                        event.target.value.substr(0, 32);
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
      selectedAttributes: [],
      importModalState: "",
      importModalLoading: false,

      viewObjectsModal: false,
      objectsDataloading: false,
      objectsData: [],
      objectsDataCount: 0,
      objectsDataColumns: [],

      objectsCurrentPage: 1,
      objectsPageSize: 10,
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
        IOTDB: "icon iconfont icon-Iotdb"
      },

      deleteConfirm: false,
      cascade : false,
      sortParams: undefined,
      deleteModalLoading: false
    };
  },
  computed: {
    filteredTableData() {
      let keywordLower = this.keyword.toLowerCase().trimStart().trimEnd();
      let res = [];
      for (let id in this.tableDataAll) {
        let data = this.tableDataAll[id];
        for (let key in data) {

          if(key == 'zoneName' || key == 'className' || key == 'displayName' || key == 'transOid') {

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
    },
    externalEntityColsDataFiltered() {
      return this.externalEntityColsData.filter(item => {
        return this.selectedAttributes.indexOf(item.attributeName) >= 0;
      })
    }
  },
  created() {
    this.getAllRows();
    this.resetModalData();
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
    resetModalData() {
      this.importModalLoading = true;
      let promises = [];
      promises.push(ResourceModeling.getAllTables()
        .then(res => {
          this.allTables = res.data;
        }));
      promises.push(DataSourceMgr.getAllDataSources().then(res => {
        if (res.data !== undefined)
          this.allDataSources = res.data.filter(item => {
            return !(['IOTDB', 'MYSQL', 'HDFS', 'ORACLE', 'SQLSERVER'].includes(item.dataSourceType));
          });
      }));
      Promise.all(promises).then(res => {
        this.importModalLoading = false;
      });
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
    refreshDataSources(isOpen) {
      if (!isOpen) return;
      this.$Spin.show();
      DataSourceMgr.getAllDataSources().then(res => {
        this.allDataSources = res.data.filter(item => {
          return !(['IOTDB', 'MYSQL', 'HDFS', 'ORACLE', 'SQLSERVER'].includes(item.dataSourceType));
        });
        this.$Spin.hide();
      }).catch(e => {
        this.$Spin.hide();
      });
    },
    getAllRows() {
      this.currentData = {};
      this.loading = true;
      EntityModeling.getAllEntities()
        .then(res => {
          this.loading = false;
          this.tableDataAll = res.data.filter(
            row =>
              row.classCategory === "ExternalItemClass" &&
              row.classType === "PersistentClass" &&
              row.parentClass === "IdItem" &&
              row.dataSourceOid !== ""
          );
          this.tableDataAll = this.tableDataAll.map(t => {

            let list = this.allDataSources.filter(item => {
              return item.oid === t.dataSourceOid;
            });
            t['transOid'] = list.length > 0 ? list[0].dataSourceName : "（已失效）";
            return t;

          })
          
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
      this.refreshQuery();
    },
    objectsChangePageSize(pageSize) {
      this.objectsPageSize = pageSize;
      this.refreshQuery();
    },
    searchKeyword() {
      this.currentData = {};
      this.changePage(1);
    },
    selectRow(rowData, index) {
      this.$refs['importExternalEntityForm'].resetFields();
      this.currentData = rowData;
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
          EntityModeling.deleteEntity(className, this.cascade)
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
    onClickDeleteButton(item) {
      this.selectRow(item);
      this.cascade = false;
      this.deleteConfirm = true;
    },
    onClickEditButton(item) {
      this.selectRow(item);
      this.importModal = true;
      this.externalEntityData = {...this.currentData};
      this.externalEntityData.packagePath = JSON.parse(this.currentData.packagePath);
      let importAttrKey = `${this.externalEntityData.dataSourceOid}__attributes`;
      if (importAttrKey in this.externalEntityData.packagePath) {
        this.selectedAttributes = this.externalEntityData.packagePath[importAttrKey];
      } else {
        this.selectedAttributes = [];
      }

      this.importModalState = "editing";
      this.importModalLoading = true;
      this.allTables = [];
      this.externalEntityColsData = [];
      let zoneName = '';
      let zoneNameDisplay = '';
      let dbPreSchema = this.externalEntityData.zoneName.indexOf('.') != -1 ? this.externalEntityData.zoneName.split('.')[0] : 'public';
      zoneName = this.externalEntityData.zoneName.indexOf('.') != -1 ? this.externalEntityData.zoneName : `public.${this.externalEntityData.zoneName}`;
      zoneNameDisplay = this.externalEntityData.zoneName.indexOf('.') != -1 ? this.externalEntityData.zoneName.split('.')[1] : this.externalEntityData.zoneName;
      this.dbSchema = [];
      this.dbSchema.push(dbPreSchema);
      this.externalEntityData.schema = dbPreSchema;

      ResourceModeling.getAllExtTables(this.externalEntityData.dataSourceOid).then(res => {
        this.allTables = res.data;
        this.externalEntityData.zoneName = zoneNameDisplay;
        if (this.allTables.indexOf(zoneName) < 0) {
          this.$Message.error('非法数据库表名');
          this.importModalLoading = false;
          return;
        }
        if (zoneName === undefined || zoneName === '') return;
        this.selectedAttributes = [];
        EntityModeling.getColumnsDetailsOfExtTable(this.externalEntityData.dataSourceOid, zoneName).then(res => {
          this.externalEntityColsData = res.data;

          if (importAttrKey in this.externalEntityData.packagePath) {
            this.selectedAttributes = this.externalEntityData.packagePath[importAttrKey];
          } else {
            this.selectedAttributes = [];
          }

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

          // select component bug
          this.selectedAttributes.push(this.externalEntityData.dataSourceOid);
          this.selectedAttributes.pop();

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
      this.importModalLoading = true;
      ResourceModeling.getDBSchema(event).then(res => {
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
      //   .then(res => {
      //     this.allTables = res.data;
      //     this.importModalLoading = false;
      //   })
      //   .catch(error => {
      //     this.allTables = [];
      //     this.importModalLoading = false;
      //   });
    },
    onChangeSchema(event) {
      if (event === undefined || event === "") return;

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

    },

    onChangeTable(event) {
      if (event === undefined || event === "") return;
      this.importModalLoading = true;
      let preSchema = `${this.externalEntityData.schema}.${event}`
      if (this.externalEntityData.dataSourceOid !== "" && event !== "") {
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
              this.externalEntityData.primaryKey = val.attributeName;
            }
          })
          this.selectedAttributes = [];
          this.importModalLoading = false;
        }).catch(error => {
          this.importModalLoading = false;
        });
      }
    },
    confirmImport() {
      this.$refs["importExternalEntityForm"].validate(valid => {
        if (valid) {
          let importAttrKey = `${this.externalEntityData.dataSourceOid}__attributes`;
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
          if(entityData.zoneName.indexOf('.') == -1) {
            entityData.zoneName = `${entityData.schema}.${entityData.zoneName}`;
          }
          if (this.importModalState === "importing") {
            EntityModeling.createEntities([entityData])
              .then(res => {
                this.$Message.success("新增成功");
                this.getAllRows();
                this.importModal = false;
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
                this.$refs["importExternalEntityForm"].resetFields();
              })
              .catch(error => {
                this.$Message.error(error.response.data.message);
              });
          }
        } else {
          this.$Message.error("请检查输入是否正确");
        }
      });
    },
    cancelImport() {
      this.importModal = false;
      this.$refs["importExternalEntityForm"].resetFields();
    },
    onClickImportButton() {
      this.$refs["importExternalEntityForm"].resetFields();
      this.importModalState = "importing";
      this.importModal = true;
      this.externalEntityData = {
        zoneName : "",
        className : "",
        displayName : "",
        packagePath : {},
      };
      this.externalEntityColsData = [];
      this.allTables = [];
      this.selectedAttributes = [];
    },
    onClickViewObjectsButton(item) {
      this.selectRow(item);
      this.viewObjectsModal = true;
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
        res.data.forEach(item => {
          this.objectsDataColumns.push({
            title: item.attributeName,
            key: item.attributeName,
            tooltip: true,
            minWidth: Math.max((item.attributeName.length + 2) * 15, 150)
          });
        });
        this.handleQuery();
      });
      
    },
    handleQuery() {
      this.objectsDataloading = true;
      DataSourceMgr.getDataSource(this.currentData.dataSourceOid)
        .then(res => {
          this.currentData.dataSource = {
            dataFileFormat: res.data.plt_datafileformat,
            dataSourceName: res.data.plt_datasourcename,
            dataSourceType: res.data.plt_datasourcetype,
            databaseName: res.data.plt_databasename,
            description: res.data.plt_description,
            folderDepth: res.data.plt_folderdepth,
            oid: res.data.plt_oid,
            param1: res.data.plt_paramone,
            password: res.data.plt_password,
            serverIp: res.data.plt_serverip,
            serverPort: res.data.plt_serverport,
            userName: res.data.plt_username,
            workbenchUrl: res.data.plt_workbenchurl
          };
          getEobjCount(
            this.currentData.className,
            {
              startIndex: this.objectsCurrentPage * this.objectsPageSize - this.objectsPageSize,
              pageSize: this.objectsPageSize,
              sampleMethod: 'sequential'
            }
          ).then(res => {
            this.objectsDataCount = res.data.data;
            this.refreshQuery();
          })
            .catch(e => {
              this.objectsDataloading = false;
            });
        })
        .catch(e => {
          this.objectsDataloading = false;
        });
    },
    refreshQuery() {
      this.objectsDataloading = true;
      getEobj(
        this.currentData.className,
        {
          startIndex: this.objectsCurrentPage * this.objectsPageSize - this.objectsPageSize,
          pageSize: this.objectsPageSize,
          sampleMethod: 'sequential'
        }
      )
        .then(res => {
          this.objectsData = res.data.data;
          let len = this.objectsData.length;
          for (let i = 0; i < len; ++i) {
            let obj = this.objectsData[i];
            Object.keys(obj).forEach(function(key){
              let date;
              if (obj[key].toString().length === 13 && (date = new Date(obj[key])) !== undefined && date.getFullYear() > 2000 && date.getFullYear() < 2100) {
                obj[key] = date.toISOString();
              }
            });
          }
          if (this.objectsData !== undefined && this.objectsData.length > 0) {
            // this.objectsDataColumns = [
            //   {
            //     type: "index",
            //     title: "序号",
            //     width: 80,
            //     align: "center"
            //   }
            // ];
            // let columnNames = [];
            // this.objectsData.forEach(item => {
            //   columnNames = columnNames.concat(Object.keys(item)).unique();
            // });
            // columnNames.forEach(item => {
            //   this.objectsDataColumns.push({
            //     title: item,
            //     key: item,
            //     tooltip: true,
            //     minWidth: Math.max((item.length + 2) * 15, 100)
            //   });
            // });
          }
          this.objectsDataloading = false;
        })
        .catch(e => {
          this.objectsDataloading = false;
        });
    }
  }
};
</script>
