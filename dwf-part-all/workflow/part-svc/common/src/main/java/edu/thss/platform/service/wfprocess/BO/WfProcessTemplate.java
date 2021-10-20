package edu.thss.platform.service.wfprocess.BO;

import edu.thss.platform.service.wfprocess.core.buildtime.wfprocess.WfProcess;

import java.io.Serializable;

public class WfProcessTemplate implements Serializable {

    private String id = null;
    private String name = null;
    private int processType = 0;
    private String keywords = null;
    private String authorId;
    private String author;
    private int status = 0;
    private long lastupdate = -1;
    private String bindEnClassName = null;

    public void initByWfProcess(WfProcess pro){
        this.id =  pro.getId();
        this.name = pro.getName();
        this.author = pro.getAuthor();
        this.authorId = pro.getAuthorId();
        this.lastupdate = pro.getLastupdate();
        this.keywords = pro.getKeywords();
        this.bindEnClassName = pro.getBindEnClassName();
        this.processType = pro.getProcessType();
    }

    public int getProcessType() {
        return processType;
    }

    public void setProcessType(int processType) {
        this.processType = processType;
    }

    public String getKeywords() {
        return keywords;
    }

    public void setKeywords(String keywords) {
        this.keywords = keywords;
    }

    public String getAuthorId() {
        return authorId;
    }

    public void setAuthorId(String authorId) {
        this.authorId = authorId;
    }

    public String getAuthor() {
        return author;
    }

    public void setAuthor(String author) {
        this.author = author;
    }

    public int getStatus() {
        return status;
    }

    public void setStatus(int status) {
        this.status = status;
    }

    public long getLastupdate() {
        return lastupdate;
    }

    public void setLastupdate(long lastupdate) {
        this.lastupdate = lastupdate;
    }

    public String getBindEnClassName() {
        return bindEnClassName;
    }

    public void setBindEnClassName(String bindEnClassName) {
        this.bindEnClassName = bindEnClassName;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }
}
