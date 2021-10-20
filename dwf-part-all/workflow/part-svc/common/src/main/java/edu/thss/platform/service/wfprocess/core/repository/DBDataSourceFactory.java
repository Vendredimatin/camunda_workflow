package edu.thss.platform.service.wfprocess.core.repository;

import edu.thss.platform.exception.PlatformException;
import edu.thss.platform.utils.PropPathUtil;
import org.apache.commons.dbcp.BasicDataSource;
import javax.sql.DataSource;
import java.io.FileInputStream;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.util.Properties;

/**
 * CSC database data source factory.
 */
public class DBDataSourceFactory {

	private static String propPathCommon = PropPathUtil.propCommon;
	private static String propPathModeler = PropPathUtil.propModeler;
	private static DataSource ds = initDataSource();
//	private static MongoTemplate nosqlds = initNoSqlDataSource();

	/**
	 * Returns the single instance of CSC database data source.
	 *
	 * @return The single instance of CSC database data source
	 */
	public final static DataSource getDataSource() {
		return ds;
	}

	/**
	 * Initializes the single instance of CSC database data source.
	 */
//	private static DataSource initDataSource_OLDVER() {
//		ApplicationContext ctx = ApplicationContextFactory.getApplicationContext();
//		return (DataSource) ctx.getBean("RepositoryDBDataSource");
//	}

	private static DataSource initDataSource() {
		Properties pCommon = new Properties();
		Properties p = new Properties();

		try { // 本地config
			new InputStreamReader(new FileInputStream(propPathCommon), StandardCharsets.UTF_8).close();
		} catch (Exception e) { propPathCommon = propPathModeler; }
		try { // 本地dwf-modeler
			new InputStreamReader(new FileInputStream(propPathModeler), StandardCharsets.UTF_8).close();
		} catch (Exception e) { // 服务器
			propPathCommon = propPathModeler = PropPathUtil.propServer;
		}

		try {
			InputStreamReader readerCommon = new InputStreamReader(new FileInputStream(propPathCommon), StandardCharsets.UTF_8);
			pCommon.load(readerCommon);
			InputStreamReader reader = new InputStreamReader(new FileInputStream(propPathModeler), StandardCharsets.UTF_8);
			p.load(reader);

			BasicDataSource pool = new BasicDataSource(); // 连接池
			pool.setUsername(pCommon.getProperty("spring.datasource.username"));
			pool.setPassword(pCommon.getProperty("spring.datasource.password"));
			pool.setUrl(pCommon.getProperty("spring.datasource.url"));
			pool.setDriverClassName(p.getProperty("db.jdbc.driverClassName"));
			pool.setMaxWait(Long.parseLong(p.getProperty("db.jdbc.maxWait")));
			pool.setMaxActive(Integer.parseInt(p.getProperty("db.jdbc.maxActive")));
			pool.setMaxIdle(Integer.parseInt(p.getProperty("db.jdbc.maxIdle")));
			pool.setMinIdle(Integer.parseInt(p.getProperty("db.jdbc.minIdle")));
			pool.setLogAbandoned(Boolean.parseBoolean(p.getProperty("db.jdbc.logAbandoned")));
			pool.setInitialSize(Integer.parseInt(p.getProperty("db.jdbc.initialSize")));
			pool.setRemoveAbandoned(Boolean.parseBoolean(p.getProperty("db.jdbc.removeAbandoned")));
			pool.setRemoveAbandonedTimeout(Integer.parseInt(p.getProperty("db.jdbc.removeAbandonedTimeout")));
			pool.setPoolPreparedStatements(Boolean.parseBoolean(p.getProperty("db.jdbc.poolPreparedStatements")));
			pool.setTestOnBorrow(Boolean.parseBoolean(p.getProperty("db.jdbc.testOnBorrow")));
			pool.setValidationQuery(p.getProperty("db.jdbc.validationQuery"));

			return pool;

		} catch (Exception e) { throw new PlatformException("工作流建立数据库连接错误，错误信息：" + e.getMessage()); }
	}


//	public final static MongoTemplate getNoSqlDataSource() {
//		return nosqlds;
//	}

//	private static MongoTemplate initNoSqlDataSource() {
//		ApplicationContext ctx = ApplicationContextFactory.getApplicationContext();
//		return (MongoTemplate) ctx.getBean("mongoTemplate");
//	}
}
