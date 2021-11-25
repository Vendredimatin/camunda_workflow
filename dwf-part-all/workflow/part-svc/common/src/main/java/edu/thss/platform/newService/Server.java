package edu.thss.platform.newService;

import com.google.common.base.Strings;
import edu.thss.platform.dao.wfprocess.WfProcessDefToClassDao;
import edu.thss.platform.dao.wfprocess.WfProcessDefinitionDao;
import edu.thss.platform.dao.wfprocess.WfProcessInstanceDao;
import edu.thss.platform.dao.wfprocess.WfProcessToObjectDao;
import edu.thss.platform.domain.wfprocess.WfProcessDefToClass;
import edu.thss.platform.domain.wfprocess.WfProcessDefinition;
import edu.thss.platform.domain.wfprocess.WfProcessInstance;

import edu.thss.platform.domain.wfprocess.WfProcessToObject;
import edu.thss.platform.newService.dwf.DWFContext;
import edu.thss.platform.newService.engine.EngineContext;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.sql.Timestamp;
import java.util.*;

@Service
public class Server {

    @Autowired
    EngineContext engineContext;
    @Autowired
    DWFContext dwfContext;
    @Autowired
    WfProcessInstanceDao processInstanceDao;
    @Autowired
    WfProcessDefinitionDao processDefinitionDao;
    @Autowired
    WfProcessDefToClassDao processDefToClassDao;
    @Autowired
    WfProcessToObjectDao processToObjectDao;

    public WfProcessDefinition createProcessDefinition(WfProcessDefinition processDefinition) {
        WfProcessDefinition newProcessDefinition = processDefinitionDao.save(processDefinition);
        WfProcessDefToClass wfProcessDefToClass = new WfProcessDefToClass(String.valueOf(newProcessDefinition.getId()), newProcessDefinition.getClassName());
        processDefToClassDao.save(wfProcessDefToClass);
        return newProcessDefinition;
    }

    public String deploy(String processDefinitionId) throws Exception {
        WfProcessDefinition processDefinition = processDefinitionDao.getOne(Long.valueOf(processDefinitionId));
        String deploymentId = engineContext.deploy(processDefinition.getName(), processDefinition.getBpmnXml());
        if(!Strings.isNullOrEmpty(deploymentId)){
            processDefinition.setProcessDeploymentId(deploymentId);
            processDefinition.setIsDeploy(true);
            processDefinition.setReleaseDate(new Timestamp(System.currentTimeMillis()));
            return deploymentId;
        }

        return "Error";
    }

    public WfProcessInstance launch(String processDefinitionId,
                                    String bindEnClassName,
                                    String enClassInstanceId) throws Exception {
        WfProcessInstance instance = new WfProcessInstance();
        WfProcessToObject wfProcessToObject = new WfProcessToObject();
        WfProcessDefinition processDefinition = processDefinitionDao.getOne(Long.valueOf(processDefinitionId));

        if(enClassInstanceId==null || enClassInstanceId.equals("")){
//          System.out.println("test:launch 1 基于模版发起流程，新生成实体类对象");
            String newEnObjId = dwfContext.createEnClass(bindEnClassName);
            wfProcessToObject.setEnClassOid(newEnObjId);
            wfProcessToObject.setEnClassName(bindEnClassName);
        } else {
            //System.out.println("test:launch 2 基于已有的实体类对象");
            wfProcessToObject.setEnClassOid(enClassInstanceId);
            wfProcessToObject.setEnClassName(bindEnClassName);
        }

        //下面还要写发起流程的情况
        String processInstanceId = engineContext.launch(instance.getProcessDeploymentId());
        instance.setProcessInstanceId(processInstanceId);
        instance.setTaskInstanceId("-1");
        instance.setLaunchTime(System.currentTimeMillis());
        instance.setProcessDeploymentId(processDefinition.getProcessDeploymentId());
        instance.setProcessDefinitionId(String.valueOf(processDefinition.getId()));

        processInstanceDao.save(instance);

        return instance;
    }

    public Integer getTaskCount(String userName, String filerStatus, String condition, List<String> groups) {
        Integer count = engineContext.getTaskCount(userName, groups);
        return count;
    }

    public List<Map<String,String>> getTaskList(String userName, String filerStatus, Integer pageIndex, Integer pageSize, String condition, List<String> groups) {
        List<Map<String,String>> tasks = engineContext.getTaskList(userName, groups);

        List<Map<String, String>> ret = new ArrayList<>();
        for (int i = 0; i < tasks.size(); i++){
            Map<String,String> task = tasks.get(i);

            String processDefinitionId = task.get("processDefinitionId");
            String taskDefinitionKey = task.get("taskDefinitionKey");
            String processInstanceId = task.get("processInstanceId");

            Map<String,String> extensionVariables = engineContext.getExtensionVariables(processDefinitionId, taskDefinitionKey);
            if (extensionVariables != null){
                for (Map.Entry<String,String> entry:extensionVariables.entrySet()){
                    task.put(entry.getKey(), entry.getValue());
                }
            }


            WfProcessToObject processToObject = processToObjectDao.getByProcessInstanceIdAndTaskInstanceId(processInstanceId, "-1");
            if(processToObject != null) {
                task.put("enClassInstanceId", processToObject.getEnClassOid());
                ret.add(task);
            }
        }

        return ret;
    }

    public String commitTask(String proInstanceId, String taskInstanceId, String userId, String userDisplayName, String userIp, String newUserId, String paramValues, String comment) {
        String success = "0";
        success = engineContext.commitTask(taskInstanceId, paramValues);
        return  success; // success
    }

    public String transferTask(String proInstanceId, String taskInstanceId, String userId, String userDisplayName, String userIp, String newUserId,String newUserName, String paramValues, String comment) {
        //String userName = dwfContext.getUserName(newUserId);
        String success = engineContext.transferTask(taskInstanceId, newUserName);
        if (!success.equals("500"))
            return "true";
        else return "false";
    }

    public List<WfProcessDefinition> getAllReleasedProcessTemplate(String userId) {
        return processDefinitionDao.findAllByAuthorIdAndIsDeploy(userId, true);
    }
}
