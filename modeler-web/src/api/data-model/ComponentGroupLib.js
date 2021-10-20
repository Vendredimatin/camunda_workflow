import axios from "../../libs/axios";

export const getComponentGroups = async () => {
  return await axios.get(`meta/component/componentGroups`).then(res => {
    return res.data;
  });
};

export const createComponentGroups = async data => {
  return await axios.post(`meta/component/component-groups-create`, data).then(res => {
    return res.data;
  });
};

export const updateComponentGroups = async data => {
  return await axios.post(`meta/component/component-groups-update`, data).then(res => {
    return res.data;
  });
};

export const deleteComponentGroups = async id => {
  return await axios.post(`meta/component/component-groups-delete/${id}`).then(res => {
    return res.data;
  });
};

export const createComponent = async data => {
  return await axios.post(`meta/component/components-create`, data).then(res => {
    return res.data;
  });
};

export const deleteComponent = async oid => {
  return await axios.post(`meta/component/component-delete/${oid}`).then(res => {
    return res.data;
  });
};

export const updateComponent = async data => {
  return await axios.post(`meta/component/component-update`, data).then(res => {
    return res.data;
  });
};

export const getComponentByGroupId = async id => {
  return await axios.get(`meta/component/get-components-by-component-group/${id}`).then(res => {
    return res.data;
  });
};

export const comp2compgroupUpdate = async data => {
  return await axios.post(`meta/component/comp2compgroup-update`, data).then(res => {
    return res.data;
  });
};

export const getComp2compgroupTree = async () => {
  return await axios.get(`meta/component/get-tree?needV3Content=false`).then(res => {
    return res.data;
  });
};
