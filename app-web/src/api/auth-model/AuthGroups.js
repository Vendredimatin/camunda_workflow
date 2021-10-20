import axios from "../../libs/axios";

export default {
  getAllGroupToSubgroups: () => {
    return axios.get(`auth/group-to-subgroups`).then(res => {
      return res.data;
    });
  },
  getAllGroups: () => {
    return axios.get(`auth/groups`).then(res => {
      return res.data;
    });
  },
  createGroup: data => {
    return axios.post(`auth/groups-create`, data).then(res => {
      return res.data;
    });
  },
  deleteGroup: groupName => {
    return axios.post(`auth/groups-delete/${groupName}`).then(res => {
      return res.data;
    });
  },
  updateGroup: data => {
    return axios.post(`auth/groups-update`, data).then(res => {
      return res.data;
    });
  },
  getGroup: groupName => {
    return axios.get(`auth/groups/${groupName}`).then(res => {
      return res.data;
    });
  },
  getGroupItems: groupName => {
    return axios.get(`auth/groups/${groupName}/items`).then(res => {
      return res.data;
    });
  },
  createGroupItem: (groupName, data) => {
    return axios
      .post(`auth/groups/${groupName}/items-create`, data)
      .then(res => {
        return res.data;
      });
  },
  deleteGroupItem: (groupName, authName) => {
    return axios
      .post(`auth/groups/${groupName}/items-delete/${authName}`)
      .then(res => {
        return res.data;
      });
  },
  getSubGroups: groupName => {
    return axios.get(`auth/groups/${groupName}/subgroups`).then(res => {
      return res.data;
    });
  },
  createSubGroup: (groupName, data) => {
    return axios
      .post(`auth/groups/${groupName}/subgroups-create`, data)
      .then(res => {
        return res.data;
      });
  },
  deleteSubGroup: (groupName, subgroupName) => {
    return axios
      .post(`auth/groups/${groupName}/subgroups-delete/${subgroupName}`)
      .then(res => {
        return res.data;
      });
  }
};
