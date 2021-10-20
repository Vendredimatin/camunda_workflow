<template>
  <section :addinName="name" ref="main" :style="{'width': arg_width}">

    <!-- 工具栏 -->
    <Row style="margin-bottom: 15px;">

      <div v-show="args.selectSeries || args.multiCharts || args.dateSwitch">

        <div style="width: 110px; padding-top: 1px; float: left;" v-show="args.multiCharts">
          <!-- <span style="font-size: 12px;margin-right: 8px;">图表排列</span> -->
          <Select v-model="gridType" style="width: 100px; display: inline-block;" @on-change="changeChartGrid">
              <Option v-for="item in chartsGrid" :value="item.value" :key="item.value">{{ item.label }}</Option>
          </Select>
        </div>
        <div style="width: 110px; float: left;" v-show="args.selectSeries">
          <Dropdown trigger="custom" :visible="visibleDrop">
            <Button type="primary" @click="handleOpen">
                <span style="font-size: 12px;">选择序列</span>
                <Icon type="ios-arrow-down"></Icon>
            </Button>
            <DropdownMenu slot="list" style="max-width: 180px;">
              <div class="series-list">
                  <CheckboxGroup v-model="appSelectSeries">
                  <!-- <Checkbox v-for="item in allTS" style="display: block;margin-bottom: 5px;padding-left: 5px;" :label="`${item.substr(item.lastIndexOf('.') + 1)}`"></Checkbox> -->
                  <Checkbox v-for="item in allTS" style="display: block;margin-bottom: 5px;padding-left: 5px;" :label="`${item.substr(item.lastIndexOf('.') + 1)}`">
                    <Tooltip :content="item" placement="top" :max-width="200">
                      <span class="series-label">{{ item.substr(item.lastIndexOf('.') + 1) }}</span>
                    </Tooltip>
                  </Checkbox>
              </CheckboxGroup>
              </div>
              <Button type="success" size="small" style="width: 94%;margin: 0 3%;" @click="chooseSeries"><span style="font-size: 12px;">绘制</span></Button>
            </DropdownMenu>
          </Dropdown>
        </div>
        <div style="width: 420px; padding-top: 1px; float: left;" v-show="args.dateSwitch">
          <span class="self-color" style="font-size: 12px;margin-right: 8px;">时间范围</span>
          <DatePicker
              type="datetime"
              placeholder="请选择开始时间"
              format="yyyy-MM-dd HH:mm:ss"
              v-model="timeSeriesStartTime"
              style="width: 160px;">
          </DatePicker> - <DatePicker
                              type="datetime"
                              placeholder="请选择结束时间"
                              format="yyyy-MM-dd HH:mm:ss"
                              v-model="timeSeriesEndTime"
                              style="width: 160px;"></DatePicker>
        </div>
        <div style="float: left;">
          <Button @click="searchTS"><span style="font-size: 12px;">查询</span></Button>
        </div>

      </div>

      <Tooltip placement="bottom" style="float: right;margin-right: 20px;">
          <p v-show="showVariance" style="cursor: pointer;">方差: {{ varianceValue }}</p>
          <div slot="content">
              <p v-for="v in varianceArr" :key="v.name">
                {{v.name}}: {{ v.value }}
              </p>
          </div>
      </Tooltip>

    </Row>

    <div ref="echartE" v-show="!args.hided" :style="{'width': '100%','min-height': arg_height}">

        <!-- <div ref="echart" :style="{'width': '100%','height': arg_height}"></div> -->
        <Row>
            <Col :span="isCol" v-for="(items, index) in extendCharts" :key="index">
                <div class="echart-bar" :id="`item${args.id}_${randomDivNum}_${index}`" :style="{'width': '100%','height': arg_height}"></div>
            </Col>
        </Row>

    </div>
    <span v-show="isWrong && !args.hided"
          :style="{'width': '100%', 'display': 'inline-block'}">
        <span v-show="isWrong" class="wrongTips">{{ errorMessage }}</span>
    </span>
  </section>
</template>

