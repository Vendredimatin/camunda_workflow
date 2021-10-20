package edu.thss.platform.service.modelpackage.dependency.components.workflow;

import edu.thss.platform.service.modelpackage.dependency.Analysable;
import edu.thss.platform.service.modelpackage.dependency.DependencyItem;
import edu.thss.platform.service.wfprocess.blo.buildtime.wfprocess.BuildtimeWfProcessBlo;
import net.sf.json.JSONArray;
import net.sf.json.JSONObject;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import javax.persistence.EntityManager;
import java.util.*;

@Component
public class WorkFlowAnalyser implements Analysable {
   @Autowired
   EntityManager em;

   @Override
   public String getType() {
       return "WfProcess";
   }

   @Override
   public Set<DependencyItem> analyseDependency(DependencyItem item) {
       Set<DependencyItem> res = new HashSet<>();

       try {
           String templateId = String.valueOf(item.getKey());
           BuildtimeWfProcessBlo buildtimeWfProcessBlo = new BuildtimeWfProcessBlo();
           String s = buildtimeWfProcessBlo.getProcessContent(templateId);
           JSONObject jsonObject = JSONObject.fromObject(s);
           String entityclassname = jsonObject.getString("bindEnClassName");
           List<DependencyItem> temp =  this.analyseWfProcessTemplateJson(jsonObject, entityclassname);
           res.addAll(temp);
       } catch (Exception e) {
           //e.printStackTrace();
       }
       return res;
   }

   private List<String> classKeyWordsForWF = new ArrayList<String>(Arrays.asList("bindEnClassName"));
   private List<String> operationKeyWordsForWF = new ArrayList<>(Arrays.asList("startOperation", "beforeOperation", "afterOperation", "endOperation"));
   private List<String> formKeyWorfsForWF = new ArrayList<>(Arrays.asList("launchFormName", "formName", "endFormName"));

   private List<DependencyItem> analyseWfProcessTemplateJson(Object objJson, String entityClassName) {
       List<DependencyItem> res = new LinkedList<>();

       if(objJson instanceof JSONArray){
           JSONArray objArray = (JSONArray)objJson;
           for (int i = 0; i < objArray.size(); i++) {
               List<DependencyItem> temp = analyseWfProcessTemplateJson(objArray.get(i), entityClassName);
               res.addAll(temp);
           }
       }

       //如果为json对象
       else if(objJson instanceof JSONObject) {
           JSONObject jsonObject = (JSONObject) objJson;
           if (jsonObject.isNullObject()) {
               return new ArrayList<>();
           }
           Iterator it = jsonObject.keys();
           while (it.hasNext()) {
               String key = it.next().toString();
               Object object = jsonObject.get(key);
               //如果得到的是数组
               if (object instanceof JSONArray) {
                   JSONArray objArray = (JSONArray) object;
                   List<DependencyItem> temp = analyseWfProcessTemplateJson(objArray, entityClassName);
                   res.addAll(temp);
               }
               //如果key中是一个json对象
               else if (object instanceof JSONObject) {
                   List<DependencyItem> temp = analyseWfProcessTemplateJson((JSONObject) object, entityClassName);
                   res.addAll(temp);
               }
               //如果key中是其他
               else {
                   if (object.toString().length() > 0 && object.toString() != "null") {
                       if (this.classKeyWordsForWF.contains(key)) {
                           DependencyItem item = new DependencyItem();
                           item.setKey(object.toString());
                           item.setType("ItemOnlyClass");
                           res.add(item);
                       } else if (this.formKeyWorfsForWF.contains(key)) {
                           DependencyItem item = new DependencyItem();
                           item.setKey(entityClassName + ":" + object);
                           item.setType("CustomView");
                           res.add(item);
                       } else if (this.operationKeyWordsForWF.contains(key)) {
                           try {
                               String sql = "select plt_oid from plt_fpt_queryoprconfig where plt_authority = '" + object + "'";
                               List<String> queryResult = em.createNativeQuery(sql).getResultList();
                               if (queryResult.size() > 0) {
                                   String oprOid = queryResult.get(0);
                                   {
                                       DependencyItem item = new DependencyItem();
                                       item.setKey(oprOid);
                                       item.setType("Opr");
                                       res.add(item);
                                   }
                                   {
                                       DependencyItem item = new DependencyItem();
                                       item.setKey(oprOid);
                                       item.setType("GlobalFunction");
                                       res.add(item);
                                   }
                               }
                           } catch (Exception e) {
                               //e.printStackTrace();
                           }
                       } else {
                       }
                   }
               }
           }
       }
       return res;
   }
}
