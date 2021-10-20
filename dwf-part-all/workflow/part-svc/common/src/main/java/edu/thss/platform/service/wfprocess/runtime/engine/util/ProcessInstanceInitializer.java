package edu.thss.platform.service.wfprocess.runtime.engine.util;

import edu.thss.platform.service.wfprocess.core.TreeNode;
import edu.thss.platform.service.wfprocess.core.WorkflowEntity;
import edu.thss.platform.service.wfprocess.core.antlr.evaluation.EvalExprCalculatorUtil;
import edu.thss.platform.service.wfprocess.core.buildtime.wfprocess.Transition;
import edu.thss.platform.service.wfprocess.core.buildtime.wfprocess.task.AbstractTask;
import edu.thss.platform.service.wfprocess.core.buildtime.wfprocess.task.Assignment;
import edu.thss.platform.service.wfprocess.core.data.Constant;
import edu.thss.platform.service.wfprocess.core.data.FileConstant;
import edu.thss.platform.service.wfprocess.core.data.expression.Expression;
import edu.thss.platform.service.wfprocess.core.data.variable.AccessibleVariable;
import edu.thss.platform.service.wfprocess.core.data.variable.ArrayDataVariable;
import edu.thss.platform.service.wfprocess.core.data.variable.DataVariable;
import edu.thss.platform.service.wfprocess.core.runtime.event.Event;
import edu.thss.platform.service.wfprocess.core.runtime.event.EventLog;
import edu.thss.platform.service.wfprocess.core.runtime.event.ProcessStatusChangedEvent;
import edu.thss.platform.service.wfprocess.core.runtime.event.WorkflowEvent;
import edu.thss.platform.service.wfprocess.core.runtime.wfprocess.WfProcessInstance;
import edu.thss.platform.service.wfprocess.core.runtime.wfprocess.task.*;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Map;

/**
 * @author Dahai Cao last updated on 20180228
 */
public class ProcessInstanceInitializer implements EventLog {

    private final static ProcessInstanceInitializer instance = new ProcessInstanceInitializer();

    private ProcessInstanceInitializer() {
    }

    public static ProcessInstanceInitializer getInstance() {
        return instance;
    }

    /**
     * 初始化实例的所有数据，并设置所有的任务实例的状态，设置完成后，实例处于可运行状态。
     *
     * @param pi          process instance object
     * @param userId        the user object which launches this process instance
     * @param ipv4        IP v4 address
     * @param ipv6        IP v6 address
     * @param paramvalues the parameters
     * @throws Exception
     * @author Dahai Cao created on 2011-09-11 下午11:39:56, last updated on
     * 20180228
     */
    public void initialize(WfProcessInstance pi,
                           String userId,
                           String username,
                           String ipv4,
                           String ipv6,
                           String svrIp,
                           Map<String, Object> paramvalues) throws Exception {
        pi.setVer(System.currentTimeMillis());
        pi.setStartTime(System.currentTimeMillis());
        pi.setTerminationTime(0);
        pi.setEndTime(0);
        pi.setLastupdate(System.currentTimeMillis());
        pi.setLaunchUser(username);
        pi.setLaunchUserId(userId);
        pi.addInvitation(username,userId);
        StartPointInstance si = getStartPointTask(pi);
//      最原工作流使用
//        if (paramvalues != null && !paramvalues.isEmpty()) {
//            // 获取参数数值，并把参数值传入到过程（流程）数据变量中
//            for (String s : paramvalues.keySet()) {
//                for (TreeNode child : pi.getChildren()) {
//                    if (child instanceof DataVariable && ((DataVariable) child).getDefinitionId().equals(s)) {
//                        initializeAccessibleVariables(si, child, s, pi, paramvalues);
//                    }
//                }
//            }
//        }
        // 现工作流
        for (TreeNode child : pi.getChildren()) {
            if (child instanceof DataVariable) {
                Object v = paramvalues.get(((DataVariable)child).getName());
                ProcessInstanceSaver.getInstance().saveDataVariable(v, child);
            }
        }

        // initialize the process instance
        for (TreeNode child : pi.getChildren()) {
            if (child instanceof AbstractTask) {
                ((AbstractTask) child).setStatus(AbstractTask.UNUSED);
                for (Transition t : ((AbstractTask) child).getOutputs()) {
                    t.setStatus(Transition.UNUSED);
                }
            }
        }


        log(new ProcessStatusChangedEvent(WorkflowEvent.PROCESS_INITIATED, pi));
        // 更新完内存中数据变量数据后，更新缓存数据。
        ProcessInstanceSaver.getInstance().saveCache(pi);
    }


