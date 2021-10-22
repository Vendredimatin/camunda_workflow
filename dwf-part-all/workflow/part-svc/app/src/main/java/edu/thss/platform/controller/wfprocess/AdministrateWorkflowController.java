package edu.thss.platform.controller.wfprocess;

import com.alibaba.fastjson.JSONObject;
import edu.thss.platform.controller.ResponseMsg;
import edu.thss.platform.dao.wfprocess.ReleasedWfProcessTemplateDao;
import edu.thss.platform.domain.wfprocess.NewWfProcessInstance;
import edu.thss.platform.domain.wfprocess.ReleasedWfProcessTemplate;
import edu.thss.platform.exception.PlatformException;
import edu.thss.platform.newService.Server;
import edu.thss.platform.service.wfprocess.blo.buildtime.wfprocess.ReleasedWfProcessBlo;
import edu.thss.platform.service.wfprocess.core.runtime.admin.AdminSearchResult;
import edu.thss.platform.service.wfprocess.core.runtime.admin.AdminSearchResultPage;
import edu.thss.platform.service.wfprocess.core.runtime.util.json.WfProcessInstance2JSON;
import edu.thss.platform.service.wfprocess.core.runtime.wfprocess.WfProcessInstance;
import edu.thss.platform.service.wfprocess.core.runtime.workitem.WorkitemInfoDescriptor;
import edu.thss.platform.service.wfprocess.runtime.server.SaaSServer;
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
	ReleasedWfProcessTemplateDao releasedWfProcessTemplateDao;

	@Autowired
	Server server;

	@ApiOperation(value = "删除所有记录")
	@PostMapping(path = "delete-all-histances")
	public ResponseMsg deleteAllInstanceHists() {
		try {
			if (SaaSServer.getInstance().deleteAllInstanceHists()) return new ResponseMsg();
			return new ResponseMsg(404);
		} catch (Exception e) { e.printStackTrace(); return new ResponseMsg(404); }
	}
	
	// service14/api2 领取工作项
	@ApiOperation(value = "领取工作项")
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
	}

	@ApiOperation(value = "获取用户已发布的流程模版列表")
	@GetMapping(path = "released-process-templates/{userId}")
	public ResponseMsg<List<ReleasedWfProcessTemplate>> getReleasedProcessTemplates(@ApiParam(value = "用户Id", required = true)@PathVariable String userId) {
		// 获得我的流程列表
		ReleasedWfProcessBlo releasedWfProcessBlo = new ReleasedWfProcessBlo();
		if (!releasedWfProcessBlo.hasUserByOid(userId)) throw new PlatformException(String.format("不存在oid为%s的用户", userId));
		try {
//			List<ReleasedWfProcessTemplate> processes = releasedWfProcessBlo.getReleasedProcessTemplates(userId);
			return null;//new ResponseMsg<>(processes);
		} catch (Exception e) { return new ResponseMsg(404); }
	}
	
	// API: service13/getRlProcessesList 获取所有已发布的流程模版
	@ApiOperation(value = "获取所有已发布的流程模版")
	@GetMapping(path = "all-released-process-templates")
	public ResponseMsg<List<ReleasedWfProcessTemplate>> getAllReleasedProcessTemplates() {
		try {
			List<ReleasedWfProcessTemplate> releasedWfProcessTemplates = releasedWfProcessTemplateDao.findAll();
			return new ResponseMsg<>(releasedWfProcessTemplates);
		} catch (Exception e) {
			return new ResponseMsg(404);
		}
	}

	@ApiOperation(value = "获取用户的流程实例列表")
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
	}

	@ApiOperation(value = "获取用户的流程实例个数")
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
	}


	/*@ApiOperation(value = "获取用户的任务列表")
	@PostMapping(path = "task-instances")
	public ResponseMsg<List<WorkitemInfoDescriptor>> getManualTaskInstances(@ApiParam(value = "请求示例：\n```\n " +
					"{\n" +
					"    \"userId\":\"53B68E57C5D8D94F937A1F0354CAB473\",\n" +
					"    \"filerStatus\":\"[1,2,3]\",\n" +
					"    \"pageIndex\":0,\n" +
					"    \"pageSize\":10,\n" +
					"    \"condition\":\"\"\n" +
					"}\n```", required = true) @RequestBody Map<String, Object> params) {
		try {
			String userId = (String) params.get("userId");
			if (!SaaSServer.getInstance().hasUserByOid(userId)) throw new PlatformException(String.format("不存在oid为%s的用户", userId));
			String filerStatus = (String) params.get("filerStatus");
			Integer pageIndex = (Integer) params.get("pageIndex");
			Integer pageSize = (Integer) params.get("pageSize");
			String condition = (String) params.get("condition");
			if (filerStatus == null || filerStatus.length() == 0) filerStatus="[1]";
			List<WorkitemInfoDescriptor> list = SaaSServer.getInstance().getManualTaskInstance(userId, filerStatus, pageIndex, pageSize, condition);
			return new ResponseMsg<>(list);
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
			if (!SaaSServer.getInstance().hasUserByOid(userId)) throw new PlatformException(String.format("不存在oid为%s的用户", userId));
			String filerStatus = (String) params.get("filerStatus");
			Integer pageIndex = (Integer) params.get("pageIndex");
			Integer pageSize = (Integer) params.get("pageSize");
			String condition = (String) params.get("condition");
			if (filerStatus == null || filerStatus.length() == 0) filerStatus="[1]";
			List<Map<String,String>> tasks = server.getTaskList(userName, filerStatus, pageIndex, pageSize, condition);
			return new ResponseMsg<>(tasks);
		} catch (Exception e) { e.printStackTrace(); return new ResponseMsg<>(404); }
	}

	@ApiOperation(value = "获取该业务对象所在的任务列表")
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
	}


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
			if (!SaaSServer.getInstance().hasUserByOid(userId)) throw new PlatformException(String.format("不存在oid为%s的用户", userId));
			String filerStatus = (String) params.get("filerStatus");
			String condition = (String) params.get("condition");

			if (filerStatus == null || filerStatus.length() == 0) filerStatus="[1]";
			Integer len  = SaaSServer.getInstance().manualTaskInstanceCount(userId,filerStatus, condition);
			return new ResponseMsg(len);
		} catch (Exception e) { e.printStackTrace(); return new ResponseMsg<>(404); }
	}*/

	@ApiOperation(value = "获取用户的任务列表个数")
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

			if (filerStatus == null || filerStatus.length() == 0) filerStatus="[1]";
			Integer len  = server.getTaskCount(userName,filerStatus, condition);
			return new ResponseMsg(len);
		} catch (Exception e) { e.printStackTrace(); return new ResponseMsg<>(404); }
	}


	/*@ApiOperation(value = "获取绑定某类的已发布模版列表")
	@GetMapping(path = "released-templates-classname")
	public ResponseMsg<List<ReleasedWfProcess>> getRlProListByClassName(@ApiParam(value = "类名", required = true)@PathVariable String className) {
		try {
			ReleasedWfProcessBlo releasedWfProcessBlo = new ReleasedWfProcessBlo();
			List<ReleasedWfProcess> processes = releasedWfProcessBlo.getRlProListByEnClass(className);
			return new ResponseMsg<>(processes);
		} catch(Exception e) { return new ResponseMsg<>(404); }
	}
	
	@ApiOperation(value = "基于已有对象发起流程时获取可发起的模版")
	@PostMapping(path = "released-templates-luanch")
	public ResponseMsg<List<ReleasedWfProcess>> getRlProListByEnClass(@ApiParam(value = "类名", required = true) @RequestParam String classname, 
																	  @ApiParam(value = "userId", required = true) @RequestParam String userId) {
		try {
			ReleasedWfProcessBlo releasedWfProcessBlo = new ReleasedWfProcessBlo();
			List<ReleasedWfProcess> list = releasedWfProcessBlo.getRlProListToLuanch(classname,userId);
			return new ResponseMsg<>(list);
		} catch (Exception e) { e.printStackTrace(); return new ResponseMsg<>(404); }
	}*/


	@ApiOperation(value = "通过流程实例id获得流程实例")
	@GetMapping(path = "wfprocess-instance/{proInstanceId}")
	public ResponseMsg<String> getWfProcessInstance(@ApiParam(value = "流程实例Id", required = true)@PathVariable String proInstanceId) {
		try {
			WfProcessInstance instance = SaaSServer.getInstance().getInstanceByID(proInstanceId);
			if (instance != null) return new ResponseMsg<>(WfProcessInstance2JSON.toJSON(instance));
			return new ResponseMsg<>(404);
		} catch (Exception e) { e.printStackTrace(); return new ResponseMsg<>(404); }
	}


	@ApiOperation(value = "获得已发布模版的流程实例")
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
	}
	
	/*private AdminSearchResult parseAdminSearchResult(JSONObject json) throws Exception {
		AdminSearchResult r = new AdminSearchResult();
		r.setInstanceId(json.getString("instanceId"));
		r.setDefinitionId(json.getString("definitionId"));
		if (!json.isNull("processName")) { r.setProcessName(json.getString("processName")); }
		if (!json.isNull("processVersion")) { r.setProcessVersion(json.getString("processVersion")); }
		if (!json.isNull("status")) { r.setStatus(json.getInt("status")); }
		if (!json.isNull("launcher")) { r.setLauncher(json.getString("launcher")); }
		if (!json.isNull("idType")) { r.setIdType(json.getString("idType")); }
		if (!json.isNull("idNumber")) { r.setIdNumber(json.getString("idNumber")); }
		if (!json.isNull("startTime")) { r.setStartTime(json.getLong("startTime")); }
		if (!json.isNull("suspensionTime")) { r.setSuspensionTime(json.getLong("suspensionTime")); }
		if (!json.isNull("updateTime")) { r.setUpdateTime(json.getLong("updateTime")); }
		if (!json.isNull("server")) { r.setServer(json.getString("server")); }
		return r;
	}*/

	private AdminSearchResultPage createPage(List<AdminSearchResult> list, int pn, int psz) {
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
	}

	
	// /**
	//  * Add user id information who will be copied to.
	//  *
	//  * @param pid
	//  * @param tid
	//  * @param copyto
	//  * @return
	//  */
	// @RequestMapping(value = "/addInvitation", method = RequestMethod.POST, produces = "application/json; charset=utf-8")
	// @ResponseBody
	// public String addInvitation(String pid, String tid, String copyto) {
	// 	try {
	// 		// 在这里服务应该调用另一个服务获取所有当前运行的服务器，通过一个一个服务器访问，来搜索符合条件的流程实例。
	// 		CloseableHttpClient httpClient = HttpClientBuilder.create().build();
	// 		String apiserver = "http://localhost:8080/tsworkflow";// SystemConfig.getProp("paas.server.domainname");
	// 		String url = apiserver + "/service11/addInvitation";
	// 		List<NameValuePair> urlParameters = new ArrayList<NameValuePair>();
	// 		urlParameters.add(new BasicNameValuePair("pid", pid));
	// 		urlParameters.add(new BasicNameValuePair("tid", tid));
	// 		urlParameters.add(new BasicNameValuePair("invitation", copyto));
	// 		String str = EntityUtils.toString(new UrlEncodedFormEntity(urlParameters, "utf-8"));
	// 		HttpGet httpGet = new HttpGet(url);
	// 		httpGet.setURI(new URI(httpGet.getURI().toString() + "?" + str));
	// 		CloseableHttpResponse response1 = httpClient.execute(httpGet);
	// 		if (response1.getStatusLine().getStatusCode() != 200) {
	// 			throw new RuntimeException("Failed : HTTP error code : " + response1.getStatusLine().getStatusCode());
	// 		}
	// 		HttpEntity entity = response1.getEntity();
	// 		String responseJson = EntityUtils.toString(entity, "UTF-8").trim();
	// 		httpClient.close();
	// 		httpGet.abort();
	// 		List<AdminSearchResult> list = new ArrayList<AdminSearchResult>();
	// 		if (!responseJson.equals("")) {
	// 			JSONArray jsonarr = new JSONArray(responseJson);
	// 			if (jsonarr.length() > 0) {
	// 				for (int i = 0; i < jsonarr.length(); i++) {
	// 					list.add(parseAdminSearchResult(jsonarr.getJSONObject(i)));
	// 				}
	// 			}
	// 		}
	// 		return "{\"status\": \"1\"}";
	// 	} catch (Exception e) {
	// 		e.printStackTrace();
	// 		return "{\"status\": \"0\"}";
	// 	}
	// }

	//	// service13/api31
