package edu.thss.platform.newService;

import com.alibaba.fastjson.JSONObject;
import com.google.common.base.Strings;
import com.google.common.collect.Lists;
import edu.thss.platform.dao.wfprocess.NewWfProcessInstanceDao;
import edu.thss.platform.dao.wfprocess.ReleasedWfProcessTemplateDao;
import edu.thss.platform.domain.wfprocess.NewWfProcessInstance;
import edu.thss.platform.domain.wfprocess.ReleasedWfProcessTemplate;

import edu.thss.platform.newService.dwf.DWFContext;
import edu.thss.platform.newService.engine.EngineContext;
import edu.thss.platform.service.wfprocess.core.runtime.workitem.WorkitemInfoDescriptor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class Server {

    @Autowired
    EngineContext engineContext;
    @Autowired
    DWFContext dwfContext;

    @Autowired
    ReleasedWfProcessTemplateDao releasedWfProcessTemplateDao;
    @Autowired
    NewWfProcessInstanceDao processInstanceDao;

    public NewWfProcessInstance createProcessInstance(String templateId, String enObjId) throws Exception {
        NewWfProcessInstance inst = new NewWfProcessInstance();
        inst.setTemplateId(templateId);
        inst.setLaunchTime(System.currentTimeMillis());
        inst.setEnClassInstanceId(enObjId);
        return inst;
    }

    public String deploy(ReleasedWfProcessTemplate template) throws Exception {
        String deploymentId = engineContext.deploy(template.getName(), template.getBpmnXml());
        if(!Strings.isNullOrEmpty(deploymentId)){
            return deploymentId;
        }

        return "Error";
    }

    public NewWfProcessInstance launch(String templateId,
                                           String bindEnClassName,
                                           String enClassInstanceId) throws Exception {
        NewWfProcessInstance instance = null;


        ReleasedWfProcessTemplate template= releasedWfProcessTemplateDao.findById(Long.parseLong(templateId)).get();

        if(enClassInstanceId==null || enClassInstanceId.equals("")){
//          System.out.println("test:launch 1 基于模版发起流程，新生成实体类对象");
            // 先创建实体类对象
            String newEnObjId = dwfContext.createEnClass(bindEnClassName);
            instance = createProcessInstance(templateId, newEnObjId);
        } else {
//                    System.out.println("test:launch 2 基于已有的实体类对象");
            instance = createProcessInstance(templateId, enClassInstanceId);
        }

        //下面还要写发起流程的情况
        String processInstanceId = engineContext.launch(template.getDeploymentId());
        instance.setProcessInstanceId(processInstanceId);
        instance.setProcessName(template.getName());
        instance.setDeploymentId(template.getDeploymentId());
        processInstanceDao.save(instance);

        return instance;
    }

    public Integer getTaskCount(String userName, String filerStatus, String condition) {
        Integer count = engineContext.getTaskCount(userName);
        return count;
    }

    public List<Map<String,String>> getTaskList(String userName, String filerStatus, Integer pageIndex, Integer pageSize, String condition) {
        List<Map<String,String>> tasks = engineContext.getTaskList(userName);

        List<Map<String, String>> ret = new ArrayList<>();
        for (int i = 0; i < tasks.size(); i++){
            Map<String,String> task = tasks.get(i);

            String processInstanceId = task.get("processInstanceId");
            String taskDefinitionKey = task.get("taskDefinitionKey");

            Map<String,String> extensionVariables = engineContext.getExtensionVariables(processInstanceId, taskDefinitionKey);
            if (extensionVariables != null){
                for (Map.Entry<String,String> entry:extensionVariables.entrySet()){
                    task.put(entry.getKey(), entry.getValue());
                }
            }


            NewWfProcessInstance newWfProcessInstance = processInstanceDao.findByProcessInstanceId(processInstanceId);
            if(newWfProcessInstance != null) {
                task.put("enClassInstanceId", newWfProcessInstance.getEnClassInstanceId());
                ret.add(task);
            }
        }

        return ret;
    }
}
