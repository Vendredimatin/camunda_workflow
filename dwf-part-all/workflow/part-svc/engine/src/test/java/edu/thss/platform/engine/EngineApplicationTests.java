package edu.thss.platform.engine;

import camundajar.impl.com.google.gson.JsonObject;
import org.camunda.bpm.engine.*;
import org.camunda.bpm.engine.repository.ProcessDefinition;
import org.camunda.bpm.engine.runtime.ProcessInstance;
import org.camunda.bpm.engine.task.Task;
import org.camunda.bpm.model.bpmn.BpmnModelInstance;
import org.camunda.bpm.model.bpmn.instance.ExtensionElements;
import org.camunda.bpm.model.bpmn.instance.UserTask;
import org.camunda.bpm.model.bpmn.instance.camunda.CamundaProperties;
import org.camunda.bpm.model.bpmn.instance.camunda.CamundaProperty;
import org.camunda.bpm.model.xml.instance.ModelElementInstance;
import org.camunda.spin.impl.json.jackson.JacksonJsonNode;
import org.camunda.spin.json.SpinJsonNode;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;

import java.util.Collection;
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
        Task task1 = tasks2.get(0);
        Task task2 = tasks2.get(1);

        getExetensionElements(task1);
        getExetensionElements(task2);

        System.out.println(tasks2.size());
    }

    void getExetensionElements(Task task){
        ProcessEngine processEngine = ProcessEngines.getDefaultProcessEngine();
        RepositoryService repositoryService = processEngine.getRepositoryService();
        BpmnModelInstance modelInstance = repositoryService.getBpmnModelInstance(task.getProcessDefinitionId());

        UserTask userTask = modelInstance.getModelElementById(task.getTaskDefinitionKey());

        ExtensionElements extensionElements = userTask.getExtensionElements();

        Collection<CamundaProperty> properties = extensionElements .getElementsQuery()
                .filterByType(CamundaProperties.class)
                .singleResult()
                .getCamundaProperties();

        for (CamundaProperty property : properties) {
            String name = property.getCamundaName();
            String value = property.getCamundaValue();
        }
    }

    @Test
    public void getVariable(){
        String taskInstanceId = "aaa80be4-3700-11ec-bf3d-32b49eea4695";//"b9e83994-3188-11ec-9ffe-32b49eea4695";
        ProcessEngine processEngine = ProcessEngines.getDefaultProcessEngine();
        TaskService taskService = processEngine.getTaskService();
        JacksonJsonNode node = (JacksonJsonNode) taskService.getVariable(taskInstanceId, "t1");
        SpinJsonNode spinJsonNode = node.prop("type");
        System.out.println(spinJsonNode.value());
        System.out.println(node.prop("x").value());
    }

    @Test
    public void getProcessVariables(){
        String processInstanceId = "13311e78-3c7c-11ec-97ab-0205857feb80";//"2b35d66d-3707-11ec-bf3d-32b49eea4695";//"c8770f28-3706-11ec-bf3d-32b49eea4695";//"56dc8748-3705-11ec-bf3d-32b49eea4695";//"aaa68541-3700-11ec-bf3d-32b49eea4695";//"b9e83994-3188-11ec-9ffe-32b49eea4695";
        ProcessEngine processEngine = ProcessEngines.getDefaultProcessEngine();
        TaskService taskService = processEngine.getTaskService();
        RuntimeService runtimeService = processEngine.getRuntimeService();

        JacksonJsonNode node = (JacksonJsonNode) runtimeService.getVariable(processInstanceId, "t1");
        SpinJsonNode spinJsonNode = node.prop("woTitle");
        System.out.println(spinJsonNode.value());
        System.out.println(node.prop("x").value());
    }

}
