package edu.thss.platform.domain.wfprocess;

import java.io.Serializable;
import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.Id;
import javax.persistence.Table;
import java.sql.Timestamp;

@Entity
@Table(name = "PLT_BT_WFPROCESS")
public class BtWfProcessDO implements Serializable {
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