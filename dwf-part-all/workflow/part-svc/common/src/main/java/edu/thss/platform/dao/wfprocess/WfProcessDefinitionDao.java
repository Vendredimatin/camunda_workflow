package edu.thss.platform.dao.wfprocess;

import edu.thss.platform.domain.wfprocess.WfProcessDefinition;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface WfProcessDefinitionDao extends JpaRepository<WfProcessDefinition, Long> {
    List<WfProcessDefinition> findAllByAuthorId(String authorId);

    List<WfProcessDefinition> findAllByAuthorIdAndIsDeploy(String authorId, boolean isDeploy);

    List<WfProcessDefinition> findAllByIsDeploy(boolean isDeploy);
}
