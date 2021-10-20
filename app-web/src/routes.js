import Main from "./views/main/Main.vue";
import Home from "./views/Home.vue";
import userSetting from "./views/userSetting.vue";
import ChooseApp from "./views/ChooseApp.vue";
import SystemAddin from "./views/main/SystemAddin.vue";
import global_ from "@/views/global.vue";

let curVersion = global_.versionTime;
let lastVersion = localStorage.getItem('lastAppVersion') || '';

let lastAppIp = localStorage.getItem('lastAppIP') || '';
let curAppIp = window.location.host;

if(!sessionStorage.getItem('selfLoginName') || sessionStorage.getItem('selfLoginName') == null) {
  sessionStorage.setItem('selfLoginName', 'login');
}

if(!sessionStorage.getItem('appTitle') || sessionStorage.getItem('appTitle') == null) {
  sessionStorage.setItem('appTitle', '清华数为');
}

if(!sessionStorage.getItem('skinStyle') || sessionStorage.getItem('skinStyle') == null) {
  sessionStorage.setItem('skinStyle', 'light');
}

if(!sessionStorage.getItem('appDirection') || sessionStorage.getItem('appDirection') == null) {
  sessionStorage.setItem('appDirection', '左右任务栏布局');
}

if(!sessionStorage.getItem('indexPageUrl') || sessionStorage.getItem('indexPageUrl') == null) {
  sessionStorage.setItem('indexPageUrl', 'home');
}

// 不同IP 不同版本 清空缓存
if(curVersion != lastVersion || curAppIp != lastAppIp) {
  console.log('不同版本')
  localStorage.clear();
  sessionStorage.clear();

  sessionStorage.setItem('selfLoginName', 'login');
  sessionStorage.setItem('appTitle', '清华数为');
  sessionStorage.setItem('skinStyle', 'light');
  sessionStorage.setItem('appDirection', '左右任务栏布局');
  sessionStorage.setItem('indexPageUrl', 'home');
}

if(!lastVersion || lastVersion == '') {
  localStorage.setItem('lastAppVersion', global_.versionTime);
}
if(!lastAppIp || lastAppIp == '') {
  localStorage.setItem('lastAppIP', window.location.host);
}

let LOGINNAME = sessionStorage.getItem('selfLoginName') || 'login';

let ALLRoutes = [
  {
    path: `/${LOGINNAME}`,
    name: "login",
    meta: {
      title: "Login - 登录",
      hideInMenu: true
    },
    component: () => import("./views/Login.vue")
  },
  {
    path: "/",
    name: "index",
    redirect: "/home",
    component: Main,
    meta: {
      title: "首页",
      hideInMenu: true,
      notCache: true
    },
    children: [
      {
        path: "/home",
        name: "home",
        meta: {
          title: "首页",
          hideInMenu: true,
        },
        component: Home
      },
      {
        path: "/userSetting",
        name: "userSetting",
        component: userSetting,
        meta: {
          title: "设置",
          hideInMenu: true,
          notCache: true
        }
      },
      {
        path: "/systemAddin",
        name: "systemAddin",
        component: SystemAddin,
        meta: {
          title: "系统操作视图",
          hideInMenu: true,
          notCache: true
        }
      },
      // {
      //   path: "/forms/:className/:formName",
      //   name: "form-engine",
      //   component: () => import("./views/form-engine/forms-engine.vue")
      // }
        ]
  },
  {
    path: "/chooseApp",
    name: "chooseApp",
    component: ChooseApp,
    meta: {
      title: "选择应用",
      hideInMenu: true,
      notCache: true
    }
  },
  {
    path: "/forms/:className/:formName",
    name: "form-engine",
    component: () => import("./views/form-engine/forms-engine.vue")
  },
  {
    path: "/401",
    name: "error_401",
    component: () => import("./views/error-page/401.vue")
  },
  {
    path: "/500",
    name: "error_500",
    component: () => import("./views/error-page/500.vue")
  },
  {
    path: "*",
    name: "error_404",
    component: Main
  },
  // {
  //   path: "*",
  //   name: "error_404",
  //   component: () => import("./views/error-page/404.vue")
  // },
  {
    path: "/about",
    name: "about",
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: () => import("./views/About.vue")
  }
];

if (Config.registerAddinName && Config.registerAddinName !== '') {
  let name = Config.registerAddinName;
  try{
    require(`@/assemble_components/operation/${name}/register.vue`);

    let registerRoutes = [
      {
        path: `/register`,
        name: `register`,
        meta: {
          title: "Register - 注册",
          hideInMenu: true
        },
        component: () => import(`@/assemble_components/operation/${name}/register.vue`)
      },
      {
        path: `/findPass`,
        name: `findPass`,
        meta: {
          title: "FindPassword - 找回密码",
          hideInMenu: true
        },
        component: () => import(`@/assemble_components/operation/${name}/findPass.vue`)
      },
      {
        path: `/registerSuccess`,
        name: `registerSuccess`,
        meta: {
          title: "RegisterSuccess - 注册成功",
          hideInMenu: true
        },
        component: () => import(`@/assemble_components/operation/${name}/registerSuccess.vue`)
      },
      {
        path: `/resetPass`,
        name: `resetPass`,
        meta: {
          title: "ResetPassword - 修改密码",
          hideInMenu: true
        },
        component: () => import(`@/assemble_components/operation/${name}/resetPass.vue`)
      },
      {
        path: `/active`,
        name: `active`,
        meta: {
          title: "Active - 激活",
          hideInMenu: true
        },
        component: () => import(`@/assemble_components/operation/${name}/active.vue`)
      }];
      let loginRoute = ALLRoutes.filter(x => {return x.name == 'login'});
      loginRoute[0].component = () => import(`@/assemble_components/operation/${name}/login.vue`)
      ALLRoutes = ALLRoutes.concat(registerRoutes)
  }
  catch(err){
    console.log(err)
  }

}

export default ALLRoutes;