<template>
  <div>
    <div style="float: left; margin: 10px">
      <Button type="primary" style="margin: 5px" @click="showAddRowModal">
        新增条件
      </Button>
      <Modal
        v-model="addRowModal"
        title="新增条件"
        :mask-closable="false"
      >
        <Form ref="addRowForm" :model="addRowData" :rules="rowValidate" label-position="top">
          <FormItem label="条件名" prop="conditionId">
            <Input v-model="addRowData.conditionId" placeholder="输入条件名"></Input>
          </FormItem>
          <FormItem label="条件表达式" prop="conditionExpre">
            <Input v-model="addRowData.conditionExpre" placeholder="输入条件表达式"></Input>
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
      <Button type="error" style="margin: 5px" :disabled="currentData.oid === undefined" @click="deleteRow">
        删除条件
      </Button>
      <Button type="primary" style="margin: 5px" :disabled="currentData.oid === undefined" @click="editRowModal = true">
        编辑条件
      </Button>
      <Modal
        v-model="editRowModal"
        title="编辑条件"
        :mask-closable="false"
      >
        <Form ref="editRowForm" :model="editRowData" :rules="rowValidate" label-position="top">
          <FormItem label="条件名" prop="conditionId">
            <Input v-model="editRowData.conditionId" placeholder="输入条件名"></Input>
          </FormItem>
          <FormItem label="条件表达式" prop="conditionExpre">
            <Input v-model="editRowData.conditionExpre" placeholder="输入条件表达式"></Input>
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
import AuthConditions from "../../api/auth-model/AuthConditions";

export default {
  name: "auth-conditions",
  data() {
    return {
      tableDataAll: [],
      loading: true,
      currentPage: 1,
      pageSize: 10,
      pageSizeOpts: [10, 25, 50, 100, 200, 500],
      keyword: "",
      currentData: {
        conditionId: undefined,
        conditionExpre: undefined,
        note: undefined,
        oid: undefined,
        conditionState: undefined
      },
      addRowModal: false,
      addRowModalLoading: false,
      addRowData: {
        conditionId: "",
        conditionExpre: "",
        note: ""
      },
      editRowData: {
        conditionId: "",
        conditionExpre: "",
        note: ""
      },
      editRowModal: false,
      editRowModalLoading: false,
      rowValidate: {
        conditionId: [
          { required: true, message: "条件名不能为空", trigger: "blur" },
          {
            pattern: /^[a-zA-Z0-9_\u0391-\uFFE5]+$/,
            message: "条件名只能包含汉字、字母、数字或下划线",
            trigger: "blur"
          }
        ],
        conditionExpre: [
          { required: true, message: "条件表达式不能为空", trigger: "blur" }
        ],
        note: [
          {
            type: "string",
            max: 300,
            message: "备注不能超过300字符",
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
        title: "条件名",
        key: "conditionId",
        sortable: true,
        tooltip: true
      });
      columns.push({
        title: "条件表达式",
        key: "conditionExpre",
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
      AuthConditions.getAllConditions().then(res => {
        this.loading = false;
        this.tableDataAll = res.data;
      });
    },
    changePage(pageId) {
      this.currentData = {
        conditionId: undefined,
        conditionExpre: undefined,
        note: undefined,
        oid: undefined,
        conditionState: undefined
      };
      this.currentPage = pageId;
    },
    changePageSize(pageSize) {
      this.currentData = {
        conditionId: undefined,
        conditionExpre: undefined,
        note: undefined,
        oid: undefined,
        conditionState: undefined
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
        conditionId: "",
        conditionExpre: "",
        note: ""
      };
      this.$refs["addRowForm"].resetFields();
    },
    addRow() {
      this.$refs["addRowForm"].validate(valid => {
        if (valid) {
          this.addRowModalLoading = true;
          let mergedData = [
            {
              conditionState: 1,
              oid: "",
              ...this.addRowData
            }
          ];
          AuthConditions.createConditions(mergedData)
            .then(res => {
              this.getAllRows();
              this.addRowModalLoading = false;
              this.addRowModal = false;
              this.$refs["addRowForm"].resetFields();
              this.$Message.success("新增条件成功");
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
        title: "删除条件",
        content: "<p>是否确认删除当前选中条件？</p>",
        loading: true,
        onOk: () => {
          this.$Modal.loading = true;
          let condOid = this.currentData.oid;
          AuthConditions.deleteCondition(condOid)
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
              this.$Message.success("删除条件成功");
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
          let mergedData = {
            conditionState: 1,
            oid: this.currentData.oid,
            ...this.editRowData
          };
          AuthConditions.updateCondition(mergedData)
            .then(res => {
              this.getAllRows();
              this.editRowModalLoading = false;
              this.editRowModal = false;
              this.$Message.success("更新条件成功");
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
