/**
 *
 */
package edu.thss.platform.service.wfprocess.runtime.server;

import com.alibaba.fastjson.JSON;
import edu.thss.platform.domain.itemclass.org.Group;
import edu.thss.platform.domain.itemclass.org.User;
import edu.thss.platform.exception.PlatformException;
import edu.thss.platform.service.modeler.bo.MetaClassBO;
import edu.thss.platform.service.omf.ItemClassAccessService;
import edu.thss.platform.service.omf.ObjectAccessService;
import edu.thss.platform.service.org.bo.Environment;
import edu.thss.platform.service.wfprocess.blo.runtime.wfprocessinstance.ProcessInstanceBlo;
import edu.thss.platform.service.wfprocess.core.TreeNode;
import edu.thss.platform.service.wfprocess.core.buildtime.release.wfprocess.ReleasedWfProcess;
import edu.thss.platform.service.wfprocess.core.buildtime.wfprocess.ParticipationType;
import edu.thss.platform.service.wfprocess.core.buildtime.wfprocess.WfProcess;
import edu.thss.platform.service.wfprocess.core.buildtime.wfprocess.WfProcessStatus;
import edu.thss.platform.service.wfprocess.core.buildtime.wfprocess.task.AbstractTask;
import edu.thss.platform.service.wfprocess.core.buildtime.wfprocess.task.TaskStatus;
import edu.thss.platform.service.wfprocess.core.communication.ChatMessage;
import edu.thss.platform.service.wfprocess.core.communication.Comment;
import edu.thss.platform.service.wfprocess.core.data.expression.ExpressionParser;
import edu.thss.platform.service.wfprocess.core.data.variable.ArrayDataVariable;
import edu.thss.platform.service.wfprocess.core.data.variable.DataVariable;
import edu.thss.platform.service.wfprocess.core.runtime.admin.AdminSearchResult;
import edu.thss.platform.service.wfprocess.core.runtime.server.ServerInfoDescriptor;
import edu.thss.platform.service.wfprocess.core.runtime.util.json.WfProcessInstance2JSON;
import edu.thss.platform.service.wfprocess.core.runtime.util.json.WfProcessInstanceJSONParser;
import edu.thss.platform.service.wfprocess.core.runtime.wfprocess.WfProcessInstance;
import edu.thss.platform.service.wfprocess.core.runtime.wfprocess.task.EndPointInstance;
import edu.thss.platform.service.wfprocess.core.runtime.wfprocess.task.ManualTaskInstance;
import edu.thss.platform.service.wfprocess.core.runtime.wfprocess.task.StartPointInstance;
import edu.thss.platform.service.wfprocess.core.runtime.workitem.WorkitemInfoDescriptor;
import edu.thss.platform.service.wfprocess.core.util.DateUtility;
import edu.thss.platform.service.wfprocess.runtime.cache.LogCache;
import edu.thss.platform.service.wfprocess.runtime.engine.IDEngine;
import edu.thss.platform.service.wfprocess.runtime.engine.LogEngine;
import edu.thss.platform.service.wfprocess.runtime.engine.PEngine;
import edu.thss.platform.service.wfprocess.runtime.engine.util.ProcessInstanceInitializer;
import edu.thss.platform.service.wfprocess.runtime.engine.util.ProcessInstanceLoader;
import edu.thss.platform.service.wfprocess.runtime.engine.util.ProcessInstanceSaver;
import edu.thss.platform.service.modeler.MetaModelService;
import edu.thss.platform.service.wfprocess.runtime.server.concurrent.ProcessEngineThreadPool;
import edu.thss.platform.service.wfprocess.runtime.server.concurrent.TransactionEnginThreadPool;
import edu.thss.platform.service.wfprocess.eso.runtime.wfprocessinstance.ProcessInstanceEso;
import edu.thss.platform.utils.EnvironmentBuilder;
import org.json.JSONArray;
import org.json.JSONObject;


import java.lang.reflect.Field;
import java.util.*;
import java.util.concurrent.Callable;
import java.util.concurrent.SynchronousQueue;
import java.util.concurrent.ThreadPoolExecutor;
import java.util.concurrent.TimeUnit;

import edu.thss.platform.service.org.OrgService;
import edu.thss.platform.utils.BeanHelper;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;

//import com.cloud.core.session.redis.JedisUtil;


/**
 * @author Dahai Cao created on 2018-01-31
 *
 */
public class SaaSServer implements java.io.Serializable {

    /**
     * serialVersionUID
     */
    private static final long serialVersionUID = -7955271160150513927L;
    private final static SaaSServer instance = new SaaSServer();
    private IDEngine idEngine = null;
    private LogEngine logEngine =null;
    private ThreadPoolExecutor pEnginPool = null;
    private ThreadPoolExecutor tEnginPool = null;
    private final LogCache logCache = new LogCache();
    public final Map<String, Callable<WfProcessInstance>> activePThreads =
            Collections.synchronizedMap(new HashMap<>());
    // This status of this BPM server. 0: off; 1: on; 2: paused
    private int status = 0;
    // This status represents whether BPM server can accept new request.
    private int acceptable = 0;

