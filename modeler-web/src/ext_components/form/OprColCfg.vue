<template id="demo">
<div v-if="showPanel">
  <Modal
    v-model="showPanel"
    title="操作列设置面板"
    style="height: 500px;"
    :mask-closable="false"
    mask="false"
    :closable="true"
    :z-index="900"
    position="fixed"
    :class-name="'grid-opr'"
    @on-ok="apply"
    @on-cancel="cancel">
    <div>
<!--      <Button style="margin-top:0px;" type="primary" @click="printParams">display all Params</Button>-->
    <Row>
      <Col span="20">
        <section
              v-if="showPanel"
              style="background-color: #eee; min-height: 50px; height: auto; padding: 6px 4px;"
              id="opr-button-panel"
              class="button-panel"
              @drop="drop"
              @dragover="allowDrop">
              <ButtonGroup
                draggable="true"
                @dragstart.native="drag"
                @drop="drop"
                class="opr-button"
                :key="index"
                :sort="item.uuid"
                v-show="reRenderBtnG"
                ref="btng"
                v-for="(item, index) in operationParams">
                <Button
                  class="margin0 grid-opration"
                  :style="item.style"
                  :shape="getShape(item.shape)"
                  :icon="item.icon"
                  :type="item.type"
                  @click="setButtonCfg(event, item.uuid)">{{ item.uniLabel }}
                </Button>
              </ButtonGroup>
            </section>
          </Col>
          <Col span="4">
            <Button icon="md-add" style="margin: 9px 5px 0;" type="dashed" shape="circle" @click="addAButton"></Button>
            <Button icon="md-remove" style="margin-top:9px;" type="dashed" shape="circle" @click="deleteOpr"></Button>
          </Col>
        </Row>

        <p>列名称</p>
        <Input v-model="headerName"/>

        <p>目标类</p>
        <Input disabled :placeholder="this.params.getTargetClass()"/>

        <Row slot="content" class="margin-p" type="flex" align="middle">
          <Col span="24">
            <Input
              type="number"
              v-model="width"
              v-if="widthType == 'px'"
            >
              <span slot="prepend">列宽</span>
              <Select v-model="widthType" slot="append" style="width: 70px;">
                <Option value="%">%</Option>
                <Option value="px">px</Option>
              </Select>
            </Input>
            <Input
              type="number"
              v-model="widthPercent"
              v-else
            >
              <span slot="prepend">列宽</span>
              <Select v-model="widthType" slot="append" style="width: 70px;">
                <Option value="%">%</Option>
                <Option value="px">px</Option>
              </Select>
            </Input>
          </Col>
        </Row>

        <p>绑定操作</p>
        <BindOperationBar index="1"
                          ref="BindOperationBar"
                          :opr_path="now_opr_path"
                          :opr_type="now_opr_type"
                          :opr_sys_path="now_opr_sys_path"
                          :opr_showMessage="now_opr_showMessage"
                          :form_targetclass="this.params.itemValue.data.targetClass"
                          :load_query_oprs="this.params._query_oprs"
                          :form_json="this.params.itemValue"
                          :route="this.params.route"
                          :router="this.params.router"
                          :root="this.params.root"
                          v-on:on-change="handleChangeEventOfOperationBar"
                          style="width:100%"></BindOperationBar>

        <p>按钮样式</p>
        <Row type="flex" align="middle" justify="space-between">
          <Col span="15">
            <Select v-model="nowOpr.type">
              <Option value="">默认</Option>
              <Option value="primary">蓝色</Option>
              <Option value="success">绿色</Option>
              <Option value="warning">橙色</Option>
              <Option value="error">红色</Option>
              <Option value="info">天蓝</Option>
              <Option value="text">纯文字</Option>
              <Option value="dashed">虚线框</Option>
            </Select>
          </Col>
          <Col span="4">
            <Checkbox v-model="nowOpr.shape" class="margin0">圆角</Checkbox>
          </Col>
          <Col span="4">
            <Checkbox v-model="nowOpr.disabled" class="margin0">禁用</Checkbox>
          </Col>
        </Row>

        <p>图标</p>
        <Select v-model="nowOpr.icon" clearable filterable>
          <Option value="">无</Option>
          <Option v-for="icon in iconlist" :value="icon.value" :key="icon.value" :label="icon.label">
            <Icon :type="`${icon.value}`" style="font-size: 20px !important;"></Icon>
            <span style="float:right;color:#ccc">{{ icon.label }}</span>
          </Option>
          <!--        <Option v-for="x in iList" :value="x.value" :key="x.value" :label="x.label">-->
          <!--            <i class="iconfont" :class="x.value" style="font-size: 20px !important;"></i>-->
          <!--        </Option>-->
        </Select>
        <p>文字</p>
        <Row type="flex" justify="right" :gutter="16">
          <Col span="12">
            <Input v-model="nowOpr.uniLabel"/>
          </Col>
          <Col span="6">
            <Select v-model="nowOpr.color">
              <Option value="blue">蓝色</Option>
              <Option value="green">绿色</Option>
              <Option value="orange">橙色</Option>
              <Option value="red">红色</Option>
            </Select>
          </Col>
          <Col span="6">
            <Input v-model="nowOpr.color" placeholder="如red, #1f1f1f"/>
          </Col>
        </Row>

        <!--      <p>条件表达式</p>-->
        <!--      <Row type="flex" justify="right">-->
        <!--        <Col span="24">-->
        <!--          <Input v-model="nowOpr.expression"/>-->
        <!--        </Col>-->
        <!--      </Row>-->

        <p>
          <span>是否开启授权</span> &nbsp;
          <i-Switch v-model="nowOpr.auth" size="middle"></i-Switch> &nbsp;
          <Button type="primary" style="margin-top:0px;" size="small" @click="openAuthDialog" :disabled="!nowOpr.auth">
            管理授权
          </Button>
        </p>
        <p>
          <Checkbox v-model="lockPinned">冻结该列位置</Checkbox>
          <RadioGroup v-show="lockPinned" v-model="pinned" type="button" size="small">
            <Radio label="left">左</Radio>
            <Radio label="right">右</Radio>
          </RadioGroup>
        </p>

        <OperationAuthModal
          ref="operationAuthModal"
          :auth_item="nowOpr.auth_item"
          :listStyle="listStyle"
          :transferTitles="transferTitles"
          :targetClass="this.params.getTargetClass()"
        >
        </OperationAuthModal>
        <!--      <Modal v-model="show_auth_dialog" title="管理授权" @on-ok="onUpdateAuth" width="700" z-index="79200">-->
        <!--        <Transfer-->
        <!--          :data="users_and_groups"-->
        <!--          :target-keys="authed"-->
        <!--          :render-format="transferRender"-->
        <!--          @on-change="handleChangeOfTransfer"-->
        <!--          :list-style="listStyle"-->
        <!--          :titles="transferTitles"-->
        <!--        ></Transfer>-->
        <!--      </Modal>-->
      </div>
    </Modal>
  </div>
