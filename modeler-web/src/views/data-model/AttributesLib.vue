<template>
  <div>
    <div style="float: left; margin: 10px 10px 0;">
      <Button type="primary" style="margin: 5px" @click="showAddRowModal" id="createAttrButton">
        新增属性
      </Button>
      <Modal
        v-model="addRowModal"
        title="新增属性"
        :mask-closable="false"
        id="createAttrModal"
      >
        <Form ref="addRowForm" :model="addRowData" :rules="rowValidate" :label-width="80">
          <FormItem label="属性名" prop="attributeName">
            <Input v-model="addRowData.attributeName" placeholder="输入属性名" id="createAttrModalAttributeName"></Input>
          </FormItem>
          <FormItem label="显示名" prop="displayName">
            <Input v-model="addRowData.displayName" placeholder="输入属性显示名" id="createAttrModalDisplayName"></Input>
          </FormItem>
          <FormItem label="数据类型" prop="valueType">
            <Select v-model="addRowData.valueType" placeholder="选择数据类型" filterable @on-change="getValueLength" id="createAttrModalValueType">
              <Option v-for="(value, key) in allValueTypes" :value="key" :key="key" :label="key">
                <span>{{ key }}</span>
                <span style="float:right; color:#ccc">{{ value }}</span>
              </Option>
            </Select>
          </FormItem>
          <Row>
            <Col span="12">
              <FormItem label="长度" prop="valueLength">
                <InputNumber type="number" v-if="noTime" v-model="addRowData.valueLength" :disabled="(addRowData.valueType !== 'String' && addRowData.valueType !== 'Clob') || (addRowData.valueType == 'String' && limitLength === true)" :min="0" :max="65535" id="createAttrModalValueLength"></InputNumber>
                <Select v-else v-model="addRowData.valueLength" filterable>
                  <Option :value="0" >秒</Option>
                  <Option :value="3">毫秒</Option>
                  <Option :value="6">微秒</Option>
                </Select>
              </FormItem>
            </Col>
            <Col span="12" v-show="addRowData.valueType === 'String'" style="padding-top: 8px;">
              <span style="margin-right: 10px;font-size: 12px !important;">不限长度</span>
              <i-switch size="small" v-model="limitLength" @on-change="changeLimit"/>
            </Col>
          </Row>
          <FormItem label="是否为空" prop="nullable">
            <Checkbox v-model="addRowData.nullable" id="createAttrModalNullable"></Checkbox>
          </FormItem>
          <FormItem label="缺省值" prop="defaultValue">
            <Input v-model="addRowData.defaultValue" placeholder="输入缺省值" id="createAttrModalDefaultValue"></Input>
          </FormItem>
        </Form>
        <div slot="footer">
          <Button type="text" size="large" :loading="false" @click="addRowModal = false">取消</Button>
          <Button type="primary" size="large" :loading="addRowModalLoading" @click="addRow" id="confirmCreateAttrButton">确认</Button>
        </div>
      </Modal>
      <Button type="error" style="margin: 5px" :disabled="currentData.attributeName === undefined" @click="deleteRow" id="deleteAttrButton">
        删除属性
      </Button>
      <Button type="primary" style="margin: 5px" :disabled="currentData.attributeName === undefined" @click="showEditRowModal" id="editAttrButton">
        编辑属性
      </Button>
      <Modal
        v-model="editRowModal"
        title="编辑属性"
        :mask-closable="false"
        id="editAttrModal"
      >
        <Form ref="editRowForm" :model="editRowData" :rules="rowValidate" :label-width="80">
          <FormItem label="属性名" prop="attributeName">
            <Input v-model="editRowData.attributeName" disabled id="editAttrModalAttributeName"></Input>
          </FormItem>
          <FormItem label="显示名" prop="displayName">
            <Input v-model="editRowData.displayName" placeholder="输入属性显示名" id="editAttrModalDisplayName"></Input>
          </FormItem>
          <FormItem label="数据类型" prop="valueType">
            <Select v-model="editRowData.valueType" disabled id="editAttrModalValueType">
              <Option v-for="(value, key) in allValueTypes" :value="key" :key="key" :label="key">
                <span>{{ key }}</span>
                <span style="float:right; color:#ccc">{{ value }}</span>
              </Option>
            </Select>
          </FormItem>
          <FormItem label="长度" prop="valueLength">
            <InputNumber v-if="noTime" v-model="editRowData.valueLength" disabled id="editAttrModalValueLength"></InputNumber>
            <Select v-else v-model="editRowData.valueLength" disabled filterable style="width: 164px;">
              <Option :value="0" >秒</Option>
              <Option :value="3">毫秒</Option>
              <Option :value="6">微秒</Option>
            </Select>
          </FormItem>
          <FormItem label="是否为空" prop="nullable">
            <Checkbox v-model="editRowData.nullable" disabled id="editAttrModalNullable"></Checkbox>
          </FormItem>
          <FormItem label="缺省值" prop="defaultValue">
            <Input v-model="editRowData.defaultValue" placeholder="输入缺省值" id="editAttrModalDefaultValue"></Input>
          </FormItem>
        </Form>
        <div slot="footer">
          <Button type="text" size="large" :loading="false" @click="editRowModal = false">取消</Button>
          <Button type="primary" size="large" :loading="editRowModalLoading" @click="editRow" id="confirmEditAttrButton">确认</Button>
        </div>
      </Modal>
      <Button type="primary" style="margin: 5px" :disabled="currentData.attributeName === undefined" @click="viewBindClasses" id="viewBindClassesButton">
        查看绑定类
      </Button>
      <Modal
        v-model="viewRowModal"
        title="查看绑定类"
        :mask-closable="false"
        id="viewRowModal"
      >
        <div v-show="!editClassInfo">
          <Input
            v-model="bindClassKeyword"
            icon="md-search"
            placeholder="输入关键词查询"
            style="width: 100%; margin-bottom: 15px"
            @on-click="searchBindClasses"
            @keydown.native.enter="searchBindClasses"
          >
          </Input>
          <Table
            v-if="!noBindData"
            :loading="bindClassesLoading"
            height="445"
            stripe
            border
            show-header
            highlight-row
            size="small"
            :data="bindClassesData"
            :columns="bindClassesColumns"
            @on-row-click="selectBindClass"
          >
          </Table>
          <p v-else>暂无绑定类信息</p>
        </div>
        <Form
          v-show="editClassInfo"
          ref="editClassInfoForm"
          :model="newClassInfo"
          :rules="classInfoValidate"
          :label-width="120"
        >
          <FormItem label="类名" prop="className">
            <Input v-model="newClassInfo.className" disabled></Input>
          </FormItem>
          <FormItem label="显示名" prop="displayName">
            <Input v-model="newClassInfo.displayName" placeholder="输入类显示名"></Input>
          </FormItem>
          <FormItem label="是否为系统类" prop="isSystem">
            <Checkbox v-model="newClassInfo.isSystem"></Checkbox>
          </FormItem>
          <FormItem label="所属模块" prop="zoneName">
            <Input v-model="newClassInfo.zoneName" disabled></Input>
          </FormItem>
          <FormItem label="类型" prop="classType">
            <Input v-model="newClassInfo.classType" disabled></Input>
          </FormItem>
          <FormItem label="分类" prop="classCategory">
            <Input v-model="newClassInfo.classCategory" disabled></Input>
          </FormItem>
          <FormItem label="父类" prop="parentClass">
            <Input v-model="newClassInfo.parentClass" disabled></Input>
          </FormItem>
          <FormItem>
            <Button type="text" large @click="editClassInfo = false">取消</Button>
            <Button type="primary" large :loading="updateClassInfoLoading" @click="updateClassInfo">确认</Button>
          </FormItem>
        </Form>
        <div slot="footer">
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
import AttributesLib from "../../api/data-model/AttributesLib";
import {clone} from "@/util/assist";

