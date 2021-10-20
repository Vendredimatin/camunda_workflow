<style lang="less">
@import "../../styles/common.less";
@import "./components/table.less";
</style>

<template>
    <div>
        <Row>
            <Col span="24">
                <Card>
                    <Row>
                      <Input id="searchOprName" v-model="searchConName" icon="md-search" @on-change="handleSearch" placeholder="请输入操作名搜索..." style="width: 200px;float: right;" />
                      <Button id="createGlobalScriptsButton" type="primary" style="float:left; margin-right: 10px;" @click="addQueryGlobalOperation">新增全局脚本</Button>
                      <Button id="createGlobalOprButton" type="primary" style="float:left;" @click="addQueryOperation">新增</Button>
                    </Row>
                    <div class="edittable-table-height-con margin-top-10">
                        <Table id="globalOprList" border size="small" ref="globalTable" :height="tableHeight" :columns="columnsOperation" :data="operationTable"></Table>
                        <div style="margin: 10px;overflow: hidden">
                            <div style="float: right;">
                                <Page transfer placement="top" :total="totalData" :current.sync="currentPage" :pageSize="selfPageSize" @on-change="changePage" show-total show-elevator show-sizer :page-size-opts="pageSizeOpts" @on-page-size-change="changeUserPageSize"></Page>
                            </div>
                        </div>
                    </div>

                    <!-- 快速查询操作 -->
                    <QueryOprDialog
                      ref="opr_dialog"
                      :fromManagement="true"
                      @success-create-queryopr="onSuccessCreateQueryOpr">
                    </QueryOprDialog>

                </Card>
            </Col>
        </Row>

        <!-- 缓冲删除 -->
        <Modal
          id="deleteGlobalOprModal"
          v-model="delModal"
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
            <MonacoEditor v-model="commonScript" @init="editorInit" lang="javascript" theme="chrome" width="100%" height="600"></MonacoEditor>
        </Modal>
        <!-- 最大化编辑器ENDING -->
    </div>
</template>

<script>
import {tableMixin} from "@/component/tableMixin"
import {
  getEntryOperations,
  addNewOperation,
  delOperation,
  checkCnameEvent,
  getGlobalOperation,
  getPlugList
} from "../../api/others";
import QueryOprDialog from './components/query-operation-edit-dialog.vue'
import MonacoEditor from "@/views/functional-model/components/MonacoEditor";

export default {
  name: "globalOperayion-management",
  mixins: [tableMixin],
  components: {
    editor: require("vue2-ace-editor"),
    MonacoEditor: MonacoEditor,
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
      isFullScreen: false,

      delModal: false,
      delId: null,
      columnsWidth: 211,
      selfPageSize: 10,
      pageSizeOpts: [10, 25, 50, 100, 200, 500],

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
      columnsOperation: [
        {
          title: "序号",
          type: "index",
          width: 150,
          align: "center",
          id:"globalIndexEdit",

        },
        {
          title: "英文名",
          key: "authority",
          align: "center",
          id:"globalAuthorityIndex",

        },
        {
          title: "显示名",
          key: "displayName",
          align: "center",
          id:"globalDisplayIndex",

        },
        {
          title: "动作",
          key: "action",
          align: "center",
          id:"globalOprAction",

        },
        {
          title: "操作样式",
          key: "conType",
          align: "center",
          id:"globalOprStyle",
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
                    id: `test1${params.index}`
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
      totalData: 0,
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
        let finalWidth = parseInt(sideWidth) + 440;
        this.columnsWidth = (document.body.clientWidth - finalWidth) / 4;
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
          align: "center",
          render: (h, params) => {
            return h('Tooltip', {
              props: { placement: 'bottom', maxWidth: 1100, transfer: true }
            }, [
              this.maxSlice(params.row.authority),
              h('span', { slot: 'content', style: { whiteSpace: 'normal', wordBreak: 'break-all' } },
                params.row.authority)
            ])
          }
        },
        {
          title: "显示名",
          key: "displayName",
          minWidth: this.columnsWidth,
          align: "center",
          render: (h, params) => {
            return h('Tooltip', {
              props: { placement: 'bottom', maxWidth: 1100, transfer: true }
            }, [
              this.maxSlice(params.row.displayName),
              h('span', { slot: 'content', style: { whiteSpace: 'normal', wordBreak: 'break-all' } },
                params.row.displayName)
            ])
          }
        },
        {
          title: "动作",
          key: "action",
          minWidth: this.columnsWidth,
          align: "center",
          render: (h, params) => {
            return h('Tooltip', {
              props: { placement: 'bottom', maxWidth: 1100, transfer: true }
            }, [
              this.maxSlice(params.row.action),
              h('span', { slot: 'content', style: { whiteSpace: 'normal', wordBreak: 'break-all' } },
                params.row.action)
            ])
          }
        },
        {
          title: "操作样式",
          key: "conType",
          minWidth: this.columnsWidth,
          align: "center",
          render: (h, params) => {
            return h('Tooltip', {
              props: { placement: 'bottom', maxWidth: 1100, transfer: true }
            }, [
              this.maxSlice(params.row.conType),
              h('span', { slot: 'content', style: { whiteSpace: 'normal', wordBreak: 'break-all' } },
                params.row.conType)
            ])
          }
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
                  attrs:{
                    id: `editGlobalOprButton${params.index}`
                  },
                  style: {
                    marginRight: "5px"
                  },
                  on: {
                    click: () => {
                      this.show(params.row.oid, params.row.action);
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
                  attrs:{
                    id: `deleteGlobalOprButton${params.index}`
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
      this.commonTabel(0, this.selfPageSize);
    },
    commonTabel(pIndex, pSize) {

      this.operationTable = [];

      // 表格内容
      let oprParam = {
        conType: this.searchConName.trim(),
        displayName: this.searchConName.trim(),
        name: this.searchConName.trim()
      }
      getGlobalOperation(oprParam, pIndex, pSize, true).then(response => {

          this.$Spin.hide();
          let res = response.data;
          if (response.success) {
            this.totalData = res.pageInfo.totalCount;
            if(res.pageInfo.totalCount > 0) {
                this.operationTable = res.data;
            }
          } else {
            this.$Message.warning(response.message);
          }

      }).catch(e => {
        this.$Spin.hide();
        console.log(e);
      });
    },
    // 编辑操作弹窗信息
    show(indexId, action) {
      if(action == 'global_implement'){
        this.$refs.opr_dialog.editBindGlobalQuick(indexId);
      }else{
        this.$refs.opr_dialog.editBindQuick(indexId);
      }
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
        self.commonTabel(0, self.selfPageSize);
      }, 500);
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
      this.commonTabel(0, this.selfPageSize)
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
      this.commonTabel(value - 1, this.selfPageSize)
    },

    changeUserPageSize(size) {
      this.selfPageSize = size;
      this.commonTabel(0, size);
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
    },

    maxSlice(v) {
      if (v !== null && v !== '' && v != undefined) {
        if(v === false || v === true) v = v + '';
        return v.length > 18 ? v.slice(0, 18) + "..." : v
      }
    },
  },
  created() {
    this.resetColumnsWidth();
    this.$store = this.store;
    this.initData();
  }
};
</script>