//	/**
//	 *
//	 * @param pid  process definition Id
//	 * @param pn
//	 * @param psz
////	 * @param cond
//	 * @return
//	 */
//	@RequestMapping(value = "/api31", method = RequestMethod.GET, produces = "application/json; charset=utf-8")
//	@ResponseBody
//	public AdminSearchResultPage searchApplicationProcService(String pid, int pn, int psz, String cond1, String cond2,
//			String cond3, String cond4) {
//		try {
//			List<AdminSearchResult> list = new ArrayList<AdminSearchResult>();
//			try {
//				AdminSearchResult[] result = SaaSServer.getInstance().searchApp(pid, cond1, cond2, cond3, cond4);
//				int i = 0;
//				for (i = 0;i < result.length;i++) {
//					list.add(result[i]);
//				}
//			} catch (Exception e) {
//				e.printStackTrace();
//			}
//			return createPage(list, pn, psz);
//		} catch (Exception e) {
//			e.printStackTrace();
//		}
//		return null;
//	}

//	@RequestMapping(value = "/api6", method = RequestMethod.GET, produces = "application/json")
//	@ResponseBody
//	public WfProcessListPage queryWfProcess(int deprecated, String condition, int pageno, int pagesize) {
//		try {
//            ReleasedWfProcessBlo releasedWfProcessBlo = new ReleasedWfProcessBlo();
//			return releasedWfProcessBlo.searchWfProcess(deprecated, condition, pageno, pagesize);
//		} catch (Exception e) {
//			e.printStackTrace();
//		}
//		return null;
//	}
//
//	@RequestMapping(value = "/api7", method = RequestMethod.POST, produces = "application/json")
//	@ResponseBody
//	public String modifyWfProcessStatus(int deprecated, String rid, String lastupdate, String comment, String owner,
//			String userId, String userfullname, String ownername) {
//		try {
//            ReleasedWfProcessBlo releasedWfProcessBlo = new ReleasedWfProcessBlo();
//			releasedWfProcessBlo.modifyWfProcessStatus(rid, deprecated, Long.parseLong(lastupdate));
//			return "{\"status\": \"1\"}";
//		} catch (Exception e) {
//			return "{\"status\": \"0\"}";
//		}
//	}
//
//
//	@RequestMapping(value = "/api16", method = RequestMethod.GET, produces = "application/json")
//	@ResponseBody
//	public String getNewRuntimeID() {
//		try {
//			BuildtimeIDGenerator buildtimeIDGenerator = new BuildtimeIDGenerator();
//			String id = buildtimeIDGenerator.getNewRunTimeID();
//			return id;
//		} catch (Exception e) {
//			e.printStackTrace();
//		}
//		return null;
//	}

