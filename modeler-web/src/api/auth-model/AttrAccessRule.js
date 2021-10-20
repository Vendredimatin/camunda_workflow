import axios from "../../libs/axios";

export default {
  getAllConditions: () => {
    return axios.get(`meta/attribute-rules`).then(res => {
      return res.data;
    });
  },
  createConditions: data => {
    return axios.post(`meta/attribute-rules-create`, data).then(res => {
      return res.data;
    });
  },
  deleteCondition: condOid => {
    return axios.post(`meta/attribute-rules-delete/${condOid}`).then(res => {
      return res.data;
    });
  },
  deleteConditionCascade: (condOid, cascade) => {
    return axios.post(`meta/attribute-rules-delete/${condOid}?cascade=${cascade}`).then(res => {
      return res.data;
    });
  },
  updateCondition: data => {
    return axios.post(`meta/attribute-rules-update`, data).then(res => {
      return res.data;
    });
  }
};
