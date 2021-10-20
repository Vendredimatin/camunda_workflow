package edu.thss.platform.newService.engine;

import com.alibaba.fastjson.JSONObject;
import edu.thss.platform.constant.ConstantURL;
import edu.thss.platform.util.RestTemplateUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import springfox.documentation.spring.web.json.Json;

import java.util.List;

@Service
public class EngineContext {

    public String deploy(String processName, String bpmnXml){
        JSONObject requestBody = new JSONObject();
        requestBody.put("processName", processName);
        requestBody.put("bpmnXml", bpmnXml);
        String url = "http://127.0.0.1:8888/camunda/depoly/deploy-process";
        ResponseEntity<String> response = new RestTemplateUtils().post(url, requestBody, String.class);

        System.out.println(response.getStatusCode());
        System.out.println(response.getBody());
        return response.getBody();
    }

    public String launch(String deploymentId){
        JSONObject requestBody = new JSONObject();
        requestBody.put("deploymentId", deploymentId);
        String url = "http://127.0.0.1:8888/camunda/depoly/launch-process";
        ResponseEntity<String> response = new RestTemplateUtils().post(url, requestBody, String.class);
        System.out.println(response.getStatusCode());

        System.out.println(response.getBody());
        return response.getBody();
    }


    public Integer getTaskCount(String userName) {
        String url = "http://localhost:8888/engine-rest/task/count?assignee={assignee}";
        ResponseEntity<String> entity = RestTemplateUtils.get(url, String.class, userName);
        System.out.println(entity.getStatusCode());
        System.out.println(entity.getBody());
        return Integer.parseInt(entity.getBody());
    }

    public List<JSONObject> getTaskList(String userName){
        String url = "http://localhost:8888/engine-rest/task?assignee={assignee}";
        ResponseEntity<List> entity = RestTemplateUtils.get(url, List.class, userName);
        // 从引擎取出来之后，需要根据taskId、processInstanceId分别补充实体类名、表单名、发起人等信息
        return entity.getBody();
    }

}
