package edu.thss.platform.domain.wfprocess;

import java.io.Serializable;
import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.Id;
import javax.persistence.Table;
import java.sql.Timestamp;

@Entity
@Table(name = "PLT_RL_WFPROCESS")
public class RlWfProcessDO implements Serializable {
    private static final long serialVersionUID = 1L;

    @Id
    @Column(name = "Pk_WfProcess", columnDefinition = "varchar(32)")
    private String pk_wfprocess;

    @Column(name = "ProcessCode", columnDefinition = "varchar(32)")
    private String processCode;

    @Column(name = "ProcessName", columnDefinition = "varchar(512)")
    private String processName;

    @Column(name = "ProcessType", columnDefinition = "smallint")
    private int processType;

    @Column(name = "WorkflowType", columnDefinition = "smallint")
    private int workflowType;

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

    @Column(name = "Status", columnDefinition = "smallint")
    private int status;

    @Column(name = "Version", columnDefinition = "varchar(512)")
    private String version;

    @Column(name = "Releaser", columnDefinition = "varchar(512)")
    private String releaser;

    @Column(name = "ReleaserId", columnDefinition = "varchar(32)")
    private String releaserId;

    @Column(name = "ReleaseStatement", columnDefinition = "text")
    private String releaseStatement;

    @Column(name = "ReleaseDate", columnDefinition = "timestamp")
    private Timestamp releaseDate;

    @Column(name = "Fk_Parent", columnDefinition = "varchar(32)")
    private String fk_parent;

    @Column(name = "Fk_Owner", columnDefinition = "varchar(32)")
    private String fk_owner;

    @Column(name = "BindEnClassName", columnDefinition = "varchar(32)")
    private String bindEnClassName;

    @Column(name = "Proprietors", columnDefinition = "text")
    private String proprietors;

    public static long getSerialVersionUID() {
        return serialVersionUID;
    }

    public String getPk_wfprocess() {
        return pk_wfprocess;
    }

    public void setPk_wfprocess(String pk_wfprocess) {
        this.pk_wfprocess = pk_wfprocess;
    }

    public String getProcessCode() {
        return processCode;
    }

    public void setProcessCode(String processCode) {
        this.processCode = processCode;
    }

    public String getProcessName() {
        return processName;
    }

    public void setProcessName(String processName) {
        this.processName = processName;
    }

    public int getProcessType() {
        return processType;
    }

    public void setProcessType(int processType) {
        this.processType = processType;
    }

    public int getWorkflowType() {
        return workflowType;
    }

    public void setWorkflowType(int workflowType) {
        this.workflowType = workflowType;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getKeywords() {
        return keywords;
    }

    public void setKeywords(String keywords) {
        this.keywords = keywords;
    }

    public String getAuthor() {
        return author;
    }

    public void setAuthor(String author) {
        this.author = author;
    }

    public String getAuthorId() {
        return authorId;
    }

    public void setAuthorId(String authorId) {
        this.authorId = authorId;
    }

    public Timestamp getLastupdate() {
        return lastupdate;
    }

    public void setLastupdate(Timestamp lastupdate) {
        this.lastupdate = lastupdate;
    }

    public int getStatus() {
        return status;
    }

    public void setStatus(int status) {
        this.status = status;
    }

    public String getVersion() {
        return version;
    }

    public void setVersion(String version) {
        this.version = version;
    }

    public String getReleaser() {
        return releaser;
    }

    public void setReleaser(String releaser) {
        this.releaser = releaser;
    }

    public String getReleaserId() {
        return releaserId;
    }

    public void setReleaserId(String releaserId) {
        this.releaserId = releaserId;
    }

    public String getReleaseStatement() {
        return releaseStatement;
    }

    public void setReleaseStatement(String releaseStatement) {
        this.releaseStatement = releaseStatement;
    }

    public Timestamp getReleaseDate() {
        return releaseDate;
    }

    public void setReleaseDate(Timestamp releaseDate) {
        this.releaseDate = releaseDate;
    }

    public String getFk_parent() {
        return fk_parent;
    }

    public void setFk_parent(String fk_parent) {
        this.fk_parent = fk_parent;
    }

    public String getFk_owner() {
        return fk_owner;
    }

    public void setFk_owner(String fk_owner) {
        this.fk_owner = fk_owner;
    }

    public String getBindEnClassName() {
        return bindEnClassName;
    }

    public void setBindEnClassName(String bindEnClassName) {
        this.bindEnClassName = bindEnClassName;
    }

    public String getProprietors() {
        return proprietors;
    }

    public void setProprietors(String proprietors) {
        this.proprietors = proprietors;
    }
}