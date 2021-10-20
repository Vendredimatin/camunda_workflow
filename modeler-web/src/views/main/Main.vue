<template>
  <Layout style="height: 100%" class="main">
    <Sider id="mainMenuSide" hide-trigger collapsible :width="collapsed ? 64 : 210" v-model="collapsed" style="overflow-y: auto;" v-if="singleRoute">
      <side-menu :active-name="$route.name" :collapsed="collapsed" @on-select="turnToPage" :menu-list="menuList">
        <!-- 需要放在菜单上面的内容，如Logo，写在side-menu标签内部，如下 -->
        <div class="logo-con">
          <div @click="toHome" style="float: left">
            <img class="max" v-show="!collapsed" :src="logo" />
            <img class="min" v-show="collapsed" :src="logo" />
          </div>
          <span class="title" v-show="!collapsed" style="font-size: 14px;">{{ appTitle }}</span>
        </div>
      </side-menu>
    </Sider>
    <Layout style="overflow: hidden;">
      <Header class="header-con" ref="selfHead" v-if="singleRoute">
        <header-bar :collapsed="collapsed" @on-coll-change="handleCollapsedChange">
          <user :username="username"/>
        </header-bar>
      </Header>
      <section style="position: relative;" :style="{'top': singleRoute ? '64px' : '0px'}">
        <Layout class="main-self-tab">
          <Tabs ref="tab" v-model="tab" type="card" @on-click="turnToPage" @on-tab-remove="onTabRemove" :animated="false" class="fixTab-wrap">
            <TabPane v-for="(item, index) in tagNavList" closable :key="item.name" :name="item.name" :label="item.meta.title">
            </TabPane>
            <Button id="refreshButton" slot="extra" size="small" type="text" @click.native="menuRefresh">
              <Icon :size="18" type="ios-refresh-circle-outline"></Icon>
            </Button>
            <Dropdown transfer slot="extra" @on-click="handleTagsOption" style="margin-top: 3px; margin-right: 15px">
              <Button id="closePageButton" size="small" type="text">
                <Icon :size="18" type="ios-close-circle-outline"></Icon>
              </Button>
              <DropdownMenu slot="list">
                <DropdownItem id="closeAllPage" name="close-all">关闭所有</DropdownItem>
                <DropdownItem id="closeOtherPage" name="close-others">关闭其他</DropdownItem>
              </DropdownMenu>
            </Dropdown>
          </Tabs>
          <iframe sandbox="allow-scripts allow-same-origin allow-popups" v-if="showIframe" :src="indexUrl" style="position: absolute; width: 100%; height: 100vh;border: none;top:32px;">
          </iframe>
          <!-- <div class="tag-nav-wrapper">
            <tags-nav :value="$route" @input="handleClick" :list="tagNavList" @on-close="handleCloseTag"/>
          </div>
          <Content>
            <keep-alive>
              <router-view v-if="!$route.meta || !$route.meta.notCache"/>
            </keep-alive>
            <router-view v-if="$route.meta && $route.meta.notCache"/>
          </Content> -->
        </Layout>
        <!--  首页用遮罩  -->
        <Spin fix v-if="spinShowHome" style="background-color: rgba(255,255,255); z-index: 9999"></Spin>
      </section>
    </Layout>
    <div ref="remoteJS" id = "remote-js"></div>
    <!--  singleurl用遮罩  -->
    <Spin fix v-if="spinShow" style="background-color: rgba(255,255,255); z-index: 9999"></Spin>
  </Layout>
</template>

