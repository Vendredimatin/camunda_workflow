import Vue from "vue";
import App from "./App.vue";
import Router from "vue-router";
import routes from "./routes";
import store from "./store";
import iView from "view-design";
import iViewPro from './libs/iview-pro/iview-pro.min.js';
import "view-design/dist/styles/iview.css";
import './libs/iview-pro/iview-pro.css';
import ZkTable from "vue-table-with-tree-grid";
import VueParticles from "vue-particles";
import "./styles/common.less";
import "./styles/index.less"
import { getMenuByRouter } from "./libs/utils";

import 'ag-grid-community/dist/styles/ag-grid.css';
import 'ag-grid-community/dist/styles/ag-theme-balham.css';

import Main from "./views/main/Main.vue";
// import Home from "./views/Home.vue";
// import userSetting from "./views/userSetting.vue";

import echarts from 'echarts';
import 'echarts/map/js/china';
import 'echarts/map/js/world';
import 'echarts/extension/bmap/bmap';
import 'echarts/extension/dataTool';
// import VueCodeMirror from 'vue-codemirror-lite';
// import 'codemirror/lib/codemirror.css'
import "ag-grid-enterprise";
import { LicenseManager } from "ag-grid-enterprise";
import global_ from "@/views/global.vue";
import FormAddinList from "@/ext_components/form/FormAddinList";
import modal from "@/libs//mixin.js"

// LicenseManager.setLicenseKey("Tsinghua_University__MultiApp_4Devs9_November_2019__MTU3MzI1NzYwMDAwMA==eb8acd282bd9a262a4c2c7116e18e698");
LicenseManager.setLicenseKey("CompanyName=Tsinghua University,LicensedGroup=NELBDS,LicenseType=MultipleApplications,LicensedConcurrentDeveloperCount=2,LicensedProductionInstancesCount=0,AssetReference=AG-009077,ExpiryDate=22_July_2021_[v2]_MTYyNjkwODQwMDAwMA==e67e21bb98dc9e73b6c226c44c4dec61");

Vue.use(modal)
// Vue.use(VueCodeMirror);
Vue.use(iView);
Vue.use(iViewPro);
Vue.use(VueParticles);
Vue.use(ZkTable);
Vue.use(Router);
Vue.component('FormAddinList', FormAddinList);

Vue.prototype.$echarts = echarts;

var parser = new UAParser();

window.DWFBROESERNAME = parser.getBrowser().name;
const SupportBrowser = DWFBROESERNAME === 'Chrome' || DWFBROESERNAME === 'Firefox' || DWFBROESERNAME === 'Chrome Headless';
// let currentAppName = localStorage.getItem('changeAppName') || 'app-web';
// ???????????????????????????????????????????????????????????? ?????????sessionStorage???AppName ???????????????????????????IP??????appName?????????
let currentAppName = '';
console.log('main.js', location.href);

// ??????app?????????modeler????????????user
if(location.href.indexOf('token=') != -1) {

  let searchStr = location.search;

  searchStr = searchStr.slice(1);
  let searchObj = {};
  let searchArr = searchStr.split('&');
  searchArr.forEach(val => {

      let sKey = val.split('=')[0];
      let sVal = val.split('=')[1];
      searchObj[sKey] = sVal;

  })
  sessionStorage.setItem("userToken", searchObj.token);

}

// modeler???????????????????????????
if(location.href.indexOf('openAppName=') != -1) {

  let appInfo = location.search.split('?')[1];
  let openName = appInfo.split('=')[1] || 'default';
  localStorage.setItem('changeAppName', openName);

}

let curVersion = global_.versionTime;
let lastVersion = localStorage.getItem('lastAppVersion') || '';
if(!lastVersion || lastVersion == '') {
  localStorage.setItem('lastAppVersion', global_.versionTime);
  sessionStorage.setItem('skinStyle', 'light');
}
// ??????IP ???????????? ??????appid
if(curVersion != lastVersion) {
  currentAppName = Config.baseRouteName;
  sessionStorage.tagNaveList = '[]';
  sessionStorage.job = '[]';
  localStorage.job = '[]';
  localStorage.setItem('changeAppName', '')
  sessionStorage.setItem('appName', Config.baseRouteName);
  sessionStorage.setItem('skinStyle', 'light');
}

// let reAppName = sessionStorage.getItem('appName');
// let reTag = sessionStorage.getItem('tagNaveList');
// let reChangeAppName = localStorage.getItem('changeAppName');

// if(reTag && reAppName) {
//   currentAppName = reAppName;
// } else if(reChangeAppName && reChangeAppName != '') {
//   currentAppName = reChangeAppName;
// } else {
//   currentAppName = Config.baseRouteName;
// }

let APPNAME = Config.baseRouteName;
// if(currentAppName == 'app-web' || currentAppName == Config.baseRouteName || currentAppName == 'app-mobile' || currentAppName == 'default' || currentAppName == null || currentAppName == 'null') {
//   APPNAME = Config.baseRouteName
// } else {
//   APPNAME = `${Config.baseRouteName}/${currentAppName}`

