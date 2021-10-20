/**
 * 
 */
package edu.thss.platform.service.wfprocess.eso.buildtime.wfprocess;

import edu.thss.platform.service.wfprocess.core.buildtime.release.wfprocess.ReleasedWfProcess;
import edu.thss.platform.service.wfprocess.core.buildtime.wfprocess.WfProcess;
import edu.thss.platform.service.wfprocess.core.repository.ExecuteSQLObject;
import org.apache.commons.lang.StringEscapeUtils;

import com.alibaba.fastjson.JSON;
import com.alibaba.fastjson.JSONArray;
import com.alibaba.fastjson.JSONException;
import org.springframework.jdbc.core.PreparedStatementSetter;
import org.springframework.jdbc.core.RowMapper;

import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Timestamp;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;

import edu.thss.platform.domain.wfprocess.BtWfProcessDO;
import edu.thss.platform.dao.wfprocess.BtWfProcessDao;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;


/**
 * This class optimized process read/write performance from/into business
 * repository. It changed task storage from DB table to JSON.
 * 
 * @author Dahai Cao created 20170808
 */
public class BuildtimeWfProcessEso extends ExecuteSQLObject{

	public BuildtimeWfProcessEso() {
	}

	public int checkName(String name) throws Exception {
		String sql = "Select Pk_WfProcess from plt_bt_wfprocess where ProcessName=?";
		List<String> res = jdbcTemplate.query(sql, new RowMapper<String>() {
			public String mapRow(ResultSet rs, int rowNum) throws SQLException {
				return rs.getString("Pk_WfProcess");
			}
		}, name);
		if (res.size() > 0) return 1;
		else return 0;
	}

	public List<String> queryAllOfOwner(String fk_owner) throws Exception {

		String sql = "Select ProcessContent from plt_bt_wfprocess where Fk_Owner=?";
		List<String> procList = jdbcTemplate.query(sql, new Object[] { fk_owner }, new RowMapper<String>() {
			public String mapRow(ResultSet rs, int rowNum) throws SQLException {
				return rs.getString("ProcessContent");
			}
		});

		return procList;
	}

