/*
package edu.thss.platform.service.modelpackage.release.model;

import edu.thss.platform.service.modelpackage.release.util.PrintUtil;
import edu.thss.platform.service.modelpackage.util.PackageConfig;
import edu.thss.platform.service.modelpackage.release.datastruct.ReleaseParam;
import edu.thss.platform.service.org.bo.Environment;
import edu.thss.platform.service.wfprocess.BO.WfProcessTemplate;
import edu.thss.platform.service.wfprocess.blo.buildtime.id.BuildtimeIDGenerator;
import edu.thss.platform.service.wfprocess.blo.buildtime.wfprocess.BuildtimeWfProcessBlo;
import edu.thss.platform.service.wfprocess.core.repository.DBJdbcTemplateFactory;
import edu.thss.platform.utils.EnvironmentBuilder;
import org.apache.commons.lang3.exception.ExceptionUtils;
import org.json.JSONArray;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.stereotype.Component;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.*;

@Component
public class WorkflowReleaserSub implements SubModelReleaser {

   protected JdbcTemplate jdbcTemplate = DBJdbcTemplateFactory.getJdbcTemplate();
   @Autowired
   EnvironmentBuilder environmentBuilder;

   @Autowired
   PrintUtil printUtil;

   @Override
   public int getOrder() {
       return 6;
   }

   @Override
   public String getName() {
       return "processModel";
   }

   @Override
   public void releaseModels(ReleaseParam releaseParam, Object data) throws Exception {
       Map<String, Object> processModel = PackageConfig.getYamlMapper().convertValue(data, LinkedHashMap.class);

       List<String> wfTemplateList = (ArrayList<String>)processModel.get("workflowTemplate");
       Collections.reverse(wfTemplateList);

       releaseWfTemplate(wfTemplateList, releaseParam);
   }

   public void releaseWfTemplate(List<String> wfTemplateList, ReleaseParam releaseParam) throws Exception {
       Environment env = environmentBuilder.buildEnvironment();
       BuildtimeWfProcessBlo buildtimeWfProcessBlo = new BuildtimeWfProcessBlo();
       for(String processContent : wfTemplateList) {
           try {
               JSONObject obj00 = new JSONObject(processContent);
               //看存不存在同名的流程模板，存在就删除
               String templateId =  checkName(obj00.getString("name"));

               printUtil.println("开始处理流程模板" + templateId, releaseParam.getUuid());

               if(templateId != null) {
                   buildtimeWfProcessBlo.deleteWfProcess(templateId);
               }
               //新建一个流程模板
               WfProcessTemplate wfProcessTemplate = new WfProcessTemplate();
               wfProcessTemplate.setAuthor(env.getUserName());
               wfProcessTemplate.setAuthorId(env.getUserOid());
               wfProcessTemplate.setName(obj00.getString("name"));
               wfProcessTemplate.setBindEnClassName(obj00.getString("bindEnClassName"));
               edu.thss.platform.service.wfprocess.core.buildtime.wfprocess.WfProcess t = buildtimeWfProcessBlo.createProcessTemplates(wfProcessTemplate);
               if(t!=null){
                   templateId = t.getId();
               } else {
                   continue;
               }

               //获取流程模板的内容
               String s = buildtimeWfProcessBlo.getProcessContent(templateId);
               JSONObject template = new JSONObject(s);

               //使用现有的模板内容，覆盖这个新建的模板内容，保存起来
               edu.thss.platform.service.wfprocess.core.buildtime.wfprocess.WfProcess newprocess = new edu.thss.platform.service.wfprocess.core.buildtime.wfprocess.WfProcess();
               newprocess.setId(template.getString("id"));
               newprocess.setCode(template.getString("code"));
               newprocess.setName(template.getString("name"));
               template.put("workflowType", obj00.getInt("workflowType"));
               newprocess.setWorkflowType(template.getInt("workflowType"));
               template.put("processType", obj00.getInt("processType"));
               newprocess.setProcessType(template.getInt("processType"));
               template.put("bindEnClassName", obj00.getString("bindEnClassName"));
               newprocess.setBindEnClassName(template.getString("bindEnClassName"));

               if (!obj00.isNull("keywords")) {
                   template.put("keywords", obj00.getString("keywords"));
                   newprocess.setKeywords(template.getString("keywords"));
               } else {
                   template.remove("keywords");
               }

               if (!obj00.isNull("description")) {
                   template.put("description", obj00.getString("description"));
                   newprocess.setDescription(template.getString("description"));
               } else {
                   template.remove("description");
               }

               if (!obj00.isNull("authorId")) {
                   template.put("authorId", obj00.getString("authorId"));
                   newprocess.setAuthorId(template.getString("authorId"));
               } else {
                   template.remove("authorId");
               }

               if (!obj00.isNull("author")) {
                   template.put("author", obj00.getString("author"));
                   newprocess.setAuthor(template.getString("author"));
               } else {
                   template.remove("author");
               }

               newprocess.setParent(template.getString("parent"));

               if(!obj00.isNull("owner")){
                   template.put("owner", obj00.getString("owner"));
                   newprocess.setOwner(template.getString("owner"));
               } else {
                   template.remove("owner");
               }

               if(!obj00.isNull("proprietors")){//proprietors置空
                   //template.put("proprietors", com.alibaba.fastjson.JSONArray.parseArray(obj00.getJSONArray("proprietors").toString()));
                   //newprocess.setProprietors(com.alibaba.fastjson.JSONArray.parseArray(template.getJSONArray("proprietors").toString()));
                   template.put("proprietors", com.alibaba.fastjson.JSONArray.parseArray(new JSONArray().toString()));
                   newprocess.setProprietors(com.alibaba.fastjson.JSONArray.parseArray(new JSONArray().toString()));
               } else {
                   template.remove("proprietors");
               }

               template.put("lastupdate", obj00.getLong("lastupdate"));
               newprocess.setLastupdate(template.getLong("lastupdate"));
               template.put("status", obj00.getInt("status"));
               newprocess.setStatus(template.getInt("status"));

               //还有最重要的children内容
               JSONArray children = obj00.getJSONArray("children");
               JSONArray newChildren = template.getJSONArray("children");

               Map<String, String> dataVarNameToId = new HashMap<>();
               for(Object newChild : newChildren) {//现在这里面只有类的变量
                   JSONObject dataVarObj = new JSONObject(String.valueOf(newChild));
                   if(!dataVarObj.isNull("classtypename")) {
                       if(dataVarObj.getString("classtypename").equals("DataVariable")) {
                           if(!dataVarObj.isNull("name") && !dataVarObj.isNull("id")) {
                               dataVarNameToId.put(dataVarObj.getString("name"), dataVarObj.getString("id"));
                           }
                       }
                   }
               }

               //修改child中的currOwner， id， accessibleVars， participants
               //把除了类的变量之外的child放到tempChildren中
               JSONArray tempChildren = new JSONArray();
               Map<String, String> childOldIdToNewId = new HashMap<>();
               BuildtimeIDGenerator buildtimeIDGenerator = new BuildtimeIDGenerator();
               for(Object child : children) {
                   JSONObject childObj = new JSONObject(String.valueOf(child));
                   if (!childObj.isNull("classtypename")) {
                       if(!childObj.getString("classtypename").equals("DataVariable")) {
                           //改currOwner
                           childObj.put("currOwner", template.getString("id"));
                           //改id
                           String id = buildtimeIDGenerator.getNewBuildTimeID();
                           childOldIdToNewId.put(childObj.getString("id"), id);
                           childObj.put("id", id);
                           //改accessibleVars
                           if( ! childObj.isNull("accessibleVars")) {
                               JSONArray oldAccessibleVars = childObj.getJSONArray("accessibleVars");
                               JSONArray newAccessibleVars = new JSONArray();
                               for (Object accessibleVar : oldAccessibleVars) {
                                   JSONObject accessibleVarObj = new JSONObject(String.valueOf(accessibleVar));
                                   if (dataVarNameToId.containsKey(accessibleVarObj.getString("componentId"))) {
                                       accessibleVarObj.put("currOwner", template.getString("id"));
                                       accessibleVarObj.put("varId", dataVarNameToId.get(accessibleVarObj.getString("componentId")));
                                       newAccessibleVars.put(accessibleVarObj);
                                   }
                               }
                               childObj.put("accessibleVars", newAccessibleVars);
                           }
                           //改participants
                           if(! childObj.isNull("participants")) {
                               JSONArray oldParticipants = childObj.getJSONArray("participants");
                               JSONArray newParticipants = new JSONArray();
                               for(Object participants : oldParticipants) {
                                   JSONObject participantsObj = new JSONObject(String.valueOf(participants));
                                   if(!participantsObj.isNull("participantType")) {
                                       if(participantsObj.getString("participantType").equals("launcher")) {
                                           newParticipants.put(participantsObj);
                                       }

                                   }
                               }
                               childObj.put("participants", newParticipants);
                           }
                           //把改完之后的obj放到列表中
                           tempChildren.put(childObj);
                       }
                   }
               }

               //修改childObj的output部分
               //然后放到newChildren中
               for(Object child : tempChildren) {
                   JSONObject childObj = new JSONObject(String.valueOf(child));
                   if(! childObj.isNull("outputs")) {
                       JSONArray oldOutputs = childObj.getJSONArray("outputs");
                       JSONArray newOutputs = new JSONArray();
                       for(Object output : oldOutputs) {
                           JSONObject outputObj = new JSONObject(String.valueOf(output));

                           outputObj.put("currOwner", template.getString("id"));

                           outputObj.put("id", buildtimeIDGenerator.getNewBuildTimeID());

                           outputObj.put("source", childOldIdToNewId.get(outputObj.getString("source")));
                           outputObj.put("target", childOldIdToNewId.get(outputObj.getString("target")));

                           newOutputs.put(outputObj);
                       }
                       childObj.put("outputs", newOutputs);
                   }
                   newChildren.put(childObj);
               }

               template.put("children", newChildren);
               newprocess.setProcessContent(template.toString());

               buildtimeWfProcessBlo.saveWfProcess(newprocess);

               printUtil.println("\t流程模板释放成功", releaseParam.getUuid());

           } catch (Exception e) {
               printUtil.println("\t流程模板释放失败\n" +
                                   "\t\t释放时"+ ExceptionUtils.getRootCauseMessage(e), releaseParam.getUuid());
           }
       }
   }

   public String checkName(String name) throws Exception {
       String sql = "Select Pk_WfProcess from plt_bt_wfprocess where ProcessName=?";
       List<String> res = jdbcTemplate.query(sql, new RowMapper<String>() {
           public String mapRow(ResultSet rs, int rowNum) throws SQLException {
               return rs.getString("Pk_WfProcess");
           }
       }, name);
       if (res.size() > 0) return res.get(0);
       else return null;
   }
}
*/