//	/**
//	 *
//	 * @param oid   organization ID
//	 * @param pn
//	 * @param psz
//	 * @param cond1 search value
//	 * @param cond2 status
//	 * @param cond3 from date
//	 * @param cond4 to date
//	 * @return
//	 */
//	@RequestMapping(value = "/api30", method = RequestMethod.GET, produces = "application/json; charset=utf-8")
//	@ResponseBody
//	public AdminSearchResultPage searchAllApplicationServices(String oid, int pn, int psz, String cond1, String cond2,
//			String cond3, String cond4) {
//		try {
//			List<AdminSearchResult> list = new ArrayList<AdminSearchResult>();
//			try {
//				AdminSearchResult[] result = SaaSServer.getInstance().search(oid, cond1, cond2, cond3, cond4);
//				int i = 0;
//				for (i = 0;i < result.length;i++) {
//					list.add(result[i]);
//				}
//			} catch (Exception e) {
//				e.printStackTrace();
//			}
//			return createPage(list, pn, psz);
//		} catch (Exception e) {
//			e.printStackTrace();
//		}
//		return null;
//	}

	//  未用
//	// API: service13/api0 获取所有已发布的流程模版
//	@RequestMapping(value = "/api0", method = RequestMethod.GET, headers = "Accept=application/json")
//	@ResponseBody
//	public JSTreeNode[] getProcesses(String uid) throws Exception {
//		JSTreeNode root = new JSTreeNode();
//		root.id = "000000R";
//		root.text = "根节点";
//		root.icon = "glyphicon glyphicon-home";
//		root.data = "1|null";
//        ReleasedWfProcessBlo releasedWfProcessBlo = new ReleasedWfProcessBlo();
//		ReleasedWfProcess[] processes = releasedWfProcessBlo.getAllProcessesOfProprietor(uid);
//		if (processes.length > 0) {
//			JSTreeNode[] jstnodes = new JSTreeNode[processes.length];
//			for (int i = 0; i < processes.length; i++) {
//				WfProcess node = processes[i];
//				JSTreeNode jstnode = new JSTreeNode();
//				jstnode.id = node.getId();
//				jstnode.text = JSTreeNode.parseUTF8(node.getName());
//				jstnode.parentId = node.getParent();
//				jstnode.icon = "";
//				if (node instanceof ReleasedWfProcess) {
//					jstnode.icon = "glyphicon glyphicon-fire";
//					// add some spare information
//					jstnode.data = "3|" + node.getOwner() + "|" + ((ReleasedWfProcess) node).getCode() + "|R|"
//							+ ((ReleasedWfProcess) node).getVersion();
//					jstnode.text = JSTreeNode
//							.parseUTF8(node.getName() + "(" + ((ReleasedWfProcess) node).getVersion() + ")");
//				} else if (node instanceof WfProcess) {
//					jstnode.icon = "glyphicon glyphicon-flash";
//					// add some spare information
//					jstnode.data = "3|" + node.getOwner() + "|" + ((WfProcess) node).getCode() + "|P";
//				}
//				if (node.getParent() != null) {
//					jstnode.parentId = node.getParent();
//				}
//				jstnodes[i] = jstnode;
//			}
//			root.setChildren(jstnodes);
//		}
//		return new JSTreeNode[] { root };
//	}


	// 未用
//	// API: service13/getAllIdByEnClass
//	@RequestMapping(value = "/getAllIdByEnClass", method = RequestMethod.GET, headers = "Accept=application/json")
//	@ResponseBody
//	public List<String> getAllIdByEnClass(String ename) throws Exception {
//		ReleasedWfProcessBlo releasedWfProcessBlo = new ReleasedWfProcessBlo();
//		List<String> processes = releasedWfProcessBlo.getAllIdByEnClass(ename);
//		return processes;
//	}

}
