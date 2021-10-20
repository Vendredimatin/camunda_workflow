import axios from "../../libs/axios";

export default {
  getAllConditions: () => {
    return axios.get(`auth/conditions`).then(res => {
      return res.data;
    });
  },
  createConditions: data => {
    return axios.post(`auth/conditions-create`, data).then(res => {
      return res.data;
    });
  },
  deleteCondition: condOid => {
    return axios.post(`auth/conditions-delete/${condOid}`).then(res => {
      return res.data;
    });
  },
  updateCondition: data => {
    return axios.post(`auth/conditions-update`, data).then(res => {
      return res.data;
    });
  },
  getCondition: condOid => {
    return axios.get(`auth/conditions/${condOid}`).then(res => {
      return res.data;
    });
  },
  validCondition: condOid => {
    return axios.get(`auth/conditions/${condOid}/valid`).then(res => {
      return res.data;
    });
  }
};
