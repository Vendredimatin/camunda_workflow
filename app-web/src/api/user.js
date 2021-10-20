import axios from "../libs/anotherAxios";
import {encode64, randomStr} from "../libs/utils";

export const login = ({ username, password }) => {
  const data = new FormData();
  data.set("username", username);
  data.set("password", `${randomStr(3)}${encode64(password)}${randomStr(5)}`);
  // data.set("password", password)
  // data.set("password", encode64(password))
  const config = { headers: { "Content-Type": "multipart/form-data" } };
  return axios.post("login", data, config);
};

export const getUserInfo = () => {
  return axios.get("org/current-user-environment").then(res => {
    return res.data;
  });
};
