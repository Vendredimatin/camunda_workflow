<style lang="less">
@import "./components/table.less";
</style>

<template>
    <div>
        <Row>
            <Col span="24">
                <Card>
                    <!-- <p slot="title">
                        <Icon type="ios-keypad"></Icon>
                         用户数据信息
                    </p> -->
                    <Row>
                        <Input v-model="searchConName" icon="md-search" @on-change="handleSearch" placeholder="请输入姓名搜索..." style="width: 200px" />
                        <Button type="primary" style="float:right;" @click="addUser('formUser')">新增</Button>
                    </Row>
                    <div class="margin-top-10">
                        <can-edit-table ref="allUserInfo" v-model="allUserInfoComputed" @on-change="handleChange" @on-delete="handleDelete" :columns-list="editInlineColumns"></can-edit-table>
                    </div>
                    <Modal
                        v-model="addUserModal"
                        title="添加用户信息"
                        :mask-closable="false"
                        @on-ok="ok('formUser')"
                        @on-cancel="cancel">
                        <Form ref="formUser" :model="formUser" :rules="ruleUser" :label-width="100">
                            <FormItem label="英文名" prop="ename">
                                <Input v-model="formUser.ename" placeholder="请输入用户英文名"></Input>
                            </FormItem>
                            <FormItem label="中文名" prop="cname">
                                <Input v-model="formUser.cname" placeholder="请输入中文名"></Input>
                            </FormItem>
                            <FormItem label="密码" prop="passwd">
                                <Input type="password" v-model="formUser.passwd"></Input>
                            </FormItem>
                            <FormItem label="确认密码" prop="passwdCheck">
                                <Input type="password" v-model="formUser.passwdCheck"></Input>
                            </FormItem>
                            <FormItem label="E-mail" prop="mail">
                                <Input v-model="formUser.mail" placeholder="请输入邮箱"></Input>
                            </FormItem>
                            <FormItem label="所属用户组">
                                <Select v-model="belongGroup" filterable multiple>
                                    <Option v-for="item in groupList" :value="item.label" :key="item.value">{{ item.label }}</Option>
                                </Select>
                            </FormItem>
                            <FormItem label="备注" prop="note">
                                <Input type="text" v-model="formUser.note"></Input>
                            </FormItem>
                        </Form>
                    </Modal>
                </Card>
            </Col>
        </Row>
    </div>
</template>

<script>
import canEditTable from "./components/canEditTable.vue";
import tableData from "./components/table_data.js";
import axios from "axios"
import {
  getAllUsers,
  addNewUser,
  updateUser,
  getAllUserTree,
  addUserToGroup,
  getUserByOid
} from "../../api/others";

