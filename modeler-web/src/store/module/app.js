import {
  getBreadCrumbList,
  setTagNavListInLocalstorage,
  getMenuByRouter,
  getTagNavListFromLocalstorage,
  getHomeRoute
} from "../../libs/utils";
import routers from "../../routers";
import Vue from 'vue';
export default {
  state: {
    breadCrumbList: [],
    tagNavList: [],
    homeRoute: getHomeRoute(routers),
    newRoutes: [],
  },
  getters: {
    menuList: (state, getters, rootState) => {
      // let newRouters = JSON.parse(window.sessionStorage.job) ? JSON.parse(window.sessionStorage.job).concat(routers) : routers;
      return getMenuByRouter(routers, rootState.user.access)
    }
  },
  mutations: {
    setBreadCrumb(state, routeMatched) {
      state.breadCrumbList = getBreadCrumbList(routeMatched);
    },
    setTagNavList(state, list) {
      if (list) {
        state.tagNavList = [...list];
        setTagNavListInLocalstorage([...list]);
      } else state.tagNavList = getTagNavListFromLocalstorage();
    },
    addTag(state, item, type = "unshift") {
      const {
        name,
        path,
        meta
      } = item;
      if (state.tagNavList.findIndex(tag => tag.name === item.name) < 0) {
        if (type === "push") state.tagNavList.push({ name, path, meta });
        else state.tagNavList.unshift({ name, path, meta });
        setTagNavListInLocalstorage([...state.tagNavList]);
      }
    },
    removeTag(state, item) {
      let index = state.tagNavList.findIndex(tag => tag.name === item.name);
      if (index > -1) {
        state.tagNavList.splice(index, 1);
        setTagNavListInLocalstorage([...state.tagNavList]);
      }
    },
    addRoute(state, route) {
      state.newRoutes.push({
        ...route,
        component: null
      });
      sessionStorage.newRoutesM = JSON.stringify(state.newRoutes);
      sessionStorage.setItem('newRoutesM', JSON.stringify(state.newRoutes));
    },
    saveRoute(state) {
      sessionStorage.newRoutesM = JSON.stringify(state.newRoutes);
      sessionStorage.setItem('newRoutesM', JSON.stringify(state.newRoutes));
      sessionStorage.tagNaveListM = JSON.stringify(state.tagNavList);
    }
  }
};
