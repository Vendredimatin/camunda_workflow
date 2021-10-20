<template>
    <div>
        <Row>
            <Col span="24">
                <Card>
                    <p slot="title">
                        <Icon type="ios-keypad"></Icon>
                         租户管理
                    </p>
                    <Row>
                        <Button type="primary" style="float:left; margin: 5px;" @click="onClickAddTenantButton('addTenantFormModel')">新增</Button>
                        <Button type="primary" style="float:left; margin: 5px;" :disabled="currentData === undefined" @click="onClickEditTenantButton()">编辑</Button>
                        <Button type="error" style="float:left; margin: 5px;" :disabled="currentData === undefined" @click="onClickDelTenantButton()">删除</Button>

                        <Button type="primary" style="float:left; margin: 5px 5px 5px 15px;" :disabled="currentData === undefined" @click="onClickEditUsersButton()">指定租户所含用户</Button>
                    </Row>
                    <div class="edittable-table-height-con margin-top-10">
                        <Table border :columns="columns" :data="currentTable" @on-row-click="selectRow" stripe highlight-row></Table>
                    </div>
                     <!--新增操作 -->
                    <Modal
                        v-model="showAddTenantModal"
                        title="新增租户"
                        @on-ok="onOkClick('addTenantFormModel')"
                        @on-cancel="cancel">
                        <Form ref="addTenantFormModel" :model="addTenantFormModel" :rules="tenantInfoRule" :label-width="150">
                            <FormItem label="租户唯一标识" prop="tenantName">
                                <Input v-model="addTenantFormModel.tenantName" placeholder="租户唯一标识，英文和数字"></Input>
                            </FormItem>
                            <FormItem label="备注" prop="note">
                                <Input v-model="addTenantFormModel.note" placeholder="请输入租户信息备注"></Input>
                            </FormItem>
                          <FormItem label="Schema名" prop="schemaName">
                            <Input v-model="addTenantFormModel.schemaName" placeholder="Schema名"></Input>
                          </FormItem>
                        </Form>
                    </Modal>
                    <!-- 新增操作ending -->

                    <!-- 编辑操作 -->
                    <Modal
                        v-model="showEditTenantModal"
                        title="修改租户信息"
                        width="650"
                        @on-ok="confirmFix('editTenantFormModel')"
                        @on-cancel="cancel">
                        <Form ref="editTenantFormModel" :model="editTenantFormModel" :rules="tenantInfoRule" :label-width="150">
                            <FormItem label="租户唯一标识" prop="tenantName">
                              <Input v-model="editTenantFormModel.tenantName" placeholder="租户唯一标识，英文和数字"></Input>
                            </FormItem>
                            <FormItem label="备注" prop="note">
                              <Input v-model="editTenantFormModel.note" placeholder="请输入租户信息备注"></Input>
                            </FormItem>
                            <FormItem label="Schema名" prop="schemaName">
                              <Input v-model="editTenantFormModel.schemaName" placeholder="Schema名"></Input>
                            </FormItem>
                        </Form>
                    </Modal>
                    <!-- 编辑操作ending -->

                    <!-- 删除操作 -->
                    <Modal
                        v-model="showDelModal"
                        title="重要提示"
                        @on-ok="beDel"
                        @on-cancel="cancel">
                        <p>确定要删除租户信息吗（出于数据安全起见，数据库中的schema并不会删除）</p>
                    </Modal>
                    <!-- 删除操作ending -->

                    <!-- 编辑用户 -->
                    <Modal
                      v-model="showEditUsersModal" title="编辑用户列表" @on-ok="doEditUsersList" @on-cancel="cancel" :scrollable="true">
                      <Table border ref="selection" :columns="userColumns" :data="userListData" @on-selection-change="onUserSelectionChange"
                             height="500"></Table>
                    </Modal>
                    <!-- 编辑用户 -->
                </Card>
            </Col>
        </Row>
    </div>
</template>

<script>
  import axios from "../../libs/axios";
