<template>
  <!--  单对象控件  -->
  <Operation
    v-if="name === 'Operation'"
    v-bind="propsData"
    ref="addinComponent"
    class="addin"
  >

  </Operation>
  <TextInput
    v-else-if="name === 'TextInput'"
    v-bind="propsData"
    ref="addinComponent"
    class="addin"
  >

  </TextInput>
  <EncodeInput
    v-else-if="name === 'EncodeInput'"
    v-bind="propsData"
    ref="addinComponent"
    class="addin"
  >

  </EncodeInput>
  <NumberInput
    v-else-if="name === 'NumberInput'"
    v-bind="propsData"
    ref="addinComponent"
    class="addin"
  >

  </NumberInput>
  <DateInput
    v-else-if="name === 'DateInput'"
    v-bind="propsData"
    ref="addinComponent"
    class="addin"
  >

  </DateInput>
  <CheckBox
    v-else-if="name === 'CheckBox'"
    v-bind="propsData"
    ref="addinComponent"
    class="addin"
  >

  </CheckBox>
  <RadioButton
    v-else-if="name === 'RadioButton'"
    v-bind="propsData"
    ref="addinComponent"
    class="addin"
  >

  </RadioButton>
  <Label
    v-else-if="name === 'Label'"
    v-bind="propsData"
    ref="addinComponent"
    class="addin"
  >

  </Label>
  <CompoundLabel
    v-else-if="name === 'CompoundLabel'"
    v-bind="propsData"
    ref="addinComponent"
    class="addin"
  >

  </CompoundLabel>
  <SwitchComponent
    v-else-if="name === 'Switch'"
    v-bind="propsData"
    ref="addinComponent"
    class="addin"
  >

  </SwitchComponent>
  <HyperLink
    v-else-if="name === 'HyperLink'"
    v-bind="propsData"
    ref="addinComponent"
    class="addin"
  >

  </HyperLink>
  <SelectInput
    v-else-if="name === 'SelectInput'"
    v-bind="propsData"
    ref="addinComponent"
    class="addin"
  >

  </SelectInput>
  <Iframe
    v-else-if="name === 'Iframe'"
    v-bind="propsData"
    ref="addinComponent"
    class="addin"
  >

  </Iframe>
  <SingleObjectSelector
    v-else-if="name === 'SingleObjectSelector'"
    v-bind="propsData"
    ref="addinComponent"
    class="addin"
  >

  </SingleObjectSelector>
  <SingleObjectModal
    v-else-if="name === 'SingleObjectModal'"
    v-bind="propsData"
    ref="addinComponent"
    class="addin"
  >

  </SingleObjectModal>
  <MultiObjectsTag
    v-else-if="name === 'MultiObjectsTag'"
    v-bind="propsData"
    ref="addinComponent"
    class="addin"
  >

  </MultiObjectsTag>
  <Attachments
    v-else-if="name === 'Attachments'"
    v-bind="propsData"
    ref="addinComponent"
    class="addin"
  >

  </Attachments>
  <ProgressBar
    v-else-if="name === 'ProgressBar'"
    v-bind="propsData"
    ref="addinComponent"
    class="addin"
  >

  </ProgressBar>
  <D_Rate
    v-else-if="name === 'D_Rate'"
    v-bind="propsData"
    ref="addinComponent"
    class="addin"
  >

  </D_Rate>
  <Liked
    v-else-if="name === 'Liked'"
    v-bind="propsData"
    ref="addinComponent"
    class="addin"
  >

  </Liked>
  <IconComponent
    v-else-if="name === 'icon'"
    v-bind="propsData"
    ref="addinComponent"
    class="addin"
  >

  </IconComponent>
  <DynamicDigitalLabel
    v-else-if="name === 'DynamicDigitalLabel'"
    v-bind="propsData"
    ref="addinComponent"
    class="addin"
  >

  </DynamicDigitalLabel>
  <RichTextEditor
    v-else-if="name === 'RichTextEditor'"
    v-bind="propsData"
    ref="addinComponent"
    class="addin"
  >

  </RichTextEditor>
  <DynamicParameterFrame
    v-else-if="name === 'DynamicParameterFrame'"
    v-bind="propsData"
    ref="addinComponent"
    class="addin"
  >

  </DynamicParameterFrame>
  <MultiFilesList
    v-else-if="name === 'MultiFilesList'"
    v-bind="propsData"
    ref="addinComponent"
    class="addin"
  >

  </MultiFilesList>

  <!--  多对象控件  -->
  <Grid
    v-else-if="name === 'Grid'"
    v-bind="propsData"
    ref="addinComponent"
    class="addin"
  >

  </Grid>
  <SimpleTable
    v-else-if="name === 'SimpleTable'"
    v-bind="propsData"
    ref="addinComponent"
    class="addin"
  >

  </SimpleTable>
  <WatchMessage
    v-else-if="name === 'WatchMessage'"
    v-bind="propsData"
    ref="addinComponent"
    class="addin"
  >

  </WatchMessage>
  <SearchBox
    v-else-if="name === 'SearchBox'"
    v-bind="propsData"
    ref="addinComponent"
    class="addin"
  >

  </SearchBox>
  <FormEngine
    v-else-if="name === 'FormEngine'"
    v-bind="propsData"
    ref="addinComponent"
    class="addin"
  >

  </FormEngine>
  <JoinCascaderTree
    v-else-if="name === 'JoinCascaderTree'"
    v-bind="propsData"
    ref="addinComponent"
    class="addin"
  >

  </JoinCascaderTree>
  <RelationTree
    v-else-if="name === 'RelationTree'"
    v-bind="propsData"
    ref="addinComponent"
    class="addin"
  >

  </RelationTree>
  <SelfJoinsTree
    v-else-if="name === 'SelfJoinsTree'"
    v-bind="propsData"
    ref="addinComponent"
    class="addin"
  >

  </SelfJoinsTree>
  <MultiObjPicture
    v-else-if="name === 'MultiObjPicture'"
    v-bind="propsData"
    ref="addinComponent"
    class="addin"
  >

  </MultiObjPicture>
  <SelfCode
    v-else-if="name === 'SelfCode'"
    v-bind="propsData"
    ref="addinComponent"
    class="addin"
  >

  </SelfCode>

  <!--  时间序列控件  -->
  <TimeSeriesSelect
    v-else-if="name === 'TimeSeriesSelect'"
    v-bind="propsData"
    ref="addinComponent"
    class="addin"
  >

  </TimeSeriesSelect>
  <TimeSeriesCharts
    v-else-if="name === 'TimeSeriesCharts'"
    v-bind="propsData"
    ref="addinComponent"
    class="addin"
  >

  </TimeSeriesCharts>
  <TimeSeriesBoard
    v-else-if="name === 'TimeSeriesBoard'"
    v-bind="propsData"
    ref="addinComponent"
    class="addin"
  >

  </TimeSeriesBoard>

  <!--  模型点选控件  -->
  <OrgUserSelect
    v-else-if="name === 'OrgUserSelect'"
    v-bind="propsData"
    ref="addinComponent"
    class="addin"
  >

  </OrgUserSelect>
  <EntitiesAttrSelect
    v-else-if="name === 'EntitiesAttrSelect'"
    v-bind="propsData"
    ref="addinComponent"
    class="addin"
  >

  </EntitiesAttrSelect>
  <FormSelect
    v-else-if="name === 'FormSelect'"
    v-bind="propsData"
    ref="addinComponent"
    class="addin"
  >

  </FormSelect>

  <!--  可视化控件  -->
  <EchartBar
    v-else-if="name === 'EchartBar'"
    v-bind="propsData"
    ref="addinComponent"
    class="addin"
  >

  </EchartBar>
  <ScatterChart
    v-else-if="name === 'ScatterChart'"
    v-bind="propsData"
    ref="addinComponent"
    class="addin"
  >

  </ScatterChart>
  <PieChart
    v-else-if="name === 'PieChart'"
    v-bind="propsData"
    ref="addinComponent"
    class="addin"
  >

  </PieChart>
  <MapChart
    v-else-if="name === 'MapChart'"
    v-bind="propsData"
    ref="addinComponent"
    class="addin"
  >

  </MapChart>
  <GaugeChart
    v-else-if="name === 'GaugeChart'"
    v-bind="propsData"
    ref="addinComponent"
    class="addin"
  >

  </GaugeChart>
  <DynamicMap
    v-else-if="name === 'DynamicMap'"
    v-bind="propsData"
    ref="addinComponent"
    class="addin"
  >

  </DynamicMap>
  <EChart
    v-else-if="name === 'EChart'"
    v-bind="propsData"
    ref="addinComponent"
    class="addin"
  >

  </EChart>

  <!--  布局控件  -->
  <Row
    v-else-if="name === 'row'"
    v-bind="propsData"
    ref="addinComponent"
    class="addin addin-layout"
  >

  </Row>
  <ColRows
    v-else-if="name === 'colRows'"
    v-bind="propsData"
    ref="addinComponent"
    class="addin addin-layout"
  >

  </ColRows>
  <Col
    v-else-if="name === 'col'"
    v-bind="propsData"
    ref="addinComponent"
    class="addin addin-layout"
  >

  </Col>
  <Tab
    v-else-if="name === 'Tab'"
    v-bind="propsData"
    ref="addinComponent"
    class="addin addin-layout"
  >

  </Tab>
  <GroupBox
    v-else-if="name === 'GroupBox'"
    v-bind="propsData"
    ref="addinComponent"
    class="addin addin-layout"
  >

  </GroupBox>
  <DragLayout
    v-else-if="name === 'DragLayout'"
    v-bind="propsData"
    ref="addinComponent"
    class="addin addin-layout"
  >

  </DragLayout>
  <DragItem
    v-else-if="name === 'DragItem'"
    v-bind="propsData"
    ref="addinComponent"
    class="addin addin-layout"
  >

  </DragItem>
  <!-- sdk控件 -->
  <AssembleAddin
    v-else-if="name === 'AssembleAddin'"
    v-bind="propsData"
    ref="addinComponent"
    class="addin"
  >

  </AssembleAddin>
