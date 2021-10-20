/**
 *
 */
package edu.thss.platform.service.wfprocess.runtime.engine;

import com.alibaba.fastjson.JSONArray;
import com.alibaba.fastjson.JSONObject;
import edu.thss.platform.service.wfprocess.core.WorkflowEntity;
import edu.thss.platform.service.wfprocess.core.antlr.conditional.CondExprCalculatorUtil;
import edu.thss.platform.service.wfprocess.core.buildtime.wfprocess.ParticipationType;
import edu.thss.platform.service.wfprocess.core.buildtime.wfprocess.Transition;
import edu.thss.platform.service.wfprocess.core.buildtime.wfprocess.task.AbstractTask;
import edu.thss.platform.service.wfprocess.core.data.BooleanConstant;
import edu.thss.platform.service.wfprocess.core.data.expression.Expression;
import edu.thss.platform.service.wfprocess.core.runtime.event.*;
import edu.thss.platform.service.wfprocess.core.runtime.util.TransitionComparator;
import edu.thss.platform.service.wfprocess.core.runtime.wfprocess.WfProcessInstance;
import edu.thss.platform.service.wfprocess.core.runtime.wfprocess.task.ManualTaskInstance;
import edu.thss.platform.service.wfprocess.core.runtime.wfprocess.task.ManualTaskInstancePhase;
import edu.thss.platform.service.wfprocess.core.runtime.wfprocess.task.ManualTaskInstancePriority;
import edu.thss.platform.service.wfprocess.core.runtime.wfprocess.task.StartPointInstance;
import edu.thss.platform.service.wfprocess.runtime.engine.util.TaskInstanceStarter;
import edu.thss.platform.service.wfprocess.runtime.server.SaaSServer;
import edu.thss.platform.service.wfprocess.runtime.server.WfOperationService;
import edu.thss.platform.utils.BeanHelper;

import java.io.Serializable;
import java.util.Arrays;
import java.util.Collections;
import java.util.Map;

/**
 * @author Dahai Cao created on 2012-10-02
 * @date 2017-10-03, 2018-02-28 last updated.
 */
public class NEngine implements Serializable, EventLog {
    /**
     * serialVersionUID
     */
    private static final long serialVersionUID = -5216798616325512742L;

    /**
     * Constructor
     */
    public NEngine() {}

