package edu.thss.platform.dao.wfprocess;

import edu.thss.platform.domain.wfprocess.WfProcessDefToClass;
import edu.thss.platform.domain.wfprocess.WfProcessDefinition;
import org.springframework.data.jpa.repository.JpaRepository;

public interface WfProcessDefToClassDao extends JpaRepository<WfProcessDefToClass, Long> {
}
