package edu.thss.platform.service.wfprocess.core.buildtime.release.wfprocess;

import edu.thss.platform.service.wfprocess.core.TreeNode;
import edu.thss.platform.service.wfprocess.core.WorkflowEntity;
import edu.thss.platform.service.wfprocess.core.buildtime.wfprocess.ParticipationType;
import edu.thss.platform.service.wfprocess.core.buildtime.wfprocess.WfProcess;
import edu.thss.platform.service.wfprocess.core.buildtime.wfprocess.WfProcessStatus;
import edu.thss.platform.service.wfprocess.core.folder.Folder;
import com.alibaba.fastjson.JSONArray;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;

/**
 * @author Dahai Cao created on 2016-11-03
 */
public class ReleasedWfProcess extends WfProcess {

	/**
	 * serialVersionUID
	 */
	private static final long serialVersionUID = 8674308322741914975L;
	// this version is used to describe the business version of an application process
	private String version = null;
	private String releaserId = null;
	private String releaser = null;
	private String releaseStatement = null;
	private long releaseDate = 0;
	// 1:deprecated(not use any more);0:still use
	private int deprecated = 1;
	// 0: no trial;
	// 1: 1 month trial;
	// 2: 3 months;
	// 3: 6 months;
	// 4: 9 months;
	// 5: 12 months;

	private long likeCounting = 0;
	private long totalDownloading = 0;
	private long totalUseCounting = 0;
	private long successCounting = 0;
	private long terminationCounting = 0;
	private long suspensionCounting = 0;

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
//	private String bindEnClassName = null;
	private JSONArray proprietors = null;

	private String parent; // parent ID
	private TreeNode[] children = new TreeNode[0];
	private String id = null;
	private String name = null;
	private String owner = null;
	private String currOwner = null;

	/**
	 * Constructor
	 */
	public ReleasedWfProcess() {
		super();
	}

	/**
	 * Constructor
	 * 
	 * @param id
	 */
	public ReleasedWfProcess(String id) {
		this();
		setId(id);
		setName("");
	}

	public int compareTo(TreeNode o) {
		if (o instanceof Folder) {
			return 1;
		} else {
			return this.getName().compareTo(((WorkflowEntity) o).getName());
		}
	}

	public String getVersion() {
		return version;
	}

	public void setVersion(String version) {
		this.version = version;
	}

	public String getReleaser() {
		return releaser;
	}

	public void setReleaser(String releaser) {
		this.releaser = releaser;
	}

	public String getReleaseStatement() {
		return releaseStatement;
	}

	public void setReleaseStatement(String releaseStatement) {
		this.releaseStatement = releaseStatement;
	}

	public long getReleaseDate() {
		return releaseDate;
	}

	public void setReleaseDate(long releaseDate) {
		this.releaseDate = releaseDate;
	}

	public int getDeprecated() {
		return deprecated;
	}

	public void setDeprecated(int deprecated) {
		this.deprecated = deprecated;
	}

	public long getLikeCounting() {
		return likeCounting;
	}

	public void setLikeCounting(long likeCounting) {
		this.likeCounting = likeCounting;
	}

	public long getTotalUseCounting() {
		return totalUseCounting;
	}

	public void setTotalUseCounting(long totalUseCounting) {
		this.totalUseCounting = totalUseCounting;
	}

	public long getSuccessCounting() {
		return successCounting;
	}

	public void setSuccessCounting(long successCounting) {
		this.successCounting = successCounting;
	}

	public long getTerminationCounting() {
		return terminationCounting;
	}

	public void setTerminationCounting(long terminationCounting) {
		this.terminationCounting = terminationCounting;
	}

	public long getSuspensionCounting() {
		return suspensionCounting;
	}

	public void setSuspensionCounting(long suspensionCounting) {
		this.suspensionCounting = suspensionCounting;
	}



	/**
	 * Totally download counting.
	 * 
	 * @return the totalDownloading
	 */
	public long getTotalDownloading() {
		return totalDownloading;
	}

	/**
	 * @param totalDownloading
	 *            the totalDownloading to set
	 */
	public void setTotalDownloading(long totalDownloading) {
		this.totalDownloading = totalDownloading;
	}


	public String getReleaserId() {
		return releaserId;
	}

	public void setReleaserId(String releaserId) {
		this.releaserId = releaserId;
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

	public void setDescription(String description) {
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

//	public String toNameWithStatus() {
//		String displayName = "";
//		if (this.getStatus() == LOCKED || this.getStatus() == UNLOCKED) {
//			displayName = this.getName();
//		} else if (this.getStatus() == RELEASED) {
//			displayName = this.getName();
//		} else if (this.getStatus() == LAUNCHED) {
//			displayName = this.getName() + " [Launched]";
//		} else if (this.getStatus() == RUNNING) {
//			displayName = this.getName() + " [Running]";
//		} else if (this.getStatus() == SUSPENDED) {
//			displayName = this.getName() + " [Suspended]";
//		} else if (this.getStatus() == TERMINATED) {
//			displayName = this.getName() + " [Terminated]";
//		} else if (this.getStatus() == COMPLETED) {
//			displayName = this.getName() + " [Completed]";
//		}
//		return displayName;
//	}

//	/**
//	 * @author Dahai CAO
//	 * @date 2011-9-21 下午01:47:03
//	 * @return
//	 */
//	public String getStatusName() {
//		if (getStatus() == UNLOCKED) {
//			return "Unlocked";
//		} else if (getStatus() == LOCKED) {
//			return "Locked";
//		} else if (getStatus() == RELEASED) {
//			return "Released";
//		} else if (getStatus() == LAUNCHED) {
//			return "Launched";
//		} else if (getStatus() == RUNNING) {
//			return "Running";
//		} else if (getStatus() == SUSPENDED) {
//			return "Suspended";
//		} else if (getStatus() == TERMINATED) {
//			return "Terminated";
//		} else if (getStatus() == COMPLETED) {
//			return "Completed";
//		}
//		return "Default";
//	}

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

//	public String getBindEnClassName() {
//		return bindEnClassName;
//	}

	public JSONArray getProprietors() { return proprietors; }

	public void setProprietors(JSONArray proprietors) { this.proprietors = proprietors; }

//	public void setBindEnClassName(String bindEnClassName) {
//		this.bindEnClassName = bindEnClassName;
//	}

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

//	public List<TreeNode> getAllChildren() {
//		if (this.hasChildren()) {
//			List<TreeNode> l = new ArrayList<TreeNode>();
//			TreeNode[] nodes = this.getChildren();
//			for (int i = 0; i < nodes.length; i++) {
//				l.add(nodes[i]);
//				if (nodes[i].hasChildren()) {
//					l.addAll(nodes[i].getAllChildren());
//				}
//			}
//			return l;
//		}
//		return new ArrayList<TreeNode>();
//	}

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
	 * @param children
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


}