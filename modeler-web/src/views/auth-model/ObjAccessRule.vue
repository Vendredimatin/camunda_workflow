<template>
  <div :style="{borderTop: showTabs ? '' : '1px solid #e8eaec'}">
    <Card :bordered="false" dis-hover>
      <Row :gutter="8">
        <Col span="8" class="auth-tree">
          <div style="height: 30px;text-align: left; float:left; width:60%;">
            <a-tooltip><template slot='title'>{{currentRow.name ? (currentRow.name + (currentRow.displayName? '（' + currentRow.displayName + '）': '')) : ''}}</template>
            <span style='overflow: hidden; word-break: break-all; text-overflow: ellipsis; display: -webkit-box; -webkit-line-clamp: 1; -webkit-box-orient: vertical;'>
                          <span v-if="roleGroupName !== undefined">
              角色组（{{roleGroupName}}）下的</span><span v-else>全部</span>用户(组)列表：{{ currentRow.oid === undefined ? '（未选择）' : ('已选择 ' + currentRow.name + (currentRow.displayName? '（' + currentRow.displayName + '）' : "")) }}</span>
            </a-tooltip>
            <!-- <span v-if="roleGroupName !== undefined">
              角色组（{{roleGroupName}}）下的</span><span v-else>全部</span>用户(组)列表：{{ currentRow.oid === undefined ? '（未选择）' : ('已选择 ' + currentRow.name + (currentRow.displayName? '（' + currentRow.displayName + '）' : "")) }} -->
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
            <span slot="name" slot-scope="text, record">
              <Icon :type="oidToGroup[record.oid] === undefined ? 'md-person' : 'md-people'"></Icon>
              <a-tooltip><template slot='title'>{{ record.name }}</template>
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
          </a-table>
        </Col>
        <Col span="16" class="auth-tree" v-if="currentRow.oid !== undefined">

          <!-- <Tabs>
              <TabPane label="实体类"></TabPane>
              <TabPane label="外部实体类"></TabPane>
              <TabPane label="关联类"></TabPane>
          </Tabs> -->
          <div style="text-align: left">
            类与属性列表：
              <Select id="selectClassType" v-model="classType" @on-change="changeClass" style=" width:150px; ">
                <Option value="internal">实体类</Option>
                <Option value="external">外部实体类</Option>
                <Option value="relations">关联类</Option>
            </Select>
          </div>
          <Input
            v-model="keyword"
            id="objClassKey"
            icon="md-search"
            placeholder="输入关键词过滤类"
          >
          </Input>
          <a-table
            ref="table"
            size="small"
            id="objClassTable"
            :indentSize="8"
            childrenColumnName="attributes"
            :columns="classColumns"
            :dataSource="filteredClasses"
            @expand="onClassExpand"
          >
            <span slot="objAccessRule" slot-scope="text, record" v-show="record.attributeCategory !== undefined">
              <div v-if="record.objAccessRuleCondition === undefined || record.objAccessRuleCondition === ''">
                <a id="addAuthRule" v-on:click="onAddClick(record)">创建</a>
              </div>
              <div v-else>
                <a id="editAuthRule" v-on:click="onEditClick(record)">修改</a> |
                <a id="deleteAuthRule" v-on:click="onDeleteClick(record)">清除</a>
              </div>
            </span>
          </a-table>
        </Col>
      </Row>
    </Card>


    <Modal
      v-model="addRowModal"
      title="新增对象授权规则"
      id="addRowModal"
      width="900"
      :mask-closable="false"
    >
      <Form ref="addRowForm" :model="addRowData" :rules="addRowValidate" label-position="top">
        <p><b>用户(组)</b>：{{currentRow.name + (currentRow.displayName? '（' + currentRow.displayName + '）': '')}}
        <br><b>类</b>：{{currentRule.className + (classes.filter(x => x.className === currentRule.className).length === 0 ? '' : '（' + classes.filter(x => x.className === currentRule.className)[0].displayName + '）')}}
        <br><b>属性</b>：{{currentRule.attributeName + (currentRule.displayName? '（' + currentRule.displayName + '）': '')}}</p>
        <FormItem label="条件（属性名需用英文双引号包围）" prop="condition">
          <Input id="addObjRuleCondition" v-model="addRowData.condition" type="textarea" :rows="4" placeholder='输入条件SQL片段，如 "state" in (1, 2)'/>
        </FormItem>
        <p>类 {{currentRule.className}} 的属性：</p><p id="currentRuleList" class="add-attribute-to-condition-container">
          <a  class="add-attribute-to-condition"
             :title="`${attribute.displayName}(${attribute.attributeName})`"
             v-for="attribute in currentClassAttributes"
             v-on:click="addAttributeToCondition('create', attribute.attributeName)">
            {{attribute.displayName}}({{attribute.attributeName}})
          </a>
        </p>

        <FormItem label="规则" prop="attrRuleName">
          <Select id="selectObjAttributeRule" v-model="addRowData.attrRuleName" placeholder="选择相应属性授权规则" filterable>
            <Option v-for="item in attrAccessRules" :value="item.name" :key="item.name">{{ item.name }}</Option>
          </Select>
        </FormItem>
      </Form>
      <div slot="footer">
        <Button id="cancelCreateObjAuthRule" type="text" size="large" :loading="false" @click="addRowModal = false">取消</Button>
        <Button id="confirmCreateObjAuthRule" type="primary" size="large" :loading="addRowModalLoading" @click="doRuleAction('create')">确认</Button>
      </div>
    </Modal>

    <Modal
      id="editObjAythRuleWindow"
      v-model="editRowModal"
      title="编辑对象授权规则"
      width="900"
      :mask-closable="false"
    >
      <Form ref="editRowForm" :model="editRowData" :rules="editRowValidate" label-position="top">
        <p><b>用户(组)</b>：{{currentRow.name + (currentRow.displayName? '（' + currentRow.displayName + '）': '')}}
        <br><b>类</b>：{{currentRule.className + (classes.filter(x => x.className === currentRule.className).length === 0 ? '' : '（' + classes.filter(x => x.className === currentRule.className)[0].displayName + '）')}}
        <br><b>属性</b>：{{currentRule.attributeName + (currentRule.displayName? '（' + currentRule.displayName + '）': '')}}</p>
        <FormItem label="条件（属性名需用英文双引号包围）" prop="condition">
          <Input id="modifyObjRuleCondition" v-model="editRowData.condition" type="textarea" :rows="4" placeholder='输入条件SQL片段，如 "state" in (1, 2)'/>
        </FormItem>
        <p>类 {{currentRule.className}} 的属性：</p><p class="add-attribute-to-condition-container">
          <a class="add-attribute-to-condition"
             :title="`${attribute.displayName}(${attribute.attributeName})`"
             v-for="attribute in currentClassAttributes"
             v-on:click="addAttributeToCondition('update', attribute.attributeName)">
            {{attribute.displayName}}({{attribute.attributeName}})
          </a>
        </p>
        <FormItem label="规则" prop="attrRuleName">
          <Select id="modifyObjAttributeRule" v-model="editRowData.attrRuleName" placeholder="选择相应属性授权规则" filterable>
            <Option v-for="item in attrAccessRules" :value="item.name" :key="item.name">{{ item.name }}</Option>
          </Select>
        </FormItem>
      </Form>
      <div slot="footer">
        <Button id="cancelModifyObjAuthRule" type="text" size="large" :loading="false" @click="editRowModal = false">取消</Button>
        <Button id="confirmModifyObjAuthRule" type="primary" size="large" :loading="editRowModalLoading" @click="doRuleAction('modify')">确认</Button>
      </div>
    </Modal>
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
  import {getAllUserGroupTree, getRoleGroup} from "@/api/others";
  import {uuid, clone} from "@/util/assist";
  import ObjAccessRule from "../../api/auth-model/ObjAccessRule";
  import AttrAccessRule from "@/api/auth-model/AttrAccessRule";

  const isEmpty = str => {
    return str === undefined || str === null || str.trim() === '';
  };

  export default {
    name: 'obj-access-rule',
    mixins: [tableMixin],
    components: {
      ATable,
      ATooltip,
    },
    data() {
      const zeroId = '00000000000000000000000000000000';
      const overflowStyle = 'float: left; width: 150px; overflow: hidden; white-space: nowrap; word-break: break-all;text-overflow: ellipsis; display: inline-block;';
      return {
        classType: 'internal',
        zeroId,
        addRowValidate: {
          "condition": [
            { required: true, message: "条件不能为空", trigger: "blur,change" },
            {
              type: "string",
              max: 1000,
              message: "规则不能超过1000字符",
              trigger: "blur"
            }
          ],
          "attrRuleName": { required: true, message: "规则不能为空", trigger: "change" },
        },
        editRowValidate: {
          "condition": [
            { required: true, message: "条件不能为空", trigger: "blur" },
            {
              type: "string",
              max: 1000,
              message: "规则不能超过1000字符",
              trigger: "blur"
            }
          ],
          "attrRuleName": { required: true, message: "规则不能为空", trigger: "change" },
        },
        attrAccessRules: [],
        refreshAtable: true,
        currentRow: {}, // 被选中的用户行
        currentRule: {}, // 正在被操作的规则行
        addRowModal: false,
        addRowModalLoading: false,
        addRowData: {
          condition: "",
          attrRuleName: ""
        },
        editRowModal: false,
        editRowModalLoading: false,
        editRowData: {
          condition: "",
          attrRuleName: ""
        },
        keyword: '',
        classes: [],
        expandedClasses: [],
        classColumns: [
          {
            title: '英文名',
            dataIndex: 'engName',
            key: 'engName',
            width: '20%',
            customRender: (text, row, index) => {
              return <a-tooltip><template slot='title'>{text}</template><span style='overflow: hidden;text-overflow: ellipsis;display: inline-block;float: right;width: 70%;white-space: nowrap;word-break: break-all;'>{text}</span></a-tooltip>;
            },
          },
          {
            title: '显示名',
            dataIndex: 'displayName',
            key: 'displayName',
            width: '20%',
            customRender: (text, row, index) => {
              return <a-tooltip><template slot='title'>{text}</template><span style={overflowStyle}>{text}</span></a-tooltip>;
            },
          },
          {
            title: '条件',
            dataIndex: 'objAccessRuleCondition',
            key: 'objAccessRuleCondition',
            width: '20%',
            customRender: (text, row, index) => {
              return <a-tooltip><template slot='title'>{text}</template><span style={overflowStyle}>{text}</span></a-tooltip>;
            },
          },
          {
            title: '规则',
            dataIndex: 'objAccessRuleRuleName',
            key: 'objAccessRuleRuleName',
            width: '20%',
            customRender: (text, row, index) => {
              return <a-tooltip><template slot='title'>{text}</template><span style={overflowStyle}>{text}</span></a-tooltip>;
            },
          },
          {
            title: '操作',
            key: 'objAccessRule',
            width: '20%',
            scopedSlots: {customRender: 'objAccessRule'},
          },

        ],
        groups: [],
        keywordUserGroup: '',
        nodeKeyToParentKey: {},  // key，一对一，由keyword过滤后的树计算得到
        nodeKeyToChildrenKeys: {},  // key，一对多，由keyword过滤后的树计算得到
        userGroupTree: [],  // 用户组树原始数据
        userGroups: [],  // 用于展示的处理后用户（组）树数据【】
        localeObj: {
          emptyText: '暂无数据'
        },
        userGroupColumns: [
          {
            title: '用户(组)名',
            key: 'name',
            // width: '250',
            scopedSlots: {customRender: 'name'},
          },
          {
            title: '显示名',
            dataIndex: 'displayName',
            key: 'displayName',
            // width: '50%',
            customRender: (text, row, index) => {
              return <a-tooltip><template slot='title'>{text}</template><span style='float: left; display: inline-block; width: 150px; white-space: nowrap;overflow: hidden; word-break: break-all;text-overflow: ellipsis;'>{text}</span></a-tooltip>;
            },
          },
        ],
        userGroupRowSelection: {
          type: 'radio',
          onChange: (selectedRowKeys, selectedRows) => {
            this.currentRow = selectedRows[0];
            this.updateRulesForExpandedClasses();
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
        roleGroupName: undefined,
        showUser: false,
        showUserLoading: false,
        showTabs: true
      }
    },
    computed: {
      filteredClasses() {
        if (isEmpty(this.keyword)) return clone(this.classes);
        let keywordLower = this.keyword.toLowerCase().trimStart().trimEnd();;
        let res = [];
        for (let id=0;id< this.classes.length; id ++) {
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
        if (!isEmpty(this.keywordUserGroup))  {
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
            for (let i=0; i< treeNode.children.length; i ++) {
              addParentChildPair(treeNode.key, treeNode.children[i].key);
              processRelation(treeNode.children[i]);
            }
          }
        };
        for (let i =0; i< multiTree.length; i++) processRelation(multiTree[i]);
        this.showUserLoading = false;
        return multiTree;
      },
      oidToGroup() {
        let res = {};
        for (let id=0;id< this.groups.length; id ++) {
          res[this.groups[id].oid] = {...this.groups[id]};
        }
        return res;
      },
      currentClassAttributes() {
        let className = this.currentRule.className;
        for(let class_ of this.classes) {
          if(class_.className === className) {
            return class_.attributes;
          }
        }
      }
    },
    created() {
      this.getAllData();
      // console.log('creatd ===')
    },
    mounted() {
      this.showTabs = sessionStorage.getItem('showTabs') == 'hide' ? false : true
    },
    methods: {
      globalRefresh() {
        this.$Spin.show();
        // this.classType = 'internal';
        this.getAllData(true);
      },
      clone(obj) {
        return JSON.parse(JSON.stringify(obj));
      },
      changeShowUser() {
        this.showUserLoading = true;
        if (!this.showUser && this.currentRow && this.currentRow.key.startsWith('user')) {
          this.currentRow = {};
        }
      },
      updateRulesForExpandedClasses(){
        // 更新右侧已展开的实体类
        if (this.expandedClasses.length > 0) {
          this.$Spin.show();
        }
        let promises = [];

        for (let index of this.expandedClasses) {
          let currentClass = this.classes[index];
          if (!currentClass) continue;

          for (let j = 0; j < currentClass.attributes.length; ++j) {
            currentClass.attributes[j].objAccessRule = {};
            currentClass.attributes[j].objAccessRuleCondition = "";
            currentClass.attributes[j].objAccessRuleRuleName= "";
          }

          promises.push(
            ObjAccessRule.getObjAccessRule(this.currentRow.oid, currentClass.className)
              .then(res => {
                for (let rule of res.data){
                  for (let j = 0; j < currentClass.attributes.length; ++j) {
                    if (rule.attrName.toLowerCase() === currentClass.attributes[j].attributeName.toLowerCase()){
                      currentClass.attributes[j].objAccessRule = rule;
                      currentClass.attributes[j].objAccessRuleCondition = rule.condition;
                      currentClass.attributes[j].objAccessRuleRuleName= rule.ruleName;
                      break
                    }
                  }
                }
              })
          );
        }

        Promise
          .all(promises)
          .then(() => {
            this.hideSpin();
          })
          .catch(error => {
            console.error(error);
            this.hideSpin();
          });
      },
      hideSpin() {
        this.$Spin.hide();
      },
      getAllData(rFlag) {
        // this.$Spin.show();
        this.classes = [];
        let promises = [];
        if (this.classType === 'external') {
          promises.push(
              EntityModeling.getExternalEntities().then(res => {
                let tmp = res.data;
                // console.log(res.data)
                for (let i = 0; i < tmp.length; ++i) {
                  tmp[i].engName = tmp[i].className;
                  tmp[i].key = tmp[i].id + '|' + tmp[i].className;
                  tmp[i].attributes = [{key: uuid(), id: this.zeroId}];
                }

                this.classes = this.classes.concat(res.data.filter(one => { return one.dataSourceOid === ''}));
              })
          );
        }
        else if (this.classType === 'relations') {
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
        }
        else {
          promises.push(
              EntityModeling.getInternalEntities().then(res => {
                let tmp = res.data;
                for (let i = 0; i < tmp.length; ++i) {
                  tmp[i].engName = tmp[i].className;
                  tmp[i].key = tmp[i].id + '|' + tmp[i].className;
                  tmp[i].attributes = [{key: uuid(), id: this.zeroId}];
                }
                this.classes = this.classes.concat(res.data);
              })
          );
        }
        // promises.push(
        //     RelationModeling.getAllRelationsWithoutAttributes().then(res => {
        //       let hideSet = new Set(["User2Group", "Group2Group", "Role2Project", "Participant2RP", "Relation"]);
        //       let tmp = res.data.filter(item => {
        //         return !hideSet.has(item.className);
        //       });
        //       for (let i = 0; i < tmp.length; ++i) {
        //         tmp[i].engName = tmp[i].className;
        //         tmp[i].key = tmp[i].id + '|' + tmp[i].className;
        //         tmp[i].attributes = [{key: uuid(), id: this.zeroId}];
        //       }
        //       this.classes = this.classes.concat(tmp);
        //     })
        // );
        promises.push(
          AttrAccessRule.getAllConditions().then(res => {
            this.attrAccessRules = res.data;
          })
        );
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
                      // curNode.displayName = curNode.comment;
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
                    if (curNode.children && curNode.children.length === 0) curNode.children = undefined
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
                  if(rFlag) {

                    // this.currentRow = {};
                    this.refreshAtable = false;

                    setTimeout(() => {
                      this.refreshAtable = true;
                      this.hideSpin();
                    }, 100)

                  } else {
                    this.hideSpin();
                  }
                })
                .catch(error => {
                  this.hideSpin();
                });
            })
            .catch(error => {
              this.hideSpin();
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
        console.log('calling EntityModeling.getAttributes');

        EntityModeling.getAttributes(currentClass.className)
            .then(res => {
              // 代号，创建人，创建时间，更新人，更新时间
              let showattr = ['id', 'creator', 'createTime', 'lastModifyTime', 'lastModifier'];
              let attributes = res.data.filter(attr => {
                // 由于目前的实体类、关联类彼此之间无继承关系，故所有className值非当前类名的属性都是系统属性，加以屏蔽
                return attr.className === currentClass.className || showattr.indexOf(attr.attributeName) !== -1;
              });
              for (let j = 0; j < attributes.length; ++j) {
                attributes[j].className = currentClass.className;
                attributes[j].engName = attributes[j].attributeName;
                attributes[j].key = currentClass.id + '|' + currentClass.className + '|' + attributes[j].id + '|' + attributes[j].attributeName;
              }

              this.expandedClasses.push(index); // 用于切换用户时更新，折叠时应pop但andt-vue的table没有collapse事件

              for (let j = 0; j < attributes.length; ++j) {
                attributes[j].objAccessRule = {};
                attributes[j].objAccessRuleCondition = "";
                attributes[j].objAccessRuleRuleName= "";
              }

              ObjAccessRule.getObjAccessRule(this.currentRow.oid, currentClass.className)
                .then(res => {
                  for (let rule of res.data){
                    for (let j = 0; j < attributes.length; ++j) {
                      if (rule.attrName.toLowerCase() === attributes[j].attributeName.toLowerCase()){
                        attributes[j].objAccessRule = rule;
                        attributes[j].objAccessRuleCondition = rule.condition;
                        attributes[j].objAccessRuleRuleName= rule.ruleName;
                        break
                      }
                    }
                  }
                  currentClass.attributes = attributes;
                  // if (currentClass.attributes && currentClass.attributes.length === 0) currentClass.attributes=undefined
                  this.hideSpin();
                })
                .catch(error => {
                  console.log(error);
                  this.hideSpin();
              });

            })
            .catch(error => {
              console.log(error);
              this.hideSpin();
            });
      },
      onEditClick(record) {
        this.currentRule = record;
        this.editRowData.attrRuleName = record.objAccessRuleRuleName;
        this.editRowData.condition = record.objAccessRuleCondition;
        this.editRowModal = true;
      },
      onAddClick(record) {
        this.$refs["addRowForm"].resetFields();
        this.currentRule = record;
        this.addRowModal = true;
      },
      onDeleteClick(record) {
        this.currentRule = record;
        this.doRuleAction('delete');
      },
      changeClass(value) {
        // console.log(value)
        this.$Spin.show();
        this.classes = [];
        let promises = [];

        if (value === 'internal') {
          promises.push(
              EntityModeling.getInternalEntities().then(res => {
                let tmp = res.data;
                for (let i = 0; i < tmp.length; ++i) {
                  tmp[i].engName = tmp[i].className;
                  tmp[i].key = tmp[i].id + '|' + tmp[i].className;
                  tmp[i].attributes = [{key: uuid(), id: this.zeroId}];
                }
                this.classes = this.classes.concat(res.data);
              })
          );
        }
        else if (value === 'external') {
          promises.push(
              EntityModeling.getExternalEntities().then(res => {
                let tmp = res.data;
                // console.log(res.data)
                for (let i = 0; i < tmp.length; ++i) {
                  tmp[i].engName = tmp[i].className;
                  tmp[i].key = tmp[i].id + '|' + tmp[i].className;
                  tmp[i].attributes = [{key: uuid(), id: this.zeroId}];
                }

                this.classes = this.classes.concat(res.data.filter(one => { return one.dataSourceOid === ''}));
              })
          );
        }
        else if (value === 'relations') {
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
        }

        Promise
          .all(promises)
          .then(() => {
            this.classes.sort(function (a, b) {
              return a.className.toString().toLowerCase() > b.className.toString().toLowerCase() ? 1 : -1;
            });
            this.expandedClasses = [];
            this.hideSpin();
          })
          .catch(error => {
            console.error(error);
            this.expandedClasses = [];
            this.hideSpin();
          });

      },
      addAttributeToCondition(scene, attribute) {
        function appendSpace (s) {
          if(s.length > 0 && s[s.length - 1] !== ' '){
            return s + ' '
          }
          return s
        }
        let currentClass = this.classes.filter(cl => {return cl.className === this.currentRule.className})[0];
        // if (currentClass.classCategory === 'RelationClass') attribute = 'relation_' + attribute;
        function addDoubleQuotes(s) {
          return '"' + s + '"'
        }
        if(scene === 'create') {
          this.addRowData.condition = appendSpace(this.addRowData.condition) + addDoubleQuotes(attribute)
        } else if (scene === 'update') {
          this.editRowData.condition = appendSpace(this.editRowData.condition) + addDoubleQuotes(attribute)
        }
      },
      doRuleAction(action, record) {
        switch(action){
          case 'create':

            this.$refs["addRowForm"].validate(valid => {
              if (valid) {
                this.addRowModalLoading = true;
                ObjAccessRule.createObjAccessRule({
                  attrName: this.currentRule.attributeName,
                  className: this.currentRule.className,
                  condition: this.addRowData.condition,
                  id: "",
                  roleOid: this.currentRow.oid,
                  ruleName: this.addRowData.attrRuleName
                })
                  .then(res => {
                    this.updateRulesForExpandedClasses();
                    this.addRowModalLoading = false;
                    this.addRowModal = false;
                    this.$refs["addRowForm"].resetFields();
                    this.$Message.success("新增对象授权规则成功");
                  })
                  .catch(error => {
                    this.addRowModalLoading = false;
                    if (error.response) this.$Message.error(error.response.data.message);
                    else this.$Message.error('内部错误');
                    this.hideSpin();
                  });
              } else {
                this.addRowModalLoading = false;
                this.$Message.error("请检查输入是否正确");
              }
            });

            break;
          case 'delete':
            this.$Modal.confirm({
              title: "删除对象授权规则",
              content: `
<p><b>用户(组)</b>：${this.currentRow.name + (this.currentRow.displayName? '（' + this.currentRow.displayName + '）': '')}
<br><b>类</b>：${this.currentRule.className + '（' + this.classes.filter(x => x.className === this.currentRule.className)[0].displayName + '）'}
<br><b>属性</b>：${this.currentRule.attributeName + (this.currentRule.displayName? '（' + this.currentRule.displayName + '）': '')}</p>
<p>是否删除以上对象授权规则？</p>`,
              loading: true,
              onOk: () => {
                this.$Modal.loading = true;
                ObjAccessRule.deleteObjAccessRule(this.currentRule.objAccessRule.id)
                  .then(res => {
                    this.updateRulesForExpandedClasses();
                    this.$Modal.loading = false;
                    this.$Modal.remove();
                    this.$Message.success("删除对象授权规则成功");
                  })
                  .catch(error => {
                    this.$Modal.loading = false;
                    this.$Modal.remove();
                    this.$Message.error(error.response.data.message);
                  });
              }
            });
            break;
          case 'modify':
            this.$refs["editRowForm"].validate(valid => {
              if (valid) {
                this.editRowModalLoading = true;
                console.log(this.currentRule);
                ObjAccessRule.updateObjAccessRule({
                  attrName: this.currentRule.attributeName,
                  className: this.currentRule.className,
                  condition: this.editRowData.condition,
                  id: this.currentRule.objAccessRule.id,
                  roleOid: this.currentRow.oid,
                  ruleName: this.editRowData.attrRuleName
                })
                  .then(res => {
                    this.updateRulesForExpandedClasses();
                    this.editRowModalLoading = false;
                    this.editRowModal = false;
                    this.$Message.success("更新对象授权规则成功");
                  })
                  .catch(error => {
                    this.editRowModalLoading = false;
                    this.$Message.error(error.response.data.message);
                  });
              } else {
                this.editRowModalLoading = false;
                this.$Message.error("请检查输入是否正确");
              }
            });
            break;
        }
      }
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
  .add-attribute-to-condition {
    margin-right: 0.5em;
    /*padding: 0.5em;*/
    width: 15em;
    text-overflow: ellipsis;
    overflow: hidden;
  }
  .add-attribute-to-condition-container {
    line-height: 2em;
    display: flex;
    flex-flow: row wrap;
    white-space: nowrap;
  }
</style>
