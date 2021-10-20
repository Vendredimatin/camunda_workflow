// import basicArgs from '@/views/form-engine/form-create';
import Operation from '@/ext_components/form/Operation';
import TextInput from '@/ext_components/form/TextInput';
import NumberInput from '@/ext_components/form/NumberInput';
import DateInput from '@/ext_components/form/DateInput';
import CheckBox from '@/ext_components/form/CheckBox';
import RadioButton from '@/ext_components/form/RadioButton';
import Label from '@/ext_components/form/Label';
import CompoundLabel from '@/ext_components/form/CompoundLabel';
import SwitchComponent from '@/ext_components/form/Switch';
import HyperLink from '@/ext_components/form/HyperLink';
import SelectInput from '@/ext_components/form/SelectInput';
import Iframe from '@/ext_components/form/Iframe';
import SingleObjectSelector from '@/ext_components/form/SingleObjectSelector';
import SingleObjectModal from '@/ext_components/form/SingleObjectModal';
import MultiObjectsTag from '@/ext_components/form/MultiObjectsTag';
import Attachments from '@/ext_components/form/Attachments';
import ProgressBar from '@/ext_components/form/ProgressBar';
import D_Rate from '@/ext_components/form/D_Rate';
import Liked from '@/ext_components/form/Liked';
import IconComponent from '@/ext_components/form/icon';
import DynamicDigitalLabel from '@/ext_components/form/DynamicDigitalLabel';
import RichTextEditor from '@/ext_components/form/RichTextEditor';
import DynamicParameterFrame from '@/ext_components/form/DynamicParameterFrame';
import MultiFilesList from '@/ext_components/form/MultiFilesList';
import Grid from "@/ext_components/form/Grid";
import WatchMessage from "@/ext_components/form/WatchMessage";
import SearchBox from "@/ext_components/form/SearchBox";
import FormEngine from "@/ext_components/form/FormEngine";
import JoinCascaderTree from "@/ext_components/form/JoinCascaderTree";
import RelationTree from "@/ext_components/form/RelationTree";
import SelfJoinsTree from "@/ext_components/form/SelfJoinsTree";
import MultiObjPicture from "@/ext_components/form/MultiObjPicture";
import SelfCode from "@/ext_components/form/SelfCode";
import TimeSeriesSelect from "@/ext_components/form/TimeSeriesSelect";
import TimeSeriesCharts from "@/ext_components/form/TimeSeriesCharts";
import TimeSeriesBoard from "@/ext_components/form/TimeSeriesBoard";
import OrgUserSelect from "@/ext_components/form/OrgUserSelect";
import EntitiesAttrSelect from "@/ext_components/form/EntitiesAttrSelect";
import FormSelect from "@/ext_components/form/FormSelect";
import EchartBar from "@/ext_components/form/EchartBar";
import ScatterChart from "@/ext_components/form/_ScatterChart";
import PieChart from "@/ext_components/form/_PieChart";
import MapChart from "@/ext_components/form/_MapChart";
import GaugeChart from "@/ext_components/form/_GaugeChart";
import DynamicMap from "@/ext_components/form/DynamicMap";
import EChart from "@/ext_components/form/EChart";
import Row from "@/ext_components/form/row";
import ColRows from "@/ext_components/form/colRows";
import Col from "@/ext_components/form/col";
import Tab from "@/ext_components/form/Tab";
import GroupBox from "@/ext_components/form/GroupBox";
import DragLayout from "@/ext_components/form/DragLayout";
import DragItem from "@/ext_components/form/DragItem";
import AssembleAddin from "@/ext_components/form/AssembleAddin";
let argsList = {
  basicArgs: {
    label_width: 1,
    main_width: 4,
    label_align: 7,
    main_align: 1,
    // basic_height: 30,
    row_space: 0,
    col_space: 0,
    label_fontColor: 'initial',
    txt_fontColor: 'initial',
    // txt_bgColor: '#fff',
    form_bgColor: '#fff',
    form_fsize: 14,
    form_font_size: '14px',
    // cols: 3
    lfsize: 14,
    fsize: 14,
    label_align_horizontal: "2",
    label_align_vertical: "1",
    main_align_horizontal: "1",
    defaultMultiAddin: '',
    labelWidthUnit: 'px',
    label_widthByPx: 200,
  },
  // FormAddinWidget,
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
  AssembleAddin
}
let argsObj = {}
for(let key in argsList) {
  if(key == 'basicArgs'){
    argsObj[key] = argsList[key]
  }else{
    argsObj[key] = argsList[key].data().args
    if(key == 'Col'){
      argsObj[key]['back_color'] = '#fff'
    }
    if(key == 'Row'){
      argsObj[key]['back_color'] = '#fff'
    }
  }
}

console.log(argsObj)
export const cssArgs = argsObj;