import { getAllUsers } from "@/api/others.js";

  export default {
  name: "tenant-management",
  components: {
    editor: require("vue2-ace-editor")
  },
  data() {
    const validateEname = (rule, value, callback) => {
        if (!value || value === '') {
            callback(new Error('英文名不能为空'));
        } else {
            const reg = new RegExp("^[_A-Za-z0-9]*$");
            let flag = reg.test(value);
            if(!flag){
              callback(new Error('英文名只能包含字母和数字哦～'));
            } else {
              callback();
            }
        }
    };

    const validateSchemaName = (rule, value, callback) => {
      if (!value || value === '') {
        callback(new Error('Schema名不能为空'));
      } else {
        const reg = new RegExp("^[a-z0-9_]*$");
        let flag = reg.test(value);
        if(!flag){
          callback(new Error('Schema名只能包含小写字母和数字和下划线'));
        } else {
          callback();
        }
      }
    };
    return {
      selectedUserIds: [],
      deletingTenantName : "",
      showAddTenantModal: false,
      showEditTenantModal: false,
      showEditUsersModal : false,
      showDelModal: false,
      addTenantFormModel: {
        tenantName: "",
        note: "",
        schemaName: ""
      },
      editTenantFormModel:{
        tenantName: "",
        note: "",
        schemaName: ""
      },
      tenantInfoRule: {
        tenantName: [
          { required: true, message: "英文名不能为空哦～", trigger: "blur" },
          { validator: validateEname, trigger: 'blur' }
        ],
        note: [
          { required: true, message: "备注不能为空哦～", trigger: "blur" }
        ],
        schemaName: [
          { required: true, message: "Schema名不能为空哦～", trigger: "blur" },
          { validator: validateSchemaName, trigger: 'blur' }
        ]
      },
      columns: [
        {
          title: "序号",
          type: "index",
          width: 80,
          align: "center"
        },
        {
          title: "租户唯一标识",
          key: "tenantName"
        },
        {
          title: "备注",
          key: "note"
        },
        {
          title: "Schema名",
          key: "schemaName"
        },
        {
          title: "操作",
          key: "action",
          align: "center",
          render: (h, params) => {
            return h("div", [
              h(
                "Button",
                {
                  props: this.schemaButtonProps(params.row),
                  on: {
                    click: () => {
                      this.onClickSchemaButton(params.row);
                    }
                  }
                },
                this.schemaButtonCaption(params)
              )
            ]);
          }
        }
      ],
      tenantsData: [],
      currentTable: [],
      totalDataNumber: 10,
      currentPage: 1,
      currentData: undefined,
      userColumns:[
          {
            type: 'selection',
            width: 60,
            align: 'center'
          },
          {
            title: "英文名",
            align: "center",
            key: "name"
          },
          {
            title: "显示名",
            align: "center",
            key: "displayName"
          },
          {
            title: "备注",
            align: "center",
            key: "comment"
          }
        ],
      userListData:[]


    };
  },
  methods: {

    onUserSelectionChange(selection){
      this.selectedUserIds = [];
      selection.forEach(item => {
        this.selectedUserIds.push(item.oid);
      })
    },

    selectRow(rowData){
      this.currentData = rowData;
    },
    loadTenantList(){
      axios
        .get(`tenants`)
        .then(response => {
          this.$Spin.hide();
          let res = response.data;
          if (res.success) {
            this.tenantsData = [];
            if (res.data.length > 0) {
              this.totalDataNumber = res.data.length;
              res.data.forEach((val, index, val_arr) => {
                let eachU = {
                  id: val.id,
                  tenantName: val.tenantName,
                  note: val.note,
                  schemaName: val.schemaName,
                  schemaState: val.schemaState
                };
                this.tenantsData.push(eachU);
              });
            }
            this.currentTable = this.tenantsData;
            this.currentData = undefined;
          } else {
            const title = "提示";
            const content = "<p>服务器繁忙, 请稍后再试</p>";
            this.$Modal.warning({
              title: title,
              content: content
            });
          }
        })
        .catch(e => {
          console.log(e);
        });
    },

    loadUserList(){
      // axios
      //   .get(`org/users`)
      getAllUsers()
        .then(response => {
          let res = response.data;
          if (res.success) {
            this.userListData = res.data;
          } else {
            const title = "提示";
            const content = "<p>服务器繁忙, 请稍后再试</p>";
            this.$Modal.warning({
              title: title,
              content: content
            });
          }
        })
        .catch(e => {
          console.log(e);
        });
    },

    schemaButtonProps(currentTenant){
      if(currentTenant.schemaState == 0) return { type : "warning", size: "middle" };
      if(currentTenant.schemaState == 1) return { type : "success", size: "middle" };
      if(currentTenant.schemaState == 2) return { type : "success", disabled : true };
    },

    schemaButtonCaption(params){
      if(params.row.schemaState == 0) return "初始化Schema";
      if(params.row.schemaState == 1) return "升级Schema";
      if(params.row.schemaState == 2) return "Schema已为最新";
    },

    editorInit() {
      require("brace/ext/language_tools"); //language extension prerequsite...
      require("brace/mode/html");
      require("brace/mode/javascript"); //language
      require("brace/mode/less");
      require("brace/theme/chrome");
      require("brace/snippets/javascript"); //snippet
    },
    // 删除租户信息
    beDel() {
      axios
        .post('tenants-delete/' + this.deletingTenantName)
        .then(response => {
          this.$Spin.hide();
          let res = response.data;
          if (res.success) {
            this.$Message.info("删除租户成功");
            this.loadTenantList();
          } else {
            const title = "提示";
            const content = "<p>服务器繁忙, 请稍后再试</p>";
            this.$Modal.warning({
              title: title,
              content: content
            });
          }
        })
        .catch(e => {
          console.log(e);
        });
    },
    // 新增操作
    onClickAddTenantButton(name) {
      this.showAddTenantModal = true;
      this.$refs[name].resetFields();
    },

    onClickEditTenantButton(){
      this.showEditTenantModal = true;
      this.editTenantFormModel = this.currentData;
    },

    onClickDelTenantButton(){
      this.showDelModal = true;
      this.deletingTenantName = this.currentData.tenantName;
    },

    onClickEditUsersButton(){
      this.$refs.selection.selectAll(false);
      axios
        .get(`tenants/` + this.currentData.id  + `/users`)
        .then(response => {
          let res = response.data;
          if (res.success) {
            let userlist = res.data;
            // 将userListData转化为userIdSet
            let userIdSet = new Set();
            for(let i=0;i<userlist.length;i++){
              userIdSet.add(userlist[i].oid);
            }
            // 默认勾选上那些已经加入了的用户
            this.userListData.forEach((user, i) => {
              if(userIdSet.has(user.oid)){
                this.$refs.selection.toggleSelect(i);
              }
            })
            console.log(this.userListData);
            this.showEditUsersModal = true;
          } else {
            const title = "提示";
            const content = "<p>服务器繁忙, 请稍后再试</p>";
            this.$Modal.warning({
              title: title,
              content: content
            });
          }
        })
        .catch(e => {
          console.log(e);
        });
    },

    // 点击确定键，新增租户信息
    onOkClick(name) {
      var _self = this;
      this.$refs[name].validate(valid => {
        if (valid) {
          axios
            .post(`tenants-create`,  {
                tenantName : this.addTenantFormModel.tenantName,
                note : this.addTenantFormModel.note,
                schemaName : this.addTenantFormModel.schemaName
              })
            .then(response => {
              this.$Spin.hide();
              let res = response.data;
              if (res.success) {
                this.$Message.info("新增租户成功");
                this.loadTenantList();
              } else {
                const title = "提示";
                const content = "<p>服务器繁忙, 请稍后再试</p>";
                this.$Modal.warning({
                  title: title,
                  content: content
                });
              }
            }).catch(e => {
              console.log(e);
            });
        } else {
          this.$Message.error({
            content: "租户信息格式有误",
            onClose: function() {
              _self.showAddTenantModal = true;
            }
          });
        }
      });
    },
    // 修改操作
    confirmFix(name) {
      var _self = this;
      this.$refs[name].validate(valid => {
        if (valid) {
          axios
            .post(`tenants-update`,  {
              id : this.editTenantFormModel.id,
              tenantName : this.editTenantFormModel.tenantName,
              note : this.editTenantFormModel.note,
              schemaName : this.editTenantFormModel.schemaName
            })
            .then(response => {
              this.$Spin.hide();
              let res = response.data;
              if (res.success) {
                this.$Message.info("修改租户成功");
                this.loadTenantList();
              } else {
                const title = "提示";
                const content = "<p>服务器繁忙, 请稍后再试</p>";
                this.$Modal.warning({
                  title: title,
                  content: content
                });
              }
            })
            .catch(e => {
              console.log(e);
            });
        } else {
          this.$Message.error({
            content: "租户信息格式有误",
            onClose: function() {
              _self.showEditTenantModal = true;
            }
          });
        }
      });

    },

    onClickSchemaButton(currentTenant){
      if(currentTenant.schemaState == 0){            // 初始化 schema
         this.callInitSchemaApi(currentTenant);
      }else if(currentTenant.schemaState == 1){      // 升级 schema
         this.callSyncSchemaApi(currentTenant);
      }
    },

    callInitSchemaApi(currentTenant){
          this.$Spin.show();
          axios
            .post('tenants/' + currentTenant.tenantName + '/schema-init')
            .then(response => {
              this.$Spin.hide();
              let res = response.data;
              if (res.success) {
                this.$Message.info("初始化schema成功");
                this.loadTenantList();
              } else {
                const title = "提示";
                const content = "<p>服务器繁忙, 请稍后再试</p>";
                this.$Modal.warning({
                  title: title,
                  content: content
                });
              }
            })
            .catch(e => {
              console.log(e);
              this.$Spin.hide();
            });
    },

    callSyncSchemaApi(currentTenant){
      this.$Spin.show();
      axios
        .post('tenants/' + currentTenant.tenantName + '/schema-sync')
        .then(response => {
          this.$Spin.hide();
          let res = response.data;
          if (res.success) {
            this.$Message.info("同步schema成功");
            this.loadTenantList();
          } else {
            const title = "提示";
            const content = "<p>服务器繁忙, 请稍后再试</p>";
            this.$Modal.warning({
              title: title,
              content: content
            });
          }
        })
        .catch(e => {
          console.log(e);
          this.$Spin.hide();
        });
    },

    doEditUsersList(){
      axios
        .post('tenants/' + this.currentData.id + '/users-edit', this.selectedUserIds)
        .then(response => {
          let res = response.data;
          if (res.success) {
            this.$Message.info("编辑用户列表成功");
          } else {
            const title = "提示";
            const content = "<p>服务器繁忙, 请稍后再试</p>";
            this.$Modal.warning({
              title: title,
              content: content
            });
          }
        })
        .catch(e => {
          console.log(e);
          this.$Spin.hide();
        });
    },

    cancel() {},
    handleChange(val, index) {
      if (
        val[val.length - 1].eName == "" ||
        val[val.length - 1].cName == "" ||
        val[val.length - 1].password == ""
      ) {
        return false;
      }
      this.$Message.success("修改了第" + (index + 1) + "行数据");
    }
  },
  created() {
    this.$Spin.show();
    this.loadTenantList();
    this.loadUserList();
  }
};
</script>

