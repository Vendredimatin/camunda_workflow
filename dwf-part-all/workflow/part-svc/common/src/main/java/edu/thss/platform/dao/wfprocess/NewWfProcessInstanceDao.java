package edu.thss.platform.dao.wfprocess;

import edu.thss.platform.domain.wfprocess.NewWfProcessInstance;
import edu.thss.platform.domain.wfprocess.NewWfProcessTemplate;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface NewWfProcessInstanceDao extends JpaRepository<NewWfProcessInstance, Long> {

    public List<NewWfProcessInstance> findAllByProcessInstanceIdIn(List<String> processInstanceIds);

    public NewWfProcessInstance findByProcessInstanceId(String processInstanceId);
}