// }

if(location.href.indexOf('token=') != -1 && location.href.indexOf('shareName=') != -1) {
  console.log('ready')
  sessionStorage.setItem('chooseToAbout', null);

  let searchStr = location.search;
  let curUrl = 'default';
  if(searchStr != '') {
    searchStr = searchStr.slice(1);
    let searchObj = {};
    let searchArr = searchStr.split('&');
    searchArr.forEach(val => {

      let sKey = val.split('=')[0];
      let sVal = val.split('=')[1];
      searchObj[sKey] = sVal;

    })
    curUrl = searchObj.shareName;
    sessionStorage.setItem("shareAboutName", curUrl);
    sessionStorage.setItem("shareFullPath", searchObj.sharePath);
    sessionStorage.setItem("shareAboutToken", searchObj.token);
    // if(searchObj.query) {
    //   let deQuery = decodeURIComponent(searchObj.query);
    //   sessionStorage.setItem('searchQuery', deQuery);
    // }
    // console.log(searchObj.sharePath)
  }

  store.dispatch("getUserInfo").then(user => {
    console.log('readyDispatch')
    // ????????????????????????
    // let hasShareName = sessionStorage.getItem('shareAppName')
    // if(hasShareName) {
    //   if(hasShareName != 'default') {
    //     APPNAME = `${Config.baseRouteName}/${hasShareName}`
    //   }
    // }

  });

}

const registerNames = [
  'register',
  'findPass',
  'registerSuccess',
  'resetPass',
  'active'
]

