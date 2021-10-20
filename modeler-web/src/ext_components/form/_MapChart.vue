<template>
    <section :addinName="name" v-if="t_preview" ref="main" :style="{'width': arg_width, 'float': 'left'}">
        <!-- <h2 v-show="hasSeries" style="font-size: 18px; text-align: center; color: #333;">省份地图</h2> -->
        <div class="echart-bar" ref='previewbox' id="box" :style="{'width': '100%', 'height': arg_height}"></div>

        <!-- 预览模式时，有编辑框的显示；ref属性用于获取指定的dom元素，如ref="x",则在script中用this.$refs.x来选中该dom元素 -->
        <slot name="widget"></slot>
          <span v-show="t_edit" ref="edit">
            <EditBox v-if="actEdit" :addinName="name" :widgetAnnotation="widgetAnnotation" :editExtendInfo="editExtendInfo" ref="editbox" v-model="args"
              :attributes="filter_attributes"
              :itemValue="itemValue"
              :store="store"
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

                            <!-- <p class="margin1">经度</p>
                            <Select v-model="args.longitudeAttribute">
                                <Option v-for="(item, index) in filter_attributes" :key="index" :value="item.attributeName" :label="item.displayName">
                                  <span>{{ item.displayName }}</span>
                                  <span style="float:right;color:#ccc">{{ item.attributeName }}</span>
                                </Option>
                            </Select>

                            <p class="margin1">纬度</p>
                            <Select v-model="args.latitudeAttribute">
                                <Option v-for="(item, index) in filter_attributes" :key="index" :value="item.attributeName" :label="item.displayName">
                                  <span>{{ item.displayName }}</span>
                                  <span style="float:right;color:#ccc">{{ item.attributeName }}</span>
                                </Option>
                            </Select> -->

                            <p class="margin1">标签</p>
                            <Select v-if="reloadX" v-model="args.nameAttribute" filterable>
                                <OptionGroup v-for="group in groupAttrList" :label="group.groupName" :key="group.groupName">
                                  <Option v-for="(item, index) in group.attrList" :key="index" :value="`${group.groupType}${item.attributeName}`" :label="item.displayName">
                                    <span>{{ item.displayName }}</span>
                                    <span style="float:right;color:#ccc">{{ item.attributeName }}</span>
                                  </Option>
                                </OptionGroup>
                            </Select>

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
                            <!-- <Button type="success" long @click="showScriptModal = true">添加脚本</Button> -->
                        </Form>
                    </div>
                </div>
                <div slot="layout">
                </div>
                <div slot="operation">
                </div>
            </EditBox>
        </span>

        <!-- <Modal
          v-model="showScriptModal"
          title="脚本编辑"
          :mask-closable="false"
          width="80%"
          @on-ok="confirmScript"
          @on-cancel="cancelScript">
            <editor v-model="args.echartScript" @init="editorInit" lang="javascript" theme="chrome" width="100%" height="600"></editor>
        </Modal> -->
        <!-- 最大化编辑器ENDING -->
    </section>
    <section v-else :addinName="name">
        <span style="text-align:center">
            <div class="form-addin-icon">
                <i class="iconfont">&#xe658;</i>
            </div>
                <div class="form-addin-name">
                    省份地图
                </div>
<!--            <Tooltip class="form-addin-name" content="省份地图" style="width: 100%;" :transfer="true">省份...</Tooltip>-->
        </span>
    </section>

</template>

<script>
import EditBox from "./_EditBox.vue"
import { mapGetters, mapActions } from "vuex";
import Axios from "@/libs/axios.js";
import "@/styles/component/iconfont.css";
import { getEobj } from '@/api/others';
import '../../../node_modules/echarts/map/js/china.js';
import { SYS_ENTITY_ATTRIBUTES, SYS_RELATION_ATTRIBUTES } from '@/libs/utils.js';
// 引入 ECharts 主模块
var echarts = require("echarts");


