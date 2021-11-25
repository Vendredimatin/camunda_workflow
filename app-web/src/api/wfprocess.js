import axios from "../libs/anotherAxios";
import global_ from "../views/global.vue";

let baseObjOther = global_.baseObjOther;
let baseUrl = global_.baseUrl;

// 新建流程模版
export const createTemplate = templates => {
  return axios.post(`${baseObjOther}/workflow/buildtime/create-process-template`, templates).then(res => res.data);
};

// 保存流程模版
export const saveTemplate = templates => {
  return axios.post(`${baseObjOther}/workflow/buildtime/save-process-template`, templates).then(res => res.data);
};

// 获取用户的流程模版列表
// process-templates/{userId}
export const getTemplates = (userId) => {
  return axios.get(`${baseObjOther}/workflow/buildtime/process-templates/${userId}`).then(res => res.data);
};

// 获取所有流程模版列表
// process-templates/{userId}
export const getAllTemplates =()=> {
  return axios.get(`${baseObjOther}/workflow/buildtime/all-process-templates`).then(res => res.data);
};

// 删除未发布的流程模版
export const deleteTemplate = (templateId) => {
  return axios.post(`${baseObjOther}/workflow/buildtime/delete-process-template/${templateId}`).then( res => res.data);
};

// 删除已发布的流程模版
export const deleteRlTemplate = (templateId) => {
  return axios.post(`${baseObjOther}/workflow/buildtime/delete-released-template/${templateId}`).then( res => res.data);
};

// 发布一个流程流程模版
export const releaseTemplate = (processDefinitionId) => {
  return axios.post(`${baseObjOther}/workflow/buildtime/release-process-template/${processDefinitionId}`).then( res => res.data);
};

// 
export const startupProcess = () => {
    return axios.post(`${baseObjOther}/workflow/runtime/startup-process-engine`).then(res => res.data);
};
// 获取用户的已发布流程模版列表
// process-templates/{userId}
export const getRlTemplates = (userId) => {
    return axios.get(`${baseObjOther}/workflow/administrate/released-process-templates/${userId}`).then(res => res.data);
};
// 获取已发布的流程模版的起始表单
export const getLaunchForm = (templateId) => {
    return axios.get(`${baseObjOther}/workflow/runtime/released-template/${templateId}/launch-form`).then(res => res.data);
};


// 基于模版发起流程（新建绑定类对象）
export const launchProcessByNewObj = (param, config) => {
    return axios.post(`${baseObjOther}/workflow/runtime/released-template/launch-byNewObj`,param,config).then(res => res.data);
};

// 基于已有对象发起流程
export const launchProcessByObjId = (param) => {
    return axios.post(`${baseObjOther}/workflow/runtime/released-template/launch-byObjId`,param).then(res => res.data);
};

// 获取用户的任务列表个数
export const getTaskInstCount = (params) => {
    return axios.post(`${baseObjOther}/workflow/administrate/task-instances-count`,params).then(res => res.data);
};
// 获取用户的任务列表
export const getManualTaskInstances = (params) => {
    return axios.post(`${baseObjOther}/workflow/administrate/task-instances`,params).then(res => res.data);
};

// 获取用户的流程实例个数
export const getProInstCount = (params) => {
    return axios.post(`${baseObjOther}/workflow/administrate/process-instances-count`,params).then(res => res.data);
};

// 获取用户的流程实例列表
export const getProcessInstances = (params) => {
    return axios.post(`${baseObjOther}/workflow/administrate/process-instances`,params).then(res => res.data);
};

