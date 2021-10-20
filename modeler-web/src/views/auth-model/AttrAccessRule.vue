<template>
  <div>
    <div style="float: left; margin: 10px">
      <Button id="createAttrRuleButton" type="primary" style="margin: 5px" @click="showAddRowModal">
        新增属性授权规则
      </Button>
      <Modal
        v-model="addRowModal"
        id="createAttrRuleModal"
        title="新增属性授权规则"
        :mask-closable="false"
      >
        <Form ref="addRowForm" :model="addRowData" :rules="rowValidate" label-position="top" @submit.native.prevent>
          <FormItem label="名称" prop="name">
            <Input id="attrRuleName" v-model="addRowData.name" placeholder="属性授权规则名称"></Input>
          </FormItem>
          <FormItem label="内容" prop="content">
            <Input id="attrRuleContent" v-model="addRowData.content" type="textarea" :rows="4" placeholder="属性授权规则SQL语句，应返回userId、objId两列"></Input>
          </FormItem>
          <FormItem label="备注" prop="note">
            <Input id="attrRuleNote" v-model="addRowData.note" type="textarea" :rows="4" :autosize="{minRows: 2,maxRows: 5}"
                   placeholder="输入备注"></Input>
          </FormItem>
        </Form>
        <div slot="footer">
          <Button type="text" size="large" :loading="false" @click="addRowModal = false">取消</Button>
          <Button id="confirmCreateAttrRuleButton" type="primary" size="large" :loading="addRowModalLoading" @click="addRow">确认</Button>
        </div>
      </Modal>
      <Button id="deleteAttrRuleButton" type="error" style="margin: 5px" :disabled="currentData.id === undefined" @click="deleteRow">
        删除属性授权规则
      </Button>
      <Button id="editAttrRuleButton" type="primary" style="margin: 5px" :disabled="currentData.id === undefined" @click="editRowModal = true">
        编辑属性授权规则
      </Button>
      <Modal
        v-model="editRowModal"
        id="editAttrRuleModal"
        title="编辑属性授权规则"
        :mask-closable="false"
      >
        <Form ref="editRowForm" :model="editRowData" :rules="rowValidate" label-position="top" @submit.native.prevent>
          <FormItem label="名称" prop="name">
            <Input id="editAttrRuleName" v-model="editRowData.name" placeholder="属性授权规则名称"></Input>
          </FormItem>
          <FormItem label="内容" prop="content">
            <Input id="editAttrRuleContent" v-model="editRowData.content" type="textarea" :rows="4" placeholder="属性授权规则SQL语句，应返回userId、objId两列"></Input>
          </FormItem>
          <FormItem label="备注" prop="note">
            <Input id="editAttrRuleNote" v-model="editRowData.note" type="textarea" :rows="4" :autosize="{minRows: 2,maxRows: 5}"
                   placeholder="输入备注"></Input>
          </FormItem>
        </Form>
        <div slot="footer">
          <Button type="text" size="large" :loading="false" @click="editRowModal = false">取消</Button>
          <Button id="confirmEditAttrRuleButton" type="primary" size="large" :loading="editRowModalLoading" @click="editRow">确认</Button>
        </div>
      </Modal>
    </div>
    <div style="float: right; margin: 10px">
      <Input
        v-model="keyword"
        id="searchAttrRuleKey"
        icon="md-search"
        placeholder="输入关键词查询"
        style="width: 200px; margin: 5px"
        @on-change="searchKeyword"
      >
      </Input>
    </div>
    <div style="clear: both; margin: 10px">
      <Table
        ref="viewTable"
        id="attrRuleTable"
        :height="tableHeight"
        style="margin: 5px"
        :loading="loading"
        stripe
        border
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
          :current.sync="currentPage"
          @on-change="changePage"
          @on-page-size-change="changePageSize"></Page>
      </div>
    </div>

    <Modal
      v-model="deleteConfirm"
      title="删除属性授权规则"
      id="deleteAttrRuleModal"
    >
      <p>是否确认删除当前选中属性授权规则?</p>
      <br>
      <Checkbox v-model="cascade" id="cascadeDeleteEntity">级联删除与此属性授权规则关联的对象授权规则(<span style="color: orangered">请谨慎选择</span>)</Checkbox>
      <div slot="footer">
        <Button id="cancelDeleteAttrRuleModal" type="text" size="large" :loading="false" @click="deleteConfirm = false">取消</Button>
        <Button id="confirmDeleteAttrRuleModal" type="primary" size="large" :loading="deleteModalLoading" @click="deleteRowOnOk">确认</Button>
      </div>
    </Modal>
  </div>
