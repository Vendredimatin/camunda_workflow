package edu.thss.platform.domain.wfprocess;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.RequiredArgsConstructor;

import javax.persistence.*;
import java.io.Serializable;
import java.sql.Timestamp;

@Entity
@Table(name = "PLT_BT_WFPROCESSDEFINITION")
@Data
@JsonIgnoreProperties(value={"hibernateLazyInitializer","handler","fieldHandler"})
@NoArgsConstructor
public class WfProcessDefinition {

    @Id
    @GeneratedValue(strategy= GenerationType.IDENTITY)
    @Column(name = "id")
    private long id;

    @Column(name = "ProcessName", columnDefinition = "varchar(512)")
    private String name;

    @Column(name = "Keywords", columnDefinition = "varchar(1024)")
    private String keywords;

    @Column(name = "Author", columnDefinition = "varchar(512)")
    private String author;

    @Column(name = "AuthorId", columnDefinition = "varchar(32)")
    private String authorId;

    @Column(name = "Lastupdate", columnDefinition = "timestamp")
    private Timestamp lastUpdate;

    @Column(name = "ClassName", columnDefinition = "varchar(32)")
    private String className;

    private String classDisplayName;

    private Boolean isDeploy = false;

    private String processDeploymentId;

    @Column(name = "releaseDate", columnDefinition = "timestamp")
    private Timestamp releaseDate;

    @Column(name = "BpmnXml", columnDefinition = "text")
    private String bpmnXml;

    public WfProcessDefinition(String name, String keywords, String author, String authorId, Timestamp lastUpdate,String className,String classDisplayName, String bpmnXml) {
        this.name = name;
        this.keywords = keywords;
        this.author = author;
        this.authorId = authorId;
        this.lastUpdate = lastUpdate;
        this.className = className;
        this.classDisplayName = classDisplayName;
        this.bpmnXml = bpmnXml;
    }
}
