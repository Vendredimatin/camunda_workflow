/**
 * 
 */
package edu.thss.platform.service.wfprocess.core.buildtime.wfprocess.task;

import edu.thss.platform.service.wfprocess.core.data.variable.AccessibleVariable;

/**
 * @author Dahai Cao 2008-09-09
 * 
 */
public class StartPoint extends AbstractTask {

	/**
	 * serialVersionUID
	 */
	private static final long serialVersionUID = 5638968420238537831L;
	// 0: launch form; 1: launch UI url
	private int launchUIType = 0;
	// launch form content (process home page) for process accessing
	private String launchFormName = null;
	private String launchFormContent = null;
	private String launchUIUrl = null;

	private AccessibleVariable[] accessibleVars = new AccessibleVariable[0]; 
	private String startOperation = null;
	/**
	 * 
	 */
	public StartPoint() {
		setName("Start Point");
		setClasstypename(this.getClass().getSimpleName());
	}

	public String getStartOperation() {
		return startOperation;
	}

	public void setStartOperation(String startOperation) {
		this.startOperation = startOperation;
	}

	public void setLaunchFormName(String launchFormName) {
		this.launchFormName = launchFormName;
	}

	public String getLaunchFormName() {
		return launchFormName;
	}

	/**
	 * @return the launchUIUrl
	 */
	public String getLaunchUIUrl() {
		return launchUIUrl;
	}

	/**
	 * @param launchUIUrl
	 *            the launchUIUrl to set
	 */
	public void setLaunchUIUrl(String launchUIUrl) {
		this.launchUIUrl = launchUIUrl;
	}

	/**
	 * @return the launchFormContent
	 */
	public String getLaunchFormContent() {
		return launchFormContent;
	}

	/**
	 * @param launchFormContent
	 *            the launchFormContent to set
	 */
	public void setLaunchFormContent(String launchFormContent) {
		this.launchFormContent = launchFormContent;
	}

	/**
	 * @return the launchUIType
	 */
	public int getLaunchUIType() {
		return launchUIType;
	}

	/**
	 * @param launchUIType
	 *            the launchUIType to set
	 */
	public void setLaunchUIType(int launchUIType) {
		this.launchUIType = launchUIType;
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

}
