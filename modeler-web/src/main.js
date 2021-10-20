import Vue from "vue";
import App from "./App.vue";
import Main from './views/main/Main.vue';
import Router from "vue-router";
import routes from "./routers";
import {singleRoutes} from "./single-routers";
import store from "./store";
import axios from "@/libs/axios";
import iView from "view-design";
import iViewPro from '@/libs/iview-pro/iview-pro.min.js';
// import 'vant/lib/index.css';

// import ZkTable from "vue-table-with-tree-grid";
import TreeTable from 'tree-table-vue';
import VueParticles from "vue-particles";
import "./styles/common.less";
import global_ from "./views/global.vue";
import login from "./views/Login";
import 'ag-grid-community/dist/styles/ag-grid.css';
import 'ag-grid-community/dist/styles/ag-theme-balham.css';
import VueClipboard from 'vue-clipboard2';
import echarts from 'echarts';
import 'echarts/map/js/china';
import 'echarts/map/js/world';
import 'echarts/extension/bmap/bmap';
import 'echarts/extension/dataTool';
// import VueCodeMirror from 'vue-codemirror-lite';
// import 'codemirror/lib/codemirror.css'
import "ag-grid-enterprise";
import { LicenseManager } from "ag-grid-enterprise";
// LicenseManager.setLicenseKey("Tsinghua_University__MultiApp_4Devs9_November_2019__MTU3MzI1NzYwMDAwMA==eb8acd282bd9a262a4c2c7116e18e698");
LicenseManager.setLicenseKey("CompanyName=Tsinghua University,LicensedGroup=NELBDS,LicenseType=MultipleApplications,LicensedConcurrentDeveloperCount=2,LicensedProductionInstancesCount=0,AssetReference=AG-009077,ExpiryDate=22_July_2021_[v2]_MTYyNjkwODQwMDAwMA==e67e21bb98dc9e73b6c226c44c4dec61");
import VueHighlightJS from 'vue-highlightjs';
import {getMenuByRouter} from "@/libs/utils";
import FormAddinList from "@/ext_components/form/FormAddinList";
import "view-design/dist/styles/iview.css";
import '@/libs/iview-pro/iview-pro.css';
import './styles/index.less';
// 模态框出现，其他区域禁止操作的属性添加
import modal from "@/libs//mixin.js"
import * as monaco from "monaco-editor";
import Vant from 'vant';
import 'vant/lib/index.css';
import 'vant/lib/icon/local.css';
import 'vant/lib/icon/index.css';
import MobileFormAddinList from "@/ext_mobile_components/form/FormAddinList";

// import { DatetimePicker } from 'vant';
// import 'vant/lib/index.css';

// Vue.use(DatetimePicker);

Vue.use(Vant);
Vue.use(modal)
Vue.use(VueHighlightJS)
Vue.use(VueClipboard)
Vue.use(iView);
Vue.use(iViewPro);
Vue.use(VueParticles);
Vue.use(TreeTable)
// Vue.use(ZkTable);
Vue.use(Router);
Vue.component('FormAddinList', FormAddinList);
Vue.component('MobileFormAddinList', MobileFormAddinList);
// Vue.use(VueCodeMirror);
Vue.prototype.GLOBAL = global_;
Vue.prototype.$echarts = echarts;
Array.prototype.move = function(from, to) {
  this.splice(to, 0, this.splice(from, 1)[0]);
  return this;
};
const originalPush = Router.prototype.push;
Router.prototype.push = function push(location) {
  return originalPush.call(this, location).catch(err => err)
}

// 禁用默认库的提示
monaco.languages.typescript.javascriptDefaults.setCompilerOptions({ noLib: true, allowNonTsExtensions: true });

