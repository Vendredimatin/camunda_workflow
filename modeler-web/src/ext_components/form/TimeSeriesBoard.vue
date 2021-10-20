<template>
  <section v-if="t_preview" :addinName="name" ref="main" :style="{'width': arg_width}">
    <Row style="margin-bottom: 15px;">

      <div v-show="args.selectSeries || args.multiCharts || args.dateSwitch">

        <div style="width: 170px; padding-top: 1px; float: left;" v-show="args.multiCharts">
          <span style="font-size: 12px;margin-right: 8px;">图表排列</span>
          <Select style="width: 100px; display: inline-block;">
              <Option v-for="item in chartsGrid" :value="item.value" :key="item.value">{{ item.label }}</Option>
          </Select>
        </div>
        <div style="width: 110px; float: left;" v-show="args.selectSeries">
          <Dropdown trigger="click">
            <Button type="primary">
                <span style="font-size: 12px;">选择序列</span>
                <Icon type="ios-arrow-down"></Icon>
            </Button>
            <DropdownMenu slot="list">
                <DropdownItem style="width: 130px;">
                  <div style="max-height: 300px;overflow-y: auto;">
                    <CheckboxGroup>
                      <Checkbox v-for="item in allTS" style="display: block;margin-bottom: 5px;" :label="`${item.substr(item.lastIndexOf('.') + 1)}`"></Checkbox>
                  </CheckboxGroup>
                  </div>
                  <Button type="success" size="small" style="width: 100%;"><span style="font-size: 12px;">绘制</span></Button>
                </DropdownItem>
            </DropdownMenu>
          </Dropdown>
        </div>
        <div style="width: 260px; padding-top: 1px; float: left;" v-show="args.dateSwitch">
          <span style="font-size: 12px;margin-right: 8px;">时间范围</span>
          <DatePicker style="width: 180px;display: inline-block;" type="daterange" split-panels placeholder="Select date"></DatePicker>
        </div>
        <div style="float: left;">
          <Button><span style="font-size: 12px;margin-right: 20px;">查询</span></Button>
        </div>

      </div>

      <p v-show="showVariance" style="float: right;">方差: {{ varianceValue }}</p>
    </Row>
    <div ref="echartE">
      <div ref="echart" class="echart-bar" :style="{'width': '100%','height': arg_height}"></div>
    </div>
    <slot name="widget"></slot>
