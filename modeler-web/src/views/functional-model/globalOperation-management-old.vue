<style lang="less">
@import "../../styles/common.less";
@import "./components/table.less";
</style>

<template>
    <div>
        <Row>
            <Col span="24">
                <Card>
                    <!-- <p slot="title">
                        <Icon type="ios-keypad"></Icon>
                         全局操作清单
                    </p> -->
                    <Row>
                      <Input v-model="searchConName" icon="md-search" @on-change="handleSearch" placeholder="请输入操作名搜索..." style="width: 200px" />
                      <Button id="createGlobalOprButton" type="primary" style="float:right;" @click="addQueryOperation">新增</Button>
                      <Button id="createGlobalScriptsButton" type="primary" style="float:right; margin-right: 10px;" @click="addQueryGlobalOperation">新增全局脚本</Button>
                    </Row>
                    <div class="edittable-table-height-con margin-top-10">
                        <Table border size="small" height="434" :columns="columnsOperation" :data="currentTable"></Table>
                        <div style="margin: 10px;overflow: hidden">
                            <div style="float: right;" v-show="isSearch">
                                <Page :total="totalData" :current.sync="currentPage" :page-size="10" @on-change="changePage" show-total></Page>
                            </div>
                        </div>
                    </div>

                    <!-- 快速查询操作 -->
                    <QueryOprDialog ref="opr_dialog"
                        :route="route"
                        :router="router"
                        :root="root"
                        :store="store"
                        @success-create-queryopr="onSuccessCreateQueryOpr">
                    </QueryOprDialog>

                </Card>
            </Col>
        </Row>

        <!-- 缓冲删除 -->
        <Modal
          v-model="delModal"
          id="deleteGlobalOprModal"
          title="提示"
          @on-ok="confirmDel"
          @on-cancel="delModal = false">
          <p>是否确认删除当前选择的全局操作?</p>
        </Modal>
        <!-- 缓冲删除Ending -->

        <!-- 最大化编辑器 -->
        <Modal
            v-model="isFullScreen"
            title="脚本编辑"
            :mask-closable="false"
            width="80%"
            @on-ok="confirmScript"
            @on-cancel="cancelScript">
            <editor v-model="commonScript" @init="editorInit" lang="javascript" theme="chrome" width="100%" height="600"></editor>
        </Modal>
        <!-- 最大化编辑器ENDING -->
    </div>
</template>

<script>
import {
  getEntryOperations,
  addNewOperation,
  fixOperation,
  delOperation,
  checkCnameEvent,
  getGlobalOperation,
  getPlugList
} from "../../api/others";
import QueryOprDialog from './components/query-operation-edit-dialog.vue'

