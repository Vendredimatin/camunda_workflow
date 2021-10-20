package edu.thss.platform.service.wfprocess.BO;

import edu.thss.platform.service.wfprocess.core.buildtime.release.wfprocess.ReleasedWfProcess;

public class ReleasedWfProcessTemplate extends WfProcessTemplate{

    private String templateId = null;
    private String version = null;
    private String releaserId = null;
    private String releaser = null;
    private String releaseStatement = null;
    private long releaseDate = 0;
    private String description = "";

    public void initByWfProcess(ReleasedWfProcess pro){
        this.version = pro.getVersion();
        this.releaseDate = pro.getReleaseDate();
        this.version = pro.getVersion();
        this.releaser = pro.getReleaser();
        this.releaserId = pro.getReleaserId();
        this.description = pro.getDescription();
        super.initByWfProcess(pro);

    }
    public String getTemplateId() {
        return templateId;
    }

    public void setTemplateId(String templateId) {
        this.templateId = templateId;
    }

    public String getVersion() {
        return version;
    }

    public void setVersion(String version) {
        this.version = version;
    }

    public String getReleaserId() {
        return releaserId;
    }

    public void setReleaserId(String releaserId) {
        this.releaserId = releaserId;
    }

    public String getReleaser() {
        return releaser;
    }

    public void setReleaser(String releaser) {
        this.releaser = releaser;
    }

    public String getReleaseStatement() {
        return releaseStatement;
    }

    public void setReleaseStatement(String releaseStatement) {
        this.releaseStatement = releaseStatement;
    }

    public long getReleaseDate() {
        return releaseDate;
    }

    public void setReleaseDate(long releaseDate) {
        this.releaseDate = releaseDate;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }
}
