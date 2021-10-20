<template>
  <section :addinName="name" ref="main" :style="{'width': arg_width}">
    <div ref="echartE" v-show="!args.hided">
      <div class="echart-bar" ref="echart" :style="{'width': '100%','height': arg_height}"></div>
    </div>
    <span v-show="isWrong && !args.hided"
          :style="{'width': '100%', 'display': 'inline-block'}">
        <span v-show="isWrong" class="wrongTips">{{ errorMessage }}</span>
    </span>
  </section>
</template>

<script>
  import '@/styles/component/iconfont.css';
  import {getEobjSingle, getRobjSingle} from "@/api/others.js";
  import _ from 'lodash';
  import moment from 'moment';
  // import $ from 'jquery';
  import {mapActions} from "vuex";
  // import axios from "@/libs/axios";
  // import Axios from 'axios';
  // import global_ from '@/views/global.vue';
  // import store from "@/store"

  const name = "TimeSeriesCharts";
  export default {
    name: name,
    props: [
      'argsProps',
      'query',
      'store',
      'itemValue',
      'formEngine',
      'dwf_ctx',
      'attributes',
      'echarts',
    ],
    data() {
      return {
        editing: false,
        times: 0,
        name: name,
        t_preview: true,
        t_edit: false,
        targetClass: '',
        isRelation: false,
        isWrong: false,
        errorMessage: '',
        // 属性配置项,按需设置
        args: {
          id: "",                     // 控件代号,一般为必须
          height: 400,                 // 整体高度
          width: 100,                // 整体宽度,单位为%或者px
          widthType: "%",             // 整体宽度的单位
          heightType: "px",             // 整体宽度的单位
          align: "Vertical",          // 元素缺省 元素之间的对齐方式
          g_align: 0,                 // 元素之间的对齐方式
          hided: false,
          // 以下为不在属性编辑框中设置,但默认要有的配置项
          layout: true,               // 表示自己是布局空间(即不需要目标属性)
          title: "时序可视化",               // 插件中文名,需要填入默认值
          chartTitle: '时序可视化',
          events: [],                 // 已有的事件列表,元素格式为 { opr_type: '', opr_path: '', name: '事件中文名' }
          eventRange: [],             // 支持的事件列表,元素为事件中文名
          timeSeriesMap: [],                  //图表序列
          timeSeriesTimeType: 'absolute',     //显示类型
          timeSeriesStartTime: new Date(),    //开始时间
          timeSeriesEndTime: new Date(),      //结束时间
          timeSeriesRelativeTime: 0,          //相对时间
          timeSeriesRelativeTimeUnit: 's',    //相对单位
          intervalFrequency: 0,               //间隔频率
          intervalFrequencyUnit: 's',         //间隔单位
          rangeSelect: false,                 //区间选择
          newDataPolicy: 'replace',           //新数据替换策略
        },
        // 支持的数据类型, 基础数据类型为 String, TimeStamp, Boolean, Interger, Double, Long, UUID, Date, Clob
        dataTypes: ['Timeseries'],
        option: null,
        optionFactory: {
          color: [],
          title: {
            text: '',
            x: 'center',
            textStyle: {}
          },
          legend: {
            data: [],
            bottom: 20,
            textStyle: {}
          },
          tooltip: {
            trigger: 'axis',
            formatter: function (params) {
              let format = '';
              params.forEach((param) => {
                format += `${param.marker} ${param.seriesName}`;
                param.data.forEach(data => {
                  format += ` ${data}`;
                });
                format += `<br>`;
              });
              return format;
            },
          },
          toolbox: {
            show: true,
            orient: "vertical",
            left: "right",
            top: "center",
            iconStyle: {},
          },
          xAxis: [],
          yAxis: {
            type: 'value',
          },
          dataZoom: [],
          series: []
        },
        filterQuery: [],
        timeSeriesHash: {},
        initFlag: null,
        clickFlag: null,
      }
    },
    // components: {
    //     EditBox
    // },
    components: {},
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
      this.origin = this.itemValue.data.origin;
      this.targetClass = this.itemValue.data.targetClass;
      this.isRelation = this.itemValue.data.isRelation;
      // 加载目标属性
      // if (this.attributes) {
      //   if (this.isRelation) {
      //     let n1 = this.attributes[1].filter(x => "relation_" + x.attributeName == this.args.name).length > 0 ? this.args.name : "-1";
      //     let n2 = this.attributes[2].filter(x => "left_" + x.attributeName == this.args.name).length > 0 ? this.args.name : "-1";
      //     let n3 = this.attributes[3].filter(x => "right_" + x.attributeName == this.args.name).length > 0 ? this.args.name : "-1";
      //     if (n1 != "-1") this.args_name = n1;
      //     if (n2 != "-1") this.args_name = n2;
      //     if (n3 != "-1") this.args_name = n3;
      //   } else this.args_name = this.attributes.filter(x => x.attributeName == this.args.name).length > 0 ? this.args.name : "-1";
      // }
    },
    async mounted() {
      this.initQuery();
      // 事件处理
      if (this.args.events && this.args.events.length > 0) {
        this.initFlag = this.args.events.find((val) => {
          return val.name == '初始化'
        })
        this.clickFlag = this.args.events.find((val) => {
          return val.name == '点击系列'
        })
        if (this.initFlag) {
          this.invokeOperation(this.initFlag.opr_type, this.initFlag.opr_path, this.itemValue, this.store);
        }
      }
      await this.freshData();
    },
    // 销毁函数,清除生成的内存占用
    beforeDestroy() {
      if (this.timer) {
        clearInterval(this.timer);
        this.timer = null;
      }
      ;
    },
    computed: {
      arg_width() {
        return this.args.width + this.args.widthType;
      },
      arg_height() {
        return this.args.height + this.args.heightType;
      },
      arg_min() {
        return "40px";
      },
    },
    watch: {},
    methods: {
      ...mapActions("DWF_form", ["handleQueryData"]),

      initQuery() {
        if (this.args.timeSeriesTimeType === 'relative') {
          this.endTime = this.args.timeSeriesEndTime ? moment(new Date(this.args.timeSeriesEndTime)) : moment(new Date());
          this.rangeMin = _.cloneDeep(this.endTime).subtract(this.args.timeSeriesRelativeTime, this.args.timeSeriesRelativeTimeUnit).format('YYYY-MM-DDTHH:mm:ss');
          this.rangeMax = this.endTime.format('YYYY-MM-DDTHH:mm:ss');
        } else {
          this.startTime = moment(new Date(this.args.timeSeriesStartTime));
          this.endTime = moment(new Date(this.args.timeSeriesEndTime));
          this.rangeMin = this.startTime.format('YYYY-MM-DDTHH:mm:ss');
          this.rangeMax = this.endTime.format('YYYY-MM-DDTHH:mm:ss');
        }
      },

      async freshData() {
        let xAxis = [], series = [], color = [];
        this.option = _.cloneDeep(this.optionFactory);
        for (let [index, timeSeries] of this.args.timeSeriesMap.entries()) {
          if (timeSeries.target) {
            this.filterQuery = [{
              rangeMin: this.rangeMin,
              rangeMax: this.rangeMax,
              attrName: timeSeries.target,
              type: this.args.queryType
            }];
            if (this.args.queryType === 'sample') {
              Object.assign(this.filterQuery[0], {
                sampleMethod: this.args.sampleMethod,
                intervalValue: this.args.intervalValue,
                intervalUnit: this.args.intervalUnit,
              })
            }
            try {
              let data = this.isRelation ? await getRobjSingle(this.targetClass, this.origin.oid, this.filterQuery) : await getEobjSingle(this.targetClass, this.origin.oid, this.filterQuery);
              if (data.data.success) {
                this.timeSeriesHash[timeSeries.target] = data.data.data[timeSeries.target];
                let color = this.randomColor();
                this.option.legend.data.push(timeSeries.targetName);
                this.option.color.push(color);
                let date = [], seriesData = [], encode = {
                  x: 0,
                  y: 1,
                  tooltip: []
                }, tip = [];
                //增加tooltip选项
                if (timeSeries.tooltip) {
                  for (let [index, tooltip] of timeSeries.tooltip.entries()) {
                    tip.push(this.itemValue.data.origin[tooltip]);
                    encode.tooltip.push(index + 2)
                  }
                }
                // for(let series of this.timeSeriesHash[timeSeries.target].series){
                //   date.push(series[0]);
                //   seriesData.push(series[1]);
                // }
                this.timeSeriesHash[timeSeries.target].series = this.timeSeriesHash[timeSeries.target].series.map(item => item.concat(tip));
                index === 0 ? this.option.xAxis = {
                  type: 'time',
                  boundaryGap: false,
                  splitLine: {
                    show: false
                  },
                  // max: '2019-10-30 16:41:03',
                  // min: '2019-10-30 15:00:03',
                  // max: this.rangeMax,
                  // min: this.rangeMin
                } : '';
                let series = {
                  name: timeSeries.targetName,
                  type: 'line',
                  showSymbol: false,
                  hoverAnimation: false,
                  step: timeSeries.displayType === 'line' ? false : 'middle',
                  markPoint: {
                    data: []
                  },
                  markLine: {
                    data: []
                  },
                  encode: encode,
                  data: this.timeSeriesHash[timeSeries.target].series
                };
                for (let option of timeSeries.options) {
                  option === 'max' ? series.markPoint.data.push({
                    type: 'max', name: '最大值', label: '最大值', emphasis: {
                      label: {
                        show: true,
                        formatter: '{b}: {c}',
                      }
                    }
                  }) : '';
                  option === 'min' ? series.markPoint.data.push({
                    type: 'min', name: '最小值', label: '最小值', symbolRotate: 180, emphasis: {
                      label: {
                        show: true,
                        formatter: '{b}: {c}',
                      }
                    }
                  }) : '';
                  option === 'avg' ? series.markLine.data.push({
                    type: 'average', name: '平均值', label: '平均值', emphasis: {
                      label: {
                        show: true,
                        formatter: '{b}: {c}',
                      }
                    }
                  }) : '';
                  if (option === 'var') {
                    let total = this.timeSeriesHash[timeSeries.target].series.map(item => item[1]);
                    let variance = this.variance(total);
                    series.markLine.data.push({
                      yAxis: variance,
                      name: '方差',
                      label: '方差',
                      emphasis: {
                        label: {
                          show: true,
                          formatter: '{b}: {c}',
                        }
                      }
                    })
                  }
                }
                this.option.series.push(series);
              } else {
                console.error('查询数据失败')
                this.setDefaultOption();
              }
            }catch (e) {
              console.error('查询数据失败')
              this.setDefaultOption();
            }
          }
        }
        if(this.args.timeSeriesMap.length === 0){
          this.option = this.getEmptyOptionFactory();
        }
        this.option.title.text = this.args.chartTitle;
        if (this.args.rangeSelect) {
          this.option.dataZoom.push({
            filterMode: 'filter'
          });
        }

        this.$nextTick(() => {
          this.render();
          this.intervalRun();
        })
      },
      render() {
        let targetSkin = sessionStorage.getItem('skinStyle');
        if(targetSkin == 'dark') {
          try {
            this.option.legend.textStyle.color = '#fff';
            this.option.toolbox.iconStyle.color = '#fff';
            this.option.title.textStyle.color = '#fff';
            this.option.dataZoom[0]['textStyle'] = {};
            this.option.dataZoom[0].textStyle = {
              color: '#fff'
            };
            this.option.xAxis['axisLine'] = {};
            this.option.yAxis['axisLine'] = {};
            this.option.xAxis.axisLine = {
              lineStyle: {
                color: '#fff'
              }
            };
            this.option.yAxis.axisLine = {
              lineStyle: {
                color: '#fff'
              }
            };

          } catch (error) {
            console.log(error)
          }
        }
        this.mychart = this.echarts.init(this.$refs.echart);
        // this.mychart.on('click', (params) => {
        //   if(this.clickFlag) {
        //     this.invokeOperation(this.clickFlag.opr_type, this.clickFlag.opr_path, this.itemValue, this.store, null, this.clickData);
        //   }
        // })
        this.mychart.setOption(this.option);
      },
      randomColor() {
        return '#' + (0x1000000 + (Math.random()) * 0xffffff).toString(16).substr(1, 6);
      },
      /**
       * @description求平均值
       */
      mean([...data]) {
        let total = 0;
        for (let i = 0; i < data.length; i++) {
          total += data[i];
        }
        return total / data.length;
      },
      /**
       * @description方差
       */
      variance([...data]) {
        let mean = this.mean(data), total = 0;
        for (let i = 0; i < data.length; i++) {
          total += (data[i] - mean) ** 2;
        }
        return total / data.length;
      },

      intervalRun() {
        if (this.args.timeSeriesTimeType !== 'relative') return;
        if (this.args.intervalFrequency == 0 || this.args.timeSeriesEndTime) return;
        let unitHash = {
          s: 1000,
          m: 60000,
          h: 3600000
        };
        let time = this.args.intervalFrequency * unitHash[this.args.intervalFrequencyUnit];
        if (this.timer) clearInterval(this.timer);
        this.timer = setInterval(async () => {
          for (let [index, timeSeries] of this.option.series.entries()) {
            let attrName = this.args.timeSeriesMap[index].target;
            this.rangeMin = this.rangeMax;
            this.rangeMax = moment(_.cloneDeep(this.rangeMax)).add(this.args.intervalFrequency, this.args.intervalFrequencyUnit).format('YYYY-MM-DDTHH:mm:ss');
            this.filterQuery[0].rangeMin = this.rangeMin;
            this.filterQuery[0].rangeMax = this.rangeMax;
            let data = this.isRelation ? await getRobjSingle(this.targetClass, this.origin.oid, this.filterQuery) : await getEobjSingle(this.targetClass, this.origin.oid, this.filterQuery);
            this.timeSeriesHash[attrName].series.push(data.data.data[attrName].series);
            let date = [], seriesData = [];
            for (let series of data.data.data[attrName].series) {
              date.push(series[0]);
              seriesData.push(series[1]);
            }
            // index === 0 ? this.option.xAxis.data.push(date) : '';
            if (data.data.data[attrName].series.length !== 0) {
              this.args.newDataPolicy === 'replace' && this.option.series[index].data.splice(0, data.data.data[attrName].series.length);
              this.option.series[index].data = this.option.series[index].data.concat(data.data.data[attrName].series);
            }
          }
          this.mychart.setOption(this.option);
        }, time);
      },

      setDefaultOption(){
        this.option = {
          color: [],
          title: {
            text: '',
            x: 'center',
            textStyle: {}
          },
          legend: {
            data: [],
            bottom: 20,
            textStyle: {}
          },
          tooltip: {
            trigger: 'axis',
          },
          toolbox: {
            show: true,
            orient: "vertical",
            left: "right",
            top: "center",
            iconStyle: {},
          },
          xAxis: {
            type: 'value',
          },
          yAxis: {
            type: 'value',
          },
          dataZoom: [],
          series: []
        }
      },

      getValue() {
        return this.args.value;
      },

      // 设置控件属性值,item是查询到的对象数组
      setValue(value) {
        this.args.value = value;
        return this;
      },

      setDisplayType(type) {
        this.t_preview = type == 0;
        return this;
      },

      getFormName() {
        return this.args.name;
      },

      setArgs(args) {
        for (var i in args) {
          this.args[i] = args[i];
        }
        if ("name" in args) this.args_name = this.args.name;
        return this;
      },

      getArgs() {
        return this.args;
      },

      // 是否允许往dropTarget区域添加元素,null为不允许，[]为允许全部，非空为允许部分, dropTarget可传空
      getAllow(dropTarget) {
        return null;
      },

      setError(error, message = '') {
        this.isWrong = error;
        var dom = this.$refs.echartE;
        if (dom) dom.style.border = error ? "1px solid red" : null;
        this.errorMessage = error ? message : '';
        return this;
      },

      validate() {
        return true;
      },

      getEmptyOptionFactory(){
        return  {
          color: [],
            title: {
            text: '',
              x: 'center'
          },
          legend: {
            data: [],
              bottom: 20
          },
          tooltip: {
            trigger: 'axis',
          },
          toolbox: {
            show: true,
              orient: "vertical",
              left: "right",
              top: "center",
          },
          xAxis: {
            type: 'value',
          },
          yAxis: {
            type: 'value',
          },
          dataZoom: [],
            series: []
        }
      }
    }
  }
</script>

<style scoped>
  section {
    display: inline-block;
    width: 100%;
    vertical-align: top;
  }

  p {
    margin: 10px 0;
  }

  .wrongTips {
    display: inline-block;
    width: 100%;
    color: red;
    text-align: left;
    margin-top: 5px;
  }
</style>
