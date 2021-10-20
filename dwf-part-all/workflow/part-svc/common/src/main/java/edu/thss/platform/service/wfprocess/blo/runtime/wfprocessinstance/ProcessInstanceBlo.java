package edu.thss.platform.service.wfprocess.blo.runtime.wfprocessinstance;

import edu.thss.platform.service.wfprocess.core.buildtime.wfprocess.ParticipationType;
import edu.thss.platform.service.wfprocess.core.repository.BusinessLogicObject;
import edu.thss.platform.service.wfprocess.core.runtime.util.WfProcessInstanceUncloner;
import edu.thss.platform.service.wfprocess.core.runtime.wfprocess.WfProcessInstance;
import edu.thss.platform.service.wfprocess.core.runtime.workitem.WorkitemInfoDescriptor;
import edu.thss.platform.service.wfprocess.runtime.server.SaaSServer;

import javax.transaction.Transactional;

/**
 * 未使用
 */
@Transactional
public class ProcessInstanceBlo extends BusinessLogicObject {

	private final static ProcessInstanceBlo instance = new ProcessInstanceBlo();

	private ProcessInstanceBlo() {
	}

	public static ProcessInstanceBlo getInstance() {
		return instance;
	}

	public WfProcessInstance getProcessInstance(String piid) throws Exception {
//        CompletedWfProcessInstanceEso piEso = new CompletedWfProcessInstanceEso();
//		WfProcessInstance instance = piEso.query(piid);
		WfProcessInstance instance = null;
		return WfProcessInstanceUncloner.unclone(instance);
    }

	public static WorkitemInfoDescriptor getCurrWorkItemforSWf(WfProcessInstance inst,
														 String tid,
														 String userid,
														 String ipv4,
														 String fullname)
			throws Exception {
		WorkitemInfoDescriptor r = new WorkitemInfoDescriptor();
		if (inst.getWorkflowType() == ParticipationType.SINGLE_PARTICIPANT_APP) { //
			while (r != null) {
				r = SaaSServer.getInstance().fetchManualTaskInstanceforSWf(inst.getId(), tid, userid, "", fullname);
				if (r != null && r.getId() != null) {
					if (!r.getId().equals(tid)) {
						break;
					} else {
						Thread.sleep(1000);
					}
				}
			}
		}
		if (r != null) {
			r.setWfProcessInstanceId(inst.getId());
			r.setWorkflowType(inst.getWorkflowType());
			r.setWfProcessInstanceStatus(inst.getStatus());
			r.setEnClassInstanceId(inst.getEnClassInstanceId());
			r.setBindEnClassName(inst.getBindEnClassName());
			r.setLaunchDateTime(inst.getLaunchTime());
			r.setLaunchUserId(inst.getLaunchUserId());
			r.setServerIp("localhost");
		}
		return r;
	}
}
