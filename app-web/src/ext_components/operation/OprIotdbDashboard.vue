<template>
  <div style="margin: 24px">
    <Row :gutter="16">
      <Col :span="24" style="margin-bottom: 16px;">
        <Card><p slot="title">示例看板设置</p>
          <Form ref="editRowForm" :model="editRowData" inline style="display: flex; align-items: center">
            <FormItem label="实体类" prop="currentClass" style="width: 40%;">
              <Select v-model="editRowData.currentClass" placeholder="请选择实体类" filterable>
                <Option v-for="item in classList" :value="item.value" :key="item.value" :label="item.label">
                  <span>{{ item.value }}</span>
                  <span style="float:right; color:#ccc">{{ item.label }}</span>
                </Option>
              </Select>
            </FormItem>
            <FormItem label="设备路径" prop="currentDevice" style="width: 40%;">
              <Select v-model="editRowData.currentDevice" placeholder="请选择设备路径" filterable>
                <Option v-for="item in deviceList" :value="item" :key="item">{{ item }}</Option>
              </Select>
            </FormItem>
            <FormItem style="width: 20%">
              <br>
              <Button type="primary" @click="foo('meow')">确认绑定</Button>
            </FormItem>
          </Form>
        </Card>
      </Col>
    </Row>

    <!--    <div ref="chart" :style="{'width': '100%', 'height': '500px'}"></div>-->
    <Row :gutter="16">
      <Col :xs="{ span: 24 }" :lg="{ span: 8 }" style="margin-bottom: 16px;">
        <Card><p slot="title">温度</p>
          <div ref="chart" style="width: 100%; height: 150px;"></div>
        </Card>
      </Col>
      <Col :xs="{ span: 24 }" :lg="{ span: 8 }" style="margin-bottom: 16px;">
        <Card><p slot="title">运行状态</p>
          <p>（运行状态）</p>
        </Card>
      </Col>
      <Col :xs="{ span: 24 }" :lg="{ span: 8 }" style="margin-bottom: 16px;">
        <Card><p slot="title">硬件版本</p>
          <p>（硬件版本）</p>
        </Card>
      </Col>
    </Row>
  </div>
</template>
<script>
  import {getEobjSingle} from "@/api/others";

  let echarts = require("echarts");
  export default {
    name: "OprIotdbDashboard",
    data() {
      return {
        classList: [{
          value: "tsTest",
          label: "时间序列测试类"
        }],
        editRowData: {
          currentClass: undefined,
          currentDevice: undefined
        },
        deviceList: [
          "root.ln.wf01.wt01",
          "root.ln.wf02.wt02",
          "root.sgcc.wf03.wt01"
        ],
        dateList: [],
        valueList: [],
        chart: null
      }
    },
    computed: {
      option() {
        return {
          // Make gradient line here
          visualMap: [{
            show: false,
            type: 'continuous',
            seriesIndex: 0,
            min: 0,
            max: 400
          }],
          // title: [{
          //     left: 'center',
          //     text: 'Gradient along the y axis'
          // }],
          tooltip: {
            trigger: 'axis'
          },
          xAxis: [{
            data: this.dateList
          }],
          yAxis: [{
            splitLine: {show: false}
          }],
          grid: {
            left: '10%',
            right: '5%',
            top: '5%',
            bottom: '15%'
          },
          series: [{
            type: 'line',
            showSymbol: false,
            data: this.valueList
          }]
        };
      }
    },
    created() {
    },
    methods: {
      canShow() {
        return true;
      },
      setArgs(args) {
        for (var i in args) {
          this.args[i] = args[i];
        }
        return this;
      },
      async onHandle(params) {
        var newObj = {...params};
        try {
          await this.saveEObj(newObj);
        } catch (e) {
          console.log(e);
        }
      },
      foo() {
        let seriesInfo = [
          {
            "attrName": "temperature",
            "count": 20,
            "type": "latest"
          }
        ];
        getEobjSingle('tsTest', 'E05919151F5900458DBA834CB3ADDDF4', seriesInfo).then(res => {
          if (res.data === undefined) {
            this.$Message.error("获取对象失败");
            return;
          }
          this.dateList = res.data.data.temperature.series.map(function (item) {
            let t = new Date(item[0]);
            return `${t.getHours()}:${t.getMinutes()}`;
          });
          this.valueList = res.data.data.temperature.series.map(function (item) {
            return item[1];
          });
          this.chart = echarts.init(this.$refs.chart);
          this.chart.setOption(this.option);
          setInterval(() => {
            this.chart.resize();
          }, 100);
        }).catch(err => {
          this.$Message.error(err);
        });
      }
    }
  };
</script>
<style>
</style>