    public void reinitialize(WfProcessInstance pi,
                             String ipv4,
                             String ipv6,
                             String svrIp,
                             Map<String, Object> paramvalues) throws Exception {
        pi.setVer(System.currentTimeMillis());
        pi.setStartTime(System.currentTimeMillis());
        pi.setEndTime(0);
        pi.setSuspensionTime(0);
        pi.setUpdateTime(0);
        pi.setTerminationTime(0);
        pi.setLastupdate(System.currentTimeMillis());

        StartPointInstance si = getStartPointTask(pi);
        if (paramvalues != null && !paramvalues.isEmpty()) {
            // 获取参数数值，并把参数值传入到过程（流程）数据变量中
            for (String s : paramvalues.keySet()) {
                for (TreeNode child : pi.getChildren()) {
                    if (child instanceof DataVariable &&
                            ((DataVariable) child).getId().equals(s)) {
                        initializeAccessibleVariables(si, child, s, pi, paramvalues);
                    }
                }
            }
        }

        // initialize the process instance
        for (TreeNode child : pi.getChildren()) {
            if (child instanceof AbstractTask) {
                if (child instanceof ManualTaskInstance) {
                    ((ManualTaskInstance) child).setPhase(ManualTaskInstancePhase.DEFAULT);
                    ((ManualTaskInstance) child).setPriority(ManualTaskInstancePriority.DEFAULT);
                }
                ((AbstractTask) child).setStatus(AbstractTask.UNUSED);
                for (Transition t : ((AbstractTask) child).getOutputs()) {
                    t.setStatus(Transition.UNUSED);
                }
            }
        }
        log(new ProcessStatusChangedEvent(WorkflowEvent.PROCESS_INITIATED, pi));
        // 更新完内存中数据变量数据后，更新缓存数据。
        ProcessInstanceSaver.getInstance().saveCache(pi);

    }


    private void initializeAccessibleVariables(StartPointInstance si,
                                               TreeNode child,
                                               String val,
                                               WfProcessInstance pi,
                                               Map<String, Object> paramvalues) {
        for (AccessibleVariable ac : si.getAccessibleVars()) {
            // 判断改变量是否可编辑（是否可修改/可写）。0：不可，1：可写
            if (ac.getVarId().equals(child.getId()) && ac.getAccessControl() == 1) {
                TreeNode n = pi.seekByID(ac.getVarId());
                Object v = paramvalues.get(val);
                ProcessInstanceSaver.getInstance().saveDataVariable(v, n);
            }
        }
    }