// 注册语言提示器--联想
monaco.languages.registerCompletionItemProvider('javascript', {
  triggerCharacters: ['.'],
  provideCompletionItems: (model, position, context, token) => {
    // 获取当前行数
    const line = position.lineNumber;
    // 获取当前列数
    const column = position.column;
    // 获取当前输入行的所有内容
    const content = model.getLineContent(line);
    //javascript脚本msgbox字符提示
    if(content.substring(column - 8, column) === 'msgbox.'){
      return {
        suggestions: DWFMONACOEDITOR.getCustomCompletionMsgBox(monaco)
      };
    }
    //javascript脚本user字符提示
    if(content.substring(column - 6, column) === 'user.'){
      return {
        suggestions: DWFMONACOEDITOR.getCustomCompletionUser(monaco)
      };
    }
    //javascript脚本args字符提示
    if(content.substring(column - 6, column) === 'args.'){
      return {
        suggestions: DWFMONACOEDITOR.getCustomCompletionArgs(monaco)
      };
    }
    //javascript脚本env字符提示
    if(content.substring(column - 5, column) === 'env.'){
      return {
        suggestions: DWFMONACOEDITOR.getCustomCompletionEnv(monaco)
      };
    }
    //java脚本omf字符提示
    if(DWFMONACOEDITOR.type === 'java' && content.substring(column - 5, column) === 'omf.'){
      return {
        suggestions: DWFMONACOEDITOR.getCustomJavaOmfCompletion(monaco)
      };
    }
    //java脚本env字符提示
    if(DWFMONACOEDITOR.type === 'java' && content.substring(column - 5, column) === 'env.'){
      return {
        suggestions: DWFMONACOEDITOR.getCustomJavaEnvCompletion(monaco)
      };
    }
    //java脚本ex字符提示
    if(DWFMONACOEDITOR.type === 'java' && content.substring(column - 4, column) === 'ex.'){
      return {
        suggestions: DWFMONACOEDITOR.getCustomJavaExCompletion(monaco)
      };
    }
    //java脚本user字符提示
    if(DWFMONACOEDITOR.type === 'java' && content.substring(column - 6, column) === 'user.'){
      return {
        suggestions: DWFMONACOEDITOR.getCustomJavaUserCompletion(monaco)
      };
    }
    if(DWFMONACOEDITOR.type === 'java' && content.substring(column - 11, column) === 'websocket.'){
      return {
        suggestions: DWFMONACOEDITOR.getCustomJavaWebsocketCompletion(monaco)
      };
    }
    //java脚本.字符提示
    if(DWFMONACOEDITOR.type === 'java'){
      return {
        suggestions: DWFMONACOEDITOR.getCustomJavaThisCompletion(monaco)
      };
    }
    //javascript脚本.字符提示
    return {
      suggestions: DWFMONACOEDITOR.getCustomCompletionJS(monaco)
    };
  },
})
monaco.languages.registerCompletionItemProvider('html', {
  triggerCharacters: ['.'],
  provideCompletionItems: (model, position, context, token) => {
    // 获取当前行数
    const line = position.lineNumber;
    // 获取当前列数
    const column = position.column;
    // 获取当前输入行的所有内容
    const content = model.getLineContent(line);
    if(content.substring(column - 9, column) === 'dwf_ctx.'){
      return {
        suggestions: DWFMONACOEDITOR.getCustomHTMLDwfCtxCompletion(monaco)
      };
    }
    return {
      suggestions: DWFMONACOEDITOR.getCustomHTMLThisCompletion(monaco)
    };
  },
})

var parser = new UAParser();

