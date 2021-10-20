import axios from "../../libs/axios";
import global_ from "../../views/global.vue";
import baseUrlAxios from "../../libs/baseUrlAxios";

let baseUrl = global_.baseUrl;
let baseObjOther = global_.baseObjOther;

export default {
  getAllDataSources: params => {
    return axios
      .get(`${baseUrl}/meta/datasources`, params ? params : {})
      .then(res => {
        return res.data;
      });
  },
  createDataSources: data => {
    return baseUrlAxios
      .post(`meta/datasources-create`, data)
      .then(res => {
        return res.data;
      });
  },
  deleteDataSources: oid => {
    return baseUrlAxios
      .post(`meta/datasources-delete/${oid}`)
      .then(res => {
        return res.data;
      });
  },
  updateDataSources: data => {
    return baseUrlAxios
      .post(`meta/datasources-update`, data)
      .then(res => {
        return res.data;
      });
  },
  getDataSource: oid => {
    return axios
      .get(`${baseUrl}/meta/datasources/${oid}`)
      .then(res => {
        return res.data;
      });
  },
  getDataSourceConnectionState: oid => {
    return axios.get(`${baseUrl}/meta/datasources-connection/${oid}`).then(res => {
      return res.data;
    });
  }
};