    /**
     * Initializing subprocess data variables
     *
     * @param task
     * @param mainWfProcessInstance
     * @throws Exception
     */
    public void initializeSubprocessInputs(SubprocessPointInstance task,
                                           WfProcessInstance mainWfProcessInstance) throws Exception {
        // get the subprocess input assignments
        for (Assignment assignment : task.getSubprocessInputs()) {
            if (assignment.getVariable() instanceof ArrayDataVariable) {
                // subprocess instance variable is an array data variable
                ArrayDataVariable var = (ArrayDataVariable) assignment.getVariable();
                // calculating the assignment's expression which is composed by
                // main process instance variables
                WorkflowEntity e = EvalExprCalculatorUtil.computeValue((Expression) assignment.getValue(),
                        mainWfProcessInstance);
                if (var.getValues() == null) {
                    var.setValues(new Constant[0]);
                }
                Object[] values = (Object[]) var.getValues();
                int i = assignment.getArrayIndex();
                if (i >= 0 && values.length > i) {
                    if (e instanceof ArrayDataVariable) {
                        if (((ArrayDataVariable) e).getValues() != null) {
                            Constant[] cs = (Constant[]) ((ArrayDataVariable) e).getValues();
                            if (cs.length > 0) {
                                List<Object> list = Arrays.asList(values);
                                list = new ArrayList<Object>(list);
                                for (int j = 0; j < cs.length; j++) {
                                    list.add(i + 1, convert(cs[j], mainWfProcessInstance, task.fetchSubprocess()));
                                    i++;
                                }
                                var.setValues(list.toArray(new Constant[list.size()]));
                            }
                        }
                    } else if (e instanceof DataVariable) {
                        if (((DataVariable) e).getValue() != null) {
                            values[i] = convert((Constant) ((DataVariable) e).getValue(), mainWfProcessInstance,
                                    task.fetchSubprocess());
                        }
                    } else if (e instanceof Constant) {
                        values[i] = convert((Constant) ((DataVariable) e).getValue(), mainWfProcessInstance,
                                task.fetchSubprocess());
                    }
                } else { // arrayIndex = -1 这时候表明数组有可能是空数组，或者就是要给整个数组赋值
                    if (e instanceof ArrayDataVariable) { // e 是赋值表达式的计算结果
                        if (((ArrayDataVariable) e).getValues() != null) {
                            // 如果赋值的是数组变量，那么将其数组中的所有元素添加到被赋值数组中。
                            Constant[] cs = (Constant[]) ((ArrayDataVariable) e).getValues();
                            if (cs.length > 0) {
                                if (values.length > 0) {
                                    // 被赋值数组是：非空数组
                                    List<Object> list = Arrays.asList(values);
                                    list = new ArrayList<Object>(list);
                                    for (int j = 0; j < cs.length; j++) {
                                        list.add(convert((Constant) cs[j], mainWfProcessInstance,
                                                task.fetchSubprocess()));
                                    }
                                    var.setValues(list.toArray(new Constant[list.size()]));
                                } else {
                                    // 被赋值数组是：空数组
                                    List<Constant> list = new ArrayList<Constant>();
                                    for (int j = 0; j < cs.length; j++) {
                                        list.add(convert((Constant) cs[j], mainWfProcessInstance,
                                                task.fetchSubprocess()));
                                    }
                                    var.setValues(list.toArray(new Constant[list.size()]));
                                }
                            }
                        }
                    } else if (e instanceof DataVariable) {
                        if (((DataVariable) e).getValue() != null
                                && ((DataVariable) e).getValue() instanceof Constant) {
                            Object o = ((DataVariable) e).getValue();
                            if (values.length > 0) {
                                // 被赋值数组是：非空数组
                                List<Object> list = Arrays.asList(values);
                                list = new ArrayList<Object>(list);
                                list.add(convert((Constant) o, mainWfProcessInstance, task.fetchSubprocess()));
                                var.setValues(list.toArray(new Object[list.size()]));
                            } else {
                                // 被赋值数组是：空数组
                                Object[] cs1 = new Object[1];
                                cs1[0] = convert((Constant) o, mainWfProcessInstance, task.fetchSubprocess());
                                ((ArrayDataVariable) var).setValues(cs1);
                            }
                        }
                    } else if (e instanceof Constant) {
                        if (values.length > 0) {
                            // 被赋值数组是非空数组
                            List<Object> list = Arrays.asList(values);
                            list = new ArrayList<Object>(list);
                            list.add(convert((Constant) e, mainWfProcessInstance, task.fetchSubprocess()));
                            var.setValues(list.toArray(new Object[list.size()]));
                        } else {
                            // 被赋值数组是空数组
                            Object[] cs1 = new Object[1];
                            cs1[0] = convert((Constant) e, mainWfProcessInstance, task.fetchSubprocess());
                            ((ArrayDataVariable) var).setValues(cs1);
                        }
                    }
                }
            } else if (assignment.getVariable() instanceof DataVariable) {
                DataVariable var = (DataVariable) assignment.getVariable();
                if (assignment.getValue() != null) {
                    if (assignment.getValue() instanceof Expression) {
                        WorkflowEntity e = EvalExprCalculatorUtil.computeValue((Expression) assignment.getValue(),
                                mainWfProcessInstance);
                        if (e instanceof ArrayDataVariable) {
                            if (((ArrayDataVariable) e).getValues() != null) {
                                Constant[] cs = (Constant[]) ((ArrayDataVariable) e).getValues();
                                if (cs.length > 0) { // 暂时做这么做，因为这是一个类型不兼容情况，是需要报错的。
                                    Constant c = convert((Constant) cs[0], mainWfProcessInstance,
                                            task.fetchSubprocess());
                                    var.setValue(c);
                                }
                            }
                        } else if (e instanceof DataVariable) {
                            if (((DataVariable) e).getValue() != null) {
                                if (((DataVariable) e).getValue() instanceof Constant) {
                                    Constant c = convert((Constant) ((DataVariable) e).getValue(),
                                            mainWfProcessInstance, task.fetchSubprocess());
                                    var.setValue(c);
                                }
                            }
                        } else if (e instanceof Constant) {
                            Constant c = convert((Constant) e, mainWfProcessInstance, task.fetchSubprocess());
                            var.setValue(c);
                        }
                    }
                }
            }
        }
    }

