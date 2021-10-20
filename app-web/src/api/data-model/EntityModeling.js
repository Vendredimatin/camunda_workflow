import axios from "../../libs/axios";
import baseUrlAxios from "../../libs/baseUrlAxios";

export default {
  getAllEntities: () => {
    return axios.get(`meta/classes/IdItem/children`).then(res => {
      return res.data;
    });
  },
  getAllResources: () => {
    return axios.get(`meta/resources`).then(res => {
      return res.data;
    });
  },
  getEntity: name => {
    return axios.get(`meta/entities/${name}`).then(res => {
      return res.data;
    });
  },
  createEntities: data => {
    return baseUrlAxios.post(`meta/entities-create`, data).then(res => {
      return res.data;
    });
  },
  deleteEntity: (name, cascade) => {
    return baseUrlAxios.post(`meta/entities-delete/${name}?cascade=${cascade}`).then(res => {
      return res.data;
    });
  },
  updateEntity: data => {
    return baseUrlAxios.post(`meta/entities-update`, data).then(res => {
      return res.data;
    });
  },
  getBackwardRelations: name => {
    return axios.get(`meta/entities/${name}/backward-relations`).then(res => {
      return res.data;
    });
  },
  getForwardRelations: name => {
    return axios.get(`meta/entities/${name}/forward-relations`).then(res => {
      return res.data;
    });
  },
  getAttributes: name => {
    return axios.get(`meta/entities/${name}/attributes`).then(res => {
      return res.data;
    });
  },
  bindAttributes: (name, attributeNames) => {
    return axios
      .post(`meta/entities/${name}/attributes-bind`, attributeNames)
      .then(res => {
        return res.data;
      });
  },
  untieAttribute: (name, attributeName) => {
    return axios
      .post(`meta/entities/${name}/attributes-untie/${attributeName}`)
      .then(res => {
        return res.data;
      });
  },
  getClassForms: name => {
    return axios.get(`meta/class/${name}/views`).then(res => {
      return res.data;
    });
  },
  getColumnsDetailsOfDbTable: tableName => {
    return axios.get(`meta/dbtables/${tableName}/columns/details`).then(res => {
      return res.data;
    });
  },
  getColumnsDetailsOfExtTable: (dataSourceOid, tableName) => {
    return axios
      .post(`meta/datasources/${dataSourceOid}/dbtable-column-details`, [tableName])
      .then(res => {
        return res.data;
      });
  }
};

export const getAttributes = name => {
  return axios.get(`meta/entities/${name}/attributes`).then(res => {
    return res.data;
  });
};

export const getEntity = async function(name) {
  return await axios.get(`meta/entities/${name}`).then(res => {
    return res.data;
  });
};

// 获取所有实体类/关联类/资源类的类名
export const getAllClassNamesMin = async function(name) {
  return await axios.get(`meta/class-names-min`).then(res => {
    return res.data;
  });
};

