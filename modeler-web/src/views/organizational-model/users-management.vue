<template>
    <div>
        <Row>
            <Col span="24">
                <Card>
                    <!-- <p slot="title">
                        <Icon type="ios-keypad"></Icon>
                         用户组信息
                    </p> -->
                    <Row class="margin-bottom-10">
                      <Col span="11">  
                      <Button type="warning" @click="showNewGroup" id="createTopGroupButton" :disabled="addRootGroup">新增顶层用户组</Button>
                      <Input v-model="searchUserName" icon="md-search" @on-change="handleSearchUser" placeholder="请输入..." id="searchUserNameInput" style="width: 200px;float: right;" />
                        <!-- <Button shape="circle" icon="ios-refresh" @click="freshUsers" style="float: right;"></Button> -->
                      </Col>
                    </Row>
                    <Row>
                        <Col ref="viewTable" span="11" style="overflow-x:hidden;overflow: auto;" :style="{height: tableHeights}">
                            <Tree v-for="item in pagedData" :data="item" :render="renderContent" id="groupTree"></Tree>
                            <p v-show="this.treeList.length == 0">暂无用户组</p>
                        </Col>
                        <Col v-show="isHasUser" span="11" offset="2">
                          <Card class="userCard">
                              <p slot="title" style="height: 35px;">
                                  <Row style="height: 35px;">
                                    <Col span="12" style="height: 35px;line-height: 35px;">
                                      <Icon type="ios-information-circle" style="float: left;margin-top: 11px;"></Icon>
                                      <span style="float: left;max-width:110px;overflow: hidden;text-overflow:ellipsis;white-space: nowrap;">{{ targetGroupName }}</span>
                                      <span>下所属用户</span>
                                    </Col>
                                    <Col span="12" style="height: 35px;line-height: 35px;">
                                      <Button shape="circle" icon="md-close" :size="'small'" style="float: right; cursor: pointer;" @click="isHasUser = false"></Button>
                                      <Button type="primary" style="float: right;margin-right: 30px;" @click="addUserToTarget" id="createUserToGroupButton">添加用户到当前组</Button>
                                    </Col>
                                  </Row>
                              </p>
                              <ul v-show="this.allUserList.length != 0" ref="userRight"  :style="{height: cardHeights}" style="overflow-y: auto;" id="userTree">
                                  <li v-for="(item, index) in allUserList" style="margin-bottom: 10px;">
                                      <span>
                                        <Icon type="ios-person"></Icon> {{ item.displayName }}
                                        <span> | </span>{{ item.name }}
                                        <Button icon="md-remove" :size="buttonSize" style="margin-left: 10px;" @click="delTargetUser(item)" ></Button>
                                      </span>
                                  </li>
                              </ul>
                              <p v-show="this.allUserList.length == 0">暂无用户</p>
                              <Spin size="large" fix v-if="loadUsers"></Spin>
                          </Card>
                        </Col>
                    </Row>
                    <Row style="margin: 20px 0;text-align: right;">
                        <Col span="10">
                          <Page
                          size="small"
                          show-sizer
                          show-elevator
                          show-total
                          placement="top"
                          :page-size-opts="pageSizeOpts"
                          :pageSize="pageSize"
                          :total="treeList.length"
                          :current="pageIndex"
                          @on-change="changePage"
                          @on-page-size-change="changePageSize"></Page>
                        </Col>
                    </Row>
                    <!-- 向已有用户组中添加新用户组 -->
                    <Modal
                        v-model="addModal"
                        :mask-closable="false"
                        id="createGroupModal"
                        title="添加新用户组">
                        <Form ref="formCustom" :model="formCustom" :rules="ruleCustom" :label-width="120">
                            <FormItem label="用户组名" prop="name">
                                <Input v-model="formCustom.name" placeholder="请输入用户组名"></Input>
                            </FormItem>
                            <FormItem label="用户组显示名" prop="displayName">
                                <Input v-model="formCustom.displayName" placeholder="请输入用户组显示名"></Input>
                            </FormItem>
                            <FormItem label="备注" prop="note">
                                <Input v-model="formCustom.note" placeholder="请输入用户组备注"></Input>
                            </FormItem>
                        </Form>
                        <div slot="footer">
                          <Button type="text" @click="cancel('formCustom')">取消</Button>
                          <Button type="primary" @click="ok('formCustom')" id="confirmCreateGroupButton">确认</Button>
                        </div>
                    </Modal>

                    <!-- 向已有用户组添加用户 -->
                    <Modal
                        v-model="addUserToGroupModal"
                        title="添加新用户"
                        id="createUserToGroupModal"
                        @on-visible-change="cancelUserModal"
                        :mask-closable="false"
                        >
                        <Tabs :value="targetTab" @on-click="chooseTab">
                            <TabPane label="选择已有用户并添加" name="oldUser">
                              <Form ref="formOldUser" :model="formOldUser" :label-width="120">
                                <FormItem label="选择用户名" prop="oldNameArr" style="height: 200px;">
                                    <Select v-model="formOldUser.oldNameArr"
                                    ref="userSelect"
                                    filterable
                                    multiple
                                    remote
                                    @on-query-change="changeRemote"
                                    :remote-method="remoteUser"
                                    :loading="remoteLoadingUser">
                                    <Tooltip  class="old_user_tooltip" v-for="item in remoteUserArr" max-width="300" :content="`${item.label.split('|')[0]}|${item.label.split('|')[1]}`">
                                        <Option :value="item.value" :key="item.value" :label="item.label">
                                          <p class="old_user_option">
                                            <span>{{ item.label.split("|")[0] }}</span>
                                            <span>|</span>
                                            <span>{{ item.label.split("|")[1] }}</span>
                                          </p>
                                        </Option>
                                      </Tooltip>
                                    </Select>
                                    <!-- <AutoComplete
                                        v-model="formOldUser.oldName"
                                        :data="autoUserName"
                                        @on-search="chooseUser"
                                        :filter-method="filterMethod"
                                        placeholder="查找用户">
                                    </AutoComplete> -->
                                </FormItem>
                              </Form>
                            </TabPane>
                            <TabPane label="创建新用户并添加" name="newUser">
                              <Form ref="formUser" :model="formUser" :rules="ruleUser" :label-width="120">
                                <FormItem label="用户名" prop="name">
                                    <Input v-model="formUser.name" placeholder="请输入用户名"></Input>
                                </FormItem>
                                <FormItem label="用户显示名" prop="cname">
                                    <Input v-model="formUser.cname" placeholder="请输入显示名"></Input>
                                </FormItem>
                                <FormItem label="密码" prop="passwd">
                                    <Input type="password" v-model="formUser.passwd"></Input>
                                </FormItem>
                                <FormItem label="确认密码" prop="passwdCheck">
                                    <Input type="password" v-model="formUser.passwdCheck"></Input>
                                </FormItem>
                                <FormItem label="邮箱" prop="mail">
                                    <Input v-model="formUser.mail" placeholder="请输入用户邮箱"></Input>
                                </FormItem>
                                <FormItem label="备注" prop="note">
                                    <Input type="text" v-model="formUser.note"></Input>
                                </FormItem>
                              </Form>
                            </TabPane>
                        </Tabs>
                        <div slot="footer">
                          <Button type="text" @click="cancelAddUser">取消</Button>
                          <Button type="primary" @click="addUserToG" id="confirmCreateUserToGroupButton">确认</Button>
                        </div>
                    </Modal>

                    <!-- 添加新独立用户组 -->
                    <Modal
                      v-model="addNewModal"
                      id="createTopGroupModal"
                      title="添加用户组信息"
                      :mask-closable="false">
                      <Form ref="independentGroup" :model="independentGroup" :rules="ruleNew" :label-width="120">
                          <FormItem label="用户组名" prop="name">
                              <Input v-model.trim="independentGroup.name" placeholder="请输入用户组名" id="createTopGroupModalName"></Input>
                          </FormItem>
                          <FormItem label="用户组显示名" prop="displayName">
                                <Input v-model="independentGroup.displayName" placeholder="请输入用户组显示名" id="createTopGroupModalDisplayName"></Input>
                            </FormItem>
                          <FormItem label="备注" prop="note">
                              <Input v-model="independentGroup.note" placeholder="请输入用户组备注" :maxlength="200" id="createTopGroupModalNote"></Input>
                          </FormItem>
                      </Form>
                      <div slot="footer">
                        <Button type="text" @click="cancel('independentGroup')" id="cancelCreateTopGroupButton">取消</Button>
                        <Button type="primary" @click="addNewEvent('independentGroup')" id="confirmCreateTopGroupButton">确认</Button>
                      </div>
                  </Modal>

                   <!-- 编辑用户组 -->
                    <Modal
                        v-model="editModal"
                        :mask-closable="false"
                        id="editGroupModal"
                        title="编辑用户组">
                        <Form ref="editFormCustom" :model="editFormCustom" :rules="ruleEditCustom" :label-width="120">
                            <FormItem label="用户组名" prop="name">
                                <Input v-model="editFormCustom.name" disabled placeholder="请输入用户组名"></Input>
                            </FormItem>
                            <FormItem label="用户组显示名" prop="displayName">
                                <Input v-model="editFormCustom.displayName" placeholder="请输入用户组显示名" id="editGroupModalDisplayName"></Input>
                            </FormItem>
                            <FormItem label="备注" prop="note">
                                <Input v-model="editFormCustom.note" placeholder="请输入用户组备注" id="editGroupModalNote"></Input>
                            </FormItem>
                        </Form>
                        <div slot="footer">
                          <Button type="text" @click="cancel('editFormCustom')" id="cancelEditGroupButton">取消</Button>
                          <Button type="primary" @click="editGroup" id="confirmEditGroupButton">确认</Button>
                        </div>
                    </Modal>

                  <!-- 删除用户组 -->
                  <Modal
                      v-model="delModal"
                      id="delModal"
                      title="删除用户组"
                      :mask-closable="false"
                      @on-ok="delEvent"
                      @on-cancel="cancel">
                      <p>是否确定删除当前操作的用户组</p>
                  </Modal>

                </Card>
            </Col>
        </Row>
    </div>
