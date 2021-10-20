<template>
  <div>
    <div style="float: left; margin: 10px">
      <Button type="primary" style="margin: 5px" :disabled="selectedRootGroups.length !== 1 && selectedRootGroups.length !== 0" @click="showAddRowModal">
        创建分组
      </Button>
      <Modal
        v-model="addRowModal"
        title="创建授权项组"
        :mask-closable="false"
      >
        <Form ref="addRowForm" :model="addRowData" :rules="rowValidate" label-position="top">
          <FormItem label="父授权项组名" prop="parentGroupId">
            <Input v-model="addRowData.parentId" placeholder="（无）" disabled></Input>
          </FormItem>
          <FormItem label="授权项组名" prop="groupId">
            <Input v-model="addRowData.groupId" placeholder="输入授权项组名"></Input>
          </FormItem>
          <FormItem label="授权项组显示名" prop="displayName">
            <Input v-model="addRowData.displayName" placeholder="输入授权项组显示名"></Input>
          </FormItem>
          <FormItem label="备注" prop="note">
            <Input v-model="addRowData.note" type="textarea" :autosize="{minRows: 2,maxRows: 5}"
                   placeholder="输入备注"></Input>
          </FormItem>
        </Form>
        <div slot="footer">
          <Button type="text" size="large" :loading="false" @click="addRowModal = false">取消</Button>
          <Button type="primary" size="large" :loading="addRowModalLoading" @click="addRow">确认</Button>
        </div>
      </Modal>
      <Button type="primary" style="margin: 5px" :disabled="selectedRootGroups.length !== 1" @click="showEditRowModal">
        编辑分组
      </Button>
      <Modal
        v-model="editRowModal"
        title="编辑授权项组"
        :mask-closable="false"
      >
        <Form ref="editRowForm" :model="editRowData" :rules="rowValidate" label-position="top">
          <FormItem label="授权项组名" prop="groupId">
            <Input v-model="editRowData.groupId" placeholder="输入授权项组名" disabled></Input>
          </FormItem>
          <FormItem label="授权项组显示名" prop="displayName">
            <Input v-model="editRowData.displayName" placeholder="输入授权项组显示名"></Input>
          </FormItem>
          <FormItem label="备注" prop="note">
            <Input v-model="editRowData.note" type="textarea" :autosize="{minRows: 2,maxRows: 5}"
                   placeholder="输入备注"></Input>
          </FormItem>
        </Form>
        <div slot="footer">
          <Button type="text" size="large" :loading="false" @click="editRowModal = false">取消</Button>
          <Button type="primary" size="large" :loading="editRowModalLoading" @click="editRow">确认</Button>
        </div>
      </Modal>
      <Button type="error" style="margin: 5px" :disabled="selectedRootGroups.length !== 1" @click="deleteRow">
        删除分组
      </Button>
      <Button type="primary" style="margin: 5px" :disabled="selectedRootGroups.length !== 1"
              @click="editItems">
        查看授权项
      </Button>
      <Modal
        v-model="editItemsModal"
        :title="`编辑 ${currentData.groupId} 组内授权项`"
        :width="700"
        :mask-closable="false"
        style="text-align: center"
      >
        <Spin fix v-show="editItemsModalLoading"></Spin>
        <Transfer
          style="text-align:left; margin: auto"
          :data="itemsAllData"
          :target-keys="itemsTargetKeys"
          :list-style="listStyle"
          :render-format="renderItems"
          filterable
          :filter-method="filterMethod"
          @on-change="handleChangeItems">
        </Transfer>
        <div slot="footer">
          <Button type="text" size="large" :loading="false" @click="editItemsModal = false">取消</Button>
          <Button type="primary" size="large" @click="editItemsModal = false">确认</Button>
        </div>
      </Modal>
      <Button type="primary" style="margin: 5px" @click="handleFoldClick">
        {{ isFold ? '展开所有' : '折叠所有' }}
      </Button>
    </div>
    <div style="clear: both; margin: 10px">
      <!--此处Col是为了Spin在表格区域内显示，而不是覆盖整个页面-->
      <Col style="margin: 5px">
        <Spin fix v-show="loading"></Spin>
        <zk-table
          ref="table"
          :data="treeDataAll"
          :columns="tableColumns"
          stripe
          show-header
          tree-type
          :is-fold="isFold"
          :expand-type="false"
          @checkbox-click="handleCheckboxClick"
        >
        </zk-table>
      </Col>
    </div>
  </div>
