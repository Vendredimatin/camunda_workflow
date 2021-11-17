package edu.thss.platform.controller.wfprocess;

import edu.thss.platform.controller.ResponseMsg;
import edu.thss.platform.dao.wfprocess.NewWfProcessTemplateDao;
import edu.thss.platform.dao.wfprocess.ReleasedWfProcessTemplateDao;
import edu.thss.platform.domain.wfprocess.NewWfProcessInstance;
import edu.thss.platform.domain.wfprocess.NewWfProcessTemplate;
import edu.thss.platform.domain.wfprocess.ReleasedWfProcessTemplate;
import edu.thss.platform.exception.PlatformException;
import edu.thss.platform.newService.Server;
import edu.thss.platform.service.wfprocess.BO.WfProcessTemplate;
import edu.thss.platform.service.wfprocess.blo.buildtime.id.BuildtimeIDGenerator;
import edu.thss.platform.service.wfprocess.blo.buildtime.wfprocess.BuildtimeWfProcessBlo;
import edu.thss.platform.service.wfprocess.blo.buildtime.wfprocess.ReleasedWfProcessBlo;
import edu.thss.platform.service.wfprocess.core.buildtime.wfprocess.WfProcess;
import edu.thss.platform.service.wfprocess.runtime.server.SaaSServer;
import io.swagger.annotations.Api;
import io.swagger.annotations.ApiOperation;
import io.swagger.annotations.ApiParam;
import org.json.JSONObject;
import org.springframework.web.bind.annotation.*;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import edu.thss.platform.utils.EnvironmentBuilder;

@Api(tags = {"工作流建模时"})
@RestController
@RequestMapping("/dwf/v1/workflow/buildtime")
public class BuildtimeWorkflowController {

    @Autowired
    EnvironmentBuilder environmentBuilder;
    @Autowired
    ReleasedWfProcessTemplateDao releasedWfProcessTemplateDao;
    @Autowired
    NewWfProcessTemplateDao newWfProcessTemplateDao;
    @Autowired
    Server server;


    @ApiOperation(value = "获取新id")
    @GetMapping(path = "getNewID")
    public ResponseMsg<String> getNewID() {
        try {
            BuildtimeIDGenerator buildtimeIDGenerator = new BuildtimeIDGenerator();
            String id = buildtimeIDGenerator.getNewBuildTimeID();
            return new ResponseMsg(id);
        } catch (Exception e) {
            e.printStackTrace();
            return new ResponseMsg(500, "新建失败");
        }
    }

    /*@ApiOperation(value = "新建流程模版")
    @PostMapping(path = "create-process-template")
    public ResponseMsg<String> createProcessTemplate(@RequestBody WfProcessTemplate wfProcessTemplate) {
        if (!SaaSServer.getInstance().hasClassByName(wfProcessTemplate.getBindEnClassName()))
            throw new PlatformException("类" + wfProcessTemplate.getBindEnClassName() + "不存在");
        try {
            BuildtimeWfProcessBlo buildtimeWfProcessBlo = new BuildtimeWfProcessBlo();
            WfProcess t = buildtimeWfProcessBlo.createProcessTemplates(wfProcessTemplate);
            if (t != null) return new ResponseMsg<>(t.getId());
            else return new ResponseMsg(500, "新建失败，该名称已存在");
        } catch (Exception e) {
            e.printStackTrace();
            return new ResponseMsg(500, "新建失败");
        }
    }*/

    @ApiOperation(value = "新建流程模版")
    @PostMapping(path = "create-process-template")
    public ResponseMsg<Long> createProcessTemplate(@RequestBody NewWfProcessTemplate wfProcessTemplate) {
       NewWfProcessTemplate newWfProcessTemplate = newWfProcessTemplateDao.save(wfProcessTemplate);

       if (newWfProcessTemplate != null) return new ResponseMsg<>(newWfProcessTemplate.getId());
       else return new ResponseMsg(500, "新建失败，该名称已存在");
    }

    /*@ApiOperation(value = "获取用户未发布的流程模版列表")
    @GetMapping(path = "process-templates/{userId}")
    public ResponseMsg<List<WfProcessTemplate>> getProcessTemplates(@ApiParam(value = "用户Id", required = true) @PathVariable String userId) throws Exception {
        // 获得我的流程列表
        ReleasedWfProcessBlo releasedWfProcessBlo = new ReleasedWfProcessBlo();
        if (!releasedWfProcessBlo.hasUserByOid(userId))
            throw new PlatformException(String.format("不存在oid为%s的用户", userId));
        BuildtimeWfProcessBlo buildtimeWfProcessBlo = new BuildtimeWfProcessBlo();
        return new ResponseMsg<>(buildtimeWfProcessBlo.getProcessTemplates(userId));
    }*/

