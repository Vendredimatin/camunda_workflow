<template>
  <div style="height: 100%">
    <Layout v-if="appDeriction" style="height: 100%" class="main" >
      <Sider hide-trigger collapsible :width="260" :collapsed-width="64" v-model="collapsed" class="sideWrap appMenu">
        <side-menu :active-name="$route.name" :collapsed="collapsed" @on-select="turnToPage" :menu-list="menuList">
          <div class="logo-con">
            <div @click="toHome" style="float: left">
              <img class="max" v-show="!collapsed" :src="logo" />
              <img class="min" v-show="collapsed" :src="logo" />
            </div>
            <span class="title" v-show="!collapsed" style="font-size: 14px;">{{ appTitle }}</span>
          </div>
        </side-menu>
      </Sider>
      <Layout class="self-layout" style="height: 100%;">
        <Header class="header-con" ref="selfHead">
          <header-bar :collapsed="collapsed" @on-coll-change="handleCollapsedChange">
            <user :username="username"/>
          </header-bar>
        </Header>
  <!-- top: 64px;-->
        <Content style="position: relative; margin-top: 64px;">
          <Layout class="self-layout main-self-tab" style="height: 100%;">
            <Tabs ref="tab" class="self-tab" style="height: 100%;" v-model="tab" type="card" @on-click="turnToPage" @on-tab-remove="onTabRemove" :animated="false">
              <!-- <Button v-show="this.tab != -1 && this.tab != 'home' && this.tab.indexOf('/') != '-1' && this.tab.indexOf('wf-') == '-1'" type="default" size="small" slot="extra" -->
              <Button v-show="shareShow" type="default" size="small" slot="extra"
                      style="right: 0;top: 0;opacity:0.9;margin-right: 5px;"
                      @click="appShareEvent">
                <Icon type="md-share"></Icon>
                分享
              </Button>
              <Button v-show="canDesign" type="default" size="small" slot="extra"
                      style="right: 0;top: 0;opacity:0.9;margin-right: 5px;"
                      @click="returnDesign">
                <Icon type="ios-copy-outline"></Icon>
                返回定制
              </Button>
              <TabPane style="height: 100%;" v-for="item in tagNavList" closable :key="item.name" :name="item.name" :label="item.meta.title">
              </TabPane>
              <Dropdown transfer slot="extra" @on-click="handleTagsOption" style="margin-top: 3px; margin-right: 15px">
                <Button size="small" type="text" class="self-color">
                  <Icon :size="18" type="ios-close-circle-outline"></Icon>
                </Button>
                <DropdownMenu slot="list" class="self-userDrop">
                  <DropdownItem name="close-all">关闭所有</DropdownItem>
                  <DropdownItem name="close-others">关闭其他</DropdownItem>
                </DropdownMenu>
              </Dropdown>
            </Tabs>
            <iframe v-show="showIframe" src="" id="showIframe" :style="{top: iframeTop}" style="position: absolute; width: 100%; height: 100vh;border: none;">
            </iframe>
          </Layout>
        </Content>
      </Layout>
      <div ref="remoteJS" id = "remote-js"></div>
    </Layout>

    <Layout v-else style="height: 100%; display: block;" class="main">
      <Header class="self-hori-head appMenu">
        <Row>
          <Col span="22">
            <side-menu :active-name="$route.name" @on-click="turnToPage" :menu-list="menuList" :collapsed="collapsed">
              <Tooltip :content="appTitle">
                <div class="logo-con">
                  <div @click="toHome" style="float: left">
                    <img class="max" v-show="!collapsed" :src="logo" />
                    <img class="min" v-show="collapsed" :src="logo" />
                  </div>
                  <span class="title" v-show="!collapsed" style="font-size: 14px;">{{ appTitle }}</span>
                </div>
              </Tooltip>
            </side-menu>
          </Col>
          <Col span="2">
            <user :username="username"/>
          </Col>
        </Row>
      </Header>
      <Layout class="self-layout" style="height: calc(100% - 64px);position: relative;">
        <Content>
          <Layout class="self-layout main-self-tab" style="height: 100%;">
            <Tabs ref="tab" style="height: 100%;" class="self-tab" v-model="tab" type="card" @on-click="turnToPage" @on-tab-remove="onTabRemove" :animated="false">
              <Button v-show="shareShow" type="default" size="small" slot="extra"
                      style="right: 0;top: 0;opacity:0.9;margin-right: 5px;"
                      @click="appShareEvent">
                <Icon type="md-share"></Icon>
                分享
              </Button>
              <Button v-show="canDesign" type="default" size="small" slot="extra"
                    style="right: 0;top: 0;opacity:0.9;margin-right: 5px;"
                    @click="returnDesign">
                <Icon type="ios-copy-outline"></Icon>
                返回定制
              </Button>
              <TabPane style="height: 100%;" v-for="item in tagNavList" closable :key="item.name" :name="item.name" :label="item.meta.title">
              </TabPane>
              <Dropdown transfer slot="extra" @on-click="handleTagsOption" style="margin-top: 3px; margin-right: 15px">
                <Button size="small" type="text" class="self-color self-closeTab">
                  <Icon :size="18" type="ios-close-circle-outline"></Icon>
                </Button>
                <DropdownMenu slot="list" class="self-userDrop">
                  <DropdownItem name="close-all">关闭所有</DropdownItem>
                  <DropdownItem name="close-others">关闭其他</DropdownItem>
                </DropdownMenu>
              </Dropdown>
            </Tabs>
            <iframe v-show="showIframe" :src="indexUrl" :style="{top: iframeTop}" style="position: absolute; width: 100%; height: 100vh;border: none;">
            </iframe>
            <!-- 分享弹窗 -->
          </Layout>
        </Content>
      </Layout>
      <div ref="remoteJS" id = "remote-js"></div>
    </Layout>
        <!-- 分享弹窗 -->
    <Modal v-model="shareModal" scrollable draggable title="分享信息">
      <div>
        <Tabs v-model="activeTab">
          <TabPane label="分享到应用" icon="ios-cube-outline" name="shareToApp">
            <!-- <div style="margin-bottom: 15px;">
              <span class="self-color">表单分享过滤条件: </span>
              <Input v-model="shareQuery" type="textarea" :autosize="{minRows: 2,maxRows: 5}" @on-change="shareQueryChange"/>
            </div> -->
          <Row align="middle" type="flex" style="margin: 30px 0;">
            <Col span="24" style="cursor: pointer">
              <Input v-model="shareValue" id="shareValue" readonly autosize type="textarea" class="textareaInput">
              </Input>
            </Col>
          </Row>
          <Row>
            <Col span="24" style="text-align: center">
              <Button  icon="md-copy" style="margin-right: 10px;" @click.native="copyLink">点我复制</Button>
              <Button type="primary" @click="toShareTab">前往预览</Button>
            </Col>
          </Row>
          </TabPane>
          <TabPane :disabled="!judgeAction" label="分享到表单" icon="ios-desktop" v-if="judgeAction" name="shareToForm">
            <!-- <div style="margin-bottom: 15px;">
              <span class="self-color">表单分享过滤条件: </span>
              <Input v-model="shareFormQuery" type="textarea" :autosize="{minRows: 2,maxRows: 5}" @on-change="shareFormQueryChange"/>
            </div> -->
          <Row style="margin: 30px 0;" align="middle" type="flex">
            <Col span="24" style="cursor: pointer">
              <Input v-model="shareFormValue" id="shareFormValue" readonly autosize type="textarea" class="textareaInput"/>
            </Col>
          </Row>
          <Row>
            <Col span="24" style="text-align: center">
              <Button  icon="md-copy" style="margin-right: 10px;" @click.native="copyFormLink">点我复制</Button>
              <Button type="primary" @click="toShareFormTab">前往预览</Button>
            </Col>
          </Row>
          </TabPane>
        </Tabs>
      </div>
      <div slot="footer">
        <Button type="text" @click="shareModal = false">关闭</Button>
      </div>
    </Modal>
  </div>