    /**
     * 这个方法导航一个任务的后续变迁实例以及任务实例，并计算哪些后续任务实例可被激活，
     * 激活的自动任务实例放在自动任务实例队列中，激活的非自动任务放在非自动任务实例中。
     *
     * @param task
     *            AbstractTask
     * @param pengine
     *            PEngine
     * @return
     * @throws Exception
     * @date 2011-8-17 下午01:17:19; last upadated on 2018-01-30, 2018-02-28;
     */
    public boolean navigateForward(AbstractTask task, PEngine pengine) throws Exception {
        String ip = "";
        String cmd = "";
        String id = null;
        String name = null;
        if (task instanceof ManualTaskInstance) {
            ip = ((ManualTaskInstance) task).getSubmitterIp();
            if (ip != null && ip.startsWith("&&&")) {
                String[] res = ip.split("&&&");
                if (res.length > 1) {
                    cmd = res[1];
                    if (cmd.equals("1") && res.length > 3) {
                        id = res[2];
                        name = res[3];
                    }
                }
            }
        }
        if (task.getIsParallelOutput() == 1) { // 并发输出
            Transition[] outputs = task.getOutputs();
            for (Transition output : outputs) {
                updateTransitionInstanceStatus(output, Transition.ENABLED, pengine.getInstance());
                // 自动任务实例和非自动任务实例分别进入不同的激活队列。
                if (output.getTarget() instanceof ManualTaskInstance) {
                    if (id != null) {
                        ((ManualTaskInstance) output.getTarget()).setSubmitter(name);
                        ((ManualTaskInstance) output.getTarget()).setSubmitterId(id);
                        ((ManualTaskInstance) output.getTarget()).setSubmitterIp("&&&2");
                        pengine.getInstance().addInvitation(name, id);
                    }
                    System.out.println("task.getId():::"+task.getId());
                    ((ManualTaskInstance) output.getTarget()).setLastTaskId(task.getId());
                    handleManualTaskInstanceForward((ManualTaskInstance) output.getTarget(), pengine);
                } else {
                    updateTaskInstanceStatus((AbstractTask) output.getTarget(), AbstractTask.ENABLED,
                            pengine.getInstance());
                    pengine.getTaskQueues().putEnabledAutoTask((AbstractTask) output.getTarget());
                }
            }
        } else { //task.getIsParallelOutput() == 0 串
            Transition[] outputs = task.getOutputs();
            if (outputs.length == 0) return true;
            Collections.sort(Arrays.asList(outputs), new TransitionComparator());
                boolean hasEnabled = false;
                for (Transition output : outputs) {
                    calculateOutputTransitionStatus(output, pengine);
                    if (output.getStatus() == Transition.ENABLED) {
                        // 找到第一个enabled transition就执行。
                        System.out.println("task.getId():::" + task.getId());
                        if (output.getTarget() instanceof ManualTaskInstance) {
                            ((ManualTaskInstance) output.getTarget()).setLastTaskId(task.getId());
                            if (id != null) {
                                ((ManualTaskInstance) output.getTarget()).setSubmitterIp(ip);
    //                            ((ManualTaskInstance) output.getTarget()).setSubmitter(name);
    //                            ((ManualTaskInstance) output.getTarget()).setSubmitterId(id);
    //                            ((ManualTaskInstance) output.getTarget()).setSubmitterIp("&&&2");
    //                            pengine.getInstance().addInvitation(name, id);
                            }
                        }

                        calculateTargetTaskStatus((AbstractTask) output.getTarget(), pengine);
                        hasEnabled = true;
                        break;
                    }
                }
                if (!hasEnabled  && !(task instanceof StartPointInstance)) {
                    // 不符合条件时，停在该任务，不停止流程
                    if (task instanceof ManualTaskInstance) {
                        handleManualTaskInstanceForward((ManualTaskInstance) task, pengine);
                    } else {
                        updateTaskInstanceStatus(task, AbstractTask.ENABLED, pengine.getInstance());
                        pengine.getTaskQueues().putEnabledAutoTask(task);
                    }
                }
            }
        return true;
    }

    /**
     * 这个方法用于计算后续任务的状态。并更新后续任务的状态
     *
     * @param target
     *            AbstractTask
     * @param pengine
     *            PEngine
     * @throws InterruptedException
     * @date 2011-8-17 下午01:17:19; last upadated on 2018-01-30, 2018-02-28;
     */
    private void calculateTargetTaskStatus(AbstractTask target, PEngine pengine) throws Exception {
        String ip = "";
        String cmd = "";
        String id = null;
        String name = null;
        if (target instanceof ManualTaskInstance) {
            ip = ((ManualTaskInstance) target).getSubmitterIp();
            if (ip != null && ip.startsWith("&&&")) {
                String[] res = ip.split("&&&");
                if (res.length > 1) {
                    cmd = res[1];
                    if (cmd.equals("1") && res.length > 3) {
                        id = res[2];
                        name = res[3];
                    }
                }
            }
        }
        if (target.getIsParallelInput() == 1) {
            boolean allEnabled = true;
            Transition[] inputs = target.getInputs();
            for (Transition input : inputs) {
                if (input.getStatus() != Transition.ENABLED) {
                    allEnabled = false;
                    break;
                }
            }
            if (allEnabled) {
                // 自动任务实例和非自动任务实例分别进入不同的激活队列。
                if (target instanceof ManualTaskInstance) {
                    if (id != null) {
                        ((ManualTaskInstance) target).setSubmitterIp("&&&2");
                        ((ManualTaskInstance) target).setSubmitter(name);
                        ((ManualTaskInstance) target).setSubmitterId(id);
                        pengine.getInstance().addInvitation(name, id);
                    }
                    handleManualTaskInstanceForward((ManualTaskInstance) target, pengine);
                } else {
                    updateTaskInstanceStatus(target, AbstractTask.ENABLED, pengine.getInstance());
                    pengine.getTaskQueues().putEnabledAutoTask(target);
                }
            }
        } else {
            // 自动任务实例和非自动任务实例分别进入不同的激活队列。
            if (target instanceof ManualTaskInstance) {
                System.out.println(">>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>4");
                if (id != null) {
                    ((ManualTaskInstance) target).setSubmitterIp("&&&2");
                    ((ManualTaskInstance) target).setSubmitter(name);
                    ((ManualTaskInstance) target).setSubmitterId(id);
                    pengine.getInstance().addInvitation(name, id);
                }
                handleManualTaskInstanceForward((ManualTaskInstance) target, pengine);
            } else {
                updateTaskInstanceStatus(target, AbstractTask.ENABLED, pengine.getInstance());
                pengine.getTaskQueues().putEnabledAutoTask(target);
            }
        }
    }


