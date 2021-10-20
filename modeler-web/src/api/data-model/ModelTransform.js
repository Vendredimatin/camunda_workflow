import axios from "../../libs/axios";

export default {
  getAllEntities: () => {
    return axios.get(`meta/classes/IdItem/children`).then(res => {
      return res.data;
    });
  },
  getAllRelations: () => {
    return axios.get(`meta/relations`).then(res => {
      return res.data;
    });
  },
  getAllResources: () => {
    return axios.get(`meta/resources`).then(res => {
      return res.data;
    });
  },
  transformAll: () => {
    return axios.get(`meta/classes/transform`).then(res => {
      return res.data;
    });
  },
  transformMulti: modelNameList => {
    return axios
      .get(`meta/classes/transform-multi`, {
        params: { modelNameList: modelNameList }
      })
      .then(res => {
        return res.data;
      });
  },
  transformAllEntities: name => {
    return axios.get(`meta/entities/transform`).then(res => {
      return res.data;
    });
  },
  transformAllRelations: name => {
    return axios.get(`meta/relations/transform`).then(res => {
      return res.data;
    });
  },
  transformAllResources: name => {
    return axios.get(`meta/resources/transform`).then(res => {
      return res.data;
    });
  }
};
