/**
 *
 */
package edu.thss.platform.service.wfprocess.core.runtime.wfprocess;

import com.alibaba.fastjson.JSONObject;
import edu.thss.platform.service.wfprocess.core.TreeNode;
import edu.thss.platform.service.wfprocess.core.buildtime.release.wfprocess.ReleasedWfProcess;
import edu.thss.platform.service.wfprocess.core.buildtime.wfprocess.ParticipationType;
import edu.thss.platform.service.wfprocess.core.buildtime.wfprocess.WfProcessStatus;
import com.alibaba.fastjson.JSONArray;
import edu.thss.platform.service.wfprocess.core.data.variable.DataVariable;
import edu.thss.platform.service.wfprocess.core.runtime.wfprocess.task.EndPointInstance;
import edu.thss.platform.service.wfprocess.core.runtime.wfprocess.task.StartPointInstance;
//import scala.collection.script.End;

import java.util.*;

//import com.mysql.cj.xdevapi.JsonArray;

/**
 * This class is used to runtime process engine enactment.
 *
 * @author Dahai Cao created 2011-9-5 下午12:14:36; last updated at 14:50 on 2019-03-23
 */
public class WfProcessInstance extends ReleasedWfProcess {
    /**
     * serialVersionUID
     */
    private static final long serialVersionUID = 5202847266627191722L;
    /**
     * 已发布的流程模版id
     */
    private String wfProcessId = null;
    private String launchUserId = null;
    private String launchUser = null; // launcher full name

    // 0: not staff by default; 1: is staff
    private int staffLaunched = 0;
    /** the time stamp of launching this process instance on server */
    private long launchTime = -1;
    /** the time stamp of initializing this process instance on server */
    private long startTime = -1;
    /** the time stamp of completing this process instance on server */
    private long endTime = -1;
    /** the time stamp of launching this process instance on server */
    private long suspensionTime = -1;
    /** the the time stamp when this process instance was updated */
    private long updateTime = -1;
    /** the time stamp of terminating this process instance on server */
    private long terminationTime = -1;
    private String ipv4 = null; // client IPv4
    private String ipv6 = null; // client IPv6
    private String serverIp = null; // sever IP

    // 发起流程时新增一个实体类对象 绑定oid
    private String enClassInstanceId = null;

    private long ver = -1; // it will be used in future.
    // build time properties
    private String code;
    // 0 : '内部（绝密）',1 : '内部（机密）',2 : '内部（秘密）',
    // 3 : '内部（不公开）',4 : '内部（公开）',5 : '外部（公开）',
//    private int accessLevel = 0;
    // 业务过程类型
    // Note: process type means the business categories of this process
    // workflow type means the enactment categories of this process
    // different workflow will be performed by different ways on
    // workflow enactment services.
    // 0 : '办公自动化',1 : '费用审批',2 : '金融审批',
    // 3 : '保险审批',4 : '行政许可审批',5 : '财务审批',
    // 6 :'合同审批',7 : '系统集成',8 : '其他',
    private int processType = 0;
    // 参与者应用类型
    // 0: automatic workflow (no participant)
    // 1: single participant workflow
    // 2: multiple participant workflow
    // 0 : 无人参与自动工作流;1 : 单人参与工作流;2 : 多人参与工作流;
    private int workflowType = ParticipationType.NO_PARTICIPANT_APP;
    // 过程说明
    private String description;
    private String keywords = null;
    // 应用创建人姓名
    // process creator。
    private String authorId;
    private String author;
    // this property support team work for process modeling
    // 0:unlocked ;1:locked
    private int status = 0;
    private long lastupdate = -1;

    private String processContent = null;

//    private String bindEnClassName = null;
    private JSONArray proprietors = null;
    private String customData = null;
    private JSONArray taskLog = null;

    /**
     * 参与人员：这个属性是用来描述会商邀请的，该数组中放置的都是收到会商邀请的人的user Id。
     * "{"displayName":"车厘子","name":"cheney","oid":"734A25690B0FCB46AB1E9BE8719069ED","type":"user"}"
     */
	private String[] invitations = new String[0];
    /**
     * 抄送人员：流程结束后可见。
     * "{"displayName":"车厘子","name":"cheney","oid":"734A25690B0FCB46AB1E9BE8719069ED","type":"user"}"
     */
    private String[] copiers = new String[0];

