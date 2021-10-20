/* eslint-disable */
<template>
  <section v-if="t_preview"
           :draggable="args.draggable"
           :addinName="name"
           ref="main"
           :style="{'width': arg_width, 'display': 'flex', 'flex-direction': 'column', 'height': arg_height,'float': 'left'}">

      <div class="vtable" :style="{'background-color': '#fff',width:'100%','height': arg_inside_height,}">
        <div class="head-tab" :style="{'min-height': args.headRowHeight + 'px',
          'height': args.headRowHeight + 'px',
          'background-color': args.header_color,}">
          <div class="head-cell cell"
           v-for="(item, index) in args.columnDefs" :key="index"
           @click="colSetAction(item, index)"
          :style="{'min-height': args.headRowHeight + 'px',
          'height': args.headRowHeight + 'px',
          'min-width': args_finalColWidth(item),
          'max-width': args_finalColWidth(item),
          'width': args_finalColWidth(item),
          'font-size': args_hfsize,
          'color':args.head_fontColor,
          'display': 'table-cell',
          'background-color': args.header_color,
          'vertical-align': YAlign,
          'text-align':XAlign}"
          >

            <van-icon name="edit"
            ></van-icon>
                {{ item.headerName }}
          </div>
        </div>
        <div v-for="(cell, cindex) in rowData" :key="cindex"
          :style="{'min-height': arg_line_height + 'px', 'height': arg_line_height + 'px',
          'background-color':args.stripe && cindex % 2 == 0?'#fff': args.contentbg_color,
          'border-bottom': '1px solid #e8eaec'}"
             >

            <div class="table-column" v-for="(item, index) in args.columnDefs" :key="index"
            :style="{'min-width': args_finalColWidth(item),
            'width': args_finalColWidth(item)}">
                <div v-if="item.colId=='_SNColumn'" class="cell"
                :style="{'min-height': arg_line_height + 'px', 'height': arg_line_height + 'px',
                'max-width': args_finalColWidth(item),
                'width': args_finalColWidth(item),
                'font-size': args_cfsize,
                'color':args.content_fontColor,
                'background-color':args.stripe && cindex % 2 == 0?'#fff': args.contentbg_color,
                'display': 'table-cell',
                'vertical-align': YAlign,
                'text-align':XAlign}"
                >{{cindex + 1}}</div>
                <div class="cell" v-else-if="cell[item.field]"
                :style="{'min-height': arg_line_height + 'px', 'height': arg_line_height + 'px',
                'max-width': args_finalColWidth(item),
                'width': args_finalColWidth(item),
                'font-size': args_cfsize,
                'color':args.content_fontColor,
                'background-color':args.stripe && cindex % 2 == 0?'#fff': args.contentbg_color,
                'display': 'table-cell',
                'vertical-align': YAlign,
                'text-align':XAlign}"
                >
                  {{ renderContent(cell[item.field], item)}}
                </div>
                <div class="cell" v-else
                :style="{'min-height': arg_line_height + 'px', 'height': arg_line_height + 'px',
                'max-width': args_finalColWidth(item),
                'width': args_finalColWidth(item),
                'font-size': args_cfsize,
                'color':args.content_fontColor,
                'background-color':args.stripe && cindex % 2 == 0?'#fff': args.contentbg_color,
                'display': 'table-cell',
                'vertical-align': YAlign,
                'text-align':XAlign}"
                >&nbsp;</div>


            </div>
        </div>
      </div>
    <div style="margin-top: 5px; " v-show="args.pageable">
      <van-pagination
          :items-per-page="arg_page_size"
          :total-items="entryCount"
          v-model="currentPage"
          mode="simple"
        ></van-pagination>
    </div>

    <slot name="widget"></slot>