<span v-show="t_edit" ref="edit">
            <EditBox v-if="actEdit" :addinName="name" :widgetAnnotation="widgetAnnotation" :editExtendInfo="editExtendInfo" ref="editbox" v-model="args"
                     :router="router"
                     :route="route"
                     :root="root"
                     :query_oprs="query_oprs"
                     :dataTypes="dataTypes"
                     :targetclass="itemValue.data.targetClass">
                <div slot="attribute">
                  <div class="margin1">
                    图表标题
                    <Input v-model="args.chartTitle" type="text"></Input>
                  </div>
                  <div class="margin1">
                    IoTDB数据源
                    <Select v-model="args.dataSourceName" placeholder="选择数据源" @on-change="changeDataSource" filterable>
                      <Option v-for="item in allDataSources" :value="item.dataSourceName" :key="item.oid" :label="item.dataSourceName">
                        {{ item.dataSourceName }}
                      </Option>
                    </Select>
                  </div>
                  <div class="margin1">
                    设备路径
                    <Select v-model="args.devicePath" placeholder="选择数据源" @on-change="changePath" filterable>
                      <Option v-for="item in allPath" :value="item" :key="item" :label="item">
                        {{ item }}
                      </Option>
                    </Select>
                  </div>
                  <div>
                    <div class="margin1">
                      时间序列属性
                      <Button type="text" size="small" @click="addTimeSeriesMap">
                        <span style="font-size: 12px;">添加序列</span>
                        <Icon type="md-add"></Icon>
                      </Button>
                    </div>
                    <ul>
                      <li class="timeSeriesMapList" v-for="(timeSeries, index) in args.timeSeriesMap" :key="index">
                        <span class="timeSeriesName" :title="timeSeries.targetName">{{timeSeries.targetName || 'timeseries'}}_{{index + 1}}</span>
                        <Icon type="md-close" @click="removeTimeSeriesMap(index)" class="timeSeriesSetting"/>
                        <Icon type="md-settings" @click="timeSeriesSetting(index)" class="timeSeriesSetting"/>
                      </li>
                    </ul>
                  </div>
                  <div class="margin1">
                    显示方式
                    <Select filterable clearable v-model="args.seriesType">
                      <Option value="line">折线图</Option>
                      <Option value="step">阶梯图</Option>
                    </Select>
                  </div>
                  <div class="margin1">
                    显示统计量
                    <Select filterable multiple clearable v-model="args.statistics" >
                      <Option value="max">显示最大值</Option>
                      <Option value="min">显示最小值</Option>
                      <Option value="avg">显示平均值</Option>
                      <Option value="var">显示方差</Option>
                    </Select>
                  </div>
                  <div class="margin1">
                    查询类型
                    <Select filterable clearable v-model="args.queryType">
                      <Option value="range">范围查询</Option>
                      <Option value="sample">采样查询</Option>
                    </Select>
                  </div>
                  <div class="margin1">
                    显示范围
                    <Select filterable clearable v-model="args.timeSeriesTimeType">
                      <Option value="absolute">绝对时间</Option>
                      <Option value="relative">相对时间（结束时间-偏移量）</Option>
                    </Select>
                  </div>
                  <div class="margin1">
                    <DatePicker
                            v-show="args.timeSeriesTimeType === 'absolute'"
                            type="datetime"
                            placeholder="请选择开始时间"
                            format="yyyy-MM-dd HH:mm:ss"
                            v-model="timeSeriesStartTime"
                            @on-change="(date) => args.timeSeriesStartTime = date"
                            style="width: 100%;"></DatePicker>
                  </div>
                  <div class="margin1">
                    <DatePicker
                            type="datetime"
                            placeholder="请选择结束时间"
                            format="yyyy-MM-dd HH:mm:ss"
                            v-model="timeSeriesEndTime"
                            @on-change="(date) => args.timeSeriesEndTime = date"
                            style="width: 100%;"></DatePicker>
                  </div>
                  <div v-show="args.timeSeriesTimeType === 'relative'">
                    偏移量
                    <Input class="margin1" v-model="args.timeSeriesRelativeTime" type="number">
                      <Select v-model="args.timeSeriesRelativeTimeUnit" slot="append" style="width: 70px;">
                          <Option value="s">秒</Option>
                          <Option value="m">分</Option>
                          <Option value="h">时</Option>
                          <Option value="d">天</Option>
                          <Option value="w">周</Option>
                      </Select>
                    </Input>
                  </div>
                  <div class="margin1" v-show="args.queryType === 'sample'">
                    采样方式
                    <Select filterable clearable v-model="args.sampleMethod">
                      <Option value="min">min</Option>
                      <Option value="max">max</Option>
                      <Option value="mean">mean</Option>
                      <Option value="count">count</Option>
                      <Option value="sum">sum</Option>
                    </Select>
                    <Input class="margin1" v-model="args.intervalValue" type="number">
                      <Select v-model="args.intervalUnit" slot="append" style="width: 70px;">
                          <Option value="ms">毫秒</Option>
                          <Option value="s">秒</Option>
                          <Option value="m">分</Option>
                          <Option value="h">时</Option>
                          <Option value="d">天</Option>
                          <Option value="w">周</Option>
                      </Select>
                    </Input>
                  </div>
                  <div class="margin1" v-show="args.timeSeriesTimeType === 'relative' && !args.timeSeriesEndTime">
                    间隔频率
                    <Input class="margin1" v-model="args.intervalFrequency" type="number">
                    <Select v-model="args.intervalFrequencyUnit" slot="append" style="width: 70px;">
                        <Option value="s">秒</Option>
                        <Option value="m">分</Option>
                        <Option value="h">时</Option>
                    </Select>
                    </Input>
                  </div>
                  <div class="margin1" v-show="args.timeSeriesTimeType === 'relative' && !args.timeSeriesEndTime">
                    新增数据策略
                    <Select class="margin1" filterable clearable v-model="args.newDataPolicy">
                      <Option value="replace">固定数量（有新数据时替换老的数据）</Option>
                      <Option value="add">累计增加（在原有数据上添加）</Option>
                    </Select>
                  </div>
                  <div class="margin1" style="margin: 10px 0;">
                    Zoom轴
                    <i-switch style="float: right" v-model="args.rangeSelect"/>
                  </div>
                  <div class="margin1" style="margin: 10px 0;">
                    区域拖动放大
                    <i-switch style="float: right" v-model="args.areaZoom"/>
                  </div>
                  <div class="margin1" style="margin: 10px 0;">
                    多图显示
                    <i-switch style="float: right" v-model="args.multiCharts"/>
                  </div>
                  <div class="margin1" style="margin: 10px 0;">
                    选择序列
                    <i-switch style="float: right" v-model="args.selectSeries"/>
                  </div>
                  <div class="margin1" style="margin: 10px 0;">
                    时间过滤
                    <i-switch style="float: right" v-model="args.dateSwitch"/>
                  </div>
                  <div class="margin1">
                    <Button type="success" long @click="render">绘制</Button>
                  </div>
                </div>
                <div slot="layout">
                </div>
                <div slot="operation">
                </div>
            </EditBox>
        </span>
    <Modal
            v-model="addTimeSeriesModal"
            :mask-closable="false"
            title="添加时间序列属性"
            @on-cancel="addTimeSeriesModalCancel"
    >
      <div>
        <Row type="flex" justify="center" align="middle">
          <Col span="18">
            <span class="margin1" style="display: inline-block;width: 16%;text-align: right;margin-right:10px;">序列</span>
            <div style="display: inline-block;width: 80%;">
              <Select v-model="currentTimeSeries.target" placeholder="选择数据源" filterable>
                <Option v-for="item in allTS" :value="item" :key="item" :label="`${item.substr(item.lastIndexOf('.') + 1)}`">
                  {{ `${item.substr(item.lastIndexOf('.') + 1)}` }}
                </Option>
              </Select>
            </div>
          </Col>
          <Col span="18">
            <span class="margin1" style="display: inline-block;width: 16%;text-align: right;margin-right:10px;">显示标签</span>
            <div style="display: inline-block;width: 80%;">
              <Input v-model="currentTimeSeries.targetName" />
            </div>
          </Col>
        </Row>
        <!-- <p style="height: 30px; line-height: 30px; border-bottom: 1px solid #ddd;">悬停提示内容</p>
        <Row type="flex" justify="center" align="middle">
          <Col span="24">
            <checkbox-group v-if="!isRelation" v-model="currentTimeSeries.tooltip">
              <Collapse v-model="defaultEOpen">
                <Panel name="1">
                  系统属性
                  <div slot="content">
                    <checkbox v-for="(item, index) in attributes_sys"
                              :key="index"
                              :label="item.attributeName"
                              style="width: 30%; margin: 5px; overflow: hidden; white-space: nowrap; text-overflow: ellipsis;"></checkbox>
                  </div>
                </Panel>
                <Panel name="2">
                  类属性
                  <div slot="content">
                    <checkbox v-for="(item, index) in attributes_def"
                              :key="index"
                              :label="item.attributeName"
                              style="width: 30%; margin: 5px; overflow: hidden; white-space: nowrap; text-overflow: ellipsis;"></checkbox>
                  </div>
                </Panel>
              </Collapse>
            </checkbox-group>
            <checkbox-group v-else v-model="currentTimeSeries.tooltip">
              <Collapse v-model="defaultROpen">
                <Panel name="1">
                  关联类
                  <div slot="content">
                    <Collapse v-model="defaultRelationOpen">
                      <Panel name="1-1">
                        系统属性
                        <div slot="content">
                          <checkbox v-for="(item, index) in attributes_relationSys"
                                    :key="index"
                                    :label="item.attributeName"
                                    style="width: 30%; margin: 5px; overflow: hidden; white-space: nowrap; text-overflow: ellipsis;"></checkbox>
                        </div>
                      </Panel>
                      <Panel name="1-2">
                        类属性
                        <div slot="content">
                          <checkbox v-for="(item, index) in attributes_relationDef"
                                    :key="index"
                                    :label="item.attributeName"
                                    style="width: 30%; margin: 5px; overflow: hidden; white-space: nowrap; text-overflow: ellipsis;"></checkbox>
                        </div>
                      </Panel>
                    </Collapse>
                  </div>
                </Panel>
                <Panel name="2">
                  左类
                  <div slot="content">
                    <Collapse v-model="defaultLeftOpen">
                      <Panel name="2-1">
                        系统属性
                        <div slot="content">
                          <checkbox v-for="(item, index) in attributes_leftSys"
                                    :key="index"
                                    :label="item.attributeName"
                                    style="width: 30%; margin: 5px; overflow: hidden; white-space: nowrap; text-overflow: ellipsis;"></checkbox>
                        </div>
                      </Panel>
                      <Panel name="2-2">
                        类属性
                        <div slot="content">
                          <checkbox v-for="(item, index) in attributes_leftDef"
                                    :key="index"
                                    :label="item.attributeName"
                                    style="width: 30%; margin: 5px; overflow: hidden; white-space: nowrap; text-overflow: ellipsis;"></checkbox>
                        </div>
                      </Panel>
                    </Collapse>
                  </div>
                </Panel>
                <Panel name="3">
                  右类
                  <div slot="content">
                    <Collapse v-model="defaultRightOpen">
                      <Panel name="3-1">
                        系统属性
                        <div slot="content">
                          <checkbox v-for="(item, index) in attributes_rightSys"
                                    :key="index"
                                    :label="item.attributeName"
                                    style="width: 30%; margin: 5px; overflow: hidden; white-space: nowrap; text-overflow: ellipsis;"></checkbox>
                        </div>
                      </Panel>
                      <Panel name="3-2">
                        类属性
                        <div slot="content">
                          <checkbox v-for="(item, index) in attributes_rightDef"
                                    :key="index"
                                    :label="item.attributeName"
                                    style="width: 30%; margin: 5px; overflow: hidden; white-space: nowrap; text-overflow: ellipsis;"></checkbox>
                        </div>
                      </Panel>
                    </Collapse>
                  </div>
                </Panel>
              </Collapse>
            </checkbox-group>
          </Col>
        </Row> -->
      </div>
      <div slot="footer">
        <Button type="text" @click="addTimeSeriesModalCancel">取消</Button>
        <Button type="primary" @click="confirmAddTimeSeries">确认</Button>
      </div>
    </Modal>
  </section>
  <section v-else :addinName="name">
        <span style="text-align:center">
            <div class="form-addin-icon">
                <i class="iconfont">&#xe6c3;</i>
            </div>
            <Tooltip class="form-addin-name" content="时序看板" style="width: 100%;" :transfer="true">时序看板</Tooltip>
        </span>
  </section>
