package edu.thss.platform.controller.wfprocess;

import edu.thss.platform.controller.ResponseMsg;
import edu.thss.platform.domain.wfprocess.WfProcessInstance;
import edu.thss.platform.newService.Server;
import io.swagger.annotations.Api;
import io.swagger.annotations.ApiOperation;
import io.swagger.annotations.ApiParam;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.*;

/**
 * http://www.cnblogs.com/xiaogangqq123/archive/2011/03/04/1971002.html
 *
 * @author Dahai Cao lastupdated on 20171207
 */
@Api(tags = {"工作流运行时"})
@RestController
@RequestMapping("/dwf/v1/workflow/runtime")
public class RuntimeWorkflowController {

    @Autowired
    Server server;

    /*@ApiOperation(value = "启动流程引擎")
    @PostMapping(path = "startup-process-engine")
    public ResponseMsg startupProcess() {
        try {
            SaaSServer.getInstance().powerOn();
            return new ResponseMsg();// success
        } catch (Exception e) { e.printStackTrace(); return new ResponseMsg(404); }
    }

    @ApiOperation(value = "关闭流程引擎")
    @PostMapping(path = "stop-process-engine")
    public ResponseMsg stopProcess() {
        try {
            SaaSServer.getInstance().powerOff();
            return new ResponseMsg();// success
        } catch (Exception e) { e.printStackTrace(); return new ResponseMsg(404); }
    }

    @ApiOperation(value = "重启流程引擎")
    @PostMapping(path = "restart-process-engine")
    public ResponseMsg restartProcess() {
        try {
            SaaSServer.getInstance().restart();
            return new ResponseMsg();// success
        } catch (Exception e) { e.printStackTrace(); return new ResponseMsg(404); }
    }*/
    
    /*@ApiOperation(value = "重新发起流程实例")
    @PostMapping(path = "process-instance/restart-process")
    public ResponseMsg<WorkitemInfoDescriptor> restartProcessInstance(@ApiParam(value = "请求示例：\n```\n " +
            "{\n" +
            "    \"userId\":\"53B68E57C5D8D94F937A1F0354CAB473\",\n" +
            "    \"userDisplayName\":\"工作流用户\",\n" +
            "    \"proInstanceId\":\"pid\",\n" +
            "}\n```", required = true) @RequestBody Map<String, Object> params) {
    // 无权限判断
        try {
            String userId = (String) params.get("userId");
            String userDisplayName = (String) params.get("userDisplayName");
            String pid = (String) params.get("proInstanceId");
            WorkitemInfoDescriptor r =  SaaSServer.getInstance().restartProcessInstance(userId, userDisplayName, pid);
            if (r != null) return new ResponseMsg(r);// success
            else return new ResponseMsg(404); // failed
        } catch (Exception e) { e.printStackTrace(); return new ResponseMsg(404); }
    }*/

    @ApiOperation(value = "基于模版发起流程（新建绑定类对象）")
    @PostMapping(path = "released-template/launch-byNewObj")
    public ResponseMsg<WfProcessInstance> launchProcessByNewObj(@ApiParam(value = "请求示例：\n```\n " +
            "{\n" +
            "    \"templateId\":\"000000000002aj\",\n" +
            "    \"userId\":\"53B68E57C5D8D94F937A1F0354CAB473\",\n" +
            "    \"userDisplayName\":\"工作流用户\",\n" +
            "    \"bindEnClassName\":\"className\",\n" +
            "    \"paramValues\":\"paramValues\",\n" +
            "}\n```", required = true) @RequestBody Map<String, Object> params) {
        try {
            String processDefinitionId = String.valueOf(params.get("processDefinitionId"));
            String bindEnClassName = (String) params.get("className");
            String enClassInstanceId = (String) params.get("enClassInstanceId");

            WfProcessInstance instance = server.launch( processDefinitionId, bindEnClassName, enClassInstanceId);
            if (instance!=null) return new ResponseMsg<>(instance);
            else return new ResponseMsg<>(404);
        } catch (Exception e) { e.printStackTrace(); return new ResponseMsg(404,"发起失败"); }
    }

