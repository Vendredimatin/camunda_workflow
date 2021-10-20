import axios from "../libs/blobAxios";
import global_ from "../views/global.vue";

let baseUrlOther = global_.baseUrlOther;

// 下载插件
export const loadPlugin = params => {
  return axios.post(`${baseUrlOther}/part/download`, params).then(res => {
    return res.data;
  });
};
