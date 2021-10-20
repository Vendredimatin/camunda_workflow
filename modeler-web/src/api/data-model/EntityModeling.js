import axios from "../../libs/axios";

export default {
  getAllEntities: () => {
    return axios.get(`meta/entities`).then(res => {
      return res.data;
    });
  },
  getAllEntitiesWithAttr: (needAttributes, needSysAttr) => {
    return axios.get(`meta/entities?needAttributes=${needAttributes}&needSysAttr=${needSysAttr}`).then(res => {
      return res.data;
    });
  },
  getInternalEntities: () => {
    return axios.get(`meta/entities-internal`).then(res => {
      return res.data;
    });
  },
  getExternalEntities: () => {
    return axios.get(`meta/entities-external`).then(res => {
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

  createEntities: (data, isTree) => {
    return axios.post(`meta/entities-create?withParentOid=${isTree !== undefined ? isTree : false}`, data).then(res => {
      return res.data;
    });
  },
  deleteEntity: (name, cascade) => {
    return axios.post(`meta/entities-delete/${name}?cascade=${cascade}`).then(res => {
      return res.data;
    });
  },
  deleteProcess: (name) => {
    // return axios.get(global.baseUrl.replace('dwf/v1', '') + `service1/deleteByEnClass?ename=${name}`).then(res => {
    // return axios.post(`workflow/buildtime/delete-process-bindclass/${name}`).then(res => {
    return axios.post(`meta/workflow/check-process-bindclass/${name}`).then(res => {
      return res.data;
    });
  },
  updateEntity: data => {
    return axios.post(`meta/entities-update`, data).then(res => {
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
  getAttributesWithOutSys: name => {
    return axios.get(`meta/entities/${name}/attributes?needSysAttr=false`).then(res => {
      return res.data;
    });
  },
  bindAttributes: (name, attributes) => {
    return axios
      .post(`meta/entities/${name}/attributes-bind`, attributes)
      .then(res => {
        return res.data;
      });
  },
  bindCustomAttributes: (name, attributes) => {
    return axios
      .post(`meta/entities/${name}/custom-attributes-bind`, attributes)
      .then(res => {
        return res.data;
      });
  },
  updateAttribute: (name, data) => {
    return axios
      .post(`meta/entities/${name}/attributes-update`, data)
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
  },
  // getColumnsDetailsOfExtTableNew: (dataSourceOid, tableName) => {
  //   return axios
  //     .get(`meta/datasources/${dataSourceOid}/dbtables/${tableName}/columns-details`)
  //     .then(res => {
  //       return res.data;
  //     });
  // },
  getEntitiesAndAttr: (needAttributes, needHasAtt) => {
    return axios.get(`meta/entities?needAttributes=${needAttributes}&needHasAtt=${needHasAtt}`).then(res => {
      return res.data;
    });
  },
  getColumnsDetailsOfExtTableBySchema: (schemaName, tableName) => {
    return axios
      .get(`/meta/schemas/${schemaName}/dbtables/${tableName}/columns/details`)
      .then(res => {
        return res.data;
      });
  },
};

export const getAttributes = async function(name) {
  return await axios.get(`meta/entities/${name}/attributes`).then(res => {
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
//获取外部实体类
export const getExternalEntities = async function() {
  return axios.get(`meta/entities-external`).then(res => {
    return res.data;
  });
};