    private String parent; // parent ID
    private TreeNode[] children = new TreeNode[0];
    private String id = null;
    private String name = null;
    private String owner = null;
    private String currOwner = null;

    private String targetObjectOid = null;
    private String targetClassName = null;

    /**
     * 不指定对象，默认新增所绑定类的对象
     */
    public WfProcessInstance() {

    }

    /**
     * @param id
     */
    public WfProcessInstance(String id) {
        super(id);

    }


    public String getEnClassInstanceId() {
        return enClassInstanceId;
    }

    public String getTargetObjectOid() {
        return this.getEnClassInstanceId();
    }
    public String getTargetClassName() {
        return this.getBindEnClassName();
    }
    public void setTargetObjectOid(String targetObjectOid) {
        this.targetObjectOid = targetObjectOid;
        this.setEnClassInstanceId(targetObjectOid);
    }
    public void setTargetClassName(String targetClassName) {
        this.targetClassName = targetClassName;
        this.setBindEnClassName(targetClassName);
    }
    public void setEnClassInstanceId(String enClassInstanceId) {
        this.enClassInstanceId = enClassInstanceId;
    }

    /**
     * This property stores process definition id. It is just used when this
     * process is instantiated as an instance for executing. This property can
     * be used to analyse process count.
     *
     * @return the wfProcessId
     */
    public String getWfProcessId() {
        return wfProcessId;
    }

    /**
     * This property stores process definition id. It is just used when this
     * process is instantiated as an instance for executing. This property can
     * be used to analyse process count.
     *
     * @param wfProcessId
     *            the wfProcessId to set
     */
    public void setWfProcessId(String wfProcessId) {
        this.wfProcessId = wfProcessId;
    }

    /**
     * Sets the date time that current business process is instantiated.
     *
     * @param startTime
     */
    public void setStartTime(long startTime) {
        this.startTime = startTime;
    }

    /**
     * Return the date time that current business process is instantiated.
     *
     * @return
     */
    public long getStartTime() {
        return startTime;
    }

    /**
     * @return the launchTime
     */
    public long getLaunchTime() {
        return launchTime;
    }

    /**
     * @param launchTime
     *            the launchTime to set
     */
    public void setLaunchTime(long launchTime) {
        this.launchTime = launchTime;
    }

    /**
     * @return the suspensionTime
     */
    public long getSuspensionTime() {
        return suspensionTime;
    }

    /**
     * @param suspensionTime
     *            the suspensionTime to set
     */
    public void setSuspensionTime(long suspensionTime) {
        this.suspensionTime = suspensionTime;
    }

    /**
     * @return the terminationTime
     */
    public long getTerminationTime() {
        return terminationTime;
    }

    /**
     * @param terminationTime
     *            the terminationTime to set
     */
    public void setTerminationTime(long terminationTime) {
        this.terminationTime = terminationTime;
    }

    /**
     * @return the endTime
     */
    public long getEndTime() {
        return endTime;
    }

    /**
     * @param endTime
     *            the endTime to set
     */
    public void setEndTime(long endTime) {
        this.endTime = endTime;
    }

    /**
     * @return the launchUserId
     */
    public String getLaunchUserId() {
        return launchUserId;
    }

    /**
     * @param launchUserId
     *            the launchUserId to set
     */
    public void setLaunchUserId(String launchUserId) {
        this.launchUserId = launchUserId;
    }

    public String getLaunchUser() {
        return launchUser;
    }

    public void setLaunchUser(String launchUser) {
        this.launchUser = launchUser;
    }



    /**
     * @return the ipv4
     */
    public String getIpv4() {
        return ipv4;
    }

    /**
     * @param ipv4
     *            the ipv4 to set
     */
    public void setIpv4(String ipv4) {
        this.ipv4 = ipv4;
    }

    /**
     * @return the ipv6
     */
    public String getIpv6() {
        return ipv6;
    }

    /**
     * @param ipv6
     *            the ipv6 to set
     */
    public void setIpv6(String ipv6) {
        this.ipv6 = ipv6;
    }