const isEmpty = str => {
  return str === undefined || str === null || str.trim() === '';
};

export default {
  name: "attributes-lib",
  mixins: [tableMixin],
  data() {
    const validateLength = (rule, value, callback) => {

      if(value === undefined) {

        if(this.addRowData.valueType == 'String') {
          this.addRowData.valueLength = 50;
        }

      }

      if (value === null) {
          callback(new Error('长度不能为空'));
      } else {
          callback();
      }
    };
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
        id: undefined,
        attributeName: undefined,
        displayName: undefined,
        attributeCategory: undefined,
        valueType: undefined,
        valueLength: undefined,
        nullable: undefined,
        defaultValue: undefined
      },
      editRowData: {},
      addRowModal: false,
      addRowModalLoading: false,
      addRowData: {
        attributeName: "",
        displayName: "",
        valueType: "String",
        valueLength: 50,
        nullable: true,
        defaultValue: null
      },
      editRowModal: false,
      editRowModalLoading: false,
      viewRowModal: false,
      updateClassInfoLoading: false,
      rowValidate: {
        attributeName: [
          { required: true, message: "属性名不能为空", trigger: "blur" },
          {
            pattern: /^[a-zA-Z0-9]{1,32}$/,
            message: "属性名只能包含字母、数字，长度不超过32个字符",
            trigger: "blur"
          },
          { pattern: /^[a-zA-Z]/, message: "属性名首字母应为字母", trigger: "blur" }
        ],
        displayName: [
          { required: true, message: "属性显示名不能为空", trigger: "blur" },
          {
            // pattern: /^[a-zA-Z0-9_\u0391-\uFFE5]+$/,
            pattern: /^\S{1,32}$/,
            message: "属性显示名只能包含汉字、字母、数字，长度不超过32个字符",
            trigger: "blur"
          }
        ],
        valueType: [
          { required: true, message: "数据类型不能为空", trigger: "blur" }
        ],
        valueLength: [
          { validator: validateLength, trigger: 'blur' }
          // {
          //   required: true,
          //   type: "number",
          //   message: "长度不能为空",
          //   trigger: "blur"
          // }
        ]
      },
      tableColumns: [
        {
          type: "index",
          title: "序号",
          width: 80,
          align: "center"
        },
        {
          title: "属性名",
          key: "attributeName",
          sortable: "custom"
        },
        {
          title: "属性显示名",
          key: "displayName",
          sortable: "custom"
        },
        {
          title: "数据类型",
          key: "valueType",
          sortable: "custom"
        },
        {
          title: "长度",
          key: "valueLength",
          sortable: "custom"
        },
        {
          title: "是否为空",
          key: "nullable",
          sortable: "custom"
        },
        {
          title: "缺省值",
          key: "defaultValue",
          sortable: "custom"
        }
      ],
      allValueTypes: {},
      bindClassesLoading: false,
      bindClassesData: [],
      noBindData: false,
      bindClassesColumns: [
        {
          type: "index",
          title: "序号",
          width: 80,
          align: "center"
        },
        {
          title: "类名",
          key: "className",
          minWidth: 135,
          sortable: true,
          render: (h, params) => {
            return h('Tooltip', {
            props: { placement: 'bottom', maxWidth: 362, transfer: true }
            }, [
                params.row.className.length > 16 ? params.row.className.slice(0, 16) + "..." : params.row.className,
                h('span', { slot: 'content', style: { whiteSpace: 'normal', wordBreak: 'break-all' } },
                params.row.className)
            ])
          }
        },
        {
          title: "显示名",
          key: "displayName",
          minWidth: 135,
          sortable: true,
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
          title: "父类",
          key: "parentClass",
          minWidth: 135,
          sortable: true,
          tooltip: true
        }
      ],
      bindClassKeyword: "",
      editClassInfo: false,
      currentClassInfo: {
        id: undefined,
        className: undefined,
        displayName: undefined,
        classType: undefined,
        classCategory: undefined,
        parentClass: undefined,
        isSystem: undefined,
        packagePath: undefined,
        zoneName: undefined
      },
      newClassInfo: {},
      classInfoValidate: {
        displayName: [
          { required: true, message: "显示名不能为空", trigger: "blur" },
          {
            // pattern: /^[a-zA-Z0-9_\u0391-\uFFE5]+$/,
            // message: "显示名只能包含汉字、字母、数字或下划线",
            pattern: /^\S{1,32}$/,
            message: "显示名只能包含汉字、字母、数字，长度不超过32个字符",
            trigger: "blur"
          }
        ],
        packagePath: [
          { required: true, message: "包路径不能为空", trigger: "blur" }
        ]
      },
      sortParams: undefined
    };
  },
  watch: {
    viewRowModal(val) {
      !val ? this.bindClassKeyword = '': ''
    }
  },
  computed: {
    filteredTableData() {
      let keywordLower = this.keyword.toLowerCase().trimStart().trimEnd();
      let res = [];
      for (let id in this.tableDataAll) {
        let data = this.tableDataAll[id];
        for (let key in data) {

          if(key != 'attributeCategory' && key != 'id' && key != 'isIdentity' && key != 'isPrimaryKey') {
            if (
              data[key]&&
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
    this.initData();
  },
  methods: {
    initData() {
      this.getAllRows();
      AttributesLib.getAllValueTypes().then(res => {
        this.allValueTypes = res.data;
      });
    },
    activate() {
      this.resetColumnsWidth();
    },
    globalRefresh() {
      this.currentPage = 1;
      this.initData();
    },
    maxSlice(v) {
      if (v !== null && v !== '' && v != undefined) {
        if(v === false || v === true) v = v + '';
        return v.length > 32 ? v.slice(0, 32) + "..." : v
      }
    },
    resetColumnsWidth() {

      let sideWidth = document.getElementById('mainMenuSide') ? document.getElementById('mainMenuSide').style.width : 0;
      let finalWidth = parseInt(sideWidth) + 600;
      this.columnsWidth = (document.body.clientWidth - finalWidth) / 6;
      console.log(this.columnsWidth)

      this.tableColumns = [
        {
          type: "index",
          title: "序号",
          minWidth: 80,
          align: "center"
        },
        {
          title: "属性名",
          key: "attributeName",
          minWidth: this.columnsWidth,
          sortable: "custom"
        },
        {
          title: "属性显示名",
          key: "displayName",
          minWidth: this.columnsWidth,
          sortable: "custom"
        },
        {
          title: "数据类型",
          key: "valueType",
          minWidth: this.columnsWidth,
          sortable: "custom"
        },
        {
          title: "长度",
          key: "valueLength",
          minWidth: this.columnsWidth,
          sortable: "custom"
        },
        {
          title: "是否为空",
          key: "nullable",
          minWidth: this.columnsWidth,
          sortable: "custom"
        },
        {
          title: "缺省值",
          key: "defaultValue",
          minWidth: this.columnsWidth,
          sortable: "custom",
          render: (h, params) => {
            return h('Tooltip', {
              props: { placement: 'bottom', maxWidth: 1100, transfer: true }
            }, [
                this.maxSlice(params.row['defaultValue']),
                h('span', { slot: 'content', style: { whiteSpace: 'normal', wordBreak: 'break-all' } },
                  params.row['defaultValue'])
              ])
          }
        }
      ]

    },
    changeLimit(value) {

      if(value) {
        this.addRowData.valueLength = 0;
      } else {
        this.addRowData.valueLength = 50;
      }
      this.$refs.addRowForm.validateField('valueLength');

    },
    getValueLength() {
      if (this.addRowData.valueType === "Boolean" || this.addRowData.valueType === "Json") {
        this.noTime = true;
        this.addRowData.valueLength = 0;
      } else if (this.addRowData.valueType === "Clob" || this.addRowData.valueType === "LocalFile" || this.addRowData.valueType === "Timeseries") {
        this.noTime = true;
        this.addRowData.valueLength = 1024;
      } else if (this.addRowData.valueType === "Date" || this.addRowData.valueType === "TimeStamp" || this.addRowData.valueType === "Time") {
        this.noTime = false;
        this.addRowData.valueLength = 6;
      } else if (this.addRowData.valueType === "Double") {
        this.noTime = true;
        this.addRowData.valueLength = 15;
      } else if (this.addRowData.valueType === "Integer") {
        this.noTime = true;
        this.addRowData.valueLength = 9;
      } else if (this.addRowData.valueType === "Long") {
        this.noTime = true;
        this.addRowData.valueLength = 18;
      } else if (this.addRowData.valueType === "String") {
        this.noTime = true;
        this.addRowData.valueLength = 50;
      } else if (this.addRowData.valueType === "UUID") {
        this.noTime = true;
        this.addRowData.valueLength = 32;
      }
    },
    getAllRows() {
      this.currentData = {
        id: undefined,
        attributeName: undefined,
        displayName: undefined,
        attributeCategory: undefined,
        valueType: undefined,
        valueLength: undefined,
        nullable: undefined,
        defaultValue: undefined
      };
      this.loading = true;
      AttributesLib.getAllAttributes().then(res => {
        this.loading = false;
        this.tableDataAll = res.data;
        this.tableDataAllUnsorted = clone(this.tableDataAll);
        this.handleSortChange(this.sortParams);
      });
    },
    changePage(pageId) {
      this.currentData = {
        id: undefined,
        attributeName: undefined,
        displayName: undefined,
        attributeCategory: undefined,
        valueType: undefined,
        valueLength: undefined,
        nullable: undefined,
        defaultValue: undefined
      };
      this.currentPage = pageId;
    },
    changePageSize(pageSize) {
      this.currentData = {
        id: undefined,
        attributeName: undefined,
        displayName: undefined,
        attributeCategory: undefined,
        valueType: undefined,
        valueLength: undefined,
        nullable: undefined,
        defaultValue: undefined
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
    viewBindClasses() {
      this.viewRowModal = true;
      this.editClassInfo = false;
      this.getBindClasses();
    },
    addRow() {
      this.$refs["addRowForm"].validate(valid => {
        if (valid) {

          // 默认值 用户写入再清空 需重新复制null
          if (this.addRowData.defaultValue == "") {
            this.addRowData.defaultValue = null;
          }

          if(this.addRowData.valueType == 'Boolean' && (this.addRowData.defaultValue != '' && this.addRowData.defaultValue != undefined)) {

            let judeDef = parseInt(this.addRowData.defaultValue);
            if(judeDef != 0 && judeDef != 1) {
              this.$Message.warning('默认值不合法, 只能为0或1')
            } else {

              this.addRowModalLoading = true;

              let mergedData = [
                {
                  attributeCategory: "Variable",
                  id: "",
                  ...this.addRowData
                }
              ];
              AttributesLib.createAttributes(mergedData).then(res => {
                this.getAllRows();
                this.addRowModalLoading = false;
                this.addRowModal = false;
                this.addRowData = {
                  attributeName: "",
                  displayName: "",
                  valueType: "String",
                  valueLength: 50,
                  nullable: true,
                  defaultValue: null
                };
                this.$Message.success("新增属性成功");
                this.changePage(1);
              })
              .catch(error => {
                this.addRowModalLoading = false;
              });

            }

          } else {

            if((this.addRowData.valueType == 'Double' || this.addRowData.valueType == 'Integer' || this.addRowData.valueType == 'Long') && this.addRowData.defaultValue && this.addRowData.defaultValue.length > 18) {
              this.$Message.warning('数值型属性缺省值位数不能超过18位')
            } else {
              this.addRowModalLoading = true;
              let mergedData = [
                {
                  attributeCategory: "Variable",
                  id: "",
                  ...this.addRowData
                }
              ];
              AttributesLib.createAttributes(mergedData)
                .then(res => {
                  this.getAllRows();
                  this.addRowModalLoading = false;
                  this.addRowModal = false;
                  this.addRowData = {
                    attributeName: "",
                    displayName: "",
                    valueType: "String",
                    valueLength: 50,
                    nullable: true,
                    defaultValue: null
                  };
                  this.$Message.success("新增属性成功");
                  this.changePage(1);
                })
                .catch(error => {
                  console.log(error)
                  this.addRowModalLoading = false;
                });

            }

          }

        } else {
          this.addRowModalLoading = false;
          this.$Message.error("请检查输入是否正确");
        }
      });
    },
    deleteRow() {
      this.$Modal.confirm({
        title: "删除属性",
        content: "<p>是否确认删除当前选中属性？</p>",
        loading: true,
        onOk: () => {
          this.$Modal.loading = true;
          let attributeName = this.currentData.attributeName;
          AttributesLib.deleteAttribute(attributeName)
            .then(res => {
              this.getAllRows();
              if (
                this.filteredTableData.length - 1 ===
                  this.pageSize * (this.currentPage - 1) &&
                this.filteredTableData.length !== 1
              )
                this.changePage(this.currentPage - 1);
              this.$Modal.loading = false;
              this.$Modal.remove();
              this.$Message.success("删除属性成功");
            })
            .catch(error => {
              this.$Modal.loading = false;
              this.$Modal.remove();
              this.$Message.error(error.response.data.message);
            });
        }
      });
    },
    showAddRowModal() {
      this.$refs['addRowForm'].resetFields();
      this.addRowModal = true;
      this.limitLength = false;
      this.editRowData = {};
      this.noTime = true;
    },
    showEditRowModal() {
      this.$refs['editRowForm'].resetFields();
      this.editRowModal = true;
      if(['Date', 'TimeStamp', 'Time'].includes(this.currentData.valueType)) {
        this.noTime = false;
      } else {
        this.noTime = true;
      }
      this.editRowData = {...this.currentData};

    },
    editRow() {
      this.$refs["editRowForm"].validate(valid => {
        if (valid) {
          if(this.editRowData.valueType == 'Boolean' && (this.editRowData.defaultValue != '' && this.editRowData.defaultValue != undefined)) {
            let judeDef = parseInt(this.editRowData.defaultValue);
            if(judeDef != 0 && judeDef != 1) {
              this.$Message.warning('默认值不合法, 只能为0或1')
            } else {
              this.editRowModalLoading = true;
                AttributesLib.getAttribute(this.editRowData.attributeName)
                .then(res => {
                  let mergedData = { ...res.data };
                  mergedData.displayName = this.editRowData.displayName;
                  mergedData.defaultValue = this.editRowData.defaultValue;
                  if (this.editRowData.valueType !== "String" && isEmpty(this.editRowData.defaultValue)) {
                    mergedData.defaultValue = null;
                  }
                  AttributesLib.updateAttribute(mergedData)
                    .then(res => {
                      if(res.code !== 400){
                        this.getAllRows();
                        this.editRowModalLoading = false;
                        this.editRowModal = false;
                        this.$Message.success("更新属性成功");
                      }else{
                        this.$Message.error(res.message);
                      }
                    })
                    .catch(error => {
                      this.editRowModalLoading = false;
                    });
              })
              .catch(error => {
                this.editRowModalLoading = false;
              });
            }
          } else {
            if((this.editRowData.valueType == 'Double' || this.editRowData.valueType == 'Integer' || this.editRowData.valueType == 'Long') && this.editRowData.defaultValue && this.editRowData.defaultValue.length > 18) {
              this.$Message.warning('数值型属性缺省值位数不能超过18位')
            } else {
              this.editRowModalLoading = true;
              AttributesLib.getAttribute(this.editRowData.attributeName)
              .then(res => {
                let mergedData = { ...res.data };
                mergedData.displayName = this.editRowData.displayName;
                mergedData.defaultValue = this.editRowData.defaultValue;
                if (this.editRowData.valueType !== "String" && isEmpty(this.editRowData.defaultValue)) {
                  mergedData.defaultValue = null;
                }
                AttributesLib.updateAttribute(mergedData)
                  .then(res => {
                    if(res.code !== 400){
                      this.getAllRows();
                      this.editRowModalLoading = false;
                      this.editRowModal = false;
                      this.$Message.success("更新属性成功");
                    }else{
                      this.$Message.error(res.message);
                    }
                  })
                  .catch(error => {
                    this.editRowModalLoading = false;
                  });
              })
              .catch(error => {
                this.editRowModalLoading = false;
              });

            }

          }
        } else {
          this.editRowModalLoading = false;
          this.$Message.error("请检查输入是否正确");
        }
      });
    },
    handleDoubleClick(rowData, index) {
      this.selectRow(rowData);
      this.showEditRowModal();
    },
    handleSortChange(params) {
      this.sortParams = params;
      if (params === undefined) return;
      if (params.order === "asc") {
        this.tableDataAll.sort(function(a, b) {
          if (a[params.key] === undefined) return -1;
          if (b[params.key] === undefined) return 1;
          return a[params.key].toString().toLowerCase() > b[params.key].toString().toLowerCase() ? 1 : -1;
        });
      } else if (params.order === "desc") {
        this.tableDataAll.sort(function(a, b) {
          if (a[params.key] === undefined) return 1;
          if (b[params.key] === undefined) return -1;
          return a[params.key].toString().toLowerCase() > b[params.key].toString().toLowerCase() ? -1 : 1;
        });
      } else {
        this.tableDataAll = clone(this.tableDataAllUnsorted);
      }
    },
    getBindClasses() {
      this.bindClassesData = [];
      this.bindClassesLoading = true;
      AttributesLib.getAttributeBindClasses(
        this.currentData.attributeName
      ).then(res => {
        this.bindClassesLoading = false;
        this.bindClassesData = res.data && res.data.length ? res.data : [];
        this.noBindData = this.bindClassesData.length === 0;
      }).catch(e => {
        this.bindClassesLoading = false;
      });
    },
    searchBindClasses() {
      this.currentClassInfo = {
        id: undefined,
        className: undefined,
        displayName: undefined,
        classType: undefined,
        classCategory: undefined,
        parentClass: undefined,
        isSystem: undefined,
        packagePath: undefined,
        zoneName: undefined
      };
      this.bindClassesLoading = true;
      let keywordLower = this.bindClassKeyword.toLowerCase().trimStart().trimEnd();
      AttributesLib.getAttributeBindClasses(this.currentData.attributeName)
        .then(res => {
          this.bindClassesData = res.data;
        })
        .then(res => {
          let tabelDataResult = [];
          for (let id in this.bindClassesData) {
            let data = this.bindClassesData[id];
            for (let key in data) {
              if (
                data[key]
                  .toString()
                  .toLowerCase()
                  .match(keywordLower) !== null
              ) {
                tabelDataResult.push(data);
                break;
              }
            }
          }
          this.bindClassesLoading = false;
          this.bindClassesData = tabelDataResult;
        });
    },
    selectBindClass(rowData, index) {
      this.currentClassInfo = this.bindClassesData[index];
      this.editClassInfo = true;
      this.$refs.editClassInfoForm.resetFields();
      this.newClassInfo = {
        ...this.currentClassInfo
      };
    },
    updateClassInfo() {
      this.$refs["editClassInfoForm"].validate(valid => {
        if (valid) {
          this.updateClassInfoLoading = true;
          AttributesLib.updateClassInfo(this.newClassInfo)
            .then(res => {
              this.getBindClasses();
              this.updateClassInfoLoading = false;
              this.editClassInfo = false;
              this.$refs["editClassInfoForm"].resetFields();
              this.$Message.success("更新类信息成功");
            })
            .catch(error => {
              this.updateClassInfoLoading = false;
              this.$Message.error(error.response.data.message);
            });
        } else {
          this.updateClassInfoLoading = false;
          this.$Message.error("请检查输入是否正确");
        }
      });
    }
  }
};
</script>
<style>
  /* .ivu-table {
    overflow-y: auto !important;
  } */
</style>