</template>
<script>
import {tableMixin} from "@/component/tableMixin"
import AttrAccessRule from "../../api/auth-model/AttrAccessRule";

export default {
  name: "attr-access-rule",
  mixins: [tableMixin],
  data() {
    const validateEname = (rule, value, callback) => {
        if (value === '') {
            callback(new Error('属性授权规则名不能为空'));
        } else {
            const reg = new RegExp("^[a-zA-Z0-9_\u0391-\uFFE5]+$");
            let flag = reg.test(value);
            if(!flag){
              callback(new Error('属性授权规则名只能包含汉字、字母、数字或下划线'));
            } else {
              if(value.length > 32) {
                callback(new Error('属性授权规则名只能包含汉字、字母、数字或下划线,长度不能超过32个字符'));
              } else {
                callback();
              }
            }
        }
    };
    const validateContext = (rule, value, callback) => {
      if (value === '') {
          callback(new Error('属性授权规则表达式不能为空'));
      }
      else {
        //匹配这些中文标点符号 。 ？ ！ ， 、 ； ： “ ” ‘ ' （ ） 《 》 〈 〉 【 】 『 』 「 」 ﹃ ﹄ 〔 〕 … — ～ ﹏ ￥
          const symReg = /[\u3002|\uff1f|\uff01|\uff0c|\u3001|\uff1b|\uff1a|\u201c|\u201d|\u2018|\u2019|\uff08|\uff09|\u300a|\u300b|\u3008|\u3009|\u3010|\u3011|\u300e|\u300f|\u300c|\u300d|\ufe43|\ufe44|\u3014|\u3015|\u2026|\u2014|\uff5e|\ufe4f|\uffe5]/;
          if (symReg.test(value)) {
            callback(new Error('属性授权规则表达式包含非法字符'));
          }
          const objReg = /(objId).*(userId)|(userId).*(objId)/
          if (!objReg.test(value)) {
            callback(new Error('属性授权规则表达式缺少关键字objId或userId'));
          }
          callback();
      }
    };
    return {
      tableDataAll: [],
      loading: true,
      currentPage: 1,
      pageSize: 10,
      pageSizeOpts: [10, 25, 50, 100, 200, 500],
      keyword: "",
      columnsWidth: 319,
      currentData: {
        name: undefined,
        content: undefined,
        id: undefined,
        note: undefined,
      },
      addRowModal: false,
      addRowModalLoading: false,
      addRowData: {
        name: "",
        content: "",
        note: ""
      },
      editRowData: {
        name: "",
        content: "",
        note: ""
      },
      tableColumns: [
        {
          type: "index",
          title: "序号",
          width: 80,
          align: "center"
        }, {
          title: "名称",
          key: "name",
          sortable: true,
          tooltip: true
        }, {
          title: "内容",
          key: "content",
          sortable: true,
          tooltip: true
        }, {
          title: "备注",
          key: "note",
          sortable: true,
          tooltip: true
        }
      ],
      editRowModal: false,
      editRowModalLoading: false,
      rowValidate: {
        name: [
          { required: true, message: "属性授权规则名不能为空", trigger: "change" },
          { validator: validateEname, trigger: 'change' }
        ],
        content: [
          { required: true, message: "属性授权规则表达式不能为空", trigger: "change" },
          { validator: validateContext, trigger: 'change' }
        ],
        note: [
          {
            type: "string",
            max: 300,
            message: "备注不能超过300字符",
            trigger: "blur"
          }
        ]
      },
      deleteConfirm: false,
      cascade : false,
      deleteModalLoading: false
    };
  },
  watch: {
    editRowModal(val) {
      if(!val) {
        this.editRowData = {...this.currentData}
        this.$refs["editRowForm"].resetFields()
      }
    }
  },
  computed: {
    filteredTableData() {
      if (this.keyword === undefined || this.keyword === null || this.keyword.trim() === '') return this.tableDataAll;
      let keywordLower = this.keyword.toLowerCase().trimStart().trimEnd();
      let res = [];
      for (let id =0 ; this.tableDataAll && id < this.tableDataAll.length; id ++) {
        let data = this.tableDataAll[id];
        if (
          data['content']
            .toString()
            .toLowerCase()
            .match(keywordLower) !== null ||
          data['name']
            .toString()
            .toLowerCase()
            .match(keywordLower) !== null ||
          data['note']
            .toString()
            .toLowerCase()
            .match(keywordLower) !== null
        ) {
          res.push(data);
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
    this.resetColumnsWidth();
    this.getAllRows();
  },
  methods: {
    activate() {
      this.resetColumnsWidth();
    },
    globalRefresh() {
      this.currentPage = 1;
      this.getAllRows();
    },
    resetColumnsWidth() {

      let sideWidth = document.getElementById('mainMenuSide') ? document.getElementById('mainMenuSide').style.width : 0;
      let finalWidth = parseInt(sideWidth) + 210;
      this.columnsWidth = (document.body.clientWidth - finalWidth) / 3;
      console.log(this.columnsWidth)

      this.tableColumns = [
        {
          type: "index",
          title: "序号",
          width: 80,
          align: "center"
        }, {
          title: "名称",
          key: "name",
          minWidth: this.columnsWidth,
          sortable: true,
          tooltip: true
        }, {
          title: "内容",
          key: "content",
          minWidth: this.columnsWidth,
          sortable: true,
          tooltip: true
        }, {
          title: "备注",
          key: "note",
          minWidth: this.columnsWidth,
          sortable: true,
          render: (h, params) => {
            if (params.row.note == '' || params.row.note === undefined || params.row.note === null) {
              return  h('span', {
                    style: {
                      display: 'inline-block',
                      width: params.column._width*0.8+'px',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      verticalAlign: 'middle'
                    },
                  }, params.row.note)
            }
            let positon = params.index>4? 'top': 'bottom';

            return h('Tooltip', {
                props: {
                    'max-width': 250,
                    'placement': positon
                }
            },[
                h('span', {
                    style: {
                      display: 'inline-block',
                      width: params.column._width*0.8+'px',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      verticalAlign: 'middle'
                    },
                  }, params.row.note),
                h('span', { slot: 'content'},params.row.note)
            ]);
          }
        }
      ]

    },
    getAllRows() {
      this.currentData = {
        name: undefined,
        content: undefined,
        id: undefined,
        note: undefined,
      };
      this.loading = true;
      AttrAccessRule.getAllConditions().then(res => {
        this.loading = false;
        this.tableDataAll = res.data;
      });
    },
    changePage(pageId) {
      this.currentData = {
        name: undefined,
        content: undefined,
        id: undefined,
        note: undefined,
      };
      this.currentPage = pageId;
    },
    changePageSize(pageSize) {
      this.currentData = {
        id: undefined,
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
        id: "",
        name: "",
        content: "",
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
          AttrAccessRule.createConditions(mergedData)
            .then(res => {
              this.currentPage = 1;
              this.getAllRows();
              this.addRowModalLoading = false;
              this.addRowModal = false;
              this.$refs["addRowForm"].resetFields();
              this.$Message.success("新增属性授权规则成功");
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
      this.cascade = false;
      this.deleteConfirm = true;
    },
    deleteRowOnOk() {
      let condOid = this.currentData.id;
      this.deleteModalLoading = true;
      AttrAccessRule.deleteConditionCascade(condOid, this.cascade)
        .then(res => {
          this.getAllRows();
          if (
            this.tableDataAll.length - 1 ===
              this.pageSize * (this.currentPage - 1) &&
            this.tableDataAll.length !== 1
          )
            this.changePage(this.currentPage - 1);
          this.deleteModalLoading = false;
          this.deleteConfirm = false;
          this.$Message.success("删除属性授权规则成功");
        })
        .catch(error => {
          this.deleteModalLoading = false;
          this.deleteConfirm = false;
          this.$Message.error(error.response.data.message);
        });

    },
    editRow() {
      this.$refs["editRowForm"].validate(valid => {
        if (valid) {
          this.editRowModalLoading = true;
          let mergedData = {
            id: this.currentData.id,
            ...this.editRowData
          };
          AttrAccessRule.updateCondition(mergedData)
            .then(res => {
              this.currentPage = 1;
              this.getAllRows();
              this.editRowModalLoading = false;
              this.editRowModal = false;
              this.$Message.success("更新属性授权规则成功");
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
