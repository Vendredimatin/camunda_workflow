<template>
  <!--  单对象控件  -->
  <Operation
    v-if="name === 'Operation'"
    v-bind="propsData"
    ref="addinComponent"
    @activeAddin="activeAddin"
    class="addin vue-draggable-addin"
    :class="{'active': uuid === activeUUID && activate}"
    @click.native.stop="activeAddin"
  >
    <!--  句柄按钮  -->
    <FormAddinWidget
      slot="widget"
      v-show="uuid === activeUUID && activate"
      :widgetAnnotationComment="widgetAnnotationComment"
      @commentAddin="commentAddin"
      @copyAddin="copyAddin"
      @deleteAddin="deleteAddin"
    >

    </FormAddinWidget>
  </Operation>
  <TextInput
    v-else-if="name === 'TextInput'"
    v-bind="propsData"
    ref="addinComponent"
    @activeAddin="activeAddin"
    class="addin vue-draggable-addin"
    :class="{'active': uuid === activeUUID && activate}"
    @click.native.stop="activeAddin"
  >
    <!--  句柄按钮  -->
    <FormAddinWidget
      slot="widget"
      v-show="uuid === activeUUID && activate"
      :widgetAnnotationComment="widgetAnnotationComment"
      @commentAddin="commentAddin"
      @copyAddin="copyAddin"
      @deleteAddin="deleteAddin"
    >

    </FormAddinWidget>
  </TextInput>
  <NumberInput
    v-else-if="name === 'NumberInput'"
    v-bind="propsData"
    ref="addinComponent"
    @activeAddin="activeAddin"
    class="addin vue-draggable-addin"
    :class="{'active': uuid === activeUUID && activate}"
    @click.native.stop="activeAddin"
  >
    <!--  句柄按钮  -->
    <FormAddinWidget
      slot="widget"
      v-show="uuid === activeUUID && activate"
      :widgetAnnotationComment="widgetAnnotationComment"
      @commentAddin="commentAddin"
      @copyAddin="copyAddin"
      @deleteAddin="deleteAddin"
    >

    </FormAddinWidget>
  </NumberInput>
  <DateInput
    v-else-if="name === 'DateInput'"
    v-bind="propsData"
    ref="addinComponent"
    @activeAddin="activeAddin"
    class="addin vue-draggable-addin"
    :class="{'active': uuid === activeUUID && activate}"
    @click.native.stop="activeAddin"
  >
    <!--  句柄按钮  -->
    <FormAddinWidget
      slot="widget"
      v-show="uuid === activeUUID && activate"
      :widgetAnnotationComment="widgetAnnotationComment"
      @commentAddin="commentAddin"
      @copyAddin="copyAddin"
      @deleteAddin="deleteAddin"
    >

    </FormAddinWidget>
  </DateInput>
  <Calendar
    v-else-if="name === 'Calendar'"
    v-bind="propsData"
    ref="addinComponent"
    @activeAddin="activeAddin"
    class="addin vue-draggable-addin"
    :class="{'active': uuid === activeUUID && activate}"
    @click.native.stop="activeAddin"
  >
    <!--  句柄按钮  -->
    <FormAddinWidget
      slot="widget"
      v-show="uuid === activeUUID && activate"
      :widgetAnnotationComment="widgetAnnotationComment"
      @commentAddin="commentAddin"
      @copyAddin="copyAddin"
      @deleteAddin="deleteAddin"
    >

    </FormAddinWidget>
  </Calendar>
  <QRcode
    v-else-if="name === 'QRcode'"
    v-bind="propsData"
    ref="addinComponent"
    @activeAddin="activeAddin"
    class="addin vue-draggable-addin"
    :class="{'active': uuid === activeUUID && activate}"
    @click.native.stop="activeAddin"
  >
    <!--  句柄按钮  -->
    <FormAddinWidget
      slot="widget"
      v-show="uuid === activeUUID && activate"
      :widgetAnnotationComment="widgetAnnotationComment"
      @commentAddin="commentAddin"
      @copyAddin="copyAddin"
      @deleteAddin="deleteAddin"
    >

    </FormAddinWidget>
  </QRcode>
  <Label
    v-else-if="name === 'Label'"
    v-bind="propsData"
    ref="addinComponent"
    @activeAddin="activeAddin"
    class="addin vue-draggable-addin"
    :class="{'active': uuid === activeUUID && activate}"
    @click.native.stop="activeAddin"
  >
    <!--  句柄按钮  -->
    <FormAddinWidget
      slot="widget"
      v-show="uuid === activeUUID && activate"
      :widgetAnnotationComment="widgetAnnotationComment"
      @commentAddin="commentAddin"
      @copyAddin="copyAddin"
      @deleteAddin="deleteAddin"
    >

    </FormAddinWidget>
  </Label>
  <CheckBox
    v-else-if="name === 'CheckBox'"
    v-bind="propsData"
    ref="addinComponent"
    @activeAddin="activeAddin"
    class="addin vue-draggable-addin"
    :class="{'active': uuid === activeUUID && activate}"
    @click.native.stop="activeAddin"
  >
    <!--  句柄按钮  -->
    <FormAddinWidget
      slot="widget"
      v-show="uuid === activeUUID && activate"
      :widgetAnnotationComment="widgetAnnotationComment"
      @commentAddin="commentAddin"
      @copyAddin="copyAddin"
      @deleteAddin="deleteAddin"
    >

    </FormAddinWidget>
  </CheckBox>
  <RadioButton
    v-else-if="name === 'RadioButton'"
    v-bind="propsData"
    ref="addinComponent"
    @activeAddin="activeAddin"
    class="addin vue-draggable-addin"
    :class="{'active': uuid === activeUUID && activate}"
    @click.native.stop="activeAddin"
  >
    <!--  句柄按钮  -->
    <FormAddinWidget
      slot="widget"
      v-show="uuid === activeUUID && activate"
      :widgetAnnotationComment="widgetAnnotationComment"
      @commentAddin="commentAddin"
      @copyAddin="copyAddin"
      @deleteAddin="deleteAddin"
    >

    </FormAddinWidget>
  </RadioButton>
  <SelectInput
    v-else-if="name === 'SelectInput'"
    v-bind="propsData"
    ref="addinComponent"
    @activeAddin="activeAddin"
    class="addin vue-draggable-addin"
    :class="{'active': uuid === activeUUID && activate}"
    @click.native.stop="activeAddin"
  >
    <!--  句柄按钮  -->
    <FormAddinWidget
      slot="widget"
      v-show="uuid === activeUUID && activate"
      :widgetAnnotationComment="widgetAnnotationComment"
      @commentAddin="commentAddin"
      @copyAddin="copyAddin"
      @deleteAddin="deleteAddin"
    >

    </FormAddinWidget>
  </SelectInput>
  <SwitchComponent
    v-else-if="name === 'Switch'"
    v-bind="propsData"
    ref="addinComponent"
    @activeAddin="activeAddin"
    class="addin vue-draggable-addin"
    :class="{'active': uuid === activeUUID && activate}"
    @click.native.stop="activeAddin"
  >
    <!--  句柄按钮  -->
    <FormAddinWidget
      slot="widget"
      v-show="uuid === activeUUID && activate"
      :widgetAnnotationComment="widgetAnnotationComment"
      @commentAddin="commentAddin"
      @copyAddin="copyAddin"
      @deleteAddin="deleteAddin"
    >

    </FormAddinWidget>
  </SwitchComponent>
  <Attachments
    v-else-if="name === 'Attachments'"
    v-bind="propsData"
    ref="addinComponent"
    @activeAddin="activeAddin"
    class="addin vue-draggable-addin"
    :class="{'active': uuid === activeUUID && activate}"
    @click.native.stop="activeAddin"
  >
    <!--  句柄按钮  -->
    <FormAddinWidget
      slot="widget"
      v-show="uuid === activeUUID && activate"
      :widgetAnnotationComment="widgetAnnotationComment"
      @commentAddin="commentAddin"
      @copyAddin="copyAddin"
      @deleteAddin="deleteAddin"
    >

    </FormAddinWidget>
  </Attachments>
  <Cell
    v-else-if="name === 'Cell'"
    v-bind="propsData"
    ref="addinComponent"
    @activeAddin="activeAddin"
    class="addin vue-draggable-addin"
    :class="{'active': uuid === activeUUID && activate}"
    @click.native.stop="activeAddin"
  >
    <!--  句柄按钮  -->
    <FormAddinWidget
      slot="widget"
      v-show="uuid === activeUUID && activate"
      :widgetAnnotationComment="widgetAnnotationComment"
      @commentAddin="commentAddin"
      @copyAddin="copyAddin"
      @deleteAddin="deleteAddin"
    >

    </FormAddinWidget>
  </Cell>
  <Stepper
    v-else-if="name === 'Stepper'"
    v-bind="propsData"
    ref="addinComponent"
    @activeAddin="activeAddin"
    class="addin vue-draggable-addin"
    :class="{'active': uuid === activeUUID && activate}"
    @click.native.stop="activeAddin"
  >
    <!--  句柄按钮  -->
    <FormAddinWidget
      slot="widget"
      v-show="uuid === activeUUID && activate"
      :widgetAnnotationComment="widgetAnnotationComment"
      @commentAddin="commentAddin"
      @copyAddin="copyAddin"
      @deleteAddin="deleteAddin"
    >

    </FormAddinWidget>
  </Stepper>
  <MapPoint
    v-else-if="name === 'MapPoint'"
    v-bind="propsData"
    ref="addinComponent"
    @activeAddin="activeAddin"
    class="addin vue-draggable-addin"
    :class="{'active': uuid === activeUUID && activate}"
    @click.native.stop="activeAddin"
  >
    <!--  句柄按钮  -->
    <FormAddinWidget
      slot="widget"
      v-show="uuid === activeUUID && activate"
      :widgetAnnotationComment="widgetAnnotationComment"
      @commentAddin="commentAddin"
      @copyAddin="copyAddin"
      @deleteAddin="deleteAddin"
    >

    </FormAddinWidget>
  </MapPoint>
  <SearchCell
    v-else-if="name === 'SearchCell'"
    v-bind="propsData"
    ref="addinComponent"
    @activeAddin="activeAddin"
    class="addin vue-draggable-addin"
    :class="{'active': uuid === activeUUID && activate}"
    @click.native.stop="activeAddin"
  >
    <!--  句柄按钮  -->
    <FormAddinWidget
      slot="widget"
      v-show="uuid === activeUUID && activate"
      :widgetAnnotationComment="widgetAnnotationComment"
      @commentAddin="commentAddin"
      @copyAddin="copyAddin"
      @deleteAddin="deleteAddin"
    >

    </FormAddinWidget>
  </SearchCell>
  <NoticeBar
    v-else-if="name === 'NoticeBar'"
    v-bind="propsData"
    ref="addinComponent"
    @activeAddin="activeAddin"
    class="addin vue-draggable-addin"
    :class="{'active': uuid === activeUUID && activate}"
    @click.native.stop="activeAddin"
  >
    <!--  句柄按钮  -->
    <FormAddinWidget
      slot="widget"
      v-show="uuid === activeUUID && activate"
      :widgetAnnotationComment="widgetAnnotationComment"
      @commentAddin="commentAddin"
      @copyAddin="copyAddin"
      @deleteAddin="deleteAddin"
    >

    </FormAddinWidget>
  </NoticeBar>
  <Iframe
    v-else-if="name === 'Iframe'"
    v-bind="propsData"
    ref="addinComponent"
    @activeAddin="activeAddin"
    class="addin vue-draggable-addin"
    :class="{'active': uuid === activeUUID && activate}"
    @click.native.stop="activeAddin"
  >
    <!--  句柄按钮  -->
    <FormAddinWidget
      slot="widget"
      v-show="uuid === activeUUID && activate"
      :widgetAnnotationComment="widgetAnnotationComment"
      @commentAddin="commentAddin"
      @copyAddin="copyAddin"
      @deleteAddin="deleteAddin"
    >

    </FormAddinWidget>
  </Iframe>
  <DropDownMenu
    v-else-if="name === 'DropDownMenu'"
    v-bind="propsData"
    ref="addinComponent"
    @activeAddin="activeAddin"
    class="addin vue-draggable-addin"
    :class="{'active': uuid === activeUUID && activate}"
    @click.native.stop="activeAddin"
  >
    <!--  句柄按钮  -->
    <FormAddinWidget
      slot="widget"
      v-show="uuid === activeUUID && activate"
      :widgetAnnotationComment="widgetAnnotationComment"
      @commentAddin="commentAddin"
      @copyAddin="copyAddin"
      @deleteAddin="deleteAddin"
    >

    </FormAddinWidget>
  </DropDownMenu>

  <DynamicDigitalLabel
    v-else-if="name === 'DynamicDigitalLabel'"
    v-bind="propsData"
    ref="addinComponent"
    @activeAddin="activeAddin"
    class="addin vue-draggable-addin"
    :class="{'active': uuid === activeUUID && activate}"
    @click.native.stop="activeAddin"
  >
    <!--  句柄按钮  -->
    <FormAddinWidget
      slot="widget"
      v-show="uuid === activeUUID && activate"
      :widgetAnnotationComment="widgetAnnotationComment"
      @commentAddin="commentAddin"
      @copyAddin="copyAddin"
      @deleteAddin="deleteAddin"
    >

    </FormAddinWidget>
  </DynamicDigitalLabel>
  <!-- 多对象 -->
  <Card
    v-else-if="name === 'Card'"
    v-bind="propsData"
    ref="addinComponent"
    @activeAddin="activeAddin"
    class="addin vue-draggable-addin"
    :class="{'active': uuid === activeUUID && activate}"
    @click.native.stop="activeAddin"
  >
    <!--  句柄按钮  -->
    <FormAddinWidget
      slot="widget"
      v-show="uuid === activeUUID && activate"
      :widgetAnnotationComment="widgetAnnotationComment"
      @commentAddin="commentAddin"
      @copyAddin="copyAddin"
      @deleteAddin="deleteAddin"
    >

    </FormAddinWidget>
  </Card>
  <TreeSelect
    v-else-if="name === 'TreeSelect'"
    v-bind="propsData"
    ref="addinComponent"
    @activeAddin="activeAddin"
    class="addin vue-draggable-addin"
    :class="{'active': uuid === activeUUID && activate}"
    @click.native.stop="activeAddin"
  >
    <!--  句柄按钮  -->
    <FormAddinWidget
      slot="widget"
      v-show="uuid === activeUUID && activate"
      :widgetAnnotationComment="widgetAnnotationComment"
      @commentAddin="commentAddin"
      @copyAddin="copyAddin"
      @deleteAddin="deleteAddin"
    >

    </FormAddinWidget>
  </TreeSelect>
  <Swipe
    v-else-if="name === 'Swipe'"
    v-bind="propsData"
    ref="addinComponent"
    @activeAddin="activeAddin"
    class="addin vue-draggable-addin"
    :class="{'active': uuid === activeUUID && activate}"
    @click.native.stop="activeAddin"
  >
    <!--  句柄按钮  -->
    <FormAddinWidget
      slot="widget"
      v-show="uuid === activeUUID && activate"
      :widgetAnnotationComment="widgetAnnotationComment"
      @commentAddin="commentAddin"
      @copyAddin="copyAddin"
      @deleteAddin="deleteAddin"
    >

    </FormAddinWidget>
  </Swipe>
  <Grid
    v-else-if="name === 'Grid'"
    v-bind="propsData"
    ref="addinComponent"
    @activeAddin="activeAddin"
    class="addin vue-draggable-addin"
    :class="{'active': uuid === activeUUID && activate}"
    @click.native.stop="activeAddin"
  >
    <!--  句柄按钮  -->
    <FormAddinWidget
      slot="widget"
      v-show="uuid === activeUUID && activate"
      :widgetAnnotationComment="widgetAnnotationComment"
      @commentAddin="commentAddin"
      @copyAddin="copyAddin"
      @deleteAddin="deleteAddin"
    >

    </FormAddinWidget>
  </Grid>
  <SelfCode
    v-else-if="name === 'SelfCode'"
    v-bind="propsData"
    ref="addinComponent"
    @activeAddin="activeAddin"
    class="addin vue-draggable-addin"
    :class="{'active': uuid === activeUUID && activate}"
    @click.native.stop="activeAddin"
  >
    <!--  句柄按钮  -->
    <FormAddinWidget
      slot="widget"
      v-show="uuid === activeUUID && activate"
      :widgetAnnotationComment="widgetAnnotationComment"
      @commentAddin="commentAddin"
      @copyAddin="copyAddin"
      @deleteAddin="deleteAddin"
    >

    </FormAddinWidget>
  </SelfCode>
  <EChart
    v-else-if="name === 'EChart'"
    v-bind="propsData"
    ref="addinComponent"
    @activeAddin="activeAddin"
    class="addin vue-draggable-addin"
    :class="{'active': uuid === activeUUID && activate}"
    @click.native.stop="activeAddin"
  >
    <!--  句柄按钮  -->
    <FormAddinWidget
      slot="widget"
      v-show="uuid === activeUUID && activate"
      :widgetAnnotationComment="widgetAnnotationComment"
      @commentAddin="commentAddin"
      @copyAddin="copyAddin"
      @deleteAddin="deleteAddin"
    >

    </FormAddinWidget>
  </EChart>
  <TimeSteps
    v-else-if="name === 'TimeSteps'"
    v-bind="propsData"
    ref="addinComponent"
    @activeAddin="activeAddin"
    class="addin vue-draggable-addin"
    :class="{'active': uuid === activeUUID && activate}"
    @click.native.stop="activeAddin"
  >
    <!--  句柄按钮  -->
    <FormAddinWidget
      slot="widget"
      v-show="uuid === activeUUID && activate"
      :widgetAnnotationComment="widgetAnnotationComment"
      @commentAddin="commentAddin"
      @copyAddin="copyAddin"
      @deleteAddin="deleteAddin"
    >

    </FormAddinWidget>
  </TimeSteps>
  <Steps
    v-else-if="name === 'Steps'"
    v-bind="propsData"
    ref="addinComponent"
    @activeAddin="activeAddin"
    class="addin vue-draggable-addin"
    :class="{'active': uuid === activeUUID && activate}"
    @click.native.stop="activeAddin"
  >
    <!--  句柄按钮  -->
    <FormAddinWidget
      slot="widget"
      v-show="uuid === activeUUID && activate"
      :widgetAnnotationComment="widgetAnnotationComment"
      @commentAddin="commentAddin"
      @copyAddin="copyAddin"
      @deleteAddin="deleteAddin"
    >

    </FormAddinWidget>
  </Steps>
  <FormEngine
    v-else-if="name === 'FormEngine'"
    v-bind="propsData"
    ref="addinComponent"
    @activeAddin="activeAddin"
    class="addin vue-draggable-addin"
    :class="{'active': uuid === activeUUID && activate}"
    @click.native.stop="activeAddin"
  >
    <!--  句柄按钮  -->
    <FormAddinWidget
      slot="widget"
      v-show="uuid === activeUUID && activate"
      :widgetAnnotationComment="widgetAnnotationComment"
      @commentAddin="commentAddin"
      @copyAddin="copyAddin"
      @deleteAddin="deleteAddin"
    >

    </FormAddinWidget>
  </FormEngine>

  <Table
    v-else-if="name === 'Table'"
    v-bind="propsData"
    ref="addinComponent"
    @activeAddin="activeAddin"
    class="addin vue-draggable-addin"
    :class="{'active': uuid === activeUUID && activate}"
    @click.native.stop="activeAddin"
  >
    <!--  句柄按钮  -->
    <FormAddinWidget
      slot="widget"
      v-show="uuid === activeUUID && activate"
      :widgetAnnotationComment="widgetAnnotationComment"
      @commentAddin="commentAddin"
      @copyAddin="copyAddin"
      @deleteAddin="deleteAddin"
    >

    </FormAddinWidget>
  </Table>
  <!-- layout -->
  <Col
    v-else-if="name === 'col'"
    v-bind="propsData"
    ref="addinComponent"
    @activeAddin="activeAddin"
    class="addin addin-layout vue-draggable-addin"
    :class="{'active': uuid === activeUUID && activate}"
    @click.native.stop="activeAddin"
    @removeAddin="removeAddin"
    @copyAddin="copyAddin"
    @deleteAddin="deleteAddin"
    @commentAddin="commentAddin"
    @layoutSelfDrag="layoutSelfDrag"
    @snapShotHistory="snapShotHistory"
  >
    <!--  句柄按钮  -->
    <FormAddinWidget
      slot="widget"
      v-show="uuid === activeUUID && activate"
      :widgetAnnotationComment="widgetAnnotationComment"
      @commentAddin="commentAddin"
      @copyAddin="copyAddin"
      @deleteAddin="deleteAddin"
    >

    </FormAddinWidget>
  </Col>
  <Row
    v-else-if="name === 'row'"
    v-bind="propsData"
    ref="addinComponent"
    @activeAddin="activeAddin"
    class="addin addin-layout vue-draggable-addin"
    :class="{'active': uuid === activeUUID && activate}"
    @click.native.stop="activeAddin"
    @showEditBox="showEditBox"
    @removeAddin="removeAddin"
    @copyAddin="copyAddin"
    @deleteAddin="deleteAddin"
    @commentAddin="commentAddin"
    @layoutSelfDrag="layoutSelfDrag"
    @snapShotHistory="snapShotHistory"
  >
    <!--  句柄按钮  -->
    <FormAddinWidget
      slot="widget"
      v-show="uuid === activeUUID && activate"
      :widgetAnnotationComment="widgetAnnotationComment"
      @commentAddin="commentAddin"
      @copyAddin="copyAddin"
      @deleteAddin="deleteAddin"
    >

    </FormAddinWidget>
  </Row>
  <Tab
    v-else-if="name === 'Tab'"
    v-bind="propsData"
    ref="addinComponent"
    @activeAddin="activeAddin"
    class="addin vue-draggable-addin"
    :class="{'active': uuid === activeUUID && activate}"
    @click.native.stop="activeAddin"
    @removeAddin="removeAddin"
    @copyAddin="copyAddin"
    @deleteAddin="deleteAddin"
    @commentAddin="commentAddin"
    @layoutSelfDrag="layoutSelfDrag"
    @snapShotHistory="snapShotHistory"
  >
    <!--  句柄按钮  -->
    <FormAddinWidget
      slot="widget"
      v-show="uuid === activeUUID && activate"
      :widgetAnnotationComment="widgetAnnotationComment"
      @commentAddin="commentAddin"
      @copyAddin="copyAddin"
      @deleteAddin="deleteAddin"
    >

    </FormAddinWidget>
  </Tab>
