<template>
  <div>
    <div style="float: left; margin: 10px">
      <Button type="primary" style="margin: 5px" @click="showAddRowModal">
        新增规则
      </Button>
      <Modal
        v-model="addRowModal"
        title="新增规则"
        :mask-closable="false"
      >
        <Form ref="addRowForm" :model="addRowData" :rules="rowValidate" :label-width="80">
          <FormItem label="条件名" prop="conditionId">
            <Select v-model="addRowData.conditionId" placeholder="选择条件" filterable clearable>
              <Option v-for="item in allConditions" :value="item.conditionId" :key="`${item.oid}_${item.conditionId}`">{{ item.conditionId }}</Option>
            </Select>
          </FormItem>
          <FormItem label="是否继承" prop="isInheritant">
            <Checkbox v-model="addRowData.isInheritant"></Checkbox>
          </FormItem>
          <FormItem label="类名" prop="className">
            <Select v-model="addRowData.className" placeholder="选择类" filterable clearable @on-change="getAllAttrNames">
              <Option v-for="(value, key) in allClasses" :value="key" :key="`class_${key}_${value}`" :label="key">
                <span>{{ key }}</span>
                <span style="float:right; color:#ccc">{{ value }}</span>
              </Option>
            </Select>
          </FormItem>
          <FormItem label="授权项/组名" prop="authority">
            <Select ref="addAuthority" v-model="addRowData.authority" placeholder="选择授权项/组" filterable clearable>
              <OptionGroup label="授权项">
                <Option v-for="item in allAuthItems" :value="item.authorityId" :key="`${item.id}_${item.authorityId}`">{{ `${item.authorityId}(${item.displayName})` }}</Option>
              </OptionGroup>
              <OptionGroup label="授权项组">
                <Option v-for="item in allAuthGroups" :value="item.groupId" :key="`${item.id}_${item.groupId}`">{{ `${item.groupId}(${item.displayName})` }}</Option>
              </OptionGroup>
            </Select>
          </FormItem>
          <FormItem label="参与者" prop="participant">
            <Select ref="addParticipant" v-model="addRowData.participant" placeholder="选择用户/用户组" filterable clearable>
              <OptionGroup label="用户组">
                <Option v-for="item in allGroups" :value="item.name" :key="`${item.oid}_${item.name}`">{{ item.name }}</Option>
              </OptionGroup>
              <OptionGroup label="用户">
                <Option v-for="item in allUsers" :value="item.name" :key="`${item.oid}_${item.name}`">{{ `${item.name}(${item.displayName})` }}</Option>
              </OptionGroup>
            </Select>
          </FormItem>
          <FormItem label="属性名" prop="attrName">
            <Select
              v-model="addRowData.attrName"
              :disabled="addRowData.className === ''"
              :loading="getAllAttrNamesLoading"
              placeholder="选择与类绑定的属性"
              filterable
              clearable
              :not-found-text="getAllAttrNamesLoading ? '' : '无匹配数据'"
            >
              <Option v-for="item in allAttrNames" :value="item.attributeName" :key="`${item.id}_${item.attributeName}`" :label="item.displayName">
                <span>{{ item.attributeName }}</span>
                <span style="float:right; color:#ccc">{{ item.displayName }}</span>
              </Option>
            </Select>
          </FormItem>
          <FormItem label="优先级" prop="level">
            <InputNumber :max="5" :min="0" v-model="addRowData.level"></InputNumber>
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
        删除规则
      </Button>
      <Button type="primary" style="margin: 5px" :disabled="currentData.oid === undefined" @click="showEditRowModal">
        编辑规则
      </Button>
      <Modal
        v-model="editRowModal"
        title="编辑规则"
        :mask-closable="false"
      >
        <Form ref="editRowForm" :model="editRowData" :rules="rowValidate" :label-width="80">
          <FormItem label="条件名" prop="conditionId">
            <Select v-model="editRowData.conditionId" placeholder="选择条件" filterable>
              <Option v-for="item in allConditions" :value="item.conditionId" :key="`${item.oid}_${item.conditionId}`">{{ item.conditionId }}</Option>
            </Select>
          </FormItem>
          <FormItem label="是否继承" prop="isInheritant">
            <Checkbox v-model="editRowData.isInheritant"></Checkbox>
          </FormItem>
          <FormItem label="类名" prop="className">
            <Select v-model="editRowData.className" placeholder="选择类" filterable clearable @on-change="getAllAttrNames">
              <Option v-for="(value, key) in allClasses" :value="key" :key="`class_${key}_${value}`" :label="key">
                <span>{{ key }}</span>
                <span style="float:right; color:#ccc">{{ value }}</span>
              </Option>
            </Select>
          </FormItem>
          <FormItem label="授权项/组名" prop="authority">
            <Select v-model="editRowData.authority" placeholder="选择授权项/组" filterable clearable>
              <OptionGroup label="授权项">
                <Option v-for="item in allAuthItems" :value="item.authorityId" :key="`${item.id}_${item.authorityId}`">{{ `${item.authorityId}(${item.displayName})` }}</Option>
              </OptionGroup>
              <OptionGroup label="授权项组">
                <Option v-for="item in allAuthGroups" :value="item.groupId" :key="`${item.id}_${item.groupId}`">{{ `${item.groupId}(${item.displayName})` }}</Option>
              </OptionGroup>
            </Select>
          </FormItem>
          <FormItem label="参与者" prop="participant">
            <Select v-model="editRowData.participant" placeholder="选择用户/用户组" filterable clearable>
              <OptionGroup label="用户组">
                <Option v-for="item in allGroups" :value="item.name" :key="`${item.oid}_${item.name}`">{{ item.name }}</Option>
              </OptionGroup>
              <OptionGroup label="用户">
                <Option v-for="item in allUsers" :value="item.name" :key="`${item.oid}_${item.name}`">{{ `${item.name}(${item.displayName})` }}</Option>
              </OptionGroup>
            </Select>
          </FormItem>
          <FormItem label="属性名" prop="attrName">
            <Select
              v-model="editRowData.attrName"
              :disabled="editRowData.className === ''"
              :loading="getAllAttrNamesLoading"
              placeholder="选择与类绑定的属性"
              filterable
              clearable
              :not-found-text="getAllAttrNamesLoading ? '' : '无匹配数据'"
            >
              <Option v-for="item in allAttrNames" :value="item.attributeName" :key="`${item.id}_${item.attributeName}`" :label="item.displayName">
                <span>{{ item.attributeName }}</span>
                <span style="float:right; color:#ccc">{{ item.displayName }}</span>
              </Option>
            </Select>
          </FormItem>
          <FormItem label="优先级" prop="level">
            <InputNumber :max="5" :min="0" v-model="editRowData.level"></InputNumber>
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
import AuthItems from "../../api/auth-model/AuthItems";
import AuthRules from "../../api/auth-model/AuthRules";
import AuthGroups from "../../api/auth-model/AuthGroups";
const _ = require("lodash");

