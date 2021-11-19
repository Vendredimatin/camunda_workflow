/*
package edu.thss.platform.service.modelpackage.create.models;

import edu.thss.platform.service.modelpackage.create.ModelFileCreator;
import edu.thss.platform.service.modelpackage.create.datastruct.PackageParam;
import edu.thss.platform.service.modelpackage.showup.ShowUpItem;
import edu.thss.platform.service.wfprocess.blo.buildtime.wfprocess.BuildtimeWfProcessBlo;
import org.springframework.stereotype.Component;

import java.util.*;

@Component
public class WorkflowCreator implements ModelCreator{

   private BuildtimeWfProcessBlo buildtimeWfProcessBlo;

//    public WorkflowCreator(){
//         buildtimeWfProcessBlo = new BuildtimeWfProcessBlo();
//    }

   @Override
   public int getOrder() {
       return 6;
   }

   @Override
   public String getName() {
       return "processModel";
   }

   @Override
   public Object getModels(PackageParam packageParam) {
       Map<String, Object> processModel = new LinkedHashMap<>();
       processModel.put("workflowTemplate", getWFTemplates(packageParam));
       return processModel;
   }

   private Object getWFTemplates(PackageParam packageParam){
       List<String> res = new LinkedList<>();

       List<ShowUpItem> itemList = ModelFileCreator.getFlattenNodes(ModelFileCreator.getPickedNodes(packageParam.getWholeNodes()),
               showUpItem -> "WfProcess".equals(showUpItem.getType()));

       for(ShowUpItem showUpItem : itemList) {
           try {
               String templateId = showUpItem.getKeyInType();
               if(buildtimeWfProcessBlo == null) {
                    buildtimeWfProcessBlo = new BuildtimeWfProcessBlo();
               }
               String s = buildtimeWfProcessBlo.getProcessContent(templateId);
               res.add(s);
           } catch (Exception e) {
           }
       }

       return res;
   }
}
*/
