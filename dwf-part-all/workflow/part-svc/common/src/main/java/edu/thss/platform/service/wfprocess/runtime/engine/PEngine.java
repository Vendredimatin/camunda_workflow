/**
 *
 */
package edu.thss.platform.service.wfprocess.runtime.engine;

import edu.thss.platform.service.wfprocess.core.TreeNode;
import edu.thss.platform.service.wfprocess.core.buildtime.wfprocess.WfProcessStatus;
import edu.thss.platform.service.wfprocess.core.buildtime.wfprocess.task.AbstractTask;
import edu.thss.platform.service.wfprocess.core.buildtime.wfprocess.task.TaskStatus;
import edu.thss.platform.service.wfprocess.core.communication.Comment;
import edu.thss.platform.service.wfprocess.core.data.variable.AccessibleVariable;
import edu.thss.platform.service.wfprocess.core.runtime.event.*;
import edu.thss.platform.service.wfprocess.core.runtime.util.WfProcessInstanceCloner;
import edu.thss.platform.service.wfprocess.core.runtime.util.json.WfProcessInstance2JSON;
import edu.thss.platform.service.wfprocess.core.runtime.wfprocess.WfProcessInstance;
import edu.thss.platform.service.wfprocess.core.runtime.wfprocess.task.ManualTaskInstance;
import edu.thss.platform.service.wfprocess.core.runtime.wfprocess.task.ManualTaskInstancePhase;
import edu.thss.platform.service.wfprocess.core.runtime.wfprocess.task.StartPointInstance;
import edu.thss.platform.service.wfprocess.core.runtime.wfprocess.task.SubprocessPointInstance;
import edu.thss.platform.service.wfprocess.eso.runtime.wfprocessinstance.ProcessInstanceEso;
import edu.thss.platform.service.wfprocess.runtime.engine.util.ProcessInstanceCompletionChecker;
import edu.thss.platform.service.wfprocess.runtime.engine.util.ProcessInstanceSaver;
import edu.thss.platform.service.wfprocess.runtime.engine.util.TaskInstanceStarter;
import edu.thss.platform.service.wfprocess.runtime.server.SaaSServer;
import org.json.JSONObject;

import java.io.Serializable;
import java.util.*;
import java.util.concurrent.Callable;

/**
 * https://stackoverflow.com/questions/35571395/how-to-access-running-threads-
 * inside-threadpoolexecutor
 *
 * @author Dahai Cao created on 2018-01-31
 *
 */
public class PEngine implements Callable<WfProcessInstance>, Serializable, EventLog {

    /**
     * serialVersionUID
     */
    private static final long serialVersionUID = 1L;
    private WfProcessInstance wfProcessInstance = null;
    private SubprocessPointInstance subprocessPointInstance = null;
    private TQueues queues = null;
    private long threadId = -1;
    private int stop = 0;// 0: not stop;1: stopped
    private boolean resuming = false;

    /**
     *
     * @param instance
     * @param resuming
     * @throws Exception
     */
    public PEngine(WfProcessInstance instance, boolean resuming) throws Exception {
        this.wfProcessInstance = instance;
        this.resuming = resuming;
        this.createTaskQueues();
        if (!resuming) {
            AbstractTask task = getStartPointTask(instance);
            task.setStatus(AbstractTask.ENABLED);
            synchronized (queues) {
                this.queues.putEnabledAutoTask(task);
            }
        } else {
            // 需要恢复引擎的运行状态。
            synchronized (queues) {
                AbstractTask[] autoTasks = getAllEnabledAutoTasks(instance);
                for (int i = 0; i < autoTasks.length; i++) {
                    this.queues.putEnabledAutoTask(autoTasks[i]);
                }

                AbstractTask[] manualTasks = getAllEnabledManualTasks(instance);
                for (int i = 0; i < manualTasks.length; i++) {
                    this.queues.putEnabledManuTask(manualTasks[i]);
                }

                AbstractTask[] autoRunningTasks = getAllRunningAutoTasks(instance);
                for (int i = 0; i < autoRunningTasks.length; i++) {
                    this.queues.putRunningAutoTask(autoRunningTasks[i]);
                }

                AbstractTask[] manualRunningTasks = getAllRunningManualTasks(instance);
                for (int i = 0; i < manualRunningTasks.length; i++) {
//                    System.out.println("test resume " + manualRunningTasks[i].getId());
                    this.queues.putRunningManuTask(manualRunningTasks[i]);
                }

                AbstractTask[] autoExceptionTasks = getAllExceptionAutoTasks(instance);
                for (int i = 0; i < autoExceptionTasks.length; i++) {
                    this.queues.putExceptionAutoTask(autoExceptionTasks[i]);
                }

                AbstractTask[] manualExceptionTasks = getAllExceptionManualTasks(instance);
                for (int i = 0; i < manualExceptionTasks.length; i++) {
                    this.queues.putExceptionManaulTask(manualExceptionTasks[i]);
                }
            }
        }
        ProcessInstanceSaver.getInstance().saveCache(this.wfProcessInstance);
    }

