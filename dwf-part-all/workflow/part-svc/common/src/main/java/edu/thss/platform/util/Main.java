package edu.thss.platform.util;

import com.alibaba.fastjson.JSON;
import com.alibaba.fastjson.JSONObject;
import org.springframework.http.ResponseEntity;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;

import java.util.List;
import java.util.Map;

public class Main {
    public static void main(String[] args) {
        /*String url = "http://127.0.0.1:8888/camunda/depoly/deploy-process";
        JSONObject requestBody = new JSONObject();
        requestBody.put("templateId", "1");
        requestBody.put("processName", "2133");
        ResponseEntity<String> response = RestTemplateUtils.post(url, requestBody, String.class);

        System.out.println(response.getStatusCode());
        System.out.println(response.getBody());*/
        /*String url = "http://localhost:8888/engine-rest/task/count?assignee={assignee}";
        ResponseEntity<String> entity = RestTemplateUtils.get(url, String.class, "zhangsan");
        System.out.println(entity.getStatusCode());
        System.out.println(entity.getBody());*/

        /*String url = "http://localhost:8888/engine-rest/task?assignee={assignee}";
        ResponseEntity<List> entity = RestTemplateUtils.get(url, List.class, "zhangsan");
        System.out.println(entity.getStatusCode());
        System.out.println(entity.getBody());*/

        String url = "http://127.0.0.1:8888/engine-rest/task/{id}/complete";
        String taskId = "1331458b-3c7c-11ec-97ab-0205857feb80";
        String paramsValues = "{\"oid\":\"FFE9627ABD46794CBC3A7248D1C09232\",\"lastModifyTime\":1636015767467,\"woTitle\":\"wangwu\",\"woDesc\":\"10\",\"_customdata\":{\"leaderOpinion\":\"同意\"}}";
        JSONObject requestBody = new JSONObject();
        // Map<String,String> params = (Map<String, String>) JSON.parse(paramsValues);
        JSONObject object = new JSONObject();
        JSONObject params = new JSONObject();

        params.put("value", paramsValues);
        params.put("type", "json");
        object.put("t1",params);
        requestBody.put("variables", object);
        System.out.println("commitTask taskId:" + taskId);
        ResponseEntity<String> response = new RestTemplateUtils().post(url, requestBody, String.class, taskId);
        System.out.println(response.getStatusCode());
    }
}
