import axios from "../libs/anotherAxios";
import global_ from "../views/global.vue";
import { encode64 } from "../libs/utils"
// import formJson from '@/i.json';

let baseObjOther = global_.baseObjOther;
let baseUrl = global_.baseUrl;

// 获取全部应用
export const getApps = (type, withExtConfig) => {
  return axios.get(`${baseUrl}/apps?type=${type || ''}&withExtConfig=${withExtConfig !== undefined ? withExtConfig : true}&withModelerApp=false`);
};

// 获取某个应用的信息 needtoken
export const getAppInfo = (name)=> {
  return axios.get(`${baseUrl}/apps/${name}`);
};

// 获取某个应用的信息 notoken
export const checkAppInfo = (name)=> {
  return axios.get(`${baseObjOther}/app/app-check/${name}`);
};

// 获取某个应用的logo
export const getAppById = (id)=> {
  return axios.get(`${baseUrl}/apps/id/${id}`);
};

// 获取所有实体类
export const getAllEntities = params => {
  return axios.get(`meta/entities`, {params: params});
};
/**?
 * @功能名称: 关联类
 * 功能描述: 获取关联类列表
 */
export const getAllRelations = params => {
  return axios.get(`meta/relations`, {params: params});
};
// 根据类名获取所有属性
export const getObjName = name => {
  return axios.get(`meta/class/${name}/attributes`);
};
// 获取实体类的所有对象
export const getEobj = async function(name, params) {
  if('condition' in params){
    params.condition = params.condition.substring(0, 12) === "nativequery:" ? `nativequery:${encode64(params.condition.substring(12, params.condition.length))}` : params.condition;
  }
  if(params.refs && params.refs.length !== 0){
    params.refs.forEach(ref => {
      if(ref.targetCondition){
        ref.targetCondition = ref.targetCondition.substring(0, 12) === "nativequery:" ? `nativequery:${encode64(ref.targetCondition.substring(12, ref.targetCondition.length))}` : ref.targetCondition;
      }
    });
  }
  return await axios.post(
    `${baseObjOther}/omf/entities/${name}/objects`,
    params ? params: {}
  );
};

// 获取实体对象自关联结果
export const getSelfJoinEobj = async function (name, params, needPageInfo, needCount, foreignKey = 'parentOid') {
  return await axios.post(`${baseObjOther}/omf/entities/${name}/tree?totalCount=${needPageInfo}&childInfo=${needCount}&foreignKey=${foreignKey}`, params ? params : {});
};

//值判重
export const checkDuplicate = async function (name, params) {
  return await axios.post(`${baseObjOther}/omf/entities/${name}/objects/duplicateValueCheck`, params ? params : {});
};

// 获取关联类的所有对象个数
export const getRelationObjCount = async function (name, params) {
  return await axios.post(`${baseObjOther}/omf/relations/${name}/objects/count`, params ? params : {});
};

// 获取实体类的所有对象的个数
export const getEobjCount = async function(name, params) {
  if('condition' in params){
    params.condition = params.condition.substring(0, 12) === "nativequery:" ? `nativequery:${encode64(params.condition.substring(12, params.condition.length))}` : params.condition;
  }
  return await axios.post(
    `${baseObjOther}/omf/entities/${name}/objects/count`,
    params ? params: {}
  );
};

// 获取关联类的所有对象的个数
export const getRobjCount = async function(name, params) {
  if('condition' in params){
    params.condition = params.condition.substring(0, 12) === "nativequery:" ? `nativequery:${encode64(params.condition.substring(12, params.condition.length))}` : params.condition;
  }
  return await axios.post(
    `${baseObjOther}/omf/relations/${name}/objects/joined/count`,
    params ? params: {}
  );
};

export const getSingleObj = async function (name) {
  return await axios.post(`${baseObjOther}/omf/entities/${name}/objects`, {
    "condition": "order by plt_lastModifyTime desc",
    "pageSize": 1,
    "sampleMethod": "sequential",
    "startIndex": 0
  });
};

export const deleteView = async function(id) {
  return axios.post(`meta/views-delete/${id}`).then(res => {
    return res.data;
  });
};

export const createView = async function(params) {
  return axios.post(`meta/views-create`, params);
};

export const updateView = async function(params) {
  return axios.post(`meta/view-update`, params);
};

export const getView = async function(className, viewName) {
  return axios.get(`meta/class/${className}/views/${viewName}/devices/actPc/type/PC`);
};

// 获取某个快速查询操作的信息
export const getQueryOperation = async function(id) {
  return axios.get(`meta/queryoperations/${id}`);
};
// 获取某个类(实体类/关联类/资源类)的操作
export const getEntitiesOperations = async function (name) {
  return await axios.get(`meta/entities/${name}/operations`);
};
// 获取某个类(实体类/关联类/资源类)的具体操作
export const getEntitiesOperationsByName = async function (className, operationName) {
  return await axios.get(`meta/entities/${className}/operations/${operationName}`);
};
// 获取某个快速查询操作的信息
export const getGlobalOperation = async function() {
  return axios.get(`meta/global-implement-scripts`);
};

