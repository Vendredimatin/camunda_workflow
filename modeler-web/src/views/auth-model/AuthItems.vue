<template>
  <div>
    <div style="float: left; margin: 10px">
      <Button type="primary" style="margin: 5px" @click="showAddRowModal">
        新增授权项
      </Button>
      <Modal
        v-model="addRowModal"
        title="新增授权项"
        :mask-closable="false"
      >
        <Form ref="addRowForm" :model="addRowData" :rules="rowValidate" label-position="top">
          <FormItem label="授权项名" prop="authorityId">
            <Input v-model="addRowData.authorityId" placeholder="输入授权项名"></Input>
          </FormItem>
          <FormItem label="授权项显示名" prop="displayName">
            <Input v-model="addRowData.displayName" placeholder="输入授权项显示名"></Input>
          </FormItem>
          <FormItem label="备注" prop="note">
            <Input v-model="addRowData.note" type="textarea" :autosize="{minRows: 2,maxRows: 5}"
                   placeholder="输入备注"></Input>
          </FormItem>
        </Form>
        <!--改写Footer，用于在点击确认按钮但服务器返回4xx/5xx时，防止modal关闭-->
        <div slot="footer">
          <Button type="text" size="large" :loading="false" @click="addRowModal = false">取消</Button>
          <Button type="primary" size="large" :loading="addRowModalLoading" @click="addRow">确认</Button>
        </div>
      </Modal>
      <Button type="error" style="margin: 5px" :disabled="currentData.authorityId === undefined" @click="deleteRow">
        删除授权项
      </Button>
      <Button type="primary" style="margin: 5px" :disabled="currentData.authorityId === undefined" @click="editRowModal = true">
        编辑授权项
      </Button>
      <Modal
        v-model="editRowModal"
        title="编辑授权项"
        :mask-closable="false"
      >
        <Form ref="editRowForm" :model="editRowData" :rules="rowValidate" label-position="top">
          <FormItem label="授权项名" prop="authorityId">
            <Input v-model="editRowData.authorityId" placeholder="输入授权项名" disabled></Input>
          </FormItem>
          <FormItem label="授权项显示名" prop="displayName">
            <Input v-model="editRowData.displayName" placeholder="输入授权项显示名"></Input>
          </FormItem>
          <FormItem label="备注" prop="note">
            <Input v-model="editRowData.note" type="textarea" :autosize="{minRows: 2,maxRows: 5}"
                   placeholder="输入备注"></Input>
          </FormItem>
        </Form>
        <!--改写Footer，用于在点击确认按钮但服务器返回4xx/5xx时，防止modal关闭-->
        <div slot="footer">
          <Button type="text" size="large" :loading="false" @click="editRowModal = false">取消</Button>
          <Button type="primary" size="large" :loading="editRowModalLoading" @click="editRow">确认</Button>
        </div>
      </Modal>
    </div>
    <div style="float: right; margin: 10px">
      <Input
        v-model="keyword"
        icon="md-search"
        placeholder="输入关键词查询"
        style="width: 200px; margin: 5px"
        @on-change="searchKeyword"
      >
      </Input>
    </div>
    <div style="clear: both; margin: 10px">
      <Table style="margin: 5px"
             :loading="loading"
             stripe
             show-header
             highlight-row
             size="small"
             :data="tableDataPage"
             :columns="tableColumns"
             @on-row-click="selectRow"
             @on-row-dblclick="handleDoubleClick"
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
import AuthItems from "../../api/auth-model/AuthItems";