    private String getParticipantsName(JSONObject part,String LaunchUserName){
        if (part.getString("participantType").equals("launcher")) {
            return  LaunchUserName;
        } else {
            return  part.getString("name");
        }
    }
    private String getParticipantsId(JSONObject part,String LaunchUserId){
        if (part.getString("participantType").equals("launcher")) {
            return  LaunchUserId;
        } else {
            return  part.getString("oid");
        }
    }
    private JSONObject onlyOneParticipants(ManualTaskInstance mt, PEngine pengine)  throws Exception {
        JSONArray parts = mt.getParticipants();
        JSONObject part = new JSONObject();
        if(parts.size()==1 && !parts.getJSONObject(0).getString("participantType").equals("group")) {
            part.put("oid",getParticipantsId(parts.getJSONObject(0) ,pengine.getInstance().getLaunchUserId()) );
            part.put("name",getParticipantsName(parts.getJSONObject(0) ,pengine.getInstance().getLaunchUser()) );
            return part;
        }else if(parts.size()==2){
            String id1 = getParticipantsId(parts.getJSONObject(0) ,pengine.getInstance().getLaunchUserId());
            String id2 = getParticipantsId(parts.getJSONObject(1) ,pengine.getInstance().getLaunchUserId());
            if(id1.equals(id2)) {
                part.put("oid",id1);
                part.put("name",getParticipantsName(parts.getJSONObject(0) ,pengine.getInstance().getLaunchUser()) );
                return part;
            }
            else return null;
        }
        return null;
    }
    private void handleManualTaskInstanceForward(ManualTaskInstance mt, PEngine pengine) throws Exception {
        String ip = mt.getSubmitterIp();
        if (pengine.getInstance().getWorkflowType() == ParticipationType.SINGLE_PARTICIPANT_APP
                || (ip != null && ip.equals("&&&2"))) {
            // single participant workflow, 单人工作流，直接进入running queue

            changeInputStatusForward(mt, pengine);
            System.out.println(">>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>4.2 " + ip);
            mt.setEnabledTime(System.currentTimeMillis());
            mt.setStartTime(System.currentTimeMillis());
            if (ip != null && ip.equals("&&&2")) {
//                mt.setSubmitterIp("&&&0");
//                pengine.getInstance().addInvitation();
            } else {
                mt.setSubmitterId(pengine.getInstance().getLaunchUserId());
                mt.setSubmitter(pengine.getInstance().getLaunchUser());
                mt.setSubmitterIp(pengine.getInstance().getIpv4());
            }
            updateTaskInstanceStatus(mt, AbstractTask.RUNNING, pengine.getInstance());
            mt.setPhase(ManualTaskInstancePhase.FETCHED_BUT_NOT_SUBMIT);
            mt.setPriority(ManualTaskInstancePriority.URGENT);
            pengine.getTaskQueues().putRunningManuTask(mt);
            TaskInstanceStarter.getInstance().runManuTaskInstanceForward(mt, pengine);
        } else if (pengine.getInstance().getWorkflowType() == ParticipationType.MULTIPLE_PARTICIPANT_APP) {
            System.out.println(">>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>4.1 " + ip);
            // multiple participant workflow，多人工作流，进入enabled queue
            changeInputStatusForward(mt, pengine);
            JSONObject part = onlyOneParticipants(mt, pengine);
            if(part != null){
                // 只有一个办理人自动领取
                System.out.println("part.toJSONString(): p"+part.toJSONString());
                mt.setEnabledTime(System.currentTimeMillis());
                mt.setStartTime(System.currentTimeMillis());
                mt.setSubmitter(part.getString("name"));
                mt.setSubmitterId(part.getString("oid"));
                pengine.getInstance().addInvitation(part.getString("name"),part.getString("oid"));

                updateTaskInstanceStatus(mt, AbstractTask.RUNNING, pengine.getInstance());
                mt.setPhase(ManualTaskInstancePhase.FETCHED_BUT_NOT_SUBMIT);
                pengine.getInstance().addInvitation(mt.getSubmitter(),mt.getSubmitterId());
                pengine.getTaskQueues().putRunningManuTask(mt);
                TaskInstanceStarter.getInstance().runManuTaskInstanceForward(mt, pengine);
            }else{
                updateTaskInstanceStatus(mt, AbstractTask.ENABLED, pengine.getInstance());
                //setManualTaskInstanceCandidates(mt, pengine.getInstance());
                mt.setEnabledTime(System.currentTimeMillis());
                pengine.getTaskQueues().putEnabledManuTask(mt);
                TaskInstanceStarter.getInstance().fetchManuTaskInstanceForward(mt, pengine);
            }
        }
        SaaSServer.getInstance().executeBeforeOperation(pengine,mt);
        pengine.saveWfProcessInstance();
    }



