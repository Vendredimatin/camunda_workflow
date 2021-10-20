<template>
    <section :addinName="name" ref="main" v-show="!args.hided">
        <!-- <label v-if="args.label">{{ args.label }}: </label> -->
        <div class="exportData-btn modelRow" v-show="args.isExport">
          <Button type="default" icon="ios-download-outline" style="float: right;" @click="exportData" :disabled="isMweb">导出数据</Button>
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

const name = "ScatterChart";
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
        title: '散点图',
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
            left: "center",
            textStyle:{
              color: '#333'
            }
          },
          legend: {
            bottom: "0",
            data: [],
            textStyle: {
              color: '#333'
            }
          },
          tooltip: {},
          toolbox: {
            show: true,
            orient: "vertical",
            left: "right",
            top: "center",
            iconStyle: {
              color: ''
            },
            feature: {
              mark: { show: true },
              dataView: { show: true, readOnly: false },
            //   magicType: {
            //     show: true,
            //     type: ["line", "bar", "stack", "tiled"]
            //   },
            //   restore: { show: true },
              saveAsImage: { show: true }
            }
          },
          //数据存储
          dataset: {
            source: []
          },
          xAxis: [],
          yAxis: [],
          grid: [],
          series: []
        },
        series: [],
        refClass: ""
      },

      // 初始化事件 and 点击某柱状图柱形系列
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
    

    if(this.args.series.length > 0) {
      
      this.previewChart();

      setTimeout(function() {

        let eleW = document.getElementsByClassName('echart-bar');
        for(var i = 0; i < eleW.length; i++){
          const eachPW = eleW[i].parentNode.clientWidth;
          var myChart = echarts.getInstanceByDom(eleW[i]);
          myChart.resize();
        }

      }, 100)
      // let that = this;
      // setTimeout(function() {
      //   console.log(that.mychart);
      //   that.mychart.resize();
      // }, 3000)

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
    arg_height() {
      return this.args.height + "px";
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

    //end
    /** echart */
    /**根据筛选数据条件 接收数据
     * @method function getChartSource
     * @param {*} query 查询条件
     * @returns {Array} source
     */
    async getChartSource(targetClass, query) {
      if (this.handleQueryData) {
        await this.handleQueryData({ targetClass: targetClass, query: query });
        console.log("handleQueryData完毕");
        const source = this._getViewData({
          targetClass: targetClass,
          query: query
        });
        console.log("getter二维数组", source);
        return source;
      }
    },

    // 选择堆叠 y轴可多选
    changeToPileBar(val) {
      if(val == 'crossPile' || val == 'verticalStack') {
        this.isPile = true;
        this.modalValue.y = [];
      } else {
        this.isPile = false;
        this.modalValue.y = '';
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
      if(this.clickFlag) {
        mychart.on('click', function(params) {
          console.log(params);
        })
      }
      mychart.setOption(option);
      console.log("lalalalalalala",option);
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

      this.transLabel();
      this.createChartBar(this.args.option);
      console.log("previewChart", this.args.option);
      this.previewChartMethod(this.mychart, this.args.option, this.msg);

    },

    /** 
     * @description x轴label文字长度超过6 显示...
    */
    transLabel() {
      this.args.option.xAxis[0].axisLabel = {
        interval: 0,
        formatter: function(val) {
          val = val + '';
          if (val.length && val.length > 5) {
            return val.substring(0, 6) + '...';
          } else {
            return val;
          }
        }
      }
    },

    /**
     *@method 增加显示图表
     *@param {Object} option 设置项
     *@param {String} msg 错误信息提示
     */
    addPreviewChart(option) {
      console.log("optionnnnn", option);
      let len = option.xAxis.length;
      option.xAxis.push({ type: "category", gridIndex: len });
      option.yAxis.push({ gridIndex: len });
      option.grid.push({ top: "50", left: "50", right: "50", bottom: "50" });
      // option.series.push({type: 'bar', xAxisIndex: len, yAxisIndex: len});
    },

    /**
     *@method 增加 显示一个系列
     *@param {Object} series 系列设置
     *@param {String} index 第几个图表
     */
    addChartSeriesObj(series, index) {
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
    },

    //按钮触发 增加显示一个系列
    addChartSeries(index) {
      this.addChartSeriesObj(this.args.series, index);
    },

    //modal 弹窗
    ok() {
      this.$Message.info("设置保存");
      this.modalValueToSeries();
    },

    cancel() {
      // this.$Message.info("取消设置");
    },

    modalShow(i, j) {
      this.modal = true;

      // 刚刚新增加的系列 还未设置
      if(!this.args.series[i][j].name) {
        this.yType = 'left';
        this.modalValue.i = i;
        this.modalValue.j = j;
        this.modalValue.type = "bar";
        this.isPile = false;
        this.modalValue.tooltip = [];

        // 需考虑当前X轴是 category \ value
        if(this.args.option.xAxis[i].type == 'category') {
          this.modalValue.y = "";
        } else {
          this.modalValue.x = "";
        }

      } else {                  // 已有设置 回填数据
        this.yType = this.args.series[i][j].yPosition;
        this.modalValue.i = i;
        this.modalValue.j = j;
        this.modalValue.type = this.args.series[i][j].type;
        this.modalValue.y = this.args.series[i][j].encode.y;
        this.modalValue.tooltip = this.args.series[i][j].encode.tooltip;
      }
      console.log("i", i, "j", j, this.args.series[i][j], this.args.series[i][j].name);
    },

    //弹窗设置的值 赋给对应的series
    modalValueToSeries() {
      // 是否需要堆叠 横向 & 纵向
      if(this.modalValue.type == "crossPile" || this.modalValue.type == "verticalStack") {
        
        this.args.series[0].splice(this.modalValue.j, 1);

        // 横向堆叠
        if(this.modalValue.type == "crossPile") {

          this.modalValue.y.forEach((item, index) => {

            let eachSeries = {
              name: item,
              type: 'bar',
              encode: {
                x: this.modalValue.x,
                y: item,
                tooltip: this.modalValue.tooltip || item
              },
              selfEname: item,
              yPosition: this.yType
            }
            this.args.series[0].push(eachSeries);
            this.args.option.legend.data.push(item);

          })
        } else {                    // 纵向堆叠
          this.modalValue.y.forEach((item, index) => {

            let eachSeries = {
              name: item,
              type: 'bar',
              stack: '堆叠',
              encode: {
                x: this.modalValue.x,
                y: item,
                tooltip: this.modalValue.tooltip || item
              },
              selfEname: item,
              yPosition: this.yType
            }
            this.args.series[0].push(eachSeries);
            this.args.option.legend.data.push(item);

          })
        }
      } else {
        const o = {
          x: this.modalValue.x,
          y: this.modalValue.y,
          tooltip: this.modalValue.tooltip
        };
        
        console.log('设置系列啦啦啦啦啦', this.args.series);
        this.args.series[this.modalValue.i][this.modalValue.j].name = this.modalValue.y;
        this.args.series[this.modalValue.i][this.modalValue.j].type = this.modalValue.type;
        this.args.series[this.modalValue.i][this.modalValue.j].encode = o;
        this.args.series[this.modalValue.i][this.modalValue.j].selfEname = this.modalValue.y;
        this.args.series[this.modalValue.i][this.modalValue.j].yPosition = this.yType;
        this.args.option.legend.data.push(this.modalValue.y);

        // Label文本超过五个字显示为... 鼠标移入有tips全部提示
        this.transLabel();

      }

      // 当选择右Y时 才追加yAxisIndex属性
      if(this.yType == 'right') {
        this.args.series[this.modalValue.i][this.modalValue.j].yAxisIndex = this.modalValue.j;
        const yObj = {
          type: 'value',
          position: this.yType
        }
        this.args.option.yAxis.push(yObj);
      }

      // 直接画图
      this.previewChart();
    },

    /**创建柱状图
     *@method function createChartBar
     *@param {object} option echart配置项
     *@returns {null}
     */
    createChartBar(option) {

      console.log("option", option);
      console.log("echartDom", this.mychart);
      this.mychart = echarts.init(this.$refs.previewbox);
      this.mychart.setOption(option);

    },

    // 删除某系列
    delSeries(j) {
      this.delModel = true;
      this.delSeriesIndex = j;
    },

    confirmDel() {

      this.args.series[0].splice(this.delSeriesIndex, 1);
      this.args.option.series.splice(this.delSeriesIndex, 1);

      this.previewChart();

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

    // 避免X Y轴选择相同的类型
    avoidSameY(e, index) {
      if(e == 'value') {
        this.args.option.xAxis[index].type = 'category';
      } else {
        this.args.option.xAxis[index].type = 'value';
      }
    },

    avoidSameX(e, index) {
      if(e == 'value') {
        this.args.option.yAxis[index].type = 'category';
      } else {
        this.args.option.yAxis[index].type = 'value';
      }
    }

    
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