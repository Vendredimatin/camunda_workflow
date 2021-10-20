import axios from "../../libs/axios";

export default {
  getAllItems: () => {
    return axios.get(`auth/items`).then(res => {
      return res.data;
    });
  },
  createItem: data => {
    return axios.post(`auth/items-create`, data).then(res => {
      return res.data;
    });
  },
  deleteItem: authName => {
    return axios.post(`auth/items-delete/${authName}`).then(res => {
      return res.data;
    });
  },
  updateItem: data => {
    return axios.post(`auth/items-update`, data).then(res => {
      return res.data;
    });
  },
  getItem: authName => {
    return axios.get(`auth/items/${authName}`).then(res => {
      return res.data;
    });
  }
};
