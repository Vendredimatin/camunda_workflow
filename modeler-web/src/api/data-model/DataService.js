import axios from "../../libs/axios";

export const getAllDataSources = (params) => {
    return axios.get(`/data-service/datasources`).then(res => {
      return res.data;
    });
};
export const getAllDataSourcesByIp = (params) => {
    return axios.get(`/data-service/datasources-groupby-serverip`).then(res => {
      return res.data;
    });
};
export const createDataSource = (data) => {
    return axios.post(`/data-service/datasources-create`, data).then(res => {
      return res.data;
    });
};
export const deleteDataSource = (oid, cascade) => {
    return axios.post(`/data-service/datasources-delete/${oid}?cascade=${cascade}`).then(res => {
      return res.data;
    });
};
export const updateDataSource = (data) => {
    return axios.post(`/data-service/datasources-update`, data).then(res => {
      return res.data;
    });
};
export const getDataSource = (oid) => {
    return axios.get(`/data-service/datasources/${oid}`).then(res => {
      return res.data;
    });
};
export const getDataSourceConnectionState = (oid) => {
    return axios.get(`/data-service/datasources-connection/${oid}`).then(res => {
      return res.data;
    });
};
export const getTables = (oid) => {
    return axios.get(`/data-service/datasources-detect-tables/${oid}`).then(res => {
        return res.data;
      });
}

export const getColumns = (oid, schemaName, tableName) => {
    return axios.get(`/data-service/datasources-detect-columns/${oid}?schemaName=${schemaName}&tableName=${tableName}`).then(res => {
        return res.data;
      });
}

export const getExtClass = (oid, schemaName, tableName) => {
  return axios.get(`/data-service/entities-external/datasource/${oid}/schema/${schemaName}/table/${tableName}`).then(res => {
      return res.data;
    });
}
export const checkExtClass = (oid, schemaName, tableName) => {
  return axios.get(`/data-service/datasources-check/${oid}/schema/${schemaName}/table/${tableName}`).then(res => {
      return res.data;
    });
}