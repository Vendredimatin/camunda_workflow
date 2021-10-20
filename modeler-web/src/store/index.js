import Vue from "vue";
import Vuex from "vuex";
import userModule from './user_module'
import routerModule from './router_module'
// import Sync from "vuex-router-sync";

import user from "./module/user";
import app from "./module/app";

import DWF_customer from './module/DWF_customer';
import DWF_form from './module/DWF_form';
import DWF_global from './module/DWF_global';
import authRules from './module/authRules';

import echart from "./module/echart";
Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    // 缓存系统操作列表
    operationData: [],
    // 缓存实体类列表
    entitiesList: [],
    // 缓存关联类
    relationsList: []
  },
  mutations: {},
  actions: {},
  modules: {
    user,
    app,
    userModule,
    routerModule,
    DWF_customer,
    DWF_form,
    DWF_global,
    authRules,
    echart
  }
});