</template>

<script>
import Vue from 'vue';
import sideMenu from "./components/side-menu/side-menu.vue";
import headerBar from "./components/header-bar/header-bar.vue";
import tagsNav from "./components/tags-nav.vue";
import user from "./components/user.vue";
import { mapMutations, mapActions } from "vuex";
import { getNewTagList, getNextName, parseEscapeString } from "../../libs/utils";
import appLogo from "@/assets/images/logo.png";
import { getMenuByRouter } from "@/libs/utils";
import { getExecute, getSub, postSub, deleteSub } from "@/api/others";

import axios from "axios";
import module from "@/api/module";
import { getAppInfo } from "@/api/others";
import _ from 'lodash';

import global_ from '@/views/global.vue';

import { createSocket, addListener, closeSocket } from '@/util/webSocket';

export default {
  name: "Main",
  components: {
    sideMenu,
    headerBar,
    tagsNav,
    user
  },
  data() {
    return {
      iframeTop: '42px',
      activeTab: 'shareToApp',// tabs激活的面板
      firstEnter: false,//是否首次加载路由
      isDefault: false,//当前路由是否是默认模块
      isBackClick: false,//点击返回定制并刷新，切换tab
      pendingTaskQueue: [],
      firstView: true,
      collapsed: false,
      shareModal: false,
      judgeAction: true,
      shareQuery: '',
      shareFormQuery: '',
      shareValue: '',
      shareFormValue: '',

      showIframe: false,
      indexUrl: '',

      logo: appLogo,
      appTitle: '',
      // appColor: '#495060',
      appDeriction: true,
      menuList: this.$store.state.targetRouter,
      tab: 0,
      // _tab: 0,
      notCache: false,
      tabViews: {},
      tabComs: {},
      route: null,
      actionToView: {
        list: "Multi",
        implement: "Implement",
        create: "Create",
        next_create: 'NextCreate',
        creates: "Creates",
        visit: "Single",
        edit: "SingleEdit",
        url: "Url",
        folder: "Folder",
        wfprocess: "Process",
        launchForm: "LaunchForm"
      },
      queryMap: {},
    };
  },
  computed: {
    shareShow() {
      return this.tab != -1 && this.tab != 'home' && ((!this.isDefault && this.tab.indexOf('/') != '-1') || this.isDefault) && this.tab.indexOf('wf-') == '-1'
    },
    tagNavList() {
      return this.$store.state.app.tagNavList;
    },
    tagRouter() {
      return this.$store.state.app.tagRouter;
    },
    username() {
      return this.$store.state.user.username;
    },
    cacheList() {
      return this.tagNavList.length
        ? this.tagNavList.filter(item => !(item.meta && item.meta.notCache))
        : [];
    },
    canDesign() {
      return this.username == "admin" && ((this.$route.meta && this.$route.meta.targetClass && this.$route.name != 'home') || (!this.isBackClick && this.route && this.route.meta && this.route.meta.targetClass));
    },
  },
  methods: {
    ...mapMutations(["setBreadCrumb", "setTagNavList", "addTag", "removeTag", "addRoute"]),
    ...mapActions(["handleLogOut"]),
    ...mapActions('DWF_global', ["getDWFAppConfig"]),

    toHome() {
      this.$router.push('/home')
    },
    initDWFAppConfig(){
      this.getDWFAppConfig();
    },
    // 端口设置
    portFormat() {
      let APPPort = '8080'
      let ModelerPort = '8081'
      let portM = Config.ModelerPort ? Config.ModelerPort : ModelerPort;
      let portA= Config.APPPort ? Config.APPPort : APPPort;
      let host = Config.host.replace(portA, portM)
      return host
    },
    // 返回定制: 拼出modeler端表单编辑页面链接并带上token
    returnDesign() {
      let a = document.createElement('a');
      let proto = window.location.protocol;
      let host = this.portFormat();
      let targetClass = this.$route.name == "error_404" ? this.route.meta.targetClass : this.$route.meta.targetClass;
      let viewName = this.$route.name == "error_404" ? this.route.meta.viewName : this.$route.meta.viewName;
      let url = `${proto}//${host}/${Config.baseModelerRouteName}/forms/${targetClass}/${viewName}?token=${this.$store.state.user.token}&formType=PC&designClass=${targetClass}`;
      a.href = url;
      a.target="_blank";
      a.click();
    },

    // shareQueryChange(ev) {

    //   let value = ev.target.value;
    //   let curAppName = sessionStorage.getItem('appName');
    //   if(value != '') {

    //       let proto = window.location.protocol;
    //       let host = window.location.host;
    //       this.shareValue = `${proto}//${host}/app-web/about?shareName=${curAppName}&sharePath=${this.tab}&query=${value}&token=${this.$store.state.user.token}`;

    //   } else {

    //       let proto = window.location.protocol;
    //       let host = window.location.host;
    //       this.shareValue = `${proto}//${host}/app-web/about?shareName=${curAppName}&sharePath=${this.tab}&token=${this.$store.state.user.token}`;

    //   }

    // },

    // shareFormQueryChange(ev) {

    //   console.log(ev)

    // },

    // 一键复制分享到应用
    copyLink() {

      var urlLink = document.querySelector("#shareValue textarea");
      urlLink.select();
      document.execCommand("Copy");
      this.$Message.info('复制成功')
    },

    // 一键复制分享到表单
    copyFormLink() {

      var urlLink = document.querySelector("#shareFormValue textarea");
      urlLink.select();
      document.execCommand("Copy");
      this.$Message.info('复制成功')
    },

    appShareEvent() {
      // console.log(this.tab, this.$route.meta.targetClass, this.$route.meta.viewName, this.$route.meta.action, this.route.meta.targetClass);
      let curAction = this.$route.meta.action ? this.$route.meta.action : this.route.meta.action;
      if(this.tab == 'home') {
        this.judgeAction = false;
      } else {
        this.judgeAction = ['create', 'visit', 'edit', 'next_create', 'list', 'creates'].includes(curAction) ? true : false;
      }

      this.shareQuery = '';
      this.shareFormValue = '';
      let curAppName = sessionStorage.getItem('appName');
      let proto = window.location.protocol;
      let host = window.location.host;

      this.shareValue = `${proto}//${host}/app-web/about?shareName=${curAppName}&sharePath=${this.tab}&token=${this.$store.state.user.token}`;

      if(this.judgeAction) {

        let curClass = this.$route.meta.targetClass ? this.$route.meta.targetClass : this.route.meta.targetClass;
        let curView = this.$route.meta.viewName ? this.$route.meta.viewName : this.route.meta.viewName;
        console.log(curClass, curView)
        let targetAction = curAction == 'next_create' ? 'create' : curAction;

        this.shareFormValue = `${proto}//${host}/app-web/forms/${curClass}/${curView}?displayType=${targetAction}&token=${this.$store.state.user.token}`;

      }

      this.shareModal = true;
    },

    toShareTab() {

      let proto = window.location.protocol;
      let host = window.location.host;
      let url = '';
      let curAppName = sessionStorage.getItem('appName');
      if(this.shareValue == '') {
        // url = `${proto}//${host}/app-web/about?shareName=${curAppName}&sharePath=${this.tab}&query=${this.shareQuery}&token=${this.$store.state.user.token}`;
        url = `${proto}//${host}/app-web/about?shareName=${curAppName}&sharePath=${this.tab}&token=${this.$store.state.user.token}`;
      } else {
        url = this.shareValue;
      }
      // sessionStorage.job = '[]';
      // sessionStorage.tagNaveList = '[]';

      let a = document.createElement('a');
      a.href = url;
      a.target = "_blank";
      a.click();

      this.shareModal = false;

    },

    toShareFormTab() {

      let targetAction = this.$route.meta.action == 'next_create' ? 'create' : this.$route.meta.action;
      let curClass = this.$route.meta.targetClass ? this.$route.meta.targetClass : this.route.meta.targetClass;
      let curView = this.$route.meta.viewName ? this.$route.meta.viewName : this.route.meta.viewName;
      let proto = window.location.protocol;
      let host = window.location.host;
      let url = '';
      let curAppName = sessionStorage.getItem('appName');
      if(this.shareFormValue == '') {
        // url = `${proto}//${host}/app-web/forms/${curClass}/${curView}?displayType=${targetAction}&query=${this.shareFormQuery}&token=${this.$store.state.user.token}`;
        url = `${proto}//${host}/app-web/forms/${curClass}/${curView}?displayType=${targetAction}&token=${this.$store.state.user.token}`;
      } else {
        url = this.shareFormValue;
      }

      let a = document.createElement('a');
      a.href = url;
      a.target = "_blank";
      a.click();

      this.shareModal = false;

    },

    /*
     从快速查询操作打开新的标签页
     query_opr为快速查询操作对象
     query为快速查询操作的参数,包括查询语句,默认操作,前处理脚本,后处理脚本等
     */
    openTab(query_opr, query) {
      if(query && query.params && query.params.thisAddinId) delete query.params.thisAddinId;
      var routeIdx = this.$store.state.app.newRoutes
      .findIndex(x => x.name == query_opr.targetClass && x.children && x.children.length > 0
      && x.children[0].meta && x.children[0].meta.authority == query_opr.authority);
      if (routeIdx > -1) {
        let route = this.$store.state.app.newRoutes[routeIdx];
        if (route.children[0].meta) {
          this.$store.state.app.newRoutes[routeIdx].children[0].meta.condition = query_opr.conditionExpre;

          if(query_opr.extSettings != '' && query_opr.extSettings != undefined) {

            let parsePop = JSON.parse(query_opr.extSettings);
            this.$store.state.app.newRoutes[routeIdx].children[0].meta.needDefOpr = parsePop.needDefaultOpr;

          } else {
            this.$store.state.app.newRoutes[routeIdx].children[0].meta.needDefOpr = false;
          }

          this.$store.state.app.newRoutes[routeIdx].children[0].meta.needDefOprAction = query_opr.action;
          this.$store.state.app.newRoutes[routeIdx].children[0].meta.params = query_opr.params;
          this.$store.state.app.newRoutes[routeIdx].children[0].meta.wfAuthority = query_opr.wfAuthority;
        }
        this.queryMap[route.children[0].name] = query;
        this.turnToPage(route.children[0].name);
        return;
      }

      let tabCache = false;
      if (query_opr.params.length > 0) {
        let _params = query_opr.params.split('APP_afterScript:');
        let _paramsInt = _params[0].replace("APP_beforeScript:", "");
        if(_paramsInt.indexOf('this.tabCache = true;') != -1) {
          tabCache = true;
        }
      }
      let finalNeedDopr = false;
      // let finalNeedDialogDopr = true;
      if(query_opr.extSettings != '' && query_opr.extSettings != undefined) {

        let parsePop = JSON.parse(query_opr.extSettings);
        finalNeedDopr = parsePop.needDefaultOpr;
        // finalNeedDialogDopr = parsePop.needDialogDefaultOpr;

      } else {
        if((query_opr.action == 'create' || query_opr.action == 'edit' || query_opr.action == 'visit') && query_opr.conType == 'tab') {
          finalNeedDopr = false;
        }
        // if((query_opr.action == 'create' || query_opr.action == 'edit') && query_opr.conType == 'dialog') {
        //   finalNeedDialogDopr = true;
        // }
      }
      var route = {
        path: "/" + query_opr.targetClass,
        name: query_opr.targetClass,
        component: () => import("@/views/main/Main.vue"),
        meta: {
        },
        children: [{
          path: query_opr.authority,
          name: query_opr.targetClass + "-" + query_opr.authority,
          meta: {
            targetClass: query_opr.targetClass,
            viewName: query_opr.viewName,
            authority: query_opr.authority,
            title: query_opr.displayName,
            condition: query_opr.conditionExpre,
            notCache: tabCache,
            path: `default/${this.actionToView[query_opr.action]}`,
            params: query_opr.params,
            needDefOpr: finalNeedDopr,
            // needDialogDefOpr: finalNeedDialogDopr,
            needDefOprAction: query_opr.action,
            wfProcessInstanceId: query_opr.wfProcessInstanceId,
            taskId: query_opr.taskId,
            wfAuthority: query_opr.wfAuthority,
          },
          component: null,
        }]
      }
      console.log("!!:", query_opr, route);
      this.addRoute(route);
      this.$router.options.routes.push(route);
      this.$router.addRoutes([route]);
      localStorage.setItem(query_opr.targetClass + "-" + query_opr.authority, JSON.stringify(query));
      this.queryMap[query_opr.targetClass + "-" + query_opr.authority] = query;
      this.turnToPage(query_opr.targetClass + "-" + query_opr.authority);
    },

    goToWfEdit(id,proName) {
      var route = this.$store.state.app.newRoutes.filter(item => item.meta && item.meta.id == id);
      if (route.length > 0) {
        this.turnToPage(route[0].name);
      } else {
        route = {
          path: "/workflow",
          name: "workflow",
          meta: {
              icon: "help-buoy",
              title: "工作流",
          },
          component: () => import("@/views/main/Main.vue"),
          children: [{
              path: `wf-edit-${id}`,
              name: `wf-edit-${id}`,
              meta: {
                title: `流程编辑-${proName}`,
                id: id,
                templateName : proName,
                path: "workflow/wf-edit.vue",
              },
          }]
        }
        this.addRoute(route);
        this.$router.options.routes.push(route);
        this.$router.addRoutes([route]);
        this.turnToPage(`wf-edit-${id}`);
      }
    },

    goToWfAdminEdit(proInst) {
      //id,definitionId,pname,proName,enClassName
      var route = this.$store.state.app.newRoutes.filter(item => item.meta && item.meta.id == proInst.id);
      if (route.length > 0) {
        this.turnToPage(route[0].name);
      } else {

        route = {
          path: "/workflow",
          name: "workflow",
          meta: {
              icon: "help-buoy",
              title: "工作流",
          },
          component: () => import("@/views/main/Main.vue"),
          children: [{
              path: `wf-admin-edit-${proInst.id}`,
              name: `wf-admin-edit-${proInst.id}`,
              meta: {
                title: `查看流程-${proInst.proName}`,
                id: proInst.id,
                definitionId:proInst.definitionId,
                pname:proInst.pname,
                enClassName: proInst.enClassName,
                path: "workflow/wf-admin-edit.vue",
              },
          }]
        }
        this.addRoute(route);
        this.$router.options.routes.push(route);
        this.$router.addRoutes([route]);
        this.turnToPage(`wf-admin-edit-${proInst.id}`);
      }
    },
    // 关闭全部/关闭其他
    handleTagsOption(name) {
      if (name == "close-all") {
        if(this.route && this.route.meta && this.route.meta.targetClass) {
          this.route.meta.targetClass = '';
        }
        for (var i in this.tabComs) {
          if (this.tabComs[i].beforeLeave) this.tabComs[i].beforeLeave();
          this.tabComs[i].$destroy();
        }
        this.tabComs = {};
        this.setTagNavList([]);
        this.turnToPage("home");
      } else if (name == "close-others") {
        for (var i in this.tabComs) {
          if (i == this.tab) continue;
          if (this.tabComs[i].beforeLeave) this.tabComs[i].beforeLeave();
          this.tabComs[i].$destroy();
          delete this.tabComs[i];
        }
        this.setTagNavList(this.tagNavList.filter(item => item.name == this.tab));
      } else if (name == "close-others-notab") {
        for (var i in this.tabComs) {
          if (i == this.tab) continue;
          if (this.tabComs[i].beforeLeave) this.tabComs[i].beforeLeave();
          this.tabComs[i].$destroy();
          delete this.tabComs[i];
        }
      }
    },

    /**
     * @description 初始化设置面包屑导航和标签导航
     */
    commonMounted() {
      this._tab = this.tab;
      // this.notCache = this.$route.name == "error_404" ? this.route.meta.notCache : this.$route.meta.notCache;
      this.notCache = this.$route.name == "error_404" ? true : false;
      if (this.tagNavList.length > 0) {
        let routeObj = {};
        if(this.$route.name == "error_404") {
          let navCache = JSON.parse(sessionStorage.getItem('tagNaveList'));
          if(navCache) {
            routeObj = navCache.filter(n => n.path == this.$route.path)[0]
          }
        } else {
          routeObj = this.$route;
        }
        this.setTagNavList(getNewTagList(this.tagNavList, routeObj));
        let that = this;
        if (this.$refs.tab.$el.children[1].children.length == this.tagNavList.length) this.onTabClick(this.tab);
        else setTimeout(() => that.onTabClick(that.tab),30);
      }

    },

    /*
     点击指定标签页,流程如下:
     1. 需要调用旧页面的beforeLeave函数
     2. 判断是否缓存,不缓存的话清除旧页面
     3. 判断新页面是否存在,存在的话调用activate,不存在的话生成
     */
      onTabClick(name) {
      console.log("!!!", this._tab, name, this.tagNavList, this.$router, this.$route, this.route, this.$refs.tab);
      // let selfNoTokenPath = sessionStorage.getItem('noTokenPath');
      // if(!selfNoTokenPath) {

      //   let hasIndexUrl = sessionStorage.getItem('indexPageUrl');
      //   let hasIndexOpr = sessionStorage.getItem('indexPageOpr');
      //   if(hasIndexUrl == 'home' && hasIndexOpr && hasIndexOpr != '') {

      //     let homeIndex = this.tagNavList.findIndex(t => {
      //       return t.name == 'home'
      //     })
      //     if(homeIndex != -1) {
      //       this.tagNavList.splice(homeIndex, 1)
      //     }

      //   }

      // }
      if(this.$route.meta.isDefault){
        this.isDefault = true
      }else{
        this.isDefault = false
      }
      if(name != 'home') {
        this.showIframe = false;
        if(this.firstView) {
          this.$Spin.show();
          setTimeout(() => {
            let hasIndexUrl = sessionStorage.getItem('indexPageUrl');
            let hasIndexOpr = sessionStorage.getItem('indexPageOpr');
            console.log(this.firstEnter)
            if(this.firstEnter && hasIndexUrl == 'home' && hasIndexOpr && hasIndexOpr != '') {
              let homeIndex = this.tagNavList.findIndex(t => {
                return t.name == 'home'
              })
              if(homeIndex != -1) {
                this.tagNavList.splice(homeIndex, 1)
              }
              this.$Spin.hide();

            } else {
              this.$Spin.hide();
            }

            this.firstView = false;

          }, 30)
        }

      } else {
        this.showIframe = true;
      }
      console.log(this._tab, this.tabComs)
      if (this._tab in this.tabComs && this.tabComs[this._tab].beforeLeave) this.tabComs[this._tab].beforeLeave();
      if (this.notCache && this._tab in this.tabComs) {
        this.tabComs[this._tab].$destroy();
        delete this.tabComs[this._tab];
        let index = this.tagNavList.findIndex(item => item.name == this._tab);
        if (index > -1) {
          let dom = this.$refs.tab.$el.children[1].children[index];
          for (var i = dom.children.length;i > 0;i--) {
            dom.removeChild(dom.children[i-1]);
          }
        }
      }
      this.tab = name;
      this._tab = name;
      this.notCache = this.$route.name == "error_404" ? true : false;
      // this.notCache = this.$route.name == "error_404" ? this.route.meta.notCache : this.$route.meta.notCache;
      let index = this.tagNavList.findIndex(item => item.name == name);
      if (index == -1) return;
      let dom = this.$refs.tab.$el.children[1].children[index];
      if (this.notCache && name in this.tabComs) {
        if (this.tabComs[name].beforeLeave) this.tabComs[name].beforeLeave();
        this.tabComs[name].$destroy();
        delete this.tabComs[name];
        for (var i = dom.children.length;i > 0;i--) {
          dom.removeChild(dom.children[i-1]);
        }
      }
      if (name in this.tabComs && this.tabComs[name].activate) this.tabComs[name].activate();
      if (name in this.tabComs && name in this.queryMap) {
        this.tabComs[name].$refs.form.handle(`/forms/${this.$route.meta.targetClass}/${this.$route.meta.viewName}`, this.queryMap[name]);
      }
      if(!(name in this.tabViews)) {
        var item = this.tagNavList[index];
        if (item.meta.path) {
          this.tabViews[name] = Vue.extend(require('@/views/' + item.meta.path).default);
        }
      }
      // 隐藏tabs时，每次加载路由后关闭其他
      let showTabs = sessionStorage.getItem('appShowTabs')
      if (!(name in this.tabComs) && name in this.tabViews) {
        let isSingleTab = false
        if(showTabs === 'hide'){
          dom.innerHTML = '';
          isSingleTab = true
        }
        this.tabComs[name] = new this.tabViews[name]({
          propsData: { route: this.$route.name == "error_404" ? this.route : this.$route, router: this.$router,
           store: this.$store, root: this, query: name in this.queryMap ? this.queryMap[name] : null, echarts: this.$echarts, Message: this.$Message, isSingleTab: isSingleTab },
        });
        let el = this.tabComs[name].$mount().$el;
        dom.appendChild(el);
      }

      if(showTabs === 'hide'){
        this.handleTagsOption('close-others-notab')
      }
    },

    /*
      移除标签
      需要删除旧页面,并跳转到下一个标签
     */
    onTabRemove(name) {
      //删除另一种name形式xxx-xxx xxx/xxx
      let otherNameType = '';
      if(name.split('-').length > 1) otherNameType = name.split('-').join('/')
      let index = this.tagNavList.findIndex(item => item.name == name || item.name == otherNameType);
      if (name in this.tabComs) {
        if (this.tabComs[name].beforeLeave) this.tabComs[name].beforeLeave();
        this.tabComs[name].$destroy();
        this.tabComs[name] = null;
        delete this.tabComs[name];
      }else if(otherNameType in this.tabComs){
        //脚本关闭时删除this.tabComs对应com
        if (this.tabComs[otherNameType].beforeLeave) this.tabComs[otherNameType].beforeLeave();
        this.tabComs[otherNameType].$destroy();
        this.tabComs[otherNameType] = null;
        delete this.tabComs[otherNameType];
      }
      this.removeTag(this.tagNavList[index]);
      if (index >= this.tagNavList.length) index = this.tagNavList.length-1;
      let _name = index > -1 ? this.tagNavList[index].name : "home";
      let that = this;
      if (this.tagNavList.length == 0) setTimeout(() => { that.turnToPage(_name); }, 30);
      else this.turnToPage(_name);
    },

    /*
     跳转到指定页面
     如果路由没变化,不会触发$route的监听,则手动调用routeChange函数
     */
    turnToPage(name) {
      localStorage.setItem("sysName", name);
      name = name.split("?")[0];
      let flag = name == this.$route.name;
      this.$router.replace({ name: name });
      if (flag) this.routeChange(this.$route);
    },

    handleCollapsedChange(state) {
      let name = this.tab;
      if (name in this.tabComs && this.tabComs[name].collMenu) this.tabComs[name].collMenu();
      this.collapsed = state;

      if(state) {
        this.$refs.selfHead.$el.style.width = 'calc(100% - 64px)';
      } else {
        this.$refs.selfHead.$el.style.width = 'calc(100% - 260px)';
      }
    },

    // findRouteFromRouter(name, routes){
    //   let res = null;
    //   let title = null;
    //   if(name === 'mentmanagement/relationlist58'){debugger}
    //   res = routes.find(route => route.name === name);
    //   if(res && res.meta && res.meta.title){
    //     return res.meta.title
    //   }
    //   routes.forEach(route => {
    //     if(route.children && route.children.length > 0){
    //       title = this.findRouteFromRouter(name, route.children);
    //       if (title) return title;
    //     }
    //   })
    //   return null
    // },
    /*
     路由跳转函数,流程如下:
     1. 设置面包屑
     2. 设置标签栏
     3. 触发标签点选函数
     */
    routeChange(newRoute) {
      // newRoute.matched.forEach(match => {
      //   match.meta.title ? match.meta.title = this.findRouteFromRouter(match.name, this.$router.options.routes) : '';
      // })
      this.setBreadCrumb(newRoute.matched);
      this.setTagNavList(getNewTagList(this.tagNavList, newRoute));
      let that = this;
      if (this.$refs.tab.$el.children[1].children.length == this.tagNavList.length) this.onTabClick(newRoute.name);
      else setTimeout(() => that.onTabClick(newRoute.name),30);
      console.log("route change:", newRoute, this.tagNavList, this.$refs.tab.$el);
    },

    /**
     * @description设置待处理事件队列
     * @queue 任务队列 active   //是否激活状态
     *                sourceTab//源页签标识
     *                targetTab//目标页签标识
     *                params   //opr信息
     *                response //返回信息
     */
    setPendingTaskQueue(queue){
      this.pendingTaskQueue = [];
      let task = this.pendingTaskQueue.find(queue => queue.targetTab === tab);
      if(task){
        Object.assign(task, queue);
      }else{
        this.pendingTaskQueue.push(queue)
      }
    },

    /**
     * @description执行待处理事件队列
     * @tabName
     * @params
     */
    executePendingTaskQueue(tab){
      let task = _.remove(this.pendingTaskQueue, queue => queue.sourceTab === tab && queue.active);
      return task[0]
    },

    /**
     * @description激活待处理事件队列
     * @tab targetTab
     * @res 返回值
     */
    activePendingTaskQueue(tab, res = null){
      let task = this.pendingTaskQueue.find(queue => queue.targetTab === tab);
      if(task){
        task.active = true;
        task.response = res;
      }
    },

    commonOnWs() {

      let wsUrl = Config.wsBaseUrl + "/websocket?token=" + this.$store.state.user.token;
      createSocket(wsUrl);
      addListener('quit', (data) => {
        this.handleLogOut({}).then(() => {
            this.$store.state.user.token = '';
            this.$router.push({
              name: "login"
            });
          });
        closeSocket();
      });

    }
  },

  watch: {
    shareModal(val) {
      !val ? this.activeTab = 'shareToApp' : ''
    },
    $route(newRoute) {
      this.isBackClick = true
      this.routeChange(newRoute);
    }
  },

  created() {
    let tagNaveList = sessionStorage.getItem('tagNaveList')
    if(tagNaveList && JSON.parse(tagNaveList).length){
      this.firstEnter = false
    }else{
      this.firstEnter = true
    }
    let hasStyle = sessionStorage.getItem('skinStyle');
    if(hasStyle == 'dark') {
      import('@/assets/selfCss/testApp.css')
    }

    let hasJs = sessionStorage.getItem('selfJs');
    if(hasJs && hasJs != '') {
      setTimeout(() => {
        var new_js = document.createElement("script");
        new_js.setAttribute("type", "text/javascript");
        new_js.innerHTML = hasJs;
        document.body.appendChild(new_js);
      }, 0);
    }

    let hasCss = sessionStorage.getItem('selfStyle');
    if(hasCss && hasCss != '') {
      setTimeout(() => {
        var style = document.createElement('style');
        style.type = 'text/css';
        style.id = 'selfExtendCss';
        style.innerHTML = hasCss;
        document.getElementsByTagName('head')[0].appendChild(style);
      }, 10);
    } else {
      setTimeout(() => {
        console.log('删除样式哇')
        try {
          document.getElementsByTagName('head').item(0).removeChild(document.getElementById('selfExtendCss'));
        } catch (error) {
          console.log(error)
        }
      }, 0);
    }

    let isHttpUrl = sessionStorage.getItem('indexPageUrl');
    if(!isHttpUrl) {
      this.showIframe = false;
    } else {
      if(isHttpUrl.indexOf('://') != -1) {
        let decodeUrl = decodeURIComponent(isHttpUrl);
        this.indexUrl = parseEscapeString(decodeUrl, null, null, null, null, this.$store);
        this.showIframe = true;

      } else {
        this.showIframe = false;
      }
    }

    this.logo = appLogo;

    const needDefault = sessionStorage.getItem('logoImg');
    if(!needDefault || needDefault == '' || needDefault == 'null' || needDefault == null) {
      this.logo = appLogo;
    } else if(needDefault && needDefault.indexOf('modeler-web') != -1) {
      this.logo = appLogo;
    } else {
      this.logo = sessionStorage.getItem('logoImg');
    }


    // this.appColor = sessionStorage.getItem('appColor') || '#495060';
    this.appTitle = sessionStorage.getItem('appTitle') || '清华数为';

    // 修改网页title
    const currentName = sessionStorage.getItem('appName');
    const currentTitle = sessionStorage.getItem('appTitle');

    if(currentName != '') {
      document.title = currentTitle;
    }

    // ico文件追加
    var link = document.querySelector("link[rel*='icon']") || document.createElement('link');
    link.type = 'image/x-icon';
    link.rel = 'shortcut icon';
    link.href = sessionStorage.getItem('icoImg');
    document.getElementsByTagName('head')[0].appendChild(link);

    // let item = this.getViewName(this.$route.path);
    // if (item) {
    //   this.turnToPage(item.moduleName + "/" + item.displayName + "?" + item.conditionExpre);
    // }

    // const appName = localStorage.getItem('appName');
    // getLogo(appName).then(response => {

    //   let res = response.data;

    //   if(!res.data.extConfig) {
    //     this.logo = appLogo;
    //     this.appTitle = '清华数为';
    //   } else {
    //       res.data.extConfig = JSON.parse(res.data.extConfig);
    //       this.logo = res.data.extConfig.logoImg;
    //       this.appTitle = res.data.title;
    //       this.appColor = res.data.appColor;
    //   }
    // }).catch(error => {
    //   console.log(error);
    //   this.$Message.error(error);
    // });

    this.setTagNavList();
    this.addTag(this.$store.state.app.homeRoute);
    this.setBreadCrumb(this.$route.matched);
    this.tab = this.$route.name;
    let _find = (router, path) => {
      let _path = router.path;
      if (path.indexOf(_path) > -1) path = path.substring(_path.length);
      else return null;
      if (path.length == 0) return [router];
      if (path[0] == "/") path = path.substring(1);
      if (router.children) {
        for (var i = 0;i < router.children.length;i++) {
          let res = _find(router.children[i], path);
          if (res) return [router].concat(res);
        }
      }
      return null;
    };

    // 找不到页面(路由为动态路由时),更新路由
    if (this.tab == "error_404") {
      let _path = this.$route.path;
      let idx = _path.indexOf("?");
      if (idx > -1) _path = _path.substring(0, idx);
      for (var i = 0;i < this.$router.options.routes.length;i++) {
        let res = _find(this.$router.options.routes[i], _path);
        if (res) {
          this.setBreadCrumb(res);
          this.route = res[res.length-1];
          this.route = {
            ...this.$route,
            name: this.route.name,
            meta: this.route.meta,
            component: null,
          }
          this.tab = res[res.length-1].name;
          break;
        }
      }
    }

    // let mapApi = document.createElement("script");
    // mapApi.src ="http://api.map.baidu.com/api?v=3.0&ak=DpWBtMpHLbMNaCncXlGFciGOHQG1hLu8";
    // let textIcon = document.createElement("script");
    // textIcon.src ="http://api.map.baidu.com/library/TextIconOverlay/1.2/src/TextIconOverlay_min.js";
    // document.body.appendChild(mapApi);
    // mapApi.onload = () => {
    //   document.body.appendChild(textIcon);
    // }
  },
  mounted() {
    // 是否显示tabs
    let showTabs = sessionStorage.getItem('appShowTabs')
    if(showTabs === 'hide'){
      this.iframeTop  = '0'
      document.querySelector('.ivu-tabs-bar').style.display = 'none'
    }
    sessionStorage.setItem('appMenu', document.getElementById('app').querySelector('.appMenu'));
    //fix bug 4700
    document.getElementById('showIframe').src = this.indexUrl;
    let chooseToAboutFlag = sessionStorage.getItem('chooseToAbout');
    if(!chooseToAboutFlag || chooseToAboutFlag == 'null') {

      let shareReFlag = sessionStorage.getItem('shareReFlag');
      if(!shareReFlag) {
        this.commonOnWs();
      }
      if(shareReFlag == 6) {
        this.$Spin.show();
        location.reload();
        sessionStorage.setItem('shareReFlag', 7);
      }

      if(shareReFlag == 7) {
        let hadFullPath = sessionStorage.getItem('shareFullPath');
        let selfPageName = sessionStorage.getItem('indexPageOpr');
        let tagCount = 2;
        if(selfPageName != '' && selfPageName != undefined && selfPageName != 'null') {
          tagCount++;
        }
        if(hadFullPath && hadFullPath != 'null' && this.tagNavList.length < tagCount) this.$router.push({ name: hadFullPath });

        this.commonOnWs();
        // this.commonMounted();
        this.$Spin.hide();
      }

    } else {
      setTimeout(() => {
        let shareReFlag = sessionStorage.getItem('shareReFlag');
        if(!shareReFlag) {
          this.commonOnWs();
        }
        if(shareReFlag == 6) {
          this.$Spin.show();
          location.reload();
          sessionStorage.setItem('shareReFlag', 7);
        }

        if(shareReFlag == 7) {

          let selfPageName = sessionStorage.getItem('indexPageOpr');
          if(selfPageName && this.tagNavList.length < 2) {
            this.$router.push({ name: selfPageName });
          }

          this.commonOnWs();
          // this.commonMounted();
          this.$Spin.hide();
        }

      }, 30)

    }

    // if(!this.route) {
    //   this.route = this.$router.options.routes
    // }

    this.handleCollapsedChange(false);

    const appFlex = sessionStorage.getItem('appDirection');
    if(appFlex == '上下任务栏布局') {
      this.appDeriction = false;
    } else {
      this.appDeriction = true;
    }

    let uTXt = document.getElementsByClassName('user-name')[0];
    if(this.appDeriction) {
      document.getElementsByClassName('user-name')[0].style.color = '#495060';
    } else {
      document.getElementsByClassName('user-name')[0].style.color = '#fff';
    }

    this.commonMounted();
    this.initDWFAppConfig();
    // if(this.appColor != '' && this.appColor != "#495060") {
    //   let hDiv = document.getElementsByClassName('ivu-layout-sider');
    //   hDiv[0].style.background = this.appColor;

    //   let sDiv = document.getElementsByClassName('ivu-menu-dark');
    //   sDiv[0].style.background = this.appColor;

    //   let aDiv = document.getElementsByClassName('ivu-menu-submenu');
    //   for (var i in aDiv) {
    //     if(aDiv[i].style) {
    //       aDiv[i].style.background = this.appColor;
    //     }
    //   }

    //   let iDiv = document.getElementsByClassName('ivu-menu-item');
    //   for (var i in iDiv) {
    //     if(iDiv[i].style) {
    //       iDiv[i].style.background = 'rgba(255, 255, 255, .3)';
    //     }
    //   }

    //   let tDiv = document.getElementsByClassName('ivu-menu-submenu-title');
    //   for (var i in tDiv) {
    //     if(tDiv[i].style) {
    //       tDiv[i].style.background = this.appColor;
    //     }
    //   }
    // }

  }
};
</script>
<style>
body.dwf-body{
  overflow: auto!important;
}
.ivu-message {
  z-index: 9999 !important;
}
.ivu-message .ivu-message-custom-content.ivu-message-info span{
  word-break: break-all;
}
.ivu-tabs-bar {
  margin-bottom: 0 !important;
}
/*::-webkit-scrollbar {*/
/*  width: 0;*/
/*  color: transparent;*/
/*}*/
/*::-webkit-scrollbar {*/
/*  height: 8px;*/
/*}*/
/*::-webkit-scrollbar-track {*/
/*  background-color: transparent;*/
/*  -webkit-border-radius: 2em;*/
/*  -moz-border-radius: 2em;*/
/*  border-radius: 2em;*/
/*}*/
/*::-webkit-scrollbar-thumb {*/
/*  background-color: rgba(0,0,0,.3);*/
/*  -webkit-border-radius: 2em;*/
/*  -moz-border-radius: 2em;*/
/*  border-radius: 2em;*/
/*}*/
/* .main-self-tab .ivu-tabs-bar {
  position: fixed !important;
  top: 64px !important;
  width: 85.6%;
  z-index: 996;
  background: #fff;
  border-bottom: none;
}
.main-self-tab .ivu-tabs-content {
  position: relative;
  top: 15px;
}
.main-self-tab .ivu-tabs.ivu-tabs-card>.ivu-tabs-bar .ivu-tabs-nav-wrap {
  position: fixed !important;
  top: 64px !important;
  width: 77%;
  z-index: 996;
  background: #fff;
}
@media screen and (max-width: 1331px) {
  .main-self-tab .ivu-tabs-bar{
    width: 78.6%;
  }
    .main-self-tab .ivu-tabs.ivu-tabs-card>.ivu-tabs-bar .ivu-tabs-nav-wrap {
      width: 66%;
    }
  }
.main-self-tab .ivu-tabs-content {
  height: 100%;
} */
</style>
<style lang="less" scoped>
.ivu-breadcrumb {
  color: #fff;
}
.main {
  .sideWrap{
    overflow-x: hidden;
    overflow-y: auto;
  }
  .logo-con {
    height: 60px;
    display: inline-block;
    vertical-align: middle;
    /*padding: 10px;*/
    .min {
      height: 30px;
      width: auto;
      /*display: block;*/
      margin: 15px;
      vertical-align: middle;
    }
    .max {
      height: 40px;
      width: auto;
      float: left;
      /*display: block;*/
      margin: 10px 10px 10px 15px;
      vertical-align: middle;
    }
    .title {
      height: 60px;
      color: #fff;
      font-size: 22px;
      display: table-cell;
      vertical-align: middle;
    }
  }
  .header-con {
    position: fixed;
    top: 0;
    width: 85.6%;
    z-index: 999;
    background: #fff;
    padding: 0 20px;
  }
  // @media screen and (max-width: 1331px) {
  //   .header-con {
  //     width: 78.6%;
  //   }
  // }
  .tag-nav-wrapper {
    padding: 0;
    height: 40px;
    background: #f0f0f0;
    overflow: hidden;
  }
}
</style>
