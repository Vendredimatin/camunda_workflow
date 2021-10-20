/**
 * 
 */
package edu.thss.platform.service.wfprocess.runtime.engine;

import edu.thss.platform.service.wfprocess.core.WorkflowEntity;
import edu.thss.platform.service.wfprocess.core.buildtime.wfprocess.Transition;
import edu.thss.platform.service.wfprocess.core.buildtime.wfprocess.task.AbstractTask;
import edu.thss.platform.service.wfprocess.core.runtime.event.Event;
import edu.thss.platform.service.wfprocess.core.runtime.event.EventLog;
import edu.thss.platform.service.wfprocess.core.runtime.event.TransactionEvent;
import edu.thss.platform.service.wfprocess.core.runtime.event.WorkflowEvent;
import edu.thss.platform.service.wfprocess.core.runtime.wfprocess.WfProcessInstance;
import edu.thss.platform.service.wfprocess.core.runtime.wfprocess.task.ManualTaskInstance;
import edu.thss.platform.service.wfprocess.core.runtime.wfprocess.task.ManualTaskInstancePhase;
import edu.thss.platform.service.wfprocess.runtime.engine.transaction.AbstractTaskTransaction;
import edu.thss.platform.service.wfprocess.runtime.engine.transaction.Transaction;

import java.io.ByteArrayOutputStream;
import java.io.PrintStream;
import java.util.concurrent.Callable;

/**
 * @author Cao Dahai lastupdated on 2018-01-31
 * 
 */
public class MTEngine implements Callable<AbstractTaskTransaction<?>>, EventLog {

	private PEngine pengine;
	private NEngine nengine;
	protected AbstractTaskTransaction<?> taskTransaction;
	private long threadId = -1;


	public MTEngine(AbstractTaskTransaction<?> transaction, PEngine pengine) {
		this.taskTransaction = transaction;
		this.pengine = pengine;
		this.nengine = getNavigator();
	}

	public AbstractTaskTransaction<?> call() {
		try {
			System.out.println("test: bug" + this.taskTransaction.getTaskInstance().getId() + " " + ((ManualTaskInstance) this.taskTransaction.getTaskInstance())
					.getPhase());
			setThreadId(Thread.currentThread().getId());
			this.taskTransaction.begin();
			setStatus(Transaction.PREPARED);
			if (((ManualTaskInstance) this.taskTransaction.getTaskInstance())
					.getPhase() == ManualTaskInstancePhase.WAIT_FOR_FETCHING
					|| ((ManualTaskInstance) this.taskTransaction.getTaskInstance())
							.getPhase() == ManualTaskInstancePhase.FETCHED_BUT_NOT_SUBMIT) {
				this.taskTransaction.commit();
				setStatus(Transaction.COMMITTED);
			}
			if (((ManualTaskInstance) this.taskTransaction.getTaskInstance())
					.getPhase() == ManualTaskInstancePhase.SUBMITTED) {
				//handleInputTransitions();// 已经处于提交阶段，就不应该再处理输入变迁的状态了。
				setStatus(Transaction.COMMITTED);
				handleOutputTransitions();
			}
		} catch (Exception e) {
			try {
				this.pengine.getTaskQueues().throwsManuTask(getTaskInstance());
			} catch (Exception e1) {
				e1.printStackTrace();
				handleException(e);
			}
		}
		return taskTransaction;
	}

	public void rollback() throws Exception {
		handleBackOutputTransitions();
		this.taskTransaction.rollback();
		handleBackInputTransitions();
		// consuming an exceptional task, producing an enabled task
		this.pengine.getTaskQueues().rollbackManuTask(getTaskInstance());
		setStatus(Transaction.ROLLEDBACK);
		commitTransactionEvent(WorkflowEvent.TRANSACTION_ROLLBACK, pengine.getInstance(), getTaskInstance());
	}

	/**
	 * 
	 * @param e
	 */
	public void handleException(Exception e) {
		getTaskInstance().setStatus(AbstractTask.EXCEPTION);
		ByteArrayOutputStream bos = new ByteArrayOutputStream();
		PrintStream ps = new PrintStream(bos);
		e.printStackTrace(ps);
	}

	public void updateStatus(WorkflowEntity entity, int status) {
		System.out.println("test bug status:" + entity.getId() + " " + status );
		if (entity instanceof Transition) {
			System.out.println("test bug status 1");
			((Transition) entity).setStatus(status);

		} else if (entity instanceof AbstractTask) {
			System.out.println("test bug status: 2");
			((AbstractTask) entity).setStatus(status);
		}
	}

	/**
	 * 
	 * @throws Exception
	 */
	public void handleInputTransitions() throws Exception {
		if (getNavigator().changeInputStatusForward(getTaskInstance(), this.pengine)) {
			updateStatus(getTaskInstance(), AbstractTask.RUNNING);
			commitTransactionEvent(WorkflowEvent.TRANSACTION_STARTED, pengine.getInstance(), getTaskInstance());
		}
	}

	/**
	 * 
	 * @throws Exception
	 */
	public void handleOutputTransitions() throws Exception {
		System.out.println("test bug:" + getTaskInstance().getId() + " " + getTaskInstance().getStatus());
		if (getTaskInstance().getStatus() == AbstractTask.RUNNING) {
			updateStatus(getTaskInstance(), AbstractTask.COMPLETED);
			commitTransactionEvent(WorkflowEvent.TRANSACTION_COMPLETED, pengine.getInstance(), getTaskInstance());
			// producing firstly.
			getNavigator().navigateForward(getTaskInstance(), this.pengine);
			// consuming afterwards.
			this.pengine.getTaskQueues().completeManuTask(getTaskInstance());
			// storeCacheEvent(process);
		} else {
			handleException(new Exception("Incorrect task status"));
		}
	}

	public NEngine getNavigator() {
		if (this.nengine == null) {
			this.nengine = new NEngine();
		}
		return this.nengine;
	}

	public void handleBackInputTransitions() throws Exception {
		getNavigator().changeInputStatusBackward(getTaskInstance(), this.pengine);
	}

	public void handleBackOutputTransitions() throws Exception {
		getNavigator().navigateBackOutputsForSingleSteping(getTaskInstance(), this.pengine);
	}

	public void terminate() throws Throwable {
		// this.stop(new ThreadDeath());
	}

	private void commitTransactionEvent(int event, WfProcessInstance process, AbstractTask task) {
		log(new TransactionEvent(event, process, task));
	}

	/**
	 * @return
	 * @return the task instance
	 */
	public AbstractTask getTaskInstance() {
		return this.taskTransaction.getTaskInstance();
	}

	/**
	 * @return the status
	 */
	public int getStatus() {
		return this.taskTransaction.getStatus();
	}

	/**
	 * @param status
	 *            the status to set
	 */
	protected void setStatus(int status) {
		this.taskTransaction.setStatus(status);
	}

	public String toString() {
		return getTaskInstance().getName();
	}

	@Override
	public void log(Event event) {
		System.out.println(event.toString());
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

}
