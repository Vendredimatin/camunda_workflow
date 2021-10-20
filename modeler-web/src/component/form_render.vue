<template>
  <!--    <Section-->
  <!--      class="pc-width clearfix"-->
  <!--      v-show="false"-->
  <!--      :style="{'border-top': '1px solid #cccccc', 'background-color': basicArgs.form_bgColor, 'font-size': basicArgs.form_font_size }"-->
  <!--      :class="fitClass"-->
  <!--      id="GlobalForm"-->
  <!--      ref="form"-->
  <!--      UUID="init"-->
  <!--      addinName="GlobalForm"-->
  <!--      addin="global"-->
  <!--      dropTarget="0"-->
  <!--      @dragenter="onDragEnter($event)"-->
  <!--      @dragleave="onDragLeave($event)"-->
  <!--      @dragover="onDragOver($event)"-->
  <!--      @drop="onDrop($event)"-->
  <!--      @click="hide">-->
  <section
    @dragover.prevent="onDragOver($event)"
    @drop.stop="onDrop($event)"
    @click="renderAreaClick"
    style="width: 100%; height: 100%; position: relative;"
    id="GlobalForm"
  >
    <draggable
      v-if="reloadFormRender && (targetFormType=='' || targetFormType=='PC' || targetFormType =='undefined')"
      id="GlobalFormDragArea"
      class="dragArea pc-width clearfix"
      :style="{'border-top': '1px solid #cccccc', 'background-color': basicArgs.form_bgColor, 'font-size': basicArgs.form_font_size }"
      :class="fitClass"
      draggable=".vue-draggable-addin"
      group='addin'
      :list="formAddinList"
      ghost-class="vue-draggable-ghost"
      @change='jsonDataChange'
    >
      <FormAddinList
        v-for="addin in jsonData.data.elements"
        :key="addin.self.uuid"
        :addin="addin"
        :activeUUID="activeUUID"
        v-bind="addinProps"
        :ref="`FormAddinList${addin.self.uuid}`"
        @activeAddin="activeAddin"
        @removeAddin="removeAddin"
        @copyAddin="copyAddin"
        @commentAddin="commentAddin"
        @showEditBox="showEditBox"
        @layoutSelfDrag="layoutSelfDrag"
      >

      </FormAddinList>
      <!-- 这个dev用来解决拖拽底部元素长度问题导致的拖拽失效start -->
      <div class="addin vue-draggable-addin" style="width: 100%;height: 0px;"></div>
      <!-- 这个dev用来解决拖拽底部元素长度问题导致的拖拽失效end -->
    </draggable>
    <draggable
      v-if="reloadFormRender && targetFormType=='Mobile'"
      class="dragArea pc-width clearfix"
      id="GlobalFormDragArea"
      :style="{'background-color': basicArgs.form_bgColor, 'font-size': basicArgs.form_font_size }"
      :class="fitClass"
      draggable=".vue-draggable-addin"
      group='addin'
      :list="formAddinList"
      ghost-class="vue-draggable-ghost"
      @change='jsonDataChange'
    >
      <MobileFormAddinList
        v-for="addin in jsonData.data.elements"
        :key="addin.self.uuid"
        :addin="addin"
        :activeUUID="activeUUID"
        v-bind="addinProps"
        :ref="`FormAddinList${addin.self.uuid}`"
        @activeAddin="activeAddin"
        @removeAddin="removeAddin"
        @copyAddin="copyAddin"
        @commentAddin="commentAddin"
        @showEditBox="showEditBox"
        @layoutSelfDrag="layoutSelfDrag"
      >

      </MobileFormAddinList>
      <!-- 这个dev用来解决拖拽底部元素长度问题导致的拖拽失效start -->
      <div class="addin vu e-draggable-addin" style="width: 100%;height: 0px;"></div>
      <!-- 这个dev用来解决拖拽底部元素长度问题导致的拖拽失效end -->
    </draggable>
  </section>
  <!--    </Section>-->
</template>

