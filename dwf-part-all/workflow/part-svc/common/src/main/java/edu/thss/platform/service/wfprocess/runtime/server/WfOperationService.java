package edu.thss.platform.service.wfprocess.runtime.server;

import edu.thss.platform.dao.itemclass.QueryOprConfigDao;
import edu.thss.platform.dao.modeler.impl.RuleDao;
import edu.thss.platform.domain.itemclass.opr.QueryOprConfig;
import edu.thss.platform.domain.modeler.MetaClassDO;
import edu.thss.platform.domain.modeler.valuetype.ClassCategory;
import edu.thss.platform.exception.PlatformException;
import edu.thss.platform.service.modeler.MetaModelService;
import edu.thss.platform.service.omf.ObjectAccessService;
import edu.thss.platform.service.omf.ScriptExecuterService;
import edu.thss.platform.service.org.bo.Environment;
import edu.thss.platform.service.wfprocess.core.buildtime.wfprocess.task.AbstractTask;
import edu.thss.platform.service.wfprocess.core.runtime.wfprocess.WfProcessInstance;
import edu.thss.platform.service.wfprocess.core.runtime.wfprocess.task.ManualTaskInstance;
import edu.thss.platform.service.wfprocess.runtime.engine.PEngine;
import edu.thss.platform.utils.BeanHelper;
import edu.thss.platform.utils.EnvironmentBuilder;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import javax.persistence.EntityManager;
import javax.persistence.PersistenceContext;
import javax.persistence.Query;
import javax.script.ScriptException;
import java.util.*;

@Service
public class WfOperationService {

    @Autowired
    QueryOprConfigDao queryOprConfigDao;

    @Autowired
    EnvironmentBuilder environmentBuilder;


    @Autowired
    WfScriptExecuterService wfScriptExecuterService;

    @Autowired
    ObjectAccessService objectAccessService;

    @PersistenceContext
    EntityManager em;

    public QueryOprConfig getQueryOprByName(String name){
        return queryOprConfigDao.getByName(name);
    }

//    public Object executeOperation(String operationName, String className, Object obj,
//                                   PEngine pEngine, WfProcessInstance wfProcessInstance, AbstractTask taskInstance) {
//
//        Map<String, Object> objMap = new HashMap<>();
//        UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken("admin", "", new ArrayList<>());
//        SecurityContextHolder.getContext().setAuthentication(authentication);
//
//        Environment environment = environmentBuilder.buildEnvironment();
//        if(environment!=null && className!= null && wfProcessInstance.getEnClassInstanceId()!=null){
//            objMap = objectAccessService.getByOid(environment, className, wfProcessInstance.getEnClassInstanceId());
//        }
//        return executeOperation(operationName, className, Arrays.asList(objMap), pEngine,wfProcessInstance, taskInstance);
//    }
    public Object executeOperation(String operationName, String className, List objs,
                                   PEngine pEngine, WfProcessInstance wfProcessInstance, AbstractTask taskInstance){
        return this.executeOperation(operationName, className, objs, environmentBuilder.buildEnvironment(),
                pEngine, wfProcessInstance, taskInstance);
    }


    public Object executeOperation(String operationName, String className, Object obj, Environment environment,
                                   PEngine pEngine, WfProcessInstance wfProcessInstance, AbstractTask taskInstance) {

        return executeOperation(operationName, className, Arrays.asList(obj),environment, pEngine,wfProcessInstance, taskInstance);
    }

    public Object executeOperation(String operationName, String className, List objs,Environment environment,
                                   PEngine pEngine, WfProcessInstance wfProcessInstance, AbstractTask taskInstance){
        String content;
        System.out.println("queryOprConfigDa==null:::"+(queryOprConfigDao==null));
        QueryOprConfig queryOprConfig = getQueryOprByName(operationName);
        if(queryOprConfig == null) {
            return new PlatformException("快速查询操作" + operationName + "不存在");
        }
        content = queryOprConfig.getConditionExpre();
//        System.out.println("executeOperation content:"+content);

        if(content.startsWith("serverScript:")){
            try {
                return wfScriptExecuterService.executeScript(
                        className,
                        content.substring("serverScript:".length()),
                        environment, em, objs,
                        pEngine,wfProcessInstance,taskInstance);
            } catch (ScriptException e) {
                throw new PlatformException("脚本执行错误，请查看日志");
            }
        }
        return null;
    }



}
