import axios from "../../libs/axios";

export default {
  getObjAccessRule: (roleOid, className) => {
    return axios.get(`meta/object-rules/roles/${roleOid}/classes/${className}`).then(res => {
      return res.data;
    });
  },
  createObjAccessRule: data => {
    return axios.post(`meta/object-rules-create`, data).then(res => {
      return res.data;
    });
  },
  deleteObjAccessRule: ruleId => {
    return axios.post(`meta/object-rules-delete/${ruleId}`).then(res => {
      return res.data;
    });
  },
  updateObjAccessRule: data => {
    return axios.post(`meta/object-rules-update`, data).then(res => {
      return res.data;
    });
  }
};
