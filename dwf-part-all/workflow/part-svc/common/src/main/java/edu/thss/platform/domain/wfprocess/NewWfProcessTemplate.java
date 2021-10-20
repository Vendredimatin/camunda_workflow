package edu.thss.platform.domain.wfprocess;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.Data;

import javax.persistence.*;
import java.io.Serializable;
import java.sql.Timestamp;

@Entity
@Table(name = "PLT_BT_WFPROCESSTEMPLATE")
@Data
@JsonIgnoreProperties(value={"hibernateLazyInitializer","handler","fieldHandler"})
public class NewWfProcessTemplate {

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
    private Timestamp lastupdate;

    @Column(name = "BindEnClassName", columnDefinition = "varchar(32)")
    private String bindEnClassName;

    @Column(name = "BpmnXml", columnDefinition = "text")
    private String bpmnXml;
}
