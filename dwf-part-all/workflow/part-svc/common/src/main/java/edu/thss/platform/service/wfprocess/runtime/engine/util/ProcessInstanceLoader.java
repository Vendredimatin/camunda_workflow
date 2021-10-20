package edu.thss.platform.service.wfprocess.runtime.engine.util;

//import com.cloud.core.session.redis.JedisUtil;

import edu.thss.platform.service.wfprocess.blo.runtime.wfprocess.ReleasedWfProcessBlo;
import edu.thss.platform.service.wfprocess.blo.runtime.wfprocessinstance.ProcessInstanceBlo;
import edu.thss.platform.service.wfprocess.core.TreeNode;
import edu.thss.platform.service.wfprocess.core.buildtime.wfprocess.Transition;
import edu.thss.platform.service.wfprocess.core.buildtime.wfprocess.WfProcessStatus;
import edu.thss.platform.service.wfprocess.core.buildtime.wfprocess.task.AbstractTask;
import edu.thss.platform.service.wfprocess.core.runtime.event.Event;
import edu.thss.platform.service.wfprocess.core.runtime.event.EventLog;
import edu.thss.platform.service.wfprocess.core.runtime.event.ProcessStatusChangedEvent;
import edu.thss.platform.service.wfprocess.core.runtime.event.WorkflowEvent;
import edu.thss.platform.service.wfprocess.core.runtime.util.json.WfProcessInstanceJSONParser;
import edu.thss.platform.service.wfprocess.core.runtime.wfprocess.WfProcessInstance;
import edu.thss.platform.service.wfprocess.core.runtime.wfprocess.task.SubprocessPointInstance;
import edu.thss.platform.service.wfprocess.eso.runtime.wfprocessinstance.ProcessInstanceEso;

import edu.thss.platform.service.omf.ItemClassAccessService;
import edu.thss.platform.utils.EnvironmentBuilder;
import edu.thss.platform.utils.BeanHelper;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * @author Dahai Cao last updated on 20180228
 */
public class ProcessInstanceLoader implements EventLog {

    private ItemClassAccessService itemClassAccessService = null;

    private EnvironmentBuilder environmentBuilder = null;

    private final static ProcessInstanceLoader instance = new ProcessInstanceLoader();

    private ProcessInstanceLoader() {
        itemClassAccessService = (ItemClassAccessService) BeanHelper.getBean("itemClassAccessService");
        environmentBuilder = (EnvironmentBuilder) BeanHelper.getBean("environmentBuilder");
    }

    public static ProcessInstanceLoader getInstance() {
        return instance;
    }


    public WfProcessInstance createNewInstance(String releasedProcessId, String enClassInstanceId) throws Exception {
        WfProcessInstance inst = ReleasedWfProcessBlo.getInstance().getReleasedProcessForRuntime(releasedProcessId);
        inst.setWfProcessId(releasedProcessId);
        inst.setVer(System.currentTimeMillis());
        inst.setStatus(WfProcessStatus.LAUNCHED);
        inst.setLaunchTime(System.currentTimeMillis());
        inst.setEnClassInstanceId(enClassInstanceId);
        log(new ProcessStatusChangedEvent(WorkflowEvent.PROCESS_LAUNCHED, inst));
        return inst;
    }

    /**
    * 通过<code>releasedProcessId</code>创建一个新的空的流程实例，
     * 这个流程实例更换了每个对象的ID以及除了状态和启动时间外，不包含任何与流程定义不同的信息。
     *
     * @param releasedProcessId
     * @return
     * @throws Exception
     * @date 2011-8-22 下午12:18:16, last update on 20180228
     */

