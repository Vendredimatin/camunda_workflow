package edu.thss.platform.domain.wfprocess;

import lombok.Data;
import lombok.Getter;
import lombok.Setter;

import javax.persistence.*;
import java.sql.Timestamp;

@Entity
@Table(name = "PLT_BT_RELEASEDWFPROCESSTEMPLATE")
@Data
public class ReleasedWfProcessTemplate {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ProcessId")
    private long id;

    @Column(name = "ProcessCode", columnDefinition = "varchar(32)")
    private String code;

    @Column(name = "ProcessName", columnDefinition = "varchar(512)")
    private String name;

    @Column(name = "Description", columnDefinition = "text")
    private String description;

    @Column(name = "Keywords", columnDefinition = "varchar(1024)")
    private String keywords;

    @Column(name = "Author", columnDefinition = "varchar(512)")
    private String author;

    @Column(name = "AuthorId", columnDefinition = "varchar(32)")
    private String authorId;

    @Column(name = "Lastupdate", columnDefinition = "timestamp")
    private Timestamp lastupdate;

    @Column(name = "BindEnClassName", columnDefinition = "varchar(32)")
    private String bindEnClassName;

    @Column(name = "Version", columnDefinition = "varchar(32)")
    private String version;

    @Column(name = "Releaser", columnDefinition = "varchar(32)")
    private String releaser;

    @Column(name = "ReleaserId", columnDefinition = "varchar(32)")
    private String releaserId;

    @Column(name = "BpmnXml", columnDefinition = "text")
    private String bpmnXml;

    @Column(name = "DeploymentId")
    private String deploymentId;
}
