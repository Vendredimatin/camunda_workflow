/**
 * 
 */
package edu.thss.platform.service.wfprocess.runtime.engine;

import edu.thss.platform.service.wfprocess.core.runtime.event.Event;
import edu.thss.platform.service.wfprocess.runtime.cache.LogCache;
import edu.thss.platform.service.wfprocess.runtime.server.SaaSServer;
import org.apache.log4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.Serializable;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

/**
 * @author Dahai Cao created on 2012-06-24, last updated on 2018-03-23
 *
 */
@Service
public class LogEngine implements Runnable, Serializable {

	/**
	 * serialVersionUID
	 */
	private static final long serialVersionUID = -5603900595075829538L;
	protected static Logger logger = Logger.getLogger(LogEngine.class.getName());
	// 0: shutdown; 1: startup
	private int command = 0;
	private String id = "";

	/**
	 * 
	 */
	public LogEngine() {
		ch.qos.logback.classic.LoggerContext loggerContext = (ch.qos.logback.classic.LoggerContext) LoggerFactory
				.getILoggerFactory();
		ch.qos.logback.classic.Logger rootLogger = loggerContext.getLogger(LogEngine.class); // "org.mongodb.driver"
		rootLogger.setLevel(ch.qos.logback.classic.Level.OFF);
	}



	/**
	 * @see Runnable#run()
	 */
	@Override
	public void run() {
		try {
			if (command == 1) {
				while (!Thread.interrupted()) {
					if (SaaSServer.getInstance().getLogcache().count() >= LogCache.BATCH_SAVE_COUNTING) {
						Event[] eventlogs = SaaSServer.getInstance().getLogcache().fetchLogs();
						// 流程实例保存到数据库
						System.out.println("Log engine starts to work.");
//						RuntimeEventBlo.getInstance().saveLogs(eventlogs);
//						System.out.println("Batch saving " + eventlogs.length + " logs.");
						for (Event event : eventlogs) {
							System.out.println(">> event");
							System.out.println(">> "+event);
						}
						//System.out.println("Batch saved " + eventlogs.length + " logs.");
					} else {
						Thread.sleep(2000);
						//System.out.println("There were " + SaaSServer.getInstance().getLogcache().count() + " logs.");
					}
				}
			}

		} catch (Exception e) {
			e.printStackTrace();
		}
	}

	/**
	 * @return the command
	 */
	public int getCommand() {
		return command;
	}

	/**
	 * @param command
	 *            the command to set
	 */
	public void setCommand(int command) {
		this.command = command;
	}

	public String getId() {
		return id;
	}

	public void setId(String id) {
		this.id = id;
	}

}