</template>

<script>
import {tableMixin} from "@/component/tableMixin"
import {
  getAllUserTree,
  getAllUsers,
  getUserFromGroup,
  groupAddNewGroup,
  groupAddUser,
  delGroup,
  updateGroup,
  delUser,
  addUserToGroup,
  addNewUser,
  delUserFromGroup,
  getSearchGroupsTree
} from "../../api/others";
export default {
  name: "users-management",
  components: {},
  mixins: [tableMixin],
  data() {
    const validatePass = (rule, value, callback) => {
        if (value === '') {
            callback(new Error('密码不能为空'));
        } else {
            // const reg = /^(?=.*[a-zA-Z])(?=.*\d)(?=.*[~!@#$%^&*()_+`\-={}:";'<>?,.\/]).{4,16}$/;
            // let flag = reg.test(value);
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
    const validatePassCheck = (rule, value, callback) => {
        if (value === '') {
            callback(new Error('请重新输入一遍您的密码～'));
        } else if (value !== this.formUser.passwd) {
            callback(new Error('两次密码输入不一致'));
        } else {
            callback();
        }
    };
    const validateCname = (rule, value, callback) => {
        if (value === '') {
            callback(new Error('用户组名不能为空'));
        } else {
              if(value.length > 32) {
                callback(new Error('用户组名不能超过32个字符哦～'));
              } else {
                callback();
              }
        }
    };
    const validateEname = (rule, value, callback) => {
        if (value === '') {
            callback(new Error('用户名不能为空'));
        } else {
            const reg = new RegExp("^[a-zA-Z0-9]*$");
            let flag = reg.test(value);
            if(!flag){
              callback(new Error('用户名只能包含字母或数字哦～'));
            } else {
              if(value.length > 32) {
                callback(new Error('用户名不能超过32个字符哦～'));
              } else {
                callback();
              }
            }
        }
    };
    return {
      addModal: false,
      editModal: false,
      editData: {},
      addUserModal: false,
      addNewModal: false,
      isHasUser: false,
      addUserToGroupModal: false,
      remoteLoadingUser: false,
      loadUsers: false,
      targetGroupName: '',
      buttonSize: 'small',
      delModal: false,
      delType: 0, // 0删除组 1删除用户
      autoUserName: [],
      allUserList: [],   // each用户组下的用户信息
      autoArr: [],
      userInfo: [],
      isHaveU: null,
      chooseUid: "",
      targetTab: "oldUser",
      searchUserName: "",
      targetNodeData: null,
      usersTree: [],
      treeList: [],
      remoteUserArr: [],
      temRemoteUserArr: [],
      delRoot: null,
      delNode: null,
      delData: null,
      delIdArr: [],
      buttonProps: {
        type: "default",
        size: "small"
      },
      // 追加新用户表单及验证
      formCustom: {
        name: "",
        displayName: '',
        note: ""
      },
      editFormCustom: {
        name: "",
        displayName: '',
        note: ""
      },
      formOldUser: {
        oldNameArr: []
      },
      formUser: {
        name: "",
        cname: "",
        passwd: "",
        passwdCheck: "",
        mail: "",
        note: ""
      },
      independentGroup: {
        name: "",
        displayName: '',
        note: ""
      },
      ruleCustom: {
        name: [
          { required: true, message: "用户组名不能为空哦～", trigger: "blur" },
          { validator: validateCname, trigger: 'blur' }
        ],
        displayName: [
          { required: true, message: "用户组显示名不能为空哦～", trigger: "blur" },
          { validator: validateCname, trigger: 'blur' }
        ]
      },
      ruleEditCustom: {
        name: [
          { required: true, message: "用户组名不能为空哦～", trigger: "blur" },
          { validator: validateCname, trigger: 'blur' }
        ],
        displayName: [
          { required: true, message: "用户组显示名不能为空哦～", trigger: "blur" },
          { validator: validateCname, trigger: 'blur' }
        ]
      },
      ruleNew: {
        name: [
          { required: true, message: "用户组名不能为空哦～", trigger: "blur" },
          { validator: validateCname, trigger: 'blur' }
        ],
        displayName: [
          { required: true, message: "用户组显示名不能为空哦～", trigger: "blur" },
          { validator: validateCname, trigger: 'blur' }
        ]
      },
      ruleUser: {
        name: [
          { required: true, message: "用户名不能为空哦～", trigger: "blur" },
          { validator: validateEname, trigger: 'blur' }
          // {
          //   pattern: /^[a-zA-Z0-9]*$/,
          //   message: "英文名只能包含字母和数字",
          //   trigger: "blur"
          // }
        ],
        cname: [
          { required: true, message: "显示名不能为空哦～", trigger: "blur" },
          { validator: validateCname, trigger: 'blur' }
          // {
          //   pattern: /^[a-zA-Z0-9_\u0391-\uFFE5]+$/,
          //   message: "显示名只能包含汉字、字母、数字或下划线",
          //   trigger: "blur"
          // }
        ],
        mail: [
          { required: true, message: "邮箱不能为空哦～", trigger: "blur" },
          {
            pattern: /^([a-zA-Z0-9]+[_|\_|\.]?)*[a-zA-Z0-9]+@([a-zA-Z0-9]+[_|\_|\.]?)*[a-zA-Z0-9]+\.[a-zA-Z]{2,3}$/,
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
      addRootGroup: false,
      initTreeList: [],
      pageIndex: 1,
      pageSize: 10,
      pageSizeOpts: [10, 25, 50, 100, 200, 500]
    };
  },
  methods: {
    changePage(pageId) {
        this.pageIndex = pageId;
    },
    changePageSize(pageSize) {
        this.pageSize = pageSize;
    },
    globalRefresh() {
      this.pageIndex = 1
      this.isHasUser = false;
      // this.searchUserName = '';
      this.freshUsers();
    },
    //userGroupSort 和 subUserGroupSort都是用来给用户组排序的
    userGroupSort(rootNodes){
      rootNodes.sort((a, b)=>{
        return a[0].title.split("&")[0].localeCompare(b[0].title.split("&")[0],"zh")//a[0].title.split("&")[0] > b[0].title.split("&")[0] ? 1 : -1;
      })
      for(let i = 0; i < rootNodes.length ; i++){
        if(rootNodes[i][0].children){
          rootNodes[i][0].children = this.subUserGroupSort(rootNodes[i][0].children)
        }
      }
      return rootNodes
    },
    subUserGroupSort(rootNodes){
      rootNodes.sort((a, b)=>{
        return a.title.split("&")[0].localeCompare(b.title.split("&")[0],"zh")//a[0].title.split("&")[0] > b[0].title.split("&")[0] ? 1 : -1;
      })
      for(let i = 0; i < rootNodes.length ; i++){
        if(rootNodes[i].children){
          rootNodes[i].children = this.subUserGroupSort(rootNodes[i].children)
        }
      }
      return rootNodes
    },

    showNewGroup() {

      this.addNewModal = true;
      this.$refs['independentGroup'].resetFields();

    },

    cancelUserModal(state) {

      if(!state) {
        this.$refs.formUser.resetFields();
      }

    },

    addUserToTarget() {
      this.remoteUserArr = this.temRemoteUserArr;
      this.formOldUser.oldNameArr = [];
      this.targetTab = 'oldUser';
      this.addUserToGroupModal = true;
    },

    changeRemote(v) {
      if(v == '') {
        setTimeout(() => {
            this.remoteUserArr = this.temRemoteUserArr;
        }, 200)
      }
    },

    remoteUser(query) {
      if (query !== '') {
        this.remoteLoadingUser = true;
        let self = this;
        setTimeout(() => {
            self.remoteLoadingUser = false;
            self.remoteUserArr = self.autoUserName.filter(item => item.value.toLowerCase().indexOf(query.toLowerCase()) > -1);
        }, 200);
      } else {
          this.remoteUserArr = this.temRemoteUserArr;
      }
    },

    renderContent(h, { root, node, data }) {
      return h(
        "span",
        {
          style: {
            display: "inline-block",
            width: "calc(100% - 17px)"
          }
        },
        [
          h("span", [
            h("Icon", {
              props: {
                type: "ios-people"
              },
              style: {
                marginRight: "8px"
              }
            }),
            h("span", data.title.split("&")[0])
          ]),
          h(
            "span",
            {
              style: {
                display: "inline-block",
                float: "right",
                marginRight: "32px"
              }
            },
            [
              h(
              "Tooltip",
              {
                props: {
                  content: "添加子用户组"
                }
              },
              [ 
                h("Button", {
                  props: Object.assign({}, this.buttonProps, {
                    icon: "md-add",
                    type: "primary"
                  }),
                  attrs: {
                    id: 'childCreateBtn'
                  },
                  style: {
                    marginRight: "8px"
                  },
                  on: {
                    click: () => {
                      this.addModal = true;
                      this.targetNodeData = data;
                      this.formCustom.name = "";
                      this.formCustom.note = "";
                      this.formCustom.oldName = "";
                      // this.append(data);
                    }
                  }
                })
              ]),
              h(
              "Tooltip",
              {
                props: {
                  content: "编辑"
                }
              },
              [ 
                h("Button", {
                  props: Object.assign({}, this.buttonProps, {
                    icon: "md-create"
                  }),
                  attrs: {
                    id: 'childEditBtn'
                  },
                  style: {
                    marginRight: "8px"
                  },
                  on: {
                    click: () => {

                      this.$refs['editFormCustom'].resetFields();
                      this.editData = data;
                      this.editModal = true;
                      this.editFormCustom.name = data.name;
                      this.editFormCustom.displayName = data.displayName;
                      this.editFormCustom.note = data.comment;

                    }
                  }
                })
              ]),
              h(
              "Tooltip",
              {
                props: {
                  content: "删除"
                }
              },
              [ 
              h("Button", {
                props: Object.assign({}, this.buttonProps, {
                  icon: "md-remove"
                }),
                attrs: {
                  id: 'childDeleteBtn'
                },
                style: {
                  marginRight: "8px"
                },
                on: {
                  click: () => {
                    this.delModal = true;
                    this.delType = 1;
                    this.delRoot = root;
                    this.delNode = node;
                    this.delData = data;
                    this.delIdArr = [];
                    this.delIdArr.push(data.title.split("&")[1]);
                    let delGroupFamily = this.getDelTree(data.children);
                    // this.remove(root, node, data);
                  }
                }
              })
              ]),
              h(
              "Tooltip",
              {
                props: {
                  content: "查看"
                }
              },
              [ 
              h("Button", {
                props: Object.assign({}, this.buttonProps, {
                  icon: "ios-eye"
                }),
                attrs: {
                  id: 'childViewBtn'
                },
                style: {
                  marginRight: "8px"
                },
                on: {
                  click: () => {
                    this.loadUsers = true;
                    this.targetNodeData = data;
                    this.targetGroupName = data.title.split("&")[0];

                    const gId = data.title.split("&")[1];
                    this.getGroupAllUsers(gId);

                  }
                }
              })
              ]),
              h(
              "Tooltip",
              {
                props: {
                  content: "更多"
                }
              },
              [ 
              h("Button", {
                props: Object.assign({}, this.buttonProps, {
                  icon: "md-more",
                  disabled: data.children.length < 100 || (data.allChildren.length == data.children.length)
                }),
                attrs: {
                  id: 'childMoreBtn'
                },
                on: {
                  click: () => {
                    
                    if(data.allChildren.length > data.children.length) {
                      let newChildren = data.allChildren.slice(data.refreshIndex*100,(data.refreshIndex+1)*100);
                      data.children = data.children.concat(newChildren)
                      data.refreshIndex++;
                    }

                  }
                }
              })
              ])
            ]
          )
        ]
      );
    },

    // 添加树型node
    append(data, newTitle, newId) {
      const children = data.children || [];
      let obj = {};
      obj.title = newTitle + "&" + newId;
      obj.id = newId;
      obj.expand = true;
      data.allChildren.push(obj);
      children.push(obj);
      this.$set(data, "children", children);
    },

    // 删除树型node
    remove(root, node, data) {
      const parentKey = root.find(el => el === node).parent;
      const parent = root.find(el => el.nodeKey === parentKey).node;
      const index = parent.children.indexOf(data);
      parent.children.splice(index, 1);
    },

    freshUsers() {
      this.initData();
      if(this.isHasUser == true) {
        const gId = this.targetNodeData.title.split("&")[1];
        this.getGroupAllUsers(gId);
      }
    },

    // 获取指定用户组下的全部用户
    getGroupAllUsers(GID) {

      getUserFromGroup(GID).then(response => {
        let res = response.data;
        this.loadUsers = false;

        this.allUserList = [];

        if(!res.success) {
          const title = "提示";
          const content = `<p>${res.message}</p>`;
          this.$Modal.warning({
            title: title,
            content: content
          });
        } else {
          this.allUserList = res.data;
          this.allUserList.sort((a, b) => {
            return a.displayName.localeCompare(b.displayName,"zh")
          })
          this.isHasUser = true;
        }
      }).catch(e => {
        console.log(e);
        this.loadUsers = false;
        const title = "提示";
        const content = "<p>服务器繁忙, 用户获取失败请稍后再试～</p>";
        this.$Modal.warning({
          title: title,
          content: content
        });
      });

    },

    // 用户组数据初始化
    initData() {
      this.$Spin.show();
      this.refreshUserList();
      let searchUserName = this.searchUserName
      // 刷新时保留搜索关键字并过滤
      if(searchUserName){
        searchUserName = searchUserName.toLowerCase().trimStart().trimEnd();
        this.refreshTree(true, searchUserName);
      }else{
        this.refreshTree()
      }
      
    },

    // 刷新全部用户列表
    refreshUserList() {
      // 获取用户列表
      getAllUsers()
        .then(response => {
          this.remoteUserArr = [];
          this.autoUserName = [];
          this.temRemoteUserArr = [];
          let res = response.data;
          if (res.code == 200) {
            this.userInfo = res.data;
            if (res.data.length > 0) {
              this.autoArr = res.data;

              res.data.forEach((val, index) => {
                let eachU = {
                  value: (val.name || '--') + "|" + val.displayName,
                  label: (val.name || '--') + "|" + val.displayName
                }
                this.autoUserName.push(eachU);
                if(index < 100) {
                  this.remoteUserArr.push(eachU);
                  this.temRemoteUserArr.push(eachU);
                }
              });

              // res.data.every((val, index) => {
              //   if(index >= 5) {
              //     return false;
              //   } else {

              //     let eachU = {
              //       value: (val.name || '--') + "(" + val.displayName + ")",
              //       label: val.displayName
              //     }
              //     this.remoteUserArr.push(eachU);
              //     return true;

              //   }

              // });

            }
          } else {
            const title = "提示";
            const content = "<p>服务器繁忙, 用户列表获取失败请稍后再试～</p>";
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

    refreshTree(flag, keyword) {
      this.treeList = [];
      // 获取用户组
      getAllUserTree()
        .then(response => {
          this.$Spin.hide();
          let res = response.data;
          if (!res.success) {
            const title = "提示";
            const content = `<p>${res.message}</p>`;
            this.$Modal.warning({
              title: title,
              content: content
            });
          } else {
            if (res.data.length > 0) {
              res.data.forEach((val, index) => {
                let childrenArr = this.getEachTree(val.childrenGroups);
                let treeData = [
                  {
                    title: (val.displayName || val.name) + "&" + val.oid,
                    name: val.name || '',
                    displayName: val.displayName || '',
                    comment: val.comment || '',
                    expand: false,
                    render: (h, { root, node, data }) => {
                      return h(
                        "span",
                        {
                          style: {
                            display: "inline-block",
                            width: "calc(100% - 17px)"
                          }
                        },
                        [
                          h("span", [
                            h("Icon", {
                              props: {
                                type: "ios-people"
                              },
                              style: {
                                marginRight: "8px"
                              }
                            }),
                            h("span", data.title.split("&")[0])
                          ]),
                          h(
                            "span",
                            {
                              style: {
                                display: "inline-block",
                                float: "right",
                                marginRight: "32px"
                              }
                            },
                            [
                            h(
                              "Tooltip",
                              {
                                props: {
                                  content: "添加子用户组"
                                }
                              },
                              [                             
                                h("Button", {
                                  props: Object.assign({}, this.buttonProps, {
                                    icon: "md-add",
                                    type: "primary"
                                  }),
                                  attrs: {
                                    id: 'rootCreateBtn'
                                  },
                                  style: {
                                    marginRight: "8px"
                                  },
                                  on: {
                                    click: () => {
                                      this.addModal = true;
                                      this.targetNodeData = data;
                                    }
                                  }
                                }),
                              ]),
                              h(
                              "Tooltip",
                              {
                                props: {
                                  content: "编辑"
                                }
                              },
                              [ 
                                h("Button", {
                                  props: Object.assign({}, this.buttonProps, {
                                    icon: "md-create"
                                  }),
                                  attrs: {
                                    id: 'rootEditBtn'
                                  },
                                  style: {
                                    marginRight: "8px"
                                  },
                                  on: {
                                    click: () => {

                                      this.$refs['editFormCustom'].resetFields();
                                      this.editData = data;
                                      this.editModal = true;
                                      this.editFormCustom.name = data.name;
                                      this.editFormCustom.displayName = data.displayName;
                                      this.editFormCustom.note = data.comment;

                                    }
                                  }
                                })
                              ]),
                              h(
                              "Tooltip",
                              {
                                props: {
                                  content: "删除"
                                }
                              },
                              [ 
                                h("Button", {
                                  props: Object.assign({}, this.buttonProps, {
                                    icon: "md-remove"
                                  }),
                                  attrs: {
                                    id: 'rootDeleteBtn'
                                  },
                                  style: {
                                    marginRight: "8px"
                                  },
                                  on: {
                                    click: () => {

                                      this.delModal = true;
                                      this.delType = 0;
                                      this.delRoot = root;
                                      this.delNode = node;
                                      this.delData = data;
                                      this.delIdArr = [];
                                      this.delIdArr.push(data.title.split("&")[1]);
                                      let delGroupFamily = this.getDelTree(data.children);
                                    }
                                  }
                                })
                              ]),
                               h(
                              "Tooltip",
                              {
                                props: {
                                  content: "查看"
                                }
                              },
                              [ 
                                h("Button", {
                                  props: Object.assign({}, this.buttonProps, {
                                    icon: "ios-eye"
                                  }),
                                  attrs: {
                                    id: 'rootViewBtn'
                                  },
                                  style: {
                                    marginRight: "8px"
                                  },
                                  on: {
                                    click: () => {

                                      this.loadUsers = true;
                                      this.targetNodeData = data;
                                      this.targetGroupName = data.title.split("&")[0];

                                      const gId = data.title.split("&")[1];
                                      this.getGroupAllUsers(gId);

                                    }
                                  }
                                })
                              ]),
                              h(
                              "Tooltip",
                              {
                                props: {
                                  content: "更多"
                                }
                              },
                              [ 
                                h("Button", {
                                  props: Object.assign({}, this.buttonProps, {
                                    icon: "md-more",
                                    disabled: data.children.length < 100 || (data.allChildren.length == data.children.length)
                                  }),
                                  attrs: {
                                    id: 'childMoreBtn'
                                  },
                                  on: {
                                    click: () => {
                                      
                                      if(data.allChildren.length > data.children.length) {
                                        let newChildren = data.allChildren.slice(data.refreshIndex*100,(data.refreshIndex+1)*100);
                                        data.children = data.children.concat(newChildren)
                                        data.refreshIndex++;
                                      }

                                    }
                                  }
                                })
                              ])
                            ]
                          )
                        ]
                      );
                    },
                    children: childrenArr.slice(0, 100),
                    allChildren: childrenArr,
                    refreshIndex: 1
                  }
                ];
                this.treeList.push(treeData);
                // this.initTreeList = JSON.parse(JSON.stringify(this.treeList));
                // if (flag) {
                //   this.commonUpdateTree(keyword)
                // }
              });
              this.initTreeList = JSON.parse(JSON.stringify(this.treeList));
              if (flag) {
                this.commonUpdateTree(keyword)
              }
            } else {
              this.isHasUser = false;
            }
          }
        })
        .catch(e => {
          this.$Spin.hide();
          console.log(e);
        });
    },

    // 递归子用户
    getEachTree(tree = []) {
      let arr = [];
      let _self = this;
      if (!!tree && tree.length !== 0) {
        tree.forEach(item => {
          let obj = {};
          obj.title = (item.displayName || item.name) + "&" + item.oid;
          obj.name = item.name || '';
          obj.displayName = item.displayName || '';
          obj.comment = item.comment || '';
          obj.id = item.oid;
          obj.expand = false;
          obj.allChildren = _self.getEachTree(item.childrenGroups); // 递归调用
          obj.children = obj.allChildren.slice(0, 100);
          obj.refreshIndex = 1;
          arr.push(obj);
        });
      }
      return arr;
    },

    // 追加新用户组
    addNewEvent(name) {
      this.$refs['independentGroup'].validate(valid => {
          if (!valid) {
            this.$Message.error('格式有误, 创建用户组失败');
          } else {
            let _self = this;
            let newParams = [
              {
                comment: this.independentGroup.note,
                displayName: this.independentGroup.displayName,
                name: this.independentGroup.name
              }
            ];
            groupAddNewGroup(newParams)
              .then(res => {
                if (!res.success) {
                 this.$Message.error(res.message)
                } else {

                  let value = this.searchUserName.toLowerCase().trimStart().trimEnd();

                  if(value != '') {

                    this.isHasUser = false;
                    this.$Spin.show();
                    this.refreshTree(true, value);
                    // this.commonUpdateTree(value);

                  } else {
                    this.pageIndex = 1
                    this.initData();
                  }
                  
                  _self.$Message.success("添加用户组成功");
                  this.addNewModal = false;
                  this.$refs['independentGroup'].resetFields();

                }
              })
              .catch(e => {
                console.log(e);
              });
          }
      })
    },

    // 删除用户组
    delEvent() {
      let delOid = this.delData.title.split("&")[1];
      delGroup(delOid, true).then(res => {
        if (!res.success) {
          this.$Message.error(res.message);
        } else {
          this.$Message.success("删除用户组成功");
          this.pageIndex = 1
          this.treeList = [];

          let value = this.searchUserName.toLowerCase().trimStart().trimEnd();
          if(value != '') {

            this.$Spin.show();
            this.refreshTree(true, value);
            // this.commonUpdateTree(value);

          } else {
            this.$Spin.show();
            this.refreshTree();
          }

          // 删除当前用户组 隐藏展示的用户信息面板
          if(this.isHasUser) {
            let targetG = this.targetNodeData.title.split("&")[1];

            let isDelTree = this.delIdArr.filter(item => item == targetG);

            // 匹配当前用户为展示状态的用户组 是否为当前删除组的子组 或者是其本身 是则需要隐藏
            if(isDelTree.length != 0) {
              this.isHasUser = false;
            }
          }
          // temTree.splice(temTree.findIndex(v => v.title === this.delData.title), 1);
        }
      })
      .catch(e => {
        this.$Spin.hide();
        console.log(e);
      });
      // this.remove(root, node, data);
    },

    // 递归获取当前删除组 ***是否包含正在显示用户的用户组 包含则消失查看用户的面板
    getDelTree(tree = []) {
      let _self = this;
      if (!!tree && tree.length !== 0) {
        tree.forEach(item => {
          _self.getDelTree(item.children);
          _self.delIdArr.push(item.id);
        });
      }
      return _self.delIdArr;
    },

    // 查看某用户组下用户
    chooseUser(val) {
      let targetU = val.split("(")[0];
      this.userInfo.forEach((val, index) => {
        if (val.name == targetU) {
          this.isHaveU = true;
          this.chooseUid = val.oid;
        } else {
          this.isHaveU = false;
        }
      });
    },

    // 添加已有用户到指定组时间 autofillname
    filterMethod(value, option) {
      return option.toUpperCase().indexOf(value.toUpperCase()) !== -1;
    },
    
    //递归给树设置expand
    treeChangeExpand(treeData, flag) {
      let _this = this;
      for (var i = 0; treeData && i < treeData.length; i++) {
        let item = ''
        flag ? item = treeData[i][0] : item = treeData[i]
        // 当前节点符合搜索条件，子节点不做处理，否则均展开
        if(!item.expand){
          item.expand = true;
          if (item.children.length) {
            item.children = _this.treeChangeExpand(item.children, false);
          }
        }else{
          item.expand = false
        }
      }
      return treeData;
    },
    commonUpdateTree(v) {
      let filter = (data, keyword, root) => {
        return data.filter(o => {
          if (root) o = o[0];
          let isMatch = o['name'] && o['name']
                  .toString()
                  .toLowerCase()
                  .match(keyword) !== null
              || o['displayName'] && o['displayName']
                  .toString()
                  .toLowerCase()
                  .match(keyword) !== null
              // || o['comment'] && o['comment']
              //     .toString()
              //     .toLowerCase()
              //     .match(keyword) !== null;
          // 如果当前节点match，则不对子节点做任何过滤（递归结束），方便用户搜索到想要的用户组后逐一修改组内用户权限
          // 如果不match，则只在某个子节点match时，当前节点作为match节点的父节点在过滤后的树结构中展示
          if (!isMatch && o.children) o.children = filter(o.children, keyword, false, o);
          else o.expand = true
          return isMatch || o.children.length>0;
        });
      };
      this.treeList = filter(JSON.parse(JSON.stringify(this.initTreeList)), v, true);
      // 节点展开的处理
      this.treeList = this.treeChangeExpand(this.treeList, true)
    },

    //搜素用户名
    handleSearchUser(e) {
      let value = e.target.value.toLowerCase().trimStart().trimEnd();

      // if(value != '') {

      //   this.isHasUser = false;
      //   this.commonUpdateTree(value);

      // } else {
      //   this.$Spin.show();
      //   this.refreshTree();
      // }

    },

    // 追加新用户组
    ok(name) {
      var _self = this;
      this.$refs[name].validate(valid => {
        if (!valid) {
          _self.$Message.error('信息格式有误');
        } else {
          let newParams = [
            {
              comment: this.formCustom.note,
              name: this.formCustom.name,
              displayName: this.formCustom.displayName
            }
          ];
          groupAddNewGroup(newParams)
            .then(res => {
              if (!res.success) {
                _self.$Message.error(res.message);
              } else {
                let pId = this.targetNodeData.title.split("&")[1];
                let subOids = res.data[0];
                groupAddUser(pId, subOids)
                  .then(res => {
                    if (res.success) {
                      this.addModal = false;
                      // this.append(this.targetNodeData, this.formCustom.name, subOids);

                      // 同步数据到用户列表
                      let value = this.searchUserName.toLowerCase().trimStart().trimEnd();
                      if(value != '') {

                        this.isHasUser = false;
                        this.$Spin.show();
                        this.refreshTree(true, value);
                        // this.commonUpdateTree(value);
                        this.refreshUserList();

                      } else {
                        this.initData();
                      }

                      this.$Message.info("添加用户组成功");

                      this.$refs[name].resetFields();
                    } else {
                      _self.$Message.error(res.message);
                    }
                  })
                  .catch(e => {
                    console.log(e);
                  });
              }
            })
            .catch(e => {
              console.log(e);
            });
          }
        });
    },

    editGroup() {

      let _self = this;
      this.$refs['editFormCustom'].validate(valid => {

        if (!valid) {
          _self.$Message.error('信息格式有误');
        } else {

          let editParams = [
            {
              comment: this.editFormCustom.note,
              oid: this.editData.title.split("&")[1],
              name: this.editFormCustom.name,
              displayName: this.editFormCustom.displayName
            }
          ];

          updateGroup(editParams).then(res => {

            if (!res.success) {
              _self.$Message.error(res.message);
            } else {

              this.editModal = false;

              let value = this.searchUserName.toLowerCase().trimStart().trimEnd();
              console.log(value)
              if(value != '') {

                this.isHasUser = false;
                this.$Spin.show();
                this.refreshTree(true, value);
                // this.commonUpdateTree(value);

              } else {
                this.initData();
              }
              this.$Message.info("编辑用户组成功");

            }

          }).catch(e => {
            console.log(e);
          });

        }

      })

    },

    chooseTab(name) {
      this.targetTab = name;
    },

    // 向指定用户组追加新用户
    addUserToG() {

      // ******追加已有用户
      if (this.targetTab == "oldUser") {
        let oldNameArr = this.formOldUser.oldNameArr

        if(oldNameArr.length === 0) {
          this.$Message.error('请先选择需要添加的用户');
        } else {
          let promises = [];
          let pId = this.targetNodeData.title.split("&")[1];      // 父Id
          oldNameArr.forEach(item => {

          let uName = item.split("|")[0];     // 选择的用户英文名
          let uId = [this.autoArr.find(el => el.name === uName).oid];

          promises.push(addUserToGroup(pId, uId));
          // addUserToGroup(pId, uId)
          //   .then(res => {
          //     if (res.success) {

          //       this.addUserToGroupModal = false;
          //       this.getGroupAllUsers(pId);

          //       // 同步数据到用户列表
          //       this.refreshUserList();

          //       this.$Message.info("添加用户成功");
          //       this.formOldUser.oldName = '';

          //     } else {
          //       this.$Message.error({
          //         content: res.message
          //       });
          //     }
          //   })
          //   .catch(e => {
          //     this.addUserToGroupModal = false;
          //     this.$Spin.hide();
          //     console.log(e);
          //   });
            })
            Promise.all(promises).then(res => {
                this.addUserToGroupModal = false;
                this.getGroupAllUsers(pId);

                // 同步数据到用户列表
                this.refreshUserList();

                this.$Message.info("添加用户成功");
                this.formOldUser.oldNameArr = [];
            })
            .catch(e => {
              this.addUserToGroupModal = false;
              this.$Spin.hide();
              console.log(e);
            });

        }

      } else {
        // ******追加新用户
        this.$refs['formUser'].validate(valid => {
          if (valid) {
            // 获取新用户Uid
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
                name: this.formUser.name,
                oid: "",
                password: this.formUser.passwd
              }
            ];
            addNewUser(newUserParams)
              .then(res => {
                if (res.success) {

                  this.addUserToGroupModal = false;

                  let pId = this.targetNodeData.title.split("&")[1];
                  let uids = [res.data[0]];

                  addUserToGroup(pId, uids)
                  .then(res => {
                    if(!res.success) {
                      this.$Message.error(res.message);
                    } else {
                      this.getGroupAllUsers(pId);
                      this.$Message.info("添加用户成功");

                      // reset数据
                      this.$refs['formUser'].resetFields();
                    }

                    // 同步数据到用户列表
                    let value = this.searchUserName.toLowerCase().trimStart().trimEnd();

                    if(value != '') {

                      this.isHasUser = false;
                      this.commonUpdateTree(value);

                    } else {
                      this.initData();
                    }

                    this.loadUsers = true;
                    const gId = this.targetNodeData.title.split("&")[1];
                    this.getGroupAllUsers(gId);
                    this.refreshUserList();

                  }).catch(e => {
                    console.log(e);
                  });

                } else {
                  this.$Message.error(res.message);
                }
              })
              .catch(e => {
                this.addUserToGroupModal = false;
                this.$Spin.hide();
                console.log(e);
              });
          } else {
            this.$Message.warning('用户信息格式有误，请确认')
          }
        })
      }
    },

    // 删除指定用户组的用户
    delTargetUser(value) {

      let pId = this.targetNodeData.title.split("&")[1];
      let uids = [value.oid];
      let uName = value.name;

      delUserFromGroup(pId, uids).then(res => {
        if(!res.success) {
          this.$Message.error(res.message);
        } else {
          this.allUserList.splice(this.allUserList.findIndex(item => item.name === uName), 1);
          this.$Message.info("删除用户成功");
        }
      }).catch(e => {
        console.log(e);
      });

    },

    // 取消追加新用户
    cancel(name) {
      // this.targetNodeData = null;

      if(name == 'formCustom') {
        this.addModal = false;
      } else if(name == 'editFormCustom') {
        this.editModal = false;
      }

      if(name) {
        this.$refs[name].resetFields();
        this.addNewModal = false;
      }
    },

    //
    cancelAddUser() {
      this.formOldUser.oldNameArr = [];
      this.$refs['formUser'].resetFields();
      this.addUserToGroupModal = false;
    }
  },
  created() {
    this.initData();
    this.addRootGroup = !(sessionStorage.getItem("usernameM") == 'admin');
  },
  mounted() {
    let userSelect = this.$refs.userSelect.$el.querySelectorAll('.ivu-select-dropdown')
    let selectedList = this.$refs.formOldUser.$el.querySelectorAll('.ivu-select-selection')
    userSelect.forEach(item => {
      item.style.width = '100%'
    })
    selectedList.forEach(item => {
      item.style.maxHeight = '100px'
      item.style.overflowY = 'auto'
    })

  },
  watch: {
      searchUserName(val) {
          this.pageIndex = 1;
          if(val != '') {
            val = val.toLowerCase().trimStart().trimEnd();
            this.isHasUser = false;
            this.commonUpdateTree(val);
          } else {
            // this.$Spin.show();
            // this.refreshTree();
            this.treeList = this.initTreeList
          }
      },
      addModal(val) {
        !val ? this.cancel('formCustom') : ''
      }
  },
  computed: {
      treeListComputed(){
        return this.treeList
        // return this.userGroupSort(this.treeList)
      },
      pagedData() {
          let k = this.treeList.slice((this.pageIndex - 1) * this.pageSize, this.pageIndex * this.pageSize);
          return k;
      },
  }
};
</script>
<style scoped>
  .old_user_tooltip{
    width: 100%;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    word-break: break-all;
  }
  .old_user_option{
    width: 100%;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .userCard>>>.ivu-card-head p span {
    vertical-align: baseline;
  }
  .ivu-tree {
    border-bottom: 1px solid #eee;
  }
</style>