</template>

<script>

import Operation from './Operation';
import TextInput from './TextInput';
import NumberInput from './NumberInput';
import DateInput from './DateInput';
import Calendar from './Calendar';
import QRcode from './QRcode';
import Label from './Label';
import Card from './Card';
import TreeSelect from './TreeSelect';
import Swipe from './Swipe';
import Tab from './Tab';
import Grid from './Grid';
import Iframe from './Iframe';
import SelfCode from "./SelfCode";
import EChart from "./EChart";
import TimeSteps from './TimeSteps';
import Steps from './Steps';
import Col from "./col";
import SwitchComponent from './Switch';
import SelectInput from './SelectInput';
import CheckBox from './CheckBox';
import RadioButton from './RadioButton';
import Attachments from './Attachments';
import Cell from './Cell';
import SearchCell from './SearchCell';
import NoticeBar from './NoticeBar';
import DropDownMenu from './DropDownMenu';
import FormEngine from "./FormEngine";
import Table from "./Table";
import Stepper from "./Stepper";
import MapPoint from "./MapPoint";
import DynamicDigitalLabel from './DynamicDigitalLabel'
import FormAddinWidget from "../../component/FormAddinWidget";
import Row from "./row";
import _ from "lodash";
import {uuid} from "@/util/assist";

