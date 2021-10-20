package edu.thss.platform.service.wfprocess.eso.buildtime.wfprocess;

import edu.thss.platform.domain.wfprocess.RlWfProcessDO;
import edu.thss.platform.service.wfprocess.core.buildtime.release.wfprocess.ReleasedWfProcess;
import edu.thss.platform.service.wfprocess.core.repository.ExecuteSQLObject;
import org.apache.commons.lang.StringEscapeUtils;
import com.alibaba.fastjson.JSONArray;
import org.springframework.jdbc.core.PreparedStatementSetter;
import org.springframework.jdbc.core.RowMapper;

import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Timestamp;
import java.util.Date;
import java.util.List;
import java.util.ArrayList;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import edu.thss.platform.domain.wfprocess.RlWfProcessDO;
import edu.thss.platform.dao.wfprocess.RlWfProcessDao;

/**
 * This class optimized released process read/write performance from/into
 * business repository. It changed task storage from DB table to JSON.
 * 
 * @author Dahai Cao created 20170808
 */
public class ReleasedWfProcessEso extends ExecuteSQLObject{

	public ReleasedWfProcessEso() {
	}

	public int checkVersion(String name, String version) throws Exception {
		String sql = "Select Pk_WfProcess from plt_rl_wfprocess where ProcessName=? and Version=?";
		List<String> res = jdbcTemplate.query(sql, new Object[] { name, version }, new RowMapper<String>() {
			public String mapRow(ResultSet rs, int rowNum) throws SQLException {
				return rs.getString("Pk_WfProcess");
			}
		});
		if (res.size() > 0) return 1;
		else return 0;
	}
	public ReleasedWfProcess getProcessFromResultSet(ReleasedWfProcess proc, ResultSet rs) throws Exception {
		proc.setId(rs.getString("Pk_WfProcess"));
		proc.setCode(rs.getString("ProcessCode"));
		proc.setName(rs.getString("ProcessName"));
		proc.setProcessType(rs.getInt("ProcessType"));
		proc.setWorkflowType(rs.getInt("WorkflowType"));
		proc.setDescription(rs.getString("Description"));
		proc.setKeywords(rs.getString("Keywords"));
		proc.setAuthor(rs.getString("Author"));
		proc.setLastupdate(rs.getTimestamp("Lastupdate").getTime());
		proc.setStatus(rs.getInt("Status"));
		proc.setVersion(rs.getString("Version"));
		proc.setReleaser(rs.getString("Releaser"));
		proc.setReleaseStatement(rs.getString("ReleaseStatement"));
		proc.setReleaseDate(rs.getTimestamp("ReleaseDate").getTime());
		proc.setParent(rs.getString("Fk_Parent"));
		proc.setOwner(rs.getString("Fk_Owner"));
		proc.setAuthorId(rs.getString("AuthorId"));
		proc.setReleaserId(rs.getString("ReleaserId"));
		proc.setBindEnClassName(rs.getString("BindEnClassName"));
		proc.setProcessContent(rs.getString("ProcessContent"));
		if(rs.getString("Proprietors")!=null)
			proc.setProprietors(JSONArray.parseArray(rs.getString("Proprietors")));
		return proc;
	}

