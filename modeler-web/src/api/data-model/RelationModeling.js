import axios from "../../libs/axios";

export default {
  getAllClassNames: () => {
    return axios.get(`meta/class-names-min`).then(res => {
      return res.data;
    });
  },
  getAllRelationsWithoutAttributes: () => {
    return axios.get(`meta/classes/Relation/children`).then(res => {
      return res.data;
    });
  },
  getAllRelations: () => {
    return axios.get(`meta/relations`).then(res => {
      return res.data;
    });
  },
  getAllRelationsTree: () => {
    return axios.get(`meta/relations/tree`).then(res => {
      return res.data;
    });
  },
  getRelation: name => {
    return axios.get(`meta/relations/${name}`).then(res => {
      return res.data;
    });
  },

  createRelations: data => {
    return axios.post(`meta/relations-create`, data).then(res => {
      return res.data;
    });
  },
  deleteRelation: (name, cascade) => {
    return axios.post(`meta/relations-delete/${name}?cascade=${cascade}`).then(res => {
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
  updateRelation: data => {
    return axios.post(`meta/relation-update`, data).then(res => {
      return res.data;
    });
  },
  getAttributes: name => {
    return axios.get(`meta/relations/${name}/attributes`).then(res => {
      return res.data;
    });
  },
  bindAttributes: (name, attributes) => {
    return axios
      .post(`meta/relations/${name}/attributes-bind`, attributes)
      .then(res => {
        return res.data;
      });
  },
  updateAttribute: (name, data) => {
    return axios
      .post(`meta/relations/${name}/attributes-update`, data)
      .then(res => {
        return res.data;
      });
  },
  untieAttribute: (name, attributeName) => {
    return axios
      .post(`meta/relations/${name}/attributes-untie/${attributeName}`)
      .then(res => {
        return res.data;
      });
  }
};

export const getRelation = async function(name) {
  return await axios.get(`meta/relations/${name}`).then(res => {
    return res.data;
  });
};

export const getRelationAttributes = async function(name) {
  return await axios.get(`meta/relations/${name}/attributes`).then(res => {
    return res.data;
  });
};
