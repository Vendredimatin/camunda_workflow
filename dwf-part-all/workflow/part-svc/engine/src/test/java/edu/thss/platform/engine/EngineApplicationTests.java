package edu.thss.platform.engine;

import org.camunda.bpm.engine.*;
import org.camunda.bpm.engine.repository.ProcessDefinition;
import org.camunda.bpm.engine.runtime.ProcessInstance;
import org.camunda.bpm.engine.task.Task;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;

import java.util.List;

@SpringBootTest
class EngineApplicationTests {

    @Test
    void contextLoads() {
        String deploymentId = "f868dd23-30ad-11ec-bcd0-32b49eea4695";
        ProcessEngine processEngine = ProcessEngines.getDefaultProcessEngine();
        RepositoryService repositoryService = processEngine.getRepositoryService();
        ProcessDefinition def = repositoryService.createProcessDefinitionQuery().deploymentId(deploymentId).singleResult();
        String processDefinitionId = def.getId();

        RuntimeService runtimeService = processEngine.getRuntimeService();
        ProcessInstance instance = runtimeService.startProcessInstanceById(processDefinitionId);
        System.out.println(instance.getId());
        long count = runtimeService.createProcessInstanceQuery().count();
        System.out.println(count);
    }

    @Test
    void testLaunch(){
        ProcessEngine processEngine = ProcessEngines.getDefaultProcessEngine();
        RuntimeService runtimeService = processEngine.getRuntimeService();
        long count = runtimeService.createProcessInstanceQuery().count();
        System.out.println(count);
    }

    @Test
    void getActiveProcess(){
        ProcessEngine processEngine = ProcessEngines.getDefaultProcessEngine();
        RuntimeService runtimeService = processEngine.getRuntimeService();

        List<ProcessInstance> pis = runtimeService.createProcessInstanceQuery().active().list();
        System.out.println(pis.size());
    }

    @Test
    void getCorrespondingTask(){
        ProcessEngine processEngine = ProcessEngines.getDefaultProcessEngine();
        TaskService taskService = processEngine.getTaskService();


        String assignee2 = "wangwu";
        List<Task> tasks2 = taskService.createTaskQuery().taskAssignee(assignee2).list();

        System.out.println(tasks2.size());
    }

}
