import axios from "../../libs/axios";

export default {
  getAllDataSources: params => {
    return axios.get(`/meta/datasources`).then(res => {
      return res.data;
    });
  },
  createDataSource: data => {
    return axios.post(`/meta/datasources-create`, data).then(res => {
      return res.data;
    });
  },
  deleteDataSource: (oid, cascade) => {
    return axios.post(`/meta/datasources-delete/${oid}?cascade=${cascade}`).then(res => {
      return res.data;
    });
  },
  updateDataSource: data => {
    return axios.post(`/meta/datasources-update`, data).then(res => {
      return res.data;
    });
  },
  getDataSource: oid => {
    return axios.get(`/meta/datasources/${oid}`).then(res => {
      return res.data;
    });
  },
  getDataSourceConnectionState: oid => {
    return axios.get(`/meta/datasources-connection/${oid}`).then(res => {
      return res.data;
    });
  }
};
