/**
 * 
 */
package edu.thss.platform.service.wfprocess.runtime.engine.transaction;

import edu.thss.platform.service.wfprocess.core.buildtime.wfprocess.WfProcessStatus;
import edu.thss.platform.service.wfprocess.core.buildtime.wfprocess.task.AbstractTask;
import edu.thss.platform.service.wfprocess.core.buildtime.wfprocess.task.TaskStatus;
import edu.thss.platform.service.wfprocess.core.runtime.wfprocess.task.ManualTaskInstance;
import edu.thss.platform.service.wfprocess.core.runtime.wfprocess.task.ManualTaskInstancePhase;
import edu.thss.platform.service.wfprocess.runtime.engine.PEngine;
import edu.thss.platform.service.wfprocess.runtime.engine.util.TaskInstanceStarter;

/**
 * @author Caodahai created on 2016-11-05, last updated on 2018-03-07
 *
 */
public class ExecuteManualTaskTransaction extends AbstractTaskTransaction<ManualTaskInstance> {

	/**
	 * serialVersionUID
	 */
	private static final long serialVersionUID = -1925583170755963684L;
	// private String tempId = null;
	private PEngine pengine = null;

	public ExecuteManualTaskTransaction(ManualTaskInstance task, PEngine pengine) {
		super(task, pengine.getInstance());
		this.pengine = pengine;
	}

	@Override
	public void begin() throws Exception {
	}

	@Override
	public void commit() throws Exception {
//		System.out.println(">>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>7");
		while (taskInstance.getPhase() == ManualTaskInstancePhase.FETCHED_BUT_NOT_SUBMIT) {
//			System.out.println(">>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>8");
			if (taskInstance.getAlarmDateTime() != -1) {

			}
			if (taskInstance.getExpiryDateTime() != -1
					&& taskInstance.getExpiryDateTime() < System.currentTimeMillis()) {
//				// 在这里启动异常处理流程，或者让任务进入异常状态
//				taskInstance.setStatus(TaskStatus.EXCEPTION);
//				// 导致流程也进入挂起状态。
//				this.pengine.getInstance().setStatus(WfProcessStatus.SUSPENDED);
//				throw new Exception("任务执行超时未提交");
				
				taskInstance.setEndTime(System.currentTimeMillis());
				//taskInstance.setSubmitterId("");
				//taskInstance.setSubmitterIp("");
				//taskInstance.setSubmitter("");
				taskInstance.setPhase(ManualTaskInstancePhase.SUBMITTED);
				// mark this task as automatically submitting task
				taskInstance.setAutoSubmitted(1);
			}
			Thread.sleep(1000);
		}
		if (taskInstance.getPhase() == ManualTaskInstancePhase.SUBMITTED) {
			System.out.println(">>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>9");
			TaskInstanceStarter.getInstance().completeManuTaskInstanceForward((ManualTaskInstance) taskInstance,
					pengine);

		} else if (taskInstance.getPhase() == ManualTaskInstancePhase.RETURNED) {
			System.out.println(">>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>10");
			taskInstance.resetRuntimeProps();
			taskInstance.setStatus(AbstractTask.ENABLED);
			taskInstance.setPhase(ManualTaskInstancePhase.WAIT_FOR_FETCHING);
			//this.pengine.getTaskQueues().returntoEnabledManuTask(taskInstance, pengine);
			// 重新启动一个事务线程，来等待打开。
			TaskInstanceStarter.getInstance().fetchManuTaskInstanceForward((ManualTaskInstance) taskInstance, pengine);
		}
	}

	@Override
	public void rollback() throws Exception {

	}

}
