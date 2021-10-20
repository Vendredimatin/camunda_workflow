<template>
  <div :style="{borderTop: showTabs ? '' : '1px solid #e8eaec'}">
    <Card :bordered="false" dis-hover>
      <Row :gutter="8">
        <Col span="9" class="auth-tree">
          <div style="height: 30px;text-align: left; float:left; width:60%;">
            <a-tooltip><template slot='title'>{{currentRow.name ? (currentRow.name + (currentRow.displayName? '（' + currentRow.displayName + '）': '')) : ''}}</template>
            <span style='overflow: hidden; word-break: break-all; text-overflow: ellipsis; display: -webkit-box; -webkit-line-clamp: 1; -webkit-box-orient: vertical;'>
                          <span v-if="roleGroupName !== undefined">
              角色组（{{roleGroupName}}）下的</span><span v-else>全部</span>用户(组)列表：{{ currentRow.oid === undefined ? '（未选择）' : ('已选择 ' + currentRow.name + (currentRow.displayName? '（' + currentRow.displayName + '）' : "")) }}</span>
            </a-tooltip>
          </div>
          <div style="height: 30px;float: right">
            <span>是否显示用户 </span>
          <i-switch v-model="showUser" @on-change="changeShowUser" :loading="showUserLoading" />
          </i-switch>
          </div>
          <Input
            v-model="keywordUserGroup"
            id="objUserKey"
            icon="md-search"
            placeholder="输入关键词过滤用户/用户组"
          >
          </Input>
          <a-table
            v-if="refreshAtable"
            id="objUserTable"
            ref="userGroupTable"
            size="small"
            :indentSize="8"
            :columns="userGroupColumns"
            :dataSource="filteredUserGroups"
            :rowSelection="userGroupRowSelection"
          >
            <span  slot="name" slot-scope="text, record">
              <Icon  :type="oidToGroup[record.oid] === undefined ? 'md-person' : 'md-people'"></Icon>
              <a-tooltip><template slot='title'>{{ record.name }}</template>
                <span  style='overflow: hidden;
                  text-overflow: ellipsis;
                  display: inline-block;
                  float: right;
                  width: 150px;
                  white-space: nowrap;
                  word-break: break-all;'>
                  {{ record.name }}
                </span>
              </a-tooltip>
            </span>
          </a-table>
        </Col>
        <Col span="15" class="auth-tree">
          <div style="height: 30px;text-align: left">
            应用通道功能树 
            <Button type="primary" 
            id="saveTreeButton"
            size="small" 
            style="margin-right: 16px"
            :disabled="disabledUserGroupOid.indexOf(currentRow.oid) > -1 || createsRulesAuth || filteredUserGroups.length==0"
            @click="createRules()">保存</Button>
          </div>
          <Input
            v-model="keywordAuthWord"
            id="searchAuthWordInput"
            icon="md-search"
            placeholder="输入关键词查询"
          >
          </Input>
          <a-table
            ref="appTable"
            id="briefAppTable"
            size="small"
            :indentSize="8"
            :columns="applicationColumns"
            :dataSource="filteredAppData"
            :rowSelection="applicationSelection"
          >
            <span slot="name" slot-scope="text, record">
              <Icon :type="record.key.startsWith('app')? 'logo-dropbox': 'logo-tux'"></Icon>
              <a-tooltip><template slot='title'>{{ record.name  }}</template>
                <span style='overflow: hidden;
                  text-overflow: ellipsis;
                  display: inline-block;
                  float: right;
                  width: 150px;
                  white-space: nowrap;
                  word-break: break-all;'>
                  {{ record.name }}
                </span>
              </a-tooltip>
            </span>
            <span  slot="action" slot-scope="text, record">
              <div v-if="record.key.startsWith('app')">
                <Button  v-for="(value, key) in moduleActions" :key="key" size="small" :id="step(key)"
                    :type="record.actions[key] ? 'success' : 'default'"
                    :disabled="record.disabled || disabledUserGroupOid.indexOf(currentRow.oid) > -1"
                    @click="toggleAction(record.actions[key], `${record.key}_${key}`)" style="margin-left: 5px;">
                  {{value}}
                </Button>
              </div>
              <div v-else-if="record.key.startsWith('module')">
                <Button  v-for="(value, key) in opeActions" :key="key" size="small" :id="step(key)"
                    :type="record.actions[key] ? 'success' : 'default'"
                    :disabled="record.disabled || disabledUserGroupOid.indexOf(currentRow.oid) > -1"
                    @click="toggleAction(record.actions[key], `${record.key}_${key}`)" style="margin-left: 5px;">
                  {{value}}
                </Button>
              </div>
            </span>
          </a-table>

        </Col>
      </Row>
    </Card>

  </div>
</template>


