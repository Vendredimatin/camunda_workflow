import axios from "../../libs/axios";

  //判断某个授权项是否可行
export const checkItem = (authName) => {
  return axios.post(`auth/check-item/?authName=${authName}`).then(res => {
    return res.data;
  });
};

  //判断某个授权项是否可行
  export const checkClasses = (className, authName) => {
    return axios.post(`auth/check-classes/${className}?authName=${authName}`).then(res => {
      return res.data;
    });
  };
  
  
  //数组 判断某个授权项是否可行
  export const checkClassesArray = (className, authName) => {
    return axios.post(`auth/check-classes?authName=${authName}&isArray=true`,className).then(res => {
      return res.data;
    });
  };
  