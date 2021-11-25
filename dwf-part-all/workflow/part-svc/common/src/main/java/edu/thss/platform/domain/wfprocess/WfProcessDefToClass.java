package edu.thss.platform.domain.wfprocess;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.Data;
import lombok.NoArgsConstructor;

import javax.persistence.*;

@Entity
@Table(name = "PLT_BT_WfProcessDefToClass")
@Data
@JsonIgnoreProperties(value={"hibernateLazyInitializer","handler","fieldHandler"})
@NoArgsConstructor
public class WfProcessDefToClass {

    @Id
    @GeneratedValue(strategy= GenerationType.IDENTITY)
    @Column(name = "id")
    private long id;

    private String processDefinitionId;

    private String className;

    public WfProcessDefToClass(String processDefinitionId, String className) {
        this.processDefinitionId = processDefinitionId;
        this.className = className;
    }
}
