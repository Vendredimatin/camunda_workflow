<template>
    <section :addinName="name" v-if="t_preview" ref="main" :style="{'width': arg_width}">
        <div class="exportData-btn" v-show="args.isExport">
          <Button type="ghost" icon="ios-download-outline" style="float: right;" @click="exportData" :disabled="args.isMweb">导出数据</Button>
        </div>
        <div class="echart-bar" ref='previewbox' id="box" :style="{'width': '100%', 'height': arg_height}"></div>

        <!-- 导出数据前的预览 -->
        <Modal
            v-model="args.beforeExport"
            width="60%"
            title="即将导出的数据">
            <Table :columns="args.exportColumns" :data="args.exportTable" ref="exportTable"></Table>
        </Modal>

        <h3 v-if="args.msg">{{args.msg}}</h3>
        <!-- 预览模式时，有编辑框的显示；ref属性用于获取指定的dom元素，如ref="x",则在script中用this.$refs.x来选中该dom元素 -->
        <slot name="widget"></slot>
<span v-show="t_edit" ref="edit">
            <EditBox v-if="actEdit" :addinName="name" :widgetAnnotation="widgetAnnotation" :editExtendInfo="editExtendInfo" ref="editbox" v-model="args"
              :attributes="filter_attributes"
              :router="router"
              :route="route"
              :root="root"
              :query_oprs="query_oprs"
              :targetclass="itemValue.data.targetClass">
                <div slot="attribute">
                    <div class="editsection">
                        <Form :model="args" :label-width="80">
                            <h3 class="margin1">图表基础配置</h3>

                            <p class="margin1">图表标题</p>
                            <Input class="margin1" v-model="args.option.title.text"></Input>

                            <p class="margin1">图表横坐标</p>
                            <Input class="margin1" v-model="args.xAxisname"></Input>

                            <p class="margin1">图表纵坐标</p>
                            <Input class="margin1" v-model="args.yAxisname"></Input>

                            <p class="margin1">最大数据数量</p>
                            <InputNumber class="margin1" v-model="args.maxNum" :min='0' :step='1'></InputNumber>

                            <p class="margin1">定时间隔</p>
                            <InputNumber class="margin1" v-model="args.timer" :min='0' :step='1'></InputNumber>

                            <p class="margin1">执行次数</p>
                            <InputNumber class="margin1" v-model="args.timerLimit" :min='0' :step='1'></InputNumber>

                            <p class="margin1">数据间隔</p>
                            <InputNumber class="margin1" v-model="args.dataStep" :min='0' :step='1'></InputNumber>

                            <p class="margin1">x轴</p>
                            <Select v-model="args.nameAttribute">
                                <Option v-for="(item, index) in filter_attributes" :key="index" :value="item.attributeName" :label="item.displayName">
                                  <span>{{ item.displayName }}</span>
                                  <span style="float:right;color:#ccc">{{ item.attributeName }}</span>
                                </Option>
                            </Select>

                            <p class="margin1">y轴</p>
                            <Select v-model="args.valueAttribute" multiple>
                                <Option v-for="(item, index) in filter_attributes" :key="index" :value="item.attributeName" :label="item.displayName">
                                  <span>{{ item.displayName }}</span>
                                  <span style="float:right;color:#ccc">{{ item.attributeName }}</span>
                                </Option>
                            </Select>
                            <br>
                            <br>
                            <Button type="success" long @click="render">绘制</Button>
                            <br>
                            <br>
                            <Button type="success" long @click="showScriptModal = true">添加脚本</Button>
                        </Form>
                    </div>
                </div>
                <div slot="layout">
                </div>
                <div slot="operation">
                </div>
            </EditBox>
        </span>

        <Modal
          v-model="showScriptModal"
          title="脚本编辑"
          :mask-closable="false"
          width="80%"
          @on-ok="confirmScript"
          @on-cancel="cancelScript">
            <editor v-model="args.echartScript" @init="editorInit" lang="javascript" theme="chrome" width="100%" height="600"></editor>
        </Modal>
        <!-- 最大化编辑器ENDING -->
    </section>
    <section v-else :addinName="name">
        <span style="text-align:center">
            <div class="form-addin-icon">
                <i class="iconfont">&#xe65c;</i>
            </div>
            <div class="form-addin-name">
                曲线图
            </div>
        </span>
    </section>

</template>

<script>
import EditBox from "./_EditBox.vue"
import EntityModeling from "@/api/data-model/EntityModeling";
import Axios from "@/libs/axios.js";
import "@/styles/component/iconfont.css";
import { getEobj } from '@/api/others';
// 引入 ECharts 主模块
var echarts = require("echarts");

