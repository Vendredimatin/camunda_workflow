import { login, getUserInfo } from "../../api/user";
import { getUserGroup } from "../../api/others";

export default {
  state: {
    displayName: '',
    username: "",
    logoSrc: "",
    userId: "",
    token: "",
    access: "",
    userGroups: [],
    oid: "",
    // appInfo: {},
    // job: [],
  },
  mutations: {
    setUserId(state, id) {
      sessionStorage.setItem("userId", id);
      sessionStorage.setItem("oid", id);
      state.userId = id;
      state.oid = id;
    },
    setGroup(state, userGroups) {
      sessionStorage.setItem("userGroups", JSON.stringify(userGroups));
      state.userGroups = userGroups;
    },
    setDisplayName(state, displayName) {
      sessionStorage.setItem("displayName", displayName);
      state.displayName = displayName;
    },
    setUsername(state, name) {
      sessionStorage.setItem("username", name);
      state.username = name;
    },
    setLogo(state, url) {
      sessionStorage.setItem("logoSrc", url);
      state.logoSrc = url;
    },
    setAccess(state, access) {
        sessionStorage.setItem("access", access);
      state.access = access;
    },
    setToken(state, token) {
      sessionStorage.setItem("token", token);
      state.token = token;
      // setToken(token);
    }
  },
  actions: {
    // 登录
    handleLogin({ state, commit }, { username, password }) {
      if (username === undefined) return;
      username = username.trim();
      return new Promise((resolve, reject) => {
        login({
          username,
          password
        }).then(res => {
            const headers = res.headers;
            commit("setToken", headers.authorization);
            localStorage.setItem("uToken", headers.authorization);
            resolve();
          })
          .catch(err => {
            reject(err);
          });
      });
    },
    // 退出登录
    handleLogOut({ state, commit }) {
      return new Promise((resolve, reject) => {
        // logout(state.token)
        //   .then(() => {
        //     commit("setToken", "");
        //     commit("setAccess", []);
        //     resolve();
        //   })
        //   .catch(err => {
        //     reject(err);
        //   });
        // 如果你的退出登录无需请求接口，则可以直接使用下面三行代码而无需使用logout调用接口
        commit("setToken", "");
        commit("setAccess", []);
        commit("setGroup", []);
        commit("setUsername",'');
        commit("setUserId", '');
        commit("setDisplayName", '');
        // sessionStorage.tagNaveList = [];
        // sessionStorage.job = [];
        sessionStorage.clear();
        localStorage.setItem("indexPageUrlM", '');
        localStorage.setItem("uToken", '');
        resolve();
      });
    },
    // 获取用户相关信息
    getUserInfo({ state, commit }) {
      return new Promise((resolve, reject) => {
        getUserInfo()
        .then(async res => {
          const data = res.data;
          commit("setUsername", data.userName);
          commit("setUserId", data.userOid);
          commit("setDisplayName", data.userDisplayName);
          // commit("setAccess", data.access);
          let group = [];
          group = await getUserGroup(data.userOid);
          commit("setGroup", group.data.data);
          

          resolve(data);
        })
        .catch(err => {
          reject(err);
        });
      });
    },
  }
};