    public PEngine(SubprocessPointInstance subprocessPointInstance) throws Exception {
        this.subprocessPointInstance = subprocessPointInstance;
        this.wfProcessInstance = subprocessPointInstance.fetchSubprocess();
        this.createTaskQueues();
        AbstractTask task = getStartPointTask(this.wfProcessInstance);
        task.setStatus(AbstractTask.ENABLED);
        synchronized (queues) {
            this.queues.putEnabledAutoTask(task);
        }
        ProcessInstanceSaver.getInstance().saveCache(this.wfProcessInstance);
    }

    /**
     * @return the wfprocess instance ID
     */
    public String getId() {
        if (this.wfProcessInstance != null)
            return this.wfProcessInstance.getId();
        return null;
    }

    @Override
    public WfProcessInstance call() {
        try {
//            System.out.println("test: engine run " + this.wfProcessInstance.getId());
            setThreadId(Thread.currentThread().getId());
            if (!this.resuming) {
                if (wfProcessInstance.getStatus() == WfProcessStatus.LAUNCHED) {
                    wfProcessInstance.setStatus(WfProcessStatus.RUNNING);
                    log(new ProcessStatusChangedEvent(WorkflowEvent.PROCESS_RUNNED, wfProcessInstance));
                }
            }
            while (true) {
                // synchronized (queues) {
                if (!(queues.elementAutoTask() instanceof StartPointInstance)) {
                    ProcessInstanceSaver.getInstance().saveCache(this.wfProcessInstance);
                }
                // 然后再继续执行下一个任务。
                if (stop == 0) { //
                    if (this.resuming) {// 任务线程恢复中...
                        this.resumeAllManualTaskInstances();
                        this.resuming = false;// 任务线程恢复结束.
                    }
                    TaskInstanceStarter.getInstance().runAutoTaskInstanceForward(queues.runAutoTask(), this,
                            subprocessPointInstance);
                } else {
                    break;
                }
                // }
                if (ProcessInstanceCompletionChecker.getInstance().isAllCompleted(this)) {
                    completeProcessInstance();
                    break;
                }
            }
            synchronized (SaaSServer.getInstance().activePThreads) {
                SaaSServer.getInstance().activePThreads.remove(getId());
            }
            System.out.println("<" + wfProcessInstance.getId() + ">" + wfProcessInstance.getName() + "("
                    + wfProcessInstance.getVersion() + ")" + " Completed.");
        } catch (Exception e) {
            e.printStackTrace();
        }
        return wfProcessInstance;
    }
    // 终止流程实例
    public void terminateProcessInstance() throws Exception {
        System.out.println("---terminateProcessInstance---");
        AbstractTask[] runningTasks = getAllRunningManualTasks(this.wfProcessInstance);
        for(int i = 0; i < runningTasks.length; i++){
            ((ManualTaskInstance)runningTasks[i]).setStatus(TaskStatus.TERMINATED);
            ((ManualTaskInstance)runningTasks[i]).setEndTime(System.currentTimeMillis());
        }

        this.wfProcessInstance.setStatus(WfProcessStatus.TERMINATED);
        this.wfProcessInstance.setTerminationTime(System.currentTimeMillis());
//        this.wfProcessInstance.setVer(System.currentTimeMillis());

        SaaSServer.getInstance().executeEndOperation(this);
        ProcessInstanceEso.getInstance().saveHist(this.wfProcessInstance.getId(), WfProcessInstance2JSON.toJSON(this.wfProcessInstance));
    }

