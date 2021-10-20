/**
 * 
 */
package edu.thss.platform.service.wfprocess.core.repository;

import org.springframework.jdbc.datasource.DataSourceTransactionManager;

/**
 * @author dcao
 * 
 */
public class TransactionManagerFactory {
	private static DataSourceTransactionManager transactionManager = new DataSourceTransactionManager(
			DBDataSourceFactory.getDataSource());

	public static DataSourceTransactionManager getTansactionManager() {
		return transactionManager;
	}
}