export default {
  name: "user-management",
  props: ["router"],
  components: {
    canEditTable
  },
  beforeDestroy() {
  },
  destroyed() {
  },
  data() {
    const validateCname = (rule, value, callback) => {
        if (value === '') {
            callback(new Error('中文名不能为空'));
        } else {
              if(value.length > 32) {
                callback(new Error('中文名不能超过32个字符哦～'));
              } else {
                callback();
              }
        }
    };
    const validateEname = (rule, value, callback) => {
        if (value === '') {
            callback(new Error('英文名不能为空'));
        } else {
            const reg = new RegExp("^[a-zA-Z][a-zA-Z0-9]*$");
            let flag = reg.test(value);
            if(!flag){
              callback(new Error('英文名要以字母开头, 并且只能包含字母和数字哦～'));
            } else {
              if(value.length > 32) {
                callback(new Error('英文名不能超过32个字符哦～'));
              } else {
                callback();
              }
            }
        }
    };
    const validatePass = (rule, value, callback) => {
        if (value === '') {
            callback(new Error('密码不能为空'));
        } else {
            if(value.length < 6 || value.length > 16){
              callback(new Error('新密码长度必须在 6-16位'));
            } else {
              if (this.formUser.passwdCheck !== '') {
                  // 对第二个密码框单独验证
                  this.$refs.formUser.validateField('passwdCheck');
              }
              callback();
            }
        }
    };
    // const validatePass = (rule, value, callback) => {
    //     if (value === '') {
    //         callback(new Error('密码不能为空'));
    //     } else {
    //         const reg = /^(?=.*[a-zA-Z])(?=.*\d)(?=.*[~!@#$%^&*()_+`\-={}:";'<>?,.\/]).{4,16}$/;
    //         let flag = reg.test(value);
    //         if(flag == false){
    //           callback(new Error('新密码必须由 4-16位字母、数字、特殊符号线组成'));
    //         } else {
    //           if (this.formUser.passwdCheck !== '') {
    //               // 对第二个密码框单独验证
    //               this.$refs.formUser.validateField('passwdCheck');
    //           }
    //           callback();
    //         }
    //     }
    // };
    const validatePassCheck = (rule, value, callback) => {
        if (value === '') {
            callback(new Error('请重新输入一遍您的密码～'));
        } else if (value !== this.formUser.passwd) {
            callback(new Error('两次密码输入不一致'));
        } else {
            callback();
        }
    };
    return {
      addUserModal: false,
      formUser: {
        cname: "",
        ename: "",
        passwd: "",
        passwdCheck: "",
        mail: "",
        note: ""
      },
      ruleUser: {
        cname: [
          { required: true, message: "中文名不能为空哦～", trigger: "blur" },
          { validator: validateCname, trigger: 'blur' }
        ],
        ename: [
          { required: true, message: "英文名不能为空哦～", trigger: "blur" },
          { validator: validateEname, trigger: 'blur' }
        ],
        mail: [
          { required: true, message: "邮箱不能为空哦～", trigger: "blur" },
          {
            pattern: /^[a-z0-9]+([._\\-]*[a-z0-9])*@([a-z0-9]+[-a-z0-9]*[a-z0-9]+.){1,63}[a-z0-9]+$/,
            message: "邮箱格式有误, 请重新填写",
            trigger: "blur"
          }
        ],
        passwd: [
          { required: true, message: "密码不能为空哦～", trigger: "blur" },
          { validator: validatePass, trigger: 'blur' }
        ],
        passwdCheck: [
          { required: true, message: "请重新输入一遍您的密码～", trigger: "blur" },
          { validator: validatePassCheck, trigger: 'blur' }
        ]
      },
      searchConName: "",
      templateTable: [], // 姓名搜素的临时表格
      editInlineColumns: [],
      allUserInfo: [],
      groupList: [],
      groupNameToOid: {},
      belongGroup: []
    };
  },
  methods: {
    // 初始化表格数据获取
    getData() {

      // 列名
      this.editInlineColumns = tableData.editInlineColumns;
      // 表格内容
      this.updateTabel();

      // 用户组列表
      getAllUserTree()
        .then(response => {
          let res = response.data;
          if (!res.success) {
            const title = "提示";
            const content = "<p>服务器繁忙, 用户组获取失败请稍后再试～</p>";
            this.$Modal.warning({
              title: title,
              content: content
            });
          } else {
            this.groupList = [];
            if (res.data.length > 0) {
              res.data.forEach((val, index, val_arr) => {
                let eachGroup = {
                  value: val.oid,
                  label: val.name
                };
                this.groupList.push(eachGroup);
                this.groupNameToOid[val.name] = val.oid;
                let deepGroup = this.getDeepTree(val.childrenGroups);
              });
            }
          }
        })
        .catch(e => {
          this.$Spin.hide();
          this.router.push({ name: "error_500" });
          console.log(e);
        });
    },

    // 递归获取全部可选择的用户组
    getDeepTree(tree = []) {
      let _self = this;
      if (!!tree && tree.length !== 0) {
        tree.forEach(item => {
          let eachGroup = {
            value: item.oid,
            label: item.name
          };
          _self.getDeepTree(item.childrenGroups);
          _self.groupList.push(eachGroup);
          _self.groupNameToOid[item.name] = item.oid;
        });
      }
      return _self.groupList;
    },

    updateTabel() {
      // loading动画
      this.$Spin.show();

      this.allUserInfo = [];
      this.templateTable = [];
      this.searchConName = '';

      // 表格内容
      getAllUsers()
        .then(response => {
          // loading动画
          this.$Spin.hide();

          let res = response.data;
          if (res.code == 200) {
            if (res.data.length > 0) {
              res.data.forEach((val, index, val_arr) => {
                let eachU = {
                  eName: val.name,
                  cName: val.displayName,
                  password: val.password || "******",
                  email: val.email || "--",
                  note: val.comment || "--",
                  oid: val.oid,
                  // attachGroup: '超级用户组',
                  searchItem: val.name + "" + val.displayName + "" + val.name.toUpperCase() + ""  + val.name.toLowerCase()
                };
                this.allUserInfo.push(eachU);
              });
              this.templateTable = this.allUserInfo;
            }
          } else {
            const title = "提示";
            const content = res.message;
            this.$Modal.warning({
              title: title,
              content: content
            });
          }
        })
        .catch(e => {
          this.$Spin.hide();
          console.log(e);
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
    // 新增用户
    addUser(name) {
      this.addUserModal = true;

      this.$refs[name].resetFields();
      this.belongGroup = [];

      // console.log(this.allUserInfo, this.templateTable);
    },
    // 追加新用户
    ok(name) {
      var _self = this;
      this.$refs[name].validate(valid => {
        if (valid) {
          // 获取Oid
          let newUserParams = [
            {
              comment: this.formUser.note,
              createTime: "",
              creator: "",
              displayName: this.formUser.cname,
              email: this.formUser.mail,
              expiredTime: "",
              isFrozen: true,
              lastModifier: "",
              lastModifyTime: "",
              name: this.formUser.ename,
              oid: "",
              password: this.formUser.passwd
            }
          ];
          addNewUser(newUserParams)
            .then(res => {
              if (res.success) {
                // 更新表格内容
                if (this.belongGroup.length == 0) {
                  this.updateTabel();
                  this.$Message.success("添加用户成功");
                } else {
                  let finalOid = res.data;
                  // 添加一个属于某些组的新用户
                  if (this.belongGroup.length > 0) {
                    let promises = [];
                    this.belongGroup.forEach((val, index, val_arr) => {
                      promises.push(addUserToGroup(this.groupNameToOid[val], finalOid));
                    });
                    axios.all(promises).then(res => {
                      let error_res = res.filter(item => !item.success);
                      if (error_res.lengh > 0) {
                        this.$Message.error(error_res[0].message);
                      } else {
                        this.updateTabel();
                      }
                    });
                  }
                  this.$Message.success("添加用户成功");
                }
                // let newUser = {
                //   eName: this.formUser.ename,
                //   cName: this.formUser.cname,
                //   password: this.formUser.passwd,
                //   email: this.formUser.mail,
                //   note: this.formUser.note || ""
                // };
                // this.allUserInfo.push(newUser);
                // this.$Message.info("添加用户成功");
              } else {
                this.$Message.error(res.message);
              }
            })
            .catch(e => {
              console.log(e);
            });
        } else {
          this.$Message.error({
            content: "用户信息格式有误",
            onClose: function() {
              _self.addUserModal = true;
            }
          });
        }
      });
    },

    // 取消追加新用户
    cancel() {},

    // 中英文姓名搜素
    handleSearch() {
        this.allUserInfo = this.templateTable;
        this.allUserInfo = this.search(this.allUserInfo, {
          searchItem: this.searchConName
        });
    },

    handleDelete() {
      this.searchConName = "";
      this.updateTabel();
    },

    // 编辑
    handleChange(val, index) {
      if (val[index].eName == "" || val[index].cName == "" || val[index].password == "" || val[index].email == "") {
        this.$Message.error("修改数据不能为空哦");
        this.allUserInfo[index].eName = sessionStorage.getItem("uEname");
        this.allUserInfo[index].cName = sessionStorage.getItem("uCname");
        this.allUserInfo[index].email = sessionStorage.getItem("uEmail");
        this.allUserInfo[index].password = sessionStorage.getItem("uPwd");
        this.allUserInfo[index].note = sessionStorage.getItem("uNote");
      } else {
        let str = val[index].eName;
        let hasC;
        for(var i = 0;i < str.length; i++){
          if(str.charCodeAt(i) > 255) {
            hasC = true;
          }
        }
        const pwReg = /^(?=.*[a-zA-Z])(?=.*\d)(?=.*[~!@#$%^&*()_+`\-={}:";'<>?,.\/]).{4,16}$/;
        let flagPwd = pwReg.test(val[index].password);
        const mailReg = /^[a-z0-9]+([._\\-]*[a-z0-9])*@([a-z0-9]+[-a-z0-9]*[a-z0-9]+.){1,63}[a-z0-9]+$/;
        let flagEmail = mailReg.test(val[index].email);
        if(hasC) {
          this.$Message.error('请重新编辑, 英文名不能包含中文哦～');
          // this.allUserInfo[index].eName = sessionStorage.getItem("uEname");
          this.updateTabel();
        } else if(val[index].password != '******' && (val[index].password.length < 6 || val[index].password.length > 16)) {
          this.$Message.error("新密码长度必须在 6-16位");
          this.updateTabel();
        } else if(!flagEmail) {
          this.$Message.error("请重新编辑, 并填写合法的邮箱格式");
          // this.allUserInfo[index].email = sessionStorage.getItem("uEmail");
          this.updateTabel();
        } else {

          let updateUserParams = {
            comment: val[index].note || "",
            displayName: val[index].cName.split(' ').join('') || "",
            email: val[index].email.split(' ').join('') || "",
            name: val[index].eName.split(' ').join('') || "",
            oid: val[index].oid,
            password: val[index].password === "******" ? undefined : val[index].password
          };
          updateUser(updateUserParams).then(res => {
              if (!res.success) {
                this.$Message.error("服务器异常, 修改第" + (index + 1) + "行数据失败");
              } else {
                this.updateRow(index);
                this.searchConName = "";
                this.updateTabel();
                this.$Message.success("修改第" + (index + 1) + "行数据成功");
              }
          }).catch(e => {
            console.log(e);
          });

        }
      }
    },

    updateRow(index) {
      // loading动画
      this.$Spin.show();

      this.templateTable = [];
      this.searchConName = '';
      getUserByOid(this.allUserInfo[index].oid)
        .then(response => {
          // loading动画
          this.$Spin.hide();
          let res = response.data;
          if (!res.success) {
            const title = "提示";
            const content = res.message;
            this.$Modal.warning({
              title: title,
              content: content
            });
          } else {
            if (res.data !== undefined) {
              let val = res.data;
              this.allUserInfo[index] = {
                eName: val.name,
                cName: val.displayName,
                password: "******",
                email: val.email || "--",
                note: val.comment || "--",
                oid: val.oid,
                // attachGroup: '超级用户组',
                searchItem: val.name + "" + val.displayName + "" + val.name.toUpperCase() + ""  + val.name.toLowerCase()
              };
              this.templateTable = this.allUserInfo;
              this.$refs["allUserInfo"].init();
            }
          }
        })
    }
  },

  created() {
    this.getData();
    sessionStorage.setItem("isDel", false);
  },

  watch: {
    // allUserInfo(newV, oldV) {
    //   this.templateTable = newV;
    // }
  },
  computed:{
    allUserInfoComputed(){
      return this.allUserInfo.sort((a, b) => {
        return a.eName.localeCompare(b.eName,"en")
      })
    }
  },

};
</script>

<style scoped>
/* .ivu-table-overflowX {
    overflow-x: hidden !important;
  } */
</style>
<style>
  .edittable-table-height-con {
    height: 522px;
    overflow-y: auto;
  }
  @media screen and (max-width: 1330px) {
    .edittable-table-height-con {
      height: 474px;
    }
  }
  /* .ivu-table-overflowX {
    overflow-x: hidden;
  } */
  /* .ivu-table-overflowY {
    overflow-y: auto;
  }
  .ivu-table-body.ivu-table-overflowY.ivu-table-overflowX {
    height: auto !important;
  } */
</style>
