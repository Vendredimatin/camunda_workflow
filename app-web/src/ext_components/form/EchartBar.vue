<template>
    <section :addinName="name" ref="main" v-show="!args.hided" :style="{'width': arg_width}">
        <!-- <label v-if="args.label">{{ args.label }}: </label> -->
        <!-- <div class="exportData-btn modelRow" v-show="args.isExport">
          <Button type="default" icon="ios-download-outline" style="float: right;" @click="exportData" :disabled="isMweb">导出数据</Button>
        </div> -->
        <div class="echart-bar self-mixBar" ref='previewbox' id="ebox" :style="{'width': '100%', 'height': arg_height}"></div>
        <!-- 导出数据前的预览 -->
        <!-- <Modal
            v-model="args.beforeExport"
            width="60%"
            title="即将导出的数据">
            <Table :columns="args.exportColumns" :data="args.exportTable" ref="exportTable"></Table>
        </Modal> -->
        <!-- <div class="echart-bar" ref='showbox'></div> -->
        <h3 v-if="args.msg">{{args.msg}}</h3>
    </section>

</template>

<script>
import { mapGetters, mapActions } from "vuex";
// import Axios from "@/libs/axios.js";
import "@/styles/component/iconfont.css";
import { getEntity } from "@/api/data-model/EntityModeling";
import { getRelation } from '@/api/data-model/RelationModeling';
// 引入 ECharts 主模块
var echarts = require("echarts");