window.DWFBROESERNAME = parser.getBrowser().name;
var SupportBrowser = DWFBROESERNAME === 'Chrome' || DWFBROESERNAME === 'Firefox' || DWFBROESERNAME === 'Chrome Headless';
const router = new Router({
  routes,
  base: `/${Config.baseRouteName}`,
  mode: "history"
});
// const LOCK_PAGE_NAME = "lock_page";
const LOGIN_PAGE_NAME = "login";
// const IS_LOCKED = getLockStatus();
const actionToView = {
  list: "Multi",
  implement: "Implement",
  create: "Create",
  creates: "Creates",
  visit: "Single",
  edit: "SingleEdit",
  url: "Url",
  folder: "Folder"
};
let hasRight = true
router.beforeEach(async (to, from, next) => {
  //不支持的浏览器
  if(!SupportBrowser){
    if(to.name !== LOGIN_PAGE_NAME){
      next({
        replace: true,
        name: LOGIN_PAGE_NAME // 跳转到登录页
      });
    } else if (to.name === LOGIN_PAGE_NAME) {
      next();
    }
  }else{
    iView.LoadingBar.start();
    // if (IS_LOCKED && to.name !== LOCK_PAGE_NAME) {
    //   // 当前是锁定状态并且用户要跳转到的页面不是解锁页面
    //   next({
    //     replace: true, // 重定向到解锁页面
    //     name: LOCK_PAGE_NAME
    //   });
    // } else if (IS_LOCKED && to.name === LOCK_PAGE_NAME) {
    //   // 当前未锁定且用户要跳转到的页面是解锁页面
    //   next(false); // 不做跳转
    // } else {
    // next();
    // return;

    // 刷新页面时从缓存中加载用户信息
    if (!store.state.user.userId) {
      const userId = sessionStorage.getItem("userIdM");
      store.state.user.userId = userId;
    }
    if (!store.state.user.username) {
      const username = sessionStorage.getItem("usernameM");
      store.state.user.username = username;
    }
    if (!store.state.user.access) {
      const access = sessionStorage.getItem("accessM");
      store.state.user.access = access;
    }
    if (!store.state.user.token) {
      const token1 = sessionStorage.getItem("tokenM");
      store.state.user.token = token1;
    }
    if(!token && global_.developMode){
      let formData = {
        username: global_.username,
        password: global_.password
      };
      await store.dispatch("handleLogin", formData);
      await store.dispatch("getUserInfo");
      let LoginVue = Vue.extend(login);
      await new LoginVue({
        propsData: {
          extendRouter: router,
          extendStore: store,
        },
      }).getModuleById(`C9C2F20D1EBA4A4FA4B6FA47C0F04D20`);
    }
    // 从多方面获取token
    var token = null;
    if ("token" in to.query) token = to.query.token;
    else if (store.state.user.token) token = store.state.user.token;
    else {
      var ck = document.cookie.split(";");
      for (var i = 0;i < ck.length;i++) {
        var c = ck[i].split('=');
        if (c[0] == 'token') token = c[1];
      }
    }
    store.state.user.token = token;
    let tokenSearch = false;
    let params = location.search.substring(1).split('&');
    if(params && params.length !== 0){
      params.forEach(param => {
        if(param.match('token')){
          sessionStorage.setItem("tokenM", param.split('=')[1]);
          token = store.state.user.token = param.split('=')[1];
          tokenSearch = true;
        }
        if(param.match('single')){
          sessionStorage.setItem("singleM", param.split('=')[1]);
        }else{
          sessionStorage.setItem("singleM", false);
        }
      })
    }
    // token有效性校验
    if (token) {
      try {
        await axios.get('org/current-user-environment');
      } catch (e) {
        token = null;
        sessionStorage.setItem("tokenM", '');
        history.replaceState ? history.replaceState(null, null, window.location.href.split('?token')[0]) : '';
      }
    }
    store.state.user.token = token;

    token = store.state.user.token;
    //url带token参数 & 无用户信息 ****classType判断 避免打开新表单刷新页面时 重复调用登录页面的事件逻辑
    if(token && tokenSearch && !store.state.user.oid && (location.href.indexOf('classType') == -1 || location.href.indexOf('designClass') == -1)){
      await store.dispatch("getUserInfo");
      let LoginVue = Vue.extend(login);
      hasRight = await new LoginVue({
        propsData: {
          extendRouter: router,
          extendStore: store,
        },
      }).getModuleById(`C9C2F20D1EBA4A4FA4B6FA47C0F04D20`);
      // 当前用户是否有modeler权限，如没有，跳转登录
      if(!hasRight && to.path !== '/login'){
        next(false)
        // await store.dispatch("handleLogOut").then(() => {
          router.push('/login')
        // })
      }
    }
    if (token) {
      // 加载动态路由
      if (router.options.routes.length == 7) {
        if(sessionStorage.getItem('jobM')){
          let target = JSON.parse(sessionStorage.getItem('jobM'));
          // store.state.app.newRoutes = target;
          for (var i = 0;i < target.length;i++) {
            if (target[i].children) {
              for(var j = 0;j < target[i].children.length;j++) {
                let action = target[i].children[j].meta.action;
                if (action in actionToView) target[i].children[j].component = null
              }
              target[i].component = Main
            }
          }
          router.options.routes = target.concat(router.options.routes);
          var compare = function (prop) {

            return function (obj1, obj2) {
              var val1 = obj1[prop];
              var val2 = obj2[prop];
              if (val1 < val2) {
                return -1;
              } else if (val1 > val2) {
                return 1;
              } else {
                return 0;
              }
            }
          }
          router.options.routes.sort(compare('pIndex'));
          router.addRoutes(target);
          store.state.targetRouter = [];
          store.state.targetRouter = getMenuByRouter(router.options.routes);
        }
        if(sessionStorage.getItem('newRoutesM')){
          let newRoutes = JSON.parse(sessionStorage.getItem('newRoutesM'));
          newRoutes.forEach(x => {
            x.component = Main;
          });
          store.state.app.newRoutes = newRoutes;
          router.options.routes = newRoutes.concat(router.options.routes);
          router.addRoutes(newRoutes);
        }
      }

      // ico文件追加
      var link = document.querySelector("link[rel*='icon']") || document.createElement('link');
      link.type = 'image/x-icon';
      link.rel = 'shortcut icon';
      link.href = sessionStorage.getItem('icoImgM');
      document.getElementsByTagName('head')[0].appendChild(link);
    }

    if (!token && to.name !== LOGIN_PAGE_NAME) {
      // 未登录且要跳转的页面不是登录页
      next({
        replace: true,
        name: LOGIN_PAGE_NAME // 跳转到登录页
      });
    } else if (!token && to.name === LOGIN_PAGE_NAME) {
      // 未登陆且要跳转的页面是登录页
      next(); // 跳转
    } else if (token && to.name === LOGIN_PAGE_NAME) {
      // 已登录且要跳转的页面是登录页
      next({
        replace: true,
        name: "home" // 跳转到home页
      });
    } else {

      // 配合nginx路由处理
      if(to.fullPath.indexOf('/index.html') != -1 && to.fullPath.indexOf('?') != -1) {
        let searchKey = decodeURIComponent(to.fullPath.split('?')[1]).replace(Config.baseRouteName, '').slice(2);

        if(searchKey.indexOf('/') != -1) {
          searchKey = searchKey.split('/')[1];
        }

        // 已登录且要跳转的页面不是登录页
        next({
          replace: true,
          name: searchKey || 'home'// 跳转到home页
        });
      } else {
        next();
      }

      // TODO: add user access restriction
      // next();
      // store.dispatch("getUserInfo").then(user => {
      //   // 拉取用户信息，通过用户权限和跳转的页面的name来判断是否有权限访问;access必须是一个数组，如：['super_admin'] ['super_admin', 'admin']
      //   if (canTurnTo(to.name, user.access, routes)) next();
      //   // 有权限，可访问
      //   else next({ replace: true, name: "error_401" }); // 无权限，重定向到401页面
      // });
    }
    // }x
  }
});

router.afterEach(to => {
  iView.LoadingBar.finish();
  window.scrollTo(0, 0);
});

new Vue({
  el: "#app",
  router,
  store,
  render: h => h(App)
});


Date.prototype.format = function(format) {
  var date = {
      "M+": this.getMonth() + 1,
      "d+": this.getDate(),
      "h+": this.getHours(),
      "m+": this.getMinutes(),
      "s+": this.getSeconds(),
      "q+": Math.floor((this.getMonth() + 3) / 3),
      "S+": String(this.getMilliseconds()).padStart(3, '0')
  };
  if (/(y+)/i.test(format)) {
      format = format.replace(RegExp.$1, (this.getFullYear() + '').substr(4 - RegExp.$1.length));
  }
  for (var k in date) {
      if (new RegExp("(" + k + ")").test(format)) {
          format = format.replace(RegExp.$1, RegExp.$1.length == 1 ?
              date[k] : ("00" + date[k]).substr(("" + date[k]).length));
      }
  }
  return format;
}
