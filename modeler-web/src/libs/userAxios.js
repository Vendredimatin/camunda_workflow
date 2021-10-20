import axios from "axios";
import store from "../store";
import global_ from "../views/global.vue";
import { Message } from "iview";

const instance = axios.create({
  baseURL: global_.baseUrl,
  withCredentials: true
});

instance.interceptors.request.use(
  config => {
    config.headers.Authorization = store.state.user.token;
    // Spin.show()
    // 在发送请求之前做些什么
    return config;
  },
  error => {
    // 对请求错误做些什么
    return Promise.reject(error);
  }
);

instance.interceptors.response.use(
  res => {
    if (res.data !== "" && res.data.code !== 200) {
    //   Message.error(res.data.message);
      return Promise.reject(res.data.message);
    }
    return res;
  },
  error => {
    if (!error.status) {
    //   Message.error("服务内部错误");
    } else if (error.response.data.code >= 500) {
    //   Message.error("服务内部错误");
    }
    // 对响应错误做点什么
    return Promise.reject(error);
  }
);

export default instance;