</template>

<script>
  import '@/styles/component/iconfont.css';
  import EditBox from "./_EditBox.vue"
  import {mapActions} from "vuex";
  import { getAllIotdbs, getAllDevices, getTimeSeriesByDevice, getMultiTimeSeries, getEobjSingle, getRobjSingle} from "@/api/others.js";
  import {SYS_ENTITY_ATTRIBUTES, SYS_RELATION_ATTRIBUTES} from '@/libs/utils.js';
  import _ from 'lodash';
  import moment from 'moment';

  const name = "TimeSeriesBoard";
  export default {
    name: name,
    props: ["argsProps", "widgetAnnotation", "editExtendInfo" , "itemValue", "query_oprs", "route", "router", "root", "store", "echarts", "attributes"],
    data() {
      return {
        editing: false,
        actEdit: false,
        times: 0,
        name: name,
        t_preview: true,
        t_edit: false,
        targetClass: '',
        isRelation: false,
        defaultEOpen: '2',
        defaultROpen: '1',
        defaultRelationOpen: '1-2',
        defaultLeftOpen: '2-2',
        defaultRightOpen: '3-2',

        allDataSources: [],
        allPath: [],
        allTS: [],
        varianceValue: 0,      // 方差值
        showVariance: false,

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
          title: "时序看板",               // 插件中文名,需要填入默认值
          chartTitle: '时序看板',
          // events: [],
          eventRange: [],
          dataSourceName: '',
          devicePath: '',
          seriesType: 'line',
          statistics: [],

          // eventRange: ["初始化", "点击系列"],
          timeSeriesMap: [],                  //图表序列
          queryType: 'sample',                //查询类型
          timeSeriesTimeType: 'absolute',     //显示类型
          timeSeriesStartTime: '',            //开始时间
          timeSeriesEndTime: '',            //结束时间
          sampleMethod: "min",                //采样方式，支持的采样方式为"min"/"max"/"mean"/"count"/"sum"
          intervalValue: 1,                   //采样时间间隔大小（整数）
          intervalUnit: "d",                  //采样时间间隔单位（可填单位包括"ms"/"s"/"m"/"h"/"d"/"w"，分别代表毫秒/秒/分钟/小时/天/周）
          timeSeriesRelativeTime: 0,          //相对时间
          timeSeriesRelativeTimeUnit: 's',    //相对单位
          intervalFrequency: 0,               //间隔频率
          intervalFrequencyUnit: 's',         //间隔单位

          rangeSelect: false,                 //区间选择
          areaZoom: false,
          selectSeries: false,
          multiCharts: false,
          dateSwitch: false,
          newDataPolicy: 'replace',           //新数据替换策略
        },
        // 支持的数据类型, 基础数据类型为 String, TimeStamp, Boolean, Interger, Double, Long, UUID, Date, Clob
        dataTypes: ['Timeseries'],
        timeSeriesStartTime: '',
        addTimeSeriesModal: false,
        addTargetAttr: '',
        addDisplayName: '',
        currentTimeSeries: {
          target: '',
          targetName: ''
        },
        currentTimeSeriesIndex: '',
        option: {
          color: [],
          title: {
            text: "",
            textStyle: {
              color: '#333'
            }
            // x: 'center'
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
          },
          toolbox: {
            iconStyle: {
              color: ''
            }
          },
          xAxis: {
            type: 'value',
          },
          yAxis: {
            type: 'value',
          },
          dataZoom: [],
          series: []
        },
        optionFactory: {
          color: [],
          title: {
            text: '',
            x: 'center',
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
          },
          toolbox: {
            show: true,
            iconStyle: {
              color: ''
            },
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
        },
        timeSeriesHash: {},
        relationFilterAttribute: [],
        timeSeriesStartTime: '',
        timeSeriesEndTime: '',
      }
    },
    // components: {
    //     EditBox
    // },
    components: {
      EditBox,
    },
    inject: [
      'setBasicArgs'
    ],
    created() {
      //通用方法给args赋值
    this.args = this.setBasicArgs(this.args);
    this.setArgs(this.args);
      if(this.t_preview) {
        this.$store = this.store;

        // if (this.isRelation) {
        //   this.attributes_relationSys = this.attributes[1].filter(item => SYS_RELATION_ATTRIBUTES(item) !== -1);
        //   this.attributes_relationDef = this.attributes[1].filter(item => SYS_RELATION_ATTRIBUTES(item) === -1);
        //   this.attributes_leftSys = this.attributes[2].filter(item => SYS_ENTITY_ATTRIBUTES(item) !== -1);
        //   this.attributes_leftDef = this.attributes[2].filter(item => SYS_ENTITY_ATTRIBUTES(item) === -1);
        //   this.attributes_rightSys = this.attributes[3].filter(item => SYS_ENTITY_ATTRIBUTES(item) !== -1);
        //   this.attributes_rightDef = this.attributes[3].filter(item => SYS_ENTITY_ATTRIBUTES(item) === -1);
        // } else {
        //   this.attributes_sys = this.attributes.filter(item => SYS_ENTITY_ATTRIBUTES(item) !== -1);
        //   this.attributes_def = this.attributes.filter(item => SYS_ENTITY_ATTRIBUTES(item) === -1);
        // }

        getAllIotdbs().then(response => {

          let res = response.data;
          if (!res.success) {
            this.$Message.error(res.message);
          } else {
            this.allDataSources = res.data;

            if(this.args.dataSourceName) {

              this.changeDataSource(this.args.dataSourceName);
              if(this.args.devicePath) this.changePath(this.args.devicePath);

            }

          }

        }).catch(e => {
          this.$Spin.hide();
          console.log(e);
        });

      }
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
    mounted() {
      if(this.t_preview) {

        this.targetClass = this.itemValue.data.targetClass;
        this.isRelation = this.itemValue.data.isRelation;

        this.$nextTick(() => {
          this.timeSeriesStartTime = this.args.timeSeriesStartTime;
          this.timeSeriesEndTime = this.args.timeSeriesEndTime;
          if (this.args.timeSeriesMap.length !== 0) {
            this.render();
          } else {

            this.option.title.text = this.args.chartTitle;
            this.option.title.x = 'center';
            this.mychart = this.echarts.init(this.$refs.echart);
            this.mychart.setOption(this.option);

          }
        });
      }

      // if (this.t_preview) {
      //   let that = this;
      //   setTimeout(() => {
      //     that.chart = that.echarts.init(that.$refs.echart);
      //     if (that.args.code != "") {
      //       that.run();
      //     }
      //   }, 30);
      // }

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
      filter_attributes() {
        return this.attributes
          ? this.isRelation
            ? [
              "relation",
              this.attributes[1].filter(
                x => this.dataTypes.indexOf(x.valueType) > -1
              ),
              this.attributes[2].filter(
                x => this.dataTypes.indexOf(x.valueType) > -1
              ),
              this.attributes[3].filter(
                x => this.dataTypes.indexOf(x.valueType) > -1
              )
            ]
            : this.attributes.filter(
              x => this.dataTypes.indexOf(x.valueType) > -1
            )
          : [];
      },
    },
    watch: {
      arg_width(val) {
        setTimeout(() => {
          this.resizeChart();
        }, 30);
        // this.chartResize();
      },
      arg_height(val) {
        // this.domCM.style.height = parseInt(val.substring(0, val.length-2)) - 40 + this.args.heightType;
        // this.chartResize();
        setTimeout(() => {
          this.resizeChart();
        }, 30);
      },
      filter_attributes(val) {
        if (this.isRelation) {
          this.relationFilterAttribute = val[1].concat(val[2]).concat(val[3]);
        }
      },
      // 'currentTimeSeries.target'(val) {
      //   if(!val) return;
      //   if (this.isRelation) {
      //     this.currentTimeSeries.targetName = this.relationFilterAttribute.find(item => item.attributeName === val.replace(/^(left_|right_|relation_)/g, '')) ? this.relationFilterAttribute.find(item => item.attributeName === val.replace(/^(left_|right_|relation_)/g, '')).displayName : '';
      //   } else {
      //     this.currentTimeSeries.targetName = this.filter_attributes.find(item => item.attributeName === val) ? this.filter_attributes.find(item => item.attributeName === val).displayName : '';
      //   }
      // }
    },
    methods: {
      ...mapActions("DWF_form", ["handleQueryData"]),

      // 切换数据源 切换设备路径列表
      changeDataSource(val) {
        console.log(val);

        getAllDevices(val).then(response => {

          let res = response.data;
          if (!res.success) {
            this.$Message.error('IoTDB数据库连接失效，请检查！');
          } else {
            this.allPath = res.data;
          }

        }).catch(e => {
          console.log(e);
        });

      },

      changePath(val) {
        console.log(val)

        getTimeSeriesByDevice(this.args.dataSourceName, val).then(response => {
          let res = response.data;
          if (!res.success) {
            this.$Message.error(res.message);
          } else {
            this.allTS = res.data;
          }
        }).catch(e => {
          console.log(e);
        });

      },
      /**
       * @description增加或删除一条时间序列属性
       */
      addTimeSeriesMap() {

        if(!this.args.dataSourceName) {
          this.$Message.warning('请先选择数据源');
        } else if(!this.args.devicePath) {
          this.$Message.warning('请先选择设备路径');
        } else {

          this.addTimeSeriesModal = true;
          this.$nextTick(() => {
            let timeSeries = {
              target: '',
              targetName: ''
            };
            this.args.timeSeriesMap.push(timeSeries);
            this.currentTimeSeriesIndex = this.args.timeSeriesMap.length - 1;
            this.currentTimeSeries = _.cloneDeep(this.args.timeSeriesMap[this.currentTimeSeriesIndex]);
            // this.$refs.currentTimeSeriesTarget.setQuery('')
            // this.currentTimeSeries.target = ' ';
          })

        }

      },

      removeTimeSeriesMap(index) {
        this.args.timeSeriesMap.splice(index, 1);
      },

      timeSeriesSetting(index) {
        this.timeSeriesSettingCondition = true;
        this.addTimeSeriesModal = true;
        this.$nextTick(() => {
          this.currentTimeSeriesIndex = index;
          this.currentTimeSeries = _.cloneDeep(this.args.timeSeriesMap[index]);
          console.log(this.currentTimeSeries)
        })
      },

      async confirmAddTimeSeries() {
        if(this.currentTimeSeries.target === ''){
          this.$Message.error('请先选择序列');
          return
        }
        this.args.timeSeriesMap[this.currentTimeSeriesIndex] = _.cloneDeep(this.currentTimeSeries);

        // this.initQuery();
        // await this.freshData();

        this.addTimeSeriesModal = false;
      },
      addTimeSeriesModalCancel(){
        if(this.timeSeriesSettingCondition){
          this.timeSeriesSettingCondition = false;
        }else{
          this.args.timeSeriesMap.pop();
        }
        this.addTimeSeriesModal = false;
      },
      initQuery() {
        if (this.args.timeSeriesTimeType === 'relative') {
          this.endTime = moment(new Date(this.args.timeSeriesEndTime));
          this.rangeMin = this.endTime.subtract(this.args.timeSeriesRelativeTime, this.args.timeSeriesRelativeTimeUnit).format('YYYY-MM-DDTHH:mm:ss');
          this.rangeMax = moment(new Date(this.args.timeSeriesEndTime)).format('YYYY-MM-DDTHH:mm:ss');
        } else {
          this.startTime = moment(new Date(this.args.timeSeriesStartTime));
          this.endTime = moment(new Date(this.args.timeSeriesEndTime));
          this.rangeMin = this.startTime.format('YYYY-MM-DDTHH:mm:ss');
          // this.rangeMax = moment(new Date()).format('YYYY-MM-DDTHH:mm:ss');
          this.rangeMax = this.endTime.format('YYYY-MM-DDTHH:mm:ss');
        }
      },

      // resizeChart() {
      //   if(this.t_preview||this.t_edit) {
      //     setTimeout(() => {
      //       let eleW = document.getElementsByClassName('echart-bar');
      //       for(var i = 0; i < eleW.length; i++){
      //         const eachPW = eleW[i].parentNode.clientWidth;
      //         var myChart = this.echarts.getInstanceByDom(eleW[i]);
      //         if(myChart) {
      //           myChart.resize();
      //         }
      //       }
      //     }, 200)
      //   }
      // },

      // 画图
      async render() {

        if(!this.args.dataSourceName) {
          this.$Message.warning('请先选择数据源');
        } else if(!this.args.devicePath) {
          this.$Message.warning('请先选择设备路径');
        } else if(this.args.timeSeriesMap.length == 0) {
          this.$Message.warning('请先增加序列');
        } else {

          this.initQuery();
          await this.freshData();

        }

      },

      async freshData() {

        let xAxis = [], series = [], color = [];
        this.showVariance = false;

        let tsArr = [];
        for (let [index, timeSeries] of this.args.timeSeriesMap.entries()) {
          tsArr.push(timeSeries.target.substr(timeSeries.target.lastIndexOf('.') + 1));
        }

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

        try {

          this.option.series = [];
          let data = await getMultiTimeSeries(this.args.dataSourceName, this.args.devicePath, params);
          if(data.data.success) {

            let tsData = data.data.data;
            if(tsData.length > 0) {

              if(tsData.length > 10) tsData = tsData.slice(0, 10);

              tsData.forEach((val, ind) => {

                let timeSeries = this.args.timeSeriesMap[ind];
                this.timeSeriesHash[timeSeries.target] = data.data.data[ind];

                let color = this.randomColor();
                this.option.legend.data.push(timeSeries.targetName || tsArr[ind]);
                this.option.color.push(color);

                ind === 0 ? this.option.xAxis = {
                  type: 'time',
                  boundaryGap: false,
                  splitLine: {
                    show: false
                  },
                } : '';

                let series = {
                  name: timeSeries.targetName || tsArr[ind],
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
                  data: this.timeSeriesHash[timeSeries.target].series
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
                    let total = this.timeSeriesHash[timeSeries.target].series.map(item => item[1]);
                    let variance = this.variance(total);
                    if(ind === 0) {
                      this.varianceValue = variance;
                      this.showVariance = true;
                    }
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

              })

              console.log(this.option)
              this.option.title.text = this.args.chartTitle;
              if(this.args.rangeSelect) {
                this.option.dataZoom.push({
                  filterMode: 'filter'
                });
              } else {
                this.option.dataZoom = [];
              }

              // 区域放大开关
              if(this.args.areaZoom) {

                this.option.title['left'] = 20;
                this.option.toolbox = {
                  left: 'center',
                  feature: {
                      dataZoom: {
                          yAxisIndex: 'none'
                      },
                      restore: {}
                  }
                }

              } else {
                this.option.toolbox = {
                  show: false
                };
                this.option.title['left'] = 'center';
              }

              if(this.mychart) {
                if(typeof this.mychart.dispose === 'function') this.mychart.dispose();
              }

              this.mychart = this.echarts.init(this.$refs.echart);
              this.mychart.setOption(this.option);

              this.addTimeSeriesModal = false;

            } else {

              this.addTimeSeriesModal = false;
              this.setDefaultOption();

            }

          } else {
            this.$Message.warning('查询失败')
            this.addTimeSeriesModal = false;
            this.setDefaultOption();
          }

        } catch (error) {
          console.log(error);
          this.addTimeSeriesModal = false;
          this.setDefaultOption();
        }

      },

      setDefaultOption(){
        this.option = {
          color: [],
          title: {
            text: '',
            x: 'center',
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
          },
          toolbox: {
            show: true,
            iconStyle: {
              color: ''
            },
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

      resizeChart() {
        if (this.t_preview || this.t_edit) {
          setTimeout(() => {
            if (this.mychart) {
              this.mychart.resize();
            }
          }, 0)
        }
      },

      currentTimeSeriesTargetOpen(val){
        if(val && !this.currentTimeSeries.target){
          // this.currentTimeSeries.target = '';
          // this.$refs.currentTimeSeriesTarget.setQuery(' ')
        }
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

      // 获取dropTarget区域可继承属性, dropTarget可传空
      getInherit(dropTarget) {
        var res = {};
        let that = this;
        this.inherit.forEach(x => res[x] = that.args[x]);
        return res;
      },

      getEditBoxComponent(){
      return this.$refs.editbox;
    },

    getEditBox() {
        this.t_edit = true;
        return this.$refs.edit;
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

  .margin1 {
    margin-top: 10px;
    margin-bottom: 10px;
  }

  .timeSeriesName {
    width: 60%;
    display: block;
    float: left;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    word-break: break-all;
  }

  .timeSeriesMapList {
    height: 30px;
    line-height: 20px;
    list-style: none;
    /* border-top: 1px solid #eee; */
    border-bottom: 1px solid #eee;
    padding: 5px 0;
  }

  .timeSeriesSetting {
    float: right;
    font-size: 18px;
    margin: 1px 6px 0 0;
    cursor: pointer;
  }
</style>
