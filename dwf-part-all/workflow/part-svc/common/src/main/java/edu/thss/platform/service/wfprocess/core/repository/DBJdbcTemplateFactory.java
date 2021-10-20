package edu.thss.platform.service.wfprocess.core.repository;

import org.springframework.jdbc.core.JdbcTemplate;

public class DBJdbcTemplateFactory {

	private static JdbcTemplate jdbcTemplate = new JdbcTemplate(
			DBDataSourceFactory.getDataSource());

	public static JdbcTemplate getJdbcTemplate() {
		return jdbcTemplate;
	}

}
