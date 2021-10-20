<template>
  <div>
    <div style="float: left; margin: 10px 10px 0;">
      <Button type="primary" style="margin: 5px" @click="showAddGroupModal" id="createComGroupButton">
        新增组件分组
      </Button>
      <Modal
        v-model="addGroupModal"
        title="新增组件分组"
        :mask-closable="false"
        id="createComGroupModal"
      >
        <Form ref="addGroupForm" :model="addGroupData" :rules="rowValidate" :label-width="80">
          <FormItem label="英文名" prop="name">
            <Input v-model="addGroupData.name" placeholder="输入英文名" id="createComGroupModalName"></Input>
          </FormItem>
          <FormItem label="显示名" prop="displayName">
            <Input v-model="addGroupData.displayName" placeholder="输入显示名" id="createComGroupModalDisplayName"></Input>
          </FormItem>
        </Form>
        <div slot="footer">
          <Button type="text" size="large" :loading="false" @click="addGroupModal = false">取消</Button>
          <Button type="primary" size="large" :loading="addGroupModalLoading" @click="addRow"
                  id="confirmCreateComGroupButton">确认
          </Button>
        </div>
      </Modal>
      <Button type="primary" style="margin: 5px" :disabled="currentData.name === undefined"
              @click="showEditGroupModal" id="editAttrButton">
        编辑组件分组
      </Button>
      <Button type="error" style="margin: 5px" :disabled="currentData.name === undefined" @click="deleteRow"
              id="deleteAttrButton">
        删除组件分组
      </Button>
      <Modal
        v-model="editGroupModal"
        title="编辑组件分组"
        :mask-closable="false"
        id="editAttrModal"
      >
        <Form ref="editGroupForm" :model="editGroupData" :rules="rowValidate" :label-width="80">
          <FormItem label="英文名" prop="name">
            <Input v-model="editGroupData.name" disabled id="editAttrModalAttributeName"></Input>
          </FormItem>
          <FormItem label="显示名" prop="displayName">
            <Input v-model="editGroupData.displayName" :disabled="editGroupData.name === 'Uncategorized'" placeholder="输入显示名" id="editAttrModalDisplayName"></Input>
          </FormItem>
        </Form>
        <div slot="footer">
          <Button type="text" size="large" :loading="false" @click="editGroupModal = false">取消</Button>
          <Button type="primary" size="large" :loading="editGroupModalLoading" @click="editRow"
                  id="confirmEditAttrButton">确认
          </Button>
        </div>
      </Modal>
    </div>
    <div style="float: right; margin: 10px 10px 0;">
      <Input
        v-model="keyword"
        icon="md-search"
        placeholder="输入关键词查询"
        style="width: 200px; margin: 5px"
        @on-change="searchKeyword"
        id="searchAttrInput"
      >
      </Input>
    </div>
    <div style="clear: both; margin: 10px">
      <Table
        id="attrTable"
        ref="viewTable"
        width="100%"
        :height="tableHeight"
        style="margin: 5px;"
        :loading="loading"
        stripe
        border
        highlight-row
        size="small"
        :data="tableDataPage"
        :columns="tableColumns"
        @on-row-click="selectRow"
        @on-row-dblclick="handleDoubleClick"
        @on-sort-change="handleSortChange"
      >
      </Table>
    </div>
    <div style="margin: 10px; overflow: hidden">
      <div style="float: right; margin: 5px">
        <Page
          style="margin-bottom: 20px"
          size="small"
          show-sizer
          show-elevator
          show-total
          placement="top"
          :page-size-opts="pageSizeOpts"
          :pageSize="pageSize"
          :total="filteredTableData.length"
          :current="currentPage"
          @on-change="changePage"
          @on-page-size-change="changePageSize"></Page>
      </div>
    </div>
  </div>
</template>
<script>
import {tableMixin} from "@/component/tableMixin"
import {
  getComponentGroups,
  createComponentGroups,
  updateComponentGroups,
  deleteComponentGroups
} from "@/api/data-model/ComponentGroupLib";
import _ from 'lodash';