    /*@ApiOperation(value = "基于已有对象发起流程")
    @PostMapping(path = "released-template/launch-byObjId")
    public ResponseMsg<WorkitemInfoDescriptor> launchProcessByObjId(@ApiParam(value = "请求示例：\n```\n " +
            "{\n" +
            "    \"templateId\":\"000000000002aj\",\n" +
            "    \"userId\":\"53B68E57C5D8D94F937A1F0354CAB473\",\n" +
            "    \"userDisplayName\":\"工作流用户\",\n" +
            "    \"enClassInstanceId\":\"53B68E57C5D8D94F937A1F0354CAB473\",\n" +
            "    \"bindEnClassName\":\"className\",\n" +
            "    \"paramValues\":\"paramValues\",\n" +
            "    \"copiers\":\"[{\"name\": \"String\",\"oid\": \"String\"}]\",\n" +
            "}\n```", required = true) @RequestBody Map<String, Object> params) {
        try {
            // 此接口不限制权限
            String templateId = (String) params.get("templateId");
            String userId = (String) params.get("userId");
            String userDisplayName = (String) params.get("userDisplayName");
            String bindEnClassName = (String) params.get("bindEnClassName");
            String paramValues = (String) params.get("paramValues");
            String enClassInstanceId = (String) params.get("enClassInstanceId");
            String copiers = (String) params.get("copiers");
            String bindCurrentProcess = SaaSServer.getInstance().bindCurrentProcess(bindEnClassName, enClassInstanceId);
            if (bindCurrentProcess!="" && bindCurrentProcess!=null && bindCurrentProcess.length() == 32)
                return new ResponseMsg(403,"该对象已绑定在流程实例"+bindCurrentProcess+"中");

            WorkitemInfoDescriptor r =  SaaSServer.getInstance().launchProcessByObjId(templateId,userId,userDisplayName,bindEnClassName,paramValues, enClassInstanceId, copiers);
            if (r != null) return new ResponseMsg<>(r);
            else return new ResponseMsg<>(404);
        } catch (Exception e) { e.printStackTrace(); return new ResponseMsg(403,e.getMessage()); }
    }*/

    /*@ApiOperation(value = "已发布的流程模版的起始表单")
    @GetMapping(path = "released-template/{templateId}/launch-form")
    public ResponseMsg<String> getLaunchForm(@ApiParam(value = "已发布的流程模版Id", required = true) @PathVariable String templateId) {
        try {

            ReleasedWfProcessBlo blo = ReleasedWfProcessBlo.getInstance();
            if (templateId == null)  return new ResponseMsg(404);
            String form =  blo.getLaunchForm(templateId);
            if (form == null) {return new ResponseMsg(404);}
            return new ResponseMsg<>(form);
        } catch (Exception e) { e.printStackTrace(); return new ResponseMsg(404); }
    }*/