	/**
	 * Returns all the displayed business processes from repository. The
	 * displayed business process means that these are displayed in process
	 * explorer.
	 * 
	 * @param fk_parent
	 * @param fk_owner
	 * @return
	 * @throws Exception
	 */
	public List<ReleasedWfProcess> queryAll(String fk_parent, String fk_owner) throws Exception {
		String sql = "Select Pk_WfProcess,ProcessCode,ProcessName,ProcessType,WorkflowType,Description,Keywords,"
				+ "Author,Lastupdate,Status,Version,Releaser,ReleaseStatement,ReleaseDate,ProcessContent,"
				+ "Fk_Parent,Fk_Owner,AuthorId,ReleaserId,Proprietors from plt_rl_wfprocess where Fk_Parent=? and Fk_Owner=?";
		List<ReleasedWfProcess> procList = jdbcTemplate.query(sql, new Object[] { fk_parent, fk_owner },
				new RowMapper<ReleasedWfProcess>() {
					public ReleasedWfProcess mapRow(ResultSet rs, int rowNum) throws SQLException {
						try {
							return getProcessFromResultSet(new ReleasedWfProcess(), rs);
						} catch (Exception e) {
							e.printStackTrace();
						}
						return null;
					}
				});
		
		return procList;
	}
	// 从数据库中获取所有绑定指定实体类的已发布的流程模版
	public List<ReleasedWfProcess> queryAllByEnClass(String ename) throws Exception {
		String sql = "Select Pk_WfProcess,ProcessCode,ProcessName,ProcessType,WorkflowType,Description,Keywords,"
				+ "Author,Lastupdate,Status,Version,Releaser,ReleaseStatement,ReleaseDate,Fk_Parent,"
				+"Fk_Owner,ProcessContent,AuthorId,ReleaserId,BindEnClassName,Proprietors"
				+" from plt_rl_wfprocess where BindEnClassName = ? ";
		List<ReleasedWfProcess> procList = jdbcTemplate.query(sql, new Object[] { ename },
				new RowMapper<ReleasedWfProcess>() {
					public ReleasedWfProcess mapRow(ResultSet rs, int rowNum) throws SQLException {
						try {
							return getProcessFromResultSet(new ReleasedWfProcess(), rs);
						} catch (Exception e) {
							e.printStackTrace();
						}
						return null;
					}
				});
		return procList;
	}

	// 从数据库中获取所有绑定指定实体类的流程模版Id
	public List<String> queryAllIdByEnClass(String ename) throws Exception {
		String sql = "Select Pk_WfProcess from plt_rl_wfprocess where BindEnClassName = ?";
		List<String> procList = jdbcTemplate.query(sql, new Object[] { ename },
				new RowMapper<String>() {
					public String mapRow(ResultSet rs, int rowNum) throws SQLException {
						try {
							String s = rs.getString("Pk_WfProcess");
							return s;
						} catch (Exception e) {
							e.printStackTrace();
						}
						return null;
					}
				});
		return procList;
	}



	// 从数据库中获取所有已发布的流程模版
	public List<ReleasedWfProcess> queryAll() throws Exception {
		
		String sql = "Select Pk_WfProcess,ProcessCode,ProcessName,ProcessType,WorkflowType,Description,Keywords,"
				+ "Author,Lastupdate,Status,Version,Releaser,ReleaseStatement,ReleaseDate,ProcessContent,"
				+ "Fk_Parent,Fk_Owner,AuthorId,ReleaserId,BindEnClassName,Proprietors from plt_rl_wfprocess";
		List<ReleasedWfProcess> procList = jdbcTemplate.query(sql,
				new RowMapper<ReleasedWfProcess>() {
					public ReleasedWfProcess mapRow(ResultSet rs, int rowNum) throws SQLException {
						try {
							return getProcessFromResultSet(new ReleasedWfProcess(), rs);
						} catch (Exception e) {
							e.printStackTrace();
						}
						return null;
					}
				});
		
		return procList;
	}
	public List<String> queryAllReleasedWfProcessId(){
		String sql = "Select Pk_WfProcess from plt_rl_wfprocess";
		List<String> ids = jdbcTemplate.query(sql, new RowMapper<String>() {
			public String mapRow(ResultSet rs, int rowNum) throws SQLException {
				String id = rs.getString("Pk_WfProcess");
				return id;
			}
		});

		return ids;
	}

