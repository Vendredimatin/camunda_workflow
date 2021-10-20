package edu.thss.platform.service.wfprocess.runtime.engine.util;

import edu.thss.platform.service.wfprocess.core.buildtime.wfprocess.task.AbstractTask;
import edu.thss.platform.service.wfprocess.core.buildtime.wfprocess.task.SubprocessPoint;
import edu.thss.platform.service.wfprocess.core.runtime.event.Event;
import edu.thss.platform.service.wfprocess.core.runtime.event.EventLog;
import edu.thss.platform.service.wfprocess.core.runtime.event.TaskStatusChangedEvent;
import edu.thss.platform.service.wfprocess.core.runtime.event.WorkflowEvent;
import edu.thss.platform.service.wfprocess.core.runtime.wfprocess.task.*;
import edu.thss.platform.service.wfprocess.runtime.engine.ATEngine;
import edu.thss.platform.service.wfprocess.runtime.engine.MTEngine;
import edu.thss.platform.service.wfprocess.runtime.engine.NEngine;
import edu.thss.platform.service.wfprocess.runtime.engine.PEngine;
import edu.thss.platform.service.wfprocess.runtime.engine.transaction.*;
import edu.thss.platform.service.wfprocess.runtime.server.SaaSServer;

/**
 * @author Dahai Cao last updated on 20180228
 */
public class TaskInstanceStarter implements EventLog {

	private final static TaskInstanceStarter instance = new TaskInstanceStarter();

	private TaskInstanceStarter() {
	}

	public static TaskInstanceStarter getInstance() {
		return instance;
	}

	/**
	 * 这个方法推动引擎向前运行自动任务实例，并为每个任务实例创建事务， 然后将事务放入T引擎，将引擎提交到线程池执行。
	 * 
	 * @param ti
	 *            Task instance
	 * @param pe
	 *            PEngine
	 * @param subp
	 *            SubprocessPoint
	 * @throws Exception
	 */
	public void runAutoTaskInstanceForward(AbstractTask ti, PEngine pe, SubprocessPoint subp) throws Exception {
		if (ti == null || ti.getStatus() != AbstractTask.ENABLED)
			return;
		ATEngine runnable = null;
		if (ti instanceof StartPointInstance) {
			executeStartPointInstance(ti, pe, subp);
		} else if (ti instanceof EndPointInstance) {
			executeEndPointInstance(ti, pe, subp);
		} else if (ti instanceof SystemTaskInstance) {
			runnable = new ATEngine(new SystemTaskTransaction((SystemTaskInstance) ti, pe.getInstance()), pe);
		} else if (ti instanceof WaitTaskInstance) {
			runnable = new ATEngine(new WaitTaskTransaction((WaitTaskInstance) ti, pe.getInstance()), pe);
		} else if (ti instanceof AssignTaskInstance) {
			runnable = new ATEngine(new AssignTaskTransaction((AssignTaskInstance) ti, pe.getInstance()), pe);
		} else if (ti instanceof SubprocessPointInstance) {
			SubprocessPointTransaction transaction = new SubprocessPointTransaction((SubprocessPointInstance) ti, pe);
			runnable = new ATEngine(transaction, pe);
			transaction.setTEngine(runnable);
		} else if (ti instanceof EmailReceivingTaskInstance) {
			runnable = new ATEngine(new ReceiveEmailTaskTransaction((EmailReceivingTaskInstance) ti, pe.getInstance()),
					pe);
		} else if (ti instanceof EmailSendingTaskInstance) {
			runnable = new ATEngine(new SendEmailTaskTransaction((EmailSendingTaskInstance) ti, pe.getInstance()), pe);
		} else if (ti instanceof SMSReceivingTaskInstance) {
			runnable = new ATEngine(new ReceiveSMSTaskTransaction((SMSReceivingTaskInstance) ti, pe.getInstance()), pe);
		} else if (ti instanceof SMSSendingTaskInstance) {
			runnable = new ATEngine(new SendSMSTaskTransaction((SMSSendingTaskInstance) ti, pe.getInstance()), pe);
		}
		if (runnable != null) {
			SaaSServer.getInstance().getTransactionPool().submit(runnable);
		}
	}

