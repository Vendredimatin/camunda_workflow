package edu.thss.platform.newService;

import com.alibaba.fastjson.JSONObject;
import com.google.common.base.Strings;
import edu.thss.platform.dao.wfprocess.ReleasedWfProcessTemplateDao;
import edu.thss.platform.domain.wfprocess.NewWfProcessInstance;
import edu.thss.platform.domain.wfprocess.ReleasedWfProcessTemplate;

import edu.thss.platform.newService.dwf.DWFContext;
import edu.thss.platform.newService.engine.EngineContext;
import edu.thss.platform.service.wfprocess.core.runtime.workitem.WorkitemInfoDescriptor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class Server {

    @Autowired
    EngineContext engineContext;
    @Autowired
    DWFContext dwfContext;

    @Autowired
    ReleasedWfProcessTemplateDao releasedWfProcessTemplateDao;

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

        String deploymentId = releasedWfProcessTemplateDao.findById(Long.parseLong(templateId)).get().getDeploymentId();

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
        String processInstanceId = engineContext.launch(deploymentId);
        if(!Strings.isNullOrEmpty(deploymentId)){
            instance.setDeploymentId(deploymentId);
        }

        return instance;
    }

    public Integer getTaskCount(String userName, String filerStatus, String condition) {
        Integer count = engineContext.getTaskCount(userName);
        return count;
    }

    public List<JSONObject> getTaskList(String userName, String filerStatus, Integer pageIndex, Integer pageSize, String condition) {
        List<JSONObject> taskList = engineContext.getTaskList(userName);
        return taskList;
    }
}