    @ApiOperation(value = "获取用户未发布的流程模版列表")
    @GetMapping(path = "process-templates/{userId}")
    public ResponseMsg<List<NewWfProcessTemplate>> getProcessTemplates(@ApiParam(value = "用户Id", required = true) @PathVariable String userId) throws Exception {
        // 获得我的流程列表
        List<NewWfProcessTemplate> newWfProcessTemplates = newWfProcessTemplateDao.findAll();
        return new ResponseMsg<>(newWfProcessTemplates);
    }

    @ApiOperation(value = "根据模板Id获取用户未发布的流程模版")
    @GetMapping(path = "get-template/{templateId}")
    public ResponseMsg<NewWfProcessTemplate> getTemplateById(@ApiParam(value = "模板Id", required = true) @PathVariable String templateId) throws Exception {
        // 获得我的流程列表
        NewWfProcessTemplate newWfProcessTemplate = newWfProcessTemplateDao.getOne(Long.parseLong(templateId));
        return new ResponseMsg<>(newWfProcessTemplate);
    }

    @ApiOperation(value = "获取所有未发布的流程模版列表")
    @GetMapping(path = "all-process-templates")
    public ResponseMsg<List<WfProcessTemplate>> getAllProcessTemplates() throws Exception {
        BuildtimeWfProcessBlo buildtimeWfProcessBlo = new BuildtimeWfProcessBlo();
        return new ResponseMsg<>(buildtimeWfProcessBlo.getAllProcessTemplates());
    }

    // API: service1/api6 通过id获取流程模版
    @ApiOperation(value = "获取流程模版内容")
    @GetMapping(path = "process-template/{templateId}")
    public ResponseMsg<String> getWfProcessTemplate(@ApiParam(value = "模版Id", required = true) @PathVariable String templateId) {
        try {
            BuildtimeWfProcessBlo buildtimeWfProcessBlo = new BuildtimeWfProcessBlo();
            String s = buildtimeWfProcessBlo.getProcessContent(templateId, environmentBuilder.buildEnvironment());
            if (s != null) return new ResponseMsg<>(s);
            else return new ResponseMsg(404, "该模版不存在");
        } catch (Exception e) {
            e.printStackTrace();
            throw new PlatformException(e.getMessage());
        }
    }

    //service1/releaseWfProcess DWF发布一个流程
    /*@ApiOperation(value = "发布一个流程流程模版")
    @PostMapping(path = "release-process-template")
    public ResponseMsg<String> releaseWfProcessTemplate(@RequestBody ReleasedWfProcessTemplate template) {
        try {
            ReleasedWfProcessBlo releasedWfProcessBlo = new ReleasedWfProcessBlo();
            String id = releasedWfProcessBlo.releaseWfProcessTemplate(template);
            if (id == null) return new ResponseMsg(500, "发布失败，该版本已存在");
            return new ResponseMsg<>(id);
        } catch (Exception e) {
            e.printStackTrace();
            return new ResponseMsg(500, "发布失败");
        }
    }
*/
    @ApiOperation(value = "发布一个流程流程模版")
    @PostMapping(path = "release-process-template")
    public ResponseMsg<Long> releaseWfProcessTemplate(@RequestBody ReleasedWfProcessTemplate template) {
        try {
            ReleasedWfProcessTemplate t = releasedWfProcessTemplateDao.save(template);
            String deploymentId = server.deploy(t);
            if(!deploymentId.equals("Error")){
                t.setDeploymentId(deploymentId);
                t = releasedWfProcessTemplateDao.save(t);
            }else{
                return new ResponseMsg(500, "发布失败，引擎部署失败");
            }

            if (t == null) return new ResponseMsg(500, "发布失败，该版本已存在");
            return new ResponseMsg<>(t.getId());
        } catch (Exception e) {
            e.printStackTrace();
            return new ResponseMsg(500, "发布失败");
        }
    }


    @ApiOperation(value = "删除一个未发布的流程模版")
    @PostMapping(path = "delete-process-template/{templateId}")
    public ResponseMsg deleteWfProcessTemplate(@ApiParam(value = "流程模版Id", required = true) @PathVariable String templateId) {
        try {
            newWfProcessTemplateDao.deleteById(Long.valueOf(templateId));
            return new ResponseMsg();
        } catch (Exception e) {
            e.printStackTrace();
            throw new PlatformException(e.getMessage());
        }
    }