<script>
  import {tableMixin} from "@/component/tableMixin"
  import ATable from 'ant-design-vue/lib/table';
  import 'ant-design-vue/lib/table/style/css';
  import ATooltip from 'ant-design-vue/lib/tooltip';
  import 'ant-design-vue/lib/tooltip/style/css';
  import AuthRules from "@/api/auth-model/AuthRules";
  import {getAllUserGroupTree, getGroupToGroups, getUserToGroups, getRoleGroup} from "@/api/others";
  import {getApps, getModules, getAllEntities, getAppModulesAndOperation, getAppModules, getModuleOperations} from "@/api/others";
  import {uuid, clone} from "@/util/assist";
  import {mapActions, mapGetters} from "vuex";
  import { checkClasses} from "@/api/auth-model/AuthEngine";


  var tmp=0.0;

  const isEmpty = str => {
    return str === undefined || str === null || str.trim() === '';
  };

  export default {
    name: 'auth-brief-enhance',
    mixins: [tableMixin],
    components: {
      ATable,
      ATooltip,
    },
    data() {
      
      const zeroId = '00000000000000000000000000000000';
      return {
        zeroId,
        refreshAtable: true,
        currentRow: {}, // 被选中的用户行
        groups: [],
        keywordUserGroup: '',
        keywordAuthWord: '',
        nodeKeyToParentKey: {},  // key，一对一，由keyword过滤后的树计算得到
        nodeKeyToChildrenKeys: {},  // key，一对多，由keyword过滤后的树计算得到
        nodeKeyToParentAppKey: {},
        nodeKeyToChildrenModuleKeys: {},
        userGroupTree: [],  // 用户组树原始数据
        userGroups: [],  // 用于展示的处理后用户（组）树数据【】
        userGroupColumns: [
          {
            title: '用户(组)名',
            dataIndex: 'name',
            key: 'name',
            width: '50%',
            scopedSlots: {customRender: 'name'},
          },
          {
            title: '显示名',
            dataIndex: 'displayName',
            key: 'displayName',
            width: '50%',
            customRender: (text, row, index) => {
              return <a-tooltip><template slot='title'>{text}</template><span id="mytest1" style='width: 150px; overflow: hidden; word-break: break-all;text-overflow: ellipsis; display: inline-block; white-space: nowrap; float: left;'>{text}</span></a-tooltip>;
            },
          },
        ],
        roleGroupName: undefined,
        selectedAppKeys: [],  // 处于全选状态的用户（组）key列表
        initSelecetAppMoudelKeys:[],
        indeterminateApps: [],
        filteredTreeData: [],
        rules: [],
        appRules: [],
        appData: [],
        operationData:[], // 计算二、三级菜单（操作）所需原始数据
        moduleData: [],
        moduleActions: {
          'SaveModules': '新增',
          'EditModules': '编辑',
          'DeleteModules': '删除',
        },
        opeActions: {
          'SaveOperations': '新增',
          'EditOperations': '编辑',
          'DeleteOperations': '删除',
        },
        ApplicationManagementAuth: true,
        disabledUserGroupOid: [],
        createsRulesAuth: false,
        changeUserGroup: true,
        showUser: false,
        showUserLoading: false,
        showTabs: true
      }
    },
    created() {
      console.log('created');
      let self = this;
      // 检查有没有功能模型的权限
      checkClasses('FunctionalModel', 'ApplicationManagement')
      .then(res => {
        self.ApplicationManagementAuth = res.data;
        this.getAllData();
      })
      .catch(error => {
        console.log(error)
      });
      // 禁止用户组和自身
      let usergroups = JSON.parse(sessionStorage.getItem('userGroupsM'))
      this.disabledUserGroupOid = usergroups.map(x => {return x.oid})
      this.disabledUserGroupOid.push(sessionStorage.getItem("oidM"))
      console.log(this.disabledUserGroupOid)
      this.createsRulesAuth = sessionStorage.getItem("usernameM") !== 'admin'

    },
    mounted() {
      this.showTabs = sessionStorage.getItem('showTabs') == 'hide' ? false : true
    },
    computed: {
      applicationColumns() {
        return this.ApplicationManagementAuth? [
          {
            title: '英文名',
            key: 'name',
            width: '35%',
            scopedSlots: {customRender: 'name'},
          },{
            title: '显示名',
            dataIndex: 'displayName',
            key: 'displayName',
            width: '30%',
            customRender: (text, row, index) => {
              return <a-tooltip><template slot='title'>{text}</template><span  style='overflow: hidden; word-break: break-all; text-overflow: ellipsis; display: inline-block; width: 150px; float: left;'>{text}</span></a-tooltip>;
            },
          },
          {
            title: '权限',
            key: 'action',
            width: '35%',
            scopedSlots: {customRender: 'action'},
          },
        ]:[
          {
            title: '英文名',
            key: 'name',
            width: '50%',
            scopedSlots: {customRender: 'name'},
          },{
            title: '显示名',
            dataIndex: 'displayName',
            key: 'displayName',
            width: '50%',
            customRender: (text, row, index) => {
              return <a-tooltip><template slot='title'>{text}</template><span  style='overflow: hidden; word-break: break-all; text-overflow: ellipsis; display: inline-block; width: 150px; float: left;'>{text}</span></a-tooltip>;
            },
          }
        ]
      },
      userGroupRowSelection() {
        return {
          type: 'radio',
          selectedRowKeys: [this.currentRow.key],
          onChange: (selectedRowKeys, selectedRows) => {
            // console.log(selectedRowKeys)
            this.currentRow = selectedRows[0];
            this.changeUserGroup = false;
            console.log(this.currentRow)
            this.updateAppMoudleRule();
          },
          getCheckboxProps: record => {
            // console.log(record)
            return {
              props: {
                // disabled: this.disabledUserGroupOid.indexOf(record.oid) > -1,
                // defaultChecked: record.index == 0 && this.changeUserGroup
              }
            }
          }
        }
      },
      filteredUserGroups() {
        // console.log('filter')
        let filter = (data, keyword) => {
          return data.filter(o => {
            let isMatch = o['name'] && o['name']
                    .toString()
                    .toLowerCase()
                    .match(keyword) !== null
                || o['displayName'] && o['displayName']
                    .toString()
                    .toLowerCase()
                    .match(keyword) !== null
                || o['comment'] && o['comment']
                    .toString()
                    .toLowerCase()
                    .match(keyword) !== null;
            // 如果当前节点match，则不对子节点做任何过滤（递归结束），方便用户搜索到想要的用户组后逐一修改组内用户权限
            // 如果不match，则只在某个子节点match时，当前节点作为match节点的父节点在过滤后的树结构中展示
            if (!isMatch && o.children) o.children = filter(o.children, keyword);
            // 无children节点不展示展开按钮
            if (o.children && o.children.length === 0) o.children = undefined;
            return isMatch || o.children;
          });
        };
        let filterGroup = (data) => {
          return data.filter(o => {
            let isGroup = o.key.startsWith('group');
            if (isGroup && o.children) o.children = filterGroup(o.children);
            if (o.children && o.children.length === 0) o.children = undefined;
            return isGroup
          })
        }

        let multiTree = JSON.parse(JSON.stringify(this.userGroups));
        if (!this.showUser) {
          multiTree = filterGroup(multiTree);
        }

        if (!isEmpty(this.keywordUserGroup)) {
          this.changeUserGroup = false;
          // deep copy multiTree by JSON.parse(JSON.stringify(obj))
          multiTree = filter(multiTree, this.keywordUserGroup.toLowerCase().trimStart().trimEnd());
        }
        // calculate nodeKeyToChildrenKeys & nodeKeyToParentKey using filtered multiTree data
        this.nodeKeyToParentKey = [];
        this.nodeKeyToChildrenKeys = [];
        let addParentChildPair = (parentKey, childKey) => {
          this.nodeKeyToParentKey[childKey] = parentKey;
          if (this.nodeKeyToChildrenKeys[parentKey] === undefined) {
            this.nodeKeyToChildrenKeys[parentKey] = [];
          }
          this.nodeKeyToChildrenKeys[parentKey].push(childKey);
        };
        let processRelation = (treeNode, i) => {
          treeNode.index = i;
          if (treeNode.children !== undefined && treeNode.children.length > 0) {
            for (let i=0; i < treeNode.children.length; i++) {
              addParentChildPair(treeNode.key, treeNode.children[i].key);
              processRelation(treeNode.children[i]);
            }
          }
        };
        for (let i=0;i< multiTree.length; i++) processRelation(multiTree[i], i);
        this.showUserLoading = false;
        return multiTree;
      },
      oidToGroup() {
        let res = {};
        for (let id in this.groups) {
          res[this.groups[id].oid] = {...this.groups[id]};
        }
        return res;
      },
      applicationSelection() {
        return {
          id:'applicationSelection',
          type: 'checkbox',
          columnTitle:' ',
          selectedRowKeys: this.selectedAppKeys,
          onChange: (selectedRowKeys, selectedRows) => {
            console.log('selectedRowKeys',this.selectedRowKeys)
            // console.log(selectedRowKeys, selectedRows)
            let that = this;
            // 此时this.selectedAppKeys为上次选中的所有key（带蔓延），selectedRowKeys为新的选中的所有key（变化项不带蔓延）
            // 计算新旧选中key列表之差，然后不再使用selectedRowKeys
            let addedKeys = selectedRowKeys.filter(x => { return that.selectedAppKeys.indexOf(x) < 0 });
            let removedKeys = this.selectedAppKeys.filter(x => { return selectedRowKeys.indexOf(x) < 0 });
            // 逐一做变化项的蔓延处理，更新this.selectedAppKeys
            for (let i=0; i < addedKeys.length; i++) this.selectAppMoudel(addedKeys[i]);
            for (let i=0; i < removedKeys.length; i ++) this.unselectAppMoudle(removedKeys[i]);
            console.log(addedKeys, removedKeys)

            this.enabledBtns(this.selectedAppKeys)
            // 此时this.selectedAppKeys已完成更新
            // setTimeout(this.showIndeterminateSelects, 0);  // 更新需要设为半选状态的节点列表，并显示为半选状态

          }
        }
      },
      filteredAppData() {
        // console.log('filter')
        let filter = (data, keyword) => {
          return data.filter(o => {
            let isMatch = o['name'] && o['name']
                    .toString()
                    .toLowerCase()
                    .match(keyword) !== null
                || o['displayName'] && o['displayName']
                    .toString()
                    .toLowerCase()
                    .match(keyword) !== null;
            // 如果当前节点match，则不对子节点做任何过滤（递归结束），方便用户搜索到想要的用户组后逐一修改组内用户权限
            // 如果不match，则只在某个子节点match时，当前节点作为match节点的父节点在过滤后的树结构中展示
            if (!isMatch && o.children) o.children = filter(o.children, keyword);
            // 无children节点不展示展开按钮
            if (o.children && o.children.length === 0) o.children = undefined;
            return isMatch || o.children;
          });
        };
        let multiTree;
        if (isEmpty(this.keywordAuthWord)) {
          multiTree = JSON.parse(JSON.stringify(this.filteredTreeData));
        } else {
          // deep copy multiTree by JSON.parse(JSON.stringify(obj))
          multiTree = filter(JSON.parse(JSON.stringify(this.filteredTreeData)), this.keywordAuthWord.toLowerCase().trimStart().trimEnd());
        }
        // calculate nodeKeyToChildrenModuleKeys & nodeKeyToParentAppKey using filtered multiTree data
        this.nodeKeyToParentAppKey = [];
        this.nodeKeyToChildrenModuleKeys = [];
        let addParentChildPair = (parentKey, childKey) => {
          this.nodeKeyToParentAppKey[childKey] = parentKey;
          if (this.nodeKeyToChildrenModuleKeys[parentKey] === undefined) {
            this.nodeKeyToChildrenModuleKeys[parentKey] = [];
          }
          this.nodeKeyToChildrenModuleKeys[parentKey].push(childKey);
        };
        let processRelation = treeNode => {
          if (treeNode.children !== undefined && treeNode.children.length > 0) {
            for (let i in treeNode.children) {
              addParentChildPair(treeNode.key, treeNode.children[i].key);
              processRelation(treeNode.children[i]);
            }
          }
        };
        for (let i =0; i < multiTree.length; i ++) processRelation(multiTree[i]);
        // console.log('update tree', multiTree)
        return multiTree;
      }
    },
    methods: {

      step(key){
        return key;
      },
      globalRefresh() {
        this.$Spin.show();
        this.getAllData(true);
      },
      hideSpin() {
        this.$Spin.hide();
      },
      getAppAuth(){
        let self = this;
        checkClasses('FunctionalModel', 'ApplicationManagement')
        .then(res => {
          self.ApplicationManagementAuth = res.data;
        })
        .catch(error => {
          console.log(error)
        });
      },
      addRootClassName(target, rootClassName) {
        let _self = this;
        let children = target.children;
        for (let i = 0; i < children.length; ++i) {
          let child = children[i];
          child.rootClassName = rootClassName;

          if (child.children && child.children.length > 0) {
            _self.addRootClassName(child, rootClassName);
          }
          else if (children && child.children.length === 0) {
            child.children = undefined;
          }

        }
        if (children && children.length === 0) {
          target.children = undefined;
        }

      },
      updateIndeterminateGroups() {
        let updateNode = key => {
          let childrenKeys = this.nodeKeyToChildrenModuleKeys[key];
          if (childrenKeys !== undefined && childrenKeys.length > 0) {
            let selectedChildrenCount = childrenKeys.filter(childKey => {
              return this.selectedAppKeys.indexOf(childKey) > -1;
            }).length;
            if (selectedChildrenCount > 0 && selectedChildrenCount < childrenKeys.length) {
              this.indeterminateGroups.push(this.oidToGroup[key.split('_')[1]]);
            }
            for (let i in childrenKeys) {
              updateNode(childrenKeys[i]);
            }
          }
        };
        this.indeterminateGroups = [];
        for (let i =0; i < this.filteredTreeData.length; i ++){
          updateNode(this.filteredTreeData[i].key);
        }
      },
      getAllData(rFlag) {
        // this.$Spin.show();
        this.classes = [];
        let promises = [];
        let appIndex = {};  // order in all roots
        let moduleIndex = {};  // order in app's children
        let operationIndex = {};  // order in module's children
        let authToOperation = {};  // operation's authority -> operation (只存了二级菜单)

        promises.push(
          AuthRules.getAllGroups().then(res => {
            this.groups = res.data;
          })
        );
        promises.push(
          getRoleGroup().then(res => {
            this.roleGroupName = res.data.data === undefined ? undefined : res.data.data.name;
          })
        );
        promises.push(getAppModulesAndOperation(true).then(res => {
          // console.log('getapps')
          // 获取并处理应用模块操作数据
          this.appData = res.data.data;
          for (let i = 0; i < this.appData.length; i++) {
            let actions = {};
            for (let key in this.moduleActions) {
              actions[key] = true;
            }
            this.appData[i].name = this.appData[i].appName;
            this.appData[i].displayName = this.appData[i].title;
            this.appData[i].key = `app_${this.appData[i].id}_${this.zeroId}`;
            this.appData[i].actions = actions;
            this.appData[i].disabled = true;

            let moduleData = this.appData[i].children;
            if (this.appData[i].appName == 'modeler' && moduleData.length > 0) {
              moduleData = moduleData.filter(x => {
                return x.className != 'ModelPackage'
              })
            }
            this.appData[i].children = moduleData.length > 0? moduleData : undefined;
            // console.log('moduleData', moduleData)
            for (let j = 0; j < moduleData.length; j++) {
              let actions = {};
              for (let key in this.opeActions) {
                actions[key] = true;
              }
              moduleData[j].name = moduleData[j].className;
              moduleData[j].key = `module_${moduleData[j].id}_${moduleData[j].appId}`;
              moduleData[j].actions = actions;
              moduleData[j].disabled = true;
              let operationData = moduleData[j].children;
              // console.log('operationData', operationData)
              if (
                this.appData[i].appName == 'modeler' && operationData.length > 0) {
                operationData = operationData.filter(x => {
                  return x.conditionExpre != 'addin:AuthBlock'
                  && x.conditionExpre != 'addin:AttrAccessRule'
                  && x.conditionExpre != 'addin:ObjAccessRule'
                  && x.conditionExpre != 'addin:OnlineManagement'
                  && x.conditionExpre != 'addin:ModelPackageManage'
                  && x.conditionExpre != 'addin:CodeAssembly'
                })
              }
              for (let k = 0; k < operationData.length; k++) {
                operationData[k].name = operationData[k].authority;
                operationData[k].key = `operation_${operationData[k].oid}_${moduleData[j].id}`;
                if (operationData[k].action == 'folder') {
                  for (let p = 0; p < operationData[k].children.length; p++) {
                    operationData[k].children[p].children = undefined;
                    operationData[k].children[p].name = operationData[k].children[p].authority;
                    operationData[k].children[p].key = `operation_${operationData[k].children[p].oid}_${operationData[k].oid}`;
                    operationData[k].children[p].rootModuleName = operationData[k].moduleName;
                  }
                  this.operationData = this.operationData.concat(operationData[k].children)
                }
                else {
                  operationData[k].children = undefined;
                }
                
              }
              moduleData[j].children = operationData.length > 0 ? operationData: undefined;
              this.operationData = this.operationData.concat(operationData)
              // console.log('operationData', j, this.operationData, operationData)
            }
            this.moduleData = this.moduleData.concat(moduleData)
          }
        }));
        Promise
            .all(promises)
            .then(res => {
              getAllUserGroupTree({rootGroupName: this.roleGroupName})
                .then(res => {
                  this.userGroupTree = res.data.data;
                  this.classes.sort(function (a, b) {
                    return a.className.toString().toLowerCase() > b.className.toString().toLowerCase() ? 1 : -1;
                  });

                  this.userGroups = [];
                  // 先处理成适应表格展示的数据，再传给表格数据源即this.userGroups（否则ATable会报错，如duplicate key）
                  let processTreeNode = (node, parent, role) => {
                    let curNode = {...node};
                    // 根据现有前端逻辑，用户displayName非undefined，故藉此判断递归终点（是用户而非用户组）
                    // if (curNode.displayName === undefined) {  // 用户组节点
                      curNode.children = [];
                      curNode.key = `${role}_${curNode.oid}_${parent.oid}`;

                      let groupNodes = [];
                      let userNodes = [];
                      for (let idg = 0; curNode.childrenGroups && idg < curNode.childrenGroups.length; idg++) {
                        groupNodes.push(processTreeNode(curNode.childrenGroups[idg], curNode, 'group'));
                      }
                      for (let idu = 0; curNode.users && idu < curNode.users.length; idu++) {
                        userNodes.push(processTreeNode(curNode.users[idu], curNode, 'user'));
                      }
                      for (let idg = 0; idg < groupNodes.length; idg++) curNode.children.push(groupNodes[idg]);
                      for (let idu = 0; idu < userNodes.length; idu++) curNode.children.push(userNodes[idu]);
                    if (curNode.children && curNode.children.length === 0) curNode.children = undefined
                    return curNode;
                  };
                  for (let id = 0; id < this.userGroupTree.childrenGroups.length; id++) {
                    this.userGroups.push(processTreeNode(this.userGroupTree.childrenGroups[id], {oid: this.zeroId}, 'group'));
                  }
                  for (let id = 0; id < this.userGroupTree.users.length; id++) {
                    this.userGroups.push(processTreeNode(this.userGroupTree.users[id], {oid: this.zeroId}, 'user'));
                  }
                  // 初始化用户选择
                  console.log('init currentRow',this.currentRow, this.userGroups.length)
                  if (this.currentRow.oid === undefined && this.userGroups.length > 0 && this.userGroups[0].key.startsWith('group')) {
                    // console.log(this.currentRow)
                    this.currentRow = this.userGroups[0];
                  }
                })
                .then( res => {
                  this.filteredTreeData = this.appData.slice(0);
                  // console.log('filteredTreeData',this.filteredTreeData)
                  // console.log('moduleData', this.moduleData)
                  // console.log('operationData', this.operationData)
                  if(rFlag) {
                    console.log('rflag')
                    if (this.currentRow.oid === undefined && this.userGroups.length > 0 && this.userGroups[0].key.startsWith('group')) {
                      // console.log(this.currentRow)
                      this.currentRow = this.userGroups[0];
                    }
                    this.refreshAtable = false;
                      setTimeout(() => {
                      this.refreshAtable = true;
                      this.updateAppMoudleRule();
                      this.hideSpin();
                    }, 100)

                  } else {
                    this.updateAppMoudleRule();
                    this.hideSpin();
                  }
                })
                .catch(error => {
                  console.log(error)
                  this.updateAppMoudleRule();
                  this.hideSpin();
                });
            })
            .catch(error => {
              this.updateAppMoudleRule();
              this.hideSpin();
            });
      },
      resetAuth() {
        if (!this.ApplicationManagementAuth) return;
        let self = this;
        // console.log('reset auth')
        AuthRules.getAllRules()
          .then(res => {
            if (self.currentRow.key) {
              self.appRules = res.data.filter(rule => {
                return rule.participant === self.currentRow.name && rule.conditionId==='AlwayseFalse';
              });
              // console.log(self.appRules)
              for (let k = 0; k < self.filteredTreeData.length; k ++) {
                if (self.filteredTreeData[k].children) {
                  for (let j = 0; j < self.filteredTreeData[k].children.length; j ++) {
                    for(let opekey in self.opeActions) {
                      // console.log(opekey)
                      self.filteredTreeData[k].children[j].actions[opekey] = self.appRules.filter(x => {
                        // console.log(x.className, self.filteredTreeData[k].children[j].className, x.authority, opekey)
                        return x.className == self.filteredTreeData[k].children[j].className && x.authority == opekey
                      }).length == 0;
                      // console.log(self.filteredTreeData[k].children[j].actions[opekey])
                    }
                    // console.log(self.filteredTreeData[k].children[j].actions)

                  }
                }
                for(let key in self.moduleActions) {
                  self.filteredTreeData[k].actions[key] = self.appRules.filter(x => {
                    return x.className == `APP_${self.filteredTreeData[k].name}` && x.authority == key
                  }).length == 0;
                }
              };
              this.filteredTreeData = clone(this.filteredTreeData)
              // console.log(self.filteredTreeData)
            }
            this.hideSpin();
          })
          .catch(error => {
            this.hideSpin();
          });

      },
      enabledBtns(selectApp){
        for (let i =0; i <this.filteredTreeData.length; i ++){
          this.filteredTreeData[i].disabled = selectApp.indexOf(this.filteredTreeData[i].key) == -1
          if (this.filteredTreeData[i].children) {
            for (let j =0; j <this.filteredTreeData[i].children.length; j ++){
              this.filteredTreeData[i].children[j].disabled = selectApp.indexOf(this.filteredTreeData[i].children[j].key) == -1
            }
          }
        };
        this.filteredTreeData = clone(this.filteredTreeData)
      },
      async toggleAction(checked, name){
        console.log(checked, name)
        let _self = this;
        let res = await checkClasses('FunctionalModel', 'ApplicationManagement');
        this.ApplicationManagementAuth = res.data;
        if (!this.ApplicationManagementAuth) {
          this.$Message.error('没有应用管理权限');
          return;
        };
        let id = name.split('_')[1];
        let action = name.split('_')[3];
        let item = null;
        let classname = '';
        if (name.startsWith('app')){
          let appitem = this.appData.filter(x => {
            return x.id === id
          });
          if (appitem.length == 0) return;
          item = appitem[0];
          classname = `APP_${item.name}`
        }
        else if (name.startsWith('module')){
          let moduleitem = this.moduleData.filter(x => {
            return x.id === id
          });
          if (moduleitem.length == 0) return;
          item = moduleitem[0];
          classname = item.className;
        }

        if (this.rules.filter(x => {
          // console.log(x.className, x.authority, classname)
          return x.className == classname
        }).length == 0) {
          _self.$Message.error('没有保存');
          return;
        }
        console.log(item)

        // 创建规则
        if (checked) {
          let addRules = [{
            "attrName": "",
            "authority": action,
            "className": classname,
            "conditionId": "AlwayseFalse",
            "isInheritant": true,
            "level": 0,
            "note": "",
            "oid": "",
            "participant": this.currentRow.name
          }];
          console.log(addRules)
          
          AuthRules.createRules(addRules).then(res => {
            _self.updateAppMoudleRule();
            _self.$Message.success("保存成功");
          }).catch(err => {
            console.log(err)
            // _self.$Message.error('网络错误');
            _self.updateAppMoudleRule();
          });
        }
        // 删除规则
        else {
          let todelete = this.appRules.filter(x => {
            return x.conditionId == 'AlwayseFalse'
            && x.participant == this.currentRow.name
            && x.className == classname
            && x.authority == action
          });
          console.log('todelete', todelete)
          if (todelete.length == 0) return;
          AuthRules.deleteRules([todelete[0].oid]).then(res => {
            _self.updateAppMoudleRule();
            _self.$Message.success("保存成功");
          }).catch(e => {
            _self.updateAppMoudleRule();
          });
        }
      },
      createRules() {
        this.$Spin.show();
        let _self = this;
        let addKeys = this.selectedAppKeys.filter(x => {return _self.initSelecetAppMoudelKeys.indexOf(x) < 0 })
        const deleteKeys = this.initSelecetAppMoudelKeys.filter(x => {return _self.selectedAppKeys.indexOf(x) < 0 })
        addKeys = Array.from(new Set(addKeys))
        console.log(addKeys)
        let chosenItems = [];
        let deleteAuthority = [];
        for (let i = 0; i < addKeys.length; i ++){
          if (!addKeys[i]) continue;
          let id = addKeys[i].split('_')[1];
          if (addKeys[i].startsWith('app')) {
            chosenItems = chosenItems.concat(this.appData.filter(x => {
              return x.id === id
            }))
          }
          else if (addKeys[i].startsWith('module')) {
            chosenItems = chosenItems.concat(this.moduleData.filter(x => {
              return x.id === id
            }))
          }
          else if (addKeys[i].startsWith('operation')) {
            chosenItems = chosenItems.concat(this.operationData.filter(x => {
              return x.oid === id
            }))
          }
        }
        for (let i = 0; i < deleteKeys.length; i ++){
          if (!deleteKeys[i]) continue;
          let id = deleteKeys[i].split('_')[1];
          if (deleteKeys[i].startsWith('app')) {
            deleteAuthority = deleteAuthority.concat(this.appData.filter(x => {
              return x.id === id
            }).map(x => {
              return `APP_${x.name}`;
            }))
          }
          else if (deleteKeys[i].startsWith('module')) {
            deleteAuthority = deleteAuthority.concat(this.moduleData.filter(x => {
              return x.id === id
            }).map(x => {
              return x.name;
            }))
          }
          else if (deleteKeys[i].startsWith('operation')) {
            deleteAuthority = deleteAuthority.concat(this.operationData.filter(x => {
              return x.oid === id
            }).map(x => {
              return x.name;
            }))
          }
        }
        let has = {};
        chosenItems = chosenItems.reduce((prev, cur) => {
          if (!has[cur.key]) {
            prev.push(cur);
            has[cur.key] = true;
          }
          return prev;
        }, [])
        console.log('chosenItems', chosenItems)
        console.log('deleteKeys', deleteKeys)
        let addRules = chosenItems.map(item => {
          return {
            "attrName": "",
            "authority": item.key.startsWith('app')? `APP_${item.name}`:item.name,
            "className": item.rootModuleName || item.moduleName || item.className || `APP_${item.name}`,
            "conditionId": "AlwaysTrue",
            "isInheritant": true,
            "level": 0,
            "note": "",
            "oid": "",
            "participant": this.currentRow.name
          }
        });
        if (addRules && addRules.length > 0) {
          AuthRules.createRules(addRules).then(res => {
            _self.updateAppMoudleRule();
            _self.$Message.success("保存成功");
          }).catch(err => {
            console.log(err)
            // _self.$Message.error('网络错误');
            _self.updateAppMoudleRule();
          });
        }
        else {
          if (deleteKeys.length == 0) {
            _self.$Message.info("没有添加新规则");
            _self.hideSpin();
          }
        }

        if (deleteKeys.length > 0) {
          let ruleOids = [];
          for (let i=0; i < this.rules.length; i ++) {
            if (deleteAuthority.indexOf(this.rules[i].authority) > -1) {
              ruleOids.push(this.rules[i].oid);
            }
          }
          AuthRules.deleteRules(ruleOids).then(res => {
            _self.updateAppMoudleRule();
            _self.$Message.success("保存成功");
          }).catch(e => {
            _self.updateAppMoudleRule();
          });
        }
      },
      updateAppMoudleRule() {
        // console.log('update',this.currentRow)
        this.selectedAppKeys = [];
        AuthRules.getAllRules()
          .then(res => {
            if (this.currentRow.key) {
              this.rules = res.data.filter(rule => {
                return rule.participant === this.currentRow.name && rule.conditionId==='AlwaysTrue';
              });
              // console.log('this.rules',this.rules)
              this.refreshCheckBoks();
              this.selectedAppKeys = clone(this.initSelecetAppMoudelKeys);
              this.enabledBtns(this.selectedAppKeys)
              if (this.ApplicationManagementAuth) {
                this.appRules = res.data.filter(rule => {
                  return rule.participant === this.currentRow.name && rule.conditionId==='AlwayseFalse';
                });
                for (let k =0; k < this.filteredTreeData.length; k ++) {
                  if (this.filteredTreeData[k].children) {
                    for (let j=0; j < this.filteredTreeData[k].children.length; j ++){
                      for(let opekey in this.opeActions) {
                        this.filteredTreeData[k].children[j].actions[opekey] = this.appRules.filter(x => {
                          return x.className == this.filteredTreeData[k].children[j].className && x.authority == opekey
                        }).length == 0;
                      }
                    }
                  }
                  for(let key in this.moduleActions) {
                    this.filteredTreeData[k].actions[key] = this.appRules.filter(x => {
                      return x.className == `APP_${this.filteredTreeData[k].name}` && x.authority == key
                    }).length == 0;
                  }
                };
                this.filteredTreeData = clone(this.filteredTreeData)

              }
            }
            this.hideSpin();
          })
          .catch(error => {
            this.hideSpin();
          });
      },
      refreshCheckBoks() {
        this.initSelecetAppMoudelKeys = [];
        let processChildModuleOpera = (node) => {
          let tmprules = this.rules.filter(rule => {
            if (node.key.startsWith('app')) return rule.authority === `APP_${node.name}` && rule.conditionId==='AlwaysTrue';
            return rule.authority === node.name && rule.conditionId==='AlwaysTrue';
          });
          if (tmprules.length > 0) {
            // if (node.key.startsWith('app_')) console.log(node.key, node.name, node.displayName, tmprules)
            this.initSelecetAppMoudelKeys.push(node.key)
          }
          if (node.children && node.children.length > 0) {

            for (let i = 0; i < node.children.length; ++i) {
              processChildModuleOpera(node.children[i])
            }
          }
        }

        for (let i = 0; i < this.filteredTreeData.length; ++i) {
          processChildModuleOpera(this.filteredTreeData[i])
        }
      },
      showIndeterminateSelects() {
        this.updateIndeterminateGroups();
        console.log('indeterminateGroups',this.indeterminateGroups)
        if (document.getElementsByClassName('ivu-col-span-15').length === 0) return;
        let card = document.getElementsByClassName('ivu-col-span-15')[0];
        let checkboxes = card.querySelectorAll("input[type='checkbox']");
        let icons = card.querySelectorAll("i.ivu-icon-logo-dropbox, i.ivu-icon-logo-tux");
        let n = checkboxes.length;
        if (n !== icons.length) return;
        for (let i = 0; i < n; ++i) {
          let text = icons[i].nextSibling.innerText.trim();
          let groupOrder = this.indeterminateGroups.findIndex(group => {
            return group.name === text;
          });
          if (groupOrder > -1) {
            checkboxes[i].parentNode.classList.remove('ant-checkbox-checked');
            checkboxes[i].parentNode.classList.add('ant-checkbox-indeterminate');
          }
        }
      },
      selectFatherAuto(key) {
        // auto表示由蔓延处理选中状态的改变，而非用户手动选择/反选
        // 若存在父亲节点，且父亲节点的所有子节点全部被选中，则向树的上一层递归
        this.addToSelectedAppKeys(key);
        let parentKey = this.nodeKeyToParentAppKey[key];
        if (parentKey !== undefined) this.selectFatherAuto(parentKey);
      },
      unselectFatherAuto(key) {
        // auto表示由蔓延处理选中状态的改变，而非用户手动选择/反选
        // 若存在父亲节点，则向树的上一层递归
        this.removeFromSelectedAppKeys(key);
        let parentKey = this.nodeKeyToParentAppKey[key];
        if (parentKey !== undefined) this.unselectFatherAuto(parentKey);
      },
      isAllChildrenSelected(key) {
        let childrenKeys = this.nodeKeyToChildrenModuleKeys[key];
        if (childrenKeys === undefined) return true;
        return childrenKeys.filter(key => {
          return this.selectedAppKeys.indexOf(key) < 0;
        }).length === 0;
      },
      setAllChildrenSelected(key, selected) {
        // 递归地将用户组的所有子应用选中状态改为true/false
        let childrenKeys = this.nodeKeyToChildrenModuleKeys[key];
        if (childrenKeys !== undefined && childrenKeys.length > 0) {
          for (let i =0; i < childrenKeys.length; i++){
            if (selected) this.addToSelectedAppKeys(childrenKeys[i]);
            else this.removeFromSelectedAppKeys(childrenKeys[i]);
            this.setAllChildrenSelected(childrenKeys[i], selected);
          }
        }
      },
      selectAppMoudel(key) {
        // select curNode
        this.addToSelectedAppKeys(key);
        // cascade
        if (key.split('_')[0] === 'app' || key.split('_')[0] === 'module' || key.split('_')[0] === 'operation') {
          this.setAllChildrenSelected(key, true);
        }
        // 上文必须先执行，因为下面selectFatherAuto是从当前节点（而非父节点）开始递归
        this.selectFatherAuto(key);
      },
      unselectAppMoudle(key) {
        // unselect curNode
        this.removeFromSelectedAppKeys(key);
        // cascade
        if (key.split('_')[0] === 'app' || key.split('_')[0] === 'module' || key.split('_')[0] === 'operation') {
          this.setAllChildrenSelected(key, false);
        }
        // this.unselectFatherAuto(key);
      },
      addToSelectedAppKeys(key) {
        this.selectedAppKeys.push(key);
        this.selectedAppKeys = [...new Set(this.selectedAppKeys)];
      },
      removeFromSelectedAppKeys(key) {
        let s = new Set(this.selectedAppKeys);
        s.delete(key);
        this.selectedAppKeys = [...s];
      },
      changeShowUser() {
        this.showUserLoading = true;
        if (!this.showUser && this.currentRow && this.currentRow.key && this.currentRow.key.startsWith('user')) {
          if (this.filteredUserGroups.length == 0) {
            this.currentRow = {};
            this.selectedAppKeys = [];
            this.enabledBtns(this.selectedAppKeys)
            return;
          }
          this.currentRow = this.filteredUserGroups[0];
          console.log('user change ', this.currentRow)
          this.changeUserGroup = false;
          this.updateAppMoudleRule();
        }
        if (this.showUser && this.currentRow && !this.currentRow.key) {
          // console.log('no user')
          if (this.filteredUserGroups.length > 0) {
            this.currentRow = this.filteredUserGroups[0];
            // console.log('user change ', this.currentRow)
            this.changeUserGroup = false;
            this.updateAppMoudleRule();
          }
        }
      }
    }
  }


</script>
<style scoped>
  .auth-tree {
    /* height: 715px; */
    overflow-x: hidden;
    /* overflow-y: auto; */
  }
  @media screen and (max-width: 1400px) {
    .auth-tree {
      /* height: 420px; */
    }
  }
</style>
