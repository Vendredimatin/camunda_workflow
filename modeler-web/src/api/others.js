import axios from "../libs/anotherAxios";
import formJson from '@/i.json';
import global_ from "../views/global.vue";
import {encode64, randomStr} from "@/libs/utils";

let baseUrlOther = global_.baseUrlOther;
let baseObjOther = global_.baseObjOther;

/**?
 * 所属模块: 组织模型
 * @功能名称: 用户管理
 * 功能描述: 获取全部用户信息
 */
export const getAllUsers = (condition, pageIndex, pageSize, isPaged) => {
  if(isPaged !== undefined) {
    return axios.get(`org/users?condition=${condition || ''}&isPaged=${isPaged}&pageIndex=${pageIndex || ''}&pageSize=${pageSize || ''}&withPageInfo=true`);
  } else {
    return axios.get(`org/users`);
  }

};
// 获取组信息
export const getGroups = params => {
  return axios.get(`org/groups`, {params: params});
};
export const getUserByOid = oid => {
  return axios.get(`org/users/${oid}`);
};

// 更新组信息
export const updateGroup = params => {
  return axios.post(`org/groups-update`, params).then(res => res.data);
};

//查询组 返回树结构
export const getSearchGroupsTree = (name) => {
  return axios.get(`org/groups-all-parents-tree?name=${name}`);
};

// 获取指定用户参与的组
export const getUserGroup = oid => {
  return axios.get(`org/users/${oid}/groups`);
};

/**
 *
 * @param {*} params
 * 功能描述: 添加新用户
 */
export const addNewUser = params => {
  if(params[0].password){
    params[0].password = `${randomStr(3)}${encode64(params[0].password)}${randomStr(5)}`;
  }
  return axios.post(`org/users-create`, params).then(res => res.data);
};

// 功能描述: 删除用户
export const delUser = uid => {
  return axios.post(`org/users-delete/${uid}`).then(res => res.data);
};

// 功能描述: 更新用户
export const updateUser = params => {
  if(params.password){
    params.password = `${randomStr(3)}${encode64(params.password)}${randomStr(5)}`;
  }
  return axios.post(`org/users-update`, params).then(res => res.data);
};

// 功能描述: 添加一个用户到指定组
export const addUserToGroup = (oid, params) => {
  return axios.post(`org/groups/${oid}/users-create`, params).then(res => res.data);
};

/**
 * @description 功能名称：图片管理
 * 功能描述: 获取某资料库下的图片(文件)
*/
export const getFiles = libraryId => {
  return axios.get(`libraries/${libraryId}/files`).then(res => res.data);
};

/**
 * 功能描述: 获取图片信息(文件)
*/
export const getFilesById = fileOid => {
  return axios.get(`files/${fileOid}`).then(res => res.data);
};

/**
 * 功能描述: 上传图片(文件)
*/
export const uploadFile = params => {
  return axios.post(`files-upload`, params).then(res => res.data);
};

/**
 * 功能描述: 删除图片(文件)
*/
export const delFile = fileOid => {
  return axios.post(`files-delete/${fileOid}`).then(res => res.data);
};

/**?
 * @功能名称: 用户组管理
 * 功能描述: 获取全部用户组信息
 */
export const getAllUserTree = params => {
  return axios.get(`org/groups/tree`, {params: params});
};

// 获取全部用户（组）信息（树结构）
export const getAllUserGroupTree = params => {
  return axios.get(`org/groups/user-tree`, {params: params});
};

// 获取表示“角色”的用户组信息
export const getRoleGroup = () => {
  return axios.get(`org/rolegroup`);
};

// 获取所有组与组的关系（左子右父）
export const getGroupToGroups = () => {
  return axios.get(`org/group-to-groups`);
};

// 获取所有用户与组的关系
export const getUserToGroups = () => {
  return axios.get(`org/user-to-groups`);
};

// 获取指定用户组下的用户
export const getUserFromGroup = oid => {
  return axios.get(`org/groups/${oid}/users`);
};

// 用户组下添加新用户组(老用户只调下面的接口)
export const groupAddNewGroup = params => {
  return axios.post(`org/groups-create`, params).then(res => res.data);
};
export const groupAddUser = (oid, sid) => {
  return axios
    .post(`org/groups/${oid}/subgroups-create?subOids=${sid}`)
    .then(res => res.data);
};

// 删除用户组
export const delGroup = (oid, isDel) => {
  return axios.post(`org/groups-delete/${oid}?cascade=${isDel}`).then(res => res.data);
};

