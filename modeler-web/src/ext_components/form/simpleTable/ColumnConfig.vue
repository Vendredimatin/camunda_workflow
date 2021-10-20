<template>
  <Modal
    v-model="showPanel"
    title="列定制面板"
    style="height: 500px;"
    :mask-closable=false
    @on-ok="apply"
    @on-cancel="cancel"
  >
    <div>
      <Input v-model="headerName"/>
      <Tabs name="simpleTableConfig">
        <TabPane label="基本配置" tab="simpleTableConfig" name="config">
          <Collapse simple :value="collapsePage" accordion>
            <Panel name="1" v-show="type !== 'index'">引用设置
              <p slot="content">引用类</p>
              <Select slot="content" v-model="refClass" ref="refClass" clearable filterable @on-change="refClassChanged">
                <OptionGroup label="实体类">
                  <Option
                    v-for="item in all_intEntities"
                    :key="item.className"
                    :value="item.className"
                    :label="item.displayName"
                  >
                    <span>{{ item.displayName }}</span>
                    <span style="float:right;color:#ccc">{{ classNameDecorator(item.className) }}</span>
                  </Option>
                </OptionGroup>
                <OptionGroup label="外部实体类">
                  <Option
                    v-for="item in all_extEntities"
                    :key="item.className"
                    :value="item.className"
                    :label="item.displayName"
                  >
                    <span>{{ item.displayName }}</span>
                    <span style="float:right;color:#ccc">{{ classNameDecorator(item.className) }}</span>
                  </Option>
                </OptionGroup>
                <!-- <OptionGroup label="实体类">
                  <Option
                          v-for="item in all_class"
                          :key="item.className"
                          :value="item.className"
                          :label="item.displayName"
                  >
                    <span >{{ item.displayName }}</span>
                    <span style="float:right;color:#ccc">{{ classNameDecorator(item.className) }}</span>
                  </Option>
                </OptionGroup> -->
                <OptionGroup label="关联类">
                  <Option
                    v-for="item in all_relations"
                    :key="item.className"
                    :value="item.className"
                    :label="item.displayName"
                  >
                    <span>{{ item.displayName }}</span>
                    <span style="float:right;color:#ccc">{{ classNameDecorator(item.className) }}</span>
                  </Option>
                </OptionGroup>
              </Select>

              <p slot="content">回填字段（引用类中对应的属性）</p>
              <!-- 英文名为browseAttr 是引用类中 与目前操作的列属性相同的属性名 -->
              <Select slot="content" v-model="browseAttr" ref="browseAttr" clearable filterable :transfer="booleanTrue">
                <OptionGroup label="系统属性" v-if="refClassAttrs_sys">
                  <Option
                    v-for="attr in refClassAttrs_sys"
                    :key="attr.attributeName"
                    :value="attr.attributeName"
                    :label="attr.displayName"
                  >
                    <span>{{ attr.displayName }}</span>
                    <span style="float:right;color:#ccc">{{ classNameDecorator(attr.attributeName) }}</span>
                  </Option>
                </OptionGroup>
                <OptionGroup label="类属性" v-if="refClassAttrs_def">
                  <Option
                    v-for="attr in refClassAttrs_def"
                    :key="attr.attributeName"
                    :value="attr.attributeName"
                    :label="attr.displayName"
                  >
                    <span>{{ attr.displayName }}</span>
                    <span style="float:right;color:#ccc">{{ classNameDecorator(attr.attributeName) }}</span>
                  </Option>
                </OptionGroup>
                <OptionGroup label="关联类系统属性" v-if="refClassAttrs_relationSys">
                  <Option
                    v-for="attr in refClassAttrs_relationSys"
                    :key="attr.attributeName"
                    :value="attr.attributeName"
                    :label="attr.displayName"
                  >
                    <span>{{ attr.displayName }}</span>
                    <span style="float:right;color:#ccc">{{ classNameDecorator(attr.attributeName) }}</span>
                  </Option>
                </OptionGroup>
                <OptionGroup label="关联类属性" v-if="refClassAttrs_relationDef">
                  <Option
                    v-for="attr in refClassAttrs_relationDef"
                    :key="attr.attributeName"
                    :value="attr.attributeName"
                    :label="attr.displayName"
                  >
                    <span>{{ attr.displayName }}</span>
                    <span style="float:right;color:#ccc">{{ classNameDecorator(attr.attributeName) }}</span>
                  </Option>
                </OptionGroup>
              </Select>

              <p slot="content">浏览字段（最后显示到表格的属性）</p>
              <!-- 英文名为returnAttr 是引用类中 返回到操作列的属性名 -->
              <!--                :disabled="browseAttr !== 'oid'"-->
              <!--                :multiple="browseAttr === 'oid'"-->
              <Select slot="content" v-model="returnAttr" ref="returnAttr" clearable filterable multiple :transfer="booleanTrue">

                <OptionGroup label="系统属性" v-if="refClassAttrs_sys">
                  <Option
                    v-for="attr in refClassAttrs_sys"
                    :key="attr.attributeName"
                    :value="attr.attributeName"
                    :label="attr.displayName"
                  >
                    <span>{{ attr.displayName }}</span>
                    <span style="float:right;color:#ccc">{{ classNameDecorator(attr.attributeName) }}</span>
                  </Option>
                </OptionGroup>
                <OptionGroup label="类属性" v-if="refClassAttrs_def">
                  <Option
                    v-for="attr in refClassAttrs_def"
                    :key="attr.attributeName"
                    :value="attr.attributeName"
                    :label="attr.displayName"
                  >
                    <span>{{ attr.displayName }}</span>
                    <span style="float:right;color:#ccc">{{ classNameDecorator(attr.attributeName) }}</span>
                  </Option>
                </OptionGroup>
                <OptionGroup label="关联类系统属性" v-if="refClassAttrs_relationSys">
                  <Option
                    v-for="attr in refClassAttrs_relationSys"
                    :key="attr.attributeName"
                    :value="attr.attributeName"
                    :label="attr.displayName"
                  >
                    <span>{{ attr.displayName }}</span>
                    <span style="float:right;color:#ccc">{{ classNameDecorator(attr.attributeName) }}</span>
                  </Option>
                </OptionGroup>
                <OptionGroup label="关联类属性" v-if="refClassAttrs_relationDef">
                  <Option
                    v-for="attr in refClassAttrs_relationDef"
                    :key="attr.attributeName"
                    :value="attr.attributeName"
                    :label="attr.displayName"
                  >
                    <span>{{ attr.displayName }}</span>
                    <span style="float:right;color:#ccc">{{ classNameDecorator(attr.attributeName) }}</span>
                  </Option>
                </OptionGroup>
              </Select>
              <p slot="content" class="margin1">过滤条件</p>
              <Input slot="content" class="margin1" v-model="filterQuery" type="textarea" placeholder="输入过滤条件"
                     :rows="3"
                     :disabled="!refClass"
                     @on-focus="inputQuery"></Input>
              <FilterQueryCommonModal
                :args="args"
                :itemValue="itemValue"
                :refClass="refClass"
                :targetClass="itemValue.data.targetClass"
                ref="filterQuery_modal"
                :root="root"
                :store="store"
                @generatorFilterQuery="getFilterQuery">
              </FilterQueryCommonModal>
              <br slot="content">
              <!--                <p slot="content">过滤字段</p>-->
              <!--                <Select slot="content">-->
              <!--                  <Option></Option>-->
              <!--                </Select>-->

              <!--                <Button class="margin3" type="primary" slot="content">编辑过滤字段</Button>-->
            </Panel>
            <Panel name="2" style>样式设置
              <!-- <Row slot="content" class="margin-p" type="flex" align="middle">
              <Col  span="12" style="text-align: left">
                <Checkbox v-model="autofitWidth">自适应列宽</Checkbox>
              </Col>
              <Col span="4">
                  设置行高
              </Col>
              <Col span="8">
                  <Input type="number" v-model="setHeight" />
              </Col>
              </Row>-->
              <Row slot="content" class="margin-p" type="flex" align="middle">
                <Col span="24">
                  <Input
                    type="number"
                    v-model="width"
                    v-if="widthType === 'px'"
                  >
                    <span slot="prepend">列宽</span>
                    <Select v-model="widthType" slot="append" style="width: 70px;">
                      <Option value="%">%</Option>
                      <Option value="px">px</Option>
                    </Select>
                  </Input>
                  <Input
                    type="number"
                    v-model="widthPercent"
                    v-else-if="widthType === '%'"
                  >
                    <span slot="prepend">列宽</span>
                    <Select v-model="widthType" slot="append" style="width: 70px;">
                      <Option value="%">%</Option>
                      <Option value="px">px</Option>
                    </Select>
                  </Input>
                </Col>
              </Row>
              <Row slot="content" class="margin-p" type="flex" align="middle">
                <Col span="12">
                  <Checkbox :disabled="refClass || type === 'index'" v-model="enableSorting">可排序</Checkbox>
                </Col>
                <!--                <Col span="12">-->
                <!--                  <Checkbox :disabled="headerName === '#'" v-model="enableFilter">可定制</Checkbox>-->
                <!--                </Col>-->
              </Row>
              <Row slot="content" class="margin-p" type="flex" align="middle">
                <!--                <Col span="12">-->
                <!--                  <Checkbox-->
                <!--                    :disabled="refClass || (renderType && renderType !== 'NONE') || attrValueType === 'LocalFile' || headerName === '#'"-->
                <!--                    v-model="editable">该列可编辑-->
                <!--                  </Checkbox>-->
                <!--                </Col>-->
                <Col span="12">
                  <Checkbox v-model="lockPinned">冻结该列位置</Checkbox>
                  <RadioGroup v-show="lockPinned" v-model="pinned" type="button" size="small">
                    <Radio label="left">左</Radio>
                    <Radio label="right" :disabled="type === 'index'">右</Radio>
                  </RadioGroup>
                </Col>
              </Row>

              <Row slot="content" class="margin-p" type="flex" align="middle">
                <div class="margin1">
                  <div style="text-align: center">
                    <Button
                      :type="alignCode == 0 ? 'primary' : 'default'"
                      style="height: 20px; width: 20px;padding: 0;margin-top:0px;"
                      @click="alignCode = 0"
                    ></Button>
                    <Button
                      :type="alignCode == 3 ? 'primary' : 'default'"
                      style="height: 20px; width: 20px;padding: 0;margin-top:0px;"
                      @click="alignCode = 3"
                    ></Button>
                    <Button
                      :type="alignCode == 6 ? 'primary' : 'default'"
                      style="height: 20px; width: 20px;padding: 0;margin-top:0px;"
                      @click="alignCode = 6"
                    ></Button>
                  </div>
                  <div style="text-align: center ">
                    <Button
                      :type="alignCode == 1 ? 'primary' : 'default'"
                      style="height: 20px; width: 20px;padding: 0;margin-top:0px;"
                      @click="alignCode = 1"
                    ></Button>
                    <Button
                      :type="alignCode == 4 ? 'primary' : 'default'"
                      style="height: 20px; width: 20px;padding: 0;margin-top:0px;"
                      @click="alignCode = 4"
                    ></Button>
                    <Button
                      :type="alignCode == 7 ? 'primary' : 'default'"
                      style="height: 20px; width: 20px;padding: 0;margin-top:0px;"
                      @click="alignCode = 7"
                    ></Button>
                  </div>
                  <div style="text-align: center">
                    <Button
                      :type="alignCode == 2 ? 'primary' : 'default'"
                      style="height: 20px; width: 20px;padding: 0;margin-top:0px;"
                      @click="alignCode = 2"
                    ></Button>
                    <Button
                      :type="alignCode == 5 ? 'primary' : 'default'"
                      style="height: 20px; width: 20px;padding: 0;margin-top:0px;"
                      @click="alignCode = 5"
                    ></Button>
                    <Button
                      :type="alignCode == 8 ? 'primary' : 'default'"
                      style="height: 20px; width: 20px;padding: 0;margin-top:0px;"
                      @click="alignCode = 8"
                    ></Button>
                  </div>
                </div>
              </Row>
            </Panel>
          </Collapse>
          <br>
        </TabPane>
        <TabPane label="显示模式" tab="simpleTableConfig" name="display" :disabled="type === 'index'" style="height: 300px;position: relative;">
          <Form class="margin1">
            <Select v-model="renderType">
              <Option
                v-for="type in renderList"
                :value="type.value"
                :key="type.name"
              >{{ type.name }}
              </Option>
            </Select>
          </Form>
          <Form v-show="renderType=='timeTransferRender'" class="margin1">
            <Select v-model="cellParams.timeTransferFormat" placeholder="请选择日期格式">
              <Option value="YYYYMMDD" key="1" label="年月日">
                <span>年月日</span>
                <span style="float:right;color:#ccc">YYYY-MM-DD</span>
              </Option>
              <Option value="hhmmss" key="2" label="时分秒">
                <span>时分秒</span>
                <span style="float:right;color:#ccc">hh:mm:ss</span>
              </Option>
              <Option value="YYYYMMDDhhmmss" key="3" label="年月日时分秒">
                <span>年月日时分秒</span>
                <span style="float:right;color:#ccc">YYYY-MM-DD hh:mm:ss</span>
              </Option>
            </Select>
          </Form>
          <Form v-show="renderType=='progressBarRender'" class="margin1">
            <Input v-model="cellParams.progressScale" placeholder="请输入进度条100%时单元格的取值"/>
          </Form>
          <Form v-show="renderType=='escapeSubstitute'" class="margin1">
            <Input v-model="cellParams.escapeObjectStr" type="textarea" :autosize="true"
                   placeholder='{"oriStr_1": "targetStr_1", "oriStr_2": "targetStr_2"}'/>
            <span>请注意源字符串应使用双引号</span>
          </Form>
          <Form v-show="renderType=='customTransferRender'" class="margin1">
            <Input v-model="cellParams.customTransferFunc" type="textarea" :autosize="true" placeholder='return value'/>
            <span>处理value返回自定义值</span>
          </Form>
        </TabPane>
      </Tabs>
    </div>
  </Modal>