<script>
import Vue from 'vue';
import {getAddin, getAddinDom, getAddinFunc} from '@/util/addin.js'
import {uuid} from '@/util/assist'
import {mapGetters, mapState, mapActions} from "vuex";
import {entries as form_entries} from "@/ext_components/form/config.js";
import _ from 'lodash';
import axios from "@/libs/axios";
import Axios from 'axios';
import store from "@/store";
import global_ from "@/views/global";
import {SYS_ENTITY_ATTRIBUTES, SYS_RELATION_ATTRIBUTES} from "@/libs/utils";
import draggable from 'vuedraggable';
import { DWFADDINARGSVERSION } from "@/util/DWFVariable";

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
  /*
  prop属性:
      editBox: 属性编辑框的dom元素
      targetClass: targetClass.className为目标类
      targetAttributes: 目标类的属性列表
      basicArgs: 基本配置项
      route, router: 路由
      root: Main实例
      relation: 关联类信息
  */
  props: ['editBox', "targetClass", "targetAttributes", "basicArgs", "route", "router", "root", "query_oprs", "relation", "widgetAnnotation", "editExtendInfo"],
  data() {
    return {
      objPool: {},
      generateId: {},
      addinTypeMap: {},
      jsonData: {"data": {"elements": [], "targetClass": "", "isRelation": false, "basicArgs": {}}},
      jsonUUID: {},
      dragItem: null,
      dragFa: null,
      addinItem: {"GlobalForm": []},
      allowDropSpecial: ['SingleObjectSelector', 'SelectInput', 'RadioButton', 'Switch', 'HyperLink'], //允许特殊放置的控件名，这个参数用来做onDrop时放到这些控件允许放置，但是做特殊处理
      dropFlag: 0, // 0表示表单内元素drag未drop;1表示本次不允许;2表示drop成功
      jsonFa: null,
      jsonSon: null,
      snapShotCount: 0,
      dataSnapshot: [],
      hoverItem: null,
      targetItem: null,
      checkResult: {result: false},
      addins: {
        single: {},
        multi: {},
        timeseries: {},
        model: {},
        layout: {},
        visual: {},
        iconunit: null,
      },
      fitClass: '',  //切换设备类名
      deviceType: 'actPc',
      dragArgs: null,
      ghostbox: null,
      structuralLayoutAddin: ['TextInput', 'HyperLink', 'NumberInput', 'DateInput', 'CheckBox', 'RadioButton', 'Label', 'Switch', 'SelectInput', 'SingleObjectSelector', 'SingleObjectModal', 'MultiObjectsTag', 'ProgressBar', 'D_Rate', 'Liked', 'icon', 'DynamicParameterFrame', 'MultiFilesList', 'Attachments'], //允许垂直布局的控件，为之前做兼容
      undoing: false,
      redoing: false,
      // formAddinList: [],
      dragJsonData: [],
      activeUUID: '',
      layoutSelfDragMode: false,
      reloadFormRender: true,
      includeComponentAddinFlag: false,
      targetFormType: 'PC'
    }
  },
  components: {
    draggable,
  },
  // 销毁组件前,销毁表单内所有的控件实例
  beforeDestroy() {
    for (var i in this.jsonUUID) {
      if (this.jsonUUID[i].obj) {
        this.jsonUUID[i].obj.$destroy();
        delete this.jsonUUID[i].obj;
      }
    }
  },
  created() {
  },
  mounted() {
    this.targetFormType = sessionStorage.getItem('targetFormType');
    if (this.targetClass && this.targetClass.className) this.jsonData.data.targetClass = this.targetClass.className;
    this.jsonData.data.deviceType = this.deviceType;
    // this.jsonData.data.basicArgs = this.basicArgs;
    this.$emit("on-json-change", this.jsonData);
    this.addListeners();
  },
  provide() {
    return {
      GetJsonById: this.GetJsonById,
      GenerateID: this.generateID,
      ReloadAddin: this.reloadAddin,
    }
  },
  watch: {
    targetClass(val) {
      if (val && val.className) {
        this.jsonData.data.targetClass = val.className;
      }
    },
    relation(val) {
      if (val) {
        this.jsonData.data.isRelation = true;
        this.queryRelation(val.className);
        this.queryEntity(val.leftClass);
        this.queryEntity(val.rightClass);
      }
    },
    jsonData(val) {
      this.$emit("on-json-change", val);
    }
  },
  computed: {
    ...mapGetters("DWF_form", [
      "Entities",
      "EntitySingle",
      "EntityList",
      "EntityAttrList",
      "RelationAttrList",
      "Relations",
      "RightRelations",
      "LeftRelations",
      "RightEntities",
      "LeftEntities",
      "getViewData",
      "getViewDataByAttrs",
      "AttributesByClass",
      "Attributes"]),

    //初始化控件props
    addinProps() {
      return {
        store: this.$store,
        basicArgs: this.basicArgs,
        itemValue: this.jsonData,
        attributes: this.targetAttributes,
        relation: this.relation,
        editExtendInfo: this.editExtendInfo,
        widgetAnnotation: this.widgetAnnotation,
        checkResult: this.checkResult,
        query_oprs: this.query_oprs,
        route: this.route,
        router: this.router,
        root: this.root,
        formCanvas: this,
        Message: this.$Message,
        echarts: this.$echarts,
        dwf_ctx: this.getDwfCtx(),
      }
    },

    //重写formAddinList
    formAddinList() {
      let formAddinList = [];
      this.jsonData.data.elements.forEach(e => {
        formAddinList.push({
          name: e.self.elementType.replace('addin_', ''),
          uuid: e.self.uuid,
          addin: e,
        })
      });
      return formAddinList
    },

    relations() {
      var r1 = this.LeftRelations(this.targetClass.className);
      var r2 = this.RightRelations(this.targetClass.className);
      r1 = r1 ? r1 : [];
      r2 = r2 ? r2 : [];
      return this.targetClass && this.targetClass.className ? r1.concat(r2) : [];
    },
    relation_classes() {
      if (!this.targetClass || !this.targetClass.className) return [];
      var e1 = this.LeftEntities(this.targetClass.className);
      var e2 = this.RightEntities(this.targetClass.className);
      e1 = e1 ? e1 : [];
      e2 = e2 ? e2 : [];
      var res = e1.concat(e2);
      var mp = {};
      return res.filter(x => {
        if (x.basic.className in mp) return false;
        mp[x.basic.className] = true;
        return true;
      });
    },
  },
  methods: {
    ...mapActions("DWF_form", {
      UpdataFormJson: "updateFormJsonAct",
      updataEntityobj: "updataEntityobjAct",
      HandleQuery: "handleQuery",
      DeleteObj: "deleteEObj",
      SaveEObj: "saveEObj",
      EditEObj: "editEObj",
      RefreshEObj: "refreshEObj",
      _handleQueryData: "handleQueryData",
      GetAttributeClassMap: "getAttributeClassMap",
      queryEntity: "queryEntity",
      queryRelation: "queryRelation",
    }),

    /**
     *@description初始化jsonData兼容vuedraggable之前的写法
     *@params
     *@date 2020/8/25
     *@return
     */
    init(json) {
      this.dropFlag = true;
      this.jsonData = json;
      if (this.targetClass && this.targetClass.className) this.jsonData.data.targetClass = this.targetClass.className;
      this.jsonData.data.deviceType = this.deviceType;
      // this.jsonData.data.basicArgs = this.basicArgs;
      this.jsonData.data.elements.forEach(e => {
        this.engine(e);
        // this.formAddinList.push({
        //   name: e.self.elementType.replace('addin_', ''),
        //   uuid: e.self.uuid,
        //   addin: e,
        // })
      });
      //根据this.addinTypeMap重新刷新generateID
      this.resetGenerateID();
      //执行id引擎，将id为空的控件添加流水号id
      // this.jsonData.data.elements.forEach(e => {
      //   this.idEngine(e);
      // });
      // this.snapShotHistory();
    },

    /**
     *@description新的engine方法不再承担dom渲染相关操作转而执行一些数据处理
     *@params
     *@date 2020/8/25
     *@return
     */
    // 表单引擎生成组件
    engine(element) {
      try {
        let that = this;
        var addinName = element.self.elementType.replace("addin_", "");
        // var treeDom = this.getAddin(addinName);
        // var inherit = addin && addin.getInherit ? addin.getInherit(element.self.dropTarget) : {};
        //if (addinName == "FormEngine") treeDom.initData({ entities: this.entities });
        // if(addinName && this.structuralLayoutAddin.includes(addinName) && !('structural_layout' in element.self.properties)){
        //   element.self.properties.structural_layout = 'horizontal';
        // }
        // var dom = treeDom.setDisplayType(0).setArgs(element.self.properties).$mount().$el; //设置显示模式为引擎显示模式

        // element.self.properties = treeDom.getArgs();
        // treeDom.$on("showEditBox", this.showEditBox);
        // treeDom.$on("generateActionWidget", this.generateActionWidget);
        // treeDom.$on("hideEditBox", this.hide);
        // treeDom.$on("checkRow", this.checkRow);
        // if(addinName in this.addins.layout){
        //   dom.classList.add("addin-layout");
        // }
        // dom.classList.add("addin");
        // dom.classList.add(this.deviceType);
        // dom.onclick = (e) => {
        //   that.showEditBox(dom, null, treeDom);
        //   this.generateActionWidget(dom, treeDom, element.self.uuid);
        //   e.stopPropagation();
        // }
        // dom.setAttribute("UUID", element.self.uuid);
        // element.self.properties.uuid = element.self.uuid;
        if(addinName === 'AssembleAddin'){
          addinName = element.self.properties._ASSEMBLECONFIG.name;
        }
        if (element.self.properties.id != '') {
          this.generateID(addinName);
        } else {
          element.self.properties.id = this.generateID(addinName);
        }
        //初始化addin-type表，存储结构为this.addinTypeMap[type][uuid] = id
        if (this.addinTypeMap[addinName]) {
          this.addinTypeMap[addinName][element.self.uuid] = element.self.properties.id;
        } else {
          this.addinTypeMap[addinName] = {};
          this.addinTypeMap[addinName][element.self.uuid] = element.self.properties.id;
        }
        // dom.setAttribute("draggable", "true");
        // this.jsonUUID[element.self.uuid] = element;
        // dom.ondragstart = this.onDragStart;
        // dom.ondragend = this.onDragEnd;
        // dom.ondragenter = this.onDragEnter;
        // dom.ondragover = this.onDragOver;
        // dom.ondrop = this.onDrop;
        // this.addinItem[addinName] = treeDom.getAllow();
        // element.obj = treeDom;
        // var parent = parentDom.getAttribute("dropTarget") == element.self.dropTarget ? [parentDom] : parentDom.querySelectorAll('[dropTarget="' + element.self.dropTarget + '"]')
        // if (parent.length == 0) parent = parentDom.querySelector('[dropTarget="0"]');
        // else {
        //   var _uuid = parentDom.getAttribute("UUID", "");
        //   var flag = true;
        //   for (var i = parent.length; i > 0; i--) {
        //     var _dom = parent[i - 1];
        //     flag = true;
        //     while (true) {
        //       var uuid = _dom.getAttribute("UUID", "");
        //       if (uuid && uuid != "") {
        //         flag = uuid == _uuid;
        //         break;
        //       }
        //       _dom = _dom.parentNode;
        //     }
        //     if (flag) {
        //       parent = parent[i - 1];
        //       break;
        //     }
        //   }
        //   if (!flag) parent = null;
        // }
        // if (!parent) parent = parentDom;
        // let dropItem, parentAddin;
        // switch (parentDom.getAttribute("addinname")) {
        //   case 'DragLayout':
        //     parentAddin = this.GetAddinByUUID(parentDom.getAttribute('uuid'));
        //     if('obj' in parentAddin){
        //       treeDom.$on("LayoutItemConfigChange", parentAddin.obj.LayoutItemConfigChange);
        //       treeDom.$on("DeleteItem", parentAddin.obj.deleteItem);
        //     }else{
        //       treeDom.$on("LayoutItemConfigChange", parentAddin.LayoutItemConfigChange);
        //       treeDom.$on("DeleteItem", parentAddin.deleteItem);
        //     }
        //     // treeDom.$on("fillContainerResetLayout", parentAddin.fillContainerResetLayout);
        //     dropItem = parentDom.querySelectorAll(`[containerUUID="${element.self.uuid}"]`);
        //     if (dropItem.length < 1) throw 'Illegal dropTarget or identical. Within DragLayout.';
        //     dropItem[0].appendChild(dom);
        //     break;
        //   case 'DragItem':
        //     // 拖拽布局控件布局方式
        //     // parentAddin = this.GetAddinById(this.jsonData.data, parentDom.getAttribute('uuid'));
        //     // parentAddin.$emit("fillContainerResetLayout", parentAddin.$data.args.identical);
        //     dropItem = parentDom.querySelectorAll(`.drag-item-container`);
        //     if (dropItem.length < 1) throw 'Illegal dropTarget or identical. Within DragLayout.';
        //     dropItem[0].appendChild(dom);
        //     break;
        //   default :
        //     parent.appendChild(dom); //将插件Dom添加入父元素
        //     break;
        // }
        if (element.elements && element.elements.length) {
          element.elements.forEach(element => {
            this.engine(element);
          });
        }
        return element;
      } catch (e) {
        console.log(e);
        console.log("创建" + element.self.elementType + "中失败");
      }
    },

    /**
     * id引擎生成id
     */
    idEngine(element) {
      let addinName = element.self.elementType.replace("addin_", "");
      if (element.self.properties.id != '') {
        // this.generateID(addinName);
      } else {
        element.self.properties.id = this.generateID(addinName);
      }
      if (element.elements && element.elements.length) {
        element.elements.forEach(element => {
          this.idEngine(element);
        });
      }
    },

    /**
     * 重设generateID
     */
    resetGenerateID() {
      let addinId = {};
      for (let type in this.addinTypeMap) {
        try {
          addinId[type] = [];
          for (let uuid in this.addinTypeMap[type]) {
            try {
              let exp = new RegExp(`^${type}\\d+`, 'g');
              let id = this.addinTypeMap[type][uuid].match(exp);
              if (id && id.length !== 0) addinId[type].push(id[0].replace(/[^0-9]/ig, ""));
            } catch (e) {
              console.log(`resetGenerateID内循环-${e}`)
            }
          }
          let maxId = Math.max.apply(null, addinId[type]);
          this.generateId[type] = parseInt(maxId)
        } catch (e) {
          console.log(`resetGenerateID外循环-${e}`)
        }
      }
    },

    /**
     *@description新的引擎监听方法包括新增和删除控件
     *@params
     *@date 2020/9/1
     *@return
     */
    jsonDataChange(evt) {
      for (let type in evt) {
        switch (type) {
          case 'added':
            if (evt.added.element.addin) {
              //非收藏控件拖入
              this.jsonData.data.elements.splice(evt.added.newIndex, 0, evt.added.element.addin);
            } else if (evt.added.element.nameProps) {
              //超级控件
              let addin = {
                self: {
                  elementType: `addin_${evt.added.element.nameProps}`,
                  properties: {
                    ...evt.added.element.argsProps,
                    id: this.generateID(evt.added.element.nameProps),
                    collectId: evt.added.element.oidProps,
                  },
                  dropTarget: 0,
                  uuid: uuid(),
                  DWFADDINARGSVERSION: DWFADDINARGSVERSION//addinargs版本，用来控制不同版本控件功能
                },
                elements: [],
              }
              delete addin.self.properties.defaultMultiAddin;
              let element = {
                name: addin.self.elementType.replace('addin_', ''),
                uuid: addin.self.uuid,
                addin: addin,
              }
              // this.formAddinList.splice(evt.added.newIndex, 1, element);
              this.jsonData.data.elements.splice(evt.added.newIndex, 0, addin);
            } else if(evt.added.element.groupOid){
              //小组件控件
              try {
                let addin = {
                  self: {
                    elementType: `addin_FormEngine`,
                    properties: {
                      bindTargetClass: "Component&e",
                      viewName: evt.added.element.viewName,
                      groupDisplayName: evt.added.element.groupDisplayName,
                      groupOid: evt.added.element.groupOid,
                      componentOid: evt.added.element.oid,
                      componentDisplayName: evt.added.element.displayName,
                    },
                    dropTarget: 0,
                    uuid: uuid(),
                  DWFADDINARGSVERSION: DWFADDINARGSVERSION//addinargs版本，用来控制不同版本控件功能
                  },
                  elements: [],
                }
                this.jsonData.data.elements.splice(evt.added.newIndex, 0, addin);
              }catch (e){
                console.error(`小组件控件${e}`)
              }
            } else if (evt.added.element.ISASSEMBLE) {
              //sdk控件
              let addin = {
                self: {
                  elementType: `addin_AssembleAddin`,
                  properties: {
                    _ASSEMBLECONFIG: evt.added.element
                  },
                  dropTarget: 0,
                  uuid: uuid(),
                  DWFADDINARGSVERSION: DWFADDINARGSVERSION//addinargs版本，用来控制不同版本控件功能
                },
                elements: [],
              }
              delete addin.self.properties.defaultMultiAddin;
              let element = {
                name: addin.self.elementType.replace('addin_', ''),
                uuid: addin.self.uuid,
                addin: addin,
              }
              // this.formAddinList.splice(evt.added.newIndex, 1, element);
              this.jsonData.data.elements.splice(evt.added.newIndex, 0, addin);
            } else {
              let addin = {
                self: {
                  elementType: `addin_${evt.added.element.name}`,
                  properties: {},
                  dropTarget: 0,
                  uuid: uuid(),
                  DWFADDINARGSVERSION: DWFADDINARGSVERSION//addinargs版本，用来控制不同版本控件功能
                },
                elements: [],
              }
              delete addin.self.properties.defaultMultiAddin;
              let element = {
                name: addin.self.elementType.replace('addin_', ''),
                uuid: addin.self.uuid,
                addin: addin,
              }
              // this.formAddinList.splice(evt.added.newIndex, 1, element);
              this.jsonData.data.elements.splice(evt.added.newIndex, 0, addin);
            }
            this.snapShotHistory();
            break;
          case 'moved':
            this.jsonData.data.elements.move(evt.moved.oldIndex, evt.moved.newIndex)
            this.snapShotHistory();
            break;
          case 'removed':
            this.removeAddin(evt.removed.element.uuid, 'root');
            break;
          default:
            break;
        }
      }
    },

    /**
     *@description:新的snapshot记录方法
     *@params
     *@date 2020/9/1
     *@return
     */
    snapShotHistory() {
      //快照只储存10页
      setTimeout(() => {
        if (this.snapShotCount >= 9) {
          this.dataSnapshot.shift();
          this.dataSnapshot.push(_.cloneDeep(this.pureJsonData(this.jsonData.data)));
        } else {
          if (this.snapShotCount < this.dataSnapshot.length) {
            this.dataSnapshot.splice(this.snapShotCount, this.dataSnapshot.length - this.snapShotCount);
            this.dataSnapshot.push(_.cloneDeep(this.pureJsonData(this.jsonData.data)));
          } else {
            this.dataSnapshot.push(_.cloneDeep(this.pureJsonData(this.jsonData.data)));
          }
          this.snapShotCount++;
        }
        this.$emit('snapShot', this.snapShotCount, this.dataSnapshot.length);
        this.resizeGridItem(this.jsonData.data);
      }, 0)
    },
    /**
     *@description选中控件
     *@params
     *@date 2020/9/3
     *@return
     */
    activeAddin(type, addin, uuid) {
      this.activeUUID = uuid;
      this.showEditBox(type, addin);
    },
    /**
     *@description复制控件
     *@params parentUUID:父元素uuid,root表示在根画布区复制
     *@params addin:要复制的addin
     *@date 2020/8/31
     *@return
     */
    copyAddin(addin, parentUUID = 'root') {
      // let element = this.reloadAddin(addin)
      // element.self.properties.id = this.generateID(element.self.elementType.replace('addin_', ''));
      if (parentUUID !== 'root') {
        this.insertJsonDataByUUID(this.jsonData.data, parentUUID, addin);
      } else {
        this.jsonData.data.elements.push(addin);
      }
      this.snapShotHistory();
      //特殊判断选中行中列的情况
      // if(Array.prototype.indexOf.call(this.targetItem.classList, 'addinC') !== -1 || Array.prototype.indexOf.call(this.targetItem.classList, 'addin-col-row') !== -1) this.targetItem = this.targetItem.parentNode.parentNode;
      // if (!this.targetItem || !this.targetItem.getAttribute("addinName")) return;
      // this.jsonFa = this.locateElement(this.targetItem.parentNode);
      // this.jsonSon = this.locateElement(this.targetItem);
      // //克隆不含obj的jsonData(克隆vue实例问题)
      // let newJsonSon = _.cloneDeep(this.reloadAddin(this.jsonSon));
      // //把obj重新装配克隆出的jsonData
      // this.generateJsonDataObj(this.jsonSon);
      // this.generateJsonDataObj(newJsonSon);
      // //处理拖拽块内部uuid依赖
      // this.reloadDragLayout(newJsonSon);
      // //处理拖拽块的复制
      // this.reloadDragItem(newJsonSon, this.jsonFa);
      // //生成控件
      // this.$nextTick(() => {
      //   if(this.jsonFa.obj){
      //     this.jsonSon = this.engine(this.jsonFa.obj.$el, newJsonSon)
      //   }else{
      //     this.jsonSon = this.engine(this.$refs.form, newJsonSon)
      //   }
      //   this.idEngine(this.jsonSon);
      //
      //   this.jsonFa.elements.push(this.jsonSon);
      //
      //   this.snapShotCount >= 10 ? "" : this.snapShotCount++;
      //   if (this.snapShotCount < this.dataSnapshot.length) {
      //     this.dataSnapshot = this.dataSnapshot.slice(0, this.snapShotCount);
      //   }
      //   var item = {
      //     type: "push",
      //     target: this.targetItem.parentNode,
      //     el: this.jsonSon.obj.$el,
      //     jsonFa: this.jsonFa,
      //     jsonSon: this.jsonSon,
      //     basicArgs: _.cloneDeep(this.basicArgs),
      //   };
      //   if(this.dataSnapshot.length === 10){
      //     this.dataSnapshot.shift();
      //     this.dataSnapshot.push([item]);
      //   }else{
      //     this.dataSnapshot[this.snapShotCount - 1] = [item]
      //   }
      // })
      // return true;
    },

    /**
     *@description移除控件
     *@params parentUUID:父元素uuid,root表示从根画布区删除
     *@params addin:要删除的uuid
     *@parame deleteButton:是否是点击删除按钮删除
     *@date 2020/8/31
     *@return
     */
    removeAddin(UUID, parentUUID, deleteButton) {
      //判断如果是多行多列内部移动不进行删除
      if (this.layoutSelfDragMode) {
        this.layoutSelfDragMode = false;
        return
      }
      if (parentUUID !== 'root') {
        this.removeJsonDataByUUID(this.jsonData.data, parentUUID, UUID);
      } else {
        let index = this.jsonData.data.elements.findIndex(element => element.self.uuid === UUID);
        index !== -1 ? this.jsonData.data.elements.splice(index, 1) : '';
      }
      this.activeUUID = '';
      this.$emit("hideEditBox");
      if (deleteButton) {
        this.snapShotHistory();
        this.hide();
      }
    },

    syncFresh(type, html, vue, oid) {
      for (var i in this.jsonUUID) {
        if (this.jsonUUID[i].obj && this.jsonUUID[i].obj.syncFresh) {
          this.jsonUUID[i].obj.syncFresh(type, html, vue, oid);
        }
      }
    },

    // 根据id获取控件实例
    GetAddinById(item, id) {
      if (!item) return null;
      if ("self" in item) {
        if (item.self.properties.id == id) return item.obj;
      }
      for (var i = 0; i < item.elements.length; i++) {
        var obj = this.GetAddinById(item.elements[i], id);
        if (obj) return obj;
      }
      return null;
    },

    // 根据uuid获取控件实例
    GetAddinByUUID(uuid) {
      if (!this.jsonUUID) return null;
      if (uuid in this.jsonUUID) {
        return this.jsonUUID[uuid];
      }
      return null;
    },

    // 根据id获取控件json
    GetJsonById(item, id) {
      if (!item) return null;
      if ("self" in item) {
        if (item.self.properties.id == id) return item;
      }
      for (var i = 0; i < item.elements.length; i++) {
        var obj = this.GetJsonById(item.elements[i], id);
        if (obj) return obj;
      }
      return null;
    },

    // 根据uuid获取控件json
    GetJsonByUUID(item, uuid) {
      if (!item) return null;
      if ("self" in item) {
        if (item.self.properties.uuid == uuid) return item;
      }
      for (var i = 0; i < item.elements.length; i++) {
        var addin = this.GetJsonByUUID(item.elements[i], uuid);
        if (addin) return addin;
      }
      return null;
    },

    // 添加监听事件
    addListeners() {
      /* 按键响应
          DELETE = 46
      */
      document.addEventListener('keydown', this.onKeyDown);
    },

    // 取消监听事件
    removeListeners() {
      document.removeEventListener('keydown', this.onKeyDown);
    },

    onKeyDown(e) {
      var ev = window.event || e;
      var code = ev.keyCode || ev.which;
      if ((code == 46 && ev.shiftKey) || (/macintosh|mac os x/i.test(navigator.userAgent) && code == 8 && ev.shiftKey)) {
        var target = document.activeElement;
        if (target == document.body) this.delete();
        else {
          var name = target.getAttribute("addinName");
          while (!name) {
            target = target.parentNode;
            if (!target || !target.getAttribute) break;
            name = target.getAttribute("addinName");
          }
          if (target && target.getAttribute) this.delete();
        }
      } else if (code == 83 && ev.ctrlKey) {
        this.$emit("saveForm");
        ev.preventDefault();
      }
    },

    // 生成插件实例
    getAddin(name) {
      let that = this;
      var addin = getAddin(name, "form", {
        mixins: [that.addinMixin()],
        // 传递prop数据,如json结构,关联类信息,实体类属性
        propsData: {
          store: this.$store,
          itemValue: this.jsonData,
          attributes: this.targetAttributes,
          relation: this.relation,
          editExtendInfo: this.editExtendInfo,
          // relations: this.relations,
          // relation_classes: this.relation_classes,
          widgetAnnotation: this.widgetAnnotation,
          checkResult: this.checkResult,
          query_oprs: this.query_oprs,
          route: this.route,
          router: this.router,
          root: this.root,
          Message: this.$Message,
          echarts: this.$echarts,
        },
        // 传递store函数
        methods: {
          getEn(targetClass) {
            return that.EntityList(targetClass);
          },
          // 遍历json结构获取对象即时数据
          getObj(item) {
            return that.GetObj(item);
          },
          getAttrFunc(name) {
            return getAddinFunc(name, "form");
          },
          _getViewData(param) {
            return that.getViewData(param);
          },
          _getViewDataByAttrs(param) {
            return that.getViewDataByAttrs(param);
          },
          async handleQueryData(param) {
            return await that._handleQueryData(param);
          },
          getClassObject(targetClass, id) {
            return that.EntitySingle(targetClass, id);
          },
          GetAddinById(item, id) {
            return that.GetAddinById(item, id);
          },
          GetAddinByUUID(uuid) {
            return that.GetAddinByUUID(uuid);
          },
          GetJsonById(item, id) {
            return that.GetJsonById(item, id);
          }
        },
      });
      return addin;
    },

    setData(args) {
      for (var i in args) {
        this[i] = args[i];
      }
    },

    // 更新基础配置
    updateConfig(arg = null) {
      this._updateConfig(this.jsonData.data, this.basicArgs, arg);
    },

    // 更新间距配置
    updateMargin() {
      this._updateMargin(this.jsonData.data, this.basicArgs);
    },

    _updateConfig(node, args, arg = null) {
      var _args = null;
      if (node.self && node.self.properties) {
        _args = node.self.properties;
        if (arg && arg in node.self.properties) {
          _args[arg] = args[arg] !== undefined ? args[arg] : node.self.properties[arg];
        } else {
          // for (var i in args) {
          //   if (node.self.elementType == "addin_row" && i == "cols") continue;
          //   if (i === 'row_space' || i === 'col_space') {
          //     _args[i] = args[i];
          //   }
          //   if (!(i in _args)) continue;
          //   _args[i] = args[i];
          // }
        }
        if (node.obj && node.self && node.self.properties && node.self.elementType != 'addin_col') {
          node.obj.$el.style.marginTop = args.row_space + 'px';
          node.obj.$el.style.marginBottom = args.row_space + 'px';
          node.obj.$el.style.marginLeft = args.col_space + 'px';
          node.obj.$el.style.marginRight = args.col_space + 'px';
        }
      }
      if (_args && _args.children) {
        for (var i in _args.children) {
          for (var j in args) {
            if (node.self.elementType == "addin_row" && j == "cols") continue;
            if (!(j in _args.children[i])) continue;
            _args.children[i][j] = args[j];
          }
        }
      }
      for (var i = 0; i < node.elements.length; i++) {
        this._updateConfig(node.elements[i], args, arg);
      }
    },

    _updateMargin(node, args) {
      if (node.obj && node.self && node.self.properties && node.self.elementType != 'addin_col') {
        node.obj.$el.style.marginTop = args.row_space + 'px';
        node.obj.$el.style.marginBottom = args.row_space + 'px';
        node.obj.$el.style.marginLeft = args.col_space + 'px';
        node.obj.$el.style.marginRight = args.col_space + 'px';
      }
      for (var i = 0; i < node.elements.length; i++) {
        this._updateMargin(node.elements[i], args);
      }
    },

    // 根据目标类属性，插入默认属性控件
    quickInsertAttributeComponent(attribute, target, type) {
      let prefixDict = {
        0: "",
        1: "relation_",
        2: "left_",
        3: "right_",
      }

      let displayName = (type == 2 ? this.relation.leftRole + "的" : (type == 3 ? this.relation.rightRole + "的" : "")) + attribute.displayName;
      let attributeName = prefixDict[type] + attribute.attributeName;

      // 默认布局属性
      let defaultArgs = {
        "label": displayName,
        "name": attributeName,
        "targetDataType": attribute.valueType,
      };
      // 默认布局插件选择
      let transformDict = {
        "Integer": "NumberInput",
        "Long": "NumberInput",
        "Double": "NumberInput",
        "Boolean": "Switch",
        "String": "TextInput",
        "Clob": "TextInput",
        "UUID": "TextInput",
        "GUID": "TextInput",
        "Date": "DateInput",
        "TimeStamp": "DateInput",
        "LocalFile": "Attachments",
        "Timeseries": "TimeSeriesSelect",
        "Json": "MultiFilesList",
      };
      if (transformDict[attribute.valueType]) {
        return {
          self: {
            elementType: `addin_${transformDict[attribute.valueType]}`,
            properties: {
              ...defaultArgs
            },
            dropTarget: target,
            uuid: uuid(),
                  DWFADDINARGSVERSION: DWFADDINARGSVERSION//addinargs版本，用来控制不同版本控件功能
          },
          elements: [],
        }
        // this.quickInsert(transformDict[attribute.valueType], defaultArgs, target);
      }

    },

    findDragCol(arr) {

      let colWrap = null;
      if (arr.length !== 0) {

        for (var i = 0; i < arr.length; i++) {
          if (arr[i].className.indexOf('ivu-col') != -1 && arr[i].className.indexOf('selected') != -1) {
            colWrap = arr[i];
          } else if (arr[i].children.length > 0) {
            colWrap = this.findDragCol(arr[i].children);
          }
        }
      }
      return colWrap;

    },

    // 快速配置表单操作
    //不需要再考虑放置元素等问题，直接修改jsonData数据即可
    quickCreate(quickCreateArgs) {
      // let targetWrap = null;
      // let eleList = this.jsonData.data.elements;
      //
      // // ******* 优先快速创建于选中容器控件 没有选中控件在后面追加 ********
      // // 获取当前表单中的列控件列表 （目前支持列和拖拽池）
      // let temWrapCol = eleList.filter(e => {
      //   return e.self.elementType == 'addin_col'
      // })
      //
      // // 当前表单中拖拽池列表
      // let temWrapDrag = eleList.filter(e => {
      //   return e.self.elementType == 'addin_DragLayout'
      // })
      //
      // if (temWrapCol.length == 0 && temWrapDrag.length == 0) {
      //
      //   targetWrap = this.$refs.form;
      //
      // } else if (temWrapCol.length != 0 && temWrapDrag.length == 0) {      //表单中有列 并没有拖拽池
      //
      //   // 获取当前表单中被选中的列控件
      //   let editWrapCol = temWrapCol.filter(e => {
      //
      //     return ((e.obj.t_edit == true && e.obj.$el.t_edit == true) || (e.obj.t_edit == true && e.obj.$el.t_edit == undefined))
      //   })
      //
      //   if (editWrapCol.length == 0) {
      //
      //     targetWrap = this.$refs.form;
      //
      //   } else {
      //     targetWrap = editWrapCol[0].obj.$el;
      //   }
      //
      // } else if (temWrapCol.length == 0 && temWrapDrag.length != 0) {      //表单中有拖拽池 并没有列
      //
      //   // ******** 获取当前表单中 被选中的 拖拽块控件 ********
      //   let actItemIndex = -1;
      //   let actItemId = '';
      //   let realItemIndex = -1;
      //   let isStaticDrag = false;   // 冻结的拖拽块结构和非冻结的结构不同
      //
      //   let editWrapDrag = temWrapDrag.filter(e => {
      //
      //     let targetDragItem = null;
      //     let itemList = e.obj.args.layout;
      //     // actItemIndex = itemList.findIndex(i => {
      //     //   return i.active == true;
      //     // })
      //     itemList.forEach((i, ind) => {
      //       if (i.active == true) {
      //         actItemId = i.containerUUID;
      //         actItemIndex = ind;
      //       }
      //     })
      //     if (actItemId != '') {
      //
      //       targetDragItem = e;
      //       isStaticDrag = e.obj.args.layout[actItemIndex].static;
      //       realItemIndex = actItemIndex;
      //
      //     }
      //
      //     return targetDragItem
      //
      //   })
      //
      //   if (editWrapDrag.length == 0) {
      //
      //     targetWrap = this.$refs.form;
      //
      //   } else {
      //
      //     // 获取当前表单中被选中过的拖拽池控件中被选中的拖拽快控件
      //     let targetRefs = editWrapDrag[0].obj.$refs;
      //     for (let key in targetRefs) {
      //
      //       if (key.indexOf('item') != -1) {
      //         if (targetRefs[key].length > 0) {
      //
      //           if (targetRefs[key][0].$attrs.containerUUID == actItemId) {
      //
      //             let temFakeWrap = null;
      //             if (isStaticDrag) {
      //               temFakeWrap = targetRefs[key][0].$el.children[0];
      //             } else {
      //               temFakeWrap = targetRefs[key][0].$el.children[1];
      //             }
      //
      //             if (temFakeWrap.children.length > 2) {
      //               targetWrap = temFakeWrap.children[1];
      //             } else {
      //               let temCol = this.findDragCol(temFakeWrap.children);
      //               if (temCol == null) {
      //                 targetWrap = temFakeWrap.children[1];
      //               } else {
      //                 targetWrap = temCol;
      //               }
      //             }
      //
      //           }
      //
      //         }
      //       }
      //
      //     }
      //
      //     if (targetWrap == null) {
      //       targetWrap = this.$refs.form;
      //     }
      //
      //   }
      //
      // } else {
      //
      //   // 获取当前表单中被选中的列控件
      //   let editWrapCol = temWrapCol.filter(e => {
      //
      //     return ((e.obj.t_edit == true && e.obj.$el.t_edit == true) || (e.obj.t_edit == true && e.obj.$el.t_edit == undefined))
      //   })
      //
      //   if (editWrapCol.length == 0) {
      //
      //     // ******** 获取当前表单中 被选中过的 拖拽池控件 ********
      //     let actItemIndex;
      //     let realItemIndex = -1;
      //     let editWrapDrag = temWrapDrag.filter(e => {
      //
      //       let targetDragItem = null;
      //       let itemList = e.obj.args.layout;
      //       actItemIndex = itemList.findIndex(i => {
      //         return i.active == true;
      //       })
      //       if (actItemIndex != -1) {
      //
      //         targetDragItem = e;
      //         realItemIndex = actItemIndex;
      //
      //       }
      //
      //       return targetDragItem
      //     })
      //
      //     if (editWrapDrag.length == 0) {
      //
      //       targetWrap = this.$refs.form;
      //
      //     } else {
      //
      //       // 获取当前表单中被选中过的拖拽池控件中被选中的拖拽快控件
      //       targetWrap = editWrapDrag[0].obj.$refs[`item${realItemIndex}`][0].$el.children[1];
      //
      //       if (targetWrap == null) {
      //         targetWrap = this.$refs.form;
      //       }
      //     }
      //
      //   } else {
      //     targetWrap = editWrapCol[0].obj.$el;
      //   }
      //
      // }

      let activeAddin = this.GetJsonByUUID(this.jsonData.data, this.activeUUID);
      let targetWrap = activeAddin ? activeAddin.self.elementType : '';
      let dropTarget = 0;
      let activeUUID = this.activeUUID;
      if(targetWrap === 'addin_col'){

      }else if(targetWrap === 'addin_DragItem'){
        dropTarget = 'DragItem';
      }else{
        activeUUID = 'root'
      }
      // 快速创建提示
      // this.$Message.info("快速创建成功");

      // 清空表单
      // let initialJson = {"data": {"elements": [], "targetClass": ""}};
      // initialJson.data.targetClass = this.targetClass.className;
      // this.init(initialJson);

      // 修改基本配置之列数为1并更新
      let old_cols = this.basicArgs.cols;
      this.basicArgs.cols = 1;

      // // 放入单行单列行控件，用于放置操作按钮
      // let rowDropTargets = this.quickInsert("row", {"rows": 1, "cols": 1}, this.$refs.form).getElementsByClassName('addin ivu-col');
      // // 插入操作按钮
      // let opr_paths = ["save", "edit", "delete", "refresh"]
      // let text_dict = {
      //     "save": "新增",
      //     "edit": "编辑",
      //     "delete": "删除",
      //     "refresh": "刷新"
      // }
      // opr_paths.forEach( path => {
      //     this.quickInsert("Operation", {
      //         "opr_path": path,
      //         "text": text_dict[path],
      //     },
      //     rowDropTargets[0]);
      // })

      let attributeDict = {};
      this.targetAttributes.forEach(attr => {
        attributeDict[attr.attributeName] = attr;
      });

      // 对于每个分组快速插入
      quickCreateArgs.forEach(group => {
        // 放入分组控件
        // let groupBoxElement = this.quickInsert("GroupBox", {"_title": group.groupName}, targetWrap);

        let groupbox = {
          self: {
            elementType: `addin_GroupBox`,
            properties: {
              _title: group.groupName
            },
            dropTarget: dropTarget,
            uuid: uuid(),
                  DWFADDINARGSVERSION: DWFADDINARGSVERSION//addinargs版本，用来控制不同版本控件功能
          },
          elements: [],
        }
        // 获取选择的属性对象列表
        let selected_attributes = [];
        // 快速创建允许的类型
        let allowType = ['Integer', 'Long', 'Double', 'Boolean', 'String', 'Clob', 'UUID', 'GUID', 'Date', 'TimeStamp', 'LocalFile', 'Timeseries', 'Json'];
        group.selectedAttributes.forEach(attr => {
          if(allowType.includes(attributeDict[attr].valueType)){
            selected_attributes.push(attributeDict[attr])
          }
        });

        // // 放入行控件，行数为目标类属性数目，用于放置属性控件
        // this.basicArgs.cols = group.cols;
        // var attrDropTargets = [];
        // for (let i = 0; i < Math.ceil(selected_attributes.length / group.cols); i++) {
        //   let attrDropTarget = this.quickInsert("row", {
        //       "rows": 1,
        //       "cols": group.cols
        //     },
        //     groupBoxElement.childNodes[0].childNodes[2]
        //   ).getElementsByClassName('addinC ivu-col');
        //   attrDropTargets = attrDropTargets.concat(Array.from(attrDropTarget));
        // }

        // 插入属性控件
        // selected_attributes.forEach(
        //   (attr, index) => {
        //     this.quickInsertAttributeComponent(attr, dropTargetList[index], 0);
        //   }
        // );
        //生成dropTarget列表
        let dropTargetList = [];
        let selectedAttributesAddin = [];
        let count = 0;
        for (let i = 0; i < Math.ceil(selected_attributes.length / group.cols); i++) {
          for (let index = 1; index <= group.cols && count < selected_attributes.length; index++) {
            count++;
            dropTargetList.push(`1,${index}`);
            // if(allowType.includes(selected_attributes[i * group.cols + index - 1].valueType)){
            // }
          }
        };
        // 插入属性控件
        selected_attributes.forEach((attr, index) => {
          selectedAttributesAddin.push(this.quickInsertAttributeComponent(attr, dropTargetList[index], 0))
        });
        //生成所有行控件
        for (let i = 0; i < Math.ceil(selected_attributes.length / group.cols); i++) {
          let row = {
            self: {
              elementType: `addin_row`,
              properties: {
                rows: 1,
                cols: group.cols
              },
              dropTarget: 0,
              uuid: uuid(),
                  DWFADDINARGSVERSION: DWFADDINARGSVERSION//addinargs版本，用来控制不同版本控件功能
            },
            elements: selectedAttributesAddin.splice(0, group.cols),
          };
          groupbox.elements.push(row);
        };
        //
        // // 插入属性控件
        // selected_attributes.forEach(
        //   (attr, index) => {
        //     this.quickInsertAttributeComponent(attr, attrDropTargets[index], 0);
        //   }
        // );
        //修改jsonData
        if (activeUUID !== 'root') {
          this.insertJsonDataByUUID(this.jsonData.data, activeUUID, groupbox);
        } else {
          this.jsonData.data.elements.push(groupbox);
        }
      })
      this.snapShotHistory();
      this.basicArgs.cols = old_cols;
      this.updateMargin()
    },

    // 模拟用户拖拽放入操作，快速插入属性控件
    quickInsert(addinName, args, targetItem) {

      var that = this;
      var elementType = addinName;

      var target = targetItem;
      var dropTarget = target.getAttribute("dropTarget");
      while (!dropTarget) {
        target = target.parentNode;
        dropTarget = target.getAttribute("dropTarget");
      }
      var _target = target;
      var name = target.getAttribute("addinName");
      while (!name) {
        target = target.parentNode;
        name = target.getAttribute("addinName");
      }
      var allow = this.addinItem[name];
      if (!allow || (allow.length > 0 && allow.indexOf(elementType) == -1)) {
        this.dropFlag = 1;
        return;
      }

      if (true) {
        var addin = this.getAddin(addinName);
        this.addinItem[addinName] = addin.getAllow(dropTarget);
        addin.$on("showEditBox", this.showEditBox);
        addin.$on("generateActionWidget", this.generateActionWidget);
        addin.$on("hideEditBox", this.hide);
        addin.$on("checkRow", this.checkRow);


        var el = addin.setDisplayType(0).setArgs(args);
        if (addinName == "row") {
          el.refresh("cols");
        }
        el = el.$mount().$el;
        el.classList.add("addin");
        el.classList.add(this.deviceType);
        if (addinName in this.addins.layout) {
          el.classList.add("addin-layout");
        }
        var _id = uuid();
        el.onclick = (e) => {
          that.showEditBox(el, null, addin);
          this.generateActionWidget(el, addin, _id);
          e.stopPropagation();
        };
        el.setAttribute("UUID", _id);
        let m_args = addin.getArgs();
        m_args.uuid = _id;
        if (!m_args.id) m_args.id = this.generateID(addinName);
        el.setAttribute("draggable", "true");
        el.ondragstart = this.onDragStart;
        el.ondragend = this.onDragEnd;
        el.ondragenter = this.onDragEnter;
        el.ondragover = this.onDragOver;
        el.ondrop = this.onDrop;

        this.jsonSon = {
          self: {
            elementType: "addin_" + elementType,
            properties: addin.getArgs(),
            dropTarget: dropTarget,
            uuid: _id
          },
          elements: [],
          obj: addin
        }
        this.jsonUUID[_id] = this.jsonSon;
      } else {
        this.jsonSon.self.dropTarget = dropTarget;
      }
      var node = this.locateElement(target);
      if (dropTarget == "dragItem") {
        //快速创建到拖拽块里的方法
        addin ? node.obj.fillAddin(null, addin) : node.obj.fillAddin(null, el);
        if (!_target) return;
      } else {
        _target.appendChild(el);
      }
      this.dropFlag = 2;
      node.elements.push(this.jsonSon);
      // 继承属性
      let _args = {};
      for (var i in this.basicArgs) {
        if (i in this.jsonSon.self.properties) {
          _args[i] = this.basicArgs[i] || this.jsonSon.self.properties[i]
        }
      }
      this.jsonSon.obj.setArgs(_args);
      if (node.obj && node.obj.getInherit) this.jsonSon.obj.setArgs(node.obj.getInherit(dropTarget));

      if (this.snapShotCount < this.dataSnapshot.length) {
        this.dataSnapshot = this.dataSnapshot.slice(0, this.snapShotCount);
      }

      var item = {
        type: "push",
        jsonFa: node,
        jsonSon: this.jsonSon,
        target: _target,
        el: el,
        basicArgs: _.cloneDeep(this.basicArgs),
      };
      if (this.dataSnapshot.length === 10) {
        this.dataSnapshot.shift();
        this.dataSnapshot.push([item]);
      } else {
        this.dataSnapshot[this.snapShotCount - 1] = [item]
      }
      // 返回可插入位点
      return el;
    },

    quickCreateRelation(quickCreateArgs) {

      // let targetWrap = null;
      // let eleList = this.jsonData.data.elements;
      //
      // // ******* 优先快速创建于选中容器控件 没有选中控件在后面追加 ********
      // // 获取当前表单中的全部容器控件 （目前支持列和拖拽池）
      // let temWrapCol = eleList.filter(e => {
      //   return e.self.elementType == 'addin_col'
      // })
      //
      // // 当前表单中拖拽池列表
      // let temWrapDrag = eleList.filter(e => {
      //   return e.self.elementType == 'addin_DragLayout'
      // })
      //
      // if (temWrapCol.length == 0 && temWrapDrag.length == 0) {
      //
      //   targetWrap = this.$refs.form;
      //
      // } else if (temWrapCol.length != 0 && temWrapDrag.length == 0) {      //表单中有列 并没有拖拽池
      //
      //   // 获取当前表单中被选中的列控件
      //   let editWrapCol = temWrapCol.filter(e => {
      //
      //     return ((e.obj.t_edit == true && e.obj.$el.t_edit == true) || (e.obj.t_edit == true && e.obj.$el.t_edit == undefined))
      //   })
      //
      //   if (editWrapCol.length == 0) {
      //
      //     targetWrap = this.$refs.form;
      //
      //   } else {
      //     targetWrap = editWrapCol[0].obj.$el;
      //   }
      //
      // } else if (temWrapCol.length == 0 && temWrapDrag.length != 0) {      //表单中有拖拽池 并没有列
      //
      //   // ******** 获取当前表单中 被选中的 拖拽块控件 ********
      //   let actItemIndex;
      //   let realItemIndex = -1;
      //   let isStaticDrag = false;   // 冻结的拖拽块结构和非冻结的结构不同
      //
      //   let editWrapDrag = temWrapDrag.filter(e => {
      //
      //     let targetDragItem = null;
      //     let itemList = e.obj.args.layout;
      //     actItemIndex = itemList.findIndex(i => {
      //       return i.active == true;
      //     })
      //     if (actItemIndex != -1) {
      //
      //       targetDragItem = e;
      //       isStaticDrag = e.obj.args.layout[actItemIndex].static;
      //       realItemIndex = actItemIndex;
      //     }
      //
      //     return targetDragItem
      //
      //   })
      //
      //   if (editWrapDrag.length == 0) {
      //
      //     targetWrap = this.$refs.form;
      //
      //   } else {
      //
      //     // 获取当前表单中被选中过的拖拽池控件中被选中的拖拽快控件
      //     if (isStaticDrag) {
      //       targetWrap = editWrapDrag[0].obj.$refs[`item${realItemIndex}`][0].$el.children[0].children[1];
      //     } else {
      //       targetWrap = editWrapDrag[0].obj.$refs[`item${realItemIndex}`][0].$el.children[1];
      //     }
      //
      //     if (targetWrap == null) {
      //       targetWrap = this.$refs.form;
      //     }
      //   }
      //
      // } else {
      //
      //   // 获取当前表单中被选中的列控件
      //   let editWrapCol = temWrapCol.filter(e => {
      //
      //     return ((e.obj.t_edit == true && e.obj.$el.t_edit == true) || (e.obj.t_edit == true && e.obj.$el.t_edit == undefined))
      //   })
      //
      //   if (editWrapCol.length == 0) {
      //
      //     // ******** 获取当前表单中 被选中过的 拖拽池控件 ********
      //     let actItemIndex;
      //     let realItemIndex = -1;
      //     let editWrapDrag = temWrapDrag.filter(e => {
      //
      //       let targetDragItem = null;
      //       let itemList = e.obj.args.layout;
      //       actItemIndex = itemList.findIndex(i => {
      //         return i.active == true;
      //       })
      //       if (actItemIndex != -1) {
      //
      //         targetDragItem = e;
      //         realItemIndex = actItemIndex;
      //
      //       }
      //
      //       return targetDragItem
      //     })
      //
      //     if (editWrapDrag.length == 0) {
      //
      //       targetWrap = this.$refs.form;
      //
      //     } else {
      //
      //       // 获取当前表单中被选中过的拖拽池控件中被选中的拖拽快控件
      //       targetWrap = editWrapDrag[0].obj.$refs[`item${realItemIndex}`][0].$el.children[1];
      //
      //       if (targetWrap == null) {
      //         targetWrap = this.$refs.form;
      //       }
      //     }
      //
      //   } else {
      //     targetWrap = editWrapCol[0].obj.$el;
      //   }
      //
      // }

      let activeAddin = this.GetJsonByUUID(this.jsonData.data, this.activeUUID);
      let targetWrap = activeAddin ? activeAddin.self.elementType : '';
      let dropTarget = 0;
      let activeUUID = this.activeUUID;
      if(targetWrap === 'addin_col'){

      }else if(targetWrap === 'addin_DragItem'){
        dropTarget = 'DragItem';
      }else{
        activeUUID = 'root'
      }
      // 快速创建提示
      // this.$Message.info("快速创建成功");

      // 清空表单
      // let initialJson = {"data": {"elements": [], "targetClass": ""}};
      // initialJson.data.targetClass = this.targetClass.className;
      // this.init(initialJson);

      // 修改基本配置之列数为1并更新
      let old_cols = this.basicArgs.cols;
      this.basicArgs.cols = 1;

      let relationAttributeDict = {};
      // 快速创建允许的类型
      let allowType = ['Integer', 'Long', 'Double', 'Boolean', 'String', 'Clob', 'UUID', 'GUID', 'Date', 'TimeStamp', 'LocalFile', 'Timeseries', 'Json'];
      this.targetAttributes[1].forEach(attr => {
        if (!['leftClass', 'rightClass', 'leftOid', 'rightOid'].includes())
          relationAttributeDict[attr.attributeName] = attr;
      });

      let leftAttributeDict = {};
      this.targetAttributes[2].forEach(attr => {
        leftAttributeDict[attr.attributeName] = attr;
      });

      let rightAttributeDict = {};
      this.targetAttributes[3].forEach(attr => {
        rightAttributeDict[attr.attributeName] = attr;
      });

      let attributeDict = [];
      attributeDict.push(relationAttributeDict);
      attributeDict.push(leftAttributeDict);
      attributeDict.push(rightAttributeDict);

      console.log(this.targetAttributes, attributeDict, quickCreateArgs)

      quickCreateArgs.forEach(group => {
        // // 放入分组控件
        // let groupBoxElement = this.quickInsert("GroupBox", {"_title": group.groupName}, targetWrap);
        let groupbox = {
          self: {
            elementType: `addin_GroupBox`,
            properties: {
              _title: group.groupName
            },
            dropTarget: dropTarget,
            uuid: uuid(),
                  DWFADDINARGSVERSION: DWFADDINARGSVERSION//addinargs版本，用来控制不同版本控件功能
          },
          elements: [],
        }
        // 关联类

        // 获取选择的属性对象列表
        let selected_attributes = [];
        group.relationAttributes.forEach(attr => {
          if(allowType.includes(attributeDict[0][attr].valueType)){
            selected_attributes.push(attributeDict[0][attr])
          }
        });
        group.leftAttributes.forEach(attr => {
          if(allowType.includes(attributeDict[1][attr].valueType)){
            selected_attributes.push(attributeDict[1][attr])
          }
        });
        group.rightAttributes.forEach(attr => {
          if(allowType.includes(attributeDict[2][attr].valueType)){
            selected_attributes.push(attributeDict[2][attr])
          }
        });

        // 放入行控件，行数为目标类属性数目，用于放置属性控件
        this.basicArgs.cols = group.cols;

        //生成dropTarget列表
        let dropTargetList = [];
        let selectedAttributesAddin = [];
        let count = 0;
        for (let i = 0; i < Math.ceil(selected_attributes.length / group.cols); i++) {
          for (let index = 1; index <= group.cols && count < selected_attributes.length; index++) {
            count++;
            dropTargetList.push(`1,${index}`);
          }
        };
        // 插入属性控件
        let indexOfleft = group.relationAttributes.length;
        let indexOfRight = indexOfleft + group.leftAttributes.length;
        selected_attributes.forEach((attr, index) => {
          selectedAttributesAddin.push(this.quickInsertAttributeComponent(attr, dropTargetList[index], index < indexOfleft ? 1 : (index < indexOfRight ? 2 : 3)));
        });
        // var attrDropTargets = [];
        // for (let i = 0; i < Math.ceil(selected_attributes.length / group.cols); i++) {
        //   let attrDropTarget = this.quickInsert("row", {
        //       "rows": 1,
        //       "cols": group.cols
        //     },
        //     groupBoxElement.childNodes[0].childNodes[2]
        //   ).getElementsByClassName('addinC ivu-col');
        //   attrDropTargets = attrDropTargets.concat(Array.from(attrDropTarget));
        // }
        // 插入属性控件
        // let indexOfleft = group.relationAttributes.length;
        // let indexOfRight = indexOfleft + group.leftAttributes.length;

        // selected_attributes.forEach(
        //   (attr, index) => {
        //     this.quickInsertAttributeComponent(attr, attrDropTargets[index], index < indexOfleft ? 1 : (index < indexOfRight ? 2 : 3));
        //   }
        // );
        //生成所有行控件
        for (let i = 0; i < Math.ceil(selected_attributes.length / group.cols); i++) {
          let row = {
            self: {
              elementType: `addin_row`,
              properties: {
                rows: 1,
                cols: group.cols
              },
              dropTarget: 0,
              uuid: uuid(),
                  DWFADDINARGSVERSION: DWFADDINARGSVERSION//addinargs版本，用来控制不同版本控件功能
            },
            elements: selectedAttributesAddin.splice(0, group.cols),
          };
          groupbox.elements.push(row);
        };
        if (activeUUID !== 'root') {
          this.insertJsonDataByUUID(this.jsonData.data, activeUUID, groupbox);
        } else {
          this.jsonData.data.elements.push(groupbox);
        }
      })

      this.snapShotHistory();
      this.basicArgs.cols = old_cols;
    },

    // deleteAddin(){
    //   return this.delete();
    // },

    // DELETE键事件:删除当前组件
    // delete() {
    //   //特殊判断选中行中列的情况
    //   if(Array.prototype.indexOf.call(this.targetItem.classList, 'addinC') !== -1 || Array.prototype.indexOf.call(this.targetItem.classList, 'addin-col-row') !== -1) this.targetItem = this.targetItem.parentNode.parentNode;
    //   // while (this.targetItem && !this.targetItem.getAttribute("addinName")){
    //   //   this.targetItem = this.targetItem.parentNode;
    //   // }
    //   if (!this.targetItem || !this.targetItem.getAttribute("addinName")) return;
    //   const jsonFa = this.locateElement(this.targetItem.parentNode);
    //   const jsonSon = this.locateElement(this.targetItem);
    //   this.snapShotCount >= 10 ? "" : this.snapShotCount++;
    //   var item = {
    //     type: "pull",
    //     target: this.targetItem.parentNode,
    //     el: this.targetItem,
    //     jsonSon: jsonSon,
    //     jsonFa: jsonFa,
    //     basicArgs: _.cloneDeep(this.basicArgs),
    //   }
    //   if(this.dataSnapshot.length === 10){
    //     this.dataSnapshot.shift();
    //     this.dataSnapshot.push([item]);
    //   }else{
    //     this.dataSnapshot[this.snapShotCount - 1] = [item]
    //   }
    //   this._onDragEnd(jsonFa, jsonSon, false, this.targetItem.parentNode, this.targetItem);
    //   this.hide();
    // },

    //删除所有控件,初始化基础设置
    initalForm() {
      // this.snapShotCount >= 10 ? "" : this.snapShotCount++;
      // let jsonDataCatch = [];
      // this.jsonData.data.elements.forEach(e => {
      //   jsonDataCatch.push(e)
      // })
      // var item = {
      //   type: "init",
      //   target: 'GlobalForm',
      //   jsonData: jsonDataCatch,
      //   basicArgs: _.cloneDeep(this.basicArgs),
      // }
      // if (this.dataSnapshot.length === 10) {
      //   this.dataSnapshot.shift();
      //   this.dataSnapshot.push([item]);
      // } else {
      //   this.dataSnapshot[this.snapShotCount - 1] = [item]
      // }
      // this.formAddinList = [];
      this.jsonData.data.elements = [];
      this.snapShotHistory();
      // for (var i = this.$refs.form.children.length; i > 0; i--) {
      //   this.$refs.form.removeChild(this.$refs.form.children[i - 1]);
      // }
      this.$emit("hideEditBox");
    },

    // 隐藏属性编辑框
    hide() {
      // if (this.targetItem) {
      //   this.targetItem.t_edit = false;
      //   this.targetItem.classList.remove("selected");
      //   if (this.targetItem.querySelectorAll('.selected') && this.targetItem.querySelectorAll('.selected').length !== 0) {
      //     this.targetItem.querySelectorAll('.selected').forEach(item => {
      //       item.classList.remove('selected');
      //     })
      //   }
      //   ;
      // }
      // this.targetItem = null;
      // if (this.actionWidget) {
      //   this.actionWidget.$el.parentNode.removeChild(this.actionWidget.$el);
      //   this.actionWidget.$destroy();
      // }
      // this.actionWidget = null;
      // if (this.commentWidget) {
      //   this.commentWidget.$el.parentNode.removeChild(this.commentWidget.$el);
      //   this.commentWidget.$destroy();
      // }
      // this.commentWidget = null;
      // this.$emit("hideEditBox");
      if(this.activeUUID){
        this.activeUUID = '';
        this.$emit("hideEditBox");
        this.resizeAddin(this.jsonData.data);
      }
    },

    getDwfCtx(){
      return {
        dwf_axios: dwf_app_axios,
        dwf_modeler_axios: axios,
        msgbox: this.$Message,
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
          userName: sessionStorage.getItem('usernameM') || '',
          displayName: sessionStorage.getItem('displayNameM') || '',
          oid: sessionStorage.getItem('oidM') || '',
          userId: sessionStorage.getItem('userIdM') || '',
          token: sessionStorage.getItem('tokenM') || '',
          userGroups: JSON.parse(sessionStorage.getItem('userGroupsM')) || '',
        },
        getAttribute: (name) => {
          return this.Attributes(name);
        },
        getAttributesByClass: async (name) => {
          if (this.AttributesByClass(name).length !== 0) {
            return this.AttributesByClass(name);
          } else {
            return await this.GetAttributeClassMap(name);
          }
        },
        getEntityClass: async (name) => {
          if (this.Entities(name)) {
            return this.Entities(name);
          } else {
            await this.queryEntity(name);
            return this.Entities(name);
          }
        },
        getRelationClass: async (name) => {
          if (this.Relations(name)) {
            return this.Relations(name);
          } else {
            await this.queryRelation(name);
            return this.Relations(name);
          }
        },
        handleQueryData: async (param) => {
          return this._handleQueryData(param);
        },
        isEntitySysAttribute: (attribute) => SYS_ENTITY_ATTRIBUTES(attribute),
        isRelationSysAttribute: (attribute) => SYS_RELATION_ATTRIBUTES(attribute),
      }
    },

    addinMixin() {
      let _this = this;
      return {
        data() {
          return {
            dwf_ctx: {
              dwf_axios: dwf_app_axios,
              dwf_modeler_axios: axios,
              msgbox: _this.$Message,
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
                userName: sessionStorage.getItem('usernameM') || '',
                displayName: sessionStorage.getItem('displayNameM') || '',
                oid: sessionStorage.getItem('oidM') || '',
                userId: sessionStorage.getItem('userIdM') || '',
                token: sessionStorage.getItem('tokenM') || '',
                userGroups: JSON.parse(sessionStorage.getItem('userGroupsM')) || '',
              },
              getAttribute: (name) => {
                return _this.Attributes(name);
              },
              getAttributesByClass: async (name) => {
                if (_this.AttributesByClass(name).length !== 0) {
                  return _this.AttributesByClass(name);
                } else {
                  return await _this.GetAttributeClassMap(name);
                }
              },
              getEntityClass: async (name) => {
                if (_this.Entities(name)) {
                  return _this.Entities(name);
                } else {
                  await _this.queryEntity(name);
                  return _this.Entities(name);
                }
              },
              getRelationClass: async (name) => {
                if (_this.Relations(name)) {
                  return _this.Relations(name);
                } else {
                  await _this.queryRelation(name);
                  return _this.Relations(name);
                }
              },
              handleQueryData: async (param) => {
                return _this._handleQueryData(param);
              },
              isEntitySysAttribute: (attribute) => SYS_ENTITY_ATTRIBUTES(attribute),
              isRelationSysAttribute: (attribute) => SYS_RELATION_ATTRIBUTES(attribute),
            },
          }
        }
      }
    },

    /**
     *@descriptionresize视图控件
     *@params
     *@date 2020/9/15
     *@return
     */
    resizeAddin(addin){
      let visualCharts = [
        "addin_EchartBar",
        "addin_EChart",
        "addin_BarChart",
        "addin_LineChart",
        "addin_ScatterChart",
        "addin_PieChart",
        "addin_MapChart",
        "addin_MapCityChart",
        "addin_ParallelChart",
        "addin_CalendarChart",
        "addin_GaugeChart",
        "addin_CheckBox",
        "addin_RadioButton",
      ];
      let timeseries = [
        "addin_TimeSeriesCharts",
        "addin_TimeSeriesBoard"
      ];
      if(addin.self){
        if ((visualCharts.indexOf(addin.self.elementType) >= 0) && addin.obj && addin.obj.resizeChart) {
          addin.obj.resizeChart();
        }
        if ((timeseries.indexOf(addin.self.elementType) >= 0) && addin.obj && addin.obj.resizeChart) {
          addin.obj.resizeChart();
        }
      }
      if (addin.elements && addin.elements.length) {
        addin.elements.forEach(element => {
          this.resizeAddin(element)
        });
      }
    },

    /**
    *@description刷新拖拽块
    *@params
    *@date 2020/11/27
    *@return
    */
    resizeGridItem(addin){
      if(addin.self && addin.self.elementType === 'addin_DragLayout'){
        if (addin.obj && addin.obj.refreshAllItem) {
          addin.obj.refreshAllItem();
        }
      }
      if (addin.elements && addin.elements.length) {
        addin.elements.forEach(element => {
          this.resizeGridItem(element)
        });
      }
    },
    // 获取当前表单内数据对象
    GetObj(item) {
      var obj = {};
      if ("origin" in item) {
        for (var i in item.origin) {
          obj[i] = item.origin[i];
        }
      }
      for (var i = 0; i < item.elements.length; i++) {
        if (item.elements[i].obj) {
          var name = item.elements[i].obj.getFormName ? item.elements[i].obj.getFormName() : null;
          if (name) {
            var value = item.elements[i].obj.getValue();
            if (value != undefined) obj[name] = value;
          }
        }
        var other = this.GetObj(item.elements[i]);
        for (var j in other) {
          obj[j] = other[j];
        }
      }
      return obj;
    },

    // 获取纯json(删除无法格式化的部分)
    pureJsonData(node) {
      var item = {};
      for (var i in node) {
        if (i == "elements") item[i] = [];
        else if (i != "obj") {
          item[i] = node[i];
          if (i == "self" && item[i].properties.columnDefs) {
            item[i].properties.columnDefs.forEach(x => {
              if (x.filterFramework) delete x.filterFramework;
              if (x.filterParams) delete x.filterParams;
              if (x.cellRendererFramework) delete x.cellRendererFramework;
            })
          }
          if(node.self && node.self.elementType === 'addin_FormEngine' && node.self.properties.groupOid){
            this.includeComponentAddinFlag = true;
          }
        }
      }
      for (var i = 0; i < node.elements.length; i++) {
        item.elements.push(this.pureJsonData(node.elements[i]));
      }
      return item;
    },

    includeComponentAddin(){
      this.getJsonCode();
      return this.includeComponentAddinFlag;
    },

    _reloadGridFilter() {
      this.reloadGridFilter(this.jsonData.data);
    },

    reloadGridFilter(node) {
      var item = {};
      for (var i in node) {
        if (i == "elements") item[i] = [];
        else if (i == "obj") {
          item[i] = node[i];
          if (item[i].name == 'Grid' && item[i].reloadGridFilter) {
            item[i].reloadGridFilter()
          }
        }
      }
      for (var i = 0; i < node.elements.length; i++) {
        item.elements.push(this.reloadGridFilter(node.elements[i]));
      }
      return item;
    },

    showNode(node) {
      return null;
      // return "\n******\n" + JSON.stringify(node, null, 4) + "\n******\n";
    },

    getJsonCode() {
      this.includeComponentAddinFlag = false;
      let args = null;
      for (var id in this.jsonUUID) {
        if (this.jsonUUID[id].obj) {
          args = this.jsonUUID[id].obj.getArgs();
          // if (!args.events) continue;
          // for (var i = args.events.length - 1; i >= 0; i--) {
          // if (args.events[i].tmp || !args.events[i].name || !args.events[i].opr_path || !args.events[i].opr_type)
          //   args.events.splice(i, 1);
          // }
        }
      }
      return JSON.stringify({"data": this.pureJsonData(this.jsonData.data)}, null, 4);
    },

    getJsonData() {
      return this.jsonData;
    },

    // 获取dom元素所在的控件实例
    locateElement(item) {
      var name = item.getAttribute("UUID");
      while (!name) {
        item = item.parentNode;
        name = item.getAttribute("UUID");
      }
      var node = name == "init" ? this.jsonData.data : this.jsonUUID[name];
      return node;
    },

    //重载json中uuid
    reloadAddin(jsonData) {
      let addin = {};
      if (jsonData.self && jsonData.self.properties.columnDefs) {
        jsonData.self.properties.columnDefs.forEach(x => {
          if (x.filterFramework) delete x.filterFramework;
          if (x.filterParams) delete x.filterParams;
          if (x.cellRendererFramework) delete x.cellRendererFramework;
        })
      }
      addin.self = _.cloneDeep(jsonData.self);
      if(addin.self.elementType === "addin_AssembleAddin"){
        addin.self.properties.id = this.generateID(jsonData.self.properties._ASSEMBLECONFIG.name);
      }else{
        addin.self.properties.id = this.generateID(jsonData.self.elementType.replace("addin_", ""));
      }
      //缓存批注
      let widgetAnnotation = this.widgetAnnotation[addin.self.uuid];
      //更换uuid
      addin.self.properties.uuid = addin.self.uuid = uuid();
      this.widgetAnnotation[addin.self.uuid] = widgetAnnotation;
      addin.elements = [];
      // this.jsonUUID[jsonData.self.uuid] = jsonData;
      // this.objPool[jsonData.self.uuid] = jsonData.obj;
      // delete jsonData['obj'];
      if (jsonData.elements && jsonData.elements.length) {
        jsonData.elements.forEach(element => {
          addin.elements.push(this.reloadAddin(element));
        });
      }
      return addin;
    },

    //重新装配jsonData中obj
    generateJsonDataObj(jsonData) {
      if (jsonData.self.uuid in this.objPool) {
        jsonData.obj = this.objPool[jsonData.self.uuid];
      }
      if (jsonData.elements && jsonData.elements.length) {
        jsonData.elements.forEach(element => {
          this.generateJsonDataObj(element);
        });
      }
      return jsonData;
    },

    /**
     *@description通过parentUUID和UUID获取addin
     *@params
     *@date 2020/9/1
     *@return
     */
    getJsonDataByUUID(element, UUID) {
      if (!element) return null;
      if ("self" in element) {
        if (element.self.uuid == UUID) {
          return element;
        }
      }
      for (var i = 0; i < element.elements.length; i++) {
        var jsonData = this.getJsonDataByUUID(element.elements[i], UUID);
        if (jsonData) {
          return jsonData;
        }
      }
      return null;
    },
    /**
    *@description通过双击创建
    *@params
    *@date 2020/9/11
    *@return
    */
    doubleClickInsertJsonData(item){
      if(item === 'DragItem'){
        this.$Message.error('请将拖拽块拖入拖拽池中');
        return;
      }
      let dropTarget = 0;
      //是否为布局控件内
      let inLayout = false;
      let targetAddin = this.getJsonDataByUUID(this.jsonData.data, this.activeUUID);
      if(targetAddin && targetAddin.self.elementType === 'addin_row'){
        dropTarget = targetAddin.obj.activeCol || '1,1';
      }else if(targetAddin && targetAddin.self.elementType === 'addin_colRows'){
        dropTarget = targetAddin.obj.activeRow || '1,1';
      }else if(targetAddin && targetAddin.self.elementType === 'addin_Tab'){
        dropTarget = targetAddin.obj.args.tabs[targetAddin.obj.tabIndex].dropName  || 0;
      }
      if(targetAddin && ['addin_row', 'addin_colRows', 'addin_col', 'addin_Tab', 'addin_GroupBox', 'addin_DragItem'].includes(targetAddin.self.elementType)){
        inLayout = true;
      }
      let addin;
      if(item.nameProps){
        //超级控件
        addin = {
          self: {
            elementType: `addin_${item.nameProps}`,
            properties: {
              ...item.argsProps,
              id: this.generateID(item.nameProps),
              collectId: item.oidProps,
              ...this.basicArgs,
            },
            dropTarget: dropTarget,
            uuid: uuid(),
                  DWFADDINARGSVERSION: DWFADDINARGSVERSION//addinargs版本，用来控制不同版本控件功能
          },
          elements: [],
        }
        delete addin.self.properties.defaultMultiAddin;
      } else if (item.groupOid){
        //小组件控件
        addin = {
          self: {
            elementType: `addin_FormEngine`,
            properties: {
              bindTargetClass: "Component&e",
              viewName: item.viewName,
              groupDisplayName: item.groupDisplayName,
              groupOid: item.groupOid,
              componentOid: item.oid,
              componentDisplayName: item.displayName,
            },
            dropTarget: dropTarget,
            uuid: uuid(),
                  DWFADDINARGSVERSION: DWFADDINARGSVERSION//addinargs版本，用来控制不同版本控件功能
          },
          elements: [],
        }
      } else if (item.ISASSEMBLE) {
        //sdk控件
        addin = {
          self: {
            elementType: `addin_AssembleAddin`,
            properties: {
              _ASSEMBLECONFIG: item
            },
            dropTarget: dropTarget,
            uuid: uuid(),
                  DWFADDINARGSVERSION: DWFADDINARGSVERSION//addinargs版本，用来控制不同版本控件功能
          },
          elements: [],
        }
      } else{
        addin = {
          self: {
            elementType: `addin_${item.name}`,
            properties: {},
            dropTarget: dropTarget,
            uuid: uuid(),
                  DWFADDINARGSVERSION: DWFADDINARGSVERSION//addinargs版本，用来控制不同版本控件功能
          },
          elements: [],
        }
      }
      let element = {
        name: addin.self.elementType.replace('addin_', ''),
        uuid: addin.self.uuid,
        addin: addin,
      }
      if (this.activeUUID && inLayout) {
        this.insertJsonDataByUUID(this.jsonData.data, this.activeUUID, addin);
      } else {
        this.jsonData.data.elements.push(addin);
      }
      this.snapShotHistory();
    },

    /**
     *@description通过parentUUID添加addin
     *@params
     *@date 2020/9/1
     *@return
     */
    insertJsonDataByUUID(element, parentUUID, addin) {
      if (!element) return null;
      if ("self" in element) {
        if (element.self.uuid == parentUUID) {
          return element;
        }
      }
      for (var i = 0; i < element.elements.length; i++) {
        var jsonData = this.insertJsonDataByUUID(element.elements[i], parentUUID, addin);
        if (jsonData && addin) {
          jsonData.elements.push(addin);
          return null;
        }
      }
      return null;
    },

    /**
     *@description通过parentUUID和UUID移除addin
     *@params
     *@date 2020/9/1
     *@return
     */
    removeJsonDataByUUID(element, parentUUID, UUID) {
      if (!element) return null;
      if ("self" in element) {
        if (element.self.uuid == UUID) {
          return element;
        }
      }
      for (var i = 0; i < element.elements.length; i++) {
        var jsonData = this.removeJsonDataByUUID(element.elements[i], parentUUID, UUID);
        if (jsonData && !parentUUID) {
          element.elements.splice(i, 1);
          return null;
        } else if (jsonData && element.self && element.self.uuid === parentUUID) {
          element.elements.splice(i, 1);
          return null;
        }
      }
      return null;
    },

    //重载拖拽池、块内部uuid关系
    reloadDragLayout(jsonData) {
      if (jsonData.self.elementType === "addin_DragLayout") {
        if (jsonData.elements && jsonData.elements.length) {
          jsonData.elements.forEach((element, index) => {
            element.self.properties.parentLayout = element.self.properties.parentUUID = jsonData.self.uuid;
            jsonData.self.properties.layout[index].containerUUID = element.self.uuid;
          });
        }
      } else {
        if (jsonData.elements && jsonData.elements.length) {
          jsonData.elements.forEach(element => {
            this.reloadDragLayout(element);
          });
        }
      }
    },

    //增加拖拽池layout的参数，增加拖拽块
    reloadDragItem(item, layout) {
      if (item.self.elementType === "addin_DragItem") {
        layout.obj.addItem(null, item.self.uuid);
      }
    },

    // 检查行列是否溢出
    checkRow(update, uuid) {
      if (!uuid) {
        this.checkResult.result = true;
        return;
      }
      var node = this.jsonUUID[uuid];
      for (var i = 0; i < node.elements.length; i++) {
        if (update.indexOf(node.elements[i].self.dropTarget) > -1) {
          this.checkResult.result = false;
          this.$Message.error("请先移除溢出单元格中的控件");
          return;
        }
      }
      this.checkResult.result = true;
      return;
    },

    commentAddin(addin) {
      if (!addin) return
      let editBox = addin.getEditBoxComponent();
      editBox.goTab('widgetAnnotation');
    },

    // 显示属性编辑框
    showEditBox(type, addin) {
      if (!addin) return
      // if (this.targetItem) {
      //   this.targetItem.t_edit = false;
      //   this.targetItem.classList.remove('selected');
      //   //移除一行多列中的选中样式
      //   if(document.querySelectorAll('.selected.addin-row') && document.querySelectorAll('.selected.addin-row').length !== 0){
      //     document.querySelectorAll('.selected.addin-row').forEach(item => {
      //       item.classList.remove('selected');
      //     })
      //   };
      //   if(document.querySelectorAll('.selected.addinC') && document.querySelectorAll('.selected.addinC').length !== 0){
      //     document.querySelectorAll('.selected.addinC').forEach(item => {
      //       item.classList.remove('selected');
      //     })
      //   };
      //   //移除一列多行中的选中样式
      //   if(document.querySelectorAll('.selected.addin-col') && document.querySelectorAll('.selected.addin-col').length !== 0){
      //     document.querySelectorAll('.selected.addin-col').forEach(item => {
      //       item.classList.remove('selected');
      //     })
      //   };
      //   if(document.querySelectorAll('.selected.addin-col-row') && document.querySelectorAll('.selected.addin-col-row').length !== 0){
      //     document.querySelectorAll('.selected.addin-col-row').forEach(item => {
      //       item.classList.remove('selected');
      //     })
      //   };
      // }
      var editBox = addin.getEditBox(type);
      var nodes = this.editBox.childNodes;
      for (var i = nodes.length - 1; i >= 0; i--) {
        this.editBox.removeChild(nodes[i]);
      }
      this.editBox.appendChild(editBox);
      // this.targetItem = el;
      // this.targetItem.classList.add('selected');
      // this.targetItem.t_edit = true;
      this.$emit("showEditBox", addin);
      // let visualCharts = [
      //   "addin_EchartBar",
      //   "addin_BarChart",
      //   "addin_LineChart",
      //   "addin_ScatterChart",
      //   "addin_PieChart",
      //   "addin_MapChart",
      //   "addin_MapCityChart",
      //   "addin_ParallelChart",
      //   "addin_CalendarChart",
      //   "addin_GaugeChart",
      //   "addin_CheckBox",
      //   "addin_RadioButton",
      // ];
      // let timeseries = [
      //   "addin_TimeSeriesCharts",
      //   "addin_TimeSeriesBoard"
      // ];
      // for (var i in this.jsonUUID) {
      //   if ((visualCharts.indexOf(this.jsonUUID[i].self.elementType) >= 0) && this.jsonUUID[i].obj && this.jsonUUID[i].obj.resizeChart) {
      //     this.jsonUUID[i].obj.resizeChart();
      //   }
      //   if ((timeseries.indexOf(this.jsonUUID[i].self.elementType) >= 0) && this.jsonUUID[i].obj && this.jsonUUID[i].obj.resizeChart) {
      //     this.jsonUUID[i].obj.resizeChart();
      //   }
      // }
    },

    /**
     *@description
     *@params
     *@date 2020/9/7
     *@return
     */
    layoutSelfDrag() {
      this.layoutSelfDragMode = true;
    },

    //装配操作边框
    generateActionWidget(el, addin, uuid) {
      let that = this;
      if (this.commentWidget) {
        this.commentWidget.$el.parentNode.removeChild(this.commentWidget.$el);
        this.commentWidget.$destroy();
      }
      if (this.actionWidget) {
        this.actionWidget.$el.parentNode.removeChild(this.actionWidget.$el);
        this.actionWidget.$destroy();
      }
      let commentWidget = Vue.extend(require("@/component/addin_comment_widget").default);
      let actionWidget = Vue.extend(require("@/component/addin_action_widget").default);
      this.commentWidget = new commentWidget({
        propsData: {
          active: !!this.widgetAnnotation[uuid]
        },
        methods: {
          commentAddin() {
            return that.commentAddinEditbox(addin);
          },
        }
      });
      this.actionWidget = new actionWidget({
        propsData: {
          addinName: 'a'
        },
        methods: {
          copyAddin() {
            return that.copyAddin();
          },
          deleteAddin() {
            if (addin && addin.name == 'DragItem') {
              return addin.deleteItem()
            } else {
              return that.delete();
            }
          }
        }
      });
      el.appendChild(this.actionWidget.$mount().$el);
      el.appendChild(this.commentWidget.$mount().$el);
    },

    //生成新版id
    generateID(type) {
      if (this.generateId[type]) {
        this.generateId[type] = parseInt(this.generateId[type]) + 1;
      } else {
        this.generateId[type] = 1
      }
      return `${type}${this.generateId[type].toString()}`;
    },

    setDragItem(name) {
      this.dragItem = name;
      // if (name === 'DragItem') {
      //   this.ghostbox = document.createElement('li');
      //   this.ghostbox.style.display = 'none';
      //   this.ghostbox.setAttribute('ghost', true);
      //   this.ghostbox.setAttribute('ghost-type', 'placeholder');
      // } else if (name === null) {
      //   this.ghostbox = null;
      // } else {
      //   this.ghostbox = document.createElement('li');
      //   this.ghostbox.classList.add('ghost', 'ghostbox');
      //   this.ghostbox.setAttribute('ghost', true);
      //   this.ghostbox.setAttribute('ghost-type', 'placeholder');
      //
      // this.ghostbox.ondragstart = this.onDragStart;
      // this.ghostbox.ondragend = this.onDragEnd;
      // this.ghostbox.ondragenter = this.onDragEnter;
      // this.ghostbox.ondragover = this.onDragOver;
      // this.ghostbox.ondragleave = this.onDragLeave;
      // this.ghostbox.ondrop = this.onDrop;
      // }
    },

    setDragArgs(args) {
      this.dragArgs = args;
    },

    getDragItem() {
      return this.dragItem;
    },

    // 拖拽开始事件,存储拖拽的控件
    onDragStart(event) {
      event.stopPropagation();
      //this.dragItem = event.currentTarget.getAttribute("addinName");
      this.dragItem = event.currentTarget;
      if (this.dragItem.getAttribute('addinname') === 'DragItem') {

      } else {
        this.ghostbox = this.dragItem;
        this.ghostbox.setAttribute('ghostbox', true);
        this.ghostbox.setAttribute('ghost-type', 'addin');
      }
      this.dragFa = event.currentTarget.parentNode;
      this.dropFlag = 0;
      this.jsonFa = this.locateElement(event.currentTarget.parentNode);
      this.jsonSon = this.locateElement(event.currentTarget);
    },

    //拖拽进行中
    onDrag(event) {
      event.stopPropagation();
      event.preventDefault()
    },

    // 拖拽结束事件,移除被拖拽的控件
    // onDragEnd(event) {
    //   this.snapShotCount >= 10 ? "" : this.snapShotCount++;
    //   console.log(`onend`)
    //   event.stopPropagation();
    //   //拖动冻结拖拽块到表单区,拖拽块目前支持点击X和删除按钮删除
    //   if (event.currentTarget.getAttribute('addinname') === 'DragItem') {
    //     return;
    //   }
    //   this.dragItem = null;
    //   this.$nextTick(() => {
    //     if (this.ghostbox) {
    //       this.ghostbox.classList.remove('ghost', 'ghostbox');
    //       this.ghostbox.setAttribute('ghostbox', false);
    //       this.ghostbox.removeAttribute('ghostbox');
    //       this.ghostbox.removeAttribute('ghost-type');
    //       this.removeGhostBox();
    //       this.ghostbox = null;
    //     }
    //   })
    //   if (this.dropFlag == 1) return;
    //   //控件移出表单区
    //   if (event.path && event.path.length === 1) {
    //     for (var i = 0; i < this.jsonFa.elements.length; i++) {
    //       if (this.jsonFa.elements[i].self.uuid == this.jsonSon.self.uuid) {
    //         console.log(event.currentTarget.getAttribute('addinname'))
    //         console.log(`event`)
    //         console.log(event)
    //         console.log(`event.currentTarget`)
    //         console.log(event.currentTarget)
    //         console.log(`this.jsonFa.self`)
    //         console.log(this.jsonFa.self)
    //         console.log(`this.jsonSon.self`)
    //         console.log(this.jsonSon.self)
    //         console.log(`onend------------------删了！！！！！！！`)
    //         this.jsonFa.elements.splice(i, 1);
    //         var item = {
    //           type: "pull",
    //           target: this.dragFa,
    //           el: event.currentTarget,
    //           jsonSon: this.jsonSon,
    //           jsonFa: this.jsonFa,
    //           basicArgs: _.cloneDeep(this.basicArgs),
    //         };
    //         if (this.dataSnapshot.length === 10) {
    //           this.dataSnapshot.shift();
    //           this.dataSnapshot.push([item]);
    //         } else {
    //           this.dataSnapshot[this.snapShotCount - 1] = [item]
    //         }
    //         console.log(`this.dropFlag${this.dropFlag}`)
    //         console.log(`event.currentTarget && event.currentTarget.parentNode${event.currentTarget && event.currentTarget.parentNode}`)
    //         if (this.dropFlag == 2) return;
    //         if (event.currentTarget && event.currentTarget.parentNode) event.currentTarget.parentNode.removeChild(event.currentTarget);
    //         var nodes = this.editBox.childNodes;
    //         for (var i = nodes.length - 1; i >= 0; i--) {
    //           this.editBox.removeChild(nodes[i]);
    //         }
    //         if (this.targetItem) {
    //           this.targetItem.t_edit = false;
    //           this.targetItem.classList.remove("selected");
    //         }
    //         this.targetItem = null;
    //         // if (this.jsonSon.self.uuid in this.jsonUUID) delete this.jsonUUID[this.jsonSon.self.uuid];
    //         break;
    //       }
    //     }
    //   }
    //   // if (this.dataSnapshot.length < this.snapShotCount) this.dataSnapshot.push([]);
    //
    // },

    // 前进后退时模拟拖拽结束事件
    // _onDragEnd(jsonFa, jsonSon, dropFlag, target, el) {
    //   if (dropFlag == 1) return;
    //   for (var i = 0; i < jsonFa.elements.length; i++) {
    //     if (jsonFa.elements[i].self.uuid == jsonSon.self.uuid) {
    //       jsonFa.elements.splice(i, 1);
    //       // if (jsonSon.self.uuid in this.jsonUUID) delete this.jsonUUID[jsonSon.self.uuid];
    //       break;
    //     }
    //   }
    //   if (dropFlag == 2) return;
    //   if (jsonSon.self.elementType === 'addin_DragItem') {
    //     //后退删除拖拽块
    //     jsonFa.obj.deleteItem(jsonSon.self.uuid);
    //   } else if (jsonFa.self && jsonFa.self.elementType === 'addin_DragItem') {
    //     //后退删除拖拽块中dom
    //     target.className.indexOf('drag-item-container') !== -1 ? target.removeChild(el) : target.querySelector('.drag-item-container').removeChild(el);
    //   } else {
    //     target.removeChild(el);
    //   }
    //   var nodes = this.editBox.childNodes;
    //   for (var i = nodes.length - 1; i >= 0; i--) {
    //     this.editBox.removeChild(nodes[i]);
    //   }
    //   if (this.targetItem) {
    //     this.targetItem.t_edit = false;
    //     this.targetItem.classList.remove("selected");
    //   }
    //   this.targetItem = null;
    // },

    onDragOver(event) {
      // if (!this.ghostbox) {
      //   return
      // }
      // this.ghostbox.classList.add('ghost', 'ghostbox');
      // let targetNode = event.target;
      //
      // while (targetNode && targetNode.getAttribute) {
      //   try {
      //     if (targetNode == this.ghostbox) break;
      //     // if(Array.prototype.indexOf.call(targetNode.classList, 'addinR') !== -1) break;
      //     if (Array.prototype.indexOf.call(targetNode.classList, 'addin-dragItem') !== -1) break;
      //     // if(Array.prototype.indexOf.call(targetNode.classList, 'addin-row') !== -1) break;
      //     if (['global', 'layout'].indexOf(targetNode.getAttribute('addin')) !== -1) {
      //       console.log(2)
      //       if (Array.prototype.indexOf.call(targetNode.childNodes, this.ghostbox) === -1) {
      //         targetNode.appendChild(this.ghostbox);
      //       }
      //       break;
      //     }
      //     if (Array.prototype.indexOf.call(targetNode.classList, 'addin') !== -1 || Array.prototype.indexOf.call(targetNode.classList, 'addinR') !== -1) {
      //       this.insertGhostBox(targetNode);
      //       break;
      //     }
      //     targetNode = targetNode.parentNode;
      //   } catch (e) {
      //     console.log(`onDragOver方法失效：${e}`)
      //     this.removeGhostBox();
      //     break;
      //   }
      // }
      // event.preventDefault();
      // event.stopPropagation();
    },

    onDragEnter(event) {
      event.preventDefault();
      event.stopPropagation();
    },

    onDragLeave(event) {
      //从占位区域移进移出不作操作
      console.log(`onDragLeave`)
      //拖拽到占位上不会闪烁
      if ((event.path[0] && event.path[0].getAttribute('ghost') == 'true') || (event.fromElement && event.fromElement.getAttribute('ghost') == 'true')) {
        return;
      }
      let parent = this.getParentNodes(event.toElement, this.$refs.form);
      if (parent.length === 0) {
        this.removeGhostBox(this.$refs.form);
      }
    },


    getParentNodes(el, parentSelector) {
      if (parentSelector === undefined) {
        parentSelector = document;
      }

      let parents = [];
      let p = el.parentNode;

      while (p !== null) {
        let o = p;
        p === parentSelector ? parents.push(o) : '';
        p = o.parentNode;
      }
      return parents;
    },

    removeGhostBox(targetNode) {
      if (this.ghostbox) {
        console.log(`onDragLeave-remove`)
        this.ghostbox.parentNode && this.ghostbox.parentNode.removeChild(this.ghostbox)
      }
    },

    insertGhostBox(targetNode) {
      try {
        if (event.offsetY <= targetNode.offsetHeight / 2) {
          if (targetNode.nextSibling && targetNode.nextSibling.getAttribute('ghostbox')) {
            targetNode.parentNode.removeChild(this.ghostbox);
            console.log(21)
          }
          if (!(targetNode.previousSibling && targetNode.previousSibling.getAttribute('ghostbox'))) {
            targetNode.parentNode.insertBefore(this.ghostbox, targetNode);
            console.log(22)
          }
        } else if (event.offsetY > targetNode.offsetHeight / 2) {
          //3象限
          if (targetNode.previousSibling && targetNode.previousSibling.getAttribute('ghostbox')) {
            targetNode.parentNode.removeChild(this.ghostbox);
            console.log(31)
          }
          if (!(targetNode.nextSibling && targetNode.nextSibling.getAttribute('ghostbox'))) {
            targetNode.parentNode.insertBefore(this.ghostbox, targetNode.nextSibling);
            console.log(32)
          }
        }
      } catch (e) {
        console.log(`insertGhostBox方法出错:${e}`)
        this.removeGhostBox();
      }
    },


    // 双击事件,默认拖拽
    // onDbClick(name) {
    //   var target = this.targetItem ? this.targetItem : this.$refs.form;
    //   var _target = target;
    //   var _name = target.getAttribute("addinName");
    //   while (!_name) {
    //     target = target.parentNode;
    //     _name = target.getAttribute("addinName");
    //   }
    //   if (name === "DragItem") {
    //     this.$Message.error('请将拖拽块拖入拖拽池中');
    //     return;
    //   }
    //   var allow = this.addinItem[_name];
    //   if (!allow || (allow.length > 0 && allow.indexOf(name) == -1)) return;
    //   let that = this;
    //   var addin = this.getAddin(name);
    //   var dropTarget = null;
    //   if (_name == "GlobalForm") {
    //     dropTarget = "0"
    //   } else if (_target.getAttribute("dropTarget")) {
    //     dropTarget = _target.getAttribute("dropTarget");
    //     target = _target;
    //   } else {
    //     var doms = target.querySelectorAll("[dropTarget]");
    //     target = null;
    //     for (var i = 0; i < doms.length; i++) {
    //       if (doms[i].children.length == 0) {
    //         target = doms[i];
    //         break;
    //       }
    //     }
    //     if (!target) return;
    //     dropTarget = target.getAttribute("dropTarget");
    //     if (!dropTarget || target.children.length > 0) return;
    //   }
    //
    //
    //   this.addinItem[name] = addin.getAllow(dropTarget);
    //
    //   addin.$on("showEditBox", this.showEditBox);
    //   addin.$on("generateActionWidget", this.generateActionWidget);
    //   addin.$on("hideEditBox", this.hide);
    //   addin.$on("checkRow", this.checkRow);
    //   let args = {};
    //   if (this.dragArgs) {
    //     args = this.dragArgs;
    //     // args.id = uuid();
    //   }
    //   //if (name == "FormEngine") addin.initData({ entities: this.entities });
    //   var el = addin.setDisplayType(0).setArgs(args).$mount().$el;
    //   el.classList.add("addin");
    //   el.classList.add(this.deviceType);
    //   if (name in this.addins.layout) {
    //     el.classList.add("addin-layout");
    //   }
    //   var _id = uuid();
    //   el.onclick = (e) => {
    //     that.showEditBox(el, null, addin);
    //     this.generateActionWidget(el, addin, _id);
    //     e.stopPropagation();
    //   };
    //   el.setAttribute("UUID", _id);
    //   let m_args = addin.getArgs();
    //   m_args.uuid = _id;
    //   if (!m_args.id) m_args.id = this.generateID(name);
    //   el.setAttribute("draggable", "true");
    //   el.ondragstart = this.onDragStart;
    //   el.ondragend = this.onDragEnd;
    //   el.ondragenter = this.onDragEnter;
    //   el.ondragover = this.onDragOver;
    //   el.ondrop = this.onDrop;
    //   this.jsonSon = {
    //     self: {
    //       elementType: "addin_" + name,
    //       properties: addin.getArgs(),
    //       dropTarget: dropTarget,
    //       uuid: _id
    //     },
    //     elements: [],
    //     obj: addin
    //   }
    //   this.jsonUUID[_id] = this.jsonSon;
    //
    //   var node = this.locateElement(target);
    //   // var parent = target.getAttribute("dropTarget") == node.self.dropTarget ? [parentDom] : parentDom.querySelectorAll('[dropTarget="' + element.self.dropTarget + '"]')
    //   // if (parent.length == 0) parent = parentDom.querySelector('[dropTarget="0"]');
    //   if (dropTarget == "dragItem") {
    //     // 若判断无法插入对应的方块 则停止记录控件数据
    //     addin ? _target = node.obj.fillAddin(event, addin) : _target = node.obj.fillAddin(event, el);
    //     if (!_target) return;
    //   } else {
    //     target.appendChild(el);
    //   }
    //   node.elements.push(this.jsonSon);
    //   // 继承属性
    //   let _args = {};
    //   for (var i in this.basicArgs) {
    //     if (i in this.jsonSon.self.properties) {
    //       _args[i] = this.basicArgs[i] || this.jsonSon.self.properties[i];
    //     }
    //   }
    //   this.jsonSon.obj.setArgs(_args);
    //   if (node.obj && node.obj.getInherit) this.jsonSon.obj.setArgs(node.obj.getInherit(dropTarget));
    //
    //   this.snapShotCount >= 10 ? "" : this.snapShotCount++;
    //   if (this.snapShotCount < this.dataSnapshot.length) {
    //     this.dataSnapshot = this.dataSnapshot.slice(0, this.snapShotCount);
    //   }
    //   this.updateMargin();
    //   var item = {
    //     type: "push",
    //     jsonFa: node,
    //     jsonSon: this.jsonSon,
    //     target: target,
    //     el: el,
    //     basicArgs: _.cloneDeep(this.basicArgs),
    //   };
    //   if (this.dataSnapshot.length === 10) {
    //     this.dataSnapshot.shift();
    //     this.dataSnapshot.push([item]);
    //   } else {
    //     this.dataSnapshot[this.snapShotCount - 1] = [item]
    //   }
    // },

    //
    //画布区点击
    renderAreaClick(e){
      if(e.target.id == 'GlobalFormDragArea' || e.target.id == 'GlobalForm'){
        this.hide();
      }
    },

    // 拖拽事件,在目标位置生成控件
    onDrop(event) {
     if (this.dragItem === "DragItem") {
      this.$Message.error('请将拖拽块拖入拖拽池中');
    }
      // var that = this;
      // var el = this.dragItem;
      // var isFirstDrop = typeof el == "string";//是否第一次拖入表单
      // var elementType = typeof el == "string" ? el : el.getAttribute("addinName");
      //
      // var target = event.target;
      // var dropTarget = target.getAttribute("dropTarget");
      // while (!dropTarget || (target.getAttribute("addinName") && this.allowDropSpecial.indexOf(target.getAttribute("addinName")) !== -1)) {
      //   target = target.parentNode;
      //   dropTarget = target.getAttribute("dropTarget");
      // }
      // //拖动冻结拖拽块到表单区
      // if (typeof this.dragItem !== 'string' && this.dragItem.getAttribute('addinname') === 'DragItem') {
      //   return;
      // }
      // if (dropTarget == "dragLayout") {
      //   // Deal with new layout: DragLayout
      //   var dragPool = this.locateElement(target);
      //   if (this.dragItem == "DragItem") {
      //     // To add an item in dragLayout
      //     // dragPool.obj.addItem(event);
      //     // return;
      //   } else {
      //     /**
      //      * TODO: Take addin into DragItem, within code below
      //      * 1. Calculate which item mouse drop on, -1 for no suitable item
      //      * 2. Get the addin appended on DragItem
      //      * 3. Log addin on global varibles
      //      */
      //     // var dropItemId = dragPool.obj.getAddinFillItem(event);
      //     // if (dropItemId<0) return;
      //   }
      // }
      // var _target = target;
      // var name = target.getAttribute("addinName");
      // while (!name || (name && this.allowDropSpecial.indexOf(name) !== -1)) {
      //   target = target.parentNode;
      //   name = target.getAttribute("addinName");
      // }
      // var allow = this.addinItem[name];
      // if (!allow || (allow.length > 0 && allow.indexOf(elementType) == -1)) {
      //   this.dropFlag = 1;
      //   if (this.ghostbox) {
      //     this.ghostbox.classList.remove('ghost', 'ghostbox');
      //     this.ghostbox.setAttribute('ghostbox', false);
      //     this.ghostbox.removeAttribute('ghostbox');
      //     this.ghostbox.removeAttribute('ghost-type');
      //     this.removeGhostBox();
      //     this.ghostbox = null;
      //   }
      //   return;
      // }
      //
      //
      // if (typeof this.dragItem == 'string' && this.dragItem !== "DragItem") {
      //   var addin = this.getAddin(this.dragItem);
      //   this.addinItem[this.dragItem] = addin.getAllow(dropTarget);
      //   addin.$on("showEditBox", this.showEditBox);
      //   addin.$on("generateActionWidget", this.generateActionWidget);
      //   addin.$on("hideEditBox", this.hide);
      //   addin.$on("checkRow", this.checkRow);
      //   // if (this.dragItem == "FormEngine") addin.initData({ entities: this.entities });
      //   let args = {};
      //   if (this.dragArgs) {
      //     args = this.dragArgs;
      //     // args.id = uuid();
      //   }
      //   el = addin.setDisplayType(0).setArgs(args).$mount().$el;
      //   el.classList.add("addin");
      //   el.classList.add(this.deviceType);
      //   if (this.dragItem in this.addins.layout) {
      //     el.classList.add("addin-layout");
      //   }
      //   var _id = uuid();
      //   el.onclick = (e) => {
      //     that.showEditBox(el, null, addin);
      //     this.generateActionWidget(el, addin, _id);
      //     // that.targetItem = el;
      //     // var nodes = that.editBox.childNodes;
      //     // for (var i = nodes.length-1;i >= 0;i--) {
      //     //     that.editBox.removeChild(nodes[i]);
      //     // }
      //     // that.editBox.appendChild(addin.getEditBox());
      //     // this.$emit("showEditBox");
      //     e.stopPropagation();
      //   };
      //   el.setAttribute("UUID", _id);
      //   let m_args = addin.getArgs();
      //   m_args.uuid = _id;
      //   if (!m_args.id) m_args.id = this.generateID(elementType);
      //   el.setAttribute("draggable", "true");
      //   el.ondragstart = this.onDragStart;
      //   el.ondragend = this.onDragEnd;
      //   el.ondragenter = this.onDragEnter;
      //   el.ondragover = this.onDragOver;
      //   el.ondrop = this.onDrop;
      //   // el.onDragLeave = this.onDragLeave;
      //   this.jsonSon = {
      //     self: {
      //       elementType: "addin_" + elementType,
      //       properties: addin.getArgs(),
      //       dropTarget: dropTarget,
      //       uuid: _id
      //     },
      //     elements: [],
      //     obj: addin
      //   }
      //   this.jsonUUID[_id] = this.jsonSon;
      // } else if (this.dragItem === "DragItem") {
      //
      //   var addin = this.getAddin(this.dragItem);
      //   addin.$on("showEditBox", this.showEditBox);
      //   addin.$on("generateActionWidget", this.generateActionWidget);
      //   addin.$on("hideEditBox", this.hide);
      //   addin.$on("checkRow", this.checkRow);
      //   addin.$on("DeleteItem", this.delete);
      //   this.addinItem[this.dragItem] = addin.getAllow(dropTarget);
      //   let args = {};
      //   if (this.dragArgs) args = this.dragArgs;
      //   el = addin.setDisplayType(0).setArgs(args).$mount().$el;
      //   el.classList.add("addin");
      //   el.classList.add(this.deviceType);
      //   if (this.dragItem in this.addins.layout) {
      //     el.classList.add("addin-layout");
      //   }
      //   var _id = uuid();
      //   el.onclick = (e) => {
      //     that.showEditBox(el, null, addin);
      //     this.generateActionWidget(el, addin, _id);
      //     e.stopPropagation();
      //   };
      //   el.setAttribute("UUID", _id);
      //   let m_args = addin.getArgs();
      //   m_args.uuid = _id;
      //   if (!m_args.id) m_args.id = this.generateID(elementType);
      //   this.jsonSon = {
      //     self: {
      //       elementType: "addin_" + elementType,
      //       properties: addin.getArgs(),
      //       // 如果是拖拽布局控件(dropTarget==dragLayout) 则存储item.i 否则按原代码存储dropTarget
      //       dropTarget: dropTarget,
      //       uuid: _id
      //     },
      //     elements: [],
      //     obj: addin
      //   };
      //   this.jsonUUID[_id] = this.jsonSon;
      // } else {
      //   // 考虑拖住布局的情况
      //   this.jsonSon.self.dropTarget = dropTarget == "dragLayout" ? dropItemId : dropTarget;
      // }
      // var node = this.locateElement(target);
      // var replaceFlag = false;
      // var replacePrevElementUUID;
      // // Initial dragitem class style如果有dragitem设置的样式，清空
      // if (el.style.position && el.style.position === 'absolute') {
      //   el.style.position = 'initial';
      //   el.style.left = 'initial';
      //   el.style.top = 'initial';
      // }
      // if (this.dragItem === "DragItem" && dropTarget === "dragLayout") {
      //   _target = dragPool.obj.$el;
      //   dragPool.obj.addItem(event, addin);
      // } else if (this.dragItem === "DragItem" && dropTarget !== "dragLayout") {
      //   this.$Message.error('请将拖拽块拖入拖拽池中');
      //   return;
      // } else if (this.dragItem !== "DragItem" && dropTarget == "dragLayout") {
      //   this.$Message.error('拖拽池中只能放入拖拽块');
      //   if (this.ghostbox) {
      //     this.ghostbox.classList.remove('ghost', 'ghostbox');
      //     this.ghostbox.setAttribute('ghostbox', false);
      //     this.ghostbox.removeAttribute('ghostbox');
      //     this.ghostbox.removeAttribute('ghost-type');
      //     this.removeGhostBox();
      //     this.ghostbox = null;
      //   }
      //   return;
      // } else if (dropTarget == "dragItem") {
      //   // 若判断无法插入对应的方块 则停止记录控件数据
      //   try {
      //     if (this.ghostbox) {
      //       this.ghostbox.classList.remove('ghost', 'ghostbox');
      //       this.ghostbox.setAttribute('ghostbox', false);
      //       this.ghostbox.removeAttribute('ghostbox');
      //       if (this.ghostbox.previousSibling) {
      //         replacePrevElementUUID = this.ghostbox.previousSibling.getAttribute('uuid');
      //       }
      //       addin ? _target = node.obj.fillAddin(event, addin, this.ghostbox) : _target = node.obj.fillAddin(event, el, this.ghostbox);
      //       this.ghostbox.removeAttribute('ghost-type');
      //       this.ghostbox = null;
      //       replaceFlag = true;
      //       if (!_target) return;
      //     }
      //   } catch (e) {
      //     console.log(`拖拽块替换占位元素失效${e}`)
      //   }
      // } else {
      //   try {
      //     if (this.ghostbox) {
      //       this.ghostbox.classList.remove('ghost', 'ghostbox');
      //       this.ghostbox.setAttribute('ghostbox', false);
      //       this.ghostbox.removeAttribute('ghostbox');
      //       console.log(`this.ghostbox.previousSibling---------------`)
      //       console.log(this.ghostbox.previousSibling)
      //       console.log(`this.ghostbox.previousSibling---------------`)
      //       if (this.ghostbox.previousSibling) {
      //         replacePrevElementUUID = this.ghostbox.previousSibling.getAttribute('uuid');
      //       }
      //       //行内特殊判断
      //       // if(Array.prototype.indexOf.call(this.ghostbox.parentNode.classList, "addinC") !== -1){
      //       //
      //       // }
      //       if (this.ghostbox.getAttribute('ghost-type') === 'placeholder') {
      //         this.ghostbox.parentNode.replaceChild(el, this.ghostbox);
      //       }
      //       this.ghostbox.removeAttribute('ghost-type');
      //       this.ghostbox = null;
      //       replaceFlag = true;
      //     }
      //   } catch (e) {
      //     console.log(`替换占位元素失效${e}`)
      //   }
      //   // else{
      //   //   _target.appendChild(el);
      //   // }
      // }
      //
      // this.dropFlag = 2;
      // if (replaceFlag) {
      //   let replaceIndex = 0;
      //   this.removeJsonDataByUUID(this.jsonData.data, el.getAttribute('uuid'));
      //   setTimeout(() => {
      //     if (replacePrevElementUUID) {
      //       replaceIndex = node.elements.findIndex(item => item.self.uuid === replacePrevElementUUID) + 1
      //     }
      //     console.log(`-----------------------`)
      //     console.log(`-----------------------replaceIndex${replaceIndex}`)
      //     console.log(this.jsonSon)
      //     console.log(node.elements)
      //     this.$nextTick(() => {
      //       console.log(node.elements.length)
      //     })
      //     console.log(`-----------------------`)
      //     node.elements.splice(replaceIndex, 0, this.jsonSon);
      //   }, 10)
      // } else {
      //   node.elements.push(this.jsonSon)
      // }
      // // 继承属性
      // let _args = {};
      // if (isFirstDrop) {
      //   for (var i in this.basicArgs) {
      //     if (i in this.jsonSon.self.properties) {
      //       _args[i] = this.basicArgs[i] || this.jsonSon.self.properties[i];
      //     }
      //   }
      // } else {
      //   for (var i in this.jsonSon.self.properties) {
      //     if (i in this.basicArgs) {
      //       _args[i] = this.jsonSon.self.properties[i] || this.basicArgs[i];
      //     }
      //   }
      // }
      // this.jsonSon.obj.setArgs(_args);
      // if (node.obj && node.obj.getInherit) this.jsonSon.obj.setArgs(node.obj.getInherit(dropTarget));
      // this.snapShotCount >= 10 ? "" : this.snapShotCount++;
      // if (this.snapShotCount < this.dataSnapshot.length) {
      //   this.dataSnapshot = this.dataSnapshot.slice(0, this.snapShotCount);
      // }
      // this.updateMargin();
      //
      // var item = {
      //   type: "push",
      //   jsonFa: node,
      //   jsonSon: this.jsonSon,
      //   target: _target,
      //   el: el,
      //   basicArgs: _.cloneDeep(this.basicArgs),
      // };
      // if (this.dataSnapshot.length === 10) {
      //   this.dataSnapshot.shift();
      //   this.dataSnapshot.push([item]);
      // } else {
      //   this.dataSnapshot[this.snapShotCount - 1] = [item]
      // }
    },

    // 前进后退模拟拖拽事件
    _onDrop(target, el, jsonFa, jsonSon) {
      if (jsonSon.self && jsonSon.self.elementType === 'addin_DragItem') {
        //还原拖拽块
        let dragPool = this.locateElement(target);
        dragPool.obj.addItem('redo');
        // dragPool.obj.addItem(event, addin);
      } else if (jsonFa.self && jsonFa.self.elementType === 'addin_DragItem') {
        //还原拖拽块内元素
        target.className.indexOf('drag-item-container') !== -1 ? target.appendChild(el) : target.querySelector('.drag-item-container').appendChild(el);
      } else {
        target.appendChild(el);
      }
      jsonFa.elements.push(jsonSon);
      let _args = {};
      for (var i in this.basicArgs) {
        if (i in jsonSon.self.properties) {
          _args[i] = this.basicArgs[i];
        }
      }
      this.jsonSon.obj.setArgs(_args);
      if (jsonFa.obj && jsonFa.obj.getInherit) jsonSon.obj.setArgs(jsonFa.obj.getInherit(jsonSon.self.dropTarget));
    },

    undo() {
      // if (this.undoing || this.redoing) return;
      if (this.snapShotCount < 2) return false;
      // this.undoing = true;
      this.reloadFormRender = false;
      // this.snapShotCount--;
      // var flag = 0;
      // if (this.dataSnapshot[this.snapShotCount].length == 2) flag = 2;
      // for (var i = this.dataSnapshot[this.snapShotCount].length - 1; i >= 0; i--) {
      //   var item = this.dataSnapshot[this.snapShotCount][i];
      //   if (item.type == "init") {
      //     for (var i = this.$refs.form.children.length; i > 0; i--) {
      //       this.$refs.form.removeChild(this.$refs.form.children[i - 1]);
      //     }
      //     this.jsonData.data.elements = item.jsonData;
      //     this.jsonData.data.elements.forEach(e => {
      //       this.engine(this.$refs.form, e);
      //     });
      //   } else if (item.type == "pull") {
      //     this._onDrop(item.target, item.el, item.jsonFa, item.jsonSon);
      //   } else {
      //     this._onDragEnd(item.jsonFa, item.jsonSon, flag, item.target, item.el);
      //   }
      // }
      // this.basicArgs = _.cloneDeep(item.basicArgs);
      // return true;
      this.snapShotCount--;
      this.jsonData.data = _.cloneDeep(this.dataSnapshot[this.snapShotCount - 1]);
      // this.undoing = false;
      this.$emit('snapShot', this.snapShotCount, this.dataSnapshot.length);
      this.$nextTick(() => {
        this.reloadFormRender = true;
      })
      var _this = this;
      setTimeout(() => {
        if(_this.activeUUID){
          if(_this.GetJsonByUUID(_this.jsonData.data, _this.activeUUID)){
            _this.GetAddinByUUID(_this.activeUUID).activeAddin();
          }else{
            _this.hide()
          }
        }
      }, 0)
      return false;
    },

    redo() {
      // if (this.undoing || this.redoing) return;
      if (this.snapShotCount >= 9 || this.snapShotCount >= this.dataSnapshot.length) return false;
      this.snapShotCount++;
      // this.redoing = true;
      this.reloadFormRender = false;
      // if (this.snapShotCount >= this.dataSnapshot.length) return false;
      // var flag = false;
      // if (this.dataSnapshot[this.snapShotCount].length == 2) flag = true;
      // for (var i = 0; i < this.dataSnapshot[this.snapShotCount].length; i++) {
      //   var item = this.dataSnapshot[this.snapShotCount][i];
      //   if (item.type == "init") {
      //     for (var i = this.$refs.form.children.length; i > 0; i--) {
      //       this.$refs.form.removeChild(this.$refs.form.children[i - 1]);
      //     }
      //     this.jsonData.data.elements = [];
      //     this.$emit("hideEditBox");
      //   } else if (item.type == "push") {
      //     this._onDrop(item.target, item.el, item.jsonFa, item.jsonSon);
      //   } else {
      //     this._onDragEnd(item.jsonFa, item.jsonSon, flag, item.target, item.el);
      //   }
      // }
      this.jsonData.data = _.cloneDeep(this.dataSnapshot[this.snapShotCount - 1]);
      //重写formAddinList
      // this.formAddinList = [];
      // this.jsonData.data.elements.forEach(e => {
      //   this.formAddinList.push({
      //     name: e.self.elementType.replace('addin_', ''),
      //     uuid: e.self.uuid,
      //     addin: e,
      //   })
      // });
      // this.redoing = false;
      this.$emit('snapShot', this.snapShotCount, this.dataSnapshot.length);
      this.$nextTick(() => {
        this.reloadFormRender = true;
      })
      //重新模拟点击事件
      var _this = this;
      setTimeout(() => {
        if(_this.activeUUID){
          if(_this.GetJsonByUUID(_this.jsonData.data, _this.activeUUID)){
            _this.GetAddinByUUID(_this.activeUUID).activeAddin();
          }else{
            _this.hide()
          }
        }
      }, 0)
      return false;
    },

    //填充控件颜色
    colorFill(color) {
      console.log(color)
    },

    // 改变设备适配样式
    fitDevice(dev) {

      for (var i in this.jsonUUID) {
        if (this.jsonUUID[i].obj) {
          this.jsonUUID[i].obj.$el.classList.remove(this.deviceType);
          this.jsonUUID[i].obj.$el.classList.add(dev);
        }
      }

      this.deviceType = dev;
      this.jsonData.data.deviceType = dev;

      if (dev == 'actPc') {

        this.fitClass = 'full-width';

      } else if (dev == 'actIpad') {

        this.fitClass = 'ipad-width';

      } else if (dev == 'actIpadH') {

        this.fitClass = 'ipadh-width';

      } else if (dev == 'actPhone') {

        this.fitClass = 'iphone-width';
        console.log(window.innerHeight - 137)
        if (window.innerHeight - 52 < 700) {
          this.fitClass = 'iphone-width iphoneh-width-small'
        }

      } else {
        this.fitClass = 'iphoneh-width';
      }
      this.snapShotHistory();
    }
  },
}
</script>

