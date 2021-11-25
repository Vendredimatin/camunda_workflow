package edu.thss.platform.controller.wfprocess;

import com.alibaba.fastjson.JSONObject;
import edu.thss.platform.controller.ResponseMsg;
import edu.thss.platform.domain.wfprocess.WfProcessDefinition;
import edu.thss.platform.exception.PlatformException;
import edu.thss.platform.newService.Server;
import io.swagger.annotations.Api;
import io.swagger.annotations.ApiOperation;
import io.swagger.annotations.ApiParam;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import springfox.documentation.spring.web.json.Json;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Map;

@Api(tags = {"工作流监控时"})
@RestController
@RequestMapping("/dwf/v1/workflow/administrate")
public class AdministrateWorkflowController {


	@Autowired
	Server server;

	/*@ApiOperation(value = "删除所有记录")
	@PostMapping(path = "delete-all-histances")
	public ResponseMsg deleteAllInstanceHists() {
		try {
			if (SaaSServer.getInstance().deleteAllInstanceHists()) return new ResponseMsg();
			return new ResponseMsg(404);
		} catch (Exception e) { e.printStackTrace(); return new ResponseMsg(404); }
	}*/
	
	// service14/api2 领取工作项
	/*@ApiOperation(value = "领取工作项")
	@PostMapping(path = "receive-task-instance")
	public ResponseMsg<WorkitemInfoDescriptor> receiveTaskInstance(@ApiParam(value = "流程实例Id", required = true) String proId, 
																   @ApiParam(value = "任务实例Id", required = true) String taskId, 
																   @ApiParam(value = "用户Id", required = true) String userId, 
																   @ApiParam(value = "用户名", required = true) String userDisplayName) {
		try {
			if (!SaaSServer.getInstance().hasUserByOid(userId)) throw new PlatformException(String.format("不存在oid为%s的用户", userId));
			WorkitemInfoDescriptor wid = SaaSServer.getInstance().fetchManualTaskInstanceforMWf(proId, taskId, userId, "1", "000001", userDisplayName);
			if (wid!=null) return new ResponseMsg<>(wid);
			else return new ResponseMsg<>(404,"该任务不存在或无领取权限");
		} catch (Exception e) { e.printStackTrace(); return new ResponseMsg<>(404); }
	}*/

	/*@ApiOperation(value = "获取用户已发布的流程模版列表")
	@GetMapping(path = "released-process-templates/{userId}")
	public ResponseMsg<List<ReleasedWfProcessTemplate>> getReleasedProcessTemplates(@ApiParam(value = "用户Id", required = true)@PathVariable String userId) {
		// 获得我的流程列表
		ReleasedWfProcessBlo releasedWfProcessBlo = new ReleasedWfProcessBlo();
		if (!releasedWfProcessBlo.hasUserByOid(userId)) throw new PlatformException(String.format("不存在oid为%s的用户", userId));
		try {
//			List<ReleasedWfProcessTemplate> processes = releasedWfProcessBlo.getReleasedProcessTemplates(userId);
			return null;//new ResponseMsg<>(processes);
		} catch (Exception e) { return new ResponseMsg(404); }
	}*/
	
	// API: service13/getRlProcessesList 获取所有已发布的流程模版
	@ApiOperation(value = "获取所有已发布的流程模版")
	@GetMapping(path = "all-released-process-templates/{userId}")
	public ResponseMsg<List<WfProcessDefinition>> getAllReleasedProcessTemplates(@ApiParam(value = "用户Id", required = true) @PathVariable String userId) {
		try {
			List<WfProcessDefinition> wfProcessDefinitions = server.getAllReleasedProcessTemplate(userId);
			return new ResponseMsg<>(wfProcessDefinitions);
		} catch (Exception e) {
			return new ResponseMsg(404);
		}
	}