const name = "EchartBar";
export default {
  // 插件名
  name: name,
  props: [
    'argsProps',
    'store',
    'itemValue',
    'formEngine',
    'dwf_ctx',
    'attributes',
    'query',
  ],
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

      curInt: -1,
      clickData: {},     // 单击选中系列对象
      classMap: [],
      allChartObj: [],
      actAttributes: [],

      // 编辑框
      args: {
        bindTargetClass: '',    // 目标类
        lEnClass: '',           // 目标类为关联类时 左右关联de实体类
        rEnClass: '',

        filterQuery: "",
        title: '柱形图',
        id: null,
        value: "",
        echartName: "",
        label_width: 2,
        main_width: 3,
        label_align: 4,
        main_align: 4,
        targetDataType: null,
        hided: false,
        maxNum: 10,
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
        // exportTable: [],

        // echartScript: '',     //内部脚本
        //echart
        // 查询条件
        query: "",
        selfLegend: '{name}',
        //数据配置
        option: {
          title: {
            text: "",
            left: "center",
            textStyle: {
              color: '#333'
            }
          },
          color: ['#31C5E9', '#9EE7B9', '#FFDB5C', '#FF9F7F','#FC7192', '#E062AE', '#E690D1','#E7BCF4', '#9D96F5', '#8277EA'],
          legend: {
            bottom: "0",
            data: [],
            textStyle: {
              color: '#333'
            },
            formatter: '{name}'
          },
          tooltip: {},
          toolbox: {
            show: true,
            iconStyle: {
              color: ''
            },
            orient: "vertical",
            left: "right",
            top: "center",
            feature: {
              mark: { show: true },
              dataView: { show: true, readOnly: false },
              magicType: {
                show: true,
                type: ["line", "bar", "stack", "tiled"]
              },
              restore: { show: true },
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
      attrMap: {}
    };
  },
  inject:[
    'getEn',
    'getJsonData',
    'getParentJson',
    'getObj',
    'GetAddinById',
    'GetAddinByUUID',
    'GetAllAddin',
    'getParentAddin',
    '_getViewData',
    '_getViewDataByAttrs',
    'handleQueryData',
    'getClassObject',
    'getRClassObject',
    'invokeOperation',
    'parseEscapeString',
    'handleScript',
    'addExtraObj',
    'getEventOperation',
    'invokeEvent',
  ],
  // 生命周期函数，在获取数据和事件函数后调用，
  created() {
    //通过prop给控件初始化
    this.setDisplayType(this.query.displayType);
    this.setArgs(this.argsProps);

    this.$store = this.store;
    let that = this;
    if (this.attributes && !this.itemValue.data.isRelation)
      this.attributes.forEach(x => (that.attrMap[x.attributeName] = x));
  },
  // 生命周期函数，在dom元素生成之后调用
  async mounted() {

    // 获取当前类的全部对象
    // if(this.args.bindTargetClass) {
    //   var params = {"condition": this.parsedStr};
    //   console.log("params", params);

    //   // 导出数据 关联类 && 实体类
    //   let curClass = this.args.bindTargetClass.split('&')[0];
    //   let curType = this.args.bindTargetClass.split('&')[1];

    //   if(curType == 'e') {

    //     getEobj(curClass, params).then(response => {
    //       const res = response.data;
    //       if(res.success) {
    //         this.args.exportTable = res.data;
    //       } else {
    //         this.args.exportTable = [];
    //       }
    //     }).catch(e => {
    //       console.log(e);
    //     });

    //   } else {

    //     getEJobj(curClass, params).then(response => {
    //       const res = response.data;
    //       if(res.success) {
    //         this.args.exportTable = res.data;
    //       } else {
    //         this.args.exportTable = [];
    //       }
    //     }).catch(e => {
    //       console.log(e);
    //     });

    //   }

    // }

    // 事件处理
    if(this.args.events && this.args.events.length > 0) {
      this.initFlag = this.args.events.find((val) => {
        return val.name == '初始化'
      })

      this.clickFlag = this.args.events.find((val) => {
        return val.name == '点击系列'
      })
    }

    console.log(this.args.series, this.args.option)
    if(this.args.series.length > 0) {

      // 初始化事件 mounted执行
      if(this.initFlag) {
        let res = await this.invokeOperation(this.initFlag.opr_type, this.initFlag.opr_path, this.itemValue, this.store);
      }

      this.freshData(this.parsedStr);

      // setTimeout(function() {

      //   let eleW = document.getElementsByClassName('echart-bar');
      //     for(var i = 0; i < eleW.length; i++){
      //       var myChart = echarts.getInstanceByDom(eleW[i]);
      //       myChart.resize();
      //     }

      // }, 200)
      // let that = this;
      // setTimeout(function() {
      //   console.log(that.mychart);
      //   that.mychart.resize();
      // }, 3000)

    }

    //内部脚本 销毁重绘
    // if(this.args.echartScript != '') {
    //   try{
    //     let Escrpt = new Function(this.args.echartScript).call(this.args.option);

    //     this.mychart.dispose();
    //     this.mychart = echarts.init(this.$refs.previewbox);
    //     this.mychart.setOption(this.args.option);

    //   } catch(e) {

    //     console.log(e);

    //   }
    // }

  },
  watch: {
    async arg_bindClass(val) {
      if(val != undefined && val != '') {

        let curClass = val.split('&')[0];

        if(val.split('&')[1] == 'e') {
          getEntity(curClass).then(response => {
            this.classMap[curClass] = response.data;
          })
        } else {
          getRelation(curClass).then(response => {

            let res = response.data;
            this.classMap[curClass] = res;

          })
        }

      }
    },
  },
  computed: {
    ...mapGetters("DWF_form", [
        "EntityAttrList",
        "Relations",
        "RelationAttrList"
    ]),
    arg_bindClass() {
      return this.args.bindTargetClass;
    },
    parsedStr() {

      let finalParseStr = '';
      if(this.args.filterQuery != '') {
        finalParseStr = this.parseEscapeString(this.args.filterQuery, null, null, this.itemValue.data.origin, this.attributes, this.$store);
      } else {
        if(this.query.query != '') {
          finalParseStr = this.parseEscapeString(this.query.query, null, null, this.itemValue.data.origin, this.attributes, this.$store);
        }
      }
      return finalParseStr;

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
    ...mapActions("DWF_form", ["handleQueryData","queryEntity","queryRelation"]),
    //start
    // 获取控件属性值
    getValue() {
      return null;
    },

    // 设置控件属性值,item是查询到的对象数组
    setValue(value) {
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
        // var dom = this.$refs.main.querySelector(".i-input .ivu-input");
        // if (dom) dom.style.borderColor = error ? "red" : null;
    },
    validate() {
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
    async getChartSource(paramObj) {
      if (this.handleQueryData) {

        let objs = await this.handleQueryData(paramObj);

        this.allChartObj = objs;
        let arr = [];
        let attrs = [];
        if(objs != null && objs.length > 0) {

         let classType = this.args.bindTargetClass.split('&')[1];
          if(classType == 'r') {

            this.actAttributes[0].forEach(r => {
              attrs.push(`relation_${r.attributeName}`)
            })
            this.actAttributes[1].forEach(l => {
              attrs.push(`left_${l.attributeName}`)
            })
            this.actAttributes[2].forEach(r => {
              attrs.push(`right_${r.attributeName}`)
            })


          } else {

            this.actAttributes.forEach(a => {
              attrs.push(a.attributeName)
            })

          }

          arr.push(attrs);

          for (let key of objs) {

            var values = [];
            for (let i of attrs) {
              if(key && i in key) {

                let isDateItem = key[i];
                let date;

                if (isDateItem && isDateItem.toString().length === 13 && (date = new Date(isDateItem)) !== undefined && date.getFullYear() > 1900 && date.getFullYear() < 2100) {
                  var y = date.getFullYear(),
                      m = date.getMonth() + 1,
                      d = date.getDate();

                  if(this.args.transDateType == 'date') {
                    isDateItem = y + "/" + (m < 10 ? "0" + m : m) + "/" + (d < 10 ? "0" + d : d);
                  } else if(this.args.transDateType == 'time') {
                    isDateItem = date.toTimeString().substr(0, 8);
                  } else {
                    isDateItem = y + "/" + (m < 10 ? "0" + m : m) + "/" + (d < 10 ? "0" + d : d) + " " + date.toTimeString().substr(0, 8);
                  }

                }

                values.push(isDateItem);

              } else {
                values.push('');
              }
            }
            arr.push(values);

          }

        }
        return arr;

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
      let that = this;

      // 点击系列事件
      mychart.on('click', function(params) {

        // mychart.clear();
        // that.curInt = params.dataIndex;
        // mychart.setOption(option,false);

        that.clickData = {};
        let keyArr = option.dataset.source[0];
        let attrArr = params.data;

        keyArr.forEach((val, index) => {

          that.clickData[val] = attrArr[index];

        })

        that.getSelected(that.clickData);
        if(that.clickFlag) {

          let classType = that.args.bindTargetClass.split('&')[1];
          let mutilObj = {
            className: that.args.bindTargetClass.split('&')[0],
            isRelation: classType !== 'e',
            oidList: [that.args.id]
          }
          that.invokeOperation(that.clickFlag.opr_type, that.clickFlag.opr_path, that.itemValue, that.store, null, that.clickData, null, mutilObj);

        }

      })
      mychart.setOption(option);
    },

    getAttrMap() {

      return this.classMap;

    },

    // 返回选择系列
    getSelected(e) {

      let clickResult = [];

      if(!e || e == undefined) {
          clickResult.push(this.clickData);
      } else {
        clickResult.push(e);
      }

      return clickResult;

    },

    // return 当前图表全部定制对象
    getAll() {
      return this.allChartObj || [];
    },
    matchTipName(e) {
      let targetName = '';
      if(this.args.bindTargetClass.split('&')[1] == 'e') {
        let matchItem = this.actAttributes.filter(val => {
          return val.attributeName == e
        });
        targetName = matchItem[0].displayName || '-';
      } else {
        let eType = e.split('_')[0] + '_';
        let eArr = [];
        let strPre = '';
        if(eType == 'relation_') {
          eArr = this.actAttributes[0]
          strPre = this.args.bindTargetClass.split('&')[0] + '_';
        } else if(eType == 'left_') {
          eArr = this.actAttributes[1]
          strPre = this.args.lEnClass + '_';
        } else {
          eArr = this.actAttributes[2]
          strPre = this.args.rEnClass + '_';
        }

        targetName = strPre + eArr.filter(i => i.attributeName == e.split('_')[1])[0].displayName;
      }
      return targetName;

    },
    //预览按钮 触发预览
    previewChart() {
      let _this = this
      if(this.args.selfLegend != '') {
        this.args.option.legend.formatter = this.args.selfLegend;
      }
      this.args.option.series = [];
      let self = this;
      if(this.args.series) {
        this.args.option.series = this.args.option.series.concat(this.args.series[0]);
      }

      this.args.option.series.forEach(o => {

        let seriesItem = o;
        let toolItem = seriesItem.encode.tooltip;
        let attrList = this.args.option.dataset.source[0] || [];
        let toolItemIndex = attrList.findIndex(a => a == seriesItem.selfEname);

        seriesItem['tooltip'] = {

          formatter: function (params) {

            let str = `<div class="toolDiv">`;
            if(toolItem.length > 0) {
              toolItem.forEach(t => {

                let attrIndex = attrList.findIndex(d => d == t);
                if(attrIndex != -1) {

                  let isDateItem = params.data[attrIndex];
                  let displayName = _this.matchTipName(t)
                  str = `${str}<p>${params.marker}${displayName}: ${isDateItem}</p>`;

                }

              })
            } else {
              str = `${str}<p>${params.name}: ${params.data[toolItemIndex != -1 ? toolItemIndex : 0]}</p>`;
            }
            str =`${str}</div>`;

            return str
          }

        }

      })
      console.log("series",this.args.series);
      this.transLabel();
      // 提示框组件设置
      this.args.option.tooltip = Object.assign({},this.args.option.tooltip,{enterable: true, confine: true})
      // 暗黑皮肤可视化控件样式调整
      let targetSkin = sessionStorage.getItem('skinStyle');
      if(targetSkin == 'dark') {

        if(location.href.indexOf('displayType=') == -1) {

          try{
            // this.args.option.xAxis[0].axisLabel = {
            //     color: '#fff',
            // }
            this.args.option['backgroundColor'] = '#122035';
            this.args.option.xAxis[0].axisLabel.color = '#fff';
            this.args.option.legend.textStyle.color = '#fff';
            this.args.option.toolbox.iconStyle.color = '#fff';

            this.args.option.title.textStyle.color = '#fff';
            this.args.option.xAxis[0].axisLine = {
                lineStyle: {
                    color: '#fff'
                }
            };
            this.args.option.yAxis.forEach(y => {
              y.axisLine = {
                lineStyle: {
                    color: '#fff'
                }
              }

              if('axisLabel' in y) {
                y.axisLabel.color = '#fff';
              }

            })

            // if(typeof this.mychart.dispose === 'function') this.mychart.dispose();
            // this.mychart = echarts.init(this.$refs.previewbox);
            // this.mychart.setOption(this.args.option);


          } catch(e) {

            console.log(e);

          }

        }

      }

      this.createChartBar(this.args.option);
      console.log("previewChart", this.args.option);
      this.previewChartMethod(this.mychart, this.args.option, this.msg);

    },

    /**
     * @description x轴label文字长度超过6 显示...
    */
    transLabel() {
     if('rotate' in this.args.option.xAxis[0].axisLabel) {

        this.args.option.xAxis[0].axisLabel['interval'] = 0;

      } else {

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

      }
    },

    /**创建柱状图
     *@method function createChartBar
     *@param {object} option echart配置项
     *@returns {null}
     */
    async createChartBar(option) {

      console.log("option", option);
      this.mychart = echarts.init(this.$refs.previewbox);
      this.mychart.setOption(option);

      // 初始化事件 mounted执行
      // if(this.initFlag) {
      //   let res = await this.invokeOperation(this.initFlag.opr_type, this.initFlag.opr_path, this.itemValue, this.store);
      //   if(res) {
      //     this.mychart.dispose();
      //     this.mychart = echarts.init(this.$refs.previewbox);
      //     this.mychart.setOption(this.args.option);
      //   }
      // }

    },

    // 查询框图标联动查询
    async refreshChart(query) {
      await this.freshData(query, 'searchBox');
    },

    // 导出数据到本地 .csv
    // exportData() {
    //   if(this.args.exportColumns.length == 0) {
    //     this.$Message.error('您还为选择任何需要导出的属性')
    //   } else {
    //     this.$refs.exportTable.exportCsv({
    //       filename: `实体类 ${this.args.bindTargetClass.split('&')[0]}的数据`
    //     });
    //   }
    // },

    // 刷新图表
    async freshData(queryStr, flag) {
      this.actAttributes = [];

      if((queryStr == '' || queryStr == undefined) && this.query.query != '') {
        queryStr = this.query.query;
      }
      queryStr = queryStr == '' ? '' : this.parseEscapeString(queryStr, {}, {}, this.itemValue.data.origin, this.attributes, this.$store);

      let className = this.args.bindTargetClass;
      if(className != undefined && className != '') {

        let curClass = className.split('&')[0];
        let curType = className.split('&')[1];

        let queryObj = {fresh: true}
        if(curType == 'e') {

          queryObj['targetClass'] = curClass;
          queryObj['query'] = queryStr;
          // 获取指定实体类
          await this.queryEntity(curClass);
          // 实体类的属性类列表
          this.actAttributes = this.EntityAttrList(curClass);
        } else {

          queryObj = {
              query: {
                query: queryStr,
                type: 'relation'
              },
              relationClass: curClass,
              leftClass: this.args.lEnClass,
              rightClass: this.args.rEnClass,
              fresh: true
          };

          await this.queryRelation(curClass);
          let reTypeAttr = this.RelationAttrList(curClass);

          let reClass = this.Relations(curClass);
          if('leftClass' in reClass) {
            await this.queryEntity(reClass.leftClass);
          }
          if('rightClass' in reClass) {
            await this.queryEntity(reClass.rightClass);
          }

          let reTypeLAttr = this.EntityAttrList(reClass.leftClass);
          let reTypeRAttr = this.EntityAttrList(reClass.rightClass);
          this.actAttributes.push(reTypeAttr, reTypeLAttr, reTypeRAttr);

        }
        let temData = await this.getChartSource(queryObj);
        if(flag && flag == 'searchBox' && temData.length == 0) {
          return
        }
        this.args.option.dataset.source = temData;

        // ********** 如果X轴展示数据超过定制最大数据量 启动dataZoom模式 ************
        if(this.args.option.dataset.source.length > 0) {

          if(this.args.option.dataset.source.length - 1 > this.args.maxNum) {

            let zoomEnd = (this.args.maxNum/this.args.option.dataset.source.length)*100;

            let xIsValue = this.args.option.xAxis[0].type == 'value' ? true : false;
            let zoomOrient = xIsValue ? 'vertical' : 'horizontal';
            let zoomLeft = xIsValue ? 10 : 'auto';

            this.args.option.dataZoom = [
              {
                type: 'slider',
                show: true,
                orient: zoomOrient,
                left: zoomLeft,
                start: 0,
                end: zoomEnd,
                handleSize: 8,
                textStyle: {
                  color: '#333'
                }
              }
            ]

            let targetSkin = sessionStorage.getItem('skinStyle');
            if(targetSkin == 'dark' && location.href.indexOf('displayType=') == -1) {
              this.args.option.dataZoom[0].textStyle.color = '#fff';
            }

          } else {
            this.args.option.dataZoom = []
          }

        }

        this.previewChart();

      } else {
        this.$Message.warning('请先选择目标类')
      }
    }
  }
};
</script>
<style>
  .toolDiv {
    max-width: 400px;
    white-space:normal;
    word-wrap:break-word;
    max-height: 300px;
    overflow-y: auto;
  }
  .toolDiv p{
    font-size: 14px!important;
  }
</style>
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