    // servcie1/deleteRlProcess 删除一个已发布的流程模版
    @ApiOperation(value = "删除一个已发布的流程模版")
    @PostMapping(path = "delete-released-template/{templateId}")
    public ResponseMsg deleteRlWfProcessTemplate(@ApiParam(value = "流程模版Id", required = true) @PathVariable String templateId) {
        try {
            ReleasedWfProcessBlo releasedWfProcessBlo = new ReleasedWfProcessBlo();
            releasedWfProcessBlo.deleteRlTemplate(templateId, environmentBuilder.buildEnvironment());
            return new ResponseMsg();
            // List<String> releasedWfIds = releasedWfProcessBlo.queryAllReleasedWfProcessId();
            // if (releasedWfIds.contains(templateId)) {
            // 	if (SaaSServer.getInstance().canBeDeleteRlProcess(templateId)) {
            // 		releasedWfProcessBlo.deleteRlTemplate(templateId, environmentBuilder.buildEnvironment());
            // 		return new ResponseMsg();
            // 	} else return new ResponseMsg(403,"删除失败，该模版有正在运行中的流程实例");
            // } else return new ResponseMsg(404,"该模版不存在");
        } catch (Exception e) {
            e.printStackTrace();
            throw new PlatformException(e.getMessage());
        }
    }

    /**
     * Create and save a new user into repository.
     * 保存一个流程模版
     */
   /* @ApiOperation(value = "保存一个流程模版")
    @PostMapping(path = "save-process-template")
    public ResponseMsg saveWfProcess(@RequestBody String process) {
        try {
            JSONObject obj = new JSONObject(process);
            WfProcess newprocess = new WfProcess();
            newprocess.setId(obj.getString("id"));
            newprocess.setCode(obj.getString("code"));
            newprocess.setName(obj.getString("name"));
            newprocess.setWorkflowType(obj.getInt("workflowType"));
            newprocess.setProcessType(obj.getInt("processType"));
            newprocess.setBindEnClassName(obj.getString("bindEnClassName"));

            if (!obj.isNull("keywords")) {
                newprocess.setKeywords(obj.getString("keywords"));
            }
            if (!obj.isNull("description")) {
                newprocess.setDescription(obj.getString("description"));
            }
            if (!obj.isNull("authorId")) {
                newprocess.setAuthorId(obj.getString("authorId"));
            }
            if (!obj.isNull("author")) {
                newprocess.setAuthor(obj.getString("author"));
            }
            newprocess.setParent(obj.getString("parent"));
            if (!obj.isNull("owner")) {
                newprocess.setOwner(obj.getString("owner"));
            }
            if (!obj.isNull("proprietors")) {
                newprocess.setProprietors(com.alibaba.fastjson.JSONArray.parseArray(obj.getJSONArray("proprietors").toString()));
            }

            newprocess.setLastupdate(obj.getLong("lastupdate"));
            newprocess.setStatus(obj.getInt("status"));

            newprocess.setProcessContent(process);
            BuildtimeWfProcessBlo buildtimeWfProcessBlo = new BuildtimeWfProcessBlo();

            buildtimeWfProcessBlo.saveWfProcess(newprocess, environmentBuilder.buildEnvironment());
            return new ResponseMsg(); // success
        } catch (Exception e) {
            e.printStackTrace();
            throw new PlatformException(e.getMessage());
        }
    }
*/
    @ApiOperation(value = "保存一个流程模版")
    @PostMapping(path = "save-process-template")
    public ResponseMsg<String> saveWfProcess(@RequestBody NewWfProcessTemplate wfProcessTemplate) {
        System.out.println(wfProcessTemplate);
        NewWfProcessTemplate newWfProcessTemplate = newWfProcessTemplateDao.save(wfProcessTemplate);
        if (newWfProcessTemplate != null){
            return new ResponseMsg<>("success");
        }else
            return new ResponseMsg<>("error");
    }

    // API: service11/deleteByEnClass
    @ApiOperation(value = "强制删除绑定某类的所有模版及实例")
    @PostMapping(path = "delete-process-bindclass/{className}")
    public ResponseMsg deleteProcessByEnClass(@ApiParam(value = "类名", required = true) @PathVariable String className) {
        if (!SaaSServer.getInstance().hasClassByName(className)) return new ResponseMsg();
        try {
            BuildtimeWfProcessBlo buildtimeWfProcessBlo = new BuildtimeWfProcessBlo();
            buildtimeWfProcessBlo.deleteProcessByEnClass(className);
            return new ResponseMsg();
        } catch (Exception e) {
            e.printStackTrace();
            throw new PlatformException(e.getMessage());
        }
    }

