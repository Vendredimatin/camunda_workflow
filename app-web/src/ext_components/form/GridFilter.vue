<template id="demo">
<div>
  <Modal
    v-model="showPanel"
    title="列定制面板"
    style="height: 500px;"
    mask-closable="false"
    @on-ok="apply"
    @on-cancel="cancel">
    <div>
      <!-- <Button type="primary" @click="printParams">display all Params</Button> -->
      <Input v-model="testName" />
      <Tabs >
        <TabPane label="基本配置" name="config">
          <Collapse simple :value="collapsePage" accordion>
            <Panel name="1">
              引用设置
              <p slot="content">
                引用类
              </p>
              <Select slot="content" v-model="refClass" clearable>
                <Option v-for="entity in allEntities" :key="entity.id" :value="entity.className">
                  {{entity.displayName}}
                </Option>
              </Select>

              <p slot="content">
                浏览字段
              </p>
              <Select slot="content" v-model="browseAttr" clearable>
                <Option v-for="attr in refClassAttrs" :key="attr.id" :value="attr.attributeName">
                  {{attr.displayName}}
                </Option>
              </Select>

              <p slot="content">
                回填字段
              </p>
              <Select slot="content" v-model="returnAttr" clearable>
                <Option v-for="attr in refClassAttrs" :key="attr.id" :value="attr.attributeName">
                  {{attr.displayName}}
                </Option>
              </Select>

              <p slot="content">
                过滤字段
              </p>
              <Select slot="content">
                <Option>

                </Option>
              </Select>

              <Button class="margin3" type="primary" slot="content">编辑过滤字段</Button>

            </Panel>
            <Panel name="2" style="">
              样式设置

              <!-- <Row slot="content" class="margin-p" type="flex" align="middle">
                <Col  span="12" style="text-align: left">
                  <Checkbox size="large" v-model="autofitWidth">自适应列宽</Checkbox>
                </Col>
                <Col span="4">
                    设置行高
                </Col>
                <Col span="8">
                    <Input type="number" v-model="setHeight" />
                </Col>
              </Row> -->


              <Row slot="content" class="margin-p" type="flex" align="middle">
                <Col span="12">
                  <Checkbox size="large" v-model="enableSorting">可排序</Checkbox>
                </Col>
                <Col span="12">
                  <Checkbox size="large" v-model="enableFilter">可定制</Checkbox>
                </Col>
              </Row>

              <Row slot="content" class="margin-p" type="flex" align="middle">
                <!-- <Col span="12">
                  <Checkbox size="large" v-model="addCheckbox">增加勾选框</Checkbox>
                </Col> -->
                <Col span="12">
                  <Checkbox size="large" v-model="editable">该列可编辑</Checkbox>
                </Col>
              </Row>

              <Row slot="content" class="margin-p" type="flex" align="middle">
                <!-- <Col span="12" >
                  <ButtonGroup class="btng">
                    <Button type="primary" class="btn-margin" @click="leftAlign">左对齐</Button>
                    <Button type="primary" class="btn-margin" @click="centralAlign">中对齐</Button>
                    <Button type="primary" class="btn-margin" @click="rightAlign">右对齐</Button>
                  </ButtonGroup>
                </Col>
                <Col span="12">
                  <ButtonGroup vertical class="btng">
                    <Button type="primary" class="btn-margin" @click="upAlign">上对齐</Button>
                    <Button type="primary" class="btn-margin" @click="middleAlign">中对齐</Button>
                    <Button type="primary" class="btn-margin" @click="downAlign">下对齐</Button>
                  </ButtonGroup>
                </Col> -->


                <div class="margin1">
                    <div style="text-align: center">
                        <Button :type="alignCode == 0 ? 'primary' : 'default'" style="height: 20px; width: 20px;padding: 0;margin-top:0px;" @click="alignCode = 0"></Button>
                        <Button :type="alignCode == 3 ? 'primary' : 'default'" style="height: 20px; width: 20px;padding: 0;margin-top:0px;" @click="alignCode = 3"></Button>
                        <Button :type="alignCode == 6 ? 'primary' : 'default'" style="height: 20px; width: 20px;padding: 0;margin-top:0px;" @click="alignCode = 6"></Button>
                    </div>
                    <div style="text-align: center ">
                        <Button :type="alignCode == 1 ? 'primary' : 'default'" style="height: 20px; width: 20px;padding: 0;margin-top:0px;" @click="alignCode = 1"></Button>
                        <Button :type="alignCode == 4 ? 'primary' : 'default'" style="height: 20px; width: 20px;padding: 0;margin-top:0px;" @click="alignCode = 4"></Button>
                        <Button :type="alignCode == 7 ? 'primary' : 'default'" style="height: 20px; width: 20px;padding: 0;margin-top:0px;" @click="alignCode = 7"></Button>
                    </div>
                    <div style="text-align: center">
                        <Button :type="alignCode == 2 ? 'primary' : 'default'" style="height: 20px; width: 20px;padding: 0;margin-top:0px;" @click="alignCode = 2"></Button>
                        <Button :type="alignCode == 5 ? 'primary' : 'default'" style="height: 20px; width: 20px;padding: 0;margin-top:0px;" @click="alignCode = 5"></Button>
                        <Button :type="alignCode == 8 ? 'primary' : 'default'" style="height: 20px; width: 20px;padding: 0;margin-top:0px;" @click="alignCode = 8"></Button>
                    </div>
                </div>
              </Row>

            </Panel>
          </Collapse>
          <br/>

        </TabPane>
        <TabPane label="显示模式" name="display" style="height: 300px;">
          <Form class="margin1">
            <Select v-model="renderType" >
              <Option v-for="type in renderList" :value="type.value" :key="type.name">{{type.name}}</Option>
            </Select>
          </Form>
          <Form v-show="renderType=='timeTransferRender'" class="margin1">
            <Select v-model="cellParams.timeTransferFormat" placeholder="请选择日期格式">
              <Option value="YYYYMMDD" key="1" label="年月日">
                <span>年月日</span>
                <span style="float:right;color:#ccc">YYYY-MM-DD</span>
              </Option>
              <Option value="hhmmss" key="2" label="时分秒">
                <span>时分秒</span>
                <span style="float:right;color:#ccc">hh:mm:ss</span>
              </Option>
              <Option value="YYYYMMDDhhmmss" key="3" label="年月日时分秒">
                <span>年月日时分秒</span>
                <span style="float:right;color:#ccc">YYYY-MM-DD hh:mm:ss</span>
              </Option>
            </Select>
          </Form>
          <Form v-show="renderType=='progressBarRender'" class="margin1">
            <Input v-model="cellParams.progressScale" placeholder="请输入进度条100%时单元格的取值"/>

            <Input class="margin1" number v-model="cellParams.refreshPeriod" @on-blur="validateRefreshPeriod">
            <Select v-model="cellParams.refreshScale" slot="append" style="width: 100px;" @on-change="validateRefreshPeriod">
              <Option value="ms">ms</Option>
              <Option value="s">s</Option>
            </Select>
            </Input>
          </Form>
        </TabPane>
      </Tabs>
    </div>
  </Modal>
