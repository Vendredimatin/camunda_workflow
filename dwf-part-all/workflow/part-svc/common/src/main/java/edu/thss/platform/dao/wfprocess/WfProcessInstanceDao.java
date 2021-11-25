package edu.thss.platform.dao.wfprocess;

import edu.thss.platform.domain.wfprocess.WfProcessInstance;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface WfProcessInstanceDao extends JpaRepository<WfProcessInstance, Long> {

    public List<WfProcessInstance> findAllByProcessInstanceIdIn(List<String> processInstanceIds);

    public WfProcessInstance findByProcessInstanceId(String processInstanceId);
}
