<style lang="less">
@import "../../styles/common.less";
@import "./components/table.less";
</style>

<template>
    <div>
        <Row>
            <Col span="24">
                <Card>
                    <p slot="title">
                        <Icon type="ios-keypad"></Icon>
                         系统操作清单
                    </p>
                    <Row>
                        <Input v-model="searchConName" icon="md-search" @on-change="handleSearch" placeholder="请输入操作名搜索..." style="width: 200px" />
                        <Button type="primary" style="float:right;" @click="addOperation('formOperation')">新增</Button>
                    </Row>
                    <div class="edittable-table-height-con margin-top-10">
                        <Table border :columns="columnsOperation" :data="currentTable"></Table>
                        <div style="margin: 10px;overflow: hidden">
                            <div style="float: right;" v-show="isSearch">
                                <Page :total="totalData" :current.sync="currentPage" :page-size="10" @on-change="changePage" show-total></Page>
                            </div>
                        </div>
                    </div>
                    <!-- 新增操作 -->
                    <Modal
                        v-model="addOperationModal"
                        title="新增系统操作"
                        width="50%"
                        @on-ok="ok('formOperation')"
                        @on-cancel="cancel">
                        <Form ref="formOperation" :model="formOperation" :rules="ruleOperation" :label-width="80">
                            <FormItem label="英文名" prop="ename">
                                <Input v-model="formOperation.ename" placeholder="请输入操作英文名" @on-blur="checkCname('formOperation')"></Input>
                                <span v-show="cnameExist" style="font-size: 12px;color: red;">* 该名称已存在!</span>
                            </FormItem>
                            <FormItem label="显示名" prop="cname">
                                <Input v-model="formOperation.cname" placeholder="请输入显示名"></Input>
                            </FormItem>
                            <FormItem label="实现方式">
                              <RadioGroup v-model="formOperation.radio" @on-change="chooseWay">
                                <Radio label="插件调用" :disabled="nonePlug">插件调用</Radio>
                                <Radio label="后端脚本">后端脚本</Radio>
                                <Radio label="前端脚本">前端脚本</Radio>
                                <Radio label="存储过程">存储过程</Radio>
                                <Radio label="插件别名">插件别名</Radio>
                              </RadioGroup>
                            </FormItem>
                            <FormItem label="脚本内容" v-show="formOperation.radio == '插件调用'">
                                <Select v-model="formOperation.plugPath" filterable>
                                    <Option v-for="item in plugList" :value="item.value" :key="item.value">{{ item.label }}</Option>
                                </Select>
                            </FormItem>
                            <Row v-show="formOperation.radio != '插件调用'">
                                <Col span="20">
                                    <FormItem label="脚本内容">
                                        <editor v-model="formOperation.content" @init="editorInit" lang="javascript" theme="chrome" width="85%" height="200"></editor>
                                    </FormItem>
                                </Col>
                                <Col span="2" offset="1">
                                    <Button shape="circle" type="default" icon="ios-expand" @click="changeBigSize('formOperation')"></Button>
                                </Col>
                            </Row>
                        </Form>
                    </Modal>
                    <!-- 新增操作ending -->

                    <!-- 编辑操作 -->
                    <Modal
                        v-model="editOperationModal"
                        title="修改系统操作"
                        width="50%"
                        @on-ok="confirmFix('fixOperation')"
                        @on-cancel="cancel">
                        <Form ref="fixOperation" :model="fixOperation" :rules="ruleFix" :label-width="80">
                            <FormItem label="显示名" prop="cname">
                                <Input v-model="fixOperation.cname" placeholder="请输入显示名"></Input>
                            </FormItem>
                            <FormItem label="实现方式">
                              <RadioGroup v-model="fixOperation.radio" @on-change="chooseWay">
                                <Radio label="插件调用" :disabled="nonePlug">插件调用</Radio>
                                <Radio label="后端脚本">后端脚本</Radio>
                                <Radio label="前端脚本">前端脚本</Radio>
                                <Radio label="存储过程">存储过程</Radio>
                                <Radio label="插件别名">插件别名</Radio>
                              </RadioGroup>
                            </FormItem>
                            <FormItem label="脚本内容" v-show="fixOperation.radio == '插件调用'">
                                <Select v-model="fixOperation.plugPath" filterable>
                                    <Option v-for="item in plugList" :value="item.value" :key="item.value">{{ item.label }}</Option>
                                </Select>
                            </FormItem>
                            <Row v-show="fixOperation.radio != '插件调用'">
                                <Col span="20">
                                    <FormItem label="脚本内容">
                                        <editor v-model="fixOperation.content" @init="editorInit" lang="javascript" theme="chrome" width="85%" height="200"></editor>
                                    </FormItem>
                                </Col>
                                <Col span="2" offset="1">
                                    <Button shape="circle" type="default" icon="ios-expand" @click="changeBigSize('fixOperation')"></Button>
                                </Col>
                            </Row>
                        </Form>
                    </Modal>
                    <!-- 编辑操作ending -->

                    <!-- 删除操作 -->
                    <Modal
                        v-model="delModal"
                        title="重要提示"
                        @on-ok="beDel"
                        @on-cancel="cancel">
                        <p>删除系统操作, 可能导致相关绑定类无法正常实现功能</p>
                        <p>您是否仍要进行删除操作?</p>
                    </Modal>
                    <!-- 删除操作ending -->
                </Card>
            </Col>
        </Row>
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
  addNewOperation,
  getSystemOperations,
  fixOperation,
  delOperation,
  checkCnameEvent,
  getPlugList
} from "../../api/others";

