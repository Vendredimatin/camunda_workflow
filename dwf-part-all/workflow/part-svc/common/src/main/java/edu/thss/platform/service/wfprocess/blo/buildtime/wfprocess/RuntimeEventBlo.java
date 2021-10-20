package edu.thss.platform.service.wfprocess.blo.buildtime.wfprocess;

public class RuntimeEventBlo {
    private final RuntimeEventBlo runtimeEventBlo;

    public RuntimeEventBlo() {
        this.runtimeEventBlo = new RuntimeEventBlo();
    }

    public RuntimeEventBlo getInstance(){
        return this.runtimeEventBlo;
    }

    public void saveLogs(String eventlogs){

    }
}