</template>

<script>

import Operation from './Operation';
import TextInput from './TextInput';
import EncodeInput from './EncodeInput';
import NumberInput from './NumberInput';
import DateInput from './DateInput';
import CheckBox from './CheckBox';
import RadioButton from './RadioButton';
import Label from './Label';
import CompoundLabel from './CompoundLabel';
import SwitchComponent from './Switch';
import HyperLink from './HyperLink';
import SelectInput from './SelectInput';
import Iframe from './Iframe';
import SingleObjectSelector from './SingleObjectSelector';
import SingleObjectModal from './SingleObjectModal';
import MultiObjectsTag from './MultiObjectsTag';
import Attachments from './Attachments';
import ProgressBar from './ProgressBar';
import D_Rate from './D_Rate';
import Liked from './Liked';
import IconComponent from './icon';
import DynamicDigitalLabel from './DynamicDigitalLabel';
import RichTextEditor from './RichTextEditor';
import DynamicParameterFrame from './DynamicParameterFrame';
import MultiFilesList from './MultiFilesList';
import Grid from "./Grid";
import SimpleTable from "./SimpleTable";
import WatchMessage from "./WatchMessage";
import SearchBox from "./SearchBox";
import FormEngine from "./FormEngine";
import JoinCascaderTree from "./JoinCascaderTree";
import RelationTree from "./RelationTree";
import SelfJoinsTree from "./SelfJoinsTree";
import MultiObjPicture from "./MultiObjPicture";
import SelfCode from "./SelfCode";
import TimeSeriesSelect from "./TimeSeriesSelect";
import TimeSeriesCharts from "./TimeSeriesCharts";
import TimeSeriesBoard from "./TimeSeriesBoard";
import OrgUserSelect from "./OrgUserSelect";
import EntitiesAttrSelect from "./EntitiesAttrSelect";
import FormSelect from "./FormSelect";
import EchartBar from "./EchartBar";
import ScatterChart from "./_ScatterChart";
import PieChart from "./_PieChart";
import MapChart from "./_MapChart";
import GaugeChart from "./_GaugeChart";
import DynamicMap from "./DynamicMap";
import EChart from "./EChart";
import Row from "./row";
import ColRows from "./colRows";
import Col from "./col";
import Tab from "./Tab";
import GroupBox from "./GroupBox";
import DragLayout from "./DragLayout";
import DragItem from "./DragItem";
import AssembleAddin from "./AssembleAddin";
import {getQueryOperation} from '@/api/others';
import {entries as form_entries} from "@/ext_components/form/config.js";
import {mapGetters} from "vuex";