const name = "CurveTimerChart";
export default {
  // 插件名
  name: name,
  props: ["argsProps", "widgetAnnotation", "editExtendInfo" , "itemValue", "attributes", "store", "query_oprs", "route", "router", "root" ],
  components: {
    EditBox,
    editor: require("vue2-ace-editor")
  },
  data() {
    return {
      // 插件名
      name: name,

      // 展示模式
      t_preview: true,
      t_edit: false,
      editChange: false,
      showScriptModal: false,
      yIsCategory: true,
      reloadY: false,

      // 支持的数据类型
      dataTypes: [
        "String",
        "Integer",
        "Boolean",
        "Long",
        "UUID",
        "Date",
        "Double",
        "Clob",
        "TimeStamp"
      ],
      // 编辑框

      actEdit: false,
      args: {
        name: "",
        title: '曲线图',
        id: null,
        value: "",
        echartName: "",
        targetDataType: null,
        hided: false,
        // 布局插件所需属性
        rows: 0,
        cols: 0,
        width:  100,
        widthType: "%",
        heightType: "px",
        height: 400,
        switchExport: false,
        isExport: false,
        beforeExport: false,
        isMweb: true,
        exportAttr: [],
        exportColumns: [],
        exportTable: [],
        seriesYType: 'value',
        events: [],
        eventRange: ["初始化", "点击系列"],
        //echart
        // 查询条件
        echartScript: '',      // 脚本内容
        query: "",
        maxNum: 1024,
        timer: 1000,
        timerLimit: 120,
        dataStep: 1,
        nameAttribute: "",
        valueAttribute: [],
        data: [],
        //数据配置
        option: {
          title: {
            text: "曲线图",
            left: "center"
          },
          xAxis: {
            name: "x坐标",
          },
          yAxis: {
            name: "y坐标",
          },
          tooltip: {},
          //数据存储
          dataset: {
            source: []
          },
          series: []
        },
        series: [],
      },
      watchWidth: null,
      msg: "", //提示内容
      mychart: {}, //echart init 图标实例
      chartTypeList: ["bar", "line", "crossPile", "verticalStack"],
      xAxisTypeList: ["category", "value"],
      yAxisTypeList: ["category", "value"],

      //插件本身
      alignList: [
        { value: 0, name: "左上对齐" },
        { value: 1, name: "靠左对齐" },
        { value: 2, name: "左下对齐" },
        { value: 3, name: "顶部对齐" },
        { value: 4, name: "居中对齐" },
        { value: 5, name: "底部对齐" },
        { value: 6, name: "右上对齐" },
        { value: 7, name: "靠右对齐" },
        { value: 8, name: "右下对齐" }
      ],
      // 继承属性
      inherit: [],
      // 表单项名
      args_name: "",
      // 属性map
      attrMap: {}
    };
  },
  inject: [
    'setBasicArgs'
  ],
  created() {
    //通用方法给args赋值
    this.args = this.setBasicArgs(this.args);
    this.setArgs(this.args);
    let that = this;
    if (this.attributes)
      this.attributes.forEach(x => (that.attrMap[x.attributeName] = x));
  },
  // 生命周期函数，在dom元素生成之后调用
  async mounted() {

    // 获取当前类的全部对象
    if((this.t_preview||this.t_edit)&&(this.itemValue.data)) {
      getEobj(this.itemValue.data.targetClass).then(response => {
        const res = response.data;
        if(res.success) {
          this.args.exportTable = res.data;
        }
      }).catch(e => {
        console.log(e);
      });
      this.isMweb = true;
    }



    //获取所有实体类列表
    if (this.t_preview) {

        this.args.option.dataset.source = await this.getChartSource(
          this.itemValue.data.targetClass,
          ""
        ); //获取数据，整理数据
        console.log(
          "this.args.option.dataset.source",
          this.args.option.dataset.source
        );
        console.log(this.getEn(this.itemValue.data.targetClass));

        this.myChart = echarts.init(this.$refs.previewbox);
        this.myChart.setOption(this.args.option);
        if(this.args.option.series.length > 0){
          this.getDataFromAPI("");
        }
    }

    console.log("this.attributes", this.attributes);
    console.log("this.itemValue.data", this.itemValue.data);

    // if(this.args.series.length > 0) {

    //   this.previewChart();

    // }

  },
  watch: {

    // 需要用到实体类属性列表时使用
    args_name(val) {
      if (val != "-1") {
        this.args.name = val;
      } else {
        // // // // this.args.name = "";
      }
    },
    arg_name(val) {
      if (!this.attributes) return;
      if (val in this.attrMap) {
        this.args.label = this.attrMap[val].displayName;
        this.args.targetDataType = this.attrMap[val].valueType;
      } else {
        this.args.targetDataType = null;
      }
    },
    attributes(val) {
      this.attrMap = {};
      if (val) val.forEach(x => (this.attrMap[x.attributeName] = x));
    },
    watchWidth (val, oldval) {
      console.log(val, oldval);
    }
  },
  computed: {
    arg_width() {
      return this.args.width + this.args.widthType;
    },
    arg_height() {
      return this.args.height + this.args.heightType;
    },
    // 需要用到实体类属性列表时使用
    arg_name() {
      return this.args.name;
    },
    filter_attributes() {
      return this.attributes
        ? this.attributes.filter(x => this.dataTypes.indexOf(x.valueType) > -1)
        : [];
    },

    nameIndex(){
      var dimensions = this.args.option.dataset.source[0];
      return dimensions.indexOf(this.args.nameAttribute);
    },

    valueIndex(){
      var dimensions = this.args.option.dataset.source[0];
      return this.args.valueAttribute.map(attr => dimensions.indexOf(attr));
    },


  },
  // 定义组件的函数接口
  methods: {
    editorInit() {
      require("brace/ext/language_tools"); //language extension prerequsite...
      require("brace/mode/html");
      require("brace/mode/javascript"); //language
      require("brace/mode/less");
      require("brace/theme/chrome");
      require("brace/snippets/javascript"); //snippet
    },
    // 获取控件属性值
    getValue() {
      return this.args.value;
    },

    // 设置控件属性值,item是查询到的对象数组
    setValue(value) {
      this.args.value = value;
      return this;
    },

    // 是否允许往里添加元素,null为不允许，[]为允许全部，非空为允许部分
    getAllow() {
      return null;
    },
    // 获取可继承属性
    getInherit() {
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
      if ("name" in args) this.args_name = this.filter_attributes.filter(x => x.attributeName == this.args.name).length > 0 ? this.args.name : "-1";
      return this;
    },

    // 获取表单项名
    getFormName() {
      return this.args.name;
    },

    // 获取插件的属性编辑框的dom元素
    getEditBoxComponent(){
      return this.$refs.editbox;
    },

    getEditBox(args) {
      this.t_edit = true;
      return this.$refs.edit;
    },

    // 获取插件名
    getName() {
      return name;
    },

    // 设置插件的显示类型，type=0为预览模式，type=1为运行模式，type=2为图标模式
    setDisplayType(type) {
      this.t_preview = false;
      this.t_show = false;
      this.t_icon = false;
      if (type == 0) this.t_preview = true;
      else if (type == 1) this.t_show = true;
      else if (type == 2) this.t_icon = true;
      return this;
    },

    // 设置插件的图标
    setIcon(id) {
      this.icon_url = id;
      return this;
    },

    getIcon() {
      return this.icon_url;
    },

    // 设置插件支持的数据类型，返回类型为数据类型的列表
    getDataType(args) {
      return this.dataTypes;
    },

    getDataFromAPI(query){
      var data;
      var params = {"condition": query};
      console.log("params", params);
      getEobj(this.itemValue.data.targetClass, params).then(
        res => {
          this.args.option.dataset.source = this.handleData(res.data.data);
          console.log("this.args.option.dataset.source@getDataFromAPI");
          console.log(this.args.option.dataset.source);
          this.render();
        }
      );
    },

    handleData(objs){
      var arr = [];
      var attrs = [];
      for (let oid in objs) {
        for (let attr in objs[oid]) {
          attrs.push(attr);
        }
        break;
      }
      arr.push(attrs);
      for (let oid in objs) {
        var values = [];
        for (let attr of attrs) {
          values.push(objs[oid][attr]);
        }
        arr.push(values);
      }

      return arr
    },

    /** echart */
    /**根据筛选数据条件 接收数据
     * @method function getChartSource
     * @param {*} query 查询条件
     * @returns {Array} source
     */
    async getChartSource(targetClass, query) {
      if (this.handleQueryData) {
        await this.handleQueryData({ targetClass: targetClass, query: query });
        // console.log("handleQueryData完毕", this.store.state.DWF_form.Entities, this.handleQueryData);
        const source = this._getViewData({
          targetClass: targetClass,
          query: query
        });
        return source;
      }
    },



    /**预览图表
     *@method function previewChartMethod
     *@param {Object} mychart echart实例化图表对象
     *@param {Object} option 设置项
     *@param {String} msg 错误信息提示
     */
    previewChartMethod(mychart, option, msg) {
      if (!mychart) {
        msg = "没有已经实例化的图表元素！";
        return;
      }
      mychart.dispose();
      mychart = echarts.init(this.$refs.previewbox);
      mychart.setOption(option);
    },

    //预览按钮 触发预览
    previewChart() {

      this.args.option.series = [];

      for (let i = 0; i < this.args.series.length; i++) {
        this.args.option.series = this.args.option.series.concat(
          this.args.series[i]
        );
      }
      console.log("series",this.args.series);
      this.createChartBar(this.args.option);
      console.log("previewChart", this.args.option);
      this.previewChartMethod(this.mychart, this.args.option, this.msg);
    },

    /**
     *@method 增加 显示一个系列
     *@param {Object} series 系列设置
     *@param {String} index 第几个图表
     */
    addChartSeriesObj(series, index) {
      if(!this.args.option.yAxis[index].type) {
        this.$Notice.warning({
          title: '提示',
          desc: '请先选择Y轴类型'
        });
      } else {
        if (!series[index]) {
          series[index] = [];
        }
        series[index].push({
          type: 'bar',
          encode: { x: "", y: "", tooltip: [] },
          xAxisIndex: index,
          yAxisIndex: index
        });
        this.$set(series, index, series[index]); //增加vue监听改变
      }

    },

    resizeChart() {
      if(this.t_preview||this.t_edit) {
        setTimeout(function() {
          let eleW = document.getElementsByClassName('echart-bar');
          for(var i = 0; i < eleW.length; i++){
            const eachPW = eleW[i].parentNode.clientWidth;
            var myChart = echarts.getInstanceByDom(eleW[i]);
            if(myChart) {
              myChart.resize();
            }
          }
        }, 200)
      }
    },

    async refreshChart(query) {
      console.log("refresh chart method called", query);
      await this.getDataFromAPI(query);
      console.log("this.args.option.dataset.source@refreshChart", this.args.option.dataset.source);
    },

    render(){
      if(!this.args.nameAttribute) {
        this.$Notice.warning({
          title: '提示',
          desc: '请先选择x轴'
        });
      }
      else if(this.args.valueAttribute.length == 0){
        this.$Notice.warning({
          title: '提示',
          desc: '请先选择y轴'
        });
      }
      else{
        this.args.option.xAxis = { name: this.args.xAxisname, type: "value", axisLine: {onZero: false} };
        this.args.option.yAxis = { name: this.args.yAxisname, type: "value", axisLine: {onZero: false} };
        this.args.option.series = [];

        for(let index of this.valueIndex){
            this.args.option.series.push({
                type:"line",
                smooth: true,
                symbolSize: 1,
                data: (() => {
                    var res = [];
                    this.args.option.dataset.source.slice(1).slice(0,1024).forEach(x => (res.push(
                        (() => {
                            let res = [];
                            res.push(x[this.nameIndex]);
                            res.push(x[this.valueIndex]);
                            return res;
                        })()
                        )));
                    return res;
                })(),
            });
        }
        this.myChart.setOption(this.args.option);
        console.log("render done");
      }

    },

    // 是否需要数据导出按钮
    changeExport(status) {
        this.args.isExport = status;
    },

    // 选择需要导出的属性
    chooseAttr() {
      this.args.beforeExport = true;
      this.args.exportColumns = [];

      // 表头数据
      this.args.exportAttr.forEach((item, index) => {
        const eachColumn = {
          title: item,
          key: item,
          tooltip: true,
          align: 'center'
        }
        this.args.exportColumns.splice(index, 0, eachColumn);
      })
    },

    // 导出数据到本地 .csv
    exportData() {
      if(this.args.exportColumns.length == 0) {
        this.$Message.error('您还为选择任何需要导出的属性')
      } else {
        this.$refs.exportTable.exportCsv({
          filename: `实体类 ${this.itemValue.data.targetClass}的数据`
        });
      }
    },

    // 确认追加混合图脚本内容
    confirmScript() {
      this.showScriptModal = false;
      console.log(this.args.echartScript);
    },
    // 关闭脚本编辑弹窗
    cancelScript() {
      this.showScriptModal = false;

      this.echartScript = '';
    }
  }
};
</script>

<style scoped>
/*
    插件的css部分
    设置display为inline，默认不换行
    scoped表示样式仅在该vue文件内有效
*/
section {
  display: block;
}
/* .chartView {
  margin: 5px 0 10px 0;
  padding: 5px;
} */
.addPreviewChart,
.series {
  margin: 5px 0;
  height: 30px;
  line-height: 30px;
}
.m5 {
  margin: 5px 0;
}
.editsection {
  /* height: 700px; */
  padding-bottom: 20px;
  overflow-y: auto;
}
.modelRow {
  margin-bottom: 10px;
}
.seriesWrap {
  width: 96%;
  margin: 10px 2%;
  border-bottom: 1px solid #ccc;
}
.seriesItem {
  margin-right: 8px;
  font-size: 12px !important;
  color: #212121;
}
.seriesIcon {
  cursor: pointer;
  color: #999;
}

.exportData-btn {
  width: 100%;
  height: 40px;
  line-height: 40px;
}

.overTxt {
   text-overflow: ellipsis;
   overflow: hidden;
   white-space: nowrap;
}
</style>
