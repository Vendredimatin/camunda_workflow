<template>
  <div>
    <Card :bordered="false" dis-hover>
      <Row :gutter="8">
        <Col span="9" class="auth-tree">
          <div style="height: 30px; text-align: left">
            当前选中项：{{currentRow.id === undefined ? '（无）' : currentRow.attributeName ? `类 ${currentRow.className} - 属性 ${currentRow.attributeName}` : `类 ${currentRow.className}` }}
          </div>
          <Input
            v-model="keyword"
            id="searchBlockWord"
            icon="md-search"
            placeholder="输入关键词过滤实体类/关联类"
          >
          </Input>
          <a-table
            v-if="refreshAtable"
            id="blockClassTable"
            size="small"
            :indentSize="8"
            childrenColumnName="attributes"
            :columns="classColumns"
            :dataSource="filteredClasses"
            :rowSelection="classRowSelection"
            @expand="onClassExpand"
            
          >
          </a-table>
        </Col>
        <Col span="15" class="auth-tree" v-if="currentRow.id !== undefined">
          <div v-if="!batchMode" style="height: 30px; text-align: left;float:left; width:70%;">
            <Button id="switchModelButton" type="primary" size="small" @click="toggleBatchMode">进入批量模式</Button>
          </div>
          <div v-else style="height: 30px; text-align: left;float:left; width:70%;">
            <Button type="primary" size="small" @click="toggleBatchMode" style="margin-right: 16px">进入独立模式</Button>
            <RadioGroup v-model="batchActionState" id="batchRadio">
              <Radio label="批量允许"></Radio>
              <Radio label="批量禁止"></Radio>
            </RadioGroup>
            <Button v-for="(value, key) in actions" :key="key" :id="batchButtonId(key)" @click="batchAction(key)"
                    style="margin-left: 5px;" size="small"
                    :type="batchActionState === '批量允许' ? 'success' : 'error'"
                    :disabled="selectedGroupIds.length + selectedUserIds.length === 0"
            >
              {{value}}
            </Button>
          </div>
          <div style="height: 30px;float: right">
            <span>是否显示用户 </span>
          <i-switch v-model="showUser" @on-change="changeShowUser" :loading="showUserLoading" />
          </i-switch>
          </div>
          <Input
            v-model="keywordUserGroup"
            id="searchBlockUserWord"
            icon="md-search"
            placeholder="输入关键词过滤用户/用户组"
          >
          </Input>
          <a-table
            ref="userGroupTable"
            id="blockUserTable"
            size="small"
            :indentSize="8"
            :columns="userGroupColumns"
            :dataSource="filteredUserGroups"
            :rowSelection="userGroupRowSelection"
            @expand="onUserGroupExpand"
          >
            <span id="mytest2" slot="name" slot-scope="text, record">
              <Icon :type="oidToGroup[record.oid] === undefined ? 'md-person' : 'md-people'"></Icon>
              <a-tooltip><template slot='title'>{{ record.name }}</template>
                <span style='overflow: hidden;
                  text-overflow: ellipsis;
                  display: inline-block;
                  float: right;
                  width: 60%;
                  white-space: nowrap;
                  word-break: break-all;'
                >
                  {{ record.name }}
                </span>
              </a-tooltip>
            </span>
            <span id="mytest1" slot="action" slot-scope="text, record">
              <!-- <Tag checkable :checked="record.actions[key]" v-for="(value, key) in actions" :key="key"
                   :name="`${record.key}_${key}`" @on-change="toggleAction" style="margin-left: 5px;" color="success">
                {{value}}
              </Tag> -->
              <Button  v-for="(value, key) in actions" :key="key" size="small" :id="testbutton(key)"
                  :type="record.actions[key] ? 'success' : 'default'"
                  :disabled="record.disabled[key]"
                  @click="toggleAction(record.actions[key], `${record.key}_${key}`)" style="margin-left: 5px;">
                {{value}}
              </Button>
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
  import EntityModeling from "@/api/data-model/EntityModeling";
  import RelationModeling from "@/api/data-model/RelationModeling";
  import {getAllUserGroupTree, getGroupToGroups, getUserToGroups} from "@/api/others";
  import {uuid, clone} from "@/util/assist";

  const isEmpty = str => {
    return str === undefined || str === null || str.trim() === '';
  };

  export default {
    name: 'auth-block',
    mixins: [tableMixin],
    components: {
      ATable,
      ATooltip,
    },
    data() {
      const zeroId = '00000000000000000000000000000000';
      const AlwaysFalse = 'AlwayseFalse';
      const AlwaysTrue = 'AlwaysTrue';
      const maxInt = 2147483647;
      return {
        zeroId,
        AlwaysFalse,
        AlwaysTrue,
        maxInt,
        currentRow: {},
        keyword: '',
        classes: [],
        classColumns: [
          {
            title: '英文名',
            dataIndex: 'engName',
            key: 'engName',
            width: '60%',
            className: 'center',
            customRender: (text, row, index) => {
              return <a-tooltip><template slot='title'>{text}</template><span style='overflow: hidden;text-overflow: ellipsis;display: inline-block;float: right;width: 80%;white-space: nowrap;word-break: break-all;'>{text}</span></a-tooltip>;
            },
          },
          {
            title: '显示名',
            dataIndex: 'displayName',
            key: 'displayName',
            width: '40%',
            customRender: (text, row, index) => {
              return <a-tooltip><template slot='title'>{text}</template><span style='overflow: hidden; word-break: break-all; text-overflow: ellipsis; display: -webkit-box; -webkit-line-clamp: 1; -webkit-box-orient: vertical;'>{text}</span></a-tooltip>;
            },
          },
        ],
        refreshAtable: true,
        batchMode: false,
        users: [],
        groups: [],
        keywordUserGroup: '',
        groupToChildGroup: {},  // oid，一对多
        groupToParentGroup: {},  // oid，一对一
        userToGroup: {},  // oid，一个用户->多个父组
        groupToUser: {},  // oid，一个用户组->多个子用户
        nodeKeyToParentKey: {},  // key，一对一，由keyword过滤后的树计算得到
        nodeKeyToChildrenKeys: {},  // key，一对多，由keyword过滤后的树计算得到
        userGroupTree: [],  // 用户组树原始数据
        userGroups: [],  // 用于展示的处理后用户（组）树数据
        targetSelectedRowKeys: [],
        targetSelectedRows: {},
        classRowSelection: {
          type: 'radio',
          onChange: (selectedRowKeys, selectedRows) => {
            this.targetSelectedRowKeys = selectedRowKeys;
            this.targetSelectedRows = selectedRows;
            if (selectedRowKeys.length === 0) {  // select none
              this.currentRow = {};
            } else if (selectedRows.length > 0) {  // select class
              this.currentRow = selectedRows[0];
            } else {  // select attribute (of internal/external class)
              let tmp = selectedRowKeys[0].split('|');
              let classId = tmp[0];
              let attrId = tmp[tmp.length - 2];
              let clList = this.classes.filter(item => {
                return item.id === classId;
              });
              if (clList.length === 0) {
                this.currentRow = {};
              } else {
                let attrList = clList[0].attributes.filter(item => {
                  return item.id === attrId;
                });
                if (attrList.length === 0) {
                  this.currentRow = {};
                } else {
                  this.currentRow = attrList[0];
                }
              }
            }
            this.hideSpinAndRefresh();
          },
          getCheckboxProps: record => {
            // console.log(record)
            return {
              props: {
                defaultChecked: this.currentRow && this.currentRow.key == record.key
              }
            }
          }
        },
        selectedUserGroupKeys: [],  // 处于全选状态的用户（组）key列表
        indeterminateGroups: [],  // 需要设为半选状态的用户组列表，由keyword过滤后的树计算得到
        selectedUserIds: [],
        selectedGroupIds: [],
        rules: [],
        batchActionState: '批量允许',
        showUser: false,
        showUserLoading: false
      }
    },
    computed: {
      actions() {
        if (this.currentRow.attributeName === undefined) {
          return {
            'CreateObjects': '新增',
            'EditObjects': '编辑',
            'CommonOpAuth': '查询',
            'DeleteObj': '删除',
          };
        } else {
          return {
            'EditObjects': '编辑',
            'CommonOpAuth': '查询',
          };
        }
      },
      // classRowSelection() {
      //   return {
      //     selectedRowKeys: this.targetSelectedRowKeys,
      //     type: 'radio',
      //     onChange: (selectedRowKeys, selectedRows) => {
      //       this.targetSelectedRowKeys = selectedRowKeys;
      //       this.targetSelectedRows = selectedRows;
      //       if (selectedRowKeys.length === 0) {  // select none
      //         this.currentRow = {};
      //       } else if (selectedRows.length > 0) {  // select class
      //         this.currentRow = selectedRows[0];
      //       } else {  // select attribute (of internal/external class)
      //         let tmp = selectedRowKeys[0].split('|');
      //         let classId = tmp[0];
      //         let attrId = tmp[tmp.length - 2];
      //         let clList = this.classes.filter(item => {
      //           return item.id === classId;
      //         });
      //         if (clList.length === 0) {
      //           this.currentRow = {};
      //         } else {
      //           let attrList = clList[0].attributes.filter(item => {
      //             return item.id === attrId;
      //           });
      //           if (attrList.length === 0) {
      //             this.currentRow = {};
      //           } else {
      //             this.currentRow = attrList[0];
      //           }
      //         }
      //       }
      //       this.hideSpinAndRefresh();
      //     },
      //   }
      // },
      userGroupColumns() {
        return this.batchMode ? [
          {
            title: '用户(组)',
            key: 'name',
            width: '30%',
            scopedSlots: {customRender: 'name'},
          },
          {
            title: '显示名',
            dataIndex: 'displayName',
            key: 'displayName',
            width: '30%',
            customRender: (text, row, index) => {
              return <a-tooltip><template slot='title'>{text}</template><span style='overflow: hidden; word-break: break-all; text-overflow: ellipsis; display: -webkit-box; -webkit-line-clamp: 1; -webkit-box-orient: vertical;'>{text}</span></a-tooltip>;
            },
          },
          {
            title: '父级组',
            dataIndex: 'parent',
            key: 'parent',
            width: '40%',
            customRender: (text, row, index) => {
              return <a-tooltip><template slot='title'>{text}</template><span style='overflow: hidden; word-break: break-all; text-overflow: ellipsis; display: -webkit-box; -webkit-line-clamp: 1; -webkit-box-orient: vertical;'>{text}</span></a-tooltip>;
            },
          },
        ] : [
          {
            title: '用户(组)',
            key: 'name',
            width: '30%',
            scopedSlots: {customRender: 'name'},
          },
          {
            title: '显示名',
            dataIndex: 'displayName',
            key: 'displayName',
            width: '18%',
            customRender: (text, row, index) => {
              return <a-tooltip><template slot='title'>{text}</template><span style='overflow: hidden; word-break: break-all; text-overflow: ellipsis; display: -webkit-box; -webkit-line-clamp: 1; -webkit-box-orient: vertical;'>{text}</span></a-tooltip>;
            },
          },
          {
            title: '父级组',
            dataIndex: 'parent',
            key: 'parent',
            width: '12%',
            customRender: (text, row, index) => {
              return <a-tooltip><template slot='title'>{text}</template><span style='overflow: hidden; word-break: break-all; text-overflow: ellipsis; display: -webkit-box; -webkit-line-clamp: 1; -webkit-box-orient: vertical;'>{text}</span></a-tooltip>;
            },
          },
          {
            title: '权限',
            key: 'action',
            width: '40%',
            scopedSlots: {customRender: 'action'},
          },
        ];
      },
      userGroupRowSelection() {
        return this.batchMode ? {
          type: 'checkbox',
          selectedRowKeys: this.selectedUserGroupKeys,
          onChange: (selectedRowKeys, selectedRows) => {
            let that = this;
            // 此时this.selectedUserGroupKeys为上次选中的所有key（带蔓延），selectedRowKeys为新的选中的所有key（变化项不带蔓延）
            // 计算新旧选中key列表之差，然后不再使用selectedRowKeys
            let addedKeys = selectedRowKeys.filter(x => { return that.selectedUserGroupKeys.indexOf(x) < 0 });
            let removedKeys = this.selectedUserGroupKeys.filter(x => { return selectedRowKeys.indexOf(x) < 0 });
            // 逐一做变化项的蔓延处理，更新this.selectedUserGroupKeys
            for (let i=0;i < addedKeys.length; i ++) this.selectUserGroup(addedKeys[i]);
            for (let i=0;i < removedKeys.length; i ++) this.unselectUserGroup(removedKeys[i]);
            // 此时this.selectedUserGroupKeys已完成更新
            setTimeout(this.showIndeterminateSelects, 0);  // 更新需要设为半选状态的节点列表，并显示为半选状态
            this.selectedUserIds = [];
            this.selectedGroupIds = [];
            for (let id =0; id <this.selectedUserGroupKeys.length; id ++) {
              if (this.selectedUserGroupKeys[id].startsWith('user_')) {
                let userId = this.selectedUserGroupKeys[id].split('_')[1];
                this.selectedUserIds.push(userId);
              } else {
                let groupId = this.selectedUserGroupKeys[id].split('_')[1];
                this.selectedGroupIds.push(groupId);
              }
            }
            this.selectedUserIds = [...new Set(this.selectedUserIds)];
            this.selectedGroupIds = [...new Set(this.selectedGroupIds)];
          },
        } : undefined;
      },
      filteredClasses() {
        if (isEmpty(this.keyword)) return clone(this.classes);
        let keywordLower = this.keyword.toLowerCase().trimStart().trimEnd();
        let res = [];
        for (let id=0;id< this.classes.length; id++) {
          let data = this.classes[id];
          if (
              data['className'] && data['className']
                  .toString()
                  .toLowerCase()
                  .match(keywordLower) !== null ||
              data['displayName'] && data['displayName']
                  .toString()
                  .toLowerCase()
                  .match(keywordLower) !== null
          ) {
            res.push(data);
          }
        }
        return res;
      },
      filteredUserGroups() {
        // 修改为批量点击后不置空
        // this.selectedUserGroupKeys = [];
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
        // let filter = (array, keyword) => {
        //   return array.filter(function iter(o) {
        //     let temp;
        //     if (o['name'] && o['name']
        //             .toString()
        //             .toLowerCase()
        //             .match(keyword) !== null
        //         || o['displayName'] && o['displayName']
        //             .toString()
        //             .toLowerCase()
        //             .match(keyword) !== null
        //         || o['comment'] && o['comment']
        //             .toString()
        //             .toLowerCase()
        //             .match(keyword) !== null) {
        //       return true;
        //     }
        //     if (!Array.isArray(o.children)) {
        //       return false;
        //     }
        //     temp = o.children.filter(iter);
        //     if (temp.length) {
        //       o.children = temp;
        //       return true;
        //     }
        //   });
        // };
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
        let processRelation = treeNode => {
          if (treeNode.children !== undefined && treeNode.children.length > 0) {
            for (let i=0;i< treeNode.children.length; i++) {
              addParentChildPair(treeNode.key, treeNode.children[i].key);
              processRelation(treeNode.children[i]);
            }
          }
        };
        for (let i=0; i < multiTree.length; i++) processRelation(multiTree[i]);
        this.showUserLoading = false;
        return multiTree;
      },
      oidToGroup() {
        let res = {};
        for (let id=0; id< this.groups.length; id++) {
          res[this.groups[id].oid] = {...this.groups[id]};
        }
        return res;
      },
    },
    created() {
      this.getAllData();
    },
    methods: {
      globalRefresh() {
        this.$Spin.show();
        this.getAllData(true);
      },
      clone(obj) {
        return JSON.parse(JSON.stringify(obj));
      },
      batchButtonId(i) {
        return "quickButton_" + i
      },
      testbutton(i) {
        return "independentButton_" + i
      },
      updateIndeterminateGroups() {
        let updateNode = key => {
          let childrenKeys = this.nodeKeyToChildrenKeys[key];
          if (childrenKeys !== undefined && childrenKeys.length > 0) {
            let selectedChildrenCount = childrenKeys.filter(childKey => {
              return this.selectedUserGroupKeys.indexOf(childKey) > -1;
            }).length;
            if (selectedChildrenCount > 0 && selectedChildrenCount < childrenKeys.length) {
              this.indeterminateGroups.push(this.oidToGroup[key.split('_')[1]]);
            }
            for (let i =0; i<childrenKeys.length; i ++) {
              updateNode(childrenKeys[i]);
            }
          }
        };
        this.indeterminateGroups = [];
        for (let i =0; i< this.filteredUserGroups.length; i++) {
          updateNode(this.filteredUserGroups[i].key);
        }
      },
      showIndeterminateSelects() {
        this.updateIndeterminateGroups();
        if (document.getElementsByClassName('ivu-col-span-15').length === 0) return;
        let card = document.getElementsByClassName('ivu-col-span-15')[0];
        let checkboxes = card.querySelectorAll("input[type='checkbox']");
        let icons = card.querySelectorAll("i.ivu-icon-md-people, i.ivu-icon-md-person");
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
      toggleBatchMode() {
        if (this.batchMode) {
          this.batchMode = false;
        } else {
          this.batchMode = true;
          
          this.selectedUserGroupKeys = [];
          // remove selectAll checkbox (after rendering finishes)
          setTimeout(() => {
            if (document.getElementsByClassName('ant-table-selection').length > 0) {
              let el = document.getElementsByClassName('ant-table-selection')[0];
              el.parentNode.removeChild(el);
              // document.getElementsByClassName('ant-table-selection')[0].setAttribute('style', 'display: none');
            }
          }, 0);
        }
      },
      hideSpinAndRefresh() {
        if (this.currentRow.className) {
          AuthRules.getAllRulesByCondition(`and plt_classname='${this.currentRow.className}'`)
            .then(res => {
              this.rules = res.data.data;
              this.refreshTags();
              this.$Spin.hide();
            })
            .catch(error => {
              this.$Spin.hide();
            });

        }
        else {
          AuthRules.getAllRules()
            .then(res => {
              this.rules = res.data;
              this.refreshTags();
              this.$Spin.hide();
            })
            .catch(error => {
              this.$Spin.hide();
            });
        }
      },
      getAllData(refreshFlag) {
        // this.$Spin.show();
        this.userGroups = [];
        this.classes = [];
        let promises = [];
        promises.push(
            EntityModeling.getAllEntities().then(res => {
              let tmp = res.data;
              for (let i = 0; i < tmp.length; ++i) {
                tmp[i].engName = tmp[i].className;
                tmp[i].key = tmp[i].id + '|' + tmp[i].className;
                if (tmp[i].attributes && tmp[i].attributes.length == 0 || tmp[i].classCategory === 'ExternalItemClass'){
                  tmp[i].attributes = undefined
                }
                else {
                  tmp[i].attributes = [{key: uuid(), id: this.zeroId}];
                }
              }
              this.classes = this.classes.concat(res.data);
            })
        );
        promises.push(
            RelationModeling.getAllRelationsWithoutAttributes().then(res => {
              let hideSet = new Set(["User2Group", "Group2Group", "Role2Project", "Participant2RP", "Relation"]);
              let tmp = res.data.filter(item => {
                return !hideSet.has(item.className);
              });
              for (let i = 0; i < tmp.length; ++i) {
                tmp[i].engName = tmp[i].className;
                tmp[i].key = tmp[i].id + '|' + tmp[i].className;
                tmp[i].attributes = [{key: uuid(), id: this.zeroId}];
              }
              this.classes = this.classes.concat(tmp);
            })
        );
        promises.push(
            AuthRules.getAllUsers().then(res => {
              this.users = res.data;
            })
        );
        promises.push(
            AuthRules.getAllGroups().then(res => {
              this.groups = res.data;
            })
        );
        promises.push(
            AuthRules.getAllRules().then(res => {
              this.rules = res.data;
            })
        );
        promises.push(
            getAllUserGroupTree().then(res => {
              this.userGroupTree = res.data.data;
            })
        );
        promises.push(
            getGroupToGroups().then(res => {
              this.userToGroup = {};
              res.data.data.map(item => {
                // 一个用户组内可以有多个子组
                if (this.groupToChildGroup[item.rightOid] === undefined) {
                  this.groupToChildGroup[item.rightOid] = [item.leftOid];
                } else if (this.groupToChildGroup[item.rightOid].indexOf(item.leftOid) === -1) {
                  this.groupToChildGroup[item.rightOid].push(item.leftOid);
                }
              });
              res.data.data.map(item => {
                // 一个用户组只能属于一个父组
                this.groupToParentGroup[item.leftOid] = item.rightOid;
              });
            })
        );
        promises.push(
            getUserToGroups().then(res => {
              this.userToGroup = {};
              res.data.data.map(item => {
                // 一个用户可以直接属于多个用户组
                if (this.userToGroup[item.leftOid] === undefined) {
                  this.userToGroup[item.leftOid] = [item.rightOid];
                } else if (this.userToGroup[item.leftOid].indexOf(item.rightOid) === -1) {
                  this.userToGroup[item.leftOid].push(item.rightOid);
                }
                // 一个用户组内可以有多个用户
                if (this.groupToUser[item.rightOid] === undefined) {
                  this.groupToUser[item.rightOid] = [item.leftOid];
                } else if (this.groupToUser[item.rightOid].indexOf(item.leftOid) === -1) {
                  this.groupToUser[item.rightOid].push(item.leftOid);
                }
              });
            })
        );
        Promise
            .all(promises)
            .then(res => {
              this.classes.sort(function (a, b) {
                return a.className.toString().toLowerCase() > b.className.toString().toLowerCase() ? 1 : -1;
              });
              // 将不属于任何组的用户提到根节点
              // let virtualGroupId = this.userGroupTree.findIndex(group => {
              //   return group.oid === this.zeroId
              // });
              // let virtualGroup;
              // if (virtualGroupId > -1) {
              //   virtualGroup = clone(this.userGroupTree[virtualGroupId].users);
              //   this.userGroupTree.pop();
              //   this.userGroupTree.sort(function (a, b) {
              //     return a.name.toString().toLowerCase() > b.name.toString().toLowerCase() ? 1 : -1;
              //   });
              //   virtualGroup.sort(function (a, b) {
              //     return a.name.toString().toLowerCase() > b.name.toString().toLowerCase() ? 1 : -1;
              //   });
              // }
              // 先处理成适应表格展示的数据，再传给表格数据源即this.userGroups（否则ATable会报错，如duplicate key）
              let processTreeNode = (node, parent, role) => {
                let curNode = {...node};
                // 根据现有前端逻辑，用户displayName非undefined，故藉此判断递归终点（是用户而非用户组）
                // if (curNode.displayName === undefined) {  // 用户组节点
                  curNode.children = [];
                  // curNode.displayName = curNode.name;
                  curNode.key = `${role}_${curNode.oid}_${parent.oid}`;
                  let groupNodes = [];
                  let userNodes = [];
                  for (let idg = 0; curNode.childrenGroups && idg < curNode.childrenGroups.length; idg++) {
                    groupNodes.push(processTreeNode(curNode.childrenGroups[idg], curNode, 'group'));
                  }
                  for (let idu = 0; curNode.users && idu < curNode.users.length; idu++) {
                    userNodes.push(processTreeNode(curNode.users[idu], curNode, 'user'));
                  }
                  // groupNodes.sort(function (a, b) {
                  //   return a.name.toString().toLowerCase() > b.name.toString().toLowerCase() ? 1 : -1;
                  // });
                  // userNodes.sort(function (a, b) {
                  //   return a.name.toString().toLowerCase() > b.name.toString().toLowerCase() ? 1 : -1;
                  // });
                  for (let idg = 0; idg < groupNodes.length; idg++) curNode.children.push(groupNodes[idg]);
                  for (let idu = 0; idu < userNodes.length; idu++) curNode.children.push(userNodes[idu]);
                // } else {  // 用户节点
                //   // 用户节点不设children属性，否则会显示多余展开按钮
                //   curNode.key = `user_${curNode.oid}_${parent.oid}`;
                //   // if (this.userToGroup[curNode.oid] !== undefined) {
                //   //   curNode.parent = this.userToGroup[curNode.oid].map(oid => {
                //   //     return this.oidToGroup[oid].name;
                //   //   }).join(',');
                //   // }
                // }
                curNode.parent = parent.name?parent.name : ''
                return curNode;
              };
              for (let id = 0; id < this.userGroupTree.childrenGroups.length; id++) {
                this.userGroups.push(processTreeNode(this.userGroupTree.childrenGroups[id], {oid: this.zeroId}, 'group'));
              }
              for (let id = 0; id < this.userGroupTree.users.length; id++) {
                this.userGroups.push(processTreeNode(this.userGroupTree.users[id], {oid: this.zeroId}, 'user'));
              }
              // for (let id in this.userGroupTree) {
              //   this.userGroups.push(processTreeNode(this.userGroupTree[id], {oid: this.zeroId}));
              // }
              // for (let id in virtualGroup) {
              //   this.userGroups.push(processTreeNode(virtualGroup[id], {oid: this.zeroId}));
              // }
              // reset tags
              this.resetTree();
              if(refreshFlag) {

                // this.keywordUserGroup = '';
                // this.currentRow = {};
                this.refreshAtable = false;

                setTimeout(() => {
                  this.refreshAtable = true;
                  this.hideSpinAndRefresh();
                }, 100)

              } else {
                this.hideSpinAndRefresh();
              }


            })
            .catch(error => {
              this.hideSpinAndRefresh();
            });
      },
      onClassExpand(expanded, record) {
        // expanded: 当前节点是否正在被展开; record: 当前记录（当前行）
        // 被展开的是实体类/关联类，故可以通过id唯一确定
        let index = this.classes.findIndex(x => x.id === record.id);
        let currentClass = this.classes[index];
        // 只有首次展开该节点时加载其下属性（刷新属性需要通过刷新页面实现）
        if (currentClass.attributes.length > 1 || currentClass.attributes[0].id !== this.zeroId || !expanded) return;
        this.$Spin.show();
        EntityModeling.getAttributes(currentClass.className)
            .then(res => {
              // let attributes = res.data.filter(attr => {
              //   // 由于目前的实体类、关联类彼此之间无继承关系，故所有className值非当前类名的属性都是系统属性，加以屏蔽
              //   return attr.className === currentClass.className;
              // });
              let attributes = res.data;
              for (let j = 0; j < attributes.length; ++j) {
                attributes[j].engName = attributes[j].attributeName;
                attributes[j].key = currentClass.id + '|' + currentClass.className + '|' + attributes[j].id + '|' + attributes[j].attributeName;
                if (attributes[j].className !== currentClass.className) {
                  attributes[j].className = currentClass.className;
                }
              }
              currentClass.attributes = attributes;
              if (currentClass.attributes && currentClass.attributes.length === 0) currentClass.attributes=undefined
              if (currentClass.classCategory === 'ExternalItemClass') currentClass.attributes = undefined;
              this.hideSpinAndRefresh();
            })
            .catch(error => {
              this.hideSpinAndRefresh();
            });
      },
      onUserGroupExpand(expanded, record) {
        setTimeout(this.showIndeterminateSelects, 0);  // 更新需要设为半选状态的节点列表，并显示为半选状态
      },
      resetTree() {
        let tmp = [];
        for (let i = 0; i < this.userGroups.length; i ++) {
          tmp.push(this.resetAccess(this.userGroups[i]));
        }
        this.userToGroup = clone(tmp);
      },
      resetAccess(node) {
        node.actions = {};
        node.disabled = {};
        for (let key in this.actions) {
          node.actions[key] = true;
          node.disabled[key] = true;
        }
        let newChildren = [];
        for (let id=0; node.children && id< node.children.length; id ++) newChildren.push(this.resetAccess(node.children[id]));
        node.children = newChildren.length > 0 ? clone(newChildren) : undefined;
        if (this.oidToGroup[node.oid] === undefined && node.key.indexOf('group_') > -1) {
          node.key = node.key.replace('group_','user_')
        }
        return node;
      },
      refreshTags() {
        if (this.currentRow.id === undefined) return;
        // reset tags
        // this.resetTree();
        // let userOrder = {};
        // for (let i in this.users) userOrder[this.users[i].name] = i;
        // let groupOrder = {};
        // for (let i in this.groups) groupOrder[this.groups[i].name] = i;
        // let userNames = {};
        // this.users.map(user => {
        //   userNames[user.name] = user;
        // });
        // let groupNames = {};
        // this.groups.map(group => {
        //   groupNames[group.name] = group;
        // });
        // let classNames = {};
        // this.classes.map(item => {
        //   classNames[item.className] = item;
        // });

        // map auth items from users/groups to user-group tree
        let processTreeNode = (node, parentAccess, disabled) => {
          let targetAccess = {...parentAccess};
          let targetDisabled = {...disabled};
          if (!targetAccess.level) targetAccess.level = {};
          // 对于实体属性而言，如果其实体类的禁止查询，则属性的所有功能disabled，如果实体类禁止编辑，属性的编辑disabled
          let parentEditDisabled = targetDisabled.parentEditDisabled === undefined ?false :targetDisabled.parentEditDisabled;
          if (this.currentRow.attributeName) {
            let editClassRules = this.rules.filter(rule => {
              return isEmpty(rule.attrName)
                  && rule.authority === 'EditObjects'
                  && rule.participant === node.name
                  && rule.className === this.currentRow.className
                  ;
            });
            let classRules = this.rules.filter(rule => {
              return isEmpty(rule.attrName)
                  && rule.authority === 'CommonOpAuth'
                  && rule.participant === node.name
                  && rule.className === this.currentRow.className
                  ;
            });
            let priority = false;
            for (let id =0; id< editClassRules.length; id++) {
              if (editClassRules[id].conditionId === this.AlwaysFalse){
                  targetDisabled['EditObjects'] = true;
                  priority = true;
                  parentEditDisabled = true;
              }
              else if (editClassRules[id].conditionId === this.AlwaysTrue){
                  targetDisabled['EditObjects'] = false;
              }
            }
            for (let  id =0; id<  classRules.length; id++) {
              if (classRules[id].conditionId === this.AlwaysFalse){
                  for (let key in this.actions) {
                    targetDisabled[key] = true;
                  }
              }
              else if (classRules[id].conditionId === this.AlwaysTrue){
                  for (let key in this.actions) {
                    targetDisabled[key] = false;
                  }
                  if (priority) {
                    targetDisabled['EditObjects'] = true;
                  }
              }
            }
          }
          // 根据规则类型确定按钮为default / success模式
          // 用户子组的规则优先级高于用户父组
          let targetRules = this.rules.filter(rule => {
            return rule.authority in this.actions
                && rule.participant === node.name
                && rule.className === this.currentRow.className
                && (isEmpty(this.currentRow.attributeName) && isEmpty(rule.attrName) || rule.attrName === this.currentRow.attributeName);
          });
          for (let id=0;id< targetRules.length; id++) {
            let numName = targetRules[id].authority + '_num';
            targetAccess.level[numName] = 0;
          }
          for (let id =0;id<targetRules.length; id++) {
            let numName = targetRules[id].authority + '_num';
            targetAccess.level[numName] ++;
            if (targetAccess.level[numName] === 1 || targetAccess.level[targetRules[id].authority] < targetRules[id].level) {
              targetAccess.level[targetRules[id].authority] = targetRules[id].level;
              if (targetRules[id].conditionId === this.AlwaysFalse) {
                targetAccess[targetRules[id].authority] = false;
              } else {
                targetAccess[targetRules[id].authority] = true;
              }
            }
          }
          // 如果禁止查询权限，其余按钮disabled
          if (targetAccess['CommonOpAuth'] == false || targetDisabled['CommonOpAuth'] == true) {
            if (this.currentRow.attributeName === undefined) {
              targetDisabled['EditObjects'] = true;
              targetDisabled['DeleteObj'] = true;
              targetDisabled['CreateObjects'] = true;
            }
            else {
              targetDisabled['EditObjects'] = true;
            }
          }
          // 用户组禁止查询后，允许其查询时，将其余按钮disabled取消
          else if (targetAccess['CommonOpAuth'] == true && targetDisabled['EditObjects'] == true) {
            if (this.currentRow.attributeName === undefined) {
              targetDisabled['EditObjects'] = false;
              targetDisabled['DeleteObj'] = false;
              targetDisabled['CreateObjects'] = false;
            }
            else {
              targetDisabled['EditObjects'] = false;
            }
            // 实体类的编辑禁止后，属性的编辑disabled
            if (parentEditDisabled) {
              targetDisabled['EditObjects'] = true;
            }
          }
          node.actions = {...targetAccess};
          node.disabled = {...targetDisabled};
          targetDisabled.parentEditDisabled = parentEditDisabled;
          let newChildren = [];
          for (let id=0; node.children && id<node.children.length; id++) {
            newChildren.push(processTreeNode(node.children[id], targetAccess, targetDisabled));
          }
          node.children = newChildren.length > 0 ? clone(newChildren) : undefined;
          return node;
        };
        let rootAccess = [];
        let disabled = [];
        for (let key in this.actions) {
          rootAccess[key] = true;  // default: grant all access
          disabled[key] = false;
        }
        rootAccess['CreateObjects'] = true;
        rootAccess['DeleteObj'] = true;
        let tmp = [];
        for (let id =0; id< this.userGroups.length; id++) {
          tmp.push(processTreeNode(this.userGroups[id], rootAccess, disabled));
        }
        this.userGroups = clone(tmp);
      },
      findParticipantLevel(participant) {
        if (this.users.findIndex(user => {
          return user.name === participant;
        }) > -1) return this.maxInt;
        else {
          let level = 0;
          let curGroupId = this.groups.filter(group => {
            return group.name === participant;
          })[0].oid;
          while (this.groupToParentGroup[curGroupId] !== undefined) {
            level = level + 2;
            curGroupId = this.groupToParentGroup[curGroupId];
          }
          return level;
        }
      },
      batchAction(action) {
        // 批量操作不影响下级高优先级权限（除非下级亦选中），只对当前选中行更改原有权限
        this.$Spin.show();
        let userAndGroupNameList = [];
        let userIdList = this.selectedUserIds;
        let groupIdList = this.selectedGroupIds;
        this.selectedUserIds.map(id => {
          userAndGroupNameList.push(this.users[this.users.findIndex(user => {
            return user.oid === id
          })].name);
        });
        this.selectedGroupIds.map(id => {
          userAndGroupNameList.push(this.groups[this.groups.findIndex(group => {
            return group.oid === id
          })].name);
        });

        // 修改为批量点击后不置空
        // this.selectedUserIds = [];
        // this.selectedGroupIds = [];

        let checked = this.batchActionState === '批量允许';
        if (checked) {
          // find corresponding rules
          let ruleOids = [];
          for (let i =0; i< this.rules.length; i++) {
            if (this.rules[i].conditionId === this.AlwaysFalse
                && this.rules[i].authority === action
                && this.rules[i].className === this.currentRow.className
                && (isEmpty(this.currentRow.attributeName) && isEmpty(this.rules[i].attrName) || this.rules[i].attrName === this.currentRow.attributeName)
                && userAndGroupNameList.indexOf(this.rules[i].participant) >= 0) {
              ruleOids.push(this.rules[i].oid);
            }
          }
          if (ruleOids.length === 0) {
            this.hideSpinAndRefresh();
            return;
          }
          // remove rules
          AuthRules.deleteRules(ruleOids).then(res => {
            for (let i =0;i< ruleOids.length; i++) {
              let removeIndex = this.rules.map(function (item) {
                return item.oid;
              }).indexOf(ruleOids[i]);
              this.rules.splice(removeIndex, 1);
            }
            this.hideSpinAndRefresh();
            this.$Message.success("操作成功");
          }).catch(e => {
            this.hideSpinAndRefresh();
          });
        } else {
          console.log('before', userAndGroupNameList)
          let toDeleteUserIndex = [];
          let toDeleteGroupIndex = [];
          let groupIds = [];
          let userIds = [];
          let self = this;
          let findSubGroups = function(curGroupId) {
            groupIds.push(curGroupId);
            if (self.groupToChildGroup[curGroupId] !== undefined) {
              for (let id =0; id< self.groupToChildGroup[curGroupId].length; id++) {
                findSubGroups(self.groupToChildGroup[curGroupId][id]);
              }
            }
          }
          for (let i=0;i< groupIdList.length; i ++) {
            if (!groupIdList[i]) continue;
            findSubGroups(groupIdList[i]);
            for (let id=0; id< groupIds.length; id++) {
              if (this.groupToUser[groupIds[id]] !== undefined){
                userIds = userIds.concat(this.groupToUser[groupIds[id]]);
              }
            }
            delete groupIds[0]
            for (let j =0;j < groupIds.length; j ++) {
              if (!groupIds[j]) continue;
              delete groupIdList[groupIdList.indexOf(groupIds[j])];
            }
            toDeleteGroupIndex = toDeleteGroupIndex.concat(groupIds.slice(1));
            toDeleteUserIndex = toDeleteUserIndex.concat(userIds);

            groupIds = [];
            userIds = [];
          }
          for (let i=0;i< toDeleteGroupIndex.length; i++) {
            let id = toDeleteGroupIndex[i];
            let filterOneGroups = this.groups.filter(group => {
              return group.oid === id;
            });
            if (filterOneGroups.length < 1) continue;
            let gname = filterOneGroups[0].name;
            if (this.rules.findIndex(rule => {
              return rule.participant == gname
            }) == -1) {
              let gindex = userAndGroupNameList.indexOf(gname);
              if (gindex != -1) {
                userAndGroupNameList.splice(gindex, 1)
              }
            }
          }
          for (let i=0; i < toDeleteUserIndex.length; i++) {
            let id = toDeleteUserIndex[i];
            let filterOneUsers = this.users.filter(user => {
              return user.oid === id;
            });
            if (filterOneUsers.length < 1) continue;
            let uname = filterOneUsers[0].name;
            if (this.rules.findIndex(rule => {
              return rule.participant == uname
            }) == -1) {
              let uindex = userAndGroupNameList.indexOf(uname);
              if (uindex != -1) {
                userAndGroupNameList.splice(uindex, 1)
              }
            }
          }
          console.log('after ',userAndGroupNameList)
          // create rule to block users and groups
          let newRules = userAndGroupNameList.map(participant => {
            return {
              conditionId: this.AlwaysFalse,
              isInheritant: true,
              authority: action,
              className: this.currentRow.className,
              participant: participant,
              attrName: isEmpty(this.currentRow.attributeName) ? '' : this.currentRow.attributeName,
              level: this.findParticipantLevel(participant),
              note: ''
            };
          });
          AuthRules.createRules(newRules).then(res => {
            // this.rules = this.rules.concat(res.data);
            this.hideSpinAndRefresh();
            this.$Message.success("操作成功");
          }).catch(e => {
            this.hideSpinAndRefresh();
          });
        }
      },
      toggleAction(checked, name) {
        console.log(checked, name)
        let id = name.split('_')[1];
        let action = name.split('_')[3];
        let participant;
        let userAndGroupNameList = [];
        if (name.startsWith('user_')) {
          participant = this.users.filter(user => {
            return user.oid === id;
          })[0].name;
          userAndGroupNameList.push(participant)
        } else {
          participant = this.groups.filter(group => {
            return group.oid === id;
          })[0].name;
          userAndGroupNameList.push(participant)
        }
        // console.log(userAndGroupNameList)
        // this.$Spin.show();
        let condition = !checked ? this.AlwaysFalse: this.AlwaysTrue;


        let ruleOids = [];
        for (let i =0; i < this.rules.length; i ++) {
          if (this.rules[i].conditionId === condition
              && this.rules[i].authority === action
              && this.rules[i].className === this.currentRow.className
              && (isEmpty(this.currentRow.attributeName) && isEmpty(this.rules[i].attrName) || this.rules[i].attrName === this.currentRow.attributeName)
              && userAndGroupNameList.indexOf(this.rules[i].participant) >= 0) {
            ruleOids.push(this.rules[i].oid);
          }
        }

        if (!checked) {
          // delete alway false create always true
          // find corresponding rule
          // if (ruleOid === undefined) {
            // access restricted by certain parent group(s); create access exception for current user/group
          condition = this.AlwaysFalse;
          let newRules = userAndGroupNameList.map(participant => {
            return {
              conditionId: 'AlwaysTrue',
              isInheritant: true,
              authority: action,
              className: this.currentRow.className,
              participant: participant,
              attrName: isEmpty(this.currentRow.attributeName) ? '' : this.currentRow.attributeName,
              level: this.findParticipantLevel(participant)-1,
              note: ''
            };
          });
          AuthRules.createRules(newRules).then(res => {
            // this.rules = this.rules.concat(res.data);
            this.hideSpinAndRefresh();
            if (ruleOids.length == 0) {
              this.$Message.success("操作成功");
            }
          }).catch(e => {
            this.hideSpinAndRefresh();
          });
        } else {
          // create always false delete alwasy true
          // create rule to block user/group
          condition = this.AlwaysTrue;
          let newRules = userAndGroupNameList.map(participant =>{
            return {
              conditionId: this.AlwaysFalse,
              isInheritant: true,
              authority: action,
              className: this.currentRow.className,
              participant: participant,
              attrName: isEmpty(this.currentRow.attributeName) ? '' : this.currentRow.attributeName,
              level: this.findParticipantLevel(participant),
              note: ''
            };
          });
          AuthRules.createRules(newRules).then(res => {
            // this.rules = this.rules.concat(res.data);
            this.hideSpinAndRefresh();
            if (ruleOids.length == 0) {
              this.$Message.success("操作成功");
            }
          }).catch(e => {
            this.hideSpinAndRefresh();
          });

        }

        if (ruleOids.length > 0) {
          // remove rule
          AuthRules.deleteRules(ruleOids).then(res => {
            for (let i=0; i< ruleOids.length; i++) {
              let removeIndex = this.rules.map(function (item) {
                return item.oid;
              }).indexOf(ruleOids[i]);
              this.rules.splice(removeIndex, 1);
            }
            this.hideSpinAndRefresh();
            this.$Message.success("操作成功");
          }).catch(e => {
            this.hideSpinAndRefresh();
          });
        }
      },
      selectFatherAuto(key) {
        // auto表示由蔓延处理选中状态的改变，而非用户手动选择/反选
        // 若存在父亲节点，且父亲节点的所有子节点全部被选中，则向树的上一层递归
        this.addToSelectedUserGroupKeys(key);
        let parentKey = this.nodeKeyToParentKey[key];
        if (parentKey !== undefined && this.isAllChildrenSelected(parentKey)) this.selectFatherAuto(parentKey);
      },
      unselectFatherAuto(key) {
        // auto表示由蔓延处理选中状态的改变，而非用户手动选择/反选
        // key必属于某个用户组，且该组本身状态是否改变也由自动计算决定
        // 若存在父亲节点，则向树的上一层递归
        this.removeFromSelectedUserGroupKeys(key);
        let parentKey = this.nodeKeyToParentKey[key];
        if (parentKey !== undefined) this.unselectFatherAuto(parentKey);
      },
      isAllChildrenSelected(key) {
        let childrenKeys = this.nodeKeyToChildrenKeys[key];
        if (childrenKeys === undefined) return true;
        return childrenKeys.filter(key => {
          return this.selectedUserGroupKeys.indexOf(key) < 0;
        }).length === 0;
      },
      setAllChildrenSelected(key, selected) {
        // 递归地将用户组的所有子用户(组)选中状态改为true/false（key应属于某个用户组）
        let childrenKeys = this.nodeKeyToChildrenKeys[key];
        if (childrenKeys !== undefined && childrenKeys.length > 0) {
          for (let i=0;i < childrenKeys.length; i++) {
            if (selected) this.addToSelectedUserGroupKeys(childrenKeys[i]);
            else this.removeFromSelectedUserGroupKeys(childrenKeys[i]);
            this.setAllChildrenSelected(childrenKeys[i], selected);
          }
        }
      },
      selectUserGroup(key) {
        // select curNode
        this.addToSelectedUserGroupKeys(key);
        // cascade
        if (key.split('_')[0] === 'group') {
          this.setAllChildrenSelected(key, true);
        }
        // 上文必须先执行，因为下面selectFatherAuto是从当前节点（而非父节点）开始递归
        this.selectFatherAuto(key);
      },
      unselectUserGroup(key) {
        // unselect curNode
        this.removeFromSelectedUserGroupKeys(key);
        // cascade
        if (key.split('_')[0] === 'group') {
          this.setAllChildrenSelected(key, false);
        }
        this.unselectFatherAuto(key);
      },
      addToSelectedUserGroupKeys(key) {
        this.selectedUserGroupKeys.push(key);
        this.selectedUserGroupKeys = [...new Set(this.selectedUserGroupKeys)];
      },
      removeFromSelectedUserGroupKeys(key) {
        let s = new Set(this.selectedUserGroupKeys);
        s.delete(key);
        this.selectedUserGroupKeys = [...s];
      },
      changeShowUser() {
        this.showUserLoading = true;
        this.selectedGroupIds = [];
        this.selectedUserIds = [];
      },
    },
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