// 查看所有IoTDB数据源
export const getAllIotdbs = () => {
  return axios.get(`${baseObjOther}/omf/iotdbs`);
};

// 查看所有IoTDB设备名
export const getAllDevices = (dataSourceName) => {
  return axios.get(`${baseObjOther}/omf/iotdbs/${dataSourceName}/devices`);
};

// 查看单个IoTDB设备下所有时间序列路径
export const getTimeSeriesByDevice = (dataSourceName, deviceName) => {
  return axios.get(`${baseObjOther}/omf/iotdbs/${dataSourceName}/devices/${deviceName}/timeseries`);
};

// 根据条件获取IoTDB指定设备下的时间序列路径
export const getMultiTimeSeries = async function(dataSourceName, deviceName, params){
  return await axios.post(`${baseObjOther}/omf/iotdbs/${dataSourceName}/devices/${deviceName}/multi-timeseries`, params);
};

// 预览IoTDB指定设备指定时间序列的前5行数据
export const previewTimeseries = (dataSourceName, deviceName, timeSeriesName) => {
  return axios.get(`${baseObjOther}/omf/iotdbs/${dataSourceName}/devices/${deviceName}/timeseries/${timeSeriesName}`);
};

// 批量处理CUD事务
export const cudBatch = (params) => {
  return axios.post(`${baseObjOther}/omf/cud-batch`, params);
};
// 批量处理级联CU操作
export const toBeNextCreate = (params) => {
  return axios.post(`${baseObjOther}/omf/next-create`, params);
};
// 查看实体类的单个对象
export const getEobjSingle = (name, oid, params) => {
  return axios.post(`${baseObjOther}/omf/entities/${name}/objects/${oid}`, params);
};
// 查看实体类的多个对象
export const getEobjMulti = (name, params) => {
  return axios.post(`${baseObjOther}/omf/entities/${name}/objects/oids`, params);
};
// 增加实体类的单个对象
export const createEobj = (name,params)=>{
  // const config={headers: {'Content-Type': 'application/json'}};
  return axios.post(`${baseObjOther}/omf/entities/${name}/objects-create`,params);
};
// 修改实体类的单个对象
export const editEobj = (name,params)=>{
  return  axios.post(`${baseObjOther}/omf/entities/${name}/objects-update`,params);
};
// 删除实体类的单个对象
export const delEobj = (name,params)=> {
  return  axios.post(`${baseObjOther}/omf/entities/${name}/objects-delete`,params);
};

// 获取某个脚本的执行方式
export const getExecute = (operationName, params, scriptName, scriptType)=> {
  if(scriptName && scriptType){
    return axios.post(`${baseObjOther}/meta/operations/${operationName}/execute?scriptName=${scriptName}&scriptType=${scriptType}`, params);
  }else{
    return axios.post(`${baseObjOther}/meta/operations/${operationName}/execute`, params);
  }
};

// 单独删除实体类的某个属性
export const delObjAttr = (name, oid, attributeName)=> {
  return  axios.post(`${baseObjOther}/omf/classes/${name}/objects/${oid}/attributes/${attributeName}/delete`);
};

export const getEJobj = async function (name, params, level, needInfo) {
  if(params){
    params.condition = params.condition ? params.condition.substring(0, 12) === "nativequery:" ? `nativequery:${encode64(params.condition.substring(12, params.condition.length))}` : params.condition || '' : '';
  }
  if(params.refs && params.refs.length !== 0){
    params.refs.forEach(ref => {
      if(ref.targetCondition){
        ref.targetCondition = ref.targetCondition.substring(0, 12) === "nativequery:" ? `nativequery:${encode64(ref.targetCondition.substring(12, ref.targetCondition.length))}` : ref.targetCondition;
      }
    });
  }
  let finalNeed = needInfo == undefined ? false : needInfo;
  if(level) {
    return await axios.post(`${baseObjOther}/omf/relations/${name}/objects/joined?childInfo=${finalNeed}&recursiveLevel=${level}`, params ? params : {});
  } else {
    return await axios.post(`${baseObjOther}/omf/relations/${name}/objects/joined?childInfo=${finalNeed}`, params ? params : {});
  }

};

// 关联查询返回树形结果
export const getEJTree = async function (relationName, selfRelTreeReq, needChildCOunt, needCount) {
  return await axios.post(`${baseObjOther}/omf/relations/${relationName}/tree?childInfo=${needChildCOunt}&totalCount=${needCount}`, selfRelTreeReq ? selfRelTreeReq : {});
};

