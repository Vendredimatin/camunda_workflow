/**
 * 
 */
package edu.thss.platform.service.wfprocess.core.runtime.event;

import edu.thss.platform.service.wfprocess.core.TreeNode;
import edu.thss.platform.service.wfprocess.core.util.DateUtility;

import java.util.Calendar;
import java.util.Date;

/**
 * @author cdh
 * 
 */
public class Event extends TreeNode {

	/**
	 * serialVersionUID
	 */
	private static final long serialVersionUID = 5445665110680748152L;
	private int type;
	private String description;
	private Date timeStamp = Calendar.getInstance().getTime();

	/**
	 * 
	 */
	public Event() {
	}

	/**
	 * @return the type
	 */
	public int getType() {
		return type;
	}

	/**
	 * @param type
	 *            the type to set
	 */
	public void setType(int type) {
		this.type = type;
	}

	/**
	 * @return the description
	 */
	public String getDescription() {
		return description;
	}

	/**
	 * @param description
	 *            the description to set
	 */
	public void setDescription(String description) {
		this.description = description;
	}

	/**
	 * @return the timeStamp
	 */
	public Date getTimeStamp() {
		return timeStamp;
	}

	/**
	 * @param timeStamp
	 *            the timeStamp to set
	 */
	public void setTimeStamp(Date timeStamp) {
		this.timeStamp = timeStamp;
	}

	public String toString() {
		return DateUtility.formatTimeMilliseconds(getTimeStamp()) + " " + this.getClass().getName() + " - Event Type:"
				+ getType() + " Description:" + (getDescription() == null ? "No description" : getDescription());
	}
}
