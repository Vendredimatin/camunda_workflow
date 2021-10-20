import axios from "../libs/axios"

export const createViewTemplate = params => {
    return axios.post('meta/view-templates-create', params).then(res => res.data)
}

export const getViewTemplateAll = () => {
    return axios.get(`meta/view-templates`).then(res => res.data)
}

export const getViewTemplateByOid = oid => {
    return axios.get(`meta/view-template/${oid}`).then(res => res.data)
}

export const deleteViewTemplateByOid = params => {
    return axios.post(`meta/view-template-delete`, params).then(res => res.data)
}

// 更新视图模板
export const updateViewTemplateByOid = params => {
    return axios.post(`meta/view-template-update`, params).then(res => res.data)
}