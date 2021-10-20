package edu.thss.platform.service.wfprocess.BO;

import com.alibaba.fastjson.JSONArray;

public class WfProcessInstance extends ReleasedWfProcessTemplate {
    private String wfProcessId = null;
    private String launchUserId = null;
    private String launchUser = null; // launcher full name

    private String serverIp = null; // sever IP

    // 发起流程时新增一个实体类对象 绑定oid
    private String enClassInstanceId = null;
    private String code;

    private int status = 0;
    private long lastupdate = -1;

    private JSONArray proprietors = null;

    /**
     * 参与人员：这个属性是用来描述会商邀请的，该数组中放置的都是收到会商邀请的人的user Id。
     * "{"displayName":"车厘子","name":"cheney","oid":"734A25690B0FCB46AB1E9BE8719069ED","type":"user"}"
     */
    private String[] invitations = new String[0];
    /**
     * 抄送人员：流程结束后可见。
     * "{"displayName":"车厘子","name":"cheney","oid":"734A25690B0FCB46AB1E9BE8719069ED","type":"user"}"
     */
    private String[] copiers = new String[0];

    public String getWfProcessId() {
        return wfProcessId;
    }

    public void setWfProcessId(String wfProcessId) {
        this.wfProcessId = wfProcessId;
    }

    public String getLaunchUserId() {
        return launchUserId;
    }

    public void setLaunchUserId(String launchUserId) {
        this.launchUserId = launchUserId;
    }

    public String getLaunchUser() {
        return launchUser;
    }

    public void setLaunchUser(String launchUser) {
        this.launchUser = launchUser;
    }

    public String getServerIp() {
        return serverIp;
    }

    public void setServerIp(String serverIp) {
        this.serverIp = serverIp;
    }

    public String getEnClassInstanceId() {
        return enClassInstanceId;
    }

    public void setEnClassInstanceId(String enClassInstanceId) {
        this.enClassInstanceId = enClassInstanceId;
    }

    public String getCode() {
        return code;
    }

    public void setCode(String code) {
        this.code = code;
    }

    @Override
    public int getStatus() {
        return status;
    }

    @Override
    public void setStatus(int status) {
        this.status = status;
    }

    @Override
    public long getLastupdate() {
        return lastupdate;
    }

    @Override
    public void setLastupdate(long lastupdate) {
        this.lastupdate = lastupdate;
    }

    public JSONArray getProprietors() {
        return proprietors;
    }

    public void setProprietors(JSONArray proprietors) {
        this.proprietors = proprietors;
    }

    public String[] getInvitations() {
        return invitations;
    }

    public void setInvitations(String[] invitations) {
        this.invitations = invitations;
    }

    public String[] getCopiers() {
        return copiers;
    }

    public void setCopiers(String[] copiers) {
        this.copiers = copiers;
    }
}
