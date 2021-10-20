<template>
    <section :addinName="name" v-if="t_preview" ref="main" :style="{'width': arg_width}">
        <!-- <div class="echart-bar" ref='previewbox' id="box" :style="args.style"></div> -->
        <div class="exportData-btn" v-show="args.isExport">
          <Button type="default" icon="ios-download-outline" style="float: right;" @click="exportData" :disabled="args.isMweb">导出数据</Button>
        </div>
        <!-- <div class="echart-bar" ref='previewbox' id="box" :style="{'width': '100%', 'height': args.isExport ? ((parseInt(arg_height) - 40) + 'px') : arg_height}"></div> -->
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
                            <!-- <p>图表项名(用于查询框识别标识)</p>
                            <Input class="modelRow" v-model="args.name"></Input> -->
                            <p class="margin1">图表标题</p>
                            <Input class="margin1" v-model="args.option.title.text"></Input>

                            <p class="margin1">最大数据数量</p>
                            <InputNumber class="margin1" v-model="args.maxNum" min='0' step='1'></InputNumber>

                            <div class="chartView" v-for="(item , index) in args.option.xAxis" :key="index">
                                <!-- <p>引用类</p>
                                <Select v-model="args.refClass">
                                    <Option v-for="entity in allEntityClasses" :value="entity.className" :key="entity.id" :label="entity.displayName"></Option>
                                </Select> -->
                                <div v-show="index == 0">
                                    <p class="margin1">X轴类型</p>
                                    <Select v-model="item.type" class="margin1" @on-change="avoidSameX($event, index)">
                                        <Option v-for="(i,j) in xAxisTypeList" :value="i" :key="j">{{i}}</Option>
                                    </Select>
                                    <p class="margin1">Y轴类型</p>
                                    <Select v-model="args.option.yAxis[index].type" class="margin1" @on-change="avoidSameY($event, index)">
                                        <Option v-for="(i,j) in yAxisTypeList" :value="i" :key="j">{{i}}</Option>
                                    </Select>
                                    <!-- 是否带有导出数据按钮 -->
                                    <p class="margin1">是否需要数据导出</p>
                                    <i-switch class="margin1" v-model="args.switchExport" @on-change="changeExport" />
                                    <!-- 选择需要导出的属性 -->
                                    <div v-show="args.isExport">
                                      <p class="margin1">选择需要导出的属性</p>
                                      <Select class="margin1" v-model="args.exportAttr" filterable multiple>
                                          <Option v-for="item in filter_attributes" :key="item.id" :value="item.attributeName">{{ item.displayName }}</Option>
                                          <!-- <Option v-for="(item,index) in args.option.dataset.source[0]" :value="item" :key="index">{{item}}</Option> -->
                                      </Select>
                                      <Button type="primary" class="margin1" @click="chooseAttr" style="margin-right: 6px;">确认</Button>
                                      <Button class="margin1" @click="args.exportAttr = []">重置</Button>
                                    </div>
                                    <p class="margin1">图表与容器内部距离</p>
                                    <Row>
                                        <Col class="m5" span="3">
                                        <p style="padding-left:3px">上:</p>
                                        </Col>
                                        <Col class="m5" span="9"><Input v-model="args.option.grid[index].top" placeholder="距离边界的长度"></Input></Col>
                                        <Col class="m5" span="3">
                                        <p style="padding-left:3px">下:</p>
                                        </Col>
                                        <Col class="m5" span="9"><Input v-model="args.option.grid[index].bottom" placeholder="距离边界的长度"></Input></Col>
                                        <Col class="m5" span="3">
                                        <p style="padding-left:3px">左:</p>
                                        </Col>
                                        <Col class="m5" span="9"><Input v-model="args.option.grid[index].left" placeholder="距离边界的长度"></Input></Col>
                                        <Col class="m5" span="3">
                                        <p style="padding-left:3px">右:</p>
                                        </Col>
                                        <Col class="m5" span="9"><Input v-model="args.option.grid[index].right" placeholder="距离边界的长度"></Input></Col>
                                    </Row>
                                    <h3 style="margin: 10px 0;">图表系列配置</h3>
                                    <Row class="series seriesWrap" style="font-size: 12px;">
                                    <Col span="14">
                                        <span>系列映射属性</span>
                                    </Col>
                                    <Col span="10">
                                        <Button type="text" size="small" @click="addChartSeries(index)">
                                        添加系列
                                        <Icon type="md-add"></Icon>
                                        </Button>
                                    </Col>
                                    </Row>
                                    <!-- <p class="m5">系列
                                        <Button type="primary" size="small" @click="addChartSeries(index)">增加系列</Button>
                                    </p> -->
                                    <div class="series" v-for="(i,j) in args.series[index]" :key="j">
                                        <!-- <p>
                                            "{{j}}:{{i.xAxisIndex}}";
                                            "{{args.series[index][j].type}}";
                                            "{{args.series[index][j].encode.x}}";
                                            "{{args.series[index][j].encode.y}}";
                                        </p> -->
                                        <Row class="seriesWrap">
                                        <Col span="14" class="overTxt">
                                            <span class="seriesItem seriesTxt">{{j}}</span>
                                            <span class="seriesTxt">{{args.series[index][j].selfEname}}</span>
                                        </Col>
                                        <Col span="10" style="text-align: right;">
                                            <span class="seriesItem seriesTxt">{{args.series[index][j].type}}</span>
                                            <span class="seriesItem seriesIcon" @click="modalShow(index, j)">
                                            <Icon type="md-settings"></Icon>
                                            </span>
                                            <span class="seriesIcon" @click="delSeries(j)">
                                            <Icon type="md-close"></Icon>
                                            </span>
                                        </Col>
                                        </Row>
                                        <!-- <Button type="primary" @click="modalShow(index,j)" size="small">设置 系列</Button> -->
                                    </div>
                                </div>
                            </div>
                            <!-- <Button class="addPreviewChart" type="primary" size="small" @click="addPreviewChart(args.option)">增加显示图表</Button> -->
                            <br>
                            <!-- <Button type="success" long @click="previewChart">刷新图表</Button> -->
                            <Button type="success" long @click="showScriptModal = true">添加脚本</Button>
                        </Form>
                    </div>
                </div>
                <div slot="layout">
                </div>
                <div slot="operation">
                </div>
            </EditBox>

            <Modal v-model="modal" title="设置系列" @on-ok="ok" @on-cancel="cancel">
                <Row class="modelRow">
                    <Col span="6">
                      <span>x轴</span>
                    </Col>
                    <Col span="16">
                    <!-- <Select v-model="modalValue.x">
                        <Option v-for="(item,index) in args.option.dataset.source[0]" :value="item" :key="index">{{item}}</Option>
                    </Select> -->
                    <Select v-model="modalValue.x" :disabled="(modalValue.x != '' &&  args.series[0].length > 1 && args.option.xAxis[0].type == 'category')" filterable :multiple="isXPile">
                        <!-- <Option v-for="(item, index) in filter_attributes" :key="index" :value="item.attributeName">{{ item.displayName }}</Option> -->
                        <Option v-for="(item, index) in filter_attributes" :key="index" :value="item.attributeName" :label="item.displayName">
                          <span>{{ item.displayName }}</span>
                          <span style="float:right;color:#ccc">{{ item.attributeName }}</span>
                        </Option>
                    </Select>
                    </Col>
                </Row>
                <Row class="modelRow">
                    <Col span="6">
                      <span>y轴</span>
                    </Col>
                    <Col span="16">
                    <!-- <Select v-model="modalValue.y">
                        <Option v-for="(item,index) in args.option.dataset.source[0]" :value="item" :key="index">{{item}}</Option>
                    </Select> -->
                    <Select v-if="reloadY" ref="ySelect" v-model="modalValue.y" :disabled="!yIsCategory &&  args.series[0].length > 1" filterable :multiple="isPile">
                        <!-- <Option v-for="(item, index) in filter_attributes" :key="index" :value="item.attributeName">{{ item.displayName }}</Option> -->
                        <Option v-for="(item, index) in filter_attributes" :key="index" :value="item.attributeName" :label="item.displayName">
                          <span>{{ item.displayName }}</span>
                          <span style="float:right;color:#ccc">{{ item.attributeName }}</span>
                        </Option>
                    </Select>
                    </Col>
                </Row>
                <Row class="modelRow" v-show="yIsCategory">
                  <Col span="6">
                    <span>y轴位置</span>
                  </Col>
                  <Col span="16">
                      <RadioGroup v-model="yType">
                        <Radio label="left"></Radio>
                        <Radio label="right"></Radio>
                      </RadioGroup>
                  </Col>
                </Row>
                <p style="height: 30px; line-height: 30px; border-bottom: 1px solid #ddd;">悬停提示内容</p>
                <Row>
                    <Col span="24">
                    <!-- <checkbox-group v-model="modalValue.tooltip">
                        <checkbox v-for="(item, index) in args.option.dataset.source[0]" :key="index" :label="item"></checkbox>
                    </checkbox-group> -->
                      <checkbox-group v-model="modalValue.tooltip">
                        <checkbox v-for="(item, index) in filter_attributes"
                        :key="index"
                        :label="item.attributeName"
                        style="width: 30%; margin: 5px; overflow: hidden; white-space: nowrap; text-overflow: ellipsis;"></checkbox>
                      </checkbox-group>
                    </Col>
                </Row>
                <!-- <p><Button type="primary" long @click="modalValueToSeries">完成</Button></p>    -->
            </Modal>
        </span>
        <Modal
          v-model="delModel"
          title="提示"
          @on-ok="confirmDel(index)"
          @on-cancel="cancel">
          <p>确认删除当前系列么?</p>
        </Modal>

        <!-- 最大化编辑器 -->
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
                折线图
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