<style>
.mask {
  background-color: #000;
  width: auto;
  height: auto;
}

.iphone-width .msize,
.iphoneh-width .msize {
  font-size: 12px !important;
}

.addin.vue-draggable-ghost {
  background: #F56C6C;
  border: 2px solid #F56C6C !important;
  display: block;
  padding: 0px !important;
  outline-width: 0;
  height: 0px!important;
  -webkit-box-sizing: border-box;
  box-sizing: border-box;
  font-size: 0;
  content: '';
  width: 100%;
  overflow: hidden;
}

.pc-width .addin-pool.vue-draggable-ghost {
   background: #F56C6C;
   border: 2px solid #F56C6C !important;
   display: block;
   padding: 0px !important;
   outline-width: 0;
   height: 0px!important;
   -webkit-box-sizing: border-box;
   box-sizing: border-box;
   font-size: 0;
   content: '';
   width: 100%!important;
   overflow: hidden;
 }
.van-overlay {
  background-color: rgb(0,0,0,0);
}
.van-popup {
  position:absolute;
  }
</style>
<style scoped>
.pc-width {
  padding: 10px;
  background-color: #f3f3f3;
}

.full-width {
  min-height: 600px;
  max-height: none;
  overflow-y: visible;
  overflow-x: scroll;
  padding: 10px;
  height: inherit;
}

