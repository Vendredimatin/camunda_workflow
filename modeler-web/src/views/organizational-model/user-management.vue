<template>
    <div>
        <Card>
            <Row style="margin-bottom: 10px;">
                <Button type="primary" @click="addUser" id="createUser">新增</Button>
                <Input v-model="searchConName" icon="md-search" placeholder="请输入姓名搜索..." style="width: 200px;float: right;" @on-change="userSearch"/>
            </Row>
            <Table :height="tableHeight" ref="userTable" size="small" border :columns="userColumns" :data="userData" style="margin-bottom: 10px;" id="userTable"></Table>
            <Row>
                <Page :total="userTotal"
                    size="small"
                    :current.sync="userPageIndex"
                    @on-change="changePage"
                    transfer
                    placement="top"
                    show-total
                    show-elevator
                    show-sizer
                    :page-size-opts="pageSizeOpts"
                    :pageSize="selfPageSize"
                    @on-page-size-change="changeUserPageSize"
                    style="float: right;" />
            </Row>
        </Card>

        <!-- 新增用户 -->
        <Modal
            v-model="userModal"
            title="新增用户"
            :mask-closable="false"
            id="createUserModal"
        >
            <Form ref="formUser" :model="formUser" :rules="ruleUser" :label-width="100">
                <FormItem label="用户名" prop="name">
                    <Input v-model="formUser.name" placeholder="请输入用户名" id="createUserModalName"></Input>
                </FormItem>
                <FormItem label="显示名" prop="displayName">
                    <Input v-model="formUser.displayName" placeholder="请输入显示名" id="createUserModalDisplayName"></Input>
                </FormItem>
                <FormItem label="密码" prop="password">
                    <Input type="password" v-model="formUser.password" id="createUserModalPassword"></Input>
                </FormItem>
                <FormItem label="确认密码" prop="passwdCheck">
                    <Input type="password" v-model="formUser.passwdCheck" id="createUserModalPasswdCheck"></Input>
                </FormItem>
                <FormItem label="E-mail" prop="email">
                    <Input v-model="formUser.email" placeholder="请输入邮箱" id="createUserModalEmail"></Input>
                </FormItem>
                <FormItem label="所属用户组" prop="groupIds">
                    <Select v-model="formUser.groupIds" filterable multiple remote @on-query-change="changeRemote" :remote-method="remoteUser" :loading="remoteLoadingUser"  id="createUserModalGroupIds">
                        <Option v-for="item in groupList" :value="item.oid" :key="item.oid" :label="item.name">{{ item.name }}</Option>
                    </Select>
                </FormItem>
                <FormItem label="备注" prop="comment">
                    <Input type="text" v-model="formUser.comment" id="createUserModalComment"></Input>
                </FormItem>
            </Form>
            <div slot="footer">
                <Button type="text" @click="userModal = false" id="cancelCreateUserButton">取消</Button>
                <Button type="primary" @click="updateUserEvent('create')" id="confirmCreateUserButton">确认</Button>
            </div>
        </Modal>

         <!-- 编辑用户 -->
        <Modal
            v-model="userEditModal"
            title="编辑用户"
            :mask-closable="false"
            @on-visible-change="cancelEditModal"
            id="editUserModal">
            <Form ref="editFormUser" :model="editFormUser" :rules="ruleEditUser" :label-width="120">
                <FormItem label="用户名" prop="name">
                    <Input v-model="editFormUser.name" disabled placeholder="请输入用户名" id="editUserModalName"></Input>
                </FormItem>
                <FormItem label="显示名" prop="displayName">
                    <Input v-model="editFormUser.displayName" placeholder="请输入显示名" id="editUserModalDisplayName"></Input>
                </FormItem>
                <FormItem label="密码" prop="password">
                    <Input type="password" v-model="editFormUser.password" id="editUserModalPassword"></Input>
                </FormItem>
                <FormItem label="E-mail" prop="email">
                    <Input v-model="editFormUser.email" placeholder="请输入邮箱" id="editUserModalEmail"></Input>
                </FormItem>
                <FormItem label="所属用户组" prop="groupIds">
                    <Select v-model="editFormUser.groupIds" filterable multiple remote @on-query-change="changeRemote" :remote-method="remoteUser" :loading="remoteLoadingUser" id="editUserModalGroupIds">
                        <Option v-for="item in groupList" :value="item.oid" :key="item.oid" :label="item.name">{{ item.displayName || item.name }}</Option>
                    </Select>
                </FormItem>
                <FormItem label="备注" prop="comment">
                    <Input type="text" v-model="editFormUser.comment" id="editUserModalComment"></Input>
                </FormItem>
            </Form>
            <div slot="footer">
                <Button type="text" @click="cancelEdit" id="cancelEditUserButton">取消</Button>
                <Button type="primary" @click="updateUserEvent('edit')" id="confirmEditUserButton">确认</Button>
            </div>
        </Modal>
    </div>
