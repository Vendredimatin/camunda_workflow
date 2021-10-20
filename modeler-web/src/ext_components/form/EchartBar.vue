<template>
    <section :addinName="name" v-if="t_preview" ref="main" :style="{'width': arg_width, 'float': 'left'}">
        <!-- <div class="echart-bar" ref='previewbox' id="box" :style="args.style"></div> -->
        <!-- <div class="exportData-btn" v-show="args.isExport">
          <Button type="default" icon="ios-download-outline" style="float: right;">导出数据</Button>
        </div> -->
        <!-- <div class="echart-bar" ref='previewbox' id="box" :style="{'width': '100%', 'height': args.isExport ? ((parseInt(arg_height) - 40) + 'px') : arg_height}"></div> -->
        <h2 v-show="hasSeries" style="font-size: 18px; color: #333; text-align: center;font-weight: bold;">混合图</h2>
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
              :itemValue="itemValue"
              :store="store"
              :route="route"
              :root="root"
              :query_oprs="query_oprs"
              :targetclass="itemValue.data.targetClass">
                <div slot="attribute">
                    <div class="editsection">
                        <!-- <Form :model="args" :label-width="80"> -->
                          <!-- <p>图表项名(用于查询框识别标识)</p>
                          <Input class="modelRow" v-model="args.name"></Input> -->
                          <p class="margin1">图表标题</p>
                          <Input class="margin1" v-model="args.option.title.text"></Input>

                          <p class="margin1">标题字体大小</p>
                          <InputNumber :min="0" class="margin1" v-model="args.option.title.textStyle.fontSize"></InputNumber>

                          <p class="margin1">标题字体颜色</p>
                          <ColorPicker class="margin1" v-model="args.option.title.textStyle.color"/>

                          <!-- <p class="margin1">图例字体</p>
                          <Input class="margin1" v-model="args.selfLegend"></Input> -->
                          <p class="margin1">图例字体大小</p>
                          <InputNumber :min="0" class="margin1" v-model="args.selfLegendSize"></InputNumber>

                          <p class="margin1">图例字体颜色</p>
                          <ColorPicker class="margin1" v-model="args.selfLegendColor"/>

                          <p class="margin1">最大数据数量</p>
                          <InputNumber class="margin1" style="width: 100%;" v-model="args.maxNum" :min='0' :step='1'></InputNumber>

                          <div class="chartView" v-for="(item , index) in args.option.xAxis" :key="index">
                              <div v-show="index == 0">
                                  <p class="margin1">X轴类型</p>
                                  <Select v-model="item.type" class="margin1" @on-change="avoidSameX($event, index)">
                                      <Option v-for="(i,j) in xAxisTypeList" :value="i" :key="j">{{i}}</Option>
                                  </Select>
                                  <p class="margin1">Y轴类型</p>
                                  <Select v-model="args.option.yAxis[index].type" class="margin1" @on-change="avoidSameY($event, index)" disabled>
                                      <Option v-for="(i,j) in yAxisTypeList" :value="i" :key="j">{{i}}</Option>
                                  </Select>
                                  <p class="margin1">category轴日期转换格式</p>
                                  <Select v-model="args.transDateType" class="margin1" @on-change="changeDateType">
                                      <Option v-for="type in dateTypeList" :value="type.value" :key="type.value">{{type.label}}</Option>
                                  </Select>

                                  <!-- <p class="margin1">{{ item.type == 'category' ? 'X' : 'Y' }}轴单位</p>
                                  <Input class="margin1" v-model=""></Input> -->
                                  <!-- 是否带有导出数据按钮 -->
                                  <!-- <p class="margin1">是否需要数据导出</p>
                                  <i-switch class="margin1" v-model="args.switchExport" @on-change="changeExport" /> -->
                                  <!-- 选择需要导出的属性 -->
                                  <!-- <div v-show="args.isExport">
                                    <p class="margin1">选择需要导出的属性</p>
                                    <Select class="margin1" v-model="args.exportAttr" filterable multiple>
                                        <Option v-for="item in filter_attributes" :key="item.id" :value="item.attributeName">{{ item.displayName }}</Option>
                                    </Select>
                                    <Button type="primary" class="margin1" @click="chooseAttr" style="margin-right: 6px;">确认</Button>
                                    <Button class="margin1" @click="args.exportAttr = []">重置</Button>
                                  </div> -->

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
                                  <Col span="10">
                                      <span style="font-size: 12px;">映射属性</span>
                                  </Col>
                                  <Col span="14" style="text-align: right;">
                                      <Button type="text" size="small" @click="addChartSeries(index)">
                                      <span style="font-size: 12px;">添加系列</span>
                                      <Icon type="md-add"></Icon>
                                      </Button>
                                  </Col>
                                  </Row>
                                  <!-- <p class="m5">系列
                                      <Button type="primary" size="small" @click="addChartSeries(index)">增加系列</Button>
                                  </p> -->
                                  <div class="series margin1" v-for="(i,j) in args.series[0]" :key="j">
                                      <Row class="seriesWrap">
                                      <Col span="14" class="overTxt">
                                          <span class="seriesItem seriesTxt">{{j}}</span>
                                          <span class="seriesTxt">{{args.series[0][j].selfEname}}</span>
                                      </Col>
                                      <Col span="10" style="text-align: right;">
                                          <span class="seriesItem seriesTxt">{{args.series[0][j].type}}</span>
                                          <span class="seriesItem seriesIcon" @click="modalShow(0, j)">
                                          <Icon type="md-settings"></Icon>
                                          </span>
                                          <span class="seriesIcon" @click="delSeries(j)">
                                          <Icon type="md-close"></Icon>
                                          </span>
                                      </Col>
                                      </Row>
                                  </div>

                                  <div class="margin1" style="padding: 0 20px 0 0;margin-top: 20px;">
                                    工具栏
                                    <i-switch style="float: right" v-model="args.option.toolbox.show"/>
                                  </div>
                                </div>
                          </div>
                          <!-- <Button class="addPreviewChart" type="primary" size="small" @click="addPreviewChart(args.option)">增加显示图表</Button> -->
                          <br>
                          <Button type="success" long @click="freshData(parsedStr)">绘制</Button>
                          <!-- <Button type="success" long @click="showScriptModal = true">添加脚本</Button> -->
                        <!-- </Form> -->
                    </div>
                </div>
                <div slot="layout">
                </div>
                <div slot="operation">
                </div>
            </EditBox>

            <Modal v-model="modal" title="设置系列" width="70%">
              <Row class="modelRow">
                <Col span="12">
                  <Row >
                      <Col span="6">
                      <span>类型</span>
                      </Col>
                      <Col span="16">
                      <Select v-model="modalValue.type" @on-change="changeToPileBar">
                        <Option v-for="(item,index) in chartTypeList" :value="item" :key="index" :disabled="((item == 'crossPile' || item == 'verticalStack') && cantSwitch)">{{item}}</Option>
                      </Select>
                      </Col>
                  </Row>
                </Col>
                <Col span="12">
                  <Row v-show="yIsCategory">
                    <Col span="6">
                      <span>Y轴位置</span>
                    </Col>
                    <Col span="16">
                        <RadioGroup v-model="yType" @on-change="changeYType">
                          <Radio label="left"></Radio>
                          <Radio label="right"></Radio>
                        </RadioGroup>
                    </Col>
                  </Row>
                </Col>
              </Row>
              <Row class="modelRow">
                <Col span="12">
                  <Row>
                      <Col span="6">
                        <span>X轴</span>
                      </Col>
                      <Col span="16">
                        <Select v-if="reloadX" v-model="modalValue.x" :disabled="(modalValue.x != '' &&  args.series[0].length > 1 && args.option.xAxis[0].type == 'category')" filterable :multiple="isXPile" @on-change="fitXSerise">
                            <!-- <Option v-for="(item, index) in groupAttrList" :key="index" :value="item.attributeName">{{ item.displayName }}</Option> -->
                            <OptionGroup v-for="group in adjustXAttrList" :label="group.groupName" :key="group.groupName">
                              <Option v-for="(item, index) in group.attrList" :key="index" :value="`${group.groupType}${item.attributeName}`" :label="item.displayName">
                                <span>{{ item.displayName }}</span>
                                <span style="float:right;color:#ccc">{{ item.attributeName }}</span>
                              </Option>
                            </OptionGroup>
                        </Select>
                      </Col>
                  </Row>
                </Col>
                <Col span="12">
                   <Row>
                      <Col span="6">
                        <span>X轴单位</span>
                      </Col>
                      <Col span="16">
                        <Input v-model="modalValue.xName"></Input>
                      </Col>
                  </Row>
                </Col>
              </Row>
              <Row class="modelRow">
                <Col span="12">
                  <Row>
                      <Col span="6">
                        <span>X轴标签大小</span>
                      </Col>
                      <Col span="16">
                        <InputNumber :min="0" v-model="modalValue.xLabelSize"></InputNumber>
                      </Col>
                  </Row>
                </Col>
                <Col span="12">
                  <Row>
                        <Col span="6">
                          <span>X轴标签颜色</span>
                        </Col>
                        <Col span="16">
                          <ColorPicker v-model="modalValue.xLabelColor"/>
                        </Col>
                    </Row>
                </Col>
              </Row>
              <Row class="modelRow">
                <Col span="12">
                  <Row>
                      <Col span="6">
                        <span>X轴标签角度</span>
                      </Col>
                      <Col span="16">
                        <InputNumber :max="90" :min="-90" v-model="modalValue.xLabelRotate"></InputNumber>
                      </Col>
                  </Row>
                </Col>
                <Col span="12" v-show="!yIsCategory">
                  <Row>
                    <Col span="6">
                      <span>X轴网格</span>
                    </Col>
                    <Col span="16">
                      <i-switch v-model="modalValue.showXSplitLine"/>
                    </Col>
                  </Row>
                </Col>
              </Row>
              <Row class="modelRow" style="padding-bottom: 20px; border-bottom: 1px solid #ddd;">
                <Col span="12" v-show="!yIsCategory">
                  <Row>
                    <Col span="6">
                      <span>X轴网格颜色</span>
                    </Col>
                    <Col span="16">
                      <ColorPicker :disabled="!modalValue.showXSplitLine" v-model="modalValue.XGridColor"/>
                    </Col>
                  </Row>
                </Col>
                <Col span="12">
                </Col>
              </Row>
              <Row class="modelRow" style="padding-top: 20px;">
                <Col span="12">
                  <Row>
                      <Col span="6">
                        <span>Y轴</span>
                      </Col>
                      <Col span="16">
                        <Select v-if="reloadY" ref="ySelect" v-model="modalValue.y" :disabled="!yIsCategory &&  args.series[0].length > 1" filterable :multiple="isPile" @on-change="fitYSerise">
                            <OptionGroup v-for="group in adjustYAttrList" :label="group.groupName" :key="group.groupName">
                              <Option v-for="(item, index) in group.attrList" :key="index" :value="`${group.groupType}${item.attributeName}`" :label="item.displayName">
                                <span>{{ item.displayName }}</span>
                                <span style="float:right;color:#ccc">{{ item.attributeName }}</span>
                              </Option>
                            </OptionGroup>
                        </Select>
                      </Col>
                  </Row>
                </Col>
                <Col span="12">
                  <Row>
                      <Col span="6">
                        <span>Y轴单位</span>
                      </Col>
                      <Col span="16">
                        <Input v-model="modalValue.yName"></Input>
                      </Col>
                  </Row>
                </Col>
              </Row>
              <Row class="modelRow" v-show="!yIsCategory">
                <Col span="12">
                  <Row>
                      <Col span="6">
                        <span>Y轴标签角度</span>
                      </Col>
                      <Col span="16">
                        <InputNumber :max="90" :min="-90" v-model="modalValue.yLabelRotate"></InputNumber>
                      </Col>
                  </Row>
                </Col>
                <Col span="12">
                </Col>
              </Row>
              <Row class="modelRow" v-show="yType == 'left' || modalValue.type == 'crossPile' || modalValue.type == 'verticalStack'">
                <Col span="12">
                  <Row>
                      <Col span="6">
                        <span>左Y轴标签大小</span>
                      </Col>
                      <Col span="16">
                        <InputNumber :min="0" v-model="modalValue.yLeftLabelSize"></InputNumber>
                      </Col>
                  </Row>
                </Col>
                <Col span="12">
                  <Row>
                        <Col span="6">
                          <span>左Y轴标签颜色</span>
                        </Col>
                        <Col span="16">
                          <ColorPicker v-model="modalValue.yLeftLabelColor"/>
                        </Col>
                    </Row>
                </Col>
              </Row>
              <Row class="modelRow" v-show="yIsCategory && yType == 'left' || modalValue.type == 'crossPile' || modalValue.type == 'verticalStack'">
                <Col span="12">
                  <Row>
                    <Col span="6">
                      <span>左Y轴网格</span>
                    </Col>
                    <Col span="16">
                      <i-switch v-model="modalValue.showLeftSplitLine"/>
                    </Col>
                  </Row>
                </Col>
                <Col span="12">
                  <Row>
                    <Col span="6">
                      <span>左Y轴网格颜色</span>
                    </Col>
                    <Col span="16">
                      <ColorPicker :disabled="!modalValue.showLeftSplitLine" v-model="modalValue.leftGridColor"/>
                    </Col>
                  </Row>
                </Col>
              </Row>
              <Row class="modelRow" v-show="yIsCategory && yType == 'right' && modalValue.type != 'crossPile' && modalValue.type != 'verticalStack'">
                <Col span="12">
                  <Row>
                      <Col span="6">
                        <span>右Y轴标签大小</span>
                      </Col>
                      <Col span="16">
                        <InputNumber :min="0" v-model="modalValue.yRightLabelSize"></InputNumber>
                      </Col>
                  </Row>
                </Col>
                <Col span="12">
                  <Row>
                        <Col span="6">
                          <span>右Y轴标签颜色</span>
                        </Col>
                        <Col span="16">
                          <ColorPicker v-model="modalValue.yRightLabelColor"/>
                        </Col>
                    </Row>
                </Col>
              </Row>
              <Row class="modelRow" v-show="yIsCategory && yType == 'right' && modalValue.type != 'crossPile' && modalValue.type != 'verticalStack'">
                <Col span="12">
                  <Row>
                    <Col span="6">
                      <span>右Y轴网格</span>
                    </Col>
                    <Col span="16">
                      <i-switch v-model="modalValue.showRightSplitLine"/>
                    </Col>
                  </Row>
                </Col>
                <Col span="12">
                  <Row>
                    <Col span="6">
                      <span>右Y轴网格颜色</span>
                    </Col>
                    <Col span="16">
                      <ColorPicker :disabled="!modalValue.showRightSplitLine" v-model="modalValue.rightGridColor"/>
                    </Col>
                  </Row>
                </Col>
              </Row>
              <Row class="modelRow" v-show="modalValue.type == 'bar' || modalValue.type == 'line'">
                <Col span="12">
                  <Row>
                      <Col span="6">
                        <span>图例名称</span>
                      </Col>
                      <Col span="16">
                        <Input v-model="modalValue.selfSeriesName"></Input>
                      </Col>
                  </Row>
                </Col>
                <Col span="12">
                </Col>
              </Row>
              <!-- <Row class="modelRow">
                <Col span="12">
                </Col>
                <Col span="12">
                </Col>
              </Row> -->
                <p style="height: 30px; line-height: 30px; border-bottom: 1px solid #ddd;">悬停提示内容</p>
                <Row>
                    <Col span="24">
                    <!-- <checkbox-group v-model="modalValue.tooltip">
                        <checkbox v-for="(item, index) in args.option.dataset.source[0]" :key="index" :label="item"></checkbox>
                    </checkbox-group> -->
                      <!-- <checkbox-group v-model="modalValue.tooltip">
                        <checkbox v-for="(item, index) in groupAttrList"
                        :key="index"
                        :label="item.attributeName"
                        style="width: 30%; margin: 5px; overflow: hidden; white-space: nowrap; text-overflow: ellipsis;"></checkbox>
                      </checkbox-group> -->

                      <CheckboxGroup v-model="modalValue.tooltip">
                        <Collapse simple>
                          <Panel v-for="group in groupAttrList" :key="group.groupName">
                            {{ group.groupName }}
                            <div slot="content">
                              <Checkbox v-for="(item, index) in group.attrList"
                              :key="index"
                              :label="`${group.groupType}${item.attributeName}`"
                              style="width: 30%; margin: 5px; overflow: hidden; white-space: nowrap; text-overflow: ellipsis;">
                              {{ item.displayName }}
                              </Checkbox>
                            </div>
                          </Panel>
                        </Collapse>
                      </CheckboxGroup>

                    </Col>
                </Row>
                <div slot="footer">
                  <Button type="text" @click="cancel">取消</Button>
                  <Button type="primary" @click="ok">确认</Button>
                </div>
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
                <i class="iconfont">&#xe6aa;</i>
            </div>
            <div class="form-addin-name">
                混合图
            </div>
        </span>
    </section>

