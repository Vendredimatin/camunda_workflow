/**
 * 
 */
package edu.thss.platform.service.wfprocess.core.buildtime.wfprocess.task;

import edu.thss.platform.service.wfprocess.core.data.variable.AccessibleVariable;

/**
 * @author Administrator
 * 
 */
public class EndPoint extends AbstractTask {

	/**
	 * serialVersionUID
	 */
	private static final long serialVersionUID = -1727145241172472178L;
	// 0: end form; 1: end UI url
	private int endUIType = 0;
	// end form content (process end page) for process accessing
	private String endFormContent = null;
	private String endFormName = null;
	private String endUIUrl = null;
	private String endOperation = null;
	private AccessibleVariable[] accessibleVars = new AccessibleVariable[0];
	private String processId = null;


	/**
	 * 
	 */
	public EndPoint() {
		setName("End Point");
		setClasstypename(this.getClass().getSimpleName());
	}

	public String getEndOperation() { return endOperation; }

	public void setEndOperation(String endOperation) { this.endOperation = endOperation; }

	public String getEndFormName() {
		return endFormName;
	}

	public void setEndFormName(String endFormName) {
		this.endFormName = endFormName;
	}

	/**
	 * @return the endUIType
	 */
	public int getEndUIType() {
		return endUIType;
	}

	/**
	 * @param endUIType
	 *            the endUIType to set
	 */
	public void setEndUIType(int endUIType) {
		this.endUIType = endUIType;
	}

	/**
	 * @return the endFormContent
	 */
	public String getEndFormContent() {
		return endFormContent;
	}

	/**
	 * @param endFormContent
	 *            the endFormContent to set
	 */
	public void setEndFormContent(String endFormContent) {
		this.endFormContent = endFormContent;
	}

	/**
	 * @return the endUIUrl
	 */
	public String getEndUIUrl() {
		return endUIUrl;
	}

	/**
	 * @param endUIUrl
	 *            the endUIUrl to set
	 */
	public void setEndUIUrl(String endUIUrl) {
		this.endUIUrl = endUIUrl;
	}

	/**
	 * @return the accessibleVars
	 */
	public AccessibleVariable[] getAccessibleVars() {
		return accessibleVars;
	}

	/**
	 * @param accessibleVars
	 *            the accessibleVars to set
	 */
	public void setAccessibleVars(AccessibleVariable[] accessibleVars) {
		this.accessibleVars = accessibleVars;
	}

	public String getProcessId() {
		return processId;
	}

	public void setProcessId(String processId) {
		this.processId = processId;
	}
}