    public WfProcessInstance createNewInstance(String releasedProcessId) throws Exception {
//        System.out.println("test:createNewInstance" + releasedProcessId);
        WfProcessInstance inst = ReleasedWfProcessBlo.getInstance().getReleasedProcessForRuntime(releasedProcessId);
        inst.setWfProcessId(releasedProcessId);
        inst.setVer(System.currentTimeMillis());
        inst.setStatus(WfProcessStatus.LAUNCHED);
        inst.setLaunchTime(System.currentTimeMillis());
        // 发起流程时新增一个实体类对象 绑定oid
        List<Map<String, Object>> objs = new ArrayList<>();
        Map<String, Object> obj = new HashMap<>();
        objs.add(obj);
        List<Map<String, Object>> result = itemClassAccessService.addEntityObjects(inst.getBindEnClassName(), objs);
        System.out.println(result.toString());
        if (result.size() > 0) {
            inst.setEnClassInstanceId((String)result.get(0).get("oid"));
        }
        log(new ProcessStatusChangedEvent(WorkflowEvent.PROCESS_LAUNCHED, inst));
        return inst;
    }

    /**
     * Creates a new subprocess instance according to the <tt>subprocessId</tt>
     * property of the specified <code>subprocessPoint</code> task.
     *
     * @param subprocessPoint
     * @param parent
     * @return WfProcessInstance
     * @throws Exception
     * @date 2011-8-22 下午12:10:07; last updated at 19:47 on 2018-09-08
     */
    public WfProcessInstance createNewSubprocessInstance(SubprocessPointInstance subprocessPoint,
                                                         WfProcessInstance parent) throws Exception {
        String pid = subprocessPoint.getSubprocessId();
        WfProcessInstance inst = ReleasedWfProcessBlo.getInstance().getReleasedSubProcessForRuntime(pid, subprocessPoint);
        inst.setWfProcessId(pid);
        inst.setVer(System.currentTimeMillis());
        inst.setStatus(WfProcessStatus.LAUNCHED);
        inst.setLaunchTime(System.currentTimeMillis());

        log(new ProcessStatusChangedEvent(WorkflowEvent.PROCESS_LAUNCHED, inst));

        if (parent.getCurrOwner() != null) {
            // it means that this is a subprocess
            inst.setCurrOwner(parent.getCurrOwner());
        } else {
            // it means that this is a main process
            inst.setCurrOwner(parent.getId());
        }
        subprocessPoint.addSubprocess(inst);
        subprocessPoint.setSubprocessInstanceId(inst.getId());
        return inst;
    }

    /**
     * 该方法是装在一个现存的过程实例
     *
     * @param processInstanceId
     * @return
     * @throws Exception
     */
    public WfProcessInstance loadExistingInstance(String processInstanceId) throws Exception {
        String content = ProcessInstanceEso.getInstance().loadInst(processInstanceId);
        WfProcessInstance inst = WfProcessInstanceJSONParser.parseWfProcessInstance(content);
        return inst;
       // String value = JedisUtil.getInstance().get(processInstanceId);
       // WfProcessInstance inst = WfProcessInstanceJSONParser.parseWfProcessInstance(value);
       // return inst;
    	//return null;
    }

    public WfProcessInstance loadCompletedInstance(String processInstanceId) throws Exception {
        WfProcessInstance inst = ProcessInstanceBlo.getInstance().getProcessInstance(processInstanceId);
        // 重新初始化过程中所有的任务的状态。以便重新执行，
        // 这里的重新执行，只是在内存中重新执行，但是过程中所有的数据都是可能在变的，
		// 因此，这个过程实际上是一个全新的过程，在数据库中理论上也要存为一个新的过程实例。
		// 未来要把这个问题解决掉！Dahai Cao marked! at 11:42 on 2019-02-23
        for (TreeNode child : inst.getChildren()) {
            if (child instanceof AbstractTask) {
                ((AbstractTask) child).setStatus(AbstractTask.UNUSED);
                for (Transition t : ((AbstractTask) child).getOutputs()) {
                    t.setStatus(Transition.UNUSED);
                }
            }
        }
        return inst;
    }


    @Override
    public void log(Event event) {
        System.out.println(event.toString());
    }

}