const isEmpty = str => {
  return str === undefined || str === null || str.trim() === '';
};

export default {
  name: "componentGroup-management",
  mixins: [tableMixin],
  data() {
    return {
      tableDataAll: [],
      tableDataAllUnsorted: [],
      loading: true,
      limitLength: false,
      noTime: true,
      columnsWidth: 159,
      currentPage: 1,
      pageSize: 10,
      pageSizeOpts: [10, 25, 50, 100, 200, 500],
      keyword: "",
      currentData: {
        oid: undefined,
        name: undefined,
        displayName: undefined,
        state: undefined
      },
      editGroupData: {},
      addGroupModal: false,
      addGroupModalLoading: false,
      addGroupData: {
        name: "",
        displayName: "",
      },
      editGroupModal: false,
      editGroupModalLoading: false,
      updateClassInfoLoading: false,
      rowValidate: {
        name: [
          {required: true, message: "英文名不能为空", trigger: "blur"},
          {
            pattern: /^[a-zA-Z0-9]{1,32}$/,
            message: "英文名只能包含字母、数字，长度不超过32个字符",
            trigger: "blur"
          },
          {pattern: /^[a-zA-Z]/, message: "英文名首字母应为字母", trigger: "blur"}
        ],
        displayName: [
          {required: true, message: "显示名不能为空", trigger: "blur"},
          {
            pattern: /^\S{1,32}$/,
            message: "显示名只能包含汉字、字母、数字，长度不超过32个字符",
            trigger: "blur"
          }
        ],
      },
      tableColumns: [
        {
          type: "index",
          title: "序号",
          width: 80,
          align: "center"
        },
        {
          title: "英文名",
          key: "name",
          sortable: "custom"
        },
        {
          title: "显示名",
          key: "displayName",
          sortable: "custom"
        },
      ],
      allValueTypes: {},
      sortParams: undefined
    };
  },
  computed: {
    filteredTableData() {
      let keywordLower = this.keyword.toLowerCase().trimStart().trimEnd();
      let res = [];
      this.tableDataAll.forEach(id => {
        let data = id;
        for (let key in data) {

          if (key == 'name' || key == 'displayName' ) {

            if (
              data[key]
                .toString()
                .toLowerCase()
                .match(keywordLower) !== null
            ) {
              res.push(data);
              break;
            }

          }

        }
      })
      return res;
    },
    tableDataPage() {
      return this.filteredTableData.slice(
        this.currentPage * this.pageSize - this.pageSize,
        this.currentPage * this.pageSize
      );
    }
  },
  created() {
    this.resetColumnsWidth();
    this.initData();
  },
  methods: {
    initData() {
      this.getAllRows();
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
      let finalWidth = parseInt(sideWidth) + 120;
      this.columnsWidth = (document.body.clientWidth - finalWidth) / 2;
      console.log(this.columnsWidth)

      this.tableColumns = [
        {
          type: "index",
          title: "序号",
          minWidth: 80,
          align: "center"
        },
        {
          title: "英文名",
          key: "name",
          minWidth: this.columnsWidth,
          sortable: "custom"
        },
        {
          title: "显示名",
          key: "displayName",
          minWidth: this.columnsWidth,
          sortable: "custom"
        },
      ]

    },

    async getAllRows() {
      this.currentData = {
        oid: undefined,
        name: undefined,
        displayName: undefined,
        state: undefined
      };
      this.loading = true;
      let res = await getComponentGroups();
      this.loading = false;
      this.tableDataAll = res.data;
      this.tableDataAllUnsorted = _.cloneDeep(this.tableDataAll);
      this.handleSortChange(this.sortParams);
    },

    changePage(pageId) {
      this.currentData = {
        oid: undefined,
        name: undefined,
        displayName: undefined,
        state: undefined
      };
      this.currentPage = pageId;
    },
    changePageSize(pageSize) {
      this.currentData = {
        oid: undefined,
        name: undefined,
        displayName: undefined,
        state: undefined
      };
      this.pageSize = pageSize;
    },
    searchKeyword() {
      this.currentData = {};
      this.changePage(1);
      this.handleSortChange(this.sortParams);
    },
    selectRow(rowData) {
      this.currentData = rowData;
      this.editClassInfo = false;
    },
    addRow() {
      this.$refs["addGroupForm"].validate(async valid => {
        if (valid) {
          this.addGroupModalLoading = true;
          try {
            await createComponentGroups(this.addGroupData);
            this.getAllRows();
            this.addGroupModalLoading = false;
            this.addGroupModal = false;
            this.addGroupData = {
              name: "",
              displayName: "",
            };
            this.$Message.success("新增分组成功");
            this.changePage(1);
          }catch (e) {
            this.addGroupModalLoading = false;
          }
        } else {
          this.addGroupModalLoading = false;
          this.$Message.error("请检查输入是否正确");
        }
      });
    },

    deleteRow() {
      this.$Modal.confirm({
        title: "删除分组",
        content: "<p>是否确认删除当前选中分组？</p>",
        loading: true,
        onOk: async () => {
          this.$Modal.loading = true;
          try {
            await deleteComponentGroups(this.currentData.oid)
            this.getAllRows();
            if (
              this.tableDataAll.length - 1 ===
              this.pageSize * (this.currentPage - 1) &&
              this.tableDataAll.length !== 1
            )
            this.changePage(this.currentPage - 1);
            this.$Modal.loading = false;
            this.$Modal.remove();
            this.$Message.success("删除分组成功");
          }catch (e) {
            this.$Modal.loading = false;
            this.$Modal.remove();
            this.$Message.error(error.response.data.message);
          }
        }
      });
    },
    showAddGroupModal() {
      this.$refs['addGroupForm'].resetFields();
      this.addGroupModal = true;
      this.limitLength = false;
      this.editGroupData = {};
      this.noTime = true;
    },
    showEditGroupModal() {
      this.$refs['editGroupForm'].resetFields();
      this.editGroupModal = true;
      if (['Date', 'TimeStamp', 'Time'].includes(this.currentData.valueType)) {
        this.noTime = false;
      } else {
        this.noTime = true;
      }
      this.editGroupData = {...this.currentData};

    },
    editRow() {
      this.$refs["editGroupForm"].validate(async valid => {
        if (valid) {
          this.editGroupModalLoading = true;
          try {
            let res = await updateComponentGroups(this.editGroupData);
            if (res.code !== 400) {
              this.getAllRows();
              this.editGroupModalLoading = false;
              this.editGroupModal = false;
              this.$Message.success("编辑分组成功");
            } else {
              this.$Message.error(res.message);
            }
          }catch (e) {
            this.editGroupModalLoading = false;
          }
        } else {
          this.editGroupModalLoading = false;
          this.$Message.error("请检查输入是否正确");
        }
      });
    },
    handleDoubleClick(rowData, index) {
      this.selectRow(rowData);
      this.showEditGroupModal();
    },

    handleSortChange(params) {
      this.sortParams = params;
      if (params === undefined) return;
      if (params.order === "asc") {
        this.tableDataAll.sort(function (a, b) {
          if (a[params.key] === undefined) return -1;
          if (b[params.key] === undefined) return 1;
          return a[params.key].toString().toLowerCase() > b[params.key].toString().toLowerCase() ? 1 : -1;
        });
      } else if (params.order === "desc") {
        this.tableDataAll.sort(function (a, b) {
          if (a[params.key] === undefined) return 1;
          if (b[params.key] === undefined) return -1;
          return a[params.key].toString().toLowerCase() > b[params.key].toString().toLowerCase() ? -1 : 1;
        });
      } else {
        this.tableDataAll = _.cloneDeep(this.tableDataAllUnsorted);
      }
    },
  }
};
</script>
