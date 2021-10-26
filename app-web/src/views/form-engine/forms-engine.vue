<template>
  <div>
    <layout class="layoutOrign self-form-layout">
      <Row v-show="searchHasApp">
        <Button style="float: right;margin: 5px;" @click.native="turonToApp">返回应用</Button>
      </Row>
      <form
        v-if="reloadFormEngine"
        ref='root'
        :style="{'background-color': form_bgColor}"
        dropTarget="0"
        uuid="000"
        class="org-form self-form"
        onsubmit="return false;"
      >
        <FormAddinList
          v-for="addin in rootJson.data.elements"
          :key="addin.self.uuid"
          :addin="addin"
          v-bind="addinProps"
        >

        </FormAddinList>
      </form>
      <div v-show="showDefOpr" style="margin: 10px;">
        <Button type="primary" :loading="tabLoading" style="min-width: 60px; float:right;" @click="defTabOk" :disabled="unAuthOprTab">
          <span v-if="!tabLoading">{{ defOprText }}</span>
          <span v-else>Loading...</span>
        </Button>
      </div>
      <Spin fix v-if="setSpin" :style="{'background-color': spinBgColor}"></Spin>
    </layout>

    <!-- DIALOG -->
    <div
      v-if="modalIf && modal"
    >
      <Modal ref="modalRef" id="xxxx"
             v-model="modal"
             :transfer="true"
             :width="curDialogWidth" :draggable="curDragFlag" :title="modalTitle" :mask-closable="false" :loading="true"
             @on-visible-change="modalClose"
      >
        <FormEngine :style="{'height': curDialogHeight, 'overflow-y': 'auto'}" ref="form" :to_path="modalPath" :to_query="modalQuery" :store="store" :root="root"
                    @updateText="updateText"
                    @closeDialog="_closeDialog"
        ></FormEngine>
        <div slot="footer">
          <Button v-show="showDialogDefOpr"
                  type="primary"
                  :loading="modalLoading"
                  size="large"
                  :disabled="unAuthOprModal"
                  @click="modalOk">
            <span v-if="!modalLoading">{{ onText }}</span>
            <span v-else>Loading...</span>
          </Button>
        </div>
      </Modal>
    </div>
    <!-- endingDIALOG -->

    <!-- DRAWER -->
    <div
      v-if="drawerIf && drawerModal"
    >
      <Drawer
        :title="modalTitle"
        v-model="drawerModal"
        :width="curDrawerWidth"
        :placement="drawerDirection"
        :mask-closable="false"
        :styles="styles"
        @on-visible-change="drawerClose"
      >
        <FormEngine
          ref="form"
          :root="root"
          :to_path="modalPath"
          :to_query="modalQuery"
          :store="store"
          @updateText="updateText"
          @closeDialog="_closeDialog">
        </FormEngine>
        <div class="oprDrawer-footer">
          <Button type="primary" size="large"
                  :disabled="unAuthOprModal"
                  @click="drawerOk">
            {{ onText }}
          </Button>
        </div>
      </Drawer>
    </div>
    <!-- endingDRAWER -->

    <!-- DIALOG-URL -->
    <div v-if="modalIframeWrapper">
      <Modal v-if="urlIf" ref="urlModal" v-model="modalIframe" :width="curDialogWidth" :title="modalIframeTitle" :mask-closable="false">
        <iframe :src="urlSrc" frameborder="0" width="100%" :style="{'height': curDialogHeight == 'auto' ? '400px' : curDialogHeight}"></iframe>
        <div slot="footer">
          <Button v-show="showDialogDefOpr" type="default" @click="closeUrlModal" >取消</Button>
          <Button v-show="showDialogDefOpr" type="primary" @click="closeUrlModal">确定</Button>
        </div>
      </Modal>
    </div>
    <!-- endingDIALOG-URL -->

    <!-- DRAWER-URL -->
    <Drawer
            :title="modalDrawerIframeTitle"
            v-model="modalDrawerIframe"
            :width="curDrawerWidth"
            :placement="drawerDirection"
            :mask-closable="false"
            :styles="styles"
    >
      <iframe :src="urlSrc" frameborder="0" width="100%" style="height: 100%;"></iframe>
    </Drawer>
    <!-- endingDRAWER-URL -->
  </div>
</template>

