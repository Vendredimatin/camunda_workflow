<template>
    <section :addinName="name" ref="main" v-show="!args.hided" :style="{'width': arg_width}">
        <!-- <label v-if="args.label">{{ args.label }}: </label> -->
        <div class="exportData-btn modelRow" v-show="args.isExport">
          <Button type="ghost" icon="ios-download-outline" style="float: right;" @click="exportData" :disabled="isMweb">导出数据</Button>
        </div>
        <div class="echart-bar" ref='previewbox' id="ebox" :style="{'width': '100%', 'height': arg_height}"></div>
        <!-- 导出数据前的预览 -->
        <Modal
            v-model="args.beforeExport"
            width="60%"
            title="即将导出的数据">
            <Table :columns="args.exportColumns" :data="args.exportTable" ref="exportTable"></Table>
        </Modal>
        <!-- <div class="echart-bar" ref='showbox'></div> -->
        <h3 v-if="args.msg">{{args.msg}}</h3>
    </section>

</template>

<script>
import EntityModeling from "@/api/data-model/EntityModeling";
import Axios from "@/libs/axios.js";
import "@/styles/component/iconfont.css";
import { getEobj } from '@/api/others';
// 引入 ECharts 主模块
var echarts = require("echarts");

const name = "CurveChart";
export default {
  // 插件名
  name: name,
  props: ['itemValue', 'store'],
  data() {
    return {
      // 插件名
      name: name,

      // 展示模式
      t_create: false,
      t_edit: false,
      t_visit: true,
      isMweb: false,

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
      args: {
        title: '曲线图',
        id: null,
        value: "",
        echartName: "",
        label_width: 2,
        main_width: 3,
        label_align: 4,
        main_align: 4,
        targetDataType: null,
        // 布局插件所需属性
        rows: 0,
        cols: 0,
        label: "",
        name: "",
        width:  100,
        widthType: "%",
        heightType: "px",           // 整体高度的单位
        height: 400,
        switchExport: false,
        isExport: false,
        beforeExport: false,
        exportAttr: [],
        exportColumns: [],
        exportTable: [],

        echartScript: '',     //内部脚本
        //echart
        // 查询条件
        query: "",
        //数据配置
        option: {
          title: {
            text: "",
            left: "center"
          },
          legend: {
            bottom: "0",
            data: []
          },
          tooltip: {},
          toolbox: {
            show: true,
            orient: "vertical",
            left: "right",
            top: "center",
            // feature: {
            //   mark: { show: true },
            //   dataView: { show: true, readOnly: false },
            //   magicType: {
            //     show: true,
            //     type: ["line", "bar", "stack", "tiled"]
            //   },
            //   restore: { show: true },
            //   saveAsImage: { show: true }
            // }
          },
          //数据存储
          dataset: {
            source: []
          },
          xAxis: {
            name: "x坐标",
          },
          yAxis: {
            name: "y坐标",
          },
          series: []
        },
        series: [],
        refClass: ""
      },

      // 初始化事件 and 点击某曲线图柱形系列
      initFlag: null,
      clickFlag: null,

      watchWidth: null,
      yType: 'left',
      modal: false,
      isPile: false,
      isHasX: false,
      delModel: false,
      delSeriesIndex: -1,    // 删除系列索引
      modalValue: {
        i: "",
        j: "",
        type: "",
        x: "",
        y: "",
        y_x: "",
        tooltip: []
      },
      msg: "", //提示内容
      mychart: {}, //echart init 图标实例
      chartTypeList: ["bar", "line", "crossPile", "verticalStack"],
      // chartTypeList: ["bar", "line"],
      xAxisTypeList: ["category", "value"],
      yAxisTypeList: ["category", "value"],
      allEntityClasses: [],

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
      attrMap: {},
      relationAttrMap: {},
      relationClassAttrMap: {}
    };
  },
  // 生命周期函数，在获取数据和事件函数后调用，
  created() {
  },
  // 生命周期函数，在dom元素生成之后调用
  async mounted() {

    // 获取当前类的全部对象
    if(this.itemValue.data) {
      getEobj(this.itemValue.data.targetClass).then(response => {
        const res = response.data;
        if(res.success) {
          this.args.exportTable = res.data;
        }
      }).catch(e => {
        console.log(e);
      });
    }

    // 事件处理
    if(this.args.events && this.args.events.length > 0) {

      this.initFlag = this.args.events.find((val) => {
        return val.name == '初始化'
      })

      this.clickFlag = this.args.events.find((val) => {
        return val.name == '点击系列'
      })

      // 初始化事件 mounted执行
      if(this.initFlag) {
        this.invokeOperation(this.initFlag.opr_type, this.initFlag.opr_path, this.itemValue, this.store);
      }

    }
    

    if(this.args.option.series.length > 0) {
      
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

    //内部脚本 销毁重绘
    if(this.args.echartScript != '') {
      try{

        let Escrpt = new Function(this.args.echartScript).call(this.args.option);

        this.mychart.dispose();
        this.mychart = echarts.init(this.$refs.previewbox);
        this.mychart.setOption(this.args.option);
        
      } catch(e) {

        console.log(e);

      }
    }

  },
  watch: {
    allEntityClasses(val) {},

    watchWidth (val, oldval) {
      console.log(val, oldval);
    }
    // end
  },
  computed: {

    nameIndex(){
      var dimensions = this.args.option.dataset.source[0];
      return dimensions.indexOf(this.args.nameAttribute);
    },

    valueIndex(){
      var dimensions = this.args.option.dataset.source[0];
      return this.args.valueAttribute.map(attr => dimensions.indexOf(attr));
    },

    labelWidth() {
      return (
        parseInt(
          (100 * this.args.label_width) /
            (this.args.label_width + this.args.main_width)
        ) + "%"
      );
    },
    mainWidth() {
      return !this.args.label || this.args.label == ""
        ? "100%"
        : parseInt(
            (100 * this.args.main_width) /
              (this.args.label_width + this.args.main_width)
          ) + "%";
    },
    arg_width() {
      return this.args.width + this.args.widthType;
    },
    arg_height() {
      return this.args.height + this.args.heightType;
    },
    labelXAlign() {
      let x = parseInt(this.args.label_align / 3);
      if (x == 0) return "left";
      else if (x == 1) return "center";
      else return "right";
    },
    labelYAlign() {
      let x = this.args.label_align % 3;
      if (x == 0) return "top";
      else if (x == 1) return "middle";
      else return "bottom";
    },
    mainXAlign() {
      let x = parseInt(this.args.main_align / 3);
      if (x == 0) return "left";
      else if (x == 1) return "center";
      else return "right";
    },
    mainYAlign() {
      let x = this.args.main_align % 3;
      if (x == 0) return "top";
      else if (x == 1) return "middle";
      else return "bottom";
    }
  },
  // 定义组件的函数接口
  methods: {
    //start
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
      
      return this;
    },

    // 获取表单项名
    getFormName() {
      return this.args.name;
    },

    // 获取插件的属性编辑框的dom元素
    getEditBox(args) {
      this.t_edit = true;
      return this.$refs.edit;
    },

    // 获取插件名
    getName() {
      return name;
    },

    setDisplayType(type) {
        this.t_create = false;
        this.t_edit = false;
        this.t_visit = false;
        if (type == "create") {
            this.t_create = true;
        }
        else if (type == "edit") {
            this.t_edit = true;
        }
        else if (type == "visit") {
            this.t_visit = true;
        }
        return this;
    },

    setError(error) {
        var dom = this.$refs.main.querySelector(".i-input .ivu-input");
        if (dom) dom.style.borderColor = error ? "red" : null;
    },
    validate() {
        if (!this.value) {
            this.setError();
            return false;
        }
        return true;
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

    async refreshChart(query) {
      console.log("refresh chart method called", query);
      await this.getDataFromAPI(query);
      console.log("this.args.option.dataset.source@refreshChart", this.args.option.dataset.source);
      // this.render();
    },

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


    render(){
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
                    this.args.option.dataset.source.slice(1).forEach(x => (res.push(
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

    

    
    // ...mapActions("chart", {
    //   get1: "getData2",
    //   get2: "getViewDataAction",
    //   get3: "getViewDataActionCondition",
    // })
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
.chartView {
  margin: 5px 0 10px 0;
  padding: 5px;
}
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
  height: 700px;
  padding-bottom: 100px;
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
</style>