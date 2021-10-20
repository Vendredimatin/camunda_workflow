import axios from "../../libs/axios";

export default {
  getAllRules: () => {
    return axios.get(`auth/rules`).then(res => {
      return res.data;
    });
  },
  getAllRulesById: id => {
    return axios.get(`auth/rules?userId=${id}`)
  },
  getConflictRules: () => {
    return axios.get(`auth/rules-conflict`).then(res => {
      return res.data;
    });
  },
  createRules: data => {
    return axios.post(`auth/rules-create`, data).then(res => {
      return res.data;
    });
  },
  deleteRule: ruleOid => {
    return axios.post(`auth/rules-delete/${ruleOid}`).then(res => {
      return res.data;
    });
  },
  getInvalidRules: () => {
    return axios.get(`auth/rules-invalid`).then(res => {
      return res.data;
    });
  },
  updateRule: data => {
    return axios.post(`auth/rules-update`, data).then(res => {
      return res.data;
    });
  },
  // TODO: move functions below to meta/org
  getAllClassNames: () => {
    return axios.get(`meta/class-names`).then(res => {
      return res.data;
    });
  },
  getAllClassAttributes: classname => {
    return axios.get(`meta/class/${classname}/attributes`).then(res => {
      return res.data;
    });
  },
  getAllGroups: () => {
    return axios.get(`org/groups`).then(res => {
      return res.data;
    });
  },
  getAllUsers: () => {
    return axios.get(`org/users`).then(res => {
      return res.data;
    });
  }
};
