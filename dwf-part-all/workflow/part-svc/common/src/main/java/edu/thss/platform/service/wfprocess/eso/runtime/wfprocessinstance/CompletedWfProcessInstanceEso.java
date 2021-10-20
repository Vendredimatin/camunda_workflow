///**
// *
// */
//package edu.thss.platform.service.wfprocess.eso.runtime.wfprocessinstance;
//
//import edu.thss.platform.service.wfprocess.core.repository.ExecuteNoSQLObject;
//import edu.thss.platform.service.wfprocess.core.runtime.wfprocess.WfProcessInstance;
//import org.apache.log4j.Logger;
//import org.springframework.beans.factory.annotation.Autowired;
//import org.springframework.jdbc.core.RowMapper;
//import org.springframework.stereotype.Repository;
//
//import java.sql.ResultSet;
//import java.sql.SQLException;
//import java.util.List;
//
///**
// * @author Dahai Cao created on 2018-03-21
// *         https://segmentfault.com/a/1190000005829384
// *         https://blog.csdn.net/congcong68/article/details/47183209
// */
//@Repository
//public class CompletedWfProcessInstanceEso extends ExecuteNoSQLObject {
//	private final String collectionname = "process_instance";
//	/**
//	 *
//	 */
//	private final static CompletedWfProcessInstanceEso instance = new CompletedWfProcessInstanceEso();
//	@Autowired
//	public CompletedWfProcessInstanceEso() {
////		super();
////		logger = Logger.getLogger(CompletedWfProcessInstanceEso.class.getName());
//	}
//
//	public static CompletedWfProcessInstanceEso getInstance() {
//		return instance;
//	}
//
//
//	public void insert(WfProcessInstance instanceString) throws Exception {
////		nosqlTemplate.save(instanceString, collectionname);
//	}
//
//	public WfProcessInstance query(String piid) {
//		return null;
////		return nosqlTemplate.findById(piid, WfProcessInstance.class, collectionname);
//	}
//
////	public List<String> getInsts() throws Exception {
////		String sql = "select instContent from plt_wfprocesshist";
////		List<String> resList = jdbcTemplate.query(sql, new RowMapper<String>() {
////			public String mapRow(ResultSet rs, int rowNum) throws SQLException {
////				return rs.getString("instContent");
////			}
////		});
////		return resList;
////	}
//
//
//
//}