package edu.thss.platform.dao.wfprocess;

import edu.thss.platform.domain.wfprocess.WfProcessToObject;
import org.springframework.data.jpa.repository.JpaRepository;

public interface WfProcessToObjectDao extends JpaRepository<WfProcessToObject, Long> {

    WfProcessToObject getByProcessInstanceIdAndTaskInstanceId(String processInstanceId, String taskInstanceId);
}
