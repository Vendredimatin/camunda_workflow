package edu.thss.platform.newService.dwf;

import edu.thss.platform.service.omf.ItemClassAccessService;
import edu.thss.platform.service.omf.ObjectAccessService;
import edu.thss.platform.util.RestTemplateUtils;
import edu.thss.platform.utils.BeanHelper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class DWFContext {

    private ItemClassAccessService itemClassAccessService = null;


    public DWFContext(){
        itemClassAccessService = (ItemClassAccessService) BeanHelper.getBean("itemClassAccessService");
    }


    public String createEnClass(String bindEnClassName){
        // 发起流程时新增一个实体类对象 绑定oid
        List<Map<String, Object>> objs = new ArrayList<>();
        Map<String, Object> obj = new HashMap<>();
        objs.add(obj);
        List<Map<String, Object>> result = itemClassAccessService.addEntityObjects(bindEnClassName, objs);
        String newEnObjId = (String)result.get(0).get("oid");
        return newEnObjId;
    }

    public String getUserName(String oid) {
        String url = "http://localhost:9090/dwf/v1/org/users/{oid}";

        ResponseEntity<Map> entity = RestTemplateUtils.get(url, Map.class, oid);
        String userName = (String) entity.getBody().get("name");
        return userName;
    }
}