<span v-show="t_edit" ref="edit">

      <EditBox v-if="actEdit" :addinName="name" :widgetAnnotation="widgetAnnotation" :editExtendInfo="editExtendInfo" ref="editbox"
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
          <Row class="margin1">
            <Col span="24" style="text-align: center">
              <Button
                type="primary"
                style="text-align: center; width: 90%"
                @click="openChooseCols"
              >选择属性</Button>
            </Col>
            <!-- <Col span="12" style="text-align: center">
                <Button
                  type="primary"
                  style="text-align: center; width: 90%"
                >更新预览</Button>
            </Col>-->
          </Row>
          <Row class="margin1">
            <!-- <Col span="12" class="margin1">
              <Checkbox v-model="args.enableSorting">全表排序</Checkbox>
            </Col> -->
            <!-- <Col span="12" class="margin1">
              <Checkbox v-model="args.enableFilter">可筛选</Checkbox>
            </Col> -->
            <!-- <Col span="12" class="margin1">
              <Checkbox v-model="args.oprCol" @on-change="initOprCol">操作列</Checkbox>
            </Col> -->
            <Col span="12" class="margin1">
              <Checkbox v-model="args.SNCol" @on-change="initSNCol">序号列</Checkbox>
            </Col>
            <Col span="12" class="margin1">
              <Checkbox v-model="args.compactMode">紧凑模式</Checkbox>
            </Col>
            <Col span="12" class="margin1">
              <Checkbox v-model="args.pageable">开启分页</Checkbox>
            </Col>
          </Row>
          <Row class="margin1" align="middle" type="flex" v-show="args.pageable">
              <Col span="5"><span >每页数量</span></Col>
              <Col span="1"></Col>
              <Col span="18">
                <InputNumber type="number" v-model="args.pageSize" :min="1" :max="10000000000" style="width: 100%;">
                </InputNumber>
              </Col>
          </Row>
          <Row class="margin1">
            <Col span="24" class="margin1">
              <Input
                type="number"
                v-model="args.headRowHeight"
              >
                <span slot="prepend">标题行高</span>
              </Input>
            </Col>
          </Row>
          <Row class="margin1">
            <Col span="24" class="margin1">
              <Input
                type="number"
                v-model="args.rowHeight"
                @on-change="adjustRowHeight(args.rowHeight)"
              >
                <span slot="prepend">内容行高</span>
              </Input>
            </Col>
          </Row>
        </div>
        <div slot="layout">
          <p class="margin1">列宽</p>
          <Input class="margin1" v-model="args.golbalColWidth" type="number"
          @on-blur="checkminval" @on-change="changeGolbalWidth">
            <Select v-model="args.golbalColWidthType" slot="append" style="width: 70px;" 
            @on-change="changeGolbalWidth">
              <Option value="%">%</Option>
              <Option value="px">px</Option>
            </Select>
          </Input>
        <div class="margin1" style="margin: 10px 0 10px 0">
          表头背景颜色
          <ColorPicker v-model="args.header_color" />
        </div>
        <div class="margin1" style="margin: 10px 0 10px 0">
          表头字体颜色
          <ColorPicker v-model="args.head_fontColor"/>
        </div>
        <p class="margin1">表头文本大小</p>
        <Input class="margin1" v-model="args.hfsize" type="number">
          <Select v-model="args.hfsizeType" slot="append" style="width: 70px;">
            <Option value="px">px</Option>
            <Option value="rem">rem</Option>
          </Select>
        </Input>
        <div class="margin1" style="margin: 10px 0 10px 0">
          斑马背景色
          <ColorPicker v-model="args.contentbg_color"/>
        </div>
        <div class="margin1" style="margin: 10px 0 10px 0">
          内容字体颜色
          <ColorPicker v-model="args.content_fontColor"/>
        </div>
        <p class="margin1">内容文本大小</p>
        <Input class="margin1" v-model="args.cfsize" type="number">
          <Select v-model="args.cfsizeType" slot="append" style="width: 70px;">
            <Option value="px">px</Option>
            <Option value="rem">rem</Option>
          </Select>
        </Input>
        <p class="margin1">全表列布局设置</p>
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
          <div class="margin1" style="margin: 10px 0 10px 0">
            斑马样式
            <i-switch style="float: right" v-model="args.stripe" @on-change="changeStripe"/>
          </div>
          <div slot="operation">
        </div>
        </div>
      </EditBox>

      <Modal v-model="chooseCols" title="表格选择属性" @on-ok="initColumnDefs" @on-cancel="cancelColumnDefs">
        <h2>选择要显示的属性列</h2>
        <hr>
        <div v-if="args.select_type != 'relation'">
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


    <Modal
      v-model="showColSetting"
      title="列定制面板"
      style="height: 500px;"
      @on-cancel="showColSetting=false"
      @on-ok="applyColSet"
    >
    <Input v-model="selectCol.headerName"/>
        <Tabs>
          <TabPane label="基本配置" name="config">
            <Collapse simple :value="collapsePage" accordion>
              <Panel name="1" style>样式设置
                <Row slot="content" class="margin-p" type="flex" align="middle">
                  <Col span="24">
                    <Input
                      type="number"
                      v-model="selectCol.width"
                      @on-blur="checkminvalWidth"
                    >
                      <span slot="prepend">列宽</span>
                      <Select v-model="selectCol.widthType" slot="append" style="width: 70px;">
                        <Option value="%">%</Option>
                        <Option value="px">px</Option>
                      </Select>
                    </Input>
                  </Col>
                </Row>
                <!-- <Row slot="content" class="margin-p" type="flex" align="middle">
                  <Col span="12">
                    <Checkbox :disabled="selectCol.refClass || selectCol.colId === '_SNColumn'"  v-model="selectCol.enableSorting">可排序</Checkbox>
                  </Col>
                </Row> -->

              </Panel>
            </Collapse>
          </TabPane>
          <TabPane label="显示模式" name="display" :disabled="selectCol.colId === '_SNColumn'" style="height: 300px;position: relative;">
            <Form class="margin1">
              <Select v-model="selectCol.renderType" >
                <Option
                        v-for="type in renderList"
                        :value="type.value"
                        :key="type.name"
                >{{type.name}}</Option>
              </Select>
            </Form>
            <Form v-show="selectCol.renderType=='timeTransferRender'" class="margin1">
              <Select v-model="selectCol.timeTransferFormat" placeholder="请选择日期格式">
                <Option value="YYYY-MM-DD" key="1" label="年月日">
                  <span>年月日</span>
                  <span style="float:right;color:#ccc">YYYY-MM-DD</span>
                </Option>
                <Option value="hh:mm:ss" key="2" label="时分秒">
                  <span>时分秒</span>
                  <span style="float:right;color:#ccc">hh:mm:ss</span>
                </Option>
                <Option value="YYYY-MM-DD hh:mm:ss" key="3" label="年月日时分秒">
                  <span>年月日时分秒</span>
                  <span style="float:right;color:#ccc">YYYY-MM-DD hh:mm:ss</span>
                </Option>
              </Select>
            </Form>
          </TabPane>
        </Tabs>
    </Modal>
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
import {mapGetters, mapActions, mapMutations} from "vuex";
import {getAddinFunc} from "@/util/addin.js";
import {
  getEobj,
  getEJobj,
  getGroups,
  getAllRelations,
  getAllUsers,
  getQuickOpeById,
  getTargetModules,
  getEobjSingle,
  getRobjSingle
} from "@/api/others.js";
import {getAttributes} from "@/api/data-model/EntityModeling";
import {SYS_ENTITY_ATTRIBUTES, SYS_RELATION_ATTRIBUTES} from '@/libs/utils.js';
// import BindOperationBar from "./subcomponent/BindOperationBar";
import "@/styles/component/iconfont.css";
import QueryOprDialog from "@/views/functional-model/components/query-operation-edit-dialog.vue";
import EditBox from "@/ext_components/form/_EditBox.vue"
import _ from 'lodash';

const name = "Table";