    @ApiOperation(value = "检查某类是否有正在运行的实例")
    @PostMapping(path = "check-process-bindclass/{className}")
    public ResponseMsg checkProcessByEnClass(@ApiParam(value = "类名", required = true) @PathVariable String className) {
        if (!SaaSServer.getInstance().hasClassByName(className)) throw new PlatformException("类" + className + "不存在");
        try {
            BuildtimeWfProcessBlo buildtimeWfProcessBlo = new BuildtimeWfProcessBlo();
            buildtimeWfProcessBlo.checkInstanceByClassName(className);
            return new ResponseMsg();
        } catch (Exception e) {
            e.printStackTrace();
            throw new PlatformException(e.getMessage());
        }
    }

    // API: service13/getRlProcessesList 获取所有已发布的流程模版
   /* @ApiOperation(value = "获取所有已发布的流程模版")
    @PostMapping(path = "all-released-process-templates")
    public ResponseMsg<List<edu.thss.platform.service.wfprocess.BO.ReleasedWfProcessTemplate>> getAllReleasedProcessTemplates() {
        try {
            ReleasedWfProcessBlo releasedWfProcessBlo = new ReleasedWfProcessBlo();
            List<edu.thss.platform.service.wfprocess.BO.ReleasedWfProcessTemplate> processes = releasedWfProcessBlo.getAllReleasedProcessTemplates();
            return new ResponseMsg<>(processes);
        } catch (Exception e) {
            return new ResponseMsg(404);
        }
    }*/

    @ApiOperation(value = "获取所有已发布的流程模版")
    @PostMapping(path = "all-released-process-templates")
    public ResponseMsg<List<ReleasedWfProcessTemplate>> getAllReleasedProcessTemplates() {
        try {
            List<ReleasedWfProcessTemplate> releasedWfProcessTemplates = releasedWfProcessTemplateDao.findAll();
            return new ResponseMsg<>(releasedWfProcessTemplates);
        } catch (Exception e) {
            return new ResponseMsg(404);
        }
    }


    //----------------------------------------------------------------------

//	// getAllIdByEnClass
//	@ApiOperation(value = "获取绑定某类的所有未发布流程模版Id")
//	@GetMapping(path = "process-template-ids/{className}")
//	public List<String> getTemplateIdsByClassName(
//			@ApiParam(value = "类名", required = true) @PathVariable String className) throws Exception {
//		BuildtimeWfProcessBlo buildtimeWfProcessBlo = new BuildtimeWfProcessBlo();
//		List<String> processes = buildtimeWfProcessBlo.getTemplateIdsByClassName(className);
//
//		return processes;
//	}

    //	@ApiOperation(value = "获取用户的流程模版列表")
//	@GetMapping(path = "released-process-templates/{userId}")
//	public ResponseMsg<List<ReleasedWfProcessTemplate>> getReleasedProcessTemplates(
//			@ApiParam(value = "用户Id", required = true) @PathVariable String userId) throws Exception {
//		// 获得我的流程列表
//		try {
//			ReleasedWfProcessBlo releasedWfProcessBlo = new ReleasedWfProcessBlo();
//			List<ReleasedWfProcessTemplate> processes = releasedWfProcessBlo.getReleasedProcessTemplates(userId);
//			return new ResponseMsg<>(processes);
//		} catch (Exception e) {
//			return new ResponseMsg(404);
//
//		}
//	}


//	public List<DataVariable> getDataVariableList(String pid, String bindEnClassName) {
//		BuildtimeWfProcessBlo buildtimeWfProcessBlo = new BuildtimeWfProcessBlo();
//		return buildtimeWfProcessBlo.getDataVariableList(pid, bindEnClassName);
//	}

//	// API: service1/createWfProcess 新建一个流程模版
//	@RequestMapping(value = "/createWfProcess", method = RequestMethod.POST, headers = "Accept=application/json")
//	@ResponseBody
//	public JSTreeNode createWfProcess(String entityname, String authorid, String authorname, String bindenclassname) {
//		try {
//			System.out.println(">>>entityname :"+entityname);
//			WfProcess newprocess = new WfProcess();
//			BuildtimeIDGenerator buildtimeIDGenerator = new BuildtimeIDGenerator();
//			String id = buildtimeIDGenerator.getNewBuildTimeID();
//			String code = buildtimeIDGenerator.getNewBuildTimeCode();
//			newprocess.setId(id);
//			newprocess.setCode(code);
//			newprocess.setName(entityname);
//			newprocess.setLastupdate(System.currentTimeMillis());
//			newprocess.setAuthorId(authorid);
//			newprocess.setAuthor(authorname);
//			String parentid = "000000R";
//			newprocess.setParent(parentid);
//			newprocess.setBindEnClassName(bindenclassname);
//			newprocess.setWorkflowType(2);
//			// 自动添加对象属性
//			List<DataVariable> vars = getDataVariableList(id,newprocess.getBindEnClassName());
//			for(int i=0; i<vars.size(); i++) {
//				newprocess.addChild(vars.get(i));
//			}
//
//			String strWfProcess  = WfProcess2JSON.toPJSON(newprocess);
//			newprocess.setProcessContent(strWfProcess);
//
//			BuildtimeWfProcessBlo buildtimeWfProcessBlo = new BuildtimeWfProcessBlo();
//			buildtimeWfProcessBlo.createNewWfProcess(newprocess);
//
//			JSTreeNode wfprocess = new JSTreeNode();
//			wfprocess.id = id;
//			wfprocess.text = entityname;
//			wfprocess.parentId = parentid;
//			wfprocess.data = "3|null|" + newprocess.getCode();
//			return wfprocess; // failed
//		} catch (Exception e) {
//			e.printStackTrace();
//			return null;
//		}
//	}


