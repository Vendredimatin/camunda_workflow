package edu.thss.platform.service.wfprocess.eso.runtime.organization;

import edu.thss.platform.service.wfprocess.core.repository.ExecuteSQLObject;
import org.apache.log4j.Logger;

//import edu.thss.platform.service.wfprocess.core.organization.OrganizationRelationship;

public class OrganizationRelationshipEso extends ExecuteSQLObject {

	public OrganizationRelationshipEso() {
		super();
		logger = Logger.getLogger(OrganizationRelationshipEso.class.getName());
	}

//	public List<OrganizationRelationship> queryAllforSelect(String fk_organization, int valid, int[] relationships)
//			throws Exception {
//		spendtime = System.currentTimeMillis();
//		String sql = "select Fk_OrganizationB from om_organization_relationship "
//				+ "where Fk_OrganizationA=? and Valid=? and Relationship in (?, ?, ?, ?, ?)";
//		List<OrganizationRelationship> lst = jdbcTemplate.query(sql, new Object[] { fk_organization, valid,
//				relationships[0], relationships[1], relationships[2], relationships[3], relationships[4] },
//				new RowMapper<OrganizationRelationship>() {
//					public OrganizationRelationship mapRow(ResultSet rs, int rowNum) throws SQLException {
//						OrganizationRelationship r = new OrganizationRelationship();
//						r.setOrgBId(rs.getString("Fk_OrganizationB"));
//						return r;
//					}
//				});
//		logger.info((System.currentTimeMillis() - spendtime) + "ms");
//		return lst;
//	}

}