export default {
  name: "auth-items",
  data() {
    return {
      tableDataAll: [],
      loading: true,
      currentPage: 1,
      pageSize: 10,
      pageSizeOpts: [10, 25, 50, 100, 200, 500],
      keyword: "",
      currentData: {
        id: undefined,
        authorityId: undefined,
        displayName: undefined,
        note: undefined
      },
      addRowModal: false,
      addRowModalLoading: false,
      addRowData: {
        authorityId: "",
        displayName: "",
        note: ""
      },
      editRowData: {},
      editRowModal: false,
      editRowModalLoading: false,
      rowValidate: {
        authorityId: [
          { required: true, message: "授权项名不能为空", trigger: "blur" },
          {
            pattern: /^\w+$/,
            message: "授权项名只能包含字母、数字或下划线",
            trigger: "blur"
          }
        ],
        displayName: [
          { required: true, message: "授权项显示名不能为空", trigger: "blur" },
          {
            pattern: /^[a-zA-Z0-9_\u0391-\uFFE5]+$/,
            message: "授权项显示名只能包含汉字、字母、数字或下划线",
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
      }
    };
  },
  computed: {
    tableColumns() {
      let columns = [
        {
          type: "index",
          title: "序号",
          width: 80,
          align: "center"
        }
      ];
      columns.push({
        title: "授权项名",
        key: "authorityId",
        sortable: true,
        tooltip: true
      });
      columns.push({
        title: "授权项显示名",
        key: "displayName",
        sortable: true,
        tooltip: true
      });
      columns.push({
        title: "备注",
        key: "note",
        sortable: true,
        tooltip: true
      });
      return columns;
    },
    filteredTableData() {
      let keywordLower = this.keyword.toLowerCase();
      let res = [];
      for (let id in this.tableDataAll) {
        let data = this.tableDataAll[id];
        for (let key in data) {
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
    this.getAllRows();
  },
  methods: {
    getAllRows() {
      this.currentData = {
        conditionId: undefined,
        conditionExpre: undefined,
        note: undefined,
        oid: undefined,
        conditionState: undefined
      };
      this.loading = true;
      AuthItems.getAllItems().then(res => {
        this.loading = false;
        this.tableDataAll = res.data;
      });
    },
    changePage(pageId) {
      this.currentData = {
        id: undefined,
        authorityId: undefined,
        displayName: undefined,
        note: undefined
      };
      this.currentPage = pageId;
    },
    changePageSize(pageSize) {
      this.currentData = {
        id: undefined,
        authorityId: undefined,
        displayName: undefined,
        note: undefined
      };
      this.pageSize = pageSize;
    },
    searchKeyword() {
      this.currentData = {};
      this.changePage(1);
    },
    selectRow(rowData) {
      this.currentData = rowData;
      this.editRowData = {...this.currentData};
    },
    showAddRowModal() {
      this.addRowModal = true;
      this.addRowData = {
        authorityId: "",
        displayName: "",
        note: ""
      };
      this.$refs["addRowForm"].resetFields();
    },
    addRow() {
      this.$refs["addRowForm"].validate(valid => {
        if (valid) {
          this.addRowModalLoading = true;
          let mergedData = {
            id: "",
            ...this.addRowData
          };
          AuthItems.createItem(mergedData)
            .then(res => {
              this.getAllRows();
              this.addRowModalLoading = false;
              this.addRowModal = false;
              this.$refs["addRowForm"].resetFields();
              this.$Message.success("新增授权项成功");
            })
            .catch(error => {
              this.addRowModalLoading = false;
              this.$Message.error(error.response.data.message);
            });
        } else {
          this.addRowModalLoading = false;
          this.$Message.error("请检查输入是否正确");
        }
      });
    },
    deleteRow() {
      this.$Modal.confirm({
        title: "删除授权项",
        content: "<p>是否确认删除当前选中授权项？</p>",
        loading: true,
        onOk: () => {
          this.$Modal.loading = true;
          AuthItems.deleteItem(this.currentData.authorityId)
            .then(res => {
              this.getAllRows();
              if (
                this.tableDataAll.length - 1 ===
                  this.pageSize * (this.currentPage - 1) &&
                this.tableDataAll.length !== 1
              )
                this.changePage(this.currentPage - 1);
              this.$Modal.loading = false;
              this.$Modal.remove();
              this.$Message.success("删除授权项成功");
            })
            .catch(error => {
              this.$Modal.loading = false;
              this.$Modal.remove();
              this.$Message.error(error.response.data.message);
            });
        }
      });
    },
    editRow() {
      this.$refs["editRowForm"].validate(valid => {
        if (valid) {
          this.editRowModalLoading = true;
          AuthItems.updateItem(this.editRowData)
            .then(res => {
              this.getAllRows();
              this.editRowModalLoading = false;
              this.editRowModal = false;
              this.$Message.success("更新授权项成功");
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
    handleDoubleClick(rowData, index) {
      this.selectRow(rowData);
      this.editRowModal = true;
    }
  }
};
</script>