	/**
	 * 这个方法推动引擎向前运行，启动一个事务线程，<br>
	 * 负责计算监听该非自动任务实例是否在处理期限内未被打开并处理 如果未被打开处理，则报警。
	 * 
	 * @param ti
	 *            Task instance
	 * @param pe
	 *            PEngine
	 * @throws Exception
	 */
	public void fetchManuTaskInstanceForward(AbstractTask ti, PEngine pe) throws Exception {
		if (ti == null || ti.getStatus() != AbstractTask.ENABLED)
			return;
		MTEngine runnable = null;
		if (ti instanceof ManualTaskInstance) {
			runnable = new MTEngine(new ActivateManualTaskTransaction((ManualTaskInstance) ti, pe), pe);
		}
		if (runnable != null) {
			SaaSServer.getInstance().getTransactionPool().submit(runnable);
		}
	}

	/**
	 * 
	 * @param ti
	 *            Task instance
	 * @param pe
	 *            PEngine
	 * @throws Exception
	 */
	public void completeManuTaskInstanceForward(AbstractTask ti, PEngine pe) throws Exception {
		if (ti == null || ti.getStatus() != AbstractTask.ENABLED)
			return;
		MTEngine runnable = null;
		if (ti instanceof ManualTaskInstance) {
			runnable = new MTEngine(new CompleteManualTaskTransaction((ManualTaskInstance) ti, pe), pe);
		}
		if (runnable != null) {
			SaaSServer.getInstance().getTransactionPool().submit(runnable);
		}
	}

	/**
	 * 这个方法推动引擎向前运行，启动一个事务线程，负责处理非自动任务实例， 然后将事务放入T引擎，将引擎提交到线程池执行。
	 * 
	 * @param ti
	 *            Task instance
	 * @param pe
	 *            PEngine
	 * @throws Exception
	 */
	public void runManuTaskInstanceForward(AbstractTask ti, PEngine pe) throws Exception {
		if (ti == null || ti.getStatus() != AbstractTask.RUNNING)
			return;
		MTEngine runnable = null;
		if (ti instanceof ManualTaskInstance) {
			runnable = new MTEngine(new ExecuteManualTaskTransaction((ManualTaskInstance) ti, pe), pe);
		}
		if (runnable != null) {
			SaaSServer.getInstance().getTransactionPool().submit(runnable);
		}
	}

	/**
	 * 执行起始任务。如果该起始任务为子流程起始点实例，则将子流程点的数据访问变量赋予子流程。
	 * 
	 * @param ti
	 *            Task instance
	 * @param pe
	 *            PEngine
	 * @param subp
	 *            SubprocessPoint
	 * @throws Exception
	 */
	private void executeStartPointInstance(AbstractTask ti, PEngine pe, SubprocessPoint subp) throws Exception {
		NEngine navigator = new NEngine();
		navigator.changeInputStatusForward(ti, pe);
		((StartPointInstance)ti).setStartTime(System.currentTimeMillis());
		ti.setStatus(AbstractTask.RUNNING);
		log(new TaskStatusChangedEvent(WorkflowEvent.TASK_RUNNED, ti, pe.getInstance()));
		ti.setStatus(AbstractTask.COMPLETED);
		((StartPointInstance)ti).setEndTime(System.currentTimeMillis());
		log(new TaskStatusChangedEvent(WorkflowEvent.TASK_COMPLETED, ti, pe.getInstance()));
		pe.getTaskQueues().completeAutoTask(ti);
		navigator.navigateForward(ti, pe);
		// storeCacheEvent();
	}

	/**
	 * 执行结束任务。如果此任务为子流程的结束点实例，那么该点实例负责将子流程所采集的数据回传到主流程中。
	 * 
	 * @param ti
	 *            Task instance
	 * @param pe
	 *            PEngine
	 * @param subp
	 *            SubprocessPoint
	 * @throws Exception
	 */
	private void executeEndPointInstance(AbstractTask ti, PEngine pe, SubprocessPoint subp) throws Exception {
		NEngine navigator = new NEngine();
		navigator.changeInputStatusForward(ti, pe);
		((EndPointInstance)ti).setStartTime(System.currentTimeMillis());
		ti.setStatus(AbstractTask.RUNNING);
		log(new TaskStatusChangedEvent(WorkflowEvent.TASK_RUNNED, ti, pe.getInstance()));
		// you can add other operations in this task.
		ti.setStatus(AbstractTask.COMPLETED);
		((EndPointInstance)ti).setEndTime(System.currentTimeMillis());
		log(new TaskStatusChangedEvent(WorkflowEvent.TASK_COMPLETED, ti, pe.getInstance()));
		pe.getTaskQueues().completeAutoTask(ti);
	}

	@Override
	public void log(Event event) {
		System.out.println(event.toString());
	}

}