const router = new Router({
  routes,
  base: `/${APPNAME}`,
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

router.beforeEach(async (to, from, next) => {
  //?????????????????????
  if(!SupportBrowser){
    if(to.name !== LOGIN_PAGE_NAME){
      next({
        replace: true,
        name: LOGIN_PAGE_NAME // ??????????????????
      });
    } else if (to.name === LOGIN_PAGE_NAME) {
      next();
    }
  }else{
    iView.LoadingBar.start();
    // if (IS_LOCKED && to.name !== LOCK_PAGE_NAME) {
    //   // ????????????????????????????????????????????????????????????????????????
    //   next({
    //     replace: true, // ????????????????????????
    //     name: LOCK_PAGE_NAME
    //   });
    // } else if (IS_LOCKED && to.name === LOCK_PAGE_NAME) {
    //   // ????????????????????????????????????????????????????????????
    //   next(false); // ????????????
    // } else {

    // if(to.fullPath.indexOf('?token=') != -1 && 'token' in to.query) {

    //   if(location.href.indexOf('app-web/') != -1) {

    //     let curUrl = location.href.split('app-web')[1].slice(1).split('/')[0];
    //     console.log(curUrl)

    //     store.dispatch("getUserInfo").then(user => {
    //       // ????????????????????????????????????????????????????????????name??????????????????????????????;access??????????????????????????????['super_admin'] ['super_admin', 'admin']
    //       console.log(11666777, router)
    //     });

    //   }

    // }

    // ?????????????????????????????????????????????
    if (!store.state.user.userId) {
      const userId = sessionStorage.getItem("userId");
      store.state.user.userId = userId;
    }
    if (!store.state.user.username) {
      const username = sessionStorage.getItem("username");
      store.state.user.username = username;
    }
    if (!store.state.user.access) {
      const access = sessionStorage.getItem("access");
      store.state.user.access = access;
    }
    if (!store.state.user.token) {
      const token1 = sessionStorage.getItem("token");
      store.state.user.token = token1;
    }
    if (!store.state.user.token) {
      const token2 = window.localStorage.getItem("token");
      store.state.user.token = token2;
    }
    if (!store.state.user.userGroups) {
      const userGroups = JSON.parse(window.localStorage.getItem("userGroups"));
      store.state.user.userGroups = userGroups;
    }
    // if(!token && global_.developMode){
    //   let formData = {
    //     username: global_.username,
    //     password: global_.password
    //   };
    //   await store.dispatch("handleLogin", formData);
    //   await store.dispatch("getUserInfo");
    // }
    // ??????????????????token
    var token = null;
    if ("token" in to.query) token = to.query.token;
    else if (store.state.user.token) token = store.state.user.token;
    else if (sessionStorage.getItem("shareAboutToken")) token = sessionStorage.getItem("shareAboutToken");
    else if (sessionStorage.getItem("token")) token = sessionStorage.getItem("token");
    else {
      var ck = document.cookie.split(";");
      for (var i = 0;i < ck.length;i++) {
        var c = ck[i].split('=');
        if (c[0] == 'token') token = c[1];
      }
    }
    store.state.user.token = token;

    // token???????????????
    // if (token) {
    //   try {
    //     await axios.get('org/current-user-environment');
    //   } catch (e) {
    //     token = null;
    //     console.log("error:", e);
    //   }
    // }

    if(to.name == 'logout' || to.name == 'login') {
      store.state.user.token = null;
      router.options.routes = [];
      store.state.targetRouter = [];
      window.sessionStorage.job = '[]';
      sessionStorage.tagNaveList = '[]';
      window.localStorage.job = '[]';
      sessionStorage.removeItem('userId');
      sessionStorage.removeItem('username');
      sessionStorage.removeItem('access');
      sessionStorage.removeItem('token');
      window.localStorage.removeItem('token');
      // next();
    }
    //?????????????????????token???????????????????????????
    let tokenSearch = false;
    let params = location.search.substring(1).split('&');
    if(params && params.length !== 0){
      params.forEach(param => {
        if(param.match('token')){
          tokenSearch = true;
        }
      })
    }
    //????????????token
    if(token && tokenSearch && !store.state.user.oid){
      await store.dispatch("getUserInfo");
      console.log(store)
    }
    if(token) {

      // ?????????????????????
      //fix bug 6632
      if(to.name == 'error_404' && to.fullPath.indexOf('/forms/') != -1) {
        let fullP = to.fullPath.match(/forms(\S*)/)[1];
        next({ path: `/forms${fullP}` })
        return
      }

      // ??????????????????
      console.log(router.options.routes)
      if (((router.options.routes.length == 8 && router.options.routes[0].name == 'login') || (router.options.routes.length == 13 && router.options.routes[8].name == 'register')) && window.sessionStorage.job) {
        var localRouter = JSON.parse(window.sessionStorage.job);
        store.state.app.newRoutes = localRouter;
        for (var i = 0;i < localRouter.length;i++) {
          if (localRouter[i].children) {
            for(var j = 0;j < localRouter[i].children.length;j++) {
              let action = localRouter[i].children[j].meta.action;
              if (action in actionToView) localRouter[i].children[j].component = null
              else localRouter[i].children[j].component = () => import("@/views/main/SystemAddin.vue")
            }
            localRouter[i].component = Main
          }
        }
        router.options.routes = localRouter.concat(router.options.routes);
        var compare = function (prop) {
          return function (obj1, obj2) {
            var val1 = obj1[prop];
            var val2 = obj2[prop];
            if (val1 < val2) {
              return -1;
            } else if (val1 >  val2) {
              return 1;
            } else {
              return 0;
            }
          }
        }
        router.options.routes.sort(compare('pIndex'));
        router.addRoutes(localRouter);
        store.state.targetRouter = getMenuByRouter(router.options.routes);
        if (localStorage.newAppRoutes) {
          let newRoutes = JSON.parse(localStorage.newAppRoutes);
          newRoutes.forEach(x => x.component = Main);
          router.options.routes = newRoutes.concat(router.options.routes);
          router.addRoutes(newRoutes);
        }
      }

      // console.log(to, from, localRouter, router.options.routes);
    }
    // store.state.targetRouter = getMenuByRouter(router.options.routes);
    // console.log(store.state.targetRouter);
    console.log(token, to, from)
    if (!token && registerNames.indexOf(to.name) > -1) {
      next();
    } else if (!token && to.name !== LOGIN_PAGE_NAME) {
      sessionStorage.setItem('noTokenPath', to.path)
      // ?????????????????????????????????????????????
      next({
        replace: true,
        name: LOGIN_PAGE_NAME // ??????????????????
      });
    } else if (!token && to.name === LOGIN_PAGE_NAME) {
      // ??????????????????????????????????????????
      next(); // ??????
    } else if (to.name === LOGIN_PAGE_NAME) {
      // ??????????????????????????????????????????
      next({
        replace: true,
        name: "home" // ?????????home???
      });
    } else {

      if(to.fullPath.indexOf('/index.html') != -1 && to.fullPath.indexOf('?') != -1) {
        let searchKey = decodeURIComponent(to.fullPath.split('?')[1]).replace(Config.baseRouteName, '').slice(2);

        console.log(searchKey)

        // ?????????????????????????????????????????????
        next({
          replace: true,
          name: searchKey || 'home'// ?????????home???
        });
      } else {

        if(to.name == null || to.matched.length == 0) {
          next({
            replace: true,
            name: 'home'// ?????????home???
          });
        } else {
          next();
        }

      }
      // ?????????????????????????????????????????????
      // next();
      // store.dispatch("getUserInfo").then(user => {
      //   // ????????????????????????????????????????????????????????????name??????????????????????????????;access??????????????????????????????['super_admin'] ['super_admin', 'admin']
      //   if (canTurnTo(to.name, user.access, routes)) next();
      //   // ?????????????????????
      //   else next({ replace: true, name: "error_401" }); // ????????????????????????401??????
      // });
    }
    // }
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

// ???Date??????????????? Date ????????????????????????String
// ???(M)??????(d)?????????(h)??????(m)??????(s)?????????(q) ????????? 1-2 ???????????????
// ???(y)????????? 1-4 ?????????????????????(S)????????? 1 ????????????(??? 1-3 ????????????)
// ?????????
// (new Date()).Format("yyyy-MM-dd hh:mm:ss.S") ==> 2006-07-02 08:09:04.423
// (new Date()).Format("yyyy-M-d h:m:s.S")      ==> 2006-7-2 8:9:4.18
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