    /**
     * @return the updateTime
     */
    public long getUpdateTime() {
        return updateTime;
    }

    /**
     * @param updateTime
     *            the updateTime to set
     */
    public void setUpdateTime(long updateTime) {
        this.updateTime = updateTime;
    }

    /**
     * @return the staffLaunched
     */
    public int getStaffLaunched() {
        return staffLaunched;
    }

    /**
     * @param staffLaunched
     *            the staffLaunched to set
     */
    public void setStaffLaunched(int staffLaunched) {
        this.staffLaunched = staffLaunched;
    }

    /**
     * @return the serverIp
     */
    public String getServerIp() {
        return serverIp;
    }

    /**
     * @param serverIp
     *            the serverIp to set
     */
    public void setServerIp(String serverIp) {
        this.serverIp = serverIp;
    }



    /**
     * Returns the code of business process for get the same processes of
     * different versions.
     */
    public String getCode() {
        return this.code;
    }

    /**
     * Sets the code of business process for get the same processes of different
     * versions.
     */
    public void setCode(String code) {
        this.code = code;
    }

    /**
     * Sets last update date time of the instantiated business process. The
     * format of the time is MM/DD/YYYY.
     *
     * @param lastupdate
     */
    public void setLastupdate(long lastupdate) {
        this.lastupdate = lastupdate;
    }

    /**
     * Return last update date time of the instantiated business process.The
     * format of the time is MM/DD/YYYY.
     *
     * @return lastupdate
     */
    public long getLastupdate() {
        return lastupdate;
    }


//
//	/**
//	 * @author Dahai CAO
//	 * @date 20/06/2011 12:44:39 PM
//	 * @return
//	 */
//	public boolean hasVariables() {
//		TreeNode[] nodes = this.getChildren();
//		for (int i = 0; i < nodes.length; i++)
//			if (nodes[i] instanceof DataVariable)
//				return true;
//		return false;
//	}
//
//	/**
//	 * @author Dahai CAO
//	 * @date 30/06/2011 3:26:43 PM
//	 * @return
//	 */
//	public DataVariable[] getProcessVariables() {
//		List<DataVariable> components = new ArrayList<DataVariable>();
//		for (TreeNode child : this.getChildren()) {
//			if (child instanceof DataVariable)
//				components.add((DataVariable) child);
//		}
//		return components.toArray(new DataVariable[components.size()]);
//	}
//
//	/**
//	 * @author Dahai CAO
//	 * @date 30/02/2012 3:26:43 PM
//	 * @return
//	 */
//	public AbstractTask[] getAllTasks() {
//		List<AbstractTask> tasks = new ArrayList<AbstractTask>();
//		for (TreeNode child : this.getChildren()) {
//			if (child instanceof AbstractTask)
//				tasks.add((AbstractTask) child);
//		}
//		return tasks.toArray(new AbstractTask[tasks.size()]);
//	}

//    public int getAccessLevel() {
//        return accessLevel;
//    }
//
//    public void setAccessLevel(int accessLevel) {
//        this.accessLevel = accessLevel;
//    }

    public String getKeywords() {
        return keywords;
    }

    public void setKeywords(String keywords) {
        this.keywords = keywords;
    }


    public int getProcessType() {
        return processType;
    }

    public void setProcessType(int processType) {
        this.processType = processType;
    }

    /**
     * @return the workflowType
     */
    public int getWorkflowType() {
        return workflowType;
    }

    /**
     * @param workflowType the workflowType to set
     */
    public void setWorkflowType(int workflowType) {
        this.workflowType = workflowType;
    }

    public String getAuthor() {
        return author;
    }

    public void setAuthor(String author) {
        this.author = author;
    }

    public String getDescription() {
        return description;
    }

    public void i(String description) {
        this.description = description;
    }



    public String toString() {
        return getName();
    }