    /*@ApiOperation(value = "对任务进行操作")
    @PostMapping(path = "process-instance-command")
    public ResponseMsg sendCommandWithSaving(@ApiParam(value = "请求示例：\n```\n " +
            "{\n" +
            "    \"cmd\":\"执行命令，0:保存;1:关闭;2:提交;3:退回;4:移交\",\n" +
            "    \"proInstanceId\":\"流程实例Id\",\n" +
            "    \"taskInctanceId\":\"任务实例Id\",\n" +
            "    \"userId\":\"53B68E57C5D8D94F937A1F0354CAB473\",\n" +
            "    \"userDisplayName\":\"工作流用户\",\n" +
            "    \"userIp\":\"提交并指派下一步执行人: userip=\"&&&1&&&被指派人id&&&被指派人名\"\",\n" +
            "    \"newUserId\":\"移交给的用户Id\",\n" +
            "    \"paramValues\":\"对象实例数据\",\n" +
            "    \"comment\":\"备注内容\",\n" +
            "}\n```", required = true) @RequestBody Map<String, Object> param) {
        String cmd = (String)param.get("cmd");
        String proInstanceId = (String)param.get("proInstanceId");
        String taskInctanceId = (String)param.get("taskInctanceId");
        String userId = (String)param.get("userId");
        String userDisplayName = (String)param.get("userDisplayName");
        String userIp = (String)param.get("userIp");
        String newUserId = (String)param.get("newUserId");
        String paramValues = (String)param.get("paramValues");
        String comment = (String)param.get("comment");

        try {
            String success = SaaSServer.getInstance().sendCommandWithSaving(cmd, proInstanceId, taskInctanceId, userId,userDisplayName,userIp, newUserId,paramValues,comment);
            if (success.equals("1")) return new ResponseMsg();
            else return new ResponseMsg<>(404);
        } catch (Exception e) { e.printStackTrace(); return new ResponseMsg<>(404); }
    }*/

    @ApiOperation(value = "对任务进行进行提交")
    @PostMapping(path = "process-instance-commit")
    public ResponseMsg commitTask(@ApiParam(value = "请求示例：\n```\n " +
            "{\n" +
            "    \"proInstanceId\":\"流程实例Id\",\n" +
            "    \"taskInctanceId\":\"任务实例Id\",\n" +
            "    \"userId\":\"53B68E57C5D8D94F937A1F0354CAB473\",\n" +
            "    \"userDisplayName\":\"工作流用户\",\n" +
            "    \"userIp\":\"提交并指派下一步执行人: userip=\"&&&1&&&被指派人id&&&被指派人名\"\",\n" +
            "    \"newUserId\":\"移交给的用户Id\",\n" +
            "    \"paramValues\":\"对象实例数据\",\n" +
            "    \"comment\":\"备注内容\",\n" +
            "}\n```", required = true) @RequestBody Map<String, Object> param) {

        String proInstanceId = (String)param.get("proInstanceId");
        String taskInctanceId = (String)param.get("taskInctanceId");
        String userId = (String)param.get("userId");
        String userDisplayName = (String)param.get("userDisplayName");
        String userIp = (String)param.get("userIp");
        String newUserId = (String)param.get("newUserId");
        String paramValues = (String)param.get("paramValues");
        String comment = (String)param.get("comment");

        System.out.println("paramValues:" + paramValues);

        try {
            String success = server.commitTask(proInstanceId, taskInctanceId, userId,userDisplayName,userIp, newUserId,paramValues,comment);
            System.out.println("success:"+success);
            if (success.equals("true")) return new ResponseMsg();
            else return new ResponseMsg<>(404);
        } catch (Exception e) { e.printStackTrace(); return new ResponseMsg<>(404); }
    }

    @ApiOperation(value = "对任务进行进行移交")
    @PostMapping(path = "process-instance-transfer")
    public ResponseMsg transferTask(@ApiParam(value = "请求示例：\n```\n " +
            "{\n" +
            "    \"proInstanceId\":\"流程实例Id\",\n" +
            "    \"taskInctanceId\":\"任务实例Id\",\n" +
            "    \"userId\":\"53B68E57C5D8D94F937A1F0354CAB473\",\n" +
            "    \"userDisplayName\":\"工作流用户\",\n" +
            "    \"userIp\":\"提交并指派下一步执行人: userip=\"&&&1&&&被指派人id&&&被指派人名\"\",\n" +
            "    \"newUserId\":\"移交给的用户Id\",\n" +
            "    \"paramValues\":\"对象实例数据\",\n" +
            "    \"comment\":\"备注内容\",\n" +
            "}\n```", required = true) @RequestBody Map<String, Object> param) {

        String proInstanceId = (String)param.get("proInstanceId");
        String taskInstanceId = (String)param.get("taskInstanceId");
        String userId = (String)param.get("userId");
        String userDisplayName = (String)param.get("userDisplayName");
        String newUserName = (String)param.get("newUserName");
        String userIp = (String)param.get("userIp");
        String newUserId = (String)param.get("newUserId");
        String paramValues = (String)param.get("paramValues");
        String comment = (String)param.get("comment");

        System.out.println("transfer task paramValues:" + paramValues);

        try {
            String success = server.transferTask(proInstanceId, taskInstanceId, userId,userDisplayName,userIp, newUserId,newUserName,paramValues,comment);
            System.out.println("success:"+success);
            if (success.equals("true")) return new ResponseMsg();
            else return new ResponseMsg<>(404);
        } catch (Exception e) { e.printStackTrace(); return new ResponseMsg<>(404); }
    }

