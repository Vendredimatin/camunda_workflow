<template>
    <section :addinName="name" v-if="t_preview" ref="main" :style="{'width': arg_width, 'float': 'left'}">
        <h2 v-show="hasSeries" style="font-size: 18px; text-align: center; color: #333;font-weight: bold;">仪表盘</h2>
        <div class="echart-bar" ref='previewbox' id="box" :style="{'width': '100%', 'height': arg_height}"></div>

        <!-- 预览模式时，有编辑框的显示；ref属性用于获取指定的dom元素，如ref="x",则在script中用this.$refs.x来选中该dom元素 -->
        <slot name="widget"></slot>
<span v-show="t_edit" ref="edit">
            <EditBox v-if="actEdit" :addinName="name" :widgetAnnotation="widgetAnnotation" :editExtendInfo="editExtendInfo" ref="editbox" v-model="args"
              :attributes="filter_attributes"
              :router="router"
              :route="route"
              :itemValue="itemValue"
              :store="store"
              :root="root"
              :query_oprs="query_oprs"
              :targetclass="itemValue.data.targetClass">
                <div slot="attribute">
                    <div class="editsection">
                        <Form :model="args" :label-width="80">
                            <h3 class="margin1">图表基础配置</h3>

                            <p class="margin1">图表标题</p>
                            <Input class="margin1" v-model="args.option.title.text"></Input>
                            <p class="margin1">数值标题</p>
                            <Input class="margin1" v-model="args.numberTitle"></Input>
                            <p class="margin1">最小数值</p>
                            <InputNumber class="margin1" :min="0" v-model="args.minNumber" style="display: inline-block; width: 100%" />
                            <p class="margin1">最大数值</p>
                            <InputNumber class="margin1" :min="0" v-model="args.maxNumber" style="display: inline-block; width: 100%" />
                            <div class="margin1" style="margin: 10px 0;">
                              显示数值
                              <i-switch style="float: right" v-model="args.numberSwitch"/>
                            </div>
                            <p class="margin1">显示格式</p>
                            <RadioGroup v-model="args.numberFormmater">
                              <Radio label="百分比"></Radio>
                              <Radio label="数值"></Radio>
                            </RadioGroup>
                            <p class="margin1">数值</p>
                            <Select v-if="reloadX" v-model="args.valueAttribute" filterable>
                                <OptionGroup v-for="group in groupNumberTypeList" :label="group.groupName" :key="group.groupName">
                                  <Option v-for="(item, index) in group.attrList" :key="index" :value="`${group.groupType}${item.attributeName}`" :label="item.displayName">
                                    <span>{{ item.displayName }}</span>
                                    <span style="float:right;color:#ccc">{{ item.attributeName }}</span>
                                  </Option>
                                </OptionGroup>
                            </Select>
                            <br>
                            <br>
                            <Button type="success" long @click="getDataFromAPI(parsedStr)">绘制</Button>
                        </Form>
                    </div>
                </div>
                <div slot="layout">
                </div>
                <div slot="operation">
                </div>
            </EditBox>
        </span>

    </section>
    <section v-else :addinName="name">
        <span style="text-align:center">
            <div class="form-addin-icon">
                <i class="iconfont">&#xe665;</i>
            </div>
            <div class="form-addin-name">
                仪表盘
            </div>
        </span>
    </section>

</template>

<script>
import EditBox from "./_EditBox.vue"
import { mapGetters, mapActions } from "vuex";
import EntityModeling from "@/api/data-model/EntityModeling";
import Axios from "@/libs/axios.js";
import "@/styles/component/iconfont.css";
import { getEobj, getSingleObj } from '@/api/others';
// 引入 ECharts 主模块
var echarts = require("echarts");