	/*@ApiOperation(value = "获取用户的流程实例列表")
	@PostMapping(path = "process-instances")
	public ResponseMsg<List<AdminSearchResult>> getProcessInstances(@ApiParam(value = "请求示例：\n```\n" +
			"{\n" +
			"    \"userId\":\"1CAC1CFF93C82248A22920B60FADEAA7\",\n" +
			"    \"statusType\":\"completed\",\n" +
			"    \"pageIndex\":0,\n" +
			"    \"pageSize\":10,\n" +
			"    \"condition\":\" \"\n" +
			"}\n```", required = true) @RequestBody Map<String, Object> params) {
		try {
			String userId = (String) params.get("userId");
			if (!SaaSServer.getInstance().hasUserByOid(userId)) throw new PlatformException(String.format("不存在oid为%s的用户", userId));
			String statusType = (String) params.get("statusType");
			Integer pageIndex = (Integer) params.get("pageIndex");
			Integer pageSize = (Integer) params.get("pageSize");
			String condition = (String) params.get("condition");
			List<AdminSearchResult> list = SaaSServer.getInstance().getProcessInstance(userId, statusType, pageIndex, pageSize, condition);
			return new ResponseMsg<>(list);
		} catch (Exception e) { e.printStackTrace(); return new ResponseMsg<>(404); }
	}*/

	/*@ApiOperation(value = "获取用户的流程实例个数")
	@PostMapping(path = "process-instances-count")
	public ResponseMsg<Integer> getProcessInstancesCount(@ApiParam(value = "请求示例：\n```\n" +
			"{\n" +
			"    \"userId\":\"53B68E57C5D8D94F937A1F0354CAB473\",\n" +
			"    \"statusType\":\"completed\",\n" +
			"    \"condition\":\"\"\n" +
			"}\n```", required = true) @RequestBody Map<String, Object> params) {
		try {
			String userId = (String) params.get("userId");
			if (!SaaSServer.getInstance().hasUserByOid(userId)) throw new PlatformException(String.format("不存在oid为%s的用户", userId));
			String statusType = (String) params.get("statusType");
			String condition = (String) params.get("condition");
			if (statusType == null || statusType.length() == 0) statusType="all";
			Integer len = SaaSServer.getInstance().proInstanceCount(userId, statusType, condition);
			System.out.println("len:" + len);
			return new ResponseMsg<>(200, len);
		} catch (Exception e) { e.printStackTrace(); return new ResponseMsg<>(404); }
	}*/


	@ApiOperation(value = "获取用户的任务列表")
	@PostMapping(path = "task-instances")
	public ResponseMsg<List<Map<String,String>>> getManualTaskInstances(@ApiParam(value = "请求示例：\n```\n " +
			"{\n" +
			"    \"userId\":\"53B68E57C5D8D94F937A1F0354CAB473\",\n" +
			"    \"filerStatus\":\"[1,2,3]\",\n" +
			"    \"pageIndex\":0,\n" +
			"    \"pageSize\":10,\n" +
			"    \"condition\":\"\"\n" +
			"}\n```", required = true) @RequestBody Map<String, Object> params) {
		try {
			String userId = (String) params.get("userId");
			String userName = (String) params.get("userName");
			// if (!SaaSServer.getInstance().hasUserByOid(userId)) throw new PlatformException(String.format("不存在oid为%s的用户", userId));
			String filerStatus = (String) params.get("filerStatus");
			Integer pageIndex = (Integer) params.get("pageIndex");
			Integer pageSize = (Integer) params.get("pageSize");
			String condition = (String) params.get("condition");
			List<String> groups = (List) params.get("groups");
			if (filerStatus == null || filerStatus.length() == 0) filerStatus="[1]";
			List<Map<String,String>> tasks = server.getTaskList(userName, filerStatus, pageIndex, pageSize, condition, groups);
			return new ResponseMsg<>(tasks);
		} catch (Exception e) { e.printStackTrace(); return new ResponseMsg<>(404); }
	}

	/*@ApiOperation(value = "获取该业务对象所在的任务列表")
	@PostMapping(path = "task-instances-byobj")
	public ResponseMsg<List<WorkitemInfoDescriptor>> getRunningManualTaskByObj(@ApiParam(value = "请求示例：\n```\n " +
			"{\n" +
			"    \"userId\":\"53B68E57C5D8D94F937A1F0354CAB473\",\n" +
			"    \"bindEnClassName\":\"enInstanceId\",\n" +
			"    \"enClassInstanceId\":\"enInstanceId\",\n" +
			"}\n```", required = true) @RequestBody Map<String, Object> params) {
		try {
			String userId = (String) params.get("userId");
			String bindEnClassName = (String) params.get("bindEnClassName");
			String enClassInstanceId = (String) params.get("enClassInstanceId");
			List<WorkitemInfoDescriptor> list = SaaSServer.getInstance().getRunningManualTaskByObj(userId, bindEnClassName, enClassInstanceId);
			return new ResponseMsg<>(list);
		} catch (Exception e) { e.printStackTrace(); return new ResponseMsg<>(404); }
	}*/