export default {
  name: "auth-rules",
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
        isInheritant: undefined,
        className: undefined,
        authority: undefined,
        participant: undefined,
        attrName: undefined,
        level: undefined,
        note: undefined
      },
      addRowModal: false,
      addRowModalLoading: false,
      addRowData: {
        conditionId: "AlwaysTrue",
        isInheritant: true,
        className: "",
        authority: "",
        participant: "",
        attrName: "",
        level: 0,
        note: ""
      },
      editRowData: {},
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
        className: [
          { required: true, message: "类名不能为空", trigger: "blur" }
        ],
        authority: [
          { required: true, message: "授权项/组名不能为空", trigger: "blur" },
          {
            pattern: /^\w+$/,
            message: "授权项/组名只能包含字母、数字或下划线",
            trigger: "blur"
          }
        ],
        participant: [
          { required: true, message: "参与者不能为空", trigger: "blur" }
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
      allConditions: [],
      allClasses: [],
      allAuthItems: [],
      allUsers: [],
      allGroups: [],
      allAttrNames: [],
      allAuthGroups: [],
      getAllAttrNamesLoading: false
    };
  },
  computed: {
    tableColumns() {
      return [
        {
          type: "index",
          title: "序号",
          width: 80,
          align: "center"
        },
        {
          title: "条件名",
          key: "conditionId",
          sortable: true,
          tooltip: true
        },
        {
          title: "是否继承",
          key: "isInheritant",
          sortable: true,
          tooltip: true
        },
        {
          title: "类名",
          key: "className",
          sortable: true,
          tooltip: true
        },
        {
          title: "授权项/组名",
          key: "authority",
          sortable: true,
          tooltip: true
        },
        {
          title: "参与者",
          key: "participant",
          sortable: true,
          tooltip: true
        },
        {
          title: "属性名",
          key: "attrName",
          sortable: true,
          tooltip: true
        },
        {
          title: "优先级",
          key: "level",
          sortable: true,
          tooltip: true
        },
        {
          title: "备注",
          key: "note",
          sortable: true,
          tooltip: true
        }
      ];
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
    this.getAllConditions();
    this.getAllClasses();
    // this.getAllParticipants();
    this.getAllAuthItemsAndGroups();
  },
  methods: {
    getAllConditions() {
      AuthConditions.getAllConditions().then(res => {
        this.allConditions = _.sortBy(res.data, "conditionId");
      });
    },
    getAllClasses() {
      AuthRules.getAllClassNames().then(res => {
        this.allClasses = res.data;
      });
    },
    getAllParticipants() {
      AuthRules.getAllUsers().then(res => {
        this.allUsers = _.sortBy(res.data, "name");
      });
      AuthRules.getAllGroups().then(res => {
        this.allGroups = _.sortBy(res.data, "name");
      });
    },
    getAllAuthItemsAndGroups() {
      AuthItems.getAllItems().then(res => {
        this.allAuthItems = _.sortBy(res.data, "authorityId");
      });
      AuthGroups.getAllGroups().then(res => {
        this.allAuthGroups = _.sortBy(res.data, "groupId");
      });
    },
    getAllAttrNames(classname) {
      if (classname === undefined || classname === "" || classname === null) return;
      this.allAttrNames = [];
      if (classname) {
        this.getAllAttrNamesLoading = true;
        AuthRules.getAllClassAttributes(classname).then(res => {
          this.allAttrNames = _.sortBy(res.data, "attributeName");
          this.getAllAttrNamesLoading = false;
        });
      }
    },
    getAllRows() {
      AuthRules.getAllUsers().then(res => {
        this.allUsers = _.sortBy(res.data, "name");
        AuthRules.getAllGroups().then(res => {
          this.allGroups = _.sortBy(res.data, "name");
          this.currentData = {
            conditionId: undefined,
            isInheritant: undefined,
            className: undefined,
            authority: undefined,
            participant: undefined,
            attrName: undefined,
            level: undefined,
            note: undefined
          };
          this.loading = true;
          AuthRules.getAllRules().then(res => {
            this.loading = false;
            this.tableDataAll = res.data;
            this.beautifyTable();
          });
        });
      });
    },
    beautifyTable() {
      this.tableDataAll.forEach(row => {
        let user = this.allUsers.find(o => o.name === row.participant);
        let group = this.allGroups.find(o => o.name === row.participant);
        if (user !== undefined) row.participant += "(" + user.displayName + ")";
        else if (group !== undefined) row.participant += "(用户组)";
      });
    },
    changePage(pageId) {
      this.currentData = {
        conditionId: undefined,
        isInheritant: undefined,
        className: undefined,
        authority: undefined,
        participant: undefined,
        attrName: undefined,
        level: undefined,
        note: undefined
      };
      this.currentPage = pageId;
    },
    changePageSize(pageSize) {
      this.currentData = {
        conditionId: undefined,
        isInheritant: undefined,
        className: undefined,
        authority: undefined,
        participant: undefined,
        attrName: undefined,
        level: undefined,
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
      const temP = this.currentData.participant;
      this.currentData.participant = temP.split("(")[0];
      this.editRowData = {
        conditionId: this.currentData.conditionId,
        isInheritant: this.currentData.isInheritant,
        className: this.currentData.className,
        authority: this.currentData.authority,
        participant: rowData.participant.split('(')[0],
        attrName: this.currentData.attrName,
        level: this.currentData.level || 0,
        note: this.currentData.note
      };
      this.getAllAttrNames(this.currentData.className);
      // this.editRowData.participant = rowData.participant.split('(')[0];
    },
    showAddRowModal() {
      // this.$refs["addRowForm"].resetFields();
      this.addRowData = {
        conditionId: "AlwaysTrue",
          isInheritant: true,
          className: "",
          authority: "",
          participant: "",
          attrName: "",
          level: 0,
          note: ""
      };
      this.$refs["addAuthority"].clearSingleSelect();
      this.$refs["addParticipant"].clearSingleSelect();
      this.addRowModal = true;
    },
    showEditRowModal() {
      this.editRowData = {...this.currentData};
      this.editRowModal = true;
    },
    addRow() {
      this.$refs["addRowForm"].validate(valid => {
        if (valid) {
          this.addRowModalLoading = true;
          AuthRules.createRules([this.addRowData])
            .then(res => {
              this.getAllRows();
              this.addRowModalLoading = false;
              this.addRowModal = false;
              this.$refs["addRowForm"].resetFields();
              this.$Message.success("新增规则成功");
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
        title: "删除规则",
        content: "<p>是否确认删除当前选中规则？</p>",
        loading: true,
        onOk: () => {
          this.$Modal.loading = true;
          let ruleOid = this.currentData.oid;
          AuthRules.deleteRule(ruleOid)
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
              this.$Message.success("删除规则成功");
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
            oid: this.currentData.oid,
            ...this.editRowData
          };
          AuthRules.updateRule(mergedData)
            .then(res => {
              this.getAllRows();
              this.editRowModalLoading = false;
              this.editRowModal = false;
              this.$Message.success("更新规则成功");
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

      // console.log(this.editRowData.participant.split('(')[0]);
      this.editRowData.participant = rowData.participant.split('(')[0];
      this.editRowModal = true;
    }
  }
};
</script>
