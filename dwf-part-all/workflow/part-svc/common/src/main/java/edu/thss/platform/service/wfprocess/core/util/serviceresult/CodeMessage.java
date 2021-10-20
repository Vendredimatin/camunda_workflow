package edu.thss.platform.service.wfprocess.core.util.serviceresult;

import java.io.Serializable;

public class CodeMessage implements Serializable {
    /**
	 * serialVersionUID
	 */
	private static final long serialVersionUID = 9120862376215168550L;
	private int code=-1;
    private String message;

    public int getCode() {
        return code;
    }

    public void setCode(int code) {
        this.code = code;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }
}