	/**
	 * This method is used get a process release candidate for preparing
	 * release. It gets data from b_wfprocess.
	 * 获取一个未发布的流程模版
	 * @param primaryKey
	 * @return
	 * @throws Exception
	 */
	public ReleasedWfProcess queryByPKForRelease(String primaryKey) throws Exception {
    // String sql = "Select Pk_WfProcess,ProcessCode,ProcessName,ProcessType,WorkflowType,Description,Keywords,"
    // + "Author,Lastupdate,Status,Version,Releaser,ReleaseStatement,ReleaseDate,"
    // + "Fk_Parent,Fk_Owner,AuthorId,ReleaserId,BindEnClassName,Proprietors,ProcessContent "
    // + "from plt_rl_wfprocess where Pk_WfProcess=?";
		String sql = "select Pk_WfProcess,ProcessCode,ProcessName,ProcessType,WorkflowType,"
				+ "Description,Keywords,Author,Lastupdate,Status,"
				+ "Fk_Parent,Fk_Owner,AuthorId,BindEnClassName,Proprietors,ProcessContent "
				+ "from plt_bt_wfprocess where Pk_WfProcess=?";
		List<ReleasedWfProcess> procList = jdbcTemplate.query(sql, new RowMapper<ReleasedWfProcess>() {
			public ReleasedWfProcess mapRow(ResultSet rs, int rowNum) throws SQLException {
				ReleasedWfProcess proc = new ReleasedWfProcess();
				proc.setId(rs.getString("Pk_WfProcess"));
				proc.setCode(rs.getString("ProcessCode"));
				proc.setName(rs.getString("ProcessName"));
				proc.setProcessType(rs.getInt("ProcessType"));
				proc.setWorkflowType(rs.getInt("WorkflowType"));
				proc.setDescription(rs.getString("Description"));
				proc.setKeywords(rs.getString("Keywords"));
				proc.setAuthor(rs.getString("Author"));
				proc.setLastupdate(rs.getTimestamp("Lastupdate").getTime());
				proc.setStatus(rs.getInt("Status"));
				proc.setParent(rs.getString("Fk_Parent"));
				proc.setOwner(rs.getString("Fk_Owner"));
				proc.setAuthorId(rs.getString("AuthorId"));
				proc.setBindEnClassName(rs.getString("BindEnClassName"));
				proc.setProcessContent(rs.getString("ProcessContent"));
				try {
					proc.setProprietors(JSONArray.parseArray(rs.getString("Proprietors")));
				} catch (Exception e) {
					e.printStackTrace();
				}
				return proc;
			}
		}, primaryKey);

		if (!procList.isEmpty()) {
			return procList.get(0);
		} else
			return null;
	}

	/**
	 * Insert a new business process definition into repository. This method
	 * will insert or update values into all fields of B_WfProcess.
	 * 
	 * @param rp
	 *            ReleasedWfProcess
	 * @throws SQLException
	 */
	public void insert(final ReleasedWfProcess rp) throws SQLException {
		
		String sql = "insert into plt_rl_wfprocess "
				+ "(Pk_WfProcess,ProcessCode,ProcessName,ProcessType,WorkflowType,Description,Keywords,"
				+ "Author,Lastupdate,Status,Version,Releaser,ReleaseStatement,ReleaseDate,"
				+ "Fk_Parent,Fk_Owner,AuthorId,ReleaserId,BindEnClassName,Proprietors,ProcessContent) "
				+ "values (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)";
		jdbcTemplate.update(sql, new PreparedStatementSetter() {
			@Override
			public void setValues(PreparedStatement stmt) throws SQLException {
				stmt.setString(1, rp.getId());
				stmt.setString(2, rp.getCode());
				stmt.setString(3, StringEscapeUtils.escapeSql(rp.getName()));
				stmt.setInt(4, rp.getProcessType());
				stmt.setInt(5, rp.getWorkflowType());
				stmt.setString(6, rp.getDescription());
				stmt.setString(7, StringEscapeUtils.escapeSql(rp.getKeywords()));
				stmt.setString(8, rp.getAuthor());
				stmt.setTimestamp(9, new Timestamp(rp.getLastupdate()));
				stmt.setInt(10, rp.getStatus());
				stmt.setString(11, StringEscapeUtils.escapeSql(rp.getVersion()));
				stmt.setString(12, StringEscapeUtils.escapeSql(rp.getReleaser()));
				stmt.setString(13, StringEscapeUtils.escapeSql(rp.getReleaseStatement()));
				stmt.setTimestamp(14, new Timestamp(rp.getReleaseDate()));
				stmt.setString(15, rp.getParent());
				stmt.setString(16, rp.getOwner());
				stmt.setString(17, rp.getAuthorId());
				stmt.setString(18, rp.getReleaserId());
				stmt.setString(19, rp.getBindEnClassName());
				if (rp.getProprietors()!=null) stmt.setString(20, rp.getProprietors().toString());
				else stmt.setString(20, "[]");
				stmt.setString(21, rp.getProcessContent());
			}
		});
		
	}

