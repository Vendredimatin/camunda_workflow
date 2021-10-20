import axios from "../../libs/axios";
const queryString = require("query-string");

export default {
  getAllScripts: className => {
    return axios.get(`meta/classes/${className}/scripts`).then(res => {
      return res.data;
    });
  },
  getScript: (className, actionName) => {
    return axios
      .get(`meta/classes/${className}/scripts/${actionName}`)
      .then(res => {
        return res.data;
      });
  },
  deleteScript: (className, actionName) => {
    return axios
      .post(`meta/classes/${className}/scripts-delete/${actionName}`)
      .then(res => {
        return res.data;
      });
  },
  updateScript: (className, actionName, data) => {
    return axios
      .post(
        `meta/classes/${className}/scripts-update/${actionName}`,
        queryString.stringify({ scriptExpr: data }),
        {
          headers: {
            "Content-Type": "application/x-www-form-urlencoded"
          }
        }
      )
      .then(res => {
        return res.data;
      });
  },
  getAllScriptActions: () => {
    return axios.get(`meta/script-actions`).then(res => {
      return res.data;
    });
  },
  getScriptAction: actionName => {
    return axios.get(`meta/script-actions/${actionName}`).then(res => {
      return res.data;
    });
  }
};