    /**
     * Handle input transitions of current task. This method is same as
     * navigateInputsForMultipleSteping(AbstractTask task);
     *
     * @author Dahai Cao lastupdated on 2018-03-07
     *
     * @param task
     *            AbstractTask
     * @param pengine
     *            PEngine
     * @return
     * @throws Exception
     */
    public boolean changeInputStatusForward(AbstractTask task, PEngine pengine) throws Exception {
        Transition[] inputs = task.getInputs();
        if (task.getIsParallelInput() == 1) {
            boolean allEnabled = true;
            for (Transition input : inputs) {
                if (input.getStatus() != Transition.ENABLED) {
                    allEnabled = false;
                    break;
                }
            }
            if (allEnabled) {
                for (Transition input : inputs) {
                    updateTransitionInstanceStatus(input, Transition.COMPLETED, pengine.getInstance());
                }
                return true;
            }
        } else {
            for (Transition input : inputs) {
                if (input.getStatus() == Transition.ENABLED) {
                    updateTransitionInstanceStatus(input, Transition.COMPLETED, pengine.getInstance());
                    AbstractTask source = (AbstractTask) input.getSource();
                    if (source.getIsParallelOutput() == 0) {
                        for (Transition output : source.getOutputs()) {
                            if (!output.equals(input)) {
                                if (output.getStatus() == Transition.ENABLED) {
                                    updateTransitionInstanceStatus(output, Transition.UNUSED, pengine.getInstance());
                                    AbstractTask target = (AbstractTask) output.getTarget();
                                    updateTaskInstanceStatus(target, AbstractTask.UNUSED, pengine.getInstance());
                                    if (target instanceof ManualTaskInstance) {
                                        handleManualTaskInstanceBackward((ManualTaskInstance) target, pengine);
                                    } else {
                                        pengine.getTaskQueues().removeEnabledAutoTask(task);
                                    }
                                }
                            }
                        }
                    }
                }
            }
            return true;
        }
        return false;
    }

    /**
     * 这个方法用于计算后续任务的变迁的状态。并更新变迁的状态
     *
     * @param output
     *            Transition
     * @param pengine
     *            PEngine
     * @throws Exception
     * @date 2011-8-17 下午01:17:19; last upadated on 2018-01-30, 2018-02-28;
     */
    private void calculateOutputTransitionStatus(Transition output, PEngine pengine) throws Exception {
        if (!output.isAlwaysTrue()) {
            Expression rule = (Expression) output.getNavigationRule();
            if (rule != null) {
                WorkflowEntity r = CondExprCalculatorUtil.computeValue(rule, pengine.getInstance());
                if (r instanceof BooleanConstant) {
                    if (((BooleanConstant) r).getValue().equals("true")) {
                        updateTransitionInstanceStatus(output, Transition.ENABLED, pengine.getInstance());
                    } else {
                        if (output.getStatus() == Transition.ENABLED) {
                            updateTransitionInstanceStatus(output, Transition.UNUSED, pengine.getInstance());
                        }
                    }
                } else {
                    updateTransitionInstanceStatus(output, Transition.EXCEPTION, pengine.getInstance());
                }
            } else {
                updateTransitionInstanceStatus(output, Transition.EXCEPTION, pengine.getInstance());
            }
        } else {
            updateTransitionInstanceStatus(output, Transition.ENABLED, pengine.getInstance());
        }
    }