	public void delete(String primaryKey) throws SQLException {
		
		String sql = "delete from plt_rl_wfprocess where Pk_WfProcess=?";
		jdbcTemplate.update(sql, new Object[] { primaryKey });
		
	}

	/**
	 * update a released business process definition into repository.
	 * 
	 * @param rp
	 *            ReleasedWfProcess
	 * @throws SQLException
	 */
	public void update(final ReleasedWfProcess rp) throws SQLException {
		
		String sql = "update plt_rl_wfprocess set Version=?,Releaser=?,ReleaserId=?, ReleaseStatement=?,"
				+ "Proprietors=? where Pk_WfProcess=?";
		jdbcTemplate.update(sql, new PreparedStatementSetter() {
			@Override
			public void setValues(PreparedStatement stmt) throws SQLException {
				stmt.setString(1, StringEscapeUtils.escapeSql(rp.getVersion()));
				stmt.setString(2, StringEscapeUtils.escapeSql(rp.getReleaser()));
				stmt.setString(3, rp.getReleaserId());
				stmt.setString(4, StringEscapeUtils.escapeSql(rp.getReleaseStatement()));
				if (rp.getProprietors() != null) stmt.setString(5, rp.getProprietors().toString());
				else stmt.setString(5,"[]");
				stmt.setString(6, rp.getId());
			}
		});
		
	}

	/**
	 * Updates the Deprecated flag to indicate a released business process
	 * status in process supermarket.
	 * 
	 * @param id
	 *            String
	 * @param d
	 *            int
	 * @throws SQLException
	 */
	public void update(final String id, final int d) throws SQLException {
		
		String sql = "update plt_rl_wfprocess set Deprecated=? where Pk_WfProcess=?";
		jdbcTemplate.update(sql, new PreparedStatementSetter() {
			@Override
			public void setValues(PreparedStatement stmt) throws SQLException {
				stmt.setInt(1, d);
				stmt.setString(2, id);
			}
		});
		
	}

	/**
	 * Returns a released business processes from repository by specified
	 * <code>primary key</code>.
	 * 获取一个已发布的流程模版
//	 * @param fk_parent
//	 * @param fk_owner
	 * @return
	 * @throws Exception
	 */
	public ReleasedWfProcess queryReleasedProcess(String primaryKey) throws Exception {
		String sql = "Select Pk_WfProcess,ProcessCode,ProcessName,ProcessType,WorkflowType,Description,Keywords,"
				+ "Author,Lastupdate,Status,Version,Releaser,ReleaseStatement,ReleaseDate,"
				+ "Fk_Parent,Fk_Owner,AuthorId,ReleaserId,BindEnClassName,Proprietors,ProcessContent "
				+ "from plt_rl_wfprocess where Pk_WfProcess=?";
		List<ReleasedWfProcess> procList = jdbcTemplate.query(sql, new RowMapper<ReleasedWfProcess>() {
			public ReleasedWfProcess mapRow(ResultSet rs, int rowNum) throws SQLException {
				try {
					return getProcessFromResultSet(new ReleasedWfProcess(), rs);
				} catch (Exception e) {
					e.printStackTrace();
				}
				return null;
			}
		}, primaryKey);

		if (!procList.isEmpty())
			return procList.get(0);
		else
			return null;
	}

