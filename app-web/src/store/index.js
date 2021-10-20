import Vue from "vue";
import Vuex from "vuex";

import user from "./module/user";
import app from "./module/app";
import DWF_form from "./module/DWF_form";
import DWF_customer from "./module/DWF_customer";
import DWF_global from "./module/DWF_global";

import Main from "../views/main/Main.vue";
import Home from "../views/Home.vue";
import userSetting from "../views/userSetting.vue";

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    targetRouter: null,
    // 缓存实体类列表
    entitiesList: [],
    // 缓存关联类
    relationsList: [],
    orginalP: [
      {
        path: "/login",
        name: "login",
        meta: {
          title: "Login - 登录",
          hideInMenu: true
        },
        component: () => import("../views/Login.vue")
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
              notCache: true
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
          }
        ]
    },
    {
        path: "/forms/:className/:formName",
        name: "form-engine",
        component: () => import("../views/form-engine/forms-engine.vue")
    },
      {
        path: "/401",
        name: "error_401",
        component: () => import("../views/error-page/401.vue")
      },
      {
        path: "/500",
        name: "error_500",
        component: () => import("../views/error-page/500.vue")
      },
      {
        path: "*",
        name: "error_404",
        component: () => import("../views/error-page/404.vue")
      },
      {
        path: "/about",
        name: "关于",
        // route level code-splitting
        // this generates a separate chunk (about.[hash].js) for this route
        // which is lazy-loaded when the route is visited.
        component: () => import("../views/About.vue")
      }
    ]
  },
  mutations: {},
  actions: {},
  modules: {
    user,
    app,
    DWF_form,
    DWF_customer,
    DWF_global
  }
});