const name = "MapChart";
export default {
  // 插件名
  name: name,
  props: ["argsProps", "widgetAnnotation", "editExtendInfo" , "itemValue", "attributes", "store", "query_oprs", "route", "router", "root" ],
  components: {
    EditBox
  },
  data() {
    return {
      // 插件名
      name: name,

      // 展示模式
      t_preview: true,
      t_edit: false,
      editChange: false,
      firstLoad: true,
      actEdit: false,
      reloadX: true,
      // hasSeries: true,
      // showScriptModal: false,
      yIsCategory: true,

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
      filter_attributes: [],
      groupAttrList: [],
      groupNumberTypeList: [],
      clickData: [],
      actAttributes: [],
      // 编辑框
      args: {
        bindTargetClass: '',
        lEnClass: '',           // 目标类为关联类时 左右关联de实体类
        rEnClass: '',
        filterQuery: "",
        title: '省份地图',
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
        exportAttr: [],
        exportColumns: [],
        exportTable: [],
        seriesYType: 'value',
        events: [],
        eventRange: ["初始化", "点击系列"],
        //echart
        // 查询条件
        // echartScript: '',      // 脚本内容
        query: "",
        nameAttribute: "",
        valueAttribute: "",
        dataAttribute: "",
        data: [],
        //数据配置
        option: {
          backgroundColor: "#ffffff",
          visualMap: {
            show: false,
            text: ['High', 'Low'],
            color: ['orangered', 'yellow', 'lightskyblue'],
            pieces: [
              {min: 1500}, // 不指定 max，表示 max 为无限大（Infinity）。
              {min: 900, max: 1500},
              {min: 300, max: 900},
              {min: 100, max: 300},
              {max: 100}     // 不指定 min，表示 min 为无限大（-Infinity）。
            ]
          },
          title: {
            text: "地图",
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

    //获取所有实体类列表
    if (this.t_preview) {

      if(this.args.bindTargetClass == '') {

        if(this.itemValue.data.isRelation) {
          this.args.bindTargetClass = this.itemValue.data.targetClass + '&r';
        } else {
          this.args.bindTargetClass = this.itemValue.data.targetClass + '&e';
        }

      }
      console.log(this.args.bindTargetClass)

      if(this.args.option.series.length > 0) {

        this.getDataFromAPI(this.parsedStr);

      } else {
        let queryObj = {};
        let curType = this.args.bindTargetClass.split('&')[1];

        if(curType == 'e') {

          queryObj['targetClass'] = this.args.bindTargetClass.split('&')[0];
          queryObj['query'] = this.parsedStr;

        } else {

          queryObj = {
              query: {
                query: '',
                type: 'relation'
              },
              relationClass: this.args.bindTargetClass.split('&')[0],
              leftClass: this.args.lEnClass,
              rightClass: this.args.rEnClass,
              fresh: true
          };

        }

        // this.args.option.dataset.source = await this.getChartSource(queryObj); //获取数据，整理数据
        this.args.option.dataset.source = []; //获取数据，整理数据
        this.args.option.geo = {
            map: 'china', // 表示中国地图
            roam: true,
            label: {
              normal: {
                show: true, // 是否显示对应地名
                textStyle: {
                  color: 'rgba(0,0,0,0.4)'
                }
              }
            },
            itemStyle: {
              normal: {
                borderColor: 'rgba(0, 0, 0, 0.2)'
              },
              emphasis: {
                areaColor: null,
                shadowOffsetX: 0,
                shadowOffsetY: 0,
                shadowBlur: 20,
                borderWidth: 0,
                shadowColor: 'rgba(0, 0, 0, 0.5)'
              }
            }
        };

        this.mychart = echarts.init(this.$refs.previewbox);
        this.mychart.setOption(this.args.option, true);

      }

        // this.chinaConfigure();
    }

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
    async arg_bindClass(val) {

      if(!this.firstLoad) {

        this.args.nameAttribute = '';
        this.args.valueAttribute = '';
        this.groupAttrList = [];
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

        this.groupAttrList = [];
        this.groupNumberTypeList = [];

        if(val.split('&')[1] == 'e') {

          // 处理 数值 选择时只显示数字类型属性
          await this.queryEntity(curClass);
          let enTypeAttr = this.EntityAttrList(curClass);
          let numTypeAttr = enTypeAttr.filter(item => {
            return (item.valueType == 'Long' || item.valueType == 'Integer' || item.valueType == 'Double')
          })

          // let groupItem = {
          //   groupName: curClass,
          //   groupType: '',
          //   attrList: enTypeAttr
          // }
          let sysAttr = {
            groupName: '系统属性',
            groupType: '',
            attrList: enTypeAttr.filter(item => SYS_ENTITY_ATTRIBUTES(item) !== -1)
          };
          let selfAttr = {
            groupName: '类属性',
            groupType: '',
            attrList: enTypeAttr.filter(item => SYS_ENTITY_ATTRIBUTES(item) === -1)
          };
          let groupNumItem = {
            groupName: curClass,
            groupType: '',
            attrList: numTypeAttr
          }
          this.groupAttrList.push(sysAttr, selfAttr);
          this.groupNumberTypeList.push(groupNumItem);

        } else {

          await this.queryRelation(curClass);
          let reTypeAttr = this.RelationAttrList(curClass);
          let numReTypeAttr = reTypeAttr.filter(item => {
            return (item.valueType == 'Long' || item.valueType == 'Integer' || item.valueType == 'Double')
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

          // let groupReItem = {
          //   groupName: '关联类',
          //   groupType: 'relation_',
          //   attrList: reTypeAttr
          // }
          let sysReAttr = {
            groupName: '关联类系统属性',
            groupType: 'relation_',
            attrList: reTypeAttr.filter(item => SYS_RELATION_ATTRIBUTES(item) !== -1)
          };
          let selfReAttr = {
            groupName: '关联类类属性',
            groupType: 'relation_',
            attrList: reTypeAttr.filter(item => SYS_RELATION_ATTRIBUTES(item) === -1)
          };
          let groupNumReItem = {
            groupName: '关联类',
            groupType: 'relation_',
            attrList: numReTypeAttr
          }
          let groupLItem = {
            groupName: '左实体类',
            groupType: 'left_',
            attrList: reTypeLAttr
          }
          let groupNumLItem = {
            groupName: '左实体类',
            groupType: 'left_',
            attrList: numLTypeAttr
          }
          let groupRItem = {
            groupName: '右实体类',
            groupType: 'right_',
            attrList: reTypeRAttr
          }
          let groupNumRItem = {
            groupName: '左实体类',
            groupType: 'right_',
            attrList: numRTypeAttr
          }
          this.groupAttrList.push(sysReAttr, selfReAttr, groupLItem, groupRItem);
          this.groupNumberTypeList.push(groupNumLItem, groupNumReItem, groupNumRItem);
          // this.filter_attributes = relations.concat(lefts, rights);

        }
      }
      // else {
      //   if(typeof this.mychart.dispose === 'function' ) this.mychart.dispose();
      // }
    },
    arg_height(val) {
      this.resizeChart();
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
    nameIndex(){
      var dimensions = this.args.option.dataset.source[0];
      return dimensions.indexOf(this.args.nameAttribute);
    },

    valueIndex(){
      var dimensions = this.args.option.dataset.source[0];
      return dimensions.indexOf(this.args.valueAttribute);
    },

    longitudeIndex(){
        var dimensions = this.args.option.dataset.source[0];
        return dimensions.indexOf(this.args.longitudeAttribute);
    },

    latitudeIndex(){
      var dimensions = this.args.option.dataset.source[0];
      return dimensions.indexOf(this.args.latitudeAttribute);
    },



  },
  // 定义组件的函数接口
  methods: {
      ...mapActions("DWF_form", [
        "handleQueryData",
        "queryEntity",
        "queryRelation"
      ]),
      chinaConfigure() {
        this.mychart.setOption({ // 进行相关配置
          backgroundColor: "#ffffff",
          tooltip: {}, // 鼠标移到图里面的浮动提示框
          dataRange: {
            show: false,
            min: 0,
            max: 1000,
            text: ['High', 'Low'],
            realtime: true,
            calculable: true,
            color: ['orangered', 'yellow', 'lightskyblue']
          },
          geo: { // 这个是重点配置区
            map: 'china', // 表示中国地图
            roam: true,
            label: {
              normal: {
                show: true, // 是否显示对应地名
                textStyle: {
                  color: 'rgba(0,0,0,0.4)'
                }
              }
            },
            itemStyle: {
              normal: {
                borderColor: 'rgba(0, 0, 0, 0.2)'
              },
              emphasis: {
                areaColor: null,
                shadowOffsetX: 0,
                shadowOffsetY: 0,
                shadowBlur: 20,
                borderWidth: 0,
                shadowColor: 'rgba(0, 0, 0, 0.5)'
              }
            }
          },
          series: [{
              type: 'scatter',
              coordinateSystem: 'geo' // 对应上方配置
            },
            {
              name: '启动次数', // 浮动框的标题
              type: 'map',
              geoIndex: 0,
              data: [{
                "name": "北京",
                "value": 599
              }, {
                "name": "上海",
                "value": 142
              }, {
                "name": "黑龙江",
                "value": 44
              }, {
                "name": "深圳",
                "value": 92
              }, {
                "name": "湖北",
                "value": 810
              }, {
                "name": "四川",
                "value": 453
              }]
            }
          ]
        })
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
        // this.mychart.setOption(this.args.option, true);

        this.render();
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
          desc: '请先选择标签'
        });
      }
      else if(!this.args.valueAttribute){
        this.$Notice.warning({
          title: '提示',
          desc: '请先选择数值'
        });
      }
      else{
        // this.hasSeries = false;
        this.args.option.geo = {
            map: 'china', // 表示中国地图
            roam: true,
            label: {
              normal: {
                show: true, // 是否显示对应地名
                textStyle: {
                  color: 'rgba(0,0,0,0.4)'
                }
              }
            },
            itemStyle: {
              normal: {
                borderColor: 'rgba(0, 0, 0, 0.2)'
              },
              emphasis: {
                areaColor: null,
                shadowOffsetX: 0,
                shadowOffsetY: 0,
                shadowBlur: 20,
                borderWidth: 0,
                shadowColor: 'rgba(0, 0, 0, 0.5)'
              }
            }
        };
        this.args.option.tooltip = {
          formatter: (params) => {
            return `${params.name}: ${params.value ? params.value : '-'}`
            // return `${params.name}${this.matchTipName(params.seriesName)}: ${params.value}`
          }
        }
        this.args.option.series = [{
              type: 'scatter',
              coordinateSystem: 'geo' // 对应上方配置
            },
            {
              name: this.args.nameAttribute,
              type: 'map',
              geoIndex: 0,
              data: (() => {
                  var res = [];
                    this.args.option.dataset.source.slice(1).forEach(x => (res.push({name:x[this.nameIndex], value:x[this.valueIndex]})));
                    return res;
              })(),
            }];
        console.log(this.args.option);
        console.log(this.mychart);
        this.mychart.setOption(this.args.option, true);

      }

    },
    matchTipName(e) {
      let targetName = '';
      if(this.args.bindTargetClass.split('&')[1] == 'e') {
        targetName = this.groupAttrList[1].attrList.filter(val => val.attributeName == e)[0].displayName;
      } else {
        let eType = e.split('_')[0] + '_';
        let eArr = this.groupAttrList.filter(val => val.groupType == eType);
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

    getSelected() {

      return this.clickData;

    }

    // 确认追加混合图脚本内容
    // confirmScript() {
    //   this.showScriptModal = false;
    //   console.log(this.args.echartScript);
    // },
    // 关闭脚本编辑弹窗
    // cancelScript() {
    //   this.showScriptModal = false;

    //   this.echartScript = '';
    // }
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
