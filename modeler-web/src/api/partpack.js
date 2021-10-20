import axios from "../libs/anotherAxios";
import global_ from "../views/global.vue";

let baseUrlOther = global_.baseUrlOther;

/**
 * @description 获取装配列表
 */
export const getAllParts = () => {
  return axios.get(`${baseUrlOther}/part/assemble`);
};

// 装配模型包 是否分步装配
export const assemblePart = (params, needseparated) => {
  return axios.post(`${baseUrlOther}/part/assemble?separated=${needseparated}`, params).then(res => {
    return res.data;
  });
};

// 分步编译重启
// export const separatedAssemble = (argv) => {
//     return axios.post(`${baseUrlOther}/part/separated-assemble/${argv}`).then(res => {
//         return res.data;
//     });
// };

// 上传插件包
export const uploadPart = (params) => {
  return axios.post(`${baseUrlOther}/part/uploadPart?cover=true&coverModelPackage=true`, params ? params : {}).then(res => {
    return res.data;
  });
};
// 上传SDK
export const uploadSdk = (params) => {
  return axios.post(`${baseUrlOther}/part/uploadPart?cover=true&coverModelPackage=true`, params ? params : {}).then(res => {
    return res.data;
  });
};

// 下载插件包
export const loadPart = (name) => {
  return axios.get(`${baseUrlOther}/part/downloadPart/${name}`).then(res => {
    return res.data;
  });
};

// 上传SDK
export const uploadSDK = (params) => {
  return axios.post(`${baseUrlOther}/part/uploadSdk`, params).then(res => {
    return res.data;
  });
};

// 升级SDK
export const upgradeSDK = () => {
  return axios.post(`${baseUrlOther}/part/upgradeSdk`).then(res => {
    return res.data;
  });
};

// 重启服务器
export const restartServer = () => {
  return axios.post(`${baseUrlOther}/part/restart`).then(res => {
    return res.data;
  });
};

/**
 * @description 删除插件包
 */
export const delPluginPac = (name, delFlag) => {
  return axios.post(`${baseUrlOther}/part/delete/${name}?force=${delFlag}`);
};

// // 下载插件
// export const loadPlugin = params => {
//     return axios.post(`${baseUrlOther}/part/download`, params).then(res => {
//         return res.data;
//     });
// };

/**
 * @description 获取日志
 */
export const loadLog = (type) => {
  return axios.get(`${baseUrlOther}/part/log/${type}`);
};

// 升级SDK
// export const upgradeSdk = sdkFile => {
//     return axios.post(`${baseUrlOther}/part/upgrade`, sdkFile).then(res => {
//         return res.data;
//     });
// };