// 基于已有对象发起流程时获取可发起的模版
export const getRlProListToLuanch = (classname,userId) => {
    return axios.post(`${baseObjOther}/workflow/administrate/released-templates-luanch?classname=${classname}&userId=${userId}`).then(res => res.data);
};
// 通过流程实例id获得流程实例
export const getWfProcessInstance = (proInstanceId) => {
    return axios.get(`${baseObjOther}/workflow/administrate/wfprocess-instance/${proInstanceId}`).then(res => res.data);
};
// 领取工作项
export const receiveTaskInstance = (proId,taskId,userId,userDisplayName) => {
    return axios.post(`${baseObjOther}/workflow/administrate/receive-task-instance?proId=${proId}&taskId=${taskId}&userId=${userId}&userDisplayName=${userDisplayName}`).then(res => res.data);
};

// 对任务进行操作
export const sendCommand = (data) => {
    return axios.post(`${baseObjOther}/workflow/runtime/process-instance-command`,data).then(res => res.data);

};

//提交任务
export const commitTask = (params) => {
    return axios.post(`${baseObjOther}/workflow/runtime/process-instance-commit`,params).then(res => res.data);
};

//移交任务
export const transferTask = (params) => {
    return axios.post(`${baseObjOther}/workflow/runtime/process-instance-transfer`,params).then(res => res.data);
};

// 删除流程实例
export const deleteProcessInstance = (proInstanceId) => {
    return axios.post(`${baseObjOther}/workflow/runtime/process-instance/${proInstanceId}/delete`).then(res => res.data);
};

// 获取流程实例的讨论内容
export const getWfComments = (proInstanceId) => {
    return axios.get(`${baseObjOther}/workflow/runtime/process-instance/${proInstanceId}/comments`).then(res => res.data);
};
// 获取流程实例的讨论区
export const getWfCommentArea = (proInstanceId , status) => {
    return axios.get(`${baseObjOther}/workflow/runtime/process-instance/${proInstanceId}/comments-area?status=${status}`).then(res => res.data);
};
// 添加任务实例的讨论内容
export const addTaskComment = (proId, taskId , comment) => {
    return axios.post(`${baseObjOther}/workflow/runtime/process-instance/${proId}/task-instance/${taskId}/add-comment`,comment).then(res => res.data);
};

        
// 获取流程实例的参与人员列表
export const getProInvitations = (proInstanceId) => {
    return axios.get(`${baseObjOther}/workflow/runtime/process-instance/${proInstanceId}/invitations`).then(res => res.data);
};
// 添加流程实例的参与人员
export const addProInvitation = (proInstanceId,invitation) => {
    return axios.post(`${baseObjOther}/workflow/runtime/process-instance/${proInstanceId}/add-invitation`,"invitation="+invitation).then(res => res.data);
};
// 移除流程实例的参与人员
export const removeProInvitation = (proInstanceId,invitation) => {
    return axios.post(`${baseObjOther}/workflow/runtime/process-instance/${proInstanceId}/remove-invitation`,"invitation="+invitation).then(res => res.data);
};

// // 获取流程实例的抄送人员列表
// export const getProCopiers = (proInstanceId) => {
//     return axios.get(`workflow/runtime/process-instance/${proInstanceId}/copiers`).then(res => res.data);
// };

// 添加流程实例的抄送人员
export const addProCopier = (proInstanceId,copier) => {
    return axios.post(`${baseObjOther}/workflow/runtime/process-instance/${proInstanceId}/add-copier`,"copier="+copier).then(res => res.data);
};
// 移除流程实例的抄送人员
export const removeProCopier = (proInstanceId,copier) => {
    return axios.post(`${baseObjOther}/workflow/runtime/process-instance/${proInstanceId}/remove-copier`,"copier="+copier).then(res => res.data);
};
// 重新发起
export const restartProcessInstance = (param) => {
    return axios.post(`${baseObjOther}/workflow/runtime/process-instance/restart-process`,param).then( res => res.data);
};
// 获取该业务对象所在的任务列表
export const getRunningManualTaskByObj = (param) => {
    return axios.post(`${baseObjOther}/workflow/administrate/task-instances-byobj`,param).then( res => res.data);
};
export const searchApplicationProcService = (params) => {
    return axios.post(`${baseObjOther}/workflow/administrate/search-process-instance`,params).then( res => res.data);
}