    public void fetchSubprocessOutputs(SubprocessPointInstance task,
                                       WfProcessInstance mainWfProcessInstance) throws Exception {
        // get the subprocess output assignments
        for (Assignment assignment : task.getSubprocessOutputs()) {
            if (assignment.getVariable() instanceof ArrayDataVariable) {
                // main process instance variable is an array data variable
                ArrayDataVariable var = (ArrayDataVariable) assignment.getVariable();
                // calculating the assignment's expression which is composed by
                // subprocess instance variables
                WorkflowEntity e = EvalExprCalculatorUtil.computeValue((Expression) assignment.getValue(),
                        task.fetchSubprocess());
                if (var.getValues() == null) {
                    var.setValues(new Constant[0]);
                }
                Object[] values = (Object[]) var.getValues();
                int i = assignment.getArrayIndex();
                if (i >= 0 && values.length > i) {
                    if (e instanceof ArrayDataVariable) {
                        if (((ArrayDataVariable) e).getValues() != null) {
                            Constant[] cs = (Constant[]) ((ArrayDataVariable) e).getValues();
                            if (cs.length > 0) {
                                List<Object> list = Arrays.asList(values);
                                list = new ArrayList<Object>(list);
                                for (int j = 0; j < cs.length; j++) {
                                    list.add(i + 1, convert(cs[j], task.fetchSubprocess(), mainWfProcessInstance));
                                    i++;
                                }
                                var.setValues(list.toArray(new Constant[list.size()]));
                            }
                        }
                    } else if (e instanceof DataVariable) {
                        if (((DataVariable) e).getValue() != null) {
                            values[i] = convert((Constant) ((DataVariable) e).getValue(), task.fetchSubprocess(),
                                    mainWfProcessInstance);
                        }
                    } else if (e instanceof Constant) {
                        values[i] = convert((Constant) ((DataVariable) e).getValue(), task.fetchSubprocess(),
                                mainWfProcessInstance);
                    }
                } else { // arrayIndex = -1 这时候表明数组有可能是空数组，或者就是要给整个数组赋值
                    if (e instanceof ArrayDataVariable) { // e 是赋值表达式的计算结果
                        if (((ArrayDataVariable) e).getValues() != null) {
                            // 如果赋值的是数组变量，那么将其数组中的所有元素添加到被赋值数组中。
                            Constant[] cs = (Constant[]) ((ArrayDataVariable) e).getValues();
                            if (cs.length > 0) {
                                if (values.length > 0) {
                                    // 被赋值数组是：非空数组
                                    List<Object> list = Arrays.asList(values);
                                    list = new ArrayList<Object>(list);
                                    for (int j = 0; j < cs.length; j++) {
                                        list.add(convert((Constant) cs[j], task.fetchSubprocess(),
                                                mainWfProcessInstance));
                                    }
                                    var.setValues(list.toArray(new Constant[list.size()]));
                                } else {
                                    // 被赋值数组是：空数组
                                    List<Constant> list = new ArrayList<Constant>();
                                    for (int j = 0; j < cs.length; j++) {
                                        list.add(convert((Constant) cs[j], task.fetchSubprocess(),
                                                mainWfProcessInstance));
                                    }
                                    var.setValues(list.toArray(new Constant[list.size()]));
                                }
                            }
                        }
                    } else if (e instanceof DataVariable) {
                        if (((DataVariable) e).getValue() != null
                                && ((DataVariable) e).getValue() instanceof Constant) {
                            Object o = ((DataVariable) e).getValue();
                            if (values.length > 0) {
                                // 被赋值数组是：非空数组
                                List<Object> list = Arrays.asList(values);
                                list = new ArrayList<Object>(list);
                                list.add(convert((Constant) o, task.fetchSubprocess(), mainWfProcessInstance));
                                var.setValues(list.toArray(new Object[list.size()]));
                            } else {
                                // 被赋值数组是：空数组
                                Object[] cs1 = new Object[1];
                                cs1[0] = convert((Constant) o, task.fetchSubprocess(), mainWfProcessInstance);
                                ((ArrayDataVariable) var).setValues(cs1);
                            }
                        }
                    } else if (e instanceof Constant) {
                        if (values.length > 0) {
                            // 被赋值数组是非空数组
                            List<Object> list = Arrays.asList(values);
                            list = new ArrayList<Object>(list);
                            list.add(convert((Constant) e, task.fetchSubprocess(), mainWfProcessInstance));
                            var.setValues(list.toArray(new Object[list.size()]));
                        } else {
                            // 被赋值数组是空数组
                            Object[] cs1 = new Object[1];
                            cs1[0] = convert((Constant) e, task.fetchSubprocess(), mainWfProcessInstance);
                            ((ArrayDataVariable) var).setValues(cs1);
                        }
                    }
                }
            } else if (assignment.getVariable() instanceof DataVariable) {
                DataVariable var = (DataVariable) assignment.getVariable();
                if (assignment.getValue() != null) {
                    if (assignment.getValue() instanceof Expression) {
                        WorkflowEntity e = EvalExprCalculatorUtil.computeValue((Expression) assignment.getValue(),
                                task.fetchSubprocess());
                        if (e instanceof ArrayDataVariable) {
                            if (((ArrayDataVariable) e).getValues() != null) {
                                Constant[] cs = (Constant[]) ((ArrayDataVariable) e).getValues();
                                if (cs.length > 0) { // 暂时做这么做，因为这是一个类型不兼容情况，是需要报错的。
                                    Constant c = convert((Constant) cs[0], task.fetchSubprocess(),
                                            mainWfProcessInstance);
                                    var.setValue(c);
                                }
                            }
                        } else if (e instanceof DataVariable) {
                            if (((DataVariable) e).getValue() != null) {
                                if (((DataVariable) e).getValue() instanceof Constant) {
                                    Constant c = convert((Constant) ((DataVariable) e).getValue(),
                                            task.fetchSubprocess(), mainWfProcessInstance);
                                    var.setValue(c);
                                }
                            }
                        } else if (e instanceof Constant) {
                            Constant c = convert((Constant) e, task.fetchSubprocess(), mainWfProcessInstance);
                            var.setValue(c);
                        }
                    }
                }
            }
        }
    }

