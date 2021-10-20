import axios from "../libs/axios";
import global_ from "@/views/global.vue"
import store from "@/store";

export const conflictDetectionAndRelease = (params) => {
  console.log("rua", params)
  return axios.post(`modelpackage/v2/conflictDetectionAndRelease`, params)
};

export const createNewModelPackage = (params) => {
  console.log("rua", params)
  return axios.post(`modelpackage/v2/createModelPackage`, params)
};

export const deleteModelPackage = (params) => {
  return axios.post(`modelpackage/v2/deleteModelPackage`, params)
};

export const findDependency = (params) => {
  return axios.post(`modelpackage/v2/findDependency`, params)
};

export const getAllModelPackage = (params) => {
  return axios.get(`modelpackage/v2/getAllModelPackage`, params)
};

export const getInitScriptAndModelPackageTree = (params) => {
  return axios.post(`modelpackage/v2/getInitScriptAndModelPackageTree`, params)
};

export const getTheWholeSystemData = (params) => {
  return axios.get(`modelpackage/v2/getOptions`, params)

};

export const uploadModelPackage = (params) => {
  return axios.post(`modelpackage/v2/uploadModelPackage`, params)
};

export const downloadModelPackage = (uuid, packageName) => {
  fetch(global_.baseUrl+"/"+"modelpackage/v2/downloadModelPackage"+"?"+"UUID="+uuid, {
    method: 'GET',
    headers: new Headers({
        Authorization: store.state.user.token,
    }),
    })
    .then(res => {
        return res.blob()
    })
    .then(data => {
        const blobUrl = window.URL.createObjectURL(data);
        const a = document.createElement('a');
        a.download = packageName + '.zip';
        a.href = blobUrl;
        a.click();
    }).catch(err => {
      console.error(err)
  });
}


export const downloadReleaseLog = (uuid, packageName) => {
  return fetch(global_.baseUrl+"/"+"modelpackage/v2/getReleaseLog"+"?"+"uuid="+uuid, {
    method: 'GET',
    headers: new Headers({
      Authorization: store.state.user.token,
    }),
  })
    .then(res => {
      return res.blob()
    })
    .then(data => {
      const blobUrl = window.URL.createObjectURL(data);
      const a = document.createElement('a');
      a.download = packageName + '_releaseLog.log';
      a.href = blobUrl;
      a.click();
      return Promise.resolve(true)
    });
}