<script>
  import '@/styles/component/iconfont.css';
  import {getEobjSingle, getRobjSingle, getTimeSeriesByDevice, getMultiTimeSeries} from "@/api/others.js";
  import _ from 'lodash';
  import moment from 'moment';
  // import $ from 'jquery';
  import {mapActions} from "vuex";
  // import axios from "@/libs/axios";
  // import Axios from 'axios';
  // import global_ from '@/views/global.vue';
  // import store from "@/store"

  const name = "TimeSeriesBoard";
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
        randomDivNum: ('000000' + Math.floor(Math.random() * 999999)).slice(-6),
        varianceValue: 0,      // 方差值
        showVariance: false,
        varianceArr: [],       // 全部系列的方差值

        visibleDrop: false,
        appSelectSeries: [],
        extendSeries: [],
        allTS: [],
        chartsGrid: [
          {
            value: 'singleMix',
            label: '单图混合'
          }, {
            value: 'MultiRow',
            label: '多图单列'
          }, {
            value: 'MultiCol',
            label: '多图双列'
          }
        ],
        gridType: 'singleMix',

        timeSeriesStartTime: '',
        timeSeriesEndTime: '',

        isCol: 24,
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
        extendCharts: [],
        optionFactory: {
          color: [],
          title: {
            text: '',
            textStyle: {
              color: '#333'
            }
          },
          legend: {
            data: [],
            bottom: 20,
            textStyle: {
              color: '#333'
            }
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
            iconStyle: {
              color: ''
            }
          },
          xAxis: {
            type: 'time',
            boundaryGap: false,
            splitLine: {
                show: false
            }
          },
          yAxis: {
            type: 'value',
          },
          dataZoom: [],
          series: []
        },
        filterQuery: [],
        timeSeriesHash: [],
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
        // 开启选择序列
        if(this.args.selectSeries) {

            getTimeSeriesByDevice(this.args.dataSourceName, this.args.devicePath).then(response => {
                let res = response.data;
                if (!res.success) {
                // this.$Message.error(res.message);
                } else {
                    this.allTS = res.data;

                    if(this.args.timeSeriesMap.length > 0) {

                        let defaultSeries = [];
                        this.args.timeSeriesMap.forEach(s => {
                            defaultSeries.push(s.target.substr(s.target.lastIndexOf('.') + 1))
                        });
                        this.appSelectSeries = defaultSeries;

                    }
                }
            }).catch(e => {
                console.log(e);
            });

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

      handleOpen() {
        this.visibleDrop = !this.visibleDrop;
      },

      // 工具栏选择系列
      async chooseSeries() {

          if(this.appSelectSeries.length == 0) {
                this.$Message.warning('未选择任何序列')
          } else {

                this.extendSeries = this.appSelectSeries.slice(1, this.appSelectSeries.length);
                this.visibleDrop = false;
                await this.freshData(this.appSelectSeries);

          }

      },

      // 时间过滤
      async searchTS() {

        let startTime = moment(new Date(this.timeSeriesStartTime));
        let endTime = moment(new Date(this.timeSeriesEndTime));
        this.rangeMin = startTime.format('YYYY-MM-DDTHH:mm:ss');
        this.rangeMax = endTime.format('YYYY-MM-DDTHH:mm:ss');

        await this.freshData(this.appSelectSeries);

      },

      /**
       * @param extendArr 外部选择的序列集合
       * @param extendGrid 外部指定图表排列方式
       * @param extendSTime 外部指定查询起始时间
       * @param extendETime 外部指定查询结束时间
      */
      async freshData(extendArr, extendGrid, extendSTime, extendETime) {

        this.showVariance = false;
        this.varianceArr = [];
        // 外部脚本参数处理
        if(extendGrid) {

          let exType = this.chartsGrid.filter(c => c.value == extendGrid);

          if(exType.length > 0) {

            this.isCol = exType[0].value == 'MultiCol' ? 12 : 24;
            this.gridType = extendGrid;

          } else {

            this.isCol = 24;
            this.gridType = 'singleMix';

          }

        }

        let finalSTime = extendSTime ? extendSTime : this.rangeMin;
        let finalETime = extendETime ? extendETime : this.rangeMax;

        this.extendCharts = [];
        let xAxis = [], series = [], color = [];
        this.option = _.cloneDeep(this.optionFactory);

        let tsArr = [];

        if(!extendArr) {

            if(this.args.timeSeriesMap.length == 0) return
            for (let [index, timeSeries] of this.args.timeSeriesMap.entries()) {
                tsArr.push(timeSeries.target.substr(timeSeries.target.lastIndexOf('.') + 1));
            }

        } else {

            if(extendArr.length == 0) return;
            tsArr = extendArr;
        }


        let params = {
          seriesInfo: {
            aggregation: [],
            rangeMin: finalSTime,
            rangeMax: finalETime,
            attrName: '',
            type: this.args.queryType,
          },
          timeSeriesList: tsArr
        }
        if (this.args.queryType === 'sample') {
          Object.assign(params.seriesInfo, {
            sampleMethod: this.args.sampleMethod,
            intervalValue: this.args.intervalValue,
            intervalUnit: this.args.intervalUnit,
          })
        }

        try {

            this.option.series = [];
            let data = await getMultiTimeSeries(this.args.dataSourceName, this.args.devicePath, params);
            if(data.data.success) {

                let tsData = data.data.data;
                if(tsData.length > 0) {

                    // 几种情况画在默认图表中 1默认加载modeler端的定制图表序列 2没开启图标排列的功能 3开启图标排列但是选择的是单图混合
                    let firstOption = _.cloneDeep(this.optionFactory);

                    tsData.forEach((val, ind) => {

                        // let timeSeries = `${this.args.devicePath}${tsArr[ind]}`;
                        // this.timeSeriesHash[timeSeries.target] = data.data.data[ind];
                        this.timeSeriesHash = data.data.data;

                        let color = this.randomColor();

                        // ind === 0 ? this.option.xAxis = {
                        // type: 'time',
                        // boundaryGap: false,
                        // splitLine: {
                        //     show: false
                        // },
                        // } : '';

                        let sName = !extendArr ? this.args.timeSeriesMap[ind].targetName : tsArr[ind];
                        let series = {
                            name: !sName ? tsArr[ind]: sName,
                            type: 'line',
                            showSymbol: false,
                            hoverAnimation: false,
                            step: this.args.seriesType === 'line' ? false : 'middle',
                            markPoint: {
                                data: []
                            },
                            markLine: {
                                data: []
                            },
                            data: this.timeSeriesHash[ind].series
                        };

                        for (let option of this.args.statistics) {
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
                                let total = this.timeSeriesHash[ind].series.map(item => item[1]);
                                let variance = this.variance(total);
                                if(ind === 0) {
                                  this.varianceValue = variance;
                                  this.showVariance = true;
                                }

                                // 开启方差 悬停展示全部序列信息
                                let varItem = {

                                  name: tsArr[ind],
                                  value: variance

                                };
                                this.varianceArr.push(varItem);

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

                        if(!extendArr || !this.args.multiCharts || (this.args.multiCharts && this.gridType == 'singleMix')) {

                            firstOption.series.push(series);
                            firstOption.color.push(color);
                            if(!extendArr) {
                                firstOption.legend.data.push(this.args.timeSeriesMap[ind].targetName || tsArr[ind]);
                            } else {
                                firstOption.legend.data.push(tsArr[ind]);
                            }


                        } else {

                            let itemOption = _.cloneDeep(this.optionFactory);
                            itemOption.color.push(color);
                            itemOption.series.push(series);
                            itemOption.title.text = this.args.chartTitle;
                            itemOption.legend.data.push(tsArr[ind]);

                            // zoom轴
                            if(this.args.rangeSelect) {
                                itemOption.dataZoom.push({
                                    filterMode: 'filter'
                                });
                            } else {
                                itemOption.dataZoom = [];
                            }

                            // 区域选择放大 开启标题放在左上角
                            if(this.args.areaZoom) {

                                itemOption.title['left'] = 20;
                                itemOption.toolbox = {
                                left: 'center',
                                iconStyle: {
                                  color: ''
                                },
                                feature: {
                                    dataZoom: {
                                        yAxisIndex: 'none'
                                    },
                                    restore: {}
                                }
                                }

                            } else {
                                itemOption.toolbox = {iconStyle: {color: ''}};
                                itemOption.title['left'] = 'center';
                            }

                            this.extendCharts.push(itemOption);

                        }

                    });

                    if(firstOption.series.length > 0) {

                        firstOption.title.text = this.args.chartTitle;

                        // zoom轴
                        if(this.args.rangeSelect) {
                            firstOption.dataZoom.push({
                                filterMode: 'filter'
                            });
                        } else {
                            firstOption.dataZoom = [];
                        }

                        // 区域选择放大 开启标题放在左上角
                        if(this.args.areaZoom) {

                            firstOption.title['left'] = 20;
                            firstOption.toolbox = {
                              left: 'center',
                              iconStyle: {
                                color: ''
                              },
                              feature: {
                                  dataZoom: {
                                      yAxisIndex: 'none'
                                  },
                                  restore: {}
                              }
                            }

                        } else {
                            firstOption.toolbox = {iconStyle: {color: ''}};
                            firstOption.title['left'] = 'center';
                        }

                        this.extendCharts.push(firstOption);

                    }

                    this.render();
                    // this.intervalRun(tsArr);

                } else {

                    this.setDefaultOption();

                }

            } else {
                this.$Message.warning('查询失败')
                this.setDefaultOption();
            }

        } catch (error) {
            console.log(error)
        }

      },
      render() {

        if(this.extendCharts.length > 0) {

            this.extendCharts.forEach((chart, ind) => {

                this.$nextTick(() => {

                    // 暗黑皮肤可视化控件样式调整
                    let targetSkin = sessionStorage.getItem('skinStyle');
                    if(targetSkin == 'dark') {

                      try {
                        chart.legend.textStyle.color = '#fff';
                        chart.toolbox.iconStyle.color = '#fff';
                        chart.title.textStyle.color = '#fff';
                        chart.dataZoom[0]['textStyle'] = {};
                        chart.dataZoom[0].textStyle = {
                          color: '#fff'
                        };
                        chart.xAxis['axisLine'] = {};
                        chart.yAxis['axisLine'] = {};
                        chart.xAxis.axisLine = {
                          lineStyle: {
                              color: '#fff'
                          }
                        };
                        chart.yAxis.axisLine = {
                          lineStyle: {
                              color: '#fff'
                          }
                        };

                      } catch (error) {
                        console.log(error)
                      }

                    }

                    let divId = `item${this.args.id}_${this.randomDivNum}_${ind}`;
                    let initDiv = document.getElementById(divId);
                    let eachDiv = this.echarts.init(initDiv);
                    eachDiv.setOption(chart);

                })

            })

        }
      },

      // 切换图标排列
      async changeChartGrid(val) {

          this.extendCharts = [];
          if(val == 'singleMix') {

                this.isCol = 24;
                // 没有选择序列的功能
                if(!this.args.selectSeries) {
                    await this.freshData();
                } else {
                    await this.freshData(this.appSelectSeries);
                }

          } else if(val == 'MultiRow') {

              this.isCol = 24;
              await this.freshData(this.appSelectSeries);

          } else if(val == 'MultiCol') {

              this.isCol = 12;
              await this.freshData(this.appSelectSeries);

          } else {
              console.log(val)
          }
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

      intervalRun(tsArr) {
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
          // for (let [index, timeSeries] of this.option.series.entries()) {
            this.rangeMin = this.rangeMax;
            this.rangeMax = moment(_.cloneDeep(this.rangeMax)).add(this.args.intervalFrequency, this.args.intervalFrequencyUnit).format('YYYY-MM-DDTHH:mm:ss');

            let params = {
              seriesInfo: {
                aggregation: [],
                rangeMin: this.rangeMin,
                rangeMax: this.rangeMax,
                attrName: '',
                type: this.args.queryType,
              },
              timeSeriesList: tsArr
            }
            if (this.args.queryType === 'sample') {
              Object.assign(params.seriesInfo, {
                sampleMethod: this.args.sampleMethod,
                intervalValue: this.args.intervalValue,
                intervalUnit: this.args.intervalUnit,
              })
            }

            let data = await getMultiTimeSeries(this.args.dataSourceName, this.args.devicePath, params);
            // let data = this.isRelation ? await getRobjSingle(this.targetClass, this.origin.oid, this.filterQuery) : await getEobjSingle(this.targetClass, this.origin.oid, this.filterQuery);
            this.timeSeriesHash[index].series.push(data.data.data[index].series);
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
          // }
          this.mychart.setOption(this.option);
        }, time);
      },

      setDefaultOption(){
        this.option = {
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

      // 返回当前工具栏所选全部序列
      getToolsSeries() {
        return this.appSelectSeries;
      },

      // 返回当前工具栏所选图标排列方式
      getToolsGridType() {
        return this.gridType;
      },

      // 返回当前工具栏日期起始时间
      getToolsStartTime() {

        let startTime = moment(new Date(this.timeSeriesStartTime));
        let finalTime = startTime.format('YYYY-MM-DDTHH:mm:ss');
        return finalTime;

      },

      // 返回当前工具栏日期结束时间
      getToolsEndTime() {

        let endTime = moment(new Date(this.timeSeriesEndTime));
        let finalTime = endTime.format('YYYY-MM-DDTHH:mm:ss');
        return finalTime;

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
  .series-list {
    max-height: 310px;
    overflow-y: auto;
    overflow-x: hidden;
  }
  .series-label {
    display: inline-block;
    max-width: 140px;
    position: relative;
    top: 2px;
    line-height: 14px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
</style>