export default {
  name: "globalOperayion-management",
  components: {
    editor: require("vue2-ace-editor"),
    QueryOprDialog
  },
  props: ['index', 'store', "route", "router", "root"],
  data() {
    const validateCname = (rule, value, callback) => {
      if (value === '') {
          callback(new Error('显示名不能为空'));
      } else {
          if(value.length > 32) {
              callback(new Error('显示名不能超过32个字符哦～'));
          } else {
              callback();
          }
      }
    };
    const validateEname = (rule, value, callback) => {
        if (value === '') {
            callback(new Error('英文名不能为空'));
        } else {
            const reg = new RegExp("^[A-Za-z0-9]*$");
            let flag = reg.test(value);
            if(!flag){
              callback(new Error('英文名只能包含字母和数字哦～'));
            } else {
              if(value.length > 32) {
                  callback(new Error('英文名不能超过32个字符哦～'));
              } else {
                  callback();
              }
            }
        }
    };
    return {
      nonePlug: false,
      isSearch: true,
      isFullScreen: false,

      delModal: false,
      delId: null,
      columnsWidth: 211,

      commonScript: '',     // 公共最大化编辑器内容
      bigForm: '',
      cnameExist: false,
      editOperationModal: false,
      fixOperation: {
        cname: "",
        radio: "插件调用",
        content: ""
      },
      ruleOperation: {
        cname: [
          { required: true, message: "显示名不能为空哦～", trigger: "blur" },
          { validator: validateCname, trigger: 'blur' }
        ],
        ename: [
          { required: true, message: "英文名不能为空哦～", trigger: "blur" },
          { validator: validateEname, trigger: 'blur' }
        ]
      },
      ruleFix: {
        cname: [
          { required: true, message: "显示名不能为空哦～", trigger: "blur" },
          { validator: validateCname, trigger: 'blur' }
        ]
      },
      searchConName: "",
      templateTable: [], // 姓名搜素的临时表格
      editInlineColumns: [],
      plugList: [],
      plugData: [],
      columnsOperation: [
        {
          title: "序号",
          type: "index",
          width: 150,
          align: "center"
        },
        {
          title: "英文名",
          key: "authority",
          align: "center"
        },
        {
          title: "显示名",
          key: "displayName",
          align: "center"
        },
        {
          title: "样式",
          key: "conType",
          align: "center"
        },
        {
          title: "操作",
          key: "action",
          width: 250,
          align: "center",
          render: (h, params) => {
            return h("div", [
              h(
                "Button",
                {
                  attrs: {
                    id: 'editGlobalOprButton',
                  },
                  props: {
                    type: "primary",
                    size: "small"
                  },
                  style: {
                    marginRight: "5px"
                  },
                  on: {
                    click: () => {
                      this.show(params.row.oid);
                    }
                  }
                },
                "编辑"
              ),
              h(
                "Button",
                {
                  props: {
                    type: "error",
                    size: "small"
                  },
                  attrs: {
                    id: 'deleteGlobalOprButton',
                  },
                  on: {
                    click: () => {
                      this.remove(params.row.oid);
                    }
                  }
                },
                "删除"
              )
            ]);
          }
        }
      ],
      operationTable: [],
      currentTable: [],
      totalData: 10,
      currentPage: 1,
      fixOpeEname: "",
      delOpeEname: "",
      delIndex: -1,
      fixtargertOpe: {}
    };
  },
  methods: {
    editorInit() {
      require("brace/ext/language_tools"); //language extension prerequsite...
      require("brace/mode/html");
      require("brace/mode/javascript"); //language
      require("brace/mode/less");
      require("brace/theme/chrome");
      require("brace/snippets/javascript"); //snippet
    },
    activate() {
        this.resetColumnsWidth();
    },
    globalRefresh() {
      this.currentPage = 1;
      this.initData();
    },
    resetColumnsWidth() {

        let sideWidth = document.getElementById('mainMenuSide') ? document.getElementById('mainMenuSide').style.width : 0;
        let finalWidth = parseInt(sideWidth) + 430;
        this.columnsWidth = (document.body.clientWidth - finalWidth) / 3;
        console.log(this.columnsWidth)

        this.columnsOperation = [
          {
          title: "序号",
          type: "index",
          width: 150,
          align: "center"
        },
        {
          title: "英文名",
          key: "authority",
          minWidth: this.columnsWidth,
          align: "center"
        },
        {
          title: "显示名",
          key: "displayName",
          minWidth: this.columnsWidth,
          align: "center"
        },
        {
          title: "样式",
          key: "conType",
          minWidth: this.columnsWidth,
          align: "center"
        },
        {
          title: "操作",
          key: "action",
          width: 250,
          align: "center",
          render: (h, params) => {
            return h("div", [
              h(
                "Button",
                {
                  props: {
                    type: "primary",
                    size: "small"
                  },
                  attrs: {
                    id: 'editGlobalOprButton',
                  },
                  style: {
                    marginRight: "5px"
                  },
                  on: {
                    click: () => {
                      this.show(params.row.oid);
                    }
                  }
                },
                "编辑"
              ),
              h(
                "Button",
                {
                  props: {
                    type: "error",
                    size: "small"
                  },
                  attrs: {
                    id: 'deleteGlobalOprButton',
                  },
                  on: {
                    click: () => {
                      this.remove(params.row.oid);
                    }
                  }
                },
                "删除"
              )
            ]);
          }
        }
        ]

    },
    // 初始化表格数据获取
    initData() {
      // loading动画
      this.$Spin.show();
      // 全局操作get
      this.commonTabel();
    },
    commonTabel() {
      this.isSearch = true;
      this.operationTable = [];

      // 表格内容
      getEntryOperations('Root')
        .then(response => {
          this.$Spin.hide();
          let res = response.data;
          if (res.success) {
            this.operationTable = [];
            let allQuery = res.data.queryOprConfigs;
            this.currentPage = 1;
            if (allQuery.length > 0) {
              this.totalData = allQuery.length;
              allQuery.forEach((val, index, val_arr) => {
                val.searchItem = val.authority + "" + val.displayName + "" + val.authority.toUpperCase() + ""  + val.authority.toLowerCase() + val.conType
                this.operationTable.push(val);
              });
              // this.currentTable = this.operationTable.slice(0, 10);
              this.currentTable = this.operationTable.slice((this.currentPage - 1) * 10, this.currentPage * 10);
              this.templateTable = this.currentTable;

              if(this.searchConName && this.searchConName != '') {

                this.isSearch = false;
                this.currentTable = this.templateTable;
                this.currentTable = this.search(this.operationTable, {
                  searchItem: this.searchConName
                });
                this.totalData = this.currentTable.length;

              }
              sessionStorage.setItem("targetPage", this.currentPage);
            } else {
                this.operationTable = [];
                this.currentTable = [];
                this.templateTable = [];
                this.totalData = 0;
            }
          } else {
            const title = "提示";
            const content = "<p>服务器繁忙, 请稍后再试～</p>";
            this.$Modal.warning({
              title: title,
              content: content
            });
          }
        })
        .catch(e => {
          console.log(e);
          this.router.push({ name: "error_500" });
        });
    },
    // 编辑操作弹窗信息
    show(indexId) {
      this.$refs.opr_dialog.editBindQuick(indexId);
    },
    remove(indexId) {

      this.delModal = true;
      this.delId = indexId;

    },

    chooseWay(value) {
      if (value == "后端脚本") {
        this.fixOperation.content = "ServerScript:";
      } else if (value == "前端脚本") {
        this.fixOperation.content = "ClientScript:";
      } else if (value == "存储过程") {
        this.fixOperation.content = "procedure:";
      } else {
        this.fixOperation.content = "";
      }
    },

    // 显示最大化编辑器窗口
    changeBigSize(formName) {
      this.bigForm = formName;

      this.editOperationModal = false;
      this.commonScript = this.fixOperation.content;


      this.isFullScreen = true;
    },

    // 最大化脚本编辑确认
    confirmScript() {
        this.isFullScreen = false;

        this.fixOperation.content = this.commonScript;
        this.editOperationModal = true;

    },
    // 关闭最大化脚本编辑弹窗
    cancelScript() {

        this.isFullScreen = false;

        this.fixOperation.content = '';
        this.editOperationModal = true;

        this.commonScript = '';
    },

    search(data, argumentObj) {
      let res = data;
      let dataClone = data;
      for (let argu in argumentObj) {
        if (argumentObj[argu].length > 0) {
          res = dataClone.filter(d => {
            return d[argu].indexOf(argumentObj[argu]) > -1;
          });
          dataClone = res;
        }
      }
      return res;
    },

    onSuccessCreateQueryOpr() {

      this.$Spin.show();

      let self = this;

      setTimeout(function() {
        self.commonTabel();
      }, 150);
    },

    addQueryOperation() {
      this.$refs.opr_dialog.createBindQuick("Root-*");
    },

    addQueryGlobalOperation(){
      this.$refs.opr_dialog.createBindGlobalQuick("Root-*");
    },
    // 取消追加新用户
    cancel() {},
    // 中英文姓名搜素
    handleSearch() {
      let minLen = this.searchConName.trimStart().trimEnd().length;
      if (minLen == 0) {
        this.isSearch = true;
        this.currentTable = this.operationTable.slice(0, 10);
        this.totalData = this.operationTable.length;
      } else {
        this.isSearch = false;
        this.currentTable = this.templateTable;
        this.currentTable = this.search(this.operationTable, {
          searchItem: this.searchConName.trimStart().trimEnd()
        });
        this.totalData = this.currentTable.length;
      }
    },
    handleChange(val, index) {
      if (
        val[val.length - 1].eName == "" ||
        val[val.length - 1].cName == "" ||
        val[val.length - 1].password == ""
      ) {
        return false;
      }
      this.$Message.success("修改了第" + (index + 1) + "行数据");
    },
    changePage(value) {
      sessionStorage.setItem("targetPage", value);
      this.currentTable = this.operationTable.slice(
        (value - 1) * 10,
        value * 10
      );
      this.templateTable = this.currentTable;
    },

    // 系统操作英文名查重
    checkCname(fname) {
      if (this.$refs[fname].model.ename != "") {
        checkCnameEvent(this.$refs[fname].model.ename)
          .then(response => {
            let res = response.data;
            if (res.success && res.data != undefined) {
              this.cnameExist = true;
            } else {
              this.cnameExist = false;
            }
          })
          .catch(e => {
            console.log(e);
            this.$Spin.hide();
          });
      }
    },
    // 删除全局操作
    confirmDel() {
      this.$refs.opr_dialog.okDel(this.delId);
    }
  },
  created() {
    this.resetColumnsWidth();
    this.$store = this.store;
    this.initData();
  }
};
</script>