    /**
     * 跟新任务实例的状态
     *
     * @param t
     *            AbstractTask
     * @param status
     *            int
     * @param inst
     *            WfProcessInstance
     */
    private void updateTaskInstanceStatus(AbstractTask t, int status, WfProcessInstance inst) {
        t.setStatus(status);
        int eventType = -2;
        if (status == AbstractTask.ENABLED) {
            eventType = WorkflowEvent.TASK_ENABLED;
        } else if (status == AbstractTask.RUNNING) {
            eventType = WorkflowEvent.TASK_RUNNED;
        } else if (status == AbstractTask.COMPLETED) {
            eventType = WorkflowEvent.TASK_COMPLETED;
        } else if (status == AbstractTask.UNUSED) {
            eventType = WorkflowEvent.TASK_UNUSED;
        } else if (status == AbstractTask.EXCEPTION) {
            eventType = WorkflowEvent.TASK_EXCEPTION;
        } else if (status == AbstractTask.SKIPPED) {
            eventType = WorkflowEvent.TASK_SKIPPED;
        } else if (status == AbstractTask.TERMINATED) {
            eventType = WorkflowEvent.TASK_TERMINATED;
        }
        log(new TaskStatusChangedEvent(eventType, t, inst));
    }

    /**
     * 更新变迁实例的状态
     *
     * @param t
     *            Transition
     * @param status
     *            int
     * @param inst
     *            WfProcessInstance
     */
    private void updateTransitionInstanceStatus(Transition t, int status, WfProcessInstance inst) {
        t.setStatus(status);
        int eventType = -2;
        if (status == Transition.ENABLED) {
            eventType = WorkflowEvent.TRANSITION_ENABLED;
        } else if (status == Transition.UNUSED) {
            eventType = WorkflowEvent.TRANSITION_UNUSED;
        } else if (status == Transition.COMPLETED) {
            eventType = WorkflowEvent.TRANSITION_COMPLETED;
        } else if (status == Transition.EXCEPTION) {
            eventType = WorkflowEvent.TRANSITION_EXCEPTION;
        }
        log(new TransitionStatusChangedEvent(eventType, t, inst));
    }

    /**
     *
     */
    public void log(Event event) {
        System.out.println(event.toString());
    }



    private void handleManualTaskInstanceBackward(ManualTaskInstance mt, PEngine pengine) throws Exception {
        mt.resetRuntimeProps();
        mt.setExpiryDateTime(-1);
        mt.setAlarmDateTime(-1);
        mt.setEnabledTime(-1);
        if (pengine.getInstance().getWorkflowType() == ParticipationType.MULTIPLE_PARTICIPANT_APP) {
            System.out.println(">>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>4.3");
            pengine.getTaskQueues().removeEnabledManuTask(mt);
        } else if (pengine.getInstance().getWorkflowType() == ParticipationType.SINGLE_PARTICIPANT_APP) {
            System.out.println(">>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>4.4");
            pengine.getTaskQueues().removeRunningManuTask(mt);
        }
    }

//    private void setManualTaskInstanceCandidates(ManualTaskInstance t, WfProcessInstance p) throws Exception {
//        // 在这里可以加上大数据支持，做推荐和预测。根据用户以往所做的工作，来推荐工作，
//        // 并预测用户的工作偏好, 还可以以及根据任务的特征，对任务进行优先级排序。
//        // 当然这需要高性能的推荐算法和大量数据支持。
//        // here: 调用机器学习或大数据接口
//        if (t.getParticipants() != null && t.getParticipants().length > 0) {
//            for (int i = 0; i < t.getParticipants().length; i++) {
//                if (t.getParticipants()[i].getPositionId() != null) {
//                    String[] staffs = RuntimeJobAssignmentBlo.getInstance()
//                            .getAllStaffsOnPosition(t.getParticipants()[i].getPositionId());
//                    if (staffs != null && staffs.length > 0) {
//                        for (int j = 0; j < staffs.length; j++) {
//                            String[] s = staffs[j].split("#");
//                            // staffs[j] = staffs[j] + "@" + t.getParticipants()[i].getPriority();
//                            // s[0] is staff ID, s[1] is User ID;
//                            String name = "";
//                            String mb = "";
//                            if (s.length > 4) {
//                                if (s[2] != null && s[3] != null) {
//                                    name = s[2] + "" + s[3];// 姓名
//                                } else {
//                                    name = s[4];// 昵称（网名）
//                                }
//                                mb = s[5];
//                            }
//                            staffs[j] = s[0] + "@" + s[1] + "@" + name + "@" + mb + "@" +
//                                    t.getParticipants()[i].getPriority() + "@" +
//                                    t.getParticipants()[i].getParticipationType() + "@" +
//                                    t.getParticipants()[i].getPositionId() + "@" +
//                                    t.getParticipants()[i].getPositionName() + "@" +
//                                    t.getParticipants()[i].getDepartmentId() + "@" +
//                                    t.getParticipants()[i].getDepartmentName() + "@" +
//                                    t.getParticipants()[i].getOrganizationId() + "@" +
//                                    t.getParticipants()[i].getOrganizationName() + "@" +
//                                    t.getParticipants()[i].getUserId() + "@" +
//                                    t.getParticipants()[i].getUserFullName();
//
//                        }
//                        t.setCandidates(staffs);
//                    }
//                } else if (t.getParticipants()[i].getUserId().equals("WORKFLOW_LAUNCHR")) {
//                    // 指定执行者为流程应用实例发起人。
//                    if (p.getLaunchUserId() != null) {
//                        t.setSubmitterId(p.getLaunchUserId());
//                        t.setSubmitter(p.getLaunchUser());
//                        t.setSubmitterIp(p.getIpv4());
//                        t.setPriority(ManualTaskInstancePriority.URGENT);// 最高优先级。
//                    }
//                }
//            }
//        }
//    }