    // API: service1/api6 通过id获取流程模版
    // void : @ResponseStatus(value = HttpStatus.OK)
//	@RequestMapping(value = "/api6", method = RequestMethod.GET, produces = "application/json; charset=utf-8")
//	@ResponseBody
//	public String getWfProcess(@RequestParam("id") String id) {
//		try {
//            BuildtimeWfProcessBlo buildtimeWfProcessBlo = new BuildtimeWfProcessBlo();
//			return buildtimeWfProcessBlo.getProcessContent(id);
//		} catch (Exception e) {
//			e.printStackTrace();
//		}
//		return null;
//	}


//	// servcie1/deleteWfProcess 批量删除未发布的流程模版
//	@RequestMapping(value = "/deleteWfProcesses", method = RequestMethod.POST, headers = "Accept=application/json")
//	@ResponseBody
//	public String deleteWfProcesses(String[] processIds) {
//		try {
//			if (processIds != null && processIds.length > 0) {
//				for (String id : processIds) {
//					BuildtimeWfProcessBlo buildtimeWfProcessBlo = new BuildtimeWfProcessBlo();
//					buildtimeWfProcessBlo.deleteWfProcess(id);
//				}
//				return "{\"status\": \"1\"}"; // success
//			}
//			return "{\"status\": \"0\"}"; // failed
//		} catch (Exception e) {
//			e.printStackTrace();
//			return "{\"status\": \"0\"}"; // failed
//		}
//	}
//	// servcie1/deleteWfProcess 批量删除已发布的流程模版
//	@RequestMapping(value = "/deleteRlProcesses", method = RequestMethod.POST, headers = "Accept=application/json")
//	@ResponseBody
//	public String deleteRlProcesses(String[] processIds) {
//		try {
//			if (processIds != null && processIds.length > 0) {
//				for (String id : processIds) {
//					ReleasedWfProcessBlo releasedWfProcessBlo = new ReleasedWfProcessBlo();
//					releasedWfProcessBlo.deleteWfProcess(id);
//				}
//				return "{\"status\": \"1\"}"; // success
//			}
//			return "{\"status\": \"0\"}"; // failed
//		} catch (Exception e) {
//			e.printStackTrace();
//			return "{\"status\": \"0\"}"; // failed
//		}
//	}


// 未用
//	// API: service1/getAllIdByEnClass
//	@RequestMapping(value = "/getAllIdByEnClass", method = RequestMethod.GET, headers = "Accept=application/json")
//	@ResponseBody
//	public List<String> getAllIdByEnClass(String ename) throws Exception {
//		BuildtimeWfProcessBlo buildtimeWfProcessBlo = new BuildtimeWfProcessBlo();
//		List<String> processes = buildtimeWfProcessBlo.getAllIdByEnClass(ename);
//		ReleasedWfProcessBlo releasedWfProcessBlo = new ReleasedWfProcessBlo();
//		processes.addAll(releasedWfProcessBlo.getAllIdByEnClass(ename));
//		return processes;
//	}