    private OrgService orgService;
    private WfOperationService operationService;
    private ObjectAccessService objectAccessService;
    private EnvironmentBuilder environmentBuilder;
    private ItemClassAccessService itemClassAccessService;
    private MetaModelService metaModelService;
    /**
     *
     */
    public SaaSServer() {
//
        this.orgService = (OrgService) BeanHelper.getBean("orgService");
        this.operationService = (WfOperationService) BeanHelper.getBean("wfOperationService");
        this.objectAccessService = (ObjectAccessService) BeanHelper.getBean("objectAccessService");
        this.environmentBuilder = (EnvironmentBuilder) BeanHelper.getBean("environmentBuilder");
        this.itemClassAccessService = (ItemClassAccessService) BeanHelper.getBean("itemClassAccessService");
        this.metaModelService = (MetaModelService) BeanHelper.getBean("metaModelService");
        try {
            this.powerOn();
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    public static SaaSServer getInstance() {
        return instance;
    }

    public ServerInfoDescriptor getServerInfo() throws Exception {
        return new ServerInfoDescriptor();
    }

    /**
     * Power off this server. That means this server will stop accept all
     * services on this server and then
     */
    public void powerOff() throws Exception {
        setStatus(0);
        // core services
        // complete all process instances...

        // if all done, do the following...
        if (tEnginPool != null) {
            tEnginPool.shutdown();
        }
        for (Map.Entry<String, Callable<WfProcessInstance>> callableEntry : activePThreads.entrySet()) {
            PEngine engine = (PEngine) callableEntry.getValue();
            if (engine.getStop() == 0) {//将过程中的stop设置为停止，跳出线程
                engine.setStop(1);
                //对redis中的数据进行更新
                String id = engine.getId();
                //JedisUtil.getInstance().del("TPROCESS_" + id);
                String processInstance = WfProcessInstance2JSON.toJSON(engine.getInstance());
                ProcessInstanceEso.getInstance().saveInst(id, processInstance);
                //JedisUtil.getInstance().set("TPROCESS_" + id, processInstance);
            }
        }
        if (pEnginPool != null) {
            pEnginPool.shutdown();
        }
        pEnginPool = null;
        tEnginPool = null;
        // additive services
        idEngine.setCommand(0);// stop ID engine.
        logEngine.setCommand(0);// stop ID engine.
        idEngine = null;
        logEngine = null;
        System.out.println("BPM services stopped.");
    }

    public void restart() throws Exception {
        powerOff();
        powerOn();
    }

    public void pause() throws Exception {
        System.out.println("BPM services paused.");
    }

    public void powerOn() throws Exception {
        Boolean flag = false;
        // additive services
        if (logEngine == null) {
            logEngine = new LogEngine();
            logEngine.setCommand(1);
            new Thread(logEngine).start();
        }
        if (idEngine == null) {
            idEngine = new IDEngine();
            idEngine.setCommand(1);
            new Thread(idEngine).start();
        }
        // core services
        if (pEnginPool == null) {
            pEnginPool = new ProcessEngineThreadPool(0, Integer.MAX_VALUE, 60L, TimeUnit.SECONDS,
                    new SynchronousQueue<Runnable>());
            flag = true;
        }
        if (tEnginPool == null) {
            tEnginPool = new TransactionEnginThreadPool(0, Integer.MAX_VALUE, 60L, TimeUnit.SECONDS,
                    new SynchronousQueue<Runnable>());
        }
        if (flag) {
            // 从数据库中取流程实例
            List<String> instList = ProcessInstanceEso.getInstance().getInsts();
            if (instList.size() > 0) {
                for (int i = 0;i < instList.size();i++) {
                    String value = instList.get(i);
                    WfProcessInstance inst = WfProcessInstanceJSONParser.parseWfProcessInstance(value);
                    ExpressionParser.parseExpressions(inst);
                    PEngine engine = new PEngine(inst, true);
                    activePThreads.put(engine.getId(), engine);
                    pEnginPool.submit(engine);
                    ProcessInstanceEso.getInstance().removeInst(inst.getId());
                }
            }
        }

        System.out.println("BPM services started.");
    }

    // APIs
    public AdminSearchResult[] search(String oid, String cond1,
                                      String cond2, String cond3,
                                      String cond4) throws Exception {
        if (pEnginPool != null) {
            return getAllInstances(oid, cond1, cond2, cond3, cond4);
        }
        return null;
    }

    public boolean hasUserByOid(String userId){
        User userById = orgService.getUserByOid(userId);
        return userById != null;
    }

    public boolean hasClassByName(String name) {
        try { return metaModelService.getClassByName(name, true) != null; }
        catch (Exception e) { return false; }
    }

    public List<AdminSearchResult> searchAllInstance(String releasedWfProcessId)throws Exception{
        if (pEnginPool != null) {
            List<AdminSearchResult> list = new ArrayList<AdminSearchResult>();
            synchronized (activePThreads) {
                for (String id : activePThreads.keySet()) {
                    PEngine engine = (PEngine) activePThreads.get(id);
                    if (engine != null) {
                        WfProcessInstance inst = engine.getInstance();
                        if (inst.getWfProcessId().equals(releasedWfProcessId)) {
                                list.add(createAdminSearchResult(inst));
                        }
                    }
                }
            }
            return list;
        }
        return new ArrayList<>();
    }
    public boolean deleteAllInstanceHists() throws Exception{
        if(this.removeAllInstance()){
            ProcessInstanceEso.getInstance().deleteAllHists();
        }
        return true;
    }

    public boolean removeAllInstance() {
        try{
            List<String> ids = ProcessInstanceEso.getInstance().getAllInstsId();
            for(String s: ids){
                this.removeInstance(s);
            }
            return true;
        }catch (Exception e){
            e.printStackTrace();
        }
        return false;

    }
    public List<AdminSearchResult> searchAllInstanceByInvitation(String userId)throws Exception{
        List<AdminSearchResult> list = new ArrayList<AdminSearchResult>();
        if (pEnginPool != null) {
            synchronized (activePThreads) {
                for (String id : activePThreads.keySet()) {
                    PEngine engine = (PEngine) activePThreads.get(id);
                    if (engine != null) {
                        WfProcessInstance inst = engine.getInstance();
                        if(isManagement(userId)|| isInvitation(userId, inst)){
                            list.add(createAdminSearchResult(inst));
                        }
                    }
                }
            }
        }
        return list;
    }


    public List<AdminSearchResult> handleCondition(List<AdminSearchResult> list,String conditions){
        if(conditions!=null && conditions.length()>0){
            String[] strArr = conditions.split(",");
            for (int i = 0; i < strArr.length; i++){
                if(strArr[i].startsWith("order by")){
                    String condition = strArr[i];
                    Collections.sort(list, new Comparator<AdminSearchResult>() {
                        public int compare(AdminSearchResult arg0, AdminSearchResult arg1) {
                            String orderArg;
                            if(condition.endsWith("desc"))
                                orderArg = condition.substring(8,condition.length()-4).trim();
                            else if(condition.endsWith("asc"))
                                orderArg = condition.substring(8,condition.length()-3).trim();
                            else orderArg = condition.substring(8).trim();
                            String s0 = getValueByPropName(arg0, orderArg);
                            String s1 = getValueByPropName(arg1, orderArg);
                            if ( s0.compareTo(s1) > 0) {
                                return condition.endsWith("desc")?-1:1;
                            } else if (s0.compareTo(s1) == 0) {
                                return 0;
                            } else {
                                return condition.endsWith("desc")?1:-1;
                            }
                        }
                    });

                }else if(strArr[i].startsWith("search")){
                    String condition = strArr[i].substring(6).trim();
                    List<AdminSearchResult> searchList = new ArrayList<AdminSearchResult>();
//                    System.out.println("search:"+condition);
                    for(int j = 0; j < list.size(); j++){
//                        System.out.println(list.get(j).getProcessName());
                        if(list.get(j).getProcessName().contains(condition)
                                || list.get(j).getProcessVersion().contains(condition)
                                || list.get(j).getLauncher().contains(condition)
                                || list.get(j).getBindEnClassName().contains(condition)){
//                            list.remove(j);
                            searchList.add(list.get(j));
                        }
                    }
                    list = searchList;
//                    System.out.println("----reach list:"+list.size());
                }
            }
        }
        return list;
    }

    public WfProcessInstance getCompletedInstance(String pid) throws Exception{
        String processInstance = ProcessInstanceEso.getInstance().loadHist(pid);
        if(processInstance!=null) {
            WfProcessInstance inst = WfProcessInstanceJSONParser.parseWfProcessInstance(processInstance);
            return inst;
        }else{
            return null;
        }

    }

    public List<AdminSearchResult> getAllCompletedInstance(String uid) throws Exception{
        // 根据模版所有人
//        ReleasedWfProcessBlo releasedWfProcessBlo = new ReleasedWfProcessBlo();
//        ReleasedWfProcess[] processes = releasedWfProcessBlo.getAllProcessesOfProprietor(uid);
//        List<String> releasedWfProcessIds = new ArrayList<String>();
//        for(int i=0;i<processes.length;i++){
//            releasedWfProcessIds.add(processes[i].getId());
//        }
//        List<AdminSearchResult> list = new ArrayList<AdminSearchResult>();
//        List<String> instances =  ProcessInstanceEso.getInstance().getHists();
//
//        for(int i=0;i<instances.size();i++){
//            WfProcessInstance inst = WfProcessInstanceJSONParser.parseWfProcessInstance(instances.get(i));
//            if(releasedWfProcessIds.contains(inst.getWfProcessId())){
//                list.add(createAdminSearchResult(inst));
//            }
//        }
        // 根据参与人员
        List<AdminSearchResult> list = new ArrayList<AdminSearchResult>();
        List<String> instances =  ProcessInstanceEso.getInstance().getHists();
        for(int i=0;i<instances.size();i++){
            WfProcessInstance inst = WfProcessInstanceJSONParser.parseWfProcessInstance(instances.get(i));
//            System.out.println("inst.getId()"+inst.getId());
            if(isInvitation(uid, inst) || isCopier(uid, inst) || isManagement(uid)){
//                System.out.println("isCopier(uid, inst)"+isCopier(uid, inst));
                list.add(createAdminSearchResult(inst));
            }
        }
        return list;
    }


    public List<AdminSearchResult> getProcessInstanceList(String uid, String statusType) throws  Exception{

        List<AdminSearchResult> list = new ArrayList<>();
        if(statusType==null || statusType.equals("running")){
            // 根据所有人来找实例
            list.addAll(searchAllInstanceByInvitation(uid));
        }else if(statusType.equals("completed")){
            list.addAll(getAllCompletedInstance(uid));
        }else if(statusType.equals("all")){
            list.addAll(searchAllInstanceByInvitation(uid));
            list.addAll(getAllCompletedInstance(uid));
        }
        return  list;
    }


    public List<AdminSearchResult> getProcessInstance(String uid, String statusType ,Integer pageIndex, Integer pageSize, String condition) throws Exception {
        List<AdminSearchResult> list = getProcessInstanceList(uid, statusType);
        // System.out.println("getProcessInstance list.size(): "+list.size());
        // 条件处理
        list = this.handleCondition(list,condition);
        if(list ==null || list.size()==0) return new ArrayList<AdminSearchResult>();
        // System.out.println("handleCondition list.size(): "+list.size());
        // 分页
        if (pageIndex == null) pageIndex = 0;
        if (pageSize == null || pageSize == 0) pageSize = list.size();
        List<AdminSearchResult> retObjs = new ArrayList<AdminSearchResult>();
        for (int i = pageIndex * pageSize; i < pageIndex * pageSize + pageSize && i < list.size(); ++i) retObjs.add(list.get(i));

        return retObjs;
    }
    public int proInstanceCount(String uid,String statusType ,String condition) throws Exception{
        List<AdminSearchResult> list = getProcessInstanceList(uid, statusType);
        // System.out.println("list:"+list.size());
        list = handleCondition(list, condition);
        // System.out.println("handleCondition list:"+list.size());
        return list.size();
    }
    public List<WorkitemInfoDescriptor> handleConditionForTask(List<WorkitemInfoDescriptor> list,String conditions){
        if(conditions!=null && conditions.length()>0){
            String[] strArr = conditions.split(",");
            for (int i = 0; i < strArr.length; i++){
                if(strArr[i].startsWith("order by")){
                    String condition = strArr[i];
                    Collections.sort(list, new Comparator<WorkitemInfoDescriptor>() {
                        public int compare(WorkitemInfoDescriptor arg0, WorkitemInfoDescriptor arg1) {
                            String orderArg;
                            if (condition.endsWith("desc")) orderArg = condition.substring(8, condition.length() - 4).trim();
                            else if (condition.endsWith("asc")) orderArg = condition.substring(8, condition.length() - 3).trim();
                            else orderArg = condition.substring(8).trim();
                            String s0 = getValueByPropName(arg0, orderArg);
                            String s1 = getValueByPropName(arg1, orderArg);
                                if (s0.compareTo(s1) > 0) {
                                    return condition.endsWith("desc") ? -1 : 1;
                                } else if (s0.compareTo(s1) == 0) {
                                    return 0;
                                } else {
                                    return condition.endsWith("desc") ? 1 : -1;
                                }
                        }
                    });
                }else if(strArr[i].startsWith("search")){
                    String condition = strArr[i].substring(6).trim();
                    List<WorkitemInfoDescriptor> searchList = new ArrayList<>();
                    for(int j = 0; j < list.size(); j++){
                        if(list.get(j).getName().contains(condition)
                                || list.get(j).getWfProcessInstanceName().contains(condition)
                                || list.get(j).getBindEnClassName().contains(condition)
                                || list.get(j).getLaunchUserName().contains(condition)){
                            searchList.add(list.get(j));
                        }
                    }
                    list = searchList;
//                    System.out.println("----reach list:"+list.size());
                }
            }
        }
        return list;
    }

    public List<WorkitemInfoDescriptor> getManualTaskInstance(String uid, String filerStatus, Integer pageIndex, Integer pageSize, String condition) throws  Exception{

        List<Integer> status = JSON.parseArray(filerStatus,Integer.class);
        List<WorkitemInfoDescriptor> list = getManualTaskInstanceList(uid, status);
        // 条件处理
        System.out.println("condition:"+condition);
        list = handleConditionForTask(list,condition);
        // 分页
        if (pageIndex == null) pageIndex = 0;
        if (pageSize == null || pageSize == 0) pageSize = list.size();
        List<WorkitemInfoDescriptor> retObjs = new ArrayList<WorkitemInfoDescriptor>();
        for (int i = pageIndex * pageSize; i < pageIndex * pageSize + pageSize && i < list.size(); ++i) retObjs.add(list.get(i));
        return retObjs;
    }
    public int manualTaskInstanceCount(String userId,String filerStatus ,String condition) throws Exception{

        List<Integer> status = JSON.parseArray(filerStatus,Integer.class);
        List<WorkitemInfoDescriptor> list = getManualTaskInstanceList(userId, status);
        list = handleConditionForTask(list, condition);
        return list.size();
    }
    public String getValueByPropName(AdminSearchResult res, String propName) {
        String value = null;
        try {
            // 通过属性获取对象的属性
            Field field = res.getClass().getDeclaredField(propName);
            // 对象的属性的访问权限设置为可访问
            field.setAccessible(true);
            // 获取属性的对应的值
            value = field.get(res).toString();
        } catch (Exception e) {
            return null;
        }

        return value;
    }
    public String getValueByPropName(WorkitemInfoDescriptor res, String propName) {
        String value = null;
        try {
            // 通过属性获取对象的属性
            Field field = res.getClass().getDeclaredField(propName);
            // 对象的属性的访问权限设置为可访问
            field.setAccessible(true);
            // 获取属性的对应的值
            value = field.get(res).toString();
        } catch (Exception e) {
            return null;
        }

        return value;
    }


    // search app APIs
    public AdminSearchResult[] searchApp(String pid, String cond1,
                                         String cond2, String cond3, String cond4) throws Exception {
        if (pEnginPool != null) {
            List<AdminSearchResult> list = new ArrayList<AdminSearchResult>();
            synchronized (activePThreads) {
                for (String id : activePThreads.keySet()) {
                    PEngine engine = (PEngine) activePThreads.get(id);
                    if (engine != null) {
                        WfProcessInstance inst = engine.getInstance();
                        if (inst.getWfProcessId().equals(pid)) {
                            if (search(inst, cond1, cond2, cond3, cond4)) {
                                list.add(createAdminSearchResult(inst));
                            }
                        }
                    }
                }
            }
            return list.toArray(new AdminSearchResult[list.size()]);
        }
        return new AdminSearchResult[0];
    }

    // search all instances APIs
    public AdminSearchResult[] getAllInstances(String oid, String cond1,
                                               String cond2, String cond3, String cond4) throws Exception {
        if (pEnginPool != null) {
            List<AdminSearchResult> list = new ArrayList<AdminSearchResult>();
            synchronized (activePThreads) {
                for (String id : activePThreads.keySet()) {
                    PEngine engine = (PEngine) activePThreads.get(id);
                    if (engine != null) {
                        WfProcessInstance inst = engine.getInstance();
                        if (oid.equals(inst.getOwner())) {
                            if (search(inst, cond1, cond2, cond3, cond4)) {
                                list.add(createAdminSearchResult(inst));
                            }
                        }
                    }
                }
            }
            return list.toArray(new AdminSearchResult[list.size()]);
        } else
            return new AdminSearchResult[0];
    }

    public boolean search(WfProcessInstance inst, String cond1,
                           String cond2, String cond3, String cond4) throws Exception {
        if (cond1 == null) cond1 = "";
        if (cond2 == null) cond2 = "";
        if (cond3 == null) cond3 = "";
        if (cond4 == null) cond4 = "";
        // 条件1：输入文本框
        boolean f = false;
        if (!cond1.trim().equals("")) {
            if (cond1.indexOf(" ") > 0) {
                String[] conds = cond1.split(" ");
                for (int i = 0; i < conds.length; i++) {
                    if (inst.getName().contains(conds[i])
                            || inst.getLaunchUser().contains(conds[i])
                            || searchProcessVars(inst, conds[i])) {
                        f = true;
                        break;
                    }
                }
            } else {
                if (inst.getName().contains(cond1)
                        || inst.getLaunchUser().contains(cond1)
                        || searchProcessVars(inst, cond1)) {
                    f = true;
                }
            }
        } else {
            f = true;
        }
        // 条件2：过程状态
        boolean f1 = false;
        if (!cond2.equals("")) {
            if (cond2.equals("5")) {
                if (inst.getStatus() == 5) {
                    f1 = true;
                }
            } else if (cond2.equals("6")) {
                if (inst.getStatus() == 6) {
                    f1 = true;
                }
            } else {
                f1 = true;
            }
        } else{
            f1 = true;
        }
            
        // 条件3：起始时间
        boolean f2 = false;
        // 条件4：结束时间
        boolean f3 = false;
        if (cond3.equals("") && cond4.equals("")) {
            f2 = true;
            f3 = true;
        } else if (!cond3.equals("") && cond4.equals("")) {
            Date fromDate = DateUtility.parseDatetime(cond3);
            if (fromDate.getTime() <= inst.getLaunchTime()) {
                f2 = true;
                f3 = true;
            }
        } else if (cond3.equals("") && !cond4.equals("")) {
            Date toDate = DateUtility.parseDatetime(cond4);
            if (toDate.getTime() >= inst.getLaunchTime()) {
                f2 = true;
                f3 = true;
            }
        } else if (!cond3.equals("") && !cond4.equals("")) {
            Date fromDate = DateUtility.parseDatetime(cond3);
            Date toDate = DateUtility.parseDatetime(cond4);
            if (fromDate.getTime() <= inst.getLaunchTime()
                    && toDate.getTime() >= inst.getLaunchTime()) {
                f2 = true;
                f3 = true;
            }
        }
        if (f && f1 && f2 && f3)
            return true;
        return false;
    }

    public boolean searchProcessVars(WfProcessInstance inst, String cond) {
        TreeNode[] children = inst.getChildren();
        for (int i = 0; i < children.length; i++) {
            if (children[i] instanceof ArrayDataVariable) {

            } else if (children[i] instanceof DataVariable) {
                if (((DataVariable) children[i]).getDatatype().equals("String")) {
                    if (((DataVariable) children[i]).getValue() != null &&
                            ((DataVariable) children[i]).getValue().toString().contains(cond)) {
                        return true;
                    }
                }
            }
        }
        return false;
    }

    public AdminSearchResult createAdminSearchResult(WfProcessInstance inst) {
        AdminSearchResult r = new AdminSearchResult();
        r.setInstanceId(inst.getId());
        r.setDefinitionId(inst.getWfProcessId());
        r.setProcessName(inst.getName());
        r.setProcessVersion(inst.getVersion());
        r.setStatus(inst.getStatus());
        r.setLauncher(inst.getLaunchUser());
        r.setStartTime(inst.getStartTime());
        if(inst.getSuspensionTime()!=-1 && inst.getSuspensionTime()!=0)
            r.setSuspensionTime(inst.getSuspensionTime());
        if(inst.getEndTime()!=-1 && inst.getEndTime()!=0)
            r.setSuspensionTime(inst.getEndTime());
        if(inst.getTerminationTime()!=-1 && inst.getTerminationTime()!=0)
            r.setSuspensionTime(inst.getTerminationTime());
        r.setUpdateTime(inst.getUpdateTime());
        r.setServer(inst.getServerIp());

        r.setEnClassInstanceId(inst.getEnClassInstanceId());
        r.setBindEnClassName(inst.getBindEnClassName());

        EndPointInstance endPointInstance = inst.getEndPointInstance();
        if(endPointInstance != null)  r.setEndFormName(endPointInstance.getEndFormName());
        return r;
    }

    public WfProcessInstance getInstanceByID(String id) throws Exception{
        synchronized (activePThreads) {
            if (activePThreads.containsKey(id)){
                return ((PEngine) activePThreads.get(id)).getInstance();
            }else{
                return getCompletedInstance(id);

            }
        }
    }
    /**
     * @return the status
     */
    public int getStatus() {
        return status;
    }

    /**
     * @param status
     *            the status to set
     */
    public void setStatus(int status) {
        this.status = status;
    }

    /**
     * @return the acceptable
     */
    public int getAcceptable() {
        return acceptable;
    }

    /**
     * @param acceptable
     *            the acceptable to set
     */
    public void setAcceptable(int acceptable) {
        this.acceptable = acceptable;
    }

    public String sendRequest(Object obj) {
        return null;
    }

    public Object fetchResponse() {
        return null;

    }

    public ThreadPoolExecutor getTransactionPool() {
        return tEnginPool;
    }

    public ThreadPoolExecutor getProcessPool() {
        return pEnginPool;
    }


    public Map<String, Object> toSavelist(String paramvalues) throws Exception{
        Map<String, Object> savelist = new HashMap<>();
        if (paramvalues != null && !paramvalues.trim().equals("")) {
            JSONObject obj = new JSONObject(paramvalues);
            Iterator iterator = obj.keys();
            String key = null;
            while (iterator.hasNext()) {
                key = (String) iterator.next();
                if (obj.get(key) != null)
                    if (obj.get(key) instanceof JSONArray) {
                        JSONArray vals = obj.getJSONArray(key);
                        if (vals.length() > 0) {
                            String [] arry = new String[vals.length()];
                            for (int i = 0; i < vals.length(); i++) {
                                arry[i] = vals.get(i).toString();
                            }
                            savelist.put(key, arry);
                        } else {
                            savelist.put(key, new String[0]);
                        }
                    } else if (obj.get(key) instanceof JSONObject) {
                        savelist.put(key, obj.get(key).toString());
                    } else {
                        savelist.put(key, obj.get(key).toString());
                    }
            }
        }
        return savelist;
    }
    public WorkitemInfoDescriptor launchProcessByObjId(String templateId, String userId,String userDisplayName,
                                                       String bindEnClassName, String paramValues, String enClassInstanceId, String copiers){
        try {
            String bindCurrentProcess = SaaSServer.getInstance().bindCurrentProcess(bindEnClassName, enClassInstanceId);
            if(bindCurrentProcess!="" && bindCurrentProcess!=null && bindCurrentProcess.length() == 32){
                //403,"该对象已绑定在流程实例"+bindCurrentProcess+"中");
                throw new Exception("该对象已绑定在流程实例"+bindCurrentProcess+"中");
            }
//            Map<String, Object> savelist = this.toSavelist(paramValues);

            WfProcessInstance inst = this.launch(templateId, userId, userDisplayName, bindEnClassName,paramValues,enClassInstanceId, copiers);
            if (inst != null && inst.getWorkflowType() != 0) {
                return ProcessInstanceBlo.getCurrWorkItemforSWf(inst, null, userId, "", userDisplayName);
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
        return null;
    }

    public WorkitemInfoDescriptor launchProcess(String templateId, String userId,String userDisplayName,
                                                String bindEnClassName, String paramValues, String enClassInstanceId, String copiers){
        try {
            // launch process instance.
//            Map<String, Object> savelist = this.toSavelist(paramValues);
            WfProcessInstance inst = this.launch(templateId, userId, userDisplayName, bindEnClassName,paramValues,enClassInstanceId, copiers);
            if (inst != null && inst.getWorkflowType() != 0) {
                return ProcessInstanceBlo.getCurrWorkItemforSWf(inst, null, userId, "", userDisplayName);
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
        return null;
    }
    public WorkitemInfoDescriptor restartProcessInstance(String userId, String userDisplayName,String pid) throws Exception{



        if (pEnginPool != null) {
            synchronized (activePThreads) {
                PEngine engine = (PEngine) activePThreads.get(pid);
                if (engine != null) {
                    WfProcessInstance processInstance = engine.getInstance();
                    WfProcessInstance inst = this.launch(processInstance.getWfProcessId(),
                            userId, userDisplayName,
                            processInstance.getBindEnClassName(),null,
                            processInstance.getEnClassInstanceId(), null);
//                    WorkitemInfoDescriptor descriptor = this.launchProcess(
//                            processInstance.getWfProcessId(),
//                            userId, userDisplayName,
//                            processInstance.getBindEnClassName(), null,
//                            processInstance.getEnClassInstanceId(), null);
                    if (inst != null && inst.getWorkflowType() != 0) {
                        WorkitemInfoDescriptor descriptor =  ProcessInstanceBlo.getCurrWorkItemforSWf(inst, null, userId, "", userDisplayName);
                        this.removeInstance(pid);
                        this.setCurrentProcess(inst);
                        return descriptor;
                    }

                }
            }
        }
        return null;
    }

        public String bindCurrentProcess(String bindEnClassName,String enClassInstanceId){
//                    System.out.println("test:launch 2 基于已有对象" + enClassInstanceId);
        Map<String, Object> objMap = objectAccessService.getByOid(environmentBuilder.buildEnvironment(), bindEnClassName, enClassInstanceId);
//        System.out.println("objMap"+objMap.toString());
//        System.out.println("obj.get(\"currentProcess\"):::"+objMap.get("currentProcess"));
            //"该对象已绑定在流程实例"+objMap.get("currentProcess")+"中"
        if(objMap.get("currentProcess") != null)
            return objMap.get("currentProcess").toString();
        else return null;
    }
    /**
     *
     * @param pid
     *            process instance object
     * @param userid
     *            the user object which launches this process instance
     * @param paramValues
     *            the parameters
     * @return String
     * @throws Exception
     */
    public WfProcessInstance launch(String pid, String userid, String username,
                                    String bindEnClassName,

                                    String paramValues,
                                    String enClassInstanceId,
                                    String copiers) throws Exception {
        //  Map<String, Object> paramvalues,
        Map<String, Object> savelist = this.toSavelist(paramValues);
        // put into thread pool for running ...
        WfProcessInstance instance = null;
        if (pEnginPool != null) {
            // verifying ...
            Map<String, Object> objMap = new HashMap<>();
//            System.out.println("pid::"+pid);
//            System.out.println("bindEnClassName::"+bindEnClassName);
//            System.out.println("enClassInstanceId::"+enClassInstanceId);
            if (pid.length() == 16) { // process definition ID
                long s = System.currentTimeMillis();

                if(enClassInstanceId==null || enClassInstanceId.equals("")){
//                    System.out.println("test:launch 1 基于模版发起流程，新生成实体类对象");
                    instance = ProcessInstanceLoader.getInstance().createNewInstance(pid);
                } else {
//                    System.out.println("test:launch 2 基于已有的实体类对象");
                    instance = ProcessInstanceLoader.getInstance().createNewInstance(pid, enClassInstanceId);
                }

                // 设置绑定对象的currentProcess
                objMap = objectAccessService.getByOid(environmentBuilder.buildEnvironment(), bindEnClassName, instance.getEnClassInstanceId());

                for (Map.Entry<String, Object> entry : objMap.entrySet()) {
                    if(entry.getValue()!=null)
                        savelist.put(entry.getKey(),entry.getValue().toString());
                }
                savelist.put("currentProcess",instance.getId());

                System.out.println("Create instance>>>>>>>>>>>>>>>:" + (System.currentTimeMillis() - s) + "ms");
                // initializing （将初始化数据写入流程变量）
                ProcessInstanceInitializer.getInstance().initialize(instance, userid, username,"","", "", savelist);

            } else if (pid.length() == 32) { // process instance ID
                instance = ProcessInstanceLoader.getInstance().loadCompletedInstance(pid);
                // initializing （将初始化数据写入流程变量）
                ProcessInstanceInitializer.getInstance().reinitialize(instance, "", "","", savelist);
            }

            if(copiers!=null){
                JSONArray jsonArray = new JSONArray(copiers);
                String[] copierList = new String[jsonArray.length()];
                for(int i = 0 ; i < jsonArray.length(); i++){
                    copierList[i] = jsonArray.get(i).toString();
                }
                instance.setCopiers(copierList);
            }
            // 发起时修改业务对象的currentProcess属性
//            Map<String, Object> objs = new HashMap<>();
//            objs.put("oid",instance.getEnClassInstanceId());
////            System.out.println("instance.getEnClassInstanceId():::" + instance.getEnClassInstanceId());
//            objs.put("currentProcess",instance.getId());
//            this.itemClassAccessService.updateEntityObjs(instance.getBindEnClassName(), new ArrayList<>(Arrays.asList(objs)), null);
            this.setCurrentProcess(instance);

            PEngine engine = new PEngine(instance, false);
            System.out.println("test: create " + instance.getId() + " " + instance.getEnClassInstanceId());
            activePThreads.put(engine.getId(), engine);
            pEnginPool.submit(engine);


            // 起始脚本
            this.executeStartOperation(engine, objMap);
//            instance
            return instance;
        }
        return null;
    }

    public void setCurrentProcess(WfProcessInstance instance){
        // 发起时修改业务对象的currentProcess属性
        Map<String, Object> objs = new HashMap<>();
        objs.put("oid",instance.getEnClassInstanceId());
        objs.put("currentProcess",instance.getId());
        this.itemClassAccessService.updateEntityObjs(instance.getBindEnClassName(), new ArrayList<>(Arrays.asList(objs)), null);
    }


    //删除该流程模版下的所有流程实例
    public void removeAllInstances(String pid) throws Exception {
        if (pEnginPool != null) {
            // 获取该流程模版下的所有流程实例的id
            List<String> idlist = new ArrayList<>();
            synchronized (activePThreads) {
                for (String id : activePThreads.keySet()) {
                    PEngine engine = (PEngine) activePThreads.get(id);
                    if (engine != null) {
                        WfProcessInstance inst = engine.getInstance();
                        if (inst.getWfProcessId().equals(pid)) {
                            idlist.add(inst.getId());
                        }
                    }
                }
            }
            for(String id : idlist){
                removeInstance(id);
            }
        }

    }
    // 删除流程实例 pid:流程实例id
    public void removeInstance(String pid) throws Exception {
        if (pEnginPool != null) {
            PEngine engine = (PEngine) activePThreads.get(pid);
            // 保存到历史
            if(engine!=null){
                engine.setStop(1);
                engine.terminateProcessInstance();
                ProcessInstanceEso.getInstance().removeInst(pid);
                activePThreads.remove(pid);
            }else{
                throw new PlatformException("流程实例" + pid + "不存在");
            }

        }
    }

    public boolean hasPermission(String userId, JSONArray list) throws Exception{
        JSONArray pars = new JSONArray(list.toString());
        if (pars.length() > 0) {
            List<Group> res = orgService.getRecursiveParents(userId);
            // 通过用户找到其所在的所有组 找到所有的流程
            List<String> groups = new ArrayList<>();
            for (int i = 0; i < res.size(); i++) {
                // System.out.println(res.get(i).getName());
                groups.add(res.get(i).getOid());
            }
            for (int i = 0; i < pars.length(); i++) {
                JSONObject par = pars.getJSONObject(i);
                if (par.has("oid") &&
                        (par.get("oid").equals(userId) || groups.contains(par.get("oid")))) {
                    return true;
                }
            }
        }
        return false;
    }


    public boolean isInvitation(String userId, WfProcessInstance wfProcessInstance) throws Exception{
        JSONArray array = new JSONArray();
        for (int i = 0; i < wfProcessInstance.getInvitations().length; i++) {
            array.put(new JSONObject(wfProcessInstance.getInvitations()[i]));
        }
        return hasPermission(userId, array);
        //        try{
//            for (int i = 0; i < wfProcessInstance.getInvitations().length; i++) {
//                JSONObject invi = new JSONObject(wfProcessInstance.getInvitations()[i]);
//                if (invi.get("oid").equals(userId)) {
//                    return true;
//                }
//            }
//        }catch (Exception e){
//        }
//        return false;
    }

    public boolean isCopier(String userId, WfProcessInstance wfProcessInstance) throws Exception{
        JSONArray array = new JSONArray();
        for (int i = 0; i < wfProcessInstance.getCopiers().length; i++) {
            array.put(new JSONObject(wfProcessInstance.getCopiers()[i]));
        }
        return hasPermission(userId, array);
//        try {
//            System.out.println("isCopier---" + wfProcessInstance.getCopiers().length);
//            for (int i = 0; i < wfProcessInstance.getCopiers().length; i++) {
//                JSONObject invi = new JSONObject(wfProcessInstance.getCopiers()[i]);
//                if (invi.get("oid").equals(userId)) {
//                    return true;
//                }
//            }
//        }catch (Exception e){
//        }
//        return false;
    }

    // 具有领取权限(Participant 是任务办理人
    public boolean isParticipantOfManualTask(String userId, ManualTaskInstance ti, WfProcessInstance wfProcessInstance) throws Exception{
        if (ti.getParticipants().size() > 0) {
            JSONArray pars = new JSONArray(ti.getParticipants().toString());
            if(hasPermission(userId, pars)){
                return true;
            }
            for (int i = 0; i < pars.length(); i++) {
                JSONObject par = pars.getJSONObject(i);
                if (par.get("participantType").equals("launcher")
                        && wfProcessInstance.getLaunchUserId().equals(userId)) {
                    return true;
                }
            }
        }
        return false;

//        JSONArray pars = new JSONArray(ti.getParticipants().toString());
//        if (pars.length() > 0) {
//            List<Group> res = orgService.getUserGroups(userId);
//            // 通过用户找到其所在的所有组 找到所有的流程
//            List<String> groups = new ArrayList<>();
//            for (int i = 0; i < res.size(); i++) {
//                groups.add(res.get(i).getOid());
//            }
//            for (int i = 0; i < pars.length(); i++) {
//                JSONObject par = pars.getJSONObject(i);
//                if (par.has("oid") && (par.get("oid").equals(userId)
//                        || groups.contains(par.get("oid")))) {
//                    return true;
//                } else if (par.get("participantType").equals("launcher")
//                        && wfProcessInstance.getLaunchUserId().equals(userId)) {
//                    return true;
//                }
//            }
//        }
//        return false;
    }


//    List<Integer> 1.待领取 2.待提交 3.我参与的
    public List<WorkitemInfoDescriptor> fetchManualTaskInstancesForEngine(PEngine engine,List<Integer> status, String userId) throws Exception {
        List<WorkitemInfoDescriptor> list = new ArrayList<WorkitemInfoDescriptor>();
        boolean isInvatation = isInvitation(userId, engine.getInstance());
        synchronized (engine.getTaskQueues()) {
            // 已激活的（待领取）的手工任务
            if(status.contains(1) || status.contains(3)){
                if (!engine.getTaskQueues().isEnabledManualTaskQueueEmpty()) {
                    System.out.println(">>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>PPPPP");
                    for (AbstractTask child : engine.getTaskQueues().fetchEnabledManualTaskinstances()) {
                        ManualTaskInstance ti = (ManualTaskInstance) child;
                        if (status.contains(1) && isParticipantOfManualTask(userId,ti,engine.getInstance())){
                            // 1.待领取：有办理人资格
                            list.add(getWorkitemInfoDescriptor(ti, engine.getInstance(), String.valueOf(ti.getPriority()),1));
                        }else if(status.contains(3) && isInvatation) {
                            // 3.我参与的：是参与人员
                            list.add(getWorkitemInfoDescriptor(ti, engine.getInstance(), String.valueOf(ti.getPriority()),3));
                        }
                    }
                }
            }
            // 正在运行中的（待提交）的手工任务
            if(status.contains(2) || status.contains(3))
            if (!engine.getTaskQueues().isRunningManualTaskQueueEmpty()) {
                System.out.println(">>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>QQQQQ");
                for (AbstractTask child : engine.getTaskQueues().fetchRunningManualTaskinstances()) {
                    ManualTaskInstance ti = (ManualTaskInstance) child;
                    if (ti.getStatus() == TaskStatus.RUNNING) {
                        if(ti.getSubmitterId() != null){
                            if (status.contains(2) && ti.getSubmitterId().equals(userId)){
                                // 2.待提交：是提交者
                                list.add(getWorkitemInfoDescriptor(ti, engine.getInstance(), String.valueOf(ti.getPriority()),2));
                            } else if(status.contains(3) && isInvatation && !ti.getSubmitterId().equals(userId)) {
                                // 3.我参与的：是参与者且不是提交者
                                list.add(getWorkitemInfoDescriptor(ti, engine.getInstance(), String.valueOf(ti.getPriority()),3));
                            }
                        }
                    }

                }
            }
        }
        return list;
    }


    public boolean isManagement(String userId){
        if(userId.equals("9C92E891E9AE534DB685737DE467A9D0")){
            return true;
        }else{
            return false;
        }
    }



    public List<WorkitemInfoDescriptor> getManualTaskInstanceList(String userId, List<Integer> status) throws Exception{
        System.out.println("status:");List<WorkitemInfoDescriptor> list = new ArrayList<WorkitemInfoDescriptor>(); System.out.println();

//        for(int i=0;i<status.size();i++) System.out.println("status[i]:"+status.get(i));
        synchronized (activePThreads) {
            for (String id : activePThreads.keySet()) {
                PEngine engine = (PEngine) activePThreads.get(id);
                list.addAll(fetchManualTaskInstancesForEngine(engine,status,userId));
            }
        }
       return list;
    }


    /**
     * 生成工作项对象。其中getit参数指的是，工作项列表中，不获取表单数据。
     * 而在打开工作项时候，则获取表单数据。不获取表达数据是为了提高性能，因为表单可能很大。
     *
     * @param ti
     *            ManualTaskInstance
     * @param inst
     *            WfProcessInstance
     *            String, 0: low priority(normal); 1: medium
     *            priority(important); 2: high priority(urgent);
     * @return
     */

    public WorkitemInfoDescriptor getWorkitemInfoDescriptor(ManualTaskInstance ti,
                                                             WfProcessInstance inst,
                                                             String priority,int status) {


        WorkitemInfoDescriptor w = new WorkitemInfoDescriptor();
        w.setId(ti.getId());
        w.setName(ti.getName());
        w.setPriority(priority);
        w.setTaskInstanceStatus(ti.getStatus());
        w.setFormName(ti.getFormName());

        w.setTaskInstanceEnabledDateTime(ti.getEnabledTime());
        w.setTaskInstanceStartDateTime(ti.getStartTime());
        w.setTaskInstanceDateTimeLimit(ti.getExpiryDateTime());
        w.setTaskInstanceAlarmDateTime(ti.getAlarmDateTime());

        w.setStatus(status);
        w.setSubmitterId(ti.getSubmitterId());
        w.setSubmitterName(ti.getSubmitter());
        w.setSubmitterIp(ti.getSubmitterIp());
        w.setDeadlineDays(ti.getDeadlineDays());

        w.setWfProcessId(inst.getWfProcessId());
        w.setWfProcessInstanceId(inst.getId());
        w.setWfProcessInstanceName(inst.getName());
        w.setLaunchDateTime(inst.getLaunchTime());
        w.setEnClassInstanceId(inst.getEnClassInstanceId());
        w.setBindEnClassName(inst.getBindEnClassName());

        w.setLaunchUserId(inst.getLaunchUserId());
        w.setLaunchUserName(inst.getLaunchUser());
        w.setLaunchUserIdType(1);

        w.setServerIp("");
        w.setWfProcessVerison(inst.getVersion());

        w.setWorkflowType(inst.getWorkflowType());
        w.setWfProcessType(inst.getProcessType());

        System.out.println("test: getDesc " + ti.getId() + " " + inst.getId() + " " + inst.getEnClassInstanceId());

        return w;
    }

    // 领取
    public WorkitemInfoDescriptor fetchManualTaskInstanceforMWf(String pInstId,
                                                                String taskInstId,
                                                                String userId,
                                                                String userIp,
                                                                String priority, String ufullname) throws Exception {
        synchronized (activePThreads) {
            PEngine engine = (PEngine) activePThreads.get(pInstId);
            WorkitemInfoDescriptor w = new WorkitemInfoDescriptor();
            if (engine != null) {
                ManualTaskInstance ti = engine.fetchManualTaskInstanceforMWf(taskInstId, userId, userIp, Integer.parseInt(priority), ufullname);
                if(this.isParticipantOfManualTask(userId, ti, engine.getInstance())){
                    // 解析表单（Form）并预装数据到表单。
                    if (ti != null) {
                        w.setId(ti.getId());
                        w.setName(ti.getName());
                        w.setPriority(priority);
                        w.setTaskInstanceStatus(ti.getStatus());
                        w.setFormName(ti.getFormName());

                        w.setTaskInstanceEnabledDateTime(ti.getEnabledTime());
                        w.setTaskInstanceStartDateTime(ti.getStartTime());
                        w.setTaskInstanceDateTimeLimit(ti.getExpiryDateTime());
                        w.setTaskInstanceAlarmDateTime(ti.getAlarmDateTime());

                    }
                }else{
                    return null;
                }
            }
            // System.out.println(">>>SaaSService fetchManualTaskInstanceforMWf w.getFormName()");
            // System.out.println(w.getFormName());
            return w;
        }
    }

    public WorkitemInfoDescriptor turnManualTaskInstanceforMwf(String pInstId,
                                                               String taskInstId,
                                                               String userId,
                                                               String userIp,
                                                               String ufullname,
                                                               String newuserid,
                                                               String comment) throws Exception {
        synchronized (activePThreads) {
            System.out.println("pInstId :"+pInstId);
            PEngine engine = (PEngine) activePThreads.get(pInstId);
            WorkitemInfoDescriptor w = new WorkitemInfoDescriptor();
            if (engine != null) {

                ManualTaskInstance ti = engine.turnManualTaskInstanceforMwf(taskInstId, userId, userIp, ufullname, newuserid, comment);
                // 解析表单（Form）并预装数据到表单。
                if (ti != null) {

                    w.setId(ti.getId());
                    w.setName(ti.getName());
                    w.setTaskInstanceStatus(ti.getStatus());
                    w.setFormName(ti.getFormName());

                    w.setTaskInstanceEnabledDateTime(ti.getEnabledTime());
                    w.setTaskInstanceStartDateTime(ti.getStartTime());
                    w.setTaskInstanceDateTimeLimit(ti.getExpiryDateTime());
                    w.setTaskInstanceAlarmDateTime(ti.getAlarmDateTime());


                    //w.setFormContent(FormDataLoader.parseJSONtoLoadData(ti.getFormContent(), engine.getInstance()));
//                    w.setFormContent(FormDataLoader.parseJSON2LoadData((JSONObject) ti.getFormContent(), engine.getInstance()));
                }
            }
            System.out.println(">>>SaaSService fetchManualTaskInstanceforMWf w.getFormName()");
            System.out.println(w.getFormName());
            return w;
        }
    }

    public List<WorkitemInfoDescriptor> getRunningManualTaskByObj(String uid,String bindEnClassName, String enClassInstanceId) throws Exception{
        List<WorkitemInfoDescriptor> descriptors = new ArrayList<>();
        Map<String, Object> objMap = objectAccessService.getByOid(environmentBuilder.buildEnvironment(), bindEnClassName, enClassInstanceId);
        String pid = objMap.get("currentProcess").toString();
        if(pid != null && pid != ""){
            synchronized (activePThreads) {
                PEngine engine = (PEngine) activePThreads.get(pid);
                if(engine != null){
                    List<Integer> status = JSON.parseArray("[1,2,3]",Integer.class);
                    descriptors = fetchManualTaskInstancesForEngine(engine, status, uid);
                }
            }
        }
        return descriptors;
    }
    public WorkitemInfoDescriptor fetchManualTaskInstanceforSWf(String pInstId, String tid,
                                                                String userId, String userIp,
                                                                String fullname) throws Exception {
        synchronized (activePThreads) {
            PEngine engine = (PEngine) activePThreads.get(pInstId);
            if (engine != null) {
                ManualTaskInstance ti = engine.fetchManualTaskInstanceforSWf(pInstId, tid, userId, userIp, fullname);
                WorkitemInfoDescriptor w = new WorkitemInfoDescriptor();
                // 解析表单（Form）并预装数据到表单。
                if (ti != null) {
                    w.setId(ti.getId());
                    w.setFormName(ti.getFormName());
                    //w.setFormContent(FormDataLoader.parseJSONtoLoadData(ti.getFormContent(), engine.getInstance()));
//                    w.setFormContent(FormDataLoader.parseJSON2LoadData((JSONObject) ti.getFormContent(), engine.getInstance()));
                }
                return w;
            }
            return null;
        }
    }

    public String saveManualTaskInstance(String pInstId, String taskInstId,
                                         String userId, Map<String, Object> list)
            throws Exception {
        synchronized (activePThreads) {
            PEngine engine = (PEngine) activePThreads.get(pInstId);
            if (engine != null) {
                return engine.saveAccessibleDataVariable(taskInstId, userId, list);
            }
            return "0";
        }
    }
    public String saveWfProcessInstance(String pInstId) throws Exception {
        synchronized (activePThreads) {
            PEngine engine = (PEngine) activePThreads.get(pInstId);
            if (engine != null) {
                return engine.saveWfProcessInstance();
            }
            return "0";
        }
    }

    public String returnManualTaskInstance(String pInstId, String taskInstId,
                                           String userId) throws Exception {
        synchronized (activePThreads) {
            PEngine engine = (PEngine) activePThreads.get(pInstId);
            if (engine != null) {
                return engine.returnManualTaskInstance(taskInstId, userId);
            }
            return "0";
        }
    }


    //0:保存;1:关闭;2:提交;3:退回;4:移交
    public String sendCommandWithSaving(String cmd, String pid, String tid,
                                        String userId, String fullname,
                                        String userIp, String newUserId,
                                        String list, String comment){
        String success = "0";
        try {
            System.out.println("test list:" + list);
            Map<String, Object> savelist = new HashMap<>();
            try {
                JSONObject obj = new JSONObject(list);
                String key = "";
                Iterator iterator = obj.keys();
                while (iterator.hasNext()) {
                    key = (String) iterator.next();
                    savelist.put(key, obj.get(key));
                }
            } catch (Exception e) { }
            // 首先是保存，保存完毕再做其他动作。
            System.out.println("test:" + savelist.toString());

            if (!cmd.equals("1")) {
                success = this.saveManualTaskInstance(pid, tid, userId, savelist);
            }

            // cmd可以是 0:保存;1:关闭;2:提交;3:退回;4:委托
            if (cmd.equals("0")) {// 保存
            } else if (cmd.equals("1")) {// 关闭
                this.removeInstance(pid);

            } else if (cmd.equals("2")) {// 提交

                success = this.submitManualTaskInstance(pid, tid, userId, userIp, fullname,comment);
                WfProcessInstance inst = this.getInstanceByID(pid);

                if (inst != null && inst.getWorkflowType() == ParticipationType.SINGLE_PARTICIPANT_APP) { //
                    WorkitemInfoDescriptor r = ProcessInstanceBlo.getCurrWorkItemforSWf(inst, tid, userId, userIp, fullname);
                    if(r!=null) success="1";
                }
            } else if (cmd.equals("3")) {// 退回
                success = this.returnManualTaskInstance(pid, tid, userId);
            } else if (cmd.equals("4")) {// 委托给特定人newUserId
                WorkitemInfoDescriptor r = this.turnManualTaskInstanceforMwf(pid, tid, userId, userIp, fullname, newUserId, comment);
                if(r!=null) success="1";
            }
        } catch (Exception e) {
            e.printStackTrace();
            return "0";
        }
        return  success; // success

    }

    public Map<String,Object> getObjMap(WfProcessInstance processInstance){
        Map<String, Object> objMap = new HashMap<>();
        for (TreeNode child : processInstance.getChildren()) {
            if (child instanceof DataVariable) {
                objMap.put(child.getName(),((DataVariable)child).getValue().toString());
            }
        }
        return objMap;
    }
    public void executeStartOperation(PEngine engine, Map<String, Object> objMap) throws  Exception{
        WfProcessInstance processInstance = engine.getInstance();
        System.out.println("processInstance.getName():::"+processInstance.getName());
        if(processInstance!=null){
            StartPointInstance startPointInstance = processInstance.getStartPointInstance();
            if (startPointInstance != null) {
                String operationName = startPointInstance.getStartOperation();
                System.out.println("getStartOperation:::"+operationName);
                if(operationName !=null && operationName != ""){
//                    String className = processInstance.getBindEnClassName();
//                    String oid = processInstance.getEnClassInstanceId();
                    operationService.executeOperation(operationName, processInstance.getBindEnClassName(), objMap,
                            environmentBuilder.buildEnvironment(),engine, processInstance, startPointInstance);
                }
                engine.saveWfProcessInstance();
            }
        }
    }
    public void executeEndOperation(PEngine engine) throws  Exception{


        System.out.println("----executeEndOperation----");
        WfProcessInstance processInstance = engine.getInstance();
//        System.out.println("processInstance.getName():::"+processInstance.getName());
        if(processInstance!=null){
            Map<String, Object> objMap = this.getObjMap(processInstance);

            // 结束时修改业务对象的currentProcess属性
            if(objMap.get("currentProcess") != null &&
                    objMap.get("currentProcess").toString().equals(processInstance.getId())){
                // System.out.println("objMap.get(currentProcess)::--"+objMap.get("currentProcess"));
                Map<String, Object> objs = new HashMap<>();
                objs.put("oid",processInstance.getEnClassInstanceId());
                objs.put("currentProcess",null);
//                this.itemClassAccessService.updateEntityObjs(instance.getBindEnClassName(), new ArrayList<>(Arrays.asList(objs)), null);
                List<Map<String, Object>> l = this.itemClassAccessService.updateEntityObjs(processInstance.getBindEnClassName(), new ArrayList<>(Arrays.asList(objs)), null);
                Map<String, Object> map = l.get(0);
                // System.out.println("map:::"+map.toString());
            }

            EndPointInstance endPointInstance = processInstance.getEndPointInstance();
            if (endPointInstance != null) {
                String operationName = endPointInstance.getEndOperation();
                System.out.println("getEndOperation:::"+operationName);
                if(operationName !=null && operationName != ""){
                    operationService.executeOperation(operationName, processInstance.getBindEnClassName(),
                            objMap,null, engine, processInstance, endPointInstance);
                }

//                engine.saveWfProcessInstance();
            }
        }
    }

    public void executeBeforeOperation(PEngine engine,ManualTaskInstance taskInstance) throws  Exception{
        WfProcessInstance processInstance = engine.getInstance();
        System.out.println("processInstance.getName():::"+processInstance.getName());
        System.out.println("taskInstance.getName():::"+taskInstance.getName());
        String operationName = taskInstance.getBeforeOperation();
        System.out.println("beforeOperationName:::"+operationName);

        if(operationName !=null && operationName != ""){
            String className = processInstance.getBindEnClassName();
            String oid = processInstance.getEnClassInstanceId();

//            // 前处理脚本无environmentBuilder.buildEnvironment()
//            String userOid =  processInstance.getLaunchUserId();
//            String userName =  processInstance.getLaunchUser();

//            Environment environment = userOid == null ? null : new Environment(userOid, "", "", userName);
//            Map<String, Object> obj = objectAccessService.getByOid(environment, className, oid);
//            System.out.println("to operationService");

            operationService.executeOperation(operationName, className,
                    this.getObjMap(processInstance),null,engine, processInstance, taskInstance);
            System.out.println("taskInstance.getName:::"+ taskInstance.getName());
//            System.out.println("taskInstance.getGoAhead:::"+ taskInstance.getGoAhead());
        }
        engine.saveWfProcessInstance();
    }

    public void executeAfterOperation(PEngine engine,String tid) throws  Exception{
        WfProcessInstance processInstance = engine.getInstance();
//        System.out.println("processInstance.getName():::"+processInstance.getName());
//        System.out.println("tid:::"+tid);
        ManualTaskInstance taskInstance = engine.getManualTaskInstanceforMWf(tid);
        System.out.println("taskInstance.getName():::"+taskInstance.getName());
        String operationName = taskInstance.getAfterOperation();
        System.out.println("afterOperationName:::"+operationName);
        if(operationName !=null && operationName != ""){
            String className = processInstance.getBindEnClassName();
            System.out.println("className:::"+className);
            Object obj =  this.getObjMap(processInstance);
            System.out.println("obj:::"+obj.toString());
            operationService.executeOperation(operationName, className, obj,environmentBuilder.buildEnvironment(),engine, processInstance, taskInstance);
            System.out.println("taskInstance.getName:::"+ taskInstance.getName());
//            System.out.println("taskInstance.getGoAhead:::"+ taskInstance.getGoAhead());
        }
        engine.saveWfProcessInstance();
    }


    public String submitManualTaskInstance(String pInstId,
                                           String taskInstId,
                                           String userId,
                                           String userIp,
                                           String ufullname,
                                           String submitComment) throws Exception {
        synchronized (activePThreads) {
            PEngine engine = (PEngine) activePThreads.get(pInstId);

            if (engine != null) {

                this.executeAfterOperation(engine,taskInstId);
                return engine.submitManualTaskInstance(pInstId, taskInstId, userId, userIp, ufullname,submitComment);
            }
        }
        return "0";
    }

    public String addComment(String pid, String tid, Comment comment) throws Exception {
        PEngine engine = (PEngine) activePThreads.get(pid);
        if (engine != null) {
            ManualTaskInstance ti = engine.getManualTaskInstanceforMWf(tid);
            ti.addComment(comment);
            engine.saveWfProcessInstance();
            return "1";
        }
        return "0";
    }

    public com.alibaba.fastjson.JSONArray getWfComments(WfProcessInstance inst) throws Exception {
        com.alibaba.fastjson.JSONArray taskComments = new com.alibaba.fastjson.JSONArray();
        TreeNode[] nodes = inst.getChildren();
        System.out.println("nodes.length:"+nodes.length);
        for (int i = 0; i < nodes.length; i++){
            if (nodes[i] instanceof ManualTaskInstance) {
                ManualTaskInstance mti = (ManualTaskInstance) nodes[i];
                if(mti.getStatus() != AbstractTask.UNUSED ){
                    com.alibaba.fastjson.JSONObject comment = new com.alibaba.fastjson.JSONObject();
                    comment.put("taskName",mti.getName());
                    comment.put("taskStatus",mti.getStatus());
                    comment.put("taskSubmitter",mti.getSubmitter());
                    com.alibaba.fastjson.JSONArray comments = new com.alibaba.fastjson.JSONArray();
                    for (int j = 0; j < mti.getComments().length; j++) {
                        comments.add(mti.getComments()[j]);
                    }
                    comment.put("comments",comments);
                    taskComments.add(comment);
                }

            }
        }
        return taskComments;
    }


    public com.alibaba.fastjson.JSONObject getWfCommentArea(String pid, int status) throws Exception {
        WfProcessInstance wfProcessInstance;
        com.alibaba.fastjson.JSONObject commentArea = new com.alibaba.fastjson.JSONObject();
        PEngine pEngine = (PEngine)activePThreads.get(pid);
        if(pEngine != null) wfProcessInstance =  pEngine.getInstance();
        else wfProcessInstance =  getCompletedInstance(pid);

//        if(status == WfProcessStatus.RUNNING){
//            PEngine pEngine = (PEngine)activePThreads.get(pid);
//            wfProcessInstance =  pEngine.getInstance();
//        }else{
//            wfProcessInstance =  getCompletedInstance(pid);
//        }
        if(wfProcessInstance != null){
            commentArea.put("comments", getWfComments(wfProcessInstance));
            commentArea.put("invitations", wfProcessInstance.getInvitations());
            commentArea.put("copiers", wfProcessInstance.getCopiers());
        }
        return commentArea;

    }


    public List<Comment> getTaskComments(String pInstId,String tInstId) throws Exception {
        PEngine engine = (PEngine) activePThreads.get(pInstId);
        if (engine == null) return null;
        ManualTaskInstance ti = engine.getManualTaskInstanceforMWf(tInstId);
        if(ti == null) return null;
        List<Comment> resultLis= new ArrayList<>(Arrays.asList(ti.getComments()));
        return resultLis;

    }

    public com.alibaba.fastjson.JSONArray getWfComments(String pInstId) throws Exception {
        synchronized (activePThreads) {
            PEngine engine = (PEngine) activePThreads.get(pInstId);
            if(engine!=null){
                com.alibaba.fastjson.JSONArray taskComments = getWfComments(engine.getInstance());
                return taskComments;
            }

            return null;
        }
    }

    public Comment[] getAllComments(String pInstId) throws Exception {
        synchronized (activePThreads) {
            PEngine engine = (PEngine) activePThreads.get(pInstId);
            if (engine == null) return null;
            List<Comment> commentList = new ArrayList<Comment>();

            TreeNode[] nodes = engine.getInstance().getChildren();
            for (int i = 0; i < nodes.length; i++){
                if (nodes[i] instanceof ManualTaskInstance) {
                    Comment[] comments = ((ManualTaskInstance) nodes[i]).getComments();
                    for (int j = 0; j < comments.length; j++) {
                        commentList.add(comments[j]);
                    }
                }
            }
            System.out.println("commentList.size: "+commentList.size());
            return commentList.toArray(new Comment[commentList.size()]);
         }
    }


    public String addChatMessage(String pid, String tid, ChatMessage message) throws Exception {
        PEngine engine = (PEngine) activePThreads.get(pid);
        if (engine != null) {
            ManualTaskInstance ti = engine.getManualTaskInstanceforMWf(tid);
            ti.addChatMessage(message);
            engine.saveWfProcessInstance();
            return "1";
        }
        return "0";
    }

    public String removeInvitation(String pid, String copyto) throws Exception {
        PEngine engine = (PEngine) activePThreads.get(pid);
        if (engine != null) {
            WfProcessInstance wf = engine.getInstance();
            String s = wf.removeInvitation(copyto);
            if(s.equals("0")) return "0";
            engine.saveWfProcessInstance();
            return "1";
        }else{
            return "0";
        }

    }

    public String addInvitation(String pid, String copyto) throws Exception {
        PEngine engine = (PEngine) activePThreads.get(pid);
        if (engine != null) {
            WfProcessInstance wf = engine.getInstance();
            wf.addInvitation(copyto);
            engine.saveWfProcessInstance();
            return "1";
        }else{
            return "0";
        }

    }


    public List<String> getInvitation(String pid){
        PEngine engine = (PEngine) activePThreads.get(pid);
        if (engine != null) {
            String[] s = engine.getInstance().getInvitations();
            System.out.println(s.length);
            List<String> resultList= new ArrayList<>(Arrays.asList(s));
            return resultList;
        }
        return null;
    }


    public List<String> getCopiers(String pid){
        PEngine engine = (PEngine) activePThreads.get(pid);
        if (engine != null) {
            String[] s = engine.getInstance().getCopiers();
            System.out.println(s.length);
            List<String> resultList= new ArrayList<>(Arrays.asList(s));
            return resultList;
        }
        return null;
    }
    public String removeCopier(String pid, String copyto) throws Exception {
        PEngine engine = (PEngine) activePThreads.get(pid);
        if (engine != null) {
            WfProcessInstance wf = engine.getInstance();
            String s = wf.removeCopier(copyto);
            if(s.equals("0")) return "0";
            engine.saveWfProcessInstance();
            return "1";
        }else{
            return "0";
        }

    }

    public String addCopier(String pid, String copyto) throws Exception {
        PEngine engine = (PEngine) activePThreads.get(pid);
        if (engine != null) {
            WfProcessInstance wf = engine.getInstance();
            wf.addCopier(copyto);
            engine.saveWfProcessInstance();
            return "1";
        }else{
            return "0";
        }

    }

    /**
     * @return the logcache
     */
    public LogCache getLogcache() {
        return logCache;
    }

    /**
     * 已发布流程模版是否有正在运行中的流程实例
     */
    public boolean hasRunningWfProInstance(String processid){
        synchronized (activePThreads) {
            for (String id : activePThreads.keySet()) {
                PEngine engine = (PEngine) activePThreads.get(id);
                WfProcessInstance proIns= engine.getInstance();
                if(proIns.getWfProcessId().equals(processid)){
                    return true;
                }
            }
        }
        return false;
    }


//    public WorkitemInfoDescriptor[] fetchDistributedManualTaskinstances(String userId) throws Exception {
//        System.out.println(">>>>>>>>>Distributed userId"+userId);
//        List<WorkitemInfoDescriptor> list = new ArrayList<WorkitemInfoDescriptor>();
//        synchronized (activePThreads) {
//            for (String id : activePThreads.keySet()) {
//                PEngine engine = (PEngine) activePThreads.get(id);
//                System.out.println("test: engine" + id);
//                synchronized (engine.getTaskQueues()) {
//                    if (!engine.getTaskQueues().isRunningManualTaskQueueEmpty()) {
//                        for (AbstractTask child : engine.getTaskQueues().fetchRunningManualTaskinstances()) {
//                            ManualTaskInstance ti = (ManualTaskInstance) child;
//                            if (ti.getInvitations().length > 0) {
//                                for(int i = 0; i < ti.getInvitations().length; i++){
//                                    JSONObject invitation = new JSONObject(ti.getInvitations()[i]);
//                                    if(invitation.get("oid").equals(userId)){
//                                        list.add(ti)
//                                    }
//                                }
//
//
//
//                            }
//                        }
//                    }
//                    if (!engine.getTaskQueues().isRunningManualTaskQueueEmpty()) {
//                        //System.out.println(">>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>QQQQQ");
//                        for (AbstractTask child : engine.getTaskQueues().fetchRunningManualTaskinstances()) {
//                            ManualTaskInstance ti = (ManualTaskInstance) child;
//                            if (ti.getStatus() == TaskStatus.RUNNING) {
//                                if (ti.getSubmitterId() != null && ti.getSubmitterId().equals(userId)) {
//                                    list.add(getWorkitemInfoDescriptor(ti, engine.getInstance(), userId, userfullname,
//                                            String.valueOf(ti.getPriority())));
//                                }
//                            }
//                        }
//                    }
//                }
//            }
//        }
//        if (list.isEmpty())
//            return new WorkitemInfoDescriptor[0];
//        return list.toArray(new WorkitemInfoDescriptor[list.size()]);
//    }


}