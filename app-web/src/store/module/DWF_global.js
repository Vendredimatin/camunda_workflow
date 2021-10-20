import { getDWFAppConfig } from "../../api/others";
import global_ from '../../views/global.vue';

var ip = location.host;
var idx = ip.indexOf(":");
ip = idx == -1 ? ip : ip.substring(0, idx);
const serverConfig = global_;
// initial state
const state = {
  // 用户信息
  username: "",
  userId: "",
  token: "",
  access: "",
  // 需要全局保存的数据
  exampleData: [],
  // 模块和操作组成的功能树
  exampleMenu: [],
  serverIp: ip,
  serverURL: `${ip}:${location.port}`,
  serverPort: location.port,
  metaServicePort: new URL(serverConfig.baseUrl).port,
  objServicePort: new URL(serverConfig.baseObjOther).port,
  serverHost: location.port,
  appConfig: {},
}

// getters
const getters = {}

// mutations
const mutations = {
  setUserId(state, id) {
    state.userId = id;
  },
  setAppConfig(state, appConfig) {
    state.appConfig = appConfig;
  },
  setUsername(state, name) {
    state.username = name;
  },
  setAccess(state, access) {
    state.access = access;
  },
  setToken(state, token) {
    state.token = token;
  },
  setExampleData(state, exampleData) {
    state.exampleData = exampleData;
  },
  setExampleMenu(state, exampleMenu) {
    state.exampleMenu = exampleMenu;
  }
}

// actions
const actions = {
  async getDWFAppConfig({ state, commit }) {
    //初始化DWF第三方组件集成配置
    try{
      let appConfig = await getDWFAppConfig();
      if(appConfig.data.code === 200 && appConfig.data.success){
        appConfig = appConfig.data.data;
        commit("setAppConfig", appConfig)
      }
    }catch (e) {
      console.log('初始化DWF第三方组件集成配置失败')
    }
  },
}

export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations
}
