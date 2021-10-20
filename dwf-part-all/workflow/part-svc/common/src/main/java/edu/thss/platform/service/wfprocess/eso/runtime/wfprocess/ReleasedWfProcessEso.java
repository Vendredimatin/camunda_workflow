package edu.thss.platform.service.wfprocess.eso.runtime.wfprocess;

import edu.thss.platform.service.wfprocess.core.repository.ExecuteSQLObject;
import edu.thss.platform.service.wfprocess.core.runtime.wfprocess.WfProcessInstance;
import org.apache.log4j.Logger;
import com.alibaba.fastjson.JSONArray;
import com.alibaba.fastjson.JSONException;
import org.springframework.jdbc.core.RowMapper;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.List;

/**
 * This class optimized released process read/write performance from/into
 * business repository. It changed task storage from DB table to JSON.
 *
 * @author Dahai Cao created 20170808
 */
public class ReleasedWfProcessEso extends ExecuteSQLObject {

    public ReleasedWfProcessEso() {
        super();
        logger = Logger.getLogger(ReleasedWfProcessEso.class.getName());
    }

    public WfProcessInstance getProcessFromResultSet(WfProcessInstance proc, ResultSet rs) throws SQLException, JSONException {
        proc.setId(rs.getString("Pk_WfProcess"));
        proc.setCode(rs.getString("ProcessCode"));
        proc.setName(rs.getString("ProcessName"));
        proc.setProcessType(rs.getInt("ProcessType"));
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
        proc.setProcessContent(rs.getString("ProcessContent"));
        if(rs.getString("bindEnClassName")!=null) proc.setBindEnClassName(rs.getString("bindEnClassName"));
//        if(rs.getString("proprietors")!=null) proc.setProprietors(new JSONArray(rs.getString("proprietors")));
        if(rs.getString("proprietors")!=null) proc.setProprietors(JSONArray.parseArray(rs.getString("proprietors")));
        return proc;
    }

    /**
     * Returns a released business processes from repository by specified
     * <code>primary key</code>.
     *
//     * @param fk_parent
//     * @param fk_owner
     * @return
     * @throws Exception
     */
    public WfProcessInstance queryReleasedProcess(String primaryKey) throws Exception {
        spendtime = System.currentTimeMillis();
        String sql = "Select Pk_WfProcess,ProcessCode,ProcessName,ProcessType,Description,Keywords,"
                + "Author,Lastupdate,Status,Version,Releaser,ReleaseStatement,ReleaseDate,"
                + "Fk_Parent,Fk_Owner,BindEnClassName,Proprietors,ProcessContent "
                + "from plt_rl_wfprocess where Pk_WfProcess=?";
        List<WfProcessInstance> procList = jdbcTemplate.query(sql, new String[]{primaryKey},
                new RowMapper<WfProcessInstance>() {
            public WfProcessInstance mapRow(ResultSet rs, int rowNum) throws SQLException {
                try {
                    return getProcessFromResultSet(new WfProcessInstance(), rs);
                } catch (JSONException e) {
                    e.printStackTrace();
                }
                return null;
            }
        });
        logger.info((System.currentTimeMillis() - spendtime) + "ms");
        if (!procList.isEmpty())
            return procList.get(0);
        else
            return null;
    }

}
