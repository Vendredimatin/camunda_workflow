
import axios from "../libs/axios";

// 获取当前用户的应用实例ID
export const getUserSettingId = params => { 
    return axios.get("apps", { params: params }).then(res => res.data);
};
  
  //根据用户ID获取自定义数据
export const getUserSetInfo = id => {
    return axios.get(`apps/${id}/logo`).then(res => res.data);
};