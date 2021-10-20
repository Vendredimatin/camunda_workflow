package edu.thss.platform.service.wfprocess.blo.buildtime.id;

import edu.thss.platform.service.wfprocess.core.repository.BusinessLogicObject;
import edu.thss.platform.service.wfprocess.eso.idcache.IDGeneratorEso;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

public class BuildtimeIDGenerator extends BusinessLogicObject {

	private IDGeneratorEso idGeneratorEso;

	public BuildtimeIDGenerator() {
		this.idGeneratorEso = new IDGeneratorEso();
	}

	public String getNewRunTimeID() throws Exception {
		return idGeneratorEso.generateRuntimeId();
	}

	
	public String getNewBuildTimeID() throws Exception {
		return idGeneratorEso.generateBuildtimeId();
	}

	
	public String getNewBuildTimeCode() throws Exception {
		return idGeneratorEso.generateBuildtimeSerialCode();
	}

	
	public String getNewBuildTimeVersionNo() throws Exception {
		return idGeneratorEso.generateNewVersionNo();
	}

	
	public String getNewBuildTimeUniCounting() throws Exception {
		return idGeneratorEso.generateBuildtimeUniCounting();
	}

//	public static void main(String [] args) {
//		try {
//			// 获取一个ID
//			String id = getNewBuildTimeID();
//			System.out.println(id);
//		} catch (Exception e) {
//			e.printStackTrace();
//		}
//	}

}
