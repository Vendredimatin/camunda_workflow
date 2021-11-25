package edu.thss.platform.domain.wfprocess;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.Data;

import javax.persistence.*;

@Entity
@Table(name = "PLT_BT_WFProcessToObject")
@Data
@JsonIgnoreProperties(value={"hibernateLazyInitializer","handler","fieldHandler"})
public class WfProcessToObject {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long id;

    private String taskInstanceId;

    private String processInstanceId;

    private String enClassOid;

    private String enClassName;
}
