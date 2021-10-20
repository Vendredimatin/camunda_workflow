import axios from "@/libs/axios.js"
import store from "../store";
import global_ from "../views/global.vue";

export const uploadExcelThenGetInfo = (param) => {
  return axios.post(`quickStartFromExcel/uploadExcel`, param)
};

export const checkClassNameValid = (className) => {
  return axios.get("quickStartFromExcel/checkClassNameValid?className="+className)
}

export const checkAttributeTypeValid = (attributeName, valueType) => {
  return axios.get("quickStartFromExcel/checkAttributeTypeValid?attributeName="+attributeName+"&valueType="+valueType)
}

export const confirmClassInfo = (param) => {
  return axios.post(`quickStartFromExcel/confirmClassInfo`, param)
}

export const getFailureData = (uuid, filename) => {
  return fetch(global_.baseUrl+"/"+"quickStartFromExcel/getFailureData"+"?"+"uuid="+uuid, {
    method: 'GET',
    headers: new Headers({
        Authorization: store.state.user.token,
    }),
    })
    .then(res => {
        //console.log(res)
        return res.blob()
    })
    .then(data => {
        const blobUrl = window.URL.createObjectURL(data);
        const a = document.createElement('a');
        a.download = filename;
        a.href = blobUrl;
        a.click();
        return Promise.resolve(true)
    });
}

export const deleteTempExcelFile = (uuid) => {
  return axios.get("quickStartFromExcel/deleteTempExcelFile"+"?"+"uuid="+uuid)
}