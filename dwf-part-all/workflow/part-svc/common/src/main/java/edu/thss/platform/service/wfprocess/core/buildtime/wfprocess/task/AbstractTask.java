package edu.thss.platform.service.wfprocess.core.buildtime.wfprocess.task;

import edu.thss.platform.service.wfprocess.core.TreeNode;
import edu.thss.platform.service.wfprocess.core.buildtime.wfprocess.Transition;

import java.util.Arrays;
import java.util.Collections;

/**
 * This is abstract task which is used as parent class all other task class.
 * 
 * @author Dahai Cao created 2008-08-01 
 */
public class AbstractTask extends TreeNode implements TaskStatus {
	/**
	 * serialVersionUID
	 */
	private static final long serialVersionUID = -1405617949682070015L;

	private double x0 = 0;
	private double y0 = 0;
	private double x1 = 0;
	private double y1 = 0;
	private int isParallelInput = 0;
	private int isParallelOutput = 0;

	private int status = DEFAULT;
	private long lastupdate;
	private Transition[] outputs = new Transition[0];
	private Transition[] inputs = new Transition[0];
	private String classtypename = "AbstractTask";
	private String description = null;

	private String parent; // parent ID
	private TreeNode[] children = new TreeNode[0];
	private String id = null;
	private String name = null;
	private String owner = null;
	private String currOwner = null;

	/**
	 * Constructor
	 */
	public AbstractTask() {
		super();
		setClasstypename(this.getClass().getSimpleName());
		this.setLastupdate(System.currentTimeMillis());
	}

	/**
	 * Construct this task with a unique ID(Primary key).
	 * 
	 * @param id
	 *            String
	 */
	public AbstractTask(String id) {
		super(id);
		setClasstypename(this.getClass().getSimpleName());
		this.setLastupdate(System.currentTimeMillis());
	}

	/**
	 * Add a new input transition to this task. It will be denoted as a target
	 * task of the input transition.
	 */
	public void addInput(Transition transition) {
		int oldCapacity = this.inputs.length;
		this.inputs = Arrays.copyOf(this.inputs, oldCapacity + 1);
		this.inputs[oldCapacity++] = transition;
		Collections.sort(Arrays.asList(this.inputs));
	}

	/**
	 * Add a new output transition to this task. It will be denoted as a source
	 * task of the output transition.
	 */
	public void addOutput(Transition transition) {
		int oldCapacity = this.outputs.length;
		this.outputs = Arrays.copyOf(this.outputs, oldCapacity + 1);
		this.outputs[oldCapacity++] = transition;
		Collections.sort(Arrays.asList(this.outputs));
	}

	public double getX0() {
		return x0;
	}

	public void setX0(double x0) {
		this.x0 = x0;
	}

	public double getY0() {
		return y0;
	}

	public void setY0(double y0) {
		this.y0 = y0;
	}

	public double getX1() {
		return x1;
	}

	public void setX1(double x1) {
		this.x1 = x1;
	}

	public double getY1() {
		return y1;
	}

	public void setY1(double y1) {
		this.y1 = y1;
	}

	/**
	 * @return the isParallellInput
	 */
	public int getIsParallelInput() {
		return isParallelInput;
	}

	/**
	 * @param isParallelInput
	 *            the isParallelInput to set
	 */
	public void setIsParallelInput(int isParallelInput) {
		this.isParallelInput = isParallelInput;
	}

	/**
	 * @return the isParallelOutput
	 */
	public int getIsParallelOutput() {
		return isParallelOutput;
	}

	/**
	 * @param isParallelOutput
	 *            the isParallelOutput to set
	 */
	public void setIsParallelOutput(int isParallelOutput) {
		this.isParallelOutput = isParallelOutput;
	}

	public boolean hasInputs() {
		return this.inputs.length > 0;
	}

	public boolean hasOutputs() {
		return this.outputs.length > 0;
	}

	/**
	 * Return list of all input transitions. The element of list is
	 * {@link Transition}
	 * 
	 * @return List<Transition>
	 */
	public Transition[] getInputs() {
		return this.inputs;
	}

	public void setInputs(Transition[] inputs) {
		this.inputs = inputs;
	}

	/**
	 * Return list of all output transitions. The element of list is
	 * {@link Transition}
	 * 
	 * @return List<Transition>
	 */
	public Transition[] getOutputs() {
		return this.outputs;
	}

	public void setOutputs(Transition[] outputs) {
		this.outputs = outputs;
	}

