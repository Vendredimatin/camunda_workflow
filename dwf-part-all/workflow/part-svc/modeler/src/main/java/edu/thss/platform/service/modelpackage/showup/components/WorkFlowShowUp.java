package edu.thss.platform.service.modelpackage.showup.components;

import edu.thss.platform.service.modelpackage.showup.ShowUpItem;
import edu.thss.platform.service.modelpackage.showup.Showable;
import edu.thss.platform.service.org.bo.Environment;
import edu.thss.platform.service.wfprocess.BO.WfProcessTemplate;
import edu.thss.platform.service.wfprocess.blo.buildtime.wfprocess.BuildtimeWfProcessBlo;
import org.springframework.stereotype.Component;
import java.util.LinkedHashMap;
import java.util.List;

@Component
public class WorkFlowShowUp implements Showable {

   @Override
   public Integer getShowNumber() {
       return 60;
   }

   @Override
   public ShowUpItem getOneItem(Environment env) {
       ShowUpItem showUpItem = new ShowUpItem();
       showUpItem.setKeyInType("WfProcess");
       showUpItem.setTitle("流程模板");
       showUpItem.setOriginTitle("流程模板");
       showUpItem.setType("Category");

       try {
           BuildtimeWfProcessBlo buildtimeWfProcessBlo = new BuildtimeWfProcessBlo();
           List<WfProcessTemplate> allTemplates = buildtimeWfProcessBlo.getAllProcessTemplates();
           for(WfProcessTemplate template : allTemplates) {
               ShowUpItem wfItem = new ShowUpItem();
               wfItem.setKeyInType(template.getId());
               wfItem.setTitle(template.getName());
               wfItem.setType("WfProcess");

               showUpItem.getChildren().add(wfItem);
           }
       } catch (Exception e) {
           e.printStackTrace();
       }

       showUpItem.setKey2countName(new LinkedHashMap<>());
       showUpItem.getKey2countName().put("WfProcess", "流程模板数目");

       return showUpItem;
   }
}