    // void : @ResponseStatus(value = HttpStatus.OK)
//	@RequestMapping(value = "/api13", method = RequestMethod.GET, produces = "application/json; charset=utf-8")
//	@ResponseBody
//	public ReleasedWfProcess getReleasedWfProcess(@RequestParam("id") String id) {
//		try {
//            ReleasedWfProcessBlo releasedWfProcessBlo = new ReleasedWfProcessBlo();
//			return releasedWfProcessBlo.getReleasedProcess(id);
//		} catch (Exception e) {
//			e.printStackTrace();
//		}
//		return null;
//	}

//	@RequestMapping(value = "/api15", method = RequestMethod.POST, headers = "Accept=application/json")
//	@ResponseBody
//	public String updateReleaseWfProcess(String process) {
//		try {
//			JSONObject obj = new JSONObject(process);
//			ReleasedWfProcess releasedProcess = new ReleasedWfProcess();
//			releasedProcess.setId(obj.getString("id"));
//			releasedProcess.setName(obj.getString("name"));
//			if (!obj.isNull("version")) {
//				releasedProcess.setVersion(obj.getString("version"));
//			}
//			if (!obj.isNull("releaser")) {
//				releasedProcess.setReleaser(obj.getString("releaser"));
//			}
//			if (!obj.isNull("releaserId")) {
//				releasedProcess.setReleaserId(obj.getString("releaserId"));
//			}
//			if (!obj.isNull("releaseStatement")) {
//				releasedProcess.setReleaseStatement(obj.getString("releaseStatement"));
//			}
//
//			if (!obj.isNull("owner")) {
//				releasedProcess.setOwner(obj.getString("owner"));
//			}
//            ReleasedWfProcessBlo releasedWfProcessBlo = new ReleasedWfProcessBlo();
//			releasedWfProcessBlo.updateReleasedWfProcess(releasedProcess);
//		} catch (Exception e) {
//			e.printStackTrace();
//			return "{\"status\": \"0\"}"; // failed
//		}
//		return "{\"status\": \"1\"}"; // success
//	}


//	@RequestMapping(value = "/api24", method = RequestMethod.POST, headers = "Accept=application/json")
//	@ResponseBody
//	public String copyWfProcess(String pid, String parent, String orgid, String type) {
//		try {
//			if (type.equals("R")) {
//                ReleasedWfProcessBlo releasedWfProcessBlo = new ReleasedWfProcessBlo();
//				WfProcess newprocess = releasedWfProcessBlo.copyReleasedWfProcess(pid);
//				// copy the files in the folder
//				return "{\"status\": \"1\", \"id\": \"" + newprocess.getId() + "\"}"; // success
//			} else if (type.equals("P")) {
//                BuildtimeWfProcessBlo buildtimeWfProcessBlo = new BuildtimeWfProcessBlo();
//				WfProcess newprocess = buildtimeWfProcessBlo.copyWfProcess(pid);
//				// copy the files in the folder
//				return "{\"status\": \"1\", \"id\": \"" + newprocess.getId() + "\"}"; // success
//			}
//		} catch (Exception e) {
//			e.printStackTrace();
//
//		}
//		return "{\"status\": \"0\"}"; // failed
//	}

    // 未用
// 	//模版重命名 API: service1/api7
//	@RequestMapping(value = "/api7", method = RequestMethod.POST, headers = "Accept=application/json")
//	@ResponseBody
//	public int updateWfProcessName(String id, String entityname, String lastupdate) {
//		try {
//            BuildtimeWfProcessBlo buildtimeWfProcessBlo = new BuildtimeWfProcessBlo();
//			WfProcess p = buildtimeWfProcessBlo.getProcessById(id);
//			String oldname = p.getName();
//			String name = StringEscapeUtils.escapeSql(entityname);
//			p.setName(name);
//			String content = p.getProcessContent();
//			if (content != null) {
//				String newcontent = content.replaceAll(oldname, name);
//				p.setProcessContent(newcontent);
//			}
//			p.setLastupdate(Long.parseLong(lastupdate));
//			buildtimeWfProcessBlo.updateProcessName(p);
//		} catch (Exception e) {
//			e.printStackTrace();
//		}
//		return 1;
//	}