// 查看关联类的单个对象
export const getRobjSingle = (name, oid, params) => {
  return axios.post(`${baseObjOther}/omf/relations/${name}/objects/${oid}`, params);
};
// 查看关联类的多个对象
export const getRobjMulti = (name, params) => {
  return axios.post(`${baseObjOther}/omf/relations/${name}/objects/oids`, params);
};
// 增加关联类的单个对象
export const createEJobj = (name,params)=>{
  // const config={headers: {'Content-Type': 'application/json'}};
  return axios.post(`${baseObjOther}/omf/relations/${name}/objects-create`,params);
};
// 修改关联类的单个对象
export const editEJobj = (name,params)=>{
  return  axios.post(`${baseObjOther}/omf/relations/${name}/objects-update`,params);
};
// 删除关联类的单个对象
export const delEJobj = (name,params)=> {
  return  axios.post(`${baseObjOther}/omf/relations/${name}/objects-delete`,params);
};
// 删除关联类的单个对象
export const delRJobj = (name,params)=> {
  return  axios.post(`${baseObjOther}/omf/relations/${name}/objects-delete`,params);
};

export const getDistinctValues = async function (className, name) {
  return await axios.post(`${baseObjOther}/omf/classes/${className}/attributes/${name}/distinct-values`, { queryObjReq: {} });
};

export const getDistinctValuesWithParams = async function (className, name, params) {
  return await axios.post(`${baseObjOther}/omf/classes/${className}/attributes/${name}/distinct-values`, params);
};

// 根据目标类名获取视图列表
export const getViews = name => {
  return axios.get(`meta/class/${name}/views`).then(res => {
    if (res.data && res.data.data) {
      let vmap = {};
      let list = [];
      res.data.data.forEach(x => {
        if (x.viewName in vmap) return;
        vmap[x.viewName] = 1;
        list.push(x);
      });
      res.data.data = list;
    }
    return res;
  });
};

export const getClass = async function (name) {
  return await axios.get(`${baseUrl}/meta/classes/${name}`);
};

// 获取模块
export const getAllModules = (appId, withDefaultModule = false) => {
  // return axios.get(`meta/modules${params}`).then(res => {
  return axios.get(`meta/modules${appId}&withDefaultModule=${withDefaultModule}`).then(res => {
    return res.data;
  });
};
// 获取模块下的操作
export const getModuleOperations = (name, withDefaultModule = false) => {
  return axios.get(`meta/modules/${name}/operations?withDefaultModule=${withDefaultModule}`).then(res => {
    return res.data;
  });
};

// 获取图标列表
export const getIconList = params => {
  return axios.get(`icons`, {params: params});
};
/**?
 * 所属模块: 组织模型
 * @功能名称: 用户管理
 * 功能描述: 获取全部用户信息
 */
export const getAllUsers = params => {
  return axios.get(`org/users`, {params: params});
};
export const getAllUserTree = params => {
  return axios.get(`org/groups/tree`, {params: params});
};
// 获取指定用户组下的用户
export const getUserFromGroup = oid => {
  return axios.get(`org/groups/${oid}/users`);
};
// 获取指定用户参与的组
export const getUserGroup = oid => {
  return axios.get(`org/users/${oid}/groups`);
};
// 获取组信息
export const getGroups = params => {
  return axios.get(`org/groups`, {params: params});
};
export const getUserByOid = oid => {
  return axios.get(`org/users/${oid}`);
};
// 获取指定组信息
export const getGroup = oid => {
  return axios.get(`org/groups/${oid}`);
};
// 获取用户信息
export const getUser = oid => {
  return axios.get(`org/users/${oid}`);
};
// 获取全部用户（组）信息（树结构）
export const getAllUserGroupTree = params => {
  return axios.get(`org/groups/user-tree`, {params: params});
};

// 查看所有订阅的omf事件
export const getSub = () => {
  return axios.get(`${baseObjOther}/omf/event/subscription`)
}

// 订阅omf事件
export const postSub = params => {
  return axios.post(`${baseObjOther}/omf/event/subscription/create-or-update`, params);
}

// 删除omf事件
export const deleteSub = params => {
  return axios.post(`${baseObjOther}/omf/event/subscription/delete`, params);
}

// 获取当前所有的查询结果订阅
export const getResultSub = () => {
  return axios.get(`${baseObjOther}/omf/query-result-change/event/subscription`)
}

// 订阅新增更新查询结果事件
export const postResultSub = params => {
  return axios.post(`${baseObjOther}/omf/query-result-change/event/subscription/create-or-update`, params);
}

// 删除查询结果事件
export const deleteResultSub = params => {
  return axios.post(`${baseObjOther}/omf/query-result-change/event/subscription/delete`, params);
}

// 向某个socket发送消息
// export const sendMsgToOneSock = (socketId, params) => {
//   return axios.post(`${baseObjOther}/websocket/sendMsgToOneSock?sockId=${socketId}`, params);
// }

/**
 * 功能描述: 获取图片信息(文件)
*/
export const getFilesById = fileOid => {
  return axios.get(`files/${fileOid}`).then(res => res.data);
};

// 删除文件
export const deleteFile = file_id=>{
  return axios.post(`files-delete/${file_id}`)
}

export const getDWFAppConfig = async function () {
  return await axios.get(`config/configs`);
}
