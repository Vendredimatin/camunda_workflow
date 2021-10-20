<template id="demo">
  <div v-if="showPanel">
    <Modal
      v-model="showPanel"
      title="列定制面板"
      style="height: 500px;"
      mask-closable="false"
      @on-ok="apply"
      @on-cancel="cancel"
    >
      <div>
        <!-- <Button type="primary" @click="printParams">display all Params</Button> -->
        <Input v-model="headerName"/>
        <Tabs>
          <TabPane label="基本配置" name="config">
            <Collapse simple :value="collapsePage" accordion>
              <Panel name="1" v-show="colId !== '_SNColumn'">引用设置
                <p slot="content">引用类</p>
                <Select slot="content" v-model="refClass" clearable filterable @on-change="refClassChanged">
                  <OptionGroup label="实体类">
                    <Option
                            v-for="item in all_intEntities"
                            :key="item.className"
                            :value="item.className"
                            :label="item.displayName"
                    >
                      <span >{{ item.displayName }}</span>
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
                      <span >{{ item.displayName }}</span>
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
                    <span >{{ item.displayName }}</span>
                    <span style="float:right;color:#ccc">{{ classNameDecorator(item.className) }}</span>
                    </Option>
                  </OptionGroup>
                </Select>

                <p slot="content">回填字段（引用类中对应的属性）</p>
                <!-- 英文名为browseAttr 是引用类中 与目前操作的列属性相同的属性名 -->
                <Select slot="content" v-model="browseAttr" clearable filterable :transfer="booleanTrue">
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
                <Select slot="content" v-model="returnAttr" clearable filterable multiple :transfer="booleanTrue">

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
                    <Checkbox :disabled="refClass || colId === '_SNColumn'"  v-model="enableSorting">可排序</Checkbox>
                  </Col>
                  <Col span="12">
                    <Checkbox :disabled="colId === '_SNColumn'" v-model="enableFilter">可定制</Checkbox>
                  </Col>
                </Row>
                <Row slot="content" class="margin-p" type="flex" align="middle">
                  <!-- <Col span="12">
                  <Checkbox v-model="addCheckbox">增加勾选框</Checkbox>
                  </Col>-->
                  <Col span="12">
                    <Checkbox :disabled="refClass || (renderType && renderType !== 'NONE') || attrValueType === 'LocalFile' || colId === '_SNColumn'" v-model="editable">该列可编辑</Checkbox>
                  </Col>
                  <Col span="12">
                    <Checkbox v-model="lockPinned">冻结该列位置</Checkbox>
                    <RadioGroup v-show="lockPinned" v-model="pinned" type="button" size="small">
                      <Radio label="left">左</Radio>
                      <Radio label="right" :disabled="colId === '_SNColumn'">右</Radio>
                    </RadioGroup>
                  </Col>
                </Row>

                <Row slot="content" class="margin-p" type="flex" align="middle">
                  <!-- <Col span="12" >
                  <ButtonGroup class="btng">
                    <Button type="primary" class="btn-margin" @click="leftAlign">左对齐</Button>
                    <Button type="primary" class="btn-margin" @click="centralAlign">中对齐</Button>
                    <Button type="primary" class="btn-margin" @click="rightAlign">右对齐</Button>
                  </ButtonGroup>
                </Col>
                <Col span="12">
                  <ButtonGroup vertical class="btng">
                    <Button type="primary" class="btn-margin" @click="upAlign">上对齐</Button>
                    <Button type="primary" class="btn-margin" @click="middleAlign">中对齐</Button>
                    <Button type="primary" class="btn-margin" @click="downAlign">下对齐</Button>
                  </ButtonGroup>
                  </Col>-->
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
          <TabPane label="显示模式" name="display" :disabled="colId === '_SNColumn'" style="height: 300px;position: relative;">
            <Form class="margin1">
              <Select v-model="renderType">
                <Option
                        v-for="type in renderList"
                        :value="type.value"
                        :key="type.name"
                >{{type.name}}</Option>
              </Select>
            </Form>
            <!--            <Form v-show="renderType=='userGroupRender'" class="margin1">-->
            <!--              <Spin fix v-if="spinShow"></Spin>-->
            <!--              <RadioGroup v-model="cellParams.userGroupType" @on-change="userGroupTypeChange">-->
            <!--                <Radio label="group">用户组</Radio>-->
            <!--                <Radio label="user">用户</Radio>-->
            <!--              </RadioGroup>-->
            <!--              <p class="margin1">类型</p>-->
            <!--              <Select v-model="cellParams.userGroupAttr">-->
            <!--                <Option-->
            <!--                        v-for="(attr, index) in cellParams.userGroupAttrs"-->
            <!--                        :value="attr.value"-->
            <!--                        :key="index"-->
            <!--                >{{attr.name}}</Option>-->
            <!--              </Select>-->
            <!--            </Form>-->
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

              <!--              <Input-->
              <!--                class="margin1"-->
              <!--                number-->
              <!--                v-model="cellParams.refreshPeriod"-->
              <!--                @on-blur="validateRefreshPeriod"-->
              <!--              >-->
              <!--                <Select-->
              <!--                  v-model="cellParams.refreshScale"-->
              <!--                  slot="append"-->
              <!--                  style="width: 100px;"-->
              <!--                  @on-change="validateRefreshPeriod"-->
              <!--                >-->
              <!--                  <Option value="ms">ms</Option>-->
              <!--                  <Option value="s">s</Option>-->
              <!--                </Select>-->
              <!--              </Input>-->
            </Form>
            <Form v-show="renderType=='escapeSubstitute'" class="margin1">
              <Input v-model="cellParams.escapeObjectStr" type="textarea" :autosize="true" placeholder='{"oriStr_1": "targetStr_1", "oriStr_2": "targetStr_2"}'/>
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
  </div>