    //	/**
//	 * Sets status of business process. The statuses include at build time:
//	 * {@link WfProcessStatus#LOCKED}, {@link WfProcessStatus#UNLOCKED},
//	 * {@link WfProcessStatus#RELEASED} and in runtime:
//	 * {@link WfProcessStatus#LAUNCHED},{@link WfProcessStatus#RUNNING} ,
//	 * {@link WfProcessStatus#SUSPENDED},{@link WfProcessStatus#TERMINATED},
//	 * {@link WfProcessStatus#COMPLETED}.
//	 *
//	 * @param status
//	 */
    public void setStatus(int status) {
        this.status = status;
//		if (status == COMPLETED) {
//			this.notify();
//		}
    }
//
//	public synchronized boolean hasCompleted() throws InterruptedException {
//		if (getStatus() != COMPLETED) {
//			this.wait();
//		}
//		this.notify();
//		return true;
//	}

    /**
     * Returns status of business process. The statuses include at build time:
     * {@link WfProcessStatus#LOCKED}, {@link WfProcessStatus#UNLOCKED},
     * {@link WfProcessStatus#RELEASED} and in runtime:
     * {@link WfProcessStatus#LAUNCHED},{@link WfProcessStatus#RUNNING} ,
     * {@link WfProcessStatus#SUSPENDED},{@link WfProcessStatus#TERMINATED},
     * {@link WfProcessStatus#COMPLETED}.
     *
     * @return
     */
    public int getStatus() {
        return this.status;
    }

    /**
     * @return the processContent
     */
    public String getProcessContent() {
        return processContent;
    }

    /**
     * @param processContent the processContent to set
     */
    public void setProcessContent(String processContent) {
        this.processContent = processContent;
    }


    public String getAuthorId() {
        return authorId;
    }

    public void setAuthorId(String authorId) {
        this.authorId = authorId;
    }

//    public String getBindEnClassName() {
//        return bindEnClassName;
//    }

    public JSONArray getProprietors() { return proprietors; }

    public void setProprietors(JSONArray proprietors) { this.proprietors = proprietors; }

    public JSONArray getTaskLog() {
        return taskLog;
    }

    public void setTaskLog(JSONArray taskLog) {
        this.taskLog = taskLog;
    }

    public void addTaskLog(JSONObject taskLog) {
        this.taskLog.add(taskLog);
    }

    public String getBindEnClassName() {
        return super.getBindEnClassName();
    }

    public void setBindEnClassName(String bindEnClassName) {
        super.setBindEnClassName(bindEnClassName);
    }

    public TreeNode seek(String nodename) {
        if (nodename == null)
            return null;
        if (nodename.equals(getName())) {
            return this;
        } else {
            TreeNode node = null;
            if (this.hasChildren()) {
                TreeNode[] nodes = this.getChildren();
                for (int i = 0; i < nodes.length; i++) {
                    node = nodes[i].seek(nodename);
                    if (node != null)
                        break;
                }
            }
            return node;
        }
    }

    public TreeNode seekByID(String nodeID) {
        if (nodeID == null)
            return null;
        if (nodeID.equals(getId())) {
            return this;
        } else {
            TreeNode node = null;
            if (this.hasChildren()) {
                TreeNode[] nodes = this.getChildren();
                for (int i = 0; i < nodes.length; i++) {
                    node = nodes[i].seekByID(nodeID);
                    if (node != null)
                        break;
                }
            }
            return node;
        }
    }

    public TreeNode seek(TreeNode node) {
        if (node == null)
            return null;
        if (node.equals(this)) {
            return this;
        } else {
            TreeNode child = null;
            if (this.hasChildren()) {
                TreeNode[] nodes = this.getChildren();
                for (int i = 0; i < nodes.length; i++) {
                    child = nodes[i].seek(node);
                    if (child != null)
                        break;
                }
            }
            return child;
        }
    }

    public TreeNode seekChild(String nodename) {
        if (nodename == null)
            return null;
        if (this.hasChildren()) {
            TreeNode[] nodes = this.getChildren();
            for (int i = 0; i < nodes.length; i++)
                if (nodes[i].getName().equals(nodename))
                    return nodes[i];
        }
        return null;
    }

    public TreeNode seekChildByID(String id) {
        if (id == null)
            return null;
        if (this.hasChildren()) {
            TreeNode[] nodes = this.getChildren();
            for (int i = 0; i < nodes.length; i++)
                if (nodes[i].getId().equals(id))
                    return nodes[i];
        }
        return null;
    }

//    public List<TreeNode> getAllChildren() {
//        if (this.hasChildren()) {
//            List<TreeNode> l = new ArrayList<TreeNode>();
//            TreeNode[] nodes = this.getChildren();
//            for (int i = 0; i < nodes.length; i++) {
//                l.add(nodes[i]);
//                if (nodes[i].hasChildren()) {
//                    l.addAll(nodes[i].getAllChildren());
//                }
//            }
//            return l;
//        }
//        return new ArrayList<TreeNode>();
//    }