    /*@ApiOperation(value = "删除流程实例")
    @PostMapping(path = "process-instance/{proInstanceId}/delete")
    public ResponseMsg deleteProcessInstance(@ApiParam(value = "流程实例Id", required = true) @PathVariable String proInstanceId) {
        // todo 无权限判断 删除流程实例
        try {
            SaaSServer.getInstance().removeInstance(proInstanceId);
            return new ResponseMsg();// success
        } catch (Exception e) { e.printStackTrace(); return new ResponseMsg(404); }
    }*/
    
    /*@ApiOperation(value = "获取流程实例的讨论内容")
    @GetMapping(path = "process-instance/{proInstanceId}/comments")
    public ResponseMsg<com.alibaba.fastjson.JSONArray> getWfComments(@ApiParam(value = "流程实例Id", required = true) @PathVariable String proInstanceId) {
        try {
            com.alibaba.fastjson.JSONArray comments = SaaSServer.getInstance().getWfComments(proInstanceId);
            if (comments == null)  return new ResponseMsg(404);
            else return new ResponseMsg(comments);
        } catch (Exception e) { e.printStackTrace(); return new ResponseMsg(404); }
    }

    @ApiOperation(value = "获取流程实例的讨论区内容")
    @GetMapping(path = "process-instance/{proInstanceId}/comments-area")
    public ResponseMsg<com.alibaba.fastjson.JSONArray> getWfCommentArea(@ApiParam(value = "流程实例Id", required = true) @PathVariable String proInstanceId, 
                                                                        @ApiParam(value = "5：runnig，7：corminated", required = true) @RequestParam int status) {
        try {
            com.alibaba.fastjson.JSONObject comments = SaaSServer.getInstance().getWfCommentArea(proInstanceId, status);
            if (comments == null)  return new ResponseMsg(404);
            else return new ResponseMsg(comments);
        } catch (Exception e) { e.printStackTrace(); return new ResponseMsg(404); }
    }
    
    @ApiOperation(value = "获取流程实例的参与人员列表")
    @GetMapping(path = "process-instance/{proInstanceId}/invitations")
    public ResponseMsg<List<String>> getProcessInstanceInvitations(@ApiParam(value = "流程实例Id", required = true) @PathVariable String proInstanceId) {
        try {
            List<String> resultList = SaaSServer.getInstance().getInvitation(proInstanceId);
            System.out.println("invitations:");
            if (resultList == null) return new ResponseMsg(404);
            return new ResponseMsg(resultList);
        } catch (Exception e) { e.printStackTrace(); return new ResponseMsg(404); }
    }

    @ApiOperation(value = "添加流程实例的参与人员")
    @PostMapping(path = "process-instance/{proInstanceId}/add-invitation")
    public ResponseMsg addProcessInstanceInvitation(@ApiParam(value = "流程实例Id", required = true) @PathVariable String proInstanceId, 
                                                    @ApiParam(value = "参与人员", required = true) @RequestParam String invitation) {
        if (invitation == null || invitation.equals("")) return new ResponseMsg(403);
        try {
            String s = SaaSServer.getInstance().addInvitation(proInstanceId, invitation);
            if (s.equals("1")) return new ResponseMsg();
            else return new ResponseMsg(404);
        } catch (Exception e) { e.printStackTrace(); return new ResponseMsg(404); }
    }

    @ApiOperation(value = "移除流程实例的参与人员")
    @PostMapping(path = "process-instance/{proInstanceId}/remove-invitation")
    public ResponseMsg removeProcessInstanceInvitation(@ApiParam(value = "流程实例Id", required = true) @PathVariable String proInstanceId, 
                                                       @ApiParam(value = "参与人员", required = true) @RequestParam String invitation) {
        if (invitation == null || invitation.equals("")) return new ResponseMsg(403);
        try {
            String s = SaaSServer.getInstance().removeInvitation(proInstanceId, invitation);
            if (s.equals("1")) return new ResponseMsg();
            else return new ResponseMsg(404);
        } catch (Exception e) { e.printStackTrace(); return new ResponseMsg(404); }
    }

    @ApiOperation(value = "添加流程实例的抄送人员")
    @PostMapping(path = "process-instance/{proInstanceId}/add-copier")
    public ResponseMsg addProcessInstanceCopier(@ApiParam(value = "流程实例Id", required = true) @PathVariable String proInstanceId, 
                                                @ApiParam(value = "参与人员", required = true) @RequestParam String copier) {
        if (copier == null || copier.equals("")) return new ResponseMsg(403);
        try {
            String s = SaaSServer.getInstance().addCopier(proInstanceId, copier);
            if (s.equals("1")) return new ResponseMsg();
            else return new ResponseMsg(404);
        } catch (Exception e) { e.printStackTrace(); return new ResponseMsg(404); }
    }

    @ApiOperation(value = "移除流程实例的抄送人员")
    @PostMapping(path = "process-instance/{proInstanceId}/remove-copier")
    public ResponseMsg removeProcessInstanceCopier(@ApiParam(value = "流程实例Id", required = true) @PathVariable String proInstanceId, 
                                                   @ApiParam(value = "参与人员", required = true) @RequestParam String copier) {
        if (copier == null || copier.equals("")) return new ResponseMsg(403);
        try {
            String s = SaaSServer.getInstance().removeCopier(proInstanceId, copier);
            if (s.equals("1")) return new ResponseMsg();
            else return new ResponseMsg(404);
        } catch (Exception e) { e.printStackTrace(); return new ResponseMsg(404); }
    }
    
    @ApiOperation(value = "任务实例的讨论列表")
    @GetMapping(path = "process-instance/{proId}/task-instance/{taskId}/comments")
    public ResponseMsg<List<Comment>>  getTaskComments(@ApiParam(value = "流程实例Id", required = true) @PathVariable String proId, 
                                                       @ApiParam(value = "任务实例Id", required = true) @PathVariable String taskId) {
        try {
            List<Comment> res = SaaSServer.getInstance().getTaskComments(proId, taskId);
            if (res != null) return new ResponseMsg(res);
            else return new ResponseMsg(404);
        } catch (Exception e) { e.printStackTrace(); return new ResponseMsg(404); }
    }
    
    @ApiOperation(value = "添加任务实例的讨论内容")
    @PostMapping(path = "process-instance/{proId}/task-instance/{taskId}/add-comment")
    public ResponseMsg  addTaskComment(@ApiParam(value = "流程实例Id", required = true) @PathVariable String proId, 
                                       @ApiParam(value = "任务实例Id", required = true) @PathVariable String taskId, 
                                       @ApiParam(value = "讨论内容", required = true) @RequestBody Comment comment) {
        try {
            System.out.println("cmt.getCo\n" + "获取用户的流程实例列表ntent(): "+comment.getContent());
            String s= SaaSServer.getInstance().addComment(proId, taskId, comment);
            if (s.equals("1")) return new ResponseMsg();
            else return new ResponseMsg(404);
        } catch (Exception e) { e.printStackTrace(); return new ResponseMsg(404); }
    }*/
    
}