</template>


<script>
import Vue from "vue/dist/vue.min.js";
import iView from "iview/dist/iview.min.js"; // 导入组件库
import "iview/dist/styles/iview.css"; // 导入样式
import {
  progressBarRender,
  checkboxRender,
  // userGroupRender,
  dynamicDigitalRender,
  timeTransferRender,
  operationRender,
  escapeRender,
  customTransferRender
} from "./gridCellRenders.js";
import {mapGetters, mapActions} from "vuex";
import { getEobj, getEJobj, getAllRelations, getAllUsers, getAllUserTree, getUserFromGroup, getAllInternalEntities, getAllExternalEntities } from "@/api/others.js";
import { SYS_ENTITY_ATTRIBUTES, SYS_RELATION_ATTRIBUTES } from '@/libs/utils.js';
import FilterQueryCommonModal from '@/ext_components/form/subcomponent/FilterQueryCommonModal';
Vue.use(iView);

export default Vue.extend({
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
      showPanel: true,
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
      addCheckbox: null,
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
        // {
        //   name: "组织用户",
        //   value: "userGroupRender"
        // },
        {
          name: "时序动态数字",
          value: "dynamicDigitalRender"
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
      all_class: [],
      all_relations: [],
      all_intEntities: [],
      all_extEntities: [],
      width: 200,
      widthType: 'px',
      widthPercent: 0,
      colId: '',
      itemValue: {},
      root: {},
      store: {},
      args: {},
      filterQuery: '',
    };
  },

  mounted() {
    let that = this;
    this.$store = this.params.getStore();
    this.colId = this.params.colDef.colId;
    this.headerName = this.params.colDef.headerName;
    this.width = this.params.colDef.width;
    this.widthType = this.params.colDef.widthType;
    this.widthPercent = this.params.colDef.widthPercent;
    this.enableSorting = false || this.gridOptions.enableSorting;
    this.enableFilter = this.params.colDef.enableFilter;
    this.addCheckbox = false || this.params.colDef.checkboxSelection;
    this.lockPinned = this.params.colDef.lockPinned;
    this.pinned = this.params.colDef.pinned || 'left';
    this.renderType = this.params.colDef._cellRendererFramework == 'userGroupRender' ? '' : this.params.colDef._cellRendererFramework;
    this.alignCode = this.params.colDef.alignCode;
    this.attrValueType = this.params.colDef.attrValueType;
    for (let par in this.params.colDef.cellRendererParams) {
      if (par in this.cellParams)
        this.cellParams[par] = this.params.colDef.cellRendererParams[par];
    }
    // this.cellParams.userGroupMap = this.params.getUserGroupMap();
    this.refClass = this.params.colDef.refClass;
    this.editable = this.params.colDef.editable;
    this.refClassType = this.params.colDef.refClassType;
    this.browseAttr = this.params.colDef.browseAttr;
    this.returnAttr = this.params.colDef.returnAttr;
    this.filterQuery = this.params.colDef.filterQuery;
  },

  async created() {
    // 为关联信息做准备
    // if(this.params&&this.params.theGrid) console.log('Entities when mount filter', this.params.theGrid.Entities());
    // if (this.params && this.params.Entities);
    //   console.log("Entities when mount filter", this.params.Entities());
    if(this.params.all_class.length==0){
      this.all_class = this.params.Entities().filter(x=> typeof x.className == "string");
    }else{
      this.all_class = this.params.all_class;
    }
    // 读取params中的all_class all_relations 如果没有就重新从后台拉取
    if (this.params.all_relations.length==0){

      let allRe = this.Relations();
      console.log(allRe);
      if(allRe && allRe.length > 0) {
        this.all_relations = allRe;
      } else {
        this.all_relations = await getAllRelations();
        this.all_relations = this.all_relations.data.data;
      }

    } else {
      this.all_relations = this.params.all_relations;
    }
    console.log("all_class, all_relations@created", this.all_class, this.all_relations);

    this.all_intEntities = await getAllInternalEntities();
    this.all_intEntities = this.all_intEntities.data.data;
    this.all_extEntities = await getAllExternalEntities();
    this.all_extEntities = this.all_extEntities.data.data;
    console.log("all_intEntities, all_extEntities@created", this.all_intEntities, this.all_extEntities);
  },


  methods: {
    userGroupTypeChange(val){
      if(val === 'user'){
        this.cellParams.userGroupAttrs = [
          {name: '中文', value: 'displayName'},
          {name: '英文', value: 'name'},
          {name: 'oid', value: 'oid'}
        ]
      }else{
        this.cellParams.userGroupAttrs = [
          {name: '中文', value: 'displayName'},
          {name: 'oid', value: 'oid'}
        ]
      }
    },
    classNameDecorator(oriClassName){
      // 用于保证选择名称的下拉框正常工作
      if (typeof oriClassName == "string") return oriClassName.split('\&')[0];
      else return "";
    },
    refClassChanged(value){
      this.refClassType = this.all_class.findIndex(item => item.className === value) !== -1 ? 'obj' : 'relation';
    },
    changeRenderToProgressbar() {
      this.columnDefs.forEach(x => {
        if (x.colId == this.params.colDef.colId)
          x.cellRendererFramework = progressBarRender;
      });
    },

    apply() {
      //  控件值写到实例中

      //  双向检查
      this.params.colDef.checkboxSelection = this.addCheckbox;
      this.params.colDef.enableSorting = this.enableSorting;
      this.params.colDef.enableFilter = this.enableFilter;
      this.params.colDef.editable = this.editable;
      this.params.colDef.lockPinned = this.lockPinned;
      this.params.colDef.pinned = this.params.colDef.lockPinned ? this.pinned : null;
      this.params.colDef.headerName = this.headerName;
      this.params.colDef.alignCode = this.alignCode;
      this.params.colDef.attrValueType = this.attrValueType;
      // this.gridOptions.rowHeight = this.setHeight;
      //替换为引用类的valueType
      //this.renderType = this.refClassAttrs.filter(item => item.attributeName === this.returnAttr)[0].valueType;

      //获取展示属性类型
      if(this.returnAttr && this.returnAttr.length === 1){
        let returnAttrObj = this.refClassAttrs_def.concat(this.refClassAttrs_sys).concat(this.refClassAttrs_relationSys).concat(this.refClassAttrs_relationDef).find(attr => attr && attr.attributeName === this.returnAttr[0]);
        if(returnAttrObj.valueType !== 'Date' && returnAttrObj.valueType !== 'TimeStamp'){
          this.params.colDef.returnAttrType = returnAttrObj.valueType;
          this.applyRenderConfig('NONE');
        }else{
          this.applyRenderConfig(this.renderType);
        }
      }else{
        //  选择cell的渲染器
        this.applyRenderConfig(this.renderType);
      }
      // 写入引用信息到colDef
      this.params.colDef.refClass = this.refClass;
      this.params.colDef.refClassType = this.refClassType;
      this.params.colDef.browseAttr = this.browseAttr;
      this.params.colDef.returnAttr = this.returnAttr;
      this.params.colDef.widthType = this.widthType;
      this.params.colDef.widthPercent = this.widthPercent;
      this.params.colDef.filterQuery = this.filterQuery;
      if(this.widthType === '%'){
        let gridWidth = this.params.grid.$el.offsetWidth;
        this.width = this.params.colDef.width = Math.floor(gridWidth * this.widthPercent / 100);
      }else{
        this.params.colDef.width = this.width < 30 ? 30 : this.width;
      }
      //
      this.$nextTick(() => {
        this.params.columnApi().setColumnWidth(this.params.colDef.colId, this.width, false);
      });
      // 设置引用类以后，不可排序
      if (this.refClass) this.params.colDef.enableSorting = this.enableSorting = false;
        // 设置引用或渲染类型后 该列不可编辑
      if (this.refClass || (this.renderType && this.renderType !== 'NONE')) this.params.colDef.editable = false;

      // 数据流向: 实例 -> params.colDef -> columnDefs
      // console.log("before apply defs", this.columnDefs);
      this.applyColumnModification(this.params.colDef);
      if (this.hidePopup) this.hidePopup();
      // console.log('after apply defs', this.columnDefs);

      // this.params.api.setColumnDefs(this.columnDefs);
      this.params.mergeColumnDefs(this.columnDefs);
      this.params.reloadGridFilter();
      // 设置到theGrid.args用于保存 但这个做法较为危险
      // 真的会产生bug 比如gridOptions中有api等递归元素
      // for (var x in this.gridOptions) {
      //   // console.log('theGrid at apply', this.params.theGrid);
      //   // console.log('gridOptions[x]', x, this.gridOptions[x], typeof this.gridOptions[x]);
      //   // if (typeof this.gridOptions[x] != "object") this.params.theGrid.args[x] = this.gridOptions[x];
      //   if (typeof this.gridOptions[x] != "object")
      //     this.params.args[x] = this.gridOptions[x];
      // }

      // this.params.theGrid.freshData();
      this.params.freshData(null, false);
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
      //  考虑增加destroy接口对其进行销毁
      this.hidePopup();
      this.showPanel = false;
    },

    applyColumnModification(_colDef) {
      //TODO: apply前面的部分只是将控件值写入到实例，而该函数将实例值写到ColumnDefs
      this.params.getColumnDefs().forEach(col => {
        if (col.colId == _colDef.colId) {
          Object.keys(_colDef).forEach(attr => {
            col[attr] = _colDef[attr];
          });
          col["_cellRendererFramework"] = this.renderType; // 用于`序列化`cellRender, 以备读取json后渲染, cellRender相关配置项cellParams自身不需要再序列化
        }
      });
    },

    applyRenderConfig(_renderType, _outColDef = null) {
      // cellRendererParams 是ag-grid固定的接口传入相关参数 在cellRender中通过params访问

      // 用于给渲染器调用刷新函数
      let that = this;

      let _the_colDef;
      // if (!_outColDef) {
      //   _the_colDef = this.params.colDef;
      // } else {
      //   _the_colDef = _outColDef;
      // }

      _the_colDef = this.params.colDef;
      if(!this.params.colDef.cellRendererParams) this.params.colDef.cellRendererParams = {};
      Object.assign(this.params.colDef.cellRendererParams, this.cellParams);
      // console.log("_the_colDef@applyRenderConfig", _the_colDef);
      switch (_renderType) {
        case "progressBarRender":
          _the_colDef.cellRendererFramework = progressBarRender;
          break;
        case "checkboxRender":
          _the_colDef.cellRendererFramework = checkboxRender;
          break;
        case "userGroupRender":
          // _the_colDef.cellRendererFramework = userGroupRender;
          break;
        case "dynamicDigitalRender":
          // _the_colDef.cellRenderer = "agAnimateShowChangeCellRenderer";
          break;
        case "timeTransferRender":
          _the_colDef.cellRendererFramework = timeTransferRender;
          break;
        case "operationRender":
          _the_colDef.cellRendererFramework = operationRender;
          break;
        case "escapeSubstitute":
          _the_colDef.cellRendererFramework = escapeRender;
          break;
        case "customTransferRender":
          _the_colDef.cellRendererFramework = customTransferRender;
          break;
        case "NONE":
          _the_colDef.cellRendererFramework = null;
          break;
        default:
          break;
      }
    },

    applyRenderOutside(_colDef) {
      // 用于解耦Grid.vue中和CellRender相关的部分
      if (_colDef._cellRendererFramework) {
        this.applyRenderConfig(_colDef._cellRendererFramework, _colDef);
      }
    },

    callPanel() {
      this.showPanel = true;
    },

    printParams() {
      // console.log("clicked do this, params:", this.params);
      // console.log("columnDefs", this.columnDefs);
      // console.log("gridOptions", this.gridOptions);
      // console.log("refClassAttrs", this.refClassAttrs);
    },

    isFilterActive() {
      return this.text !== null && this.text !== undefined && this.text !== "";
    },

    doesFilterPass(params) {
      return (
        !this.text ||
        this.text
          .toLowerCase()
          .split(" ")
          .every(filterWord => {
            return (
              this.valueGetter(params.node)
                .toString()
                .toLowerCase()
                .indexOf(filterWord) >= 0
            );
          })
      );
    },

    getModel() {
      return { value: this.text };
    },

    setModel(model) {
      if (model) {
        this.text = model.value;
      }
    },

    afterGuiAttached(params) {
      let colDef = this.params.getColumnDefs().find(col => col.colId === this.params.colDef.colId);
      let gridWidth = this.params.grid.$el.offsetWidth;
      this.width = colDef.width;
      this.widthType = colDef.widthType || 'px';
      this.widthPercent = colDef.widthPercent ||  Math.floor(this.width * 100 / gridWidth);
      this.hidePopup = params.hidePopup;
      this.showPanel = true;
      this.itemValue = this.params.getItemValue();
      this.root = this.params.getRoot();
      this.store = this.params.getStore();
      this.args = this.params.getArgs();
      // this.$refs.input.focus();
    },

    componentMethod(message) {},

    setAlign() {
      console.log("realign");
    },

    getColumnDefs() {
      // return this.params.theGrid.args.columnDefs;
      return this.params.api.gridOptionsWrapper.gridOptions.columnDefs;
    },

    async queryEntityAttr() {
      // return await this.params.theGrid.queryEntity(this.refClass);
      return await this.params.queryEntity(this.refClass);
    },

    validateRefreshPeriod() {
      let periodByMs =
        this.cellParams.refreshScale == "s"
          ? this.cellParams.refreshPeriod * 1000
          : this.cellParams.refreshPeriod;
      // 范围在 30 - 600000 毫秒间 (0.03-600)s
      periodByMs = periodByMs < 30 ? 30 : periodByMs;
      periodByMs = periodByMs > 600000 ? 600000 : periodByMs;
      this.cellParams.refreshPeriodByMs = periodByMs;

      if (this.cellParams.refreshScale == "ms")
        this.cellParams.refreshPeriod = periodByMs;
      else this.cellParams.refreshPeriod = periodByMs / 1000;
    },

    cascaderFormat(labels, selectedData) {
      const index = labels.length - 1;
      return labels[index];
    },

    resetAttribute(){
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
  },
  computed: {
    ...mapGetters("DWF_form", ["Relations"]),
    gridOptions() {
      return this.params.api.gridOptionsWrapper.gridOptions;
    },
    columnDefs() {
      return this.params.api.gridOptionsWrapper.gridOptions.columnDefs;
    },
    allEntities() {
      // return this.params.theGrid.Entities();
      // return this.params.Entities().filter(x=> typeof x.className == "string");
    },
    // async refClassAttrs(){
    //   return this.params.theGrid.EntityAttrList(this.refClass);
    //   if(!this.params.theGrid.EntityAttrList(this.refClass)
    //   || this.params.theGrid.EntityAttrList(this.refClass).length==0){
    //     await this.params.theGrid.queryEntity(this.refClass);
    //   }
    //   let _mid_ret = this.params.theGrid.EntityAttrList(this.refClass);
    //   console.log('middle _ret', _mid_ret);
    //   let _result = [];
    //   _mid_ret.forEach(x=>{
    //     _result.push({
    //       id: x.id,
    //       displayName: x.displayName,
    //       attributeName: x.attributeName
    //     });
    //   })
    //   console.log('attrs of refClass', _result);
    //   return _result;
    // },
  },
  watch: {
    alignCode: function(val) {
      if (val < 3) this.leftAlign();
      else if (val < 6) this.centralAlign();
      else this.rightAlign();

      if (val == 0 || val == 3 || val == 6) this.upAlign();
      else if (val == 1 || val == 4 || val == 7) this.middleAlign();
      else this.downAlign();
    },

    text: function(val, oldVal) {
      if (val !== oldVal) {
        this.params.filterChangedCallback();
      }
    },

    refClass: function(val, oldVal) {
      if(oldVal){
        this.browseAttr = null;
        this.returnAttr = null;
        this.filterQuery = '';
      }
      if (!val) {
        this.resetAttribute();
        this.filterQuery = '';
        return;
      }
      this.queryEntityAttr().then(() => {
        // let _mid_ret = this.params.theGrid.EntityAttrList(this.refClass);
        let _mid_ret = this.params.EntityAttrList(this.refClass);
        let _result = [];
        _mid_ret.forEach(x => {
          _result.push({
            id: x.id,
            displayName: x.displayName,
            attributeName: x.attributeName,
            valueType: x.valueType
          });
        });
        this.refClassAttrs = _result;
        this.resetAttribute();
        if(this.all_class.filter(item => item.className == this.refClass).length !== 0){
          this.refClassAttrs_sys = _result.filter(item => SYS_ENTITY_ATTRIBUTES(item) !== -1);
          this.refClassAttrs_def = _result.filter(item => SYS_ENTITY_ATTRIBUTES(item) === -1);
          if(this.refClass == 'User'){
            this.refClassAttrs_def = this.refClassAttrs_def.filter(item => ['isFrozen', 'password', 'expiredTime'].indexOf(item.attributeName) === -1)
          }
        }else{
          this.refClassAttrs_relationSys = _result.filter(item => SYS_RELATION_ATTRIBUTES(item) !== -1);
          this.refClassAttrs_relationDef = _result.filter(item => SYS_RELATION_ATTRIBUTES(item) === -1);
        }
      });
    },

    browseAttr(val){
      this.returnAttrMulti = val === 'oid';
      // if(val !== 'oid'){
      //   this.returnAttr = '';
      // }
    },

    // /**
    // *@description监听width设置最小值
    // *@params
    // *@date 2020/8/12
    // *@return
    // */
    // width(val){
    //   this.$nextTick(() => {
    //     this.width = val < 30 ? 30 : this.width;
    //   })
    // }
  }
});
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
.margin3 {
  margin-top: 20px;
  margin-bottom: 20px;
}
.btng {
  margin: 0px;
}
.btn-margin {
  margin: 0px;
}
.cell-wrap-text {
  white-space: normal !important;
}
.ag-cell {
  white-space: normal !important;
}
</style>
