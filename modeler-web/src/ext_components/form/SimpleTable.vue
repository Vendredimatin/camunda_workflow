/* eslint-disable */
<template>
  <section
    v-if="t_preview"
    :addinName="name"
    ref="main"
    :style="{'width': arg_width, 'display': 'flex', 'flex-direction': 'column', 'float': 'left'}"
  >
    <Table
      :border="args.showBorder"
      :no-data-text="noDataText"
      :stripe="args.showStripe"
      :size="args.tableSize"
      :height="arg_height"
      :columns="columnDefs"
      :data="rowData"
      :row-class-name="rowClassName"
      :style="{'display': 'content'}"
    >
    </Table>
    <div
      style="margin-top: 5px;"
      v-if="args.pageable"
    >
      <Row type="flex" justify="end" style="flex-wrap: nowrap;">
        <!--          <Button type="primary" style="margin-right: 15px;">刷新</Button>-->
        <!--          <span v-show="args.enableExport">-->
        <!--            <Button type="primary" style="margin-right: 15px;">导出csv</Button>-->
        <!--          </span>-->
        <span style="overflow: hidden; min-height:35px; flex-wrap:nowrap; align-self:flex-end">
            <Page
              v-show="args.pageable"
              show-sizer
              show-elevator
              placement="top"
              :page-size-opts="pageSizeOpts"
              :pageSize="args.pageSize"
              :total="entryCount"
              :current="currentPage"
            >
            </Page>
          </span>
      </Row>
    </div>
    <slot name="widget"></slot>
    <span v-show="t_edit" ref="edit">
      <EditBox v-if="actEdit" :addinName="name" :widgetAnnotation="widgetAnnotation" :editExtendInfo="editExtendInfo"
               ref="editbox"
               v-model="args"
               :itemValue="itemValue"
               :router="router"
               :route="route"
               :root="root"
               :store="store"
               :query_oprs="query_oprs"
               :targetclass="itemValue.data.targetClass"
               @handleBindTargetClassChange="handleBindTargetClassChange"
      >

        <div slot="attribute">
          <div class="margin1" style="text-align: center">
            <Button
              type="primary"
              style="text-align: center; width: 90%"
              @click="openChooseCols"
            >选择属性</Button>
          </div>
          <Row class="margin1">
<!--            <Col span="12" class="margin1">-->
<!--              <Checkbox v-model="args.enableExport">可导出</Checkbox>-->
<!--            </Col>-->
            <Col span="12" class="margin1">
              <Checkbox v-model="args.rowSelection" @on-change="initSelectionCol">多选</Checkbox>
            </Col>
            <Col span="12" class="margin1">
              <Checkbox v-model="args.oprCol" @on-change="initOprCol">操作列</Checkbox>
            </Col>
            <Col span="12" class="margin1">
              <Checkbox v-model="args.SNCol" @on-change="initSNCol">序号列</Checkbox>
            </Col>
            <Col span="12" class="margin1">
              <Checkbox v-model="args.pageable">开启分页</Checkbox>
            </Col>
            <Col span="12" class="margin1">
              <Checkbox v-model="args.showBorder">显示边框</Checkbox>
            </Col>
            <Col span="12" class="margin1">
              <Checkbox v-model="args.showStripe">显示斑马纹</Checkbox>
            </Col>
            <Col span="12" class="margin1">
              <Checkbox v-model="args.showHeader">显示表头</Checkbox>
            </Col>
          </Row>
          <Row class="margin1">
            <Col span="24" class="margin1">
              表格尺寸
              <Radio-group v-model="args.tableSize" type="button">
                  <Radio label="large">大</Radio>
                  <Radio label="default">中</Radio>
                  <Radio label="small">小</Radio>
              </Radio-group>
            </Col>
          </Row>
          <Row class="margin1" v-show="args.pageable">
            <Col span="24" class="margin1">
              <Input type="number" v-model="args.pageSize">
                <span slot="prepend">每页数量</span>
              </Input>
            </Col>
          </Row>
<!--          <Row class="margin1">-->
<!--            <Col span="24" class="margin1">-->
<!--              <Input-->
<!--                type="number"-->
<!--                v-model="args.rowHeight"-->
<!--                @on-change="adjustRowHeight"-->
<!--              >-->
<!--                <span slot="prepend">行高</span>-->
<!--              </Input>-->
<!--            </Col>-->
<!--          </Row>-->
        </div>
        <div slot="layout">
          <div>
            全表列宽
            <Input class="margin1" v-model="args.tableColumnWidth" type="number">
              <Select v-model="args.tableColumnWidthType" slot="append" style="width: 70px;">
                <Option value="px">px</Option>
                <Option value="%">%</Option>
              </Select>
            </Input>
          </div>
          全表列布局设置
          <div style="text-align: center">
            <Button
              :type="args.globalAlignCode == 0 ? 'primary' : 'default'"
              style="height: 20px; width: 20px;padding: 0;margin-top:0px;"
              @click="args.globalAlignCode = 0"
            ></Button>
            <Button
              :type="args.globalAlignCode == 3 ? 'primary' : 'default'"
              style="height: 20px; width: 20px;padding: 0;margin-top:0px;"
              @click="args.globalAlignCode = 3"
            ></Button>
            <Button
              :type="args.globalAlignCode == 6 ? 'primary' : 'default'"
              style="height: 20px; width: 20px;padding: 0;margin-top:0px;"
              @click="args.globalAlignCode = 6"
            ></Button>
          </div>
          <div style="text-align: center ">
            <Button
              :type="args.globalAlignCode == 1 ? 'primary' : 'default'"
              style="height: 20px; width: 20px;padding: 0;margin-top:0px;"
              @click="args.globalAlignCode = 1"
            ></Button>
            <Button
              :type="args.globalAlignCode == 4 ? 'primary' : 'default'"
              style="height: 20px; width: 20px;padding: 0;margin-top:0px;"
              @click="args.globalAlignCode = 4"
            ></Button>
            <Button
              :type="args.globalAlignCode == 7 ? 'primary' : 'default'"
              style="height: 20px; width: 20px;padding: 0;margin-top:0px;"
              @click="args.globalAlignCode = 7"
            ></Button>
          </div>
          <div style="text-align: center">
            <Button
              :type="args.globalAlignCode == 2 ? 'primary' : 'default'"
              style="height: 20px; width: 20px;padding: 0;margin-top:0px;"
              @click="args.globalAlignCode = 2"
            ></Button>
            <Button
              :type="args.globalAlignCode == 5 ? 'primary' : 'default'"
              style="height: 20px; width: 20px;padding: 0;margin-top:0px;"
              @click="args.globalAlignCode = 5"
            ></Button>
            <Button
              :type="args.globalAlignCode == 8 ? 'primary' : 'default'"
              style="height: 20px; width: 20px;padding: 0;margin-top:0px;"
              @click="args.globalAlignCode = 8"
            ></Button>
          </div>
        </div>
      </EditBox>

      <Modal v-model="chooseCols" title="表格选择属性" @on-ok="initColumnDefinition" @on-cancel="cancelColumnDefs">
        <h2>选择要显示的属性列</h2>
        <hr>
        <div v-if="args.targetClassType != 'relation'">
          <h3 style="display: inline-block;margin-right: 20px">目标类: {{ args.targetClass }}</h3>
          <Input
            search
            v-model="handleAttrSearchEntity"
            @on-change="$event => {handleAttrSearch($event, 'entity')}"
            placeholder="请输入属性名搜索..."
            style="width: 200px; margin: 5px"
          />
          <CheckboxGroup
            v-model="args.selected_attributes"
            @on-change="$event => {handleCheckBoxGroupChange($event, 'entity')}">
            <Collapse v-model="targetClassAttributesCollapse">
              <Panel name="sys">
                系统属性
                <Checkbox
                  slot="content"
                  v-for="item in filter_targetClassAttributes_sys"
                  :key="item.id"
                  :label="item.attributeName"
                  style="width: 30%; margin: 5px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; vertical-align:bottom;"
                >{{ item.displayName }}</Checkbox>
              </Panel>
              <Panel name="def">
                类属性
                <Checkbox
                  slot="content"
                  v-for="item in filter_targetClassAttributes_def"
                  :key="item.id"
                  :label="item.attributeName"
                  style="width: 30%; margin: 5px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; vertical-align:bottom;"
                >{{ item.displayName }}</Checkbox>
              </Panel>
            </Collapse>
          </CheckboxGroup>
          <hr>
          <div class="margin1">
             <Checkbox
               :indeterminate="select_all_attributes.entity.indeterminate"
               :value="select_all_attributes.entity.status"
               @click.prevent.native="($event) => {handleSelectAllAttributes($event, 'entity')}">全选</Checkbox>
          </div>
        </div>
        <div v-else>
          <h3 style="display: inline-block;margin-right: 20px">左角色: {{ leftRole }}</h3>
          <Input
            icon="md-search"
            v-model="handleAttrSearchLeft"
            @on-change="$event => {handleAttrSearch($event, 'left')}"
            placeholder="请输入属性名搜索..."
            style="width: 200px; margin: 5px"
          />
          <CheckboxGroup
            v-model="args.selected_attributes.left"
            @on-change="$event => {handleCheckBoxGroupChange($event, 'left')}">
            <Collapse v-model="targetClassAttributesLeftCollapse">
              <Panel name="sys">
                系统属性
                <Checkbox
                  slot="content"
                  v-for="item in filter_targetClassAttributes_leftSys"
                  :key="item.id"
                  :label="item.attributeName"
                  style="width: 30%; margin: 5px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;"
                >{{ item.displayName }}</Checkbox>
              </Panel>
              <Panel name="def">
                类属性
                <Checkbox
                  slot="content"
                  v-for="item in filter_targetClassAttributes_leftDef"
                  :key="item.id"
                  :label="item.attributeName"
                  style="width: 30%; margin: 5px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;"
                >{{ item.displayName }}</Checkbox>
              </Panel>
            </Collapse>
          </CheckboxGroup>
          <div class="margin1">
             <Checkbox
               :indeterminate="select_all_attributes.left.indeterminate"
               :value="select_all_attributes.left.status"
               @click.prevent.native="($event) => {handleSelectAllAttributes($event, 'left')}">全选</Checkbox>
          </div>
          <hr>
          <h3 style="display: inline-block;margin-right: 20px">关联类: {{ relationRole }}</h3>
          <Input
            icon="md-search"
            v-model="handleAttrSearchRelation"
            @on-change="$event => {handleAttrSearch($event, 'relation')}"
            placeholder="请输入属性名搜索..."
            style="width: 200px; margin: 5px"
          />
          <CheckboxGroup
            v-model="args.selected_attributes.relation"
            @on-change="$event => {handleCheckBoxGroupChange($event, 'relation')}">
            <Collapse v-model="targetClassAttributesRelationCollapse">
              <Panel name="sys">
                系统属性
                <Checkbox
                  slot="content"
                  v-for="item in filter_targetClassAttributes_relationSys"
                  :key="item.id"
                  :label="item.attributeName"
                  style="width: 30%; margin: 5px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;"
                >{{ item.displayName }}</Checkbox>
              </Panel>
              <Panel name="def">
                类属性
                <Checkbox
                  slot="content"
                  v-for="item in filter_targetClassAttributes_relationDef"
                  :key="item.id"
                  :label="item.attributeName"
                  style="width: 30%; margin: 5px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;"
                >{{ item.displayName }}</Checkbox>
              </Panel>
            </Collapse>
          </CheckboxGroup>
          <div class="margin1">
             <Checkbox
               :indeterminate="select_all_attributes.relation.indeterminate"
               :value="select_all_attributes.relation.status"
               @click.prevent.native="($event) => {handleSelectAllAttributes($event, 'relation')}">全选</Checkbox>
          </div>
          <hr>
          <h3 style="display: inline-block;margin-right: 20px">右关联角色: {{ rightRole }}</h3>
          <Input
            icon="md-search"
            v-model="handleAttrSearchRight"
            @on-change="$event => {handleAttrSearch($event, 'right')}"
            placeholder="请输入属性名搜索..."
            style="width: 200px; margin: 5px"
          />
          <CheckboxGroup
            v-model="args.selected_attributes.right"
            @on-change="$event => {handleCheckBoxGroupChange($event, 'right')}">
            <Collapse v-model="targetClassAttributesRightCollapse">
              <Panel name="sys">
                系统属性
                <Checkbox
                  slot="content"
                  v-for="item in filter_targetClassAttributes_rightSys"
                  :key="item.id"
                  :label="item.attributeName"
                  style="width: 30%; margin: 5px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;"
                >{{ item.displayName }}</Checkbox>
              </Panel>
              <Panel name="def">
                类属性
                <Checkbox
                  slot="content"
                  v-for="item in filter_targetClassAttributes_rightDef"
                  :key="item.id"
                  :label="item.attributeName"
                  style="width: 30%; margin: 5px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;"
                >{{ item.displayName }}</Checkbox>
              </Panel>
            </Collapse>
          </CheckboxGroup>
          <div class="margin1">
             <Checkbox
               :indeterminate="select_all_attributes.right.indeterminate"
               :value="select_all_attributes.right.status"
               @click.prevent.native="($event) => {handleSelectAllAttributes($event, 'right')}">全选</Checkbox>
          </div>
          <hr>
        </div>
      </Modal>

      <ColumnConfig
        ref="columnConfig"
        v-show="ColumnConfigShow"
        :store="store"
        :all_class="all_class"
        :all_relations="all_relations"
        :all_intEntities="all_intEntities"
        :all_extEntities="all_extEntities"
        :args="args"
        :itemValue="itemValue"
        @applyColumnConfig="applyColumnConfig"
      ></ColumnConfig>

      <OperationColumnConfig
        ref="operationColumnConfig"
        v-show="OperationColumnConfigShow"
        :store="store"
        :root="root"
        :targetClass="args.targetClass"
        :itemValue="itemValue"
        :route="route"
        :router="router"
        @applyOperationConfig="applyOperationConfig"
      ></OperationColumnConfig>
    </span>
  </section>

  <section v-else :addinName="name">
    <span style="text-align:center">
            <div class="form-addin-icon">
                <i class="iconfont">&#xe637;</i>
      </div>
      <div class="form-addin-name" style="width: 100%">表格</div>
    </span>
  </section>