// 功能描述: 删除指定用户组下的用户
export const delUserFromGroup = (oid, params) => {
  return axios.post(`org/groups/${oid}/users-delete`, params).then(res => res.data);
};

/**?
 * 所属模块: 功能模型
 * @功能名称: 系统操作清单
 * 功能描述: 获取全部系统操作
 */
export const getSystemOperations = params => {
  return axios.get(`meta/classes/Operation/children`, {params: params});
};

// 功能描述: 新增操作
export const addNewOperation = params => {
  return axios.post(`meta/classes-create`, params).then(res => res.data);
};

// 功能描述: 修改操作
export const fixOperation = params => {
  return axios.post(`meta/classes-update`, params).then(res => res.data);
};

// 功能描述: 删除操作
export const delOperation = name => {
  return axios.post(`meta/classes-delete/${name}`).then(res => res.data);
};

/**?
 * @功能名称: 应用模块操作管理
 * 功能描述: 获取全部应用
 */
export const getApps = params => {
  return axios.get('apps', {params: params});
};

// 新增应用树
export const updateAppTree = params => {
  return axios.post(`meta/modules-tree/update`, params).then(res => res.data);
};

// 上传某个应用的logo
export const uploadLogo = (id, params) => {
  return axios.post(`apps/${id}/logo-upload`, params).then(res => res.data);
};

// 上传某个应用的.ico
export const uploadIco = (id, params) => {
  return axios.post(`apps/${id}/icon-upload`, params).then(res => res.data);
};

// 更新应用
export const updateApp = params => {
  return axios.post(`apps-update`, params).then(res => res.data);
};

// 新增应用
export const addApp = params => {
  return axios.post(`apps-create`, params).then(res => res.data);
};

// 删除某个应用
export const delApp = (id) => {
  return axios.post(`apps-delete/${id}`).then(res => res.data);
};

/**?
 * @功能名称: 应用模块操作管理
 * 功能描述: 获取全部模块
 */
export const getModules = params => {
  return axios.get(`meta/classes/Module/children`, {params: params});
};
// 获取某应用下的模块
export const getAppModules = (appId, withDefaultModule = false) => {
  return axios.get(`meta/modules?appId=${appId}&withDefaultModule=${withDefaultModule}`);
};
// 获取某应用下的模块和操作
export const getAppModulesAndOperation = (withDefaultModule = false) => {
  return axios.get(`meta/modules-operations?withDefaultModule=${withDefaultModule}`);
};
// 获取指定类
export const getTargetModules = params => {
  return axios.get(`meta/modules/${params}`);
};
// 功能描述: 获取模块下的操作
export const getModuleOperations = async function (name, withDefaultModule = false) {
  return await axios.get(`meta/modules/${name}/operations?withDefaultModule=${withDefaultModule}`);
};
// 获取某个应用的信息 notoken
export const checkAppInfo = (name)=> {
  return axios.get(`${baseObjOther}/app/app-check/${name}`);
};
// 功能描述: 获取app信息
export const getAppById = async function (id) {
  return await axios.get(`apps/id/${id}`);
};

// 功能描述: 获取app css
export const getAppCssById = async function (id) {
  return await axios.get(`apps/${id}/css`);
};

// 获取某个类(实体类/关联类/资源类)的操作
export const getClassOperations = async function (name) {
  return await axios.get(`meta/class/${name}/operations`);
};
// 获取某个类(实体类/关联类/资源类)的操作
export const getEntitiesOperations = async function (name) {
  return await axios.get(`meta/entities/${name}/operations`);
};

// 获取全局操作
export const getGlobalOperation = (params, pageIndex, pageSize, withPageInfo) => {
  return axios.post(`meta/global-operations?pageIndex=${pageIndex}&pageSize=${pageSize}&withPageInfo=${withPageInfo}`, params).then(res => res.data);
};

// 绑定操作
export const bindOperation = params => {
  return axios.post(`meta/modules/operations`, params).then(res => res.data);
};

//根据类名获取原生查询语句
export const getNativeQuery = (className, isJoined) => {
  return axios.get(`meta/nativequery/${className}/get-native-query?isJoined=${isJoined}`).then(res => res.data);
};

