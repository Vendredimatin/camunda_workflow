import axios from "../libs/axios";

export default {
  getAllModules: (params) => {
    return axios.get(`meta/modules${params}`).then(res => {
      return res.data;
    });
  },

  getModuleOperations: name => {
    return axios.get(`meta/modules/${name}/operations`).then(res => {
      return res.data;
    });
  }
};