const visualCharts = [
  "addin_EchartBar",
  "addin_Echart",
  "addin_BarChart",
  "addin_LineChart",
  "addin_ScatterChart",
  "addin_PieChart",
  "addin_MapChart",
  "addin_MapCityChart",
  "addin_ParallelChart",
  "addin_CalendarChart",
  "addin_GaugeChart",
  "addin_CheckBox",
  "addin_RadioButton",
];
const timeseries = [
  "addin_TimeSeriesCharts",
  "addin_TimeSeriesBoard"
];
export default {
  name: "FormAddinList",
  data() {
    return {
      name: '',
      args: {},
      uuid: '',
      activate: true,
      DWFADDINARGSVERSION: null,
      // propsData: {},
    }
  },
  props: [
    'addin',
    'basicArgs',
    'activeUUID',
    'store',
    'itemValue',
    'attributes',
    'relation',
    'editExtendInfo',
    'widgetAnnotation',
    'checkResult',
    'query_oprs',
    'route',
    'router',
    'root',
    'Message',
    'echarts',
    'formCanvas',
    'dwf_ctx',
    'formEngine'
  ],
  created() {
    this.name = this.addin.self.elementType.replace("addin_", "");
    this.uuid = this.addin.self.uuid;
    this.DWFADDINARGSVERSION = this.addin.self.DWFADDINARGSVERSION;
    this.addin.self.properties.uuid = this.uuid;
  },
  provide(){
    return {
      setBasicArgs: this.setBasicArgs
    }
  },
  inject: [
    'ReloadAddin',
    'GenerateID'
  ],
  components: {
    FormAddinWidget,
    Label,
    NumberInput,
    Operation,
    TextInput,
    DateInput,
    Calendar,
    QRcode,
    Card,
    TreeSelect,
    Swipe,
    Tab,
    Grid,
    Iframe,
    SelfCode,
    EChart,
    TimeSteps,
    Steps,
    Col,
    CheckBox,
    RadioButton,
    SelectInput,
    SwitchComponent,
    Attachments,
    Cell,
    SearchCell,
    NoticeBar,
    DropDownMenu,
    FormEngine,
    DynamicDigitalLabel,
    Table,
    Stepper,
    MapPoint,
    Row,
  },
  mounted() {
    this.addin.self.properties = this.getArgs();
    this.addin.obj = this.$refs.addinComponent;
    this.formCanvas.jsonUUID[this.uuid] = this.addin;

    try {
      if (this.addin.obj && this.addin.self && this.addin.self.properties && this.addin.self.elementType != 'addin_col') {
        this.addin.obj.$el.style.marginTop = this.addin.self.properties.row_space + 'px';
        this.addin.obj.$el.style.marginBottom = this.addin.self.properties.row_space + 'px';
        this.addin.obj.$el.style.marginLeft = this.addin.self.properties.col_space + 'px';
        this.addin.obj.$el.style.marginRight = this.addin.self.properties.col_space + 'px';
      }
    } catch (e) {
      console.log(e)
    }

  },
  watch: {
    activeUUID(val){
      if(this.formEngine && val){
        this.activate = false;
      }
    }
  },
  computed: {
    widgetAnnotationComment() {
      return !!this.propsData.widgetAnnotation[this.uuid];
    },

    propsData() {
      return {
        addin: this.addin,
        basicArgs: this.basicArgs,
        activeUUID: this.activeUUID,
        argsProps: this.addin.self.properties,
        store: this.store,
        itemValue: this.itemValue,
        attributes: this.attributes,
        relation: this.relation,
        editExtendInfo: this.editExtendInfo,
        widgetAnnotation: this.widgetAnnotation,
        checkResult: this.checkResult,
        query_oprs: this.query_oprs,
        route: this.route,
        router: this.router,
        root: this.root,
        Message: this.Message,
        echarts: this.echarts,
        formCanvas: this.formCanvas,
        dwf_ctx: this.dwf_ctx,
      }
    }
  },

  methods: {
    /**
     *@description获取控件args
     *@params
     *@date 2020/8/25
     *@return
     */
    getArgs() {
      return this.$refs.addinComponent.getArgs();
    },

    /**
     *@description设置控件args
     *@params
     *@date 2020/8/25
     *@return
     */
    setArgs(args) {
      return this.$refs.addinComponent.setArgs(args);
    },

    /**
     *@description用于初次拖入控件使用basicArgs
     *@params
     *@date 2020/9/7
     *@return
     */
    setBasicArgs(args) {
      args = {
        ...args,
        ...this.addin.self.properties,
      }
      // 判断是否为新拖入的控件,生成id并继承表单设置
      if (!this.addin.self.properties.id) {
        for (var i in this.basicArgs) {
          if (i in args) {
            args[i] = this.basicArgs[i] !== undefined ? this.basicArgs[i] : args[i];
          }
          switch (this.DWFADDINARGSVERSION) {
            case 1:
              //增加标签控件px功能
              if ('label_width' in args && (i === 'labelWidthUnit' || i === 'label_widthByPx')) {
                args[i] = this.basicArgs[i] !== undefined ? this.basicArgs[i] : args[i];
              }
              break;
            default:
              break;
          }
        }
        if (this.name === 'AssembleAddin') {
          args.id = this.GenerateID(this.addin.self.properties._ASSEMBLECONFIG.name);
        } else {
          args.id = this.GenerateID(this.name);
        }
      }else{
        //旧控件兼容处理
        switch (this.DWFADDINARGSVERSION) {
          case 1:
            break;
          default:
            'label_width' in args && !('labelWidthUnit' in args) ? (args['labelWidthUnit'] = '%', args['label_widthByPx'] = 200) : '';
            break;
        }
      }
      return args;
    },

    /**
     *@description激活控件
     *@params
     *@date 2020/8/25
     *@return
     */
    activeAddin(type = null, addin = this.$refs.addinComponent, uuid = this.uuid) {
      if(this.name === 'row'){
        this.$refs.addinComponent.initSplit();
      }
      if(this.name === 'row' && type !== 'col'){
        this.$refs.addinComponent.activeCol = '';
      }
      if(this.name === 'colRows' && type !== 'row'){
        this.$refs.addinComponent.activeRow = '';
      }
      if(this.name === 'FormEngine' && this.addin.self.properties.componentOid){
        let group = null;
        this.editExtendInfo.componentGroup.forEach(componentGroup => {
          if(!group && componentGroup.children.length !== 0){
            group = componentGroup.children.find(component => component.oid === this.addin.self.properties.componentOid);
          }
        })
        if(group){
          this.setArgs({
            viewName: group.viewName,
            groupDisplayName: group.groupDisplayName,
            groupOid: group.groupOid,
            componentOid: group.oid,
            componentDisplayName: group.displayName,
          })
        }
      }
      this.$refs.addinComponent.t_edit = false;
      let containerFormEngine = uuid;

      //增加对圆角列内元素不隐藏的功能
      try {
        document.querySelectorAll("[addinname='col'][addin='layout'].hidden").forEach(col => {
          col.childNodes[0].style.overflow = 'hidden'
        });
        let _this = this;
        setTimeout(() => {
          let parN = _this.$refs.addinComponent.$el.parentNode;
          while (parN && parN.getAttribute){
            if(parN.getAttribute('addinname') === 'col' && parN.getAttribute('addin') === 'layout'){
              parN.querySelector('.van-col').style.overflow = 'visible';
            }
            parN = parN.parentNode;
          }
        }, 0)
      }catch (e){
        console.log(`col-overflow-error${e}`)
      }

      //卡片嵌套获取顶层卡片
      try {
        let parN = this.$refs.addinComponent.$el.parentNode;
        while (parN && parN.getAttribute){
          if(parN.getAttribute('addinname') === 'FormEngine' && parN.getAttribute('formEngineUUID')){
            containerFormEngine = parN.getAttribute('formEngineUUID');
          }
          parN = parN.parentNode;
        }
      }catch (e){
        console.log(`form-engine-error${e}`)
      }
      if(containerFormEngine !== uuid){
        this.$emit('activeAddin');
      }else if (uuid === this.uuid) {
        this.resizeAddin(this.itemValue.data);
        this.formCanvas.activeAddin(null, addin, uuid);
        this.$refs.addinComponent.actEdit = true;
      } else {
        this.$emit('activeAddin', null, addin, uuid);
      }

    },
    /**
    *@descriptionresize视图控件
    *@params
    *@date 2020/9/15
    *@return
    */
    resizeAddin(addin){
      if(addin.self){
        if ((visualCharts.indexOf(addin.self.elementType) >= 0) && addin.obj && addin.obj.resizeChart) {
          addin.obj.resizeChart();
        }
        if ((timeseries.indexOf(addin.self.elementType) >= 0) && addin.obj && addin.obj.resizeChart) {
          addin.obj.resizeChart();
        }
      }
      if (addin.elements && addin.elements.length) {
        addin.elements.forEach(element => {
          this.resizeAddin(element)
        });
      }
    },
    /**
     *@description激活控件from布局控件
     *@params
     *@date 2020/8/25
     *@return
     */
    activeAddinFormLayout(type, addin, uuid) {
      this.$emit('activeAddin', type, addin, uuid);
    },
    /**
     *@description通过修改jsonData从布局控件移除子控件
     *@params deleteButton：是否是点击删除按钮的删除
     *@date 2020/8/31
     *@return
     */
    removeAddin(uuid, parentUUID, deleteButton = false) {
      // this.formCanvas.removeAddin(uuid, parentUUID)
      this.$emit('removeAddin', uuid, parentUUID, deleteButton);
    },
    /**
     *@description删除复制控件
     *@params
     *@date 2020/8/25
     *@return
     */
    copyAddin(addin = this.ReloadAddin(this.addin), parentUUID) {
      // this.formCanvas.removeAddin(addin, parentUUID)
      this.$emit('copyAddin', addin, parentUUID);
    },

    deleteAddin() {
      // if (this.name == 'DragItem') {
      //   return this.$refs.addinComponent.deleteItem()
      // } else {
      //   this.removeAddin(this.uuid)
      // }
      this.removeAddin(this.uuid, undefined, true);
    },

    commentAddin(addin = this.$refs.addinComponent) {
      this.formCanvas.commentAddin(addin)
      // this.$emit('commentAddin', addin);
    },

    /**
     *@description行列中显示内部editbox使用
     *@params:type:'col','row'
     *@params:addin
     *@date 2020/9/1
     *@return
     */
    showEditBox(type, addin) {
      this.formCanvas.showEditBox(type, addin)
      // this.$emit('showEditBox', type, addin);
    },

    /**
     *@description多列多行内部拖拽使用
     *@params
     *@date 2020/9/7
     *@return
     */
    layoutSelfDrag() {
      this.formCanvas.layoutSelfDrag();
      // this.$emit('layoutSelfDrag')
    },

    /**
    *@description拖拽块args配置事件
    *@params
    *@date 2020/9/15
    *@return
    */
    LayoutItemConfigChange(args){
      this.$emit('LayoutItemConfigChange', args);
    },
    /**
    *@description记录json历史
    *@params
    *@date 2020/9/8
    *@return
    */
    snapShotHistory(){
      this.formCanvas.snapShotHistory();
      // this.$emit('snapShotHistory');
    },

    onDragStart(e){
      if(this.name === 'Grid' && !this.addin.self.properties.draggable){
        e.stopPropagation();
        e.preventDefault();
        return false;
      }
      //冻结拖拽池情况下
      if(this.name === 'DragLayout' && !this.addin.self.properties.layoutDraggable && e.target.className === 'vue-grid-layout'){
        e.stopPropagation();
        e.preventDefault();
        return false;
      }
      //冻结拖拽池情况下
      if(this.name === 'DragItem' && this.addin.self.properties.static && e.target.className.indexOf('vue-drag-item') !== -1){
        e.stopPropagation();
        e.preventDefault();
        return false;
      }
    }
  }
}
</script>

<style scoped>
.addin {
  position: relative;
  padding: 5px !important;
}

.addin.active {
  border: 0 solid #2d8cf0;
  background: #abd1f9;
}

.addin.active:hover {
  background: #abd1f9;
}

.addin:hover {
  background: #ddecfc;
}

.addin.addin-layout.active {
  border: 1px solid #1AB395 !important;
  background: #a3e1d5;
}

.addin.addin-layout:hover {
  background: #e2f4ef;
}

.addin.addin-layout.active:hover {
  background: #a3e1d5;
}

.addin-wrapper {
  padding: 5px !important;
}

.addin-wrapper.active, .addin-wrapper:hover {
  background: #ddecfc;
}

.addin-wrapper.active {
  border: 3px solid #2d8cf0;
}
</style>
<style>
.dragArea.addin-layout{
  display: inherit;
  align-items: inherit;
  justify-content: inherit;
  flex-direction: inherit;
  flex-wrap: inherit;
}
</style>