    // 老版本弃用

//	/**
//	 * Move a wfprocess from one folder to another folder. The type is 100, the
//	 * process folder; 109, the released process folder;
//	 *
//	 * @param pid
//	 * @param parent
//	 * @param type   wfprocess type : "R", "P"
//	 * @return
//	 */
//	@RequestMapping(value = "/api22", method = RequestMethod.POST, headers = "Accept=application/json")
//	@ResponseBody
//	public int moveWfProcess(String pid, String parent, String type) {
//		try {
//			if (type.equals("P")) {
//				BuildtimeWfProcessBlo buildtimeWfProcessBlo = new BuildtimeWfProcessBlo();
//				WfProcess p = buildtimeWfProcessBlo.getProcessById(pid);
//				String oldparent = p.getParent();
//				String content = p.getProcessContent();
//				String newcontent = content.replaceAll(oldparent, parent);
//				p.setProcessContent(newcontent);
//				buildtimeWfProcessBlo.moveWfProcess(pid, parent, content);
//			} else if (type.equals("R")) {
//				ReleasedWfProcessBlo releasedWfProcessBlo = new ReleasedWfProcessBlo();
//				ReleasedWfProcess rp = releasedWfProcessBlo.prepReleasedWfProcess(pid);
//				String oldparent = rp.getParent();
//				String content = rp.getProcessContent();
//				String newcontent = content.replaceAll(oldparent, parent);
//				rp.setProcessContent(newcontent);
//				releasedWfProcessBlo.moveReleasedWfProcess(pid, parent, content);
//			}
//		} catch (Exception e) {
//			e.printStackTrace();
//		}
//		return 1;
//	}

//	@RequestMapping(value = "/api11", method = RequestMethod.POST, headers = "Accept=application/json")
//	@ResponseBody
//	public String deleteWfProcess(String processid, String ownerid) {
//		try {
//            BuildtimeWfProcessBlo buildtimeWfProcessBlo = new BuildtimeWfProcessBlo();
//			buildtimeWfProcessBlo.deleteWfProcess(processid);
//            ReleasedWfProcessBlo releasedWfProcessBlo = new ReleasedWfProcessBlo();
//			releasedWfProcessBlo.deleteWfProcess(processid);
//
//			return "{\"status\": \"1\"}"; // success
//		} catch (Exception e) {
//			e.printStackTrace();
//			return "{\"status\": \"0\"}"; // failed
//		}
//	}


//	--------被规范化

//	@RequestMapping(value = "/api0", method = RequestMethod.GET, headers = "Accept=application/json")
//	@ResponseBody
//	public JSTreeNode[] getProcesses() throws Exception {
//		// service1/api0 获得我的流程
//		JSTreeNode root = new JSTreeNode();
//		root.id = "000000R";
//		root.text = "根节点";
//		root.icon = "glyphicon glyphicon-home";
//		root.data = "1|null";
//		// WfProcess[] processes = buildtimeWfProcessBlo.getAllProcessesOfProprietors("000001");
//        BuildtimeWfProcessBlo buildtimeWfProcessBlo = new BuildtimeWfProcessBlo();
//		WfProcess[] processes = buildtimeWfProcessBlo.getAllProcesses();
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
//
//		return new JSTreeNode[] {root};
//	}

//	@RequestMapping(value = "/getProcessesList", method = RequestMethod.GET, headers = "Accept=application/json")
//	@ResponseBody
//	public String[] getProcessesList(String id) throws Exception {
//	// 获得我的流程列表
//		System.out.println(">>>getProcessesList id:"+id);
//		BuildtimeWfProcessBlo buildtimeWfProcessBlo = new BuildtimeWfProcessBlo();
//		WfProcess[] processes = buildtimeWfProcessBlo.getAllProcessesOfProprietors(id);
//		String[] processeslist = new String[processes.length];
//		for(int i=0;i<processes.length;i++) {
//			processeslist[i] = WfProcess2JSON.toPJSON(processes[i]);
//		}
//		return processeslist;
//	};

//	 servcie1/deleteWfProcess 删除一个未发布流程模版
//	@RequestMapping(value = "/deleteWfProcess", method = RequestMethod.POST, headers = "Accept=application/json")
//	@ResponseBody
//	public String deleteWfProcess(String processid) {
//		try {
//            BuildtimeWfProcessBlo buildtimeWfProcessBlo = new BuildtimeWfProcessBlo();
//			buildtimeWfProcessBlo.deleteWfProcess(processid);
//			return "{\"status\": \"1\"}"; // success
//		} catch (Exception e) {
//			e.printStackTrace();
//			return "{\"status\": \"0\"}"; // failed
//		}
//	}

//	// servcie1/deleteRlProcess 删除一个已发布的流程模版
//	@RequestMapping(value = "/deleteRlProcess", method = RequestMethod.POST, headers = "Accept=application/json")
//	@ResponseBody
//	public String deleteRlProcess(String processid) {
//		try {
//			ReleasedWfProcessBlo releasedWfProcessBlo = new ReleasedWfProcessBlo();
//			if (SaaSServer.getInstance().canBeDeleteRlProcess(processid)) {
//				releasedWfProcessBlo.deleteWfProcess(processid);
//				return "{\"status\": \"1\"}"; // success
//			}
//			return "{\"status\": \"-1\"}"; // failed
//		} catch (Exception e) {
//			e.printStackTrace();
//			return "{\"status\": \"0\"}"; // failed
//		}
//	}