<style lang="less">
  @import "../../styles/common.less";

  .dragging-tip-enter-active{
    opacity: 1;
    transition: opacity .3s;
  }
  .dragging-tip-enter, .dragging-tip-leave-to{
    opacity: 0;
    transition: opacity .3s
  }
  .dragging-tip-con{
    display: block;
    text-align: center;
    width: 100%;
    height: 50px;
  }
  .dragging-tip-con span{
    font-size: 18px;
  }
  .record-tip-con{
    display: block;
    width: 100%;
    height: 292px;
    overflow: auto;
  }
  .record-item{
    box-sizing: content-box;
    display: block;
    overflow: hidden;
    height: 24px;
    line-height: 24px;
    padding: 8px 10px;
    border-bottom: 1px dashed gainsboro;
  }
  .record-tip-con span{
    font-size: 14px;
  }
  .edittable-test-con{
    height: 160px;
  }
  .edittable-table-height-con{
    height: 100%;
  }
  .edittable-con-1{
    box-sizing: content-box;
    padding: 15px 0 0;
    height: 196px;
  }
  .edittable-table-get-currentdata-con{
    height: 190px !important;
  }
  .exportable-table-download-con1{
    padding: 16px 0 16px 20px;
    border-bottom: 1px dashed #c3c3c3;
    margin-bottom: 16px;
  }
  .exportable-table-download-con2{
    padding-left: 20px;
  }
  .show-image{
    padding: 20px 0px;
  }
  .show-image img{
    display: block;
    width: 100%;
    height: auto;
  }
  .searchable-table{
    &-con1{
      height: 230px !important;
    }
  }

</style>