    // 完成流程实例
    private void completeProcessInstance() throws Exception {
        System.out.println("---completeProcessInstance---");
        wfProcessInstance.setStatus(WfProcessStatus.COMPLETED);
        wfProcessInstance.setVer(System.currentTimeMillis());
        wfProcessInstance.setEndTime(System.currentTimeMillis());

        SaaSServer.getInstance().executeEndOperation(this);
        ProcessInstanceEso.getInstance().saveHist(wfProcessInstance.getId(), WfProcessInstance2JSON.toJSON(wfProcessInstance));


        log(new ProcessStatusChangedEvent(WorkflowEvent.PROCESS_COMPLETED, wfProcessInstance));
        if (wfProcessInstance.getCurrOwner() == null) {
            this.saveHistory();
        }
    }



    private void resumeAllManualTaskInstances() throws Exception {
        synchronized (queues) {
            AbstractTask[] emtasks = queues.fetchEnabledManualTaskinstances();
            for (AbstractTask task : emtasks) {
//                System.out.println("test run enable: " + task.getId());
                TaskInstanceStarter.getInstance().fetchManuTaskInstanceForward(task, this);
            }
            AbstractTask[] rmtasks = queues.fetchRunningManualTaskinstances();
            for (AbstractTask task : rmtasks) {
//                System.out.println("test run run: " + task.getId());
                TaskInstanceStarter.getInstance().runManuTaskInstanceForward(task, this);
            }
        }
    }

    /**
     * * 根据<code>tid</code>从非自动任务激活队列中取出该任务实例， 并设置该任务的状态，并改变该任务的状态，设置相应的属性
     * （包括任务实例本身的以及输入连接和输入连接的所连接的任务等）， 然后将该任务实例放置到非自动任务实例的运行队列中。
     *
     * @param tid
     *            String, task instance ID
     * @param uId
     *            String, submitter user ID
     * @param uIP
     *            String, submitter user IP address
     * @return
     * @throws Exception
     */
    public ManualTaskInstance fetchManualTaskInstanceforMWf(String tid,
                                                            String uId,
                                                            String uIP,
                                                            int priority,
                                                            String ufullname)
            throws Exception {
        synchronized (queues) {
            AbstractTask t = queues.fetchEnabledManuTaskById(tid);
            System.out.println(">>>fetchManualTaskInstanceforMWf" + " " + uId + " " + ufullname);
            System.out.println(t);
            if (t == null) {
                t = queues.fetchRunningManuTaskById(tid, uId);
            }
            if (t instanceof ManualTaskInstance) {
                ManualTaskInstance mti = (ManualTaskInstance) t;
                System.out.println(">>>fetchManualTaskInstanceforMWf mti.getFormName()");
                System.out.println(mti.getFormName());
                if (mti.getStatus() == TaskStatus.ENABLED) { // 第一次打开 及领取
                    NEngine navigator = new NEngine();
                    navigator.changeInputStatusForward(t, this);
                    mti.setStatus(TaskStatus.RUNNING);
                    mti.setSubmitterId(uId);
                    mti.setStartTime(System.currentTimeMillis());
                    mti.setSubmitterIp(uIP);
                    mti.setSubmitter(ufullname);
                    mti.setPhase(ManualTaskInstancePhase.FETCHED_BUT_NOT_SUBMIT);
                    mti.setPriority(priority);

                    this.wfProcessInstance.addInvitation(mti.getSubmitter(),mti.getSubmitterId());
                    ProcessInstanceSaver.getInstance().saveCache(this.wfProcessInstance);
                    return mti;
                } else { // 再次打开
                    return mti;
                }
            }
        }
        return null;
    }
    /**
     * 据<code>tid</code>从非自动任务激活队列中取出该任务实例
     *
     * @param tid
     *            String, task instance ID
     * @return ManualTaskInstance
     * @throws Exception
     */
    public ManualTaskInstance getManualTaskInstanceforMWf(String tid)
            throws Exception {
        synchronized (queues) {
            AbstractTask t = queues.fetchEnabledManuTaskById(tid);
            if (t == null) {
                t = queues.fetchRunningManuTaskById(tid);
            }
            if (t instanceof ManualTaskInstance) {
                return (ManualTaskInstance) t;
            }
        }
        return null;
    }

