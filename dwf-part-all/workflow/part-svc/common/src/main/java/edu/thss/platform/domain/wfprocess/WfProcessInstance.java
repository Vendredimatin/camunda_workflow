package edu.thss.platform.domain.wfprocess;

import lombok.Data;

import javax.persistence.*;


@Entity
@Table(name = "PLT_BT_WFPROCESSINSTANCE")
@Data
public class WfProcessInstance {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long id;

    private String processInstanceId;

    private String processDefinitionId;

    private String processDeploymentId;

    private long launchTime = -1;

    private String taskDefinitionKey;

    private String taskInstanceId;
}
