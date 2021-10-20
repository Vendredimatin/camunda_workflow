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
    return axios.get(`meta/dbtables`).then(res => {
      return res.data;
    });
  },
  getTableColumns: tableName => {
    return axios.get(`meta/dbtables/${tableName}/columns`).then(res => {
      return res.data;
    });
  },
};