    public TreeNode seekGrandchild(String nodename) {
        if (nodename == null)
            return null;
        if (this.hasChildren()) {
            TreeNode[] nodes = this.getChildren();
            for (int i = 0; i < nodes.length; i++)
                if (nodes[i].hasChildren()) {
                    TreeNode[] children = nodes[i].getChildren();
                    for (int j = 0; j < children.length; j++) {
                        if (children[j].getName().equals(nodename))
                            return children[j];
                    }
                }
        }
        return null;
    }

    public void addChild(TreeNode child) {
        if (child == null)
            return;
        int oldCapacity = this.children.length;
        this.children = Arrays.copyOf(this.children, oldCapacity + 1);
        this.children[oldCapacity++] = child;
        child.setParent(this.getId());
//        Collections.sort(Arrays.asList(this.children));
    }

    public void addOneChild(TreeNode child) {
        if (child == null)
            return;
        int oldCapacity = this.children.length;
        this.children = Arrays.copyOf(this.children, oldCapacity + 1);
        this.children[oldCapacity++] = child;
        child.setParent(this.getId());
    }

    public void append(TreeNode[] nodes) {
        if (nodes == null || nodes.length == 0) {
            return;
        }
        for (int i = 0; i < nodes.length; i++) {
            if (nodes[i] != null) {
                addChild(nodes[i]);
                nodes[i].setParent(this.getId());
                nodes[i].setOwner(this.getOwner());
            }
        }
    }

    public void cloneChildren(TreeNode parent) {
        try {
            if (this.hasChildren()) {
                TreeNode[] nodes = this.getChildren();
                TreeNode[] newNodes = new TreeNode[nodes.length];
                for (int i = 0; i < nodes.length; i++) {
                    newNodes[i] = (TreeNode) nodes[i].clone();
                    newNodes[i].setParent(parent.getId());
                    newNodes[i].setOwner(parent.getOwner());
                }
                parent.setChildren(newNodes);
            }
        } catch (CloneNotSupportedException e) {
            e.printStackTrace();
        }
    }

    public void removeChild(TreeNode child) {
        if (child == null) {
            for (int index = 0; index < this.children.length; index++)
                if (this.children[index] == null) {
                    fastRemove(index);
                }
        } else {
            for (int index = 0; index < this.children.length; index++)
                if (child.equals(this.children[index])) {
                    fastRemove(index);
                }
        }
        Collections.sort(Arrays.asList(this.children));
    }

    /**
     * Private remove method that skips bounds checking and does not return the
     * value removed.
     */
    private void fastRemove(int index) {
        int numMoved = this.children.length - index - 1;
        if (numMoved > 0)
            System.arraycopy(this.children, index + 1, this.children, index, numMoved);
        this.children[this.children.length - 1] = null; // Let gc do its work
        this.children = Arrays.copyOf(this.children, this.children.length - 1);
    }

    /**
     * Remove a group of children nodes <code>children</code> from current tree
     * node object. <code>children</code> is object array.
     *
     * @date 2008-10-2 下午08:27:39
     */
    public void removeChild(TreeNode[] children) {
        for (TreeNode child : children) {
            removeChild(child);
            child.setParent(null);
        }
        Collections.sort(Arrays.asList(this.children));
    }

    /**
     * @see edu.thss.platform.service.wfprocess.core.TreeNode# setParent(edu.thss.platform.service.wfprocess.core.TreeNode)
     */
    public void setParent(String parent) {
        this.parent = parent;
    }

    /**
     * Removes all children tree nodes.
     *
     */
    public void removeAllChildren() {
        // Let gc do its work
        this.children = new TreeNode[0];
    }

    public TreeNode[] getChildren() {
        return this.children;
    }

    public String getParent() {
        return this.parent;
    }

    public boolean hasChildren() {
        return this.children.length > 0;
    }