.ipad-width {
  padding: 0;
  max-height: 960px;
  overflow-y: auto;
}

.ipadh-width {
  padding: 0;
  max-height: 703px;
  overflow-y: auto;
}

.iphone-width {
  width: 375px;
  padding: 0;
  overflow-y: auto;
  overflow-x: hidden;
}


.iphoneh-width-small {
  min-height: 555.3px;
  width: 335.7px;
}

.iphone-width::-webkit-scrollbar-track {
  border-radius: 10px;
  background-color: rgba(255, 255, 255, 0);
}

.iphone-width::-webkit-scrollbar-track-piece {
  background-color: rgba(255, 255, 255, 0);
  -webkit-border-radius: 0;
}

.iphone-width::-webkit-scrollbar {
  width: 0px;
  height: 8px;
}

.iphone-width::-webkit-scrollbar-thumb {
  height: 50px;
  background-color: rgba(255, 255, 255, 1);
  -webkit-border-radius: 4px;
  outline: 2px solid rgba(255, 255, 255, 0);
  outline-offset: -2px;
  border: 2px solid rgba(255, 255, 255, 0);
}

.iphone-width::-webkit-scrollbar-thumb:hover {
  height: 50px;
  background-color: rgba(255, 255, 255, 0);
  -webkit-border-radius: 4px;
}
.iphoneh-width {
  width: 667px;
  min-height: 327px;
  max-height: 327px;
  padding: 0;
  overflow-y: auto;
}
</style>