/**
 * 
 */
package edu.thss.platform.service.wfprocess.core.buildtime.wfprocess.task;

import com.alibaba.fastjson.JSONObject;
import com.alibaba.fastjson.JSONArray;
import edu.thss.platform.service.wfprocess.core.data.variable.AccessibleVariable;


/**
 * This task needs human to participation
 * 
 * @author CAODAHAI 05/08/2009
 * 
 */
public class ManualTask extends AbstractTask {

	/**
	 * serialVersionUID
	 */
	private static final long serialVersionUID = -5249029660043088007L;

	public static final String MINUTE = "0";
	public static final String HOUR = "1";
	public static final String WORKHOUR = "2";
	public static final String DAY = "3";
	public static final String WORKDAY = "4";
	public static final String WEEK = "5";
	public static final String MONTH = "6";
	/**
	 * This is maximum time duration to complete current task the time unit is
	 * work day, for example, it is 5 work days, 10 work days
	 */
	private int deadlineDays;
	/**
	 * It is the days when system start to alert before deadline reached. It
	 * must be less than the deadline days. if 5 work days is deadline, then
	 * alarm days can be 1 to 5 days.
	 */
	private int alarmDays;
	/**
	 * The alarm frequency means how long system will alert after the alarm days
	 * has been met. Remind frequency can be every day or every two days or
	 * every hour
	 */
	private int alarmFrequency;
	/**
	 * by email or mobile or QQ or WeChat?
	 */
	private int alarmMethod;

	// 0: end form; 1: end UI url
	private int uiType = 0;
	// The end UI url of external system.
	private String uiUrl = null;
	// this property describes the form content for manual task accessing
	private String formContent = null;
	private String formName = null;

	private AccessibleVariable[] accessibleVars = new AccessibleVariable[0];
//	private Participant[] participants = new Participant[0];

//	办理人 	{'participantType': 'user', 'name': '工作流用户','oid':oid};
	private JSONArray participants = null;
	private String expiryHandlerWfProcessId = null;

	private String beforeOperation = null;
	private String afterOperation = null;


	/**
	 * Manual task constructor
	 */
	public ManualTask() {
		super();
		setName("Manual Task");
		setClasstypename(this.getClass().getSimpleName());
	}

	/**
	 * Manual task constructor with the task id.
	 * 
	 * @param id
	 *            String
	 */
	public ManualTask(String id) {
		super(id);
		setName("Manual Task");
		setClasstypename(this.getClass().getSimpleName());
	}

	@Override
	public Object clone() throws CloneNotSupportedException {
		ManualTask clone = (ManualTask) super.clone();
		cloneChildren(this);
		return clone;
	}

	/**
	 * @return the deadlineDays
	 */
	public int getDeadlineDays() {
		return deadlineDays;
	}

	/**
	 * @param deadlineDays
	 *            the deadlineDays to set
	 */
	public void setDeadlineDays(int deadlineDays) {
		this.deadlineDays = deadlineDays;
	}

	public int getAlarmDays() {
		return alarmDays;
	}

	public void setAlarmDays(int alarmDays) {
		this.alarmDays = alarmDays;
	}

	public int getAlarmFrequency() {
		return alarmFrequency;
	}

	public void setAlarmFrequency(int alarmFrequency) {
		this.alarmFrequency = alarmFrequency;
	}

	public int getAlarmMethod() {
		return alarmMethod;
	}

	public void setAlarmMethod(int alarmMethod) {
		this.alarmMethod = alarmMethod;
	}

	/**
	 * @return the formContent
	 */
	public String getFormContent() {
		return formContent;
	}

	/**
	 * @param formContent
	 *            the formContent to set
	 */
	public void setFormContent(String formContent) {
		this.formContent = formContent;
	}

	public String getFormName() {
		return formName;
	}

	public void setFormName(String formName) {
		this.formName = formName;
	}

	/**
	 * @return the uiType
	 */
	public int getUiType() {
		return uiType;
	}

	/**
	 * @param uiType
	 *            the uiType to set
	 */
	public void setUiType(int uiType) {
		this.uiType = uiType;
	}

	/**
	 * Sets a user operation interface object. The user interface object is
	 * designed by UI designer. This object will generate a HTML page, or Web
	 * page and send it to client browser or desktop.
	 * 
	 * @return the uiUrl
	 */
	public String getUiUrl() {
		return uiUrl;
	}

	/**
	 * Returns a user operation interface object. The user interface object is
	 * designed by UI designer. This object will generate a HTML page, or Web
	 * page and send it to client browser or desktop.
	 * 
	 * @param uiUrl
	 *            the uiUrl to set
	 */
	public void setUiUrl(String uiUrl) {
		this.uiUrl = uiUrl;
	}

	/**
	 * @return the accessibleVars
	 */
	public AccessibleVariable[] getAccessibleVars() {
		return accessibleVars;
	}

	/**
	 * @param accessibleVars the accessibleVars to set
	 */
	public void setAccessibleVars(AccessibleVariable[] accessibleVars) {
		this.accessibleVars = accessibleVars;
	}

	/**
	 * @return the participants
	 */
	public JSONArray getParticipants() { return participants; }


	/**
	 * @param participants the participants to set
	 */
	public void setParticipants(JSONArray participants) { this.participants = participants; }

	/**
	 * @return the expiryHandlerWfProcessId
	 */
	public String getExpiryHandlerWfProcessId() {
		return expiryHandlerWfProcessId;
	}

//	{'participantType': 'user', 'name': '工作流用户','oid':oid};
	public void addParticipants(String participantType, String oid, String displayName) {
		JSONObject participant = new JSONObject();
		participant.put("participantType", participantType);
		participant.put("oid", oid);
		participant.put("name", displayName);
		if(!participants.contains(participant)){
			this.participants.add(participant);
		}
	}

	public boolean removeParticipants(String participantType, String oid, String displayName) {
		JSONObject participant = new JSONObject();
		participant.put("participantType", participantType);
		participant.put("oid", oid);
		participant.put("name", displayName);
		return participants.remove(participant);
	}

	public void resetParticipants(){
		this.participants = new JSONArray();
	}

	/**
	 * @param expiryHandlerWfProcessId the expiryHandlerWfProcessId to set
	 */
	public void setExpiryHandlerWfProcessId(String expiryHandlerWfProcessId) {
		this.expiryHandlerWfProcessId = expiryHandlerWfProcessId;
	}

	public String getAfterOperation() {
		return afterOperation;
	}

	public void setAfterOperation(String afterOperation) {
		this.afterOperation = afterOperation;
	}

	public String getBeforeOperation() {
		return beforeOperation;
	}

	public void setBeforeOperation(String beforeOperation) {
		this.beforeOperation = beforeOperation;
	}


}