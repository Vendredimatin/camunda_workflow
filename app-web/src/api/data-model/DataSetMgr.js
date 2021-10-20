import axios from "../../libs/axios";
import global_ from "../../views/global.vue";

let baseObjOther = global_.baseObjOther;

export default {
  getAllDataSets: params => {
    return axios
      .post(
        `${baseObjOther}/omf/entities/MetaDataSet/objects`,
        params ? params : {}
      )
      .then(res => {
        return res.data;
      });
  },
  createDataSets: data => {
    return axios
      .post(`${baseObjOther}/omf/entities/MetaDataSet/objects-create`, data)
      .then(res => {
        return res.data;
      });
  },
  deleteDataSets: oids => {
    return axios
      .post(`${baseObjOther}/omf/entities/MetaDataSet/objects-delete`, oids)
      .then(res => {
        return res.data;
      });
  },
  updateDataSets: data => {
    return axios
      .post(`${baseObjOther}/omf/entities/MetaDataSet/objects-update`, data)
      .then(res => {
        return res.data;
      });
  },
  getDataSet: oid => {
    return axios
      .get(`${baseObjOther}/omf/entities/MetaDataSet/objects/${oid}`)
      .then(res => {
        return res.data;
      });
  },
  getDataSetResult: (dataSetOid, startIndex, rowsNumber, sampleMethod, pageIndex, pageSize, className) => {
    return axios
      .get(
        `${baseObjOther}/omf/dataset?dataSetOid=${dataSetOid}&sampleMethod=${sampleMethod}&pageIndex=${pageIndex}&pageSize=${pageSize}&className=${className}`
      )
      .then(res => {
        return res.data;
      });
  },
  getDataSetDataCount: (dataSetOid, startIndex, rowsNumber, sampleMethod, pageIndex, pageSize, className) => {
    return axios
      .get(
        `${baseObjOther}/omf/dataset-count?dataSetOid=${dataSetOid}&sampleMethod=${sampleMethod}&pageIndex=${pageIndex}&pageSize=${pageSize}&className=${className}`
      )
      .then(res => {
        return res.data;
      });
  },
  getDataSetTotalCount: (dataSetOid) => {
    return axios
      .get(`${baseObjOther}/omf/dataset-count?dataSetOid=${dataSetOid}`)
      .then(res => {return res.data;});
  }
  // getDataSetDataCount: (dataSetOid, startIndex, rowsNumber, sampleMethod, className) => {
  //   return axios.get(`${baseObjOther}/omf/dataset-count?dataSetOid=${dataSetOid}&startIndex=${startIndex}&rowsNumber=${rowsNumber}&sampleMethod=${sampleMethod}&className=${className}`).then(res => {
  //     return res.data;
  //   });
  // }
};