</template>


<script>
import {
  progressBarRender,
  checkboxRender,
  dynamicDigitalRender,
  timeTransferRender,
  operationRender,
  escapeRender,
  customTransferRender
} from "@/ext_components/form/gridCellRenders";
import {mapActions, mapGetters} from "vuex";
import {SYS_ENTITY_ATTRIBUTES, SYS_RELATION_ATTRIBUTES} from '@/libs/utils.js';
import FilterQueryCommonModal from '@/ext_components/form/subcomponent/FilterQueryCommonModal';

export default {
  name: 'ColumnConfig',
  props: [
    'store',
    'all_class',
    'all_relations',
    'all_intEntities',
    'all_extEntities',
    'itemValue',
    'args'
  ],
  components: {
    FilterQueryCommonModal
  },
  data() {
    return {
      text: "",
      spinShow: false,
      booleanTrue: true,
      valueGetter: null,
      params: null,
      showPanel: false,
      showGeneralPanel: true,
      tabName: "config",
      collapsePage: "1",
      attrValueType: '',
      alignCode: 4,
      appointGroup: true, //指定为用户组
      appointUser: false, //指定为用户
      // 自适应列宽和自动换行
      autofitWidth: null,
      autoHeight: true, // 暂时不好用
      setHeight: 25,
      enableSorting: null,
      enableFilter: null,

      // 需要与当前colDef做确认的内容
      editable: false,
      lockPinned: false,
      pinned: 'left',
      headerName: "", // headerName

      renderType: "",
      renderList: [
        {
          name: "无",
          value: "NONE"
        },
        {
          name: "进度条",
          value: "progressBarRender"
        },
        {
          name: "勾选框",
          value: "checkboxRender"
        },
        {
          name: "时间转换",
          value: "timeTransferRender"
        },
        {
          name: "替换显示内容",
          value: "escapeSubstitute"
        },
        {
          name: "自定义转换",
          value: "customTransferRender"
        }
      ],

      // 用于在实例中记录cellRender的参数 传递到colDef中对应对象cellRendererParams
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
      allUserList: [],
      allGroupsList: [],
      allGroupsUsersList: [],
      // 关于引用类的配置
      refClass: "",
      refClassType: "",
      browseAttr: "",
      returnAttr: "",
      returnAttrMulti: false,
      returnAttrDisabled: false,
      refClassAttrs: [],

      refClassAttrs_sys: null,
      refClassAttrs_def: null,
      refClassAttrs_relationSys: null,
      refClassAttrs_relationDef: null,
      refClassAttrs_leftSys: null,
      refClassAttrs_leftDef: null,
      refClassAttrs_rightSys: null,
      refClassAttrs_rightDef: null,
      type: '',
      width: 200,
      widthType: 'px',
      widthPercent: 0,
      filterQuery: '',
    };
  },

  mounted() {

  },

  created() {

  },


  methods: {
    ...mapActions("DWF_form", [
      "queryEntity",
    ]),

    initColumnDefinition(definitions, table) {
      this.table = table;
      let gridWidth = this.table.$el.offsetWidth;
      this.definitions = definitions;
      this.type = definitions.type;
      this.colId = definitions.colId;
      this.headerName = definitions.title;
      this.width = definitions.width || 0;
      this.widthType = definitions.widthType || 'px';
      if(this.widthType === '%'){
        this.widthPercent = definitions.widthPercent;
        this.widthPercent < 1 ? 1 : this.widthPercent;
        this.width = Math.floor(gridWidth * this.widthPercent / 100);
      }else{
        this.width < 30 ? 30 : this.width;
        this.widthPercent = Math.floor(this.width * 100 / gridWidth);
      }
      this.lockPinned = !!definitions.fixed;
      this.pinned = definitions.fixed;
      this.enableSorting = definitions.sortable;
      this.renderType = definitions.renderType;
      this.alignCode = definitions.alignCode;
      this.attrValueType = definitions.attrValueType;
      // this.cellRendererParams = definitions.cellRendererParams;
      this.refClass = definitions.refClass;
      this.editable = definitions.editable;
      this.refClassType = definitions.refClassType;
      this.browseAttr = definitions.browseAttr;
      this.returnAttr = definitions.returnAttr;
      this.filterQuery = definitions.filterQuery;
      definitions.cellParams ? this.cellParams = definitions.cellParams : '';
      this.showPanel = true;
    },

    classNameDecorator(oriClassName) {
      // 用于保证选择名称的下拉框正常工作
      if (typeof oriClassName == "string") return oriClassName.split('\&')[0];
      else return "";
    },

    refClassChanged(value) {
      if (this.all_class.findIndex(item => item.className === value) !== -1) {
        this.refClassType = 'obj';
      } else if (this.all_extEntities.findIndex(item => item.className === value) !== -1) {
        this.refClassType = 'ex';
      } else {
        this.refClassType = 'relation';
      }
    },

    apply() {
      // this.params.colDef.enableSorting = this.enableSorting;
      // this.params.colDef.enableFilter = this.enableFilter;
      // this.params.colDef.editable = this.editable;
      // this.params.colDef.lockPinned = this.lockPinned;
      // this.params.colDef.pinned = this.params.colDef.lockPinned ? this.pinned : null;
      // this.params.colDef.alignCode = this.alignCode;
      // this.params.colDef.attrValueType = this.attrValueType;
      // this.gridOptions.rowHeight = this.setHeight;
      //替换为引用类的valueType
      //this.renderType = this.refClassAttrs.filter(item => item.attributeName === this.returnAttr)[0].valueType;

      // 设置引用类以后，不可排序
      // if (this.refClass) this.params.colDef.enableSorting = this.enableSorting = false;
      // 设置引用或渲染类型后 该列不可编辑
      // if (this.refClass || (this.renderType && this.renderType !== 'NONE')) this.params.colDef.editable = false;
      let lastId = this.table.args.columnDefs[this.table.args.columnDefs.length - 1].colId;
      this.widthPercent = this.widthPercent < 1 ? 1 : this.widthPercent;
      if(this.colId === lastId){
        this.width = this.width < 0 ? 0 : this.width;
      }else{
        this.width = this.width < 30 ? 30 : this.width;
      }
      if (this.widthType === '%') {
        let gridWidth = this.table.$el.offsetWidth;
        this.width = Math.floor(gridWidth * this.widthPercent / 100);
      }
      this.definitions.title = this.headerName;
      this.definitions.width ? this.definitions.width = this.width : '';
      this.definitions.widthType = this.widthType;
      this.definitions.widthPercent = this.widthPercent;
      this.definitions.refClass = this.refClass;
      this.definitions.refClassType = this.refClassType;
      this.definitions.browseAttr = this.browseAttr;
      this.definitions.returnAttr = this.returnAttr;
      this.definitions.fixed = this.lockPinned ? this.pinned : null;
      this.definitions.sortable = this.refClass ? false : this.enableSorting;
      this.definitions.cellParams = this.cellParams;
      this.definitions.renderType = this.renderType;
      this.definitions.alignCode = this.alignCode;
      this.definitions.className = `simple-table-column-align${this.alignCode}`;
      this.definitions.filterQuery = this.filterQuery;
      // this.definitions.cellRendererParams = this.cellParams;
      if (this.returnAttr && this.returnAttr.length === 1) {
        let returnAttrObj = this.refClassAttrs_def.concat(this.refClassAttrs_sys).concat(this.refClassAttrs_relationSys).concat(this.refClassAttrs_relationDef).find(attr => attr && attr.attributeName === this.returnAttr[0]);
        if (returnAttrObj.valueType !== 'Date' && returnAttrObj.valueType !== 'TimeStamp') {
          this.definitions.returnAttrType = returnAttrObj.valueType;
          this.definitions.renderType = null;
        }
        //对显示类型为int，原表类型为TimeStamp和Date类型的数据做处理，避免数字类型被当做时间戳展示
        // if (col.refClass && col.returnAttrType && col.returnAttrType !== 'Date' && col.returnAttrType !== 'TimeStamp') {
        //   _renderType = 'NONE';
        // }
      }
      this.$emit('applyColumnConfig', this.definitions);
      this.resetConfigFields()
    },

    leftAlign() {
      if (!this.params.colDef.cellStyle) this.params.colDef.cellStyle = {};
      this.params.colDef.headerClass = 'grid-header-left';
      this.params.colDef.cellStyle["text-align"] = "left";
    },

    rightAlign() {
      if (!this.params.colDef.cellStyle) this.params.colDef.cellStyle = {};
      this.params.colDef.headerClass = 'grid-header-right';
      this.params.colDef.cellStyle["text-align"] = "right";
    },

    centralAlign() {
      if (!this.params.colDef.cellStyle) this.params.colDef.cellStyle = {};
      this.params.colDef.headerClass = 'grid-header-center';
      this.params.colDef.cellStyle["text-align"] = "center";
    },

    middleAlign() {
      if (!this.params.colDef.cellStyle) this.params.colDef.cellStyle = {};
      this.params.colDef.cellStyle["line-height"] =
        this.gridOptions.rowHeight + "px";
    },

    upAlign() {
      if (!this.params.colDef.cellStyle) this.params.colDef.cellStyle = {};
      this.params.colDef.cellStyle["line-height"] =
        0.4 * this.gridOptions.rowHeight + "px";
    },

    downAlign() {
      if (!this.params.colDef.cellStyle) this.params.colDef.cellStyle = {};
      this.params.colDef.cellStyle["line-height"] =
        1.6 * this.gridOptions.rowHeight + "px";
    },

    cancel() {
      this.showPanel = false;
    },

    resetAttribute() {
      this.refClassAttrs_sys = null;
      this.refClassAttrs_def = null;
      this.refClassAttrs_relationSys = null;
      this.refClassAttrs_relationDef = null;
      this.refClassAttrs_leftSys = null;
      this.refClassAttrs_leftDef = null;
      this.refClassAttrs_rightSys = null;
      this.refClassAttrs_rightDef = null;
    },

    inputQuery() {
      let suffix = '';
      switch (this.refClassType) {
        case 'obj':
          suffix = 'en';
          break;
        case 'ex':
          suffix = 'ex_en';
          break;
        case 'relation':
          suffix = 're';
          break;
        default:
          suffix = 'en';
          break;
      }
      this.$refs.filterQuery_modal.initModal(this.filterQuery, this.refClass, '', false, suffix);
    },

    getFilterQuery(finallyFilterQuery) {
      this.filterQuery = finallyFilterQuery;
    },

    resetConfigFields(){
      // this.refClass = '';
      // this.refClassType = '';
      // this.browseAttr = '';
      // this.returnAttr = '';
      this.$refs.refClass.clearSingleSelect();
      this.$refs.browseAttr.clearSingleSelect();
      this.$refs.returnAttr.clearSingleSelect();
    }
  },
  computed: {
    ...mapGetters("DWF_form", [
      "Entities",
      "Relations",
      "EntityAttrList"
    ]),
  },
  watch: {
    async refClass(val, oldVal) {
      if (oldVal) {
        this.browseAttr = null;
        this.returnAttr = null
        this.filterQuery = '';
      }
      if (!val) {
        this.resetAttribute();
        this.filterQuery = '';
        return;
      }
      this.refClassAttrs = [];
      await this.queryEntity(this.refClass);
      this.EntityAttrList(this.refClass).forEach(x => {
        this.refClassAttrs.push({
          id: x.id,
          displayName: x.displayName,
          attributeName: x.attributeName,
          valueType: x.valueType
        });
      });
      this.resetAttribute();
      if (this.all_class.filter(item => item.className == this.refClass).length !== 0) {
        this.refClassAttrs_sys = this.refClassAttrs.filter(item => SYS_ENTITY_ATTRIBUTES(item) !== -1);
        this.refClassAttrs_def = this.refClassAttrs.filter(item => SYS_ENTITY_ATTRIBUTES(item) === -1);
        if (this.refClass == 'User') {
          this.refClassAttrs_def = this.refClassAttrs_def.filter(item => ['isFrozen', 'password', 'expiredTime'].indexOf(item.attributeName) === -1)
        }
      } else {
        this.refClassAttrs_relationSys = this.refClassAttrs.filter(item => SYS_RELATION_ATTRIBUTES(item) !== -1);
        this.refClassAttrs_relationDef = this.refClassAttrs.filter(item => SYS_RELATION_ATTRIBUTES(item) === -1);
      }
      this.$refs.browseAttr.clearSingleSelect();
      this.$refs.returnAttr.clearSingleSelect();
    },

    browseAttr(val) {
      this.returnAttrMulti = val === 'oid';
    },
  }
};
</script>

<style scoped>
p {
  margin-bottom: 8px;
  margin-top: 15px;
}

.margin-p {
  margin-bottom: 8px;
  margin-top: 15px;
}

button {
  margin-top: 36px;
}
</style>
