package edu.thss.platform.service.wfprocess.core.runtime.util;

import edu.thss.platform.service.wfprocess.core.TreeNode;
import edu.thss.platform.service.wfprocess.core.WorkflowEntity;
import edu.thss.platform.service.wfprocess.core.buildtime.wfprocess.Transition;
import edu.thss.platform.service.wfprocess.core.buildtime.wfprocess.task.AbstractTask;

public class AssignOwnerIDUtil {

	public static void changeOwner(TreeNode parent, WorkflowEntity newOwner) throws Exception {
		changeChildrenOwner(parent, newOwner);
		for (WorkflowEntity task : parent.getChildren()) {
			if (task instanceof AbstractTask && ((AbstractTask) task).hasOutputs()) {
				for (Transition t : ((AbstractTask) task).getOutputs()) {
					t.setOwner(newOwner.getId());
				}
			}
		}
	}

	private static void changeChildrenOwner(TreeNode parent, WorkflowEntity owner) throws Exception {
		parent.setOwner(owner.getId());
		for (TreeNode node : parent.getChildren()) {
			changeChildrenOwner(node, owner);
		}
	}

	public static void changeCurrOwner(TreeNode parent, String newCurrOwnerId) throws Exception {
		changeChildrenCurrOwner(parent, newCurrOwnerId);
		for (WorkflowEntity task : parent.getChildren()) {
			if (task instanceof AbstractTask && ((AbstractTask) task).hasOutputs()) {
				for (Transition t : ((AbstractTask) task).getOutputs()) {
					t.setCurrOwner(newCurrOwnerId);
				}
			}
		}
	}

	private static void changeChildrenCurrOwner(TreeNode parent, String newCurrOwnerId) throws Exception {
		parent.setCurrOwner(newCurrOwnerId);
		for (TreeNode node : parent.getChildren()) {
			changeChildrenCurrOwner(node, newCurrOwnerId);
		}
	}
}