// 解除绑定操作
export const unbindOperation = (className, viewName, operationName) => {
  return axios
    .post(
      `meta/class/${className}/views/${viewName}/operations-untie/${operationName}`
    )
    .then(res => res.data);
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

// 获取插件列表
export const getPlugList = params => {
  return axios.get(`${baseUrlOther}/conf/addinEntries`, {params: params});
};

// 绑定多个操作到类
export const bindOperations = params => {
  return axios
    .post(`meta/class/operations-batch-create`, params)
    .then(res => res.data);
};

export const getQuickOpeById = id =>{
  return axios.get(`meta/queryoperations/${id}`).then(res => res.data);
}

// 编辑快速查询操作
export const fixQuickOpe = params => {
  return axios.post(`meta/queryoperations-update`, params).then(res => res.data);
};
// 新建并绑定快速查询操作
export const createQuickOpe = (params, autoGenerateNameFlag) => {
  return axios.post(`meta/queryoperations-create?autoGenerateName=${autoGenerateNameFlag || false}`, params).then(res => res.data);
};

// 编辑系统操作
export const fixSystemOpe = params => {
  return axios.post(`meta/classes-update`, params).then(res => res.data);
};

// 删除快速查询操作
export const delQuickOpe = id => {
  return axios.post(`meta/queryoperations-delete/${id}`).then(res => res.data);
};

// 删除系统操作
export const delSystemOpe = name => {
  return axios.post(`meta/classes-delete/${name}`).then(res => res.data);
};

// 获取后端关键字
export const getKeyWordList = () => {
  return axios.get(`meta/operations-keywords`).then(res => res.data);
};

// 获取图标列表
export const getIconList = params => {
  return axios.get(`icons`, {params: params});
};

// 获取所有实体类
export const getAllEntities = params => {
  return axios.get(`meta/entities`, {params: params});
};
// 获取所有内部实体类
export const getAllInternalEntities = params => {
  return axios.get(`meta/entities-internal`, {params: params});
};
// 获取所有外部实体类
export const getAllExternalEntities = params => {
  return axios.get(`meta/entities-external`, {params: params});
};

// 获取所有资源类
export const getAllResources = params => {
  return axios.get(`meta/resources`, {params: params});
};

// 获取所有系统操作和快速查询操作（其中快速查询操作含所属模块信息）
export const getAllOperations = async function () {
  return await axios.get(`meta/operations`);
};

// 功能描述: 获取实体类下的操作
export const getEntryOperations = async function (name) {
  return await axios.get(`meta/entities/${name}/operations`);
};

// 功能描述: 获取关联类下的操作
export const getRelationOperations = async function (name) {
  return await axios.get(`meta/relations/${name}/operations`);
};

// 功能描述: 获取所有实体类的操作
export const getAllEntryOperations = async function (pageIndex, pageSize, withPageInfo = true, fuzzySearch= '') {
  if(fuzzySearch){
    return await axios.get(`meta/entities-operations?fuzzySearch=${fuzzySearch}&pageIndex=${pageIndex}&pageSize=${pageSize}&withPageInfo=${withPageInfo}`);
  }else{
    return await axios.get(`meta/entities-operations?pageIndex=${pageIndex}&pageSize=${pageSize}&withPageInfo=${withPageInfo}`);
  }
};

// 功能描述: 获取所有关联类的操作
export const getAllRelationOperations = async function (pageIndex, pageSize, withPageInfo = true, fuzzySearch= '') {
  if(fuzzySearch){
    return await axios.get(`meta/relations-operations?fuzzySearch=${fuzzySearch}&pageIndex=${pageIndex}&pageSize=${pageSize}&withPageInfo=${withPageInfo}`);
  }else{
    return await axios.get(`meta/relations-operations?pageIndex=${pageIndex}&pageSize=${pageSize}&withPageInfo=${withPageInfo}`);
  }
};


// 编辑模块
export const fixModule = params => {
  return axios.post(`meta/modules-update`, params).then(res => res.data);
};

// 删除模块
export const delModule = name => {
  return axios.post(`meta/modules-delete/${name}`).then(res => res.data);
};

// 根据目标类名获取视图列表
export const getViews = (name, params) => {
  let url;
  if(params){
    
    if('formType' in params) {
      url = `meta/class/${name}/views?formType=${params.formType}&needV3Content=${params.needV3Content}`;
    } else {
      url = `meta/class/${name}/views?needV3Content=${params.needV3Content}`;
    }
    
  }else{
    url = `meta/class/${name}/views`;
  }
  return axios.get(url).then(res => {
    if (res.data && res.data.data) {
      // let vmap = {};
      let list = [];
      res.data.data.forEach(x => {
        // if (x.viewName in vmap) return;
        // vmap[x.viewName] = 1;
        list.push(x);
      });
      res.data.data = list;
    }
    return res;
  });
};

// 获取实体类的所有对象
export const getEobj = async function (name, params) {
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
  return await axios.post(`${baseObjOther}/omf/entities/${name}/objects`, params ? params : {});
};

export const getSingleObj = async function (name) {
  return await axios.post(`${baseObjOther}/omf/entities/${name}/objects`, {
    "condition": "order by plt_lastModifyTime desc",
    "pageSize": 1,
    "sampleMethod": "sequential",
    "startIndex": 0
  });
};

// 获取实体对象自关联结果
export const getSelfJoinEobj = async function (name, params, needPageInfo, needCount, foreignKey = 'parentOid') {
  return await axios.post(`${baseObjOther}/omf/entities/${name}/tree?totalCount=${needPageInfo}&childInfo=${needCount}&foreignKey=${foreignKey}`, params ? params : {});
};

// 获取实体类的所有对象个数
export const getEntityObjCount = async function (name, params) {
  return await axios.post(`${baseObjOther}/omf/entities/${name}/objects/count`, params ? params : {});
};

// 获取关联类的所有对象
export const getRelationObj = async function (name, params) {
  return await axios.post(`${baseObjOther}/omf/relations/${name}/objects`, params ? params : {});
};

// 获取关联类的所有对象个数
export const getRelationObjCount = async function (name, params) {
  return await axios.post(`${baseObjOther}/omf/relations/${name}/objects/count`, params ? params : {});
};

// 获取资源类的所有对象
export const getRobj = name => {
  return axios.get(`${baseObjOther}/omf/resources/${name}/objects`);
};

export const getFormJson = () => {
  return formJson.data;
}

export const getFormEntity = () => {
  return;
}

// 根据类名获取所有属性
export const getObjName = name => {
  return axios.get(`meta/class/${name}/attributes`);
};
/**?
 * @功能名称: 实体类
 * 功能描述: 获取关联名称(左／右类)
 */
export const getRelationNameB = name => {
  return axios.get(`meta/entities/${name}/backward-relations`);
};
export const getRelationNameF = name => {
  return axios.get(`meta/entities/${name}/forward-relations`);
};

// 快速查询操作英文名查重
export const checkCnameEvent = authName => {
  return axios.get(`auth/items/${authName}`);
};

// 快速查询操作中文名查重
export const checkDnameEvent = params => {
  return axios.post(`meta/queryoperations-displayNameCheck`, params);
};

/**?
 * @功能名称: 关联类
 * 功能描述: 获取关联类列表
 */
export const getAllRelations = params => {
  return axios.get(`meta/relations`, {params: params});
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

export const getView = async function(className, viewName, deviceType, formType) {
  if (deviceType) return axios.get(`meta/class/${className}/views/${viewName}/devices/${deviceType}/type/${formType}`);
  else return axios.get(`meta/class/${className}/views/${viewName}`);
};

//跨类复制表单
export const copyView = async function(oid,params) {
	return axios.post(`meta/views/${oid}/copy`, params);
//	return axios.post(`meta/view-update`, params);
};


// 查看实体类的单个对象
export const getEobjSingle = (name, oid, params) => {
  return axios.post(`${baseObjOther}/omf/entities/${name}/objects/${oid}`, params);
};
// 增加实体类的单个对象
export const createEobj = (name, params) => {
  // const config={headers: {'Content-Type': 'application/json'}};
  return axios.post(`${baseObjOther}/omf/entities/${name}/objects-create`, params);
};
// 修改实体类的单个对象
export const editEobj = (name, params) => {
  return axios.post(`${baseObjOther}/omf/entities/${name}/objects-update`, params);
};
// 删除实体类的单个对象
export const delEobj = (name, params) => {
  return axios.post(`${baseObjOther}/omf/entities/${name}/objects-delete`, params);
};


/*
  181025 关联类的一些操作
*/

/**
 * 保存关联对象
 *
 * @param className:String 关联类的类名
 * @param params:Array 关联类的实体
 * */
export const relationsObjectsCreate = (className, params) => {
  return axios.post(`${baseObjOther}/omf/relations/${className}/objects-create`, params).then(res => {
    return res.data;
  })
};

/**
 * 创建关联
 *
 * @param obj 关联类信息
 * */
export const relationsCreate = (obj) => {
  return axios.post(`${baseUrlOther}/meta/relations-create`, obj).then(res => {
    return res.data;
  });
};

/**
 * 删除关联
 * /dwf/v1/meta/relations-delete/{name}
 * @param name 关联类名
 * */
export const relationsDelete = (name) => {
  return axios.post(`${baseUrlOther}/meta/relations-delete/${name}`).then(res => {
    return res.data;
  });
};


/**
 * 查看右对象
 *
 * @param className 关联类的类名
 * @param oid 关联类对象的oid
 *
 * @return 实体类的数据
 */
export const rightObjects = ({className, oid}) => {
  return axios.get(`${baseObjOther}/omf/relations/${className}/objects/${oid}/right-objects`).then(res => {
    return res.data;
  });
};

/**
 * 查看右'关联'对象
 *
 * @param className 左类的类名
 * @param oid 左类对象的oid
 * @param relationClassName 右类的类名
 *
 * @return 关联表的数据
 */
export const rightRelations = ({className, oid, relationClassName}) => {
  return axios.get(`${baseObjOther}/omf/entities/${className}/objects/${oid}/right-relations`, {relationClassName}).then(res => {
    return res.data;
  });
};

/**
 * 删除右对象
 * /dwf/v1/omf/relations/{className}/objects-delete
 * @param className:String 关联类名
 * @param oids:Array 要删除的关联类的 oid
 * */

export const objectsDelete = ({className, oids}) => {
  return axios.post(`${baseObjOther}/omf/relations/${className}/objects-delete`, ...oids).then(res => {
    return res.data;
  });
};

// 查看关联类的单个对象
export const getRobjSingle = (name, oid, params) => {
  return axios.post(`${baseObjOther}/omf/relations/${name}/objects/${oid}`, params);
};

export const getEJobj = async function (name, params, needChildInfo) {
  let finalNeed = needChildInfo == undefined ? false : needChildInfo;
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
  return await axios.post(`${baseObjOther}/omf/relations/${name}/objects/joined?childInfo=${finalNeed}`, params ? params : {});
};

// 关联查询返回树形结果
export const getEJTree = async function (relationName, selfRelTreeReq, needChildCOunt, needCount) {
  return await axios.post(`${baseObjOther}/omf/relations/${relationName}/tree?childInfo=${needChildCOunt}&totalCount=${needCount}`, selfRelTreeReq ? selfRelTreeReq : {});
};

export const getDistinctValues = async function (className, name) {
  return await axios.post(`${baseObjOther}/omf/classes/${className}/attributes/${name}/distinct-values`, { queryObjReq: {} });
};

export const getDistinctValuesWithParams = async function (className, name, params) {
  return await axios.post(`${baseObjOther}/omf/classes/${className}/attributes/${name}/distinct-values`, params);
};


export const getClass = async function (name) {
  return await axios.get(`meta/classes/${name}`);
}

// app端websocket
export const getAllSockets = async function () {
  return await axios.get(`${baseObjOther}/websocket/socks/all`);
}

export const sendMsgToSock = async function (sockId, msg) {
  return await axios.post(`${baseObjOther}/websocket/sendMsgToOneSock?sockId=${sockId}`, { msg });
}

// modeler端websocket
export const getAllMdlSockets = async function () {
  return await axios.get(`/websocket/socks/all`);
}

export const sendMsgToMdlSock = async function (sockId, msg) {
  return await axios.post(`/websocket/sendMsgToOneSock?sockId=${sockId}`, { msg });
}

export const sendCode = async function (params) {
  return await axios.post(`code-upload`, params)
;}

export const getSuperControl = async function () {
  return await axios.get(`meta/superControl`);
}

export const getDWFAppConfig = async function () {
  return await axios.get(`config/configs`);
}

// 下载脚本日志
export const getScriptLogByDate = date => {
  return axios.get(`${baseUrlOther}/log/script-log?date=${date}`);
};
export const getScriptLogByMonth = date => {
  return axios.get(`${baseUrlOther}/log/script-log?month=${date}`);
};

// 获取数据库版本
export const getDbVersions = () => {
  return axios.get(`${baseUrlOther}/conf/db-vers`);
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

export const objectsSeleteByCondition = async function(className, params) {
  if('condition' in params){
    params.condition = params.condition.substring(0, 12) === "nativequery:" ? `nativequery:${encode64(params.condition.substring(12, params.condition.length))}` : params.condition;
  }
  return await axios.post(
    `${baseObjOther}/omf/entities/${className}/objects-delete-by-condition`,
    params ? params: {}
  );
};