    public ManualTaskInstance getManualTaskInstanceById(String tid) {
        TreeNode[] nodes = this.wfProcessInstance.getChildren();
        for (int i = 0; i < nodes.length; i++) {
//            if(nodes[i] instanceof AbstractTask){
//                AbstractTask abstractTask  = (AbstractTask) nodes[i];
//                if(abstractTask.getId().equals(tid)){
                    if (nodes[i] instanceof ManualTaskInstance) {
                        ManualTaskInstance manualTaskInstance = (ManualTaskInstance) nodes[i];
                        if (manualTaskInstance.getId().equals(tid)) {
                            return manualTaskInstance;
                        }
                    }
//                }
//            }
        }
        return null;
    }


    public ManualTaskInstance turnManualTaskInstanceforMwf(String tid, String uId, String uIP, String ufullname, String newuserid, String comment) throws Exception {
        synchronized (queues) {
            AbstractTask t = queues.fetchRunningManuTaskById(tid, uId);
            System.out.println("test:" + tid + " " + uId + " " + t.toString());
            if (t instanceof ManualTaskInstance) {
                ManualTaskInstance mti = (ManualTaskInstance) t;
                if (mti.getStatus() == TaskStatus.RUNNING) { // 正在运行
                    Comment c = new Comment(mti.getSubmitterId(),mti.getSubmitter(),"转给"+ufullname,comment);
                    mti.setSubmitterId(newuserid);
//                    mti.setSubmitterIp(uIP);
                    mti.setSubmitterIp("&&&0");
                    mti.setSubmitter(ufullname);
                    mti.addComment(c);
                    this.wfProcessInstance.addInvitation("{\"name\":\""+ufullname+"\",\"oid\":\""+newuserid+"\"}");
                    ProcessInstanceSaver.getInstance().saveCache(this.wfProcessInstance);
                    return mti;
                }
            }
        }
        return null;
    }

    public ManualTaskInstance fetchManualTaskInstanceforSWf(String pid,
                                                            String tid,
                                                            String uId,
                                                            String uIP,
                                                            String fullname) throws Exception {
        synchronized (queues) {
            if (tid == null)
                return (ManualTaskInstance) queues.fetchTopRunningManuTask();
            else
                return (ManualTaskInstance) queues.fetchRunningManuTaskNqId(tid, uId);
        }
    }

    /**
     * @param tId
     *            String, task instance ID
     * @param uId
     *            String, submitter user ID
     * @param list
     *            Map<String, String>
     * @return
     * @throws Exception
     */
    public String saveAccessibleDataVariable(String tId,
                                             String uId,
                                             Map<String, Object> list) throws Exception {
        synchronized (queues) {
            ManualTaskInstance t = (ManualTaskInstance) queues.fetchRunningManuTaskById(tId, uId);
            System.out.println("test:list:" + list.toString());
            // 未来要用队列里去取，这样做规范些。
            if (t != null) {
                if (t.getAccessibleVars() != null && t.getAccessibleVars().length > 0) {
                    for (AccessibleVariable ac : t.getAccessibleVars()) {
                        if (ac.getAccessControl() == 1) {// 1意味着这个数据变量可更改。
                            if (list.get(ac.getComponentId()) != null) {
                                Object v = list.get(ac.getComponentId());
                                TreeNode n = wfProcessInstance.seekByID(ac.getVarId());
                                ProcessInstanceSaver.getInstance().saveDataVariable(v, n);
                                // 更新完内存中数据变量数据后，更新缓存数据。
                                ProcessInstanceSaver.getInstance().saveCache(this.wfProcessInstance);
                            }
                        }
                    }
                }
                return "1";
            } else {
                return "0";
            }
        }
    }
    public String saveWfProcessInstance() throws Exception {
        ProcessInstanceSaver.getInstance().saveCache(this.wfProcessInstance);
        return "1";
    }