    private Constant convert(Constant srcConstant,
                             WfProcessInstance srcInstance,
                             WfProcessInstance tgtInstance)
            throws Exception {
        Object c = srcConstant.clone(srcInstance);
        if (c instanceof FileConstant) {
            copyFileConstant((FileConstant) c, tgtInstance);
        }
        return (Constant) c;
    }

    private void copyFileConstant(FileConstant fc,
                                  WfProcessInstance target) throws Exception {
//        String ver = SystemConfig.getProp("xq.product.pversion");
//        if (ver.equals("1")) { // 单机版
//            RTFileObjectAccessor.copyLocalFileObject(fc, target.getOwner(), target.getId());
//        } else if (ver.equals("2") || ver.equals("3")) { // 私有云版/公有云版
//            HttpClientBuilder builder = HttpClientBuilder.create();
//            CloseableHttpClient httpClient = builder.build();
//            // cp the File constant to subprocess instance
//            InputStream in = RTFileObjectAccessor.fetchFileObject(httpClient, fc);
//            fc.setOwner(target.getOwner());
//            fc.setCurrOwner(target.getId());
//            RTFileObjectAccessor.putFileObject(fc, in, 0);
//        }
    }

    /**
     * @return
     * @author Dahai CAO
     * @date 10/06/2011 11:53:11 AM
     */
    public StartPointInstance getStartPointTask(WfProcessInstance process) {
        TreeNode[] nodes = process.getChildren();
        for (int i = 0; i < nodes.length; i++)
            if (nodes[i] instanceof StartPointInstance)
                return (StartPointInstance) nodes[i];
        return null;
    }

    public void log(Event event) {
        System.out.println(event.toString());
    }
}
