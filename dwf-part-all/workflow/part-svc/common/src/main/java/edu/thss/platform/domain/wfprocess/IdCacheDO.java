package edu.thss.platform.domain.wfprocess;

import java.io.Serializable;
import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.Id;
import javax.persistence.Table;

@Entity
@Table(name = "PLT_IDCACHE")
public class IdCacheDO implements Serializable {
    private static final long serialVersionUID = 1L;

    @Id
    @Column(name = "PrimaryKey", columnDefinition = "INTEGER")
    private int primaryKey;

    @Column(name = "BuildtimeCode", columnDefinition = "varchar(16)")
    private String buildtimeCode;

    @Column(name = "RuntimeCode", columnDefinition = "varchar(32)")
    private String runtimeCode;

    @Column(name = "SerialCode", columnDefinition = "varchar(10)")
    private String serialCode;

    @Column(name = "VersionNumber", columnDefinition = "INTEGER")
    private int versionNumber;

    @Column(name = "UniCounting", columnDefinition = "INTEGER")
    private int uniCounting;

    public static long getSerialVersionUID() {
        return serialVersionUID;
    }

    public int getPrimaryKey() {
        return primaryKey;
    }

    public void setPrimaryKey(int primaryKey) {
        this.primaryKey = primaryKey;
    }

    public String getBuildtimeCode() {
        return buildtimeCode;
    }

    public void setBuildtimeCode(String buildtimeCode) {
        this.buildtimeCode = buildtimeCode;
    }

    public String getRuntimeCode() {
        return runtimeCode;
    }

    public void setRuntimeCode(String runtimeCode) {
        this.runtimeCode = runtimeCode;
    }

    public String getSerialCode() {
        return serialCode;
    }

    public void setSerialCode(String serialCode) {
        this.serialCode = serialCode;
    }

    public int getVersionNumber() {
        return versionNumber;
    }

    public void setVersionNumber(int versionNumber) {
        this.versionNumber = versionNumber;
    }

    public int getUniCounting() {
        return uniCounting;
    }

    public void setUniCounting(int uniCounting) {
        this.uniCounting = uniCounting;
    }
}