    /**
     * 根据<code>taskInstanceId</code>从非自动任务实例的运行队列中取出该任务实例， 恢复该任务实例的状态，并
     *
     * @param tid
     *            String, task instance ID
     * @param uid
     *            String, submitter user ID
     * @throws InterruptedException
     */
    public String returnManualTaskInstance(String tid, String uid) throws Exception {
        synchronized (queues) {
            AbstractTask t = queues.fetchRunningManuTaskById(tid, uid);
            if (t instanceof ManualTaskInstance
                    && ((ManualTaskInstance) t).getPhase() == ManualTaskInstancePhase.FETCHED_BUT_NOT_SUBMIT) {
                ((ManualTaskInstance) t).setPhase(ManualTaskInstancePhase.RETURNED);
                ProcessInstanceSaver.getInstance().saveCache(this.wfProcessInstance);
                return "1";
            }
            return "0";
        }
    }

    public String submitManualTaskInstance(String pInstId,
                                           String taskInstId,
                                           String userId,
                                           String userIp,
                                           String ufullname,
                                           String submitComment) throws Exception {
        synchronized (queues) {
            AbstractTask t = queues.fetchRunningManuTaskById(taskInstId, userId);
            if (t != null) {
                System.out.println("test: submit " + ((ManualTaskInstance) t).getPhase());
                if (t instanceof ManualTaskInstance
                        && ((ManualTaskInstance) t).getPhase() == ManualTaskInstancePhase.FETCHED_BUT_NOT_SUBMIT) {
                    ManualTaskInstance mti = (ManualTaskInstance) t;
                    System.out.println("mti.getGoAhead()"+mti.getGoAhead());
                    //t.setStatus(TaskStatus.COMPLETED);// 此时不更改任务状态，而是由系统自动更改
                    if(mti.getGoAhead()){
                        ((ManualTaskInstance) t).setEndTime(System.currentTimeMillis());
                        ((ManualTaskInstance) t).setSubmitterId(userId);
                        ((ManualTaskInstance) t).setSubmitterIp(userIp);
                        ((ManualTaskInstance) t).setSubmitter(ufullname);
                        ((ManualTaskInstance) t).setPhase(ManualTaskInstancePhase.SUBMITTED);// Phase= 2 已提交
                    }else{

                    }
                    Comment comment = new Comment(userId,ufullname,"提交",submitComment);
                    ((ManualTaskInstance) t).addComment(comment);
                    ProcessInstanceSaver.getInstance().saveCache(this.wfProcessInstance);
                    System.out.println("submitManualTaskInstance 1");
                    return "1";
                }

            }
        }
        return "0";
    }

    /**
     * @author Dahai CAO
     * @date 10/06/2011 11:53:11 AM
     * @return
     */
    private StartPointInstance getStartPointTask(WfProcessInstance process) {
        TreeNode[] nodes = process.getChildren();
        for (int i = 0; i < nodes.length; i++)
            if (nodes[i] instanceof StartPointInstance)
                return (StartPointInstance) nodes[i];
        return null;
    }

    private AbstractTask[] getAllEnabledAutoTasks(WfProcessInstance process) {
        List<AbstractTask> lst = new ArrayList<>();
        TreeNode[] nodes = process.getChildren();
        for (int i = 0; i < nodes.length; i++)
            if (nodes[i] instanceof AbstractTask) {
                if (!(nodes[i] instanceof ManualTaskInstance) &&
                        ((AbstractTask) nodes[i]).getStatus() == AbstractTask.ENABLED) {
                    lst.add((AbstractTask) nodes[i]);
                }
            }
        return lst.toArray(new AbstractTask[lst.size()]);
    }

    private AbstractTask[] getAllEnabledManualTasks(WfProcessInstance process) {
        List<AbstractTask> lst = new ArrayList<>();
        TreeNode[] nodes = process.getChildren();
        for (int i = 0; i < nodes.length; i++)
            if (nodes[i] instanceof AbstractTask) {
                if (nodes[i] instanceof ManualTaskInstance &&
                        ((AbstractTask) nodes[i]).getStatus() == AbstractTask.ENABLED) {
                    lst.add((AbstractTask) nodes[i]);
                }
            }
        return lst.toArray(new AbstractTask[lst.size()]);
    }

