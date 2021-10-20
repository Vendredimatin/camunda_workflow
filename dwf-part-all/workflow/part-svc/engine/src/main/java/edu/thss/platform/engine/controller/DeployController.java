package edu.thss.platform.engine.controller;

import edu.thss.platform.engine.service.DeploymentService;
import io.swagger.annotations.Api;
import io.swagger.annotations.ApiOperation;
import io.swagger.annotations.ApiParam;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@Api(tags = {"工作流运行时"})
@RestController
@RequestMapping("/camunda/depoly")
public class DeployController {

    @Autowired
    DeploymentService deploymentService;

    @ApiOperation(value = "部署流程")
    @PostMapping(path = "deploy-process")
    public String deployProcess(@ApiParam(value = "请求示例：\n```\n " +
            "{\n" +
            "    \"processName\":\"leave\",\n" +
            "    \"bpmnXml\":\"1\",\n" +
            "}\n```", required = true) @RequestBody Map<String, Object> param) {
        try {
            System.out.println(1);
            String processName = (String)param.get("processName");
            String bpmnXml = (String)param.get("bpmnXml");
            System.out.println(processName);
            System.out.println(bpmnXml);
            String deploymentId = deploymentService.deploy(processName, bpmnXml);
            if(deploymentId != null){
                return deploymentId;
            }else {
                return "error";// success
            }
        } catch (Exception e) { e.printStackTrace(); return "404"; }
    }

    @ApiOperation(value = "发起流程")
    @PostMapping(path = "launch-process")
    public String launchProcess(@ApiParam(value = "请求示例：\n```\n " +
            "{\n" +
            "    \"deploymentId\":\"leave\",\n" +
            "}\n```", required = true) @RequestBody Map<String, Object> param) {
        try {
            System.out.println(1);
            String deploymentId = (String)param.get("deploymentId");
            String processInstanceId = deploymentService.launch(deploymentId);
            if(processInstanceId != null){
                return processInstanceId;
            }else {
                return "error";// success
            }
        } catch (Exception e) { e.printStackTrace(); return "404"; }
    }

}