const name = "GaugeChart";
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
      yIsCategory: true,
      firstLoad: true,
      actEdit: false,
      reloadX: true,
      hasSeries: true,

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
      groupNumberTypeList: [],
      actAttributes: [],
      // 编辑框
      args: {
        title: '仪表盘',
        id: null,
        value: "",
        echartName: "",
        targetDataType: null,
        hided: false,
        bindTargetClass: '',
        filterQuery: "",
        lEnClass: '',           // 目标类为关联类时 左右关联de实体类
        rEnClass: '',
        // 布局插件所需属性
        rows: 0,
        cols: 0,
        width:  100,
        widthType: "%",
        heightType: "px",
        height: 400,
        minNumber: 0,
        maxNumber: 100,
        numberTitle: '',
        numberFormmater: '百分比',
        numberSwitch: true,
        switchExport: false,
        isExport: false,
        beforeExport: false,
        isMweb: true,
        exportAttr: [],
        exportColumns: [],
        // exportTable: [],
        seriesYType: 'value',
        events: [],
        eventRange: ["初始化", "点击系列"],
        //echart
        // 查询条件
        echartScript: '',      // 脚本内容
        query: "",
        nameAttribute: "",
        valueAttribute: "",
        data: [],
        //数据配置
        option: {
          title: {
            text: "仪表盘",
            left: "center",
            textStyle:{
              color: '#333'
            }
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
    if (this.t_preview) {
      this.$store = this.store;
      let that = this;
      if (this.attributes)
        this.attributes.forEach(x => (that.attrMap[x.attributeName] = x));
    }
  },
  // 生命周期函数，在dom元素生成之后调用
  async mounted() {

    // 获取当前类的全部对象
    if(this.t_preview && this.itemValue.data) {

      // 缺省绑定类为当前表单目标类
      if(this.args.bindTargetClass == '') {

        if(this.itemValue.data.isRelation) {
          this.args.bindTargetClass = this.itemValue.data.targetClass + '&r';
        } else {
          this.args.bindTargetClass = this.itemValue.data.targetClass + '&e';
        }

      }

      // getEobj(this.itemValue.data.targetClass).then(response => {
      //   const res = response.data;
      //   if(res.success) {
      //     this.args.exportTable = res.data;
      //   }
      // }).catch(e => {
      //   console.log(e);
      // });
      this.isMweb = true;
    }



    //获取所有实体类列表
    if (this.t_preview) {

        if(this.args.option.series.length > 0) {

          this.hasSeries = false;
          this.getDataFromAPI(this.parsedStr);

        } else {
          this.hasSeries = true;
          // let queryObj = {}

          // queryObj['targetClass'] = this.args.bindTargetClass.split('&')[0];
          // queryObj['query'] = this.parsedStr;

          // this.args.option.dataset.source = await this.getChartSource(queryObj); //获取数据，整理数据
          // this.mychart = echarts.init(this.$refs.previewbox);
          // this.mychart.setOption(this.args.option, true);

        }

    }

  },
  watch: {
    async arg_bindClass(val) {

      if(!this.firstLoad) {

        this.args.valueAttribute = '';
        this.groupNumberTypeList = [];
        this.reloadX = false;
        this.$nextTick(() => {
          this.reloadX = true;
        })

      } else {
        if(this.firstLoad) this.firstLoad = false;
      }

      if(val != undefined && val != '' && val != 'undefined') {
        let curClass = val.split('&')[0];
        this.groupNumberTypeList = [];

        if(val.split('&')[1] == 'e') {

          // 处理 数值 选择时只显示数字类型属性
          await this.queryEntity(curClass);
          let enTypeAttr = this.EntityAttrList(curClass);
          let numTypeAttr = enTypeAttr.filter(item => {
            return (item.valueType == 'Long' || item.valueType == 'Integer' || item.valueType == 'Double')
          })

          let groupNumItem = {
            groupName: curClass,
            groupType: '',
            attrList: numTypeAttr
          }
          this.groupNumberTypeList.push(groupNumItem);

        } else {

          await this.queryRelation(curClass);
          let reTypeAttr = this.RelationAttrList(curClass);
          let numReTypeAttr = reTypeAttr.filter(item => {
            return (item.valueType == 'Long' || item.valueType == 'Integer' || item.valueType == 'Double')
          })

          let relations = reTypeAttr.map(val => {
            val.value = 'relation_' + val.attributeName;
            return val
          })
          let reClass = this.Relations(curClass);
          if('leftClass' in reClass) {
            await this.queryEntity(reClass.leftClass);
          }
          if('rightClass' in reClass) {
            await this.queryEntity(reClass.rightClass);
          }

          this.args.lEnClass = reClass.leftClass;
          this.args.rEnClass = reClass.rightClass;
          let reTypeLAttr = this.EntityAttrList(reClass.leftClass);
          let numLTypeAttr = reTypeLAttr.filter(item => {
            return (item.valueType == 'Long' || item.valueType == 'Integer' || item.valueType == 'Double')
          })
          let reTypeRAttr = this.EntityAttrList(reClass.rightClass);
          let numRTypeAttr = reTypeRAttr.filter(item => {
            return (item.valueType == 'Long' || item.valueType == 'Integer' || item.valueType == 'Double')
          })

          let groupNumReItem = {
            groupName: '关联类',
            groupType: 'relation_',
            attrList: numReTypeAttr
          }
          let groupNumLItem = {
            groupName: '左实体类',
            groupType: 'left_',
            attrList: numLTypeAttr
          }
          let groupNumRItem = {
            groupName: '左实体类',
            groupType: 'right_',
            attrList: numRTypeAttr
          }
          this.groupNumberTypeList.push(groupNumLItem, groupNumReItem, groupNumRItem);

        }
      } else {
        if(typeof this.mychart.dispose === 'function' ) this.mychart.dispose();
      }
    },
    arg_height(val) {
      this.resizeChart();
    },
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
    }
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
      return this.args.filterQuery == '' ? '' : this.args.filterQuery;
    },
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
      return dimensions.indexOf(this.args.valueAttribute);
    },


  },
  // 定义组件的函数接口
  methods: {
    ...mapActions("DWF_form", [
        "handleQueryData",
        "queryEntity",
        "queryRelation"
    ]),
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
    getAttrMap() {

      return this.classMap;

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

    async getDataFromAPI(queryStr){

      let className = this.args.bindTargetClass;
      this.actAttributes = [];

      if(className != undefined && className != '') {

        let curClass = className.split('&')[0];
        let curType = className.split('&')[1];

        let queryObj = {
          fresh: true
        }
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
        this.args.option.dataset.source = await this.getChartSource(queryObj);
        this.mychart = echarts.init(this.$refs.previewbox);
        this.render();
      }

    },

    resizeChart() {
      if(this.t_preview||this.t_edit) {
        setTimeout(function() {
          let eleW = document.getElementsByClassName('echart-bar');
          for(var i = 0; i < eleW.length; i++){
            const eachPW = eleW[i].parentNode.clientWidth;
            var mychart = echarts.getInstanceByDom(eleW[i]);
            if(mychart) {
              mychart.resize();
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
    async getChartSource(paramObj) {
      if (this.handleQueryData) {

        let objs = await this.handleQueryData(paramObj);

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
              if(i in key) {
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

    async refreshChart(query) {
      console.log("refresh chart method called", query);
      await this.getDataFromAPI(query);
      console.log("this.args.option.dataset.source@refreshChart", this.args.option.dataset.source);
    },
    matchTipName(e) {
      let targetName = '';
      if(this.args.bindTargetClass.split('&')[1] == 'e') {
        targetName = this.groupNumberTypeList[0].attrList.filter(val => val.attributeName == e)[0].displayName;
      } else {
        let eType = e.split('_')[0] + '_';
        let eArr = this.groupNumberTypeList.filter(val => val.groupType == eType);
        let strPre = '';
        if(eType == 'relation_') {
          strPre = this.args.bindTargetClass.split('&')[0] + '_';
        } else if(eType == 'left_') {
          strPre = this.args.lEnClass + '_';
        } else {
          strPre = this.args.rEnClass + '_';
        }
        targetName = strPre + eArr[0].attrList.filter(i => i.attributeName == e.split('_')[1])[0].displayName;
      }
      return targetName;

    },
    render(){
      if(!this.args.valueAttribute){
        this.$Notice.warning({
          title: '提示',
          desc: '请先选择数值'
        });
      }
      else{
        let isPercent = this.args.numberFormmater == '百分比' ? true : false
        this.hasSeries = false;
        let self = this;
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
            data: [{value: this.args.option.dataset.source[1][this.valueIndex], name: this.args.numberTitle}],
        });
        this.mychart.setOption(this.args.option);

      }

    },

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

.overTxt {
   text-overflow: ellipsis;
   overflow: hidden;
   white-space: nowrap;
}
</style>