    private AbstractTask[] getAllRunningAutoTasks(WfProcessInstance process) {
        List<AbstractTask> lst = new ArrayList<>();
        TreeNode[] nodes = process.getChildren();
        for (int i = 0; i < nodes.length; i++)
            if (nodes[i] instanceof AbstractTask) {
                if (!(nodes[i] instanceof ManualTaskInstance) &&
                        ((AbstractTask) nodes[i]).getStatus() == AbstractTask.RUNNING) {
                    lst.add((AbstractTask) nodes[i]);
                }
            }
        return lst.toArray(new AbstractTask[lst.size()]);
    }

    private AbstractTask[] getAllRunningManualTasks(WfProcessInstance process) {
        List<AbstractTask> lst = new ArrayList<>();
        TreeNode[] nodes = process.getChildren();
        for (int i = 0; i < nodes.length; i++)
            if (nodes[i] instanceof AbstractTask) {
                if (nodes[i] instanceof ManualTaskInstance &&
                        ((AbstractTask) nodes[i]).getStatus() == AbstractTask.RUNNING) {
                    lst.add((AbstractTask) nodes[i]);
                }
            }
        return lst.toArray(new AbstractTask[lst.size()]);
    }

    private AbstractTask[] getAllExceptionAutoTasks(WfProcessInstance process) {
        List<AbstractTask> lst = new ArrayList<>();
        TreeNode[] nodes = process.getChildren();
        for (int i = 0; i < nodes.length; i++)
            if (nodes[i] instanceof AbstractTask) {
                if (!(nodes[i] instanceof ManualTaskInstance) &&
                        ((AbstractTask) nodes[i]).getStatus() == AbstractTask.EXCEPTION) {
                    lst.add((AbstractTask) nodes[i]);
                }
            }
        return lst.toArray(new AbstractTask[lst.size()]);
    }

    private AbstractTask[] getAllExceptionManualTasks(WfProcessInstance process) {
        List<AbstractTask> lst = new ArrayList<>();
        TreeNode[] nodes = process.getChildren();
        for (int i = 0; i < nodes.length; i++)
            if (nodes[i] instanceof AbstractTask) {
                if (nodes[i] instanceof ManualTaskInstance &&
                        ((AbstractTask) nodes[i]).getStatus() == AbstractTask.EXCEPTION) {
                    lst.add((AbstractTask) nodes[i]);
                }
            }
        return lst.toArray(new AbstractTask[lst.size()]);
    }

    /**
     * @author Dahai CAO
     * @date 2011-9-5 下午12:14:36
     * @return
     */
    public TQueues getTaskQueues() {
        return queues;
    }

    /**
     * @author Dahai CAO
     * @date 2011-9-5 下午12:14:36
     */
    public void createTaskQueues() {
        if (queues == null)
            queues = new TQueues();
    }

    /**
     * @return the instance
     */
    public WfProcessInstance getInstance() {
        return wfProcessInstance;
    }

    public String toString() {
        return wfProcessInstance.toString();
    }

    @Override
    public void log(Event event) {
        SaaSServer.getInstance().getLogcache().writeLog(event);
    }


    public void saveHistory() {
        // this means current process is a main process.
        //log(new SavingEventLog(SavingEventLog.SAVING_HISTORY, wfProcessInstance.getCode(),
        //		WfProcessInstance2JSON.toJSON(wfProcessInstance)));
        log(new SavingEventLog(SavingEventLog.SAVING_HISTORY, wfProcessInstance.getCode(),
                WfProcessInstanceCloner.clone(wfProcessInstance)));
    }

    /**
     * @return the threadId
     */
    public long getThreadId() {
        return threadId;
    }

    /**
     * @param threadId
     *            the threadId to set
     */
    public void setThreadId(long threadId) {
        this.threadId = threadId;
    }

    public int getStop() {
        return stop;
    }

    public void setStop(int stop) {
        this.stop = stop;
    }
}