	public void updateParent(final String pk, final String fk_parent, final String content, final Date lastupdate)
			throws Exception {
		
		String sql = "update plt_rl_wfprocess set Fk_Parent=?, ProcessContent=?, Lastupdate=? where Pk_WfProcess=?";
		jdbcTemplate.update(sql, new PreparedStatementSetter() {
			@Override
			public void setValues(PreparedStatement stmt) throws SQLException {
				stmt.setString(1, fk_parent);
				stmt.setString(2, content);
				stmt.setTimestamp(3, new Timestamp(lastupdate.getTime()));
				stmt.setString(4, pk);
			}
		});
		

	}

	/**
	 * @author xq00008
//	 * @param condition
	 * @return
	 * @throws SQLException
	 */
	public int queryWfProcessCounting(int deprecated) throws SQLException {
		
		if (deprecated == 99) {
			String sql = "select count(*) from plt_rl_wfprocess where Deprecated not in (1,3,4)";
			List<Integer> counts = jdbcTemplate.query(sql, new RowMapper<Integer>() {
				public Integer mapRow(ResultSet rs, int rowNum) throws SQLException {
					int count = rs.getInt(1);
					return new Integer(count);
				}
			});
			
			return ((Integer) counts.get(0)).intValue();
		} else {
			String sql = "select count(*) from plt_rl_wfprocess where Deprecated= ?";
			List<Integer> counts = jdbcTemplate.query(sql, new RowMapper<Integer>() {
				public Integer mapRow(ResultSet rs, int rowNum) throws SQLException {
					int count = rs.getInt(1);
					return new Integer(count);
				}
			}, deprecated);
			
			return ((Integer) counts.get(0)).intValue();
		}
	}

	/**
	 * 
	 * @param condition
	 * @return
	 */
	public int queryWfProcessProCounting(String condition) throws SQLException {
		
		String sql = "select count(*) from plt_rl_wfprocess "
				+ "where (ProcessName like ? or Author like ? or Description like ? or "
				+ "Keywords like ? or Version like ? or Version like ? or "
				+ "Releaser like ? or ReleaseStatement like ?) and Deprecated not in (1,3,4)";
		String c = "%" + StringEscapeUtils.escapeSql(condition) + "%";
		List<Integer> counts = jdbcTemplate.query(sql, new Object[] { c, c, c, c, c, c, c, c },
				new RowMapper<Integer>() {
					public Integer mapRow(ResultSet rs, int rowNum) throws SQLException {
						int count = rs.getInt(1);
						return new Integer(count);
					}
				});
		
		return ((Integer) counts.get(0)).intValue();
	}

	/**
	 * 
	 * @param condition
//	 * @param pageindex
	 * @param pagesize
	 * @return
	 */
	public List<ReleasedWfProcess> queryWfProcessPro(String condition, int firstrow, int pagesize) {
		
		String sql = "select * from plt_rl_wfprocess where "
				+ "(ProcessName like ? or Author like ? or Description like ? or "
				+ "Keywords like ? or Version like ? or Version like ? or "
				+ "Releaser like ? or ReleaseStatement like ?) and Deprecated not in (1,3,4) limit ?,?";
		String c = "%" + StringEscapeUtils.escapeSql(condition) + "%";
		List<ReleasedWfProcess> lst = jdbcTemplate.query(sql,
				new Object[] { c, c, c, c, c, c, c, c, firstrow, pagesize }, new RowMapper<ReleasedWfProcess>() {
					public ReleasedWfProcess mapRow(ResultSet rs, int rowNum) throws SQLException {
						try {
							return getResultSet(new ReleasedWfProcess(), rs);
						} catch (Exception e) {
							e.printStackTrace();
						}
						return null;
					}
				});
		
		return lst;
	}