	/*@ApiOperation(value = "获取用户的任务列表个数")
	@PostMapping(path = "task-instances-count")
	public ResponseMsg<Integer> getManualTaskInstancesCount(@ApiParam(value = "请求示例：\n```\n " +
			"{\n" +
			"    \"userId\":\"53B68E57C5D8D94F937A1F0354CAB473\",\n" +
			"    \"filerStatus\":\"[1,2,3]\",\n" +
			"    \"condition\":\"\",\n" +
			"}\n```", required = true) @RequestBody Map<String, Object> params) {
		try {
			String userId = (String) params.get("userId");
			String userName = (String) params.get("userName");
			if (!SaaSServer.getInstance().hasUserByOid(userId)) throw new PlatformException(String.format("不存在oid为%s的用户", userId));
			String filerStatus = (String) params.get("filerStatus");
			String condition = (String) params.get("condition");
			List<String> groups = (List<String>) params.get("groups");
			System.out.println(groups);
			if (filerStatus == null || filerStatus.length() == 0) filerStatus="[1]";
			Integer len  = server.getTaskCount(userName,filerStatus, condition, groups);
			return new ResponseMsg(len);
		} catch (Exception e) { e.printStackTrace(); return new ResponseMsg<>(404); }
	}*/



	/*@ApiOperation(value = "通过流程实例id获得流程实例")
	@GetMapping(path = "wfprocess-instance/{proInstanceId}")
	public ResponseMsg<String> getWfProcessInstance(@ApiParam(value = "流程实例Id", required = true)@PathVariable String proInstanceId) {
		try {
			WfProcessInstance instance = SaaSServer.getInstance().getInstanceByID(proInstanceId);
			if (instance != null) return new ResponseMsg<>(WfProcessInstance2JSON.toJSON(instance));
			return new ResponseMsg<>(404);
		} catch (Exception e) { e.printStackTrace(); return new ResponseMsg<>(404); }
	}*/


	/*@ApiOperation(value = "获得已发布模版的流程实例")
	@PostMapping(path = "search-process-instance")
	public ResponseMsg<AdminSearchResultPage> searchApplicationProcService(@ApiParam(value = "请求示例：\n```\n " +
			"{\n" +
			"    \"pid\":\"000000000002aj\",\n" +
			"    \"pn\":\"页码\",\n" +
			"    \"psz\":\"每页个数\",\n" +
			"    \"cond1\":\"搜索search value\",\n" +
			"    \"cond2\":\"实例状态status \",\n" +
			"    \"cond3\":\"时间范围from date \",\n" +
			"    \"cond4\":\"时间范围to date\"\n" +
			"}\n```", required = true) @RequestBody Map<String, Object> params) {
		try {
			List<AdminSearchResult> list = new ArrayList<>();
			int pn = 1;
			int psz = 20;
			try {
				String pid = (String) params.get("pid");
				pn = (int) params.get("pn");
				psz = (int) params.get("psz");
				String cond1 = (String) params.get("cond1");
				String cond2 = (String) params.get("cond2");
				String cond3 = (String) params.get("cond3");
				String cond4 = (String) params.get("cond4");
				AdminSearchResult[] result = SaaSServer.getInstance().searchApp(pid, cond1, cond2, cond3, cond4);
				Collections.addAll(list, result);
			} catch (Exception e) { e.printStackTrace(); }
			return new ResponseMsg<>(createPage(list, pn, psz));
		} catch (Exception e) { e.printStackTrace(); }
		return new ResponseMsg<>(404);
	}*/


	/*private AdminSearchResultPage createPage(List<AdminSearchResult> list, int pn, int psz) {
		AdminSearchResultPage page = new AdminSearchResultPage(pn, psz);
		int total = 1;
		page.setPageSize(psz);
		page.setPageNo(pn);
		page.setAllEntitiesCount(total);
		int n = total / psz;
		int m = total % psz;
		if (m > 0) { n = n + 1; }
		page.setAllPagesCount(n);
		int pageindex = (pn - 1) * psz;
		page.setPageIndex(pageindex);
		page.setPageEntities(list.toArray(new AdminSearchResult[list.size()]));
		return page;
	}*/

}