export default {
  name: "FormAddinList",
  data() {
    return {
      name: '',
      args: {},
      uuid: '',
      active: false,
      //允许垂直布局的控件，为之前做兼容
      structuralLayoutAddin: [
        'TextInput',
        'HyperLink',
        'NumberInput',
        'DateInput',
        'CheckBox',
        'RadioButton',
        'Label',
        'Switch',
        'SelectInput',
        'SingleObjectSelector',
        'SingleObjectModal',
        'MultiObjectsTag',
        'ProgressBar',
        'D_Rate',
        'Liked',
        'icon',
        'DynamicParameterFrame',
        'MultiFilesList',
        'Attachments',
        'EncodeInput'
      ],
    }
  },
  props: [
    'addin',
    'query',
    'queryData',
    'attributes',
    'store',
    'itemValue',
    'route',
    'root',
    'Message',
    'echarts',
    'formEngine',
    'dwf_ctx',
    'parent'
  ],
  created() {
    this.itemValueCatch = this.itemValue;
    try {
      this.name = this.addin.self.elementType.replace("addin_", "");
      //兼容之前的布局
      if (this.name && this.structuralLayoutAddin.includes(this.name) && !('structural_layout' in this.addin.self.properties)) {
        this.addin.self.properties.structural_layout = 'horizontal';
      }
      //查看权限
      let restrictedAccess = {};
      if (this.addin.self.properties.name) {
        if (this.formEngine.isRelation) {
          for (let prefix of ['left', 'relation', 'right']) {
            if (this.addin.self.properties.name.startsWith(`${prefix}_`)) {
              let originName = this.addin.self.properties.name.replace(new RegExp(`${prefix}_`), '');
              let obj = this.attributes[prefix].filter(item => item.attributeName === originName)[0];
              restrictedAccess.EditObjects = obj && obj.length !== 0 ? obj.restrictedAccess.indexOf('EditObjects') !== -1 : false;
              restrictedAccess.CommonOpAuth = obj && obj.length !== 0 ? obj.restrictedAccess.indexOf('CommonOpAuth') !== -1 : false;
            }
          }
        } else {
          let obj = this.attributes.filter(item => item.attributeName === this.addin.self.properties.name)[0];
          restrictedAccess.EditObjects = obj && obj.length !== 0 ? obj.restrictedAccess.indexOf('EditObjects') !== -1 : false;
          restrictedAccess.CommonOpAuth = obj && obj.length !== 0 ? obj.restrictedAccess.indexOf('CommonOpAuth') !== -1 : false;
        }
      }
      //增加两个权限参数
      if (restrictedAccess.EditObjects) {
        this.addin.self.properties.readonly = restrictedAccess.EditObjects;
      }
      this.addin.self.properties.EditObjects = restrictedAccess.EditObjects;
      this.addin.self.properties.CommonOpAuth = restrictedAccess.CommonOpAuth;

      //如果是卡片使用卡片display
      if(this.parent){
        this.query.displayType = this.parent.args.displayType;
      }else{
        if (this.query.displayType) {
          this.query.displayType = this.query.displayType === 'list' ? 'visit' : this.query.displayType;
        } else {
          this.query.displayType = 'visit'
        }
      }
      this.addin.self.properties._query = this.query;
    } catch (e) {
      console.error(e)
      console.error(this.addin.self.elementType)
      console.error(this.addin.self.properties.id)
    }
    // this.uuid = this.addin.self.uuid;
    // this.addin.self.properties.uuid = this.uuid;
  },
  provide() {
    return {
      getEn: this.getEn,
      getJsonData: this.getJsonData,
      getParentJson: this.getParentJson,
      getObj: this.getObj,
      GetAddinById: this.GetAddinById,
      GetAddinByUUID: this.GetAddinByUUID,
      GetAllAddin: this.GetAllAddin,
      getParentAddin: this.getParentAddin,
      _getViewData: this._getViewData,
      _getViewDataByAttrs: this._getViewDataByAttrs,
      handleQueryData: this.handleQueryData,
      getClassObject: this.getClassObject,
      getRClassObject: this.getRClassObject,
      invokeOperation: this.invokeOperation,
      parseEscapeString: this.parseEscapeString,
      handleScript: this.handleScript,
      addExtraObj: this.addExtraObj,
      getEventOperation: this.getEventOperation,
      invokeEvent: this.invokeEvent,
    }
  },
  inject: [],
  components: {
    DragItem,
    DragLayout,
    GroupBox,
    Tab,
    EChart,
    DynamicMap,
    GaugeChart,
    MapChart,
    PieChart,
    ScatterChart,
    EchartBar,
    FormSelect,
    EntitiesAttrSelect,
    OrgUserSelect,
    TimeSeriesBoard,
    TimeSeriesCharts,
    TimeSeriesSelect,
    SelfCode,
    MultiObjPicture,
    SelfJoinsTree,
    RelationTree,
    JoinCascaderTree,
    FormEngine,
    SearchBox,
    WatchMessage,
    Grid,
    SimpleTable,
    Label,
    RadioButton,
    NumberInput,
    Operation,
    TextInput,
    DateInput,
    CheckBox,
    CompoundLabel,
    SwitchComponent,
    HyperLink,
    SelectInput,
    Iframe,
    SingleObjectSelector,
    SingleObjectModal,
    MultiObjectsTag,
    Attachments,
    ProgressBar,
    D_Rate,
    Liked,
    IconComponent,
    DynamicDigitalLabel,
    RichTextEditor,
    DynamicParameterFrame,
    MultiFilesList,
    Row,
    ColRows,
    Col,
    AssembleAddin,
    EncodeInput
  },
  beforeMount() {

  },
  mounted() {
    try {
      let name = this.addin.self.properties.name ? this.addin.self.properties.name : null;
      //更新addinMap
      if (name && this.formEngine.addinMap){
        if(!(name in this.formEngine.addinMap)){
          this.formEngine.addinMap[name] = [];
        }
        this.formEngine.addinMap[name].push(this.$refs.addinComponent);
      }
      let jsonData = this.getJsonData(this.itemValueCatch.data, this.addin.self.properties.id);
      this.$set(jsonData, 'obj', this.$refs.addinComponent);
      // this.addin.obj = this.$refs.addinComponent;
      if(this.formEngine.name && this.formEngine.name === 'FormEngine'){
        this.formEngine.addinIdMap[this.addin.self.properties.id] = this.$refs.addinComponent;
      }
      // created时需要给控件赋值，这里不能使用
      // this.$refs.addinComponent.setDisplayType(this.query.displayType).setArgs(this.addin.self.properties);
      // this.$refs.addinComponent.setDisplayType(this.query.displayType)
      // 传入查询结果值
      if (name) {
        if (this.query.obj && name in this.query.obj) {
          this.setValue(this.query.obj[name]);
        } else if (this.query.displayType && this.query.displayType == "create" && this.query.displayType != "creates") {
          let args = this.$refs.addinComponent.getArgs();
          if ("defaultValue" in args && ((Object.prototype.toString.call(args.defaultValue) === '[object Array]' && args.defaultValue.length !== 0) || (Object.prototype.toString.call(args.defaultValue) !== '[object Array]' && args.defaultValue) || Object.prototype.toString.call(args.defaultValue) === '[object Boolean]')) {
            this.setValue(args.defaultValue)
          } else {
            let attr = this.Attributes(name.replace(/^(relation_|left_|right_)/g, ''));
            if (attr && attr.defaultValue != undefined) {
              this.setValue(attr.defaultValue);
            } else {
              this.setValue(null);
            }
          }
        } else if (this.itemValueCatch.data.origin && name in this.itemValueCatch.data.origin) {
          this.setValue(this.itemValueCatch.data.origin[name]);
        }
        //自定义属性不受三态控制
        try {
          if ((this.attributes && Object.prototype.toString.call(this.attributes) === "[object Object]") || (Object.prototype.toString.call(this.attributes) === "[object Array]" && this.attributes.length !== 0)) {
            let propertyStatus = false;
            if (Object.prototype.toString.call(this.attributes) === "[object Object]") {
              for (let key in this.attributes) {
                propertyStatus = this.attributes[key].findIndex(item => item.attributeName === name.replace(/^(left_|right_|relation_)/g, '')) !== -1 || propertyStatus;
              }
            } else if (Object.prototype.toString.call(this.attributes) === "[object Array]") {
              propertyStatus = this.attributes.findIndex(item => item.attributeName === name) !== -1
            }
          // && form_entries.find(item => item.name === this.$refs.addinComponent.name) && (form_entries.find(item => item.name === this.$refs.addinComponent.name).module === 'form/single' || form_entries.find(item => item.name === this.$refs.addinComponent.name).module === 'form/model')
            if (!propertyStatus) {
              this.$refs.addinComponent.setDisplayType('create')
            }
          }
        } catch (e) {
          console.log(`自定义属性三态设置${e}`)
        }
      } else if (form_entries.find(item => item.name === this.$refs.addinComponent.name) && this.name !== 'FormEngine' && (form_entries.find(item => item.name === this.$refs.addinComponent.name).module === 'form/single' || form_entries.find(item => item.name === this.$refs.addinComponent.name).module === 'form/model')) {
        this.$refs.addinComponent.setDisplayType('create')
      }
      //补充样式
      let show_dom = this.$refs.addinComponent.$el; //设置显示模式为引擎显示模式
      let args = this.getArgs();
      if (args.row_space) {
        show_dom.style.marginTop = args.row_space + 'px';
        show_dom.style.marginBottom = args.row_space + 'px';
      }
      if (args.col_space) {
        show_dom.style.marginLeft = args.col_space + 'px';
        show_dom.style.marginRight = args.col_space + 'px';
      }
      show_dom.setAttribute("UUID", this.addin.self.uuid);
    }catch (e){
      console.error(e)
      console.error(this.addin.self.elementType)
      console.error(this.addin.self.properties.id)
    }
  },
  computed: {
    ...mapGetters("DWF_form", [
      "Attributes",
    ]),

    propsData() {
      return {
        addin: this.addin,
        argsProps: this.addin.self.properties,
        query: this.query,
        attributes: this.attributes,
        store: this.store,
        itemValue: this.itemValueCatch,
        route: this.route,
        root: this.root,
        Message: this.Message,
        echarts: this.echarts,
        formEngine: this.formEngine,
        dwf_ctx: this.dwf_ctx,
      }
    },
  },

  watch: {
    //检测重新赋值
    'itemValue'(val){
      this.itemValueCatch = val;

      //重新绑定obj
      let jsonData = this.getJsonData(this.itemValueCatch.data, this.addin.self.properties.id);
      this.$set(jsonData, 'obj', this.$refs.addinComponent);
      try {
        let name = this.addin.self.properties.name ? this.addin.self.properties.name : null;
        if (val.data.origin && name in val.data.origin) {
          this.setValue(val.data.origin[name]);
        }
      }catch (e) {
        console.error(e)
      }
    }
  },

  methods: {
    /**
    * @author LiuBo
    * @method
    * @name
    * @private
    * @description 获取控件args
    */
    getArgs() {
      return this.$refs.addinComponent.getArgs();
    },

    setValue(val){
      if(this.name === 'DynamicDigitalLabel'){
        this.$refs.addinComponent.setEngineValue(val);
      }else{
        this.$refs.addinComponent.setValue(val);
      }
    },

    getEn(targetClass) {
      return this.formEngine.EntityList(targetClass);
    },

    // 遍历json结构获取id以下的json结构
    getJsonData(item, id) {
      return this.formEngine.getJsonData(item, id);
    },

    // 获取id的上一层json结构
    getParentJson(item, id) {
      return this.formEngine.getParentJson(item, id);
    },

    // 遍历json结构获取对象即时数据
    getObj(item, validate) {
      return this.formEngine.GetObj(item, validate);
    },

    GetAddinById(item, id) {
      return this.formEngine.GetAddinById(item, id);
    },

    GetAddinByUUID(item, id) {
      return this.formEngine.GetAddinByUUID(item, id);
    },

    GetAllAddin(item) {
      return this.formEngine.GetAllAddin(item);
    },

    getParentAddin() {
      return this.formEngine;
    },

    _getViewData(param) {
      return this.formEngine.getViewData(param);
    },

    _getViewDataByAttrs(param) {
      return this.formEngine.getViewDataByAttrs(param);
    },

    async handleQueryData(param) {
      return await this.formEngine.handleQueryData(param);
    },

    getClassObject(targetClass, id) {
      return this.formEngine.EntitySingle(targetClass, id);
    },

    getRClassObject(targetClass, id) {
      return this.formEngine.RelationSingleA(targetClass, id);
    },

    /**
    * @author LiuBo
    * @method
    * @name
    * @private
    * @description 事件调用 byFormEngine从卡片引用的表单中触发事件时为true同时byFormEngineOprAddin为引用的表单中事件触发控件
    */
    async invokeOperation(opr_type, opr_path, jsonData, store, queryData, param, callback, multiObjParams, thisAddinId = this.$refs.addinComponent) {
      this.formEngine.executeOperationProgress = false;
      if(this.formEngine.name && this.formEngine.name === 'FormEngine'){
        //从卡片中的表单触发标识
        if(!multiObjParams) {
          multiObjParams = {};
        }
        multiObjParams.byFormEngine = true;
        multiObjParams.opr_source = 'grid';//借用表格逻辑
        multiObjParams.byFormEngineDisplayType ? '' : multiObjParams.byFormEngineDisplayType = this.formEngine.args.displayType;
        multiObjParams.byFormEngineOprAddin = thisAddinId;
        multiObjParams.isRelation = this.formEngine.isRelation;
        if(multiObjParams.isRelation){
          multiObjParams.leftClass = this.formEngine.relation.leftClass;
          multiObjParams.rightClass = this.formEngine.relation.rightClass;
          multiObjParams.relationClass = this.formEngine.relation.className;
        }else{
          multiObjParams.className = this.formEngine.targetClass;
        }

        // if(this.itemValue.data.isRelation){
        //   multiObjParams.isRelation = this.itemValue.data.isRelation;
        //   multiObjParams.leftClass = this.itemValue.data.origin.relation_leftClass;
        //   multiObjParams.rightClass = this.itemValue.data.origin.relation_rightClass;
        // }
        // multiObjParams.className = this.itemValue.data.targetClass;
        return await this.formEngine.invokeOperation(opr_type, opr_path, jsonData, store, queryData, param, callback, multiObjParams, thisAddinId);
      }else{
        return await this.formEngine.invokeOperation(opr_type, opr_path, jsonData, store, queryData, param, callback, multiObjParams, thisAddinId);
      }
    },

    parseEscapeString(oriString, env, user, obj, attributes, param) {
      return this.formEngine.parseEscapeString(oriString, env, user, obj, attributes, param);
    },

    async handleScript(code, params, store, jsonData) {
      if (!jsonData) jsonData = this.itemValue;
      if (!store) store = this.store;
      return await this.formEngine.handleScript(code, params, store, jsonData);
    },

    addExtraObj(item, obj) {
      return this.formEngine.addExtraObj(item, obj);
    },

    async getEventOperation(oprName) {
      let operation = this.addin.self.properties.events ? this.addin.self.properties.events.find(val => val.name === oprName) : null;
      if (operation && operation.opr_type == "query") {
        return await getQueryOperation(operation.opr_path);
      } else {
        return null
      }
    },

    async invokeEvent(oprName) {
      if (this.formEngine.executeOperationProgress) {
        this.formEngine.$Message.error('禁止invokeEvent与executeOperation脚本嵌套使用');
        this.formEngine.executeOperationProgress = false;
        return;
      }
      this.formEngine.executeOperationProgress = true;
      let operation = this.addin.self.properties.events ? this.addin.self.properties.events.find(val => val.name === oprName) : null;
      if (operation) {
        return await this.formEngine.invokeOperation(operation.opr_type, operation.opr_path, this.formEngine.rootJson, this.formEngine.$store, null, null, null, null, this.$refs.addinComponent);
      } else {
        return null
      }
    },
  }
}
</script>
<style>
.addin label.msize{
  word-break: break-all;
}
.addin[addinname="Operation"]{
  max-width: 100%;
}

.addin-operation{
  text-overflow: ellipsis;
  overflow: hidden;
  white-space: nowrap;
}
</style>
