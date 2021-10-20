/**
 * 
 */
package edu.thss.platform.service.wfprocess.core.runtime.event;

import edu.thss.platform.service.wfprocess.core.buildtime.wfprocess.Transition;
import edu.thss.platform.service.wfprocess.core.buildtime.wfprocess.task.AbstractTask;
import edu.thss.platform.service.wfprocess.core.runtime.wfprocess.WfProcessInstance;

/**
 * @author cdh
 * 
 */
public class TransitionStatusChangedEvent extends WorkflowEvent {

	/**
	 * serialVersionUID
	 */
	private static final long serialVersionUID = 4810651986863879799L;

	/**
	 * 
	 */
	public TransitionStatusChangedEvent() {
		super();
	}

	/**
	 * Transition status changed event.
	 * 
	 * @param type
	 * @param eventSource
	 * @param eventOwner
	 */
	public TransitionStatusChangedEvent(int type, Transition eventSource, WfProcessInstance eventOwner) {
		super();
		this.setType(type);
		this.setEventSourceId(eventSource.getId());
		this.setStatus(eventSource.getStatus());
		String eventName = eventOwner.getName() + "(" + eventOwner.getVersion() + ")" + "."
				+ ((AbstractTask) eventSource.getSource()).getName() + "->" + eventSource.getName() + "->"
				+ ((AbstractTask) eventSource.getTarget()).getName();
		this.setName(eventName);
		if (type == TRANSITION_ENABLED)
			eventName = eventName + " enabled.";
		else if (type == TRANSITION_COMPLETED)
			eventName = eventName + " completed.";
		else if (type == TRANSITION_UNUSED)
			eventName = eventName + " unused.";
		else if (type == TRANSITION_EXCEPTION)
			eventName = eventName + " has exception!";
		this.setDescription(eventName);
		this.setParent(eventOwner.getId());
		this.setCurrOwner(eventOwner.getCurrOwner());
		this.setOwner(eventSource.getOwner());
	}
}
