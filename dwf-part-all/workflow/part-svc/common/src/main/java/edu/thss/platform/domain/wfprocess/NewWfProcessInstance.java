package edu.thss.platform.domain.wfprocess;

import lombok.Data;

@Data
public class NewWfProcessInstance {

    private String templateId;

    private String processName;

    private long launchTime = -1;

    // 发起流程时新增一个实体类对象 绑定oid
    private String enClassInstanceId = null;

    private String bpmnXml;

    private String deploymentId;
}
