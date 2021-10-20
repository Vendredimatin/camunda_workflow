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
  },
  mutations: {
    setUserId(state, id) {
      sessionStorage.setItem("userIdM", id);
      sessionStorage.setItem("oidM", id);
      state.userId = id;
      state.oid = id;
    },
    setDisplayName(state, displayName) {
      sessionStorage.setItem("displayNameM", displayName);
      state.displayName = displayName;
    },
    setGroup(state, userGroups) {
      sessionStorage.setItem("userGroupsM", JSON.stringify(userGroups));
      state.userGroups = userGroups;
    },
    setUsername(state, name) {
      sessionStorage.setItem("usernameM", name);
      state.username = name;
    },
    setAccess(state, access) {
      sessionStorage.setItem("accessM", access);
      state.access = access;
    },
    setToken(state, token) {
      sessionStorage.setItem("tokenM", token);
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
        })
          .then(res => {
            const headers = res.headers;
            commit("setToken", headers.authorization);
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
        sessionStorage.clear();
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
    }
  }
};
