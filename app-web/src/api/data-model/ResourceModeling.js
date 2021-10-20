import axios from "../../libs/axios";

export default {
  getDBSchema: dataSourceOid => {
    return axios.get(`meta/datasources/${dataSourceOid}/dbschema`).then(res => {
      return res.data;
    });
  },
  getDBSchemaTables: (dataSourceOid, schema) => {
    return axios.get(`meta/datasources/${dataSourceOid}/dbschema/${schema}/dbtables`).then(res => {
      return res.data;
    });
  },
  getAllExtTables: dataSourceOid => {
    return axios.get(`meta/datasources/${dataSourceOid}/dbtables`).then(res => {
      return res.data;
    });
  },
  getAllTables: () => {
    return axios
      .get(`meta/dbtables`, { params: { keyword: "plt" } })
      .then(res => {
        return res.data;
      });
  },
  getTableColumns: tableName => {
    return axios.get(`meta/dbtables/${tableName}/columns`).then(res => {
      return res.data;
    });
  },
  getAllResources: () => {
    return axios.get(`meta/resources`).then(res => {
      return res.data;
    });
  },
  getAllResourcesTree: () => {
    return axios.get(`meta/resources/tree`).then(res => {
      return res.data;
    });
  },
  getResource: name => {
    return axios.get(`meta/resources/${name}`).then(res => {
      return res.data;
    });
  },
  createResources: data => {
    return axios.post(`meta/resources-create`, data).then(res => {
      return res.data;
    });
  },
  deleteResource: name => {
    return axios.post(`meta/resources-delete/${name}`).then(res => {
      return res.data;
    });
  },
  updateResource: data => {
    return axios.post(`meta/resources-update`, data).then(res => {
      return res.data;
    });
  },
  getAttributes: name => {
    return axios.get(`meta/resources/${name}/attributes`).then(res => {
      return res.data;
    });
  },
  bindAttributes: (name, attrBindBOS) => {
    return axios
      .post(`meta/resources/${name}/attributes-bind`, attrBindBOS)
      .then(res => {
        return res.data;
      });
  },
  untieAttribute: (name, attributeName) => {
    return axios
      .post(`meta/resources/${name}/attributes-untie/${attributeName}`)
      .then(res => {
        return res.data;
      });
  },
  getResourceBindInfo: name => {
    return axios.get(`meta/resources/${name}/bind-info`).then(res => {
      return res.data;
    });
  },
  geBindInfoByOid: oid => {
    return axios.get(`meta/resources-bind-info/${oid}`).then(res => {
      return res.data;
    });
  },
  createBindInfo: data => {
    return axios.post(`meta/resources-bind-info`, data).then(res => {
      return res.data;
    });
  },
  deleteBindInfo: oid => {
    return axios.post(`meta/resources-bind-info-delete/${oid}`).then(res => {
      return res.data;
    });
  }
};