	/**
	 * Remove the input transition that is specified at parameters.
	 * 
	 * @param transition
	 *            Transition
	 */
	public void removeInput(Transition transition) {
		if (transition == null) {
			for (int index = 0; index < this.inputs.length; index++)
				if (this.inputs[index] == null) {
					fastRemove(index, this.inputs);
				}
		} else {
			for (int index = 0; index < this.inputs.length; index++)
				if (transition.equals(this.inputs[index])) {
					fastRemove(index, this.inputs);
				}
		}
	}

	public void removeAllInputs() {
		this.inputs = new Transition[0];
	}

	/**
	 * Return the output transition that is specified at parameters.
	 * 
	 * @param transition
	 *            Transition
	 */
	public void removeOutput(Transition transition) {
		if (transition == null) {
			for (int index = 0; index < this.outputs.length; index++)
				if (this.outputs[index] == null) {
					fastRemove(index, this.outputs);
				}
		} else {
			for (int index = 0; index < this.outputs.length; index++)
				if (transition.equals(this.outputs[index])) {
					fastRemove(index, this.outputs);
				}
		}
	}

	/**
	 * Private remove method that skips bounds checking and does not return the
	 * value removed.
	 */
	private void fastRemove(int index, Transition[] list) {
		int numMoved = list.length - index - 1;
		if (numMoved > 0)
			System.arraycopy(list, index + 1, list, index, numMoved);
		list[list.length - 1] = null; // Let gc do its work
		list = Arrays.copyOf(list, list.length - 1);
	}

	public void removeAllOutputs() {
		this.outputs = new Transition[0];
	}

	/**
	 * Sets the last update date time. This is a time stamp of task execution.
	 * 
	 * @param lastupdate
	 *            Date
	 */
	public void setLastupdate(long lastupdate) {
		this.lastupdate = lastupdate;
	}

	/**
	 * Returns the last update date time. This is a time stamp of task
	 * execution.
	 * 
	 * @return Date
	 */
	public long getLastupdate() {
		return lastupdate;
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

	public String toString() {
		return getName();
	}

	/**
	 * @author Dahai CAO
	 * @date 31/03/2011 11:20:05 AM
	 * @param o
	 * @return
	 * @see Comparable#compareTo(Object)
	 */
	@Override
	public int compareTo(TreeNode o) {
		return 0;
	}

	/**
	 * @return the classtypename
	 */
	public String getClasstypename() {
		return classtypename;
	}

	/**
	 * @param classtypename
	 *            the classtypename to set
	 */
	public void setClasstypename(String classtypename) {
		this.classtypename = classtypename;
	}

	/**
	 * Sets the status of task, these status include {@link TaskStatus#DEFAULT},
	 * {@link TaskStatus#ENABLED} {@link TaskStatus#RUNNING},
	 * {@link TaskStatus#COMPLETED}, {@link TaskStatus#EXCEPTION},
	 * {@link TaskStatus#SKIPPED}, {@link TaskStatus#TERMINATED},
	 * {@link TaskStatus#UNUSED}.
	 * 
	 * @param status
	 *            int
	 */
	public void setStatus(int status) {
		this.status = status;
	}

	/**
	 * Return the status of task, these status include
	 * {@link TaskStatus#DEFAULT}, {@link TaskStatus#ENABLED}
	 * {@link TaskStatus#RUNNING}, {@link TaskStatus#COMPLETED},
	 * {@link TaskStatus#EXCEPTION}, {@link TaskStatus#SKIPPED},
	 * {@link TaskStatus#TERMINATED}, {@link TaskStatus#UNUSED}.
	 * 
	 * @return int
	 */
	public int getStatus() {
		return this.status;
	}

	/**
	 * Gets task status name.
	 * 
	 * @author Dahai CAO
	 * @date 2011-9-30 下午10:30:04
	 * @return
	 */
	public String getStatusName() {
		if (status == DEFAULT)
			return "Default"; //$NON-NLS-1$
		else if (status == ENABLED)
			return "Enabled"; //$NON-NLS-1$
		else if (status == RUNNING)
			return "Running"; //$NON-NLS-1$
		else if (status == COMPLETED)
			return "Completed"; //$NON-NLS-1$
		else if (status == UNUSED)
			return "Unused"; //$NON-NLS-1$
		else if (status == TERMINATED)
			return "Terminated"; //$NON-NLS-1$
		else if (status == EXCEPTION)
			return "Exception"; //$NON-NLS-1$
		else if (status == SKIPPED)
			return "Skipped"; //$NON-NLS-1$
		return null;
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
	 * @param child
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