import axios from "../../libs/axios";

export default {
  getAllValueTypes: () => {
    return axios.get(`meta/attribute-types`).then(res => {
      return res.data;
    });
  },
  getAllAttributes: () => {
    return axios.get(`meta/attributes`).then(res => {
      return res.data;
    });
  },
  createAttributes: data => {
    return axios.post(`meta/attributes-create`, data).then(res => {
      return res.data;
    });
  },
  deleteAttribute: name => {
    return axios.post(`meta/attributes-delete/${name}`).then(res => {
      return res.data;
    });
  },
  updateAttribute: data => {
    return axios.post(`meta/attributes-update`, data).then(res => {
      return res.data;
    });
  },
  getAttribute: name => {
    return axios.get(`meta/attributes/${name}`).then(res => {
      return res.data;
    });
  },
  getAttributeByClass: name => {
    return axios.get(`meta/class/${name}/attributes`).then(res => {
      return res.data
    })
  },
  getAttributeBindClasses: name => {
    return axios.get(`meta/attributes/${name}/bind-classes`).then(res => {
      return res.data;
    });
  },
  updateClassInfo: data => {
    return axios.post(`meta/classes-update`, data).then(res => {
      return res.data;
    });
  }
};

export const getAttribute = async function(name) {
  return await axios.get(`meta/attributes/${name}`).then(res => {
    return res.data;
  });
};
