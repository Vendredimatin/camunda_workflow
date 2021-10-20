import axios from "../../libs/axios";

  //判断某个class能否进行某个授权动作
export const checkClasses = (authName, className) => {
  return axios.post(`auth/check-classes/${className}?authName=${authName}`).then(res => {
    return res.data;
  });
};