    public void setChildren(TreeNode[] children) {
        // this.children = Arrays.asList(children);
        // 不用上边的语句是因为不产生新的this.children地址。
        if (children == null)
            return;
        for (int i = 0; i < children.length; i++) {
            addChild(children[i]);
        }
    }

    /**
     *
     */
    public String getId() {
        return this.id;
    }

    /**
     *
     */
    public void setId(String id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public void setOwner(String owner) {
        this.owner = owner;
    }

    public String getOwner() {
        return this.owner;
    }

    /**
     * @return the currOwner
     */
    public String getCurrOwner() {
        return currOwner;
    }

    /**
     * @param currOwner
     *            the currOwner to set
     */
    public void setCurrOwner(String currOwner) {
        this.currOwner = currOwner;
    }


	public String[] getInvitations() { return invitations; }

	public void setInvitations(String[] invitations) {
		this.invitations = invitations;
	}

	public void addInvitation(String copyto) {
        List<String> arrList = new ArrayList<String>(Arrays.asList(this.invitations)); //
        if (!arrList.remove(copyto)){ //已有
            int oldCapacity = this.invitations.length;
            this.invitations = Arrays.copyOf(this.invitations, oldCapacity + 1);
            this.invitations[oldCapacity++] = copyto;
        }

    }
    public void addInvitation(String name,String uid) {
        String copyto = "{\"displayName\":\""+name+"\",\"oid\":\""+uid+"\"}";
        this.addInvitation(copyto);

    }


    public String removeInvitation(String copyto) {
		List<String> arrList = new ArrayList<String>(Arrays.asList(this.invitations)); //
		if (arrList.remove(copyto)){
			this.invitations = arrList.toArray(new String[arrList.size()]);
			return "1";
		}else{
			return "0";
		}
	}
    public void removeInvitation(String name,String uid) {
        String copyto = "{\"name\":\""+name+"\",\"oid\":\""+uid+"\"}";
        this.removeInvitation(copyto);
    }

    public String[] getCopiers() { return this.copiers; }

    public void setCopiers(String[] invitations) {
        this.copiers = invitations;
    }

    public void addCopier(String copyto) {
        List<String> arrList = new ArrayList<String>(Arrays.asList(this.copiers)); //
        if(!arrList.contains(copyto)){
            int oldCapacity = this.copiers.length;
            this.copiers = Arrays.copyOf(this.copiers, oldCapacity + 1);
            this.copiers[oldCapacity++] = copyto;
        }
    }


    public String removeCopier(String copyto) {
        List<String> arrList = new ArrayList<String>(Arrays.asList(this.copiers)); //
        if (arrList.remove(copyto)){
            this.copiers = arrList.toArray(new String[arrList.size()]);
            return "1";
        }else{
            return "0";
        }
    }

    public String getCustomData() {
        return customData;
    }

    public void setCustomData(String customData) {
        this.customData = customData;
    }
//
//    public Map<String,Object> getObjMap(){
//        Map<String, Object> objMap = new HashMap<>();
//        for (TreeNode child : this.getChildren()) {
//            if (child instanceof DataVariable) {
//                objMap.put(child.getName(),((DataVariable)child).getValue().toString());
//            }
//        }
//        return objMap;
//    }

    public EndPointInstance getEndPointInstance(){
        TreeNode[] nodes = this.getChildren();
        for (int i = nodes.length-1; i >=0 ; i--) {
            if (nodes[i] instanceof EndPointInstance) {
            return (EndPointInstance)nodes[i];
            }
        }
        return null;
    }

    public StartPointInstance getStartPointInstance(){
        TreeNode[] nodes = this.getChildren();
        for (int i = 0; i < nodes.length; i++) {
            if (nodes[i] instanceof StartPointInstance) {
                return (StartPointInstance)nodes[i];
            }
        }
        return null;
    }

    public ArrayList<DataVariable> getDataVariables(){
        ArrayList<DataVariable> dataVariables = new ArrayList<>();
        for (int i = 0; i < this.children.length; i++) {
            if (this.children[i] instanceof DataVariable) {
                dataVariables.add((DataVariable)this.children[i]);
            }
        }

        return dataVariables;
    }
}