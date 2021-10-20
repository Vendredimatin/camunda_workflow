package edu.thss.platform.service.wfprocess.core.runtime.wfprocess;

import edu.thss.platform.service.wfprocess.core.Page;

public class ProcessInstancePage extends Page {

    /**
	 * serialVersionUID
	 */
	private static final long serialVersionUID = -4187263051791394414L;
	private WfProcessInstance[] pageEntities = new WfProcessInstance[0];

    public ProcessInstancePage(int pageNo, int pageSize) {
        super(pageNo, pageSize);
    }

    public ProcessInstancePage() {
    }

    public WfProcessInstance[] getPageEntities() {
        return pageEntities;
    }

    public void setPageEntities(WfProcessInstance[] pageEntities) {
        this.pageEntities = pageEntities;
    }
}