	/**
	 * 
//	 * @param firstrow
//	 * @param pagesize
	 * @return
	 */

	public List<ReleasedWfProcess> queryWfProcessPro(int deprecated, int firstrow, int pagesize) {
		
		if (deprecated == 99) { 
			String sql = "select * from plt_rl_wfprocess where Deprecated not in (1,3,4) limit ?,? ";
			List<ReleasedWfProcess> lst = jdbcTemplate.query(sql, new Object[] { firstrow, pagesize },
					new RowMapper<ReleasedWfProcess>() {
						public ReleasedWfProcess mapRow(ResultSet rs, int rowNum) throws SQLException {
							try {
								return getResultSet(new ReleasedWfProcess(), rs);
							} catch (Exception e) {
								e.printStackTrace();
							}
							return null;
						}
					});
			
			return lst;
		} else {
			String sql = "select * from plt_rl_wfprocess where Deprecated = ? limit ?,? ";
			List<ReleasedWfProcess> lst = jdbcTemplate.query(sql, new Object[] { deprecated, firstrow, pagesize },
					new RowMapper<ReleasedWfProcess>() {
						public ReleasedWfProcess mapRow(ResultSet rs, int rowNum) throws SQLException {
							try {
								return getResultSet(new ReleasedWfProcess(), rs);
							} catch (Exception e) {
								e.printStackTrace();
							}
							return null;
						}
					});
			
			return lst;
		}
	}

	public ReleasedWfProcess getResultSet(ReleasedWfProcess rlWfPro, ResultSet rs) throws SQLException, Exception {
		rlWfPro.setId(rs.getString("Pk_WfProcess"));
		rlWfPro.setCode(rs.getString("ProcessCode"));
		rlWfPro.setName(rs.getString("ProcessName"));
		rlWfPro.setProcessType(rs.getInt("ProcessType"));
		rlWfPro.setWorkflowType(rs.getInt("WorkflowType"));
		rlWfPro.setDescription(rs.getString("Description"));
		rlWfPro.setKeywords(rs.getString("Keywords"));
		rlWfPro.setAuthor(rs.getString("Author"));
		rlWfPro.setStatus(rs.getInt("Status"));
		rlWfPro.setVersion(rs.getString("Version"));
		rlWfPro.setReleaser(rs.getString("Releaser"));
		rlWfPro.setReleaseStatement(rs.getString("ReleaseStatement"));
		rlWfPro.setReleaseDate(rs.getTimestamp("ReleaseDate").getTime());
		rlWfPro.setDeprecated(rs.getInt("Deprecated"));
		rlWfPro.setProcessContent(rs.getString("ProcessContent"));
		rlWfPro.setParent(rs.getString("Fk_Parent"));
		rlWfPro.setOwner(rs.getString("Fk_Owner"));
		rlWfPro.setLastupdate(rs.getTimestamp("Lastupdate").getTime());
		rlWfPro.setAuthorId(rs.getString("AuthorId"));
		rlWfPro.setReleaserId(rs.getString("ReleaserId"));
//		rlWfPro.setBindEnClassId(rs.getString("BindEnClassId"));
		rlWfPro.setBindEnClassName(rs.getString("BindEnClassName"));
		rlWfPro.setProprietors(JSONArray.parseArray(rs.getString("Proprietors")));
		return rlWfPro;
	}

	/**
	 * 
//	 * @param id
//	 * @param status
	 * @param date
	 */
	public void updateDeprecated(final String primaryKey, final int deprecated, final long date) {
		
		String sql = "update plt_rl_wfprocess set Deprecated=?, Lastupdate=? where Pk_WfProcess= ?";
		jdbcTemplate.update(sql, new PreparedStatementSetter() {
			@Override
			public void setValues(PreparedStatement stmt) throws SQLException {
				stmt.setInt(1, deprecated);
				stmt.setTimestamp(2, new Timestamp(date));
				stmt.setString(3, primaryKey);
			}
		});
		
	}

}
