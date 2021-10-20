<template>
    <section v-show="!args.hided" :addinName="name" ref="main" :style="{'width': arg_width}">
        <div class="echart-bar" ref='previewbox' id="ebox" :style="{'width': '100%', 'height': arg_height}"></div>
        <h3 v-if="args.msg">{{args.msg}}</h3>
    </section>

</template>

<script>
import { mapGetters, mapActions } from "vuex";
import { getEntity } from "@/api/data-model/EntityModeling";
import { getRelation } from '@/api/data-model/RelationModeling';
import Axios from "@/libs/axios.js";
import "@/styles/component/iconfont.css";
import { getEobj, getSingleObj } from '@/api/others';
// 引入 ECharts 主模块
var echarts = require("echarts");

const name = "GaugeChart";
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
      clickData: {},    // 点击选择的当前对象
      classMap: [],
      allChartObj: [],  // 当前图表定制条件下的全部对象
      actAttributes: [],
      // 编辑框
      args: {
        title: '饼图',
        id: null,
        value: "",
        echartName: "",
        label_width: 2,
        main_width: 3,
        label_align: 4,
        main_align: 4,
        targetDataType: null,
        hided: false,
        bindTargetClass: '',
        lEnClass: '',           // 目标类为关联类时 左右关联de实体类
        rEnClass: '',
        filterQuery: "",
        // 布局插件所需属性
        rows: 0,
        cols: 0,
        label: "",
        width:  100,
        widthType: "%",
        heightType: "px",           // 整体高度的单位
        height: 400,
        minNumber: 0,
        maxNumber: 100,
        numberTitle: '',
        numberFormmater: '百分比',
        numberSwitch: true,
        switchExport: false,
        isExport: false,
        beforeExport: false,
        exportAttr: [],
        exportColumns: [],

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
      attrMap: {},
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
  },
  // 生命周期函数，在dom元素生成之后调用
  async mounted() {

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

        // dark皮肤
        let targetSkin = sessionStorage.getItem('skinStyle');
        if(targetSkin == 'dark' && location.href.indexOf('displayType=') == -1) {

          this.args.option['backgroundColor'] = '#122035';
          this.args.option.title.textStyle.color = '#fff';

        }

        this.getDataFromAPI(this.parsedStr);
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
    arg_bindClass(val) {
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
    nameIndex(){
      var dimensions = this.args.option.dataset.source[0];
      return dimensions.indexOf(this.args.nameAttribute);
    },

    valueIndex(){
      var dimensions = this.args.option.dataset.source[0];
      return dimensions.indexOf(this.args.valueAttribute);
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

    async refreshChart(query) {
      await this.getDataFromAPI(query, 'searchBox');
      // this.render();
    },

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
              attrs.push(`rightt_${r.attributeName}`)
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
                values.push(key[i]);
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

    async getDataFromAPI(queryStr, flag){

      this.actAttributes = [];

      let className = this.args.bindTargetClass;
      if(className != undefined && className != '') {

        let curClass = className.split('&')[0];
        let curType = className.split('&')[1];

        let queryObj = {}
        if(curType == 'e') {

          queryObj['targetClass'] = curClass;
          queryObj['query'] = queryStr;

          await this.queryEntity(curClass);
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
        this.mychart = echarts.init(this.$refs.previewbox);
        this.render();
      }

    },
    matchTipName(e) {
      let targetName = '';
      if(this.args.bindTargetClass.split('&')[1] == 'e') {
        targetName = this.actAttributes.filter(val => val.attributeName == e)[0].displayName;
      } else {
        let index = '';
        let eType = e.split('_')[0] + '_';
        let family = e.split('_')[0]
        if(family === 'left'){
          index = '1'
        }else if(family === 'right'){
          index = '2'
        }else if(family === 'relation'){
          index = '0'
        }
        let eArr = this.actAttributes[index];
        let strPre = '';
        if(eType == 'relation_') {
          strPre = this.args.bindTargetClass.split('&')[0] + '_';
        } else if(eType == 'left_') {
          strPre = this.args.lEnClass + '_';
        } else {
          strPre = this.args.rEnClass + '_';
        }
        targetName = strPre + eArr.filter(i => i.attributeName == e.split('_')[1])[0].displayName;
      }
      return targetName;

    },
    render() {

      // dark模式
      let targetSkin = sessionStorage.getItem('skinStyle');
      let darkColor = 'auto';
      if(targetSkin == 'dark' && location.href.indexOf('displayType=') == -1) {

        darkColor = '#fff';

      }
      let self = this;
      let isPercent = this.args.numberFormmater == '百分比' ? true : false
      this.args.option.series = [];
        this.args.option.series.push({
            // name: this.args.valueAttribute,
            type: 'gauge',
            min: this.args.minNumber,
            max: this.args.maxNumber,
            tooltip: {
              formatter: function (params) {
                return `${self.matchTipName(self.args.valueAttribute)}：${isPercent ? params.value/self.args.maxNumber : params.value}`
              }
            },
            detail: {
              show: this.args.numberSwitch,
              formatter: function (value) {
                if(isPercent) {
                  return value/self.args.maxNumber;
                } else {
                  return value;
                }
              }
            },
            title: {
              textStyle: {
                  color: darkColor
              }
            },
            data: [{value: this.args.option.dataset.source[1][this.valueIndex], name: this.args.numberTitle}],
        });

        // 添加事件响应
        console.log("this.clickFlag", this.clickFlag);
        let that = this;
        this.mychart.on('click', function(params) {

            console.log(params, that.clickFlag);
            that.clickData = {};
            let keyArr = that.args.option.dataset.source[0];
            let attrArr = that.args.option.dataset.source[params.dataIndex + 1];

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
        // 内部脚本调用
        // if(this.args.echartScript != '') {
        //   try{
        //     let Escrpt = new Function(this.args.echartScript).call(this.args.option);
        //     console.log("this.args.option", this.args.option);
        //   } catch(e) {
        //     console.log(e);
        //   }
        // }

        this.mychart.setOption(this.args.option);
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

    // return全部定制对象
    getAll() {
      return this.allChartObj || [];
    },

    // 刷新图表
    async freshData(query) {

      query = query == '' ? this.parseEscapeString(this.args.filterQuery, {}, {}, this.itemValue.data.origin || {}, this.attributes, this.$store) : this.parseEscapeString(query, {}, {}, this.itemValue.data.origin || {}, this.attributes, this.$store);
      this.getDataFromAPI(query);

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