</div>
</template>


<script>
import Vue from "vue/dist/vue.min.js";
import iView from 'iview/dist/iview.min.js'; // 导入组件库
import 'iview/dist/styles/iview.css'; // 导入样式
import {progressBarRender, checkboxRender, timeTransferRender, operationRender} from './gridCellRenders.js';
Vue.use(iView);

export default Vue.extend({
  data() {
    return {
      text: "",
      valueGetter: null,
      params: null,
      showPanel: true,
      showGeneralPanel: true,
      tabName: "config",
      collapsePage: "1",

      alignCode: 4,

      // 自适应列宽和自动换行
      autofitWidth: null,
      autoHeight: true,  // 暂时不好用
      setHeight: 25,
      enableSorting: null,
      enableFilter: null,

      // 需要与当前colDef做确认的内容
      addCheckbox: null,
      editable: false,

      testName: "",  // headerName


      renderType: "",
      renderList: [
        {
          name: "无",
          value: "NONE"
        },
        {
          name: "进度条",
          value: "progressBarRender"
        },
        {
          name: "勾选框",
          value: "checkboxRender"
        },
        {
          name: "时间转换",
          value: "timeTransferRender"
        },
      ],

      // 用于在实例中记录cellRender的参数 传递到colDef中对应对象cellRendererParams
      cellParams: {
        timeTransferFormat: "",
        progressScale: null,
        refreshPeriod: 3000,
        refreshScale: ["ms", "s"],
        refreshPeriodByMs: 0,
        freshData: function(){

        },
      },

      // 关于引用类的配置
      refClass: "",
      browseAttr: "",
      returnAttr: "",
      refClassAttrs: [],
    };
  },

  mounted() {
    console.log('mounted, params', this.params);
    let that = this;
    this.testName = this.params.colDef.headerName;
    this.enableSorting = false || this.gridOptions.enableSorting;
    this.enableFilter = false || this.gridOptions.enableFilter;
    this.addCheckbox = false || this.params.colDef.checkboxSelection;
    this.editable = this.params.colDef.editable;
    this.renderType = this.params.colDef._cellRendererFramework;
    this.alignCode = this.params.colDef.alignCode;

    for (let par in this.params.colDef.cellRendererParams){
      if (par in this.cellParams) this.cellParams[par] = this.params.colDef.cellRendererParams[par];
    };


    this.refClass = this.params.colDef.refClass;
    this.browseAttr = this.params.colDef.browseAttr;
    this.returnAttr = this.params.colDef.returnAttr;
  },

  created() {
    // 为关联信息做准备
    // if(this.params&&this.params.theGrid) console.log('Entities when mount filter', this.params.theGrid.Entities());
    if (this.params&&this.params.Entities) console.log('Entities when mount filter', this.params.Entities());
  },

  methods: {
    changeRenderToProgressbar(){
      this.columnDefs.forEach(x=>{
        if (x.colId==this.params.colDef.colId) x.cellRendererFramework = progressBarRender;
      })
    },

    apply(){
      //  控件值写到实例中

      //  双向检查
      this.params.colDef.checkboxSelection = this.addCheckbox;
      this.params.colDef.enableSorting = this.enableSorting;
      this.params.colDef.enableFilter = this.enableFilter;
      this.params.colDef.editable = this.editable;
      this.params.colDef.headerName = this.testName;
      this.params.colDef.alignCode = this.alignCode;
      // this.gridOptions.rowHeight = this.setHeight;

      //  选择cell的渲染器
      // console.log('renderType', this.renderType);
      console.log('before applyRenderConfig', this.columnDefs);
      this.applyRenderConfig(this.renderType);

      // 写入引用信息到colDef
      this.params.colDef.refClass = this.refClass;
      this.params.colDef.browseAttr = this.browseAttr;
      this.params.colDef.returnAttr = this.returnAttr;

      // 设置引用或渲染类型后 该列不可编辑
      if(this.refClass || this.renderType) this.params.colDef.editable = false;

      // 数据流向: 实例 -> params.colDef -> columnDefs
      console.log('before apply defs', this.columnDefs);
      this.applyColumnModification(this.params.colDef);
      this.hidePopup();
      this.params.api.setColumnDefs(this.columnDefs);

      // 设置到theGrid.args用于保存 但这个做法较为危险
      // 真的会产生bug 比如gridOptions中有api等递归元素
      for (var x in this.gridOptions){
        // console.log('theGrid at apply', this.params.theGrid);
        // console.log('gridOptions[x]', x, this.gridOptions[x], typeof this.gridOptions[x]);
        // if (typeof this.gridOptions[x] != "object") this.params.theGrid.args[x] = this.gridOptions[x];
        if (typeof this.gridOptions[x] != "object") this.params.args[x] = this.gridOptions[x];
      }
      console.log('after apply', this.columnDefs);

      // this.params.theGrid.freshData();
      this.params.freshData();
    },

    leftAlign(){
      console.log('cellStyle of colDef', this.params.colDef.cellStyle);
      if (!this.params.colDef.cellStyle) this.params.colDef.cellStyle = {};
      this.params.colDef.cellStyle["text-align"] = "left";
    },

    rightAlign(){
      console.log('cellStyle of colDef', this.params.colDef.cellStyle);
      if (!this.params.colDef.cellStyle) this.params.colDef.cellStyle = {};
      this.params.colDef.cellStyle["text-align"] = "right";
    },

    centralAlign(){
      console.log('cellStyle of colDef', this.params.colDef.cellStyle);
      if (!this.params.colDef.cellStyle) this.params.colDef.cellStyle = {};
      this.params.colDef.cellStyle["text-align"] = "center";
    },

    middleAlign(){
      console.log('gridOptions', this.gridOptions);
      if (!this.params.colDef.cellStyle) this.params.colDef.cellStyle = {};
      this.params.colDef.cellStyle["line-height"] = this.gridOptions.rowHeight + "px";
    },

    upAlign(){
      console.log('gridOptions', this.gridOptions);
      if (!this.params.colDef.cellStyle) this.params.colDef.cellStyle = {};
      this.params.colDef.cellStyle["line-height"] = 0.4*this.gridOptions.rowHeight + "px";
    },

    downAlign(){
      console.log('gridOptions', this.gridOptions);
      if (!this.params.colDef.cellStyle) this.params.colDef.cellStyle = {};
      this.params.colDef.cellStyle["line-height"] = 1.6*this.gridOptions.rowHeight + "px";
    },

    cancel(){
      //  考虑增加destroy接口对其进行销毁
      this.hidePopup();
      this.showPanel = false;
    },

    applyColumnModification(_colDef){
      //TODO: apply前面的部分只是将控件值写入到实例，而该函数将实例值写到ColumnDefs
      this.columnDefs.forEach(col=>{
        if (col.colId==_colDef.colId){
          Object.keys(_colDef).forEach(attr=>{
            // console.log('attr in _colDef', attr, _colDef[attr]);
            if (attr == "cellRendererFramework") {
              col["_cellRendererFramework"] = this.renderType;  // 用于`序列化`cellRender, 以备读取json后渲染, cellRender相关配置项cellParams自身不需要再序列化
            }

            col[attr] = _colDef[attr];
          });
          console.log('change headerName', this.testName);
        }
      });
      // this.params.api.setColumnDefs(this.params.theGrid.args.columnDefs);
    },

    applyRenderConfig(_renderType, _outColDef=null){
      // cellRendererParams 是ag-grid固定的接口传入相关参数 在cellRender中通过params访问

      // 用于给渲染器调用刷新函数
      let that = this;
      this.cellParams.freshData = function(){
        return that.params.freshData();
      };
      this.cellParams.updateQuery = function (query) {
        return that.params.updateQuery(query);
      };

      let _the_colDef;
      if(!_outColDef){
        _the_colDef = this.params.colDef;
        _the_colDef.cellRendererParams = this.cellParams;
      } else {
        _the_colDef = _outColDef;
      }

      console.log('_the_colDef@applyRenderConfig', _the_colDef);
      switch(_renderType){
        case "progressBarRender":
          _the_colDef.cellRendererFramework = progressBarRender;
          break;
        case "checkboxRender":
          _the_colDef.cellRendererFramework = checkboxRender;
          break;
        case "timeTransferRender":
          _the_colDef.cellRendererFramework = timeTransferRender;
          break;
        case "operationRender":
          _the_colDef.cellRendererFramework = operationRender;
          break;
        case "NONE":
          _the_colDef.cellRendererFramework = null;
          break;
        default:
          break;
      }
    },

    applyRenderOutside(_colDef){
      // 用于解耦Grid.vue中和CellRender相关的部分
      if (_colDef._cellRendererFramework){
        this.applyRenderConfig(_colDef._cellRendererFramework, _colDef);
      }
    },



    callPanel(){
      this.showPanel = true;
    },

    printParams(){
      console.log("clicked do this, params:", this.params);
      console.log("columnDefs", this.columnDefs);
      console.log("gridOptions", this.gridOptions);
      console.log('refClassAttrs', this.refClassAttrs);
    },

    isFilterActive() {
      return this.text !== null && this.text !== undefined && this.text !== "";
    },

    doesFilterPass(params) {
      return (
        !this.text ||
        this.text
          .toLowerCase()
          .split(" ")
          .every(filterWord => {
            return (
              this.valueGetter(params.node)
                .toString()
                .toLowerCase()
                .indexOf(filterWord) >= 0
            );
          })
      );
    },

    getModel() {
      return { value: this.text };
    },

    setModel(model) {
      if (model) {
        this.text = model.value;
      }
    },

    afterGuiAttached(params) {
      console.log('afterGUIAttached, params', params);
      this.hidePopup = params.hidePopup;
      this.showPanel = true;
      // this.$refs.input.focus();
    },

    componentMethod(message) {
    },

    setAlign(){
      console.log('realign');
    },

    getColumnDefs(){
      // return this.params.theGrid.args.columnDefs;
      return this.params.api.gridOptionsWrapper.gridOptions.columnDefs;
    },

    async queryEntityAttr(){
      // return await this.params.theGrid.queryEntity(this.refClass);
      return await this.params.queryEntity(this.refClass);
    },

    validateRefreshPeriod(){
      let periodByMs = this.cellParams.refreshScale=="s" ? this.cellParams.refreshPeriod*1000 : this.cellParams.refreshPeriod;
      // 范围在 30 - 600000 毫秒间 (0.03-600)s
      periodByMs = periodByMs<30 ? 30 : periodByMs;
      periodByMs = periodByMs>600000 ? 600000 : periodByMs;
      this.cellParams.refreshPeriodByMs = periodByMs;

      if (this.cellParams.refreshScale=="ms") this.cellParams.refreshPeriod = periodByMs;
      else this.cellParams.refreshPeriod = periodByMs/1000;
    },

  },
  computed:{
    gridOptions(){
      return this.params.api.gridOptionsWrapper.gridOptions;
    },
    columnDefs(){
      return this.params.api.gridOptionsWrapper.gridOptions.columnDefs;
    },
    allEntities(){
      // return this.params.theGrid.Entities();
      return this.params.Entities();
    },
    // async refClassAttrs(){
    //   return this.params.theGrid.EntityAttrList(this.refClass);
    //   if(!this.params.theGrid.EntityAttrList(this.refClass)
    //   || this.params.theGrid.EntityAttrList(this.refClass).length==0){
    //     await this.params.theGrid.queryEntity(this.refClass);
    //   }
    //   let _mid_ret = this.params.theGrid.EntityAttrList(this.refClass);
    //   console.log('middle _ret', _mid_ret);
    //   let _result = [];
    //   _mid_ret.forEach(x=>{
    //     _result.push({
    //       id: x.id,
    //       displayName: x.displayName,
    //       attributeName: x.attributeName
    //     });
    //   })
    //   console.log('attrs of refClass', _result);
    //   return _result;
    // },
  },
  watch: {
    alignCode: function (val) {
      if (val<3) this.leftAlign();
      else if (val<6) this.centralAlign();
      else this.rightAlign();

      if (val==0||val==3||val==6) this.upAlign();
      else if (val==1||val==4||val==7) this.middleAlign();
      else this.downAlign();
    },

    text: function(val, oldVal) {
      if (val !== oldVal) {
        this.params.filterChangedCallback();
      }
    },

    refClass: function(val){
      if (!val) {
        this.refClassAttrs = null;
        this.returnAttr = null;
        return;
      }
      console.log("refClassAttrs", this.refClassAttrs);
      this.queryEntityAttr().then(()=>{
        console.log('EntityAttrs loaded');
        // let _mid_ret = this.params.theGrid.EntityAttrList(this.refClass);
        let _mid_ret = this.params.EntityAttrList(this.refClass);
        console.log('middle _ret', _mid_ret);
        let _result = [];
        _mid_ret.forEach(x=>{
          _result.push({
            id: x.id,
            displayName: x.displayName,
            attributeName: x.attributeName
          });
        })
        console.log('attrs of refClass', _result);
        this.refClassAttrs = _result;
      });
    },
  },

});

</script>

<style scoped>
p{
  margin-bottom: 8px;
  margin-top: 15px;
}
.margin-p{
  margin-bottom: 8px;
  margin-top: 15px;
}
Button{
  margin-top: 36px;
}
.margin3{
  margin-top: 20px;
  margin-bottom: 20px;
}
.btng{
  margin: 0px;
}
.btn-margin{
  margin: 0px;
}
.cell-wrap-text {
    white-space: normal !important;
}
.ag-cell {
  white-space: normal !important;
}
</style>
