package edu.thss.platform.controller.wfprocess;

import edu.thss.platform.controller.ResponseMsg;
import edu.thss.platform.dao.wfprocess.NewWfProcessTemplateDao;
import edu.thss.platform.dao.wfprocess.ReleasedWfProcessTemplateDao;
import edu.thss.platform.domain.wfprocess.NewWfProcessInstance;
import edu.thss.platform.domain.wfprocess.NewWfProcessTemplate;
import edu.thss.platform.domain.wfprocess.ReleasedWfProcessTemplate;
import edu.thss.platform.exception.PlatformException;
import edu.thss.platform.newService.Server;
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


    /*@ApiOperation(value = "获取新id")
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
    }*/

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

    /*@ApiOperation(value = "获取所有未发布的流程模版列表")
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
    }*/

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
    /*@ApiOperation(value = "删除一个已发布的流程模版")
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
    }*/

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
    /*@ApiOperation(value = "强制删除绑定某类的所有模版及实例")
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
    }*/

    /*@ApiOperation(value = "检查某类是否有正在运行的实例")
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
    }*/

    // API: service13/getRlProcessesList 获取所有已发布的流程模版
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
}

