package edu.thss.platform.engine.service;

import camundajar.impl.com.google.gson.JsonObject;
import org.camunda.bpm.engine.ProcessEngine;
import org.camunda.bpm.engine.ProcessEngines;
import org.camunda.bpm.engine.RepositoryService;
import org.camunda.bpm.engine.RuntimeService;
import org.camunda.bpm.engine.repository.Deployment;
import org.camunda.bpm.engine.repository.DeploymentBuilder;
import org.camunda.bpm.engine.repository.ProcessDefinition;
import org.camunda.bpm.engine.runtime.ProcessInstance;
import org.camunda.bpm.model.bpmn.BpmnModelInstance;
import org.camunda.bpm.model.bpmn.instance.ExtensionElements;
import org.camunda.bpm.model.bpmn.instance.UserTask;
import org.camunda.bpm.model.bpmn.instance.camunda.CamundaProperties;
import org.camunda.bpm.model.bpmn.instance.camunda.CamundaProperty;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Collection;
import java.util.List;

@Service
public class DeploymentService {

    @Autowired
    ProcessEngine processEngine;

    public String deploy(String processName, String bpmnXml){
        ProcessEngine processEngine = ProcessEngines.getDefaultProcessEngine();
        RepositoryService repositoryService = processEngine.getRepositoryService();
        DeploymentBuilder builder = repositoryService.createDeployment();

        String resourceName = processName + ".bpmn";
        Deployment deployment =  builder.addString(resourceName,bpmnXml).deploy();
        return deployment.getId();
    }

    public String launch(String deploymentId){
        ProcessEngine processEngine = ProcessEngines.getDefaultProcessEngine();
        RepositoryService repositoryService = processEngine.getRepositoryService();
        ProcessDefinition def = repositoryService.createProcessDefinitionQuery().deploymentId(deploymentId).singleResult();
        String processDefinitionId = def.getId();

        RuntimeService runtimeService = processEngine.getRuntimeService();
        ProcessInstance instance = runtimeService.startProcessInstanceById(processDefinitionId);
        return instance.getProcessInstanceId();
    }

    public JsonObject getExtensionVariables(String processDefinitionId, String taskDefinitionKey){
        ProcessEngine processEngine = ProcessEngines.getDefaultProcessEngine();
        RepositoryService repositoryService = processEngine.getRepositoryService();
        BpmnModelInstance modelInstance = repositoryService.getBpmnModelInstance(processDefinitionId);

        UserTask userTask = modelInstance.getModelElementById(taskDefinitionKey);

        ExtensionElements extensionElements = userTask.getExtensionElements();

        JsonObject jsonObject = new JsonObject();

        if (extensionElements == null){
            return jsonObject;
        }

        Collection<CamundaProperty> properties = extensionElements .getElementsQuery()
                .filterByType(CamundaProperties.class)
                .singleResult()
                .getCamundaProperties();


        for (CamundaProperty property : properties) {
            String name = property.getCamundaName();
            String value = property.getCamundaValue();
            jsonObject.addProperty(name,value);
        }

        return jsonObject;
    }



}