</template>

<script>
import {mapGetters, mapActions} from "vuex";
import {
  getEobj,
  getEJobj,
  getAllRelations,
  getTargetModules,
  getAllInternalEntities,
  getAllExternalEntities
} from "@/api/others.js";
import {getAttributes} from "@/api/data-model/EntityModeling";
import {SYS_ENTITY_ATTRIBUTES, SYS_RELATION_ATTRIBUTES} from '@/libs/utils.js';
import "@/styles/component/iconfont.css";
import ColumnHeader from "@/ext_components/form/simpleTable/ColumnHeader";
import ColumnConfig from "@/ext_components/form/simpleTable/ColumnConfig";
import OperationColumnConfig from "@/ext_components/form/simpleTable/OperationColumnConfig";
import EditBox from "./_EditBox.vue";
import _ from 'lodash';
import {
  progressBarRender,
  checkboxRender,
  userGroupRender,
  timeTransferRender,
  operationRender,
  escapeRender,
  customTransferRender
} from "@/ext_components/form/simpleTable/CellRenders.js";

const name = "SimpleTable";

export default {
  name: name,
  props: ["argsProps", "widgetAnnotation", "editExtendInfo",
    "itemValue",
    "attributes",
    "store",
    "query_oprs",
    "route",
    "router",
    "root",
    "Message",
    "relation"
  ],
  data() {
    return {
      name: name,
      args_name: "",
      // 展示模式
      t_preview: true,
      t_show: true,
      t_icon: true,
      t_edit: false,
      actEdit: false,
      columnDefs: [],
      ColumnConfigShow: false,
      OperationColumnConfigShow: false,
      all_class: [],
      all_relations: [],
      all_intEntities: [],
      all_extEntities: [],
      rowData: [],

      dataTypes: ["String", "UUID", "Clob"],
      relation_prefix: {
        "left": "left_",
        "relation": "relation_",
        "right": "right_"
      },
      // 编辑框
      args: {
        dynamic: false,     // 动态响应
        title: "简单表格",
        id: "",

        columnDefs: [],
        enableSorting: true,
        enableFilter: true,
        rowSelection: false,
        pageable: true,
        enableCellChangeFlash: true,
        enableExport: true,

        width: 100,
        widthType: "%",
        heightType: "px",
        height: 500,

        select_type: "obj",
        selected_attributes: [],
        selected_attributes_sort: [],
        bindTargetClass: '',
        targetClass: "",

        filterQuery: "",

        pagination: true,
        pageSize: 25,

        //
        oprCol: false,
        SNCol: false,
        globalAlignCode: 1,
        refClass: '',
        classCategory: '',
        events: [],
        eventRange: ["初始化", "前处理", "翻页", "单击", "双击"],
        hided: false,
        showBorder: true,
        showStripe: false,
        showHeader: true,
        tableSize: 'default',
        tableColumnWidth: '200',
        tableColumnWidthType: 'px',
      },
      selected_attributes_catch: {},
      currentPage: 1,
      countPage: 0,
      pageSizeOpts: [25, 50, 100, 200],
      entryCount: 0, //记录当前查询条件条目总数

      edit: false,
      colDefIndex: {},
      chooseCols: false,

      //选择属性列参数
      selectClass: '',
      select_all_attributes: {
        entity: {
          indeterminate: false,
          status: false
        },
        left: {
          indeterminate: false,
          status: false
        },
        relation: {
          indeterminate: false,
          status: false
        },
        right: {
          indeterminate: false,
          status: false
        }
      },
      targetClassAttributes: [],
      targetClassAttributeNames: [],
      targetClassAttributeDisplayNames: [],

      relations: [],
      inherit: [],

      attrMap: {},
      classAttrMap: {},
      classMap: {},
      relationMap: {},
      classTypeMap: {},

      _relation: null,
      leftRole: null,
      relationRole: null,
      rightRole: null,

      targetClassAttributesLeftCollapse: 'def',
      targetClassAttributesRightCollapse: 'def',
      targetClassAttributesRelationCollapse: 'def',
      targetClassAttributesCollapse: 'def',
      handleAttrSearchEntity: '',
      handleAttrSearchLeft: '',
      handleAttrSearchRelation: '',
      handleAttrSearchRight: '',
      noDataText: '加载中',
    };
  },
  components: {
    ColumnHeader,
    ColumnConfig,
    OperationColumnConfig,
    EditBox
  },
  beforeDestroy() {

  },
  beforeMount() {
    this.initClassData();
  },
  inject: [
    'setBasicArgs'
  ],
  async created() {
    //通用方法给args赋值
    this.args = this.setBasicArgs(this.args);
    this.setArgs(this.args);
    if (this.t_preview) {
      this.$store = this.store;
      this.sys_relation_attributes = SYS_RELATION_ATTRIBUTES;
      this.sys_entity_attributes = SYS_ENTITY_ATTRIBUTES;
    }
  },

  mounted() {
    if(this.args.bindTargetClass == ''){
      if (this.itemValue.data.isRelation) {
        this.args.bindTargetClass = this.itemValue.data.targetClass + '&r';
      } else {
        this.args.bindTargetClass = this.itemValue.data.targetClass + '&e';
      }
    }
  },
  computed: {
    ...mapGetters("DWF_form", [
      "QueryResult",
      "EntitySingle",
      "EntityAttrList",
      "Entities",
      "RelationSingle",
      "Relations",
      "RelationSingleA",
      "RelationAttrList",
      "LeftRelations",
      "RightRelations",
      "QueryResultAll",
    ]),

    arg_width() {
      return this.args.width + this.args.widthType;
    },

    arg_height() {
      if(this.args.pageable){
        return this.args.height - 50
      }else{
        return this.args.height - 10
      }
    },

    arg_relation_class() {
      return this.args.relation_class;
    },

    arg_all_class() {
      return this.args.all_class;
    },

    arg_select_type() {
      return this.args.targetClassType;
    },

    arg_query() {
      return this.args.query;
    },

    arg_bindTargetClass() {
      return this.args.bindTargetClass ? this.args.bindTargetClass.split('\&')[0] : '';
    },

    arg_rowSelection() {
      return this.args.rowSelection ? "multiple" : "single";
    },

    filter_attributes() {
      return this.attributes
        ? this.attributes.filter(x => this.dataTypes.indexOf(x.valueType) > -1)
        : [];
    },

    filter_targetClassAttributes_sys() {
      return Array.isArray(this.targetClassAttributes) && this.targetClassAttributes && this.targetClassAttributes.filter(item => SYS_ENTITY_ATTRIBUTES(item) !== -1);
    },

    filter_targetClassAttributes_def() {
      return Array.isArray(this.targetClassAttributes) && this.targetClassAttributes && this.targetClassAttributes.filter(item => SYS_ENTITY_ATTRIBUTES(item) === -1);
    },

    filter_targetClassAttributes_relationSys() {
      return this.targetClassAttributes.relation && this.targetClassAttributes.relation.filter(item => SYS_RELATION_ATTRIBUTES(item) !== -1);
    },

    filter_targetClassAttributes_relationDef() {
      return this.targetClassAttributes.relation && this.targetClassAttributes.relation.filter(item => SYS_RELATION_ATTRIBUTES(item) === -1);
    },

    filter_targetClassAttributes_leftSys() {
      return this.targetClassAttributes.left && this.targetClassAttributes.left.filter(item => SYS_ENTITY_ATTRIBUTES(item) !== -1);
    },

    filter_targetClassAttributes_leftDef() {
      return this.targetClassAttributes.left && this.targetClassAttributes.left.filter(item => SYS_ENTITY_ATTRIBUTES(item) === -1);
    },

    filter_targetClassAttributes_rightSys() {
      return this.targetClassAttributes.right && this.targetClassAttributes.right.filter(item => SYS_ENTITY_ATTRIBUTES(item) !== -1);
    },

    filter_targetClassAttributes_rightDef() {
      return this.targetClassAttributes.right && this.targetClassAttributes.right.filter(item => SYS_ENTITY_ATTRIBUTES(item) === -1);
    },
  },

  watch: {
    'args.pageSize'(val) {
      if (val < 1) {
        this.$nextTick(() => {
          this.args.pageSize = 25;
        })
      }
    },

    'args.tableColumnWidth'(val){
      let gridWidth = this.$el.offsetWidth;
      let ignoreColId = ['_selColumn', '_SNColumn', '_oprColumn'];
      if(val <= 0){
        this.args.columnDefs.forEach((col, index) => {
          if(!ignoreColId.includes(col.colId)){
            if (this.args.tableColumnWidthType === '%') {
              col.width = Math.floor(gridWidth * 30 / 100);
              col.widthPercent = 30;
            } else {
              col.width = 30;
            }
            col.widthType = this.args.tableColumnWidthType;
            this.columnDefs[index].width = col.width;
            this.columnDefs[index].widthType = col.tableColumnWidthType;
          }
        });
        this.$nextTick(() => {
          this.args.tableColumnWidth = 30;
        })
      }else{
        this.args.columnDefs.forEach((col, index) => {
          if(!ignoreColId.includes(col.colId)){
            if (this.args.tableColumnWidthType === '%') {
              col.width = Math.floor(gridWidth * this.args.tableColumnWidth / 100);
              col.widthPercent = this.args.tableColumnWidth;
            } else {
              col.width = this.args.tableColumnWidth;
            }
            col.widthType = this.args.tableColumnWidthType;
            this.columnDefs[index].width = col.width;
            this.columnDefs[index].widthType = col.tableColumnWidthType;
          }
        });
      }
    },

    'args.tableColumnWidthType'(val){
      let gridWidth = this.$el.offsetWidth;
      let ignoreColId = ['_selColumn', '_SNColumn', '_oprColumn'];
      this.args.columnDefs.forEach((col, index) => {
        if(!ignoreColId.includes(col.colId)){
          if (this.args.tableColumnWidthType === '%') {
            col.width = Math.floor(gridWidth * this.args.tableColumnWidth / 100);
            col.widthPercent = this.args.tableColumnWidth;
          } else {
            col.width = this.args.tableColumnWidth;
          }
          col.widthType = this.args.tableColumnWidthType;
          this.columnDefs[index].width = col.width;
          this.columnDefs[index].widthType = col.tableColumnWidthType;
        }
      });
    },

    'args.globalAlignCode'(val) {
      let ignoreColId = ['_selColumn', '_SNColumn'];
      this.args.columnDefs.forEach((col, index) => {
        if(!ignoreColId.includes(col.colId)){
          col.alignCode = val;
          this.columnDefs[index].alignCode = val;
          col.className = `simple-table-column-align${val}`;
          this.columnDefs[index].className = `simple-table-column-align${val}`;
        }
      });
    },

    arg_query(newVal) {
      // FIXME: 注意此处针对order的写法做了修正
      newVal = newVal.replace("\"", "'");
      newVal = newVal.replace("“", "'");
      newVal = newVal.replace("”", "'");
      if (newVal.substring(0, 5) == "order") {
        newVal = "and 1=1 " + newVal;
      }
      this.args.query = newVal;
    },

    async arg_bindTargetClass(val) {
      if (!val) {
        this.targetClassAttributes = [];
        this.targetClassAttributeNames = [];
        this.targetClassAttributeDisplayNames = [];
      }
      //判断是否有类型
      let arg_targetClassType;
      if (!this.classTypeMap[val]) {
        arg_targetClassType = await getTargetModules(val);
        arg_targetClassType = arg_targetClassType.data.data.classCategory;
        this.classTypeMap[val] = arg_targetClassType;
      } else {
        arg_targetClassType = this.classTypeMap[val];
      }
      this.args.refClass = this.selectClass = val;
      this.args.classCategory = arg_targetClassType;
      if (arg_targetClassType === 'RelationClass') {
        this.args.targetClassType = "relation";
        await this.queryRelation(val);
        this._relation = this.Relations(val);
        if (!(this._relation.leftClass in this.classMap))
          this.classMap[this._relation.leftClass] = await this.getEntity(
            this._relation.leftClass
          );
        if (!(this._relation.rightClass in this.classMap))
          this.classMap[this._relation.rightClass] = await this.getEntity(
            this._relation.rightClass
          );
        this.leftRole = this._relation.leftRole;
        this.relationRole = this._relation.displayName;
        this.rightRole = this._relation.rightRole;
        if (!(val in this.classAttrMap)) {
          var attr = this.RelationAttrList(val) && this.RelationAttrList(val).length != 0 ? this.RelationAttrList(val) : this._relation.attributes;
          attr.forEach(x => (this.attrMap[x.attributeName] = x));
          this.classAttrMap[val] = attr;
        }
        if (!(this._relation.leftClass in this.classAttrMap))
          await this.addAttributes(this._relation.leftClass);
        if (!(this._relation.rightClass in this.classAttrMap))
          await this.addAttributes(this._relation.rightClass);

        this.targetClassAttributes = {
          left: this.classAttrMap[this._relation.leftClass],
          relation: this.classAttrMap[this._relation.className],
          right: this.classAttrMap[this._relation.rightClass]
        };
        this.targetClassAttributeNames = {
          left: this.targetClassAttributes.left.map(item => item.attributeName),
          relation: this.targetClassAttributes.relation.map(item => item.attributeName),
          right: this.targetClassAttributes.right.map(item => item.attributeName)
        };
        this.targetClassAttributeDisplayNames = {
          left: this.targetClassAttributes.left.map(item => item.displayName),
          relation: this.targetClassAttributes.relation.map(item => item.displayName),
          right: this.targetClassAttributes.right.map(item => item.displayName)
        };

        if (typeof this.selected_attributes_catch[val] !== "undefined") {
          this.args.selected_attributes = _.cloneDeep(this.selected_attributes_catch[val]);
        } else {
          this.args.selected_attributes = this.selected_attributes_catch[val] = {
            left: [],
            relation: [],
            right: []
          };
        }
        // if (!this.args.selected_attributes
        // || !this.args.selected_attributes.right
        // || !this.args.selected_attributes.relation
        // || !this.args.selected_attributes.left)
        //   this.args.selected_attributes = this.selected_attributes_catch[this.args.targetClass] = {
        //     left: [],
        //     relation: [],
        //     right: []
        //   };
      } else if (arg_targetClassType === 'ItemClass' || arg_targetClassType === 'ExternalItemClass') {
        this.args.targetClassType = "obj";
        if (typeof this.selected_attributes_catch[val] !== "undefined") {
          this.args.selected_attributes = _.cloneDeep(this.selected_attributes_catch[val]);
        } else {
          this.args.selected_attributes = this.selected_attributes_catch[val] = []
        }
        // if (
        //   !this.args.selected_attributes ||
        //   this.args.selected_attributes.length == 0
        // ) {
        //   this.args.selected_attributes = this.selected_attributes_catch[this.args.targetClass] = [];
        // }

        if (!(val in this.classMap))
          this.classMap[val] = await this.getEntity(val);
        if (!(val in this.classAttrMap)) await this.addAttributes(val);

        this.targetClassAttributes = this.classAttrMap[val];

        this.targetClassAttributeNames = this.targetClassAttributes.map(item => item.attributeName);

        this.targetClassAttributeDisplayNames = this.targetClassAttributes.map(item => item.displayName);
      } else {

      }
      this.args.targetClass = val.split('\&')[0];
      this.isRelation = this.args.targetClassType == "relation" ? true : false;
      this.initTableData();
    },

    'args.selected_attributes.left'(newVal, oldVal) {
      if (newVal && oldVal && newVal.length > oldVal.length) {
        let attr = `left_${_.difference(newVal, oldVal)[0]}`;
        this.args.selected_attributes_sort.push(attr)
      } else {
        let attr = `left_${_.difference(oldVal, newVal)[0]}`;
        let index = this.args.selected_attributes_sort.findIndex(item => item === attr);
        this.args.selected_attributes_sort.splice(index, 1);
      }
    },

    'args.selected_attributes.relation'(newVal, oldVal) {
      if (newVal && oldVal && newVal.length > oldVal.length) {
        let attr = `relation_${_.difference(newVal, oldVal)[0]}`;
        this.args.selected_attributes_sort.push(attr)
      } else {
        let attr = `relation_${_.difference(oldVal, newVal)[0]}`;
        let index = this.args.selected_attributes_sort.findIndex(item => item === attr);
        this.args.selected_attributes_sort.splice(index, 1);
      }
    },

    'args.selected_attributes.right'(newVal, oldVal) {
      if (newVal && oldVal && newVal.length > oldVal.length) {
        let attr = `right_${_.difference(newVal, oldVal)[0]}`;
        this.args.selected_attributes_sort.push(attr)
      } else {
        let attr = `right_${_.difference(oldVal, newVal)[0]}`;
        let index = this.args.selected_attributes_sort.findIndex(item => item === attr);
        this.args.selected_attributes_sort.splice(index, 1);
      }
    },

    /**
     *@description搜索时自动打开
     *@params
     *@date 2020/9/16
     *@return
     */
    filter_targetClassAttributes_sys(val) {
      if (this.handleAttrSearchEntity) {
        if (val.length !== 0 && this.filter_targetClassAttributes_def.length === 0) {
          this.targetClassAttributesCollapse = ['sys']
        } else if (val.length === 0 && this.filter_targetClassAttributes_def.length !== 0) {
          this.targetClassAttributesCollapse = ['def']
        } else if (val.length !== 0 && this.filter_targetClassAttributes_def.length !== 0) {
          this.targetClassAttributesCollapse = ['sys', 'def']
        }
      }
    },

    filter_targetClassAttributes_def(val) {
      if (this.handleAttrSearchEntity) {
        if (val.length !== 0 && this.filter_targetClassAttributes_sys.length === 0) {
          this.targetClassAttributesCollapse = ['def']
        } else if (val.length === 0 && this.filter_targetClassAttributes_sys.length !== 0) {
          this.targetClassAttributesCollapse = ['sys']
        } else if (val.length !== 0 && this.filter_targetClassAttributes_sys.length !== 0) {
          this.targetClassAttributesCollapse = ['sys', 'def']
        }
      }
    },

    filter_targetClassAttributes_relationSys(val) {
      if (this.handleAttrSearchRelation) {
        if (val.length !== 0 && this.filter_targetClassAttributes_relationDef.length === 0) {
          this.targetClassAttributesRelationCollapse = ['sys']
        } else if (val.length === 0 && this.filter_targetClassAttributes_relationDef.length !== 0) {
          this.targetClassAttributesRelationCollapse = ['def']
        } else if (val.length !== 0 && this.filter_targetClassAttributes_relationDef.length !== 0) {
          this.targetClassAttributesRelationCollapse = ['sys', 'def']
        }
      }
    },

    filter_targetClassAttributes_relationDef(val) {
      if (this.handleAttrSearchRelation) {
        if (val.length !== 0 && this.filter_targetClassAttributes_relationSys.length === 0) {
          this.targetClassAttributesRelationCollapse = ['def']
        } else if (val.length === 0 && this.filter_targetClassAttributes_relationSys.length !== 0) {
          this.targetClassAttributesRelationCollapse = ['sys']
        } else if (val.length !== 0 && this.filter_targetClassAttributes_relationSys.length !== 0) {
          this.targetClassAttributesRelationCollapse = ['sys', 'def']
        }
      }
    },

    filter_targetClassAttributes_leftSys(val) {
      if (this.handleAttrSearchLeft) {
        if (val.length !== 0 && this.filter_targetClassAttributes_leftDef.length === 0) {
          this.targetClassAttributesLeftCollapse = ['sys']
        } else if (val.length === 0 && this.filter_targetClassAttributes_leftDef.length !== 0) {
          this.targetClassAttributesLeftCollapse = ['def']
        } else if (val.length !== 0 && this.filter_targetClassAttributes_leftDef.length !== 0) {
          this.targetClassAttributesLeftCollapse = ['sys', 'def']
        }
      }
    },

    filter_targetClassAttributes_leftDef(val) {
      if (this.handleAttrSearchLeft) {
        if (val.length !== 0 && this.filter_targetClassAttributes_leftSys.length === 0) {
          this.targetClassAttributesLeftCollapse = ['def']
        } else if (val.length === 0 && this.filter_targetClassAttributes_leftSys.length !== 0) {
          this.targetClassAttributesLeftCollapse = ['sys']
        } else if (val.length !== 0 && this.filter_targetClassAttributes_leftSys.length !== 0) {
          this.targetClassAttributesLeftCollapse = ['sys', 'def']
        }
      }
    },

    filter_targetClassAttributes_rightSys(val) {
      if (this.handleAttrSearchRight) {
        if (val.length !== 0 && this.filter_targetClassAttributes_rightDef.length === 0) {
          this.targetClassAttributesRightCollapse = ['sys']
        } else if (val.length === 0 && this.filter_targetClassAttributes_rightDef.length !== 0) {
          this.targetClassAttributesRightCollapse = ['def']
        } else if (val.length !== 0 && this.filter_targetClassAttributes_rightDef.length !== 0) {
          this.targetClassAttributesRightCollapse = ['sys', 'def']
        }
      }
    },

    filter_targetClassAttributes_rightDef(val) {
      if (this.handleAttrSearchRight) {
        if (val.length !== 0 && this.filter_targetClassAttributes_rightSys.length === 0) {
          this.targetClassAttributesRightCollapse = ['def']
        } else if (val.length === 0 && this.filter_targetClassAttributes_rightSys.length !== 0) {
          this.targetClassAttributesRightCollapse = ['sys']
        } else if (val.length !== 0 && this.filter_targetClassAttributes_rightSys.length !== 0) {
          this.targetClassAttributesRightCollapse = ['sys', 'def']
        }
      }
    },
  },

  methods: {
    ...mapActions("DWF_form", [
      "handleQueryData",
      "queryRelation",
      "queryEntity",
      "editEObj",
      "deleteEObj",
      "saveEObj",
    ]),

    /**
     * @author LiuBo
     * @method
     * @name
     * @private
     * @description 初始化表格数据
     */
    async initTableData() {
      if (this.t_preview && this.args.columnDefs && !this.args.cacheGrid) {
        // this.updateColDefIndex();
        await this.freshData();
      }
    },
    /**
     * @author LiuBo
     * @method
     * @name
     * @private
     * @description 初始化类相关数据
     */
    async initClassData() {
      this.all_class = this.Entities().filter(x => typeof x.className == "string");
      let relations = await getAllRelations();
      this.all_relations = relations.data.data;
      let intEntities = await getAllInternalEntities();
      this.all_intEntities = intEntities.data.data;
      let extEntities = await getAllExternalEntities();
      this.all_extEntities = extEntities.data.data;
      // if (this.args.cacheGrid) return;
    },

    /**
     * @author LiuBo
     * @method
     * @name
     * @private
     * @description 更新数据
     * initial情况query = undefined fresh = undefined
     * step1确认为关联/实体类
     * step2
     * queryData = {
     *   query: {
     *     query: '',
     *     startIndex: '',
     *     pageSize: '',
     *     type: relation/obj
     *   },
     *   relationClass: '',
     *   targetClass: '',
     *   fresh: true/false
     * }
     * step3如果表格中有创建人，拥有着，最后更新人的oid显示进行替换，执行查询操作获得行数据rowData,对象数counts保存queryData
     * @param {String} query查询条件
     * @param {String} fresh刷新缓存
     */
    async freshData(query, fresh = true) {
      //step1
      if (this.isRelation) {
        if (!this._relation) {
          await this.queryRelation(this.args.targetClass);
          this._relation = this.Relations(this.args.targetClass);
        }
        if (!(this._relation.leftClass in this.classMap))
          this.classMap[this._relation.leftClass] = await this.getEntity(
            this._relation.leftClass
          );
        if (!(this._relation.rightClass in this.classMap))
          this.classMap[this._relation.rightClass] = await this.getEntity(
            this._relation.rightClass
          );

        if (!(this.args.targetClass in this.classAttrMap)) {
          let attr = this.RelationAttrList(this.args.targetClass);
          attr.forEach(x => (this.attrMap[x.attributeName] = x));
          this.classAttrMap[this.args.targetClass] = attr;
        }
        if (!(this._relation.leftClass in this.classAttrMap))
          await this.addAttributes(this._relation.leftClass);
        if (!(this._relation.rightClass in this.classAttrMap))
          await this.addAttributes(this._relation.rightClass);
      } else {
        if (!(this.args.targetClass in this.classMap))
          this.classMap[this.args.targetClass] = await this.getEntity(
            this.args.targetClass
          );
        if (!(this.args.targetClass in this.classAttrMap))
          await this.addAttributes(this.args.targetClass);
      }
      //step2
      this.queryData = {
        query: {
          startIndex: 0,
          pageSize: 3
        },
        targetClass: this.args.targetClass,
        fresh: fresh,
      };
      if (query && typeof query != "string") {
        this.queryData.query.query = await this.handleQueryObj(query, this);
      } else {
        this.queryData.query.query = '';
      }
      if (this.isRelation) {
        this.queryData.query.type = "relation";
        this.queryData.targetClass = this.targetClass;
        this.queryData.leftClass = this._relation.leftClass;
        this.queryData.rightClass = this._relation.rightClass;
        this.queryData.relationClass = this._relation.className;
      } else {
        this.queryData.targetClass = this.args.targetClass;
        this.queryData.query.type = "obj";
      }
      await this.handleQueryData(this.queryData);
      this.rowData = this.QueryResultAll(this.queryData) || [];
      await this.columnDefsRefFix();
      this.initWidth();
      this.columnDefs = this.generateColumnRender(this.args.columnDefs);

      this.noDataText = this.rowData.length === 0 ? '暂无数据' : '加载中';
    },

    /**
     * @author LiuBo
     * @method
     * @name
     * @private
     * @description 重新计算百分比宽度
     */
    initWidth() {
      this.args.columnDefs.forEach(item => {
        let gridWidth = this.$refs.main.offsetWidth;
        if (item.widthType === '%') {
          item.width !== undefined ? item.width = Math.floor(gridWidth * item.widthPercent / 100) : '';
        }
      })
    },

    /**
     * @author LiuBo
     * @method
     * @name
     * @private
     * @description 处理引用列
     * 对列做了引用后 调用该方法替换colDef完成引用数据的显示
     * 本质将colDef中的field做替换 并在rowData中增加新的数据列
     * 需要在取消引用时做还原
     */
    async columnDefsRefFix() {
      let sigSuffix = "%ref%"; // 用于标记该field已经被替换 属性名中不可用%
      let refQueryParams = {
        refs: [],
        startIndex: 0,
        pageSize: 3
      };
      //  扫描columnDefs 所有需要引用的一起引用
      this.args.columnDefs.forEach(_colDef => {
        if (_colDef.refClass && _colDef.browseAttr && _colDef.returnAttr) {
          let oriKey;

          // 如果有oriField就读取 否则读取field 如果读取的值有_ref后缀 说明根本没有保存原本的field
          if (_colDef.oriKey) oriKey = _colDef.oriKey;
          else oriKey = _colDef.key;
          if (oriKey.indexOf("%ref%") != -1) {
            console.error('Have not record original key before.');
            return;
          }

          let queryParam = {
            sourceAttr: oriKey,
            targetAttr: _colDef.browseAttr,
            targetClass: _colDef.refClass,
            sourceAttrSplit: ','
          };

          refQueryParams["refs"].push(queryParam);
          if (!_colDef.oriKey) _colDef["oriKey"] = oriKey; // 只在第一次替换时保存 这样就可以永久保存最初的field字段
          if (Array.isArray(_colDef.returnAttr) && _colDef.returnAttr.length !== 0) {
            _colDef.returnAttr.forEach((returnAttr, i) => {
              if (i === 0) {
                _colDef.key = returnAttr
              } else {
                _colDef.key += `-${returnAttr}`; // 新的field为"回填属性名_ref_原属性名" 避免多个属性引用通个属性时的错误
              }
              if (i === _colDef.returnAttr.length - 1) {
                _colDef.key += `${sigSuffix}${oriKey}`
              }
            })
          } else {
            _colDef.key = _colDef.returnAttr + sigSuffix + oriKey; // 新的field为"回填属性名_ref_原属性名" 避免多个属性引用通个属性时的错误
          }

        } else {
          // 缺少任何一个引用字段 都应该还原field取值
          if (_colDef.oriKey) _colDef.key = _colDef.oriKey;
          else {
            // console.error('Have no reference before.')
            return;
          }
          ;
        }
      });
      let res;
      if (this.args.targetClassType == "relation") {
        res = await getEJobj(this.getTargetClass(), refQueryParams);
        if (res.data.code == 200) {
          res = res.data.data[3];
        } else {
          this.$Message.info(res.data.message);
        }
      } else {
        res = await getEobj(this.getTargetClass(), refQueryParams);
        if (res.data.code == 200) {
          res = res.data.data;
        } else {
          this.$Message.info(res.data.message);
        }
      }
      // 扫描columnDefs 每一个替换后的列 对每一行扫描
      if (res) {
        for (let _colDef of this.args.columnDefs) {
          //判断此列是属性引用列
          if (_colDef.refClass && _colDef.browseAttr && _colDef.returnAttr) {
            let refClassObjs = res[_colDef.refClass];
            for (let row of this.rowData) {
              //取出引用值，判断是否为单引用-单展示/单引用-多展示/多引用-单展示/多引用-多展示/
              let currentCellData;
              if (row[_colDef.oriKey] != '' && row[_colDef.oriKey] != undefined) {
                currentCellData = typeof (row[_colDef.oriKey]) == 'number' || typeof (row[_colDef.oriKey]) == 'boolean' ? row[_colDef.oriKey] : row[_colDef.oriKey].split(',');
              } else {
                currentCellData = [];
              }

              //第三次循环cell格内多个引用查询
              if (currentCellData.length > 1) {
                let refKey = '';
                let refValue = '';
                for (let [cellIndex, cell] of currentCellData.entries()) {
                  let refClassObj;
                  // if(_colDef.refClassType === 'obj'){
                  //   refClassObj = this.EntitySingle(_colDef.refClass, cell) ? this.EntitySingle(_colDef.refClass, cell) : (await getEobjSingle(_colDef.refClass, cell)).data.data;
                  // }else{
                  //   refClassObj = this.RelationSingle(_colDef.refClass, cell) ? this.RelationSingle(_colDef.refClass, cell) : (await getRobjSingle(_colDef.refClass, cell)).data.data;
                  // }
                  refClassObj = refClassObjs.find(obj => {
                    if (obj[_colDef.browseAttr] !== '' && obj[_colDef.browseAttr] !== undefined) {
                      cell = isNaN(parseInt(cell)) ? cell : parseInt(cell);
                      return obj[_colDef.browseAttr].toString().split(',').indexOf(cell) !== -1
                    } else {
                      return false;
                    }
                  });
                  if (Array.isArray(_colDef.returnAttr) && _colDef.returnAttr.length !== 0 && refClassObj) {
                    // 把查到的返回属性值放到rowData的return+_ref属性中 让columnDefs能够读取到
                    _colDef.returnAttr.forEach((returnAttr, i) => {
                      if (i === 0) {
                        refKey = returnAttr;
                      } else {
                        refKey += `-${returnAttr}`;
                      }
                      if (i === 0 && cellIndex === 0) {
                        refValue = refClassObj[returnAttr] === undefined ? '' : refClassObj[returnAttr];
                      } else if (i === 0 && cellIndex !== 0) {
                        refValue += refClassObj[returnAttr] === undefined ? '' : `,${refClassObj[returnAttr]}`;
                      } else {
                        refValue += refClassObj[returnAttr] === undefined ? '' : ` - ${refClassObj[returnAttr]}`;
                      }
                    });
                  } else if (!Array.isArray(_colDef.returnAttr) && refClassObj) {
                    refKey = _colDef.returnAttr;
                    refValue = refClassObj[_colDef.returnAttr] === undefined ? '' : refClassObj[_colDef.returnAttr];
                  }
                }
                row[refKey + sigSuffix + _colDef.oriKey] = refValue;
              } else {
                // let refClassObjs = res[_colDef.refClass];
                if (row[_colDef.oriKey] != '' && row[_colDef.oriKey] != undefined) {
                  row[_colDef.oriKey] = isNaN(parseInt(row[_colDef.oriKey])) ? row[_colDef.oriKey] : parseInt(row[_colDef.oriKey]);
                  let index = refClassObjs.map(x => x[_colDef.browseAttr]).indexOf(row[_colDef.oriKey]);
                  if (index !== -1 && Array.isArray(_colDef.returnAttr) && _colDef.returnAttr.length !== 0) {
                    // 把查到的返回属性值放到rowData的return+_ref属性中 让columnDefs能够读取到
                    let refKey = '';
                    let refValue = '';
                    _colDef.returnAttr.forEach((returnAttr, i) => {
                      if (i === 0) {
                        refKey = returnAttr;
                        refValue = refClassObjs[index][returnAttr] === undefined ? '' : refClassObjs[index][returnAttr];
                      } else {
                        refKey += `-${returnAttr}`;
                        refValue += refClassObjs[index][returnAttr] === undefined ? '' : ` - ${refClassObjs[index][returnAttr]}`;
                      }
                      if (i === _colDef.returnAttr.length - 1) {
                        row[refKey + sigSuffix + _colDef.oriKey] = refValue;
                      }
                    });
                  } else if (index !== -1 && !Array.isArray(_colDef.returnAttr)) {
                    row[_colDef.returnAttr + sigSuffix + _colDef.oriKey] = refClassObjs[index][_colDef.returnAttr];
                  }
                } else {
                  //当前值为空的时候不需要匹配引用值
                  row[_colDef.returnAttr + sigSuffix + _colDef.oriKey] = '';
                }
              }
            }
            ;
          }
        }
        ;
      }
    },

    /**
     * @author LiuBo
     * @method
     * @name
     * @private
     * @description 初始化列定义
     */
    async initColumnDefinition() {
      //step1
      let _tmpOprCol = null;
      let _tmpSNCol = null;
      let _tmpSelCol = null;
      _tmpOprCol = this.args.columnDefs.find(col => {
        if (col && col.colId) return col.colId === '_oprColumn';
      })
      _tmpSNCol = this.args.columnDefs.find(col => {
        if (col && col.colId) return col.colId === '_SNColumn';
      })
      _tmpSelCol = this.args.columnDefs.find(col => {
        if (col && col.colId) return col.colId === '_selColumn';
      })
      let defs = [];
      this.columnDefs = [];
      if (this.isRelation) {
        // 关联类
        if (!this._relation) {
          await this.queryRelation(this.args.targetClass);
          this._relation = this.Relations(this.args.targetClass);
          this.leftRole = this._relation.leftRole;
          this.relationRole = this._relation.displayName;
          this.rightRole = this._relation.rightRole;
          if (!(this.args.targetClass in this.classAttrMap)) {
            var attr = this.RelationAttrList(this.args.targetClass) && this.RelationAttrList(this.args.targetClass).length != 0 ? this.RelationAttrList(this.args.targetClass) : this._relation.attributes;
            this.attrMap[x.attributeName] = {...attr};
            this.classAttrMap[this.args.targetClass] = attr;
          }
        }
        if (!(this._relation.leftClass in this.classAttrMap)) await this.addAttributes(this._relation.leftClass);
        if (!(this._relation.rightClass in this.classAttrMap)) await this.addAttributes(this._relation.rightClass);


        let directions = ["left", "relation", "right"];
        this.headerName_prefix = {
          "left": this.leftRole ? `${this.leftRole}的` : '',
          "relation": this.relationRole ? `${this.relationRole}的` : '',
          "right": this.rightRole ? `${this.rightRole}的` : ''
        };
        for (var direc of directions) {
          if (this.args.selected_attributes[direc]) {
            for (let attr_name of this.args.selected_attributes[direc]) {
              let attr = this.attrMap[attr_name];
              let currentColumnDef = this.args.columnDefs.find(item => item.key && item.key === `${this.relation_prefix[direc]}${attr_name}`);
              let currentRefColumnDef = this.args.columnDefs.find(item => item.oriKey && item.oriKey === `${this.relation_prefix[direc]}${attr_name}`);
              if (currentRefColumnDef && !!currentRefColumnDef.refClass) {
                defs.push(currentRefColumnDef);
              } else if (currentColumnDef) {
                defs.push(currentColumnDef);
              } else {
                defs.push(this.generateColumnDefinition(attr, direc));
              }
            }
          }
        }
      } else {
        // 实体类
        if (!(this.args.targetClass in this.classAttrMap)) {
          await this.addAttributes(this.args.targetClass);
        }
        let checkAttr = this.classAttrMap[this.args.targetClass];
        let checkAttrArray = checkAttr.map(item => item.attributeName);
        this.args.selected_attributes.forEach(x => {
          let attr = this.attrMap[x];
          if (checkAttrArray.indexOf(x) !== -1) {
            let currentColumnDef = this.args.columnDefs.find(item => item.key === x);
            let currentRefColumnDef = this.args.columnDefs.find(item => item.oriKey === x);
            if (currentRefColumnDef && !!currentRefColumnDef.refClass) {
              defs.push(currentRefColumnDef);
            } else if (currentColumnDef) {
              defs.push(currentColumnDef);
            } else {
              defs.push(this.generateColumnDefinition(attr));
            }
          }
        });
      }
      this.selected_attributes_catch[this.args.targetClass] = _.cloneDeep(this.args.selected_attributes);
      if (_tmpOprCol) defs.push(_tmpOprCol);
      if (_tmpSNCol) defs.unshift(_tmpSNCol);
      if (_tmpSelCol) defs.unshift(_tmpSelCol);
      defs = this.computeWidth(defs);
      this.args.columnDefs = defs;
      this.columnDefs = this.generateColumnRender(this.args.columnDefs);
      // this.rowData = [];
      // await this.freshData();
      // this.fitColAlign(1);
    },

    /**
     * @author LiuBo
     * @method
     * @name
     * @private
     * @description 取消属性确定列定义
     * 主要是恢复args.selected_attribute
     */
    cancelColumnDefs() {
      if (typeof this.selected_attributes_catch[this.args.targetClass] !== "undefined") {
        this.args.selected_attributes = this.selected_attributes_catch[this.args.targetClass];
      }
    },

    /**
     * @author LiuBo
     * @method
     * @name
     * @private
     * @description 打开属性选择框
     */
    openChooseCols() {
      this.chooseCols = true;
    },

    getSelectedClass() {
      return this.args.targetClass;
    },
    /**
     * 查询counts
     *
     */
    // async entryCounts(query) {
    //   if (!this.args.targetClass) return;
    //   if (this.pageChange){
    //     this.pageChange = false;
    //     return ;
    //   }
    //   let allObjCnt;
    //   if (this.args.targetClassType == "relation"){
    //     allObjCnt = await getRelationObjCount(this.args.targetClass, {
    //       condition: query
    //     })
    //   } else {
    //     allObjCnt = await getEntityObjCount(this.args.targetClass, {
    //       condition: query
    //     })
    //   }
    //   let lastCount = this.entryCount;
    //   let lastPage = Math.ceil(this.entryCount / this.args.pageSize);
    //   this.entryCount = allObjCnt.data.data;
    //   /**
    //    * 总数发生变化时定位当前页
    //    * case1 总数%分页数 == 0
    //    *
    //    * case2 总数%分页数 != 0
    //    *
    //    */
    //   switch (this.entryCount % this.args.pageSize) {
    //     case 0:
    //       switch (this.currentPage) {
    //         case 1:
    //           this.currentPage = 1;
    //           break;
    //         default:
    //           this.entryCount == this.args.pageSize
    //             ? this.currentPage = 1
    //             : lastCount > this.entryCount && this.currentPage !== lastPage
    //             ? ''
    //             : this.currentPage = parseInt(this.entryCount / this.args.pageSize);
    //           break;
    //       }
    //       break;
    //     default:

    //       break;
    //   }
    //   console.log()
    // },

    getQueryOprs() {
      // let that = this;
      // getEntryOperations('Root').then(globalOprRes => {
      //   getEntryOperations(that.targetclass).then(localOprRes => {
      //     try {
      //       that.query_oprs = globalOprRes.data.data.queryOprConfigs.concat(localOprRes.data.data.queryOprConfigs);
      //     } catch (e) {
      //       console.log(`loadQueryOprList失败${e}`)
      //       that.query_oprs = [];
      //     }
      //   })
      // });
      return [];
    },

    rowSelectionChange() {
      if (this.args.rowSelection) {
        this.args.columnDefs.forEach((item, index) => {
          if (index === 0) {
            item.checkboxSelection = true;
          } else {
            item.checkboxSelection = false;
          }
        })
      } else {
        this.args.columnDefs.forEach(item => {
          item.checkboxSelection = false;
        })
      }
      if (!this.args.columnDefs[0].cellStyle) {
        this.args.columnDefs[0].cellStyle = {};
      }
      this.args.notEditable ? Object.assign(this.args.columnDefs[0].cellStyle, {'pointer-events': 'none'}) : Object.assign(this.args.columnDefs[0].cellStyle, {'pointer-events': 'auto'});

      this.reloadGridFilter();
      if (this.gridApi) this.setColumnDefs(this.args.columnDefs);
      this.setRowData();
    },
    async getEntity(className) {
      if (className) {
        await this.queryEntity(className);
        return this.Entities(className);
      }
    },

    getSelected() {
      let result = [];
      let sig = "_ref";
      // console.log('original selectedRows', this.gridApi.getSelectedRows());
      this.gridApi.getSelectedRows().forEach(row => {
        let cleanRow = {};
        for (let attr in row) {
          if (attr.substring(attr.length - sig.length, attr.length) != sig) cleanRow[attr] = row[attr];
        }
        result.push(cleanRow);
      });
      // return this.gridApi.getSelectedRows();
      return result;
    },

    getAll() {
      return this.rowData;
    },

    changePage(val) {
      console.log("changePage", val);
      this.currentPage = val;
      this.freshData();
    },
    changePageSize(pageSize) {
      this.args.pageSize = pageSize;
      this.reloadGridFilter();
      this.freshData();
    },

    handleQueryObj(query, that) {
      // 对关联类的查询语句实际没有处理
      if (typeof query == "string") return query;
      let _ret;
      let _class;
      let _str = ["String", "UUID", "Clob", "Date"];
      let _int = ["Integer", "Long", "Double", "TimeStamp"];
      if (that.args.targetClassType == "relation") {
        _class = [
          that._relation.leftClass,
          that._relation.rightClass,
          that._relation.className
        ];
      } else {
        _class = [that.args.targetClass];
      }

      for (var i = 0; i < query.length; i++) {
        // 根据查询属性类型和查询方式对查询语句一次成型
        let m_class = query[i].className; // 查询语句主属性
        let attr = query[i].attrName.substring(0, query[i].attrName.indexOf("&"));
        let type = query[i].valueType;
        let value = query[i].value;
        let __ret; // 对每一个查询语句生成一个字符串

        if (_class.indexOf(m_class) == -1 || value == null || value == "" || !value) continue;

        if (type == "String") {
          // 查询条件为字符串时 拼接查询语句的方式较为固定
          __ret = ` and ${m_class}.plt_${attr} like '%${value}%'`;
        } else if (type == "Boolean") {
          // 查询条件为布尔型变量时 拼接查询语句方式固定
          let _value = typeof value == "string" ? value == "true" : value;
          __ret = ` and ${m_class}.plt_${attr} = ${_value}`;
        } else if (typeof value == "object") {
          // 查询值可能有2个或1个
          // 分别考虑属性为字符串或直接值的方式
          if (_str.indexOf(type) != -1) __ret = ` and ${m_class}.plt_${attr} between '${value[0]}' and '${value[1]}'`;
          if (_int.indexOf(type) != -1) __ret = ` and ${m_class}.plt_${attr} between ${value[0]} and ${value[1]}`;
        } else {
          if (_str.indexOf(type) != -1) __ret = ` and ${m_class}.plt_${attr} = '${value}'`;
          if (_int.indexOf(type) != -1) __ret = ` and ${m_class}.plt_${attr} = ${value}`;
        }
        if (__ret) _ret += __ret;
      }
      return _ret;
    },

    /**
     * @author LiuBo
     * @method
     * @name
     * @private
     * @description 缓存类-属性表
     * @param {String} className类名
     */
    async addAttributes(className) {
      if (className) {
        let res = await getAttributes(className);
        res.data.forEach(x => (this.attrMap[x.attributeName] = x));
        this.classAttrMap[className] = res.data;
      }
    },
    /* 全选
    * @params{
    *   val: left/relation/right
    * }
    * 1·实体类全选
    * @args.selected_attributes选择值 = @targetClassAttributes展示值
    * 2·关联类全选
    * @args.selected_attributes[左/关联/右]选择值 = @targetClassAttributes[左/关联/右]展示值
    * */
    handleSelectAllAttributes(event, val) {
      this.args.selected_attributes_sort = [];
      if (this.select_all_attributes[val].indeterminate) {
        this.select_all_attributes[val].status = false;
      } else {
        this.select_all_attributes[val].status = !this.select_all_attributes[val].status
      }

      this.select_all_attributes[val].indeterminate = false;

      if (this.args.targetClassType != 'obj') {
        this.args.selected_attributes[val] = this.select_all_attributes[val].status ? this.targetClassAttributes[val].map(item => item.attributeName) : [];
      } else {
        this.args.selected_attributes = this.select_all_attributes[val].status ? this.targetClassAttributes.map(item => item.attributeName) : [];
      }
    },
    /*点击checkBoxGroup
    * 取消全选状态
    * @params{
    *   event: true/false,
    *   val: left/relation/right
    * }
    *
    * */
    handleCheckBoxGroupChange(event, val) {
      val == 'entity'
        ? this.select_all_attributes[val].status = event.length == this.targetClassAttributeNames.length
        : this.select_all_attributes[val].status = event.length == this.targetClassAttributeNames[val].length;
      val == 'entity' && (event.length == 0 || event.length == this.targetClassAttributeNames.length)
        ? this.select_all_attributes[val].indeterminate = false
        : this.select_all_attributes[val].indeterminate = true;
      val != 'entity' && (event.length == 0 || event.length == this.targetClassAttributeNames[val].length)
        ? this.select_all_attributes[val].indeterminate = false
        : this.select_all_attributes[val].indeterminate = true;
    },
    /*搜索属性列
    * @targetClassAttributes重新赋值渲染列属性选项
    * 联动清空选择值
    *
    *
    * */
    handleAttrSearch(event, val) {
      let value = event.target.value;
      switch (val) {
        case 'entity':
          this.targetClassAttributes = this.getAttrMap()[0].attributes.filter((item) => {
            return item.displayName.indexOf(value) != -1;
          });
          // this.args.selected_attributes = [];
          break;
        case 'left':
          this.targetClassAttributes[val] = this.getAttrMap().filter(item => item.className === this._relation.leftClass)[0].attributes.filter((item) => {
            return item.displayName.indexOf(value) != -1;
          });
          // this.args.selected_attributes[val] = [];
          break;
        case 'relation':
          this.targetClassAttributes[val] = this.getAttrMap().filter(item => item.className === this._relation.className)[0].attributes.filter((item) => {
            return item.displayName.indexOf(value) != -1;
          });
          // this.args.selected_attributes[val] = [];
          break;
        case 'right':
          this.targetClassAttributes[val] = this.getAttrMap().filter(item => item.className === this._relation.rightClass)[0].attributes.filter((item) => {
            return item.displayName.indexOf(value) != -1;
          });
          // this.args.selected_attributes[val] = [];
          break;
        default:
          break;
      }
      // this.select_all_attributes[val].status = false;
      // this.select_all_attributes[val].indeterminate = false;
    },

    /*获取当前选择类属性
    * @classMap
    * @classAttrMap
    * */
    getAttrMap() {
      var res = [];
      if (this.args.targetClassType == "relation" && this._relation) {
        var left = this.classMap[this._relation.leftClass];
        var right = this.classMap[this._relation.rightClass];
        res.push({
          ...left,
          attributes: this.classAttrMap[this._relation.leftClass]
        });
        res.push({
          ...right,
          attributes: this.classAttrMap[this._relation.rightClass]
        });
        res.push({
          ...this._relation,
          attributes: this.classAttrMap[this._relation.className]
        });
      } else {
        var obj = this.classMap[this.args.targetClass];
        res.push({
          ...obj,
          attributes: this.classAttrMap[this.args.targetClass]
        });
      }
      return res;
    },

    // updateColDefIndex() {
    //   this.colDefIndex = {};
    //   for (var idx in this.args.columnDefs) {
    //     this.colDefIndex[this.args.columnDefs[idx].colId] = idx;
    //   }
    // },

    // onColResized(params) {
    //   console.log("col resized", params);
    //   if (params.source === 'uiColumnDragged' || params.source === 'sizeColumnsToFit' || params.source === 'autosizeColumns') {
    //     let _index;
    //     if (params.column) {
    //       _index = this.args.columnDefs
    //         .map(x => x && x.colId)
    //         .indexOf(params.column.colId);
    //
    //       this.args.columnDefs[_index]["width"] = params.column.actualWidth;
    //     }
    //   }
    // },

    // onColMoved(params) {
    //   console.log("col moved", params);
    //   let idx1 = this.colDefIndex[params.column.colId];
    //   let idx2 = params.toIndex;
    //   var tmp = this.args.columnDefs[idx1];
    //   this.args.columnDefs[idx1] = this.args.columnDefs[idx2];
    //   this.args.columnDefs[idx2] = tmp;
    //   this.colDefIndex[this.args.columnDefs[idx1].colId] = idx1;
    //   this.colDefIndex[this.args.columnDefs[idx2].colId] = idx2;
    //   this.rowSelectionChange();
    // },

    // 获取控件属性值
    getValue() {
      return null;
    },

    setValue(items) {
      return this;
    },

    // 是否允许往里添加元素,null为不允许，[]为允许全部，非空为允许部分
    getAllow(dropTarget) {
      return null;
    },

    // 获取可继承属性
    getInherit(dropTarget) {
      var res = {};
      let that = this;
      this.inherit.forEach(x => (res[x] = that.args[x]));
      return res;
    },

    // 获取编辑框内容
    getArgs() {
      return this.args;
    },

    // 设置基本属性
    setArgs(args) {
      for (var i in args) {
        this.args[i] = args[i];
      }
      this.selected_attributes_catch[this.args.targetClass] = _.cloneDeep(this.args.selected_attributes);
      if ("name" in args) this.args_name = this.args.name;
      return this;
    },

    // 获取表单项名
    getFormName() {
      return this.args.name;
    },

    getEditBoxComponent() {
      return this.$refs.editbox;
    },

    getEditBox(args) {
      if (!args) {
        this.t_edit = true;
        return this.$refs.edit;
      } else if (args == "col") {
        this.t_edit_col = true;
        return this.$refs.edit_col;
      } else if (args == "row") {
        this.t_edit_row = true;
        return this.$refs.edit_row;
      }
    },

    getName() {
      return name;
    },

    setDisplayType(type) {
      this.t_preview = type == 0;
      return this;
    },

    getDataType(args) {
      return this.args.dataTypes;
    },

    getTargetClass() {
      return this.args.targetClass;
    },

    getStore() {
      return this.$store;
    },

    clearBindTargetClass(val) {
      this.args.cacheGrid = true;
    },

    handleBindTargetClassChange(val) {
      if (!val) {
        this.args.cacheGrid = true;
        this.args.targetClass = '';
        this.args.bindTargetClass = '';
        this.args.columnDefs = this.args.columnDefs.filter(item => item.colId === '_oprColumn' || item.colId === '_SNColumn' || item.colId === '_selColumn');
        this.columnDefs = this.columnDefs.filter(item => item.colId === '_oprColumn' || item.colId === '_SNColumn' || item.colId === '_selColumn');
      } else this.args.cacheGrid = false;
    },

    /**
     *@description右键菜单
     */
    getContextMenuItems(params) {
      return [];
    },

    /**
     *@description设置列宽
     *@params
     *@date 2020/8/11
     *@return
     */
    setColumnWidths(width) {
      let columnWidths;
      if (width) {
        this.args.columnDefs.forEach(def => {
          def.width = width;
        })
        columnWidths = this.args.columnDefs.map(def => {
          return {
            key: def.colId,
            newWidth: width
          }
        })
      } else {
        // this.args.columnDefs.forEach(def => {
        //   def.width = 200;
        // })
        columnWidths = this.args.columnDefs.map(def => {
          return {
            key: def.colId,
            newWidth: def.width || 200
          }
        })
      }
      this.columnApi.setColumnWidths(columnWidths, true);
    },
    // /**
    //  * @author LiuBo
    //  * @method
    //  * @name
    //  * @private
    //  * @description 打开属性选择面板
    //  * @param {String}
    //  * @return {String}
    //  *
    //  * @example
    //  */
    // openChooseCols() {
    //   this.chooseCols = true;
    //   this.args.targetClass = this.args.bindTargetClass.split('\&')[0]
    // },

    /**
    * @author LiuBo
    * @method
    * @name
    * @private
    * @description 行样式回调
    */
    rowClassName(row, index){
      // return 'simple-table-row';
    },

    /**
    * @author LiuBo
    * @method
    * @name
    * @private
    * @description 点选多选列
    */
    initSelectionCol(val){
      let SelColIndex = this.args.columnDefs.findIndex(col => col.colId === '_selColumn');
      switch (val) {
        case true:
          if (SelColIndex < 0) {
            this.args.columnDefs.unshift(this.generateSelColumnDefinition());
          }
          break;
        case false:
          if (SelColIndex >= 0) {
            this.args.columnDefs.splice(SelColIndex, 1);
          }
          break;
      }
      this.columnDefs = this.generateColumnRender(this.args.columnDefs);
    },

    /**
     * @author LiuBo
     * @method
     * @name
     * @private
     * @description 点选操作列
     */
    initOprCol(val) {
      let OprColIndex = this.args.columnDefs.findIndex(col => col.colId === '_oprColumn');
      switch (val) {
        case true:
          if (OprColIndex < 0) {
            this.args.columnDefs.push(this.generateOprColumnDefinition());
          }
          break;
        case false:
          if (OprColIndex >= 0) {
            this.args.columnDefs.splice(OprColIndex, 1);
          }
          break;
      }

      this.args.columnDefs = this.computeWidth(this.args.columnDefs);
      this.columnDefs = this.generateColumnRender(this.args.columnDefs);
      // let _index = this.args.columnDefs.map(x => x.colId).indexOf("_oprColumn");
      // let that = this;
      // if (!this.args.oprCol) {
      //   if (_index < 0) return;
      //   this.args.columnDefs.splice(_index, 1);
      //   // delete this.args.columnDefs[_index];
      //   // this.args.columnDefs = this.args.columnDefs.filter(x=>{
      //   //   if(x) return x;
      //   // });
      // } else {
      //   if (_index >= 0) return;
      //   this.args.columnDefs.push({
      //     key: "_oprColumn",
      //     headerName: "操作列",
      //     editable: false,
      //     suppressMovable: false,
      //     suppressSizeToFit: true,
      //     //editable: attr.editable,
      //     colId: "_oprColumn",
      //     width: 200,
      //     widthType: 'px',
      //     widthPercent: 0,
      //     filterFramework: OprColCfg,
      //     filterParams: this.getFilterParams(),
      //     operationParams: [],
      //     menuTabs: ['filterMenuTab']
      //   });
      // }
      // this.reloadGridFilter();
      // if (this.gridApi) this.setColumnDefs(this.args.columnDefs);
      // this.updateColDefIndex();
    },

    /**
     * @author LiuBo
     * @method
     * @name
     * @private
     * @description 点选序号列
     */
    initSNCol(val) {
      let SNColIndex = this.args.columnDefs.findIndex(col => col.colId === '_SNColumn');
      switch (val) {
        case true:
          if (SNColIndex < 0) {
            this.args.columnDefs.unshift(this.generateSNColumnDefinition());
          }
          break;
        case false:
          if (SNColIndex >= 0) {
            this.args.columnDefs.splice(SNColIndex, 1);
          }
          break;
      }
      this.columnDefs = this.generateColumnRender(this.args.columnDefs);
    },

    /**
     * @author LiuBo
     * @method
     * @name
     * @private
     * @description 生成列定义
     * @param {Object} attribute 定义列的属性对象
     * @return {ColumnDefine}
     */
    generateColumnDefinition(attribute, direc) {
      let columnDefinition = {
        //table定义属性
        type: '',                     //列类型，可选值为 index、selection、expand、html
        title: direc ? this.headerName_prefix[direc] + attribute.displayName : attribute.displayName, //列头显示文字
        key: direc ? this.relation_prefix[direc] + attribute.attributeName : attribute.attributeName, //对应列内容字段名
        width: 200,
        widthType: 'px',
        widthPercent: 0,
        // minWidth: 0,
        // maxWidth: 0,
        alignCode: 1,
        align: 'center',
        className: 'simple-table-column-align1',
        ellipsis: false,              //开启后，文本将不换行，超出部分显示为省略号
        tooltip: false,               //开启后，文本将不换行，超出部分显示为省略号，并用 Tooltip 组件显示完整内容
        // render: null,                 //自定义渲染列
        // renderHeader: this.generateColumnRenderHeader(attribute), //自定义列头显示内容
        indexMethod: null,
        sortable: false,              //对应列是否可以排序
        sortMethod: null,             //自定义排序使用的方法
        sortType: '',                 //设置初始化排序。值为 asc 和 desc
        renderType: (attribute.valueType == "Date" || attribute.valueType == "TimeStamp") ? "timeTransferRender" : null,
        cellParams: {
          timeTransferFormat: "YYYYMMDDhhmmss",
          progressScale: null,
          refreshPeriod: 3000,
          refreshScale: ["ms", "s"],
          refreshPeriodByMs: 0,
          escapeObjectStr: "",
          customTransferFunc: '',
          userGroupMap: null,
          userGroupType: 'group',
          userGroup: '',
          userGroupAttrs: [
            {name: '中文', value: 'displayName'},
            {name: 'oid', value: 'oid'}
          ],
          userGroupAttr: 'name',
        },
        // filters: null,
        // filterMethod: null,
        // filterMultiple: null,
        // filteredValue: null,
        // filterRemote: null,
        // children: null,
        // resizable: null,
        // tree: null,
        // display: null,
        //程序添加属性
        filterQuery: '',
        attribute: attribute,
        attrCategory: attribute.attributeCategory,
        attrName: attribute.attributeName,
        attrValueType: attribute.valueType,
        colId: direc ? this.relation_prefix[direc] + attribute.displayName + "_id" : attribute.displayName + "_id",
      }
      return columnDefinition;
    },

    /**
     * @author LiuBo
     * @method
     * @name
     * @private
     * @description 生成序号列定义
     * @return {SNColumnDefinition}
     */
    generateSNColumnDefinition() {
      let SNColumnDefinition = {
        //table定义属性
        type: 'index',                     //列类型，可选值为 index、selection、expand、html
        title: '序号', //列头显示文字
        width: 80,
        widthType: 'px',
        widthPercent: 0,
        // minWidth: 0,
        // maxWidth: 0,
        alignCode: 1,
        align: 'center',
        fixed: 'left',
        className: '',
        ellipsis: false,              //开启后，文本将不换行，超出部分显示为省略号
        tooltip: false,               //开启后，文本将不换行，超出部分显示为省略号，并用 Tooltip 组件显示完整内容
        // render: null,                 //自定义渲染列
        // renderHeader: this.generateColumnRenderHeader(attribute), //自定义列头显示内容
        indexMethod: null,
        sortable: false,              //对应列是否可以排序
        sortMethod: null,             //自定义排序使用的方法
        sortType: '',                 //设置初始化排序。值为 asc 和 desc
        cellParams: {
          timeTransferFormat: "YYYYMMDDhhmmss",
          progressScale: null,
          refreshPeriod: 3000,
          refreshScale: ["ms", "s"],
          refreshPeriodByMs: 0,
          escapeObjectStr: "",
          customTransferFunc: '',
          userGroupMap: null,
          userGroupType: 'group',
          userGroup: '',
          userGroupAttrs: [
            {name: '中文', value: 'displayName'},
            {name: 'oid', value: 'oid'}
          ],
          userGroupAttr: 'name',
        },
        // filters: null,
        // filterMethod: null,
        // filterMultiple: null,
        // filteredValue: null,
        // filterRemote: null,
        // children: null,
        // resizable: null,
        // tree: null,
        // display: null,
        //程序添加属性
        key: '_SNColumn',
        colId: '_SNColumn',
      }
      return SNColumnDefinition;
    },

    /**
     * @author LiuBo
     * @method
     * @name
     * @private
     * @description 生成选择列定义
     * @return {SelColumnDefinition}
     */
    generateSelColumnDefinition() {
      let SelColumnDefinition = {
        //table定义属性
        type: 'selection',                     //列类型，可选值为 index、selection、expand、html
        title: '', //列头显示文字
        width: 80,
        widthType: 'px',
        widthPercent: 0,
        // minWidth: 0,
        // maxWidth: 0,
        alignCode: 1,
        align: 'center',
        fixed: 'left',
        className: '',
        ellipsis: false,              //开启后，文本将不换行，超出部分显示为省略号
        tooltip: false,               //开启后，文本将不换行，超出部分显示为省略号，并用 Tooltip 组件显示完整内容
        // render: null,                 //自定义渲染列
        // renderHeader: this.generateColumnRenderHeader(attribute), //自定义列头显示内容
        indexMethod: null,
        sortable: false,              //对应列是否可以排序
        sortMethod: null,             //自定义排序使用的方法
        sortType: '',                 //设置初始化排序。值为 asc 和 desc
        // filters: null,
        // filterMethod: null,
        // filterMultiple: null,
        // filteredValue: null,
        // filterRemote: null,
        // children: null,
        // resizable: null,
        // tree: null,
        // display: null,
        //程序添加属性
        key: '_selColumn',
        colId: '_selColumn',
        operationParams: [],
      }
      return SelColumnDefinition;
    },

    /**
     * @author LiuBo
     * @method
     * @name
     * @private
     * @description 生成操作列定义
     * @return {OprColumnDefinition}
     */
    generateOprColumnDefinition() {
      let OprColumnDefinition = {
        //table定义属性
        type: '',                     //列类型，可选值为 index、selection、expand、html
        title: '操作列', //列头显示文字
        width: 200,
        widthType: 'px',
        widthPercent: 0,
        // minWidth: 0,
        // maxWidth: 0,
        alignCode: 1,
        align: 'center',
        fixed: null,
        className: '',
        ellipsis: false,              //开启后，文本将不换行，超出部分显示为省略号
        tooltip: false,               //开启后，文本将不换行，超出部分显示为省略号，并用 Tooltip 组件显示完整内容
        // render: null,                 //自定义渲染列
        // renderHeader: this.generateColumnRenderHeader(attribute), //自定义列头显示内容
        indexMethod: null,
        sortable: false,              //对应列是否可以排序
        sortMethod: null,             //自定义排序使用的方法
        sortType: '',                 //设置初始化排序。值为 asc 和 desc
        // filters: null,
        // filterMethod: null,
        // filterMultiple: null,
        // filteredValue: null,
        // filterRemote: null,
        // children: null,
        // resizable: null,
        // tree: null,
        // display: null,
        //程序添加属性
        key: '_oprColumn',
        colId: '_oprColumn',
        operationParams: [],
      }
      return OprColumnDefinition;
    },

    /**
     * @author LiuBo
     * @method
     * @name generateColumnRenderHeader
     * @private
     * @description 装配列头自定义渲染
     * @param {Object} attribute 定义列的属性对象
     * @return {String}
     *
     * @example
     */
    generateColumnRenderHeader(definition) {
      return (h, params) => {
        return h('span', [
            h('span', definition.title),
            h(ColumnHeader, {
              props: {
                definition: definition,
                type: 'column'
              },
              on: {
                handleTableColumnHeaderConfig: this.handleTableColumnHeaderConfig
              }
            })
          ]
        )
      }
    },

    /**
     * @author LiuBo
     * @method
     * @name generateOprColumnRenderHeader
     * @private
     * @description 装配操作列头自定义渲染
     * @param {Object} definitions操作列定义
     * @return {Object}
     *
     * @example
     */
    generateOprColumnRenderHeader(definition) {
      return (h, params) => {
        return h('span', [
            h('span', definition.title),
            h(ColumnHeader, {
              props: {
                definition: definition,
                type: 'operationColumn'
              },
              on: {
                handleTableOprColumnHeaderConfig: this.handleTableOprColumnHeaderConfig
              }
            })
          ]
        )
      }
    },

    /**
     * @author LiuBo
     * @method
     * @name generateCellRender
     * @private
     * @description 装配列自定义渲染
     * @param {Object} config列配置
     */
    generateCellRender(config) {
      switch (config.renderType) {
        case "progressBarRender":
          return (h, params) => {
            return h(progressBarRender, {
              props: {
                config: config,
                params: params,
              }
            });
          }
          break;
        case "checkboxRender":
          return (h, params) => {
            return h(checkboxRender, {
              props: {
                config: config,
                params: params,
              }
            });
          };
          break;
        case "operationRender":
          return (h, params) => {
            return h(operationRender, {
              props: {
                config: config
              }
            });
          };
          break;
        case "timeTransferRender":
          return (h, params) => {
            return h(timeTransferRender, {
              props: {
                config: config,
                params: params,
              }
            });
          };
          break;
        case "escapeSubstitute":
          return (h, params) => {
            return h(escapeRender, {
              props: {
                config: config,
                params: params,
              }
            });
          };
          break;
        case "customTransferRender":
          return (h, params) => {
            return h(customTransferRender, {
              props: {
                config: config,
                params: params,
              }
            });
          };
          break;
        case "NONE":
          return null;
          break;
        default:
          return null;
          break;
      }
    },

    /**
     * @author LiuBo
     * @method
     * @name
     * @private
     * @description 装配列render
     * @param {Array} definitions多列定义
     * @param {Object} definitions列定义
     * @return {Object} 装配render与renderHeader的definition列定义
     */
    generateColumnRender(def) {
      let definitions = _.cloneDeep(def);
      if (Array.isArray(definitions)) {
        definitions.forEach((definition, index) => {
          switch (definition.key) {
            case '_selColumn':
              break;
            case '_oprColumn':
              definition.render = this.generateCellRender(def[index]);
              definition.renderHeader = this.generateOprColumnRenderHeader(def[index]);
              break;
            default:
              definition.render = this.generateCellRender(def[index]);
              definition.renderHeader = this.generateColumnRenderHeader(def[index]);
              break;
          }
        })
      } else {
        switch (definitions.key) {
          case '_selColumn':
            break;
          case '_oprColumn':
            definitions.render = this.generateCellRender(def);
            definitions.renderHeader = this.generateOprColumnRenderHeader(def);
            break;
          default:
            definitions.render = this.generateCellRender(def);
            definitions.renderHeader = this.generateColumnRenderHeader(def);
            break;
        }
      }
      return definitions;
    },

    handleTableColumnHeaderConfig(definitions) {
      this.$refs.columnConfig.initColumnDefinition(definitions, this);
      this.ColumnConfigShow = true;
    },

    handleTableOprColumnHeaderConfig(definitions) {
      this.$refs.operationColumnConfig.initColumnDefinition(definitions, this);
      this.OperationColumnConfigShow = true;
    },

    /**
     * @author LiuBo
     * @method
     * @name
     * @private
     * @description 应用操作列配置项
     * @param {Object} 操作列配置项
     */
    applyOperationConfig(operationConfig) {
      let oprColIndex = this.args.columnDefs.findIndex(col => {
        if (col && col.colId) return col.colId === '_oprColumn';
      })
      this.args.columnDefs.splice(oprColIndex, 1, operationConfig);
      this.columnDefs = this.generateColumnRender(this.args.columnDefs);
    },

    /**
     * @author LiuBo
     * @method
     * @name
     * @private
     * @description 应用列配置项
     * @param {Object} 列配置项
     */
    async applyColumnConfig(columnConfig) {
      let colIndex = this.args.columnDefs.findIndex(col => {
        if (col && col.colId) return col.colId === columnConfig.colId;
      })
      this.args.columnDefs.splice(colIndex, 1, columnConfig);
      await this.columnDefsRefFix();
      this.columnDefs = this.generateColumnRender(this.args.columnDefs);
    },

    /**
     * @author LiuBo
     * @method
     * @name
     * @private
     * @description 计算宽度，当每列列宽累计小于表格宽，最后一列自适应
     * @param {Object}
     * @return {Object}
     */
    computeWidth(definitions){
      definitions.forEach(def => {
        def.width = def.width === undefined ? 200 : def.width;
      })
      let gridWidth = this.$el.offsetWidth;
      this.width = Math.floor(gridWidth * this.widthPercent / 100);
      //获取所有百分比
      let totalWidthPercent = definitions.filter(def => def.widthType === '%').length !== 0 ? definitions.filter(def => def.widthType === '%').map(def => def.widthPercent).reduce((t, n) => t + n) : 0;

      //获取所有像素宽
      let totalWidth = definitions.filter(def => def.widthType === 'px').length !== 0 ? definitions.filter(def => def.widthType === 'px').map(def => def.width).reduce((t, n) => t + n) : 0;
      if(totalWidthPercent + (totalWidth * 100 / gridWidth) < 100){
        delete definitions[definitions.length - 1].width
      }
      return definitions;
    }
  }
};
</script>

<style>
.margin1 {
  margin-top: 5px;
  margin-bottom: 5px;
}

.margin2 {
  margin-left: 5px;
  margin-bottom: 5px;
}

.addin-layout section[addinname="SimpleTable"]{
  max-width: 100%;
}

.simple-table-column-align0{
  text-align: left!important;
  vertical-align: top!important;
}

.simple-table-column-align1{
  text-align: left!important;
  vertical-align: middle!important;
}

.simple-table-column-align2{
  text-align: left!important;
  vertical-align: bottom!important;
}

.simple-table-column-align3{
  text-align: center!important;
  vertical-align: top!important;
}

.simple-table-column-align4{
  text-align: center!important;
  vertical-align: middle!important;
}

.simple-table-column-align5{
  text-align: center!important;
  vertical-align: bottom!important;
}

.simple-table-column-align6{
  text-align: right!important;
  vertical-align: top!important;
}

.simple-table-column-align7{
  text-align: right!important;
  vertical-align: middle!important;
}

.simple-table-column-align8{
  text-align: right!important;
  vertical-align: bottom!important;
}
</style>

<style scoped>
section {
  width: auto;
  height: auto;
  display: inline-block;
}

h2 {
  font-size: 16px;
}
</style>