    /**
     * 这个方法用于回滚操作，等设计回滚或异常操作时候，再改它。
     *
     * @param task
     *            AbstractTask
     * @param pengine
     *            PEngine
     * @return
     * @throws Exception
     */
    public boolean changeInputStatusBackward(AbstractTask task, PEngine pengine) throws Exception {
        Transition[] inputs = task.getInputs();
        if (task.getIsParallelInput() == 1) {
            for (Transition input : inputs) {
                updateTransitionInstanceStatus(input, Transition.ENABLED, pengine.getInstance());
            }
            return true;
        } else {
            for (Transition input : inputs) {
                if (input.getStatus() == Transition.COMPLETED) {
                    updateTransitionInstanceStatus(input, Transition.ENABLED, pengine.getInstance());
                    AbstractTask source = (AbstractTask) input.getSource();
                    if (source.getIsParallelOutput() == 0) {
                        for (Transition output : source.getOutputs()) {
                            if (!output.equals(input)) {
                                if (output.getStatus() == Transition.UNUSED) {
                                    // 不符合条件
                                    updateTransitionInstanceStatus(output, Transition.ENABLED, pengine.getInstance());
                                    AbstractTask target = (AbstractTask) output.getTarget();
                                    updateTaskInstanceStatus(target, AbstractTask.ENABLED, pengine.getInstance());
                                    // 自动任务实例和非自动任务实例分别进入不同的激活队列。
                                    if (target instanceof ManualTaskInstance) {
                                        //setManualTaskInstanceCandidates((ManualTaskInstance) target,
                                        //        pengine.getInstance());
                                        if (((ManualTaskInstance) target).getEnabledTime() == -1)
                                            ((ManualTaskInstance) target).setEnabledTime(System.currentTimeMillis());
                                        pengine.getTaskQueues().putEnabledManuTask(target);
                                        TaskInstanceStarter.getInstance()
                                                .fetchManuTaskInstanceForward(target, pengine);
                                    } else {
                                        pengine.getTaskQueues().putEnabledAutoTask(target);
                                    }
                                }
                            }
                        }
                    }
                }
                return true;
            }
        }
        return false;
    }

    public boolean navigateBackOutputsForSingleSteping(AbstractTask task, PEngine pengine) {
        Transition[] outputs = task.getOutputs();
        if (outputs.length == 0)
            return true;
        for (Transition output : outputs) {
            updateTransitionInstanceStatus(output, Transition.UNUSED, pengine.getInstance());
            AbstractTask target = (AbstractTask) output.getTarget();
            updateTaskInstanceStatus(target, AbstractTask.UNUSED, pengine.getInstance());
        }
        return true;
    }
}
