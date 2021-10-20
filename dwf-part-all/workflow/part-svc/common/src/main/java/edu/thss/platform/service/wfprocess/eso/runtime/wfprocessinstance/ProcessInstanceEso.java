/**
 * 
 */
package edu.thss.platform.service.wfprocess.eso.runtime.wfprocessinstance;

import edu.thss.platform.service.wfprocess.core.repository.ExecuteSQLObject;
import edu.thss.platform.service.wfprocess.core.runtime.wfprocess.WfProcessInstance;
import org.springframework.jdbc.core.PreparedStatementSetter;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.stereotype.Repository;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.List;

/**
 * @author Dahai Cao created on 2018-03-21
 *         https://segmentfault.com/a/1190000005829384
 *         https://blog.csdn.net/congcong68/article/details/47183209
 */
@Repository
public class ProcessInstanceEso extends ExecuteSQLObject{
	private final String collectionname = "process_instance";

	private final static ProcessInstanceEso instance = new ProcessInstanceEso();
	/**
	 * 
	 */
	public ProcessInstanceEso() {
//		this.nosqlTemplate = nosqlTemplate;
	}

	public static ProcessInstanceEso getInstance() {
		return instance;
	}

	public WfProcessInstance queryInstanceById(String piid) {
		return null;
//		return nosqlTemplate.findById(piid, WfProcessInstance.class, collectionname);
	}

	public List<String> getInsts() throws Exception {
		String sql = "select instContent from plt_wfprocessinst";
		List<String> resList = jdbcTemplate.query(sql, new RowMapper<String>() {
			public String mapRow(ResultSet rs, int rowNum) throws SQLException {
				return rs.getString("instContent");
			}
		});
		return resList;
	}


	public void saveInst(String id, String json) throws Exception {
		int res = update(id, json);
		if (res == 0) insert(id, json);
	}

	// 保存历史
	public void saveHist(String id, String json) throws Exception {
		int res = updateHist(id, json);
		if (res == 0) insertHist(id, json);
	}

	public void deleteAllHists() throws Exception{
		String sql ="select count (*) from plt_wfprocesshist";
		sql = "TRUNCATE TABLE plt_wfprocesshist";
		jdbcTemplate.update(sql);
		String sql2 = "TRUNCATE TABLE plt_wfprocessinst";
		jdbcTemplate.update(sql2);
	}
	public List<String> getAllInstsId() throws Exception {
		String sql = "select oid from plt_wfprocessinst";
		List<String> resList = jdbcTemplate.query(sql, new RowMapper<String>() {
			public String mapRow(ResultSet rs, int rowNum) throws SQLException {
				return rs.getString("oid");
			}
		});
		return resList;
	}

	public List<String> getAllHistsId() throws Exception {
		String sql = "select oid from plt_wfprocesshist";
		List<String> resList = jdbcTemplate.query(sql, new RowMapper<String>() {
			public String mapRow(ResultSet rs, int rowNum) throws SQLException {
				return rs.getString("oid");
			}
		});
		return resList;
	}
	public List<String> getHists() throws Exception {
		String sql = "select instContent from plt_wfprocesshist";
		List<String> resList = jdbcTemplate.query(sql, new RowMapper<String>() {
			public String mapRow(ResultSet rs, int rowNum) throws SQLException {
				return rs.getString("instContent");
			}
		});
		return resList;
	}
	public String loadHist(String id) throws Exception {
		String sql = "select instContent from plt_wfprocesshist where oid=?";
		List<String> resList = jdbcTemplate.query(sql, new RowMapper<String>() {
			public String mapRow(ResultSet rs, int rowNum) throws SQLException {
				return rs.getString("instContent");
			}
		}, id);

		if (!resList.isEmpty()) {
			return resList.get(0);
		} else
			return null;
	}


	public String loadInst(String id) throws Exception {
		String sql = "select instContent from plt_wfprocessinst where oid=?";
		List<String> resList = jdbcTemplate.query(sql, new RowMapper<String>() {
			public String mapRow(ResultSet rs, int rowNum) throws SQLException {
				return rs.getString("instContent");
			}
		}, id);

		if (!resList.isEmpty()) {
			return resList.get(0);
		} else
			return null;
	}


	public void removeInst(String id) throws Exception {
		String sql = "delete from plt_wfprocessinst where oid=?";
		jdbcTemplate.update(sql, new Object[] { id });
	}

	public int insert(String id, String json) throws SQLException {
		String sql = "insert into plt_wfprocessinst "
				+ "(oid, instContent) "
				+ "values (?,?)";
		int res = jdbcTemplate.update(sql, new PreparedStatementSetter() {
			@Override
			public void setValues(PreparedStatement stmt) throws SQLException {
				stmt.setString(1, id);
				stmt.setString(2, json);
			}
		});
		return res;
	}

	public int update(String id, String json) throws SQLException {
		String sql = "update plt_wfprocessinst "
				+ "set instContent=? where oid=?";
		int res = jdbcTemplate.update(sql, new PreparedStatementSetter() {
			@Override
			public void setValues(PreparedStatement stmt) throws SQLException {
				stmt.setString(1, json);
				stmt.setString(2, id);
			}
		});
		return res;
	}


	public int insertHist(String id, String json) throws SQLException {
		String sql = "insert into plt_wfprocesshist "
				+ "(oid, instContent) "
				+ "values (?,?)";
		int res = jdbcTemplate.update(sql, new PreparedStatementSetter() {
			@Override
			public void setValues(PreparedStatement stmt) throws SQLException {
				stmt.setString(1, id);
				stmt.setString(2, json);
			}
		});
		return res;
	}

	public int updateHist(String id, String json) throws SQLException {
		String sql = "update plt_wfprocesshist "
				+ "set instContent=? where oid=?";
		int res = jdbcTemplate.update(sql, new PreparedStatementSetter() {
			@Override
			public void setValues(PreparedStatement stmt) throws SQLException {
				stmt.setString(1, json);
				stmt.setString(2, id);
			}
		});
		return res;
	}

}