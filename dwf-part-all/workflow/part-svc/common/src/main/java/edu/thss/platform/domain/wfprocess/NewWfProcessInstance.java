package edu.thss.platform.domain.wfprocess;

import lombok.Data;

import javax.persistence.*;


@Entity
@Table(name = "PLT_BT_NEWWFPROCESSINSTANCE")
@Data
public class NewWfProcessInstance {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long id;

    private String templateId;

    private String processName;

    private long launchTime = -1;

    // 发起流程时新增一个实体类对象 绑定oid
    private String enClassInstanceId = null;

    private String deploymentId;

    private String processInstanceId;

    private String taskDefinitionKey;
}