<script>

  import { mapGetters, mapActions, mapMutations } from "vuex";
  import { getClass, getView } from '@/api/others';
  import { getAddinFunc } from "@/util/addin.js";
  import { parseEscapeString } from '@/libs/utils.js';
  import axios from "@/libs/axios";
  import Axios from 'axios';
  import global_ from '@/views/global.vue';
  import { Message } from 'view-design';
  import FormEngine from '@/views/form-engine/forms-engine.vue'
  import store from "@/store"
  import { os } from '@/libs/utils'
  import { uuid } from '@/util/assist'
  import { addListener, removeListener, getSockId, getWs } from "@/util/webSocket";
  import { postSub, deleteSub, getEobjSingle, getRobjSingle, postResultSub, deleteResultSub, getQueryOperation, getExecute, getGlobalOperation, getEntitiesOperationsByName, sendMsgToOneSock } from '@/api/others';
  import { checkClasses } from '@/api/auth-model/AuthEngine';
  import { entries as form_entries } from "@/ext_components/form/config.js";
  import _ from 'lodash';

  var echarts = require("echarts");

  const dwf_app_axios = Axios.create({
    baseURL: global_.baseObjOther,
    withCredentials: true
  });

  const serverConfig = global_;

  dwf_app_axios.interceptors.request.use(
    config => {
      config.headers.Authorization = store.state.user.token;
      return config;
    },
    error => {
      return Promise.reject(error);
    }
  )

  export default {
    name: "FormEngine",
    props:{
      to_path:String,
      to_query:Object,
      store:Object,
      root:Object,
      echarts: Object,
      isSingleTab: Boolean
    },
    data() {
      return {
        path : this.to_path ? this.to_path : (this.$route ? this.$route.path : ""),
        query : this.to_query ? this.to_query : (this.$route ? this.$route.query : {query: ''}),
        queryData: {
          query: "", //查询条件
          targetClass: "",
          formName: "",
          uuid: ""
        },
        formBody: {
          align: "left",
          type: "flex",
          justify: "start"
        },
        rootJson: {
          data: {
            elements: []
          }
        },
        previewJson: {},
        styles: {
          height: 'calc(100% - 55px)',
          overflow: 'auto',
          paddingBottom: '53px',
          position: 'static'
        },

        setSpin: false,
        spinBgColor: 'rgba(255, 255, 255, .8)',
        curDragFlag: false,
        curDialogHeight: 'auto',
        curDialogWidth: '720',
        curDrawerWidth: '720',

        treeName: "tree",
        query_opr: null,
        modalIf: false,
        modalLoading: false,
        tabLoading: false,
        modal: true,
        drawerIf: false,
        drawerModal: false,
        drawerDirection: 'right',
        modalTitle: "",
        modalPath: "",
        modalQuery: "",
        addin: null,
        paramData: null,
        oprMap: {},
        onText: "确定",
        isRelation: false,
        relation: null,
        obj: null,
        iHeight: document.body.clientHeight - 300,
        showDefOpr: false,
        showDialogDefOpr: true,
        defOprText: '新增',
        curQueryAction: 'create',      // 当前invoke操作的action
        urlIf: false,
        modalIframe: false,
        modalIframeWrapper: false,
        urlDrawerIf: false,
        modalDrawerIframe: false,
        modalIframeTitle: "",
        modalDrawerIframeTitle: '',
        urlSrc: "",
        flag: false,
        modalCallback: null,
        addinMap: {},
        attributesList: null,
        subId: null,
        subIds: null,
        resultSubId: null,
        wsCommand: null,
        wsId: null,
        extraObj: null,
        util: null,
        msgboxDialog: null,
        form_bgColor: '#f3f3f3',

        searchHasApp: false,
        turnAppName: 'app-web',
        targerAppId: '',
        turnQuery: '',
        turnIndexOpr: '',
        returnValidateValue: true,
        globalScript: null,
        pendingTask: {},
        pendingTaskQueue: [],
        freshStore: false,
        handleQueryDataResult: null,
        unAuthOprModal: false,
        unAuthOprTab: false,
        executeOperationProgress: false,//executeOperation执行中状态
        structuralLayoutAddin: ['TextInput', 'HyperLink', 'NumberInput', 'DateInput', 'CheckBox', 'RadioButton', 'Label', 'Switch', 'SelectInput', 'SingleObjectSelector', 'SingleObjectModal', 'MultiObjectsTag', 'ProgressBar', 'D_Rate', 'Liked', 'icon', 'DynamicParameterFrame', 'MultiFilesList', 'Attachments'], //允许垂直布局的控件，为之前做兼容
        defaultObjsAddin: null,
        basicInfo: '',
        modalJsonData: null,
        byFormEngineOprAddin: null,
        oprProgress: {},
        reloadFormEngine: true,
        noNeedGetValue: ['DynamicDigitalLabel', 'ProgressBar', 'Label'],//不需要getValue向接口传值的控件
        sysEventPath: ['save', 'edit', 'delete', 'saveForm', 'editForm'] //可绑定后处理操作的系统事件
      };
    },
    components: {
      FormEngine,
    },
    created() {
      if (this.store && !this.$store) this.$store = this.store;
      if (this.echarts && !this.$echarts) this.$echarts = this.echarts;
      this.util = {
        batchUpdate: this.batchUpdate,
        generateObjs: this.generateObjs,
        flagEntityDelete: this.flagEntityDelete,
        flagRelationDelete: this.flagRelationDelete,
      }
      this.msgboxDialog = {
        confirm: (title, content, resolve, reject) => {
          this.$Modal.confirm({
            title: title,
            content: `<p>${content}</p>`,
            okText: "确认",
            cancelText: "取消",
            onOk: () => {
              resolve()
            },
            onCancel: () => {
              reject()
            }
          })
        },
        // this.msgboxDialog.confirm('删除', '是否确认删除').then(() => {
        //   console.log('确认删除')
        // }).catch(() => {
        //   console.log('取消删除')
        // })
        // confirm: (title, content) => {
        //   return new Promise((resolve, reject) => {
        //     this.$Modal.confirm({
        //       title: title,
        //       content: `<p>${content}</p>`,
        //       okText: "确认",
        //       cancelText: "取消",
        //       onOk: () => {
        //         resolve()
        //       },
        //       onCancel: () => {
        //         reject()
        //       }
        //     })
        //   })
        // }
      }

      let searchStr = window.location.search;
      if(searchStr != '') {
        searchStr = searchStr.slice(1);
        let searchObj = {};
        let searchArr = searchStr.split('&');
        searchArr.forEach(val => {

          let sKey = val.split('=')[0];
          let sVal = val.split('=')[1];
          searchObj[sKey] = sVal;

        })

        if('appName' in searchObj && 'appId' in searchObj) {
          this.searchHasApp = true;
          this.targerAppId = searchObj.appId;
          let targetName = searchObj.appName;
          if(targetName == 'default') {
            this.turnAppName = 'app-web'
          } else {
            this.turnAppName = `app-web/${targetName}`
          }
        } else {
          this.searchHasApp = false;
        }

        if('query' in searchObj) {
          // let transQuery = searchObj.query.replace(/%20/g, ' ');
          // transQuery = transQuery.replace(/%26/g, '&');
          // transQuery = transQuery.replace(/%3E/g, '=');
          // transQuery = transQuery.replace(/%3F/g, '?');
          // transQuery = transQuery.replace(/%25/g, '%');
          this.turnQuery = decodeURIComponent(searchObj.query);
          console.log(this.turnQuery)
        }
        if('indexOpr' in searchObj) {
          this.turnIndexOpr = searchObj.indexOpr;
        }
      }
    },

    // 销毁钩子,销毁所有表单控件
    beforeDestroy() {
      this.destroySub();
      if (this.rootJson && this.rootJson.data) {
        this.destroyAllCompSub(this.rootJson.data);
        this.destroyJsonData(this.rootJson.data);
      }
    },

    async mounted() {
      await this.handle();
      let that = this;
      window.onbeforeunload = function() {
        console.log("fresh", that.subId);
        that.destroySub();
        return null;
      }
    },

    methods: {

      addExtraObj(item, obj) {
        if (!item) {
          if (this.rootJson && this.rootJson.data) item = this.rootJson.data;
          else return;
        }
        if (!("extraObj" in item)) item.extraObj = {};
        for (var i in obj) item.extraObj[i] = obj[i];
      },

      turnToModeler(targetClass, viewName) {
        let proto = window.location.protocol;
        let host = window.location.host;
        host = host.replace("8081", "8080");
        let a = document.createElement('a');
        let url = `${proto}//${host}/modeler-web/forms/${targetClass}/${viewName}?token=${this.$store.state.user.token}`;
        a.href = url;
        a.target = '_blank';
        a.click();
      },

      turonToApp() {

        let proto = window.location.protocol;
        let host = window.location.host;
        // host = host.replace("8081", "8080");
        localStorage.setItem('changeAppId', this.targerAppId);
        sessionStorage.removeItem('token');
        localStorage.removeItem('uToken');
        sessionStorage.setItem('searchQuery', '');
        sessionStorage.setItem('searchIndexOpr', this.turnIndexOpr);

        if(this.turnAppName == 'app-web') {
          sessionStorage.setItem('appName', 'app-web');
          localStorage.setItem('changeAppName', 'app-web');
          localStorage.setItem('refshFlag', 7);
        } else {
          let aftName = this.turnAppName.split('/')[1];
          sessionStorage.setItem('appName', aftName);
          localStorage.setItem('changeAppName', aftName);
          localStorage.setItem('refshFlag', 7);
        }

        let a = document.createElement('a');
        let url = `${proto}//${host}/${this.turnAppName}/login`;
        a.href = url;
        a.target = '_self';
        a.click();

      },

      // 更新弹框确认按钮
      async updateText(text, className) {
        this.$nextTick(async () => {
          if (!text || text == "") text = "确定";
          this.onText = text;
          let authName = '';
          if(text == '新增' || text == '级联创建'){
            authName = 'CreateObjects'
          }else if(text == '修改'){
            authName = 'EditObjects'
          }
          if(!authName) {
            this.unAuthOprModal = false;
            return;
          }
          try {
            let auth = await checkClasses(authName, className);
            if(!auth.data) {
              this.unAuthOprModal = true;
            }else{
              this.unAuthOprModal = false;
            }
          }catch (e) {
            console.log(`弹窗/滑窗操作权限${e}`)
          }
        })
      },


      // 销毁表单控件
      destroyJsonData(item) {
        if (item.obj) { item.obj.$destroy(); delete item.obj; };
        if (item.elements) {
          item.elements.forEach(x => this.destroyJsonData(x));
        }
      },

      // 默认操作(表单弹窗的确认事件)-事件emit
      modalOkEventEmit(params, res) {
        let className = params.data.targetClass;
        let isRelation = params.data.isRelation;
        if(this.$refs.form && this.$refs.form.query && this.$refs.form.query.params && (this.$refs.form.query.params.opr_path === 'next_create' || res.tobeOid)){
          this.generateNextCreate(res, className, isRelation);
        }
        this.$nextTick(() => {
          params.oidList && res && this.AllMultiCompFresh(this.rootJson.data, params, res);
        })
      },

      modalOkResEmit(res){
        this.$nextTick(() => {
          res && this.firstMultiCompFresh(this.rootJson.data, res, this.curQueryAction)
        })
      },
      //关闭url弹窗
      closeUrlModal(){
        this.modalIframeWrapper = false;
        this.modalIframe = false;
        this.url = false;

        // this.closeDialog();
      },

      // 默认操作(表单弹窗的确认事件)
      async modalOk() {
        this.modalLoading = true;
        let jsonData = this.modalJsonData ? this.modalJsonData : this.rootJson;
        let res = await this.$refs.form.confirm(jsonData, this.byFormEngineOprAddin);
        this.closeDialog(res);
      },

      openDialog(obj){
        if(this.modalIf && this.modal) return;
        if (obj) {
          if (obj.query) this.modalQuery.params.query = obj.query;
          if (obj.obj) this.modalQuery.params._obj = obj.obj;
          if (obj.data) this.modalQuery.params.data = obj.data;
          if (obj.url) this.modalQuery.params.condition = obj.url;
          if (obj.displayType) this.modalQuery.params.displayType = obj.displayType;
        }
        if (this.modalIf && this.$refs.form || this.drawerIf && this.$refs.form) {
          this.$refs.form.handle(this.modalPath, this.modalQuery);
        }
        this.drawerIf = false;
        this.drawerModal = false;
        this.modalIf = true;
        this.modal = true;
      },

      closeDialog(res){
        this.modalLoading = false;
        //nextcreate触发值判重
        try {
          if(this.$refs.form.rootJson && this.$refs.form.rootJson.opr_path === 'next_create'){
            let tmp = this.GetObj(this.$refs.form.rootJson.data, true);
            if (!tmp[1]) return null;
          }
        }catch (e) {

        }
        if (res) {
          this.destroySub();
          this.modal = false;
          this.modalJsonData = null;
          this.byFormEngineOprAddin = null;
          res !== 'visit' ? this.modalOkEventEmit(this.$refs.form.rootJson, res) : '';
          // this.modalOkResEmit(res);
          return res;
        }
      },

      /**
       *  closeDialog脚本的处理方法
       */
      _closeDialog(query, res){
        if (query.params && query.params.endScript && query.params.endScript.length > 0) {
          let params = {};
          params.confirmData = res;
          params.openForm = (targetClass, viewName, args, displayType, initParams) => {
            args ? args.displayType = displayType : args = {}, args.displayType = displayType;
            return this.openForm(this.rootJson, params, targetClass, viewName, args, initParams)
          };
          params.openDrawer = (targetClass, viewName, direction, args, displayType, initParams) => {
            args ? args.displayType = displayType : args = {}, args.displayType = displayType;
            return this.openForm(this.rootJson, params, targetClass, viewName, args, initParams, direction)
          };
          params.openTab = (queryOpr, args) => { return that.openTab(this.rootJson, params, queryOpr, args) };
          this.handleScript(query.params.endScript, params, this.$store, this.rootJson);
        }
        if (this.modalCallback) {
          this.modalCallback.func(res, this.modalCallback.params);
        }
        this.modalLoading = false;
        if (res) {
          this.destroySub();
          this.modal = false;
          res !== 'visit' ? this.modalOkEventEmit(this.$refs.form.rootJson, res) : '';
          // this.modalOkResEmit(res);
          return res;
        }
      },
      //弹窗状态
      modalClose(val){
        if(!val){
          this.destroyAllCompSub(this.$refs.form.rootJson.data)
        }
      },
      modalCancel(){
        this.modal = false;
        let that = this
        // setTimeout(() => {
        //   that.modalIf = false;
        // }, 2000)
      },
      //抽屉状态
      drawerClose(val){
        if(!val){
          this.destroyAllCompSub(this.$refs.form.rootJson.data)
        }
      },
      // 全局遮罩动画
      spinShow(spinType) {
        if(!spinType) spinType = 'light';
        if(spinType == 'light') {
          this.spinBgColor = 'rgba(255, 255, 255, .8)';
        } else {
          this.spinBgColor = 'rgba(0, 0, 0, .8)';
        }
        this.setSpin = true;
      },

      spinHide() {
        this.setSpin = false;
      },


      /**
       * @jsonData
       * @params
       * @queryOpr操作相关参数
       * @queryOpr.targetClass 打开的目标类
       * @queryOpr.viewName 打开的目标表单名
       * @queryOpr.action 打开的目标表单类型
       * @queryOpr.authority 打开页签操作英文名
       * @queryOpr.displayName 打开页签操作中文名
       * @args 打开表单参数包括 displayType, params, query
       *
       * @args.displayType 目标表单displayType
       * @args.params 表单初始化信息
       * @args.query 表单查询条件
       */
      async openTab(jsonData, params, queryOpr, args){
        let query_opr = {
          action: "",
          authority: "",
          conType: "tab",
          conditionExpre: "",
          displayName: "",
          params: "",
          targetClass: "",
          viewName: "",
          viewTitle: "",
          viewType: "",
        }
        let query = {
          displayType: "create",
          params: {
            endScript: "",
            initScript: "",
            opr_name: "新增",
            opr_path: "save",
            opr_type: "sys"
          },
          query: "",
        }
        if(!args) args = {};
        query.displayType = args.displayType ? args.displayType : "visit";
        if(query.displayType == 'create'){
          query.params.opr_path = "save";
          query.params.opr_type = "sys";
          query.params.opr_name = "新增";
        }else if(query.displayType == "edit"){
          query.params.opr_path = "edit";
          query.params.opr_type = "sys";
          query.params.opr_name = "修改";
        }else if(query.displayType == "visit"){
          query.params.opr_path = "";
          query.params.opr_type = "";
          query.params.opr_name = "确定";
        }
        if (args.condition) args.conditionExpre = args.condition;
        if (args.conditionExpre && args.conditionExpre.length > 0) {
          query.query = args.conditionExpre;
        }
        //添加脚本conditionExpre支持
        if (queryOpr.conditionExpre && queryOpr.conditionExpre.length > 0) {
          query.query = queryOpr.conditionExpre;
        }
        let show = true;
        if (args.initScript) {
          if (args.endScript){
            args.params = `APP_beforeScript:${args.initScript}APP_afterScript:${args.endScript}`;
          } else{
            args.params = args.initScript;
          }
        }
        if (args.params && args.params.length > 0) {
          let _params = args.params.split('APP_afterScript:');
          query.endScript = _params.length > 0 ? _params[1] : '';
          _params = _params[0].replace("APP_beforeScript:", "");
          let _obj = await this.handleScript(_params, params, this.store, jsonData);
          if (_obj) {
            if (_obj.query) query.query = _obj.query;
            if (_obj.obj) query.obj = _obj.obj;
            if (_obj.data) query.data = _obj.data;
            if ("show" in _obj) show = _obj.show;
            if (_obj.displayType) query.displayType = _obj.displayType;
          }
        }
        Object.assign(query_opr, queryOpr);
        this.root.openTab(query_opr, query);
        this.setPendingTaskQueue(query_opr, query);
      },

      // 默认操作Tab
      async defTabOk() {
        console.log(this.$refs.root, this.rootJson)
        this.tabLoading = true;
        let res = await this.confirm(this.rootJson);
        this.tabLoading = false;
        if (res) {
          this.destroySub();
          this.root.activePendingTaskQueue(this.root.tab, res);
          //FIXME tab页签不会有form
          if(this.$refs.form){
            this.modalOkEventEmit(this.$refs.form.rootJson, res);
          }
          // this.modalOkResEmit(res);
        }
      },

      async drawerOk() {
        let res = await this.$refs.form.confirm(this.rootJson);
        if (res) {
          this.destroySub();
          this.drawerModal = false;
          this.modalOkEventEmit(this.$refs.form.rootJson, res);
          // this.modalOkResEmit(res);
        }
      },
      //生成nextcrete对象
      generateNextCreate(res, targetClass, isRelation){
        if(Object.prototype.toString.call(res) === "[object Object]" && !('oid' in res) && !('relation_oid' in res)){
          if('nextCreateOid' in res){
            this.rootJson.data.next_create.forEach(item => {
              if(item.nextCreateOid === res.nextCreateOid){
                for(let i in res){
                  item[i] = res[i];
                }
              }
            })
          }else{
            res.nextCreateOid = uuid();
            res.tobeOid = `_tobe:${res.nextCreateOid}`;
            res.nextCreateClassName = targetClass;
            res.tobeClassName = targetClass;
            res.isRelation = isRelation;
            if(isRelation){
              //补全tobeOid
              !('relation_leftOid' in res) ? res.relation_leftOid = `_tobe:${uuid()}` : '';
              !('relation_rightOid' in res) ? res.relation_rightOid = `_tobe:${uuid()}` : '';
            }
            this.rootJson.data.next_create ? '' : this.rootJson.data.next_create = [];
            this.rootJson.data.next_create.push(res);
          }
        }
      },
      //生成nextcrete对象，关联类之后与generateNextCreate整合
      _generateNextCreate(){
        this.rootJson.data.next_create ? '' : this.rootJson.data.next_create = [];
        //create表单
        if(!('oid' in this.rootJson.data.origin) && !('relation_oid' in this.rootJson.data.origin) && !('tobeOid' in this.rootJson.data)){
          this.rootJson.data.tobeOid = this.rootJson.data.origin.oid = `_tobe:${uuid()}`;
        }else if(('oid' in this.rootJson.data.origin) && !('tobeOid' in this.rootJson.data)){
          this.rootJson.data.tobeOid = this.rootJson.data.origin.oid;
        }else if(('relation_oid' in this.rootJson.data.origin) && !('tobeOid' in this.rootJson.data)){
          this.rootJson.data.tobeOid = this.rootJson.data.origin.relation_oid;
        }
        this.rootJson.data.tobeClassName = this.rootJson.data.targetClass;
      },
      //扁平化nextcreate对象
      flattenNextCreate(obj, action = 'create'){
        let resolve = [];
        if(obj._next_create && obj._next_create.length !== 0){
          for(let item of obj._next_create){
            let objPart = {};
            objPart.className = item.nextCreateClassName;
            delete item.nextCreateClassName;
            delete item.nextCreateOid;
            objPart.objs = item;
            resolve.push(objPart);
          };
          // let className = obj._next_create.nextCreateClassName;
          // let _next_create = obj._next_create;
          // if ('_next_create' in obj) {
          //   delete obj._next_create.nextCreateClassName;
          //   delete obj._next_create;
          //   resolve.push(objPart);
          // }
          // if(_next_create) {
          //   let res = this.flattenNextCreate(_next_create);
          //   if(res) resolve = resolve.concat(res);
          // }
          if(resolve.length !== 0){
            return resolve;
          }
        }
      },
      //装配nextCreateObject方法之后与flattenNextCreate整合
      _generateNextCreateObjects(objs) {
        if (!objs) return null;
        let rootElement = {
          className: objs.tobeClassName,
          objs: [],
        }
        let parentObj = {};
        let uselessKey = ['_next_create', 'isRelation', 'tobeClassName'];
        for (let obj in objs) {
          if (uselessKey.includes(obj)) {

          } else if (obj === 'tobeOid') {
            objs.isRelation ? parentObj.relation_oid = objs[obj] : parentObj.oid = objs[obj];
          } else {
            parentObj[obj] = objs[obj];
          }
          parentObj._nextCreate = [];
        }
        rootElement.objs.push(parentObj);
        if(objs._next_create && objs._next_create.length !== 0){
          objs._next_create.forEach(nextObj => {
            let childrenObj = this._generateNextCreateObjects(nextObj);
            childrenObj ? parentObj._nextCreate = parentObj._nextCreate.concat(childrenObj) : '';
          })
        }
        return [rootElement]
      },

      //处理nextcreate操作
      resolveNextCreate(opr, obj){
        if(obj && 'nextCreateOid' in obj){
          let next_create;
          switch (opr) {
            case 'delete':
              let index;
              next_create = this.rootJson.data.next_create ? this.rootJson.data.next_create : this.rootJson.data.origin;
              index = next_create.findIndex(item => item.nextCreateOid === obj.nextCreateOid);
              next_create.splice(index, 1);
              return true;
              break;
            case 'edit':
              next_create = this.rootJson.data.next_create ? this.rootJson.data.next_create : this.rootJson.data.origin;
              for(let i in next_create){
                if(/\%ref\%/g.test(i)){
                  delete next_create[i];
                  continue;
                }
                next_create[i] = obj[i];
              }
              return next_create;
              break;
            default:
              return false;
              break;
          }
        }else{
          return false;
        }
      },

      //清空rootJson中nextCreate对象与tobe相关属性
      clearNextCreate(obj){
        if(obj.next_create) delete obj.next_create;
        if(obj.tobeOid) delete obj.tobeOid;
        if(obj.tobeClassName) delete obj.tobeClassName;

        let multis = this.getMultiObjComp(this.rootJson.data);
        for(let multi of multis){
          multi.clearNextCreate ? multi.clearNextCreate() : '';
        }
      },

      collMenu() {

        if(this.rootJson && this.rootJson.data) {

          let visualCharts = [
            "addin_EchartBar",
            "addin_EChart",
            "addin_ScatterChart",
            "addin_PieChart",
            "addin_MapChart",
            "addin_MapCityChart",
            "addin_GaugeChart",
            "addin_TimeSeriesCharts",
            "addin_TimeSeriesBoard"
          ];
          this.rootJson.data.elements.forEach(val => {
            if(visualCharts.indexOf(val.self.elementType) >= 0) {

              setTimeout(function() {
                let eleW = document.getElementsByClassName('echart-bar');
                for(var i = 0; i < eleW.length; i++){
                  var myChart = echarts.getInstanceByDom(eleW[i]);
                  myChart.resize();
                }

              }, 200);
              return;

            }
          })

        }

      },

      activate() {
        if(this.rootJson && this.rootJson.data) {
          this.createSub();
          this.createListener();
          this.rootJson.data.elements.forEach(val => {
            if(val.self.elementType == 'addin_EchartBar' || val.self.elementType == 'addin_ScatterChart' || val.self.elementType == 'addin_GaugeChart') {

              setTimeout(function() {

                let eleW = document.getElementsByClassName('echart-bar');
                for(var i = 0; i < eleW.length; i++){
                  var myChart = echarts.getInstanceByDom(eleW[i]);
                  myChart.resize();
                }

              }, 100);
              return;

            }
          })
        }
        this.$nextTick(() => {
          this.executePendingTaskQueue();
        })
      },

      /**
      *@description执行后处理任务
      *@params
      *@date 2020/9/16
      *@return
      */
      executePendingTaskQueue(){
        //未处理任务
        let task = this.root ? this.root.executePendingTaskQueue(this.root.tab) : null;
        // 执行后处理脚本
        if(!task) return
        try {
          if (task.params.params && task.params.params.endScript && task.params.params.endScript.length > 0) {
            let params = {};
            params.confirmData = task.response;
            params.openForm = (targetClass, viewName, args, displayType, initParams) => {
              args ? args.displayType = displayType : args = {}, args.displayType = displayType;
              return this.openForm(this.rootJson, params, targetClass, viewName, args, initParams)
            };
            params.openDrawer = (targetClass, viewName, direction, args, displayType, initParams) => {
              args ? args.displayType = displayType : args = {}, args.displayType = displayType;
              return this.openForm(this.rootJson, params, targetClass, viewName, args, initParams, direction)
            };
            params.openTab = (queryOpr, args) => { return that.openTab(this.rootJson, params, queryOpr, args) };
            params.operationObj = task.params.params.operationObj;
            params.operationObj.scriptType = 'appAfter';
            this.handleScript(task.params.params.endScript, params, this.$store, this.rootJson);
          }
        }catch (e) {
          console.log(`tab后处理脚本执行${e}`)
        }
      },

      beforeLeave() {
        this.destroySub();
        this.destroyListener();
      },

      createListener() {
        this.destroyListener();
        if(!this.isRelation){
          this.wsCommand = "objects command " + this.queryData.targetClass + " " + this.queryData.uuid;
          this.wsId = addListener(this.wsCommand, (data) => {
            this.addEntityObj({
              className: this.queryData.targetClass,
              obj: data.data,
            })
            if('lastModifyTime' in data.data && 'lastModifyTime' in this.rootJson.data.origin) this.rootJson.data.origin.lastModifyTime = data.data.lastModifyTime;
            if('lastModifier' in data.data && 'lastModifier' in this.rootJson.data.origin)  this.rootJson.data.origin.lastModifier = data.data.lastModifier;
            for (var name in this.addinMap) {
              if (name == "oid") continue;
              this.addinMap[name].forEach(x => {
                if (x.args.dynamic) {
                  if((name in data.data)){
                    x.onDynamic(data.data[name]);
                  }else{
                    x.onDynamic(null);
                  }
                }
              })
            }
          });
        }else{
          this.wsId = {};
          this.wsCommand = {};
          let relationData = [
            {
              className: this.queryData.leftClass,
              oid: this.rootJson.data.origin.relation_leftOid,
              type: 'left_',
            },
            {
              className: this.queryData.relationClass,
              oid: this.rootJson.data.origin.relation_oid,
              type: 'relation_',
            },
            {
              className: this.queryData.rightClass,
              oid: this.rootJson.data.origin.relation_rightOid,
              type: 'right_',
            },
          ]
          relationData.forEach((item, index) => {
            this.wsCommand[item.className] = "objects command " + item.className + " " + item.oid;
            this.wsId[item.className] = addListener(this.wsCommand[item.className], async (data) => {
              console.log(data.data, index)
              // if(item.className === this.queryData.relationClass){
              //   this.addRelationChild({
              //     newChildName: item.className,
              //     newChild: data.data,
              //   })
              // }else{
              //   this.addEntityObj({
              //     className: item.className,
              //     obj: data.data,
              //   })
              // }
              console.log(this.addinMap)
              // if('lastModifyTime' in data.data && 'lastModifyTime' in this.rootJson.data.origin) this.rootJson.data.origin.lastModifyTime = data.data.lastModifyTime;
              // if('lastModifier' in data.data && 'lastModifier' in this.rootJson.data.origin)  this.rootJson.data.origin.lastModifier = data.data.lastModifier;
              for (var name in this.addinMap) {
                if (['left_oid', 'relation_leftOid', 'right_oid', 'relation_rightOid', 'relation_oid'].includes(name)) continue;
                this.addinMap[name].forEach(x => {
                  if (x.args.dynamic) {
                    let keyName = name.replace(item.type, '');
                    if((keyName in data.data)){
                      x.onDynamic(data.data[keyName]);
                    }
                    // else{
                    //   x.onDynamic(null);
                    // }
                  }
                })
              }
            })
          });
        }
      },

      destroyListener() {
        if (this.wsId && typeof this.wsId != 'string' && this._relation) {
          removeListener(this.wsCommand[this._relation.leftClass], this.wsId[this._relation.leftClass]);
          removeListener(this.wsCommand[this._relation.className], this.wsId[this._relation.className]);
          removeListener(this.wsCommand[this._relation.rightClass], this.wsId[this._relation.rightClass]);
          this.wsId = null;
        }else{
          removeListener(this.wsCommand, this.wsId);
          this.wsId = null;
        }
      },

      createSub() {
        this.destroySub();
        let sockId = getSockId();
        if (sockId) {
          if(!this.isRelation){
            this.subId = uuid();
            postSub([
              {
                className: this.queryData.targetClass,
                eventType: "OBJ_UPDATE",
                oids: [this.queryData.uuid],
                subscribers: [{
                  subScriberType: "SPECIFIC_CONNECTION",
                  connectId: getSockId(),
                }],
                subscriptionId: this.subId
              }
            ]);
          }else {

            let relationData = [
              {
                className: this.queryData.leftClass,
                oid: this.rootJson.data.origin.relation_leftOid,
              },
              {
                className: this.queryData.relationClass,
                oid: this.rootJson.data.origin.relation_oid,
              },
              {
                className: this.queryData.rightClass,
                oid: this.rootJson.data.origin.relation_rightOid,
              },
            ]
            this.subIds = [];
            relationData.forEach((item, index) => {
              let subId = uuid();
              this.subIds.push(subId);
              postSub([
                {
                  className: item.className,
                  eventType: "OBJ_UPDATE",
                  oids: [item.oid],
                  subscribers: [{
                    subScriberType: "SPECIFIC_CONNECTION",
                    connectId: getSockId(),
                  }],
                  subscriptionId: subId
                }
              ]);
            })
          }
        }
      },

      destroySub() {
        if (this.subId) {
          deleteSub([this.subId]);
          this.subId = null;
        }else if(this.subIds){
          deleteSub([...this.subIds]);
          this.subIds = null;
        }
      },

      createResultSub(query) {
        this.destroyResultSub();
        let sockId = getSockId();
        if (sockId) {
          this.resultSubId = uuid();
          postResultSub([
            {
              className: this.queryData.targetClass,
              connId: getSockId(),
              queryObjReq: query,
              refreshInterval: 1000,
              subscriptionId: this.resultSubId
            }
          ]);
        }
      },

      destroyResultSub() {
        if (this.resultSubId) {
          deleteResultSub([this.resultSubId]);
          this.resultSubId = null;
        }
      },

      handlePendingTask(){
        for(let task in this.pendingTask){
          if(task == 'freshMultiAddinId'){
            let addin = this.GetAddinById(this.rootJson.data, this.pendingTask.freshMultiAddinId);
            addin ? addin.freshData() : '';
          }
        }
      },

      /*
       打开新的表单弹窗
       jsonData: 母表单的jsonData
       params: 脚本里的注入参数
       targetClass: 目标类
       viewName: 表单名
       args: 快速查询操作参数,格式为{ condition: , initScript: , endScript: , params: },
       initParams: 初始化数据
       direction: 区分抽屉表单与dialog
        分别表示查询语句,前处理脚本,后处理脚本,params为两个脚本拼接而成,即`APP_beforeScript:${initScript}APP_afterScript:${endScript}`
       */

      async openForm(jsonData, params, targetClass, viewName, args, initParams,  direction) {
        if (!args) args = {};
        this.modalPath = `/forms/${targetClass}/${viewName}`
        this.modalQuery = {query: ''};
        try {
          let addins = this.GetAllAddin(jsonData.data);
          var _selected = null;
          for (var i = 0;i < addins.length;i++) {
            if (addins[i].getSelected) {
              let objs = addins[i].getSelected();
              if (objs && objs.length > 0) {
                let _class = addins[i].getAttrMap();
                if(_class[_class.length-1].className == targetClass){
                // if (_class.length == 1 && _class[0].className == targetClass) {
                  _selected = objs;
                  break;
                }
              }
            }
          }
          if (_selected) {
            params.selectedObjs = _selected;
            if ("oid" in _selected[0]) {
              this.modalQuery.query = `and plt_oid='${_selected[0].oid}'`
            } else if("relation_oid" in _selected[0] && "left_oid" in _selected[0] && "right_oid" in _selected[0]) {
              this.modalQuery.query = `and relationclass.plt_oid='${_selected[0].relation_oid}'`;
            } else if("left_oid" in _selected[0] && !("right_oid" in _selected[0]) && !("relation_oid" in _selected[0])){
              this.modalQuery.query = `and plt_oid='${_selected[0].left_oid}'`;
            } else if("right_oid" in _selected[0] && !("left_oid" in _selected[0]) && !("relation_oid" in _selected[0])){
              this.modalQuery.query = `and plt_oid='${_selected[0].right_oid}'`;
            } else if("plt_oid" in _selected[0]){
              this.modalQuery.query = `and plt_oid='${_selected[0].plt_oid}'`;
            }
          }
        } catch (e) {
          // console.log(e);
        }
        this.modalQuery.displayType = args.displayType ? args.displayType : "visit";
        if (args.condition) args.conditionExpre = args.condition;
        if (args.conditionExpre && args.conditionExpre.length > 0) {
          this.modalQuery.query = args.conditionExpre;
        }
        let show = true;
        if (args.initScript) {
          if (args.endScript) args.params = `APP_beforeScript:${args.initScript}APP_afterScript:${args.endScript}`;
          else args.params = args.initScript;
        }
        if(initParams){
          if (initParams.query) this.modalQuery.query = initParams.query;
          if (initParams.obj) this.modalQuery.obj = initParams.obj;
          if (initParams.data) this.modalQuery.data = initParams.data;
        }
        if (args.params && args.params.length > 0) {
          let _params = args.params.split('APP_afterScript:');
          this.modalQuery.endScript = _params.length > 0 ? _params[1] : '';
          _params = _params[0].replace("APP_beforeScript:", "");
          let _obj = await this.handleScript(_params, params, this.store, jsonData);
          if (_obj) {
            if (_obj.query) this.modalQuery.query = _obj.query;
            if (_obj.obj) this.modalQuery.obj = _obj.obj;
            if (_obj.data) this.modalQuery.data = _obj.data;
            if ("show" in _obj) show = _obj.show;
            if (_obj.displayType) this.modalQuery.displayType = _obj.displayType;
          }
        }
        this.modalQuery.params = {};
        if(this.modalQuery.displayType == 'create'){
          this.modalQuery.params.opr_path = "save";
          this.modalQuery.params.opr_type = "sys";
          this.modalQuery.params.opr_name = "新增";
        }else if(this.modalQuery.displayType == 'createForm'){
          this.modalQuery.params.opr_path = "saveForm";
          this.modalQuery.params.opr_type = "sys";
          this.modalQuery.params.opr_name = "新增";
        }else if(this.modalQuery.displayType == "edit"){
          this.modalQuery.params.opr_path = "edit";
          this.modalQuery.params.opr_type = "sys";
          this.modalQuery.params.opr_name = "修改";
        }else if(this.modalQuery.displayType == "editForm"){
          this.modalQuery.params.opr_path = "editF";
          this.modalQuery.params.opr_type = "sys";
          this.modalQuery.params.opr_name = "修改";
        }
        this.curDialogWidth = args.curDialogWidth || '80%';
        this.curDialogHeight = args.curDialogHeight ? args.curDialogHeight.replace('%', 'vh') || 'auto' : 'auto';
        this.curDrawerWidth = args.curDrawerWidth || '720';
        this.modalTitle = args.displayName ? args.displayName : "表单";
        if (show) {
          if (this.modalIf && this.$refs.form || this.drawerIf && this.$refs.form) {
            this.$refs.form.handle(this.modalPath, this.modalQuery);
          }
          if(!direction){
              this.drawerIf = false;
              this.drawerModal = false;
              this.modalIf = true;
              this.modal = true;
          } else if(direction == "left") {
            this.modalIf = false;
            this.modal = false;
            this.drawerDirection = 'left';
            this.drawerIf = true;
            this.drawerModal = true;

          } else if(direction == "right") {
            this.modalIf = false;
            this.modal = false;
            this.drawerDirection = 'right';
            this.drawerIf = true;
            this.drawerModal = true;
          }
        }
      },

      sleep(ms) {
        return new Promise((resolve) => setTimeout(resolve, ms));
      },

      /*
        快速查询操作调用
        opr_type, opr_path: 快速查询操作id/excuteOperation方式调用的参数对象
        jsonData: 快速查询操作生效的目标表单
        store: store对象
        queryData: 查询条件 （默认为null）
        param: 操作传入参数 （默认为null）
        callback: invokeOperation回调函数（默认为null）
        multiObjParams: 表格等多对象控件参数（默认已设置）
        triggerAddinId: invokeOperation触发控件id（默认已设置）
       */
      async invokeOperation(opr_type, opr_path, jsonData, store, queryData, param, callback, multiObjParams, triggerAddinId, originJsonData) {
        if (opr_type == "none" || opr_type == "" || opr_path == "") {
          return
        }
        if(this.basicInfo.defaultMultiAddin && !this.defaultObjsAddin){
          this.defaultObjsAddin = this.getAddinById(this.basicInfo.defaultMultiAddin);
        }
        //增加操作事务标识，防止多次调用单操作
        let oprProgressId = 'custom';
        if(typeof opr_path === 'string'){
          oprProgressId = opr_path;
        }else if(typeof opr_path !== 'string' && opr_path.oid){
          oprProgressId = opr_path.oid;
        }
        if(triggerAddinId && triggerAddinId.args && triggerAddinId.args.id){
          oprProgressId = `${triggerAddinId.args.id}${oprProgressId}`
        }
        if(this.oprProgress[oprProgressId]) return;
        this.oprProgress[oprProgressId] = true;
        param = null || param;
        let that = this;
        let res = null;
        let _res = true;
        if (!jsonData) jsonData = this.rootJson;
        if (!store) store = this.$store;
        if (!queryData) queryData = this.queryData;
        let query_opr = null;
        if(typeof opr_path !== 'string' && !opr_path.oid){
          //excuteOperation方式调用自定operation
          query_opr = {
            action: opr_path.displayType,
            targetClass: opr_path.targetClass,
            authority: opr_path.oprName,
            viewName: opr_path.viewName,
            displayName: opr_path.displayName,
            conType: opr_path.oprStyle,
            curDialogWidth: opr_path.curDialogWidth,
            curDialogHeight: opr_path.curDialogHeight,
            curDrawerWidth: opr_path.curDrawerWidth,
            conditionExpre: opr_path.conditionExpre,
            oprScript: opr_path.oprScript,
            implementType: opr_path.implementType,
            viewType: "{\"needPopTitle\":false,\"popTitleTxt\":\"提示\",\"popTitleFs\":14,\"popTitleColor\":\"#333\",\"tipPlacement\":\"right\",\"popWidth\":400,\"dialogWidth\":80,\"dialogWidthType\":\"%\",\"dialogAutoHeight\":true,\"dialogHeight\":400,\"dialogHeightType\":\"px\",\"drawerWidth\":720,\"drawerWidthType\":\"px\"}",
            viewTitle: "",
            extSettings: "{\"needDefaultOpr\":" + opr_path.displayOperation + ",\"needDialogDefaultOpr\":" + opr_path.displayOperation + ",\"autoClose\":\"auto\"}",
          };
          if(opr_path.displayType === 'url' && opr_path.url){
            query_opr.conditionExpre =  opr_path.url;
          }
          let beforeExecute = '';
          let afterExecute = '';
          if(opr_path.beforeExecute){
            let entire = opr_path.beforeExecute.toString();
            beforeExecute = entire.slice(entire.indexOf("{") + 1, entire.lastIndexOf("}"));
          }
          if(opr_path.afterExecute){
            let entire = opr_path.afterExecute.toString();
            afterExecute = entire.slice(entire.indexOf("{") + 1, entire.lastIndexOf("}"));
          }
          query_opr.params = "APP_beforeScript:" + `${beforeExecute}` + "APP_afterScript:" + `${afterExecute}`;
          if(query_opr.oprScript){
            query_opr.oprScript.appBefore.client.default.script += beforeExecute;
            query_opr.oprScript.appAfter.client.default.script += afterExecute;
          }
        } else if(typeof opr_path !== 'string' && opr_path.oid){
          //excuteOperation方式调用系统operation
          query_opr = await getQueryOperation(opr_path.oid);
          query_opr = query_opr.data.data;
          // 获取前后端脚本统一之后的脚本数据
          if(query_opr.oprScript){
            query_opr.oprScript = JSON.parse(query_opr.oprScript);
          }
          if (query_opr.action == "implement") {
            let scriptContent = query_opr.conditionExpre;
            if (!scriptContent.startsWith("procedure:")
              && !scriptContent.startsWith("serverScript:")
              && !scriptContent.startsWith("clientScript:")) {
              try {
                let _path = query_opr.conditionExpre;
                if (_path.startsWith("addin:")) _path = _path.substring(6, _path.length);
                let _addin = getAddinFunc(_path, "operation");
                let self = this;
                let addin = new _addin({
                  propsData: {
                    itemValue: jsonData,
                    store: store
                  },
                  methods: {
                    getObj(data) {
                      return self.GetObj(data);
                    },
                    GetAllAddin() {
                      return self.GetAllAddin(jsonData.data)
                    }
                  }
                });
                this.addin = addin;
              } catch (e) {
                console.log(e);
              }
            }
          }
          let beforeExecute = '';
          let afterExecute = '';
          if(opr_path.beforeExecute){
            //重写前处理
            let entire = opr_path.beforeExecute.toString();
            beforeExecute = entire.slice(entire.indexOf("{") + 1, entire.lastIndexOf("}"));
            let APP_afterScript = query_opr.params.slice(query_opr.params.lastIndexOf("APP_afterScript:"));
            query_opr.params = "APP_beforeScript:" + `${beforeExecute}${APP_afterScript}`;
            if(query_opr.oprScript){
              query_opr.oprScript.appBefore.client.default.script += beforeExecute;
            }
          }
          if(opr_path.afterExecute){
            //重写后处理
            let entire = opr_path.afterExecute.toString();
            afterExecute = entire.slice(entire.indexOf("{") + 1, entire.lastIndexOf("}"));
            let APP_beforeScript = query_opr.params.slice(0, query_opr.params.lastIndexOf("APP_afterScript:"));
            query_opr.params = `${APP_beforeScript}` + "APP_afterScript:" + `${afterExecute}`;
            if(query_opr.oprScript){
              query_opr.oprScript.appAfter.client.default.script += afterExecute;
            }
          }
        } else if(opr_type == "query") {
          if (opr_path in this.oprMap) {
            query_opr = this.oprMap[opr_path].opr;
            if (this.oprMap[opr_path].addin) this.addin = this.oprMap[opr_path].addin;

          } else {
            query_opr = await getQueryOperation(opr_path);
            query_opr = query_opr.data.data;
            try {
              // 获取前后端脚本统一之后的脚本数据
              if(query_opr.oprScript){
                query_opr.oprScript = JSON.parse(query_opr.oprScript);
                if(query_opr.action == "implement" && ['addin', 'addinAlias'].includes(query_opr.implementType)){
                  let _path = query_opr.conditionExpre;
                  if (_path.startsWith("addin:")) _path = _path.substring(6, _path.length);
                  let _addin = getAddinFunc(_path, "operation");
                  let self = this;
                  let addin = new _addin({
                    propsData: {
                      itemValue: jsonData,
                      store: store
                    },
                    methods: {
                      getObj(data) {
                        return self.GetObj(data);
                      },
                      GetAllAddin() {
                        return self.GetAllAddin(jsonData.data)
                      }
                    }
                  });
                  this.addin = addin;
                  this.oprMap[opr_path].addin = addin;
                }
              }else{
                if (query_opr.action == "implement") {
                  let scriptContent = query_opr.conditionExpre;
                  if (!scriptContent.startsWith("procedure:")
                    && !scriptContent.startsWith("serverScript:")
                    && !scriptContent.startsWith("clientScript:")) {
                    let _path = query_opr.conditionExpre;
                    if (_path.startsWith("addin:")) _path = _path.substring(6, _path.length);
                    let _addin = getAddinFunc(_path, "operation");
                    let self = this;
                    let addin = new _addin({
                      propsData: {
                        itemValue: jsonData,
                        store: store
                      },
                      methods: {
                        getObj(data) {
                          return self.GetObj(data);
                        },
                        GetAllAddin() {
                          return self.GetAllAddin(jsonData.data)
                        }
                      }
                    });
                    this.addin = addin;
                    this.oprMap[opr_path].addin = addin;
                  }
                }
              }
            }catch (e) {
              console.error(e)
            }
            this.oprMap[opr_path] = {opr: query_opr};
          }
        }
        // invoke
        if (opr_type == "query" && query_opr != null) {
          // 系统操作绑定后处理操作执行
          if(query_opr.extSettings && JSON.parse(query_opr.extSettings).sysBindOpr){
            // 阻止后续逻辑
            query_opr.conType = '';
          }
          // 系统操作绑定后处理操作执行end
          // 弹窗样式
          if(query_opr.conType == 'dialog') {
            try {
              if(query_opr.curDialogWidth){
                this.curDragFlag = false;
                this.curDialogWidth = query_opr.curDialogWidth || '80%';
                this.curDialogHeight = query_opr.curDialogHeight.replace('%', 'vh') || 'auto';
              }else if(query_opr.viewType) {
                let parseDialog = JSON.parse(query_opr.viewType);
                this.curDragFlag = parseDialog.dragDialog || false;
                this.curDialogWidth = `${parseDialog.dialogWidth}${parseDialog.dialogWidthType}` || '80%';
                this.curDialogHeight = parseDialog.dialogAutoHeight ? 'auto' : `${parseDialog.dialogHeight}${parseDialog.dialogHeightType}` || 'auto';
              } else {
                this.curDragFlag = false;
                this.curDialogWidth = '80%';
                this.curDialogHeight = 'auto';
              }
            } catch (error) {
              this.curDragFlag = false;
              this.curDialogWidth = '80%';
              this.curDialogHeight = 'auto';
            }
          } else if(query_opr.conType == 'drawerR' || query_opr.conType == 'drawerL') {
            try {

              if(query_opr.curDrawerWidth) {
                this.curDrawerWidth = query_opr.curDrawerWidth || '720';
              } else if(query_opr.viewType) {

                let parseDialog = JSON.parse(query_opr.viewType);
                if(!parseDialog.drawerWidth || !parseDialog.drawerWidthType) {
                  this.curDrawerWidth = '720';
                } else {
                  this.curDrawerWidth = `${parseDialog.drawerWidth}${parseDialog.drawerWidthType}` || '720';
                }

              } else {
                this.curDrawerWidth = '720';
              }

            } catch (error) {
              this.curDrawerWidth = '720';
            }
            console.log(this.curDrawerWidth)

          }
          // 处理事件action
          if(query_opr.action == "implement"){
            // 调用脚本
            let scriptContent = query_opr.conditionExpre;
            let _selected = null;
            try {
              let addins = this.GetAllAddin(jsonData.data);
              for (var i = 0; i < addins.length;i++) {
                if (addins[i].getSelected) {
                  let objs = addins[i].getSelected();
                  if (objs && objs.length > 0) {
                    let _class = addins[i].getAttrMap();
                    if(_class[_class.length-1].className == jsonData.data.targetClass){
                      _selected = objs;
                      break;
                    }
                  }
                }
              }
              _selected = this.defaultObjsAddin && this.defaultObjsAddin.getSelected ? this.defaultObjsAddin.getSelected() : _selected;
            } catch (e) {
              this.oprProgress[oprProgressId] = false;
              // console.log(e);
            }
            // 判断是否为前后端脚本统一之后的数据
            if(query_opr.oprScript){
              //执行脚本
              if(scriptContent.startsWith("procedure:") || query_opr.oprScript.implement.entry === 'server'){
                //执行后端脚本
                let body = {
                  className: jsonData.data.targetClass,
                  selectedObjs: _selected,
                  objs: [this.GetObj(jsonData.data)],
                  sockId: getSockId(),
                }
                if(multiObjParams && multiObjParams.customData) body.customData = multiObjParams.customData;
                if(multiObjParams && multiObjParams.instanceId) body.instanceId = multiObjParams.instanceId;
                let response;
                try{
                  response = await getExecute(query_opr.authority, body);
                  if(response && response.data.code !== 200){
                    this.$Message.error('执行失败, response:' + response.data.message);
                  }else{
                    _res = response.data.data;
                    // this.$Message.info('执行成功, response:' + response.data.data);
                    if (multiObjParams && multiObjParams.oidList && multiObjParams.oidList.length !== 0) {
                      this.AllMultiCompFresh(jsonData.data, multiObjParams);
                    }
                  }
                }catch (e) {
                  this.$Message.error('执行失败, response: 脚本执行错误，请查看日志');
                }
                this.oprProgress[oprProgressId] = false;
              } else if(query_opr.oprScript.implement.entry === 'client'){
                //执行前端脚本
                let code = query_opr.oprScript.implement.client.default.script;
                let params = {}
                params.openForm = (targetClass, viewName, args, displayType, initParams) => {
                  args ? args.displayType = displayType : args = {}, args.displayType = displayType;
                  return this.openForm(jsonData, params, targetClass, viewName, args, initParams)
                };
                params.openDrawer = (targetClass, viewName, direction, args, displayType, initParams) => {
                  args ? args.displayType = displayType : args = {}, args.displayType = displayType;
                  return this.openForm(jsonData, params, targetClass, viewName, args, initParams, direction)
                };
                params.openTab = (queryOpr, args) => { return that.openTab(jsonData, params, queryOpr, args) };
                params.thisAddinId = triggerAddinId;
                params.param = param;
                params.websocket = {};
                params.websocket.currentMsg = param && param.data ? param.data : param;
                params.selectedObjs = _selected;
                params.operationObj = query_opr;
                params.operationObj.scriptType = 'implement';
                let tmp = this.GetObj(jsonData.data);
                if(multiObjParams && multiObjParams.event && multiObjParams.event.name == '初始化') code = this.resolveScript(code);
                res = await this.handleScript(code, params, this.store, jsonData, multiObjParams);
                if (res && typeof res == 'object' && "error" in res) {
                  _res = null;
                  this.$Message.error(res.error);
                } else if (res) {
                  _res = res;
                }
                if(query_opr.extSettings){
                  JSON.parse(query_opr.extSettings).autoClose === 'script' ? _res = null : '';
                }
                this.oprProgress[oprProgressId] = false;
              } else {
                //调用插件
                let params = {
                  className: jsonData.data.targetClass,
                  obj: this.GetObj(jsonData.data),
                  originObj: jsonData.data.origin
                };
                this.addin.onHandle(params);
                this.oprProgress[oprProgressId] = false;
              }
            }else{
              //执行脚本
              if(scriptContent.startsWith("procedure:") || scriptContent.startsWith("serverScript:")){
                //执行后端脚本
                let body = {
                  className: jsonData.data.targetClass,
                  selectedObjs: _selected,
                  objs: [this.GetObj(jsonData.data)],
                  sockId: getSockId(),
                }
                if(multiObjParams && multiObjParams.customData) body.customData = multiObjParams.customData;
                if(multiObjParams && multiObjParams.instanceId) body.instanceId = multiObjParams.instanceId;
                let response;
                try{
                  response = await getExecute(query_opr.authority, body);
                  if(response && response.data.code !== 200){
                    this.$Message.error('执行失败, response:' + response.data.message);
                  }else{
                    _res = response.data.data;
                    // this.$Message.info('执行成功, response:' + response.data.data);
                    if (multiObjParams && multiObjParams.oidList && multiObjParams.oidList.length !== 0) {
                      this.AllMultiCompFresh(jsonData.data, multiObjParams);
                    }
                  }
                }catch (e) {
                  this.$Message.error('执行失败, response: 脚本执行错误，请查看日志');
                }
                this.oprProgress[oprProgressId] = false;
              } else if(scriptContent.startsWith("clientScript:")){
                //执行前端脚本
                let code = scriptContent.slice(13);
                let params = {}
                params.openForm = (targetClass, viewName, args, displayType, initParams) => {
                  args ? args.displayType = displayType : args = {}, args.displayType = displayType;
                  return this.openForm(jsonData, params, targetClass, viewName, args, initParams)
                };
                params.openDrawer = (targetClass, viewName, direction, args, displayType, initParams) => {
                  args ? args.displayType = displayType : args = {}, args.displayType = displayType;
                  return this.openForm(jsonData, params, targetClass, viewName, args, initParams, direction)
                };
                params.openTab = (queryOpr, args) => { return that.openTab(jsonData, params, queryOpr, args) };
                params.thisAddinId = triggerAddinId;
                params.param = param;
                params.websocket = {};
                params.websocket.currentMsg = param && param.data ? param.data : param;
                params.selectedObjs = _selected;
                let tmp = this.GetObj(jsonData.data);
                if(multiObjParams && multiObjParams.event && multiObjParams.event.name == '初始化') code = this.resolveScript(code);
                res = await this.handleScript(code, params, this.store, jsonData, multiObjParams);
                if (res && typeof res == 'object' && "error" in res) {
                  _res = null;
                  this.$Message.error(res.error);
                } else if (res) {
                  _res = res;
                }
                if(query_opr.extSettings){
                  JSON.parse(query_opr.extSettings).autoClose === 'script' ? _res = null : '';
                }
                this.oprProgress[oprProgressId] = false;
              } else {
                //调用插件
                let params = {
                  className: jsonData.data.targetClass,
                  obj: this.GetObj(jsonData.data),
                  originObj: jsonData.data.origin
                };
                this.addin.onHandle(params);
                this.oprProgress[oprProgressId] = false;
              }
            }
          }else if(['create', 'next_create', 'list', 'visit', 'edit', 'creates', 'url'].includes(query_opr.action)){
            // 弹窗/标签
            this.curQueryAction = query_opr.action;
            let that = this;
            let params = {};
            params.param = param;
            params.operationObj = query_opr;
            params.thisAddinId = triggerAddinId;
            // 判断是否为前后端脚本统一之后的数据
            if(query_opr.oprScript){
              params.initScript = query_opr.oprScript.appBefore.client.default.script;
              params.endScript = query_opr.oprScript.appAfter.client.default.script;
            } else if (query_opr.params.length > 0){
              let _params = query_opr.params.split('APP_afterScript:');
              params.initScript = _params[0].replace("APP_beforeScript:", "");
              params.endScript = _params.length > 0 ? _params[1] : '';
            }
            params.data = jsonData.paramData ? jsonData.paramData : null;
            this.modalPath = `/forms/${query_opr.targetClass}/${query_opr.viewName}`
            this.modalQuery = {query: ''};
            if (query_opr.conditionExpre && query_opr.conditionExpre.length > 0) {
              params.condition = query_opr.conditionExpre;
              params.condition = this.parseEscapeString(params.condition, null, null, jsonData.data.origin, this.attributesList, store);
            }
            try {
              var _selected = null;
              if(multiObjParams && multiObjParams.oidList && multiObjParams.oidList[0]){
                let addin = this.GetAddinById(jsonData.data, multiObjParams.oidList[0]);
                let objs = addin.getSelected();
                if (objs.length > 0) {
                  let _class = addin.getAttrMap();
                  if (
                    (_class[_class.length-1].className == query_opr.targetClass) ||
                    (("left_oid" in objs[0] && !("right_oid" in objs[0]) && !("relation_oid" in objs[0])) && _class[0].className == query_opr.targetClass) ||
                    (("right_oid" in objs[0] && !("left_oid" in objs[0]) && !("relation_oid" in objs[0])) && _class[0].className == query_opr.targetClass)
                  ){
                    _selected = objs;
                  }
                }
              }else if(multiObjParams && multiObjParams.byFormEngine){
                //新增从卡片内触发时逻辑，multiObjParams.byFormEngine = true时obj为卡片赋予obj，原来为卡片所在表单obj
                _selected = jsonData && jsonData.data && jsonData.data.origin ? [jsonData.data.origin] : null;
              }else {
                let addins = this.GetAllAddin(jsonData.data);
                for (var i = 0;i < addins.length;i++) {
                  if (addins[i].getSelected && form_entries.find(item => item.name === addins[i].name) && form_entries.find(item => item.name === addins[i].name).module === 'form/multi') {
                    let objs = addins[i].getSelected();
                    if (objs.length > 0) {
                      let _class = addins[i].getAttrMap();
                      if (_class[_class.length-1].className == query_opr.targetClass) {
                        _selected = objs;
                        break;
                      }
                    }
                  }
                }
              }
              if (_selected) {
                params.selectedObjs = _selected;
                if ("oid" in _selected[0]) {
                  this.modalQuery.query = `and plt_oid='${_selected[0].oid}'`
                } else if("relation_oid" in _selected[0] && "left_oid" in _selected[0] && "right_oid" in _selected[0]) {
                  this.modalQuery.query = `and relationclass.plt_oid='${_selected[0].relation_oid}'`;
                } else if("left_oid" in _selected[0] && !("right_oid" in _selected[0]) && !("relation_oid" in _selected[0])){
                  this.modalQuery.query = `and plt_oid='${_selected[0].left_oid}'`;
                } else if("right_oid" in _selected[0] && !("left_oid" in _selected[0]) && !("relation_oid" in _selected[0])){
                  this.modalQuery.query = `and plt_oid='${_selected[0].right_oid}'`;
                } else if("plt_oid" in _selected[0]){
                  this.modalQuery.query = `and plt_oid='${_selected[0].plt_oid}'`;
                }
              }
            } catch (e) {
              this.oprProgress[oprProgressId] = false;
              console.log(e);
            }
            //编辑nextCreate内存对象
            if(params.param && params.param.nextCreateOid){
              params._obj = param;
            }

            //插入nextCreate创建逻辑
            if(query_opr.action == 'next_create') {
              this._generateNextCreate();
            }
            let show = true;
            if (params.initScript && params.initScript.length > 0) {
              params.operationObj.scriptType = 'appBefore';
              let obj = await this.handleScript(params.initScript, params, store, jsonData, multiObjParams);
              if (obj) {
                if ("show" in obj) show = obj.show;
                if (obj.query) params.query = obj.query;
                if (obj.obj) params._obj = obj.obj;
                if (obj.data) params.data = obj.data;
                if (obj.url) params.condition = obj.url;
                if (obj.displayType) params.displayType = obj.displayType;
              }
              res = obj;
            }
            if(query_opr.action == 'url') {
              if (query_opr.conType.substring(0,3) == "tab" && this.root) {
                if (show) {
                    this.modalQuery.params = this.modalQuery.params ? this.modalQuery.params: {};
                    this.modalQuery.params.conType = 'tab';
                    this.root.openTab({
                    ...query_opr,
                    conditionExpre: params.condition,
                    params: ""
                  }, this.modalQuery);
                  this.setPendingTaskQueue(query_opr, this.modalQuery);
                }

                if(query_opr.extSettings){
                  let extObj = JSON.parse(query_opr.extSettings);
                  if('needDefaultOpr' in extObj) {
                    // this.showDefOpr = extObj.needDefaultOpr;
                    if(extObj.needDefaultOpr === true) {
                      if (query_opr.action == "create") {
                        this.defOprText = "新增";
                      } else if (query_opr.action == "visit" || query_opr.action == "url") {
                        this.defOprText = "确定";
                      } else if (query_opr.action == "next_create") {
                        this.defOprText = "级联创建";
                      } else if (query_opr.action == "edit") {
                        this.defOprText = "修改";
                      }
                    }
                  }
                }
                this.oprProgress[oprProgressId] = false;
              } else if (query_opr.conType == "dialog") {
                if(query_opr.extSettings) {
                  let extObj = JSON.parse(query_opr.extSettings);
                  if ('needDialogDefaultOpr' in extObj) {
                    this.showDialogDefOpr = extObj.needDialogDefaultOpr;
                    // if(extObj.needDialogDefaultOpr === true) {
                    //   if (query_opr.action == "create") {
                    //     this.defOprText = "新增";
                    //   } else if (query_opr.action == "edit") {
                    //     this.defOprText = "修改";
                    //   }
                    // }
                  }
                }
                this.modalIframeWrapper = true;
                this.$nextTick(() => {
                  // this.urlDrawerIf = false;
                  this.modalDrawerIframe = false;
                  this.urlIf = true;
                  this.modalIframeTitle = query_opr.displayName;
                  this.modalIframe = true;
                  this.urlSrc = params.condition;
                  this.oprProgress[oprProgressId] = false;
                })
              } else if (query_opr.conType == "drawerL") {

                this.modalIframeWrapper = true;
                this.$nextTick(() => {
                  this.urlIf = false;
                  this.modalIf = false;
                  this.modalIframe = false;
                  this.modalDrawerIframeTitle = query_opr.displayName;
                  this.urlSrc = params.condition;
                  this.drawerDirection = 'left';
                  // this.urlDrawerIf = true;
                  this.modalDrawerIframe = true;
                  this.oprProgress[oprProgressId] = false;
                })

              } else if (query_opr.conType == "drawerR") {

                this.modalIframeWrapper = true;
                this.$nextTick(() => {
                  this.urlIf = false;
                  this.modalIf = false;
                  this.modalIframe = false;
                  this.modalDrawerIframeTitle = query_opr.displayName;
                  this.urlSrc = params.condition;
                  this.drawerDirection = 'right';
                  // this.urlDrawerIf = true;
                  this.modalDrawerIframe = true;
                  this.oprProgress[oprProgressId] = false;
                })
              } else {
              }
            } else {
              this.modalTitle = query_opr.displayName;
              this.modalQuery.params = params;
              if(this.modalQuery.params.thisAddinId) delete this.modalQuery.params.thisAddinId;
              if (query_opr.action == "create" || query_opr.action == "creates") {
                this.modalQuery.displayType = 'create';
                this.modalQuery.params.opr_path = "save";
                this.modalQuery.params.opr_type = "sys";
                this.modalQuery.params.opr_name = "新增";
                multiObjParams ? this.modalQuery.params.oidList = multiObjParams.oidList : '';
              } else if (query_opr.action == "next_create") {
                this.modalQuery.displayType = 'create';
                this.modalQuery.params.opr_path = "next_create";
                this.modalQuery.params.opr_type = "sys";
                this.modalQuery.params.opr_name = "级联创建";
                multiObjParams ? this.modalQuery.params.oidList = multiObjParams.oidList : '';
              } else if (query_opr.action == "edit") {
                this.modalQuery.displayType = "edit";
                this.modalQuery.params.opr_path = "edit";
                this.modalQuery.params.opr_type = "sys";
                this.modalQuery.params.opr_name = "修改";
                multiObjParams ? this.modalQuery.params.oidList = multiObjParams.oidList : '';
              } else if(query_opr.action == "list"){
                this.modalQuery.displayType = "edit";
              } else{
                this.modalQuery.displayType = "visit";
              }
              // if (['create', 'next_create', 'creates'].includes(query_opr.action)) this.modalQuery.displayType = 'create';
              // else if (['list', 'edit'].includes(query_opr.action)) this.modalQuery.displayType = "edit";
              // else this.modalQuery.displayType = "visit";
              if (params.displayType) this.modalQuery.displayType = params.displayType;
              if (query_opr.conType.substring(0,3) == "tab" && this.root) {
                if (show) {
                  this.modalQuery.params.conType = 'tab';
                  this.pendingTask.freshMultiAddinId = multiObjParams ? multiObjParams.oidList : '';
                  this.root.openTab(query_opr, this.modalQuery);
                  this.setPendingTaskQueue(query_opr, this.modalQuery);

                  if(query_opr.extSettings){
                    let extObj = JSON.parse(query_opr.extSettings);
                    if('needDefaultOpr' in extObj) {
                      // this.showDefOpr = extObj.needDefaultOpr;
                      if(extObj.needDefaultOpr === true) {
                        if (query_opr.action == "create") {
                          this.defOprText = "新增";
                        } else if (query_opr.action == "visit" || query_opr.action == "url") {
                          this.defOprText = "确定";
                        } else if (query_opr.action == "next_create") {
                          this.defOprText = "级联创建";
                        } else if (query_opr.action == "edit") {
                          this.defOprText = "修改";
                        }
                      }
                    }
                  }
                }
              } else if (query_opr.conType.substring(0,3) == "tab" && !this.root){
                this.$Message.error("请将表单绑定到应用通道再尝试！");
              } else if (show) {
                if (callback) this.modalQuery.params.modalCallback = callback;
                if (!(res && res.sync) && this.modalIf && this.$refs.form || this.drawerIf && this.$refs.form) {
                  this.$refs.form.handle(this.modalPath, this.modalQuery);
                }
                //保存从表单控件来的jsonData
                this.modalJsonData = jsonData;
                //保存从表单控件表单实例
                if(multiObjParams && multiObjParams.byFormEngine && multiObjParams.byFormEngineOprAddin){
                  this.byFormEngineOprAddin = multiObjParams.byFormEngineOprAddin;
                }
                if(query_opr.conType == "dialog") {
                  if(query_opr.extSettings) {
                    let extObj = JSON.parse(query_opr.extSettings);
                    if ('needDialogDefaultOpr' in extObj) {
                      this.showDialogDefOpr = extObj.needDialogDefaultOpr;
                      // if(extObj.needDialogDefaultOpr === true) {
                      //   if (query_opr.action == "create") {
                      //     this.defOprText = "新增";
                      //   } else if (query_opr.action == "edit") {
                      //     this.defOprText = "修改";
                      //   }
                      // }
                    }
                  }
                  if(res && res.sync){

                  }else{
                    this.drawerIf = false;
                    this.drawerModal = false;
                    this.modalIf = true;
                    this.modal = true;
                  }

                } else if(query_opr.conType == "drawerL") {

                  this.modalIf = false;
                  this.modal = false;
                  this.drawerDirection = 'left';
                  this.drawerIf = true;
                  this.drawerModal = true;

                } else if(query_opr.conType == "drawerR") {

                  this.modalIf = false;
                  this.modal = false;
                  this.drawerDirection = 'right';
                  this.drawerIf = true;
                  this.drawerModal = true;

                } else {
                }

              }
              this.oprProgress[oprProgressId] = false;
            }
          }
        } else {
          // sys operation
          /**
           * 所有操作分为有multiObjParams参数与无,用来判断是否绑定了表格
           */
          let sysEventObj = null;
          try{
            //通过控件触发/触发动作正确
            if(triggerAddinId && triggerAddinId.args && triggerAddinId.args.events && this.sysEventPath.includes(opr_path)){
              sysEventObj = triggerAddinId.args.events.find(event => event.opr_path === opr_path);
            }
            //通过表单默认操作触发
            if(multiObjParams && multiObjParams.sysEventObj){
              sysEventObj = multiObjParams.sysEventObj;
            }
          }catch(e){

          }

          if (opr_path == "") {
            this.oprProgress[oprProgressId] = false;
            return;
          }
          let targetClass = this.rootJson.data.targetClass
          let viewName = `${this.rootJson.data.targetClass}Single`
          let vieWRes = ''
          if (opr_path == "createForm") {
            vieWRes = await getView(targetClass, viewName);
            if (vieWRes.data.data) {
              this.openForm(this.rootJson, {}, targetClass, viewName, {displayType: 'createForm'})
            }else{
              this.$Message.error(`${viewName}表单不存在，请创建表单`);
            }
            this.oprProgress[oprProgressId] = false;
            return
          }else if (opr_path == "editForm") {
            vieWRes = await getView(targetClass, viewName);
            if (vieWRes.data.data) {
              this.openForm(this.rootJson, {}, this.rootJson.data.targetClass, `${this.rootJson.data.targetClass}Single`, {displayType: 'editForm'})
            }else{
              this.$Message.error(`${viewName}表单不存在，请创建表单`);
            }
            this.oprProgress[oprProgressId] = false;
            return
          }else 
          if (opr_path == "save" || opr_path == "saveForm") {
            if(multiObjParams && multiObjParams.byFormEngine && multiObjParams.byFormEngineDisplayType === 'edit'){
              this.$Message.error("编辑态卡片不可执行新增操作");
              this.oprProgress[oprProgressId] = false;
              return
            }else if(jsonData.data && jsonData.data.displayType === 'edit' && this.query.displayType === 'edit'){
              this.$Message.error("编辑态表单不可执行新增操作");
              this.oprProgress[oprProgressId] = false;
              return
            }
            // if(multiObjParams.byFormEngine){
            //   // _res = await this.save(null, jsonData, null, multiObjParams, sysEventObj);
            //   // this.firstMultiCompFresh(jsonData.data);
            //   // this.oprProgress[oprProgressId] = false;
            // } else
              if(multiObjParams && multiObjParams.opr_source){
              switch (multiObjParams.opr_source) {
                case 'grid':
                  _res = await this.save(null, jsonData, multiObjParams.className, multiObjParams, sysEventObj);
                  this.AllMultiCompFresh(jsonData.data, multiObjParams);
                  this.oprProgress[oprProgressId] = false;
                  break;
                default:
                  _res = await this.save(null, jsonData, null, null, sysEventObj);
                  this.AllMultiCompFresh(jsonData.data, multiObjParams);
                  this.oprProgress[oprProgressId] = false;
                  break
              }
            }else if (multiObjParams && multiObjParams.oidList && multiObjParams.oidList.length !== 0) {
              _res = await this.save(null, jsonData, null, null, sysEventObj);
              this.AllMultiCompFresh(jsonData.data, multiObjParams);
              this.oprProgress[oprProgressId] = false;
            }else{
              _res = await this.save(null, jsonData, null, null, sysEventObj);
              if(opr_path == "saveForm"){
                await this.firstMultiCompFresh(originJsonData.data);
                this.$Message.success("刷新成功");
              }else{
                this.firstMultiCompFresh(jsonData.data);
              }
              this.oprProgress[oprProgressId] = false;
            }
            await this.handleSysOprEndScript(sysEventObj, _res);
          }else if (opr_path == "next_create") {
            // if(jsonData.data && jsonData.data.displayType === 'edit' && this.query.displayType === 'edit'){
            //   this.$Message.error("编辑态表单不可执行级联创建操作");
            //   return
            // }
            if (multiObjParams && multiObjParams.oidList && multiObjParams.oidList.length !== 0) {
              _res = this.GetObj(jsonData.data);
              // this.AllMultiCompFresh(jsonData.data, multiObjParams.oidList);
              this.oprProgress[oprProgressId] = false;
            }else{
              _res = this.GetObj(jsonData.data);
              // this.firstMultiCompFresh(jsonData.data);
              this.oprProgress[oprProgressId] = false;
            }
          }else if (opr_path == "delete") {
            this.flag = 0;
            let deleteRes;
            this.$Modal.confirm({
              title: "删除确认",
              content: "<p>是否确认删除</p>",
              okText: "确认",
              cancelText: "取消",
              onOk: async () => {
                //1按钮绑定操作，2表格内部操作，3普通系统操作
                if(multiObjParams && multiObjParams.opr_source){
                  switch (multiObjParams.opr_source) {
                    case 'confirm':
                    case 'grid':
                      deleteRes = await this.delete(param, jsonData, multiObjParams.className, multiObjParams, sysEventObj);
                      this.AllMultiCompFresh(jsonData.data, multiObjParams);
                      this.oprProgress[oprProgressId] = false;
                      break;
                    default:
                      this.oprProgress[oprProgressId] = false;
                      break
                  }
                }else if (multiObjParams && multiObjParams.oidList && multiObjParams.oidList.length !== 0){
                  let multis = this.GetControlledMutiAddinByIds(jsonData.data, multiObjParams.oidList);
                  let messageFlag = false;
                  for (let [index, multi] of multis.entries()) {
                    if(multi.getSelected().length !== 0){
                      for (let selectedRow of multi.getSelected()) {
                        param = param || selectedRow;
                        let multiObjParam = {
                          className: typeof multi.getSelectedClass === 'function' ? multi.getSelectedClass() : multiObjParams.className,
                          isRelation: typeof multi.getIsRelation === 'function' ? multi.getIsRelation() : multiObjParams.isRelation,
                          oidList: multiObjParams.oidList[index]
                        };
                        deleteRes = await this.delete(selectedRow, jsonData, multiObjParam.className, multiObjParam, sysEventObj);
                      }
                      messageFlag = true;
                    }
                  };
                  if(!messageFlag){
                    this.$Message.error("请选择一条对象删除");
                    this.oprProgress[oprProgressId] = false;
                    return;
                  }
                  this.AllMultiCompFresh(jsonData.data, multiObjParams);
                  this.oprProgress[oprProgressId] = false;
                }else{
                  if (!param) {
                    let multis = this.getMultiObjComp(jsonData.data);
                    if (multis.length > 0) {
                      let _selected = multis[0].getSelected();
                      if (_selected.length > 0) {
                        _selected = this.defaultObjsAddin && this.defaultObjsAddin.getSelected ? this.defaultObjsAddin.getSelected() : _selected;
                        param = _selected[0];
                      }else{
                        this.$Message.error("请选择一条对象删除");
                        this.oprProgress[oprProgressId] = false;
                        return;
                      }
                    }
                  }
                  deleteRes = await this.delete(param, jsonData, null, null, sysEventObj);
                  this.firstMultiCompFresh(jsonData.data);
                }
                await this.handleSysOprEndScript(sysEventObj, deleteRes);
                this.flag = 1;
              },
              onCancel: () => {
                this.flag = 2;
              }
            });
            while(this.flag == 0) {
              await this.sleep(100);
            }
            _res = this.flag == 1 ? "ok" : "cancel";
            // }
          } else if (opr_path == "deleteLeftObj") {
            this.flag = 0;
            this.$Modal.confirm({
              title: "删除确认",
              content: "<p>是否确认删除左对象</p>",
              okText: "确认",
              cancelText: "取消",
              onOk: async () => {
                //1按钮绑定操作，2表格内部操作，3普通系统操作
                if(multiObjParams && multiObjParams.opr_source){
                  switch (multiObjParams.opr_source) {
                    case 'confirm':
                    case 'grid':
                      await this.deleteLeftObj(param, jsonData, multiObjParams.className, null, multiObjParams);
                      this.AllMultiCompFresh(jsonData.data, multiObjParams);
                      this.oprProgress[oprProgressId] = false;
                      break;
                    default:
                      this.oprProgress[oprProgressId] = false;
                      break
                  }
                }else if (multiObjParams && multiObjParams.oidList && multiObjParams.oidList.length !== 0){
                  let multis = this.GetControlledMutiAddinByIds(jsonData.data, multiObjParams.oidList);
                  for (let [index, multi] of multis.entries()) {
                    for (let selectedRow of multi.getSelected()) {
                      param = param || selectedRow;
                      let multiObjParam = {
                        className: typeof multi.getSelectedClass === 'function' ? multi.getSelectedClass() : multiObjParams.className,
                        isRelation: typeof multi.getIsRelation === 'function' ? multi.getIsRelation() : multiObjParams.isRelation,
                        showMessage: false,
                        oidList: multiObjParams.oidList[index]
                      };
                      await this.deleteLeftObj(selectedRow, jsonData, multiObjParam.className, null, multiObjParam);
                    }
                  };
                  this.AllMultiCompFresh(jsonData.data, multiObjParams);
                  this.oprProgress[oprProgressId] = false;
                }else{
                  if (!param) {
                    let multis = this.getMultiObjComp(jsonData.data);
                    if (multis.length > 0) {
                      let _selected = multis[0].getSelected();
                      if (_selected.length > 0) {
                        param = _selected[0];
                      }else{
                        this.$Message.error("请选择一条对象删除");
                        this.oprProgress[oprProgressId] = false;
                        return;
                      }
                    }
                  }
                  await this.deleteLeftObj(param, jsonData);
                  this.firstMultiCompFresh(jsonData.data);
                  this.oprProgress[oprProgressId] = false;
                }
                this.flag = 1;
              },
              onCancel: () => {
                this.flag = 2;
              }
            });
            while(this.flag == 0) {
              await this.sleep(100);
            }
            _res = this.flag == 1 ? "ok" : "cancel";
            // }
          } else if (opr_path == "deleteRightObj") {
            this.flag = 0;
            this.$Modal.confirm({
              title: "删除确认",
              content: "<p>是否确认删除右对象</p>",
              okText: "确认",
              cancelText: "取消",
              onOk: async () => {
                //1按钮绑定操作，2表格内部操作，3普通系统操作
                if(multiObjParams && multiObjParams.opr_source){
                  switch (multiObjParams.opr_source) {
                    case 'confirm':
                    case 'grid':
                      await this.deleteRightObj(param, jsonData, multiObjParams.className, null, multiObjParams);
                      this.AllMultiCompFresh(jsonData.data, multiObjParams);
                      this.oprProgress[oprProgressId] = false;
                      break;
                    default:
                      this.oprProgress[oprProgressId] = false;
                      break
                  }
                }else if (multiObjParams && multiObjParams.oidList && multiObjParams.oidList.length !== 0){
                  let multis = this.GetControlledMutiAddinByIds(jsonData.data, multiObjParams.oidList);
                  for (let [index, multi] of multis.entries()) {
                    for (let selectedRow of multi.getSelected()) {
                      param = param || selectedRow;
                      let multiObjParam = {
                        className: typeof multi.getSelectedClass === 'function' ? multi.getSelectedClass() : multiObjParams.className,
                        isRelation: typeof multi.getIsRelation === 'function' ? multi.getIsRelation() : multiObjParams.isRelation,
                        showMessage: false,
                        oidList: multiObjParams.oidList[index]
                      };
                      await this.deleteRightObj(selectedRow, jsonData, multiObjParam.className, null, multiObjParam);
                    }
                  };
                  this.AllMultiCompFresh(jsonData.data, multiObjParams);
                  this.oprProgress[oprProgressId] = false;
                }else{
                  if (!param) {
                    let multis = this.getMultiObjComp(jsonData.data);
                    if (multis.length > 0) {
                      let _selected = multis[0].getSelected();
                      if (_selected.length > 0) {
                        param = _selected[0];
                      }else{
                        this.$Message.error("请选择一条对象删除");
                        this.oprProgress[oprProgressId] = false;
                        return;
                      }
                    }
                  }
                  await this.deleteRightObj(param, jsonData);
                  this.firstMultiCompFresh(jsonData.data);
                }
                this.flag = 1;
              },
              onCancel: () => {
                this.flag = 2;
              }
            });
            while(this.flag == 0) {
              await this.sleep(100);
            }
            _res = this.flag == 1 ? "ok" : "cancel";
            // }
          }
          else if (opr_path == "edit" || opr_path == 'editF') {
            //1按钮自定义操作（弹窗)
            //2表格内部操作
            //3按钮绑定多个表格操作
            //4按钮系统操作
            if(multiObjParams && multiObjParams.opr_source){
              switch (multiObjParams.opr_source) {
                case 'confirm':
                  _res = await this.edit(param, jsonData, null, null, sysEventObj);
                  this.AllMultiCompFresh(jsonData.data, multiObjParams);
                  this.oprProgress[oprProgressId] = false;
                  break;
                case 'grid':
                  _res = await this.edit(param, jsonData, multiObjParams.className, multiObjParams, sysEventObj);
                  this.AllMultiCompFresh(jsonData.data, multiObjParams);
                  this.oprProgress[oprProgressId] = false;
                  break;
                default:
                  break
              }
            }else if (multiObjParams && multiObjParams.oidList && multiObjParams.oidList.length !== 0){
              let multis = this.GetControlledMutiAddinByIds(jsonData.data, multiObjParams.oidList);
              for (let [index, multi] of multis.entries()) {
                for (let selectedRow of multi.getSelected()) {
                  param = param || selectedRow;
                  let multiObjParam = {
                    className: typeof multi.getSelectedClass === 'function' ? multi.getSelectedClass() : multiObjParams.className,
                    isRelation: typeof multi.getIsRelation === 'function' ? multi.getIsRelation() : multiObjParams.isRelation,
                    showMessage: false,
                    oidList: multiObjParams.oidList[index]
                  };
                  if(multiObjParam.isRelation){
                    multiObjParam.relationClass = multiObjParams.className;
                    multiObjParam.leftClass = multiObjParams.leftClass;
                    multiObjParam.rightClass = multiObjParams.rightClass;
                  }
                  _res = await this.edit(param, jsonData, multiObjParam.className, multiObjParam, sysEventObj);
                }
              };
              this.AllMultiCompFresh(jsonData.data);
              this.oprProgress[oprProgressId] = false;
            }else{
              _res = await this.edit(param, jsonData, null, null, sysEventObj);
              if(opr_path == 'editF'){
                await this.firstMultiCompFreshAfterEdit(originJsonData.data, multiObjParams);
                this.$Message.success("刷新成功");
              }else{
                this.firstMultiCompFreshAfterEdit(jsonData.data, multiObjParams);
              }
              this.oprProgress[oprProgressId] = false;
            }
            // else if(multiObjParams.byFormEngine){
            //   debugger
            //   let multiObjParam = {
            //     className: multiObjParams.className,
            //     isRelation: multiObjParams.isRelation
            //   };
            //   if(multiObjParams.isRelation){
            //     multiObjParam.relationClass = multiObjParams.className;
            //     multiObjParam.leftClass = multiObjParams.leftClass;
            //     multiObjParam.rightClass = multiObjParams.rightClass;
            //   }
            //   _res = await this.edit(param, jsonData, multiObjParam.className, multiObjParam, sysEventObj);
            //   this.firstMultiCompFreshAfterEdit(jsonData.data, multiObjParams);
            //   this.oprProgress[oprProgressId] = false;
            // }

            await this.handleSysOprEndScript(sysEventObj, _res);
          }
          else if (opr_path == "refresh") {
            // 针对多对象控件优化刷新 避免读取太多后台数据
            // let multis = this.getMultiObjComp(jsonData);
            // if (multis.length > 0){
            //   multis[0].freshData();
            //   return;
            // }
            if(multiObjParams){
              this.AllMultiCompFresh(jsonData.data, multiObjParams);
            }else{
              this.firstMultiCompFresh(jsonData.data);
            }
            if(this.query && this.query.displayType === 'create'){
              this.$Message.success("刷新成功");
            } else{
              res = await this.refresh(queryData, jsonData);
            }
            this.oprProgress[oprProgressId] = false;
          }
        }
        this.oprProgress[oprProgressId] = false;
        return _res;
      },

      /**
      * @author LiuBo
      * @method
      * @name
      * @private
      * @description 处理事件oprScript
      * @param {...Object} invokeOperation参数
      * @param {Object} oprScript 事件oprScript
      * @return {Object} res操作返回值
      */
      handleOprScript(opr_type, opr_path, jsonData, store, queryData, param, callback, multiObjParams, triggerAddinId, oprScript){

      },

      /**
       * 解析过滤条件，注入当前表单对象
       */
      parseEscapeString(oriString, env, user, obj, attributes, param){
        return parseEscapeString(oriString, env, user, obj, attributes, param, this);
      },
      /**
      *@description表单的默认操作
      *@paramsbyFormEngineOprAddin当从卡片中的事件触发回传的卡片对象
      *@date 2021/1/20
      *@return
      */
      async confirm(jsonData, byFormEngineOprAddin = null) {
        let res = null;
        // 执行表单默认操作
        if (this.rootJson.opr_path && this.rootJson.opr_path != "") {
          let sysEventObj = this.sysEventPath.includes(this.rootJson.opr_path) ? {
            opr_sys_path: this.rootJson.opr_sys_path,
            opr_showMessage: this.rootJson.opr_showMessage,
          }: null
          if(this.rootJson.oidList){
            res = await this.invokeOperation(this.rootJson.opr_type, this.rootJson.opr_path, this.rootJson, this.store, null, null, null, {
              oidList: this.rootJson.oidList,
              opr_source: 'confirm',
              sysEventObj: sysEventObj
            });
          }else{
            res = await this.invokeOperation(this.rootJson.opr_type, this.rootJson.opr_path, this.rootJson, this.store, null, null, null, {
              sysEventObj: sysEventObj
            }, '', jsonData);
          }
          if (!res) return res;
        // }else if(this.rootJson.data && this.rootJson.data.displayType == 'visit' && this.query.displayType && this.query.displayType == 'visit'){
        }else if((this.rootJson.data && this.rootJson.data.displayType == 'visit') || (this.query.displayType && this.query.displayType == 'visit')){
          return 'visit'
        }
        await this.handleEndScript(jsonData, res, byFormEngineOprAddin);
        return res;
      },

      handleEndScript(jsonData, res, byFormEngineOprAddin = null){
        if(this.query.params.conType === 'tab') return;
          // 执行后处理脚本
        if (this.query.params && this.query.params.endScript && this.query.params.endScript.length > 0) {
          let params = {};
          params.confirmData = res;
          byFormEngineOprAddin ? params.thisAddinId = byFormEngineOprAddin : '';
          params.openForm = (targetClass, viewName, args, displayType, initParams) => {
            args ? args.displayType = displayType : args = {}, args.displayType = displayType;
            return this.openForm(jsonData, params, targetClass, viewName, args, initParams)
          };
          params.openDrawer = (targetClass, viewName, direction, args, displayType, initParams) => {
            args ? args.displayType = displayType : args = {}, args.displayType = displayType;
            return this.openForm(jsonData, params, targetClass, viewName, args, initParams, direction)
          };
          params.openTab = (queryOpr, args) => { return that.openTab(jsonData, params, queryOpr, args) };
          params.operationObj = this.query.params.operationObj;
          params.operationObj.scriptType = 'appAfter';
          this.handleScript(this.query.params.endScript, params, this.$store, jsonData);
        }
        if (this.modalCallback) {
          this.modalCallback.func(res, this.modalCallback.params);
        }
      },

      /**
      *@description执行系统后处理脚本
      *@params
      *@date 2021/1/5
      *@return
      */
      async handleSysOprEndScript(eventObj, response){
        if(eventObj && eventObj.opr_sys_path){
          await this.invokeOperation('query', eventObj.opr_sys_path, this.rootJson, this.store, null, response)
        }
      },

      // 获取当前表单对应的对象
      GetObj(item, validate, returnValidate, externalObj) {
        if(returnValidate){
          this.returnValidateValue = true && this.returnValidateValue;
        }
        var obj = {};
        let flag = true;
        if (!item) return validate ? [obj, flag] : obj;
        if ("extraObj" in item) {
          for (var i in item.extraObj) {
            obj[i] = item.extraObj[i];
          }
        }
        if ("origin" in item) {
          if (validate) {
            if ("oid" in item.origin) obj.oid = item.origin.oid;
            if ("relation_oid" in item.origin) obj.relation_oid = item.origin.relation_oid;
            if ("relation_leftOid" in item.origin) obj.relation_leftOid = item.origin.relation_leftOid;
            if ("relation_rightOid" in item.origin) obj.relation_rightOid = item.origin.relation_rightOid;
            if ("left_oid" in item.origin) obj.left_oid = item.origin.left_oid;
            if ("right_oid" in item.origin) obj.right_oid = item.origin.right_oid;
            if ("lastModifyTime" in item.origin) obj.lastModifyTime = item.origin.lastModifyTime;
            if ("relation_lastModifyTime" in item.origin) obj.relation_lastModifyTime = item.origin.relation_lastModifyTime;
            if ("left_lastModifyTime" in item.origin) obj.left_lastModifyTime = item.origin.left_lastModifyTime;
            if ("right_lastModifyTime" in item.origin) obj.right_lastModifyTime = item.origin.right_lastModifyTime;
          } else {
            for (var i in item.origin) {
              obj[i] = item.origin[i];
            }
          }

          //nextCreate参数
          if (item.origin && "nextCreateOid" in item.origin) obj.nextCreateOid = item.origin.nextCreateOid;
          if (item.origin && "nextCreateClassName" in item.origin) obj.nextCreateClassName = item.origin.nextCreateClassName;
          if (item.origin && "isRelation" in item.origin) obj.isRelation = item.origin.isRelation;
          if (item.origin && "tobeOid" in item.origin) obj.tobeOid = item.origin.tobeOid;
          if (item.origin && "tobeClassName" in item.origin) obj.tobeClassName = item.origin.tobeClassName;
        }

        if('tobeOid' in item && 'tobeClassName' in item){
          obj.tobeOid = item.tobeOid;
          obj.tobeClassName = item.tobeClassName;
          obj.isRelation = item.isRelation;
        };
        if('next_create' in item){
          obj._next_create = _.cloneDeep(item.next_create);
        };
        for (var i = 0;i < item.elements.length;i++) {
          if (item.elements[i].obj) {
            let args = item.elements[i].obj.getArgs ? item.elements[i].obj.getArgs() : {};
            // if (!validate || (!args.readonly && !args.disabled)) { fix bug 只读禁用仍然更新
            if (validate && item.elements[i].obj.validate && !(item.elements[i].obj.validate())) {
              this.returnValidateValue = false;
              console.log("validate error:", item.elements[i]);
              flag = false;
            }
            var name = item.elements[i].obj.getFormName ? item.elements[i].obj.getFormName() : null;
            if (name && !this.noNeedGetValue.includes(item.elements[i].obj.name)) {
              try {
                var value = item.elements[i].obj.getValue();
                value = value === null ? null : value;
                if (value !== undefined){
                  // 是否为自定义属性
                  obj[name] = value;
                  try {
                    if(externalObj && externalObj.multiObjParams && externalObj.multiObjParams.byFormEngine){

                    }else{
                      if(this.attributesList){
                        let propertyStatus = false;
                        if(Object.prototype.toString.call(this.attributesList) === "[object Object]"){
                          for(let key in this.attributesList){
                            propertyStatus = this.attributesList[key].findIndex(item => item.attributeName === name.replace(/^(left_|right_|relation_)/g, '')) !== -1 || propertyStatus;
                          }
                        }else if(Object.prototype.toString.call(this.attributesList) === "[object Array]"){
                          propertyStatus = this.attributesList.findIndex(item => item.attributeName === name) !== -1
                        }
                        if(!propertyStatus){
                          obj[`_customdata`] ? obj[`_customdata`][name] = value : obj[`_customdata`] = {}, obj[`_customdata`][name] = value;
                          delete obj[name];
                        }
                      }
                    }
                  }catch (e) {
                    console.log('自定义属性getObj发生错误');
                  }
                }
              } catch (e) {
                console.log('getValue error:', e);
              }
            }
            // }
          }
          var other = this.GetObj(item.elements[i], validate, null, externalObj);
          if (validate) {
            if (!other[1]) flag = false;
            other = other[0];
          }
          for (var j in other) {
            if(j === '_customdata'){
              obj[j] = { ...obj[j], ...other[j]};
            }else{
              obj[j] = other[j];
            }
          }
        }
        return returnValidate ? this.returnValidateValue : validate ? [obj, flag] : obj;
      },

      // 根据id获取控件实例
      GetAddinById(item, id) {
        if (!item) return null;
        if ("self" in item) {
          if (item.self.properties.id == id) return item.obj;
        }
        for (var i = 0;i < item.elements.length;i++) {
          var obj = this.GetAddinById(item.elements[i], id);
          if (obj) return obj;
        }
        return null;
      },

      getAddinById(id){
        return this.GetAddinById(this.rootJson.data, id);
      },

      // 根据UUID获取控件实例
      GetAddinByUUID(item, uuid) {
        if (!item) return null;
        if ("self" in item) {
          if (item.self.uuid == uuid) return item.obj;
        }
        for (var i = 0; i < item.elements.length; i++) {
          var obj = this.GetAddinByUUID(item.elements[i], uuid);
          if (obj) return obj;
        }
        return null;
      },

      // 获取所有控件实例
      GetAllAddin(item) {
        if (!item) return [];
        var res = [];
        if (item.obj) res.push(item.obj);
        for (var i = 0;i < item.elements.length;i++) {
          var _res = this.GetAllAddin(item.elements[i]);
          res = res.concat(_res);
        }
        return res;
      },

      /**
       *  获取所有受控多对象控件
       *  @item
       *  @ids 受控控件oid列表
       *  @return Array 受控对象数组
       */
      GetControlledMutiAddinByIds(item, ids) {
        if (!item) return null;
        let multis = this.getMultiObjComp(item);
        let multisOidList = _.intersection(multis.map(item => item.args.id), ids);
        multis = multis.filter(item => multisOidList.indexOf(item.args.id) !== -1);
        return multis;
      },
      /**
       *  获取所有该操作控件下受控多对象控件实例oids
       *  @item
       *  @ids 受控控件oid列表
       *  @return Array 受控对象oid数组
       */
      GetControlledMutiAddinByOprId(item, id) {
        if (!item) return null;
        let addin = this.GetAddinById(item, id);
        return addin.$data.args.chooseTable;
        // let multisOidList = _.intersection(multis.map(item => item.$el.getAttribute('uuid')), ids);
        // multis = multis.filter(item => multisOidList.indexOf(item.$el.getAttribute('uuid')) !== -1);
        // return multis;
      },
      //获取订阅控件
      getWatchObjComp(item) {
        let watchObjComp = [];
        try {
          let addins = this.GetAllAddin(item);
          for (var i = 0; i < addins.length; i++) {
            if (addins[i].destroySub) {
              watchObjComp.push(addins[i]);
            }
          }
        } catch (e) {
        } finally {
          return watchObjComp;
        }
      },
      //销毁控件内订阅
      destroyAllCompSub(item){
        let watchs = this.getWatchObjComp(item);
        if(watchs && watchs.length > 0){
          try {
            watchs.forEach(watchObj => {
              watchObj.destroySub ? watchObj.destroySub() : '';
              watchObj.destroyListener ? watchObj.destroyListener() : '';
            })
          }catch (e) {
            console.log(`销毁控件内订阅${e}`)
          }
        }
      },
      //获取多对象控件
      getMultiObjComp(item) {
        let multObjComp = [];
        try {
          let addins = this.GetAllAddin(item);
          var _selected = null;
          for (var i = 0; i < addins.length; i++) {
            if (addins[i].getSelected) {
              multObjComp.push(addins[i]);
            }
          }
        } catch (e) {
          // console.log(e);
        } finally {
          return multObjComp;
        }
      },
      async firstMultiCompFresh(item, res, actionType){
        let multis = this.getMultiObjComp(item);
        if(multis && multis[0] && multis[0].name && (multis[0].name == 'RelationTree' || multis[0].name == 'SelfJoinsTree') && res){
          await multis[0].freshData(undefined, true, true, res, actionType);
        }else if(multis.length > 0 && typeof multis[0].freshData === 'function') {
          await multis[0].freshData();
        }
      },
      async firstMultiCompFreshAfterEdit(item, multiObjParams){
        let multis = this.getMultiObjComp(item);
        if(multis.length > 0 && typeof multis[0].freshData === 'function' && !multiObjParams.byFormEngine) {
          await multis[0].freshData();
        }
      },
      AllMultiCompFresh(item, multiObjParams, res){
        let multis = this.getMultiObjComp(item);
        let oids = multiObjParams && multiObjParams.oidList ? multiObjParams.oidList : null;
        if(oids){
          for(let multi of multis){
            // oids.indexOf(multi.$data.args.id) !== -1 ? multi.freshData() : '';
            if(oids.indexOf(multi.$data.args.id) !== -1) {
              if(multi.name == 'RelationTree' || multi.name == 'SelfJoinsTree') {
                multi.freshData('', true, true, res, this.curQueryAction);
              } else {
                item.next_create && multi.freshDataNextCreate ? multi.freshDataNextCreate(item.next_create) : multi.freshData();
              }
            } else {
              // return
            }
          }
        }else{
          for(let multi of multis){
            item.next_create && multi.freshDataNextCreate ? multi.freshDataNextCreate(item.next_create) : multi.freshData();
          }
        }
      },
      // console.log('gridSelectedObj@invokeOperation', this, gridSelectedObj);
      getJsonData(item, id) {
        if (!item) return null;
        if ("self" in item) {
          if (item.self.properties.id == id) return item;
        }
        for (var i = 0;i < item.elements.length;i++) {
          var res = this.getJsonData(item.elements[i], id);
          if (res) return res;
        }
        return null;
      },

      getParentJson(item, id) {
        if (!item) return null;
        for (var i = 0;i < item.elements.length;i++) {
          if (item.elements[i].self && item.elements[i].self.properties.id == id) return item;
          let res = this.getParentJson(item.elements[i], id);
          if (res) return res;
        }
        return null;
      },
      //分类更新，有oid更新，没有新增
      batchUpdate(targetClass, objs){
        return new Promise(async (resolve, reject) => {
          try {
            let _class = await getClass(targetClass);
            let isRelation = _class.data.data.classCategory === "RelationClass";
            let multiObjParams = {
              className: targetClass,
              isRelation: isRelation,
              showMessage: false,
            };
            for(let obj of objs){
              if(obj.oid){
                await this.edit(obj, null, targetClass, multiObjParams);
              }else{
                delete obj['offlineOid'];
                await this.save(obj, null, targetClass, multiObjParams);
              }
            }
            resolve();
          }catch (e) {
            reject(e)
          }
        })
      },
      /**
       * @currentObjs用来拷贝现有行数据
       * @defaultValue初始默认值
       * @keys表头元数据
       * @count生成数据条数
       * @description产生与currentObjs相同结构的空数据
       */
      generateObjs(currentObjs, defaultValue, keys, count) {
        let objTemplate = {};
        if(!currentObjs || currentObjs.length === 0) {
          currentObjs = []
          for(let obj of keys){
            if(obj.field && (obj.field !== '_oprColumn' || obj.field !== '_SNColumn')){
              objTemplate[obj.field] = defaultValue[obj.field] || null
            }
          }
        }else{
          for(let obj in currentObjs[0]){
            switch (obj) {
              default:
                objTemplate[obj] = defaultValue[obj] || null;
                break;
            }
          }
        }
        while (count !== 0){
          objTemplate['offlineOid'] = uuid();
          currentObjs = currentObjs.concat([_.cloneDeep(objTemplate)]);
          count--;
        }
        return currentObjs;
      },
      //实体类删除脚本
      flagEntityDelete(obj, targetClass, originalObjs, flag) {
        if(flag){
          return new Promise(async (resolve, reject) => {
            try {
              // let _class = await getClass(targetClass);
              // let isRelation = _class.data.data.classCategory === "RelationClass";
              let multiObjParams = {
                className: targetClass,
                isRelation: false,
                showMessage: false,
              };
              typeof obj.offlineOid === 'undefined' && obj.oid && await this.delete(obj, null, targetClass, multiObjParams);
              resolve();
            }catch (e) {
              reject(e)
            }
          })
        }else{
          originalObjs.forEach((originalObj, index) => {
            (originalObj.offlineOid && originalObj.offlineOid === obj.offlineOid) || originalObj.oid === obj.oid ? originalObjs.splice(index, 1) : '';
          });
          return originalObjs;
        }
      },
      //关联类删除脚本
      flagRelationDelete(obj, targetClass, originalObjs, flag) {
        if(flag){
          return new Promise(async (resolve, reject) => {
            try {
              // let _class = await getClass(targetClass);
              // let isRelation = _class.data.data.classCategory === "RelationClass";
              let multiObjParams = {
                className: targetClass,
                isRelation: true,
                showMessage: false,
              };
              typeof obj.offlineOid === 'undefined' && obj.relation_oid && await this.delete(obj, null, targetClass,  multiObjParams);
              resolve();
            }catch (e) {
              reject(e)
            }
          })
        }else{
          originalObjs.forEach((originalObj, index) => {
            (originalObj.offlineOid && originalObj.offlineOid === obj.offlineOid) || originalObj.relation_oid === obj.relation_oid ? originalObjs.splice(index, 1) : '';
          });
          return originalObjs;
        }
      },
      /**
       * 生成类空对象
       */
      createObj(className){
        return new Promise(async (resolve, reject) => {
          try {
            let obj = {};
            let sysProp = ['currentProcess', 'owner', 'id', 'lastModifyTime', 'lastModifier', 'createTime', 'creator', 'oid'];
            let meta = this.AttributesByClass(className).length === 0 ? await this.getAttributeClassMap(className) : this.AttributesByClass(className);
            for (let prop of meta) {
              if (sysProp.indexOf(prop.attributeName) === -1) {
                obj[prop.attributeName] = prop.defaultValue || null;
              }
            }
            obj.oid = uuid();
            resolve(obj)
          } catch (e) {
            reject(e)
          }
        })
      },
      /**
       * 获取全局脚本
       */
      async initGlobalScript(){
        try {
          let res = await getGlobalOperation();
          if(res.data.success){
            this.globalScript = `try{${res.data.data}}catch(e){console.log(e)}`;
          }else{
            this.globalScript = '';
          }
        }catch(e){
          console.log(`--------------获取全局脚本失败${e}`)
        }
      },
      /**
       * 初始化脚本禁止执行this.freshData();
       */
      resolveScript(code){
        let exg = /this\.freshData\(\S*\)/g;
        return code.replace(exg, '');
      },
      /*
       执行脚本
       code: 脚本字符串
       params: 注入对象
       store: store对象
       jsonData: 脚本生效的目标表单的jsonData
       multiObjParams: 操作按钮回填的参数
       */
      async handleScript(code, params, store, jsonData, multiObjParams) {
        if (!jsonData) jsonData = { data: null };
        let that = this;
        let _params = {
          dwf_axios: dwf_app_axios, dwf_modeler_axios: axios, axios: Axios.create({ baseURL: "", withCredentials: true }),
          msgbox: Message, data: null,
          msgboxDialog: this.msgboxDialog,
          addExtraObj: (obj) => { return that.addExtraObj(jsonData.data, obj); },
          getRootAddin: () => {return that},
          GetAddinById: (id) => { return that.GetAddinById(jsonData.data, id); },
          GetAddinByUUID: (id) => { return that.GetAddinByUUID(jsonData.data, id); },
          GetTargetAddin: () => { return that.GetControlledMutiAddinByIds(jsonData.data, multiObjParams.oidList); },
          GetTargetAddinIds: multiObjParams && multiObjParams.oidList ? multiObjParams.oidList : [],
          customData: multiObjParams && multiObjParams.customData ? multiObjParams.customData : null,
          GetAllAddin: () => { return that.GetAllAddin(jsonData.data); },
          obj: that.GetObj(jsonData.data),
          formObj: this.GetObj(this.rootJson.data),
          getObj: (flag) => { return that.GetObj(jsonData.data, flag); },
          validateForm: () => { that.returnValidateValue = true; return that.GetObj(jsonData.data, true, true); },
          util: that.util,
          originObj: jsonData.data ? jsonData.data.origin : null,
          create: (obj, className, params) => that.save(obj, jsonData, className, params),
          delete: (obj, className, params) => that.delete(obj, jsonData, className, params),
          edit: (obj, className, params) => that.edit(obj, jsonData, className, params),
          refresh: (obj) => that.refresh(obj, jsonData),
          update: (obj) => that.update(obj, jsonData),
          generateUUID: () => uuid(),
          createObj: (className) => this.createObj(className),
          spinShow: (spinType) => this.spinShow(spinType),
          spinHide: () => this.spinHide(),
          turnToModeler: (targetClass, viewName) => that.turnToModeler(targetClass, viewName),
          returnSync: (obj) => this.openDialog(obj),
          closeDialog: (obj = true) => { this.$emit('closeDialog', this.query, obj); return obj },
          closeTab: (obj) => {
            if(this.root){
              this.root.activePendingTaskQueue(this.root.tab, obj);
              this.root.onTabRemove(this.root.tab);
            }
          },
          closeTabById: (tab, obj) => {
            if(this.root){
              this.root.activePendingTaskQueue(tab, obj);
              this.root.onTabRemove(tab);
            }
          },
          getSocketId: () => getSockId(),
          sendMsg: (param) => {
            let params = {
              command: 'from user script',
              ...param
            }
            getWs().send(JSON.stringify(params));
          },
          displayType: jsonData.data && jsonData.data.displayType ? jsonData.data.displayType : "visit",
          store: store, className: jsonData.data ? jsonData.data.targetClass : null,
          getOperation: (className, operationName) => {
            if(className && operationName){
              return getEntitiesOperationsByName(className, operationName);
            }else{
              return null;
            }
          },
          executeOperation: async (operation, customData) => {
            if(this.executeOperationProgress){
              that.$Message.error('禁止invokeEvent与executeOperation脚本嵌套使用');
              this.executeOperationProgress = false;
              return;
            }
            this.executeOperationProgress = true;
            return await this.invokeOperation('query', operation, jsonData, store, null, null, null, {customData: customData});
          }
        };
        _params.getAddinById = _params.GetAddinById;
        _params.getAllAddin = _params.GetAllAddin;
        _params.getTargetAddin = _params.GetTargetAddin;
        _params.getTargetAddinIds = _params.GetTargetAddinIds;
        _params.env = store && store.state && store.state.DWF_global ? {
          serverURL: `${store.state.DWF_global.serverIp}:${store.state.DWF_global.serverHost}`,
          serverIp: store.state.DWF_global.serverIp,
          serverPort: store.state.DWF_global.serverHost,
        } : {
          serverURL: '',
          serverIp: '',
          serverPort: '',
        };
        try {
          _params.env.metaServicePort = new URL(serverConfig.baseUrl).port;
        }catch (e) {
          _params.env.metaServicePort = '';
        }
        try {
          _params.env.objServicePort = new URL(serverConfig.baseObjOther).port;
        }catch (e) {
          _params.env.objServicePort = '';
        }
        _params.user = {
          userName: sessionStorage.getItem('username') || '',
          displayName: sessionStorage.getItem('displayName') || '',
          oid: sessionStorage.getItem('oid') || '',
          userId: sessionStorage.getItem('userId') || '',
          token: sessionStorage.getItem('token') || '',
          userGroups: JSON.parse(sessionStorage.getItem('userGroups')) || '',
        };
        _params.env.appConfig = store && store.state && store.state.DWF_global ? store.state.DWF_global.appConfig : '';
        let storeFunc = ["Entities", "EntitySingle", "Relations", "RelationSingle", "QueryResult", "QueryResultAll", "updateFView",
          "deleteFView", "queryEntity", "queryRelation", "handleQueryData", "handleQueryForm", "deleteEObj", "saveEObj", "editEObj",
          "deleteEJObj", "saveEJObj", "editEJObj"];
        storeFunc.forEach(x => _params[x] = that[x]);
        _params.handleQueryData = async (queryData) => { let a = await that.handleQueryData(queryData); console.log("res:", a); return a; }
        _params.freshData = (query) => {
          if(!query) query = this.query;
          this.handle(null, query, true);
        };
        let otherParams = ["data", "selectedObjs", "openForm", "confirmData", "param", "openTab", "openDrawer", "thisAddinId", "websocket", "operationObj"];
        otherParams.forEach(x => {
          if (x in params) {
            _params[x] = params[x];
          }
        })
        _params.getSourceAddin = () => {
          if(typeof _params.thisAddinId === 'string'){
            return this.getAddinById(_params.thisAddinId);
          }else{
            return _params.thisAddinId
          }
        }
        if (!_params.data) _params.data = jsonData.paramData ? jsonData.paramData : null;
        if (!_params.selectedObjs) {
          try {
            let addins = this.GetAllAddin(jsonData.data);
            var _selected = null;
            for (var i = 0; i < addins.length;i++) {
              if (addins[i].getSelected) {
                let objs = addins[i].getSelected();
                if (objs && objs.length > 0) {
                  // this.defaultObjsAddin = !this.defaultObjsAddin ? addins[i] : this.defaultObjsAddin;
                  let _class = addins[i].getAttrMap();
                  if(_class[_class.length-1].className == jsonData.data.targetClass){
                  // if (_class.length == 1 && _class[0].className == jsonData.data.targetClass) {
                    _selected = objs;
                    break;
                  }
                }
              }
            }
            if (_selected) {
              _params.selectedObjs = _selected;
            }
            _params.defaultObjsAddin = this.defaultObjsAddin ? this.defaultObjsAddin : null;
            _params.selectedObjs = this.defaultObjsAddin ? this.defaultObjsAddin.getSelected() : _params.selectedObjs;
          } catch (e) {
            // console.log(e);
          }
        }
        _params.callServer = async (customData, scriptName = 'default') => {
          if(_params.operationObj){
            let body = {
              className: jsonData.data.targetClass,
              selectedObjs: _params.selectedObjs,
              objs: [this.GetObj(jsonData.data)],
              sockId: getSockId(),
              customData: customData
            }
            let response;
            response = await getExecute(_params.operationObj.authority, body, scriptName, _params.operationObj.scriptType);
            return response;
          }else{
            return null
          }
        }
        if(this.globalScript) code = `${this.globalScript}${code}`;
        let _obj;
        try {
          _obj = await new Function(code).call(_params);
        }catch (e) {
          console.log(`handleScript执行${e}`);
        }
        return _obj;
      },

      getRootJson(){
        return this.rootJson;
      },

      addinMixin(){
        let _this = this;
        return {
          data(){
            return {
              // dwf_ctx: {
              //   dwf_axios: dwf_app_axios,
              //   dwf_modeler_axios: axios,
              //   msgbox: Message,
              //   msgboxDialog: _this.msgboxDialog,
              //   env: store && store.state && store.state.DWF_global ? {
              //     serverURL: `${store.state.DWF_global.serverIp}:${store.state.DWF_global.serverHost}`,
              //     serverIp: store.state.DWF_global.serverIp,
              //     serverPort: store.state.DWF_global.serverHost,
              //     metaServicePort: new URL(serverConfig.baseUrl).port,
              //     objServicePort: new URL(serverConfig.baseObjOther).port,
              //     appConfig: store.state.DWF_global.appConfig,
              //   } : {
              //     serverURL: '',
              //     serverIp: '',
              //     serverPort: '',
              //     metaServicePort: new URL(serverConfig.baseUrl).port,
              //     objServicePort: new URL(serverConfig.baseObjOther).port,
              //     appConfig: '',
              //   },
              //   user: {
              //     userName: sessionStorage.getItem('username') || '',
              //     displayName: sessionStorage.getItem('displayName') || '',
              //     oid: sessionStorage.getItem('oid') || '',
              //     userId: sessionStorage.getItem('userId') || '',
              //     token: sessionStorage.getItem('token') || '',
              //     userGroups: JSON.parse(sessionStorage.getItem('userGroups')) || '',
              //   },
              //   displayType: () => _this.getRootJson().data && _this.getRootJson().data.displayType ? _this.getRootJson().data.displayType : "visit",
              //   className: () => _this.getRootJson().data ? _this.getRootJson().data.targetClass : null,
              //   getRootAddin: () => _this,
              //   getAddinById: (id) => _this.GetAddinById(_this.getRootJson().data, id),
              //   getAllAddin: () => _this.GetAllAddin(_this.getRootJson().data),
              //   obj: () => _this.GetObj(_this.getRootJson().data),
              //   validateForm: () => {
              //     _this.returnValidateValue = true;
              //     return _this.GetObj(_this.getRootJson().data, true, true);
              //   },
              //   create: (obj, className, params) => _this.save(obj, _this.getRootJson(), className, params),
              //   delete: (obj, className, queryData, params) => _this.delete(obj, _this.getRootJson(), className, queryData, params),
              //   edit: (obj, className, params) => _this.edit(obj, _this.getRootJson(), className, params),
              //   spinShow: (spinType) => _this.spinShow(spinType),
              //   spinHide: () => _this.spinHide(),
              //   closeDialog: (obj = true) => {
              //     _this.$emit('closeDialog', _this.query, obj);
              //     return obj;
              //   },
              //   closeTab: (obj) => {
              //     if(_this.root){
              //       _this.root.activePendingTaskQueue(_this.root.tab, obj);
              //       _this.root.onTabRemove(_this.root.tab);
              //     }
              //   },
              //   closeTabById: (tab, obj) => {
              //     if(_this.root){
              //       _this.root.activePendingTaskQueue(tab, obj);
              //       _this.root.onTabRemove(tab);
              //     }
              //   },
              //   // getSocketId: () => getSockId(),
              //   // sendMsg: (param) => {
              //   //   let params = {
              //   //     command: 'from user script',
              //   //     ...param
              //   //   }
              //   //   getWs().send(JSON.stringify(params));
              //   // },
              //   getOperation: (className, operationName) => {
              //     if(className && operationName){
              //       return getEntitiesOperationsByName(className, operationName);
              //     }else{
              //       return null;
              //     }
              //   },
              //   executeOperation: async (operation, customData) => {
              //     // if(_this.executeOperationProgress){
              //     //   _this.$Message.error('禁止invokeEvent与executeOperation脚本嵌套使用');
              //     //   _this.executeOperationProgress = false;
              //     //   return;
              //     // }
              //     // _this.executeOperationProgress = true;
              //     return await _this.invokeOperation('query', operation, _this.getRootJson(), store, null, null, null, {customData: customData});
              //   },
              //   handleQueryData: async (queryData) => {
              //     return await _this.handleQueryData(queryData);
              //   },
              //   selectedObjs: () => {
              //     let _selected = null;
              //     try {
              //       let addins = _this.GetAllAddin(_this.getRootJson().data);
              //       for (var i = 0; i < addins.length;i++) {
              //         if (addins[i].getSelected) {
              //           let objs = addins[i].getSelected();
              //           if (objs && objs.length > 0) {
              //             let _class = addins[i].getAttrMap();
              //             if(_class[_class.length-1].className == _this.getRootJson().data.targetClass){
              //               _selected = objs;
              //               break;
              //             }
              //           }
              //         }
              //       }
              //       _selected = _this.defaultObjsAddin ? _this.defaultObjsAddin.getSelected() : _selected;
              //     }catch (e) {
              //
              //     }
              //     return _selected;
              //   },
              //   defaultObjsAddin: () => {
              //     return _this.defaultObjsAddin ? _this.defaultObjsAddin : null;
              //   },
              //   openForm: (targetClass, viewName, args, displayType, initParams) => {
              //     args ? args.displayType = displayType : args = {}, args.displayType = displayType;
              //     _this.openForm(_this.getRootJson(), {}, targetClass, viewName, args, initParams);
              //   },
              //   openTab: (queryOpr, args) => {
              //     _this.openTab(_this.getRootJson(), {}, queryOpr, args);
              //   },
              //   openDrawer: (targetClass, viewName, direction, args, displayType, initParams) => {
              //     args ? args.displayType = displayType : args = {}, args.displayType = displayType;
              //     _this.openForm(_this.getRootJson(), {}, targetClass, viewName, args, initParams, direction);
              //   }
              // },
            }
          }
        }
      },

      isJson(str) {
        if(/^\d*$/g.test(str)){
          return false;
        }
        try {
          JSON.parse(str);
        } catch (e) {
          return false;
        }
        return true;
      },

      // 更新表单并渲染
      async handle(path, query, fresh) {
        //单页签关联类刷新
        if(this.isSingleTab) fresh = true
        if(fresh) this.freshStore = true;
        await this.initGlobalScript();
        if (path) {
          if (this.path != path) {
            this.path = path;
            this.queryData.targetClass = "";
          }
        }
        if (query) this.query = query;
        if (this.query.paramsStr) this.query.params = JSON.parse(this.query.paramsStr);
        if (this.rootJson && this.rootJson.data) {
          this.destroyAllCompSub(this.rootJson.data);
          this.destroyJsonData(this.rootJson.data);
        }
        if (this.query && "displayType" in this.query && this.query.displayType) {
          this.query.displayType == 'createForm' ? this.query.displayType = 'create' : ''
          this.query.displayType == 'editForm' ? this.query.displayType = 'edit' : ''
          this.query.displayType = this.query.displayType.replace(/"/g,"").replace(/'/g,"").replace(/\s/g, "");
        }
        this.modalCallback = null;
        if (this.query.params && this.query.params.modalCallback) this.modalCallback = this.query.params.modalCallback;
        await this.initFormDate();
        await this.createFormBase(this.previewJson);

        // 双向通讯模块
        this.createListener();
        this.createSub();
      },

      //加载表单json,查询表单数据
      async initFormDate() {
        let width = document.body.clientWidth;
        let height = document.body.clientHeight;
        let deviceType = 'actPc';
        if (os().isPc) {
          deviceType = 'actPc';
        } else if (os().isTablet) {
          if (height > width) deviceType = 'actIpad';
          else deviceType = 'actIpadH';
        } else {
          if (height > width) deviceType = 'actPhone';
          else deviceType = 'actPhoneH';
        }
        // this.queryData.deviceType = deviceType;
        if (this.queryData.targetClass == "") {
          var _path = this.path;
          this.queryData.targetClass = _path.split("/")[2]; // 实体类名称
          this.queryData.formName = _path.split("/")[3]; // 表单名称
          if (this.queryData.targetClass) {
            let _class = await getClass(this.queryData.targetClass);
            _class = _class.data.data;
            try {
              if (_class.classCategory == "RelationClass") {
                this.isRelation = true;
                let res = await this.queryRelation(this.queryData.targetClass);
                this.relation = res;
                this.queryData.leftClass = this.relation.leftClass;
                this.queryData.rightClass = this.relation.rightClass;
                this.queryData.relationClass = this.relation.className;
                this.queryEntity(this.queryData.leftClass);
                this.queryEntity(this.queryData.rightClass);
              } else {
                this.isRelation = false;
                this.queryEntity(this.queryData.targetClass);
              }
              this.queryData.isRelation = this.isRelation;
              this.previewJson = await this.handleQueryForm(this.queryData);
            }catch (e) {
              console.log(`previewJson获取${e}`)
            }
            try {
              if (this.isRelation){
                this.basicInfo = this.RelationFormBasicInfo(this.queryData.targetClass, this.queryData.formName);
              }else{
                this.basicInfo = this.EntityFormBasicInfo(this.queryData.targetClass, this.queryData.formName);
              }
              this.basicInfo = JSON.parse(this.basicInfo);
            }catch (e) {
              console.log(`basicInfo获取${e}`)
            }
          }
        }
        if (this.isRelation){
          this.attributesList = {};
          this.queryData.iotdbDeviceAttributes = {};
          this.attributesList.left = this.AttributesByClass(this.queryData.leftClass).length === 0
            ? await this.getAttributeClassMap(this.queryData.leftClass)
            : this.AttributesByClass(this.queryData.leftClass);
          this.queryData.iotdbDevice = this.attributesList.left.filter(item => item.valueType === 'Timeseries').length !== 0;
          this.queryData.iotdbDeviceAttributes.left = this.queryData.iotdbDevice ? this.attributesList.left.filter(item => item.valueType === 'Timeseries') || [] : null;

          this.attributesList.relation = this.AttributesByClass(this.queryData.relationClass).length === 0
            ? await this.getAttributeClassMap(this.queryData.relationClass)
            : this.AttributesByClass(this.queryData.relationClass);
          this.queryData.iotdbDevice = this.attributesList.relation.filter(item => item.valueType === 'Timeseries').length !== 0 || this.queryData.iotdbDevice;
          this.queryData.iotdbDeviceAttributes.relation = this.queryData.iotdbDevice ? this.attributesList.relation.filter(item => item.valueType === 'Timeseries') || [] : null;

          this.attributesList.right = this.AttributesByClass(this.queryData.rightClass).length === 0
            ? await this.getAttributeClassMap(this.queryData.rightClass)
            : this.AttributesByClass(this.queryData.rightClass);
          this.queryData.iotdbDevice = this.attributesList.right.filter(item => item.valueType === 'Timeseries').length !== 0 || this.queryData.iotdbDevice;
          this.queryData.iotdbDeviceAttributes.right =  this.queryData.iotdbDevice ? this.attributesList.right.filter(item => item.valueType === 'Timeseries') || [] : null;
        }else{
          this.attributesList = this.AttributesByClass(this.queryData.targetClass).length === 0 ? await this.getAttributeClassMap(this.queryData.targetClass) : this.AttributesByClass(this.queryData.targetClass);
          this.queryData.iotdbDevice = this.attributesList.filter(item => item.valueType === 'Timeseries').length !== 0;
          this.queryData.iotdbDeviceAttributes = this.queryData.iotdbDevice ? this.attributesList.filter(item => item.valueType === 'Timeseries') || [] : null;
        }
        var _query = this.query;
        if (!_query) _query = { query: "" };
        //继承刷新条件
        try {
          if (!_query.query){
            _query.query = JSON.parse(localStorage.getItem(`${this.root.tab}`)).query;
          }
        }catch (e) {
          if (!_query.query){
            _query.query = "";
          }
        }
        //nextCreate内存对象
        if(_query.params && _query.params._obj && _query.params._obj.nextCreateOid){
          _query.obj = _query.params._obj;
        }
        if (_query.params && _query.params.initScript && _query.params.initScript.length > 0) {
          // 尚未执行初始化脚本,需要执行
          //新的Tab页签不需要执行上一次的initScript
          // forms-engine 950&1929
          // 在openTab时添加conType参数为tab使得dialog与tab时向下一层表单传入query做区分
          // tab为新开页面，执行传入的query出错时阻塞逻辑
          // 改为tab页签时不执行因上层query导致的脚本错误阻塞
          if (_query.params.initScriptNeed && _query.params.conType !== 'tab') {
            let obj = await this.handleScript(this.resolveScript(_query.params.initScript), {}, this.store, null);
            if (obj) {
              if (obj.query) _query.query = obj.query;
              if (obj.obj) _query.obj = obj.obj;
              if (obj.data) _query.data = obj.data;
              if (obj.displayType) _query.displayType = obj.displayType;
            }
          }
          if (_query.params.query) _query.query = _query.params.query;
          if (_query.params._obj) _query.obj = _query.params._obj;
          if (_query.params.data) _query.data = _query.params.data;
        } else if (_query.params && _query.params.condition && _query.params.condition.length > 0) {
          _query.query = _query.params.condition;
        } else if(_query.params){
          if (_query.params._obj) _query.obj = _query.params._obj;
          if (_query.params.data) _query.data = _query.params.data;
        }
        _query.query = this.parseEscapeString(_query.query, null, null, null, null, this.store);
        if(this.queryData.targetClass){
          this.query = _query;
          // 对查询语句进行转义处理
          this.queryData.query = _query;
          if (this.isRelation) this.queryData.query.type = "relation";
          // this.queryData.fresh = true;
          // 进行表单查询,根据实体类名和表单名获取表单json,保存到store中
          if (_query.obj) {
            this.queryData.uuid = _query.obj.oid ? _query.obj.oid : null;
          } else {
            // 进行数据查询,根据查询条件获取查询数据,保存到store中
            if(typeof this.queryData.query.startIndex === 'undefined' && typeof this.queryData.query.pageSize === 'undefined'){
              this.queryData.query.startIndex = 0;
              this.queryData.query.pageSize = 1;
            }
            if(this.freshStore) {
              this.queryData.fresh = true;
              this.freshStore = false;
            }
            this.handleQueryDataResult = await this.handleQueryData(this.queryData);
            if(this.handleQueryDataResult && this.handleQueryDataResult.code === 400 && this.handleQueryDataResult.message){
              this.$Message.error(this.handleQueryDataResult.message);
            }
            // 从store中获取查询到的数据结果
            this.queryData.uuid = this.QueryResult(this.queryData);
            if (this.queryData.uuid) this.queryData.uuid = this.queryData.uuid[0];
          }
        }
      },

      // 渲染表单
      async createFormBase(json) {
        try {
          this.reloadFormEngine = false;
          this.rootJson = JSON.parse(json);//BUG4029貌似和以前的BUG有冲突?
          this.$nextTick(() => {
            this.reloadFormEngine = true;
            this.$nextTick(() => {
              // 调用初始化操作
              if (this.rootJson.init_opr_type) {
                let multiObjParams = this.sysEventPath.includes(this.rootJson.init_opr_path) ? {
                  sysEventObj: {
                    opr_sys_path: this.rootJson.init_opr_sys_path,
                    opr_showMessage: this.rootJson.init_opr_showMessage,
                  }
                } : null
                this.invokeOperation(this.rootJson.init_opr_type, this.rootJson.init_opr_path, this.rootJson, this.store, this.queryData, null, null, multiObjParams);
              }
            })
          })
          // Object.assign(this.rootJson, JSON.parse(json));
          this.form_bgColor = this.basicInfo ? this.basicInfo.form_bgColor : '#f3f3f3';
          if (this.query.data) this.rootJson.paramData = this.query.data;
          if (!this.rootJson.opr_path && this.query.params && this.query.params.opr_path) {
            this.rootJson.opr_type = this.query.params.opr_type;
            this.rootJson.opr_path = this.query.params.opr_path;
            if (this.query.params.opr_name && this.query.params.opr_name != "") this.rootJson.opr_name = this.query.params.opr_name;
          }
          if (this.query.params && this.query.params.oidList) this.rootJson.oidList = this.query.params.oidList;
          if (this.query.params && this.query.params.sourceTab) this.rootJson.sourceTab = this.query.params.sourceTab; //源tab页签

          this.$emit('updateText', this.rootJson.opr_name, this.queryData.targetClass);
          this.rootJson.data.isRelation = this.isRelation;
        } catch (e) {
          console.log(`加载表单内容错误，表单内容为空！${e}`);
          return;
        }
        this.rootJson.data.displayType = this.query.displayType;
        this.rootJson.data.deviceType = this.queryData.deviceType;
        console.log("this.query.obj",this.query.obj);
        try {
          // 将查询结果id放入json
          //this.queryData.iotdbDevice
          switch (false) {
            case true:
              if (this.query.obj) this.rootJson.data.origin = this.query.obj;
              else if (this.query.displayType != "create" && this.query.displayType != "creates") {
                //IOTDB搜索条件
                let query = this.queryData.iotdbDeviceAttributes.map(item => {
                  return {
                    "attrName": item.attributeName,
                    "count": 1,
                    "type": "latest"
                  }
                })
                if(this.isRelation){
                  let rel = await getRobjSingle(this.queryData.targetClass, this.queryData.uuid, query);
                  rel = rel.data.data;
                  if(rel){
                    let left = await getEobjSingle(rel.leftClass, rel.leftOid, query);
                    let right = await getEobjSingle(rel.rightClass, rel.rightOid, query);

                    for (var i in rel) this.rootJson.data.origin["relation_" + i] = rel[i];
                    for (var i in left) this.rootJson.data.origin["left_" + i] = left[i];
                    for (var i in right) this.rootJson.data.origin["right_" + i] = right[i];

                  }
                }else{
                  console.log("getEobjSingle",this.queryData.targetClass, this.queryData.uuid, query);
                  this.rootJson.data.origin = await getEobjSingle(this.queryData.targetClass, this.queryData.uuid, query);
                }
                //uuid对应对象尚未绑定IOTDB返回400，走原查询
                if(this.rootJson.data.origin.data.code === 400){
                  this.rootJson.data.origin = ( this.isRelation ? this.RelationSingleA(this.queryData.targetClass, this.queryData.uuid) : this.EntitySingle(this.queryData.targetClass, this.queryData.uuid));
                }else{
                  this.rootJson.data.origin = this.rootJson.data.origin.data.data;
                }

              } else{
                this.rootJson.data.origin = {};
              }
              break;
            default:
              if (this.query.obj) this.rootJson.data.origin = this.query.obj;
              else if (this.query.displayType != "create" && this.query.displayType != "creates") this.rootJson.data.origin = ( this.isRelation ? this.RelationSingleA(this.queryData.targetClass, this.queryData.uuid) : this.EntitySingle(this.queryData.targetClass, this.queryData.uuid));
              else this.rootJson.data.origin = {};
              break;
          }
          if (!this.rootJson.data.origin) this.rootJson.data.origin = {};
          this.obj = this.rootJson.data.origin;
          console.log("this.obj", this.obj);
        } catch (e) {
          console.log("数据查询失败", e);
        }
        this.$nextTick(async () =>{
          if(this.basicInfo.defaultMultiAddin){
            this.defaultObjsAddin = this.getAddinById(this.basicInfo.defaultMultiAddin);
          }
          if('params' in this.query && 'needDefOpr' in this.query.params && this.query.params.needDefOpr) {
            this.showDefOpr = true;
            if (this.query.params.needDefOprAction == "create") {
              this.defOprText = this.rootJson.opr_name && this.rootJson.opr_name != "" ? this.rootJson.opr_name : "新增";
            } else if (this.query.params.needDefOprAction == "edit") {
              this.defOprText = this.rootJson.opr_name && this.rootJson.opr_name != "" ? this.rootJson.opr_name : "修改";
            } else if (this.query.params.needDefOprAction == "next_create") {
              this.defOprText = this.rootJson.opr_name && this.rootJson.opr_name != "" ? this.rootJson.opr_name : "级联";
            } else if (this.query.params.needDefOprAction == "visit") {
              this.defOprText = this.rootJson.opr_name && this.rootJson.opr_name != "" ? this.rootJson.opr_name : "确定";
            }
            let authName;
            if(this.defOprText == '新增' || this.defOprText == '级联' ){
              authName = 'CreateObjects'
            }else if(this.defOprText == '修改'){
              authName = 'EditObjects'
            }
            if(authName){
              try {
                let auth = await checkClasses(authName, this.queryData.targetClass);
                if(!auth.data) {
                  this.unAuthOprTab = true;
                }else{
                  this.unAuthOprTab = false;
                }
              }catch (e) {
                console.log(`弹窗/滑窗操作权限${e}`)
              }
            }
          }
          this.executePendingTaskQueue();
        })
      },

      // 更新表单前端数据
      async updateData(element, obj) {
        if (element.obj) {
          if (element.obj.getFormName && element.obj.setValue) {
            var name = element.obj.getFormName();
            if (name in obj) {
              await element.obj.setValue(obj[name]);
              //fix bug 6808
              // element.obj.validate();
            } else if (JSON.stringify(obj) == "{}") {
              if ("defaultValue" in element.self.properties && ((Object.prototype.toString.call(element.self.properties.defaultValue) === '[object Array]' && element.self.properties.defaultValue.length !== 0) || (Object.prototype.toString.call(element.self.properties.defaultValue) !== '[object Array]' && element.self.properties.defaultValue))) {
                element.obj.setValue(element.self.properties.defaultValue)
              } else {
                let attr = name ? this.Attributes(name.replace(/^(relation_|left_|right_)/g, '')) : null;
                if (attr && attr.defaultValue != undefined) {
                  element.obj.setValue(attr.defaultValue);
                } else {
                  element.obj.setValue(null);
                }
              }
            }
          } else if (element.obj.freshData) {
            // element.obj.freshData();
          }
        }
        if (element.elements && element.elements.length) {
          element.elements.forEach(e => {
            this.updateData(e, obj);
          })
        }
      },

      // 更新表单前端数据
      async update(obj, jsonData) {
        if (!jsonData) jsonData = this.rootJson;
        if (!obj) obj = this.GetObj(jsonData.data);
        if(jsonData.data.displayType == 'create')  obj = {};
        jsonData.data.origin = obj;
        this.updateData(jsonData.data, obj);
        // let that = this;
        // var queryData = {
        //   targetClass: that.rootJson.data.targetClass,
        //   query: {},
        //   fresh: false,
        // }
        // await that.handleQueryData(queryData);
        // queryData.uuid = that.QueryResult(queryData);
        // if (queryData.uuid) queryData.uuid = queryData.uuid[queryData.uuid.length-1];
        // that.rootJson.data.origin = that.EntitySingle(queryData.targetClass, queryData.uuid);
        // that.updateData(that.rootJson.data, queryData);
      },

      /*
        新增对象,并更新当前表单前端
        obj: 新增的目标对象
        jsonData: 当前表单对应的jsonData
        className: 目标对象的类名
        eventObj: 触发操作的事件对象
        当且仅当 当前表单的目标类和目标对象的类名相同时,会更新表单前端
       */
      async save(obj, jsonData, className, multiObjParams, eventObj) {
        console.log(eventObj)
        let _res = null;
        if (!jsonData) jsonData = this.rootJson;
        if (!className) className = jsonData.data.targetClass;
        let isRelation;
        if (!multiObjParams) {
          isRelation = jsonData.data.isRelation;
        }else{
          isRelation = multiObjParams.isRelation;
          multiObjParams.showMessage = typeof multiObjParams.showMessage === 'boolean' ? multiObjParams.showMessage : typeof multiObjParams.showMessage === 'undefined';
        }
        if(eventObj && eventObj.opr_showMessage !== undefined){
          !multiObjParams ? (multiObjParams = {}, multiObjParams.showMessage = eventObj.opr_showMessage) : multiObjParams.showMessage = eventObj.opr_showMessage;
        }
        if (!obj) {
          let tmp = this.GetObj(jsonData.data, true, false, {
            multiObjParams: multiObjParams
          });
          obj = tmp[0];
          if (!tmp[1]) return null;
        }
        if ("oid" in obj) delete obj.oid;
        if('_next_create' in obj && obj._next_create.length !== 0){
          //扁平化obj
          let cudList = this.flattenNextCreate(obj);
          let tobeList = this._generateNextCreateObjects(obj);
          delete obj._next_create;
          cudList.push({
            className: jsonData.data.targetClass,
            objs: obj
          });
          let cudRes = [];
          cudList.forEach((item, index) => {
            // if(this.Entities(item.className).classCategory == "RelationClass"){
            let findIndex = cudRes.findIndex(cud => cud.className === item.className)
            if(findIndex !== -1){
              cudRes[findIndex].objs.push(item.objs)
            }else{
              let cudPart = {
                action: 'createOrUpdate',
                className: item.className,
                objs :[item.objs]
              }
              cudRes.push(cudPart)
            }
            // }else{
            //
            // }
          })
          if(tobeList && tobeList.length !== 0){
            //级联创建关联
            try {
              let _res = await this.toBeNextCreate(tobeList);
              if (!_res) throw "error";
              this.clearNextCreate(jsonData.data);
              this.update({}, jsonData);
              if (!multiObjParams || multiObjParams.showMessage) this.$Message.success("新增成功");
              return _res
            } catch (e) {
              if (e != "error") {
                this.$Message.error(e);
              } else {
                this.$Message.error("级联新增错误");
              }
              return null;
            }
          }else{
            //级联创建实体
            try {
              let _res = await this.cudBatch(cudRes);
              if (!_res) throw "error";
              this.clearNextCreate(jsonData.data);
              this.update({}, jsonData);
              if (!multiObjParams || multiObjParams.showMessage) this.$Message.success("新增成功");
              return _res
            } catch (e) {
              if (e != "error") {
                this.$Message.error(e);
              } else {
                this.$Message.error("级联新增错误");
              }
              return null;
            }
          }
        }else if('_next_create' in obj && obj._next_create.length === 0){
          //删除级联相关信息
          delete obj.isRelation;
          delete obj.oid;
          delete obj.tobeClassName;
          delete obj.tobeOid;
          delete obj._next_create;
        }
        if (isRelation) {
          _res = {};
          let leftObj = {};
          for (var i in obj) {
            if (i.startsWith("left_")) leftObj[i.substr(5)] = obj[i];
          }
          let leftClass = multiObjParams && multiObjParams.leftClass ? multiObjParams.leftClass : this.relation.leftClass;
          let newLeftObj = { className: leftClass, obj: leftObj };
          if ("relation_leftOid" in obj || "left_oid" in obj) {
            try {
              newLeftObj.obj.oid = "relation_leftOid" in obj ? obj.relation_leftOid : obj.left_oid;
              let res = await this.editEObj(newLeftObj);
              if (!res) throw "error";
              obj.relation_leftOid = res.oid;
              obj.left_oid = res.oid;
              for (var i in res) _res["left_" + i] = res[i];
            } catch (e) {
              if (e != "error") {
                this.$Message.error(e);
              } else {
                this.$Message.error("修改左对象失败");
              }
              // return null;
            }
          } else {
            try {
              let res = await this.saveEObj(newLeftObj);
              if (!res) throw "error";
              obj.relation_leftOid = res.oid;
              obj.left_oid = res.oid;
              for (var i in res) _res["left_" + i] = res[i];
            } catch (e) {
              if (e != "error") {
                this.$Message.error(e);
              } else {
                this.$Message.error("新增左对象失败");
              }
              // return null;
            }
          }

          let rightObj = {};
          for (var i in obj) {
            if (i.startsWith("right_")) rightObj[i.substr(6)] = obj[i];
          }
          let rightClass = multiObjParams && multiObjParams.rightClass ? multiObjParams.rightClass : this.relation.rightClass;
          let newRightObj = { className: rightClass, obj: rightObj };
          if ("relation_rightOid" in obj || "right_oid" in obj) {
            try {
              newRightObj.obj.oid = "relation_rightOid" in obj ? obj.relation_rightOid : obj.right_oid;
              let res = await this.editEObj(newRightObj);
              if (!res) throw "error";
              obj.relation_rightOid = res.oid;
              obj.right_oid = res.oid;
              for (var i in res) _res["right_" + i] = res[i];
            } catch (e) {
              if (e != "error") {
                this.$Message.error(e);
              } else {
                this.$Message.error("修改右对象失败");
              }
              // return null;
            }
          } else {
            try {
              let res = await this.saveEObj(newRightObj);
              if (!res) throw "error";
              obj.relation_rightOid = res.oid;
              obj.right_oid = res.oid;
              for (var i in res) _res["right_" + i] = res[i];
            } catch (e) {
              if (e != "error") {
                this.$Message.error(e);
              } else {
                this.$Message.error("新增右对象失败");
              }
              // return null;
            }
          }
          let _obj = {};
          for (var i in obj) {
            if (i.startsWith("relation_")) _obj[i.substr(9)] = obj[i];
          }
          let relationClass = multiObjParams && multiObjParams.relationClass ? multiObjParams.relationClass : this.relation.className;
          let newObj = { className: relationClass, obj: _obj };
          try {
            let res = await this.saveEJObj(newObj);
            if (!res) throw "error";
            for (var i in res) _res["relation_" + i] = res[i];
            if (res && className == jsonData.data.targetClass) this.update({}, jsonData);
            if (!multiObjParams || multiObjParams.showMessage) this.$Message.success("新增成功");
          } catch (error) {
            _res = null;
            var msg = error == "error" ? "新增失败" : error;
            console.log("save error", error);
            this.$Message.error(msg);
          }
        } else {
          var newObj = {
            className: className,
            obj: obj
          };
          //调用action
          try {
            _res = await this.saveEObj(newObj);
            if (!_res) throw "error";
            if (_res && className == jsonData.data.targetClass) this.update({}, jsonData);
            if (!multiObjParams || multiObjParams.showMessage) this.$Message.success("新增成功");
          } catch (error) {
            _res = null;
            console.log("save error", error);
            var msg = error == "error" ? "新增失败" : error;
            this.$Message.error(msg);
          }
        }
        return _res;
      },

      /*
        删除对象,并更新当前表单前端
        obj: 删除的目标对象
        jsonData: 当前表单对应的jsonData
        className: 目标对象的类名
        queryData: 查询条件
        multiObjParams: 多对象参数
        eventObj: 触发操作的事件对象
        当且仅当 当前表单的目标类和目标对象的类名相同时,会重新查询并更新前端
       */
      async delete(obj, jsonData, className, multiObjParams, eventObj) {
        let res = true;
        if (!jsonData) jsonData = this.rootJson;
        if (!className) className = jsonData.data.targetClass;
        if(this.resolveNextCreate('delete', obj)) return;
        let isRelation;
        if (!multiObjParams) {
          isRelation = jsonData.data.isRelation;
        }else{
          isRelation = multiObjParams.isRelation;
          multiObjParams.showMessage = typeof multiObjParams.showMessage === 'boolean' ? multiObjParams.showMessage : typeof multiObjParams.showMessage === 'undefined';
        }
        if(eventObj && eventObj.opr_showMessage !== undefined){
          !multiObjParams ? (multiObjParams = {}, multiObjParams.showMessage = eventObj.opr_showMessage) : multiObjParams.showMessage = eventObj.opr_showMessage;
        }
        let queryData = this.queryData
        if (multiObjParams && multiObjParams.queryData) {
          queryData = multiObjParams.queryData
        }
        if (!obj) obj = this.GetObj(jsonData.data);
        var targetClass = {
          className: className,
          obj: obj
        };

        if (isRelation) {
          let _obj = {};
          for (var i in obj) {
            if (i.startsWith("relation_")) _obj[i.substr(9)] = obj[i];
          }
          targetClass.obj = _obj;
          try {
            res = await this.deleteEJObj(targetClass);
            if (!res) throw "error";
            if (!multiObjParams || multiObjParams.showMessage) this.$Message.success("删除成功");
            if (className == jsonData.data.targetClass) {
              await this.refresh(queryData, jsonData, multiObjParams);
            }
          } catch (error) {
            res = null;
            console.log("delete error", error);
            var msg = error == "error" ? "删除失败" : error;
            this.$Message.error(msg);
          }
        } else {
          try {
            res = await this.deleteEObj(targetClass);
            if (!res) throw "error";
            if (className == jsonData.data.targetClass) {
              await this.refresh(queryData, jsonData, multiObjParams);
            }
            if (!multiObjParams || multiObjParams.showMessage) this.$Message.success("删除成功");
          } catch (error) {
            res = null;
            console.log("delete error", error);
            var msg = error == "error" ? "删除失败" : error;
            this.$Message.error(msg);
          }
        }
        return res;
      },

      /*
        删除左对象,并更新当前表单前端
        obj: 删除的目标对象
        jsonData: 当前表单对应的jsonData
        className: 目标对象的类名
        queryData: 查询条件
        multiObjParams: 多对象参数
        当且仅当 当前表单的目标类和目标对象的类名相同时,会重新查询并更新前端
       */
      async deleteLeftObj(obj, jsonData, className, queryData, multiObjParams) {
        let res = null;
        if (!jsonData) jsonData = this.rootJson;
        className = obj.relation_leftClass || jsonData.data.targetClass;
        if (!queryData) queryData = this.queryData;
        if (!obj) obj = this.GetObj(jsonData.data);
        var targetClass = {
          className: className,
          obj: {}
        };

        let _obj = {};
        for (var i in obj) {
          if (i.startsWith("left_")) _obj[i.substr(5)] = obj[i];
        }
        targetClass.obj = _obj;
        try {
          res = await this.deleteEObj(targetClass);
          if (!res) throw "error";
          if (className == jsonData.data.targetClass) {
            await this.refresh(queryData, jsonData);
          }
          this.$Message.success("删除成功");
        } catch (error) {
          res = null;
          console.log("delete error", error);
          var msg = error == "error" ? "删除失败" : error;
          this.$Message.error(msg);
        }

        return true;
      },

      /*
        删除右对象,并更新当前表单前端
        obj: 删除的目标对象
        jsonData: 当前表单对应的jsonData
        className: 目标对象的类名
        queryData: 查询条件
        multiObjParams: 多对象参数
        当且仅当 当前表单的目标类和目标对象的类名相同时,会重新查询并更新前端
       */
      async deleteRightObj(obj, jsonData, className, queryData, multiObjParams) {
        let res = null;
        if (!jsonData) jsonData = this.rootJson;
        if (!queryData) queryData = this.queryData;
        if (!obj) obj = this.GetObj(jsonData.data);
        className = obj.relation_rightClass || jsonData.data.targetClass;
        var targetClass = {
          className: className,
          obj: {}
        };

        let _obj = {};
        for (var i in obj) {
          if (i.startsWith("right_")) _obj[i.substr(6)] = obj[i];
        }
        targetClass.obj = _obj;
        try {
          res = await this.deleteEObj(targetClass);
          if (!res) throw "error";
          if (className == jsonData.data.targetClass) {
            await this.refresh(queryData, jsonData);
          }
          this.$Message.success("删除成功");
        } catch (error) {
          res = null;
          console.log("delete error", error);
          var msg = error == "error" ? "删除失败" : error;
          this.$Message.error(msg);
        }

        return true;
      },

      /*
        修改对象,并更新当前表单前端
        obj: 修改的目标对象
        jsonData: 当前表单对应的jsonData
        className: 目标对象的类名
        eventObj: 触发操作的事件对象
        当且仅当 当前表单的目标类和目标对象的类名相同时,会更新表单前端
       */
      async edit(obj, jsonData, className, multiObjParams, eventObj) {
        let _res = null;
        let isRelation;
        if (!jsonData) jsonData = this.rootJson;
        if (!className) className = jsonData.data.targetClass;
        if (!multiObjParams) {
          isRelation = jsonData.data.isRelation;
        }else{
          isRelation = multiObjParams.isRelation;
          multiObjParams.showMessage = typeof multiObjParams.showMessage === 'boolean' ? multiObjParams.showMessage : typeof multiObjParams.showMessage === 'undefined';
        }
        if(eventObj && eventObj.opr_showMessage !== undefined){
          !multiObjParams ? (multiObjParams = {}, multiObjParams.showMessage = eventObj.opr_showMessage) : multiObjParams.showMessage = eventObj.opr_showMessage;
        }
        if (!obj) {
          let tmp = this.GetObj(jsonData.data, true, null, {
            multiObjParams: multiObjParams
          });
          obj = tmp[0]
          if (!tmp[1]) return null;
        }
        let nextRes = this.resolveNextCreate('edit', obj);
        if(nextRes){
          return nextRes;
        }
        var thisObj = {
          className: className,
          obj: obj
        };
        if (isRelation) {
          if(this.relation == null && jsonData.data.targetRelationClass) {
            let res = await this.queryRelation(jsonData.data.targetRelationClass);
            this.relation = res;
            this.queryEntity(this.relation.leftClass);
            this.queryEntity(this.relation.rightClass);
          }
          _res = {};
          let leftObj = {};
          for (var i in obj) {
            if (i.startsWith("left_")) leftObj[i.substr(5)] = obj[i];
          }
          let leftClass = multiObjParams && multiObjParams.leftClass ? multiObjParams.leftClass : this.relation.leftClass;
          let newLeftObj = { className: leftClass, obj: leftObj };
          try {
            newLeftObj.obj.oid = 'left_oid' in obj ? obj.left_oid : obj.relation_leftOid;
            let res = await this.editEObj(newLeftObj);
            if (!res) throw "error";
            // obj.relation_leftOid = res.oid;
            // obj.left_oid = res.oid;
            for (var i in res) _res["left_" + i] = res[i];
          } catch (e) {
            var msg = e == "error" ? "修改左对象失败" : e;
            this.$Message.error(msg);
            // return null;
          }

          let rightObj = {};
          for (var i in obj) {
            if (i.startsWith("right_")) rightObj[i.substr(6)] = obj[i];
          }
          let rightClass = multiObjParams && multiObjParams.rightClass ? multiObjParams.rightClass : this.relation.rightClass;
          let newRightObj = { className: rightClass, obj: rightObj };
          try {
            newRightObj.obj.oid = 'right_oid' in obj ? obj.right_oid : obj.relation_rightOid;
            let res = await this.editEObj(newRightObj);
            if (!res) throw "error";
            // obj.relation_rightOid = res.oid;
            // obj.right_oid = res.oid;
            for (var i in res) _res["right_" + i] = res[i];
          } catch (e) {
            var msg = e == "error" ? "修改右对象失败" : e;
            this.$Message.error(msg);
            // return null;
          }
          let _obj = {};
          for (var i in obj) {
            if (i.startsWith("relation_")) _obj[i.substr(9)] = obj[i];
          }
          let relationClass = multiObjParams && multiObjParams.relationClass ? multiObjParams.relationClass : this.relation.className;
          let newObj = { className: relationClass, obj: _obj };
          try {
            let res = await this.editEJObj(newObj);
            if (!res) throw "error";
            for (var i in res) _res["relation_" + i] = res[i];
            if (res && className == jsonData.data.targetClass) this.update(_res, jsonData);
            if (!multiObjParams || multiObjParams.showMessage) this.$Message.success("修改成功");
          } catch (error) {
            _res = null;
            console.log("edit error", error);
            var msg = error == "error" ? "修改失败" : error;
            this.$Message.error(msg);
          }
        } else {
          try {
            _res = await this.editEObj(thisObj);
            if (!_res) throw "error";
            if (_res && className == jsonData.data.targetClass) this.update(_res, jsonData);
            if (!multiObjParams || multiObjParams.showMessage) this.$Message.success("修改成功");
          } catch (error) {
            _res = null;
            console.log("edit error", error);
            var msg = error == "error" ? "修改失败" : error;
            this.$Message.error(msg);
          }
        }
        //调用action
        return _res;
      },

      /*
        发起查询,并更新当前表单前端
        queryData: 查询条件
        jsonData: 当前表单对应的jsonData
        当且仅当 当前表单的目标类和查询条件的类名相同时,会更新表单前端
       */
      async refresh(queryData, jsonData, multiObjParams) {
        if (!jsonData) jsonData = this.rootJson;
        let res = null;
        if (!queryData) queryData = this.queryData;
        try {
          res = await this.refreshEObj(queryData);
          if (!res) throw "error";
          if (res && res.length > 0) res = res[res.length-1];
          else res = {};
          if (res && queryData.targetClass == jsonData.data.targetClass) this.update(res, jsonData);
          if (!multiObjParams || multiObjParams.showMessage) this.$Message.success("刷新成功");
        } catch (error) {
          console.log("refresh error", error);
          this.$Message.error("刷新失败");
        }
        return res;
      },

      // 递归生成表单控件
      async engine(parentDom, element) {
        // 表单引擎函数
        // try {
        //   var that = this;
        //   var entry = getAddinFunc(element.self.elementType, "form"); //获取插件实例构建函数
        //   var treeDom = new entry({
        //     mixins: [that.addinMixin()],
        //     // 加载prop数据
        //     propsData: { itemValue: that.rootJson, store: that.$store, Message: Message, echarts: that.$echarts, attributes: that.attributesList, query: that.query ,root: that.root},
        //     // 加载store函数
        //     methods: {
        //       getEn(targetClass){
        //         return that.EntityList(targetClass);
        //       },
        //       // 遍历json结构获取id以下的json结构
        //       getJsonData(item, id) {
        //         return that.getJsonData(item, id);
        //       },
        //       // 获取id的上一层json结构
        //       getParentJson(item, id) {
        //         return that.getParentJson(item, id);
        //       },
        //       // 遍历json结构获取对象即时数据
        //       getObj(item, validate) {
        //         return that.GetObj(item, validate);
        //       },
        //       GetAddinById(item, id) {
        //         return that.GetAddinById(item, id);
        //       },
        //       GetAddinByUUID(item, id) {
        //         return that.GetAddinByUUID(item, id);
        //       },
        //       GetAllAddin(item) {
        //         return that.GetAllAddin(item);
        //       },
        //       getParentAddin() {
        //         return that;
        //       },
        //       getAttrFunc(name) {
        //         return getAddinFunc(name, "form");
        //       },
        //       _getViewData(param){
        //         return  that.getViewData(param);
        //       },
        //       _getViewDataByAttrs(param){
        //         return  that.getViewDataByAttrs(param);
        //       },
        //       handleQueryData(param){
        //         return  that.handleQueryData(param);
        //       },
        //       getClassObject(targetClass, id) {
        //         return that.EntitySingle(targetClass, id);
        //       },
        //       getRClassObject(targetClass, id) {
        //         return that.RelationSingleA(targetClass, id);
        //       },
        //       async invokeOperation(opr_type, opr_path, jsonData, store, queryData, param, callback, multiObjParams){
        //         that.executeOperationProgress = false;
        //         return await that.invokeOperation(opr_type, opr_path, jsonData, store, queryData, param, callback, multiObjParams, element.self.properties.id);
        //       },
        //       parseEscapeString(oriString, env, user, obj, attributes, param){
        //         return that.parseEscapeString(oriString, env, user, obj, attributes, param);
        //       },
        //       async handleScript(code, params, store, jsonData) {
        //         if (!jsonData) jsonData = this.rootJson;
        //         if (!store) store = this.store;
        //         return await that.handleScript(code, params, store, jsonData);
        //       },
        //       addExtraObj(item, obj) {
        //         return that.addExtraObj(item, obj);
        //       },
        //       async getEventOperation(oprName){
        //         let operation = element.self.properties.events ? element.self.properties.events.find(val => val.name === oprName) : null;
        //         if(operation && operation.opr_type == "query"){
        //           return await getQueryOperation(operation.opr_path);
        //         }else{
        //           return null
        //         }
        //       },
        //       async invokeEvent(oprName){
        //         if(that.executeOperationProgress){
        //           that.$Message.error('禁止invokeEvent与executeOperation脚本嵌套使用');
        //           that.executeOperationProgress = false;
        //           return;
        //         }
        //         that.executeOperationProgress = true;
        //         let operation = element.self.properties.events ? element.self.properties.events.find(val => val.name === oprName) : null;
        //         if(operation){
        //           return await that.invokeOperation(operation.opr_type, operation.opr_path, that.rootJson, that.$store, null, null, null, null, element.self.properties.id);
        //         }else{
        //           return null
        //         }
        //       },
        //       addinMixin(){
        //         return that.addinMixin();
        //       },
        //     }
        //   }); //创建新实例
        //   element.obj = treeDom;
        //   let restrictedAccess = {};
        //   let addinName = element.self.elementType.replace("addin_", "");
        //   if(addinName && this.structuralLayoutAddin.includes(addinName) && !('structural_layout' in element.self.properties)){
        //     element.self.properties.structural_layout = 'horizontal';
        //   }
        //   if(element.self.properties.name){
        //     if(this.isRelation){
        //       for(let prefix of ['left', 'relation', 'right']){
        //         if(element.self.properties.name.startsWith(`${prefix}_`)){
        //           let originName = element.self.properties.name.replace(new RegExp(`${prefix}_`), '');
        //           let obj = this.attributesList[prefix].filter(item => item.attributeName === originName)[0];
        //           restrictedAccess.EditObjects = obj && obj.length !==0 ? obj.restrictedAccess.indexOf('EditObjects') !== -1 : false;
        //           restrictedAccess.CommonOpAuth = obj && obj.length !==0 ? obj.restrictedAccess.indexOf('CommonOpAuth') !== -1 : false;
        //         }
        //       }
        //     }else {
        //       let obj = this.attributesList.filter(item => item.attributeName === element.self.properties.name)[0];
        //       restrictedAccess.EditObjects = obj && obj.length !==0 ? obj.restrictedAccess.indexOf('EditObjects') !== -1 : false;
        //       restrictedAccess.CommonOpAuth = obj && obj.length !==0 ? obj.restrictedAccess.indexOf('CommonOpAuth') !== -1 : false;
        //     }
        //   }
        //   //增加两个权限参数
        //   if(restrictedAccess.EditObjects){
        //     element.self.properties.readonly = restrictedAccess.EditObjects;
        //   }
        //   element.self.properties.EditObjects = restrictedAccess.EditObjects;
        //   element.self.properties.CommonOpAuth = restrictedAccess.CommonOpAuth;
        //   this.query.displayType = this.query.displayType === 'list' ? 'visit' : this.query.displayType;
        //   treeDom.setDisplayType(this.query.displayType ? this.query.displayType : 'visit').setArgs({_query: this.query}).setArgs(element.self.properties);
        //   var name = treeDom.getFormName ? treeDom.getFormName() : null;
        //   // 传入查询结果值
        //   if (name) {
        //     if (!(name in this.addinMap)) this.addinMap[name] = [];
        //     this.addinMap[name].push(treeDom);
        //     // console.log("test:", this.query.obj, this.obj, name);
        //     if (this.query.obj && name in this.query.obj) {
        //       treeDom.setValue(this.query.obj[name]);
        //       // if (this.queryData.iotdbDeviceAttributes.filter(item => item.attributeName === name).length !== 0) {
        //       //   treeDom.setValue(this.obj[name].series[0][1]);
        //       // } else {
        //       //   treeDom.setValue(this.query.obj[name]);
        //       // }
        //     } else if (this.query.displayType && this.query.displayType == "create" && this.query.displayType != "creates") {
        //       let args = treeDom.getArgs();
        //       if ("defaultValue" in args && ((Object.prototype.toString.call(args.defaultValue) === '[object Array]' && args.defaultValue.length !== 0) || (Object.prototype.toString.call(args.defaultValue) !== '[object Array]' && args.defaultValue) || Object.prototype.toString.call(args.defaultValue) === '[object Boolean]')) {
        //         treeDom.setValue(args.defaultValue)
        //       } else {
        //         let attr = this.Attributes(name.replace(/^(relation_|left_|right_)/g, ''));
        //         if (attr && attr.defaultValue != undefined) {
        //           treeDom.setValue(attr.defaultValue);
        //         } else {
        //           treeDom.setValue(null);
        //         }
        //       }
        //     } else if (this.obj && name in this.obj) {
        //       // var value = this.EntityAttrSingle(
        //       //   this.queryData.targetClass,
        //       //   this.queryData.uuid,
        //       //   treeDom.getFormName()
        //       // );
        //       treeDom.setValue(this.obj[name]);
        //       // if (this.queryData.iotdbDeviceAttributes.filter(item => item.attributeName === name).length !== 0) {
        //       //   treeDom.setValue(this.obj[name].series[0][1]);
        //       // } else {
        //       //   treeDom.setValue(this.obj[name]);
        //       // }
        //     }
        //     //自定义属性不受三态控制
        //     try {
        //       if(this.attributesList){
        //         let propertyStatus = false;
        //         if(Object.prototype.toString.call(this.attributesList) === "[object Object]"){
        //           for(let key in this.attributesList){
        //             propertyStatus = this.attributesList[key].findIndex(item => item.attributeName === name.replace(/^(left_|right_|relation_)/g, '')) !== -1 || propertyStatus;
        //           }
        //         }else if(Object.prototype.toString.call(this.attributesList) === "[object Array]"){
        //           propertyStatus = this.attributesList.findIndex(item => item.attributeName === name) !== -1
        //         }
        //         if(!propertyStatus && form_entries.find(item => item.name === treeDom.name) && (form_entries.find(item => item.name === treeDom.name).module === 'form/single' || form_entries.find(item => item.name === treeDom.name).module === 'form/model')){
        //           treeDom.setDisplayType('create')
        //         }
        //       }
        //     }catch (e) {
        //       console.log(`自定义属性三态设置${e}`)
        //     }
        //   } else if(form_entries.find(item => item.name === treeDom.name) && (form_entries.find(item => item.name === treeDom.name).module === 'form/single' || form_entries.find(item => item.name === treeDom.name).module === 'form/model')){
        //     //自定义属性不受三态控制
        //     treeDom.setDisplayType('create')
        //   }
        //   var show_dom = treeDom.$mount().$el; //设置显示模式为引擎显示模式
        //   let args = treeDom.getArgs();
        //   if(args.row_space){
        //     show_dom.style.marginTop = args.row_space + 'px';
        //     show_dom.style.marginBottom = args.row_space + 'px';
        //   }
        //   if(args.col_space){
        //     show_dom.style.marginLeft = args.col_space + 'px';
        //     show_dom.style.marginRight = args.col_space + 'px';
        //   }
        //   show_dom.setAttribute("UUID", element.self.uuid);
        //   show_dom.classList.add("addin");
        //   var parent = parentDom.getAttribute("dropTarget") == element.self.dropTarget ? [parentDom] : parentDom.querySelectorAll('[dropTarget="' + element.self.dropTarget + '"]')
        //   if (parent.length == 0) parent = parentDom.querySelector('[dropTarget="0"]');
        //   else {
        //     var _uuid = parentDom.getAttribute("UUID", "");
        //     var flag = true;
        //     for (var i = parent.length;i > 0;i--) {
        //       var _dom = parent[i-1];
        //       flag = true;
        //       while (true) {
        //         var uuid = _dom.getAttribute("UUID", "");
        //         if (uuid && uuid != "") {
        //           flag = uuid == _uuid;
        //           break;
        //         }
        //         _dom = _dom.parentNode;
        //       }
        //       if (flag) {
        //         parent = parent[i-1];
        //         break;
        //       }
        //     }
        //     if (!flag) parent = null;
        //   }
        //   if (!parent) parent = parentDom;
        //   let dropItem;
        //   // switch (parentDom.getAttribute("addinname")) {
        //   //   case 'DragLayout':
        //   //     // 拖拽布局控件布局方式
        //   //     let parentAddin = this.GetAddinByUUID(this.rootJson.data, parentDom.getAttribute('uuid'));
        //   //     treeDom.$on("DeleteItem", parentAddin.deleteItem);
        //   //     dropItem = parentDom.querySelectorAll(`[containerUUID="${element.self.uuid}"]`);
        //   //     if (dropItem.length<1) throw 'Illegal dropTarget or identical. Within DragLayout.';
        //   //     dropItem[0].appendChild(show_dom);
        //   //     break;
        //   //   case 'DragItem':
        //   //     // 拖拽布局控件布局方式
        //   //     dropItem = parentDom.querySelectorAll(`.drag-item-container`);
        //   //     if (dropItem.length<1) throw 'Illegal dropTarget or identical. Within DragLayout.';
        //   //     dropItem[0].appendChild(show_dom);
        //   //     this.$nextTick(() => {
        //   //       setTimeout(() => {
        //   //         treeDom.myChart && treeDom.myChart.resize ? treeDom.myChart.resize() : '';
        //   //       },100);
        //   //     })
        //   //     break;
        //   //   default :
        //   //     parent.appendChild(show_dom); //将插件Dom添加入父元素
        //   //     break;
        //   // }
        //
        //   // 遍历渲染
        //   if (element.elements && element.elements.length) {
        //     element.elements.forEach(element => {
        //       this.engine(show_dom, element);
        //     });
        //   }
        // } catch (e) {
        //   console.log("err!!!", element, e);
        // }
      },

      /**
       * @description设置待处理事件队列
       * @tabName
       * @params
       */
      setPendingTaskQueue(opr, params){
        let queue = {
          active: false, //是否激活状态
          sourceTab: this.root.tab,
          targetTab: `${opr.targetClass}-${opr.authority}`,
          params: params
        }
        this.root.setPendingTaskQueue(queue)
      },

      /**
       * @author LiuBo
       * @method
       * @name
       * @private
       * @description 生成oprScript
       * @return {Object} oprscript
       */
      generateOprScript() {
        return {
          implement: {
            entry: '',
            client: {
              default: {
                script: '',
                displayName: '',
              }
            },
            server: {
              default: {
                script: '',
                displayName: '',
              }
            }
          },
          appBefore: {
            entry: 'client',
            client: {
              default: {
                script: '',
                displayName: '',
              }
            },
            server: {
              default: {
                script: '',
                displayName: '',
              }
            }
          },
          appAfter: {
            entry: 'client',
            client: {
              default: {
                script: '',
                displayName: '',
              }
            },
            server: {
              default: {
                script: '',
                displayName: '',
              }
            }
          },
        }
      },

      ...mapActions("DWF_form", ["updateFView", "deleteFView", "queryEntity", "queryRelation", "handleQueryData", "handleQueryForm", "getAttributeClassMap",
        "deleteEObj", "saveEObj", "cudBatch", "toBeNextCreate", "editEObj", "refreshEObj", "updateFormJsonAct", "updataEntityobjAct",
        "handleQueryForm", "deleteEJObj", "saveEJObj", "editEJObj"]),

      ...mapMutations("DWF_form", ["addEntityObj", "addRelationChild"]),

    },
    computed: {
      // 使用对象展开运算符将此对象混入到外部对象中
      ...mapGetters("DWF_form", [
        "EntityList",
        "EntityAttrList",
        "EntityAttrSingle",
        "EntityFormList",
        "EntityForm",
        "EntityFormBasicInfo",
        "RelationList",
        "RelationAttrList",
        "RelationAttrSingle",
        "RelationFormList",
        "RelationForm",
        "RelationFormBasicInfo",
        "AnotherClass",
        "ResourceSingle",
        "ResourceList",
        "ResourceAttrList",
        "ResourceAttrSingle",
        "getViewData",
        "getViewDataByAttrs",
        "Entities", "EntitySingle", "Relations", "RelationSingle", "RelationSingleA", "QueryResult", "QueryResultAll",
        "Attributes",
        "AttributesByClass"
      ]),

      //初始化控件props
      addinProps(){
        return{
          store: this.$store,
          itemValue: this.rootJson,
          route: this.route,
          root: this.root,
          query: this.query,
          attributes: this.attributesList,
          formEngine: this,
          Message: this.Message,
          echarts: this.$echarts,
          dwf_ctx: {
            dwf_axios: dwf_app_axios,
            dwf_modeler_axios: axios,
            msgbox: Message,
            msgboxDialog: this.msgboxDialog,
            env: store && store.state && store.state.DWF_global ? {
              serverURL: `${store.state.DWF_global.serverIp}:${store.state.DWF_global.serverHost}`,
              serverIp: store.state.DWF_global.serverIp,
              serverPort: store.state.DWF_global.serverHost,
              metaServicePort: new URL(serverConfig.baseUrl).port,
              objServicePort: new URL(serverConfig.baseObjOther).port,
              appConfig: store.state.DWF_global.appConfig,
            } : {
              serverURL: '',
              serverIp: '',
              serverPort: '',
              metaServicePort: new URL(serverConfig.baseUrl).port,
              objServicePort: new URL(serverConfig.baseObjOther).port,
              appConfig: '',
            },
            user: {
              userName: sessionStorage.getItem('username') || '',
              displayName: sessionStorage.getItem('displayName') || '',
              oid: sessionStorage.getItem('oid') || '',
              userId: sessionStorage.getItem('userId') || '',
              token: sessionStorage.getItem('token') || '',
              userGroups: JSON.parse(sessionStorage.getItem('userGroups')) || '',
            },
            displayType: () => this.getRootJson().data && this.getRootJson().data.displayType ? this.getRootJson().data.displayType : "visit",
            className: () => this.getRootJson().data ? this.getRootJson().data.targetClass : null,
            getRootAddin: () => this,
            getAddinById: (id) => this.GetAddinById(this.getRootJson().data, id),
            getAllAddin: () => this.GetAllAddin(this.getRootJson().data),
            obj: () => this.GetObj(this.getRootJson().data),
            validateForm: () => {
              this.returnValidateValue = true;
              return this.GetObj(this.getRootJson().data, true, true);
            },
            create: (obj, className, params) => this.save(obj, this.getRootJson(), className, params),
            delete: (obj, className, params) => this.delete(obj, this.getRootJson(), className, params),
            edit: (obj, className, params) => this.edit(obj, this.getRootJson(), className, params),
            spinShow: (spinType) => this.spinShow(spinType),
            spinHide: () => this.spinHide(),
            closeDialog: (obj = true) => {
              this.$emit('closeDialog', this.query, obj);
              return obj;
            },
            closeTab: (obj) => {
              if(this.root){
                this.root.activePendingTaskQueue(this.root.tab, obj);
                this.root.onTabRemove(this.root.tab);
              }
            },
            closeTabById: (tab, obj) => {
              if(this.root){
                this.root.activePendingTaskQueue(tab, obj);
                this.root.onTabRemove(tab);
              }
            },
            // getSocketId: () => getSockId(),
            // sendMsg: (param) => {
            //   let params = {
            //     command: 'from user script',
            //     ...param
            //   }
            //   getWs().send(JSON.stringify(params));
            // },
            getOperation: (className, operationName) => {
              if(className && operationName){
                return getEntitiesOperationsByName(className, operationName);
              }else{
                return null;
              }
            },
            executeOperation: async (operation, customData) => {
              // if(this.executeOperationProgress){
              //   this.$Message.error('禁止invokeEvent与executeOperation脚本嵌套使用');
              //   this.executeOperationProgress = false;
              //   return;
              // }
              // this.executeOperationProgress = true;
              return await this.invokeOperation('query', operation, this.getRootJson(), store, null, null, null, {customData: customData});
            },
            handleQueryData: async (queryData) => {
              return await this.handleQueryData(queryData);
            },
            selectedObjs: () => {
              let _selected = null;
              try {
                let addins = this.GetAllAddin(this.getRootJson().data);
                for (var i = 0; i < addins.length;i++) {
                  if (addins[i].getSelected) {
                    let objs = addins[i].getSelected();
                    if (objs && objs.length > 0) {
                      let _class = addins[i].getAttrMap();
                      if(_class[_class.length-1].className == this.getRootJson().data.targetClass){
                        _selected = objs;
                        break;
                      }
                    }
                  }
                }
                _selected = this.defaultObjsAddin ? this.defaultObjsAddin.getSelected() : _selected;
              }catch (e) {

              }
              return _selected;
            },
            defaultObjsAddin: () => {
              return this.defaultObjsAddin ? this.defaultObjsAddin : null;
            },
            openForm: (targetClass, viewName, args, displayType, initParams) => {
              args ? args.displayType = displayType : args = {}, args.displayType = displayType;
              this.openForm(this.getRootJson(), {}, targetClass, viewName, args, initParams);
            },
            openTab: (queryOpr, args) => {
              this.openTab(this.getRootJson(), {}, queryOpr, args);
            },
            openDrawer: (targetClass, viewName, direction, args, displayType, initParams) => {
              args ? args.displayType = displayType : args = {}, args.displayType = displayType;
              this.openForm(this.getRootJson(), {}, targetClass, viewName, args, initParams, direction);
            }
          },
        }
      },
    }
  };
</script>
<style>
  .addin {
    padding: 5px
  }
  .demo-spin-icon-load{
    animation: ani-demo-spin 1s linear infinite;
  }
  .ivu-input-number-input[disabled]{
    opacity: 1!important;
  }
  .ivu-cascader-menu .ivu-cascader-menu-item i,
  .ivu-select-arrow,
  .ivu-cascader-arrow {
    margin-top: 0 !important;
  }
  .ivu-btn-small>span {
    font-size: 12px !important;
  }
  section.addin{
    display: inline-block;
    position: relative;
    z-index: 1;
  }
  .ivu-tooltip-inner-with-width{
     word-break: break-all;
 }

</style>
<style scoped lang="less">
  .layout {
    padding: 20px;
    font-size: 18px;
    text-align: left;
    // min-height: 250px;
    height: auto;
    overflow: auto;
  }
  .layoutOrign {
    font-size: 18px;
    text-align: left;
    height: auto;
    overflow-y: auto;
    overflow-x: hidden;
  }
  b {
    margin: 10px;
    background-color: rgba(247, 16, 16, 0.616);
    color: #fff;
    border-radius: 50%;
    display: inline-block;
    width: 40px;
    height: 40px;
    line-height: 40px;
    text-align: center;
    box-shadow: 3px 5px 5px 2px #ccc;
  }
  .win {
    margin: 10px 30px;
    text-align: center;
  }
  .win :last-child {
    background-color: #00f;
  }
  .org-form {
    background-color: #f3f3f3;
  }
  .oprDrawer-footer {
    width: 100%;
    position: absolute;
    bottom: 0;
    left: 0;
    border-top: 1px solid #e8e8e8;
    padding: 10px 16px;
    text-align: right;
    background: #fff;
  }
</style>