export default {
  name: "user-management",
  components: {
    editor: require("vue2-ace-editor")
  },
  props: ['store', 'router'],
  data() {
    const validateEname = (rule, value, callback) => {
        if (value === '') {
            callback(new Error('英文名不能为空'));
        } else {
            const reg = new RegExp("^[A-Za-z0-9]*$");
            let flag = reg.test(value);
            if(!flag){
              callback(new Error('英文名只能包含字母和数字哦～'));
            } else {
              callback();
            }
        }
    };
    return {
      nonePlug: false,
      isSearch: true,
      isFullScreen: false,
      commonScript: '',     // 公共最大化编辑器内容
      bigForm: '',
      cnameExist: false,
      addOperationModal: false,
      editOperationModal: false,
      delModal: false,
      formOperation: {
        cname: "",
        ename: "",
        radio: "插件调用",
        content: ""
      },
      fixOperation: {
        cname: "",
        radio: "插件调用",
        content: ""
      },
      ruleOperation: {
        cname: [
          { required: true, message: "显示名不能为空哦～", trigger: "blur" }
        ],
        ename: [
          { required: true, message: "英文名不能为空哦～", trigger: "blur" },
          { validator: validateEname, trigger: 'blur' }
        ]
      },
      ruleFix: {
        cname: [
          { required: true, message: "显示名不能为空哦～", trigger: "blur" }
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
          key: "className"
        },
        {
          title: "显示名",
          key: "displayName"
        },
        {
          title: "实现方式",
          key: "packagePath"
        },
        {
          title: "操作",
          key: "action",
          width: 150,
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
                  style: {
                    marginRight: "5px"
                  },
                  on: {
                    click: () => {
                      this.show(params.index);
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
                      this.remove(params.index);
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
    // 初始化表格数据获取
    initData() {
      // loading动画
      this.$Spin.show();
      // 系统操作get
      this.commomTabel();
      // 获取插件列表
      getPlugList()
        .then(response => {
          let res = response.data;
          if (!res.success) {
            // 系统插件获取失败 禁止选择插件入口方式
            this.nonePlug = true;
            this.formOperation.radio = "前端脚本";
            this.formOperation.content = "ClienScript:";
          } else {
            if (res.data.length == 0) {
              // 系统插件数量为零 禁止选择插件入口方式
              this.nonePlug = true;
              this.formOperation.radio = "前端脚本";
              this.formOperation.content = "ClienScript:";
            } else {
              this.plugData = res.data;
              res.data.forEach((val, index) => {
                let eachPlug = {
                  value: val.name,
                  label: val.name
                };
                this.plugList.push(eachPlug);
              });
            }
          }
        })
        .catch(e => {
          console.log(e);
        });
    },
    commomTabel() {
      this.operationTable = [];
      // 表格内容
      getSystemOperations()
        .then(response => {
          this.$Spin.hide();
          let res = response.data;
          if (res.success) {
            this.operationTable = [];
            if (res.data.length > 0) {
              this.totalData = res.data.length;
              res.data.forEach((val, index, val_arr) => {
                let eachU = {
                  className: val.className,
                  displayName: val.displayName,
                  packagePath: val.packagePath,
                  parentClass: val.parentClass,
                  classCategory: val.classCategory,
                  classType: val.classType,
                  id: val.id,
                  searchItem: val.className + "" + val.displayName + "" + val.className.toUpperCase() + ""  + val.className.toLowerCase()
                };
                this.operationTable.push(eachU);
              });
              // vuex缓存
              this.$store.state.operationData = this.operationTable;
              // this.currentTable = this.operationTable.slice(0, 10);
              this.currentTable = this.operationTable.slice((this.currentPage - 1) * 10, this.currentPage * 10);
              this.templateTable = this.currentTable;
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
    show(index) {
      this.editOperationModal = true;
      this.fixtargertOpe = this.currentTable[index]; // 获取当前需要修改的行数据
      this.fixOperation.content = this.fixtargertOpe.packagePath;
      let targetPath = this.currentTable[index].packagePath;
      this.fixOpeEname = this.currentTable[index].className;
      if (targetPath != undefined) {
        let firstWord = targetPath.substr(0, 1); // 获取当前路径首字母
        let judgeFlag = targetPath.indexOf(":"); // 判断脚本方式
        if (judgeFlag == -1) {
          // 插件别名
          this.fixOperation.radio = "插件别名";
        } else {
          if (firstWord == "a") {
            this.fixOperation.radio = "插件调用";
          } else if (firstWord == "S") {
            this.fixOperation.radio = "后端脚本";
          } else if (firstWord == "C") {
            this.fixOperation.radio = "前端脚本";
          } else {
            this.fixOperation.radio = "存储过程";
          }
        }
      }
      this.fixOperation.cname = this.currentTable[index].displayName;
    },
    remove(index) {
      this.delModal = true;
      this.delOpeEname = this.currentTable[index].className;
      this.delIndex = index;
    },

    chooseWay(value) {
      if (value == "后端脚本") {
        this.formOperation.content = "ServerScript:";
        this.fixOperation.content = "ServerScript:";
      } else if (value == "前端脚本") {
        this.formOperation.content = "ClientScript:";
        this.fixOperation.content = "ClientScript:";
      } else if (value == "存储过程") {
        this.formOperation.content = "procedure:";
        this.fixOperation.content = "procedure:";
      } else {
        this.formOperation.content = "";
        this.fixOperation.content = "";
      }
    },

    // 显示最大化编辑器窗口
    changeBigSize(formName) {
      this.bigForm = formName;

      if(formName == 'formOperation') {

        this.addOperationModal = false;
        this.commonScript = this.formOperation.content;

      } else {

        this.editOperationModal = false;
        this.commonScript = this.fixOperation.content;

      }

      this.isFullScreen = true;
    },

    // 最大化脚本编辑确认
    confirmScript() {
        this.isFullScreen = false;

        if(this.bigForm == 'formOperation') {

          this.formOperation.content = this.commonScript;
          this.addOperationModal = true;

        } else {

          this.fixOperation.content = this.commonScript;
          this.editOperationModal = true;

        }

    },
    // 关闭最大化脚本编辑弹窗
    cancelScript() {

        this.isFullScreen = false;

        if(this.bigForm == 'formOperation') {

          this.formOperation.content = '';
          this.addOperationModal = true;

        } else {

          this.fixOperation.content = '';
          this.editOperationModal = true;

        }

        this.commonScript = '';
    },

    // 删除操作
    beDel() {
      delOperation(this.delOpeEname)
        .then(res => {
          if (!res.success) {
            const title = "提示";
            const content = "<p>服务器繁忙, 删除失败请稍后再试～</p>";
            this.$Modal.warning({
              title: title,
              content: content
            });
          } else {
            this.$Message.success("删除成功");
            this.operationTable.splice(
              (this.currentPage - 1) * 10 + this.delIndex, 1);
            this.currentTable = this.operationTable.slice((this.currentPage - 1) * 10, this.currentPage * 10);
            this.totalData = this.operationTable.length;
            if (this.currentTable.length == 0) {
              this.currentPage = this.currentPage - 1;
              this.currentTable = this.operationTable.slice((this.currentPage - 1) * 10, this.currentPage * 10);
            }
          }
        })
        .catch(e => {
          console.log(e);
          this.router.push({ name: "error_500" });
        });
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
    // 新增操作
    addOperation(name) {
      this.addOperationModal = true;

      this.$refs[name].resetFields();
    },
    // 新增操作
    ok(name) {
      var _self = this;
      this.$refs[name].validate(valid => {
        if (valid && !this.cnameExist) {
          let finalPath;
          if (this.formOperation.radio == "插件调用") {
            finalPath = this.formOperation.plugPath;
          } else {
            finalPath = this.formOperation.content;
          }
          let newOperationParams = [
            {
              attributes: [],
              classCategory: "OperationClass",
              className: this.formOperation.ename,
              classType: "PersistentClass",
              displayName: this.formOperation.cname,
              id: "",
              isSystem: false,
              packagePath: finalPath,
              parentClass: "Operation",
              state: 0,
              zoneName: "CUS"
            }
          ];
          addNewOperation(newOperationParams)
            .then(res => {
              if (res.success) {
                // loading动画
                this.$Spin.show();
                this.commomTabel();
                this.$Message.info("新增系统操作成功");
              } else {
                this.$Message.error("服务器异常, 请稍后再试");
              }
            })
            .catch(e => {
              console.log(e);
              this.router.push({ name: "error_500" });
            });
        } else {
          this.$Message.error({
            content: "操作信息格式有误",
            onClose: function() {
              _self.addOperationModal = true;
            }
          });
        }
      });
    },
    // 修改操作
    confirmFix() {
      if (this.fixOperation.cname == "") {
        let _self = this;
        this.$Message.error({
          content: "操作信息格式有误",
          onClose: function() {
            _self.editOperationModal = true;
          }
        });
      } else {
        let finalPath;
        if (this.fixOperation.radio == "插件调用") {
          finalPath = this.fixOperation.plugPath || "";
        } else {
          finalPath = this.fixOperation.content || "";
        }
        let fixParams = {
          classCategory: this.fixtargertOpe.classCategory,
          className: this.fixtargertOpe.className,
          classType: this.fixtargertOpe.classType,
          displayName: this.fixOperation.cname,
          id: this.fixtargertOpe.id,
          isSystem: false,
          packagePath: finalPath || this.fixOperation.packagePath,
          parentClass: this.fixtargertOpe.parentClass,
          state: 0,
          zoneName: "CUS"
        };
        fixOperation(fixParams)
          .then(res => {
            if (!res.success) {
              this.$Message.error({
                content: "服务器繁忙, 修改失败请稍后再试"
              });
            } else {
              this.$Message.success({
                content: "修改成功"
              });
              this.commomTabel();
            }
          })
          .catch(e => {
            console.log(e);
            this.router.push({ name: "error_500" });
          });
      }
    },
    // 取消追加新用户
    cancel() {},
    // 中英文姓名搜素
    handleSearch() {
      let minLen = this.searchConName.length;
      if (minLen == 0) {
        this.isSearch = true;
        this.currentTable = this.operationTable.slice(0, 10);
        this.totalData = this.operationTable.length;
      } else {
        this.isSearch = false;
        this.currentTable = this.templateTable;
        this.currentTable = this.search(this.operationTable, {
          searchItem: this.searchConName
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
  },
  created() {
    this.$store = this.store;
    this.initData();
  }
};
</script>