const name = "LineChart";
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
        title: '折线图',
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
        maxNum: 100,
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
            feature: {
              mark: { show: true },
              // dataView: { show: true, readOnly: false },
              // magicType: {
              //   show: true,
              //   type: ["line", "bar", "stack", "tiled"]
              // },
              // restore: { show: true },
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
      watchWidth: null,
      yType: 'left',
      modal: false,
      isPile: false,
      isXPile: false,
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

        EntityModeling.getAllEntities()
          .then(res => {
            this.allEntityClasses = res.data;
          })
          .catch(error => {
            this.$Message.error("获取实体类失败：" + error.response.data.message);
          });

        this.args.option.dataset.source = await this.getChartSource(
          this.itemValue.data.targetClass,
          ""
        ); //获取数据，整理数据
        console.log(
          "this.args.option.dataset.source",
          this.args.option.dataset.source
        );
        console.log(this.getEn(this.itemValue.data.targetClass));
        // this.createChartBar(this.args.option);

        // this.addPreviewChart(this.addPreviewChart(this.args.option));
        if(this.args.series.length == 0) {
          this.addPreviewChart(this.args.option);
        }
    }

    // if (this.t_show) {
    //   this.previewChart();
    // }
    if(this.args.series.length > 0) {

      this.previewChart();

    }

  },
  watch: {
    allEntityClasses(val) {},

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
      return this.args.height + "px";
    },
    // 需要用到实体类属性列表时使用
    arg_name() {
      return this.args.name;
    },
    filter_attributes() {
      return this.attributes
        ? this.attributes.filter(x => this.dataTypes.indexOf(x.valueType) > -1)
        : [];
    }
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


    //resizeChart()
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
        // console.log("getter二维数组", source);
        return source;
      }
    },

    // 选择堆叠 y轴可多选
    changeToPileBar(val) {
      if(this.editChange) return;
      if(val == 'crossPile' || val == 'verticalStack') {
        // 横向展示数据
        if(this.seriesYType == 'category') {
          this.isPile = false;
          this.isXPile = true;
          this.modalValue.x = [];
        } else {
          this.isXPile = false;
          this.isPile = true;
          this.modalValue.y = [];
        }
      } else {
        if(this.seriesYType == 'category') {
          this.isPile = false;
          this.isXPile = false;
          this.modalValue.x = '';
        } else {
          this.isPile = false;
          this.isXPile = false;
          this.modalValue.y = '';
        }
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
      option.yAxis.push({ type: "value", gridIndex: len });
      option.grid.push({ top: "50", left: "50", right: "50", bottom: "50" });
      // option.series.push({type: 'bar', xAxisIndex: len, yAxisIndex: len});
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
          type: 'line',
          encode: { x: "", y: "", tooltip: [] },
          xAxisIndex: index,
          yAxisIndex: index
        });
        this.$set(series, index, series[index]); //增加vue监听改变
      }

    },

    //按钮触发 增加显示一个系列
    addChartSeries(index) {
      this.addChartSeriesObj(this.args.series, index);
    },

    //modal 弹窗
    ok() {
      this.$Message.info("设置保存");
      this.modalValueToSeries();
      this.reloadY = false;
    },

    cancel() {
      this.reloadY = false;
    },

    modalShow(i, j) {
      this.reloadY = true;
      this.isPile = false;
      // this.modalValue.y = '';


      this.seriesYType = this.args.option.yAxis[i].type;
      this.modal = true;

      // 刚刚新增加的系列 还未设置
      if(!this.args.series[i][j].name) {
        this.editChange = false;
        this.yType = 'left';
        this.modalValue.i = i;
        this.modalValue.j = j;
        this.modalValue.type = "line";
        this.isPile = false;
        this.isXPile = false;
        this.modalValue.tooltip = [];

        // 需考虑当前X轴是 category \ value
        if(this.args.option.xAxis[i].type == 'category') {
          this.modalValue.y = "";
        } else {
          this.modalValue.x = "";
          this.yIsCategory = false;
        }

      } else {                  // 已有设置 回填数据

        // 已有数据的编辑状态 editChange = true 防止Function@changeToPileBar 将回填数据置空
        this.editChange = true;

        this.yType = this.args.series[i][j].yPosition;
        this.modalValue.i = i;
        this.modalValue.j = j;
        this.modalValue.type = this.args.series[i][j].type;

        console.log(this.seriesYType);
        // 判断当前X轴是否为category 并且是否为堆叠数据 两种情况 (横向数据 & 纵向数据)
        // if(this.seriesYType == 'category' && (this.modalValue.type == 'crossPile' || this.modalValue.type == 'verticalStack')) {

        //   this.isXPile = false;

        // } else {

        //   this.isPile = false;

        // }

        if(this.seriesYType == 'category') {

          this.isXPile = false;
          this.modalValue.y = this.args.series[i][j].encode.y;
          this.modalValue.x = this.args.series[i][j].selfEname;

        } else {

          this.isPile = false;
          this.modalValue.y = this.args.series[i][j].selfEname;
          this.modalValue.x = this.args.series[i][j].encode.x;

        }

        this.modalValue.tooltip = this.args.series[i][j].encode.tooltip;

      }
      console.log("i", i, "j", j, this.args.series[i][j], this.args.series[i][j].name);
    },

    //弹窗设置的值 赋给对应的series
    modalValueToSeries() {
      // 横向展示数据
      if(this.seriesYType == 'category') {
        // 是否需要堆叠 横向 & 纵向
        if(this.modalValue.type == "crossPile" || this.modalValue.type == "verticalStack") {
          this.args.series[0].splice(this.modalValue.x, 1);
          // 横向堆叠
          if(this.modalValue.type == "crossPile") {
            this.modalValue.x.forEach((item, index) => {
              let tipName = this.filter_attributes.filter(val => val.attributeName == item)[0].displayName;
              let eachSeries = {
                name: tipName,
                type: 'bar',
                encode: {
                  x: item,
                  y: this.modalValue.y,
                  tooltip: this.modalValue.tooltip
                },
                selfEname: item,
                yPosition: this.yType
              }
              this.args.series[0].push(eachSeries);
              this.args.option.legend.data.push(tipName);
            })
          } else {                    // 纵向堆叠
            this.modalValue.x.forEach((item, index) => {
              let tipName = this.filter_attributes.filter(val => val.attributeName == item)[0].displayName;
              let eachSeries = {
                name: tipName,
                type: 'bar',
                stack: '堆叠',
                encode: {
                  x: item,
                  y: this.modalValue.y,
                  tooltip: this.modalValue.tooltip
                },
                selfEname: item,
                yPosition: this.yType
              }
              this.args.series[0].push(eachSeries);
              this.args.option.legend.data.push(tipName);
            })
          }
        } else {
          const o = {
            x: this.modalValue.x,
            y: this.modalValue.y,
            tooltip: this.modalValue.tooltip
          };

          let tipName = this.filter_attributes.filter(item => item.attributeName == this.modalValue.x)[0].displayName;
          this.args.series[this.modalValue.i][this.modalValue.j].name = tipName;
          // this.args.series[this.modalValue.i][this.modalValue.j].name = this.modalValue.x;
          this.args.series[this.modalValue.i][this.modalValue.j].type = this.modalValue.type;
          this.args.series[this.modalValue.i][this.modalValue.j].encode = o;
          this.args.series[this.modalValue.i][this.modalValue.j].selfEname = this.modalValue.x;
          this.args.series[this.modalValue.i][this.modalValue.j].yPosition = this.yType;
          this.args.option.legend.data.push(tipName);
        }
      } else {
        // 是否需要堆叠 横向 & 纵向
        if(this.modalValue.type == "crossPile" || this.modalValue.type == "verticalStack") {
          this.args.series[0].splice(this.modalValue.j, 1);
          // 横向堆叠
          if(this.modalValue.type == "crossPile") {
            this.modalValue.y.forEach((item, index) => {
              let tipName = this.filter_attributes.filter(val => val.attributeName == item)[0].displayName;
              let eachSeries = {
                name: tipName,
                type: 'bar',
                encode: {
                  x: this.modalValue.x,
                  y: item,
                  tooltip: this.modalValue.tooltip
                },
                selfEname: item,
                yPosition: this.yType
              }
              this.args.series[0].push(eachSeries);
              this.args.option.legend.data.push(tipName);
            })
          } else {                    // 纵向堆叠

            this.modalValue.y.forEach((item, index) => {
              let tipName = this.filter_attributes.filter(val => val.attributeName == item)[0].displayName;
              let eachSeries = {
                name: tipName,
                type: 'bar',
                stack: '堆叠',
                encode: {
                  x: this.modalValue.x,
                  y: item,
                  tooltip: this.modalValue.tooltip
                },
                selfEname: item,
                yPosition: this.yType
              }
              this.args.series[0].push(eachSeries);
              this.args.option.legend.data.push(tipName);
            })
          }
        } else {
          const o = {
            x: this.modalValue.x,
            y: this.modalValue.y,
            tooltip: this.modalValue.tooltip
          };

          let tipName = this.filter_attributes.filter(item => item.attributeName == this.modalValue.y)[0].displayName;

          this.args.series[this.modalValue.i][this.modalValue.j].name = tipName;
          this.args.series[this.modalValue.i][this.modalValue.j].type = this.modalValue.type;
          this.args.series[this.modalValue.i][this.modalValue.j].encode = o;
          this.args.series[this.modalValue.i][this.modalValue.j].selfEname = this.modalValue.y;
          this.args.series[this.modalValue.i][this.modalValue.j].yPosition = this.yType;
          this.args.option.legend.data.push(tipName);

          console.log('设置系列啦啦啦啦啦', this.args.series, this.args.option.xAxis);
        }

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
        console.log(this.args.option.yAxis);

      }

      // ********** 如果X轴展示数据超过20个 启动dataZoom模式 ************
      if(this.args.option.dataset.source.length > 21) {
        this.args.option.dataZoom = [
          {
                  type: 'slider',
                  show: true,
                  start: 0,
                  end: 30,
                  handleSize: 8
              },
              {
                  type: 'inside',
                  start: 0,
                  end: 30
              },
              {
                  type: 'slider',
                  show: true,
                  yAxisIndex: 0,
                  filterMode: 'empty',
                  width: 12,
                  height: '70%',
                  handleSize: 8,
                  showDataShadow: false,
                  left: '93%'
              }
        ]
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

      if(this.args.option.series.length == 0) {
        this.args.option.dataZoom = [];
      }

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
    },

    // 确认追加折线图脚本内容
    confirmScript() {
      this.showScriptModal = false;
      console.log(this.args.echartScript);
    },
    // 关闭脚本编辑弹窗
    cancelScript() {
      this.showScriptModal = false;

      this.echartScript = '';
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
  height: 700px;
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
