package edu.thss.platform.newService.engine;

import com.alibaba.fastjson.JSON;
import com.alibaba.fastjson.JSONObject;
import edu.thss.platform.constant.ConstantURL;
import edu.thss.platform.util.RestTemplateUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import springfox.documentation.spring.web.json.Json;

import java.util.*;

@Service
public class EngineContext {

    public String deploy(String processName, String bpmnXml){
        JSONObject requestBody = new JSONObject();
        requestBody.put("processName", processName);
        requestBody.put("bpmnXml", bpmnXml);
        String url = "http://127.0.0.1:8888/camunda/deploy/deploy-process";
        ResponseEntity<String> response = new RestTemplateUtils().post(url, requestBody, String.class);

        System.out.println(response.getStatusCode());
        System.out.println(response.getBody());
        return response.getBody();
    }

    public String launch(String deploymentId){
        JSONObject requestBody = new JSONObject();
        requestBody.put("deploymentId", deploymentId);
        String url = "http://127.0.0.1:8888/camunda/deploy/launch-process";
        ResponseEntity<String> response = new RestTemplateUtils().post(url, requestBody, String.class);
        System.out.println(response.getStatusCode());

        System.out.println(response.getBody());
        return response.getBody();
    }


    public Integer getTaskCount(String userName, List<String> groups) {
        int taskCount = getTaskCountByAssignee(userName) + getTaskCountByCandidateUser(userName) ;
        if (groups.size() != 0)
            taskCount += getTaskCountByCandidateGroups(groups);
        return taskCount;
    }

    public Integer getTaskCountByAssignee(String userName){
        String url = "http://localhost:8888/engine-rest/task/count?assignee={assignee}";

        ResponseEntity<String> entity = RestTemplateUtils.get(url, String.class, userName);
        System.out.println(entity.getStatusCode());
        String jsonStr = entity.getBody();
        JSONObject jsonObject = JSON.parseObject(jsonStr);
        int taskCount = (int) jsonObject.get("count");
        return taskCount;
    }

    public Integer getTaskCountByCandidateUser(String candidateUser){
        String url = "http://localhost:8888/engine-rest/task/count?candidateUser={candidateUser}";

        ResponseEntity<String> entity = RestTemplateUtils.get(url, String.class, candidateUser);
        System.out.println(entity.getStatusCode());
        String jsonStr = entity.getBody();
        JSONObject jsonObject = JSON.parseObject(jsonStr);
        int taskCount = (int) jsonObject.get("count");
        return taskCount;
    }

    public Integer getTaskCountByCandidateGroups(List<String> groups){
        String url = "http://localhost:8888/engine-rest/task/count?candidateGroups={candidateGroups}";
        String candidateGroups = "";
        for (String group : groups){
            candidateGroups += group + ",";
        }
        candidateGroups = candidateGroups.substring(0, candidateGroups.length()-1);

        ResponseEntity<String> entity = RestTemplateUtils.get(url, String.class, candidateGroups);
        String jsonStr = entity.getBody();
        JSONObject jsonObject = JSON.parseObject(jsonStr);
        int taskCount = (int) jsonObject.get("count");
        return taskCount;
    }

    public List<Map<String,String>> getTaskList(String userName, List<String> groups){
        // 从引擎取出来之后，需要根据taskId、processInstanceId分别补充实体类名、表单名、发起人等信息
        List<Map<String,String>> tasks = new ArrayList<>();
        List<Map<String,String>> tasksByAssignee = getTaskByAssignee(userName);
        List<Map<String,String>> tasksByCandidateUser = getTaskByCandidateUser(userName);
        if (groups.size() != 0) {
            List<Map<String, String>> tasksByCandidateGroups = getTaskByCandidateGroups(groups);
            tasks.addAll(tasksByCandidateGroups);
        }
        tasks.addAll(tasksByAssignee);
        tasks.addAll(tasksByCandidateUser);
        return tasks;
    }

    public List<Map<String,String>> getTaskByAssignee(String userName){
        String url = "http://localhost:8888/engine-rest/task?assignee={assignee}";

        ResponseEntity<List> entity = RestTemplateUtils.get(url, List.class, userName);
        List<Map<String,String>> tasks = entity.getBody();
        for (Map<String,String> map: tasks) {
            map.put("taskInstanceStatus", "4");
        }
        return tasks;
    }

    public List<Map<String,String>> getTaskByCandidateUser(String candidateUser){
        String url = "http://localhost:8888/engine-rest/task?candidateUser={candidateUser}";

        ResponseEntity<List> entity = RestTemplateUtils.get(url, List.class, candidateUser);
        List<Map<String,String>> tasks = entity.getBody();
        for (Map<String,String> map: tasks) {
            map.put("taskInstanceStatus", "1");
        }
        return tasks;
    }

    public List<Map<String,String>> getTaskByCandidateGroups(List<String> groups){
        String url = "http://localhost:8888/engine-rest/task?candidateGroups={candidateGroups}";
        String candidateGroups = "";
        for (String group : groups){
            candidateGroups += group + ",";
        }
        candidateGroups = candidateGroups.substring(0, candidateGroups.length()-1);

        ResponseEntity<List> entity = RestTemplateUtils.get(url, List.class, candidateGroups);
        List<Map<String,String>> tasks = entity.getBody();
        for (Map<String,String> map: tasks) {
            map.put("taskInstanceStatus", "1");
        }
        return tasks;
    }

    public Map<String,String> getExtensionVariables(String processDefinitionId, String taskDefinitionKey) {
        JSONObject requestBody = new JSONObject();
        requestBody.put("processDefinitionId", processDefinitionId);
        requestBody.put("taskDefinitionKey", taskDefinitionKey);
        System.out.println(processDefinitionId);
        System.out.println(taskDefinitionKey);
        String url = "http://127.0.0.1:8888/camunda/deploy/get-extension-variables";
        ResponseEntity<String> entity = RestTemplateUtils.post(url, requestBody, String.class);
        // 从引擎取出来之后，需要根据taskId、processInstanceId分别补充实体类名、表单名、发起人等信息
        String jsonStr = entity.getBody();
        Map<String, String> ret = (Map<String, String>) JSON.parse(jsonStr);
        return ret;
    }

    public String commitTask(String taskId, String paramsStr){
        String url = "http://127.0.0.1:8888/engine-rest/task/{id}/complete";
        JSONObject requestBody = new JSONObject();
        System.out.println("commitTask taskId:" + taskId);
        JSONObject object = new JSONObject();
        JSONObject params = new JSONObject();
        params.put("value", paramsStr);
        params.put("type", "json");
        //这个属性名需要定 todo
        object.put("t1",params);
        requestBody.put("variables", object);
        ResponseEntity<String> response = new RestTemplateUtils().post(url, requestBody, String.class, taskId);
        System.out.println(response.getStatusCode());

        if (response.getStatusCodeValue() == 204)
            return "true";
        else return String.valueOf(response.getStatusCodeValue());
    }

    public String transferTask(String taskInstanceId, String userName) {
        String url = "http://127.0.0.1:8888/engine-rest/task/{taskInstanceId}/assignee";
        JSONObject requestBody = new JSONObject();
        requestBody.put("userId", userName);
        ResponseEntity<String> response = new RestTemplateUtils().post(url, requestBody, String.class, taskInstanceId);
        System.out.println(response.getStatusCode());

        if (response.getStatusCodeValue() == 204)
            return "true";
        else return String.valueOf(response.getStatusCodeValue());
    }
}