</template>

<script>
import {tableMixin} from "@/component/tableMixin"
import {
  getAllUsers,
  addNewUser,
  updateUser,
  delUser,
  getGroups,
  getAllUserTree,
  addUserToGroup,
  getUserByOid
} from "@/api/others";
export default {
    mixins: [tableMixin],
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
        const validateEditPass = (rule, value, callback) => {
            if (value == '' || value == undefined) {
                callback();
            } else {
                if(value.length < 6 || value.length > 16){
                    callback(new Error('新密码长度必须在 6-16位'));
                } else {
                    callback();
                }
            }
        };
        const validatePassCheck = (rule, value, callback) => {
            if (value === '') {
                callback(new Error('请重新输入一遍您的密码～'));
            } else if (value !== this.formUser.password) {
                callback(new Error('两次密码输入不一致'));
            } else {
                callback();
            }
        };
        return {
            userModal: false,
            userEditModal: false,
            columnsWidth: 201,
            userTitle: '新增用户',
            formUser: {
                name: "",
                displayName: "",
                password: "",
                passwdCheck: "",
                email: "",
                groupIds: [],
                comment: ""
            },

            editFormUser: {
                oid: '',
                name: "",
                displayName: "",
                password: "",
                email: "",
                groupIds: [],
                comment: ""
            },

            userTotal: 0,
            selfPageSize: 10,
            userPageIndex: 1,
            pageSizeOpts: [10, 25, 50, 100, 200, 500],

            ruleUser: {
                displayName: [
                    { required: true, message: "显示名不能为空哦～", trigger: "blur" },
                    { validator: validateCname, trigger: 'blur' }
                ],
                name: [
                    { required: true, message: "用户名不能为空哦～", trigger: "blur" },
                    { validator: validateEname, trigger: 'blur' }
                ],
                email: [
                    { required: true, message: "邮箱不能为空哦～", trigger: "blur" },
                    { type: 'email', message: '邮箱格式有误, 请重新填写', trigger: 'blur' }
                    // {
                    //     // pattern: /^[a-z0-9]+([._\\-]*[a-z0-9])*@([a-z0-9]+[-a-z0-9]*[a-z0-9]+.){1,63}[a-z0-9]+$/,
                    //     pattern: /^([a-zA-Z0-9]+[_|\_|\.]?)*[a-zA-Z0-9]+@([a-zA-Z0-9]+[_|\_|\.]?)*[a-zA-Z0-9]+\.[a-zA-Z]{2,3}$/,
                    //     message: "邮箱格式有误, 请重新填写",
                    //     trigger: "blur"
                    // }
                ],
                password: [
                    { required: true, message: "密码不能为空哦～", trigger: "blur" },
                    { validator: validatePass, trigger: 'blur' }
                ],
                passwdCheck: [
                    { required: true, message: "请重新输入一遍您的密码～", trigger: "blur" },
                    { validator: validatePassCheck, trigger: 'blur' }
                ]
            },
            ruleEditUser: {
                displayName: [
                    { required: true, message: "显示名不能为空哦～", trigger: "blur" },
                    { validator: validateCname, trigger: 'blur' }
                ],
                name: [
                    { required: true, message: "用户名不能为空哦～", trigger: "blur" },
                    { validator: validateEname, trigger: 'blur' }
                ],
                email: [
                    { required: true, message: "邮箱不能为空哦～", trigger: "blur" },
                    { type: 'email', message: '邮箱格式有误, 请重新填写', trigger: 'blur' }
                    // {
                    //     // pattern: /^[a-z0-9]+([._\\-]*[a-z0-9])*@([a-z0-9]+[-a-z0-9]*[a-z0-9]+.){1,63}[a-z0-9]+$/,
                    //     pattern: /^([a-zA-Z0-9]+[_|\_|\.]?)*[a-zA-Z0-9]+@([a-zA-Z0-9]+[_|\_|\.]?)*[a-zA-Z0-9]+\.[a-zA-Z]{2,3}$/,
                    //     message: "邮箱格式有误, 请重新填写",
                    //     trigger: "blur"
                    // }
                ],
                password: [
                    { validator: validateEditPass, trigger: 'blur' }
                ],
            },

            searchConName: '',
            userColumns: [
                {
                    title: "序号",
                    type: "index",
                    width: 80,
                    align: "center"
                },
                {
                    title: "用户名",
                    align: "center",
                    key: "name",
                    render: (h, params) => {
                        return h('Tooltip', {
                        props: { placement: 'bottom', maxWidth: 362, transfer: true }
                        }, [
                            params.row.name.length > 16 ? params.row.name.slice(0, 16) + "..." : params.row.name,
                            h('span', { slot: 'content', style: { whiteSpace: 'normal', wordBreak: 'break-all' } },
                            params.row.name)
                        ])
                    }
                },
                {
                    title: "显示名",
                    align: "center",
                    key: "displayName",
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
                    title: "电子邮件",
                    align: "center",
                    key: "email",
                    tooltip: true
                },
                {
                    title: "备注",
                    align: "center",
                    key: "comment",
                    render: (h, params) => {
                        return h('Tooltip', {
                        props: { placement: 'bottom', maxWidth: 362, transfer: true }
                        }, [
                            params.row.comment.length > 32 ? params.row.comment.slice(0, 32) + "..." : params.row.comment,
                            h('span', { slot: 'content', style: { whiteSpace: 'normal', wordBreak: 'break-all' } },
                            params.row.comment)
                        ])
                    }
                },
                {
                    title: '操作',
                    key: 'action',
                    width: 150,
                    align: 'center',
                    render: (h, params) => {
                        return h('div', [
                            h('Button', {
                                props: {
                                    type: 'primary',
                                    size: 'small',
                                },
                                attrs: {
                                  id: `editUserButton${params.index}`
                                },
                                style: {
                                    marginRight: '5px'
                                },
                                on: {
                                    click: () => {
                                        this.show(params.index)
                                    }
                                }
                            }, '编辑'),
                            h('Button', {
                                props: {
                                    type: 'error',
                                    size: 'small',
                                },
                                attrs: {
                                  id: `deleteUserButton${params.index}`
                                },
                                on: {
                                    click: () => {
                                        this.remove(params.index)
                                    }
                                }
                            }, '删除')
                        ]);
                    }
                }
            ],
            templateTable: [],
            userData: [],

            groupList: [],       // 全部用户组
            allGroupList: [],
            temGroupList: [],
            remoteLoadingUser: false
        }
    },
    created() {
        this.resetColumnsWidth();
        this.initData();
    },
    methods: {
        activate() {
            this.resetColumnsWidth();
        },
        globalRefresh() {

            let value = this.searchConName.trimStart().trimEnd();
            let str = '';
            if(value != '' && value != undefined) {
                str = `and (plt_displayName like '%${value}%' or plt_name like '%${value}%')`;
                str = encodeURIComponent(str);
            }
            this.userPageIndex = 1;
            this.initData(str);

        },
        resetColumnsWidth() {

            let sideWidth = document.getElementById('mainMenuSide') ? document.getElementById('mainMenuSide').style.width : 0;
            let finalWidth = parseInt(sideWidth) + 500;
            this.columnsWidth = (document.body.clientWidth - finalWidth) / 4;
            console.log('resetColumnsWidth', this.columnsWidth)

            this.userColumns = [
                {
                    title: "序号",
                    type: "index",
                    width: 80,
                    align: "center"
                },
                {
                    title: "用户名",
                    minWidth: this.columnsWidth,
                    align: "center",
                    key: "name",
                    render: (h, params) => {
                        return h('Tooltip', {
                        props: { placement: 'bottom', maxWidth: 362, transfer: true }
                        }, [
                            params.row.name.length > 16 ? params.row.name.slice(0, 16) + "..." : params.row.name,
                            h('span', { slot: 'content', style: { whiteSpace: 'normal', wordBreak: 'break-all' } },
                            params.row.name)
                        ])
                    }
                },
                {
                    title: "显示名",
                    minWidth: this.columnsWidth,
                    align: "center",
                    key: "displayName",
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
                    title: "电子邮件",
                    minWidth: this.columnsWidth,
                    align: "center",
                    key: "email",
                    tooltip: true
                },
                {
                    title: "备注",
                    minWidth: this.columnsWidth,
                    align: "center",
                    key: "comment",
                    render: (h, params) => {
                        return h('Tooltip', {
                        props: { placement: 'bottom', maxWidth: 362, transfer: true }
                        }, [
                            params.row.comment.length > 32 ? params.row.comment.slice(0, 32) + "..." : params.row.comment,
                            h('span', { slot: 'content', style: { whiteSpace: 'normal', wordBreak: 'break-all' } },
                            params.row.comment)
                        ])
                    }
                },
                {
                    title: '操作',
                    key: 'action',
                    width: 150,
                    align: 'center',
                    render: (h, params) => {
                        return h('div', [
                            h('Button', {
                                props: {
                                    type: 'primary',
                                    size: 'small'
                                },
                                style: {
                                    marginRight: '5px'
                                },
                                attrs: {
                                  id: `editUserButton${params.index}`
                                },
                                on: {
                                    click: () => {
                                        this.show(params.index)
                                    }
                                }
                            }, '编辑'),
                            h('Button', {
                                props: {
                                    type: 'error',
                                    size: 'small'
                                },
                                attrs: {
                                  id: `deleteUserButton${params.index}`
                                },
                                on: {
                                    click: () => {
                                        this.remove(params.index)
                                    }
                                }
                            }, '删除')
                        ]);
                    }
                }
            ]

        },
        // 更新表格
        updateTabel(query, pIndex, pSize, noSpin) {

            // loading动画
            if(!noSpin) {
                this.$Spin.show();
            }

            this.userData = [];
            this.templateTable = [];
            // this.searchConName = '';

            getAllUsers(query, pIndex, pSize, true).then(response => {

                this.$Spin.hide();
                let res = response.data;
                if(res.success) {
                    this.userTotal = res.data.pageInfo.totalCount;
                    if(res.data.data.length > 0) {

                        this.userData = res.data.data;

                    }
                } else {
                    this.$Message.warning(res.message)
                }

            }).catch(e => {
                this.$Spin.hide();
                console.log(e);
            });

        },
        // 初始化加载表格
        initData(str){

            let hasStr = str ? str : '';
            this.updateTabel(hasStr, 0, this.selfPageSize);

            getGroups().then(response => {

                let res = response.data;
                if(res.success) {

                    if(res.data) {
                        this.allGroupList = res.data;

                        if(res.data.length > 100) {
                            this.groupList = res.data.slice(0,100);
                            this.temGroupList = res.data.slice(0,100);
                        } else {
                            this.groupList = res.data;
                            this.temGroupList = res.data;
                        }
                    }

                }

            }).catch(e => {
                this.$Spin.hide();
                console.log(e);
            });

        },
        changeRemote(v) {
            if(v == '') {
                // this.$nextTick(() => {
                //     this.groupList = this.temGroupList;
                //     console.log(this.groupList.length)
                // })
                setTimeout(() => {
                    this.groupList = this.temGroupList;
                }, 200)
            }
        },

        remoteUser(query) {
            if (query !== '') {
                this.remoteLoadingUser = true;
                let self = this;
                setTimeout(() => {
                    self.remoteLoadingUser = false;
                    self.groupList = self.allGroupList.filter(item => item.name.toLowerCase().indexOf(query.toLowerCase()) > -1);
                }, 200);
            } else {
                this.groupList = this.temGroupList;
            }
        },

        show (index) {

            let editData = {...this.userData[index]};
            // this.editFormUser = JSON.parse(JSON.stringify(this.userData[index]));
            this.editFormUser.name = editData.name || '';
            this.editFormUser.displayName = editData.displayName || '';
            this.editFormUser.email = editData.email || '';
            this.editFormUser.oid = editData.oid || '';
            this.editFormUser.password = '';

            if(editData.groupIds) {
                editData.groupIds.forEach(g => {

                    let inArr = this.groupList.findIndex(i => {
                        return i.oid == g
                    })
                    if(inArr == -1) {
                        let addItem = this.allGroupList.filter(a => {
                            return a.oid == g
                        });
                        if(addItem && addItem.length>0) {
                            this.groupList.push(addItem[0]);
                        }
                    }

                })
            }
            this.editFormUser.groupIds = [];
            this.editFormUser.groupIds = editData.groupIds;

            this.editFormUser.comment = editData.comment || '';
            this.userTitle = '编辑用户';
            this.userEditModal = true;
        },
        remove (index) {

            let delUid = this.userData[index].oid;
            if (delUid && delUid == sessionStorage.getItem("userIdM")) {
                this.$Message.warning("不能删除本用户");
                return;
            }
            delUser(delUid).then(res => {

                if(res.success) {

                    if(this.userData.length == 1) {
                        if(this.userPageIndex > 1) {
                            this.userPageIndex = this.userPageIndex - 1;
                        }
                    }
                    let value = this.searchConName.trimStart().trimEnd();
                    let str = '';
                    if(value != '' && value != undefined) {
                        str = `and (plt_displayName like '%${value}%' or plt_name like '%${value}%')`;
                        str = encodeURIComponent(str);
                    }
                    this.updateTabel(str, (this.userPageIndex - 1), this.selfPageSize);
                    this.$Message.success("删除用户成功");

                }

            }).catch(e => {
              console.log(e);
            });

        },

        cancelEditModal(state) {

            if(!state) {
                this.$refs.editFormUser.resetFields();
            }

        },

        // 新增用户
        addUser() {

            this.$refs['formUser'].resetFields();
            this.userTitle = '新增用户';
            this.userModal = true;

        },

        userSearch(eve) {
            let value = eve.target.value.trimStart().trimEnd();
            let str = '';
            if(value != '' && value != undefined) {
                str = `and (plt_displayName like '%${value}%' or plt_name like '%${value}%')`;
                str = encodeURIComponent(str);
            }
            this.userPageIndex = 1;
            this.updateTabel(str, 0, this.selfPageSize, true);
        },

        changePage(pageId) {
            let value = this.searchConName.trimStart().trimEnd();
            let str = '';
            if(value != '' && value != undefined) {
                str = `and (plt_displayName like '%${value}%' or plt_name like '%${value}%')`;
                str = encodeURIComponent(str);
            }
            this.updateTabel(str, (pageId - 1), this.selfPageSize);
        },

        changeUserPageSize(size) {
            this.selfPageSize = size;
            let value = this.searchConName.trimStart().trimEnd();
            let str = '';
            if(value != '' && value != undefined) {
                str = `and (plt_displayName like '%${value}%' or plt_name like '%${value}%')`;
                str = encodeURIComponent(str);
            }
            this.userPageIndex = 1;
            this.updateTabel(str, 0, this.selfPageSize);
        },

        // 更新用户信息
        updateUserEvent(type) {

            if(type == 'create') {
                this.$refs['formUser'].validate(valid => {
                    if (valid) {
                        // console.log(this.formUser);
                        let canAddUser = sessionStorage.getItem("usernameM") == 'admin';
                        if (!canAddUser) {
                            if (this.formUser.groupIds.length == 0) {
                                this.$Message.warning('非admin用户添加用户必须选择用户组')
                                return;
                            }
                        }

                        let finalUserParams = [{...this.formUser}];
                        delete finalUserParams[0].passwdCheck;
                        addNewUser(finalUserParams).then(res => {

                            if(res.success) {

                                let value = this.searchConName.trimStart().trimEnd();
                                let str = '';
                                if(value != '' && value != undefined) {
                                    str = `and (plt_displayName like '%${value}%' or plt_name like '%${value}%')`;
                                    str = encodeURIComponent(str);
                                }
                                this.userPageIndex = 1;
                                this.updateTabel(str, 0, this.selfPageSize);
                                this.$Message.success("新增用户成功");
                                this.userModal = false;

                            } else {
                                this.formUser.passwdCheck = '';
                                this.$Message.warning(res.message);
                            }

                        }).catch(e => {
                            console.log(e);
                        });

                    } else {
                        this.$Message.warning('用户信息格式有误');
                    }
                })
            } else {

                this.$refs['editFormUser'].validate(valid => {

                    if (valid) {
                        let canAddUser = sessionStorage.getItem("usernameM") == 'admin' || sessionStorage.getItem('usernameM') == this.editFormUser.name;

                        let finalUserParams = {...this.editFormUser};
                        if(finalUserParams.password == '' || finalUserParams.password == undefined) {
                            delete finalUserParams.password;
                        }
                        updateUser(finalUserParams).then(res => {
                            if(res.success) {

                                let value = this.searchConName.trimStart().trimEnd();
                                let str = '';
                                if(value != '' && value != undefined) {
                                    str = `and (plt_displayName like '%${value}%' or plt_name like '%${value}%')`;
                                    str = encodeURIComponent(str);
                                }
                                this.userPageIndex = 1;
                                this.updateTabel(str, (this.userPageIndex - 1), this.selfPageSize);
                                this.$Message.success("编辑用户成功");
                                this.userEditModal = false;

                            } else {
                                this.$Message.warning(res.message)
                            }

                        }).catch(e => {
                            console.log(e);
                        });

                    } else {
                        this.$Message.warning('用户信息格式有误');
                    }

                })

            }

        },

        cancelEdit() {

            this.$refs['editFormUser'].resetFields();
            this.userEditModal = false;
        }
    }
}
</script>

<style scoped>

</style>
