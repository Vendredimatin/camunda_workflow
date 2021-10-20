package edu.thss.platform.util;

import com.alibaba.fastjson.JSONObject;
import org.springframework.http.ResponseEntity;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;

import java.util.List;

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

        String url = "http://localhost:8888/engine-rest/task?assignee={assignee}";
        ResponseEntity<List> entity = RestTemplateUtils.get(url, List.class, "zhangsan");
        System.out.println(entity.getStatusCode());
        System.out.println(entity.getBody());
    }
}