</template>


<script>
import Vue from "vue/dist/vue.min.js";
import iView from 'iview/dist/iview.min.js'; // 导入组件库
import 'iview/dist/styles/iview.css'; // 导入样式
import iconlist from "@/views/functional-model/components/moduleIcon.js";
import {getQuickOpeById} from "@/api/others.js";
import BindOperationBar from "../form/subcomponent/BindOperationBar.vue"
import OperationAuthModal from "../form/subcomponent/OperationAuthModal.vue"
import {operationRender} from './gridCellRenders.js';
import {uuid} from '@/util/assist';
import _ from 'lodash'
import {getAddinFunc} from "@/util/addin";

Vue.use(iView);

export default Vue.extend({
  components: {BindOperationBar, OperationAuthModal},
  data() {
    return {
      reRenderBtnG: true,
      dragButton: null,
      buttonSort: [],
      text: "",
      valueGetter: null,
      params: null,
      showPanel: true,
      showGeneralPanel: true,
      tabName: "config",
      collapsePage: "1",

      // 自适应列宽和自动换行
      autofitWidth: null,
      autoHeight: true,  // 暂时不好用
      setHeight: 25,
      enableSorting: null,
      enableFilter: null,

      // 需要与当前colDef做确认的内容
      addCheckbox: null,
      editable: false,
      lockPinned: false,
      pinned: 'left',

      headerName: "",  // headerName
      width: 200,
      widthType: 'px',
      widthPercent: 0,

      nowOpr: {
        // disabled: "",
        // color: "",
        // type: "primary",
        // shape: false,
        // icon: "",
        // text: "操作",
        // auth : false,
        // auth_item : null,
        opr_path: "",
        opr_showMessage: true,
        opr_sys_path: '',
        name: "",
        style: {},
        targetDataType: null,
        type: "primary",
        shape: false,
        icon: "",
        text: "按钮",
        opr_type: null,
        auth: false,
        auth_item: null,
        color: '',
        disabled: false,
        uniLabel: "", // 用于区分不同的操作 初始值为text 但后期自行修改
        uuid: '',
        expression: '',//控制显示隐藏的表达式
      },
      authed: [],
      users_and_groups: [],
      tem_users_and_groups: [],
      listStyle: {
        width: '300px',
        height: '500px'
      },
      transferTitles: ["未授权", "已授权"],

      iconlist: iconlist,
      // iList: ilist,

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
      },

      // 关于引用类的配置
      refClass: "",
      browseAttr: "",
      returnAttr: "",
      refClassAttrs: [],
      operationParams: [],
      _query_oprs: [],
    };
  },

  mounted() {
    this.$store = this.params.getStore();
    this.headerName = this.params.colDef.headerName;
    this.lockPinned = this.params.colDef.lockPinned;
    this.pinned = this.params.colDef.pinned || 'left';
    if (this.operationParams.length > 0) {
      for (let i in this.operationParams[0]) {
        this.nowOpr[i] = this.operationParams[0][i];
      }
    }
    // To assign all children store
    this.$children[0].$store = this.$store;
    let _direct_child = this.$children[0];
    for (let ind in _direct_child.$children) {
      _direct_child.$children[ind].$store = this.$store;
      ;
      for (let _ind in _direct_child.$children[ind].$children) {
        _direct_child.$children[ind].$children[_ind].$store = this.$store;
      }
    }
    //将弹窗暴露到全局让它可以被其他组件关闭
    this.params.root.gridFilterDialog = this;

    console.log("route@mounted", this.params_route);
  },

  created() {
    // 为关联信息做准备
    this.$store = this.params.getStore();
  },

  methods: {

    apply() {
      this.$refs.operationAuthModal.closeAuthModal();
      this.params.colDef.headerName = this.headerName;
      this.params.colDef.widthType = this.widthType;
      this.params.colDef.widthPercent = this.widthPercent;
      if (this.widthType === '%') {
        let gridWidth = this.params.grid.$el.offsetWidth;
        this.width = this.params.colDef.width = Math.floor(gridWidth * this.widthPercent / 100);
      } else {
        this.params.colDef.width = this.width < 30 ? 30 : this.width;
      }
      this.$nextTick(() => {
        this.params.columnApi().setColumnWidth(this.params.colDef.colId, this.width, false);
      });
      // 临时清空operationParams
      // for(let _i in this.params.colDef.operationParams){
      //   delete this.params.colDef.operationParams[_i];
      // }
      // this.params.colDef.operationParams = this.params.colDef.operationParams.filter(x=>{
      //   if (x) return x;
      // });

      // this.params.colDef.operationParams.push(this.nowOpr);
      this.params.colDef.operationParams = [];
      if (this.operationParams && this.operationParams.length > 0) {
        this.operationParams.forEach(item => {
          if (item.opr_type && item.opr_path) {
            this.params.colDef.operationParams.push(item);
          }
        })
      }
      this.operationParams = this.params.colDef.operationParams;
      this.sortOpration();
      this.params.colDef.renderType = "operationRender";
      this.params.colDef.lockPinned = this.lockPinned;
      this.params.colDef.pinned = this.params.colDef.lockPinned ? this.pinned : null;
      this.params.colDef.cellRendererFramework = operationRender;
      this.params.colDef.cellRendererParams = this.nowOpr;
      // this.params.colDef.cellRendererParams.compactMode = this.params.getCompactMode();
      let index = this.columnDefs.map(x => x.colId).indexOf(this.params.colDef.colId);
      for (let par in this.params.colDef) {
        if (par) {
          // console.log('apply@OprColCfg', par, this.params.colDef[par]);
          if (par == "cellRendererFramework") this.columnDefs[index]["_cellRendererFramework"] = "operationRender";
          this.columnDefs[index][par] = this.params.colDef[par];
        }
      }
      this.columnDefs[index].lockPinned !== undefined && this.params.column.columnApi.setColumnPinned(this.columnDefs[index].colId, this.columnDefs[index].pinned);
      this.params.reloadGridFilter();
      this.params.api.setColumnDefs(this.columnDefs);
      setTimeout(() => {
        //   if(this.params.args.autoSize){
        //     this.params.column.columnApi.autoSizeColumns(['_oprColumn']);
        //     this.params.api.sizeColumnsToFit();
        //   }
        this.params.setRowData();
      }, 300)
      this.cancel();
    },

    cancel() {
      //  考虑增加destroy接口对其进行销毁
      // this.hidePopup();
      // this.showPanel = false;
    },
    sortOpration() {
      this.buttonSort = [];
      document.querySelectorAll('.opr-button') ? document.querySelectorAll('.opr-button').forEach(item => {
        this.buttonSort = this.buttonSort.concat(this.params.colDef.operationParams.filter(opr => opr.uuid == item.getAttribute('sort')))
      }) : '';
      console.log(this.buttonSort)
      this.params.colDef.operationParams = this.buttonSort;
    },
    drag(e) {
      this.dragButton = e.target;
    },
    drop(e) {
      if (new RegExp('button-panel').test(e.target.classList.value)) {
        e.preventDefault();
        e.target.appendChild(this.dragButton);
      }
    },
    allowDrop(e) {
      e.preventDefault();
    },
    addAButton() {
      let pattern = {
        opr_path: "",
        opr_showMessage: true,
        opr_sys_path: '',
        name: "",
        style: {},
        targetDataType: null,
        type: "primary",
        shape: false,
        icon: "",
        text: "按钮",
        opr_type: null,
        auth: false,
        auth_item: null,
        color: '',
        disabled: false,
        uniLabel: "",
        uuid: uuid(),
      };
      pattern.uniLabel = pattern.text;
      this.nowOpr = pattern;
      this.storeNowOpr();
      this.refreshButtonGroup();
      this.setButtonCfg(null, this.nowOpr.uuid);
      console.log('nowOpr@addAButton', this.nowOpr);
    },

    setButtonCfg(event, uuid) {
      console.log('event@setButtonCfg', event, uuid);
      if (uuid !== this.nowOpr.uuid) {
        this.$refs.BindOperationBar.reset();
      }
      this.$nextTick(() => {
        this.assignToNowOpr(uuid);
      })
      this.operationParams.forEach(x => {
        if (typeof x.style != "object") x.style = {};
        if (x.uuid == uuid) {
          // x.style = "border: 3px dashed red;";
          x.style["border"] = "3px dashed red";
        } else {
          x.style["border"] = "none";
        }
      });
      console.log('nowOpr@setButtonCfg', this.nowOpr);
    },

    newOpr() {
      this.storeNowOpr();
    },

    updateOpr() {
      this.updateNowOpr();
    },

    deleteOpr() {
      let index = this.operationParams.map(x => x.uuid).indexOf(this.nowOpr.uuid);
      if (index < 0) {
        alert("不存在需要删除的操作");
        console.log('operationParams@deleteOpr', this.operationParams);
        return;
      }
      this.operationParams.splice(index, 1);
      if (this.operationParams.length !== 0) {
        this.nowOpr = this.operationParams[0]
      } else {
        this.nowOpr = {
          opr_path: "",
          opr_showMessage: true,
          opr_sys_path: '',
          name: "",
          style: {},
          targetDataType: null,
          type: "primary",
          shape: false,
          icon: "",
          text: "按钮",
          opr_type: null,
          auth: false,
          auth_item: null,
          color: '',
          disabled: false,
          uniLabel: "", // 用于区分不同的操作 初始值为text 但后期自行修改
          uuid: '',
          expression: '',//控制显示隐藏的表达式
        }
      }
      // this.params.colDef.operationParams.splice(index, 1);
      this.refreshButtonGroup();
      console.log('operationParams@deleteOpr', this.operationParams);
    },

    assignToNowOpr(targetLabel) {
      let index = this.operationParams.map(x => x.uuid).indexOf(targetLabel);
      this.nowOpr = this.operationParams[index];
    },

    storeNowOpr() {
      let _duplicate = this.operationParams.map(x => x.uuid).indexOf(this.nowOpr.uuid);
      if (_duplicate > -1) {
        alert("已有同名按钮，请重新命名")
        return;
      }
      let newParam = {};
      for (let par in this.nowOpr) {
        newParam[par] = this.nowOpr[par];
      }
      this.operationParams.push(newParam);
    },

    updateNowOpr() {
      // console.log('params map@updateNowOpr', this.operationParams.map(x=>x.uniLabel));
      let index = this.operationParams.map(x => x.uuid).indexOf(this.nowOpr.uuid);
      if (index < 0) {
        alert("不存在对应操作");
        console.log('operationParams@updateNowOpr', this.operationParams);
        return;
      }
      for (let par in this.nowOpr) {
        this.operationParams[index][par] = this.nowOpr[par];
      }
    },

    refreshButtonGroup() {
      this.reRenderBtnG = false;
      this.reRenderBtnG = true;
    },

    adjustRowHeight(newHeight) {
      this.gridOptions.getRowHeight = function () {
        return newHeight;
      };
      this.params.api.resetRowHeights();
    },

    // async onChangeAuthSwit(state){
    //   if(state){
    //     if(this.nowOpr.auth_item == null){
    //       this.nowOpr.auth_item = await this.getAuthItem();
    //     }
    //   }
    // },

    async getAuthItem() {
      let authItem;
      if (this.nowOpr.opr_type == "sys") {
        authItem = this.nowOpr.opr_path;
      } else if (this.nowOpr.opr_type == "query") {
        let query_opr = (await getQuickOpeById(this.nowOpr.opr_path)).data.data;
        authItem = query_opr.authority;
      }
      return authItem;
    },
    // async onChangeOfSwitch(state){
    //   if(state){
    //     if(this.args.auth_item == null){
    //       this.args.auth_item = await this.getAuthItem();
    //     }
    //   }
    // },
    openAuthDialog() {
      this.$refs.operationAuthModal.initAuthModal();
    },

    handleChangeEventOfOperationBar(event) {
      // 处理无的情况
      let oldText = this.nowOpr.text;
      if (event.conf.opr_type == "none" || event.conf.opr_type == "" || event.conf.opr_path == "") {
        this.self = true;
        this.nowOpr.opr_path = event.conf.opr_path;
        this.nowOpr.text = "按钮";
        this.nowOpr.opr_type = event.conf.opr_type;
        this.nowOpr.auth_item = "";
      }
      // 处理基本操作
      else if (event.conf.opr_type == 'sys') {
        this.nowOpr.opr_path = event.conf.opr_path;
        this.nowOpr.text = this.nowOpr.text === '按钮' ? event.opr_displayName : this.nowOpr.text;
        this.nowOpr.opr_type = "sys";
        this.self = true;
        this.nowOpr.auth_item = event.conf.opr_path;
        this.nowOpr.opr_showMessage = event.conf.opr_showMessage;
        this.nowOpr.opr_sys_path = event.conf.opr_sys_path ? event.conf.opr_sys_path : '';
      } else {
        //修改操作不更换text
        if (this.nowOpr.opr_path === event.conf.opr_path) {
          this.nowOpr.text = this.nowOpr.text === '按钮' ? event.query_opr.displayName : this.nowOpr.text;
        } else {
          this.nowOpr.text = event.query_opr.displayName;
        }
        // 快速查询操作
        this.nowOpr.opr_path = event.conf.opr_path;
        this.nowOpr.opr_type = "query";
        this.nowOpr.auth_item = event.query_opr.authority;
        try {
          if (event.query_opr.oprScript) {
            //如果是前后端脚本统一之后的情况
            if (event.query_opr.action == "implement" && ['addin', 'addinAlias'].includes(event.query_opr.implementType)) {
              let _path = event.query_opr.conditionExpre;
              if (_path.startsWith("addin:")) _path = _path.substring(6, _path.length);
              let _addin = getAddinFunc(_path, "operation");
              let addin = new _addin({
                propsData: {
                  itemValue: this.itemValue,
                  store: this.store
                }
              });
              if (addin.canShow && addin.canShow()) {
                this.self = false;
                for (var j = this.$refs.body.children.length; j > 0; j--) {
                  this.$refs.body.removeChild(this.$refs.body.children[j - 1]);
                }
                this.$refs.body.appendChild(addin.setArgs(this.nowOpr).$mount().$el);
              }
            }else {
              this.self = true;
            }
          } else {
            if (event.query_opr.action == "implement"
              && !event.query_opr.conditionExpre.startsWith("procedure:")
              && !event.query_opr.conditionExpre.startsWith("serverScript:")
              && !event.query_opr.conditionExpre.startsWith("clientScript:")) {
              let _path = event.query_opr.conditionExpre;
              if (_path.startsWith("addin:")) _path = _path.substring(6, _path.length);
              let _addin = getAddinFunc(_path, "operation");
              let addin = new _addin({
                propsData: {
                  itemValue: this.itemValue,
                  store: this.store
                }
              });
              if (addin.canShow && addin.canShow()) {
                this.self = false;
                for (var j = this.$refs.body.children.length; j > 0; j--) {
                  this.$refs.body.removeChild(this.$refs.body.children[j - 1]);
                }
                this.$refs.body.appendChild(addin.setArgs(this.nowOpr).$mount().$el);
              }
            } else {
              this.self = true;
            }
          }
        } catch (e) {
          console.error(e)
        }

        // return;
      }
      if (this.nowOpr.uniLabel == oldText || this.newOpr.uniLabel == "" || this.nowOpr.uniLabel == "按钮") this.nowOpr.uniLabel = this.nowOpr.text;
    },


    callPanel() {
      this.showPanel = true;
    },

    printParams() {

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
      return {value: this.text};
    },

    setModel(model) {
      if (model) {
        this.text = model.value;
      }
    },

    afterGuiAttached(params) {
      this.$nextTick(() => {
        this.hidePopup = params.hidePopup;
        this.columnDefs = this.params.getColumnDefs();
        let colDef = this.params.getColumnDefs().find(col => col.colId === this.params.colDef.colId);
        let gridWidth = this.params.grid.$el.offsetWidth;
        this.width = colDef.width;
        this.widthType = colDef.widthType || 'px';
        this.widthPercent = colDef.widthPercent || Math.floor(this.width * 100 / gridWidth);
        // this.operationParams = this.params.getColumnDefs().find(col => col.field === this.params.colDef.field).operationParams;
        // console.log('params when mount filter', this.params);
        this.operationParams = _.cloneDeep(this.params.colDef.operationParams);
        if (this.operationParams && this.operationParams.length !== 0) {
          this.operationParams.forEach(item => {
            !item.uuid ? item.uuid = uuid() : ''
          })
          if (this.operationParams[0].uuid) {
            this.setButtonCfg(null, this.operationParams[0].uuid);
          } else {
            this.setButtonCfg(null, this.operationParams[0].uniLabel);
          }
        }
        console.log("this@created@OprColCfg", this);
        // this._query_oprs = this.params.getQueryOprs();
        this.showPanel = true;
      })
    },

    componentMethod(message) {
      alert(`Alert from PartialMatchFilterComponent ${message}`);
    },

    setAlign() {
      console.log('realign');
    },

    getColumnDefs() {
      // return this.params.theGrid.args.columnDefs;
      return this.params.api.gridOptionsWrapper.gridOptions.columnDefs;
    },

    async queryEntityAttr() {
      return await this.params.queryEntity(this.refClass);
    },

    getShape(_shape) {
      if (_shape) return "circle";
      else return "true";
    },

  },
  computed: {
    gridOptions() {
      return this.params.api.gridOptionsWrapper.gridOptions;
    },
    // columnDefs(){
    //   return this.params.api.gridOptionsWrapper.gridOptions.columnDefs;
    // },
    allEntities() {
      return this.params.Entities();
    },
    // operationParams(){
    //   return this.params.colDef.operationParams;
    // },
    now_opr_path() {
      return this.nowOpr.opr_path;
    },
    now_opr_type() {
      return this.nowOpr.opr_type;
    },
    now_opr_sys_path() {
      return this.nowOpr.opr_sys_path;
    },
    now_opr_showMessage() {
      return this.nowOpr.opr_showMessage;
    },
  },
  watch: {
    // root_tab(newV, oldV){
    //   console.log('root_tab changed@watch', newV, oldV);
    // },

    "params.root._tab": {
      deep: true,
      handler: function (newV, oldV) {
        console.log('root._tab changed@deepWatch', newV, oldV);
      }
    },

    "nowOpr.color": {
      deep: true,
      handler: function (newV, oldV) {
        console.log('nowOpr.style', this.nowOpr.style, "typeof style", typeof this.nowOpr.style);
        if (typeof this.nowOpr.style != "object") this.nowOpr.style = {};
        this.nowOpr.style["color"] = newV;
        console.log('nowOpr.style after watch', this.nowOpr.style);
      },
    },

    // /**
    //  *@description监听width设置最小值
    //  *@params
    //  *@date 2020/8/12
    //  *@return
    //  */
    // width(val){
    //   this.$nextTick(() => {
    //     this.width = val < 30 ? 30 : this.width;
    //   })
    // }
  },

});

</script>

<style scoped>
p {
  margin-bottom: 8px;
  margin-top: 15px;
}

.margin-p {
  margin-bottom: 8px;
  margin-top: 15px;
}

Button {
  margin-top: 36px;
}

.margin0 {
  margin-top: 0px;
  margin-bottom: 0px;
}

.margin3 {
  margin-top: 20px;
  margin-bottom: 20px;
}

.btng {
  margin: 0px;
}

.btn-margin {
  margin: 0px;
}

.cell-wrap-text {
  white-space: normal !important;
}

.ag-cell {
  white-space: normal !important;
}
</style>

<style>
.grid-opration {
  max-width: 400px;
  text-overflow: ellipsis;
  overflow: hidden;
  white-space: nowrap;
}

/*fix bug 6526*/
.grid-opr .limitSel {
  position: relative;
}
</style>