</template>

<script>
import EditBox from "./_EditBox.vue"
import BindOperationBar from "./subcomponent/BindOperationBar.vue"
import { mapGetters, mapActions } from "vuex";
import "@/styles/component/iconfont.css";
import { getEobj } from '@/api/others';
import { SYS_ENTITY_ATTRIBUTES, SYS_RELATION_ATTRIBUTES } from '@/libs/utils.js'
// 引入 ECharts 主模块
var echarts = require("echarts");

const name = "EchartBar";
export default {
  // 插件名
  name: name,
  props: ["argsProps", "widgetAnnotation", "editExtendInfo" , "itemValue", "attributes", "store", "query_oprs", "route", "router", "root" ],
  components: {
    EditBox,
    BindOperationBar
  },
  data() {
    return {
      // 插件名
      name: name,

      // 展示模式
      t_preview: true,
      t_edit: false,
      actEdit: false,
      editChange: false,
      hasSeries: true,
      // showScriptModal: false,
      yIsCategory: true,
      reloadX: false,
      reloadY: false,
      cantSwitch: false,

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
      groupAttrList: [],
      groupNumberTypeList: [],

      xType: 'category',
      adjustXAttrList: [],
      adjustYAttrList: [],
      actAttributes: [],

      clickData: [],
      dateTypeList: [
        {
          value: 'time',
          label: 'hh:mm:ss'
        }, {
          value: 'date',
          label: 'YYYY-MM-DD'
        }, {
          value: 'dateTime',
          label: 'YYYY-MM-DD hh:mm:ss'
        }
      ],
      // 编辑框
      args: {
        bindTargetClass: '',
        lEnClass: '',
        rEnClass: '',
        filterQuery: "",
        title: '混合图',
        id: null,
        value: "",
        echartName: "",
        targetDataType: null,
        hided: false,
        transDateType: 'time',
        // xAxisSelfName: '',
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
        maxNum: 10,
        // selfLegend: '{name}',
        selfLegendSize: 12,
        selfLegendColor: '#333',
        //数据配置
        option: {
          title: {
            text: "混合图",
            left: "center",
            textStyle: {
              color: '#333',
              fontSize: 18
            }
          },
          color: ['#31C5E9', '#9EE7B9', '#FFDB5C', '#FF9F7F','#FC7192', '#E062AE', '#E690D1','#E7BCF4', '#9D96F5', '#8277EA'],
          legend: {
            bottom: "0",
            data: [],
            textStyle: {
              color: '#333',
              fontSize: 12
            },
            // formatter: '{name}'
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
              // dataView: { show: true, readOnly: false },
              magicType: {
                show: true,
                type: ["line", "bar", "stack", "tiled"]
              },
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
        xName: '',
        y: "",
        yName: '',
        y_x: "",
        tooltip: [],
        showXSplitLine: true,
        XGridColor: '#ccc',
        showLeftSplitLine: true,
        leftGridColor: '#ccc',
        showRightSplitLine: false,
        rightGridColor: '#ccc',
        xLabelColor: '#333',
        xLabelRotate: 0,
        yLabelRotate: 0,
        xLabelSize: 12,
        yLeftLabelColor: '#333',
        yLeftLabelSize: 12,
        yRightLabelColor: '#333',
        yRightLabelSize: 12,
        selfSeriesName: ''
      },
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
      attrMap: {},
      firstLoad: true
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

      // this.parseEvent();

      // this.addPreviewChart(this.addPreviewChart(this.args.option));

      // 缺省绑定类为当前表单目标类
      if(this.args.bindTargetClass == '') {

        if(this.itemValue.data.isRelation) {
          this.args.bindTargetClass = this.itemValue.data.targetClass + '&r';
        } else {
          this.args.bindTargetClass = this.itemValue.data.targetClass + '&e';
        }

      }
      if(this.args.series.length == 0 && this.args.option.xAxis.length == 0) {
        this.addPreviewChart(this.args.option);
      }

      if(this.args.option.series.length > 0) {

        this.hasSeries = false;
        this.seriesYType = this.args.option.yAxis[0].type;
        this.freshData(this.parsedStr);

      } else {
        this.hasSeries = true;
      }
      // else {
        // this.createChartBar(this.args.option);
        // this.resizeChart();
      // }

    }

    // if (this.t_show) {
    //   this.previewChart();
    // }

  },
  watch: {

    async arg_bindClass(val) {
      if(val != undefined && val != '' && val != 'undefined') {

        let curClass = val.split('&')[0];
        this.groupAttrList = [];
        this.groupNumberTypeList = [];
        this.adjustXAttrList = [];
        this.adjustYAttrList = [];

        if(val.split('&')[1] == 'e') {

          await this.queryEntity(curClass);
          let enTypeAttr = this.EntityAttrList(curClass);
          let numTypeAttr = enTypeAttr.filter(item => {
            return (item.valueType == 'Long' || item.valueType == 'Integer' || item.valueType == 'Double')
          })

          let groupItem = {
            groupName: '实体类',
            groupType: '',
            attrList: enTypeAttr
          }
          let groupNumItem = {
            groupName: '实体类',
            groupType: '',
            attrList: numTypeAttr
          }
          this.groupAttrList.push(groupItem);
          this.groupNumberTypeList.push(groupNumItem);

          // 处理 数值 选择时只显示数字类型属性 考虑当前是纵向 还是横向展示数据
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

          let curXType = '';
          if(this.args.series.length > 0) {
            curXType = this.args.option.xAxis[0].type;
          } else {
            curXType = this.xType;
          }
          if(curXType == 'category') {
            // this.adjustXAttrList = this.groupAttrList;
            this.adjustXAttrList.push(sysAttr, selfAttr);
            this.adjustYAttrList = this.groupNumberTypeList;
          } else {
            this.adjustXAttrList = this.groupNumberTypeList;
            this.adjustYAttrList.push(sysAttr, selfAttr);
          }

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

          let groupReItem = {
            groupName: '关联类',
            groupType: 'relation_',
            attrList: reTypeAttr
          }
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
            groupName: '右实体类',
            groupType: 'right_',
            attrList: numRTypeAttr
          }
          this.groupAttrList.push(groupReItem, groupLItem, groupRItem);
          this.groupNumberTypeList.push(groupNumReItem, groupNumLItem, groupNumRItem);

          // 处理 数值 选择时只显示数字类型属性 考虑当前是纵向 还是横向展示数据
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

          let curXType = '';
          if(this.args.series.length > 0) {
            curXType = this.args.option.xAxis[0].type;
          } else {
            curXType = this.xType;
          }
          if(curXType == 'category') {
            this.adjustXAttrList.push(sysReAttr, selfReAttr, groupLItem, groupRItem);
            this.adjustYAttrList = this.groupNumberTypeList;
          } else {
            this.adjustXAttrList = this.groupNumberTypeList;
            this.adjustYAttrList.push(sysReAttr, selfReAttr, groupLItem, groupRItem);
          }

        }
        if(this.args.option.series.length > 0 && !this.firstLoad) {

          this.disposeChart();
          this.previewChart();

        } else {
          if(this.firstLoad) this.firstLoad = false;
        }

      } else {

        if(!this.firstLoad) {
          this.args.series = [];
        }
        if(this.args.option.series.length > 0 && !this.firstLoad) {

          this.disposeChart();
          this.previewChart();

        }  else {
          if(this.firstLoad) this.firstLoad = false;
        }

      }
    },
    arg_height(val) {
      this.resizeChart();
    },
    // async arg_query(val) {
    //   console.log(val)
    //   if(this.args.bindTargetClass != undfined && this.args.bindTargetClass != '' && val != '') {
    //     let curClass = this.args.bindTargetClass.split('&')[0];
    //     this.args.option.dataset.source = await this.getChartSource(
    //       curClass,
    //       val
    //     );
    //     console.log(this.args.option.dataset.source)
    //   }

    // },

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
      // return this.args.filterQuery == '' ? '' : parseEscapeString(this.args.filterQuery, {}, {}, {}, this.attributes, this.store);
      console.log(this.args.filterQuery);
      return this.args.filterQuery || '';
    },
    // arg_query() {
    //   return this.args.filterQuery;
    // },
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
        ? this.relation
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
    }
    // groupAttrList() {
    //   return this.attributes
    //     ? this.attributes.filter(x => this.dataTypes.indexOf(x.valueType) > -1)
    //     : [];
    // }
  },
  // 定义组件的函数接口

  methods: {
    ...mapActions("DWF_form", [
        "handleQueryData",
        "queryEntity",
        "queryRelation"
    ]),
    // editorInit() {
    //   require("brace/ext/language_tools"); //language extension prerequsite...
    //   require("brace/mode/html");
    //   require("brace/mode/javascript"); //language
    //   require("brace/mode/less");
    //   require("brace/theme/chrome");
    //   require("brace/snippets/javascript"); //snippet
    // },
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

      if(this.args.option.title.textStyle == undefined) {
        this.args.option.title['textStyle'] = {
          color: '#333',
          fontSize: 18
        }
      }
      if(this.args.option.legend.textStyle == undefined) {
        this.args.option.title['textStyle'] = {
          color: '#333',
          fontSize: 12
        }
      }

      if(this.args.series.length > 0) {

        if(this.args.option.xAxis[0].type == 'value') {

          this.args.option.yAxis[0].splitLine.show = false;
          if(this.args.option.xAxis[0].splitLine == undefined) {
            this.args.option.xAxis[0]['splitLine'] = {
              show: true,
              lineStyle: {
                color: '#ccc'
              }
            }
          }

        }

      }
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

    // 转换日期类型label
    changeDateType(type) {
      console.log(type)
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

          // for (let attr in objs[0]) {
          //   attrs.push(attr);
          // }
          // arr.push(attrs);
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

    // 系列Y轴位置
    changeYType(e) {

       if(e == 'right') {

        if(this.args.option.yAxis.length == 1) {
          if('position' in this.args.option.yAxis[0] && this.args.option.yAxis[0].position == 'right') {
            this.modalValue.yName = this.args.option.yAxis[0].name;
          } else {
            this.modalValue.yName = '';
          }
        } else {

          if('position' in this.args.option.yAxis[0] && this.args.option.yAxis[0].position == 'right') {

            this.modalValue.yName = this.args.option.yAxis[0].name;

            this.modalValue.yRightLabelColor = 'color' in this.args.option.yAxis[0].axisLabel ? this.args.option.yAxis[0].axisLabel.color : '#333';
            this.modalValue.yRightLabelSize = this.args.option.yAxis[0].axisLabel.fontSize || 12;
            this.modalValue.showRightSplitLine = this.args.option.yAxis[0].splitLine.show;
            this.modalValue.rightGridColor = 'lineStyle' in this.args.option.yAxis[0].splitLine ? this.args.option.yAxis[0].splitLine.lineStyle.color : '#ccc';

          } else {

            this.modalValue.yName = this.args.option.yAxis[1].name;

            this.modalValue.yRightLabelColor = 'color' in this.args.option.yAxis[1].axisLabel ? this.args.option.yAxis[1].axisLabel.color : '#333';
            this.modalValue.yRightLabelSize = this.args.option.yAxis[1].axisLabel.fontSize || 12;
            this.modalValue.showRightSplitLine = this.args.option.yAxis[1].splitLine.show;
            this.modalValue.rightGridColor = 'lineStyle' in this.args.option.yAxis[1].splitLine ? this.args.option.yAxis[1].splitLine.lineStyle.color : '#ccc';

          }

        }

      } else {

        if(this.args.option.yAxis.length == 1) {
          if(('position' in this.args.option.yAxis[0] && this.args.option.yAxis[0].position == 'left') || !'position' in this.args.option.yAxis[0]) {
            this.modalValue.yName = this.args.option.yAxis[0].name;
          } else {
            this.modalValue.yName = '';
          }
        } else {

          if('position' in this.args.option.yAxis[0] && this.args.option.yAxis[0].position == 'right') {

            this.modalValue.yName = this.args.option.yAxis[1].name;

            this.modalValue.yLeftLabelColor = this.args.option.yAxis[1].axisLabel.color || '#333';
            this.modalValue.yLeftLabelSize = this.args.option.yAxis[1].axisLabel.fontSize || 12;
            this.modalValue.showLeftSplitLine = this.args.option.yAxis[1].splitLine.show;
            this.modalValue.leftGridColor = 'lineStyle' in this.args.option.yAxis[1].splitLine ? this.args.option.yAxis[1].splitLine.lineStyle.color : '#ccc';

          } else {

            this.modalValue.yName = this.args.option.yAxis[0].name;

            this.modalValue.yLeftLabelColor = this.args.option.yAxis[0].axisLabel.color || '#333';
            this.modalValue.yLeftLabelSize = this.args.option.yAxis[0].axisLabel.fontSize || 12;
            this.modalValue.showLeftSplitLine = this.args.option.yAxis[0].splitLine.show;
            this.modalValue.leftGridColor = 'lineStyle' in this.args.option.yAxis[0].splitLine ? this.args.option.yAxis[0].splitLine.lineStyle.color : '#ccc';

          }

        }

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
          this.modalValue.xName = '';
        } else {
          this.isXPile = false;
          this.isPile = true;
          this.modalValue.y = [];
          this.modalValue.yName = '';
        }
      } else {
        if(this.seriesYType == 'category') {
          this.isPile = false;
          this.isXPile = false;
          this.modalValue.x = '';
          this.modalValue.xName = '';
        } else {
          this.isPile = false;
          this.isXPile = false;
          this.modalValue.y = '';
          this.modalValue.yName = '';
        }
      }
    },

    // 重置图表
    disposeChart() {

      this.args.series = [];
      this.args.option.series = [];
      this.args.option.xAxis = [];
      this.args.option.yAxis = [];

      if(this.xType == 'category') {

        this.args.option.xAxis.push({ type: "category", gridIndex: 0, name: '' });
        this.args.option.yAxis.push({ type: "value", gridIndex: 0, name: '', splitLine: {} });

      } else {

        this.args.option.xAxis.push({ type: "value", gridIndex: 0, name: '', splitLine: {} });
        this.args.option.yAxis.push({ type: "category", gridIndex: 0, name: ''});

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
      let _this = this
      this.args.option.legend.textStyle.color = this.args.selfLegendColor;
      // this.args.option.legend.textStyle.fontSize = this.args.selfLegendSize;
      this.args.option.series = [];

      if(this.args.series.length > 0) {
        this.args.option.series = this.args.option.series.concat(this.args.series[0]);
      }
      // for (let i = 0; i < this.args.series.length; i++) {
      //   this.args.option.series = this.args.option.series.concat(
      //     this.args.series[i]
      //   );
      // }
      console.log("series",this.args.option.series);

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
                let attrIndex = params.dimensionNames.findIndex(d => d == t);
                if(attrIndex != -1) {

                  let isDateItem = params.data[attrIndex];
                  let displayName = _this.matchTipName(t)
                  // let date;
                  // if (isDateItem.toString().length === 13 && (date = new Date(isDateItem)) !== undefined && date.getFullYear() > 1900 && date.getFullYear() < 2100) {
                  //   var y = date.getFullYear(),
                  //       m = date.getMonth() + 1,
                  //       d = date.getDate();
                  //   isDateItem = y + "-" + (m < 10 ? "0" + m : m) + "-" + (d < 10 ? "0" + d : d) + " " + date.toTimeString().substr(0, 8);
                  // }
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

      this.transLabel();
      // 提示框组件设置
      this.args.option.tooltip = Object.assign({},this.args.option.tooltip,{enterable: true, confine: true})
      console.log('optionnnn', this.args.option)
      // 添加系列，不选择任何属性，点击绘制出现了柱形图bug fix
      let setUpList = this.args.option.series.filter(item => item.name)
      if(!setUpList.length){
        this.args.option.dataset.source = []
      }
      this.createChartBar(this.args.option);
      this.previewChartMethod(this.mychart, this.args.option, this.msg);

    },

    /**
     * @description x轴label文字长度超过6 显示... 日期属性转换可读
    */
    transLabel() {

      if('axisLabel' in this.args.option.xAxis[0]) {

        if('rotate' in this.args.option.xAxis[0].axisLabel) {
          this.args.option.xAxis[0].axisLabel['interval'] = 0;
        }

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

    /**
     *@method 增加显示图表
     *@param {Object} option 设置项
     *@param {String} msg 错误信息提示
     */
    addPreviewChart(option) {
      console.log("optionnnnn", option);
      let len = option.xAxis.length;
      option.xAxis.push({ type: "category", gridIndex: len, name: '' });
      option.yAxis.push({ type: "value", gridIndex: len, name: '', splitLine: {} });
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
          type: 'bar',
          encode: { x: "", y: "", tooltip: [] },
          xAxisIndex: index,
          yAxisIndex: index
        });
        this.$set(series, index, series[index]); //增加vue监听改变
      }

    },

    //按钮触发 增加显示一个系列
    addChartSeries(index) {

      if(this.args.bindTargetClass == '' || this.args.bindTargetClass == undefined) {
        this.$Message.warning('请先选择目标类');
      } else {

        if(this.args.series.length == 0 || !this.args.series[0][this.args.series[0].length - 1]) {
          this.addChartSeriesObj(this.args.series, index);
        } else {

          if(!this.args.series[0][this.args.series[0].length - 1].name) {
            this.$Message.warning('请先完成当前系列定制');
          } else {
            this.addChartSeriesObj(this.args.series, index);
          }

        }

      }

    },

    //modal 弹窗
    ok() {

      if(!this.modalValue.x) {
        this.$Message.warning('请先选择X轴对应属性');
      } else if(!this.modalValue.y) {
        this.$Message.warning('请先选择Y轴对应属性');
      } else {

        this.$Message.info("设置保存");

        this.hasSeries = false;
        this.modal = false;

        this.modalValueToSeries();
        this.reloadY = false;
        this.reloadX = false;

      }
    },

    cancel() {

      this.reloadY = false;
      this.reload = false;

      this.modalValue.showXSplitLine = true;
      this.modalValue.XGridColor = '#ccc';
      this.modalValue.showLeftSplitLine = true;
      this.modalValue.leftGridColor = '#ccc';
      this.modalValue.showRightSplitLine = false;
      this.modalValue.rightGridColor = '#ccc';
      this.modalValue.xLabelColor = '#333';
      this.modalValue.xLabelRotate = 0;
      this.modalValue.xLabelSize = 12;
      this.modalValue.yLabelRotate = 0;
      this.modalValue.yLeftLabelColor = '#333';
      this.modalValue.yLeftLabelSize = 12;
      this.modalValue.yRightLabelColor = '#333';
      this.modalValue.yRightLabelSize = 12;

      this.modal = false;

    },

    modalShow(i, j) {
      console.log(i, j, this.args.series, this.args.option)
      this.reloadX = true;
      this.reloadY = true;
      this.isPile = false;
      // this.modalValue.y = '';


      this.seriesYType = this.args.option.yAxis[i].type;
      this.modal = true;
      // 刚刚新增加的系列 还未设置
      if(!this.args.series[i][j].name) {

        this.cantSwitch = false;
        this.editChange = false;
        this.yType = 'left';
        this.modalValue.i = i;
        this.modalValue.j = j;
        this.modalValue.type = "bar";
        this.isPile = false;
        this.isXPile = false;
        this.modalValue.tooltip = [];
        this.modalValue.selfSeriesName = '';
        if(this.args.series[0].length == 1) {

          this.modalValue.showXSplitLine = true;
          this.modalValue.XGridColor = '#ccc';
          this.modalValue.showLeftSplitLine = true;
          this.modalValue.leftGridColor = '#ccc';
          this.modalValue.showRightSplitLine = false;
          this.modalValue.rightGridColor = '#ccc';
          this.modalValue.xLabelColor = '#333';
          this.modalValue.xLabelRotate = 0;
          this.modalValue.xLabelSize = 12;
          this.modalValue.yLabelRotate = 0;
          this.modalValue.yLeftLabelColor = '#333';
          this.modalValue.yLeftLabelSize = 12;
          this.modalValue.yRightLabelColor = '#333';
          this.modalValue.yRightLabelSize = 12;

          // 需考虑当前X轴是 category \ value
          // if(this.args.option.xAxis[i].type == 'category') {
            this.modalValue.yName = "";
            this.modalValue.x = '';
          // } else {
            this.modalValue.xName = "";
            this.modalValue.y = '';
          // }

        } else {

          if(this.args.option.xAxis[i].type == 'category') {
            this.modalValue.x = this.args.series[0][0].encode.x;
          } else {
            this.modalValue.y = this.args.series[0][0].encode.y;
          }

          // 轴标签颜色文字
          this.modalValue.xLabelRotate = this.args.option.xAxis[0].axisLabel.rotate || 0;
          this.modalValue.xLabelColor = 'color' in this.args.option.xAxis[0].axisLine.lineStyle ? this.args.option.xAxis[0].axisLine.lineStyle.color : '#333';
          this.modalValue.xLabelSize = this.args.option.xAxis[0].axisLabel.fontSize || 12;
          this.modalValue.xName = this.args.option.xAxis[0].name;

          if('position' in this.args.option.yAxis[0] && this.args.option.yAxis[0].position == 'right') {

            if(this.args.option.yAxis.length == 1) {
              this.modalValue.yName = '';
            } else {

              this.modalValue.yName = this.args.option.yAxis[1].name;
              this.modalValue.yLeftLabelColor = this.args.option.yAxis[1].axisLabel.color || '#333';
              this.modalValue.yLeftLabelSize = this.args.option.yAxis[1].axisLabel.fontSize || 12;
              this.modalValue.showLeftSplitLine = this.args.option.yAxis[1].splitLine.show;
              this.modalValue.leftGridColor = 'lineStyle' in this.args.option.yAxis[1].splitLine ? this.args.option.yAxis[1].splitLine.lineStyle.color : '#ccc';

            }

          } else {

            this.modalValue.yName = this.args.option.yAxis[0].name;

            this.modalValue.yLeftLabelColor = 'color' in this.args.option.yAxis[0].axisLabel ? this.args.option.yAxis[0].axisLabel.color : '#333';
            this.modalValue.yLeftLabelSize = this.args.option.yAxis[0].axisLabel.fontSize || 12;
            this.modalValue.showLeftSplitLine = this.args.option.yAxis[0].splitLine.show;
            this.modalValue.leftGridColor = 'lineStyle' in this.args.option.yAxis[0].splitLine ? this.args.option.yAxis[0].splitLine.lineStyle.color : '#ccc';

          }

        }

        // 需考虑当前X轴是 category \ value
        if(this.args.option.xAxis[i].type == 'category') {

          this.modalValue.y = "";
          this.yIsCategory = true;

        } else {
          this.modalValue.x = "";
          this.yIsCategory = false;

          this.modalValue.showXSplitLine = this.args.option.xAxis[0].splitLine.show || true;
          this.modalValue.XGridColor = 'lineStyle' in this.args.option.xAxis[0].splitLine ? this.args.option.xAxis[0].splitLine.lineStyle.color : '#ccc';
          // this.modalValue.XGridColor = 'lineStyle' in this.args.option.yAxis[1].splitLine ? this.args.option.yAxis[1].splitLine.lineStyle.color : '#ccc';
          // this.modalValue.XGridColor = '#ccc';


        }

      } else {                  // 已有设置 回填数据

        // 已有数据的编辑状态 editChange = true 防止Function@changeToPileBar 将回填数据置空
        this.editChange = true;

        this.yType = this.args.series[i][j].yPosition;
        this.modalValue.i = i;
        this.modalValue.j = j;
        this.modalValue.type = this.args.series[i][j].type;
        this.modalValue.selfSeriesName = this.args.series[i][j].selfLegendName;

        this.cantSwitch = true;

        // 判断当前X轴是否为category 并且是否为堆叠数据 两种情况 (横向数据 & 纵向数据)
        // if(this.seriesYType == 'category' && (this.modalValue.type == 'crossPile' || this.modalValue.type == 'verticalStack')) {

        //   this.isXPile = false;

        // } else {

        //   this.isPile = false;

        // }
        // 轴标签颜色文字
        this.modalValue.xLabelRotate = this.args.option.xAxis[0].axisLabel.rotate || 0;
        this.modalValue.xLabelColor = 'lineStyle' in this.args.option.xAxis[0].axisLine ? this.args.option.xAxis[0].axisLine.lineStyle.color : '#333';
        this.modalValue.xLabelSize = this.args.option.xAxis[0].axisLabel.fontSize || 12;
        
        this.modalValue.xName = this.args.option.xAxis[0].name;
        if(this.seriesYType == 'category') {

          this.yIsCategory = false;
          // this.adjustXAttrList = this.groupNumberTypeList;
          // this.adjustYAttrList = this.groupAttrList;

          this.isXPile = false;
          this.modalValue.y = this.args.series[i][j].encode.y;
          this.modalValue.yName = this.args.option.yAxis[0].name;
          this.modalValue.x = this.args.series[i][j].selfEname;
          this.modalValue.showXSplitLine = this.args.option.xAxis[0].splitLine.show;
          this.modalValue.XGridColor = 'lineStyle' in this.args.option.xAxis[0].splitLine ? this.args.option.xAxis[0].splitLine.lineStyle.color : '#ccc';
          this.modalValue.yLabelRotate = this.args.option.yAxis[0].axisLabel.rotate || 0;
          this.modalValue.yLeftLabelColor = this.args.option.yAxis[0].axisLabel.color || '#333';
          this.modalValue.yLeftLabelSize = this.args.option.yAxis[0].axisLabel.fontSize || 12;
          // this.args.option.yAxis[0].splitLine.show = false;
          // this.modalValue.showLeftSplitLine = this.args.option.yAxis[0].splitLine.show || true;
          // this.modalValue.leftGridColor = 'lineStyle' in this.args.option.yAxis[0].splitLine ? this.args.option.yAxis[0].splitLine.lineStyle.color : '#ccc';

        } else {

          this.yIsCategory = true;
          this.modalValue.x = this.args.series[i][j].encode.x;
          // this.adjustXAttrList = this.groupAttrList;
          // this.adjustYAttrList = this.groupNumberTypeList;

          this.isPile = false;
          this.modalValue.y = this.args.series[i][j].selfEname;
          if(this.args.option.yAxis.length == 1) {

            this.modalValue.yName = this.args.option.yAxis[0].name;
            if(this.yType == 'right') {

              this.modalValue.yRightLabelColor = 'color' in this.args.option.yAxis[0].axisLabel ? this.args.option.yAxis[0].axisLabel.color : '#333';
              this.modalValue.yRightLabelSize = this.args.option.yAxis[0].axisLabel.fontSize || 12;
              this.modalValue.showRightSplitLine = this.args.option.yAxis[0].splitLine.show;
              this.modalValue.rightGridColor = 'lineStyle' in this.args.option.yAxis[0].splitLine ? this.args.option.yAxis[0].splitLine.lineStyle.color : '#ccc';

            } else {

              this.modalValue.yLeftLabelColor = this.args.option.yAxis[0].axisLabel.color || '#333';
              this.modalValue.yLeftLabelSize = this.args.option.yAxis[0].axisLabel.fontSize || 12;
              this.modalValue.showLeftSplitLine = this.args.option.yAxis[0].splitLine.show;
              this.modalValue.leftGridColor = 'lineStyle' in this.args.option.yAxis[0].splitLine ? this.args.option.yAxis[0].splitLine.lineStyle.color : '#ccc';

            }

          } else {

            if(this.yType == 'right') {
              if('position' in this.args.option.yAxis[0] && this.args.option.yAxis[0].position == 'right') {

                this.modalValue.yName = this.args.option.yAxis[0].name;

                this.modalValue.yRightLabelColor = 'color' in this.args.option.yAxis[0].axisLabel ? this.args.option.yAxis[0].axisLabel.color : '#333';
                this.modalValue.yRightLabelSize = this.args.option.yAxis[0].axisLabel.fontSize || 12;
                this.modalValue.showRightSplitLine = this.args.option.yAxis[0].splitLine.show;
                this.modalValue.rightGridColor = 'lineStyle' in this.args.option.yAxis[0].splitLine ? this.args.option.yAxis[0].splitLine.lineStyle.color : '#ccc';

              } else {

                this.modalValue.yName = this.args.option.yAxis[1].name;

                this.modalValue.yRightLabelColor = 'color' in this.args.option.yAxis[1].axisLabel ? this.args.option.yAxis[1].axisLabel.color : '#333';
                this.modalValue.yRightLabelSize = this.args.option.yAxis[1].axisLabel.fontSize || 12;
                this.modalValue.showRightSplitLine = this.args.option.yAxis[1].splitLine.show;
                this.modalValue.rightGridColor = 'lineStyle' in this.args.option.yAxis[1].splitLine ? this.args.option.yAxis[1].splitLine.lineStyle.color : '#ccc';

              }
            } else {

              if('position' in this.args.option.yAxis[0] && this.args.option.yAxis[0].position == 'right') {

                this.modalValue.yName = this.args.option.yAxis[1].name;

                this.modalValue.yLeftLabelColor = this.args.option.yAxis[1].axisLabel.color || '#333';
                this.modalValue.yLeftLabelSize = this.args.option.yAxis[1].axisLabel.fontSize || 12;
                this.modalValue.showLeftSplitLine = this.args.option.yAxis[1].splitLine.show;
                this.modalValue.leftGridColor = 'lineStyle' in this.args.option.yAxis[1].splitLine ? this.args.option.yAxis[1].splitLine.lineStyle.color : '#ccc';

              } else {

                this.modalValue.yName = this.args.option.yAxis[0].name;

                this.modalValue.yLeftLabelColor = this.args.option.yAxis[0].axisLabel.color || '#333';
                this.modalValue.yLeftLabelSize = this.args.option.yAxis[0].axisLabel.fontSize || 12;
                this.modalValue.showLeftSplitLine = this.args.option.yAxis[0].splitLine.show;
                this.modalValue.leftGridColor = 'lineStyle' in this.args.option.yAxis[0].splitLine ? this.args.option.yAxis[0].splitLine.lineStyle.color : '#ccc';

              }

            }

          }

        }
        this.modalValue.tooltip = this.args.series[i][j].encode.tooltip;

      }
      console.log("i", i, "j", j, this.args.series[i][j], this.args.series[i][j].name);
    },

    matchTipName(e) {
      let targetName = '';
      if(this.args.bindTargetClass.split('&')[1] == 'e') {
        targetName = this.groupAttrList[0].attrList.filter(val => val.attributeName == e)[0].displayName;
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

    fitXSerise(value) {

      if(value) {
        if(this.seriesYType == 'category') {
          this.modalValue.selfSeriesName = this.matchTipName(value);
        }
      }

    },

    fitYSerise(value) {

      if(value) {
        if(this.seriesYType != 'category') {
          if(typeof value == 'string') {
            this.modalValue.selfSeriesName = this.matchTipName(value);
          } else {
            this.modalValue.selfSeriesName = '';
          }

        }
      }

    },

    //弹窗设置的值 赋给对应的series
    modalValueToSeries() {
      // 单位设置
      this.args.option.xAxis[0]['name'] = this.modalValue.xName;
      // x轴以及x轴文字颜色
      this.args.option.xAxis[0].axisLine = {
        lineStyle: {
            color: this.modalValue.xLabelColor || '#333'
        }
      }

      this.args.option.xAxis[0].axisLabel = {
        rotate: this.modalValue.xLabelRotate || 0,
        color: this.modalValue.xLabelColor || '#333',
        fontSize: this.modalValue.xLabelSize || 12
      }

      // 横向展示数据
      if(this.seriesYType == 'category') {

        // this.args.option.yAxis[0].splitLine.show = false;
        // 横向展示时 x轴网格样式设置
        this.args.option.xAxis[0]['splitLine'] = {
          show: this.modalValue.showXSplitLine,
          lineStyle: {
            color: this.modalValue.XGridColor || '#333'
          }
        }

        // 是否需要堆叠 横向 & 纵向
        if(this.modalValue.type == "crossPile" || this.modalValue.type == "verticalStack") {
          this.args.series[0].splice(this.modalValue.j, 1);
          // 横向堆叠
          if(this.modalValue.type == "crossPile") {
            this.modalValue.x.forEach((item, index) => {
              // let tipName = this.groupAttrList.filter(val => val.attributeName == item)[0].displayName;
              let tipName = this.matchTipName(item);
              let eachSeries = {
                name: tipName,
                type: 'bar',
                encode: {
                  x: item,
                  y: this.modalValue.y,
                  tooltip: this.modalValue.tooltip
                },
                selfEname: item,
                selfLegendName: tipName,
                yPosition: this.yType
              }
              this.args.series[0].push(eachSeries);
              this.args.option.legend.data.push(tipName);
            })
          } else {                    // 纵向堆叠
            this.modalValue.x.forEach((item, index) => {
              // let tipName = this.groupAttrList.filter(val => val.attributeName == item)[0].displayName;
              let tipName = this.matchTipName(item);
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
                selfLegendName: tipName,
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

          // let tipName = this.groupAttrList.filter(item => item.attributeName == this.modalValue.x)[0].displayName;
          let tipName = this.matchTipName(this.modalValue.x);
          this.args.series[this.modalValue.i][this.modalValue.j].name = this.modalValue.selfSeriesName || tipName;
          // this.args.series[this.modalValue.i][this.modalValue.j].name = this.modalValue.x;
          this.args.series[this.modalValue.i][this.modalValue.j].type = this.modalValue.type;
          this.args.series[this.modalValue.i][this.modalValue.j].encode = o;
          this.args.series[this.modalValue.i][this.modalValue.j].selfEname = this.modalValue.x;
          this.args.series[this.modalValue.i][this.modalValue.j].selfLegendName = this.modalValue.selfSeriesName;
          this.args.series[this.modalValue.i][this.modalValue.j].yPosition = this.yType;
          this.args.option.legend.data.push(this.modalValue.selfSeriesName || tipName);
        }

      } else {
        // 是否需要堆叠 横向 & 纵向
        if(this.modalValue.type == "crossPile" || this.modalValue.type == "verticalStack") {
          this.args.series[0].splice(this.modalValue.j, 1);
          // 横向堆叠
          if(this.modalValue.type == "crossPile") {
            this.modalValue.y.forEach((item, index) => {
              // let tipName = this.groupAttrList.filter(val => val.attributeName == item)[0].displayName;
              let tipName = this.matchTipName(item);
              let eachSeries = {
                name: tipName,
                type: 'bar',
                encode: {
                  x: this.modalValue.x,
                  y: item,
                  tooltip: this.modalValue.tooltip
                },
                selfEname: item,
                selfLegendName: tipName,
                yPosition: this.yType
              }
              this.args.series[0].push(eachSeries);
              this.args.option.legend.data.push(tipName);
            })
          } else {                    // 纵向堆叠

            this.modalValue.y.forEach((item, index) => {
              // let tipName = this.groupAttrList.filter(val => val.attributeName == item)[0].displayName;
              let tipName = this.matchTipName(item);
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
                selfLegendName: tipName,
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

          let tipName = '';
          if(this.modalValue.y != undefined) {
            // tipName = this.groupAttrList.filter(item => item.attributeName == this.modalValue.y)[0].displayName;
            tipName = this.matchTipName(this.modalValue.y);
          }

          this.args.series[this.modalValue.i][this.modalValue.j].name = this.modalValue.selfSeriesName || tipName;
          this.args.series[this.modalValue.i][this.modalValue.j].type = this.modalValue.type;
          this.args.series[this.modalValue.i][this.modalValue.j].encode = o;
          this.args.series[this.modalValue.i][this.modalValue.j].selfEname = this.modalValue.y;
          this.args.series[this.modalValue.i][this.modalValue.j].selfLegendName = this.modalValue.selfSeriesName;
          this.args.series[this.modalValue.i][this.modalValue.j].yPosition = this.yType;
          this.args.option.legend.data.push(this.modalValue.selfSeriesName || tipName);

          console.log('设置系列啦啦啦啦啦', this.args.series, this.args.option);
        }

        // Label文本超过五个字显示为... 鼠标移入有tips全部提示
        this.transLabel();

      }

      // 当选择右Y时 才追加yAxisIndex属性
      if(this.yType == 'right') {

        // 如果当前系列是左轴调整为右y轴 需判断是否还有其他系列使用左轴 没有的话并且当前右y轴index为1需将右y轴的yAxisIndex调整为0
        let editSameYCount = 0;
        this.args.series[0].forEach(s => {

          if(s.yPosition === 'left') {
            editSameYCount++;
          }

        })

        if(this.modalValue.j == 0) {

          if(this.args.option.yAxis.length == 1) {

            if(!'position' in this.args.option.yAxis[0]) {

              if(editSameYCount == 0) {
                this.args.option.yAxis.splice(0, 1);
              }

              const yObj = {
                type: 'value',
                position: 'right',
                splitLine: {}
              }
              this.args.option.yAxis.push(yObj);

              let actYInx = this.args.option.yAxis.length - 1;
              this.args.series[this.modalValue.i][this.modalValue.j].yAxisIndex = actYInx;
              // if(this.seriesYType == 'category') {
              //   this.args.option.yAxis[actYInx]['name'] = this.modalValue.xName;
              // } else {
              this.args.option.yAxis[actYInx]['name'] = this.modalValue.yName;
              // }


            } else {

              if(this.args.option.yAxis[0].position == 'right') {

                this.args.series[this.modalValue.i][this.modalValue.j].yAxisIndex = 0;
                // if(this.seriesYType == 'category') {
                //   this.args.option.yAxis[0]['name'] = this.modalValue.xName;
                // } else {
                this.args.option.yAxis[0]['name'] = this.modalValue.yName;
                // }

              } else {

                if(editSameYCount == 0) {
                  this.args.option.yAxis.splice(0, 1);
                }

                const yObj = {
                  type: 'value',
                  position: 'right',
                  splitLine: {}
                }
                this.args.option.yAxis.push(yObj);

                let actYInx = this.args.option.yAxis.length - 1;
                this.args.series[this.modalValue.i][this.modalValue.j].yAxisIndex = actYInx;
                // if(this.seriesYType == 'category') {
                //   this.args.option.yAxis[actYInx]['name'] = this.modalValue.xName;
                // } else {
                this.args.option.yAxis[actYInx]['name'] = this.modalValue.yName;
                // }

              }

            }

          } else {

            if('position' in this.args.option.yAxis[0]) {

              if(this.args.option.yAxis[0].position == 'right') {

                this.args.series[this.modalValue.i][this.modalValue.j].yAxisIndex = 0;
                // if(this.seriesYType == 'category') {
                //   this.args.option.yAxis[0]['name'] = this.modalValue.xName;
                // } else {
                this.args.option.yAxis[0]['name'] = this.modalValue.yName;
                // }

                if(editSameYCount == 0) {
                  this.args.option.yAxis.splice(1, 1);
                }

              } else {

                if(editSameYCount == 0) {

                  this.args.option.yAxis.splice(0, 1);
                  this.args.series[this.modalValue.i][this.modalValue.j].yAxisIndex = 0;
                  // if(this.seriesYType == 'category') {
                  //   this.args.option.yAxis[0]['name'] = this.modalValue.xName;
                  // } else {
                  this.args.option.yAxis[0]['name'] = this.modalValue.yName;
                  // }

                  // 删除其中一个Y轴后需要更新每项series 的 yAxisIndex为0
                  this.args.option.series.forEach(ser => {
                    ser.yAxisIndex = 0;
                  })

                } else {

                  this.args.series[this.modalValue.i][this.modalValue.j].yAxisIndex = 1;
                  // if(this.seriesYType == 'category') {
                  //   this.args.option.yAxis[1]['name'] = this.modalValue.xName;
                  // } else {
                  this.args.option.yAxis[1]['name'] = this.modalValue.yName;
                  // }

                }

              }

            } else {

              if(editSameYCount == 0) {

                this.args.option.yAxis.splice(0, 1);
                this.args.series[this.modalValue.i][this.modalValue.j].yAxisIndex = 0;
                // if(this.seriesYType == 'category') {
                //   this.args.option.yAxis[0]['name'] = this.modalValue.xName;
                // } else {
                this.args.option.yAxis[0]['name'] = this.modalValue.yName;
                // }

                // 删除其中一个Y轴后需要更新每项series 的 yAxisIndex为0
                this.args.option.series.forEach(ser => {
                  ser.yAxisIndex = 0;
                })

              } else {

                this.args.series[this.modalValue.i][this.modalValue.j].yAxisIndex = 1;
                // if(this.seriesYType == 'category') {
                //   this.args.option.yAxis[1]['name'] = this.modalValue.xName;
                // } else {
                this.args.option.yAxis[1]['name'] = this.modalValue.yName;
                // }

              }

            }
          }

        } else {

          if(this.args.option.yAxis.length == 1) {

            if('position' in this.args.option.yAxis[0]) {

              if(this.args.option.yAxis[0].position == 'right') {

                this.args.series[this.modalValue.i][this.modalValue.j].yAxisIndex = 0;

                // if(this.seriesYType == 'category') {
                //   this.args.option.yAxis[0]['name'] = this.modalValue.xName;
                // } else {
                this.args.option.yAxis[0]['name'] = this.modalValue.yName;
                // }

              } else {

                if(editSameYCount == 0) {
                  this.args.option.yAxis.splice(0, 1);
                }

                const yObj = {
                  type: 'value',
                  position: 'right',
                  splitLine: {}
                }
                this.args.option.yAxis.push(yObj);

                let actYInx = this.args.option.yAxis.length - 1;
                this.args.series[this.modalValue.i][this.modalValue.j].yAxisIndex = actYInx;
                // if(this.seriesYType == 'category') {
                //   this.args.option.yAxis[actYInx]['name'] = this.modalValue.xName;
                // } else {
                this.args.option.yAxis[actYInx]['name'] = this.modalValue.yName;
                // }

              }

            } else {

              if(editSameYCount == 0) {
                this.args.option.yAxis.splice(0, 1);
              }

              const yObj = {
                type: 'value',
                position: 'right',
                splitLine: {}
              }
              this.args.option.yAxis.push(yObj);

              let actYInx = this.args.option.yAxis.length - 1;
              this.args.series[this.modalValue.i][this.modalValue.j].yAxisIndex = actYInx;
              // if(this.seriesYType == 'category') {
              //   this.args.option.yAxis[actYInx]['name'] = this.modalValue.xName;
              // } else {
              this.args.option.yAxis[actYInx]['name'] = this.modalValue.yName;
              // }

            }

          } else {

            if('position' in this.args.option.yAxis[0]) {

              if(this.args.option.yAxis[0].position == 'right') {

                this.args.series[this.modalValue.i][this.modalValue.j].yAxisIndex = 0;
                // if(this.seriesYType == 'category') {
                //   this.args.option.yAxis[0]['name'] = this.modalValue.xName;
                // } else {
                this.args.option.yAxis[0]['name'] = this.modalValue.yName;
                // }

                if(editSameYCount == 0) {
                  this.args.option.yAxis.splice(1, 1);
                }

              } else {

                if(editSameYCount == 0) {

                  this.args.option.yAxis.splice(0, 1);
                  this.args.series[this.modalValue.i][this.modalValue.j].yAxisIndex = 0;

                  // 删除其中一个Y轴后需要更新每项series 的 yAxisIndex为0
                  this.args.option.series.forEach(ser => {
                    ser.yAxisIndex = 0;
                  })

                } else {

                  this.args.series[this.modalValue.i][this.modalValue.j].yAxisIndex = 1;
                  // if(this.seriesYType == 'category') {
                  //   this.args.option.yAxis[1]['name'] = this.modalValue.xName;
                  // } else {
                  this.args.option.yAxis[1]['name'] = this.modalValue.yName;
                  // }

                }

              }

            } else {

              if(editSameYCount == 0) {

                this.args.option.yAxis.splice(0, 1);
                this.args.series[this.modalValue.i][this.modalValue.j].yAxisIndex = 0;

                // 删除其中一个Y轴后需要更新每项series 的 yAxisIndex为0
                this.args.option.series.forEach(ser => {
                  ser.yAxisIndex = 0;
                })

              } else {

                this.args.series[this.modalValue.i][this.modalValue.j].yAxisIndex = 1;
                // if(this.seriesYType == 'category') {
                //   this.args.option.yAxis[1]['name'] = this.modalValue.xName;
                // } else {
                this.args.option.yAxis[1]['name'] = this.modalValue.yName;
                // }

              }

            }

          }

        }

        // 网格
        if(this.modalValue.showRightSplitLine && this.modalValue.type != 'crossPile' && this.modalValue.type != 'verticalStack') {

          if('position' in this.args.option.yAxis[0]) {
            if(this.args.option.yAxis[0].position == 'right') {
              this.args.option.yAxis[0].splitLine = {
                show: true,
                lineStyle: {
                    color: this.modalValue.rightGridColor
                }
              }
            }
          } else {

            if(this.args.option.yAxis.length > 1) {

              this.args.option.yAxis[1].splitLine = {
                show: true,
                lineStyle: {
                    color: this.modalValue.rightGridColor
                }
              }

            }

          }

        } else {

          if('position' in this.args.option.yAxis[0]) {
            if(this.args.option.yAxis[0].position == 'right') {
              this.args.option.yAxis[0].splitLine = {
                show: false
              }
            }
          } else {

            if(this.args.option.yAxis.length > 1) {
              this.args.option.yAxis[1].splitLine = {
                show: false
              }
            }

          }

        }

        // Y轴颜色 字体大小
        if('position' in this.args.option.yAxis[0]) {
          if(this.args.option.yAxis[0].position == 'right') {

            this.args.option.yAxis[0].axisLine = {
                lineStyle: {
                    color: this.modalValue.yRightLabelColor || '#333'
                }
            }
            this.args.option.yAxis[0].axisLabel = {
              color: this.modalValue.yRightLabelColor || '#333',
              fontSize: this.modalValue.yRightLabelSize || 12
            }

          } else {

            if(this.args.option.yAxis.length > 1) {

               this.args.option.yAxis[1].axisLine = {
                  lineStyle: {
                      color: this.modalValue.yRightLabelColor || '#333'
                  }
              }
              this.args.option.yAxis[1].axisLabel = {
                color: this.modalValue.yRightLabelColor || '#333',
                fontSize: this.modalValue.yRightLabelSize || 12
              }

            }

          }

        } else {

          if(this.args.option.yAxis.length > 1) {

            this.args.option.yAxis[1].axisLine = {
                lineStyle: {
                    color: this.modalValue.yRightLabelColor || '#333'
                }
            }
            this.args.option.yAxis[1].axisLabel = {
              color: this.modalValue.yRightLabelColor || '#333',
              fontSize: this.modalValue.yRightLabelSize || 12
            }

          }

        }

       } else {

        // 如果当前系列是右y轴调整为左y轴 需判断是否还有其他系列使用右轴 没有的话并且当前左y轴index为1需将左y轴的yAxisIndex调整为0
        let editSameRYCount = 0;
        this.args.series[0].forEach(s => {

          if(s.yPosition === 'right') {
            editSameRYCount++;
          }

        })

        if(this.args.option.yAxis.length == 1) {

          if('position' in this.args.option.yAxis[0] && this.args.option.yAxis[0].position == 'right') {

            if(editSameRYCount == 0) {
              this.args.option.yAxis.splice(0, 1);
            }

            const yObj = {
              type: 'value',
              position: 'left',
              splitLine: {}
            }
            this.args.option.yAxis.push(yObj);
            let actYInx = this.args.option.yAxis.length - 1;
            this.args.series[this.modalValue.i][this.modalValue.j].yAxisIndex = actYInx;

            // if(this.seriesYType == 'category') {
            //   this.args.option.yAxis[actYInx]['name'] = this.modalValue.xName;
            // } else {
            this.args.option.yAxis[actYInx]['name'] = this.modalValue.yName;
            // }

          } else {

            this.args.series[this.modalValue.i][this.modalValue.j].yAxisIndex = 0;
            // if(this.seriesYType == 'category') {
            //   this.args.option.yAxis[0]['name'] = this.modalValue.xName;
            // } else {
            this.args.option.yAxis[0]['name'] = this.modalValue.yName;
            // }

          }

        } else {

          if('position' in this.args.option.yAxis[0]) {

            if(this.args.option.yAxis[0].position == 'left') {

              this.args.series[this.modalValue.i][this.modalValue.j].yAxisIndex = 0;
              // if(this.seriesYType == 'category') {
              //   this.args.option.yAxis[0]['name'] = this.modalValue.xName;
              // } else {
              this.args.option.yAxis[0]['name'] = this.modalValue.yName;
              // }

              if(editSameRYCount == 0) {
                this.args.option.yAxis.splice(1, 1);
              }

            } else {

              if(editSameRYCount == 0) {

                this.args.option.yAxis.splice(0, 1);
                this.args.series[this.modalValue.i][this.modalValue.j].yAxisIndex = 0;

                // 删除其中一个Y轴后需要更新每项series 的 yAxisIndex为0
                this.args.option.series.forEach(ser => {
                  ser.yAxisIndex = 0;
                })

              } else {

                this.args.series[this.modalValue.i][this.modalValue.j].yAxisIndex = 1;
                // if(this.seriesYType == 'category') {
                //   this.args.option.yAxis[1]['name'] = this.modalValue.xName;
                // } else {
                this.args.option.yAxis[1]['name'] = this.modalValue.yName;
                // }

              }

            }
          } else {

            this.args.series[this.modalValue.i][this.modalValue.j].yAxisIndex = 0;
            // if(this.seriesYType == 'category') {
            //   this.args.option.yAxis[0]['name'] = this.modalValue.xName;
            // } else {
            this.args.option.yAxis[0]['name'] = this.modalValue.yName;
            // }

            if(editSameRYCount == 0) {
              this.args.option.yAxis.splice(1, 1);
            }

          }

        }

        // 网格
        if(this.modalValue.showLeftSplitLine) {

          if(this.modalValue.type == 'crossPile' || this.modalValue.type == 'verticalStack') {
            this.args.option.yAxis[0].splitLine = {
              show: true,
              lineStyle: {
                  color: this.modalValue.leftGridColor
              }
            }
          } else {

            if('position' in this.args.option.yAxis[0]) {
              if(this.args.option.yAxis[0].position == 'right') {
                this.args.option.yAxis[1].splitLine = {
                  show: true,
                  lineStyle: {
                      color: this.modalValue.leftGridColor
                  }
                }
              }
            } else {
              this.args.option.yAxis[0].splitLine = {
                show: true,
                lineStyle: {
                    color: this.modalValue.leftGridColor
                }
              }
            }

          }

        } else {

          if('position' in this.args.option.yAxis[0]) {
            if(this.args.option.yAxis[0].position == 'right') {
              this.args.option.yAxis[1].splitLine = {
                show: false
              }
            }
          } else {
            this.args.option.yAxis[0].splitLine = {
              show: false
            }
          }

        }

        // Y轴颜色 字体大小
        if('position' in this.args.option.yAxis[0]) {
          if(this.args.option.yAxis[0].position == 'right') {

            this.args.option.yAxis[1].axisLine = {
                lineStyle: {
                    color: this.modalValue.yLeftLabelColor || '#333'
                }
            }
            this.args.option.yAxis[1].axisLabel = {
              color: this.modalValue.yLeftLabelColor || '#333',
              fontSize: this.modalValue.yLeftLabelSize || 12,
              rotate: this.modalValue.yLabelRotate || 0
            }

          }
        } else {

          this.args.option.yAxis[0].axisLine = {
              lineStyle: {
                  color: this.modalValue.yLeftLabelColor || '#333'
              }
          }
          this.args.option.yAxis[0].axisLabel = {
            color: this.modalValue.yLeftLabelColor || '#333',
            fontSize: this.modalValue.yLeftLabelSize || 12,
            rotate: this.modalValue.yLabelRotate || 0
          }

        }

      }

      // if(this.seriesYType == 'category') {
      //   this.args.option.yAxis[0].splitLine.show = false;
      // }

      // 直接画图
      this.freshData(this.parsedStr);
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

      // 删除还没设定数据的系列
      if(!this.args.series[0][this.delSeriesIndex].name) {
        this.args.series[0].splice(this.delSeriesIndex, 1);
      } else {

        let delLegendName = this.args.series[0][this.delSeriesIndex].name;

        let delSeriesY = this.args.series[0][this.delSeriesIndex].yPosition;

        let delYCount = 0;
        this.args.series[0].forEach(s => {

          if(s.yPosition === delSeriesY) {
            delYCount++;
          }

        })

        // 删除系列需要判断删除仅有一个系列依赖的Y轴
        if(delYCount == 1) {

          if(this.args.option.yAxis.length == 1) {
            this.args.option.yAxis = [];
          } else {

            if(delSeriesY == 'right') {

              if('position' in this.args.option.yAxis[0]) {

                if(this.args.option.yAxis[0].position == 'right') {
                  this.args.option.yAxis.splice(0,1);
                } else {
                  this.args.option.yAxis.splice(1,1);
                }

              } else {
                this.args.option.yAxis.splice(1,1);
              }

            } else {

              if('position' in this.args.option.yAxis[0]) {

                if(this.args.option.yAxis[0].position == 'left') {
                  this.args.option.yAxis.splice(0,1);
                } else {
                  this.args.option.yAxis.splice(1,1);
                }

              } else {
                this.args.option.yAxis.splice(0,1);
              }

            }

            // 删除其中一个Y轴后需要更新每项series 的 yAxisIndex为0
            this.args.option.series.forEach(ser => {
              ser.yAxisIndex = 0;
            })

          }

        }
        let delLegendIndex = this.args.option.legend.data.findIndex(l => {
          return l == delLegendName
        })

        if(delLegendIndex != -1) {
          this.args.option.legend.data.splice(delLegendIndex, 1);
        }
        this.args.series[0].splice(this.delSeriesIndex, 1);
        this.args.option.series.splice(this.delSeriesIndex, 1);

        if(this.args.option.series.length == 0) {
          this.args.series = [];
          this.args.option.dataZoom = [];
          this.disposeChart();
        }
        // if(this.args.option.series.length == 0) {
        //   this.disposeChart();
        // }
        this.previewChart();

      }

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
    // exportData() {
    //   if(this.args.exportColumns.length == 0) {
    //     this.$Message.error('您还为选择任何需要导出的属性')
    //   } else {
    //     this.$refs.exportTable.exportCsv({
    //       filename: `实体类 ${this.args.bindTargetClass.split('&')[0]}的数据`
    //     });
    //   }
    // },

    // 避免X Y轴选择相同的类型
    // avoidSameY(e, index) {
    //   if(e == 'value') {
    //     this.xType = this.args.option.xAxis[index].type = 'category';
    //   } else {
    //     this.xType = this.args.option.xAxis[index].type = 'value';
    //   }
    // },

    avoidSameX(e, index) {
      this.xType = e;

      if(e == 'value') {

        this.args.option.xAxis[0].type = 'value';
        this.args.option.yAxis[index].type = 'category';

      } else {

        this.args.option.xAxis[0].type = 'category';
        this.args.option.yAxis[index].type = 'value';

      }

      if(this.groupAttrList.length > 0) {

        let isRe = '';
        if(this.args.bindTargetClass) {
          isRe = this.args.bindTargetClass.split('&')[1] == 'e' ? '' : 'relation_';
        }
        let sysAttr = {
          groupName: '系统属性',
          groupType: isRe,
          attrList: this.groupAttrList[0].attrList.filter(item => SYS_ENTITY_ATTRIBUTES(item) !== -1)
        };
        let selfAttr = {
          groupName: isRe ? '关联类' : '实体类',
          groupType: isRe,
          attrList: this.groupAttrList[0].attrList.filter(item => SYS_ENTITY_ATTRIBUTES(item) === -1)
        };

        if(e == 'value') {

          this.adjustXAttrList = this.groupNumberTypeList;

          this.adjustYAttrList = [];
          if(isRe == '') {
            this.adjustYAttrList.push(sysAttr, selfAttr);
          } else {
            this.adjustYAttrList.push(sysAttr, selfAttr, this.groupAttrList[1], this.groupAttrList[2]);
          }

        } else {

          this.adjustXAttrList = [];
          if(isRe == '') {
            this.adjustXAttrList.push(sysAttr, selfAttr);
          } else {
            this.adjustXAttrList.push(sysAttr, selfAttr, this.groupAttrList[1], this.groupAttrList[2]);
          }

          this.adjustYAttrList = this.groupNumberTypeList;

        }

      }

      // this.disposeChart();
      if(this.args.series.length > 0) {
        this.hasSeries = false
        this.args.series = [];
        this.args.option.series = [];
        this.args.option.dataZoom = [];
        this.disposeChart();
        this.previewChart();
        // this.mychart.dispose();
        // this.mychart = echarts.init(this.$refs.previewbox);

        // let resetOption = {
        //   title: {
        //     text: "混合图",
        //     left: "center",
        //     textStyle: {
        //       color: '#333',
        //       fontSize: 18
        //     }
        //   },
        //   color: ['#31C5E9', '#9EE7B9', '#FFDB5C', '#FF9F7F','#FC7192', '#E062AE', '#E690D1','#E7BCF4', '#9D96F5', '#8277EA'],
        //   legend: {
        //     bottom: "0",
        //     data: [],
        //     textStyle: {
        //       color: '#333',
        //       fontSize: 12
        //     },
        //     // formatter: '{name}'
        //   },
        //   tooltip: {},
        //   toolbox: {
        //     show: true,
        //     iconStyle: {
        //       color: ''
        //     },
        //     orient: "vertical",
        //     left: "right",
        //     top: "center",
        //     feature: {
        //       mark: { show: true },
        //       // dataView: { show: true, readOnly: false },
        //       magicType: {
        //         show: true,
        //         type: ["line", "bar", "stack", "tiled"]
        //       },
        //       // restore: { show: true },
        //       saveAsImage: { show: true }
        //     }
        //   },
        //   //数据存储
        //   dataset: {
        //     source: []
        //   },
        //   xAxis: [],
        //   yAxis: [],
        //   grid: [],
        //   series: []
        // }

        // if(e == 'category') {

        //   resetOption.xAxis.push({ type: "category", gridIndex: 0, name: '' });
        //   resetOption.yAxis.push({ type: "value", gridIndex: 0, name: '', splitLine: {} });

        // } else {

        //   resetOption.xAxis.push({ type: "value", gridIndex: 0, name: ''});
        //   resetOption.yAxis.push({ type: "category", gridIndex: 0, name: ''});

        // }

        // this.mychart.setOption(resetOption);

      }

    },

    // 确认追加混合图脚本内容
    // confirmScript() {
    //   this.showScriptModal = false;
    //   console.log(this.args.echartScript);
    // },
    // 关闭脚本编辑弹窗
    // cancelScript() {
    //   this.showScriptModal = false;

    //   this.echartScript = '';
    // },

    // 刷新图表
    async freshData(queryStr) {
      
      let className = this.args.bindTargetClass;
      this.actAttributes = [];

      if(className != undefined && className != '') {

        this.hasSeries = false;
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

        // ********** 如果X轴展示数据超过定制最大数据量 启动dataZoom模式 ************
        if(this.args.option.dataset.source.length > 0) {

          if(this.args.option.dataset.source.length - 1 > this.args.maxNum) {

            let zoomEnd = (this.args.maxNum/this.args.option.dataset.source.length)*100;

            let zoomOrient = this.seriesYType == 'category' ? 'vertical' : 'horizontal';
            let zoomLeft = this.seriesYType == 'category' ? 10 : 'auto';

            this.args.option.dataZoom = [
              {
                type: 'slider',
                show: true,
                orient: zoomOrient,
                left: zoomLeft,
                start: 0,
                end: zoomEnd,
                handleSize: 8
              }
            ]
          } else {
            this.args.option.dataZoom = []
          }

        }

        this.previewChart();

      } else {
        this.$Message.warning('请先选择目标类')
      }

    },

    getSelected() {

      return this.clickData;

    }


  }
};
</script>
<style>
  .toolDiv {
    max-width: 400px;
    white-space: normal;
    word-wrap: break-word;
    max-height: 300px;
    overflow-y: auto;
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
  line-height: 30px;
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
/*
.exportData-btn {
  width: 100%;
  height: 40px;
  line-height: 40px;
} */

.overTxt {
   text-overflow: ellipsis;
   overflow: hidden;
   white-space: nowrap;
}
</style>