	// 从数据库中获取所有绑定指定实体类的流程模版Id
	public List<String> queryAllIdByEnClass(String ename) throws Exception {
		String sql = "Select Pk_WfProcess from plt_bt_wfprocess where BindEnClassName = ?";
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

	/**
	 * Returns all the displayed business processes from repository. The
	 * displayed business process means that these are displayed in process
	 * explorer.<br>
	 * This method is used to contruct process tree view.
	 * 
	 * @param fk_parent
	 * @param fk_owner
	 * @return
	 * @throws Exception
	 */
	public List<WfProcess> queryAll(String fk_parent, String fk_owner) throws Exception {

		String sql = "Select Pk_WfProcess,ProcessCode,ProcessName,ProcessType,WorkflowType,"
				+ "Author,Lastupdate,Status,Fk_Parent,Fk_Owner,AuthorId,BindEnClassName,Proprietors,ProcessContent "
				+ "from plt_bt_wfprocess where Fk_Parent=? and Fk_Owner=?";
		List<WfProcess> procList = jdbcTemplate.query(sql, new Object[] { fk_parent, fk_owner },
				new RowMapper<WfProcess>() {
					public WfProcess mapRow(ResultSet rs, int rowNum) throws SQLException {
            try{
              return getProcessFromResultSet(new WfProcess(), rs);
            } catch (Exception e) {
              e.printStackTrace();
            }
            return null;
              
						// WfProcess proc = new WfProcess();
						// proc.setId(rs.getString("Pk_WfProcess"));
						// proc.setCode(rs.getString("ProcessCode"));
						// proc.setName(rs.getString("ProcessName"));
						// proc.setProcessType(rs.getInt("ProcessType"));
						// proc.setWorkflowType(rs.getInt("WorkflowType"));
						// proc.setAuthor(rs.getString("Author"));
						// proc.setLastupdate(rs.getTimestamp("Lastupdate").getTime());
						// proc.setStatus(rs.getInt("Status"));
						// proc.setParent(rs.getString("Fk_Parent"));
						// proc.setOwner(rs.getString("Fk_Owner"));
						// proc.setAuthorId(rs.getString("AuthorId"));
						// proc.setBindEnClassName(rs.getString("BindEnClassName"));
						// proc.setProcessContent(rs.getString("ProcessContent"));
						// try {
						// 	if (rs.getString("Proprietors") != null) {
						// 		proc.setProprietors(JSONArray.parseArray(rs.getString("Proprietors")));
						// 	} else {
						// 		proc.setProprietors(JSONArray.parseArray("[]"));
						// 	}
						// } catch (JSONException e){
						// 	e.printStackTrace();;
						// }
						// return proc;
					}
				});
		
		return procList;
	}
	
	private WfProcess getProcessFromResultSet(WfProcess proc, ResultSet rs) throws Exception {
    proc.setId(rs.getString("Pk_WfProcess"));
    proc.setCode(rs.getString("ProcessCode"));
    proc.setName(rs.getString("ProcessName"));
    proc.setProcessType(rs.getInt("ProcessType"));
    proc.setWorkflowType(rs.getInt("WorkflowType"));
    proc.setAuthor(rs.getString("Author"));
    proc.setLastupdate(rs.getTimestamp("Lastupdate").getTime());
    proc.setStatus(rs.getInt("Status"));
    proc.setParent(rs.getString("Fk_Parent"));
    proc.setOwner(rs.getString("Fk_Owner"));
    proc.setAuthorId(rs.getString("AuthorId"));
    proc.setBindEnClassName(rs.getString("BindEnClassName"));
    proc.setProcessContent(rs.getString("ProcessContent"));
    try {
      if (rs.getString("Proprietors") != null) {
          proc.setProprietors(JSONArray.parseArray(rs.getString("Proprietors")));
      } else {
        proc.setProprietors(JSONArray.parseArray("[]"));
      }
    } catch (JSONException e){
      e.printStackTrace();;
    }
    return proc;
  }
	public List<WfProcess> queryAll() throws Exception {
		// 从数据库中查询所有流程模版
		String sql = "Select Pk_WfProcess,ProcessCode,ProcessName,ProcessType,WorkflowType,"
				+ "Author,Lastupdate,Status,Fk_Parent,Fk_Owner,AuthorId,BindEnClassName,Proprietors,ProcessContent "
				+ "from plt_bt_wfprocess";
		List<WfProcess> procList = jdbcTemplate.query(sql, new RowMapper<WfProcess>() {
					public WfProcess mapRow(ResultSet rs, int rowNum) throws SQLException {
					try{
            return getProcessFromResultSet(new WfProcess(), rs);
          } catch (Exception e) {
            e.printStackTrace();
          }
          return null;
            
            // WfProcess proc = new WfProcess();

						// proc.setId(rs.getString("Pk_WfProcess"));
						// proc.setCode(rs.getString("ProcessCode"));
						// proc.setName(rs.getString("ProcessName"));
						// proc.setProcessType(rs.getInt("ProcessType"));
						// proc.setWorkflowType(rs.getInt("WorkflowType"));
						// proc.setAuthor(rs.getString("Author"));
						// proc.setLastupdate(rs.getTimestamp("Lastupdate").getTime());
						// proc.setStatus(rs.getInt("Status"));
						// proc.setParent(rs.getString("Fk_Parent"));
						// proc.setOwner(rs.getString("Fk_Owner"));
						// proc.setAuthorId(rs.getString("AuthorId"));
						// proc.setBindEnClassName(rs.getString("BindEnClassName"));
						// proc.setProcessContent(rs.getString("ProcessContent"));
            // System.out.println(rs.getString("Proprietors"));
						// try {
						// 	if (rs.getString("Proprietors") != null) {
						// 			proc.setProprietors(JSONArray.parseArray(rs.getString("Proprietors")));
						// 	} else {
						// 		proc.setProprietors(JSONArray.parseArray("[]"));
						// 	}
						// } catch (JSONException e){
						// 	e.printStackTrace();;
						// }
						// return proc;
					}
				});
		return procList;
  }
  
	public List<String> queryAllUnReleasedWfProcessId(){
		String sql = "Select Pk_WfProcess from plt_bt_wfprocess";
		List<String> ids = jdbcTemplate.query(sql, new RowMapper<String>() {
			public String mapRow(ResultSet rs, int rowNum) throws SQLException {
				String id = rs.getString("Pk_WfProcess");
				return id;
			}
		});
		return ids;
	}

	public WfProcess queryByPK(String primaryKey) throws Exception {

		String sql = "Select Pk_WfProcess,ProcessCode,ProcessName,ProcessType,WorkflowType,"
      + "Author,Lastupdate,Status,Fk_Parent,Fk_Owner,AuthorId,BindEnClassName,Proprietors,ProcessContent "
      + "from plt_bt_wfprocess where Pk_WfProcess=?";
		List<WfProcess> procList = jdbcTemplate.query(sql, new RowMapper<WfProcess>() {
			public WfProcess mapRow(ResultSet rs, int rowNum) throws SQLException {
				try{
          return getProcessFromResultSet(new WfProcess(), rs);
        } catch (Exception e) {
          e.printStackTrace();
        }
        return null;
          
        // WfProcess proc = new WfProcess();
				// proc.setId(rs.getString("Pk_WfProcess"));
				// proc.setCode(rs.getString("ProcessCode"));
				// proc.setName(rs.getString("ProcessName"));
				// proc.setProcessType(rs.getInt("ProcessType"));
				// proc.setWorkflowType(rs.getInt("WorkflowType"));
				// proc.setAuthor(rs.getString("Author"));
				// proc.setLastupdate(rs.getTimestamp("Lastupdate").getTime());
				// proc.setStatus(rs.getInt("Status"));
				// proc.setParent(rs.getString("Fk_Parent"));
				// proc.setOwner(rs.getString("Fk_Owner"));
				// proc.setAuthorId(rs.getString("AuthorId"));
        // proc.setBindEnClassName(rs.getString("BindEnClassName"));
				// proc.setProcessContent(rs.getString("ProcessContent"));
        // System.out.println(rs.getString("Proprietors"));
        // if(rs.getString("Proprietors") != null){
        //   proc.setProprietors(JSONArray.parseArray(rs.getString("Proprietors")));
        // }else{
        //   proc.setProprietors(new JSONArray());
        // }
				// return proc;
			}
		}, primaryKey);
		
		if (!procList.isEmpty())
			return procList.get(0);
		else
			return null;
	}

	/**
	 * This method is used to get process content which is based on JSON format.
	 * 
	 * @param primaryKey
	 * @return
	 * @throws Exception
	 */
	public String queryProcessContentByPK(String primaryKey) throws Exception {
		
		String sql = "select ProcessContent from plt_bt_wfprocess where Pk_WfProcess=?";
		List<String> procList = jdbcTemplate.query(sql, new RowMapper<String>() {
			public String mapRow(ResultSet rs, int rowNum) throws SQLException {
				return rs.getString("ProcessContent");
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
	 * @param process
	 *            WfProcess
	 * @throws SQLException
	 */
	public void insert(final WfProcess process) throws Exception {
		int res = checkName(process.getName());
		if (res == 1) throw new Exception("重名");
		String sql = "insert into plt_bt_wfprocess "
				+ "(Pk_WfProcess,ProcessCode,ProcessName,ProcessType,WorkflowType,Description,Keywords,"
				+ "Author,Lastupdate,Status,Fk_Parent,Fk_Owner,AuthorId,BindEnClassName,Proprietors,ProcessContent ) "
				+ "values (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)";
		jdbcTemplate.update(sql, new PreparedStatementSetter() {
			@Override
			public void setValues(PreparedStatement stmt) throws SQLException {
				stmt.setString(1, process.getId());
				stmt.setString(2, process.getCode());
				stmt.setString(3, StringEscapeUtils.escapeSql(process.getName()));
				stmt.setInt(4, process.getProcessType());
				stmt.setInt(5, process.getWorkflowType());
				stmt.setString(6, process.getDescription());
				stmt.setString(7, process.getKeywords());
				stmt.setString(8, process.getAuthor());
				stmt.setTimestamp(9, new Timestamp(process.getLastupdate()));
				stmt.setInt(10, process.getStatus());
				stmt.setString(11, process.getParent());
				stmt.setString(12, process.getOwner());
				stmt.setString(13, process.getAuthorId());
				stmt.setString(14, process.getBindEnClassName());
				if(process.getProprietors()!=null) stmt.setString(15, process.getProprietors().toString());
				else {stmt.setString(15,"[]");}
				stmt.setString(16, process.getProcessContent());
			}
		});
		
	}

	public void update(final WfProcess process) throws SQLException {

        String sql = "update plt_bt_wfprocess "
                + "set ProcessCode=?,ProcessName=?,ProcessType=?,WorkflowType=?,Description=?,Keywords=?,"
                + "Author=?,Lastupdate=?,Status=?,Fk_Parent=?,Fk_Owner=?,AuthorId=?,BindEnClassName=?,Proprietors=?,ProcessContent=? "
                + "where Pk_WfProcess=?";
        jdbcTemplate.update(sql, new PreparedStatementSetter() {
            @Override
            public void setValues(PreparedStatement stmt) throws SQLException {
                stmt.setString(1, process.getCode());
                stmt.setString(2, StringEscapeUtils.escapeSql(process.getName()));
                stmt.setInt(3, process.getProcessType());
                stmt.setInt(4, process.getWorkflowType());
                stmt.setString(5, process.getDescription());
                stmt.setString(6, process.getKeywords());
                stmt.setString(7, process.getAuthor());
                stmt.setTimestamp(8, new Timestamp(process.getLastupdate()));
                stmt.setInt(9, process.getStatus());

                stmt.setString(10, process.getParent());
                stmt.setString(11, process.getOwner());
                stmt.setString(12, process.getAuthorId());
                stmt.setString(13, process.getBindEnClassName());
                if (process.getProprietors()!=null) stmt.setString(14, process.getProprietors().toString());
                else stmt.setString(14,"[]");
                stmt.setString(15, process.getProcessContent());

                stmt.setString(16, process.getId());

                System.out.println("------BuildtimeWfProcessEso: ProcessConten -------");
                System.out.println(process.getProcessContent());

            }
        });

//		String sql = "update pm_bt_wfprocess "
//				+ "set ProcessCode=?,ProcessName=?,ProcessType=?,WorkflowType=?,Description=?,Keywords=?,"
//				+ "Author=?,Lastupdate=?,Status=?,Fk_Parent=?,Fk_Owner=?,ProcessContent=?,AuthorId=?,BindEnClassId=?,BindEnClassName=?,Proprietors=? "
//				+ "where Pk_WfProcess=?";
//		jdbcTemplate.update(sql, new PreparedStatementSetter() {
//			@Override
//			public void setValues(PreparedStatement stmt) throws SQLException {
//				stmt.setString(1, process.getCode());
//				stmt.setString(2, StringEscapeUtils.escapeSql(process.getName()));
//				stmt.setInt(3, process.getProcessType());
//				stmt.setInt(4, process.getWorkflowType());
//				stmt.setString(5, process.getDescription());
//				stmt.setString(6, process.getKeywords());
//				stmt.setString(7, process.getAuthor());
//				stmt.setTimestamp(8, new Timestamp(process.getLastupdate()));
//				stmt.setInt(9, process.getStatus());
//
//				stmt.setString(10, process.getParent());
//				stmt.setString(11, process.getOwner());
//				stmt.setString(12, process.getProcessContent());
//				stmt.setString(13, process.getAuthorId());
//				stmt.setString(14, process.getBindEnClassId());
//				stmt.setString(15, process.getBindEnClassName());
//				stmt.setString(16, process.getProprietors().toString());
//
//				stmt.setString(17, process.getId());
//
//				System.out.println("------BuildtimeWfProcessEso: ProcessConten -------");
//				System.out.println(process.getProcessContent());
//
//			}
//		});
		
	}

	public void updateName(final String id, final String name, final String content, final long lastupdate) throws Exception {
		int res = checkName(name);
		if (res == 1) throw new Exception("重名");
		String sql = "update plt_bt_wfprocess set ProcessName=?,ProcessContent=?,Lastupdate=? where Pk_WfProcess=?";
		jdbcTemplate.update(sql, new PreparedStatementSetter() {
			@Override
			public void setValues(PreparedStatement stmt) throws SQLException {
				stmt.setString(1, StringEscapeUtils.escapeSql(name));
				stmt.setString(2, content);
				stmt.setTimestamp(3, new Timestamp(lastupdate));
				stmt.setString(4, id);
			}
		});
		
	}

	public void updateParent(final String pk, final String fk_parent, final String content, final Date lastupdate)
			throws Exception {
		
		String sql = "update plt_bt_wfprocess set Fk_Parent=?,ProcessContent=?,Lastupdate=? where Pk_WfProcess=?";
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

	public void delete(String primaryKey) throws SQLException {
		
		String sql = "delete from plt_bt_wfprocess where Pk_WfProcess=?";
		jdbcTemplate.update(sql, new Object[] { primaryKey });
		
	}

	public void deleteRl(String primaryKey) throws SQLException {
		String sql = "delete from plt_rl_wfprocess where Pk_WfProcess=?";
		jdbcTemplate.update(sql, new Object[] { primaryKey });
	}

}
