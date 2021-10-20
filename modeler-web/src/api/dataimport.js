import axios from "@/libs/axios.js"
import global_ from "@/views/global.vue"

export const getEntities = () => {
    return axios.get(
        `meta/entities`
    )
}

export const getRelations = () => {
    return axios.get(
        `meta/relations`
    )
}

export const getAttributesOfClass = (classname) => {
    return axios.get(`meta/entities/${classname}/attributes`)
}

export const getImportDataUUID = (booleanUpdateIfExist) => {
    return axios.get(`importData/getImportDataUUID?updateIfExist=`+booleanUpdateIfExist)
}

export const importData = (params) =>{
    return axios.post(`importData/importData`,params);
}

export const stopImportData = (params) => {
    return axios.post(`importData/stopImportData`, params)
}

export const getFailedDataUrl = (param) => {
    return global_.baseUrl+"/"+"importData/getFailedImportData"+"?"+"fileName="+param+".xlsx"
}

export const deleteTempXlsxFile = (params) => {
    return axios.post(`importData/deleteTempXlsxFile`, params)
}