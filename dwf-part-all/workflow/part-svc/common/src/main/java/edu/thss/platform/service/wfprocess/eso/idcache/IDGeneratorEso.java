/**
 *
 */
package edu.thss.platform.service.wfprocess.eso.idcache;

import edu.thss.platform.service.wfprocess.core.repository.ExecuteSQLObject;
import org.springframework.jdbc.core.PreparedStatementSetter;
import org.springframework.jdbc.core.RowMapper;

import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import edu.thss.platform.domain.wfprocess.IdCacheDO;
import edu.thss.platform.dao.wfprocess.IdCacheDao;

/**
 * @author cdh
 */
public class IDGeneratorEso extends ExecuteSQLObject{

    public final static byte MIN_CODE = 48;
    public final static byte MAX_CODE = 90;
    public final static byte MIN_ID = 48;
    public final static byte MAX_ID = 122;
    public final static int R_ID_SIZE = 32;
    public final static int B_ID_SIZE = 16;
    public final static int CODE_SIZE = 10;

    public byte serialCode[] = new byte[CODE_SIZE];
    public byte buildtimeCode[] = new byte[B_ID_SIZE];
    public byte runtimCode[] = new byte[R_ID_SIZE];
    public int version = 0;

    public IDGeneratorEso() {
    }

    /**
     * Compute next new runtime object id.
     *
     * @return
     */
    public String getNextRuntimeID() throws Exception {
        for (int i = runtimCode.length - 1; i >= 0; i--) {
            byte code = (byte) (runtimCode[i] + 1);
            boolean carryUp = false;
            byte newCode = code;
            if (code > MAX_ID) {
                newCode = MIN_ID;
                carryUp = true;
            }
            if (newCode == 58) {
                newCode = 65;
            }
            if (newCode == 91) {
                newCode = 97;
            }
            runtimCode[i] = newCode;
            if (!carryUp) {
                break;
            }
        }
        return new String(runtimCode);
    }

    /**
     * Compute next new build-time object id.
     *
     * @return
     */
    public String getNextBuildtimeID() throws Exception  {
        for (int i = buildtimeCode.length - 1; i >= 0; i--) {
            byte code = (byte) (buildtimeCode[i] + 1);
            boolean carryUp = false;
            byte newCode = code;
            if (code > MAX_ID) {
                newCode = MIN_ID;
                carryUp = true;
            }
            if (newCode == 58) {
                newCode = 65;
            }
            if (newCode == 91) {
                newCode = 97;
            }
            buildtimeCode[i] = newCode;
            if (!carryUp) {
                break;
            }
        }
        return new String(buildtimeCode);
    }

    /**
     * Compute next new BPM / Workflow serial code.
     *
     * @return
     */
    public String getNextSerialCode() throws Exception  {
        for (int i = serialCode.length - 1; i >= 0; i--) {
            byte code = (byte) (serialCode[i] + 1);
            boolean carryUp = false;
            byte newCode = code;
            if (code > MAX_CODE) {
                newCode = MIN_CODE;
                carryUp = true;
            }
            if (newCode == 58) {
                newCode = 65;
            }
            if (newCode == 91) {
                newCode = 97;
            }
            serialCode[i] = newCode;
            if (!carryUp) {
                break;
            }
        }
        return new String(serialCode);
    }

    /**
     * Generate new <code>count</code> number of runtime IDs; These ID can be
     * used to support the usage of whole bpm/workflow instances
     *
     * @param count
     * @return
     * @throws Exception
     */
    public String[] generateRuntimeIds(int count) throws Exception {
        String rids[] = null;

        // get current id from repository;
        Object rid = jdbcTemplate.queryForObject("select RuntimeCode from plt_idcache", new RowMapper<Object>() {
            public Object mapRow(ResultSet rs, int rowNum) throws SQLException {
                return rs.getString(1);
            }
        });
        // compute next count (e.g. 1000) of id.
        runtimCode = ((String) rid).getBytes();
        rids = new String[count];
        for (int i = 0; i < count; i++) {
            rids[i] = getNextRuntimeID();
        }
        // update the new id into repository
        jdbcTemplate.update("update plt_idcache set RuntimeCode=?", new PreparedStatementSetter() {
            @Override
            public void setValues(PreparedStatement stmt) throws SQLException {
                stmt.setString(1, new String(runtimCode));
            }
        });
        return rids;
    }