<script>
import Vue from 'vue';
import sideMenu from "./components/side-menu/side-menu.vue";
import headerBar from "./components/header-bar/header-bar.vue";
import tagsNav from "./components/tags-nav.vue";
import user from "./components/user.vue";
import { mapMutations, mapActions } from "vuex";
import { getNewTagList, getNextName } from "../../libs/utils";
import appLogo from "../../assets/images/logo.png";
import { createSocket, addListener, closeSocket } from '../../util/webSocket';

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
      allValueTypes: {},
      collapsed: false,
      logo: appLogo,
      tab: 0,
      n_tab: 0,
      tabViews: {},
      tabComs: {},
      route: null,
      notCache: false,
      showIframe: false,
      indexUrl: '',
      appTitle: '',
      singleRoute: true,
      spinShow: false,
      spinShowHome: false,
    };
  },
  computed: {
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
      return this.tagNavList.length > 0
        ? this.tagNavList.filter(item => !(item.meta && item.meta.notCache)).map(item => item.name)
        : [];
    },
    menuList() {
      // return this.$store.getters.menuList;
      return this.$store.state.targetRouter;
    }
  },
  methods: {
    ...mapMutations(["setBreadCrumb", "setTagNavList", "addTag", "removeTag", "addRoute", "saveRoute"]),
    ...mapActions(["handleLogOut"]),

    toHome() {
      this.$router.push('/home')
    },

    updateFormRoute(className, viewName, params) {
        var route = this.$store.state.app.newRoutes.filter(item => item.children
        && item.children.length > 0 && item.children[0].meta
        && item.children[0].meta.className == className
        && item.children[0].meta.formName == viewName);
        if (route.length > 0) {
          if (route[0].children[0].meta && route[0].children[0].meta.copyViewName) route[0].children[0].meta.copyViewName = null;
          if (route[0].children[0].meta && route[0].children[0].meta.title) route[0].children[0].meta.title = route[0].children[0].meta.title.replace("创建", "修改");
          if(route[0].children[0].meta && params){
            route[0].children[0].meta.note = params.note;
            route[0].children[0].meta.viewDisplayName = params.displayName;
          }
        }
        var tag = this.$store.state.app.tagNavList.filter(item => item.meta
        && item.meta.className && item.meta.className == className
        && item.meta.formName && item.meta.formName == viewName);
        if (tag.length > 0) {
          tag[0].meta.title = tag[0].meta.title.replace("创建", "修改");
        }
        if (route.length + tag.length > 0) this.saveRoute();
    },

    goToNewFormCreate(flag, className, viewName, copyViewName, deviceType, viewDisplayName, note, classType) {
      console.log(flag, className, viewName, copyViewName, deviceType, viewDisplayName, note, classType);
        var route = this.$store.state.app.newRoutes.filter(item => item.children
        && item.children.length > 0 && item.children[0].meta
        && item.children[0].meta.className == className
        && item.children[0].meta.formName == viewName);
        if (route.length > 0) {
          if (deviceType && deviceType != "") route[0].children[0].meta.deviceType = deviceType
          if (copyViewName && copyViewName != "") route[0].children[0].meta.copyViewName = copyViewName;
          if (viewDisplayName && viewDisplayName != "") route[0].children[0].meta.viewDisplayName = viewDisplayName;
          if (note && note != "") route[0].children[0].meta.note = note;
          if (classType && classType != "") route[0].children[0].meta.classType = classType;
          // if (copyViewConfig) route[0].children[0].meta.copyViewConfig = copyViewConfig;
          if (!flag && route[0].children[0].meta && route[0].children[0].meta.title) route[0].children[0].meta.title = route[0].children[0].meta.title.replace("创建", "修改");
          this.saveRoute();
          this.turnToPage(route[0].children[0].name);
          return;
        }
        route = {
        path: "/form-engine",
        name: "form-engine",
        meta: {
            icon: "help-buoy",
            title: "表单模型",
            hideInMenu: true,
        },
        component: () => import("@/views/main/Main.vue"),
        children: [
            {
            path: `form-edit-${className}-${viewName}`,
            name: `form-edit-${className}-${viewName}`,
            meta: {
              copyViewName: copyViewName,
              className: className,
              formName: viewName,
              title: flag ? `创建表单-${className}-${viewName}` :
                  `修改表单-${className}-${viewName}`,
              path: 'form-engine/form-create.vue',
              deviceType: deviceType,
              viewDisplayName: viewDisplayName,
              note: note,
              classType: classType,
            },
          }
        ]
        }
        this.addRoute(route);
        this.$router.options.routes.push(route);
        this.$router.addRoutes([route]);
        this.turnToPage(`form-edit-${className}-${viewName}`);
    },
    goToBpmnEdit(id,proName) {
      console.log("goToBpmnEdit",id,proName)
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
              path: `bpmn-edit-${id}`,
              name: `bpmn-edit-${id}`,
              meta: {
                title: `bpmn流程编辑-${proName}`,
                id: id,
                path: "workflow/bpmn-edit.vue",
              },
          }]
        }
        this.addRoute(route);
        this.$router.options.routes.push(route);
        this.$router.addRoutes([route]);
        this.turnToPage(`bpmn-edit-${id}`);
      }
    },

    menuRefresh() {

      let name = this.tab;
      if (name in this.tabComs && this.tabComs[name].globalRefresh) {
        this.tabComs[name].globalRefresh();
      }

    },

    // 关闭全部/关闭其他
    handleTagsOption(name) {
      if (name == "close-all") {
        for (var i in this.tabComs) {
          if (this.tabComs[i].beforeLeave) this.tabComs[i].beforeLeave();
          this.tabComs[i].$destroy();
          delete this.tabComs[i];
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
      }
    },

    /*
     点击指定标签页,流程如下:
     1. 需要调用旧页面的beforeLeave函数
     2. 判断是否缓存,不缓存的话清除旧页面
     3. 判断新页面是否存在,存在的话调用activate,不存在的话生成
     */
    onTabClick(name) {
      if(sessionStorage.getItem('singleM') === 'true'){
        this.$refs.tab.$el.children[0].style.display = 'none';
        this.singleRoute = false;
        this.$nextTick(() => {
          this.spinShow = false;
          this.spinShowHome = false;
        })
      }else{
        this.$refs.tab.$el.children[0].style.display = 'block';
      }
      if(name != 'home') {
        this.$nextTick(() => {
          this.showIframe = false;
        })
        this.$refs.tab.$el.children[1].style.display = 'block';
      } else {
        let isHttpUrl = sessionStorage.getItem('indexPageUrlM') || localStorage.getItem('indexPageUrlM');
        if(isHttpUrl && isHttpUrl.indexOf('://') != -1) {
          this.indexUrl = isHttpUrl;
          this.showIframe = true;
          this.$refs.tab.$el.children[1].style.display = 'none';
          this.$nextTick(() => {
            this.spinShow = false;
            this.spinShowHome = false;
          })
        } else {
          this.showIframe = false;
        }
      }
      if (this.n_tab in this.tabComs && this.tabComs[this.n_tab].beforeLeave) this.tabComs[this.n_tab].beforeLeave();
      if (this.notCache && this.n_tab in this.tabComs) {
        this.tabComs[this.n_tab].$destroy();
        delete this.tabComs[this.n_tab];
        let index = this.tagNavList.findIndex(item => item.name == this.n_tab);
        if (index > -1) {
          let dom = this.$refs.tab.$el.children[1].children[index];
          for (var i = dom.children.length;i > 0;i--) {
            dom.removeChild(dom.children[i-1]);
          }
        }
      }
      this.tab = name;
      this.n_tab = name;
      this.notCache = this.$route.name == "error_404" ? this.route.meta.notCache : this.$route.meta.notCache;
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
      // 是否显示tabs
      let showTabs = sessionStorage.getItem('showTabs')
      if(showTabs === 'hide'){
        document.querySelector('.ivu-tabs-bar').style.display = 'none'
      }
      if (name in this.tabComs && this.tabComs[name].activate) this.tabComs[name].activate();

      if(!(name in this.tabViews)) {
        var item = this.tagNavList[index];
        if (item.meta.path) {
          this.tabViews[name] = Vue.extend(require('@/views/' + item.meta.path).default);
        }
      }
      if (!(name in this.tabComs) && name in this.tabViews) {
        this.tabComs[name] = new this.tabViews[name]({
          propsData: { route: this.$route.name == "error_404" ? this.route : this.$route, router: this.$router, store: this.$store, root: this, Message: this.$Message, echarts: this.$echarts},
        });
        for (var i = dom.children.length;i > 0;i--) dom.removeChild(dom.children[i-1]);
        let el = this.tabComs[name].$mount().$el;
        dom.appendChild(el);
      }
      // 隐藏tabs时，每次加载路由后关闭其他
      if(showTabs === 'hide'){
        this.handleTagsOption('close-others')
      }
      // 切换授权模块，解决高度不变问题
      this.$nextTick(() => {
        this.resizeHeight()
      })
    },
    resizeHeight(pageHeight = 76, topHeight = 0) {
        // 授权模块，ant table
        let antTableList = document.querySelectorAll('.ant-table-body')
        if(antTableList.length){
            antTableList.forEach((item) => {
                // 大小屏底部边距看起来不统一
                topHeight = item.parentNode.getBoundingClientRect().top
                item.style.overflow = 'auto'
                let hasEmpty = item.nextSibling
                if(hasEmpty !== null){
                    item.style.display = 'none'
                    hasEmpty.style.height = window.innerHeight - pageHeight - topHeight + 'px'
                }else{
                    item.style.display = 'block'
                    item.style.height = window.innerHeight - pageHeight - topHeight + 'px'
                }
            })
        }
    },
    /*
      移除标签
      需要删除旧页面,并跳转到下一个标签
     */
    onTabRemove(name) {
      if (name in this.tabComs) {
        if (this.tabComs[name].beforeLeave) this.tabComs[name].beforeLeave();
        this.tabComs[name].$destroy();
        delete this.tabComs[name];
      }
      let index = this.tagNavList.findIndex(item => item.name == name);
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
      if(name === 'home') {
        let isHttpUrl = sessionStorage.getItem('indexPageUrlM') || localStorage.getItem('indexPageUrlM');
        if(isHttpUrl && isHttpUrl.indexOf('://') != -1) {
          this.spinShowHome = true;
        }
      }
      let flag = name == this.$route.name;
      this.$router.replace({
        name: name
      });
      if (flag) this.routeChange(this.$route);
    },

    handleCollapsedChange(state) {
      this.collapsed = state;

      if(state) {
        // this.$refs.selfHead.$el.style.width = (document.body.clientWidth - 64) + 'px';
        this.$refs.selfHead.$el.style.width = 'calc(100% - 64px)';
      } else {
        // this.$refs.selfHead.$el.style.width = (document.body.clientWidth - 210) + 'px';
        this.$refs.selfHead.$el.style.width = 'calc(100% - 210px)';
      }
    },

    /*
     路由跳转函数,流程如下:
     1. 设置面包屑
     2. 设置标签栏
     3. 触发标签点选函数
     */
    routeChange(newRoute) {
      this.setBreadCrumb(newRoute.matched);
      this.setTagNavList(getNewTagList(this.tagNavList, newRoute));
      let that = this;
      if (this.$refs.tab.$el.children[1].children.length == this.tagNavList.length) this.onTabClick(newRoute.name);
      else setTimeout(() => that.onTabClick(newRoute.name),30);
    }
  },

  watch: {
    $route(newRoute) {
      this.routeChange(newRoute);
    }
  },

  created() {
    if(sessionStorage.getItem('singleM') === 'true'){
      this.spinShow = true;
      //   this.$refs.tab.$el.children[0].style.display = 'none';
      //   this.singleRoute = false;
      // }else{
      //   this.$refs.tab.$el.children[0].style.display = 'block';
    }
    let isHttpUrl = sessionStorage.getItem('indexPageUrlM') || localStorage.getItem('indexPageUrlM');
    if(!isHttpUrl) {
      this.showIframe = false;
    } else {
      if(isHttpUrl.indexOf('://') != -1) {
        this.indexUrl = isHttpUrl;
        // this.showIframe = true;
      } else {
        this.showIframe = false;
      }
    }
    this.appTitle = sessionStorage.getItem('appTitleM') || '清华数为';
    // 修改网页title
    const currentName = sessionStorage.getItem('appNameM');
    const currentTitle = sessionStorage.getItem('appTitleM');

    if(currentTitle != '') {
      document.title = currentTitle;
    }
    /**
     * @description 初始化设置面包屑导航和标签导航
     */
    this.logo = appLogo;

    const needDefault = sessionStorage.getItem('logoImgM');
    if(!needDefault || needDefault == '' || needDefault == 'null' || needDefault == null) {
      this.logo = appLogo;
    } else if(needDefault && needDefault.indexOf('modeler-web') != -1) {
      this.logo = appLogo;
    } else {
      this.logo = sessionStorage.getItem('logoImgM');
    }
    // ico文件追加
    var link = document.querySelector("link[rel*='icon']") || document.createElement('link');
    link.type = 'image/x-icon';
    link.rel = 'shortcut icon';
    link.href = sessionStorage.getItem('icoImgM');
    document.getElementsByTagName('head')[0].appendChild(link);

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
        if (this.tab != "error_404") break;
      }
    }

    // let wsUrl = "ws://192.168.1.81:9090/websocket?token=" + this.$store.state.user.token;
    // createSocket(wsUrl);
    // addListener('quit', (data) => {
    //   this.handleLogOut({}).then(() => {
    //       this.$store.state.user.token = '';
    //       this.$router.push({
    //         name: "login"
    //       });
    //     });
    //   closeSocket();
    // });
  },
  mounted() {
    this.handleCollapsedChange(false);
    this.n_tab = this.tab;
    this.notCache = this.$route.name == "error_404" ? this.route.meta.notCache : this.$route.meta.notCache;
    if (this.tagNavList.length > 0) {
      this.setTagNavList(getNewTagList(this.tagNavList, this.$route.name == "error_404" ? this.route : this.$route));
      let that = this;
      if (this.$refs.tab.$el.children[1].children.length == this.tagNavList.length) this.onTabClick(this.tab);
      else setTimeout(() => that.onTabClick(that.tab),30);
    }
  }
};
</script>
<style>
.ivu-message {
  z-index: 9999 !important;
}
.ivu-tabs-bar {
  margin-bottom: 0 !important;
}
.ace_editor {
  font-size: 14px !important;
}
.ivu-form-item-error-tip{
  font-size: 12px;
}
.ivu-select-dropdown-width100 form *::-webkit-scrollbar {
  width: 0;
  color: transparent;
  height: 8px;
}
.ivu-select-dropdown-width100 form *::-webkit-scrollbar-track {
  background-color: transparent;
  -webkit-border-radius: 2em;
  -moz-border-radius: 2em;
  border-radius: 2em;
}
.ivu-select-dropdown-width100 form *::-webkit-scrollbar-thumb {
  background-color: rgba(0,0,0,.3);
  -webkit-border-radius: 2em;
  -moz-border-radius: 2em;
  border-radius: 2em;
}
  /* .main-self-tab .ivu-tabs-bar {
    position: fixed !important;
    top: 64px !important;
    width: 88.2%;
    z-index: 996;
    background: #fff;
    border-bottom: none;
  }
  .main-self-tab .ivu-tabs-tabpane {
    position: relative;
    top: 40px;
  }
  .main-self-tab .ivu-tabs.ivu-tabs-card>.ivu-tabs-bar .ivu-tabs-nav-wrap {
    position: fixed !important;
    top: 64px !important;
    width: 84%;
    z-index: 996;
    background: #fff;
  }
  @media screen and (max-width: 1331px) {
    .main-self-tab .ivu-tabs-bar{
      width: 82.4%;
    }
    .main-self-tab .ivu-tabs.ivu-tabs-card>.ivu-tabs-bar .ivu-tabs-nav-wrap {
      width: 78%;
    }
  } */
  .clearfix:after {
    visibility: hidden;
    display: block;
    font-size: 0;
    content: " ";
    clear: both;
    height: 0;
  }
</style>

<style lang="less" scoped>
.main {
  .logo-con {
    height: 60px;
    display: inline-block;
    vertical-align: middle;
    /*padding: 10px;*/
    .min {
      height: 30px;
      width: auto;
      /*display: block;*/
      margin: 15px 0 0;
      vertical-align: middle;
    }
    .max {
      height: 40px;
      width: auto;
      float: left;
      /*display: block;*/
      margin: 10px 0 10px 15px;
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
    width: 89%;
    z-index: 800;
    background: #fff;
    padding: 0 20px;
  }

  // @media screen and (max-width: 1331px) {
  //   .header-con {
  //     width: 82.4%;
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