    // API: service11/deleteByEnClass
//	@RequestMapping(value = "/deleteByEnClass", method = RequestMethod.GET, headers = "Accept=application/json")
//	@ResponseBody
//	public ResponseMsg deleteByEnClass(String ename) throws Exception {
//		try {
//			BuildtimeWfProcessBlo buildtimeWfProcessBlo = new BuildtimeWfProcessBlo();
//			List<String> processes = buildtimeWfProcessBlo.getAllIdByEnClass(ename);
//			String s = "";
//			for (String id : processes) {
//				s = this.deleteWfProcess(id);
//				if (!s.equals("{\"status\": \"1\"}")) { return new ResponseMsg(); }
//			}
//			ReleasedWfProcessBlo releasedWfProcessBlo = new ReleasedWfProcessBlo();
//			processes = releasedWfProcessBlo.getAllIdByEnClass(ename);
//			for (String id : processes) {
//				// 删除该流程模版下的所有流程实例
//				SaaSServer.getInstance().removeAllInstances(id);
//				// 删除该流程模版
//				releasedWfProcessBlo.deleteWfProcess(id);
//			}
//			return new ResponseMsg();
//		} catch (Exception e) {
//			e.printStackTrace();
//			return new ResponseMsg(500); // failed
//		}
//	}

    //service1/releaseWfProcess DWF发布一个流程
//	@RequestMapping(value = "/releaseWfProcess", method = RequestMethod.POST, headers = "Accept=application/json")
//	@ResponseBody
//	public String releaseWfProcess(String pid, String version, String releaser, String releaserid, String versionnote) {
//		try {
//			ReleasedWfProcessBlo releasedWfProcessBlo = new ReleasedWfProcessBlo();
//			String id = releasedWfProcessBlo.sendWfProcessForApproval(pid, version, releaser, releaserid, versionnote,
//					"000000R", "");
//			return "{\"status\": \"1\", \"id\": \"" + id + "\"}"; // success
//		} catch (Exception e) {
//			e.printStackTrace();
//			return "{\"status\": \"0\"}"; // failed
//		}
//	}

    //	@RequestMapping(value = "/api1", method = RequestMethod.GET, produces = "application/json")
//	@ResponseBody
//	public String getNewIDandSerialNumber() {
//		try {
//			BuildtimeIDGenerator buildtimeIDGenerator = new BuildtimeIDGenerator();
//			String id = buildtimeIDGenerator.getNewBuildTimeID();
//			String sn = buildtimeIDGenerator.getNewBuildTimeCode();// serialNumber
//			return id + "|" + sn;
//		} catch (Exception e) {
//			e.printStackTrace();
//		}
//		return "0";
//	}

    //api2
//	@RequestMapping(value = "/getNewID", method = RequestMethod.GET, produces = "application/json")
//	@ResponseBody
//	public String getNewID() {
//		try {
//			BuildtimeIDGenerator buildtimeIDGenerator = new BuildtimeIDGenerator();
//			String id = buildtimeIDGenerator.getNewBuildTimeID();
//			return id;
//		} catch (Exception e) {
//			e.printStackTrace();
//		}
//		return null;
//	}

    //	@ApiOperation(value = "批量删除未发布的流程模版")
//	@PostMapping(path = "delete-process-templates")
//	public ResponseMsg deleteWfProcessTemplates(
//			@RequestBody String[] templateIds) {
//		try {
//			BuildtimeWfProcessBlo buildtimeWfProcessBlo = new BuildtimeWfProcessBlo();
//			buildtimeWfProcessBlo.deleteWfProcesses(templateIds);
//			return new ResponseMsg();
//		} catch (Exception e) {
//			e.printStackTrace();
//			return new ResponseMsg(500,"删除失败");
//		}
//	}

}