</template>
<script>
import axios from "axios";
import AuthGroups from "../../api/auth-model/AuthGroups";
import AuthItems from "../../api/auth-model/AuthItems";

export default {
  name: "auth-groups",
  data() {
    return {
      isFold: true,
      treeDataAll: [],
      selectedRootGroups: [],
      groupDict: {},
      loading: false,
      addRowData: {
        parentId: "",
        groupId: "",
        displayName: "",
        note: ""
      },
      addRowModal: false,
      addRowModalLoading: false,
      editRowData: {},
      editRowModal: false,
      editRowModalLoading: false,
      editItemsModal: false,
      editItemsModalLoading: false,
      listStyle: {
        width: "280px",
        height: "300px"
      },
      rowValidate: {
        groupId: [
          { required: true, message: "授权项组名不能为空", trigger: "blur" },
          {
            pattern: /^\w+$/,
            message: "授权项组名只能包含字母、数字或下划线",
            trigger: "blur"
          }
        ],
        displayName: [
          {
            required: true,
            message: "授权项组显示名不能为空",
            trigger: "blur"
          },
          {
            pattern: /^[a-zA-Z0-9_\u0391-\uFFE5]+$/,
            message: "授权项组显示名只能包含汉字、字母、数字或下划线",
            trigger: "blur"
          }
        ],
        note: [
          {
            type: "string",
            max: 100,
            message: "备注不能超过100字符",
            trigger: "blur"
          }
        ]
      },
      tableColumns: [
        {
          label: "授权项组名",
          prop: "groupId"
        },
        {
          label: "授权项组显示名",
          prop: "displayName"
        },
        {
          label: "备注",
          prop: "note"
        }
      ],
      itemsAllData: [],
      itemsTargetKeys: []
    };
  },
  computed: {
    currentData() {
      if (this.selectedRootGroups.length === 1) {
        let groupId = this.selectedRootGroups[0];
        return {
          groupId: groupId,
          displayName: this.groupDict[groupId].displayName,
          note: this.groupDict[groupId].note
        };
      } else {
        return {
          groupId: undefined,
          displayName: undefined,
          note: undefined
        };
      }
    }
  },
  created() {
    this.getAllRows();
  },
  methods: {
    showAddRowModal() {
      this.addRowModal = true;
      this.addRowData = {
        parentId:
          this.selectedRootGroups.length === 1
            ? this.selectedRootGroups[0]
            : "",
        groupId: "",
        displayName: "",
        note: ""
      };
      this.$refs["addRowForm"].resetFields();
    },
    showEditRowModal() {
      this.editRowData = {...this.currentData};
      this.editRowModal = true;
    },
    sortByKey(array, key) {
      return array.sort(function(a, b) {
        var x = a[key]; var y = b[key];
        return ((x < y) ? -1 : ((x > y) ? 1 : 0));
      });
    },
    treeify(list, idAttr, parentAttr, childrenAttr) {
      if (!idAttr) idAttr = 'id';
      if (!parentAttr) parentAttr = 'parent';
      if (!childrenAttr) childrenAttr = 'children';
      var treeList = [];
      var lookup = {};
      list.forEach(function(obj) {
        lookup[obj[idAttr]] = obj;
        obj[childrenAttr] = [];
      });
      list.forEach(function(obj) {
        if (obj[parentAttr] != 0) {
          lookup[obj[parentAttr]][childrenAttr].push(obj);
        } else {
          treeList.push(obj);
        }
      });
      return treeList;
    },
    getAllRows() {
      let groupNameToInt = { RootAuthGroup: 0 };
      let prepareTree = [];
      let listAll = [];
      let listChildren = [];
      this.loading = true;
      AuthGroups.getAllGroups()
        .then(res => {
          let counter = 1;
          res.data.forEach(item => {
            this.groupDict[item.groupId] = {
              displayName: item.displayName,
              note: item.note
            };
            groupNameToInt[item.groupId] = counter++;
            listAll.push(item.groupId);
          });
          AuthGroups.getAllGroupToSubgroups().then(resInner => {
            resInner.data.forEach(item => {
              prepareTree.push({
                groupId: item.childId,
                ...this.groupDict[item.childId],
                childId: groupNameToInt[item.childId],
                parentId: groupNameToInt[item.parentId],
                children: []
              });
              listChildren.push(item.childId);
            });
            let listRoot = listAll.filter(x => listChildren.indexOf(x) < 0);
            listRoot.forEach(item => {
              prepareTree.push({
                groupId: item,
                ...this.groupDict[item],
                childId: groupNameToInt[item],
                parentId: 0,
                children: []
              });
            });
            this.treeDataAll = this.treeify(this.sortByKey(prepareTree, 'groupId'), 'childId', 'parentId', 'children');
          });
        })
        .then(res => {
          this.selectedRootGroups = [];
          this.loading = false;
        });
    },
    addRow() {
      this.$refs["addRowForm"].validate(valid => {
        if (valid) {
          this.addRowModalLoading = true;
          if (this.currentData.groupId === undefined) {
            AuthGroups.createGroups([this.addRowData])
              .then(res => {
                this.getAllRows();
                this.addRowModalLoading = false;
                this.addRowModal = false;
                this.$refs["addRowForm"].resetFields();
                this.$Message.success("创建授权项组成功");
              })
              .catch(error => {
                this.addRowModalLoading = false;
                this.$Message.error(error.response.data.message);
              });
          } else {
            AuthGroups.createSubGroup(this.currentData.groupId, this.addRowData)
              .then(res => {
                this.getAllRows();
                this.addRowModalLoading = false;
                this.addRowModal = false;
                this.$refs["addRowForm"].resetFields();
                this.$Message.success("创建授权项组成功");
              })
              .catch(error => {
                this.addRowModalLoading = false;
                this.$Message.error(error.response.data.message);
              });
          }
        } else {
          this.addRowModalLoading = false;
          this.$Message.error("请检查输入是否正确");
        }
      });
    },
    editRow() {
      this.$refs["editRowForm"].validate(valid => {
        if (valid) {
          this.editRowModalLoading = true;
          AuthGroups.updateGroups([this.editRowData])
            .then(res => {
              this.getAllRows();
              this.editRowModalLoading = false;
              this.editRowModal = false;
              this.$Message.success("更新授权项组成功");
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
    },
    deleteRow() {
      this.$Modal.confirm({
        title: "删除授权项组",
        content: `<p>是否确认删除选中授权项组"${
          this.currentData.groupId
        }"？</p><p>它的子组（若存在）将被一同删除。</p>`,
        loading: true,
        onOk: () => {
          this.$Modal.loading = true;
          AuthGroups.deleteGroups([this.currentData.groupId])
            .then(res => {
              this.getAllRows();
              this.$Modal.loading = false;
              this.$Modal.remove();
              this.selectedRootGroups = [];
              this.$Message.success("删除授权项组成功");
            })
            .catch(error => {
              this.$Modal.loading = false;
              this.$Modal.remove();
              this.$Message.error(error.response.data.message);
            });
        }
      });
    },
    getSelectedRoots() {
      this.selectedRootGroups = [];
      const currentChildIds = this.$refs["table"].getCheckedProp("childId");
      const selectedRows = this.$refs["table"].bodyData.filter(item => {
        return currentChildIds.includes(item.childId);
      });
      selectedRows.forEach(row => {
        let rootId = row.childId;
        let currentId = row.childId;
        while (currentId > 0) {
          currentId = this.$refs["table"].bodyData.filter(item => {
            return item.childId === currentId;
          })[0].parentId;
          if (currentChildIds.includes(currentId)) {
            rootId = currentId;
          }
        }
        let pushItem = this.$refs["table"].bodyData.filter(item => {
          return item.childId === rootId;
        })[0].groupId;
        if (this.selectedRootGroups.indexOf(pushItem) === -1) {
          this.selectedRootGroups.push(pushItem);
        }
      });
    },
    handleFoldClick() {
      this.selectedRootGroups = [];
      this.isFold = !this.isFold;
    },
    handleCheckboxClick() {
      this.getSelectedRoots();
      // this.currentGroupIds = this.$refs["table"].getCheckedProp("groupId");
      // Fix bug: zk-checkbox--checked not showing correctly
      this.$nextTick(() => {
        this.$refs["table"].bodyData.forEach((item, index) => {
          document
            .getElementsByClassName("zk-checkbox")
            [index + 1].classList.remove("zk-checkbox--checked");
        });
        this.$refs["table"].getCheckedProp().forEach(index => {
          document
            .getElementsByClassName("zk-checkbox")
            [index + 1].classList.add("zk-checkbox--checked");
        });
      });
    },
    editItems() {
      this.editItemsModalLoading = true;
      this.editItemsModal = true;
      axios
        .all([
          AuthItems.getAllItems().then(res => {
            this.itemsAllData = res.data.map(item => {
              return {
                key: item.authorityId,
                ...item
              };
            });
          }),
          AuthGroups.getGroupItems(this.currentData.groupId).then(res => {
            this.itemsTargetKeys = res.data.map(item => {
              return item.authorityId;
            });
          })
        ])
        .then(() => {
          this.editItemsModalLoading = false;
        });
    },
    renderItems(item) {
      return `${item.displayName}(${item.authorityId})`;
    },
    handleChangeItems(newTargetKeys, direction, moveKeys) {
      this.editItemsModalLoading = true;
      if (direction === "left") {
        let deleteItems = [];
        moveKeys.forEach(item => {
          deleteItems.push(item);
        });
        AuthGroups.deleteGroupItems(this.currentData.groupId, deleteItems)
          .then(() => {
            this.itemsTargetKeys = this.itemsTargetKeys.filter(
              e => deleteItems.indexOf(e) === -1
            );
            this.editItemsModalLoading = false;
          })
          .catch(error => {
            this.editItemsModalLoading = false;
          });
      } else {
        let createItems = [];
        let createItemNames = [];
        moveKeys.forEach(item => {
          createItems.push({
            authorityId: item,
            groupId: this.currentData.groupId
          });
          createItemNames.push(item);
        });
        AuthGroups.createGroupItems(this.currentData.groupId, createItems)
          .then(() => {
            this.itemsTargetKeys = this.itemsTargetKeys.concat(createItemNames);
            this.editItemsModalLoading = false;
          })
          .catch(error => {
            this.editItemsModalLoading = false;
          });
      }
    },
    filterMethod(data, query) {
      return (
        data.authorityId.toLowerCase().indexOf(query.toLowerCase()) > -1 ||
        data.displayName.toLowerCase().indexOf(query.toLowerCase()) > -1
      );
    }
  }
};
</script>

<style lang="less">
div.zk-table {
  div.zk-table__header-wrapper {
    table.zk-table__header {
      tr.zk-table__header-row {
        th.zk-table__header-cell {
          &:nth-child(1) {
            div.zk-table__cell-inner {
              label.zk-checkbox-wrapper {
                display: none;
              }
            }
          }
        }
      }
    }
  }
}
.ivu-modal-header {
  text-align: left;
}
</style>