    public String generateRuntimeId() throws Exception {
        String newRid = null;


        // get current id from repository;
        Object rid = jdbcTemplate.queryForObject("select RuntimeCode from plt_idcache", new RowMapper<Object>() {
            public Object mapRow(ResultSet rs, int rowNum) throws SQLException {
                return rs.getString(1);
            }
        });
        // compute next count (e.g. 1000) of id.
        runtimCode = ((String) rid).getBytes();
        newRid = getNextRuntimeID();
        // update the new id into repository
        jdbcTemplate.update("update plt_idcache set RuntimeCode=?", new PreparedStatementSetter() {
            @Override
            public void setValues(PreparedStatement stmt) throws SQLException {
                stmt.setString(1, new String(runtimCode));
            }
        });

        return newRid;
    }

    public String generateBuildtimeId() throws Exception {
        String newRid = null;


        // get current id from repository;
        Object rid = jdbcTemplate.queryForObject("select BuildtimeCode from plt_idcache", new RowMapper<Object>() {
            public Object mapRow(ResultSet rs, int rowNum) throws SQLException {
                return rs.getString(1);
            }
        });
        // compute next count (e.g. 1000) of id.
        buildtimeCode = ((String) rid).getBytes();
        newRid = getNextBuildtimeID();
        // update the new id into repository
        jdbcTemplate.update("update plt_idcache set BuildtimeCode=?", new PreparedStatementSetter() {
            @Override
            public void setValues(PreparedStatement stmt) throws SQLException {
                stmt.setString(1, new String(buildtimeCode));
            }
        });


        return newRid;
    }

    public String generateBuildtimeSerialCode() throws Exception {
        String newCode = null;


        // get current id from repository;
        Object rid = jdbcTemplate.queryForObject("select SerialCode from plt_idcache", new RowMapper<Object>() {
            public Object mapRow(ResultSet rs, int rowNum) throws SQLException {
                return rs.getString(1);
            }
        });
        // compute next count (e.g. 1000) of id.
        serialCode = ((String) rid).getBytes();
        newCode = getNextSerialCode();
        // update the new id into repository
        jdbcTemplate.update("update plt_idcache set SerialCode=?", new PreparedStatementSetter() {
            @Override
            public void setValues(PreparedStatement stmt) throws SQLException {
                stmt.setString(1, new String(serialCode));
            }
        });

        return newCode;
    }

    /**
     * Generate new <code>count</code> number of codes;
     *
     * @param count
     * @return
     * @throws Exception
     */
    public String[] generateCodes(int count) throws Exception {
        String codes[] = null;


        // get current code from repository;
        Object code = jdbcTemplate.queryForObject("select SerialCode from plt_idcache", new RowMapper<Object>() {
            public Object mapRow(ResultSet rs, int rowNum) throws SQLException {
                return rs.getString(1);
            }
        });
        serialCode = ((String) code).getBytes();
        // compute next count (e.g. 1000) of id.
        codes = new String[count];
        for (int i = 0; i < count; i++) {
            codes[i] = getNextSerialCode();
        }
        String sql = "update plt_idcache set SerialCode=?";
        jdbcTemplate.update(sql, new PreparedStatementSetter() {
            @Override
            public void setValues(PreparedStatement stmt) throws SQLException {
                stmt.setString(1, new String(serialCode));
            }
        });


        return codes;
    }

    /**
     * Generate a new version number.
     *
     * @return
     * @throws Exception
     */
    public String generateNewVersionNo() throws Exception {


        // get current version from repository;
        Object ver = jdbcTemplate.queryForObject("select VersionNumber from plt_idcache", new RowMapper<Object>() {
            public Object mapRow(ResultSet rs, int rowNum) throws SQLException {
                return rs.getInt(1);
            }
        });
        version = ((Integer) ver).intValue();
        // compute next version number
        jdbcTemplate.update("update plt_idcache set VersionNumber=?", new PreparedStatementSetter() {
            @Override
            public void setValues(PreparedStatement stmt) throws SQLException {
                stmt.setInt(1, (version + 1));
            }
        });


        return String.valueOf(version);
    }

    /**普遍理睬
     * This method generate a new unique counting number in Cloud BPM. Every
     * organization has a unique number to identify all user object. Such as
     * admin, biller, etc. Using the number, the admin will be denoted as
     * admin+number, then keep unique in system.
     *
     * @return int
     * @throws Exception
     */
    public String generateBuildtimeUniCounting() throws Exception {
        int count = -1;


        // get current version from repository;
        Object ver = jdbcTemplate.queryForObject("select UniCounting from plt_idcache", new RowMapper<Object>() {
            public Object mapRow(ResultSet rs, int rowNum) throws SQLException {
                return rs.getInt(1);
            }
        });
        count = ((Integer) ver).intValue();
        // compute next version number
        jdbcTemplate.update("update plt_idcache set UniCounting=UniCounting+1");


        return String.valueOf(count);
    }

}