export default {
  name: name,
  props: ["argsProps", "widgetAnnotation", "editExtendInfo" ,
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
      edit_col: null,
      // 展示模式
      t_preview: true,
      t_show: true,
      t_icon: true,
      t_edit: false,
      actEdit: false,
      collapsePage: "1",
      showColSetting: false,
      oids: [],
      rowData: null,
      dataTypes: ["String", "UUID", "Clob"],
      defaultColDef: {
        resizable: true
      },
      // 编辑框
      args: {
        dynamic: false,     // 动态响应
        title: "表格",
        id: "",

        columnDefs: [],
        enableSorting: true,
        enableFilter: true,
        rowSelection: false,
        rowDragManaged: true,
        statusBar: false,
        rangeSection: false,
        statusBarConfig: {},
        compactMode: false,
        autoSize: false,
        pageable: true,
        enableCellChangeFlash: true,
        enableExport: true,

        width: 100,
        widthType: "%",
        heightType: "px",
        height: 500,
        rowHeight: 44,
        headRowHeight: 44,

        select_type: "obj",
        selected_attributes: [],
        selected_attributes_sort: [],
        bindTargetClass: '',
        targetClass: "",
        oprTargetClass: "", //  操作对应的类  现在被固定为表单类

        filterQuery: "",

        sgclk_text: "",

        sgclk_type: "",
        sgclk_path: "",
        sgclk_del_alert: true,

        event_oprs: {
          single_click: {
            opr_path: null,
            opr_type: ""
          }
        },

        pagination: true,
        pageSize: 10,

        //
        oprCol: false,
        SNCol: false,
        globalAlignCode: 1,
        golbalColWidth: 100,
        golbalColWidthType: 'px',
        oidNameMap: null,
        refClass: '',
        classCategory: '',
        events: [],
        eventRange: ["初始化", "前处理", "翻页", "单击"],
        cacheGrid: false,//内存表格，不绑定目标类
        hided: false,
        contentbg_color: '#f7f8fa',
        header_color: '#f7f8fa',
        head_fontColor:'initial',
        content_fontColor: 'initial',
        hfsize: 14,
        hfsizeType: 'px',
        cfsize: 12,
        cfsizeType: 'px',
        stripe: true,
      },
      rangeSelectionDisabled: false,
      selected_attributes_catch: {},
      userColumnList: ['creator', 'lastModifier', 'owner'],

      currentPage: 1,
      countPage: 0,
      entryCount: 0, //记录当前查询条件条目总数

      edit: false,
      draggable: false,

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

      all_class: [],
      relations: [],
      all_relations: [],

      params: null,

      inherit: [],

      attrMap: {},
      classAttrMap: {},
      classMap: {},
      relationMap: {},
      classTypeMap: {},

      init: false,

      open: ["1", "2", "3"],

      _relation: null,
      leftRole: null,
      relationRole: null,
      rightRole: null,

      test: null,

      self: false, // 操作设定中用到的变量
      sg_self: false,
      _query_oprs: [], // 快速查询操作类型列表 一般在modeler端读入
      oprs: [
        // 基本操作类型
        // {
        //   id: 0,
        //   path: "save",
        //   displayName: "新增"
        // },
        // {
        //   id: 1,
        //   path: "edit",
        //   displayName: "编辑"
        // },
        {
          id: 2,
          path: "delete",
          displayName: "删除"
        },
        {
          id: 3,
          path: "refresh",
          displayName: "刷新"
        }
      ],
      query_opr: null, // app端读取当下的快查操作类型
      sg_query_opr: null, //临时单击使用

      // 快查操作弹框的相关配置
      modalIf: false,
      modal: true,
      modalTitle: "",
      modalPath: "",
      modalQuery: "",
      targetClassAttributesLeftCollapse: 'def',
      targetClassAttributesRightCollapse: 'def',
      targetClassAttributesRelationCollapse: 'def',
      targetClassAttributesCollapse: 'def',
      firstLoad: true,
      handleAttrSearchEntity: '',
      handleAttrSearchLeft: '',
      handleAttrSearchRelation: '',
      handleAttrSearchRight: '',
      setDataTimerFlag: false,//是否装配完数据可以setRowData
      selectCol: {
        timeTransferFormat:'YYYY-MM-DD hh:mm:ss'
      },
      selectIndex: -1,
      renderList: [
        {
          name: "无",
          value: "NONE"
        },
        {
          name: "时间转换",
          value: "timeTransferRender"
        },
      ],
    };
  },
  components: {
    QueryOprDialog,
    EditBox
  },
  beforeDestroy() {

  },
  beforeMount() {
    delete this.args["label_align"];
    delete this.args["label_width"];
    delete this.args["main_align"];
    delete this.args["main_width"];
    delete this.args["basic_height"];
    if (this.t_preview) {
      this.initData();
    }
  },
  inject: [
    'setBasicArgs'
  ],
  created() {
    //通用方法给args赋值
    this.args = this.setBasicArgs(this.args);
    this.setArgs(this.args);
    if (this.t_preview) {
      this.$store = this.store;
      this.sys_relation_attributes = SYS_RELATION_ATTRIBUTES;
      this.sys_entity_attributes = SYS_ENTITY_ATTRIBUTES;
    }
    this.onGridReady()
  },

  mounted() {
    this.$nextTick(async () => {
      if(this.t_preview) {
        // 缺省绑定类为当前表单目标类
        if(this.args.bindTargetClass == '' || this.args.bindTargetClass.indexOf('&') == -1) {
          if(this.itemValue.data.isRelation) {
            this.args.bindTargetClass = this.itemValue.data.targetClass + '&r';
          } else {
            this.args.bindTargetClass = this.itemValue.data.targetClass + '&e';
          }
          if (this.itemValue) this.args.oprTargetClass = this.itemValue.data.targetClass;
        }
      }
    });
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
    arg_page_size() {
      if (!this.args.pageSize || this.args.pageSize == '') return 1;
      return parseInt(this.args.pageSize)
    },
    arg_width() {
      return this.args.width + this.args.widthType;
    },

    dbclk_path() {
      // 协助watch侦听
      return this.args.dbclk_path;
    },

    sgclk_path() {
      return this.args.sgclk_path;
    },

    arg_columnDefs() {
      // assist watch columnDefs
      return this.args.columnDefs;
    },

    arg_height() {
      return this.args.height + this.args.heightType;
    },
    arg_inside_height() {
      if (this.args.heightType == 'px') {
        return (this.args.height-45) + this.args.heightType;
      }
      return this.args.height+ this.args.heightType;
    },

    arg_relation_class() {
      return this.args.relation_class;
    },

    arg_all_class() {
      return this.args.all_class;
    },

    arg_select_type() {
      return this.args.select_type;
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
    XAlign() {
        let x = parseInt(this.args.globalAlignCode / 3);
        if (x == 0) return "left";
        else if (x == 1) return "center";
        else return "right";
    },
    YAlign() {
        let x = this.args.globalAlignCode % 3;
        if (x == 0) return "top";
        else if (x == 1) return "middle";
        else return "bottom";
    },
    args_cfsize(){
      return this.args.cfsize + this.args.cfsizeType + ' !important';
    },
    args_hfsize() {
      return this.args.hfsize + this.args.hfsizeType + ' !important';
    },
    args_globalwidth() {
      if (this.args.golbalColWidthType == '%') {
        let allwidth = this.$refs.main? this.$refs.main.offsetWidth : 375
        let fwidth = Math.floor(this.args.golbalColWidth* allwidth / 100)
        return fwidth<30?'30px':fwidth + 'px'
      }
      return this.args.golbalColWidthType == 'px' && this.args.golbalColWidth < 30? '30px': this.args.golbalColWidth + this.args.golbalColWidthType
    },
    args_finalColWidth() {
      return function(item) {
        if (!item.width) return this.args_globalwidth;
        if (item.widthType == '%') {
          let allwidth = this.$refs.main? this.$refs.main.offsetWidth : 375
          let fwidth = Math.floor(item.width* allwidth / 100);
          return fwidth<30? '30px': fwidth + 'px'
        }
        return item.width < 30?'30px':item.width + item.widthType;
      }
    },
    arg_line_height() {
      // if (this.args.compactMode) return 31;
      return this.args.rowHeight
    },

  },

  watch: {
    'args.rowSelection'() {
      this.setRowData();
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
    'args.compactMode'(val) {
      if (val) {
        this.args.rowHeight = 25;
      } else {
        this.args.rowHeight = 44;
      }
    },

    async arg_bindTargetClass(val) {
      var that = this;
      if (!this.t_preview) return;
      if (!val) {
        this.targetClassAttributes = [];
        this.targetClassAttributeNames = [];
        this.targetClassAttributeDisplayNames = [];
        this.args.columnDefs = [];
      };
      console.log("val, classAttrMap@watch arg_targetClass", val, !val, this.classAttrMap);
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
        this.args.select_type = "relation";
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
          attr.forEach(x => (that.attrMap[x.attributeName] = x));
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
        this.args.select_type = "obj";
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


        // for (var i = this.args.selected_attributes.length;i > 0;i--) {
        //   let attr = this.args.selected_attributes[i-1];
        //   if (!(attr in this.attrMap)) {
        //     this.args.selected_attributes.splice(i-1, 1);
        //   }
        // }
      } else {

      }
      this.args.targetClass = val.split('\&')[0];
      console.log(
        "val, select_type, targetClassAttributes, classAttrMap, attrMap@watch arg_targetClass",
        val,
        this.args.select_type,
        this.targetClassAttributes,
        this.classAttrMap,
        this.attrMap
      );
      // this.entryCounts();
      if (this.args.SNCol) {
        this.initSNCol()
      }
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
      if(this.handleAttrSearchEntity){
        if(val.length !== 0 && this.filter_targetClassAttributes_def.length === 0){
          this.targetClassAttributesCollapse = ['sys']
        }else if(val.length === 0 && this.filter_targetClassAttributes_def.length !== 0){
          this.targetClassAttributesCollapse = ['def']
        }else if(val.length !== 0 && this.filter_targetClassAttributes_def.length !== 0){
          this.targetClassAttributesCollapse = ['sys', 'def']
        }
      }
    },

    filter_targetClassAttributes_def(val) {
      if(this.handleAttrSearchEntity) {
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
      if(this.handleAttrSearchRelation) {
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
      if(this.handleAttrSearchRelation) {
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
      if(this.handleAttrSearchLeft) {
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
      if(this.handleAttrSearchLeft) {
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
      if(this.handleAttrSearchRight) {
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
      if(this.handleAttrSearchRight) {
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
    renderContent(value, coldef) {
      if (coldef.renderType=='timeTransferRender') {
        return this.format(new Date(value), coldef.timeTransferFormat)
      }
      return value;
    },
    format(time, fmt) {
      console.log(time, time instanceof Date, !(time instanceof Date), time && isNaN(time.getTime()))
      if (!fmt) return time
      if (!(time instanceof Date) || (time && isNaN(time.getTime()))) return '';
      var o = {
        "M+" : time.getMonth()+1,                 //月份
        "D+" : time.getDate(),                    //日
        "d+" : time.getDate(),                    //日
        "h+" : time.getHours(),                   //小时
        "H+" : time.getHours(),                   //小时
        "m+" : time.getMinutes(),                 //分
        "s+" : time.getSeconds(),                 //秒
        "q+" : Math.floor((time.getMonth()+3)/3), //季度
        "S"  : time.getMilliseconds()             //毫秒
      };
      console.log('0 ',fmt)
      if(/(Y+)/.test(fmt)) {
              fmt=fmt.replace(RegExp.$1, (time.getFullYear()+"").substr(4 - RegExp.$1.length));
      }
      console.log('1 ',fmt)
      for(var k in o) {
          if(new RegExp("("+ k +")").test(fmt)){
              fmt = fmt.replace(RegExp.$1, (RegExp.$1.length==1) ? (o[k]) : (("00"+ o[k]).substr((""+ o[k]).length)));
          }
      }
      console.log('2 ',fmt)
      return fmt
    },

    // ...mapMutations("DWF_form", ["addEntity"]),
    changeStripe() {
      if (!this.args.stripe) {
        this.args.contentbg_color = '#fff'
      }
      else {
        if (this.args.contentbg_color == 'initial' || this.args.contentbg_color=='#fff') {
          this.args.contentbg_color = '#f7f8fa'
        }
      }
    },
    async onGridReady() {
      this.setDataTimer = null;
      let that = this;
      //初始化是等待数据装配完毕赋值
      this.setDataTimer = null;
      this.setDataTimer = setInterval(async () => {
        if(that.setDataTimerFlag) {
          that.setRowData();
          that.setDataTimerFlag = false;
          clearInterval(that.setDataTimer);
          that.setDataTimer = null;
        }
      }, 300)
      if (this.t_preview && this.args.columnDefs && !this.args.cacheGrid) {
        this.initUserAndGroupMap();
        this.updateColDefIndex();
        await this.freshData();
        setTimeout(() => {
          this.firstLoad = false;
        }, 2000)
      }
      // this.setAutoSize()
    },
    async initTableData() {
      if (this.t_preview && this.args.columnDefs && !this.args.cacheGrid) {
        // this.updateColDefIndex();
        await this.freshData();
      }
    },
    /**
     * 初始化data
     * @all_class所有实体类
     * @relations-store取出的全部关联类
     * @all_relations接口取出的全部关联类
     */
    async initData() {
      this.all_class = this.Entities().filter(x=> typeof x.className == "string");
      this.relations = this.Relations();
      if(this.relations && this.relations.length > 0) {
        this.all_relations = this.Relations();
      } else {
        this.all_relations = await getAllRelations();
        this.all_relations = this.all_relations.data.data;
      }

      if(this.args.cacheGrid) return;
      if (!this.args.targetClass){
        this.args.targetClass = this.itemValue.data.targetClass;
      }
      if(this.args.bindTargetClass && !/\&/.test(this.args.bindTargetClass)){
        this.args.bindTargetClass = this.relations.filter(item => item.className === this.args.bindTargetClass).length === 0 ? this.args.bindTargetClass + '&e' : this.args.bindTargetClass + '&r'
      }
      console.log("init rowData, colDefs", this.rowData, this.args.columnDefs);
    },
    /**
     * 更新数据
     * initial情况query = undefined fresh = undefined
     * step1确认为关联/实体类
     * 关联：
     * 实体：1确认目标类是否在类映射表@classMap中，2确认目标类是否在类属性映射表@classAttrMap中
     * @classMap：以classname为key值，类属性value
     * @classAttrMap：以classname为key值，类所有对象为value
     * step2确定查询条件 优先级参数query > lastQuery > args.query > blank query(initial)
     * @queryData{
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
     * step3继续组装queryData,
     * step4如果表格中有创建人，拥有着，最后更新人的oid显示进行替换，执行查询操作获得行数据rowData,对象数counts保存queryData
     */
    async updateQuery(query, resize, fresh) {
      fresh = fresh || true;
      this.targetClass = this.getSelectedClass();
      if (!this.args.targetClass && this.itemValue.data.targetClass) this.args.targetClass = this.itemValue.data.targetClass;
      this.isRelation = this.args.select_type == "relation" ? true : false;
      /**
       * TODO: step1
       */
      if (this.args.select_type == "relation") {
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
      /**
       * TODO: step2
       */
      let that = this;
      let _query = {
        ...this.args._query
      };
      if (query) {
        if (query == 'reset') query = '';
        if (typeof query != "string") {
          query = await this.handleQueryObj(query, this);
        } else {
          query = '';
          // parseEscapeString(query, null, null, this.itemValue.data.origin, this.AttributesByClass((this.itemValue.data.targetClass)), this.$store);
        }
        _query.query = query;
      } else {
        if (this.lastQuery) _query.query = this.lastQuery;
        else {
          if (this.args.query && typeof this.args.query == "string" && this.args.query != "") _query.query = '';
          // parseEscapeString(this.args.query, null, null, this.itemValue.data.origin, this.AttributesByClass((this.itemValue.data.targetClass)), this.$store);
          else _query.query = "";
        }
      }
      this.lastQuery = _query.query;
      var queryData = {
        query: _query,
        targetClass: "",
        fresh: fresh
      };
      // queryData.query.query = queryData.query.query ? queryData.query.query.substring(0, 5) == "order" ? queryData.query.query : '' : '';
      // queryData.query.query = queryData.query.query ? queryData.query.query.replace(/"/g, "'").trim() : '';
      // await this.entryCounts(queryData.query.query);

      // if(this.args.pageSize * (this.currentPage - 1) === this.entryCount && this.currentPage !== 1){
      //   //对象个数===页数的整数倍
      //   queryData.query.startIndex = this.args.pageSize * (this.currentPage - 2);
      // }else if(this.args.pageSize * (this.currentPage - 1) > this.entryCount && this.currentPage !== 1){
      //   //对象个数<=页数的整数倍
      //   queryData.query.startIndex = this.args.pageSize * (this.currentPage - 1) + 1;
      // }else if(this.currentPage === 1){
      //   queryData.query.startIndex = 0
      // }

      // queryData.query.startIndex = this.args.pageSize * (this.currentPage - 1);
      // queryData.query.pageSize = this.args.pageSize;
      queryData.query.startIndex = 0;
      queryData.query.pageSize = 3;
      queryData.fresh = true;
      /**
       * TODO: step3
       */
      let data;
      if (this.args.select_type == "relation") {
        queryData.query.type = "relation";
        queryData.targetClass = this.targetClass;
        queryData.leftClass = this._relation.leftClass;
        queryData.rightClass = this._relation.rightClass;
        queryData.relationClass = this._relation.className;
        data = await getEJobj(this.args.targetClass, {
          pageSize: queryData.query.pageSize,
          startIndex: queryData.query.startIndex,
          condition: queryData.query.query
        });
      } else {
        queryData.targetClass = this.args.targetClass;
        queryData.query.type = "obj";
        data = await getEobj(this.args.targetClass, {
          pageSize: queryData.query.pageSize,
          startIndex: queryData.query.startIndex,
          condition: queryData.query.query
        });
      }


      let columnAttrList = this.args.columnDefs.map(item => item.attrName);
      let rowData = data.data.data;
      /**
       * TODO: step4
       */
      this.uuidTypeColumnList = Object.keys(this.attrMap).filter(item => {
        return this.attrMap[item].valueType == 'UUID';
      });

      // let userAndGroupMap = await this.initUserAndGroupMap();
      if (this.args.select_type == "relation") {
        let left_data = data.data.data[0] || [];
        let relation_data = data.data.data[1] || [];
        let right_data = data.data.data[2] || [];
        this.oids = {};
        this.oids[this._relation.leftClass] = [];
        this.oids[this._relation.className] = [];
        this.oids[this._relation.rightClass] = [];
        //处理源Data return行数据
        rowData = relation_data.map((item, index) => {
          let newData = {};
          let leftData = {};
          let rightData = {};
          //增加左类标识，替换类型为uuid的用户名或组
          leftData = left_data.filter(left => {
            return left.oid === item['leftOid'];
          })[0];
          // leftData ? Object.keys(leftData).forEach(key => {
          //   newData[`left_${key}`] = this.uuidTypeColumnList.indexOf(key) !== -1
          //     ? (leftData[key] && userAndGroupMap[leftData[key]])
          //       ? userAndGroupMap[leftData[key]]
          //       : leftData[key]
          //     : leftData[key];
          // }) : '';
          leftData ? Object.keys(leftData).forEach(key => {
            newData[`left_${key}`] = leftData[key];
          }) : '';
          //增加关联类标识，替换类型为uuid的用户名或组
          item ? Object.keys(item).forEach(key => {
            newData[`relation_${key}`] = item[key];
          }) : '';
          //增加右类标识，替换类型为uuid的用户名或组
          rightData = right_data.filter(right => {
            return right.oid === item['rightOid'];
          })[0];
          rightData ? Object.keys(rightData).forEach(key => {
            newData[`right_${key}`] = rightData[key];
          }) : '';
          this.oids[this._relation.leftClass].push(newData['left_oid']);
          this.oids[this._relation.className].push(newData['relation_oid']);
          this.oids[this._relation.rightClass].push(newData['right_oid']);
          return newData;
        });
      } else {
        this.oids = [];
        if (columnAttrList.length != 0) {
          rowData = data.data.data.map(item => {
            let newData = item;
            // this.uuidTypeColumnList.forEach(uuidItem => {
            //   (item[uuidItem] && userAndGroupMap[item[uuidItem]]) ? newData[uuidItem] = userAndGroupMap[item[uuidItem]] : '';
            // });
            this.oids.push(item.oid);
            return newData;
          })
        }
      }
      this.queryData = queryData;
      this.rowData = rowData;
      this.columnDefsRefFix();
    },

    /**
     * 有用户列时初始化所有用户/用户组oid-name映射
     */
    async initUserAndGroupMap() {
      // let users = await getAllUsers();
      // let groups = await getGroups();
      this.oidNameMap = {
        user: {},
        group: {}
      };
      // users.data.data.forEach(item => {
      //   this.oidNameMap.user[item.oid] = {
      //     displayName: item.displayName,
      //     name: item.name,
      //     oid: item.oid
      //   }
      // });
      // groups.data.data.forEach(item => {
      //   this.oidNameMap.group[item.oid] = {
      //     displayName: item.name,
      //     name: item.name,
      //     oid: item.oid
      //   }
      // });
      this.oidNameMap['9C92E891E9AE534DB685737DE467A9D0'] = {
        displayName: '管理员',
        name: 'Admin',
        oid: '9C92E891E9AE534DB685737DE467A9D0'
      };
      return this.oidNameMap;
    },
    /**
     * 点击确定属性确定列定义
     * step1 复制操作列
     */
    async initColumnDefs() {
      //step1
      let _tmpOprCol = null;
      let _tmpSNCol = null;
      let oprColIndex = this.args.columnDefs.map(x => {
        if (x && x.colId) return x.colId;
      }).indexOf("_oprColumn");
      if (oprColIndex > -1) {
        _tmpOprCol = this.args.columnDefs[oprColIndex];
      }
      let SNColIndex = this.args.columnDefs.map(x => {
        if (x && x.colId) return x.colId;
      }).indexOf("_SNColumn");
      if (SNColIndex > -1) {
        _tmpSNCol = this.args.columnDefs[SNColIndex];
      }

      let defs = [];
      let that = this;

      if (this.args.select_type == "relation") {
        // 关联类
        if (!this._relation) {
          await this.queryRelation(this.args.targetClass);
          this._relation = this.Relations(this.args.targetClass);
          this.leftRole = this._relation.leftRole;
          this.relationRole = this._relation.displayName;
          this.rightRole = this._relation.rightRole;
          if (!(this.args.targetClass in this.classAttrMap)) {
            var attr = this.RelationAttrList(this.args.targetClass) && this.RelationAttrList(this.args.targetClass).length != 0 ? this.RelationAttrList(this.args.targetClass) : this._relation.attributes;
            that.attrMap[x.attributeName] = {...attr};
            this.classAttrMap[this.args.targetClass] = attr;
          }
        }
        if (!(this._relation.leftClass in this.classAttrMap)) await this.addAttributes(this._relation.leftClass);
        if (!(this._relation.rightClass in this.classAttrMap)) await this.addAttributes(this._relation.rightClass);

        console.log("attrMap@initColumnDefs", that.attrMap);

        let directions = ["left", "relation", "right"];
        if (!this.prefix_relation) {
          let prefix_relation = {
            "left": "left_",
            "relation": "relation_",
            "right": "right_"
          };
          this.prefix_relation = prefix_relation;
        }
        let headerName_prefix = {
          "left": this.leftRole ? `${this.leftRole}的` : '',
          "relation": this.relationRole ? `${this.relationRole}的` : '',
          "right": this.rightRole ? `${this.rightRole}的` : ''
        };
        for (var direc of directions) {
          if(that.args.selected_attributes[direc]){
            for (let attr_name of that.args.selected_attributes[direc]) {
              let attr = that.attrMap[attr_name];

              let currentColumnDef = this.args.columnDefs.filter(item => item.field && item.field === `${that.prefix_relation[direc]}${attr_name}`)[0];
              let currentRefColumnDef = this.args.columnDefs.filter(item => item.oriField && item.oriField === `${that.prefix_relation[direc]}${attr_name}`)[0];
              let coldef = {};
              if (currentRefColumnDef && !!currentRefColumnDef.refClass) {
                coldef = currentRefColumnDef;
                // && !!currentColumnDef._cellRendererFramework
              } else if (currentColumnDef) {
                coldef = currentColumnDef;
              } else {
                coldef = {
                  field: that.prefix_relation[direc] + attr.attributeName,
                  attrCategory: attr.attributeCategory,
                  attrName: attr.attributeName,
                  attrValueType: attr.valueType,
                  headerName: headerName_prefix[direc] + attr.displayName,
                  widthPercent: 0,
                  uuid: attr.id,
                  colId: that.prefix_relation[direc] + attr.displayName + "_id",
                  alignCode: 1,
                  enableFilter: this.args.enableFilter,
                  compactMode: this.args.compactMode,
                }
              }
              if (coldef.attrValueType && (coldef.attrValueType == 'Date' || coldef.attrValueType =='TimeStamp')) {
                coldef.timeTransferFormat = 'YYYY-MM-DD hh:mm:ss';
                coldef.renderType = 'timeTransferRender';
              }
              coldef.width = this.args.golbalColWidth;
              coldef.widthType = this.args.golbalColWidthType;
              defs.push(coldef);
            }
          }
        }

        // if(this.args.selected_attributes_sort.length !== 0){
        //   for (let [index1, attr_name] of this.args.selected_attributes_sort.entries()){
        //     let index2 = defs.findIndex(def => def.field === attr_name);
        //     [defs[index1], defs[index2]] = [defs[index2], defs[index1]];
        //   }
        // }
      } else {
        // 实体类表格
        if (!(this.args.targetClass in this.classAttrMap)) {
          await this.addAttributes(this.args.targetClass);
        }
        let checkAttr = this.classAttrMap[this.args.targetClass];
        let checkAttrArray = checkAttr.map(item => item.attributeName);
        this.args.selected_attributes.forEach(x => {
          let attr = that.attrMap[x];
          // console.log("attrmap:", that.attrMap, attr, x);
          if (checkAttrArray.indexOf(x) !== -1) {

            let currentColumnDef = this.args.columnDefs.filter(item => item.field === x)[0];
            let currentRefColumnDef = this.args.columnDefs.filter(item => item.oriField === x)[0];
            let coldef = {};
            if (currentRefColumnDef && !!currentRefColumnDef.refClass) {
              coldef = currentRefColumnDef;
            } else if (currentColumnDef) {
              coldef = currentColumnDef;
            } else {
              coldef = {
                field: attr.attributeName,
                attrCategory: attr.attributeCategory,
                attrName: attr.attributeName,
                attrValueType: attr.valueType,
                headerName: attr.displayName,
                widthPercent: 0,
                uuid: attr.id,
                colId: attr.attributeName + "_id",
                alignCode: 1,
                enableFilter: this.args.enableFilter,
                compactMode: this.args.compactMode,
              };
            }
            if (coldef.attrValueType && (coldef.attrValueType == 'Date' || coldef.attrValueType =='TimeStamp')) {
              coldef.timeTransferFormat = 'YYYY-MM-DD hh:mm:ss';
              coldef.renderType = 'timeTransferRender';
            }
            coldef.width = this.args.golbalColWidth;
            coldef.widthType = this.args.golbalColWidthType;
            defs.push(coldef);
          }
        });
      }

      this.selected_attributes_catch[this.args.targetClass] = _.cloneDeep(this.args.selected_attributes);
      this.args.columnDefs = defs;
      this.rowData = [];

      if (_tmpOprCol) this.args.columnDefs.push(_tmpOprCol);
      if (_tmpSNCol) this.args.columnDefs.unshift(_tmpSNCol);
      this.updateColDefIndex();
      await this.freshData();
      if(this.rowData.length == 0) this.rowData.push({});

      console.log("rowData, colDefs", this.rowData, this.args.columnDefs);
    },
    /**
     * 取消属性确定列定义
     * 主要是恢复args.selected_attribute
     */
    cancelColumnDefs() {
      if (typeof this.selected_attributes_catch[this.args.targetClass] !== "undefined") {
        this.args.selected_attributes = this.selected_attributes_catch[this.args.targetClass];
      }
    },

    /**
     * 打开属性选择框
     */
    openChooseCols() {
      this.chooseCols = true;
      this.args.targetClass = this.args.bindTargetClass.split('\&')[0]
    },

    setRowData(rowData) {
      if (rowData) {
        this.rowData = rowData;
      }
    },

    async columnDefsRefFix() {
      // 对列做了引用后 调用该方法替换colDef完成引用数据的显示
      // 本质将colDef中的field做替换 并在rowData中增加新的数据列
      // 需要在取消引用时做还原
      // 当前读取数据直接调用others中的api 事后应整合到store中
      // console.log("args.columnDefs@columnDefsRefFix", this.args.columnDefs);

      let sigSuffix = "%ref%"; // 用于标记该field已经被替换 属性名中不可用%

      // console.log("defs@columnDefsRefFix", this.args.columnDefs);
      let refQueryParams = {
        refs: [],
        // startIndex: this.args.pageSize * (this.currentPage - 1),
        // pageSize: this.args.pageSize
        startIndex: 0,
        pageSize: 3
      };
      //  扫描columnDefs 所有需要引用的一起引用
      this.args.columnDefs.forEach(_colDef => {
        if (_colDef.refClass && _colDef.browseAttr && _colDef.returnAttr) {
          let oriField;

          // 如果有oriField就读取 否则读取field 如果读取的值有_ref后缀 说明根本没有保存原本的field
          if (_colDef.oriField) oriField = _colDef.oriField;
          else oriField = _colDef.field;
          if (oriField.indexOf("%ref%") != -1) {
            console.error('Have not record original field before.');
            return;
          }

          let queryParam = {
            sourceAttr: oriField,
            targetAttr: _colDef.browseAttr,
            targetClass: _colDef.refClass,
            sourceAttrSplit: ','
          };

          refQueryParams["refs"].push(queryParam);
          if (!_colDef.oriField) _colDef["oriField"] = oriField; // 只在第一次替换时保存 这样就可以永久保存最初的field字段
          if (Array.isArray(_colDef.returnAttr) && _colDef.returnAttr.length !== 0) {
            _colDef.returnAttr.forEach((returnAttr, i) => {
              if (i === 0) {
                _colDef.field = returnAttr
              } else {
                _colDef.field += `-${returnAttr}`; // 新的field为"回填属性名_ref_原属性名" 避免多个属性引用通个属性时的错误
              }
              if (i === _colDef.returnAttr.length - 1) {
                _colDef.field += `${sigSuffix}${oriField}`
              }
            })
          } else {
            _colDef.field = _colDef.returnAttr + sigSuffix + oriField; // 新的field为"回填属性名_ref_原属性名" 避免多个属性引用通个属性时的错误
          }

        } else {
          // 缺少任何一个引用字段 都应该还原field取值
          if (_colDef.oriField) _colDef.field = _colDef.oriField;
          else {
            // console.error('Have no reference before.')
            return;
          }
          ;
        }
      });
      let res;
      if (this.args.select_type == "relation") {
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
              if (row[_colDef.oriField] != '' && row[_colDef.oriField] != undefined) {
                currentCellData = typeof (row[_colDef.oriField]) == 'number' || typeof (row[_colDef.oriField]) == 'boolean' ? row[_colDef.oriField] : row[_colDef.oriField].split(',');
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
                row[refKey + sigSuffix + _colDef.oriField] = refValue;
              } else {
                // let refClassObjs = res[_colDef.refClass];
                if (row[_colDef.oriField] != '' && row[_colDef.oriField] != undefined) {
                  row[_colDef.oriField] = isNaN(parseInt(row[_colDef.oriField])) ? row[_colDef.oriField] : parseInt(row[_colDef.oriField]);
                  let index = refClassObjs.map(x => x[_colDef.browseAttr]).indexOf(row[_colDef.oriField]);
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
                        row[refKey + sigSuffix + _colDef.oriField] = refValue;
                      }
                    });
                  } else if (index !== -1 && !Array.isArray(_colDef.returnAttr)) {
                    row[_colDef.returnAttr + sigSuffix + _colDef.oriField] = refClassObjs[index][_colDef.returnAttr];
                  }
                } else {
                  //当前值为空的时候不需要匹配引用值
                  row[_colDef.returnAttr + sigSuffix + _colDef.oriField] = '';
                }
              }
            }
            ;
          }
        }
        ;
      }
      this.setColumnDefs(this.args.columnDefs);
      if(!this.firstLoad){
        this.setRowData()
      }
      this.setDataTimerFlag = true;
    },


    onDrop() {
      console.log("onDrop");
    },

    onDragStart() {
      console.log("onDragStart");
    },

    getSelectedClass() {
      return this.args.targetClass;
    },


    getQueryOprs() {
      return [];
    },
    themeChanged() {
      this.freshData();
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

    handleQueryObj(query, that) {
      // 对关联类的查询语句实际没有处理
      if (typeof query == "string") return query;
      let _ret;
      let _class;
      let _str = ["String", "UUID", "Clob", "Date"];
      let _int = ["Integer", "Long", "Double", "TimeStamp"];
      if (that.args.select_type == "relation") {
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

    async addAttributes(className) {
      if (className) {
        console.log("add attributes:", className);
        // await this.queryEntity(className);
        // var attr = this.EntityAttrList(className);
        let res = await getAttributes(className);
        let attr = res.data;
        let that = this;
        attr.forEach(x => (that.attrMap[x.attributeName] = x));
        this.classAttrMap[className] = attr;
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

      if (this.args.select_type != 'obj') {
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
      if (this.args.select_type == "relation" && this._relation) {
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

    async freshData(query, resize = true) {
      await this.updateQuery(query, resize);
      this.adjustRowHeight();
    },

    setColumnDefs(defs) {
      defs = defs || this.args.columnDefs;
    },

    getColumnDefs() {
      return this.args.columnDefs;
    },
    updateColDefIndex() {
      this.colDefIndex = {};
      for (var idx in this.args.columnDefs) {
        this.colDefIndex[this.args.columnDefs[idx].colId] = idx;
      }
    },
    colSetAction(item, index) {
      console.log('colSet')
      this.showColSetting = true
      this.selectCol = item
      this.selectCol.widthType?'': this.selectCol.widthType= 'px'
      this.selectIndex = index;
      this.selectCol.timeTransferFormat? '':this.selectCol.timeTransferFormat= 'YYYY-MM-DD hh:mm:ss' ;
    },
    applyColSet() {
      if (!this.selectIndex || this.selectIndex == -1 || !this.args.columnDefs[this.selectIndex]) return;
      this.args.columnDefs[this.selectIndex].headerName = this.selectCol.headerName;
      this.args.columnDefs[this.selectIndex].widthType = this.selectCol.widthType;
      if (this.selectCol.widthType == 'px' && this.selectCol.width < 30) this.selectCol.width = 30;
      this.args.columnDefs[this.selectIndex].width = this.selectCol.width;

    },

    async onCellDoubleClicked(params) {
      console.log("params@cellDobleClicked", params);
    },

    async onCellSingleClicked(params) {
      // console.log("cell sgclicked", params);
      // console.log("this.$refs@onCellSingleClicked", this.$refs);
      console.log('this.store', this.store);
    },


    onColResized(params) {
      console.log("col resized", params);
      if(params.source === 'uiColumnDragged' || params.source === 'sizeColumnsToFit' || params.source === 'autosizeColumns'){
        let _index;
        if (params.column) {
          _index = this.args.columnDefs
            .map(x => x && x.colId)
            .indexOf(params.column.colId);

          this.args.columnDefs[_index]["width"] = params.column.actualWidth;
        }
      }
    },

    autoSizeAll() {
    },

    onColMoved(params) {
      console.log("col moved", params);
      let idx1 = this.colDefIndex[params.column.colId];
      let idx2 = params.toIndex;
      var tmp = this.args.columnDefs[idx1];
      this.args.columnDefs[idx1] = this.args.columnDefs[idx2];
      this.args.columnDefs[idx2] = tmp;
      this.colDefIndex[this.args.columnDefs[idx1].colId] = idx1;
      this.colDefIndex[this.args.columnDefs[idx2].colId] = idx2;
      this.rowSelectionChange();
    },

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

      let that = this;
      this.args.columnDefs = this.args.columnDefs.filter(x => {
        if (x) return x;
      });
      if (!this.args.cacheGrid) {
        if (!this.args.bindTargetClass) this.args.bindTargetClass = this.args.targetClass;
        this.selected_attributes_catch[this.args.targetClass] = _.cloneDeep(this.args.selected_attributes);
      }
      if ("name" in args) this.args_name = this.args.name;
      if ('eventRange' in args) {
        this.args.eventRange = ["初始化", "前处理", "翻页",  "单击"];
      }
      //兼容之前单双击事件
      if (this.args.events.length !== 0 && !this.args.events.find(event => event.name === '单击')) {
        this.args.events.push({
          name: "单击",
          opr_path: this.args.sgclk_path || '',
          opr_type: this.args.sgclk_type || ''
        })
      }
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

    getOprTargetClass() {
      return this.args.oprTargetClass;
    },

    getStore() {
      return this.$store;
    },

    async onCellValueChanged(params) {
      if (params.oldValue == params.value) {
        console.log("cellValue Not Changed");
        return;
      }
      console.log("cellValueChanged", params);
      let _modEobj = {
        className: this.args.targetClass,
        obj: this.rowData[params.rowIndex]
      };
      await this.editEObj(_modEobj);
    },

    initOprCol() {
      let _index = this.args.columnDefs.map(x => x.colId).indexOf("_oprColumn");
      let that = this;
      if (!this.args.oprCol) {
        if (_index < 0) return;
        this.args.columnDefs.splice(_index, 1);
        // delete this.args.columnDefs[_index];
        // this.args.columnDefs = this.args.columnDefs.filter(x=>{
        //   if(x) return x;
        // });
      } else {
        if (_index >= 0) return;
        this.args.columnDefs.push({
          field: "_oprColumn",
          headerName: "操作列",
          colId: "_oprColumn",
          width: 100,
          lockPosition:false,
          widthType: 'px',
          widthPercent: 0,
        });
      }
      this.updateColDefIndex();
    },
    initSNCol() {
      let _index = this.args.columnDefs.map(x => x.colId).indexOf("_SNColumn");
      if (!this.args.SNCol) {
        if (_index < 0) return;
        this.args.columnDefs.splice(_index, 1);
      } else {
        if (_index >= 0) return;
        this.args.columnDefs.unshift({
          field: "_SNColumn",
          headerName: "序号",
          alignCode: 1,
          colId: "_SNColumn",
          width: 100,
          widthType: 'px',
          lockPosition:false,
        });
      }
      this.rowSelectionChange();
      this.updateColDefIndex();
    },


    adjustRowHeight(val) {
      let height = val || this.args.rowHeight;
      height = parseInt(height);
      this.args.rowHeight = height;
    },

    clearBindTargetClass(val) {
      this.args.cacheGrid = true;
    },

    handleBindTargetClassChange(val) {
      if (!val) {
        this.args.cacheGrid = true;
        this.args.targetClass = '';
        this.args.bindTargetClass = '';
      } else this.args.cacheGrid = false;
    },
    /**
     *@description设置列宽
     *@params
     *@date 2020/8/11
     *@return
     */
    setColumnWidths(width) {
      let columnWidths;
      if(width){
        this.args.columnDefs.forEach(def => {
          def.width = width;
        })
        columnWidths = this.args.columnDefs.map(def => {
          return {
            key: def.colId,
            newWidth: width
          }
        })
      }else{
        // this.args.columnDefs.forEach(def => {
        //   def.width = 200;
        // })
        columnWidths = this.args.columnDefs.map(def => {
          return {
            key: def.colId,
            newWidth: def.width || 150
          }
        })
      }
    },
    checkminval() {
      if (this.args.golbalColWidthType == 'px' && this.args.golbalColWidth < 30) {
        this.$nextTick(() => {
          this.args.golbalColWidth = 30;
        })
      }
    },
    checkminvalWidth() {
      if (this.selectCol.widthType == 'px' && this.selectCol.width < 30) {
        this.$nextTick(() => {
          this.selectCol.width = 30;
        })
      }
    },
    changeGolbalWidth() {
      this.$nextTick(() => {
        this.args.columnDefs.forEach(def => {
          def.width = this.args.golbalColWidth;
          def.widthType = this.args.golbalColWidthType;
        })
      })
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



.cell {
    box-sizing: border-box;
    text-align: left;
    overflow: hidden;
    padding: 0 5px;
    white-space: nowrap;
    text-overflow: ellipsis;
    border-bottom: 1px solid #e8eaec;
}
.head-tab {
    /* overflow: visible; */
    position: sticky;
    /* position: -webkit-sticky; */
    top: 0;
    /* display: grid; */
    grid-auto-flow: column;
    z-index: 7;
    border-bottom: 1px solid #e8eaec;
}
.head-cell {
    font-weight: 500;
    color: rgba(0,0,0,.85);
}
.head-cell:hover {
  cursor: pointer;
}
.table-column{
    display: inline-block;
    font-weight: 400;
    color: rgba(0,0,0,.65);
}
.vtable {
    position: relative;
    white-space: nowrap;
    line-height: 1.5;
    font-size: 14px;
    overflow: scroll;
}
.vtable::-webkit-scrollbar {
    width: 0px;
    height: 10px;
}

.vtable::-webkit-scrollbar-thumb {/*滚动条里面小方块*/
    border-radius: 5px;
    background: rgba(0,0,0,0.2);
    -webkit-border-radius: 4px;
    outline: 2px solid rgba(255, 255, 255, 0);
    outline-offset: -2px;
    border: 2px solid rgba(255, 255, 255, 0);
}
.vtable::-webkit-scrollbar-track {/*滚动条里面轨道*/
    -webkit-box-shadow: inset 0 0 5px rgba(0,0,0,0.2);
    border-radius: 0;
    background: rgba(0,0,0,0);
}


</style>
